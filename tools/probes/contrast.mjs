// Verification probe (committed suite, excluded from the Jekyll build; see
// AGENTS.md): full-page contrast audit that also scans content hidden by the
// IntersectionObserver reveal.
// Usage: node contrast.mjs <baseUrl> <lang> <light|dark>
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const [base, lang, scheme] = process.argv.slice(2);
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\contrast`;
mkdirSync(dir, { recursive: true });
const PORT = 9335;

const chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--disable-gpu',
  `--user-data-dir=${dir}\\profile-${scheme}`, 'about:blank',
], { stdio: 'ignore' });

let version;
for (let i = 0; i < 60; i++) { try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result); } };
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const mid = ++id; pending.set(mid, { resolve, reject }); ws.send(JSON.stringify({ id: mid, method, params, sessionId })); });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Network.enable', {}, sessionId);
await send('Network.setCacheDisabled', { cacheDisabled: true }, sessionId);
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] }, sessionId);
await send('Page.navigate', { url: `${base}/${lang}/` }, sessionId);
await sleep(2800);

const auditScript = `
(() => {
  // Force every observer-gated element to its revealed state so nothing is skipped.
  const style = document.createElement('style');
  style.textContent = \`
    .certification-card, .project-card, .timeline-item {
      opacity: 1 !important; transform: none !important; animation: none !important;
    }
    #preloader { display: none !important; }
    .hero-particles-canvas { display: none !important; }
  \`;
  document.head.appendChild(style);

  const parseAlpha = (c) => {
    if (!c) return 0;
    if (c === 'transparent') return 0;
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return 0;
    const parts = m[1].split(',').map(s => parseFloat(s.trim()));
    return parts.length > 3 ? parts[3] : 1;
  };
  const parseRGB = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(',').map(s => parseFloat(s.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); const hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); };
  const composite = (fg, bg) => ({
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1
  });
  const gradientStops = (bgImage) => {
    if (!bgImage || bgImage === 'none' || !bgImage.includes('gradient')) return null;
    const out = [];
    const re = /rgba?\\([^)]+\\)/g;
    let m;
    while ((m = re.exec(bgImage)) !== null) {
      const c = parseRGB(m[0]);
      if (c && c.a > 0.2) out.push(c);
    }
    return out.length ? out : null;
  };

  // Effective background(s) for an element, walking up the tree.
  const backgrounds = (el) => {
    // The language slider only paints behind the active link.
    const langSwitch = el.closest('.lang-switch');
    if (langSwitch && el.classList.contains('active')) {
      const slider = langSwitch.querySelector('.lang-slider');
      if (slider) {
        const s = parseRGB(getComputedStyle(slider).backgroundColor);
        if (s && s.a > 0.2) return [s];
      }
    }
    let node = el;
    let acc = null; // composited solid background so far (bottom-most first)
    const stacks = [];
    while (node && node !== document.documentElement.parentNode) {
      const cs = getComputedStyle(node);
      const stops = gradientStops(cs.backgroundImage);
      if (stops) {
        // gradient sits on top of whatever we found below it
        const base = acc || { r: 255, g: 255, b: 255, a: 1 };
        stacks.push(stops.map(s => s));
        return stacks.flat().concat(base.a === 1 ? [] : []);
      }
      const bc = parseRGB(cs.backgroundColor);
      if (bc && bc.a > 0) {
        acc = acc ? composite(acc, bc) : bc;
        if (bc.a >= 0.99) return [acc];
      }
      node = node.parentElement;
    }
    return [acc || { r: 255, g: 255, b: 255, a: 1 }];
  };

  const failures = [];
  const skipped = [];
  const seen = new Set();
  for (const el of document.querySelectorAll('body *')) {
    const directText = Array.from(el.childNodes)
      .filter(n => n.nodeType === 3 && n.textContent.trim().length > 1)
      .map(n => n.textContent.trim()).join(' ').trim();
    if (!directText) continue;
    if (el.closest('#preloader') || el.closest('#hero-particles-canvas')) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) { skipped.push(el.className || el.tagName); continue; }
    const fg = parseRGB(cs.color);
    if (!fg) continue;
    if (fg.a < 0.99) { skipped.push('alpha-text:' + (el.className || el.tagName)); continue; }
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) continue;
    const clip = cs.webkitBackgroundClip || cs.backgroundClip;
    const bgs = backgrounds(clip === 'text' && el.parentElement ? el.parentElement : el);
    let fgList = [fg];
    if (clip === 'text') {
      const stops = gradientStops(cs.backgroundImage);
      if (stops) fgList = stops;
    }
    let worst = Infinity;
    for (const f of fgList) for (const bg of bgs) worst = Math.min(worst, ratio(f, bg));
    const px = parseFloat(cs.fontSize);
    const bold = parseInt(cs.fontWeight, 10) >= 700;
    const large = px >= 24 || (bold && px >= 18.66);
    const min = large ? 3 : 4.5;
    if (worst + 0.01 < min) {
      const key = (el.className || el.tagName) + '|' + cs.color;
      if (!seen.has(key)) {
        seen.add(key);
        failures.push({
          el: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\\s+/).join('.') : ''),
          text: directText.slice(0, 40),
          color: cs.color,
          bg: bgs.map(b => 'rgb(' + Math.round(b.r) + ',' + Math.round(b.g) + ',' + Math.round(b.b) + ')').join(' / '),
          ratio: Math.round(worst * 100) / 100,
          required: min,
          fontSize: cs.fontSize
        });
      }
    }
  }
  return JSON.stringify({ scheme: document.documentElement.getAttribute('data-color-scheme'), scanned: document.querySelectorAll('body *').length, failures, skippedCount: skipped.length, skipped: skipped.slice(0, 8) }, null, 1);
})()
`;

const res = await send('Runtime.evaluate', { expression: auditScript, returnByValue: true, awaitPromise: true }, sessionId);
console.log(res.result.value ?? JSON.stringify(res));
ws.close(); chrome.kill();

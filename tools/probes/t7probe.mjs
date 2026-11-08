// T7 probe: certifications grid/cards + experience hierarchy.
// 16 runs = 1440/1024/768/375 x EN/IT x light/dark, plus no-JS, no-IO and
// reduced-motion passes.
// Usage: node t7probe.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t7`;
mkdirSync(dir, { recursive: true });
rmSync(`${dir}\\profile`, { recursive: true, force: true });
const PORT = 9362;

const chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--disable-gpu',
  `--user-data-dir=${dir}\\profile`, 'about:blank',
], { stdio: 'ignore' });

let version;
for (let i = 0; i < 80; i++) {
  try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch { await sleep(250); }
}
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id); pending.delete(m.id);
    m.error ? p.reject(new Error(`${p.method}: ${JSON.stringify(m.error)}`)) : p.resolve(m.result);
  }
};
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const mid = ++id; pending.set(mid, { resolve, reject, method });
  ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
});

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
await send('Log.enable', {}, sessionId);
const errors = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') errors.push(m.params.entry.text);
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
});

const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return JSON.parse(r.result.value);
};

const STATE = `(function () {
  function box(el) { if (!el) return null; var r = el.getBoundingClientRect(); var cs = getComputedStyle(el);
    return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top + scrollY), b: Math.round(r.bottom + scrollY),
      w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, radius: cs.borderRadius,
      fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, pad: cs.padding, border: cs.borderTopColor, shadow: cs.boxShadow !== 'none' }; }
  var cards = Array.prototype.map.call(document.querySelectorAll('.certification-card'), function (c) {
    var cs = getComputedStyle(c);
    return { box: box(c), pending: c.classList.contains('is-pending'), opacity: cs.opacity, translate: cs.translate,
      inline: c.getAttribute('style'),
      icon: box(c.querySelector('.cert-icon')), badge: box(c.querySelector('.cert-badge')),
      code: box(c.querySelector('.cert-code')), h3: box(c.querySelector('h3')) };
  });
  var exp = document.querySelector('.experience-item');
  var li = document.querySelector('.experience-achievements li');
  var liBefore = getComputedStyle(li, '::before');
  return JSON.stringify({
    width: innerWidth,
    cards: cards,
    gridCols: getComputedStyle(document.querySelector('.certifications-grid')).gridTemplateColumns,
    experience: {
      item: box(exp),
      company: box(document.querySelector('.experience-company h3')),
      period: box(document.querySelector('.experience-period')),
      role: box(document.querySelector('.experience-role')),
      location: box(document.querySelector('.experience-location')),
      headerBorder: getComputedStyle(document.querySelector('.experience-header')).borderBottomWidth,
      li: box(li),
      liBefore: { content: liBefore.content, bg: liBefore.backgroundColor, w: liBefore.width, h: liBefore.height },
      liPad: getComputedStyle(li).paddingLeft
    },
    heroTargets: Array.prototype.map.call(document.querySelectorAll('.hero-stats .stat-number'), function (n) { return n.getAttribute('data-target'); }),
    heroCertText: document.querySelectorAll('.hero-stats .stat-number').length === 3 ? null : 'missing',
    docW: document.documentElement.scrollWidth,
    innerW: innerWidth
  });
})()`;

const out = [];
for (const lang of ['en', 'it']) {
  for (const scheme of ['light', 'dark']) {
    for (const width of [1440, 1024, 768, 375]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] }, sessionId);
      await send('Page.navigate', { url: `${base}/${lang}/` }, sessionId);
      await sleep(3200);
      const before = await ev(STATE);
      await ev(`(function(){ var s=document.getElementById('certifications'); window.scrollTo(0, s.offsetTop - 100); return 1; })()`);
      await sleep(150);
      const mid = await ev(STATE);
      await sleep(900);
      const after = await ev(STATE);
      // At 375 the cards stack, so the last one needs its own scroll.
      await ev(`(function(){ var c=document.querySelectorAll('.certification-card'); c[c.length-1].scrollIntoView({block:'center'}); return 1; })()`);
      await sleep(900);
      const after2 = await ev(STATE);
      out.push({ lang, scheme, width, before, mid, after: after2 });
    }
  }
}

// No-JS: the cards must be visible without the pending class.
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
await send('Emulation.setScriptExecutionDisabled', { value: true }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(1500);
await ev(`(function(){ var s=document.getElementById('certifications'); window.scrollTo(0, s.offsetTop - 100); return 1; })()`);
await sleep(400);
const nojs = await ev(STATE);
await send('Emulation.setScriptExecutionDisabled', { value: false }, sessionId);

// Reduced motion: still revealed, no transition.
await send('Emulation.setEmulatedMedia', { features: [
  { name: 'prefers-color-scheme', value: 'light' },
  { name: 'prefers-reduced-motion', value: 'reduce' },
] }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(3200);
const rmBefore = await ev(STATE);
await ev(`(function(){ var s=document.getElementById('certifications'); window.scrollTo(0, s.offsetTop - 100); return 1; })()`);
await sleep(150);
const rmAfter = await ev(STATE);
const rmTransition = await ev(`(function(){ return JSON.stringify(getComputedStyle(document.querySelector('.certification-card')).transitionDuration); })()`);

out.push({ nojs: nojs.cards.map(c => ({ pending: c.pending, opacity: c.opacity })) });
out.push({ reducedMotion: { before: rmBefore.cards.map(c => ({ pending: c.pending, opacity: c.opacity })), after: rmAfter.cards.map(c => ({ pending: c.pending, opacity: c.opacity })), transition: rmTransition } });

ws.close(); chrome.kill();
console.log(JSON.stringify({ runs: out, errors }, null, 1));

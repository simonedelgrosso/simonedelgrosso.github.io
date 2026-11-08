// Verification probe (committed suite, excluded from the Jekyll build; see
// AGENTS.md): strict overflow audit.
// Uses mobile:false so Chrome does NOT auto-shrink the layout viewport, which would
// hide real overflow (innerWidth silently grows to fit the widest content).
// Usage: node overflow.mjs <baseUrl> <widths> <langs> <light|dark>
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const [base, widthsArg, langsArg, scheme] = process.argv.slice(2);
const widths = widthsArg.split(',').map(Number);
const langs = langsArg.split(',');
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\overflow`;
mkdirSync(dir, { recursive: true });
const PORT = 9340;

const chrome = spawn(process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars',
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
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme || 'light' }] }, sessionId);

const out = [];
for (const lang of langs) {
  for (const width of widths) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
    await send('Page.navigate', { url: `${base}/${lang}/` }, sessionId);
    await sleep(2200);
    const r = await send('Runtime.evaluate', {
      expression: `(function () {
        var p = document.getElementById('preloader'); if (p) p.remove();
        var docW = document.documentElement.scrollWidth;
        var offenders = [];
        var widest = null;
        document.querySelectorAll('body *').forEach(function (el) {
          var rect = el.getBoundingClientRect();
          if (rect.width === 0) return;
          var cs = getComputedStyle(el);
          if (cs.position === 'fixed') return; // fixed boxes do not create document overflow
          if (rect.right > innerWidth + 0.5 || rect.left < -0.5) {
            offenders.push({
              el: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\\s+/).join('.') : ''),
              left: Math.round(rect.left), right: Math.round(rect.right)
            });
          }
          if (!widest || rect.right > widest.right) {
            widest = { el: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).trim().split(/\\s+/).join('.') : ''), right: Math.round(rect.right) };
          }
        });
        var nav = document.querySelector('.nav-container');
        var navRects = nav ? {
          container: (function (x) { return { left: Math.round(x.left), right: Math.round(x.right), w: Math.round(x.width), pad: getComputedStyle(nav).padding }; })(nav.getBoundingClientRect()),
          logo: (function (x) { return { left: Math.round(x.left), right: Math.round(x.right), w: Math.round(x.width) }; })(document.querySelector('.nav-logo').getBoundingClientRect()),
          controls: (function (x) { return { left: Math.round(x.left), right: Math.round(x.right), w: Math.round(x.width) }; })(document.querySelector('.nav-controls').getBoundingClientRect())
        } : null;
        return JSON.stringify({
          innerW: innerWidth,
          bodyW: document.body.scrollWidth,
          docW: docW,
          overflow: docW > innerWidth,
          widest: widest,
          nav: navRects,
          offenders: offenders.slice(0, 6)
        });
      })()`,
      returnByValue: true,
    }, sessionId);
    // A page-side exception would otherwise surface as an opaque JSON.parse error.
    if (r.exceptionDetails) {
      throw new Error(`${lang} ${width}: ${r.exceptionDetails.text || JSON.stringify(r.exceptionDetails)}`);
    }
    out.push({ lang, width, ...JSON.parse(r.result.value) });
  }
}

ws.close(); chrome.kill();
console.log(JSON.stringify(out, null, 1));

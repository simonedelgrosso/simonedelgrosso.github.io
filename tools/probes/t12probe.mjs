// T12 probe: responsive width sweep + nav metrics across the 769-1100 dead zone.
// Usage: node t12probe.mjs <baseUrl> [mode]
//   mode=widths (default): many widths, both languages, light theme
//   mode=accept: 320/375/768/1024/1440 x EN/IT x light/dark
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const mode = process.argv[3] || 'widths';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t12`;
mkdirSync(dir, { recursive: true });
rmSync(`${dir}\\profile`, { recursive: true, force: true });
const PORT = 9410;

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

const STATE = `(function(){
  var de = document.documentElement;
  var nav = document.querySelector('.nav-container');
  var logo = document.querySelector('.nav-logo');
  var menu = document.getElementById('nav-menu');
  var controls = document.querySelector('.nav-controls');
  var burger = document.getElementById('hamburger');
  function r(el){ return el ? el.getBoundingClientRect() : null; }
  var nr = r(nav), cr = r(controls), mr = r(menu), br = r(burger);
  return JSON.stringify({
    clientW: de.clientWidth, innerW: innerWidth, docW: de.scrollWidth,
    navScrollW: nav ? nav.scrollWidth : null, navClientW: nav ? nav.clientWidth : null,
    navRight: nr ? Math.round(nr.right) : null,
    logoW: logo ? Math.round(r(logo).width) : null,
    logoScrollW: logo ? logo.scrollWidth : null,
    logoTruncated: logo ? logo.scrollWidth > Math.round(r(logo).width) + 1 : null,
    menuDisplay: menu ? getComputedStyle(menu).display : null,
    menuW: mr ? Math.round(mr.width) : null,
    menuGap: menu ? getComputedStyle(menu).gap : null,
    linkFs: document.querySelector('.nav-link') ? getComputedStyle(document.querySelector('.nav-link')).fontSize : null,
    controlsL: cr ? Math.round(cr.left) : null,
    controlsR: cr ? Math.round(cr.right) : null,
    controlsOffscreen: cr ? Math.round(cr.right) > de.clientWidth : null,
    burgerVisible: br ? getComputedStyle(burger).display !== 'none' : null,
    // widest element on the page
    widest: (function(){
      var worst = null, max = de.clientWidth;
      document.querySelectorAll('body *').forEach(function(el){
        var b = el.getBoundingClientRect();
        if (getComputedStyle(el).position === 'fixed') return;
        if (b.width === 0 && b.height === 0) return;
        if (b.right > max + 1) { max = b.right; worst = el; }
      });
      return worst ? { tag: worst.tagName.toLowerCase(), cls: (worst.className || '').toString().slice(0, 60), right: Math.round(max) } : null;
    })()
  });
})()`;

const out = [];
if (mode === 'widths') {
  for (const lang of ['en', 'it']) {
    for (const width of [320, 360, 375, 414, 480, 600, 640, 768, 769, 800, 850, 900, 950, 1000, 1024, 1050, 1100, 1150, 1200, 1280, 1440, 1920]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
      await send('Page.navigate', { url: `${base}/${lang}/` }, sessionId);
      await sleep(2200);
      out.push({ lang, width, state: await ev(STATE) });
    }
  }
} else {
  for (const lang of ['en', 'it']) {
    for (const scheme of ['light', 'dark']) {
      for (const width of [320, 375, 768, 1024, 1440]) {
        await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
        await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] }, sessionId);
        await send('Page.navigate', { url: `${base}/${lang}/` }, sessionId);
        await sleep(2200);
        out.push({ lang, scheme, width, state: await ev(STATE) });
      }
    }
  }
}

ws.close(); chrome.kill();
console.log(JSON.stringify({ runs: out, errors }, null, 1));

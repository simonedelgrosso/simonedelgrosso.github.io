// T12 follow-up: measure the exact band boundaries the first sweep skipped.
// Usage: node t12edges.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t12edges`;
mkdirSync(dir, { recursive: true });
const PORT = 9414;

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
    m.error ? p.reject(new Error(JSON.stringify(m.error))) : p.resolve(m.result);
  }
};
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const mid = ++id; pending.set(mid, { resolve, reject });
  ws.send(JSON.stringify({ id: mid, method, params, sessionId }));
});
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, sessionId);
await send('Runtime.enable', {}, sessionId);
const ev = async (e) => {
  const r = await send('Runtime.evaluate', { expression: e, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return JSON.parse(r.result.value);
};

let fail = 0;
for (const lang of ['en', 'it']) {
  for (const width of [1023, 1024, 1025, 1198, 1199, 1200, 1201]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
    await send('Page.navigate', { url: `${base}/${lang}/` }, sessionId);
    await sleep(2200);
    const s = await ev(`(function(){
      var de = document.documentElement;
      var logo = document.querySelector('.nav-logo');
      var menu = document.getElementById('nav-menu');
      var burger = document.getElementById('hamburger');
      var controls = document.querySelector('.nav-controls');
      var lw = Math.round(logo.getBoundingClientRect().width);
      return JSON.stringify({
        clientW: de.clientWidth, docW: de.scrollWidth,
        logoW: lw, logoScrollW: logo.scrollWidth, trunc: logo.scrollWidth > lw + 1,
        burger: getComputedStyle(burger).display,
        gap: getComputedStyle(menu).gap, fs: getComputedStyle(document.querySelector('.nav-link')).fontSize,
        controlsR: Math.round(controls.getBoundingClientRect().right)
      });
    })()`);
    const problems = [];
    if (s.docW > s.clientW) problems.push('docoverflow');
    if (s.trunc) problems.push('logo-trunc');
    if (s.controlsR > s.clientW) problems.push('controls-offscreen');
    if (problems.length) fail++;
    console.log(`${lang} ${String(width).padStart(4)} docW=${s.docW}/${s.clientW} logo=${s.logoW}/${s.logoScrollW} ` +
      `nav=${s.burger === 'none' ? 'inline' : 'drawer'} gap=${s.gap} fs=${s.fs}` + (problems.length ? `  <-- ${problems.join(',')}` : ''));
  }
}
console.log('failures', fail);
ws.close(); chrome.kill();

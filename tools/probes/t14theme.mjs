// Verification probe (committed suite, excluded from the Jekyll build; see
// AGENTS.md): the `theme-color` meta must follow the --color-background token in
// both schemes, on load (stored theme) and after toggling the switch. This is
// what keeps the browser UI colour from drifting away from the page colour.
// Usage: node t14theme.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t14theme`;
mkdirSync(dir, { recursive: true });
const PORT = 9420;

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

const STATE = `(function(){
  var meta = document.getElementById('theme-color');
  var token = getComputedStyle(document.documentElement).getPropertyValue('--color-background').trim();
  return JSON.stringify({
    scheme: document.documentElement.getAttribute('data-color-scheme'),
    stored: (function(){ try { return localStorage.getItem('theme'); } catch (e) { return 'blocked'; } })(),
    meta: meta ? meta.getAttribute('content') : null,
    token: token,
    match: meta ? meta.getAttribute('content') === token : false,
    pressed: (function(){ var t = document.getElementById('theme-toggle'); return t ? t.getAttribute('aria-pressed') : null; })()
  });
})()`;

let fail = 0;
for (const stored of ['light', 'dark']) {
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Page.navigate', { url: `${base}/en/` }, sessionId);
  await sleep(2600);
  await ev(`(function(){ localStorage.setItem('theme', ${JSON.stringify(stored)}); return JSON.stringify('ok'); })()`);
  await send('Page.navigate', { url: `${base}/en/` }, sessionId);
  await sleep(2600);
  const loaded = await ev(STATE);

  // Toggle by clicking the real button.
  const pt = await ev(`(function(){ var b = document.getElementById('theme-toggle'); var r = b.getBoundingClientRect();
    return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) }); })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await sleep(500);
  const toggled = await ev(STATE);

  for (const [label, s] of [['load', loaded], ['toggle', toggled]]) {
    const problems = [];
    if (s.scheme !== stored && label === 'load') problems.push('scheme ' + s.scheme);
    if (!s.match) problems.push(`meta ${s.meta} != token ${s.token}`);
    if (s.pressed !== (s.scheme === 'dark' ? 'true' : 'false')) problems.push('aria-pressed ' + s.pressed);
    if (label === 'toggle' && s.scheme === stored) problems.push('toggle did not flip');
    if (problems.length) fail++;
    console.log(`stored=${stored} ${label}: scheme=${s.scheme} meta=${s.meta} token=${s.token} pressed=${s.pressed}` + (problems.length ? `  <-- ${problems.join(',')}` : ''));
  }
}
console.log('failures', fail);
ws.close(); chrome.kill();

// T11 probe: scroll-to-top, progress bar, and the JS effects under normal vs
// reduced motion. The preloader and the particle canvas were both removed in
// §14, so this asserts their absence rather than their lifecycle.
// For each mode: no preloader, no canvas, typing content, counters,
// smooth-scroll behaviour, button visibility class, progress bar, footer
// clearance at 375/320.
// Usage: node t11probe.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t11`;
mkdirSync(dir, { recursive: true });
rmSync(`${dir}\\profile`, { recursive: true, force: true });
const PORT = 9400;

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

const out = [];

for (const reduced of [false, true]) {
  const features = [{ name: 'prefers-color-scheme', value: 'light' }];
  if (reduced) features.push({ name: 'prefers-reduced-motion', value: 'reduce' });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Emulation.setEmulatedMedia', { features }, sessionId);

  // The preloader was removed in §14 (row 12): nothing may create one, at any
  // point. Sample during the load (a regression would inject it at
  // DOMContentLoaded, i.e. within the first samples) and again after load.
  const navPromise = send('Page.navigate', { url: `${base}/en/` }, sessionId);

  let midPreloader = null;
  for (let i = 0; i < 20; i++) {
    await sleep(100);
    try {
      midPreloader = await ev(`(function(){
        var p = document.getElementById('preloader');
        return JSON.stringify({ present: !!p, spinner: !!(p && p.querySelector('.preloader__spinner')) });
      })()`);
      if (midPreloader.present) break;
    } catch { /* navigation in flight */ }
  }
  await navPromise;

  const afterLoad = await ev(`(function(){
    var b = document.querySelector('.scroll-to-top');
    var canvas = document.getElementById('hero-particles-canvas');
    var typing = document.getElementById('typing-text');
    var progress = document.getElementById('scroll-progress');
    return JSON.stringify({
      buttonExists: !!b,
      buttonClass: b ? b.className : null,
      buttonInline: b ? b.getAttribute('style') : null,
      buttonVisibility: b ? getComputedStyle(b).visibility : null,
      buttonOpacity: b ? getComputedStyle(b).opacity : null,
      buttonSize: b ? Math.round(b.getBoundingClientRect().width) : null,
      canvas: !!canvas,
      preloader: !!document.getElementById('preloader'),
      typing: typing ? typing.textContent : null,
      typingCursor: document.querySelector('.cursor') ? document.querySelector('.cursor').className : null,
      cursorAnim: document.querySelector('.cursor') ? getComputedStyle(document.querySelector('.cursor')).animationName : null,
      progressW: progress ? getComputedStyle(progress).width : null,
      counters: Array.prototype.map.call(document.querySelectorAll('.hero-stats .stat-number'), function (n) { return n.textContent; }),
      statTargets: Array.prototype.map.call(document.querySelectorAll('.hero-stats .stat-number'), function (n) { return n.getAttribute('data-target'); })
    });
  })()`);

  // Scroll down: button must appear (class) and counters must settle.
  await ev(`(function(){ window.scrollTo(0, 1400); return 1; })()`);
  await sleep(900);
  const scrolled = await ev(`(function(){
    var b = document.querySelector('.scroll-to-top');
    return JSON.stringify({
      scrollY: Math.round(scrollY),
      buttonClass: b.className,
      visible: getComputedStyle(b).visibility,
      opacity: getComputedStyle(b).opacity,
      progressW: getComputedStyle(document.getElementById('scroll-progress')).width,
      counters: Array.prototype.map.call(document.querySelectorAll('.hero-stats .stat-number'), function (n) { return n.textContent; })
    });
  })()`);

  // Smooth-scroll probe: click the button and sample immediately — with
  // behavior:'smooth' the position has barely moved; with 'auto' it is at 0.
  await ev(`(function(){ document.querySelector('.scroll-to-top').click(); return 1; })()`);
  await sleep(60);
  const justAfterClick = await ev(`JSON.stringify({ scrollY: Math.round(scrollY) })`);
  await sleep(1200);
  const settled = await ev(`JSON.stringify({ scrollY: Math.round(scrollY), buttonClass: document.querySelector('.scroll-to-top').className })`);

  out.push({ reduced, preloader: midPreloader, afterLoad, scrolled, justAfterClick, settled });
}

// Footer clearance at 375 and 320 (reduced off, classic scrollbar).
const clearance = [];
for (const width of [375, 320]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
  await send('Page.navigate', { url: `${base}/en/` }, sessionId);
  await sleep(2600);
  await ev(`(function(){ window.scrollTo(0, document.body.scrollHeight); return 1; })()`);
  await sleep(700);
  clearance.push(await ev(`(function(){
    var btn = document.querySelector('.scroll-to-top').getBoundingClientRect();
    var icons = document.querySelector('.social-links').getBoundingClientRect();
    var overlapX = !(icons.right <= btn.left || icons.left >= btn.right);
    var overlapY = !(icons.bottom <= btn.top || icons.top >= btn.bottom);
    return JSON.stringify({ width: innerWidth, clientW: document.documentElement.clientWidth,
      btn: { l: Math.round(btn.left), t: Math.round(btn.top), r: Math.round(btn.right), b: Math.round(btn.bottom) },
      icons: { l: Math.round(icons.left), t: Math.round(icons.top), r: Math.round(icons.right), b: Math.round(icons.bottom) },
      overlap: overlapX && overlapY,
      gapAboveFooterBottom: Math.round(document.documentElement.clientHeight - btn.top),
      docW: document.documentElement.scrollWidth });
  })()`));
}

ws.close(); chrome.kill();
console.log(JSON.stringify({ runs: out, clearance, errors }, null, 1));

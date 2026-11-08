// T6 probe: About chips + timeline (reveal on scroll, no-JS visibility, mobile
// single column, ringed dots, raised cards, grade line presence).
// Usage: node t6probe.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t6`;
const PORT = 9354;
mkdirSync(dir, { recursive: true });
rmSync(`${dir}\\profile`, { recursive: true, force: true });

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
  var items = Array.prototype.map.call(document.querySelectorAll('.timeline-item'), function (el) {
    var cs = getComputedStyle(el);
    var r = el.getBoundingClientRect();
    var card = el.querySelector('.timeline-content');
    var cr = card.getBoundingClientRect();
    var ccs = getComputedStyle(card);
    var dot = getComputedStyle(el, '::before');
    var pill = el.querySelector('.timeline-period');
    return {
      pending: el.classList.contains('is-pending'),
      opacity: cs.opacity,
      transform: cs.transform,
      transition: cs.transitionProperty + ' ' + cs.transitionDuration,
      itemTop: Math.round(r.top + scrollY),
      cardLeft: Math.round(cr.left),
      cardRight: Math.round(cr.right),
      cardTextAlign: ccs.textAlign,
      cardBg: ccs.backgroundColor,
      cardShadow: ccs.boxShadow !== 'none',
      cardRadius: ccs.borderRadius,
      dot: { top: dot.top, width: dot.width, height: dot.height, shadow: dot.boxShadow, bg: dot.backgroundColor },
      pill: pill ? { bg: getComputedStyle(pill).backgroundColor, color: getComputedStyle(pill).color } : null,
      grade: el.querySelectorAll('.timeline-grade').length
    };
  });
  var chips = Array.prototype.map.call(document.querySelectorAll('.highlight-item'), function (el) {
    var cs = getComputedStyle(el);
    var r = el.getBoundingClientRect();
    var icon = el.querySelector('i');
    var ir = icon.getBoundingClientRect();
    var ics = getComputedStyle(icon);
    return {
      text: el.textContent.trim(),
      h: Math.round(r.height),
      w: Math.round(r.width),
      bg: cs.backgroundColor,
      radius: cs.borderRadius,
      border: cs.borderTopColor,
      icon: { w: Math.round(ir.width), h: Math.round(ir.height), radius: ics.borderRadius, bg: ics.backgroundColor, color: ics.color }
    };
  });
  var spine = getComputedStyle(document.querySelector('.timeline'), '::before');
  return JSON.stringify({
    scrollY: Math.round(scrollY),
    items: items,
    chips: chips,
    gradeCount: document.querySelectorAll('.timeline-grade').length,
    spine: { left: spine.left, width: spine.width, background: spine.backgroundImage.slice(0, 90) },
    docW: document.documentElement.scrollWidth,
    innerW: innerWidth
  });
})()`;

const out = [];
for (const lang of ['en', 'it']) {
  for (const scheme of ['light', 'dark']) {
    for (const width of [1440, 768, 375, 320]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] }, sessionId);
      await send('Page.navigate', { url: `${base}/${lang}/` }, sessionId);
      await sleep(3200);
      const before = await ev(STATE);
      // Scroll the education section into view.
      await ev(`(function(){ var s=document.getElementById('education'); window.scrollTo(0, s.offsetTop - 120); return 1; })()`);
      await sleep(150);
      const mid = await ev(STATE);
      await sleep(900);
      const after = await ev(STATE);
      out.push({ lang, scheme, width, before, mid, after });
    }
  }
}

// No-JS: the timeline must still be visible (the pending class is added by JS).
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
await send('Emulation.setScriptExecutionDisabled', { value: true }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(1500);
await ev(`(function(){ var s=document.getElementById('education'); window.scrollTo(0, s.offsetTop - 120); return 1; })()`);
await sleep(400);
const nojs = await ev(STATE);
await send('Emulation.setScriptExecutionDisabled', { value: false }, sessionId);

// Reduced motion: the reveal must not animate, but must still happen.
await send('Emulation.setEmulatedMedia', { features: [
  { name: 'prefers-color-scheme', value: 'light' },
  { name: 'prefers-reduced-motion', value: 'reduce' },
] }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(3200);
const rmBefore = await ev(STATE);
await ev(`(function(){ var s=document.getElementById('education'); window.scrollTo(0, s.offsetTop - 120); return 1; })()`);
await sleep(150);
const rmAfter = await ev(STATE);

out.push({ nojs: { items: nojs.items.map(i => ({ pending: i.pending, opacity: i.opacity })), chips: nojs.chips.length } });
out.push({ reducedMotion: { before: rmBefore.items.map(i => ({ pending: i.pending, opacity: i.opacity, transition: i.transition })), after: rmAfter.items.map(i => ({ pending: i.pending, opacity: i.opacity })) } });

ws.close(); chrome.kill();
console.log(JSON.stringify({ runs: out, errors }, null, 1));

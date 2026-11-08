// T8 probe: skills as tags.
// 16 runs = 1440/1024/768/375 x EN/IT x light/dark, plus 320px classic-scrollbar
// width check, hover, no-JS and reduced-motion passes.
// Usage: node t8probe.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t8`;
mkdirSync(dir, { recursive: true });
rmSync(`${dir}\\profile`, { recursive: true, force: true });
const PORT = 9370;

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
  function box(el) { var r = el.getBoundingClientRect(); var cs = getComputedStyle(el);
    return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top + scrollY), b: Math.round(r.bottom + scrollY),
      w: Math.round(r.width), h: Math.round(r.height), bg: cs.backgroundColor, color: cs.color,
      radius: cs.borderRadius, border: cs.borderTopColor, fs: cs.fontSize, fw: cs.fontWeight, pad: cs.padding }; }
  var cats = Array.prototype.map.call(document.querySelectorAll('.skill-category'), function (c) {
    var h3 = c.querySelector('h3');
    var ul = c.querySelector('ul.skill-tags');
    var tags = Array.prototype.map.call(c.querySelectorAll('.skill-tag'), function (t) {
      return { text: t.textContent.trim(), box: box(t) };
    });
    return { title: h3 ? h3.textContent.trim() : null, hasUl: !!ul,
      role: ul ? ul.getAttribute('role') : null, listStyle: ul ? getComputedStyle(ul).listStyleType : null,
      tags: tags, cat: box(c), h3Box: h3 ? box(h3) : null,
      // rows = distinct tag top offsets, to show the wrap behaviour
      rows: [...new Set(tags.map(function (t) { return t.box.t; }))].length };
  });
  var any = cats[0] ? cats[0].tags[0] : null;
  return JSON.stringify({
    width: innerWidth, clientW: document.documentElement.clientWidth,
    docW: document.documentElement.scrollWidth,
    gridCols: getComputedStyle(document.querySelector('.skills-grid')).gridTemplateColumns,
    cats: cats,
    tagCount: document.querySelectorAll('.skill-tag').length,
    categoryCount: cats.length,
    first: any,
    // brace check: any leftover bar markup?
    bars: document.querySelectorAll('.skill-bar, .skill-progress, .skill-item, .skill-name').length,
    sectionBg: getComputedStyle(document.getElementById('skills')).backgroundColor
  });
})()`;

const out = [];
for (const lang of ['en', 'it']) {
  for (const scheme of ['light', 'dark']) {
    for (const width of [1440, 1024, 768, 375]) {
      await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] }, sessionId);
      await send('Page.navigate', { url: `${base}/${lang}/` }, sessionId);
      await sleep(2800);
      await ev(`(function(){ document.getElementById('skills').scrollIntoView(); return 1; })()`);
      await sleep(400);
      out.push({ lang, scheme, width, state: await ev(STATE) });
    }
  }
}

// 320px is the tightest case; the classic scrollbar makes clientWidth 305.
await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(2800);
const narrow = await ev(STATE);
out.push({ narrow });

// Hover: border colour must change, geometry must not.
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(2800);
await ev(`(function(){ document.getElementById('skills').scrollIntoView(); return 1; })()`);
await sleep(400);
const hoverBefore = await ev(STATE);
const pt = await ev(`(function(){
  var t = document.querySelector('.skill-tag'); var r = t.getBoundingClientRect();
  return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) });
})()`);
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: pt.x, y: pt.y, buttons: 0 }, sessionId);
await sleep(400);
const hoverAfter = await ev(STATE);
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2, buttons: 0 }, sessionId);
await sleep(300);
out.push({ hover: { before: hoverBefore.first, after: hoverAfter.first } });

// No-JS: tags are static markup, so they must be present and unanimated.
await send('Emulation.setScriptExecutionDisabled', { value: true }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(1500);
await ev(`(function(){ document.getElementById('skills').scrollIntoView(); return 1; })()`);
await sleep(300);
const nojs = await ev(STATE);
await send('Emulation.setScriptExecutionDisabled', { value: false }, sessionId);
out.push({ nojs: { tagCount: nojs.tagCount, categories: nojs.categoryCount } });

// Reduced motion: only a border/colour transition exists; it must be off.
await send('Emulation.setEmulatedMedia', { features: [
  { name: 'prefers-color-scheme', value: 'light' },
  { name: 'prefers-reduced-motion', value: 'reduce' },
] }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(2800);
const rm = await ev(STATE);
const rmTransition = await ev(`JSON.stringify(getComputedStyle(document.querySelector('.skill-tag')).transitionDuration)`);
out.push({ reducedMotion: { tags: rm.tagCount, transition: rmTransition } });

ws.close(); chrome.kill();
console.log(JSON.stringify({ runs: out, errors }, null, 1));

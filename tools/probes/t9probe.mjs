// T9 probe: project cards + filter pills.
// - 16 layout runs (1440/1024/768/375 x EN/IT x light/dark)
// - real-click filter round-trip (Mobile -> Web -> All) with aria-pressed
// - real Enter on a focused filter
// - real mouse hover (lift, no scale, overlay opacity)
// - real Tab walk to the GitHub overlay link (visibility + focus ring)
// - 320px classic-scrollbar width, no-JS and reduced-motion passes
// Usage: node t9probe.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t9`;
mkdirSync(dir, { recursive: true });
rmSync(`${dir}\\profile`, { recursive: true, force: true });
const PORT = 9381;

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
    return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height),
      bg: cs.backgroundColor, radius: cs.borderRadius, shadow: cs.boxShadow, border: cs.borderTopColor,
      fs: cs.fontSize, fw: cs.fontWeight, display: cs.display, opacity: cs.opacity, transform: cs.transform }; }
  function pill(el) { var cs = getComputedStyle(el); var r = el.getBoundingClientRect();
    return { text: el.textContent.trim(), pressed: el.getAttribute('aria-pressed'), active: el.classList.contains('active'),
      h: Math.round(r.height), bg: cs.backgroundColor, color: cs.color, radius: cs.borderRadius, fs: cs.fontSize }; }
  var cards = Array.prototype.map.call(document.querySelectorAll('.project-card'), function (c) {
    var cs = getComputedStyle(c);
    var link = c.querySelector('.project-link');
    var a = link ? getComputedStyle(link) : null;
    return { box: box(c), display: cs.display, pending: c.classList.contains('is-pending'), opacity: cs.opacity,
      translate: cs.translate, transform: cs.transform, shadow: cs.boxShadow !== 'none',
      image: box(c.querySelector('.project-image')),
      imageBg: getComputedStyle(c.querySelector('.project-image')).backgroundImage.slice(0, 140),
      mark: box(c.querySelector('.project-placeholder')),
      overlay: box(c.querySelector('.project-overlay')),
      overlayBg: c.querySelector('.project-overlay') ? getComputedStyle(c.querySelector('.project-overlay')).backgroundColor : null,
      link: link ? { label: link.getAttribute('aria-label'), rel: link.getAttribute('rel'),
        target: link.getAttribute('target'), href: link.getAttribute('href'),
        w: Math.round(link.getBoundingClientRect().width), h: Math.round(link.getBoundingClientRect().height),
        outline: a.outlineColor + ' ' + a.outlineStyle + ' ' + a.outlineWidth,
        focusVisible: link.matches(':focus-visible') } : null,
      category: box(c.querySelector('.project-category')),
      title: box(c.querySelector('.project-title')),
      desc: box(c.querySelector('.project-description')),
      tech: Array.prototype.map.call(c.querySelectorAll('.tech-tag'), function (t) {
        var ts = getComputedStyle(t); var tr = t.getBoundingClientRect();
        return { text: t.textContent.trim(), h: Math.round(tr.height), radius: ts.borderRadius, fs: ts.fontSize, bg: ts.backgroundColor }; }) };
  });
  var active = document.activeElement;
  return JSON.stringify({
    width: innerWidth, clientW: document.documentElement.clientWidth, docW: document.documentElement.scrollWidth,
    gridCols: getComputedStyle(document.querySelector('.projects-grid')).gridTemplateColumns,
    gridW: Math.round(document.querySelector('.projects-grid').getBoundingClientRect().width),
    gridL: Math.round(document.querySelector('.projects-grid').getBoundingClientRect().left),
    cards: cards, cardCount: cards.length,
    pills: Array.prototype.map.call(document.querySelectorAll('.filter-badge'), pill),
    heroProjectsTarget: (function () { var n = document.querySelectorAll('.hero-stats .stat-number'); return n.length === 3 ? n[1].getAttribute('data-target') : null; })(),
    activeEl: active ? (typeof active.className === 'string' && active.className ? active.className : active.tagName) : null
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
      await ev(`(function(){ document.getElementById('projects').scrollIntoView({ block: 'center' }); return 1; })()`);
      await sleep(900);
      out.push({ lang, scheme, width, state: await ev(STATE) });
    }
  }
}

// ---- filters: real clicks ------------------------------------------------
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(2800);
await ev(`(function(){ document.getElementById('projects').scrollIntoView({ block: 'center' }); return 1; })()`);
await sleep(800);

const clickPill = async (filter) => {
  const pt = await ev(`(function(){
    var b = document.querySelector('.filter-badge[data-filter="${filter}"]');
    var r = b.getBoundingClientRect();
    return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) });
  })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await sleep(450);
  return ev(STATE);
};

const filters = {};
for (const f of ['mobile', 'web', 'all']) {
  const s = await clickPill(f);
  filters[f] = {
    pills: s.pills.map(p => p.text + '=' + p.pressed + (p.active ? '/on' : '')),
    display: s.cards.map(c => c.display),
    visible: s.cards.filter(c => c.display !== 'none').length,
  };
}
// Enter on a focused filter must work the same way.
await ev(`(function(){ document.querySelector('.filter-badge[data-filter="mobile"]').focus(); return 1; })()`);
const focusedBeforeEnter = await ev(`JSON.stringify(document.activeElement && document.activeElement.getAttribute('data-filter'))`);
await send('Input.dispatchKeyEvent', {
  type: 'keyDown', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13,
  key: 'Enter', code: 'Enter', text: '\r', unmodifiedText: '\r',
}, sessionId);
await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, key: 'Enter', code: 'Enter' }, sessionId);
await sleep(450);
const afterEnter = await ev(STATE);
filters.enter = {
  focusedBeforeEnter,
  pills: afterEnter.pills.map(p => p.text + '=' + p.pressed),
  display: afterEnter.cards.map(c => c.display),
};
await clickPill('all');

// ---- hover: real mouse ---------------------------------------------------
const cardPt = await ev(`(function(){
  var c = document.querySelector('.project-card'); var r = c.getBoundingClientRect();
  return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + 40) });
})()`);
const hoverBefore = await ev(STATE);
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: cardPt.x, y: cardPt.y, buttons: 0 }, sessionId);
await sleep(500);
const hoverAfter = await ev(STATE);
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 2, y: 2, buttons: 0 }, sessionId);
await sleep(500);
const hoverLeft = await ev(STATE);
out.push({
  hover: {
    before: { transform: hoverBefore.cards[0].transform, overlay: hoverBefore.cards[0].overlay.opacity, shadow: hoverBefore.cards[0].shadow },
    over: { transform: hoverAfter.cards[0].transform, overlay: hoverAfter.cards[0].overlay.opacity, shadow: hoverAfter.cards[0].shadow },
    after: { transform: hoverLeft.cards[0].transform, overlay: hoverLeft.cards[0].overlay.opacity },
  },
});

// ---- keyboard: Tab walk to the overlay link ------------------------------
await ev(`(function(){ window.scrollTo(0, 0); document.body.focus(); return 1; })()`);
await sleep(300);
const tabPress = async () => {
  await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, key: 'Tab', code: 'Tab' }, sessionId);
  await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 9, nativeVirtualKeyCode: 9, key: 'Tab', code: 'Tab' }, sessionId);
  await sleep(120);
};
let tabs = 0; let reached = false;
for (let i = 0; i < 40; i++) {
  await tabPress();
  tabs++;
  const isLink = await ev(`JSON.stringify(document.activeElement && document.activeElement.classList.contains('project-link'))`);
  if (isLink) { reached = true; break; }
}
await sleep(400);
const focused = await ev(STATE);
out.push({
  keyboard: {
    tabPresses: tabs, reachedLink: reached,
    focusVisible: focused.cards[0].link.focusVisible,
    outline: focused.cards[0].link.outline,
    overlayOpacity: focused.cards[0].overlay.opacity,
    label: focused.cards[0].link.label,
    activeEl: focused.activeEl,
  },
});

// ---- 320px classic scrollbar --------------------------------------------
await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(2600);
const narrow = await ev(STATE);
out.push({ narrow });

// ---- no-JS ---------------------------------------------------------------
await send('Emulation.setScriptExecutionDisabled', { value: true }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(1500);
const nojs = await ev(STATE);
await send('Emulation.setScriptExecutionDisabled', { value: false }, sessionId);
out.push({ nojs: { cards: nojs.cards.map(c => ({ pending: c.pending, opacity: c.opacity, display: c.display })), pills: nojs.pills.map(p => p.text + '=' + p.pressed) } });

// ---- reduced motion ------------------------------------------------------
await send('Emulation.setEmulatedMedia', { features: [
  { name: 'prefers-color-scheme', value: 'light' },
  { name: 'prefers-reduced-motion', value: 'reduce' },
] }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(2600);
const rmTransition = await ev(`JSON.stringify(getComputedStyle(document.querySelector('.project-card')).transitionDuration)`);
const rmFilter = await ev(`JSON.stringify(getComputedStyle(document.querySelector('.filter-badge')).transitionDuration)`);
out.push({ reducedMotion: { card: rmTransition, filter: rmFilter } });

ws.close(); chrome.kill();
console.log(JSON.stringify({ runs: out, filters, errors }, null, 1));

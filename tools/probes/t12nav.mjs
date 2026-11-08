// T12: drawer behaviour at the new 1024px nav breakpoint.
// 1. at 900/1024 the hamburger is visible and the drawer opens/closes
// 2. at 1025/1100 the menu is inline and the hamburger is gone
// 3. resizing from 900 (open) to 1100 closes it, unlocks scroll and keeps focus
// Usage: node t12nav.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t12nav`;
mkdirSync(dir, { recursive: true });
const PORT = 9411;

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
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return JSON.parse(r.result.value);
};

const STATE = `(function(){
  var burger = document.getElementById('hamburger');
  var menu = document.getElementById('nav-menu');
  var r = menu.getBoundingClientRect();
  return JSON.stringify({
    width: innerWidth,
    burgerDisplay: getComputedStyle(burger).display,
    expanded: burger.getAttribute('aria-expanded'),
    menuActive: menu.classList.contains('active'),
    menuVisibility: getComputedStyle(menu).visibility,
    menuLeft: Math.round(r.left),
    menuWidth: Math.round(r.width),
    navOpen: document.body.classList.contains('nav-open'),
    navHeight: getComputedStyle(document.documentElement).getPropertyValue('--navbar-height').trim(),
    active: document.activeElement ? (document.activeElement.id || document.activeElement.className || document.activeElement.tagName) : null
  });
})()`;

const clickBurger = async () => {
  const pt = await ev(`(function(){ var b = document.getElementById('hamburger'); var r = b.getBoundingClientRect();
    return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) }); })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await sleep(400);
};

for (const width of [900, 1024, 1025, 1100, 1200]) {
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
  await send('Page.navigate', { url: `${base}/it/` }, sessionId);
  await sleep(2400);
  const closed = await ev(STATE);
  let opened = null;
  if (closed.burgerDisplay !== 'none') {
    await clickBurger();
    opened = await ev(STATE);
    await send('Input.dispatchKeyEvent', { type: 'rawKeyDown', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27, key: 'Escape', code: 'Escape' }, sessionId);
    await send('Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27, key: 'Escape', code: 'Escape' }, sessionId);
    await sleep(400);
  }
  const afterEscape = await ev(STATE);
  console.log(`--- ${width}px`, 'burger=' + closed.burgerDisplay, 'menuVis=' + closed.menuVisibility, 'menuLeft=' + closed.menuLeft, 'menuW=' + closed.menuWidth);
  if (opened) console.log('    open:', JSON.stringify({ active: opened.menuActive, expanded: opened.expanded, vis: opened.menuVisibility, left: opened.menuLeft, navOpen: opened.navOpen }));
  console.log('    escape:', JSON.stringify({ active: afterEscape.menuActive, expanded: afterEscape.expanded, vis: afterEscape.menuVisibility, navOpen: afterEscape.navOpen, focus: afterEscape.active }));
}

// Resize while open: 900 -> 1100.
await send('Emulation.setDeviceMetricsOverride', { width: 900, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(2400);
await clickBurger();
const openedAt900 = await ev(STATE);
await send('Emulation.setDeviceMetricsOverride', { width: 1100, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
await sleep(600);
const afterResize = await ev(STATE);
console.log('--- resize 900->1100');
console.log('    open@900 :', JSON.stringify({ active: openedAt900.menuActive, navOpen: openedAt900.navOpen, expanded: openedAt900.expanded }));
console.log('    @1100    :', JSON.stringify({ active: afterResize.menuActive, navOpen: afterResize.navOpen, expanded: afterResize.expanded, burger: afterResize.burgerDisplay, focus: afterResize.active, bodyOverflow: null }));

ws.close(); chrome.kill();

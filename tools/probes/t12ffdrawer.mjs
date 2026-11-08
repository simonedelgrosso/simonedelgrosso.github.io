// T12: Firefox drawer geometry + `inert` behaviour (T3 deferred both to T12).
// Usage: node t12ffdrawer.mjs <baseUrl> <bidiPort>
const base = process.argv[2] || 'http://127.0.0.1:4010';
const port = process.argv[3] || '9222';

const ws = new WebSocket(`ws://127.0.0.1:${port}/session`);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('ws error')); });
let id = 0; const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const p = pending.get(m.id); pending.delete(m.id);
    m.type === 'error' ? p.reject(new Error(`${p.method}: ${JSON.stringify(m.error)}`)) : p.resolve(m.result);
  }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const mid = ++id; pending.set(mid, { resolve, reject, method });
  ws.send(JSON.stringify({ id: mid, method, params }));
});

await send('session.new', { capabilities: {} });
const tree = await send('browsingContext.getTree', {});
const context = tree.contexts[0].context;
const evalIn = async (expression) => {
  const r = await send('script.evaluate', { expression, target: { context }, awaitPromise: true, resultOwnership: 'none' });
  if (r.type === 'exception') throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const json = async (e) => JSON.parse(await evalIn(e));

await send('browsingContext.setViewport', { context, viewport: { width: 900, height: 900 }, devicePixelRatio: 1 });
await send('browsingContext.navigate', { context, url: `${base}/en/`, wait: 'complete' });
await new Promise(r => setTimeout(r, 1400));

const before = await json(`(function(){
  var menu = document.getElementById('nav-menu');
  var r = menu.getBoundingClientRect();
  return JSON.stringify({
    inertSupported: 'inert' in HTMLElement.prototype,
    menuVis: getComputedStyle(menu).visibility,
    menuRect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
    mainInert: document.querySelector('main') ? document.querySelector('main').inert : null
  });
})()`);
console.log('closed:', JSON.stringify(before));

// Open via the real button.
await evalIn(`document.getElementById('hamburger').click(); 'ok'`);
await new Promise(r => setTimeout(r, 600));

const open = await json(`(function(){
  var menu = document.getElementById('nav-menu');
  var nav = document.getElementById('navbar');
  var r = menu.getBoundingClientRect();
  var nr = nav.getBoundingClientRect();
  var body = document.body;
  return JSON.stringify({
    menuVis: getComputedStyle(menu).visibility,
    menuRect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
    navRect: [Math.round(nr.left), Math.round(nr.top), Math.round(nr.width)],
    navHeightVar: getComputedStyle(document.documentElement).getPropertyValue('--navbar-height').trim(),
    bodyOverflow: getComputedStyle(body).overflow,
    navOpen: body.classList.contains('nav-open'),
    mainInert: document.querySelector('main').inert,
    heroInert: document.querySelector('.hero').inert,
    footerInert: document.querySelector('.footer').inert,
    navInert: nav.inert,
    expanded: document.getElementById('hamburger').getAttribute('aria-expanded'),
    active: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null
  });
})()`);
console.log('open:', JSON.stringify(open, null, 1));

// Escape closes and returns focus.
await send('actions.dispatchActions', {}).catch(() => {});
await evalIn(`document.getElementById('hamburger').focus(); 'ok'`);
await send('input.performActions', {
  context,
  actions: [{ type: 'key', id: 'kb', actions: [
    { type: 'keyDown', value: '\uE00C' }, { type: 'keyUp', value: '\uE00C' },
  ] }],
});
await new Promise(r => setTimeout(r, 600));
const closed = await json(`(function(){
  var menu = document.getElementById('nav-menu');
  return JSON.stringify({
    menuVis: getComputedStyle(menu).visibility,
    navOpen: document.body.classList.contains('nav-open'),
    expanded: document.getElementById('hamburger').getAttribute('aria-expanded'),
    mainInert: document.querySelector('main').inert,
    active: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null
  });
})()`);
console.log('after Escape:', JSON.stringify(closed));

try { await send('session.end', {}); } catch { /* closing */ }
ws.close();
process.exit(0);

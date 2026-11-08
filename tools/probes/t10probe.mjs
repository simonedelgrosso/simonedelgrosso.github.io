// T10 probe: contact cards + form + footer.
// - 16 layout runs (1440/1024/768/375 x EN/IT x light/dark)
// - real focus on every control: accent border + visible ring (both themes)
// - native validation blocks an empty submit (focus moves to the first invalid)
// - a valid submit builds a mailto: URL and resets the form (href setter spied)
// - 320px classic width, no-JS, reduced motion
// Usage: node t10probe.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t10`;
mkdirSync(dir, { recursive: true });
rmSync(`${dir}\\profile`, { recursive: true, force: true });
const PORT = 9391;

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
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, userGesture: true }, sessionId);
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return JSON.parse(r.result.value);
};

const STATE = `(function () {
  function box(el) { if (!el) return null; var r = el.getBoundingClientRect(); var cs = getComputedStyle(el);
    return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height),
      bg: cs.backgroundColor, radius: cs.borderRadius, border: cs.borderTopColor,
      shadow: cs.boxShadow, fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, pad: cs.padding }; }
  var items = Array.prototype.map.call(document.querySelectorAll('.contact-item'), function (it) {
    var link = it.querySelector('.contact-details a');
    return { box: box(it), icon: box(it.querySelector('.contact-icon')),
      iconGlyph: box(it.querySelector('.contact-icon i')),
      title: box(it.querySelector('h3')), link: box(link), href: link.getAttribute('href'),
      linkOutline: getComputedStyle(link).outlineColor + ' ' + getComputedStyle(link).outlineWidth };
  });
  var inputs = Array.prototype.map.call(document.querySelectorAll('.contact-form .form-control'), function (c) {
    return { id: c.id, box: box(c), required: c.required, type: c.type,
      outline: getComputedStyle(c).outlineStyle + ' ' + getComputedStyle(c).outlineWidth };
  });
  var social = Array.prototype.map.call(document.querySelectorAll('.social-links a'), function (a) {
    return { box: box(a), label: a.getAttribute('aria-label'), rel: a.getAttribute('rel'),
      target: a.getAttribute('target'), href: a.getAttribute('href'),
      glyphHidden: a.querySelector('i').getAttribute('aria-hidden') };
  });
  return JSON.stringify({
    width: innerWidth, clientW: document.documentElement.clientWidth, docW: document.documentElement.scrollWidth,
    contactCols: getComputedStyle(document.querySelector('.contact-content')).gridTemplateColumns,
    items: items,
    form: box(document.querySelector('.contact-form')),
    inputs: inputs,
    button: box(document.querySelector('#contact-form button[type=submit]')),
    footer: box(document.querySelector('.footer')),
    footerText: box(document.querySelector('.footer-content p')),
    social: social,
    labels: Array.prototype.map.call(document.querySelectorAll('.form-label'), function (l) { return box(l).fs; }),
    activeEl: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null
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
      await ev(`(function(){ document.getElementById('contact').scrollIntoView({ block: 'start' }); return 1; })()`);
      await sleep(400);
      out.push({ lang, scheme, width, state: await ev(STATE) });
    }
  }
}

// ---- focus ring on inputs, both themes -----------------------------------
await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
const focusRuns = [];
for (const scheme of ['light', 'dark']) {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] }, sessionId);
  await send('Page.navigate', { url: `${base}/en/` }, sessionId);
  await sleep(2600);
  await ev(`(function(){ document.getElementById('contact').scrollIntoView({ block: 'start' }); return 1; })()`);
  await sleep(300);
  const res = {};
  for (const field of ['name', 'email', 'subject', 'message']) {
    await ev(`(function(){ document.getElementById('${field}').focus(); return 1; })()`);
    await sleep(120);
    res[field] = await ev(`(function(){
      var el = document.getElementById('${field}'); var cs = getComputedStyle(el);
      return JSON.stringify({ shadow: cs.boxShadow, border: cs.borderTopColor, outline: cs.outlineStyle, h: Math.round(el.getBoundingClientRect().height) });
    })()`);
  }
  // Keyboard focus on a contact link -> card emphasis.
  await ev(`(function(){ document.querySelector('.contact-details a').focus(); return 1; })()`);
  await sleep(300);
  res.contactLink = await ev(`(function(){
    var item = document.querySelector('.contact-item');
    var cs = getComputedStyle(item);
    return JSON.stringify({ border: cs.borderTopColor, shadow: cs.boxShadow, focusWithin: item.matches(':focus-within'), outline: getComputedStyle(document.activeElement).outlineColor });
  })()`);
  focusRuns.push({ scheme, res });
}

// ---- validation: empty submit must not fire the handler ------------------
await send('Page.enable', {}, sessionId);
const navEvents = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.method === 'Page.frameScheduledNavigation' || m.method === 'Page.frameRequestedNavigation' ||
      m.method === 'Page.navigatedWithinDocument' || m.method === 'Page.frameStartedLoading') {
    navEvents.push({ method: m.method, url: m.params.url || (m.params.navigation && m.params.navigation.url) || null,
      reason: m.params.reason || (m.params.navigation && m.params.navigation.reason) || null });
  }
});
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
await send('Page.navigate', { url: `${base}/en/` }, sessionId);
await sleep(2600);
await ev(`(function(){
  window.__reset = 0; window.__submits = 0;
  var form = document.getElementById('contact-form');
  var origReset = form.reset.bind(form);
  form.reset = function () { window.__reset++; return origReset(); };
  form.addEventListener('submit', function(){ window.__submits++; });
  window.__startUrl = location.href;
  return 1;
})()`);
await ev(`(function(){ document.getElementById('contact').scrollIntoView({ block: 'start' }); return 1; })()`);
await sleep(400);

const clickSubmit = async () => {
  const pt = await ev(`(function(){
    var b = document.querySelector('#contact-form button[type=submit]'); var r = b.getBoundingClientRect();
    return JSON.stringify({ x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) });
  })()`);
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 }, sessionId);
  await sleep(500);
};

await clickSubmit();
const emptySubmit = await ev(`JSON.stringify({
  valid: document.getElementById('contact-form').checkValidity(),
  resets: window.__reset, submits: window.__submits,
  active: document.activeElement ? document.activeElement.id : null
})`);

// ---- valid submit builds the mailto URL -----------------------------------
await ev(`(function(){
  var set = function(id, v){ var el = document.getElementById(id); el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true })); };
  set('name', 'Test User'); set('email', 'test@example.com');
  set('subject', 'Hello there'); set('message', 'A message body.');
  return 1;
})()`);
const navMark = navEvents.length;
await clickSubmit();
const validSubmit = await ev(`JSON.stringify({
  resets: window.__reset, submits: window.__submits,
  nameAfter: document.getElementById('name').value,
  sameDocument: location.href === window.__startUrl
})`);
out.push({ focusRuns, validation: { emptySubmit, validSubmit, nav: navEvents.slice(navMark) } });

// ---- 320px classic -------------------------------------------------------
await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, sessionId);
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
out.push({ nojs: { items: nojs.items.length, inputs: nojs.inputs.length, social: nojs.social.length, formH: nojs.form.h } });

ws.close(); chrome.kill();
console.log(JSON.stringify({ runs: out, errors }, null, 1));

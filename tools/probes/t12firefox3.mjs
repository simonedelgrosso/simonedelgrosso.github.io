// T12 cross-browser: Firefox (BiDi), both themes via the site's own storage key
// (BiDi in Firefox 159 has no emulation.setEmulatedMedia).
// Usage: node t12firefox3.mjs <baseUrl> <bidiPort>
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

const evalIn = async (expression, awaitPromise = true) => {
  const r = await send('script.evaluate', { expression, target: { context }, awaitPromise, resultOwnership: 'none' });
  if (r.type === 'exception') throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const json = async (expression) => JSON.parse(await evalIn(expression));

const STATE = `(function(){
  var de = document.documentElement;
  var logo = document.querySelector('.nav-logo');
  var menu = document.getElementById('nav-menu');
  var burger = document.getElementById('hamburger');
  var controls = document.querySelector('.nav-controls');
  var logoW = Math.round(logo.getBoundingClientRect().width);
  return JSON.stringify({
    scheme: de.getAttribute('data-color-scheme'),
    pageBg: getComputedStyle(document.body).backgroundColor,
    innerW: window.innerWidth, clientW: de.clientWidth, docW: de.scrollWidth,
    logoW: logoW, logoScrollW: logo.scrollWidth, logoTruncated: logo.scrollWidth > logoW + 1,
    menuVisibility: getComputedStyle(menu).visibility,
    burger: getComputedStyle(burger).display,
    controlsR: Math.round(controls.getBoundingClientRect().right)
  });
})()`;

let fail = 0;
for (const scheme of ['light', 'dark']) {
  // Seed the stored theme, then let the pre-paint script apply it on load.
  await send('browsingContext.navigate', { context, url: `${base}/en/`, wait: 'complete' });
  await evalIn(`localStorage.setItem('theme', ${JSON.stringify(scheme)}); 'ok'`);
  for (const lang of ['en', 'it']) {
    for (const width of [320, 375, 768, 1024, 1440]) {
      await send('browsingContext.setViewport', { context, viewport: { width, height: 900 }, devicePixelRatio: 1 });
      await send('browsingContext.navigate', { context, url: `${base}/${lang}/`, wait: 'complete' });
      await new Promise(r => setTimeout(r, 800));
      const s = await json(STATE);
      const problems = [];
      if (s.docW > s.clientW) problems.push('docoverflow');
      if (s.logoTruncated) problems.push('logo-trunc');
      if (s.controlsR > s.clientW) problems.push('controls-offscreen');
      if (s.scheme !== scheme) problems.push('scheme=' + s.scheme);
      if (problems.length) fail++;
      console.log(`${lang} ${scheme.padEnd(5)} ${String(width).padStart(4)} scheme=${s.scheme} bg=${s.pageBg} ` +
        `docW=${s.docW}/${s.clientW} logo=${s.logoW}/${s.logoScrollW} ` +
        `burger=${s.burger === 'none' ? 'inline' : 'drawer'} controlsR=${s.controlsR}` +
        (problems.length ? `  <-- ${problems.join(',')}` : ''));
    }
  }
}
console.log('firefox failures', fail);
try { await send('session.end', {}); } catch { /* closing */ }
ws.close();
process.exit(0);

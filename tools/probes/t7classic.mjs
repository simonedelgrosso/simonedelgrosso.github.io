// T7 review follow-up: measure the 320px classic-scrollbar overflow.
// Reports the layout viewport (clientWidth, i.e. minus a classic scrollbar),
// documentElement.scrollWidth, and which boxes cross clientWidth.
// Usage: node t7classic.mjs <baseUrl>
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const base = process.argv[2] || 'http://127.0.0.1:4010';
const dir = `${process.env.LOCALAPPDATA}\\Temp\\opencode\\t7classic`;
mkdirSync(dir, { recursive: true });
rmSync(`${dir}\\profile`, { recursive: true, force: true });
const PORT = 9368;

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
// This probe is only meaningful with a *classic* scrollbar: with overlay
// scrollbars clientWidth == innerWidth and every "overflow" check is vacuous.
// Headless Chrome has defaulted to classic for these runs, but that is not a
// guarantee, so ask for it explicitly (same trap the plan records for T3).
await send('Emulation.setScrollbarsHidden', { hidden: false }, sessionId);
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};

for (const lang of ['en', 'it']) {
  for (const width of [320, 360, 375]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
    await send('Page.navigate', { url: `${base}/${lang}/` }, sessionId);
    await sleep(2800);
    const d = JSON.parse(await ev(`(function(){
      var de = document.documentElement;
      var cw = de.clientWidth;
      var out = [];
      ['.certifications-grid', '.projects-grid', '.skills-grid'].forEach(function(sel){
        var g = document.querySelector(sel);
        if (!g) return;
        var cs = getComputedStyle(g);
        var r = g.getBoundingClientRect();
        var card = g.firstElementChild;
        var cr = card ? card.getBoundingClientRect() : null;
        out.push({ sel: sel, cols: cs.gridTemplateColumns, gL: Math.round(r.left), gR: Math.round(r.right),
          cardL: cr ? Math.round(cr.left) : null, cardR: cr ? Math.round(cr.right) : null,
          crosses: cr ? Math.round(cr.right) > cw : null });
      });
      return JSON.stringify({ innerW: innerWidth, clientW: cw, scrollbar: innerWidth - cw,
        docW: de.scrollWidth, bodyW: document.body.scrollWidth, grids: out });
    })()`));
    console.log(`${lang} ${width}: innerW=${d.innerW} clientW=${d.clientW} scrollbar=${d.scrollbar} docW=${d.docW} bodyW=${d.bodyW} overflow=${d.docW > d.clientW ? 'YES ' + (d.docW - d.clientW) + 'px' : 'no'}`);
    if (d.scrollbar === 0) {
      console.log('   WARNING: no classic scrollbar (innerW == clientW) — this run proves nothing about the layout viewport');
    }
    for (const g of d.grids) {
      console.log(`   ${g.sel} cols=${g.cols} grid=${g.gL}-${g.gR} card=${g.cardL}-${g.cardR}${g.crosses ? ' CROSSES clientWidth' : ''}`);
    }
  }
}
ws.close(); chrome.kill();

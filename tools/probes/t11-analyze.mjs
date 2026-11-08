// Analyzer for t11probe.mjs output (PowerShell may write UTF-16LE with BOM).
// Usage: node t11-analyze.mjs <file>
import { readFileSync } from 'node:fs';
const raw = readFileSync(process.argv[2]);
const text = raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le').replace(/^\uFEFF/, '') : raw.toString('utf8').replace(/^\uFEFF/, '');
const d = JSON.parse(text);
console.log('errors:', d.errors.length, JSON.stringify(d.errors.slice(0, 3)));
let fail = 0;

for (const r of d.runs) {
  const problems = [];
  const label = r.reduced ? 'reduced' : 'normal';
  const p = r.preloader;
  if (!p || !p.present) problems.push('preloader never observed');
  else {
    if (p.inlineStyle) problems.push('preloader has inline style: ' + p.inlineStyle);
    if (p.bg !== 'rgb(248, 249, 251)') problems.push('preloader bg ' + p.bg + ' (light theme expects #f8f9fb)');
    if (!p.spinner) problems.push('no spinner element');
  }
  if (r.removedAtMs === null) problems.push('preloader never removed');
  else if (r.removedAtMs > 1000) problems.push('preloader removed after ' + r.removedAtMs + 'ms (>1000)');

  const a = r.afterLoad;
  if (!a.buttonExists) problems.push('no scroll-to-top button');
  if (a.buttonInline) problems.push('button has inline style: ' + a.buttonInline);
  if (a.buttonClass.includes('is-visible')) problems.push('button visible at top of page');
  if (a.buttonVisibility !== 'hidden') problems.push('button visibility ' + a.buttonVisibility);
  if (r.reduced) {
    if (a.canvas) problems.push('particles canvas created under reduced motion');
    if (a.typing !== 'Full-Stack Developer') problems.push('typing text ' + JSON.stringify(a.typing));
    if (a.cursorAnim !== 'none') problems.push('cursor animation ' + a.cursorAnim);
    if (JSON.stringify(a.counters) !== JSON.stringify(a.statTargets)) {
      problems.push('counters not final: ' + JSON.stringify(a.counters) + ' vs ' + JSON.stringify(a.statTargets));
    }
  } else {
    if (!a.canvas) problems.push('no particles canvas');
  }

  const s = r.scrolled;
  if (!s.buttonClass.includes('is-visible')) problems.push('button not visible after scroll');
  if (s.visible !== 'visible') problems.push('button visibility after scroll ' + s.visible);
  if (!s.progressW || s.progressW === '0px') problems.push('progress bar width ' + s.progressW);
  for (let i = 0; i < s.counters.length; i++) {
    if (s.counters[i] !== a.statTargets[i]) problems.push('counter ' + i + ' = ' + s.counters[i] + ' expected ' + a.statTargets[i]);
  }

  if (r.reduced) {
    if (r.justAfterClick.scrollY > 20) problems.push('scroll not instant under reduced motion (' + r.justAfterClick.scrollY + ')');
  } else {
    if (r.justAfterClick.scrollY < 100) problems.push('scroll was not smooth (' + r.justAfterClick.scrollY + ' after 60ms)');
  }
  if (r.settled.scrollY !== 0) problems.push('did not reach top (' + r.settled.scrollY + ')');
  if (r.settled.buttonClass.includes('is-visible')) problems.push('button still visible at top');

  if (problems.length) { fail++; console.log('FAIL', label, problems.join(' | ')); }
  console.log(problems.length ? '     ' : 'ok   ',
    label,
    'preloader=' + (p && p.present ? p.bg : 'none') + ' removed@' + r.removedAtMs + 'ms-after-load',
    'canvas=' + a.canvas,
    'typing=' + JSON.stringify(a.typing),
    'cursorAnim=' + a.cursorAnim,
    'counters=' + a.counters.join('/'),
    'progress=' + s.progressW,
    'smooth@60ms=' + r.justAfterClick.scrollY);
}

console.log('--- footer clearance');
for (const c of d.clearance) {
  console.log(' ', JSON.stringify(c));
  if (c.overlap) { fail++; console.log('   FAIL overlap at ' + c.width); }
  if (c.docW > c.clientW) { fail++; console.log('   FAIL overflow ' + c.docW + '>' + c.clientW); }
}
console.log('failures', fail);

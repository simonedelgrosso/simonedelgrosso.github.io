// Analyzer for t7probe.mjs output (PowerShell writes UTF-16LE with BOM).
// Usage: node t7-analyze.mjs <file>
import { readFileSync } from 'node:fs';
const raw = readFileSync(process.argv[2]);
const text = raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le').replace(/^\uFEFF/, '') : raw.toString('utf8').replace(/^\uFEFF/, '');
const d = JSON.parse(text);
console.log('errors:', d.errors.length, JSON.stringify(d.errors.slice(0, 3)));
let fail = 0;
for (const r of d.runs.filter(x => x.before)) {
  const b = r.before, m = r.mid, a = r.after;
  const problems = [];
  if (b.cards.length !== 3) problems.push('card count ' + b.cards.length);
  if (!b.cards.every(c => c.pending && c.opacity === '0')) problems.push('before not hidden ' + JSON.stringify(b.cards.map(c => [c.pending, c.opacity])));
  if (!a.cards.every(c => !c.pending && c.opacity === '1')) problems.push('after not revealed ' + JSON.stringify(a.cards.map(c => [c.pending, c.opacity])));
  if (!a.cards.every(c => c.translate === 'none' || c.translate === '0px')) problems.push('translate after ' + a.cards.map(c => c.translate).join(','));
  if (!a.cards.every(c => c.inline === null)) problems.push('inline styles remain ' + a.cards.map(c => c.inline).join(' | '));
  const midOps = m.cards.map(c => Number(c.opacity));
  if (!(midOps.some(v => v > 0 && v < 1) || midOps.every(v => v === 1))) problems.push('mid opacity ' + midOps.join(','));
  // Icon: 56x56 circle, tinted.
  if (!a.cards.every(c => c.icon.w === 56 && c.icon.h === 56 && c.icon.radius === '50%')) problems.push('icon ' + JSON.stringify(a.cards.map(c => [c.icon.w, c.icon.h, c.icon.radius])));
  if (!a.cards.every(c => c.icon.bg !== 'rgba(0, 0, 0, 0)')) problems.push('icon bg ' + a.cards[0].icon.bg);
  // Badge: pill, not full width, semibold.
  if (!a.cards.every(c => c.badge.radius === '9999px' && c.badge.w < c.box.w)) problems.push('badge ' + JSON.stringify(a.cards.map(c => [c.badge.radius, c.badge.w, c.box.w])));
  if (!a.cards.every(c => c.badge.fw === '600')) problems.push('badge weight ' + a.cards[0].badge.fw);
  // Equal heights and aligned badges per row.
  const rows = {};
  for (const c of a.cards) { (rows[c.box.t] = rows[c.box.t] || []).push(c); }
  for (const [top, group] of Object.entries(rows)) {
    const heights = [...new Set(group.map(c => c.box.h))];
    if (heights.length !== 1) problems.push('row ' + top + ' heights ' + heights.join(','));
    const badges = [...new Set(group.map(c => c.badge.t))];
    if (badges.length !== 1) problems.push('row ' + top + ' badge tops ' + badges.join(','));
  }
  // Columns.
  const cols = a.gridCols.split(' ').length;
  if (r.width >= 1024 && cols !== 3) problems.push('cols ' + cols + ' at ' + r.width);
  if (r.width === 375 && cols !== 1) problems.push('cols ' + cols + ' at 375');
  // Experience hierarchy.
  const e = a.experience;
  if (e.period.radius !== '9999px') problems.push('period radius ' + e.period.radius);
  if (e.period.fw !== '600') problems.push('period weight ' + e.period.fw);
  if (e.role.fs !== '19px' || e.role.fw !== '600') problems.push('role ' + e.role.fs + '/' + e.role.fw);
  if (Number(e.company.fs.replace('px', '')) <= Number(e.role.fs.replace('px', ''))) problems.push('company not larger than role');
  if (e.headerBorder !== '1px') problems.push('header border ' + e.headerBorder);
  if (e.liBefore.content !== '""' || e.liBefore.bg === 'rgba(0, 0, 0, 0)') problems.push('bullet ' + JSON.stringify(e.liBefore));
  if (e.liPad !== '20px') problems.push('li pad ' + e.liPad);
  if (e.item.bg === 'rgba(0, 0, 0, 0)') problems.push('experience bg transparent');
  if (!e.item.shadow) problems.push('experience shadow missing');
  // Hero count still fed from the cards.
  if (a.heroTargets.length !== 3 || a.heroTargets[2] !== '3') problems.push('hero targets ' + a.heroTargets.join('/'));
  if (a.docW > a.innerW) problems.push('overflow ' + a.docW + '>' + a.innerW);
  if (problems.length) { fail++; console.log('FAIL', r.lang, r.scheme, r.width, problems.join(' | ')); }
  else console.log('ok', r.lang, r.scheme, r.width, 'cols=' + cols, 'cards=' + a.cards.map(c => c.box.w + 'x' + c.box.h).join(' '), 'badges=' + a.cards.map(c => c.badge.t).join(','), 'mid=' + midOps.map(v => v.toFixed(2)).join('/'), 'hero=' + a.heroTargets.join('/'));
}
const nojs = d.runs.find(r => r.nojs);
console.log('no-JS:', JSON.stringify(nojs.nojs));
const rm = d.runs.find(r => r.reducedMotion);
console.log('reduced motion:', JSON.stringify(rm.reducedMotion));
console.log('failures', fail);
const first = d.runs[0].after;
console.log('icon:', JSON.stringify(first.cards[0].icon));
console.log('badge:', JSON.stringify(first.cards[0].badge));
console.log('code:', JSON.stringify(first.cards[0].code));
console.log('card:', JSON.stringify(first.cards[0].box));
console.log('experience:', JSON.stringify(first.experience, null, 1));

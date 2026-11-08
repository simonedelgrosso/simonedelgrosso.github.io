import { readFileSync } from 'node:fs';
const raw = readFileSync(process.argv[2]);
const text = raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le').replace(/^\uFEFF/, '') : raw.toString('utf8').replace(/^\uFEFF/, '');
const d = JSON.parse(text);
console.log('errors:', d.errors.length, JSON.stringify(d.errors.slice(0, 3)));
let fail = 0;
for (const r of d.runs.filter(r => r.before)) {
  const b = r.before.items, m = r.mid.items, a = r.after.items;
  const problems = [];
  if (b.length !== 2 || a.length !== 2) problems.push('item count ' + b.length + '/' + a.length);
  if (!b.every(i => i.pending && i.opacity === '0')) problems.push('before not hidden: ' + JSON.stringify(b.map(i => [i.pending, i.opacity])));
  if (!a.every(i => !i.pending && i.opacity === '1')) problems.push('after not revealed: ' + JSON.stringify(a.map(i => [i.pending, i.opacity])));
  if (!a.every(i => i.transform === 'none')) problems.push('after transform: ' + a.map(i => i.transform).join(','));
  if (!a.every(i => i.transition.includes('opacity') && i.transition.includes('0.45s'))) problems.push('transition: ' + a[0].transition);
  if (!a.every(i => i.cardShadow)) problems.push('no card shadow');
  if (!a.every(i => i.dot.width === '12px' && i.dot.height === '12px')) problems.push('dot size ' + a[0].dot.width);
  if (!a.every(i => i.dot.shadow.includes('rgb'))) problems.push('dot ring: ' + a[0].dot.shadow);
  if (r.before.gradeCount !== 2) problems.push('grade count ' + r.before.gradeCount);
  if (r.before.chips.length !== 3) problems.push('chips ' + r.before.chips.length);
  const chipHeights = [...new Set(r.before.chips.map(c => c.h))];
  if (chipHeights.length !== 1) problems.push('chip heights ' + chipHeights.join(','));
  if (!r.before.chips.every(c => c.radius === '9999px' || c.radius === '100000px')) problems.push('chip radius ' + r.before.chips.map(c => c.radius).join(','));
  if (!r.before.chips.every(c => c.icon.w === 26 && c.icon.h === 26)) problems.push('chip icon size ' + r.before.chips.map(c => c.icon.w + 'x' + c.icon.h).join(','));
  if (r.width <= 768) {
    const lefts = [...new Set(a.map(i => i.cardLeft))];
    if (lefts.length !== 1) problems.push('mobile not one column: ' + lefts.join(','));
    if (!a.every(i => i.cardTextAlign === 'left')) problems.push('mobile text-align ' + a.map(i => i.cardTextAlign).join(','));
    if (a[0].cardRight >= r.after.innerW) problems.push('card overflows');
  } else {
    const aligned = a[0].cardLeft === a[1].cardLeft && a[0].cardRight === a[1].cardRight;
    if (aligned) problems.push('desktop cards not staggered');
  }
  if (r.after.docW > r.after.innerW) problems.push('doc overflow ' + r.after.docW + '>' + r.after.innerW);
  const midOpacities = m.map(i => Number(i.opacity));
  if (problems.length) { fail++; console.log('FAIL', r.lang, r.scheme, r.width, problems.join(' | ')); }
  else console.log('ok', r.lang, r.scheme, r.width, 'before opacity=' + b.map(i => i.opacity).join('/'), 'mid=' + midOpacities.map(v => v.toFixed(2)).join('/'), 'after=' + a.map(i => i.opacity).join('/'), 'cards=' + a.map(i => i.cardLeft + '-' + i.cardRight).join(' '), 'chipH=' + chipHeights[0]);
}
const nojs = d.runs.find(r => r.nojs);
console.log('no-JS:', JSON.stringify(nojs.nojs));
const rm = d.runs.find(r => r.reducedMotion);
console.log('reduced motion:', JSON.stringify(rm.reducedMotion));
console.log('failures', fail);
const first = d.runs[0].before;
console.log('chips:', JSON.stringify(first.chips, null, 1));
console.log('spine:', JSON.stringify(first.spine));
console.log('pill:', JSON.stringify(first.items[0].pill), 'dot:', JSON.stringify(first.items[0].dot));
console.log('card bg/shadow/radius:', first.items[0].cardBg, '|', first.items[0].cardShadow, '|', first.items[0].cardRadius);

// Analyzer for t10probe.mjs output (PowerShell may write UTF-16LE with BOM).
// Usage: node t10-analyze.mjs <file>
import { readFileSync } from 'node:fs';
const raw = readFileSync(process.argv[2]);
const text = raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le').replace(/^\uFEFF/, '') : raw.toString('utf8').replace(/^\uFEFF/, '');
const d = JSON.parse(text);
console.log('errors:', d.errors.length, JSON.stringify(d.errors.slice(0, 3)));
let fail = 0;

const hasShadow = (s) => s && s !== 'none';

for (const r of d.runs.filter(x => x.state)) {
  const s = r.state;
  const problems = [];
  if (s.items.length !== 5) problems.push('items ' + s.items.length);
  if (s.inputs.length !== 4) problems.push('inputs ' + s.inputs.length);
  if (s.social.length !== 5) problems.push('social ' + s.social.length);
  // Contact cards.
  for (const it of s.items) {
    if (!hasShadow(it.box.shadow)) problems.push('item shadow');
    if (it.box.radius !== '12px') problems.push('item radius ' + it.box.radius);
    if (it.icon.w !== 44 || it.icon.h !== 44) problems.push('icon ' + it.icon.w + 'x' + it.icon.h);
    if (it.icon.radius !== '50%') problems.push('icon radius ' + it.icon.radius);
    if (it.icon.bg === 'rgba(0, 0, 0, 0)') problems.push('icon bg transparent');
    if (it.icon.color === it.icon.bg) problems.push('icon glyph same as bg');
    if (it.title.fs !== '19px') problems.push('title ' + it.title.fs);
    if (!it.href) problems.push('missing href');
  }
  // Form.
  if (!hasShadow(s.form.shadow)) problems.push('form shadow');
  if (s.form.radius !== '12px') problems.push('form radius ' + s.form.radius);
  if (s.button.h < 44) problems.push('button h ' + s.button.h);
  for (const i of s.inputs) {
    if (i.box.h < 44) problems.push(`input ${i.id} h=${i.box.h}`);
    if (i.box.radius !== '10px') problems.push(`input ${i.id} radius ${i.box.radius}`);
    if (!i.required) problems.push(`input ${i.id} not required`);
  }
  if (s.inputs.find(i => i.id === 'email').type !== 'email') problems.push('email not type=email');
  if (!s.labels.every(fs => fs === '13px')) problems.push('label fs ' + s.labels.join(','));
  // Footer.
  if (s.footer.bg === 'rgba(0, 0, 0, 0)') problems.push('footer transparent');
  if (s.footerText.fs !== '15px') problems.push('footer text fs ' + s.footerText.fs);
  for (const a of s.social) {
    if (a.box.w !== 40 || a.box.h !== 40) problems.push('social size ' + a.box.w + 'x' + a.box.h);
    if (a.box.radius !== '50%') problems.push('social radius ' + a.box.radius);
    if (a.box.border === 'rgba(0, 0, 0, 0)') problems.push('social border invisible');
    if (!a.label) problems.push('social no label');
    if (a.glyphHidden !== 'true') problems.push('social glyph not aria-hidden');
    if (a.target === '_blank' && a.rel !== 'noopener noreferrer') problems.push('social rel ' + a.rel);
  }
  // Grid.
  const cols = s.contactCols.split(' ').length;
  if (r.width >= 769 && cols !== 2) problems.push('cols ' + cols + ' at ' + r.width);
  if (r.width <= 768 && cols !== 1) problems.push('cols ' + cols + ' at ' + r.width);
  if (s.docW > s.clientW) problems.push('overflow ' + s.docW + '>' + s.clientW);
  if (problems.length) { fail++; console.log('FAIL', r.lang, r.scheme, r.width, [...new Set(problems)].join(' | ')); }
  else console.log('ok', r.lang, r.scheme, r.width, 'cols=' + cols, 'items=' + s.items.length,
    'icon=' + s.items[0].icon.w + 'x' + s.items[0].icon.h, 'input=' + s.inputs[0].box.h,
    'form=' + s.form.w + 'x' + s.form.h, 'social=' + s.social.length, 'docW=' + s.docW + '/' + s.clientW);
}

console.log('--- focus');
for (const f of d.runs.find(x => x.focusRuns).focusRuns) {
  for (const [field, v] of Object.entries(f.res)) {
    console.log(` ${f.scheme} ${field}: shadow=${v.shadow.slice(0, 60)} border=${v.border} outline=${v.outline || ''}${v.h ? ' h=' + v.h : ''}${v.focusWithin !== undefined ? ' focusWithin=' + v.focusWithin : ''}`);
  }
}

console.log('--- validation');
const val = d.runs.find(x => x.validation).validation;
console.log(' empty:', JSON.stringify(val.emptySubmit));
console.log(' valid:', JSON.stringify(val.validSubmit));
console.log(' nav  :', JSON.stringify(val.nav));

const n = d.runs.find(x => x.narrow);
console.log('--- 320px:', 'clientW=' + n.narrow.clientW, 'docW=' + n.narrow.docW,
  'itemW=' + n.narrow.items[0].box.w, 'inputW=' + n.narrow.inputs[0].box.w,
  'overflow=' + (n.narrow.docW > n.narrow.clientW ? 'YES' : 'no'));
const nojs = d.runs.find(x => x.nojs);
console.log('--- no-JS:', JSON.stringify(nojs.nojs));
console.log('failures', fail);

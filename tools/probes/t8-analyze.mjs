// Analyzer for t8probe.mjs output (PowerShell may write UTF-16LE with BOM).
// Usage: node t8-analyze.mjs <file>
import { readFileSync } from 'node:fs';
const raw = readFileSync(process.argv[2]);
const text = raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le').replace(/^\uFEFF/, '') : raw.toString('utf8').replace(/^\uFEFF/, '');
const d = JSON.parse(text);
console.log('errors:', d.errors.length, JSON.stringify(d.errors.slice(0, 3)));
let fail = 0;
const EXPECT = {
  en: ['Programming Languages', 'Frameworks & Libraries', 'Markup & Styling'],
  it: ['Linguaggi di Programmazione', 'Frameworks & Librerie', 'Markup & Styling'],
};
for (const r of d.runs.filter(x => x.lang)) {
  const s = r.state;
  const problems = [];
  if (s.tagCount !== 11) problems.push('tag count ' + s.tagCount);
  if (s.categoryCount !== 3) problems.push('category count ' + s.categoryCount);
  if (s.bars !== 0) problems.push('leftover bar markup ' + s.bars);
  const titles = s.cats.map(c => c.title);
  if (JSON.stringify(titles) !== JSON.stringify(EXPECT[r.lang])) problems.push('titles ' + JSON.stringify(titles));
  if (!s.cats.every(c => c.hasUl && c.role === 'list')) problems.push('missing ul[role=list]');
  if (!s.cats.every(c => c.listStyle === 'none')) problems.push('list-style ' + s.cats[0].listStyle);
  // Every tag: pill, tinted, hairline, readable size.
  const tags = s.cats.flatMap(c => c.tags);
  if (!tags.every(t => t.box.radius === '9999px')) problems.push('radius ' + tags[0].box.radius);
  if (!tags.every(t => t.box.bg !== 'rgba(0, 0, 0, 0)')) problems.push('tag bg transparent');
  if (!tags.every(t => t.box.fs === '13px' && t.box.fw === '500')) problems.push('tag font ' + tags[0].box.fs + '/' + tags[0].box.fw);
  if (!tags.every(t => t.box.w < t.box.h * 12)) problems.push('tag too wide ' + Math.max(...tags.map(t => t.box.w)));
  // Tags must stay inside their category card.
  for (const c of s.cats) {
    const worst = Math.max(...c.tags.map(t => t.box.r));
    if (worst > c.cat.r + 1) problems.push('tag overflows card: ' + worst + '>' + c.cat.r);
  }
  // Columns: auto-fit reports collapsed (0px) tracks too, so count only the
  // tracks that actually hold a card.
  const tracks = s.gridCols.split(' ').filter(t => !/^0(px)?$/.test(t));
  const cols = tracks.length;
  if (r.width === 1440 && cols !== 3) problems.push('cols ' + cols + ' at 1440 (' + s.gridCols + ')');
  if (r.width === 1024 && cols !== 3) problems.push('cols ' + cols + ' at 1024');
  if (r.width === 375 && cols !== 1) problems.push('cols ' + cols + ' at 375');
  if (s.docW > s.clientW) problems.push('overflow ' + s.docW + '>' + s.clientW);
  if (problems.length) { fail++; console.log('FAIL', r.lang, r.scheme, r.width, problems.join(' | ')); }
  else console.log('ok', r.lang, r.scheme, r.width, 'cols=' + cols, 'cats=' + s.cats.length, 'tags=' + s.tagCount,
    'rows=' + s.cats.map(c => c.tags.length + '↦' + c.rows).join(','), 'tag=' + tags[0].box.w + 'x' + tags[0].box.h,
    'docW=' + s.docW + '/' + s.clientW);
}
const n = d.runs.find(x => x.narrow);
console.log('320px:', 'clientW=' + n.narrow.clientW, 'docW=' + n.narrow.docW, 'cols=' + n.narrow.gridCols,
  'overflow=' + (n.narrow.docW > n.narrow.clientW ? 'YES' : 'no'),
  'tallestTagRight=' + Math.max(...n.narrow.cats.flatMap(c => c.tags.map(t => t.box.r))),
  'catRight=' + n.narrow.cats[0].cat.r);
const h = d.runs.find(x => x.hover);
const hb = h.hover.before.box, ha = h.hover.after.box;
console.log('hover: border ' + hb.border + ' -> ' + ha.border,
  '| color ' + hb.color + ' -> ' + ha.color,
  '| geometry ' + hb.w + 'x' + hb.h + ' -> ' + ha.w + 'x' + ha.h);
const nojs = d.runs.find(x => x.nojs);
console.log('no-JS:', JSON.stringify(nojs.nojs));
const rm = d.runs.find(x => x.reducedMotion);
console.log('reduced motion:', JSON.stringify(rm.reducedMotion));
console.log('failures', fail);

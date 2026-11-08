// Analyzer for t9probe.mjs output (PowerShell may write UTF-16LE with BOM).
// Usage: node t9-analyze.mjs <file>
import { readFileSync } from 'node:fs';
const raw = readFileSync(process.argv[2]);
const text = raw[0] === 0xff && raw[1] === 0xfe ? raw.toString('utf16le').replace(/^\uFEFF/, '') : raw.toString('utf8').replace(/^\uFEFF/, '');
const d = JSON.parse(text);
console.log('errors:', d.errors.length, JSON.stringify(d.errors.slice(0, 3)));
let fail = 0;
for (const r of d.runs.filter(x => x.state)) {
  const s = r.state;
  const problems = [];
  const c = s.cards[0];
  if (s.cardCount !== 1) problems.push('card count ' + s.cardCount);
  if (!c) { console.log('FAIL', r.lang, r.scheme, r.width, 'no card'); fail++; continue; }
  // Reveal settled.
  if (c.pending || c.opacity !== '1') problems.push('not revealed ' + c.pending + '/' + c.opacity);
  if (c.translate !== 'none') problems.push('translate ' + c.translate);
  // Card: capped width, raised surface, shadow.
  if (c.box.w > 421) problems.push('card width ' + c.box.w);
  if (!c.shadow) problems.push('no card shadow');
  if (c.box.radius !== '12px') problems.push('radius ' + c.box.radius);
  // Centred within the grid.
  if (Math.abs((c.box.l - s.gridL) - (s.gridW - c.box.w) / 2) > 2) problems.push(`not centred (card left ${c.box.l}, grid ${s.gridL}+${s.gridW}, card ${c.box.w})`);
  // Image panel.
  if (c.image.h !== 200) problems.push('image height ' + c.image.h);
  if (!c.imageBg.includes('gradient')) problems.push('image not a gradient: ' + c.imageBg);
  // Project mark disc.
  if (c.mark.w !== 92 || c.mark.h !== 92 || c.mark.radius !== '50%') problems.push('mark ' + c.mark.w + 'x' + c.mark.h + ' ' + c.mark.radius);
  // Overlay hidden at rest, dark scrim.
  if (c.overlay.opacity !== '0') problems.push('overlay visible at rest');
  if (!c.overlayBg || c.overlayBg === 'rgba(0, 0, 0, 0)') problems.push('overlay bg ' + c.overlayBg);
  // Link semantics.
  if (!c.link.label || !/^GitHub: .+/.test(c.link.label)) problems.push('link label ' + c.link.label);
  if (c.link.rel !== 'noopener noreferrer') problems.push('rel ' + c.link.rel);
  if (c.link.target !== '_blank') problems.push('target ' + c.link.target);
  if (!c.link.href || !c.link.href.startsWith('https://')) problems.push('href ' + c.link.href);
  if (c.link.w < 44 || c.link.h < 44) problems.push('hit area ' + c.link.w + 'x' + c.link.h);
  // Tech pills.
  if (c.tech.length !== 4) problems.push('tech count ' + c.tech.length);
  if (!c.tech.every(t => t.radius === '9999px')) problems.push('tech radius ' + c.tech[0].radius);
  if (!c.tech.every(t => t.fs === '12px')) problems.push('tech font ' + c.tech[0].fs);
  if (!c.tech.every(t => t.bg !== 'rgba(0, 0, 0, 0)')) problems.push('tech bg transparent');
  // Type hierarchy: title > description, category smallest.
  if (!(parseFloat(c.title.fs) > parseFloat(c.desc.fs) && parseFloat(c.category.fs) < parseFloat(c.desc.fs))) {
    problems.push('hierarchy ' + c.category.fs + '/' + c.title.fs + '/' + c.desc.fs);
  }
  // Filter pills.
  if (s.pills.length !== 3) problems.push('pill count ' + s.pills.length);
  const first = s.pills[0];
  if (first.pressed !== 'true' || !first.active) problems.push('first pill not active');
  if (s.pills.slice(1).some(p => p.pressed !== 'false' || p.active)) problems.push('other pills active');
  if (!s.pills.every(p => p.radius === '9999px')) problems.push('pill radius ' + first.radius);
  if (!s.pills.every(p => p.h >= 38)) problems.push('pill height ' + s.pills.map(p => p.h).join(','));
  if (!s.pills.every(p => p.fs === '13px')) problems.push('pill font ' + first.fs);
  // Hero count still derives from the cards.
  if (s.heroProjectsTarget !== '1') problems.push('hero projects target ' + s.heroProjectsTarget);
  // Width.
  if (s.docW > s.clientW) problems.push('overflow ' + s.docW + '>' + s.clientW);
  if (problems.length) { fail++; console.log('FAIL', r.lang, r.scheme, r.width, problems.join(' | ')); }
  else console.log('ok', r.lang, r.scheme, r.width, 'card=' + c.box.w + 'x' + c.box.h, 'grid=' + s.gridW,
    'image=' + c.image.h, 'mark=' + c.mark.w, 'tech=' + c.tech.length, 'pills=' + s.pills.map(p => p.text).join('/'),
    'docW=' + s.docW + '/' + s.clientW);
}
console.log('--- filters');
for (const [k, v] of Object.entries(d.filters)) console.log(' ', k, JSON.stringify(v));
const h = d.runs.find(x => x.hover);
console.log('--- hover');
console.log('  before', JSON.stringify(h.hover.before));
console.log('  over  ', JSON.stringify(h.hover.over));
console.log('  after ', JSON.stringify(h.hover.after));
const k = d.runs.find(x => x.keyboard);
console.log('--- keyboard');
console.log(' ', JSON.stringify(k.keyboard));
const n = d.runs.find(x => x.narrow);
console.log('--- 320px:', 'clientW=' + n.narrow.clientW, 'docW=' + n.narrow.docW,
  'cardW=' + n.narrow.cards[0].box.w, 'cardL=' + n.narrow.cards[0].box.l, 'cardR=' + n.narrow.cards[0].box.r,
  'overflow=' + (n.narrow.docW > n.narrow.clientW ? 'YES' : 'no'));
const nojs = d.runs.find(x => x.nojs);
console.log('--- no-JS:', JSON.stringify(nojs.nojs));
const rm = d.runs.find(x => x.reducedMotion);
console.log('--- reduced motion:', JSON.stringify(rm.reducedMotion));
console.log('failures', fail);

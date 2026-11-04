// Turns English-keyed translation calls into label-keyed ones, for code written before labels (1.34 and
// older): tr('Delivery: about a month') → tr('pnis.delivery_about_a_month'), trn('{n} POP','{n} POPs',n)
// → trn('common.n_pop',n), and data-i18n markup → data-i18n="page.…". It is how src/ got its labels, and
// transforms.js runs it on old branches so their work lines up with src/ (see port-branch.js).
//
// Labels for text that already has one come from `known` (the English dictionary, src/i18n/en.js);
// new text gets a label made from its first words and where it is used, the same way every time.
const vm = require('node:vm');

const LIT = String.raw`'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|\x60(?:[^\x60\\$]|\\.|\$(?!\{))*\x60`;
const CALL = new RegExp(String.raw`(?<![\w$.])(tr|trn|N_)\(\s*(${LIT})(?:\s*,\s*(${LIT}))?`, 'g');
const CTX = vm.createContext({});
const literal = (s) => vm.runInContext(s, CTX);

const hash = (t) => { let h = 2166136261; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16).padStart(8, '0'); };
// "<b>Laser shortage!</b> {n} days…" → "laser_shortage_n_days"
function slug(text) {
  const words = text.replace(/<[^>]*>/g, ' ').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean);
  let s = '';
  for (const w of words) { if (s && (s + '_' + w).length > 36) break; s = s ? s + '_' + w : w; if (s.split('_').length >= 6) break; }
  return s || 'x';
}
// "game/70-rules/30-pnis.js" → "pnis"; the shell → "page".
const areaOf = (file) => file === 'index.html' ? 'page' : file.split('/').pop().replace(/^\d+-/, '').replace(/\.[a-z]+$/, '').replace(/-/g, '_');
const folderOf = (file) => file === 'index.html' ? 'page' : file.split('/').slice(0, -1).pop().replace(/^\d+-/, '').replace(/-/g, '_');
// A plural is keyed by both forms.
const pkey = (one, other) => `${one}\u0000${other}`;

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (m, e) => ENT[e]);

// Every translatable text in the partials: [{file, kind:'call'|'markup'|'attr', key, one, other, …}].
function scan(parts) {
  const out = [];
  for (const [file, text] of parts) {
    if (file.endsWith('.js') || file === 'index.html') {
      for (const m of text.matchAll(CALL)) {
        if (file === 'index.html' && !inScript(text, m.index)) continue;
        if (m[1] === 'trn') {
          if (!m[3]) throw new Error(`${file}: trn() needs two literal forms: ${m[0].slice(0, 60)}`);
          const one = literal(m[2]), other = literal(m[3]);
          out.push({ file, kind: 'call', fn: 'trn', key: pkey(one, other), one, other, at: m.index + m[0].indexOf(m[2]), end: m.index + m[0].length });
        } else {
          const t = literal(m[2]);
          out.push({ file, kind: 'call', fn: m[1], key: t, text: t, at: m.index + m[0].indexOf(m[2]), end: m.index + m[0].indexOf(m[2]) + m[2].length });
        }
      }
    }
    if (file === 'index.html') {
      for (const m of text.matchAll(/<([a-z][a-z0-9]*)\b([^>]*?)\sdata-i18n>([^<]*)<\/\1>/g)) {
        out.push({ file, kind: 'markup', key: decode(m[3]), text: decode(m[3]), at: m.index + m[0].indexOf(' data-i18n>'), end: m.index + m[0].indexOf(' data-i18n>') + ' data-i18n'.length });
      }
      for (const m of text.matchAll(/<[a-z][a-z0-9]*\b[^>]*>/g)) {
        if (inScript(text, m.index)) continue;
        for (const a of m[0].matchAll(/\s(aria-label|title)="([^"]*)"/g)) {
          const pos = m.index + a.index + a[0].length;
          out.push({ file, kind: 'attr', attr: a[1], key: decode(a[2]), text: decode(a[2]), at: pos, end: pos });
        }
      }
    }
  }
  return out;
}
// Inside one of the shell's <script> elements (the language loader), where text is code, not markup.
function inScript(html, i) {
  const open = html.lastIndexOf('<script', i), close = html.lastIndexOf('</script>', i);
  return open > close;
}

// Labels for every text in the scan: known ones from `known` (Map key → label), new ones made here.
function assign(items, known) {
  const labels = new Map(known), taken = new Set(known.values());
  const files = new Map();
  for (const it of items) { if (!files.has(it.key)) files.set(it.key, new Set()); files.get(it.key).add(it.file); }
  for (const it of items) {
    if (labels.has(it.key)) continue;
    const fs = [...files.get(it.key)];
    const folders = new Set(fs.map(folderOf));
    // Short, plain words ("Off", "Close", "Customers") are shared vocabulary wherever they appear.
    const short = !/[{<]/.test(it.one ?? it.text) && slug(it.one ?? it.text).split('_').length <= 2;
    const area = short ? 'common' : fs.length === 1 ? areaOf(fs[0]) : folders.size === 1 ? [...folders][0] : 'common';
    const base = `${area}.${slug(it.one ?? it.text)}`;
    let l = base;
    if (taken.has(l)) l = `${base}_${hash(it.key).slice(0, 4)}`;
    if (taken.has(l)) l = `${base}_${hash(it.key)}`;
    labels.set(it.key, l);
    taken.add(l);
  }
  return labels;
}

// Rewrites the partials to use labels. Returns {parts, en}: en maps each label to its English
// (a string, or {one, other} for plurals), for every text these partials use.
function labelize(parts, known = new Map()) {
  const items = scan(parts);
  const labels = assign(items, known);
  const en = new Map();
  const byFile = new Map();
  for (const it of items) {
    const l = labels.get(it.key);
    en.set(l, it.fn === 'trn' ? { one: it.one, other: it.other } : it.text);
    if (!byFile.has(it.file)) byFile.set(it.file, []);
    byFile.get(it.file).push({ ...it, label: l });
  }
  const out = parts.map(([file, text]) => {
    const list = (byFile.get(file) || []).sort((a, b) => b.at - a.at);
    for (const it of list) {
      const rep = it.kind === 'call' ? `'${it.label}'`
        : it.kind === 'markup' ? ` data-i18n="${it.label}"`
          : ` data-i18n-${it.attr}="${it.label}"`;
      text = text.slice(0, it.at) + rep + text.slice(it.end);
    }
    return [file, text];
  });
  return { parts: out, en, labels };
}

// The `known` map from an English dictionary object {label: text | {one, other}}.
function knownFrom(enDict) {
  const k = new Map();
  for (const [l, v] of Object.entries(enDict || {})) k.set(typeof v === 'string' ? v : pkey(v.one, v.other), l);
  return k;
}

// A dictionary keyed by English text (it.js before labels) → keyed by label, using the labels made above.
function relabelDict(old, labels) {
  const out = {};
  for (const [key, l] of labels) {
    if (key.includes('\u0000')) {
      const [one, other] = key.split('\u0000');
      if (typeof old[one] === 'string' && typeof old[other] === 'string') out[l] = { one: old[one], other: old[other] };
    } else if (typeof old[key] === 'string') out[l] = old[key];
  }
  return out;
}

module.exports = { labelize, knownFrom, relabelDict, scan, slug, pkey, CALL, LIT };

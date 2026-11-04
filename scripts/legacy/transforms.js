// Tidying applied right after the split, to cut down merge conflicts. Each one keeps behaviour the same
// and only changes where code sits or how a literal is laid out. They run as part of
// split-index-html.js, so work from older branches lines up with src/ when it is ported.
//
// 1. The ACT map (every player action) becomes one file per area under game/90-actions/: the first file
//    declares `const ACT={…}` and the others add to it with Object.assign. Two people adding actions in
//    different areas no longer touch the same lines.
// 2. Coordinate tables that lived on one very long line (CITY_LL, CITY_NUDGE, LANDS_LL) get one entry per
//    line, CITY_LL and CITY_NUDGE sorted by id: adding a city no longer edits a 4,000-character line
//    that everyone else is editing too.
// 3. Translations are keyed by labels, not by English text (labels.js): tr('pnis.delivery_month') with the
//    English in src/i18n/en.js, inlined into the page by an `<!-- @include i18n -->` line in the shell.

// [file, first action in it]. A group runs until the next group's first action.
const ACT_GROUPS = [
  ['game/90-actions/10-interface.js', 'speed'],
  ['game/90-actions/20-pops-transit-ix.js', 'buildPop'],
  ['game/90-actions/30-route-script-and-tools.js', 'teEdit'],
  ['game/90-actions/40-sites-peering-caches.js', 'addSite'],
  ['game/90-actions/50-customers.js', 'advertise'],
  ['game/90-actions/60-links.js', 'upLink'],
  ['game/90-actions/70-dashboard-lists.js', 'custGo'],
  ['game/90-actions/80-security-and-china.js', 'applyCn'],
  ['game/90-actions/85-routing-and-routers.js', 'via'],
  ['game/90-actions/87-fiber-and-hardware.js', 'dfMode'],
  ['game/90-actions/89-game-and-settings.js', 'randomName'],
];

function splitActions(text) {
  const lines = text.split('\n');
  if (lines[lines.length - 1] === '') lines.pop();
  const open = lines.indexOf('const ACT={'), close = lines.lastIndexOf('};');
  if (open < 0 || close < open) throw new Error('90-actions: no `const ACT={ … };` block');
  // Old versions without the action-helpers cut keep that code here; it stays after the last group.
  const after = lines.slice(close + 1);
  const keyAt = (k) => lines.findIndex((l, i) => i > open && i < close && l.startsWith(` ${k}:`));
  // A group whose first action does not exist (yet, in an older version) is left out.
  const groups = ACT_GROUPS.map(([file, k], g) => [file, g ? keyAt(k) : 0]).filter(([, i]) => i >= 0);
  const starts = groups.map(([, i]) => i);
  if (starts.some((s, i) => i && s <= starts[i - 1])) throw new Error('90-actions: actions are out of the expected order');
  return groups.map(([file], g) => {
    const from = g ? starts[g] : 0, to = g + 1 < starts.length ? starts[g + 1] : close;
    const body = lines.slice(from, to);
    const out = g ? ['Object.assign(ACT,{', ...body, '});'] : [...body, '};'];
    if (g === groups.length - 1) out.push(...after);
    return [file, out.join('\n') + '\n'];
  });
}

// The top-level entries of an array or object literal source "a,b,c" (no brackets around it).
function entries(src) {
  const out = [];
  let depth = 0, q = null, start = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') q = c;
    else if ('[{('.includes(c)) depth++;
    else if (']})'.includes(c)) depth--;
    else if (c === ',' && depth === 0) { out.push(src.slice(start, i).trim()); start = i + 1; }
  }
  if (depth || q) throw new Error('unbalanced literal');
  const last = src.slice(start).trim();
  if (last) out.push(last);
  return out;
}

const idOf = (e) => e.match(/^["']?([\w$]+)["']?\s*:/)[1];
const byId = (a, b) => (idOf(a) < idOf(b) ? -1 : idOf(a) > idOf(b) ? 1 : 0);

// `HEAD{entries}TAIL` on one line → HEAD, one entry per line, TAIL. Lines that don't match stay as they are.
function oneLine(text, re, { sort = false, indent = ' ' } = {}) {
  return text.split('\n').map((l) => {
    const m = re.exec(l);
    if (!m) return l;
    let es = entries(m[2]);
    if (sort) {
      // Sorting is only safe without duplicate keys (with duplicates, the last one wins).
      const ids = es.map(idOf);
      if (new Set(ids).size !== ids.length) throw new Error(`duplicate keys in ${m[1]}`);
      es = es.slice().sort(byId);
    }
    return [m[1], ...es.map((e) => indent + e + ','), m[3]].join('\n');
  }).join('\n');
}

function tidy(parts) {
  const out = [];
  for (const [file, text] of parts) {
    if (file === 'game/90-actions/00-actions.js') out.push(...splitActions(text));
    else if (file === 'game/20-world/40-city-coords.js') out.push([file, oneLine(text, /^(const CITY_LL=\{)(.*)(\};)$/, { sort: true })]);
    else if (file === 'game/20-world/50-cities.js') out.push([file, oneLine(text, /^(const CITY_NUDGE=\{)(.*)(\};)$/, { sort: true })]);
    else if (file === 'game/20-world/20-landmasses.js') {
      out.push([file, oneLine(oneLine(text, /^(const LANDS_LL=\[)(.*)(\];)$/), /^(LANDS_LL\.push\()(.*)(\);)$/)]);
    } else out.push([file, text]);
  }
  return out;
}

const EN_HEADER = `// English: the text of every label the game uses (in tr(), trn() and N_() calls in src/, and data-i18n in src/index.html).
// Inlined into the page at build. One entry per line, sorted by label; plurals are {"one":…,"other":…}.
// Add or change text with scripts/i18n-add.js, check with npm run i18n:check.
`;

// All the tidying, plus labels. `known` maps English text to the labels src/ already has, so text that
// exists today keeps its label (default: the current src/i18n/en.js). Returns the parts and the labels used.
function transformFull(parts, known) {
  const D = require('../lib/dict');
  const { labelize, knownFrom } = require('./labels');
  if (!known) known = knownFrom(require('node:fs').existsSync(D.fileOf('en')) ? D.read('en').dict : {});
  const { parts: labelled, en, labels } = labelize(tidy(parts), known);
  const out = labelled.map(([file, text]) => file === 'index.html'
    ? [file, text.replace('<!-- @include game -->', '<!-- @include i18n -->\n<!-- @include game -->')] : [file, text]);
  out.push(['i18n/en.js', D.format('en', EN_HEADER, Object.fromEntries(en))]);
  return { parts: out, labels };
}

const transform = (parts, known) => transformFull(parts, known).parts;

module.exports = { transform, transformFull, tidy, entries };

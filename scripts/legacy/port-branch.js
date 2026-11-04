#!/usr/bin/env node
// Carries a branch that still edits site/index.html (started before the page was split into src/) over
// to the src/ layout. Run it in the middle of merging main into that branch:
//
//   git checkout my-branch
//   git merge origin/main                        # stops: site/index.html was deleted on main
//   node scripts/legacy/port-branch.js           # moves your edits into src/, merges the dictionaries
//   git status                                   # fix any conflict markers it reports, then
//   git commit
//
// How: your branch's site/index.html and the one you started from are both split with the same rules
// that made src/ (split-index-html.js + transforms.js), and each partial gets a three-way merge
// (git merge-file) into the src/ file from main. Your dictionary changes (site/i18n/*.js) are applied
// entry by entry onto main's sorted dictionaries, so appended lines never conflict. Text keyed by English
// (1.34 and older) gets the labels src/ uses, and new text gets new labels in src/i18n/en.js (labels.js).
//
// It also works the other way round, merging commits made on the old layout into a branch that has src/.
// Options: --base REF (the pre-split commit the old-layout side started from; default: merge-base of HEAD
// and MERGE_HEAD) and --theirs REF (the old-layout side; default: whichever side has site/index.html).
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const { split } = require('./split-index-html');
const { transformFull } = require('./transforms');
const { relabelDict } = require('./labels');
const D = require('../lib/dict');

const ROOT = path.join(__dirname, '..', '..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'pipe'] });
const show = (ref, p) => { try { return git('show', `${ref}:${p}`); } catch { return null; } };
const die = (m) => { console.error(`port-branch: ${m}`); process.exit(1); };

let mergeHead = null;
try { mergeHead = git('rev-parse', '-q', '--verify', 'MERGE_HEAD').trim(); } catch {}
// Works in both directions: merging main into an old branch, or old-layout commits into a src/ branch.
// "theirs" is the side that still has site/index.html; the other side (with src/) is the target.
const hasSrc = (ref) => show(ref, 'src/index.html') !== null;
const theirs = opt('--theirs', null) || (mergeHead && hasSrc('HEAD') ? mergeHead : 'HEAD');
const target = mergeHead ? (theirs === mergeHead ? 'HEAD' : mergeHead) : null;
const base = opt('--base', null) || (mergeHead ? git('merge-base', 'HEAD', mergeHead).trim() : null);
if (!base) die('no merge in progress: run `git merge origin/main` first, or pass --base REF');
if (!fs.existsSync(path.join(ROOT, 'src', 'index.html'))) die('src/ is missing: merge main (which has src/) first');

const basePage = show(base, 'site/index.html'), theirPage = show(theirs, 'site/index.html');
if (!basePage) die(`${base} has no site/index.html; is it from before the split?`);
if (!theirPage) die(`${theirs} has no site/index.html; nothing to port`);

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tubes-port-'));
const parts = (html, label) => {
  try { const r = transformFull(split(html)); return Object.assign(new Map(r.parts), { labels: r.labels }); }
  catch (e) { die(`could not split ${label}'s site/index.html the way src/ was made: ${e.message}`); }
};
const B = parts(basePage, 'the base'), T = parts(theirPage, 'your branch');
let changed = 0;
const conflicts = [];
// Applies the entries that changed between two dictionaries onto a third, reporting entries changed on both sides.
const same = (x, y) => JSON.stringify(x) === JSON.stringify(y);   // plurals are objects
function applyDelta(db, dt, dict, rel) {
  let n = 0;
  for (const k of new Set([...Object.keys(db), ...Object.keys(dt)])) {
    if (same(db[k], dt[k])) continue;
    if (k in dict && !same(db[k], dict[k]) && !same(dict[k], dt[k]) && k in dt) conflicts.push(`${rel}: ${JSON.stringify(k)} changed on both sides (kept yours)`);
    if (k in dt) dict[k] = dt[k]; else delete dict[k];
    n++;
  }
  return n;
}
for (const [file, t] of T) {
  const b = B.get(file);
  if (b === t) continue;   // you did not touch this part
  if (file === 'i18n/en.js') {
    // English is merged entry by entry, like the translations below.
    const e = D.read('en');
    const n = applyDelta(b ? D.parse(b, 'en') : {}, D.parse(t, 'en'), e.dict, 'src/i18n/en.js');
    D.write('en', e.dict, e.header);
    git('add', 'src/i18n/en.js');
    console.log(`src/i18n/en.js: ${n} of your entries applied`);
    continue;
  }
  const ours = path.join(ROOT, 'src', file);
  if (!fs.existsSync(ours)) { conflicts.push(`${file} (no longer exists on main; apply your change by hand)`); continue; }
  const fb = path.join(tmp, 'base'), ft = path.join(tmp, 'theirs');
  fs.writeFileSync(fb, b || '');
  fs.writeFileSync(ft, t);
  const r = spawnSync('git', ['merge-file', '-L', 'main', '-L', 'base', '-L', 'your branch', ours, fb, ft], { cwd: ROOT });
  changed++;
  if (r.status !== 0) conflicts.push(`src/${file}`);
}

// Text your side still uses (for example inside a conflict) whose English main has since changed or dropped:
// keep its English, so whichever side of the conflict you keep has its text.
{
  const tEn = T.get('i18n/en.js') ? D.parse(T.get('i18n/en.js'), 'en') : {};
  const e = D.read('en');
  const used = new Set();
  for (const f of require('../lib/page').listFiles(path.join(ROOT, 'src'))) {
    if (f === 'i18n/en.js') continue;
    for (const m of fs.readFileSync(path.join(ROOT, 'src', f), 'utf8').matchAll(/['"]([a-z0-9_]+(?:\.[a-z0-9_]+)+)['"]/g)) used.add(m[1]);
  }
  const back = [...used].filter((l) => !(l in e.dict) && l in tEn);
  if (back.length) { for (const l of back) e.dict[l] = tEn[l]; D.write('en', e.dict, e.header); git('add', 'src/i18n/en.js'); }
}

// Dictionaries: your additions, edits and removals, applied onto main's sorted files.
for (const lang of D.langs()) {
  const rel = `site/i18n/${lang}.js`;
  const tb = show(base, rel), tt = show(theirs, rel);
  if (!tt || tb === tt) continue;
  // Old dictionaries are keyed by English text: give them the same labels the code got.
  const old = (t, labels) => { const d = D.parse(t, lang); return Object.keys(d).some((k) => /\s/.test(k)) ? relabelDict(d, labels) : d; };
  const db = tb ? old(tb, B.labels) : {}, dt = old(tt, T.labels);
  const main = target ? show(target, rel) : null;
  // During a merge the working file may hold conflict markers, so start from main's own copy.
  const { header, dict } = main ? { header: main.slice(0, main.indexOf('(window.I18N')), dict: D.parse(main, lang) } : D.read(lang);
  const n = applyDelta(db, dt, dict, rel);
  D.write(lang, dict, header);
  git('add', rel);
  console.log(`${rel}: ${n} of your entries applied`);
}

if (fs.existsSync(path.join(ROOT, 'site', 'index.html'))) fs.rmSync(path.join(ROOT, 'site', 'index.html'));
try { git('rm', '-q', '--cached', '--ignore-unmatch', 'site/index.html'); } catch {}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Ported your site/index.html changes into ${changed} file(s) under src/.`);
if (conflicts.length) {
  console.log('Resolve these by hand (look for <<<<<<< markers), then git add them:');
  for (const c of conflicts) console.log(`  ${c}`);
  process.exit(1);
}
git('add', 'src');
console.log('No conflicts. Run npm test, then git commit.');

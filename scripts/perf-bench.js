#!/usr/bin/env node
// Performance benchmark on a very large network (tests/fixtures/big-network.json).
//
//   node scripts/perf-bench.js                                  time this checkout
//   node scripts/perf-bench.js --base OLD.html                  compare OLD.html (e.g. main) with this checkout
//   node scripts/perf-bench.js --base OLD.html --md out.md --summary "$GITHUB_STEP_SUMMARY"
//   node scripts/perf-bench.js --save my-export.json --base OLD.html    a player's save (plain or exported from the menu)
//
// Both versions load the same save in one process and are timed in alternating turns, so a busy machine slows
// them equally. Each number is the median of several runs. It also says whether both versions route the save's
// traffic identically, which catches unintended gameplay changes in a "pure speed" PR.
// Headless (jsdom, a recording canvas): it measures our JavaScript, not the browser's painting.
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('../tests/harness');

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const ROOT = path.join(__dirname, '..');
const HEAD = opt('--head', path.join(ROOT, 'site', 'index.html'));
const BASE = opt('--base', null);
const RUNS = +opt('--runs', 7);
// A plain save, or a file from the in-game "Export save", which wraps it as {app, version, exported, S}.
const RAW = JSON.parse(fs.readFileSync(opt('--save', path.join(ROOT, 'tests', 'fixtures', 'big-network.json')), 'utf8'));
const SAVE = JSON.stringify(RAW && RAW.app === 'series-of-tubes' && RAW.S ? RAW.S : RAW);

// What we time. Each body runs inside the game page; panels flip between two selections so nothing can be
// skipped as "unchanged".
const METRICS = [
  ['compute', 'Routing: compute()', 'compute()'],
  ['day', 'One game day: dayTick()', 'S.nextFail=S.day+99;S.nextEvent=S.day+99;dayTick()'],
  ['action', 'An action: after()', 'after()'],
  ['panels', 'Side panel and left list', "__flip=!__flip;UI.sel={type:'city',id:__flip?'fra':'ams'};UI.tab=__flip?'peer':'up';UI.left=__flip?'nets':'noc';UI.leftOpen=true;renderPanel();renderLeft()"],
  ['dash', 'NOC dashboard tabs', "$('dash').hidden=false;for(const k of ['overview','conn','traffic','infra','cust']){UI.dtab=k;renderDash();}$('dash').hidden=true"],
  ['map', 'Map at three zoom levels', "for(const z of [1,3.2,7]){cam.x=CITY.fra.x;cam.y=CITY.fra.y;cam.z=z;draw(0);}"],
];

function open(file) {
  const { ev, errors } = load({ file, seed: 777 });
  ev(`window.__flip=false;S=migrate(JSON.parse(${JSON.stringify(SAVE)}));UI.started=true;UI.pitched=true;UI.speed=0;closeModal();compute();renderAll();`);
  const time = (body) => ev(`(()=>{const t=performance.now();${body};return performance.now()-t;})()`);
  // What the network carries, to tell a pure speed-up from a change in how traffic is routed.
  const outcome = () => ev(`(()=>{compute();const r=[R.served,R.demand,R.reach,R.peered,JSON.stringify(R.egT),...Object.keys(R.citySrv).sort().map(c=>R.citySrv[c]),...S.links.map(l=>R.load[l.id]||0)];
    return r.map(x=>typeof x==='number'?x.toFixed(6):x).join('|');})()`);
  const size = JSON.parse(ev("JSON.stringify({pops:Object.keys(S.pops).length,links:S.links.length,pni:S.pni.length,caches:S.caches.length,customers:S.biz.length,ix:Object.keys(S.ixp).length})"));
  return { ev, errors, time, outcome, size };
}

const median = (a) => { const s = [...a].sort((x, y) => x - y); return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2; };
const ms = (x) => x >= 100 ? x.toFixed(0) : x >= 10 ? x.toFixed(1) : x.toFixed(2);

const head = open(HEAD), base = BASE ? open(BASE) : null;
const sameOutcome = base ? base.outcome() === head.outcome() : null;
const res = {};
for (const [k, , body] of METRICS) {
  const h = [], b = [];
  for (const v of [head, base].filter(Boolean)) { v.time(body); v.time(body); }   // warm up
  for (let i = 0; i < RUNS; i++) {
    // Alternate who goes first, so drift over the run lands on both sides.
    if (base && i % 2) { b.push(base.time(body)); h.push(head.time(body)); } else { h.push(head.time(body)); if (base) b.push(base.time(body)); }
  }
  res[k] = { head: median(h), base: base ? median(b) : null };
}
const errs = [...head.errors, ...(base ? base.errors : [])];

// Verdicts: small absolute differences are noise, whatever the percentage.
const verdict = (r) => {
  if (r.base == null) return '';
  const ratio = r.head / (r.base || 1e-9), diff = r.head - r.base;
  if (Math.abs(diff) < 2) return '≈';
  if (ratio >= 1.5) return '🔴 slower';
  if (ratio >= 1.15) return '⚠️ slower';
  if (ratio <= 0.85) return '🟢 faster';
  return '≈';
};
const pct = (r) => r.base == null ? '' : `${r.head >= r.base ? '+' : ''}${(((r.head - r.base) / (r.base || 1e-9)) * 100).toFixed(0)}%`;
const s = head.size;
let md = `## Performance on a big network\n\n${s.pops} POPs · ${s.links} links · ${s.pni} PNIs · ${s.caches} cache boxes · ${s.ix} IX ports · ${s.customers} customers. Median of ${RUNS} runs, in milliseconds, headless.\n\n`;
md += base ? '| What | Base | This PR | Change | |\n|---|--:|--:|--:|---|\n' : '| What | Time |\n|---|--:|\n';
for (const [k, label] of METRICS) {
  const r = res[k];
  md += base ? `| ${label} | ${ms(r.base)} | ${ms(r.head)} | ${pct(r)} | ${verdict(r)} |\n` : `| ${label} | ${ms(r.head)} |\n`;
}
if (base) {
  md += `\n${sameOutcome ? '✅ Routing results are identical to the base.' : '⚠️ Routing results differ from the base: traffic is carried differently. Expected if this PR changes gameplay; a bug if it only promises to be faster.'}\n`;
  const slow = METRICS.filter(([k]) => /slower/.test(verdict(res[k])));
  md += slow.length ? `\n**Slower:** ${slow.map(([, l]) => l).join(', ')}. Please explain or fix before merging.\n` : '\nNo slowdowns beyond noise.\n';
}
if (errs.length) md += `\n⚠️ Page errors while benchmarking:\n\n${errs.slice(0, 5).map((e) => '- `' + String(e).slice(0, 200).replace(/`/g, "'") + '`').join('\n')}\n`;
md += `\n<sub>scripts/perf-bench.js · jsdom with a recording canvas: our JavaScript, not the browser's painting. Below about 2 ms, differences are noise.</sub>\n`;

console.log(md);
const out = opt('--md', null); if (out) fs.writeFileSync(out, md);
const sum = opt('--summary', null); if (sum) fs.appendFileSync(sum, md + '\n');
const js = opt('--json', null); if (js) fs.writeFileSync(js, JSON.stringify({ size: s, runs: RUNS, results: res, sameOutcome, errors: errs }, null, 2));

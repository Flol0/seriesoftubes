---
name: performance
description: Measure and demonstrate the performance of every Series of Tubes change on a very large network, compare it with main, and report the numbers.
---

# Performance is always demonstrated

Every change to the game (anything in `site/`) shows its performance on a very large network,
compared with `main`, before it is merged or released. A speed claim without numbers does not
count, and neither does "it feels fine on my small game". Most players who complain about lag
have huge late-game networks, and most of them are on phones.

## Measure

```bash
git show origin/main:site/index.html > /tmp/base.html
npm run perf -- --base /tmp/base.html          # about a minute
```

`scripts/perf-bench.js` loads `tests/fixtures/big-network.json` (about 100 POPs, 150 links,
950 PNIs, 830 cache boxes, 110 IX ports, 170 customers) into the base and into this checkout, in
one process, and times them in alternating turns. It prints a Markdown table (median of 7 runs):

- Routing: `compute()`
- One game day: `dayTick()`
- An action: `after()`
- Side panel and left list
- NOC dashboard tabs
- Map at three zoom levels

and says whether both versions route the save's traffic identically.

Without `--base` it just times this checkout. `--runs N`, `--md FILE`, `--json FILE` and
`--summary FILE` are there for CI and for digging.

`--save FILE` swaps the fixture for another save, such as a laggy save from a bug report. Both a plain
save and a file from the in-game menu's Export save work:

```bash
npm run perf -- --save ~/Downloads/series-of-tubes-save.json --base /tmp/base.html
```

Routing speed-ups must also keep the two equivalence tests green: `tests/speed.test.js` (the fast
path against the same code with its shortcuts switched off) and `tests/routing-reference.test.js`
(the indexed exit choice against a plain scan of every exit, across preferences, RouteScript,
incidents and failures).

## Demonstrate

- **Every pull request**: the Performance workflow runs the same comparison and posts the table as a
  comment on the PR (updated on every push). Read it before merging. Locally, paste the table into
  the PR description or the commit summary you report.
- **Everything you hand back to Frederic** that touched `site/`: include the table, or at least the
  rows that moved, in your summary. Say plainly when something got slower.
- **Before a release**: compare the release against the previous tag
  (`git show v<last>:site/index.html > /tmp/base.html`) and mention notable changes.

## Read the table

- Below about 2 ms, differences are noise. The verdicts already ignore them.
- A busy machine can swing a single row by ±20% on identical code. When a verdict looks surprising
  for what the change touches, rerun with `--runs 15` before reporting it, and report both runs.
- ⚠️ slower (15% or more) or 🔴 slower (50% or more) needs a reason in the PR, or a fix. A new
  feature may cost time; a refactor or a fix should not.
- "Routing results differ" is expected when a change is meant to change gameplay (new cities,
  balance, routing rules), and a bug when it only promises to be faster.
- It is headless (jsdom with a recording canvas): it measures our JavaScript, not the browser's
  painting. For drawing changes, also look at the game on a phone.

## Keeping the fixture useful

The save loads through `migrate()` like any player's save, so new state gets its defaults. Only
regenerate it (`node scripts/perf-fixture.js`, several minutes) when the save format changes in a
way old saves cannot load, or the game grows new heavy systems the save does not exercise. Say in
the commit that the baseline changed, because numbers before and after are no longer comparable.

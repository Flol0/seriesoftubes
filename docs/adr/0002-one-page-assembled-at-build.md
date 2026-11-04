# ADR 0002: Source in many files, shipped as one page assembled at build

- Status: accepted
- Date: 2026-10-27

## Context

Until 1.34 the whole game was `site/index.html`: about 900 KB and 5,100 lines of HTML, CSS and JavaScript
in one file, edited by many contributors at once. Nearly every pull request touched that file, so
pull requests conflicted with each other all the time, reviews meant scrolling a 900 KB file, and
nobody could tell from a diff's file list what a change was about.

What had to stay: hosting on GitHub Pages ([ADR 0001](0001-github-pages-only.md)), load time and in-game
speed (most players are on phones), saves, the tests that reach into the page's globals (`S`, `R`,
`ACT`, `compute()`), and no new runtime dependencies.

## Decision

- The page's source lives in `src/`: a shell (`src/index.html`) with `<!-- @include DIR -->` lines,
  the styles in `src/styles/*.css` and the game script in `src/game/**/*.js`.
- `scripts/lib/page.js` assembles them by **plain concatenation in path order** into the same single,
  self-contained `index.html` as before: one inline `<style>`, one inline classic `<script>`.
  The numeric prefixes (`10-`, `20-`…) set that order; gaps leave room to add files in between.
- `scripts/build.js` builds `_site/` from that page plus the static files in `site/`.
- Nothing else changes at runtime. When the split landed, the assembled page was byte-for-byte the old
  `site/index.html`.

## Why concatenation, and not ES modules or a bundler

- **Zero runtime cost.** One HTML request, as before. ES modules would mean many requests (or a bundler),
  module graph evaluation and a new loading order; at best they break even.
- **The code is one script on purpose.** The partials share top-level names (`S`, `R`, `UI`, `CITY`,
  `tr`…) and function declarations are hoisted across the whole script. Concatenated, every partial
  sees exactly what it saw before, with no `import`/`export` lists to keep in sync (another source of
  conflicts) and no circular-import pitfalls.
- **Tests keep working.** jsdom loads the assembled page, and tests still call into its globals and
  patch functions by their source text.
- **No dependencies.** The assembler is about a hundred lines of Node with nothing to install, so it
  runs anywhere `npm test` does, including GitHub Actions.
- **It is reversible.** If a bundler is ever worth it, the partials are already the modules it needs.

## Rules that come with it

- **Order matters for top-level code.** `const`/`let` and statements at the top level of a partial run
  in path order, so a partial can only use top-level *values* from partials that come before it (or
  inside functions that run later, after boot). Functions can be called from anywhere once the page
  has loaded.
- **A partial is a complete set of statements.** Each file ends with a newline and never closes the
  `<script>`/`<style>` it is pasted into; the assembler refuses files that break this.
- **Put new code where its topic is.** A new feature gets its own partial in the right folder (for
  example `src/game/70-rules/85-my-feature.js`), its actions go in the matching
  `src/game/90-actions/*.js`, its panel in `src/game/93-ui/` or `src/game/94-dashboard/`. Small files
  that own one topic are what keep pull requests apart.
- **Keep lists one entry per line.** Tables people add to (cities, cables, networks, dictionaries) have
  one entry per line, and the id-keyed ones are sorted, so additions land in different places.
- **The CHANGELOG is the one shared file every change touches**, on purpose: one bullet per change under
  `## [Unreleased]`. A conflict there is expected and easy: keep both bullets.

## Consequences

- Development needs one command: `npm run dev` serves the page assembled on every request and reloads
  the browser on save. Opening a file straight from disk no longer runs the game.
- Error line numbers in the browser refer to the assembled page; the dev server prints the matching
  `src/` file and line in the console.
- Branches started before the split are carried over with `scripts/legacy/port-branch.js`
  (see CONTRIBUTING.md).
- The performance workflow builds the base's page from git with that commit's own assembler
  (`node scripts/lib/page.js --ref REF`), so base and head are always compared as players get them.

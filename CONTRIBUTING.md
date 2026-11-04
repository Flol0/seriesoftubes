# Contributing to Series of Tubes

Thanks for wanting to help build the cartoon internet. Bug reports, ideas, puns,
translations and code are all welcome.

Everyone is welcome here, and everyone follows our [Code of Conduct](CODE_OF_CONDUCT.md).
The short version: be excellent to each other.

## Reporting bugs and ideas

Open an issue on GitHub and pick the form that fits: bug report, feature request,
balance or realism, or translation. Blank issues are turned off so every report has
what we need to triage it. For bugs, an export of your save (menu → Export save)
lets us load your exact network. One topic per issue, please.

Ideas are best when they say what happens in real networks and how that could become
a fun mechanic.

The [Signal group](https://signal.group/#CjQKIJwvEt5fYt1pvw7J2pV664CyUyGJXmAJLV8ia3nUdAD7EhA_FzdxflEzkNmcvDHdVgLQ) is for hanging out with other players, not for
reports: anything meaningful (a bug, an idea, a balance problem) goes into an issue,
even if you first mentioned it in the chat. Things said only in Signal get lost.

## Development

The game is one static page with no framework, hosted on GitHub Pages. Its source is split into
small files under `src/` (styles in `src/styles/`, the game script in `src/game/`), which the build
joins, in path order, into a single `index.html`. Static files such as the translations live in `site/`.

```bash
npm ci                       # installs jsdom for the tests
npm run dev                  # http://localhost:8080, reloads when you save a file
npm test                     # all tests must pass
node scripts/i18n-check.js   # translations must be complete and sorted
npm run serve                # the production build, as GitHub Pages will serve it
```

Where things are, and how a day of the simulation runs: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

### Keeping pull requests apart

Many people work on the game at once. A few habits keep your pull request from colliding with theirs:

- Put a new feature in its own file in the folder of its topic (for example
  `src/game/70-rules/85-route-servers.js`), and its tests in their own `tests/<feature>.test.js`.
  New files in `src/` and `tests/` are picked up automatically; nothing needs registering.
- Add actions to the matching file in `src/game/90-actions/`, not wherever there is room.
- Lists (cities, cables, networks) take one entry per line; keep id-keyed tables sorted.
- Text is keyed by labels (`tr('pnis.ready_in_about_n_days')`, English in `src/i18n/en.js`). Add new
  text with `node scripts/i18n-add.js` rather than by hand: it writes the English and the translations
  and keeps every dictionary sorted, so your new strings don't land on the same lines as everyone
  else's. Fixing English wording no longer touches the translations.
- The `CHANGELOG.md` bullet is the one place everybody writes. If it conflicts, keep both bullets.

### Your branch still edits `site/index.html`?

Until version 1.34 the whole game was one file, `site/index.html`. If your branch was started before
the split, merge `main` and let a script move your changes into `src/`:

```bash
git fetch origin
git merge origin/main                    # stops: site/index.html was deleted on main
node scripts/legacy/port-branch.js       # moves your edits into the matching src/ files
git status                               # fix any conflict it lists, then
npm test && git commit
```

It splits your version of the page and the one you started from the same way `src/` was made (your
English text becomes labels too), merges each piece into `src/`, and applies your English and
dictionary changes entry by entry. It only reports conflicts
where your change and `main` touched the same lines.

## Pull requests

### Pick an issue labelled `implement`

Open issues are not a to-do list. Every issue is triaged first: some are accepted, some
still need discussion, some are left for the maintainer and some won't happen at all.
**Only issues labelled [`implement`](https://github.com/fjaeckel/seriesoftubes/labels/implement)
are open for outside contributions.** Pull requests for any other issue will be closed,
however good the code is. Say in the issue that you're taking it, so two people don't
build the same thing.

**Each account may have at most 4 open pull requests at a time, drafts included.**
GitHub won't let you open a fifth until one of them is merged or closed.

### A note on AI agents

AI tools are welcome as a helper, but please don't point an agent at the issue tracker
and let it open issues or pull requests on its own. We've had batches of automated
"fix all the issues" pull requests, which is why the limit above exists. Each one still
takes a human to read, check and close, and that time comes out of the game.

So: write issues yourself, about what *you* saw. Only open a pull request you have run,
tested and can explain. Automated issues and pull requests are closed without a detailed
review, and accounts that keep sending them may be blocked. A short, honest, human-written
contribution is always welcome, even if your English or your code isn't perfect yet.

### What every pull request needs

- Keep pull requests small: one small feature or one fix each, targeting `main`.
  Every pull request must be reviewable by a human in one sitting. Large drops,
  sweeping rewrites or many unrelated changes in one PR will be asked to be split up,
  and that applies just as much to AI-generated code.
- Add or update a test in `tests/` for every feature or fix. Tests are seeded and
  must not depend on luck.
- Add a bullet for players under `## [Unreleased]` in `CHANGELOG.md`, in plain English.
  Releases are cut by the maintainer.
- Show the performance of changes to `src/` on a big network. The Performance check posts a table
  comparing your PR with `main` as a comment; to run it yourself:
  `npm run perf -- --base-ref origin/main`
  (add `--browser` to also time it in Chromium as a desktop and a phone, like CI does).
  Anything marked slower needs an explanation.
- The game is hosted on GitHub Pages, and that will not change. Changes must work as plain static
  files: no server code, no other host, no redirects or custom headers (see
  [docs/adr/0001-github-pages-only.md](docs/adr/0001-github-pages-only.md)).
- Old saves must keep loading. New state needs a default for new games and a check in
  `sanitize()`.
- Check your change on a phone-sized screen (about 360 px wide). Most players are on
  phones.

## House rules for content

- **Every name is a pun.** No real company names for networks, vendors, cables, banks,
  data centers or exchanges. Real conference names (NANOG, RIPE, DENOG…) are fine.
  Please don't use lazy "-ish" names; find a proper pun or use a plain word.
- **Accurate underneath the jokes.** Mechanics should be recognisable to a network
  engineer: exaggerated, not invented.
- **Friendly humour.** Punch at technology, bureaucracy and ourselves, not at people.

## Translations

Every player-facing string goes through `tr()`, `trn()` or `N_()`. Dictionaries live
in `site/i18n/` (label → translation, one entry per line, sorted; the English for each label is in
`src/i18n/en.js`). To add a language, copy `it.js`, translate the values (`en.js` lists the same labels
in the same order), register the language in the language list in `src/index.html`, and run
`node scripts/i18n-check.js <lang>` until it reports nothing missing, unused or broken. The CI job "translations" runs the same check on every pull request, shows each language's coverage in the run summary, and also fails if a new language is not added to the language list or to the offline cache in `site/sw.js`.

Language pull requests must be reviewed by a human who speaks the language, and
checked in the game itself, not only in the dictionary file. Passing the checker is
not enough. The reviewer plays with the language switched on and looks for anything
that got worse:

- text overflowing buttons, panels or toasts, especially on phones
- truncated or broken layouts, missing placeholders, raw `{name}` or HTML showing
- awkward or machine-sounding phrasing, wrong networking terms
- puns and jokes that no longer land

Note in the pull request what you checked and on which screen sizes.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).

# Series of Tubes

**Build the internet, one tube at a time.** A free cartoon browser game about how
the internet really works. Play it at **[seriesoftub.es](https://seriesoftub.es)**.

![Series of Tubes](site/images/og-image.png)

You start with one router in one city and grow into a transit-free Tier 1:

- **Customers:** home broadband ("eyeballs"), enterprises, hosting, L2VPNs, DDoS
  protection, high-frequency traders with latency budgets, AI GPU data centers and
  hyperscaler DCI deals. Some come with very specific requirements.
- **Interconnection:** IP transit billed on the 95th percentile, internet exchanges
  with route servers, open/selective/restrictive/paid peering, PNIs, embedded CDN
  caches, and NNI fabrics for virtual circuits and remote peering.
- **Infrastructure:** leased waves on around 40 real-ish subsea cable systems,
  dark fiber (leased or self-built) lit with DWDM and ZR+ optics, router
  generations that cap your port speeds, and LAGs to bundle ports when one isn't enough.
- **Traffic engineering:** see exactly what fills each link, tune link metrics and
  egress preferences, and route traders over the fastest path and backups the scenic way.
- **Things break, constantly:** backhoes, sharks, fat fingers, route leaks, RPKI
  mishaps, DDoS, cooling failures, Red Sea and Baltic cable cuts, sanctions and
  sovereign internet drills.

Every company is a pun. No real company names are used.

## Additional gameplay and operations

- Customer satisfaction dashboard, early warnings, optional auto-pause,
  reviewable bandwidth expansions and a PNI meet-me-room directory.
- Metered POP power and cooling, UPS batteries, generator fuel, independent
  feeds, and automatic maintenance with notices in a persistent NOC event log.
- Colocation racks plus web, cloud and capacity-limited DDoS scrubbing servers.
- Scalable 100G/400G/1.6T cache pools, optional service-switch banks, shared
  uplink capacity, redundant pairs, LAGs, and purchase/capacity previews.
- Tier-1 proprietary submarine cables and optical regeneration for terrestrial
  dark fiber beyond 4,000 km, with construction and operating costs.
- Ten additional hubs with carriers, local networks, fabric access and cable
  routes; completed Italian connections and exchange names.
- Expanded endgame router, LAG, NNI, virtual-circuit, rack and own-IX capacity.
- iPad double-tap handling, preserved pinch zoom, map reset, wrapping city tabs,
  and fixes for routing/accounting, imported saves and impossible contracts.

See [CHANGELOG.md](CHANGELOG.md) for behavior, balance values and release notes.

## Playing locally

It is a single static page with no build step for development:

```sh
open site/index.html          # or: npm run serve
```

Progress is saved in your browser's local storage.

## Development

```sh
npm ci
npm test       # headless tests: boot, geography, a year of play, every incident, every panel
npm run build  # writes the deployable site to _site/ with version and date stamped in
```

```
site/                  everything that is deployed
  index.html           the whole game (HTML, CSS and JS in one file)
  images/og-image.png  social preview (1200×630)
  favicon.*, icon-*    favicons, app icons, manifest
  robots.txt, sitemap.xml, llms.txt, 404.html, CNAME
scripts/build.sh       copies site/ to _site/ and stamps __VERSION__ / __BUILD_DATE__
tests/                 node:test + jsdom
.github/workflows/     ci.yml (pushes to main and PRs) and release.yml (Pages deploy)
```

## Releasing

Only published releases reach [seriesoftub.es](https://seriesoftub.es). Pushes to
`main` run CI and nothing else.

1. Bump `version` in `package.json` (semver) and add a `CHANGELOG.md` entry.
   Write the bullets for players: the build turns that section into the in-game
   "What's new" card and into `/version.json`, which open games poll to offer a reload.
2. Merge to `main`.
3. Publish a GitHub release tagged `v<version>`, e.g. `gh release create v1.1.0 --generate-notes`.

The release workflow checks that the tag matches `package.json`, runs the tests,
builds, deploys to GitHub Pages and pings IndexNow. It refuses to build when the
CHANGELOG has no `## [<version>]` section (rename `[Unreleased]` first).
Pre-releases never deploy, also not when run by hand, and a version older than
the live one is refused unless you tick `allow_older` (a deliberate rollback).
To redeploy an existing release, run the workflow manually with its tag.

## Hosting setup

GitHub Pages serves the site with **Source: GitHub Actions** and the custom domain
`seriesoftub.es`. Releases deploy from tags, so in **Settings → Environments →
github-pages → Deployment branches and tags**, add a tag rule for `v*` (by default
only the default branch may deploy). DNS for the apex domain:

```
seriesoftub.es.        A     185.199.108.153
seriesoftub.es.        A     185.199.109.153
seriesoftub.es.        A     185.199.110.153
seriesoftub.es.        A     185.199.111.153
seriesoftub.es.        AAAA  2606:50c0:8000::153
seriesoftub.es.        AAAA  2606:50c0:8001::153
seriesoftub.es.        AAAA  2606:50c0:8002::153
seriesoftub.es.        AAAA  2606:50c0:8003::153
www.seriesoftub.es.    CNAME fjaeckel.github.io.
stats.seriesoftub.es.  CNAME seocho.jc-ix.net.
```

Once DNS resolves, enable **Enforce HTTPS** in the repository's Pages settings.

## Analytics

The game uses [Ridiculytics](https://github.com/fjaeckel/ridiculytics): cookieless,
no persistent identifiers, self-hosted at `stats.seriesoftub.es`. It only reports
from `seriesoftub.es` itself; local copies, previews and forks stay silent. The
script is pinned to `ridiculytics@1.0.1` with an SRI hash.

Besides page views and session length, the game sends a few coarse events, all
under the collector's 50-name cap: `game_new`, `game_continue`, `play_1m` …
`play_120m` (active, unpaused play time), `goal_<id>`, `level_2`–`level_4`,
`game_year_2/3/5`, `win_tier1` and `bankrupt`.

The collector must allow the site, e.g. in `sites.yaml`:

```yaml
sites:
  - domain: seriesoftub.es
    origins: ["https://seriesoftub.es", "https://www.seriesoftub.es"]
```

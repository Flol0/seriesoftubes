# Series of Tubes — tubes.krieger.pm

This fork tracks [fjaeckel/seriesoftubes](https://github.com/fjaeckel/seriesoftubes)
and preserves its English UI, artwork and game style. Play it at
**[tubes.krieger.pm](https://tubes.krieger.pm)**.

Version 1.14.0 adds optional shared service-switch banks for caches and hosting,
paired redundancy, rolling maintenance and POP capacity planning.
Version 1.13.0 adds Tier-1 proprietary submarine cables, terrestrial optical
regeneration beyond 4,000 km, completed Italian cable routes and wrapping
city-panel tabs. Version 1.12.0 adds scalable cache pools (100G–1.6T), configurable capacity
pauses, customer expansion requests, tablet gesture fixes and ten new hubs.
Large networks can grow with modular routers, 64-member LAGs, 256-rack server
rooms and 1.6T fabrics. North American power accounting and malformed NNI save
data are repaired. It also includes power consumption, UPS and dual feeds, automatic maintenance,
a persistent NOC event log and server rooms for colocation, web hosting, cloud
instances and capacity-limited DDoS scrubbing. It includes upstream 1.10.0
plus the requests from issues
#12–#17, #19 and #20: customer dashboard, satisfaction warnings and optional
auto-pause, PNI directory, grouped cable waves, feasible customer requirements,
and dark-fiber reach checks. See CHANGELOG.md for the complete player notes.

## Development

```sh
npm ci
npm test
npm run build
```

The deployable static site is written to `_site/`. Development can also use
`site/index.html` directly. Existing saves migrate automatically. New server-room and power state is saved
locally and included in exports. Older upstream versions will not simulate
these new systems.

## Publishing

`main` contains source and runs CI. The tested, compiled `_site/` contents are
published on `gh-pages` with `.nojekyll`; Pages serves that branch at `/` using
**tubes.krieger.pm** as its custom domain. DNS points to `flol0.github.io`.
The original upstream release workflow is retained for reference; it is not used
for this fork's branch-based publication. To publish another version, bump the
package version, add a matching CHANGELOG section, run `npm test` and
`REQUIRE_NOTES=1 npm run build`, and commit the generated `_site/` contents to
`gh-pages`. Preserve `CNAME` and `.nojekyll`.

Original author: [Frederic Jung](https://github.com/fjaeckel). The original
project and its original release history remain in Git history and CHANGELOG.md.

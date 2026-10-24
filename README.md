# Series of Tubes — tubes.krieger.pm

This fork tracks [fjaeckel/seriesoftubes](https://github.com/fjaeckel/seriesoftubes)
and preserves its English UI, artwork and game style. Play it at
**[tubes.krieger.pm](https://tubes.krieger.pm)**.

Version 1.10.1 includes upstream 1.10.0 plus the remaining requests from issues
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
`site/index.html` directly. Save files remain compatible with upstream 1.10.

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

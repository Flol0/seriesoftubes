#!/usr/bin/env node
// Splits a pre-split site/index.html (one file: HTML, CSS and JS) into the src/ layout.
//
// This is how src/ was made, and it stays around for work that was started before the split: a branch
// or pull request that still edits site/index.html. scripts/legacy/port-branch.js uses it to carry those
// edits over to src/ (see CONTRIBUTING.md, "Your branch still edits site/index.html?").
//
//   node scripts/legacy/split-index-html.js INDEX_HTML OUT_DIR      writes OUT_DIR/index.html and partials
//
// The cut points are found by content, not line numbers, so the same rules split any version from around
// the split (1.33.x–1.34.x). Comments directly above a cut point travel with the code below them.
const fs = require('node:fs');
const path = require('node:path');

// [partial, first line of it]. Each regex is looked for after the previous cut.
const CSS = [
  ['styles/00-base.css', /^\/\* Layout: full-bleed/],
  ['styles/10-hud.css', /^\/\* HUD \*\/$/],
  ['styles/20-drawers.css', /^\/\* drawers \*\/$/],
  ['styles/30-toasts.css', /^\/\* toasts \*\/$/],
  ['styles/40-modal.css', /^\/\* modal \*\/$/],
  ['styles/50-tablet.css', /^\/\* Tablets in landscape/],
  ['styles/60-phone.css', /^\/\* =+ PHONES/],
];

const JS = [
  ['game/00-core/10-language.js', /^\/\* =+ LANGUAGE/],
  ['game/00-core/20-analytics.js', /^\/\* =+ ANALYTICS/],
  ['game/10-catalog/10-economy.js', /^\/\* =+ CONSTANTS/],
  ['game/10-catalog/20-routers.js', /^const RG=\[/],
  ['game/10-catalog/30-supply-chain.js', /^\/\* -+ Supply chain/],
  ['game/10-catalog/40-ports.js', /^\/\* Ports are finite/],
  ['game/10-catalog/50-dark-fiber.js', /^\/\/ dark fiber & optical gear/],
  ['game/10-catalog/60-reach-and-subsea.js', /^\/\* Reach \(#17/],
  ['game/20-world/10-projection.js', /^\/\* =+ WORLD/],
  ['game/20-world/20-landmasses.js', /^const LANDS_LL=/],
  ['game/20-world/30-coastline.js', /^\/\/ Drawn coastline/],
  ['game/20-world/40-city-coords.js', /^const CITY_LL=/],
  ['game/20-world/50-cities.js', /^const CITIES=\[/],
  ['game/20-world/60-cables.js', /^const CABLES=\[/],
  ['game/30-networks/10-networks.js', /^\/\* =+ NETWORKS/],
  ['game/30-networks/20-rival-exchanges.js', /^\/\* Rival exchanges/],
  ['game/30-networks/30-long-tail.js', /^\/\* The long tail/],
  ['game/30-networks/40-traffic-shares.js', /^const NET=Object\.fromEntries/],
  ['game/40-progress/10-businesses.js', /^\/\* =+ BUSINESSES/],
  ['game/40-progress/20-goals.js', /^\/\* =+ GOALS/],
  ['game/50-state.js', /^\/\* =+ STATE/],
  ['game/60-features/10-banks.js', /^\/\* =+ BANKS & LOANS/],
  ['game/60-features/20-scenarios.js', /^\/\* Seeded games/],
  ['game/60-features/30-conferences.js', /^\/\* -+ conference season/],
  ['game/60-features/40-tutorial.js', /^\/\* -+ guided first game/],
  ['game/60-features/50-traceroute.js', /^\/\* -+ traceroute and looking glass/],
  ['game/60-features/60-share-card.js', /^\/\* -+ share card/],
  ['game/60-features/70-scenario-progress.js', /^function scnTick\(/],
  ['game/60-features/80-new-game.js', /^function newGame\(/],
  ['game/70-rules/10-helpers.js', /^\/\* =+ HELPERS/],
  ['game/70-rules/20-exchanges.js', /^\/\* Australian exchanges follow/],
  ['game/70-rules/30-pnis.js', /^\/\* -+ PNIs with the big networks/],
  ['game/70-rules/40-peering-inbox.js', /^\/\* -+ The peering inbox/],
  ['game/70-rules/50-peering-policy.js', /^\/\* Big networks sometimes refuse/],
  ['game/70-rules/60-de-kicks.js', /^\/\* DE-KICKS Group/],
  ['game/70-rules/70-sold-out.js', /^\/\* Sold out:/],
  ['game/70-rules/80-hot-ports-and-rank.js', /^const HOT=/],
  ['game/80-simulation/10-dijkstra.js', /^\/\* =+ SIMULATION/],
  ['game/80-simulation/20-routescript.js', /^\/\* -+ RouteScript/],
  ['game/80-simulation/30-compute.js', /^const LABS=new Map/],
  ['game/80-simulation/40-billing.js', /^function p95\(/],
  ['game/80-simulation/50-sanitize.js', /^const own=/],
  ['game/80-simulation/60-requirements.js', /^const GRACE_DAYS=/],
  ['game/80-simulation/70-customers-and-events.js', /^function bizSf\(/],
  ['game/80-simulation/80-geography-and-latency.js', /^function cnOk\(/],
  ['game/80-simulation/90-sites-and-service.js', /^const RT=\{/],
  ['game/85-incidents/10-incidents-and-ddos.js', /^\/\* -+ failures & events/],
  ['game/85-incidents/20-failures.js', /^function fireFailure\(/],
  ['game/85-incidents/30-events.js', /^function fireEvent\(/],
  ['game/88-days/10-day-tick.js', /^\/\* -+ daily tick/],
  ['game/88-days/20-badges.js', /^const RARITY=/],
  ['game/90-actions/00-actions.js', /^\/\* =+ ACTIONS/],
  ['game/90-actions/90-action-helpers.js', /^function landTrenches\(/],
  ['game/91-save.js', /^\/\* =+ SAVE/],
  ['game/92-audio.js', /^\/\* =+ AUDIO/],
  ['game/93-ui/10-dom.js', /^\/\* =+ DOM RENDER/],
  ['game/93-ui/20-phone.js', /^\/\* =+ PHONE =/],
  ['game/93-ui/30-install.js', /^\/\* =+ INSTALL/],
  ['game/93-ui/40-hud-and-panels.js', /^function fitHud\(/],
  ['game/93-ui/50-city-panel.js', /^function cityPanel\(/],
  ['game/93-ui/60-decommission.js', /^\/\* Decommissioning POPs/],
  ['game/93-ui/70-link-panels.js', /^const portMo=/],
  ['game/94-dashboard/10-progress.js', /^\/\* -+ scenario and level progress/],
  ['game/94-dashboard/20-meet-a-network.js', /^\/\* -+ where to meet a network/],
  ['game/94-dashboard/30-customers.js', /^\/\* -+ customers overview/],
  ['game/94-dashboard/40-connections.js', /^\/\* -+ connections overview/],
  ['game/94-dashboard/50-lease-swaps.js', /^\/\* Leased lines you could swap/],
  ['game/94-dashboard/60-dashboard.js', /^function dashTabs\(/],
  ['game/94-dashboard/70-bank.js', /^function loanSummary\(/],
  ['game/94-dashboard/80-hint.js', /^function renderHint\(/],
  ['game/95-modals/10-toasts.js', /^\/\* -+ toasts & modals/],
  ['game/95-modals/20-notifications.js', /^\/\* -+ notifications:/],
  ['game/95-modals/30-modal-and-names.js', /^function openModal\(/],
  ['game/95-modals/40-title.js', /^function showTitle\(/],
  ['game/95-modals/50-release-notes.js', /^\/\* In-app notes stay short/],
  ['game/95-modals/60-help.js', /^function showHelp\(/],
  ['game/95-modals/70-link-modal.js', /^function openLinkModal\(/],
  ['game/95-modals/80-own-cable.js', /^\/\* Your own subsea cable/],
  ['game/95-modals/90-fiber-modals.js', /^function dfModalBody\(/],
  ['game/96-map/10-canvas.js', /^\/\* =+ CANVAS/],
  ['game/96-map/20-land-and-clouds.js', /^function rng\(seed\)/],
  ['game/96-map/30-settings.js', /^function i18nDom\(/],
  ['game/96-map/40-level-of-detail.js', /^\/\* Level of detail/],
  ['game/96-map/50-link-geometry.js', /^\/\* Parallel waves on the same cable/],
  ['game/96-map/60-draw.js', /^function draw\(now\)/],
  ['game/96-map/70-world-layer.js', /^\/\* The land is never drawn/],
  ['game/96-map/80-cities.js', /^const LBLW=/],
  ['game/96-map/90-input.js', /^\/\* -+ hit tests & input/],
  ['game/96-map/95-clicks.js', /^\/\* -+ click delegation/],
  ['game/99-loop.js', /^\/\* =+ LOOP/],
];

// Moves a cut up over the comment directly above it, so a comment stays with the code it describes.
function liftOverComments(lines, i, floor) {
  for (;;) {
    const prev = lines[i - 1];
    if (i - 1 <= floor || prev === undefined) return i;
    if (/^\/\//.test(prev)) { i--; continue; }
    if (/\*\/\s*$/.test(prev)) {
      // A block comment ending just above: find the "/*" line it starts on, with no other "*/" in between.
      let j = i - 1;
      while (j > floor && !/^\/\*/.test(lines[j])) j--;
      if (j > floor && !lines.slice(j, i - 1).some((l) => l.includes('*/'))) { i = j; continue; }
    }
    return i;
  }
}

// Cuts lines[from, to) into [file, text] pairs by the spec.
function cut(lines, from, to, spec, what) {
  // Older versions lack some later sections: a part whose marker is missing is left out, and its code (if
  // any) stays in the part before it. The first part of each section is required.
  const found = [];
  let at = from;
  for (const [file, re] of spec) {
    let i = at;
    while (i < to && !re.test(lines[i])) i++;
    if (i >= to) {
      if (!found.length) throw new Error(`${what}: no line matches ${re} (for ${file})`);
      continue;
    }
    found.push([file, found.length ? liftOverComments(lines, i, found[found.length - 1][1]) : from]);
    at = i + 1;
  }
  return found.map(([file, s], k) => [file, lines.slice(s, k + 1 < found.length ? found[k + 1][1] : to).map((l) => l + '\n').join('')]);
}

function split(html) {
  if (html.includes('\r')) html = html.replace(/\r\n/g, '\n');
  const lines = html.split('\n');
  const find = (re, from = 0) => { const i = lines.findIndex((l, k) => k >= from && re.test(l)); if (i < 0) throw new Error(`no line matches ${re}`); return i; };
  const styleOpen = find(/^<style>$/), styleClose = find(/^<\/style>$/, styleOpen);
  // The game script is the last inline <script>, opened with 'use strict'.
  const gameOpen = find(/^'use strict';$/), gameClose = find(/^<\/script>$/, gameOpen);
  const files = [
    ...cut(lines, styleOpen + 1, styleClose, CSS, 'styles'),
    ...cut(lines, gameOpen + 1, gameClose, JS, 'game'),
  ];
  const shell = [
    ...lines.slice(0, styleOpen + 1), '<!-- @include styles -->',
    ...lines.slice(styleClose, gameOpen + 1), '<!-- @include game -->',
    ...lines.slice(gameClose),
  ].join('\n');
  return [['index.html', shell], ...files];
}

module.exports = { split };

if (require.main === module) {
  const [input, out] = process.argv.slice(2);
  if (!input || !out) { console.error('usage: split-index-html.js INDEX_HTML OUT_DIR'); process.exit(2); }
  const parts = split(fs.readFileSync(input, 'utf8'));
  // The post-split tidying (see transforms.js) is part of the layout, so ported work lines up with src/.
  const { transform } = require('./transforms');
  for (const [file, text] of transform(parts)) {
    const p = path.join(out, file);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text);
  }
  console.log(`Split ${input} into ${parts.length} files under ${out}/`);
}

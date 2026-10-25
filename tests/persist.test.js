const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { load } = require('./harness');

const OUT = require('node:fs').mkdtempSync(require('node:path').join(require('node:os').tmpdir(), 'tubes-build-'));
const root = path.join(__dirname, '..');

function playedGame() {
  const a = load();
  a.ev("ACT.start({});ACT.launchBB({city:'fra'});for(let i=0;i<25;i++)dayTick();UI.speed=2;save()");
  return { a, saved: a.ev("localStorage.getItem('sot-save-v1')"), day: a.ev('S.day') };
}

test('a reload drops you straight back into your saved network', () => {
  const { saved, day } = playedGame();
  const b = load({ storage: { 'sot-save-v1': saved } });
  assert.equal(b.ev('UI.started'), true);
  assert.equal(b.ev('S.day'), day);
  assert.equal(b.ev('UI.speed'), 2, 'game speed is remembered');
  assert.equal(b.ev("document.getElementById('modal').hidden"), true, 'no title screen in the way');
  assert.deepEqual(b.errors, []);
});

test('leaving the page saves the game', () => {
  const a = load();
  a.ev("ACT.start({});for(let i=0;i<7;i++)dayTick();localStorage.removeItem('sot-save-v1')");
  a.ev("dispatchEvent(new Event('pagehide'))");
  assert.equal(JSON.parse(a.ev("localStorage.getItem('sot-save-v1')")).day, a.ev('S.day'));
});

test('returning players see what is new after an update, once', () => {
  const { saved } = playedGame();
  execFileSync('bash', ['scripts/build.sh'], { cwd: root, env: { ...process.env, OUT, VERSION: '1.1.0', BUILD_DATE: '2026-10-23' } });
  const file = path.join(OUT, 'index.html');
  const b = load({ file, storage: { 'sot-save-v1': saved, 'sot-seen-version': '1.0.0' } });
  const text = b.ev("document.getElementById('modalCard').textContent");
  assert.match(text, /New in Series of Tubes 1\.1\.0/);
  assert.match(text, /Spätzle-IX/);
  assert.equal(b.ev("localStorage.getItem('sot-seen-version')"), '1.1.0');
  const c = load({ file, storage: { 'sot-save-v1': saved, 'sot-seen-version': '1.1.0' } });
  assert.equal(c.ev("document.getElementById('modal').hidden"), true, 'not shown again');
});

test('version comparison for the update banner', () => {
  const { ev } = load();
  assert.equal(ev("newerVer('1.2.0','1.1.0')"), true);
  assert.equal(ev("newerVer('1.10.0','1.9.3')"), true);
  assert.equal(ev("newerVer('1.1.0','1.1.0')"), false);
  assert.equal(ev("newerVer('1.0.9','1.1.0')"), false);
});

test('#46 an update that adds networks gives a courtesy route, and Tier 1 is shown only while it is true', () => {
  const { ev, errors } = load();
  ev("ACT.start({});S.cash=1e8;for(const g of GOALS)S.done[g.id]=0;ACT.launchBB({city:'fra'});ACT.buyTransit({city:'fra',net:'cog',tier:1});compute()");
  assert.ok(ev('R.reach') > 0.99);
  assert.ok(Array.isArray(JSON.parse(ev('JSON.stringify(S.seen)'))), 'new games remember which networks existed');
  // a transit-free network that has never heard of two of today's networks
  ev("S.transit=[];S.day=400;S.seen=S.seen.filter(id=>id!=='btt'&&id!=='sky');const s=JSON.parse(JSON.stringify(S));S=migrate(s);compute()");
  assert.deepEqual(JSON.parse(ev('JSON.stringify(S.grace.nets.sort())')), ['btt', 'sky']);
  assert.equal(ev('S.grace.until'), 460);
  assert.equal(ev('R.reachable.btt'), true, 'the courtesy route reaches a network from the update');
  assert.equal(ev('R.reachable.cog'), false, 'but not networks the player already knew about');
  ev('S.day=461;compute()');
  assert.equal(ev('R.reachable.btt'), false, 'it ends after 60 days');
  // a save from before this change, with no record at all, gets the grace for everything it cannot reach
  ev("S.day=10;delete S.seen;delete S.grace;S=migrate(JSON.parse(JSON.stringify(S)));compute()");
  assert.ok(ev('S.grace.nets.length') > 50);
  assert.ok(ev('R.reach') > 0.99, 'nothing drops overnight');
  // Tier 1 is a state, not a trophy
  ev("S.won=true;S.t1Now=true;S.grace=null;compute()");
  assert.notEqual(ev('tierLabel()'), 'Tier 1');
  ev("window.__t=[];const _t=toast;toast=(h,...a)=>{window.__t.push(h);return _t(h,...a);};dayTick()");
  assert.match(ev("window.__t.join(' ')"), /no longer Tier 1/);
  assert.equal(ev("BADGES.find(b=>b.id==='t1').ok()"), true, 'the badge stays');
  assert.deepEqual(errors, []);
});

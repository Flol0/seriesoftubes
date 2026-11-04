const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./harness');

// Waves between Frankfurt and Amsterdam (tier 3 is 800G, tier 0 is 10G), transit in Amsterdam, eyeballs in Frankfurt.
function setup(ev, tiers = [3, 3]) {
  ev("ACT.start({});S.cash=1e8;S.lvl=4;for(const g of GOALS)S.done[g.id]=0");
  ev("ACT.buildPop({city:'ams'});for(const c in S.pops){S.pops[c].rgen=3;S.pops[c].routers=2}");
  ev("ACT.launchBB({city:'fra'});ACT.buyTransit({city:'ams',net:'lvl',tier:3})");
  tiers.forEach((t, i) => ev(`UI.via=null;openLinkModal('fra','ams');ACT.buildLink({tier:${t}});closeModal();S.links[S.links.length-1].tag=${i}`));
  ev("var L=i=>S.links.find(l=>l.tag===i),L1=L(0),L2=L(1);compute()");
}
const load_ = (ev, x) => ev(`R.load[${x}.id]||0`);
const body = dom => dom.window.document.body.textContent;

test('#122 the routing metric belongs to the city pair', () => {
  const { ev, errors } = load();
  setup(ev);
  ev("ACT.setMetric({id:L2.id,v:'avoid'})");
  assert.equal(ev("S.pairMet['ams|fra']"), 'avoid');
  ev("ACT.selLink({id:L1.id});renderAll()");
  assert.ok(ev("[...document.querySelectorAll('[data-act=\"setMetric\"]')].some(b=>b.className.includes('pink')&&/Avoid/.test(b.textContent))"), 'the other link shows the same metric');
  ev("ACT.setMetric({id:L1.id,v:'normal'})");
  assert.equal(ev("'ams|fra' in S.pairMet"), false);
  assert.deepEqual(errors, []);
});

test('#122 a link on standby idles while the others have room and takes over when they fail', () => {
  const { ev, dom, errors } = load();
  setup(ev);
  const total = ev("R.served");
  assert.ok(load_(ev, 'L1') > 0 && load_(ev, 'L2') > 0, 'active links share the load');
  ev("ACT.setStandby({id:L2.id,on:1});compute()");
  assert.equal(ev("L2.standby"), true);
  assert.ok(load_(ev, 'L1') > 0);
  assert.equal(load_(ev, 'L2'), 0, 'standby link idles');
  assert.ok(Math.abs(ev("R.served") - total) < 1e-6, 'nothing is lost');
  ev("ACT.selLink({id:L2.id});renderAll()");
  assert.match(body(dom), /On standby: idle while the other links/);
  ev("L1.cut=S.day+5;compute();renderAll()");
  assert.ok(load_(ev, 'L2') > 0, 'standby link takes over when the active one is cut');
  assert.match(body(dom), /On standby, but carrying the traffic/);
  // Every link on standby: they share the traffic like active ones, and the note does not claim the others are down.
  ev("L1.cut=0;ACT.setStandby({id:L1.id,on:1});compute();renderAll()");
  assert.ok(load_(ev, 'L1') > 0 && load_(ev, 'L2') > 0);
  assert.match(body(dom), /no active link between these cities is up/);
  ev("ACT.setStandby({id:L2.id,on:0})");
  assert.equal(ev("'standby' in L2"), false);
  assert.deepEqual(errors, []);
});

test('#122 a standby link takes the overflow when the active links are full', () => {
  const { ev, dom, errors } = load();
  setup(ev, [0, 3]); // 10G active, 800G next to it
  const total = ev("R.served");
  ev("ACT.setStandby({id:L2.id,on:1});compute()");
  const cap = ev("capOf(L1)");
  assert.ok(Math.abs(load_(ev, 'L1') - cap) < 1e-6, 'the active link fills up first');
  assert.ok(load_(ev, 'L2') > 0, 'the rest spills onto the standby link');
  assert.ok(Math.abs(ev("R.served") - total) < 1e-6, 'standby capacity is never wasted');
  ev("ACT.selLink({id:L2.id});renderAll()");
  assert.match(body(dom), /taking the overflow/);
  assert.deepEqual(errors, []);
});

test('#122 the order links are built in does not change where traffic goes', () => {
  const tiers = [3, 0, 3], standby = [true, false, false], seen = new Set();
  for (const order of [[0, 1, 2], [2, 1, 0], [1, 0, 2], [2, 0, 1]]) {
    const { ev, errors } = load();
    ev("ACT.start({});S.cash=1e8;S.lvl=4;for(const g of GOALS)S.done[g.id]=0");
    ev("ACT.buildPop({city:'ams'});for(const c in S.pops){S.pops[c].rgen=3;S.pops[c].routers=2}");
    ev("ACT.launchBB({city:'fra'});ACT.buyTransit({city:'ams',net:'lvl',tier:3})");
    for (const i of order) ev(`UI.via=null;openLinkModal('fra','ams');ACT.buildLink({tier:${tiers[i]}});closeModal();const l=S.links[S.links.length-1];l.tag=${i};if(${standby[i]})ACT.setStandby({id:l.id,on:1})`);
    ev("ACT.setMetric({id:S.links[0].id,v:'prefer'});compute()");
    seen.add(ev("JSON.stringify([0,1,2].map(i=>Math.round((R.load[S.links.find(l=>l.tag===i).id]||0)*1e6)))"));
    assert.deepEqual(errors, []);
  }
  assert.equal(seen.size, 1, [...seen].join(' vs '));
});

test('#122 a new link between the same cities adds capacity and keeps the pair metric', () => {
  const { ev, errors } = load();
  setup(ev, [0]);
  ev("ACT.setMetric({id:L1.id,v:'avoid'});ACT.setStandby({id:L1.id,on:1});compute()");
  const before = ev("R.served");
  ev("UI.via=null;openLinkModal('fra','ams');ACT.buildLink({tier:3});closeModal();compute()");
  const nl = "S.links[S.links.length-1]";
  assert.equal(ev(`'standby' in ${nl}`), false, 'a new link starts active');
  assert.equal(ev("pairMet('ams|fra')"), 'avoid');
  assert.ok(ev("R.served") > before, 'more capacity, more traffic');
  // The metric leaves with the last link, so a fresh link later starts on normal.
  for (const id of ev("S.links.map(l=>l.id)")) ev(`UI.confirm=null;ACT.rmLink({id:'${id}'});ACT.rmLink({id:'${id}'})`);
  assert.equal(ev("'ams|fra' in S.pairMet"), false);
  assert.deepEqual(errors, []);
});

test('#122 old saves keep routing as before: per-link metrics become the pair metric', () => {
  const { ev, errors } = load();
  setup(ev);
  // Every link on avoid: the pair is on avoid.
  ev("delete S.pairMet;L1.metric='avoid';L2.metric='avoid';S=migrate(JSON.parse(JSON.stringify(S)))");
  assert.equal(ev("S.pairMet['ams|fra']"), 'avoid');
  assert.equal(ev("S.links.some(l=>'metric' in l)"), false);
  // Mixed metrics routed at the lowest one, all links carrying: no standby, normal.
  ev("S.pairMet={};S.links[0].metric='backup';S.links[1].standby='yes';S=migrate(JSON.parse(JSON.stringify(S)));compute()");
  assert.equal(ev("'ams|fra' in S.pairMet"), false);
  assert.equal(ev("S.links.some(l=>'standby' in l||'metric' in l)"), false);
  assert.ok(ev("S.links.every(l=>R.load[l.id]>0)"));
  // Junk in the new field is dropped.
  ev("S.pairMet={'ams|fra':'warp','fra|lon':'avoid'};S=migrate(JSON.parse(JSON.stringify(S)))");
  assert.deepEqual(JSON.parse(ev("JSON.stringify(S.pairMet)")), {});
  assert.deepEqual(errors, []);
});

test('#122 traceroute shows an active link, not one on standby', () => {
  const { ev, errors } = load();
  setup(ev);
  ev("ACT.setStandby({id:L1.id,on:1})");
  assert.equal(ev("trPaths('ams').path('fra')[0].l.id===L2.id"), true);
  ev("ACT.setStandby({id:L1.id,on:0});ACT.setStandby({id:L2.id,on:1})");
  assert.equal(ev("trPaths('ams').path('fra')[0].l.id===L1.id"), true);
  assert.deepEqual(errors, []);
});

test('#122 the standby button shows next to another link, on desktop and phone', () => {
  const { ev, dom, errors } = load();
  setup(ev);
  for (const w of [1280, 390]) {
    ev(`window.innerWidth=${w};ACT.selLink({id:L1.id});renderAll()`);
    const b = dom.window.document.querySelector('[data-act="setStandby"]');
    assert.ok(b, `standby button at ${w}px`);
    assert.match(b.textContent, /Put this link on standby/);
  }
  ev("S.links=S.links.filter(l=>l!==L2);ACT.selLink({id:L1.id});renderAll()");
  assert.equal(dom.window.document.querySelector('[data-act="setStandby"]'), null, 'nothing to stand by for');
  ev("L1.standby=true;renderAll()");
  assert.match(dom.window.document.querySelector('[data-act="setStandby"]').textContent, /Take it off standby/);
  assert.deepEqual(errors, []);
});

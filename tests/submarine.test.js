const test=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('./harness');
function start(ev){ev("ACT.start({});S.cash=1e10;S.lvl=4;UI.autoCongestion=false;for(const g of GOALS)S.done[g.id]=0");}

test('proprietary submarine cables require Tier 1, obey permits and never charge on rejection',()=>{
 const {ev}=load();start(ev);ev("ACT.buildPop({city:'lon'});UI.pending={a:'lon',b:'nyc'};window.before=S.cash;ACT.orderSea()");assert.equal(ev('S.links.length'),0);assert.equal(ev('S.cash'),ev('before'));
 assert.match(ev("seaModalBody('lon','nyc',0)"),/Tier 1/);
 ev("S.won=true;S.ev.landban={city:'nyc',until:45};ACT.orderSea()");assert.equal(ev('S.links.length'),0);assert.equal(ev('S.cash'),ev('before'));
 ev("S.ev={};UI.pending={a:'fra',b:'den'};ACT.orderSea()");assert.equal(ev('S.links.length'),0,'no invented sea route between inland cities');
 ev("ACT.buildPop({city:'hkg'});UI.pending={a:'hkg',b:'sha'};ACT.orderSea()");assert.equal(ev('S.links.length'),0,'no proprietary Chinese cross-border fiber');
});

test('own wet plant is independently routed, carries traffic after construction and survives save/reload',()=>{
 const {ev,errors}=load();start(ev);
 ev("ACT.buildPop({city:'lon'});ACT.buildPop({city:'nyc'});S.pops.lon.rgen=10;S.pops.nyc.rgen=10;S.won=true;UI.pending={a:'lon',b:'nyc'};UI.via=cablesOk('lon','nyc')[0].cid;window.before=S.cash;ACT.orderSea();window.sea=S.links[0]");
 assert.equal(ev('sea.proprietary&&sea.sub&&sea.own'),true);assert.equal(ev('sea.cable'),null);assert.equal(ev('sea.trench'),ev('sea.id'));assert.ok(ev('sea.km')>4000);assert.ok(ev('S.cash')<ev('before'));
 const paid=ev('S.cash'),ready=ev('sea.ready');ev('ACT.crews({id:sea.id})');assert.equal(ev('sea.ready'),ready-30);assert.equal(paid-ev('S.cash'),ev('crewCost(sea)'));
 ev("ACT.addCh({id:sea.id,o:'wet4'});compute()");assert.equal(ev('sea.ch.length'),1);assert.equal(ev('dfCap(sea)'),0);
 assert.match(ev("chWhy(sea,'tp16')"),/wet-plant/);
 ev("S.links.push({id:'rented',a:'lon',b:'nyc',kind:'wave',tier:2,sub:true,cable:sea.routeCable,trench:'cab:'+sea.routeCable,cut:0,km:sea.km,mo:1000});S.links[1].cut=sea.ready+10;S.day=sea.ready;S.pops.lon.bb={d:100};ACT.buyTransit({city:'nyc',net:'cog',tier:2});compute()");
 assert.equal(ev('linkDown(S.links[1])'),true);assert.equal(ev('linkDown(sea)'),false);assert.equal(ev('dfCap(sea)'),400);assert.ok(ev('R.load[sea.id]')>90);assert.ok(ev('Object.values(R.cost).every(Number.isFinite)'));
 ev("S=migrate(JSON.parse(JSON.stringify(S)));compute();UI.sel={type:'link',id:S.links[0].id};renderPanel();draw(100)");
 assert.equal(ev('S.links[0].routeCable'),ev('sea.routeCable'));assert.equal(ev('S.links[0].trench'),ev('S.links[0].id'));assert.match(ev("document.getElementById('panelBody').textContent"),/Own submarine cable/);assert.deepEqual(errors,[]);
});

test('terrestrial regeneration scales beyond 4000 km and charges hardware and running costs per span',()=>{
 const {ev,errors}=load();start(ev);ev("S.pops.fra.rgen=10;UI.pending={a:'fra',b:'sin'};UI.dfSrc='build';UI.dfSys='lite';ACT.orderDf();window.fiber=S.links[0];S.pops.sin.rgen=10");
 assert.ok(ev('fiber.km')>4000);assert.equal(ev('fiber.sys'),'roadm');assert.equal(ev("chWhy(fiber,'tp16')"),'');const n=ev("regenCount(fiber,'tp16')");assert.ok(n>=2);
 const before=ev('S.cash');ev("ACT.addCh({id:fiber.id,o:'tp16'})");assert.equal(before-ev('S.cash'),ev("OPT.tp16.cost*(1+regenCount(fiber,'tp16'))"));
 assert.equal(ev('dfCap(fiber)'),0);ev('S.day=fiber.ready;compute()');assert.equal(ev('dfCap(fiber)'),1600);assert.equal(ev('regenMo(fiber)'),n*250);assert.equal(ev('R.cost.optical'),ev('ampCount(fiber.km)*AMP_MO')+n*250);
 ev("S=migrate(JSON.parse(JSON.stringify(S)));compute();ACT.rmCh({id:S.links[0].id,o:'tp16'})");assert.equal(ev('regenMo(S.links[0])'),0);assert.match(ev("chWhy(S.links[0],'wet4')"),/only.*submarine/);assert.deepEqual(errors,[]);
});

test('Italian upstream routes are selectable and Rome has coastal backhaul',()=>{
 const {ev,errors}=load();start(ev);
 assert.equal(ev('CITY.mil.ix'),'RisottIX');assert.equal(ev('CITY.rom.ix'),'CarbonarIX');
 for(const c of ['mil','pmo','mrs']){assert.ok(ev(`cablesFor('rom','${c}').some(c=>c.cid==='bluemed')`));ev(`UI.via='bluemed';UI.lmode='wave';openLinkModal('rom','${c}');ACT.buildLink({tier:0})`);assert.equal(ev('S.links.at(-1).sub'),true);}
 assert.ok(ev("CABLE_PAIRS.some(c=>c.cid==='fea'&&c.a==='lon'&&c.b==='pmo')"));assert.ok(ev("CABLE_PAIRS.some(c=>c.cid==='fea'&&c.b==='tok')"));assert.ok(ev("cablesFor('pmo','khi').some(c=>c.cid==='smw4')"));assert.deepEqual(errors,[]);
});

const test=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('./harness');
function start(ev){ev("ACT.start({});S.cash=1e12;S.lvl=4;S.pops.fra.rgen=10;UI.autoCongestion=false;for(const g of GOALS)S.done[g.id]=0");}
function traffic(ev){start(ev);ev("for(const n of NETS)NSH[n.id]=n.id==='ggl'?1:0;S.pops.fra.bb={d:1000};ACT.buyTransit({city:'fra',net:'cog',tier:4});ACT.cache({city:'fra',net:'ggl',count:10});S.pops.fra.dc={...DC_EMPTY,racks:10,tenants:125};compute();ACT.sfBuy({city:'fra',m:0});compute()");}

test('optional service fabrics preserve legacy saves, pool endpoints and bill all chassis/uplinks',()=>{
 const {ev,errors}=load();start(ev);ev("S.pops.fra.bb={d:1000};ACT.buyTransit({city:'fra',net:'cog',tier:4});ACT.cache({city:'fra',net:'ggl',count:20});ACT.rackBuy({city:'fra'});window.oldPorts=portsUsed('fra');window.oldPower=powerKW('fra');S=migrate(JSON.parse(JSON.stringify(S)));compute()");
 assert.equal(ev("serviceFabric('fra')"),null);assert.equal(ev("portsUsed('fra')"),22);
 ev("ACT.sfBuy({city:'fra',m:0})");assert.equal(ev("portsUsed('fra')"),2);assert.equal(ev("serviceSlots('fra')"),21);assert.equal(ev('cacheCount(S.caches[0])'),20);assert.ok(Math.abs(ev("powerKW('fra')-(oldPower+((portsUsed('fra')-oldPorts)*.025+sfKW(serviceFabric('fra')))*1.35)"))<1e-6);assert.equal(ev('R.cost.switches'),ev("sfMonthly(serviceFabric('fra'))"));
 ev("S=migrate(JSON.parse(JSON.stringify(S)));compute()");assert.equal(ev("serviceFabric('fra').model"),0);assert.equal(ev("portsUsed('fra')"),2);assert.deepEqual(errors,[]);
});

test('cache delivery and hosting share one budget, hosting is not starved and cache overflow uses transit',()=>{
 const {ev}=load();traffic(ev);
 assert.equal(ev("sfCapacity('fra')"),400);assert.ok(Math.abs(ev("R.sfUse.fra")-400)<1e-6);assert.ok(Math.abs(ev('R.sfHostSrv.fra')-100)<1e-6);assert.ok(Math.abs(ev('R.served')-1100)<1e-6);
 assert.ok(ev('R.useT[S.transit[0].id]')>690);assert.equal(ev("dcService('fra').colo"),1);
 ev("UI.fullSeen=new Set();UI.autoCongestion=true;UI.speed=8;congestionCheck()");assert.equal(ev('UI.speed'),0);assert.ok(ev("fullCircuits().some(x=>x.key==='s:fra')"));assert.ok(ev("hotPorts().some(x=>x.k==='s')"));
});

test('standalone switch failures remove access, pairs retain connectivity and spare uplinks carry the load',()=>{
 const {ev}=load();traffic(ev);ev("sfFault('fra');compute()");assert.equal(ev("sfCapacity('fra')"),0);assert.equal(ev('R.sfHostSrv.fra||0'),0);assert.equal(ev('R.useCache[S.caches[0].id]||0'),0);assert.equal(ev("dcRevenue('fra')"),0);assert.ok(ev('R.useT[S.transit[0].id]')>990);
 ev("S.pops.fra.sf.failUntil=0;ACT.sfPair({city:'fra'});sfFault('fra');compute()");assert.equal(ev("sfCapacity('fra')"),400);assert.equal(ev("sfEndpointAvailability('fra')"),1);assert.ok(Math.abs(ev('R.sfHostSrv.fra')-100)<1e-6);assert.equal(ev("dcService('fra').colo"),1);
 ev('S.day=2;sfTick();compute()');assert.equal(ev("sfCapacity('fra')"),800);assert.ok(ev("S.log.some(e=>/switch repaired/.test(e.t))"));
});

test('pairs reserve access slots and rolling maintenance affects only one member at a time',()=>{
 const {ev}=load();traffic(ev);ev("ACT.sfPair({city:'fra'});S.pops.fra.sf.due=10;S.day=3;sfTick()");assert.ok(ev("S.log.some(e=>/maintenance in 7 days/.test(e.t))"));
 ev('S.day=10;sfTick();compute()');assert.equal(ev("sfLive('fra')"),1);assert.equal(ev("sfSlots(serviceFabric('fra'))"),48);assert.equal(ev("sfEndpointAvailability('fra')"),1);assert.equal(ev("dcService('fra').colo"),1);
 ev('S.day=11;sfTick();compute()');assert.equal(ev("sfLive('fra')"),1);ev('S.day=12;sfTick();compute()');assert.equal(ev("sfLive('fra')"),2);assert.ok(ev("S.log.some(e=>/maintenance complete/.test(e.t))"));
 ev("ACT.addSite({city:'fra'});addInc({type:'site',ref:'fra',site:'a',until:20,msg:'Site A down',cost:0});compute()");assert.equal(ev("sfCapacity('fra')"),400);assert.equal(ev('cacheLiveCap(S.caches[0])'),1000);
});

test('access slots and cache speeds gate purchases; banks, models and LAGs expand independently',()=>{
 const {ev}=load();traffic(ev);ev("S.caches[0].n=38;window.cashBefore=S.cash;ACT.cache({city:'fra',net:'ggl'});ACT.rackBuy({city:'fra'})");assert.equal(ev('S.caches[0].n'),38);assert.equal(ev('S.pops.fra.dc.racks'),10);assert.equal(ev('S.cash'),ev('cashBefore'));
 ev("ACT.cacheUp({city:'fra',net:'ggl'})");assert.equal(ev('S.caches[0].tier'),0);
 ev("ACT.sfBank({city:'fra'});ACT.sfModel({city:'fra',m:1});ACT.cacheUp({city:'fra',net:'ggl'});ACT.sfUp({city:'fra',t:3});ACT.sfLag({city:'fra'});compute()");assert.equal(ev('S.caches[0].tier'),1);assert.equal(ev("sfSlots(serviceFabric('fra'))"),192);assert.equal(ev("sfCapacity('fra')"),3040);assert.ok(ev('Object.values(R.cost).every(Number.isFinite)'));
});

test('direct reconnection and router downgrades cannot strand cache interfaces or oversubscribe ports',()=>{
 const {ev}=load();traffic(ev);ev("ACT.sfModel({city:'fra',m:2});ACT.cacheUp({city:'fra',net:'ggl'});ACT.cacheUp({city:'fra',net:'ggl'});S.transit[0].tier=2;ACT.upRouter({city:'fra',g:6})");
 assert.equal(ev('S.pops.fra.rgen'),6,'400G router can feed 1.6T cache access through a switch');
 ev("UI.confirm='sffra';ACT.sfRemove({city:'fra'})");assert.ok(ev("serviceFabric('fra')"),'direct cache interface would be incompatible');
 ev("ACT.sfUp({city:'fra',t:4})");assert.equal(ev("serviceFabric('fra').ut"),2,'router cannot take the proposed uplink');
 ev("ACT.upRouter({city:'fra',g:10});S.caches[0].n=300;UI.confirm='sffra';ACT.sfRemove({city:'fra'})");assert.ok(ev("serviceFabric('fra')"),'insufficient direct ports');
 ev("S.caches[0].n=10;UI.confirm='sffra';ACT.sfRemove({city:'fra'})");assert.equal(ev("serviceFabric('fra')"),null);
});

test('switch state imports are bounded, installation is atomic, and capacity panels render',()=>{
 const {ev,errors}=load();traffic(ev);ev("S.pops.fra.sf={model:'length',banks:Infinity,paired:true,ut:900,un:-9,remaining:999999,due:'nope'};S=migrate(JSON.parse(JSON.stringify(S)));compute();selectCity('fra');for(const t of ['links','hosting','peer'])ACT.tab({t});ACT.openNoc()");assert.ok(ev('Object.values(R.cost).every(Number.isFinite)'));assert.ok(ev("serviceFabric('fra').un>=1&&serviceFabric('fra').banks<=64"));assert.deepEqual(errors,[]);
 ev("S.pops.fra.sf=null;S.lvl=1;window.cashBefore=S.cash;ACT.sfBuy({city:'fra',m:2})");assert.equal(ev("serviceFabric('fra')"),null);assert.equal(ev('S.cash'),ev('cashBefore'));
});

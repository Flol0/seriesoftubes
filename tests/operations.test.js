const test=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('./harness');
function start(ev){ev("ACT.start({});S.cash=1e9;S.lvl=4;for(const g of GOALS)S.done[g.id]=0");}
function online(ev){start(ev);ev("ACT.buyTransit({city:'fra',net:'cog',tier:1});compute()");}

test('power follows equipment, cooling and city tariffs and is billed in operating costs',()=>{
 const {ev,errors}=load();start(ev);
 const kw=ev("powerKW('fra')"),bill=ev("powerBill('fra')");
 assert.ok(kw>0&&bill>0);
 assert.equal(ev("powerRate('fra')"),ev("powerRate('fra')"));
 assert.notEqual(ev("powerRate('fra')"),ev("powerRate('nyc')"));
 ev("ACT.addRouter({city:'fra'});compute()");
 assert.ok(ev("powerKW('fra')")>kw*1.9);
 assert.ok(ev('R.cost.power')>bill);
 ev("ACT.rackBuy({city:'fra'});ACT.serverBuy({city:'fra',role:'cloud'});compute()");
 assert.ok(ev('R.cost.hosting')>0);
 assert.ok(ev('Object.values(R.cost).every(Number.isFinite)'));
 assert.deepEqual(errors,[]);
});

test('UPS bridges a short grid outage, expires on a long one, and overlapping cuts do not recharge it',()=>{
 const {ev}=load();online(ev);ev("ACT.powerBuy({city:'fra',item:'ups'});gridOutage('fra',1);compute()");
 assert.equal(ev("!!popUp('fra')"),true);
 ev('S.day=1;operationsTick();compute()');
 assert.equal(ev("!!popUp('fra')"),true,'short cut ends before battery exhaustion');
 ev("S.day=2;gridOutage('fra',4);gridOutage('fra',6)");
 assert.equal(ev('S.pops.fra.upsUntil'),3,'overlap cannot reset battery');
 ev('S.day=3;operationsTick();compute()');
 assert.equal(ev("!!popUp('fra')"),false);
 assert.equal(ev("dcAvailable('fra')"),0);
 ev("selectCity('fra');ACT.tab({t:'links'})");assert.match(ev("document.getElementById('panelBody').textContent"),/This POP is down/);ev('draw(0)');
 assert.ok(ev("S.log.some(e=>/UPS exhausted/.test(e.t))"));
 ev('S.day=8;compute()');assert.equal(ev("!!popUp('fra')"),true);
});

test('dual feeds cover local faults while regional outages and site diversity behave separately',()=>{
 const {ev}=load();start(ev);ev("ACT.powerBuy({city:'fra',item:'dualFeed'});gridOutage('fra',3)");
 assert.equal(ev("!!popUp('fra')"),true);
 ev("gridOutage('fra',3,{regional:true})");assert.equal(ev("!!popUp('fra')"),false);
 ev("S.day=4;ACT.addSite({city:'fra'});S.pops.fra.dualFeed=false;gridOutage('fra',4)");
 assert.equal(ev("!!popUp('fra')"),true);
 assert.equal(ev("['a','b'].filter(s=>siteDown('fra',s)).length"),1);
 ev("gridOutage('fra',8,{regional:true});gridOutage('fra',9)");
 assert.equal(ev("!!popUp('fra')"),false,'local extension never downgrades a regional blackout');
});

test('generator fuel costs more while running, UPS bridges servicing, and service defers during a blackout',()=>{
 const {ev}=load();online(ev);ev("ACT.addGen({city:'fra'});ACT.powerBuy({city:'fra',item:'ups'})");
 const normal=ev("powerBill('fra')");
 ev("S.pops.fra.generatorDue=1;S.day=1;operationsTick();gridOutage('fra',3)");
 assert.equal(ev("onGenerator('fra')"),false);
 assert.equal(ev("!!popUp('fra')"),true,'UPS covers generator servicing');
 ev('S.day=2;compute()');assert.equal(ev("onGenerator('fra')"),true);
 assert.ok(ev("powerBill('fra')")>normal);
 ev('S.pops.fra.generatorDue=2;operationsTick()');
 assert.equal(ev('S.pops.fra.generatorDue'),2,'no generator shutdown during a blackout');
 ev('S.day=4;operationsTick()');assert.ok(ev('S.pops.fra.generatorDue')>4);
});

test('automatic router maintenance is announced, rolls without impact when redundant, and restores single routers',()=>{
 const {ev}=load();online(ev);ev("ACT.launchBB({city:'fra'});ACT.addRouter({city:'fra'});S.pops.fra.routerDue=10;S.day=3;operationsTick()");
 const delivered=ev('R.served/R.demand');
 assert.ok(ev("S.log.some(e=>e.cat==='maintenance'&&/7 days/.test(e.t))"));
 ev("S.day=10;operationsTick();compute()");
 assert.equal(ev("!!popUp('fra')"),true);assert.equal(ev('R.served/R.demand'),delivered);
 ev("S.pops.fra.routers=1;S.pops.fra.routerDue=11;S.day=11;operationsTick();compute()");
 assert.equal(ev("!!popUp('fra')"),false);
 ev("S.day=12;for(const i of S.inc.slice())if(i.until<=S.day)clearInc(i);compute()");
 assert.equal(ev("!!popUp('fra')"),true);
 ev("ACT.addRouter({city:'fra'});ACT.upRouter({city:'fra',g:1});compute()");
 assert.equal(ev("!!popUp('fra')"),true);assert.equal(ev('R.served/R.demand'),delivered);
});

test('automatic optical maintenance takes channels offline and restores them without a manual repair',()=>{
 const {ev}=load();start(ev);
 ev("S.pops.ams={day:0,rgen:1,routers:2};S.pops.fra.rgen=1;UI.pending={a:'fra',b:'ams'};UI.dfSys='roadm';ACT.orderDf();window.__fiber=S.links.find(l=>l.kind==='df');__fiber.ready=0;ACT.addCh({id:__fiber.id,o:'zr4'});__fiber.opticalDue=10;S.day=10;operationsTick()");
 assert.equal(ev('dfCap(__fiber)'),0);
 assert.ok(ev("S.inc.some(i=>i.type==='opticmaint')"));
 ev('S.day=11;for(const i of S.inc.slice())if(i.until<=S.day)clearInc(i)');
 assert.ok(ev('dfCap(__fiber)')>0);
});

test('racks and own servers attract tenants, generate traffic and revenue, and lose income without power',()=>{
 const {ev,errors}=load();online(ev);
 ev("ACT.rackBuy({city:'fra'});for(const role of ['web','cloud','scrub'])ACT.serverBuy({city:'fra',role});for(let d=1;d<=35;d++){S.day=d;compute();hostingTick();}compute();renderHUD()");
 assert.ok(ev('S.pops.fra.dc.tenants')>0);
 assert.ok(ev('S.pops.fra.dc.webClients')>0&&ev('S.pops.fra.dc.cloudClients')>0);
 assert.ok(ev('R.demand')>0&&ev('R.rev.hosting')>0);
 assert.ok(ev("document.getElementById('hMood').title.includes('customers')"));
 ev("gridOutage('fra',5,{regional:true});compute()");
 assert.equal(ev('R.rev.hosting'),0);
 assert.equal(ev("scrubCapacity('fra')"),0);
 ev("S.pops.fra.dc.health=10;S.day+=7;hostingTick();ACT.customers()");
 assert.match(ev("document.getElementById('dashCard').textContent"),/Hosting customers/);
 assert.deepEqual(errors,[]);
});

test('rack space and router ports are finite, and removing a server needs confirmation',()=>{
 const {ev}=load();start(ev);ev("ACT.rackBuy({city:'fra'});S.pops.fra.dc.tenants=20");
 const cash=ev('S.cash');ev("ACT.serverBuy({city:'fra',role:'web'})");
 assert.equal(ev('S.cash'),cash);assert.equal(ev('S.pops.fra.dc.tenants'),20);
 ev("ACT.coloRelease({city:'fra'});ACT.coloRelease({city:'fra'});ACT.serverBuy({city:'fra',role:'web'});S.pops.fra.dc.webClients=20;ACT.serverRemove({city:'fra',role:'web'})");
 assert.equal(ev('S.pops.fra.dc.web'),1);
 ev("ACT.serverRemove({city:'fra',role:'web'})");assert.equal(ev('S.pops.fra.dc.webClients'),0);
 ev("S.pops.fra.dc.racks=8;ACT.rackBuy({city:'fra'})");assert.equal(ev('S.pops.fra.dc.racks'),8,'ninth rack exceeds eight router ports');
});

test('single-server services pause for maintenance; replicas stay up and scrubbing cannot reach isolated cities',()=>{
 const {ev}=load();online(ev);
 ev("ACT.rackBuy({city:'fra'});for(const role of ['web','scrub'])ACT.serverBuy({city:'fra',role});S.pops.fra.dc.webClients=20;S.pops.fra.serverDue=1;S.day=1;operationsTick();compute()");
 assert.equal(ev("dcService('fra').web"),0);assert.equal(ev("scrubCapacity('fra')"),0);
 ev("S.day=2;ACT.serverBuy({city:'fra',role:'web'});ACT.serverBuy({city:'fra',role:'scrub'});S.pops.fra.serverDue=2;operationsTick();compute()");
 assert.equal(ev("dcService('fra').web"),ev("sfOf(R,'fra')"));assert.equal(ev("scrubCapacity('fra')"),200);
 ev("ACT.buildPop({city:'ams'})");assert.equal(ev("scrubCapacity('ams')"),0);
 ev("UI.pending={a:'fra',b:'ams'};ACT.buildLink({tier:1})");assert.equal(ev("scrubCapacity('ams')"),200);
 ev('S.links[0].cut=S.day+5');assert.equal(ev("scrubCapacity('ams')"),0);
});

test('scrubbing capacity reduces attack traffic progressively and protection contracts share the available pool',()=>{
 const {ev}=load();online(ev);
 ev("S.pops.fra.rgen=1;ACT.buyTransit({city:'fra',net:'cog',tier:2});S.pops.fra.bb={d:500};S.ev.ddos={city:'fra',until:10};compute()");
 const before=ev('R.served');
 ev("ACT.rackBuy({city:'fra'});ACT.serverBuy({city:'fra',role:'scrub'});compute()");
 const partial=ev('R.served');assert.ok(partial>before);
 ev("ACT.serverBuy({city:'fra',role:'scrub'});ACT.serverBuy({city:'fra',role:'scrub'});compute()");
 assert.ok(ev('R.served')>partial);
 ev("S.biz=[{id:'a',city:'fra',type:'scrub',bw:200,rate:900,reqs:[]},{id:'b',city:'fra',type:'scrub',bw:200,rate:900,reqs:[]}]");
 assert.equal(ev("scrubFraction('fra')"),.75);
});

test('legacy saves get a fresh schedule, bounded new state, and a searchable persistent event log',()=>{
 const {ev,dom,errors}=load();start(ev);
 ev("S.day=1000;delete S.opsSince;S.pops.fra.dc={racks:999,web:Infinity,cloud:-1,scrub:0,tenants:9999,webClients:9999,cloudClients:9999,health:-5};S=migrate(JSON.parse(JSON.stringify(S)));operationsTick()");
 assert.ok(ev("maintenanceDate('fra','router')")>1000);
 assert.ok(ev('S.pops.fra.dc.tenants+dcSlots(S.pops.fra.dc)<=MAX_RACKS*RACK_U'));
 ev("for(let i=0;i<350;i++)recordEvent('Generator event '+i,'good','power','fra');ACT.eventLog();ACT.logFilter({v:'power'});document.getElementById('logQuery').value='event 349';ACT.logSearch();save()");
 assert.equal(ev('S.log.length'),300);
 assert.match(ev("document.getElementById('dashCard').textContent"),/1 matching entries/);
 const saved=dom.window.localStorage.getItem('sot-save-v1');
 const other=load({storage:{'sot-save-v1':saved}});
 assert.equal(other.ev('S.log.length'),300);
 other.ev('ACT.eventLog()');assert.match(other.ev("document.getElementById('dashCard').textContent"),/Generator event 349/);
 assert.deepEqual(errors,[]);assert.deepEqual(other.errors,[]);
});


test('a second feed can rescue a local fault, but not a regional blackout',()=>{
 const {ev}=load();start(ev);ev("gridOutage('fra',4);ACT.powerBuy({city:'fra',item:'dualFeed'});compute()");
 assert.equal(ev("!!popUp('fra')"),true);
 ev("S.pops.fra.dualFeed=false;gridOutage('fra',4,{regional:true});ACT.powerBuy({city:'fra',item:'dualFeed'});compute()");
 assert.equal(ev("!!popUp('fra')"),false);
});

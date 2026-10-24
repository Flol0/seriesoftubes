const test = require('node:test');
const assert = require('node:assert/strict');
const {load} = require('./harness');

test('customers: warnings, persistent summary, sorting and optional furious pause', () => {
  const {ev, errors,dom} = load();
  ev("ACT.start({});S.cash=1e9;S.day=100;S.biz=[{id:'unhappy',name:'Patch Panic',type:'dia',city:'fra',bw:10,rate:100,mood:61,since:0,reqs:[]}];dayTick();renderHUD();ACT.customers()");
  assert.match(ev("document.getElementById('dashCard').textContent"), /Patch Panic.*Not enough service/s);
  assert.match(ev("document.body.textContent"), /is unhappy/);
  assert.match(ev("document.getElementById('hMood').textContent"), /%/);
  ev("ACT.customerSort({k:'revenue'});S.biz[0].mood=31;S.biz[0].warned=false;UI.speed=8;dayTick()");
  assert.equal(ev('UI.speed'),0);
  assert.equal(ev('S.biz.length'),1, 'one bad day cannot skip the furious warning');
  ev("ACT.autoPauseSet({v:'off'});S.biz[0].warned=false;S.biz[0].mood=31;S.biz[0].warned=false;UI.speed=8;dayTick()");
  assert.equal(ev('UI.speed'),8);
  assert.equal(dom.window.localStorage.getItem('sot-auto-pause'),'0');
  assert.deepEqual(errors,[]);
});

test('PNI directory includes remote meet-me rooms and local breakout accepts PNIs',()=>{
  const {ev,errors}=load();
  ev("ACT.start({});S.cash=1e9;ACT.pniFind({net:'ggl'})");
  assert.match(ev("document.getElementById('modalCard').textContent"),/Build a POP here first/);
  assert.equal(ev("REQS.local.ok({city:'fra'})"),false);
  ev("S.pni.push({id:'p',net:'ggl',city:'fra',tier:1})");
  assert.equal(ev("REQS.local.ok({city:'fra'})"),true);
  ev("ACT.pniCity({city:'fra'})");
  assert.equal(ev('UI.tab'),'peer');
  assert.deepEqual(errors,[]);
});

test('shark-averse offers always stay on one landmass',()=>{
  const {ev}=load();
  ev("ACT.start({});S.cash=1e9;S.lvl=4;for(const c of ['nyc','tok','sao'])ACT.buildPop({city:c})");
  const result=JSON.parse(ev("JSON.stringify((()=>{let sharks=0;for(let i=0;i<3000;i++){S.offers=[];spawnOffer();for(const o of S.offers)if(o.reqs.includes('sharks')){sharks++;if(isSub(o.city,o.city2))throw Error('Impossible shark route');}}return {sharks};})())"));
  assert.ok(result.sharks>0);
});

test('unlightable dark fiber is rejected before payment or building a POP',()=>{
  const {ev}=load();
  ev("ACT.start({});S.cash=1e9;S.lvl=4;UI.pending={a:'fra',b:'sin'};UI.dfSrc='build';UI.dfSys='roadm'");
  assert.ok(ev("kmBetween('fra','sin')>dfMaxReach()"));
  ev('ACT.orderDf()');
  assert.equal(ev('S.cash'),1e9);
  assert.equal(ev('S.links.length'),0);
  assert.equal(ev('!!S.pops.sin'),false);
  assert.match(ev("dfModalBody('fra','sin',kmBetween('fra','sin'),0)"),/longest-reach/);
});

test('parallel cable waves group by segment without merging other cables or dark fiber',()=>{
  const {ev,errors}=load();
  ev("ACT.start({});S.cash=1e9;S.lvl=4;S.pops.lon={rgen:3,routers:6};S.pops.ams={rgen:3,routers:6};const cp=cablesFor('lon','ams')[0];for(let i=0;i<8;i++)S.links.push({id:'w'+i,a:i%2?'ams':'lon',b:i%2?'lon':'ams',kind:'wave',tier:1,cable:cp.cid,sub:true,km:cp.km,mo:100,cut:0});compute()");
  assert.equal(ev('mapLinks().length'),1);
  assert.equal(ev('mapWaveGroup(S.links[0]).length'),8);
  ev("UI.sel={type:'link',id:'w7'};draw(100);ACT.selLink({id:'w0'})");
  assert.match(ev("document.getElementById('panelBody').textContent"),/8 waves on this cable/);
  ev("S.links.push({...S.links[0],id:'other',cable:'different'});S.links.push({...S.links[0],id:'df',kind:'df',sys:'lite',ch:[],ready:30})");
  assert.equal(ev('mapLinks().length'),3);
  assert.deepEqual(errors,[]);
});

test('1.10 rival IX incidents and de-peering never treat exchange IDs as city IDs',()=>{
  const {ev,errors}=load();
  ev("ACT.start({});S.cash=1e9;const x=XIX.find(x=>x.c==='fra').id;S.ixp={[x]:0};S.rs={[x]:true};for(let i=0;i<800&&!S.inc.some(x=>x.type==='maxpfx');i++)fireFailure()");
  assert.ok(ev("S.inc.some(x=>x.type==='maxpfx')"));
  assert.deepEqual(errors,[]);
});


test('switching from customers to the NOC restores the dashboard even when data is unchanged',()=>{
  const {ev}=load();
  ev("ACT.start({});ACT.dash();ACT.customers();ACT.dashClose();ACT.dash()");
  assert.match(ev("document.getElementById('dashCard').textContent"),/PNI directory/);
  ev("ACT.pniPick()");
  assert.match(ev("document.getElementById('modalCard').textContent"),/meet-me rooms/);
});

test('a furious customer interrupts an eight-speed catch-up frame immediately',()=>{
  const {ev}=load();
  ev("ACT.start({});S.cash=1e9;S.day=100;S.biz=[{id:'x',name:'Panic',type:'dia',city:'fra',bw:10,rate:100,mood:31,since:0,reqs:[]}];UI.speed=8;closeModal();acc=DAY_MS*4;last=performance.now();frame(last+1)");
  assert.equal(ev('S.day'),101);
  assert.equal(ev('UI.speed'),0);
});

test('de-peering at a rival exchange uses its parent city in the notice',()=>{
  const {ev}=load();
  ev("ACT.start({});S.cash=1e9;const rival=XIX.find(x=>x.c==='fra').id;let found=false;for(let d=1;d<800&&!found;d++){S.day=d-1;for(const n of NETS.filter(bigPeer))if(snub(n.id,rival)){S.peers={[n.id+'@'+rival]:true};found=true;break;}}if(!found)throw Error('no snub found');dayTick()");
  assert.equal(ev('Object.keys(S.peers).length'),0);
  assert.match(ev('document.body.textContent'),/de-peered you in Frankfurt/);
});

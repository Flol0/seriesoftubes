const test=require('node:test');
const assert=require('node:assert/strict');
const {load}=require('./harness');
function base(ev){ev("ACT.start({});S.cash=1e12;S.lvl=4;UI.autoCongestion=false;for(const g of GOALS)S.done[g.id]=0;S.pops.fra.rgen=10");}

test('cache pools grow past four, upgrade to 1.6T, bill all boxes and survive saves',()=>{
 const {ev,errors}=load();base(ev);
 ev("S.pops.fra.bb={d:3000};ACT.buyTransit({city:'fra',net:'cog',tier:4});for(let i=0;i<8;i++)ACT.cache({city:'fra',net:'ggl'});compute()");
 assert.equal(ev("S.caches.reduce((v,c)=>v+cacheCount(c),0)"),8);
 assert.equal(ev('S.caches.length'),1,'one scalable pool, not thousands of routing exits');
 assert.equal(ev('R.cost.caches'),3200);
 ev("ACT.cacheUp({city:'fra',net:'ggl'});ACT.cacheUp({city:'fra',net:'ggl'});compute()");
 assert.equal(ev('cacheCap(S.caches[0])'),12800);
 assert.equal(ev('R.cost.caches'),20000);
 ev('S=migrate(JSON.parse(JSON.stringify(S)));compute()');assert.equal(ev('cacheCap(S.caches[0])'),12800);
 ev('ACT.rmCache({id:S.caches[0].id})');assert.equal(ev('cacheCount(S.caches[0])'),7);
 assert.deepEqual(errors,[]);
});

test('full or offline caches spill to transit instead of black-holing traffic',()=>{
 const {ev}=load();base(ev);
 ev("for(const n of NETS)NSH[n.id]=n.id==='ggl'?1:0;S.pops.fra.bb={d:300};ACT.buyTransit({city:'fra',net:'cog',tier:2});ACT.cache({city:'fra',net:'ggl'});compute()");
 assert.ok(Math.abs(ev('R.served')-300)<1e-6);
 assert.equal(ev('R.useCache[S.caches[0].id]'),100);
 assert.equal(ev('R.useT[S.transit[0].id]'),200);
 ev("ACT.addSite({city:'fra'});S.transit[0].site='b';addInc({type:'site',ref:'fra',site:'a',until:5,msg:'Power lost',cost:0});compute()");
 assert.equal(ev('R.useCache[S.caches[0].id]||0'),0);
 assert.ok(Math.abs(ev('R.served')-300)<1e-6);
});

test('100% circuit load pauses once, waits for 10% headroom to re-arm, and can be disabled',()=>{
 const {ev}=load();base(ev);ev("UI.pending={a:'fra',b:'ams'};ACT.buildLink({tier:0});UI.autoCongestion=true;UI.speed=8;R.load[S.links[0].id]=10;congestionCheck()");
 assert.equal(ev('UI.speed'),0);assert.match(ev('document.body.textContent'),/Capacity reached/);
 ev("UI.speed=8;congestionCheck()");assert.equal(ev('UI.speed'),8);
 ev('R.load[S.links[0].id]=9.5;congestionCheck();R.load[S.links[0].id]=10;congestionCheck()');assert.equal(ev('UI.speed'),8);
 ev('R.load[S.links[0].id]=8.9;congestionCheck();R.load[S.links[0].id]=10;congestionCheck()');assert.equal(ev('UI.speed'),0);
 ev("ACT.congestionSet({v:'off'});UI.speed=8;congestionCheck()");assert.equal(ev('UI.speed'),8);
 assert.equal(ev("localStorage.getItem('sot-congestion-pause')"),'0');
});

test('capacity alerts interrupt an eight-speed frame before further days run',()=>{
 const {ev}=load();base(ev);ev("ACT.buildPop({city:'ams'});S.pops.ams.bb={d:100};UI.pending={a:'fra',b:'ams'};ACT.buildLink({tier:0});ACT.buyTransit({city:'fra',net:'cog',tier:2});UI.autoCongestion=true;UI.fullSeen=new Set();UI.speed=8;closeModal();acc=DAY_MS*4;last=performance.now();frame(last+1)");
 assert.equal(ev('S.day'),1);assert.equal(ev('UI.speed'),0);
});

test('customer expansion requires acceptance, waits 30 days, increases revenue and gives provisioning grace',()=>{
 const {ev}=load();base(ev);ev("ACT.buyTransit({city:'fra',net:'cog',tier:4});S.biz=[{id:'grow',name:'Growing Pains',type:'host',city:'fra',bw:20,rate:60,mood:100,since:0,reqs:[],growthNext:90}];S.day=90;customerGrowthTick();compute()");
 const target=ev('S.biz[0].growth.bw');assert.ok(target>20);assert.equal(ev('S.biz[0].bw'),20);
 const before=ev('R.rev.business');ev("ACT.growthAccept({id:'grow'});S.day=119;customerGrowthTick()");assert.equal(ev('S.biz[0].bw'),20);
 ev('S=migrate(JSON.parse(JSON.stringify(S)));S.day=120;customerGrowthTick();compute()');
 assert.equal(ev('S.biz[0].bw'),target);assert.equal(ev('S.biz[0].growthGraceUntil'),135);assert.ok(ev('R.rev.business')>before);
 assert.equal(ev('!!S.biz[0].growth'),false);
});

test('declining or ignoring expansions keeps the existing contract and obsolete types never grow',()=>{
 const {ev}=load();base(ev);ev("S.biz=[{id:'a',name:'Keep It Small',type:'dia',city:'fra',bw:10,rate:600,mood:100,since:0,reqs:[],growthNext:1}];S.day=1;customerGrowthTick();ACT.growthDecline({id:'a'})");
 assert.equal(ev('S.biz[0].bw'),10);assert.equal(ev('!!S.biz[0].growth'),false);
 ev("S.biz[0].growth={bw:20,due:2,accepted:false};S.day=2;customerGrowthTick()");assert.equal(ev('S.biz[0].bw'),10);
 ev("S.biz[0].type='event';S.biz[0].growthNext=0;S.day=999;customerGrowthTick()");assert.equal(ev('!!S.biz[0].growth'),false);
});

test('double taps cannot invoke default zoom, while pinch and reset remain available',()=>{
 const {ev,dom}=load();base(ev);const z=ev('cam.z');
 const e=new dom.window.MouseEvent('dblclick',{bubbles:true,cancelable:true});dom.window.document.getElementById('map').dispatchEvent(e);
 assert.equal(e.defaultPrevented,true);assert.equal(ev('cam.z'),z);
 assert.match(dom.window.document.documentElement.outerHTML,/touch-action:manipulation/);
 ev("cv.setPointerCapture=()=>{};const ptr=(type,id,x,y)=>{const e=new Event(type,{bubbles:true,cancelable:true});Object.assign(e,{pointerId:id,pointerType:'touch',clientX:x,clientY:y});cv.dispatchEvent(e);};window.__ptr=ptr;ptr('pointerdown',1,10,10);ptr('pointerdown',2,100,10);ptr('pointermove',2,220,10)");
 assert.ok(ev('cam.z')>z);
 ev("__ptr('pointerup',2,220,10)");assert.equal(ev('UI.drag.mode'),'pan','one remaining finger resumes panning');
 ev("__ptr('pointerup',1,10,10);ACT.mapReset()");assert.equal(ev('UI.drag'),null);assert.equal(ev('cam.z'),ev('innerWidth<760?1.1:1.4'));
});

test('new cities have valid land, carriers, peering, cable routes and finite power costs in every region',()=>{
 const {ev,errors}=load();base(ev);
 for(const c of ['van','wpg','cas','dkr','acc','lad','dar','tas','alm','han']){
  assert.ok(ev(`inPoly(CITY.${c}.x,CITY.${c}.y,LANDS.find(l=>l.id===CITY.${c}.land).pts)`),c);
  assert.ok(ev(`NETS.some(n=>n.price&&n.pops.includes('${c}'))`));
  ev(`ACT.buildPop({city:'${c}'});selectCity('${c}');for(const t of ['cust','up','peer','links','hosting'])ACT.tab({t})`);
 }
 ev("for(const c of ALLC)S.pops[c]=S.pops[c]||{day:0,rgen:0,routers:1};compute();ACT.openNoc()");
 assert.ok(ev('Object.values(R.cost).every(Number.isFinite)'));
 assert.ok(ev("ALLC.every(c=>Number.isFinite(powerRate(c))&&Number.isFinite(powerBill(c)))"));
 assert.deepEqual(errors,[]);
});

test('fabric upgrades scale beyond 100G, validate interface speeds and repair malformed imported NNIs',()=>{
 const {ev}=load();base(ev);ev("ACT.buildPop({city:'ams'});S.pops.ams.rgen=10;ACT.buyNni({city:'fra',prov:'mgp',tier:3});ACT.buyNni({city:'ams',prov:'mgp',tier:3});ACT.buyVxc({a:'fra',b:'ams',prov:'mgp',t:4});compute()");
 assert.equal(ev('capOf(S.links[0])'),1600);
 ev("S.nni.push({city:'fra',prov:'mgp',tier:999});S.nni.push({city:'not-real',prov:'none',tier:'length'});S=migrate(JSON.parse(JSON.stringify(S)));compute()");
 assert.ok(ev('S.nni.every(x=>NNI[x.tier]&&FAB[x.prov])'));assert.ok(ev('Number.isFinite(R.costMo)'));
 ev("ACT.buyVxc({a:'fra',b:'ams',prov:'none',t:999})");
});

test('endgame footprints carry hundreds of terabits with large cache pools and no non-finite accounting',t=>{
 const {ev,errors}=load();base(ev);
 const started=Date.now();
 ev("const footprint=ALLC.filter(c=>NET.drz.pops.includes(c)).slice(0,24);S.links=[];S.transit=[];S.caches=[];for(const c of footprint){S.pops[c]={day:0,rgen:10,routers:16,bb:{d:10000},dc:{...DC_EMPTY,racks:128}};S.transit.push({id:'transit-'+c,city:c,net:'drz',tier:4,n:32});S.caches.push({id:'cache-'+c,city:c,net:'ggl',tier:2,n:100});}for(let i=1;i<footprint.length;i++)S.links.push({id:'backbone-'+i,a:footprint[i-1],b:footprint[i],kind:'wave',tier:5,km:1000,mo:10000});compute()");
 assert.ok(ev('R.demand')>=240000);assert.ok(ev('R.served/R.demand')>.97);
 assert.ok(ev('Object.values(R.cost).every(Number.isFinite)&&Number.isFinite(R.revMo)'));
 ev('S=migrate(JSON.parse(JSON.stringify(S)));compute()');
 assert.equal(ev('Math.max(...Object.values(S.pops).map(p=>p.dc?.racks||0))'),128);
 assert.equal(ev('Math.max(...S.transit.map(t=>t.n))'),32);
 assert.deepEqual(errors,[]);t.diagnostic('24-POP, 240T demand scenario including reload: '+(Date.now()-started)+' ms');
});


test('a last unavailable router does not invent forwarding capacity',()=>{const {ev}=load();base(ev);ev("S.pops.fra.routers=1;S.pops.fra.rdown=10");assert.equal(ev("nodeCap('fra')"),0);});


test('iPad fallback suppresses stationary double taps without swallowing button actions or scroll gestures',()=>{
 const {dom}=load();const w=dom.window,d=w.document;const button=d.createElement('button');d.getElementById('hud').append(button);let clicks=0;button.onclick=()=>clicks++;
 function touch(target,type,x,y,multi=false){const e=new w.Event(type,{bubbles:true,cancelable:true});const p={clientX:x,clientY:y};Object.assign(e,{touches:type==='touchend'?[]:multi?[p,p]:[p],changedTouches:[p]});target.dispatchEvent(e);return e;}
 touch(button,'touchstart',10,10);assert.equal(touch(button,'touchend',10,10).defaultPrevented,false);button.click();
 touch(button,'touchstart',10,10);assert.equal(touch(button,'touchend',10,10).defaultPrevented,true);assert.equal(clicks,2);
 touch(button,'touchstart',10,10);touch(button,'touchmove',10,60);assert.equal(touch(button,'touchend',10,60).defaultPrevented,false);
 touch(button,'touchstart',10,10,true);assert.equal(touch(button,'touchend',10,10).defaultPrevented,false);
 const input=d.createElement('input');d.getElementById('hud').append(input);for(let i=0;i<2;i++){touch(input,'touchstart',10,10);assert.equal(touch(input,'touchend',10,10).defaultPrevented,false);}
});

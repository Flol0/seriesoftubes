/* ---------- guided first game ---------- */
const TUT=[
 {t:tr('tutorial.your_router_is_live_press_launch'),sel:'[data-act="launchBB"]',ok:()=>S.pops[S.home]&&S.pops[S.home].bb},
 {t:tr('tutorial.your_customers_want_the_whole'),sel:'[data-act="tab"][data-args*=\'"up"\'],[data-act="buyTransit"]',ok:()=>S.transit.length>0,skip:()=>!NETS.some(n=>sellsAt(n,S.home))},
 {t:tr('tutorial.transit_costs_money_per_gigabit'),sel:'[data-act="tab"][data-args*=\'"peer"\'],[data-act="buyIx"],[data-act="rs"]',ok:()=>Object.keys(S.rs).length>0,skip:()=>!ixName(S.home)},
 {t:tr('tutorial.start_the_clock_with_1_and'),sel:'#sp1',ok:()=>S.day>=5},
 {t:tr('tutorial.grow_drag_from_your_pink_router'),sel:null,ok:()=>S.links.length>0},
 {t:tr('tutorial.businesses_pop_up_as_bubbles_on'),sel:'[data-act="leftTab"][data-args*=\'"deals"\']',ok:()=>S.biz.length>0},
];
function tutorialStart(){let done=false;try{done=!!localStorage.getItem('sot-tut');}catch(e){}if(done||window.__TUBES_TEST__&&!window.__TUBES_TUT__)return;S.tut=0;renderCoach();}
function renderCoach(){const el=$('coach');if(!el)return;document.querySelectorAll('.coach-glow').forEach(x=>x.classList.remove('coach-glow'));
  if(!S||S.tut===undefined||S.tut===null||S.lost){el.hidden=true;return;}
  while(S.tut<TUT.length){const st=TUT[S.tut];let ok=false;try{ok=st.ok()||(st.skip&&st.skip());}catch(e){}if(!ok)break;S.tut++;}
  if(S.tut>=TUT.length){S.tut=null;el.hidden=true;try{localStorage.setItem('sot-tut','1');}catch(e){}toast(tr('tutorial.you_know_the_basics_the_goals'),'goal');return;}
  const st=TUT[S.tut];el.innerHTML=`<div class="ct"><span class="cs">${tr('tutorial.step_n_of_total',{n:S.tut+1,total:TUT.length})}</span>${esc(st.t)}</div>${btn(tr('common.skip_tutorial'),'tutSkip',{},'ghost sm')}`;el.hidden=false;
  if(st.sel){const t=document.querySelector(st.sel);if(t)t.classList.add('coach-glow');}}

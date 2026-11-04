/* Mergers (#155): a year in, Spectre-um Cable finishes swallowing Coax; a year later Very-Zone does the same to Final
   Frontear. The old brand's PNIs move to the new owner and come under its terms (Very-Zone charges for peering), its IX
   sessions end, and it takes no new sessions. Its customers stay reachable through the new owner (its `up`). */
const MERGERS=[{id:'cxc',into:'spc',day:365},{id:'ftr',into:'vzn',day:730}];
const merged=id=>!!(S&&S.merged&&S.merged[id]);
function mergerDay(d){for(const m of MERGERS){if(d<m.day||merged(m.id))continue;S.merged=S.merged||{};S.merged[m.id]=d;
  let moved=0,ended=0;
  for(const p of S.pni.slice()){if(p.net!==m.id)continue;moved++;
    if(S.pni.some(x=>x!==p&&x.net===m.into&&x.city===p.city))S.pni=S.pni.filter(x=>x!==p);else p.net=m.into;}
  for(const k in S.peers)if(k.startsWith(m.id+'@')){delete S.peers[k];ended++;}
  const v={net:esc(NET[m.into].name),old:esc(NET[m.id].name)};
  toast(tr('mergers.net_has_swallowed_old',v)+(moved?' '+trn('mergers.n_pni_moves_to_net',moved,v):'')+(ended?' '+trn('mergers.n_ix_session_ended',ended,v):'')+(moved&&NET[m.into].pol==='paid'&&!paidFree(NET[m.into])?' '+tr('mergers.net_charges_for_peering',v):''),moved||ended?'bad':'');}}

/* Pitcairn (#124): no cable lands there yet, but you may land your own, and the UK pays a monthly grant while the
   islanders are online through you: a POP with broadband, up and nearly fully served. */
const GRANT_MO=300000;
const grantOn=r=>!!(S&&S.pops.pcn&&S.pops.pcn.bb&&!(S.pops.pcn.down>S.day)&&sfOf(r,'pcn')>=0.9);
function grantFact(c){if(c!=='pcn')return '';const on=grantOn(R);return `<span class="fact${on?' mine':''}">${on?tr('pitcairn.uk_grant_mo',{mo:fmt$(GRANT_MO)}):tr('pitcairn.uk_grant_mo_once_islanders',{mo:fmt$(GRANT_MO)})}</span>`;}

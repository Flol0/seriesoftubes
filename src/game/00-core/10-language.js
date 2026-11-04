/* ================= LANGUAGE =================
   Text is looked up by label: tr('pnis.delivery_2_to_6_weeks',vars) returns the player's language, or the
   English from src/i18n/en.js (inlined above the game) when a translation is missing, and fills {placeholders}.
   trn(label,n,vars) picks the "one" or "other" form of a plural. N_() marks a label kept in a table or a
   save, translated where it is shown. A label that is not in any dictionary comes back as it is. */
// English when the dictionary did not load (offline, or a copy without the i18n folder).
const LANGS=window.SOT_LANGS,LANG=window.I18N?.[window.SOT_LANG]?window.SOT_LANG:'en';
document.documentElement.lang=LANG;
const EN=window.I18N.en,DICT=Object.assign(Object.create(null),EN,LANG!=='en'&&window.I18N[LANG]);
// Saves from before labels (1.34 and older) hold English text where newer ones hold a label: map it on first use.
let EN_TEXT=null;
function trKey(k){const o=DICT[k];if(o!==undefined)return o;
  if(!EN_TEXT){EN_TEXT=new Map();for(const l in EN){const e=EN[l],t=DICT[l];if(typeof e==='string')EN_TEXT.set(e,t);else{EN_TEXT.set(e.one,t.one||e.one);EN_TEXT.set(e.other,t.other||e.other);}}}
  return EN_TEXT.get(k)??k;}
const fillIn=(o,v)=>v?o.replace(/\{(\w+)\}/g,(m,k)=>k in v?v[k]:m):o;
function tr(k,v){const o=trKey(k);return fillIn(typeof o==='string'?o:o.other,v);}
function trn(k,n,v){const o=trKey(k);return fillIn(typeof o==='string'?o:n===1?o.one:o.other,{n,...v});}
function N_(s){return s;}

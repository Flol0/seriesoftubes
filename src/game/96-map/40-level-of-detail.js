/* Level of detail (#37): zoomed out the map turns into a network map, with dots for cities, small
   router pills for your POPs and thinner links. Phones switch a little earlier, the screen is small. */
const lodFar=()=>cam.z<(innerWidth<=760?0.95:0.72);
// One native call draws the same rounded box where the browser has it and the corners fit (hundreds per frame).
function rr(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect&&2*r<=w&&2*r<=h){ctx.roundRect(x,y,w,h,r);return;}ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
// Enough world copies to cover any screen width at any zoom (the map wraps horizontally).
function visibleKs(){const ks=[];for(let k=-5;k<=5;k++){const a=toS(0,0,k)[0],b=toS(W,0,k)[0];if(b>-200&&a<CW+200)ks.push(k);}return ks;}
const GEO=new Map();

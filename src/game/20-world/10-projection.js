/* ================= WORLD ================= */
// Simplified real geography: lon/lat outlines, equirectangular, with gentle "magnifying lenses" over the busy regions.
const LENSES=[{lon:102.5,lat:2.6,r:22,m:1.1},{lon:52.5,lat:25.3,r:45,m:1.5},{lon:78.5,lat:15,r:48,m:1.1},{lon:-44.5,lat:-23.5,r:30,m:1.2},{lon:9,lat:49,r:170,m:1.25},{lon:121,lat:32,r:120,m:0.45},{lon:-80,lat:40,r:110,m:0.5}];
function proj0(lon,lat){return [(lon+180)/360*W,(84-lat)*6.4];}
for(const L of LENSES){const q=proj0(L.lon,L.lat);L.x=q[0];L.y=q[1];}
function proj(lon,lat){const q=proj0(lon,lat);let dx=0,dy=0;for(const L of LENSES){let ex=q[0]-L.x;ex-=W*Math.round(ex/W);const ey=q[1]-L.y,f=L.m*Math.exp(-(ex*ex+ey*ey)/(L.r*L.r));dx+=ex*f;dy+=ey*f;}return [q[0]+dx,q[1]+dy];}
function hav(lo1,la1,lo2,la2){const r=Math.PI/180,dLa=(la2-la1)*r,dLo=(lo2-lo1)*r,a=Math.sin(dLa/2)**2+Math.cos(la1*r)*Math.cos(la2*r)*Math.sin(dLo/2)**2;return 2*6371*Math.asin(Math.min(1,Math.sqrt(a)));}

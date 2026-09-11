(()=>{
if(window.__EB_CAR20)return;window.__EB_CAR20=1;
const s=window.__ebSocket;const $=id=>document.getElementById(id);const N=v=>Number.isFinite(+v)?+v:0;
let passengerIndex=-1,lastNearby=-1;
function state(i){return window.__ebP18B?.find(p=>p.id!==s?.id&&p.driving&&p.carIndex===i)||window.__ebCarState20?.get?.(i)||null}
function currentIndex(){try{return Array.isArray(drivableCars)?drivableCars.findIndex(c=>c?.userData?.__ebLocalDrive): -1}catch{return-1}}
function ensureBtn(){let b=$('ebPassenger20');if(b)return b;b=document.createElement('button');b.id='ebPassenger20';b.type='button';b.textContent='Pasajero';b.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483646;display:none;min-width:108px;height:42px;padding:0 16px;border:2px solid #40c9ff;border-radius:9px;background:#07101bf5;color:#fff;font:bold 14px Arial;box-shadow:0 4px 18px #0008;touch-action:manipulation';b.onclick=()=>{try{if(typeof window.enterNearestCar==='function')window.enterNearestCar()}catch{}};document.body.appendChild(b);return b}
function passengerMode(on){const b=$('ebPassenger18');if(b)b.style.display=on?'block':'none';const p=$('ebPassenger20');if(p)p.style.display='none';window.__ebPassengerMode20=!!on;if(!on)return;
 try{for(const a of document.querySelectorAll('audio,video')){try{a.pause()}catch{}}
  for(const k of ['backgroundMusic','musicAudio','gameMusic','bgMusic','music','audio']){try{const a=window[k];if(a?.pause)a.pause()}catch{}}
  const st=window.__ebCarState20?.get?.(passengerIndex)?.radio;
  if(st&&typeof window.startCarRadio==='function')window.startCarRadio(false);
  if(st&&typeof window.updateCarRadioUI==='function')window.updateCarRadioUI();
  if(st&&typeof window.__ebSetRadioState18==='function')window.__ebSetRadioState18(st);
 }catch{}
}
function monitor(){ensureBtn();const b=$('ebPassenger20');let show=-1;try{
 if(typeof character==='undefined'||!character||!Array.isArray(drivableCars)){b.style.display='none';return}
 const already=!!window.__ebPassenger18||!!window.__ebPassengerMode20||passengerIndex>=0;
 if(already){b.style.display='none';return}
 let best=-1,bestD=56;
 for(let i=0;i<drivableCars.length;i++){const c=drivableCars[i];if(!c?.parent)continue;const dx=N(character.position.x)-N(c.position.x),dz=N(character.position.z)-N(c.position.z),d=dx*dx+dz*dz;if(d<bestD){bestD=d;best=i}}
 if(best>=0){const busy=state(best);if(busy&&busy.id!==s?.id)show=best}
 b.style.display=show>=0?'block':'none';if(show>=0)lastNearby=show;
 }catch{b.style.display='none'} }
function wire(){if(window.__ebCarState20)return;window.__ebCarState20=new Map();if(s){s.on('car:state',d=>{if(d?.index!==undefined)window.__ebCarState20.set(Number(d.index),d)});s.on('room:welcome',d=>{for(const c of d?.cars||[])if(c?.index!==undefined)window.__ebCarState20.set(Number(c.index),c)});s.on('room:sync',d=>{window.__ebCarState20.clear();for(const c of d?.cars||[])if(c?.index!==undefined)window.__ebCarState20.set(Number(c.index),c)});s.on('car:passenger:ok',d=>{passengerIndex=Number(d.index);passengerMode(true)});s.on('car:passenger:deny',()=>{passengerIndex=-1;passengerMode(false)});s.on('car:claim:ok',()=>{passengerIndex=-1;passengerMode(false)});}
 const oldRelease=window.__ebPassengerExit20||null;window.__ebPassengerExit20=oldRelease;
}
function patchPassengerExit(){try{const b=$('ebPassenger18');if(!b||b.dataset.eb20)return;b.dataset.eb20='1';const old=b.onclick;b.onclick=()=>{passengerIndex=-1;passengerMode(false);try{old?.call(b)}catch{}}}catch{}}
function tick(){wire();patchPassengerExit();monitor();requestAnimationFrame(tick)}
setTimeout(()=>tick(),300);
})();
(()=>{
if(window.__EB_PATCHES_20260910)return;window.__EB_PATCHES_20260910=1;
const $=id=>document.getElementById(id),N=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const socket=()=>window.__ebSocket?.connected?window.__ebSocket:null;
let unread=0,lastCarRequest=0;

/* 1) El clon del jugador propio: el avatar remoto podía crearse antes de recibir room:welcome.
      Lo eliminamos en cuanto el ID local ya está disponible. */
function removeSelfRemote(){
 try{
  const me=window.__ebSocket?.id;
  const ra=window.__ebRemoteAvatars||null;
  if(!me||!ra)return;
  const g=ra[me];
  if(g){g.parent?.remove?.(g);delete ra[me]}
 }catch(_){}
}

/* 2) Entrada a vehículos: botón/prompt independiente y respuesta de servidor. */
function nearestCar(){
 try{
  const ch=typeof character!=='undefined'?character:null,cs=typeof drivableCars!=='undefined'?drivableCars:[];
  if(!ch||!Array.isArray(cs))return[-1,null,Infinity];
  let bi=-1,bd=Infinity;
  for(let i=0;i<cs.length;i++){const c=cs[i];if(!c?.position)continue;const d=ch.position.distanceTo(c.position);if(d<bd){bd=d;bi=i}}
  return[bd<=16?bi:-1,bi>=0?cs[bi]:null,bd];
 }catch(_){return[-1,null,Infinity]}
}
function requestCar(){
 const s=socket();if(!s||Date.now()-lastCarRequest<500)return;
 const[id,c]=nearestCar();if(id<0||!c)return;
 lastCarRequest=Date.now();
 s.emit('vehicle:request',{id,station:N(c.userData?.networkStation,0)});
}
function carButton(){
 let b=$('ebEnterCarPatch');
 if(!b){b=document.createElement('button');b.id='ebEnterCarPatch';b.textContent='🚗 ENTRAR';b.style.cssText='position:fixed;left:50%;bottom:150px;transform:translateX(-50%);z-index:1000001;display:none;padding:12px 20px;border:2px solid #ffcc55;border-radius:14px;background:#15110a;color:#fff;font:900 14px Arial;box-shadow:0 0 18px #000;touch-action:manipulation';document.body.appendChild(b);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();requestCar()},{capture:true});}
 try{const[ id,c,d]=nearestCar();const driving=window.__ebLocalVehicle;
  b.style.display=(!driving&&id>=0&&d<=16)?'block':'none';
 }catch(_){}
}
function bindVehicle(){
 const s=socket();if(!s||s.__EB_PATCH_VEHICLE)return;s.__EB_PATCH_VEHICLE=1;
 s.on('vehicle:accepted',v=>{window.__ebLocalVehicle=v;try{if(typeof vehicle!=='undefined')vehicle=v}catch(_){};try{if(typeof drivenCar!=='undefined')drivenCar=drivableCars?.[v.id]}catch(_){};try{if(typeof isDriving!=='undefined')isDriving=v.role==='driver'}catch(_){};try{if(typeof character!=='undefined'&&character){const c=drivableCars?.[v.id];if(c){character.position.copy(c.position);character.visible=false}}}catch(_){};carButton()});
 s.on('vehicle:state',v=>{if(v?.driver===s.id||v?.passenger===s.id){window.__ebLocalVehicle={id:N(v.id),role:v.driver===s.id?'driver':'passenger',station:N(v.station)};try{if(typeof vehicle!=='undefined')vehicle=window.__ebLocalVehicle}catch(_){} }});
 s.on('vehicle:left',()=>{window.__ebLocalVehicle=null;try{if(typeof vehicle!=='undefined')vehicle=null}catch(_){};try{if(typeof character!=='undefined'&&character)character.visible=true}catch(_){};carButton()});
}

/* 3) Cambiar nombre tocando el propio nombre: pointerdown funciona mejor en Android que click. */
function bindName(){
 const p=$('ebOnlinePlayers');if(!p||p.__EB_PATCH_NAME)return;p.__EB_PATCH_NAME=1;
 const open=e=>{const b=e.target?.closest?.('.ebp.me b');if(!b)return;e.preventDefault();e.stopPropagation();
  const s=socket();if(!s)return;const old=(localStorage.getItem('elBromasNick')||b.textContent.replace(/\s*⭐$/,'')||'Jugador').trim();
  const n=window.prompt('Nuevo nombre:',old);if(n==null)return;const name=n.trim().slice(0,20);if(!name)return;
  localStorage.setItem('elBromasNick',name);s.emit('player:name',name);try{drawPlayers?.()}catch(_){}
 };
 p.addEventListener('pointerdown',open,true);p.addEventListener('click',open,true);
}

/* 4) Contador de chats nuevos, separado del texto del botón para que nunca desaparezca. */
function bindChat(){
 const b=$('ebChatButton');if(!b||b.__EB_PATCH_CHAT)return;b.__EB_PATCH_CHAT=1;
 let badge=$('ebChatUnread');if(!badge){badge=document.createElement('span');badge.id='ebChatUnread';b.appendChild(badge)}
 b.style.position='fixed';
 badge.style.cssText='position:absolute;right:-7px;top:-8px;min-width:19px;height:19px;padding:0 4px;border-radius:10px;background:#ff334f;color:#fff;font:900 11px/19px Arial;text-align:center;box-sizing:border-box;display:none;pointer-events:none;border:2px solid #090c14';
 const render=()=>{badge.textContent=String(unread);badge.style.display=unread>0?'block':'none'};render();
 const s=socket();if(s&&!s.__EB_PATCH_CHAT_SOCKET){s.__EB_PATCH_CHAT_SOCKET=1;s.on('chat:message',()=>{const p=$('ebChatPanel');if(!p||getComputedStyle(p).display==='none'){unread++;render()}})}
 const open=e=>{e.preventDefault();e.stopImmediatePropagation();const p=$('ebChatPanel');if(!p)return;const wasOpen=getComputedStyle(p).display!=='none';p.style.display=wasOpen?'none':'block';if(!wasOpen){unread=0;render();setTimeout(()=>$('ebChatInput')?.focus(),60)}try{drawChat?.()}catch(_){} };
 b.addEventListener('pointerdown',open,true);b.addEventListener('touchstart',open,{capture:true,passive:false});b.addEventListener('click',open,true);
}
function tick(){removeSelfRemote();bindVehicle();bindName();bindChat();carButton();requestAnimationFrame(tick)}tick();
})();

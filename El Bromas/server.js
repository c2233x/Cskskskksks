const path=require('path');
const http=require('http');
const fs=require('fs');
const express=require('express');
const {Server}=require('socket.io');

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:'*',methods:['GET','POST']},transports:['websocket','polling'],pingInterval:10000,pingTimeout:20000});
const PORT=Number(process.env.PORT)||10000;
const GAME_FILE=path.join(__dirname,'Salva a cornatan 👈.html');
const MAX_PLAYERS=64;
const players=new Map();
let hostId=null;
let sharedWorld=null;

const clean=v=>String(v??'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador';
const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const poseClean=p=>{const o={};if(!p||typeof p!=='object')return o;for(const [k,v] of Object.entries(p).slice(0,40)){if(Array.isArray(v)&&v.length===3)o[k]=v.map(x=>num(x))}return o};
const snapshot=()=>[...players.values()];
function broadcast(){const a=snapshot();io.emit('world:players',a);io.emit('enhanced:players',a);io.emit('room:players',a);io.emit('online:count',a.length)}
function sanitizeNpc(n){return{id:clean(n?.id).slice(0,64),type:clean(n?.type).slice(0,20),x:num(n?.x),y:num(n?.y),z:num(n?.z),rx:num(n?.rx),ry:num(n?.ry),rz:num(n?.rz),hp:Math.max(0,num(n?.hp)),maxHp:Math.max(1,num(n?.maxHp,1)),scale:Math.max(.05,num(n?.scale,1)),giant:!!n?.giant,walk:num(n?.walk),leap:!!n?.leap}};
function setWorld(d){if(!d||!Array.isArray(d.npcs))return false;sharedWorld={serverTime:Date.now(),wave:Math.floor(num(d.wave,d.round)),mission:!!d.mission,npcs:d.npcs.slice(0,300).map(sanitizeNpc)};return true}

const UI=`<style id="ebOnlineUI">
#mpOnlineHud{display:flex!important;position:fixed!important;left:12px!important;top:12px!important;z-index:2147483646!important;align-items:flex-start;gap:7px;font-family:Arial,sans-serif;pointer-events:auto!important}
#mpOnlineBtn{width:50px!important;height:50px!important;border:2px solid #fff!important;border-radius:50%!important;background:rgba(0,0,0,.88)!important;color:#fff!important;font-size:26px!important;box-shadow:0 0 14px rgba(0,0,0,.6);touch-action:manipulation!important;pointer-events:auto!important;position:relative!important;z-index:2147483647!important;padding:0!important}
#mpOnlineBtn.on{border-color:#39ff88!important;box-shadow:0 0 18px rgba(57,255,136,.7)}
#mpOnlineCount{display:none;border:1px solid #39ff88;border-radius:12px;background:rgba(0,0,0,.88);color:#fff;padding:9px 10px;font:bold 12px Arial;min-width:52px;text-align:center;touch-action:manipulation;pointer-events:auto}
#ebPlayers{display:none;position:fixed;left:10px;top:70px;width:min(355px,88vw);max-height:65vh;overflow:auto;z-index:2147483645;background:rgba(3,6,12,.97);border:1px solid #39ff88;border-radius:14px;padding:7px;color:#fff;font:12px Arial;box-shadow:0 0 24px rgba(0,0,0,.65)}
.ebPlayer{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:8px;align-items:center;padding:8px;border-bottom:1px solid rgba(255,255,255,.08)}
.ebPlayer:last-child{border-bottom:0}.ebPlayer.me{background:rgba(57,255,136,.08);border-radius:9px}.ebN{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ebS{font-size:11px;color:#dce7ff;white-space:nowrap}
#ebProfile{display:none;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647;width:min(320px,84vw);padding:18px;border:1px solid #39ff88;border-radius:16px;background:rgba(3,6,12,.98);color:#fff;text-align:center}
#ebProfile input{width:100%;box-sizing:border-box;padding:10px;border-radius:9px;border:1px solid #555;background:#111;color:#fff;margin:10px 0;color:#fff}
#ebProfileSave,#ebProfileClose{padding:10px 14px;border:0;border-radius:9px;font-weight:900;margin:4px}.ebSave{background:#39ff88}.ebClose{background:#444;color:#fff}
#ebRoomStatus{display:none;position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:2147483647;padding:8px 13px;border-radius:10px;background:rgba(0,0,0,.9);border:1px solid #39ff88;color:#fff;font:900 12px Arial;max-width:90vw;text-align:center}
#ebChat{position:fixed;left:50%;bottom:15px;transform:translateX(-50%);width:min(420px,88vw);z-index:2147483645;display:none;font-family:Arial}
#ebChatHead{display:flex;align-items:center;gap:6px}#ebChatToggle{width:34px;height:28px;border:1px solid #777;border-radius:8px;background:rgba(0,0,0,.82);color:#fff;font-weight:900}
#ebChatLast{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:7px 10px;border-radius:9px;background:rgba(0,0,0,.78);color:#fff;font-size:12px;text-align:center}
#ebChatPanel{display:none;margin-top:5px;background:rgba(0,0,0,.9);border-radius:12px;padding:7px}#ebChatLog{height:125px;overflow:auto;font-size:12px}
#ebChatForm{display:flex;margin-top:5px}#ebChatInput{flex:1;padding:8px;border:0;border-radius:8px}#ebChatSend{margin-left:5px;padding:0 11px;border:0;border-radius:8px;background:#39ff88;font-weight:900}
</style>
<div id="mpOnlineHud"><button id="mpOnlineBtn" type="button" aria-label="Online">🌐</button><button id="mpOnlineCount" type="button" aria-label="Jugadores">0 jugadores</button></div>
<div id="ebPlayers"></div>
<div id="ebProfile"><div style="font-size:20px;font-weight:900">Mi perfil</div><div id="ebProfileStats" style="margin-top:7px;color:#bdd0ef"></div><input id="ebProfileName" maxlength="20" placeholder="Nombre"><div><button id="ebProfileSave" class="ebSave" type="button">Guardar</button><button id="ebProfileClose" class="ebClose" type="button">Cerrar</button></div></div>
<div id="ebRoomStatus"></div>
<div id="ebChat"><div id="ebChatHead"><button id="ebChatToggle" type="button">⌃</button><div id="ebChatLast">Sin mensajes</div></div><div id="ebChatPanel"><div id="ebChatLog"></div><form id="ebChatForm"><input id="ebChatInput" maxlength="120" placeholder="Escribe un mensaje"><button id="ebChatSend" type="submit">➤</button></form></div></div>`;

const CLIENT=`<script>(function(){
'use strict';
function $(id){return document.getElementById(id)}
var btn=$('mpOnlineBtn'),cnt=$('mpOnlineCount'),plist=$('ebPlayers'),prof=$('ebProfile'),pstats=$('ebProfileStats'),pin=$('ebProfileName'),st=$('ebRoomStatus'),chat=$('ebChat'),toggle=$('ebChatToggle'),panel=$('ebChatPanel'),last=$('ebChatLast'),log=$('ebChatLog');
var socket=null,nick='';var lastPlayers=[];
try{nick=(localStorage.getItem('elBromasNick')||'').trim()}catch(e){}
function say(t){if(!st)return;st.textContent=t;st.style.display='block';clearTimeout(st._t);st._t=setTimeout(function(){st.style.display='none'},2600)}
function roundNow(){try{return +window.waveNumber||0}catch(e){return 0}}
function killsNow(){try{return +window.totalPenesKilled||0}catch(e){return 0}}
function connect(){if(socket&&socket.connected)return socket;if(typeof window.io!=='function')return null;try{socket=window.io(location.origin,{path:'/socket.io',transports:['websocket','polling'],reconnection:true,timeout:10000});window.__ebSocket=socket;bindSocket();return socket}catch(e){say('No se pudo conectar');return null}}
function row(p){var d=document.createElement('div');var me=socket&&p.id===socket.id;d.className='ebPlayer'+(me?' me':'');d.innerHTML='<div class="ebN">'+String(p.name||'Jugador').replace(/[<>]/g,'')+(me?' ⭐':'')+'</div><div class="ebS">❤️ '+Math.round(p.hp||0)+'</div><div class="ebS">🌀 '+Math.round(p.aura||0)+'</div><div class="ebS">☠ '+Math.round(p.kills||0)+'</div>';if(me)d.onclick=openProfile;return d}
function render(a){a=Array.isArray(a)?a:[];lastPlayers=a;if(cnt)cnt.textContent=a.length+' jugadores';if(plist){plist.innerHTML='';a.forEach(function(p){plist.appendChild(row(p))})}}
function openProfile(){var me=lastPlayers.find(function(x){return socket&&x.id===socket.id})||{};pin.value=me.name||nick||'Jugador';pstats.textContent='❤️ '+Math.round(me.hp||0)+'   🌀 '+Math.round(me.aura||0)+'   ☠ '+Math.round(me.kills||0)+'   🌊 '+Math.round(me.round||0);prof.style.display='block'}
function bindSocket(){if(!socket||socket.__ebHudBound)return;socket.__ebHudBound=true;socket.on('connect',function(){btn.classList.add('on');cnt.style.display='block';chat.style.display='block';socket.emit('room:join',{name:nick||'Jugador',round:roundNow(),kills:killsNow()});say('Conectado en linea')});socket.on('disconnect',function(){btn.classList.remove('on');cnt.style.display='none';plist.style.display='none';chat.style.display='none'});socket.on('room:players',render);socket.on('online:count',function(n){cnt.textContent=Math.round(n)+' jugadores'});socket.on('room:state',function(w){if(w&&Number.isFinite(+w.wave)){try{if(typeof waveNumber!=='undefined')waveNumber=Math.max(+waveNumber||0,+w.wave||0)}catch(e){}say('Ronda sincronizada: '+Math.round(w.wave||0))}});socket.on('world:snapshot',function(w){if(w&&Array.isArray(w.npcs))window.__ebRoomSnapshot=w});socket.on('player:joined',function(p){if(p)say((p.name||'Jugador')+' se unio al juego')});socket.on('player:left',function(p){if(p)say((p.name||'Jugador')+' salio del juego')});socket.on('chat:message',function(m){if(!m)return;var d=document.createElement('div');d.textContent=(m.name||'Jugador')+': '+(m.text||'');log.appendChild(d);log.scrollTop=log.scrollHeight;last.textContent=d.textContent})}
function clickOnline(e){try{e.preventDefault();e.stopPropagation()}catch(_){}var s=socket&&socket.connected?socket:connect();if(!s){try{alert('No se pudo cargar la conexion online. Recarga el juego.')}catch(_){}return}if(s.connected){s.disconnect();say('Saliste del modo online');return}if(!nick){try{nick=(prompt('Nombre','Jugador')||'Jugador').trim().slice(0,20)||'Jugador';localStorage.setItem('elBromasNick',nick)}catch(_){nick='Jugador'}}s.connect()}
if(btn){btn.style.pointerEvents='auto';btn.addEventListener('click',clickOnline,false);btn.addEventListener('touchend',clickOnline,false)}
if(cnt)cnt.onclick=function(){plist.style.display=plist.style.display==='block'?'none':'block';render(lastPlayers)};
if(toggle)toggle.onclick=function(){var o=panel.style.display==='block';panel.style.display=o?'none':'block';toggle.textContent=o?'⌃':'⌄'};
if($('ebChatForm'))$('ebChatForm').onsubmit=function(e){e.preventDefault();var t=$('ebChatInput').value.trim();if(t&&socket&&socket.connected){socket.emit('chat:message',t);$('ebChatInput').value=''}};
if($('ebProfileSave'))$('ebProfileSave').onclick=function(){nick=(pin.value||'Jugador').trim().slice(0,20)||'Jugador';try{localStorage.setItem('elBromasNick',nick)}catch(_){}if(socket&&socket.connected)socket.emit('player:name',nick);prof.style.display='none';say('Nombre actualizado')};
if($('ebProfileClose'))$('ebProfileClose').onclick=function(){prof.style.display='none'};
window.addEventListener('load',function(){setTimeout(connect,150);});
})();</script>`;

function serveGame(_q,r){
 try{
  let h=fs.readFileSync(GAME_FILE,'utf8');
  h=h.replace(/<script[^>]*src=["']\/socket\.io\/socket\.io\.js["'][^>]*><\/script>/gi,'');
  h=h.replace(/<script[^>]*src=["']https:\/\/cdn\.socket\.io[^"']+["'][^>]*><\/script>/gi,'');
  const injection='<script src="/socket.io/socket.io.js"></script>'+UI+CLIENT+'<script src="/online-sync.js"></script>';
  if(/<\/body>/i.test(h))h=h.replace(/<\/body>/i,injection+'</body>');
  else h+=injection;
  r.set('Cache-Control','no-store, no-cache, must-revalidate, proxy-revalidate');
  r.type('html').send(h);
 }catch(e){console.error(e);r.status(500).send('No se pudo cargar el juego')}
}

app.get('/health',(_q,r)=>r.json({ok:true,online:players.size,max:MAX_PLAYERS,host:!!hostId,synchronized:true}));
app.get('/api/online',(_q,r)=>r.json({ok:true,online:players.size,max:MAX_PLAYERS,synchronized:true,host:!!hostId}));
app.get('/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);
app.get('/Salva a cornatan 👈.html',serveGame);
app.get('/',serveGame);
app.use(express.static(__dirname,{maxAge:'1h'}));

io.on('connection',s=>{
 if(players.size>=MAX_PLAYERS){s.emit('server:full');return s.disconnect(true)}
 if(!hostId)hostId=s.id;
 const p={id:s.id,name:'Jugador',x:0,y:0,z:0,rx:0,ry:0,rz:0,hp:100,aura:0,kills:0,round:0,dead:false,moving:false,running:false,jumping:false,flying:false,attacking:false,special:false,attackPhase:0,specialPhase:0,walkCycle:0,pose:{}};
 players.set(s.id,p);
 s.emit('enhanced:host',{host:s.id===hostId});
 s.emit('world:host',{host:s.id===hostId});
 if(sharedWorld){s.emit('enhanced:world',sharedWorld);s.emit('room:state',sharedWorld);s.emit('world:snapshot',sharedWorld)}
 broadcast();
 s.on('room:join',d=>{p.name=clean(d?.name);p.round=num(d?.round);p.kills=num(d?.kills);if(sharedWorld){s.emit('room:state',sharedWorld);s.emit('world:snapshot',sharedWorld);s.emit('enhanced:world',sharedWorld)}s.broadcast.emit('player:joined',{id:s.id,name:p.name});broadcast()});
 s.on('player:hello',d=>{p.name=clean(d?.name);if(d?.round!=null)p.round=num(d.round);if(d?.kills!=null)p.kills=num(d.kills);s.broadcast.emit('player:joined',{id:s.id,name:p.name});broadcast()});
 s.on('player:name',n=>{p.name=clean(n);broadcast()});
 s.on('player:state',d=>{if(!d)return;Object.assign(p,{name:clean(d.name||p.name),x:num(d.x,p.x),y:num(d.y,p.y),z:num(d.z,p.z),rx:num(d.rx,p.rx),ry:num(d.ry,p.ry),rz:num(d.rz,p.rz),hp:num(d.hp,p.hp),aura:num(d.aura,p.aura),kills:num(d.kills,p.kills),round:num(d.round,p.round),dead:!!d.dead,moving:!!d.moving,running:!!d.running,jumping:!!d.jumping,flying:!!d.flying,attacking:!!d.attacking,special:!!d.special,attackPhase:num(d.attackPhase,p.attackPhase),specialPhase:num(d.specialPhase,p.specialPhase),walkCycle:num(d.walkCycle,p.walkCycle),pose:poseClean(d.pose)});if(s.id===hostId&&Array.isArray(d.npcs))setWorld(d)});
 s.on('player:update',d=>{if(!d)return;Object.assign(p,{name:clean(d.name||p.name),x:num(d.x,p.x),y:num(d.y,p.y),z:num(d.z,p.z),rx:num(d.rx,p.rx),ry:num(d.ry,p.ry),rz:num(d.rz,p.rz),hp:num(d.hp,p.hp),aura:num(d.aura,p.aura),kills:num(d.kills,p.kills),round:num(d.round,p.round),dead:!!d.dead,moving:!!d.moving,running:!!d.running,jumping:!!d.jumping,flying:!!d.flying,attacking:!!d.attacking,special:!!d.special,attackPhase:num(d.attackPhase,p.attackPhase),specialPhase:num(d.specialPhase,p.specialPhase),walkCycle:num(d.walkCycle,p.walkCycle),pose:poseClean(d.pose)});if(s.id===hostId&&Array.isArray(d.npcs))setWorld(d)});
 s.on('enhanced:world',d=>{if(s.id===hostId&&setWorld(d))io.emit('enhanced:world',sharedWorld)});
 s.on('world:snapshot',d=>{if(s.id===hostId&&setWorld(d)){io.emit('world:snapshot',sharedWorld);io.emit('room:state',sharedWorld)}});
 s.on('chat:message',text=>{const t=String(text??'').replace(/[<>]/g,'').trim().slice(0,120);if(t)io.emit('chat:message',{id:s.id,name:p.name,text:t,time:Date.now()})});
 s.on('disconnect',()=>{const wasHost=s.id===hostId;players.delete(s.id);s.broadcast.emit('player:left',{id:s.id,name:p.name});if(wasHost){hostId=players.keys().next().value||null;if(hostId){io.to(hostId).emit('enhanced:host',{host:true});io.to(hostId).emit('world:host',{host:true})}}broadcast()});
});

setInterval(()=>{broadcast();if(sharedWorld)io.emit('enhanced:world',sharedWorld)},100);
server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas synchronized online server listening on '+PORT));

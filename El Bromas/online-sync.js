(function(){'use strict';
if(window.__EB_ONLINE_V8)return;window.__EB_ONLINE_V8=true;

let socket=null,connecting=false,playerId='',host=false,players=[],remote={},lastSend=0;

const poseKeys=['hips','torsoGroup','headGroup','leftShoulder','leftUpperArm','leftElbow','rightShoulder','rightUpperArm','rightElbow','nalgasGroup','leftThigh','leftKnee','rightThigh','rightKnee','tuboGroup'];

function num(v,d=0){const n=Number(v);return Number.isFinite(n)?n:d}
function getNick(){try{return(localStorage.getItem('elBromasNick')||'Jugador').trim()||'Jugador'}catch(_){return'Jugador'}}
function getSession(){
  try{
    let t=localStorage.getItem('elBromasOnlineSession');
    if(!t){
      t='eb-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
      localStorage.setItem('elBromasOnlineSession',t);
    }
    return t;
  }catch(_){return'guest-'+Math.random().toString(36).slice(2)}
}
function getRound(){try{return typeof waveNumber!=='undefined'?num(waveNumber):0}catch(_){return 0}}
function getKills(){try{return typeof totalPenesKilled!=='undefined'?num(totalPenesKilled):0}catch(_){return 0}}
function getPose(){
  const o={},u=typeof character!=='undefined'&&character?character.userData||{}:{};
  poseKeys.forEach(k=>{const x=u[k];if(x&&x.rotation)o[k]=[num(x.rotation.x),num(x.rotation.y),num(x.rotation.z)]});
  return o;
}
function getNpcs(){
  const a=[];
  try{
    if(typeof smallPenes!=='undefined')smallPenes.forEach(x=>{
      x.userData=x.userData||{};
      x.userData.__netId=x.userData.__netId||'s'+Math.random().toString(36).slice(2);
      a.push({id:x.userData.__netId,type:'small',x:x.position.x,y:x.position.y,z:x.position.z,rx:x.rotation.x,ry:x.rotation.y,rz:x.rotation.z,hp:num(x.userData.health),maxHp:num(x.userData.maxHealth,1),scale:num(x.scale?.x,1),walk:num(x.userData.walkCycle),leap:!!x.userData.isLeaping});
    });
    if(typeof boss!=='undefined'&&boss){
      boss.userData=boss.userData||{};
      boss.userData.__netId=boss.userData.__netId||'b'+Math.random().toString(36).slice(2);
      a.push({id:boss.userData.__netId,type:'boss',x:boss.position.x,y:boss.position.y,z:boss.position.z,rx:boss.rotation.x,ry:boss.rotation.y,rz:boss.rotation.z,hp:num(boss.userData.health),maxHp:num(boss.userData.maxHealth,1),scale:num(boss.scale?.x,1),giant:!!boss.userData.isGiant});
    }
    if(typeof activeMiniBosses!=='undefined')activeMiniBosses.forEach(x=>{
      x.userData=x.userData||{};
      x.userData.__netId=x.userData.__netId||'m'+Math.random().toString(36).slice(2);
      a.push({id:x.userData.__netId,type:'mini',x:x.position.x,y:x.position.y,z:x.position.z,rx:x.rotation.x,ry:x.rotation.y,rz:x.rotation.z,hp:num(x.userData.health),maxHp:num(x.userData.maxHealth,1),scale:num(x.scale?.x,1)});
    });
  }catch(_){}
  return a;
}
function makeState(){
  if(!socket||!socket.connected||typeof character==='undefined'||!character)return null;
  const p=character.position,r=character.rotation;
  return {
    session:getSession(),name:getNick(),
    x:p.x,y:p.y,z:p.z,rx:r.x,ry:r.y,rz:r.z,
    pose:getPose(),
    moving:!!window.isMoving,running:!!window.isRunning,jumping:!!window.isJumping,flying:!!window.isFlying,
    attacking:!!window.isAttacking,attackPhase:num(typeof attackPhase!=='undefined'?attackPhase:0),
    special:!!window.isSpecialAttacking,specialPhase:num(typeof specialPhase!=='undefined'?specialPhase:0),
    walkCycle:num(typeof walkCycle!=='undefined'?walkCycle:0),
    round:getRound(),kills:getKills(),hp:num(typeof playerHealth!=='undefined'?playerHealth:100,100),
    aura:num(typeof playerAura!=='undefined'?playerAura:0),dead:!!window.isDead,
    npcs:host?getNpcs():undefined
  };
}
function ensureUI(){
  if(document.getElementById('ebOnlineCount'))return;
  const st=document.createElement('style');
  st.textContent='#ebOnlineCount{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:2147483641;background:rgba(0,0,0,.86);border:1px solid #6c7cff;border-radius:10px;color:#fff;padding:8px 13px;font:900 12px Arial;display:none;pointer-events:auto}#ebOnlinePlayers{position:fixed;left:50%;bottom:62px;transform:translateX(-50%);width:min(380px,90vw);max-height:34vh;overflow:auto;z-index:2147483640;background:rgba(0,0,0,.9);border:1px solid #6c7cff;border-radius:12px;padding:8px;color:#fff;font:12px Arial;display:none;pointer-events:auto}.eb-op-row{display:grid;grid-template-columns:1fr auto auto auto auto;gap:6px;padding:7px;border-bottom:1px solid #334}.eb-op-row.me{background:rgba(70,130,255,.16)}#ebOnlinePing{position:fixed;right:10px;top:10px;z-index:2147483641;background:rgba(0,0,0,.86);border:1px solid #6c7cff;border-radius:8px;color:#fff;padding:5px 8px;font:900 11px Arial}#ebOnlinePause{position:fixed;inset:0;display:none;align-items:center;justify-content:center;text-align:center;background:rgba(0,0,0,.96);z-index:2147483648;color:#fff;font:900 18px Arial}';
  document.head.appendChild(st);
  const c=document.createElement('button');c.id='ebOnlineCount';c.type='button';c.textContent='0 jugadores';document.body.appendChild(c);
  const l=document.createElement('div');l.id='ebOnlinePlayers';document.body.appendChild(l);
  const p=document.createElement('div');p.id='ebOnlinePing';p.textContent='0 ms';document.body.appendChild(p);
  const o=document.createElement('div');o.id='ebOnlinePause';o.innerHTML='📡 CONEXIÓN PERDIDA<br><small>El juego está pausado hasta reconectar.</small><br><button id="ebReconnect" type="button">Reconectar</button>';document.body.appendChild(o);
  c.onclick=()=>{l.style.display=l.style.display==='block'?'none':players.length?'block':'none';renderList()};
  document.getElementById('ebReconnect').onclick=()=>connect(true);
}
function renderList(){
  const l=document.getElementById('ebOnlinePlayers'),c=document.getElementById('ebOnlineCount');
  if(!l||!c)return;
  c.textContent=players.length+' jugadores';
  l.innerHTML=players.map(p=>'<div class="eb-op-row '+(p.id===playerId?'me':'')+'"><b>'+String(p.name||'Jugador').replace(/[<>]/g,'')+(p.id===playerId?' ⭐':'')+'</b><span>❤️ '+Math.round(num(p.hp,100))+'</span><span>🌀 '+Math.round(num(p.aura))+'</span><span>☠ '+Math.round(num(p.kills))+'</span><span>🌊 '+Math.round(num(p.round))+'</span></div>').join('');
}
function makeRemote(p){
  if(!p||p.id===playerId||remote[p.id]||typeof THREE==='undefined'||typeof scene==='undefined'||typeof createCharacterWithSkeleton!=='function')return;
  try{
    const g=createCharacterWithSkeleton();
    if(!g)return;
    g.userData=g.userData||{};
    g.userData.__netRemote=true;
    g.userData.__netPlayerId=p.id;
    g.visible=true;
    scene.add(g);
    remote[p.id]=g;
  }catch(_){}
}
function applyRemote(){
  if(typeof scene==='undefined'){requestAnimationFrame(applyRemote);return}
  players.forEach(makeRemote);
  Object.keys(remote).forEach(id=>{
    const p=players.find(x=>x.id===id),g=remote[id];
    if(!p){try{scene.remove(g)}catch(_){}delete remote[id];return}
    g.position.lerp(new THREE.Vector3(num(p.x),num(p.y),num(p.z)),.35);
    g.rotation.set(num(p.rx),num(p.ry),num(p.rz));
    const u=g.userData||{};
    Object.keys(p.pose||{}).forEach(k=>{
      if(u[k]&&Array.isArray(p.pose[k])){
        u[k].rotation.x=num(p.pose[k][0]);u[k].rotation.y=num(p.pose[k][1]);u[k].rotation.z=num(p.pose[k][2]);
      }
    });
    g.visible=true;
  });
  requestAnimationFrame(applyRemote);
}
function applyWorld(w){
  if(host||!w)return;
  if(Number.isFinite(+w.round))try{if(typeof waveNumber!=='undefined')waveNumber=+w.round}catch(_){}
  window.__ebOnlineWorld=w;
  const list=Array.isArray(w.npcs)?w.npcs:[];
  if(typeof smallPenes!=='undefined')list.filter(x=>x.type==='small').forEach(n=>{
    try{
      let o=smallPenes.find(q=>q.userData&&q.userData.__netId===n.id);
      if(!o&&typeof createSmallPene==='function'){
        o=createSmallPene(n.x,n.z);o.userData=o.userData||{};o.userData.__netId=n.id;o.userData.__netRemote=true;
        if(smallPenes.indexOf(o)<0)smallPenes.push(o);if(o.parent!==scene)scene.add(o);
      }
      if(o){o.position.set(n.x,n.y,n.z);o.rotation.set(n.rx,n.ry,n.rz);o.userData.health=n.hp;o.userData.maxHealth=n.maxHp;o.scale.setScalar(n.scale||1)}
    }catch(_){}
  });
}
function pause(){
  ensureUI();
  const o=document.getElementById('ebOnlinePause');if(o)o.style.display='flex';
  try{window.__ebResume=typeof gameStarted!=='undefined'&&gameStarted;if(typeof gameStarted!=='undefined')gameStarted=false}catch(_){}
}
function resume(){
  const o=document.getElementById('ebOnlinePause');if(o)o.style.display='none';
  try{if(window.__ebResume&&typeof gameStarted!=='undefined')gameStarted=true}catch(_){}
}
function bind(){
  if(!socket||socket.__ebBound)return;
  socket.__ebBound=true;
  socket.on('connect',()=>{
    connecting=false;playerId=socket.id;host=false;ensureUI();
    document.getElementById('ebOnlineCount').style.display='block';
    socket.emit('room:join',{session:getSession(),name:getNick(),round:getRound(),kills:getKills()});
    resume();
  });
  socket.on('room:welcome',d=>{
    if(!d)return;
    playerId=d.id||socket.id;host=!!d.host;players=Array.isArray(d.players)?d.players:[];
    renderList();if(d.world)applyWorld(d.world);
  });
  socket.on('room:players',a=>{players=Array.isArray(a)?a:[];renderList()});
  socket.on('online:count',n=>{const c=document.getElementById('ebOnlineCount');if(c)c.textContent=Math.max(0,Math.round(n))+' jugadores'});
  socket.on('world:state',applyWorld);
  socket.on('room:host',v=>{host=!!v});
  socket.on('disconnect',()=>{pause();connecting=false;});
  socket.on('connect_error',()=>{pause();connecting=false;});
}
function connect(force){
  ensureUI();
  if(socket&&(socket.connected||connecting))return;
  if(typeof window.io!=='function'){pause();return}
  connecting=true;
  if(socket&&!socket.connected){try{socket.close()}catch(_){}}
  socket=window.io(location.origin,{path:'/socket.io',transports:['websocket','polling'],reconnection:true,reconnectionAttempts:Infinity,reconnectionDelay:1000,timeout:8000});
  window.__ebSocket=socket;
  bind();
}
function tick(){
  ensureUI();
  if(!socket||(!socket.connected&&!connecting))connect();
  if(socket&&socket.connected){
    const now=Date.now();
    if(now-lastSend>=100){lastSend=now;const d=makeState();if(d)socket.emit('player:state',d)}
    const sent=Date.now();socket.emit('latency:ping',sent,()=>{const q=document.getElementById('ebOnlinePing');if(q)q.textContent=(Date.now()-sent)+' ms'});
  }
  setTimeout(tick,100);
}
window.addEventListener('load',()=>{ensureUI();connect()});
window.addEventListener('beforeunload',()=>{try{if(socket)socket.close()}catch(_){}});
ensureUI();connect();tick();applyRemote();
})();
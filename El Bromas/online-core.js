(()=>{if(window.__EB_ONLINE_CORE)return;window.__EB_ONLINE_CORE=1;
const N=(v,d=0)=>Number.isFinite(+v)?+v:d;
const nick=()=>{try{return(localStorage.getItem('elBromasNick')||'Jugador').trim().slice(0,20)||'Jugador'}catch{return'Jugador'}};
const saveNick=v=>{try{localStorage.setItem('elBromasNick',v)}catch{}};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let socket=null,players=[],remotes=new Map(),remoteNpcs=new Map(),ui=null,lastSend=0,lastRound=-1,lastNpcSend=0,lastHostNpcHash='',chatMessages=[],npcSeq=0;
let isHost=false,authorityReady=false,patched=false,remoteFaceTexture=null,remoteFaceLoading=false,patches=null;
function getSocket(){
  if(window.__ebSocket?.connected||window.__ebSocket)return window.__ebSocket;
  if(typeof window.io==='function'){
    try{return window.__ebSocket=window.io(location.origin,{path:'/socket.io',transports:['websocket','polling'],reconnection:true,reconnectionAttempts:Infinity,reconnectionDelay:500,timeout:10000})}
    catch(e){console.warn('socket',e)}
  }return null;
}
function pose(){
  const o={},u=typeof character!=='undefined'?(character?.userData||{}):{};
  ['hips','torsoGroup','headGroup','leftShoulder','leftUpperArm','leftElbow','rightShoulder','rightUpperArm','rightElbow','nalgasGroup','leftThigh','leftKnee','rightThigh','rightKnee','tuboGroup'].forEach(k=>{const r=u[k]?.rotation;if(r)o[k]=[r.x,r.y,r.z]});
  return o;
}
function state(){
  if(typeof character==='undefined'||!character?.position)return null;
  return{name:nick(),x:N(character.position.x),y:N(character.position.y),z:N(character.position.z),rx:N(character.rotation.x),ry:N(character.rotation.y),rz:N(character.rotation.z),
    hp:N(typeof playerHealth!=='undefined'?playerHealth:100,100),aura:N(typeof playerAura!=='undefined'?playerAura:0),kills:N(typeof totalPenesKilled!=='undefined'?totalPenesKilled:0),
    dead:!!(typeof isDead!=='undefined'&&isDead),moving:!!(typeof isMoving!=='undefined'&&isMoving),running:!!(typeof isRunning!=='undefined'&&isRunning),
    jumping:!!(typeof isJumping!=='undefined'&&isJumping),flying:!!(typeof isFlying!=='undefined'&&isFlying),attacking:!!(typeof isAttacking!=='undefined'&&isAttacking),
    special:!!(typeof isSpecialAttacking!=='undefined'&&isSpecialAttacking),attackPhase:N(typeof attackPhase!=='undefined'?attackPhase:0),
    specialPhase:N(typeof specialPhase!=='undefined'?specialPhase:0),walkCycle:N(typeof walkCycle!=='undefined'?walkCycle:0),round:N(typeof waveNumber!=='undefined'?waveNumber:0),pose:pose()};
}
function label(r,name){
  name=name||'Jugador';if(!r)return;if(r.name===name&&r.label)return;r.name=name;if(r.label?.parent)r.label.parent.remove(r.label);if(typeof THREE==='undefined'||!r.g)return;
  const c=document.createElement('canvas');c.width=512;c.height=96;const x=c.getContext('2d');x.font='bold 42px Arial';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='rgba(0,0,0,.85)';x.strokeText(r.name,256,48);x.fillStyle='#fff';x.fillText(r.name,256,48);
  const t=new THREE.CanvasTexture(c),s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.scale.set(2.7,.5,1);s.position.y=2.8;r.label=s;r.g.add(s);
}
function applyRemoteFace(root){
  if(!root?.userData?.face||typeof THREE==='undefined')return;
  let url=null;try{url=typeof faceTextureUrl!=='undefined'?faceTextureUrl:null}catch{}
  if(!url)return;
  const assign=tex=>{if(root?.userData?.face)root.userData.face.material=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:1,side:THREE.FrontSide})};
  if(remoteFaceTexture){assign(remoteFaceTexture);return}
  if(remoteFaceLoading)return;remoteFaceLoading=true;
  new THREE.TextureLoader().load(url,tex=>{tex.flipY=true;tex.wrapS=THREE.ClampToEdgeWrapping;tex.wrapT=THREE.ClampToEdgeWrapping;tex.minFilter=THREE.LinearFilter;tex.magFilter=THREE.LinearFilter;tex.encoding=THREE.sRGBEncoding;remoteFaceTexture=tex;remoteFaceLoading=false;remotes.forEach(r=>assign(r.g?.userData?.face));remoteNpcs.forEach(r=>applyRemoteFace(r.g))},undefined,()=>{remoteFaceLoading=false});
}
function addRemote(p){
  if(!p?.id||p.id===socket?.id||remotes.has(p.id)||typeof scene==='undefined'||typeof createCharacterWithSkeleton!=='function')return;
  try{const g=createCharacterWithSkeleton();if(!g)return;g.userData=g.userData||{};g.userData.__ebRemote=true;g.userData.__ebRemoteId=p.id;scene.add(g);const r={g,name:''};remotes.set(p.id,r);label(r,p.name);applyRemoteFace(g)}catch(e){console.warn('remote player',e)}
}
function draw(){
  if(!ui)return;
  ui.list.innerHTML='<div class="ebTitle"><b>Conectados '+players.length+'</b><button id="ebNickBtn">✏️</button></div>'+players.map(p=>'<div class="ebRow '+(p.id===socket?.id?'me':'')+'"><b>'+esc(p.name||'Jugador')+(p.id===socket?.id?' ⭐':'')+'</b><span>❤️ '+Math.round(N(p.hp,100))+'</span><span>🌀 '+Math.round(N(p.aura))+'</span><span>☠ '+Math.round(N(p.kills))+'</span></div>').join('');
  ui.list.querySelector('#ebNickBtn').onclick=rename;ui.count.textContent='Conectados '+players.length;
}
function rename(){
  const old=document.getElementById('ebNameBox');if(old)old.remove();const box=document.createElement('div');box.id='ebNameBox';box.innerHTML='<div>Nombre</div><input id="ebNameInput" maxlength="20"><button id="ebNameSave">Guardar</button>';document.body.appendChild(box);const i=box.querySelector('#ebNameInput');i.value=nick();i.focus();
  box.querySelector('#ebNameSave').onclick=()=>{const n=(i.value||'').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador';saveNick(n);socket?.emit('player:name',n);box.remove()};
}
function openChat(){ui.chat.style.display=ui.chat.style.display==='none'?'block':'none'}
function sendChat(){const i=ui.chat.querySelector('#ebChatInput'),v=i.value.trim();if(!v||!socket?.connected)return;socket.emit('chat:send',v);i.value=''}
function renderChat(){const l=ui.chat.querySelector('#ebChatLog');l.innerHTML=chatMessages.map(m=>'<div><b>'+esc(m.name)+'</b>: '+esc(m.text)+'</div>').join('');l.scrollTop=l.scrollHeight}
function build(){
  if(document.getElementById('ebCoreHud'))return;
  const st=document.createElement('style');st.textContent='#ebCoreHud{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483000;font:900 13px Arial;white-space:nowrap}#ebCoreHud button{border:1px solid #7280ff;border-radius:20px;background:#0c0f18ee;color:#fff;padding:9px 15px}#ebPing{position:fixed;top:12px;right:14px;z-index:2147483002;border:1px solid #40c9ff;border-radius:14px;background:#07101bf2;color:#fff;padding:7px 11px;font:900 12px Arial;box-shadow:0 4px 16px #0008}#ebChatBtn{margin-left:7px}#ebCoreList,#ebChat{display:none;position:fixed;left:50%;bottom:58px;transform:translateX(-50%);width:min(430px,94vw);max-height:46vh;overflow:auto;z-index:2147482999;background:#080c15fa;color:#fff;border:1px solid #7280ff;border-radius:16px;padding:10px;box-sizing:border-box;font:12px Arial}.ebTitle{display:flex;justify-content:space-between;padding-bottom:6px}.ebRow{display:grid;grid-template-columns:1fr auto auto auto;gap:7px;padding:9px;border-bottom:1px solid #293040}.ebRow.me{background:#5064ff2b;border-radius:8px}#ebNickBtn{border:0;background:transparent;color:#fff;font-size:17px}#ebNameBox{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647;background:#111827;color:#fff;border:1px solid #7280ff;border-radius:12px;padding:16px;min-width:210px;font:16px Arial}#ebNameInput{display:block;width:100%;box-sizing:border-box;margin:10px 0;padding:8px}#ebNameSave{width:100%;padding:8px}#ebChatLog{height:180px;overflow:auto;margin-bottom:8px}#ebChatInput{width:calc(100% - 70px);box-sizing:border-box;padding:8px}#ebChatSend{width:60px;padding:8px}';document.head.appendChild(st);
  const h=document.createElement('div');h.id='ebCoreHud';h.innerHTML='<button id="ebCoreBtn">Conectados 0</button><button id="ebChatBtn">Chat</button><div id="ebCoreList"></div><div id="ebChat"><div id="ebChatLog"></div><input id="ebChatInput" maxlength="120"><button id="ebChatSend">Enviar</button></div>';document.body.appendChild(h);
  const pingEl=document.createElement('div');pingEl.id='ebPing';pingEl.textContent='-- ms';document.body.appendChild(pingEl);ui={count:h.querySelector('#ebCoreBtn'),list:h.querySelector('#ebCoreList'),ping:pingEl,chat:h.querySelector('#ebChat')};
  ui.count.onclick=()=>{ui.list.style.display=getComputedStyle(ui.list).display==='none'?'block':'none';draw()};h.querySelector('#ebChatBtn').onclick=openChat;h.querySelector('#ebChatSend').onclick=sendChat;h.querySelector('#ebChatInput').onkeydown=e=>{if(e.key==='Enter')sendChat()};
}
function removeLocalNpcs(){
  try{if(Array.isArray(smallPenes)){smallPenes.forEach(o=>{if(o?.parent)scene.remove(o)});smallPenes.length=0}if(Array.isArray(activeMiniBosses)){activeMiniBosses.forEach(o=>{if(o?.parent)scene.remove(o)});activeMiniBosses.length=0}if(typeof cinematicBosses!=='undefined'&&Array.isArray(cinematicBosses)){cinematicBosses.forEach(o=>{if(o?.parent)scene.remove(o)});cinematicBosses.length=0}if(typeof boss!=='undefined'&&boss){if(boss.parent)scene.remove(boss);boss=null}if(typeof isCinematic!=='undefined')isCinematic=false}catch(e){console.warn('clear npcs',e)}}
function applyAuthority(){
  const shouldPatch=authorityReady&&!isHost;
  if(!patched&&shouldPatch){
    patches={spawnWave:typeof spawnWave==='function'?spawnWave:null,startWaves:typeof startWaves==='function'?startWaves:null,spawnNextWave:typeof spawnNextWave==='function'?spawnNextWave:null,startProtestMission:typeof startProtestMission==='function'?startProtestMission:null,startGiantBossMission:typeof startGiantBossMission==='function'?startGiantBossMission:null};
    if(patches.spawnWave)spawnWave=()=>{};if(patches.startWaves)startWaves=()=>{};if(patches.spawnNextWave)spawnNextWave=()=>{};if(patches.startProtestMission)startProtestMission=()=>{};if(patches.startGiantBossMission)startGiantBossMission=()=>{};patched=true;removeLocalNpcs();
  }else if(patched&&!shouldPatch){
    if(patches.spawnWave)spawnWave=patches.spawnWave;if(patches.startWaves)startWaves=patches.startWaves;if(patches.spawnNextWave)spawnNextWave=patches.spawnNextWave;if(patches.startProtestMission)startProtestMission=patches.startProtestMission;if(patches.startGiantBossMission)startGiantBossMission=patches.startGiantBossMission;patches=null;patched=false;
  }
}
function ensureNpcId(o,type){if(!o?.userData)return null;if(!o.userData.__ebNpcId)o.userData.__ebNpcId=type+'-'+(++npcSeq);return o.userData.__ebNpcId}
function npcState(o,type){const u=o.userData||{},id=ensureNpcId(o,type);return{id,type,x:N(o.position.x),y:N(o.position.y),z:N(o.position.z),rx:N(o.rotation?.x),ry:N(o.rotation?.y),rz:N(o.rotation?.z),hp:Math.max(0,N(u.health,0)),maxHp:Math.max(1,N(u.maxHealth,100)),walkCycle:N(u.walkCycle),attacking:!!u.isCharging,isGiant:!!u.isGiant,isProtester:!!u.isProtester,leap:!!u.isLeaping,leapPhase:N(u.leapPhase),flyTimer:N(u.flyTimer)}}
function collectNpcSnapshot(){
  const items=[];try{if(Array.isArray(smallPenes))for(const o of smallPenes)if(o?.parent&&o.userData?.health>0)items.push(npcState(o,'pene'));if(Array.isArray(activeMiniBosses))for(const o of activeMiniBosses)if(o?.parent&&o.userData?.health>0)items.push(npcState(o,'miniBoss'));if(typeof boss!=='undefined'&&boss?.parent&&boss.userData?.health>0)items.push(npcState(boss,'boss'))}catch{}return{round:N(typeof waveNumber!=='undefined'?waveNumber:0),items}
}
function npcHash(s){return JSON.stringify(s.items.map(x=>[x.id,Math.round(x.x*10),Math.round(x.y*10),Math.round(x.z*10),Math.round(x.ry*100),Math.round(x.hp)]))}
function sendNpcSnapshot(force=false){if(!isHost||!socket?.connected)return;const snap=collectNpcSnapshot(),hash=npcHash(snap),now=performance.now();if(!force&&now-lastNpcSend<120)return;if(!force&&hash===lastHostNpcHash&&now-lastNpcSend<380)return;lastNpcSend=now;lastHostNpcHash=hash;socket.emit('npc:snapshot',snap)}
function makeRemoteNpc(p){
  if(!p?.id||typeof scene==='undefined'||typeof THREE==='undefined')return null;let g=null;try{
    if(p.type==='pene'){if(p.isProtester&&typeof createProtesterPene==='function'&&typeof posterTextureObj!=='undefined'&&posterTextureObj)g=createProtesterPene(p.x,p.z,posterTextureObj);else if(typeof createSmallPene==='function')g=createSmallPene(p.x,p.z)}
    else if((p.type==='boss'||p.type==='miniBoss')&&typeof createBoss==='function'){g=createBoss(Math.max(0,N(lastRound,typeof waveNumber!=='undefined'?waveNumber:0)));const sc=p.type==='boss'?3:1.2;g.scale.set(sc,sc,sc)}
    if(!g)return null;g.userData=g.userData||{};g.userData.__ebRemoteNpc=true;g.userData.__ebNpcId=p.id;g.userData.health=N(p.hp);g.userData.maxHealth=N(p.maxHp,100);g.userData.isGiant=p.type==='boss';scene.add(g);applyRemoteFace(g);const r={g,type:p.type};remoteNpcs.set(p.id,r);return r;
  }catch(e){console.warn('remote npc',e);return null}
}
function applyRemoteNpcPose(r,p){
  if(!r?.g)return;const g=r.g,u=g.userData||{};g.position.lerp(new THREE.Vector3(N(p.x),N(p.y),N(p.z)),.42);g.rotation.set(N(p.rx),N(p.ry),N(p.rz));u.health=N(p.hp,u.health);u.maxHealth=N(p.maxHp,u.maxHealth);u.isGiant=!!p.isGiant;u.netMoving=true;u.netAttacking=!!p.attacking;u.walkCycle=N(p.walkCycle);
  if(r.type==='pene'){if(u.ball1)u.ball1.position.y=1.2+Math.sin(N(p.walkCycle))*.3;if(u.ball2)u.ball2.position.y=1.2-Math.sin(N(p.walkCycle))*.3}
  else{const sw=Math.sin(N(p.walkCycle)*Math.PI*2);if(u.ball1){u.ball1.position.y=3+sw*.9;u.ball1.position.x=-2+sw*.4}if(u.ball2){u.ball2.position.y=3-sw*.9;u.ball2.position.x=2-sw*.4}if(u.shaft)u.shaft.rotation.z=sw*.08}
}
function applyNpcSnapshot(msg){
  if(isHost)return;const payload=Array.isArray(msg)?{items:msg,round:lastRound}:msg||{},items=Array.isArray(payload.items)?payload.items:[];if(payload.round!=null)lastRound=N(payload.round,lastRound);const seen=new Set();
  for(const p of items){if(!p?.id)continue;seen.add(p.id);let r=remoteNpcs.get(p.id);if(!r)r=makeRemoteNpc(p);if(r){applyRemoteNpcPose(r,p);applyRemoteFace(r.g)}}
  for(const[id,r]of remoteNpcs){if(!seen.has(id)){if(r.g?.parent)r.g.parent.remove(r.g);remoteNpcs.delete(id)}}
}
function clearRemoteNpcs(){for(const r of remoteNpcs.values())if(r.g?.parent)r.g.parent.remove(r.g);remoteNpcs.clear()}
function bind(){
  const s=getSocket();if(!s||s.__EB_CORE_BOUND)return !!s?.__EB_CORE_BOUND;socket=s;s.__EB_CORE_BOUND=1;
  s.on('connect',()=>{console.log('[EB ONLINE] connected',s.id);s.emit('room:join',{name:nick(),round:N(typeof waveNumber!=='undefined'?waveNumber:0)});players=[{id:s.id,name:nick(),hp:100,aura:0,kills:0}];draw();s.emit('latency:ping',Date.now(),ms=>{if(Number.isFinite(+ms))ui.ping.textContent=Math.max(1,Math.round(+ms))+' ms'})});
  s.on('connect_error',e=>{console.warn('[EB ONLINE] connect_error',e);ui.ping.textContent='-- ms'});
  s.on('disconnect',r=>{console.warn('[EB ONLINE] disconnected',r);ui.ping.textContent='-- ms';players=[];clearRemoteNpcs();draw()});
  s.on('room:welcome',d=>{isHost=!!d?.host;authorityReady=true;applyAuthority();players=Array.isArray(d?.players)?d.players:players;lastRound=N(d?.round,lastRound);draw();if(d?.npcSnapshot)applyNpcSnapshot(d.npcSnapshot)});
  s.on('room:role',d=>{isHost=!!d?.host;authorityReady=true;applyAuthority();if(isHost){clearRemoteNpcs();sendNpcSnapshot(true)}});
  s.on('room:players',a=>{players=Array.isArray(a)?a:[];draw()});
  s.on('online:count',n=>{if(ui&&(!players.length||!players.find(p=>p.id===socket?.id)))ui.count.textContent='Conectados '+Math.max(0,N(n))});
  s.on('round:state',r=>{const n=N(r);lastRound=n;try{if(typeof waveNumber!=='undefined'&&!isHost){waveNumber=n;if(typeof updatePeneCountUI==='function')updatePeneCountUI()}}catch{}});
  s.on('npc:snapshot',applyNpcSnapshot);s.on('chat:message',m=>{chatMessages.push(m);chatMessages=chatMessages.slice(-50);renderChat()});
  setInterval(()=>{if(!s.connected)return;s.emit('latency:ping',Date.now(),ms=>{if(Number.isFinite(+ms))ui.ping.textContent=Math.max(1,Math.round(+ms))+' ms'})},1000);return true;
}
function send(){const s=socket;if(!s?.connected||performance.now()-lastSend<80)return;const d=state();if(!d)return;lastSend=performance.now();s.emit('player:state',d);if(d.round!==lastRound){lastRound=d.round;s.emit('round:set',d.round)}}
function apply(){if(typeof scene==='undefined'||typeof THREE==='undefined')return;players.forEach(addRemote);for(const[id,r]of remotes){const p=players.find(x=>x.id===id);if(!p){if(r.g?.parent)r.g.parent.remove(r.g);remotes.delete(id);continue}r.g.visible=!p.dead;r.g.position.lerp(new THREE.Vector3(N(p.x),N(p.y),N(p.z)),.35);r.g.rotation.set(N(p.rx),N(p.ry),N(p.rz));label(r,p.name);applyRemoteFace(r.g);for(const[k,v]of Object.entries(p.pose||{}))if(r.g.userData[k]?.rotation)r.g.userData[k].rotation.set(N(v[0]),N(v[1]),N(v[2]))}}
function loop(){apply();if(isHost)sendNpcSnapshot();else if(authorityReady&&!isHost&&typeof faceTextureUrl!=='undefined'&&faceTextureUrl)remotes.forEach(r=>applyRemoteFace(r.g));requestAnimationFrame(loop)}
function start(){build();if(!bind())setTimeout(start,250);else requestAnimationFrame(loop)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();})();
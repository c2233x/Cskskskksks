// Launcher: authoritative multiplayer state, server-owned NPC roster, and online-only street replacement.
const fs=require('fs');
const originalRead=fs.readFileSync;
fs.readFileSync=function(file,enc){
 const out=originalRead.apply(this,arguments),name=String(file);
 if(typeof out==='string'&&/server-base\.js$/.test(name)){
  let x=out;
  x=x.replace(/let round=0,npcSource=null,seq=0;/,"let round=0,npcSource=null,seq=0,worldNeedsBootstrap=true,emptyResetTimer=null;\nconst cancelEmptyReset=()=>{if(emptyResetTimer){clearTimeout(emptyResetTimer);emptyResetTimer=null}};\nconst scheduleEmptyReset=()=>{if(emptyResetTimer||players.size)return;emptyResetTimer=setTimeout(()=>{emptyResetTimer=null;if(players.size)return;round=0;npcSource=null;worldNeedsBootstrap=true;npcSnapshot={seq:0,serverTime:Date.now(),round:0,items:[]};worldSnapshot={seq:0,serverTime:Date.now(),round:0,items:[]};fxSnapshot={seq:0,serverTime:Date.now(),items:[]};worldUi={seq:0,serverTime:Date.now(),items:[]};worldVisual={seq:0,serverTime:Date.now(),bg:null,lights:[]};worldTime=0;gameState={seq:0,serverTime:Date.now(),round:0,alive:0,deaths:0,status:'',mission:false,missionType:'',posters:0,cinematic:false,cinematicPhase:0,cinematicTimer:0,boss:null,cam:null,cinematicEpoch:0,cinematicState:null};carOwners.clear();carPassengers.clear();carRadios.clear();fxPlayers.clear();log('RESET','Mundo reiniciado tras 60s sin jugadores')},60000)};\nconst bootstrapServerNpcs=()=>{if(npcSnapshot.items.length)return;npcSnapshot={seq:++seq,serverTime:Date.now(),round:1,items:Array.from({length:7},(_,i)=>({id:'server:pene:'+i,type:'pene',x:(i-3)*4,y:0,z:(i%2?4:-4),rx:0,ry:0,rz:0,hp:100,maxHp:100,walk:0,attack:false,protester:false,leap:false,leapPhase:0,fly:0,giant:false}))};round=1;gameState.round=1;gameState.alive=7;worldNeedsBootstrap=false};\n");
  x=x.replace(/io\.on\('connection',s=>\{const p=\{/,"io.on('connection',s=>{const wasEmpty=players.size===0;cancelEmptyReset();const p={");
  x=x.replace(/players\.set\(s\.id,p\);if\(!npcSource\)npcSource=s\.id;/,"players.set(s.id,p);if(wasEmpty&&worldNeedsBootstrap)bootstrapServerNpcs();if(!npcSource)npcSource=s.id;");
  x=x.replace(/s\.emit\('room:welcome',\{id:s\.id,npcSource:s\.id===npcSource,\.\.\.syncPack\(\)\}\);/,"s.emit('room:welcome',{id:s.id,npcSource:false,canSpawnInitial:false,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items},...syncPack()});");
  x=x.replace(/s\.on\('room:join',d=>\{p\.name=clean\(d\?\.name\);p\.round=round;s\.emit\('room:sync',syncPack\(\)\)\}\);/,"s.on('room:join',d=>{p.name=clean(d?.name);p.round=round;s.emit('room:sync',{...syncPack(),npcSource:false,canSpawnInitial:false,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items}});s.emit('npc:join:sync',{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items})});");
  x=x.replace(/s\.emit\('room:sync',syncPack\(\)\)/g,"s.emit('room:sync',{...syncPack(),npcSource:false,canSpawnInitial:false,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items}})");
  x=x.replace(/s\.on\('npc:snapshot',d=>\{[\s\S]*?\}\);/,"s.on('npc:snapshot',d=>{});");
  x=x.replace(/players\.delete\(s\.id\);/g,"players.delete(s.id);if(players.size===0)scheduleEmptyReset();");
  x=x.replace(/if\(s\.id===npcSource\)\{npcSource=null;const next=players\.values\(\)\.next\(\)\.value;if\(next\)\{npcSource=next\.id;io\.to\(next\.id\)\.emit\('room:role',\{npcSource:true,canSpawnInitial:false,authoritativeJoin:true,npcJoinSnapshot:\{round,alive:gameState\.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items\}\}\)\}\}/,"if(s.id===npcSource){npcSource=null;const next=[...players.values()].find(v=>v.id!==s.id);if(next){npcSource=next.id;io.to(next.id).emit('room:role',{npcSource:false,canSpawnInitial:false,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items}})}}");
  x=x.replace(/io\.on\('connection',s=>\{/,"io.on('connection',s=>{s.on('combat:attack',d=>{const id=String(d?.id||'');const damage=Math.max(1,Math.min(100,Number(d?.damage)||10));const items=Array.isArray(npcSnapshot.items)?npcSnapshot.items.slice():[];const i=items.findIndex(n=>String(n.id)===id);if(i<0)return;const hp=Math.max(0,(Number(items[i].hp)||0)-damage);items[i]={...items[i],hp};if(hp<=0)items.splice(i,1);npcSnapshot={...npcSnapshot,seq:++seq,serverTime:Date.now(),items};gameState.alive=items.length;io.emit('npc:snapshot',npcSnapshot);io.emit('game:state',gameState)});");
  x=x.replace(/setInterval\(broadcastPlayers,50\)/g,'setInterval(broadcastPlayers,250)');
  return x;
 }
 if(typeof out==='string'&&/online-final14\.js$/.test(name)){
  let x=out;
  x=x.replace(/function makeNpc\(p\)\{try\{/,'function makeNpc(p){try{window.__EB_REMOTE_NPC_BUILD=true;');
  x=x.replace(/return g\}catch\{return null\}\}/,'window.__EB_REMOTE_NPC_BUILD=false;return g}catch{window.__EB_REMOTE_NPC_BUILD=false;return null}}');
  x=x.replace(/function applyNpc\(m\)\{if\(isSource\|\|!m\)return;/,"function applyNpc(m){if(!m)return;");
  x=x.replace(/s\.on\('room:welcome'/,"s.on('room:role',d=>{isSource=false;window.__EB_ALLOW_NPC_PUBLISH=false;});s.on('room:welcome'");
  return x;
 }
 if(typeof out==='string'&&/online-final18\.js$/.test(name)){
  let x=out;
  x=x.replace(/function applyPlayers\(a\)\{[\s\S]*?\}\nfunction animatePlayers/,'function applyPlayers(a){players=Array.isArray(a)?a:[];window.__ebP18B=players}\nfunction animatePlayers');
  x=x.replace(/function localFx\(\)\{[\s\S]*?\}\nfunction applyFx/,'function localFx(){return[]}\nfunction applyFx');
  x=x.replace(/function applyFx\(items\)\{[\s\S]*?\}\nfunction carFix/,'function applyFx(items){}\nfunction carFix');
  x=x.replace(/function collectUi\(\)\{[\s\S]*?\}\nfunction applyUi/,'function collectUi(){return[]}\nfunction applyUi');
  x=x.replace(/function applyUi\(a\)\{[\s\S]*?\}\nfunction /,'function applyUi(a){}\nfunction ');
  return x;
 }
 if(typeof out==='string'&&/Salva a cornatan .*\.html$/.test(name)){
  const clean=out.replace(/<script[^>]*src=["']\/?online-final(?:14|17|18|20|21|22|23|24|25|26)\.js[^"']*["'][^>]*><\/script>/gi,'');
  const early='<script>(function(){window.__EB_BLOCK_LOCAL_NPC=true;window.__EB_LATE_JOIN=true;try{const names=[\'createSmallPene\',\'createBoss\',\'spawnSmallPenes\',\'spawnRound\',\'spawnWave\',\'spawnNPCs\',\'spawnNpcs\',\'startWave\',\'nextWave\'];const wrap=()=>{for(const n of names){try{const f=window[n];if(typeof f===\'function\'&&!f.__ebEarlyGuard){const w=function(){if(window.__EB_BLOCK_LOCAL_NPC&&!window.__EB_REMOTE_NPC_BUILD)return undefined;return f.apply(this,arguments)};w.__ebEarlyGuard=true;w.__ebOriginal=f;window[n]=w}}catch{}}};wrap();setInterval(wrap,20)}catch{}})();</script>';
  const tag='<script src="/socket.io/socket.io.js"></script><script>window.__ebSocket=io(location.origin,{path:\'/socket.io/\',transports:[\'websocket\'],reconnection:true,reconnectionAttempts:Infinity,reconnectionDelay:500,timeout:8000});</script><script src="/online-final14.js?v=20"></script><script src="/online-final18.js?v=29"></script><script src="/online-final17.js?v=27"></script><script src="/online-final24.js?v=6"></script><script src="/online-final25.js?v=7"></script><script src="/online-streets.js?v=1"></script>';
  return clean.replace(/<\/head>/i,early+'</head>').replace(/<\/body>/i,tag+'</body>');
 }
 return out;
};
require('./server-base.js');

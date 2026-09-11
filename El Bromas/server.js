// Launcher: authoritative multiplayer state, no late-join local NPC spawn, and low-lag combat.
const fs=require('fs');
const originalRead=fs.readFileSync;
fs.readFileSync=function(file,enc){
 const out=originalRead.apply(this,arguments),name=String(file);
 if(typeof out==='string'&&/server-base\.js$/.test(name)){
  let x=out;
  x=x.replace(/let round=0,npcSource=null,seq=0;/,
   "let round=0,npcSource=null,seq=0,worldNeedsBootstrap=true,emptySince=0,emptyResetTimer=null;\n"+
   "const cancelEmptyReset=()=>{if(emptyResetTimer){clearTimeout(emptyResetTimer);emptyResetTimer=null}emptySince=0};\n"+
   "const scheduleEmptyReset=()=>{if(emptyResetTimer||players.size)return;emptySince=Date.now();emptyResetTimer=setTimeout(()=>{emptyResetTimer=null;if(players.size)return;round=0;npcSource=null;worldNeedsBootstrap=true;emptySince=Date.now();npcSnapshot={seq:0,serverTime:Date.now(),round:0,items:[]};worldSnapshot={seq:0,serverTime:Date.now(),round:0,items:[]};fxSnapshot={seq:0,serverTime:Date.now(),items:[]};worldUi={seq:0,serverTime:Date.now(),items:[]};worldVisual={seq:0,serverTime:Date.now(),bg:null,lights:[]};worldTime=0;gameState={seq:0,serverTime:Date.now(),round:0,alive:0,deaths:0,status:'',mission:false,missionType:'',posters:0,cinematic:false,cinematicPhase:0,cinematicTimer:0,boss:null,cam:null,cinematicEpoch:0,cinematicState:null};carOwners.clear();carPassengers.clear();carRadios.clear();fxPlayers.clear();log('RESET','Mundo reiniciado tras 60s sin jugadores');},60000)};");

  x=x.replace(/io\.on\('connection',s=>\{const p=\{/,"io.on('connection',s=>{const wasEmpty=players.size===0;cancelEmptyReset();const canSpawnInitial=wasEmpty&&worldNeedsBootstrap;const p={");
  x=x.replace(/players\.set\(s\.id,p\);if\(!npcSource\)npcSource=s\.id;/,"players.set(s.id,p);if(canSpawnInitial){npcSource=s.id;worldNeedsBootstrap=false}else if(!npcSource)npcSource=s.id;");
  x=x.replace(/s\.emit\('room:welcome',\{id:s\.id,npcSource:s\.id===npcSource,\.\.\.syncPack\(\)\}\);/,"s.emit('room:welcome',{id:s.id,npcSource:s.id===npcSource,canSpawnInitial,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items},...syncPack()});");
  x=x.replace(/s\.on\('room:join',d=>\{p\.name=clean\(d\?\.name\);p\.round=round;s\.emit\('room:sync',syncPack\(\)\)\}\);/,"s.on('room:join',d=>{p.name=clean(d?.name);p.round=round;s.emit('room:sync',{...syncPack(),npcSource:s.id===npcSource,canSpawnInitial:false,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items}});s.emit('npc:join:sync',{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items})});");
  x=x.replace(/s\.emit\('room:sync',syncPack\(\)\)/g,"s.emit('room:sync',{...syncPack(),npcSource:s.id===npcSource,canSpawnInitial:false,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items}})");
  x=x.replace(/s\.on\('npc:snapshot',d=>\{/g,"s.on('npc:snapshot',d=>{if(s.id!==npcSource)return;");
  x=x.replace(/npcSnapshot=safeNpc\(d\);/g,"npcSnapshot=safeNpc(d);gameState.alive=npcSnapshot.items.length;gameState.round=npcSnapshot.round;");
  x=x.replace(/s\.on\('disconnect',\(\)=>\{/,"s.on('disconnect',()=>{");
  x=x.replace(/if\(s\.id===npcSource\)\{npcSource=null;const next=players\.values\(\)\.next\(\)\.value;if\(next\)\{npcSource=next\.id;io\.to\(next\.id\)\.emit\('room:role',\{npcSource:true,canSpawnInitial:false,authoritativeJoin:true,npcJoinSnapshot:\{round,alive:gameState\.alive,seq:npcSnapshot\.seq,serverTime:npcSnapshot\.serverTime,items:npcSnapshot\.items\}\}\)\}\}/,
   "if(s.id===npcSource){npcSource=null;const next=[...players.values()].find(v=>v.id!==s.id);if(next){npcSource=next.id;io.to(next.id).emit('room:role',{npcSource:true,canSpawnInitial:false,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items}})}}");
  x=x.replace(/players\.delete\(s\.id\);/g,"players.delete(s.id);if(players.size===0)scheduleEmptyReset();");
  x=x.replace(/setInterval\(broadcastPlayers,50\)/g,'setInterval(broadcastPlayers,250)');
  return x;
 }
 if(typeof out==='string'&&/online-final14\.js$/.test(name)){
  let x=out;
  x=x.replace(/function makeNpc\(p\)\{try\{/,'function makeNpc(p){try{window.__EB_REMOTE_NPC_BUILD=true;');
  x=x.replace(/return g\}catch\{return null\}\}/,'window.__EB_REMOTE_NPC_BUILD=false;return g}catch{window.__EB_REMOTE_NPC_BUILD=false;return null}}');
  x=x.replace(/function applyNpc\(m\)\{if\(isSource\|\|!m\)return;/,"function applyNpc(m){if(!m)return;");
  x=x.replace(/!o\?\.parent\|\|o\.userData\?\.__ebRemoteNpc\|\|N\(o\.userData\.health\)<=0/,'!o?.parent||(!isSource&&o.userData?.__ebRemoteNpc)||N(o.userData.health)<=0');
  x=x.replace(/s\.on\('room:welcome'/,"s.on('room:role',d=>{isSource=!!d?.npcSource;window.__EB_ALLOW_NPC_PUBLISH=isSource&&!d?.canSpawnInitial;});s.on('room:welcome'");
  return x;
 }
 if(typeof out==='string'&&/online-final18\.js$/.test(name)){
  let x=out;
  x=x.replace(/function applyPlayers\(a\)\{[\s\S]*?\}\nfunction animatePlayers/,'function applyPlayers(a){players=Array.isArray(a)?a:[];window.__ebP18B=players}\nfunction animatePlayers');
  x=x.replace(/function applyNpc\(m\)\{[\s\S]*?\}\nfunction animateNpc/,'function applyNpc(m){}\nfunction animateNpc');
  x=x.replace(/function localFx\(\)\{[\s\S]*?\}\nfunction applyFx/,'function localFx(){return[]}\nfunction applyFx');
  x=x.replace(/function applyFx\(items\)\{[\s\S]*?\}\nfunction carFix/,'function applyFx(items){}\nfunction carFix');
  x=x.replace(/function collectUi\(\)\{[\s\S]*?\}\nfunction applyUi/,'function collectUi(){return[]}\nfunction applyUi');
  x=x.replace(/function applyUi\(a\)\{[\s\S]*?\}\nfunction /,'function applyUi(a){}\nfunction ');
  return x;
 }
 if(typeof out==='string'&&/online-final25\.js$/.test(name)){
  let x=out;
  x=x.replace("const s=window.__ebSocket;let source=false,synced=false,serverRound=0,serverAlive=0,serverGame=null,serverNpc=[];","const s=window.__ebSocket;let source=false,allowLocalSpawn=false,synced=false,serverRound=0,serverAlive=0,serverGame=null,serverNpc=[];");
  x=x.replace(/const badText=t=>\/evento\\s\+protesta\\s\+vand\[aá\]listica\|\^oleada\\s\*\[:#-\]\?\\s\*\\d\*\|\^listo\\.?\$\/i,/,"const badText=t=>/(?:^|@\\s*)oleadas?\\s*[:#-]?\\s*\\d*\\s*$|evento\\s+protesta\\s+vand[aá]listica|^listo\\.?$/i,");
  x=x.replace(/if\(source\|\|!synced\)return;/g,"if(allowLocalSpawn||!synced)return;");
  x=x.replace(/function unfreezeSource\(\)\{if\(source\)\{window\.__EB_BLOCK_LOCAL_NPC=false;\}\}/,"function unfreezeSource(){if(allowLocalSpawn)window.__EB_BLOCK_LOCAL_NPC=false;else window.__EB_BLOCK_LOCAL_NPC=true;}");
  x=x.replace(/s\.on\('npc:join:sync',m=>\{if\(source\)return;/,"s.on('npc:join:sync',m=>{");
  x=x.replace(/serverNpc=Array\.isArray\(m\?\.items\)\?m\.items:\[\];synced=true;applyAuthoritativeState\(\);removeLateJoinNpcs\(\);/,"serverNpc=Array.isArray(m?.items)?m.items:[];synced=true;applyAuthoritativeState();removeLateJoinNpcs();unfreezeSource();");
  x=x.replace(/source=!!d\?\.npcSource;const g=d\?\.gameState\|\|\{\};/g,"source=!!d?.npcSource;allowLocalSpawn=!!d?.canSpawnInitial;const g=d?.gameState||{};");
  x=x.replace(/if\(source\)unfreezeSource\(\);else\{freezeLocalRound\(\);/g,"if(allowLocalSpawn)unfreezeSource();else{freezeLocalRound();");
  x=x.replace(/if\(typeof d\?\.npcSource==='boolean'\)source=!!d\.npcSource;const g=d\?\.gameState\|\|\{\};/,"if(typeof d?.npcSource==='boolean')source=!!d.npcSource;if(typeof d?.canSpawnInitial==='boolean')allowLocalSpawn=!!d.canSpawnInitial;const g=d?.gameState||{};");
  x=x.replace(/if\(source\)unfreezeSource\(\);else freezeLocalRound\(\)/g,"if(allowLocalSpawn)unfreezeSource();else freezeLocalRound()");
  x=x.replace(/s\.on\('round:state',r=>\{if\(!source\)/,"s.on('round:state',r=>{if(!allowLocalSpawn)");
  x=x.replace(/s\.on\('game:state',g=>\{if\(!source\)/,"s.on('game:state',g=>{if(!allowLocalSpawn)");
  x=x.replace(/s\.on\('npc:snapshot',m=>\{if\(!source\)/,"s.on('npc:snapshot',m=>{if(!allowLocalSpawn)");
  x=x.replace(/if\(source\)\{unfreezeSource\(\);return\}/,"if(allowLocalSpawn){unfreezeSource();return}");
  x=x.replace(/s\.on\('room:welcome'/,"s.on('room:role',d=>{source=!!d?.npcSource;allowLocalSpawn=!!d?.canSpawnInitial;unfreezeSource();if(!allowLocalSpawn)freezeLocalRound();});s.on('room:welcome'");
  return x;
 }
 if(typeof out==='string'&&/Salva a cornatan .*\.html$/.test(name)){
  const clean=out.replace(/<script[^>]*src=["']\/?online-final(?:14|17|18|20|21|22|23|24|25|26)\.js[^"']*["'][^>]*><\/script>/gi,'');
  const early=`<script>(function(){window.__EB_BLOCK_LOCAL_NPC=${typeof players!=='undefined'&&players.size>0?'true':'false'};window.__EB_LATE_JOIN=${typeof players!=='undefined'&&players.size>0?'true':'false'};try{const names=['createSmallPene','createBoss','spawnSmallPenes','spawnRound','spawnWave','spawnNPCs','spawnNpcs','startWave','nextWave'];const wrap=()=>{for(const n of names){try{const f=window[n];if(typeof f==='function'&&!f.__ebEarlyGuard){const w=function(){if(window.__EB_BLOCK_LOCAL_NPC&&!window.__EB_REMOTE_NPC_BUILD)return undefined;return f.apply(this,arguments)};w.__ebEarlyGuard=true;w.__ebOriginal=f;window[n]=w}}catch{}}};wrap();setInterval(wrap,20)}catch{}})();</script>`;
  const tag='<script src="/socket.io/socket.io.js"></script><script>window.__ebSocket=io(location.origin,{path:\'/socket.io/\',transports:[\'websocket\'],reconnection:true,reconnectionAttempts:Infinity,reconnectionDelay:500,timeout:8000});</script><script src="/online-final14.js?v=19"></script><script src="/online-final18.js?v=28"></script><script src="/online-final17.js?v=26"></script><script src="/online-final24.js?v=5"></script><script src="/online-final25.js?v=6"></script>';
  const withEarly=clean.replace(/<\/head>/i,early+'</head>');
  return withEarly.replace(/<\/body>/i,tag+'</body>');
 }
 return out;
};
require('./server-base.js');

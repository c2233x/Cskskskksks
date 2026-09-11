// Launcher: authoritative multiplayer state, original HTML UI, and low-lag combat.
const fs=require('fs');
const originalRead=fs.readFileSync;
fs.readFileSync=function(file,enc){
 const out=originalRead.apply(this,arguments),name=String(file);
 if(typeof out==='string'&&/server-base\.js$/.test(name)){
  let x=out;
  // The server is the only authority for the live NPC roster. A joining client gets
  // an immutable join snapshot immediately after room:join, instead of rebuilding a round locally.
  x=x.replace(/s\.emit\('room:sync',syncPack\(\)\)/g,"s.emit('room:sync',{...syncPack(),npcSource:s.id===npcSource,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items}})");
  x=x.replace(/s\.on\('room:join',d=>\{p\.name=clean\(d\?\.name\);p\.round=round;s\.emit\('room:sync',syncPack\(\)\)\}\);/g,"s.on('room:join',d=>{p.name=clean(d?.name);p.round=round;s.emit('room:sync',{...syncPack(),npcSource:s.id===npcSource,authoritativeJoin:true,npcJoinSnapshot:{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items}});s.emit('npc:join:sync',{round,alive:gameState.alive,seq:npcSnapshot.seq,serverTime:npcSnapshot.serverTime,items:npcSnapshot.items});});");
  // Never accept an NPC snapshot from a non-authoritative client.
  x=x.replace(/s\.on\('npc:snapshot',d=>\{/g,"s.on('npc:snapshot',d=>{if(s.id!==npcSource)return;");
  // Keep the server's alive count tied to the authoritative NPC roster whenever a snapshot arrives.
  x=x.replace(/npcSnapshot=safeNpc\(d\);/g,"npcSnapshot=safeNpc(d);gameState.alive=npcSnapshot.items.length;gameState.round=npcSnapshot.round;");
  x=x.replace(/setInterval\(broadcastPlayers,50\)/g,'setInterval(broadcastPlayers,250)');
  return x;
 }
 if(typeof out==='string'&&/online-final14\.js$/.test(name)){
  let x=out;
  // Remote NPC construction is the only path allowed to call the original factories on non-source clients.
  x=x.replace(/function makeNpc\(p\)\{try\{/,'function makeNpc(p){try{window.__EB_REMOTE_NPC_BUILD=true;');
  x=x.replace(/return g\}catch\{return null\}\}/,'window.__EB_REMOTE_NPC_BUILD=false;return g}catch{window.__EB_REMOTE_NPC_BUILD=false;return null}}');
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
  // Join snapshot is authoritative and is applied before the normal round/NPC events.
  const inject="s.on('npc:join:sync',m=>{if(source)return;serverRound=N(m?.round);serverAlive=Math.max(0,Math.floor(N(m?.alive)));serverNpc=Array.isArray(m?.items)?m.items:[];synced=true;applyAuthoritativeState();removeLateJoinNpcs();try{window.__EB_AUTHORITATIVE_JOIN_SNAPSHOT={round:serverRound,alive:serverAlive,items:serverNpc}}catch{};});";
  x=x.replace(/s\.on\('room:welcome'/,inject+"s.on('room:welcome'");
  // Do not infer alive from a local round spawn. The server roster is the source of truth.
  x=x.replace(/if\(!serverAlive&&serverNpc\.length\)serverAlive=serverNpc\.length;/g,'');
  return x;
 }
 if(typeof out==='string'&&/Salva a cornatan .*\.html$/.test(name)){
  const clean=out.replace(/<script[^>]*src=["']\/?online-final(?:14|17|18|20|21|22|23|24|25|26)\.js[^"']*["'][^>]*><\/script>/gi,'');
  const tag='<script src="/online-final14.js?v=16"></script><script src="/online-final18.js?v=27"></script><script src="/online-final17.js?v=25"></script><script src="/online-final24.js?v=4"></script><script src="/online-final25.js?v=4"></script>';
  return clean.replace(/<\/body>/i,tag+'</body>');
 }
 return out;
};
require('./server-base.js');

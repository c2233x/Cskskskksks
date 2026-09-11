// Launcher: authoritative multiplayer state, original HTML UI, and low-lag combat.
const fs=require('fs');
const originalRead=fs.readFileSync;
fs.readFileSync=function(file,enc){
 const out=originalRead.apply(this,arguments),name=String(file);
 if(typeof out==='string'&&/server-base\.js$/.test(name)){
  let x=out;
  // Late joiners get the same authoritative snapshot before gameplay starts.
  x=x.replace(/s\.emit\('room:sync',syncPack\(\)\)/g,"s.emit('room:sync',{...syncPack(),npcSource:s.id===npcSource,authoritativeJoin:true})");
  x=x.replace(/items:\(Array\.isArray\(d\?\.items\)\?d\.items:\[\]\)\.slice\(0,140\)/,'items:(Array.isArray(d?.items)?d.items:[]).slice(0,round===1?7:140)');
  x=x.replace(/missionType:String\(d\?\.missionType\|\|''\)\.slice\(0,40\)/g,"missionType:''");
  x=x.replace(/\.slice\(0,180\)/g,'.slice(0,60)').replace(/items\.slice\(-300\)/g,'items.slice(-80)');
  x=x.replace(/s\.on\('fx:player',[\s\S]*?s\.on\('world:ui'/,"s.on('fx:player',()=>{});s.on('fx:snapshot',()=>{});s.on('world:ui'");
  x=x.replace(/s\.on\('disconnect',reason=>\{/ ,"s.on('combat:attack',d=>{const now=Date.now();if(now-(p._combatAt||0)<220)return;p._combatAt=now;const target=String(d?.id||'').slice(0,80);if(!target)return;const damage=Math.max(1,Math.min(60,num(d?.damage,25)));if(s.id!==npcSource)io.to(npcSource).emit('npc:hit',{source:s.id,id:target,damage});});s.on('disconnect',reason=>{");
  return x.replace(/setInterval\(broadcastPlayers,50\)/g,'setInterval(broadcastPlayers,250)');
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
  return out;
 }
 if(typeof out==='string'&&/Salva a cornatan .*\.html$/.test(name)){
  const clean=out.replace(/<script[^>]*src=["']\/?online-final(?:14|17|18|20|21|22|23|24|25|26)\.js[^"']*["'][^>]*><\/script>/gi,'');
  const tag='<script src="/online-final14.js?v=15"></script><script src="/online-final18.js?v=26"></script><script src="/online-final17.js?v=24"></script><script src="/online-final24.js?v=3"></script><script src="/online-final25.js?v=3"></script>';
  return clean.replace(/<\/body>/i,tag+'</body>');
 }
 return out;
};
require('./server-base.js');

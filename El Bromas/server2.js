// Bootstrap wrapper: adds authoritative idle-NPC progression and shared day/night clock before server.js loads.
const fs=require('fs');
const original=fs.readFileSync;
fs.readFileSync=function(file,enc){
  const out=original.apply(this,arguments),name=String(file);
  if(typeof out==='string'&&/server-base\.js$/.test(name)){
    let x=out;
    x=x.replace(/let npcSnapshot=\{seq:0,serverTime:0,round:0,items:\[\]\},worldSnapshot=/,
      "let idleNpcTimer=null,ebDayClock=0;\nconst ebScheduleIdleNpc=()=>{if(idleNpcTimer||players.size===0||npcSnapshot.items.length!==0||worldNeedsBootstrap)return;idleNpcTimer=setTimeout(()=>{idleNpcTimer=null;if(players.size===0||npcSnapshot.items.length!==0||worldNeedsBootstrap)return;const nextRound=Math.max(1,Math.floor(round)+1),id='server:idle:'+Date.now();round=nextRound;const item={id,type:'pene',x:0,y:0,z:0,rx:0,ry:0,rz:0,hp:100,maxHp:100,walk:0,attack:false,protester:false,leap:false,leapPhase:0,fly:0,giant:false};npcSnapshot={seq:++seq,serverTime:Date.now(),round:nextRound,items:[item]};gameState={...gameState,seq:++seq,serverTime:Date.now(),round:nextRound,alive:1};io.emit('npc:snapshot',npcSnapshot);io.emit('round:state',nextRound);io.emit('game:state',gameState);log('NPC','Aparecio 1 NPC de avance tras 15s sin vivos')},15000)};\nconst ebCancelIdleNpc=()=>{if(idleNpcTimer){clearTimeout(idleNpcTimer);idleNpcTimer=null}};\nlet npcSnapshot={seq:0,serverTime:0,round:0,items:[]},worldSnapshot=");
    x += "\nsetInterval(()=>{if(players.size===0){ebCancelIdleNpc();return}if(npcSnapshot.items.length===0&&gameState.alive===0)ebScheduleIdleNpc();else if(npcSnapshot.items.length>0)ebCancelIdleNpc();ebDayClock=((Date.now()/1000)%1200)/1200*24;worldTime=ebDayClock;io.emit('world:time',{time:ebDayClock,serverTime:Date.now()})},1000);\n";
    return x;
  }
  if(typeof out==='string'&&/Salva a cornatan .*\.html$/.test(name)){
    const tag='<script src="/online-final26.js?v=1"></script>';
    return out.replace(/<\/body>/i,tag+'</body>');
  }
  return out;
};
require('./server.js');

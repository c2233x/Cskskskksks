// Bootstrap wrapper: authoritative idle-NPC progression, persistent car transforms/radio and shared day/night clock before server.js loads.
const fs=require('fs');
const original=fs.readFileSync;
fs.readFileSync=function(file,enc){
  const out=original.apply(this,arguments),name=String(file);
  if(typeof out==='string'&&/server-base\.js$/.test(name)){
    let x=out;
    x=x.replace(/let npcSnapshot=\{seq:0,serverTime:0,round:0,items:\[\]\},worldSnapshot=/,
      "let idleNpcTimer=null,ebEmptySince=0,ebDayClock=0,ebCarPositions=new Map();\nconst ebScheduleIdleNpc=()=>{if(idleNpcTimer||players.size===0||worldNeedsBootstrap||npcSnapshot.items.length!==0)return;idleNpcTimer=setTimeout(()=>{idleNpcTimer=null;if(players.size===0||worldNeedsBootstrap||npcSnapshot.items.length!==0)return;const nextRound=Math.max(1,Math.floor(round)+1),id='server:idle:'+Date.now();round=nextRound;const item={id,type:'pene',x:0,y:0,z:0,rx:0,ry:0,rz:0,hp:100,maxHp:100,walk:0,attack:false,protester:false,leap:false,leapPhase:0,fly:0,giant:false};npcSnapshot={seq:++seq,serverTime:Date.now(),round:nextRound,items:[item]};gameState={...gameState,seq:++seq,serverTime:Date.now(),round:nextRound,alive:1};ebEmptySince=0;io.emit('npc:snapshot',npcSnapshot);io.emit('round:state',nextRound);io.emit('game:state',gameState);log('NPC','Aparecio 1 NPC de avance tras 15s sin vivos')},15000)};\nconst ebCancelIdleNpc=()=>{if(idleNpcTimer){clearTimeout(idleNpcTimer);idleNpcTimer=null}};\nconst ebRefreshCars=()=>{const items=[];for(const [index,c] of ebCarPositions)items.push({id:'car:'+index,type:'car',index,x:c.x,y:c.y,z:c.z,ry:c.ry||0,speed:c.speed||0,visible:true});worldSnapshot={seq:++seq,serverTime:Date.now(),round,items};return worldSnapshot};\nlet npcSnapshot={seq:0,serverTime:0,round:0,items:[]},worldSnapshot=");
    x=x.replace(/const syncPack=\(\)=>\(\{round,players:/,"const syncPack=()=>{ebRefreshCars();return {round,players:");
    x=x.replace(/gameState,cars:publicCars\(\)\}\);/,'gameState,cars:publicCars()}};');
    x=x.replace(/s\.on\('player:state',d=>\{/ ,"s.on('player:state',d=>{if(d&&d.driving&&Number.isInteger(d.carIndex)&&d.carIndex>=0)ebCarPositions.set(d.carIndex,{x:num(d.carX),y:num(d.carY),z:num(d.carZ),ry:num(d.carRot),speed:num(d.carSpeed)});");
    x += "\nsetInterval(()=>{if(players.size===0){ebCancelIdleNpc();ebEmptySince=0;return}if(npcSnapshot.items.length===0&&gameState.alive===0&&!worldNeedsBootstrap){if(!ebEmptySince)ebEmptySince=Date.now();if(Date.now()-ebEmptySince>=15000)ebScheduleIdleNpc()}else{ebEmptySince=0;ebCancelIdleNpc()}ebRefreshCars();io.emit('world:snapshot',worldSnapshot);ebDayClock=((Date.now()/1000)%1200)/1200*24;worldTime=ebDayClock;io.emit('world:time',{time:ebDayClock,serverTime:Date.now()})},500);\n";
    return x;
  }
  if(typeof out==='string'&&/Salva a cornatan .*\.html$/.test(name)){
    const tag='<script src="/online-final26.js?v=2"></script>';
    return out.replace(/<\/body>/i,tag+'</body>');
  }
  return out;
};
require('./server.js');

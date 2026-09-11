(()=>{
if(window.__EB_FINAL24)return;window.__EB_FINAL24=1;
const s=window.__ebSocket;
let source=false,joined=false,lastAttack=0,lastAttackState=false;
const N=(v,d=0)=>Number.isFinite(+v)?+v:d;
function isRemoteNpc(o){return !!o?.userData?.__ebRemoteNpc}
function removeLocalNpc(o){try{if(!o||isRemoteNpc(o))return false;o.parent?.remove(o);o.userData&&(o.userData.__ebLocalNpcRemoved=true);return true}catch{return false}}
function cleanLocalNpcs(){
  if(source)return;
  try{
    for(const arrName of ['smallPenes','activeMiniBosses']){
      const arr=window[arrName];
      if(Array.isArray(arr)){
        for(let i=arr.length-1;i>=0;i--)if(arr[i]&&!isRemoteNpc(arr[i])){removeLocalNpc(arr[i]);arr.splice(i,1)}
      }
    }
    if(window.boss&&!isRemoteNpc(window.boss)){removeLocalNpc(window.boss);try{window.boss=null}catch{}}
  }catch{}
}
function nearestServerNpc(){
  if(typeof scene==='undefined'||typeof character==='undefined')return null;
  let best=null,bd=25;
  try{scene.traverse(o=>{
    if(!isRemoteNpc(o)||!o.parent)return;
    const dx=N(o.position.x)-N(character.position.x),dy=N(o.position.y)-N(character.position.y),dz=N(o.position.z)-N(character.position.z),d=dx*dx+dy*dy+dz*dz;
    if(d<bd){bd=d;best=o}
  })}catch{}
  return best;
}
function attackDamage(special){
  let d=Number(window.attackDamage??window.playerAttackDamage??window.damage??window.meleeDamage);
  if(!Number.isFinite(d)||d<=0)d=special?50:25;
  return Math.max(1,Math.min(60,Math.round(d)));
}
function sendAttack(special){
  if(!s||!s.connected||source)return;
  const now=performance.now();if(now-lastAttack<220)return;
  const n=nearestServerNpc();if(!n)return;
  const id=String(n.userData.__ebNetId||'');if(!id)return;
  lastAttack=now;
  s.emit('combat:attack',{id,damage:attackDamage(special),special:!!special});
}
function attackMonitor(){
  const a=typeof isAttacking!=='undefined'&&!!isAttacking;
  const sp=typeof isSpecialAttacking!=='undefined'&&!!isSpecialAttacking;
  const now=a||sp;
  if(now&&!lastAttackState)sendAttack(sp);
  lastAttackState=now;
  requestAnimationFrame(attackMonitor);
}
function bind(){
  if(!s){setTimeout(bind,300);return}
  s.on('room:welcome',d=>{source=!!d?.npcSource;joined=true;if(!source){cleanLocalNpcs();setTimeout(cleanLocalNpcs,150);setTimeout(cleanLocalNpcs,500);}});
  s.on('room:role',d=>{source=!!d?.npcSource;if(!source)cleanLocalNpcs()});
  s.on('room:sync',d=>{if(d&&typeof d.npcSource==='boolean')source=!!d.npcSource;if(!source)cleanLocalNpcs()});
  s.on('npc:snapshot',()=>{if(!source){cleanLocalNpcs();setTimeout(cleanLocalNpcs,40)}});
  s.on('game:state',d=>{window.__EB_SERVER_GAME_STATE=d||null});
  s.on('round:state',r=>{window.__EB_SERVER_ROUND=N(r)});
  s.on('world:ui',d=>{window.__EB_SERVER_WORLD_UI=d||null});
  setInterval(()=>{if(joined&&!source)cleanLocalNpcs()},700);
  requestAnimationFrame(attackMonitor);
}
bind();
})();

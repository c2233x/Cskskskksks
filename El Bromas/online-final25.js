(()=>{
if(window.__EB_FINAL25)return;window.__EB_FINAL25=1;
const s=window.__ebSocket;let source=false,synced=false,serverRound=0,serverAlive=0,serverGame=null,serverNpc=[];
const N=(v,d=0)=>Number.isFinite(+v)?+v:d;
const badText=t=>/evento\s+protesta\s+vand[aá]listica|^oleada\s*[:#-]?\s*\d*|^listo\.?$/i.test(String(t||'').replace(/\s+/g,' ').trim());
function cleanFakeText(){try{for(const e of document.querySelectorAll('body *')){if(!e.children.length&&badText(e.textContent)){const p=e.parentElement;if(p&&p.id!=='ebChat16'&&!p.closest('#ebPlayers16'))e.style.display='none'}}}catch{}}
function setVar(n,v){try{if(typeof window[n]!=='undefined')window[n]=v}catch{}}
function setNpcBlock(v){
 window.__EB_BLOCK_LOCAL_NPC=!!v;
 try{
  for(const name of ['createSmallPene','createBoss']){
   const fn=window[name];
   if(typeof fn==='function'&&!fn.__ebNpcFactory25){
    const wrap=function(){if(window.__EB_BLOCK_LOCAL_NPC&&!window.__EB_REMOTE_NPC_BUILD)return null;return fn.apply(this,arguments)};
    wrap.__ebNpcFactory25=true;wrap.__ebNpcOriginal25=fn;window[name]=wrap;
   }
  }
 }catch{}
}
function applyAuthoritativeState(){
 if(source||!synced)return;
 setVar('waveNumber',serverRound);setVar('currentRound',serverRound);setVar('roundNumber',serverRound);setVar('currentWave',serverRound);setVar('ronda',serverRound);setVar('wave',serverRound);
 window.__ebAuthoritativeRound=serverRound;window.__ebAuthoritativeAlive=serverAlive;window.__ebAuthoritativeGame=serverGame;window.__ebAuthoritativeNpcSnapshot=serverNpc;
 try{window.__ebApplyAuthoritativeRound?.({round:serverRound,alive:serverAlive,items:serverNpc,game:serverGame})}catch{}
 cleanFakeText();
}
function removeLateJoinNpcs(){
 if(source||!synced)return;
 try{
  for(const arrName of ['smallPenes','activeMiniBosses']){
   const a=window[arrName];
   if(Array.isArray(a)){
    for(let i=a.length-1;i>=0;i--){const n=a[i];if(!n?.userData?.__ebRemoteNpc){n?.parent?.remove(n);a.splice(i,1)}}
   }
  }
  if(window.boss&&!window.boss.userData?.__ebRemoteNpc){window.boss.parent?.remove(window.boss);try{window.boss=null}catch{}}
 }catch{}
}
function freezeLocalRound(){
 if(source||!synced)return;
 setNpcBlock(true);
 applyAuthoritativeState();
 removeLateJoinNpcs();
 try{
  for(const n of ['spawnSmallPenes','spawnRound','spawnWave','spawnNPCs','spawnNpcs','startWave','nextWave']){
   const fn=window[n];
   if(typeof fn==='function'&&!fn.__ebSpawnGuard25){
    const wrap=function(){if(window.__EB_BLOCK_LOCAL_NPC)return undefined;return fn.apply(this,arguments)};
    wrap.__ebSpawnGuard25=true;wrap.__ebSpawnOriginal25=fn;window[n]=wrap;
   }
  }
 }catch{}
}
function unfreezeSource(){if(source){window.__EB_BLOCK_LOCAL_NPC=false;}}
function bind(){
 if(!s){setTimeout(bind,300);return}
 s.on('room:welcome',d=>{source=!!d?.npcSource;const g=d?.gameState||{};serverGame=g;serverRound=Math.max(N(d?.round),N(g.round));serverAlive=Math.max(0,Math.floor(N(g.alive??d?.alive)));serverNpc=Array.isArray(d?.npcSnapshot?.items)?d.npcSnapshot.items:[];if(!serverAlive&&serverNpc.length)serverAlive=serverNpc.length;synced=true;if(source)unfreezeSource();else{freezeLocalRound();setTimeout(freezeLocalRound,0);setTimeout(freezeLocalRound,50);setTimeout(freezeLocalRound,150);setTimeout(freezeLocalRound,400);setTimeout(freezeLocalRound,800);}});
 s.on('room:sync',d=>{if(typeof d?.npcSource==='boolean')source=!!d.npcSource;const g=d?.gameState||{};serverGame=g;serverRound=Math.max(N(d?.round),N(g.round));serverAlive=Math.max(0,Math.floor(N(g.alive??d?.alive)));serverNpc=Array.isArray(d?.npcSnapshot?.items)?d.npcSnapshot.items:[];if(!serverAlive&&serverNpc.length)serverAlive=serverNpc.length;synced=true;if(source)unfreezeSource();else freezeLocalRound()});
 s.on('round:state',r=>{if(!source){serverRound=N(r);freezeLocalRound()}});
 s.on('game:state',g=>{if(!source){serverGame=g||{};serverRound=Math.max(serverRound,N(g?.round));if(g?.alive!==undefined)serverAlive=Math.max(0,Math.floor(N(g.alive)));freezeLocalRound()}});
 s.on('npc:snapshot',m=>{if(!source){serverNpc=Array.isArray(m?.items)?m.items:[];serverAlive=serverNpc.length;freezeLocalRound()}});
 new MutationObserver(cleanFakeText).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 setInterval(()=>{if(source){unfreezeSource();return}if(synced)freezeLocalRound()},150);
}
bind();
})();

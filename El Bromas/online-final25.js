(()=>{
if(window.__EB_FINAL25)return;window.__EB_FINAL25=1;
const s=window.__ebSocket;let source=false,synced=false,serverRound=0,serverAlive=0,serverGame=null,serverNpc=[];
const N=(v,d=0)=>Number.isFinite(+v)?+v:d;
const badText=t=>/evento\s+protesta\s+vand[aá]listica|^oleada\s*[:#-]?\s*\d*|^listo\.?$/i.test(String(t||'').replace(/\s+/g,' ').trim());
function cleanFakeText(){try{for(const e of document.querySelectorAll('body *')){if(!e.children.length&&badText(e.textContent)){const p=e.parentElement;if(p&&p.id!=='ebChat16'&&!p.closest('#ebPlayers16'))e.style.display='none'}}}catch{}}
function setVar(n,v){try{if(typeof window[n]!=='undefined')window[n]=v}catch{}}
function applyAuthoritativeState(){
 if(source||!synced)return;
 setVar('waveNumber',serverRound);setVar('currentRound',serverRound);setVar('roundNumber',serverRound);setVar('currentWave',serverRound);setVar('ronda',serverRound);setVar('wave',serverRound);
 window.__ebAuthoritativeRound=serverRound;window.__ebAuthoritativeAlive=serverAlive;window.__ebAuthoritativeGame=serverGame;window.__ebAuthoritativeNpcSnapshot=serverNpc;
 try{window.__ebApplyAuthoritativeRound?.({round:serverRound,alive:serverAlive,items:serverNpc,game:serverGame})}catch{}
 cleanFakeText();
}
function removeLateJoinNpcs(){
 if(source||!synced)return;
 try{if(Array.isArray(window.smallPenes)){for(let i=window.smallPenes.length-1;i>=0;i--){const n=window.smallPenes[i];if(!n?.userData?.__ebRemoteNpc){n?.parent?.remove(n);window.smallPenes.splice(i,1)}}}
 if(Array.isArray(window.activeMiniBosses)){for(let i=window.activeMiniBosses.length-1;i>=0;i--){const n=window.activeMiniBosses[i];if(!n?.userData?.__ebRemoteNpc){n?.parent?.remove(n);window.activeMiniBosses.splice(i,1)}}}
 }catch{}
}
function disableLateJoinLocalProgress(){if(source||!synced)return;applyAuthoritativeState();removeLateJoinNpcs()}
function bind(){
 if(!s){setTimeout(bind,300);return}
 s.on('room:welcome',d=>{source=!!d?.npcSource;const g=d?.gameState||{};serverGame=g;serverRound=Math.max(N(d?.round),N(g.round));serverAlive=Math.max(0,Math.floor(N(g.alive??d?.alive)));serverNpc=Array.isArray(d?.npcSnapshot?.items)?d.npcSnapshot.items:[];if(!serverAlive&&serverNpc.length)serverAlive=serverNpc.length;synced=true;disableLateJoinLocalProgress();setTimeout(disableLateJoinLocalProgress,50);setTimeout(disableLateJoinLocalProgress,250);setTimeout(disableLateJoinLocalProgress,700)});
 s.on('room:sync',d=>{if(typeof d?.npcSource==='boolean')source=!!d.npcSource;const g=d?.gameState||{};serverGame=g;serverRound=Math.max(N(d?.round),N(g.round));serverAlive=Math.max(0,Math.floor(N(g.alive??d?.alive)));serverNpc=Array.isArray(d?.npcSnapshot?.items)?d.npcSnapshot.items:[];if(!serverAlive&&serverNpc.length)serverAlive=serverNpc.length;synced=true;disableLateJoinLocalProgress()});
 s.on('round:state',r=>{if(!source){serverRound=N(r);applyAuthoritativeState()}});
 s.on('game:state',g=>{if(!source){serverGame=g||{};serverRound=Math.max(serverRound,N(g?.round));if(g?.alive!==undefined)serverAlive=Math.max(0,Math.floor(N(g.alive)));applyAuthoritativeState()}});
 s.on('npc:snapshot',m=>{if(!source){serverNpc=Array.isArray(m?.items)?m.items:[];serverAlive=serverNpc.length;applyAuthoritativeState();removeLateJoinNpcs()}});
 new MutationObserver(cleanFakeText).observe(document.documentElement,{subtree:true,childList:true,characterData:true});setInterval(disableLateJoinLocalProgress,250);
}
bind();
})();

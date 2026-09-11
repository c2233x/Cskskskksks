(()=>{
if(window.__EB_FINAL25)return;window.__EB_FINAL25=1;
const s=window.__ebSocket;let source=false,synced=false,serverRound=0,serverAlive=0,serverGame=null,serverNpc=[];
const N=(v,d=0)=>Number.isFinite(+v)?+v:d;
const badText=t=>/evento\s+protesta\s+vand[aá]listica|^oleada\s*[:#-]?\s*\d*|^listo\.?$/i.test(String(t||'').replace(/\s+/g,' ').trim());
function cleanFakeText(){try{for(const e of document.querySelectorAll('body *')){if(!e.children.length&&badText(e.textContent)){const p=e.parentElement;if(p&&p.id!=='ebChat16'&&!p.closest('#ebPlayers16'))e.style.display='none'}}}catch{}}
function applyAuthoritativeState(){
 if(source||!synced)return;
 try{
  if(typeof waveNumber!=='undefined')waveNumber=serverRound;
  if(typeof currentRound!=='undefined')currentRound=serverRound;
  if(typeof roundNumber!=='undefined')roundNumber=serverRound;
  if(typeof currentWave!=='undefined')currentWave=serverRound;
  if(typeof ronda!=='undefined')ronda=serverRound;
  if(typeof wave!=='undefined')wave=serverRound;
  window.__ebAuthoritativeRound=serverRound;
  window.__ebAuthoritativeAlive=serverAlive;
  window.__ebAuthoritativeGame=serverGame;
  if(Array.isArray(window.smallPenes)){for(let i=window.smallPenes.length-1;i>=serverAlive;i--){} }
 }catch{}
}
function disableLateJoinLocalProgress(){
 if(source||!synced)return;
 // Do not let the joining client advance rounds locally; the server host is authoritative.
 applyAuthoritativeState();
 cleanFakeText();
}
function bind(){
 if(!s){setTimeout(bind,300);return}
 s.on('room:welcome',d=>{source=!!d?.npcSource;const g=d?.gameState||{};serverGame=g;serverRound=Math.max(N(d?.round),N(g.round));serverAlive=Math.max(0,Math.floor(N(g.alive)));serverNpc=Array.isArray(d?.npcSnapshot?.items)?d.npcSnapshot.items:[];if(!serverAlive&&serverNpc.length)serverAlive=serverNpc.length;synced=true;setTimeout(disableLateJoinLocalProgress,0);setTimeout(disableLateJoinLocalProgress,100);setTimeout(disableLateJoinLocalProgress,500)});
 s.on('room:sync',d=>{if(typeof d?.npcSource==='boolean')source=!!d.npcSource;const g=d?.gameState||{};serverGame=g;serverRound=Math.max(N(d?.round),N(g.round));serverAlive=Math.max(0,Math.floor(N(g.alive)));serverNpc=Array.isArray(d?.npcSnapshot?.items)?d.npcSnapshot.items:[];if(!serverAlive&&serverNpc.length)serverAlive=serverNpc.length;synced=true;disableLateJoinLocalProgress()});
 s.on('round:state',r=>{if(!source){serverRound=N(r);applyAuthoritativeState()}});
 s.on('game:state',g=>{if(!source){serverGame=g||{};serverRound=Math.max(serverRound,N(g?.round));serverAlive=Math.max(0,Math.floor(N(g?.alive)));applyAuthoritativeState()}});
 s.on('npc:snapshot',m=>{if(!source){serverNpc=Array.isArray(m?.items)?m.items:[];serverAlive=serverNpc.length;applyAuthoritativeState()}});
 const mo=new MutationObserver(cleanFakeText);mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true});
 setInterval(disableLateJoinLocalProgress,250);
}
bind();
})();

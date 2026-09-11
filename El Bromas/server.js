// Launcher: stable multiplayer server with explicit authoritative NPC/event state and low-lag combat.
// server.js is the active entry point on Render.
const fs = require('fs');
const originalRead = fs.readFileSync;
fs.readFileSync = function(file, enc){
  const out = originalRead.apply(this, arguments);
  const name = String(file);
  if (typeof out === 'string' && /server-base\.js$/.test(name)) {
    let x = out;
    x = x.replace(/items:\(Array\.isArray\(d\?\.items\)\?d\.items:\[\]\)\.slice\(0,140\)/, 'items:(Array.isArray(d?.items)?d.items:[]).slice(0,round===1?7:140)');
    x = x.replace(/missionType:String\(d\?\.missionType\|\|''\)\.slice\(0,40\)/g, "missionType:''");
    x = x.replace(/\.slice\(0,180\)/g, '.slice(0,60)')
         .replace(/items\.slice\(-300\)/g, 'items.slice(-80)')
         .replace(/s\.on\('fx:player',[\s\S]*?s\.on\('world:ui'/, "s.on('fx:player',()=>{});s.on('fx:snapshot',()=>{});s.on('world:ui'");
    x = x.replace(/s\.on\('disconnect',reason=>\{/, "s.on('combat:attack',d=>{const now=Date.now();if(now-(p._combatAt||0)<220)return;p._combatAt=now;const target=String(d?.id||'').slice(0,80);if(!target)return;const damage=Math.max(1,Math.min(60,num(d?.damage,25)));io.emit('combat:attack',{id:s.id,target,damage,special:!!d?.special,serverTime:now});if(s.id!==npcSource)io.to(npcSource).emit('npc:hit',{source:s.id,id:target,damage});});\ns.on('disconnect',reason=>{");
    return x.replace(/setInterval\(broadcastPlayers,50\)/g, 'setInterval(broadcastPlayers,250)');
  }
  if (typeof out === 'string' && /online-final14\.js$/.test(name)) {
    return out
      .replace(/function collectFx\(\)\{[\s\S]*?\}\n(?=function applyFx)/, 'function collectFx(){return[]}\n')
      .replace(/function applyFx\(a\)\{[\s\S]*?\}\n(?=function )/, 'function applyFx(a){}\n');
  }
  if (typeof out === 'string' && /online-final18\.js$/.test(name)) {
    return out
      .replace(/function applyPlayers\(a\)\{[\s\S]*?\}\nfunction animatePlayers/, 'function applyPlayers(a){players=Array.isArray(a)?a:[];window.__ebP18B=players}\nfunction animatePlayers')
      .replace(/function applyNpc\(m\)\{[\s\S]*?\}\nfunction animateNpc/, 'function applyNpc(m){}\nfunction animateNpc')
      .replace(/function localFx\(\)\{[\s\S]*?\}\nfunction applyFx/, 'function localFx(){return[]}\nfunction applyFx')
      .replace(/function applyFx\(items\)\{[\s\S]*?\}\nfunction carFix/, 'function applyFx(items){}\nfunction carFix');
  }
  if (typeof out === 'string' && /Salva a cornatan .*\.html$/.test(name)) {
    const clean = out.replace(/<script[^>]*src=["']\/?online-final(?:14|17|18|20|21|22|23|24)\.js[^"']*["'][^>]*><\/script>/gi,'');
    const tag = '<script src="/online-final14.js?v=14"></script><script src="/online-final18.js?v=24"></script><script src="/online-final17.js?v=24"></script><script src="/online-final24.js?v=1"></script>';
    return clean.replace(/<\/body>/i, tag+'</body>');
  }
  return out;
};
require('./server-base.js');

// Launcher: stable multiplayer server with explicit low-lag network controls.
// server.js is the active entry point on Render.
const fs = require('fs');
const originalRead = fs.readFileSync;
fs.readFileSync = function(file, enc){
  const out = originalRead.apply(this, arguments);
  const name = String(file);
  if (typeof out === 'string' && /server-base\.js$/.test(name)) {
    // Keep gameplay/server logic intact, but prevent projectile/stain floods.
    return out
      .replace(/\.slice\(0,180\)/g, '.slice(0,60)')
      .replace(/items\.slice\(-300\)/g, 'items.slice(-80)')
      .replace(/setInterval\(broadcastPlayers,50\)/g, 'setInterval(broadcastPlayers,250)');
  }
  if (typeof out === 'string' && /Salva a cornatan .*\.html$/.test(name)) {
    const clean = out
      .replace(/<script[^>]*src=[\"']\/?online-final(?:14|17|18|20|21|22|23)\.js[^\"']*[\"'][^>]*><\/script>/gi,'');
    const tag = '<script src="/online-final14.js?v=14"></script><script src="/online-final18.js?v=23"></script><script src="/online-final17.js?v=24"></script><script src="/online-final23.js?v=1"></script>';
    return clean.replace(/<\/body>/i, tag+'</body>');
  }
  return out;
};
require('./server-base.js');

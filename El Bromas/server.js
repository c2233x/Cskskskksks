// Launcher: stable multiplayer server with explicit low-lag client injection.
// Keep the server-base gameplay logic intact; this file controls which network
// client patch is actually served by Render.
const fs = require('fs');
const originalRead = fs.readFileSync;
fs.readFileSync = function(file, enc){
  const out = originalRead.apply(this, arguments);
  if (typeof out === 'string' && /Salva a cornatan .*\.html$/.test(String(file))) {
    const clean = out
      .replace(/<script[^>]*src=[\"']\/?online-final(?:14|17|18|20|21|22|23)\.js[^\"']*[\"'][^>]*><\/script>/gi,'');
    const tag = '<script src="/online-final14.js?v=14"></script><script src="/online-final18.js?v=23"></script><script src="/online-final17.js?v=24"></script><script src="/online-final23.js?v=1"></script>';
    return clean.replace(/<\/body>/i, tag+'</body>');
  }
  return out;
};
require('./server-base.js');

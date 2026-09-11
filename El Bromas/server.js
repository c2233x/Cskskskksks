// Launcher: keeps the stable multiplayer server and injects the latest client network fixes.
const fs = require('fs');
const originalRead = fs.readFileSync;
fs.readFileSync = function(file, enc){
  const out = originalRead.apply(this, arguments);
  if (typeof out === 'string' && /Salva a cornatan .*\.html$/.test(String(file))) {
    const tag = '<script src="/online-final20.js?v=3"></script><script src="/online-final21.js?v=2"></script><script src="/online-final22.js?v=1"></script>';
    const clean = out.replace(/<script[^>]*src=[\"']\/?online-final20\.js[^\"']*[\"'][^>]*><\/script>/gi,'').replace(/<script[^>]*src=[\"']\/?online-final21\.js[^\"']*[\"'][^>]*><\/script>/gi,'').replace(/<script[^>]*src=[\"']\/?online-final22\.js[^\"']*[\"'][^>]*><\/script>/gi,'');
    return clean.replace(/<\/body>/i, tag+'</body>');
  }
  return out;
};
require('./server-base.js');

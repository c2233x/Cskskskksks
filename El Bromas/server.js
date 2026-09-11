// Lightweight launcher: keeps the stable multiplayer server and reduces high-frequency room/NPC traffic.
const NativeSetInterval = global.setInterval;
global.setInterval = function(fn, delay, ...args){
  // 50ms network broadcasts are unnecessarily expensive on mobile.
  // Keep gameplay responsive while limiting the server-side snapshot rate.
  const d = delay === 50 ? 150 : delay;
  return NativeSetInterval(fn, d, ...args);
};
const fs = require('fs');
const originalRead = fs.readFileSync;
fs.readFileSync = function(file, enc){
  const out = originalRead.apply(this, arguments);
  if (typeof out === 'string' && /Salva a cornatan .*\.html$/.test(String(file))) {
    const tag = '<script src="/online-final20.js?v=2"></script><script src="/online-final21.js?v=1"></script>';
    if (!out.includes('/online-final20.js')) return out.replace(/<\/body>/i, tag+'</body>');
    return out;
  }
  return out;
};
require('./server-base.js');
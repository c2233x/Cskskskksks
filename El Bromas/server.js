// Lightweight launcher: keeps the stable multiplayer server and trims the high-frequency room broadcast.
// The original stable server is stored as server-base.js so its game-sync behavior stays unchanged.
const NativeSetInterval = global.setInterval;
global.setInterval = function(fn, delay, ...args){
  // The stable server only uses the 50ms interval for room player broadcasts.
  // At 100ms the game still receives 10 player snapshots per second with much less traffic.
  const d = delay === 50 ? 100 : delay;
  return NativeSetInterval(fn, d, ...args);
};
const fs = require('fs');
const originalRead = fs.readFileSync;
fs.readFileSync = function(file, enc){
  const out = originalRead.apply(this, arguments);
  if (typeof out === 'string' && /Salva a cornatan .*\.html$/.test(String(file))) {
    const tag = '<script src="/online-final20.js?v=1"></script>';
    if (!out.includes('/online-final20.js')) return out.replace(/<\/body>/i, tag+'</body>');
    return out;
  }
  return out;
};
require('./server-base.js');
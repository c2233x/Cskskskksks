// Stable launcher. Keep server-base.js untouched at runtime to avoid transformation syntax crashes.
const fs=require('fs');
const originalRead=fs.readFileSync;

fs.readFileSync=function(file,enc){
  const out=originalRead.apply(this,arguments);
  const name=String(file);
  if(typeof out==='string' && /Salva a cornatan .*\.html$/i.test(name)){
    const clean=out.replace(/<script[^>]*src=["']\/?online-final(?:14|17|18|20|21|22|23|24|25|26)\.js[^"']*["'][^>]*><\/script>/gi,'');
    const scripts=`<script src="/socket.io/socket.io.js"></script><script>window.__ebSocket=io(location.origin,{path:'/socket.io/',transports:['websocket'],reconnection:true,reconnectionAttempts:Infinity,reconnectionDelay:500,timeout:8000});</script><script src="/online-final14.js?v=stable1"></script><script src="/online-final18.js?v=stable1"></script><script src="/online-final17.js?v=stable1"></script><script src="/online-final24.js?v=stable1"></script><script src="/online-final25.js?v=stable1"></script><script src="/online-final26.js?v=stable1"></script><script src="/online-streets.js?v=stable1"></script>`;
    return clean.replace(/<\/body>/i,scripts+'</body>');
  }
  return out;
};

require('./server-base.js');

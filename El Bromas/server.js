const path=require('path');
const http=require('http');
const fs=require('fs');
const express=require('express');
const {Server}=require('socket.io');

const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:'*'},transports:['websocket','polling'],pingInterval:5000,pingTimeout:12000,maxHttpBufferSize:1e6});
const PORT=Number(process.env.PORT)||10000;
const GAME_FILE=path.join(__dirname,'Salva a cornatan 👈.html');
const SYNC='<style id="ebOnlineNoReset">#sysRestartBtn,#restartFromSettings{display:none!important}</style><script src="/socket.io/socket.io.js"></script><script src="/online-sync.js"></script>';
const MAX_PLAYERS=64;
const players=new Map();
const sessions=new Map();
let hostId=null;
let world=null;
let lastBroadcast=0;

const clean=v=>String(v??'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador';
const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const poseClean=p=>{const o={};if(!p||typeof p!=='object')return o;for(const[k,v]of Object.entries(p).slice(0,40))if(Array.isArray(v)&&v.length===3)o[k]=v.map(num);return o};
const pub=()=>[...players.values()];

function broadcast(){
  const a=pub();
  io.emit('room:players',a);
  io.emit('online:count',a.length);
}

function cleanNpc(n){
  return {
    id:clean(n?.id).slice(0,64),
    type:clean(n?.type).slice(0,20),
    x:num(n?.x),y:num(n?.y),z:num(n?.z),
    rx:num(n?.rx),ry:num(n?.ry),rz:num(n?.rz),
    hp:Math.max(0,num(n?.hp)),
    maxHp:Math.max(1,num(n?.maxHp,1)),
    scale:Math.max(.05,num(n?.scale,1)),
    giant:!!n?.giant,
    walk:num(n?.walk),
    leap:!!n?.leap
  };
}

function setWorld(d){
  if(!d||!Array.isArray(d.npcs))return;
  world={
    time:Date.now(),
    round:Math.max(0,Math.floor(num(d.round,d.wave))),
    npcs:d.npcs.slice(0,300).map(cleanNpc)
  };
}

function serveGame(_q,r){
  try{
    let h=fs.readFileSync(GAME_FILE,'utf8');
    h=h.replace(/<script[^>]*src=["']\/socket\.io\/socket\.io\.js["'][^>]*><\/script>/gi,'');
    h=h.replace(/<script[^>]*src=["']\/online-sync\.js["'][^>]*><\/script>/gi,'');
    h=h.replace(/<script[^>]*src=["']https?:\/\/cdn\.socket\.io[^"']+["'][^>]*><\/script>/gi,'');
    h=/<\/body>/i.test(h)?h.replace(/<\/body>/i,SYNC+'</body>'):h+SYNC;
    r.set('Cache-Control','no-store,no-cache,must-revalidate,proxy-revalidate');
    r.type('html').send(h);
  }catch(e){
    console.error(e);
    r.status(500).send('No se pudo cargar el juego');
  }
}

app.get('/health',(_q,r)=>r.json({ok:true,online:players.size,max:MAX_PLAYERS,host:!!hostId,synchronized:true}));
app.get('/api/online',(_q,r)=>r.json({ok:true,online:players.size,max:MAX_PLAYERS,synchronized:true}));
app.get('/',serveGame);
app.get('/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);
app.get('/Salva a cornatan 👈.html',serveGame);
app.use(express.static(__dirname,{maxAge:'1h'}));

io.on('connection',socket=>{
  if(players.size>=MAX_PLAYERS){
    socket.emit('server:full');
    return socket.disconnect(true);
  }

  const p={
    id:socket.id,session:'',
    name:'Jugador',x:0,y:0,z:0,rx:0,ry:0,rz:0,
    hp:100,aura:0,kills:0,round:0,dead:false,
    moving:false,running:false,jumping:false,flying:false,
    attacking:false,special:false,attackPhase:0,specialPhase:0,
    walkCycle:0,pose:{},lastUpdate:Date.now()
  };
  players.set(socket.id,p);
  if(!hostId)hostId=socket.id;

  socket.on('room:join',d=>{
    const session=String(d?.session??'').trim().slice(0,100);
    if(session){
      const previous=sessions.get(session);
      if(previous&&previous!==socket.id){
        const old=io.sockets.sockets.get(previous);
        if(old)old.disconnect(true);
        players.delete(previous);
      }
      sessions.set(session,socket.id);
      p.session=session;
    }

    p.name=clean(d?.name);
    p.kills=Math.max(0,num(d?.kills));
    p.round=world?world.round:Math.max(0,num(d?.round));

    socket.emit('room:welcome',{id:socket.id,host:socket.id===hostId,players:pub(),world});
    socket.broadcast.emit('player:joined',{id:socket.id,name:p.name});
    broadcast();
  });

  socket.on('player:state',d=>{
    if(!d)return;
    p.name=clean(d.name||p.name);
    p.x=num(d.x,p.x);p.y=num(d.y,p.y);p.z=num(d.z,p.z);
    p.rx=num(d.rx,p.rx);p.ry=num(d.ry,p.ry);p.rz=num(d.rz,p.rz);
    p.hp=Math.max(0,num(d.hp,p.hp));
    p.aura=Math.max(0,num(d.aura,p.aura));
    p.kills=Math.max(0,num(d.kills,p.kills));
    p.dead=!!d.dead;p.moving=!!d.moving;p.running=!!d.running;
    p.jumping=!!d.jumping;p.flying=!!d.flying;p.attacking=!!d.attacking;
    p.special=!!d.special;p.attackPhase=num(d.attackPhase,p.attackPhase);
    p.specialPhase=num(d.specialPhase,p.specialPhase);
    p.walkCycle=num(d.walkCycle,p.walkCycle);
    p.pose=poseClean(d.pose);
    p.lastUpdate=Date.now();
    if(socket.id===hostId&&Array.isArray(d.npcs))setWorld(d);
  });

  socket.on('player:name',name=>{
    p.name=clean(name);
    broadcast();
  });

  socket.on('latency:ping',(_sent,ack)=>{
    if(typeof ack==='function')ack(Date.now());
  });

  socket.on('disconnect',reason=>{
    const wasHost=socket.id===hostId;
    if(p.session&&sessions.get(p.session)===socket.id)sessions.delete(p.session);
    players.delete(socket.id);
    socket.broadcast.emit('player:left',{id:socket.id,name:p.name,reason});

    if(wasHost){
      hostId=players.keys().next().value||null;
      if(hostId)io.to(hostId).emit('room:host',true);
    }
    broadcast();
  });
});

setInterval(()=>{
  const now=Date.now();
  if(now-lastBroadcast<100)return;
  lastBroadcast=now;
  broadcast();
  if(world)io.emit('world:state',world);
},25);

server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas multiplayer server ready on '+PORT));
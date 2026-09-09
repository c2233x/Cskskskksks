const path=require('path');
const http=require('http');
const fs=require('fs');
const express=require('express');
const {Server}=require('socket.io');
const app=express();const server=http.createServer(app);
const io=new Server(server,{cors:{origin:'*'},transports:['websocket','polling'],pingInterval:5000,pingTimeout:12000,maxHttpBufferSize:1e6});
const PORT=Number(process.env.PORT)||10000;
const GAME_FILE=path.join(__dirname,'Salva a cornatan 👈.html');
const INJECT='<style>#sysRestartBtn,#restartFromSettings{display:none!important}</style><script src="/socket.io/socket.io.js"></script><script src="/online-sync.js"></script>';
const players=new Map(),pending=new Set(),sessions=new Map();let hostId=null,world=null,lastBroadcast=0;
const clean=v=>String(v??'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador';
const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const pose=p=>{const o={};if(!p||typeof p!=='object')return o;for(const[k,v]of Object.entries(p).slice(0,32))if(Array.isArray(v)&&v.length===3)o[k]=v.map(x=>num(x));return o};
const pub=()=>[...players.values()];
function broadcast(){const a=pub();io.emit('room:players',a);io.emit('online:count',a.length)}
function npc(n){return{id:clean(n?.id).slice(0,64),type:clean(n?.type).slice(0,12),x:num(n?.x),y:num(n?.y),z:num(n?.z),rx:num(n?.rx),ry:num(n?.ry),rz:num(n?.rz),hp:Math.max(0,num(n?.hp)),maxHp:Math.max(1,num(n?.maxHp,1)),scale:Math.max(.05,num(n?.scale,1)),giant:!!n?.giant,walk:num(n?.walk),leap:!!n?.leap}}
function setWorld(d){if(!d||!Array.isArray(d.npcs))return;world={time:Date.now(),round:Math.max(0,Math.floor(num(d.round,d.wave))),npcs:d.npcs.slice(0,250).map(npc)}}
function game(_q,r){try{let h=fs.readFileSync(GAME_FILE,'utf8');h=h.replace(/<script[^>]*src=["']\/socket\.io\/socket\.io\.js["'][^>]*><\/script>/gi,'').replace(/<script[^>]*src=["']\/online-sync\.js["'][^>]*><\/script>/gi,'').replace(/<script[^>]*src=["']https?:\/\/cdn\.socket\.io[^"']+["'][^>]*><\/script>/gi,'');h=/<\/body>/i.test(h)?h.replace(/<\/body>/i,INJECT+'</body>'):h+INJECT;r.set('Cache-Control','no-store,no-cache,must-revalidate,proxy-revalidate');r.type('html').send(h)}catch(e){console.error(e);r.status(500).send('No se pudo cargar el juego')}}
app.get('/',game);app.get('/Salva%20a%20cornatan%20%F0%9F%91%88.html',game);app.get('/Salva a cornatan 👈.html',game);app.get('/health',(_q,r)=>r.json({ok:true,online:players.size,host:!!hostId,synchronized:true}));app.use(express.static(__dirname,{maxAge:'1h'}));
io.on('connection',socket=>{
 pending.add(socket.id);
 const p={id:socket.id,session:'',name:'Jugador',x:0,y:0,z:0,rx:0,ry:0,rz:0,hp:100,aura:0,kills:0,round:0,dead:false,moving:false,running:false,jumping:false,flying:false,attacking:false,special:false,attackPhase:0,specialPhase:0,walkCycle:0,pose:{},lastUpdate:Date.now()};
 socket.on('room:join',d=>{
  if(!pending.has(socket.id)&&!players.has(socket.id))return;
  pending.delete(socket.id);
  const session=String(d?.session??'').trim().slice(0,100);
  if(session){const old=sessions.get(session);if(old&&old!==socket.id){const os=io.sockets.sockets.get(old);if(os)os.disconnect(true);players.delete(old)}sessions.set(session,socket.id);p.session=session}
  if(!players.has(socket.id)){players.set(socket.id,p);if(!hostId)hostId=socket.id}
  p.name=clean(d?.name);p.kills=Math.max(0,num(d?.kills));p.round=world?world.round:Math.max(0,num(d?.round));
  socket.emit('room:welcome',{id:socket.id,host:socket.id===hostId,players:pub(),world});broadcast();
 });
 socket.on('player:state',d=>{if(!players.has(socket.id)||!d)return;p.name=clean(d.name||p.name);p.x=num(d.x,p.x);p.y=num(d.y,p.y);p.z=num(d.z,p.z);p.rx=num(d.rx,p.rx);p.ry=num(d.ry,p.ry);p.rz=num(d.rz,p.rz);p.hp=Math.max(0,num(d.hp,p.hp));p.aura=Math.max(0,num(d.aura,p.aura));p.kills=Math.max(0,num(d.kills,p.kills));p.round=world?world.round:Math.max(0,num(d.round,p.round));p.dead=!!d.dead;p.moving=!!d.moving;p.running=!!d.running;p.jumping=!!d.jumping;p.flying=!!d.flying;p.attacking=!!d.attacking;p.special=!!d.special;p.attackPhase=num(d.attackPhase,p.attackPhase);p.specialPhase=num(d.specialPhase,p.specialPhase);p.walkCycle=num(d.walkCycle,p.walkCycle);p.pose=pose(d.pose);p.lastUpdate=Date.now();if(socket.id===hostId&&Array.isArray(d.npcs))setWorld(d)});
 socket.on('player:name',n=>{if(!players.has(socket.id))return;p.name=clean(n);broadcast()});
 socket.on('latency:ping',(sent,ack)=>{if(typeof ack==='function')ack(sent)});
 socket.on('disconnect',()=>{pending.delete(socket.id);if(!players.has(socket.id))return;const was=socket.id===hostId;if(p.session&&sessions.get(p.session)===socket.id)sessions.delete(p.session);players.delete(socket.id);if(was){hostId=players.keys().next().value||null;if(hostId)io.to(hostId).emit('room:host',true)}broadcast()});
});
setInterval(()=>{const now=Date.now();if(now-lastBroadcast<100)return;lastBroadcast=now;broadcast();if(world)io.emit('world:state',world)},25);
server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas multiplayer server ready on '+PORT));
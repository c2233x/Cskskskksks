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
const MAX_PLAYERS=64;
const players=new Map();
const chatHistory=[];
let hostId=null;
let world=null;
const clean=v=>String(v??'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador';
const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const poseClean=p=>{const o={};if(!p||typeof p!=='object')return o;for(const [k,v] of Object.entries(p).slice(0,40))if(Array.isArray(v)&&v.length===3)o[k]=v.map(x=>num(x));return o};
const publicPlayers=()=>[...players.values()];
function broadcast(){const a=publicPlayers();io.emit('room:players',a);io.emit('online:count',a.length)}
function cleanNpc(n){return{id:clean(n?.id).slice(0,64),type:clean(n?.type).slice(0,20),x:num(n?.x),y:num(n?.y),z:num(n?.z),rx:num(n?.rx),ry:num(n?.ry),rz:num(n?.rz),hp:Math.max(0,num(n?.hp)),maxHp:Math.max(1,num(n?.maxHp,1)),scale:Math.max(.05,num(n?.scale,1)),giant:!!n?.giant,walk:num(n?.walk),leap:!!n?.leap}}
function setWorld(d){if(!d||!Array.isArray(d.npcs))return;world={time:Date.now(),round:Math.max(0,Math.floor(num(d.round,d.wave))),npcs:d.npcs.slice(0,300).map(cleanNpc)}}
io.on('connection',s=>{
 if(players.size>=MAX_PLAYERS){s.emit('server:full');return s.disconnect(true)}
 if(!hostId)hostId=s.id;
 const p={id:s.id,name:'Jugador',x:0,y:0,z:0,rx:0,ry:0,rz:0,hp:100,aura:0,kills:0,round:0,dead:false,moving:false,running:false,jumping:false,flying:false,attacking:false,special:false,attackPhase:0,specialPhase:0,walkCycle:0,pose:{},lastUpdate:Date.now()};
 players.set(s.id,p);
 s.emit('room:welcome',{id:s.id,host:s.id===hostId,players:publicPlayers(),world});
 s.emit('chat:history',chatHistory.slice(-50));
 broadcast();
 s.on('room:join',d=>{p.name=clean(d?.name);p.round=num(d?.round);p.kills=num(d?.kills);if(world)p.round=world.round;s.emit('room:welcome',{id:s.id,host:s.id===hostId,players:publicPlayers(),world});s.broadcast.emit('player:joined',{id:s.id,name:p.name});broadcast()});
 s.on('player:state',d=>{if(!d)return;Object.assign(p,{name:clean(d.name||p.name),x:num(d.x,p.x),y:num(d.y,p.y),z:num(d.z,p.z),rx:num(d.rx,p.rx),ry:num(d.ry,p.ry),rz:num(d.rz,p.rz),hp:Math.max(0,num(d.hp,p.hp)),aura:Math.max(0,num(d.aura,p.aura)),kills:Math.max(0,num(d.kills,p.kills)),round:world?world.round:Math.max(0,num(d.round,p.round)),dead:!!d.dead,moving:!!d.moving,running:!!d.running,jumping:!!d.jumping,flying:!!d.flying,attacking:!!d.attacking,special:!!d.special,attackPhase:num(d.attackPhase,p.attackPhase),specialPhase:num(d.specialPhase,p.specialPhase),walkCycle:num(d.walkCycle,p.walkCycle),pose:poseClean(d.pose),lastUpdate:Date.now()});if(s.id===hostId&&Array.isArray(d.npcs))setWorld(d)});
 s.on('player:name',n=>{p.name=clean(n);broadcast()});
 s.on('world:state',d=>{if(s.id!==hostId)return;if(d&&Array.isArray(d.npcs)){setWorld(d);io.emit('world:state',world);io.emit('round:state',{round:world.round,time:world.time})}});
 s.on('chat:message',text=>{const t=String(text??'').replace(/[<>]/g,'').trim().slice(0,120);if(!t)return;const m={id:s.id,name:p.name,text:t,time:Date.now()};chatHistory.push(m);if(chatHistory.length>50)chatHistory.shift();io.emit('chat:message',m)});
 s.on('latency:ping',(_,ack)=>{if(typeof ack==='function')ack(Date.now())});
 s.on('disconnect',reason=>{const wasHost=s.id===hostId;players.delete(s.id);s.broadcast.emit('player:left',{id:s.id,name:p.name,reason});if(wasHost){hostId=players.keys().next().value||null;if(hostId)io.to(hostId).emit('room:host',true)}broadcast()});
});
setInterval(()=>{broadcast();if(world)io.emit('world:state',world)},50);
app.get('/health',(_q,r)=>r.json({ok:true,online:players.size,max:MAX_PLAYERS,host:!!hostId,synchronized:true}));
app.get('/api/online',(_q,r)=>r.json({ok:true,online:players.size,max:MAX_PLAYERS,synchronized:true}));
app.get('/',serveGame);app.get('/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);app.get('/Salva a cornatan 👈.html',serveGame);
app.use(express.static(__dirname,{maxAge:'1h'}));
function serveGame(_q,r){try{const h=fs.readFileSync(GAME_FILE,'utf8');r.set('Cache-Control','no-store,no-cache,must-revalidate,proxy-revalidate');r.type('html').send(h)}catch(e){console.error(e);r.status(500).send('No se pudo cargar el juego')}}
server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas multiplayer server ready on '+PORT));
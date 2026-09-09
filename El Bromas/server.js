const path=require('path');
const http=require('http');
const fs=require('fs');
const express=require('express');
const {Server}=require('socket.io');
const app=express(),server=http.createServer(app);
const io=new Server(server,{cors:{origin:'*',methods:['GET','POST']},transports:['websocket','polling'],pingInterval:10000,pingTimeout:20000});
const PORT=Number(process.env.PORT)||10000;
const GAME_FILE=path.join(__dirname,'Salva a cornatan 👈.html');
const players=new Map();const MAX_PLAYERS=64;let hostId=null;let sharedWorld=null;
const clean=v=>String(v??'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador';
const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const poseClean=p=>{const o={};if(!p||typeof p!=='object')return o;for(const [k,v] of Object.entries(p).slice(0,20))if(Array.isArray(v)&&v.length===3)o[k]=v.map(num);return o};
const snapshot=()=>[...players.values()];
function broadcast(){const a=snapshot();io.emit('world:players',a);io.emit('enhanced:players',a);io.emit('room:players',a);io.emit('online:count',a.length)}
const HOOK=`<script>(function(){var f=window.io;if(!f)return;window.io=function(){var s=f.apply(this,arguments);window.__ebSocket=s;return s}})();</script>`;
const ENHANCED='<script src="/online-sync.js"></script>';
function serveGame(_q,r){try{let h=fs.readFileSync(GAME_FILE,'utf8');h=h.replace('<script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>','<script src="/socket.io/socket.io.js"></script>'+HOOK);h=h.replace('</head>',ENHANCED+'</head>');r.type('html').send(h)}catch(e){r.status(500).send('No se pudo cargar el juego')}} 
app.get('/health',(_q,r)=>r.json({ok:true,online:players.size,max:MAX_PLAYERS,host:!!hostId,synchronized:true}));
app.get('/api/online',(_q,r)=>r.json({ok:true,online:players.size,max:MAX_PLAYERS,synchronized:true}));
app.get('/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);app.get('/Salva a cornatan 👈.html',serveGame);app.get('/',serveGame);
app.use(express.static(__dirname,{maxAge:'1h'}));

function sanitizeNpc(n){
 return {id:clean(n&&n.id).slice(0,64),type:clean(n&&n.type).slice(0,12),x:num(n&&n.x),y:num(n&&n.y),z:num(n&&n.z),rx:num(n&&n.rx),ry:num(n&&n.ry),rz:num(n&&n.rz),hp:Math.max(0,num(n&&n.hp)),maxHp:Math.max(1,num(n&&n.maxHp,1)),scale:Math.max(.05,num(n&&n.scale,1)),giant:!!(n&&n.giant),walk:num(n&&n.walk),leap:!!(n&&n.leap)}
}
function maybeAdoptWorld(clientRound){
 if(!sharedWorld)return;
 const sr=num(sharedWorld.wave,0);
 if(sr>num(clientRound,0))return sharedWorld;
 return sharedWorld;
}
io.on('connection',s=>{
 if(players.size>=MAX_PLAYERS){s.emit('server:full');return s.disconnect(true)}
 if(!hostId)hostId=s.id;
 const p={id:s.id,name:'Jugador',x:0,y:0,z:0,rx:0,ry:0,rz:0,hp:100,aura:0,kills:0,round:0,dead:false,moving:false,running:false,jumping:false,flying:false,attacking:false,special:false,attackPhase:0,specialPhase:0,walkCycle:0,pose:{}};
 players.set(s.id,p);
 s.emit('enhanced:host',{host:s.id===hostId});
 s.emit('world:host',{host:s.id===hostId});
 s.emit('world:players',snapshot());s.emit('enhanced:players',snapshot());s.emit('room:players',snapshot());s.emit('online:count',players.size);
 if(sharedWorld)s.emit('enhanced:world',sharedWorld);

 s.on('room:join',d=>{
   p.name=clean(d&&d.name);p.round=num(d&&d.round);p.kills=num(d&&d.kills);
   if(sharedWorld){s.emit('room:state',sharedWorld);s.emit('world:snapshot',sharedWorld);}
   s.broadcast.emit('player:joined',{id:s.id,name:p.name});
   broadcast();
 });

 s.on('player:hello',d=>{
   p.name=clean(d&&d.name);if(d&&d.round!=null)p.round=num(d.round);if(d&&d.kills!=null)p.kills=num(d.kills);
   s.broadcast.emit('player:joined',{id:s.id,name:p.name});broadcast();
 });

 s.on('player:name',name=>{p.name=clean(name);broadcast()});

 s.on('player:state',d=>{
   if(!d)return;
   p.name=clean(d.name||p.name);p.x=num(d.x,p.x);p.y=num(d.y,p.y);p.z=num(d.z,p.z);
   p.ry=num(d.ry,p.ry);p.rx=num(d.rx,p.rx);p.rz=num(d.rz,p.rz);
   p.hp=num(d.hp,p.hp);p.aura=num(d.aura,p.aura);p.kills=num(d.kills,p.kills);p.round=num(d.round,p.round);
   p.dead=!!d.dead;p.moving=!!d.moving;p.running=!!d.running;p.jumping=!!d.jumping;p.flying=!!d.flying;p.attacking=!!d.attacking;p.special=!!d.special;
   p.attackPhase=num(d.attackPhase,p.attackPhase);p.specialPhase=num(d.specialPhase,p.specialPhase);p.walkCycle=num(d.walkCycle,p.walkCycle);p.pose=poseClean(d.pose);
   // Solo el host publica el estado global de los NPC/ronda.
   if(s.id===hostId && Array.isArray(d.npcs)){
      const incomingRound=Math.floor(num(d.round,0));
      sharedWorld={serverTime:Date.now(),wave:incomingRound,mission:!!d.mission,npcs:d.npcs.slice(0,300).map(sanitizeNpc)};
   }
 });

 s.on('player:update',d=>{
   if(!d)return;
   p.name=clean(d.name||p.name);for(const k of ['x','y','z','rx','ry','rz','hp','aura','kills','round','attackPhase','specialPhase','walkCycle'])if(d[k]!=null)p[k]=num(d[k],p[k]);
   for(const k of ['dead','moving','running','jumping','flying','attacking','special'])if(d[k]!=null)p[k]=!!d[k];
   p.pose=poseClean(d.pose);broadcast();
 });

 s.on('enhanced:update',d=>{
   if(!d)return;p.x=num(d.x,p.x);p.y=num(d.y,p.y);p.z=num(d.z,p.z);p.rx=num(d.rx,p.rx);p.ry=num(d.ry,p.ry);p.rz=num(d.rz,p.rz);
   p.moving=!!d.moving;p.attacking=!!d.attacking;p.attackPhase=num(d.attackPhase);p.walkCycle=num(d.walkCycle);p.pose=poseClean(d.pose)
 });

 s.on('enhanced:combat',d=>{
   if(!d||!['attack','special','mortero','mortero_fire','tubo','tubo_fire','jump'].includes(String(d.action)))return;
   io.emit('enhanced:combat',{id:s.id,action:String(d.action),x:num(d.x),y:num(d.y),z:num(d.z),t:Date.now()});
 });

 s.on('enhanced:world',d=>{
   if(s.id!==hostId||!d||!Array.isArray(d.npcs))return;
   sharedWorld={serverTime:Date.now(),wave:Math.floor(num(d.wave,0)),mission:!!d.mission,npcs:d.npcs.slice(0,300).map(sanitizeNpc)};
 });

 s.on('chat:message',t=>{
   const text=String(t||'').replace(/[<>]/g,'').trim().slice(0,120);
   if(text)io.emit('chat:message',{name:p.name,text})
 });

 s.on('disconnect',()=>{
   players.delete(s.id);s.broadcast.emit('player:left',{id:s.id,name:p.name});
   if(hostId===s.id){
     hostId=[...players.keys()][0]||null;
     if(hostId){io.to(hostId).emit('enhanced:host',{host:true});io.to(hostId).emit('world:host',{host:true})}
   }
   broadcast();
 });
});

setInterval(()=>{broadcast();if(sharedWorld)io.emit('enhanced:world',sharedWorld)},50);
server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas synchronized online server listening on '+PORT));
const path=require('path');const http=require('http');const fs=require('fs');const express=require('express');const {Server}=require('socket.io');
const app=express();const server=http.createServer(app);const io=new Server(server,{cors:{origin:'*'},transports:['websocket','polling'],pingInterval:10000,pingTimeout:20000,maxHttpBufferSize:2e6});
const PORT=Number(process.env.PORT)||10000;const ROOT=__dirname;const GAME=path.join(ROOT,'Salva a cornatan 👈.html');
const players=new Map();let round=0;let host=null;
const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const clean=v=>String(v??'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador';
const cleanChat=v=>String(v??'').replace(/[<>]/g,'').trim().slice(0,120);
const safePose=v=>{const o={};if(!v||typeof v!=='object')return o;for(const [k,a]of Object.entries(v).slice(0,24))if(Array.isArray(a)&&a.length===3)o[k]=a.map(x=>Math.max(-12.57,Math.min(12.57,num(x))));return o};
const pub=()=>[...players.values()].map(p=>({...p}));
function broadcast(){io.emit('room:players',pub());io.emit('online:count',players.size)}
function serveGame(_q,r){try{let h=fs.readFileSync(GAME,'utf8');h=h.replace(/<script[^>]*src=["']\/?socket\.io\/socket\.io\.js[^"']*["'][^>]*><\/script>/gi,'').replace(/<script[^>]*src=["']\/?online-(?:boot|loader|effects|sync|fixes|player-ui|core)\.js[^"']*["'][^>]*><\/script>/gi,'');const add='<script src="/socket.io/socket.io.js"></script><script src="/online-core.js?v=clean2"></script>';h=/<\/body>/i.test(h)?h.replace(/<\/body>/i,add+'</body>'):h+add;r.set('Cache-Control','no-store,no-cache,must-revalidate,proxy-revalidate');r.type('html').send(h)}catch(e){console.error('GAME LOAD ERROR',e);r.status(500).type('text/plain').send('No se pudo cargar el juego')}}
app.get('/',serveGame);app.get('/Salva a cornatan 👈.html',serveGame);app.get('/health',(_q,r)=>r.set('Cache-Control','no-store').json({ok:true,online:players.size,round,host:!!host,architecture:'clean-online-v1'}));
app.use(express.static(ROOT,{maxAge:'1h'}));
io.on('connection',s=>{const p={id:s.id,name:'Jugador',x:0,y:0,z:0,rx:0,ry:0,rz:0,hp:100,aura:0,kills:0,round:0,dead:false,moving:false,running:false,jumping:false,flying:false,attacking:false,special:false,attackPhase:0,specialPhase:0,walkCycle:0,pose:{}};players.set(s.id,p);if(!host)host=s.id;
s.emit('room:welcome',{id:s.id,host:s.id===host,round,players:pub()});broadcast();
s.on('room:join',d=>{p.name=clean(d?.name);const requested=Math.max(0,Math.floor(num(d?.round,0)));if(!round&&requested)round=requested;p.round=round;broadcast();s.emit('round:state',round)});
s.on('player:name',n=>{p.name=clean(n);broadcast()});
s.on('chat:send',text=>{const t=cleanChat(text);if(t)io.emit('chat:message',{id:s.id,name:p.name,text:t})});
s.on('player:state',d=>{if(!players.has(s.id)||!d)return;Object.assign(p,{name:clean(d.name||p.name),x:num(d.x,p.x),y:num(d.y,p.y),z:num(d.z,p.z),rx:num(d.rx,p.rx),ry:num(d.ry,p.ry),rz:num(d.rz,p.rz),hp:Math.max(0,num(d.hp,p.hp)),aura:num(d.aura,p.aura),kills:Math.max(0,num(d.kills,p.kills)),dead:!!d.dead,moving:!!d.moving,running:!!d.running,jumping:!!d.jumping,flying:!!d.flying,attacking:!!d.attacking,special:!!d.special,attackPhase:num(d.attackPhase,p.attackPhase),specialPhase:num(d.specialPhase,p.specialPhase),walkCycle:num(d.walkCycle,p.walkCycle),pose:safePose(d.pose)});if(s.id===host&&d.round!=null){const nr=Math.max(0,Math.floor(num(d.round,round)));if(nr>=round)round=nr}p.round=round;io.emit('room:players',pub())});
s.on('round:set',v=>{if(s.id!==host)return;const n=Math.max(0,Math.floor(num(v,round)));if(n<round)return;round=n;for(const x of players.values())x.round=round;io.emit('round:state',round);broadcast()});
s.on('disconnect',()=>{players.delete(s.id);if(host===s.id)host=players.keys().next().value||null;if(host)io.emit('round:state',round);broadcast()})});
server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas server ready | CLEAN-ONLINE-V1 | '+new Date().toISOString()));
const path=require('path');
const fs=require('fs');
const http=require('http');
const express=require('express');
const {Server}=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:true},transports:['websocket','polling']});
const PORT=Number(process.env.PORT)||10000;
const players=new Map();
const MAX_PLAYERS=64;
const GAME_FILE=path.join(__dirname,'Salva a cornatan 👈.html');
const MP_UI=`<div id="mpOnlineHud" style="position:fixed;left:12px;top:12px;z-index:99999;display:flex;align-items:center;gap:7px;font-family:Arial,sans-serif;pointer-events:auto"><button id="mpOnlineBtn" type="button" style="height:38px;padding:0 14px;border:2px solid #ff3030;border-radius:19px;background:rgba(70,0,0,.86);color:#fff;font-weight:900;font-size:14px;box-shadow:0 0 12px rgba(255,48,48,.35);touch-action:manipulation">ONLINE</button><span id="mpOnlineCount" style="display:none;min-width:38px;text-align:center;padding:7px 9px;border-radius:14px;background:rgba(0,0,0,.78);color:#39ff88;font-weight:900;font-size:13px">0</span><span id="mpPing" style="display:none;min-width:44px;text-align:center;padding:7px 9px;border-radius:14px;background:rgba(0,0,0,.78);color:#fff;font-weight:900;font-size:13px">-- ms</span></div><div id="mpJoinMessage" style="position:fixed;left:12px;top:58px;z-index:99999;display:none;padding:8px 13px;border-radius:10px;background:rgba(0,0,0,.84);border:1px solid #39ff88;color:#fff;font:900 13px Arial,sans-serif;box-shadow:0 0 14px rgba(57,255,136,.28);pointer-events:none"></div>`;
const MP_CORE=`
(function(){
const B=document.getElementById('mpOnlineBtn'),C=document.getElementById('mpOnlineCount'),P=document.getElementById('mpPing'),J=document.getElementById('mpJoinMessage');
let socket=null,enabled=false,sendTimer=null,pingTimer=null;const remotes={};
function off(){if(!B)return;B.textContent='ONLINE';B.style.borderColor='#ff3030';B.style.background='rgba(70,0,0,.86)';C.style.display='none';P.style.display='none'}
function on(){B.textContent='ONLINE ✓';B.style.borderColor='#39ff88';B.style.background='rgba(20,100,55,.9)';C.style.display='inline-block';P.style.display='inline-block'}
function msg(t){if(!J)return;J.textContent=t;J.style.display='block';clearTimeout(J._t);J._t=setTimeout(()=>J.style.display='none',3000)}
function state(){if(!socket||!socket.connected||!character)return;const p=character.position,r=character.rotation;socket.emit('player:update',{name:'Jugador',x:p.x,y:p.y,z:p.z,ry:r.y,hp:Number(playerHealth)||100,aura:Number(playerAura)||0,dead:!!isDead,moving:!!isMoving})}
function draw(list){if(!scene||typeof THREE==='undefined')return;const ids=new Set(list.map(x=>x.id));list.forEach(x=>{if(!socket||x.id===socket.id)return;let o=remotes[x.id];if(!o){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,1.1,10),new THREE.MeshStandardMaterial({color:0x2196f3}));b.position.y=.55;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.3,10,10),new THREE.MeshStandardMaterial({color:0xffcc99}));h.position.y=1.25;g.add(h);scene.add(g);o=remotes[x.id]={g};}o.g.position.set(Number(x.x)||0,Number(x.y)||0,Number(x.z)||0);o.g.rotation.y=Number(x.ry)||0});Object.keys(remotes).forEach(id=>{if(!ids.has(id)){scene.remove(remotes[id].g);delete remotes[id]}})}
function connect(){if(enabled)return;enabled=true;B.textContent='CONECTANDO...';B.style.borderColor='#ffaa00';B.style.background='rgba(100,65,0,.9)';socket=io(location.origin,{transports:['websocket','polling'],reconnection:true,reconnectionAttempts:Infinity,timeout:8000});socket.on('connect',()=>{on();msg('Conectado al servidor');state()});socket.on('connect_error',()=>{B.textContent='REINTENTANDO...' });socket.on('disconnect',()=>{enabled=false;off()});socket.on('server:full',()=>{enabled=false;off();msg('Servidor lleno')});socket.on('online:count',n=>C.textContent=String(n));socket.on('player:joined',x=>{if(x&&x.id!==socket.id)msg((x.name||'Jugador')+' se unió al juego')});socket.on('world:players',draw);socket.on('mp:pong',t=>P.textContent=Math.max(0,Date.now()-Number(t))+' ms');clearInterval(sendTimer);sendTimer=setInterval(state,100);clearInterval(pingTimer);pingTimer=setInterval(()=>{if(socket&&socket.connected)socket.emit('mp:ping',Date.now())},1000)}
if(B)B.addEventListener('click',connect);off();
})();`;
function serveGame(_q,r){let html=fs.readFileSync(GAME_FILE,'utf8');html=html.replace('<body>','<body>'+MP_UI);html=html.replace('</head>','<script src="/socket.io/socket.io.js"></script></head>');const marker='// ============ VARIABLES GLOBALES ============';html=html.replace(marker,marker+'\n'+MP_CORE);r.type('html').send(html)}
app.get('/health',(_q,r)=>r.json({ok:true,online:players.size}));
app.get('/api/online',(_q,r)=>r.json({online:players.size}));
app.get('/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);app.get('/Salva a cornatan 👈.html',serveGame);app.get('/El%20Bromas/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);app.get('/El Bromas/Salva a cornatan 👈.html',serveGame);
app.use(express.static(__dirname,{maxAge:'1h'}));app.get('/',(_q,r)=>r.redirect('/Salva%20a%20cornatan%20%F0%9F%91%88.html'));
io.on('connection',s=>{if(players.size>=MAX_PLAYERS){s.emit('server:full');return s.disconnect(true)}players.set(s.id,{id:s.id,name:'Jugador',x:0,y:0,z:0,ry:0,hp:100,aura:0,dead:false,moving:false});s.broadcast.emit('player:joined',{id:s.id,name:'Jugador'});broadcast();s.on('player:update',d=>{const p=players.get(s.id);if(!p)return;p.x=num(d.x);p.y=num(d.y);p.z=num(d.z);p.ry=num(d.ry);p.hp=num(d.hp,100);p.aura=num(d.aura);p.dead=!!d.dead;p.moving=!!d.moving;p.name=cleanName(d.name)});s.on('mp:ping',t=>s.emit('mp:pong',t));s.on('player:action',d=>{if(d&&d.action)s.broadcast.emit('player:action',{id:s.id,action:String(d.action).slice(0,30)})});s.on('disconnect',()=>{players.delete(s.id);broadcast()})});
function cleanName(v){return String(v||'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador'}function num(v,d=0){const n=Number(v);return Number.isFinite(n)?n:d}function broadcast(){const a=[...players.values()];io.emit('world:players',a);io.emit('online:count',a.length)}
setInterval(broadcast,100);server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas online server listening on '+PORT));

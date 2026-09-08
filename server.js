const path = require('path');
const fs = require('fs');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true }, transports: ['websocket', 'polling'] });
const PORT = Number(process.env.PORT) || 10000;
const players = new Map();
const MAX_PLAYERS = 64;

const GAME_FILE = path.join(__dirname, 'El Bromas', 'Salva a cornatan 👈.html');
const MP_UI = `<div id="mpOnline" style="position:fixed;top:12px;right:12px;z-index:9999;padding:7px 11px;border:1px solid #00ffaa;border-radius:14px;background:#000b;color:#fff;font:800 12px Arial;pointer-events:none">🟢 0 online</div><input id="mpName" maxlength="18" value="Jugador" placeholder="Nombre" style="position:fixed;top:48px;right:12px;z-index:9999;width:125px;padding:7px;border-radius:9px;border:1px solid #00ffaa;background:#000b;color:#fff;font-weight:700">`;
const MP_SCRIPT = `
(function(){
const MP={socket:null,id:null,connected:false,remotes:new Map(),last:0};
const hud=document.getElementById('mpOnline'),nameEl=document.getElementById('mpName');
try{nameEl.value=localStorage.getItem('ElBromasPlayerName')||'Jugador'}catch(_){ }
function setHud(t,off){if(hud){hud.textContent=t;hud.style.borderColor=off?'#f44':'#0fa'}}
function cleanName(){let n=(nameEl.value||'Jugador').replace(/[<>]/g,'').trim().slice(0,18)||'Jugador';nameEl.value=n;try{localStorage.setItem('ElBromasPlayerName',n)}catch(_){ }return n}
function label(t){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.font='bold 26px Arial';x.textAlign='center';x.fillStyle='rgba(0,0,0,.75)';x.fillRect(5,7,246,50);x.fillStyle='#fff';x.fillText(t,128,40);const m=new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthTest:false});const s=new THREE.Sprite(m);s.scale.set(5,1.25,1);s.position.y=5;return s}
function makeRemote(p){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CylinderGeometry(.75,.9,2.4,8),new THREE.MeshLambertMaterial({color:0x168cff}));b.position.y=1.5;g.add(b);const h=new THREE.Mesh(new THREE.SphereGeometry(.82,12,10),new THREE.MeshLambertMaterial({color:0xffb07a}));h.position.y=3.2;g.add(h);g.add(label(p.name||'Jugador'));g.position.set(p.x||0,p.y||0,p.z||0);g.rotation.y=p.ry||0;g.userData={tx:g.position.x,ty:g.position.y,tz:g.position.z,ry:p.ry||0,flash:0};scene.add(g);return g}
function syncPlayers(list){if(typeof scene==='undefined'||!scene)return;const seen=new Set();for(const p of list||[]){if(p.id===MP.id)continue;seen.add(p.id);let g=MP.remotes.get(p.id);if(!g){g=makeRemote(p);MP.remotes.set(p.id,g)}g.userData.tx=p.x;g.userData.ty=p.y;g.userData.tz=p.z;g.userData.ry=p.ry||0}for(const [id,g] of MP.remotes){if(!seen.has(id)){if(g.parent)g.parent.remove(g);MP.remotes.delete(id)}}}
function animateRemote(){for(const g of MP.remotes.values()){g.position.x+=(g.userData.tx-g.position.x)*.3;g.position.y+=(g.userData.ty-g.position.y)*.3;g.position.z+=(g.userData.tz-g.position.z)*.3;let d=g.userData.ry-g.rotation.y;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;g.rotation.y+=d*.3;if(performance.now()<g.userData.flash)g.scale.set(1.12,.9,1.12);else g.scale.lerp(new THREE.Vector3(1,1,1),.2)}}
function send(){if(!MP.connected||!MP.socket||typeof character==='undefined'||!character)return;const now=performance.now();if(now-MP.last<50)return;MP.last=now;MP.socket.emit('player:update',{x:character.position.x,y:character.position.y,z:character.position.z,ry:character.rotation.y,hp:typeof playerHealth==='number'?playerHealth:100,aura:typeof playerAura==='number'?playerAura:0,dead:!!isDead,moving:!!isMoving})}
window.mpEmitAction=function(a){if(MP.connected)MP.socket.emit('player:action',{action:a})};
MP.socket=io({transports:['websocket','polling']});
MP.socket.on('connect',()=>{MP.connected=true;MP.id=MP.socket.id;setHud('🟢 1 online');MP.socket.emit('player:join',{name:cleanName()})});
MP.socket.on('online:count',n=>setHud('🟢 '+n+' online'));
MP.socket.on('world:players',syncPlayers);
MP.socket.on('player:action',p=>{const g=MP.remotes.get(p.id);if(g)g.userData.flash=performance.now()+400});
MP.socket.on('disconnect',()=>{MP.connected=false;setHud('🔴 Desconectado',true)});
MP.socket.on('connect_error',()=>setHud('🔴 Servidor offline',true));
nameEl.addEventListener('change',()=>MP.socket.emit('player:join',{name:cleanName()}));
const oldStartGame=window.startGame;setInterval(()=>{try{animateRemote();send()}catch(_){ }},50);
})();
`;

function cleanName(name){const n=String(name||'Jugador').replace(/[<>]/g,'').replace(/\s+/g,' ').trim().slice(0,18);return n||'Jugador'}
function num(v,f=0){const n=Number(v);return Number.isFinite(n)?Math.max(-100000,Math.min(100000,n)):f}
function snapshot(){return [...players.values()].map(p=>({...p}))}
function broadcast(){io.emit('world:players',snapshot());io.emit('online:count',players.size)}

app.get('/health',(_q,r)=>r.json({ok:true,game:'El Bromas Online',online:players.size}));
app.get('/api/online',(_q,r)=>r.json({online:players.size,maxPlayers:MAX_PLAYERS}));
app.get('/El%20Bromas/Salva%20a%20cornatan%20%F0%9F%91%88.html',(req,res)=>serveGame(res));
app.get('/El Bromas/Salva a cornatan 👈.html',(req,res)=>serveGame(res));
function serveGame(res){try{let html=fs.readFileSync(GAME_FILE,'utf8');html=html.replace('<body>','<body>'+MP_UI);const marker='// ============ VARIABLES GLOBALES ============';if(html.includes(marker)){html=html.replace(marker,MP_SCRIPT+'\n'+marker)}res.type('html').send(html)}catch(e){console.error(e);res.status(500).send('No se pudo cargar El Bromas: '+e.message)}}
app.use(express.static(__dirname,{maxAge:'1h'}));
app.get('/',(_q,r)=>r.redirect('/El%20Bromas/Salva%20a%20cornatan%20%F0%9F%91%88.html'));

io.on('connection',socket=>{
 if(players.size>=MAX_PLAYERS){socket.emit('server:full',{maxPlayers:MAX_PLAYERS});return socket.disconnect(true)}
 players.set(socket.id,{id:socket.id,name:'Jugador',x:0,y:0,z:0,ry:0,hp:100,aura:0,dead:false,moving:false,action:null,actionAt:0});
 socket.emit('welcome',{id:socket.id,maxPlayers:MAX_PLAYERS});broadcast();
 socket.on('player:join',d=>{const p=players.get(socket.id);if(!p)return;p.name=cleanName(d&&d.name);broadcast()});
 socket.on('player:update',d=>{const p=players.get(socket.id);if(!p||!d)return;p.x=num(d.x,p.x);p.y=num(d.y,p.y);p.z=num(d.z,p.z);p.ry=num(d.ry,p.ry);p.hp=Math.max(0,Math.min(100,Math.round(num(d.hp,p.hp))));p.aura=Math.round(num(d.aura,p.aura));p.dead=!!d.dead;p.moving=!!d.moving});
 socket.on('player:stats',d=>{const p=players.get(socket.id);if(!p||!d)return;p.hp=Math.max(0,Math.min(100,Math.round(num(d.hp,p.hp))));p.aura=Math.round(num(d.aura,p.aura));p.dead=!!d.dead});
 socket.on('player:action',d=>{const p=players.get(socket.id);if(!p||!d)return;if(!['attack','special','jump','poop','buff','tubo','mortero'].includes(d.action))return;p.action=d.action;p.actionAt=Date.now();io.emit('player:action',{id:p.id,name:p.name,action:p.action,actionAt:p.actionAt})});
 socket.on('disconnect',()=>{players.delete(socket.id);broadcast()});
});
setInterval(broadcast,50);
server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas Online escuchando en '+PORT));

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
const GAME_FILE = path.join(__dirname, 'Salva a cornatan 👈.html');

const MP_UI = `<div id="mpOnlineHud" style="position:fixed;right:12px;top:12px;z-index:99999;display:flex;align-items:center;gap:7px;font-family:Arial,sans-serif;pointer-events:auto"><button id="mpOnlineBtn" type="button" style="height:38px;padding:0 14px;border:2px solid #ff3030;border-radius:19px;background:rgba(70,0,0,.86);color:#fff;font-weight:900;font-size:14px;box-shadow:0 0 12px rgba(255,48,48,.35);touch-action:manipulation">ONLINE</button><span id="mpOnlineCount" style="display:none;min-width:38px;text-align:center;padding:7px 9px;border-radius:14px;background:rgba(0,0,0,.78);color:#39ff88;font-weight:900;font-size:13px">0</span></div><div id="mpJoinMessage" style="position:fixed;right:12px;top:58px;z-index:99999;display:none;padding:8px 13px;border-radius:10px;background:rgba(0,0,0,.84);border:1px solid #39ff88;color:#fff;font:900 13px Arial,sans-serif;box-shadow:0 0 14px rgba(57,255,136,.28);pointer-events:none"></div>`;

const MP_SCRIPT = `<script src="/socket.io/socket.io.js"></script><script>(function(){if(window.__elBromasOnlineInjected)return;window.__elBromasOnlineInjected=true;function initOnline(){if(typeof io!=='function')return;const btn=document.getElementById('mpOnlineBtn'),count=document.getElementById('mpOnlineCount'),join=document.getElementById('mpJoinMessage');if(!btn)return;let socket=null,enabled=false,joinTimer=null;function setOffline(){btn.textContent='ONLINE';btn.style.borderColor='#ff3030';btn.style.background='rgba(70,0,0,.86)';btn.style.boxShadow='0 0 12px rgba(255,48,48,.35)';count.style.display='none'}function setOnline(){btn.textContent='ONLINE ✓';btn.style.borderColor='#39ff88';btn.style.background='rgba(20,100,55,.9)';btn.style.boxShadow='0 0 12px rgba(57,255,136,.35)';count.style.display='inline-block'}function showJoin(name){join.textContent=(name||'Alguien')+' se unió al juego';join.style.display='block';clearTimeout(joinTimer);joinTimer=setTimeout(function(){join.style.display='none'},3000)}function send(){if(!socket||!socket.connected||!window.character)return;const p=window.character.position,r=window.character.rotation;socket.emit('player:update',{name:'Jugador',x:p.x,y:p.y,z:p.z,ry:r.y,hp:Number(window.playerHealth)||100,aura:Number(window.playerAura)||0,dead:!!window.isDead,moving:!!window.isMoving})}btn.addEventListener('click',function(){if(enabled)return;if(!navigator.onLine){setOffline();return}enabled=true;btn.textContent='CONECTANDO...';btn.style.borderColor='#ffaa00';btn.style.background='rgba(100,65,0,.9)';socket=io({transports:['websocket','polling'],timeout:5000});socket.on('connect',function(){setOnline();send()});socket.on('connect_error',function(){enabled=false;setOffline()});socket.on('disconnect',function(){enabled=false;setOffline()});socket.on('server:full',function(){enabled=false;setOffline();showJoin('Servidor lleno')});socket.on('online:count',function(n){count.textContent=String(n);if(enabled)count.style.display='inline-block'});socket.on('player:joined',function(p){if(p&&p.id!==socket.id)showJoin(p.name)});socket.on('world:players',function(list){if(!window.scene||typeof THREE==='undefined')return;const ids=new Set(list.map(function(p){return p.id}));window.__mpRemote=window.__mpRemote||{};list.forEach(function(p){if(p.id===socket.id)return;let o=window.__mpRemote[p.id];if(!o){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,1.1,10),new THREE.MeshStandardMaterial({color:0x2196f3}));body.position.y=.55;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.3,10,10),new THREE.MeshStandardMaterial({color:0xffcc99}));head.position.y=1.25;g.add(head);window.scene.add(g);o={g:g};window.__mpRemote[p.id]=o}o.g.position.set(Number(p.x)||0,Number(p.y)||0,Number(p.z)||0);o.g.rotation.y=Number(p.ry)||0});Object.keys(window.__mpRemote).forEach(function(id){if(!ids.has(id)){window.scene.remove(window.__mpRemote[id].g);delete window.__mpRemote[id]}})});setInterval(send,50)}window.addEventListener('online',function(){if(!enabled)setOffline()});window.addEventListener('offline',function(){enabled=false;if(socket){socket.disconnect()}setOffline()});setOffline();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initOnline);else initOnline()})();</script>`;

function cleanName(v){return String(v||'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador'}
function num(v,d=0){const x=Number(v);return Number.isFinite(x)?x:d}
function snapshot(){return [...players.values()]}
function broadcast(){const s=snapshot();io.emit('world:players',s);io.emit('online:count',players.size)}
app.get('/health',(_q,r)=>r.json({ok:true,online:players.size}));
app.get('/api/online',(_q,r)=>r.json({online:players.size}));
function serveGame(_q,r){let html=fs.readFileSync(GAME_FILE,'utf8');html=html.replace('<body>','<body>'+MP_UI);const marker='// ============ VARIABLES GLOBALES ============';if(html.includes(marker))html=html.replace(marker,MP_SCRIPT+'\\n'+marker);r.type('html').send(html)}
app.get('/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);
app.get('/Salva a cornatan 👈.html',serveGame);
app.get('/El%20Bromas/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);
app.get('/El Bromas/Salva a cornatan 👈.html',serveGame);
app.use(express.static(__dirname,{maxAge:'1h'}));
app.get('/',(_q,r)=>r.redirect('/Salva%20a%20cornatan%20%F0%9F%91%88.html'));
io.on('connection',socket=>{if(players.size>=MAX_PLAYERS){socket.emit('server:full');socket.disconnect(true);return}players.set(socket.id,{id:socket.id,name:'Jugador',x:0,y:0,z:0,ry:0,hp:100,aura:0,dead:false,moving:false});socket.broadcast.emit('player:joined',{id:socket.id,name:'Jugador'});broadcast();socket.on('player:update',d=>{const p=players.get(socket.id);if(!p)return;p.name=cleanName(d.name);p.x=num(d.x);p.y=num(d.y);p.z=num(d.z);p.ry=num(d.ry);p.hp=num(d.hp,100);p.aura=num(d.aura);p.dead=!!d.dead;p.moving=!!d.moving});socket.on('player:action',d=>{if(!d||!d.action)return;socket.broadcast.emit('player:action',{id:socket.id,action:String(d.action).slice(0,30)})});socket.on('disconnect',()=>{players.delete(socket.id);broadcast()});});
setInterval(broadcast,50);
server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas online server listening on '+PORT));

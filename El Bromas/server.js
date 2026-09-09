const path=require('path');
const fs=require('fs');
const http=require('http');
const express=require('express');
const {Server}=require('socket.io');
const app=express();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:'*',methods:['GET','POST']},transports:['websocket','polling'],pingInterval:25000,pingTimeout:20000});
const PORT=Number(process.env.PORT)||10000;
const GAME_FILE=path.join(__dirname,'Salva a cornatan 👈.html');
const players=new Map();
const MAX_PLAYERS=64;
const clean=v=>String(v??'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador';
const num=(v,d=0)=>{const n=Number(v);return Number.isFinite(n)?n:d};
const snapshot=()=>[...players.values()];
function broadcast(){const a=snapshot();io.emit('world:players',a);io.emit('online:count',a.length)}
const ONLINE_UI=`<style id="elBromasOnlineStyle">
#mpOnlineHud{display:none!important}
#ebOnlineHud{position:fixed;left:12px;top:12px;z-index:99999;font-family:Arial,sans-serif;display:flex;align-items:center;gap:7px}
#ebOnlineBtn{width:52px;height:52px;border:2px solid #fff;border-radius:50%;background:rgba(0,0,0,.85);color:#fff;font-size:27px;box-shadow:0 0 14px rgba(0,0,0,.6);touch-action:manipulation}
#ebOnlineBtn.connected{border-color:#39ff88;box-shadow:0 0 18px rgba(57,255,136,.55)}
#ebOnlineBtn.wait{border-color:#ffd23f}#ebOnlineBtn.err{border-color:#ff3030}
#ebOnlineCount{display:none;padding:7px 9px;border-radius:14px;background:rgba(0,0,0,.85);color:#39ff88;font-weight:900;font-size:13px}
#ebJoin{position:fixed;left:50%;top:70px;transform:translateX(-50%);z-index:100000;display:none;padding:9px 15px;border-radius:10px;background:rgba(0,0,0,.92);border:1px solid #39ff88;color:#fff;font:900 13px Arial;text-align:center;max-width:90vw}
#ebNameModal{position:fixed;inset:0;z-index:100001;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.72);font-family:Arial,sans-serif}
#ebNameBox{width:min(330px,86vw);padding:22px;border:2px solid #39ff88;border-radius:18px;background:#05080f;text-align:center}
#ebNameInput{width:100%;padding:12px;border:2px solid #555;border-radius:10px;background:#111;color:#fff;font-size:17px}
#ebNameGo{margin-top:12px;width:100%;padding:12px;border:0;border-radius:10px;background:#39ff88;font-weight:900}
#ebChat{position:fixed;left:50%;bottom:15px;transform:translateX(-50%);width:min(430px,88vw);z-index:99999;display:none;font-family:Arial,sans-serif}
#ebChatHead{display:flex;align-items:center;justify-content:center;gap:8px}#ebChatToggle{width:34px;height:28px;border:1px solid #777;border-radius:9px;background:rgba(0,0,0,.8);color:#fff;font-weight:900}
#ebChatLast{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:7px 10px;border-radius:10px;background:rgba(0,0,0,.78);color:#fff;font-size:12px;text-align:center}
#ebChatPanel{display:none;margin-top:5px;background:rgba(0,0,0,.88);border-radius:12px;padding:7px}#ebChatLog{height:125px;overflow-y:auto;color:#fff;font-size:12px;line-height:1.35}
#ebChatForm{display:flex;margin-top:5px}#ebChatInput{flex:1;border:0;border-radius:8px;padding:8px}#ebChatSend{margin-left:5px;border:0;border-radius:8px;padding:0 11px;background:#39ff88;font-weight:900}
</style><div id="ebOnlineHud"><button id="ebOnlineBtn" type="button" aria-label="Jugar online">🌐</button><span id="ebOnlineCount">0</span></div>
<div id="ebJoin"></div><div id="ebNameModal"><form id="ebNameBox"><div style="font-size:24px;font-weight:900;color:#fff;margin-bottom:15px">Nombre</div><input id="ebNameInput" maxlength="20" autocomplete="nickname" placeholder="Tu nombre"><button id="ebNameGo" type="submit">Jugar online</button></form></div>
<div id="ebChat"><div id="ebChatHead"><button id="ebChatToggle" type="button">⌃</button><div id="ebChatLast">Sin mensajes</div></div><div id="ebChatPanel"><div id="ebChatLog"></div><form id="ebChatForm"><input id="ebChatInput" maxlength="120" autocomplete="off" placeholder="Escribe un mensaje..."><button id="ebChatSend" type="submit">➤</button></form></div></div>`;
const ONLINE_JS=`(function(){const $=id=>document.getElementById(id),btn=$('ebOnlineBtn'),count=$('ebOnlineCount'),join=$('ebJoin'),modal=$('ebNameModal'),form=$('ebNameBox'),input=$('ebNameInput'),chat=$('ebChat'),toggle=$('ebChatToggle'),panel=$('ebChatPanel'),last=$('ebChatLast'),log=$('ebChatLog');let socket=null,nick='';const remotes={};try{nick=(localStorage.getItem('elBromasNick')||'').trim().slice(0,20)}catch(e){}
const say=t=>{join.textContent=t;join.style.display='block';clearTimeout(join._t);join._t=setTimeout(()=>join.style.display='none',3000)};
function state(){if(!socket||!socket.connected||!window.character)return;const p=window.character.position||{},r=window.character.rotation||{};socket.emit('player:update',{name:nick,x:Number(p.x)||0,y:Number(p.y)||0,z:Number(p.z)||0,ry:Number(r.y)||0,hp:Number(window.playerHealth)||100,aura:Number(window.playerAura)||0,dead:!!window.isDead,moving:!!window.isMoving})}
function addChat(n,t){const d=document.createElement('div');d.innerHTML='<b>'+String(n||'').replace(/[<>]/g,'')+':</b> '+String(t||'').replace(/[<>]/g,'');log.appendChild(d);log.scrollTop=log.scrollHeight;last.textContent=(n?n+': ':'')+t}
function removeRemote(id){const o=remotes[id];if(!o)return;try{window.scene&&scene.remove(o.g)}catch(e){}try{o.w.remove()}catch(e){}delete remotes[id]}
function makeRemote(){if(!window.THREE||!window.scene)return null;const g=new THREE.Group(),m=new THREE.Mesh(new THREE.BoxGeometry(.7,1.4,.5),new THREE.MeshStandardMaterial({color:0x2196f3}));m.position.y=.7;g.add(m);scene.add(g);const w=document.createElement('div');w.style.cssText='position:fixed;transform:translate(-50%,-100%);color:#fff;font:bold 12px Arial;text-shadow:0 2px 4px #000;pointer-events:none;text-align:center;z-index:99998';w.innerHTML='<span></span><div style="width:70px;height:6px;background:#300;border:1px solid #000;border-radius:4px;overflow:hidden"><i style="display:block;width:100%;height:100%;background:#39ff66"></i></div>';document.body.appendChild(w);return{g,w}}
function draw(a){if(!Array.isArray(a))return;const ids=new Set(a.map(x=>x.id));a.forEach(x=>{if(!socket||x.id===socket.id)return;let o=remotes[x.id];if(!o)o=remotes[x.id]=makeRemote();if(!o)return;o.g.position.set(Number(x.x)||0,Number(x.y)||0,Number(x.z)||0);o.g.rotation.y=Number(x.ry)||0;o.w.firstChild.textContent=x.name||'Jugador';o.w.lastChild.firstChild.style.width=Math.max(0,Math.min(100,Number(x.hp)||100))+'%';if(window.camera){const v=o.g.position.clone();v.y+=2.2;v.project(camera);o.w.style.left=((v.x+1)/2*innerWidth)+'px';o.w.style.top=((1-v.y)/2*innerHeight)+'px';o.w.style.display=x.dead?'none':'block'}});Object.keys(remotes).forEach(id=>{if(!ids.has(id))removeRemote(id)})}
function startGameIfNeeded(){try{if(typeof gameStarted!=='undefined'&&!gameStarted&&typeof playWithoutDownload==='function')playWithoutDownload()}catch(e){}}
function connect(){if(!window.io){btn.className='err';say('Error: Socket.IO no cargó');return}nick=(nick||'Jugador').slice(0,20);btn.className='wait';btn.textContent='⏳';try{socket=window.io(window.location.origin,{path:'/socket.io',transports:['websocket','polling'],reconnection:true,reconnectionAttempts:Infinity,reconnectionDelay:500,reconnectionDelayMax:5000,timeout:10000})}catch(e){btn.className='err';btn.textContent='🌐';say('No se pudo iniciar online');return}
socket.on('connect',()=>{btn.textContent='🌐';btn.className='connected';count.style.display='inline-block';chat.style.display='block';socket.emit('player:hello',{name:nick});say('¡Te has unido al juego online, '+nick+'!');state()});socket.on('connect_error',e=>{btn.textContent='🌐';btn.className='err';say('Error online: '+(e&&e.message||'conexión rechazada'))});socket.on('server:full',()=>{say('El servidor está lleno');socket.disconnect()});socket.on('disconnect',()=>{btn.textContent='🌐';btn.className='';count.style.display='none';chat.style.display='none';panel.style.display='none';Object.keys(remotes).forEach(removeRemote)});socket.on('online:count',n=>count.textContent=String(n));socket.on('world:players',draw);socket.on('player:joined',x=>{if(x&&x.id!==socket.id){say((x.name||'Jugador')+' se unió al juego');addChat('SISTEMA',(x.name||'Jugador')+' se unió al juego')}});socket.on('player:left',x=>{if(x){removeRemote(x.id);addChat('SISTEMA',(x.name||'Jugador')+' salió del juego')}});socket.on('chat:message',x=>{if(x)addChat(x.name,x.text)});clearInterval(window._ebStateTimer);window._ebStateTimer=setInterval(state,150)}
function disconnect(){if(socket){socket.disconnect();socket=null}say('Has salido del juego online')}
btn.onclick=()=>{startGameIfNeeded();if(socket&&socket.connected){disconnect();return}if(!nick){modal.style.display='flex';input.value='';setTimeout(()=>input.focus(),60)}else setTimeout(connect,300)};
form.onsubmit=e=>{e.preventDefault();const n=input.value.trim().slice(0,20);if(!n)return;nick=n;try{localStorage.setItem('elBromasNick',nick)}catch(e){}modal.style.display='none';startGameIfNeeded();setTimeout(connect,300)};
toggle.onclick=()=>{const open=panel.style.display==='block';panel.style.display=open?'none':'block';toggle.textContent=open?'⌃':'⌄'};$('ebChatForm').onsubmit=e=>{e.preventDefault();const t=$('ebChatInput').value.trim();if(t&&socket&&socket.connected){socket.emit('chat:message',t);$('ebChatInput').value=''}};
})();`;
function serveGame(_q,r){try{let html=fs.readFileSync(GAME_FILE,'utf8');html=html.replace('</head>',ONLINE_UI+'<script src="/socket.io/socket.io.js"></script></head>');html=html.replace('</body>','<script>'+ONLINE_JS+'</script></body>');r.type('html').send(html)}catch(e){r.status(500).type('text').send('No se pudo cargar el juego: '+e.message)}}
app.get('/health',(_q,r)=>r.json({ok:true,online:players.size,port:PORT,socketio:true}));
app.get('/api/online',(_q,r)=>r.json({ok:true,online:players.size,max:MAX_PLAYERS}));
app.get('/api/assets',(_q,r)=>r.json({ok:true,files:[]}));
app.get('/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);app.get('/Salva a cornatan 👈.html',serveGame);app.get('/El%20Bromas/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);app.get('/El Bromas/Salva a cornatan 👈.html',serveGame);app.use(express.static(__dirname,{maxAge:'1h'}));app.get('/',(_q,r)=>r.redirect('/Salva%20a%20cornatan%20%F0%9F%91%88.html'));
io.on('connection',s=>{if(players.size>=MAX_PLAYERS){s.emit('server:full');return s.disconnect(true)}const p={id:s.id,name:'Jugador',x:0,y:0,z:0,ry:0,hp:100,aura:0,dead:false,moving:false};players.set(s.id,p);s.emit('world:players',snapshot());s.emit('online:count',players.size);s.on('player:hello',d=>{p.name=clean(d&&d.name);s.broadcast.emit('player:joined',{id:s.id,name:p.name});broadcast()});s.on('player:update',d=>{p.x=num(d&&d.x);p.y=num(d&&d.y);p.z=num(d&&d.z);p.ry=num(d&&d.ry);p.hp=num(d&&d.hp,100);p.aura=num(d&&d.aura);p.dead=!!(d&&d.dead);p.moving=!!(d&&d.moving);if(d&&d.name)p.name=clean(d.name)});s.on('chat:message',t=>{const text=String(t||'').trim().slice(0,120);if(text)io.emit('chat:message',{name:p.name,text})});s.on('disconnect',()=>{players.delete(s.id);s.broadcast.emit('player:left',{id:s.id,name:p.name});broadcast()})});
setInterval(broadcast,100);server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas online server listening on '+PORT));
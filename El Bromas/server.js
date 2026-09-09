const path=require('path'),fs=require('fs'),http=require('http'),express=require('express');
const {Server}=require('socket.io');
const app=express(),server=http.createServer(app),io=new Server(server,{cors:{origin:true},transports:['websocket','polling']});
const PORT=Number(process.env.PORT)||10000,players=new Map(),MAX_PLAYERS=64,GAME_FILE=path.join(__dirname,'Salva a cornatan 👈.html');

function clean(v){return String(v||'Jugador').replace(/[<>]/g,'').trim().slice(0,20)||'Jugador'}
function num(v,d=0){let n=Number(v);return Number.isFinite(n)?n:d}
function broadcast(){const a=[...players.values()];io.emit('world:players',a);io.emit('online:count',a.length)}

function walkFiles(dir,base='',out=[]){
  for(const name of fs.readdirSync(dir,{withFileTypes:true})){
    if(name.name==='node_modules'||name.name.startsWith('.')) continue;
    const full=path.join(dir,name.name),rel=base?path.join(base,name.name):name.name;
    if(name.isDirectory()) walkFiles(full,rel,out);
    else if(name.isFile()){
      const st=fs.statSync(full);
      out.push({path:`El Bromas/${rel}`.replace(/\\/g,'/'),size:st.size,url:'/'+rel.split(path.sep).map(encodeURIComponent).join('/')});
    }
  }
  return out;
}

function serveGame(_q,r){r.sendFile(GAME_FILE)}
app.get('/health',(_q,r)=>r.json({ok:true,online:players.size}));
app.get('/api/online',(_q,r)=>r.json({online:players.size}));
app.get('/api/assets',(_q,r)=>{try{r.json({ok:true,files:walkFiles(__dirname)})}catch(e){r.status(500).json({ok:false,error:String(e&&e.message||e)})}});
app.get('/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);
app.get('/Salva a cornatan 👈.html',serveGame);
app.get('/El%20Bromas/Salva%20a%20cornatan%20%F0%9F%91%88.html',serveGame);
app.get('/El Bromas/Salva a cornatan 👈.html',serveGame);
app.use(express.static(__dirname,{maxAge:'1h'}));
app.get('/',(_q,r)=>r.redirect('/Salva%20a%20cornatan%20%F0%9F%91%88.html'));

io.on('connection',s=>{
  if(players.size>=MAX_PLAYERS){s.emit('server:full');return s.disconnect(true)}
  players.set(s.id,{id:s.id,name:'Jugador',x:0,y:0,z:0,ry:0,hp:100,aura:0,dead:false,moving:false});
  s.on('player:hello',d=>{const p=players.get(s.id);if(!p)return;p.name=clean(d&&d.name);s.broadcast.emit('player:joined',{id:s.id,name:p.name});broadcast()});
  s.on('player:update',d=>{const p=players.get(s.id);if(!p)return;p.x=num(d.x);p.y=num(d.y);p.z=num(d.z);p.ry=num(d.ry);p.hp=num(d.hp,100);p.aura=num(d.aura);p.dead=!!d.dead;p.moving=!!d.moving;if(d.name)p.name=clean(d.name)});
  s.on('chat:message',t=>{const p=players.get(s.id),text=String(t||'').trim().slice(0,120);if(p&&text)io.emit('chat:message',{name:p.name,text})});
  s.on('disconnect',()=>{const p=players.get(s.id);players.delete(s.id);if(p)s.broadcast.emit('player:left',{id:s.id,name:p.name});broadcast()});
});
setInterval(broadcast,100);
server.listen(PORT,'0.0.0.0',()=>console.log('El Bromas online server listening on '+PORT));
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: false },
  transports: ['websocket', 'polling']
});

const PORT = Number(process.env.PORT) || 10000;
const players = new Map();
const MAX_PLAYERS = 64;

app.get('/health', (_req, res) => {
  res.json({ ok: true, game: 'El Bromas Online', online: players.size });
});
app.get('/api/online', (_req, res) => {
  res.json({ online: players.size, maxPlayers: MAX_PLAYERS });
});

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
  maxAge: '1h'
}));

function cleanName(name) {
  const n = String(name || 'Jugador')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 18);
  return n || 'Jugador';
}

function cleanNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(-100000, Math.min(100000, n)) : fallback;
}

function snapshot() {
  return Array.from(players.values()).map(p => ({
    id: p.id,
    name: p.name,
    x: p.x, y: p.y, z: p.z, ry: p.ry,
    hp: p.hp, aura: p.aura, dead: p.dead, moving: p.moving,
    action: p.action, actionAt: p.actionAt
  }));
}

function broadcastWorld() {
  const data = snapshot();
  io.emit('world:players', data);
  io.emit('online:count', players.size);
}

io.on('connection', socket => {
  if (players.size >= MAX_PLAYERS) {
    socket.emit('server:full', { maxPlayers: MAX_PLAYERS });
    socket.disconnect(true);
    return;
  }

  const player = {
    id: socket.id,
    name: 'Jugador',
    x: 0, y: 0, z: 0, ry: 0,
    hp: 100, aura: 0, dead: false, moving: false,
    action: null, actionAt: 0,
    lastUpdate: Date.now()
  };
  players.set(socket.id, player);

  socket.emit('welcome', { id: socket.id, maxPlayers: MAX_PLAYERS });
  broadcastWorld();

  socket.on('player:join', data => {
    const p = players.get(socket.id);
    if (!p) return;
    p.name = cleanName(data && data.name);
    p.lastUpdate = Date.now();
    broadcastWorld();
  });

  socket.on('player:update', data => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    p.x = cleanNumber(data.x, p.x);
    p.y = cleanNumber(data.y, p.y);
    p.z = cleanNumber(data.z, p.z);
    p.ry = cleanNumber(data.ry, p.ry);
    p.hp = Math.max(0, Math.min(100, Math.round(cleanNumber(data.hp, p.hp))));
    p.aura = Math.max(-100000, Math.min(100000, Math.round(cleanNumber(data.aura, p.aura))));
    p.dead = !!data.dead;
    p.moving = !!data.moving;
    p.lastUpdate = Date.now();
  });

  socket.on('player:stats', data => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    p.hp = Math.max(0, Math.min(100, Math.round(cleanNumber(data.hp, p.hp))));
    p.aura = Math.max(-100000, Math.min(100000, Math.round(cleanNumber(data.aura, p.aura))));
    p.dead = !!data.dead;
  });

  socket.on('player:action', data => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    const allowed = new Set(['attack','special','jump','poop','buff','tubo','mortero']);
    if (!allowed.has(data.action)) return;
    p.action = data.action;
    p.actionAt = Date.now();
    io.emit('player:action', { id: p.id, name: p.name, action: p.action, actionAt: p.actionAt });
  });

  socket.on('disconnect', () => {
    players.delete(socket.id);
    broadcastWorld();
  });
});

// 20 snapshots/sec: enough for smooth remote interpolation without flooding mobile clients.
setInterval(broadcastWorld, 50);

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`El Bromas Online server listening on ${PORT}`);
});

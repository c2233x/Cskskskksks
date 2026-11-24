// Cuida a Benja - datos del mapa de la ciudad principal.
// Comparte el motor, personaje, dinero, coches y combate de la granja.
window.CUIDA_BENJA_CITY_MAP = {
  id: "ciudad",
  title: "Ciudad principal",
  spawn: { x: 0, z: 0 },
  jobBoard: { x: 38, z: -22 },
  returnGate: { x: -132, z: -330 },
  jobs: [
    { id: "delivery", title: "REPARTIDOR", detail: "lleva un paquete al barrio norte", target: { x: 125, z: -65 }, reward: 24, icon: "📦" },
    { id: "taxi", title: "SERVICIO DE TAXI", detail: "recoge al cliente en la avenida", target: { x: -105, z: 72 }, reward: 30, icon: "🚕" },
    { id: "mechanic", title: "AYUDANTE DE TALLER", detail: "entrega herramientas al taller", target: { x: 155, z: 95 }, reward: 28, icon: "🔧" },
    { id: "park", title: "MANTENIMIENTO DEL PARQUE", detail: "lleva bolsas al parque", target: { x: -155, z: -115 }, reward: 18, icon: "🌳" },
    { id: "market", title: "ENCARGO DEL MERCADO", detail: "recoge suministros en el mercado", target: { x: 90, z: 165 }, reward: 22, icon: "🛒" },
    { id: "lights", title: "REPARAR ALUMBRADO", detail: "revisa las farolas de la avenida", target: { x: -35, z: -175 }, reward: 26, icon: "💡" },
    { id: "courier", title: "MENSAJERO", detail: "entrega documentos en la oficina", target: { x: -190, z: 35 }, reward: 32, icon: "✉️" },
    { id: "clean", title: "LIMPIEZA DE CALLES", detail: "lleva el equipo a la plaza", target: { x: 195, z: -150 }, reward: 20, icon: "🧹" }
  ],
  waves: { first: 1, max: 18, initialCount: 5, addPerWave: 2, rewardPerInvader: 1 },
  vehiclesRemainEnabled: true
};

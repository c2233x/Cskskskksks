// Cuida a Benja - datos del mapa de la granja.
// El motor 3D compartido lee este objeto; aqui solo van puntos y datos de mapa.
window.CUIDA_BENJA_FARM_MAP = {
  id: "granja",
  title: "La granja de Benja",
  center: { x: -330, z: -330 },
  flatRadius: 245,
  tv: { x: -414, z: -365 },
  ambientZones: [
    { id: "huerto", x: -220, z: -250, radius: 62, insects: true },
    { id: "arboleda", x: -266, z: -284, radius: 58, insects: true },
    { id: "pozo", x: -390, z: -440, radius: 48, insects: false }
  ],
  pig: { x: -286, z: -354 },
  work: { x: -388, z: -302 },
  shop: { x: -258, z: -302 },
  warehouse: { x: -362, z: -220 },
  crops: { x: -220, z: -250 },
  coop: { x: -240, z: -340 },
  delivery: { x: -218, z: -435 },
  well: { x: -390, z: -440 },
  tractor: { x: -448, z: -286 },
  repair: { x: -286, z: -354 },
  cityExitRadius: 235,
  cityGate: { x: -135, z: -330 },
  maxBenjaWeight: 100,
  saveWeightGoal: 52,
  goods: {
    maiz: { label: "Maiz", price: 8, color: 0xe3b949, food: true, icon: "🌽" },
    trigo: { label: "Trigo", price: 7, color: 0xd8c27c, food: true, icon: "🌾" },
    zanahoria: { label: "Zanahorias", price: 10, color: 0xe77a37, food: true, icon: "🥕" },
    heno: { label: "Heno", price: 6, color: 0xc4a24c, food: true, icon: "🌿" },
    pienso: { label: "Pienso", price: 12, color: 0x8c7049, food: true, icon: "🫘" },
    huevos: { label: "Huevos", price: 5, color: 0xf2e8cb, food: false, icon: "🥚" },
    agua: { label: "Agua", price: 0, color: 0x5aa8d7, food: false, icon: "🛢️" },
    madera: { label: "Madera", price: 0, color: 0x805536, food: false, icon: "🪵" }
  },
  missionOrder: ["harvest", "eggs", "delivery", "repair", "water", "tractor", "feed", "warehouse"],
  missions: {
    harvest: { title: "COSECHA EL CAMPO", target: "crops", label: "ve al cultivo", progress: "recoge verduras para el pedido", icon: "🥕" },
    eggs: { title: "RECOGE LOS HUEVOS", target: "coop", label: "ve al gallinero", progress: "revisa los nidos y recoge los huevos", icon: "🥚" },
    delivery: { title: "ENTREGA A LA CASA VECINA", target: "delivery", label: "lleva el pedido a la casa", progress: "entrega 2 verduras y 1 huevo", icon: "📦" },
    repair: { title: "REFUERZA EL CORRAL", target: "repair", label: "ve al corral", progress: "usa 2 maderas para reforzar la defensa", icon: "🪵" },
    water: { title: "LLENA EL BEBEDERO", target: "well", label: "ve al pozo", progress: "recoge agua limpia para la granja", icon: "💧" },
    tractor: { title: "PON EL TRACTOR A PUNTO", target: "tractor", label: "ve al tractor", progress: "revisa el tractor y prepara heno", icon: "🚜" },
    feed: { title: "CUIDA A BENJA", target: "pig", label: "vuelve con benja", progress: "lanzale comida a benja cuando tenga hambre", icon: "🐷" },
    warehouse: { title: "ORDENA EL ALMACEN", target: "warehouse", label: "ve al almacen", progress: "guarda en el almacen todo lo que llevas", icon: "🏠" }
  },
  // En esta zona no hay NPC de construccion ni trabajadores automáticos.
  ambientWorkers: 0,
  nightInvaders: { min: 4, max: 6, rewardPerTwo: 5 }
};

window.CUIDA_BENJA_FARM_MAP.buildWorld = function(engine) {
  if (!engine || typeof engine.createFarmWorld !== "function") {
    throw new Error("No está disponible el motor del mapa de granja");
  }
  engine.createFarmWorld();
  if (typeof engine.updateFarmCarryVisual === "function") {
    engine.updateFarmCarryVisual(true);
  }
};
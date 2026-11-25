// Cuida a Benja - datos del mapa de la granja.
// El motor 3D compartido lee este objeto; aqui solo van puntos y datos de mapa.
window.CUIDA_BENJA_FARM_MAP = {
  id: "granja",
  title: "La granja de Benja",
  center: { x: -330, z: -330 },
  flatRadius: 245,
  tv: { x: -414, z: -365 },
  radio: { x: -400, z: -356 },
  waterStorage: { x: -435, z: -470 },
  ponds: [
    { id: "laguna-grande", x: -270, z: -242, radius: 22, depth: 0.9 },
    { id: "laguna-pequena", x: -465, z: -255, radius: 13, depth: 0.55 }
  ],
  ambientZones: [
    { id: "patio-central", x: -354, z: -322, radius: 128, insects: true },
    { id: "pocilga-benja", x: -286, z: -354, radius: 108, insects: true },
    { id: "huerto", x: -220, z: -250, radius: 98, insects: true },
    { id: "arboleda", x: -266, z: -284, radius: 104, insects: true },
    { id: "camino-tractor", x: -370, z: -312, radius: 110, insects: true },
    { id: "sendero-norte", x: -320, z: -242, radius: 94, insects: true },
    { id: "pozo-y-agua", x: -410, z: -450, radius: 92, insects: true }
  ],
  pig: { x: -286, z: -354 },
  work: { x: -388, z: -302 },
  shop: { x: -258, z: -302 },
  warehouse: { x: -362, z: -220 },
  crops: { x: -220, z: -250 },
  coop: { x: -240, z: -340 },
  delivery: { x: -218, z: -435 },
  well: { x: -390, z: -440 },
  tractor: { x: -380, z: -330 },
  repair: { x: -286, z: -354 },
  fruitTrees: { x: -266, z: -284 },
  cityExitRadius: 235,
  cityGate: { x: -135, z: -330 },
  maxBenjaWeight: 100,
  saveWeightGoal: 52,
  goods: {
    maiz: { label: "Maíz", price: 8, color: 0xe3b949, food: true, icon: "🌽", buyable: true },
    trigo: { label: "Trigo", price: 7, color: 0xd8c27c, food: true, icon: "🌾", buyable: true },
    zanahoria: { label: "Zanahorias", price: 10, color: 0xe77a37, food: true, icon: "🥕", buyable: true },
    heno: { label: "Heno", price: 6, color: 0xc4a24c, food: true, icon: "🌿", buyable: true },
    pienso: { label: "Pienso", price: 12, color: 0x8c7049, food: true, icon: "🫘", buyable: true },
    huevos: { label: "Huevos", price: 5, color: 0xf2e8cb, food: false, icon: "🥚", buyable: false },
    agua: { label: "Agua", price: 0, color: 0x5aa8d7, food: false, icon: "💧", buyable: false },
    madera: { label: "Madera", price: 9, color: 0x805536, food: false, icon: "🪵", buyable: true },
    balde: { label: "Balde resistente", price: 18, color: 0x7f9aa7, food: false, icon: "🪣", buyable: true, model: "bucket" },
    antorcha: { label: "Antorcha", price: 22, color: 0xd78332, food: false, icon: "🔥", buyable: true, buildable: true, model: "torch" },
    muro_madera: { label: "Muro de madera", price: 28, color: 0x8f633b, food: false, icon: "🪵", buyable: true, buildable: true, model: "wood-wall" },
    muro_ladrillo: { label: "Muro de ladrillo", price: 42, color: 0x9a5542, food: false, icon: "🧱", buyable: true, buildable: true, model: "brick-wall" },
    puerta: { label: "Puerta de madera", price: 32, color: 0x754727, food: false, icon: "🚪", buyable: true, buildable: true, model: "door" },
    ventana: { label: "Ventana con cristal", price: 24, color: 0x8bc8dc, food: false, icon: "🪟", buyable: true, buildable: true, model: "window" },
    techo: { label: "Panel de tejado", price: 30, color: 0x765044, food: false, icon: "🏠", buyable: true, buildable: true, model: "roof" },
    manzanas: { label: "Manzanas", price: 0, color: 0xc83c36, food: true, icon: "🍎", buyable: false },
  },
  missionOrder: ["meetBenja", "harvest", "eggs", "delivery", "orchard", "repair", "water", "tractor", "feed", "warehouse"],
  missions: {
    meetBenja: { title: "ACERCATE A BENJA", target: "pig", label: "acercate a benja", progress: "acercate al cerdito para conocerlo", icon: "🐷" },
    harvest: { title: "COSECHA EL CAMPO", target: "crops", label: "ve al cultivo", progress: "recoge verduras para el pedido", icon: "🥕" },
    eggs: { title: "RECOGE LOS HUEVOS", target: "coop", label: "ve al gallinero", progress: "revisa los nidos y recoge los huevos", icon: "🥚" },
    delivery: { title: "ENTREGA A LA CASA VECINA", target: "delivery", label: "lleva el pedido a la casa", progress: "entrega 2 verduras y 1 huevo", icon: "📦" },
    orchard: { title: "COSECHA MANZANAS", target: "fruitTrees", label: "ve al huerto", progress: "recoge manzanas para Benja", icon: "🍎" },
    repair: { title: "REFUERZA EL CORRAL", target: "repair", label: "ve al corral", progress: "usa 2 maderas para reforzar la defensa", icon: "🪵" },
    water: { title: "LLENA EL BEBEDERO", target: "well", label: "ve al pozo", progress: "recoge agua limpia para la granja", icon: "💧" },
    tractor: { title: "PON EL TRACTOR A PUNTO", target: "tractor", label: "ve al tractor", progress: "revisa el tractor y prepara heno", icon: "🚜" },
    feed: { title: "CUIDA A BENJA", target: "pig", label: "vuelve con benja", progress: "lanzale comida a benja cuando tenga hambre", icon: "🐷" },
    warehouse: { title: "REVISAR ALMACEN", target: "warehouse", label: "ve al almacen", progress: "revisa las existencias guardadas", icon: "🏠" }
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
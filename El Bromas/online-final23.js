(()=>{
if(window.__EB_FINAL23)return;window.__EB_FINAL23=1;
const s=window.__ebSocket,N=v=>Number.isFinite(+v)?+v:0,$=id=>document.getElementById(id);
let fx=new Map(),last=0;
function mat(type){try{return new THREE.MeshBasicMaterial({color:type==='mortar'?0x8b5a2b:type==='caca'?0x654321:0x777777})}catch{return null}}
function make(type){try{const g=new THREE.Mesh(new THREE.SphereGeometry(type==='mortar'?0.24:0.18,6,6),mat(type));g.userData.__ebRemoteFx=true;return g}catch{return null}}
function apply(a){if(!Array.isArray(a))return;const seen=new Set();for(const d of a.slice(-60)){if(!d?.id)continue;seen.add(d.id);let r=fx.get(d.id);if(!r){const g=make(d.type);if(!g)continue;scene.add(g);r={g};fx.set(d.id,r)}r.g.position.set(N(d.x),N(d.y),N(d.z));r.g.rotation.set(N(d.rx),N(d.ry),N(d.rz));r.g.visible=true}for(const[id,r]of fx)if(!seen.has(id)){r.g.parent?.remove(r.g);fx.delete(id)}}
function start(){if(!s){setTimeout(start,300);return}if(s.__eb23)return;s.__eb23=1;s.on('fx:snapshot',d=>apply(d?.items||[]));s.on('fx:all',d=>apply(d?.items||[]));requestAnimationFrame(function tick(t){if(t-last>180){last=t}requestAnimationFrame(tick)})}
start();
})();

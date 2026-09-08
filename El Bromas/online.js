(function(){
  if(window.__elBromasOnline)return;
  window.__elBromasOnline=true;
  function start(){
    if(typeof io!=='function')return;
    const socket=io({transports:['websocket','polling']});
    const ui=document.createElement('div');
    ui.id='onlineUI';
    ui.style='position:fixed;top:8px;left:8px;z-index:99999;background:rgba(0,0,0,.75);color:#fff;padding:7px 10px;border-radius:9px;font:700 13px Arial';
    ui.textContent='🟢 1 online'; document.body.appendChild(ui);
    const input=document.createElement('input');
    input.maxLength=20; input.placeholder='Tu nombre';
    input.style='position:fixed;top:8px;right:8px;z-index:99999;width:125px;padding:7px;border-radius:8px;border:0';
    document.body.appendChild(input);
    const remote={}; let last=0;
    socket.on('online:count',n=>ui.textContent='🟢 '+n+' online');
    socket.on('world:players',list=>{
      if(!window.scene||typeof THREE==='undefined')return;
      const ids=new Set(list.map(p=>p.id));
      list.forEach(p=>{
        if(p.id===socket.id)return;
        let o=remote[p.id];
        if(!o){
          const g=new THREE.Group();
          const body=new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,1.1,10),new THREE.MeshStandardMaterial({color:0x2196f3})); body.position.y=.55; g.add(body);
          const head=new THREE.Mesh(new THREE.SphereGeometry(.3,10,10),new THREE.MeshStandardMaterial({color:0xffcc99})); head.position.y=1.25; g.add(head);
          scene.add(g); o=remote[p.id]={g:g};
        }
        o.g.position.set(Number(p.x)||0,Number(p.y)||0,Number(p.z)||0); o.g.rotation.y=Number(p.ry)||0;
      });
      Object.keys(remote).forEach(id=>{if(!ids.has(id)){scene.remove(remote[id].g);delete remote[id]}});
    });
    function send(){
      if(!socket.connected||!window.character)return;
      const now=Date.now(); if(now-last<50)return; last=now;
      const p=character.position,r=character.rotation;
      socket.emit('player:update',{name:(input.value.trim()||'Jugador').slice(0,20),x:p.x,y:p.y,z:p.z,ry:r.y,hp:Number(window.playerHealth)||100,aura:Number(window.playerAura)||0,dead:!!window.isDead,moving:!!window.isMoving});
    }
    setInterval(send,50); socket.on('connect',send);
    ['attackBtn','specialBtn','jumpBtn','poopBtn','buffBtn','tuboBtn','morteroBtn'].forEach(id=>document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#'+id))socket.emit('player:action',{action:id.replace('Btn','')})},true));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
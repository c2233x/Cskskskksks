# Salva a Fornatan 2 — El Bromas 2

**Version actual: 1.3**

Esta entrega conserva la base 3D de la serie **Salva a cornatan**, pero cuenta una historia diferente: el personaje principal llega a una granja y empieza a cuidar a Benja, un cerdo que disfruta revolcarse en el lodo.

## Acceso
- Titulo: `Codis`
- Codigo: `pepa`

El codigo es una pantalla de acceso visual, no autenticacion segura.

## Capitulo 1. La granja de Benja
La llegada cinematografica presenta la granja y a Benja. Despues, se abren encargos variados que cambian de orden por ciclos, manteniendo cosecha, huevos y entrega como primeros trabajos para reunir materiales.

Los ocho trabajos son:
1. Cosechar zanahorias y maiz.
2. Recoger huevos en el gallinero.
3. Entregar pedidos a la casa vecina.
4. Comprar madera y reforzar el corral.
5. Sacar agua del pozo.
6. Poner a punto el tractor y recuperar heno.
7. Dar comida a Benja cuando haga falta.
8. Organizar las existencias en el almacen.

La flecha se calcula con la direccion de la camara y apunta hacia el objetivo. El marcador 3D indica su ubicacion aproximada.

## Tienda y almacen
En el puesto puedes comprar maiz, trigo, zanahorias, heno, pienso y madera. Los productos comprados quedan en tu carga. En el almacen puedes guardar toda la carga, retirar unidades y revisar las cantidades por tipo. Las existencias se suman y se guardan con tu partida.

## Defensa nocturna
Cuando llega la noche aparecen intrusos que intentan llegar al corral. Defiende a Benja, vigila su barra de salud y refuerza el corral para reducir el daño. Cada dos intrusos derrotados recibes $5.

## Mundo y rendimiento
- El barro de Benja tiene mas superficie y contraste para distinguirse desde lejos.
- La granja incluye propiedades rurales privadas, arboles y pinos.
- Las montanas se forman deformando la geometria del terreno, con lomas y elevaciones.
- Los grupos del mundo usan culling por distancia y frustum de camara; los objetos fuera de la vista se descartan antes de dibujarse cuando corresponde.
- En Android se limita la resolucion de dibujo y se dejan las sombras pesadas apagadas por defecto.
- Los ajustes graficos y el guardado de esta entrega son independientes de **Salva a cornatan** original.

## Sonidos
Los sonidos originales enviados para Benja estan en `Sonidos/Benja/` y se alternan mientras el cerdo esta cerca.

## Guardado y actualizaciones
La partida conserva dinero, peso de Benja, materiales, productos del almacen, trabajo actual y nivel de defensa en el dispositivo.

El archivo `actualizaciones.json` guarda las notas de cada version. Las actualizaciones se publican cuando se modifica el repositorio; no se generan automaticamente cada dia.

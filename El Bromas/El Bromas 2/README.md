# Salva a Fornatan 2 — El Bromas 2

**Version actual: 1.2**

Esta entrega conserva la base 3D de la serie **Salva a cornatan**, pero cuenta una historia diferente: el personaje principal llega a una granja y empieza a cuidar a Benja, un cerdo que disfruta revolcarse en el lodo.

## Acceso
- Titulo: `Codis`
- Codigo: `pepa`

El codigo es una pantalla de acceso visual, no autenticacion segura.

## Capitulo 1. La granja de Benja
1. Mira la llegada a la granja y conoce a Benja durante la cinematica.
2. Acercate a Benja y habla con el.
3. Prepara pedidos en la mesa del granero para ganar monedas.
4. Compra un saco de comida en el puesto.
5. Llevale la comida a Benja y aumenta su peso.
6. Repite el trabajo, la compra y la alimentacion para seguir cuidandolo.

La flecha en pantalla apunta al objetivo actual. El marcador 3D muestra donde esta y la distancia aproximada.

## Mundo y rendimiento
- Se corrigieron los ojos de Benja y el suelo de la granja.
- Se agregaron dos propiedades rurales privadas con casas y cercas.
- El paisaje ahora tiene mas arboles, pinos y montanas.
- La vegetacion y las montanas usan objetos instanciados para evitar crear cientos de objetos independientes.
- El terreno usa menos vertices y la version Android limita la resolucion de dibujo y deja las sombras pesadas apagadas por defecto.
- Los ajustes graficos se guardan por separado de **Salva a cornatan** original.

## Sonidos
Los sonidos originales enviados para Benja estan en `Sonidos/Benja/` y se alternan mientras el cerdo esta cerca.

## Guardado y actualizaciones
La partida se guarda en el dispositivo con claves propias de El Bromas 2 y no comparte el progreso del primer juego.

El archivo `actualizaciones.json` guarda las notas de cada version. Las futuras versiones pueden agregar capitulos, cinematicas, dialogos, misiones y correcciones. Las actualizaciones no se generan solas cada dia: se publican cuando se realiza una nueva actualizacion del repositorio.

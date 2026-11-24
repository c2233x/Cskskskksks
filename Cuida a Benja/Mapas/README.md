# Mapas de Cuida a Benja

Los mapas estan separados en archivos propios y comparten el motor 3D:

- `Granja.js`: coordenadas de la granja, Benja, puestos, almacen, animales, misiones y reglas de las invasiones. Los trabajadores automaticos estan desactivados.
- `Ciudad.js`: punto de entrada, trabajos de ciudad, recompensas, oleadas y salida de regreso a la granja.

Los archivos definen datos; no duplican el motor, los controles, los vehiculos ni el guardado.

## Construcción de la granja
Las piezas compradas se colocan manualmente en la granja con vista previa, giro, confirmación y colisiones. El progreso se guarda en el dispositivo. La ciudad no inicia drones de reconstrucción; los objetos del mapa deben quedar dentro del grupo de ciudad para que se descarguen al regresar.

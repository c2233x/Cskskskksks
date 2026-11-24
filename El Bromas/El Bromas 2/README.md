# Cuida a Benja — El Bromas 2

**Version actual: 1.4.0**

Cuida a Benja es una aventura 3D de granja y ciudad. El personaje principal llega al rancho, encuentra a Benja en el barro y empieza a mantener la granja, reunir dinero, conseguir comida y defender el corral por las noches.

## Acceso
- Titulo: `Codis`
- Codigo: `pepa`

El codigo es una pantalla de acceso visual, no autenticacion segura.

## Mapas separados
Los mapas tienen archivos propios dentro de `Mapas/`:

- `Mapas/Granja.js`: coordenadas, tiendas, almacen, corrales, ubicaciones de trabajo, misiones, Benja y reglas de invasiones.
- `Mapas/Ciudad.js`: ubicaciones de la ciudad, tablero de trabajos, recompensas y oleadas.

Los dos mapas comparten el motor 3D, controles, personaje, vehiculos, camara y guardado. Esto evita duplicar el motor y mantiene los coches disponibles al viajar a la ciudad.

## La granja
La granja no tiene NPC trabajadores ni bots ambientales. Benja camina por el corral, se ensucia en el barro y tiene un indicador de salud y hambre. Cuando tiene hambre puede decir "ocupo pa la renta".

La comida se compra en la tienda, se saca del almacen y se carga en una caja visible en la espalda del personaje. Cerca de Benja, usa ATACAR para lanzarle una porcion. Al comer, se reproduce uno de los sonidos de cerdo enviados para el juego.

En la noche llegan invasores para atacar a Benja. Defiende el corral; cada dos invasores derrotados dan $5. Los muros de defensa se construyen con bloques gruesos unidos y torres de esquina. Las mejoras aumentan la altura y el espesor.

## Tienda y almacen
La tienda vende maiz, trigo, zanahorias, heno, pienso y madera. El almacen separa y acumula cada producto, permite guardar toda la carga o retirar una unidad y conserva las cantidades con la partida.

## Ciudad principal
Al llegar al limite de la granja puedes viajar a la ciudad principal. Los vehiculos y el sistema de oleadas siguen disponibles. Cada enemigo derrotado en la ciudad paga $1.

Hay ocho trabajos disponibles en el tablero:
1. Repartidor.
2. Servicio de taxi.
3. Ayudante de taller.
4. Mantenimiento del parque.
5. Encargo del mercado.
6. Reparar alumbrado.
7. Mensajero.
8. Limpieza de calles.

Al aproximarse la noche, Benja avisa que conviene regresar a la granja.

## Voz y subtitulos
Los dialogos muestran subtitulos en la parte inferior. Cuando el dispositivo/browser dispone de voces mediante speechSynthesis, se intenta usar una voz en espanol. La disponibilidad de voz depende de Android, del navegador y de sus voces instaladas.

## Mundo y rendimiento
- Terreno deformado con elevaciones y montanas.
- Arboles, vegetacion y propiedades rurales.
- Culling por distancia y campo de vision para reducir objetos procesados.
- Resolucion de dibujo y sombras ajustadas para dispositivos moviles.
- El guardado de esta entrega es independiente del juego original.

## Actualizaciones
El archivo `actualizaciones.json` contiene el historial de versiones. Las tareas diarias pueden proponer contenido y correcciones, pero cada cambio debe pasar validaciones antes de publicarse.

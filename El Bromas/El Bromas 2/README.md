# Cuida a Benja — El Bromas 2

**Archivo del juego:** `Cuida a Benja.html`

**Version actual: 1.5.1**

Cuida a Benja es una aventura 3D de granja y ciudad. El personaje principal llega al rancho, encuentra a Benja en el barro y empieza a mantener la granja, reunir dinero, conseguir comida y defender el corral por las noches.

## Acceso
- Titulo: `Codis`
- Codigo: `pepa`

El codigo es una pantalla de acceso visual, no autenticacion segura.

## Mapas separados
Los mapas tienen archivos propios dentro de `Mapas/` y se cargan por separado:

- `Mapas/Granja.js`: datos y constructor `buildWorld()` de la granja: coordenadas, tienda, almacén, corrales, cultivos, misiones, Benja y sonidos por zonas.
- `Mapas/Ciudad.js`: datos y constructor `buildWorld()` de la ciudad: ubicaciones, tablero de trabajos, recompensas y oleadas.

Los mapas comparten el motor 3D, controles, personaje, vehiculos, camara y guardado, pero los objetos de la ciudad solo se crean cuando el jugador viaja a ella. La ciudad no se renderiza mientras se juega en la granja.

## La granja
La granja no tiene NPC trabajadores ni bots constructores. No hay construcción automática. Benja camina por el corral, se ensucia en el barro y tiene un indicador de salud y hambre. Cuando tiene hambre puede decir "ocupo pa la renta".

La tienda y el almacén se usan acercándose físicamente a cada edificio y pulsando ATACAR. El almacén es una caja grande abierta con montones visuales por tipo de producto. La comida se compra en la tienda, se saca del almacén y se carga en una caja visible en la espalda del personaje. Cerca de Benja, usa ATACAR para lanzarle una porcion. Al comer, se reproduce uno de los sonidos de cerdo enviados para el juego.

En la noche llegan invasores para atacar a Benja. Defiende el corral; cada dos invasores derrotados dan $5. Los muros de defensa se construyen con bloques gruesos unidos y torres de esquina. Las mejoras aumentan la altura y el espesor.

## Tienda y almacen
La tienda vende maiz, trigo, zanahorias, heno, pienso y madera. El almacen separa y acumula cada producto, permite guardar toda la carga o retirar una unidad y conserva las cantidades con la partida.

## Ciudad principal
Al cruzar el límite de la granja se muestra una transición cinematográfica y se carga el mapa de ciudad por separado. Los vehiculos y el sistema de oleadas siguen disponibles. Cada enemigo derrotado en la ciudad paga $1.

Hay ocho trabajos disponibles en el tablero:
1. Repartidor.
2. Servicio de taxi.
3. Ayudante de taller.
4. Mantenimiento del parque.
5. Encargo del mercado.
6. Reparar alumbrado.
7. Mensajero.
8. Limpieza de calles.

Al salir del límite de la ciudad vuelves automáticamente a la granja; se cancela cualquier trabajo de ciudad que estuviera activo. Al aproximarse la noche, Benja avisa que conviene regresar.

## Televisión y ambiente
En la granja hay un televisor interactivo con opciones de canales hondureños e internacionales. Si el canal bloquea la reproducción integrada, puedes abrir su sitio oficial desde el panel. La radio del carro se enciende manualmente; en la granja no hay música de fondo. En algunas zonas se oyen viento, pájaros y chicharras.

## HUD y desplazamiento
El nombre del jugador es Cornatan. La salud y el hambre de Benja aparecen en barras separadas encima del HUD del jugador. Los paneles de tienda, almacén, televisión y trabajos permiten desplazamiento táctil.

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

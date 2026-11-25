# Cuida a Benja

**Archivo del juego:** `Cuida a Benja.html`

**Version actual: 1.10.3**

Cuida a Benja es una aventura 3D de granja y ciudad. El personaje principal llega al rancho, encuentra a Benja en el barro y empieza a mantener la granja, reunir dinero, conseguir comida y defender el corral por las noches.

## Inicio
El motor Three.js se carga desde el archivo local `three.min.js`; JSZip se solicita solo si hace falta el respaldo ZIP. La consulta de versión, el listado Git Trees, el Contents API, las descargas y el caché tienen límites de espera. Si Git Trees falla, se recorre la carpeta `Cuida a Benja/` mediante Contents API antes del ZIP.
El juego carga directamente, sin pedir código de acceso. Three.js r128 se sirve desde `three.min.js` en esta misma carpeta para evitar que una dependencia externa bloquee la pantalla inicial. Si GitHub no responde, intenta usar recursos guardados y permite entrar en modo local.

## Mapas separados
Los mapas tienen archivos propios dentro de `Mapas/` y se cargan por separado:

- `Mapas/Granja.js`: datos y constructor `buildWorld()` de la granja: coordenadas, tienda, almacén, corrales, cultivos, misiones, Benja y sonidos por zonas.
- `Mapas/Ciudad.js`: datos y constructor `buildWorld()` de la ciudad: ubicaciones, tablero de trabajos, recompensas y oleadas.

Los mapas comparten el motor 3D, controles, personaje, vehiculos, camara y guardado, pero los objetos de la ciudad solo se crean cuando el jugador viaja a ella. La ciudad no se renderiza mientras se juega en la granja.

## La granja
La granja no tiene NPC trabajadores ni bots constructores. La construcción es manual: compra muros, puertas, ventanas, techos y antorchas; activa el modo de colocar, mueve al personaje para elegir el punto, gira la pieza y confirma. Las piezas colocadas y sus colisiones se guardan en el dispositivo. Benja camina por el corral, se ensucia en el barro y tiene un indicador de salud y hambre. Cuando tiene hambre puede decir "ocupo pa la renta".

La tienda y el almacén se usan acercándose físicamente a cada edificio y pulsando ATACAR. El almacén es una caja grande abierta con montones visuales por tipo de producto. La comida se compra en la tienda, se saca del almacén y se carga en una caja visible en la espalda del personaje. Cerca de Benja, usa ATACAR para lanzarle una porcion. Al comer, se reproduce uno de los sonidos de cerdo enviados para el juego.

En la noche llegan invasores para atacar a Benja. Defiende el corral; cada dos invasores derrotados dan $5. Los muros de defensa se construyen con bloques gruesos unidos y torres de esquina. Las mejoras aumentan la altura y el espesor.

## Tienda y almacen
La tienda vende maiz, trigo, zanahorias, heno, pienso y madera. El almacen separa y acumula cada producto, permite guardar toda la carga o retirar una unidad y conserva las cantidades con la partida.

## Ciudad principal
El botón `RUMBO A CIUDAD` permite iniciar el viaje directamente; también se conserva la salida automática al cruzar el límite de la granja. La transición muestra una pantalla cinematográfica y carga el mapa de ciudad por separado. Los vehiculos y el sistema de oleadas siguen disponibles. Cada enemigo derrotado en la ciudad paga $1.

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

## Televisión y radio de la granja
El televisor tiene una pantalla física que permanece en el mundo. El video HLS se aplica como textura de Three.js directamente sobre el plano 3D de la pantalla, con la misma perspectiva del aparato y sin una capa 2D proyectada. El panel permite encender, apagar, seleccionar canal y regular el volumen. El audio se atenúa según la distancia al televisor. Al cerrar el panel, la emisión sigue reproduciéndose; apagarlo deja la pantalla negra. Si una señal no está disponible o el navegador bloquea el flujo, se intenta el reproductor oficial alternativo.

Canales disponibles para probar: 43 entradas hondureñas e internacionales, organizadas por categorías (noticias, general, entretenimiento, educativo, religioso, música, deportes, internacional, anime y caricaturas). Los accesos de Pluto TV abren el catálogo oficial en el navegador. Pluto TV no queda integrado como señal HLS directa en la pantalla 3D; la disponibilidad y reproducción se gestionan en su propio servicio. El buscador filtra por nombre o categoría y `BUSCAR Y PROBAR` comprueba cada enlace en el navegador; `DETENER BÚSQUEDA` cancela el escaneo. Una señal marcada como disponible funcionó en ese dispositivo durante la prueba, pero puede cambiar según la emisión, región o navegador.

La radio física está junto al televisor y quedó más cerca y con un radio de interacción mayor; ofrece emisoras hondureñas, encendido manual y control de volumen. El sonido baja al alejarse de la radio. La radio del carro mantiene sus controles propios. En la granja no hay música de fondo. El audio original de chicharras se carga desde `Sonidos/ambiente/la chicharra japonesa(MP3_160K).mp3` en las zonas de insectos; el viento suena por toda la granja y los pájaros aparecen como ambiente. El volumen varía según la zona y la distancia. El audio ambiente pertenece a `Cuida a Benja/Sonidos/ambiente/` y se reproduce en las zonas de insectos. Al volver desde la ciudad, la música de fondo se detiene y no se reinicia en la granja.

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

## HUD, colisiones y detalle de estructuras (1.6.3)
El indicador de objetivo se ubica por encima del área central de juego. La tarjeta de salud/hambre de Benja y la tarjeta de dinero/peso/almacén quedan separadas en la parte inferior izquierda; el botón de ajustes se mueve a la parte superior derecha. El canvas se ajusta al área completa del documento para evitar márgenes negros internos.

Las colisiones de las estructuras de granja usan cajas orientadas que respetan la rotación de vallas, TV y radio. Se agregan límites al granero, casas, almacén (con entrada central abierta), tienda, gallinero, pozo, tractor, bebedero, cajas de pedidos y muros/torres del corral. Las colisiones de la granja se ignoran mientras está cargado el mapa de ciudad.

Se detallan el granero y las casas con vigas, molduras, puertas, ventanas, chimenea, aleros y remates de techo. Las zonas de chicharras incluyen el patio central, huerto, arboleda y camino del tractor. El volumen de chicharras, viento y aves se atenúa progresivamente con la distancia. La música se detiene al regresar de ciudad a granja.

## Pocilga, agua y mejoras de la granja (1.6.6)
La casa base de la granja se transforma en tu pocilga, con cuatro niveles de mejora comprables con dinero y madera. Se conserva una entrada abierta para entrar y salir. El depósito de agua empieza con 20 L de capacidad y se puede ampliar hasta cuatro niveles; el nivel de agua visible depende de las unidades de agua guardadas en el almacén. Dos lagunitas muestran agua azul translúcida, orillas, piedras, juncos y ondas.

Se puede bañar a Benja desde el panel del almacén consumiendo 3 unidades de agua. Su indicador incluye aseo, que baja lentamente con el tiempo y se recupera al bañarlo. Las mejoras y el aseo se guardan en la partida.

El ciclo de día y noche ahora avanza por tiempo transcurrido y dura aproximadamente 20 minutos por ciclo completo. Se muestra un reloj con hora y fase del día. El viento continúa en toda la granja; el coro de chicharras tiene mayor presencia en las zonas rurales. La radio puede oírse a mayor distancia y se atenúa suavemente al alejarse.

La cámara comprueba las mismas cajas de colisión que el jugador para evitar atravesar edificios y objetos. Se añaden colisiones a árboles, pinos, piedras de las lagunas, pacas, sacos, palés, vallas y estructuras principales. La entrada del corral se centra y se abre otra entrada lateral. El campo se representa con surcos oscuros y trigo de varias piezas (tallo, hoja, espiga y granos) y las flores usan sprites redondos para evitar puntos blancos cuadrados.

La TV incluye botones físicos 3D para canal anterior y siguiente debajo de la pantalla y una opción para abrir los catálogos oficiales de Pluto TV de Anime y Kids. El botón de escaneo muestra páginas oficiales del catálogo; Pluto TV se reproduce en su propio sitio y la disponibilidad depende de la región y del servicio.


## 1.6.6 · Corrección de tejados y render del campo
- Se corrige la inclinación de los tejados de casas, granero y pocilga: las dos faldones ahora suben hacia la cumbrera en lugar de cruzarse por encima.
- Se reduce y oscurece la geometría de los surcos del cultivo para que no aparezcan franjas claras sobre el terreno.
- Se ajusta la superficie de las lagunas a un azul más natural y a una ordenación de profundidad más estable.
- Se suaviza el oscurecimiento del cielo en el amanecer y atardecer.
- Se elimina la luz artificial automática del avatar; la iluminación portátil se añadirá como antorcha comprable.
- La TV muestra brevemente el número y nombre del canal al cambiarlo.
- El sonido original de chicharras se carga desde `Sonidos/ambiente/chicharra_original.mp3`, sin cambiar tono ni velocidad.

## Actualización 1.6.7
- El inicio ya no solicita contraseña ni código.
- El corral original de Benja tiene una abertura frontal real de 12 m. Al reforzarlo se retira la cerca de madera anterior y sus colisiones antes de levantar el nuevo muro.
- Los botones físicos de canal anterior/siguiente bajo el televisor usan zonas de toque mayores y eventos de puntero para Android.
- La lista de emisoras de la radio de la granja se deriva de la misma lista hondureña que la radio del vehículo y dispone de una prueba individual de audio y botón para detenerla.
- Se recupera la cinemática de apertura que faltaba. Cada diálogo usa el lector de voz local del navegador/dispositivo y se muestra en los subtítulos inferiores.
- El reproductor de chicharras carga el MP3 original sin cambiar tono ni velocidad desde `Sonidos/ambiente/chicharra_original.mp3`.
- La lista de TV permite mostrar/ocultar canales que la prueba marcó sin señal. Pluto TV abre su catálogo oficial; no se anuncia como una señal directa integrada.

Audio ambiente: `chicharra_original.mp3`.
Ruta de publicación: `Cuida a Benja/Sonidos/ambiente/chicharra_original.mp3`. 
## Actualización 1.6.8 · Suministros y construcción
- Se amplía el catálogo de Suministros con balde reutilizable, antorchas, muros de madera y ladrillo, puertas, ventanas y paneles de tejado.
- Se añaden modelos 3D de las piezas y un modo de construcción: vista previa semitransparente, ajuste a cuadrícula de 2 m, giro de 90 grados, confirmación y cancelación.
- Las piezas colocadas se guardan localmente, se reconstruyen al volver a cargar la granja y añaden colisiones.
- El balde se puede rellenar en el pozo con cinco litros; para bañar a Benja se necesitan tres litros y un balde.
- La construcción se cancela al viajar a la ciudad para no dejar vistas previas fuera del mapa.
- Se actualizan los productos del almacén para que los nuevos suministros puedan acumularse y retirarse.

## Actualización 1.6.9 · Ciudad, corral y optimización
- Se elimina la llamada a los drones de reconstrucción tanto en el mapa de ciudad externo como en el respaldo interno. Evita que edificios y props se creen fuera del grupo de ciudad y queden acumulados en la granja.
- Se corrigen las rutas de carga de Granja.js y Ciudad.js para la carpeta Cuida a Benja.
- El corral reforzado presenta tres diseños distintos: valla alta de madera, mampostería con franja de ladrillo y muro fortificado con almenas y torres. Cada refuerzo sustituye la cerca anterior y mantiene libre el acceso.
- La radio del coche vuelve a encenderse al entrar, como en Salva a Cornatan. El modelo de coche, sus diseños y la física de conducción se mantienen sin cambios.
- El indicador de suciedad se normaliza como Barro, con manchas y proyectiles marrones; conserva el medidor y el efecto de juego sin terminología sexual.
- La TV aporta una luz azul suave; las antorchas iluminan por la noche y las farolas de ciudad activan luces cálidas cercanas.
- En Android se reducen los segmentos del terreno, la resolución dinámica, los árboles de ciudad y el número de tramos de carretera dibujados.
- Los enemigos del modo de Benja conservan un diseño de guardianes robóticos de estilo low-poly, separado del diseño anatómico del juego anterior.


## Actualización 1.7.0 · Inicio y carpetas independientes
- El juego queda publicado en la raíz del repositorio, dentro de `Cuida a Benja/`, fuera de `El Bromas/`.
- El cargador ahora descarga solo los archivos de `Cuida a Benja/` y deja de recorrer todos los recursos de `El Bromas/` durante el inicio.
- Se actualizan las rutas de los mapas, la versión y el audio ambiente.
- La carpeta `Sonidos/ambiente/` queda preparada para el MP3 original `chicharra_original.mp3`.


## Actualización 1.7.1 · Corrección de inicio en Android
- Las solicitudes de versión y de listado de archivos tienen límites de espera y rutas alternativas.
- El juego ya no descarga el ZIP de todo el repositorio cuando falla la API.
- La configuración de la granja está integrada en el HTML y no depende de una petición externa bloqueante.
- El inicio descarga solo los recursos de `Cuida a Benja/`.

## Actualización 1.7.3 · Huerto y cosecha de manzanas
- Se incorpora un pequeño huerto low-poly junto al árbol central, con frutos visibles y un marcador de misión.
- La misión entrega cinco manzanas y $16. Las manzanas pueden guardarse, retirarse y lanzarse a Benja como alimento.
- La migración del orden de misiones añade el nuevo encargo a partidas antiguas y conserva el índice/progreso, el dinero, el peso, la carga, el almacén y las mejoras.
- No se añaden NPC trabajadores ni se modifica el mapa de ciudad, los vehículos o el juego original.


## Sistema de carga
Cuida a Benja utiliza el sistema de carga original de Salva a Cornatan, adaptado a la carpeta `Cuida a Benja`. Incluye listado GitHub, caché local, reintentos, modo sin conexión y respaldo ZIP.


## Diagnóstico temporal
El botón flotante `Logs` abre el panel de diagnóstico con la contraseña `pipi`. Registra el proceso de carga, red, errores y recursos fallidos durante la sesión. Los registros se mantienen temporalmente en `sessionStorage` y pueden copiarse o limpiarse desde el panel.


## Actualización 1.9.9 · Tractor, controles y almacén
- El tractor y la camioneta aparecen estacionados cerca de la pocilga, con coordenadas iguales en el mapa externo y el HTML de respaldo.
- Los botones táctiles superpuestos de TV y radio son invisibles, pero conservan su área táctil; los botones físicos 3D de cada aparato siguen visibles.
- La misión se llama **REVISAR ALMACEN** y se completa al abrir el almacén para consultar las existencias.
- Los diálogos seleccionan voces masculinas españolas cuando están disponibles y usan un tono grave. La voz requiere que el navegador/WebView incluya `speechSynthesis` y que Android tenga voces españolas instaladas.


## Actualización 1.10.0 · Inventario, Benja y granja
- El almacén tiene suelo sólido para impedir que el terreno lo tape o parpadee.
- Se retira el cartel de la pocilga y se conserva la estructura.
- El botón USAR responde a los toques y libera su estado aunque el evento táctil se interrumpa.
- Cerca de Benja, USAR lanza comida; también puede tomar una porción del almacén si no hay comida en la mochila.
- Se incorpora el botón INVENTARIO con la mochila, el martillo, herramientas y acciones para colocar piezas y cuidar a Benja.
- El tractor y la camioneta quedan cerca de la pocilga; el tractor se distingue con colores, luces, baliza y rótulo.
- El barro deja de utilizar materiales básicos luminosos y el cielo tiene transiciones más graduales durante el día y la noche.


## Actualización 1.10.1 · Benja, vehículos e inventario
- La primera misión después de la cinemática es acercarse a Benja; se completa al entrar en el radio de proximidad del cerdito. Las partidas anteriores que seguían en el primer encargo se migran a este objetivo.
- La flecha sigue a Benja si se desplaza y el encargo de alimentarlo usa su posición actual.
- Los artículos del almacén se crean de forma aislada; si un modelo falla, se dibuja una versión 3D de respaldo y se continúa con el resto del mapa.
- El tractor y la camioneta se acercan al punto inicial y reciben colores y marcadores más visibles.
- El martillo permite elegir cualquier estructura colocada para moverla o destruirla.
- El inventario se simplifica a tarjetas de artículos, sin saldo ni textos adicionales.
- La TV muestra un pollito dando vueltas mientras carga el canal.


## Actualización 1.10.2 · Balde, subtítulos y mejoras visuales
- La misión del bebedero detecta el balde en mochila o almacén y al comprarlo dirige al pozo.
- Se quitaron las etiquetas y espirales del tractor y la camioneta.
- Los diálogos aparecen como subtítulos; la cinemática avanza automáticamente.
- Se retiró el reinicio manual de la interfaz.
- Se añadieron detalles estructurales al almacén, tarimas y mochila, además de modelos diferenciados para los artículos transportados.

## Viaje y taller de vehiculos (1.10.3)

- Al viajar desde la granja, el personaje permanece dentro del vehiculo que estaba conduciendo; se conserva la referencia y el vehiculo se mueve con el jugador al mapa de ciudad.
- La llegada ocurre en la carretera de entrada de la ciudad, junto al cartel grande `CAMPO`.
- El regreso ya no depende de alejarse en cualquier direccion del centro: se activa al cruzar el extremo señalizado de la carretera `CAMPO`.
- El taller tiene almacenamiento persistente de repuestos, cajas de herramientas y piezas mecanicas. Los objetos se descargan desde la camioneta y las mejoras consumen el inventario guardado.

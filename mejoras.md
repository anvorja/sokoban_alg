# Mejoras realizadas

## 1. Migración completa a TypeScript

Se rehizo la base del proyecto en TypeScript y se introdujo tipado explícito para:

- estados del juego;
- nodos de búsqueda;
- resultados de búsqueda;
- direcciones y movimientos;
- estructura del nivel de entrada.

Archivos fuente nuevos:

- `src/sokoban.ts`
- `src/solver-core.ts`
- `src/level-parser.ts`
- `src/constants.ts`
- `src/priority-queue.ts`
- `src/types.ts`
- `src/algorithms/depth-first.ts`
- `src/algorithms/breadth-first.ts`
- `src/algorithms/iterative-deepening.ts`
- `src/algorithms/greedy-best-first.ts`
- `src/algorithms/a-star.ts`

También se agregó `tsconfig.json` y el script de compilación en `package.json`.

## 2. Separación de algoritmos en archivos independientes

Antes, toda la lógica estaba concentrada en un solo archivo. Ahora cada algoritmo quedó en su propio módulo:

- DFS en `src/algorithms/depth-first.ts`
- BFS en `src/algorithms/breadth-first.ts`
- IDS en `src/algorithms/iterative-deepening.ts`
- Greedy Best-First Search en `src/algorithms/greedy-best-first.ts`
- A* en `src/algorithms/a-star.ts`

`src/sokoban.ts` actúa como punto de entrada y llama a cada algoritmo de forma ordenada.

## 3. Refactor del motor del juego

La lógica del tablero ya no depende de cadenas manipuladas directamente como estado principal del programa. Se creó un núcleo de resolución en `src/solver-core.ts` que trabaja con un modelo estructurado:

- posición del jugador;
- conjunto de cajas;
- conjunto de muros;
- conjunto de objetivos;
- cálculo de sucesores válido para mover y empujar.

Esto mejora legibilidad, mantenibilidad y hace más seguro el manejo del estado.

## 4. Mejora sobre el manejo de estados visitados

En la versión original se usaba principalmente la cadena del tablero como estado visitado. En la nueva versión:

- el estado se serializa desde una estructura tipada;
- las cajas se ordenan antes de generar la clave;
- la posición del jugador se guarda explícitamente;
- varios algoritmos usan `Map` con profundidad o costo conocido, no solo un `Set`.

Eso permite podar revisitas de forma más precisa:

- DFS usa mejor profundidad conocida;
- BFS usa mejor nivel conocido;
- A* usa mejor costo `g`;
- Greedy usa mejor prioridad heurística.

## 5. Eliminación del límite duro de profundidad

La versión anterior cortaba búsquedas en profundidad 64. Eso podía declarar “No hay solución” incluso cuando sí existía una solución más larga.

Ahora:

- DFS ya no impone un tope fijo de 64;
- BFS tampoco impone ese límite;
- IDS ya no recibe un `maxLevel` fijo;
- IDS incrementa el límite de profundidad desde 0 hasta agotar la búsqueda o hallar solución.

Con esto se elimina el falso negativo causado por un máximo arbitrario.

## 6. Incorporación de algoritmos heurísticos modernos

La versión original solo usaba búsqueda ciega. Ahora se agregaron dos algoritmos heurísticos:

### Greedy Best-First Search

Selecciona el siguiente nodo usando una prioridad basada en heurística. No garantiza optimalidad, pero suele explorar menos estados.

### A*

Combina:

- costo acumulado `g(n)`
- heurística `h(n)`

La prioridad es `f(n) = g(n) + h(n)`.

En este proyecto, A* usa como heurística principal la suma de distancias mínimas estimadas desde las cajas hacia objetivos.

## 7. Heurística más informada

Se construyó una heurística nueva basada en distancias de empuje hacia metas:

- se calcula qué casillas pueden llevar una caja hasta algún objetivo;
- se guarda la distancia mínima de empujes desde cada casilla hacia una meta;
- la heurística del estado suma esa distancia para todas las cajas.

Además, Greedy usa una puntuación extendida que añade cercanía del jugador a la caja más próxima para orientar mejor la exploración.

Esto es más sofisticado que una búsqueda ciega y más informado que la implementación anterior.

## 8. Detección de bloqueos típicos de Sokoban

Se añadieron podas semánticas para evitar expandir estados claramente perdidos.

### 8.1. Casillas muertas

Se precomputan casillas desde las que una caja nunca podrá llegar a un objetivo.

Si una caja termina en una de esas casillas y esa casilla no es objetivo, el estado se descarta.

### 8.2. Bloqueos en esquina

Si una caja queda en una esquina formada por muros y no está en un objetivo, el estado se poda.

### 8.3. Bloqueos 2x2

Si aparece un bloque 2x2 formado por muros y cajas, sin objetivos en ese bloque y con al menos una caja fuera de objetivo, el estado se considera irrecuperable.

Estas podas reducen trabajo inútil y corrigen una limitación importante de la versión original.

## 9. Corrección del problema de nombres y salida

En la versión original existía una confusión interna:

- una variable llamada `bfs` almacenaba `algDepth`;
- una variable llamada `dfs` almacenaba `algAmplitude`.

Aunque la ejecución imprimía cosas, el código era confuso.

Ahora eso quedó corregido de dos formas:

1. Cada algoritmo vive en su propio archivo con un nombre consistente.
2. La salida se imprime etiquetada por algoritmo:
- `DFS`
- `BFS`
- `IDS`
- `Greedy`
- `A*`

Además, la salida muestra:

- ruta;
- costo;
- profundidad;
- nodos explorados;
- nodos generados.

## 10. Mejoras en validación de entrada

Se añadió validación explícita para:

- tablero vacío;
- filas con longitudes inconsistentes;
- coordenadas inválidas;
- coordenadas fuera de rango;
- jugador sobre muro;
- caja sobre muro;
- caja superpuesta con jugador.

La versión original asumía entrada correcta casi sin validar.

## 11. Cambios en ejecución y build

Se actualizó `package.json`:

- `build`: compila TypeScript con `tsc`
- `prestart`: compila antes de ejecutar
- `start`: ejecuta `node sokoban.js`

Se ajustó también el `Dockerfile` para copiar `package-lock.json` junto con `package.json` antes de instalar dependencias.

## 12. Resultado práctico de la mejora

Después del refactor:

- el código está modularizado;
- cada algoritmo está aislado;
- el sistema es más fácil de extender;
- ya no depende de un límite de profundidad arbitrario;
- el solver tiene heurísticas nuevas;
- se agregaron podas típicas de Sokoban;
- la salida es más clara y consistente;
- el proyecto quedó migrado a TypeScript.

## 13. Resumen final

Las mejoras introducidas no fueron cosméticas. Se hizo una reingeniería real del proyecto:

- migración a TypeScript;
- separación por módulos;
- modernización de algoritmos;
- incorporación de A* y Greedy;
- mejora del modelo de estado;
- eliminación del límite duro;
- detección de deadlocks;
- corrección de nombres ambiguos;
- mejor trazabilidad en la salida y validación de entrada.

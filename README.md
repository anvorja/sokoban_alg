# Sokoban Alg

Versión refactorizada del resolvedor de Sokoban, migrada a TypeScript y organizada por módulos. Esta variante separa cada algoritmo de búsqueda en su propio archivo, incorpora búsqueda heurística y añade poda por bloqueos típicos del juego.

## Estructura

- `src/sokoban.ts`: punto de entrada
- `src/solver-core.ts`: motor del juego y generación de sucesores
- `src/level-parser.ts`: lectura y validación del archivo de nivel
- `src/types.ts`: tipos e interfaces
- `src/algorithms/depth-first.ts`: DFS
- `src/algorithms/breadth-first.ts`: BFS
- `src/algorithms/iterative-deepening.ts`: IDS
- `src/algorithms/greedy-best-first.ts`: Greedy Best-First Search
- `src/algorithms/a-star.ts`: A*
- `manual.md`: explicación técnica del proyecto
- `mejoras.md`: resumen de la refactorización y de las mejoras implementadas

## Algoritmos incluidos

El programa ejecuta e imprime resultados para:

1. `DFS`
2. `BFS`
3. `IDS`
4. `Greedy`
5. `A*`

Cada salida reporta:

- ruta encontrada;
- costo;
- profundidad;
- nodos explorados;
- nodos generados.

## Mejoras sobre la versión original

Esta versión incorpora:

- migración completa a TypeScript;
- separación de algoritmos por archivo;
- eliminación del límite duro de profundidad;
- manejo de visitados con estado tipado y costo/profundidad conocida;
- heurísticas nuevas para `Greedy` y `A*`;
- detección de deadlocks por casillas muertas, esquinas y bloques `2x2`;
- validación más estricta de entrada.

## Formato de entrada

Los niveles usan:

1. filas del tablero con caracteres `W`, `0` y `X`;
2. una coordenada `fila,columna` para el jugador;
3. coordenadas adicionales `fila,columna` para las cajas.

Ejemplo:

```txt
WWWWWW
W000WW
WX0X0W
W00W0W
W0000W
WWWWWW
1,1
2,2
2,3
```

## Requisitos

- Node.js
- pnpm

## Instalación

```sh
pnpm install
```

## Compilación

```sh
pnpm run build
```

Esto genera los archivos JavaScript de salida, incluyendo `sokoban.js`.

## Ejecución

Con npm:

```sh
pnpm start -- nivel1.txt
```

Con script:

```sh
sh run.sh nivel1.txt
```

Con Docker:

```sh
sh build-docker.sh
sh run-docker.sh nivel1.txt
```

## Movimientos válidos

- `U`: arriba
- `D`: abajo
- `L`: izquierda
- `R`: derecha

## Documentación complementaria

Para detalle técnico:

- ver [manual.md](/home/anborja/Escritorio/sokoban/sokoban_alg/manual.md:1)
- ver [mejoras.md](/home/anborja/Escritorio/sokoban/sokoban_alg/mejoras.md:1)

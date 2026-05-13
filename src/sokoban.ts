declare const require: (name: string) => {
    readFile(path: string, encoding: string): Promise<string>;
};

declare const process: {
    argv: string[];
    exit(code?: number): never;
};

import { searchAStar } from './algorithms/a-star';
import { searchBreadthFirst } from './algorithms/breadth-first';
import { searchDepthFirst } from './algorithms/depth-first';
import { searchGreedyBestFirst } from './algorithms/greedy-best-first';
import { searchIterativeDeepening } from './algorithms/iterative-deepening';
import { parseLevel } from './level-parser';
import { SokobanSolver } from './solver-core';
import { SearchResult } from './types';

const fs = require('node:fs/promises');

async function main(): Promise<void> {
    const args = process.argv.slice(2);

    if (args.length < 1) {
        console.error('Se debe ingresar el nombre del archivo de entrada');
        process.exit(1);
    }

    const inputFile = args[0];

    try {
        const data = await fs.readFile(inputFile, 'utf8');
        const lines = data.split(/\r?\n/);
        const solver = new SokobanSolver(parseLevel(lines));
        const results = [
            searchDepthFirst(solver),
            searchBreadthFirst(solver),
            searchIterativeDeepening(solver),
            searchGreedyBestFirst(solver),
            searchAStar(solver)
        ];

        for (const result of results) {
            console.log(formatResult(result));
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido.';
        console.error(`Error al procesar el archivo: ${message}`);
        process.exit(1);
    }
}

function formatResult(result: SearchResult): string {
    const path = result.path ? result.path.join('') : 'No hay solución';
    const cost = result.cost ?? '-';
    const depth = result.depth ?? '-';

    return `${result.algorithm}: ${path} | costo=${cost} | profundidad=${depth} | explorados=${result.explored} | generados=${result.generated}`;
}

main();

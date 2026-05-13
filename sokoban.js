"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const a_star_1 = require("./algorithms/a-star");
const breadth_first_1 = require("./algorithms/breadth-first");
const depth_first_1 = require("./algorithms/depth-first");
const greedy_best_first_1 = require("./algorithms/greedy-best-first");
const iterative_deepening_1 = require("./algorithms/iterative-deepening");
const level_parser_1 = require("./level-parser");
const solver_core_1 = require("./solver-core");
const fs = require('node:fs/promises');
async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Se debe ingresar el nombre del archivo de entrada');
        process.exit(1);
    }
    const inputFile = args[0];
    try {
        const data = await fs.readFile(inputFile, 'utf8');
        const lines = data.split(/\r?\n/);
        const solver = new solver_core_1.SokobanSolver((0, level_parser_1.parseLevel)(lines));
        const results = [
            (0, depth_first_1.searchDepthFirst)(solver),
            (0, breadth_first_1.searchBreadthFirst)(solver),
            (0, iterative_deepening_1.searchIterativeDeepening)(solver),
            (0, greedy_best_first_1.searchGreedyBestFirst)(solver),
            (0, a_star_1.searchAStar)(solver)
        ];
        for (const result of results) {
            console.log(formatResult(result));
        }
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Error desconocido.';
        console.error(`Error al procesar el archivo: ${message}`);
        process.exit(1);
    }
}
function formatResult(result) {
    const path = result.path ? result.path.join('') : 'No hay solución';
    const cost = result.cost ?? '-';
    const depth = result.depth ?? '-';
    return `${result.algorithm}: ${path} | costo=${cost} | profundidad=${depth} | explorados=${result.explored} | generados=${result.generated}`;
}
main();

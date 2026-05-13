import { SokobanSolver } from '../solver-core';
import { SearchNode, SearchResult } from '../types';

export function searchBreadthFirst(solver: SokobanSolver): SearchResult {
    const queue: SearchNode[] = [solver.createInitialNode()];
    const bestDepth = new Map<string, number>();
    bestDepth.set(solver.serializeState(queue[0].state), 0);

    let pointer = 0;
    let explored = 0;
    let generated = 0;

    while (pointer < queue.length) {
        const node = queue[pointer++];
        explored++;

        if (solver.isGoalState(node.state)) {
            return {
                algorithm: 'BFS',
                path: node.path,
                explored,
                generated,
                cost: node.cost,
                depth: node.depth
            };
        }

        for (const successor of solver.getSuccessors(node.state)) {
            const nextDepth = node.depth + 1;
            const nextKey = solver.serializeState(successor.state);
            const previousDepth = bestDepth.get(nextKey);

            if (previousDepth !== undefined && previousDepth <= nextDepth) {
                continue;
            }

            bestDepth.set(nextKey, nextDepth);
            generated++;
            queue.push({
                state: successor.state,
                path: [...node.path, successor.move],
                cost: node.cost + successor.cost,
                depth: nextDepth
            });
        }
    }

    return {
        algorithm: 'BFS',
        path: null,
        explored,
        generated,
        cost: null,
        depth: null
    };
}

import { SokobanSolver } from '../solver-core';
import { SearchNode, SearchResult } from '../types';

export function searchDepthFirst(solver: SokobanSolver): SearchResult {
    const stack: SearchNode[] = [solver.createInitialNode()];
    const bestDepth = new Map<string, number>();
    let explored = 0;
    let generated = 0;

    while (stack.length > 0) {
        const node = stack.pop() as SearchNode;
        const key = solver.serializeState(node.state);
        const previousDepth = bestDepth.get(key);

        if (previousDepth !== undefined && previousDepth <= node.depth) {
            continue;
        }

        bestDepth.set(key, node.depth);
        explored++;

        if (solver.isGoalState(node.state)) {
            return {
                algorithm: 'DFS',
                path: node.path,
                explored,
                generated,
                cost: node.cost,
                depth: node.depth
            };
        }

        const successors = solver.getSuccessors(node.state);

        for (let i = successors.length - 1; i >= 0; i--) {
            const successor = successors[i];
            generated++;
            stack.push({
                state: successor.state,
                path: [...node.path, successor.move],
                cost: node.cost + successor.cost,
                depth: node.depth + 1
            });
        }
    }

    return {
        algorithm: 'DFS',
        path: null,
        explored,
        generated,
        cost: null,
        depth: null
    };
}

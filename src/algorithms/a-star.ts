import { PriorityQueue } from '../priority-queue';
import { SokobanSolver } from '../solver-core';
import { SearchNode, SearchResult } from '../types';

export function searchAStar(solver: SokobanSolver): SearchResult {
    const frontier = new PriorityQueue<SearchNode>();
    const initialNode = solver.createInitialNode();
    const initialScore = solver.evaluateState(initialNode.state);
    const bestCost = new Map<string, number>();

    frontier.push(initialNode, initialScore.boxScore);
    bestCost.set(solver.serializeState(initialNode.state), 0);

    let explored = 0;
    let generated = 0;

    while (frontier.size > 0) {
        const node = frontier.pop() as SearchNode;
        const key = solver.serializeState(node.state);
        const knownCost = bestCost.get(key);

        if (knownCost !== undefined && node.cost > knownCost) {
            continue;
        }

        explored++;

        if (solver.isGoalState(node.state)) {
            return {
                algorithm: 'A*',
                path: node.path,
                explored,
                generated,
                cost: node.cost,
                depth: node.depth
            };
        }

        for (const successor of solver.getSuccessors(node.state)) {
            const nextNode: SearchNode = {
                state: successor.state,
                path: [...node.path, successor.move],
                cost: node.cost + successor.cost,
                depth: node.depth + 1
            };
            const heuristic = solver.evaluateState(nextNode.state);

            if (!Number.isFinite(heuristic.boxScore)) {
                continue;
            }

            const nextKey = solver.serializeState(nextNode.state);
            const previousBest = bestCost.get(nextKey);

            if (previousBest !== undefined && previousBest <= nextNode.cost) {
                continue;
            }

            bestCost.set(nextKey, nextNode.cost);
            generated++;
            frontier.push(nextNode, nextNode.cost + heuristic.boxScore);
        }
    }

    return {
        algorithm: 'A*',
        path: null,
        explored,
        generated,
        cost: null,
        depth: null
    };
}

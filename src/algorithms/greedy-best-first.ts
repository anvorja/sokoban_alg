import { PriorityQueue } from '../priority-queue';
import { SokobanSolver } from '../solver-core';
import { SearchNode, SearchResult } from '../types';

export function searchGreedyBestFirst(solver: SokobanSolver): SearchResult {
    const frontier = new PriorityQueue<SearchNode>();
    const initialNode = solver.createInitialNode();
    const initialHeuristic = solver.evaluateState(initialNode.state);
    const bestPriority = new Map<string, number>();

    frontier.push(initialNode, initialHeuristic.total);
    bestPriority.set(solver.serializeState(initialNode.state), initialHeuristic.total);

    let explored = 0;
    let generated = 0;

    while (frontier.size > 0) {
        const node = frontier.pop() as SearchNode;
        const key = solver.serializeState(node.state);
        explored++;

        if (solver.isGoalState(node.state)) {
            return {
                algorithm: 'Greedy',
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

            if (!Number.isFinite(heuristic.total)) {
                continue;
            }

            const nextKey = solver.serializeState(nextNode.state);
            const previousPriority = bestPriority.get(nextKey);

            if (previousPriority !== undefined && previousPriority <= heuristic.total) {
                continue;
            }

            bestPriority.set(nextKey, heuristic.total);
            generated++;
            frontier.push(nextNode, heuristic.total);
        }
    }

    return {
        algorithm: 'Greedy',
        path: null,
        explored,
        generated,
        cost: null,
        depth: null
    };
}

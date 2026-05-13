import { SokobanSolver } from '../solver-core';
import { SearchNode, SearchResult } from '../types';

interface DepthLimitedResult {
    found: SearchNode | null;
    cutoff: boolean;
}

export function searchIterativeDeepening(solver: SokobanSolver): SearchResult {
    let explored = 0;
    let generated = 0;

    for (let limit = 0; ; limit++) {
        const pathKeys = new Set<string>();
        const bestDepth = new Map<string, number>();
        const result = depthLimitedSearch(solver, solver.createInitialNode(), limit, pathKeys, bestDepth, {
            exploredRef: () => explored++,
            generatedRef: () => generated++
        });

        if (result.found) {
            return {
                algorithm: 'IDS',
                path: result.found.path,
                explored,
                generated,
                cost: result.found.cost,
                depth: result.found.depth
            };
        }

        if (!result.cutoff) {
            return {
                algorithm: 'IDS',
                path: null,
                explored,
                generated,
                cost: null,
                depth: null
            };
        }
    }
}

function depthLimitedSearch(
    solver: SokobanSolver,
    node: SearchNode,
    limit: number,
    pathKeys: Set<string>,
    bestDepth: Map<string, number>,
    counters: {
        exploredRef: () => void;
        generatedRef: () => void;
    }
): DepthLimitedResult {
    const key = solver.serializeState(node.state);
    const previousDepth = bestDepth.get(key);

    if (previousDepth !== undefined && previousDepth <= node.depth) {
        return { found: null, cutoff: false };
    }

    bestDepth.set(key, node.depth);
    counters.exploredRef();

    if (solver.isGoalState(node.state)) {
        return { found: node, cutoff: false };
    }

    if (node.depth === limit) {
        return { found: null, cutoff: true };
    }

    pathKeys.add(key);
    let cutoff = false;

    for (const successor of solver.getSuccessors(node.state)) {
        const nextNode: SearchNode = {
            state: successor.state,
            path: [...node.path, successor.move],
            cost: node.cost + successor.cost,
            depth: node.depth + 1
        };
        const nextKey = solver.serializeState(nextNode.state);

        if (pathKeys.has(nextKey)) {
            continue;
        }

        counters.generatedRef();
        const result = depthLimitedSearch(solver, nextNode, limit, pathKeys, bestDepth, counters);

        if (result.found) {
            pathKeys.delete(key);
            return result;
        }

        if (result.cutoff) {
            cutoff = true;
        }
    }

    pathKeys.delete(key);
    return { found: null, cutoff };
}

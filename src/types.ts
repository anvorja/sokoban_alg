export type MoveLabel = 'U' | 'D' | 'L' | 'R';

export interface Direction {
    label: MoveLabel;
    dx: number;
    dy: number;
}

export interface ParsedLevel {
    width: number;
    height: number;
    walls: Set<number>;
    goals: Set<number>;
    player: number;
    boxes: Set<number>;
}

export interface State {
    player: number;
    boxes: Set<number>;
}

export interface Successor {
    state: State;
    move: MoveLabel;
    pushed: boolean;
    cost: number;
}

export interface SearchNode {
    state: State;
    path: MoveLabel[];
    cost: number;
    depth: number;
}

export interface SearchResult {
    algorithm: string;
    path: MoveLabel[] | null;
    explored: number;
    generated: number;
    cost: number | null;
    depth: number | null;
}

export interface HeuristicScore {
    boxScore: number;
    playerScore: number;
    total: number;
}

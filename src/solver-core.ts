import { DIRECTIONS } from './constants';
import { HeuristicScore, ParsedLevel, SearchNode, State, Successor } from './types';

export class SokobanSolver {
    public readonly width: number;
    public readonly height: number;
    public readonly walls: ReadonlySet<number>;
    public readonly goals: ReadonlySet<number>;
    public readonly initialState: State;

    private readonly deadSquares: ReadonlySet<number>;
    private readonly minGoalPushDistance: ReadonlyMap<number, number>;

    constructor(level: ParsedLevel) {
        this.width = level.width;
        this.height = level.height;
        this.walls = level.walls;
        this.goals = level.goals;
        this.initialState = {
            player: level.player,
            boxes: new Set(level.boxes)
        };

        const { distances, deadSquares } = this.precomputeGoalDistances();
        this.minGoalPushDistance = distances;
        this.deadSquares = deadSquares;
    }

    public serializeState(state: State): string {
        const boxes = [...state.boxes].sort((a, b) => a - b);
        return `P${state.player}|B${boxes.join(',')}`;
    }

    public isGoalState(state: State): boolean {
        if (state.boxes.size !== this.goals.size) {
            return false;
        }

        for (const box of state.boxes) {
            if (!this.goals.has(box)) {
                return false;
            }
        }

        return true;
    }

    public getSuccessors(state: State): Successor[] {
        const successors: Successor[] = [];

        for (const direction of DIRECTIONS) {
            const next = this.step(state.player, direction.dx, direction.dy);

            if (next === null || this.walls.has(next)) {
                continue;
            }

            if (state.boxes.has(next)) {
                const beyond = this.step(next, direction.dx, direction.dy);

                if (beyond === null || this.walls.has(beyond) || state.boxes.has(beyond)) {
                    continue;
                }

                const movedBoxes = new Set(state.boxes);
                movedBoxes.delete(next);
                movedBoxes.add(beyond);

                const candidate: State = {
                    player: next,
                    boxes: movedBoxes
                };

                if (this.isDeadlock(candidate)) {
                    continue;
                }

                successors.push({
                    state: candidate,
                    move: direction.label,
                    pushed: true,
                    cost: 1
                });
            } else {
                successors.push({
                    state: {
                        player: next,
                        boxes: state.boxes
                    },
                    move: direction.label,
                    pushed: false,
                    cost: 1
                });
            }
        }

        return successors;
    }

    public evaluateState(state: State): HeuristicScore {
        let boxScore = 0;
        let playerScore = Number.POSITIVE_INFINITY;

        for (const box of state.boxes) {
            const boxDistance = this.minGoalPushDistance.get(box);
            if (boxDistance === undefined) {
                return {
                    boxScore: Number.POSITIVE_INFINITY,
                    playerScore: Number.POSITIVE_INFINITY,
                    total: Number.POSITIVE_INFINITY
                };
            }

            boxScore += boxDistance;
            playerScore = Math.min(playerScore, this.manhattan(state.player, box));
        }

        if (!Number.isFinite(playerScore)) {
            playerScore = 0;
        }

        return {
            boxScore,
            playerScore,
            total: boxScore + playerScore
        };
    }

    public createInitialNode(): SearchNode {
        return {
            state: {
                player: this.initialState.player,
                boxes: new Set(this.initialState.boxes)
            },
            path: [],
            cost: 0,
            depth: 0
        };
    }

    private precomputeGoalDistances(): {
        distances: Map<number, number>;
        deadSquares: Set<number>;
    } {
        const distances = new Map<number, number>();

        for (const goal of this.goals) {
            const queue: number[] = [goal];
            const localDistances = new Map<number, number>([[goal, 0]]);
            let pointer = 0;

            while (pointer < queue.length) {
                const current = queue[pointer++];
                const currentDistance = localDistances.get(current) ?? 0;

                for (const direction of DIRECTIONS) {
                    const previousBox = this.step(current, -direction.dx, -direction.dy);
                    const playerStand = this.step(previousBox ?? -1, -direction.dx, -direction.dy);

                    if (previousBox === null || playerStand === null) {
                        continue;
                    }

                    if (this.walls.has(previousBox) || this.walls.has(playerStand)) {
                        continue;
                    }

                    if (localDistances.has(previousBox)) {
                        continue;
                    }

                    localDistances.set(previousBox, currentDistance + 1);
                    queue.push(previousBox);
                }
            }

            for (const [cell, distance] of localDistances.entries()) {
                const best = distances.get(cell);
                if (best === undefined || distance < best) {
                    distances.set(cell, distance);
                }
            }
        }

        const deadSquares = new Set<number>();

        for (let position = 0; position < this.width * this.height; position++) {
            if (this.walls.has(position) || this.goals.has(position)) {
                continue;
            }

            if (!distances.has(position)) {
                deadSquares.add(position);
            }
        }

        return { distances, deadSquares };
    }

    private isDeadlock(state: State): boolean {
        for (const box of state.boxes) {
            if (this.goals.has(box)) {
                continue;
            }

            if (this.deadSquares.has(box)) {
                return true;
            }

            if (this.isCornerDeadlock(box)) {
                return true;
            }
        }

        return this.hasTwoByTwoDeadlock(state.boxes);
    }

    private isCornerDeadlock(box: number): boolean {
        const up = this.step(box, 0, -1);
        const down = this.step(box, 0, 1);
        const left = this.step(box, -1, 0);
        const right = this.step(box, 1, 0);

        const blockedUp = this.isWall(up);
        const blockedDown = this.isWall(down);
        const blockedLeft = this.isWall(left);
        const blockedRight = this.isWall(right);

        return (
            (blockedUp && blockedLeft) ||
            (blockedUp && blockedRight) ||
            (blockedDown && blockedLeft) ||
            (blockedDown && blockedRight)
        );
    }

    private hasTwoByTwoDeadlock(boxes: ReadonlySet<number>): boolean {
        for (let y = 0; y < this.height - 1; y++) {
            for (let x = 0; x < this.width - 1; x++) {
                const topLeft = this.toIndex(x, y);
                const topRight = this.toIndex(x + 1, y);
                const bottomLeft = this.toIndex(x, y + 1);
                const bottomRight = this.toIndex(x + 1, y + 1);
                const square = [topLeft, topRight, bottomLeft, bottomRight];

                if (!square.every((cell) => this.walls.has(cell) || boxes.has(cell))) {
                    continue;
                }

                const hasOffGoalBox = square.some((cell) => boxes.has(cell) && !this.goals.has(cell));
                const hasGoal = square.some((cell) => this.goals.has(cell));

                if (hasOffGoalBox && !hasGoal) {
                    return true;
                }
            }
        }

        return false;
    }

    private isBlocked(position: number | null, boxes: ReadonlySet<number>): boolean {
        return position === null || this.walls.has(position) || boxes.has(position);
    }

    private isWall(position: number | null): boolean {
        return position === null || this.walls.has(position);
    }

    private step(position: number, dx: number, dy: number): number | null {
        if (position < 0) {
            return null;
        }

        const x = position % this.width;
        const y = Math.floor(position / this.width);
        const nextX = x + dx;
        const nextY = y + dy;

        if (nextX < 0 || nextY < 0 || nextX >= this.width || nextY >= this.height) {
            return null;
        }

        return this.toIndex(nextX, nextY);
    }

    private manhattan(from: number, to: number): number {
        const fromX = from % this.width;
        const fromY = Math.floor(from / this.width);
        const toX = to % this.width;
        const toY = Math.floor(to / this.width);

        return Math.abs(fromX - toX) + Math.abs(fromY - toY);
    }

    private toIndex(x: number, y: number): number {
        return y * this.width + x;
    }
}

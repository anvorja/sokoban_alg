export class PriorityQueue<T> {
    private readonly heap: Array<{ item: T; priority: number }> = [];

    public push(item: T, priority: number): void {
        this.heap.push({ item, priority });
        this.bubbleUp(this.heap.length - 1);
    }

    public pop(): T | undefined {
        if (this.heap.length === 0) {
            return undefined;
        }

        const root = this.heap[0].item;
        const last = this.heap.pop();

        if (last && this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }

        return root;
    }

    public get size(): number {
        return this.heap.length;
    }

    private bubbleUp(index: number): void {
        let current = index;

        while (current > 0) {
            const parent = Math.floor((current - 1) / 2);

            if (this.heap[parent].priority <= this.heap[current].priority) {
                break;
            }

            [this.heap[parent], this.heap[current]] = [this.heap[current], this.heap[parent]];
            current = parent;
        }
    }

    private bubbleDown(index: number): void {
        let current = index;

        while (true) {
            const left = current * 2 + 1;
            const right = left + 1;
            let smallest = current;

            if (left < this.heap.length && this.heap[left].priority < this.heap[smallest].priority) {
                smallest = left;
            }

            if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
                smallest = right;
            }

            if (smallest === current) {
                break;
            }

            [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
            current = smallest;
        }
    }
}

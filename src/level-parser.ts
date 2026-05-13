import { ParsedLevel } from './types';

const COORDINATE_PATTERN = /^\d+,\d+$/;

export function parseLevel(lines: string[]): ParsedLevel {
    const rows: string[] = [];
    const coordinates: string[] = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.length === 0) {
            continue;
        }

        if (COORDINATE_PATTERN.test(line)) {
            coordinates.push(line);
        } else {
            rows.push(line);
        }
    }

    if (rows.length === 0) {
        throw new Error('El archivo no contiene un tablero válido.');
    }

    const width = rows[0].length;
    const height = rows.length;

    for (const row of rows) {
        if (row.length !== width) {
            throw new Error('Todas las filas del tablero deben tener la misma longitud.');
        }
    }

    if (coordinates.length === 0) {
        throw new Error('El archivo debe incluir la posición inicial del jugador.');
    }

    const walls = new Set<number>();
    const goals = new Set<number>();

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = rows[y][x];
            const index = toIndex(x, y, width);

            if (value === 'W') {
                walls.add(index);
            } else if (value === 'X') {
                goals.add(index);
            } else if (value !== '0') {
                throw new Error(`Caracter no soportado en el tablero: "${value}".`);
            }
        }
    }

    const [playerY, playerX] = parseCoordinate(coordinates[0], width, height);
    const player = toIndex(playerX, playerY, width);

    if (walls.has(player)) {
        throw new Error('La posición inicial del jugador no puede estar sobre un muro.');
    }

    const boxes = new Set<number>();

    for (let i = 1; i < coordinates.length; i++) {
        const [boxY, boxX] = parseCoordinate(coordinates[i], width, height);
        const box = toIndex(boxX, boxY, width);

        if (walls.has(box)) {
            throw new Error(`La caja en ${coordinates[i]} no puede estar sobre un muro.`);
        }

        if (box === player) {
            throw new Error(`La caja en ${coordinates[i]} no puede compartir posición con el jugador.`);
        }

        boxes.add(box);
    }

    return {
        width,
        height,
        walls,
        goals,
        player,
        boxes
    };
}

function parseCoordinate(value: string, width: number, height: number): [number, number] {
    const [rawY, rawX] = value.split(',');
    const y = Number.parseInt(rawY, 10);
    const x = Number.parseInt(rawX, 10);

    if (!Number.isInteger(x) || !Number.isInteger(y)) {
        throw new Error(`Coordenada inválida: "${value}".`);
    }

    if (x < 0 || y < 0 || x >= width || y >= height) {
        throw new Error(`Coordenada fuera de rango: "${value}".`);
    }

    return [y, x];
}

function toIndex(x: number, y: number, width: number): number {
    return y * width + x;
}

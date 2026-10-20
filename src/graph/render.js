import { graphLinkPath } from './engine';

const coordinate = (value) => Math.round(value * 100) / 100;

// Geometry is cached independently of hover/selection and viewport changes.
export function linkGeometry(link, style) {
    const d = graphLinkPath(link, coordinate);
    let cachedPoints;
    let cachedLength;
    function sample() {
        const values = d.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi).map(Number);
        const cubic = d.includes(' C ');
        const points = [];
        const steps = cubic ? 24 : link.lane ? 16 : 1;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps,
                u = 1 - t;
            points.push(
                cubic
                    ? {
                          x:
                              u * u * u * values[0] +
                              3 * u * u * t * values[2] +
                              3 * u * t * t * values[4] +
                              t * t * t * values[6],
                          y:
                              u * u * u * values[1] +
                              3 * u * u * t * values[3] +
                              3 * u * t * t * values[5] +
                              t * t * t * values[7],
                      }
                    : {
                          x:
                              u * u * values[0] +
                              2 * u * t * values[2] +
                              t * t * values[4],
                          y:
                              u * u * values[1] +
                              2 * u * t * values[3] +
                              t * t * values[5],
                      },
            );
        }
        return points;
    }
    const color = link.raw.color || style.color;
    const width =
        link.raw.width ??
        (style.widthByValue
            ? Math.min(
                  style.maxWidth,
                  style.width * Math.sqrt(Math.max(0, link.raw.value ?? 1)),
              )
            : style.width);
    const directed = !!(
        link.raw.directed ||
        style.arrows.show ||
        style.arrows.showOnHover
    );
    let arrowD = '';
    if (directed) {
        const values = d.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi).map(Number);
        const x = values.at(-2),
            y = values.at(-1);
        const dx = x - values.at(-4),
            dy = y - values.at(-3);
        const length = Math.hypot(dx, dy) || 1;
        const ux = dx / length,
            uy = dy / length;
        const size = 6 * width;
        const bx = x - ux * size,
            by = y - uy * size;
        arrowD = `M ${coordinate(x)} ${coordinate(y)} L ${coordinate(bx - (uy * size) / 2)} ${coordinate(by + (ux * size) / 2)} L ${coordinate(bx + (uy * size) / 2)} ${coordinate(by - (ux * size) / 2)} Z`;
    }
    return {
        link,
        d,
        arrowD,
        get points() {
            return (cachedPoints ||= sample());
        },
        get length() {
            if (cachedLength === undefined) {
                const points = this.points;
                cachedLength = 0;
                for (let i = 1; i < points.length; i++) {
                    cachedLength += Math.hypot(
                        points[i].x - points[i - 1].x,
                        points[i].y - points[i - 1].y,
                    );
                }
            }
            return cachedLength;
        },
        color,
        width,
        directed,
        key: JSON.stringify([color, width, directed]),
    };
}
export function batchLinks(geometry, predicate = () => true) {
    const groups = new Map();
    for (const item of geometry) {
        if (!predicate(item.link)) continue;
        let group = groups.get(item.key);
        if (!group) {
            group = {
                key: item.key,
                color: item.color,
                width: item.width,
                directed: item.directed,
                paths: [],
                arrows: [],
            };
            groups.set(item.key, group);
        }
        group.paths.push(item.d);
        if (item.arrowD) group.arrows.push(item.arrowD);
    }
    return [...groups.values()].map(({ paths, arrows, ...group }) => ({
        ...group,
        d: paths.join(' '),
        arrowD: arrows.join(' '),
    }));
}
export function circlePath(node) {
    const { x, y, radius: r } = node;
    return `M ${coordinate(x - r)} ${coordinate(y)} a ${coordinate(r)} ${coordinate(r)} 0 1 0 ${coordinate(r * 2)} 0 a ${coordinate(r)} ${coordinate(r)} 0 1 0 ${coordinate(-r * 2)} 0 Z`;
}
export function batchNodes(nodes, predicate = () => true) {
    const groups = new Map();
    for (const node of nodes) {
        if (!predicate(node)) continue;
        if (!groups.has(node.color)) groups.set(node.color, []);
        groups.get(node.color).push(circlePath(node));
    }
    return [...groups].map(([color, paths]) => ({ color, d: paths.join(' ') }));
}
function segmentDistanceSquared(p, a, b) {
    const dx = b.x - a.x,
        dy = b.y - a.y,
        length = dx * dx + dy * dy;
    const t = length
        ? Math.max(
              0,
              Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / length),
          )
        : 0;
    return (p.x - a.x - t * dx) ** 2 + (p.y - a.y - t * dy) ** 2;
}
// Index short edge segments, not entire bounding boxes of long diagonal edges.
// Built lazily on inspection and reused until positions or styles change.
export function createGraphHitIndex(nodes, geometry, cellSize = 48) {
    const nodeCells = new Map(),
        edgeCells = new Map();
    let maxWidth = 0;
    function insert(map, x, y, item) {
        const key = `${x}:${y}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(item);
    }
    for (const n of nodes) {
        for (
            let x = Math.floor((n.x - n.radius) / cellSize);
            x <= Math.floor((n.x + n.radius) / cellSize);
            x++
        )
            for (
                let y = Math.floor((n.y - n.radius) / cellSize);
                y <= Math.floor((n.y + n.radius) / cellSize);
                y++
            )
                insert(nodeCells, x, y, n);
    }
    let edgesReady = false;
    function indexEdges() {
        for (const item of geometry) {
            maxWidth = Math.max(maxWidth, item.width);
            for (let i = 1; i < item.points.length; i++) {
                const a = item.points[i - 1],
                    b = item.points[i],
                    steps = Math.max(
                        1,
                        Math.ceil(
                            Math.max(Math.abs(b.x - a.x), Math.abs(b.y - a.y)) /
                                cellSize,
                        ),
                    );
                const segment = { a, b, item };
                let lastKey;
                for (let j = 0; j <= steps; j++) {
                    const x = Math.floor(
                            (a.x + ((b.x - a.x) * j) / steps) / cellSize,
                        ),
                        y = Math.floor(
                            (a.y + ((b.y - a.y) * j) / steps) / cellSize,
                        ),
                        key = `${x}:${y}`;
                    if (key !== lastKey) insert(edgeCells, x, y, segment);
                    lastKey = key;
                }
            }
        }
        edgesReady = true;
    }
    function nearby(map, p, r) {
        const result = new Set();
        for (
            let x = Math.floor((p.x - r) / cellSize);
            x <= Math.floor((p.x + r) / cellSize);
            x++
        )
            for (
                let y = Math.floor((p.y - r) / cellSize);
                y <= Math.floor((p.y + r) / cellSize);
                y++
            )
                for (const item of map.get(`${x}:${y}`) || []) result.add(item);
        return result;
    }
    return {
        nodeAt(p, tolerance = 0) {
            let hit = null;
            for (const n of nearby(nodeCells, p, tolerance))
                if (
                    (p.x - n.x) ** 2 + (p.y - n.y) ** 2 <=
                        (n.radius + tolerance) ** 2 &&
                    (!hit || n.index > hit.index)
                )
                    hit = n;
            return hit;
        },
        linkAt(p, tolerance = 4) {
            if (!edgesReady) indexEdges();
            let hit = null,
                best = Infinity;
            for (const segment of nearby(
                edgeCells,
                p,
                tolerance + maxWidth / 2,
            )) {
                const distance = segmentDistanceSquared(
                    p,
                    segment.a,
                    segment.b,
                );
                if (
                    distance <= (tolerance + segment.item.width / 2) ** 2 &&
                    distance < best
                ) {
                    best = distance;
                    hit = segment.item.link;
                }
            }
            return hit;
        },
    };
}

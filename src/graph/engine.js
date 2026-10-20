import { palette } from '../lib';

const finite = (v, fallback) => (Number.isFinite(v) ? v : fallback);
export function normalizeGraph(
    dataset,
    previous = new Map(),
    config,
    warn = () => {},
) {
    const nodes = [];
    const byId = new Map();
    const adjacency = new Map();
    const groups = new Map();

    for (const raw of dataset?.nodes || []) {
        if (
            !raw ||
            !['string', 'number'].includes(typeof raw.id) ||
            (typeof raw.id === 'number' && !Number.isFinite(raw.id)) ||
            byId.has(raw.id)
        ) {
            warn('Ignored invalid or duplicate node ID');
            continue;
        }

        const old = previous.get(raw.id);
        const i = nodes.length;
        const angle = i * 2.399963229728653;
        const distance = 20 * Math.sqrt(i);

        if (!groups.has(raw.group)) {
            groups.set(raw.group, groups.size);
        }

        const node = {
            ...raw,
            raw,
            x: old?.x ?? finite(raw.x, Math.cos(angle) * distance),
            y: old?.y ?? finite(raw.y, Math.sin(angle) * distance),
            vx: old?.vx || 0,
            vy: old?.vy || 0,
            pinned: !!raw.fixed || !!old?.userPinned,
            userPinned: old?.userPinned,
            degree: 0,
            index: i,
            groupIndex: groups.get(raw.group),
        };
        nodes.push(node);
        byId.set(raw.id, node);
        adjacency.set(raw.id, new Set());
    }

    const links = [];
    const pairs = new Map();

    for (const raw of dataset?.links || []) {
        const source = byId.get(raw?.source);
        const target = byId.get(raw?.target);

        if (!source || !target) {
            warn('Ignored link referencing an unknown node');
            continue;
        }

        source.degree += 1;
        target.degree += 1;
        adjacency.get(source.id).add(target.id);
        adjacency.get(target.id).add(source.id);

        const a = source.index;
        const b = target.index;
        const key = `${Math.min(a, b)}:${Math.max(a, b)}`;

        const link = {
            raw,
            source,
            target,
            index: links.length,
            strength: Math.min(3, Math.sqrt(Math.max(0, finite(raw.value, 1)))),
            lane: 0,
            direction: a <= b ? 1 : -1,
        };

        if (!pairs.has(key)) {
            pairs.set(key, []);
        }

        pairs.get(key).push(link);
        links.push(link);
    }

    for (const pair of pairs.values())
        pair.forEach((link, i) => {
            link.lane = i - (pair.length - 1) / 2;
            link.selfIndex = i;
        });

    const colors = config.customPalette?.length
        ? config.customPalette
        : palette;

    const cfg = config.style.chart.nodes;
    const weights = nodes.map((n) =>
        Math.max(0, finite(cfg.sizeByDegree ? n.degree : n.value, 0)),
    );
    const max = Math.max(1, ...weights);

    nodes.forEach((n, i) => {
        n.radius = Math.max(
            0.5,
            finite(
                n.raw.radius,
                (cfg.sizeByValue || cfg.sizeByDegree) && weights[i] > 0
                    ? cfg.minRadius +
                          Math.sqrt(weights[i] / max) *
                              (cfg.maxRadius - cfg.minRadius)
                    : cfg.radius,
            ),
        );
        n.groupColor = cfg.colorByGroup
            ? colors[n.groupIndex % colors.length]
            : cfg.color;
        n.color = n.raw.color || n.groupColor || cfg.color;
    });
    return { nodes, links, byId, adjacency };
}

function buildTree(nodes, x, y, size, depth = 0) {
    const tree = { x, y, size, count: nodes.length, cx: 0, cy: 0 };
    if (!nodes.length) return tree;

    for (const n of nodes) {
        tree.cx += n.x;
        tree.cy += n.y;
    }

    tree.cx /= nodes.length;
    tree.cy /= nodes.length;

    if (nodes.length <= 1 || depth >= 20) {
        tree.nodes = nodes;
        return tree;
    }

    const half = size / 2;
    const buckets = [[], [], [], []];

    for (const n of nodes) {
        buckets[(n.x >= x + half ? 1 : 0) + (n.y >= y + half ? 2 : 0)].push(n);
    }

    tree.children = [];

    for (let i = 0; i < 4; i++) {
        if (buckets[i].length)
            tree.children.push(
                buildTree(
                    buckets[i],
                    x + (i % 2) * half,
                    y + (i > 1 ? half : 0),
                    half,
                    depth + 1,
                ),
            );
    }
    return tree;
}

export function tickGraph(graph, cfg, alpha = 1) {
    const { nodes, links } = graph;
    if (!nodes.length) return 0;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let maxRadius = 1;

    for (const n of nodes) {
        minX = Math.min(minX, n.x);
        minY = Math.min(minY, n.y);
        maxX = Math.max(maxX, n.x);
        maxY = Math.max(maxY, n.y);
        maxRadius = Math.max(maxRadius, n.radius);
    }

    const tree = buildTree(
        nodes,
        minX,
        minY,
        Math.max(maxX - minX, maxY - minY, 1) + 1,
    );

    const force = Math.max(0, -cfg.chargeStrength) * alpha * cfg.strength;
    const thetaSquared = cfg.theta * cfg.theta;

    function repel(n, t) {
        if (!t.count) return;
        const dx = n.x - t.cx;
        const dy = n.y - t.cy;
        const d2 = dx * dx + dy * dy + 4;
        const contains =
            n.x >= t.x &&
            n.x <= t.x + t.size &&
            n.y >= t.y &&
            n.y <= t.y + t.size;

        if (!t.nodes && !contains && t.size * t.size < thetaSquared * d2) {
            n.vx += (dx * force * t.count) / d2;
            n.vy += (dy * force * t.count) / d2;
        } else if (t.nodes) {
            for (const other of t.nodes)
                if (other !== n) {
                    const ox = n.x - other.x || 0.01;
                    const oy = n.y - other.y || 0.01;
                    const dd = ox * ox + oy * oy + 4;
                    n.vx += (ox * force) / dd;
                    n.vy += (oy * force) / dd;
                }
        } else {
            for (const child of t.children) {
                repel(n, child);
            }
        }
    }

    const clusters = new Map();

    if (cfg.clusterStrength) {
        for (const n of nodes) {
            const g = clusters.get(n.group) || { x: 0, y: 0, count: 0 };
            g.x += n.x;
            g.y += n.y;
            g.count += 1;
            clusters.set(n.group, g);
        }
    }

    for (const n of nodes) {
        repel(n, tree);
        n.vx -= n.x * cfg.centerStrength * alpha;
        n.vy -= n.y * cfg.centerStrength * alpha;
        const g = clusters.get(n.group);
        if (g) {
            n.vx += (g.x / g.count - n.x) * cfg.clusterStrength * alpha;
            n.vy += (g.y / g.count - n.y) * cfg.clusterStrength * alpha;
        }
    }

    for (const l of links) {
        if (l.source === l.target) continue;
        const dx = l.target.x - l.source.x;
        const dy = l.target.y - l.source.y;
        const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f =
            ((d - cfg.linkDistance) *
                cfg.linkStrength *
                l.strength *
                alpha *
                cfg.strength) /
            2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        // A hub should respond to the average pull of its neighbors, rather
        // than becoming a progressively stiffer spring as its degree grows.
        const sourceDegree = Math.max(1, l.source.degree);
        const targetDegree = Math.max(1, l.target.degree);
        l.source.vx += fx / sourceDegree;
        l.source.vy += fy / sourceDegree;
        l.target.vx -= fx / targetDegree;
        l.target.vy -= fy / targetDegree;
    }

    // A uniform spatial grid limits collision checks to nearby circles.
    const cell = maxRadius * 2 + Math.max(0, cfg.collisionPadding);
    const grid = new Map();

    for (const n of nodes) {
        const gx = Math.floor(n.x / cell);
        const gy = Math.floor(n.y / cell);

        for (let x = gx - 1; x <= gx + 1; x += 1) {
            const column = grid.get(x);
            if (!column) continue;

            for (let y = gy - 1; y <= gy + 1; y += 1) {
                const nearby = column.get(y);
                if (!nearby) continue;

                for (const other of nearby) {
                    const dx = n.x - other.x || 0.01;
                    const dy = n.y - other.y || 0.01;
                    const d2 = dx * dx + dy * dy;
                    const min = n.radius + other.radius + cfg.collisionPadding;

                    if (d2 < min * min) {
                        const d = Math.sqrt(d2);
                        const f = ((min - d) / d) * 0.5;
                        n.vx += dx * f;
                        n.vy += dy * f;
                        other.vx -= dx * f;
                        other.vy -= dy * f;
                    }
                }
            }
        }

        let column = grid.get(gx);
        if (!column) {
            grid.set(gx, (column = new Map()));
        }

        let bucket = column.get(gy);
        if (!bucket) {
            column.set(gy, (bucket = []));
        }
        bucket.push(n);
    }

    // Strong centering needs matching damping. Implicit damping remains
    // stable for large strengths; leave the usual weak-centering range intact.
    const stiffness = Math.max(0, cfg.centerStrength * alpha - 0.05);
    const damping = 1 + cfg.friction * (stiffness + 2 * Math.sqrt(stiffness));
    let energy = 0;
    for (const n of nodes) {
        if (n.pinned) {
            n.vx = n.vy = 0;
            continue;
        }

        n.vx = Math.max(-30, Math.min(30, (n.vx * cfg.friction) / damping));
        n.vy = Math.max(-30, Math.min(30, (n.vy * cfg.friction) / damping));
        n.x += n.vx;
        n.y += n.vy;
        energy += n.vx * n.vx + n.vy * n.vy;
    }
    return energy / nodes.length;
}

export function graphLinkPath(link, format = (value) => value) {
    const point = (x, y) => `${format(x)} ${format(y)}`;
    const { source: s, target: t } = link;

    if (s === t) {
        const r = s.radius + 16 + (link.selfIndex || 0) * 12;
        const anchor = s.radius / Math.SQRT2;
        return `M ${point(s.x - anchor, s.y - anchor)} C ${point(s.x - r * 2, s.y - r * 3)} ${point(s.x + r * 2, s.y - r * 3)} ${point(s.x + anchor, s.y - anchor)}`;
    }

    const dx = t.x - s.x;
    const dy = t.y - s.y;
    const d = Math.hypot(dx, dy) || 1;
    const bend = link.lane * 24 * link.direction;
    const cx = (s.x + t.x) / 2 - (dy / d) * bend;
    const cy = (s.y + t.y) / 2 + (dx / d) * bend;
    const a = Math.hypot(cx - s.x, cy - s.y) || 1;
    const b = Math.hypot(t.x - cx, t.y - cy) || 1;

    return `M ${point(s.x + ((cx - s.x) / a) * s.radius, s.y + ((cy - s.y) / a) * s.radius)} Q ${point(cx, cy)} ${point(t.x - ((t.x - cx) / b) * t.radius, t.y - ((t.y - cy) / b) * t.radius)}`;
}

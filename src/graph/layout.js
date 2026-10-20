import { tickGraph } from './engine';

// Identical previews share initial force work, never mutable interaction state.
const jobs = new Map();
const settled = new Map();
const CACHE_LIMIT = 8;
function layoutKey(graph, config) {
    return JSON.stringify([
        config,
        graph.nodes.map((n) => [
            n.x,
            n.y,
            n.vx,
            n.vy,
            n.radius,
            n.pinned,
            n.groupIndex,
        ]),
        graph.links.map((l) => [l.source.index, l.target.index, l.strength]),
    ]);
}
function apply(graph, positions) {
    graph.nodes.forEach((n, i) => {
        [n.x, n.y, n.vx, n.vy] = positions[i];
    });
}
export function prepareGraphLayout(
    graph,
    config,
    complete,
    { eager = false } = {},
) {
    const key = layoutKey(graph, config);
    const cached = settled.get(key);
    if (cached) {
        settled.delete(key);
        settled.set(key, cached);
        apply(graph, cached);
        complete();
        return () => {};
    }
    let job = jobs.get(key);
    let start;
    const listener = { graph, complete };
    if (!job) {
        const nodes = graph.nodes.map((node) => ({ ...node }));
        const simulation = {
            nodes,
            links: graph.links.map((link) => ({
                ...link,
                source: nodes[link.source.index],
                target: nodes[link.target.index],
            })),
        };
        job = {
            graph: simulation,
            config: { ...config },
            listeners: new Set(),
            frame: null,
            iteration: 0,
        };
        jobs.set(key, job);
        const step = () => {
            job.frame = null;
            const started = performance.now();
            let energy = Infinity;
            while (job.iteration < job.config.iterations) {
                energy = tickGraph(
                    job.graph,
                    job.config,
                    Math.max(
                        0.015,
                        1 - job.iteration / Math.max(1, job.config.iterations),
                    ),
                );
                job.iteration++;
                if (
                    (job.iteration > 30 && energy < 0.002) ||
                    performance.now() - started >= 8
                )
                    break;
            }
            if (
                job.iteration >= job.config.iterations ||
                (job.iteration > 30 && energy < 0.002)
            ) {
                const positions = job.graph.nodes.map((n) => [
                    n.x,
                    n.y,
                    n.vx,
                    n.vy,
                ]);
                jobs.delete(key);
                settled.set(key, positions);
                if (settled.size > CACHE_LIMIT)
                    settled.delete(settled.keys().next().value);
                const listeners = [...job.listeners];
                job.listeners.clear();
                for (const entry of listeners) {
                    apply(entry.graph, positions);
                    entry.complete();
                }
            } else job.frame = requestAnimationFrame(step);
        };
        start = step;
    }
    job.listeners.add(listener);
    if (start) {
        if (eager) start();
        else job.frame = requestAnimationFrame(start);
    }
    return () => {
        job.listeners.delete(listener);
        if (!job.listeners.size && jobs.get(key) === job) {
            if (job.frame !== null) cancelAnimationFrame(job.frame);
            jobs.delete(key);
        }
    };
}

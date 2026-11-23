import { tickGraph } from './engine';

const FRAME_BUDGET_MS = 8;

function hasConverged(iteration, energy) {
    return iteration > 30 && energy < 0.002;
}

export function runGraphLayout({
    getGraph,
    getConfig,
    getStepsPerFrame,
    canStep = () => true,
    onProgress,
    onComplete,
    eager = false,
}) {
    let frame = null;
    let iteration = 0;
    let stopped = false;
    const live = getStepsPerFrame !== undefined;

    function step() {
        frame = null;
        if (stopped || !canStep()) return;

        const started = performance.now();
        let energy = live ? 0 : Infinity;
        // Initial work checks convergence every iteration. Live work checks
        // it after the frame batch, and can step once even at zero iterations.
        for (
            let steps = 0;
            live
                ? steps < Math.max(1, getStepsPerFrame())
                : iteration < getConfig().iterations;
            steps++
        ) {
            const config = getConfig();
            const alpha = Math.max(
                0.015,
                1 - iteration / Math.max(1, config.iterations),
            );
            energy = tickGraph(getGraph(), config, alpha);
            iteration++;
            const batchDone = live
                ? iteration >= config.iterations
                : hasConverged(iteration, energy);
            if (batchDone || performance.now() - started >= FRAME_BUDGET_MS)
                break;
        }

        if (
            iteration >= getConfig().iterations ||
            hasConverged(iteration, energy)
        ) {
            stopped = true;
            onComplete();
            return;
        }

        onProgress?.();
        if (!stopped) frame = requestAnimationFrame(step);
    }

    if (eager) step();
    else frame = requestAnimationFrame(step);

    return () => {
        stopped = true;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
    };
}

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
        const simulationConfig = { ...config };
        job = { listeners: new Set(), cancel: null };
        jobs.set(key, job);

        start = () =>
            runGraphLayout({
                getGraph: () => simulation,
                getConfig: () => simulationConfig,
                eager,
                onComplete: () => {
                    const positions = simulation.nodes.map((n) => [
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
                },
            });
    }
    job.listeners.add(listener);
    if (start) job.cancel = start();
    return () => {
        job.listeners.delete(listener);
        if (!job.listeners.size && jobs.get(key) === job) {
            job.cancel();
            jobs.delete(key);
        }
    };
}

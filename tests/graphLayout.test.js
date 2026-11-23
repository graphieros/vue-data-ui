import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { normalizeGraph, tickGraph } from '../src/graph/engine';
import { graphDefaults } from '../src/graph/config';

let frames, layout, runGraphLayout;
beforeEach(async () => {
    vi.resetModules();
    frames = new Map();
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++id, cb);
        return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (key) => frames.delete(key));
    ({ prepareGraphLayout: layout, runGraphLayout } =
        await import('../src/graph/layout'));
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
function graph() {
    return normalizeGraph(
        {
            nodes: [
                { id: 'a', x: -100, y: 0 },
                { id: 'b', x: 100, y: 0 },
            ],
            links: [{ source: 'a', target: 'b' }],
        },
        new Map(),
        graphDefaults,
    );
}
const cfg = { ...graphDefaults.layout, iterations: 2 };
function drain() {
    while (frames.size) stepFrame();
}
function stepFrame() {
    const [key, cb] = frames.entries().next().value;
    frames.delete(key);
    cb();
}
function positions(g) {
    return g.nodes.map(({ x, y, vx, vy }) => [x, y, vx, vy]);
}
it('shares initial work and reuses settled positions without sharing mutable nodes', () => {
    const a = graph(),
        b = graph(),
        doneA = vi.fn(),
        doneB = vi.fn();
    layout(a, cfg, doneA);
    layout(b, cfg, doneB);
    expect(frames.size).toBe(1);
    drain();
    expect(doneA).toHaveBeenCalledOnce();
    expect(doneB).toHaveBeenCalledOnce();
    expect(a.nodes.map((n) => n.x)).toEqual(b.nodes.map((n) => n.x));
    const c = graph(),
        doneC = vi.fn();
    layout(c, cfg, doneC);
    expect(doneC).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    a.nodes[0].x = 12345;
    expect(b.nodes[0].x).toBe(c.nodes[0].x);
    expect(b.nodes[0].x).not.toBe(12345);
});
it('keeps shared work running when its first subscriber leaves', () => {
    const doneA = vi.fn(),
        doneB = vi.fn();
    const cancel = layout(graph(), cfg, doneA);
    layout(graph(), cfg, doneB);
    cancel();
    drain();
    expect(doneA).not.toHaveBeenCalled();
    expect(doneB).toHaveBeenCalledOnce();
});
it('cancels unused work and distinguishes physics and node dimensions', () => {
    const a = graph(),
        b = graph();
    b.nodes[0].radius *= 2;
    const done = vi.fn();
    const cancelA = layout(a, cfg, done);
    const cancelB = layout(b, cfg, done);
    const cancelC = layout(graph(), { ...cfg, chargeStrength: -50 }, done);
    expect(frames.size).toBe(3);
    cancelA();
    cancelB();
    cancelC();
    expect(frames.size).toBe(0);
    expect(done).not.toHaveBeenCalled();
});

it('completes eager initial work synchronously and reuses its cached result', () => {
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const eager = graph();
    const cached = graph();
    const complete = vi.fn();
    layout(eager, cfg, complete, { eager: true });
    expect(complete).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);

    layout(cached, cfg, complete);
    expect(complete).toHaveBeenCalledTimes(2);
    expect(positions(cached)).toEqual(positions(eager));
});

it('publishes live batches with continuous cooling and the current graph', () => {
    vi.spyOn(performance, 'now').mockReturnValue(0);
    const config = { ...cfg, iterations: 5 };
    const initial = graph();
    let current = initial;
    const complete = vi.fn();
    const progress = vi.fn();
    runGraphLayout({
        getGraph: () => current,
        getConfig: () => config,
        getStepsPerFrame: () => 2,
        onProgress: progress,
        onComplete: complete,
    });

    stepFrame();
    const expected = graph();
    tickGraph(expected, config, 1);
    tickGraph(expected, config, 1 - 1 / 5);
    expect(positions(initial)).toEqual(positions(expected));
    expect(progress).toHaveBeenCalledOnce();

    current = graph();
    const replacement = graph();
    for (let i = 2; i < config.iterations; i++) {
        tickGraph(replacement, config, 1 - i / 5);
    }
    drain();
    expect(positions(initial)).toEqual(positions(expected));
    expect(positions(current)).toEqual(positions(replacement));
    expect(progress).toHaveBeenCalledTimes(2);
    expect(complete).toHaveBeenCalledOnce();
});

it('yields when the live frame budget is used and cancels the next batch', () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => (now += 8));
    const config = { ...cfg, iterations: 5 };
    const current = graph();
    const complete = vi.fn();
    const cancel = runGraphLayout({
        getGraph: () => current,
        getConfig: () => config,
        getStepsPerFrame: () => 5,
        onComplete: complete,
    });
    stepFrame();
    const expected = graph();
    tickGraph(expected, config, 1);
    expect(positions(current)).toEqual(positions(expected));
    expect(frames.size).toBe(1);

    cancel();
    expect(frames.size).toBe(0);
    expect(complete).not.toHaveBeenCalled();
});

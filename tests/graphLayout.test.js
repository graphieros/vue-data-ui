import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { normalizeGraph } from '../src/graph/engine';
import { graphDefaults } from '../src/graph/config';

let frames, layout;
beforeEach(async () => {
    vi.resetModules();
    frames = new Map();
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++id, cb);
        return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (key) => frames.delete(key));
    layout = (await import('../src/graph/layout')).prepareGraphLayout;
});
afterEach(() => vi.unstubAllGlobals());
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
    while (frames.size) {
        const [key, cb] = frames.entries().next().value;
        frames.delete(key);
        cb();
    }
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

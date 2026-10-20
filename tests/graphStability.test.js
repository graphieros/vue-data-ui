import { expect, it } from 'vitest';
import { normalizeGraph, tickGraph } from '../src/graph/engine';
import { graphDefaults } from '../src/graph/config';

it.each([0.5, 2, 10])(
    'damps strong centering without oscillation at strength %s',
    (centerStrength) => {
        const graph = normalizeGraph(
            { nodes: [{ id: 'a', x: 100, y: 0 }], links: [] },
            new Map(),
            graphDefaults,
        );
        const cfg = {
            ...graphDefaults.layout,
            centerStrength,
            chargeStrength: 0,
            collisionPadding: 0,
        };
        let previous = 100;
        for (let i = 0; i < 200; i++) {
            tickGraph(graph, cfg, 1);
            expect(graph.nodes[0].x).toBeGreaterThanOrEqual(-0.01);
            expect(graph.nodes[0].x).toBeLessThanOrEqual(previous + 0.01);
            previous = graph.nodes[0].x;
        }
        expect(Math.abs(previous)).toBeLessThan(0.01);
    },
);
it('keeps a high-degree hub stable under strong centering', () => {
    const leaves = Array.from({ length: 80 }, (_, i) => ({
        id: i,
        x: 100 + Math.cos((i * Math.PI * 2) / 80) * 80,
        y: Math.sin((i * Math.PI * 2) / 80) * 80,
        fixed: true,
    }));
    const graph = normalizeGraph(
        {
            nodes: [{ id: 'hub', x: 10, y: 0 }, ...leaves],
            links: leaves.map((n) => ({ source: 'hub', target: n.id })),
        },
        new Map(),
        graphDefaults,
    );
    const cfg = {
        ...graphDefaults.layout,
        centerStrength: 0.5,
        chargeStrength: 0,
        collisionPadding: 0,
        linkDistance: 0,
        linkStrength: 0.3,
    };
    for (let i = 0; i < 200; i++) tickGraph(graph, cfg, 1);
    const before = { x: graph.nodes[0].x, y: graph.nodes[0].y };
    for (let i = 0; i < 20; i++) tickGraph(graph, cfg, 1);
    expect(
        Math.hypot(graph.nodes[0].x - before.x, graph.nodes[0].y - before.y),
    ).toBeLessThan(0.01);
    expect(graph.nodes[0].vx ** 2 + graph.nodes[0].vy ** 2).toBeLessThan(
        0.0001,
    );
});

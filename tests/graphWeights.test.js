import { expect, it } from 'vitest';
import { normalizeGraph, tickGraph } from '../src/graph/engine';
import { linkGeometry } from '../src/graph/render';
import { useConfig } from '../src/useConfig';

it('sizes positive node values independently of link weights and falls back for missing values', () => {
    const config = useConfig().vue_ui_graph;
    Object.assign(config.style.chart.nodes, {
        sizeByValue: true,
        sizeByDegree: false,
        minRadius: 4,
        maxRadius: 24,
        radius: 7,
    });
    const graph = normalizeGraph(
        {
            nodes: [
                { id: 'a', value: 1 },
                { id: 'b', value: 4 },
                { id: 'c' },
                { id: 'd', value: 0 },
                { id: 'e', value: 4, radius: 12 },
            ],
            links: [{ source: 'a', target: 'b', value: 9 }],
        },
        new Map(),
        config,
    );
    expect(graph.nodes.map((node) => node.radius)).toEqual([14, 24, 7, 7, 12]);
    expect(graph.links[0].strength).toBe(3);
});

it('uses degree instead of values when sizeByDegree is enabled', () => {
    const config = useConfig().vue_ui_graph;
    Object.assign(config.style.chart.nodes, {
        sizeByDegree: true,
        minRadius: 4,
        maxRadius: 24,
    });
    const graph = normalizeGraph(
        {
            nodes: [
                { id: 'hub', value: 1 },
                { id: 'a', value: 100 },
                { id: 'b', value: 100 },
            ],
            links: [
                { source: 'hub', target: 'a' },
                { source: 'hub', target: 'b' },
            ],
        },
        new Map(),
        config,
    );
    expect(graph.nodes[0].radius).toBe(24);
    expect(graph.nodes[1].radius).toBeLessThan(24);
});

it('weights link widths independently of node values, with caps and explicit overrides', () => {
    const config = useConfig().vue_ui_graph;
    Object.assign(config.style.chart.links, {
        widthByValue: true,
        width: 2,
        maxWidth: 6,
    });
    const graph = normalizeGraph(
        {
            nodes: [
                { id: 'a', value: 5 },
                { id: 'b', value: 20 },
            ],
            links: [
                { source: 'a', target: 'b', value: 1 },
                { source: 'a', target: 'b', value: 4 },
                { source: 'a', target: 'b', value: 100 },
                { source: 'a', target: 'b' },
                { source: 'a', target: 'b', value: 4, width: 10 },
            ],
        },
        new Map(),
        config,
    );
    expect(
        graph.links.map(
            (link) => linkGeometry(link, config.style.chart.links).width,
        ),
    ).toEqual([2, 4, 6, 2, 10]);
});

it('uses link values to strengthen layout attraction with or without node values', () => {
    for (const nodeValue of [undefined, 10]) {
        const config = useConfig().vue_ui_graph;
        Object.assign(config.layout, {
            chargeStrength: 0,
            centerStrength: 0,
            clusterStrength: 0,
            linkDistance: 80,
        });
        const displacement = (value) => {
            const graph = normalizeGraph(
                {
                    nodes: [
                        { id: 'a', x: 0, y: 0, value: nodeValue },
                        { id: 'b', x: 200, y: 0, value: nodeValue },
                    ],
                    links: [{ source: 'a', target: 'b', value }],
                },
                new Map(),
                config,
            );
            tickGraph(graph, config.layout, 1);
            return graph.nodes[0].x;
        };
        expect(displacement(4)).toBeCloseTo(displacement(1) * 2);
    }
});

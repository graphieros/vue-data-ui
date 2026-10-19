import { expect, it, describe } from 'vitest';
import { normalizeGraph } from '../src/graph/engine';
import { graphDefaults } from '../src/graph/config';
import { denseNetwork } from '../src/graph/examples';
import {
    linkGeometry,
    batchLinks,
    batchNodes,
    createGraphHitIndex,
} from '../src/graph/render';
function prepare(links) {
    const graph = normalizeGraph(
        {
            nodes: [
                { id: 'a', x: 0, y: 0, radius: 6 },
                { id: 'b', x: 100, y: 0, radius: 6 },
                { id: 'c', x: 200, y: 0, radius: 6 },
            ],
            links,
        },
        new Map(),
        graphDefaults,
    );
    const geometry = graph.links.map((l) =>
        linkGeometry(l, graphDefaults.style.chart.links),
    );
    return {
        graph,
        geometry,
        index: createGraphHitIndex(graph.nodes, geometry),
    };
}
describe('batched graph rendering', () => {
    it('includes an arrowhead for every directed edge in a batch', () => {
        const { geometry } = prepare([
            { source: 'a', target: 'b', directed: true },
            { source: 'b', target: 'c', directed: true },
            { source: 'a', target: 'c', directed: true },
            { source: 'a', target: 'c', directed: true },
            { source: 'c', target: 'c', directed: true },
        ]);
        const batches = batchLinks(geometry);
        expect(batches).toHaveLength(1);
        expect(batches[0].arrowD.match(/M /g)).toHaveLength(5);
        expect(batches[0].arrowD).not.toMatch(/NaN|Infinity/);
    });
    it('renders thousands of uniform edges in one path and nodes by color', () => {
        const g = normalizeGraph(denseNetwork(), new Map(), graphDefaults);
        const batches = batchLinks(
            g.links.map((l) =>
                linkGeometry(l, graphDefaults.style.chart.links),
            ),
        );
        expect(batches).toHaveLength(1);
        expect(batches[0].d.match(/M /g)).toHaveLength(g.links.length);
        expect(batchNodes(g.nodes)).toHaveLength(8);
    });
    it('keeps per-link colors, widths, arrows, and scaled widths in separate batches', () => {
        const { graph } = prepare([
            { source: 'a', target: 'b' },
            { source: 'a', target: 'c', color: 'red' },
            { source: 'b', target: 'c', width: 3, directed: true },
        ]);
        const geometry = graph.links.map((l) =>
            linkGeometry(l, {
                ...graphDefaults.style.chart.links,
                widthByValue: true,
            }),
        );
        const groups = batchLinks(geometry);
        expect(groups).toHaveLength(3);
        expect(groups[1].color).toBe('red');
        expect(groups[2]).toMatchObject({ width: 3, directed: true });
    });
    it('batches only the active neighborhood without changing cached geometry', () => {
        const { geometry } = prepare([
            { source: 'a', target: 'b' },
            { source: 'b', target: 'c' },
        ]);
        expect(
            batchLinks(
                geometry,
                (l) => l.source.id === 'a' || l.target.id === 'a',
            )[0].d,
        ).toBe(geometry[0].d);
        expect(batchLinks(geometry)[0].d).toContain(geometry[1].d);
    });
    it('picks nodes and individual edges without DOM hit targets', () => {
        const { graph, index } = prepare([
            { source: 'a', target: 'b' },
            { source: 'b', target: 'c' },
        ]);
        expect(index.nodeAt({ x: 0, y: 0 }).raw.id).toBe('a');
        expect(index.nodeAt({ x: 50, y: 0 })).toBeNull();
        expect(index.linkAt({ x: 50, y: 2 })).toBe(graph.links[0]);
        expect(index.linkAt({ x: 150, y: 2 })).toBe(graph.links[1]);
        expect(index.linkAt({ x: 50, y: 30 })).toBeNull();
    });
    it('picks curved duplicate edges and self loops', () => {
        const { graph, geometry, index } = prepare([
            { source: 'a', target: 'b' },
            { source: 'a', target: 'b' },
            { source: 'a', target: 'a' },
        ]);
        for (const item of geometry) {
            const middle = item.points[Math.floor(item.points.length / 2)];
            expect(index.linkAt(middle, 1)).toBe(item.link);
        }
        expect(graph.links).toHaveLength(3);
    });
});

it('connects straight, curved, and self edges to the exact node boundaries', () => {
    const { graph } = prepare([
        { source: 'a', target: 'b' },
        { source: 'a', target: 'c', directed: true },
        { source: 'a', target: 'c' },
        { source: 'b', target: 'b', directed: true },
    ]);
    for (const arrows of [false, true]) {
        const style = {
            ...graphDefaults.style.chart.links,
            arrows: { show: arrows },
        };
        for (const link of graph.links) {
            const geometry = linkGeometry(link, style);
            const first = geometry.points[0];
            const last = geometry.points[geometry.points.length - 1];
            expect(
                Math.hypot(first.x - link.source.x, first.y - link.source.y),
            ).toBeCloseTo(link.source.radius, 1);
            expect(
                Math.hypot(last.x - link.target.x, last.y - link.target.y),
            ).toBeCloseTo(link.target.radius, 1);
        }
    }
});

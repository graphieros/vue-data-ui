import { describe, expect, it } from 'vitest';
import { createAnnotationViewport } from '../src/utils/annotationViewport';
import { projectAnnotationAnchor } from '../src/utils/annotationAnchors';

const area = { left: 20, top: 10, bottom: 210, width: 400, height: 200 };
const ticks = [
    { value: -10, y: 210, horizontal_x: 20 },
    { value: 30, y: 10, horizontal_x: 420 },
];
const viewport = (options = {}) =>
    createAnnotationViewport({
        enabled: true,
        area,
        range: { start: 0, end: 4 },
        ticks,
        ...options,
    });
const project = (mapping, x, y) => ({
    x: mapping.x.origin + x * mapping.x.unit,
    y: mapping.y.origin + y * mapping.y.unit,
});

describe('categorical annotation viewports', () => {
    it('tracks the same category and value through a zoom and changed Y scale', () => {
        expect(project(viewport(), 2, 10)).toEqual({ x: 270, y: 110 });
        const zoom = viewport({
            range: { start: 2, end: 4 },
            ticks: [
                { value: 0, y: 210 },
                { value: 20, y: 10 },
            ],
        });
        expect(project(zoom, 2, 10)).toEqual({ x: 120, y: 110 });
        expect(project(zoom, 3, 20)).toEqual({ x: 320, y: 10 });
        expect(zoom.clip).toEqual({ x: 20, y: 10, width: 400, height: 200 });
    });

    it('uses endpoint positions for stacklines, centering a single point', () => {
        expect(project(viewport({ middle: false }), 0, 0).x).toBe(20);
        expect(project(viewport({ middle: false }), 3, 0).x).toBe(420);
        expect(
            project(
                viewport({ middle: false, range: { start: 2, end: 3 } }),
                2,
                0,
            ).x,
        ).toBe(220);
    });

    it('tracks time vertically and values horizontally for horizontal stackbars', () => {
        const before = viewport({ horizontal: true });
        const after = viewport({
            horizontal: true,
            range: { start: 2, end: 4 },
        });
        expect(project(before, 10, 2)).toEqual({ x: 220, y: 135 });
        expect(project(after, 10, 2)).toEqual({ x: 220, y: 60 });
    });

    it('retains relative value-axis positions for distributed scales', () => {
        const before = viewport({ ticks: [] });
        const after = viewport({
            ticks: [],
            area: { ...area, height: 100, bottom: 110 },
        });
        expect(project(before, 0, 0.25).y).toBe(160);
        expect(project(after, 0, 0.25).y).toBe(85);
        expect(
            project(viewport({ ticks: [], horizontal: true }), 0.25, 0).x,
        ).toBe(120);
    });

    it('translates a shape without changing its dimensions and preserves zoom motion', () => {
        const shape = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text',
        );
        shape.setAttribute('font-size', '16');
        shape.setAttribute(
            'data-annotation-anchor',
            JSON.stringify({
                x: 2,
                y: 10,
                origin: { x: 270, y: 110 },
                transform: '',
            }),
        );
        const motion = {
            scaleX: 0.5,
            scaleY: 1,
            translateX: 20,
            translateY: 0,
            transition: 'transform 280ms ease',
        };
        projectAnnotationAnchor(
            shape,
            viewport({ range: { start: 2, end: 4 }, motion }),
        );
        expect(shape.getAttribute('transform')).toBe('translate(-190 0)');
        expect(shape.getAttribute('font-size')).toBe('16');
        expect(shape.style.transition).toBe(motion.transition);
    });

    it('disables anchoring for opt-out, absent Cartesian plots and invalid ranges', () => {
        expect(viewport({ enabled: false })).toBeNull();
        expect(viewport({ area: null })).toBeNull();
        expect(viewport({ range: { start: 2, end: 2 } })).toBeNull();
        expect(viewport({ range: { start: NaN, end: 4 } })).toBeNull();
    });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref, nextTick } from 'vue';
import { shallowMount, flushPromises } from '@vue/test-utils';
import { components } from '../stories/fixtures/components';
import { createPanZoomAnnotationViewport } from '../src/utils/annotationViewport';
import {
    captureAnnotationAnchor,
    projectAnnotationAnchor,
} from '../src/utils/annotationAnchors';
import CirclePack from '../src/components/vue-ui-circle-pack.vue';
import Dag from '../src/components/vue-ui-dag.vue';
import Geo from '../src/components/vue-ui-geo.vue';
import Molecule from '../src/components/vue-ui-molecule.vue';
import Treemap from '../src/components/vue-ui-treemap.vue';
import WordCloud from '../src/components/vue-ui-word-cloud.vue';
import Graph from '../src/components/vue-ui-graph.vue';

vi.mock('../src/wordcloud', async (importOriginal) => ({
    ...(await importOriginal()),
    positionWordsAsync: async () => {},
}));

const controls = vi.hoisted(() => ({ viewBox: null }));
vi.mock('../src/usePanZoom', () => ({
    default: (_svg, initial) => {
        const viewBox = ref(initial);
        controls.viewBox = viewBox;
        controls.scale = ref(1);
        return {
            viewBox,
            scale: controls.scale,
            isZoom: ref(false),
            resetZoom() {},
            zoomByFactor() {},
            setInitialViewBox(value) {
                viewBox.value = value;
            },
        };
    },
}));
const mounted = [];
afterEach(() => {
    mounted.splice(0).forEach((wrapper) => wrapper.unmount());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

const cases = [
    ['CirclePack', CirclePack],
    ['Dag', Dag],
    ['Geo', Geo],
    ['Molecule', Molecule],
    ['Treemap', Treemap],
    ['WordCloud', WordCloud],
];

describe('pan/zoom chart annotators', () => {
    it.each(cases)(
        '%s follows its live viewBox and supports opting out',
        async (name, component) => {
            vi.stubGlobal(
                'ResizeObserver',
                class {
                    observe() {}
                    unobserve() {}
                    disconnect() {}
                },
            );
            vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
                {
                    measureText: () => ({
                        width: 20,
                        actualBoundingBoxAscent: 10,
                        actualBoundingBoxDescent: 2,
                    }),
                },
            );
            const fixture = components.find(
                (entry) => entry.name === `VueUi${name}`,
            );
            const config = {
                ...fixture.config,
                userOptions: { annotator: { followZoom: true } },
            };
            const wrapper = shallowMount(component, {
                props: { dataset: fixture.dataset, config },
                global: {
                    stubs: {
                        PenAndPaper: {
                            name: 'PenAndPaper',
                            props: [
                                'followZoom',
                                'annotationViewport',
                                'strokeScale',
                            ],
                            template: '<div />',
                        },
                    },
                },
            });
            mounted.push(wrapper);
            await flushPromises();
            await nextTick();
            const pen = wrapper.findComponent({ name: 'PenAndPaper' });
            expect(pen.props('followZoom')).toBe(true);
            controls.scale.value = 2;
            controls.viewBox.value = { x: 30, y: 40, width: 200, height: 100 };
            await nextTick();
            expect(pen.props('annotationViewport')).toEqual({
                x: { origin: 0, unit: 1 },
                y: { origin: 0, unit: 1 },
                shapeScale: { x: 200, y: 100 },
                clip: { x: 30, y: 40, width: 200, height: 100 },
            });
            await wrapper.setProps({
                config: {
                    ...config,
                    userOptions: { annotator: { followZoom: false } },
                },
            });
            await flushPromises();
            expect(pen.props('followZoom')).toBe(false);
            expect(pen.props('annotationViewport')).toBeNull();
        },
    );
});

it('Graph maps annotations through its camera while keeping their geometry fixed', async () => {
    const wrapper = shallowMount(Graph, {
        props: {
            dataset: {
                nodes: [{ id: 'a', x: 0, y: 0, fixed: true }],
                links: [],
            },
            config: {
                userOptions: { show: false, annotator: { followZoom: true } },
                animation: { enabled: false },
                layout: { iterations: 0 },
                viewport: { initialFit: false },
            },
        },
        global: {
            stubs: {
                PenAndPaper: {
                    name: 'PenAndPaper',
                    props: ['followZoom', 'annotationViewport', 'strokeScale'],
                    template: '<div />',
                },
            },
        },
    });
    mounted.push(wrapper);
    await flushPromises();
    const pen = wrapper.findComponent({ name: 'PenAndPaper' });
    expect(pen.props('followZoom')).toBe(true);
    const before = pen.props('annotationViewport');
    wrapper.vm.zoomIn();
    await nextTick();
    const after = pen.props('annotationViewport');
    expect(after.x.unit).toBeGreaterThan(before.x.unit);
    expect(after.y.unit).toBe(after.x.unit);
    expect(after.shapeScale).toBeUndefined();
});

describe('viewBox annotation geometry', () => {
    it('keeps the arrow tip anchored and its screen size stable through pan, zoom and reset', () => {
        const shape = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'line',
        );
        for (const [name, value] of Object.entries({
            x1: 40,
            y1: 50,
            x2: 80,
            y2: 90,
            'marker-end': 'url(#arrow)',
            'stroke-width': 3,
        }))
            shape.setAttribute(name, value);
        const matrix = {
            inverse() {
                return this;
            },
            multiply() {
                return this;
            },
        };
        const svg = {
            getScreenCTM: () => matrix,
            createSVGPoint: () => ({
                x: 0,
                y: 0,
                matrixTransform() {
                    return this;
                },
            }),
        };
        shape.getScreenCTM = () => matrix;
        const initial = createPanZoomAnnotationViewport(true, {
            x: 0,
            y: 0,
            width: 400,
            height: 200,
        });
        captureAnnotationAnchor(shape, svg, initial);
        const anchor = JSON.parse(shape.getAttribute('data-annotation-anchor'));
        expect(anchor.origin).toEqual({ x: 80, y: 90 });
        expect(anchor.shapeScale).toEqual({ x: 400, y: 200 });
        const zoom = createPanZoomAnnotationViewport(true, {
            x: 30,
            y: 40,
            width: 200,
            height: 100,
        });
        projectAnnotationAnchor(shape, zoom);
        expect(shape.getAttribute('transform')).toBe(
            'translate(80 90) scale(0.5 0.5) translate(-80 -90)',
        );
        expect(shape.getAttribute('stroke-width')).toBe('3');
        // Root-to-screen zoom doubles while shape geometry halves.
        expect((80 - 40) * 0.5 * (400 / zoom.clip.width)).toBe(40);
        projectAnnotationAnchor(shape, initial);
        expect(shape.hasAttribute('transform')).toBe(false);
    });

    it('rejects disabled and degenerate viewBoxes', () => {
        expect(
            createPanZoomAnnotationViewport(false, {
                x: 0,
                y: 0,
                width: 10,
                height: 10,
            }),
        ).toBeNull();
        expect(
            createPanZoomAnnotationViewport(true, {
                x: 0,
                y: 0,
                width: 0,
                height: 10,
            }),
        ).toBeNull();
        expect(createPanZoomAnnotationViewport(true, null)).toBeNull();
    });
});

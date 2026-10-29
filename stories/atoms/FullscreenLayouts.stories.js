import { expect, waitFor } from 'storybook/test';
import { nextTick } from 'vue';
import { page } from '../support/browserPage.js';
import { scenarioRender, runScenario } from '../support/scenario.js';
import { components } from '../fixtures/components.js';

const charts = import.meta.glob('../../src/components/*.vue');
const extraFixtures = {
    VueUiTableHeatmap: {
        wrapperClass: '.vue-ui-table-heatmap',
        dataset: [
            { name: 'One', values: [1, 2, 3] },
            { name: 'Two', values: [3, 4, 5] },
        ],
    },
    VueUiGraph: {
        wrapperClass: '.vue-ui-graph',
        dataset: {
            nodes: [
                { id: 'a', label: 'Alpha' },
                { id: 'b', label: 'Beta' },
            ],
            links: [{ source: 'a', target: 'b' }],
        },
        config: { layout: { seed: 42 } },
    },
};
export default {
    title: 'Utilities/Fullscreen layouts',
    render: scenarioRender,
};

function fullscreenStory(name, native = false) {
    return {
        name: native ? `${name} native fullscreen` : name,
        play: (context) =>
            runScenario(
                context,
                (env) => ({
                    hooks: [],
                    cases: { Fit: () => checkFullscreen(env, name, native) },
                }),
                'Fit',
            ),
    };
}

async function checkFullscreen(env, name, native) {
    const fixture =
        components.find((item) => item.name === name) || extraFixtures[name];
    expect(fixture, `Missing fixture for ${name}`).toBeTruthy();
    const selector = fixture.wrapperClass.split(' ')[0];
    const filenames = {
        VueUiParallelCoordinatePlot: 'vue-ui-parallel-coordinate-plot',
        VueUiHorizontalBar: 'vue-ui-horizontal-bar',
    };
    const filename = filenames[name] || selector.replace(/^\./, '');
    const { default: Chart } =
        await charts[`../../src/components/${filename}.vue`]();
    const { wrapper } = await env.mountSubject(Chart, {
        props: {
            dataset: fixture.dataset,
            config:
                name === 'VueUiHistoryPlot'
                    ? {
                          ...fixture.config,
                          transitions: {
                              enable: true,
                              pauseOnLoad: false,
                              pauseOnDatasetChange: false,
                          },
                      }
                    : name === 'VueUiDag'
                      ? {
                            ...fixture.config,
                            style: {
                                ...fixture.config?.style,
                                chart: {
                                    ...fixture.config?.style?.chart,
                                    backgroundPattern: { show: true },
                                },
                            },
                        }
                      : fixture.config || {},
        },
        slots: { source: 'Source' },
    });
    await waitFor(() =>
        expect(wrapper.findComponent({ name: 'UserOptions' }).exists()).toBe(
            true,
        ),
    );
    const root = wrapper
        .findComponent({ name: 'UserOptions' })
        .props('chartElement');
    expect(root).toBeTruthy();
    const descriptor = Object.getOwnPropertyDescriptor(
        document,
        'fullscreenElement',
    );
    const request = root.requestFullscreen;
    const exit = document.exitFullscreen;
    const viewport = [window.innerWidth, window.innerHeight];
    let fullscreenElement = null;
    let button;
    if (!native) {
        Object.defineProperty(document, 'fullscreenElement', {
            configurable: true,
            get: () => fullscreenElement,
        });
        root.requestFullscreen = async () => {
            fullscreenElement = root;
            document.dispatchEvent(new Event('fullscreenchange'));
        };
        document.exitFullscreen = async () => {
            fullscreenElement = null;
            document.dispatchEvent(new Event('fullscreenchange'));
        };
    } else {
        // A trusted browser click supplies the user activation required by the
        // native API; keep this test button inside the fullscreen top layer.
        button = document.createElement('button');
        button.textContent = 'Test fullscreen';
        button.style.cssText = 'position:fixed;top:0;left:0;z-index:2147483647';
        root.append(button);
        button.onclick = () =>
            wrapper
                .findComponent({ name: 'UserOptions' })
                .vm.$.setupState.toggleFullscreen();
    }
    // Outside Vitest, leave native stories ready for a real user click.
    if (native && !page) return;
    const toggle = () =>
        native
            ? page.elementLocator(button).click()
            : wrapper
                  .findComponent({ name: 'UserOptions' })
                  .vm.$.setupState.toggleFullscreen();
    try {
        for (const [width, height] of [
            [1200, 700],
            [375, 640],
        ]) {
            await page?.viewport(width, height);
            await env.resize(width, height);
            await toggle();
            await nextTick();
            await waitFor(
                () => {
                    expect(document.fullscreenElement).toBe(root);
                    const bounds = root.getBoundingClientRect();
                    expect(bounds.left).toBeCloseTo(0, 0);
                    expect(bounds.top).toBeCloseTo(0, 0);
                    expect(bounds.width).toBeCloseTo(window.innerWidth, 0);
                    expect(bounds.height).toBeCloseTo(window.innerHeight, 0);
                    expect(root.scrollHeight).toBeLessThanOrEqual(
                        root.clientHeight + 1,
                    );
                    expect(root.scrollWidth).toBeLessThanOrEqual(
                        root.clientWidth + 1,
                    );
                    const children =
                        name === 'VueUiGraph'
                            ? [...root.children].filter(
                                  (child) =>
                                      !['absolute', 'fixed'].includes(
                                          getComputedStyle(child).position,
                                      ),
                              )
                            : [
                                  ...root.querySelectorAll(
                                      ':scope > [data-vdui-fullscreen-content]',
                                  ),
                              ];
                    const content = children
                        .map((child) => child.getBoundingClientRect())
                        .filter((rect) => rect.height && rect.width);
                    expect(content.length).toBeGreaterThan(0);
                    for (const rect of content) {
                        expect(rect.left).toBeGreaterThanOrEqual(-1);
                        expect(rect.top).toBeGreaterThanOrEqual(-1);
                        expect(rect.right).toBeLessThanOrEqual(
                            window.innerWidth + 1,
                        );
                        expect(rect.bottom).toBeLessThanOrEqual(
                            window.innerHeight + 1,
                        );
                    }
                    const top = Math.min(...content.map((rect) => rect.top));
                    const bottom = Math.max(
                        ...content.map((rect) => rect.bottom),
                    );
                    expect(
                        Math.abs((top + bottom) / 2 - window.innerHeight / 2),
                    ).toBeLessThan(3);
                },
                { timeout: 5000 },
            );
            if (name === 'VueUiDag') {
                const checkPattern = async () =>
                    waitFor(() => {
                        const svg = root
                            .querySelector('svg.vue-ui-dag-svg')
                            .getBoundingClientRect();
                        const pattern = root
                            .querySelector('[data-cy="dag-background-pattern"]')
                            .getBoundingClientRect();
                        for (const key of ['left', 'top', 'width', 'height'])
                            expect(pattern[key]).toBeCloseTo(svg[key], 0);
                    });
                await checkPattern();
                const state = wrapper.vm.$.setupState;
                const box = { ...state.panZoomViewBox };
                state.panZoomViewBox = {
                    x: box.x + 50,
                    y: box.y - 25,
                    width: box.width * 0.6,
                    height: box.height * 0.6,
                };
                await checkPattern();
                state.panZoomViewBox = box;
            }
            for (const slicer of root.querySelectorAll(
                ':scope > [data-vdui-fullscreen-control][data-cy="slicer"]',
            )) {
                expect(slicer.hasAttribute('data-vdui-fullscreen-visual')).toBe(
                    false,
                );
                expect(getComputedStyle(slicer).zoom).toBe('1');
                const chart = root.querySelector(
                    ':scope > [data-vdui-fullscreen-visual]',
                );
                expect(slicer.getBoundingClientRect().width).toBeCloseTo(
                    slicer.hasAttribute('data-vdui-fullscreen-auto-fit')
                        ? chart.getBoundingClientRect().width
                        : window.innerWidth - 32,
                    0,
                );
            }
            if (name === 'VueUiXy' || name === 'VueUiXyCanvas') {
                const base = wrapper.props('config');
                const canvas = name === 'VueUiXyCanvas';
                const chartConfig = canvas ? base.style?.chart : base.chart;
                const chart = {
                    ...chartConfig,
                    zoom: { ...chartConfig?.zoom, autoFit: true },
                };
                await wrapper.setProps({
                    config: canvas
                        ? { ...base, style: { ...base.style, chart } }
                        : { ...base, chart },
                });
                await waitFor(() => {
                    const slicer = root.querySelector(
                        ':scope > [data-vdui-fullscreen-auto-fit]',
                    );
                    expect(slicer).toBeTruthy();
                    const expected = root
                        .querySelector(':scope > [data-vdui-fullscreen-visual]')
                        .getBoundingClientRect();
                    const actual = slicer.getBoundingClientRect();
                    expect(getComputedStyle(slicer).zoom).toBe('1');
                    expect(actual.left).toBeCloseTo(expected.left, 0);
                    expect(actual.width).toBeCloseTo(expected.width, 0);
                });
            }
            for (const controls of root.querySelectorAll(
                ':scope > .vue-data-ui-zoom-controls',
            )) {
                const bounds = controls.getBoundingClientRect();
                if (!bounds.width || !bounds.height) continue;
                expect(bounds.width).toBeLessThan(window.innerWidth - 32);
                expect((bounds.left + bounds.right) / 2).toBeCloseTo(
                    window.innerWidth / 2,
                    0,
                );
            }
            const panZoomSvg = root.querySelector('svg[data-vdui-pan-zoom]');
            if (panZoomSvg && name !== 'VueUiGraph') {
                await waitFor(() => {
                    const bounds = panZoomSvg.getBoundingClientRect();
                    expect(bounds.width).toBeCloseTo(window.innerWidth - 32, 0);
                    expect(bounds.height).toBeCloseTo(
                        Number.parseFloat(
                            root.style.getPropertyValue(
                                '--vdui-fullscreen-pan-height',
                            ),
                        ),
                        0,
                    );
                });
            }
            if (name === 'VueUiXy' || name === 'VueUiXyCanvas') {
                expect(
                    Number(
                        root.style.getPropertyValue(
                            '--vdui-fullscreen-chrome-scale',
                        ),
                    ),
                ).toBe(1);
                const surrounding = [
                    ...root.querySelectorAll(
                        ':scope > [data-vdui-fullscreen-content]:not([data-vdui-fullscreen-visual])',
                    ),
                ];
                expect(surrounding.length).toBeGreaterThan(0);
                for (const child of surrounding)
                    expect(getComputedStyle(child).zoom).toBe('1');
            }
            if (name === 'VueUiHistoryPlot') {
                await waitFor(() => {
                    const labels = [
                        ...root.querySelectorAll('text.vue-data-ui-transition'),
                    ];
                    expect(labels.length).toBeGreaterThan(0);
                    for (const label of labels)
                        expect(getComputedStyle(label).transitionProperty).toBe(
                            'fill, opacity',
                        );
                });
            }
            if (name === 'VueUiHistoryPlot') {
                const scales = [];
                wrapper.vm.$.setupState.segregate(0);
                for (let frame = 0; frame < 30; frame++) {
                    await new Promise((resolve) =>
                        requestAnimationFrame(resolve),
                    );
                    scales.push(
                        Number(
                            root.style.getPropertyValue(
                                '--vdui-fullscreen-scale',
                            ),
                        ),
                    );
                }
                // A genuine layout change may refit once; animation frames must
                // not keep changing the fullscreen scale after layout settles.
                for (const value of scales.slice(-10))
                    expect(value).toBeCloseTo(scales.at(-1), 4);
                const activeTransitions = [
                    ...root.querySelectorAll('svg'),
                ].flatMap((svg) =>
                    svg
                        .getAnimations({ subtree: true })
                        .filter(
                            (animation) =>
                                animation.constructor.name ===
                                    'CSSTransition' &&
                                animation.playState === 'running',
                        ),
                );
                expect(activeTransitions).toHaveLength(0);
                wrapper.vm.$.setupState.segregate(0);
            }
            if (name === 'VueUiXyCanvas') {
                const state = wrapper.vm.$.setupState;
                const rect = state.canvas.getBoundingClientRect();
                const index = Math.floor(
                    (state.slicer.end - state.slicer.start) / 2,
                );
                state.handleMousemove({
                    clientX:
                        rect.left +
                        ((state.drawingArea.left +
                            state.drawingArea.slot * (index + 0.5)) *
                            rect.width) /
                            state.drawingArea.canvasWidth,
                    clientY:
                        rect.top +
                        ((state.drawingArea.top +
                            state.drawingArea.height / 2) *
                            rect.height) /
                            state.drawingArea.canvasHeight,
                });
                expect(state.tooltipIndex).toBe(index);
                expect(state.dataTooltipSlot.datapoint[0].value).toBe(
                    state.formattedDataset[0].series[index],
                );
            }
            await toggle();
            await nextTick();
            await waitFor(() => expect(document.fullscreenElement).toBeNull());
            await waitFor(() =>
                expect(root.hasAttribute('data-vdui-fullscreen-layout')).toBe(
                    false,
                ),
            );
            expect(
                root.querySelector('[data-vdui-fullscreen-content]'),
            ).toBeNull();
        }
    } finally {
        if (native) {
            if (document.fullscreenElement) await document.exitFullscreen();
            button.remove();
        } else {
            fullscreenElement = null;
            document.dispatchEvent(new Event('fullscreenchange'));
            root.requestFullscreen = request;
            document.exitFullscreen = exit;
            if (descriptor)
                Object.defineProperty(
                    document,
                    'fullscreenElement',
                    descriptor,
                );
            else delete document.fullscreenElement;
        }
        await page?.viewport(...viewport);
    }
}

export const Xy = fullscreenStory('VueUiXy');
export const Canvas = fullscreenStory('VueUiXyCanvas');
export const Donut = fullscreenStory('VueUiDonut');
export const Candlestick = fullscreenStory('VueUiCandlestick');
export const Heatmap = fullscreenStory('VueUiHeatmap');
export const Treemap = fullscreenStory('VueUiTreemap');

export const Hill = fullscreenStory('VueUiHill');

export const Bump = fullscreenStory('VueUiBump');

export const Geo = fullscreenStory('VueUiGeo');

export const Dag = fullscreenStory('VueUiDag');

export const Chord = fullscreenStory('VueUiChord');

export const Ridgeline = fullscreenStory('VueUiRidgeline');

export const World = fullscreenStory('VueUiWorld');

export const Bar3d = fullscreenStory('VueUi3dBar');

export const AgePyramid = fullscreenStory('VueUiAgePyramid');

export const Chestnut = fullscreenStory('VueUiChestnut');

export const DonutEvolution = fullscreenStory('VueUiDonutEvolution');

export const Galaxy = fullscreenStory('VueUiGalaxy');

export const Gauge = fullscreenStory('VueUiGauge');

export const Molecule = fullscreenStory('VueUiMolecule');

export const MoodRadar = fullscreenStory('VueUiMoodRadar');

export const NestedDonuts = fullscreenStory('VueUiNestedDonuts');

export const Onion = fullscreenStory('VueUiOnion');

export const Quadrant = fullscreenStory('VueUiQuadrant');

export const Radar = fullscreenStory('VueUiRadar');

export const RelationCircle = fullscreenStory('VueUiRelationCircle');

export const Rings = fullscreenStory('VueUiRings');

export const Scatter = fullscreenStory('VueUiScatter');

export const TableSparkline = fullscreenStory('VueUiTableSparkline');

export const Thermometer = fullscreenStory('VueUiThermometer');

export const Tiremarks = fullscreenStory('VueUiTiremarks');

export const Waffle = fullscreenStory('VueUiWaffle');

export const Wheel = fullscreenStory('VueUiWheel');

export const QuickChart = fullscreenStory('VueUiQuickChart');

export const StripPlot = fullscreenStory('VueUiStripPlot');

export const Dumbbell = fullscreenStory('VueUiDumbbell');

export const WordCloud = fullscreenStory('VueUiWordCloud');

export const Flow = fullscreenStory('VueUiFlow');

export const CarouselTable = fullscreenStory('VueUiCarouselTable');

export const Stackbar = fullscreenStory('VueUiStackbar');

export const Stackline = fullscreenStory('VueUiStackline');

export const Bullet = fullscreenStory('VueUiBullet');

export const Funnel = fullscreenStory('VueUiFunnel');

export const HistoryPlot = fullscreenStory('VueUiHistoryPlot');

export const CirclePack = fullscreenStory('VueUiCirclePack');

export const ParallelCoordinates = fullscreenStory(
    'VueUiParallelCoordinatePlot',
);

export const TableHeatmap = fullscreenStory('VueUiTableHeatmap');
export const Graph = fullscreenStory('VueUiGraph');
export const NativeXy = fullscreenStory('VueUiXy', true);
export const NativeCanvas = fullscreenStory('VueUiXyCanvas', true);
export const NativeDonut = fullscreenStory('VueUiDonut', true);

export const HorizontalBar = fullscreenStory('VueUiHorizontalBar');

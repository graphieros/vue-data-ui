import { mount } from '@vue/test-utils';
import { beforeEach, afterEach, expect, test, vi } from 'vitest';
import { filterSymlogTicks } from '../src/xyScaleTicks';
import VueUiXy from '../src/components/vue-ui-xy.vue';
import { createVueUiXyState } from '../src/svg/vue-ui-xy/create';
import { renderVueUiXySvg } from '../src/svg/vue-ui-xy/render';

beforeEach(() =>
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    ),
);
afterEach(() => vi.unstubAllGlobals());

const values = [-1000, -10, -1, -0.1, 0, 0.1, 1, 10, 1000];
function assertSpacing(labels, distance) {
    const positions = labels.map((label) => label.y).sort((a, b) => a - b);
    for (let i = 1; i < positions.length; i++)
        expect(positions[i] - positions[i - 1]).toBeGreaterThanOrEqual(
            distance - 1e-8,
        );
}

test('tick selection prioritizes zero and endpoints without mutating the source', () => {
    const ticks = [
        { value: -100, y: 0 },
        { value: -1, y: 45 },
        { value: -0.1, y: 49 },
        { value: 0, y: 50 },
        { value: 0.1, y: 51 },
        { value: 1, y: 55 },
        { value: 100, y: 100 },
    ];
    const original = structuredClone(ticks);
    const filtered = filterSymlogTicks(ticks, 20);
    expect(filtered.map((tick) => tick.value)).toEqual([-100, 0, 100]);
    assertSpacing(filtered, 26);
    expect(ticks).toEqual(original);
    expect(
        filterSymlogTicks(
            ticks.map((tick) => ({ ...tick, y: 100 - tick.y })),
            20,
        ).map((tick) => tick.value),
    ).toEqual([-100, 0, 100]);
    expect(filterSymlogTicks(ticks, 100).map((tick) => tick.value)).toEqual([
        0,
    ]);
});

test.each([false, true])(
    'symlog common and individual ticks respond to height and font size (reverse=%s)',
    async (reverse) => {
        const config = (individual) => ({
            chart: {
                grid: {
                    labels: {
                        yAxis: {
                            scale: 'symlog',
                            reverse,
                            useIndividualScale: individual,
                        },
                    },
                },
            },
        });
        const wrapper = mount(
            { ...VueUiXy, render: () => null },
            {
                props: {
                    dataset: [{ name: 'Values', type: 'line', series: values }],
                    config: config(false),
                },
            },
        );
        try {
            const state = wrapper.vm.$.setupState;
            state.fontSizes.dataLabels = 30;
            state.height = 240;
            const small = state.yLabels;
            expect(small.some((label) => label.value === 0)).toBe(true);
            expect(small.some((label) => Math.abs(label.value) === 0.1)).toBe(
                false,
            );
            assertSpacing(small, 36);
            state.height = 1600;
            expect(state.yLabels.length).toBeGreaterThan(small.length);
            assertSpacing(state.yLabels, 36);
            state.fontSizes.dataLabels = 100;
            assertSpacing(state.yLabels, 106);
            await wrapper.setProps({ config: config(true) });
            state.height = 240;
            state.fontSizes.dataLabels = 30;
            const serie = state.lineSet[0];
            assertSpacing(serie.scaleYLabels, 36);
            expect(serie.scaleYLabels.some((label) => label.value === 0)).toBe(
                true,
            );
            for (const scale of state.allScales)
                assertSpacing(scale.yLabels, 36);
            expect(serie.plots.map((plot) => plot.value)).toEqual(values);
        } finally {
            wrapper.unmount();
        }
    },
);

test.each([false, true])(
    'static symlog labels, tick marks and gridlines share filtered positions (individual=%s)',
    async (individual) => {
        for (const reverse of [false, true]) {
            const state = createVueUiXyState({
                height: 280,
                dataset: [{ name: 'Values', type: 'line', series: values }],
                config: {
                    chart: {
                        grid: {
                            showHorizontalLines: true,
                            labels: {
                                fontSize: 30,
                                yAxis: {
                                    scale: 'symlog',
                                    reverse,
                                    useIndividualScale: individual,
                                    showCrosshairs: true,
                                },
                            },
                        },
                    },
                },
            });
            const svg = await renderVueUiXySvg(state);
            const document = new DOMParser().parseFromString(
                svg,
                'image/svg+xml',
            );
            const labels = [
                ...document.querySelectorAll('[data-cy="axis-y-label"]'),
            ];
            expect(labels.some((label) => label.textContent === '0')).toBe(
                true,
            );
            expect(
                labels.some(
                    (label) =>
                        label.textContent === '0.1' ||
                        label.textContent === '-0.1',
                ),
            ).toBe(false);
            const positions = labels.map((label) => {
                const coordinates = label
                    .getAttribute('transform')
                    .match(/translate\(([^)]+)\)/)[1]
                    .split(/[ ,]+/)
                    .map(Number);
                return { y: coordinates[1] - 10 };
            });
            assertSpacing(positions, 36);
            const ticks = [
                ...document.querySelectorAll('[data-cy="axis-y-tick"]'),
            ].map((tick) => Number(tick.getAttribute('y1')));
            const lines = [
                ...document.querySelectorAll(
                    '[data-cy="xy-grid-horizontal-line"]',
                ),
            ].map((line) => Number(line.getAttribute('y1')));
            expect(ticks).toHaveLength(labels.length);
            for (const position of positions) {
                expect(ticks.some((y) => Math.abs(y - position.y) < 1e-6)).toBe(
                    true,
                );
                expect(lines.some((y) => Math.abs(y - position.y) < 1e-6)).toBe(
                    true,
                );
            }
        }
    },
);

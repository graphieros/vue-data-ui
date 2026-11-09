import { mount } from '@vue/test-utils';
import { expect, test, vi } from 'vitest';
import VueUiDonut from '../src/components/vue-ui-donut.vue';

test.each([true, false])(
    'hidden donut series retain their identity when sorting changes (initial=%s)',
    async (sorted) => {
        const config = (sorted) => ({
            sorted,
            autoSize: false,
            useCssAnimation: false,
            serieToggleAnimation: { show: false },
        });
        const wrapper = mount(
            { ...VueUiDonut, render: () => null },
            {
                props: {
                    dataset: [
                        { name: 'Small', values: [10] },
                        { name: 'Large', values: [100] },
                        { name: 'Medium', values: [50] },
                    ],
                    config: config(sorted),
                },
            },
        );
        try {
            const state = wrapper.vm.$.setupState;
            state.legendSet.find((serie) => serie.name === 'Large').segregate();
            for (const next of [!sorted, sorted, !sorted]) {
                await wrapper.setProps({ config: config(next) });
                expect(
                    state.legendSet
                        .filter((serie) => serie.isSegregated)
                        .map((serie) => serie.name),
                ).toEqual(['Large']);
                expect(state.donutSet.map((serie) => serie.name)).not.toContain(
                    'Large',
                );
                expect(
                    state.mutableSet.find((serie) => serie.name === 'Large')
                        .value,
                ).toBe(0);
            }
            state.legendSet.find((serie) => serie.name === 'Large').segregate();
            expect(state.legendSet.some((serie) => serie.isSegregated)).toBe(
                false,
            );
            expect(
                state.donutSet.find((serie) => serie.name === 'Large').value,
            ).toBe(100);
            expect(
                wrapper
                    .emitted('selectLegend')
                    .at(-1)[0]
                    .map((serie) => serie.name),
            ).toContain('Large');
        } finally {
            wrapper.unmount();
        }
    },
);

test('donut remapping distinguishes duplicate names and keeps multiple hidden series', async () => {
    const config = (sorted) => ({
        sorted,
        autoSize: false,
        useCssAnimation: false,
        serieToggleAnimation: { show: false },
    });
    const wrapper = mount(
        { ...VueUiDonut, render: () => null },
        {
            props: {
                dataset: [10, 100, 50].map((value) => ({
                    name: 'Same',
                    values: [value],
                })),
                config: config(true),
            },
        },
    );
    try {
        const state = wrapper.vm.$.setupState;
        state.legendSet[0].segregate();
        state.legendSet[1].segregate();
        await wrapper.setProps({ config: config(false) });
        expect(
            state.legendSet
                .filter((serie) => serie.isSegregated)
                .map((serie) => serie.value),
        ).toEqual([100, 50]);
        expect(state.donutSet.map((serie) => serie.value)).toEqual([10]);
    } finally {
        wrapper.unmount();
    }
});

test('sorting during a donut legend animation settles the intended series and cancels stale frames', async () => {
    const config = (sorted) => ({
        sorted,
        autoSize: false,
        useCssAnimation: false,
        startAnimation: { show: false },
        serieToggleAnimation: { show: true, durationMs: 500 },
    });
    const wrapper = mount(
        { ...VueUiDonut, render: () => null },
        {
            props: {
                dataset: [
                    { name: 'Small', values: [10] },
                    { name: 'Large', values: [100] },
                    { name: 'Medium', values: [50] },
                ],
                config: config(true),
            },
        },
    );
    const frames = [];
    vi.stubGlobal('requestAnimationFrame', (callback) => {
        frames.push(callback);
        return frames.length;
    });
    try {
        const state = wrapper.vm.$.setupState;
        state.legendSet[0].segregate();
        const hideFrame = frames.find((callback) => callback.name === 'step');
        expect(hideFrame).toBeTruthy();
        await wrapper.setProps({ config: config(false) });
        hideFrame(performance.now() + 1000);
        expect(
            wrapper
                .emitted('selectLegend')
                .at(-1)[0]
                .map((serie) => serie.name),
        ).not.toContain('Large');
        expect(
            state.legendSet
                .filter((serie) => serie.isSegregated)
                .map((serie) => serie.name),
        ).toEqual(['Large']);
        expect(state.isAnimating).toBe(false);
        frames.length = 0;
        state.legendSet.find((serie) => serie.name === 'Large').segregate();
        const restoreFrame = frames.find(
            (callback) => callback.name === 'step',
        );
        expect(restoreFrame).toBeTruthy();
        await wrapper.setProps({ config: config(true) });
        restoreFrame(performance.now() + 1000);
        expect(
            wrapper
                .emitted('selectLegend')
                .at(-1)[0]
                .map((serie) => serie.name),
        ).toContain('Large');
        expect(state.legendSet.some((serie) => serie.isSegregated)).toBe(false);
        expect(
            state.donutSet.find((serie) => serie.name === 'Large').value,
        ).toBe(100);
    } finally {
        wrapper.unmount();
        vi.unstubAllGlobals();
    }
});

test('can switch between descending values and dataset order without mutating the dataset', async () => {
    const dataset = [
        { name: 'Small', values: [5, 5] },
        { name: 'Large', values: [60, 40] },
        { name: 'Medium', values: [25, 25] },
    ];
    const originalOrder = dataset.map((serie) => serie.name);
    // Exercise component setup without jsdom's missing SVG geometry APIs.
    const wrapper = mount(
        { ...VueUiDonut, render: () => null },
        {
            props: { dataset, config: { autoSize: false } },
        },
    );

    try {
        const names = () => wrapper.vm.getData().map((serie) => serie.name);
        expect(names()).toEqual(['Large', 'Medium', 'Small']);
        expect(dataset.map((serie) => serie.name)).toEqual(originalOrder);

        await wrapper.setProps({ config: { autoSize: false, sorted: false } });
        expect(names()).toEqual(originalOrder);

        await wrapper.setProps({ config: { autoSize: false, sorted: true } });
        expect(names()).toEqual(['Large', 'Medium', 'Small']);
        expect(dataset.map((serie) => serie.name)).toEqual(originalOrder);
    } finally {
        wrapper.unmount();
    }
});

test.each([true, false])(
    'keeps legend order, colors and toggles aligned with arcs (sorted=%s)',
    (sorted) => {
        const dataset = [
            { name: 'Small', values: [10] },
            { name: 'Large', values: [100], color: '#123456' },
            { name: 'Medium', values: [50] },
        ];
        const wrapper = mount(
            { ...VueUiDonut, render: () => null },
            {
                props: {
                    dataset,
                    config: {
                        sorted,
                        autoSize: false,
                        customPalette: ['#ff0000', '#00ff00', '#0000ff'],
                        useCssAnimation: false,
                        serieToggleAnimation: { show: false },
                    },
                },
            },
        );

        try {
            const legend = wrapper.vm.$.setupState.legendSet;
            const series = wrapper.vm.getData();
            expect(
                legend.map(({ name, color, value }) => ({
                    name,
                    color,
                    value,
                })),
            ).toEqual(series);
            expect(legend.map((item) => item.patternIndex)).toEqual([0, 1, 2]);
            expect(legend.map((item) => item.proportion)).toEqual(
                series.map((item) => item.value / 160),
            );

            legend[0].segregate();
            const emitted = wrapper.emitted('selectLegend').at(-1)[0];
            expect(emitted.map((item) => item.name)).toEqual(
                series.slice(1).map((item) => item.name),
            );
            expect(wrapper.vm.$.setupState.legendSet[0].isSegregated).toBe(
                true,
            );
        } finally {
            wrapper.unmount();
        }
    },
);

test('single-series polar click emits index zero', async () => {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    );
    const wrapper = mount(VueUiDonut, {
        props: {
            dataset: [{ name: 'Only series', values: [10] }],
            config: {
                type: 'polar',
                autoSize: false,
                startAnimation: { show: false },
                userOptions: { show: false },
                style: { chart: { legend: { show: false } } },
            },
        },
    });
    try {
        await wrapper.get('[data-cy="tooltip-trap"]').trigger('click');
        expect(wrapper.emitted('selectDatapoint').at(-1)[0]).toMatchObject({
            index: 0,
            datapoint: { name: 'Only series', value: 10 },
        });
    } finally {
        wrapper.unmount();
        vi.unstubAllGlobals();
    }
});

test('unmount invalidates an in-flight legend animation', () => {
    const wrapper = mount(
        { ...VueUiDonut, render: () => null },
        {
            props: {
                dataset: [
                    { name: 'A', values: [10] },
                    { name: 'B', values: [30] },
                ],
                config: {
                    autoSize: false,
                    startAnimation: { show: false },
                    serieToggleAnimation: { show: true, durationMs: 100 },
                },
            },
        },
    );
    const frames = [];
    vi.stubGlobal('requestAnimationFrame', (callback) => {
        frames.push(callback);
        return frames.length;
    });
    try {
        wrapper.vm.hideSeries('B');
        const step = frames.find((callback) => callback.name === 'step');
        expect(step).toBeTypeOf('function');
        wrapper.unmount();
        step(performance.now() + 1000);
        expect(wrapper.emitted('selectLegend')).toBeUndefined();
    } finally {
        vi.unstubAllGlobals();
    }
});

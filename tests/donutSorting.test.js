import { mount } from '@vue/test-utils';
import { expect, test } from 'vitest';
import VueUiDonut from '../src/components/vue-ui-donut.vue';

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

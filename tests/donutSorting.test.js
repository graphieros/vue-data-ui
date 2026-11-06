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

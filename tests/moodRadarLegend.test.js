import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import MoodRadar from '../src/components/vue-ui-mood-radar.vue';

let wrapper;
afterEach(async () => {
    await vi.dynamicImportSettled();
    await flushPromises();
    wrapper?.unmount();
    vi.restoreAllMocks();
});
async function chart() {
    const datapointClick = vi.fn();
    wrapper = mount(MoodRadar, {
        attachTo: document.body,
        props: {
            dataset: { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 },
            config: {
                responsive: false,
                userOptions: { show: false, buttons: { table: false } },
                events: { datapointClick },
            },
        },
        global: {
            stubs: { UserOptions: true, PackageVersion: true, BaseIcon: true },
        },
    });
    await flushPromises();
    const items = wrapper.findAll(
        '[data-cy="mood-radar-legend"] .vue-data-ui-legend-item',
    );
    expect(items).toHaveLength(5);
    return { items, state: wrapper.vm.$.setupState, datapointClick };
}

test('focusing then clicking a legend label selects once, and subsequent clicks toggle', async () => {
    const { items, state, datapointClick } = await chart();
    items[0].element.focus();
    await nextTick();
    await items[0].find('span').trigger('click');
    expect(state.selectedKey).toBe('5');
    expect(datapointClick).toHaveBeenCalledTimes(1);
    expect(datapointClick).toHaveBeenLastCalledWith({
        datapoint: expect.objectContaining({ key: '5', value: 50, index: 4 }),
        seriesIndex: 4,
    });
    await items[0].find('span').trigger('click');
    expect(state.selectedKey).toBe(null);
    expect(datapointClick).toHaveBeenCalledTimes(1);
    items[1].element.focus();
    await items[1].find('span').trigger('click');
    expect(state.selectedKey).toBe('4');
    expect(datapointClick).toHaveBeenCalledTimes(2);
});

test('legend keyboard activation toggles once with Enter/Space and clears with Escape', async () => {
    const { items, state, datapointClick } = await chart();
    items[0].element.focus();
    await nextTick();
    expect(state.selectedKey).toBe(null);
    expect(datapointClick).not.toHaveBeenCalled();
    await items[0].trigger('keydown', { key: 'Enter' });
    expect(state.selectedKey).toBe('5');
    expect(datapointClick).toHaveBeenCalledTimes(1);
    await items[0].trigger('keydown', { key: ' ' });
    expect(state.selectedKey).toBe(null);
    expect(datapointClick).toHaveBeenCalledTimes(1);
    await items[1].trigger('keydown', { key: ' ' });
    expect(state.selectedKey).toBe('4');
    expect(datapointClick).toHaveBeenCalledTimes(2);
    await items[1].trigger('keydown', { key: 'Escape' });
    expect(state.selectedKey).toBe(null);
    expect(datapointClick).toHaveBeenCalledTimes(2);
});

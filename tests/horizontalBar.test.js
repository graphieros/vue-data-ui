import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import VueUiHorizontalBar from '../src/components/vue-ui-horizontal-bar.vue';

beforeEach(() => {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {}
            unobserve() {}
        },
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
        measureText: (text) => ({ width: String(text).length * 7 }),
    });
});
afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

const dataset = [
    { name: 'Standalone', value: 100 },
    {
        name: 'Group',
        children: [
            { name: 'Small', value: 10 },
            { name: 'Large', value: 30 },
        ],
    },
];

function mountChart(config = {}) {
    return mount(
        { ...VueUiHorizontalBar, render: () => null },
        {
            props: { dataset, config },
        },
    );
}

test.each(['none', 'asc', 'desc'])(
    'keyboard tooltip follows visible child rows when sorted %s and after hiding a parent',
    async (sort) => {
        const wrapper = mountChart({
            style: { chart: { layout: { bars: { sort } } } },
        });
        try {
            const state = wrapper.vm.$.setupState;
            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg',
            );
            svg.getBoundingClientRect = () => ({ left: 40, top: 70 });
            state.svgRef = svg;
            const positions = () =>
                state.bars.map((bar) => {
                    state.setKeyboardTooltipPositionFromBar(bar);
                    return state.tooltipA11yPosition.y;
                });
            const initial = positions();
            expect(initial).toHaveLength(3);
            expect(initial[0]).toBeLessThan(initial[1]);
            expect(initial[1]).toBeLessThan(initial[2]);
            wrapper.vm.hideSeries('Standalone');
            await wrapper.vm.$nextTick();
            const hidden = positions();
            expect(hidden).toHaveLength(2);
            expect(hidden[0]).toBeLessThan(hidden[1]);
        } finally {
            wrapper.unmount();
        }
    },
);

test('custom tooltip formatting runs once and enter events provide datapoint', () => {
    const customFormat = vi.fn(() => 'Custom tooltip');
    const datapointEnter = vi.fn();
    const wrapper = mountChart({
        style: { chart: { tooltip: { customFormat } } },
        events: { datapointEnter },
    });
    try {
        const state = wrapper.vm.$.setupState;
        const bar = state.bars[0];
        state.useTooltip(bar, 0);
        expect(customFormat).toHaveBeenCalledTimes(1);
        expect(state.tooltipContent).toBe('Custom tooltip');
        expect(datapointEnter).toHaveBeenCalledWith({
            datapoint: bar,
            datpoint: bar,
            seriesIndex: 0,
        });
    } finally {
        wrapper.unmount();
    }
});

import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, expect, test, vi } from 'vitest';
import StackBar from '../src/components/vue-ui-stackbar.vue';
import StackLine from '../src/components/vue-ui-stackline.vue';

afterEach(() => vi.unstubAllGlobals());

test.each([
    ['StackBar', StackBar],
    ['StackLine', StackLine],
])(
    '%s applies controlled zoom silently and only publishes the latest reset',
    async (_, chart) => {
        vi.stubGlobal(
            'ResizeObserver',
            class {
                observe() {}
                unobserve() {}
                disconnect() {}
            },
        );
        vi.stubGlobal('requestAnimationFrame', (callback) =>
            setTimeout(callback, 0),
        );
        vi.stubGlobal('cancelAnimationFrame', clearTimeout);

        const wrapper = mount(
            { ...chart, render: () => null },
            {
                props: {
                    dataset: [{ name: 'A', series: [1, 2, 3, 4, 5, 6, 7, 8] }],
                    zoomState: { start: 1, end: 6 },
                },
            },
        );

        try {
            await flushPromises();
            await wrapper.setProps({ zoomState: { start: 2, end: 7 } });
            expect(wrapper.emitted('update:zoomState')).toBeUndefined();
            expect(
                wrapper.vm.setZoomState({ end: 5 }, { transition: false }),
            ).toEqual({
                start: 2,
                end: 5,
            });
            expect(wrapper.emitted('update:zoomState')).toEqual([
                [{ start: 2, end: 5 }],
            ]);

            await Promise.all([wrapper.vm.resetZoom(), wrapper.vm.resetZoom()]);
            expect(wrapper.emitted('update:zoomState')).toEqual([
                [{ start: 2, end: 5 }],
                [{ start: 0, end: 8 }],
            ]);
            expect(wrapper.emitted('zoomReset')).toEqual([[]]);
        } finally {
            wrapper.unmount();
        }
    },
);

import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import XyAnalysisOptions from '../src/atoms/XyAnalysisOptions.vue';
import { useConfig } from '../src/useConfig';

async function mountOptions(options) {
    const wrapper = mount(XyAnalysisOptions, {
        ...options,
        global: { stubs: { teleport: true } },
    });
    await nextTick();
    return wrapper;
}

const messages = useConfig().vue_ui_xy.analysis;
function optionInput(wrapper, key) {
    return wrapper
        .findAll('label')
        .find((label) => label.text() === messages.optionLabels[key])
        .find('input');
}
describe('analysis selection dialog', () => {
    it('leaves every option unchecked initially and applies a copy of the edited selection', async () => {
        const wrapper = await mountOptions({ props: { messages } });
        try {
            const inputs = wrapper.findAll('input[type="checkbox"]');
            expect(inputs).toHaveLength(11);
            expect(
                inputs.filter((input) => input.element.checked),
            ).toHaveLength(0);
            expect(inputs[0].element.checked).toBe(false);
            expect(inputs[1].element.checked).toBe(false);
            await optionInput(wrapper, 'increase').setValue(true);
            expect(wrapper.emitted('apply')).toBeUndefined();
            await wrapper.find('[data-cy="analysis-apply"]').trigger('click');
            expect(wrapper.emitted('preview')[0][0].options.increase).toBe(
                true,
            );
            expect(wrapper.emitted('apply')[0][0].options).toMatchObject({
                minimum: false,
                maximum: false,
                increase: true,
                trend: false,
            });
        } finally {
            wrapper.unmount();
        }
    });
    it('cancels without applying and disables thresholds when no targets are configured', async () => {
        const wrapper = await mountOptions({ props: { messages } });
        try {
            const inputs = wrapper.findAll('input[type="checkbox"]');
            expect(optionInput(wrapper, 'threshold').element.disabled).toBe(
                true,
            );
            await inputs[0].setValue(false);
            await wrapper.find('[data-cy="analysis-cancel"]').trigger('click');
            expect(wrapper.emitted('apply')).toBeUndefined();
            expect(wrapper.emitted('cancel')).toHaveLength(1);
        } finally {
            wrapper.unmount();
        }
    });
    it('enables configured thresholds and supports Escape cancellation', async () => {
        const wrapper = await mountOptions({
            props: { messages: { ...messages, thresholds: [5] } },
        });
        try {
            expect(optionInput(wrapper, 'threshold').element.disabled).toBe(
                false,
            );
            document.dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Escape' }),
            );
            await nextTick();
            expect(wrapper.emitted('cancel')).toHaveLength(1);
        } finally {
            wrapper.unmount();
        }
    });
});

it('shows series selection only for multiple series and previews changes immediately', async () => {
    const series = [
        { id: 'uniqueId_0', name: 'Revenue' },
        { id: 'uniqueId_1', name: 'Costs' },
    ];
    const wrapper = await mountOptions({ props: { messages, series } });
    try {
        expect(wrapper.findAll('[data-series-id]')).toHaveLength(2);
        expect(wrapper.text()).toContain('Revenue');
        await wrapper.find('[data-series-id="uniqueId_1"]').setValue(false);
        const preview = wrapper.emitted('preview').at(-1)[0];
        expect(preview.seriesIds).toEqual(['uniqueId_0']);
        expect(preview.options).toMatchObject({
            minimum: false,
            maximum: false,
        });
        await wrapper.find('[data-cy="analysis-apply"]').trigger('click');
        expect(wrapper.emitted('apply')[0][0].seriesIds).toEqual([
            'uniqueId_0',
        ]);
    } finally {
        wrapper.unmount();
    }
    const single = await mountOptions({
        props: { messages, series: series.slice(0, 1) },
    });
    try {
        expect(single.findAll('[data-series-id]')).toHaveLength(0);
    } finally {
        single.unmount();
    }
});

it('does not mutate saved selections while previewing and cancelling', async () => {
    const selected = { minimum: true, maximum: true };
    const selectedSeries = ['a', 'b'];
    const wrapper = await mountOptions({
        props: {
            messages,
            selected,
            selectedSeries,
            series: [
                { id: 'a', name: 'A' },
                { id: 'b', name: 'B' },
            ],
        },
    });
    try {
        await wrapper.find('[data-series-id="b"]').setValue(false);
        await wrapper.find('[data-cy="analysis-cancel"]').trigger('click');
        expect(selectedSeries).toEqual(['a', 'b']);
        expect(selected).toEqual({ minimum: true, maximum: true });
        expect(wrapper.emitted('apply')).toBeUndefined();
    } finally {
        wrapper.unmount();
    }
});

it('uses the shared draggable dialog and treats its close button as Cancel', async () => {
    const wrapper = await mountOptions({ props: { messages } });
    try {
        expect(wrapper.find('[data-cy="draggable-dialog"]').exists()).toBe(
            true,
        );
        expect(wrapper.find('.drag-handle').exists()).toBe(true);
        expect(wrapper.find('.resize-handle').exists()).toBe(true);
        await wrapper
            .find('[data-cy="draggable-dialog-close"]')
            .trigger('click');
        expect(wrapper.emitted('cancel')).toHaveLength(1);
        expect(wrapper.emitted('apply')).toBeUndefined();
    } finally {
        wrapper.unmount();
    }
});

it('hides opted-out options and clears stale selections in preview and apply', async () => {
    const wrapper = await mountOptions({
        props: {
            messages: {
                ...messages,
                options: { minimum: false, threshold: false },
            },
            selected: { minimum: true, maximum: true },
        },
    });
    try {
        expect(wrapper.findAll('input[type="checkbox"]')).toHaveLength(9);
        expect(wrapper.text()).not.toContain(messages.optionLabels.threshold);
        expect(wrapper.text()).not.toContain(messages.thresholdUnavailable);
        await wrapper.findAll('input[type="checkbox"]')[0].setValue(false);
        expect(wrapper.emitted('preview').at(-1)[0].options.minimum).toBe(
            false,
        );
        await wrapper.find('[data-cy="analysis-apply"]').trigger('click');
        expect(wrapper.emitted('apply')[0][0].options.minimum).toBe(false);
    } finally {
        wrapper.unmount();
    }
});

it('previews appearance changes and includes them in Apply without mutating saved settings', async () => {
    const appearance = { color: '#123456', fontSize: 16, strokeWidth: 2 };
    const wrapper = await mountOptions({ props: { messages, appearance } });
    try {
        await wrapper.find('[data-cy="analysis-font-size"]').setValue('24');
        await wrapper.find('[data-cy="analysis-stroke-width"]').setValue('3.5');
        const picker = wrapper.findComponent({ name: 'ColorPicker' });
        picker.vm.$emit('update:value', '#abcdef');
        await nextTick();
        expect(wrapper.emitted('preview').at(-1)[0].appearance).toEqual({
            color: '#abcdef',
            fontSize: 24,
            strokeWidth: 3.5,
        });
        expect(appearance).toEqual({
            color: '#123456',
            fontSize: 16,
            strokeWidth: 2,
        });
        await wrapper.find('[data-cy="analysis-apply"]').trigger('click');
        expect(wrapper.emitted('apply')[0][0].appearance).toEqual({
            color: '#abcdef',
            fontSize: 24,
            strokeWidth: 3.5,
        });
    } finally {
        wrapper.unmount();
    }
});

it.each([false, true])(
    'forwards cursor preference to the dialog and color picker (%s)',
    async (isCursorPointer) => {
        const wrapper = await mountOptions({
            props: { messages, isCursorPointer },
        });
        try {
            const cursor = isCursorPointer ? 'pointer' : 'default';
            expect(
                wrapper
                    .findComponent({ name: 'BaseDraggableDialog' })
                    .props('isCursorPointer'),
            ).toBe(isCursorPointer);
            expect(
                wrapper
                    .findComponent({ name: 'ColorPicker' })
                    .props('isCursorPointer'),
            ).toBe(isCursorPointer);
            expect(
                wrapper.find('[data-cy="draggable-dialog-close"]').element.style
                    .cursor,
            ).toBe(cursor);
            expect(
                wrapper.find('.vue-ui-xy-analysis-options').element.style
                    .cursor,
            ).toBe(cursor);
            expect(
                wrapper.find('.vue-ui-xy-analysis-footer').element.style.cursor,
            ).toBe(cursor);
        } finally {
            wrapper.unmount();
        }
    },
);

import { mount } from '@vue/test-utils';
import { h, nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import ColorPicker from '../src/atoms/ColorPicker.vue';
import BaseDraggableDialog from '../src/atoms/BaseDraggableDialog.vue';

describe.each([false, true])(
    'color picker outside clicks, teleported=%s',
    (teleported) => {
        it('closes on dialog content clicks despite stopped bubbling, but keeps palette clicks open', async () => {
            const wrapper = mount(BaseDraggableDialog, {
                attachTo: document.body,
                slots: {
                    content: () =>
                        h('div', [
                            h(ColorPicker, { teleported }),
                            h(
                                'button',
                                { 'data-outside-picker': '' },
                                'Other control',
                            ),
                        ]),
                },
            });
            try {
                wrapper.vm.open();
                await nextTick();
                const picker = wrapper.findComponent(ColorPicker);
                await picker
                    .find('[data-cy="color-picker-icon"]')
                    .trigger('click');
                await nextTick();
                expect(picker.attributes('aria-expanded')).toBe('true');
                document.querySelector('.vue-ui-color-picker').click();
                await nextTick();
                expect(picker.attributes('aria-expanded')).toBe('true');
                document.querySelector('[data-outside-picker]').click();
                await nextTick();
                expect(picker.attributes('aria-expanded')).toBe('false');
                expect(
                    document.querySelector('.vue-ui-color-picker'),
                ).toBeNull();
                await picker
                    .find('[data-cy="color-picker-icon"]')
                    .trigger('click');
                document.body.click();
                await nextTick();
                expect(picker.attributes('aria-expanded')).toBe('false');
            } finally {
                wrapper.unmount();
            }
        });
    },
);

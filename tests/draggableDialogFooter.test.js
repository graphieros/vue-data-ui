import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import BaseDraggableDialog from '../src/atoms/BaseDraggableDialog.vue';

describe('optional fixed dialog footer', () => {
    it.each([false, true])(
        'preserves the existing layout unless a footer slot is provided: %s',
        async (footer) => {
            const wrapper = mount(BaseDraggableDialog, {
                global: { stubs: { teleport: true } },
                props: { withPadding: true },
                slots: {
                    content: '<div data-test="content">Long content</div>',
                    ...(footer
                        ? {
                              footer: '<button data-test="footer">Apply</button>',
                          }
                        : {}),
                },
            });
            try {
                wrapper.vm.open();
                await nextTick();
                const dialog = wrapper.find('[data-cy="draggable-dialog"]');
                expect(
                    dialog
                        .classes()
                        .includes('vue-ui-draggable-dialog-with-footer'),
                ).toBe(footer);
                const body = wrapper.find('[role="document"]');
                expect(
                    body
                        .classes()
                        .includes('vue-ui-draggable-dialog-scroll-body'),
                ).toBe(footer);
                expect(body.classes()).toContain(
                    'vue-ui-draggable-dialog-body-pad',
                );
                if (footer) {
                    expect(
                        wrapper
                            .find(
                                '.vue-ui-draggable-dialog-footer [data-test="footer"]',
                            )
                            .exists(),
                    ).toBe(true);
                    expect(body.find('[data-test="footer"]').exists()).toBe(
                        false,
                    );
                }
            } finally {
                wrapper.unmount();
            }
        },
    );
});

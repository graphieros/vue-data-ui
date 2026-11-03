import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect, vi } from 'vitest';
import BaseDraggableDialog from '../src/atoms/BaseDraggableDialog.vue';

async function openDialog(props = {}) {
    const wrapper = mount(BaseDraggableDialog, {
        props,
        attachTo: document.body,
    });
    wrapper.vm.open();
    await nextTick();
    const dialog = document.querySelector(
        `[aria-labelledby="${wrapper.vm.$.setupState.dialogTitleId}"]`,
    );
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        top: 100,
        width: 300,
        height: 200,
    });
    return { wrapper, dialog, handle: dialog.querySelector('.drag-handle') };
}

function touch(target, type, x, y) {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'touches', {
        value:
            type === 'touchend' || type === 'touchcancel'
                ? []
                : [{ clientX: x, clientY: y }],
    });
    target.dispatchEvent(event);
}

describe('dialog dragging', () => {
    it.each(['touchend', 'touchcancel'])(
        'keeps the touch target mounted and stops on %s',
        async (end) => {
            const { wrapper, dialog, handle } = await openDialog();
            try {
                touch(handle, 'touchstart', 110, 110);
                await nextTick();
                expect(handle.isConnected).toBe(true);
                expect(dialog.contains(handle)).toBe(true);
                touch(handle, 'touchmove', 160, 170);
                await nextTick();
                expect(dialog.style.left).toBe('150px');
                expect(dialog.style.top).toBe('160px');
                touch(handle, end, 160, 170);
                touch(handle, 'touchmove', 250, 250);
                await nextTick();
                expect(dialog.style.left).toBe('150px');
                expect(dialog.style.top).toBe('160px');
            } finally {
                wrapper.unmount();
            }
        },
    );

    it('retains mouse dragging and clamps using the displayed dimensions', async () => {
        const { wrapper, dialog, handle } = await openDialog({
            forcedWidth: 440,
        });
        try {
            handle.dispatchEvent(
                new MouseEvent('mousedown', {
                    bubbles: true,
                    clientX: 110,
                    clientY: 110,
                }),
            );
            await nextTick();
            expect(handle.isConnected).toBe(true);
            document.dispatchEvent(
                new MouseEvent('mousemove', { clientX: 10000, clientY: 10000 }),
            );
            await nextTick();
            expect(dialog.style.left).toBe(`${window.innerWidth - 300}px`);
            expect(dialog.style.top).toBe(`${window.innerHeight - 200}px`);
            document.dispatchEvent(new MouseEvent('mouseup'));
        } finally {
            wrapper.unmount();
        }
    });

    it('raises dialogs without replacing content or moving focus', async () => {
        const first = await openDialog();
        const second = await openDialog();
        try {
            expect(Number(second.dialog.style.zIndex)).toBeGreaterThan(
                Number(first.dialog.style.zIndex),
            );
            const close = first.dialog.querySelector('button');
            close.focus();
            touch(first.handle, 'touchstart', 110, 110);
            await nextTick();
            expect(Number(first.dialog.style.zIndex)).toBeGreaterThan(
                Number(second.dialog.style.zIndex),
            );
            expect(document.activeElement).toBe(close);
        } finally {
            first.wrapper.unmount();
            second.wrapper.unmount();
        }
    });
});

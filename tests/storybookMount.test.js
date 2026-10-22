import { afterEach, describe, expect, it, vi } from 'vitest';
import { setDevtoolsHook } from 'vue';
import { mountStory } from '../stories/support/mount.js';

const originalHook = globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__;
const mounted = [];
afterEach(() => {
    mounted.splice(0).forEach((story) => story.unmount());
    if (originalHook === undefined)
        delete globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    else globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__ = originalHook;
    setDevtoolsHook(originalHook, globalThis);
});

function createHook() {
    return {
        listeners: new Map(),
        emit(event, ...args) {
            if (this.listeners.has(event)) this.listeners.get(event)(...args);
        },
    };
}
function mountComponent() {
    const story = mountStory({ emits: ['change'], template: '<div />' });
    mounted.push(story);
    return story;
}

describe('Storybook mounts with an installed Vue devtools hook', () => {
    it('keeps the original receiver when the global hook changes before cleanup', () => {
        const hook = createHook();
        const emit = hook.emit;
        const onUnmount = vi.fn();
        hook.listeners.set('app:unmount', onUnmount);
        globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__ = hook;
        const story = mountComponent();

        globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__ = { emit() {} };
        story.wrapper.vm.$emit('change', 7);
        expect(story.wrapper.emitted('change')).toEqual([[7]]);
        expect(() => story.unmount()).not.toThrow();
        expect(onUnmount).toHaveBeenCalledTimes(1);
        expect(hook.emit).toBe(emit);
        story.unmount();
        expect(onUnmount).toHaveBeenCalledTimes(1);
    });

    it('records events once across remounts and hook replacements', () => {
        for (const hook of [createHook(), createHook()]) {
            globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__ = hook;
            const emit = hook.emit;
            for (let index = 0; index < 3; index += 1) {
                const story = mountComponent();
                story.wrapper.vm.$emit('change', index);
                expect(story.wrapper.emitted('change')).toEqual([[index]]);
                story.unmount();
                expect(hook.emit).toBe(emit);
            }
        }
    });

    it('preserves devtools changes made while the story is mounted', () => {
        const hook = createHook();
        globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__ = hook;
        const story = mountComponent();
        const replacement = vi.fn();
        hook.emit = replacement;
        story.unmount();
        expect(hook.emit).toBe(replacement);
        expect(replacement).toHaveBeenCalledWith(
            'app:unmount',
            expect.anything(),
        );
    });
});

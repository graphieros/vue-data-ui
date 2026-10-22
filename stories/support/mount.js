import { mount } from '@vue/test-utils';
import { setDevtoolsHook } from 'vue';

// Test Utils calls the previous emit with the *current global* hook as `this`.
// A devtools extension can replace that global while Vue still holds the old
// hook. Bind the receiver for this mount, then restore it when the app unmounts.
export function mountStory(component, options) {
    const hook = globalThis.__VUE_DEVTOOLS_GLOBAL_HOOK__;
    const originalEmit = hook?.emit;
    if (typeof originalEmit === 'function') {
        hook.emit = originalEmit.bind(hook);
        // Vue may still hold a hook replaced by the extension. Event recording
        // must attach to the same instance that Vue uses for the new app.
        setDevtoolsHook(hook, globalThis);
    }

    let wrapper;
    let recordingEmit;
    const restoreHook = () => {
        // Preserve any changes made by an extension after this mount.
        if (hook && hook.emit === recordingEmit) hook.emit = originalEmit;
    };
    try {
        wrapper = mount(component, options);
        recordingEmit = hook?.emit;
    } catch (error) {
        recordingEmit = hook?.emit;
        restoreHook();
        throw error;
    }

    let mounted = true;
    return {
        wrapper,
        unmount() {
            if (!mounted) return;
            mounted = false;
            try {
                wrapper.unmount();
            } finally {
                // Prevent Test Utils recorders accumulating across stories.
                restoreHook();
            }
        },
    };
}

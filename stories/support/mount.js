import { mount } from '@vue/test-utils';

export function mountStory(component, options) {
    const wrapper = mount(component, options);
    let mounted = true;
    return {
        wrapper,
        unmount() {
            if (!mounted) return;
            mounted = false;
            wrapper.unmount();
        },
    };
}

import { mount } from '@vue/test-utils';
import { h, ref, nextTick } from 'vue';
import { afterEach, expect, test, vi } from 'vitest';
import usePanZoom from '../src/usePanZoom';
let wrapper;
afterEach(() => {
    wrapper?.unmount();
    vi.unstubAllGlobals();
});
test('one animation owner handles replacement, reset, disabling and unmount', async () => {
    const frames = new Map();
    let id = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++id, cb);
        return id;
    });
    vi.stubGlobal('cancelAnimationFrame', (id) => frames.delete(id));
    const active = ref(true);
    let controls;
    wrapper = mount({
        setup() {
            const svg = ref(null);
            controls = usePanZoom(
                svg,
                { x: 0, y: 0, width: 100, height: 100 },
                1,
                active,
            );
            return () => h('svg', { ref: svg });
        },
    });
    controls.zoomByFactor(2, true);
    expect(frames.size).toBe(1);
    const stale = [...frames.values()][0];
    controls.resetZoom();
    expect(frames.size).toBe(0);
    stale(100);
    expect(controls.viewBox.value.width).toBe(100);
    expect(frames.size).toBe(0);
    controls.zoomByFactor(2, true);
    controls.zoomByFactor(3, true);
    expect(frames.size).toBe(1);
    active.value = false;
    await nextTick();
    expect(frames.size).toBe(0);
    controls.resetZoom(true);
    expect(frames.size).toBe(1);
    wrapper.unmount();
    expect(frames.size).toBe(0);
});

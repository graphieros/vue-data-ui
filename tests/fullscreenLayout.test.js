import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createFullscreenLayout } from '../src/fullscreenLayout';

const cleanups = [];
beforeEach(() => {
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            unobserve() {}
            disconnect() {}
        },
    );
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
});
afterEach(() => {
    cleanups.splice(0).forEach((cleanup) => cleanup());
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

it('preserves element ownership across toolbar replacement and restores styles on exit', () => {
    const root = document.createElement('div');
    root.innerHTML = '<div>Title</div><svg></svg>';
    root.style.setProperty('--vdui-fullscreen-scale', '0.75', 'important');
    document.body.append(root);
    const layout = createFullscreenLayout(root);
    cleanups.push(() => {
        layout.stop();
        root.remove();
    });
    layout.enter();
    expect(root.hasAttribute('data-vdui-fullscreen-layout')).toBe(true);
    expect(
        root.querySelectorAll('[data-vdui-fullscreen-content]'),
    ).toHaveLength(2);
    // Vue can replace its class attribute without removing the layout marker.
    root.className = 'vue-data-ui-component vue-data-ui-wrapper-fullscreen';
    expect(root.hasAttribute('data-vdui-fullscreen-layout')).toBe(true);
    expect(createFullscreenLayout(root)).toBe(layout);
    layout.stop();
    expect(root.hasAttribute('data-vdui-fullscreen-layout')).toBe(false);
    expect(root.querySelector('[data-vdui-fullscreen-content]')).toBeNull();
    expect(root.style.getPropertyValue('--vdui-fullscreen-scale')).toBe('0.75');
    expect(root.style.getPropertyPriority('--vdui-fullscreen-scale')).toBe(
        'important',
    );
});

it('releases observers and scheduled fitting when another element owns fullscreen', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    const layout = createFullscreenLayout(root);
    cleanups.push(() => {
        layout.stop();
        root.remove();
    });
    layout.enter();
    window.dispatchEvent(new Event('resize'));
    expect(requestAnimationFrame).toHaveBeenCalled();
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(root.hasAttribute('data-vdui-fullscreen-layout')).toBe(false);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    requestAnimationFrame.mockClear();
    window.dispatchEvent(new Event('resize'));
    expect(requestAnimationFrame).not.toHaveBeenCalled();
});

it('keeps slicer SVGs in the unscaled control layout', () => {
    const root = document.createElement('div');
    root.innerHTML =
        '<div data-vdui-fullscreen-control><svg class="vue-data-ui-svg"></svg></div><svg></svg>';
    document.body.append(root);
    const layout = createFullscreenLayout(root);
    cleanups.push(() => {
        layout.stop();
        root.remove();
    });
    layout.enter();
    const slicer = root.firstElementChild;
    expect(slicer.hasAttribute('data-vdui-fullscreen-content')).toBe(true);
    expect(slicer.hasAttribute('data-vdui-fullscreen-visual')).toBe(false);
    expect(
        root.lastElementChild.hasAttribute('data-vdui-fullscreen-visual'),
    ).toBe(true);
    layout.stop();
    expect(slicer.hasAttribute('data-vdui-fullscreen-control')).toBe(true);
});

import { createApp, h, nextTick } from 'vue';
import { expect, it, afterEach, vi } from 'vitest';
import Graph from '../src/components/vue-ui-graph.vue';
const cleanups = [];
afterEach(() => {
    cleanups.splice(0).forEach((f) => f());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function mount(responsive = true) {
    let observerCallback, api;
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback) {
                observerCallback = callback;
            }
            observe() {}
            disconnect() {}
        },
    );
    let fullWidth = 1440,
        fullHeight = 780;
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
        function () {
            if (this.matches('.vue-data-ui-zoom-controls, .vue-ui-graph-title'))
                return {
                    width: 800,
                    height: 0,
                    x: 0,
                    y: 0,
                    top: 0,
                    left: 0,
                    right: 800,
                    bottom: 0,
                };
            const root = this.closest('.vue-ui-graph');
            const full = root?.classList.contains('vue-ui-graph-fullscreen');
            return {
                x: 0,
                y: 0,
                left: 0,
                top: 0,
                right: full ? fullWidth : 800,
                bottom: full ? fullHeight : 600,
                width: full ? fullWidth : 800,
                height: full ? fullHeight : 600,
                toJSON() {},
            };
        },
    );
    const el = document.createElement('div');
    document.body.append(el);
    const app = createApp({
        render: () =>
            h(Graph, {
                dataset: {
                    nodes: [
                        { id: 'a', x: 0, y: 0, fixed: true },
                        { id: 'b', x: 400, y: 200, fixed: true },
                    ],
                    links: [{ source: 'a', target: 'b' }],
                },
                config: {
                    responsive,
                    animation: { enabled: false },
                    layout: { iterations: 0 },
                    viewport: { initialFit: false },
                    userOptions: { show: false },
                },
                ref: (r) => (api = r),
            }),
    });
    app.mount(el);
    cleanups.push(() => {
        app.unmount();
        el.remove();
    });
    await nextTick();
    const svg = el.querySelector('.vue-ui-graph-svg');
    return {
        el,
        svg,
        get api() {
            return api;
        },
        resize(w, h) {
            fullWidth = w;
            fullHeight = h;
            observerCallback();
        },
        transform() {
            return el
                .querySelector('.vue-ui-graph-nodes')
                .parentElement.getAttribute('transform');
        },
    };
}
it('fills fullscreen dimensions, fits on entry and restores the previous viewport on exit', async () => {
    const m = await mount();
    m.api.zoomIn();
    await nextTick();
    const before = m.transform();
    m.api.toggleFullscreen(true);
    await nextTick();
    await nextTick();
    expect(
        m.el.firstElementChild.classList.contains('vue-ui-graph-fullscreen'),
    ).toBe(true);
    expect(m.svg.getAttribute('viewBox')).toBe('0 0 1440 780');
    expect(m.svg.style.height).toBe('0px');
    expect(m.transform()).not.toBe(before);
    m.resize(1920, 1000);
    await nextTick();
    expect(m.svg.getAttribute('viewBox')).toBe('0 0 1920 1000');
    m.api.toggleFullscreen(false);
    await nextTick();
    await nextTick();
    expect(m.svg.getAttribute('viewBox')).toBe('0 0 800 600');
    expect(m.svg.style.height).toBe('600px');
    expect(m.transform()).toBe(before);
});
it('uses the full viewport even with responsive disabled', async () => {
    const m = await mount(false);
    m.api.toggleFullscreen(true);
    await nextTick();
    await nextTick();
    expect(m.svg.getAttribute('viewBox')).toBe('0 0 1440 780');
});
it('handles native fullscreen changes and ignores fullscreen on another element', async () => {
    const m = await mount();
    let native = null;
    const descriptor = Object.getOwnPropertyDescriptor(
        document,
        'fullscreenElement',
    );
    Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        get: () => native,
    });
    cleanups.push(() => {
        if (descriptor)
            Object.defineProperty(document, 'fullscreenElement', descriptor);
        else delete document.fullscreenElement;
    });
    native = m.el.firstElementChild;
    document.dispatchEvent(new Event('fullscreenchange'));
    await nextTick();
    await nextTick();
    expect(m.svg.getAttribute('viewBox')).toBe('0 0 1440 780');
    native = null;
    document.dispatchEvent(new Event('fullscreenchange'));
    await nextTick();
    await nextTick();
    expect(m.svg.getAttribute('viewBox')).toBe('0 0 800 600');
    native = document.createElement('div');
    m.api.toggleFullscreen(true);
    await nextTick();
    expect(
        m.el.firstElementChild.classList.contains('vue-ui-graph-fullscreen'),
    ).toBe(false);
});

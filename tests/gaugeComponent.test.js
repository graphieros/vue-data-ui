import { mount, flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Gauge from '../src/components/vue-ui-gauge.vue';
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
let wrappers, frames, frameId, observers;
beforeEach(() => {
    vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
    wrappers = [];
    frames = new Map();
    frameId = 0;
    observers = [];
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((cb) => {
            frames.set(++frameId, cb);
            return frameId;
        }),
    );
    vi.stubGlobal(
        'cancelAnimationFrame',
        vi.fn((id) => frames.delete(id)),
    );
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(cb) {
                this.callback = cb;
                observers.push(this);
            }
            observe = vi.fn();
            disconnect = vi.fn();
        },
    );
});
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(
    config = {},
    dataset = {
        value: 25,
        series: [
            { from: 0, to: 50, name: 'A' },
            { from: 50, to: 100, name: 'B' },
        ],
    },
) {
    const w = mount(
        { ...Gauge, render: () => null },
        {
            props: {
                dataset,
                config: {
                    style: { chart: { animation: { use: false } } },
                    ...config,
                },
            },
        },
    );
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function finishFrames() {
    for (let i = 0; frames.size && i < 2000; i++) {
        const calls = [...frames.values()];
        frames.clear();
        calls.forEach((cb) => cb());
    }
    expect(frames.size).toBe(0);
}
test('negative-only ranges produce complete arcs and correct pointer progress', async () => {
    const [, s] = await chart(
        {},
        {
            value: -50,
            series: [
                { from: -100, to: -60 },
                { from: -60, to: -20 },
            ],
        },
    );
    expect(s.arcs.map((a) => a.proportion)).toEqual([0.5, 0.5]);
    expect(s.progress).toBe(0.625);
});
test('equal bounds keep pointer and indicator finite', async () => {
    const [, s] = await chart({}, { value: 0, series: [{ from: 0, to: 0 }] });
    expect(Object.values(s.pointer).every(Number.isFinite)).toBe(true);
    expect(s.gaugeArc).not.toMatch(/NaN|Infinity/);
});
test('runtime fixed-mode sizes follow configuration', async () => {
    const [w, s] = await chart();
    await w.setProps({
        config: {
            style: {
                chart: {
                    animation: { use: false },
                    legend: { fontSize: 31 },
                    layout: {
                        pointer: { size: 2, circle: { radius: 13 } },
                        track: { size: 3 },
                        segmentNames: { fontSize: 22 },
                    },
                },
            },
        },
    });
    expect(s.svg.pointerSize).toBe(2);
    expect(s.svg.pointerRadius).toBe(13);
    expect(s.svg.trackSize).toBe(3);
    expect(s.svg.legendFontSize).toBe(31);
    expect(s.svg.segmentFontSize).toBe(22);
});
test('invalid data stays in loading and recovers when corrected', async () => {
    const [w, s] = await chart();
    await w.setProps({ dataset: { value: 10, series: [{ from: 0 }] } });
    await flushPromises();
    expect(s.loading).toBe(true);
    await w.setProps({ dataset: { value: 10, series: [{ from: 0, to: 20 }] } });
    await flushPromises();
    expect(s.loading).toBe(false);
    expect(s.activeRating).toBe(10);
});
for (const speed of [-1, 0, Infinity, NaN])
    test(`invalid animation speed ${speed} settles immediately`, async () => {
        const [, s] = await chart({
            style: { chart: { animation: { use: true, speed } } },
        });
        s.FINAL_CONFIG.style.chart.animation.speed = speed;
        s.useAnimation(25);
        expect(s.activeRating).toBe(25);
        expect(s.animationFrame).toBe(null);
        finishFrames();
    });
test('animation finishes at the target and cancels on unmount', async () => {
    const [w, s] = await chart({
        style: { chart: { animation: { use: true, speed: 0.1 } } },
    });
    finishFrames();
    expect(s.activeRating).toBe(25);
    await w.setProps({
        dataset: { value: 75, series: [{ from: 0, to: 100 }] },
    });
    expect(frames.size).toBeGreaterThan(0);
    w.unmount();
    expect(frames.size).toBe(0);
});
test('responsive observer persists across data updates and disconnects when disabled', async () => {
    const [w, s] = await chart({
        responsive: true,
        style: { chart: { animation: { use: false } } },
    });
    s.gaugeChart = { parentNode: {} };
    s.updateSizing();
    const observer = observers.at(-1);
    finishFrames();
    expect(s.svg.width).toBe(800);
    expect(s.svg.height).toBe(488);
    await w.setProps({
        dataset: { value: 30, series: [{ from: 0, to: 100 }] },
    });
    expect(observers.at(-1)).toBe(observer);
    await w.setProps({
        config: {
            responsive: false,
            style: { chart: { animation: { use: false } } },
        },
    });
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.svg.width).toBe(512);
});
test('label fitting publishes a fitted size and respects updated font configuration', async () => {
    const [w, s] = await chart();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 512 358.4');
    const label = document.createElementNS(svg.namespaceURI, 'text');
    label.setAttribute('class', 'vue-ui-gauge-label-flat');
    label.textContent = 'A';
    svg.appendChild(label);
    const old = SVGElement.prototype.getBBox;
    SVGElement.prototype.getBBox = function () {
        return {
            x: 10,
            y: 10,
            width: Number(this.getAttribute('font-size')) * 40,
            height: 10,
        };
    };
    try {
        s.svgRef = svg;
        s.autoSizeLabels();
        finishFrames();
        expect(s.labels_font_size).toBeLessThan(s.svg.segmentFontSize);
        await w.setProps({
            config: {
                style: {
                    chart: {
                        animation: { use: false },
                        layout: {
                            segmentNames: { fontSize: 10, minFontSize: 6 },
                        },
                    },
                },
            },
        });
        await flushPromises();
        finishFrames();
        expect(s.labels_font_size).toBe(10);
    } finally {
        SVGElement.prototype.getBBox = old;
    }
});

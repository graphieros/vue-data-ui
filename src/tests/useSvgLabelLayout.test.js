import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createApp, h, nextTick, ref } from 'vue';
import {
    useSvgLabelLayout,
    withSvgLabelMeasurements,
} from '../useSvgLabelLayout';

let app;
let host;

beforeEach(() => {
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn(() => 1),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    vi.spyOn(SVGElement.prototype, 'getBoundingClientRect').mockReturnValue({
        width: 18,
    });
    SVGElement.prototype.getBBox = vi.fn(function () {
        return { width: 120, height: 35, x: 0, y: 0 };
    });
    SVGElement.prototype.getComputedTextLength = vi.fn(() => 120);
    host = document.createElement('div');
    document.body.appendChild(host);
});

afterEach(() => {
    app?.unmount();
    app = null;
    host.remove();
    delete SVGElement.prototype.getBBox;
    delete SVGElement.prototype.getComputedTextLength;
    delete SVGElement.prototype.getCTM;
    delete document.fonts;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});

function mountLayout({
    fonts,
    canMeasure = () => true,
    measure,
    initialMetrics,
} = {}) {
    if (fonts)
        Object.defineProperty(document, 'fonts', {
            configurable: true,
            value: fonts,
        });
    let layout;
    app = createApp({
        setup() {
            const svgRef = ref(null);
            layout = useSvgLabelLayout({
                svgRef,
                canMeasure,
                initialMetrics,
                measure:
                    measure ||
                    (() => ({
                        scaleLabelsWidth: 120,
                        yAxisLabelWidth: 18,
                        xAxisLabelHeight: 16,
                        timeLabelsHeight: 35,
                        right: 40,
                    })),
            });
            return () =>
                h('svg', {
                    ref: svgRef,
                    style: {
                        visibility: layout.ready.value ? 'visible' : 'hidden',
                    },
                });
        },
    });
    app.mount(host);
    return layout;
}

describe('SVG label measurement', () => {
    test('coalesces label resize measurements outside observer delivery', async () => {
        let notify;
        const disconnect = vi.fn();
        vi.stubGlobal(
            'ResizeObserver',
            class {
                constructor(callback) {
                    notify = callback;
                }
                observe() {}
                disconnect = disconnect;
            },
        );
        const label = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text',
        );
        let width = 20;
        const layout = mountLayout({
            initialMetrics: { width: 0 },
            measure: (read) => {
                read(label);
                return { width };
            },
        });
        await nextTick();
        width = 80;
        notify();
        notify();
        expect(layout.metrics.value.width).toBe(20);
        expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
        requestAnimationFrame.mock.calls[0][0]();
        expect(layout.metrics.value.width).toBe(80);
        notify();
        app.unmount();
        app = null;
        expect(disconnect).toHaveBeenCalled();
        expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    });

    test('remeasures label mutations and disconnects observers on unmount', async () => {
        const label = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text',
        );
        label.textContent = 'Initial label';
        let width = 20;
        const measure = vi.fn((read) => {
            read(label);
            return { width };
        });
        const layout = mountLayout({ initialMetrics: { width: 0 }, measure });
        await nextTick();
        width = 80;
        label.textContent = 'Updated custom label';
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(layout.metrics.value.width).toBe(80);
        expect(layout.ready.value).toBe(true);
        expect(layout.settling.value).toBe(false);
        app.unmount();
        app = null;
        measure.mockClear();
        label.setAttribute('font-size', '100');
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(measure).not.toHaveBeenCalled();
    });

    test('suppresses transitions only until the initial layout is ready', async () => {
        let bottom = 20;
        const layout = mountLayout({
            initialMetrics: { bottom: 0 },
            measure: () => ({ bottom }),
        });
        expect(layout.settling.value).toBe(true);
        await nextTick();
        expect(layout.ready.value).toBe(true);
        expect(layout.settling.value).toBe(false);
        bottom = 80;
        layout.update();
        expect(layout.metrics.value.bottom).toBe(80);
        expect(layout.ready.value).toBe(true);
        expect(layout.settling.value).toBe(false);
        await nextTick();
        expect(layout.settling.value).toBe(false);
    });

    test('waits for a label preparation patch before measuring and revealing', async () => {
        let pending = true;
        const layout = mountLayout({
            initialMetrics: { bottom: 0 },
            measure: () => {
                if (pending) {
                    pending = false;
                    return null;
                }
                return { bottom: 36 };
            },
        });
        expect(layout.ready.value).toBe(false);
        expect(layout.metrics.value.bottom).toBe(0);
        await nextTick();
        await nextTick();
        expect(layout.metrics.value.bottom).toBe(36);
        expect(layout.ready.value).toBe(true);
    });

    test('remeasures after the initial margin patch before revealing', async () => {
        let calls = 0;
        const layout = mountLayout({
            initialMetrics: { width: 0 },
            measure: () => ({ width: ++calls === 1 ? 40 : 80 }),
        });
        expect(layout.ready.value).toBe(false);
        expect(layout.metrics.value.width).toBe(40);
        await nextTick();
        expect(layout.ready.value).toBe(false);
        expect(layout.metrics.value.width).toBe(80);
        await nextTick();
        expect(layout.ready.value).toBe(true);
    });

    test('waits for fonts requested by the first measurement', async () => {
        let resolve;
        const fonts = {
            status: 'loaded',
            ready: new Promise((done) => {
                resolve = done;
            }),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        let first = true;
        const layout = mountLayout({
            fonts,
            initialMetrics: { width: 0 },
            measure: () => {
                if (first) {
                    first = false;
                    fonts.status = 'loading';
                    return { width: 40 };
                }
                return { width: 80 };
            },
        });
        expect(layout.ready.value).toBe(false);
        expect(layout.metrics.value.width).toBe(0);
        fonts.status = 'loaded';
        resolve();
        await nextTick();
        await nextTick();
        await nextTick();
        expect(layout.metrics.value.width).toBe(80);
        expect(layout.ready.value).toBe(true);
    });

    test('measures rotated text overhang independently of its chart translation', () => {
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const text = document.createElementNS(svg.namespaceURI, 'text');
        text.textContent = 'A rotated period label';
        SVGElement.prototype.getBBox = vi.fn(() => ({
            x: -80,
            y: -12,
            width: 80,
            height: 16,
        }));
        let translation = 100;
        SVGElement.prototype.getCTM = vi.fn(() => ({
            a: Math.SQRT1_2,
            c: Math.SQRT1_2,
            e: translation,
        }));
        const first = withSvgLabelMeasurements(
            svg,
            (read) => read(text).leftOverhang,
        );
        translation = 500;
        const second = withSvgLabelMeasurements(
            svg,
            (read) => read(text).leftOverhang,
        );
        expect(first).toBeCloseTo(92 * Math.SQRT1_2);
        expect(second).toBe(first);
    });

    test('commits chart-specific margins as one snapshot', async () => {
        const layout = mountLayout({
            initialMetrics: {
                topLabelsHeight: 0,
                leftLabelsWidth: 0,
                xAxisSumLabelsHeight: 0,
            },
            measure: () => ({
                topLabelsHeight: 30,
                leftLabelsWidth: 80,
                xAxisSumLabelsHeight: 20,
            }),
        });
        expect(layout.metrics.value).toEqual({
            topLabelsHeight: 30,
            leftLabelsWidth: 80,
            xAxisSumLabelsHeight: 20,
        });
        expect(layout.ready.value).toBe(false);
        await nextTick();
        expect(layout.ready.value).toBe(true);
    });

    test('measures a hidden copy, preserves the live labels, and removes the probe', () => {
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const text = document.createElementNS(svg.namespaceURI, 'text');
        text.id = 'live-label';
        text.setAttribute('data-cy', 'time-label');
        text.textContent = 'A long label';
        svg.appendChild(text);
        host.appendChild(svg);
        const measured = withSvgLabelMeasurements(svg, (read) => {
            const probe = document.body.lastElementChild;
            expect(probe.style.visibility).toBe('hidden');
            const result = read(text);
            expect(probe.querySelector('#live-label')).toBeNull();
            expect(probe.querySelector('[data-cy]')).toBeNull();
            return result;
        });
        expect(measured).toEqual({
            x: 0,
            width: 120,
            height: 35,
            textWidth: 120,
            rotatedWidth: 18,
            leftOverhang: 0,
        });
        expect(text.id).toBe('live-label');
        expect(text.parentNode).toBe(svg);
        expect(document.body.lastElementChild).toBe(host);
    });

    test('removes the measurement SVG if a custom label cannot be measured', () => {
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        expect(() =>
            withSvgLabelMeasurements(svg, () => {
                throw new Error('detached');
            }),
        ).toThrow('detached');
        expect(document.body.lastElementChild).toBe(host);
    });

    test('waits for fonts and commits all margins before revealing the SVG', async () => {
        let resolve;
        const fonts = {
            status: 'loading',
            ready: new Promise((done) => {
                resolve = done;
            }),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        const layout = mountLayout({ fonts });
        expect(layout.ready.value).toBe(false);
        expect(layout.metrics.value.timeLabelsHeight).toBe(0);
        fonts.status = 'loaded';
        resolve();
        await nextTick();
        await nextTick();
        expect(layout.ready.value).toBe(true);
        expect(layout.metrics.value).toEqual({
            scaleLabelsWidth: 120,
            yAxisLabelWidth: 18,
            xAxisLabelHeight: 16,
            timeLabelsHeight: 35,
            right: 40,
        });
        await nextTick();
        expect(host.querySelector('svg').style.visibility).toBe('visible');
        app.unmount();
        app = null;
        expect(fonts.removeEventListener).toHaveBeenCalledWith(
            'loadingdone',
            layout.update,
        );
    });

    test('retains the last layout while labels load and when measurement fails', async () => {
        let available = false;
        let fail = false;
        const layout = mountLayout({
            canMeasure: () => available,
            measure: () => {
                if (fail) throw new Error('detached');
                return {
                    scaleLabelsWidth: 100,
                    yAxisLabelWidth: 0,
                    xAxisLabelHeight: 0,
                    timeLabelsHeight: 40,
                    right: 0,
                };
            },
        });
        expect(layout.ready.value).toBe(false);
        available = true;
        layout.update();
        await nextTick();
        const previous = layout.metrics.value;
        fail = true;
        layout.update();
        expect(layout.metrics.value).toBe(previous);
        expect(layout.ready.value).toBe(true);
    });

    test('does not measure or reveal an unmounted chart after fonts resolve', async () => {
        let resolve;
        const measure = vi.fn();
        const fonts = {
            status: 'loading',
            ready: new Promise((done) => {
                resolve = done;
            }),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        };
        const layout = mountLayout({ fonts, measure });
        app.unmount();
        app = null;
        fonts.status = 'loaded';
        resolve();
        await nextTick();
        expect(measure).not.toHaveBeenCalled();
        expect(layout.ready.value).toBe(false);
    });
});

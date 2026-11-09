import { mount, flushPromises } from '@vue/test-utils';
import { nextTick, reactive } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-geo.vue';
vi.mock('../src/useChartExport', () => ({
    useChartExport: () => ({
        isCallbackImaging: false,
        isCallbackSvg: false,
        generateSvg: vi.fn(),
        onGenerateImage: vi.fn(),
    }),
}));
vi.mock('../src/useResponsive', () => ({
    useResponsive: () => ({ width: 800, height: 500 }),
}));
const dataset = [
    { id: 'a', name: 'A', coordinates: [0, 0] },
    { id: 'b', name: 'B', coordinates: [20, 20], radius: 2 },
];
const map = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: { name: 'Land' },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [0, 0],
                        [30, 0],
                        [30, 30],
                        [0, 30],
                        [0, 0],
                    ],
                ],
            },
        },
    ],
};
let wrappers, frames, observers, frameId;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    observers = [];
    frameId = 0;
    vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('requestAnimationFrame', (callback) => {
        frames.set(++frameId, callback);
        return frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id) => frames.delete(id));
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback) {
                this.callback = callback;
                observers.push(this);
            }
            observe = vi.fn();
            disconnect = vi.fn();
        },
    );
});
afterEach(async () => {
    await vi.dynamicImportSettled();
    await flushPromises();
    wrappers.forEach((w) => w.unmount());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(config = {}, data = dataset, real = false) {
    const w = mount(real ? Chart : { ...Chart, render: () => null }, {
        attachTo: document.body,
        props: { dataset: data, config },
        global: {
            stubs: {
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
                Tooltip: true,
            },
        },
    });
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
async function finishFrames() {
    for (let i = 0; frames.size && i < 30; i++) {
        const callbacks = [...frames.values()];
        frames.clear();
        callbacks.forEach((cb) => cb(i * 100));
        await nextTick();
    }
    expect(frames.size).toBe(0);
}
test('missing radius uses configured default and explicit zero remains zero across all input forms', async () => {
    const [w, s] = await chart({ style: { chart: { points: { radius: 5 } } } });
    expect(s.projectedPoints.map((p) => p.radius)).toEqual([5, 2]);
    await w.setProps({ dataset: [[0, 0], { coordinates: [1, 1], radius: 0 }] });
    expect(s.projectedPoints.map((p) => p.radius)).toEqual([5, 0]);
    await w.setProps({ dataset: { key: { coordinates: ['2', '3'] } } });
    expect(s.points[0].coordinates).toEqual([2, 3]);
    expect(s.projectedPoints[0].radius).toBe(5);
    await w.setProps({
        dataset: {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { name: 'Bad' },
                    geometry: { type: 'Point', coordinates: null },
                },
                {
                    type: 'Feature',
                    properties: { name: 'Good' },
                    geometry: { type: 'Point', coordinates: ['4', '5'] },
                },
            ],
        },
    });
    expect(s.points).toHaveLength(1);
    expect(s.points[0]).toMatchObject({ index: 1, coordinates: [4, 5] });
    expect(s.projectedPoints[0].radius).toBe(5);
});
test('loading overrides stay reactive and recover real inputs', async () => {
    const [w, s] = await chart({ loading: true });
    expect(s.loading).toBe(true);
    await w.setProps({
        config: {
            loading: true,
            style: { chart: { color: '#123456' } },
            skeletonDataset: [{ name: 'Skeleton', coordinates: [0, 0] }],
            skeletonConfig: {
                style: { chart: { backgroundColor: '#abcdef' } },
            },
        },
    });
    expect(s.FINAL_CONFIG.userOptions.show).toBe(false);
    expect(s.cfgChart.backgroundColor).toBe('#abcdef');
    expect(s.points[0].name).toBe('Skeleton');
    await w.setProps({ config: {} });
    expect(s.loading).toBe(false);
    expect(s.points.map((p) => p.name)).toEqual(['A', 'B']);
});
test('style changes preserve user zoom and tooltip choices and annotation only suspends zoom', async () => {
    const [w, s] = await chart();
    s.toggleZoom();
    w.vm.toggleTooltip();
    await nextTick();
    expect(s.panZoomActive).toBe(false);
    w.vm.toggleAnnotator();
    await nextTick();
    w.vm.toggleAnnotator();
    await nextTick();
    expect(s.panZoomActive).toBe(false);
    await w.setProps({ config: { style: { chart: { color: '#abcdef' } } } });
    expect(s.panZoomActive).toBe(false);
    expect(s.mutableConfig.showTooltip).toBe(false);
    s.toggleZoom();
    w.vm.toggleAnnotator();
    await nextTick();
    expect(s.panZoomActive).toBe(false);
    w.vm.toggleAnnotator();
    await nextTick();
    expect(s.panZoomActive).toBe(true);
});
test('selected point survives reorder, refreshes without events, and clears on removal', async () => {
    const enter = vi.fn(),
        click = vi.fn();
    const [w, s] = await chart({
        events: { datapointEnter: enter, datapointClick: click },
    });
    const selected = s.keyboardNavigablePoints[1];
    s.onPointEnter(selected, 1, 'keyboard');
    const id = selected.uid;
    await w.setProps({
        dataset: [
            { ...dataset[1], name: 'Changed', coordinates: [30, 30] },
            dataset[0],
        ],
    });
    expect(s.highlightedPointKey).toBe(id);
    expect(s.activePointKeyboardIndex).toBe(0);
    expect(s.dataTooltipSlot.datapoint.name).toBe('Changed');
    expect(enter).toHaveBeenCalledTimes(1);
    s.onPointClick(s.keyboardNavigablePoints[s.activePointKeyboardIndex]);
    expect(click.mock.calls[0][0].seriesIndex).toBe(0);
    await w.setProps({ dataset: [dataset[0]] });
    expect(s.highlightedPointKey).toBe(null);
    expect(s.isTooltipVisible).toBe(false);
});
test('territory and GeoJSON point tooltips replace stale point slots and keyboard mode', async () => {
    const customFormat = vi.fn(({ datapoint }) => datapoint.name);
    const [w, s] = await chart({
        map: { geoJson: map },
        style: { chart: { tooltip: { customFormat } } },
    });
    s.onPointEnter(s.keyboardNavigablePoints[0], 0, 'keyboard');
    s.onTerritoryEnter(s.areaPaths[0]);
    expect(s.tooltipTriggerMode).toBe('pointer');
    expect(s.dataTooltipSlot.datapoint.name).toBe('Land');
    expect(s.highlightedPointKey).toBe(null);
    expect(s.tooltipContent).toBe('Land');
    s.onGeoJsonPointEnter({ name: 'Marker', uid: 'marker', featureIndex: 3 });
    expect(s.dataTooltipSlot.datapoint).toMatchObject({
        name: 'Marker',
        index: 3,
    });
    expect(customFormat.mock.calls.at(-1)[0]).toEqual({
        datapoint: { name: 'Marker', uid: 'marker', index: 3, properties: {} },
        config: s.FINAL_CONFIG,
    });
});
test('fixed viewport changes update pan/zoom base and responsive sizing restores defaults', async () => {
    const [w, s] = await chart(
        { style: { chart: { dimensions: { width: 600, height: 400 } } } },
        dataset,
        true,
    );
    await finishFrames();
    expect(s.panZoomViewBox).toMatchObject({ width: 600, height: 400 });
    await w.setProps({
        config: {
            style: { chart: { dimensions: { width: 900, height: 500 } } },
        },
    });
    await finishFrames();
    expect(s.panZoomViewBox).toMatchObject({ width: 900, height: 500 });
    await w.setProps({ config: { responsive: true } });
    await finishFrames();
    expect(s.viewportSizes).toEqual({ width: 800, height: 476 });
    const observer = observers.at(-1);
    observer.callback();
    await w.setProps({ config: {} });
    await finishFrames();
    expect(observer.disconnect).toHaveBeenCalled();
    expect(s.viewportSizes).toEqual({ width: 1000, height: 700 });
    observer.callback();
    expect(frames.size).toBe(0);
});
test('focus, fit, reset and shared zoom animations cancel on replacement and unmount', async () => {
    const [w, s] = await chart();
    await finishFrames();
    w.vm.focusLocation([20, 20]);
    expect(frames.size).toBe(1);
    await w.vm.focusLocation([30, 30], { animated: false });
    expect(frames.size).toBe(0);
    w.vm.zoomIn();
    expect(frames.size).toBe(1);
    w.vm.resetZoom();
    expect(frames.size).toBe(0);
    w.vm.zoomIn();
    w.unmount();
    expect(frames.size).toBe(0);
});
test('large feature bounds stream coordinates without argument spreading', async () => {
    const [, s] = await chart();
    const coordinates = Array.from({ length: 150000 }, (_, i) => [
        i % 100,
        i % 60,
    ]);
    const bounds = s.computeProjectedBoundsFromFeatures([
        { geometry: { type: 'LineString', coordinates } },
    ]);
    expect(bounds.width).toBeGreaterThan(0);
    expect(bounds.height).toBeGreaterThan(0);
});
test('hover menu and accessible description react correctly', async () => {
    const [w, s] = await chart(
        { userOptions: { showOnChartHover: true } },
        dataset,
        true,
    );
    expect(s.userOptionsVisible).toBe(false);
    await w.trigger('mouseenter');
    expect(s.userOptionsVisible).toBe(true);
    await w.trigger('mouseleave');
    expect(s.userOptionsVisible).toBe(false);
    expect(w.find('svg').attributes('aria-describedby')).toBe(
        w.find('[id^="chart-instructions-"]').attributes('id'),
    );
});

test('projection cache responds to coordinates edited in place', async () => {
    const config = reactive({ map: { geoJson: structuredClone(map) } });
    const [, s] = await chart(config);
    const before = s.areaPaths[0].path;
    config.map.geoJson.features[0].geometry.coordinates[0][0][0] = 5;
    await nextTick();
    expect(s.areaPaths[0].path).not.toBe(before);
});
test('dictionary identities and GeoJSON altitude survive normalization', async () => {
    const [w, s] = await chart(
        {},
        { first: { coordinates: [0, 0] }, second: { coordinates: [5, 5] } },
    );
    const id = s.projectedPoints[1].uid;
    s.onPointEnter(s.projectedPoints[1], 1);
    await w.setProps({
        dataset: {
            second: { coordinates: [6, 6] },
            first: { coordinates: [0, 0] },
        },
    });
    expect(s.highlightedPointKey).toBe(id);
    expect(s.activePointKeyboardIndex).toBe(0);
    await w.setProps({
        dataset: {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: { name: 'Altitude' },
                    geometry: { type: 'Point', coordinates: [1, 2, 300] },
                },
            ],
        },
    });
    expect(s.points[0].coordinates).toEqual([1, 2, 300]);
});
test('reduced motion avoids focus and zoom animation frames', async () => {
    vi.stubGlobal('matchMedia', () => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
    const [w] = await chart();
    await finishFrames();
    await w.vm.focusLocation([10, 10]);
    expect(frames.size).toBe(0);
    w.vm.zoomIn();
    expect(frames.size).toBe(0);
});

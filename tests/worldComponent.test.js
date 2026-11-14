import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import Chart from '../src/components/vue-ui-world.vue';
import geo from '../src/geoProjections';
import WORLD from '../src/resources/worldGeo';
import { createWorldScale, normalizeWorldDataset } from '../src/worldUtils';
import {
    interpolateColorHex,
    convertColorToHex,
    themePalettes,
} from '../src/lib';
import worldThemes from '../src/themes/vue_ui_world.json';

vi.mock('../src/useChartExport', () => ({
    useChartExport: () => ({
        isCallbackImaging: false,
        isCallbackSvg: false,
        generateSvg: vi.fn(),
        onGenerateImage: vi.fn(),
    }),
}));
let wrappers, frames, frameId;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    frameId = 0;
    vi.stubGlobal('requestAnimationFrame', (cb) => {
        frames.set(++frameId, cb);
        return frameId;
    });
    vi.stubGlobal('cancelAnimationFrame', (id) => frames.delete(id));
    vi.stubGlobal(
        'ResizeObserver',
        class {
            observe() {}
            disconnect() {}
        },
    );
    vi.stubGlobal('matchMedia', () => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    }));
});
afterEach(async () => {
    await vi.dynamicImportSettled();
    await flushPromises();
    wrappers.forEach((w) => {
        w.unmount();
        w.element.remove();
    });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(
    config = {},
    dataset = { FRA: { value: 10 }, USA: { value: 100 } },
    real = false,
    extra = {},
) {
    const w = mount(real ? Chart : { ...Chart, render: () => null }, {
        attachTo: document.body,
        props: {
            config: { devHints: { enable: false }, ...config },
            dataset,
            ...extra,
        },
        global: {
            stubs: {
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
                Tooltip: true,
                DataTable: true,
            },
        },
    });
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function flushFrames() {
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((cb) => cb(0));
}
function dragGlobe(state, longitude, latitude) {
    state.svgRef.setPointerCapture = vi.fn();
    state.onPointerDown({
        pointerId: 1,
        button: 0,
        clientX: 100,
        clientY: 100,
    });
    state.onPointerMove({
        pointerId: 1,
        clientX: 100 - longitude * 2 * state.camera.zoom,
        clientY: 100 + latitude * 2 * state.camera.zoom,
    });
    flushFrames();
    state.onPointerUp({ pointerId: 1 });
}
const colors = { min: '#FFFFFF', max: '#000000' };
test('default linear colors preserve interpolation and all projections preserve geometry', async () => {
    const [w, s] = await chart();
    expect(s.getHeatmapColor(55)).toBe(
        interpolateColorHex(
            s.cfgTerritory.colors.min,
            s.cfgTerritory.colors.max,
            10,
            100,
            55,
        ),
    );
    const uid = s.countries.find((c) => c.code === 'FRA').uid;
    for (const projection of Object.keys(geo.projections)) {
        await w.setProps({
            config: { projection, devHints: { enable: false } },
        });
        const country = s.countries.find((c) => c.code === 'FRA');
        expect(country.path).toBe(
            geo.geoToPath(country.geometry, {
                projection,
                width: s.sizes.width,
                height: s.sizes.height,
                center: s.center,
            }),
        );
        expect(country.path).not.toMatch(/NaN|Infinity/);
        expect(country.uid).toBe(uid);
    }
});
test('scales support fixed domains, clamping, log, diverging, quantiles, thresholds and degenerate input', () => {
    const linear = createWorldScale([5, 10], { domain: [0, 100] }, colors);
    expect(linear.color(50)).toBe('#808080');
    expect(linear.color(-100)).toBe(linear.color(0));
    expect(linear.color(200)).toBe(linear.color(100));
    const log = createWorldScale([1, 10, 100], { type: 'log' }, colors);
    expect(log.color(10)).toBe('#808080');
    expect(log.color(0)).toBeNull();
    expect(log.color(-1)).toBeNull();
    const diverging = createWorldScale(
        [-10, 10],
        { type: 'diverging', center: 0, middleColor: '#FF0000' },
        colors,
    );
    expect(diverging.color(0)).toBe('#ff0000');
    const quantile = createWorldScale(
        [1, 2, 3, 100],
        { type: 'quantile', quantileSteps: 2 },
        colors,
    );
    expect(quantile.thresholds).toEqual([2.5]);
    expect(quantile.color(1)).not.toBe(quantile.color(100));
    const threshold = createWorldScale(
        [0, 100],
        {
            type: 'threshold',
            thresholds: [20, 10],
            colors: ['red', 'green', 'blue'],
        },
        colors,
    );
    expect(threshold.thresholds).toEqual([10, 20]);
    expect(threshold.color(10)).toBe('#008000ff');
    for (const values of [[], [0], [5, 5], [NaN, Infinity, null]]) {
        const scale = createWorldScale(values, {}, colors);
        expect(
            scale.stops.every((s) => s.color && !s.color.includes('NaN')),
        ).toBe(true);
    }
});
test('normalization is optional and alpha-3 entries take precedence', () => {
    expect(normalizeWorldDataset({ fr: { value: 5 } }, false)).toEqual({
        FR: { value: 5 },
    });
    expect(
        normalizeWorldDataset({ FRA: { value: 10 }, fr: { value: 5 } }, true),
    ).toEqual({ FRA: { value: 10 } });
});
test('missing and invalid data remain distinct from zero in tooltips, tables and CSV', async () => {
    const [w, s] = await chart(
        {},
        {
            FRA: { value: 0, category: 'A' },
            USA: { value: null },
            JPN: { value: NaN },
            CAN: { value: Infinity },
        },
    );
    expect(s.countries.find((c) => c.code === 'FRA')).toMatchObject({
        value: 0,
        valueStatus: 'valid',
    });
    expect(s.countries.find((c) => c.code === 'USA')).toMatchObject({
        value: null,
        valueStatus: 'missing',
    });
    expect(s.countries.find((c) => c.code === 'JPN')).toMatchObject({
        value: null,
        valueStatus: 'invalid',
    });
    expect(
        s.table.body[
            s.table.head.findIndex((h) => h.name === 'United States of America')
        ],
    ).not.toBe(0);
    const index = s.countries.findIndex((c) => c.code === 'USA');
    s.useTooltip({ datapoint: s.countries[index], seriesIndex: index });
    await nextTick();
    expect(s.tooltipContent).toContain('—');
    const csv = vi.fn();
    s.generateCsv(csv);
    await nextTick();
    expect(csv).toHaveBeenCalled();
    expect(csv.mock.calls[0][0]).toContain('—');
    expect(csv.mock.calls[0][0]).toContain('A');
    await w.setProps({ dataset: { FRA: { value: 42 } } });
    expect(s.colorScale.domain).toEqual([42, 42]);
    expect(s.getHeatmapColor(42)).not.toContain('NaN');
});
test('selection persists, refreshes current values silently, supports multiple and controlled models', async () => {
    const enter = vi.fn(),
        click = vi.fn();
    const [w, s] = await chart({
        selection: { enabled: true, multiple: true },
        events: { datapointEnter: enter, datapointClick: click },
    });
    let france = s.countries.find((c) => c.code === 'FRA');
    s.onTrapClick({ datapoint: france, seriesIndex: 0 });
    await nextTick();
    expect(s.selectedCodes).toEqual(['FRA']);
    expect(s.selectedDatapoint.code).toBe('FRA');
    await w.setProps({ dataset: { FRA: { value: 999 }, USA: { value: 1 } } });
    expect(s.selectedDatapoint.value).toBe(999);
    expect(s.tooltipContent).toContain('999');
    expect(enter).not.toHaveBeenCalled();
    expect(click).toHaveBeenCalledTimes(1);
    s.onTrapClick({
        datapoint: s.countries.find((c) => c.code === 'USA'),
        seriesIndex: 1,
    });
    await nextTick();
    expect(s.selectedCodes).toEqual(['FRA', 'USA']);
    await w.setProps({ selectedCountries: ['FRA'] });
    expect(s.selectedCodes).toEqual(['FRA']);
    s.onTrapClick({
        datapoint: s.countries.find((c) => c.code === 'USA'),
        seriesIndex: 1,
    });
    await nextTick();
    expect(w.emitted('update:selectedCountries').at(-1)[0]).toEqual([
        'FRA',
        'USA',
    ]);
    expect(s.selectedCodes).toEqual(['FRA']);
    s.clearSelection();
    expect(w.emitted('update:selectedCountries').at(-1)[0]).toEqual([]);
});
test('country paths support keyboard focus, selection, dismissal and localized labels', async () => {
    const [w, s] = await chart(
        {
            projection: 'equirectangular',
            selection: { enabled: true },
            countryNames: { FRA: 'France personnalisée' },
        },
        { FRA: { value: 10 } },
        true,
    );
    const france = w.find('[data-country="FRA"]');
    expect(france.attributes('aria-label')).toContain(
        'France personnalisée: 10',
    );
    france.element.focus();
    await nextTick();
    expect(document.activeElement).toBe(france.element);
    expect(s.keyboardTooltip).toBe(true);
    await france.trigger('keydown', { key: 'Enter' });
    expect(s.selectedCodes).toEqual(['FRA']);
    await france.trigger('keydown', { key: 'ArrowRight' });
    expect(document.activeElement).not.toBe(france.element);
    await france.trigger('keydown', { key: 'Escape' });
    expect(s.selectedCodes).toEqual([]);
    expect(w.find('svg[data-cy="world-svg"]').attributes('role')).toBe('group');
});
test('navigation zooms within limits, fits countries, resets and rotates with keyboard', async () => {
    const [w, s] = await chart(
        {
            style: { chart: { zoom: { show: true, maxZoom: 4 } } },
            projection: 'equirectangular',
        },
        undefined,
        true,
    );
    const initial = { ...s.viewBox };
    s.zoomIn();
    await nextTick();
    expect(s.viewBox.width).toBeLessThan(initial.width);
    for (let i = 0; i < 10; i++) s.zoomIn();
    expect(s.camera.zoom).toBe(4);
    expect(w.vm.focusCountry('FRA')).toBe(true);
    expect(s.camera.zoom).toBeGreaterThan(1);
    expect(w.vm.focusCountry('UNKNOWN')).toBe(false);
    s.resetView();
    expect(s.viewBox).toEqual(initial);
    await w.setProps({
        config: {
            projection: 'globe',

            style: {
                chart: {
                    zoom: { show: true },
                    globe: { center: { x: 10, y: 20 } },
                },
            },
        },
    });
    expect(s.center).toEqual([10, 20]);
    await w
        .find('[data-cy="world-svg"]')
        .trigger('keydown', { key: 'ArrowRight' });
    expect(s.center).toEqual([20, 20]);
    expect(w.emitted('viewChange').length).toBeGreaterThan(0);
});
test('point overlays validate coordinates, hide behind the globe, scale bubble areas and emit original data', async () => {
    const points = [
        { id: 'front', name: 'Front', coordinates: [0, 0], value: 100 },
        { id: 'small', coordinates: [10, 0], value: 25 },
        { id: 'back', coordinates: [180, 0], radius: 3 },
        { id: 'bad', coordinates: [NaN, 0] },
    ];
    const [w, s] = await chart({}, undefined, true, { points });
    expect(s.projectedPoints.map((p) => p.id)).toEqual(['front', 'small']);
    expect(s.projectedPoints[1].radius / s.projectedPoints[0].radius).toBe(0.5);
    await w.find('.vue-ui-world-points circle').trigger('click');
    expect(w.emitted('selectPoint')[0][0]).toEqual(points[0]);
    await w.setProps({ config: { projection: 'equirectangular' } });
    expect(s.projectedPoints).toHaveLength(3);
});
test('pointer drag is frame-coalesced, suppresses click, supports panning, and cleans up', async () => {
    const [w, s] = await chart(
        {
            style: { chart: { zoom: { show: true } } },
            projection: 'equirectangular',
        },
        undefined,
        true,
    );
    const svg = w.find('[data-cy="world-svg"]');
    svg.element.getBoundingClientRect = () => ({
        width: 1000,
        height: 500,
        left: 0,
        top: 0,
    });
    svg.element.setPointerCapture = vi.fn();
    s.onPointerDown({ pointerId: 1, button: 0, clientX: 100, clientY: 100 });
    s.onPointerMove({ pointerId: 1, clientX: 150, clientY: 100 });
    s.onPointerMove({ pointerId: 1, clientX: 200, clientY: 100 });
    expect(s.suppressClick).toBe(true);
    expect(svg.element.setPointerCapture).toHaveBeenCalled();
    const before = s.viewBox.minX;
    flushFrames();
    await nextTick();
    expect(s.viewBox.minX).toBeLessThan(before);
    s.onPointerUp({ pointerId: 1 });
    s.onTrapClick({ datapoint: s.countries[0], seriesIndex: 0 });
    expect(w.emitted('selectDatapoint')).toBeUndefined();
    s.onPointerDown({ pointerId: 2, button: 0, clientX: 100, clientY: 100 });
    s.onPointerMove({ pointerId: 2, clientX: 150, clientY: 100 });
    w.unmount();
    wrappers = wrappers.filter((x) => x !== w);
    expect(frames.size).toBe(0);
});
test('territory merge is reversible and never mutates shared geometry', async () => {
    const original = JSON.stringify(WORLD);
    const [w, s] = await chart({
        style: { chart: { territory: { showTaiwanAsPartOfChina: true } } },
    });
    expect(s.countries.some((c) => c.code === 'TWN')).toBe(false);
    await w.setProps({ config: {} });
    expect(s.countries.some((c) => c.code === 'TWN')).toBe(true);
    expect(JSON.stringify(WORLD)).toBe(original);
});

test('presentation updates preserve navigation and globe backgrounds stay fixed while zooming', async () => {
    const [w, s] = await chart(
        { style: { chart: { zoom: { show: true } } } },
        undefined,
        true,
    );
    dragGlobe(s, 25, 10);
    s.zoomIn();
    await nextTick();
    const view = { ...s.viewBox };
    const background = w.find('[data-cy="world-svg"] > g > circle');
    const radius = background.attributes('r');
    await w.setProps({
        config: {
            style: { chart: { zoom: { show: true }, color: '#123456' } },
        },
    });
    expect(s.center).toEqual([25, 10]);
    expect(s.viewBox).toEqual(view);
    s.zoomIn();
    await nextTick();
    expect(background.attributes('r')).toBe(radius);
    await w.setProps({ points: [{ coordinates: [0, 0], value: 0.1 }] });
    expect(s.projectedPoints[0].radius).toBe(25);
});

test('pinch zoom, wheel opt-in, page scrolling, and gesture cancellation follow navigation settings', async () => {
    const [w, s] = await chart(
        {
            style: { chart: { zoom: { show: true } } },
            projection: 'equirectangular',
        },
        undefined,
        true,
    );
    const svg = w.find('[data-cy="world-svg"]');
    svg.element.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 500,
    });
    svg.element.setPointerCapture = vi.fn();
    s.onPointerDown({ pointerId: 1, clientX: 100, clientY: 100 });
    s.onPointerDown({ pointerId: 2, clientX: 200, clientY: 100 });
    s.onPointerMove({ pointerId: 2, clientX: 300, clientY: 100 });
    flushFrames();
    await nextTick();
    expect(s.camera.zoom).toBe(2);
    s.onPointerUp({ pointerId: 2 });
    s.onPointerUp({ pointerId: 1 });
    const preventDefault = vi.fn();
    s.onWheel({ deltaY: -100, clientX: 200, clientY: 100, preventDefault });
    expect(preventDefault).toHaveBeenCalled();
    expect(s.camera.zoom).toBeGreaterThan(2);
    await w.setProps({
        config: {
            projection: 'globe',
            style: { chart: { zoom: { show: false } } },
        },
    });
    expect(svg.element.style.touchAction).toBe('pan-y');
    const before = s.camera.zoom;
    preventDefault.mockClear();
    s.onWheel({ deltaY: 100, clientX: 0, clientY: 0, preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(s.camera.zoom).toBe(before);
    s.onPointerDown({ pointerId: 3, clientX: 100, clientY: 100 });
    s.onPointerMove({ pointerId: 3, clientX: 300, clientY: 100 });
    await w.setProps({ config: { projection: 'mercator' } });
    expect(s.dragging).toBe(false);
    expect(s.suppressClick).toBe(false);
    flushFrames();
    await nextTick();
    expect(s.center).toEqual([0, 0]);
});

test('empty logarithmic scales and log-invalid values never produce nonfinite colors', async () => {
    const scale = createWorldScale([0, -1, NaN], { type: 'log' }, colors);
    expect(scale.domain).toEqual([1, 10]);
    expect(scale.stops.every((stop) => !stop.color.includes('NaN'))).toBe(true);
    const [w, s] = await chart(
        {
            style: {
                chart: {
                    colorScale: { type: 'log' },
                    territory: { invalidColor: '#ff00ff' },
                },
            },
        },
        { FRA: { value: 0 }, USA: { value: -1 } },
    );
    expect(s.countries.find((c) => c.code === 'FRA')).toMatchObject({
        value: 0,
        valueStatus: 'invalid',
        color: '#ff00ffff',
    });
    const index = s.table.head.findIndex((h) => h.name === 'France');
    expect(s.table.body[index]).toBe('—');
    await w.setProps({ dataset: { FRA: { value: 10 } } });
    expect(s.countries.find((c) => c.code === 'FRA').valueStatus).toBe('valid');
});

test('base country borders stay unchanged while geographic selection strokes render above patterns', async () => {
    const wrapper = mount(Chart, {
        attachTo: document.body,
        props: {
            dataset: { FRA: { value: 1 } },
            config: {
                devHints: { enable: false },
                projection: 'equirectangular',
                selection: { enabled: true },
                style: {
                    chart: {
                        territory: { strokeWidth: 0.5, strokeWidthSelected: 8 },
                    },
                },
            },
        },
        slots: { pattern: '<pattern id="test-world-pattern" />' },
        global: {
            stubs: {
                PenAndPaper: true,
                UserOptions: true,
                PackageVersion: true,
                Tooltip: true,
            },
        },
    });
    wrappers.push(wrapper);
    await flushPromises();
    const france = wrapper.find('[data-country="FRA"]');
    const paths = wrapper.findAll('.vue-ui-world-territory');
    const pathCount = paths.length;
    await france.trigger('mouseenter');
    france.element.focus();
    await nextTick();
    expect(france.attributes('stroke-width')).toBe('0.5');
    expect(wrapper.findAll('.vue-ui-world-territory')).toHaveLength(pathCount);
    await france.trigger('click');
    expect(france.attributes('aria-pressed')).toBe('true');
    expect(france.attributes('stroke-width')).toBe('0.5');
    expect(wrapper.findAll('.vue-ui-world-territory')).toHaveLength(pathCount);
    const selected = wrapper.find('[data-selected-country="FRA"]');
    expect(selected.attributes('d')).toBe(france.attributes('d'));
    expect(selected.attributes('fill')).toBe('none');
    expect(selected.attributes('stroke-width')).toBe('8');
    expect(selected.attributes('vector-effect')).toBe('non-scaling-stroke');
    const layer = wrapper.find('.vue-ui-world-selection');
    expect(layer.attributes('pointer-events')).toBe('none');
    expect(layer.attributes('aria-hidden')).toBe('true');
    expect(layer.element.parentElement.lastElementChild).toBe(layer.element);
    expect(layer.find('rect').exists()).toBe(false);

    for (const path of wrapper
        .findAll('.vue-ui-world-territory')
        .filter((path) =>
            path.attributes('fill')?.startsWith('url(#pattern_'),
        )) {
        expect(path.attributes('stroke')).toBe('none');
    }
});

test('selected countries do not pin cursor tooltips or block highlighting other countries', async () => {
    const [w, s] = await chart(
        { projection: 'equirectangular', selection: { enabled: true } },
        { FRA: { value: 10 }, DEU: { value: 20 } },
        true,
    );
    const france = w.find('[data-country="FRA"]');
    const germany = w.find('[data-country="DEU"]');
    const normalFill = germany.attributes('fill');
    await france.trigger('mouseenter');
    france.element.focus();
    await nextTick();
    expect(s.keyboardTooltip).toBe(true);
    await france.trigger('click');
    expect(s.selectedCodes).toEqual(['FRA']);
    expect(s.keyboardTooltip).toBe(false);
    await france.trigger('mouseleave');
    expect(s.isTooltip).toBe(false);
    await germany.trigger('mouseenter');
    expect(s.selectedDatapoint.code).toBe('DEU');
    expect(s.tooltipContent).toContain('Germany');
    expect(s.keyboardTooltip).toBe(false);
    expect(germany.attributes('fill')).not.toBe(normalFill);
    expect(germany.attributes('stroke-width')).toBe(
        String(s.cfgTerritory.strokeWidth),
    );
    expect(s.selectedCodes).toEqual(['FRA']);
    await germany.trigger('mouseleave');
    expect(germany.attributes('fill')).toBe(normalFill);
    expect(s.isTooltip).toBe(false);
    germany.element.focus();
    await nextTick();
    expect(s.keyboardTooltip).toBe(true);
    await germany.trigger('mousemove');
    expect(s.keyboardTooltip).toBe(false);
});

test('pointer focus and click never switch a cursor tooltip to a keyboard anchor', async () => {
    const [w, s] = await chart(
        { projection: 'equirectangular', selection: { enabled: true } },
        undefined,
        true,
    );
    const france = w.find('[data-country="FRA"]');
    await france.trigger('mouseenter');
    expect(s.keyboardTooltip).toBe(false);
    await france.trigger('pointerdown');
    france.element.focus();
    await nextTick();
    expect(s.keyboardTooltip).toBe(false);
    expect(s.tooltipAnchor).toBeNull();
    await france.trigger('pointerup');
    await france.trigger('click');
    expect(s.keyboardTooltip).toBe(false);
    expect(s.tooltipAnchor).toBeNull();
    expect(s.selectedCodes).toEqual(['FRA']);
    france.element.blur();
    france.element.focus();
    await nextTick();
    expect(s.keyboardTooltip).toBe(true);
    expect(s.tooltipAnchor).not.toBeNull();
});

test('point tooltips follow hover, share value formatting and preserve country selection', async () => {
    const points = [
        { id: 'paris', name: 'Paris', coordinates: [2.35, 48.86], value: 100 },
        { id: 'berlin', name: 'Berlin', coordinates: [13.4, 52.52] },
    ];
    const [w, s] = await chart(
        {
            projection: 'equirectangular',
            selection: { enabled: true },
            style: {
                chart: {
                    dataLabels: { prefix: '$', suffix: ' USD', rounding: 0 },
                },
            },
        },
        undefined,
        true,
        { points },
    );
    await w.find('[data-country="FRA"]').trigger('click');
    const paris = w.find('[data-world-point="0"]');
    await paris.trigger('mouseenter');
    expect(s.keyboardTooltip).toBe(false);
    expect(s.dataTooltipSlot).toMatchObject({
        kind: 'point',
        datapoint: points[0],
        series: points,
    });
    expect(s.tooltipContent).toContain('Paris');
    expect(s.tooltipContent).toContain('$100 USD');
    expect(s.tooltipContent).not.toContain('minimap');
    expect(s.selectedCodes).toEqual(['FRA']);
    await paris.trigger('mouseleave');
    expect(s.isTooltip).toBe(false);
    const berlin = w.find('[data-world-point="1"]');
    berlin.element.focus();
    await nextTick();
    expect(s.keyboardTooltip).toBe(true);
    expect(s.tooltipAnchor).not.toBeNull();
    expect(s.tooltipContent).toContain('Berlin');
    expect(s.tooltipContent).not.toContain('—');
    await berlin.trigger('mousemove');
    expect(s.keyboardTooltip).toBe(false);
    await berlin.trigger('click');
    expect(w.emitted('selectPoint').at(-1)[0]).toEqual(points[1]);
    expect(s.selectedCodes).toEqual(['FRA']);
    await w.find('[data-country="DEU"]').trigger('mouseenter');
    expect(s.dataTooltipSlot.kind).toBe('country');
    expect(s.tooltipContent).toContain('Germany');
});

test('point tooltip formatter and slots receive live original points and follow stable IDs', async () => {
    const customFormat = vi.fn(
        ({ kind, datapoint }) =>
            `${kind}: ${datapoint.name} ${datapoint.value}`,
    );
    const points = [
        { id: 'a', name: 'A', coordinates: [0, 0], value: 10 },
        { id: 'b', name: 'B', coordinates: [10, 0], value: 20 },
    ];
    const [w, s] = await chart(
        { style: { chart: { tooltip: { customFormat } } } },
        undefined,
        true,
        { points },
    );
    await w.find('[data-world-point="0"]').trigger('mouseenter');
    expect(s.tooltipContent).toBe('point: A 10');
    expect(customFormat.mock.calls.at(-1)[0]).toMatchObject({
        kind: 'point',
        datapoint: points[0],
        series: points,
    });
    await w.setProps({ points: [points[1], { ...points[0], value: 99 }] });
    expect(s.tooltipContent).toBe('point: A 99');
    expect(s.activePoint.index).toBe(1);
    await w.setProps({ points: [points[1]] });
    expect(s.isTooltip).toBe(false);
});

test('hidden and occluded points dismiss their active tooltip', async () => {
    const [w, s] = await chart(
        { style: { chart: { zoom: { show: true } } } },
        undefined,
        true,
        {
            points: [{ id: 'a', name: 'A', coordinates: [0, 0], value: 0 }],
        },
    );
    await w.find('[data-world-point="0"]').trigger('mouseenter');
    expect(s.isTooltip).toBe(true);
    dragGlobe(s, 180, 0);
    await nextTick();
    expect(s.isTooltip).toBe(false);
    dragGlobe(s, -180, 0);
    await nextTick();
    await w.find('[data-world-point="0"]').trigger('mouseenter');
    expect(s.tooltipContent).toContain('0');
    await w.setProps({
        config: { style: { chart: { points: { show: false } } } },
    });
    expect(s.isTooltip).toBe(false);
});

test('point maxRadius and default fill react to config while individual colors take precedence', async () => {
    const points = [
        { id: 'default', coordinates: [0, 0], value: 100 },
        { id: 'custom', coordinates: [10, 0], value: 25, color: '#ff0000' },
    ];
    const [w, s] = await chart(
        { style: { chart: { points: { maxRadius: 40, color: '#0000ff' } } } },
        undefined,
        true,
        { points },
    );
    expect(s.projectedPoints.map((p) => p.radius)).toEqual([40, 20]);
    expect(w.find('[data-world-point="0"]').attributes('fill')).toBe(
        '#0000ffff',
    );
    expect(w.find('[data-world-point="1"]').attributes('fill')).toBe('#ff0000');
    await w.setProps({
        config: {
            style: { chart: { points: { maxRadius: 20, color: '#00ff00' } } },
        },
    });
    expect(s.projectedPoints.map((p) => p.radius)).toEqual([20, 10]);
    expect(w.find('[data-world-point="0"]').attributes('fill')).toBe(
        '#00ff00ff',
    );
    expect(w.find('[data-world-point="1"]').attributes('fill')).toBe('#ff0000');
    expect(points[1].color).toBe('#ff0000');
});

test('standard refresh button appears after navigation and resets through the shared animated method', async () => {
    const [w, s] = await chart(
        {
            style: { chart: { zoom: { show: true } } },
            projection: 'equirectangular',
        },
        undefined,
        true,
    );
    const original = { ...s.viewBox };
    expect(w.find('[data-cy-reset]').exists()).toBe(false);
    s.zoomIn();
    await nextTick();
    const button = w.find('[data-cy-reset]');
    expect(button.classes()).toContain('vue-data-ui-refresh-button');
    expect(button.attributes('aria-label')).toBe('Reset zoom');
    await button.trigger('click');
    flushFrames();
    await nextTick();
    const callbacks = [...frames.values()];
    frames.clear();
    callbacks.forEach((callback) => callback(300));
    await nextTick();
    expect(s.viewBox).toEqual(original);
    expect(w.find('[data-cy-reset]').exists()).toBe(false);
    await w.setProps({
        config: {
            projection: 'globe',
            style: { chart: { zoom: { show: true } } },
        },
    });
    dragGlobe(s, 30, 10);
    await nextTick();
    expect(w.find('[data-cy-reset]').exists()).toBe(true);
    w.vm.resetZoom();
    await nextTick();
    expect(s.center).toEqual([0, 0]);
    expect(w.find('[data-cy-reset]').exists()).toBe(false);
});

test('style.chart.zoom.show alone enables both flat-map panning and zooming', async () => {
    const [w, s] = await chart(
        {
            style: { chart: { zoom: { show: false } } },
            projection: 'equirectangular',
        },
        undefined,
        true,
    );
    const svg = w.find('[data-cy="world-svg"]');
    svg.element.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 500,
    });
    svg.element.setPointerCapture = vi.fn();
    const initial = { ...s.viewBox };
    const drag = () => {
        s.onPointerDown({ pointerId: 1, clientX: 100, clientY: 100 });
        s.onPointerMove({ pointerId: 1, clientX: 200, clientY: 100 });
        flushFrames();
        s.onPointerUp({ pointerId: 1 });
    };
    const preventDefault = vi.fn();
    drag();
    s.onWheel({ deltaY: -100, clientX: 100, clientY: 100, preventDefault });
    expect(s.viewBox).toEqual(initial);
    expect(preventDefault).not.toHaveBeenCalled();
    expect(svg.element.style.touchAction).toBe('auto');
    await w.setProps({
        config: {
            style: { chart: { zoom: { show: true } } },
            projection: 'equirectangular',
        },
    });
    drag();
    await nextTick();
    expect(s.viewBox.minX).toBeLessThan(initial.minX);
    s.onWheel({ deltaY: -100, clientX: 100, clientY: 100, preventDefault });
    await nextTick();
    expect(s.camera.zoom).toBeGreaterThan(1);
    expect(preventDefault).toHaveBeenCalled();
    expect(svg.element.style.touchAction).toBe('none');
    expect(w.find('.vue-ui-world-navigation').exists()).toBe(false);
    await w.setProps({
        config: {
            style: { chart: { zoom: { show: false } } },
            projection: 'equirectangular',
        },
    });
    const stopped = { ...s.viewBox };
    drag();
    expect(s.viewBox).toEqual(stopped);
});

test('gradient legend band dimensions follow config', async () => {
    const [w] = await chart(
        {
            style: {
                chart: {
                    colorScale: {
                        type: 'diverging',
                        domain: [-100, 100],
                        legend: {
                            show: true,
                            gradient: { height: 24, borderRadius: 8 },
                        },
                    },
                },
            },
        },
        undefined,
        true,
    );
    const gradient = w.find('.vue-ui-world-gradient');
    expect(gradient.exists()).toBe(true);
    expect(gradient.element.style.height).toBe('24px');
    expect(gradient.element.style.borderRadius).toBe('8px');
    await w.setProps({
        config: {
            style: {
                chart: {
                    colorScale: {
                        legend: {
                            show: true,
                            gradient: { height: 6, borderRadius: 0 },
                        },
                    },
                },
            },
        },
    });
    expect(gradient.element.style.height).toBe('6px');
    expect(gradient.element.style.borderRadius).toBe('0px');
});

test('selected paths follow controlled multiple selection, colors, geometry and disabled state', async () => {
    const [w, s] = await chart(
        {
            projection: 'equirectangular',
            selection: { enabled: true, multiple: true },
        },
        undefined,
        true,
        { selectedCountries: ['FRA', 'DEU'] },
    );
    expect(
        w
            .findAll('[data-selected-country]')
            .map((p) => p.attributes('data-selected-country')),
    ).toEqual(
        s.countries
            .filter((c) => ['FRA', 'DEU'].includes(c.code))
            .map((c) => c.code),
    );
    expect(w.find('[data-selected-country="FRA"]').attributes('stroke')).toBe(
        '#333333ff',
    );
    await w.setProps({
        config: {
            devHints: { enable: false },
            projection: 'equirectangular',
            selection: { enabled: true, multiple: true, color: '#ff0000' },
        },
    });
    expect(w.find('[data-selected-country="FRA"]').attributes('stroke')).toBe(
        '#ff0000ff',
    );
    await w.setProps({ selectedCountries: ['DEU'] });
    expect(w.find('[data-selected-country="FRA"]').exists()).toBe(false);
    expect(w.find('[data-selected-country="DEU"]').attributes('d')).toBe(
        w.find('[data-country="DEU"]').attributes('d'),
    );
    s.zoomIn();
    await nextTick();
    expect(
        w.find('[data-selected-country="DEU"]').attributes('vector-effect'),
    ).toBe('non-scaling-stroke');
    await w.setProps({
        config: {
            devHints: { enable: false },
            projection: 'equirectangular',
            selection: { enabled: false },
        },
    });
    expect(w.findAll('[data-selected-country]')).toHaveLength(0);
});

test.each(Object.keys(worldThemes).filter((name) => name !== 'default'))(
    'theme %s applies selection, points, territories, globe and scale colors',
    async (theme) => {
        const expected = worldThemes[theme];
        const [w, s] = await chart(
            {
                theme,
                projection: 'equirectangular',
                selection: { enabled: true },
            },
            undefined,
            true,
            {
                selectedCountries: ['FRA'],
                points: [
                    { coordinates: [0, 0], value: 1 },
                    { coordinates: [10, 0], value: 1, color: '#abcdef' },
                ],
            },
        );
        const chartTheme = expected.style.chart;
        expect(s.FINAL_CONFIG.selection.color).toBe(
            convertColorToHex(expected.selection.color),
        );
        expect(s.cfgChart.points.color).toBe(
            convertColorToHex(chartTheme.points.color),
        );
        expect(s.cfgChart.points.stroke).toBe(
            convertColorToHex(chartTheme.points.stroke),
        );
        expect(s.cfgTerritory.emptyColor).toBe(
            convertColorToHex(chartTheme.territory.emptyColor),
        );
        expect(s.cfgTerritory.invalidColor).toBe(
            convertColorToHex(chartTheme.territory.invalidColor),
        );
        expect(s.cfgTerritory.colors.min).toBe(
            convertColorToHex(chartTheme.territory.colors.min),
        );
        expect(s.cfgTerritory.colors.max).toBe(
            convertColorToHex(themePalettes[theme][0]),
        );
        expect(s.cfgChart.globe.waterColor).toBe(
            convertColorToHex(chartTheme.globe.waterColor),
        );
        expect(s.cfgChart.colorScale.middleColor).toBe(
            convertColorToHex(chartTheme.colorScale.middleColor),
        );
        expect(
            w.find('[data-selected-country="FRA"]').attributes('stroke'),
        ).toBe(s.FINAL_CONFIG.selection.color);
        expect(w.find('[data-world-point="0"]').attributes('fill')).toBe(
            s.cfgChart.points.color,
        );
        expect(w.find('[data-world-point="1"]').attributes('fill')).toBe(
            '#abcdef',
        );
    },
);

test('explicit colors and palettes override themes, and changing or removing a theme refreshes defaults', async () => {
    const [w, s] = await chart({
        theme: 'dark',
        selection: { color: '#123456' },
        customPalette: ['#ff0000'],
        style: {
            chart: {
                points: { color: '#654321', stroke: '#abcdef' },
                territory: {
                    emptyColor: '#112233',
                    invalidColor: '#445566',
                    colors: { min: '#778899', max: '#aabbcc' },
                },
                colorScale: { middleColor: '#556677' },
                globe: { waterColor: '#998877' },
            },
        },
    });
    expect(s.FINAL_CONFIG.selection.color).toBe('#123456ff');
    expect(s.cfgChart.points).toMatchObject({
        color: '#654321ff',
        stroke: '#abcdefff',
    });
    expect(s.cfgTerritory).toMatchObject({
        emptyColor: '#112233ff',
        invalidColor: '#445566ff',
        colors: { min: '#778899ff', max: '#aabbccff' },
    });
    expect(s.cfgChart.colorScale.middleColor).toBe('#556677ff');
    expect(s.cfgChart.globe.waterColor).toBe('#998877ff');
    await w.setProps({
        config: {
            theme: 'hack',
            customPalette: ['#ff0000'],
            devHints: { enable: false },
        },
    });
    expect(s.cfgTerritory.colors.max).toBe('#ff0000ff');
    expect(s.FINAL_CONFIG.selection.color).toBe(
        convertColorToHex(worldThemes.hack.selection.color),
    );
    await w.setProps({ config: { devHints: { enable: false } } });
    expect(s.FINAL_CONFIG.selection.color).toBe('#333333ff');
    expect(s.cfgChart.backgroundColor).toBe('#FFFFFFff');
    expect(s.cfgTerritory.emptyColor).toBe('#E0E0E0ff');
    expect(s.FINAL_CONFIG.customPalette).toEqual([]);
});

test('nested zoom settings fit the requested countries before the named region and retain all country data', async () => {
    const [baseline, s] = await chart({
        projection: 'equirectangular',
        style: { chart: { zoom: { show: true, maxZoom: 5 } } },
    });
    s.fitCountries(['FRA', 'DEU']);
    await nextTick();
    const expected = { ...s.viewBox };
    const [w, current] = await chart({
        projection: 'equirectangular',
        style: {
            chart: {
                zoom: {
                    show: true,
                    maxZoom: 5,
                    region: 'africa',
                    countries: ['FRA', 'DEU'],
                },
            },
        },
    });
    expect(current.viewBox).toEqual(expected);
    expect(current.countries).toHaveLength(s.countries.length);
    expect(current.cfgZoom).toMatchObject({
        show: true,
        minZoom: 1,
        maxZoom: 5,
        region: 'africa',
        countries: ['FRA', 'DEU'],
    });
    expect(Object.hasOwn(current.FINAL_CONFIG, 'navigation')).toBe(false);
});

test('UserOptions zoom lock cancels gestures without resetting the viewport and unlock restores them', async () => {
    const [w, s] = await chart(
        {
            projection: 'equirectangular',
            style: { chart: { zoom: { show: true } } },
        },
        undefined,
        true,
    );
    const svg = w.find('[data-cy="world-svg"]');
    svg.element.getBoundingClientRect = () => ({
        left: 0,
        top: 0,
        width: 1000,
        height: 500,
    });
    svg.element.setPointerCapture = vi.fn();
    const options = w.findComponent({ name: 'UserOptions' });
    expect(options.exists()).toBe(true);
    expect(options.attributes('haszoom')).toBe('true');
    s.zoomIn();
    await nextTick();
    const zoomed = { ...s.viewBox };
    s.onPointerDown({ pointerId: 1, clientX: 100, clientY: 100 });
    s.onPointerMove({ pointerId: 1, clientX: 200, clientY: 100 });
    options.vm.$emit('toggleZoom');
    await nextTick();
    flushFrames();
    expect(s.mutableConfig.showZoom).toBe(false);
    expect(s.dragging).toBe(false);
    expect(s.viewBox).toEqual(zoomed);
    expect(svg.element.style.touchAction).toBe('auto');
    const preventDefault = vi.fn();
    s.onWheel({ deltaY: -100, clientX: 100, clientY: 100, preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(s.viewBox).toEqual(zoomed);
    w.vm.toggleZoom();
    await nextTick();
    expect(s.mutableConfig.showZoom).toBe(true);
    expect(svg.element.style.touchAction).toBe('none');
    s.onWheel({ deltaY: -100, clientX: 100, clientY: 100, preventDefault });
    await nextTick();
    expect(preventDefault).toHaveBeenCalled();
    expect(s.camera.zoom).toBeGreaterThan(1.5);
});

test('globe atmosphere can overflow at rest and after rotation, while zoomed viewports stay clipped', async () => {
    const [w, s] = await chart(
        { style: { chart: { zoom: { show: true } } } },
        undefined,
        true,
    );
    const svg = w.find('[data-cy="world-svg"]');
    expect(svg.element.style.overflow).toBe('visible');
    dragGlobe(s, 20, 10);
    await nextTick();
    expect(s.isZoom).toBe(true);
    expect(s.isViewportZoomed).toBe(false);
    expect(svg.element.style.overflow).toBe('visible');
    s.zoomIn();
    await nextTick();
    expect(svg.element.style.overflow).toBe('hidden');
    s.toggleZoom();
    await nextTick();
    expect(svg.element.style.overflow).toBe('hidden');
    s.resetView();
    await nextTick();
    expect(svg.element.style.overflow).toBe('visible');
    await w.setProps({ config: { projection: 'equirectangular' } });
    expect(svg.element.style.overflow).toBe('hidden');
});

test('globe rotates with zoom disabled while wheel and pinch cannot change the viewport', async () => {
    const [w, s] = await chart(
        { projection: 'globe', style: { chart: { zoom: { show: false } } } },
        undefined,
        true,
    );
    const svg = w.find('[data-cy="world-svg"]');
    const initial = { ...s.viewBox };
    dragGlobe(s, 30, 10);
    await nextTick();
    expect(s.center).toEqual([30, 10]);
    expect(s.viewBox).toEqual(initial);
    expect(svg.element.style.touchAction).toBe('pan-y');
    const preventDefault = vi.fn();
    s.onWheel({ deltaY: -100, clientX: 100, clientY: 100, preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
    expect(s.viewBox).toEqual(initial);
    s.onPointerDown({ pointerId: 1, clientX: 100, clientY: 100 });
    s.onPointerDown({ pointerId: 2, clientX: 200, clientY: 100 });
    s.onPointerMove({ pointerId: 2, clientX: 300, clientY: 100 });
    flushFrames();
    s.onPointerUp({ pointerId: 2 });
    s.onPointerUp({ pointerId: 1 });
    expect(s.viewBox).toEqual(initial);
    await svg.trigger('keydown', { key: 'ArrowRight' });
    expect(s.center).toEqual([40, 10]);
    s.toggleZoom();
    await nextTick();
    s.toggleZoom();
    await nextTick();
    dragGlobe(s, 10, 0);
    await nextTick();
    expect(s.center).toEqual([50, 10]);
});

test.each([
    ['linear', [0, 100]],
    ['diverging', [-100, 100]],
    ['log', [1, 10000]],
])(
    'component preserves explicit %s color domains across data updates and themes',
    async (type, domain) => {
        const config = {
            theme: 'dark',
            style: { chart: { colorScale: { type, domain } } },
        };
        const [w, s] = await chart(config, {
            FRA: { value: 10 },
            DEU: { value: 20 },
        });
        expect(s.cfgChart.colorScale.domain).toEqual(domain);
        expect(s.colorScale.domain).toEqual(domain);
        const color = s.getHeatmapColor(50);
        await w.setProps({
            dataset: { FRA: { value: 50 }, DEU: { value: 60 } },
        });
        expect(s.colorScale.domain).toEqual(domain);
        expect(s.getHeatmapColor(50)).toBe(color);
        await w.setProps({
            config: {
                style: { chart: { colorScale: { type, domain: null } } },
            },
        });
        expect(s.colorScale.domain).toEqual([50, 60]);
        expect(domain).toEqual(config.style.chart.colorScale.domain);
    },
);

test('points alone render the map, recover from empty input, and still respect explicit loading', async () => {
    const point = {
        id: 'origin',
        name: 'Origin',
        coordinates: [0, 0],
        value: 10,
    };
    const [w, s] = await chart({}, {}, true, { points: [] });
    expect(s.loading).toBe(true);
    await w.setProps({ points: [{ coordinates: [999, 0], value: 100 }] });
    expect(s.loading).toBe(true);
    await w.setProps({ points: [point] });
    expect(s.loading).toBe(false);
    expect(w.find('[data-world-point="0"]').exists()).toBe(true);
    expect(w.find('[data-country="FRA"]').exists()).toBe(true);
    await w.find('[data-world-point="0"]').trigger('mouseenter');
    expect(s.tooltipContent).toContain('Origin');
    await w.setProps({ dataset: null });
    expect(w.find('[data-country="FRA"]').exists()).toBe(true);
    await w.setProps({ config: { loading: true } });
    expect(s.loading).toBe(true);
    expect(w.find('[data-world-point="0"]').exists()).toBe(false);
    await w.setProps({ config: { loading: false } });
    expect(s.loading).toBe(false);
    await w.setProps({ points: [] });
    expect(s.loading).toBe(true);
});

test('invalid-coordinate points do not shrink valid bubbles or alter source indices', async () => {
    const points = [
        { coordinates: [999, 0], value: 1000000 },
        { id: 'valid', coordinates: [0, 0], value: 1 },
    ];
    const [w, s] = await chart({}, {}, true, { points });
    expect(s.projectedPoints).toHaveLength(1);
    expect(s.projectedPoints[0]).toMatchObject({ index: 1, radius: 25 });
    await w.find('[data-world-point="1"]').trigger('click');
    expect(w.emitted('selectPoint').at(-1)[0]).toEqual(points[1]);
    await w.setProps({
        points: [...points, { coordinates: [180, 0], value: 100 }],
    });
    expect(s.projectedPoints[0].radius).toBe(2.5);
});

test('data and presentation updates preserve the zoom lock until its configured flag changes', async () => {
    const [w, s] = await chart({ style: { chart: { zoom: { show: true } } } });
    w.vm.toggleZoom();
    await nextTick();
    expect(s.mutableConfig.showZoom).toBe(false);
    await w.setProps({ dataset: { FRA: { value: 30 }, DEU: { value: 40 } } });
    expect(s.mutableConfig.showZoom).toBe(false);
    await w.setProps({
        config: {
            theme: 'dark',
            style: { chart: { zoom: { show: true }, color: '#123456' } },
        },
    });
    expect(s.mutableConfig.showZoom).toBe(false);
    const preventDefault = vi.fn();
    s.onWheel({ deltaY: -100, clientX: 100, clientY: 100, preventDefault });
    expect(preventDefault).not.toHaveBeenCalled();
    await w.setProps({
        config: { style: { chart: { zoom: { show: false } } } },
    });
    await w.setProps({
        config: { style: { chart: { zoom: { show: true } } } },
    });
    expect(s.mutableConfig.showZoom).toBe(true);
});

test('keyboard entry and cycling stay within the fitted viewport', async () => {
    const [w, s] = await chart(
        {
            projection: 'equirectangular',
            style: { chart: { zoom: { show: true, region: 'europe' } } },
        },
        undefined,
        true,
    );
    expect(s.visibleCountryCodes.has('CRI')).toBe(false);
    expect(s.tabCountryCode).not.toBe('CRI');
    expect(w.find('[data-country="CRI"]').attributes('aria-hidden')).toBe(
        'true',
    );
    const first = w.find(`[data-country="${s.tabCountryCode}"]`);
    first.element.focus();
    await nextTick();
    for (let i = 0; i < 5; i++) {
        const current = w.find(
            `[data-country="${document.activeElement.getAttribute('data-country')}"]`,
        );
        await current.trigger('keydown', { key: 'ArrowRight' });
        expect(
            s.visibleCountryCodes.has(
                document.activeElement.getAttribute('data-country'),
            ),
        ).toBe(true);
    }
    const lastCode = s.visibleCountries.at(-1).code;
    const offscreen = w.find('[data-country="CRI"]');
    offscreen.element.focus();
    await nextTick();
    await offscreen.trigger('keydown', { key: 'ArrowLeft' });
    expect(document.activeElement.getAttribute('data-country')).toBe(lastCode);
});

test('reset at a configured minimum zoom clears reset state while keeping the cropped viewport clipped', async () => {
    const [w, s] = await chart(
        { style: { chart: { zoom: { show: true, minZoom: 2, maxZoom: 20 } } } },
        undefined,
        true,
    );
    expect(s.camera.zoom).toBe(2);
    expect(s.isZoom).toBe(false);
    expect(w.find('[data-cy-reset]').exists()).toBe(false);
    expect(s.isViewportZoomed).toBe(true);
    expect(w.find('[data-cy="world-svg"]').element.style.overflow).toBe(
        'hidden',
    );
    s.zoomIn();
    await nextTick();
    expect(s.isZoom).toBe(true);
    w.vm.resetZoom();
    await nextTick();
    expect(s.camera.zoom).toBe(2);
    expect(s.isZoom).toBe(false);
    expect(w.find('[data-cy-reset]').exists()).toBe(false);
});

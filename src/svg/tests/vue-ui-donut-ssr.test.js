import { describe, expect, test } from 'vitest';
import { renderVueUiDonutSvg } from '../vue-ui-donut/render';
import { createVueUiDonutState } from '../vue-ui-donut/create.js';

const baseState = {
    width: 400,
    height: 400,
    series: [
        { name: 'Alpha', value: 40, color: '#ff0000' },
        { name: 'Beta', value: 60, color: '#0000ff' },
    ],
    config: {
        type: 'classic',
        style: {
            chart: {
                backgroundColor: '#ffffff',
                legend: {
                    show: true,
                    showValue: true,
                    showPercentage: true,
                },
                layout: {
                    labels: {
                        dataLabels: {
                            show: false,
                            oneLine: true,
                        },
                        value: {
                            show: true,
                        },
                        percentage: {
                            show: true,
                        },
                        name: {
                            show: true,
                        },
                    },
                    donut: {
                        radiusRatio: 0.35,
                        strokeWidth: 64,
                    },
                },
            },
        },
    },
};

describe('renderVueUiDonutSvg', () => {
    test('renders an SVG with accessible chart title', async () => {
        const svg = await renderVueUiDonutSvg(baseState);
        expect(svg).toContain('<svg');
        expect(svg).toContain('role="img"');
        expect(svg).toContain('<title>');
        expect(svg).toContain('Donut chart');
    });

    test('renders classic donut arcs for visible series', async () => {
        const svg = await renderVueUiDonutSvg(baseState);
        expect(svg).toContain('data-layer="classic-slices"');
        expect(svg).toContain('data-cy="donut-arc-0"');
        expect(svg).toContain('data-cy="donut-arc-1"');
        expect(svg).toContain('fill="#ff0000ff"');
        expect(svg).toContain('fill="#0000ffff"');
    });

    test('ignores ghost series', async () => {
        const svg = await renderVueUiDonutSvg({
            ...baseState,
            series: [
                { name: 'Visible', value: 100, color: '#00ff00' },
                { name: 'Ghost', value: 100, color: '#ff0000', ghost: true },
            ],
        });
        expect(svg).toContain('Visible');
        expect(svg).not.toContain('Ghost');
    });

    test('renders no-data state when total is zero', async () => {
        const svg = await renderVueUiDonutSvg({
            ...baseState,
            series: [
                { name: 'Alpha', value: 0, color: '#ff0000' },
                { name: 'Beta', value: 0, color: '#0000ff' },
            ],
        });
        expect(svg).toContain('data-layer="no-data"');
        expect(svg).not.toContain('data-layer="classic-slices"');
    });

    test('renders legend when enabled', async () => {
        const svg = await renderVueUiDonutSvg(baseState);
        expect(svg).toContain('data-cy="donut-div-legend"');
        expect(svg).toContain('Alpha');
        expect(svg).toContain('Beta');
    });

    test('does not render legend when disabled', async () => {
        const svg = await renderVueUiDonutSvg({
            ...baseState,
            config: {
                ...baseState.config,
                style: {
                    chart: {
                        ...baseState.config.style.chart,
                        legend: {
                            ...baseState.config.style.chart.legend,
                            show: false,
                        },
                    },
                },
            },
        });
        expect(svg).not.toContain('data-cy="donut-div-legend"');
    });

    test('renders custom additional SVG content', async () => {
        const svg = await renderVueUiDonutSvg({
            ...baseState,
            additionalSvgContent: '<g data-test="custom-layer"></g>',
        });
        expect(svg).toContain('data-test="custom-layer"');
    });

    test('supports additionalSvgContent as a function', async () => {
        const svg = await renderVueUiDonutSvg({
            ...baseState,
            additionalSvgContent: ({ width, height }) =>
                `<text data-test="custom-text">${width}x${height}</text>`,
        });
        expect(svg).toContain('data-test="custom-text"');
        expect(svg).toContain('400x400');
    });

    test('renders polar slices when type is polar', async () => {
        const svg = await renderVueUiDonutSvg({
            ...baseState,
            config: {
                ...baseState.config,
                type: 'polar',
            },
        });
        expect(svg).toContain('data-layer="polar-slices"');
        expect(svg).not.toContain('data-layer="classic-slices"');
    });
});

describe('createVueUiDonutState', () => {
    test('creates a valid state with default dimensions', () => {
        const state = createVueUiDonutState({
            dataset: [{ name: 'A', value: 100 }],
        });
        expect(state.width).toBe(512);
        expect(state.height).toBe(512);
        expect(state.total).toBe(100);
        expect(state.series).toHaveLength(1);
    });

    test('computes total from all series', () => {
        const state = createVueUiDonutState({
            dataset: [
                { name: 'A', value: 40 },
                { name: 'B', value: 60 },
            ],
        });
        expect(state.total).toBe(100);
    });

    test('uses absolute values when computing total', () => {
        const state = createVueUiDonutState({
            dataset: [
                { name: 'A', value: -40 },
                { name: 'B', value: 60 },
            ],
        });
        expect(state.total).toBe(100);
    });

    test('sorts series by value descending', () => {
        const state = createVueUiDonutState({
            dataset: [
                { name: 'Small', value: 10 },
                { name: 'Large', value: 100 },
                { name: 'Medium', value: 50 },
            ],
        });

        expect(state.series.map((s) => s.name)).toEqual([
            'Large',
            'Medium',
            'Small',
        ]);
    });

    test('places ghost series at the end', () => {
        const state = createVueUiDonutState({
            dataset: [
                { name: 'Ghost', value: 999, ghost: true },
                { name: 'Visible', value: 1 },
            ],
        });
        expect(state.series[0].name).toBe('Visible');
        expect(state.series[1].ghost).toBe(true);
    });

    test('creates fallback ids', () => {
        const state = createVueUiDonutState({
            dataset: [{ value: 10 }],
        });
        expect(state.series[0].id).toBe('donut_serie_0');
    });

    test('preserves provided ids', () => {
        const state = createVueUiDonutState({
            dataset: [{ id: 'custom-id', value: 10 }],
        });
        expect(state.series[0].id).toBe('custom-id');
    });

    test('creates fallback names', () => {
        const state = createVueUiDonutState({
            dataset: [{ value: 10 }],
        });
        expect(state.series[0].name).toBe('Serie 1');
    });

    test('uses label when name is missing', () => {
        const state = createVueUiDonutState({
            dataset: [{ label: 'Label A', value: 10 }],
        });
        expect(state.series[0].name).toBe('Label A');
    });

    test('sums values array', () => {
        const state = createVueUiDonutState({
            dataset: [
                {
                    name: 'A',
                    values: [10, 20, 30],
                },
            ],
        });
        expect(state.series[0].value).toBe(60);
    });

    test('sums series array', () => {
        const state = createVueUiDonutState({
            dataset: [
                {
                    name: 'A',
                    series: [10, 20, 30],
                },
            ],
        });
        expect(state.series[0].value).toBe(60);
    });

    test('computes ratios and percentages', () => {
        const state = createVueUiDonutState({
            dataset: [
                { name: 'A', value: 25 },
                { name: 'B', value: 75 },
            ],
        });
        expect(state.series[0].ratio).toBeCloseTo(0.75);
        expect(state.series[0].percentage).toBeCloseTo(75);
        expect(state.series[1].ratio).toBeCloseTo(0.25);
        expect(state.series[1].percentage).toBeCloseTo(25);
    });

    test('computes arc angles', () => {
        const state = createVueUiDonutState({
            dataset: [{ name: 'A', value: 100 }],
        });
        expect(state.series[0].startAngle).toBe(-90);
        expect(state.series[0].endAngle).toBe(270);
        expect(state.series[0].midAngle).toBe(90);
    });

    test('uses configured start angle', () => {
        const state = createVueUiDonutState({
            dataset: [{ value: 100 }],
            config: {
                chart: {
                    donut: {
                        startAngle: 0,
                    },
                },
            },
        });
        expect(state.series[0].startAngle).toBe(0);
        expect(state.series[0].endAngle).toBe(360);
    });

    test('computes drawing area from dimensions', () => {
        const state = createVueUiDonutState({
            width: 400,
            height: 300,
            dataset: [],
        });
        expect(state.drawingArea.width).toBe(352);
        expect(state.drawingArea.height).toBe(252);
    });

    test('computes center point', () => {
        const state = createVueUiDonutState({
            width: 400,
            height: 300,
            dataset: [],
        });
        expect(state.center.x).toBe(200);
        expect(state.center.y).toBe(150);
    });

    test('uses configured donut radius', () => {
        const state = createVueUiDonutState({
            dataset: [{ value: 1 }],
            config: {
                chart: {
                    donut: {
                        radius: 80,
                    },
                },
            },
        });
        expect(state.radius).toBe(80);
    });

    test('computes inner radius from hole ratio', () => {
        const state = createVueUiDonutState({
            dataset: [{ value: 1 }],
            config: {
                chart: {
                    donut: {
                        radius: 100,
                        holeRatio: 0.4,
                    },
                },
            },
        });
        expect(state.innerRadius).toBe(40);
    });

    test('preserves additionalSvgContent and svgTitle', () => {
        const state = createVueUiDonutState({
            dataset: [],
            additionalSvgContent: '<g />',
            svgTitle: 'My donut',
        });
        expect(state.additionalSvgContent).toBe('<g />');
        expect(state.svgTitle).toBe('My donut');
    });

    test('returns empty series for invalid dataset', () => {
        const state = createVueUiDonutState({
            dataset: null,
        });

        expect(state.series).toEqual([]);
        expect(state.total).toBe(0);
    });

    test('keeps sourceIndex after sorting', () => {
        const state = createVueUiDonutState({
            dataset: [
                { name: 'A', value: 10 },
                { name: 'B', value: 100 },
            ],
        });
        expect(state.series[0].sourceIndex).toBe(1);
        expect(state.series[1].sourceIndex).toBe(0);
    });
});

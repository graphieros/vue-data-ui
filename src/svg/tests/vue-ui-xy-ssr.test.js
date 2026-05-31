import { describe, expect, test } from 'vitest';
import { renderVueUiXySvg } from '../vue-ui-xy/render.js';
import { createVueUiXyState } from '../vue-ui-xy/create.js';

describe('renderVueUiXySvg', () => {
    test('renders an SVG from a resolved state', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Revenue',
                    type: 'line',
                    series: [10, 20, 30],
                },
            ],
            config: {},
        });

        const svg = await renderVueUiXySvg(state);

        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');
        expect(svg).toContain('viewBox=');
        expect(svg).toContain('data-layer="grid"');
        expect(svg).toContain('data-layer="lines"');
    });

    test('renders with an empty config object', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Serie',
                    type: 'line',
                    series: [1, 2, 3],
                },
            ],
            config: {},
        });

        await expect(renderVueUiXySvg(state)).resolves.toContain('<svg');
    });

    test('renders bars and skips null datapoints', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Bars',
                    type: 'bar',
                    series: [10, null, 30],
                },
            ],
            config: {},
        });

        const svg = await renderVueUiXySvg(state);

        expect(svg).toContain('data-layer="bars"');
        expect(svg.match(/data-cy="datapoint-bar"/g)).toHaveLength(2);
    });

    test('uses explicit dataset color before customPalette', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Custom color',
                    type: 'plot',
                    color: '#ff0000',
                    series: [10, 20],
                },
            ],
            config: {
                customPalette: ['#00ff00'],
            },
        });

        const svg = await renderVueUiXySvg(state);

        expect(svg).toContain('fill="#ff0000"');
        expect(svg).not.toContain('fill="#00ff00"');
    });

    test('uses customPalette when dataset color is missing', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Palette color',
                    type: 'plot',
                    series: [10, 20],
                },
            ],
            config: {
                customPalette: ['#00ff00'],
            },
        });

        const svg = await renderVueUiXySvg(state);

        expect(svg).toContain('fill="#00ff00"');
    });

    test('renders additionalSvgContent callback with series coordinates', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Line',
                    type: 'line',
                    series: [10, 20, 30],
                },
            ],
            config: {},
            additionalSvgContent: ({ series }) => {
                const lastPlot = series[0].plots.at(-1);

                return `
                    <text
                        data-cy="custom-last-value"
                        x="${lastPlot.x}"
                        y="${lastPlot.y}"
                    >
                        ${lastPlot.value}
                    </text>
                `;
            },
        });

        const svg = await renderVueUiXySvg(state);

        expect(svg).toContain('data-cy="custom-last-value"');
        expect(svg).toContain('>30</text>');
    });

    test('renders title and subtitle', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Line',
                    type: 'line',
                    series: [1, 2, 3],
                },
            ],
            config: {
                chart: {
                    title: {
                        show: true,
                        text: 'Main title',
                        subtitle: {
                            text: 'Subtitle',
                        },
                    },
                },
            },
        });

        const svg = await renderVueUiXySvg(state);

        expect(svg).toContain('Main title');
        expect(svg).toContain('Subtitle');
        expect(svg).toContain('data-layer="title"');
    });

    test('renders highlight areas with caption', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Line',
                    type: 'line',
                    series: [1, 2, 3, 4],
                },
            ],
            config: {
                chart: {
                    highlightArea: {
                        show: true,
                        from: 1,
                        to: 2,
                        color: '#ff0000',
                        caption: {
                            text: 'Important range',
                        },
                    },
                },
            },
        });

        const svg = await renderVueUiXySvg(state);

        expect(svg).toContain('data-layer="highlight-areas"');
        expect(svg).toContain('data-cy="highlight-area"');
        expect(svg).toContain('Important range');
    });

    test('renders y-axis annotations', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Line',
                    type: 'line',
                    series: [1, 2, 3, 4],
                },
            ],
            config: {
                chart: {
                    annotations: [
                        {
                            show: true,
                            yAxis: {
                                yTop: 3,
                                yBottom: 2,
                                label: {
                                    text: 'Target zone',
                                },
                                line: {
                                    stroke: '#ff0000',
                                    strokeWidth: 1,
                                    strokeDasharray: 4,
                                },
                                area: {
                                    fill: '#ff0000',
                                    opacity: 20,
                                },
                            },
                        },
                    ],
                },
            },
        });

        const svg = await renderVueUiXySvg(state);

        expect(svg).toContain('data-layer="annotations"');
        expect(svg).toContain('Target zone');
        expect(svg).toContain('data-cy="xy-annotation-y-area"');
    });

    test('renders plot gradient definitions when enabled', async () => {
        const state = createVueUiXyState({
            dataset: [
                {
                    name: 'Plot',
                    type: 'plot',
                    series: [1, 2, 3],
                },
            ],
            config: {
                plot: {
                    useGradient: true,
                },
            },
        });

        const svg = await renderVueUiXySvg(state);

        expect(svg).toContain('plotGradient_0_ssr');
        expect(svg).toContain('fill="url(#plotGradient_0_ssr)"');
    });
});

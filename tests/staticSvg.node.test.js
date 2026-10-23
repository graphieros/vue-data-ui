// @vitest-environment node
import { describe, expect, test } from 'vitest';
import { createStaticVueUiDonut, createStaticVueUiXy } from '../src/svg/ssr.js';

const dataset = [
    { name: 'Alpha', values: [40] },
    { name: 'Beta', values: [35] },
    { name: 'Gamma', values: [25] },
];

function markerPaths(svg) {
    return [
        ...svg.matchAll(/<path\b[^>]*data-cy="donut-marker-\d+"[^>]*>/g),
    ].map(([tag]) => tag.match(/\bd="([^"]+)"/)[1]);
}

function expectValidSvg(svg) {
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
    expect(svg).not.toMatch(/NaN|Infinity|undefined/);
}

describe('static SVG rendering without a DOM', () => {
    test('has no browser globals', () => {
        expect(typeof document).toBe('undefined');
        expect(typeof window).toBe('undefined');
    });

    test('renders default Donut external labels and connectors', async () => {
        const svg = await createStaticVueUiDonut({ dataset });
        expectValidSvg(svg);
        expect(markerPaths(svg)).toHaveLength(3);
        expect(svg).toContain('Alpha');
        expect(svg).toContain('Beta');
        expect(svg).toContain('Gamma');
    });

    for (const curved of [false, true]) {
        for (const rotation of [0, Math.PI / 2, Math.PI]) {
            test(`renders ${curved ? 'curved' : 'straight'} connectors at rotation ${rotation}`, async () => {
                const svg = await createStaticVueUiDonut({
                    dataset,
                    config: {
                        style: {
                            chart: {
                                layout: {
                                    curvedMarkers: curved,
                                    donut: { rotation },
                                    labels: {
                                        dataLabels: { markerFlatLength: 12 },
                                    },
                                },
                            },
                        },
                    },
                });
                expectValidSvg(svg);
                const paths = markerPaths(svg);
                expect(paths).toHaveLength(3);
                for (const path of paths) {
                    expect(path.includes('Q')).toBe(curved);
                    const coordinates = path
                        .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/gi)
                        .map(Number);
                    expect(coordinates).toHaveLength(6);
                    expect(coordinates.every(Number.isFinite)).toBe(true);
                    const [labelX, labelY, elbowX, elbowY, arcX] = coordinates;
                    expect(elbowY).toBe(labelY);
                    expect(Math.abs(labelX - elbowX)).toBeCloseTo(12);
                    // The elbow must point back toward the arc, on either side.
                    expect(Math.abs(elbowX - arcX)).toBeLessThan(
                        Math.abs(labelX - arcX),
                    );
                }
            });
        }
    }

    test('renders a single-slice Donut with external labels', async () => {
        const svg = await createStaticVueUiDonut({
            dataset: [{ name: 'Only', values: [100] }],
        });
        expectValidSvg(svg);
        expect(markerPaths(svg)).toHaveLength(1);
    });

    test('renders clustered small-arc connectors alongside ordinary connectors', async () => {
        const svg = await createStaticVueUiDonut({
            dataset: [
                { name: 'Large', values: [90] },
                { name: 'Small A', values: [5] },
                { name: 'Small B', values: [5] },
            ],
        });
        expectValidSvg(svg);
        expect(markerPaths(svg)).toHaveLength(3);
    });

    test('still omits connectors when external labels are disabled', async () => {
        const svg = await createStaticVueUiDonut({
            dataset,
            config: {
                style: {
                    chart: {
                        layout: { labels: { dataLabels: { show: false } } },
                    },
                },
            },
        });
        expectValidSvg(svg);
        expect(markerPaths(svg)).toHaveLength(0);
    });

    test('renders multiline polar labels with the configured value color', async () => {
        const svg = await createStaticVueUiDonut({
            dataset,
            config: {
                type: 'polar',
                style: {
                    chart: {
                        layout: {
                            labels: {
                                dataLabels: { oneLine: false },
                                percentage: { color: '#123456' },
                            },
                        },
                    },
                },
            },
        });
        expectValidSvg(svg);
        expect(svg).toContain('data-layer="polar-data-labels"');
        expect(svg).toMatch(/data-cy="polar-label-value"[^>]*fill="#123456ff"/);
    });

    test('renders an empty Donut', async () => {
        expectValidSvg(await createStaticVueUiDonut({ dataset: [] }));
    });

    test('renders XY with axes and time labels', async () => {
        const svg = await createStaticVueUiXy({
            dataset: [{ name: 'Revenue', type: 'line', series: [1, 3, 2] }],
            config: {
                chart: {
                    grid: {
                        labels: {
                            xAxisLabels: { values: ['Jan', 'Feb', 'Mar'] },
                        },
                    },
                },
            },
        });
        expectValidSvg(svg);
        expect(svg).toContain('data-layer="lines"');
        expect(svg).toContain('Jan');
        expect(svg).toContain('Mar');
    });
});

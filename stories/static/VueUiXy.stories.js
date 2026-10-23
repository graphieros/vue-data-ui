import { expect, waitFor } from 'storybook/test';
import { createStaticVueUiXy } from '../../src/svg/ssr.js';
import { staticSvgComponent } from '../support/staticSvg.js';
import { scenarioRender, runScenario } from '../support/scenario.js';

const StaticXy = staticSvgComponent(createStaticVueUiXy);
const dataset = () => [
    { name: 'Revenue', type: 'line', series: [10, 25, -5, 30] },
    { name: 'Costs', type: 'bar', series: [8, 12, 6, 15] },
    { name: 'Forecast', type: 'plot', series: [12, 22, 9, 27] },
];
const config = () => ({
    chart: {
        title: { text: 'Static XY revenue' },
        grid: {
            labels: { xAxisLabels: { values: ['Jan', 'Feb', 'Mar', 'Apr'] } },
        },
    },
});

function createCases({ mountSubject, select }) {
    const svg = () => select('[data-static-svg] > svg')[0];
    const mount = async (props = {}) => {
        const { wrapper } = await mountSubject(StaticXy, {
            props: { dataset: dataset(), config: config(), ...props },
        });
        await waitFor(() => {
            expect(wrapper.attributes('data-render-error')).toBeUndefined();
            expect(svg()).toBeDefined();
        });
        expect(svg().getAttribute('role')).toBe('img');
        expect(svg().getBoundingClientRect().width).toBeGreaterThan(0);
        expect(svg().outerHTML).not.toMatch(/NaN|Infinity|undefined/);
        return wrapper;
    };
    const cases = {};
    cases.MixedSeries = async () => {
        await mount();
        expect(
            svg().querySelector('[data-cy="xy-div-title"]').textContent,
        ).toContain('Static XY revenue');
        expect(
            svg().querySelector('[data-layer="x-axis-labels"]').textContent,
        ).toContain('Jan');
        expect(
            svg().querySelector('[data-layer="x-axis-labels"]').textContent,
        ).toContain('Apr');
        for (const layer of ['lines', 'bars', 'plots']) {
            const group = svg().querySelector(`[data-layer="${layer}"]`);
            expect(group.children.length).toBeGreaterThan(0);
            expect(group.getBBox().width).toBeGreaterThan(0);
            expect(group.getBBox().height).toBeGreaterThan(0);
        }
    };
    cases.SmoothLineWithGaps = async () => {
        await mount({
            config: { ...config(), line: { cutNullValues: true } },
            dataset: [
                {
                    name: 'Gaps',
                    type: 'line',
                    smooth: true,
                    useArea: true,
                    series: [3, 6, null, 8, 2],
                },
            ],
        });
        const paths = [...svg().querySelectorAll('[data-layer="lines"] path')];
        expect(paths.length).toBeGreaterThan(0);
        expect(
            paths
                .map((path) => path.getAttribute('d'))
                .join(' ')
                .match(/M/g).length,
        ).toBeGreaterThan(1);
        for (const path of paths) {
            expect(path.getAttribute('d')).not.toMatch(/NaN|undefined/);
            expect(path.getTotalLength()).toBeGreaterThan(0);
        }
        expect(
            svg().querySelector('[data-layer="line-areas"] path'),
        ).not.toBeNull();
    };
    cases.Regenerate = async () => {
        const wrapper = await mount();
        const original = svg();
        const originalPath = svg()
            .querySelector('[data-layer="lines"] path')
            .getAttribute('d');
        const nextConfig = config();
        nextConfig.chart.title.text = 'Updated static XY';
        nextConfig.chart.grid.labels.xAxisLabels.values = [
            'North',
            'South',
            'East',
        ];
        await wrapper.setProps({
            dataset: [{ name: 'Updated', type: 'line', series: [1, 9, 4] }],
            config: nextConfig,
        });
        await waitFor(() => {
            expect(svg()).not.toBe(original);
            expect(
                svg().querySelector('[data-cy="xy-div-title"]').textContent,
            ).toContain('Updated static XY');
            expect(
                svg().querySelector('[data-layer="x-axis-labels"]').textContent,
            ).toContain('North');
            expect(
                svg().querySelector('[data-layer="x-axis-labels"]').textContent,
            ).not.toContain('Jan');
            expect(
                svg()
                    .querySelector('[data-layer="lines"] path')
                    .getAttribute('d'),
            ).not.toBe(originalPath);
        });
        expect(original.isConnected).toBe(false);
    };
    cases.Empty = async () => {
        await mount({ dataset: [] });
        expect(
            svg().querySelector('[data-layer="lines"]')?.children.length || 0,
        ).toBe(0);
        expect(
            svg().querySelector('[data-layer="bars"]')?.children.length || 0,
        ).toBe(0);
    };
    return { cases, hooks: [] };
}

export default { title: 'Static SVG/VueUiXy', render: scenarioRender };
export const MixedSeries = {
    play: (context) => runScenario(context, createCases, 'MixedSeries'),
};
export const SmoothLineWithGaps = {
    play: (context) => runScenario(context, createCases, 'SmoothLineWithGaps'),
};
export const Regenerate = {
    play: (context) => runScenario(context, createCases, 'Regenerate'),
};
export const Empty = {
    play: (context) => runScenario(context, createCases, 'Empty'),
};

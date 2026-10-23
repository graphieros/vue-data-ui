import { expect, waitFor } from 'storybook/test';
import { createStaticVueUiDonut } from '../../src/svg/ssr.js';
import { staticSvgComponent } from '../support/staticSvg.js';
import { scenarioRender, runScenario } from '../support/scenario.js';

const StaticDonut = staticSvgComponent(createStaticVueUiDonut);
const dataset = () => [
    { name: 'Alpha', values: [40] },
    { name: 'Beta', values: [35] },
    { name: 'Gamma', values: [25] },
];
const config = (layout = {}) => ({
    style: { chart: { title: { text: 'Static Donut shares' }, layout } },
});

function createCases({ mountSubject, select }) {
    const svg = () => select('[data-static-svg] > svg')[0];
    const markers = () => [
        ...svg().querySelectorAll('[data-layer="label-markers"] path'),
    ];
    const mount = async (props = {}) => {
        const { wrapper } = await mountSubject(StaticDonut, {
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
    const checkMarkers = (count, curved = false) => {
        expect(markers()).toHaveLength(count);
        for (const path of markers()) {
            expect(path.getTotalLength()).toBeGreaterThan(0);
            expect(path.getBBox().width).toBeGreaterThan(0);
            expect(path.getAttribute('d').includes('Q')).toBe(curved);
        }
    };
    const cases = {};
    cases.ExternalLabels = async () => {
        await mount();
        expect(svg().querySelector('title').textContent).toContain(
            'Static Donut shares',
        );
        expect(
            svg().querySelectorAll(
                '[data-layer="classic-slices"] .vue-ui-donut-arc-path',
            ),
        ).toHaveLength(3);
        const labels = svg().querySelector('[data-layer="data-labels"]');
        for (const name of ['Alpha', 'Beta', 'Gamma'])
            expect(labels.textContent).toContain(name);
        expect(labels.getBBox().width).toBeGreaterThan(0);
        checkMarkers(3);
    };
    cases.CurvedConnectors = async () => {
        await mount({
            config: config({
                curvedMarkers: true,
                donut: { rotation: Math.PI / 2 },
            }),
        });
        checkMarkers(3, true);
    };
    cases.SmallArcClusters = async () => {
        await mount({
            dataset: [
                { name: 'Large', values: [90] },
                { name: 'Small A', values: [5] },
                { name: 'Small B', values: [5] },
            ],
        });
        checkMarkers(3);
        const labels = svg().querySelector('[data-layer="data-labels"]');
        expect(labels.textContent).toContain('Small A');
        expect(labels.textContent).toContain('Small B');
    };
    cases.Polar = async () => {
        await mount({ config: { ...config(), type: 'polar' } });
        expect(svg().querySelector('[data-layer="classic-slices"]')).toBeNull();
        expect(
            svg().querySelectorAll(
                '[data-layer="polar-slices"] [data-cy^="donut-arc-"]',
            ),
        ).toHaveLength(3);
        expect(
            svg().querySelector('[data-layer="polar-data-labels"]').getBBox()
                .width,
        ).toBeGreaterThan(0);
    };
    cases.Regenerate = async () => {
        const wrapper = await mount();
        const oldSvg = svg();
        const oldPath = svg()
            .querySelector('[data-cy="donut-arc-0"]')
            .getAttribute('d');
        const nextConfig = config({ curvedMarkers: true });
        nextConfig.style.chart.title.text = 'Updated static Donut';
        await wrapper.setProps({
            dataset: [
                { name: 'New A', values: [80] },
                { name: 'New B', values: [20] },
            ],
            config: nextConfig,
        });
        await waitFor(() => {
            expect(svg()).not.toBe(oldSvg);
            expect(svg().querySelector('title').textContent).toContain(
                'Updated static Donut',
            );
            expect(
                svg().querySelectorAll(
                    '[data-layer="classic-slices"] .vue-ui-donut-arc-path',
                ),
            ).toHaveLength(2);
            expect(
                svg().querySelector('[data-layer="data-labels"]').textContent,
            ).toContain('New A');
            expect(
                svg()
                    .querySelector('[data-cy="donut-arc-0"]')
                    .getAttribute('d'),
            ).not.toBe(oldPath);
        });
        checkMarkers(2, true);
        expect(oldSvg.isConnected).toBe(false);
        await wrapper.setProps({
            config: config({ labels: { dataLabels: { show: false } } }),
        });
        await waitFor(() => expect(markers()).toHaveLength(0));
    };
    cases.Empty = async () => {
        await mount({ dataset: [] });
        expect(svg().querySelector('[data-layer="no-data"]')).not.toBeNull();
        expect(svg().querySelector('[data-layer="classic-slices"]')).toBeNull();
        expect(markers()).toHaveLength(0);
    };
    return { cases, hooks: [] };
}

export default { title: 'Static SVG/VueUiDonut', render: scenarioRender };
export const ExternalLabels = {
    play: (context) => runScenario(context, createCases, 'ExternalLabels'),
};
export const CurvedConnectors = {
    play: (context) => runScenario(context, createCases, 'CurvedConnectors'),
};
export const SmallArcClusters = {
    play: (context) => runScenario(context, createCases, 'SmallArcClusters'),
};
export const Polar = {
    play: (context) => runScenario(context, createCases, 'Polar'),
};
export const Regenerate = {
    play: (context) => runScenario(context, createCases, 'Regenerate'),
};
export const Empty = {
    play: (context) => runScenario(context, createCases, 'Empty'),
};

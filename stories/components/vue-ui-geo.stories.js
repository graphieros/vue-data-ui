import { h } from 'vue';
import { expect, waitFor, fireEvent } from 'storybook/test';
import { scenarioRender, runScenario, dispatch } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiGeo from '../../src/components/vue-ui-geo.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find((c) => c.name === 'VueUiGeo');
    async function commonTest() {
        await testCommonFeatures({
            userOptions: true,
            title: true,
            subtitle: true,
            legend: false,
            dataTable: false,
            tooltipCallback: async () => {
                {
                    let read = () =>
                        select('[data-cy="tooltip-trap-territory"]');
                    {
                        const previous = read;
                        read = () => {
                            const element = previous().at(0);
                            return element ? [element] : [];
                        };
                    }
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await dispatch(read(), 'mouseenter', {
                        force: true,
                    });
                }
            },
        });
    }
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiGeo, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                await commonTest();
            }
        }
    };
    cases.Interactions = async () => {
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
        const data = [
            { id: 'a', name: 'A', coordinates: [0, 0] },
            { id: 'b', name: 'B', coordinates: [20, 20] },
        ];
        const cfg = {
            map: { geoJson: map },
            userOptions: { showOnChartHover: true },
            style: {
                chart: {
                    dimensions: { width: 800, height: 600 },
                    points: { labels: { show: false } },
                },
            },
        };
        const { wrapper } = await mountSubject(VueUiGeo, {
            props: { dataset: data, config: cfg },
            slots: {
                tooltip: ({ datapoint }) =>
                    h(
                        'span',
                        { 'data-geo-tooltip': true },
                        datapoint?.name || '',
                    ),
            },
        });
        await waitFor(() =>
            expect(wrapper.find('.vue-ui-geo-point').attributes('r')).toBe('1'),
        );
        const svg = wrapper.find('svg').element;
        expect(svg.getAttribute('aria-describedby')).toBe(
            wrapper.find('[id^="chart-instructions-"]').attributes('id'),
        );
        await fireEvent.mouseEnter(wrapper.element);
        await waitFor(() =>
            expect(wrapper.find('[data-cy="user-options"]').exists()).toBe(
                true,
            ),
        );
        wrapper.vm.resetZoom(false);
        svg.focus();
        await fireEvent.keyDown(svg, { key: 'ArrowRight' });
        await waitFor(() =>
            expect(
                document.querySelector('[data-geo-tooltip]').textContent,
            ).toBe('A'),
        );
        await wrapper.vm.focusLocation([20, 10], { animated: false });
        await waitFor(() => {
            const position = wrapper
                .findComponent({ name: 'Tooltip' })
                .props('a11yPosition');
            const box = wrapper
                .find('.vue-ui-geo-point')
                .element.getBoundingClientRect();
            expect(position.x).toBeCloseTo(box.left + box.width / 2, 1);
            expect(position.y).toBeCloseTo(box.top + box.height / 2, 1);
        });
        await wrapper.setProps({
            dataset: [data[1], { ...data[0], name: 'Changed' }],
        });
        await waitFor(() =>
            expect(
                document.querySelector('[data-geo-tooltip]').textContent,
            ).toBe('Changed'),
        );
        await fireEvent.mouseEnter(
            wrapper.find('[data-cy="tooltip-trap-territory"]').element,
        );
        await waitFor(() =>
            expect(
                document.querySelector('[data-geo-tooltip]').textContent,
            ).toBe('Land'),
        );
        expect(
            wrapper.findComponent({ name: 'Tooltip' }).props('isA11yMode'),
        ).toBe(false);
        await wrapper.setProps({
            config: { ...cfg, style: { chart: { zoom: { active: false } } } },
        });
        wrapper.vm.toggleAnnotator();
        wrapper.vm.toggleAnnotator();
        await waitFor(() => expect(svg.style.touchAction).toBe('auto'));
        await wrapper.setProps({ config: { ...cfg, loading: true } });
        await wrapper.setProps({
            config: {
                ...cfg,
                loading: true,
                skeletonConfig: {
                    style: { chart: { backgroundColor: '#abcdef' } },
                },
            },
        });
        expect(wrapper.findComponent({ name: 'UserOptions' }).exists()).toBe(
            false,
        );
        await wrapper.setProps({ config: cfg });
        await waitFor(() =>
            expect(wrapper.findAll('.vue-ui-geo-point')).toHaveLength(2),
        );
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Maps/VueUiGeo/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};

export const Interactions = {
    name: 'keeps point selection, tooltip anchors, loading, and zoom state aligned',
    play: async (context) => runScenario(context, createCases, 'Interactions'),
};

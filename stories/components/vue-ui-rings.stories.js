import { h } from 'vue';
import { expect, waitFor, fireEvent } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiRings from '../../src/components/vue-ui-rings.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { config, dataset } = components.find((c) => c.name === 'VueUiRings');
    cases.Renders = async () => {
        {
            await resize(500, 600);
        }
        {
            const mounted = await mountSubject(VueUiRings, {
                props: {
                    config,
                    dataset,
                },
            });
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
                    title: true,
                    subtitle: true,
                    legend: true,
                    dataTable: true,
                    tooltipCallback: async () => {
                        {
                            let read = () => select('[data-cy="tooltip-trap"]');
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
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="ring-underlayer"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="ring"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiRings, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="legend-item"]');
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
                    await clickElements(read());
                    {
                        expect(wrapper.emitted('selectLegend')).to.exist;
                    }
                }
            }
        }
    };
    cases.LiveUpdates = async () => {
        const data = [
            { name: 'A', values: [2, 3] },
            { name: 'B', values: [10] },
            { name: 'C', values: [2] },
        ];
        let enterCount = 0,
            formatCount = 0,
            context;
        const cfg = {
            useBlurOnHover: false,
            events: { datapointEnter: () => enterCount++ },
            style: {
                chart: {
                    tooltip: {
                        customFormat: (params) => {
                            formatCount++;
                            context = params;
                            return params.datapoint.name;
                        },
                    },
                },
            },
        };
        const { wrapper } = await mountSubject(VueUiRings, {
            props: { dataset: data, config: cfg },
            slots: {
                pattern: ({ seriesIndex, patternId }) =>
                    h(
                        'pattern',
                        {
                            id: patternId,
                            'data-source': seriesIndex,
                            width: 4,
                            height: 4,
                            patternUnits: 'userSpaceOnUse',
                        },
                        [h('rect', { width: 2, height: 4, fill: '#000000' })],
                    ),
            },
        });
        await waitFor(() =>
            expect(wrapper.findAll('[data-cy="legend-marker"]')).toHaveLength(
                3,
            ),
        );
        const markers = wrapper.findAll('[data-cy="legend-marker"]');
        expect(
            markers[0].find('[fill^="url(#pattern_"]').attributes('fill'),
        ).toMatch(/_1\)$/);
        expect(
            markers[1].find('[fill^="url(#pattern_"]').attributes('fill'),
        ).toMatch(/_0\)$/);
        wrapper.vm.hideSeries('C');
        await waitFor(() =>
            expect(wrapper.findAll('[data-cy="ring"]')).toHaveLength(2),
        );
        expect(wrapper.findAll('pattern[data-source]')).toHaveLength(3);
        const svg = wrapper.find('[data-cy="rings-svg"]').element;
        svg.focus();
        await fireEvent.keyDown(svg, { key: 'ArrowRight' });
        await waitFor(() => expect(formatCount).toBe(1));
        expect(enterCount).toBe(1);
        expect(wrapper.findAll('.vue-ui-rings-blur')).toHaveLength(0);
        expect(wrapper.findAll('.vue-ui-rings-opacity')).toHaveLength(0);
        await waitFor(() =>
            expect(wrapper.findComponent({ name: 'Tooltip' }).exists()).toBe(
                true,
            ),
        );
        const initialAnchor = wrapper
            .findComponent({ name: 'Tooltip' })
            .props('a11yPosition');
        await wrapper.setProps({
            dataset: [data[2], { ...data[0], values: [30] }, data[1]],
            config: { ...cfg, customPalette: ['#123456'] },
        });
        await waitFor(() => {
            expect(wrapper.vm.getData().map((d) => d.name)).toEqual(['A', 'B']);
            expect(context.datapoint.name).toBe('B');
            expect(context.datapoint.absoluteIndex).toBe(2);
            expect(context.seriesIndex).toBe(1);
            expect(
                wrapper
                    .findComponent({ name: 'Tooltip' })
                    .props('a11yPosition'),
            ).not.toEqual(initialAnchor);
        });
        expect(enterCount).toBe(1);
        expect(wrapper.vm.getData()[0].absoluteValues).toEqual([30]);
        for (const ring of wrapper.findAll('[data-cy="ring"]')) {
            const fill = ring.attributes('fill');
            expect(fill).toMatch(/^url\(#/);
            expect(wrapper.find(`[id="${fill.slice(5, -1)}"]`).exists()).toBe(
                true,
            );
        }
        for (const marker of wrapper.findAll('[data-cy="legend-marker"]')) {
            const fill = marker
                .find('[fill^="url(#pattern_"]')
                .attributes('fill');
            expect(wrapper.find(`[id="${fill.slice(5, -1)}"]`).exists()).toBe(
                true,
            );
        }
        await wrapper.setProps({ config: { ...cfg, useBlurOnHover: true } });
        await waitFor(() =>
            expect(
                wrapper.findAll('.vue-ui-rings-blur').length,
            ).toBeGreaterThan(0),
        );
        wrapper.vm.hideSeries('B');
        await waitFor(() =>
            expect(
                wrapper.findComponent({ name: 'Tooltip' }).props('show'),
            ).toBe(false),
        );
        expect(wrapper.find('[data-cy="rings-svg"]').html()).not.toMatch(
            /NaN|Infinity/,
        );
        await wrapper.setProps({
            dataset: data.map((d) => ({ ...d, values: [0] })),
        });
        expect(wrapper.find('[data-cy="rings-svg"]').html()).not.toMatch(
            /NaN|Infinity/,
        );
    };
    cases.BaselineAnimation = async () => {
        const data = [
            { name: 'A', values: [10] },
            { name: 'B', values: [5] },
            { name: 'C', values: [2] },
        ];
        const { wrapper } = await mountSubject(VueUiRings, {
            props: {
                dataset: data,
                config: { loading: true, useCssAnimation: true },
            },
        });
        await wrapper.setProps({ config: { useCssAnimation: true } });
        await waitFor(() =>
            expect(wrapper.findAll('[data-cy="ring-group"]')).toHaveLength(3),
        );
        const svg = wrapper.find('[data-cy="rings-svg"]').element;
        const rings = wrapper.findAll('[data-cy="ring"]');
        const baseline =
            Number(rings[0].attributes('cy')) +
            Number(rings[0].attributes('r'));
        const centerX = Number(rings[0].attributes('cx'));
        for (const ring of rings)
            expect(
                Number(ring.attributes('cy')) + Number(ring.attributes('r')),
            ).toBeCloseTo(baseline, 8);
        const groups = wrapper.findAll('[data-cy="ring-group"]');
        const animations = groups.map((g) => g.element.getAnimations()[0]);
        expect(animations.every(Boolean)).toBe(true);
        expect(getComputedStyle(groups[0].element).animationDelay).toBe('0.2s');
        expect(getComputedStyle(groups[2].element).animationDelay).toBe('0s');

        for (const animation of animations) animation.pause();
        for (const time of [0, 250, 500]) {
            animations.forEach((animation, i) => {
                animation.currentTime =
                    time + (animations.length - 1 - i) * 100;
            });
            await new Promise((resolve) => requestAnimationFrame(resolve));
            groups.forEach((group) => {
                const matrix = new DOMMatrix(
                    getComputedStyle(group.element).transform,
                );
                if (time === 0) expect(matrix.a).toBeCloseTo(0, 6);
                if (time === 250) {
                    expect(matrix.a).toBeGreaterThan(0);
                    expect(matrix.a).toBeLessThan(1);
                }
                if (time === 500) expect(matrix.a).toBeCloseTo(1, 6);
                const anchor = new DOMPoint(centerX, baseline).matrixTransform(
                    group.element.getScreenCTM(),
                );
                const expected = new DOMPoint(
                    centerX,
                    baseline,
                ).matrixTransform(svg.getScreenCTM());
                expect(anchor.x).toBeCloseTo(expected.x, 4);
                expect(anchor.y).toBeCloseTo(expected.y, 4);
            });
        }
        await waitFor(() =>
            expect(wrapper.findAll('.vue-rings-item-onload')).toHaveLength(0),
        );
        wrapper.vm.hideSeries('C');
        await waitFor(() =>
            expect(wrapper.findAll('[data-cy="ring"]')).toHaveLength(2),
        );
        wrapper.vm.showSeries('C');
        await waitFor(() =>
            expect(wrapper.findAll('[data-cy="ring"]')).toHaveLength(3),
        );
        expect(wrapper.findAll('.vue-rings-item-onload')).toHaveLength(0);
        await waitFor(() =>
            expect(
                getComputedStyle(wrapper.find('[data-cy="ring"]').element)
                    .transitionDuration.split(',')
                    .slice(0, 5)
                    .every((duration) => duration.trim() === '0.12s'),
            ).toBe(true),
        );
        await wrapper.setProps({ config: { useCssAnimation: false } });
        expect(wrapper.findAll('.vue-rings-item-onload')).toHaveLength(0);
        expect(
            new DOMMatrix(getComputedStyle(groups[0].element).transform)
                .isIdentity,
        ).toBe(true);
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiRings/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
export const Emits = {
    name: 'emits',
    play: async (context) => runScenario(context, createCases, 'Emits'),
};

export const LiveUpdates = {
    name: 'keeps patterns, hidden rings and keyboard selection synchronized',
    play: async (context) => runScenario(context, createCases, 'LiveUpdates'),
};

export const BaselineAnimation = {
    name: 'grows rings from their shared baseline',
    play: async (context) =>
        runScenario(context, createCases, 'BaselineAnimation'),
};

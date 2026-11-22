import { expect, waitFor, fireEvent } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    dispatch,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiGalaxy from '../../src/components/vue-ui-galaxy.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiGalaxy',
    );
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiGalaxy, {
                props: {
                    dataset,
                    config,
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
                        const elements = select('[data-cy="datapoint-border"]');
                        expect(elements).not.toHaveLength(0);
                        expect(elements.length).toBeGreaterThan(0);
                        expect(elements.some(visible)).toBe(true);
                        expect(elements).toHaveLength(dataset.length);
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select('[data-cy="datapoint-path"]');
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
            const mounted = await mountSubject(VueUiGalaxy, {
                props: {
                    config,
                    dataset,
                },
            });
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="legend-item-0"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(wrapper.emitted('selectLegend')).to.exist;
                    }
                }
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
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(wrapper.emitted('selectDatapoint')).to.exist;
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0],
                        ).to.have.keys(
                            'absoluteValues',
                            'color',
                            'id',
                            'name',
                            'path',
                            'points',
                            'proportion',
                            'seriesIndex',
                            'value',
                            'absoluteIndex',
                        );
                        expect(
                            wrapper.emitted('selectDatapoint')[0][0]
                                .seriesIndex,
                        ).to.equal(1);
                    }
                }
            }
        }
    };
    cases.SliceProportions = async () => {
        const { wrapper } = await mountSubject(VueUiGalaxy, {
            props: {
                config: {
                    transitions: { enable: false },
                    style: { chart: { layout: { arcs: { borderWidth: 12 } } } },
                },
                dataset: [
                    { name: 'Large', values: [999] },
                    { name: 'Small', values: [1] },
                ],
            },
        });
        const paths = wrapper.findAll('[data-cy="datapoint-path"]');
        const traps = wrapper.findAll('[data-cy="tooltip-trap"]');
        const borders = wrapper.findAll('[data-cy="datapoint-border"]');
        expect(borders).toHaveLength(2);
        const getOutlineWidth = (index) =>
            Number(borders[index].attributes('stroke-width')) -
            Number(paths[index].attributes('stroke-width'));
        function checkSlices(share, borderWidth, compensated) {
            expect(getOutlineWidth(0)).toBe(borderWidth);
            expect(getOutlineWidth(1)).toBe(borderWidth);
            const fullLength = paths[0].element.getTotalLength();
            const largeLength = paths[1].element.getTotalLength();
            const gap = compensated ? borderWidth / 2 : 0;
            expect(
                (fullLength - largeLength - gap) / (fullLength - gap),
            ).toBeCloseTo(share, 4);
            expect(paths.map((path) => path.attributes('d'))).toEqual(
                traps.map((trap) => trap.attributes('d')),
            );
        }
        checkSlices(0.001, 12, true);

        for (const borderWidth of [6, 0]) {
            await wrapper.setProps({
                config: {
                    transitions: { enable: false },
                    style: { chart: { layout: { arcs: { borderWidth } } } },
                },
            });
            checkSlices(0.001, borderWidth, borderWidth > 0);
        }

        await wrapper.setProps({
            dataset: [
                { name: 'Large', values: [80] },
                { name: 'Small', values: [20] },
            ],
            config: {
                transitions: { enable: false },
                style: { chart: { layout: { arcs: { borderWidth: 12 } } } },
            },
        });
        checkSlices(0.2, 12, false);
    };
    cases.LabelCallouts = async () => {
        const { wrapper } = await mountSubject(VueUiGalaxy, {
            props: {
                dataset: [
                    { name: 'Large', values: [86] },
                    { name: 'Small A', values: [6] },
                    { name: 'Small B', values: [5] },
                    { name: 'Hidden', values: [3] },
                ],
                config: {
                    style: {
                        chart: {
                            layout: { labels: { dataLabels: { show: true } } },
                        },
                    },
                },
            },
        });
        const labels = wrapper.findAll('[data-cy="galaxy-datalabel"]');
        expect(labels).toHaveLength(3);
        expect(
            labels
                .map((label) =>
                    label.get('[data-cy="galaxy-datalabel-name"]').text(),
                )
                .sort(),
        ).toEqual(['Large', 'Small A', 'Small B']);
        for (const label of labels) {
            const name = label.get('[data-cy="galaxy-datalabel-name"]');
            expect(Number(label.attributes('font-size'))).toBe(
                name.text() === 'Large' ? 10 : 8,
            );
            expect(name.element.getBoundingClientRect().top).toBeGreaterThan(
                label.element.firstElementChild.getBoundingClientRect().top,
            );
            const bounds = label.element.getBBox();
            const right = label.attributes('text-anchor') === 'start';
            expect(right ? bounds.x > 250 : bounds.x + bounds.width < 0).toBe(
                true,
            );
        }
        for (const side of ['start', 'end']) {
            const boxes = labels
                .filter((label) => label.attributes('text-anchor') === side)
                .map((label) => label.element.getBBox())
                .sort((a, b) => a.y - b.y);
            for (let i = 1; i < boxes.length; i += 1) {
                expect(boxes[i].y).toBeGreaterThan(
                    boxes[i - 1].y + boxes[i - 1].height,
                );
            }
        }
        const svg = wrapper.get('[data-cy="galaxy-svg"]');
        const readFootprint = () => {
            const { width, height } = svg.element.getBoundingClientRect();
            return [svg.attributes('viewBox'), width, height];
        };
        const footprint = readFootprint();
        await clickElements(
            wrapper
                .findAll('[data-cy="legend-item-0"]')
                .map(({ element }) => element),
            { force: true },
        );
        expect(
            wrapper
                .findAll('[data-cy="galaxy-datalabel-name"]')
                .map((label) => label.text()),
        ).toContain('Hidden');
        expect(readFootprint()).toEqual(footprint);
        for (const name of ['Small A', 'Small B', 'Hidden'])
            wrapper.vm.hideSeries(name);
        await waitFor(() =>
            expect(
                wrapper.findAll('[data-cy="galaxy-datalabel"]'),
            ).toHaveLength(0),
        );
        expect(readFootprint()).toEqual(footprint);
        wrapper.vm.showSeries('Large');
        await waitFor(() =>
            expect(
                wrapper.findAll('[data-cy="galaxy-datalabel"]'),
            ).toHaveLength(1),
        );
        expect(readFootprint()).toEqual(footprint);
    };
    cases.MarkerAnchors = async () => {
        const { wrapper } = await mountSubject(VueUiGalaxy, {
            props: {
                dataset: [
                    100, 200, 301, 3, 155, 120, 85, 68, 54, 42, 24, 9,
                ].map((value) => ({ name: String(value), values: [value] })),
                config: {
                    transitions: { enable: false },
                    style: {
                        chart: {
                            layout: {
                                labels: {
                                    dataLabels: {
                                        show: true,
                                        hideUnderValue: 0,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        const arcs = wrapper.findAll('[data-cy="datapoint-path"]');
        const outlines = wrapper.findAll('[data-cy="datapoint-border"]');
        const traps = wrapper.findAll('[data-cy="tooltip-trap"]');
        for (const name of ['3', '9', '24']) {
            const index = traps.findIndex((trap) =>
                trap.attributes('aria-label').startsWith(`${name}:`),
            );
            const id = traps[index].attributes('data-a11y-serie-id');
            const marker = wrapper.get(`[data-series-id="${id}"]`).element;
            const point = new DOMPoint(
                marker.cx.baseVal.value,
                marker.cy.baseVal.value,
            );
            expect(arcs[index].element.isPointInStroke(point), name).toBe(true);
            expect(
                outlines
                    .slice(index + 1)
                    .some(({ element }) => element.isPointInStroke(point)),
                name,
            ).toBe(false);
        }
        const readLabelPositions = () =>
            wrapper
                .findAll('[data-cy="galaxy-datalabel"]')
                .map((label) => [
                    label.text(),
                    label.attributes('x'),
                    label.attributes('y'),
                ]);
        const beforeHover = readLabelPositions();
        const viewBox = wrapper
            .get('[data-cy="galaxy-svg"]')
            .attributes('viewBox');
        const nameLabel = wrapper
            .findAll('[data-cy="galaxy-datalabel-name"]')
            .find((label) => label.text() === '9').element;
        const box = nameLabel.getBoundingClientRect();
        const hoverTarget = document.elementFromPoint(
            box.x + box.width / 2,
            box.y + box.height / 2,
        );
        expect(hoverTarget?.closest('[data-cy="galaxy-datalabel"]')).toBe(
            nameLabel.parentElement,
        );
        await fireEvent.mouseEnter(nameLabel.parentElement);
        expect(readLabelPositions()).toEqual(beforeHover);
        expect(
            wrapper.get('[data-cy="galaxy-svg"]').attributes('viewBox'),
        ).toBe(viewBox);
        expect(
            document
                .elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
                ?.closest('[data-cy="galaxy-datalabel"]'),
        ).toBe(nameLabel.parentElement);
        const index = traps.findIndex((trap) =>
            trap.attributes('aria-label').startsWith('9:'),
        );
        expect(arcs[index].classes()).not.toContain('vue-ui-galaxy-blur');
        expect(
            arcs.every(
                (arc, i) =>
                    i === index || arc.classes().includes('vue-ui-galaxy-blur'),
            ),
        ).toBe(true);
    };
    cases.LiveUpdates = async () => {
        const data = [
            { id: 'a', name: 'A', values: [60] },
            { id: 'b', name: 'B', values: [30] },
            { id: 'c', name: 'C', values: [10] },
            { id: 'zero', name: 'Zero', values: [0] },
        ];
        const base = {
            a11y: { includeTable: true },
            style: { chart: { tooltip: { show: false } } },
        };
        const { wrapper } = await mountSubject(VueUiGalaxy, {
            props: { dataset: data, config: base },
        });
        const svg = wrapper.find('[data-cy="galaxy-svg"]').element;
        svg.focus();
        await fireEvent.keyDown(svg, { key: 'ArrowRight' });
        await fireEvent.keyDown(svg, { key: 'Enter' });
        expect(wrapper.emitted('selectDatapoint')[0][0].name).toBe('C');
        const ids = wrapper
            .findAll('[data-cy="tooltip-trap"]')
            .map((trap) => trap.attributes('data-a11y-serie-id'));
        wrapper.vm.hideSeries('B');
        await wrapper.setProps({
            config: {
                ...base,
                customPalette: ['#ff0000', '#00ff00', '#0000ff'],
            },
        });
        await waitFor(() =>
            expect(wrapper.findAll('[data-cy="tooltip-trap"]')).toHaveLength(2),
        );
        expect(
            wrapper
                .findAll('[data-cy="tooltip-trap"]')
                .map((trap) => trap.attributes('data-a11y-serie-id')),
        ).toEqual([ids[0], ids[2]]);
        expect(
            wrapper.findAll('.sr-only tbody th').map((th) => th.text()),
        ).toEqual(['C', 'Zero', 'A']);
        await wrapper.setProps({
            config: {
                ...base,
                loading: true,
                skeletonDataset: [{ name: 'Skeleton', values: [1] }],
            },
        });
        await waitFor(() => expect(wrapper.classes()).toContain('loading'));
        await wrapper.setProps({
            config: {
                ...base,
                loading: true,
                style: { chart: { color: '#abcdef' } },
            },
        });
        expect(wrapper.classes()).toContain('loading');
        expect(wrapper.find('[data-cy="user-options"]').exists()).toBe(false);
        await wrapper.setProps({ config: base });
        await waitFor(() => expect(wrapper.classes()).not.toContain('loading'));
        expect(wrapper.findAll('[data-cy="tooltip-trap"]')).toHaveLength(2);
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiGalaxy/Interactions',
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
    name: 'preserves selection and hidden series through live updates',
    play: async (context) => runScenario(context, createCases, 'LiveUpdates'),
};

export const SliceProportions = {
    name: 'keeps small slices proportional to the spiral length',
    play: async (context) =>
        runScenario(context, createCases, 'SliceProportions'),
};

export const LabelCallouts = {
    name: 'places compact small-slice labels outside the spiral',
    play: async (context) => runScenario(context, createCases, 'LabelCallouts'),
};

export const MarkerAnchors = {
    name: 'anchors markers inside the visible tips of short slices',
    play: async (context) => runScenario(context, createCases, 'MarkerAnchors'),
};

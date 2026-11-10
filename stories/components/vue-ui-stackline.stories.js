import { expect, waitFor, fireEvent } from 'storybook/test';
import { scenarioRender, runScenario, visible } from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import VueUiStackline from '../../src/components/vue-ui-stackline.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { aliases, select, mountSubject, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiStackline',
    );
    async function commonTest() {
        await testCommonFeatures({
            userOptions: true,
            title: true,
            subtitle: true,
            slicer: true,
            dataTable: true,
            deferredTable: true,
            legend: true,
        });
        {
            await waitFor(() => {
                const elements = select('[data-cy="line-axis-x"]');
                expect(elements).not.toHaveLength(0);
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="line-axis-y"]');
                expect(elements).not.toHaveLength(0);
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="axis-label-x"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(config.style.chart.grid.x.axisName.text),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="axis-label-y"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String(config.style.chart.grid.y.axisName.text),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="scale-line-y"]');
                expect(elements).not.toHaveLength(0);
                expect(elements).toHaveLength(9);
            });
        }
        {
            let read = () => select('[data-cy="scale-label-y"]');
            aliases.set('yLabels', read);
            await waitFor(() => {
                expect(read()).not.toHaveLength(0);
            });
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
            await waitFor(() => {
                expect(read()).toHaveLength(9);
            });
        }
        {
            let read = aliases.get('yLabels');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(
                    read()
                        .map((e) => e.textContent)
                        .join(''),
                ).toContain(String(-60));
            });
        }
        {
            let read = aliases.get('yLabels');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(-1);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(
                    read()
                        .map((e) => e.textContent)
                        .join(''),
                ).toContain(String(100));
            });
        }
        {
            let read = () => select('[data-cy="time-label"]');
            aliases.set('timeLabels', read);
            await waitFor(() => {
                expect(read()).not.toHaveLength(0);
            });
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
            await waitFor(() => {
                expect(read()).toHaveLength(
                    Math.max(...dataset.map((d) => d.series.length)),
                );
            });
        }
        {
            let read = aliases.get('timeLabels');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async (label, i) => {
                        {
                            let read = () => label;
                            aliases.set('label', read);
                        }
                        {
                            let read = aliases.get('label');
                            await waitFor(() => {
                                expect(
                                    read()
                                        .map((e) => e.textContent)
                                        .join(''),
                                ).toContain(String(i));
                            });
                        }
                    })([items[index]], index, items);
                }
            }
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="label-total"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements).toHaveLength(
                    Math.max(...dataset.map((d) => d.series.length)),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="label-datapoint"]');
                expect(elements).not.toHaveLength(0);
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
    }
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiStackline, {
                props: {
                    dataset,
                    config,
                },
            });
            let read = () => mounted;
            {
                const result = await commonTest(read());
                if (result !== undefined) read = () => result;
            }
        }
    };
    cases.DenseData = async () => {
        await env.resize(2400, 800);
        const dense = Array.from({ length: 5 }, (_, series) => ({
            name: `Series ${series}`,
            series: Array.from(
                { length: 1000 },
                (_, i) => 10 + series + Math.sin(i / 20),
            ),
        }));
        const config = {
            style: {
                chart: {
                    timeTag: { show: true },
                    grid: {
                        x: {
                            timeLabels: {
                                values: Array.from(
                                    { length: 1000 },
                                    (_, i) => `Period ${i}`,
                                ),
                            },
                        },
                    },
                },
            },
        };
        const { wrapper } = await mountSubject(VueUiStackline, {
            props: { dataset: dense, config },
        });
        await waitFor(() =>
            expect(
                wrapper.findAll('[data-cy="time-label"]').length,
            ).toBeGreaterThan(1),
        );
        expect(wrapper.findAll('[data-cy="time-label"]').length).toBeLessThan(
            40,
        );
        expect(wrapper.findAll('table')).toHaveLength(0);
        expect(
            wrapper.vm
                .getData()
                .every((series) => series.points.length === 1000),
        ).toBe(true);
        const svg = wrapper.find('svg').element;
        let screen;
        await fireEvent.mouseEnter(wrapper.element);
        await waitFor(async () => {
            const point = wrapper.vm.getData()[0].points[123];
            screen = new DOMPoint(point.x, point.y).matrixTransform(
                svg.getScreenCTM(),
            );
            await fireEvent.mouseMove(svg, {
                clientX: screen.x,
                clientY: screen.y,
            });
            await new Promise((resolve) => requestAnimationFrame(resolve));
            expect(wrapper.find('[data-cy="selected-time-label"]').text()).toBe(
                'Period 123',
            );
        });
        expect(wrapper.findAll('[data-cy="highlighter"]')).toHaveLength(1);
        expect(wrapper.findAll('[data-cy="time-label"]').length).toBeLessThan(
            40,
        );
        await wrapper.setProps({
            config: {
                ...config,
                style: {
                    ...config.style,
                    chart: {
                        ...config.style.chart,
                        timeTag: { show: false },
                    },
                },
            },
        });
        await waitFor(() => {
            expect(
                wrapper.find('[data-cy="selected-time-label"]').exists(),
            ).toBe(false);
            expect(wrapper.find('[data-cy="time-tag"]').exists()).toBe(false);
        });
        await fireEvent.click(svg, { clientX: screen.x, clientY: screen.y });
        expect(
            wrapper.emitted('selectDatapoint').at(-1)[0].datapoint,
        ).toHaveLength(5);
        wrapper.vm.toggleTable();
        await waitFor(() =>
            expect(wrapper.find('table tbody tr').exists()).toBe(true),
        );
        wrapper.vm.toggleTable();
        await waitFor(() => expect(wrapper.find('table').exists()).toBe(false));
        await wrapper.setProps({
            config: { ...config, table: { useDialog: true } },
        });
        wrapper.vm.toggleTable();
        await waitFor(() =>
            expect(
                document.querySelector('.vue-ui-draggable-dialog'),
            ).toBeTruthy(),
        );
        wrapper.vm.toggleTable();
        await waitFor(() => expect(wrapper.find('table').exists()).toBe(false));
    };
    cases.DotVisibility = async () => {
        const data = [
            { name: 'A', series: [1, 2, 3, 4] },
            { name: 'B', series: [4, 3, 2, 1] },
        ];
        const config = (show = true, showOnHover = true) => ({
            style: {
                chart: {
                    legend: { show: false },
                    zoom: { show: false },
                    lines: { dot: { show, showOnHover } },
                },
            },
        });
        const { wrapper } = await mountSubject(VueUiStackline, {
            props: { dataset: data, config: config() },
        });
        const selector =
            '.vue-ui-stackline-zoom-geometry [data-cy="atom-shape"]';
        await waitFor(() => expect(wrapper.findAll(selector)).toHaveLength(8));
        await wrapper.setProps({ config: config(false, true) });
        expect(wrapper.findAll(selector)).toHaveLength(0);
        await fireEvent.mouseEnter(wrapper.element);
        await wrapper.setProps({ selectedXIndex: 2 });
        await waitFor(() => expect(wrapper.findAll(selector)).toHaveLength(2));
        await wrapper.setProps({ config: config(false, false) });
        expect(wrapper.findAll(selector)).toHaveLength(0);
        await wrapper.setProps({ config: config(true, false) });
        await waitFor(() => expect(wrapper.findAll(selector)).toHaveLength(8));
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiStackline/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};

export const DenseData = {
    name: 'renders and interacts with 1000 full-resolution periods',
    play: async (context) => runScenario(context, createCases, 'DenseData'),
};

export const DotVisibility = {
    name: 'controls permanent and hover-only dots independently',
    play: async (context) => runScenario(context, createCases, 'DotVisibility'),
};

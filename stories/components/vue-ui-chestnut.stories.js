import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
import { nextTick as storyNextTick } from 'vue';
import VueUiChestnut from '../../src/components/vue-ui-chestnut.vue';
import { components } from '../fixtures/components.js';
function createCases(env) {
    const { select, mountSubject, resize, fixtures } = env;
    const cases = {};
    const hooks = [];
    const testCommonFeatures = commonFeatures(env);
    const { dataset, config } = components.find(
        (c) => c.name === 'VueUiChestnut',
    );
    const rootTotals = dataset
        .map((d) => {
            return d.branches.map((b) => b.value).reduce((a, b) => a + b, 0);
        })
        .sort((a, b) => b - a);
    const branchesTotals = dataset
        .flatMap((d) => {
            return d.branches.map((b) => b.value);
        })
        .sort((a, b) => b - a);
    hooks.push(async function () {
        {
            await resize(1000, 750);
        }
    });
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiChestnut, {
                props: {
                    dataset,
                    config,
                },
            });
            // Branch selection can open the lazily loaded table dialog.
            await waitFor(() =>
                expect(mounted.wrapper.vm.$.setupState.tableUnit).toBeTruthy(),
            );
            let read = () => mounted;
            {
                await testCommonFeatures({
                    userOptions: true,
                });
                {
                    await waitFor(() => {
                        const elements = select(`[data-cy="chestnut-title"]`);
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(config.style.chart.layout.title.text),
                        );
                    });
                }
                {
                    await waitFor(() => {
                        const elements = select(
                            `[data-cy="chestnut-subtitle"]`,
                        );
                        expect(elements).not.toHaveLength(0);
                        expect(
                            elements.map((e) => e.textContent).join(''),
                        ).toContain(
                            String(
                                config.style.chart.layout.title.subtitle.text,
                            ),
                        );
                    });
                }
                for (let i = 0; i < dataset.length; i += 1) {
                    {
                        let read = () =>
                            select(`[data-cy="chestnut-root-${i}"]`);
                        await waitFor(() => {
                            expect(read()).not.toHaveLength(0);
                        });
                        await storyNextTick();
                        await waitFor(() =>
                            expect(read().length).toBeGreaterThan(0),
                        );
                        await clickElements(read(), {
                            force: true,
                        });
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="chestnut-root-label-${i}"]`,
                            );
                            expect(elements).not.toHaveLength(0);
                            expect(
                                elements.map((e) => e.textContent).join(''),
                            ).toContain(String(rootTotals[i]));
                        });
                    }
                }
                for (let i = 0; i < branchesTotals.length; i += 1) {
                    {
                        let read = () =>
                            select(`[data-cy="chestnut-branch-${i}"]`);
                        {
                            const $branch = read();
                            {
                                let read = () => $branch;
                                await waitFor(() => {
                                    expect(read()).not.toHaveLength(0);
                                });
                                await storyNextTick();
                                await waitFor(() =>
                                    expect(read().length).toBeGreaterThan(0),
                                );
                                await clickElements(read(), {
                                    force: true,
                                });
                            }
                            if (i === branchesTotals.length - 1) {
                                {
                                    let read = () => $branch;
                                    await storyNextTick();
                                    await waitFor(() =>
                                        expect(read().length).toBeGreaterThan(
                                            0,
                                        ),
                                    );
                                    await clickElements(read(), {
                                        force: true,
                                    });
                                }
                            }
                        }
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="chestnut-nut-${i}"]`,
                            );
                            expect(elements).not.toHaveLength(0);
                        });
                    }
                    {
                        let read = () =>
                            select(`[data-cy="chestnut-trap-${i}"]`);
                        {
                            const $trap = read();
                            {
                                let read = () => $trap;
                                await storyNextTick();
                                await waitFor(() =>
                                    expect(read().length).toBeGreaterThan(0),
                                );
                                await clickElements(read(), {
                                    force: true,
                                });
                            }
                            if (i === branchesTotals.length - 1) {
                                {
                                    let read = () =>
                                        select(`[data-cy="chestnut-legend"]`);
                                    await waitFor(() =>
                                        expect(read().length).toBeGreaterThan(
                                            0,
                                        ),
                                    );
                                    await clickElements(read(), {
                                        force: true,
                                    });
                                }
                            }
                        }
                    }
                    {
                        let read = () =>
                            select(`[data-cy="user-options-summary"]`);
                        await waitFor(() =>
                            expect(read().length).toBeGreaterThan(0),
                        );
                        await clickElements(read());
                    }
                    {
                        let read = () =>
                            select(`[data-cy="user-options-table"]`);
                        await waitFor(() =>
                            expect(read().length).toBeGreaterThan(0),
                        );
                        await clickElements(read());
                    }
                    {
                        await waitFor(() => {
                            const elements = select(
                                `[data-cy="chestnut-table"]`,
                            );
                            expect(elements).not.toHaveLength(0);
                            expect(elements.length).toBeGreaterThan(0);
                            expect(elements.some(visible)).toBe(true);
                        });
                    }
                }
            }
        }
    };
    cases.Emits = async () => {
        {
            const mounted = await mountSubject(VueUiChestnut, {
                props: {
                    dataset,
                    config,
                },
            });
            // Branch selection can open the lazily loaded table dialog.
            await waitFor(() =>
                expect(mounted.wrapper.vm.$.setupState.tableUnit).toBeTruthy(),
            );
            let read = () => mounted;
            {
                const { wrapper } = read();
                {
                    let read = () => select('[data-cy="chestnut-root-0"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(wrapper.emitted('selectRoot')).to.exist;
                        expect(
                            wrapper.emitted('selectRoot')[0][0],
                        ).to.have.keys(
                            'branches',
                            'color',
                            'id',
                            'name',
                            'r',
                            'rootIndex',
                            'total',
                            'type',
                            'x',
                            'y',
                        );
                        expect(
                            wrapper.emitted('selectRoot')[0][0].rootIndex,
                        ).to.equal(0);
                        expect(
                            wrapper.emitted('selectRoot')[0][0].type,
                        ).to.equal('root');
                    }
                }
                {
                    let read = () => select('[data-cy="chestnut-branch"]');
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
                        expect(wrapper.emitted('selectBranch')).to.exist;
                        expect(
                            wrapper.emitted('selectBranch')[0][0],
                        ).to.have.keys(
                            'breakdown',
                            'color',
                            'id',
                            'name',
                            'proportionToRoot',
                            'rootIndex',
                            'rootName',
                            'type',
                            'value',
                            'x1',
                            'x2',
                            'y1',
                            'y2',
                        );
                        expect(
                            wrapper.emitted('selectBranch')[0][0].rootIndex,
                        ).to.equal(0);
                        expect(
                            wrapper.emitted('selectBranch')[0][0].type,
                        ).to.equal('branch');
                    }
                }
                {
                    let read = () => select('[data-cy="chestnut-trap-0"]');
                    await waitFor(() =>
                        expect(read().length).toBeGreaterThan(0),
                    );
                    await clickElements(read(), {
                        force: true,
                    });
                    {
                        expect(wrapper.emitted('selectNut')).to.exist;
                        expect(
                            wrapper.emitted('selectNut')[0][0],
                        ).to.have.length(3);
                        expect(
                            wrapper.emitted('selectNut')[0][0][0],
                        ).to.have.keys(
                            'branchName',
                            'branchTotal',
                            'color',
                            'id',
                            'name',
                            'proportionToBranch',
                            'proportionToRoot',
                            'proportionToTree',
                            'rootIndex',
                            'rootName',
                            'table',
                            'type',
                            'value',
                        );
                        expect(
                            wrapper.emitted('selectNut')[0][0][0].type,
                        ).to.equal('nut');
                        expect(
                            wrapper.emitted('selectNut')[0][0][0].rootIndex,
                        ).to.equal(0);
                    }
                }
            }
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiChestnut/Interactions',
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

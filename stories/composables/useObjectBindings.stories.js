import { expect, waitFor, userEvent } from 'storybook/test';
import { scenarioRender, runScenario } from '../support/scenario.js';

import { defineComponent, ref } from 'vue';
import { useObjectBindings } from '../../src/useObjectBindings';
function createCases(env) {
    const { aliases, select, mountSubject, spy } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    cases.CreatesRefsForEachLeafProperty = async () => {
        const configRef = ref({
            foo: {
                bar: 1,
            },
            baz: 'test',
        });
        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef);
                return {
                    bindings,
                };
            },
            template: `
                <div>
                <span data-cy="foo.bar">{{ bindings['foo.bar'] }}</span>
                <span data-cy="baz">{{ bindings.baz }}</span>
                </div>
            `,
        });
        {
            const mounted = await mountSubject(TestComponent);
            let read = () => mounted;
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="foo.bar"]');
                expect(elements.map((e) => e.textContent).join('')).toBe('1');
            });
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="baz"]');
                expect(elements.map((e) => e.textContent).join('')).toBe(
                    'test',
                );
            });
        }
    };
    cases.UpdatesConfigRefWhenComputedRefIsUpdated = async () => {
        const configRef = ref({
            x: {
                y: 10,
            },
        });
        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef);
                return {
                    bindings,
                };
            },
            template: `<div></div>`,
        });
        {
            const mounted = await mountSubject(TestComponent);
            let read = () => mounted;
            {
                const { wrapper } = read();
                wrapper.vm.bindings['x.y'].value = 30;
                expect(configRef.value.x.y).to.equal(30);
            }
        }
    };
    cases.IgnoresArraysByDefaultSkipArraysTrue = async () => {
        const configRef = ref({
            arr: [1, 2, 3],
            obj: {
                val: 5,
            },
        });
        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef);
                return {
                    bindings,
                };
            },
            template: `<div></div>`,
        });
        {
            const mounted = await mountSubject(TestComponent);
            let read = () => mounted;
            {
                const { wrapper } = read();
                // Filter out Vue's private props
                const keys = Object.keys(wrapper.vm.bindings).filter(
                    (k) => !k.startsWith('__v_'),
                );
                expect(keys).to.deep.equal(['obj.val']);
            }
        }
    };
    cases.IncludesArrayPathsWhenSkipArraysFalseAndAllowsWritingToArrayEntries =
        async () => {
            const configRef = ref({
                arr: [
                    {
                        foo: 'bar',
                    },
                    {
                        baz: 42,
                    },
                ],
                obj: {
                    val: 5,
                },
            });
            const TestComponent = defineComponent({
                setup() {
                    const bindings = useObjectBindings(configRef, {
                        skipArrays: false,
                    });
                    return {
                        bindings,
                    };
                },
                template: `<div></div>`,
            });
            {
                const mounted = await mountSubject(TestComponent);
                let read = () => mounted;
                {
                    const { wrapper } = read();
                    const bindings = wrapper.vm.bindings;
                    expect(bindings['arr.0.foo'].value).to.equal('bar');
                    expect(bindings['arr.1.baz'].value).to.equal(42);
                    expect(bindings['obj.val'].value).to.equal(5);
                    bindings['arr.0.foo'].value = 'newBar';
                    bindings['arr.1.baz'].value = 99;
                    bindings['obj.val'].value = 123;
                    expect(configRef.value.arr[0].foo).to.equal('newBar');
                    expect(configRef.value.arr[1].baz).to.equal(99);
                    expect(configRef.value.obj.val).to.equal(123);
                }
            }
        };
    cases.SupportsACustomDelimitor = async () => {
        const configRef = ref({
            a: {
                b: 2,
            },
        });
        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef, {
                    delimiter: '::',
                });
                return {
                    bindings,
                };
            },
            template: `<div><span data-cy="key">{{ bindings['a::b'] }}</span></div>`,
        });
        {
            const mounted = await mountSubject(TestComponent);
            let read = () => mounted;
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="key"]');
                expect(elements.map((e) => e.textContent).join('')).toBe('2');
            });
        }
    };
    cases.TogglesConfigRefChartZoomShowViaVModelOnAToRef = async () => {
        const configRef = ref({
            chart: {
                zoom: {
                    show: false,
                },
            },
        });
        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef);
                const zoomShow = bindings['chart.zoom.show'];
                return {
                    zoomShow,
                };
            },
            template: `
                <div>
                <input
                    type="checkbox"
                    data-cy="zoom-input"
                    v-model="zoomShow"
                />
                </div>
            `,
        });
        {
            const mounted = await mountSubject(TestComponent);
            let read = () => mounted;
        }
        {
            await waitFor(() => {
                const elements = select('[data-cy="zoom-input"]');
                expect(elements[0]).not.toBeChecked();
            });
        }
        {
            let read = () => configRef;
            {
                const previous = read;
                read = () =>
                    'value.chart.zoom.show'
                        .split('.')
                        .reduce((value, key) => value?.[key], previous());
            }
            await waitFor(() => {
                expect(read()).toBe(false);
            });
        }
        {
            let read = () => select('[data-cy="zoom-input"]');
            if (read()[0].checked !== true) await userEvent.click(read()[0]);
            await waitFor(() => {
                expect(read()[0]).toBeChecked();
            });
        }
        {
            let read = () => configRef;
            {
                const previous = read;
                read = () =>
                    'value.chart.zoom.show'
                        .split('.')
                        .reduce((value, key) => value?.[key], previous());
            }
            await waitFor(() => {
                expect(read()).toBe(true);
            });
        }
        {
            let read = () => select('[data-cy="zoom-input"]');
            if (read()[0].checked !== false) await userEvent.click(read()[0]);
            await waitFor(() => {
                expect(read()[0]).not.toBeChecked();
            });
        }
        {
            let read = () => configRef;
            {
                const previous = read;
                read = () =>
                    'value.chart.zoom.show'
                        .split('.')
                        .reduce((value, key) => value?.[key], previous());
            }
            await waitFor(() => {
                expect(read()).toBe(false);
            });
        }
    };
    cases.WarnsWhenAccessingANonExistentBinding = async () => {
        const configRef = ref({
            foo: 'bar',
        });
        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef);
                return {
                    bindings,
                };
            },
            template: `<div></div>`,
        });
        {
            let read = () => window;
            {
                const win = read();
                storeAlias('warn', spy(win.console, 'warn'));
            }
        }
        {
            const mounted = await mountSubject(TestComponent);
            let read = () => mounted;
            {
                const { wrapper } = read();
                // force trigger the get trap
                void wrapper.vm.bindings['baz'];
            }
            {
                {
                    let read = aliases.get('warn');
                    await waitFor(() => {
                        expect(read()).toHaveBeenCalledWith(
                            'Vue Data UI - useObjectBindings: no binding found for key "baz". Please verify you are binding to a property path which exists on the object.',
                        );
                    });
                }
            }
        }
    };
    cases.WarnsWhenSettingANonExistentBinding = async () => {
        const configRef = ref({
            foo: 'bar',
        });
        const TestComponent = defineComponent({
            setup() {
                const bindings = useObjectBindings(configRef);
                return {
                    bindings,
                };
            },
            template: `<div></div>`,
        });
        {
            let read = () => window;
            {
                const win = read();
                storeAlias('warn', spy(win.console, 'warn'));
            }
        }
        {
            const mounted = await mountSubject(TestComponent);
            let read = () => mounted;
            {
                const { wrapper } = read();
                // force trigger the set trap
                wrapper.vm.bindings['baz'] = 'qux';
            }
            {
                {
                    let read = aliases.get('warn');
                    await waitFor(() => {
                        expect(read()).toHaveBeenCalledWith(
                            'Vue Data UI - useObjectBindings: cannot set unknown binding "baz".',
                        );
                    });
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
    title: 'Utilities/useObjectBindings/Interactions',
    render: scenarioRender,
};
export const CreatesRefsForEachLeafProperty = {
    name: 'creates refs for each leaf property',
    play: async (context) =>
        runScenario(context, createCases, 'CreatesRefsForEachLeafProperty'),
};
export const UpdatesConfigRefWhenComputedRefIsUpdated = {
    name: 'updates configRef when computed ref is updated',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'UpdatesConfigRefWhenComputedRefIsUpdated',
        ),
};
export const IgnoresArraysByDefaultSkipArraysTrue = {
    name: 'ignores arrays by default (skipArrays=true)',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'IgnoresArraysByDefaultSkipArraysTrue',
        ),
};
export const IncludesArrayPathsWhenSkipArraysFalseAndAllowsWritingToArrayEntries =
    {
        name: 'includes array paths when skipArrays=false and allows writing to array entries',
        play: async (context) =>
            runScenario(
                context,
                createCases,
                'IncludesArrayPathsWhenSkipArraysFalseAndAllowsWritingToArrayEntries',
            ),
    };
export const SupportsACustomDelimitor = {
    name: 'supports a custom delimitor',
    play: async (context) =>
        runScenario(context, createCases, 'SupportsACustomDelimitor'),
};
export const TogglesConfigRefChartZoomShowViaVModelOnAToRef = {
    name: 'toggles configRef.chart.zoom.show via v-model on a toRef',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'TogglesConfigRefChartZoomShowViaVModelOnAToRef',
        ),
};
export const WarnsWhenAccessingANonExistentBinding = {
    name: 'warns when accessing a non-existent binding',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'WarnsWhenAccessingANonExistentBinding',
        ),
};
export const WarnsWhenSettingANonExistentBinding = {
    name: 'warns when setting a non-existent binding',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'WarnsWhenSettingANonExistentBinding',
        ),
};

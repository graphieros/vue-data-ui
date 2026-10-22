import { expect, waitFor } from 'storybook/test';
import {
    scenarioRender,
    runScenario,
    clickElements,
    visible,
} from '../support/scenario.js';
import { commonFeatures } from '../support/common.js';
const sequential = async (items, callback) => {
    for (let i = 0; i < items.length; i++) await callback(items[i], i, items);
};
import VueUiHill from '../../src/components/vue-ui-hill.vue';
import { components } from '../fixtures/components.js';
import { h } from 'vue';
function createCases(env) {
    const { aliases, select, mountSubject, resize, spy, fixtures } = env;
    const cases = {};
    const hooks = [];
    const storeAlias = (name, value) => {
        aliases.set(name, () => value);
        return value;
    };
    const testCommonFeatures = commonFeatures(env);
    const hillFixture = components.find(
        (component) => component.name === 'VueUiHill',
    );
    if (!hillFixture) {
        throw new Error('VueUiHill fixture was not found.');
    }
    const { config: baseConfig, dataset: baseDataset } = hillFixture;
    const ACTION_LABELS = {
        update: 'Edit hill',
        cancel: 'Cancel edit',
        save: 'Save edit',
    };
    const BASIC_DATASET = [
        {
            id: 'todo',
            name: 'Todo',
            position: 0,
            color: '#3B9ED0',
        },
        {
            id: 'discovery',
            name: 'Discovery',
            position: 0.25,
            color: '#31A266',
        },
        {
            id: 'delivery',
            name: 'Delivery',
            position: 0.65,
            color: '#F39A2B',
        },
        {
            id: 'done',
            name: 'Done',
            position: 1,
            color: '#316EB5',
        },
    ];
    const OVERFLOW_DATASET = Array.from(
        {
            length: 4,
        },
        (_, index) => ({
            id: `overflow-${index}`,
            name: `Overflow item ${index + 1}`,
            position: 0.5,
            color: ['#3B9ED0', '#31A266', '#F39A2B', '#316EB5'][index],
        }),
    );
    function isPlainObject(value) {
        return (
            value !== null && typeof value === 'object' && !Array.isArray(value)
        );
    }
    function mergeDeep(base, patch) {
        const output = isPlainObject(base)
            ? {
                  ...base,
              }
            : {};
        Object.entries(patch || {}).forEach(([key, value]) => {
            if (isPlainObject(value) && isPlainObject(output[key])) {
                output[key] = mergeDeep(output[key], value);
                return;
            }
            output[key] = Array.isArray(value) ? [...value] : value;
        });
        return output;
    }
    function makeConfig(patch = {}) {
        return mergeDeep(baseConfig, patch);
    }
    function editableConfig(events = {}, patch = {}) {
        return mergeDeep(
            {
                readonly: false,
                editing: false,
                transitions: {
                    enable: false,
                },
                userOptions: {
                    show: false,
                },
                events,
                style: {
                    chart: {
                        toolbar: {
                            show: true,
                            buttons: {
                                translations: ACTION_LABELS,
                            },
                        },
                    },
                },
            },
            patch,
        );
    }
    async function mountHill({
        dataset = BASIC_DATASET,
        config = {},
        slots = {},
    } = {}) {
        return await (async () => {
            const mounted = await mountSubject(VueUiHill, {
                props: {
                    dataset,
                    config: makeConfig(config),
                },
                slots,
            });
            let read = () => mounted;
            return read();
        })();
    }
    async function actionButtons() {
        return await (async () => {
            let read = () => select('.vue-ui-hill-actions__button');
            return read();
        })();
    }
    async function enterEditMode() {
        {
            let read = () => select('.vue-ui-hill-actions__button');
            await waitFor(() => {
                expect(read()).toHaveLength(1);
            });
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), {
                force: true,
            });
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill');
                expect(elements[0].getAttribute('data-editing')).toBe(
                    String('true'),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill-actions__button');
                expect(elements).toHaveLength(2);
            });
        }
    }
    async function cancelEdit() {
        {
            let read = () => select('.vue-ui-hill-actions__button');
            await waitFor(() => {
                expect(read()).toHaveLength(2);
            });
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), {
                force: true,
            });
        }
    }
    async function saveEdit() {
        {
            let read = () => select('.vue-ui-hill-actions__button');
            await waitFor(() => {
                expect(read()).toHaveLength(2);
            });
            {
                const previous = read;
                read = () => {
                    const element = previous().at(-1);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => expect(read().length).toBeGreaterThan(0));
            await clickElements(read(), {
                force: true,
            });
        }
    }
    function dispatchKeyboardEvent(element, key) {
        const win = element.ownerDocument.defaultView;
        const event = new win.KeyboardEvent('keydown', {
            key,
            code: key,
            bubbles: true,
            cancelable: true,
        });
        element.dispatchEvent(event);
    }
    function dispatchPointerEvent(element, type, options = {}) {
        const win = element.ownerDocument.defaultView;
        const EventConstructor = win.PointerEvent || win.MouseEvent;
        const event = new EventConstructor(type, {
            bubbles: !['pointerenter', 'pointerleave'].includes(type),
            cancelable: true,
            composed: true,
            pointerId: options.pointerId ?? 1,
            pointerType: options.pointerType ?? 'mouse',
            isPrimary: options.isPrimary ?? true,
            button: options.button ?? 0,
            buttons: options.buttons ?? 0,
            clientX: options.clientX ?? 0,
            clientY: options.clientY ?? 0,
        });
        if (event.pointerId === undefined) {
            Object.defineProperty(event, 'pointerId', {
                configurable: true,
                value: options.pointerId ?? 1,
            });
        }
        if (event.pointerType === undefined) {
            Object.defineProperty(event, 'pointerType', {
                configurable: true,
                value: options.pointerType ?? 'mouse',
            });
        }
        element.dispatchEvent(event);
    }
    async function pressDatapointKey(datapointId, key) {
        {
            let read = () => select(`[data-datapoint-id="${datapointId}"]`);
            await waitFor(() => {
                expect(read()[0].getAttribute('tabindex')).toBe(String('0'));
            });
            read()[0].focus();
            {
                const $datapoint = read();
                dispatchKeyboardEvent($datapoint[0], key);
            }
        }
    }
    async function dragDatapoint(datapointId, deltaX = 100) {
        {
            let read = () => select(`[data-datapoint-id="${datapointId}"]`);
            {
                const $datapoint = read();
                const datapointElement = $datapoint[0];
                const svg = datapointElement.ownerSVGElement;
                const matrix = datapointElement.getScreenCTM();
                const hitArea = datapointElement.querySelector('circle');
                expect(svg, 'owner SVG element').to.exist;
                expect(matrix, 'datapoint screen matrix').to.exist;
                expect(hitArea, 'datapoint hit area').to.exist;
                Object.defineProperties(svg, {
                    setPointerCapture: {
                        configurable: true,
                        value: () => {},
                    },
                    hasPointerCapture: {
                        configurable: true,
                        value: () => false,
                    },
                    releasePointerCapture: {
                        configurable: true,
                        value: () => {},
                    },
                });
                const origin = svg.createSVGPoint();
                origin.x = 0;
                origin.y = 0;
                const start = origin.matrixTransform(matrix);
                const pointerId = 7;
                dispatchPointerEvent(hitArea, 'pointerdown', {
                    pointerId,
                    buttons: 1,
                    clientX: start.x,
                    clientY: start.y,
                });
                dispatchPointerEvent(svg, 'pointermove', {
                    pointerId,
                    buttons: 1,
                    clientX: start.x + deltaX,
                    clientY: start.y,
                });
                dispatchPointerEvent(svg, 'pointerup', {
                    pointerId,
                    buttons: 0,
                    clientX: start.x + deltaX,
                    clientY: start.y,
                });
            }
        }
    }
    hooks.push(async () => {
        {
            await resize(1000, 700);
        }
    });
    async function commonTest() {
        await testCommonFeatures({
            userOptions: true,
            title: true,
            subtitle: true,
            legend: false,
            dataTable: false,
        });
    }
    cases.Renders = async () => {
        {
            const mounted = await mountSubject(VueUiHill, {
                props: {
                    dataset: baseDataset,
                    config: baseConfig,
                },
            });
            let read = () => mounted;
        }
        await commonTest();
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill');
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill svg[role="group"]');
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
            });
        }
        {
            let read = () => select('[data-cy-datapoint]');
            {
                const previous = read;
                read = () =>
                    'length'
                        .split('.')
                        .reduce((value, key) => value?.[key], previous());
            }
            await waitFor(() => {
                expect(read()).toBeGreaterThan(0);
            });
        }
    };
    cases.RendersOneAccessibleSliderForEachVisibleDatapoint = async () => {
        await mountHill({
            config: {
                transitions: {
                    enable: false,
                },
                userOptions: {
                    show: false,
                },
                style: {
                    chart: {
                        toolbar: {
                            show: false,
                        },
                    },
                },
            },
        });
        {
            await waitFor(() => {
                const elements = select('[data-cy-datapoint]');
                expect(elements).toHaveLength(BASIC_DATASET.length);
            });
        }
        await sequential(BASIC_DATASET, async (datapoint, index) => {
            {
                await waitFor(() => {
                    const elements = select(
                        `[data-datapoint-id="${datapoint.id}"]`,
                    );
                    expect(elements[0].getAttribute('role')).toBe(
                        String('slider'),
                    );
                    expect(
                        elements[0].getAttribute('data-datapoint-index'),
                    ).toBe(String(String(index)));
                    expect(elements[0].getAttribute('aria-label')).toBe(
                        String(datapoint.name),
                    );
                    expect(elements[0].getAttribute('tabindex')).toBe(
                        String('-1'),
                    );
                });
            }
        });
    };
    cases.EntersEditModeAndCallsTheEditCallback = async () => {
        const onEdit = storeAlias('onEdit', spy());
        await mountHill({
            config: editableConfig({
                edit: onEdit,
            }),
        });
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill');
                expect(elements[0].getAttribute('data-editing')).toBe(
                    String('false'),
                );
            });
        }
        await enterEditMode();
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill');
                expect(elements[0].getAttribute('data-editing')).toBe(
                    String('true'),
                );
            });
        }
        {
            let read = () => select('.vue-ui-hill-actions__button');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(0);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
        }
        {
            let read = () => select('.vue-ui-hill-actions__button');
            {
                const previous = read;
                read = () => {
                    const element = previous().at(-1);
                    return element ? [element] : [];
                };
            }
            await waitFor(() => {
                expect(read().length).toBeGreaterThan(0);
                expect(read().some(visible)).toBe(true);
            });
        }
        {
            let read = () => select('[data-cy-datapoint]');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async ($datapoint) => {
                        {
                            await waitFor(() => {
                                const elements = $datapoint;
                                expect(
                                    elements[0].getAttribute('tabindex'),
                                ).toBe(String('0'));
                            });
                        }
                    })([items[index]], index, items);
                }
            }
        }
        {
            let read = aliases.get('onEdit');
            await waitFor(() =>
                ((spy) => {
                    expect(spy).toHaveBeenCalledTimes(1);
                    expect(
                        {
                            args: spy.mock.calls[0],
                        }.args[0],
                    ).to.have.length(BASIC_DATASET.length);
                })(read()),
            );
        }
    };
    cases.MovesADatapointWithTheKeyboardAndSavesTheEditedDataset = async () => {
        const onChange = storeAlias('onChange', spy());
        const onSave = storeAlias('onSave', spy());
        const keyboardDataset = BASIC_DATASET.map((datapoint) =>
            datapoint.id === 'discovery'
                ? {
                      ...datapoint,
                      position: 0.4,
                  }
                : datapoint,
        );
        await mountHill({
            dataset: keyboardDataset,
            config: editableConfig(
                {
                    change: onChange,
                    save: onSave,
                },
                {
                    interaction: {
                        keyboardStep: 0.1,
                    },
                },
            ),
        });
        await enterEditMode();
        await pressDatapointKey('discovery', 'ArrowRight');
        {
            let read = aliases.get('onChange');
            await waitFor(() =>
                ((spy) => {
                    expect(spy).toHaveBeenCalledTimes(1);
                    const payload = {
                        args: spy.mock.calls[0],
                    }.args[0];
                    expect(payload.datapoint.id).to.equal('discovery');
                    expect(payload.datapoint.position).to.be.closeTo(
                        0.5,
                        0.000001,
                    );
                    expect(
                        payload.dataset.find(
                            (datapoint) => datapoint.id === 'discovery',
                        ).position,
                    ).to.be.closeTo(0.5, 0.000001);
                })(read()),
            );
        }
        await saveEdit();
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill');
                expect(elements[0].getAttribute('data-editing')).toBe(
                    String('false'),
                );
            });
        }
        {
            let read = aliases.get('onSave');
            await waitFor(() =>
                ((spy) => {
                    expect(spy).toHaveBeenCalledTimes(1);
                    const savedDataset = {
                        args: spy.mock.calls[0],
                    }.args[0];
                    const savedDatapoint = savedDataset.find(
                        (datapoint) => datapoint.id === 'discovery',
                    );
                    expect(savedDatapoint.position).to.be.closeTo(
                        0.5,
                        0.000001,
                    );
                })(read()),
            );
        }
    };
    cases.RestoresTheOriginalDatasetWhenAnEditIsCancelled = async () => {
        const onChange = storeAlias('onChange', spy());
        const onCancel = storeAlias('onCancel', spy());
        const originalPosition = 0.3;
        const cancelDataset = BASIC_DATASET.map((datapoint) =>
            datapoint.id === 'discovery'
                ? {
                      ...datapoint,
                      position: originalPosition,
                  }
                : datapoint,
        );
        await mountHill({
            dataset: cancelDataset,
            config: editableConfig({
                change: onChange,
                cancel: onCancel,
            }),
        });
        await enterEditMode();
        await pressDatapointKey('discovery', 'End');
        {
            let read = aliases.get('onChange');
            await waitFor(() => {
                expect(read()).toHaveBeenCalledTimes(1);
            });
        }
        await cancelEdit();
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill');
                expect(elements[0].getAttribute('data-editing')).toBe(
                    String('false'),
                );
            });
        }
        {
            let read = aliases.get('onCancel');
            await waitFor(() =>
                ((spy) => {
                    expect(spy).toHaveBeenCalledTimes(1);
                    const cancelledDataset = {
                        args: spy.mock.calls[0],
                    }.args[0];
                    const restoredDatapoint = cancelledDataset.find(
                        (datapoint) => datapoint.id === 'discovery',
                    );
                    expect(restoredDatapoint.position).to.equal(
                        originalPosition,
                    );
                })(read()),
            );
        }
    };
    cases.CallsSelectDatapointWithThePublicDatapointAndOriginalIndex =
        async () => {
            const onSelectDatapoint = storeAlias('onSelectDatapoint', spy());
            await mountHill({
                config: editableConfig(
                    {
                        selectDatapoint: onSelectDatapoint,
                    },
                    {
                        style: {
                            chart: {
                                toolbar: {
                                    show: false,
                                },
                            },
                        },
                    },
                ),
            });
            {
                let read = () => select('[data-datapoint-id="delivery"]');
                await waitFor(() => expect(read().length).toBeGreaterThan(0));
                await clickElements(read(), {
                    force: true,
                });
            }
            {
                let read = aliases.get('onSelectDatapoint');
                await waitFor(() =>
                    ((spy) => {
                        expect(spy).toHaveBeenCalledTimes(1);
                        const payload = {
                            args: spy.mock.calls[0],
                        }.args[0];
                        expect(payload.index).to.equal(2);
                        expect(payload.datapoint.id).to.equal('delivery');
                        expect(payload.datapoint.__index).to.equal(undefined);
                    })(read()),
                );
            }
        };
    cases.CallsDatapointEnterAndDatapointLeaveWithTheOriginalIndex =
        async () => {
            const onDatapointEnter = storeAlias('onDatapointEnter', spy());
            const onDatapointLeave = storeAlias('onDatapointLeave', spy());
            await mountHill({
                config: editableConfig(
                    {
                        datapointEnter: onDatapointEnter,
                        datapointLeave: onDatapointLeave,
                    },
                    {
                        style: {
                            chart: {
                                toolbar: {
                                    show: false,
                                },
                            },
                        },
                    },
                ),
            });
            {
                let read = () => select('[data-datapoint-id="discovery"]');
                {
                    const $datapoint = read();
                    dispatchPointerEvent($datapoint[0], 'pointerenter');
                }
            }
            {
                let read = aliases.get('onDatapointEnter');
                await waitFor(() => {
                    expect(read()).toHaveBeenCalledTimes(1);
                });
            }
            {
                let read = () => select('[data-datapoint-id="discovery"]');
                {
                    const $datapoint = read();
                    dispatchPointerEvent($datapoint[0], 'pointerleave');
                }
            }
            {
                let read = aliases.get('onDatapointEnter');
                await waitFor(() =>
                    ((spy) => {
                        expect(spy).toHaveBeenCalledTimes(1);
                        expect(
                            {
                                args: spy.mock.calls[0],
                            }.args[0].index,
                        ).to.equal(1);
                        expect(
                            {
                                args: spy.mock.calls[0],
                            }.args[0].datapoint.id,
                        ).to.equal('discovery');
                    })(read()),
                );
            }
            {
                let read = aliases.get('onDatapointLeave');
                await waitFor(() =>
                    ((spy) => {
                        expect(spy).toHaveBeenCalledTimes(1);
                        expect(
                            {
                                args: spy.mock.calls[0],
                            }.args[0].index,
                        ).to.equal(1);
                        expect(
                            {
                                args: spy.mock.calls[0],
                            }.args[0].datapoint.id,
                        ).to.equal('discovery');
                    })(read()),
                );
            }
        };
    cases.EmitsDragStartChangeAndDragEndDuringPointerDragging = async () => {
        const onDragStart = storeAlias('onDragStart', spy());
        const onChange = storeAlias('onDragChange', spy());
        const onDragEnd = storeAlias('onDragEnd', spy());
        await mountHill({
            config: editableConfig({
                dragStart: onDragStart,
                change: onChange,
                dragEnd: onDragEnd,
            }),
        });
        await enterEditMode();
        await dragDatapoint('discovery', 120);
        {
            let read = aliases.get('onDragStart');
            await waitFor(() => {
                expect(read()).toHaveBeenCalledTimes(1);
            });
        }
        {
            let read = aliases.get('onDragChange');
            await waitFor(() =>
                ((spy) => {
                    expect(spy.mock.calls.length).to.be.greaterThan(0);
                })(read()),
            );
        }
        {
            let read = aliases.get('onDragEnd');
            await waitFor(() =>
                ((spy) => {
                    expect(spy).toHaveBeenCalledTimes(1);
                    expect(
                        {
                            args: spy.mock.calls[0],
                        }.args[0].id,
                    ).to.equal('discovery');
                    expect(
                        {
                            args: spy.mock.calls[0],
                        }.args[0].position,
                    ).to.be.greaterThan(0.25);
                })(read()),
            );
        }
    };
    cases.PreventsEditModeWhenReadonlyIsEnabled = async () => {
        await mountHill({
            config: editableConfig(
                {},
                {
                    readonly: true,
                    editing: true,
                },
            ),
        });
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill');
                expect(elements[0].getAttribute('data-editing')).toBe(
                    String('false'),
                );
            });
        }
        {
            await waitFor(() => {
                const elements = select('.vue-ui-hill-actions');
                expect(elements).toHaveLength(0);
            });
        }
        {
            let read = () => select('[data-cy-datapoint]');
            {
                const items = read();
                for (let index = 0; index < items.length; index++) {
                    await (async ($datapoint) => {
                        {
                            await waitFor(() => {
                                const elements = $datapoint;
                                expect(
                                    elements[0].getAttribute('tabindex'),
                                ).toBe(String('-1'));
                            });
                        }
                    })([items[index]], index, items);
                }
            }
        }
    };
    cases.OpensAnOverflowMenuPromotesAnItemAndRestoresTheStackOnOutsidePointerdown =
        async () => {
            const onSelectDatapoint = storeAlias('onOverflowSelect', spy());
            await mountHill({
                dataset: OVERFLOW_DATASET,
                config: editableConfig(
                    {
                        selectDatapoint: onSelectDatapoint,
                    },
                    {
                        editing: true,
                        style: {
                            chart: {
                                width: 600,
                                height: 120,
                                layout: {
                                    plots: {
                                        radius: 12,
                                        hitRadius: 20,
                                        strokeWidth: 1,
                                        stacking: {
                                            show: true,
                                            overlapThresholdRatio: 0.5,
                                            gap: null,
                                            overflow: {
                                                show: true,
                                                transitionDuration: 0,
                                                marker: {
                                                    radius: 12,
                                                    fill: '#777777',
                                                    stroke: '#FFFFFF',
                                                    strokeWidth: 1,
                                                    labelColor: '#FFFFFF',
                                                    fontSize: 12,
                                                    bold: true,
                                                    labelOffsetY: 6,
                                                },
                                                menu: {
                                                    title: 'Select an item',
                                                    width: 220,
                                                    maxHeight: 220,
                                                    backgroundColor: '#FFFFFF',
                                                    color: '#2D353C',
                                                    borderColor: '#CCCCCC',
                                                    borderRadius: 6,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                ),
            });
            {
                let read = () => select('[data-stack-overflow-marker]');
                await waitFor(() => {
                    expect(read()).toHaveLength(1);
                });
                {
                    const previous = read;
                    read = () =>
                        previous().flatMap((element) =>
                            select(
                                '.vue-ui-hill__stack-overflow-marker-label',
                                element,
                            ),
                        );
                }
                await waitFor(() => {
                    expect(
                        read()
                            .map((e) => e.textContent)
                            .join(''),
                    ).toContain(String('+4'));
                });
            }
            {
                let read = () => select('[data-stack-overflow-marker]');
                await waitFor(() => expect(read().length).toBeGreaterThan(0));
                await clickElements(read(), {
                    force: true,
                });
            }
            {
                await waitFor(() => {
                    const elements = select('[data-stack-overflow-menu]');
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                    expect(elements[0].getAttribute('role')).toBe(
                        String('listbox'),
                    );
                });
            }
            {
                await waitFor(() => {
                    const elements = select(
                        '.vue-ui-hill__stack-overflow-menu-item',
                    );
                    expect(elements).toHaveLength(OVERFLOW_DATASET.length);
                });
            }
            {
                let read = () => select('[data-stack-overflow-menu]');
                {
                    const $menu = read();
                    const menu = $menu[0];
                    expect(menu.offsetWidth).to.be.at.least(220);
                    expect(menu.scrollHeight).to.be.at.most(
                        menu.clientHeight + 1,
                    );
                }
            }
            {
                let read = () => select('[data-stack-overflow-marker]');
                {
                    const $marker = read();
                    const marker = $marker[0];
                    const svg = marker.ownerSVGElement;
                    const matrix = marker.getScreenCTM();
                    expect(matrix, 'overflow marker screen matrix').to.exist;
                    const origin = svg.createSVGPoint();
                    origin.x = 0;
                    origin.y = 0;
                    const markerScreenPoint = origin.matrixTransform(matrix);
                    {
                        let read = () => select('[data-stack-overflow-menu]');
                        {
                            const $menu = read();
                            const menuRect = $menu[0].getBoundingClientRect();
                            const menuCenterX =
                                menuRect.left + menuRect.width / 2;
                            expect(menuCenterX).to.be.closeTo(
                                markerScreenPoint.x,
                                3,
                            );
                        }
                    }
                }
            }
            {
                let read = () =>
                    select('.vue-ui-hill__stack-overflow-menu-item');
                {
                    const previous = read;
                    read = () => {
                        const element = previous().at(0);
                        return element ? [element] : [];
                    };
                }
                await waitFor(() => expect(read().length).toBeGreaterThan(0));
                await clickElements(read());
            }
            {
                await waitFor(() => {
                    const elements = select('[data-stack-overflow-menu]');
                    expect(elements).toHaveLength(0);
                });
            }
            {
                await waitFor(() => {
                    const elements = select('[data-datapoint-id="overflow-0"]');
                    expect(elements).not.toHaveLength(0);
                    expect(elements.length).toBeGreaterThan(0);
                    expect(elements.some(visible)).toBe(true);
                });
            }
            {
                await waitFor(() => {
                    const elements = [document.activeElement];
                    expect(elements[0].getAttribute('data-datapoint-id')).toBe(
                        String('overflow-0'),
                    );
                });
            }
            {
                await waitFor(() => {
                    const elements = select(
                        '[data-stack-overflow-marker] .vue-ui-hill__stack-overflow-marker-label',
                    );
                    expect(
                        elements.map((e) => e.textContent).join(''),
                    ).toContain(String('+3'));
                });
            }
            {
                let read = aliases.get('onOverflowSelect');
                await waitFor(() =>
                    ((spy) => {
                        expect(spy).toHaveBeenCalledTimes(1);
                        expect(
                            {
                                args: spy.mock.calls[0],
                            }.args[0].index,
                        ).to.equal(0);
                        expect(
                            {
                                args: spy.mock.calls[0],
                            }.args[0].datapoint.id,
                        ).to.equal('overflow-0');
                    })(read()),
                );
            }
            {
                let read = () => select('body');
                {
                    const $body = read();
                    dispatchPointerEvent($body[0], 'pointerdown', {
                        pointerId: 99,
                        buttons: 1,
                        clientX: 2,
                        clientY: 2,
                    });
                }
            }
            {
                await waitFor(() => {
                    const elements = select('[data-datapoint-id="overflow-0"]');
                    expect(elements).toHaveLength(0);
                });
            }
            {
                await waitFor(() => {
                    const elements = select(
                        '[data-stack-overflow-marker] .vue-ui-hill__stack-overflow-marker-label',
                    );
                    expect(
                        elements.map((e) => e.textContent).join(''),
                    ).toContain(String('+4'));
                });
            }
        };
    cases.RendersACustomLoadingSlot = async () => {
        await mountHill({
            config: {
                transitions: {
                    enable: false,
                },
                loading: true,
                userOptions: {
                    show: false,
                },
                style: {
                    chart: {
                        toolbar: {
                            show: false,
                        },
                    },
                },
            },
            slots: {
                loading: () =>
                    h(
                        'div',
                        {
                            'data-cy': 'hill-loading-slot',
                        },
                        'Loading hill',
                    ),
            },
        });
        {
            await waitFor(() => {
                const elements = select('[data-cy="hill-loading-slot"]');
                expect(elements.length).toBeGreaterThan(0);
                expect(elements.some(visible)).toBe(true);
                expect(elements.map((e) => e.textContent).join('')).toContain(
                    String('Loading hill'),
                );
            });
        }
    };
    return {
        cases,
        hooks,
    };
}
export default {
    title: 'Charts/VueUiHill/Interactions',
    render: scenarioRender,
};
export const Renders = {
    name: 'renders',
    play: async (context) => runScenario(context, createCases, 'Renders'),
};
export const RendersOneAccessibleSliderForEachVisibleDatapoint = {
    name: 'renders one accessible slider for each visible datapoint',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'RendersOneAccessibleSliderForEachVisibleDatapoint',
        ),
};
export const EntersEditModeAndCallsTheEditCallback = {
    name: 'enters edit mode and calls the edit callback',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'EntersEditModeAndCallsTheEditCallback',
        ),
};
export const MovesADatapointWithTheKeyboardAndSavesTheEditedDataset = {
    name: 'moves a datapoint with the keyboard and saves the edited dataset',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'MovesADatapointWithTheKeyboardAndSavesTheEditedDataset',
        ),
};
export const RestoresTheOriginalDatasetWhenAnEditIsCancelled = {
    name: 'restores the original dataset when an edit is cancelled',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'RestoresTheOriginalDatasetWhenAnEditIsCancelled',
        ),
};
export const CallsSelectDatapointWithThePublicDatapointAndOriginalIndex = {
    name: 'calls selectDatapoint with the public datapoint and original index',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'CallsSelectDatapointWithThePublicDatapointAndOriginalIndex',
        ),
};
export const CallsDatapointEnterAndDatapointLeaveWithTheOriginalIndex = {
    name: 'calls datapointEnter and datapointLeave with the original index',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'CallsDatapointEnterAndDatapointLeaveWithTheOriginalIndex',
        ),
};
export const EmitsDragStartChangeAndDragEndDuringPointerDragging = {
    name: 'emits dragStart, change, and dragEnd during pointer dragging',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'EmitsDragStartChangeAndDragEndDuringPointerDragging',
        ),
};
export const PreventsEditModeWhenReadonlyIsEnabled = {
    name: 'prevents edit mode when readonly is enabled',
    play: async (context) =>
        runScenario(
            context,
            createCases,
            'PreventsEditModeWhenReadonlyIsEnabled',
        ),
};
export const OpensAnOverflowMenuPromotesAnItemAndRestoresTheStackOnOutsidePointerdown =
    {
        name: 'opens an overflow menu, promotes an item, and restores the stack on outside pointerdown',
        play: async (context) =>
            runScenario(
                context,
                createCases,
                'OpensAnOverflowMenuPromotesAnItemAndRestoresTheStackOnOutsidePointerdown',
            ),
    };
export const RendersACustomLoadingSlot = {
    name: 'renders a custom loading slot',
    play: async (context) =>
        runScenario(context, createCases, 'RendersACustomLoadingSlot'),
};

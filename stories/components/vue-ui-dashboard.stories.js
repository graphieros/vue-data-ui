import { expect, fireEvent, waitFor } from 'storybook/test';
import { h } from 'vue';
import Subject from '../../src/components/vue-ui-dashboard.vue';
import { scenarioRender, runScenario } from '../support/scenario.js';

function createCases({ mountSubject }) {
    return {
        hooks: [],
        cases: {
            PointerGestures: async () => {
                for (const pointerType of ['mouse', 'touch']) {
                    const { wrapper } = await mountSubject(Subject, {
                        props: {
                            dataset: [
                                {
                                    id: 'A',
                                    component: '',
                                    left: 10,
                                    top: 10,
                                    width: 30,
                                    height: 30,
                                },
                                {
                                    id: 'A',
                                    component: '',
                                    left: 60,
                                    top: 10,
                                    width: 20,
                                    height: 30,
                                },
                            ],
                            config: {
                                style: { board: { aspectRatio: '2/1' } },
                                userOptions: {
                                    show: false,
                                    buttons: { annotator: false },
                                },
                            },
                        },
                        slots: { content: () => h('input', { type: 'range' }) },
                    });
                    const board = wrapper.find(
                        '.vue-ui-dashboard-container',
                    ).element;
                    const item = wrapper.find(
                        '.vue-ui-dashboard-grid-item',
                    ).element;
                    const rect = board.getBoundingClientRect();
                    const start = {
                        pointerId: 1,
                        isPrimary: true,
                        pointerType,
                        button: 0,
                        clientX: rect.left + 20,
                        clientY: rect.top + 20,
                    };
                    const end = {
                        ...start,
                        clientX: start.clientX + rect.width / 10,
                        clientY: start.clientY + rect.height / 10,
                    };
                    await fireEvent.pointerDown(
                        item.querySelector('input'),
                        start,
                    );
                    await fireEvent.pointerMove(document, end);
                    await fireEvent.pointerUp(document, end);
                    expect(wrapper.emitted('change')).toBeUndefined();
                    await fireEvent.pointerDown(item, start);
                    await fireEvent.pointerMove(document, end);
                    await fireEvent.pointerUp(document, end);
                    await waitFor(() => {
                        expect(item.style.left).toBe('20%');
                        expect(item.style.top).toBe('20%');
                        expect(wrapper.emitted('change')).toHaveLength(1);
                    });
                    const handle = item.querySelector(
                        '.vue-ui-dashboard-bottom-right',
                    );
                    await fireEvent.pointerDown(handle, start);
                    await fireEvent.pointerMove(document, end);
                    await fireEvent.pointerUp(document, end);
                    await waitFor(() => {
                        expect(item.style.width).toBe('40%');
                        expect(item.style.height).toBe('40%');
                        expect(wrapper.emitted('change')).toHaveLength(2);
                    });
                    const second = wrapper.findAll(
                        '.vue-ui-dashboard-grid-item',
                    )[1].element;
                    await fireEvent.pointerDown(second, start);
                    await fireEvent.pointerMove(document, end);
                    await fireEvent.pointerUp(document, end);
                    await waitFor(() => {
                        expect(second.style.left).toBe('70%');
                        expect(item.style.left).toBe('20%');
                        expect(wrapper.emitted('change')).toHaveLength(3);
                    });
                }
            },
        },
    };
}
export default {
    title: 'Layout and Dashboard/VueUiDashboard/Interactions',
    render: scenarioRender,
};
export const PointerGestures = {
    name: 'mouse and touch gestures',
    play: (context) => runScenario(context, createCases, 'PointerGestures'),
};

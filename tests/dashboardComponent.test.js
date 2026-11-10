import { mount, flushPromises } from '@vue/test-utils';
import { reactive, h, defineComponent } from 'vue';
import { test, expect, vi, afterEach, beforeEach } from 'vitest';
import Chart from '../src/components/vue-ui-dashboard.vue';
const dataset = [
    { id: 'A', component: '', left: 10, top: 10, width: 30, height: 30 },
    { id: 2, component: '', left: 50.4, top: 10.2, width: 20.3, height: 20.4 },
];
let wrappers;
beforeEach(() => {
    wrappers = [];
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        top: 0,
        width: 1000,
        height: 500,
    });
});
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    vi.restoreAllMocks();
});
async function chart(config = {}, data = dataset, slots = {}) {
    const w = mount(Chart, {
        props: { dataset: data, config },
        slots,
        global: {
            stubs: {
                PenAndPaper: true,
                UserOptions: {
                    name: 'UserOptions',
                    template: '<div data-menu />',
                },
            },
        },
    });
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function event(x = 100, y = 50, extra = {}) {
    return {
        clientX: x,
        clientY: y,
        pointerId: 1,
        button: 0,
        currentTarget: {
            setPointerCapture: vi.fn(),
            releasePointerCapture: vi.fn(),
        },
        target: document.createElement('div'),
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        ...extra,
    };
}
function dispatch(type, x, y, pointerId = 1) {
    const e = new MouseEvent(type, {
        clientX: x,
        clientY: y,
        bubbles: true,
        cancelable: true,
    });
    Object.defineProperty(e, 'pointerId', { value: pointerId });
    document.dispatchEvent(e);
}
test('integer placement changes emit once at completion and leave other items untouched', async () => {
    const [w, s] = await chart();
    const original = { ...s.items[1] };
    s.startGesture(0, event());
    dispatch('pointermove', 200, 100);
    expect(w.emitted('change')).toBeUndefined();
    dispatch('pointerup', 200, 100);
    expect(w.emitted('change')).toHaveLength(1);
    expect(s.items[0]).toMatchObject({ left: 20, top: 20 });
    expect(s.items[1]).toEqual(original);
    expect(dataset[0].left).toBe(10);
    expect(w.emitted('change')[0][0]).toBe(s.items);
});
test('clicks, unrelated movement, and canceled duplicate end events do not emit', async () => {
    const [w, s] = await chart();
    dispatch('pointermove', 400, 200);
    s.startGesture(0, event());
    dispatch('pointerup', 100, 50);
    s.cancelGesture();
    expect(w.emitted('change')).toBeUndefined();
    expect(s.gesture).toBe(null);
});
test('dragging clamps axes independently and follows final release outside the board', async () => {
    const [w, s] = await chart();
    s.startGesture(0, event());
    dispatch('pointermove', -100, 100);
    expect(s.items[0]).toMatchObject({ left: 0, top: 20 });
    dispatch('pointerup', 2000, 1000);
    expect(s.items[0]).toMatchObject({ left: 70, top: 70 });
    expect(w.emitted('change')).toHaveLength(1);
    expect(s.gesture).toBe(null);
});
test('all resize corners stay bounded and preserve opposite edges', async () => {
    for (const direction of [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
    ]) {
        const [, s] = await chart();
        s.startGesture(0, event(), direction);
        dispatch(
            'pointermove',
            direction.includes('left') ? -1000 : 2000,
            direction.includes('top') ? -1000 : 2000,
        );
        const item = s.items[0];
        expect(item.left).toBeGreaterThanOrEqual(0);
        expect(item.top).toBeGreaterThanOrEqual(0);
        expect(item.left + item.width).toBeLessThanOrEqual(100);
        expect(item.top + item.height).toBeLessThanOrEqual(100);
        expect(
            direction.includes('left') ? item.left + item.width : item.left,
        ).toBe(direction.includes('left') ? 40 : 10);
        expect(
            direction.includes('top') ? item.top + item.height : item.top,
        ).toBe(direction.includes('top') ? 40 : 10);
        dispatch(
            'pointerup',
            direction.includes('left') ? -1000 : 2000,
            direction.includes('top') ? -1000 : 2000,
        );
    }
});
test('resize snapping preserves fractional anchored edges and minimum sizes', async () => {
    const [, s] = await chart();
    const right = s.items[1].left + s.items[1].width;
    s.startGesture(1, event(), 'top-left');
    dispatch('pointerup', 10000, 10000);
    expect(s.items[1].width).toBeGreaterThanOrEqual(1);
    expect(s.items[1].height).toBeGreaterThanOrEqual(1);
    expect(s.items[1].left + s.items[1].width).toBeCloseTo(right);
});
test('interactive descendants cannot start dashboard gestures or leave it paused', async () => {
    const [, s] = await chart({}, dataset, {
        content: () =>
            h('div', [
                h('input', { type: 'range' }),
                h('button', 'Action'),
                h('div', { class: 'range-handle' }, [h('span', 'Handle')]),
            ]),
    });
    for (const selector of ['input', 'button', '.range-handle span']) {
        s.startGesture(
            0,
            event(100, 50, {
                target: s.dashboardContainer.querySelector(selector),
            }),
        );
        expect(s.gesture).toBe(null);
    }
    s.startGesture(0, event());
    expect(s.gesture).not.toBe(null);
    s.cancelGesture();
});
test('lock settings react to nested changes and unrelated styling preserves a manual toggle', async () => {
    const config = reactive({ locked: false });
    const [w, s] = await chart(config);
    s.toggleLock();
    await w.setProps({
        config: {
            locked: false,
            style: { board: { backgroundColor: '#123456' } },
        },
    });
    expect(s.isLocked).toBe(true);
    s.startGesture(0, event(), 'bottom-right');
    expect(s.gesture).toBe(null);
    await w.setProps({ config });
    config.locked = true;
    await flushPromises();
    config.locked = false;
    await flushPromises();
    expect(s.isLocked).toBe(false);
    s.startGesture(0, event());
    config.locked = true;
    await flushPromises();
    expect(s.gesture).toBe(null);
});
test('annotation activation and unmount release owned capture and listeners', async () => {
    const [w, s] = await chart();
    const start = event();
    s.startGesture(0, start);
    s.toggleAnnotator();
    expect(s.gesture).toBe(null);
    expect(start.currentTarget.releasePointerCapture).toHaveBeenCalledWith(1);
    s.toggleAnnotator();
    s.startGesture(0, event());
    w.unmount();
    dispatch('pointermove', 300, 200);
    expect(s.items[0].left).toBe(10);
    expect(s.gesture).toBe(null);
});
test('wrong pointers and nonprimary presses cannot move the active item', async () => {
    const [, s] = await chart();
    s.startGesture(0, event(100, 50, { button: 2 }));
    expect(s.gesture).toBe(null);
    s.startGesture(0, event());
    dispatch('pointermove', 200, 100, 2);
    dispatch('pointerup', 200, 100, 2);
    expect(s.items[0].left).toBe(10);
    expect(s.gesture).not.toBe(null);
    s.cancelGesture({ pointerId: 1 });
});
test('data updates reconcile positions and indices by numeric or string ID without emitting', async () => {
    const data = reactive(structuredClone(dataset));
    const [w, s] = await chart({}, data);
    s.startGesture(0, event());
    dispatch('pointerup', 200, 100);
    expect(s.items[0].left).toBe(20);
    data.reverse();
    await flushPromises();
    expect(s.items[1]).toMatchObject({ id: 'A', index: 1, left: 20 });
    data[1].left = 35;
    data.push({
        id: 'C',
        component: '',
        left: 0,
        top: 0,
        width: 10,
        height: 10,
    });
    await flushPromises();
    expect(s.items[1].left).toBe(35);
    expect(s.items).toHaveLength(3);
    expect(w.emitted('change')).toHaveLength(1);
});
test('chart prop updates do not reset local placement or emit layout changes', async () => {
    const data = reactive([
        { ...dataset[0], props: { dataset: [1, 2], config: {} } },
    ]);
    const [w, s] = await chart({}, data);
    s.startGesture(0, event());
    dispatch('pointerup', 200, 100);
    data[0].props.dataset.push(3);
    await flushPromises();
    expect(s.items[0].left).toBe(20);
    expect(s.resolvedItems[0].props.dataset).toEqual([1, 2, 3]);
    expect(w.emitted('change')).toHaveLength(1);
});
test('reordering keeps the active target, while removal or external placement overrides end it', async () => {
    const data = reactive(structuredClone(dataset));
    const [w, s] = await chart({}, data);
    s.startGesture(0, event());
    data.reverse();
    await flushPromises();
    dispatch('pointermove', 200, 100);
    expect(s.items.find((item) => item.id === 'A').left).toBe(20);
    data[1].left = 45;
    await flushPromises();
    expect(s.gesture).toBe(null);
    expect(s.items[1].left).toBe(45);
    expect(w.emitted('change')).toBeUndefined();
    s.startGesture(0, event());
    data.splice(0, 1);
    await flushPromises();
    expect(s.gesture).toBe(null);
});
test('zero-sized boards reject gestures without invalid geometry', async () => {
    const [, s] = await chart();
    s.dashboardContainer.getBoundingClientRect = () => ({
        width: 0,
        height: 0,
    });
    s.startGesture(0, event());
    expect(s.gesture).toBe(null);
    expect(s.items[0].left).toBe(10);
});
test('hover menus honor keep-state and support annotator-only and alt-copy-only actions', async () => {
    for (const action of ['annotator', 'altCopy']) {
        const config = {
            userOptions: {
                showOnChartHover: true,
                keepStateOnChartLeave: false,
                buttons: {
                    pdf: false,
                    img: false,
                    annotator: action === 'annotator',
                    altCopy: action === 'altCopy',
                },
            },
        };
        const [w] = await chart(config);
        expect(w.find('[data-menu]').exists()).toBe(false);
        await w.trigger('mouseenter');
        expect(w.find('[data-menu]').exists()).toBe(true);
        await w.trigger('mouseleave');
        expect(w.find('[data-menu]').exists()).toBe(false);
    }
});
test('menu settings react to nested updates and keep-state retains a hidden menu', async () => {
    const config = reactive({
        userOptions: { showOnChartHover: false, keepStateOnChartLeave: true },
    });
    const [w] = await chart(config);
    expect(w.find('[data-menu]').isVisible()).toBe(true);
    config.userOptions.showOnChartHover = true;
    await flushPromises();
    expect(w.find('[data-menu]').attributes('style')).toContain(
        'visibility: hidden',
    );
    await w.trigger('mouseenter');
    expect(w.find('[data-menu]').attributes('style')).toContain(
        'visibility: visible',
    );
});
test('component objects and slot/public payload fields retain their identity and shape', async () => {
    const Child = defineComponent({ render: () => h('span', 'Custom child') });
    const altCopy = vi.fn();
    const [w, s] = await chart(
        { userOptions: { callbacks: { altCopy } } },
        [{ ...dataset[0], component: Child }],
        {
            top: ({ index }) => h('i', `Top ${index}`),
            bottom: ({ item }) => h('b', item.id),
        },
    );
    expect(s.resolvedItems[0].resolvedComponent).toBe(Child);
    expect(w.text()).toContain('Custom child');
    expect(w.text()).toContain('Top 0');
    expect(w.vm.getItemsPositions()[0]).toMatchObject({
        ...dataset[0],
        component: Child,
        index: 0,
    });
    await w.vm.copyAlt();
    expect(altCopy.mock.calls[0][0].dataset[0].resolvedComponent).toBe(Child);
});

test('duplicate IDs select distinct items without changing public IDs or fields', async () => {
    const data = reactive(dataset.map((item) => ({ ...item, id: 2 })));
    const [w, s] = await chart({}, data);
    s.startGesture(1, event());
    expect(s.changeIndex).toBe(1);
    dispatch('pointerup', 200, 100);
    expect(s.items[0].left).toBe(10);
    expect(s.items[1].left).toBe(60);
    expect(s.items.map((item) => item.id)).toEqual([2, 2]);
    expect(Object.keys(w.vm.getItemsPositions()[1]).sort()).toEqual(
        ['id', 'component', 'left', 'top', 'width', 'height', 'index'].sort(),
    );
    data[1].top = 25;
    await flushPromises();
    expect(s.items[0].left).toBe(10);
    expect(s.items[1].top).toBe(25);
    s.startGesture(1, event(), 'bottom-right');
    dispatch('pointerup', 200, 100);
    expect(s.items[0].width).toBe(30);
    expect(s.items[1].width).toBeCloseTo(30.6);
});

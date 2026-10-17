import * as Vue from 'vue';
import { compile } from '@vue/compiler-dom';
import UserOptions from '../../src/atoms/UserOptions.vue';
import {
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../../src/userOptionsSlots';

export const optionSlotNames = [
    'menuIcon',
    'optionPdf',
    'optionCsv',
    'optionImg',
    'optionSvg',
    'optionTooltip',
    'optionTable',
    'optionLabels',
    'optionSort',
    'optionStack',
    'optionFullscreen',
    'optionZoom',
    'optionAnimation',
    'optionAnnotator',
    'optionAltCopy',
    'custom-menu-before',
    'custom-menu-after',
];

function describeScope(scope) {
    return JSON.stringify(
        Object.fromEntries(
            Object.entries(scope).map(([key, value]) => [
                key,
                typeof value === 'function'
                    ? 'function'
                    : value === undefined
                      ? 'undefined'
                      : value,
            ]),
        ),
    );
}

export function makeOptionSlots(names = optionSlotNames) {
    return Object.fromEntries(
        names.map((name) => [
            name,
            (scope = {}) =>
                Vue.h(
                    'span',
                    {
                        'data-custom-slot': name,
                        'data-scope': describeScope(scope),
                    },
                    name,
                ),
        ]),
    );
}

export function configurePopover(supported) {
    const names = ['popover', 'showPopover', 'hidePopover', 'matches'];
    const descriptors = names.map((name) =>
        Object.getOwnPropertyDescriptor(HTMLElement.prototype, name),
    );
    const originalMatches = HTMLElement.prototype.matches;
    const openPopovers = new WeakSet();
    if (supported) {
        Object.defineProperties(HTMLElement.prototype, {
            popover: {
                configurable: true,
                get() {
                    return this.getAttribute('popover');
                },
                set(value) {
                    this.setAttribute('popover', value);
                },
            },
            showPopover: {
                configurable: true,
                value() {
                    openPopovers.add(this);
                },
            },
            hidePopover: {
                configurable: true,
                value() {
                    openPopovers.delete(this);
                },
            },
            matches: {
                configurable: true,
                value(selector) {
                    return selector === ':popover-open'
                        ? openPopovers.has(this)
                        : originalMatches.call(this, selector);
                },
            },
        });
    } else {
        for (const name of names) delete HTMLElement.prototype[name];
    }
    return () =>
        names.forEach((name, index) => {
            if (descriptors[index])
                Object.defineProperty(
                    HTMLElement.prototype,
                    name,
                    descriptors[index],
                );
            else delete HTMLElement.prototype[name];
        });
}

export async function settleOptions() {
    for (let i = 0; i < 5; i += 1) await Vue.nextTick();
}

export async function mountOptionsHarness(
    children,
    slots = {},
    component = UserOptions,
) {
    const chartElement = document.createElement('div');
    chartElement.requestFullscreen = () => {};
    const optionsProps = Vue.reactive({
        uid: 'slot-test',
        color: '#123456',
        backgroundColor: '#FFFFFF',
        chartElement,
        hasPdf: true,
        hasXls: true,
        hasImg: true,
        hasSvg: true,
        hasTooltip: true,
        hasTable: true,
        hasLabel: true,
        hasSort: true,
        hasStack: true,
        hasFullscreen: true,
        hasZoom: true,
        hasAnimation: true,
        hasAnnotator: true,
        hasAltCopy: true,
        callbacks: {},
        titles: { open: 'Open', close: 'Close' },
    });
    const optionsRef = Vue.ref(null);
    const slotState = Vue.shallowRef(slots);
    const events = [];
    const eventNames = [
        'generatePdf',
        'generateCsv',
        'generateImage',
        'generateSvg',
        'toggleTable',
        'toggleLabels',
        'toggleSort',
        'toggleStack',
        'toggleFullscreen',
        'toggleTooltip',
        'toggleZoom',
        'toggleAnimation',
        'toggleAnnotator',
        'copyAlt',
    ];
    const listeners = Object.fromEntries(
        eventNames.map((name) => [
            name,
            (...args) => {
                events.push([name, ...args]);
            },
        ]),
    );
    const template = `<UserOptions ref="optionsRef" v-bind="optionsProps" v-on="listeners">${children}</UserOptions>`;
    const render = new Function(
        'Vue',
        compile(template, { mode: 'function', prefixIdentifiers: true }).code,
    )(Vue);
    const Harness = Vue.defineComponent({
        __scopeId: 'data-v-test-chart',
        components: { UserOptions: component },
        setup: () => ({
            optionsProps,
            optionsRef,
            listeners,
            getUserOptionSlots,
            getUserOptionSlotProps,
        }),
        render,
    });
    const App = Vue.defineComponent({
        setup: () => () => Vue.h(Harness, {}, slotState.value),
    });
    const host = document.createElement('div');
    document.body.append(host);
    const app = Vue.createApp(App);
    app.mount(host);
    await settleOptions();
    return {
        host,
        optionsProps,
        optionsRef,
        slotState,
        events,
        html: () => host.innerHTML,
        async click(selector, type = 'click') {
            const element = host.querySelector(selector);
            if (!element) throw new Error(`Missing control: ${selector}`);
            element.dispatchEvent(
                new Event(type, { bubbles: true, cancelable: true }),
            );
            await settleOptions();
        },
        async open() {
            const trigger = host.querySelector(
                '[data-cy="user-options-summary"]',
            );
            const drawer = host.querySelector(
                '[data-cy="user-options-drawer"]',
            );
            const type =
                trigger.getAttribute('role') === 'button'
                    ? 'pointerdown'
                    : 'click';
            trigger.dispatchEvent(
                new Event(type, { bubbles: true, cancelable: true }),
            );
            await settleOptions();
            if (trigger.getAttribute('title') !== 'Close')
                throw new Error('Options menu did not open');
        },
        unmount() {
            app.unmount();
            host.remove();
        },
    };
}

export async function exerciseOptions(
    children,
    slots,
    component = UserOptions,
) {
    const instance = await mountOptionsHarness(children, slots, component);
    try {
        const snapshots = [instance.html()];
        await instance.open();
        snapshots.push(instance.html());
        for (const button of instance.host.querySelectorAll(
            'button[data-cy]',
        )) {
            button.dispatchEvent(
                new Event('click', { bubbles: true, cancelable: true }),
            );
            await settleOptions();
        }
        snapshots.push(instance.html());
        instance.optionsRef.value.setTableIconState(false);
        instance.optionsProps.color = '#654321';
        instance.optionsProps.isFullscreen = true;
        instance.optionsProps.isAnnotation = true;
        instance.optionsProps.isZoom = true;
        await settleOptions();
        snapshots.push(instance.html());
        instance.slotState.value = makeOptionSlots(['optionPdf', 'menuIcon']);
        await settleOptions();
        snapshots.push(instance.html());
        instance.slotState.value = {};
        await settleOptions();
        snapshots.push(instance.html());
        return { snapshots, events: instance.events };
    } finally {
        instance.unmount();
    }
}

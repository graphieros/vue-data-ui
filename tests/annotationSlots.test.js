import { describe, expect, test } from 'vitest';
import * as Vue from 'vue';
import { compile } from '@vue/compiler-dom';
import PenAndPaper from '../src/atoms/PenAndPaper.vue';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../src/annotationSlots';

const original = `
    <template #annotator-action-close><slot name="annotator-action-close" /></template>
    <template #annotator-action-color="{ color }"><slot name="annotator-action-color" v-bind="{ color }" /></template>
    <template #annotator-action-draw="{ mode }"><slot name="annotator-action-draw" v-bind="{ mode }" /></template>
    <template #annotator-action-undo="{ disabled }"><slot name="annotator-action-undo" v-bind="{ disabled }" /></template>
    <template #annotator-action-redo="{ disabled }"><slot name="annotator-action-redo" v-bind="{ disabled }" /></template>
    <template #annotator-action-delete="{ disabled }"><slot name="annotator-action-delete" v-bind="{ disabled }" /></template>
    <template #annotator-action-select-multiple="{ isSelecting }"><slot name="annotator-action-select-multiple" v-bind="{ isSelecting }" /></template>
    <template #annotator-action-group="{ disabled }"><slot name="annotator-action-group" v-bind="{ disabled }" /></template>
    <template #annotator-action-ungroup="{ disabled }"><slot name="annotator-action-ungroup" v-bind="{ disabled }" /></template>`;
const shared = `
    <template v-for="slotName in annotationSlotNames" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="getAnnotationSlotProps(slotName, slotProps)" />
    </template>`;

const settle = async () => {
    for (let i = 0; i < 5; i += 1) await Vue.nextTick();
};

async function exercise(children, scenario) {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const active = Vue.ref(true);
    const events = [];
    const slots = Vue.shallowRef(
        scenario === 'missing'
            ? {}
            : Object.fromEntries(
                  annotationSlotNames.map((name) => [
                      name,
                      (scope) =>
                          scenario === 'empty'
                              ? []
                              : Vue.h('span', {
                                    'data-action': name,
                                    'data-scope': JSON.stringify(scope),
                                }),
                  ]),
              ),
    );
    const render = new Function(
        'Vue',
        compile(
            `<PenAndPaper :svgRef="null" :followZoom="true" :active="active" @close="onClose">${children}</PenAndPaper>`,
            { mode: 'function', prefixIdentifiers: true },
        ).code,
    )(Vue);
    const Harness = Vue.defineComponent({
        __scopeId: 'data-v-test-chart',
        components: { PenAndPaper },
        setup: () => ({
            active,
            annotationSlotNames,
            getAnnotationSlotProps,
            onClose: () => events.push('close'),
        }),
        render,
    });
    const app = Vue.createApp({
        render: () => Vue.h(Harness, {}, slots.value),
    });
    try {
        app.mount(host);
        await settle();
        const snapshots = [host.innerHTML];
        const actions = () =>
            host.querySelectorAll('button.vue-ui-pen-and-paper-action');
        actions()[0].click();
        actions()[2].click();
        await settle();
        snapshots.push(host.innerHTML);
        actions()[2].click();
        await settle();
        snapshots.push(host.innerHTML);
        host.querySelector('[data-cy="pen-and-paper-select-multiple"]').click();
        await settle();
        snapshots.push(host.innerHTML);
        slots.value = {};
        await settle();
        snapshots.push(host.innerHTML);
        active.value = false;
        await settle();
        snapshots.push(host.innerHTML);
        active.value = true;
        await settle();
        snapshots.push(host.innerHTML);
        return { snapshots, events };
    } finally {
        app.unmount();
        host.remove();
    }
}

describe('annotation slot compatibility', () => {
    test.each(['missing', 'provided', 'empty'])(
        'preserves real toolbar DOM, scope, fallback icons and close events with %s slots',
        async (scenario) => {
            const before = await exercise(original, scenario);
            const after = await exercise(shared, scenario);
            expect(after).toEqual(before);
            expect(after.events).toEqual(['close']);
            if (scenario === 'provided') {
                expect(after.snapshots[0]).toContain(
                    '&quot;mode&quot;:&quot;arrow&quot;',
                );
                expect(after.snapshots[1]).toContain(
                    '&quot;mode&quot;:&quot;text&quot;',
                );
                expect(after.snapshots[0]).toContain(
                    '&quot;disabled&quot;:true',
                );
                expect(after.snapshots[0]).toContain(
                    '&quot;isSelecting&quot;:false',
                );
                expect(after.snapshots[3]).toContain(
                    '&quot;isSelecting&quot;:true',
                );
            }
        },
    );

    test.each([
        ['annotator-action-close', {}],
        ['annotator-action-color', { color: '#123456' }],
        ['annotator-action-draw', { mode: 'line' }],
        ['annotator-action-undo', { disabled: false }],
        ['annotator-action-redo', { disabled: false }],
        ['annotator-action-delete', { disabled: false }],
        ['annotator-action-select-multiple', { isSelecting: false }],
        ['annotator-action-group', { disabled: false }],
        ['annotator-action-ungroup', { disabled: false }],
    ])('forwards only the existing scope for %s', (name, expected) => {
        expect(
            getAnnotationSlotProps(name, {
                color: '#123456',
                mode: 'line',
                disabled: false,
                isSelecting: false,
                extra: true,
            }),
        ).toEqual(expected);
    });
});

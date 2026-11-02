import { mount } from '@vue/test-utils';
import * as Vue from 'vue';
import { compile } from '@vue/compiler-dom';
import { expect, it } from 'vitest';
import PenAndPaper from '../src/atoms/PenAndPaper.vue';
import { getAnnotatorProps } from '../src/annotatorConfig';

it('preserves the explicit chart bindings through reactive config changes', async () => {
    const config = Vue.ref();
    const bindings = [
        `:showGroupActions="config?.showGroupActions ?? true"
         :useOutline="config?.useOutline ?? true"
         :outlineThickness="config?.outlineThickness ?? 1"
         :outlineColor="config?.outlineColor ?? null"`,
        'v-bind="getAnnotatorProps(config)"',
    ];
    const wrappers = bindings.map((binding) => {
        const render = new Function(
            'Vue',
            compile(`<PenAndPaper :svgRef="null" ${binding} />`, {
                mode: 'function',
                prefixIdentifiers: true,
            }).code,
        )(Vue);
        return mount({
            components: { PenAndPaper },
            setup: () => ({ config, getAnnotatorProps }),
            render,
        });
    });
    try {
        for (const value of [
            undefined,
            null,
            {},
            { useOutline: false, showGroupActions: false, outlineThickness: 0 },
            { outlineColor: '#123456', outlineThickness: 3, followZoom: true },
            { useOutline: null, outlineThickness: null, outlineColor: null },
        ]) {
            config.value = value;
            await Vue.nextTick();
            expect(wrappers[1].findComponent(PenAndPaper).props()).toEqual(
                wrappers[0].findComponent(PenAndPaper).props(),
            );
        }
    } finally {
        wrappers.forEach((wrapper) => wrapper.unmount());
    }
});

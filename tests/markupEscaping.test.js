import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { safeAttr } from '../src/lib';
import BaseIcon from '../src/atoms/BaseIcon.vue';
import Annotator from '../src/components/vue-ui-annotator.vue';

vi.mock('../src/dom-to-png', () => ({ domToPng: vi.fn() }));

const HOSTILE = '"><script>alert(1)</script><g onload="alert(1)';

function injected(markup) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.innerHTML = markup;
    const elements = [...svg.querySelectorAll('*')];
    return {
        scripts: elements.filter((el) => el.localName === 'script').length,
        handlers: elements.flatMap((el) =>
            [...el.attributes].filter((a) => /^on/i.test(a.name)),
        ).length,
    };
}

const wrappers = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
});

describe('safeAttr', () => {
    test('returns numbers, booleans, null and undefined unchanged', () => {
        expect(safeAttr(1.5)).toBe(1.5);
        expect(safeAttr(NaN)).toBeNaN();
        expect(safeAttr(true)).toBe(true);
        expect(safeAttr(null)).toBe(null);
        expect(safeAttr(undefined)).toBe(undefined);
    });

    test('leaves ordinary attribute strings untouched', () => {
        for (const value of ['#FF0000', 'rgb(1, 2, 3)', '1s', 'shape_1']) {
            expect(safeAttr(value)).toBe(value);
        }
    });

    test('escapes characters that could leave a double-quoted attribute', () => {
        expect(safeAttr('a"<b>&')).toBe('a&quot;&lt;b&gt;&amp;');
    });
});

describe('BaseIcon', () => {
    test('escapes stroke, stroke width and spin duration from props and slots', () => {
        const w = mount(BaseIcon, {
            props: { name: 'star', stroke: HOSTILE },
            slots: {
                exp: () =>
                    h('i', {
                        name: 'star',
                        stroke: HOSTILE,
                        'stroke-width': HOSTILE,
                        isSpin: true,
                        spinDuration: HOSTILE,
                    }),
            },
        });
        wrappers.push(w);
        const markup = w.find('svg').element.innerHTML;
        expect(injected(markup)).toEqual({ scripts: 0, handlers: 0 });
        expect(w.find('path').attributes('stroke')).toBe(HOSTILE);
    });
});

describe('VueUiAnnotator', () => {
    test('escapes shape fields rendered into markup', async () => {
        const shapes = [
            {
                id: HOSTILE,
                type: 'rect',
                x: HOSTILE,
                y: 10,
                rectWidth: 10,
                rectHeight: 10,
                color: HOSTILE,
                alpha: HOSTILE,
                strokeWidth: HOSTILE,
                isFilled: true,
            },
            {
                id: HOSTILE,
                type: 'line',
                path: HOSTILE,
                color: HOSTILE,
                alpha: '',
                strokeWidth: 2,
            },
            {
                id: HOSTILE,
                type: 'text',
                x: HOSTILE,
                y: 10,
                fontSize: HOSTILE,
                textAlign: HOSTILE,
                color: HOSTILE,
                textContent: HOSTILE,
            },
        ];
        const w = mount(
            { ...Annotator, render: () => null },
            {
                props: { dataset: { shapes } },
                global: {
                    stubs: {
                        Accordion: true,
                        ColorPicker: true,
                        BaseIcon: true,
                        TeleportedTooltip: true,
                        teleport: true,
                    },
                },
            },
        );
        wrappers.push(w);
        await flushPromises();
        const s = w.vm.$.setupState;
        s.isSummaryOpen = true;
        s.isDeleteMode = true;
        for (const shape of shapes) {
            const markup = s.renderShape(structuredClone(shape)).html;
            expect(injected(markup)).toEqual({ scripts: 0, handlers: 0 });
        }
    });
});

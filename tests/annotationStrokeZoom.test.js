import { createApp, h, nextTick, ref } from 'vue';
import { expect, it } from 'vitest';
import PenAndPaper from '../src/atoms/PenAndPaper.vue';

it.each([0.125, 0.5, 1, 2, 4, 8])(
    'keeps CSS pixel sizes at screen scale %s (viewBox, layout or zoom)',
    async (zoom) => {
        const host = document.createElement('div');
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const menu = document.createElement('div');
        host.append(svg, menu);
        document.body.append(host);
        svg.getScreenCTM = () => ({ a: zoom, b: 0, inverse: () => ({}) });
        svg.createSVGPoint = () => ({
            x: 0,
            y: 0,
            matrixTransform() {
                return { x: this.x / zoom, y: this.y / zoom };
            },
        });
        const app = createApp({
            render: () =>
                h(
                    PenAndPaper,
                    {
                        svgRef: svg,
                        active: true,
                    },
                    {
                        'annotator-action-undo': () =>
                            h('span', { 'data-test': 'undo' }),
                        'annotator-action-redo': () =>
                            h('span', { 'data-test': 'redo' }),
                        'annotator-action-delete': () =>
                            h('span', { 'data-test': 'reset' }),
                    },
                ),
        });
        try {
            app.mount(menu);
            await nextTick();
            expect(
                menu.querySelector('[data-cy="pen-and-paper-select-multiple"]')
                    .disabled,
            ).toBe(true);
            for (const [type, x, y] of [
                ['mousedown', 20, 30],
                ['mousemove', 120, 130],
                ['mouseup', 120, 130],
            ]) {
                svg.dispatchEvent(
                    new MouseEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y,
                    }),
                );
            }
            await nextTick();
            let line = svg.querySelector('line.vue-data-ui-doodle');
            expect(line).not.toBeNull();
            expect(
                menu.querySelector('[data-cy="pen-and-paper-select-multiple"]')
                    .disabled,
            ).toBe(true);
            expect(Number(line.getAttribute('stroke-width')) * zoom).toBe(2);
            expect(line.getAttribute('marker-end')).toBeTruthy();
            const selectionToggle = menu.querySelector(
                '[data-cy="pen-and-paper-select-multiple"]',
            );
            menu.querySelector('[data-test="undo"]').closest('button').click();
            await nextTick();
            expect(selectionToggle.disabled).toBe(true);
            menu.querySelector('[data-test="redo"]').closest('button').click();
            await nextTick();
            expect(selectionToggle.disabled).toBe(true);
            line = svg.querySelector('line.vue-data-ui-doodle');
            line.getBBox = () => ({
                x: 20 / zoom,
                y: 30 / zoom,
                width: 100 / zoom,
                height: 100 / zoom,
            });
            for (const localScale of [1, 0.5, 2]) {
                line.getScreenCTM = () => ({
                    a: zoom * localScale,
                    b: 0,
                    inverse: () => ({}),
                });
                line.setAttribute('transform', `scale(${localScale})`);
                line.dispatchEvent(
                    new MouseEvent('mousedown', {
                        bubbles: true,
                        cancelable: true,
                        clientX: 120,
                        clientY: 130,
                    }),
                );
                await nextTick();
                const button = svg.querySelector(
                    '.vue-data-ui-selection-delete rect',
                );
                expect(button).not.toBeNull();
                expect(button.getAttribute('stroke-width')).toBe('1');
                expect(button.getAttribute('vector-effect')).toBe(
                    'non-scaling-stroke',
                );
                const deleteIcon = button.parentNode.querySelector('path');
                expect(deleteIcon.getAttribute('stroke-width')).toBe('1.5');
                expect(deleteIcon.getAttribute('vector-effect')).toBe(
                    'non-scaling-stroke',
                );
                const iconScale = Number(
                    deleteIcon
                        .getAttribute('transform')
                        .match(/scale\(([^)]+)\)/)[1],
                );
                expect(20 * iconScale * zoom * localScale).toBeCloseTo(16);
                expect(deleteIcon.getAttribute('d')).toBe(
                    'M7 18h6c2 0 2 0 3-12H4c1 12 1 12 3 12M3 4h14M8 2h4m-2 6v7M7 8l.518 7.01M13 8l-.546 6.984',
                );

                const outline = svg.querySelector('.vue-data-ui-selection-box');
                expect(outline.getAttribute('vector-effect')).toBe(
                    'non-scaling-stroke',
                );
                expect(outline.getAttribute('stroke-width')).toBe('1');
                expect(outline.getAttribute('stroke-dasharray')).toBe('4 3');

                const handle = svg.querySelector(
                    '.vue-data-ui-selection-handle',
                );
                expect(
                    Number(handle.getAttribute('r')) * zoom * localScale,
                ).toBe(5);
                const slider = menu.querySelector('input[type="range"]');
                slider.value = '4';
                slider.dispatchEvent(new Event('input', { bubbles: true }));
                await nextTick();
                expect(
                    Number(line.getAttribute('stroke-width')) *
                        zoom *
                        localScale,
                ).toBe(4);

                expect(
                    Number(button.getAttribute('width')) * zoom * localScale,
                ).toBe(24);
                expect(
                    Number(button.getAttribute('height')) * zoom * localScale,
                ).toBe(24);
                expect(
                    Number(button.getAttribute('rx')) * zoom * localScale,
                ).toBe(4);
                svg.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            }
            menu.querySelector('[data-test="reset"]').closest('button').click();
            await nextTick();
            expect(selectionToggle.disabled).toBe(true);
        } finally {
            app.unmount();
            host.remove();
        }
    },
);

it.each([false, true])(
    'supports hover and grouping independently of followZoom (%s)',
    async (followZoom) => {
        const showGroupActions = ref(true);
        const host = document.createElement('div');
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const menu = document.createElement('div');
        host.append(svg, menu);
        document.body.append(host);
        const matrix = {
            a: 1,
            b: 0,
            inverse() {
                return this;
            },
        };
        svg.getScreenCTM = () => matrix;
        svg.createSVGPoint = () => ({
            x: 0,
            y: 0,
            matrixTransform() {
                return this;
            },
        });
        const app = createApp({
            render: () =>
                h(PenAndPaper, {
                    svgRef: svg,
                    active: true,
                    followZoom,
                    showGroupActions: showGroupActions.value,
                }),
        });
        try {
            app.mount(menu);
            await nextTick();
            for (const [type, x, y] of [
                ['mousedown', 20, 30],
                ['mousemove', 120, 130],
                ['mouseup', 120, 130],
            ]) {
                svg.dispatchEvent(
                    new MouseEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y,
                    }),
                );
            }
            await nextTick();
            const line = svg.querySelector('line.vue-data-ui-doodle');
            line.getBBox = () => ({ x: 20, y: 30, width: 100, height: 100 });
            line.getScreenCTM = () => matrix;
            line.setAttribute('transform', 'translate(10 20)');
            for (const [type, x, y] of [
                ['mousedown', 300, 300],
                ['mousemove', 340, 340],
                ['mouseup', 340, 340],
            ]) {
                svg.dispatchEvent(
                    new MouseEvent(type, {
                        bubbles: true,
                        cancelable: true,
                        clientX: x,
                        clientY: y,
                    }),
                );
            }
            await nextTick();

            const hover = () =>
                line.dispatchEvent(
                    new MouseEvent('mousemove', {
                        bubbles: true,
                        clientX: 50,
                        clientY: 60,
                    }),
                );
            const outline = () =>
                svg.querySelector('.vue-data-ui-annotation-hover-outline');
            hover();
            expect(outline()).toBeNull();
            const toggle = menu.querySelector(
                '[data-cy="pen-and-paper-select-multiple"]',
            );
            toggle.click();
            await nextTick();
            hover();
            expect(outline()).not.toBeNull();
            expect(outline().getAttribute('stroke-dasharray')).toBe('4 3');
            expect(outline().getAttribute('pointer-events')).toBe('none');
            expect(outline().getAttribute('transform')).toBe(
                'translate(10 20)',
            );
            expect(outline().classList.contains('vue-data-ui-doodle')).toBe(
                false,
            );
            svg.dispatchEvent(new MouseEvent('mouseleave'));
            expect(outline()).toBeNull();
            hover();
            toggle.click();
            await nextTick();
            expect(outline()).toBeNull();
            toggle.click();
            await nextTick();
            hover();
            line.dispatchEvent(
                new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                }),
            );
            await nextTick();
            expect(outline()).toBeNull();
            expect(
                svg.querySelector('.vue-data-ui-selection-box'),
            ).not.toBeNull();
            expect(
                svg.querySelector('.vue-data-ui-selection-handle'),
            ).toBeNull();
            expect(
                svg.querySelector('.vue-data-ui-selection-delete'),
            ).toBeNull();
            toggle.click();
            await nextTick();
            expect(
                svg.querySelector('.vue-data-ui-selection-delete'),
            ).not.toBeNull();
            toggle.click();
            await nextTick();
            expect(
                svg.querySelector('.vue-data-ui-selection-delete'),
            ).toBeNull();
            const second = svg.querySelectorAll('line.vue-data-ui-doodle')[1];
            second.getBBox = line.getBBox;
            second.getScreenCTM = line.getScreenCTM;
            second.setAttribute('data-doodle-id', 'second-annotation');

            second.dispatchEvent(
                new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    shiftKey: true,
                }),
            );
            await nextTick();
            const groupButton = menu.querySelector(
                '[data-cy="pen-and-paper-group"]',
            );
            expect(groupButton.disabled).toBe(false);
            groupButton.click();
            await nextTick();
            const group = svg.querySelector('[data-annotation-group]');
            expect(group).not.toBeNull();
            expect(group.querySelectorAll('.vue-data-ui-doodle')).toHaveLength(
                2,
            );
            const ungroupButton = menu.querySelector(
                '[data-cy="pen-and-paper-ungroup"]',
            );
            expect(ungroupButton.disabled).toBe(false);
            ungroupButton.click();
            await nextTick();
            expect(svg.querySelector('[data-annotation-group]')).toBeNull();
            expect(svg.querySelectorAll('.vue-data-ui-doodle')).toHaveLength(2);
            toggle.click();
            await nextTick();
            showGroupActions.value = false;
            await nextTick();
            expect(
                menu.querySelector('.vue-ui-pen-and-paper-group-actions'),
            ).toBeNull();
            expect(
                menu.querySelector('.vue-ui-pen-and-paper-actions-with-groups'),
            ).toBeNull();
            hover();
            expect(outline()).toBeNull();
            showGroupActions.value = true;
            await nextTick();
            expect(
                menu
                    .querySelector('[data-cy="pen-and-paper-select-multiple"]')
                    .getAttribute('aria-pressed'),
            ).toBe('false');
        } finally {
            app.unmount();
            host.remove();
        }
    },
);

it.each([0.2, 1, 5])(
    'creates 16px annotation text at screen scale %s',
    async (screenScale) => {
        const host = document.createElement('div');
        const svg = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'svg',
        );
        const menu = document.createElement('div');
        host.append(svg, menu);
        document.body.append(host);
        const oldMatrix = Object.getOwnPropertyDescriptor(
            SVGElement.prototype,
            'getScreenCTM',
        );
        const oldBBox = Object.getOwnPropertyDescriptor(
            SVGElement.prototype,
            'getBBox',
        );
        const matrix = {
            a: screenScale,
            b: 0,
            inverse() {
                return this;
            },
        };
        Object.defineProperty(SVGElement.prototype, 'getScreenCTM', {
            configurable: true,
            value: () => matrix,
        });
        Object.defineProperty(SVGElement.prototype, 'getBBox', {
            configurable: true,
            value: () => ({ x: 0, y: 0, width: 0, height: 0 }),
        });
        svg.createSVGPoint = () => ({
            x: 0,
            y: 0,
            matrixTransform() {
                return this;
            },
        });
        const app = createApp({
            render: () =>
                h(
                    PenAndPaper,
                    { svgRef: svg, active: true },
                    {
                        'annotator-action-draw': ({ mode }) =>
                            h('span', { 'data-mode': mode }),
                    },
                ),
        });
        try {
            app.mount(menu);
            await nextTick();
            menu.querySelector('[data-mode="arrow"]').closest('button').click();
            await nextTick();
            svg.dispatchEvent(
                new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: 20,
                    clientY: 30,
                }),
            );
            await nextTick();
            const text = svg.querySelector('text.vue-data-ui-doodle');
            expect(text).not.toBeNull();
            expect(
                Number(text.getAttribute('font-size')) * screenScale,
            ).toBeCloseTo(16);
            const slider = menu.querySelector('input[type="range"]');
            slider.value = '24';
            slider.dispatchEvent(new Event('input', { bubbles: true }));
            await nextTick();
            expect(
                Number(text.getAttribute('font-size')) * screenScale,
            ).toBeCloseTo(24);
            const caret = svg.querySelector('.vue-data-ui-svg-caret');
            expect(Number(caret.getAttribute('width')) * screenScale).toBe(2);
        } finally {
            app.unmount();
            host.remove();
            if (oldMatrix)
                Object.defineProperty(
                    SVGElement.prototype,
                    'getScreenCTM',
                    oldMatrix,
                );
            else delete SVGElement.prototype.getScreenCTM;
            if (oldBBox)
                Object.defineProperty(SVGElement.prototype, 'getBBox', oldBBox);
            else delete SVGElement.prototype.getBBox;
        }
    },
);

import { ref } from 'vue';
import { expect, fireEvent, waitFor } from 'storybook/test';
import PenAndPaper from '../../src/atoms/PenAndPaper.vue';
import VueUiXy from '../../src/components/vue-ui-xy.vue';

const initial = {
    x: { origin: 0, unit: 1 },
    y: { origin: 100, unit: -1 },
    clip: { x: 0, y: 0, width: 200, height: 100 },
};
const zoomed = {
    x: { origin: -40, unit: 2 },
    y: { origin: 150, unit: -2 },
    clip: { x: 0, y: 0, width: 200, height: 100 },
};

function eventAt(svg, name, x, y, target = svg) {
    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;
    const client = point.matrixTransform(svg.getScreenCTM());
    const event = new MouseEvent(name, { bubbles: true, cancelable: true });
    // MouseEvent constructors truncate fractional coordinates in Chromium.
    Object.defineProperties(event, {
        clientX: { value: client.x },
        clientY: { value: client.y },
    });
    target.dispatchEvent(event);
}

function anchor(svg, shape, x, y) {
    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;
    return point.matrixTransform(
        svg.getScreenCTM().inverse().multiply(shape.getScreenCTM()),
    );
}

async function drawArrow(canvasElement, offset = 0) {
    await waitFor(() =>
        expect(canvasElement.querySelector('.vue-data-ui-mask')).toBeTruthy(),
    );
    const svg = canvasElement.querySelector('[data-test="paper"]');
    eventAt(svg, 'mousedown', 40 + offset, 70);
    eventAt(svg, 'mousemove', 80 + offset, 50);
    eventAt(svg, 'mouseup', 80 + offset, 50);
    return svg.querySelector('line.vue-data-ui-doodle');
}

export default {
    title: 'Atoms/PenAndPaper Zoom',
    render: (args) => ({
        components: { PenAndPaper },
        setup() {
            return {
                svg: ref(null),
                active: ref(true),
                follow: ref(args.followZoom),
                showGroupActions: ref(true),
                viewport: ref(initial),
                initial,
                zoomed,
                args,
            };
        },
        template: `
            <div style="position:relative;padding-left:80px">
                <button data-test="zoom" @click="viewport = zoomed">Zoom</button>
                <button data-test="reset" @click="viewport = initial">Reset zoom</button>
                <button data-test="follow" @click="follow = !follow">Toggle follow</button>
                <button data-test="groups" @click="showGroupActions = !showGroupActions">Toggle grouping controls</button>
                <button data-test="active" @click="active = !active">Toggle annotator</button>
                <svg ref="svg" data-test="paper" viewBox="0 0 200 100" width="600" height="300" />
                <PenAndPaper :svgRef="svg" :active="active" :followZoom="follow" :showGroupActions="showGroupActions" :annotationViewport="viewport" />
            </div>`,
    }),
};

export const AnchorsFollowZoomWithConstantSizes = {
    args: { followZoom: true },
    play: async ({ canvasElement }) => {
        const line = await drawArrow(canvasElement);
        const svg = canvasElement.querySelector('[data-test="paper"]');
        const width = line.getAttribute('stroke-width');
        await fireEvent.click(
            canvasElement.querySelector(
                '[data-cy="pen-and-paper-toggle-text"]',
            ),
        );
        eventAt(svg, 'mousedown', 100, 30);
        window.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'A', bubbles: true }),
        );
        // Closing commits the text and removes edit-only elements.
        await fireEvent.click(
            canvasElement.querySelector('[data-test="active"]'),
        );
        const text = svg.querySelector('text.vue-data-ui-doodle');
        expect(text.textContent).toContain('A');
        const fontSize = text.getAttribute('font-size');
        await fireEvent.click(
            canvasElement.querySelector('[data-test="zoom"]'),
        );
        await waitFor(() =>
            expect(anchor(svg, line, 80, 50).x).toBeCloseTo(120),
        );
        expect(anchor(svg, line, 80, 50).y).toBeCloseTo(50);
        expect(anchor(svg, text, 100, 30).x).toBeCloseTo(160);
        expect(anchor(svg, text, 100, 30).y).toBeCloseTo(10);
        expect(line.getAttribute('stroke-width')).toBe(width);
        expect(text.getAttribute('font-size')).toBe(fontSize);
        expect(line.getBBox().width).toBeCloseTo(40);
        expect(getComputedStyle(line).pointerEvents).toBe('none');
        expect(svg.querySelector('.vue-data-ui-mask')).toBeNull();
        expect(
            svg.querySelector('.vue-data-ui-doodles').hasAttribute('clip-path'),
        ).toBe(true);
        await fireEvent.click(
            canvasElement.querySelector('[data-test="reset"]'),
        );
        await waitFor(() =>
            expect(anchor(svg, line, 80, 50).x).toBeCloseTo(80),
        );
        expect(anchor(svg, text, 100, 30).y).toBeCloseTo(30);
    },
};

export const DefaultAnnotationsStayFixed = {
    args: {},
    play: async ({ canvasElement }) => {
        const line = await drawArrow(canvasElement);
        const before = line.outerHTML;
        await fireEvent.click(
            canvasElement.querySelector('[data-test="zoom"]'),
        );
        expect(line.outerHTML).toBe(before);
        expect(canvasElement.querySelector('clipPath')).toBeNull();
    },
};

export const EditingAndHistoryAfterZoom = {
    args: { followZoom: true },
    play: async ({ canvasElement }) => {
        const line = await drawArrow(canvasElement);
        const svg = canvasElement.querySelector('[data-test="paper"]');
        await fireEvent.click(
            canvasElement.querySelector('[data-test="zoom"]'),
        );
        await waitFor(() =>
            expect(anchor(svg, line, 80, 50).x).toBeCloseTo(120),
        );
        eventAt(svg, 'mousedown', 100, 60, line);
        eventAt(svg, 'mousemove', 110, 60, line);
        eventAt(svg, 'mouseup', 110, 60, line);
        expect(anchor(svg, line, 80, 50).x).toBeCloseTo(130);
        // Resize one endpoint through the selection handle after projection.
        const handle = svg.querySelector('[data-line-endpoint="end"]');
        eventAt(svg, 'mousedown', 130, 50, handle);
        eventAt(svg, 'mousemove', 140, 50);
        eventAt(svg, 'mouseup', 140, 50);
        expect(
            anchor(svg, line, Number(line.getAttribute('x2')), 50).x,
        ).toBeCloseTo(140);
        await fireEvent.click(
            canvasElement.querySelector('[data-test="reset"]'),
        );
        const actions = canvasElement.querySelectorAll(
            '.vue-ui-pen-and-paper-action',
        );
        await fireEvent.click(actions[3]); // undo endpoint edit in the original viewport
        let restored = svg.querySelector('line.vue-data-ui-doodle');
        expect(anchor(svg, restored, 80, 50).x).toBeCloseTo(85);
        await fireEvent.click(actions[3]); // undo move
        restored = svg.querySelector('line.vue-data-ui-doodle');
        expect(anchor(svg, restored, 80, 50).x).toBeCloseTo(80);
        await fireEvent.click(actions[4]); // redo move
        restored = svg.querySelector('line.vue-data-ui-doodle');
        expect(anchor(svg, restored, 80, 50).x).toBeCloseTo(85);
    },
};

export const XyZoomIntegration = {
    render: (args) => ({
        components: { VueUiXy },
        setup() {
            return {
                chart: ref(null),
                customGroupSlots: !!args.customGroupSlots,
                dataset: [
                    {
                        name: 'Series',
                        type: 'line',
                        series: [10, 20, 30, 40, 50, 60],
                    },
                ],
                config: {
                    useCssAnimation: !!args.animated,
                    chart: { userOptions: { annotator: { followZoom: true } } },
                },
            };
        },
        template: `<div style="width:700px">
            <button data-test="annotate" @click="chart.toggleAnnotator()">Annotate</button>
            <button data-test="zoom" @click="chart.setZoomState({start:1,end:4})">Zoom</button>
            <button data-test="reset" @click="chart.resetZoom()">Reset</button>
            <VueUiXy ref="chart" :dataset="dataset" :config="config">
                <template v-if="customGroupSlots" #annotator-action-select-multiple="{ isSelecting }">
                    <span data-test="custom-select">{{ isSelecting ? 'Finish' : 'Select' }}</span>
                </template>
                <template v-if="customGroupSlots" #annotator-action-group="{ disabled }">
                    <span data-test="custom-group" :data-disabled="disabled">Group</span>
                </template>
                <template v-if="customGroupSlots" #annotator-action-ungroup="{ disabled }">
                    <span data-test="custom-ungroup" :data-disabled="disabled">Ungroup</span>
                </template>
            </VueUiXy>
        </div>`,
    }),
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector('.vue-data-ui-doodles'),
            ).toBeTruthy(),
        );
        await fireEvent.click(
            canvasElement.querySelector('[data-test="annotate"]'),
        );
        const svg = canvasElement.querySelector('[data-cy="xy-svg"]');
        const clip = svg.querySelector('clipPath[id^="annotation-clip-"] rect');
        const left = Number(clip.getAttribute('x'));
        const top = Number(clip.getAttribute('y'));
        const width = Number(clip.getAttribute('width'));
        const height = Number(clip.getAttribute('height'));
        const x = left + width / 2,
            y = top + height / 2;
        eventAt(svg, 'mousedown', x - 20, y + 20);
        eventAt(svg, 'mousemove', x, y);
        eventAt(svg, 'mouseup', x, y);
        const line = svg.querySelector('line.vue-data-ui-doodle');
        const strokeWidth = line.getAttribute('stroke-width');
        await fireEvent.click(
            canvasElement.querySelector('[data-test="annotate"]'),
        );
        await fireEvent.click(
            canvasElement.querySelector('[data-test="zoom"]'),
        );
        await waitFor(() =>
            expect(line.getAttribute('transform')).toContain('translate'),
        );
        const data = JSON.parse(line.getAttribute('data-annotation-anchor'));
        // Six categorical cells become three, with the range starting at index 1.
        const zoomClip = svg.querySelector(
            'clipPath[id^="annotation-clip-"] rect',
        );
        const newLeft = Number(zoomClip.getAttribute('x'));
        const newWidth = Number(zoomClip.getAttribute('width'));
        await waitFor(() =>
            expect(anchor(svg, line, x, y).x).toBeCloseTo(
                newLeft + newWidth / 6 + ((data.x - 1) * newWidth) / 3,
            ),
        );
        expect(line.getAttribute('stroke-width')).toBe(strokeWidth);
        await fireEvent.click(
            canvasElement.querySelector('[data-test="reset"]'),
        );
        await waitFor(() => expect(anchor(svg, line, x, y).x).toBeCloseTo(x));
        expect(anchor(svg, line, x, y).y).toBeCloseTo(y);
    },
};

export const FreehandAndDotsKeepTheirSize = {
    args: { followZoom: true },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector('.vue-data-ui-mask'),
            ).toBeTruthy(),
        );
        const svg = canvasElement.querySelector('[data-test="paper"]');
        const mode = canvasElement.querySelector(
            '[data-cy="pen-and-paper-toggle-text"]',
        );
        for (let i = 0; i < 3; i += 1) await fireEvent.click(mode);
        eventAt(svg, 'mousedown', 50, 50);
        eventAt(svg, 'mousemove', 60, 40);
        eventAt(svg, 'mousemove', 70, 45);
        eventAt(svg, 'mouseup', 70, 45);
        eventAt(svg, 'mousedown', 90, 50);
        eventAt(svg, 'mouseup', 90, 50);
        const path = svg.querySelector('path.vue-data-ui-doodle');
        const circle = svg.querySelector('circle.vue-data-ui-doodle');
        const d = path.getAttribute('d');
        const radius = circle.getAttribute('r');
        await fireEvent.click(
            canvasElement.querySelector('[data-test="zoom"]'),
        );
        await waitFor(() =>
            expect(anchor(svg, circle, 90, 50).x).toBeCloseTo(140),
        );
        expect(anchor(svg, path, 50, 50).x).toBeCloseTo(60);
        expect(path.getAttribute('d')).toBe(d);
        expect(circle.getAttribute('r')).toBe(radius);
        await fireEvent.click(
            canvasElement.querySelector('[data-test="reset"]'),
        );
        expect(anchor(svg, path, 50, 50).x).toBeCloseTo(50);
    },
};

export const ToggleFollowingReanchorsAtCurrentPosition = {
    args: { followZoom: true },
    play: async ({ canvasElement }) => {
        const line = await drawArrow(canvasElement);
        const svg = canvasElement.querySelector('[data-test="paper"]');
        await fireEvent.click(
            canvasElement.querySelector('[data-test="zoom"]'),
        );
        await waitFor(() =>
            expect(anchor(svg, line, 80, 50).x).toBeCloseTo(120),
        );
        await fireEvent.click(
            canvasElement.querySelector('[data-test="follow"]'),
        );
        await fireEvent.click(
            canvasElement.querySelector('[data-test="reset"]'),
        );
        expect(anchor(svg, line, 80, 50).x).toBeCloseTo(120);
        await fireEvent.click(
            canvasElement.querySelector('[data-test="follow"]'),
        );
        await fireEvent.click(
            canvasElement.querySelector('[data-test="zoom"]'),
        );
        expect(anchor(svg, line, 80, 50).x).toBeCloseTo(200);
    },
};

export const AnimatedXyZoomIntegration = {
    ...XyZoomIntegration,
    args: { animated: true },
};

async function groupArrowAndText(canvasElement) {
    const line = await drawArrow(canvasElement);
    const svg = canvasElement.querySelector('[data-test="paper"]');
    await fireEvent.click(
        canvasElement.querySelector('[data-cy="pen-and-paper-toggle-text"]'),
    );
    eventAt(svg, 'mousedown', 100, 30);
    window.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'A', bubbles: true }),
    );
    await fireEvent.click(
        canvasElement.querySelector(
            '[data-cy="pen-and-paper-select-multiple"]',
        ),
    );
    eventAt(svg, 'mousedown', 60, 60, line);
    eventAt(svg, 'mouseup', 60, 60, line);
    const groupButton = canvasElement.querySelector(
        '[data-cy="pen-and-paper-group"]',
    );
    await waitFor(() => expect(groupButton.disabled).toBe(false));
    expect(svg.querySelectorAll('.vue-data-ui-selection-box')).toHaveLength(2);
    await fireEvent.click(groupButton);
    const group = svg.querySelector('[data-annotation-group]');
    expect(group).toBeTruthy();
    expect(group.querySelectorAll('.vue-data-ui-doodle')).toHaveLength(2);
    return { svg, group, line, text: group.querySelector('text') };
}

export const ExplicitGroupsKeepSpacingDuringZoom = {
    args: { followZoom: true },
    play: async ({ canvasElement }) => {
        const { svg, group, line, text } =
            await groupArrowAndText(canvasElement);
        const beforeLine = anchor(svg, line, 80, 50);
        const beforeText = anchor(svg, text, 100, 30);
        const fontSize = text.getAttribute('font-size');
        const stroke = line.getAttribute('stroke-width');
        await fireEvent.click(
            canvasElement.querySelector('[data-test="active"]'),
        );
        await fireEvent.click(
            canvasElement.querySelector('[data-test="zoom"]'),
        );
        await waitFor(() =>
            expect(anchor(svg, line, 80, 50).x).toBeCloseTo(120),
        );
        const afterLine = anchor(svg, line, 80, 50);
        const afterText = anchor(svg, text, 100, 30);
        expect(afterText.x - afterLine.x).toBeCloseTo(
            beforeText.x - beforeLine.x,
        );
        expect(afterText.y - afterLine.y).toBeCloseTo(
            beforeText.y - beforeLine.y,
        );
        expect(text.getAttribute('font-size')).toBe(fontSize);
        expect(line.getAttribute('stroke-width')).toBe(stroke);
        expect(getComputedStyle(text).pointerEvents).toBe('none');
        await fireEvent.click(
            canvasElement.querySelector('[data-test="active"]'),
        );
        eventAt(svg, 'mousedown', 140, 30, text);
        eventAt(svg, 'mouseup', 140, 30, text);
        await waitFor(() =>
            expect(
                canvasElement.querySelector('[data-cy="pen-and-paper-ungroup"]')
                    .disabled,
            ).toBe(false),
        );
        await fireEvent.click(
            canvasElement.querySelector('[data-cy="pen-and-paper-ungroup"]'),
        );
        expect(svg.querySelector('[data-annotation-group]')).toBeNull();
        expect(anchor(svg, text, 100, 30).x).toBeCloseTo(afterText.x);
        // Once ungrouped, the two annotations follow independent anchors again.
        await fireEvent.click(
            canvasElement.querySelector('[data-test="reset"]'),
        );
        expect(anchor(svg, line, 80, 50).x).toBeCloseTo(80);
        expect(anchor(svg, text, 100, 30).x).toBeCloseTo(90);
        expect(group.isConnected).toBe(false);
    },
};

export const GroupDraggingAndHistoryAcrossZoom = {
    args: { followZoom: true },
    play: async ({ canvasElement }) => {
        const { svg, line, text } = await groupArrowAndText(canvasElement);
        await fireEvent.click(
            canvasElement.querySelector('[data-test="zoom"]'),
        );
        await waitFor(() =>
            expect(anchor(svg, line, 80, 50).x).toBeCloseTo(120),
        );
        eventAt(svg, 'mousedown', 100, 60, line);
        eventAt(svg, 'mousemove', 110, 65, line);
        eventAt(svg, 'mouseup', 110, 65, line);
        expect(anchor(svg, line, 80, 50).x).toBeCloseTo(130);
        expect(anchor(svg, text, 100, 30).x).toBeCloseTo(150);
        expect(anchor(svg, text, 100, 30).y).toBeCloseTo(35);
        const actions = canvasElement.querySelectorAll(
            '.vue-ui-pen-and-paper-action',
        );
        await fireEvent.click(actions[3]); // undo drag
        let group = svg.querySelector('[data-annotation-group]');
        expect(anchor(svg, group.querySelector('line'), 80, 50).x).toBeCloseTo(
            120,
        );
        await fireEvent.click(actions[3]); // undo grouping, preserving pre-group anchors
        expect(svg.querySelector('[data-annotation-group]')).toBeNull();
        expect(
            anchor(svg, svg.querySelector('text.vue-data-ui-doodle'), 100, 30)
                .x,
        ).toBeCloseTo(160);
        await fireEvent.click(actions[4]); // redo grouping in the zoomed viewport
        group = svg.querySelector('[data-annotation-group]');
        expect(anchor(svg, group.querySelector('text'), 100, 30).x).toBeCloseTo(
            140,
        );
        await fireEvent.click(
            canvasElement.querySelector('[data-test="reset"]'),
        );
        group = svg.querySelector('[data-annotation-group]');
        expect(anchor(svg, group.querySelector('text'), 100, 30).x).toBeCloseTo(
            100,
        );
        // Ungrouping is itself undoable.
        eventAt(svg, 'mousedown', 60, 60, group.querySelector('line'));
        eventAt(svg, 'mouseup', 60, 60, group.querySelector('line'));
        await fireEvent.click(
            canvasElement.querySelector('[data-cy="pen-and-paper-ungroup"]'),
        );
        expect(svg.querySelector('[data-annotation-group]')).toBeNull();
        await fireEvent.click(actions[3]);
        expect(svg.querySelector('[data-annotation-group]')).toBeTruthy();
    },
};

export const GroupControlsAreConditionalAndDoNotAddHeight = {
    args: { followZoom: true },
    play: async ({ canvasElement }) => {
        await drawArrow(canvasElement);
        await drawArrow(canvasElement, 80);
        await waitFor(() =>
            expect(
                canvasElement.querySelector('.vue-data-ui-mask'),
            ).toBeTruthy(),
        );
        const menu = canvasElement.querySelector(
            '.vue-ui-pen-and-paper-actions',
        );
        const height = menu.getBoundingClientRect().height;
        const toggle = canvasElement.querySelector(
            '[data-cy="pen-and-paper-select-multiple"]',
        );
        const beforeIcon = toggle.querySelector('svg').innerHTML;
        expect(toggle.getAttribute('aria-label')).toBe(
            'Select multiple annotations',
        );
        await fireEvent.click(toggle);
        expect(toggle.getAttribute('aria-label')).toBe('Exit selection mode');
        expect(toggle.getAttribute('aria-pressed')).toBe('true');
        expect(toggle.querySelector('svg').innerHTML).not.toBe(beforeIcon);
        await fireEvent.click(toggle);
        expect(toggle.getAttribute('aria-label')).toBe(
            'Select multiple annotations',
        );
        expect(toggle.querySelector('svg').innerHTML).toBe(beforeIcon);
        const groupControls = canvasElement.querySelector(
            '.vue-ui-pen-and-paper-group-actions',
        );
        const menuRect = menu.getBoundingClientRect();
        const groupRect = groupControls.getBoundingClientRect();
        expect(groupRect.left).toBeGreaterThanOrEqual(menuRect.left);
        expect(groupRect.right).toBeLessThanOrEqual(menuRect.right);
        expect(groupRect.top).toBeCloseTo(menuRect.top);
        const expectSliderFits = () => {
            const slider = menu
                .querySelector('.vertical-range')
                .getBoundingClientRect();
            expect(slider.left).toBeCloseTo(groupRect.left);
            expect(slider.right).toBeCloseTo(groupRect.right);
            expect(slider.top).toBeGreaterThanOrEqual(groupRect.bottom + 4);
            expect(slider.bottom).toBeCloseTo(menuRect.bottom);
            expect(slider.height).toBeGreaterThan(0);
        };
        expectSliderFits();
        await fireEvent.click(
            canvasElement.querySelector('[data-test="follow"]'),
        );
        expect(
            canvasElement.querySelector('.vue-ui-pen-and-paper-group-actions'),
        ).toBeTruthy();
        await fireEvent.click(
            canvasElement.querySelector(
                '[data-cy="pen-and-paper-toggle-text"]',
            ),
        );
        expect(
            menu.querySelector('[data-cy="pen-and-paper-font-size"]'),
        ).toBeTruthy();
        expectSliderFits();
        await fireEvent.click(
            canvasElement.querySelector('[data-test="groups"]'),
        );
        expect(
            canvasElement.querySelector('.vue-ui-pen-and-paper-group-actions'),
        ).toBeNull();
        expect(menu.getBoundingClientRect().height).toBe(height);
        await fireEvent.click(
            canvasElement.querySelector('[data-test="groups"]'),
        );
        expect(
            canvasElement.querySelector('.vue-ui-pen-and-paper-group-actions'),
        ).toBeTruthy();
        expect(menu.getBoundingClientRect().height).toBe(height);
    },
};

export const XyForwardsGroupButtonSlots = {
    render: XyZoomIntegration.render,
    args: { customGroupSlots: true },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector('.vue-data-ui-doodles'),
            ).toBeTruthy(),
        );
        await fireEvent.click(
            canvasElement.querySelector('[data-test="annotate"]'),
        );
        const select = canvasElement.querySelector(
            '[data-test="custom-select"]',
        );
        expect(select.textContent).toBe('Select');
        expect(select.closest('button').disabled).toBe(true);
        const svg = canvasElement.querySelector('[data-cy="xy-svg"]');
        const clip = svg.querySelector('clipPath[id^="annotation-clip-"] rect');
        const x =
            Number(clip.getAttribute('x')) +
            Number(clip.getAttribute('width')) / 2;
        const y =
            Number(clip.getAttribute('y')) +
            Number(clip.getAttribute('height')) / 2;
        eventAt(svg, 'mousedown', x - 20, y + 20);
        eventAt(svg, 'mousemove', x, y);
        eventAt(svg, 'mouseup', x, y);
        await waitFor(() =>
            expect(select.closest('button').disabled).toBe(true),
        );
        eventAt(svg, 'mousedown', x + 40, y);
        eventAt(svg, 'mousemove', x + 60, y - 20);
        eventAt(svg, 'mouseup', x + 60, y - 20);

        await waitFor(() =>
            expect(select.closest('button').disabled).toBe(false),
        );

        expect(
            canvasElement
                .querySelector('[data-test="custom-group"]')
                .getAttribute('data-disabled'),
        ).toBe('true');
        expect(
            canvasElement
                .querySelector('[data-test="custom-ungroup"]')
                .getAttribute('data-disabled'),
        ).toBe('true');
        await fireEvent.click(select);
        expect(select.textContent).toBe('Finish');
        await fireEvent.click(select);
        expect(select.textContent).toBe('Select');
        // Custom content must not replace the button's accessible name or events.
        expect(select.closest('button').getAttribute('aria-pressed')).toBe(
            'false',
        );
        expect(select.closest('button').getAttribute('aria-label')).toBe(
            'Select multiple annotations',
        );
    },
};

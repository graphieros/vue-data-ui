import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { describe, it, expect } from 'vitest';
import PenAndPaper from '../src/atoms/PenAndPaper.vue';
import ColorPicker from '../src/atoms/ColorPicker.vue';
import { dataLabel } from '../src/lib';
import { analyzeXy, buildXyAnalysisAnnotations } from '../src/utils/xyAnalysis';

const messages = {
    locale: 'en',
    series: 'Series',
    visualMinimum: '{series}: min {value}',
    visualMaximum: '{series}: max {value}',
};
const area = { left: 0, top: 0, width: 400, bottom: 300 };

describe('analysis annotation projection', () => {
    it('uses source identity, handles ties, and skips sampled or clipped extrema', () => {
        const results = analyzeXy([{ name: 'A', series: [1, 100, 100, 3] }]);
        const rendered = [
            {
                id: 'uniqueId_0',
                sourceIndices: [0, 2, 3],
                analysisSliceStart: 0,
                plots: [
                    { x: 10, y: 200, value: 1 },
                    { x: 200, y: 20, value: 100 },
                    { x: 300, y: 180, value: 3 },
                ],
            },
        ];
        const annotations = buildXyAnalysisAnnotations(
            results,
            rendered,
            area,
            messages,
        );
        expect(annotations.map((a) => a.x)).toEqual([10, 200]);
        expect(annotations[1].label).toBe('A: max 100');
        rendered[0].sourceIndices = [0, 3];
        rendered[0].plots.splice(1, 1);
        expect(
            buildXyAnalysisAnnotations(results, rendered, area, messages),
        ).toHaveLength(1);
        rendered[0].plots[0].x = -10;
        expect(
            buildXyAnalysisAnnotations(results, rendered, area, messages),
        ).toEqual([]);
    });
    it('keeps exact-scale extrema on plot boundaries despite floating-point roundoff', () => {
        const bounds = { left: 50, top: 46.4, width: 500, bottom: 522.5 };
        const maximumY = bounds.bottom - (bounds.bottom - bounds.top);
        expect(maximumY).toBeLessThan(bounds.top);
        const results = analyzeXy([
            { name: 'Arena', series: [-123456.78, null, 987654.32] },
        ]);
        const rendered = [
            {
                id: 'uniqueId_0',
                sourceIndices: [0, 1, 2],
                plots: [
                    { x: bounds.left, y: bounds.bottom, value: -123456.78 },
                    { x: 300, y: null, value: null },
                    {
                        x: bounds.left + bounds.width + 1e-12,
                        y: maximumY,
                        value: 987654.32,
                    },
                ],
            },
        ];
        const annotations = buildXyAnalysisAnnotations(
            results,
            rendered,
            bounds,
            messages,
        );
        expect(annotations.map((item) => item.id)).toEqual([
            'series-0-minimum',
            'series-0-maximum',
        ]);
        expect(annotations[1].y).toBe(bounds.top);
        expect(annotations[1].x).toBe(bounds.left + bounds.width);
        rendered[0].plots[2].y = bounds.top - 1;
        expect(
            buildXyAnalysisAnnotations(results, rendered, bounds, messages),
        ).toHaveLength(1);
    });

    it('resolves continuous source indices and deduplicates constant series', () => {
        const results = analyzeXy(
            [
                {
                    type: 'plot',
                    series: [
                        { x: 10, y: 2 },
                        { x: 50, y: 2 },
                    ],
                },
            ],
            new Set(),
            true,
        );
        const rendered = [
            {
                id: 'uniqueId_0',
                series: [{ index: 1 }],
                plots: [{ x: 200, y: 100, value: 2 }],
            },
        ];
        expect(
            buildXyAnalysisAnnotations(results, rendered, area, messages, true),
        ).toHaveLength(1);
    });
});

it('injects safe SVG groups, preserves manual drawings, and supports replacement undo/redo', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    document.body.appendChild(svg);
    const wrapper = mount(PenAndPaper, {
        props: { svgRef: svg, active: true },
        slots: {
            'annotator-action-undo': '<span data-test="undo" />',
            'annotator-action-redo': '<span data-test="redo" />',
        },
    });
    try {
        await nextTick();
        const root = svg.querySelector('.vue-data-ui-doodles');
        const manual = document.createElementNS(svg.namespaceURI, 'line');
        manual.setAttribute('class', 'vue-data-ui-doodle');
        manual.setAttribute('data-manual', '');
        root.appendChild(manual);
        wrapper.findComponent(ColorPicker).vm.$emit('update:value', '#ff00aa');
        await nextTick();
        const descriptor = {
            color: '#00ff00',
            id: 'max',
            x: 100,
            y: 100,
            labelX: 120,
            labelY: 70,
            label: '<script>literal text</script>',
        };
        expect(wrapper.vm.replaceGeneratedAnnotations([descriptor])).toBe(true);
        expect(root.querySelector('script')).toBeNull();
        expect(
            root.querySelector('line[marker-end]').getAttribute('stroke'),
        ).toBe('#ff00aa');
        expect(root.querySelector('text').getAttribute('fill')).toBe('#ff00aa');
        const markerId = root
            .querySelector('line[marker-end]')
            .getAttribute('marker-end')
            .slice(5, -1);
        expect(
            svg.querySelector(`[id="${markerId}"] path`).getAttribute('fill'),
        ).toBe('#ff00aa');
        expect(root.querySelector('text').textContent).toBe(descriptor.label);
        expect(root.querySelector('line[marker-end]')).toBeTruthy();
        expect(root.querySelector('[data-manual]')).toBe(manual);
        wrapper.vm.replaceGeneratedAnnotations([
            { ...descriptor, label: 'New label' },
        ]);
        expect(
            root.querySelectorAll('g[data-analysis-generated]'),
        ).toHaveLength(1);
        expect(root.querySelector('text').textContent).toBe('New label');
        await nextTick();
        wrapper.find('[data-test="undo"]').element.closest('button').click();
        await nextTick();
        expect(root.querySelector('text').textContent).toBe(descriptor.label);
        expect(root.querySelector('[data-manual]')).toBeTruthy();
        wrapper.find('[data-test="redo"]').element.closest('button').click();
        await nextTick();
        expect(root.querySelector('text').textContent).toBe('New label');
        wrapper.vm.replaceGeneratedAnnotations([]);
        expect(root.querySelector('[data-analysis-generated]')).toBeNull();
        expect(root.querySelector('[data-manual]')).toBeTruthy();
    } finally {
        wrapper.unmount();
        svg.remove();
    }
});

it('anchors labels behind the arrow tail for leftward, rightward and vertical leaders', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const wrapper = mount(PenAndPaper, { props: { svgRef: svg } });
    try {
        await nextTick();
        wrapper.vm.replaceGeneratedAnnotations([
            {
                id: 'right-edge',
                x: 390,
                y: 20,
                labelX: 362,
                labelY: 50,
                label: 'Maximum',
            },
            {
                id: 'left-edge',
                x: 10,
                y: 280,
                labelX: 38,
                labelY: 250,
                label: 'Minimum',
            },
            {
                id: 'vertical',
                x: 200,
                y: 100,
                labelX: 200,
                labelY: 150,
                label: 'Vertical',
            },
        ]);
        const groups = svg.querySelectorAll('g[data-analysis-generated]');
        const rightText = groups[0].querySelector('text');
        expect(rightText.getAttribute('text-anchor')).toBe('end');
        expect(Number(rightText.getAttribute('x'))).toBeLessThan(362);
        const leftText = groups[1].querySelector('text');
        expect(leftText.getAttribute('text-anchor')).toBe('start');
        expect(Number(leftText.getAttribute('x'))).toBeGreaterThan(38);
        expect(
            groups[2].querySelector('text').getAttribute('text-anchor'),
        ).toBe('middle');
        expect(
            Number(groups[2].querySelector('text').getAttribute('y')),
        ).toBeGreaterThan(150);
        expect(
            groups[2].querySelector('text').getAttribute('dominant-baseline'),
        ).toBe('hanging');
        for (const group of Array.from(groups).slice(0, 2)) {
            const line = group.querySelector('line');
            const text = group.querySelector('text');
            expect(line.getAttribute('y1')).toBe(text.getAttribute('y'));
            expect(text.getAttribute('dominant-baseline')).toBe('middle');
        }
    } finally {
        wrapper.unmount();
    }
});

it('keeps extrema leaders short and directed inward at chart edges', () => {
    const results = analyzeXy([{ name: 'A', series: [1, 100] }]);
    const rendered = [
        {
            id: 'uniqueId_0',
            sourceIndices: [0, 1],
            plots: [
                { x: 0, y: 300, value: 1 },
                { x: 400, y: 0, value: 100 },
            ],
        },
    ];
    const [minimum, maximum] = buildXyAnalysisAnnotations(
        results,
        rendered,
        area,
        messages,
    );
    expect(minimum.labelX).toBe(28);
    expect(minimum.labelY).toBe(270);
    expect(maximum.labelX).toBe(372);
    expect(maximum.labelY).toBe(30);
});

it('formats annotation values using each chart series label rounding', () => {
    const dataset = ['line', 'bar', 'plot'].map((type) => ({
        type,
        name: type,
        series: [1.23456, 9.87654],
    }));
    const results = analyzeXy(dataset);
    const rendered = dataset.map((series, index) => ({
        ...series,
        id: `uniqueId_${index}`,
        sourceIndices: [0, 1],
        plots: [
            { x: 50, y: 200, value: 1.23456 },
            { x: 300, y: 20, value: 9.87654 },
        ],
    }));
    const rounding = { line: 0, bar: 2, plot: 3 };
    const annotations = buildXyAnalysisAnnotations(
        results,
        rendered,
        area,
        messages,
        false,
        (value, series) =>
            dataLabel({
                v: value,
                r: rounding[series.type],
                locale: messages.locale,
            }),
    );
    expect(annotations.map((item) => item.label)).toEqual([
        'line: min 1',
        'line: max 10',
        'bar: min 1.23',
        'bar: max 9.88',
        'plot: min 1.235',
        'plot: max 9.877',
    ]);
});

it('inserts reference lines, rings and gap brackets as editable grouped SVG geometry', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const wrapper = mount(PenAndPaper, {
        props: { svgRef: svg, color: '#c02b35' },
    });
    try {
        await nextTick();
        const base = {
            x: 100,
            y: 100,
            labelX: 128,
            labelY: 130,
            label: 'Insight',
        };
        wrapper.vm.replaceGeneratedAnnotations([
            {
                ...base,
                id: 'reference',
                geometry: {
                    kind: 'line',
                    fromX: 10,
                    fromY: 100,
                    x: 300,
                    y: 100,
                    dashed: true,
                },
            },
            {
                ...base,
                id: 'candidate',
                geometry: { kind: 'circle', x: 100, y: 100 },
            },
            {
                ...base,
                id: 'gap',
                geometry: {
                    kind: 'bracket',
                    fromX: 100,
                    fromY: 50,
                    x: 100,
                    y: 200,
                },
            },
        ]);
        const groups = svg.querySelectorAll('g[data-analysis-generated]');
        expect(groups).toHaveLength(3);
        expect(groups[0].querySelector('line[stroke-dasharray]')).toBeTruthy();
        expect(groups[1].querySelector('circle').getAttribute('fill')).toBe(
            'none',
        );
        expect(groups[1].querySelector('circle').getAttribute('stroke')).toBe(
            '#c02b35',
        );
        expect(groups[2].querySelectorAll('line')).toHaveLength(4); // leader plus bracket and two caps
        for (const group of groups) {
            expect(group.hasAttribute('data-annotation-group')).toBe(true);
            expect(
                Array.from(group.children)
                    .filter((child) => child.tagName.toLowerCase() !== 'filter')
                    .every((child) =>
                        child.classList.contains('vue-data-ui-doodle'),
                    ),
            ).toBe(true);
        }
    } finally {
        wrapper.unmount();
    }
});

it('labels a change connector directly without a second leader and keeps text upright', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const wrapper = mount(PenAndPaper, { props: { svgRef: svg } });
    try {
        await nextTick();
        wrapper.vm.replaceGeneratedAnnotations([
            {
                id: 'change',
                x: 300,
                y: 100,
                labelX: 272,
                labelY: 130,
                label: 'Net change',
                geometry: {
                    kind: 'line',
                    fromX: 20,
                    fromY: 200,
                    x: 300,
                    y: 100,
                    arrow: true,
                },
            },
            {
                id: 'reverse-change',
                x: 20,
                y: 200,
                labelX: 48,
                labelY: 170,
                label: 'Reverse change',
                geometry: {
                    kind: 'line',
                    fromX: 300,
                    fromY: 100,
                    x: 20,
                    y: 200,
                    arrow: true,
                },
            },
        ]);
        for (const group of svg.querySelectorAll(
            'g[data-analysis-generated]',
        )) {
            expect(group.querySelectorAll('line')).toHaveLength(1);
            expect(group.querySelector('line').hasAttribute('marker-end')).toBe(
                true,
            );
            const text = group.querySelector('text');
            expect(text.getAttribute('text-anchor')).toBe('middle');
            const angle = Number(
                text.getAttribute('transform').match(/rotate\(([^ ]+)/)[1],
            );
            expect(angle).toBeGreaterThanOrEqual(-90);
            expect(angle).toBeLessThanOrEqual(90);
            expect(Number(text.getAttribute('x'))).toBeGreaterThan(140);
            expect(Number(text.getAttribute('x'))).toBeLessThan(180);
        }
    } finally {
        wrapper.unmount();
    }
});

it('previews without history spam, rolls back on cancel, and commits Apply as one undo step', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const wrapper = mount(PenAndPaper, {
        props: { svgRef: svg, active: true },
        slots: {
            'annotator-action-undo': '<span data-test="undo" />',
            'annotator-action-redo': '<span data-test="redo" />',
        },
    });
    const descriptor = {
        x: 100,
        y: 100,
        labelX: 128,
        labelY: 130,
        label: 'Saved',
    };
    const undo = async () => {
        await wrapper.vm.$nextTick();
        wrapper.find('[data-test="undo"]').element.closest('button').click();
        await wrapper.vm.$nextTick();
    };
    const redo = async () => {
        await wrapper.vm.$nextTick();
        wrapper.find('[data-test="redo"]').element.closest('button').click();
        await wrapper.vm.$nextTick();
    };
    try {
        await wrapper.vm.$nextTick();
        wrapper.vm.replaceGeneratedAnnotations([descriptor]);
        expect(wrapper.vm.beginGeneratedPreview()).toBe(true);
        wrapper.vm.replaceGeneratedAnnotations([
            { ...descriptor, label: 'Preview one' },
        ]);
        wrapper.vm.replaceGeneratedAnnotations([
            { ...descriptor, label: 'Preview two' },
        ]);
        expect(svg.querySelector('text').textContent).toBe('Preview two');
        wrapper.vm.finishGeneratedPreview(false);
        expect(svg.querySelector('text').textContent).toBe('Saved');
        await undo();
        expect(svg.querySelector('text')).toBeNull();
        // Cancelling another preview preserves the existing redo entry.
        wrapper.vm.beginGeneratedPreview();
        wrapper.vm.replaceGeneratedAnnotations([
            { ...descriptor, label: 'Cancelled' },
        ]);
        wrapper.vm.finishGeneratedPreview(false);
        await redo();
        expect(svg.querySelector('text').textContent).toBe('Saved');
        wrapper.vm.beginGeneratedPreview();
        wrapper.vm.replaceGeneratedAnnotations([
            { ...descriptor, label: 'Draft' },
        ]);
        wrapper.vm.replaceGeneratedAnnotations([
            { ...descriptor, label: 'Applied' },
        ]);
        wrapper.vm.finishGeneratedPreview(true);
        expect(svg.querySelector('text').textContent).toBe('Applied');
        await undo();
        expect(svg.querySelector('text').textContent).toBe('Saved');
        await redo();
        expect(svg.querySelector('text').textContent).toBe('Applied');
    } finally {
        wrapper.unmount();
    }
});

it('uses supplied analysis appearance without changing PenAndPaper settings until saved', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const wrapper = mount(PenAndPaper, {
        props: { svgRef: svg, color: '#123456' },
    });
    try {
        await nextTick();
        const original = wrapper.vm.getAnalysisAppearance();
        wrapper.vm.beginGeneratedPreview();
        wrapper.vm.replaceGeneratedAnnotations(
            [{ x: 100, y: 100, labelX: 128, labelY: 130, label: 'Preview' }],
            { color: '#abcdef', fontSize: 24, strokeWidth: 3.5 },
        );
        expect(svg.querySelector('text').getAttribute('font-size')).toBe('24');
        expect(svg.querySelector('text').getAttribute('fill')).toBe('#abcdef');
        expect(svg.querySelector('line').getAttribute('stroke-width')).toBe(
            '3.5',
        );
        expect(wrapper.vm.getAnalysisAppearance()).toEqual(original);
        wrapper.vm.finishGeneratedPreview(false);
        expect(wrapper.vm.getAnalysisAppearance()).toEqual(original);
        wrapper.vm.setAnalysisAppearance({
            color: '#abcdef',
            fontSize: 24,
            strokeWidth: 3.5,
        });
        expect(wrapper.vm.getAnalysisAppearance()).toEqual({
            color: '#abcdef',
            fontSize: 24,
            strokeWidth: 3.5,
        });
    } finally {
        wrapper.unmount();
    }
});

it('outlines complete analysis groups with the chart background and updates the outline color', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const wrapper = mount(PenAndPaper, {
        props: { svgRef: svg, backgroundColor: '#f0f4f8' },
    });
    try {
        await nextTick();
        wrapper.vm.replaceGeneratedAnnotations([
            {
                x: 100,
                y: 100,
                labelX: 128,
                labelY: 130,
                label: 'Outlined text',
            },
        ]);
        const group = svg.querySelector('g[data-analysis-generated]');
        const filter = group.querySelector('filter');
        expect(group.getAttribute('filter')).toBe(`url(#${filter.id})`);
        expect(
            filter.querySelector('feFlood').getAttribute('flood-color'),
        ).toBe('#f0f4f8');
        expect(
            Number(
                filter
                    .querySelector('feGaussianBlur')
                    .getAttribute('stdDeviation'),
            ),
        ).toBeGreaterThan(0);
        expect(filter.querySelector('feMorphology')).toBeNull();
        expect(
            filter.querySelector('feComponentTransfer').getAttribute('result'),
        ).toBe('outline');
        expect(filter.querySelector('feFuncA').getAttribute('slope')).toBe(
            '20',
        );
        expect(
            Array.from(filter.querySelectorAll('feMergeNode')).map((node) =>
                node.getAttribute('in'),
            ),
        ).toEqual(['colored-outline', 'SourceGraphic']);
        expect(group.querySelector('line[marker-end]')).toBeTruthy();
        expect(group.querySelector('text')).toBeTruthy();
        await wrapper.setProps({ backgroundColor: '#111111' });
        expect(
            filter.querySelector('feFlood').getAttribute('flood-color'),
        ).toBe('#111111');
        await wrapper.setProps({ outlineColor: '#ff8800' });
        expect(
            filter.querySelector('feFlood').getAttribute('flood-color'),
        ).toBe('#ff8800');
        await wrapper.setProps({ backgroundColor: '#222222' });
        expect(
            filter.querySelector('feFlood').getAttribute('flood-color'),
        ).toBe('#ff8800');
        await wrapper.setProps({ outlineColor: null });
        expect(
            filter.querySelector('feFlood').getAttribute('flood-color'),
        ).toBe('#222222');
        await wrapper.setProps({ useOutline: false });
        expect(group.hasAttribute('filter')).toBe(false);
        await wrapper.setProps({ useOutline: true, outlineThickness: 3 });
        expect(group.getAttribute('filter')).toBe(`url(#${filter.id})`);
        expect(
            Number(
                filter
                    .querySelector('feGaussianBlur')
                    .getAttribute('stdDeviation'),
            ),
        ).toBe(2.25);
        await wrapper.setProps({ outlineThickness: 0 });
        expect(group.hasAttribute('filter')).toBe(false);
    } finally {
        wrapper.unmount();
    }
});

it('allows manual drawing after applying analysis groups containing SVG filters', async () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const host = document.createElement('div');
    host.appendChild(svg);
    document.body.appendChild(host);
    const matrix = () => ({ a: 1, b: 0, inverse: () => ({}) });
    svg.getScreenCTM = matrix;
    svg.createSVGPoint = () => ({
        x: 0,
        y: 0,
        matrixTransform() {
            return { x: this.x, y: this.y };
        },
    });
    const wrapper = mount(PenAndPaper, {
        props: { svgRef: svg, active: false },
    });
    try {
        await nextTick();
        expect(wrapper.vm.beginGeneratedPreview()).toBe(true);
        wrapper.vm.replaceGeneratedAnnotations([
            { x: 100, y: 100, labelX: 150, labelY: 160, label: 'Maximum' },
        ]);
        wrapper.vm.finishGeneratedPreview(true);
        wrapper.vm.setAnalysisAppearance({
            color: '#ff0000',
            fontSize: 12,
            strokeWidth: 2,
        });
        await wrapper.setProps({ active: true });
        await nextTick();
        // Polyfill graphics transforms only: SVGFilterElement has no getScreenCTM.
        for (const shape of svg.querySelectorAll(
            'g,line,text,circle,path,rect',
        ))
            shape.getScreenCTM = matrix;
        expect(svg.querySelector('filter')).not.toBeNull();
        for (const [type, x, y] of [
            ['mousedown', 20, 30],
            ['mousemove', 60, 60],
            ['mouseup', 60, 60],
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
        const line = svg.querySelector(
            '.vue-data-ui-doodles > line.vue-data-ui-doodle',
        );
        expect(line).not.toBeNull();
        expect(line.getAttribute('x1')).toBe('20');
        expect(line.getAttribute('x2')).toBe('60');
        expect(line.getAttribute('stroke')).toBe('#ff0000');
        const outlineId = line.getAttribute('data-annotation-outline');
        expect(line.getAttribute('filter')).toBe(`url(#${outlineId})`);
        const filter = svg.querySelector(`[id="${outlineId}"]`);
        expect(filter.parentElement.tagName.toLowerCase()).toBe('defs');
        expect(filter.getAttribute('filterUnits')).toBe('userSpaceOnUse');
        expect(
            filter.querySelector('feFlood').getAttribute('flood-color'),
        ).toBe('#FFFFFF');
        await wrapper.setProps({ backgroundColor: '#abcdef' });
        expect(
            filter.querySelector('feFlood').getAttribute('flood-color'),
        ).toBe('#abcdef');
        await wrapper.setProps({ useOutline: false });
        expect(line.hasAttribute('filter')).toBe(false);
        await wrapper.setProps({ useOutline: true, outlineThickness: 2 });
        expect(line.getAttribute('filter')).toBe(`url(#${outlineId})`);
        expect(
            Number(
                filter
                    .querySelector('feGaussianBlur')
                    .getAttribute('stdDeviation'),
            ),
        ).toBe(1.5);
        await wrapper.setProps({ outlineColor: '#123456' });
        expect(
            filter.querySelector('feFlood').getAttribute('flood-color'),
        ).toBe('#123456');
        await wrapper.setProps({ outlineColor: null });
        expect(
            filter.querySelector('feFlood').getAttribute('flood-color'),
        ).toBe('#abcdef');
        expect(svg.querySelector('[data-analysis-generated]')).not.toBeNull();
    } finally {
        wrapper.unmount();
        host.remove();
    }
});

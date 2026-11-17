import { expect, waitFor, fn } from 'storybook/test';
import { scenarioRender, runScenario } from '../support/scenario.js';
import VueUiWordCloud from '../../src/components/vue-ui-word-cloud.vue';
import { positionWordsAsync } from '../../src/wordcloud';

const names =
    'Visualization charts canvas geometry typography packing words Vue dashboard data analysis browser performance components rendering library accessibility colors pixels masks spacing layout compact testing interactive development design science histogram scatter donut waterfall legend tooltip labels axis scales'.split(
        ' ',
    );
const dataset = names.map((name, i) => ({
    name,
    value: names.length - i,
    id: `word-${i}`,
}));

// Rasterize each actual SVG word separately, including its outline and final
// transform. Shared nontransparent pixels expose real rendering overlaps that
// rectangle-only or mocked-canvas tests cannot detect.
async function assertPixels(groups, width, height, fontFamily) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const occupied = new Uint8Array(width * height);
    let overlaps = 0;
    for (const group of groups) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" font-family="${fontFamily}" text-rendering="optimizeLegibility"><g transform="translate(${width / 2},${height / 2})">${group.outerHTML}</g></svg>`;
        const img = new Image();
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
        await img.decode();
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0);
        const pixels = ctx.getImageData(0, 0, width, height).data;
        for (let i = 0; i < occupied.length; i += 1) {
            if (pixels[i * 4 + 3] < 8) continue;
            if (occupied[i]) overlaps += 1;
            occupied[i] = 1;
        }
    }
    expect(overlaps, 'overlapping SVG ink pixels, including strokes').toBe(0);
}

function createCases({ mountSubject }) {
    return {
        hooks: [],
        cases: {
            Packing: async () => {
                for (const fixture of [
                    {
                        width: 640,
                        height: 360,
                        quality: 'fast',
                        fontFamily: 'Arial',
                        bold: true,
                        angles: [0, -90],
                        dataset,
                    },
                    {
                        width: 320,
                        height: 600,
                        quality: 'balanced',
                        fontFamily: 'Georgia',
                        bold: false,
                        angles: [0],
                        dataset,
                    },
                    {
                        width: 580,
                        height: 320,
                        quality: 'precise',
                        fontFamily: 'monospace',
                        bold: true,
                        angles: [0, -90, -45, 45],
                        dataset: [
                            'مرحبا',
                            'العربية',
                            'gyp',
                            'Éléphant',
                            'Ångström',
                            '日本語',
                            'office',
                            'ligatures',
                            '数据',
                            'packing',
                            'words',
                            'Vue',
                        ].map((name, i) => ({ name, value: 12 - i })),
                    },
                    ...[
                        [-45, 0, 45, 90],
                        [-20, 0, 20],
                    ].map((angles) => ({
                        width: 640,
                        height: 420,
                        quality: 'balanced',
                        fontFamily: 'Arial',
                        bold: true,
                        angles,
                        dataset: dataset.slice(0, 20),
                    })),
                ]) {
                    const { width, height, quality, fontFamily, bold, angles } =
                        fixture;
                    const { wrapper } = await mountSubject(VueUiWordCloud, {
                        props: {
                            dataset: fixture.dataset,
                            config: {
                                quality,
                                strictPixelPadding: true,
                                userOptions: { show: false },
                                style: {
                                    fontFamily,
                                    chart: {
                                        width,
                                        height,
                                        words: {
                                            bold,
                                            angles,
                                            minFontSize: 12,
                                            maxFontSize: 60,
                                            proximity: 0,
                                            selectedStroke: '#000000',
                                        },
                                    },
                                },
                            },
                        },
                    });
                    await waitFor(
                        () =>
                            expect(wrapper.vm.$.setupState.cloudFinalized).toBe(
                                true,
                            ),
                        { timeout: 20000 },
                    );
                    const words = wrapper.vm.getData();
                    expect(words.length).toBeGreaterThan(0);
                    expect(words.length).toBeLessThanOrEqual(
                        fixture.dataset.length,
                    );
                    expect(words.every((word) => word.layoutScale === 1)).toBe(
                        true,
                    );
                    const minimumValue = Math.min(
                        ...fixture.dataset.map((word) => word.value),
                    );
                    const maximumValue = Math.max(
                        ...fixture.dataset.map((word) => word.value),
                    );
                    for (const word of words) {
                        const target =
                            minimumValue === maximumValue
                                ? 60
                                : Math.round(
                                      12 +
                                          ((word.value - minimumValue) /
                                              (maximumValue - minimumValue)) *
                                              48,
                                  );
                        expect(word.fontSize).toBe(target);
                    }
                    expect(
                        words.every((word) => angles.includes(word.angle)),
                    ).toBe(true);
                    if (angles.length > 1)
                        expect(
                            new Set(words.map((word) => word.angle)).size,
                        ).toBeGreaterThan(1);
                    const groups = wrapper.element.querySelectorAll(
                        '.vue-ui-word-cloud-word',
                    );
                    expect(groups).toHaveLength(words.length);
                    for (const group of groups) {
                        const box = group.getBBox();
                        const text = group.querySelector('text');
                        expect(box.width).toBeGreaterThan(0);
                        expect(text.getAttribute('dominant-baseline')).toBe(
                            'alphabetic',
                        );
                    }
                    await assertPixels(groups, width, height, fontFamily);
                }
            },
            LoadingTransition: async () => {
                const skeletonDataset = [{ name: 'placeholder', value: 1 }];
                const actual = [
                    { name: 'Actual', value: 3 },
                    { name: 'Dataset', value: 1 },
                ];
                const { wrapper } = await mountSubject(VueUiWordCloud, {
                    props: {
                        dataset: actual,
                        config: { loading: true, skeletonDataset },
                    },
                });
                await waitFor(() =>
                    expect(
                        wrapper.vm.getData().map((word) => word.name),
                    ).toEqual(['placeholder']),
                );
                await wrapper.setProps({
                    config: { loading: false, skeletonDataset },
                });
                await waitFor(() => {
                    expect(
                        wrapper.vm.getData().map((word) => word.name),
                    ).toEqual(['Actual', 'Dataset']);
                    expect(wrapper.vm.$.setupState.cloudFinalized).toBe(true);
                });
                const labels = [
                    ...wrapper.element.querySelectorAll(
                        '[data-cy="datapoint-word"]',
                    ),
                ].map((element) => element.getAttribute('aria-label'));
                expect(labels).toEqual(['Actual: 3', 'Dataset: 1']);
            },
            AnglesUpdate: async () => {
                const onClick = fn();
                const config = (angles) => ({
                    events: { datapointClick: onClick },
                    style: {
                        chart: {
                            width: 600,
                            height: 360,
                            words: { angles, maxFontSize: 40 },
                        },
                    },
                });
                const { wrapper } = await mountSubject(VueUiWordCloud, {
                    props: {
                        dataset: dataset.slice(0, 10),
                        config: config([0]),
                    },
                });
                await waitFor(() =>
                    expect(wrapper.vm.$.setupState.cloudFinalized).toBe(true),
                );
                expect(wrapper.vm.getData().every((w) => w.angle === 0)).toBe(
                    true,
                );
                await wrapper.setProps({ config: config([90]) });
                await waitFor(() =>
                    expect(wrapper.vm.$.setupState.cloudFinalized).toBe(true),
                );
                expect(wrapper.vm.getData()).toHaveLength(10);
                expect(wrapper.vm.getData().every((w) => w.angle === 90)).toBe(
                    true,
                );
                const target = wrapper.element.querySelector(
                    '[data-cy="datapoint-word"]',
                );
                target.dispatchEvent(
                    new MouseEvent('click', { bubbles: true }),
                );
                expect(onClick).toHaveBeenCalledTimes(1);
                expect(onClick.mock.calls[0][0].datapoint.angle).toBe(90);
                const svg = wrapper.element.querySelector('svg[tabindex="0"]');
                svg.focus();
                svg.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'ArrowRight',
                        bubbles: true,
                    }),
                );
                svg.dispatchEvent(
                    new KeyboardEvent('keydown', {
                        key: 'Enter',
                        bubbles: true,
                    }),
                );
                expect(onClick).toHaveBeenCalledTimes(2);
                expect(onClick.mock.calls[1][0].datapoint.angle).toBe(90);
            },
            Spacing: async () => {
                const svg = {
                    width: 400,
                    height: 220,
                    minFontSize: 30,
                    maxFontSize: 30,
                    style: { fontFamily: 'Arial' },
                };
                const words = [
                    { name: 'Typography', value: 1 },
                    { name: 'Typography', value: 1 },
                ];
                for (const quality of ['fast', 'balanced', 'precise']) {
                    const result = await positionWordsAsync({
                        words,
                        svg,
                        quality,
                        proximity: 12,
                    });
                    expect(result).toHaveLength(2);
                    expect(result.every((w) => w.rasterFontSize === 30)).toBe(
                        true,
                    );
                    // Validate glyph-to-glyph distance independently of collision masks.
                    const points = [];
                    for (const word of result) {
                        const canvas = document.createElement('canvas');
                        canvas.width = svg.width;
                        canvas.height = svg.height;
                        const ctx = canvas.getContext('2d');
                        ctx.translate(
                            svg.width / 2 + word.x,
                            svg.height / 2 + word.y,
                        );
                        ctx.scale(word.layoutScale, word.layoutScale);
                        ctx.font = `${word.rasterFontSize}px Arial`;
                        ctx.textAlign = 'left';
                        ctx.fillText(word.name, word.textX, word.textY);
                        const data = ctx.getImageData(
                            0,
                            0,
                            svg.width,
                            svg.height,
                        ).data;
                        const ink = [];
                        for (let i = 0; i < data.length; i += 4)
                            if (data[i + 3] > 8)
                                ink.push([
                                    (i / 4) % svg.width,
                                    Math.floor(i / 4 / svg.width),
                                ]);
                        points.push(ink);
                    }
                    let distance = Infinity;
                    for (const [x, y] of points[0])
                        for (const [u, v] of points[1]) {
                            if (
                                Math.abs(x - u) >= distance ||
                                Math.abs(y - v) >= distance
                            )
                                continue;
                            distance = Math.min(
                                distance,
                                Math.hypot(x - u, y - v),
                            );
                        }
                    expect(distance).toBeGreaterThanOrEqual(12);
                }
            },
        },
    };
}

export default {
    title: 'Charts/VueUiWordCloud/Packing',
    render: scenarioRender,
};
export const RealGlyphs = {
    play: (context) => runScenario(context, createCases, 'Packing'),
};
export const WordSpacing = {
    play: (context) => runScenario(context, createCases, 'Spacing'),
};

const demoConfig = (angles) => ({
    style: {
        fontFamily: 'Courier New',
        chart: {
            width: 640,
            height: 420,
            words: {
                angles,
                maxFontSize: 64,
                minFontSize: 12,
                proximity: 1,
                randomizeAngles: false,
                randomness: 0.2,
                seed: 42,
            },
        },
    },
});
const demoRender = (args) => ({
    components: { VueUiWordCloud },
    setup: () => ({ args }),
    template: '<VueUiWordCloud v-bind="args" />',
});
export const Mixed = {
    render: demoRender,
    args: { dataset, config: demoConfig([0, -90]) },
};
export const Level = {
    render: demoRender,
    args: { dataset, config: demoConfig([0]) },
};
export const FortyFiveDegreeSteps = {
    render: demoRender,
    args: { dataset, config: demoConfig([-45, 0, 45, 90]) },
};
export const Tilted = {
    render: demoRender,
    args: { dataset, config: demoConfig([-20, 0, 20]) },
};

export const RotationUpdates = {
    play: (context) => runScenario(context, createCases, 'AnglesUpdate'),
};

export const LoadingToRealData = {
    play: (context) => runScenario(context, createCases, 'LoadingTransition'),
};

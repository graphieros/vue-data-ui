import { computed, ref } from 'vue';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import VueUiDonut from '../../src/components/vue-ui-donut.vue';
import VueUiXy from '../../src/components/vue-ui-xy.vue';
import { useParentSize } from '../../src/useParentSize';

export default {
    title: 'Utilities/useParentSize',
};

function renderChart(Chart, dataset, nestedChart = false, growth = false) {
    return () => ({
        components: { Chart },
        setup() {
            const target = ref(null);
            const parentWidth = ref(600);
            const parentHeight = ref(400);
            const scale = ref(growth ? 1.1 : 1);
            const offsetWidth = ref(0);
            const offsetHeight = ref(0);
            const observe = ref(true);
            const customLimits = ref(!growth);
            const maxWidth = ref(growth ? 600 : window.innerWidth);
            const maxHeight = ref(growth ? 400 : window.innerHeight);
            const { width, height } = useParentSize(target, {
                scale,
                offsetWidth,
                offsetHeight,
                observe,
                maxWidth: () =>
                    customLimits.value ? maxWidth.value : undefined,
                maxHeight: () =>
                    customLimits.value ? maxHeight.value : undefined,
            });
            const config = computed(() => {
                const chart = {
                    width: width.value ?? 600,
                    height: height.value ?? 400,
                };
                return {
                    responsive: false,
                    autoSize: false,
                    useCssAnimation: false,
                    startAnimation: { show: false },
                    userOptions: { show: false },
                    ...(nestedChart ? { style: { chart } } : { chart }),
                };
            });
            return {
                target,
                growth,
                customLimits,
                parentWidth,
                parentHeight,
                scale,
                offsetWidth,
                offsetHeight,
                observe,
                maxWidth,
                maxHeight,
                width,
                height,
                config,
                dataset,
            };
        },
        template: `
            <section>
                <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px">
                    <label>Parent width <input type="number" v-model.number="parentWidth" min="200"></label>
                    <label>Parent height <input type="number" v-model.number="parentHeight" min="200"></label>
                    <label>Scale <input type="number" v-model.number="scale" min="0.1" step="0.1"></label>
                    <label>Width offset <input type="number" v-model.number="offsetWidth"></label>
                    <label>Height offset <input type="number" v-model.number="offsetHeight"></label>
                    <label v-if="growth"><input type="checkbox" v-model="customLimits"> Use custom limits</label>
                    <label>Maximum width <input type="number" v-model.number="maxWidth" min="0"></label>
                    <label>Maximum height <input type="number" v-model.number="maxHeight" min="0"></label>
                    <label><input type="checkbox" v-model="observe"> Observe resizing</label>
                </div>
                <output data-testid="dimensions">{{ width }} × {{ height }}</output>
                <p v-if="growth">The parent has intrinsic dimensions. Padding and scaling feed
                    growth back into the chart until it reaches the viewport or custom limits.</p>
                <div v-if="growth" style="overflow: auto; padding: 2px">
                    <div data-testid="growth-parent" style="display: inline-block; padding: 10px; outline: 1px dashed #888; vertical-align: top">
                        <div ref="target" :style="{ width: (width ?? 300) + 'px', height: (height ?? 200) + 'px' }">
                            <Chart :dataset="dataset" :config="config" />
                        </div>
                    </div>
                </div>
                <div v-else :style="{ width: parentWidth + 'px', height: parentHeight + 'px', outline: '1px dashed #888' }">
                    <div ref="target">
                        <Chart :dataset="dataset" :config="config" />
                    </div>
                </div>
            </section>
        `,
    });
}

function testChart(svgSelector) {
    return async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const setNumber = async (label, value) => {
            const input = canvas.getByRole('spinbutton', { name: label });
            await userEvent.clear(input);
            await userEvent.type(input, String(value));
            await userEvent.tab();
        };
        const checkDimensions = async (width, height) => {
            await waitFor(() => {
                expect(canvas.getByTestId('dimensions')).toHaveTextContent(
                    `${width} × ${height}`,
                );
                expect(
                    canvasElement.querySelector(svgSelector),
                ).toHaveAttribute('viewBox', `0 0 ${width} ${height}`);
            });
        };

        // The template ref starts empty and is measured automatically after mount.
        await checkDimensions(600, 400);
        await setNumber('Parent width', 800);
        await setNumber('Parent height', 500);
        await checkDimensions(800, 500);

        await setNumber('Width offset', -40);
        await setNumber('Height offset', 20);
        await setNumber('Scale', 0.5);
        await checkDimensions(380, 260);

        await userEvent.click(
            canvas.getByRole('checkbox', { name: 'Observe resizing' }),
        );
        await setNumber('Parent width', 700);
        await setNumber('Parent height', 600);
        // Let browser resize notifications run before asserting the frozen size.
        await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        await checkDimensions(380, 260);

        await userEvent.click(
            canvas.getByRole('checkbox', { name: 'Observe resizing' }),
        );
        await checkDimensions(330, 310);

        // Caps apply after scaling and offsets, and continue to bound resizing.
        await setNumber('Maximum width', 300);
        await setNumber('Maximum height', 240);
        await checkDimensions(300, 240);
        await setNumber('Parent width', 900);
        await setNumber('Parent height', 800);
        await checkDimensions(300, 240);
    };
}

export const WithVueUiDonut = {
    render: renderChart(
        VueUiDonut,
        [
            { name: 'Alpha', values: [30] },
            { name: 'Beta', values: [50] },
            { name: 'Gamma', values: [20] },
        ],
        true,
    ),
    play: testChart('[data-cy="donut-svg"]'),
};

export const WithVueUiXy = {
    render: renderChart(VueUiXy, [
        { name: 'Series', type: 'line', series: [12, 18, 14, 25, 21, 30] },
    ]),
    play: testChart('[data-cy="xy-svg"]'),
};

function testGrowthLimits(svgSelector) {
    return async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const checkLimits = async (width, height) => {
            await waitFor(
                () => {
                    expect(canvas.getByTestId('dimensions')).toHaveTextContent(
                        `${width} × ${height}`,
                    );
                    expect(
                        canvasElement.querySelector(svgSelector),
                    ).toHaveAttribute('viewBox', `0 0 ${width} ${height}`);
                    // The content-sized parent remains larger than the capped chart.
                    // Without limits, feeding this measurement back would keep growing.
                    const parent = canvas
                        .getByTestId('growth-parent')
                        .getBoundingClientRect();
                    expect(parent.width).toBe(width + 20);
                    expect(parent.height).toBe(height + 20);
                },
                { timeout: 5000 },
            );
            // Verify that the output stays settled across further browser frames.
            for (let frame = 0; frame < 4; frame++) {
                await new Promise((resolve) =>
                    requestAnimationFrame(() => requestAnimationFrame(resolve)),
                );
                expect(canvas.getByTestId('dimensions')).toHaveTextContent(
                    `${width} × ${height}`,
                );
            }
        };

        await checkLimits(window.innerWidth, window.innerHeight);
        await userEvent.click(
            canvas.getByRole('checkbox', { name: 'Use custom limits' }),
        );
        await checkLimits(600, 400);
        const maximum = canvas.getByRole('spinbutton', {
            name: 'Maximum width',
        });
        await userEvent.clear(maximum);
        await userEvent.type(maximum, '700');
        await userEvent.tab();
        await checkLimits(700, 400);
        await userEvent.click(
            canvas.getByRole('checkbox', { name: 'Use custom limits' }),
        );
        await checkLimits(window.innerWidth, window.innerHeight);
    };
}

export const GrowthLimitsWithVueUiDonut = {
    render: renderChart(
        VueUiDonut,
        [
            { name: 'Alpha', values: [30] },
            { name: 'Beta', values: [50] },
            { name: 'Gamma', values: [20] },
        ],
        true,
        true,
    ),
    play: testGrowthLimits('[data-cy="donut-svg"]'),
};

export const GrowthLimitsWithVueUiXy = {
    render: renderChart(
        VueUiXy,
        [{ name: 'Series', type: 'line', series: [12, 18, 14, 25, 21, 30] }],
        false,
        true,
    ),
    play: testGrowthLimits('[data-cy="xy-svg"]'),
};

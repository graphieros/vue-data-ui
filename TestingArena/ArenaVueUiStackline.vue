<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiStackline from "../src/components/vue-ui-stackline.vue";
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiStackline } from "vue-data-ui";
import { VueUiStackline as VueUiStacklineTreeshaken } from "vue-data-ui/vue-ui-stackline";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels, toggleStack } = useArena();
const { vue_ui_stackline: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const selectedX = ref(undefined);

function generateDayTimestamps(length) {
    const result = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < length; i += 1) {
        result.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000).getTime());
    }

    return result;
}

// const dataset = ref([
//     {
//         name: 'Series A',
//         series: [-5, -3, -2, -1, 0, 1, 2, 4, 5],
//     },
//     {
//         name: 'Series B',
//         series: [-5, -3, -2, -1, 0, 1, 2, 4, 5],
//     },
//     {
//         name: 'Series C',
//         series: [-5, -3, -2, -1, 0, 1, 2, 4, 5],
//     },
// ]);

// const dataset = ref([
//     {
//             name: '',
//             series: [3, 2, 1, 5, 13, 21, 8, 89, 34, 55],
//             color: '#8A8A8A'
//         },
//         {
//             name: '',
//             series: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
//             color: '#CACACA' 
//         }
// ])

// const dataset = ref([
//     {
//         name: "Series 1",
//         series: [10, 20, null, null, 20, 4, 5],
//         shape: 'square'
//     },
//     {
//         name: "Series 2",
//         series: [20, 40, 60, 20, 10],
//         shape: 'star'
//     },
//     {
//         name: "Series 3",
//         series: [20, 40, 60, 20, 10],
//     },
// ])

function makeDs(n) {
    const arr = [];
    for (let i = 0; i < n; i += 1) {
        if (i > 10 && i < 20) {
            // arr.push(null);
            arr.push(Math.random() * -20)
        } else {
            arr.push(Math.random() * 10 + i)
        }
    }
    return arr
}

const dataset = ref([
    {
        name: 'Series A',
        series: makeDs(24),
        shape: 'triangle'
    },
    {
        name: 'Series B',
        series: makeDs(24),
        shape: 'square'
    },
    {
        name: 'Series C',
        series: makeDs(24),
        shape: 'star'
    },
    {
        name: 'Series D',
        series: makeDs(24),
        shape: 'diamond',
        standalone: true
    },
    {
        name: 'Series E',
        series: makeDs(24),
        shape: 'pentagon',
        standalone: true,
    },
]);

const model = createModel([
    CHECKBOX("loading", { def: false }),
    CHECKBOX("debug", { def: false }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    SELECT("orientation", ["vertical", "horizontal"], { def: "vertical" }),
    CHECKBOX("responsive", { def: false }),
    SELECT("theme", ["", "zen", "hack", "concrete"], { def: "" }),
    CHECKBOX("useCssAnimation", { def: true }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.height", { def: 500, min: 200, max: 1000 }),
    NUMBER("style.chart.width", { def: 800, min: 200, max: 1000 }),
    NUMBER("style.chart.padding.top", { def: 12, min: 0, max: 100 }),
    NUMBER("style.chart.padding.right", { def: 24, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 12, min: 0, max: 100 }),
    NUMBER("style.chart.padding.left", { def: 12, min: 0, max: 100 }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),
    SELECT("style.chart.title.textAlign", ["left", "center", "right"], { def: "center" }),

    CHECKBOX("style.chart.legend.show", { def: true }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.legend.fontSize", { def: 14, min: 8, max: 42 }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),
    CHECKBOX('style.chart.legend.selectAllToggle.show', { def: true }),

    CHECKBOX("style.chart.zoom.show", { def: true }),
    RANGE('style.chart.zoom.maxWidth', { def: null, min: 100, max: 1000 }),
    COLOR("style.chart.zoom.color", { def: "#CCCCCC" }),
    COLOR("style.chart.zoom.highlightColor", { def: "#5A5A5A" }),
    NUMBER("style.chart.zoom.fontSize", { def: 14, min: 8, max: 42 }),
    NUMBER("style.chart.zoom.startIndex", { def: null, min: 0, max: 100 }),
    NUMBER("style.chart.zoom.endIndex", { def: null, min: 0, max: 100 }),
    CHECKBOX("style.chart.zoom.enableRangeHandles", { def: true }),
    CHECKBOX("style.chart.zoom.enableSelectionDrag", { def: true }),
    CHECKBOX("style.chart.zoom.focusOnDrag", { def: true }),
    NUMBER("style.chart.zoom.focusRangeRatio", { def: 0.2, min: 0.1, max: 0.9, step: 0.1 }),

    CHECKBOX("style.chart.zoom.preview.enable", { def: true }),
    COLOR("style.chart.zoom.preview.stroke", { def: "#1f77b4" }),
    COLOR("style.chart.zoom.preview.fill", { def: "#1f77b420" }),
    NUMBER("style.chart.zoom.preview.strokeDasharray", { def: 0, min: 0, max: 12 }),
    NUMBER("style.chart.zoom.preview.strokeWidth", { def: 2, min: 0, max: 12 }),

    CHECKBOX("style.chart.zoom.minimap.show", { def: true }),
    CHECKBOX("style.chart.zoom.minimap.smooth", { def: true }),
    COLOR("style.chart.zoom.minimap.selectedColor", { def: "#1f77b4" }),
    RANGE("style.chart.zoom.minimap.selectedColorOpacity", { def: 0.2, min: 0, max: 1, step: 0.01 }),
    COLOR("style.chart.zoom.minimap.lineColor", { def: "#1A1A1A" }),
    NUMBER("style.chart.zoom.minimap.selectionRadius", { def: 2, min: 0, max: 24 }),
    COLOR("style.chart.zoom.minimap.indicatorColor", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.zoom.minimap.verticalHandles", { def: false }),
    CHECKBOX("style.chart.zoom.minimap.compact", { def: true }),
    CHECKBOX("style.chart.zoom.minimap.merged", { def: false }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 8, max: 42 }),
    NUMBER("style.chart.tooltip.borderRadius", { def: 4, min: 0, max: 24 }),
    COLOR("style.chart.tooltip.borderColor", { def: "#E1E5E8" }),
    NUMBER("style.chart.tooltip.borderWidth", { def: 1, min: 0, max: 12 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 20, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 64 }),
    CHECKBOX("style.chart.tooltip.showValue", { def: true }),
    CHECKBOX("style.chart.tooltip.showPercentage", { def: true }),
    NUMBER("style.chart.tooltip.roundingValue", { def: 2, min: 0, max: 6 }),
    NUMBER("style.chart.tooltip.roundingPercentage", { def: 0, min: 0, max: 6 }),
    CHECKBOX("style.chart.tooltip.showTimeLabel", { def: true }),
    CHECKBOX("style.chart.tooltip.showTotal", { def: true }),
    TEXT("style.chart.tooltip.totalTranslation", { def: "Total" }),

    COLOR("style.chart.highlighter.color", { def: "#1A1A1A" }),
    RANGE("style.chart.highlighter.opacity", { def: 5, min: 0, max: 30 }),
    CHECKBOX("style.chart.highlighter.useLine", { def: false }),
    NUMBER("style.chart.highlighter.lineDasharray", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.highlighter.lineWidth", { def: 1, min: 1, max: 6 }),

    CHECKBOX("style.chart.lines.useArea", { def: true }),
    CHECKBOX("style.chart.lines.smooth", { def: true }),
    RANGE("style.chart.line.areaOpacity", { def: 0.5, min: 0, max: 1, step: 0.01 }),
    CHECKBOX("style.chart.lines.distributed", { def: false }),
    CHECKBOX("style.chart.lines.showDistributedPercentage", { def: false }),
    NUMBER("style.chart.lines.strokeWidth", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.chart.lines.gradient.show", { def: true }),
    RANGE("style.chart.lines.gradient.intensity", { def: 20, min: 0, max: 100 }),

    CHECKBOX("style.chart.lines.totalValues.show", { def: true }),
    NUMBER("style.chart.lines.totalValues.offsetY", { def: 6, min: -100, max: 100 }),
    NUMBER("style.chart.lines.totalValues.offsetX", { def: 6, min: -100, max: 100 }),
    NUMBER("style.chart.lines.totalValues.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.lines.totalValues.bold", { def: true }),
    COLOR("style.chart.lines.totalValues.color", { def: "#1A1A1A" }),

    CHECKBOX("style.chart.lines.dataLabels.show", { def: true }),
    CHECKBOX("style.chart.lines.dataLabels.hideEmptyValues", { def: true }),
    CHECKBOX("style.chart.lines.dataLabels.hideEmptyPercentages", { def: true }),
    NUMBER("style.chart.lines.dataLabels.offsetY", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.chart.lines.dataLabels.adaptColorToBackground", { def: true }),
    COLOR("style.chart.lines.dataLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.lines.dataLabels.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.chart.lines.dataLabels.bold", { def: false }),
    NUMBER("style.chart.lines.dataLabels.rounding", { def: 0, min: 0, max: 6 }),
    TEXT("style.chart.lines.dataLabels.prefix", { def: "" }),
    TEXT("style.chart.lines.dataLabels.suffix", { def: "" }),
    NUMBER("style.chart.lines.dataLabels.hideUnderValue", { def: null, min: 0, max: 100 }),
    NUMBER("style.chart.lines.dataLabels.hideUnderPercentage", { def: 0, min: 0, max: 100 }),

    SELECT("style.chart.grid.scale.ticks", [2, 5, 10, 20], { def: 10 }),
    NUMBER("style.chart.grid.scale.scaleMin", { def: null, min: -1000, max: 1000 }),
    NUMBER("style.chart.grid.scale.scaleMax", { def: null, min: -1000, max: 1000 }),

    CHECKBOX("style.chart.grid.x.showAxis", { def: true }),
    CHECKBOX("style.chart.grid.x.showHorizontalLines", { def: true }),
    COLOR("style.chart.grid.x.linesColor", { def: "red" }),
    NUMBER("style.chart.grid.x.linesThickness", { def: 0.5, min: 0, max: 12 }),
    NUMBER("style.chart.grid.x.linesStrokeDasharray", { def: 2, min: 0, max: 12 }),

    COLOR("style.chart.grid.x.axisColor", { def: "#E1E5E8" }),
    NUMBER("style.chart.grid.x.axisThickness", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.grid.x.axisName.show", { def: true }),
    TEXT("style.chart.grid.x.axisName.text", { def: "X AXIS" }),
    NUMBER("style.chart.grid.x.axisName.fontSize", { def: 14, min: 8, max: 42 }),
    COLOR("style.chart.grid.x.axisName.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.grid.x.axisName.bold", { def: false }),
    NUMBER("style.chart.grid.x.axisName.offsetY", { def: 0, min: -100, max: 100 }),

    CHECKBOX("style.chart.grid.x.timeLabels.show", { def: true }),
    NUMBER("style.chart.grid.x.timeLabels.offsetY", { def: 0, min: -100, max: 100 }),
    RANGE("style.chart.grid.x.timeLabels.rotation", { def: 0, min: -90, max: 90 }),
    CHECKBOX("style.chart.grid.x.timeLabels.autoRotate.enable", { def: true }),
    NUMBER("style.chart.grid.x.timeLabels.autoRotate.angle", { def: -90, min: -90, max: 90 }),
    CHECKBOX("style.chart.grid.x.timeLabels.showOnlyAtModulo", { def: false }),
    CHECKBOX("style.chart.grid.x.timeLabels.showOnlyFirstAndLast", { def: false }),
    NUMBER("style.chart.grid.x.timeLabels.modulo", { def: 12, min: 2, max: 12 }),
    NUMBER("style.chart.grid.x.timeLabels.fontSize", { def: 14, min: 8, max: 42 }),
    COLOR("style.chart.grid.x.timeLabels.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.grid.x.timeLabels.bold", { def: false }),

    CHECKBOX("style.chart.grid.y.showAxis", { def: true }),
    CHECKBOX("style.chart.grid.y.showVerticalLines", { def: true }),
    COLOR("style.chart.grid.y.linesColor", { def: "#FF00FF" }),
    NUMBER("style.chart.grid.y.linesThickness", { def: 0.5, min: 0, max: 12 }),
    NUMBER("style.chart.grid.y.linesStrokeDasharray", { def: 2, min: 0, max: 12 }),

    COLOR("style.chart.grid.y.axisColor", { def: "#E1E5E8" }),
    NUMBER("style.chart.grid.y.axisThickness", { def: 2, min: 0, max: 12 }),
    CHECKBOX("style.chart.grid.y.axisName.show", { def: true }),
    TEXT("style.chart.grid.y.axisName.text", { def: "Y AXIS" }),
    NUMBER("style.chart.grid.y.axisName.fontSize", { def: 14, min: 8, max: 42 }),
    COLOR("style.chart.grid.y.axisName.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.grid.y.axisName.bold", { def: false }),
    NUMBER("style.chart.grid.y.axisName.offsetX", { def: 0, min: -100, max: 100 }),

    CHECKBOX("style.chart.grid.y.axisLabels.show", { def: true }),
    COLOR("style.chart.grid.y.axisLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.grid.y.axisLabels.fontSize", { def: 14, min: -100, max: 100 }),
    CHECKBOX("style.chart.grid.y.axisLabels.bold", { def: false }),
    NUMBER("style.chart.grid.y.axisLabels.rounding", { def: 2, min: 0, max: 6 }),

    CHECKBOX("style.chart.grid.frame.show", { def: true }),
    COLOR("style.chart.grid.frame.stroke", { def: "#CCCCCC" }),
    NUMBER("style.chart.grid.frame.strokeWidth", { def: 4, min: 0, max: 12 }),
    TEXT("style.chart.grid.frame.strokeLinecap", { def: "round" }),
    TEXT("style.chart.grid.frame.strokeLinejoin", { def: "round" }),
    NUMBER("style.chart.grid.frame.strokeDasharray", { def: 0, min: 0, max: 24 }),

    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),

    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 6 }),
    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        theme: currentTheme.value,
        events: {
            datapointEnter: ({ seriesIndex }) => {
                selectedX.value = seriesIndex;
            },
            datapointLeave: () => {
                selectedX.value = undefined;
            }
        },
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                zoom: {
                    ...c.style.chart.zoom,
                    useDefaultFormat: false,
                    customFormat: ({ absoluteIndex, seriesIndex, datapoint, timeLabel }) => {
                        // console.log({ absoluteIndex, seriesIndex, datapoint, timeLabel });
                        return `T - ${timeLabel.text}`
                    }
                },
                tooltip: {
                    ...c.style.chart.tooltip,
                    useDefaultTimeFormat: true,
                    timeFormat: 'yyyy-MM-dd',
                    //  customFormat: (data) => {
                    //     console.log(data)
                    //         return "CUSTOM TOOLTIP "
                    //     }
                },
                grid: {
                    ...c.style.chart.grid,
                    x: {
                        ...c.style.chart.grid.x,
                        timeLabels: {
                            ...c.style.chart.grid.x.timeLabels,
                            values: generateDayTimestamps(100),
                            datetimeFormatter: {
                                enable: true
                            }
                        }
                    },
                    y: {
                        ...c.style.chart.grid.y,
                        axisLabels: {
                            // formatter: ({ value }) => {
                            //     return 'BOO' + value
                            // }
                        }
                    }
                }
            }
        }
    }
});

// onMounted(() => {
//     if (local.value) {
//         local.value.hideSeries('Series A');
//         local.value.hideSeries('Series B');
//         setTimeout(() => {
//             local.value.showSeries('Series A');
//             local.value.showSeries('Series B');
//             local.value.hideSeries('Series E');
//         }, 1000)
//     }
// })

// onMounted(() => {
//     setTimeout(() => {
//         dataset.value.push({
//             name: 'Series F',
//             series: makeDs(24)
//         })
//     }, 2000)
// })

// onMounted(async () => {
//     if (local.value) {
//         const img = await local.value.getImage();
//         console.log(img)
//     }
// })

function selectX({ dataset, index, indexLabel }) {
    // console.log({ dataset, index, indexLabel });
}

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiStackline" :dataset="dataset" :config="config">
        <template #title>VueUiStackline</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiStackline
                    ref="resp"
                    :dataset="dataset"
                    :config="{
                        ...config,
                        responsive: true
                    }"
                >

                </LocalVueUiStackline>
            </div>
        </template>

        <template #theme>
            <LocalVueUiStackline :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiStackline :dataset="dataset" :config="config" ref="local" @selectX="selectX" :selectedXIndex="selectedX">
                <!-- <template #pattern="{ datapoint, patternId }">
                    <pattern :id="patternId" width="70" height="8" patternTransform="scale(2)"
                        patternUnits="userSpaceOnUse" opacity="0.5">
                        <rect width="100%" height="100%" fill="#FFFFFF20" />
                        <path fill="none" stroke="#ecc94b"
                            d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002" />
                    </pattern>
                </template> -->
                <!-- <template #source>
                    SRC
                </template> -->
            </LocalVueUiStackline>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiStackline" :dataset="dataset" :config="config" :selectedXIndex="selectedX"/>
        </template>

        <template #build>
            <VueUiStackline :dataset="dataset" :config="config" :selectedXIndex="selectedX">

            </VueUiStackline>
        </template>

        <template #build-treesh>
            <VueUiStacklineTreeshaken :dataset="dataset" :config="config" :selectedXIndex="selectedX">

            </VueUiStacklineTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiStackline" :dataset="dataset" :config="config" :selectedXIndex="selectedX">

            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>
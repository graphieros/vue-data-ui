<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiStackbar from '../src/components/vue-ui-stackbar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiStackbar } from "vue-data-ui";
import { VueUiStackbar as VueUiStackbarTreeshaken } from "vue-data-ui/vue-ui-stackbar";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { vue_ui_stackbar: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

// const dataset = ref([
//     {
//         name: "Serie 1",
//         series: [100, 200],
//     },
//     {
//         name: "Serie 2",
//         series: [50, 100],
//     },
// ]);

function makeDs(n) {
    const arr = [];
    for(let i = 0; i < n; i += 1) {
        if (i === 0) {
            arr.push(0)
        }
        arr.push(Math.random() * 5 * (Math.random() > 0.3 ? 1 : -1))
    }
    return arr;
}

const dataset = ref([
            {
                name: "Series 1",
                series: makeDs(24),
                marked: true
            },
            {
                name: "Series 2",
                series: makeDs(24),
                marked: true
            },
            {
                name: "Series 3",
                series: makeDs(24),
            },
        ]);

// onMounted(() => {
//     dataset.value = undefined;
//     setTimeout(() => {
//         dataset.value = [
//             {
//                 name: "Series 1",
//                 series: makeDs(100),
//             },
//             {
//                 name: "Series 2",
//                 series: makeDs(100),
//             },
//             {
//                 name: "Series 3",
//                 series: makeDs(100),
//             },
//         ]
//     }, 2000)
// })

const monthValues = computed(() => {
  const yearStart = 2026
  const arr = []

  for (let i = 0; i < 100; i += 1) {
    const d = new Date(yearStart, i, 1)
    arr.push(d.getTime())
  }

  return arr
})

// const dataset = ref([
//     {
//         name: "Serie 1",
//         series: [0, 0, 30],
//         color: "rgba(255,0,0,0.5)"
//     },
//     {
//         name: "Serie 2",
//         series: [0, -20, -30],
//     },
//     {
//         name: "Serie 3",
//         series: [0, 5, -5, -10],
//     },
//     {
//         name: "Serie 4",
//         series: [0, 5, -5],
//     },
//     {
//         name: "Serie 4",
//         series: [0, -5, 5],
//     },
// ]);

// onMounted(() => {
//     setTimeout(() => {
//         dataset.value.push({
//             name: 'ALT',
//             series: [100, 100, 100, 100, 100, 100, 100, 100, 100]
//         })
//     }, 3000)
// })

const model = createModel([
    CHECKBOX("loading", { def: false }),
    CHECKBOX("debug", { def: false }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    SELECT("orientation", ["vertical", "horizontal"], { def: "vertical" }),
    CHECKBOX("responsive", { def: false }),
    SELECT("theme", ["", "zen", "hack", "concrete"], { def: "" }),
    CHECKBOX("useCssAnimation", { def: false }),
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

    CHECKBOX("style.chart.zoom.show", { def: true }),
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
    CHECKBOX("style.chart.zoom.minimap.smooth", { def: false }),
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

    RANGE("style.chart.bars.gapRatio", { def: 0.5, min: 0, max: 1, step: 0.01 }),
    CHECKBOX("style.chart.bars.distributed", { def: false }),
    CHECKBOX("style.chart.bars.showDistributedPercentage", { def: false }),
    NUMBER("style.chart.bars.borderRadius", { def: 1, min: 0, max: 12 }),
    NUMBER("style.chart.bars.strokeWidth", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.chart.bars.gradient.show", { def: true }),
    RANGE("style.chart.bars.gradient.intensity", { def: 20, min: 0, max: 100 }),

    CHECKBOX("style.chart.bars.totalValues.show", { def: true }),
    NUMBER("style.chart.bars.totalValues.offsetY", { def: 6, min: -100, max: 100 }),
    NUMBER("style.chart.bars.totalValues.offsetX", { def: 6, min: -100, max: 100 }),
    NUMBER("style.chart.bars.totalValues.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.bars.totalValues.bold", { def: false }),
    COLOR("style.chart.bars.totalValues.color", { def: "#1A1A1A" }),

    CHECKBOX("style.chart.bars.dataLabels.show", { def: true }),
    CHECKBOX("style.chart.bars.dataLabels.hideEmptyValues", { def: false }),
    CHECKBOX("style.chart.bars.dataLabels.hideEmptyPercentages", { def: true }),
    CHECKBOX("style.chart.bars.dataLabels.adaptColorToBackground", { def: true }),
    COLOR("style.chart.bars.dataLabels.color", { def: "#FFFFFF" }),
    NUMBER("style.chart.bars.dataLabels.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.chart.bars.dataLabels.bold", { def: false }),
    NUMBER("style.chart.bars.dataLabels.rounding", { def: 2, min: 0, max: 6 }),
    TEXT("style.chart.bars.dataLabels.prefix", { def: "" }),
    TEXT("style.chart.bars.dataLabels.suffix", { def: "" }),
    NUMBER("style.chart.bars.dataLabels.hideUnderValue", { def: null, min: 0, max: 100 }),
    NUMBER("style.chart.bars.dataLabels.hideUnderPercentage", { def: null, min: 0, max: 100 }),

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
    CHECKBOX("style.chart.grid.x.timeLabels.showOnlyAtModulo", { def: true }),
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
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

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
        // events: {
        //     datapointEnter: ({ datapoint, seriesIndex }) => {
        //         console.log('enter event', { datapoint, seriesIndex })
        //     },
        //     datapointLeave: ({ datapoint, seriesIndex }) => {
        //         console.log('leave event', { datapoint, seriesIndex });
        //     },
        //     datapointClick: ({ datapoint, seriesIndex }) => {
        //         console.log('click event', { datapoint, seriesIndex });
        //     }
        // },
        theme: currentTheme.value,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                bars: {
                    ...c.style.chart.bars,
                    dataLabels: {
                        ...c.style.chart.bars.dataLabels,
                        // formatter: ({value, config}) => {
                        //     return `f | ${value}`
                        // }
                    }
                },
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
                    timeFormat: 'yyyy-MM-dd'
                },
                grid: {
                    ...c.style.chart.grid,
                    x: {
                        ...c.style.chart.grid.x,
                        timeLabels: {
                            ...c.style.chart.grid.x.timeLabels,
                            values: ['T1', 'T2', 'T3', 'T4'],
                            // values: new Array(6).fill(0).map((d, i) => {
                            //     return `Some long name\nfor dataset of index ${i}` 
                            // }),
                            datetimeFormatter: {
                                enable: false
                            }
                            // values: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG']
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

const step = ref(0);

function selectTimeLabel(data) {
    console.log(data)
}

const local = ref(null)
onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage();
        console.log(img)
    }
})

const selectedX = ref(undefined);

function selectX({ datapoint, index, indexLabel}) {
    selectedX.value = index;
}

function freestyle({ drawingArea, data }) {
    const marked = data?.filter(d => !!d.marked);
    const paths = marked.map((m, i) => {
        const dp = m ?? {x: [], y: []};
        const minY = Math.min(...dp?.y);
        const minX = dp.x[dp.y.indexOf(minY)];
        const maxY = Math.max(...dp?.y);
        const maxX = dp.x[dp.y.indexOf(maxY)];
        return `
            <defs>
                <marker
                    id="arrow_${i}"
                    viewBox="0 0 10 10"
                    refX="5"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" />
                </marker>
            </defs>
            <path
                d="M${minX > maxX ? `${maxX},${maxY} ${minX},${minY}` : `${minX},${minY} ${maxX},${maxY}`}"
                stroke="#000000"
                marker-end="url(#arrow_${i})"
            />
        `
    });
    return paths;
}

function selectLegend(l) {
    console.log(l)
}

const resp = ref(null);

// onMounted(() => {
//     if (local.value) {
//         local.value.hideSeries('Series 1');
//         local.value.hideSeries('Series 2');
//         setTimeout(() => {
//             local.value.showSeries('Series 1');
//             local.value.showSeries('Series 2');
//             local.value.hideSeries('Series 3');
//         }, 1000)
//     }
// })
    
</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

<Box comp="VueUiStackbar" :dataset="dataset" :config="config">
    <template #title>VueUiStackbar</template>

    <template #responsive>
        <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
            <LocalVueUiStackbar ref="resp" @selectLegend="selectLegend" @selectX="selectX" :selectedXIndex="selectedX" :dataset="dataset" :config="{...config,
                responsive: true,
            }"  @selectTimeLabel="selectTimeLabel"> 
                    <template #svg="{ svg }">
                        <!-- <g v-html="freestyle(svg)"/> -->
                    </template>

                    <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template>

                    <template #source>
                        <div style="width:100%;font-size:10px;text-align:left">
                            SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                        </div>
                    </template>
                    <!-- <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                        <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                            <text
                                :x="x"
                                :y="y"
                                :font-size="fontSize"
                                :text-anchor="textAnchor"
                                :fill="fill"
                            >
                                {{ content }}
                            </text>
                            <text
                                :x="x"
                                :y="y + fontSize"
                                :font-size="fontSize * 0.8"
                                :text-anchor="textAnchor"
                                fill="grey"
                            >
                                {{ content }}
                            </text>
                        </g>
                    </template> -->

                    <!-- <template #pattern="{ seriesIndex, patternId }">
                        <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                        <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                        <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
                    </template> -->
            </LocalVueUiStackbar>
        </div>
    </template>

    <template #theme>
        <LocalVueUiStackbar :dataset="dataset" :config="configTheme" />
    </template>

    <template #local>
        <LocalVueUiStackbar @selectX="selectX" :selectedXIndex="selectedX" :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
            <!-- <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
            </template> -->
        </LocalVueUiStackbar>
    </template>

    <template #VDUI-local>
        <LocalVueDataUi @selectX="selectX" :selectedXIndex="selectedX" component="VueUiStackbar" :dataset="dataset" :config="config" :key="`local_vdui_${step}`">
            <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
            </template>
        </LocalVueDataUi>
    </template>
    
    <template #build>
        <VueUiStackbar :dataset="dataset" :config="config" :key="`build_${step}`">
            <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
            </template>
        </VueUiStackbar>
    </template>
    
    <template #build-treesh>
        <VueUiStackbarTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`">
            <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
            </template>
        </VueUiStackbarTreeshaken>
    </template>

    <template #VDUI-build>
        <VueDataUi component="VueUiStackbar" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
            <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
            </template>
        </VueDataUi>
    </template>

    <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
</Box>

</template>
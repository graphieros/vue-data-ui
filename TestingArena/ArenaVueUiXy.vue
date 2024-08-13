<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiXy from '../src/components/vue-ui-xy.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels, toggleStack } = useArena()

const dataset = ref([
        {
            name: "S0",
            series: [10, 20, 12, 13, 10, -20, 30, 20, 12, 16, 32, 64],
            type: "line",
            smooth: false,
            useArea: true,
            dataLabels: true,
            scaleSteps: 2,
        },
        {
            name: "S1",
            series: [8, 4, 8, 16, 12, 13, -16, 25, 12, 3, 7, 12, 6],
            type: "bar",
            smooth: false,
            useArea: true,
            scaleSteps: 2,
        },
        {
            name: "S2",
            series: [10,12,10,12, 25, 12, 4, 4, 3, 7, 8, 9, 12],
            type: "line",
            smooth: false,
            useArea: true,
            scaleSteps: 2
        },
        // {
        //     name: "S3",
        //     series: [23.12, 23.12, 23.05, 23.07, null, 23.69, 23.72, 23.25, 23.36, 23.41, 23.65],
        //     type: "line",
        //     smooth: false,
        //     useArea: true,
        //     scaleSteps: 5,
        //     autoScaling: false,
        //     stackRatio: 0.5
        // },
    ])

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'chart.userOptions.show', def: true, type: 'checkbox', label: 'showUserOptions', category: 'general' },
    { key: 'chart.userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'chart.userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'chart.userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'chart.userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'chart.userOptions.buttons.labels', def: true, type: 'checkbox'},
    { key: 'chart.userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'chart.userOptions.buttons.stack', def: true, type: 'checkbox'},

    { key: 'useCanvas', def: false, type: 'checkbox'}, // DEPRECATED (removed)
    { key: 'useCssAnimation', def: true, type: 'checkbox', label: 'useCssAnimation', category: 'general' },
    { key: 'chart.fontFamily', def: 'inherit', type: 'text', label: 'fontFamily', category: 'general' },
    { key: 'chart.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColor', category: 'general' },
    { key: 'chart.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'general' },
    { key: 'chart.height', def: 600, type: 'range', min: 300, max: 1000, label: 'height', category: 'general' },
    { key: 'chart.width', def: 1000, type: 'range', min: 300, max: 2000, label: 'width', category: 'general' },
    { key: 'chart.zoom.show', def: true, type: 'checkbox', label: 'zoom', category: 'general' },
    { key: 'chart.zoom.color', def: '#CCCCCC', type: 'color' },
    { key: 'chart.zoom.highlightColor', def: '#4A4A4A', type: 'color' },
    { key: 'chart.zoom.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'chart.zoom.useResetSlot', def: false, type: 'checkbox'},

    { key: 'chart.padding.top', def: 36, type: 'number', min: 0, max: 100, label: "top", category: 'padding' },
    { key: 'chart.padding.right', def: 24, type: 'number', min: 0, max: 100, label: 'right', category: 'padding' },
    { key: 'chart.padding.bottom', def: 48, type: 'number', min: 0, max: 100, label: 'bottom', category: 'padding' },
    { key: 'chart.padding.left', def: 48, type: 'number', min: 0, max: 100, label: 'left', category: 'padding' },

    { key: 'chart.highlighter.color', def: '#1A1A1A', type: 'color', label: 'highlighterColor', category: 'general' },
    { key: 'chart.highlighter.opacity', def: 5, type: 'range', min: 0, max: 100, label: 'highlighterOpacity', category: 'general' },
    { key: "chart.highlighter.useLine", def: true, type: "checkbox" },

    { key: "chart.timeTag.show", def: true, type: "checkbox" },

    { key: 'chart.highlightArea.show', def: false, type: 'checkbox', label: 'show', category: 'highlight' },
    { key: 'chart.highlightArea.from', def: 2, type: 'number', min: 0, max: 999, label: 'from', category: 'highlight' },
    { key: 'chart.highlightArea.to', def: 5, type: 'number', min: 0, max: 999, label: 'to', category: 'highlight' },
    { key: 'chart.highlightArea.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'highlight' },
    { key: 'chart.highlightArea.opacity', def: 20, type: 'range', min: 0, max: 100, label: 'opacity', category: 'highlight' },
    { key: 'chart.highlightArea.caption.text', def: 'Caption', type: 'text', label: 'caption', category: 'highlight' },
    { key: 'chart.highlightArea.caption.fontSize', def: 20, min: 6, max: 28, type: 'number', label: 'fontSize', category: 'highlight' },
    { key: 'chart.highlightArea.caption.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'highlight' },
    { key: 'chart.highlightArea.caption.bold', def: false, type: 'checkbox', label: 'bold', category: 'highlight' },
    { key: 'chart.highlightArea.caption.offsetY', def: 0, type: 'number', label: 'offsetY', category: 'highlight' },
    { key: 'chart.highlightArea.caption.width', def: 'auto', type: 'text', label: 'captionWidth', category: 'highlight' },
    { key: 'chart.highlightArea.caption.padding', def: 3, type: 'number', min: 0, max: 48, label: 'captionPadding', category: 'highlight' },
    { key: 'chart.highlightArea.caption.textAlign', def: 'center', type: 'select', options: ['left', 'center', 'right'], label: 'textAlign', category: 'highlight' },

    { key: 'chart.grid.stroke', def: '#FF0000', type: 'color', label: 'lineColor', category: 'grid' },
    { key: 'chart.grid.showVerticalLines', def: true, type: 'checkbox', label: 'verticalLines', category: 'grid' },
    { key: 'chart.grid.labels.show', def: true, type: 'checkbox', label: 'showLabels', category: 'grid' },
    { key: 'chart.grid.labels.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'grid' },
    { key: 'chart.grid.labels.fontSize', def: 12, type: 'number', min: 4, max: 30, label: 'fontSize', category: 'grid' },
    { key: 'chart.grid.labels.axis.yLabel', def: 'TEST', type: 'text', label: 'yAxisLabel', category: 'grid' },
    { key: 'chart.grid.labels.axis.xLabel', def: 'TEST', type: 'text', label: 'xAxisLabel', category: 'grid' },
    { key: 'chart.grid.labels.axis.fontSize', def: 12, type: 'number', min: 4, max: 30, label: 'fontSize', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.show', def: true, type: 'checkbox', label: 'showPeriodLabels', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.color', def: '#1A1A1A', type: 'color', label: 'textColorPeriodLabels', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.values', def: [], type: 'none', label: 'fontSize' },
    { key: 'chart.grid.labels.xAxisLabels.fontSize', def: 18, type: 'number', min: 6, max: 30, label: 'fontSizePeriodLabels', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.showOnlyFirstAndLast', def: false, type: 'checkbox', label: 'showOnlyFirstAndLast', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.yOffset', def: 8, type: 'number', min: -100, max: 100, label: 'offsetYPeriodLabels', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.rotation', def: 0, type: 'range', min: -360, max: 360, label: 'rotation', category: 'grid' },
    { key: 'chart.grid.labels.yAxis.commonScaleSteps', def: 20, min: 0, max: 100, type: 'number' },
    { key: 'chart.grid.labels.yAxis.useIndividualScale', def: false, type: "checkbox" },
    { key: 'chart.grid.labels.yAxis.stacked', def: false, type: 'checkbox' },
    { key: 'chart.grid.labels.yAxis.gap', def: 12, min: 0, max: 200, type: 'number' },
    { key: 'chart.grid.labels.yAxis.labelWidth', def: 40, min: 0, max: 100, type: 'number' },
    { key: 'chart.grid.labels.yAxis.showBaseline', def: true,  type: 'checkbox'},
    { key: 'chart.grid.labels.xAxis.showBaseline', def: true,  type: 'checkbox'},
    { key: 'chart.grid.labels.zeroLine.show', def: true, type: 'checkbox'},

    { key: 'chart.labels.fontSize', def: 20, type: 'number', min: 6, max: 30, label: 'fontSize', category: 'labels' },
    { key: 'chart.labels.prefix', def: '', type: 'text', label: 'prefix', category: 'labels' },
    { key: 'chart.labels.suffix', def: '', type: 'text', label: 'suffix', category: 'labels' },

    { key: 'chart.legend.show', def: true, type: 'checkbox', label: 'show', category: 'legend' },
    { key: 'chart.legend.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'legend' },
    { key: 'chart.legend.fontSize', def: 16, type: 'number', min: 10, max: 36, label: 'fontSize', category: 'legend' },

    { key: 'chart.title.show', def: true, type: 'checkbox', label: 'show', category: 'title' },
    { key: 'chart.title.text', def: 'Title', type: 'text', label: 'textContent', category: 'title' },
    { key: 'chart.title.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'title' },
    { key: 'chart.title.fontSize', def: 20, type: 'number', min: 10, max: 64, label: 'fontSize', category: 'title' },
    { key: 'chart.title.bold', def: true, type: 'checkbox', label: 'bold', category: 'title' },
    { key: 'chart.title.offsetX', def: 0, type: 'number', label: 'offsetX', category: 'title' },
    { key: 'chart.title.offsetY', def: 0, type: 'number', label: 'offsetY', category: 'title' },

    { key: 'chart.title.subtitle.text', def: 'Subtitle', type: 'text', label: 'textContent', category: 'subtitle' },
    { key: 'chart.title.subtitle.color', def: '#CCCCCC', type: 'color', label: 'textColor', category: 'subtitle' },
    { key: 'chart.title.subtitle.fontSize', def: 16, type: 'number', min: 6, max: 64, label: 'fontSize', category: 'subtitle' },

    { key: 'chart.tooltip.show', def: true, type: 'checkbox', label: 'show', category: 'tooltip' },
    { key: 'chart.tooltip.showValue', def: true, type: 'checkbox', label: 'showValue', category: 'tooltip' },
    { key: 'chart.tooltip.showPercentage', def: false, type: 'checkbox', label: 'showPercentage', category: 'tooltip' },
    { key: 'chart.tooltip.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'tooltip' },
    { key: 'chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColor', category: 'tooltip' },
    { key: 'chart.tooltip.roundingValue', def: 3, type: 'number', min: 0, max: 6, label: 'valueRounding', category: 'tooltip' },
    { key: 'chart.tooltip.roundingPercentage', def: 0, type: 'number', min: 0, max: 6, label: 'percentageRounding', category: 'tooltip' },
    { key: 'chart.tooltip.fontSize', def: 14, type: 'range', min: 8, max: 48},

    { key: 'bar.borderRadius', def: 2, type: 'number', min: 0, max: 120, label: 'borderRadius', category: 'bar' },
    { key: 'bar.useGradient', def: true, type: 'checkbox', label: 'useGradient', category: 'bar' },
    { key: 'bar.labels.show', def: true, type: 'checkbox', label: 'showDataLabels', category: 'bar' },
    { key: 'bar.labels.offsetY', def: -8, type: 'number', min: -100, max: 100, label: 'offsetYDataLabels', category: 'bar' },
    { key: 'bar.labels.rounding', def: 0, type: 'number', min: 0, max: 6, label: 'rounding', category: 'bar' },
    { key: 'bar.labels.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'bar' },
    { key: 'bar.serieName.show', def: false, type: 'checkbox', label: ['serieName', 'is', 'show'], category: 'bar' },
    { key: 'bar.serieName.offsetY', def: -6, type: 'number', min: -100, max: 100, label: ['serieName', 'is', 'offsetY'], category: 'bar' },
    { key: 'bar.serieName.useAbbreviation', def: true, type: 'checkbox', label: ['serieName', 'is', 'abbreviation'], category: 'bar' },
    { key: 'bar.serieName.abbreviationSize', def: 3, type: 'number', min: 0, max: 12, label: ['serieName', 'abbreviation', 'is', 'size'], category: 'bar' },
    { key: 'bar.serieName.useSerieColor', def: true, type: 'checkbox', label: ['serieName', 'textColor', 'is', 'series'], category: 'bar' },
    { key: 'bar.serieName.color', def: '#1A1A1A', type: 'color', label: ['serieName', 'is', 'textColor'], category: 'bar' },
    { key: 'bar.periodGap', def: 0.1, type: 'number', min: 0, max: 24},
    { key: 'bar.border.useSerieColor', def: false, type: 'checkbox'},
    { key: 'bar.border.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'bar.border.strokeWidth', def: 1, type: 'number', min: 0, max: 12, step: 0.5},

    { key: 'line.radius', def: 6, type: 'number', min: 0, max: 20, label: 'radius', category: 'line' },
    { key: 'line.useGradient', def: true, type: 'checkbox', label: 'useGradient', category: 'line' },
    { key: 'line.strokeWidth', def: 2, type: 'number', min: 1, max: 20, label: 'thickness', category: 'line' },
    { key: 'line.labels.show', def: true, type: 'checkbox', label: 'showDataLabels', category: 'line' },
    { key: 'line.labels.offsetY', def: -8, type: 'number', min: -100, max: 100, label: 'offsetYDataLabels', category: 'line' },
    { key: 'line.labels.rounding', def: 0, type: 'number', min: 0, max: 6, label: 'rounding', category: 'line' },
    { key: 'line.labels.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'line' },
    { key: 'line.area.useGradient', def: true, type: 'checkbox', label: 'useGradient', category: 'line' },
    { key: 'line.area.opacity', def: 20, type: 'range', min: 0, max: 100, label: 'opacity', category: 'line' },

    { key: 'plot.radius', def: 6, type: 'number', min: 0, max: 20, label: 'radius', category: 'plot' },
    { key: 'plot.useGradient', def: true, type: 'checkbox', label: 'useGradient', category: 'plot' },
    { key: 'plot.strokeWidth', def: 2, type: 'number', min: 1, max: 20, label: 'thickness', category: 'plot' },
    { key: 'plot.labels.show', def: true, type: 'checkbox', label: 'showDataLabels', category: 'plot' },
    { key: 'plot.labels.offsetY', def: -8, type: 'number', min: -100, max: 100, label: 'offsetYDataLabels', category: 'plot' },
    { key: 'plot.labels.rounding', def: 0, type: 'number', min: 0, max: 6, label: 'rounding', category: 'plot' },
    { key: 'plot.labels.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'plot' },

    { key: 'showTable', def: false, type: 'checkbox', label: 'show', category: 'table' },
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 350, max: 800, label: 'responsiveBreakpoint', category: 'table' },
    { key: 'table.rounding', def: 0, type: 'number', min: 0, max: 6, label: 'rounding', category: 'table' },
    { key: 'table.sparkline', def: true, type: 'checkbox', label: 'sparkline', category: 'table' },
    { key: 'table.columnNames.period', def: 'Period', type: 'text', label: 'columnNamePeriod', category: 'table' },
    { key: 'table.columnNames.total', def: 'Total', type: 'text', label: 'columnNameTotal', category: 'table' },
    { key: 'table.th.backgroundColor', def: '#FAFAFA', type: 'color', label: 'backgroundColorHeader', category: 'table' },
    { key: 'table.th.color', def: '#1A1A1A', type: 'color', label: 'textColorHeader', category: 'table' },
    { key: 'table.th.outline', def: '', type: 'text', label: 'outlineHeader', category: 'table' },
    { key: 'table.td.backgroundColor', def: '#FAFAFA', type: 'color', label: 'backgroundColorRow', category: 'table' },
    { key: 'table.td.color', def: '#1A1A1A', type: 'color', label: 'textColorRow', category: 'table' },
    { key: 'table.td.outline', def: '', type: 'text', label: 'outlineRow', category: 'table' },
]);

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

const size = ref({
    height: 600,
            width: 1000
})

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    if (testCustomTooltip.value) {
        return {
            ...c,
            chart: {
                ...c.chart,
                height: size.value.height,
                width: size.value.width,
                tooltip: {
                    ...c.tooltip,
                    customFormat: ({ datapoint }) => {
                        let html = "";
                        datapoint.forEach(d => {
                            html += `<li>${d.name} : ${d.value}</li>`
                        })
                        return `<ul>${html}</ul>`
                    }
                }
            }
        }
    } else {
        return {
            ...c,
            customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
            theme: currentTheme.value,
            chart: {
                ...c.chart,
                grid: {
                    ...c.chart.grid,
                    labels: {
                        ...c.chart.grid.labels,
                        xAxisLabels: {
                            ...c.chart.grid.labels.xAxisLabels,
                            values: [
                                "JANUARY IS KIND OF LONG",
                                "FEBRUARY IS KIND OF LONG TOO",
                                "MARCH",
                                "APRIL",
                                "MAY",
                                "JUNE",
                                "JULY",
                                "AUGUST",
                                "SEPTEMBER",
                                "OCTOBER",
                                "NOVEMBER IS KIND OF LONG TOO",
                                "DECEMBER",
                                "JANUARY+",
                                "FEBRUARY+",
                                "MARCH+"
                            ]
                        }
                    }
                }
            }
        }
    }
});

const step = ref(0)

function selectLegend(legend) {
    console.log({ legend })
}

function selectX(selectedX) {
    console.log({ selectedX })
}

// const resizable = ref(null);

// onMounted(() => {
//     const { height, width } = resizable.value.getBoundingClientRect();

//     size.value.height = height;
//     size.value.width = width;

//     const resizeObserver = new ResizeObserver((entries) => {
//         for(const entry of entries) {
//             size.value.height = entry.contentBoxSize[0].blockSize;
//             size.value.width = entry.contentBoxSize[0].inlineSize;
//         }
//     })
//     resizeObserver.observe(resizable.value)
// })

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleLabels">TOGGLE LABELS</button>
    <button @click="toggleStack">TOGGLE STACK</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>

    <div style="width: 100%">
        <LocalVueUiXy component="VueUiXy" :dataset="dataset" :config="{
            responsive: false,
            ...config,
            chart: {
                ...config.chart,
            }
        }"/>
    </div>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiXy component="VueUiXy" :dataset="dataset" :config="{
            ...config,
            responsive: true,
        }"/>
    </div>
    <Box>
        <template #title>VueUiXy</template>

        <template #local>
            <LocalVueUiXy :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend"
                @selectX="selectX" ref="local">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionStack>
                    STACK IT
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </LocalVueUiXy>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiXy" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`"
                @selectLegend="selectLegend" @selectX="selectX" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiXy :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend"
                @selectX="selectX" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </VueUiXy>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiXy" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`"
                @selectLegend="selectLegend" @selectX="selectX" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </VueDataUi>
        </template>

        <template #knobs>
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :type="knob.type" :min="knob.min ?? 0"
                            :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
                        <select v-if="knob.type === 'select'" v-model="knob.def" @change="step += 1">
                            <option v-for="opt in knob.options">{{ opt }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>
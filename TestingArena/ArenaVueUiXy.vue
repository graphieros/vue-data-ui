<script setup>
import { ref, computed } from "vue";
import LocalVueUiXy from '../src/components/vue-ui-xy.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
        {
            name: "S0",
            series: [1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
            type: "line",
            smooth: false,
            useArea: true,
            dataLabels: false,
            scaleSteps: 2,
        },
        {
            name: "S1",
            series: [0,1,1,1,1,1,0,0, 1, 1, 1],
            type: "line",
            smooth: false,
            useArea: true,
            scaleSteps: 2,
        },
        {
            name: "S2",
            series: [0,0,0,1,1,0,0,1,1,1, 1],
            type: "line",
            smooth: false,
            useArea: true,
            scaleSteps: 2
        },
        {
            name: "S3",
            series: [23.12, 23.12, 23.05, 23.07, null, 23.69, 23.72, 23.25, 23.36, 23.41, 23.65],
            type: "line",
            smooth: false,
            useArea: true,
            scaleSteps: 5,
            autoScaling: false,
            stackRatio: 0.5
        },
    ])

const model = ref([
    { key: 'useCssAnimation', def: true, type: 'checkbox', label: 'useCssAnimation', category: 'general' },
    { key: 'chart.fontFamily', def: 'inherit', type: 'text', label: 'fontFamily', category: 'general' },
    { key: 'chart.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColor', category: 'general' },
    { key: 'chart.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'general' },
    { key: 'chart.height', def: 600, type: 'range', min: 300, max: 1000, label: 'height', category: 'general' },
    { key: 'chart.width', def: 1000, type: 'range', min: 300, max: 2000, label: 'width', category: 'general' },
    { key: 'chart.zoom.show', def: true, type: 'checkbox', label: 'zoom', category: 'general' },

    { key: 'chart.padding.top', def: 36, type: 'number', min: 0, max: 100, label: "top", category: 'padding' },
    { key: 'chart.padding.right', def: 24, type: 'number', min: 0, max: 100, label: 'right', category: 'padding' },
    { key: 'chart.padding.bottom', def: 48, type: 'number', min: 0, max: 100, label: 'bottom', category: 'padding' },
    { key: 'chart.padding.left', def: 48, type: 'number', min: 0, max: 100, label: 'left', category: 'padding' },

    { key: 'chart.highlighter.color', def: '#1A1A1A', type: 'color', label: 'highlighterColor', category: 'general' },
    { key: 'chart.highlighter.opacity', def: 5, type: 'range', min: 0, max: 100, label: 'highlighterOpacity', category: 'general' },
    { key: "chart.highlighter.useLine", def: true, type: "checkbox" },

    { key: "chart.timeTag.show", def: true, type: "checkbox" },

    { key: 'chart.highlightArea.show', def: false, type: 'checkbox', label: 'show', category: 'highlight' },
    { key: 'chart.highlightArea.from', def: 0, type: 'number', min: 0, max: 999, label: 'from', category: 'highlight' },
    { key: 'chart.highlightArea.to', def: 0, type: 'number', min: 0, max: 999, label: 'to', category: 'highlight' },
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

    { key: 'chart.grid.stroke', def: '#e1e5e8', type: 'color', label: 'lineColor', category: 'grid' },
    { key: 'chart.grid.showVerticalLines', def: false, type: 'checkbox', label: 'verticalLines', category: 'grid' },
    { key: 'chart.grid.labels.show', def: true, type: 'checkbox', label: 'showLabels', category: 'grid' },
    { key: 'chart.grid.labels.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'grid' },
    { key: 'chart.grid.labels.fontSize', def: 12, type: 'number', min: 4, max: 30, label: 'fontSize', category: 'grid' },
    { key: 'chart.grid.labels.axis.yLabel', def: '', type: 'text', label: 'yAxisLabel', category: 'grid' },
    { key: 'chart.grid.labels.axis.xLabel', def: '', type: 'text', label: 'xAxisLabel', category: 'grid' },
    { key: 'chart.grid.labels.axis.fontSize', def: 12, type: 'number', min: 4, max: 30, label: 'fontSize', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.show', def: true, type: 'checkbox', label: 'showPeriodLabels', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.color', def: '#1A1A1A', type: 'color', label: 'textColorPeriodLabels', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.values', def: [], type: 'none', label: 'fontSize' },
    { key: 'chart.grid.labels.xAxisLabels.fontSize', def: 18, type: 'number', min: 6, max: 30, label: 'fontSizePeriodLabels', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.showOnlyFirstAndLast', def: false, type: 'checkbox', label: 'showOnlyFirstAndLast', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.yOffset', def: 8, type: 'number', min: -100, max: 100, label: 'offsetYPeriodLabels', category: 'grid' },
    { key: 'chart.grid.labels.xAxisLabels.rotation', def: 0, type: 'range', min: -360, max: 360, label: 'rotation', category: 'grid' },
    { key: 'chart.grid.labels.yAxis.commonScaleSteps', def: 20, min: 0, max: 100, type: 'number' },
    { key: 'chart.grid.labels.yAxis.useIndividualScale', def: true, type: "checkbox" },
    { key: 'chart.grid.labels.yAxis.stacked', def: true, type: 'checkbox' },
    { key: 'chart.grid.labels.yAxis.gap', def: 12, min: 0, max: 200, type: 'number' },
    { key: 'chart.grid.labels.yAxis.labelWidth', def: 40, min: 0, max: 100, type: 'number' },
    { key: 'chart.grid.labels.xAxis.showBaseline', def: true,  type: 'checkbox'},

    { key: 'chart.labels.fontSize', def: 10, type: 'number', min: 6, max: 30, label: 'fontSize', category: 'labels' },
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

    { key: 'chart.userOptions.show', def: true, type: 'checkbox', label: 'showUserOptions', category: 'general' },

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

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    if (testCustomTooltip.value) {
        return {
            ...c,
            chart: {
                ...c.chart,
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
            chart: {
                ...c.chart,
                grid: {
                    ...c.chart.grid,
                    labels: {
                        ...c.chart.grid.labels,
                        xAxisLabels: {
                            ...c.chart.grid.labels.xAxisLabels,
                            values: [
                                "A",
                                "B",
                                "C",
                                "D",
                                "E",
                                "F",
                                "G",
                                "H",
                                "I",
                                "J",
                                "K",
                                "L",
                                "M",
                                "N",
                                "O"
                            ]
                        }
                    }
                }
            }
        }
    }
});

const step = ref(0)

function selectLegend(leg) {
    alert(`@selectLegend\n\n${JSON.stringify(leg)}`)
}

function selectX(x) {
    alert(`@selectX\n\n${JSON.stringify(x)}`)
}

</script>

<template>
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>
    <Box>
        <template #title>VueUiXy</template>

        <template #local>
            <LocalVueUiXy :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend"
                @selectX="selectX">
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
            </LocalVueUiXy>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiXy" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`"
                @selectLegend="selectLegend" @selectX="selectX">
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
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiXy :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend"
                @selectX="selectX">
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
            </VueUiXy>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiXy" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`"
                @selectLegend="selectLegend" @selectX="selectX">
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
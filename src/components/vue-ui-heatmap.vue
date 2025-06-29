<script setup>
import { ref, computed, nextTick, onMounted, watch, defineAsyncComponent, onBeforeUnmount, shallowRef } from "vue";
import { 
    adaptColorToBackground, 
    applyDataLabel,
    checkNaN,
    createCsvContent, 
    createUid, 
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    hasDeepProperty,
    interpolateColorHex,
    isFunction,
    objectIsEmpty,
    XMLNS
} from "../lib";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes.json";
import Accordion from "./vue-ui-accordion.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_heatmap: DEFAULT_CONFIG } = useConfig()

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Array,
        default() {
            return []
        }
    }
});

const emit = defineEmits(['selectDatapoint']);

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
})

if(objectIsEmpty(props.dataset)) {
    error({
        componentName: 'VueUiHeatmap',
        type: 'dataset'
    })
}

const uid = ref(createUid());
const heatmapChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const hoveredCell = ref(undefined);
const selectedClone = ref(null);
const step = ref(0);
const tableContainer = ref(null);
const noTitle = ref(null);
const isResponsive = ref(false);
const titleStep = ref(0);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    let finalConfig = {};

    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_heatmap[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.layout.dataLabels.xAxis.showOnlyAtModulo')) {
        finalConfig.style.layout.dataLabels.xAxis.showOnlyAtModulo = props.config.style.layout.dataLabels.xAxis.showOnlyAtModulo;
    } else {
        finalConfig.style.layout.dataLabels.xAxis.showOnlyAtModulo = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.tooltip.show;
}, { deep: true });

watch(() => props.dataset, () => {
    prepareChart()
}, { deep: true })

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `heatmap__${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-heatmap',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.tooltip.show
});

const breakpoint = computed(() => {
    return FINAL_CONFIG.value.table.responsiveBreakpoint
});

const tableObserver = shallowRef(null);

function observeTable() {
    if (tableObserver.value) {
        tableObserver.value.disconnect();
    }
    tableObserver.value = new ResizeObserver((entries) => {
        entries.forEach(entry => {
            isResponsive.value = entry.contentRect.width < breakpoint.value;
        });
    });
    tableObserver.value.observe(tableContainer.value);
}

onMounted(prepareChart);
onBeforeUnmount(() => {
    if (tableObserver.value) {
        tableObserver.value.disconnect();
    }
})

function prepareChart() {
    observeTable()
}

const maxX = computed(() => {
    return Math.max(...props.dataset.flatMap(el => (el.values || []).length));
});

const svg = computed(() => {
    const height = FINAL_CONFIG.value.style.layout.padding.top + FINAL_CONFIG.value.style.layout.padding.bottom + (props.dataset.length * FINAL_CONFIG.value.style.layout.cells.height);
    const width= FINAL_CONFIG.value.style.layout.padding.left + FINAL_CONFIG.value.style.layout.padding.right + ((maxX.value < props.dataset.length ? props.dataset.length : maxX.value) * FINAL_CONFIG.value.style.layout.cells.height);
    const heightWithLegend = height + (FINAL_CONFIG.value.style.legend.show ? (FINAL_CONFIG.value.style.legend.position === 'right' ? 0 : ((FINAL_CONFIG.value.style.layout.cells.height * 2))) : 0)

    return {
        height,
        heightWithLegend,
        width
    }
});

const legendPosition = computed(() => {
    return FINAL_CONFIG.value.style.legend.position;
})

const drawingArea = computed(() => {
    return {
        top: FINAL_CONFIG.value.style.layout.padding.top,
        left: FINAL_CONFIG.value.style.layout.padding.left,
        right: svg.value.width - FINAL_CONFIG.value.style.layout.padding.right - (legendPosition.value === "right" && FINAL_CONFIG.value.style.legend.show ? 92 : 0),
        bottom: svg.value.height - FINAL_CONFIG.value.style.layout.padding.bottom,
        height: svg.value.height - FINAL_CONFIG.value.style.layout.padding.top - FINAL_CONFIG.value.style.layout.padding.bottom,
        width: svg.value.width - FINAL_CONFIG.value.style.layout.padding.right - FINAL_CONFIG.value.style.layout.padding.left - (legendPosition.value === "right" && FINAL_CONFIG.value.style.legend.show ? 92 : 0)
    }
});

const sideLegendHeight = computed(() => {
    return cellSize.value.height * props.dataset.length
})


const maxValue = computed(() => {
    return Math.max(...props.dataset.flatMap(el => el.values));
});

const minValue = computed(() => {
    return Math.min(...props.dataset.flatMap(el => el.values));
});

const average = computed(() => {
    const allValues = props.dataset.flatMap(el => el.values);
    const sum = allValues.reduce((a,b) => a + b, 0);
    return sum / allValues.length;
});

const cellSize = computed(() => {
    return {
        width: (drawingArea.value.width / maxX.value),
        height: (drawingArea.value.width / (maxX.value < props.dataset.length ? props.dataset.length : maxX.value))
    }
});

const dataLabels = computed(() => {
    const yLabels = FINAL_CONFIG.value.style.layout.dataLabels.yAxis.values.length ? FINAL_CONFIG.value.style.layout.dataLabels.yAxis.values : props.dataset.map(ds => ds.name);
    const xLabels = FINAL_CONFIG.value.style.layout.dataLabels.xAxis.values;
    const _yTotals = props.dataset.map(ds => ds.values.reduce((a, b) => a + b, 0))
    const maxYTotal = Math.max(..._yTotals);
    const minYTotal = Math.min(..._yTotals);

    const _xTotals = []

    for (let i = 0; i < maxX.value; i += 1) {
        _xTotals.push(props.dataset.map(ds => ds.values[i] || 0).reduce((a, b) => a + b, 0))
    }

    const maxXTotal = Math.max(..._xTotals);
    const minXTotal = Math.min(..._xTotals);

    return {
        yTotals: _yTotals.map(rowTotal => {
            const proportion = isNaN(rowTotal / maxYTotal) ? 0 : rowTotal / maxYTotal;
            return {
                total: rowTotal,
                proportion,
                color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minYTotal, maxYTotal, rowTotal)
            }
        }),
        xTotals: _xTotals.map(columnTotal => {
            const proportion = isNaN(columnTotal / maxXTotal) ? 0 : columnTotal / maxXTotal;
            return {
                total: columnTotal,
                proportion,
                color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minXTotal, maxXTotal, columnTotal)
            }
        }),
        yLabels,
        xLabels: xLabels.slice(0, maxX.value)
    }
});

const mutableDataset = computed(() => {
    props.dataset.forEach((ds, i) => {
        getMissingDatasetAttributes({
            datasetObject: ds,
            requiredAttributes: ['values']
        }) .forEach(_ => {
            error({
                componentName: 'VueUiHeatmap',
                type: 'datasetSerieAttribute',
                property: 'values',
                index: i
            })
        })
    });

    return props.dataset.map(ds => {
        return {
            ...ds,
            temperatures: (ds.values || []).map((v, i) => {
                if (v >= average.value) {
                    return {
                        side: "up",
                        color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, v),
                        ratio: Math.abs((Math.abs(v - average.value) / Math.abs(maxValue.value - average.value))) > 1 ? 1 : Math.abs((Math.abs(v - average.value) / Math.abs(maxValue.value - average.value))),
                        value: v,
                        yAxisName: ds.name,
                        xAxisName: dataLabels.value.xLabels[i],
                        id: `vue-data-ui-heatmap-cell-${createUid()}`
                    }
                } else {
                    return {
                        side: "down",
                        ratio: Math.abs(1 - (Math.abs(v) / Math.abs(average.value))) > 1 ? 1 : Math.abs(1 - (Math.abs(v) / Math.abs(average.value))),
                        color: interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, v),
                        value: v,
                        yAxisName: ds.name,
                        xAxisName: dataLabels.value.xLabels[i],
                        id: `vue-data-ui-heatmap-cell-${createUid()}`
                    }
                }
            })
        }
    })
});

const hoveredValue = ref(null);
const dataTooltipSlot = ref(null);

function useTooltip(datapoint, seriesIndex, x, y) {
    selectedClone.value = { x, y };
    const { value, yAxisName, xAxisName, id } = datapoint;
    hoveredCell.value = id;
    hoveredValue.value = value;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        series: mutableDataset.value,
        config: FINAL_CONFIG.value
    }

    isTooltip.value = true;
    let html = "";

    const customFormat = FINAL_CONFIG.value.style.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint,
            seriesIndex,
            series: mutableDataset.value,
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            datapoint,
            seriesIndex,
            series: mutableDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        html += `<div data-cy="heatmap-tootlip-name">${yAxisName} ${xAxisName ? `${xAxisName}` : ''}</div>`;
        html += `<div data-cy="heatmap-tooltip-value" style="margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor};font-weight:bold;display:flex;flex-direction:row;gap:12px;align-items:center;justify-content:center"><span style="color:${interpolateColorHex(FINAL_CONFIG.value.style.layout.cells.colors.cold, FINAL_CONFIG.value.style.layout.cells.colors.hot, minValue.value, maxValue.value, value)}">⬤</span><span>${isNaN(value) ? "-" : applyDataLabel(
            FINAL_CONFIG.value.style.layout.cells.value.formatter,
            value,
            dataLabel({
                p:FINAL_CONFIG.value.style.layout.dataLabels.prefix, 
                v: value, 
                s: FINAL_CONFIG.value.style.layout.dataLabels.suffix, 
                r:FINAL_CONFIG.value.style.tooltip.roundingValue 
            }),
            { datapoint, seriesIndex }
        )}</span></div>`
        tooltipContent.value = `<div style="font-size:${FINAL_CONFIG.value.style.tooltip.fontSize}px">${html}</div>`;
    }
}

const sideLegendIndicatorY = computed(() => {
    return drawingArea.value.top + (sideLegendHeight.value * (1 - hoveredValue.value / maxValue.value))
});

const bottomLegendIndicatorX = computed(() => {
    return drawingArea.value.left + ((svg.value.width - drawingArea.value.left - FINAL_CONFIG.value.style.layout.padding.right) * (hoveredValue.value / maxValue.value))
});

function getRowTotal(index) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.layout.cells.value.formatter,
        dataLabels.value.yTotals[index].total,
        dataLabel({
            p: FINAL_CONFIG.value.style.layout.dataLabels.prefix,
            v: dataLabels.value.yTotals[index].total,
            s: FINAL_CONFIG.value.style.layout.dataLabels.suffix,
            r: FINAL_CONFIG.value.style.layout.cells.value.roundingValue
        }),
        { datapoint: dataLabels.value.yTotals[index], rowIndex: index }
    )
}

function getcolumnTotal(index) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.layout.cells.value.formatter,
        dataLabels.value.xTotals[index].total,
        dataLabel({
            p: FINAL_CONFIG.value.style.layout.dataLabels.prefix,
            v: dataLabels.value.xTotals[index].total,
            s: FINAL_CONFIG.value.style.layout.dataLabels.suffix,
            r: FINAL_CONFIG.value.style.layout.cells.value.roundingValue
        }),
        { datapoint: dataLabels.value.xTotals[index], colIndex: index }
    )
}

const table = computed(() => {
    const head = props.dataset.map(ds => {
        return {
            name: ds.name,
        }
    });
    const body = props.dataset.map(ds => ds.values);
    return { head, body };
});


function generateCsv() {
    nextTick(() => {
        const labels = ["", ...props.dataset.map((ds,i) => {
            return ds.name
        })];

        const values = [];

        for (let i = 0; i < dataLabels.value.xLabels.length; i += 1) {
            const row = [dataLabels.value.xLabels[i]];
            for (let j = 0; j < props.dataset.length; j += 1) {
                row.push([props.dataset[j].values[i]])
            }
            values.push(row)
        }

        const tableXls = [[FINAL_CONFIG.value.style.title.text],[FINAL_CONFIG.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({csvContent, title: FINAL_CONFIG.value.style.title.text || "vue-ui-heatmap"})
    });
}


const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function selectDatapoint(cell) {
    emit('selectDatapoint', cell);
}

defineExpose({
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
});

</script>

<template>
    <div ref="heatmapChart" :class="`vue-ui-heatmap ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.backgroundColor}`" :id="`heatmap__${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div v-if="FINAL_CONFIG.style.title.text" :style="`width:100%;background:transparent`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'heatmap-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'heatmap-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    },
                }"
            />
        </div>
        
        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="heatmapChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionCsv v-if="$slots.optionCsv">
                <slot name="optionCsv" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            v-if="isDataset"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :viewBox="`0 0 ${svg.width} ${svg.heightWithLegend}`" :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width"
                :height="svg.heightWithLegend"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <template v-if="FINAL_CONFIG.style.layout.cells.columnTotal.color.show">
                <rect 
                    v-for="(col, i) in dataLabels.xTotals"
                    :x="drawingArea.left + cellSize.width * i + (FINAL_CONFIG.style.layout.cells.spacing / 2) + (FINAL_CONFIG.style.layout.cells.rowTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)"
                    :y="drawingArea.top - cellSize.height / 3 - FINAL_CONFIG.style.layout.cells.spacing"
                    :height="cellSize.height / 3"
                    :width="cellSize.width - FINAL_CONFIG.style.layout.cells.spacing"
                    :fill="FINAL_CONFIG.style.layout.cells.colors.underlayer"
                    :stroke="FINAL_CONFIG.style.backgroundColor"
                    :stroke-width="FINAL_CONFIG.style.layout.cells.spacing"
                />
                <rect 
                    v-for="(col, i) in dataLabels.xTotals"
                    :x="drawingArea.left + cellSize.width * i + (FINAL_CONFIG.style.layout.cells.spacing / 2) + (FINAL_CONFIG.style.layout.cells.rowTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)"
                    :y="drawingArea.top - cellSize.height / 3 - FINAL_CONFIG.style.layout.cells.spacing"
                    :height="cellSize.height / 3"
                    :width="cellSize.width - FINAL_CONFIG.style.layout.cells.spacing"
                    :fill="col.color"
                    :stroke="FINAL_CONFIG.style.backgroundColor"
                    :stroke-width="FINAL_CONFIG.style.layout.cells.spacing"
                />
            </template>

            <g v-for="(serie, i) in mutableDataset">
                <g v-for="(cell, j) in serie.temperatures">
                    <rect
                        data-cy="cell-underlayer"
                        :x="drawingArea.left + cellSize.width * j + (FINAL_CONFIG.style.layout.cells.spacing / 2) + (FINAL_CONFIG.style.layout.cells.rowTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)"
                        :y="drawingArea.top + cellSize.height * i + (FINAL_CONFIG.style.layout.cells.spacing / 2)"
                        :width="cellSize.width - FINAL_CONFIG.style.layout.cells.spacing"
                        :height="cellSize.height - FINAL_CONFIG.style.layout.cells.spacing"
                        :fill="FINAL_CONFIG.style.layout.cells.colors.underlayer"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.cells.spacing"
                    />
                    <rect
                        data-cy="cell"
                        :x="drawingArea.left + cellSize.width * j + (FINAL_CONFIG.style.layout.cells.spacing / 2) + (FINAL_CONFIG.style.layout.cells.rowTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)"
                        :y="drawingArea.top + cellSize.height * i + (FINAL_CONFIG.style.layout.cells.spacing / 2)"
                        :width="cellSize.width - FINAL_CONFIG.style.layout.cells.spacing"
                        :height="cellSize.height - FINAL_CONFIG.style.layout.cells.spacing"
                        :fill="cell.color"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.cells.spacing"
                    />
                    <text 
                        data-cy="cell-label"
                        v-if="FINAL_CONFIG.style.layout.cells.value.show"
                        text-anchor="middle"
                        :font-size="FINAL_CONFIG.style.layout.cells.value.fontSize"
                        :font-weight="FINAL_CONFIG.style.layout.cells.value.bold ? 'bold': 'normal'"
                        :fill="adaptColorToBackground(cell.color)"
                        :x="(drawingArea.left + cellSize.width * j) + (cellSize.width / 2) + + (FINAL_CONFIG.style.layout.cells.rowTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)"
                        :y="(drawingArea.top + cellSize.height * i) + (cellSize.height / 2) + FINAL_CONFIG.style.layout.cells.value.fontSize / 3"
                    >
                        {{ applyDataLabel(
                            FINAL_CONFIG.style.layout.cells.value.formatter,
                            cell.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                                v: cell.value,
                                s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                                r: FINAL_CONFIG.style.layout.cells.value.roundingValue
                            }),
                            { datapoint: cell }
                        )
                        }}
                    </text>
                </g>
                <g v-for="(cell, j) in serie.temperatures">
                    <!-- TOOLTIP TRAPS -->
                    <rect
                        data-cy="tooltip-trap"
                        :x="drawingArea.left + cellSize.width * j + (FINAL_CONFIG.style.layout.cells.rowTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)"
                        :y="drawingArea.top + cellSize.height * i"
                        :width="cellSize.width"
                        :height="cellSize.height"
                        fill="transparent"
                        stroke="none"
                        @mouseover="useTooltip(cell, i, drawingArea.left + cellSize.width * j, drawingArea.top + cellSize.height * i)"
                        @mouseout="isTooltip = false; hoveredCell = undefined; hoveredValue = null; selectedClone = null"
                        @click="() => selectDatapoint(cell)"
                    />
                </g>
                <g v-if="FINAL_CONFIG.style.layout.dataLabels.yAxis.show">
                    <text
                        data-cy="axis-y-label"
                        class="vue-ui-heatmap-row-name"
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                        :x="drawingArea.left + FINAL_CONFIG.style.layout.dataLabels.yAxis.offsetX - 6"
                        :y="drawingArea.top + (cellSize.height * i) + cellSize.height / 2 + FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize / 3 + FINAL_CONFIG.style.layout.dataLabels.yAxis.offsetY - (FINAL_CONFIG.style.layout.cells.rowTotal.value.show ? FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize / 1.5 : 0)"
                        text-anchor="end"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                    >
                        {{ dataLabels.yLabels[i] }}
                    </text>
                    <text
                        class="vue-ui-heatmap-row-total"
                        v-if="FINAL_CONFIG.style.layout.cells.rowTotal.value.show"
                        data-cy="axis-y-label"
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                        :x="drawingArea.left + FINAL_CONFIG.style.layout.dataLabels.yAxis.offsetX - 6"
                        :y="drawingArea.top + (cellSize.height * i) + cellSize.height / 2 + FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize + FINAL_CONFIG.style.layout.dataLabels.yAxis.offsetY"
                        text-anchor="end"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                    >
                        {{ getRowTotal(i) }}
                    </text>
                </g>

                <g v-if="FINAL_CONFIG.style.layout.cells.rowTotal.color.show">
                    <rect 
                        :x="drawingArea.left"
                        :y="drawingArea.top + (cellSize.height * i)"
                        :width="cellSize.height / 3"
                        :height="cellSize.height - FINAL_CONFIG.style.layout.cells.spacing"
                        :fill="FINAL_CONFIG.style.layout.cells.colors.underlayer"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.cells.spacing"
                    />
                    <rect 
                        :x="drawingArea.left"
                        :y="drawingArea.top + (cellSize.height * i) + FINAL_CONFIG.style.layout.cells.spacing / 2"
                        :width="cellSize.height / 3"
                        :height="cellSize.height - FINAL_CONFIG.style.layout.cells.spacing"
                        :fill="dataLabels.yTotals[i].color"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.cells.spacing"
                    />
                </g>

            </g>
            <g v-if="FINAL_CONFIG.style.layout.dataLabels.xAxis.show">
                <template v-for="(label, i) in dataLabels.xLabels">
                    <text
                        class="vue-ui-heatmap-col-name"
                        data-cy="axis-x-label"
                        v-if="!FINAL_CONFIG.style.layout.dataLabels.xAxis.showOnlyAtModulo || (FINAL_CONFIG.style.layout.dataLabels.xAxis.showOnlyAtModulo && i % FINAL_CONFIG.style.layout.dataLabels.xAxis.showOnlyAtModulo === 0)"
                        :text-anchor="FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation === 0 ? 'middle' : FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation < 0 ? 'start' : 'end'"
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                        :transform="`translate(${drawingArea.left + cellSize.width / 2 + (drawingArea.width / dataLabels.xLabels.length * i) + FINAL_CONFIG.style.layout.dataLabels.xAxis.offsetX + (FINAL_CONFIG.style.layout.cells.rowTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)}, ${drawingArea.top + FINAL_CONFIG.style.layout.dataLabels.xAxis.offsetY - 6 - (FINAL_CONFIG.style.layout.cells.columnTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)}), rotate(${FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation})`"
                    >
                        {{ label }}
                    </text>
                </template>
            </g>

            <template v-if="FINAL_CONFIG.style.layout.cells.columnTotal.value.show">
                <text
                    class="vue-ui-heatmap-col-total"
                    v-for="(_, i) in dataLabels.xLabels"
                    :text-anchor="FINAL_CONFIG.style.layout.cells.columnTotal.value.rotation === 0 ? 'middle' : FINAL_CONFIG.style.layout.cells.columnTotal.value.rotation < 0 ? 'end' : 'start'"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                    :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                    :transform="`translate(${drawingArea.left + cellSize.width / 2 + (drawingArea.width / dataLabels.xLabels.length * i) + FINAL_CONFIG.style.layout.dataLabels.xAxis.offsetX + FINAL_CONFIG.style.layout.cells.columnTotal.value.offsetX + (FINAL_CONFIG.style.layout.cells.rowTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)}, ${((cellSize.height + FINAL_CONFIG.style.layout.cells.spacing ) * (dataset.length + 1)) + FINAL_CONFIG.style.layout.cells.columnTotal.value.offsetY}), rotate(${FINAL_CONFIG.style.layout.cells.columnTotal.value.rotation})`"
                >
                    {{ getcolumnTotal(i) }}
                </text>
                </template>

            <!-- BORDER FOR SELECTED RECT, PAINTED LAST -->
            <g v-if="selectedClone">
                <rect
                    data-cy="cell-selected"
                    style="pointer-events: none;"
                    :x="selectedClone.x - ((FINAL_CONFIG.style.layout.cells.selected.border) / 2) + FINAL_CONFIG.style.layout.cells.spacing + (FINAL_CONFIG.style.layout.cells.rowTotal.color.show ? (cellSize.height / 3 + FINAL_CONFIG.style.layout.cells.spacing) : 0)"
                    :y="selectedClone.y - (FINAL_CONFIG.style.layout.cells.selected.border / 2) + FINAL_CONFIG.style.layout.cells.spacing"
                    :width="cellSize.width - FINAL_CONFIG.style.layout.cells.spacing + FINAL_CONFIG.style.layout.cells.selected.border - (FINAL_CONFIG.style.layout.cells.spacing)"
                    :height="cellSize.height - FINAL_CONFIG.style.layout.cells.spacing + FINAL_CONFIG.style.layout.cells.selected.border - (FINAL_CONFIG.style.layout.cells.spacing)"
                    fill="transparent"
                    :stroke="FINAL_CONFIG.style.layout.cells.selected.color"
                    :stroke-width="FINAL_CONFIG.style.layout.cells.selected.border"
                    :rx="1"
                />
            </g>

            <!-- LEGEND RIGHT -->
            <g v-if="FINAL_CONFIG.style.legend.show && legendPosition === 'right'">
                <defs>
                    <linearGradient :id="`colorScaleVertical_${uid}`" x2="0%" y2="100%" >
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.layout.cells.colors.hot"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.layout.cells.colors.cold"/>
                    </linearGradient>
                </defs>
                <text
                    data-cy="legend-label-max"
                    :x="drawingArea.right + 36 + 18"
                    :y="drawingArea.top - FINAL_CONFIG.style.legend.fontSize * 1.5"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.legend.fontSize * 2"
                    :fill="FINAL_CONFIG.style.legend.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.cells.value.formatter,
                        checkNaN(maxValue),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                            v: checkNaN(maxValue),
                            s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                            r: FINAL_CONFIG.style.legend.roundingValue
                        })) 
                    }}
                </text>
                <rect
                    data-cy="legend-pill"
                    :x="drawingArea.right + 36"
                    :y="drawingArea.top"
                    :width="36"
                    :height="sideLegendHeight"
                    :rx="FINAL_CONFIG.style.legend.scaleBorderRadius"
                    :fill="`url(#colorScaleVertical_${uid})`"
                />
                <text
                    data-cy="legend-label-min"
                    :x="drawingArea.right + 36 + 18"
                    :y="drawingArea.top + sideLegendHeight + FINAL_CONFIG.style.legend.fontSize * 2.5"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.legend.fontSize * 2"
                    :fill="FINAL_CONFIG.style.legend.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.cells.value.formatter,
                        checkNaN(minValue),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                            v: checkNaN(minValue),
                            s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                            r: FINAL_CONFIG.style.legend.roundingValue
                        })) 
                    }}
                </text>
                <line
                    data-cy="legend-indicator-line"
                    v-if="hoveredValue !== null" 
                    :stroke="adaptColorToBackground(dataTooltipSlot.datapoint.color)" 
                    stroke-width="2" 
                    :x1="drawingArea.right + 36" 
                    :x2="drawingArea.right + 72" 
                    :y1="sideLegendIndicatorY" 
                    :y2="sideLegendIndicatorY" 
                />
                <path
                    data-cy="legend-indicator-triangle"
                    v-if="hoveredValue !== null" 
                    :fill="FINAL_CONFIG.style.color" 
                    stroke="none" 
                    :d="`M ${drawingArea.right + 36},${sideLegendIndicatorY} ${drawingArea.right + 26},${sideLegendIndicatorY - 8} ${drawingArea.right + 26},${sideLegendIndicatorY + 8}z`" 
                />
            </g>

            <!-- LEGEND BOTTOM -->
            <g v-if="FINAL_CONFIG.style.legend.show && legendPosition === 'bottom'">
                <defs>
                    <linearGradient id="colorScaleHorizontal" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.layout.cells.colors.cold"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.layout.cells.colors.hot"/>
                    </linearGradient>
                </defs>
                <rect
                    data-cy="legend-pill"
                    :x="drawingArea.left"
                    :y="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height"
                    :width="svg.width - drawingArea.left - FINAL_CONFIG.style.layout.padding.right"
                    :height="FINAL_CONFIG.style.layout.cells.height"
                    :rx="FINAL_CONFIG.style.legend.scaleBorderRadius > FINAL_CONFIG.style.layout.cells.height / 2 ? FINAL_CONFIG.style.layout.cells.height / 2 : FINAL_CONFIG.style.legend.scaleBorderRadius"
                    fill="url(#colorScaleHorizontal)"
                />
                <text
                    data-cy="legend-label-min"
                    :x="drawingArea.left"
                    :y="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height * 2 + FINAL_CONFIG.style.legend.fontSize * 2"
                    text-anchor="start"
                    :font-size="FINAL_CONFIG.style.legend.fontSize * 2"
                    :fill="FINAL_CONFIG.style.legend.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.cells.value.formatter,
                        checkNaN(minValue),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                            v: checkNaN(minValue),
                            s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                            r: FINAL_CONFIG.style.legend.roundingValue
                        })) 
                    }}
                </text>
                <text
                    data-cy="legend-label-max"
                    :x="drawingArea.right"
                    :y="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height * 2 + FINAL_CONFIG.style.legend.fontSize * 2"
                    text-anchor="end"
                    :font-size="FINAL_CONFIG.style.legend.fontSize * 2"
                    :fill="FINAL_CONFIG.style.legend.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.cells.value.formatter,
                        checkNaN(maxValue),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.dataLabels.prefix,
                            v: checkNaN(maxValue),
                            s: FINAL_CONFIG.style.layout.dataLabels.suffix,
                            r: FINAL_CONFIG.style.legend.roundingValue
                        })) 
                    }}
                </text>
                <line
                    data-cy="legend-indicator-line"
                    v-if="hoveredValue !== null" 
                    :stroke="adaptColorToBackground(dataTooltipSlot.datapoint.color)" 
                    stroke-width="2" 
                    :x1="bottomLegendIndicatorX" 
                    :x2="bottomLegendIndicatorX" 
                    :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height" 
                    :y2="drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height * 2" 
                />
                <path
                    data-cy="legend-indicator-triangle"
                    v-if="hoveredValue !== null" 
                    :fill="FINAL_CONFIG.style.color" 
                    stroke="none" 
                    :d="`M ${bottomLegendIndicatorX},${drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height} ${bottomLegendIndicatorX - 12},${drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height - 20} ${bottomLegendIndicatorX + 12},${drawingArea.bottom + FINAL_CONFIG.style.layout.cells.height - 20}z`" 
                />
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'heatmap',
                style: {
                    backgroundColor: FINAL_CONFIG.style.backgroundColor,
                    heatmap: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.tooltip.position"
            :offsetY="FINAL_CONFIG.style.tooltip.offsetY"
            :parent="heatmapChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.style.tooltip.customFormat && typeof FINAL_CONFIG.style.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>
        
        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.backgroundColor,
                color: FINAL_CONFIG.style.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.backgroundColor,
                color: FINAL_CONFIG.style.color,
            }
        }">
            <template #content>
                <div ref="tableContainer" class="vue-ui-heatmap-table atom-data-table">
                    <div :style="`width:100%;overflow-x:auto;padding-top:36px;position:relative`" :class="{'vue-ui-responsive' : isResponsive}">
                        <div data-cy="data-table-close" role="button" tabindex="0" :style="`width:32px; position: absolute; top: 0; left:4px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px; width: 32px; cursor:pointer; background:${FINAL_CONFIG.table.th.backgroundColor};`" @click="mutableConfig.showTable = false" @keypress.enter="mutableConfig.showTable = false">
                            <BaseIcon name="close" :stroke="FINAL_CONFIG.table.th.color" :stroke-width="2" />
                        </div> 
                        <table class="vue-ui-data-table">
                            <caption :style="`backgroundColor:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`">
                                {{ FINAL_CONFIG.style.title.text }} <span v-if="FINAL_CONFIG.style.title.subtitle.text">{{  FINAL_CONFIG.style.title.subtitle.text }}</span>
                            </caption>
                            <thead>
                                <tr role="row" :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color}`">
                                    <th :style="`outline:${FINAL_CONFIG.table.th.outline};padding-right:6px`"></th>
                                    <th align="right" :style="`outline:${FINAL_CONFIG.table.th.outline};padding-right:6px`" v-for="(th,i) in dataset" :data-cy="`heatmap-table-col-name-${i}`">
                                        {{ th.name }}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr role="row" v-for="(tr, i) in dataLabels.xLabels" :class="{'vue-ui-data-table__tbody__row' : true, 'vue-ui-data-table__tbody__row-even': i % 2 === 0, 'vue-ui-data-table__tbody__row-odd': i % 2 !== 0}" :style="`background:${FINAL_CONFIG.table.td.backgroundColor};color:${FINAL_CONFIG.table.td.color}`">
                                    <td :data-cell="FINAL_CONFIG.table.colNames.xAxis" class="vue-ui-data-table__tbody__td"  :data-cy="`heatmap-table-row-name-${i}`" :style="`outline:${FINAL_CONFIG.table.td.outline}`">
                                        <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                            {{ tr }}
                                        </div>
                                    </td>
                                    <td class="vue-ui-data-table__tbody__td"  v-for="(trData, j) in dataset" :data-cell="dataset[j].name" :style="`outline:${FINAL_CONFIG.table.td.outline}`">
                                        <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                            {{ isNaN(trData.values[i]) ? '-' : dataLabel({p:FINAL_CONFIG.style.layout.dataLabels.prefix, v:trData.values[i], s: FINAL_CONFIG.style.layout.dataLabels.suffix, r: FINAL_CONFIG.table.td.roundingValue}) }}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>
        </Accordion>
     </div> 
</template>

<style scoped lang="scss">
@import "../vue-data-ui.css";

.vue-ui-heatmap *{
    transition: unset;
}
.vue-ui-heatmap {
    user-select: none;
    position: relative;
}
.vue-ui-heatmap .vue-ui-heatmap-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-heatmap-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-heatmap-legend-item {
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}

/** */
.vue-ui-heatmap-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

.vue-ui-heatmap-table {
    width: 100%;
    max-height: 300px;
    overflow: auto;
    margin-top: 24px;
    position: relative;
}

.vue-ui-data-table thead {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

table {
    width: 100%;
    padding: 1rem;
    border-collapse:collapse;
}

caption,
th,
td {
    padding: 0.5rem;
    font-variant-numeric: tabular-nums;
}

caption {
    font-size: 1.3rem;
    font-weight: 700;
}

.vue-ui-responsive {
    th {
        display: none;
    }
    td {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem 1rem;
        outline: none !important;
        text-align: left;
    }
    tr {
        outline: v-bind(tdo);
    }

    td:first-child {
        padding-top: 1rem;
    }

    td:last-child {
        padding-bottom: 1rem;
    }

    td::before {
        content: attr(data-cell) ": ";
        font-weight: 700;
        text-transform: capitalize;
    }
}
</style>
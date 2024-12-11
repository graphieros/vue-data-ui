<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import {
    applyDataLabel,
    calcMedian, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createUid, 
    dataLabel, 
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    palette,
    themePalettes,
} from "../lib";
import SparkLine from "./vue-ui-sparkline.vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import UserOptions from "../atoms/UserOptions.vue";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";

const { vue_ui_table_sparkline: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Array,
        default() {
            return [];
        },
    },
});

const uid = ref(createUid());
const step = ref(0);
const sparkStep = ref(0);
const TD = ref(null)

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_table_sparkline[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    sparkStep.value += 1;
}, { deep: true });

watch(() => props.dataset, (_) => {
    mutableDataset.value = datasetWithOrders.value;
    sparkStep.value += 1;
}, { deep: true })

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `table_${uid.value}`,
    fileName: FINAL_CONFIG.value.title.text || 'vue-ui-table-sparkline'
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const tableContainer = ref(null);
const isResponsive = ref(false);
const breakpoint = computed(() => {
    return FINAL_CONFIG.value.responsiveBreakpoint;
});

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiTableSparkline',
            type: 'dataset'
        })
    }

    const observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
            isResponsive.value = entry.contentRect.width < breakpoint.value;
        });
    });
    if (tableContainer.value) {
        observer.observe(tableContainer.value);
    }
}

const computedDataset = computed(() => {
    props.dataset.forEach((ds, i) => {
        getMissingDatasetAttributes({
            datasetObject: ds,
            requiredAttributes: ['name', 'values']
        }).forEach(attr => {
            error({
                componentName: 'VueUiTableSparkline',
                type: 'datasetSerieAttribute',
                property: attr,
                index: i
            });
        });
    });

    return props.dataset.map((ds, i) => {
        const cleanValues = (ds.values || []).map((v) => (isNaN(v) ? 0 : v ?? 0));
        const sum = cleanValues.reduce((a, b) => a + b, 0);
        return {
            ...ds,
            values: ds.values || [],
            color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            sum,
            average: sum / cleanValues.length,
            median: calcMedian(cleanValues),
            sparklineDataset: cleanValues.map((v, i) => {
                return {
                    period: FINAL_CONFIG.value.colNames[i] || `col ${i}`,
                    value: v || 0,
                };
            }),
        };
    });
});

function addOrdersAttribute(dataset) {
    const combinedValues = (dataset[0].values || []).map((_, index) =>
        dataset.map((series) => (series.values[index] || []))
    );

    const orders = combinedValues.map((values) =>
        values
            .map((value, index) => [value, index])
            .sort((a, b) => b[0] - a[0])
            .map((item) => item[1])
    );

    const result = dataset.map((series, index) => ({
        ...series,
        values: series.values || [],
        orders: orders[index],
    }));

    return result;
}

const datasetWithOrders = computed(() => {
    return addOrdersAttribute(computedDataset.value);
});

const mutableDataset = ref(datasetWithOrders.value)

const maxSeries = computed(() =>{
    return Math.max(...mutableDataset.value.map(ds => (ds.values || []).length))
})

const sortIndex = ref(undefined)
const isSorting = ref(false);
const currentSortingIndex = ref(undefined);
const currentSortOrder = ref(-1);

function restoreOrder() {
    isSorting.value = false;
    currentSortingIndex.value = undefined;
    currentSortOrder.value = -1;
    mutableDataset.value = datasetWithOrders.value;
}

function orderDatasetByIndex(index) {
    isSorting.value = true;
    currentSortingIndex.value = index;
    const combinedValues = datasetWithOrders.value.map(series => (series.values[index] || []));
    const sortOrder = sortIndex.value === index ? 1 : -1;
    currentSortOrder.value = sortOrder;
    if(index === sortIndex.value) {
        sortIndex.value = undefined
    }else {
        sortIndex.value = index;
    } 

    const sortedIndices = combinedValues
        .map((value, i) => [i, value])
        .sort((a, b) => sortOrder * (b[1] - a[1]))
        .map(item => item[0]);

    const sortedDataset = sortedIndices.map(i => datasetWithOrders.value[i]);

    mutableDataset.value = sortedDataset;
    sparkStep.value += 1
}

const maxSeriesLength = computed(() => {
    return Math.max(...props.dataset.map(ds => (ds.values || []).length))
})

const colNames = computed(() => {
    let cn = FINAL_CONFIG.value.colNames;
    if(!cn.length) {
        for(let i = 0; i < maxSeriesLength.value; i += 1) {
            cn.push(`col ${i+1}`)
        }
    }

    if (FINAL_CONFIG.value.showTotal) {
        cn = [...cn, FINAL_CONFIG.value.translations.total];
    }

    let res;
    if (FINAL_CONFIG.value.showAverage && FINAL_CONFIG.value.showMedian) {
        res = [
            ...cn,
            FINAL_CONFIG.value.translations.average,
            FINAL_CONFIG.value.translations.median,
        ];
    } else if (FINAL_CONFIG.value.showAverage && !FINAL_CONFIG.value.showMedian) {
        res = [...cn, FINAL_CONFIG.value.translations.average];
    } else if (!FINAL_CONFIG.value.showAverage && FINAL_CONFIG.value.showMedian) {
        res = [...cn, FINAL_CONFIG.value.translations.median];
    } else {
        res = cn;
    }
    if (FINAL_CONFIG.value.showSparklines) {
        return [...res, FINAL_CONFIG.value.translations.chart];
    } else {
        return res;
    }
});

const selectedDataIndex = ref(undefined);
const selectedSerieIndex = ref(undefined);

function hoverSparkline({ dataIndex, serieIndex }) {
    selectedDataIndex.value = dataIndex;
    selectedSerieIndex.value = serieIndex;
    if (TD.value[dataIndex]) {
        TD.value[dataIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function generateCsv() {
    nextTick(() => {
        const thead = [FINAL_CONFIG.value.translations.serie].concat(colNames.value)
        const tbody = computedDataset.value.map((ds, i) => {
            return [
                [ds.name],
                ds.values,
                [ds.sum],
                [ds.average],
                [ds.median]
            ]
        });
        const t = [thead].concat(tbody)
        const csvContent = createCsvContent(t)
        downloadCsv({
            csvContent,
            title: FINAL_CONFIG.value.title.text || "vue-ui-table-sparkline"
        })
    })
}

defineExpose({
    generatePdf,
    generateImage,
    generateCsv,
    restoreOrder
})

</script>

<template>
    <div ref="tableContainer" :class="{ 'vue-ui-responsive': isResponsive }" style="overflow: hidden" :id="`table_${uid}`">

        <div style="overflow: auto" @pointerleave="selectedSerieIndex = undefined; selectedDataIndex = undefined">
            <table data-cy="vue-data-ui-table-sparkline" class="vue-ui-data-table"
                :style="{ fontFamily: FINAL_CONFIG.fontFamily, position: 'relative' }">
                <caption v-if="FINAL_CONFIG.title.text" :style="{ backgroundColor: FINAL_CONFIG.title.backgroundColor }">
                    <div :style="{
                        fontSize: `${FINAL_CONFIG.title.fontSize}px`,
                        fontWeight: FINAL_CONFIG.title.bold ? 'bold' : 'normal',
                        color: FINAL_CONFIG.title.color,
                        textAlign: FINAL_CONFIG.title.textAlign,
                    }">
                        {{ FINAL_CONFIG.title.text }}
                    </div>
                    <div v-if="FINAL_CONFIG.title.subtitle.text" :style="{
                        fontSize: `${FINAL_CONFIG.title.subtitle.fontSize}px`,
                        fontWeight: FINAL_CONFIG.title.subtitle.bold ? 'bold' : 'normal',
                        color: FINAL_CONFIG.title.subtitle.color,
                        textAlign: FINAL_CONFIG.title.textAlign,
                    }">
                        {{ FINAL_CONFIG.title.subtitle.text }}
                    </div>
                </caption>

                <thead style="z-index: 1;padding-right:24px">
                    <tr role="row" class="vue-ui-data-table__thead-row" :style="{
                        backgroundColor: FINAL_CONFIG.thead.backgroundColor,
                        color: FINAL_CONFIG.thead.color
                    }">
                        <th role="cell" :style="{
                            backgroundColor: FINAL_CONFIG.thead.backgroundColor,
                            outline: FINAL_CONFIG.thead.outline,
                            textAlign: FINAL_CONFIG.thead.textAlign,
                            fontWeight: FINAL_CONFIG.thead.bold ? 'bold' : 'normal',
                        }" class="sticky-col-first">
                            {{ FINAL_CONFIG.translations.serie }}
                        </th>
                        <th role="cell" v-for="(th, i) in colNames" :style="{
                            background: FINAL_CONFIG.thead.backgroundColor,
                            outline: FINAL_CONFIG.thead.outline,
                            textAlign: FINAL_CONFIG.thead.textAlign,
                            fontWeight: FINAL_CONFIG.thead.bold ? 'bold' : 'normal',
                            minWidth: i === colNames.length - 1 ? '150px' : '',
                            cursor: datasetWithOrders[0].values[i] !== undefined ? 'pointer' : 'default'
                        }" @click="() => orderDatasetByIndex(i)" :class="{'sticky-col': i === colNames.length - 1 && FINAL_CONFIG.showSparklines}" >
                            <div style="display: flex; flex-direction: row; gap: 3px; align-items:center">
                                <span>{{ th }}</span>
                                <BaseIcon :size="18" v-if="isSorting && i === currentSortingIndex && datasetWithOrders[0].values[i] !== undefined" :name="currentSortOrder === 1 ? 'sort' : 'sortReverse'" :stroke="FINAL_CONFIG.thead.color"/>
                            </div>
                            <UserOptions
                                ref="details"
                                :key="`user_option_${step}`"
                                v-if="FINAL_CONFIG.userOptions.show && i === colNames.length - 1"
                                :backgroundColor="FINAL_CONFIG.thead.backgroundColor"
                                :color="FINAL_CONFIG.thead.color"
                                :isPrinting="isPrinting"
                                :isImaging="isImaging"
                                :uid="uid"
                                :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
                                :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
                                :hasImg="FINAL_CONFIG.userOptions.buttons.img"
                                :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
                                :isFullscreen="isFullscreen"
                                :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
                                :chartElement="tableContainer"
                                :position="FINAL_CONFIG.userOptions.position"
                                @toggleFullscreen="toggleFullscreen"
                                @generatePdf="generatePdf"
                                @generateImage="generateImage"
                                @generateCsv="generateCsv"
                            >
                                <template #optionPdf v-if="$slots.optionPdf">
                                    <slot name="optionPdf" />
                                </template>
                                <template #optionCsv v-if="$slots.optionCsv">
                                    <slot name="optionCsv" />
                                </template>
                                <template #optionImg v-if="$slots.optionImg">
                                    <slot name="optionImg" />
                                </template>
                                <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                                    <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
                                </template>
                            </UserOptions>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr role="row" v-for="(tr, i) in mutableDataset" :style="{
                        backgroundColor: FINAL_CONFIG.tbody.backgroundColor,
                        color: FINAL_CONFIG.tbody.color,
                    }" :class="{'vue-ui-data-table__tbody__row' : true, 'vue-ui-data-table__tbody__row-even': i % 2 === 0, 'vue-ui-data-table__tbody__row-odd': i % 2 !== 0}">
                        <td role="cell" :style="{
                            backgroundColor: FINAL_CONFIG.tbody.backgroundColor,
                            border: FINAL_CONFIG.tbody.outline,
                            fontSize: `${FINAL_CONFIG.tbody.fontSize}px`,
                            fontWeight: FINAL_CONFIG.tbody.bold ? 'bold' : 'normal',
                            textAlign: FINAL_CONFIG.tbody.textAlign,
                        }" :data-cell="FINAL_CONFIG.translations.serie" class="vue-ui-data-table__tbody__td sticky-col-first">
                            <div dir="auto" style="display: flex; flex-direction: row; align-items: center; gap: 6px">
                                <span v-if="FINAL_CONFIG.tbody.showColorMarker" :style="{ color: tr.color }">⬤</span>
                                <span>{{ tr.name ?? "-" }}</span>
                            </div>
                        </td>
                        <td dir="auto" role="cell" v-for="(_, j) in maxSeries" ref="TD" :style="{
                            border: FINAL_CONFIG.tbody.outline,
                            fontSize: `${FINAL_CONFIG.tbody.fontSize}px`,
                            fontWeight: FINAL_CONFIG.tbody.bold ? 'bold' : 'normal',
                            textAlign: FINAL_CONFIG.tbody.textAlign,
                            background:
                                selectedDataIndex !== undefined &&
                                    j === selectedDataIndex 
                                    ? `${tr.color.length > 7 ? tr.color.slice(0,-2) : tr.color }33`
                                    : '',
                            borderRadius:
                                selectedDataIndex !== undefined &&
                                    selectedSerieIndex !== undefined &&
                                    j === selectedDataIndex &&
                                    selectedSerieIndex === i
                                    ? '3px'
                                    : '',
                        }" :data-cell="colNames[j]" class="vue-ui-data-table__tbody__td" @pointerenter="selectedSerieIndex = i; selectedDataIndex = j">
                            {{ [null, undefined].includes(tr.values[j]) ? '-' : applyDataLabel(
                                FINAL_CONFIG.formatter,
                                Number(tr.values[j]),
                                dataLabel({
                                    p: FINAL_CONFIG.prefix,
                                    v: Number(tr.values[j]),
                                    s: FINAL_CONFIG.suffix,
                                    r: FINAL_CONFIG.roundingValues
                                }),
                                { datapoint: tr, seriesIndex: i, datapointIndex: j }
                                )
                            }}
                        </td>
                        <td dir="auto" role="cell" v-if="FINAL_CONFIG.showTotal" :style="{
                            border: FINAL_CONFIG.tbody.outline,
                            fontSize: `${FINAL_CONFIG.tbody.fontSize}px`,
                            fontWeight: FINAL_CONFIG.tbody.bold ? 'bold' : 'normal',
                            textAlign: FINAL_CONFIG.tbody.textAlign,
                        }" :data-cell="FINAL_CONFIG.translations.total" class="vue-ui-data-table__tbody__td">
                            {{ applyDataLabel(
                                FINAL_CONFIG.formatter,
                                tr.sum,
                                dataLabel({
                                    p: FINAL_CONFIG.prefix,
                                    v: tr.sum,
                                    s: FINAL_CONFIG.suffix,
                                    r: FINAL_CONFIG.roundingTotal,
                                }),
                                { datapoint: tr.sum, seriesIndex: i }
                                )
                            }}
                        </td>
                        <td dir="auto" role="cell" v-if="FINAL_CONFIG.showAverage" :style="{
                            border: FINAL_CONFIG.tbody.outline,
                            fontSize: `${FINAL_CONFIG.tbody.fontSize}px`,
                            fontWeight: FINAL_CONFIG.tbody.bold ? 'bold' : 'normal',
                            textAlign: FINAL_CONFIG.tbody.textAlign,
                        }" :data-cell="FINAL_CONFIG.translations.average" class="vue-ui-data-table__tbody__td">
                            {{ applyDataLabel(
                                FINAL_CONFIG.formatter,
                                tr.average,
                                dataLabel({
                                    p: FINAL_CONFIG.prefix,
                                    v: tr.average,
                                    s: FINAL_CONFIG.suffix,
                                    r: FINAL_CONFIG.roundingAverage,
                                }),
                                { datapoint: tr.average, seriesIndex: i }
                                ) 
                            }}
                        </td>
                        <td dir="auto" role="cell" v-if="FINAL_CONFIG.showMedian" :style="{
                            border: FINAL_CONFIG.tbody.outline,
                            fontSize: `${FINAL_CONFIG.tbody.fontSize}px`,
                            fontWeight: FINAL_CONFIG.tbody.bold ? 'bold' : 'normal',
                            textAlign: FINAL_CONFIG.tbody.textAlign,
                        }" :data-cell="FINAL_CONFIG.translations.median" class="vue-ui-data-table__tbody__td">
                            {{ applyDataLabel(
                                FINAL_CONFIG.formatter,
                                tr.median,
                                dataLabel({
                                    p: FINAL_CONFIG.prefix,
                                    v: tr.median,
                                    s: FINAL_CONFIG.suffix,
                                    r: FINAL_CONFIG.roundingMedian,
                                }),
                                { datapoint: tr.median, seriesIndex: i }
                            )}}
                        </td>
                        <td role="cell" v-if="FINAL_CONFIG.showSparklines" :data-cell="FINAL_CONFIG.translations.chart" :style="{
                            border: FINAL_CONFIG.tbody.outline,
                            fontSize: `${FINAL_CONFIG.tbody.fontSize}px`,
                            fontWeight: FINAL_CONFIG.tbody.bold ? 'bold' : 'normal',
                            textAlign: FINAL_CONFIG.tbody.textAlign,
                            backgroundColor: FINAL_CONFIG.tbody.backgroundColor,
                        }" class="vue-ui-data-table__tbody__td sticky-col">
                            <SparkLine :key="`sparkline_${i}_${sparkStep}`" @hoverIndex="({ index }) => hoverSparkline({ dataIndex: index, serieIndex: i })
                                " :dataset="tr.sparklineDataset" :showInfo="false" :selectedIndex="selectedDataIndex" :config="{
                                type: FINAL_CONFIG.sparkline.type,
                                style: {
                                    backgroundColor: FINAL_CONFIG.tbody.backgroundColor,
                                    animation: {
                                        show: FINAL_CONFIG.sparkline.animation.show && !isPrinting && !isImaging,
                                        animationFrames: FINAL_CONFIG.sparkline.animation.animationFrames
                                    },
                                    line: {
                                        color: tr.color,
                                        smooth: FINAL_CONFIG.sparkline.smooth,
                                        strokeWidth: FINAL_CONFIG.sparkline.strokeWidth
                                    },
                                    bar: {
                                        color: tr.color
                                    },
                                    area: {
                                        color: tr.color,
                                        opacity: FINAL_CONFIG.sparkline.showArea ? 16 : 0,
                                        useGradient: FINAL_CONFIG.sparkline.useGradient,
                                    },
                                    verticalIndicator: {
                                        color: tr.color,
                                    },
                                    plot: {
                                        radius: 9,
                                        stroke: FINAL_CONFIG.tbody.backgroundColor,
                                        strokeWidth: 3,
                                    },
                                },
                            }" />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.vue-ui-data-table thead {
    position: sticky;
    top: 0;
    user-select: none;
}

table {
    width: 100%;
    padding: 1rem;
    border-collapse: collapse;
}

caption,
th,
td {
    padding: 0.5rem;
    font-variant-numeric: tabular-nums;
}

th,
td {
    white-space: nowrap;
}

.sticky-col {
    position: -webkit-sticky;
    position: sticky;
    width: 100px;
    min-width: 100px;
    right: 0;
}

.sticky-col-first {
    position: -webkit-sticky;
    position: sticky;
    width: 100px;
    min-width: 100px;
    left: 0;
}

.vue-ui-responsive {
    .sticky-col,
    .sticky-col-first {
        position: initial;
        width: initial;
        min-width: initial;
        left: initial;
        right: initial;
    }
    
    th {
        display: none;
    }

    td {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem 1rem;
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

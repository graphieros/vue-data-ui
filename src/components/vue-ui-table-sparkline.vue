<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import { calcMedian, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createUid, 
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    palette,
    themePalettes
} from "../lib";
import SparkLine from "./vue-ui-sparkline.vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import UserOptions from "../atoms/UserOptions.vue";
import { usePrinter } from "../usePrinter";

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
const defaultConfig = ref(mainConfig.vue_ui_table_sparkline);
const sparkStep = ref(0)

const tableConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
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
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `table_${uid.value}`,
    fileName: tableConfig.value.title.text || 'vue-ui-table-sparkline'
});

const customPalette = computed(() => {
    return convertCustomPalette(tableConfig.value.customPalette);
})

const tableContainer = ref(null);
const isResponsive = ref(false);
const breakpoint = computed(() => {
    return tableConfig.value.responsiveBreakpoint;
});

onMounted(() => {
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
});

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
                    period: tableConfig.value.colNames[i] || `col ${i}`,
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
    let cn = tableConfig.value.colNames;
    if(!cn.length) {
        for(let i = 0; i < maxSeriesLength.value; i += 1) {
            cn.push(`col ${i+1}`)
        }
    }

    if (tableConfig.value.showTotal) {
        cn = [...cn, tableConfig.value.translations.total];
    }

    let res;
    if (tableConfig.value.showAverage && tableConfig.value.showMedian) {
        res = [
            ...cn,
            tableConfig.value.translations.average,
            tableConfig.value.translations.median,
        ];
    } else if (tableConfig.value.showAverage && !tableConfig.value.showMedian) {
        res = [...cn, tableConfig.value.translations.average];
    } else if (!tableConfig.value.showAverage && tableConfig.value.showMedian) {
        res = [...cn, tableConfig.value.translations.median];
    } else {
        res = cn;
    }
    if (tableConfig.value.showSparklines) {
        return [...res, tableConfig.value.translations.chart];
    } else {
        return res;
    }
});

const selectedDataIndex = ref(undefined);
const selectedSerieIndex = ref(undefined);

function hoverSparkline({ dataIndex, serieIndex }) {
    selectedDataIndex.value = dataIndex;
    selectedSerieIndex.value = serieIndex;
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function generateCsv() {
    nextTick(() => {
        const thead = [tableConfig.value.translations.serie].concat(colNames.value)
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
            title: tableConfig.value.title.text || "vue-ui-table-sparkline"
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
                :style="{ fontFamily: tableConfig.fontFamily, position: 'relative' }">
                <caption v-if="tableConfig.title.text" :style="{ backgroundColor: tableConfig.title.backgroundColor }">
                    <div :style="{
                        fontSize: `${tableConfig.title.fontSize}px`,
                        fontWeight: tableConfig.title.bold ? 'bold' : 'normal',
                        color: tableConfig.title.color,
                        textAlign: tableConfig.title.textAlign,
                    }">
                        {{ tableConfig.title.text }}
                    </div>
                    <div v-if="tableConfig.title.subtitle.text" :style="{
                        fontSize: `${tableConfig.title.subtitle.fontSize}px`,
                        fontWeight: tableConfig.title.subtitle.bold ? 'bold' : 'normal',
                        color: tableConfig.title.subtitle.color,
                        textAlign: tableConfig.title.textAlign,
                    }">
                        {{ tableConfig.title.subtitle.text }}
                    </div>
                </caption>

                <thead style="z-index: 1;padding-right:24px">
                    <tr role="row" class="vue-ui-data-table__thead-row" :style="{
                        backgroundColor: tableConfig.thead.backgroundColor,
                        color: tableConfig.thead.color
                    }">
                        <th role="cell" :style="{
                            backgroundColor: tableConfig.thead.backgroundColor,
                            outline: tableConfig.thead.outline,
                            textAlign: tableConfig.thead.textAlign,
                            fontWeight: tableConfig.thead.bold ? 'bold' : 'normal',
                        }" class="sticky-col-first">
                            {{ tableConfig.translations.serie }}
                        </th>
                        <th role="cell" v-for="(th, i) in colNames" :style="{
                            background: tableConfig.thead.backgroundColor,
                            outline: tableConfig.thead.outline,
                            textAlign: tableConfig.thead.textAlign,
                            fontWeight: tableConfig.thead.bold ? 'bold' : 'normal',
                            minWidth: i === colNames.length - 1 ? '150px' : '',
                            cursor: datasetWithOrders[0].values[i] !== undefined ? 'pointer' : 'default'
                        }" @click="() => orderDatasetByIndex(i)" :class="{'sticky-col': i === colNames.length - 1 && tableConfig.showSparklines}" >
                            <div style="display: flex; flex-direction: row; gap: 3px; align-items:center">
                                <span>{{ th }}</span>
                                <BaseIcon :size="18" v-if="isSorting && i === currentSortingIndex && datasetWithOrders[0].values[i] !== undefined" :name="currentSortOrder === 1 ? 'sort' : 'sortReverse'" :stroke="tableConfig.thead.color"/>
                            </div>
                            <UserOptions
                                ref="details"
                                :key="`user_option_${step}`"
                                v-if="tableConfig.userOptions.show && i === colNames.length - 1"
                                :backgroundColor="tableConfig.thead.backgroundColor"
                                :color="tableConfig.thead.color"
                                :isPrinting="isPrinting"
                                :isImaging="isImaging"
                                :uid="uid"
                                :hasPdf="tableConfig.userOptions.buttons.pdf"
                                :hasXls="tableConfig.userOptions.buttons.csv"
                                :hasImg="tableConfig.userOptions.buttons.img"
                                :hasFullscreen="tableConfig.userOptions.buttons.fullscreen"
                                :isFullscreen="isFullscreen"
                                :titles="{ ...tableConfig.userOptions.buttonTitles }"
                                :chartElement="tableContainer"
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
                        backgroundColor: tableConfig.tbody.backgroundColor,
                        color: tableConfig.tbody.color,
                    }" :class="{'vue-ui-data-table__tbody__row' : true, 'vue-ui-data-table__tbody__row-even': i % 2 === 0, 'vue-ui-data-table__tbody__row-odd': i % 2 !== 0}">
                        <td role="cell" :style="{
                            backgroundColor: tableConfig.tbody.backgroundColor,
                            outline: tableConfig.tbody.outline,
                            fontSize: `${tableConfig.tbody.fontSize}px`,
                            fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                            textAlign: tableConfig.tbody.textAlign
                        }" :data-cell="tableConfig.translations.serie" class="vue-ui-data-table__tbody__td sticky-col-first">
                            <div style="display: flex; flex-direction: row; align-items: center; gap: 6px">
                                <span :style="{ color: tr.color }">⬤</span>
                                <span>{{ tr.name ?? "-" }}</span>
                            </div>
                        </td>
                        <td role="cell" v-for="(_, j) in maxSeries" :style="{
                            outline: tableConfig.tbody.outline,
                            fontSize: `${tableConfig.tbody.fontSize}px`,
                            fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                            textAlign: tableConfig.tbody.textAlign,
                            backgroundColor:
                                selectedDataIndex !== undefined &&
                                    selectedSerieIndex !== undefined &&
                                    j === selectedDataIndex &&
                                    selectedSerieIndex === i
                                    ? `${tr.color}33`
                                    : '',
                            borderRadius:
                                selectedDataIndex !== undefined &&
                                    selectedSerieIndex !== undefined &&
                                    j === selectedDataIndex &&
                                    selectedSerieIndex === i
                                    ? '3px'
                                    : '',
                        }" :data-cell="colNames[j]" class="vue-ui-data-table__tbody__td" @pointerenter="selectedSerieIndex = i; selectedDataIndex = j">
                            {{ [null, undefined].includes(tr.values[j]) ? '-' : Number(tr.values[j].toFixed(tableConfig.roundingValues)).toLocaleString() }}
                        </td>
                        <td role="cell" v-if="tableConfig.showTotal" :style="{
                            outline: tableConfig.tbody.outline,
                            fontSize: `${tableConfig.tbody.fontSize}px`,
                            fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                            textAlign: tableConfig.tbody.textAlign,
                        }" :data-cell="tableConfig.translations.total" class="vue-ui-data-table__tbody__td">
                            {{ Number(tr.sum.toFixed(tableConfig.roundingTotal)).toLocaleString() }}
                        </td>
                        <td role="cell" v-if="tableConfig.showAverage" :style="{
                            outline: tableConfig.tbody.outline,
                            fontSize: `${tableConfig.tbody.fontSize}px`,
                            fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                            textAlign: tableConfig.tbody.textAlign,
                        }" :data-cell="tableConfig.translations.average" class="vue-ui-data-table__tbody__td">
                            {{ Number(tr.average.toFixed(tableConfig.roundingAverage)).toLocaleString() }}
                        </td>
                        <td role="cell" v-if="tableConfig.showMedian" :style="{
                            outline: tableConfig.tbody.outline,
                            fontSize: `${tableConfig.tbody.fontSize}px`,
                            fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                            textAlign: tableConfig.tbody.textAlign,
                        }" :data-cell="tableConfig.translations.median" class="vue-ui-data-table__tbody__td">
                            {{ Number(tr.median.toFixed(tableConfig.roundingMedian)).toLocaleString() }}
                        </td>
                        <td role="cell" v-if="tableConfig.showSparklines" :data-cell="tableConfig.translations.chart" :style="{
                            outline: tableConfig.tbody.outline,
                            fontSize: `${tableConfig.tbody.fontSize}px`,
                            fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                            textAlign: tableConfig.tbody.textAlign,
                        }" class="vue-ui-data-table__tbody__td sticky-col">
                            <SparkLine :key="`sparkline_${i}_${sparkStep}`" @hoverIndex="({ index }) => hoverSparkline({ dataIndex: index, serieIndex: i })
                                " :dataset="tr.sparklineDataset" :showInfo="false" :selectedIndex="selectedDataIndex" :config="{
                                type: tableConfig.sparkline.type,
                                style: {
                                    backgroundColor: tableConfig.tbody.backgroundColor,
                                    animation: {
                                        show: tableConfig.sparkline.animation.show && !isPrinting && !isImaging,
                                        animationFrames: tableConfig.sparkline.animation.animationFrames
                                    },
                                    line: {
                                        color: tr.color,
                                        smooth: tableConfig.sparkline.smooth,
                                        strokeWidth: tableConfig.sparkline.strokeWidth
                                    },
                                    bar: {
                                        color: tr.color
                                    },
                                    area: {
                                        color: tr.color,
                                        opacity: tableConfig.sparkline.showArea ? 16 : 0,
                                        useGradient: tableConfig.sparkline.useGradient,
                                    },
                                    verticalIndicator: {
                                        color: tr.color,
                                    },
                                    plot: {
                                        radius: 9,
                                        stroke: tableConfig.tbody.backgroundColor,
                                        strokeWidth: 3,
                                    },
                                },
                            }" />
                        </td>
                    </tr>
                </tbody>
            </table>
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

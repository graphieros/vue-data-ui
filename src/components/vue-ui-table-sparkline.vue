<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import { calcMedian, convertColorToHex, createCsvContent, createUid, downloadCsv, palette } from "../lib";
import SparkLine from "./vue-ui-sparkline.vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import UserOptions from "../atoms/UserOptions.vue";
import img from "../img";
import pdf from "../pdf";

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
const isPrinting = ref(false);
const isImaging = ref(false);

const tableConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value,
    });
});

const tableContainer = ref(null);
const isResponsive = ref(false);
const breakpoint = computed(() => {
    return tableConfig.value.responsiveBreakpoint;
});

onMounted(() => {
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
    return props.dataset.map((ds, i) => {
        const cleanValues = ds.values.map((v) => (isNaN(v) ? 0 : v ?? 0));
        const sum = cleanValues.reduce((a, b) => a + b, 0);
        return {
            ...ds,
            color: convertColorToHex(ds.color) || palette[i] || palette[i % palette.length],
            sum,
            average: sum / cleanValues.length,
            median: calcMedian(cleanValues),
            sparklineDataset: cleanValues.map((v, i) => {
                return {
                    period: tableConfig.value.colNames[i] || `col ${i}`,
                    value: v,
                };
            }),
        };
    });
});

function addOrdersAttribute(dataset) {
    const combinedValues = dataset[0].values.map((_, index) =>
        dataset.map((series) => series.values[index])
    );

    const orders = combinedValues.map((values) =>
        values
            .map((value, index) => [value, index])
            .sort((a, b) => b[0] - a[0])
            .map((item) => item[1])
    );

    const result = dataset.map((series, index) => ({
        ...series,
        orders: orders[index],
    }));

    return result;
}

const datasetWithOrders = computed(() => {
    return addOrdersAttribute(computedDataset.value);
});

const mutableDataset = ref(datasetWithOrders.value)

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
    const combinedValues = datasetWithOrders.value.map(series => series.values[index]);
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

    mutableDataset.value = sortedDataset
}

const maxSeriesLength = computed(() => {
    return Math.max(...props.dataset.map(ds => ds.values.length))
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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`table_${uid.value}`),
            fileName: tableConfig.value.title.text || 'vue-ui-table-sparkline'
        }).finally(() => {
            isPrinting.value = false;
        });
    }, 100)
}

function showSpinnerImage() {
    isImaging.value = true;
}

function generateImage() {
    showSpinnerImage();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        img({
            domElement: document.getElementById(`table_${uid.value}`),
            fileName: tableConfig.value.title.text || 'vue-ui-table-sparkline',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
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
    <div ref="tableContainer" style="width: 100%;position:relative" :class="{ 'vue-ui-responsive': isResponsive }" :id="`table_${uid}`">
        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="tableConfig.userOptions.show"
            :backgroundColor="tableConfig.thead.backgroundColor"
            :color="tableConfig.thead.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            hasImg
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="tableContainer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @generateCsv="generateCsv"
        />
        <table data-cy="vue-data-ui-table-sparkline" class="vue-ui-data-table"
            :style="{ fontFamily: tableConfig.fontFamily }">
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

            <thead>
                <tr role="row" class="vue-ui-data-table__thead-row" :style="{
                    backgroundColor: tableConfig.thead.backgroundColor,
                    color: tableConfig.thead.color,
                }">
                    <th role="cell" :style="{
                        outline: tableConfig.thead.outline,
                        textAlign: tableConfig.thead.textAlign,
                        fontWeight: tableConfig.thead.bold ? 'bold' : 'normal',
                    }">
                        {{ tableConfig.translations.serie }}
                    </th>
                    <th role="cell" v-for="(th, i) in colNames" :style="{
                        outline: tableConfig.thead.outline,
                        textAlign: tableConfig.thead.textAlign,
                        fontWeight: tableConfig.thead.bold ? 'bold' : 'normal',
                        minWidth: i === colNames.length - 1 ? '150px' : '',
                        cursor: datasetWithOrders[0].values[i] !== undefined ? 'pointer' : 'default'
                    }" @click="() => orderDatasetByIndex(i)">
                        <div style="display: flex; flex-direction: row; gap: 3px; align-items:center">
                            <span>{{ th }}</span>
                            <BaseIcon :size="18" v-if="isSorting && i === currentSortingIndex && datasetWithOrders[0].values[i] !== undefined" :name="currentSortOrder === 1 ? 'sort' : 'sortReverse'" :stroke="tableConfig.thead.color"/>
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr role="row" v-for="(tr, i) in mutableDataset" :style="{
                    backgroundColor: tableConfig.tbody.backgroundColor,
                    color: tableConfig.tbody.color,
                }">
                    <td role="cell" :style="{
                        outline: tableConfig.tbody.outline,
                        fontSize: `${tableConfig.tbody.fontSize}px`,
                        fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                        textAlign: tableConfig.tbody.textAlign,
                    }" :data-cell="tableConfig.translations.serie">
                        <div style="display: flex; flex-direction: row; align-items: center; gap: 6px">
                            <span :style="{ color: tr.color }">⬤</span>
                            <span>{{ tr.name ?? "-" }}</span>
                        </div>
                    </td>
                    <td role="cell" v-for="(td, j) in tr.values" :style="{
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
                    }" :data-cell="colNames[j]">
                        {{ Number(td.toFixed(tableConfig.roundingValues)).toLocaleString() }}
                    </td>
                    <td role="cell" v-if="tableConfig.showTotal" :style="{
                        outline: tableConfig.tbody.outline,
                        fontSize: `${tableConfig.tbody.fontSize}px`,
                        fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                        textAlign: tableConfig.tbody.textAlign,
                    }" :data-cell="tableConfig.translations.total">
                        {{ Number(tr.sum.toFixed(tableConfig.roundingTotal)).toLocaleString() }}
                    </td>
                    <td role="cell" v-if="tableConfig.showAverage" :style="{
                        outline: tableConfig.tbody.outline,
                        fontSize: `${tableConfig.tbody.fontSize}px`,
                        fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                        textAlign: tableConfig.tbody.textAlign,
                    }" :data-cell="tableConfig.translations.average">
                        {{ Number(tr.average.toFixed(tableConfig.roundingAverage)).toLocaleString() }}
                    </td>
                    <td role="cell" v-if="tableConfig.showMedian" :style="{
                        outline: tableConfig.tbody.outline,
                        fontSize: `${tableConfig.tbody.fontSize}px`,
                        fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                        textAlign: tableConfig.tbody.textAlign,
                    }" :data-cell="tableConfig.translations.median">
                        {{ Number(tr.median.toFixed(tableConfig.roundingMedian)).toLocaleString() }}
                    </td>
                    <td role="cell" v-if="tableConfig.showSparklines" :data-cell="tableConfig.translations.chart" :style="{
                        outline: tableConfig.tbody.outline,
                        fontSize: `${tableConfig.tbody.fontSize}px`,
                        fontWeight: tableConfig.tbody.bold ? 'bold' : 'normal',
                        textAlign: tableConfig.tbody.textAlign,
                    }">
                        <SparkLine @hoverIndex="({ index }) => hoverSparkline({ dataIndex: index, serieIndex: i })
                            " :dataset="tr.sparklineDataset" :showInfo="false" :config="{
                            type: tableConfig.sparkline.type,
                            style: {
                                backgroundColor: tableConfig.tbody.backgroundColor,
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

<script setup>
// TODO: custom class prefix
import { computed, ref, onMounted, nextTick } from "vue";
import {
    objectIsEmpty,
    palette,
    error,
    createUid,
    createCsvContent,
    downloadCsv,
    interpolateColorHex,
adaptColorToBackground,
calcMedian
} from "../lib";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";

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

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_table_heatmap);
const isResponsive = ref(false);
const tableContainer = ref(null);
const isPrinting = ref(false);
const isImaging = ref(false);
const isFullscreen = ref(false);
const step = ref(0);

const tableConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const breakpoint = computed(() => {
    return tableConfig.value.table.responsiveBreakpoint;
})

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiTableHeatmap',
            type: 'dataset'
        });
    } else {
        // FIXME: errors for each datapoint   
    }

    const observer = new ResizeObserver((entries) => {
        entries.forEach(entry => {
            isResponsive.value = entry.contentRect.width < breakpoint.value;
        })
    })
    if(tableContainer.value) {
        observer.observe(tableContainer.value)
    }  
});


const immutableDataset = computed(() => {
    return props.dataset.map(ds => {
        const normalized = ds.values.map(v => isNaN(v) ? 0 : v);
        const sum = normalized.reduce((a, b) => a + b, 0);
        return {
            ...ds,
            values: normalized,
            serieExtremes: {
                max: Math.max(...normalized),
                min: Math.min(...normalized),
            },
            sum,
            average: sum / normalized.length,
            median: calcMedian(normalized),
            displayValues: [ds.name, ...ds.values],
            id: createUid()
        }
    })
});

const extremes = computed(() => {
    const flatten = immutableDataset.value.flatMap(ds => {
        return ds.values
    })
    return {
        min: Math.min(...flatten),
        max: Math.max(...flatten)
    }
});

function interpolateColor(value, serieExtremes) {
    const isIndividual = tableConfig.value.style.heatmapColors.useIndividualScale;
    return interpolateColorHex(tableConfig.value.style.heatmapColors.min, tableConfig.value.style.heatmapColors.max, isIndividual ? serieExtremes.min : extremes.value.min, isIndividual ? serieExtremes.max : extremes.value.max, value)
}

const formattedDataset = computed(() => {
    return immutableDataset.value.map(ds => {
        return {
            ...ds,
            colors: ds.displayValues.map(v => {
                return isNaN(v) ? tableConfig.value.style.backgroundColor : interpolateColor(v, ds.serieExtremes)
            })
        }
    })
});

const backgroundColor = computed(() => {
    return tableConfig.value.style.backgroundColor
});
const borderWidth = computed(() => {
    return `${tableConfig.value.table.borderWidth}px`;
});

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`table_heatmap_${uid.value}`),
            fileName: 'vue-ui-table-heatmap'
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
            domElement: document.getElementById(`table_heatmap_${uid.value}`),
            fileName: 'vue-ui-table-heatmap',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function generateCsv() {
    nextTick(() => {
        const labels = formattedDataset.value.map((ds, i) => {
            return [
                [ ds.name ],
                ds.displayValues,
                [ ds.sum],
                [ ds.average ],
                [ ds.median ]
            ]
        })

        const tableXls = [[[""], tableConfig.value.table.head.values, ['sum'],['average'],['median']],].concat(labels);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: "vue-ui-table-heatmap" })
    });
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

defineExpose({
    generatePdf,
    generateCsv,
    generateImage
});

</script>

<template>
    <div ref="tableContainer" :style="`width:100%; overflow-x:auto; container-type: inline-size;padding-top:${tableConfig.userOptions.show ? '36px' : ''}`" :class="{ 'vue-ui-responsive' : isResponsive }" :id="`table_heatmap_${uid}`">
        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="tableConfig.userOptions.show && isDataset"
            :backgroundColor="tableConfig.style.backgroundColor"
            :color="tableConfig.style.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            hasImg
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="tableContainer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
        />    
        <table :class="{'vue-ui-table-heatmap': true}" :style="`width:100%;font-family:${tableConfig.style.fontFamily};background:${tableConfig.style.backgroundColor};`">
            <caption>
                <slot name="caption"></slot>
            </caption>
    
            <thead>
                <tr role="row" :style="`background:${tableConfig.table.head.backgroundColor}`">
                    <th role="cell" v-for="(cell, i) in tableConfig.table.head.values">
                        <slot name="head" v-bind="{ value: cell, rowIndex: i, type: typeof cell, isResponsive }"></slot>
                    </th>
                </tr>
            </thead>
    
            <tbody>
                <tr role="row" v-for="(row, i) in formattedDataset">
                    <td 
                        role="cell" 
                        v-for="(cell, j) in row.displayValues"
                        :data-cell="tableConfig.table.head.values[j]"
                    >
                        <slot v-if="j === 0" name="rowTitle" v-bind="{ value: cell, rowIndex: i, colIndex: j, type: typeof cell, isResponsive}"></slot>
                        <slot v-if="j > 0" name="cell" v-bind="{ value: cell, rowIndex: i, colIndex: j, type: typeof cell, isResponsive, color: row.colors[j], textColor: adaptColorToBackground(row.colors[j]) }"></slot>
                    </td>
                    <td role="cell" data-cell="sum" v-if="tableConfig.table.showSum">
                        <slot name="sum" v-bind="{ value: row.sum, rowIndex: i, isResponsive }"></slot>
                    </td>
                    <td role="cell" data-cell="average" v-if="tableConfig.table.showAverage">
                        <slot name="average" v-bind="{ value: row.average, rowIndex: i, isResponsive }"></slot>
                    </td>
                    <td role="cell" data-cell="median" v-if="tableConfig.table.showMedian">
                        <slot name="median" v-bind="{ value: row.median, rowIndex: i, isResponsive }"></slot>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped lang="scss">
.vue-ui-table-heatmap {
    position: relative;
    border-collapse: collapse;
    th, tr, td {
        border: v-bind(borderWidth) solid v-bind(backgroundColor);
    }
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

    td:first-child {
        padding-top: 1rem;
    }

    td:last-child {
        padding-bottom: 1rem;
    }

    td::before {
        content: attr(data-cell) ": ";
    }
}
</style>
<script setup>
// TODO: custom class prefix
import { computed, ref, onMounted, nextTick, watch } from "vue";
import {
    adaptColorToBackground,
    calcMedian,
    createCsvContent,
    createUid,
    downloadCsv,
    error,
    interpolateColorHex,
    objectIsEmpty,
} from "../lib";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import Shape from "../atoms/Shape.vue";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";

const { vue_ui_table_heatmap: DEFAULT_CONFIG } = useConfig();

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
const isResponsive = ref(false);
const tableContainer = ref(null);
const isFullscreen = ref(false);
const step = ref(0);

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
                userConfig: themes.vue_ui_table_heatmap[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            })
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `table_heatmap_${uid.value}`,
    fileName: 'vue-ui-table-heatmap'
});

const breakpoint = computed(() => {
    return FINAL_CONFIG.value.table.responsiveBreakpoint;
})

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(() => {
    prepareChart();
});

function prepareChart() {
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
}

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
    const isIndividual = FINAL_CONFIG.value.style.heatmapColors.useIndividualScale;
    return interpolateColorHex(FINAL_CONFIG.value.style.heatmapColors.min, FINAL_CONFIG.value.style.heatmapColors.max, isIndividual ? serieExtremes.min : extremes.value.min, isIndividual ? serieExtremes.max : extremes.value.max, value)
}

const formattedDataset = computed(() => {
    return immutableDataset.value.map(ds => {
        return {
            ...ds,
            colors: ds.displayValues.map(v => {
                return isNaN(v) ? FINAL_CONFIG.value.style.backgroundColor : interpolateColor(v, ds.serieExtremes)
            })
        }
    })
});

const backgroundColor = computed(() => {
    return FINAL_CONFIG.value.style.backgroundColor
});
const borderWidth = computed(() => {
    return `${FINAL_CONFIG.value.table.borderWidth}px`;
});

function generateCsv() {
    nextTick(() => {
        const labels = formattedDataset.value.map((ds) => {
            return [
                [ ds.name ],
                ds.displayValues,
                [ ds.sum],
                [ ds.average ],
                [ ds.median ]
            ]
        })

        const tableXls = [[[""], FINAL_CONFIG.value.table.head.values, ['sum'],['average'],['median']],].concat(labels);
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
    <div ref="tableContainer" :style="`width:100%; overflow-x:auto; container-type: inline-size;padding-top:${FINAL_CONFIG.userOptions.show ? '36px' : ''}; ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}; position:relative;`" :class="{ 'vue-ui-responsive' : isResponsive }" :id="`table_heatmap_${uid}`">

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
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
            @generateCsv="generateCsv"
            @generateImage="generateImage"
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

        <table :class="{'vue-ui-table-heatmap': true}" :style="`width:100%;font-family:${FINAL_CONFIG.style.fontFamily};background:${FINAL_CONFIG.style.backgroundColor};`">
            <caption>
                <slot name="caption"></slot>
            </caption>
    
            <thead>
                <tr role="row" :style="`background:${FINAL_CONFIG.table.head.backgroundColor};color:${FINAL_CONFIG.table.head.color}`">
                    <th role="cell" v-for="(cell, i) in FINAL_CONFIG.table.head.values">
                        <slot name="head" v-bind="{ value: cell, rowIndex: i, type: typeof cell, isResponsive }"></slot>
                    </th>
                </tr>
            </thead>
    
            <tbody>
                <tr role="row" v-for="(row, i) in formattedDataset">
                    <td 
                        role="cell" 
                        v-for="(cell, j) in row.displayValues"
                        :data-cell="FINAL_CONFIG.table.head.values[j]"
                    >
                        <template v-if="row.color && j === 0">
                            <div style="display:flex; flex-direction: row; gap:2px; align-items:center;">
                                <svg :height="FINAL_CONFIG.style.shapeSize" :width="FINAL_CONFIG.style.shapeSize" v-if="row.color" viewBox="0 0 20 20" style="background: none;overflow: visible">
                                    <Shape
                                        :plot="{ x: 10, y: 10 }"
                                        :color="row.color"
                                        :radius="9"
                                        :shape="row.shape || 'circle'"
                                    />
                                </svg>
                                <slot name="rowTitle" v-bind="{ value: cell, rowIndex: i, colIndex: j, type: typeof cell, isResponsive}"></slot>
                            </div>
                        </template>
                        <template v-else>
                            <slot v-if="j === 0" name="rowTitle" v-bind="{ value: cell, rowIndex: i, colIndex: j, type: typeof cell, isResponsive}"></slot>
                            <slot v-if="j > 0" name="cell" v-bind="{ value: cell, rowIndex: i, colIndex: j, type: typeof cell, isResponsive, color: row.colors[j], textColor: adaptColorToBackground(row.colors[j]) }"></slot>
                        </template>
                    </td>
                    <td role="cell" data-cell="sum" v-if="FINAL_CONFIG.table.showSum">
                        <slot name="sum" v-bind="{ value: row.sum, rowIndex: i, isResponsive }"></slot>
                    </td>
                    <td role="cell" data-cell="average" v-if="FINAL_CONFIG.table.showAverage">
                        <slot name="average" v-bind="{ value: row.average, rowIndex: i, isResponsive }"></slot>
                    </td>
                    <td role="cell" data-cell="median" v-if="FINAL_CONFIG.table.showMedian">
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
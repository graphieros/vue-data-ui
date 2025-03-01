<script setup>
import { ref, computed, nextTick, onMounted, watch } from "vue";
import { 
    applyDataLabel,
    createCsvContent, 
    createPolygonPath, 
    createUid, 
    dataLabel,
    downloadCsv,
    error,
    makePath,
    objectIsEmpty, 
    setOpacity,
    shiftHue,
    XMLNS
} from "../lib";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Legend from "../atoms/Legend.vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";

const { vue_ui_mood_radar:  DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Object,
        default() {
            return {};
        },
    },
});

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
})

onMounted(() => {
    prepareChart();
})

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiMoodRadar',
            type: 'dataset'
        })
    }
}

const uid = ref(createUid());
const moodRadarChart = ref(null);
const details = ref(null);
const selectedKey = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_mood_radar[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: uid.value,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-mood-radar'
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

const svg = computed(() => {
    return {
        height: 256,
        width: 256,
    };
});

const outerPolygon = computed(() => {
    return createPolygonPath({
        plot: { x: 128, y: svg.value.height / 2 },
        radius: 90,
        sides: 5,
        rotation: 11,
    });
});

function plot({ centerX, centerY, apexX, apexY, proportion, key, value }) {
    return {
        x: centerX + (apexX - centerX) * proportion,
        y: centerY + (apexY - centerY) * proportion,
        key,
        value
    };
}

const maxValue = computed(() => {
    return Math.max(...Object.values(props.dataset).map(v => isNaN(v) ? 0 : v));
});

const grandTotal = computed(() => {
    return Object.values(props.dataset).reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b), 0);
});

const convertedDataset = computed(() => {
    return Object.keys(props.dataset)
        .map((key, i) => {
            const value = typeof props.dataset[key] !== 'number' || isNaN(props.dataset[key]) ? 0 : props.dataset[key];
            return {
                index: i,
                key,
                value,
                proportion: value / grandTotal.value,
                color: FINAL_CONFIG.value.style.chart.layout.smileys.colors[key]
            };
        })
        .sort((a, b) => b.key - a.key);
});

const radar = computed(() => {
    if(!isDataset.value) {
        return []
    }

    ['1', '2', '3', '4', '5'].forEach(rating => {
        if([null, undefined].includes(props.dataset[rating])){
            error({
                componentName: 'VueUiMoodRadar',
                type: 'datasetAttribute',
                property: rating
            })
        }
    })

    return outerPolygon.value.coordinates.map((c, i) => {
        const plots = plot({
            centerX: svg.value.width / 2,
            centerY: svg.value.height / 2,
            apexX: c.x,
            apexY: c.y,
            proportion: convertedDataset.value[i].value / maxValue.value,
            key: convertedDataset.value[i].key,
            value: convertedDataset.value[i].value
        });
        return {
            ...c,
            plots,
            key: convertedDataset.value[i].key,
        };
    });
});

const legendConfig = computed(() => {
    return {
        cy: "mood-radar-legend",
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? "bold" : "",
    };
});

function selectKey(key) {
    if(key === selectedKey.value) {
        selectedKey.value = null
    } else {
        selectedKey.value = key
    }
}

const table = computed(() => {
    const head = convertedDataset.value.map(ds => {
        return {
            name: ds.key,
            color: ds.color
        }
    });
    const body = convertedDataset.value.map(ds => isNaN(ds.value) ? 0 : ds.value);
    return { head, body };
});

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / grandTotal.value) ? '-' : table.value.body[i] / grandTotal.value * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-mood-radar"});
    });
}

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`,
        Number(grandTotal.value.toFixed(FINAL_CONFIG.value.table.td.roundingValue)).toLocaleString(),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            table.value.body[i].toFixed(FINAL_CONFIG.value.table.td.roundingValue),
            isNaN(table.value.body[i] / grandTotal.value) ? "-" : (table.value.body[i] / grandTotal.value * 100).toFixed(FINAL_CONFIG.value.table.td.roundingPercentage) + '%'
        ]
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    }

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage
    ]

    return {
        head,
        body,
        config,
        colNames
    }
});

function getData() {
    return convertedDataset.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleAnnotator
});

</script>

<template>
    <div :class="`vue-ui-mood-radar ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="moodRadarChart"
        :id="`${uid}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="moodRadarChart"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent`">
            <Title :config="{
                title: {
                    cy: 'mood-radar-title',
                    ...FINAL_CONFIG.style.chart.title
                },
                subtitle: {
                    cy: 'mood-radar-subtitle',
                    ...FINAL_CONFIG.style.chart.title.subtitle
                },
            }" />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="moodRadarChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
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

        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
            v-if="isDataset" 
            :viewBox="`0 0 ${svg.width} ${svg.height}`"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :style="`overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width"
                :height="svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            <!-- DEFS -->
            <defs>
                <radialGradient cx="50%" cy="50%" r="50%" fx="50%" fy="50%" :id="`mood_radar_gradient_${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.layout.dataPolygon.color, FINAL_CONFIG.style.chart.layout.dataPolygon.opacity)" />
                    <stop offset="100%" :stop-color="setOpacity(shiftHue(FINAL_CONFIG.style.chart.layout.dataPolygon.color, FINAL_CONFIG.style.chart.layout.dataPolygon.gradient.intensity / 100), FINAL_CONFIG.style.chart.layout.dataPolygon.opacity)" />
                </radialGradient>
            </defs>

            <!-- GRID -->
            <!-- RADIAL LINES -->
            <line
                data-cy="grid-radial" 
                v-for="line in outerPolygon.coordinates" :x1="svg.width / 2" :y1="svg.height / 2" :x2="line.x"
                :y2="line.y" :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth" />
            <!-- OUTER POLYGON -->
            <path
                data-cy="grid-polygon" 
                :d="outerPolygon.path" fill="none" :stroke="FINAL_CONFIG.style.chart.layout.outerPolygon.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.layout.outerPolygon.strokeWidth" stroke-linejoin="round"
                stroke-linecap="round" />


            <!-- ICON 5 -->
            <path
                data-cy="icon-5" 
                fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['5']" stroke-width="1"
                stroke-linecap="round"
                d="M119 25A1 1 0 00137 25 1 1 0 00119 25M123 26C124 33 132 33 133 26L123 26M123 22A1 1 0 00126 22 1 1 0 00123 22M130 22A1 1 0 00133 22 1 1 0 00130 22" />
                <!-- TRAP -->
                <circle data-cy="trap-5" class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 5" @mouseleave="selectedKey = null" cx="128" cy="25" r="20" :fill="selectedKey === 5 ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['5'], 20) : 'transparent'"/>

            <!-- ICON 4 -->
            <path
                data-cy="icon-4" 
                fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['4']" stroke-width="1"
                stroke-linecap="round"
                d="M218 95A1 1 0 00236 95 1 1 0 00218 95M222 97C225 99 229 99 232 97M222 92A1 1 0 00225 92 1 1 0 00222 92M229 92A1 1 0 00232 92 1 1 0 00229 92" />
                <!-- TRAP -->
                <circle data-cy="trap-4" class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 4" @mouseleave="selectedKey = null"  cx="227" cy="95.5" r="20" :fill="selectedKey === 4 ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['4'], 20) : 'transparent'"/>

            <!-- ICON 3 -->
            <path
                data-cy="icon-3" 
                fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['3']" stroke-width="1"
                stroke-linecap="round"
                d="M181 213A1 1 0 00199 213 1 1 0 00181 213M185 210A1 1 0 00188 210 1 1 0 00185 210M192 210A1 1 0 00195 210 1 1 0 00192 210M185 215 195 215" />
                <!-- TRAP -->
                <circle data-cy="trap-3" class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 3" @mouseleave="selectedKey = null"  cx="190" cy="213.5" r="20" :fill="selectedKey === 3 ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['3'], 20) : 'transparent'"/>


            <!-- ICON 2 -->
            <path
                data-cy="icon-2" 
                fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['2']" stroke-width="1"
                stroke-linecap="round"
                d="M56 213A1 1 0 0074 213 1 1 0 0056 213M60 216C63 214 67 214 70 216M60 210A1 1 0 0063 210 1 1 0 0060 210M67 210A1 1 0 0070 210 1 1 0 0067 210" />
                <!-- TRAP -->
                <circle data-cy="trap-2" class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 2" @mouseleave="selectedKey = null"  cx="65" cy="213.5" r="20" :fill="selectedKey === 2 ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['2'], 20) :  'transparent'"/>

            <!-- ICON 1 -->
            <path
                data-cy="icon-1"
                fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['1']" stroke-width="1"
                stroke-linecap="round"
                d="M20 96A1 1 0 0038 96 1 1 0 0020 96M24 100C25 95 33 95 34 100L24 100M24 93A1 1 0 0027 93 1 1 0 0024 93M31 93A1 1 0 0034 93 1 1 0 0031 93" />
                <!-- TRAP -->
                <circle data-cy="trap-1" class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 1" @mouseleave="selectedKey = null"  cx="29" cy="95.5" r="20" :fill="selectedKey === 1 ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['1'], 20) : 'transparent'"/>

            <path data-cy="datapoint-polygon" :d="makePath(radar.map((r) => r.plots))" :stroke="FINAL_CONFIG.style.chart.layout.dataPolygon.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.layout.dataPolygon.strokeWidth" stroke-linecap="round"
                stroke-linejoin="round" :fill="FINAL_CONFIG.style.chart.layout.dataPolygon.gradient.show
                        ? `url(#mood_radar_gradient_${uid})`
                        : setOpacity(FINAL_CONFIG.style.chart.layout.dataPolygon.color, FINAL_CONFIG.style.chart.layout.dataPolygon.opacity)" />

                <g v-for="(plot, i) in radar.map(r => r.plots)" class="vue-ui-mood-radar-trap" :style="`opacity:${selectedKey == plot.key ? '1' : '0'}`">
                    <line 
                        data-cy="datapoint-selection-line"
                        :x1="plot.x"
                        :y1="plot.y"
                        :x2="128"
                        :y2="128"
                        :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors[plot.key]"
                    />
                    <circle data-cy="datapoint-selection-circle" :cx="plot.x" :cy="plot.y" :fill="FINAL_CONFIG.style.chart.layout.smileys.colors[plot.key]" r="3" :stroke="FINAL_CONFIG.style.chart.backgroundColor" :stroke-width="0.5" />
                    <circle data-cy="datapoint-selection-circle"  :cx="128" :cy="128" :fill="FINAL_CONFIG.style.chart.layout.smileys.colors[plot.key]" r="3" :stroke="FINAL_CONFIG.style.chart.backgroundColor" :stroke-width="0.5" />
                    <text 
                        data-cy="label-value"
                        :x="128"
                        :y="['5', 5].includes(plot.key) ? 145 : 120"
                        :fill="FINAL_CONFIG.style.chart.layout.dataLabel.color"
                        font-size="12"
                        text-anchor="middle"
                        :font-weight="FINAL_CONFIG.style.chart.layout.dataLabel.bold ? 'bold' : 'normal'"
                    >
                        {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.dataLabel.formatter,
                            plot.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.layout.dataLabel.prefix,
                                v: plot.value,
                                s: FINAL_CONFIG.style.chart.layout.dataLabel.suffix,
                                r: FINAL_CONFIG.style.chart.layout.dataLabel.roundingValue
                            }),
                            { datapoint: plot, seriesIndex: i }
                            ) 
                        }}
                    </text>
                    <text 
                        data-cy="label-percentage"
                        :x="128"
                        :y="['5', 5].includes(plot.key) ? 163 : 102"
                        :fill="FINAL_CONFIG.style.chart.layout.dataLabel.color"
                        font-size="12"
                        text-anchor="middle"
                    >
                        ({{ dataLabel({
                            v: plot.value / grandTotal * 100,
                            s: '%',
                            r: FINAL_CONFIG.style.chart.layout.dataLabel.roundingPercentage
                        }) }})
                    </text>
                </g>
                <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'radar',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    radar: {
                        grid: {
                            color: '#CCCCCC'
                        },
                        shapes: {
                            color: '#CCCCCC'
                        }
                    }
                }
            }"
        />

        <!-- LEGEND AS DIV -->
        <Legend 
            v-if="FINAL_CONFIG.style.chart.legend.show" 
            :legendSet="convertedDataset" 
            :config="legendConfig"
            :key="`legend_${legendStep}`"
            style="display: flex; row-gap: 6px">
            <template #item="{ legend, index }">
                <div @click="() => selectKey(legend.key)" style="
            display: flex;
            flex-direction: row;
            gap: 3px;
            align-items: center;
            margin: 3px 0;
        ">
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 1" name="moodSad"
                        :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors[legend.key]" />
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 2" name="moodFlat"
                        :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors[legend.key]" />
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 3" name="moodNeutral"
                        :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors[legend.key]" />
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 4" name="smiley"
                        :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors[legend.key]" />
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 5" name="moodHappy"
                        :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors[legend.key]" />
                    <span style="font-weight: bold">{{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.dataLabel.formatter,
                        legend.value,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.layout.dataLabel.prefix,
                            v: legend.value,
                            s: FINAL_CONFIG.style.chart.layout.dataLabel.suffix,
                            r: FINAL_CONFIG.style.chart.layout.dataLabel.roundingValue
                        }),
                        { datapoint: legend, seriesIndex: index }
                    ) }}</span> ({{ dataLabel({
                        v: legend.proportion * 100,
                        s: '%',
                        r: FINAL_CONFIG.style.chart.legend.roundingPercentage
                    })}})
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="convertedDataset"></slot>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            }
        }">
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{th}">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{td}">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-mood-radar *{
    transition: unset;
}
.vue-ui-mood-radar {
    user-select: none;
    position: relative;
}
.vue-ui-mood-radar-trap {
    transition: all 0.2s ease-in-out;
}
</style>

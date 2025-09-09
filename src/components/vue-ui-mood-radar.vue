<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onMounted, 
    ref, 
    toRefs,
    watch, 
} from "vue";
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
    treeShake,
    XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import img from "../img";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import BaseScanner from "../atoms/BaseScanner.vue";

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

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

const uid = ref(createUid());
const moodRadarChart = ref(null);
const selectedKey = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const chartTitle = ref(null);
const chartLegend = ref(null);
const resizeObserver = ref(null);
const observedEl = ref(null);
const source = ref(null);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
})

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await nextTick();
            mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        })
    },
    skeletonDataset: {
        '1': 1,
        '2': 1,
        '3': 1,
        '4': 1,
        '5': 1
    },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        grid: {
                            stroke: '#6A6A6A',
                        },
                        outerPolygon: {
                            stroke: '#6A6A6A'
                        },
                        dataPolygon: {
                            color: '#6A6A6A',
                            opacity: 30,
                            stroke: '#6A6A6A',
                        },
                        smileys: {
                            colors: {
                                '1': '#DBDBDB',
                                '2': '#C4C4C4',
                                '3': '#ADADAD',
                                '4': '#969696',
                                '5': '#808080'
                            }
                        },
                        dataLabel: {
                            color: 'transparent'
                        }
                    },
                    legend: {
                        backgroundColor: 'transparent'
                    }
                }
            }
        }
    })
});

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
})

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiMoodRadar',
            type: 'dataset',
            debug: debug.value
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: moodRadarChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                noTitle: noTitle.value,
                source: source.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height - 12;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = moodRadarChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

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
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-mood-radar',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

const svg = ref({
    height: 256,
    width: 256,
});

const ICON_BASE_CENTERS = {
    '5': { x: 128, y: 35 },
    '4': { x: 218, y: 98.5 },
    '3': { x: 185, y: 204 },
    '2': { x: 70,  y: 204 },
    '1': { x: 38.5,  y: 98.5 }
};

const apexByKey = computed(() => {
    const map = {};
    radar.value.forEach(r => { map[r.key] = { x: r.x, y: r.y }; });
    return map;
});

function iconTransform(key) {
    const base = ICON_BASE_CENTERS[key];
    const apex = apexByKey.value[key] || base;
    return `translate(${apex.x - base.x}, ${apex.y - base.y})`;
}

const outerPolygon = computed(() => {
    return createPolygonPath({
        plot: { x: svg.value.width / 2, y: svg.value.height / 2 },
        radius: Math.min(svg.value.height, svg.value.width) * 0.35,
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
    return Math.max(...Object.values(FINAL_DATASET.value).map(v => isNaN(v) ? 0 : v));
});

const grandTotal = computed(() => {
    return Object.values(FINAL_DATASET.value).reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b), 0);
});

const convertedDataset = computed(() => {
    return Object.keys(FINAL_DATASET.value)
        .map((key, i) => {
            const value = typeof FINAL_DATASET.value[key] !== 'number' || isNaN(FINAL_DATASET.value[key]) ? 0 : FINAL_DATASET.value[key];
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
    ['1', '2', '3', '4', '5'].forEach(rating => {
        if([null, undefined].includes(FINAL_DATASET.value[rating])){
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
        selectedKey.value = null;
    } else {
        selectedKey.value = key;
        onTrapClick(key);
    }
}

function onTrapEnter(key) {
    selectedKey.value = key;
    const datapoint = convertedDataset.value.find(el => el.key === key);
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: datapoint.index })
    }
}

function onTrapLeave(key)  {
    selectedKey.value = null;
    const datapoint = convertedDataset.value.find(el => el.key === key);
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex: datapoint.index })
    }
}

function onTrapClick(key) {
    const datapoint = convertedDataset.value.find(el => el.key === key);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: datapoint.index })
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

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / grandTotal.value) ? '-' : table.value.body[i] / grandTotal.value * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);
        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-mood-radar"});
        } else {
            callback(csvContent);
        }
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

async function getImage({ scale = 2} = {}) {
    if (!moodRadarChart.value) return;
    const { width, height } = moodRadarChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: moodRadarChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: moodRadarChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8)
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                }
            }
        }
    }
});

watch(() => mutableConfig.value.showTable, v => {
    if (FINAL_CONFIG.value.table.show) return;
    if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
        tableUnit.value.open()
    } else {
        if ('close' in tableUnit.value) {
            tableUnit.value.close()
        }
    }
});

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen
});

</script>

<template>
    <div :class="`vue-ui-mood-radar ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="moodRadarChart"
        :id="`${uid}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
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

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text"
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

        <div :id="`legend-top-${uid}`" />

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
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
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :tableDialog="FINAL_CONFIG.table.useDialog"
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
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
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

        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
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
            <g :transform="iconTransform('5')">
                <path
                    data-cy="icon-5"
                    fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['5']" stroke-width="1"
                    stroke-linecap="round"
                    d="M119 25A1 1 0 00137 25 1 1 0 00119 25M123 26C124 33 132 33 133 26L123 26M123 22A1 1 0 00126 22 1 1 0 00123 22M130 22A1 1 0 00133 22 1 1 0 00130 22" 
                />
                <circle 
                    data-cy="trap-5" 
                    class="vue-ui-mood-radar-trap"
                    cx="128" cy="25" r="20"
                    :fill="selectedKey === '5' ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['5'], 20) : 'transparent'"
                    @mouseenter="onTrapEnter('5')"
                    @mouseleave="onTrapLeave('5')"
                    @click="onTrapClick('5')"
                />
            </g>

            <!-- ICON 4 -->
            <g :transform="iconTransform('4')">
                <path
                    data-cy="icon-4"
                    fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['4']" stroke-width="1"
                    stroke-linecap="round"
                    d="M218 95A1 1 0 00236 95 1 1 0 00218 95M222 97C225 99 229 99 232 97M222 92A1 1 0 00225 92 1 1 0 00222 92M229 92A1 1 0 00232 92 1 1 0 00229 92" 
                />
                <circle 
                    data-cy="trap-4" 
                    class="vue-ui-mood-radar-trap"
                    cx="227" cy="95.5" r="20"
                    :fill="selectedKey === '4' ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['4'], 20) : 'transparent'"
                    @mouseenter="onTrapEnter('4')"
                    @mouseleave="onTrapLeave('4')"
                    @click="onTrapClick('4')"
                />
            </g>

            <!-- ICON 3 -->
            <g :transform="iconTransform('3')">
                <path
                    data-cy="icon-3"
                    fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['3']" stroke-width="1"
                    stroke-linecap="round"
                    d="M181 213A1 1 0 00199 213 1 1 0 00181 213M185 210A1 1 0 00188 210 1 1 0 00185 210M192 210A1 1 0 00195 210 1 1 0 00192 210M185 215 195 215" 
                />
                <circle 
                    data-cy="trap-3" 
                    class="vue-ui-mood-radar-trap"
                    cx="190" cy="213.5" r="20"
                    :fill="selectedKey === '3' ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['3'], 20) : 'transparent'"
                    @mouseenter="onTrapEnter('3')"
                    @mouseleave="onTrapLeave('3')"
                    @click="onTrapClick('3')"
                />
            </g>


            <!-- ICON 2 -->
            <g :transform="iconTransform('2')">
                <path
                    data-cy="icon-2"
                    fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['2']" stroke-width="1"
                    stroke-linecap="round"
                    d="M56 213A1 1 0 0074 213 1 1 0 0056 213M60 216C63 214 67 214 70 216M60 210A1 1 0 0063 210 1 1 0 0060 210M67 210A1 1 0 0070 210 1 1 0 0067 210" 
                />
                <circle 
                    data-cy="trap-2" 
                    class="vue-ui-mood-radar-trap"
                    cx="65" cy="213.5" r="20"
                    :fill="selectedKey === '2' ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['2'], 20) : 'transparent'"
                    @mouseenter="onTrapEnter('2')"
                    @mouseleave="onTrapLeave('2')"
                    @click="onTrapClick('2')"
                />
            </g>

            <!-- ICON 1 -->
            <g :transform="iconTransform('1')">
                <path
                    data-cy="icon-1"
                    fill="none" :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors['1']" stroke-width="1"
                    stroke-linecap="round"
                    d="M20 96A1 1 0 0038 96 1 1 0 0020 96M24 100C25 95 33 95 34 100L24 100M24 93A1 1 0 0027 93 1 1 0 0024 93M31 93A1 1 0 0034 93 1 1 0 0031 93" 
                />
                <circle 
                    data-cy="trap-1" 
                    class="vue-ui-mood-radar-trap"
                    cx="29" cy="95.5" r="20"
                    :fill="selectedKey === '1' ? setOpacity(FINAL_CONFIG.style.chart.layout.smileys.colors['1'], 20) : 'transparent'"
                    @mouseenter="onTrapEnter('1')"
                    @mouseleave="onTrapLeave('1')"
                    @click="onTrapClick('1')"
                />
            </g>

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
                        :x2="svg.width / 2"
                        :y2="svg.height / 2"
                        :stroke="FINAL_CONFIG.style.chart.layout.smileys.colors[plot.key]"
                    />
                    <circle data-cy="datapoint-selection-circle" :cx="plot.x" :cy="plot.y" :fill="FINAL_CONFIG.style.chart.layout.smileys.colors[plot.key]" r="3" :stroke="FINAL_CONFIG.style.chart.backgroundColor" :stroke-width="0.5" />
                    <circle data-cy="datapoint-selection-circle"  :cx="svg.width / 2" :cy="svg.height / 2" :fill="FINAL_CONFIG.style.chart.layout.smileys.colors[plot.key]" r="3" :stroke="FINAL_CONFIG.style.chart.backgroundColor" :stroke-width="0.5" />
                    <text 
                        data-cy="label-value"
                        :x="svg.width / 2"
                        :y="['5', 5].includes(plot.key) ? (svg.height / 2) * 1.13 : (svg.height / 2) * 0.9375"
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
                        :x="svg.width / 2"
                        :y="['5', 5].includes(plot.key) ? (svg.height / 2) * 1.273 : (svg.height / 2) * 0.7968"
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

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport v-if="readyTeleport" :to="FINAL_CONFIG.style.chart.legend.position === 'top' ? `#legend-top-${uid}` : `#legend-bottom-${uid}`">
            <div ref="chartLegend">
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
                            <span v-if="!loading" style="font-weight: bold">{{ applyDataLabel(
                                FINAL_CONFIG.style.chart.layout.dataLabel.formatter,
                                legend.value,
                                dataLabel({
                                    p: FINAL_CONFIG.style.chart.layout.dataLabel.prefix,
                                    v: legend.value,
                                    s: FINAL_CONFIG.style.chart.layout.dataLabel.suffix,
                                    r: FINAL_CONFIG.style.chart.layout.dataLabel.roundingValue
                                }),
                                { datapoint: legend, seriesIndex: index }
                            ) }}</span><span v-if="!loading">({{ dataLabel({
                                v: legend.proportion * 100,
                                s: '%',
                                r: FINAL_CONFIG.style.chart.legend.roundingPercentage
                            })}})</span>
                        </div>
                    </template>
                </Legend>
        
                <slot name="legend" v-bind:legend="convertedDataset"></slot>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <component
            v-if="isDataset"
            :is="tableComponent.component"
            v-bind="tableComponent.props"
            ref="tableUnit"
            @close="closeTable"
        >
            <template #title v-if="FINAL_CONFIG.table.useDialog">
                {{ tableComponent.title }}
            </template>
            <template #actions v-if="FINAL_CONFIG.table.useDialog">
                <button tabindex="0" class="vue-ui-user-options-button" @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)">
                    <BaseIcon name="excel" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    @close="closeTable"
                >
                    <template #th="{th}">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{td}">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
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


<script setup>
import { ref, computed, nextTick, onMounted, watch } from "vue";
import {
    applyDataLabel,
    calcMarkerOffsetX, 
    calcMarkerOffsetY, 
    calcNutArrowPath, 
    calculateNiceScale,
    canShowValue, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createUid, 
    dataLabel,
    deepEmptyObjectToNull,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    hasDeepProperty,
    makeDonut,
    objectIsEmpty, 
    palette,
    sanitizeArray,
    setOpacity,
    sumByAttribute,
    themePalettes,
    XMLNS
} from '../lib';
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Legend from "../atoms/Legend.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Slicer from "../atoms/Slicer.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import BaseDraggableDialog from "../atoms/BaseDraggableDialog.vue";
import VueUiDonut from "./vue-ui-donut.vue";

const { vue_ui_donut_evolution: DEFAULT_CONFIG } = useConfig();

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
    },
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
})

const slicer = ref({
    start: 0,
    end: Math.max(...props.dataset.map(ds => ds.values.length))
})

function refreshSlicer() {
    setupSlicer();
}

const slicerComponent = ref(null);

async function setupSlicer() {
    if ((FINAL_CONFIG.value.style.chart.zoom.startIndex !== null || FINAL_CONFIG.value.style.chart.zoom.endIndex !== null) && slicerComponent.value) {
        if (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null) {
            await nextTick();
            await nextTick();
            slicerComponent.value && slicerComponent.value.setStartValue(FINAL_CONFIG.value.style.chart.zoom.startIndex);
        }
        if (FINAL_CONFIG.value.style.chart.zoom.endIndex !== null) {
            await nextTick();
            await nextTick();
            slicerComponent.value && slicerComponent.value.setEndValue(validSlicerEnd(FINAL_CONFIG.value.style.chart.zoom.endIndex + 1));
        }
    } else {
        slicer.value = {
            start: 0,
            end: maxLength.value
        };
        slicerStep.value += 1;
    }
}

function validSlicerEnd(v) {
    const max = maxLength.value;
    if (v > max) {
        return max;
    }
    if (v < 0 || (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null && v < FINAL_CONFIG.value.style.chart.zoom.startIndex)) {
        if (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null) {
            return FINAL_CONFIG.value.style.chart.zoom.startIndex + 1;
        } else {
            return 1;
        }
    }
    return v;
}

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiDonutEvolution',
            type: 'dataset'
        })
    } else {
        if(props.dataset.length) {
            props.dataset.forEach((ds, i) => {
                getMissingDatasetAttributes({
                    datasetObject: ds,
                    requiredAttributes: ['name', 'values']
                }).forEach(attr => {
                    error({
                        componentName: 'VueUiDonutEvolution',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: i
                    })
                })
            })
        }
    }
    setupSlicer();
}

const uid = ref(createUid());
const segregated = ref([]);
const hoveredIndex = ref(null);
const hoveredDatapoint = ref(null);
const isFixed = ref(false);
const fixedDatapoint = ref(null);
const donutEvolutionChart = ref(null);
const noTitle = ref(null);
const step = ref(0);
const slicerStep = ref(0);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);

const emit = defineEmits(['selectLegend'])

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

    let finalConfig = {};

    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_donut_evolution[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.chart.zoom.startIndex')) {
        finalConfig.style.chart.zoom.startIndex = props.config.style.chart.zoom.startIndex;
    } else {
        finalConfig.style.chart.zoom.startIndex = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.zoom.endIndex')) {
        finalConfig.style.chart.zoom.endIndex = props.config.style.chart.zoom.endIndex;
    } else {
        finalConfig.style.chart.zoom.endIndex = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
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

watch(() => props.dataset, (_) => {
    refreshSlicer();
}, { deep: true })

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: uid.value,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-donut-evolution',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show
});

const padding = computed(() => {
    return {
        top: FINAL_CONFIG.value.style.chart.layout.padding.top,
        right: FINAL_CONFIG.value.style.chart.layout.padding.right,
        bottom: FINAL_CONFIG.value.style.chart.layout.padding.bottom,
        left: FINAL_CONFIG.value.style.chart.layout.padding.left,
    }
});

const svg = computed(() => {
    const absoluteHeight = FINAL_CONFIG.value.style.chart.layout.height;
    const absoluteWidth = FINAL_CONFIG.value.style.chart.layout.width;
    const height = absoluteHeight - padding.value.top - padding.value.bottom;
    const width = absoluteWidth - padding.value.left - padding.value.right;
    return {
        absoluteHeight,
        absoluteWidth,
        centerX: padding.value.left + (width / 2),
        centerY: padding.value.top + (height / 2),
        height,
        width,
    }
});

const convertedDataset = computed(() => {
    props.dataset.forEach((ds, i) => {
        if([null, undefined].includes(ds.name)){
            error({
                componentName: 'VueUiDonutEvolution',
                type: 'datasetSerieAttribute',
                property: 'name',
                index: i
            });
        }
        if([null, undefined].includes(ds.values)){
            error({
                componentName: 'VueUiDonutEvolution',
                type: 'datasetSerieAttribute',
                property: 'values',
                index: i
            });
        }
    });
    
    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            values: sanitizeArray(ds.values),
            color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            length: (ds.values || []).length,
            uid: createUid(),
        }
    });
});

const mutableDataset = computed(() => {
    return convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
        return {
            ...ds,
            values: ds.values.filter((_v, k) => k >= slicer.value.start && k <= slicer.value.end)
        }
    });
});

const maxLength = computed(() => {
    return Math.max(...mutableDataset.value.map(ds => ds.length))
});

const slit = computed(() => {
    return svg.value.width / (slicer.value.end - slicer.value.start);
});

const drawableDataset = computed(() => {
    const arr = [];
    for(let i = 0; i < (slicer.value.end - slicer.value.start); i += 1) {
        const values = mutableDataset.value
            .map(ds => ds.values[i] ?? null)
        const allValuesAreNull = values.filter(v => [undefined, null].includes(v)).length === values.length;
        const subtotal = values.reduce((a, b) => a + b, 0);
        const percentages = values.map(v => v / subtotal);
        const x = padding.value.left + (slit.value * i) + slit.value / 2;
        arr.push({
            index: i,
            percentages,
            subtotal : allValuesAreNull || subtotal < 0 ? null : subtotal,
            values,
            x,
        });
    }
    
    const minSubtotal = 0;
    const maxSubtotal = Math.max(...arr.map(a => a.subtotal))
    const maxScale = arr.length === 1 ? maxSubtotal * 2 : maxSubtotal;
    
    return arr.map((a, i) => {
        const radiusReference = (slit.value / 2) * 0.7;
        const radius = radiusReference > svg.value.width / 16 ? svg.value.width / 16 : radiusReference;
        const activeRadius = hoveredIndex.value === a.index ? svg.value.width / 16 : radius;
        const hoverRadius = arr.length > 4 ? radiusReference * 2 : radiusReference * 2 > (slit.value / 2 * 0.7) ? slit.value / 2 * 0.7 : radiusReference * 2
        const y = svg.value.absoluteHeight - padding.value.bottom - (svg.value.height * a.subtotal / calculateNiceScale(minSubtotal, maxScale, FINAL_CONFIG.value.style.chart.layout.grid.yAxis.dataLabels.steps).max);
        return {
            ...a,
            y,
            radius,
            activeRadius,
            hoverRadius,
            donut: makeDonut({
                series: mutableDataset.value.map((s, k) => {
                    return {
                        color: s.color,
                        name: s.name,
                        value: s.values[i] ?? 0
                    }
                })
            }, a.x, y, radius, radius, 1.99999, 2, 1, 360, 105.25, radius / 2),
            donutHover: makeDonut({
                series: mutableDataset.value.map((s, k) => {
                    return {
                        color: s.color,
                        name: s.name,
                        value: s.values[i] ?? 0
                    }
                })
            }, a.x, y, hoverRadius, hoverRadius, 1.99999, 2, 1, 360, 105.25, hoverRadius / 2),
            donutFocus: makeDonut({
                series: mutableDataset.value.map((s, k) => {
                    return {
                        color: s.color,
                        name: s.name,
                        value: s.values[i] ?? 0
                    }
                })
            }, svg.value.centerX, svg.value.centerY, svg.value.height / 3.6, svg.value.height / 3.6, 1.99999, 2, 1, 360, 105.25, svg.value.height / 6),
        }
    })
});

function labellizeValue(val, datapoint, index) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.dataLabels.formatter,
        val,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.layout.dataLabels.prefix,
            v: val,
            s: FINAL_CONFIG.value.style.chart.layout.dataLabels.suffix,
            r: FINAL_CONFIG.value.style.chart.layout.dataLabels.rounding
        }),
        { datapoint, index }
    );
}

const extremes = computed(() => {
    return {
        max: Math.max(...drawableDataset.value.map(ds => ds.subtotal)),
        min: 0
    }
});

const niceScale = computed(() => {
    const maxScale = drawableDataset.value.length === 1 ? extremes.value.max * 2 : extremes.value.max
    return calculateNiceScale(extremes.value.min, maxScale, FINAL_CONFIG.value.style.chart.layout.grid.yAxis.dataLabels.steps)
})

function ratioToMax(value) {
    return value / niceScale.value.max;
}

const yLabels = computed(() => {
    return niceScale.value.ticks.map(t => {
        return {
            y: svg.value.absoluteHeight - padding.value.bottom - (svg.value.height * ratioToMax(t)),
            value: t
        }
    })
});

function displayArcPercentage(arc, stepBreakdown) {
    return isNaN(arc.value / sumByAttribute(stepBreakdown, 'value')) ? 0 : ((arc.value / sumByAttribute(stepBreakdown, "value")) * 100).toFixed(0) + "%";
}

function leave() {
    hoveredIndex.value = null;
    hoveredDatapoint.value = null;
}

function enter(datapoint) {
    hoveredIndex.value = datapoint.index;
    hoveredDatapoint.value = datapoint;
}

const fixedDatapointIndex = ref(null);

function fixDatapoint(datapoint, index) {
    if(!datapoint.subtotal || !FINAL_CONFIG.value.style.chart.dialog.show) return;
    hoveredDatapoint.value = null;
    hoveredIndex.value = null;
    isFixed.value = true;
    fixedDatapoint.value = datapoint;
    createDonutDatasetForDialog(datapoint);
    if(![null, undefined].includes(index)) {
        fixedDatapointIndex.value = index;
    }
}

const legendSet = computed(() => {
    return convertedDataset.value
        .map((serie, i) => {
            return {
                name: serie.name,
                value: serie.values.slice(slicer.value.start, slicer.value.end).reduce((a,b) => a + b, 0),
                shape: 'circle',
                uid: serie.uid,
                color: serie.color
            }
        })
        .sort((a,b) => b.value - a.value)
        .map((el) => {
            return {
                ...el,
                opacity: segregated.value.includes(el.uid) ? 0.5 : 1,
                segregate: () => segregate(el.uid),
                isSegregated: segregated.value.includes(el.uid)
            }
        })
});

const grandTotal = computed(() => {
    return drawableDataset.value.map(ds => ds.subtotal).reduce((a,b) => a + b, 0)
})

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

function segregate(id) {
    if(segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(s => s !== id);
        emit('selectLegend', null)
    }else {
        if(segregated.value.length === convertedDataset.value.length - 1) return;
        segregated.value.push(id);
        emit('selectLegend', convertedDataset.value.find(d => d.uid === id));
    }
    if(fixedDatapoint.value) {
        fixDatapoint(drawableDataset.value.find((_, i) => i === fixedDatapointIndex.value))
    }
}

const table = computed(() => {
    const head = [''].concat(convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    })).concat(['Σ']);
    let body = [];

    for(let i = 0; i < maxLength.value; i += 1) {
        const sum = convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
            return ds.values[i] ?? 0
        }).reduce((a, b) => a + b, 0);

        body.push([FINAL_CONFIG.value.style.chart.layout.grid.xAxis.dataLabels.values[i] ?? '-'].concat(convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => {
            return {
                value: ds.values[i] ?? 0,
                percentage: ds.values[i] ? ds.values[i] / sum * 100 : 0
            }
        })).concat([`${FINAL_CONFIG.value.style.chart.layout.dataLabels.prefix}${Number(sum.toFixed(FINAL_CONFIG.value.table.td.roundingValue))}${FINAL_CONFIG.value.style.chart.layout.dataLabels.suffix}`]))

    }

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
        FINAL_CONFIG.value.table.columnNames.period
    ].concat(convertedDataset.value.filter(ds => !segregated.value.includes(ds.uid)).map(ds => ds.name)).concat(FINAL_CONFIG.value.table.columnNames.total)

    return { head, body, config, colNames };
});

function getData() {
    return convertedDataset.value;
}

function generateCsv() {
    nextTick(() => {
        const title = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[""]];
        const head = [...table.value.head.map(h => h.name ?? h)];
        const body = [...table.value.body.map(b => {
            return b.map(t => t.value ?? t)
        })];
        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-donut-evolution"});
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

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function isArcBigEnoughHover(arc) {
    return arc.proportion * 100 > FINAL_CONFIG.value.style.chart.donuts.hover.hideLabelsUnderValue;
}

const donutDataset = ref([]);
const donutConfig = ref({});
const dialog = ref(null);

function createDonutDatasetForDialog(ds) {
    donutDataset.value = ds.donut.map(ds => {
        return {
            name: ds.name,
            values: [ds.value],
            color: ds.color
        }
    });

    donutConfig.value = deepEmptyObjectToNull({
        ...FINAL_CONFIG.value.style.chart.dialog.donutChart,
        responsive: true,
        theme: FINAL_CONFIG.value.theme,
    });

    dialog.value && dialog.value.open();
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
    <div ref="donutEvolutionChart" :class="`vue-ui-donut-evolution ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" :id="uid" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
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

        <div v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`" @mouseleave="leave">
            <!-- TITLE AS DIV -->
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-evolution-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'donut-evolution-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="donutEvolutionChart"
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
            v-if="isDataset" 
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" 
            data-cy="donut-evolution-svg" 
            :viewBox="`0 0 ${svg.absoluteWidth} ${svg.absoluteHeight}`" 
            :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color};`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="padding.left"
                :y="padding.top"
                :width="svg.width"
                :height="svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <defs>
                <linearGradient :id="`hover_${uid}`" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, FINAL_CONFIG.style.chart.layout.highlighter.opacity)"/>
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.layout.highlighter.color, FINAL_CONFIG.style.chart.layout.highlighter.opacity)"/>
                </linearGradient>

                <radialGradient :id="`focus_${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(convertColorToHex(FINAL_CONFIG.style.chart.backgroundColor), 0)" />
                    <stop offset="77%" :stop-color="setOpacity('#FFFFFF', 30)" />
                    <stop offset="100%" :stop-color="setOpacity(convertColorToHex(FINAL_CONFIG.style.chart.backgroundColor), 0)" />
                </radialGradient>
            </defs>
            

            <!-- GRID -->
            <g v-if="FINAL_CONFIG.style.chart.layout.grid.show">
                <line
                    data-cy="axis-y"
                    :x1="padding.left" 
                    :x2="padding.left" 
                    :y1="padding.top" 
                    :y2="padding.top + svg.height" 
                    :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke" 
                    :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth" 
                    stroke-linecap="round"
                />

                <line 
                    data-cy="axis-x"
                    :x1="padding.left" 
                    :x2="svg.absoluteWidth - padding.right" 
                    :y1="svg.absoluteHeight - padding.bottom" 
                    :y2="svg.absoluteHeight - padding.bottom" 
                    :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke" 
                    :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth" 
                    stroke-linecap="round" 
                />

                <g v-if="FINAL_CONFIG.style.chart.layout.grid.showVerticalLines">
                    <line
                        data-cy="vertical-separator"
                        v-for="(l, i) in (slicer.end - slicer.start)" 
                        :x1="padding.left + ((i +1 ) * slit)" 
                        :x2="padding.left + ((i +1) * slit)" 
                        :y1="padding.top" 
                        :y2="svg.absoluteHeight - padding.bottom" 
                        :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke" 
                        :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth" 
                        stroke-linecap="round"
                    />
                </g>
            </g>

            <!-- Y LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.show" :class="{'donut-opacity': true, 'donut-behind': hoveredIndex !== null}">
                <g v-for="(yLabel, i) in yLabels">
                    <line 
                        data-cy="axis-y-tick"
                        v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max"
                        :x1="padding.left" 
                        :x2="padding.left - 5" 
                        :y1="yLabel.y" 
                        :y2="yLabel.y" 
                        :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke" 
                        :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth" 
                    />
                    <text
                        data-cy="axis-y-label"
                        v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max" 
                        :x="padding.left - 8 + FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.offsetX" 
                        :y="yLabel.y + FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.fontSize / 3" 
                        :font-size="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.fontSize" 
                        text-anchor="end"
                        :fill="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.color"
                        :font-weight="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.bold ? 'bold' : 'normal'"
                    >
                        {{ canShowValue(yLabel.value) ? applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.dataLabels.formatter,
                            yLabel.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.layout.dataLabels.prefix,
                                v: yLabel.value,
                                s: FINAL_CONFIG.style.chart.layout.dataLabels.suffix,
                                r: FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.roundingValue
                            }),
                            { datapoint: yLabel, seriesIndex: i }
                        ) : '' 
                        }}
                    </text>
                </g>
            </g>

            <!-- X LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.show" :class="{'donut-opacity': true,}">
                <g v-for="(_, i) in (slicer.end - slicer.start)">
                    <text
                        data-cy="axis-x-label"
                        v-if="(FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.showOnlyFirstAndLast && (i === 0 || i === maxLength - 1)) || !FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.showOnlyFirstAndLast"
                        :text-anchor="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.rotation < 0 ? 'end' : 'middle'"
                        :font-size="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.fontSize"
                        :fill="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.color"
                        :transform="`translate(${padding.left + (slit * i) + (slit / 2)}, ${FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.offsetY + svg.absoluteHeight - padding.bottom + FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.fontSize * 2}), rotate(${FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.rotation})`"

                    >
                        {{ FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.values[Number(i) + Number(slicer.start)] ?? '' }}
                    </text>
                </g>
            </g>
            
            <!-- DATAPOINTS -->
            <g v-for="(datapoint, i ) in drawableDataset">
                <line
                    :class="{'donut-opacity': true, 'donut-behind': hoveredIndex !== null}"
                    v-if="FINAL_CONFIG.style.chart.layout.line.show && i < drawableDataset.length - 1 && ![datapoint.subtotal, drawableDataset[i + 1].subtotal].includes(null)"
                    :x1="datapoint.x"
                    :y1="datapoint.y"
                    :x2="drawableDataset[i + 1].x"
                    :y2="drawableDataset[i + 1].y"
                    :stroke="FINAL_CONFIG.style.chart.layout.line.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.line.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <g v-if="datapoint.subtotal !== null">
                    <circle
                        v-if="datapoint.subtotal"
                        :cx="datapoint.x"
                        :cy="datapoint.y"
                        :r="datapoint.activeRadius"
                        :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    />
                </g>
            </g>

            <g v-for="(datapoint, i ) in drawableDataset" :data-cy="`donut-wrapper-${i}`" :class="{'donut-opacity': true, 'donut-behind': (i !== hoveredIndex && hoveredIndex !== null)}">
                <g v-if="datapoint.subtotal">
                    <g v-if="hoveredIndex !== null && hoveredIndex === i">
                        <g v-for="arc in datapoint.donutHover">
                            <path
                                v-if="isArcBigEnoughHover(arc)"
                                :data-cy="`donut_hover_${i}`"
                                :d="calcNutArrowPath(arc, {x: arc.center.endX, y: arc.center.endY}, 12, 12, { x: datapoint.x, y: datapoint.y}, false, 20)"
                                :stroke="arc.color"
                                stroke-width="1"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                fill="none"
                            />
                        </g>
                        <!-- DATALABELS (hovered datapoint) -->
                        <g v-for="(arc, i) in datapoint.donutHover">
                            <text
                                v-if="isArcBigEnoughHover(arc)"
                                :data-cy="`donut-datalabel-value-${i}`"
                                data-cy-hover-label
                                :text-anchor="calcMarkerOffsetX(arc, true, 0).anchor"
                                :x="calcMarkerOffsetX(arc, true, 9).x"
                                :y="calcMarkerOffsetY(arc, 14, 10)"
                                :fill="FINAL_CONFIG.style.chart.layout.grid.yAxis.dataLabels.color"
                                :font-size="8"
                                :font-weight="'bold'"
                            >
                            {{ arc.name}}: {{ displayArcPercentage(arc, datapoint.donut)  }} ({{ arc.value === null ? '-' : labellizeValue(arc.value, arc, i) }})
                            </text>
                        </g>
                        <g>
                            <circle
                                :cx="datapoint.x"
                                :cy="datapoint.y"
                                :r="datapoint.hoverRadius"
                                :fill="FINAL_CONFIG.style.chart.backgroundColor"
                            />
                        </g>
                    </g>
                </g>
            </g>
            <g v-for="(datapoint, i ) in drawableDataset" :class="{'donut-opacity': true, 'donut-behind': (i !== hoveredIndex && hoveredIndex !== null)}">
                <g v-if="datapoint.subtotal !== null">
                    <circle 
                        v-if="datapoint.subtotal === 0"
                        :cx="datapoint.x"
                        :cy="datapoint.y"
                        :r="3"
                        :fill="FINAL_CONFIG.style.chart.color"
                    />
                    <g v-else-if="hoveredIndex !== null && hoveredIndex === i">
                        <path 
                            v-for="(arc, k) in datapoint.donutHover"
                            :d="arc.arcSlice"
                            :fill="`${arc.color}`"
                            :stroke-width="1"
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        />
                    </g>
                    <g v-else>
                        <path
                        :data-cy="`arc_${i}`"
                            v-for="(arc, k) in datapoint.donut"
                            :d="arc.arcSlice"
                            :fill="`${arc.color}`"
                            :stroke-width="0.5"
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        />
                    </g>
                </g>
            </g>

            <!-- DATALABELS -->
            <g v-for="(datapoint, i ) in drawableDataset" :class="{'donut-opacity': true, 'donut-behind': (i !== hoveredIndex && hoveredIndex !== null) || (isFixed && i !== fixedDatapoint.index)}">
                <text 
                    v-if="datapoint.subtotal !== null && FINAL_CONFIG.style.chart.layout.dataLabels.show"
                    text-anchor="middle"
                    :x="datapoint.x"
                    :y="hoveredIndex === datapoint.index && datapoint.subtotal ? datapoint.y + FINAL_CONFIG.style.chart.layout.dataLabels.fontSize / 3 : datapoint.y - datapoint.radius - FINAL_CONFIG.style.chart.layout.dataLabels.fontSize + FINAL_CONFIG.style.chart.layout.dataLabels.offsetY"
                    :font-size="FINAL_CONFIG.style.chart.layout.dataLabels.fontSize"
                    :font-weight="'bold'"
                    :fill="FINAL_CONFIG.style.chart.layout.dataLabels.color"
                >
                    {{ labellizeValue(datapoint.subtotal, datapoint, i) }}
                </text>
            </g>

            <!-- TRAPS -->
            <rect 
                v-for="(datapoint, i) in drawableDataset"
                :x="padding.left + (i * slit)"
                :y="padding.top"
                :width="slit"
                :height="svg.height"
                :fill="[hoveredIndex, fixedDatapointIndex].includes(datapoint.index) ? `url(#hover_${uid})` : 'transparent'"
                :class="{'donut-hover': datapoint.subtotal && [hoveredIndex, fixedDatapointIndex].includes(datapoint.index)}"
                :style="{
                    pointerEvents: 'none'
                }"
            />
            <rect 
                v-for="(datapoint, i) in drawableDataset"
                :data-cy="`trap-${i}`"
                data-cy-trap
                :x="padding.left + (i * slit)"
                :y="padding.top"
                :width="slit"
                :height="svg.height"
                fill="transparent"
                @mouseenter="enter(datapoint)"
                @mouseleave="leave"
                @click="fixDatapoint(datapoint, i)"
                :class="{'donut-hover': hoveredIndex === datapoint.index && datapoint.subtotal}"
            />
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'donutEvolution',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    donutEvolution: {
                        axis: {
                            color: '#CCCCCC'
                        },
                        donuts: {
                            color: '#CCCCCC'
                        }
                    }
                }
            }"
        />

        <Slicer
            ref="slicerComponent"
            v-if="maxLength > 1 && FINAL_CONFIG.style.chart.zoom.show"
            :key="`slicer_${slicerStep}`"
            :background="FINAL_CONFIG.style.chart.zoom.color"
            :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
            :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
            :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
            :labelLeft="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.values[Number(slicer.start)] || ''"
            :labelRight="FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.values[Number(slicer.end)-1] || ''"
            :textColor="FINAL_CONFIG.style.chart.color"
            :inputColor="FINAL_CONFIG.style.chart.zoom.color"
            :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
            :max="maxLength"
            :min="0"
            :valueStart="slicer.start"
            :valueEnd="slicer.end"
            v-model:start="slicer.start"
            v-model:end="slicer.end"
            :refreshStartPoint="FINAL_CONFIG.style.chart.zoom.startIndex !== null ? FINAL_CONFIG.style.chart.zoom.startIndex : 0"
            :refreshEndPoint="FINAL_CONFIG.style.chart.zoom.endIndex !== null ? FINAL_CONFIG.style.chart.zoom.endIndex + 1 : maxLength"
            :enableRangeHandles="FINAL_CONFIG.style.chart.zoom.enableRangeHandles"
            :enableSelectionDrag="FINAL_CONFIG.style.chart.zoom.enableSelectionDrag"
            @reset="refreshSlicer"
        >
            <template #reset-action="{ reset }">
                <slot name="reset-action" v-bind="{ reset }"/>
            </template>
        </Slicer>

        <Legend
            v-if="FINAL_CONFIG.style.chart.legend.show"
            :key="`legend_${legendStep}`"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({legend}) => segregate(legend.uid)"
        >
            <template #item="{legend, index}">
                <div data-cy="legend-item" @click="segregate(legend.uid)" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`">
                    {{ legend.name }}: {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.dataLabels.formatter,
                        legend.value,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.layout.dataLabels.prefix,
                            v: legend.value,
                            s: FINAL_CONFIG.style.chart.layout.dataLabels.suffix,
                            r: FINAL_CONFIG.style.chart.legend.roundingValue
                        }),
                        { datapoint: legend, seriesIndex: index }
                        ) 
                    }}

                    <span v-if="!segregated.includes(legend.uid)">
                        ({{ isNaN(legend.value / grandTotal) ? '-' : dataLabel({
                            v: legend.value / grandTotal * 100,
                            s: '%',
                            r: FINAL_CONFIG.style.chart.legend.roundingPercentage
                        })}})
                    </span>
                    <span v-else>
                        ( - % )
                    </span>
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="legendSet"></slot>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

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
                    :key="`table_${tableStep}`"
                    :colNames="table.colNames"
                    :head="table.head" 
                    :body="table.body" 
                    :config="table.config" 
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{th}">
                        {{ th.name ?? th }}
                    </template>
                    <template #td="{td}">
                        <span v-if="td.value === null">-</span>
                        <b v-else>
                            {{ !isNaN(td.value) ? FINAL_CONFIG.style.chart.layout.dataLabels.prefix : '' }}{{ !isNaN(td.value) && td.value !== null ? Number(td.value.toFixed(FINAL_CONFIG.table.td.roundingValue)).toLocaleString() : td }}{{ !isNaN(td.value) ? FINAL_CONFIG.style.chart.layout.dataLabels.suffix : '' }} 
                        </b>
                        <span>
                            {{ td.percentage && !isNaN(td.percentage) ? `(${Number(td.percentage.toFixed(FINAL_CONFIG.table.td.roundingPercentage)).toLocaleString()}%)` : '' }}
                        </span>
                    </template>
                </DataTable>
            </template>
        </Accordion>

        <BaseDraggableDialog 
            v-if="FINAL_CONFIG.style.chart.dialog.show" 
            ref="dialog" 
            @close="fixedDatapoint = null; isFixed = false"
            :backgroundColor="FINAL_CONFIG.style.chart.dialog.backgroundColor"
            :color="FINAL_CONFIG.style.chart.dialog.color"
            :headerBg="FINAL_CONFIG.style.chart.dialog.header.backgroundColor"
            :headerColor="FINAL_CONFIG.style.chart.dialog.header.color">
            <template #title>
                {{ FINAL_CONFIG.style.chart.layout.grid.xAxis.dataLabels.values[Number(fixedDatapoint.index) + Number(slicer.start)] }}
            </template>
            <VueUiDonut 
                v-if="fixedDatapoint" 
                :config="donutConfig" 
                :dataset="donutDataset" 
            />
        </BaseDraggableDialog>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-donut-evolution *{
    transition: unset;
    transition: opacity 0.5s ease-in-out;
}
.vue-ui-donut-evolution {
    user-select: none;
    position: relative;
}

.vue-ui-donut-evolution-focus {
    animation: donut 0.5s ease-in-out;
    transform-origin: center;
}

.donut-hover {
    cursor: pointer;
}

.donut-opacity {
    transition: opacity 0.2s ease-in-out;
}
.donut-behind {
    opacity: 0.1;
}

@keyframes donut {
    0% {
        transform: scale(0.9,0.9);
        opacity: 0;
    }
    80% {
        transform: scale(1.02,1.02);
        opacity: 1;
    }
    to {
        transform: scale(1,1);
        opacity: 1;
    }
}

.vue-ui-donut-evolution-dialog * {
    animation: dialog-pop 0.1s ease-in !important;
    transform-origin: center !important;
}

@keyframes dialog-pop {
    0% {
        transform: scale(0.8,0.8);
        opacity: 0;
    }
    90% {
        transform: scale(1.05, 1.05);
        opacity: 1;
    }
    100% {
        transform: scale(1,1);
        opacity: 1;
    }
}

</style>
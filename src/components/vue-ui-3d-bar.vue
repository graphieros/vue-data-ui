<script setup>
import { ref, computed, onMounted, nextTick, watch, defineAsyncComponent } from "vue";
import {
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcNutArrowPath,
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    lightenHexColor,
    makeDonut,
    objectIsEmpty, 
    palette,
    setOpacity,
    themePalettes,
    XMLNS
} from '../lib';
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes.json";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_3d_bar: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Object,
        default() {
            return {}
        }
    },
});

const emits = defineEmits(['selectDatapoint'])

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
});

const uid = ref(createUid());
const details = ref(null);
const bar3dChart = ref(null);
const selectionIsFixed = ref(false);
const titleStep = ref(0);
const tableStep = ref(0);

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
                userConfig: themes.vue_ui_3d_bar[mergedConfig.theme] || props.config,
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
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `3d_bar_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-3d-bar',
    options: FINAL_CONFIG.value.userOptions.print
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show
});

const hasStack = computed(() => {
    return props.dataset.series && props.dataset.series.length;
});

const svg = computed(() => {
    return {
        height: FINAL_CONFIG.value.style.chart.box.dimensions.height,
        width: FINAL_CONFIG.value.style.chart.box.dimensions.width,
        absoluteWidth: FINAL_CONFIG.value.style.chart.box.dimensions.width * (hasStack.value ? 2 : 1 ),
        top: FINAL_CONFIG.value.style.chart.box.dimensions.top,
        bottom: FINAL_CONFIG.value.style.chart.box.dimensions.bottom,
        left: FINAL_CONFIG.value.style.chart.box.dimensions.left,
        right: FINAL_CONFIG.value.style.chart.box.dimensions.right,
        perspective: FINAL_CONFIG.value.style.chart.box.dimensions.perspective
    }
});

const stack = computed(() => {
    if(hasStack.value) {
        const total = props.dataset.series.map(s => s.value || 0).reduce((a, b) => a + b, 0);
        const formatted = props.dataset.series.map((ds, i) => {
            return {
                ...ds,
                id: createUid(),
                proportion: (ds.value || 0) / total,
                color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                breakdown: ds.breakdown ? ds.breakdown.sort((a,b) => b.value - a.value) : null
            }
        })
        .sort((a, b) => b.value - a.value)
        const res = [];
        let start = 0;
        for(let i = 0; i < formatted.length; i += 1) {
            res.push({
                ...formatted[i],
                fill: createFill(start, formatted[i].proportion, formatted[i].breakdown, formatted[i].color)
            });
            start += formatted[i].proportion
        }
        return res
    }
    return null
})

const box = computed(() => {
    return {
        right: `M${svg.value.width / 2},${svg.value.top} ${svg.value.width - svg.value.right}, ${svg.value.top + svg.value.perspective} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective} ${svg.value.width / 2},${svg.value.height - svg.value.bottom}`,
        left: `M${svg.value.width / 2},${svg.value.top} ${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective} ${svg.value.width / 2},${svg.value.height - svg.value.bottom}`,
        side: `M${svg.value.width / 2},${svg.value.height - svg.value.bottom} ${svg.value.width / 2},${svg.value.top + (svg.value.perspective * 2)}`,
        topSides: `M${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.width / 2},${svg.value.top + (svg.value.perspective * 2)} ${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective}`,
        tubeTop: `M${svg.value.left},${svg.value.top + svg.value.perspective} C ${svg.value.left},${svg.value.top - (svg.value.perspective / 3)} ${svg.value.width - svg.value.right},${svg.value.top - (svg.value.perspective / 3)} ${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective} C ${svg.value.width - svg.value.right},${svg.value.top + (svg.value.perspective * 2.3)} ${svg.value.left},${svg.value.top + (svg.value.perspective * 2.3)} ${svg.value.left},${svg.value.top + svg.value.perspective}`,
        tubeLeft: `M${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective}`,
        tubeRight: `M${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective}`,
        tubeBottom: `M${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective} C ${svg.value.width - svg.value.right},${svg.value.height} ${svg.value.left},${svg.value.height} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective}`
    }
});

const activeValue = ref(FINAL_CONFIG.value.style.chart.animation.use ? 0 : props.dataset.percentage);

onMounted(() => {
    prepareChart();

    let acceleration = 0;
    let speed = FINAL_CONFIG.value.style.chart.animation.speed;
    let incr = (0.005) * FINAL_CONFIG.value.style.chart.animation.acceleration;
    function animate() {
        activeValue.value += speed + acceleration;
        acceleration += incr;
        if(activeValue.value < props.dataset.percentage) {
            requestAnimationFrame(animate)
        } else {
            activeValue.value = props.dataset.percentage
        }
    }

    if(FINAL_CONFIG.value.style.chart.animation.use) {
        activeValue.value = 0;
        animate()
    }
})

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUi3dBar',
            type: 'dataset'
        })
    } else {
        if(!props.dataset.series) {
            getMissingDatasetAttributes({
                datasetObject: props.dataset,
                requiredAttributes: ['percentage']
            }).forEach(attr => {
                error({
                    componentName: 'VueUi3dBar',
                    type: 'datasetAttribute',
                    property: attr
                })
            })
        } else {
            props.dataset.series.forEach((serie, i) => {
                getMissingDatasetAttributes({
                    datasetObject: serie,
                    requiredAttributes: ['name', 'value']
                }).forEach(attr => {
                    error({
                        componentName: 'VueUi3dBar',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: i
                    })
                });
                if(serie.breakdown) {
                    serie.breakdown.forEach((b, j) => {
                        getMissingDatasetAttributes({
                            datasetObject: b,
                            requiredAttributes: ['name', 'value']
                        }).forEach(attr => {
                            error({
                                componentName: 'VueUi3dBar',
                                type: 'datasetSerieAttribute',
                                property: attr,
                                index: `${i} - ${j}`
                            })
                        })
                    })
                }
            })
        }
    }
}

function createFill(startProportion, proportion, breakdown, color) {
    const height = svg.value.height - svg.value.bottom - svg.value.top - (svg.value.perspective * 2);
    const { width: W, height: H, bottom: B, right: R, left: L,  perspective: P} = svg.value;
    const relativeB = B + height * startProportion;
    const midY = H - relativeB - P - (height * proportion / 2);
    const donutPosition = midY > svg.value.height / 2 ? 'top' : 'bottom';
    const donutOffset = 64;

    const hasBreakdown = !!breakdown;
    let donut = null;
    let miniDonut = null;
    if (hasBreakdown) {
        breakdown = breakdown
            .map((ds, i) => {
            return {
                ...ds,
                value: ds.value || 0,
                color: lightenHexColor(color, i / (breakdown.length))
            }
        });
        donut = makeDonut(
            { series: breakdown },
            W + svg.value.absoluteWidth / 4 - 14,
            donutPosition === 'top' ? midY - donutOffset : midY + donutOffset,
            28,
            28,
            1.99999,
            2,
            1,
            360,
            105.25,
            14
        );
        miniDonut = makeDonut(
            { series: breakdown },
            W - R + 20,
            H - relativeB - P - (height * proportion /2),
            6,
            6,
            1.99999,
            2,
            1,
            360,
            105.25,
            6
        )
    }

    return {
        donut,
        miniDonut,
        sidePointer: {
            x: W - R,
            y: H - relativeB - P - (height * proportion /2),
            topY: H - relativeB - P - height * proportion,
            height: height * proportion
        },
        apexBottom: {y: H - relativeB, x: W / 2},
        apexTop: {y: H - relativeB - height * proportion, x: W / 2},
        right: `M${W / 2},${H - relativeB} ${W / 2},${H - relativeB - height * proportion} ${W - R},${H - relativeB - P - height * proportion} ${W - R},${H - relativeB - P}Z`,
        left: `M${W / 2},${H - relativeB} ${W / 2},${H - relativeB - height * proportion} ${L}, ${H - relativeB - P - height * proportion} ${L},${H - relativeB - P}Z`,
        liningTop: `M${L},${H - relativeB - P - height * proportion} ${W / 2},${H - relativeB - height * proportion} ${W - R},${H - relativeB - P - height * proportion}`,
        liningTopShade: `M${L},${H - relativeB - P - height * proportion -0.5} ${W / 2},${H - relativeB - height * proportion - 0.5} ${W - R},${H - relativeB - P - height * proportion - 0.5}`,
        top: `M${W / 2},${H - relativeB - height * proportion} ${L},${H - relativeB - P - height * proportion} ${W / 2},${H - relativeB - (P * 2) - (height * proportion)} ${W - R},${H - relativeB - P - height * proportion} Z`,
        tubeTop: `M${L},${H - relativeB - height * proportion - P} C ${L},${H - relativeB - height * proportion - (P *2.5)} ${W - R},${H - relativeB - height * proportion - (P * 2.5)} ${W - R},${H - relativeB - height * proportion - P} C ${W - R},${H - relativeB - height * proportion + P /2} ${L},${H - relativeB - height * proportion + P / 2} ${L},${H - relativeB - height * proportion - P}`,
        bottomTubeTop: `M ${W - R - 0.5},${H - relativeB - P} C ${W - R - 0.5},${H - relativeB + P/2} ${L},${H - relativeB + P/2} ${L + 0.5},${H - relativeB - P}`,
        tubeBody: `M
        ${L},${H - relativeB - height * proportion - P} 
        C ${L},${H - relativeB - height * proportion + P / 2} 
        ${W - R},${H - relativeB - height * proportion + P /2} 
        ${W - R},${H - relativeB - height * proportion - P} 
        L${W - R},${H - relativeB - P}
        C 
        ${W - R},${H - relativeB + P/2}
        ${L},${H - relativeB + P/2}
        ${L},${H - relativeB - P}Z`
    }
}

const fill = computed(() => {
    const proportion = activeValue.value / 100;
    const height = svg.value.height - svg.value.bottom - svg.value.top - (svg.value.perspective * 2);
    const { width: W, height: H, bottom: B, right: R, left: L,  perspective: P} = svg.value;

    const startProportion = 0;
    const relativeB = B + height * startProportion;

    return {
        right: `M${W / 2},${H - relativeB} ${W / 2},${H - relativeB - height * proportion} ${W - R},${H - relativeB - P - height * proportion} ${W - R},${H - relativeB - P}Z`,
        left: `M${W / 2},${H - relativeB} ${W / 2},${H - relativeB - height * proportion} ${L}, ${H - relativeB - P - height * proportion} ${L},${H - relativeB - P}Z`,
        top: `M${W / 2},${H - relativeB - height * proportion} ${L},${H - relativeB - P - height * proportion} ${W / 2},${H - relativeB - (P * 2) - (height * proportion)} ${W - R},${H - relativeB - P - height * proportion} Z`,
        tubeTop: `M${L},${H - relativeB - height * proportion - P} C ${L},${H - relativeB - height * proportion - (P *2.5)} ${W - R},${H - relativeB - height * proportion - (P * 2.5)} ${W - R},${H - relativeB - height * proportion - P} C ${W - R},${H - relativeB - height * proportion + P /2} ${L},${H - relativeB - height * proportion + P / 2} ${L},${H - relativeB - height * proportion - P}`,
        tubeBody: `M
        ${L},${H - relativeB - height * proportion - P} 
        C ${L},${H - relativeB - height * proportion + P / 2} 
        ${W - R},${H - relativeB - height * proportion + P /2} 
        ${W - R},${H - relativeB - height * proportion - P} 
        L${W - R},${H - P * 1.5}
        C 
        ${W - R},${H}
        ${L},${H}
        ${L},${H - relativeB - P}Z`
    }
});

const selectedSerie = ref(null);

function selectSerie(bar, fix = false) {
    emits('selectDatapoint', bar)
    if(!fix) {
        selectedSerie.value = bar.id;
    }
    if(fix && selectionIsFixed.value) {
        selectionIsFixed.value = false;
    }
    if(fix && !selectionIsFixed.value) {
        selectionIsFixed.value = true;
    }
}

function unselectSerie() {
    if(selectionIsFixed.value) {
        return
    } else {
        selectedSerie.value = null
    }
}


function displayArcPercentage(arc, stepBreakdown, numOnly = false) {
    const total = props.dataset.series.map(s => s.value || 0).reduce((a, b) => a + b, 0);
    const absoluteP =  isNaN(arc.value / total) ? 0 : ((arc.value / total) * 100);
    const p = isNaN(arc.value / sumValues(stepBreakdown)) ? 0 : ((arc.value / sumValues(stepBreakdown)) * 100);
    if(numOnly) {
        return p
    } else {
        return absoluteP.toFixed(0) + "%";
    }
}

function sumValues(source) {
    return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
}

function getData() {
    if(hasStack.value) {
        return stack.value
    } else {
        return props.dataset.percentage
    }
}

const table = computed(() => {
    if(!hasStack.value) {
        return null
    } else {
        const head = stack.value.flatMap(ds => {
            if(ds.breakdown && ds.breakdown.length) {
                return [{ name: ds.name, color: ds.color },...ds.breakdown.map((b, i) => {
                    return {
                        name: b.name,
                        color: lightenHexColor(ds.color, i / ds.breakdown.length)
                    }
                })]
            } else {
                return {
                    name: ds.name,
                    color: ds.color
                }
            }
        });
        const body = stack.value.flatMap(ds => {
            if(ds.breakdown && ds.breakdown.length) {
                return [ds.value, ...ds.breakdown.map(b => b.value)]
            } else {
                return ds.value
            }
        });
        return { head, body }
    }
});

function generateCsv() {
    if(!hasStack.value) {
        console.warn('VueUi3dBar : CSV download is only available in stack mode (providing dataset.series instead of dataset.percentage)');
        return;
    }
    nextTick(() => {
        const total = stack.value.map(ds => ds.value).reduce((a, b) => a + b, 0);
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total) ? '-' : table.value.body[i] / total * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-3d-bar" })
    });
}

const dataTable = computed(() => {
    const total = stack.value.map(ds => ds.value).reduce((a, b) => a + b, 0);
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`, dataLabel({p: FINAL_CONFIG.value.style.chart.legend.prefix, v: total, s: FINAL_CONFIG.value.style.chart.legend.suffix, r: FINAL_CONFIG.value.table.td.roundingValue}),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        const label = dataLabel({p: FINAL_CONFIG.value.style.chart.legend.prefix, v: table.value.body[i], s: FINAL_CONFIG.value.style.chart.legend.suffix, r: FINAL_CONFIG.value.table.td.roundingValue});
        return [
            {
                color: h.color,
                name: h.name
            },
            label,
            isNaN(table.value.body[i] / total) ? "-" : dataLabel({
                v: table.value.body[i] / total * 100,
                s: '%',
                r: FINAL_CONFIG.value.table.td.roundingPercentage
            })
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
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint,
        shape: FINAL_CONFIG.value.style.shape === 'tube' ? 'circle' : 'square'
    }

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage
    ]

    return {
        colNames,
        head,
        body,
        config
    }
});

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

defineExpose({
    generateCsv,
    generatePdf,
    generateImage,
    getData,
    toggleTable,
    toggleAnnotator
});
</script>

<template>
    <div ref="bar3dChart" :class="`vue-ui-3d-bar`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" :id="`3d_bar_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent`">
            <!-- TITLE AS DIV -->
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: '3dBar-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: '3dBar-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
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
            :hasTable="!!hasStack && FINAL_CONFIG.userOptions.buttons.table"
            :hasXls="!!hasStack && FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="bar3dChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
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
            data-cy="3d-bar-svg" 
            :viewBox="`0 0 ${svg.absoluteWidth} ${svg.height}`" 
            :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.absoluteWidth"
                :height="svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <!-- DEFS -->
            <defs>
                <radialGradient :id="`gradient_top${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)" />
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.chart.bar.color" />
                </radialGradient>
                <radialGradient :id="`gradient_left${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)" />
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.bar.color, 20)" />
                </radialGradient>
                <radialGradient :id="`gradient_right${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)" />
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.bar.color, 20)" />
                </radialGradient>
                <linearGradient :id="`gradient_tube_body${uid}`" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" :stop-color="`${FINAL_CONFIG.style.chart.bar.color}`"/>
                    <stop offset="75%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)"/>
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.bar.color, 40)"/>
                </linearGradient>
            </defs>

            <defs v-if="hasStack">
                <radialGradient v-for="bar in stack" :id="`grad_top_${bar.id}`">
                    <stop offset="0%" :stop-color="setOpacity(lightenHexColor(bar.color, 0.5), 80)" />
                    <stop offset="100%" :stop-color="bar.color" />
                </radialGradient>
                <linearGradient v-for="bar in stack" :id="`grad_left_${bar.id}`">
                    <stop offset="0%" :stop-color="setOpacity(bar.color, 80)" />
                    <stop offset="100%" :stop-color="setOpacity(darkenHexColor(bar.color, 0.5), 100)" />
                </linearGradient>
                <linearGradient v-for="bar in stack" :id="`grad_right_${bar.id}`">
                    <stop offset="2%" :stop-color="setOpacity(lightenHexColor(bar.color, 0.5), 100)" />
                    <stop offset="100%" :stop-color="setOpacity(bar.color, 80)" />
                </linearGradient>
                <linearGradient x1="0%" y1="0%" x2="0%" y2="100%" :id="`vertical_line_${uid}`">
                    <stop offset="0%" stop-color="#FFFFFF"/>
                    <stop offset="100%" stop-color="#FFFFFF33"/>
                </linearGradient>
            </defs>

            <text
                data-cy="vue-ui-3d-bar-simple-datalabel"
                v-if="FINAL_CONFIG.style.chart.dataLabel.show && ![null, undefined].includes(props.dataset.percentage) && [null, undefined].includes(props.dataset.series)"
                :x="svg.width / 2"
                :y="svg.top - FINAL_CONFIG.style.chart.dataLabel.fontSize / 2"
                :font-size="FINAL_CONFIG.style.chart.dataLabel.fontSize"
                :font-weight="FINAL_CONFIG.style.chart.dataLabel.bold ? 'bold': 'normal'"
                :fill="FINAL_CONFIG.style.chart.dataLabel.color"
                text-anchor="middle"
            >
                {{ dataLabel({
                    v: activeValue,
                    s: '%',
                    r: FINAL_CONFIG.style.chart.dataLabel.rounding
                })}}
            </text>
            
            <!-- FIX KILLER -->
            <g v-if="selectionIsFixed" @click="selectionIsFixed = false; selectedSerie = null" data-dom-to-png-ignore style="cursor:pointer">
                <rect :x="svg.width / 2 - 6" :y="svg.top - 20" :height="12" :width="12" fill="transparent"/>
                <path :d="`M${svg.width / 2 - 6},${svg.top - 20} ${svg.width / 2 + 6},${svg.top - 9}`" :stroke="FINAL_CONFIG.style.chart.color" stroke-linecap="round" stroke-width="1"/>
                <path :d="`M${svg.width / 2 + 6},${svg.top - 20} ${svg.width / 2 - 6},${svg.top - 9}`" :stroke="FINAL_CONFIG.style.chart.color" stroke-linecap="round" stroke-width="1"/>
            </g>

            <g v-if="!FINAL_CONFIG.style.shape || FINAL_CONFIG.style.shape === 'bar'">            
                <!-- BOX SKELETON -->
                <g v-if="!hasStack">
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.right" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.left" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.side" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.topSides" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                </g>

                <!-- FILL BOX -->
                <g v-if="!hasStack">
                    <path :d="fill.right" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_right${uid})`"/>
                    <path :d="fill.left" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_left${uid})`"/>
                    <path :d="fill.top" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_top${uid})`"/>
                </g>
                
                <g v-if="hasStack">
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0.3 : 1}`" class="vue-ui-3d-bar-stack" :data-cy="`bar-3d-value-${bar.value}`">
                        <path :d="bar.fill.right" :fill="`url(#grad_right_${bar.id})`" @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie"/>
                        <path :d="bar.fill.left" :fill="`url(#grad_left_${bar.id})`" @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie"/>
                        <path :d="bar.fill.top" :fill="`url(#grad_top_${bar.id})`" @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie"/>
                        <path :d="bar.fill.liningTop" stroke="#FFFFFF" stroke-width="0.5" stroke-linecap="round" fill="none" @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie" />
                        
                        <path :d="`M ${bar.fill.apexTop.x},${bar.fill.apexTop.y} ${bar.fill.apexBottom.x},${bar.fill.apexBottom.y}`" :stroke="`#FFFFFF`" stroke-width="0.5" stroke-linecap="round"/> 
                    </g>
                    <g v-for="(bar, i) in stack">
                        <path v-if="i !== stack.length - 1" :d="bar.fill.liningTopShade" :stroke="FINAL_CONFIG.style.chart.bar.shadeColor" stroke-width="0.5" stroke-linecap="round" fill="none" style="pointer-events: none;" />
                    </g>
                    <!-- LEGEND -->
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0 : bar.proportion * 100 > FINAL_CONFIG.style.chart.legend.hideUnderPercentage ? 1 : 0}`" @click="emits('selectDatapoint', bar)">

                        <path :stroke="FINAL_CONFIG.style.chart.color" stroke-dasharray="1" stroke-width="0.5" stroke-linecap="round" :d="`M${bar.fill.sidePointer.x},${bar.fill.sidePointer.y} ${bar.fill.sidePointer.x + 20},${bar.fill.sidePointer.y}`"/>
                        <circle :cx="bar.fill.sidePointer.x + 20" :cy="bar.fill.sidePointer.y" :r="2" :fill="bar.color" :stroke="FINAL_CONFIG.style.chart.backgroundColor" v-if="!bar.fill.miniDonut || !!selectedSerie"/>
                        <foreignObject :x="bar.fill.sidePointer.x + 30" :y="bar.fill.sidePointer.y - FINAL_CONFIG.style.chart.legend.fontSize" :width="svg.absoluteWidth / 2 - 12" :height="FINAL_CONFIG.style.chart.legend.fontSize * 2" style="overflow: visible; position: relative">
                            <div v-if="FINAL_CONFIG.style.chart.legend.showDefault" :style="`height: 100%; width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; align-items:center;justify-content: flex-start; font-size:${FINAL_CONFIG.style.chart.legend.fontSize}px; text-align:left; line-height: ${FINAL_CONFIG.style.chart.legend.fontSize}px; color:${FINAL_CONFIG.style.chart.legend.color}`">
                                {{ applyDataLabel(
                                    FINAL_CONFIG.style.chart.dataLabel.formatter,
                                    bar.value,
                                    `${bar.name}: ${dataLabel({v: bar.proportion * 100, s: '%', r: FINAL_CONFIG.style.chart.legend.roundingPercentage})} (${dataLabel({ 
                                        p: FINAL_CONFIG.style.chart.legend.prefix, 
                                        v: bar.value, 
                                        s: FINAL_CONFIG.style.chart.legend.suffix, 
                                        r: FINAL_CONFIG.style.chart.legend.roundingValue
                                    })})`,
                                    { datapoint: bar, seriesIndex: i, type: 'barDatapoint' }
                                    )
                                }}
                            </div>
                            <slot name="legend" v-bind="{ datapoint: bar, config: FINAL_CONFIG, dataset: stack}"/>
                        </foreignObject>

                        <!-- BREAKDOWN DONUT -->
                        <g v-if="bar.fill.donut && selectedSerie === bar.id">  
                            <!-- DONUT LABEL CONNECTOR -->
                            <g v-for="(arc, j) in bar.fill.donut">                            
                                <path
                                    v-if="displayArcPercentage(arc, bar.fill.donut, true) > 6"
                                    :d="calcNutArrowPath(arc, {x: arc.cx, y: arc.cy}, 0, 8, false, true, 10)"
                                    :stroke="arc.color"
                                    class="vue-ui-donut-arc-path"
                                    stroke-width="0.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    fill="none"
                                />
                            </g>

                            <path 
                                v-for="(arc, j) in bar.fill.donut"
                                class="vue-ui-donut-arc-path"
                                :data-cy="`donut-arc-${j}`"
                                :d="arc.arcSlice" 
                                :fill="`${arc.color}`"
                                :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                                :stroke-width="1"
                            />

                            <!-- DONUT HOLLOW -->
                            <defs>
                                <radialGradient :id="`hollow_gradient_${uid}`">
                                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)" />
                                    <stop offset="77%" stop-color="#FFFFFF20" />
                                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)" />
                                </radialGradient>
                            </defs>
                            <circle class="vue-ui-donut-arc-path" v-for="(arc, j) in bar.fill.donut" :cx="arc.cx" :cy="arc.cy" :r="28" :fill="`url(#hollow_gradient_${uid})`"/>
                            <circle class="vue-ui-donut-arc-path" v-for="(arc, j) in bar.fill.donut" :cx="arc.cx" :cy="arc.cy" :r="14" :fill="FINAL_CONFIG.style.chart.backgroundColor"/>

                            <!-- DONUT DATALABELS -->
                            <g v-for="(arc, i) in bar.fill.donut">
                                <g v-if="displayArcPercentage(arc, bar.fill.donut, true) > 6">                                
                                    <text
                                        :text-anchor="calcMarkerOffsetX(arc, true, 0).anchor"
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="calcMarkerOffsetY(arc, 12, 12)"
                                        :fill="FINAL_CONFIG.style.chart.legend.color"
                                        :font-size="FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                    >
                                        {{ applyDataLabel(
                                            FINAL_CONFIG.style.chart.dataLabel.formatter,
                                            arc.value,
                                            `${displayArcPercentage(arc, bar.fill.donut)} (${dataLabel({
                                                p: FINAL_CONFIG.style.chart.legend.prefix, 
                                                v: arc.value, 
                                                s: FINAL_CONFIG.style.chart.legend.suffix, 
                                                r: FINAL_CONFIG.style.chart.legend.roundingValue
                                            })})`,
                                            { datapoint: arc, seriesIndex: i, type: 'donutDatapoint' }
                                        )}}
                                    </text>
                                    <text
                                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="calcMarkerOffsetY(arc, 12, 12) + FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                        :fill="FINAL_CONFIG.style.chart.legend.color"
                                        :font-size="FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                    >
                                        {{ arc.name }}
                                    </text>
                                </g>
                            </g>
                        </g>

                        <!-- BREAKDOWN MINI DONUT -->
                        <g v-if="bar.fill.miniDonut && !selectedSerie">  
                            <path 
                                v-for="(arc, j) in bar.fill.miniDonut"
                                class="vue-ui-donut-arc-path"
                                :data-cy="`donut-arc-${j}`"
                                :d="arc.arcSlice" 
                                :fill="`${arc.color}`"
                                :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                                :stroke-width="0.5"
                            />
                        </g>
                    </g>
                </g>
            </g>

            <g v-if="FINAL_CONFIG.style.shape === 'tube'">
                <g v-if="!hasStack">
                    <!-- TUBE SKELETON -->
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.tubeTop" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.tubeLeft" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.tubeRight" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.tubeBottom" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <!-- FILL TUBE -->
                    <path :d="fill.tubeTop" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_top${uid})`"/>
                    <path :d="fill.tubeBody" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_body${uid})`"/>
                </g>

                <g v-if="hasStack">
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0.3 : 1}`" class="vue-ui-3d-bar-stack" @click="emits('selectDatapoint', bar)">
                        <defs>
                            <radialGradient :id="`gradient_tube_top_${bar.id}`" fx="10%" cy="55%">
                                <stop offset="0%" :stop-color="setOpacity(lightenHexColor(bar.color, 0.5), 80)" />

                                <stop offset="100%" :stop-color="setOpacity(darkenHexColor(bar.color, 0.1), 80)" />
                            </radialGradient>
                            <linearGradient :id="`gradient_tube_body_${bar.id}`" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" :stop-color="`${bar.color}`"/>
                                <stop offset="10%" :stop-color="setOpacity(darkenHexColor(bar.color, 0.7), 100)"/>
                                <stop offset="25%" :stop-color="setOpacity(darkenHexColor(bar.color, 0.5), 100)"/>
                                <stop offset="75%" :stop-color="setOpacity(bar.color, 80)"/>
                                <stop offset="100%" :stop-color="setOpacity(lightenHexColor(bar.color, 0.7), 100)"/>
                            </linearGradient>
                        </defs>
                        <path @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie" :d="bar.fill.tubeBody" stroke="#FFFFFF" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_body_${bar.id})`"/>
                        <path @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie" :d="bar.fill.bottomTubeTop" stroke="#000000" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" fill="none" v-if="i > 0"/>
                        <path @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie" :d="bar.fill.tubeTop" stroke="#FFFFFF" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_top_${bar.id})`"/>
                    </g>
                    <!-- LEGEND -->
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0 : bar.proportion * 100 > FINAL_CONFIG.style.chart.legend.hideUnderPercentage ? 1 : 0}`" @click="emits('selectDatapoint', bar)">
                        <path :stroke="FINAL_CONFIG.style.chart.color" stroke-dasharray="1" stroke-width="0.5" stroke-linecap="round" :d="`M${bar.fill.sidePointer.x},${bar.fill.sidePointer.y} ${bar.fill.sidePointer.x + 20},${bar.fill.sidePointer.y}`"/>
                        <circle :cx="bar.fill.sidePointer.x + 20" :cy="bar.fill.sidePointer.y" :r="2" :fill="bar.color" :stroke="FINAL_CONFIG.style.chart.backgroundColor" v-if="!bar.fill.miniDonut || !!selectedSerie"/>
                        <foreignObject :x="bar.fill.sidePointer.x + 30" :y="bar.fill.sidePointer.y - FINAL_CONFIG.style.chart.legend.fontSize" :width="svg.absoluteWidth / 2 - 12" :height="FINAL_CONFIG.style.chart.legend.fontSize * 2" style="overflow: visible; position: relative">
                            <div v-if="FINAL_CONFIG.style.chart.legend.showDefault" :style="`height: 100%; width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; align-items:center;justify-content: flex-start; font-size:${FINAL_CONFIG.style.chart.legend.fontSize}px; text-align:left; line-height: ${FINAL_CONFIG.style.chart.legend.fontSize}px; color:${FINAL_CONFIG.style.chart.legend.color}`">
                                {{ applyDataLabel(
                                    FINAL_CONFIG.style.chart.dataLabel.formatter,
                                    bar.value,
                                    `${bar.name}: ${dataLabel({v: bar.proportion * 100, s: '%', r: FINAL_CONFIG.style.chart.legend.roundingPercentage})} (${dataLabel({ 
                                        p: FINAL_CONFIG.style.chart.legend.prefix, 
                                        v: bar.value, 
                                        s: FINAL_CONFIG.style.chart.legend.suffix, 
                                        r: FINAL_CONFIG.style.chart.legend.roundingValue
                                    })})`,
                                    { datapoint: bar, seriesIndex: i, type: 'barDatapoint' }
                                )}}
                            </div>
                            <slot name="legend" v-bind="{ datapoint: bar, config: FINAL_CONFIG, dataset: stack}"/>
                        </foreignObject>

                        <!-- BREAKDOWN DONUT -->
                        <g v-if="bar.fill.donut && selectedSerie === bar.id">  
                            <!-- DONUT LABEL CONNECTOR -->
                            <g v-for="(arc, j) in bar.fill.donut">                            
                                <path
                                    v-if="displayArcPercentage(arc, bar.fill.donut, true) > 6"
                                    :d="calcNutArrowPath(arc, {x: arc.cx, y: arc.cy}, 0, 8, false, true, 10)"
                                    :stroke="arc.color"
                                    class="vue-ui-donut-arc-path"
                                    stroke-width="0.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    fill="none"
                                />
                            </g>

                            <path 
                                v-for="(arc, j) in bar.fill.donut"
                                class="vue-ui-donut-arc-path"
                                :data-cy="`donut-arc-${j}`"
                                :d="arc.arcSlice" 
                                :fill="`${arc.color}`"
                                :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                                :stroke-width="1"
                            />

                            <!-- DONUT HOLLOW -->
                            <defs>
                                <radialGradient :id="`hollow_gradient_${uid}`">
                                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)" />
                                    <stop offset="77%" stop-color="#FFFFFF20" />
                                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)"/>
                                </radialGradient>
                            </defs>
                            <circle class="vue-ui-donut-arc-path" v-for="(arc, j) in bar.fill.donut" :cx="arc.cx" :cy="arc.cy" :r="28" :fill="`url(#hollow_gradient_${uid})`"/>
                            <circle class="vue-ui-donut-arc-path" v-for="(arc, j) in bar.fill.donut" :cx="arc.cx" :cy="arc.cy" :r="14" :fill="FINAL_CONFIG.style.chart.backgroundColor"/>

                            <!-- DONUT DATALABELS -->
                            <g v-for="(arc, i) in bar.fill.donut">
                                <g v-if="displayArcPercentage(arc, bar.fill.donut, true) > 6">                                
                                    <text
                                        :text-anchor="calcMarkerOffsetX(arc, true, 0).anchor"
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="calcMarkerOffsetY(arc, 12, 12)"
                                        :fill="FINAL_CONFIG.style.chart.legend.color"
                                        :font-size="FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                    >
                                        {{ applyDataLabel(
                                            FINAL_CONFIG.style.chart.dataLabel.formatter,
                                            arc.value,
                                            `${displayArcPercentage(arc, bar.fill.donut)} (${dataLabel({
                                                p: FINAL_CONFIG.style.chart.legend.prefix, 
                                                v: arc.value, 
                                                s: FINAL_CONFIG.style.chart.legend.suffix, 
                                                r: FINAL_CONFIG.style.chart.legend.roundingValue
                                            })})`,
                                            { datapoint: arc, seriesIndex: i, type: 'donutDatapoint' }
                                        )}}
                                    </text>
                                    <text
                                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="calcMarkerOffsetY(arc, 12, 12) + FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                        :fill="FINAL_CONFIG.style.chart.legend.color"
                                        :font-size="FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                    >
                                        {{ arc.name }}
                                    </text>
                                </g>
                            </g>
                        </g>

                        <!-- BREAKDOWN MINI DONUT -->
                        <g v-if="bar.fill.miniDonut && !selectedSerie">  
                            <path 
                                v-for="(arc, j) in bar.fill.miniDonut"
                                class="vue-ui-donut-arc-path"
                                :data-cy="`donut-arc-${j}`"
                                :d="arc.arcSlice" 
                                :fill="`${arc.color}`"
                                :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                                :stroke-width="0.5"
                            />
                        </g>
                    </g>
                </g>
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'bar3d',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    bar3d: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>
        
        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset && hasStack" :config="{
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
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-3d-bar *{
    transition: unset;
}
.vue-ui-3d-bar {
    user-select: none;
    position: relative;
}
.vue-ui-3d-bar-stack {
    transition: opacity 0.2s ease-in-out;
}
.vue-ui-donut-arc-path {
    animation: donut 0.5s ease-in-out;
    transform-origin: center;
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
</style>
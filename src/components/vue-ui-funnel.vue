<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onBeforeUnmount,
    onMounted, 
    ref, 
    shallowRef, 
    watch, 
} from "vue";
import { 
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    createCsvContent,
    createUid, 
    dataLabel,
    downloadCsv,
    error, 
    getMissingDatasetAttributes, 
    lightenHexColor, 
    objectIsEmpty, 
    translateSize,
    XMLNS,
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useThemeCheck } from "../useThemeCheck";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import img from "../img";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes/vue_ui_funnel.json"; // Must be ready in responsive mode

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_funnel: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

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

const funnelChart = ref(null);
const uid = ref(createUid());
const step = ref(0);
const titleStep = ref(0);
const tableStep = ref(0);
const noTitle = ref(null);
const source = ref(null);
const chartTitle = ref(null);
const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);
const loaded = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(prepareChart);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiFunnel',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'value']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiFunnel',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                });
            });
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: funnelChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                svg.value.height = height;
                svg.value.width = width;
                drawingArea.value = setDrawingArea();
    
                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
                    fontSizes.value.circles = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.circles.dataLabels.fontSize,
                        threshold: 10,
                        fallback: 10
                    });
        
                    fontSizes.value.names = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.bars.dataLabels.name.fontSize,
                        threshold: 10,
                        fallback: 10
                    });
        
                    fontSizes.value.values = translateSize({
                        relator: Math.min(width, height),
                        adjuster: 600,
                        source: FINAL_CONFIG.value.style.chart.bars.dataLabels.value.fontSize,
                        threshold: 10,
                        fallback: 10
                    });
                } else {
                    fontSizes.value.circles = FINAL_CONFIG.value.style.chart.circles.dataLabels.fontSize;
                    fontSizes.value.names = FINAL_CONFIG.value.style.chart.bars.dataLabels.name.fontSize;
                    fontSizes.value.values = FINAL_CONFIG.value.style.chart.bars.dataLabels.value.fontSize;
                }
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = funnelChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused
    });

    return finalConfig;
}

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const isCursorPointer = computed(() => FINAL_CONFIG.value.userOptions.useCursorPointer);

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    fontSizes.value.circles = FINAL_CONFIG.value.style.chart.circles.dataLabels.fontSize;
    fontSizes.value.names = FINAL_CONFIG.value.style.chart.bars.dataLabels.name.fontSize;
    fontSizes.value.values = FINAL_CONFIG.value.style.chart.bars.dataLabels.value.fontSize;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `funnel_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-funnel',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

const fontSizes = ref({
    circles: FINAL_CONFIG.value.style.chart.circles.dataLabels.fontSize,
    names: FINAL_CONFIG.value.style.chart.bars.dataLabels.name.fontSize,
    values: FINAL_CONFIG.value.style.chart.bars.dataLabels.value.fontSize
});

const svg = computed({
    get: () => {
        return {
            height: FINAL_CONFIG.value.style.chart.height,
            width: FINAL_CONFIG.value.style.chart.width
        }
    },
    set: (v) => {
        return v
    }
});

const formattedDataset = computed(() => {
    if(!isDataset.value) return []
    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            color: ds.color ? convertColorToHex(ds.color) : lightenHexColor(FINAL_CONFIG.value.style.chart.bars.defaultColor, (i / props.dataset.length)),
        }
    })
});

setTimeout(() => {
    loaded.value = true;
}, formattedDataset.value.length * 150)

function setDrawingArea() {
    const left = FINAL_CONFIG.value.style.chart.padding.left;
    const top = FINAL_CONFIG.value.style.chart.padding.top;
    return {
        left,
        top,
        right: svg.value.width - FINAL_CONFIG.value.style.chart.padding.right,
        bottom: svg.value.height - FINAL_CONFIG.value.style.chart.padding.bottom,
        width: svg.value.width - left - FINAL_CONFIG.value.style.chart.padding.right,
        height: svg.value.height - top - FINAL_CONFIG.value.style.chart.padding.bottom
    }
}

const drawingArea = ref(setDrawingArea());

const barHeight = computed(() => {
    return (drawingArea.value.height / (props.dataset.length));
});

const gap = computed(() => {
    return barHeight.value * FINAL_CONFIG.value.style.chart.bars.gapRatio;
});

const spacingRatio = computed(() => {
    return drawingArea.value.width * FINAL_CONFIG.value.style.chart.barCircleSpacingRatio;
});

const datapoints = computed(() => {
    return formattedDataset.value.map((ds, i) => {
        const size = barHeight.value - (gap.value);
        const y = (drawingArea.value.top + (gap.value / 2 * i) + ((barHeight.value - (gap.value / 2)) * i)) + gap.value / 2;
        const proportion = ds.value / formattedDataset.value[0].value
        const width = (drawingArea.value.width - size - spacingRatio.value) * (ds.value / formattedDataset.value[0].value);
        return {
            ...ds,
            cx: drawingArea.value.left + size / 2,
            cy: y + size / 2,
            datapointIndex: i,
            fill: ds.color,
            height: Math.max(size, 0),
            proportion,
            r: Math.max(size / 2, 0),
            width: Math.max(width, 0),
            x: drawingArea.value.left + size + spacingRatio.value,
            y,
        }
    });
});

const funnelArea = computed(() => {
    const points = datapoints.value.map(dp => {
        return `${dp.x + dp.width},${dp.y + ((barHeight.value - (gap.value)) / 2)}`;
    })
    return `${datapoints.value[0].x},${datapoints.value[0].y + ((barHeight.value - gap.value) / 2)} ${points.toString()} ${datapoints.value.at(-1).x},${datapoints.value.at(-1).y + ((barHeight.value - gap.value) / 2)}`;
});

const circlesLink = computed(() => {
    return {
        x1: datapoints.value[0].cx,
        y1: datapoints.value[0].cy,
        x2: datapoints.value.at(-1).cx,
        y2: datapoints.value.at(-1).cy
    }
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const dashLen = computed(() => `${formattedDataset.value.length * 150}ms`);

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const table = computed(() => {
    const head = formattedDataset.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = formattedDataset.value.map(ds => ds.value);

    return { head, body };
});

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage
    ];

    const body = table.value.head.map((h,i) => {
        const labelValue = applyDataLabel(
            FINAL_CONFIG.value.style.chart.bars.dataLabels.value.formatter,
            table.value.body[i],
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.bars.dataLabels.value.prefix,
                v: table.value.body[i],
                s: FINAL_CONFIG.value.style.chart.bars.dataLabels.value.suffix,
                r: FINAL_CONFIG.value.table.td.roundingValue
            }),
            { datapoint: datapoints.value[i] }
        );
        const labelPercentage = applyDataLabel(
            FINAL_CONFIG.value.style.chart.circles.dataLabels.formatter,
            datapoints.value[i].proportion * 100,
            dataLabel({
                v: datapoints.value[i].proportion * 100,
                s: '%',
                r: FINAL_CONFIG.value.table.td.roundingPercentage
            }),
            { datapoint: datapoints.value[i] }
        );

        return [
            { color: h.color, name: h.name },
            labelValue,
            labelPercentage
        ];
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
    ];

    return {
        colNames,
        head,
        body,
        config
    }    
})

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [datapoints.value[i].proportion * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[FINAL_CONFIG.value.table.columnNames.series],[FINAL_CONFIG.value.table.columnNames.value],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-funnel" })
        } else {
            callback(csvContent);
        }
    });
}

function getData() {
    return formattedDataset.value;
}

async function getImage({ scale = 2} = {}) {
    if (!funnelChart.value) return;
    const { width, height } = funnelChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: funnelChart.value, base64: true, img: true, scale})
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
            fullscreenParent: funnelChart.value,
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

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    backgroundColor: svgBg
});

async function generateSvg({ isCb }) {
    isCallbackSvg.value = true;

    await nextTick();

    try {
        if (isCb) {
            const { blob, url, text, dataUrl } = await getSvg();
            await Promise.resolve(FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl }));
        } else {
            await Promise.resolve(exportSvg());
        }
    } finally {
        isCallbackSvg.value = false;
    }
}

function onGenerateImage(payload) {
    if (payload?.stage === "start") {
        isCallbackImaging.value = true;
        return;
    }

    if (payload?.stage === "end") {
        isCallbackImaging.value = false;
        return;
    }

    generateImage();
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen,
});

</script>

<template>
    <div ref="funnelChart" :class="`vue-data-ui-component vue-ui-funnel ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; ${FINAL_CONFIG.responsive ? 'height:100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" :id="`funnel_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper 
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close"/>
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }"/>
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }"/>
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }"/>
            </template>
        </PenAndPaper>

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'funnel-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'funnel-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="false"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="funnelChart"
            :position="FINAL_CONFIG.userOptions.position"
            :titles="{...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :isCursorPointer="isCursorPointer"
            @toggleAnnotator="toggleAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @generateCsv="generateCsv"
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
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" #optionFullscreen="{ toggleFullscreen, isFullscreen }">
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
            data-cy="funnel-svg" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" 
            :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >

            <PackageVersion/>

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <defs>
                <linearGradient :id="`funnel_area_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" :stop-color="FINAL_CONFIG.style.chart.backgroundColor" :stop-opacity="0" />
                    <stop offset="20%" :stop-color="FINAL_CONFIG.style.chart.area.color" />
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.chart.area.color" />
                </linearGradient>
            </defs>

            <line
                data-cy="circle-links"
                v-if="FINAL_CONFIG.style.chart.circleLinks.show"
                v-bind="circlesLink"
                :stroke="FINAL_CONFIG.style.chart.circleLinks.color"
                :stroke-width="12 * FINAL_CONFIG.style.chart.circleLinks.widthRatio"
                stroke-linecap="round"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation
                }"
                :style="{
                    strokeDasharray: FINAL_CONFIG.useCssAnimation ? drawingArea.height : 0,
                    strokeDashoffset: FINAL_CONFIG.useCssAnimation ? drawingArea.height : 0
                }"
            />

            <circle
                data-cy="datapoint-circle"
                v-for="({cx, cy, r, fill}, i) in datapoints"
                v-bind="{ cx, cy, r, fill }"
                :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation && !loaded
                }"
                :style="{
                    animationDelay: `${150 * i}ms`
                }"
            />

            <text
                data-cy="datapoint-label"
                v-for="(datapoint, i) in datapoints"
                :x="datapoint.cx"
                :y="datapoint.cy + fontSizes.circles / 3 + FINAL_CONFIG.style.chart.circles.dataLabels.offsetY"
                text-anchor="middle"
                :font-size="fontSizes.circles"
                :fill="FINAL_CONFIG.style.chart.circles.dataLabels.adaptColorToBackground ? adaptColorToBackground(datapoint.color) : FINAL_CONFIG.style.chart.circles.dataLabels.color"
                :font-weight="FINAL_CONFIG.style.chart.circles.dataLabels.bold ? 'bold' : 'normal'"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation && !loaded
                }"
                :style="{
                    animationDelay: `${150 * i}ms`
                }"
            >
                {{ 
                    applyDataLabel(
                        FINAL_CONFIG.style.chart.circles.dataLabels.formatter,
                        datapoint.proportion * 100,
                        dataLabel({
                            v: datapoint.proportion * 100,
                            s: '%',
                            r: FINAL_CONFIG.style.chart.circles.dataLabels.rounding
                        }),
                        { datapoint }
                    )
                }}
            </text>

            <polygon
                data-cy="funnel-area"
                v-if="FINAL_CONFIG.style.chart.area.show"
                :points="funnelArea" 
                :fill="`url(#funnel_area_${uid})`"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation && !loaded
                }"
                :style="{
                    transition: FINAL_CONFIG.useCssAnimation ? `all ${150 * formattedDataset.length}ms ease-in` : 'none'
                }"
            />
        
            <rect
                data-cy="datapoint-bar"
                v-for="({x, y, height, width, fill}, i) in datapoints"
                v-bind="{x, y, height, width, fill }"
                :stroke="FINAL_CONFIG.style.chart.bars.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.bars.strokeWidth"
                :rx="FINAL_CONFIG.style.chart.bars.borderRadius"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation && !loaded
                }"
                :style="{
                    animationDelay: `${150 * i}ms`
                }"
            />

            <g v-for="(datapoint, i) in datapoints">            
                <text
                    data-cy="bar-name"
                    :x="datapoint.x + datapoint.width + FINAL_CONFIG.style.chart.bars.dataLabels.name.offsetX + 12"
                    :y="datapoint.cy - fontSizes.names / 2 + FINAL_CONFIG.style.chart.bars.dataLabels.name.offsetY"
                    text-anchor="start"
                    :font-size="fontSizes.names"
                    :fill="FINAL_CONFIG.style.chart.bars.dataLabels.name.color"
                    :font-weight="FINAL_CONFIG.style.chart.bars.dataLabels.name.bold ? 'bold' : 'normal'"
                    :class="{
                        'animated': FINAL_CONFIG.useCssAnimation && !loaded
                    }"
                    :style="{
                        animationDelay: `${150 * i}ms`
                    }"
                >
                    {{ datapoint.name }}
                </text>
                <text
                    data-cy="bar-value"
                    :x="datapoint.x + datapoint.width + FINAL_CONFIG.style.chart.bars.dataLabels.value.offsetX + 12"
                    :y="datapoint.cy + fontSizes.values + FINAL_CONFIG.style.chart.bars.dataLabels.value.offsetY"
                    text-anchor="start"
                    :font-size="fontSizes.values"
                    :fill="FINAL_CONFIG.style.chart.bars.dataLabels.value.color"
                    :font-weight="FINAL_CONFIG.style.chart.bars.dataLabels.value.bold ? 'bold' : 'normal'"
                    :class="{
                        'animated': FINAL_CONFIG.useCssAnimation && !loaded
                    }"
                    :style="{
                        animationDelay: `${150 * i}ms`
                    }"
                >
                    {{ 
                        applyDataLabel(
                            FINAL_CONFIG.style.chart.bars.dataLabels.value.formatter,
                            datapoint.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.bars.dataLabels.value.prefix,
                                v: datapoint.value,
                                s: FINAL_CONFIG.style.chart.bars.dataLabels.value.suffix,
                                r: FINAL_CONFIG.style.chart.bars.dataLabels.value.rounding
                            }),
                            { datapoint }
                        )
                    }}
                </text>
            </g>

            <slot name="svg" :svg="{
                ...svg,
                isPrintingImg: isPrinting | isImaging | isCallbackImaging,
                isPrintingSvg: isCallbackSvg,
            }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging || isCallbackImaging || isCallbackSvg }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'verticalBar',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    verticalBar: {
                        axis: {
                            color: '#CCCCCC'
                        },
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <component
            v-if="isDataset && FINAL_CONFIG.userOptions.buttons.table"
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
                    <BaseIcon name="fileCsv" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>            
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name ? td.name : td }}
                    </template>
                </DataTable>
            </template>
        </component>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-funnel *{
    transition: unset;
}
.vue-ui-funnel {
    user-select: none;
    position: relative;
}
circle.animated {
    opacity: 0;
    animation: reveal 150ms forwards;
    transition: all 150ms ease-in-out;
} 

@keyframes reveal {
    from {
        opacity: 0;
        r: 0;
    }
    to {
        opacity: 1;
    }
}

line.animated {
    animation: dash v-bind(dashLen) ease-in forwards;
}

@keyframes dash {
    to {
        stroke-dashoffset: 0;
    }
}

rect.animated {
    animation: rectExpand 150ms ease-in forwards;
    opacity: 0;
}

@keyframes rectExpand {
    from {
        opacity: 0;
        width: 0;
    }
    to {
        opacity: 1;
    }
}

text.animated {
    opacity: 0;
    animation: textReveal 150ms forwards;
}

@keyframes textReveal {
    to {
        opacity: 1;
    }
}
</style>
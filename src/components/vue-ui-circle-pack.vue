<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onBeforeUnmount,
    onMounted, 
    ref, 
    toRefs, 
    watch, 
    watchEffect, 
} from 'vue'
import { useConfig } from '../useConfig';
import {
    XMLNS,
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createTSpans,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    isFunction,
    lightenHexColor,
    objectIsEmpty,
    palette,
    themePalettes,
    treeShake,
} from '../lib';
import { usePrinter } from '../usePrinter';
import { useLoading } from '../useLoading';
import { pack, bounds } from "../packCircles";
import { useSvgExport } from '../useSvgExport';
import { useNestedProp } from '../useNestedProp';
import { useThemeCheck } from '../useThemeCheck';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { throttle } from '../canvas-lib';
import { useResponsive } from '../useResponsive';
import img from '../img';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from "../themes/vue_ui_circle_pack.json";
import BaseScanner from '../atoms/BaseScanner.vue';

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

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

const emit = defineEmits(['selectDatapoint']);

const { vue_ui_circle_pack: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length
});

const uid = ref(createUid());
const circlePackChart = ref(null);
const chartTitle = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const step = ref(0);
const source = ref(null);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedDatapoint = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        { name: '_', value: 13, color: '#F2F2F2' },
        { name: '_', value: 8, color: '#DBDBDB' },
        { name: '_', value: 5, color: '#ADADAD' },
        { name: '_', value: 3, color: '#969696' },
        { name: '_', value: 2, color: '#808080' },
        { name: '_', value: 1, color: '#696969' },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    circles: {
                        stroke: '#6A6A6A',
                        labels: {
                            name: { show: false },
                            value: { show: false }
                        }
                    }
                }
            }
        }
    })
});

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

const {
    userOptionsVisible,
    setUserOptionsVisibility,
    keepUserOptionState
} = useUserOptionState({ config: FINAL_CONFIG.value });

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

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length ? finalConfig.customPalette : themePalettes[theme] || palette
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
    elementId: `vue-ui-circle-pack_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-circle-pack',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
    }
}, { immediate: true });

const SIZE = ref({ h: 10, w: 10 });
const boundValues = ref([0, 0, 100, 100]);

const debug = computed(() => FINAL_CONFIG.value.debug);

const packingWidth = computed(() => {
    const style = FINAL_CONFIG.value.style?.chart || {};
    if (style.dimensions && typeof style.dimensions.width === 'number') {
        return style.dimensions.width;
    }
    if (typeof style.width === 'number') {
        return style.width;
    }
    return 300;
});

const packingHeight = computed(() => {
    const style = FINAL_CONFIG.value.style?.chart || {};
    if (style.dimensions && typeof style.dimensions.height === 'number') {
        return style.dimensions.height;
    }
    if (typeof style.height === 'number') {
        return style.height;
    }
    return 300;
});

const circles = ref([]);
const viewBox = ref('0 0 100 100');
const resizeObserver = ref(null);
const observedEl = ref(null);

function recomputePacking(targetWidth, targetHeight) {
    SIZE.value = {
        w: targetWidth,
        h: targetHeight
    };

    const freshDataset = formattedDataset.value.map(c => ({ ...c }));
    if (!freshDataset.length) {
        circles.value = [];
        boundValues.value = [0, 0, targetWidth, targetHeight];
        viewBox.value = `0 0 ${targetWidth} ${targetHeight}`;
        return;
    }

    const packed = pack(freshDataset, targetHeight, targetWidth);
    const [x0, y0, bw, bh] = bounds(packed, 1);

    // Uniform scale to fit raw bounds into targetWidth & targetHeight
    const scale = Math.min(
        bw ? targetWidth / bw : 1,
        bh ? targetHeight / bh : 1
    );
    const offsetX = (targetWidth - bw * scale) / 2;
    const offsetY = (targetHeight - bh * scale) / 2;
    circles.value = packed.map(c => ({
        ...c,
        x: (c.x - x0) * scale + offsetX,
        y: (c.y - y0) * scale + offsetY,
        r: c.r * scale
    }));

    boundValues.value = [0, 0, targetWidth, targetHeight];
    viewBox.value = `0 0 ${targetWidth} ${targetHeight}`;
}


function setupResponsiveObserver() {
    if (!FINAL_CONFIG.value.responsive || !circlePackChart.value) return;

    const handleResize = throttle(() => {
        const { width, height } = useResponsive({
            chart: circlePackChart.value,
            title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
            legend: null,
            source: source.value,
            noTitle: noTitle.value,
        });

        requestAnimationFrame(() => {
            if (!width || !height) return;

            if (svgRef.value) {
                svgRef.value.setAttribute('width', width);
                svgRef.value.setAttribute('height', height);
            }
            recomputePacking(width, height);
        });
    });

    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }

    resizeObserver.value = new ResizeObserver(handleResize);
    observedEl.value = circlePackChart.value.parentNode || circlePackChart.value;
    if (observedEl.value) {
        resizeObserver.value.observe(observedEl.value);
    }

    // Initial responsive computation
    handleResize();
}

function teardownResponsiveObserver() {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
        resizeObserver.value = null;
        observedEl.value = null;
    }
}

async function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCirclePack',
            type: 'dataset',
            debug: debug.value
        })
    }
    const baseWidth = packingWidth.value;
    const baseHeight = packingHeight.value;
    recomputePacking(baseWidth, baseHeight);

    if (FINAL_CONFIG.value.responsive) {
        setupResponsiveObserver();
    } else {
        teardownResponsiveObserver();
    }
}

onMounted(prepareChart);

onBeforeUnmount(() => {
    teardownResponsiveObserver();
});

watch(() => FINAL_DATASET.value, async (_ds) => {
    await prepareChart();
}, { deep: true })

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const formattedDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        const color =
            convertColorToHex(ds.color) ||
            customPalette.value[i] ||
            themePalettes[FINAL_CONFIG.value.theme || 'default'][i % themePalettes[FINAL_CONFIG.value.theme || 'default'].length] ||
            palette[i] ||
            palette[i % palette.length];

        return {
            ...ds,
            r: ds.value,
            id: createUid(),
            color,
        }
    }).filter(ds => ![null, undefined, Infinity, -Infinity].includes(ds.value))
});

const maxRadius = computed(() => {
    return circles.value.length ? Math.max(...circles.value.map(c => c.r)) : 0;
})

function calcOffsetY(radius, offset) {
    if (!maxRadius.value) return 0;
    return offset / maxRadius.value * radius;
}

function onTrapLeave(datapoint, seriesIndex) {
    isTooltip.value = false;
    selectedDatapoint.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
}

function onTrapClick(datapoint, seriesIndex) {
    emit('selectDatapoint', datapoint);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
}

const dataTooltipSlot = ref(null);
const useCustomFormat = ref(false);

function onTrapEnter(datapoint, seriesIndex) {
    selectedDatapoint.value = datapoint;

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }

    dataTooltipSlot.value = { datapoint, seriesIndex, config: FINAL_CONFIG.value, series: formattedDataset.value };
    isTooltip.value = true;
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                seriesIndex,
                datapoint,
                series: formattedDataset.value,
                config: FINAL_CONFIG.value
            });
            if (typeof customFormatString === 'string') {
                tooltipContent.value = customFormatString;
                useCustomFormat.value = true;
            }
        } catch (err) {
            console.warn('Custom format cannot be applied.');
            useCustomFormat.value = false;
        }
    }

    if (!useCustomFormat.value) {
        let html = '';

        html += `
            <div style="display:flex;align-items:center;gap:4px;">
                <svg viewBox="0 0 10 10" height="${FINAL_CONFIG.value.style.chart.tooltip.fontSize}" width="${FINAL_CONFIG.value.style.chart.tooltip.fontSize}">
                    <circle
                        cx="5"
                        cy="5"
                        r="5"
                        fill="${FINAL_CONFIG.value.style.chart.circles.gradient.show ? `url(#${datapoint.id})` : datapoint.color}"
                    />
                </svg>
                <span>${datapoint.name}: <b>${getCircleLabel(datapoint)}</b></span>
            </div>
        `

        tooltipContent.value = html;
    }
}

function getCircleLabel(circle) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.circles.labels.value.formatter,
        circle.value,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.circles.labels.value.prefix,
            v: circle.value,
            s: FINAL_CONFIG.value.style.chart.circles.labels.value.suffix,
            r: FINAL_CONFIG.value.style.chart.circles.labels.value.rounding
        })
    )
}

function getValueFontSize(circle) {
    if (!circle) {
        return 0
    }

    const label = getCircleLabel(circle);
    const max = circle.r / (label.length || 1) * (label.length === 1 ? 1 : 2);
    return Math.min(circle.r / 2.5, max);
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const table = computed(() => {
    const head = formattedDataset.value.map(d => {
        return {
            name: d.name,
            value: d.value,
            color: d.color
        }
    }).toSorted((a, b) => b.value - a.value);

    const body = head.map(h => h.value);
    return { head, body };
});

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [[h.name], [table.value.body[i]]]
        });
        const tableXls = [
            [FINAL_CONFIG.value.style.chart.title.text],
            [FINAL_CONFIG.value.style.chart.title.subtitle.text],
            [[""], [FINAL_CONFIG.value.table.columnNames.value]],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-circle-pack" })
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.datapoint,
        FINAL_CONFIG.value.table.columnNames.value
    ];

    const body = table.value.head.map((h, i) => {
        const label = dataLabel({
            p: FINAL_CONFIG.value.style.chart.circles.labels.value.prefix,
            v: table.value.body[i],
            s: FINAL_CONFIG.value.style.chart.circles.labels.value.suffix,
            r: FINAL_CONFIG.value.style.chart.circles.labels.value.rounding
        });
        return [
            {
                color: h.color,
                name: h.name
            },
            label
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
        FINAL_CONFIG.value.table.columnNames.datapoint,
        FINAL_CONFIG.value.table.columnNames.value,
    ]

    return {
        colNames,
        head,
        body,
        config
    }
})

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

function getData() {
    return formattedDataset.value;
}

async function getImage({ scale = 2 } = {}) {
    if (!circlePackChart.value) return;
    const { width, height } = circlePackChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: circlePackChart.value, base64: true, img: true, scale })
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
            fullscreenParent: circlePackChart.value,
            forcedWidth: Math.min(500, window.innerWidth * 0.8)
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
        if (tableUnit.value && 'close' in tableUnit.value) {
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
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl })

    } else {
        exportSvg();
    }
}

defineExpose({
    getData,
    getImage,
    generateCsv,
    generatePdf,
    generateImage,
    generateSvg,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen
});

</script>

<template>
    <div
        :id="`vue-ui-circle-pack_${uid}`"
        :class="`vue-data-ui-component vue-ui-circle-pack ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${loading ? 'loading' : ''}`"
        ref="circlePackChart"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            :scale="maxRadius / 100"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close" />
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }" />
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }" />
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }" />
            </template>
        </PenAndPaper>

        <slot name="userConfig" />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
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
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip"
            :isTooltip="mutableConfig.showTooltip" 
            :hasLabel="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="circlePackChart"
            :position="FINAL_CONFIG.userOptions.position"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            :style="{ visibility: keepUserOptionState ? (userOptionsVisible ? 'visible' : 'hidden') : 'visible' }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
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
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <div :class="{ 'vue-ui-circle-pack-svg-container': true, 'not-responsive': !FINAL_CONFIG.responsive }">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :viewBox="viewBox"
                preserveAspectRatio="xMidYMid meet"
                :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen, 'not-responsive': !FINAL_CONFIG.responsive }"
                :style="`display:block;${FINAL_CONFIG.responsive ? 'width:100%;height:auto' : 'height:100%;'};overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color};background:${FINAL_CONFIG.style.chart.backgroundColor};`"
            >
                <PackageVersion />
    
                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="viewBox.x"
                    :y="viewBox.y"
                    :width="viewBox.width"
                    :height="viewBox.height"
                    :style="{ pointerEvents: 'none' }"
                >
                    <slot name="chart-background" />
                </foreignObject>
    
                <template v-for="(circle, i) in circles" :key="circle.id">
                    <defs>
                        <radialGradient :id="circle.id" fy="30%">
                            <stop
                                offset="10%"
                                :stop-color="lightenHexColor(circle.color, FINAL_CONFIG.style.chart.circles.gradient.intensity / 100)"
                            />
                            <stop offset="90%" :stop-color="darkenHexColor(circle.color, 0.1)" />
                            <stop offset="100%" :stop-color="circle.color" />
                        </radialGradient>
                    </defs>
    
                    <g v-if="$slots.pattern">
                        <defs>
                            <slot name="pattern" v-bind="{ ...circle, patternId: `pattern_${uid}_${circle.id}` }" />
                        </defs>
                    </g>
    
                    <!-- 'CIRCLE' (using rect as circle does not css transition properly) -->
                    <rect
                        data-cy="datapoint-circle"
                        :x="circle.x - circle.r"
                        :y="circle.y - circle.r"
                        :width="circle.r * 2"
                        :height="circle.r * 2"
                        :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth * (maxRadius || 1) / 100"
                        :fill="FINAL_CONFIG.style.chart.circles.gradient.show ? `url(#${circle.id})` : circle.color"
                        :rx="circle.r"

                        @mouseenter="onTrapEnter(circle, i)"
                        @mouseout="onTrapLeave(circle, i)"
                        @click="onTrapClick(circle, i)"
                    />
    
                    <rect
                        v-if="$slots.pattern"
                        :x="circle.x - circle.r"
                        :y="circle.y - circle.r"
                        :width="circle.r * 2"
                        :height="circle.r * 2"
                        :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth * (maxRadius || 1) / 100"
                        :fill="`url(#pattern_${uid}_${circle.id})`"
                        :rx="circle.r"
                        :style="{ pointerEvents: 'none' }"
                    />
                </template>

                <!-- OVERLAYS -->
                <template v-for="(circle, i) in circles" :key="circle.id">
                    <rect
                        data-cy="datapoint-circle-overlay"
                        :x="circle.x - circle.r"
                        :y="circle.y - circle.r"
                        :width="circle.r * 2"
                        :height="circle.r * 2"
                        stroke="none"
                        :fill="selectedDatapoint && selectedDatapoint.id === circle.id ? FINAL_CONFIG.style.chart.circles.gradient.show ? `url(#${circle.id})` : circle.color : 'transparent'"
                        :rx="circle.r"
                        :style="{
                            filter: selectedDatapoint && selectedDatapoint.id === circle.id
                                ? `drop-shadow(0px 0px 6px ${FINAL_CONFIG.style.chart.circles.selectedShadowColor})`
                                : 'none',
                            opacity: selectedDatapoint ? 1 : 0,
                            pointerEvents: 'none',
                            transition: 'opacity 0.2s ease-in-out'
                        }"
                    />
                </template>

                <!-- LABELS -->
                <template v-for="(circle, i) in circles" :key="circle.id">
                    <slot
                        name="data-label"
                        v-if="$slots['data-label']"
                        v-bind="{
                            ...circle,
                            createTSpans,
                            fontSize: {
                                name: (circle.r / 3) * FINAL_CONFIG.style.chart.circles.labels.name.fontSizeRatio,
                                value: getValueFontSize(circle) * FINAL_CONFIG.style.chart.circles.labels.value.fontSizeRatio
                            },
                            color: !FINAL_CONFIG.style.chart.circles.labels.name.color
                                ? adaptColorToBackground(circle.color)
                                : FINAL_CONFIG.style.chart.circles.labels.name.color
                        }"
                    />
    
                    <template v-else>
                        <!-- LABEL NAME -->
                        <text
                            data-cy="label-name"
                            v-if="FINAL_CONFIG.style.chart.circles.labels.name.show && circle.name"
                            :style="{
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s ease-in-out'
                            }"
                            :x="circle.x"
                            :y="
                                circle.y +
                                calcOffsetY(circle.r, FINAL_CONFIG.style.chart.circles.labels.name.offsetY) -
                                circle.r / 10
                            "
                            :font-size="(circle.r / 3) * FINAL_CONFIG.style.chart.circles.labels.name.fontSizeRatio"
                            :fill="FINAL_CONFIG.style.chart.circles.labels.name.color === 'auto'
                                ? adaptColorToBackground(circle.color)
                                : FINAL_CONFIG.style.chart.circles.labels.name.color"
                            :font-weight="FINAL_CONFIG.style.chart.circles.labels.name.bold ? 'bold' : 'normal'"
                            text-anchor="middle"
                        >
                            {{ circle.name }}
                        </text>
    
                        <!-- LABEL VALUE -->
                        <text
                            data-cy="label-value"
                            v-if="FINAL_CONFIG.style.chart.circles.labels.value.show"
                            :style="{
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s ease-in-out'
                            }"
                            :x="circle.x"
                            :y="
                                circle.y +
                                calcOffsetY(circle.r, FINAL_CONFIG.style.chart.circles.labels.value.offsetY) +
                                circle.r / 2.5
                            "
                            :font-size="getValueFontSize(circle) * FINAL_CONFIG.style.chart.circles.labels.value.fontSizeRatio"
                            :fill="FINAL_CONFIG.style.chart.circles.labels.value.color === 'auto'
                                ? adaptColorToBackground(circle.color)
                                : FINAL_CONFIG.style.chart.circles.labels.value.color"
                            :font-weight="FINAL_CONFIG.style.chart.circles.labels.value.bold ? 'bold' : 'normal'"
                            text-anchor="middle"
                        >
                            {{ getCircleLabel(circle) }}
                        </text>
                    </template>
                </template>
    
                <slot name="svg" :svg="{ ...viewBox }" />
            </svg>
        </div>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip 
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color" 
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position" 
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="circlePackChart" 
            :content="tooltipContent" 
            :isCustom="useCustomFormat" 
            :isFullscreen="isFullscreen"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThrehsold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
        </Tooltip>

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
                <button
                    tabindex="0"
                    class="vue-ui-user-options-button"
                    @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)"
                >
                    <BaseIcon name="excel" :stroke="tableComponent.props.color" />
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

.vue-ui-circle-pack * {
    transition: unset;
}

.vue-ui-circle-pack {
    position: relative;
    user-select: none;
    width: 100%;
    height: 100%;
    overflow: visible;
}

rect,
text {
    transition: all 0.2s ease-in-out !important;
}

.loading rect,
.loading text {
    transition: none !important;
}
</style>

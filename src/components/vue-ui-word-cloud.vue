<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onBeforeUnmount, 
    onMounted, 
    ref, 
    shallowRef, 
    toRefs,
    watch, 
} from 'vue';
import { debounce } from '../canvas-lib';
import {
    checkNaN, 
    createCsvContent,
    createUid, 
    createWordCloudDatasetFromPlainText, 
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    isFunction, 
    objectIsEmpty,
    palette,
    themePalettes,
    treeShake,
    XMLNS
} from '../lib';
import { throttle } from '../canvas-lib';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { useSvgExport } from '../useSvgExport';
import { positionWords } from '../wordcloud';
import { useNestedProp } from '../useNestedProp';
import { useResponsive } from '../useResponsive';
import { useThemeCheck } from '../useThemeCheck';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import img from '../img';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from "../themes/vue_ui_word_cloud.json";
import usePanZoom from '../usePanZoom';
import BaseScanner from '../atoms/BaseScanner.vue';

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_word_cloud: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: [Array, String],
        default() {
            return []
        }
    },
});

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length
    },
    set(bool) {
        return bool
    }
});

const uid = ref(createUid());
const step = ref(0);
const wordCloudChart = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const isTooltip = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        { name: "Lorem", value: 6 },
        { name: "ipsum",value: 3 },
        { name: "dolor",value: 1 },
        { name: "sit",value: 3 },
        { name: "amet",value: 3 },
        { name: "consectetur",value: 2 },
        { name: "adipiscing",value: 1 },
        { name: "elit",value: 2 },
        { name: "Vivamus",value: 2 },
        { name: "pulvinar",value: 1 },
        { name: "pretium",value: 1 },
        { name: "venenatis",value: 2 },
        { name: "Donec",value: 1},
        { name: "imperdiet",value: 3 },
        { name: "id",value: 1 },
        { name: "porttitor",value: 2 },
        { name: "tristique",value: 1 },
        { name: "Aenean",value: 2 },
        { name: "ac",value: 5 },
        { name: "commodo",value: 2 },
        { name: "justo",value: 2 },
        { name: "Vestibulum",value: 2 },
        { name: "placerat",value: 1 },
        { name: "molestie",value: 1 },
        { name: "nisl",value: 1 },
        { name: "lacinia",value: 2 },
        { name: "nulla",value: 1 },
        { name: "posuere",value: 2 },
        { name: "quis",value: 3 },
        { name: "ullamcorper",value: 1 },
        { name: "eu",value: 1 },
        { name: "ex",value: 1 },
        { name: "vitae",value: 3 },
        { name: "facilisis",value: 1 },
        { name: "Aliquam",value: 1 },
        { name: "erat",value: 1 },
        { name: "volutpat",value: 1 },
        { name: "Proin",value: 1 },
        { name: "nunc",value: 1 },
        { name: "felis",value: 1 },
        { name: "gravida",value: 3 },
        { name: "sed",value: 1 },
        { name: "orci",value: 1 },
        { name: "Interdum",value: 1 },
        { name: "et",value: 1 },
        { name: "malesuada",value: 1 },
        { name: "fames",value: 1 },
        { name: "ante",value: 1 },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            table: { show: false },
            useCssAnimation: false,
            animationDelayMs: 0,
            nodeCategories: {},
            nodeCategoryColors: {},
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    words: {
                        color: '#6A6A6A',
                        usePalette: false,
                        selectedStroke: '#CCCCCC'
                    }
                }
            }
        }
    })
});

const drawableDataset = ref(setupWordCloud());

function setupWordCloud() {
    return typeof FINAL_DATASET.value === 'string' ? createWordCloudDatasetFromPlainText(FINAL_DATASET.value) : FINAL_DATASET.value.map((dp, i) => {
        return {
            ...dp,
            value: checkNaN(dp.value)
        }
    })
}

watch(() => props.dataset, () => {
    drawableDataset.value = setupWordCloud();
    generateWordCloud();
    applyInitialViewBox();
})

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

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

const cloudOrigin = ref({ x: 0, y: 0 });

function applyInitialViewBox() {
    const box = {
        x: 0,
        y: 0,
        width: Math.max(10, svg.value.width),
        height: Math.max(10, svg.value.height),
    };
    setInitialViewBox(box);
    cloudOrigin.value = {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
    };
    resetZoom();
}

const debounceUpdateCloud = debounce(() => {
    generateWordCloud()
}, 10);

const resizing = ref(false);

watch(() => resizing.value, v => {
    if (v === false) {
        debounceUpdateCloud();
        applyInitialViewBox();
    }
})

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    
    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

const svg = ref({
    width: FINAL_CONFIG.value.style.chart.width,
    height: FINAL_CONFIG.value.style.chart.height,
    maxFontSize: FINAL_CONFIG.value.style.chart.words.maxFontSize,
    minFontSize: FINAL_CONFIG.value.style.chart.words.minFontSize,
    bold: FINAL_CONFIG.value.style.chart.words.bold
});

const handleResize = throttle(() => {
    resizing.value = true;
    const { width, height } = useResponsive({
        chart: wordCloudChart.value,
        title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
        source: source.value
    });

    requestAnimationFrame(async () => {
        svg.value.width = Math.max(10, width);
        svg.value.height = Math.max(10, height - 12);
        await nextTick();
        resizing.value = false;
    });
});

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(prepareChart);

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiWordCloud',
            type: 'dataset',
            debug: debug.value,
        });
    } else {
        drawableDataset.value.forEach((w, i) => {
            getMissingDatasetAttributes({
                datasetObject: w,
                requiredAttributes: ['name', 'value']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiWordCloud',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value
                });
            });
        });
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }
        
        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = wordCloudChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
    applyInitialViewBox();
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `wordCloud_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-word-cloud',
    options: FINAL_CONFIG.value.userOptions.print
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
    }
}, { immediate: true });

function measureTextSize(text, fontSize, fontFamily = "Arial") {
    // This invisible canvas is necessary to calculate the exact dimensions of words before painting them on the svg. Cool trick
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px ${FINAL_CONFIG.value.style.chart.words.bold ? 'bold' : 'normal'} ${fontFamily}`;
    const metrics = context.measureText(text);
    return {
        width: metrics.width + FINAL_CONFIG.value.style.chart.words.proximity,
        height: fontSize,
    };
}

const positionedWords = ref([]);

watch(() => props.dataset, generateWordCloud, { immediate: true });

function generateWordCloud() {
    const values = [...drawableDataset.value].map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const scaledWords = [...drawableDataset.value].map((word, i) => {
        let fontSize = ((word.value - minValue) / (maxValue - minValue)) * (svg.value.maxFontSize - svg.value.minFontSize) + svg.value.minFontSize;
        fontSize = isNaN(fontSize) ? svg.value.minFontSize : fontSize;
        const size = measureTextSize(word.name, fontSize);
        return {
            ...word,
            id: createUid(),
            fontSize,
            width: size.width,
            height: size.height,
            color: FINAL_CONFIG.value.style.chart.words.usePalette ? (FINAL_CONFIG.value.customPalette[i] || FINAL_CONFIG.value.customPalette[i % FINAL_CONFIG.value.customPalette.length] || palette[i] || palette[i % palette.length]) : FINAL_CONFIG.value.style.chart.words.color
        };
    });

    positionedWords.value = positionWords({
        words: scaledWords,
        svg: svg.value,
        proximity: FINAL_CONFIG.value.style.chart.words.proximity,
        strictPixelPadding: FINAL_CONFIG.value.strictPixelPadding
    });
}

const table = computed(() => {
    const head = positionedWords.value.map(w => {
        return {
            name: w.name,
            color: w.color
        }
    })
    const body = positionedWords.value.map(w => w.value);
    return { head, body };
})

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [[
                h.name
            ], [table.value.body[i]]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [[""], [FINAL_CONFIG.value.table.columnNames.value],]].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-word-cloud" })
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    const body = table.value.head.map((h, i) => {
        const label = dataLabel({ p: FINAL_CONFIG.value.table.td.prefix, v: table.value.body[i], s: FINAL_CONFIG.value.table.td.suffix, r: FINAL_CONFIG.value.table.td.roundingValue });
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
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ]

    return {
        colNames,
        head,
        body,
        config
    }
})

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function getData() {
    return positionedWords.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const active = computed(() => !isAnnotator.value && FINAL_CONFIG.value.style.chart.zoom.show)

const { viewBox, resetZoom, isZoom, setInitialViewBox } = usePanZoom(svgRef, {
    x: 0,
    y: 0,
    width: svg.value.width <= 0 ? 10 : svg.value.width,
    height: svg.value.height <= 0 ? 10 : svg.value.height,
}, 1, active)

async function getImage({ scale = 2} = {}) {
    if (!wordCloudChart.value) return;
    const { width, height } = wordCloudChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: wordCloudChart.value, base64: true, img: true, scale })
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
            fullscreenParent: wordCloudChart.value,
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
    resetZoom,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
});

const selectedWord = ref(null);
const useCustomFormat = ref(false);
const tooltipContent = ref('');
const dataTooltipSlot = ref(null);

function onTrapLeave(word, index) {
    selectedWord.value = null;
    isTooltip.value = false;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: word, seriesIndex: index });
    }
}

function onTrapClick(word, index) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: word, seriesIndex: index });
    }
}

function useTooltip(word, index) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: word, seriesIndex: index })
    }
    if (!mutableConfig.value.showTooltip) return;
    selectedWord.value = word.id;
    dataTooltipSlot.value = { datapoint: word, config: FINAL_CONFIG.value };
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                datapoint: word,
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
        let html = `<svg viewBox="0 0 10 10" height="${FINAL_CONFIG.value.style.chart.tooltip.fontSize}"><circle cx="5" cy="5" r="5" fill="${word.color}"/></svg><span>${word.name}:</span><b>${(word.value || 0).toFixed(FINAL_CONFIG.value.style.chart.tooltip.roundingValue)}</b>`;

        tooltipContent.value = `<div dir="auto" style="display:flex; gap:4px; align-items:center; jsutify-content:center;">${html}</div>`;
    }

    isTooltip.value = true;
}

</script>

<template>
    <div class="vue-data-ui-component vue-ui-word-cloud" ref="wordCloudChart" :id="`wordCloud_${uid}`"
        :style="`width: 100%; font-family:${FINAL_CONFIG.style.fontFamily};background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
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

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title
            :key="`title_${titleStep}`" 
            :config="{
                title: {
                    ...FINAL_CONFIG.style.chart.title
                },
                subtitle: {
                    ...FINAL_CONFIG.style.chart.title.subtitle
                }
            }" />
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
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table" 
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="wordCloudChart" 
            :position="FINAL_CONFIG.userOptions.position"
            :hasTooltip="FINAL_CONFIG.style.chart.tooltip.show && FINAL_CONFIG.userOptions.buttons.tooltip"
            :isTooltip="mutableConfig.showTooltip"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf" 
            @generateCsv="generateCsv" 
            @generateImage="generateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
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
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
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
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen  }" 
            :xmlns="XMLNS"
            :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
            :style="`overflow:hidden;background:transparent;`"
        >
            <PackageVersion />

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
            
            <g :transform="`translate(${cloudOrigin.x}, ${cloudOrigin.y})`">
                <g v-for="(word, index) in positionedWords">
                    <rect
                        v-if="word.minX !== undefined"
                        data-cy="datapoint-word"
                        :x="word.x + word.minX"
                        :y="word.y + (word.minY * 1.25)"
                        :width="word.maxX - word.minX"
                        :height="word.maxY - word.minY"
                        fill="transparent"
                        pointer-events="visiblePainted"
                        @mouseover="useTooltip(word, index)"
                        @mouseleave="onTrapLeave(word, index)"
                        @click="onTrapClick(word, index)"
                    />
                    <text
                        :fill="word.color"
                        :font-weight="FINAL_CONFIG.style.chart.words.bold ? 'bold' : 'normal'"
                        :key="index"
                        :x="word.x"
                        :y="word.y"
                        :font-size="word.fontSize"
                        :transform="`translate(${word.width / 2}, ${word.height / 2})`"
                        :class="{ 'animated': FINAL_CONFIG.useCssAnimation && !loading }"
                        text-anchor="middle"
                        dominant-baseline="central"
                        paint-order="stroke fill"
                        :stroke="(!selectedWord || selectedWord === word.id) ? FINAL_CONFIG.style.chart.words.selectedStroke : undefined"
                        :stroke-width="word.height * 0.05"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :style="`
                            animation-delay:${index * FINAL_CONFIG.animationDelayMs}ms !important;
                            pointer-events:none;
                            fill-opacity:${(!selectedWord || selectedWord === word.id) ? 1 : FINAL_CONFIG.style.chart.words.hoverOpacity} !important;
                            transition:fill-opacity 0.3s ease-in-out !important;
                        `"
                    >
                        {{ word.name }}
                    </text>
                </g>
            </g>
            <slot name="svg" :svg="{ height: svg.height, width: svg.width }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="isZoom" data-dom-to-png-ignore class="reset-wrapper">
            <slot name="reset-action" :reset="resetZoom">
                <button 
                    data-cy-reset 
                    tabindex="0" 
                    role="button" 
                    class="vue-data-ui-refresh-button"
                    :style="{
                        background: FINAL_CONFIG.style.chart.backgroundColor
                    }"
                    @click="resetZoom(true)">
                    <BaseIcon name="refresh" :stroke="FINAL_CONFIG.style.chart.color" />
                </button>
            </slot>
        </div>

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
            :parent="wordCloudChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

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
                    <BaseIcon name="excel" :stroke="tableComponent.props.color"/>
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
                    @close="closeTable">
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

<style scoped lang="scss">
@import "../vue-data-ui.css";

.vue-ui-word-cloud * {
    transition: unset;
}

.vue-ui-word-cloud {
    position: relative;
}

text.animated {
    opacity:0;
    user-select: none;
    animation: word-opacity 0.2s ease-in forwards;
    transform-origin: center;
}

@keyframes word-opacity {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.reset-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    height: 40px;
    position: absolute;
    bottom: 12px;
    right: 0;
}

.vue-data-ui-refresh-button {
    outline: none;
    border: none;
    background: transparent;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    transform-origin: center;
    &:focus {
        outline: 1px solid v-bind(slicerColor);
    }
    &:hover {
        transform: rotate(-90deg)
    }
}
</style>
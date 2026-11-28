<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
import { createPanZoomAnnotationViewport } from '../utils/annotationViewport';
import { getTableComponent, syncTableVisibility } from '../tableIntegration';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';

import { createChartImageGetter } from '../chartImage';
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
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
import {
    stringifyChartConfig as stringifyStructuralConfig,
    checkNaN,
    convertColorToHex,
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
    treeShake,
    XMLNS,
    emitCopyAlt,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';

import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { positionWordsAsync } from '../wordcloud';
import { useChartAccessibility } from '../useChartAccessibility';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_word_cloud.json';
import usePanZoom from '../usePanZoom';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseZoomControls from '../atoms/BaseZoomControls.vue';

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);

const { vue_ui_word_cloud: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: [Array, String],
        default() {
            return [];
        },
    },
});

const emit = defineEmits(['copyAlt']);

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length;
    },
    set(bool) {
        return bool;
    },
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
const cloudFinalized = ref(false);
const isRelayout = ref(false);
let layoutController = null;
let isDisposed = false;

function cancelLayout() {
    layoutController?.abort();
}
const zoomControls = ref(null);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const FINAL_CONFIG = ref(prepareConfig());
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);
const cfgTooltip = computed(() => FINAL_CONFIG.value.style.chart.tooltip);
const cfgControls = computed(() => FINAL_CONFIG.value.style.chart.controls);
const cfgWords = computed(() => FINAL_CONFIG.value.style.chart.words);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiWordCloud',
    rules: [COMMON_RULES.noHint],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
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
                        selectedStroke: '#CCCCCC',
                    },
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(() => {
            mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
            mutableConfig.value.showTooltip = cfgTooltip.value.show;
            mutableConfig.value.showZoom = cfgChart.value.zoom.show;
        });
    },
    skeletonDataset: props.config?.skeletonDataset ?? [
        { name: 'Lorem', value: 6 },
        { name: 'ipsum', value: 3 },
        { name: 'dolor', value: 1 },
        { name: 'sit', value: 3 },
        { name: 'amet', value: 3 },
        { name: 'consectetur', value: 2 },
        { name: 'adipiscing', value: 1 },
        { name: 'elit', value: 2 },
        { name: 'Vivamus', value: 2 },
        { name: 'pulvinar', value: 1 },
        { name: 'pretium', value: 1 },
        { name: 'venenatis', value: 2 },
        { name: 'Donec', value: 1 },
        { name: 'imperdiet', value: 3 },
        { name: 'id', value: 1 },
        { name: 'porttitor', value: 2 },
        { name: 'tristique', value: 1 },
        { name: 'Aenean', value: 2 },
        { name: 'ac', value: 5 },
        { name: 'commodo', value: 2 },
        { name: 'justo', value: 2 },
        { name: 'Vestibulum', value: 2 },
        { name: 'placerat', value: 1 },
        { name: 'molestie', value: 1 },
        { name: 'nisl', value: 1 },
        { name: 'lacinia', value: 2 },
        { name: 'nulla', value: 1 },
        { name: 'posuere', value: 2 },
        { name: 'quis', value: 3 },
        { name: 'ullamcorper', value: 1 },
        { name: 'eu', value: 1 },
        { name: 'ex', value: 1 },
        { name: 'vitae', value: 3 },
        { name: 'facilisis', value: 1 },
        { name: 'Aliquam', value: 1 },
        { name: 'erat', value: 1 },
        { name: 'volutpat', value: 1 },
        { name: 'Proin', value: 1 },
        { name: 'nunc', value: 1 },
        { name: 'felis', value: 1 },
        { name: 'gravida', value: 3 },
        { name: 'sed', value: 1 },
        { name: 'orci', value: 1 },
        { name: 'Interdum', value: 1 },
        { name: 'et', value: 1 },
        { name: 'malesuada', value: 1 },
        { name: 'fames', value: 1 },
        { name: 'ante', value: 1 },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const drawableDataset = computed(setupWordCloud);

function setupWordCloud() {
    return typeof FINAL_DATASET.value === 'string'
        ? createWordCloudDatasetFromPlainText(FINAL_DATASET.value)
        : FINAL_DATASET.value.map((dp) => {
              return {
                  ...dp,
                  value: checkNaN(dp.value),
              };
          });
}

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
});

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
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

const resizing = ref(false);
let resizeTimer = null;
let resizeFrame = null;

function cancelResize() {
    clearTimeout(resizeTimer);
    resizeTimer = null;
    if (resizeFrame !== null) {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = null;
    }
    resizing.value = false;
}

let previousStructuralConfig = stringifyStructuralConfig(props.config);

watch(
    () => props.config,
    (newConfig, oldConfig) => {
        const nextStructuralConfig = stringifyStructuralConfig(newConfig);

        const requiresChartPreparation =
            nextStructuralConfig !== previousStructuralConfig;

        previousStructuralConfig = nextStructuralConfig;

        const preparedConfig = prepareConfig();

        if (!requiresChartPreparation) {
            FINAL_CONFIG.value.style.chart.tooltip =
                preparedConfig.style.chart.tooltip;

            mutableConfig.value.showTooltip =
                FINAL_CONFIG.value.style.chart.tooltip.show;

            return;
        }

        cancelLayout();
        FINAL_CONFIG.value = preparedConfig;
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        prepareChart();
        titleStep.value += 1;
        tableStep.value += 1;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = cfgTooltip.value.show;
        mutableConfig.value.showZoom = cfgChart.value.zoom.show;
    },
    { deep: true },
);

const svg = ref({
    width: cfgChart.value.width,
    height: cfgChart.value.height,
    maxFontSize: cfgWords.value.maxFontSize,
    minFontSize: cfgWords.value.minFontSize,
    bold: cfgWords.value.bold,
});

function handleResize() {
    if (isDisposed || !FINAL_CONFIG.value.responsive) return;
    cancelResize();
    cancelLayout();
    resizing.value = true;
    resizeTimer = setTimeout(() => {
        resizeTimer = null;
        if (isDisposed || !FINAL_CONFIG.value.responsive) return;
        const frame = requestAnimationFrame(() => {
            if (resizeFrame !== frame) return;
            resizeFrame = null;
            if (isDisposed || !FINAL_CONFIG.value.responsive) return;
            const { width, height } = useResponsive({
                chart: wordCloudChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgControls.value.show ? zoomControls.value?.$el : null,
                source: source.value,
            });
            svg.value.width = Math.max(10, width);
            svg.value.height = Math.max(10, height - 12);
            resizing.value = false;
            applyInitialViewBox();
            generateWordCloud();
        });
        resizeFrame = frame;
    }, 100);
}

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(prepareChart);

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    cancelResize();
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
                requiredAttributes: ['name', 'value'],
            }).forEach((attr) => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiWordCloud',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value,
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
    } else {
        resizeObserver.value?.disconnect();
        svg.value.width = cfgChart.value.width;
        svg.value.height = cfgChart.value.height;
        generateWordCloud();
    }
    applyInitialViewBox();
}

onBeforeUnmount(() => {
    isDisposed = true;
    cancelResize();
    cancelLayout();
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `wordCloud_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-word-cloud',
    options: FINAL_CONFIG.value.userOptions.print,
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgTooltip.value.show,
    showZoom: cfgChart.value.zoom.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = cfgTooltip.value.show;
        mutableConfig.value.showZoom = cfgChart.value.zoom.show;
    },
    { immediate: true },
);

const positionedWords = ref([]);

async function generateWordCloud() {
    cancelLayout();
    if (isDisposed) return;
    const controller = new AbortController();
    layoutController = controller;
    cloudFinalized.value = false;
    isRelayout.value = true;
    positionedWords.value = [];

    await nextTick();
    if (controller.signal.aborted) return;
    // Resolve inherited fonts after mounting; CSS-wide keywords are not valid
    // Canvas/FontFaceSet font families.
    const configuredFamily = FINAL_CONFIG.value.style.fontFamily;
    const fontFamily = wordCloudChart.value
        ? getComputedStyle(wordCloudChart.value).fontFamily
        : configuredFamily &&
            !['inherit', 'initial', 'unset', 'revert'].includes(
                configuredFamily,
            )
          ? configuredFamily
          : 'Arial, "Noto Sans Arabic", Tahoma, sans-serif';
    const layoutSvg = {
        ...svg.value,
        maxFontSize: cfgWords.value.maxFontSize,
        minFontSize: cfgWords.value.minFontSize,
        style: { bold: cfgWords.value.bold, fontFamily },
    };
    const words = drawableDataset.value.map((word, i) => ({
        ...word,
        id: word.id ?? `${word.name}__${i}`,
        color: word.color
            ? convertColorToHex(word.color)
            : cfgWords.value.usePalette
              ? FINAL_CONFIG.value.customPalette[i] ||
                FINAL_CONFIG.value.customPalette[
                    i % FINAL_CONFIG.value.customPalette.length
                ] ||
                palette[i] ||
                palette[i % palette.length]
              : cfgWords.value.color,
    }));
    const proximity = cfgWords.value.proximity;
    const strictPixelPadding = FINAL_CONFIG.value.strictPixelPadding;
    const { angles, randomizeAngles, randomness, seed } = cfgWords.value;
    try {
        if (document.fonts?.load) {
            // A failed web font uses the browser's fallback in both renderers.
            await document.fonts
                .load(
                    `${layoutSvg.style.bold ? 'bold ' : ''}${layoutSvg.maxFontSize}px ${fontFamily}`,
                    words.map((w) => w.name).join(' '),
                )
                .catch(() => {});
        } else {
            await Promise.resolve();
        }
        if (controller.signal.aborted) return;
        clearWordSelection();
        const result = await positionWordsAsync({
            debugTiming: debug.value,
            words,
            svg: layoutSvg,
            proximity,
            strictPixelPadding,
            angles,
            randomizeAngles,
            randomness,
            seed,
            signal: controller.signal,
            onProgress: ({ all }) => {
                if (!controller.signal.aborted) positionedWords.value = all;
            },
        });
        if (controller.signal.aborted) return;
        positionedWords.value = result || [];
    } finally {
        if (!controller.signal.aborted) {
            cloudFinalized.value = true;
            isRelayout.value = false;
        }
    }
}
const table = computed(() => {
    const head = positionedWords.value.map((w) => {
        return {
            name: w.name,
            color: w.color,
        };
    });
    const body = positionedWords.value.map((w) => w.value);
    return { head, body };
});

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [[h.name], [table.value.body[i]]];
        });
        const tableXls = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            [[''], [FINAL_CONFIG.value.table.columnNames.value]],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-word-cloud',
            });
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
        const label = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: table.value.body[i],
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        return [
            {
                color: h.color,
                name: h.name,
            },
            label,
        ];
    });

    const a11yBody = body.map((b) => {
        return b.map((c, i) => {
            if (i === 0) return c.name;
            return c;
        });
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline,
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline,
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint,
    };

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    return {
        colNames,
        head,
        body,
        a11yBody,
        config,
    };
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

/**
 * Return the current positioned words.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
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

function toggleZoom() {
    mutableConfig.value.showZoom = !mutableConfig.value.showZoom;
}

const active = computed(
    () => !isAnnotator.value && mutableConfig.value.showZoom,
);

const { viewBox, resetZoom, isZoom, setInitialViewBox, zoomByFactor, scale } =
    usePanZoom(
        svgRef,
        {
            x: 0,
            y: 0,
            width: svg.value.width <= 0 ? 10 : svg.value.width,
            height: svg.value.height <= 0 ? 10 : svg.value.height,
        },
        1,
        active,
    );

watch(
    drawableDataset,
    () => {
        generateWordCloud();
        if (!FINAL_CONFIG.value.responsive) applyInitialViewBox();
    },
    { immediate: true, deep: true },
);

const getImage = createChartImageGetter(
    wordCloudChart,
    () => cfgChart.value.title.text,
);

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: cfgChart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: wordCloudChart,
        maxWidth: 500,
        isCursorPointer,
    }),
);

watch(
    () => mutableConfig.value.showTable,
    (v) => syncTableVisibility(v, FINAL_CONFIG, tableUnit),
);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: null,
        legendItems: null,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

function zoomIn() {
    zoomByFactor(1.5, true);
}

function zoomOut() {
    zoomByFactor(1 / 1.5, true);
}

const selectedWord = ref(null);
const useCustomFormat = ref(false);
const tooltipContent = ref('');
const dataTooltipSlot = ref(null);

function clearWordSelection() {
    selectedWord.value = null;
    activeTooltipIndex.value = null;
    isTooltip.value = false;
}

function onTrapLeave(word, index) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: word,
            seriesIndex: index,
        });
    }
    if (
        activeTooltipIndex.value === index &&
        tooltipTriggerMode.value === 'keyboard'
    )
        return;
    selectedWord.value = null;
    isTooltip.value = false;
}

function onTrapClick(word, index) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: word,
            seriesIndex: index,
        });
    }
}

function updateTooltipA11yPosition(index) {
    if (!svgRef.value || index === null || index === undefined) return;

    const rect = svgRef.value.querySelector(
        `[data-a11y-word-index="${index}-${uid.value}"]`,
    );
    if (!rect) return;

    const box = rect.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
    };
}

function useTooltip(word, index, triggerMode = 'pointer') {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: word,
            seriesIndex: index,
        });
    }
    if (!mutableConfig.value.showTooltip) return;

    tooltipTriggerMode.value = triggerMode;
    activeTooltipIndex.value = index;
    selectedWord.value = word.id;
    dataTooltipSlot.value = {
        datapoint: word,
        config: FINAL_CONFIG.value,
        seriesIndex: index,
    };

    const customFormat = cfgTooltip.value.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                datapoint: word,
                config: FINAL_CONFIG.value,
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
        let html = `<svg viewBox="0 0 10 10" height="${cfgTooltip.value.fontSize}"><circle cx="5" cy="5" r="5" fill="${word.color}"/></svg><span>${word.name}:</span><b>${(word.value || 0).toFixed(cfgTooltip.value.roundingValue)}</b>`;

        tooltipContent.value = `<div dir="auto" style="display:flex; gap:4px; align-items:center; jsutify-content:center;">${html}</div>`;
    }

    if (triggerMode === 'keyboard') {
        nextTick(() => {
            updateTooltipA11yPosition(index);
        });
    }

    isTooltip.value = true;
}

async function copyAlt() {
    await emitCopyAlt(
        emit,
        () => FINAL_CONFIG.value.userOptions.callbacks.altCopy,
        () => ({
            config: FINAL_CONFIG.value,
            dataset: positionedWords.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/

function onSvgFocus() {
    activeTooltipIndex.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    clearWordSelection();
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!positionedWords.value.length) return;

    const isPreviousKey = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    const isNextKey = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearWordSelection();
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;
        const word = positionedWords.value[activeTooltipIndex.value];
        if (!word) return;
        onTrapClick(word, activeTooltipIndex.value);
        return;
    }

    let nextIndex = activeTooltipIndex.value;

    if (
        nextIndex === null ||
        nextIndex < 0 ||
        nextIndex >= positionedWords.value.length
    ) {
        nextIndex = isNextKey ? 0 : positionedWords.value.length - 1;
    } else {
        nextIndex += isNextKey ? 1 : -1;

        if (nextIndex < 0) {
            nextIndex = positionedWords.value.length - 1;
        }

        if (nextIndex >= positionedWords.value.length) {
            nextIndex = 0;
        }
    }

    const word = positionedWords.value[nextIndex];
    if (!word) return;

    useTooltip(word, nextIndex, 'keyboard');
}

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows = dataTable.value?.a11yBody ?? [];
    return { headers, rows };
});

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
    toggleFullscreen,
    toggleZoom,
    copyAlt,
});
const annotationViewport = computed(() =>
    createPanZoomAnnotationViewport(
        FINAL_CONFIG.value.userOptions?.annotator?.followZoom,
        viewBox.value,
    ),
);
</script>

<template>
    <div
        class="vue-data-ui-component vue-ui-word-cloud"
        ref="wordCloudChart"
        :id="`wordCloud_${uid}`"
        :data-resizing="resizing"
        :data-relayout="isRelayout"
        :style="`width: 100%; font-family:${FINAL_CONFIG.style.fontFamily};background:${cfgChart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="
            () => {
                setUserOptionsVisibility(false);
                if (!isFocus) {
                    clearWordSelection();
                }
            }
        "
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="FINAL_CONFIG.a11y.includeTable && a11yTable?.rows?.length"
            :uid="uid"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <PenAndPaper
            v-bind="getAnnotatorProps(cfgUserOptions.annotator)"
            v-if="cfgUserOptions.buttons.annotator"
            :svgRef="svgRef"
            :followZoom="FINAL_CONFIG.userOptions?.annotator?.followZoom"
            :annotationViewport="annotationViewport"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="cfgUserOptions.annotatorPalette"
            @close="toggleAnnotator"
        >
            <template
                v-for="slotName in annotationSlotNames"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getAnnotationSlotProps(slotName, slotProps)"
                />
            </template>
        </PenAndPaper>

        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:24px`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        ...cfgChart.title,
                    },
                    subtitle: {
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="
                cfgUserOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :isFullscreen="isFullscreen"
            :chartElement="wordCloudChart"
            v-bind="
                getUserOptionsProps(
                    cfgUserOptions,
                    'pdf csv img svg table fullscreen altCopy annotator zoom',
                )
            "
            :hasTooltip="cfgTooltip.show && cfgUserOptions.buttons.tooltip"
            :isTooltip="mutableConfig.showTooltip"
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :isZoom="mutableConfig.showZoom"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            @toggleZoom="toggleZoom"
            @copyAlt="copyAlt"
            :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }"
        >
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionTooltip optionPdf optionCsv optionImg optionSvg optionTable optionFullscreen optionAnnotator optionZoom optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <BaseZoomControls
            ref="zoomControls"
            v-if="
                cfgControls.position === 'top' && cfgControls.show && !loading
            "
            :config="FINAL_CONFIG"
            :scale="scale"
            :isFullscreen="isFullscreen"
            :isCursorPointer="isCursorPointer"
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="resetZoom(true)"
        />

        <div style="position: relative">
            <svg
                ref="svgRef"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                }"
                :aria-describedby="`chart-instructions-${uid}`"
                :xmlns="XMLNS"
                :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
                :style="`overflow:hidden;background:transparent;display:block`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />
                <slot
                    name="svg-underlayer"
                    :svg="{
                        ...svg,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="0"
                    :y="0"
                    :width="svg.width <= 0 ? 10 : svg.width"
                    :height="svg.height <= 0 ? 10 : svg.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <g
                    :transform="`translate(${cloudOrigin.x}, ${cloudOrigin.y})`"
                    :class="{ 'wc-finalized': cloudFinalized }"
                >
                    <!-- One persistent group per word -->
                    <g
                        v-for="(word, index) in positionedWords"
                        :key="word.id"
                        class="vue-ui-word-cloud-word"
                        :transform="`translate(${word.x}, ${word.y})`"
                    >
                        <rect
                            v-if="word.minX !== undefined"
                            data-cy="datapoint-word"
                            :data-a11y-word-index="`${index}-${uid}`"
                            :x="word.minX"
                            :y="word.minY"
                            :width="word.maxX - word.minX"
                            :height="word.maxY - word.minY"
                            fill="transparent"
                            pointer-events="visiblePainted"
                            :aria-label="`${word.name}: ${(word.value || 0).toFixed(cfgTooltip.roundingValue)}`"
                            @mouseover="useTooltip(word, index)"
                            @mouseleave="onTrapLeave(word, index)"
                            @click="onTrapClick(word, index)"
                        />
                        <text
                            :fill="word.color"
                            :font-weight="cfgWords.bold ? 'bold' : 'normal'"
                            :x="word.textX"
                            :y="word.textY"
                            :font-size="word.fontSize"
                            :font-family="word.fontFamily"
                            :transform="`rotate(${word.angle}, ${word.textX}, ${word.textY})`"
                            :direction="word.direction"
                            :text-anchor="
                                word.direction === 'rtl' ? 'end' : 'start'
                            "
                            dominant-baseline="alphabetic"
                            paint-order="stroke fill"
                            :stroke="
                                !selectedWord || selectedWord === word.id
                                    ? cfgWords.selectedStroke
                                    : undefined
                            "
                            :stroke-width="word.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :style="`
                                pointer-events:none;
                                fill-opacity:${!selectedWord || selectedWord === word.id || !cloudFinalized ? 1 : cfgWords.hoverOpacity} !important;
                            `"
                        >
                            {{ word.name }}
                        </text>
                    </g>
                </g>
                <slot
                    name="svg"
                    :svg="{
                        ...svg,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />
            </svg>
            <div
                v-if="$slots.hint"
                style="position: absolute; top: 100%; left: 0; width: 100%"
                data-dom-to-png-ignore
                aria-hidden="true"
            >
                <slot
                    name="hint"
                    v-bind="{
                        hint: FINAL_CONFIG.a11y.translations.keyboardNavigation,
                        isVisible: isFocus,
                    }"
                />
            </div>
        </div>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot
                name="watermark"
                v-bind="{
                    isPrinting:
                        isPrinting ||
                        isImaging ||
                        isCallbackImaging ||
                        isCallbackSvg,
                }"
            />
        </div>

        <div v-if="isZoom" data-dom-to-png-ignore class="reset-wrapper">
            <slot name="reset-action" :reset="resetZoom"> </slot>
        </div>

        <BaseZoomControls
            ref="zoomControls"
            v-if="
                cfgControls.position === 'bottom' &&
                cfgControls.show &&
                !loading
            "
            :config="FINAL_CONFIG"
            :scale="scale"
            :isFullscreen="isFullscreen"
            :isCursorPointer="isCursorPointer"
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="resetZoom(true)"
        />

        <Tooltip
            :teleportTo="cfgTooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="cfgTooltip.backgroundColor"
            :color="cfgTooltip.color"
            :fontSize="cfgTooltip.fontSize"
            :borderRadius="cfgTooltip.borderRadius"
            :borderColor="cfgTooltip.borderColor"
            :borderWidth="cfgTooltip.borderWidth"
            :backgroundOpacity="cfgTooltip.backgroundOpacity"
            :position="cfgTooltip.position"
            :offsetX="cfgTooltip.offsetX"
            :offsetY="cfgTooltip.offsetY"
            :parent="wordCloudChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
            :smooth="cfgTooltip.smooth"
            :backdropFilter="cfgTooltip.backdropFilter"
            :smoothForce="cfgTooltip.smoothForce"
            :smoothSnapThreshold="cfgTooltip.smoothSnapThreshold"
            :isA11yMode="tooltipTriggerMode === 'keyboard'"
            :a11yPosition="tooltipA11yPosition"
        >
            <template #tooltip-before>
                <slot
                    name="tooltip-before"
                    v-bind="{ ...dataTooltipSlot }"
                ></slot>
            </template>
            <template #tooltip>
                <slot name="tooltip" v-bind="{ ...dataTooltipSlot }" />
            </template>
            <template #tooltip-after>
                <slot
                    name="tooltip-after"
                    v-bind="{ ...dataTooltipSlot }"
                ></slot>
            </template>
        </Tooltip>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <component
            v-if="isDataset && cfgUserOptions.buttons.table"
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
                    @click="generateCsv(cfgUserOptions.callbacks.csv)"
                    :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
                >
                    <BaseIcon
                        name="fileCsv"
                        :stroke="tableComponent.props.color"
                    />
                </button>
            </template>
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="
                        FINAL_CONFIG.table.useDialog ? '' : tableComponent.title
                    "
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    :isCursorPointer="isCursorPointer"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div style="display: flex; align-items: center">
                            {{ th }}
                        </div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped lang="scss">
@import '../vue-data-ui.css';

.vue-ui-word-cloud {
    position: relative;
}

.vue-ui-word-cloud * {
    transition: none;
}

.vue-ui-word-cloud-word {
    will-change: transform;
    transition: transform 0.25s ease-out;
}

.vue-ui-word-cloud svg {
    shape-rendering: geometricPrecision;
    text-rendering: optimizeLegibility;
}

.vue-ui-word-cloud text {
    backface-visibility: hidden;
}

/* Neutralize any previous fade animation to avoid flicker */
text.animated {
    opacity: 1;
    user-select: none;
    animation: none !important;
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

.wc-finalized text {
    transition: fill-opacity 0.25s ease-out;
}

.vue-ui-word-cloud[data-resizing='true'] .vue-ui-word-cloud-word,
.vue-ui-word-cloud[data-relayout='true'] .vue-ui-word-cloud-word {
    transition: none;
}

svg:focus {
    outline: none;
}

svg:focus-visible {
    outline: 2px solid currentColor;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    clip: rect(0 0 0 0);
    white-space: normal;
    border: 0;
}
</style>

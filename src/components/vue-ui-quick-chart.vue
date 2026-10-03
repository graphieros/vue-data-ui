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
    watchEffect,
} from 'vue';
import * as detector from '../chartDetector';
import {
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcNutArrowPath,
    calculateNiceScale,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createSmoothPath,
    createUid,
    createTSpansFromLineBreaksOnX,
    dataLabel,
    error,
    functionReturnsString,
    isFunction,
    makeDonut,
    palette,
    sanitizeArray,
    themePalettes,
    XMLNS,
    treeShake,
    objectIsEmpty,
    deepClone,
} from '../lib';
import { throttle } from '../canvas-lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { useNestedProp } from '../useNestedProp';
import { useResponsive } from '../useResponsive';
import { useTimeLabels } from '../useTimeLabels';
import { useThemeCheck } from '../useThemeCheck';
import { useChartExport } from '../useChartExport';
import { useTransitions } from '../useTransitions.js';
import { useStableElementSize } from '../useStableElementSize.js';
import { useChartAccessibility } from '../useChartAccessibility';
import { useTimeLabelCollision } from '../useTimeLabelCollider';
import img from '../img';
import SlicerPreview from '../atoms/SlicerPreview.vue';
import themes from '../themes/vue_ui_quick_chart.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);

const { vue_ui_quick_chart: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: [Array, Object, String, Number],
        default() {
            return null;
        },
    },
    zoomState: {
        type: Object,
        default: null,
    },
});

const quickChart = ref(null);
const quickChartTitle = ref(null);
const quickChartLegend = ref(null);
const quickChartSlicer = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const dataTooltipSlot = ref(null);
const tooltipContent = ref('');
const selectedDatapoint = ref(null);
const source = ref(null);
const noTitle = ref(null);
const segregated = ref([]);
const step = ref(0);
const slicerStep = ref(0);
const readyTeleport = ref(false);
const pathWrapper = ref(null);
const pathTop = ref(null);

const timeLabelsEls = ref(null);
const scaleLabels = ref(null);
const xAxisLabel = ref(null);
const yAxisLabel = ref(null);

const parentElement = shallowRef(null);
const parentLayoutIsStable = ref(false);
const parentLayoutStableRunSequence = ref(0);
const pendingParentLayoutSequence = ref(0);
const parentStableLayoutRefreshIsQueued = ref(false);

function setParentElementReference() {
    parentElement.value = quickChart.value?.parentNode ?? null;
}

function nextPaintFrame() {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

async function runParentStableLayoutPass() {
    const currentSequence = ++pendingParentLayoutSequence.value;
    parentLayoutIsStable.value = false;
    await nextTick();
    await nextPaintFrame();
    await nextPaintFrame();
    if (currentSequence !== pendingParentLayoutSequence.value) return;
    parentLayoutStableRunSequence.value += 1;
    parentLayoutIsStable.value = true;
}

function queueParentStableLayoutRefresh() {
    if (parentStableLayoutRefreshIsQueued.value) return;
    parentStableLayoutRefreshIsQueued.value = true;
    nextTick(() => {
        parentStableLayoutRefreshIsQueued.value = false;
        setParentElementReference();
        runParentStableLayoutPass();
    });
}

const stableParentSize = useStableElementSize({
    elementRef: parentElement,
    minimumWidth: 2,
    minimumHeight: 2,
    stableFramesRequired: 2,
    once: false,
    onSizeAccepted: () => {
        runParentStableLayoutPass();
    },
});

const donutStroke = ref('#FFFFFF');
const FINAL_CONFIG = ref(prepareConfig());

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiQuickChart',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: () => true,
            message: [
                '👀 This is a swiss-knife component. If you need more control, consider using dedicated components:',
                '',
                '▶️ VueUiXy for time series line and/or bars',
                '',
                '▶️ VueUiDonut, VueUiWaffle, VueUiRings for proportions',
            ],
        },
    ],
});

const { transitionEnabled } = useTransitions({
    config: () => FINAL_CONFIG.value.transitions,
    dataset: () => props.dataset,
});

const debug = computed(() => FINAL_CONFIG.value.debug);
const isCursorPointer = computed(() => FINAL_CONFIG.value.useCursorPointer);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const skeletonConfig = computed(() => {
    return treeShake({
        dafaultConfig: {
            backgroundColor: '#99999930',
            customPalette: ['#BABABA'],
            showDataLabels: false,
            paletteStartIndex: 0,
            showUserOptions: false,
            showTooltip: false,
            xAxisLabel: '',
            yAxisLabel: '',
            xyAxisStroke: '#999999',
            xyGridStroke: '#99999950',
            xyPeriods: [],
            xyShowScale: false,
            xyPaddingLeft: 6,
            xyPaddingBottom: 12,
            zoomXy: false,
            zoomStartIndex: null,
            zoomEndIndex: null,
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

// v3 - Skeleton loader management
const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
        1, 2, 3, 5, 8, 13, 21, 34, 55, 89,
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { svgRef } = useChartAccessibility({
    config: { text: FINAL_CONFIG.value.title },
});

const showUserOptionsOnChartHover = computed(
    () => FINAL_CONFIG.value.showUserOptionsOnChartHover,
);
const keepUserOptionState = computed(
    () => FINAL_CONFIG.value.keepUserOptionsStateOnChartLeave,
);
const userOptionsVisible = ref(!FINAL_CONFIG.value.showUserOptionsOnChartHover);

const userHovers = ref(false);

function setUserOptionsVisibility(state = false) {
    userHovers.value = state;
    if (!showUserOptionsOnChartHover.value) return;
    userOptionsVisible.value = state;
}

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });
    let finalConfig = {};

    const theme = mergedConfig.theme;

    if (theme) {
        if (!isThemeValid.value(mergedConfig)) {
            warnInvalidTheme(mergedConfig);
            finalConfig = mergedConfig;
        } else {
            const fused = useNestedProp({
                userConfig: themes[theme] || props.config,
                defaultConfig: mergedConfig,
            });

            finalConfig = {
                ...useNestedProp({
                    userConfig: props.config,
                    defaultConfig: fused,
                }),
                customPalette: mergedConfig.customPalette.length
                    ? mergedConfig.customPalette
                    : themePalettes[theme] || palette,
            };
        }
    } else {
        finalConfig = mergedConfig;
    }

    return finalConfig;
}

function stringifyStructuralConfig(cfg) {
    const clonedConfig = deepClone(cfg);
    if (clonedConfig?.tooltipPosition) {
        delete clonedConfig.tooltipPosition;
        // Add more properties here if they should not recompute the svg
    }
    return JSON.stringify(clonedConfig);
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
            FINAL_CONFIG.value.tooltipPosition = preparedConfig.tooltipPosition;

            mutableConfig.value.showTooltip = FINAL_CONFIG.value.showTooltip;

            return;
        }

        if (!loading.value) {
            FINAL_CONFIG.value = preparedConfig;
        }
        defaultSizes.value.width = FINAL_CONFIG.value.width;
        defaultSizes.value.height = FINAL_CONFIG.value.height;
        userOptionsVisible.value =
            !FINAL_CONFIG.value.showUserOptionsOnChartHover;
        prepareChart();

        // Reset mutable config
        mutableConfig.value.showTooltip = FINAL_CONFIG.value.showTooltip;
    },
    { deep: true },
);

// v3 - Stop skeleton loader when props.dataset becomes valid
watch(
    () => props.dataset,
    (newVal) => {
        if (Array.isArray(newVal) && newVal.length > 0) {
            manualLoading.value = false;
        }
    },
    { immediate: true },
);

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const emit = defineEmits([
    'selectDatapoint',
    'selectLegend',
    'zoomStart',
    'zoomEnd',
    'zoomReset',
    'update:zoomState',
    'copyAlt',
]);

const fd = computed(() => {
    const f = detector.detectChart({
        debug: debug.value,
        dataset: sanitizeArray(FINAL_DATASET.value, [
            'serie',
            'series',
            'data',
            'value',
            'values',
            'num',
        ]),
        barLineSwitch: FINAL_CONFIG.value.chartIsBarUnderDatasetLength,
    });
    if (!f && debug.value) {
        console.error('VueUiQuickChart : Dataset is not processable');
    }
    return f;
});

const formattedDataset = ref(fd.value);

const isProcessable = computed(() => {
    return !!formattedDataset.value;
});

const chartType = computed(() => {
    return formattedDataset.value ? formattedDataset.value.type : null;
});

const isZoomableChart = computed(() =>
    [detector.chartType.BAR, detector.chartType.LINE].includes(chartType.value),
);

const isZoomUiVisible = computed(
    () =>
        isZoomableChart.value &&
        FINAL_CONFIG.value.zoomXy &&
        Number(formattedDataset.value?.maxSeriesLength ?? 0) > 1,
);

watch(
    () => chartType.value,
    (v) => {
        if (!v) {
            error({
                componentName: 'VueUiQuickChart',
                type: 'dataset',
                debug: debug.value,
            });
        }
    },
    { immediate: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `${chartType.value}_${uid.value}`,
    fileName: FINAL_CONFIG.value.title || chartType.value,
    options: FINAL_CONFIG.value.userOptionsPrint,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.showUserOptions && !FINAL_CONFIG.value.title;
});

const defaultSizes = ref({
    width: FINAL_CONFIG.value.width,
    height: FINAL_CONFIG.value.height,
});

const mutableConfig = ref({
    showTooltip: FINAL_CONFIG.value.showTooltip,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTooltip: FINAL_CONFIG.value.showTooltip,
        };
    },
    { immediate: true },
);

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    readyTeleport.value = true;
    setParentElementReference();
    stableParentSize.start();
    prepareChart();
    runParentStableLayoutPass();
});

function prepareChart() {
    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }
    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: quickChart.value,
                title: FINAL_CONFIG.value.title ? quickChartTitle.value : null,
                legend: FINAL_CONFIG.value.showLegend
                    ? quickChartLegend.value
                    : null,
                slicer: isZoomUiVisible.value ? quickChartSlicer.value : null,
                source: source.value,
                noTitle: noTitle.value,
            });

            requestAnimationFrame(() => {
                defaultSizes.value.width = width;
                defaultSizes.value.height = height;
                queueParentStableLayoutRefresh();
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = quickChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
    setupSlicer();
    queueParentStableLayoutRefresh();
}

onBeforeUnmount(() => {
    stableParentSize.stop();
    clearQueuedSlicerFrame();
    cancelChartZoomSelection();

    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
        resizeObserver.value = null;
        observedEl.value = null;
    }
});

const viewBox = computed(() => {
    switch (chartType.value) {
        case detector.chartType.LINE:
            return `0 0 ${defaultSizes.value.width <= 0 ? 10 : defaultSizes.value.width} ${defaultSizes.value.height <= 0 ? 10 : defaultSizes.value.height}`;

        case detector.chartType.BAR:
            return `0 0 ${defaultSizes.value.width <= 0 ? 10 : defaultSizes.value.width} ${defaultSizes.value.height <= 0 ? 10 : defaultSizes.value.height}`;

        case detector.chartType.DONUT:
            return `0 0 ${defaultSizes.value.width <= 0 ? 10 : defaultSizes.value.width} ${defaultSizes.value.height <= 0 ? 10 : defaultSizes.value.height}`;

        default:
            return `0 0 ${defaultSizes.value.width <= 0 ? 10 : defaultSizes.value.width} ${defaultSizes.value.height <= 0 ? 10 : defaultSizes.value.height}`;
    }
});

function sumValues(source) {
    return [...source].map((s) => s.value).reduce((a, b) => a + b, 0);
}

function getBlurFilter(id) {
    if (
        FINAL_CONFIG.value.blurOnHover &&
        ![null, undefined].includes(selectedDatapoint.value) &&
        selectedDatapoint.value !== id
    ) {
        return `url(#blur_${uid.value})`;
    } else {
        return '';
    }
}

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        if (chartType.value === detector.chartType.DONUT) {
            donut.value.legend.forEach((l) => {
                segregated.value.push(l.id);
            });
        } else if (chartType.value === detector.chartType.LINE) {
            line.value.legend.forEach((l) => {
                segregated.value.push(l.id);
            });
        } else if (chartType.value === detector.chartType.BAR) {
            bar.value.legend.forEach((l) => {
                segregated.value.push(l.id);
            });
        }
    }

    if (chartType.value === detector.chartType.DONUT) {
        emit('selectLegend', donut.value.dataset);
    } else if (chartType.value === detector.chartType.LINE) {
        emit('selectLegend', line.value.dataset);
    } else if (chartType.value === detector.chartType.BAR) {
        emit('selectLegend', bar.value.dataset);
    }
}

function segregate(id, len) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter((el) => el !== id);
    } else {
        if (segregated.value.length < len) {
            segregated.value.push(id);
        }
    }
}

const raf = ref(null);
const rafUp = ref(null);
const isSegregatingDonut = ref(false);

function segregateDonut(arc, ds) {
    isSegregatingDonut.value = true;
    let initVal = arc.value;
    const targetVal = fd.value.dataset.find(
        (el, i) => arc.id === `donut_${i}`,
    ).VALUE;
    if (segregated.value.includes(arc.id)) {
        segregated.value = segregated.value.filter((el) => el !== arc.id);
        function animUp() {
            if (initVal > targetVal) {
                isSegregatingDonut.value = false;
                cancelAnimationFrame(rafUp.value);
                formattedDataset.value = {
                    ...formattedDataset.value,
                    dataset: formattedDataset.value.dataset.map((ds, i) => {
                        if (arc.id === `donut_${i}`) {
                            return {
                                ...ds,
                                value: targetVal,
                                VALUE: targetVal,
                            };
                        } else {
                            return ds;
                        }
                    }),
                };
                emit('selectLegend', donut.value.dataset);
            } else {
                initVal += targetVal * 0.025;
                formattedDataset.value = {
                    ...formattedDataset.value,
                    dataset: formattedDataset.value.dataset.map((ds, i) => {
                        if (arc.id === `donut_${i}`) {
                            return {
                                ...ds,
                                value: initVal,
                                VALUE: initVal,
                            };
                        } else {
                            return ds;
                        }
                    }),
                };
                rafUp.value = requestAnimationFrame(animUp);
            }
        }
        animUp();
    } else if (ds.length > 1) {
        function anim() {
            if (initVal < targetVal / 100) {
                isSegregatingDonut.value = false;
                cancelAnimationFrame(raf.value);
                segregated.value.push(arc.id);
                formattedDataset.value = {
                    ...formattedDataset.value,
                    dataset: formattedDataset.value.dataset.map((ds, i) => {
                        if (arc.id === `donut_${i}`) {
                            return {
                                ...ds,
                                value: 0,
                                VALUE: 0,
                            };
                        } else {
                            return ds;
                        }
                    }),
                };
                emit('selectLegend', donut.value.dataset);
            } else {
                initVal /= 1.1;
                formattedDataset.value = {
                    ...formattedDataset.value,
                    dataset: formattedDataset.value.dataset.map((ds, i) => {
                        if (arc.id === `donut_${i}`) {
                            return {
                                ...ds,
                                value: initVal,
                                VALUE: initVal,
                            };
                        } else {
                            return ds;
                        }
                    }),
                };
                raf.value = requestAnimationFrame(anim);
            }
        }
        anim();
    } else {
        emit('selectLegend', donut.value.dataset);
    }
}

const commonSelectedIndex = ref(null);

function setCommonSelectedIndex(index) {
    commonSelectedIndex.value = index;
}

const optimalDonutThickness = computed(() => {
    return FINAL_CONFIG.value.donutThicknessRatio < 0.01
        ? 0.01
        : FINAL_CONFIG.value.donutThicknessRatio > 0.4
          ? 0.4
          : FINAL_CONFIG.value.donutThicknessRatio;
});

const donut = computed(() => {
    if (chartType.value !== detector.chartType.DONUT) return null;
    const ds = formattedDataset.value.dataset
        .map((ds, i) => {
            return {
                ...ds,
                value:
                    ds.VALUE || ds.DATA || ds.SERIE || ds.VALUES || ds.NUM || 0,
                name:
                    ds.NAME ||
                    ds.DESCRIPTION ||
                    ds.TITLE ||
                    ds.LABEL ||
                    `Serie ${i}`,
                id: `donut_${i}`,
            };
        })
        .map((ds, i) => {
            return {
                ...ds,
                color: ds.COLOR
                    ? convertColorToHex(ds.COLOR)
                    : customPalette.value[
                          i + FINAL_CONFIG.value.paletteStartIndex
                      ] ||
                      palette[i + FINAL_CONFIG.value.paletteStartIndex] ||
                      palette[
                          (i + FINAL_CONFIG.value.paletteStartIndex) %
                              palette.length
                      ],
                immutableValue: ds.value,
            };
        });

    function displayArcPercentage(arc, stepBreakdown) {
        return dataLabel({
            v: isNaN(arc.value / sumValues(stepBreakdown))
                ? 0
                : (arc.value / sumValues(stepBreakdown)) * 100,
            s: '%',
            r: FINAL_CONFIG.value.dataLabelRoundingPercentage,
        });
    }

    function isArcBigEnough(arc) {
        return (
            arc.proportion * 100 >
            FINAL_CONFIG.value.donutHideLabelUnderPercentage
        );
    }

    function getSpaces(datapointId, num2) {
        const num1 = fd.value.dataset.find(
            (_, i) => `donut_${i}` === datapointId,
        ).VALUE;
        const difference = Math.abs(
            String(Number(num1.toFixed(0))).length -
                String(Number(num2.toFixed(0))).length,
        );
        return difference;
    }

    function useTooltip({ datapoint, seriesIndex, triggerMode = 'pointer' }) {
        dataTooltipSlot.value = {
            datapoint,
            seriesIndex,
            config: FINAL_CONFIG.value,
            dataset: ds,
        };
        selectedDatapoint.value = datapoint.id;
        activeTooltipIndex.value = seriesIndex;
        tooltipTriggerMode.value = triggerMode;

        const customFormat = FINAL_CONFIG.value.tooltipCustomFormat;

        if (FINAL_CONFIG.value.events.datapointEnter) {
            FINAL_CONFIG.value.events.datapointEnter({
                datapoint,
                seriesIndex,
            });
        }

        if (
            isFunction(customFormat) &&
            functionReturnsString(() =>
                customFormat({
                    datapoint,
                    seriesIndex,
                    series: ds,
                    config: FINAL_CONFIG.value,
                }),
            )
        ) {
            tooltipContent.value = customFormat({
                datapoint,
                seriesIndex,
                series: ds,
                config: FINAL_CONFIG.value,
            });
        } else {
            let html = '';
            html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.tooltipBorderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;
            html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

            html += `<b>${applyDataLabel(
                FINAL_CONFIG.value.formatter,
                datapoint.value,
                dataLabel({
                    p: FINAL_CONFIG.value.valuePrefix,
                    v: datapoint.value,
                    s: FINAL_CONFIG.value.valueSuffix,
                    r: FINAL_CONFIG.value.dataLabelRoundingValue,
                }),
                { datapoint, seriesIndex },
            )}</b>`;

            html += `<span>(${dataLabel({ v: datapoint.proportion * 100, s: '%', r: FINAL_CONFIG.value.dataLabelRoundingPercentage })})</span></div>`;

            tooltipContent.value = `<div>${html}</div>`;
        }
        isTooltip.value = true;
    }

    function killTooltip({ datapoint, seriesIndex }) {
        if (FINAL_CONFIG.value.events.datapointLeave) {
            FINAL_CONFIG.value.events.datapointLeave({
                datapoint,
                seriesIndex,
            });
        }
        isTooltip.value = false;
        selectedDatapoint.value = null;
        commonSelectedIndex.value = null;
        activeTooltipIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
    }

    function selectDatapoint({ datapoint, seriesIndex }) {
        if (FINAL_CONFIG.value.events.datapointClick) {
            FINAL_CONFIG.value.events.datapointClick({
                datapoint,
                seriesIndex,
            });
        }
        emit('selectDatapoint', datapoint);
    }

    const drawingArea = {
        centerX: defaultSizes.value.width / 2,
        centerY: defaultSizes.value.height / 2,
    };

    const total = ds
        .filter((d) => !segregated.value.includes(d.id))
        .map((d) => d.value || 0)
        .reduce((a, b) => a + b, 0);

    const legend = ds.map((d, i) => {
        return {
            ...d,
            proportion: (d.value || 0) / total,
            value: d.value || 0,
            absoluteValue: fd.value.dataset.find(
                (_, idx) => `donut_${idx}` === d.id,
            ).VALUE,
            shape: 'circle',
        };
    });

    const cx = defaultSizes.value.width / 2;
    const cy = defaultSizes.value.height / 2;
    const radius =
        defaultSizes.value.height * FINAL_CONFIG.value.donutRadiusRatio;

    return {
        dataset: legend.filter((s) => !segregated.value.includes(s.id)),
        legend,
        drawingArea,
        displayArcPercentage,
        isArcBigEnough,
        useTooltip,
        killTooltip,
        selectDatapoint,
        getSpaces,
        total,
        cx,
        cy,
        radius,
        chart: makeDonut(
            { series: ds.filter((s) => !segregated.value.includes(s.id)) },
            cx,
            cy,
            radius,
            radius,
            1.99999,
            2,
            1,
            360,
            105.25,
            defaultSizes.value.height * optimalDonutThickness.value,
        ),
    };
});

const slicer = ref({
    start: 0,
    end: formattedDataset.value.maxSeriesLength,
});

const slicerPrecog = ref({ ...slicer.value });
const slicerComponent = ref(null);
const slicerReady = ref(false);
const isSettingUpSlicer = ref(false);
const suppressSlicerChild = ref(false);

const isChartZoomSelecting = ref(false);
const isChartZoomPointerFocused = ref(false);
const chartZoomStartX = ref(null);
const chartZoomCurrentX = ref(null);
const chartZoomPointerId = ref(null);
const ignoreNextChartClick = ref(false);
const lastChartZoomTap = ref({
    time: 0,
    x: 0,
    y: 0,
    pointerType: null,
});

const DEFAULT_ZOOM_ON_CHART = {
    show: false,
    selection: {
        fill: '#2D353C',
        stroke: 'transparent',
        fillOpacity: 0.1,
        strokeOpacity: 0.5,
        strokeWidth: 1,
        strokeDasharray: 0,
    },
};

const dragToZoomConfig = computed(() => {
    const userConfig = FINAL_CONFIG.value.dragToZoom ?? {};

    return {
        ...DEFAULT_ZOOM_ON_CHART,
        ...userConfig,
        selection: {
            ...DEFAULT_ZOOM_ON_CHART.selection,
            ...(userConfig.selection ?? {}),
        },
    };
});

const isChartZoomEnabled = computed(() => {
    return (
        isZoomableChart.value &&
        dragToZoomConfig.value.show &&
        slicerReady.value &&
        getSlicerMax() > 1 &&
        !loading.value
    );
});

let queuedSlicerFrame = null;
let queuedSlicerUpdate = {};

function normalizeZoomState(state, fallback = slicer.value) {
    if (!state || typeof state !== 'object') return null;
    const hasStart = state.start !== undefined && state.start !== null;
    const hasEnd = state.end !== undefined && state.end !== null;
    if (!hasStart && !hasEnd) return null;
    const start = hasStart ? Number(state.start) : Number(fallback.start);
    const end = hasEnd ? Number(state.end) : Number(fallback.end);
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return null;
    }
    return {
        start,
        end,
    };
}

function emitZoomState(state) {
    const normalized = normalizeZoomState(state);
    if (!normalized) return;

    emit('update:zoomState', normalized);
}

function clearQueuedSlicerFrame() {
    if (queuedSlicerFrame) {
        cancelAnimationFrame(queuedSlicerFrame);
        queuedSlicerFrame = null;
    }

    queuedSlicerUpdate = {};
}

function getSlicerMax() {
    const max = Number(formattedDataset.value?.maxSeriesLength);
    return Number.isFinite(max) ? Math.max(0, max) : 0;
}

function validSlicerEnd(v, start = slicer.value.start) {
    const max = getSlicerMax();
    if (max <= 0) return 0;

    const effectiveStart = Math.max(0, Math.min(Number(start) || 0, max - 1));

    const value = Number(v);
    if (!Number.isFinite(value)) {
        return Math.min(effectiveStart + 1, max);
    }

    if (value > max) {
        return max;
    }

    if (value <= effectiveStart) {
        return Math.min(effectiveStart + 1, max);
    }

    return Math.max(0, value);
}

function normalizeSlicerWindow() {
    const max = getSlicerMax();

    if (max <= 0) {
        slicer.value = { start: 0, end: 0 };
        slicerPrecog.value = { ...slicer.value };

        if (slicerComponent.value) {
            slicerComponent.value.setRangeValues(0, 0);
        }
        return;
    }

    let start = Number(slicer.value.start);
    let end = Number(slicer.value.end);

    if (!Number.isFinite(start)) start = 0;
    if (!Number.isFinite(end)) end = max;

    start = Math.max(0, Math.min(start, max - 1));
    end = Math.max(start + 1, Math.min(end, max));

    slicer.value = { start, end };
    slicerPrecog.value = { start, end };

    if (slicerComponent.value) {
        slicerComponent.value.setRangeValues(start, end);
    }
}

function applyZoomState(state) {
    if (!isZoomableChart.value) return null;

    const normalized = normalizeZoomState(state);
    if (!normalized) return null;

    if (
        normalized.start !== Number(slicer.value.start) ||
        normalized.end !== Number(slicer.value.end)
    ) {
        clearQueuedSlicerFrame();

        slicer.value = {
            start: normalized.start,
            end: normalized.end,
        };
        slicerPrecog.value = { ...slicer.value };

        normalizeSlicerWindow();
        queueParentStableLayoutRefresh();
    }

    // Always return the final committed range. Prop-driven synchronization
    // remains silent, while the public imperative API can publish this state
    // so sibling instances sharing v-model:zoom-state receive it.
    return {
        start: Number(slicer.value.start),
        end: Number(slicer.value.end),
    };
}

function setZoomState(state) {
    const applied = applyZoomState(state);
    if (!applied) return null;

    emitZoomState(applied);

    return applied;
}

async function setupSlicer({ applyControlledZoom = true } = {}) {
    if (isSettingUpSlicer.value) return;

    if (!isZoomableChart.value) {
        slicerReady.value = false;
        return;
    }

    isSettingUpSlicer.value = true;

    try {
        await nextTick();
        await nextTick();

        const { zoomStartIndex, zoomEndIndex } = FINAL_CONFIG.value;
        const max = getSlicerMax();

        if (max <= 0) {
            slicer.value = { start: 0, end: 0 };
            slicerPrecog.value = { ...slicer.value };
            slicerReady.value = false;
            return;
        }

        let start = zoomStartIndex != null ? Number(zoomStartIndex) : 0;
        let end =
            zoomEndIndex != null
                ? validSlicerEnd(Number(zoomEndIndex) + 1, start)
                : max;

        if (applyControlledZoom && normalizeZoomState(props.zoomState)) {
            const controlled = normalizeZoomState(props.zoomState);
            start = controlled.start;
            end = controlled.end;
        }

        suppressSlicerChild.value = true;

        slicer.value = { start, end };
        slicerPrecog.value = { start, end };

        normalizeSlicerWindow();

        slicerReady.value = true;

        await nextTick();

        if (slicerComponent.value) {
            slicerComponent.value.setRangeValues(
                slicer.value.start,
                slicer.value.end,
            );
        }
    } finally {
        queueMicrotask(() => {
            suppressSlicerChild.value = false;
        });

        isSettingUpSlicer.value = false;
        queueParentStableLayoutRefresh();
    }
}

async function refreshSlicer({
    applyControlledZoom = false,
    publish = false,
} = {}) {
    clearQueuedSlicerFrame();

    await setupSlicer({ applyControlledZoom });

    if (publish) {
        emitZoomState({
            start: Number(slicer.value.start),
            end: Number(slicer.value.end),
        });
        emit('zoomReset');
    }
}

function queueSlicerUpdate(update) {
    queuedSlicerUpdate = {
        ...queuedSlicerUpdate,
        ...update,
    };

    if (queuedSlicerFrame) {
        cancelAnimationFrame(queuedSlicerFrame);
    }

    queuedSlicerFrame = requestAnimationFrame(() => {
        const nextSlicer = {
            ...slicer.value,
            ...queuedSlicerUpdate,
        };

        queuedSlicerUpdate = {};
        queuedSlicerFrame = null;

        slicer.value = nextSlicer;
        slicerPrecog.value = { ...nextSlicer };

        normalizeSlicerWindow();

        // SlicerPreview emits update:start and update:end independently while
        // dragging the full selection. Publish only after both pending values
        // have been merged into one authoritative range.
        emitZoomState({
            start: Number(slicer.value.start),
            end: Number(slicer.value.end),
        });

        queueParentStableLayoutRefresh();
    });
}

function onSlicerStart(v) {
    if (isSettingUpSlicer.value || suppressSlicerChild.value) return;

    const start = Number(v);
    if (!Number.isFinite(start)) return;

    emit('zoomStart', {
        index: start,
        isZoom: start !== 0,
    });

    if (start === slicer.value.start && queuedSlicerUpdate.end === undefined) {
        return;
    }

    queueSlicerUpdate({ start });
}

function onSlicerEnd(v) {
    if (isSettingUpSlicer.value || suppressSlicerChild.value) return;

    const pendingStart =
        queuedSlicerUpdate.start !== undefined
            ? queuedSlicerUpdate.start
            : slicer.value.start;

    const end = validSlicerEnd(Number(v), pendingStart);

    emit('zoomEnd', {
        index: end,
        isZoom: end !== getSlicerMax(),
    });

    if (end === slicer.value.end && queuedSlicerUpdate.start === undefined) {
        return;
    }

    queueSlicerUpdate({ end });
}

watch(
    [
        () => props.zoomState,
        isZoomableChart,
        () => Number(formattedDataset.value?.maxSeriesLength ?? 0),
    ],
    async ([state, zoomable, max]) => {
        if (!zoomable || max <= 0 || !state) return;

        if (!slicerReady.value) {
            await setupSlicer({ applyControlledZoom: true });
            return;
        }

        /**
         * When this is the instance from which originated the v-model update, applyZoomState exits
         * immediately because the committed slicer already matches the model.
         */
        applyZoomState(state);
    },
    {
        deep: true,
        immediate: true,
    },
);

watch(
    fd,
    async (nextFormattedDataset) => {
        if (!nextFormattedDataset) {
            slicerReady.value = false;
            return;
        }

        const previousType = formattedDataset.value?.type;
        const previousMax = Number(
            formattedDataset.value?.maxSeriesLength ?? 0,
        );

        formattedDataset.value = nextFormattedDataset;

        const nextType = nextFormattedDataset.type;
        const nextMax = Number(nextFormattedDataset.maxSeriesLength ?? 0);

        const nextIsZoomable = [
            detector.chartType.BAR,
            detector.chartType.LINE,
        ].includes(nextType);

        if (!nextIsZoomable) {
            clearQueuedSlicerFrame();
            slicerReady.value = false;
            queueParentStableLayoutRefresh();
            return;
        }

        const domainChanged =
            previousType !== nextType || previousMax !== nextMax;

        if (domainChanged) {
            clearQueuedSlicerFrame();
            slicerReady.value = false;

            slicer.value = {
                start: 0,
                end: nextMax,
            };
            slicerPrecog.value = { ...slicer.value };

            // Force SlicerPreview to rebuild when it is visible. Shared state
            // is restored immediately afterwards.
            slicerStep.value += 1;

            await nextTick();
            await setupSlicer({ applyControlledZoom: true });
        } else if (props.zoomState) {
            applyZoomState(props.zoomState);
        }

        queueParentStableLayoutRefresh();
    },
    {
        deep: true,
    },
);

const minimap = computed(() => {
    if (
        !FINAL_CONFIG.value.zoomMinimap.show ||
        chartType.value === detector.chartType.DONUT
    )
        return [];

    let ds = [];

    if (detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset;
    }

    if (detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset
            .map((d, i) => {
                return {
                    values:
                        d.VALUE ||
                        d.DATA ||
                        d.SERIE ||
                        d.SERIES ||
                        d.VALUES ||
                        d.NUM ||
                        0,
                    id:
                        chartType.value === detector.chartType.LINE
                            ? `line_${i}`
                            : `bar_${i}`,
                };
            })
            .filter((s) => !segregated.value.includes(s.id));
    }

    const maxIndex = detector.isSimpleArrayOfNumbers(ds)
        ? ds.length
        : Math.max(...ds.map((s) => s.values.length));
    let sumAllSeries = [];

    if (detector.isSimpleArrayOfNumbers(ds)) {
        sumAllSeries = ds;
    } else {
        for (let i = 0; i < maxIndex; i += 1) {
            sumAllSeries.push(
                ds
                    .map((s) => s.values[i] || 0)
                    .reduce((a, b) => (a || 0) + (b || 0), 0),
            );
        }
    }

    const min = Math.min(...sumAllSeries);
    return sumAllSeries.map((dp) => dp + (min < 0 ? Math.abs(min) : 0)); // positivized
});

function getScaleLabelX() {
    let base = 0;
    if (scaleLabels.value) {
        const texts = Array.from(scaleLabels.value.querySelectorAll('text'));
        base = texts.reduce((max, t) => {
            const w = t.getComputedTextLength();
            return w > max ? w : max;
        }, 0);
    }

    const crosshair = 4;
    return base + crosshair;
}

const timeLabelsHeight = ref(0);

const updateHeight = throttle((h) => {
    timeLabelsHeight.value = h;
}, 100);

// Track time label height to update drawing area when they rotate
watchEffect((onInvalidate) => {
    const el = timeLabelsEls.value;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
        updateHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    onInvalidate(() => observer.disconnect());
});

onBeforeUnmount(() => {
    timeLabelsHeight.value = 0;
});

const timeLabelsY = computed(() => {
    let h = 0;
    let tlH = 0;
    if (timeLabelsEls.value) {
        tlH = timeLabelsHeight.value;
    }
    return h + tlH;
});

const line = computed(() => {
    if (chartType.value !== detector.chartType.LINE) return null;

    void parentLayoutStableRunSequence.value;

    const chartDimensions = {
        height: defaultSizes.value.height,
        width: defaultSizes.value.width,
    };

    let _scaleLabelX = getScaleLabelX();

    if (timeLabelsEls.value) {
        const x = timeLabelsEls.value.getBBox().x;
        if (x < 0) {
            _scaleLabelX += Math.abs(x);
        }
    }

    const drawingArea = {
        left: _scaleLabelX + FINAL_CONFIG.value.xyPaddingLeft,
        top: FINAL_CONFIG.value.xyPaddingTop,
        right: chartDimensions.width - FINAL_CONFIG.value.xyPaddingRight,
        bottom:
            chartDimensions.height -
            FINAL_CONFIG.value.xyPaddingBottom -
            timeLabelsY.value,
        width: Math.max(
            10,
            chartDimensions.width -
                FINAL_CONFIG.value.xyPaddingLeft -
                FINAL_CONFIG.value.xyPaddingRight -
                _scaleLabelX,
        ),
        height: Math.max(
            10,
            chartDimensions.height -
                FINAL_CONFIG.value.xyPaddingTop -
                FINAL_CONFIG.value.xyPaddingBottom -
                timeLabelsY.value,
        ),
    };

    let ds = [];

    if (detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = [
            {
                values: formattedDataset.value.dataset.slice(
                    slicer.value.start,
                    slicer.value.end,
                ),
                absoluteValues: formattedDataset.value.dataset,
                absoluteIndices: formattedDataset.value.dataset
                    .map((d, i) => i)
                    .slice(slicer.value.start, slicer.value.end),
                name: FINAL_CONFIG.value.title,
                color:
                    customPalette.value[FINAL_CONFIG.value.paletteStartIndex] ||
                    palette[FINAL_CONFIG.value.paletteStartIndex],
                id: `line_0`,
            },
        ];
    }

    if (detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset
            .map((d, i) => {
                return {
                    ...d,
                    values:
                        d.VALUE ||
                        d.DATA ||
                        d.SERIE ||
                        d.SERIES ||
                        d.VALUES ||
                        d.NUM ||
                        0,
                    name:
                        d.NAME ||
                        d.DESCRIPTION ||
                        d.TITLE ||
                        d.LABEL ||
                        `Serie ${i}`,
                    id: `line_${i}`,
                };
            })
            .map((d, i) => {
                return {
                    ...d,
                    color: d.COLOR
                        ? convertColorToHex(d.COLOR)
                        : customPalette.value[
                              i + FINAL_CONFIG.value.paletteStartIndex
                          ] ||
                          palette[i + FINAL_CONFIG.value.paletteStartIndex] ||
                          palette[
                              (i + FINAL_CONFIG.value.paletteStartIndex) %
                                  palette.length
                          ],
                    values: d.values.slice(
                        slicer.value.start,
                        slicer.value.end,
                    ),
                    absoluteValues: d.values,
                    absoluteIndices: d.values
                        .map((d, i) => i)
                        .slice(slicer.value.start, slicer.value.end),
                };
            });
    }
    const extremes = {
        max: Math.max(
            ...ds
                .filter((d) => !segregated.value.includes(d.id))
                .flatMap((d) => d.values),
        ),
        min: Math.min(
            ...ds
                .filter((d) => !segregated.value.includes(d.id))
                .flatMap((d) => d.values),
        ),
        maxSeries: Math.max(...ds.map((d) => d.values.length)),
    };

    const scale =
        extremes.max === extremes.min
            ? calculateNiceScale(
                  Math.min(extremes.min, 0),
                  extremes.min === 0 ? 1 : Math.max(extremes.min, 0),
                  FINAL_CONFIG.value.xyScaleSegments,
              )
            : calculateNiceScale(
                  extremes.min < 0 ? extremes.min : 0,
                  extremes.max < 0 ? 0 : extremes.max,
                  FINAL_CONFIG.value.xyScaleSegments,
              );
    const absoluteMin = extremes.min < 0 ? Math.abs(extremes.min) : 0;
    const absoluteZero =
        extremes.max < 0
            ? drawingArea.top
            : drawingArea.bottom -
              (absoluteMin / (scale.max + absoluteMin)) * drawingArea.height;
    const slotSize = drawingArea.width / extremes.maxSeries;

    const yLabels = scale.ticks.map((t) => {
        return {
            y:
                drawingArea.bottom -
                drawingArea.height *
                    ((t + absoluteMin) / (scale.max + absoluteMin)),
            x: drawingArea.left - 8,
            value: t,
        };
    });

    const drawableDataset = ds
        .map((d, i) => {
            return {
                ...d,
                shape: 'circle',
                coordinates: d.values.map((v, j) => {
                    return {
                        x: drawingArea.left + slotSize * (j + 1) - slotSize / 2,
                        y:
                            drawingArea.bottom -
                            ((v + absoluteMin) / (scale.max + absoluteMin)) *
                                drawingArea.height,
                        value: v,
                    };
                }),
            };
        })
        .map((d) => {
            let path = [];
            d.coordinates.forEach((c) => {
                path.push(`${c.x},${c.y} `);
            });
            return {
                ...d,
                linePath: path.join(' '),
            };
        });

    function getMappedSeries(index) {
        return ds
            .map((d) => {
                return {
                    ...d,
                    value: d.values[index],
                    absoluteIndex: d.absoluteIndices[index],
                };
            })
            .filter((d) => !segregated.value.includes(d.id));
    }

    function useTooltip(index, triggerMode = 'pointer') {
        if (isChartZoomSelecting.value && triggerMode === 'pointer') return;

        selectedDatapoint.value = index;
        commonSelectedIndex.value = index;
        activeTooltipIndex.value = index;
        tooltipTriggerMode.value = triggerMode;

        const mappedSeries = getMappedSeries(index);

        dataTooltipSlot.value = {
            datapoint: mappedSeries,
            seriesIndex: index,
            config: FINAL_CONFIG.value,
            dataset: ds,
        };
        const customFormat = FINAL_CONFIG.value.tooltipCustomFormat;

        if (FINAL_CONFIG.value.events.datapointEnter) {
            FINAL_CONFIG.value.events.datapointEnter({
                datapoint: mappedSeries,
                seriesIndex: index + slicer.value.start,
            });
        }

        if (
            isFunction(customFormat) &&
            functionReturnsString(() =>
                customFormat({
                    datapoint: mappedSeries,
                    seriesIndex: index,
                    series: ds,
                    config: FINAL_CONFIG.value,
                }),
            )
        ) {
            tooltipContent.value = customFormat({
                datapoint: mappedSeries,
                seriesIndex: index,
                series: ds,
                config: FINAL_CONFIG.value,
            });
        } else {
            let html = '';

            if (timeLabels.value[mappedSeries[0].absoluteIndex]) {
                html += `<div style="border-bottom:1px solid ${FINAL_CONFIG.value.tooltipBorderColor};padding-bottom:6px;margin-bottom:3px;">${timeLabels.value[mappedSeries[0].absoluteIndex].text}</div>`;
            }

            mappedSeries.forEach((s, i) => {
                html += `
                    <div style="display:flex; flex-wrap: wrap; align-items:center; gap:3px;">
                        <svg viewBox="0 0 12 12" height="14" width="12"><circle cx="6" cy="6" r="6" stroke="none" fill="${s.color}"/></svg>
                        <span>${s.name}:</span>
                        <b>${applyDataLabel(
                            FINAL_CONFIG.value.formatter,
                            s.value,
                            dataLabel({
                                p: FINAL_CONFIG.value.valuePrefix,
                                v: s.value,
                                s: FINAL_CONFIG.value.valueSuffix,
                                r: FINAL_CONFIG.value.dataLabelRoundingValue,
                            }),
                            { datapoint: s, seriesIndex: i },
                        )}
                        </b>
                    </div>
                `;
            });
            tooltipContent.value = html;
        }
        isTooltip.value = true;
    }

    function killTooltip(index) {
        const datapoint = getMappedSeries(index);

        if (FINAL_CONFIG.value.events.datapointLeave) {
            FINAL_CONFIG.value.events.datapointLeave({
                datapoint,
                seriesIndex: index + slicer.value.start,
            });
        }

        selectedDatapoint.value = null;
        commonSelectedIndex.value = null;
        isTooltip.value = false;
        activeTooltipIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
    }

    function selectDatapoint(index) {
        const datapoint = getMappedSeries(index);
        if (FINAL_CONFIG.value.events.datapointClick) {
            FINAL_CONFIG.value.events.datapointClick({
                datapoint,
                seriesIndex: index + slicer.value.start,
            });
        }
        emit('selectDatapoint', datapoint);
    }

    return {
        absoluteZero,
        dataset: drawableDataset.filter(
            (el) => !segregated.value.includes(el.id),
        ),
        legend: drawableDataset,
        drawingArea,
        extremes,
        slotSize,
        yLabels,
        useTooltip,
        killTooltip,
        selectDatapoint,
    };
});

const bar = computed(() => {
    if (chartType.value !== detector.chartType.BAR) return null;

    void parentLayoutStableRunSequence.value;

    const chartDimensions = {
        height: defaultSizes.value.height,
        width: defaultSizes.value.width,
    };

    let _scaleLabelX = getScaleLabelX();

    if (timeLabelsEls.value) {
        const x = timeLabelsEls.value.getBBox().x;
        if (x < 0) {
            _scaleLabelX += Math.abs(x);
        }
    }

    const drawingArea = {
        left: _scaleLabelX + FINAL_CONFIG.value.xyPaddingLeft,
        top: FINAL_CONFIG.value.xyPaddingTop,
        right: chartDimensions.width - FINAL_CONFIG.value.xyPaddingRight,
        bottom:
            chartDimensions.height -
            FINAL_CONFIG.value.xyPaddingBottom -
            timeLabelsY.value,
        width: Math.max(
            10,
            chartDimensions.width -
                FINAL_CONFIG.value.xyPaddingLeft -
                FINAL_CONFIG.value.xyPaddingRight -
                _scaleLabelX,
        ),
        height: Math.max(
            10,
            chartDimensions.height -
                FINAL_CONFIG.value.xyPaddingTop -
                FINAL_CONFIG.value.xyPaddingBottom -
                timeLabelsY.value,
        ),
    };

    let ds = [];

    if (detector.isSimpleArrayOfNumbers(formattedDataset.value.dataset)) {
        ds = [
            {
                values: formattedDataset.value.dataset.slice(
                    slicer.value.start,
                    slicer.value.end,
                ),
                absoluteValues: formattedDataset.value.dataset,
                absoluteIndices: formattedDataset.value.dataset
                    .map((_, i) => i)
                    .slice(slicer.value.start, slicer.value.end),
                name: FINAL_CONFIG.value.title,
                color:
                    customPalette.value[FINAL_CONFIG.value.paletteStartIndex] ||
                    palette[FINAL_CONFIG.value.paletteStartIndex],
                id: 'bar_0',
            },
        ];
    }

    if (detector.isSimpleArrayOfObjects(formattedDataset.value.dataset)) {
        ds = formattedDataset.value.dataset
            .map((d, i) => {
                return {
                    ...d,
                    values:
                        d.VALUE ||
                        d.DATA ||
                        d.SERIE ||
                        d.SERIES ||
                        d.VALUES ||
                        d.NUM ||
                        0,
                    name:
                        d.NAME ||
                        d.DESCRIPTION ||
                        d.TITLE ||
                        d.LABEL ||
                        `Serie ${i}`,
                    id: `bar_${i}`,
                };
            })
            .map((d, i) => {
                return {
                    ...d,
                    color: d.COLOR
                        ? convertColorToHex(d.COLOR)
                        : customPalette.value[
                              i + FINAL_CONFIG.value.paletteStartIndex
                          ] ||
                          palette[i + FINAL_CONFIG.value.paletteStartIndex] ||
                          palette[
                              (i + FINAL_CONFIG.value.paletteStartIndex) %
                                  palette.length
                          ],
                    values: d.values.slice(
                        slicer.value.start,
                        slicer.value.end,
                    ),
                    absoluteValues: d.values,
                    absoluteIndices: d.values
                        .map((_, i) => i)
                        .slice(slicer.value.start, slicer.value.end),
                };
            });
    }

    const extremes = {
        max:
            Math.max(
                ...ds
                    .filter((d) => !segregated.value.includes(d.id))
                    .flatMap((d) => d.values),
            ) < 0
                ? 0
                : (Math.max(
                      ...ds
                          .filter((d) => !segregated.value.includes(d.id))
                          .flatMap((d) => d.values),
                  ) ?? 1),
        min:
            Math.min(
                ...ds
                    .filter((d) => !segregated.value.includes(d.id))
                    .flatMap((d) => d.values),
            ) ?? 0,
        maxSeries:
            Math.max(
                ...ds
                    .filter((d) => !segregated.value.includes(d.id))
                    .map((d) => d.values.length),
            ) ?? 0,
    };

    const scale =
        extremes.min === extremes.max
            ? calculateNiceScale(
                  Math.min(extremes.min, 0),
                  extremes.min === 0 ? 1 : Math.max(extremes.min, 0),
                  FINAL_CONFIG.value.xyScaleSegments,
              )
            : calculateNiceScale(
                  extremes.min < 0 ? extremes.min : 0,
                  extremes.max,
                  FINAL_CONFIG.value.xyScaleSegments,
              );
    const absoluteMin = scale.min < 0 ? Math.abs(scale.min) : 0;
    const absoluteZero =
        drawingArea.bottom -
        (absoluteMin / (scale.max + absoluteMin)) * drawingArea.height;
    const slotSize = drawingArea.width / extremes.maxSeries;

    const yLabels = scale.ticks.map((t) => {
        return {
            y:
                drawingArea.bottom -
                drawingArea.height *
                    ((t + absoluteMin) / (scale.max + absoluteMin)),
            x: drawingArea.left - 8,
            value: t,
        };
    });

    const legend = ds.map((d, i) => {
        return {
            ...d,
            shape: 'square',
            coordinates: d.values.map((v, j) => {
                const barHeight =
                    ((v + absoluteMin) / (extremes.max + absoluteMin)) *
                    drawingArea.height;
                const barHeightNegative =
                    (Math.abs(v) / Math.abs(extremes.min)) *
                    (drawingArea.height - absoluteZero);
                const absoluteMinHeight =
                    (absoluteMin / (extremes.max + absoluteMin)) *
                    drawingArea.height;
                const barWidth =
                    slotSize /
                        ds.filter((d) => !segregated.value.includes(d.id))
                            .length -
                    FINAL_CONFIG.value.barGap /
                        ds.filter((d) => !segregated.value.includes(d.id))
                            .length;

                return {
                    x:
                        drawingArea.left +
                        slotSize * j +
                        barWidth * i +
                        FINAL_CONFIG.value.barGap / 2,
                    y: v > 0 ? drawingArea.bottom - barHeight : absoluteZero,
                    height:
                        v > 0
                            ? barHeight - absoluteMinHeight
                            : barHeightNegative,
                    value: v,
                    width: barWidth,
                };
            }),
        };
    });

    const drawableDataset = ds
        .filter((d) => !segregated.value.includes(d.id))
        .map((d, i) => {
            return {
                ...d,
                coordinates: d.values.map((v, j) => {
                    const barHeight =
                        ((v + absoluteMin) / (extremes.max + absoluteMin)) *
                        drawingArea.height;
                    const barHeightNegative =
                        (Math.abs(v) / (extremes.max + absoluteMin)) *
                        drawingArea.height;
                    const absoluteMinHeight =
                        (absoluteMin / (extremes.max + absoluteMin)) *
                        drawingArea.height;
                    const barWidth =
                        slotSize /
                            ds.filter((d) => !segregated.value.includes(d.id))
                                .length -
                        FINAL_CONFIG.value.barGap /
                            ds.filter((d) => !segregated.value.includes(d.id))
                                .length;

                    return {
                        x:
                            drawingArea.left +
                            slotSize * j +
                            barWidth * i +
                            FINAL_CONFIG.value.barGap / 2,
                        y:
                            v > 0
                                ? drawingArea.bottom - barHeight
                                : absoluteZero,
                        height:
                            v > 0
                                ? barHeight - absoluteMinHeight
                                : barHeightNegative,
                        value: v,
                        width: barWidth,
                    };
                }),
            };
        });

    function getMappedSeries(index) {
        return ds
            .map((d) => {
                return {
                    ...d,
                    value: d.values[index],
                    absoluteIndex: d.absoluteIndices[index],
                };
            })
            .filter((d) => !segregated.value.includes(d.id));
    }

    function useTooltip(index, triggerMode = 'pointer') {
        if (isChartZoomSelecting.value && triggerMode === 'pointer') return;

        selectedDatapoint.value = index;
        commonSelectedIndex.value = index;
        activeTooltipIndex.value = index;
        tooltipTriggerMode.value = triggerMode;

        const mappedSeries = getMappedSeries(index);

        dataTooltipSlot.value = {
            datapoint: mappedSeries,
            seriesIndex: index,
            config: FINAL_CONFIG.value,
            dataset: ds,
        };
        const customFormat = FINAL_CONFIG.value.tooltipCustomFormat;

        if (FINAL_CONFIG.value.events.datapointEnter) {
            FINAL_CONFIG.value.events.datapointEnter({
                datapoint: mappedSeries,
                seriesIndex: index + slicer.value.start,
            });
        }

        if (
            isFunction(customFormat) &&
            functionReturnsString(() =>
                customFormat({
                    datapoint: mappedSeries,
                    seriesIndex: index,
                    series: ds,
                    config: FINAL_CONFIG.value,
                }),
            )
        ) {
            tooltipContent.value = customFormat({
                point: mappedSeries,
                seriesIndex: index,
                series: ds,
                config: FINAL_CONFIG.value,
            });
        } else {
            let html = '';

            if (timeLabels.value[mappedSeries[0].absoluteIndex]) {
                html += `<div style="border-bottom:1px solid ${FINAL_CONFIG.value.tooltipBorderColor};padding-bottom:6px;margin-bottom:3px;">${timeLabels.value[mappedSeries[0].absoluteIndex].text}</div>`;
            }

            mappedSeries.forEach((s, i) => {
                html += `
                    <div style="display:flex; flex-wrap: wrap; align-items:center; gap:3px;">
                        <svg viewBox="0 0 12 12" height="14" width="12"><rect x=0 y="0" width="12" height="12" rx="1" stroke="none" fill="${s.color}"/></svg>
                        <span>${s.name}:</span>
                        <b>${applyDataLabel(
                            FINAL_CONFIG.value.formatter,
                            s.value,
                            dataLabel({
                                p: FINAL_CONFIG.value.valuePrefix,
                                v: s.value,
                                s: FINAL_CONFIG.value.valueSuffix,
                                r: FINAL_CONFIG.value.dataLabelRoundingValue,
                            }),
                            { datapoint: s, seriesIndex: i },
                        )}
                        </b>
                    </div>
                `;
            });
            tooltipContent.value = html;
        }
        isTooltip.value = true;
    }

    function killTooltip(index) {
        const datapoint = getMappedSeries(index);

        if (FINAL_CONFIG.value.events.datapointLeave) {
            FINAL_CONFIG.value.events.datapointLeave({
                datapoint,
                seriesIndex: index + slicer.value.start,
            });
        }

        isTooltip.value = false;
        selectedDatapoint.value = null;
        commonSelectedIndex.value = null;
        activeTooltipIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
    }

    function selectDatapoint(index) {
        const datapoint = getMappedSeries(index);
        if (FINAL_CONFIG.value.events.datapointClick) {
            FINAL_CONFIG.value.events.datapointClick({
                datapoint,
                seriesIndex: index + slicer.value.start,
            });
        }
        emit('selectDatapoint', datapoint);
    }

    return {
        absoluteZero,
        dataset: drawableDataset.filter(
            (d) => !segregated.value.includes(d.id),
        ),
        absoluteDataset: drawableDataset,
        legend,
        drawingArea,
        extremes,
        slotSize,
        yLabels,
        useTooltip,
        killTooltip,
        selectDatapoint,
    };
});

const slicerDrawingArea = computed(() => {
    if (chartType.value === detector.chartType.LINE) {
        return line.value?.drawingArea ?? null;
    }

    if (chartType.value === detector.chartType.BAR) {
        return bar.value?.drawingArea ?? null;
    }

    return null;
});

const activeChartZoomSlotSize = computed(() => {
    if (chartType.value === detector.chartType.LINE) {
        return Number(line.value?.slotSize ?? 0);
    }

    if (chartType.value === detector.chartType.BAR) {
        return Number(bar.value?.slotSize ?? 0);
    }

    return 0;
});

const activeChartZoomVisibleCount = computed(() => {
    if (chartType.value === detector.chartType.LINE) {
        return Number(line.value?.extremes?.maxSeries ?? 0);
    }

    if (chartType.value === detector.chartType.BAR) {
        return Number(bar.value?.extremes?.maxSeries ?? 0);
    }

    return 0;
});

const chartZoomSelectionRect = computed(() => {
    const drawingArea = slicerDrawingArea.value;

    if (
        !drawingArea ||
        !isChartZoomSelecting.value ||
        chartZoomStartX.value == null ||
        chartZoomCurrentX.value == null
    ) {
        return null;
    }

    return {
        x: Math.min(chartZoomStartX.value, chartZoomCurrentX.value),
        y: drawingArea.top,
        width: Math.abs(chartZoomCurrentX.value - chartZoomStartX.value),
        height: drawingArea.height,
    };
});

const isChartZoomed = computed(() => {
    if (!slicerReady.value || !isZoomableChart.value) return false;

    return (
        Number(slicer.value.start) !== 0 ||
        Number(slicer.value.end) !== Number(getSlicerMax())
    );
});

function clientToSvgCoords(event) {
    const svgEl = svgRef.value;
    if (!svgEl) return null;

    if (svgEl.createSVGPoint && svgEl.getScreenCTM) {
        const point = svgEl.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;

        const ctm = svgEl.getScreenCTM();

        if (ctm) {
            const transformed = point.matrixTransform(ctm.inverse());

            return {
                x: transformed.x,
                y: transformed.y,
            };
        }
    }

    const rect = svgEl.getBoundingClientRect();
    const viewBoxValue = svgEl.viewBox?.baseVal || {
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
    };

    const scale = Math.min(
        rect.width / viewBoxValue.width,
        rect.height / viewBoxValue.height,
    );

    if (!Number.isFinite(scale) || scale <= 0) return null;

    const drawnWidth = viewBoxValue.width * scale;
    const drawnHeight = viewBoxValue.height * scale;
    const offsetX = (rect.width - drawnWidth) / 2;
    const offsetY = (rect.height - drawnHeight) / 2;

    return {
        x: (event.clientX - rect.left - offsetX) / scale + viewBoxValue.x,
        y: (event.clientY - rect.top - offsetY) / scale + viewBoxValue.y,
    };
}

function clampChartZoomX(x) {
    const drawingArea = slicerDrawingArea.value;
    if (!drawingArea) return x;

    return Math.min(Math.max(x, drawingArea.left), drawingArea.right);
}

function clearChartZoomHover() {
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    selectedDatapoint.value = null;
    commonSelectedIndex.value = null;
}

function cancelChartZoomSelection(event) {
    const pointerId =
        event?.pointerId != null ? event.pointerId : chartZoomPointerId.value;

    if (pointerId != null && svgRef.value?.hasPointerCapture?.(pointerId)) {
        svgRef.value.releasePointerCapture(pointerId);
    }

    isChartZoomSelecting.value = false;
    chartZoomStartX.value = null;
    chartZoomCurrentX.value = null;
    chartZoomPointerId.value = null;
}

function suppressNextChartClick() {
    ignoreNextChartClick.value = true;

    setTimeout(() => {
        ignoreNextChartClick.value = false;
    }, 0);
}

function onChartZoomClickCapture(event) {
    if (!ignoreNextChartClick.value) return;

    ignoreNextChartClick.value = false;
    event.preventDefault();
    event.stopPropagation();
}

function resetChartZoomFromDoubleTap(event) {
    if (!isChartZoomEnabled.value || !isChartZoomed.value || !event) {
        return false;
    }

    const now = Date.now();
    const pointerType = event.pointerType || 'mouse';
    const last = lastChartZoomTap.value;
    const maxDelay = pointerType === 'touch' ? 450 : 350;
    const maxDistance = pointerType === 'touch' ? 28 : 10;

    const distance = Math.hypot(event.clientX - last.x, event.clientY - last.y);

    const isDoubleTap =
        last.time > 0 &&
        last.pointerType === pointerType &&
        now - last.time <= maxDelay &&
        distance <= maxDistance;

    if (!isDoubleTap) {
        lastChartZoomTap.value = {
            time: now,
            x: event.clientX,
            y: event.clientY,
            pointerType,
        };

        return false;
    }

    lastChartZoomTap.value = {
        time: 0,
        x: 0,
        y: 0,
        pointerType: null,
    };

    suppressNextChartClick();
    cancelChartZoomSelection(event);
    clearChartZoomHover();

    void refreshSlicer({
        applyControlledZoom: false,
        publish: true,
    });

    return true;
}

function getChartZoomLocalIndex(svgX) {
    const drawingArea = slicerDrawingArea.value;
    const slotSize = activeChartZoomSlotSize.value;
    const visibleCount = activeChartZoomVisibleCount.value;

    if (
        !drawingArea ||
        visibleCount <= 0 ||
        !Number.isFinite(slotSize) ||
        slotSize <= 0
    ) {
        return null;
    }

    const rawIndex = Math.floor(
        (clampChartZoomX(svgX) - drawingArea.left) / slotSize,
    );

    return Math.max(0, Math.min(visibleCount - 1, rawIndex));
}

function getChartZoomStateFromSelection(left, right) {
    const localStart = getChartZoomLocalIndex(left);
    const localEnd = getChartZoomLocalIndex(right);

    if (localStart == null || localEnd == null) return null;

    const first = Math.min(localStart, localEnd);
    const last = Math.max(localStart, localEnd);

    if (last <= first) return null;

    return {
        start: Number(slicer.value.start) + first,
        end: Number(slicer.value.start) + last + 1,
    };
}

function commitChartZoom(state) {
    const applied = setZoomState(state);
    if (!applied) return null;

    emit('zoomStart', {
        index: applied.start,
        isZoom: applied.start !== 0,
    });

    emit('zoomEnd', {
        index: applied.end,
        isZoom: applied.end !== getSlicerMax(),
    });

    return applied;
}

function onChartZoomPointerDown(event) {
    if (!isChartZoomEnabled.value || isAnnotator.value) return;
    if (event.button !== undefined && event.button !== 0) return;

    if (
        chartZoomPointerId.value != null &&
        event.pointerId !== chartZoomPointerId.value
    ) {
        return;
    }

    const drawingArea = slicerDrawingArea.value;
    const point = clientToSvgCoords(event);

    if (!drawingArea || !point) return;

    if (
        point.x < drawingArea.left ||
        point.x > drawingArea.right ||
        point.y < drawingArea.top ||
        point.y > drawingArea.bottom
    ) {
        return;
    }

    if (activeChartZoomVisibleCount.value <= 1) return;

    isChartZoomPointerFocused.value = true;
    svgRef.value?.focus?.({ preventScroll: true });
    clearChartZoomHover();

    const x = clampChartZoomX(point.x);

    chartZoomPointerId.value = event.pointerId;
    isChartZoomSelecting.value = true;
    chartZoomStartX.value = x;
    chartZoomCurrentX.value = x;
}

function onChartZoomPointerMove(event) {
    if (!isChartZoomEnabled.value || !isChartZoomSelecting.value) {
        return;
    }

    if (
        chartZoomPointerId.value != null &&
        event.pointerId !== chartZoomPointerId.value
    ) {
        return;
    }

    const point = clientToSvgCoords(event);
    if (!point) return;

    chartZoomCurrentX.value = clampChartZoomX(point.x);
    clearChartZoomHover();

    if (
        chartZoomStartX.value != null &&
        Math.abs(chartZoomCurrentX.value - chartZoomStartX.value) >= 2 &&
        !svgRef.value?.hasPointerCapture?.(event.pointerId)
    ) {
        svgRef.value?.setPointerCapture?.(event.pointerId);
    }
}

function onChartZoomPointerUp(event) {
    if (!isChartZoomEnabled.value || !isChartZoomSelecting.value) {
        return;
    }

    if (
        chartZoomPointerId.value != null &&
        event.pointerId !== chartZoomPointerId.value
    ) {
        return;
    }

    const point = clientToSvgCoords(event);

    if (point) {
        chartZoomCurrentX.value = clampChartZoomX(point.x);
    }

    const startX = chartZoomStartX.value;
    const endX = chartZoomCurrentX.value;
    const drawingArea = slicerDrawingArea.value;

    const selectionWidth =
        startX == null || endX == null ? 0 : Math.abs(endX - startX);

    const minimumSelectionWidth = Math.max(
        4,
        Number(drawingArea?.width ?? 0) * 0.01,
    );

    if (selectionWidth < minimumSelectionWidth) {
        if (resetChartZoomFromDoubleTap(event)) return;

        cancelChartZoomSelection(event);
        return;
    }

    const left = Math.min(startX, endX);
    const right = Math.max(startX, endX);

    const nextZoomState = getChartZoomStateFromSelection(left, right);

    if (!nextZoomState) {
        cancelChartZoomSelection(event);
        return;
    }

    cancelChartZoomSelection(event);

    const applied = commitChartZoom(nextZoomState);

    if (applied) {
        lastChartZoomTap.value = {
            time: 0,
            x: 0,
            y: 0,
            pointerType: null,
        };

        clearChartZoomHover();
        suppressNextChartClick();
    }
}

const slicerMinimapLeftInsetRatio = computed(() => {
    const drawingArea = slicerDrawingArea.value;
    const svgWidth = defaultSizes.value.width;

    if (!drawingArea || svgWidth <= 0 || !FINAL_CONFIG.value.zoomXyAutoFit)
        return null;
    return drawingArea.left / svgWidth;
});

const slicerMinimapRightInsetRatio = computed(() => {
    const drawingArea = slicerDrawingArea.value;
    const svgWidth = defaultSizes.value.width;

    if (!drawingArea || svgWidth <= 0 || !FINAL_CONFIG.value.zoomXyAutoFit)
        return null;
    return (svgWidth - drawingArea.right) / svgWidth;
});

function primePath(p) {
    if (!p) return;
    const len = p.getTotalLength();
    p.style.transition = 'none';
    p.style.strokeDasharray = `${len}`;
    p.style.strokeDashoffset = `${len}`;
}

function primeRevealables(els, { fromOpacity = '0', fromScale = '0.85' } = {}) {
    els.forEach((el) => {
        el.style.animation = 'none';
        el.style.transition = 'none';
        el.style.opacity = fromOpacity;
        el.style.transform = `scale(${fromScale})`;
        el.style.transformBox = 'fill-box';
        el.style.transformOrigin = '50% 50%';
    });
}

function getXFromCircle(el) {
    return el.cx?.baseVal?.value ?? parseFloat(el.getAttribute('cx'));
}
function getXFromText(el) {
    const xAttr = el.getAttribute('x');
    if (xAttr != null) return parseFloat(xAttr);
    const ctm = el.getCTM?.();
    return ctm ? ctm.e : 0;
}

function bucketByXTolerance(elems, getX) {
    if (!elems.length) return [];
    const withX = elems
        .map((el) => ({ el, x: getX(el) }))
        .filter((o) => Number.isFinite(o.x));
    withX.sort((a, b) => a.x - b.x);

    let minGap = Infinity;
    for (let i = 1; i < withX.length; i++) {
        const d = withX[i].x - withX[i - 1].x;
        if (d > 0 && d < minGap) minGap = d;
    }
    const tol = (minGap === Infinity ? 1 : minGap) / 2;

    const buckets = [];
    let current = { x: withX[0].x, items: [withX[0].el] };
    for (let i = 1; i < withX.length; i++) {
        const { x, el } = withX[i];
        if (Math.abs(x - current.x) <= tol) {
            current.items.push(el);
        } else {
            buckets.push(current);
            current = { x, items: [el] };
        }
    }
    buckets.push(current);
    return buckets;
}

const allMinimaps = computed(() => {
    if (chartType.value === detector.chartType.LINE) {
        return line.value.legend.map((ds) => {
            const _min = Math.min(...ds.absoluteValues.map((v) => v ?? 0));
            return {
                ...ds,
                isVisible: !segregated.value.includes(ds.id),
                type: 'line',
                series: ds.absoluteValues,
            };
        });
    } else if (chartType.value === detector.chartType.BAR) {
        return bar.value.legend.map((ds) => {
            const _min = Math.min(...ds.absoluteValues.map((v) => v ?? 0));
            return {
                ...ds,
                isVisible: !segregated.value.includes(ds.id),
                type: 'bar',
                series: ds.absoluteValues,
            };
        });
    }
});

const timeLabels = ref([]);

let timeLabelsRequestId = 0;
watchEffect(() => {
    const requestId = ++timeLabelsRequestId;

    (async () => {
        const labels = await useTimeLabels({
            values: FINAL_CONFIG.value.xyPeriods,
            maxDatapoints: formattedDataset.value.maxSeriesLength,
            formatter: FINAL_CONFIG.value.datetimeFormatter,
            start: slicer.value.start,
            end: slicer.value.end,
        });

        if (requestId === timeLabelsRequestId) {
            timeLabels.value = labels;
        }
    })();
});

const modulo = computed(() => {
    const m = FINAL_CONFIG.value.xyPeriodsModulo;
    if (!FINAL_CONFIG.value.xyPeriods.length) return m;
    return Math.min(
        m,
        [...new Set(timeLabels.value.map((t) => t.text))].length,
    );
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2 } = {}) {
    if (!quickChart.value) return;
    const { width, height } = quickChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: quickChart.value,
        base64: true,
        img: true,
        scale,
    });
    return {
        imageUri,
        base64,
        title: FINAL_CONFIG.value.title,
        width,
        height,
        aspectRatio,
    };
}

const WIDTH = computed(() => defaultSizes.value.width);
const HEIGHT = computed(() => defaultSizes.value.height);

useTimeLabelCollision({
    timeLabelsEls,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['xyPeriodLabelsRotation'],
    autoRotatePath: ['xyPeriodLabelsAutoRotate', 'enable'],
    isAutoSize: false,
    rotation: FINAL_CONFIG.value.xyPeriodLabelsAutoRotate.angle,
    height: HEIGHT.value,
    width: WIDTH.value,
});

const svgBg = computed(() => FINAL_CONFIG.value.backgroundColor);

const svgLegendItems = computed(() => {
    if (chartType.value === detector.chartType.DONUT) {
        return donut.value.legend;
    } else if (chartType.value === detector.chartType.LINE) {
        return line.value.legend;
    } else {
        return bar.value.legend;
    }
});

const svgLegend = computed(() => {
    return {
        show: FINAL_CONFIG.value.showLegend,
        bold: false,
        backgroundColor: FINAL_CONFIG.value.backgroundColor,
        color: FINAL_CONFIG.value.color,
        fontSize: FINAL_CONFIG.value.legendFontSize,
        position: FINAL_CONFIG.value.legendPosition,
    };
});

const svgTitle = computed(() => ({
    text: FINAL_CONFIG.value.title,
    color: FINAL_CONFIG.value.color,
    fontSize: FINAL_CONFIG.value.titleFontSize,
    bold: FINAL_CONFIG.value.titleBold,
    textAlign: FINAL_CONFIG.value.titleTextAlign,
    subtitle: {
        text: '',
    },
}));

const { generateSvg, onGenerateImage } = useChartExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: svgLegendItems,
    backgroundColor: svgBg,
    getSvgCallback: () => FINAL_CONFIG.value.userOptionsCallbacks.svg,
    generateImage,
});

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: {
            line: line.value,
            bar: bar.value,
            donut: donut.value,
        },
    });
    if (!FINAL_CONFIG.value.userOptionsCallbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.userOptionsCallbacks.altCopy({
            config: FINAL_CONFIG.value,
            dataset: {
                line: line.value,
                bar: bar.value,
                donut: donut.value,
            },
        }),
    );
}

function handleLegendKeydown(event, callback) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        callback();
    }
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
const currentNavigationCount = computed(() => {
    if (chartType.value === detector.chartType.DONUT) {
        return donut.value?.chart?.length ?? 0;
    }

    if (chartType.value === detector.chartType.LINE) {
        return line.value?.extremes?.maxSeries ?? 0;
    }

    if (chartType.value === detector.chartType.BAR) {
        return bar.value?.extremes?.maxSeries ?? 0;
    }

    return 0;
});

function onSvgFocus() {
    activeTooltipIndex.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    isChartZoomPointerFocused.value = false;
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    selectedDatapoint.value = null;
    commonSelectedIndex.value = null;
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;

    isChartZoomPointerFocused.value = false;
    if (!currentNavigationCount.value) return;

    const isPreviousKey = event.key === 'ArrowLeft';
    const isNextKey = event.key === 'ArrowRight';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        if (
            isChartZoomEnabled.value &&
            (isChartZoomed.value || isChartZoomSelecting.value)
        ) {
            cancelChartZoomSelection();
            clearChartZoomHover();

            void refreshSlicer({
                applyControlledZoom: false,
                publish: true,
            });

            return;
        }

        activeTooltipIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
        isTooltip.value = false;
        selectedDatapoint.value = null;
        commonSelectedIndex.value = null;
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;

        if (chartType.value === detector.chartType.DONUT) {
            const arc = donut.value?.chart?.[activeTooltipIndex.value];
            if (!arc) return;
            donut.value.selectDatapoint({
                datapoint: arc,
                seriesIndex: activeTooltipIndex.value,
            });
            return;
        }

        if (chartType.value === detector.chartType.LINE) {
            line.value?.selectDatapoint(activeTooltipIndex.value);
            return;
        }

        if (chartType.value === detector.chartType.BAR) {
            bar.value?.selectDatapoint(activeTooltipIndex.value);
            return;
        }

        return;
    }

    let nextIndex = activeTooltipIndex.value;
    const hoveredIndex = commonSelectedIndex.value;

    const hasValidActiveIndex =
        nextIndex !== null &&
        nextIndex >= 0 &&
        nextIndex < currentNavigationCount.value;

    const hasValidHoveredIndex =
        hoveredIndex !== null &&
        hoveredIndex >= 0 &&
        hoveredIndex < currentNavigationCount.value;

    if (!hasValidActiveIndex) {
        if (hasValidHoveredIndex) {
            nextIndex = isNextKey ? hoveredIndex + 1 : hoveredIndex - 1;

            if (nextIndex >= currentNavigationCount.value) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = currentNavigationCount.value - 1;
            }
        } else if (isNextKey) {
            nextIndex = 0;
        } else {
            nextIndex = currentNavigationCount.value - 1;
        }
    } else if (isNextKey) {
        nextIndex += 1;
        if (nextIndex >= currentNavigationCount.value) {
            nextIndex = 0;
        }
    } else if (isPreviousKey) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = currentNavigationCount.value - 1;
        }
    }

    if (chartType.value === detector.chartType.DONUT) {
        const arc = donut.value?.chart?.[nextIndex];
        if (!arc) return;

        setKeyboardTooltipPosition(nextIndex);
        donut.value.useTooltip({
            datapoint: arc,
            seriesIndex: nextIndex,
            triggerMode: 'keyboard',
        });
        return;
    }

    if (chartType.value === detector.chartType.LINE) {
        setKeyboardTooltipPosition(nextIndex);
        line.value?.useTooltip(nextIndex, 'keyboard');
        return;
    }

    if (chartType.value === detector.chartType.BAR) {
        setKeyboardTooltipPosition(nextIndex);
        bar.value?.useTooltip(nextIndex, 'keyboard');
    }
}

function setKeyboardTooltipPosition(index) {
    if (!Number.isFinite(index)) return;
    if (!svgRef.value) return;

    let svgX = 0;
    let svgY = 0;

    if (chartType.value === detector.chartType.DONUT) {
        const arc = donut.value?.chart?.[index];
        if (!arc) return;

        svgX = calcMarkerOffsetX(arc, true).x;
        svgY = calcMarkerOffsetY(arc);
    }

    if (chartType.value === detector.chartType.LINE) {
        const drawingArea = line.value?.drawingArea;
        const slotSize = line.value?.slotSize;

        if (!drawingArea || !slotSize) return;

        svgX = drawingArea.left + slotSize * (index + 1) - slotSize / 2;
        svgY = drawingArea.top + drawingArea.height / 2;
    }

    if (chartType.value === detector.chartType.BAR) {
        const drawingArea = bar.value?.drawingArea;
        const slotSize = bar.value?.slotSize;

        if (!drawingArea || !slotSize) return;

        svgX = drawingArea.left + slotSize * (index + 1) - slotSize / 2;
        svgY = drawingArea.top + drawingArea.height / 2;
    }

    const box = svgRef.value.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x: box.left + (svgX / defaultSizes.value.width) * box.width,
        y: box.top + (svgY / defaultSizes.value.height) * box.height,
    };
}

const a11yTable = computed(() => {
    if (chartType.value === detector.chartType.DONUT) {
        const rows = (donut.value?.dataset ?? []).map((item) => {
            const percentage = donut.value?.total
                ? dataLabel({
                      v: (item.value / donut.value.total) * 100,
                      s: '%',
                      r: FINAL_CONFIG.value.dataLabelRoundingPercentage,
                  })
                : '0%';

            return [
                item.name,
                applyDataLabel(
                    FINAL_CONFIG.value.formatter,
                    item.value,
                    dataLabel({
                        p: FINAL_CONFIG.value.valuePrefix,
                        v: item.value,
                        s: FINAL_CONFIG.value.valueSuffix,
                        r: FINAL_CONFIG.value.dataLabelRoundingValue,
                    }),
                ),
                percentage,
            ];
        });

        return {
            headers: ['Series', 'Value', 'Percentage'],
            rows,
        };
    }

    if (
        chartType.value === detector.chartType.LINE ||
        chartType.value === detector.chartType.BAR
    ) {
        const series =
            chartType.value === detector.chartType.LINE
                ? (line.value?.dataset ?? [])
                : (bar.value?.dataset ?? []);

        const maxSeries =
            chartType.value === detector.chartType.LINE
                ? (line.value?.extremes?.maxSeries ?? 0)
                : (bar.value?.extremes?.maxSeries ?? 0);

        const headers = ['Index', ...series.map((serie) => serie.name)];

        const rows = Array.from({ length: maxSeries }, (_, i) => {
            const label =
                timeLabels.value?.[i + slicer.value.start]?.text ??
                String(i + slicer.value.start);

            return [
                label,
                ...series.map((serie) => {
                    const rawValue = serie.values?.[i];
                    return applyDataLabel(
                        FINAL_CONFIG.value.formatter,
                        rawValue,
                        dataLabel({
                            p: FINAL_CONFIG.value.valuePrefix,
                            v: rawValue,
                            s: FINAL_CONFIG.value.valueSuffix,
                            r: FINAL_CONFIG.value.dataLabelRoundingValue,
                        }),
                    );
                }),
            ];
        });

        return { headers, rows };
    }

    return {
        headers: [],
        rows: [],
    };
});

defineExpose({
    getImage,
    generatePdf,
    generateImage,
    generateSvg,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
    resetZoom: () =>
        refreshSlicer({
            applyControlledZoom: false,
            publish: true,
        }),
    setZoomState,
});
</script>

<template>
    <div
        v-if="isProcessable"
        :id="`${chartType}_${uid}`"
        ref="quickChart"
        :class="{
            'vue-data-ui-component': true,
            'vue-ui-quick-chart': true,
            'vue-data-ui-wrapper-fullscreen': isFullscreen,
        }"
        :style="`background:${FINAL_CONFIG.backgroundColor};color:${FINAL_CONFIG.color};font-family:${FINAL_CONFIG.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="a11yTable.rows.length"
            :uid="uid"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptionsButtons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.backgroundColor"
            :color="FINAL_CONFIG.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="FINAL_CONFIG.annotatorPalette"
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

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="
                FINAL_CONFIG.showUserOptions &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="FINAL_CONFIG.backgroundColor"
            :color="FINAL_CONFIG.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="
                FINAL_CONFIG.userOptionsButtons.tooltip &&
                FINAL_CONFIG.showTooltip
            "
            :hasPdf="FINAL_CONFIG.userOptionsButtons.pdf"
            :hasImg="FINAL_CONFIG.userOptionsButtons.img"
            :hasSvg="FINAL_CONFIG.userOptionsButtons.svg"
            :hasFullscreen="FINAL_CONFIG.userOptionsButtons.fullscreen"
            :hasAltCopy="FINAL_CONFIG.userOptionsButtons.altCopy"
            :hasXls="false"
            :isTooltip="mutableConfig.showTooltip"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptionsButtonTitles }"
            :chartElement="quickChart"
            :position="FINAL_CONFIG.userOptionsPosition"
            :hasAnnotator="FINAL_CONFIG.userOptionsButtons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptionsCallbacks"
            :printScale="FINAL_CONFIG.userOptionsPrint.scale"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            @copyAlt="copyAlt"
            :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip" />
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template
                v-if="$slots.optionFullscreen"
                template
                #optionFullscreen="{ toggleFullscreen, isFullscreen }"
            >
                <slot
                    name="optionFullscreen"
                    v-bind="{ toggleFullscreen, isFullscreen }"
                />
            </template>
            <template
                v-if="$slots.optionAnnotator"
                #optionAnnotator="{ toggleAnnotator, isAnnotator }"
            >
                <slot
                    name="optionAnnotator"
                    v-bind="{ toggleAnnotator, isAnnotator }"
                />
            </template>
            <template
                v-if="$slots.optionAltCopy"
                #optionAltCopy="{ altCopy: c }"
            >
                <slot name="optionAltCopy" v-bind="{ altCopy: c }" />
            </template>
            <template #custom-menu-before v-if="$slots['custom-menu-before']">
                <slot name="custom-menu-before" />
            </template>
            <template #custom-menu-after v-if="$slots['custom-menu-after']">
                <slot name="custom-menu-after" />
            </template>
        </UserOptions>

        <div
            ref="quickChartTitle"
            class="vue-ui-quick-chart-title"
            v-if="FINAL_CONFIG.title"
            :style="`background:transparent;color:${FINAL_CONFIG.color};font-size:${FINAL_CONFIG.titleFontSize}px;font-weight:${FINAL_CONFIG.titleBold ? 'bold' : 'normal'};text-align:${FINAL_CONFIG.titleTextAlign}`"
        >
            {{ FINAL_CONFIG.title }}
        </div>

        <div :id="`legend-top-${uid}`" />

        <div style="position: relative">
            <svg
                ref="svgRef"
                v-if="chartType"
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :viewBox="viewBox"
                :style="{
                    maxWidth: '100%',
                    overflow: 'visible',
                    background: 'transparent',
                    color: FINAL_CONFIG.color,
                    cursor: !isChartZoomEnabled
                        ? undefined
                        : isChartZoomSelecting
                          ? 'col-resize'
                          : 'crosshair',
                    touchAction: isChartZoomEnabled ? 'pan-y' : undefined,
                    userSelect: isChartZoomEnabled ? 'none' : undefined,
                }"
                :class="{
                    'vue-data-ui-no-transition': !transitionEnabled,
                    'vue-ui-quick-chart-zoom-pointer-focus':
                        isChartZoomEnabled && isChartZoomPointerFocused,
                }"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
                @pointerdown="onChartZoomPointerDown"
                @pointermove="onChartZoomPointerMove"
                @pointerup="onChartZoomPointerUp"
                @pointercancel="cancelChartZoomSelection"
                @click.capture="onChartZoomClickCapture"
            >
                <PackageVersion />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="
                        $slots['chart-background'] &&
                        chartType === detector.chartType.BAR
                    "
                    :x="bar.drawingArea.left"
                    :y="bar.drawingArea.top"
                    :width="bar.drawingArea.width"
                    :height="bar.drawingArea.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>
                <foreignObject
                    v-if="
                        $slots['chart-background'] &&
                        chartType === detector.chartType.LINE
                    "
                    :x="line.drawingArea.left"
                    :y="line.drawingArea.top"
                    :width="line.drawingArea.width"
                    :height="line.drawingArea.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>
                <foreignObject
                    v-if="
                        $slots['chart-background'] &&
                        chartType === detector.chartType.DONUT
                    "
                    :x="0"
                    :y="0"
                    :width="defaultSizes.width"
                    :height="defaultSizes.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <defs>
                    <filter
                        :id="`blur_${uid}`"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feGaussianBlur
                            in="SourceGraphic"
                            :stdDeviation="2"
                            :id="`blur_std_${uid}`"
                        />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>

                    <filter
                        :id="`shadow_${uid}`"
                        color-interpolation-filters="sRGB"
                    >
                        <feDropShadow
                            dx="0"
                            dy="0"
                            stdDeviation="10"
                            flood-opacity="0.5"
                            :flood-color="FINAL_CONFIG.donutShadowColor"
                        />
                    </filter>
                </defs>

                <template v-if="chartType === detector.chartType.DONUT">
                    <g
                        class="donut-label-connectors"
                        v-if="FINAL_CONFIG.showDataLabels"
                    >
                        <template v-for="(arc, i) in donut.chart">
                            <path
                                data-cy="datapoint-donut-markers"
                                v-if="donut.isArcBigEnough(arc)"
                                :d="
                                    calcNutArrowPath(
                                        arc,
                                        {
                                            x: defaultSizes.width / 2,
                                            y: defaultSizes.height / 2,
                                        },
                                        16,
                                        16,
                                        false,
                                        false,
                                        defaultSizes.height *
                                            optimalDonutThickness,
                                        12,
                                        FINAL_CONFIG.donutCurvedMarkers,
                                    )
                                "
                                :stroke="arc.color"
                                :stroke-width="
                                    FINAL_CONFIG.donutLabelMarkerStrokeWidth
                                "
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                fill="none"
                                :filter="getBlurFilter(arc.id)"
                            />
                        </template>
                    </g>

                    <circle
                        :cx="donut.cx"
                        :cy="donut.cy"
                        :r="donut.radius"
                        :fill="FINAL_CONFIG.backgroundColor"
                        :filter="
                            FINAL_CONFIG.donutUseShadow
                                ? `url(#shadow_${uid})`
                                : ''
                        "
                    />

                    <g class="donut">
                        <path
                            data-cy="datapoint-donut-arc"
                            v-for="(arc, i) in donut.chart"
                            :d="arc.arcSlice"
                            :fill="arc.color"
                            :stroke="
                                FINAL_CONFIG.donutStroke ||
                                FINAL_CONFIG.backgroundColor
                            "
                            :stroke-width="FINAL_CONFIG.donutStrokeWidth"
                            :filter="getBlurFilter(arc.id)"
                        />
                        <path
                            data-cy="tooltip-trap-donut"
                            v-for="(arc, i) in donut.chart"
                            :d="arc.arcSlice"
                            fill="transparent"
                            @mouseenter="
                                donut.useTooltip({
                                    datapoint: arc,
                                    seriesIndex: i,
                                    triggerMode: 'pointer',
                                })
                            "
                            @mouseout="
                                donut.killTooltip({
                                    datapoint: arc,
                                    seriesIndex: i,
                                })
                            "
                            @click="
                                donut.selectDatapoint({
                                    datapoint: arc,
                                    seriesIndex: i,
                                })
                            "
                        />
                    </g>
                    <g class="donut-labels" v-if="FINAL_CONFIG.showDataLabels">
                        <template v-for="(arc, i) in donut.chart">
                            <circle
                                data-cy="datapoint-donut-marker-circle"
                                v-if="donut.isArcBigEnough(arc)"
                                :cx="calcMarkerOffsetX(arc).x"
                                :cy="calcMarkerOffsetY(arc) - 3.7"
                                :fill="arc.color"
                                :stroke="FINAL_CONFIG.backgroundColor"
                                :stroke-width="1"
                                :r="3"
                                :filter="getBlurFilter(arc.id)"
                            />
                            <text
                                data-cy="datapoint-donut-label-value"
                                v-if="donut.isArcBigEnough(arc)"
                                :text-anchor="
                                    calcMarkerOffsetX(arc, true, 20).anchor
                                "
                                :x="calcMarkerOffsetX(arc, true).x"
                                :y="calcMarkerOffsetY(arc)"
                                :fill="FINAL_CONFIG.color"
                                :font-size="FINAL_CONFIG.dataLabelFontSize"
                                :filter="getBlurFilter(arc.id)"
                            >
                                {{
                                    donut.displayArcPercentage(arc, donut.chart)
                                }}
                                ({{
                                    applyDataLabel(
                                        FINAL_CONFIG.formatter,
                                        arc.value,
                                        dataLabel({
                                            p: FINAL_CONFIG.valuePrefix,
                                            v: arc.value,
                                            s: FINAL_CONFIG.valueSuffix,
                                            r: FINAL_CONFIG.dataLabelRoundingValue,
                                        }),
                                        { datapoint: arc, seriesIndex: i },
                                    )
                                }})
                            </text>
                            <text
                                data-cy="datapoint-donut-label-name"
                                v-if="donut.isArcBigEnough(arc, true, 20)"
                                :text-anchor="calcMarkerOffsetX(arc).anchor"
                                :x="calcMarkerOffsetX(arc, true).x"
                                :y="
                                    calcMarkerOffsetY(arc) +
                                    FINAL_CONFIG.dataLabelFontSize
                                "
                                :fill="FINAL_CONFIG.color"
                                :font-size="FINAL_CONFIG.dataLabelFontSize"
                                :filter="getBlurFilter(arc.id)"
                            >
                                {{ arc.name }}
                            </text>
                        </template>
                    </g>
                    <g class="donut-hollow" v-if="FINAL_CONFIG.donutShowTotal">
                        <text
                            data-cy="donut-hollow-total-label"
                            text-anchor="middle"
                            :x="donut.drawingArea.centerX"
                            :y="
                                donut.drawingArea.centerY -
                                FINAL_CONFIG.donutTotalLabelFontSize / 2
                            "
                            :font-size="FINAL_CONFIG.donutTotalLabelFontSize"
                            :fill="FINAL_CONFIG.color"
                        >
                            {{ FINAL_CONFIG.donutTotalLabelText }}
                        </text>
                        <text
                            data-cy="donut-hollow-total-value"
                            text-anchor="middle"
                            :x="donut.drawingArea.centerX"
                            :y="
                                donut.drawingArea.centerY +
                                FINAL_CONFIG.donutTotalLabelFontSize
                            "
                            :font-size="FINAL_CONFIG.donutTotalLabelFontSize"
                            :fill="FINAL_CONFIG.color"
                        >
                            {{
                                dataLabel({
                                    p: FINAL_CONFIG.valuePrefix,
                                    v: donut.total,
                                    s: FINAL_CONFIG.valueSuffix,
                                    r: FINAL_CONFIG.dataLabelRoundingValue,
                                })
                            }}
                        </text>
                    </g>
                </template>

                <template v-if="chartType === detector.chartType.LINE">
                    <g class="line-grid" v-if="FINAL_CONFIG.xyShowGrid">
                        <template v-for="yGridLine in line.yLabels">
                            <line
                                data-cy="grid-horizontal-line-line"
                                v-if="yGridLine.y <= line.drawingArea.bottom"
                                :x1="line.drawingArea.left"
                                :x2="line.drawingArea.right"
                                :y1="yGridLine.y"
                                :y2="yGridLine.y"
                                :stroke="FINAL_CONFIG.xyGridStroke"
                                :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                                stroke-linecap="round"
                            />
                        </template>
                        <line
                            data-cy="grid-vertical-line-line"
                            v-for="(_, i) in line.extremes.maxSeries + 1"
                            :x1="line.drawingArea.left + line.slotSize * i"
                            :x2="line.drawingArea.left + line.slotSize * i"
                            :y1="line.drawingArea.top"
                            :y2="line.drawingArea.bottom"
                            :stroke="FINAL_CONFIG.xyGridStroke"
                            :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                            stroke-linecap="round"
                        />
                    </g>
                    <g class="line-axis" v-if="FINAL_CONFIG.xyShowAxis">
                        <line
                            data-cy="line-y-axis"
                            :x1="line.drawingArea.left"
                            :x2="line.drawingArea.left"
                            :y1="line.drawingArea.top"
                            :y2="line.drawingArea.bottom"
                            :stroke="FINAL_CONFIG.xyAxisStroke"
                            :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                        <line
                            data-cy="line-zero-axis"
                            :x1="line.drawingArea.left"
                            :x2="line.drawingArea.right"
                            :y1="
                                isNaN(line.absoluteZero)
                                    ? line.drawingArea.bottom
                                    : line.absoluteZero
                            "
                            :y2="
                                isNaN(line.absoluteZero)
                                    ? line.drawingArea.bottom
                                    : line.absoluteZero
                            "
                            :stroke="FINAL_CONFIG.xyAxisStroke"
                            :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                    </g>
                    <g
                        class="yLabels"
                        v-if="FINAL_CONFIG.xyShowScale"
                        ref="scaleLabels"
                    >
                        <template
                            v-for="(label, i) in line.yLabels"
                            :key="`sl_${i}`"
                        >
                            <path
                                data-cy="scale-line-tick"
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                :d="`M${label.x + 4},${label.y} ${line.drawingArea.left},${label.y}`"
                                v-if="label.y <= line.drawingArea.bottom"
                                :stroke="FINAL_CONFIG.xyAxisStroke"
                                :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                                stroke-linecap="round"
                            />
                            <text
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                data-cy="scale-line-label"
                                v-if="label.y <= line.drawingArea.bottom"
                                :transform="`translate(${label.x}, ${label.y + FINAL_CONFIG.xyLabelsYFontSize / 3})`"
                                text-anchor="end"
                                :font-size="FINAL_CONFIG.xyLabelsYFontSize"
                                :fill="FINAL_CONFIG.color"
                            >
                                {{
                                    applyDataLabel(
                                        FINAL_CONFIG.formatter,
                                        label.value,
                                        dataLabel({
                                            p: FINAL_CONFIG.valuePrefix,
                                            v: label.value,
                                            s: FINAL_CONFIG.valueSuffix,
                                            r: FINAL_CONFIG.dataLabelRoundingValue,
                                        }),
                                        { datapoint: label, seriesIndex: i },
                                    )
                                }}
                            </text>
                        </template>
                    </g>

                    <!-- TIME LABELS -->
                    <g
                        class="periodLabels"
                        v-if="
                            FINAL_CONFIG.xyShowScale &&
                            FINAL_CONFIG.xyPeriods.length
                        "
                    >
                        <template
                            v-for="(period, i) in timeLabels.map((l) => l.text)"
                        >
                            <line
                                v-if="
                                    !FINAL_CONFIG.xyPeriodsShowOnlyAtModulo ||
                                    (FINAL_CONFIG.xyPeriodsShowOnlyAtModulo &&
                                        i %
                                            Math.floor(
                                                (slicer.end - slicer.start) /
                                                    modulo,
                                            ) ===
                                            0) ||
                                    slicer.end - slicer.start <= modulo
                                "
                                data-cy="period-tick"
                                :x1="
                                    line.drawingArea.left +
                                    line.slotSize * (i + 1) -
                                    line.slotSize / 2
                                "
                                :x2="
                                    line.drawingArea.left +
                                    line.slotSize * (i + 1) -
                                    line.slotSize / 2
                                "
                                :y1="line.drawingArea.bottom"
                                :y2="line.drawingArea.bottom + 4"
                                :stroke="FINAL_CONFIG.xyAxisStroke"
                                :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                                stroke-linecap="round"
                            />
                        </template>
                        <g ref="timeLabelsEls">
                            <template
                                v-for="(period, i) in timeLabels.map(
                                    (l) => l.text,
                                )"
                            >
                                <g
                                    v-if="
                                        !FINAL_CONFIG.xyPeriodsShowOnlyAtModulo ||
                                        (FINAL_CONFIG.xyPeriodsShowOnlyAtModulo &&
                                            i %
                                                Math.floor(
                                                    (slicer.end -
                                                        slicer.start) /
                                                        modulo,
                                                ) ===
                                                0) ||
                                        slicer.end - slicer.start <= modulo
                                    "
                                >
                                    <text
                                        class="vue-data-ui-time-label"
                                        v-if="!String(period).includes('\n')"
                                        data-cy="period-label"
                                        :font-size="
                                            FINAL_CONFIG.xyLabelsXFontSize
                                        "
                                        :text-anchor="
                                            FINAL_CONFIG.xyPeriodLabelsRotation >
                                            0
                                                ? 'start'
                                                : FINAL_CONFIG.xyPeriodLabelsRotation <
                                                    0
                                                  ? 'end'
                                                  : 'middle'
                                        "
                                        :fill="FINAL_CONFIG.color"
                                        :transform="`translate(${line.drawingArea.left + line.slotSize * (i + 1) - line.slotSize / 2}, ${line.drawingArea.bottom + FINAL_CONFIG.xyLabelsXFontSize + 6}), rotate(${FINAL_CONFIG.xyPeriodLabelsRotation})`"
                                    >
                                        {{ period }}
                                    </text>
                                    <text
                                        v-else
                                        class="vue-data-ui-time-label"
                                        data-cy="period-label"
                                        :font-size="
                                            FINAL_CONFIG.xyLabelsXFontSize
                                        "
                                        :text-anchor="
                                            FINAL_CONFIG.xyPeriodLabelsRotation >
                                            0
                                                ? 'start'
                                                : FINAL_CONFIG.xyPeriodLabelsRotation <
                                                    0
                                                  ? 'end'
                                                  : 'middle'
                                        "
                                        :fill="FINAL_CONFIG.color"
                                        :transform="`translate(${line.drawingArea.left + line.slotSize * (i + 1) - line.slotSize / 2}, ${line.drawingArea.bottom + FINAL_CONFIG.xyLabelsXFontSize + 6}), rotate(${FINAL_CONFIG.xyPeriodLabelsRotation})`"
                                        v-html="
                                            createTSpansFromLineBreaksOnX({
                                                content: String(period),
                                                fontSize:
                                                    FINAL_CONFIG.xyLabelsXFontSize,
                                                fill: FINAL_CONFIG.color,
                                                x: 0,
                                                y: 0,
                                            })
                                        "
                                    />
                                </g>
                            </template>
                        </g>
                    </g>
                    <g class="plots">
                        <template
                            v-for="(ds, i) in line.dataset"
                            :key="`serie_${ds.id}`"
                        >
                            <g class="line-plot-series">
                                <template v-if="FINAL_CONFIG.lineSmooth">
                                    <path
                                        ref="pathWrapper"
                                        data-cy="datapoint-line-wrapper"
                                        :d="`M ${createSmoothPath(ds.coordinates)}`"
                                        :stroke="FINAL_CONFIG.backgroundColor"
                                        :stroke-width="
                                            FINAL_CONFIG.lineStrokeWidth + 1
                                        "
                                        stroke-linecap="round"
                                        fill="none"
                                        :class="{
                                            'vue-data-ui-transition':
                                                transitionEnabled,
                                        }"
                                    />
                                    <path
                                        ref="pathTop"
                                        data-cy="datapoint-line"
                                        :d="`M ${createSmoothPath(ds.coordinates)}`"
                                        :stroke="ds.color"
                                        :stroke-width="
                                            FINAL_CONFIG.lineStrokeWidth
                                        "
                                        stroke-linecap="round"
                                        fill="none"
                                        :class="{
                                            'vue-data-ui-transition':
                                                transitionEnabled,
                                        }"
                                        :style="{
                                            transition: loading
                                                ? undefined
                                                : 'all 0.2s ease-in-out',
                                        }"
                                    ></path>
                                </template>
                                <template v-else>
                                    <path
                                        ref="pathWrapper"
                                        data-cy="datapoint-line-wrapper"
                                        :d="`M ${ds.linePath}`"
                                        :stroke="FINAL_CONFIG.backgroundColor"
                                        :stroke-width="
                                            FINAL_CONFIG.lineStrokeWidth + 1
                                        "
                                        stroke-linecap="round"
                                        fill="none"
                                        :class="{
                                            'vue-data-ui-transition':
                                                transitionEnabled,
                                        }"
                                    />
                                    <path
                                        ref="pathTop"
                                        data-cy="datapoint-line"
                                        :d="`M ${ds.linePath}`"
                                        :stroke="ds.color"
                                        :stroke-width="
                                            FINAL_CONFIG.lineStrokeWidth
                                        "
                                        stroke-linecap="round"
                                        fill="none"
                                        :class="{
                                            'vue-data-ui-transition':
                                                transitionEnabled,
                                        }"
                                    />
                                </template>
                                <template
                                    v-for="(plot, j) in ds.coordinates"
                                    :key="`dp_${ds.id}_${j + slicer.start}`"
                                >
                                    <circle
                                        data-cy="datapoint-plot"
                                        :cx="plot.x"
                                        :cy="checkNaN(plot.y)"
                                        :r="3"
                                        :fill="ds.color"
                                        :stroke="FINAL_CONFIG.backgroundColor"
                                        stroke-width="0.5"
                                        :class="{
                                            'vue-ui-quick-chart-plot': true,
                                            'vue-data-ui-transition':
                                                transitionEnabled,
                                        }"
                                    />
                                </template>
                            </g>
                        </template>
                    </g>
                    <g class="dataLabels" v-if="FINAL_CONFIG.showDataLabels">
                        <template
                            v-for="(ds, i) in line.dataset"
                            :key="`ds_${ds.id}`"
                        >
                            <text
                                class="vue-ui-quick-chart-label"
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                data-cy="datapoint-label"
                                v-for="(plot, j) in ds.coordinates"
                                :key="`plot_${ds.id}_${j + slicer.start}`"
                                text-anchor="middle"
                                :font-size="FINAL_CONFIG.dataLabelFontSize"
                                :fill="ds.color"
                                :transform="`translate(${plot.x}, ${checkNaN(plot.y) - FINAL_CONFIG.dataLabelFontSize / 2})`"
                            >
                                {{
                                    applyDataLabel(
                                        FINAL_CONFIG.formatter,
                                        checkNaN(plot.value),
                                        dataLabel({
                                            p: FINAL_CONFIG.valuePrefix,
                                            v: checkNaN(plot.value),
                                            s: FINAL_CONFIG.valueSuffix,
                                            r: FINAL_CONFIG.dataLabelRoundingValue,
                                        }),
                                        { datapoint: plot, seriesIndex: j },
                                    )
                                }}
                            </text>
                        </template>
                    </g>
                    <g class="tooltip-traps" v-if="userHovers">
                        <rect
                            data-cy="tooltip-trap-line"
                            v-for="(_, i) in line.extremes.maxSeries"
                            :x="line.drawingArea.left + i * line.slotSize"
                            :y="line.drawingArea.top"
                            :height="
                                line.drawingArea.height <= 0
                                    ? 0.00001
                                    : line.drawingArea.height
                            "
                            :width="
                                line.slotSize <= 0 ? 0.00001 : line.slotSize
                            "
                            :fill="
                                [
                                    selectedDatapoint,
                                    commonSelectedIndex,
                                ].includes(i)
                                    ? FINAL_CONFIG.xyHighlighterColor
                                    : 'transparent'
                            "
                            :style="`opacity:${FINAL_CONFIG.xyHighlighterOpacity}`"
                            @mouseenter="line.useTooltip(i, 'pointer')"
                            @mouseleave="line.killTooltip(i)"
                            @click="line.selectDatapoint(i)"
                        />
                    </g>
                </template>

                <template v-if="chartType === detector.chartType.BAR">
                    <g class="line-grid" v-if="FINAL_CONFIG.xyShowGrid">
                        <template v-for="yGridLine in bar.yLabels">
                            <line
                                data-cy="grid-horizontal-line-bar"
                                v-if="yGridLine.y <= bar.drawingArea.bottom"
                                :x1="bar.drawingArea.left"
                                :x2="bar.drawingArea.right"
                                :y1="yGridLine.y"
                                :y2="yGridLine.y"
                                :stroke="FINAL_CONFIG.xyGridStroke"
                                :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                                stroke-linecap="round"
                            />
                        </template>
                        <template v-if="segregated.length < bar.legend.length">
                            <line
                                data-cy="grid-vertical-line-bar"
                                v-for="(_, i) in bar.extremes.maxSeries + 1"
                                :x1="bar.drawingArea.left + bar.slotSize * i"
                                :x2="bar.drawingArea.left + bar.slotSize * i"
                                :y1="bar.drawingArea.top"
                                :y2="bar.drawingArea.bottom"
                                :stroke="FINAL_CONFIG.xyGridStroke"
                                :stroke-width="FINAL_CONFIG.xyGridStrokeWidth"
                                stroke-linecap="round"
                            />
                        </template>
                    </g>
                    <g class="line-axis" v-if="FINAL_CONFIG.xyShowAxis">
                        <line
                            data-cy="bar-y-axis"
                            :x1="bar.drawingArea.left"
                            :x2="bar.drawingArea.left"
                            :y1="bar.drawingArea.top"
                            :y2="bar.drawingArea.bottom"
                            :stroke="FINAL_CONFIG.xyAxisStroke"
                            :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                        <line
                            data-cy="bar-zero-axis"
                            :x1="bar.drawingArea.left"
                            :x2="bar.drawingArea.right"
                            :y1="
                                isNaN(bar.absoluteZero)
                                    ? bar.drawingArea.bottom
                                    : bar.absoluteZero
                            "
                            :y2="
                                isNaN(bar.absoluteZero)
                                    ? bar.drawingArea.bottom
                                    : bar.absoluteZero
                            "
                            :stroke="FINAL_CONFIG.xyAxisStroke"
                            :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                    </g>
                    <g
                        class="yLabels"
                        v-if="FINAL_CONFIG.xyShowScale"
                        ref="scaleLabels"
                    >
                        <template
                            v-for="(label, i) in bar.yLabels"
                            :key="`sl_${i}`"
                        >
                            <path
                                data-cy="scale-bar-tick"
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                v-if="label.y <= bar.drawingArea.bottom"
                                :d="`M${label.x + 4},${label.y} ${bar.drawingArea.left},${label.y}`"
                                :stroke="FINAL_CONFIG.xyAxisStroke"
                                :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                                stroke-linecap="round"
                            />
                            <text
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                data-cy="scale-bar-label"
                                v-if="label.y <= bar.drawingArea.bottom"
                                :transform="`translate(${label.x}, ${label.y + FINAL_CONFIG.xyLabelsYFontSize / 3})`"
                                text-anchor="end"
                                :font-size="FINAL_CONFIG.xyLabelsYFontSize"
                                :fill="FINAL_CONFIG.color"
                            >
                                {{
                                    applyDataLabel(
                                        FINAL_CONFIG.formatter,
                                        label.value,
                                        dataLabel({
                                            p: FINAL_CONFIG.valuePrefix,
                                            v: label.value,
                                            s: FINAL_CONFIG.valueSuffix,
                                            r: FINAL_CONFIG.dataLabelRoundingValue,
                                        }),
                                        { datapoint: label, seriesIndex: i },
                                    )
                                }}
                            </text>
                        </template>
                    </g>
                    <g
                        class="periodLabels"
                        v-if="
                            FINAL_CONFIG.xyShowScale &&
                            FINAL_CONFIG.xyPeriods.length
                        "
                    >
                        <line
                            data-cy="period-tick"
                            v-for="(_, i) in FINAL_CONFIG.xyPeriods.slice(
                                slicer.start,
                                slicer.end,
                            )"
                            :x1="
                                bar.drawingArea.left +
                                bar.slotSize * (i + 1) -
                                bar.slotSize / 2
                            "
                            :x2="
                                bar.drawingArea.left +
                                bar.slotSize * (i + 1) -
                                bar.slotSize / 2
                            "
                            :y1="bar.drawingArea.bottom"
                            :y2="bar.drawingArea.bottom + 4"
                            :stroke="FINAL_CONFIG.xyAxisStroke"
                            :stroke-width="FINAL_CONFIG.xyAxisStrokeWidth"
                            stroke-linecap="round"
                        />
                        <g ref="timeLabelsEls">
                            <template
                                v-for="(period, i) in timeLabels.map(
                                    (l) => l.text,
                                )"
                            >
                                <g
                                    v-if="
                                        !FINAL_CONFIG.xyPeriodsShowOnlyAtModulo ||
                                        (FINAL_CONFIG.xyPeriodsShowOnlyAtModulo &&
                                            i %
                                                Math.floor(
                                                    (slicer.end -
                                                        slicer.start) /
                                                        modulo,
                                                ) ===
                                                0) ||
                                        slicer.end - slicer.start <= modulo
                                    "
                                >
                                    <text
                                        class="vue-data-ui-time-label"
                                        v-if="!String(period).includes('\n')"
                                        data-cy="period-label"
                                        :font-size="
                                            FINAL_CONFIG.xyLabelsXFontSize
                                        "
                                        :text-anchor="
                                            FINAL_CONFIG.xyPeriodLabelsRotation >
                                            0
                                                ? 'start'
                                                : FINAL_CONFIG.xyPeriodLabelsRotation <
                                                    0
                                                  ? 'end'
                                                  : 'middle'
                                        "
                                        :fill="FINAL_CONFIG.color"
                                        :transform="`translate(${bar.drawingArea.left + bar.slotSize * (i + 1) - bar.slotSize / 2}, ${bar.drawingArea.bottom + FINAL_CONFIG.xyLabelsXFontSize + 6}), rotate(${FINAL_CONFIG.xyPeriodLabelsRotation})`"
                                    >
                                        {{ period }}
                                    </text>
                                    <text
                                        v-else
                                        class="vue-data-ui-time-label"
                                        data-cy="period-label"
                                        :font-size="
                                            FINAL_CONFIG.xyLabelsXFontSize
                                        "
                                        :text-anchor="
                                            FINAL_CONFIG.xyPeriodLabelsRotation >
                                            0
                                                ? 'start'
                                                : FINAL_CONFIG.xyPeriodLabelsRotation <
                                                    0
                                                  ? 'end'
                                                  : 'middle'
                                        "
                                        :fill="FINAL_CONFIG.color"
                                        :transform="`translate(${bar.drawingArea.left + bar.slotSize * (i + 1) - bar.slotSize / 2}, ${bar.drawingArea.bottom + FINAL_CONFIG.xyLabelsXFontSize + 6}), rotate(${FINAL_CONFIG.xyPeriodLabelsRotation})`"
                                        v-html="
                                            createTSpansFromLineBreaksOnX({
                                                content: String(period),
                                                fontSize:
                                                    FINAL_CONFIG.xyLabelsXFontSize,
                                                fill: FINAL_CONFIG.color,
                                                x: 0,
                                                y: 0,
                                            })
                                        "
                                    />
                                </g>
                            </template>
                        </g>
                    </g>
                    <g class="plots">
                        <template v-for="(ds, i) in bar.dataset">
                            <rect
                                data-cy="datapoint-bar"
                                v-for="(plot, j) in ds.coordinates"
                                :x="plot.x"
                                :width="plot.width <= 0 ? 0.00001 : plot.width"
                                :height="
                                    checkNaN(
                                        plot.height <= 0
                                            ? 0.00001
                                            : plot.height,
                                    )
                                "
                                :y="checkNaN(plot.y)"
                                :fill="ds.color"
                                :stroke="FINAL_CONFIG.backgroundColor"
                                :stroke-width="FINAL_CONFIG.barStrokeWidth"
                                stroke-linecap="round"
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                            />
                        </template>
                    </g>
                    <g class="dataLabels" v-if="FINAL_CONFIG.showDataLabels">
                        <template
                            v-for="(ds, i) in bar.dataset"
                            :key="`ds_${ds.id}`"
                        >
                            <text
                                data-cy="datapoint-label"
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                v-for="(plot, j) in ds.coordinates"
                                :key="`plot_${j + slicer.start}`"
                                :transform="`translate(${plot.x + plot.width / 2}, ${checkNaN(plot.y) - FINAL_CONFIG.dataLabelFontSize / 2})`"
                                text-anchor="middle"
                                :font-size="FINAL_CONFIG.dataLabelFontSize"
                                :fill="ds.color"
                            >
                                {{
                                    applyDataLabel(
                                        FINAL_CONFIG.formatter,
                                        checkNaN(plot.value),
                                        dataLabel({
                                            p: FINAL_CONFIG.valuePrefix,
                                            v: checkNaN(plot.value),
                                            s: FINAL_CONFIG.valueSuffix,
                                            r: FINAL_CONFIG.dataLabelRoundingValue,
                                        }),
                                        { datapoint: plot, seriesIndex: j },
                                    )
                                }}
                            </text>
                        </template>
                    </g>
                    <g
                        class="tooltip-traps"
                        v-if="
                            userHovers && segregated.length < bar.legend.length
                        "
                    >
                        <rect
                            data-cy="tooltip-trap-bar"
                            v-for="(_, i) in bar.extremes.maxSeries"
                            :x="bar.drawingArea.left + i * bar.slotSize"
                            :y="bar.drawingArea.top"
                            :height="
                                bar.drawingArea.height <= 0
                                    ? 0.00001
                                    : bar.drawingArea.height
                            "
                            :width="bar.slotSize <= 0 ? 0.00001 : bar.slotSize"
                            :fill="
                                [
                                    selectedDatapoint,
                                    commonSelectedIndex,
                                ].includes(i)
                                    ? FINAL_CONFIG.xyHighlighterColor
                                    : 'transparent'
                            "
                            :style="`opacity:${FINAL_CONFIG.xyHighlighterOpacity}`"
                            @mouseenter="bar.useTooltip(i, 'pointer')"
                            @mouseleave="bar.killTooltip(i)"
                            @click="bar.selectDatapoint(i)"
                        />
                    </g>
                </template>

                <template
                    v-if="
                        [
                            detector.chartType.LINE,
                            detector.chartType.BAR,
                        ].includes(chartType)
                    "
                >
                    <g class="axis-labels">
                        <g
                            v-if="
                                FINAL_CONFIG.xAxisLabel &&
                                chartType === detector.chartType.LINE
                            "
                            ref="xAxisLabel"
                        >
                            <text
                                :font-size="FINAL_CONFIG.axisLabelsFontSize"
                                :fill="FINAL_CONFIG.color"
                                text-anchor="middle"
                                :x="
                                    line.drawingArea.left +
                                    line.drawingArea.width / 2
                                "
                                :y="
                                    defaultSizes.height -
                                    FINAL_CONFIG.axisLabelsFontSize / 3
                                "
                            >
                                {{ FINAL_CONFIG.xAxisLabel }}
                            </text>
                        </g>
                        <g
                            v-if="
                                FINAL_CONFIG.xAxisLabel &&
                                chartType === detector.chartType.BAR
                            "
                            ref="xAxisLabel"
                        >
                            <text
                                :font-size="FINAL_CONFIG.axisLabelsFontSize"
                                :fill="FINAL_CONFIG.color"
                                text-anchor="middle"
                                :x="
                                    bar.drawingArea.left +
                                    bar.drawingArea.width / 2
                                "
                                :y="
                                    defaultSizes.height -
                                    FINAL_CONFIG.axisLabelsFontSize / 3
                                "
                            >
                                {{ FINAL_CONFIG.xAxisLabel }}
                            </text>
                        </g>
                        <g
                            v-if="
                                FINAL_CONFIG.yAxisLabel &&
                                chartType === detector.chartType.LINE
                            "
                            ref="yAxisLabel"
                        >
                            <text
                                :font-size="FINAL_CONFIG.axisLabelsFontSize"
                                :fill="FINAL_CONFIG.color"
                                :transform="`translate(${FINAL_CONFIG.axisLabelsFontSize}, ${line.drawingArea.top + line.drawingArea.height / 2}) rotate(-90)`"
                                text-anchor="middle"
                            >
                                {{ FINAL_CONFIG.yAxisLabel }}
                            </text>
                        </g>
                        <g
                            v-if="
                                FINAL_CONFIG.yAxisLabel &&
                                chartType === detector.chartType.BAR
                            "
                            ref="yAxisLabel"
                        >
                            <text
                                :font-size="FINAL_CONFIG.axisLabelsFontSize"
                                :fill="FINAL_CONFIG.color"
                                :transform="`translate(${FINAL_CONFIG.axisLabelsFontSize}, ${bar.drawingArea.top + bar.drawingArea.height / 2}) rotate(-90)`"
                                text-anchor="middle"
                            >
                                {{ FINAL_CONFIG.yAxisLabel }}
                            </text>
                        </g>
                    </g>
                </template>

                <!-- ON-CHART ZOOM SELECTION -->
                <rect
                    v-if="chartZoomSelectionRect"
                    data-cy="quick-chart-zoom-selection"
                    :x="chartZoomSelectionRect.x"
                    :y="chartZoomSelectionRect.y"
                    :width="chartZoomSelectionRect.width"
                    :height="chartZoomSelectionRect.height"
                    :fill="dragToZoomConfig.selection.fill"
                    :fill-opacity="dragToZoomConfig.selection.fillOpacity"
                    :stroke="dragToZoomConfig.selection.stroke"
                    :stroke-opacity="dragToZoomConfig.selection.strokeOpacity"
                    :stroke-width="dragToZoomConfig.selection.strokeWidth"
                    :stroke-dasharray="
                        dragToZoomConfig.selection.strokeDasharray
                    "
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    pointer-events="none"
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
                v-bind="{ isPrinting: isPrinting || isImaging }"
            />
        </div>

        <div
            v-if="isZoomUiVisible"
            :key="`slicer_${slicerStep}`"
            ref="quickChartSlicer"
        >
            <SlicerPreview
                ref="slicerComponent"
                :key="`slicer_${slicerStep}`"
                :timeLabels="timeLabels"
                :background="FINAL_CONFIG.zoomColor"
                :borderColor="FINAL_CONFIG.backgroundColor"
                :fontSize="FINAL_CONFIG.zoomFontSize"
                :useResetSlot="FINAL_CONFIG.zoomUseResetSlot"
                :textColor="FINAL_CONFIG.color"
                :inputColor="FINAL_CONFIG.zoomColor"
                :selectColor="FINAL_CONFIG.zoomHighlightColor"
                :max="formattedDataset.maxSeriesLength"
                :min="0"
                :valueStart="slicer.start"
                :valueEnd="slicer.end"
                :smoothMinimap="FINAL_CONFIG.zoomMinimap.smooth"
                :minimapSelectedColor="FINAL_CONFIG.zoomMinimap.selectedColor"
                :minimapSelectedColorOpacity="
                    FINAL_CONFIG.zoomMinimap.selectedColorOpacity
                "
                :minimapSelectionRadius="
                    FINAL_CONFIG.zoomMinimap.selectionRadius
                "
                :minimapLineColor="FINAL_CONFIG.zoomMinimap.lineColor"
                :minimap="minimap"
                :minimapIndicatorColor="FINAL_CONFIG.zoomMinimap.indicatorColor"
                :verticalHandles="FINAL_CONFIG.zoomMinimap.verticalHandles"
                :minimapSelectedIndex="commonSelectedIndex"
                @update:start="onSlicerStart"
                @update:end="onSlicerEnd"
                :refreshStartPoint="
                    FINAL_CONFIG.zoomStartIndex !== null
                        ? FINAL_CONFIG.zoomStartIndex
                        : 0
                "
                :refreshEndPoint="
                    FINAL_CONFIG.zoomEndIndex !== null
                        ? FINAL_CONFIG.zoomEndIndex + 1
                        : formattedDataset.maxSeriesLength
                "
                :enableRangeHandles="FINAL_CONFIG.zoomEnableRangeHandles"
                :enableSelectionDrag="FINAL_CONFIG.zoomEnableSelectionDrag"
                :minimapCompact="FINAL_CONFIG.zoomMinimap.compact"
                :minimapMerged="FINAL_CONFIG.zoomMinimap.merged"
                :allMinimaps="allMinimaps"
                :minimapFrameColor="FINAL_CONFIG.zoomMinimap.frameColor"
                :additionalMinimapHeight="
                    FINAL_CONFIG.zoomMinimap.additionalHeight
                "
                :handleType="FINAL_CONFIG.zoomMinimap.handleType"
                :handleWidth="FINAL_CONFIG.zoomMinimap.handleWidth"
                :handleBorderWidth="FINAL_CONFIG.zoomMinimap.handleBorderWidth"
                :handleIconColor="FINAL_CONFIG.zoomMinimap.handleIconColor"
                :handleBorderColor="FINAL_CONFIG.zoomMinimap.handleBorderColor"
                :handleFill="FINAL_CONFIG.zoomMinimap.handleFill"
                :focusOnDrag="FINAL_CONFIG.zoomFocusOnDrag"
                :focusRangeRatio="FINAL_CONFIG.zoomFocusRangeRatio"
                :maxWidth="FINAL_CONFIG.zoomMaxWidth"
                :minimapLeftInsetRatio="slicerMinimapLeftInsetRatio"
                :minimapRightInsetRatio="slicerMinimapRightInsetRatio"
                @reset="
                    () =>
                        refreshSlicer({
                            applyControlledZoom: false,
                            publish: true,
                        })
                "
                @trapMouse="setCommonSelectedIndex"
            >
                <template #reset-action="{ reset }">
                    <slot name="reset-action" v-bind="{ reset }" />
                </template>
            </SlicerPreview>
        </div>

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport
            v-if="readyTeleport && FINAL_CONFIG.showLegend"
            :to="
                FINAL_CONFIG.legendPosition === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div
                v-if="FINAL_CONFIG.showLegend"
                ref="quickChartLegend"
                class="vue-ui-quick-chart-legend"
                :style="`background:transparent;color:${FINAL_CONFIG.color}`"
            >
                <BaseLegendToggle
                    v-if="
                        (donut?.legend?.length > 2 ||
                            line?.legend?.length > 2 ||
                            bar?.legend?.length > 2) &&
                        FINAL_CONFIG.showLegendSelectAllToggle &&
                        !loading
                    "
                    :backgroundColor="
                        FINAL_CONFIG.legendSelectAllToggleBackgroundColor
                    "
                    :color="FINAL_CONFIG.legendSelectAllToggleColor"
                    :fontSize="FINAL_CONFIG.legendFontSize"
                    :checked="segregated.length > 0"
                    :isCursorPointer="isCursorPointer"
                    @toggle="toggleLegend"
                />

                <template v-if="chartType === detector.chartType.DONUT">
                    <div
                        class="vue-ui-quick-chart-legend-item"
                        v-for="(legendItem, i) in donut.legend"
                        @click="segregateDonut(legendItem, donut.dataset)"
                        :style="`cursor: ${donut.legend.length > 1 && isCursorPointer ? 'pointer' : 'default'}; opacity:${segregated.includes(legendItem.id) ? '0.5' : '1'}`"
                        role="button"
                        tabindex="0"
                        @keydown="
                            handleLegendKeydown($event, () => {
                                segregateDonut(legendItem, donut.dataset);
                            })
                        "
                    >
                        <template v-if="FINAL_CONFIG.useCustomLegend">
                            <slot
                                name="legend"
                                v-bind="{
                                    legend: {
                                        ...legendItem,
                                        isSegregated: segregated.includes(
                                            legendItem.id,
                                        ),
                                        segregate: () => {
                                            segregateDonut(
                                                legendItem,
                                                donut.dataset,
                                            );
                                        },
                                    },
                                }"
                            />
                        </template>

                        <template v-else>
                            <BaseIcon
                                :name="FINAL_CONFIG.legendIcon"
                                :stroke="legendItem.color"
                                :size="FINAL_CONFIG.legendIconSize"
                            />
                            <span
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px`"
                            >
                                {{ legendItem.name }}
                            </span>
                            <span
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px;font-variant-numeric:tabular-nums`"
                            >
                                {{
                                    segregated.includes(legendItem.id)
                                        ? '-'
                                        : applyDataLabel(
                                              FINAL_CONFIG.formatter,
                                              legendItem.absoluteValue,
                                              dataLabel({
                                                  p: FINAL_CONFIG.valuePrefix,
                                                  v: legendItem.absoluteValue,
                                                  s: FINAL_CONFIG.valueSuffix,
                                                  r: FINAL_CONFIG.dataLabelRoundingValue,
                                              }),
                                              {
                                                  datapoint: legendItem,
                                                  seriesIndex: i,
                                              },
                                          )
                                }}
                            </span>
                            <span
                                v-if="segregated.includes(legendItem.id)"
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px`"
                            >
                                ( - % )
                            </span>
                            <span
                                v-else-if="isSegregatingDonut"
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px; font-variant-numeric: tabular-nums;`"
                            >
                                ( - % )
                            </span>
                            <span
                                v-else
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px; font-variant-numeric: tabular-nums;`"
                            >
                                ({{
                                    dataLabel({
                                        v:
                                            (legendItem.value / donut.total) *
                                            100,
                                        s: '%',
                                        r: FINAL_CONFIG.dataLabelRoundingPercentage,
                                    })
                                }})
                            </span>
                        </template>
                    </div>
                </template>

                <template v-if="chartType === detector.chartType.LINE">
                    <div
                        class="vue-ui-quick-chart-legend-item"
                        v-for="(legendItem, i) in line.legend"
                        @click="
                            segregate(legendItem.id, line.legend.length - 1);
                            emit('selectLegend', line.dataset);
                        "
                        :style="`cursor: ${line.legend.length > 1 && isCursorPointer ? 'pointer' : 'default'}; opacity:${segregated.includes(legendItem.id) ? '0.5' : '1'}`"
                        role="button"
                        tabindex="0"
                        @keydown="
                            handleLegendKeydown($event, () => {
                                segregate(
                                    legendItem.id,
                                    line.legend.length - 1,
                                );
                                emit('selectLegend', line.dataset);
                            })
                        "
                    >
                        <template v-if="FINAL_CONFIG.useCustomLegend">
                            <slot
                                name="legend"
                                v-bind="{
                                    legend: {
                                        ...legendItem,
                                        isSegregated: segregated.includes(
                                            legendItem.id,
                                        ),
                                        segregate: () => {
                                            segregate(
                                                legendItem.id,
                                                line.legend.length - 1,
                                            );
                                            emit('selectLegend', line.dataset);
                                        },
                                    },
                                }"
                            />
                        </template>
                        <template v-else>
                            <BaseIcon
                                :name="FINAL_CONFIG.legendIcon"
                                :stroke="legendItem.color"
                                :size="FINAL_CONFIG.legendIconSize"
                            />
                            <span
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px`"
                            >
                                {{ legendItem.name }}
                            </span>
                        </template>
                    </div>
                </template>

                <template v-if="chartType === detector.chartType.BAR">
                    <div
                        class="vue-ui-quick-chart-legend-item"
                        v-for="(legendItem, i) in bar.legend"
                        @click="
                            segregate(legendItem.id, bar.legend.length - 1);
                            emit('selectLegend', bar.dataset);
                        "
                        :style="`cursor: ${bar.legend.length > 1 && isCursorPointer ? 'pointer' : 'default'}; opacity:${segregated.includes(legendItem.id) ? '0.5' : '1'}`"
                        role="button"
                        tabindex="0"
                        @keydown="
                            handleLegendKeydown($event, () => {
                                segregate(legendItem.id, bar.legend.length - 1);
                                emit('selectLegend', bar.dataset);
                            })
                        "
                    >
                        <template v-if="FINAL_CONFIG.useCustomLegend">
                            <slot
                                name="legend"
                                v-bind="{
                                    legend: {
                                        ...legendItem,
                                        isSegregated: segregated.includes(
                                            legendItem.id,
                                        ),
                                        segregate: () => {
                                            segregate(
                                                legendItem.id,
                                                bar.legend.length - 1,
                                            );
                                            emit('selectLegend', bar.dataset);
                                        },
                                    },
                                }"
                            />
                        </template>
                        <template v-else>
                            <BaseIcon
                                :name="FINAL_CONFIG.legendIcon"
                                :stroke="legendItem.color"
                                :size="FINAL_CONFIG.legendIconSize"
                            />
                            <span
                                :style="`font-size:${FINAL_CONFIG.legendFontSize}px`"
                            >
                                {{ legendItem.name }}
                            </span>
                        </template>
                    </div>
                </template>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Tooltip
            :teleportTo="FINAL_CONFIG.tooltipTeleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.backgroundColor"
            :color="FINAL_CONFIG.color"
            :borderRadius="FINAL_CONFIG.tooltipBorderRadius"
            :borderColor="FINAL_CONFIG.tooltipBorderColor"
            :borderWidth="FINAL_CONFIG.tooltipBorderWidth"
            :fontSize="FINAL_CONFIG.tooltipFontSize"
            :backgroundOpacity="FINAL_CONFIG.tooltipBackgroundOpacity"
            :position="FINAL_CONFIG.tooltipPosition"
            :offsetX="FINAL_CONFIG.tooltipOffsetX"
            :offsetY="FINAL_CONFIG.tooltipOffsetY"
            :parent="quickChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="isFunction(FINAL_CONFIG.tooltipCustomFormat)"
            :smooth="FINAL_CONFIG.tooltipSmooth"
            :smoothForce="FINAL_CONFIG.tooltipSmoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.tooltipSmoothSnapThreshold"
            :backdropFilter="FINAL_CONFIG.tooltipBackdropFilter"
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

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
    <div v-else class="vue-ui-quick-chart-not-processable">
        <BaseIcon name="circleCancel" stroke="red" />
        <span>Dataset is not processable</span>
    </div>
</template>

<style scoped>
@import '../vue-data-ui.css';
.vue-ui-quick-chart * {
    transition: unset;
}

.vue-ui-quick-chart {
    user-select: none;
    width: 100%;
}

.vue-ui-quick-chart-not-processable {
    align-items: center;
    background: rgba(255, 0, 0, 0.1);
    border-radius: 6px;
    color: red;
    display: flex;
    flex-direction: row;
    gap: 12px;
    justify-content: center;
    padding: 12px;
}

.vue-ui-quick-chart-title {
    padding: 0 40px 12px 40px;
}

.vue-ui-quick-chart-legend {
    align-items: center;
    display: flex;
    column-gap: 24px;
    justify-content: center;
    width: 100%;
    flex-wrap: wrap;
}

.vue-ui-quick-chart-legend-item {
    display: flex;
    flex-direction: flex-row;
    gap: 6px;
    align-items: center;
}

.vue-ui-quick-chart-legend-item:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}

.vue-data-ui-bar-animated {
    animation: vueDataUiBarAnimation 0.5s cubic-bezier(0.79, 0.21, 0.79, 0.21)
        forwards;
}

@keyframes vueDataUiBarAnimation {
    from {
        height: 0;
    }
}

svg:focus {
    outline: none;
}

svg:focus-visible {
    outline: 2px solid currentColor;
}

svg.vue-ui-quick-chart-zoom-pointer-focus:focus,
svg.vue-ui-quick-chart-zoom-pointer-focus:focus-visible {
    outline: none;
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

.vue-data-ui-transition {
    transition: all 0.2s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
    .vue-data-ui-component * {
        transition: none !important;
        animation: none !important;
    }
}

.vue-data-ui-no-transition * {
    transition: none !important;
    animation: none !important;
}
</style>

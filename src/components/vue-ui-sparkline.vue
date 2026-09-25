<script setup>
import {
    ref,
    computed,
    onMounted,
    watch,
    defineAsyncComponent,
    shallowRef,
    onBeforeUnmount,
    toRefs,
    nextTick,
    watchEffect,
} from 'vue';
import {
    applyDataLabel,
    calcLinearProgression,
    calcMedian,
    convertColorToHex,
    createSmoothPath,
    createIndividualArea,
    createIndividualAreaWithCuts,
    createSmoothAreaSegments,
    createSmoothPathWithCuts,
    createSmoothPathWithCutsSegments,
    createSmoothSegmentsByEdgeStarts,
    createStraightPath,
    createStraightPathWithCuts,
    createStraightPathWithCutsSegments,
    createStraightSegmentsByEdgeStarts,
    createUid,
    dataLabel as dl,
    error,
    fib,
    forceValidValue,
    getMissingDatasetAttributes,
    largestTriangleThreeBucketsArrayObjects,
    objectIsEmpty,
    setGradientOffset,
    setOpacity,
    shiftHue,
    treeShake,
    interpolateHexColors,
    XMLNS,
} from '../lib';
import { throttle } from '../canvas-lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { useNestedProp } from '../useNestedProp';
import { useResponsive } from '../useResponsive';
import { useThemeCheck } from '../useThemeCheck';
import { useTimeLabels } from '../useTimeLabels';
import { useChartAccessibility } from '../useChartAccessibility';
import { usePrefersReducedMotion } from '../usePrefersMotion';
import themes from '../themes/vue_ui_sparkline.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import SparklinePulse from '../atoms/SparklinePulse.vue';
import SparklineGradientPath from '../atoms/SparklineGradientPath.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import DefGrad from '../atoms/DefGrad.vue';

const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const SparkTooltip = defineAsyncComponent(
    () => import('../atoms/SparkTooltip.vue'),
);

const { vue_ui_sparkline: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();
const prefersReducedMotion = usePrefersReducedMotion();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Array,
        default() {
            return [];
        },
    },
    showInfo: {
        type: Boolean,
        default: true,
    },
    selectedIndex: {
        type: Number,
        default: undefined,
    },
    heightRatio: {
        type: Number,
        default: 1,
    },
    forcedPadding: {
        type: Number,
        default: 30,
    },
});

const isDataset = computed(() => {
    return Array.isArray(props.dataset) && props.dataset.length > 0;
});

const uid = ref(createUid());
const sparklineChart = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const activeTooltipIndex = ref(null); // a11y
const internalSelectedIndex = ref(null); // a11y

const FINAL_CONFIG = ref(prepareConfig());
const cfgTooltip = computed(() => FINAL_CONFIG.value.style.tooltip);
const cfgBar = computed(() => FINAL_CONFIG.value.style.bar);
const cfgLine = computed(() => FINAL_CONFIG.value.style.line);
const cfgArea = computed(() => FINAL_CONFIG.value.style.area);
const cfgLabel = computed(() => FINAL_CONFIG.value.style.dataLabel);
const cfgStyle = computed(() => FINAL_CONFIG.value.style);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiSparkline',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: (dataset) => dataset.length > 500,
            message: [
                '👀 The dataset has > 500 datapoints. Consider if you really need this level of detail.',
                '',
                '▶️ Use larger time scales, or aggregated values',
            ],
        },
        {
            test: (dataset) => dataset.length > 1095,
            message: [
                '👀 The dataset has > 1095 datapoints. Above this threshold, the dataset is computed through an LTTB algorithm, to preserve the shape of the data without increasing the number of datapoints.',
                '',
                '▶️ If you need this level of detail, you can change config.downsample.threshold and set a higher value. Note that performance will be impacted.',
            ],
        },
    ],
});

function makeSkeletonDs(n) {
    if (
        props.config?.skeletonDataset &&
        Array.isArray(props.config.skeletonDataset)
    ) {
        return props.config.skeletonDataset.map((value) => ({
            period: '-',
            value,
        }));
    }
    return fib(n).map((value) => ({ period: '-', value }));
}

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            gradientPath: { show: false },
            temperatureColors: { show: false },
            style: {
                backgroundColor: '#99999930',
                scaleMin: 0,
                scaleMax: null,
                animation: { show: false },
                line: {
                    color: '#AAAAAA',
                    pulse: { show: false },
                    dashIndices: [],
                },
                bar: { color: '#AAAAAA' },
                area: { color: '#CACACA' },
                zeroLine: { color: '#6A6A6A' },
                dataLabel: { show: false },
                tooltip: { show: false },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

// v3 - Skeleton loader management
const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await nextTick();
            animateSL();
        });
    },
    skeletonDataset: makeSkeletonDs(12),
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { svgRef } = useChartAccessibility({
    config: cfgStyle.value.title,
});

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
            };
        }
    } else {
        finalConfig = mergedConfig;
    }

    return finalConfig;
}

const pulse = computed(() => FINAL_CONFIG.value?.style?.line.pulse || {});
const pulseDur = computed(
    () => `${Math.max(200, Number(pulse.value.durationMs) || 4000) / 1000}s`,
);
const pulsePathLength = ref(0);
const pulseBegin = computed(() => pulse.value?.begin || '0ms');
const pulseKeyPoints = ref('0;1');

const pulseRepeatCount = computed(() => {
    return pulse.value?.loop === false ? '1' : 'indefinite';
});

const pulseFillMode = computed(() => {
    return pulse.value?.loop === false ? 'freeze' : undefined;
});

const pulseTrailLength = computed(() => {
    if (!pulse.value.trail.show) return 1;
    return pulseTrail.value.lengthPx || 1;
});

const pulseEnabled = computed(() => {
    return (
        !!pulse.value?.show &&
        !isBar.value &&
        !prefersReducedMotion.value &&
        !loading.value &&
        (mutableDataset.value?.length || 0) > 1
    );
});

function updatePulsePathLength() {
    if (!pulseEnabled.value) {
        pulsePathLength.value = 0;
        return;
    }

    const svgEl = svgRef.value;
    if (!svgEl) return;

    const selector = `#${pulsePathId.value}`;

    const el = svgEl.querySelector?.(selector);
    if (el && typeof el.getTotalLength === 'function') {
        const len = el.getTotalLength();
        if (Number.isFinite(len) && len > 0) {
            pulsePathLength.value = len;
        }
        return;
    }

    // Path not in DOM yet (id just changed / conditional path swap / hydration).
    requestAnimationFrame(() => {
        const el2 = svgEl.querySelector?.(selector);
        if (el2 && typeof el2.getTotalLength === 'function') {
            const len2 = el2.getTotalLength();
            if (Number.isFinite(len2) && len2 > 0) {
                pulsePathLength.value = len2;
            }
        }
    });
}

const pulseMotion = computed(() => {
    const easing = pulse.value?.easing || 'ease-in-out';

    const presets = {
        ease: [0.25, 0.1, 0.25, 1],
        'ease-in': [0.42, 0, 1, 1],
        'ease-out': [0, 0, 0.58, 1],
        'ease-in-out': [0.42, 0, 0.58, 1],
    };

    if (easing === 'linear') {
        return {
            calcMode: 'linear',
            keySplines: null,
            keyTimes: '0;1',
        };
    }

    if (easing === 'steps') {
        return {
            calcMode: 'discrete',
            keySplines: null,
            keyTimes: '0;1',
        };
    }

    const bez =
        easing === 'cubic-bezier'
            ? Array.isArray(pulse.value?.cubicBezier) &&
              pulse.value.cubicBezier.length === 4
                ? pulse.value.cubicBezier
                : [0.4, 0, 0.2, 1]
            : presets[easing] || presets['ease-in-out'];

    return {
        calcMode: 'spline',
        keySplines: bez.join(' '),
        keyTimes: '0;1',
    };
});

const pulseTrail = computed(() => {
    const t = pulse.value?.trail || {};
    const base = cfgLine.value.strokeWidth || 1;

    return {
        show: t.show !== false,
        lengthPx: t.length,
        width: Math.max(1, Number(t.strokeWidth) || base * 2.2),
        opacity: Math.min(1, Math.max(0, Number(t.opacity) ?? 0.6)),
        fadeIn: 0.5,
        fadeOut: 0.2,
    };
});

const downsampled = computed(() => {
    return largestTriangleThreeBucketsArrayObjects({
        data: FINAL_DATASET.value,
        threshold: FINAL_CONFIG.value.downsample.threshold,
    });
});

const isFlatTemperature = computed(() => {
    if (!FINAL_CONFIG.value.temperatureColors.show) return false;

    const visibleValues = FINAL_DATASET.value
        .map(({ value }) => value)
        .filter((value) => Number.isFinite(value));

    return new Set(visibleValues).size <= 1;
});

watch(
    () => props.config,
    (_newCfg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        prepareChart();
        svg.value.chartWidth = cfgStyle.value.chartWidth;
    },
    { deep: true },
);

watch(
    () => props.dataset,
    (_) => {
        if (Array.isArray(_) && _.length > 0) {
            manualLoading.value = false;
        }
        safeDatasetCopy.value = largestTriangleThreeBucketsArrayObjects({
            data: FINAL_DATASET.value.map((d) => {
                return {
                    ...d,
                    value: ![undefined].includes(d.value) ? d.value : null,
                };
            }),
            threshold: FINAL_CONFIG.value.downsample.threshold,
        });
    },
    { deep: true },
);

const safeDatasetCopy = ref(prepareDsCopy());

function prepareDsCopy() {
    return largestTriangleThreeBucketsArrayObjects({
        data: FINAL_DATASET.value.map((d) => {
            if (
                cfgStyle.value.animation.show &&
                FINAL_DATASET.value.length > 1
            ) {
                return {
                    ...d,
                    value: null,
                };
            } else {
                return {
                    ...d,
                    value: ![undefined].includes(d.value) ? d.value : null,
                };
            }
        }),
        threshold: FINAL_CONFIG.value.downsample.threshold,
    });
}

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

const isAnimating = ref(false);
const rafId = ref(0);
const timeoutIds = ref([]);
const lastAnimationKey = ref('');

const animationKey = computed(() => {
    const ds = downsampled.value || [];
    const sig = ds
        .map((d) => `${d.period}::${Number.isFinite(d.value) ? d.value : 0}`)
        .join('|');
    const cfg = FINAL_CONFIG.value?.style?.animation || {};
    const gradientPathEnabled =
        !!FINAL_CONFIG.value?.gradientPath?.show &&
        !FINAL_CONFIG.value.temperatureColors.show;

    return `${sig}#${!!cfg.show}#${cfg.animationFrames || 0}#${gradientPathEnabled}`;
});

function stopAnimation() {
    if (rafId.value) {
        cancelAnimationFrame(rafId.value);
        rafId.value = 0;
    }
    timeoutIds.value.forEach((id) => clearTimeout(id));
    timeoutIds.value = [];
    isAnimating.value = false;
}

function animateSL() {
    const cfg = FINAL_CONFIG.value?.style?.animation || {};
    const ds = downsampled.value || [];
    const key = animationKey.value;
    const gradientPathEnabled =
        !!FINAL_CONFIG.value.gradientPath.show &&
        !FINAL_CONFIG.value.temperatureColors.show;

    if (
        key &&
        key === lastAnimationKey.value &&
        (isAnimating.value || safeDatasetCopy.value.length === ds.length)
    ) {
        return;
    }

    stopAnimation();

    if (
        gradientPathEnabled ||
        !cfg.show ||
        loading.value ||
        ds.length <= 1 ||
        prefersReducedMotion.value
    ) {
        safeDatasetCopy.value = ds;
        lastAnimationKey.value = key;
        return;
    }

    isAnimating.value = true;
    lastAnimationKey.value = key;
    safeDatasetCopy.value = [];

    const frames = Math.max(1, Number(cfg.animationFrames) || 1);
    const delay = Math.max(1, Math.floor(frames / ds.length));
    let i = 0;

    const tick = () => {
        if (key !== animationKey.value) {
            stopAnimation();
            return;
        }
        if (i < ds.length) {
            safeDatasetCopy.value.push(ds[i]);
            const t = setTimeout(() => {
                rafId.value = requestAnimationFrame(tick);
            }, delay);
            timeoutIds.value.push(t);
            i += 1;
        } else {
            safeDatasetCopy.value = ds;
            stopAnimation();
        }
    };

    rafId.value = requestAnimationFrame(tick);
}

watch(animationKey, () => {
    animateSL();
});

onMounted(() => {
    prepareChart();
    animateSL();
});

onBeforeUnmount(() => {
    stopAnimation();
});

const pulseInstanceKey = ref(0);

watch(
    () => loading.value,
    async (isLoading) => {
        if (isLoading) return;
        await nextTick();
        pulseInstanceKey.value += 1;
    },
);

watch(
    () => isAnimating.value,
    async (animating) => {
        if (animating) return;
        if (loading.value) return;
        await nextTick();
        pulseInstanceKey.value += 1;
    },
);

const pulsePathId = computed(() => {
    return `sparkline_line_path_${uid.value}`;
});

const pulseMounted = ref(true);

async function restartPulse() {
    pulseMounted.value = false;
    await nextTick();
    pulseMounted.value = true;
    await nextTick();
    updatePulsePathLength();
}

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkline',
            type: 'dataset',
            debug: debug.value,
        });
        manualLoading.value = true; // v3
    } else {
        if (debug.value) {
            props.dataset.forEach((ds, i) => {
                getMissingDatasetAttributes({
                    datasetObject: ds,
                    requiredAttributes: ['period', 'value'],
                }).forEach((attr) => {
                    error({
                        componentName: 'VueUiSparkline',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: i,
                    });
                });
            });
        }
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: sparklineChart.value,
                title:
                    cfgStyle.value.title.show && props.showInfo
                        ? chartTitle.value
                        : null,
                source: source.value,
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
                svg.value.chartWidth =
                    (cfgStyle.value.chartWidth / 500) * width;
                svg.value.padding = (props.forcedPadding / 500) * width;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = sparklineChart.value.parentNode;
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

const svg = ref({
    height: 80 * props.heightRatio,
    width: 500,
    chartWidth: cfgStyle.value.chartWidth,
    padding: props.forcedPadding,
});

const emits = defineEmits(['hoverIndex', 'selectDatapoint']);

const drawingArea = computed(() => {
    const {
        top: p_top,
        right: p_right,
        bottom: p_bottom,
        left: p_left,
    } = cfgStyle.value.padding;
    return {
        top: p_top,
        left: p_left,
        right: svg.value.width - p_right,
        bottom: svg.value.height - p_bottom,
        start:
            props.showInfo &&
            cfgLabel.value.show &&
            cfgLabel.value.position === 'left'
                ? svg.value.width - svg.value.chartWidth + p_left
                : svg.value.padding + p_left,
        width:
            props.showInfo && cfgLabel.value.show
                ? svg.value.chartWidth - p_left - p_right
                : svg.value.width - svg.value.padding - p_left - p_right,
        height: svg.value.height - p_top - p_bottom,
    };
});

const min = computed(() => {
    if (![null, undefined].includes(cfgStyle.value.scaleMin)) {
        return cfgStyle.value.scaleMin;
    } else {
        return Math.min(
            ...safeDatasetCopy.value.map((s) =>
                isNaN(s.value) ||
                [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(
                    s.value,
                )
                    ? 0
                    : s.value || 0,
            ),
        );
    }
});

const max = computed(() => {
    if (![null, undefined].includes(cfgStyle.value.scaleMax)) {
        return cfgStyle.value.scaleMax;
    } else {
        return Math.max(
            ...safeDatasetCopy.value.map((s) =>
                isNaN(s.value) ||
                [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(
                    s.value,
                )
                    ? 0
                    : s.value || 0,
            ),
        );
    }
});

const absoluteMin = computed(() => {
    const num = min.value >= 0 ? 0 : min.value;
    return Math.abs(num);
});

const absoluteMax = computed(() => {
    return max.value + absoluteMin.value;
});

const absoluteZero = computed(() => {
    return (
        drawingArea.value.bottom -
        drawingArea.value.height * ratioToMax(absoluteMin.value)
    );
});

function ratioToMax(v) {
    return isNaN(v / absoluteMax.value) ? 0 : v / absoluteMax.value;
}

const len = computed(() => downsampled.value.length - 1 || 1);

const timeLabels = ref([]);

let timeLabelsRequestId = 0;
watchEffect(() => {
    const requestId = ++timeLabelsRequestId;

    (async () => {
        const labels = await useTimeLabels({
            values: downsampled.value.map((d) => d.period),
            maxDatapoints: downsampled.value.length,
            formatter: cfgLabel.value.datetimeFormatter,
            start: 0,
            end: downsampled.value.length,
        });

        if (requestId === timeLabelsRequestId) {
            timeLabels.value = labels;
        }
    })();
});

const mutableDataset = computed(() => {
    return safeDatasetCopy.value.map((s, i) => {
        const absoluteValue =
            isNaN(s.value) ||
            [undefined, 'NaN', NaN, Infinity, -Infinity].includes(s.value)
                ? 0
                : s.value;
        const width = drawingArea.value.width / len.value;
        return {
            value: s.value,
            absoluteValue,
            period:
                timeLabels.value &&
                timeLabels.value[i] &&
                timeLabels.value[i].text
                    ? timeLabels.value[i].text
                    : s.period,
            plotValue: absoluteValue + absoluteMin.value,
            toMax: ratioToMax(absoluteValue + absoluteMin.value),
            sourceIndex: i,
            x: drawingArea.value.start + i * width,
            y:
                drawingArea.value.bottom -
                drawingArea.value.height *
                    ratioToMax(absoluteValue + absoluteMin.value),
            id: `plot_${uid.value}_${i}`,
            color: isBar.value
                ? cfgBar.value.color
                : cfgArea.value.useGradient
                  ? shiftHue(cfgLine.value.color, 0.05 * (1 - i / len.value))
                  : cfgLine.value.color,
            width,
        };
    });
});

const currentSelectedIndex = computed(() => {
    if (
        props.selectedIndex !== undefined &&
        props.selectedIndex !== null &&
        props.selectedIndex >= 0 &&
        props.selectedIndex < mutableDataset.value.length
    ) {
        return props.selectedIndex;
    }

    if (
        internalSelectedIndex.value !== undefined &&
        internalSelectedIndex.value !== null &&
        internalSelectedIndex.value >= 0 &&
        internalSelectedIndex.value < mutableDataset.value.length
    ) {
        return internalSelectedIndex.value;
    }

    return null;
});

const selectedPlot = ref(undefined);
const previousSelectedPlot = ref(undefined);

function selectPlot(plot, index) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: plot,
            seriesIndex: index,
        });
    }

    internalSelectedIndex.value = index;
    activeTooltipIndex.value = index;
    selectedPlot.value = plot;

    if (!previousSelectedPlot.value) {
        previousSelectedPlot.value = plot;
    }

    emits('hoverIndex', { index });
}

function unselectPlot(plot, index) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: plot,
            seriesIndex: index,
        });
    }

    previousSelectedPlot.value = selectedPlot.value;
    selectedPlot.value = undefined;
    internalSelectedIndex.value = null;
    activeTooltipIndex.value = null;
    emits('hoverIndex', { index: undefined });
}

const dataLabelValues = computed(() => {
    if (!isDataset.value) {
        return {
            latest: null,
            sum: null,
            average: null,
            median: null,
            trend: null,
        };
    } else {
        const ds = mutableDataset.value.map((m) => m.absoluteValue);
        const sum = ds.reduce((a, b) => a + b, 0);
        return {
            latest: mutableDataset.value[mutableDataset.value.length - 1]
                ? mutableDataset.value[mutableDataset.value.length - 1]
                      .absoluteValue
                : 0,
            sum,
            average: sum / mutableDataset.value.length,
            median: calcMedian(ds),
            trend: calcLinearProgression(
                mutableDataset.value.map(({ x, y, absoluteValue }) => {
                    return {
                        x,
                        y,
                        value: absoluteValue,
                    };
                }),
            ).trend,
        };
    }
});

const dataLabel = computed(() => {
    if (!isDataset.value) {
        return 0;
    }
    if (cfgLabel.value.valueType === 'latest') {
        return dataLabelValues.value.latest;
    } else if (cfgLabel.value.valueType === 'sum') {
        return dataLabelValues.value.sum;
    } else if (cfgLabel.value.valueType === 'average') {
        return dataLabelValues.value.average;
    } else {
        return 0;
    }
});

const isBar = computed(() => {
    return FINAL_CONFIG.value.type && FINAL_CONFIG.value.type === 'bar';
});

function selectDatapoint(datapoint, index) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint,
            seriesIndex: index,
        });
    }
    emits('selectDatapoint', { datapoint, index });
}

const lineCutNullValues = computed(() => {
    return cfgLine.value.cutNullValues;
});

function canShowPlotValue(value) {
    return ![null, undefined, 'NaN', NaN, Infinity, -Infinity].includes(value);
}

function isPlotAlone(plot, plotIndex) {
    const before = plot[plotIndex - 1];
    const after = plot[plotIndex + 1];

    const isAlone =
        (!!before && !!after && before.value == null && after.value == null) ||
        (!before && !!after && after.value == null) ||
        (!!before && !after && before.value == null);

    return (
        canShowPlotValue(plot[plotIndex]?.value) &&
        isAlone &&
        lineCutNullValues.value
    );
}

function isSelectedPlot(plot, plotIndex) {
    return (
        (selectedPlot.value && plot.id === selectedPlot.value.id) ||
        currentSelectedIndex.value === plotIndex ||
        FINAL_DATASET.value.length === 1
    );
}

function shouldShowPlotCircle(plot, plotIndex) {
    if (isBar.value || !canShowPlotValue(plot?.value)) {
        return false;
    }
    return (
        (cfgStyle.value.plot.show && isSelectedPlot(plot, plotIndex)) ||
        isPlotAlone(mutableDataset.value, plotIndex)
    );
}

function getPlotRadius(plot, plotIndex) {
    return Math.max(
        1,
        isSelectedPlot(plot, plotIndex)
            ? cfgStyle.value.plot.radius
            : cfgStyle.value.plot.radius * 0.7,
    );
}

function getPlotStroke(plot, plotIndex) {
    return isSelectedPlot(plot, plotIndex)
        ? cfgStyle.value.plot.stroke
        : cfgStyle.value.backgroundColor;
}

const lineDataset = computed(() => {
    return lineCutNullValues.value
        ? mutableDataset.value
        : mutableDataset.value.filter((plot) => plot.value !== null);
});

const explicitDashIndices = computed(() => {
    return Array.isArray(cfgLine.value.dashIndices)
        ? cfgLine.value.dashIndices
              .map((index) => Math.trunc(Number(index)))
              .filter(Number.isFinite)
        : [];
});

const explicitDashIndexSet = computed(() => {
    return new Set(explicitDashIndices.value);
});

function edgeContainsDashedPoint(previousPlot, plot) {
    const previousSourceIndex = previousPlot?.sourceIndex;
    const sourceIndex = plot?.sourceIndex;

    if (
        !Number.isFinite(previousSourceIndex) ||
        !Number.isFinite(sourceIndex)
    ) {
        return false;
    }

    const minIndex = Math.min(previousSourceIndex, sourceIndex);
    const maxIndex = Math.max(previousSourceIndex, sourceIndex);

    for (const dashedIndex of explicitDashIndices.value) {
        if (dashedIndex >= minIndex && dashedIndex <= maxIndex) {
            return true;
        }
    }

    return false;
}

function getUserDashedEdgeStarts(dataset) {
    const dashedStarts = new Set();

    for (let i = 1; i < dataset.length; i += 1) {
        if (edgeContainsDashedPoint(dataset[i - 1], dataset[i])) {
            dashedStarts.add(i - 1);
        }
    }

    return dashedStarts;
}

function getNullDashedEdgeStarts(dataset) {
    const dashedStarts = new Set();

    if (lineCutNullValues.value || !cfgLine.value.nullDashes?.show) {
        return dashedStarts;
    }

    for (let i = 1; i < dataset.length; i += 1) {
        const previousSourceIndex = dataset[i - 1]?.sourceIndex;
        const sourceIndex = dataset[i]?.sourceIndex;

        if (
            Number.isFinite(previousSourceIndex) &&
            Number.isFinite(sourceIndex) &&
            Math.abs(sourceIndex - previousSourceIndex) > 1
        ) {
            dashedStarts.add(i - 1);
        }
    }

    return dashedStarts;
}

const userDashedEdgeStarts = computed(() => {
    if (lineCutNullValues.value) return new Set();
    return getUserDashedEdgeStarts(lineDataset.value);
});

const nullDashedEdgeStarts = computed(() => {
    return getNullDashedEdgeStarts(lineDataset.value);
});

const dashedEdgeStarts = computed(() => {
    return new Set([
        ...userDashedEdgeStarts.value,
        ...nullDashedEdgeStarts.value,
    ]);
});

const visibleDashIndices = computed(() => {
    if (!lineCutNullValues.value) return [];

    return mutableDataset.value.reduce((indices, plot, localIndex) => {
        if (explicitDashIndexSet.value.has(plot.sourceIndex)) {
            indices.push(localIndex);
        }
        return indices;
    }, []);
});

const hasDashedSegments = computed(() => {
    if (lineCutNullValues.value) {
        return visibleDashIndices.value.length > 0;
    }

    return dashedEdgeStarts.value.size > 0;
});

const lineValidDataset = computed(() => {
    return mutableDataset.value.filter((plot) => plot.value !== null);
});

const hasEnoughLineValues = computed(() => {
    return lineValidDataset.value.length > 1;
});

const smoothLinePath = computed(() => {
    if (isBar.value || !hasEnoughLineValues.value) return '';

    return lineCutNullValues.value
        ? createSmoothPathWithCuts(mutableDataset.value)
        : createSmoothPath(lineDataset.value);
});

const straightLinePath = computed(() => {
    if (isBar.value || !hasEnoughLineValues.value) return '';

    return lineCutNullValues.value
        ? createStraightPathWithCuts(mutableDataset.value)
        : createStraightPath(lineDataset.value);
});

const dashedSmoothSegments = computed(() => {
    if (isBar.value || !hasDashedSegments.value || !hasEnoughLineValues.value) {
        return [];
    }

    return lineCutNullValues.value
        ? createSmoothPathWithCutsSegments(
              mutableDataset.value,
              visibleDashIndices.value,
          )
        : createSmoothSegmentsByEdgeStarts(
              lineDataset.value,
              dashedEdgeStarts.value,
          );
});

const dashedStraightSegments = computed(() => {
    if (isBar.value || !hasDashedSegments.value || !hasEnoughLineValues.value) {
        return [];
    }

    return lineCutNullValues.value
        ? createStraightPathWithCutsSegments(
              mutableDataset.value,
              visibleDashIndices.value,
          )
        : createStraightSegmentsByEdgeStarts(
              lineDataset.value,
              dashedEdgeStarts.value,
          );
});

const lineAreaPaths = computed(() => {
    if (isBar.value || !cfgArea.value.show) return [];
    if (!hasEnoughLineValues.value) return [];

    if (cfgLine.value.smooth) {
        return createSmoothAreaSegments(
            lineDataset.value,
            drawingArea.value.bottom,
            lineCutNullValues.value,
        ).filter(Boolean);
    }

    const areaPath = lineCutNullValues.value
        ? createIndividualAreaWithCuts(
              mutableDataset.value,
              drawingArea.value.bottom,
          )
        : createIndividualArea(lineDataset.value, drawingArea.value.bottom);

    return areaPath
        .split(';')
        .filter(Boolean)
        .map((path) => `M${path}Z`);
});

const gradientSvgPathData = computed(() => {
    if (isBar.value || !FINAL_CONFIG.value.gradientPath.show) return '';
    if (FINAL_CONFIG.value.temperatureColors.show) return '';

    const pathData = cfgLine.value.smooth
        ? smoothLinePath.value
        : straightLinePath.value;

    return `M ${pathData || '0,0'}`;
});

const temperaturePlotColors = computed(() => {
    if (!FINAL_CONFIG.value.temperatureColors.show) return null;
    const colors = FINAL_CONFIG.value.temperatureColors.colors;
    if (!Array.isArray(colors) || !colors.length) return null;
    return colors.map((color) => convertColorToHex(color));
});

const temperatureColors = computed(() => {
    if (!FINAL_CONFIG.value.temperatureColors.show) return null;
    const colors = FINAL_CONFIG.value.temperatureColors.colors;
    if (!Array.isArray(colors) || !colors.length) return null;
    return colors.map((color) => convertColorToHex(color));
});

function getTemperaturePlotRatio(plot) {
    if (!Number.isFinite(plot?.y)) return 0;
    const drawingHeight = drawingArea.value.height || 1;
    const rawRatio = (plot.y - drawingArea.value.top) / drawingHeight;
    return Math.min(1, Math.max(0, rawRatio));
}

function getPlotFillColor(plot) {
    const colors = temperaturePlotColors.value;
    if (!Array.isArray(colors) || !colors.length) {
        return plot.color;
    }
    return interpolateHexColors({
        colors,
        ratio: getTemperaturePlotRatio(plot),
    });
}

watch(
    () => [
        pulseEnabled.value,
        pulsePathId.value,
        mutableDataset.value.length,
        svg.value.width,
        svg.value.height,
        FINAL_CONFIG.value?.style?.line?.smooth,
    ],
    async () => {
        await nextTick();
        updatePulsePathLength();
    },
    { immediate: true },
);

onMounted(async () => {
    await nextTick();
    updatePulsePathLength();
});

watch(
    () => loading.value,
    async (isLoading) => {
        if (isLoading) return;
        await restartPulse();
    },
);

watch(
    () => isAnimating.value,
    async (animating) => {
        if (animating) return;
        if (loading.value) return;
        await restartPulse();
    },
);

watch(
    () => props.selectedIndex,
    (newIndex) => {
        if (newIndex === undefined || newIndex === null) {
            internalSelectedIndex.value = null;
            activeTooltipIndex.value = null;
            selectedPlot.value = undefined;
            return;
        }
        if (newIndex < 0 || newIndex >= mutableDataset.value.length) return;
        const plot = mutableDataset.value[newIndex];
        if (!plot) return;
        internalSelectedIndex.value = newIndex;
        activeTooltipIndex.value = newIndex;
        selectedPlot.value = plot;
    },
);

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
const isFocus = ref(false);

function onSvgFocus() {
    const controlledIndex = currentSelectedIndex.value;
    if (
        controlledIndex !== null &&
        controlledIndex >= 0 &&
        controlledIndex < mutableDataset.value.length
    ) {
        const plot = mutableDataset.value[controlledIndex];

        if (plot) {
            activeTooltipIndex.value = controlledIndex;
            selectedPlot.value = plot;
            internalSelectedIndex.value = controlledIndex;
            isFocus.value = true;
            return;
        }
    }
    activeTooltipIndex.value = null;
    if (!selectedPlot.value && mutableDataset.value.length) {
        selectPlot(
            mutableDataset.value.at(-1),
            mutableDataset.value.length - 1,
        );
    }
    isFocus.value = true;
}

function onSvgBlur() {
    previousSelectedPlot.value = selectedPlot.value;
    if (props.selectedIndex === undefined || props.selectedIndex === null) {
        activeTooltipIndex.value = null;
        selectedPlot.value = undefined;
        internalSelectedIndex.value = null;
        emits('hoverIndex', { index: undefined });
    }
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value) return;
    if (document.activeElement !== svgRef.value) return;
    previousSelectedPlot.value = selectedPlot.value;

    const isLeftArrow = event.key === 'ArrowLeft';
    const isRightArrow = event.key === 'ArrowRight';

    if (!isLeftArrow && !isRightArrow) return;

    const plotCount = mutableDataset.value.length;

    if (!plotCount) return;

    event.preventDefault();
    event.stopPropagation();

    let nextIndex = activeTooltipIndex.value;

    const hasValidActiveIndex =
        nextIndex !== null && nextIndex >= 0 && nextIndex < plotCount;

    const hoveredIndex = selectedPlot.value
        ? mutableDataset.value.findIndex(
              (plot) => plot.id === selectedPlot.value.id,
          )
        : -1;

    const hasValidHoveredIndex =
        hoveredIndex !== null && hoveredIndex >= 0 && hoveredIndex < plotCount;

    if (!hasValidActiveIndex) {
        if (hasValidHoveredIndex) {
            nextIndex = isRightArrow ? hoveredIndex + 1 : hoveredIndex - 1;

            if (nextIndex >= plotCount) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = plotCount - 1;
            }
        } else if (isRightArrow) {
            nextIndex = 0;
        } else {
            nextIndex = plotCount - 1;
        }
    } else if (isRightArrow) {
        nextIndex += 1;
        if (nextIndex >= plotCount) {
            nextIndex = 0;
        }
    } else if (isLeftArrow) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = plotCount - 1;
        }
    }

    const plot = mutableDataset.value[nextIndex];

    if (!plot) return;

    activeTooltipIndex.value = nextIndex;
    selectPlot(plot, nextIndex);
}

const a11yTable = computed(() => {
    const headers = [
        FINAL_CONFIG.value.translations.period,
        FINAL_CONFIG.value.translations.value,
    ];
    const rows = mutableDataset.value.map((d) => [d.period, d.absoluteValue]);
    return { headers, rows };
});
</script>

<template>
    <div
        ref="sparklineChart"
        class="vue-data-ui-component vue-ui-sparkline"
        :id="uid"
        :style="`width:100%;font-family:${cfgStyle.fontFamily};`"
    >
        <p :id="`chart-instructions-${uid}`" class="sr-only">
            {{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}
        </p>

        <A11yDataTable
            v-if="a11yTable?.rows?.length"
            :uid="uid"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <!-- SLOT BEFORE -->
        <slot
            name="before"
            v-bind="{
                selected: selectedPlot,
                latest: dataLabelValues.latest,
                sum: dataLabelValues.sum,
                average: dataLabelValues.average,
                median: dataLabelValues.median,
                trend: dataLabelValues.trend,
            }"
        />

        <!-- TITLE -->
        <div
            data-cy="title"
            ref="chartTitle"
            v-if="cfgStyle.title.show && showInfo"
            class="vue-ui-sparkline-title"
            :style="`display:flex;align-items:center;width:100%;color:${cfgStyle.title.color};background:${cfgStyle.backgroundColor};justify-content:${cfgStyle.title.textAlign === 'left' ? 'flex-start' : cfgStyle.title.textAlign === 'right' ? 'flex-end' : 'center'};height:${cfgStyle.title.fontSize * 2}px;font-size:${cfgStyle.title.fontSize}px;font-weight:${cfgStyle.title.bold ? 'bold' : 'normal'};`"
        >
            <span
                data-cy="sparkline-period-label"
                :style="`padding:${cfgStyle.title.textAlign === 'left' ? '0 0 0 12px' : cfgStyle.title.textAlign === 'right' ? '0 12px 0 0' : '0'}`"
            >
                {{ selectedPlot ? selectedPlot.period : cfgStyle.title.text }}
            </span>
        </div>

        <!-- CHART -->
        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                data-cy="sparkline-svg"
                :viewBox="`0 0 ${svg.width} ${svg.height}`"
                :style="`background:${cfgStyle.backgroundColor};overflow:visible;direction:ltr`"
                tabindex="0"
                :aria-describedby="`chart-instructions-${uid}`"
                @mouseleave="previousSelectedPlot = undefined"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
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
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <!-- DEFS -->
                <defs>
                    <DefGrad
                        t="linear"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                        :id="`sparkline_gradient_${uid}`"
                        :stops="[
                            [
                                '0%',
                                setOpacity(
                                    shiftHue(cfgArea.color, 0.05),
                                    cfgArea.opacity,
                                ),
                                1,
                            ],
                            [
                                '100%',
                                setOpacity(cfgArea.color, cfgArea.opacity),
                                1,
                            ],
                        ]"
                    />
                    <DefGrad
                        t="linear"
                        x2="0%"
                        y2="100%"
                        :id="`sparkline_bar_gradient_pos_${uid}`"
                        :stops="[
                            ['0%', cfgBar.color, 1],
                            ['100%', shiftHue(cfgBar.color, 0.05), 1],
                        ]"
                    />
                    <DefGrad
                        t="linear"
                        x2="0%"
                        y2="100%"
                        :id="`sparkline_bar_gradient_neg_${uid}`"
                        :stops="[
                            ['0%', shiftHue(cfgBar.color, 0.05), 1],
                            ['100%', cfgBar.color, 1],
                        ]"
                    />

                    <filter
                        :id="`sparkline_pulse_glow_${uid}`"
                        filterUnits="userSpaceOnUse"
                        x="-50"
                        y="-50"
                        width="100"
                        height="100"
                    >
                        <feGaussianBlur
                            in="SourceGraphic"
                            stdDeviation="3"
                            result="blur"
                        />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <linearGradient
                        v-if="
                            FINAL_CONFIG.temperatureColors.show &&
                            !!temperatureColors
                        "
                        :id="`temperature_grad_sparkline_${uid}`"
                        gradientUnits="userSpaceOnUse"
                        x1="0"
                        x2="0"
                        :y1="drawingArea.top"
                        :y2="drawingArea.bottom"
                    >
                        <stop
                            v-for="(color, colorIndex) in temperatureColors"
                            :key="`temperature_grad_stop_${colorIndex}_${uid}`"
                            :stop-color="color"
                            :offset="
                                temperatureColors.length === 1
                                    ? '0%'
                                    : setGradientOffset(
                                          colorIndex,
                                          temperatureColors.length,
                                      )
                            "
                        />
                    </linearGradient>
                </defs>

                <!-- AREA -->
                <g v-if="cfgArea.show && !isBar && lineAreaPaths.length">
                    <path
                        v-for="(
                            lineAreaPath, lineAreaPathIndex
                        ) in lineAreaPaths"
                        :key="`sparkline_area_${lineAreaPathIndex}_${uid}`"
                        class="vue-ui-sparkline-area"
                        :data-cy="
                            cfgLine.smooth
                                ? 'sparkline-smooth-area'
                                : 'sparkline-angle-area'
                        "
                        :d="lineAreaPath"
                        :fill="
                            cfgArea.useGradient
                                ? `url(#sparkline_gradient_${uid})`
                                : setOpacity(cfgArea.color, cfgArea.opacity)
                        "
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :style="{
                            transition: loading ? undefined : 'all 0.2s',
                        }"
                    />
                </g>

                <template v-if="cfgLine.smooth && !isBar">
                    <path
                        :id="pulsePathId"
                        :d="`M ${smoothLinePath || '0,0'}`"
                        fill="none"
                        stroke="transparent"
                        :stroke-width="cfgLine.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                    <template v-if="hasDashedSegments">
                        <path
                            v-for="segment in dashedSmoothSegments"
                            :key="segment.path"
                            class="vue-ui-sparkline-path"
                            data-cy="sparkline-smooth-path"
                            :d="`M ${segment.path}`"
                            :stroke="
                                !!temperatureColors
                                    ? `url(#temperature_grad_sparkline_${uid})`
                                    : cfgLine.color
                            "
                            fill="none"
                            :stroke-width="cfgLine.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :stroke-dasharray="
                                segment.dashed ? cfgLine.dashArray : 0
                            "
                            :style="{
                                transition: loading ? undefined : 'all 0.2s',
                            }"
                        />
                    </template>

                    <path
                        v-else
                        class="vue-ui-sparkline-path"
                        data-cy="sparkline-smooth-path"
                        :d="`M ${smoothLinePath || '0,0'}`"
                        :stroke="
                            !!temperatureColors
                                ? `url(#temperature_grad_sparkline_${uid})`
                                : cfgLine.color
                        "
                        fill="none"
                        :stroke-width="cfgLine.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :style="{
                            transition: loading ? undefined : 'all 0.2s',
                        }"
                    />
                </template>

                <template v-if="!cfgLine.smooth && !isBar">
                    <path
                        :id="pulsePathId"
                        :d="`M ${straightLinePath || '0,0'}`"
                        fill="none"
                        stroke="transparent"
                        :stroke-width="cfgLine.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />

                    <template v-if="hasDashedSegments">
                        <path
                            v-for="segment in dashedStraightSegments"
                            :key="segment.path"
                            class="vue-ui-sparkline-path"
                            data-cy="sparkline-straight-line"
                            :d="`M ${segment.path}`"
                            :stroke="
                                !!temperatureColors
                                    ? `url(#temperature_grad_sparkline_${uid})`
                                    : cfgLine.color
                            "
                            fill="none"
                            :stroke-width="cfgLine.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :stroke-dasharray="
                                segment.dashed ? cfgLine.dashArray * 2 : 0
                            "
                            :style="{
                                transition: loading ? undefined : 'all 0.2s',
                            }"
                        />
                    </template>

                    <path
                        v-else
                        class="vue-ui-sparkline-path"
                        data-cy="sparkline-straight-line"
                        :d="`M ${straightLinePath || '0,0'}`"
                        :stroke="
                            !!temperatureColors
                                ? `url(#temperature_grad_sparkline_${uid})`
                                : cfgLine.color
                        "
                        fill="none"
                        :stroke-width="cfgLine.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :style="{
                            transition: loading ? undefined : 'all 0.2s',
                        }"
                    />
                </template>

                <SparklineGradientPath
                    v-if="gradientSvgPathData && !temperatureColors"
                    :svgPathData="gradientSvgPathData"
                    :enabled="
                        FINAL_CONFIG.gradientPath.show &&
                        !isBar &&
                        !temperatureColors
                    "
                    :strokeWidth="cfgLine.strokeWidth"
                    :highColor="FINAL_CONFIG.gradientPath.colors.high"
                    :lowColor="FINAL_CONFIG.gradientPath.colors.low"
                    :segments="FINAL_CONFIG.gradientPath.segments"
                />

                <SparklinePulse
                    v-if="pulseMounted && pulseEnabled"
                    :uid="uid"
                    :svgRef="svgRef"
                    :pulsePathId="pulsePathId"
                    :pulsePathLength="pulsePathLength"
                    :pulseDur="pulseDur"
                    :pulseBegin="pulseBegin"
                    :pulseRepeatCount="pulseRepeatCount"
                    :pulseFillMode="pulseFillMode"
                    :pulseKeyPoints="pulseKeyPoints"
                    :pulseMotion="pulseMotion"
                    :pulse="pulse"
                    :pulseTrail="pulseTrail"
                    :pulseTrailLength="pulseTrailLength"
                    :prefersReducedMotion="prefersReducedMotion"
                    :loading="loading"
                    :isBar="isBar"
                />

                <g v-for="(plot, i) in mutableDataset">
                    <rect
                        data-cy="datapoint-bar"
                        v-if="isBar"
                        :x="plot.x - plot.width / 2"
                        :y="
                            isNaN(
                                plot.absoluteValue > 0 ? plot.y : absoluteZero,
                            )
                                ? 0
                                : plot.absoluteValue > 0
                                  ? plot.y
                                  : absoluteZero
                        "
                        :width="plot.width"
                        :height="
                            isNaN(Math.abs(plot.y - absoluteZero))
                                ? 0
                                : Math.abs(plot.y - absoluteZero)
                        "
                        :fill="
                            plot.absoluteValue > 0
                                ? `url(#sparkline_bar_gradient_pos_${uid})`
                                : `url(#sparkline_bar_gradient_neg_${uid})`
                        "
                        :rx="cfgBar.borderRadius"
                    />
                    <!-- VERTICAL INDICATORS -->
                    <line
                        data-cy="selection-indicator"
                        v-if="
                            cfgStyle.verticalIndicator.show &&
                            ((selectedPlot && plot.id === selectedPlot.id) ||
                                currentSelectedIndex === i)
                        "
                        :x1="plot.x"
                        :x2="plot.x"
                        :y1="drawingArea.top - 6"
                        :y2="drawingArea.bottom"
                        :stroke="cfgStyle.verticalIndicator.color || plot.color"
                        :stroke-width="cfgStyle.verticalIndicator.strokeWidth"
                        stroke-linecap="round"
                        :stroke-dasharray="
                            cfgStyle.verticalIndicator.strokeDasharray || 0
                        "
                    />
                </g>

                <!-- ZERO BASE -->
                <line
                    data-cy="sparkline-zero-axis"
                    v-if="min < 0"
                    :x1="drawingArea.start"
                    :x2="drawingArea.start + drawingArea.width"
                    :y1="forceValidValue(absoluteZero, drawingArea.bottom)"
                    :y2="forceValidValue(absoluteZero, drawingArea.bottom)"
                    :stroke="cfgStyle.zeroLine.color"
                    :stroke-dasharray="cfgStyle.zeroLine.strokeWidth * 2"
                    :stroke-width="cfgStyle.zeroLine.strokeWidth"
                    stroke-linecap="round"
                />

                <!-- PLOTS -->
                <g
                    v-for="(plot, plotIndex) in mutableDataset"
                    :key="`sparkline_plot_${plot.id}`"
                >
                    <circle
                        data-cy="selection-plot"
                        v-if="shouldShowPlotCircle(plot, plotIndex)"
                        :cx="plot.x"
                        :cy="plot.y"
                        :r="getPlotRadius(plot, plotIndex)"
                        :fill="getPlotFillColor(plot)"
                        :stroke="getPlotStroke(plot, plotIndex)"
                        :stroke-width="cfgStyle.plot.strokeWidth"
                    />
                </g>

                <!-- DATALABEL -->
                <text
                    v-if="showInfo && cfgLabel.show"
                    data-cy="sparkline-datalabel"
                    :x="
                        cfgLabel.position === 'left'
                            ? 12 + cfgLabel.offsetX
                            : drawingArea.width + 12 + cfgLabel.offsetX
                    "
                    :y="
                        svg.height / 2 +
                        cfgLabel.fontSize / 2.5 +
                        cfgLabel.offsetY
                    "
                    :font-size="cfgLabel.fontSize"
                    :font-weight="cfgLabel.bold ? 'bold' : 'normal'"
                    :fill="cfgLabel.color"
                >
                    {{
                        selectedPlot
                            ? applyDataLabel(
                                  cfgLabel.formatter,
                                  selectedPlot.absoluteValue,
                                  dl({
                                      p: cfgLabel.prefix,
                                      v: selectedPlot.absoluteValue,
                                      s: cfgLabel.suffix,
                                      r: cfgLabel.roundingValue,
                                  }),
                                  { datapoint: selectedPlot },
                              )
                            : applyDataLabel(
                                  cfgLabel.formatter,
                                  dataLabel,
                                  dl({
                                      p: cfgLabel.prefix,
                                      v: dataLabel,
                                      s: cfgLabel.suffix,
                                      r: cfgLabel.roundingValue,
                                  }),
                              )
                    }}
                </text>

                <!-- MOUSE TRAP -->
                <rect
                    v-for="(plot, i) in mutableDataset"
                    data-cy="tooltip-trap"
                    :x="
                        plot.x -
                        (drawingArea.width / (len + 1) > svg.padding
                            ? svg.padding
                            : drawingArea.width / (len + 1)) /
                            2
                    "
                    :y="drawingArea.top - 6"
                    :height="drawingArea.height + 6"
                    :width="
                        drawingArea.width / (len + 1) > svg.padding
                            ? svg.padding
                            : drawingArea.width / (len + 1)
                    "
                    fill="transparent"
                    @mouseenter="() => selectPlot(plot, i)"
                    @mouseleave="() => unselectPlot(plot, i)"
                    @click="() => selectDatapoint(plot, i)"
                />
                <slot
                    name="svg"
                    :svg="{
                        ...svg,
                        drawingArea,
                        timeLabels,
                        series: mutableDataset,
                        hoveredIndex: activeTooltipIndex,
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

        <SparkTooltip
            v-if="selectedPlot && cfgTooltip.show"
            :x="selectedPlot.x"
            :y="selectedPlot.y"
            :prevX="previousSelectedPlot.x"
            :prevY="previousSelectedPlot.y"
            :offsetY="cfgStyle.plot.radius * 3 + cfgTooltip.offsetY"
            :svgRef="svgRef"
            :background="cfgTooltip.backgroundColor"
            :color="cfgTooltip.color"
            :fontSize="cfgTooltip.fontSize"
            :borderWidth="cfgTooltip.borderWidth"
            :borderColor="cfgTooltip.borderColor"
            :borderRadius="cfgTooltip.borderRadius"
            :backgroundOpacity="cfgTooltip.backgroundOpacity"
        >
            <slot name="tooltip" v-bind="{ ...selectedPlot }">
                {{ selectedPlot.period }}:
                {{
                    applyDataLabel(
                        cfgLabel.formatter,
                        selectedPlot.absoluteValue,
                        dl({
                            p: cfgLabel.prefix,
                            v: selectedPlot.absoluteValue,
                            s: cfgLabel.suffix,
                            r: cfgLabel.roundingValue,
                        }),
                        { datapoint: selectedPlot },
                    )
                }}
            </slot>
        </SparkTooltip>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped>
.vue-ui-sparkline {
    position: relative;
}

.vue-ui-sparkline * {
    transition: unset;
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

@media (prefers-reduced-motion: reduce) {
    .vue-data-ui-component * {
        transition: none !important;
        animation: none !important;
    }
}
</style>

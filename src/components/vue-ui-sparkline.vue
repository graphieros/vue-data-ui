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
    zoomState: {
        type: Object,
        default: null,
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

const selectedPlot = ref(undefined);
const previousSelectedPlot = ref(undefined);
const FINAL_CONFIG = ref(prepareConfig());
const cfgTooltip = computed(() => FINAL_CONFIG.value.style.tooltip);
const cfgBar = computed(() => FINAL_CONFIG.value.style.bar);
const cfgLine = computed(() => FINAL_CONFIG.value.style.line);
const cfgArea = computed(() => FINAL_CONFIG.value.style.area);
const cfgLabel = computed(() => FINAL_CONFIG.value.style.dataLabel);
const cfgStyle = computed(() => FINAL_CONFIG.value.style);
const cfgZoom = computed(() => FINAL_CONFIG.value.style.zoom);

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

const zoomRange = ref({ start: 0, end: null });
const isZoomSelecting = ref(false);
const isPointerFocused = ref(false);
const isZoomTransitioning = ref(false);
const zoomVisualTransform = ref('matrix(1, 0, 0, 1, 0, 0)');
const zoomVisualTransitionEnabled = ref(false);
const ZOOM_TRANSITION_DURATION = 280;
let zoomTransitionFrameId = 0;
let zoomTransitionFrameId2 = 0;
let zoomTransitionTimeoutId = 0;
let zoomTransitionToken = 0;
const zoomStartX = ref(null);
const zoomCurrentX = ref(null);
const ignoreNextDatapointClick = ref(false);
const lastZoomTap = ref({ time: 0, x: 0, y: 0, pointerType: null });

const zoomBounds = computed(() => {
    const total = FINAL_DATASET.value.length;
    if (!total) {
        return { start: 0, end: -1 };
    }

    const start = Math.min(Math.max(0, zoomRange.value.start || 0), total - 1);
    const end = Math.min(
        Math.max(
            start,
            zoomRange.value.end == null ? total - 1 : zoomRange.value.end,
        ),
        total - 1,
    );

    return { start, end };
});

const isZoomed = computed(() => {
    const total = FINAL_DATASET.value.length;
    if (!total) return false;
    return zoomBounds.value.start > 0 || zoomBounds.value.end < total - 1;
});

const visibleRawDataset = computed(() => {
    const { start, end } = zoomBounds.value;
    if (end < start) return [];
    return FINAL_DATASET.value
        .slice(start, end + 1)
        .map((datapoint, index) => ({
            ...datapoint,
            __sourceIndex: start + index,
        }));
});

const downsampled = computed(() => {
    return largestTriangleThreeBucketsArrayObjects({
        data: visibleRawDataset.value,
        threshold: FINAL_CONFIG.value.downsample.threshold,
    });
});

const isFlatTemperature = computed(() => {
    if (!FINAL_CONFIG.value.temperatureColors.show) return false;

    const visibleValues = visibleRawDataset.value
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

        // A zoom range belongs to the dataset it was created from.
        // When the dataset changes, always return to the full new dataset,
        // even when zoomState is controlled/shared by the parent.
        cancelZoomSelection();
        stopZoomVisualTransition();

        lastZoomTap.value = {
            time: 0,
            x: 0,
            y: 0,
            pointerType: null,
        };

        zoomRange.value = {
            start: 0,
            end: null,
        };

        clearHoverSelection();

        safeDatasetCopy.value = largestTriangleThreeBucketsArrayObjects({
            data: visibleRawDataset.value.map((d) => {
                return {
                    ...d,
                    value: ![undefined].includes(d.value) ? d.value : null,
                };
            }),
            threshold: FINAL_CONFIG.value.downsample.threshold,
        });

        const resetState = getCommittedZoomState();
        emits('update:zoomState', resetState);
        emits('zoomReset', resetState);
    },
    { deep: true },
);

const safeDatasetCopy = ref(prepareDsCopy());

function prepareDsCopy() {
    return largestTriangleThreeBucketsArrayObjects({
        data: visibleRawDataset.value.map((d) => {
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
let skipNextZoomAnimation = false;

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

function skipAnimationForNextZoomMutation() {
    skipNextZoomAnimation = true;
    // If an animation is currently running, stop it immediately so the zoomed range is never rendered through the previous animation sequence.
    stopAnimation();
}

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
    if (skipNextZoomAnimation) {
        skipNextZoomAnimation = false;
        stopAnimation();
        safeDatasetCopy.value = downsampled.value || [];
        lastAnimationKey.value = animationKey.value;
        return;
    }
    animateSL();
});

onMounted(() => {
    prepareChart();
    animateSL();
});

onBeforeUnmount(() => {
    stopAnimation();
    stopZoomVisualTransition();
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

const emits = defineEmits([
    'hoverIndex',
    'selectDatapoint',
    'zoom',
    'zoomReset',
    'update:zoomState',
]);

/**
 * Sparkline stores its internal zoom with an inclusive end index because
 * visibleRawDataset uses slice(start, end + 1).
 *
 * The public zoomState model intentionally uses the same convention as the
 * other synchronized chart components: start is inclusive, end is exclusive.
 */
function getCommittedZoomState() {
    const total = FINAL_DATASET.value.length;
    if (!total) return { start: 0, end: 0 };
    const { start, end } = zoomBounds.value;
    return { start, end: end + 1 };
}

function normalizeZoomState(state, fallback = getCommittedZoomState()) {
    if (!state || typeof state !== 'object') return null;

    const hasStart = state.start !== undefined && state.start !== null;
    const hasEnd = state.end !== undefined && state.end !== null;

    if (!hasStart && !hasEnd) return null;

    const start = hasStart ? Number(state.start) : Number(fallback.start);
    const end = hasEnd ? Number(state.end) : Number(fallback.end);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return null;
    }

    return { start, end };
}

function normalizeZoomStateToDataset(state) {
    const normalized = normalizeZoomState(state);
    if (!normalized) return null;

    const total = FINAL_DATASET.value.length;

    if (!total) {
        return { start: 0, end: 0 };
    }

    const start = Math.max(
        0,
        Math.min(Math.trunc(normalized.start), total - 1),
    );

    const end = Math.max(
        start + 1,
        Math.min(Math.trunc(normalized.end), total),
    );

    return { start, end };
}

function applyZoomState(
    state,
    { skipAnimation = true, transition = false } = {},
) {
    const normalized = normalizeZoomStateToDataset(state);
    if (!normalized) return null;

    const current = getCommittedZoomState();

    if (normalized.start !== current.start || normalized.end !== current.end) {
        cancelZoomSelection();
        lastZoomTap.value = {
            time: 0,
            x: 0,
            y: 0,
            pointerType: null,
        };

        const inclusiveRange = {
            start: normalized.start,
            end:
                normalized.end > normalized.start
                    ? normalized.end - 1
                    : normalized.start,
        };

        if (transition) {
            applyZoomRangeWithTransition(inclusiveRange);
        } else {
            if (skipAnimation) {
                skipAnimationForNextZoomMutation();
            }

            zoomRange.value = inclusiveRange;
        }

        clearHoverSelection();
    }

    return getCommittedZoomState();
}

function emitZoomState(state = getCommittedZoomState()) {
    const normalized = normalizeZoomStateToDataset(state);
    if (!normalized) return;

    emits('update:zoomState', normalized);
}

function setZoomState(state) {
    const applied = applyZoomState(state, { transition: true });
    if (!applied) return;
    emits('update:zoomState', applied);
}

watch(
    [() => props.zoomState, () => FINAL_DATASET.value.length],
    ([state, total]) => {
        if (!state || total <= 0) return;

        /**
         * When this is the instance from which originated the v-model update, applyZoomState exits
         * immediately because the committed slicer already matches the model.
         */
        applyZoomState(state, { transition: true });
    },
    {
        deep: true,
        immediate: true,
    },
);

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

function normalizeInclusiveZoomRange(range) {
    const total = FINAL_DATASET.value.length;
    if (!total) return { start: 0, end: -1 };

    const start = Math.max(
        0,
        Math.min(Math.trunc(Number(range?.start) || 0), total - 1),
    );
    const rawEnd =
        range?.end === null || range?.end === undefined
            ? total - 1
            : Math.trunc(Number(range.end));

    return {
        start,
        end: Math.max(
            start,
            Math.min(Number.isFinite(rawEnd) ? rawEnd : start, total - 1),
        ),
    };
}

function getZoomScaleForDataset(dataset) {
    const values = (dataset || []).map((datapoint) => {
        const value = datapoint?.value;
        return isNaN(value) ||
            [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(value)
            ? 0
            : value || 0;
    });

    const configuredMin = cfgStyle.value.scaleMin;
    const configuredMax = cfgStyle.value.scaleMax;

    const minValue = ![null, undefined].includes(configuredMin)
        ? configuredMin
        : values.length
          ? Math.min(...values)
          : 0;
    const maxValue = ![null, undefined].includes(configuredMax)
        ? configuredMax
        : values.length
          ? Math.max(...values)
          : 0;

    const absoluteMinValue = Math.abs(minValue >= 0 ? 0 : minValue);
    const absoluteMaxValue = maxValue + absoluteMinValue;

    return {
        absoluteMin: Number.isFinite(absoluteMinValue) ? absoluteMinValue : 0,
        absoluteMax: Number.isFinite(absoluteMaxValue) ? absoluteMaxValue : 0,
    };
}

function getZoomScaleY(value, scale) {
    const ratio =
        scale.absoluteMax === 0
            ? 0
            : (value + scale.absoluteMin) / scale.absoluteMax;

    return drawingArea.value.bottom - drawingArea.value.height * ratio;
}

function getZoomVisualMatrix(
    sourceRange,
    destinationRange,
    sourceScale,
    destinationScale,
) {
    const sourceSpan = Math.max(1, sourceRange.end - sourceRange.start);
    const destinationSpan = Math.max(
        1,
        destinationRange.end - destinationRange.start,
    );
    const left = drawingArea.value.start;
    const width = drawingArea.value.width;

    // Map the target range back into the viewport occupied by the previous
    // range. Animating this matrix to identity creates a real zoom motion.
    const scaleX = sourceSpan / destinationSpan;
    const translateX =
        left +
        (width * (sourceRange.start - destinationRange.start)) /
            destinationSpan -
        scaleX * left;

    const sourceY0 = getZoomScaleY(0, sourceScale);
    const destinationY0 = getZoomScaleY(0, destinationScale);

    let scaleY = 1;
    if (sourceScale.absoluteMax > 0 && destinationScale.absoluteMax > 0) {
        scaleY = sourceScale.absoluteMax / destinationScale.absoluteMax;
    }

    const translateY = destinationY0 - scaleY * sourceY0;

    return `matrix(${scaleX}, 0, 0, ${scaleY}, ${translateX}, ${translateY})`;
}

function getPlotZoomStyle(plot) {
    if (!isZoomTransitioning.value || !plot) {
        return undefined;
    }

    const match = zoomVisualTransform.value.match(
        /^matrix\(([-+\d.eE]+),\s*[-+\d.eE]+,\s*[-+\d.eE]+,\s*([-+\d.eE]+),\s*([-+\d.eE]+),\s*([-+\d.eE]+)\)$/,
    );

    if (!match) {
        return undefined;
    }

    const scaleX = Number(match[1]);
    const scaleY = Number(match[2]);
    const translateX = Number(match[3]);
    const translateY = Number(match[4]);

    if (![scaleX, scaleY, translateX, translateY].every(Number.isFinite)) {
        return undefined;
    }

    // Apply only the positional effect of the zoom matrix to the marker.
    // The circle itself is never scaled, so its radius remains constant.
    const offsetX = (scaleX - 1) * plot.x + translateX;
    const offsetY = (scaleY - 1) * plot.y + translateY;

    return {
        transform: `matrix(1, 0, 0, 1, ${offsetX}, ${offsetY})`,
        transformOrigin: '0 0',
        transformBox: 'view-box',
        transition: zoomVisualTransitionEnabled.value
            ? `transform ${ZOOM_TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
            : 'none',
        willChange: 'transform',
    };
}

function getVerticalIndicatorZoomStyle(plot) {
    if (!isZoomTransitioning.value || !plot) {
        return undefined;
    }

    const match = zoomVisualTransform.value.match(
        /^matrix\(([-+\d.eE]+),\s*[-+\d.eE]+,\s*[-+\d.eE]+,\s*[-+\d.eE]+,\s*([-+\d.eE]+),\s*[-+\d.eE]+\)$/,
    );

    if (!match) {
        return undefined;
    }

    const scaleX = Number(match[1]);
    const translateX = Number(match[2]);

    if (![scaleX, translateX].every(Number.isFinite)) {
        return undefined;
    }

    const offsetX = (scaleX - 1) * plot.x + translateX;

    return {
        transform: `matrix(1, 0, 0, 1, ${offsetX}, 0)`,
        transformOrigin: '0 0',
        transformBox: 'view-box',
        transition: zoomVisualTransitionEnabled.value
            ? `transform ${ZOOM_TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
            : 'none',
        willChange: 'transform',
    };
}

function stopZoomVisualTransition({ resetTransform = true } = {}) {
    zoomTransitionToken += 1;

    if (zoomTransitionFrameId) {
        cancelAnimationFrame(zoomTransitionFrameId);
        zoomTransitionFrameId = 0;
    }
    if (zoomTransitionFrameId2) {
        cancelAnimationFrame(zoomTransitionFrameId2);
        zoomTransitionFrameId2 = 0;
    }
    if (zoomTransitionTimeoutId) {
        clearTimeout(zoomTransitionTimeoutId);
        zoomTransitionTimeoutId = 0;
    }

    zoomVisualTransitionEnabled.value = false;
    isZoomTransitioning.value = false;

    if (resetTransform) {
        zoomVisualTransform.value = 'matrix(1, 0, 0, 1, 0, 0)';
    }
}

async function applyZoomRangeWithTransition(range) {
    const nextRange = normalizeInclusiveZoomRange(range);
    const previousRange = { ...zoomBounds.value };

    if (
        nextRange.start === previousRange.start &&
        nextRange.end === previousRange.end
    ) {
        return;
    }

    stopZoomVisualTransition();

    const animationWasRunning = isAnimating.value;

    // A zoom mutation must not compete with the progressive entrance
    // animation. If zooming happens while it is still running, finish the
    // current geometry immediately and apply this zoom without morphing.
    if (animationWasRunning) {
        stopAnimation();
        safeDatasetCopy.value = downsampled.value || [];
    }

    const previousScale = getZoomScaleForDataset(safeDatasetCopy.value);

    skipAnimationForNextZoomMutation();

    zoomRange.value = {
        start: nextRange.start,
        end: nextRange.end,
    };

    const targetDataset = downsampled.value || [];

    if (
        animationWasRunning ||
        !svgRef.value ||
        loading.value ||
        prefersReducedMotion.value ||
        previousRange.end < previousRange.start ||
        nextRange.end < nextRange.start ||
        targetDataset.length <= 1
    ) {
        safeDatasetCopy.value = targetDataset;
        lastAnimationKey.value = animationKey.value;
        zoomVisualTransform.value = 'matrix(1, 0, 0, 1, 0, 0)';
        return;
    }

    const targetScale = getZoomScaleForDataset(targetDataset);
    const initialTransform = getZoomVisualMatrix(
        nextRange,
        previousRange,
        targetScale,
        previousScale,
    );

    const token = ++zoomTransitionToken;

    isZoomTransitioning.value = true;
    zoomVisualTransitionEnabled.value = false;
    zoomVisualTransform.value = initialTransform;

    // Render the target geometry immediately, but initially place it exactly
    // where that range lived in the previous viewport.
    safeDatasetCopy.value = targetDataset;
    lastAnimationKey.value = animationKey.value;

    await nextTick();
    if (token !== zoomTransitionToken) return;

    zoomTransitionFrameId = requestAnimationFrame(() => {
        zoomTransitionFrameId = 0;
        zoomTransitionFrameId2 = requestAnimationFrame(() => {
            zoomTransitionFrameId2 = 0;
            if (token !== zoomTransitionToken) return;

            zoomVisualTransitionEnabled.value = true;
            zoomVisualTransform.value = 'matrix(1, 0, 0, 1, 0, 0)';

            zoomTransitionTimeoutId = setTimeout(async () => {
                zoomTransitionTimeoutId = 0;
                if (token !== zoomTransitionToken) return;

                zoomVisualTransitionEnabled.value = false;
                isZoomTransitioning.value = false;
                await restartPulse();
            }, ZOOM_TRANSITION_DURATION);
        });
    });
}

const zoomSelectionRect = computed(() => {
    if (
        !isZoomSelecting.value ||
        zoomStartX.value == null ||
        zoomCurrentX.value == null
    ) {
        return null;
    }

    const x = Math.min(zoomStartX.value, zoomCurrentX.value);
    const width = Math.abs(zoomCurrentX.value - zoomStartX.value);

    return {
        x,
        width,
        y: 0,
        height: svg.value.height,
    };
});

function getSvgX(event) {
    const el = svgRef.value;
    if (!el) return null;

    const ctm = el.getScreenCTM?.();
    if (ctm && typeof el.createSVGPoint === 'function') {
        const point = el.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        return point.matrixTransform(ctm.inverse()).x;
    }

    const rect = el.getBoundingClientRect?.();
    if (!rect?.width) return null;
    return ((event.clientX - rect.left) / rect.width) * svg.value.width;
}

function clampZoomX(x) {
    return Math.min(
        Math.max(x, drawingArea.value.start),
        drawingArea.value.start + drawingArea.value.width,
    );
}

function clearHoverSelection() {
    previousSelectedPlot.value = selectedPlot.value;
    selectedPlot.value = undefined;
    internalSelectedIndex.value = null;
    activeTooltipIndex.value = null;
    emits('hoverIndex', { index: undefined });
}

function cancelZoomSelection(event) {
    if (
        event?.pointerId != null &&
        svgRef.value?.hasPointerCapture?.(event.pointerId)
    ) {
        svgRef.value.releasePointerCapture(event.pointerId);
    }
    isZoomSelecting.value = false;
    zoomStartX.value = null;
    zoomCurrentX.value = null;
}

function resetZoom(event) {
    if (!isZoomed.value && !isZoomSelecting.value) return;
    cancelZoomSelection(event);
    lastZoomTap.value = { time: 0, x: 0, y: 0, pointerType: null };
    applyZoomRangeWithTransition({
        start: 0,
        end: Math.max(0, FINAL_DATASET.value.length - 1),
    });
    clearHoverSelection();
    // The model uses an exclusive end, so a full reset is [0, total).
    emits('update:zoomState', getCommittedZoomState());
    emits('zoomReset');
}

function resetZoomFromButtonPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;

    // Keep focus on the chart so the SVG blur handler cannot mutate shared
    // selection state before the zoom-out transition is initialized.
    event.preventDefault();
    event.stopPropagation();
    resetZoom();
}

function resetZoomFromButtonClick(event) {
    // Pointer activation is handled on pointerdown above. A keyboard-generated
    // button click has detail === 0, so preserve normal Enter/Space access.
    if (event.detail === 0) {
        resetZoom();
    }
}

function resetZoomFromDoubleTap(event) {
    if (!cfgZoom.value.show) return;
    if (!isZoomed.value || !event) return false;

    const now = Date.now();
    const pointerType = event.pointerType || 'mouse';
    const last = lastZoomTap.value;
    const maxDelay = pointerType === 'touch' ? 450 : 350;
    const maxDistance = pointerType === 'touch' ? 28 : 10;
    const distance = Math.hypot(event.clientX - last.x, event.clientY - last.y);

    const isDoubleTap =
        last.time > 0 &&
        last.pointerType === pointerType &&
        now - last.time <= maxDelay &&
        distance <= maxDistance;

    if (!isDoubleTap) {
        lastZoomTap.value = {
            time: now,
            x: event.clientX,
            y: event.clientY,
            pointerType,
        };
        return false;
    }

    ignoreNextDatapointClick.value = true;
    resetZoom(event);
    setTimeout(() => {
        ignoreNextDatapointClick.value = false;
    }, 0);

    return true;
}

function setPointerFocusState(element = svgRef.value) {
    isPointerFocused.value = true;
    element?.classList?.add('vue-ui-sparkline-pointer-focus');
}

function clearPointerFocusState() {
    isPointerFocused.value = false;
    svgRef.value?.classList?.remove('vue-ui-sparkline-pointer-focus');
}

function onZoomPointerDown(event) {
    if (event.button !== undefined && event.button !== 0) return;

    // Mark pointer-origin focus synchronously so a click never flashes the
    // keyboard accessibility outline. This applies even when zoom is disabled
    // or when the gesture remains a simple click.
    setPointerFocusState(event.currentTarget);

    if (!cfgZoom.value.show) return;
    if (loading.value || visibleRawDataset.value.length < 2) return;

    const x = getSvgX(event);
    if (x == null) return;

    const left = drawingArea.value.start;
    const right = left + drawingArea.value.width;
    if (x < left || x > right) return;

    svgRef.value?.focus?.({ preventScroll: true });

    isZoomSelecting.value = true;
    zoomStartX.value = clampZoomX(x);
    zoomCurrentX.value = clampZoomX(x);
}

function onZoomPointerMove(event) {
    if (!cfgZoom.value.show) return;
    if (!isZoomSelecting.value) return;
    const x = getSvgX(event);
    if (x == null) return;

    zoomCurrentX.value = clampZoomX(x);

    if (
        zoomStartX.value != null &&
        Math.abs(zoomCurrentX.value - zoomStartX.value) >= 2 &&
        !svgRef.value?.hasPointerCapture?.(event.pointerId)
    ) {
        svgRef.value?.setPointerCapture?.(event.pointerId);
    }
}

function onZoomPointerUp(event) {
    if (!cfgZoom.value.show) return;
    if (!isZoomSelecting.value) return;

    const x = getSvgX(event);
    if (x != null) {
        zoomCurrentX.value = clampZoomX(x);
    }

    const startX = zoomStartX.value;
    const endX = zoomCurrentX.value;
    const selectionWidth =
        startX == null || endX == null ? 0 : Math.abs(endX - startX);
    const minimumSelectionWidth = Math.max(4, drawingArea.value.width * 0.01);

    if (selectionWidth < minimumSelectionWidth) {
        if (resetZoomFromDoubleTap(event)) return;
        cancelZoomSelection(event);
        return;
    }

    const left = Math.min(startX, endX);
    const right = Math.max(startX, endX);
    const plotWidth = Math.max(1, drawingArea.value.width);
    const count = visibleRawDataset.value.length;

    const startRatio = (left - drawingArea.value.start) / plotWidth;
    const endRatio = (right - drawingArea.value.start) / plotWidth;
    const localStart = Math.max(
        0,
        Math.min(count - 1, Math.floor(startRatio * (count - 1))),
    );
    const localEnd = Math.max(
        localStart,
        Math.min(count - 1, Math.ceil(endRatio * (count - 1))),
    );

    if (localEnd <= localStart) {
        cancelZoomSelection(event);
        return;
    }

    const absoluteStart = zoomBounds.value.start + localStart;
    const absoluteEnd = zoomBounds.value.start + localEnd;

    applyZoomRangeWithTransition({
        start: absoluteStart,
        end: absoluteEnd,
    });
    lastZoomTap.value = { time: 0, x: 0, y: 0, pointerType: null };
    clearHoverSelection();
    emits('zoom', {
        start: absoluteStart,
        end: absoluteEnd,
    });

    // Keep the legacy zoom event inclusive, but publish the v-model using the
    // cross-component exclusive-end convention.
    emits('update:zoomState', {
        start: absoluteStart,
        end: absoluteEnd + 1,
    });

    ignoreNextDatapointClick.value = true;
    setTimeout(() => {
        ignoreNextDatapointClick.value = false;
    }, 0);

    cancelZoomSelection(event);
}

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

const len = computed(() => safeDatasetCopy.value.length - 1 || 1);

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
    const count = safeDatasetCopy.value.length;
    const lineStep = drawingArea.value.width / len.value;

    // Bar mode uses an explicit interval clamped to the SVG viewBox.
    // This guarantees that the first and last bars can never paint outside
    // the chart, even when padding/chartWidth values create a narrower area.
    const barStart = Math.max(0, drawingArea.value.start);
    const barEnd = Math.min(
        svg.value.width,
        drawingArea.value.right,
        drawingArea.value.start + drawingArea.value.width,
    );
    const barAreaWidth = Math.max(0, barEnd - barStart);
    const barSlotWidth = count > 0 ? barAreaWidth / count : 0;

    return safeDatasetCopy.value.map((s, i) => {
        const absoluteValue =
            isNaN(s.value) ||
            [undefined, 'NaN', NaN, Infinity, -Infinity].includes(s.value)
                ? 0
                : s.value;

        const barX = barStart + i * barSlotWidth;
        const width = isBar.value ? barSlotWidth : lineStep;
        const x = isBar.value
            ? barX + barSlotWidth / 2
            : drawingArea.value.start + i * lineStep;

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
            sourceIndex: s.__sourceIndex ?? i,
            x,
            barX,
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
        props.selectedIndex < FINAL_DATASET.value.length
    ) {
        const localIndex = mutableDataset.value.findIndex(
            (plot) => plot.sourceIndex === props.selectedIndex,
        );
        return localIndex >= 0 ? localIndex : null;
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

function getSourceIndex(plot, fallbackIndex) {
    return Number.isFinite(plot?.sourceIndex)
        ? plot.sourceIndex
        : fallbackIndex;
}

function selectPlot(plot, index) {
    const sourceIndex = getSourceIndex(plot, index);

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: plot,
            seriesIndex: sourceIndex,
        });
    }

    // Keep the visible/local index internally for keyboard navigation.
    internalSelectedIndex.value = index;
    activeTooltipIndex.value = index;
    selectedPlot.value = plot;

    if (!previousSelectedPlot.value) {
        previousSelectedPlot.value = plot;
    }

    // Public/shared selection always refers to the original dataset.
    emits('hoverIndex', { index: sourceIndex });
}

function unselectPlot(plot, index) {
    const sourceIndex = getSourceIndex(plot, index);

    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: plot,
            seriesIndex: sourceIndex,
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
    if (ignoreNextDatapointClick.value) return;

    const sourceIndex = getSourceIndex(datapoint, index);

    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint,
            seriesIndex: sourceIndex,
        });
    }
    emits('selectDatapoint', { datapoint, index: sourceIndex });
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
    [() => props.selectedIndex, () => mutableDataset.value],
    ([newIndex], [previousIndex]) => {
        if (newIndex === undefined || newIndex === null) {
            // mutableDataset can recompute after mount (for example when async
            // time labels settle). In uncontrolled mode, preserve the current
            // hover and rebind it to the freshly computed plot object. Only
            // clear when a previously controlled selectedIndex is removed.
            if (previousIndex !== undefined && previousIndex !== null) {
                internalSelectedIndex.value = null;
                activeTooltipIndex.value = null;
                selectedPlot.value = undefined;
                return;
            }

            const hoveredSourceIndex = selectedPlot.value?.sourceIndex;
            if (
                hoveredSourceIndex === undefined ||
                hoveredSourceIndex === null
            ) {
                return;
            }

            const localIndex = mutableDataset.value.findIndex(
                (plot) => plot.sourceIndex === hoveredSourceIndex,
            );

            if (localIndex < 0) {
                internalSelectedIndex.value = null;
                activeTooltipIndex.value = null;
                selectedPlot.value = undefined;
                return;
            }

            internalSelectedIndex.value = localIndex;
            activeTooltipIndex.value = localIndex;
            selectedPlot.value = mutableDataset.value[localIndex];
            return;
        }

        if (newIndex < 0 || newIndex >= FINAL_DATASET.value.length) return;

        const localIndex = mutableDataset.value.findIndex(
            (plot) => plot.sourceIndex === newIndex,
        );

        if (localIndex < 0) {
            internalSelectedIndex.value = null;
            activeTooltipIndex.value = null;
            selectedPlot.value = undefined;
            return;
        }

        const plot = mutableDataset.value[localIndex];
        if (!plot) return;

        internalSelectedIndex.value = localIndex;
        activeTooltipIndex.value = localIndex;
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
    clearPointerFocusState();
    previousSelectedPlot.value = selectedPlot.value;
    if (props.selectedIndex === undefined || props.selectedIndex === null) {
        activeTooltipIndex.value = null;
        selectedPlot.value = undefined;
        internalSelectedIndex.value = null;
        emits('hoverIndex', { index: undefined });
    }
    isFocus.value = false;
}

defineExpose({
    resetZoom,
    setZoomState,
});

function onSvgKeydown(event) {
    if (!svgRef.value) return;
    if (document.activeElement !== svgRef.value) return;

    clearPointerFocusState();
    previousSelectedPlot.value = selectedPlot.value;

    if (event.key === 'Escape') {
        if (isZoomed.value || isZoomSelecting.value) {
            event.preventDefault();
            event.stopPropagation();
            resetZoom();
        }
        return;
    }

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
                :class="{
                    'vue-ui-sparkline-pointer-focus': isPointerFocused,
                }"
                :xmlns="XMLNS"
                data-cy="sparkline-svg"
                :viewBox="`0 0 ${svg.width} ${svg.height}`"
                :style="{
                    background: cfgStyle.backgroundColor,
                    overflow: 'visible',
                    direction: 'ltr',
                    cursor: !cfgZoom.show
                        ? 'default'
                        : isZoomSelecting
                          ? 'col-resize'
                          : 'crosshair',
                    touchAction: 'pan-y',
                    userSelect: 'none',
                }"
                tabindex="0"
                :aria-describedby="`chart-instructions-${uid}`"
                aria-keyshortcuts="Escape"
                @mouseleave="previousSelectedPlot = undefined"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
                @pointerdown="onZoomPointerDown"
                @pointermove="onZoomPointerMove"
                @pointerup="onZoomPointerUp"
                @pointercancel="cancelZoomSelection"
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

                    <clipPath :id="`sparkline_zoom_clip_${uid}`">
                        <rect
                            :x="drawingArea.start - 4"
                            :y="drawingArea.top - 8"
                            :width="drawingArea.width + 8"
                            :height="drawingArea.height + 16"
                        />
                    </clipPath>
                </defs>

                <g
                    :clip-path="
                        isZoomTransitioning
                            ? `url(#sparkline_zoom_clip_${uid})`
                            : undefined
                    "
                >
                    <g
                        :style="{
                            transform: zoomVisualTransform,
                            transformOrigin: '0 0',
                            transformBox: 'view-box',
                            transition: zoomVisualTransitionEnabled
                                ? `transform ${ZOOM_TRANSITION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`
                                : 'none',
                            willChange: isZoomTransitioning
                                ? 'transform'
                                : undefined,
                        }"
                    >
                        <!-- AREA -->
                        <g
                            v-if="
                                cfgArea.show && !isBar && lineAreaPaths.length
                            "
                        >
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
                                        : setOpacity(
                                              cfgArea.color,
                                              cfgArea.opacity,
                                          )
                                "
                                stroke-linecap="round"
                                stroke-linejoin="round"
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
                                        segment.dashed
                                            ? cfgLine.dashArray * 2
                                            : 0
                                    "
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
                                :x="plot.barX"
                                :y="
                                    isNaN(
                                        plot.absoluteValue > 0
                                            ? plot.y
                                            : absoluteZero,
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
                        </g>

                        <!-- ZERO BASE -->
                        <line
                            data-cy="sparkline-zero-axis"
                            v-if="min < 0"
                            :x1="drawingArea.start"
                            :x2="drawingArea.start + drawingArea.width"
                            :y1="
                                forceValidValue(
                                    absoluteZero,
                                    drawingArea.bottom,
                                )
                            "
                            :y2="
                                forceValidValue(
                                    absoluteZero,
                                    drawingArea.bottom,
                                )
                            "
                            :stroke="cfgStyle.zeroLine.color"
                            :stroke-dasharray="
                                cfgStyle.zeroLine.strokeWidth * 2
                            "
                            :stroke-width="cfgStyle.zeroLine.strokeWidth"
                            stroke-linecap="round"
                        />
                    </g>

                    <!-- VERTICAL INDICATORS
                         Keep indicators outside the scaled zoom group.
                         Only X follows the zoom, so height and stroke width
                         remain constant at all times. -->
                    <g
                        v-for="(plot, i) in mutableDataset"
                        :key="`sparkline_indicator_${plot.id}`"
                        :style="getVerticalIndicatorZoomStyle(plot)"
                    >
                        <line
                            data-cy="selection-indicator"
                            v-if="
                                cfgStyle.verticalIndicator.show &&
                                ((selectedPlot &&
                                    plot.id === selectedPlot.id) ||
                                    currentSelectedIndex === i)
                            "
                            :x1="plot.x"
                            :x2="plot.x"
                            :y1="drawingArea.top - 6"
                            :y2="drawingArea.bottom"
                            :stroke="
                                cfgStyle.verticalIndicator.color || plot.color
                            "
                            :stroke-width="
                                cfgStyle.verticalIndicator.strokeWidth
                            "
                            stroke-linecap="round"
                            :stroke-dasharray="
                                cfgStyle.verticalIndicator.strokeDasharray || 0
                            "
                        />
                    </g>

                    <!-- PLOTS
                         Keep selector circles outside the scaled zoom group.
                         Their centers follow the zoom through translation only,
                         so their radius remains constant at all times. -->
                    <g
                        v-for="(plot, plotIndex) in mutableDataset"
                        :key="`sparkline_plot_${plot.id}`"
                        :style="getPlotZoomStyle(plot)"
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

                <!-- ZOOM SELECTION -->
                <rect
                    v-if="zoomSelectionRect"
                    data-cy="zoom-selection"
                    :x="zoomSelectionRect.x"
                    :y="zoomSelectionRect.y"
                    :width="zoomSelectionRect.width"
                    :height="zoomSelectionRect.height"
                    :fill="cfgZoom.selection.fill"
                    :fill-opacity="cfgZoom.selection.fillOpacity"
                    :stroke="cfgZoom.selection.stroke"
                    :stroke-opacity="cfgZoom.selection.strokeOpacity"
                    :stroke-width="cfgZoom.selection.strokeWidth"
                    :stroke-dasharray="cfgZoom.selection.strokeDasharray"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    pointer-events="none"
                />

                <!-- MOUSE TRAP -->
                <rect
                    v-for="(plot, i) in mutableDataset"
                    data-cy="tooltip-trap"
                    :x="
                        isBar
                            ? plot.barX
                            : plot.x -
                              (drawingArea.width / (len + 1) > svg.padding
                                  ? svg.padding
                                  : drawingArea.width / (len + 1)) /
                                  2
                    "
                    :y="drawingArea.top - 6"
                    :height="drawingArea.height + 6"
                    :width="
                        isBar
                            ? plot.width
                            : drawingArea.width / (len + 1) > svg.padding
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
                        isZoomed,
                        zoomRange: zoomBounds,
                    }"
                />
            </svg>
            <button
                v-if="isZoomed && cfgZoom.resetButton.show"
                type="button"
                class="vue-ui-sparkline-reset-zoom"
                data-cy="reset-zoom"
                :title="cfgZoom.resetButton.title"
                :aria-label="cfgZoom.resetButton.ariaLabel"
                :style="{
                    cursor: FINAL_CONFIG.useCursorPointer
                        ? 'pointer'
                        : 'default',
                }"
                @pointerdown="resetZoomFromButtonPointerDown"
                @click="resetZoomFromButtonClick"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="13"
                    height="13"
                    aria-hidden="true"
                    focusable="false"
                >
                    <path
                        d="M2 10a1 1 0 0 0 15 0c0-5-5-8-10-6l3-3M7 4l3 3"
                        :stroke="cfgZoom.resetButton.color"
                        fill="none"
                        stroke-width="2.5"
                        stroke-linecap="round"
                    />
                </svg>
            </button>
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

svg.vue-ui-sparkline-pointer-focus:focus,
svg.vue-ui-sparkline-pointer-focus:focus-visible {
    outline: none !important;
    box-shadow: none !important;
}

.vue-ui-sparkline-path {
    vector-effect: non-scaling-stroke;
}

.vue-ui-sparkline-reset-zoom {
    position: absolute;
    bottom: 0px;
    right: 0px;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 18px;
    height: 18px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.vue-ui-sparkline-reset-zoom:hover,
.vue-ui-sparkline-reset-zoom:focus-visible {
    opacity: 1;
}

.vue-ui-sparkline-reset-zoom:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: 1px;
}

.vue-ui-sparkline-reset-zoom svg {
    display: block;
    pointer-events: none;
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

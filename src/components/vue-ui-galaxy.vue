<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
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
    onMounted,
    onBeforeUnmount,
    shallowRef,
    ref,
    watch,
} from 'vue';
import {
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createSpiralPath,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    escapeHtml,
    isFunction,
    palette,
    sanitizeArray,
    treeShake,
    XMLNS,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter';

import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useTransitions } from '../useTransitions.js';
import { usePrefersReducedMotion } from '../usePrefersMotion';
import { buildValuePercentageLabel } from '../labelUtils';
import Title from '../atoms/Title.vue';
import Legend from '../atoms/Legend.vue';
import themes from '../themes/vue_ui_galaxy.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';

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

const { vue_ui_galaxy: DEFAULT_CONFIG } = useConfig();

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
});

const uid = ref(createUid());
const galaxyChart = ref(null);
const tooltipRequested = ref(false);
const tooltipContent = ref('');
const selectedSerie = ref(null);
const step = ref(0);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const resizeObserver = shallowRef(null);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const activeTooltipIndex = ref(null); // a11y
const activeTooltipSerieId = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const preparedConfig = computed(prepareConfig);
const loading = computed(
    () => !!props.config.loading || !props.dataset?.length,
);
const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            useCssAnimation: false,
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    legend: {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        userConfig: preparedConfig.value.skeletonConfig ?? {},
    });
});

const FINAL_CONFIG = computed(() =>
    loading.value
        ? treeShake({
              defaultConfig: preparedConfig.value,
              userConfig: skeletonConfig.value,
          })
        : preparedConfig.value,
);
const FINAL_DATASET = computed(() =>
    loading.value
        ? (props.config.skeletonDataset ?? [
              { name: '_', values: [21], color: '#DBDBDB' },
              { name: '_', values: [13], color: '#C4C4C4' },
              { name: '_', values: [8], color: '#ADADAD' },
          ])
        : props.dataset,
);
const cfgArcs = computed(() => FINAL_CONFIG.value.style.chart.layout.arcs);
const cfgLayout = computed(() => FINAL_CONFIG.value.style.chart.layout);
const cfgDataLabels = computed(() => cfgLayout.value.labels.dataLabels);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiGalaxy',
    rules: [
        COMMON_RULES.singleSeries,
        COMMON_RULES.emptyArray,
        {
            test: (ds) => ds.length > 6,
            message: [
                '👀 The number of series is > 6. Consider:',
                '',
                '▶️ Grouping small values dynamically into a single "Other" series.',
                '',
                '▶️ Using filters to let users choose a maximum number of series to display.',
                '',
                '▶️ Using VueUiHorizontalBar instead to make the dataset breakdown easier to read.',
            ],
        },
    ],
});

const { transitionEnabled } = useTransitions({
    config: () => FINAL_CONFIG.value.transitions,
    dataset: () => props.dataset,
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const debug = computed(() => preparedConfig.value.debug);
watch(
    [() => props.dataset, debug],
    () => {
        if (!props.dataset?.length)
            error({
                componentName: 'VueUiGalaxy',
                type: 'dataset',
                debug: debug.value,
            });
        props.dataset?.forEach((row, index) => {
            const keys = row && typeof row === 'object' ? Object.keys(row) : [];
            ['name', 'values']
                .filter((key) => !keys.includes(key))
                .forEach((property) =>
                    error({
                        componentName: 'VueUiGalaxy',
                        type: 'datasetSerieAttribute',
                        property,
                        index,
                        debug: debug.value,
                    }),
                );
            if (
                keys.includes('values') &&
                !Array.isArray(row.values) &&
                debug.value
            )
                console.warn(
                    `VueUiGalaxy: dataset[${index}].values must be an array.`,
                );
        });
    },
    { immediate: true, deep: true },
);

const responsiveSize = ref(null);
let resizeFrame = null;
let disposed = false;
function stopResize() {
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
}
function prepareChart() {
    stopResize();
    responsiveSize.value = null;
    if (!FINAL_CONFIG.value.responsive || !galaxyChart.value?.parentNode)
        return;
    const observer = new ResizeObserver(measure);
    function measure() {
        if (disposed || resizeObserver.value !== observer) return;
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            if (disposed || resizeObserver.value !== observer) return;
            resizeFrame = null;
            const { width, height } = useResponsive({
                chart: galaxyChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                noTitle: noTitle.value,
                source: source.value,
            });
            responsiveSize.value = {
                width: Math.max(0.1, width),
                height: Math.max(0.1, height - 12),
            };
        });
    }
    resizeObserver.value = observer;
    observer.observe(galaxyChart.value.parentNode);
    measure();
}
onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});
onBeforeUnmount(() => {
    disposed = true;
    stopResize();
});
watch(
    [
        () => FINAL_CONFIG.value.responsive,
        () => cfgChart.value.title.text,
        () => cfgChart.value.title.subtitle.text,
        () => cfgChart.value.legend.show,
        () => cfgChart.value.legend.position,
    ],
    prepareChart,
    { flush: 'post' },
);

const userOptionsVisible = ref(
    !FINAL_CONFIG.value.userOptions.showOnChartHover,
);
const keepUserOptionState = computed(
    () => FINAL_CONFIG.value.userOptions.keepStateOnChartLeave,
);
function setUserOptionsVisibility(state = false) {
    if (FINAL_CONFIG.value.userOptions.showOnChartHover)
        userOptionsVisible.value = state;
}
watch(
    () => FINAL_CONFIG.value.userOptions.showOnChartHover,
    (value) => {
        userOptionsVisible.value = !value;
    },
);
const svgRef = ref(null);
const accessibleName = computed(() => {
    const { text, subtitle } = cfgChart.value.title;
    return [text || 'Chart visualization', subtitle.text]
        .filter(Boolean)
        .join('. ');
});
function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `galaxy_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-galaxy',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    dataLabels: {
        show: cfgLayout.value.labels.dataLabels.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgChart.value.tooltip.show,
});

const isTooltip = computed(
    () =>
        !loading.value &&
        tooltipRequested.value &&
        selectedSerie.value !== null &&
        mutableConfig.value.showTooltip,
);

watch(
    () => FINAL_CONFIG.value.table.show,
    (value) => {
        mutableConfig.value.showTable = value;
    },
);
watch(
    () => cfgChart.value.tooltip.show,
    (value) => {
        mutableConfig.value.showTooltip = value;
    },
);
watch(
    () => cfgLayout.value.labels.dataLabels.show,
    (value) => {
        mutableConfig.value.dataLabels.show = value;
    },
);
const svg = computed(() => {
    const { width, height } = responsiveSize.value || {
        width: 250,
        height: 180,
    };
    return { width, height, viewBox: `0 0 ${width} ${height}` };
});

const emit = defineEmits(['selectLegend', 'selectDatapoint', 'copyAlt']);

const segregated = ref([]);

function emitSelectLegend() {
    emit(
        'selectLegend',
        galaxySet.value.map((ds) => {
            return {
                name: ds.name,
                color: ds.color,
                value: ds.value,
            };
        }),
    );
}

function setHiddenSeries(ids) {
    reservedLabelSpace.value ??= labelSpace.value;
    const previous = animatedEndpoints.value ?? arcEndpoints.value;
    segregated.value = ids;
    animateArcs(previous);
    emitSelectLegend();
}

function toggleLegend() {
    setHiddenSeries(
        segregated.value.length ? [] : legendSet.value.map(({ id }) => id),
    );
}

function segregate({ id }) {
    setHiddenSeries(
        segregated.value.includes(id)
            ? segregated.value.filter((hiddenId) => hiddenId !== id)
            : [...segregated.value, id],
    );
}

function validSeriesToToggle(name) {
    if (!immutableSet.value.length) {
        if (debug.value) {
            console.warn('VueUiGalaxy - There are no series to show.');
        }
        return null;
    }
    const dp = immutableSet.value.find((d) => d.name === name);
    if (!dp) {
        if (debug.value) {
            console.warn(`VueUiGalaxy - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

/**
 * Show the named series only if its visibility needs to change.
 * Unknown names leave visibility unchanged.
 *
 * @param {string} name - Series name matched by the component.
 * @returns {void}
 */
function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.id)) {
        segregate({ id: dp.id });
    }
}

/**
 * Hide the named series only if its visibility needs to change.
 * Unknown names leave visibility unchanged.
 *
 * @param {string} name - Series name matched by the component.
 * @returns {void}
 */
function hideSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.id)) {
        segregate({ id: dp.id });
    }
}

const seriesIdentity = new Map();
const seriesIds = computed(() => {
    const occurrences = new Map();
    const keys = new Set();
    const ids = FINAL_DATASET.value.map((serie, index) => {
        const source =
            serie?.id == null
                ? `index:${index}`
                : `id:${typeof serie.id}:${serie.id}`;
        const occurrence = occurrences.get(source) || 0;
        occurrences.set(source, occurrence + 1);
        const key = `${loading.value ? 'skeleton' : 'data'}:${source}:${occurrence}`;
        keys.add(key);
        if (!seriesIdentity.has(key)) seriesIdentity.set(key, createUid());
        return seriesIdentity.get(key);
    });
    const prefix = `${loading.value ? 'skeleton' : 'data'}:`;
    for (const key of seriesIdentity.keys()) {
        if (key.startsWith(prefix) && !keys.has(key))
            seriesIdentity.delete(key);
    }
    return ids;
});
const immutableSet = computed(() =>
    FINAL_DATASET.value
        .flatMap((serie, i) => {
            if (!serie || typeof serie !== 'object') return [];
            const absoluteValues = sanitizeArray(
                Array.isArray(serie.values) ? serie.values : [],
            );
            const sum = absoluteValues.reduce(
                (a, b) => a + (typeof b === 'number' ? b : 0),
                0,
            );
            return [
                {
                    name: serie.name,
                    color:
                        convertColorToHex(serie.color) ||
                        customPalette.value[i] ||
                        palette[i % palette.length],
                    value: Number.isFinite(sum) ? sum : 0,
                    absoluteValues,
                    id: seriesIds.value[i],
                },
            ];
        })
        .sort((a, b) => b.value - a.value)
        .map((d, absoluteIndex) => ({ ...d, absoluteIndex })),
);

/**
 * Return name, color, and value records for the current immutable set.
 */
function getData() {
    return immutableSet.value.map((ds) => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value,
        };
    });
}

const segregatedSet = computed(() =>
    immutableSet.value.filter((ds) => !segregated.value.includes(ds.id)),
);
const total = computed(() =>
    segregatedSet.value.reduce((sum, ds) => sum + ds.value, 0),
);
const fullTotal = computed(() =>
    immutableSet.value.reduce((sum, ds) => sum + ds.value, 0),
);
function proportion(value, sum) {
    const ratio = sum ? value / sum : 0;
    return Number.isFinite(ratio) ? ratio : 0;
}
const MAX_PATH_POINTS = 190;

watch(immutableSet, (records) => {
    if (loading.value) return;
    const ids = new Set(records.map((record) => record.id));
    segregated.value = segregated.value.filter((id) => ids.has(id));
});

const effectivePadding = computed(
    () =>
        (cfgArcs.value.strokeWidth + cfgArcs.value.borderWidth) / 2 +
        (cfgLayout.value.padding ?? 12),
);

const seriesWithShares = computed(() => {
    let points = 0;
    return segregatedSet.value.map((serie, seriesIndex) => {
        const share = proportion(serie.value, total.value);
        points += share * MAX_PATH_POINTS;
        return { ...serie, seriesIndex, proportion: share, points };
    });
});
const visibleSeries = computed(() =>
    seriesWithShares.value.toSorted((a, b) => b.points - a.points),
);

const useLengthBasedSlices = computed(
    () =>
        total.value > 0 &&
        Number.isFinite(total.value) &&
        segregatedSet.value.every(({ value }) => value >= 0),
);

const toSpiralPath = computed(() => {
    return createSpiralPath({
        maxPoints: MAX_PATH_POINTS,
        byLength: useLengthBasedSlices.value,
        a: cfgArcs.value.a ?? 6,
        b: cfgArcs.value.b ?? 6,
        angleStep: cfgArcs.value.angleStep ?? 0.07,
        startX: svg.value.width / 2 + cfgArcs.value.offsetX,
        startY: svg.value.height / 2 + cfgArcs.value.offsetY,
        boxWidth: svg.value.width,
        boxHeight: svg.value.height,
        padding: effectivePadding.value,
    });
});

const galaxySet = computed(() => {
    const series = useLengthBasedSlices.value
        ? visibleSeries.value.toSorted(
              (a, b) =>
                  b.points - a.points ||
                  Number(!b.value) - Number(!a.value) ||
                  (a.value && b.value ? b.seriesIndex - a.seriesIndex : 0),
          )
        : visibleSeries.value;
    return series.map((serie) => ({
        ...serie,
        path: toSpiralPath.value(arcEndpoints.value.get(serie.id)),
    }));
});

const strokeScale = computed(
    () => Math.min(svg.value.width, svg.value.height) / 180,
);

const outlineLayout = computed(() => {
    const fullLength = toSpiralPath.value.totalLength;
    // A round cap extends by half the extra stroke width.
    const gap = (cfgArcs.value.borderWidth * strokeScale.value) / 2;
    if (!Number.isFinite(fullLength) || fullLength <= 0 || gap <= 0)
        return null;

    const slices = seriesWithShares.value.filter(({ value }) => value > 0);
    const following = slices.slice(1);
    if (!following.some(({ proportion }) => proportion * fullLength <= gap))
        return null;

    const colorLength = fullLength - following.length * gap;
    if (colorLength <= 0) {
        return {
            limits: new Map(
                following.map(({ proportion }, index) => [
                    slices[index].id,
                    proportion * fullLength,
                ]),
            ),
        };
    }

    // Reserve the dividers, then divide the remaining length by the data shares.
    return {
        points: new Map(
            slices.map(({ id, points }, index) => [
                id,
                (points * colorLength + index * gap * MAX_PATH_POINTS) /
                    fullLength,
            ]),
        ),
    };
});

const arcEndpoints = computed(
    () =>
        new Map(
            seriesWithShares.value.map(({ id, points }) => [
                id,
                outlineLayout.value?.points?.get(id) ?? points,
            ]),
        ),
);
const prefersReducedMotion = usePrefersReducedMotion();
const ARC_ANIMATION_DURATION = 200;
const canAnimateArcs = computed(
    () =>
        FINAL_CONFIG.value.useAnimation &&
        transitionEnabled.value &&
        !loading.value &&
        !prefersReducedMotion.value,
);
const animatedEndpoints = shallowRef(null);
let arcFrame = null;
let activeArcTarget = null;

const animatedPaths = computed(() => {
    if (!animatedEndpoints.value) return null;
    return new Map(
        Array.from(animatedEndpoints.value, ([id, points]) => [
            id,
            toSpiralPath.value(points),
        ]),
    );
});

function stopArcAnimation() {
    if (arcFrame !== null) cancelAnimationFrame(arcFrame);
    arcFrame = null;
    activeArcTarget = null;
    animatedEndpoints.value = null;
}

function animateArcs(previous) {
    stopArcAnimation();
    const target = arcEndpoints.value;
    if (!canAnimateArcs.value || !useLengthBasedSlices.value) return;

    let preceding = 0;
    const from = new Map();
    for (const [id] of target) {
        // A returning slice starts at the previous visible boundary.
        preceding = previous.get(id) ?? preceding;
        from.set(id, preceding);
    }
    if ([...target].every(([id, points]) => from.get(id) === points)) return;

    const duration = ARC_ANIMATION_DURATION / FINAL_CONFIG.value.animationSpeed;
    const animationDuration =
        Number.isFinite(duration) && duration > 0
            ? duration
            : ARC_ANIMATION_DURATION;
    const animation = { target, spiral: toSpiralPath.value };
    activeArcTarget = animation;
    animatedEndpoints.value = from;
    let start;
    function advance(timestamp) {
        if (activeArcTarget !== animation) return;
        start ??= timestamp;
        const progress = Math.min((timestamp - start) / animationDuration, 1);
        if (progress === 1) {
            stopArcAnimation();
            if (tooltipTriggerMode.value === 'keyboard') {
                nextTick(() =>
                    updateTooltipA11yPosition(activeTooltipSerieId.value),
                );
            }
            return;
        }

        const eased = progress * progress * (3 - 2 * progress);
        animatedEndpoints.value = new Map(
            Array.from(target, ([id, points]) => {
                const initial = from.get(id);
                return [id, initial + (points - initial) * eased];
            }),
        );
        arcFrame = requestAnimationFrame(advance);
    }
    arcFrame = requestAnimationFrame(advance);
}

watch(
    [arcEndpoints, canAnimateArcs, toSpiralPath],
    ([target, enabled, spiral]) => {
        if (
            activeArcTarget &&
            (!enabled ||
                target !== activeArcTarget.target ||
                spiral !== activeArcTarget.spiral)
        )
            stopArcAnimation();
    },
);
onBeforeUnmount(stopArcAnimation);

const formattedArcLabels = computed(() => {
    const cfg = cfgDataLabels.value;
    if (
        loading.value ||
        !mutableConfig.value.dataLabels.show ||
        !useLengthBasedSlices.value
    )
        return new Map();

    return new Map(
        galaxySet.value
            .filter(
                ({ value, proportion }) =>
                    value > 0 && proportion * 100 > cfg.hideUnderValue,
            )
            .map((datapoint) => {
                const { id, name, value, seriesIndex, proportion } = datapoint;
                const label = buildLabel({
                    showVal: cfg.showValue,
                    showPercentage: cfg.showPercentage,
                    val: cfg.showValue
                        ? applyDataLabel(
                              cfg.formatter,
                              value,
                              dataLabel({
                                  p: cfg.prefix,
                                  v: value,
                                  s: cfg.suffix,
                                  r: cfg.roundingValue,
                              }),
                              { datapoint, seriesIndex },
                          )
                        : '',
                    percentage: cfg.showPercentage
                        ? dataLabel({
                              v: proportion * 100,
                              s: '%',
                              r: cfg.roundingPercentage,
                          })
                        : '',
                });
                return [
                    id,
                    {
                        text: String(label),
                        name: cfg.showName ? String(name ?? '') : '',
                        small: proportion * 100 <= cfg.smallArcClusterThreshold,
                    },
                ];
            }),
    );
});

function getLabelAnchors(endpoints, highlighted = false) {
    const spiral = toSpiralPath.value;
    const anchors = new Map();
    const pointsPerUnit = MAX_PATH_POINTS / spiral.totalLength;
    let previousEnd = 0;
    let previousRadius = 0;

    for (const { id, value, color } of seriesWithShares.value) {
        if (value <= 0) continue;
        const end = Math.min(MAX_PATH_POINTS, endpoints.get(id));
        const { border, path } = highlighted
            ? strokeWidths.value[id]
            : getStrokeWidth(id);
        const label = formattedArcLabels.value.get(id);
        if (label?.text || label?.name) {
            // Nested round caps can leave a short slice visible only past its centerline endpoint.
            const radius = path / 2;
            const visibleLength =
                (end - previousEnd) / pointsPerUnit + radius - previousRadius;
            if (visibleLength > 0) {
                const offset = radius - visibleLength / 2;
                const position = spiral.pointAt(
                    end + Math.min(0, offset) * pointsPerUnit,
                );
                if (position && offset > 0) {
                    const before = spiral.pointAt(end - 0.25 * pointsPerUnit);
                    const dx = position.x - before.x;
                    const dy = position.y - before.y;
                    const length = Math.hypot(dx, dy);
                    if (length) {
                        position.x += (dx / length) * offset;
                        position.y += (dy / length) * offset;
                    }
                }
                if (position)
                    anchors.set(id, { id, color, ...label, ...position });
            }
        }
        previousEnd = end;
        previousRadius = border / 2;
    }
    return anchors;
}

const LABEL_GUTTER = 12;
const reservedLabelSpace = ref(null);

function estimatedLabelWidth(text, fontSize) {
    return text.length * fontSize * 0.8;
}

const labelSpace = computed(() => {
    if (loading.value || !mutableConfig.value.dataLabels.show) return 0;

    const cfg = cfgDataLabels.value;
    const fontSize = Math.max(cfg.fontSize, cfg.smallArcClusterFontSize);
    // Reserve room for names that can become eligible after hiding larger slices.
    let width = 8 * fontSize;
    if (cfg.showName) {
        for (const { name } of immutableSet.value) {
            width = Math.max(
                width,
                estimatedLabelWidth(String(name ?? ''), fontSize * 0.8),
            );
        }
    }
    for (const { text } of formattedArcLabels.value.values()) {
        width = Math.max(width, estimatedLabelWidth(text, fontSize));
    }
    return LABEL_GUTTER + width;
});

watch(
    [
        immutableSet,
        cfgDataLabels,
        loading,
        () => mutableConfig.value.dataLabels.show,
    ],
    () => {
        reservedLabelSpace.value = null;
    },
);

const labelLayout = computed(() => {
    const { width, height, viewBox } = svg.value;
    const space = reservedLabelSpace.value ?? labelSpace.value;
    const labelViewBox = space
        ? `${-space} 0 ${width + 2 * space} ${height}`
        : viewBox;
    if (!formattedArcLabels.value.size)
        return { viewBox: labelViewBox, labels: [] };

    const columns = [[], []];
    const cfg = cfgDataLabels.value;
    const maxTextWidth = Math.max(0, space - LABEL_GUTTER);
    const anchors = getLabelAnchors(arcEndpoints.value);
    for (const label of anchors.values()) {
        const side = label.x < width / 2 ? 0 : 1;
        const fontSize = label.small
            ? cfg.smallArcClusterFontSize
            : cfg.fontSize;
        const nameSize = fontSize * 0.8;
        const hasTwoLines = label.text && label.name;
        const rowHeight = fontSize + (hasTwoLines ? nameSize : 0) + 4;
        const textLength =
            estimatedLabelWidth(label.text, fontSize) > maxTextWidth
                ? maxTextWidth
                : undefined;
        columns[side].push({
            ...label,
            fontSize,
            nameSize,
            rowHeight,
            textLength,
        });
    }

    const bands = columns.map((column, side) => {
        const left = side === 0;
        const edgeX = left ? 0 : width;
        const railX = edgeX + ((left ? -1 : 1) * LABEL_GUTTER) / 2;
        const textX = edgeX + (left ? -1 : 1) * LABEL_GUTTER;
        let occupied = 0;
        const placed = column
            .filter(({ rowHeight }) => {
                if (occupied + rowHeight > height) return false;
                occupied += rowHeight;
                return true;
            })
            .toSorted((a, b) => a.y - b.y);

        let top = 0;
        return placed.map((label) => {
            occupied -= label.rowHeight;
            const y = Math.max(
                top,
                Math.min(
                    label.y - label.fontSize / 2,
                    height - occupied - label.rowHeight,
                ),
            );
            top = y + label.rowHeight;
            return {
                ...label,
                edgeX,
                railX,
                textX,
                textY: y + label.fontSize / 2,
                left,
            };
        });
    });
    const labels = bands.flat();

    return { labels, viewBox: labelViewBox };
});

const markerRadius = 1.8;
const markerBorderWidth = 0.8;
const connectorBorderWidth = 2;

const arcLabels = computed(() => {
    const labels = labelLayout.value.labels;
    const endpoints = animatedEndpoints.value;
    const anchors =
        labels.length && (endpoints || selectedSerie.value !== null)
            ? getLabelAnchors(endpoints ?? arcEndpoints.value, true)
            : null;
    return labels.map((label) => {
        const anchor = anchors ? anchors.get(label.id) : label;
        if (!anchor) return { ...label, connector: null };
        const { x, y } = anchor;
        const direction = label.left ? -1 : 1;
        const endX = label.textX - 3 * direction;
        const connector = `M${x} ${y} H${label.edgeX} L${label.railX} ${label.textY} H${endX}`;
        return { ...label, x, y, connector };
    });
});

function getStrokeWidth(id, highlighted = false) {
    const mult =
        highlighted && cfgArcs.value.hoverEffect.show
            ? cfgArcs.value.hoverEffect.multiplicator
            : 1;

    const scale = mult * strokeScale.value;
    const path = cfgArcs.value.strokeWidth * scale;
    const borderWidth = cfgArcs.value.borderWidth * scale;
    const limit = outlineLayout.value?.limits?.get(id);
    const outline = Math.min(borderWidth, limit ?? Infinity);

    return {
        border: path + outline,
        path,
        blur: path / 2,
    };
}

const labelMarkers = computed(() =>
    arcLabels.value.filter(({ connector }) => connector),
);

const strokeWidths = computed(() =>
    Object.fromEntries(
        galaxySet.value.map(({ id }) => [
            id,
            getStrokeWidth(id, selectedSerie.value === id),
        ]),
    ),
);

const pointerSeriesId = computed(() =>
    tooltipTriggerMode.value === 'pointer' ? selectedSerie.value : null,
);

function labelOpacity(id) {
    const hoveredId = pointerSeriesId.value;
    return hoveredId !== null && hoveredId !== id ? 0.5 : 1;
}

watch(labelLayout, ({ labels }) => {
    const id = pointerSeriesId.value;
    if (
        id !== null &&
        !tooltipRequested.value &&
        !labels.some((label) => label.id === id)
    )
        clearSerieSelection();
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const dataTooltipSlot = ref(null);

function clearSerieSelection() {
    tooltipRequested.value = false;
    selectedSerie.value = null;
    activeTooltipIndex.value = null;
    activeTooltipSerieId.value = null;
    dataTooltipSlot.value = null;
    tooltipContent.value = '';
}

function updateTooltipA11yPosition(serieId) {
    if (!svgRef.value || !serieId) return;

    const trap = svgRef.value.querySelector(
        `[data-a11y-serie-id="${serieId}"]`,
    );
    if (!trap) return;

    const box = trap.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
    };
}

function onDatapointPointerEnter(datapoint, show = true) {
    useTooltip({
        datapoint,
        seriesIndex: datapoint.seriesIndex,
        show,
        flatIndex: a11ySeries.value.findIndex(
            (entry) => entry.datapoint.id === datapoint.id,
        ),
    });
}

function onLabelHover(id, entering) {
    const datapoint = galaxySet.value.find((series) => series.id === id);
    if (!datapoint) return;
    if (entering) onDatapointPointerEnter(datapoint, false);
    else onTrapLeave(datapoint);
}

function onTrapLeave(datapoint) {
    if (loading.value) return;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint,
            seriesIndex: datapoint.absoluteIndex,
        });
    }
    if (
        activeTooltipSerieId.value === datapoint.id &&
        tooltipTriggerMode.value === 'keyboard'
    )
        return;
    clearSerieSelection();
}

function onTrapClick(datapoint) {
    if (loading.value) return;
    emit('selectDatapoint', datapoint);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint,
            seriesIndex: datapoint.absoluteIndex,
        });
    }
}

function buildLabel({ val, percentage, showVal, showPercentage }) {
    const cfg = cfgLayout.value.labels.dataLabels;
    return buildValuePercentageLabel({
        config: cfg,
        val,
        percentage,
        showVal,
        showPercentage,
    });
}

function useTooltip({
    datapoint,
    seriesIndex,
    show = false,
    triggerMode = 'pointer',
    flatIndex = null,
}) {
    if (loading.value) return;
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint,
            seriesIndex: datapoint.absoluteIndex,
        });
    }

    tooltipTriggerMode.value = triggerMode;
    activeTooltipIndex.value = flatIndex;
    activeTooltipSerieId.value = datapoint.id;
    selectedSerie.value = datapoint.id;
    tooltipRequested.value = show;
    refreshTooltip(datapoint, seriesIndex);
    if (triggerMode === 'keyboard')
        nextTick(() => updateTooltipA11yPosition(datapoint.id));
}

function refreshTooltip(datapoint, seriesIndex) {
    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        series: immutableSet.value,
        config: FINAL_CONFIG.value,
    };
    if (!mutableConfig.value.showTooltip) {
        tooltipContent.value = '';
        return;
    }

    let html = '';
    const customFormat = cfgChart.value.tooltip.customFormat;

    const formatted = isFunction(customFormat)
        ? customFormat({
              seriesIndex,
              datapoint,
              series: immutableSet.value,
              config: FINAL_CONFIG.value,
          })
        : null;
    if (typeof formatted === 'string') {
        tooltipContent.value = formatted;
    } else {
        html += `<div data-cy="galaxy-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${cfgChart.value.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${escapeHtml(datapoint.name)}</div>`;
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="galaxy-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

        html += `<b>${buildLabel({
            showVal: cfgChart.value.tooltip.showValue,
            showPercentage: cfgChart.value.tooltip.showPercentage,
            val: applyDataLabel(
                cfgLayout.value.labels.dataLabels.formatter,
                datapoint.value,
                dataLabel({
                    p: cfgLayout.value.labels.dataLabels.prefix,
                    v: datapoint.value,
                    s: cfgLayout.value.labels.dataLabels.suffix,
                    r: cfgChart.value.tooltip.roundingValue,
                }),
                { datapoint, seriesIndex },
            ),
            percentage: dataLabel({
                v: datapoint.proportion * 100,
                s: '%',
                r: cfgChart.value.tooltip.roundingPercentage,
            }),
        })}</b></div>`;

        tooltipContent.value = `<div>${html}</div>`;
    }
}

watch(
    [
        galaxySet,
        () => cfgChart.value.tooltip,
        () => cfgLayout.value.labels.dataLabels,
        () => mutableConfig.value.showTooltip,
        loading,
    ],
    () => {
        if (!activeTooltipSerieId.value) return;
        const index = a11ySeries.value.findIndex(
            (entry) => entry.datapoint.id === activeTooltipSerieId.value,
        );
        if (index < 0) {
            clearSerieSelection();
            return;
        }
        const datapoint = a11ySeries.value[index].datapoint;
        activeTooltipIndex.value = index;
        refreshTooltip(datapoint, datapoint.seriesIndex);
        if (tooltipTriggerMode.value === 'keyboard')
            nextTick(() => updateTooltipA11yPosition(datapoint.id));
    },
);

const legendSet = computed(() => {
    return immutableSet.value.map((el, i) => {
        const valueDisplay = applyDataLabel(
            cfgLayout.value.labels.dataLabels.formatter,
            el.value,
            dataLabel({
                p: cfgLayout.value.labels.dataLabels.prefix,
                v: el.value,
                s: cfgLayout.value.labels.dataLabels.suffix,
                r: cfgChart.value.legend.roundingValue,
            }),
            { datapoint: el, index: i },
        );

        const percentageDisplay =
            !total.value ||
            !Number.isFinite(total.value) ||
            segregated.value.includes(el.id)
                ? '-'
                : dataLabel({
                      v: (el.value / total.value) * 100,
                      s: '%',
                      r: cfgChart.value.legend.roundingPercentage,
                  });

        const display = buildLabel({
            showVal: cfgChart.value.legend.showValue,
            showPercentage: cfgChart.value.legend.showPercentage,
            val: valueDisplay,
            percentage: percentageDisplay,
        });

        return {
            ...el,
            proportion: proportion(el.value, fullTotal.value),
            opacity: segregated.value.includes(el.id) ? 0.5 : 1,
            shape: el.shape || 'circle',
            segregate: () => segregate(el),
            isSegregated: segregated.value.includes(el.id),
            display: `${el.name}${cfgChart.value.legend.showPercentage || cfgChart.value.legend.showValue ? ': ' : ''}${display}`,
        };
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'galaxy-div-legend',
        backgroundColor: cfgChart.value.legend.backgroundColor,
        color: cfgChart.value.legend.color,
        fontSize: cfgChart.value.legend.fontSize,
        paddingBottom: 12,
        fontWeight: cfgChart.value.legend.bold ? 'bold' : '',
    };
});

const hasPercentage = computed(
    () => total.value !== 0 && Number.isFinite(total.value),
);
const tableRows = computed(() =>
    visibleSeries.value.map(({ name, color, value, proportion }) => ({
        name,
        color,
        value,
        percentage: hasPercentage.value ? proportion * 100 : null,
    })),
);

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = tableRows.value.map(({ name, value, percentage }) => [
            [name],
            [value],
            [percentage ?? '-'],
        ]);
        const tableXls = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            [
                [FINAL_CONFIG.value.table.columnNames.series],
                [FINAL_CONFIG.value.table.columnNames.value],
                [FINAL_CONFIG.value.table.columnNames.percentage],
            ],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-galaxy',
            });
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        `__SUM__`,
        dataLabel({
            p: cfgLayout.value.labels.dataLabels.prefix,
            v: total.value,
            s: cfgLayout.value.labels.dataLabels.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        }),
        hasPercentage.value ? '100%' : '-',
    ];

    const body = tableRows.value.map(({ name, color, value, percentage }) => {
        const label = dataLabel({
            p: cfgLayout.value.labels.dataLabels.prefix,
            v: value,
            s: cfgLayout.value.labels.dataLabels.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        return [
            {
                color,
                name,
            },
            label,
            percentage === null
                ? '-'
                : dataLabel({
                      v: percentage,
                      s: '%',
                      r: FINAL_CONFIG.value.table.td.roundingPercentage,
                  }),
        ];
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
        FINAL_CONFIG.value.table.columnNames.percentage,
    ];

    return {
        colNames,
        head,
        body,
        config,
    };
});

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleLabels() {
    mutableConfig.value.dataLabels.show = !mutableConfig.value.dataLabels.show;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const getImage = createChartImageGetter(
    galaxyChart,
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
        parent: galaxyChart,
        maxWidth: 500,
        isCursorPointer,
    }),
);

watch(
    () => mutableConfig.value.showTable,
    (v) => {
        if (tableUnit.value) syncTableVisibility(v, FINAL_CONFIG, tableUnit);
    },
);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgLegendItems = computed(() => {
    return legendSet.value.map((l) => ({
        ...l,
        name: l.display,
    }));
});

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgLegend = computed(() => cfgChart.value.legend);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: svgLegend,
        legendItems: svgLegendItems,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: immutableSet.value,
    });
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.userOptions.callbacks.altCopy({
            config: FINAL_CONFIG.value,
            dataset: immutableSet.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 ***************************************************************************************************/
function onSvgFocus() {
    activeTooltipIndex.value = null;
    activeTooltipSerieId.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    clearSerieSelection();
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!a11ySeries.value.length) return;

    const isPreviousKey = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    const isNextKey = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearSerieSelection();
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;

        const entry = a11ySeries.value[activeTooltipIndex.value];
        if (!entry) return;

        onTrapClick(entry.datapoint);
        return;
    }

    let nextIndex = activeTooltipIndex.value;

    if (
        nextIndex === null ||
        nextIndex < 0 ||
        nextIndex >= a11ySeries.value.length
    ) {
        nextIndex = isNextKey ? 0 : a11ySeries.value.length - 1;
    } else {
        nextIndex += isNextKey ? 1 : -1;

        if (nextIndex < 0) {
            nextIndex = a11ySeries.value.length - 1;
        }

        if (nextIndex >= a11ySeries.value.length) {
            nextIndex = 0;
        }
    }

    const entry = a11ySeries.value[nextIndex];
    if (!entry) return;

    useTooltip({
        datapoint: entry.datapoint,
        seriesIndex: entry.datapoint.seriesIndex,
        show: true,
        triggerMode: 'keyboard',
        flatIndex: nextIndex,
    });
}

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows = dataTable.value.body.map(([serie, ...values]) => [
        serie.name,
        ...values,
    ]);
    return { headers, rows };
});

const a11ySeries = computed(() => {
    return galaxySet.value
        .filter((dp) => dp.value && !loading.value)
        .map((datapoint, index) => ({
            datapoint,
            index,
        }));
});

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    hideSeries,
    showSeries,
    toggleTable,
    toggleTooltip,
    toggleLabels,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        ref="galaxyChart"
        :class="`vue-data-ui-component vue-ui-galaxy ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'} ${loading ? 'loading' : ''}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${!cfgChart.title.text ? 'padding-top:36px' : ''};background:${cfgChart.backgroundColor}`"
        :id="`galaxy_${uid}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="
            () => {
                setUserOptionsVisibility(false);
                if (!isFocus) {
                    clearSerieSelection();
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
            v-bind="getAnnotatorProps(FINAL_CONFIG.userOptions.annotator)"
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="FINAL_CONFIG.userOptions.annotatorPalette"
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
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:24px`"
        >
            <Title
                :config="{
                    title: {
                        cy: 'galaxy-div-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'galaxy-div-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="
                FINAL_CONFIG.userOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="
                FINAL_CONFIG.userOptions.buttons.tooltip &&
                cfgChart.tooltip.show
            "
            :isTooltip="mutableConfig.showTooltip"
            :isLabelActive="mutableConfig.dataLabels.show"
            :isFullscreen="isFullscreen"
            :chartElement="galaxyChart"
            v-bind="
                getUserOptionsProps(
                    FINAL_CONFIG.userOptions,
                    'pdf csv img svg labels table fullscreen altCopy annotator',
                )
            "
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleLabels="toggleLabels"
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
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionTooltip optionPdf optionCsv optionImg optionSvg optionLabels optionTable optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                role="img"
                :aria-label="accessibleName"
                aria-live="polite"
                :aria-describedby="`chart-instructions-${uid}`"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                }"
                data-cy="galaxy-svg"
                :viewBox="labelLayout.viewBox"
                :style="`max-width:100%; overflow: visible; background:transparent;color:${cfgChart.color}`"
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
                    :width="svg.width"
                    :height="svg.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <!-- GRADIENT -->
                <defs>
                    <mask
                        v-if="labelMarkers.length"
                        :id="`galaxy-connectors-${uid}`"
                        maskUnits="userSpaceOnUse"
                        x="-100%"
                        y="-100%"
                        width="300%"
                        height="300%"
                    >
                        <rect
                            x="-100%"
                            y="-100%"
                            width="300%"
                            height="300%"
                            fill="white"
                        />
                        <circle
                            v-for="marker in labelMarkers"
                            :key="marker.id"
                            :cx="marker.x"
                            :cy="marker.y"
                            :r="markerRadius - markerBorderWidth / 2"
                            fill="black"
                        />
                    </mask>
                    <filter
                        :id="`blur_${uid}`"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feGaussianBlur
                            in="SourceGraphic"
                            :stdDeviation="100 / cfgArcs.gradient.intensity"
                        />
                    </filter>
                </defs>

                <!-- PATHS -->
                <g v-for="datapoint in galaxySet" :key="`dp_${datapoint.id}`">
                    <path
                        data-cy="datapoint-border"
                        v-if="datapoint.value"
                        :d="animatedPaths?.get(datapoint.id) ?? datapoint.path"
                        fill="none"
                        :stroke="cfgChart.backgroundColor"
                        :stroke-width="strokeWidths[datapoint.id].border"
                        :class="{ 'vue-data-ui-transition': transitionEnabled }"
                        stroke-linecap="round"
                    />
                    <path
                        data-cy="datapoint-path"
                        v-if="datapoint.value"
                        :d="animatedPaths?.get(datapoint.id) ?? datapoint.path"
                        fill="none"
                        :stroke="datapoint.color"
                        :stroke-width="strokeWidths[datapoint.id].path"
                        stroke-linecap="round"
                        :class="{
                            'vue-data-ui-transition': transitionEnabled,
                            'vue-ui-galaxy-blur':
                                selectedSerie &&
                                selectedSerie !== datapoint.id &&
                                FINAL_CONFIG.useBlurOnHover,
                        }"
                    />
                    <g
                        :filter="`url(#blur_${uid})`"
                        v-if="datapoint.value && cfgArcs.gradient.show"
                    >
                        <path
                            :d="
                                animatedPaths?.get(datapoint.id) ??
                                datapoint.path
                            "
                            fill="none"
                            :stroke="cfgArcs.gradient.color"
                            :stroke-width="strokeWidths[datapoint.id].blur"
                            stroke-linecap="round"
                            :class="{
                                'vue-ui-galaxy-gradient': true,
                                'vue-data-ui-transition': transitionEnabled,
                                'vue-ui-galaxy-blur':
                                    selectedSerie &&
                                    selectedSerie !== datapoint.id &&
                                    FINAL_CONFIG.useBlurOnHover,
                            }"
                        />
                    </g>
                </g>

                <g aria-hidden="true" pointer-events="none">
                    <g
                        v-for="label in arcLabels"
                        :key="label.id"
                        :opacity="labelOpacity(label.id)"
                    >
                        <g
                            v-if="label.connector"
                            :mask="`url(#galaxy-connectors-${uid})`"
                            fill="none"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                        >
                            <path
                                :d="label.connector"
                                :stroke="cfgChart.backgroundColor"
                                :stroke-width="connectorBorderWidth"
                            />
                            <path
                                :d="label.connector"
                                :stroke="label.color"
                                stroke-width="1"
                                stroke-opacity="0.7"
                            />
                        </g>
                        <circle
                            v-if="label.connector"
                            data-cy="galaxy-datalabel-marker"
                            :data-series-id="label.id"
                            :cx="label.x"
                            :cy="label.y"
                            :r="markerRadius"
                            :fill="label.color"
                            :stroke="cfgChart.backgroundColor"
                            :stroke-width="markerBorderWidth"
                        />
                        <text
                            data-cy="galaxy-datalabel"
                            pointer-events="all"
                            @mouseenter="onLabelHover(label.id, true)"
                            @mouseleave="onLabelHover(label.id, false)"
                            :x="label.textX"
                            :y="label.textY"
                            :fill="cfgDataLabels.color ?? cfgChart.color"
                            :font-size="label.fontSize"
                            :font-weight="
                                cfgDataLabels.bold ? 'bold' : 'normal'
                            "
                            :text-anchor="label.left ? 'end' : 'start'"
                            dominant-baseline="central"
                        >
                            <tspan
                                v-if="label.text"
                                :textLength="label.textLength"
                                lengthAdjust="spacingAndGlyphs"
                            >
                                {{ label.text }}
                            </tspan>
                            <tspan
                                v-if="label.name"
                                :x="label.textX"
                                :dy="label.text ? label.fontSize : 0"
                                :font-size="label.nameSize"
                                font-weight="normal"
                                data-cy="galaxy-datalabel-name"
                            >
                                {{ label.name }}
                            </tspan>
                        </text>
                    </g>
                </g>

                <!-- TRAPS -->
                <g v-for="datapoint in galaxySet" :key="`trap_${datapoint.id}`">
                    <path
                        data-cy="tooltip-trap"
                        :data-a11y-serie-id="datapoint.id"
                        v-if="datapoint.value"
                        :d="animatedPaths?.get(datapoint.id) ?? datapoint.path"
                        fill="none"
                        stroke="transparent"
                        :stroke-width="strokeWidths[datapoint.id].border"
                        stroke-linecap="round"
                        :aria-label="`${datapoint.name}: ${dataLabel({
                            p: cfgLayout.labels.dataLabels.prefix,
                            v: datapoint.value,
                            s: cfgLayout.labels.dataLabels.suffix,
                            r: cfgChart.tooltip.roundingValue,
                        })}`"
                        @mouseenter="onDatapointPointerEnter(datapoint)"
                        @mouseleave="onTrapLeave(datapoint)"
                        @click="onTrapClick(datapoint)"
                    />
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

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport
            v-if="readyTeleport && (cfgChart.legend.show || $slots.legend)"
            :to="
                cfgChart.legend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div ref="chartLegend">
                <slot name="legend" v-bind:legend="legendSet">
                    <Legend
                        v-if="cfgChart.legend.show"
                        :legendSet="legendSet"
                        :config="legendConfig"
                        @clickMarker="({ legend }) => segregate(legend)"
                    >
                        <template #item="{ legend, index }">
                            <div
                                :data-cy="`legend-item-${index}`"
                                @click="segregate(legend)"
                                :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`"
                                v-if="!loading"
                            >
                                {{ legend.display }}
                            </div>
                        </template>

                        <template #legendToggle>
                            <BaseLegendToggle
                                v-if="
                                    legendSet.length > 2 &&
                                    cfgChart.legend.selectAllToggle.show &&
                                    !loading
                                "
                                :backgroundColor="
                                    cfgChart.legend.selectAllToggle
                                        .backgroundColor
                                "
                                :color="cfgChart.legend.selectAllToggle.color"
                                :fontSize="cfgChart.legend.fontSize"
                                :checked="segregated.length > 0"
                                @toggle="toggleLegend"
                            />
                        </template>
                    </Legend>
                </slot>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="cfgChart.tooltip.teleportTo"
            :show="isTooltip"
            :backgroundColor="cfgChart.tooltip.backgroundColor"
            :color="cfgChart.tooltip.color"
            :borderRadius="cfgChart.tooltip.borderRadius"
            :borderColor="cfgChart.tooltip.borderColor"
            :borderWidth="cfgChart.tooltip.borderWidth"
            :fontSize="cfgChart.tooltip.fontSize"
            :backgroundOpacity="cfgChart.tooltip.backgroundOpacity"
            :position="cfgChart.tooltip.position"
            :offsetX="cfgChart.tooltip.offsetX"
            :offsetY="cfgChart.tooltip.offsetY"
            :parent="galaxyChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="isFunction(cfgChart.tooltip.customFormat)"
            :smooth="cfgChart.tooltip.smooth"
            :backdropFilter="cfgChart.tooltip.backdropFilter"
            :smoothForce="cfgChart.tooltip.smoothForce"
            :smoothSnapThreshold="cfgChart.tooltip.smoothSnapThreshold"
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
                        <div v-if="th === '__SUM__'">
                            <BaseIcon
                                name="sigma"
                                :stroke="dataTable.config.th.color"
                                :size="16"
                            />
                        </div>
                        <div v-else>{{ th }}</div>
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

<style scoped>
.vue-ui-galaxy * {
    transition: unset;
}
.vue-ui-galaxy {
    user-select: none;
    position: relative;
}

.loading path {
    transition: none !important;
}

.vue-ui-galaxy .vue-ui-galaxy-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    text-align: center;
    width: 100%;
}

.vue-ui-dna * {
    animation: none !important;
}

.vue-ui-galaxy-blur {
    filter: blur(3px) opacity(50%) grayscale(100%);
    transition: all 0.15s ease-in-out;
}

.loading .vue-ui-galaxy-blur {
    transition: none !important;
}

.vue-data-ui-fullscreen--on {
    height: 80% !important;
    margin: 0 auto !important;
}
.vue-data-ui-fullscreen--off {
    max-width: 100%;
}
.vue-data-ui-wrapper-fullscreen {
    overflow: auto;
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

.vue-data-ui-transition {
    transition:
        stroke 0.2s ease-in-out,
        stroke-width 0.2s ease-in-out;
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

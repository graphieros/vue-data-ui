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

import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onMounted,
    onBeforeUnmount,
    ref,
    watch,
} from 'vue';
import {
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcNutArrowPath,
    checkNaN,
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
    treeShake,
    XMLNS,
} from '../lib';
import { useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { usePrefersReducedMotion } from '../usePrefersMotion';
import { usePrinter } from '../usePrinter';

import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import img from '../img';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_3d_bar.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import DefGrad from '../atoms/DefGrad.vue';

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

const { vue_ui_3d_bar: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Object,
        default() {
            return {};
        },
    },
});

const emits = defineEmits(['selectDatapoint', 'copyAlt']);

const isDataset = computed(() => {
    const ds = props.dataset;
    if (!ds || typeof ds !== 'object') return false;
    if (ds.series != null)
        return (
            Array.isArray(ds.series) &&
            ds.series.length > 0 &&
            ds.series.every(
                (serie) =>
                    serie &&
                    typeof serie === 'object' &&
                    'name' in serie &&
                    Number.isFinite(serie.value) &&
                    (serie.breakdown == null ||
                        (Array.isArray(serie.breakdown) &&
                            serie.breakdown.every(
                                (item) =>
                                    item &&
                                    typeof item === 'object' &&
                                    'name' in item &&
                                    Number.isFinite(item.value),
                            ))),
            )
        );
    return Number.isFinite(ds.percentage);
});
const resolvedConfig = computed(prepareConfig);
const loading = computed(
    () => !!resolvedConfig.value.loading || !isDataset.value,
);
const prefersReducedMotion = usePrefersReducedMotion();
let disposed = false;
let resizeObserver = null;
let resizeFrame = null;

const uid = ref(createUid());
const bar3dChart = ref(null);
const selectionIsFixed = ref(false);
const titleStep = ref(0);
const tableStep = ref(0);
const chartTitle = ref(null);
const source = ref(null);
const isFocus = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            customPalette: ['#808080', '#ADADAD', '#DBDBDB'],
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    color: '#6A6A6A',
                    bar: {
                        color: '#ADADAD',
                        stroke: '#6A6A6A',
                    },
                    box: {
                        stroke: '#6A6A6A',
                    },
                },
            },
        },
        userConfig: resolvedConfig.value.skeletonConfig ?? {},
    });
});

const FINAL_CONFIG = computed(() =>
    loading.value
        ? treeShake({
              defaultConfig: resolvedConfig.value,
              userConfig: skeletonConfig.value,
          })
        : resolvedConfig.value,
);

const style = computed(() => FINAL_CONFIG.value.style);
const chart = computed(() => FINAL_CONFIG.value.style.chart);
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUi3dBar',
    rules: [
        {
            test: (ds) => Array.isArray(ds?.series) && ds.series.length > 8,
            message: [
                '👀 The number of series is > 8. Consider:',
                '',
                '▶️ Grouping small values dynamically into a single "Other" series.',
                '',
                '▶️ Using filters to let users choose a maximum number of series to display.',
                '',
                '▶️ Using VueUiHorizontalBar instead to make the dataset breakdown easier to read.',
            ],
        },
        {
            test: (ds) =>
                Array.isArray(ds?.series) &&
                ds.series.some(
                    (dp) => dp?.breakdown && dp.breakdown.length > 6,
                ),
            message: [
                '👀 Some donut breakdowns have > 6 data points. Consider:',
                '',
                '▶️ Grouping small values dynamically into a single "Other" data point.',
            ],
        },
    ],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const defaultSkeletonDataset = {
    series: [
        {
            name: '_',
            value: 21,
            breakdown: [
                { name: '_', value: 13 },
                { name: '_', value: 8 },
            ],
        },
        {
            name: '_',
            value: 13,
            breakdown: [
                { name: '_', value: 8 },
                { name: '_', value: 5 },
            ],
        },
        {
            name: '_',
            value: 8,
            breakdown: [
                { name: '_', value: 5 },
                { name: '_', value: 3 },
            ],
        },
    ],
};
const FINAL_DATASET = computed(() =>
    loading.value
        ? (props.config?.skeletonDataset ?? defaultSkeletonDataset)
        : props.dataset,
);

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: FINAL_CONFIG.value.style.chart.title,
});

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

watch(
    () => props.config,
    () => {
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        titleStep.value += 1;
        tableStep.value += 1;
    },
    { deep: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `3d_bar_${uid.value}`,
    fileName: chart.value.title.text || 'vue-ui-3d-bar',
    options: FINAL_CONFIG.value.userOptions.print,
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

watch([() => FINAL_CONFIG.value.table.show, loading], ([value]) => {
    mutableConfig.value.showTable = value;
});

const hasStack = computed(() => {
    return FINAL_DATASET.value.series && FINAL_DATASET.value.series.length;
});

const WIDTH = ref(chart.value.box.dimensions.width * (hasStack.value ? 2 : 1));
const HEIGHT = ref(chart.value.box.dimensions.height);

const svg = computed(() => {
    return {
        height: HEIGHT.value,
        width: WIDTH.value,
        absoluteWidth: WIDTH.value,
        top: chart.value.box.dimensions.top,
        bottom: chart.value.box.dimensions.bottom,
        left: chart.value.box.dimensions.left,
        right: chart.value.box.dimensions.right,
        perspective: chart.value.box.dimensions.perspective,
    };
});

const total = computed(() =>
    (FINAL_DATASET.value.series || []).reduce(
        (sum, serie) => sum + Math.max(0, serie.value || 0),
        0,
    ),
);
const preparedStack = computed(() => {
    if (!hasStack.value) return null;
    const ids = new Set();
    return FINAL_DATASET.value.series
        .map((serie, seriesIndex) => {
            let id =
                serie.id == null
                    ? `bar3d_${uid.value}_${seriesIndex}`
                    : `bar3d_${uid.value}_id_${Array.from(String(serie.id), (char) => char.codePointAt(0).toString(16)).join('_')}`;
            if (ids.has(id)) id += `_duplicate_${seriesIndex}`;
            ids.add(id);
            const value = Math.max(0, serie.value || 0);
            return {
                ...serie,
                value,
                id,
                seriesIndex,
                proportion: total.value ? value / total.value : 0,
                color:
                    convertColorToHex(serie.color) ||
                    customPalette.value[seriesIndex] ||
                    palette[seriesIndex % palette.length],
                breakdown: serie.breakdown
                    ? [...serie.breakdown]
                          .map((item) => ({
                              ...item,
                              value: Math.max(0, item.value || 0),
                          }))
                          .sort((a, b) => b.value - a.value)
                    : null,
            };
        })
        .sort((a, b) => b.value - a.value);
});
const stack = computed(() => {
    if (!preparedStack.value) return null;
    let start = 0;
    return preparedStack.value.map((serie) => {
        const fill = createFill(
            start,
            serie.proportion,
            serie.breakdown,
            serie.color,
        );
        start += serie.proportion;
        return { ...serie, fill };
    });
});

const box = computed(() => {
    const CX = svg.value.width / 2;
    const S = svg.value;

    return {
        right: `M${CX},${S.top} ${S.width - S.right}, ${S.top + S.perspective} ${S.width - S.right},${S.height - S.bottom - S.perspective} ${CX},${S.height - S.bottom}`,
        left: `M${CX},${S.top} ${S.left},${S.top + S.perspective} ${S.left},${S.height - S.bottom - S.perspective} ${CX},${S.height - S.bottom}`,
        side: `M${CX},${S.height - S.bottom} ${CX},${S.top + S.perspective * 2}`,
        topSides: `M${S.left},${S.top + S.perspective} ${CX},${S.top + S.perspective * 2} ${S.width - S.right},${S.top + S.perspective}`,
        tubeTop: `M${S.left},${S.top + S.perspective} C ${S.left},${S.top - S.perspective / 3} ${S.width - S.right},${S.top - S.perspective / 3} ${S.width - S.right},${S.top + S.perspective} C ${S.width - S.right},${S.top + S.perspective * 2.3} ${S.left},${S.top + S.perspective * 2.3} ${S.left},${S.top + S.perspective}`,
        tubeLeft: `M${S.left},${S.top + S.perspective} ${S.left},${S.height - S.bottom - S.perspective}`,
        tubeRight: `M${S.width - S.right},${S.top + S.perspective} ${S.width - S.right},${S.height - S.bottom - S.perspective}`,
        tubeBottom: `M${S.width - S.right},${S.height - S.bottom - S.perspective} C ${S.width - S.right},${S.height} ${S.left},${S.height} ${S.left},${S.height - S.bottom - S.perspective}`,
    };
});

const activeValue = ref(0);
let animationFrame = null;
let animationSequence = 0;
function stopAnimation() {
    animationSequence += 1;
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
}
watch(
    [
        () => FINAL_DATASET.value.percentage,
        () => chart.value.animation.use,
        () => chart.value.animation.speed,
        () => chart.value.animation.acceleration,
        hasStack,
        loading,
        prefersReducedMotion,
    ],
    ([percentage]) => {
        stopAnimation();
        const target = Number.isFinite(percentage) ? percentage : 0;
        const { use, speed, acceleration } = chart.value.animation;
        if (disposed) return;
        if (
            !use ||
            hasStack.value ||
            loading.value ||
            prefersReducedMotion.value ||
            !Number.isFinite(speed) ||
            speed <= 0 ||
            !Number.isFinite(acceleration) ||
            acceleration < 0 ||
            target <= 0
        ) {
            activeValue.value = target;
            return;
        }
        activeValue.value = 0;
        const sequence = animationSequence;
        let increment = 0;
        function animate() {
            if (disposed || sequence !== animationSequence) return;
            animationFrame = null;
            activeValue.value = Math.min(
                target,
                activeValue.value + speed + increment,
            );
            increment += 0.005 * acceleration;
            if (activeValue.value < target)
                animationFrame = requestAnimationFrame(animate);
        }
        animate();
    },
    { immediate: true },
);

onMounted(setupSizing);
const debug = computed(() => resolvedConfig.value.debug);

function logErrors() {
    if (!debug.value) return;
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUi3dBar',
            type: 'dataset',
            debug: debug.value,
        });
    } else {
        if (!props.dataset.series) {
            getMissingDatasetAttributes({
                datasetObject: props.dataset,
                requiredAttributes: ['percentage'],
            }).forEach((attr) => {
                error({
                    componentName: 'VueUi3dBar',
                    type: 'datasetAttribute',
                    property: attr,
                    debug: debug.value,
                });
            });
        } else {
            if (!Array.isArray(props.dataset.series)) {
                console.warn('VueUi3dBar: dataset series must be an array.');
                return;
            }
            props.dataset.series.forEach((serie, i) => {
                if (!serie || typeof serie !== 'object') {
                    console.warn(
                        `VueUi3dBar: series at index ${i} must be an object.`,
                    );
                    return;
                }
                getMissingDatasetAttributes({
                    datasetObject: serie,
                    requiredAttributes: ['name', 'value'],
                }).forEach((attr) => {
                    error({
                        componentName: 'VueUi3dBar',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: i,
                        debug: debug.value,
                    });
                });
                if (serie.breakdown) {
                    if (!Array.isArray(serie.breakdown)) {
                        console.warn(
                            `VueUi3dBar: breakdown at series index ${i} must be an array.`,
                        );
                        return;
                    }
                    serie.breakdown.forEach((b, j) => {
                        if (!b || typeof b !== 'object') {
                            console.warn(
                                `VueUi3dBar: breakdown at index ${i} - ${j} must be an object.`,
                            );
                            return;
                        }
                        getMissingDatasetAttributes({
                            datasetObject: b,
                            requiredAttributes: ['name', 'value'],
                        }).forEach((attr) => {
                            error({
                                componentName: 'VueUi3dBar',
                                type: 'datasetSerieAttribute',
                                property: attr,
                                index: `${i} - ${j}`,
                                debug: debug.value,
                            });
                        });
                    });
                }
            });
        }
    }
}

watch([() => props.dataset, debug], logErrors, { deep: true, immediate: true });
function resizeChart() {
    resizeFrame = null;
    if (
        disposed ||
        !FINAL_CONFIG.value.responsive ||
        !bar3dChart.value?.parentNode
    )
        return;
    const { width, height } = useResponsive({
        chart: bar3dChart.value,
        title: chart.value.title.text ? chartTitle.value : null,
        source: source.value,
    });
    HEIGHT.value = height - 12;
    WIDTH.value = width;
}
function scheduleResize() {
    if (!disposed && FINAL_CONFIG.value.responsive && resizeFrame === null)
        resizeFrame = requestAnimationFrame(resizeChart);
}
function setFixedSize() {
    WIDTH.value = chart.value.box.dimensions.width * (hasStack.value ? 2 : 1);
    HEIGHT.value = chart.value.box.dimensions.height;
}
function setupSizing() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
    if (disposed) return;
    if (FINAL_CONFIG.value.responsive && bar3dChart.value?.parentNode) {
        resizeObserver = new ResizeObserver(scheduleResize);
        resizeObserver.observe(bar3dChart.value.parentNode);
        scheduleResize();
    } else setFixedSize();
}
watch(() => FINAL_CONFIG.value.responsive, setupSizing, { flush: 'post' });
watch(
    [() => chart.value.box.dimensions, hasStack],
    () => {
        if (FINAL_CONFIG.value.responsive) scheduleResize();
        else setFixedSize();
    },
    { deep: true },
);
watch(() => chart.value.title, scheduleResize, { deep: true, flush: 'post' });
onBeforeUnmount(() => {
    disposed = true;
    stopAnimation();
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeObserver?.disconnect();
});

const CX = computed(() => {
    const W = svg.value.width;
    return W / 4;
});

function createFill(startProportion, proportion, breakdown, color) {
    const _height =
        svg.value.height -
        svg.value.bottom -
        svg.value.top -
        svg.value.perspective * 2;

    const {
        width: W,
        height: H,
        bottom: B,
        right: R,
        left: L,
        perspective: P,
    } = svg.value;

    const CENTER_X = hasStack.value ? W / 4 : W / 2;
    const RIGHT = CENTER_X * 2 + L;

    const relativeB = B + _height * startProportion;
    const midY = H - relativeB - P - (_height * proportion) / 2;
    const donutPosition = midY > svg.value.height / 2 ? 'top' : 'bottom';
    const donutOffset = H * 0.25;

    const hasBreakdown = !!breakdown?.length && sumValues(breakdown) > 0;
    let donut = null;
    let miniDonut = null;
    if (hasBreakdown) {
        breakdown = breakdown.map((ds, i) => {
            return {
                ...ds,
                value: ds.value || 0,
                color: lightenHexColor(color, i / breakdown.length),
            };
        });
        donut = makeDonut(
            { series: breakdown },
            W / 2 + W / 5,
            donutPosition === 'top' ? midY - donutOffset : midY + donutOffset,
            W / 10,
            W / 10,
            1.99999,
            2,
            1,
            360,
            105.25,
            W / 20,
        );
        miniDonut = makeDonut(
            { series: breakdown },
            W - RIGHT + W / 14,
            H - relativeB - P - (_height * proportion) / 2,
            W / 40,
            W / 40,
            1.99999,
            2,
            1,
            360,
            105.25,
            W / 40,
        );
    }

    const result = {
        ...createFaces(startProportion, proportion),
        donut,
        miniDonut,
        donutR: W / 20,
        CENTER_X,
        sidePointer: {
            x: W - RIGHT,
            x2: W - RIGHT + W / 14,
            xText: W - RIGHT + W / 9,
            y: H - relativeB - P - (_height * proportion) / 2,
            topY: H - relativeB - P - _height * proportion,
            height: _height * proportion,
        },
        apexBottom: { y: H - relativeB, x: CENTER_X },
        apexTop: { y: H - relativeB - _height * proportion, x: CENTER_X },
        liningTop: `M${L},${H - relativeB - P - _height * proportion} ${CENTER_X},${H - relativeB - _height * proportion} ${W - RIGHT},${H - relativeB - P - _height * proportion}`,
        liningTopShade: `M${L},${H - relativeB - P - _height * proportion - 0.5} ${CENTER_X},${H - relativeB - _height * proportion - 0.5} ${W - RIGHT},${H - relativeB - P - _height * proportion - 0.5}`,
        bottomTubeTop: `M ${W - RIGHT - 0.5},${H - relativeB - P} C ${W - RIGHT - 0.5},${H - relativeB + P / 2} ${L},${H - relativeB + P / 2} ${L + 0.5},${H - relativeB - P}`,
    };

    return result;
}

function createFaces(startProportion, proportion, single = false) {
    const {
        width: W,
        height: H,
        bottom: B,
        right: R,
        left: L,
        perspective: P,
    } = svg.value;
    const height = H - B - svg.value.top - P * 2;
    const CENTER_X = hasStack.value ? W / 4 : W / 2;
    const RIGHT = hasStack.value ? CENTER_X * 2 + L : R;
    const relativeB = B + height * startProportion;
    return {
        right: `M${CENTER_X},${H - relativeB} ${CENTER_X},${H - relativeB - height * proportion} ${W - RIGHT},${H - relativeB - P - height * proportion} ${W - RIGHT},${H - relativeB - P}Z`,
        left: `M${CENTER_X},${H - relativeB} ${CENTER_X},${H - relativeB - height * proportion} ${L}, ${H - relativeB - P - height * proportion} ${L},${H - relativeB - P}Z`,
        top: `M${CENTER_X},${H - relativeB - height * proportion} ${L},${H - relativeB - P - height * proportion} ${CENTER_X},${H - relativeB - P * 2 - height * proportion} ${W - RIGHT},${H - relativeB - P - height * proportion} Z`,
        tubeTop: `M${L},${H - relativeB - height * proportion - P} C ${L},${H - relativeB - height * proportion - P * 2.5} ${W - RIGHT},${H - relativeB - height * proportion - P * 2.5} ${W - RIGHT},${H - relativeB - height * proportion - P} C ${W - RIGHT},${H - relativeB - height * proportion + P / 2} ${L},${H - relativeB - height * proportion + P / 2} ${L},${H - relativeB - height * proportion - P}`,
        tubeBody: `M
        ${L},${H - relativeB - height * proportion - P} 
        C ${L},${H - relativeB - height * proportion + P / 2} 
        ${W - RIGHT},${H - relativeB - height * proportion + P / 2} 
        ${W - RIGHT},${H - relativeB - height * proportion - P} 
        L${W - RIGHT},${single ? H - P * 1.5 : H - relativeB - P}
        C 
        ${W - RIGHT},${single ? H : H - relativeB + P / 2}
        ${L},${single ? H : H - relativeB + P / 2}
        ${L},${H - relativeB - P}Z`,
    };
}
const fill = computed(() =>
    createFaces(0, checkNaN(activeValue.value / 100), true),
);

const selectedSerie = ref(null);
const activeAccessibilityIndex = computed(() => {
    const index =
        stack.value?.findIndex((serie) => serie.id === selectedSerie.value) ??
        -1;
    return index >= 0 ? index : null;
});
const selectedBar = computed(
    () =>
        stack.value?.find((serie) => serie.id === selectedSerie.value) ?? null,
);
const a11yAnnouncement = computed(() =>
    selectedBar.value
        ? buildAccessibilityAnnouncement(selectedBar.value) +
          (selectionIsFixed.value ? ' selected' : '')
        : '',
);
watch([stack, loading], () => {
    if (loading.value || (selectedSerie.value != null && !selectedBar.value))
        clearAccessibilitySelection();
});
function selectSerie(bar, fix = false) {
    if (loading.value) return;
    const event = fix ? 'datapointClick' : 'datapointEnter';
    FINAL_CONFIG.value.events[event]?.({
        datapoint: bar,
        seriesIndex: bar.seriesIndex,
    });
    emits('selectDatapoint', bar);
    if (fix)
        selectionIsFixed.value = !(
            selectionIsFixed.value && selectedSerie.value === bar.id
        );
    selectedSerie.value = bar.id;
}
function unselectSerie(bar) {
    FINAL_CONFIG.value.events.datapointLeave?.({
        datapoint: bar,
        seriesIndex: bar.seriesIndex,
    });
    if (!selectionIsFixed.value) selectedSerie.value = null;
}

const breakdownTotals = computed(
    () =>
        new Map(
            (preparedStack.value || []).map((serie) => [
                serie.id,
                sumValues(serie.breakdown || []),
            ]),
        ),
);
function displayArcPercentage(arc, bar, numOnly = false) {
    const breakdownTotal = breakdownTotals.value.get(bar.id) || 0;
    const percentage = numOnly
        ? breakdownTotal
            ? (arc.value / breakdownTotal) * 100
            : 0
        : total.value
          ? (arc.value / total.value) * 100
          : 0;
    return numOnly ? percentage : percentage.toFixed(0) + '%';
}
function sumValues(src) {
    return src.reduce((sum, item) => sum + item.value, 0);
}

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
}

/**
 * Return stacked geometry when stacking is active, otherwise percentage data.
 * Both branches return internal data rather than defensive copies.
 */
function getData() {
    if (hasStack.value) {
        return stack.value;
    } else {
        return FINAL_DATASET.value.percentage;
    }
}

const table = computed(() => {
    if (!hasStack.value) {
        return null;
    } else {
        const head = preparedStack.value.flatMap((ds) => {
            if (ds.breakdown && ds.breakdown.length) {
                return [
                    { name: ds.name, color: ds.color },
                    ...ds.breakdown.map((b, i) => {
                        return {
                            name: b.name,
                            color: lightenHexColor(
                                ds.color,
                                i / ds.breakdown.length,
                            ),
                        };
                    }),
                ];
            } else {
                return {
                    name: ds.name,
                    color: ds.color,
                };
            }
        });
        const body = preparedStack.value.flatMap((ds) => {
            if (ds.breakdown && ds.breakdown.length) {
                return [ds.value, ...ds.breakdown.map((b) => b.value)];
            } else {
                return ds.value;
            }
        });
        return { head, body };
    }
});

function generateCsv(callback = null) {
    if (!hasStack.value) {
        console.warn(
            'VueUi3dBar : CSV download is only available in stack mode (providing dataset.series instead of dataset.percentage)',
        );
        return;
    }
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [
                [h.name],
                [table.value.body[i]],
                [
                    isNaN(table.value.body[i] / total.value)
                        ? '-'
                        : (table.value.body[i] / total.value) * 100,
                ],
            ];
        });
        const tableXls = [
            [chart.value.title.text],
            [chart.value.title.subtitle.text],
            [[''], ['val'], ['%']],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);
        if (!callback) {
            downloadCsv({
                csvContent,
                title: chart.value.title.text || 'vue-ui-3d-bar',
            });
        } else {
            callback(csvContent);
        }
    });
}

const tableConfig = computed(() => ({
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
    shape: FINAL_CONFIG.value.style.shape === 'tube' ? 'circle' : 'square',
}));

const dataTable = computed(() => {
    if (!hasStack.value || !Array.isArray(stack.value) || !stack.value.length) {
        return {
            colNames: [],
            head: [],
            body: [],
            a11yBody: [],
            config: tableConfig.value,
        };
    }

    const head = [
        `__SUM__`,
        dataLabel({
            p: chart.value.legend.prefix,
            v: total.value,
            s: chart.value.legend.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        }),
        total.value ? '100%' : '-',
    ];

    const body = table.value.head.map((headerItem, index) => {
        const rawValue = table.value.body[index];

        return [
            {
                color: headerItem.color,
                name: headerItem.name,
            },
            dataLabel({
                p: chart.value.legend.prefix,
                v: rawValue,
                s: chart.value.legend.suffix,
                r: FINAL_CONFIG.value.table.td.roundingValue,
            }),
            isNaN(rawValue / total.value)
                ? '-'
                : dataLabel({
                      v: (rawValue / total.value) * 100,
                      s: '%',
                      r: FINAL_CONFIG.value.table.td.roundingPercentage,
                  }),
        ];
    });

    const a11yBody = body.map((row) => {
        return row.map((cell, index) => {
            if (index === 0) {
                return cell.name;
            }
            return cell;
        });
    });

    return {
        colNames: [
            FINAL_CONFIG.value.table.columnNames.series,
            FINAL_CONFIG.value.table.columnNames.value,
            FINAL_CONFIG.value.table.columnNames.percentage,
        ],
        head,
        body,
        a11yBody,
        config: tableConfig.value,
    };
});

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2 } = {}) {
    if (!bar3dChart.value) return;
    const { width, height } = bar3dChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: bar3dChart.value,
        base64: true,
        img: true,
        scale,
    });
    return {
        imageUri,
        base64,
        title: chart.value.title.text,
        width,
        height,
        aspectRatio,
    };
}

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: chart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: bar3dChart,
        maxWidth: 800,
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

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

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

async function copyAlt() {
    emits('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: FINAL_DATASET.value,
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
            dataset: FINAL_DATASET.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/

function clearAccessibilitySelection() {
    selectionIsFixed.value = false;
    selectedSerie.value = null;
}

function buildAccessibilityAnnouncement(bar) {
    if (!bar) return '';
    const valueLabel = dataLabel({
        p: chart.value.legend.prefix,
        v: bar.value,
        s: chart.value.legend.suffix,
        r: chart.value.legend.roundingValue,
    });
    const percentageLabel = dataLabel({
        v: bar.proportion * 100,
        s: '%',
        r: chart.value.legend.roundingPercentage,
    });
    return `${bar.name}: ${valueLabel}, ${percentageLabel}`;
}

function focusSeriesByIndex(index) {
    if (!hasStack.value || !stack.value?.length) return;
    const bar = stack.value[index];
    if (!bar) return;
    selectedSerie.value = bar.id;
}

function onSvgFocus() {
    isFocus.value = true;
    if (loading.value || !hasStack.value || !stack.value?.length) return;
    if (activeAccessibilityIndex.value === null) {
        focusSeriesByIndex(0);
    }
}

function onSvgBlur() {
    isFocus.value = false;

    if (!selectionIsFixed.value) {
        selectedSerie.value = null;
    }
}

function onSvgKeydown(event) {
    if (
        loading.value ||
        isAnnotator.value ||
        !hasStack.value ||
        !stack.value?.length
    )
        return;
    if (!svgRef.value) return;
    if (document.activeElement !== svgRef.value) return;

    const isPreviousKey = ['ArrowLeft', 'ArrowDown'].includes(event.key);
    const isNextKey = ['ArrowRight', 'ArrowUp'].includes(event.key);
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearAccessibilitySelection();
        return;
    }

    if (isActivationKey) {
        if (activeAccessibilityIndex.value === null) return;
        const bar = stack.value[activeAccessibilityIndex.value];
        if (!bar) return;
        selectSerie(bar, true);
        return;
    }

    let nextIndex = activeAccessibilityIndex.value;

    if (
        nextIndex === null ||
        nextIndex < 0 ||
        nextIndex >= stack.value.length
    ) {
        nextIndex = isNextKey ? 0 : stack.value.length - 1;
    } else if (isNextKey) {
        nextIndex += 1;
        if (nextIndex >= stack.value.length) {
            nextIndex = 0;
        }
    } else if (isPreviousKey) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = stack.value.length - 1;
        }
    }

    focusSeriesByIndex(nextIndex);
}

const a11yTable = computed(() => {
    return {
        headers: dataTable.value?.colNames ?? [],
        rows: dataTable.value?.a11yBody ?? [],
    };
});

defineExpose({
    getImage,
    generateCsv,
    generatePdf,
    generateImage,
    generateSvg,
    getData,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        ref="bar3dChart"
        :class="`vue-data-ui-component vue-ui-3d-bar`"
        :style="`font-family:${style.fontFamily};width:100%; text-align:center;background:${chart.backgroundColor}`"
        :id="`3d_bar_${uid}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <div aria-live="polite" class="sr-only">
            {{ a11yAnnouncement }}
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
            :backgroundColor="chart.backgroundColor"
            :color="chart.color"
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
            v-if="chart.title.text"
            :style="`width:100%;background:transparent`"
        >
            <!-- TITLE AS DIV -->
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: '3dBar-div-title',
                        ...chart.title,
                    },
                    subtitle: {
                        cy: '3dBar-div-subtitle',
                        ...chart.title.subtitle,
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            v-if="
                cfgUserOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="chart.backgroundColor"
            :color="chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTable="!!hasStack && cfgUserOptions.buttons.table"
            :hasXls="!!hasStack && cfgUserOptions.buttons.csv"
            :isFullscreen="isFullscreen"
            :chartElement="bar3dChart"
            v-bind="
                getUserOptionsProps(
                    cfgUserOptions,
                    'pdf img svg fullscreen altCopy annotator',
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
                    'menuIcon optionPdf optionCsv optionImg optionSvg optionTable optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
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
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                }"
                data-cy="3d-bar-svg"
                :viewBox="`0 0 ${svg.absoluteWidth} ${svg.height}`"
                :style="`max-width:100%; overflow: visible; background:transparent;color:${chart.color}`"
                tabindex="0"
                :aria-describedby="`chart-instructions-${uid}`"
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
                    :width="svg.absoluteWidth"
                    :height="svg.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <!-- DEFS -->
                <defs>
                    <DefGrad
                        t="radial"
                        :id="`gradient_top${uid}`"
                        :stops="[
                            ['0%', setOpacity(chart.backgroundColor, 0), 1],
                            ['100%', chart.bar.color, 1],
                        ]"
                    />
                    <DefGrad
                        t="radial"
                        :id="`gradient_tube_top${uid}`"
                        :stops="[
                            [
                                '0%',
                                setOpacity(
                                    lightenHexColor(chart.bar.color, 0.5),
                                    80,
                                ),
                                1,
                            ],
                            [
                                '100%',
                                setOpacity(
                                    darkenHexColor(chart.bar.color, 0.1),
                                    80,
                                ),
                                1,
                            ],
                        ]"
                    />
                    <DefGrad
                        t="radial"
                        :id="`gradient_left${uid}`"
                        :stops="[
                            ['0%', setOpacity(chart.backgroundColor, 0), 1],
                            ['100%', setOpacity(chart.bar.color, 20), 1],
                        ]"
                    />
                    <DefGrad
                        t="radial"
                        :id="`gradient_right${uid}`"
                        :stops="[
                            ['0%', setOpacity(chart.backgroundColor, 0), 1],
                            ['100%', setOpacity(chart.bar.color, 20), 1],
                        ]"
                    />
                    <DefGrad
                        t="linear"
                        :id="`gradient_tube_body${uid}`"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                        :stops="[
                            ['0%', chart.bar.color, 1],
                            [
                                '10%',
                                setOpacity(
                                    darkenHexColor(chart.bar.color, 0.7),
                                    100,
                                ),
                                1,
                            ],
                            [
                                '25%',
                                setOpacity(
                                    darkenHexColor(chart.bar.color, 0.5),
                                    100,
                                ),
                                1,
                            ],
                            ['75%', setOpacity(chart.bar.color, 80), 1],
                            [
                                '100%',
                                setOpacity(
                                    lightenHexColor(chart.bar.color, 0.7),
                                    100,
                                ),
                                1,
                            ],
                        ]"
                    />
                </defs>

                <defs v-if="hasStack">
                    <DefGrad
                        t="radial"
                        v-for="bar in stack"
                        :id="`grad_top_${bar.id}`"
                        :key="`grad_top_${bar.id}`"
                        :stops="[
                            [
                                '0%',
                                setOpacity(lightenHexColor(bar.color, 0.5), 80),
                                1,
                            ],
                            ['100%', bar.color, 1],
                        ]"
                    />
                    <DefGrad
                        t="linear"
                        v-for="bar in stack"
                        :id="`grad_left_${bar.id}`"
                        :key="`grad_left_${bar.id}`"
                        :stops="[
                            ['0%', setOpacity(bar.color, 80), 1],
                            [
                                '100%',
                                setOpacity(darkenHexColor(bar.color, 0.5), 100),
                                1,
                            ],
                        ]"
                    />
                    <DefGrad
                        t="linear"
                        v-for="bar in stack"
                        :id="`grad_right_${bar.id}`"
                        :key="`grad_right_${bar.id}`"
                        :stops="[
                            [
                                '2%',
                                setOpacity(
                                    lightenHexColor(bar.color, 0.5),
                                    100,
                                ),
                                1,
                            ],
                            ['100%', setOpacity(bar.color, 80), 1],
                        ]"
                    />
                    <DefGrad
                        t="linear"
                        x1="0%"
                        y1="0%"
                        x2="0%"
                        y2="100%"
                        :id="`vertical_line_${uid}`"
                        :stops="[
                            ['0%', '#FFFFFF', 1],
                            ['100%', '#FFFFFF33', 1],
                        ]"
                    />
                </defs>

                <text
                    data-cy="vue-ui-3d-bar-simple-datalabel"
                    v-if="
                        chart.dataLabel.show &&
                        ![null, undefined].includes(FINAL_DATASET.percentage) &&
                        [null, undefined].includes(FINAL_DATASET.series)
                    "
                    :x="svg.width / 2"
                    :y="svg.top - chart.dataLabel.fontSize / 2"
                    :font-size="chart.dataLabel.fontSize"
                    :font-weight="chart.dataLabel.bold ? 'bold' : 'normal'"
                    :fill="chart.dataLabel.color"
                    text-anchor="middle"
                >
                    {{
                        dataLabel({
                            v: activeValue,
                            s: '%',
                            r: chart.dataLabel.rounding,
                        })
                    }}
                </text>

                <!-- FIX KILLER -->
                <g
                    v-if="selectionIsFixed"
                    role="button"
                    tabindex="0"
                    aria-label="Clear selection"
                    @click="clearAccessibilitySelection()"
                    @keydown.enter.prevent="clearAccessibilitySelection()"
                    @keydown.space.prevent="clearAccessibilitySelection()"
                    @focus="isFocus = true"
                    @blur="isFocus = false"
                    @mouseenter="isFocus = true"
                    @mouseleave="isFocus = false"
                    class="svg-btn"
                    data-dom-to-png-ignore
                    :style="{
                        cursor: isCursorPointer ? 'pointer' : 'default',
                        outline: 'none',
                    }"
                >
                    <title>Clear selection</title>

                    <rect
                        :x="CX - 12"
                        :y="svg.top - 24"
                        :width="24"
                        :height="24"
                        fill="transparent"
                        pointer-events="all"
                    />

                    <circle
                        :cx="CX"
                        :cy="svg.top - 12"
                        r="10"
                        fill="none"
                        :stroke="chart.color"
                        stroke-width="2"
                        vector-effect="non-scaling-stroke"
                        :opacity="isFocus ? 0.5 : 0"
                    />

                    <path
                        :d="`M${CX - 6},${svg.top - 18} ${CX + 6},${svg.top - 6}`"
                        :stroke="chart.color"
                        stroke-linecap="round"
                        stroke-width="2"
                        vector-effect="non-scaling-stroke"
                    />
                    <path
                        :d="`M${CX + 6},${svg.top - 18} ${CX - 6},${svg.top - 6}`"
                        :stroke="chart.color"
                        stroke-linecap="round"
                        stroke-width="2"
                        vector-effect="non-scaling-stroke"
                    />
                </g>

                <g v-if="!style.shape || style.shape === 'bar'">
                    <!-- BOX SKELETON -->
                    <g v-if="!hasStack">
                        <path
                            :stroke-dasharray="chart.box.strokeDasharray"
                            :d="box.right"
                            :stroke="chart.box.stroke"
                            :stroke-width="chart.box.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            fill="none"
                        />
                        <path
                            :stroke-dasharray="chart.box.strokeDasharray"
                            :d="box.left"
                            :stroke="chart.box.stroke"
                            :stroke-width="chart.box.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            fill="none"
                        />
                        <path
                            :stroke-dasharray="chart.box.strokeDasharray"
                            :d="box.side"
                            :stroke="chart.box.stroke"
                            :stroke-width="chart.box.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            fill="none"
                        />
                        <path
                            :stroke-dasharray="chart.box.strokeDasharray"
                            :d="box.topSides"
                            :stroke="chart.box.stroke"
                            :stroke-width="chart.box.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            fill="none"
                        />
                    </g>

                    <!-- FILL BOX -->
                    <g v-if="!hasStack">
                        <path
                            :d="fill.right"
                            :stroke="chart.bar.stroke"
                            :stroke-width="chart.bar.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            :fill="`url(#gradient_right${uid})`"
                        />
                        <path
                            :d="fill.left"
                            :stroke="chart.bar.stroke"
                            :stroke-width="chart.bar.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            :fill="`url(#gradient_left${uid})`"
                        />
                        <path
                            :d="fill.top"
                            :stroke="chart.bar.stroke"
                            :stroke-width="chart.bar.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            :fill="`url(#gradient_top${uid})`"
                        />
                    </g>

                    <g v-if="hasStack">
                        <g
                            v-for="(bar, i) in stack"
                            :style="`opacity:${selectedSerie ? (selectedSerie === bar.id ? 1 : 0.3) : 1}`"
                            class="vue-ui-3d-bar-stack"
                            :data-cy="`bar-3d-value-${bar.value}`"
                            role="img"
                            :aria-label="buildAccessibilityAnnouncement(bar)"
                        >
                            <path
                                :d="bar.fill.right"
                                :fill="`url(#grad_right_${bar.id})`"
                                @mouseenter="selectSerie(bar)"
                                @click="selectSerie(bar, true)"
                                @mouseout="unselectSerie(bar)"
                            />
                            <path
                                :d="bar.fill.left"
                                :fill="`url(#grad_left_${bar.id})`"
                                @mouseenter="selectSerie(bar)"
                                @click="selectSerie(bar, true)"
                                @mouseout="unselectSerie(bar)"
                            />
                            <path
                                :d="bar.fill.top"
                                :fill="`url(#grad_top_${bar.id})`"
                                @mouseenter="selectSerie(bar)"
                                @click="selectSerie(bar, true)"
                                @mouseout="unselectSerie(bar)"
                            />
                            <path
                                :d="bar.fill.liningTop"
                                stroke="#FFFFFF"
                                stroke-width="0.5"
                                stroke-linecap="round"
                                fill="none"
                                @mouseenter="selectSerie(bar)"
                                @click="selectSerie(bar, true)"
                                @mouseout="unselectSerie(bar)"
                            />

                            <path
                                :d="`M ${bar.fill.apexTop.x},${bar.fill.apexTop.y} ${bar.fill.apexBottom.x},${bar.fill.apexBottom.y}`"
                                :stroke="`#FFFFFF`"
                                stroke-width="0.5"
                                stroke-linecap="round"
                            />
                        </g>
                        <g v-for="(bar, i) in stack">
                            <path
                                v-if="i !== stack.length - 1"
                                :d="bar.fill.liningTopShade"
                                :stroke="chart.bar.shadeColor"
                                stroke-width="0.5"
                                stroke-linecap="round"
                                fill="none"
                                style="pointer-events: none"
                            />
                        </g>
                    </g>
                </g>

                <g v-if="style.shape === 'tube'">
                    <g v-if="!hasStack">
                        <!-- TUBE SKELETON -->
                        <path
                            :stroke-dasharray="chart.box.strokeDasharray"
                            :d="box.tubeTop"
                            :stroke="chart.box.stroke"
                            :stroke-width="chart.box.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            fill="none"
                        />
                        <path
                            :stroke-dasharray="chart.box.strokeDasharray"
                            :d="box.tubeLeft"
                            :stroke="chart.box.stroke"
                            :stroke-width="chart.box.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            fill="none"
                        />
                        <path
                            :stroke-dasharray="chart.box.strokeDasharray"
                            :d="box.tubeRight"
                            :stroke="chart.box.stroke"
                            :stroke-width="chart.box.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            fill="none"
                        />
                        <path
                            :stroke-dasharray="chart.box.strokeDasharray"
                            :d="box.tubeBottom"
                            :stroke="chart.box.stroke"
                            :stroke-width="chart.box.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            fill="none"
                        />
                        <!-- FILL TUBE -->
                        <path
                            :d="fill.tubeTop"
                            :stroke="chart.bar.stroke"
                            :stroke-width="chart.bar.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            :fill="`url(#gradient_tube_top${uid})`"
                        />
                        <path
                            :d="fill.tubeBody"
                            :stroke="chart.bar.stroke"
                            :stroke-width="chart.bar.strokeWidth"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            :fill="`url(#gradient_tube_body${uid})`"
                        />
                        <path
                            :d="fill.tubeTop"
                            stroke="#FFFFFF"
                            :stroke-width="0.5"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                            fill="none"
                        />
                    </g>

                    <g v-if="hasStack">
                        <g
                            v-for="(bar, i) in stack"
                            :style="`opacity:${selectedSerie ? (selectedSerie === bar.id ? 1 : 0.3) : 1}`"
                            class="vue-ui-3d-bar-stack"
                            role="img"
                            :aria-label="buildAccessibilityAnnouncement(bar)"
                        >
                            <defs>
                                <DefGrad
                                    t="radial"
                                    :id="`gradient_tube_top_${bar.id}`"
                                    fx="10%"
                                    cy="55%"
                                    :stops="[
                                        [
                                            '0%',
                                            setOpacity(
                                                lightenHexColor(bar.color, 0.5),
                                                80,
                                            ),
                                            1,
                                        ],
                                        [
                                            '100%',
                                            setOpacity(
                                                darkenHexColor(bar.color, 0.1),
                                                80,
                                            ),
                                            1,
                                        ],
                                    ]"
                                />
                                <DefGrad
                                    t="linear"
                                    :id="`gradient_tube_body_${bar.id}`"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="0%"
                                    :stops="[
                                        ['0%', bar.color, 1],
                                        [
                                            '10%',
                                            setOpacity(
                                                darkenHexColor(bar.color, 0.7),
                                                100,
                                            ),
                                            1,
                                        ],
                                        [
                                            '25%',
                                            setOpacity(
                                                darkenHexColor(bar.color, 0.5),
                                                100,
                                            ),
                                            1,
                                        ],
                                        ['75%', setOpacity(bar.color, 80), 1],
                                        [
                                            '100%',
                                            setOpacity(
                                                lightenHexColor(bar.color, 0.7),
                                                100,
                                            ),
                                            1,
                                        ],
                                    ]"
                                />
                            </defs>
                            <path
                                @mouseenter="selectSerie(bar)"
                                @click="selectSerie(bar, true)"
                                @mouseout="unselectSerie(bar)"
                                :d="bar.fill.tubeBody"
                                stroke="#FFFFFF"
                                :stroke-width="0.5"
                                stroke-linejoin="round"
                                stroke-linecap="round"
                                :fill="`url(#gradient_tube_body_${bar.id})`"
                            />
                            <path
                                @mouseenter="selectSerie(bar)"
                                @click="selectSerie(bar, true)"
                                @mouseout="unselectSerie(bar)"
                                :d="bar.fill.bottomTubeTop"
                                stroke="#000000"
                                :stroke-width="0.5"
                                stroke-linejoin="round"
                                stroke-linecap="round"
                                fill="none"
                                v-if="i > 0"
                            />
                            <path
                                @mouseenter="selectSerie(bar)"
                                @click="selectSerie(bar, true)"
                                @mouseout="unselectSerie(bar)"
                                :d="bar.fill.tubeTop"
                                stroke="#FFFFFF"
                                :stroke-width="0.5"
                                stroke-linejoin="round"
                                stroke-linecap="round"
                                :fill="`url(#gradient_tube_top_${bar.id})`"
                            />
                        </g>
                    </g>
                </g>

                <g v-if="hasStack">
                    <!-- LEGEND (parallelogram) -->
                    <g
                        v-for="(bar, i) in stack"
                        :style="`opacity:${selectedSerie ? (selectedSerie === bar.id ? 1 : 0) : bar.proportion * 100 > chart.legend.hideUnderPercentage ? 1 : 0}`"
                        @click="emits('selectDatapoint', bar)"
                    >
                        <path
                            :stroke="chart.color"
                            stroke-dasharray="1"
                            stroke-width="0.5"
                            stroke-linecap="round"
                            :d="`M${bar.fill.sidePointer.x},${bar.fill.sidePointer.y} ${bar.fill.sidePointer.x2},${bar.fill.sidePointer.y}`"
                        />

                        <circle
                            v-if="!bar.fill.miniDonut || !!selectedSerie"
                            :cx="bar.fill.sidePointer.x2"
                            :cy="bar.fill.sidePointer.y"
                            :r="2"
                            :fill="bar.color"
                            :stroke="chart.backgroundColor"
                        />

                        <rect
                            v-if="loading"
                            :x="bar.fill.sidePointer.xText"
                            :y="
                                bar.fill.sidePointer.y -
                                chart.legend.fontSize / 2
                            "
                            :width="svg.width / 3"
                            :height="chart.legend.fontSize"
                            fill="#6A6A6A80"
                            rx="3"
                        />

                        <foreignObject
                            :x="bar.fill.sidePointer.xText"
                            :y="bar.fill.sidePointer.y - chart.legend.fontSize"
                            :width="svg.absoluteWidth / 3"
                            :height="chart.legend.fontSize * 2"
                            style="overflow: visible; position: relative"
                            v-if="!loading"
                        >
                            <div
                                v-if="chart.legend.showDefault"
                                :style="`height: 100%; width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; align-items:center;justify-content: flex-start; font-size:${chart.legend.fontSize}px; text-align:left; line-height: ${chart.legend.fontSize}px; color:${chart.legend.color}; font-weight:${chart.legend.bold ? 'bold' : 'normal'}`"
                            >
                                {{
                                    applyDataLabel(
                                        chart.dataLabel.formatter,
                                        bar.value,
                                        `${bar.name}: ${dataLabel({ v: bar.proportion * 100, s: '%', r: chart.legend.roundingPercentage })} (${dataLabel(
                                            {
                                                p: chart.legend.prefix,
                                                v: bar.value,
                                                s: chart.legend.suffix,
                                                r: chart.legend.roundingValue,
                                            },
                                        )})`,
                                        {
                                            datapoint: bar,
                                            seriesIndex: i,
                                            type: 'barDatapoint',
                                        },
                                    )
                                }}
                            </div>
                            <slot
                                name="legend"
                                v-bind="{
                                    datapoint: bar,
                                    config: FINAL_CONFIG,
                                    dataset: stack,
                                }"
                            />
                        </foreignObject>

                        <!-- BREAKDOWN DONUT -->
                        <g v-if="bar.fill.donut && selectedSerie === bar.id">
                            <!-- DONUT LABEL CONNECTOR -->
                            <g v-for="(arc, j) in bar.fill.donut">
                                <path
                                    v-if="
                                        displayArcPercentage(arc, bar, true) > 6
                                    "
                                    :d="
                                        calcNutArrowPath(
                                            arc,
                                            { x: arc.cx, y: arc.cy },
                                            0,
                                            8,
                                            false,
                                            true,
                                            10,
                                        )
                                    "
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
                                :stroke="chart.backgroundColor"
                                :stroke-width="1"
                            />

                            <!-- DONUT DATALABELS -->
                            <g v-for="(arc, i) in bar.fill.donut">
                                <g
                                    v-if="
                                        displayArcPercentage(arc, bar, true) > 6
                                    "
                                >
                                    <text
                                        :text-anchor="
                                            calcMarkerOffsetX(arc, true, 0)
                                                .anchor
                                        "
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="calcMarkerOffsetY(arc, 12, 12)"
                                        :fill="chart.legend.color"
                                        :font-size="chart.legend.fontSize / 1.5"
                                        :font-weight="
                                            chart.legend.bold
                                                ? 'bold'
                                                : 'normal'
                                        "
                                    >
                                        {{
                                            applyDataLabel(
                                                chart.dataLabel.formatter,
                                                arc.value,
                                                `${displayArcPercentage(arc, bar)} (${dataLabel(
                                                    {
                                                        p: FINAL_CONFIG.style
                                                            .chart.legend
                                                            .prefix,
                                                        v: arc.value,
                                                        s: FINAL_CONFIG.style
                                                            .chart.legend
                                                            .suffix,
                                                        r: FINAL_CONFIG.style
                                                            .chart.legend
                                                            .roundingValue,
                                                    },
                                                )})`,
                                                {
                                                    datapoint: arc,
                                                    seriesIndex: i,
                                                    type: 'donutDatapoint',
                                                },
                                            )
                                        }}
                                    </text>
                                    <text
                                        :text-anchor="
                                            calcMarkerOffsetX(arc).anchor
                                        "
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="
                                            calcMarkerOffsetY(arc, 12, 12) +
                                            chart.legend.fontSize / 1.5
                                        "
                                        :fill="chart.legend.color"
                                        :font-size="chart.legend.fontSize / 1.5"
                                        :font-weight="
                                            chart.legend.bold
                                                ? 'bold'
                                                : 'normal'
                                        "
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
                                :stroke="chart.backgroundColor"
                                :stroke-width="0.5"
                            />
                        </g>
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
        </div>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot
                name="watermark"
                v-bind="{
                    isPrinting:
                        isPrinting ||
                        isImaging ||
                        isCallbackSvg ||
                        isCallbackImaging,
                }"
            />
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <component
            v-if="isDataset && hasStack && cfgUserOptions.buttons.table"
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

<style scoped lang="scss">
@import '../vue-data-ui.css';

.vue-ui-3d-bar * {
    transition: unset;
}
.vue-ui-3d-bar {
    user-select: none;
    position: relative;
}
.vue-ui-3d-bar-stack {
    transition: opacity 0.2s ease-in-out;
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

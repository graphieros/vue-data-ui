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

import { resolveChartConfig } from '../resolveChartConfig';
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue';
import {
    applyDataLabel,
    checkNaN,
    createCsvContent,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    svgToClientCoords,
    treeShake,
    XMLNS,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useSvgLabelLayout } from '../useSvgLabelLayout';
import { usePrinter } from '../usePrinter';
import { useResponsive } from '../useResponsive';

import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { useTimeLabelCollision } from '../useTimeLabelCollider';
import img from '../img';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_age_pyramid.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import DefGrad from '../atoms/DefGrad.vue';

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

const { vue_ui_age_pyramid: DEFAULT_CONFIG } = useConfig();

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

const emit = defineEmits(['copyAlt']);

const isDataset = computed(
    () =>
        Array.isArray(props.dataset) &&
        props.dataset.length > 0 &&
        props.dataset.every((row) => Array.isArray(row) && row.length >= 4),
);
const resolvedConfig = computed(prepareConfig);
const loading = computed(
    () => !!resolvedConfig.value.loading || !isDataset.value,
);

const uid = ref(createUid());
const isTooltip = ref(false);
const selectedIndex = ref(null);
const step = ref(0);
const agePyramid = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const noTitle = ref(null);
const xAxisLabels = ref(null);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            translations: {
                male: '',
                female: '',
            },
            style: {
                backgroundColor: '#99999930',
                layout: {
                    bars: {
                        left: { color: '#CACACA' },
                        right: { color: '#999999' },
                    },
                    dataLabels: {
                        xAxis: {
                            fontSize: 0,
                            scale: 1000,
                            translation: '',
                        },
                        yAxis: {
                            show: false,
                        },
                    },
                    grid: {
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
const layoutDataLabels = computed(
    () => FINAL_CONFIG.value.style.layout.dataLabels,
);
const bars = computed(() => FINAL_CONFIG.value.style.layout.bars);
const barLabels = computed(() => FINAL_CONFIG.value.style.layout.bars.labels);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiAgePyramid',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: (dataset) => dataset.length > 130, // oldest recorded person to ever live is 122 at the time of this comment
            message: [
                '👀 Dataset has > 130 points. Consider:',
                '',
                '▶️ Grouping small values into aggregated categories.',
                '',
                '▶️ Using VueUiStackline to display data in a more compact way.',
            ],
        },
    ],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const defaultSkeletonDataset = [
    ['_', 9, 2, 2],
    ['_', 8, 3, 3],
    ['_', 7, 5, 5],
    ['_', 6, 8, 8],
    ['_', 5, 13, 13],
    ['_', 4, 21, 21],
    ['_', 3, 34, 34],
    ['_', 2, 55, 55],
    ['_', 1, 89, 89],
    ['_', 0, 144, 144],
];
const FINAL_DATASET = computed(() =>
    loading.value
        ? (props.config?.skeletonDataset ?? defaultSkeletonDataset)
        : props.dataset,
);

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: FINAL_CONFIG.value.style.title,
});

function prepareConfig() {
    return resolveChartConfig(props.config, DEFAULT_CONFIG, themes);
}

const responsiveSizeReady = ref(false);
let resizeObserver = null;
let resizeFrame = null;
let disposed = false;
const debug = computed(() => resolvedConfig.value.debug);
watch(
    [() => props.dataset, debug],
    ([dataset, enabled]) => {
        if (!enabled) return;
        if (objectIsEmpty(dataset))
            error({ componentName: 'VueUiAgePyramid', type: 'dataset' });
        else if (!isDataset.value)
            console.warn(
                'VueUiAgePyramid: each dataset row must be an array containing segment, age, left, and right values.',
            );
    },
    { deep: true, immediate: true },
);

function resizeChart() {
    resizeFrame = null;
    if (
        disposed ||
        !FINAL_CONFIG.value.responsive ||
        !agePyramid.value?.parentNode
    )
        return;
    const { width, height } = useResponsive({
        chart: agePyramid.value,
        title: style.value.title.text ? chartTitle.value : null,
        source: source.value,
        noTitle: noTitle.value,
    });
    svg.value = { width, height };
    responsiveSizeReady.value = true;
}
function scheduleResize() {
    if (!disposed && FINAL_CONFIG.value.responsive && resizeFrame === null)
        resizeFrame = requestAnimationFrame(resizeChart);
}
function setupSizing() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
    if (disposed) return;
    responsiveSizeReady.value = false;
    if (FINAL_CONFIG.value.responsive && agePyramid.value?.parentNode) {
        resizeObserver = new ResizeObserver(scheduleResize);
        resizeObserver.observe(agePyramid.value.parentNode);
        scheduleResize();
    } else svg.value = { width: style.value.width, height: style.value.height };
}
onMounted(setupSizing);
watch(() => FINAL_CONFIG.value.responsive, setupSizing, { flush: 'post' });
watch([() => style.value.width, () => style.value.height], () => {
    if (FINAL_CONFIG.value.responsive) scheduleResize();
    else svg.value = { width: style.value.width, height: style.value.height };
});
watch(
    [
        () => style.value.title,
        () => FINAL_CONFIG.value.userOptions.show,
        () => FINAL_CONFIG.value.style.fontFamily,
    ],
    scheduleResize,
    { deep: true, flush: 'post' },
);
watch(
    () => props.config,
    () => {
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
    },
    { deep: true },
);
onBeforeUnmount(() => {
    disposed = true;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeObserver?.disconnect();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-age-pyramid_${uid.value}`,
    fileName: style.value.title.text || 'vue-ui-age-pyramid',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !style.value.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: style.value.tooltip.show,
});

watch([() => FINAL_CONFIG.value.table.show, loading], ([value]) => {
    mutableConfig.value.showTable = value;
});
watch([() => style.value.tooltip.show, loading], ([value]) => {
    mutableConfig.value.showTooltip = value;
});

const svg = ref({
    height: style.value.height,
    width: style.value.width,
});

const WIDTH = computed(() => svg.value.width);
const HEIGHT = computed(() => svg.value.height);

const {
    metrics: labelLayout,
    ready: labelLayoutReady,
    update: measureLabelLayout,
} = useSvgLabelLayout({
    svgRef,
    canMeasure: () =>
        !FINAL_CONFIG.value.responsive || responsiveSizeReady.value,
    initialMetrics: { bottom: 0 },
    measure: (read) => ({ bottom: read(xAxisLabels.value).height }),
});

const xAxisLabelsHeight = computed(() => labelLayout.value.bottom);

const drawingArea = computed(() => {
    const width =
        svg.value.width -
        style.value.layout.padding.right -
        style.value.layout.padding.left;
    const left = style.value.layout.padding.left;
    const right = svg.value.width - style.value.layout.padding.right;

    return {
        top:
            style.value.layout.padding.top +
            layoutDataLabels.value.sideTitles.fontSize +
            layoutDataLabels.value.sideTitles.offsetY +
            12,
        left,
        right,
        bottom:
            svg.value.height -
            style.value.layout.padding.bottom -
            xAxisLabelsHeight.value,
        width,
        height:
            svg.value.height -
            style.value.layout.padding.top -
            style.value.layout.padding.bottom -
            xAxisLabelsHeight.value -
            layoutDataLabels.value.sideTitles.fontSize -
            layoutDataLabels.value.sideTitles.offsetY -
            12,
        centerX: style.value.layout.padding.left + width / 2,
        leftChart: {
            width: width / 2 - style.value.layout.centerSlit.width,
            right: left + width / 2 - style.value.layout.centerSlit.width,
        },
        rightChart: {
            width: width / 2 - style.value.layout.centerSlit.width,
            left: left + width / 2 + style.value.layout.centerSlit.width,
        },
    };
});

const yLabels = computed(() => {
    return FINAL_DATASET.value.map((ds) => {
        if (layoutDataLabels.value.yAxis.display === 'age') {
            return ds[1];
        } else {
            return ds[0];
        }
    });
});

const xLabels = computed(() => {
    const step = closestDecimal(max.value / 5);
    const stepsRight = [];
    const stepsLeft = [];
    for (let i = 0; i <= 5; i += 1) {
        const valueRight = step * i;
        const valueLeft = step * (i - 5);
        stepsRight.push({
            value: valueRight,
            x:
                drawingArea.value.left +
                drawingArea.value.width / 2 +
                style.value.layout.centerSlit.width +
                (valueRight / max.value) * drawingArea.value.leftChart.width,
        });
        stepsLeft.push({
            value: Math.abs(valueLeft),
            x:
                drawingArea.value.left +
                drawingArea.value.width / 2 +
                (valueLeft / max.value) * drawingArea.value.leftChart.width -
                style.value.layout.centerSlit.width,
        });
    }
    return {
        right: stepsRight,
        left: stepsLeft,
    };
});

function closestDecimal(number) {
    if (number === 0) return 0;
    const magnitude = 10 ** Math.floor(Math.log10(Math.abs(number)));
    return Math.round(number / magnitude) * magnitude;
}
function numericValue(value) {
    return Number.isFinite(value) ? value : 0;
}
const max = computed(
    () =>
        Math.max(
            0,
            ...FINAL_DATASET.value.flatMap((row) => [
                numericValue(row[2]),
                numericValue(row[3]),
            ]),
        ) || 1,
);

const len = computed(() => FINAL_DATASET.value.length);

const mutableDataset = computed(() => {
    return FINAL_DATASET.value.map((ds) => {
        return {
            segment: ds[0],
            age: ds[1],
            left: {
                value: ds[2],
                proportionToMax: Math.max(0, numericValue(ds[2])) / max.value,
            },
            right: {
                value: ds[3],
                proportionToMax: Math.max(0, numericValue(ds[3])) / max.value,
            },
        };
    });
});

const drawableDataset = computed(() => {
    return mutableDataset.value.map((ds, i) => {
        const y =
            drawingArea.value.top + (drawingArea.value.height / len.value) * i;
        const height = drawingArea.value.height / len.value - bars.value.gap;
        return {
            segment: ds.segment,
            age: ds.age,
            left: {
                ...ds.left,
                y,
                color: bars.value.left.color,
                x:
                    drawingArea.value.leftChart.right -
                    ds.left.proportionToMax * drawingArea.value.leftChart.width,
                width: checkNaN(
                    ds.left.proportionToMax * drawingArea.value.leftChart.width,
                ),
                height,
            },
            right: {
                ...ds.right,
                y,
                color: bars.value.right.color,
                x: drawingArea.value.rightChart.left,
                width: checkNaN(
                    ds.right.proportionToMax *
                        drawingArea.value.rightChart.width,
                ),
                height,
            },
        };
    });
});

const sides = ['left', 'right'];
const axisSides = ['right', 'left'];
function barAttrs(side) {
    return {
        x: side.x,
        y: side.y,
        width: side.width <= 0 ? 0.0001 : side.width,
        height: side.height <= 0 ? 0.0001 : side.height,
        rx: bars.value.borderRadius,
    };
}
function barLabelAttrs(segment, side) {
    const point = segment[side];
    return {
        x:
            side === 'left'
                ? point.x +
                  Math.max(0.0001, point.width) -
                  barLabels.value.offsetX -
                  6
                : point.x + barLabels.value.offsetX + 6,
        y: point.y + Math.max(0.0001, point.height / 2) + bars.value.gap / 2,
        'text-anchor': side === 'left' ? 'end' : 'start',
        'dominant-baseline': 'middle',
        'font-size': barLabels.value.fontSize,
        'font-weight': barLabels.value.bold ? 'bold' : 'normal',
        fill: barLabels.value.color,
        stroke: style.value.backgroundColor,
        'paint-order': 'stroke fill',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-width': 3,
    };
}
function gradientStops(side) {
    const color = bars.value[side].color;
    const faded = setOpacity(
        shiftHue(color, bars.value.gradient.shiftHue),
        100 - bars.value.gradient.intensity,
    );
    return side === 'left'
        ? [
              ['0%', color, 1],
              ['100%', faded, 1],
          ]
        : [
              ['0%', faded, 1],
              ['100%', color, 1],
          ];
}
function sideTitleAttrs(side) {
    const labels = layoutDataLabels.value.sideTitles;
    return {
        x: drawingArea.value[side],
        y: labels.fontSize,
        fill: labels.useSideColor ? bars.value[side].color : labels.color,
        'font-size': labels.fontSize,
        'text-anchor': side === 'left' ? 'start' : 'end',
        'font-weight': labels.bold ? 'bold' : 'normal',
    };
}

const dataTooltipSlot = computed(() => {
    const index = selectedIndex.value;
    const datapoint = props.dataset?.[index];
    return index != null && datapoint && !loading.value
        ? {
              datapoint,
              seriesIndex: index,
              series: drawableDataset.value,
              config: FINAL_CONFIG.value,
          }
        : null;
});

function convertDatapoint(dp) {
    const [segment, index, left, right] = dp;
    return { segment, index, left, right };
}

function selectDatapoint(index, datapoint) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: convertDatapoint(datapoint),
            seriesIndex: index,
        });
    }
}

function onTrapLeave(index, datapoint) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: convertDatapoint(datapoint),
            seriesIndex: index,
        });
    }
    if (
        tooltipTriggerMode.value === 'keyboard' &&
        activeTooltipIndex.value === index
    )
        return;
    selectedIndex.value = null;
    isTooltip.value = false;
}

function updateTooltipA11yPosition(index) {
    if (!svgRef.value) return;
    const row = drawableDataset.value[index];
    if (!row) return;
    const coords = svgToClientCoords(
        drawingArea.value.left + drawingArea.value.width / 2,
        row.left.y + row.left.height / 2,
        svgRef.value,
    );
    if (!coords) return;
    tooltipA11yPosition.value = coords;
}

function useTooltip(index, datapoint, triggerMode = 'pointer') {
    if (loading.value || !drawableDataset.value[index] || !datapoint) return;
    FINAL_CONFIG.value.events.datapointEnter?.({
        datapoint: convertDatapoint(datapoint),
        seriesIndex: index,
    });
    selectedIndex.value = index;
    activeTooltipIndex.value = index;
    tooltipTriggerMode.value = triggerMode;
    isTooltip.value = true;
    if (triggerMode === 'keyboard')
        nextTick(() => {
            if (!disposed && selectedIndex.value === index)
                updateTooltipA11yPosition(index);
        });
}
const tooltipContent = computed(() => {
    const payload = dataTooltipSlot.value;
    if (!payload) return '';
    const { datapoint, seriesIndex: index } = payload;
    const customFormat = style.value.tooltip.customFormat;
    if (typeof customFormat === 'function') {
        const result = customFormat({
            ...payload,
            datapoint: convertDatapoint(datapoint),
        });
        if (typeof result === 'string') return result;
    }
    let html = '';

    const selectedSet = drawableDataset.value[index];
    html += `<div><b>${selectedSet.segment}</b></div>`;
    html += `<div>${FINAL_CONFIG.value.translations.age}: ${applyDataLabel(
        layoutDataLabels.value.yAxis.formatter,
        checkNaN(selectedSet.age),
        dataLabel({ v: checkNaN(selectedSet.age) }),
        { datapoint, seriesIndex: index },
    )}</div>`;
    html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${style.value.tooltip.borderColor}">`;
    html += `<div style="display:flex; flex-direction:row;gap:12px">`;
    html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${bars.value.gradient.underlayer}"/><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${bars.value.gradient.show ? `url(#age_pyramid_left_${uid.value})` : bars.value.left.color}"/></svg><div>${FINAL_CONFIG.value.translations.female}</div><div><b>${applyDataLabel(
        layoutDataLabels.value.xAxis.formatter,
        checkNaN(selectedSet.left.value),
        dataLabel({ v: checkNaN(selectedSet.left.value) }),
        { datapoint, seriesIndex: index },
    )}</b></div></div>`;
    html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${bars.value.gradient.underlayer}"/><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${bars.value.gradient.show ? `url(#age_pyramid_right_${uid.value})` : bars.value.right.color}"/></svg><div>${FINAL_CONFIG.value.translations.male}</div><div><b>${applyDataLabel(
        layoutDataLabels.value.xAxis.formatter,
        checkNaN(selectedSet.right.value),
        dataLabel({ v: checkNaN(selectedSet.right.value) }),
        { datapoint, seriesIndex: index },
    )}</b></div></div>`;
    html += `</div>`;
    html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${style.value.tooltip.borderColor}"><div>${FINAL_CONFIG.value.translations.total}</div><div><b>${applyDataLabel(
        layoutDataLabels.value.xAxis.formatter,
        checkNaN(selectedSet.right.value) + checkNaN(selectedSet.left.value),
        dataLabel({
            v:
                checkNaN(selectedSet.right.value) +
                checkNaN(selectedSet.left.value),
        }),
        { datapoint, seriesIndex: index },
    )}</b></div></div>`;
    html += `</div>`;

    return `<div>${html}</div>`;
});
watch(
    [drawableDataset, loading],
    () => {
        if (loading.value || !drawableDataset.value[selectedIndex.value]) {
            selectedIndex.value = null;
            isTooltip.value = false;
        }
        if (loading.value || !drawableDataset.value[activeTooltipIndex.value])
            activeTooltipIndex.value = null;
        if (
            tooltipTriggerMode.value === 'keyboard' &&
            selectedIndex.value != null
        )
            updateTooltipA11yPosition(selectedIndex.value);
    },
    { deep: true, flush: 'post' },
);

const tableHeaders = computed(() =>
    ['year', 'age', 'female', 'male', 'total'].map(
        (key) => FINAL_CONFIG.value.translations[key],
    ),
);
const tableRows = computed(() =>
    (Array.isArray(props.dataset) ? props.dataset : [])
        .filter((row) => Array.isArray(row) && row.length >= 4)
        .map((row) => [
            row[0],
            row[1],
            row[2],
            row[3],
            numericValue(row[2]) + numericValue(row[3]),
        ]),
);

function generateCsv(callback = null) {
    nextTick(() => {
        const tableXls = [
            [style.value.title.text],
            [style.value.title.subtitle.text],
            [[''], [''], ['']],
        ]
            .concat([tableHeaders.value])
            .concat(tableRows.value);
        const csvContent = createCsvContent(tableXls);
        if (!callback) {
            downloadCsv({
                csvContent,
                title: style.value.title.text || 'vue-ui-age-pyramid',
            });
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = tableHeaders.value;
    const body = tableRows.value.map((row) => [
        row[0],
        row[1],
        ...row
            .slice(2)
            .map((value) => (value == null ? '' : value.toLocaleString())),
    ]);
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

    return { head, body, config, colNames: head };
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
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

async function getImage({ scale = 2 } = {}) {
    if (!agePyramid.value) return;
    const { width, height } = agePyramid.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: agePyramid.value,
        base64: true,
        img: true,
        scale,
    });
    return {
        imageUri,
        base64,
        title: style.value.title.text,
        width,
        height,
        aspectRatio,
    };
}

const dummyTimeLabels = ref([]);
const dummySlicer = computed(() => ({
    start: 0,
    end: drawableDataset.value.length,
}));

useTimeLabelCollision({
    timeLabelsEls: xAxisLabels,
    timeLabels: dummyTimeLabels,
    slicer: dummySlicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'layout', 'dataLabels', 'xAxis', 'rotation'],
    autoRotatePath: [
        'style',
        'layout',
        'dataLabels',
        'xAxis',
        'autoRotate',
        'enable',
    ],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    targetClass: '.vue-ui-age-pyramid-x-axis-label',
    rotation: style.value.layout.dataLabels.xAxis.autoRotate.angle,
});

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: style,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: agePyramid,
        maxWidth: 800,
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

const svgBg = computed(() => FINAL_CONFIG.value.style.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.title);

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
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: drawableDataset.value,
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
            dataset: drawableDataset.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/

function onSvgFocus() {
    isFocus.value = true;
}

function onSvgBlur() {
    selectedIndex.value = null;
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value || loading.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!drawableDataset.value.length) return;

    const isUpKey = ['ArrowUp', 'ArrowLeft'].includes(event.key);
    const isDownKey = ['ArrowDown', 'ArrowRight'].includes(event.key);
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isUpKey && !isDownKey && !isActivationKey && !isEscapeKey) return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        selectedIndex.value = null;
        activeTooltipIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
        isTooltip.value = false;
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;
        const datapoint = props.dataset[activeTooltipIndex.value];
        if (!datapoint) return;
        selectDatapoint(activeTooltipIndex.value, datapoint);
        return;
    }

    let nextIndex = activeTooltipIndex.value;
    const hoveredIndex = selectedIndex.value;

    const hasValidActiveIndex =
        nextIndex !== null &&
        nextIndex >= 0 &&
        nextIndex < drawableDataset.value.length;

    const hasValidHoveredIndex =
        hoveredIndex !== null &&
        hoveredIndex >= 0 &&
        hoveredIndex < drawableDataset.value.length;

    if (!hasValidActiveIndex) {
        if (hasValidHoveredIndex) {
            nextIndex = isDownKey ? hoveredIndex + 1 : hoveredIndex - 1;

            if (nextIndex >= drawableDataset.value.length) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = drawableDataset.value.length - 1;
            }
        } else if (isDownKey) {
            nextIndex = 0;
        } else {
            nextIndex = drawableDataset.value.length - 1;
        }
    } else if (isUpKey) {
        nextIndex =
            nextIndex - 1 < 0
                ? drawableDataset.value.length - 1
                : nextIndex - 1;
    } else if (isDownKey) {
        nextIndex =
            nextIndex + 1 > drawableDataset.value.length - 1
                ? 0
                : nextIndex + 1;
    }

    const datapoint = props.dataset[nextIndex];
    if (!datapoint) return;

    useTooltip(nextIndex, datapoint, 'keyboard');
}

defineExpose({
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
watch(
    () => [
        svg.value,
        layoutDataLabels.value,
        xAxisLabels.value,
        props.dataset,
        responsiveSizeReady.value,
        FINAL_CONFIG.value.style.fontFamily,
    ],
    measureLabelLayout,
    { flush: 'post', deep: true },
);
</script>

<template>
    <div
        :class="`vue-data-ui-component vue-ui-age-pyramid ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        ref="agePyramid"
        :id="`vue-ui-age-pyramid_${uid}`"
        :style="`font-family:${style.fontFamily};width:100%; text-align:center;background:${style.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="FINAL_CONFIG.a11y.includeTable && dataTable?.body?.length"
            :uid="uid"
            :head="dataTable.head"
            :body="dataTable.body"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <PenAndPaper
            v-bind="getAnnotatorProps(FINAL_CONFIG.userOptions.annotator)"
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="style.backgroundColor"
            :color="style.color"
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
            v-if="style.title.text"
            :style="`width:100%;background:transparent`"
        >
            <Title
                :config="{
                    title: {
                        cy: 'pyramid-div-title',
                        ...style.title,
                    },
                    subtitle: {
                        cy: 'pyramid-div-subtitle',
                        ...style.title.subtitle,
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="
                FINAL_CONFIG.userOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="style.backgroundColor"
            :color="style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="
                FINAL_CONFIG.userOptions.buttons.tooltip && style.tooltip.show
            "
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :chartElement="agePyramid"
            v-bind="
                getUserOptionsProps(
                    FINAL_CONFIG.userOptions,
                    'pdf csv img svg table fullscreen altCopy annotator',
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
                    'menuIcon optionTooltip optionPdf optionCsv optionImg optionSvg optionTable optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <!-- CHART -->
        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                }"
                :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
                :style="`max-width:100%;overflow:visible;background:transparent;color:${style.color};visibility:${labelLayoutReady ? 'visible' : 'hidden'}`"
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
                        drawingArea,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :width="Math.max(0.1, drawingArea.width)"
                    :height="Math.max(0.1, drawingArea.height)"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <defs>
                    <DefGrad
                        v-for="side in sides"
                        :key="side"
                        t="linear"
                        :id="`age_pyramid_${side}_${uid}`"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                        :stops="gradientStops(side)"
                    />
                </defs>
                <g v-for="(segment, i) in drawableDataset" :key="i">
                    <template v-for="side in sides" :key="side">
                        <rect
                            v-bind="barAttrs(segment[side])"
                            :fill="bars.gradient.underlayer"
                        />
                        <rect
                            v-bind="barAttrs(segment[side])"
                            :fill="
                                bars.gradient.show
                                    ? `url(#age_pyramid_${side}_${uid})`
                                    : segment[side].color
                            "
                        />
                    </template>
                </g>
                <!-- BAR DATA LABELS -->
                <g v-for="(segment, i) in drawableDataset" :key="i">
                    <template
                        v-if="
                            barLabels.show &&
                            (!barLabels.showOnHover || selectedIndex === i)
                        "
                    >
                        <text
                            v-for="side in sides"
                            :key="side"
                            v-bind="barLabelAttrs(segment, side)"
                        >
                            {{
                                applyDataLabel(
                                    barLabels.formatter,
                                    segment[side].value,
                                    dataLabel({ v: segment[side].value }),
                                    {
                                        datapoint: segment[side],
                                        seriesIndex: i,
                                    },
                                )
                            }}
                        </text>
                    </template>
                </g>

                <!-- LABELS -->
                <g>
                    <g v-if="layoutDataLabels.sideTitles.show">
                        <text
                            v-for="side in sides"
                            :key="side"
                            :data-cy="`label-${side}`"
                            v-bind="sideTitleAttrs(side)"
                        >
                            {{
                                FINAL_CONFIG.translations[
                                    side === 'left' ? 'female' : 'male'
                                ]
                            }}
                        </text>
                    </g>

                    <g v-if="layoutDataLabels.yAxis.show">
                        <template v-for="(label, i) in yLabels">
                            <text
                                data-cy="y-axis-label"
                                v-if="
                                    (i % layoutDataLabels.yAxis.showEvery ===
                                        0 &&
                                        (!barLabels.show ||
                                            (barLabels.showOnHover &&
                                                selectedIndex === i) ||
                                            selectedIndex === null)) ||
                                    ((barLabels.show ||
                                        barLabels.showOnHover) &&
                                        selectedIndex === i)
                                "
                                :x="drawingArea.centerX"
                                :y="
                                    drawingArea.top +
                                    drawingArea.height / len / 2 +
                                    (drawingArea.height / len) * i
                                "
                                dominant-baseline="middle"
                                text-anchor="middle"
                                :font-size="layoutDataLabels.yAxis.fontSize"
                                :fill="layoutDataLabels.yAxis.color"
                                :font-weight="
                                    layoutDataLabels.yAxis.bold
                                        ? 'bold'
                                        : 'normal'
                                "
                            >
                                {{
                                    applyDataLabel(
                                        layoutDataLabels.yAxis.formatter,
                                        label,
                                        dataLabel({ v: label }),
                                        { datapoint: label, seriesIndex: i },
                                    )
                                }}
                            </text>
                        </template>
                    </g>

                    <g v-if="layoutDataLabels.xAxis.show">
                        <g v-if="style.layout.grid.show">
                            <line
                                v-for="side in axisSides"
                                :key="side"
                                :data-cy="`scale-line-${side === 'right' ? 'left' : 'right'}`"
                                :x1="xLabels[side][0].x"
                                :x2="xLabels[side].at(-1).x"
                                :y1="
                                    drawingArea.bottom +
                                    layoutDataLabels.xAxis.fontSize / 2
                                "
                                :y2="
                                    drawingArea.bottom +
                                    layoutDataLabels.xAxis.fontSize / 2
                                "
                                :stroke="style.layout.grid.stroke"
                                :stroke-width="style.layout.grid.strokeWidth"
                                stroke-linecap="round"
                            />
                        </g>
                        <template v-for="side in axisSides" :key="side">
                            <g v-for="(label, i) in xLabels[side]" :key="i">
                                <line
                                    v-if="style.layout.grid.show"
                                    :data-cy="`scale-tick-${side}`"
                                    :x1="label.x"
                                    :x2="label.x"
                                    :y1="
                                        drawingArea.bottom +
                                        layoutDataLabels.xAxis.fontSize / 2
                                    "
                                    :y2="
                                        drawingArea.bottom +
                                        layoutDataLabels.xAxis.fontSize / 2 +
                                        4
                                    "
                                    :stroke="style.layout.grid.stroke"
                                    :stroke-width="
                                        style.layout.grid.strokeWidth
                                    "
                                    stroke-linecap="round"
                                />
                            </g>
                        </template>
                        <g ref="xAxisLabels">
                            <template v-for="side in axisSides" :key="side">
                                <text
                                    v-for="(label, i) in xLabels[side]"
                                    :key="i"
                                    class="vue-ui-age-pyramid-x-axis-label"
                                    :data-cy="`scale-tick-${side}-label`"
                                    :font-size="layoutDataLabels.xAxis.fontSize"
                                    :fill="layoutDataLabels.xAxis.color"
                                    :text-anchor="
                                        layoutDataLabels.xAxis.rotation > 0
                                            ? 'start'
                                            : layoutDataLabels.xAxis.rotation <
                                                0
                                              ? 'end'
                                              : 'middle'
                                    "
                                    :font-weight="
                                        layoutDataLabels.xAxis.bold
                                            ? 'bold'
                                            : 'normal'
                                    "
                                    :transform="`translate(${label.x}, ${drawingArea.bottom + layoutDataLabels.xAxis.fontSize * 2}) rotate(${layoutDataLabels.xAxis.rotation})`"
                                >
                                    {{
                                        applyDataLabel(
                                            layoutDataLabels.xAxis.formatter,
                                            label.value /
                                                layoutDataLabels.xAxis.scale,
                                            dataLabel({
                                                v:
                                                    label.value /
                                                    layoutDataLabels.xAxis
                                                        .scale,
                                            }),
                                            {
                                                datapoint: label,
                                                seriesIndex: i,
                                            },
                                        )
                                    }}
                                </text>
                            </template>
                        </g>
                        <text
                            :x="drawingArea.right"
                            :y="svg.height"
                            text-anchor="end"
                            :font-size="layoutDataLabels.xAxis.fontSize"
                            :fill="layoutDataLabels.xAxis.color"
                            :font-weight="
                                layoutDataLabels.xAxis.bold ? 'bold' : 'normal'
                            "
                        >
                            {{ layoutDataLabels.xAxis.translation }}
                        </text>
                    </g>
                </g>

                <!-- TOOLTIP TRAPS -->
                <g v-if="!loading">
                    <g v-for="(datapoint, i) in dataset">
                        <rect
                            data-cy="tooltip-trap"
                            :x="drawingArea.left"
                            :y="
                                drawingArea.top +
                                (drawingArea.height / len) * i -
                                bars.gap / 2
                            "
                            :width="
                                drawingArea.width <= 0
                                    ? 0.0001
                                    : drawingArea.width
                            "
                            :height="
                                drawingArea.height / len <= 0
                                    ? 0.0001
                                    : drawingArea.height / len
                            "
                            :fill="
                                selectedIndex !== null && selectedIndex === i
                                    ? setOpacity(
                                          style.highlighter.color,
                                          style.highlighter.opacity,
                                      )
                                    : 'transparent'
                            "
                            @mouseover="useTooltip(i, datapoint, 'pointer')"
                            @mouseleave="onTrapLeave(i, datapoint)"
                            @click="selectDatapoint(i, datapoint)"
                        />
                    </g>
                </g>

                <slot
                    name="svg"
                    :svg="{
                        ...svg,
                        drawingArea,
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

        <slot name="legend" v-bind:legend="drawableDataset"></slot>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="style.tooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="style.tooltip.backgroundColor"
            :color="style.tooltip.color"
            :borderRadius="style.tooltip.borderRadius"
            :borderColor="style.tooltip.borderColor"
            :borderWidth="style.tooltip.borderWidth"
            :fontSize="style.tooltip.fontSize"
            :backgroundOpacity="style.tooltip.backgroundOpacity"
            :position="style.tooltip.position"
            :offsetX="style.tooltip.offsetX"
            :offsetY="style.tooltip.offsetY"
            :parent="agePyramid"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="
                style.tooltip.customFormat &&
                typeof style.tooltip.customFormat === 'function'
            "
            :smooth="style.tooltip.smooth"
            :backdropFilter="style.tooltip.backdropFilter"
            :smoothForce="style.tooltip.smoothForce"
            :smoothSnapThreshold="style.tooltip.smoothSnapThreshold"
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
                        {{ th }}
                    </template>
                    <template #td="{ td }">
                        {{ td }}
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
@import '../vue-data-ui.css';

.vue-ui-age-pyramid * {
    transition: unset;
}
.vue-ui-age-pyramid {
    user-select: none;
    position: relative;
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

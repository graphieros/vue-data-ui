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
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    watch,
    nextTick,
    defineAsyncComponent,
    shallowRef,
    toRefs,
} from 'vue';
import {
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createTSpansFromLineBreaksOnY,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    palette,
    treeShake,
    wrapText,
    XMLNS,
} from '../lib';
import { useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';

import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import Shape from '../atoms/Shape.vue';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_chord.json';
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);

const { vue_ui_chord: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    dataset: {
        type: Object,
        default() {
            return {};
        },
    },
    config: {
        type: Object,
        default() {
            return {};
        },
    },
});

const emit = defineEmits([
    'selectLegend',
    'selectGroup',
    'selectRibbon',
    'copyAlt',
]);

function isValidMatrix(dataset) {
    const matrix = dataset?.matrix;
    return (
        Array.isArray(matrix) &&
        matrix.length >= 2 &&
        matrix.every(
            (row) => Array.isArray(row) && row.length === matrix.length,
        )
    );
}
const isDataset = computed(() => isValidMatrix(props.dataset));

const uid = ref(createUid());
const selectedGroupId = ref(null);
const selectedRibbonId = ref(null);
const selectedGroup = computed(
    () =>
        chordData.value.groups.find(
            (group) => group.id === selectedGroupId.value,
        ) ?? null,
);
const selectedRibbon = computed(
    () =>
        ribbonModels.value.find(
            (ribbon) => ribbon.id === selectedRibbonId.value,
        ) ?? null,
);
const selectedLegendId = ref(null);
const step = ref(0);
const chordChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const loaded = ref(false);
const resizeObserver = shallowRef(null);
let scheduleResize = null;
let resizeFrame = null;
let disposed = false;
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const activeA11yType = ref('group'); // a11y
const activeA11yId = ref(null);
const activeA11yIndex = computed(() => {
    if (activeA11yId.value == null) return null;
    const targets =
        activeA11yType.value === 'group'
            ? a11yTargets.value.groups
            : a11yTargets.value.ribbons;
    const index = targets.findIndex(
        (target) => target.item.id === activeA11yId.value,
    );
    return index < 0 ? null : index;
});
const isFocus = ref(false); // a11y

const FINAL_CONFIG = ref(prepareConfig());
const cfgArcs = computed(() => FINAL_CONFIG.value.style.chart.arcs);
const cfgRibbons = computed(() => FINAL_CONFIG.value.style.chart.ribbons);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiChord',
    rules: [
        {
            test: (ds) => ds.matrix && ds.matrix.length > 12,
            message: [
                '👀 The number of groups > 12, the chart might become hard to read. Consider:',
                '',
                '▶️ Using broader groups to reduce their number.',
            ],
        },
    ],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            useCssAnimation: false,
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    legend: {
                        backgroundColor: 'transparent',
                    },
                    arcs: {
                        stroke: '#6A6A6A',
                        labels: {
                            show: false,
                        },
                    },
                    ribbons: {
                        stroke: '#6A6A6A',
                        underlayerOpacity: 0,
                        labels: {
                            show: false,
                        },
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
    skeletonDataset: props.config?.skeletonDataset ?? {
        matrix: [
            [12000, 6000, 9000, 3000],
            [2000, 10000, 2000, 6001],
            [8000, 1600, 8000, 8001],
            [1000, 1000, 1000, 7001],
        ],
        labels: [],
        colors: ['#DBDBDB', '#C4C4C4', '#ADADAD', '#969696'],
    },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });

const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `chord_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-chord',
    options: FINAL_CONFIG.value.userOptions.print,
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

watch(
    () => props.config,
    (_newCfg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        titleStep.value += 1;
        tableStep.value += 1;
        legendStep.value += 1;
        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    },
    { deep: true },
);

const debug = computed(() => FINAL_CONFIG.value.debug);

function validateRawDataset() {
    manualLoading.value = !isDataset.value;
    if (!isDataset.value && debug.value)
        error({ componentName: 'VueUiChord', type: 'dataset', debug: true });
}
function stopResize() {
    scheduleResize = null;
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
}
function clearResponsiveStyles() {
    if (chordChart.value) {
        chordChart.value.style.width = '100%';
        chordChart.value.style.height = '';
    }
    if (svgRef.value) svgRef.value.style.height = '';
}
function prepareChart() {
    stopResize();
    clearResponsiveStyles();
    const parent = chordChart.value?.parentNode;
    if (!FINAL_CONFIG.value.responsive || !parent) return;
    const resize = () => {
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            if (disposed || !chordChart.value || !svgRef.value) return;
            const {
                width,
                height,
                heightTitle,
                heightLegend,
                heightSource,
                heightNoTitle,
            } = useResponsive({
                chart: chordChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value,
            });
            clearResponsiveStyles();
            if (width >= height) {
                chordChart.value.style.height = '100%';
                svgRef.value.style.height = `calc(100% - ${heightTitle + heightLegend + heightSource + heightNoTitle}px)`;
            }
        });
    };
    scheduleResize = resize;
    resizeObserver.value = new ResizeObserver(resize);
    resizeObserver.value.observe(parent);
    resize();
}
let loadingTimeout = null;
onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
    loadingTimeout = setTimeout(() => {
        if (!disposed) loaded.value = true;
    }, 500);
});

const svg = ref({
    height: 600,
    width: 600,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const radii = computed(() => {
    return {
        inner: svg.value.width * 0.3 * cfgArcs.value.innerRadiusRatio,
        outer: svg.value.width * 0.34 * cfgArcs.value.outerRadiusRatio,
    };
});

const paddingAngle = computed(() => {
    return cfgArcs.value.padAngle / 100;
});

const formattedDataset = computed(() => {
    const data = FINAL_DATASET.value;
    const matrix = isValidMatrix(data)
        ? data.matrix.map((row) =>
              row.map((value) =>
                  typeof value === 'number' && Number.isFinite(value)
                      ? Math.max(0, value)
                      : 0,
              ),
          )
        : [];
    return {
        matrix,
        labels: matrix.map((_, i) => data.labels?.[i] ?? String(i)),
        colors: matrix.map(
            (_, i) =>
                convertColorToHex(data.colors?.[i]) ||
                customPalette.value[i] ||
                palette[i % palette.length],
        ),
    };
});

function computeChord(matrix, padAngle) {
    const n = matrix.length;
    const r = radii.value.inner;

    const groupSums = new Array(n).fill(0);
    let totalSum = 0;
    for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
            groupSums[i] += matrix[i][j];
            totalSum += matrix[i][j];
        }
    }

    padAngle = n
        ? Math.min((2 * Math.PI) / n, Math.max(0, Number(padAngle) || 0))
        : 0;
    const k = totalSum > 0 ? (2 * Math.PI - padAngle * n) / totalSum : 0;

    const groups = [];
    let currentAngle = 0;
    for (let i = 0; i < n; i += 1) {
        const startAngle = currentAngle;
        const endAngle = startAngle + groupSums[i] * k;
        groups.push({
            index: i,
            pattern: `pattern_${uid.value}_${i}`,
            startAngle,
            endAngle,
            name: formattedDataset.value.labels[i],
            id: `chord_group_${uid.value}_${i}`,
            color: formattedDataset.value.colors[i],
            proportion: totalSum ? groupSums[i] / totalSum : 0,
        });
        currentAngle = endAngle + padAngle;
    }

    const subgroups = [];
    const subgroupRows = Array.from({ length: n }, () => []);
    for (let i = 0; i < n; i += 1) {
        const entries = matrix[i].map((v, j) => ({ j, v }));
        entries.sort((a, b) => b.v - a.v);
        let angle = groups[i].startAngle;
        for (const { j, v } of entries) {
            const startAngle = angle;
            const endAngle = startAngle + v * k;
            const subgroup = {
                index: i,
                subIndex: j,
                pattern: `pattern_${uid.value}_${i}`,
                startAngle,
                endAngle,
                value: v,
                groupName: formattedDataset.value.labels[i],
                groupId: groups[i].id,
                groupColor: formattedDataset.value.colors[i],
                midAngle: (startAngle + endAngle) / 2,
                midBaseX:
                    Math.cos((startAngle + endAngle) / 2 - Math.PI / 2) * r,
                midBaseY:
                    Math.sin((startAngle + endAngle) / 2 - Math.PI / 2) * r,
            };
            subgroups.push(subgroup);
            subgroupRows[i][j] = subgroup;
            angle = endAngle;
        }
    }

    const chords = [];
    for (const a of subgroups) {
        const b = subgroupRows[a.subIndex][a.index];
        chords.push({
            source: a,
            target: b,
            id: `chord_ribbon_${uid.value}_${a.index}_${a.subIndex}`,
        });
    }
    return { groups, chords };
}

const chordData = computed(() => {
    const layout = computeChord(
        formattedDataset.value.matrix,
        paddingAngle.value,
    );
    layout.chords.sort(
        (a, b) =>
            Math.max(b.source.value, b.target.value) -
            Math.max(a.source.value, a.target.value),
    );
    return layout;
});

const rawValueLabels = computed(() => {
    const radius = radii.value.outer + cfgRibbons.value.labels.offset + 12;
    const charWidth = cfgRibbons.value.labels.fontSize * 0.6;
    const selectedId = selectedLegendId.value ?? selectedGroup.value?.id;
    const ribbons = selectedRibbon.value
        ? [selectedRibbon.value]
        : selectedId
          ? chordData.value.chords.filter(
                (chord) =>
                    chord.source.groupId === selectedId && chord.source.value,
            )
          : [];
    return ribbons.flatMap((chord) => {
        const endpoints = [];
        if (chord.source.value) endpoints.push(['src', chord.source]);
        if (chord.target?.value && chord.target.value !== chord.source.value)
            endpoints.push(['tgt', chord.target]);
        return endpoints.map(([side, endpoint]) => ({
            id: `${chord.id}-${side}`,
            theta: endpoint.midAngle,
            w: (String(endpoint.value).length * charWidth) / radius,
            midBaseX: endpoint.midBaseX,
            midBaseY: endpoint.midBaseY,
            groupColor: endpoint.groupColor,
            value: endpoint.value,
        }));
    });
});

const separatedValueLabels = computed(() => {
    const arr = rawValueLabels.value
        .map((d) => ({ ...d }))
        .sort((a, b) => a.theta - b.theta);

    if (!arr.length) return arr;
    const pad = (cfgRibbons.value.labels.minSeparationDeg * Math.PI) / 180;
    let changed = true;
    let loops = 0;

    while (changed && loops++ < 10) {
        changed = false;
        for (let i = 1; i < arr.length; i += 1) {
            const prev = arr[i - 1],
                cur = arr[i];
            const need = prev.theta + prev.w + pad;

            if (cur.theta < need) {
                cur.theta = need;
                changed = true;
            }
        }
        const first = arr[0],
            last = arr[arr.length - 1];
        const wrap = last.theta + last.w + pad - 2 * Math.PI;

        if (first.theta < wrap) {
            first.theta = wrap;
            changed = true;
        }
    }
    return arr;
});

function arcPath(startAngle, endAngle, R, r) {
    const a0 = startAngle - Math.PI / 2;
    const a1 = endAngle - Math.PI / 2;

    // From outer radius
    const x0 = Math.cos(a0) * R;
    const y0 = Math.sin(a0) * R;
    const x1 = Math.cos(a1) * R;
    const y1 = Math.sin(a1) * R;

    // From inner radius
    const x2 = Math.cos(a1) * r;
    const y2 = Math.sin(a1) * r;
    const x3 = Math.cos(a0) * r;
    const y3 = Math.sin(a0) * r;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return (
        `M${x0},${y0} ` +
        `A${R},${R} 0 ${largeArc} 1 ${x1},${y1} ` +
        `L${x2},${y2} ` +
        `A${r},${r} 0 ${largeArc} 0 ${x3},${y3} Z`
    );
}

function ribbonPath(s, t) {
    const r = radii.value.inner;
    const sa0 = s.startAngle - Math.PI / 2;
    const sa1 = s.endAngle - Math.PI / 2;
    const ta0 = t.startAngle - Math.PI / 2;
    const ta1 = t.endAngle - Math.PI / 2;

    // Coordinates
    const sx0 = Math.cos(sa0) * r;
    const sy0 = Math.sin(sa0) * r;
    const sx1 = Math.cos(sa1) * r;
    const sy1 = Math.sin(sa1) * r;
    const tx0 = Math.cos(ta0) * r;
    const ty0 = Math.sin(ta0) * r;
    const tx1 = Math.cos(ta1) * r;
    const ty1 = Math.sin(ta1) * r;

    const largeArc0 = s.endAngle - s.startAngle > Math.PI ? 1 : 0;
    const largeArc1 = t.endAngle - t.startAngle > Math.PI ? 1 : 0;

    return (
        `M${sx0},${sy0}` +
        `A${r},${r} 0 ${largeArc0} 1 ${sx1},${sy1}` +
        `Q0,0 ${tx0},${ty0}` +
        `A${r},${r} 0 ${largeArc1} 1 ${tx1},${ty1}` +
        `Q0,0 ${sx0},${sy0}Z`
    );
}

const rotationRad = computed(() => (rotation.value * Math.PI) / 180);

function midAngle(g) {
    return (g.startAngle + g.endAngle) / 2;
}

function rotatedMidAngle(g) {
    const m = midAngle(g) + rotationRad.value;
    return ((m % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

function labelSide(theta) {
    let a = theta + rotationRad.value;
    a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return a > Math.PI ? 'end' : 'start';
}

function labelTransform(angle) {
    const a = angle - Math.PI / 2;
    const x =
        Math.cos(a) * (radii.value.outer + cfgArcs.value.labels.offset + 24);
    const y =
        Math.sin(a) * (radii.value.outer + cfgArcs.value.labels.offset + 24);
    return `translate(${x},${y})`;
}

function labelArcPath(a0, a1, R) {
    const s = a0 - Math.PI / 2;
    const e = a1 - Math.PI / 2;
    const x1 = Math.cos(s) * R;
    const y1 = Math.sin(s) * R;
    const x2 = Math.cos(e) * R;
    const y2 = Math.sin(e) * R;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2}`;
}

const rotation = ref(FINAL_CONFIG.value.initialRotation);
const dragging = ref(false);
let startRotate = 0;
let startAngle = 0;

function getMouseAngle(event) {
    const rect = svgRef.value.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = event.clientX ?? event.touches[0].clientX;
    const y = event.clientY ?? event.touches[0].clientY;
    return Math.atan2(y - cy, x - cx);
}

function onDown(e) {
    if (!FINAL_CONFIG.value.enableRotation || isAnnotator.value) return;
    stopResetRotation();
    e.preventDefault();
    dragging.value = true;
    startRotate = rotation.value;
    startAngle = getMouseAngle(e);
}

function onMove(e) {
    if (
        !dragging.value ||
        !FINAL_CONFIG.value.enableRotation ||
        isAnnotator.value
    )
        return;
    const angle = getMouseAngle(e);
    rotation.value = startRotate + ((angle - startAngle) * 180) / Math.PI;
}

function onUp() {
    dragging.value = false;
}

function getLabel(v) {
    return applyDataLabel(
        cfgRibbons.value.labels.formatter,
        v,
        dataLabel({
            p: cfgRibbons.value.labels.prefix,
            v,
            s: cfgRibbons.value.labels.suffix,
            r: cfgRibbons.value.labels.rounding,
        }),
    );
}

onMounted(() => {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    window.addEventListener('touchcancel', onUp);
});

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onUp);
    window.removeEventListener('touchcancel', onUp);
    disposed = true;
    clearTimeout(loadingTimeout);
    stopResize();
    stopResetRotation();
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function selectGroup(group, index) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: group,
            seriesIndex: index,
        });
    }
    if (selectedLegendId.value) return;
    selectedGroupId.value = group.id;
    selectedRibbonId.value = null;
}

function onGroupLeave(group, index) {
    selectedGroupId.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: group,
            seriesIndex: index,
        });
    }
}

function onGroupClick(group, index) {
    emit('selectGroup', group);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: group,
            seriesIndex: index,
        });
    }
}

function selectRibbon(ribbon, index) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: ribbon,
            seriesIndex: index,
        });
    }
    if (selectedLegendId.value) return;
    selectedRibbonId.value = ribbon.id;
}

function onRibbonLeave(ribbon, index) {
    selectedRibbonId.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: ribbon,
            seriesIndex: index,
        });
    }
}

function onRibbonClick(ribbon, index) {
    emit('selectRibbon', ribbon);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: ribbon,
            seriesIndex: index,
        });
    }
}

function getRibbonOpacity(ribbon) {
    const noSelection =
        !selectedLegendId.value &&
        !selectedGroup.value &&
        !selectedRibbon.value;

    if (noSelection) return 0.8;

    const isMatch = selectedLegendId.value
        ? selectedLegendId.value === ribbon.source.groupId
        : selectedGroup.value
          ? selectedGroup.value.id === ribbon.source.groupId
          : selectedRibbon.value?.id === ribbon.id;

    return isMatch ? 1 : 0.1;
}

function getGroupOpacity(group) {
    const noSelection =
        !selectedLegendId.value &&
        !selectedGroup.value &&
        !selectedRibbon.value;

    if (noSelection) return 1;

    const isMatch = selectedLegendId.value
        ? selectedLegendId.value === group.id
        : selectedGroup.value
          ? selectedGroup.value.id === group.id
          : [
                selectedRibbon.value?.source.groupId,
                selectedRibbon.value?.target.groupId,
            ].includes(group.id);

    return isMatch ? 1 : 0.3;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

/**
 * Return the current chord data.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return chordData.value;
}

const raf = ref(null);
let resetSequence = 0;
function stopResetRotation() {
    resetSequence++;
    if (raf.value != null) cancelAnimationFrame(raf.value);
    raf.value = null;
}
function resetRotation() {
    const target = FINAL_CONFIG.value.initialRotation;
    stopResetRotation();
    const sequence = resetSequence;
    const step = () => {
        if (disposed || sequence !== resetSequence) return;
        const ease = 0.05;
        rotation.value += (target - rotation.value) * ease;
        if (Math.abs(rotation.value - target) < 0.1) {
            rotation.value = target;
            raf.value = null;
        } else {
            raf.value = requestAnimationFrame(step);
        }
    };
    raf.value = requestAnimationFrame(step);
}

function selectLegendItem(itemId) {
    resetA11ySelection();
    if (itemId === selectedLegendId.value) {
        selectedLegendId.value = null;
        emit('selectLegend', null);
    } else {
        selectedLegendId.value = itemId;
        emit(
            'selectLegend',
            chordData.value.groups.find((g) => g.id === itemId),
        );
    }
}

const legendSet = computed(() => {
    return chordData.value.groups.map((g, i) => {
        return {
            name: g.name,
            color: g.color,
            shape: 'circle',
            patternIndex: i,
            pattern: `pattern_${uid.value}_${i}`,
            id: g.id,
            select: () => selectLegendItem(g.id),
            opacity: selectedLegendId.value
                ? selectedLegendId.value === g.id
                    ? 1
                    : 0.3
                : 1,
        };
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'chord-div-legend',
        backgroundColor: cfgChart.value.legend.backgroundColor,
        color: cfgChart.value.legend.color,
        fontSize: cfgChart.value.legend.fontSize,
        paddingBottom: 12,
        fontWeight: cfgChart.value.legend.bold ? 'bold' : '',
    };
});

const table = computed(() => {
    const head = chordData.value.groups.map((g, i) => {
        return {
            name: g.name ?? String(i),
            color: g.color,
        };
    });

    const body = formattedDataset.value.matrix;
    return { head, body };
});

const dataTable = computed(() => {
    const head = [{ name: '', color: null }, ...table.value.head];
    const body = table.value.body.map((b, i) => {
        return [table.value.head[i], ...table.value.body[i]];
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
    const colNames = head;

    return {
        colNames,
        head,
        body,
        config,
    };
});

function generateCsv(callback = null) {
    nextTick(() => {
        const rows = formattedDataset.value.matrix.map((m, i) => {
            return [table.value.head[i].name, ...m];
        });

        const tableXls = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            ['', ...table.value.head.map((header) => header.name)],
        ].concat(rows);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-chord',
            });
        } else {
            callback(csvContent);
        }
    });
}

const getImage = createChartImageGetter(
    chordChart,
    () => cfgChart.value.title.text,
);

function getArcLabel(group, index) {
    return `${formattedDataset.value.labels[index]}${
        cfgArcs.value.labels.showPercentage
            ? dataLabel({
                  p: ' (',
                  v: isNaN(group.proportion) ? 0 : group.proportion * 100,
                  s: '%)',
                  r: cfgArcs.value.labels.roundingPercentage,
              })
            : ''
    }`;
}

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: cfgChart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: chordChart,
        maxWidth: 800,
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
const svgLegend = computed(() => cfgChart.value.legend);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: svgLegend,
        legendItems: legendSet,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: formattedDataset.value,
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
            dataset: formattedDataset.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/

const groupPaths = computed(
    () =>
        new Map(
            chordData.value.groups.map((group) => [
                group.id,
                arcPath(
                    group.startAngle,
                    group.endAngle,
                    radii.value.outer,
                    radii.value.inner,
                ),
            ]),
        ),
);
function getRibbonPayload(ribbon, includePath = false) {
    const { source, target, id, path, color } = ribbon;
    return includePath
        ? { source, target, id, path, color }
        : { source, target, id, color };
}

const ribbonModels = computed(() =>
    chordData.value.chords.map((chord) => ({
        ...chord,
        path: ribbonPath(chord.source, chord.target),
        color: formattedDataset.value.colors[chord.source.index],
    })),
);
const visibleRibbons = computed(() =>
    ribbonModels.value
        .filter((chord) =>
            selectedGroupId.value
                ? chord.source.groupId === selectedGroupId.value
                : selectedLegendId.value
                  ? chord.source.groupId === selectedLegendId.value
                  : true,
        )
        .map((chord, renderIndex) => ({ ...chord, renderIndex }))
        .filter((chord) => chord.source.value),
);

const a11yTargets = computed(() => {
    const groups = chordData.value.groups.map((group, index) => ({
        type: 'group',
        index,
        item: group,
    }));

    const ribbons = visibleRibbons.value.map((ribbon, index) => ({
        type: 'ribbon',
        index,
        item: getRibbonPayload(ribbon, true),
    }));

    return { groups, ribbons };
});

const a11yTable = computed(() => {
    const headers = ['', ...table.value.head.map((header) => header.name)];

    const rows = table.value.body.map((row, rowIndex) => {
        return [
            table.value.head[rowIndex]?.name ?? `${rowIndex}`,
            ...row.map((value) => getLabel(value)),
        ];
    });

    return { headers, rows };
});

function setActiveA11yGroup(index) {
    const target = a11yTargets.value.groups[index];
    if (!target) return;
    selectedLegendId.value = null;
    activeA11yType.value = 'group';
    activeA11yId.value = target.item.id;
    selectedRibbonId.value = null;
    selectedGroupId.value = target.item.id;
}

function setActiveA11yRibbon(index) {
    const target = a11yTargets.value.ribbons[index];
    if (!target) return;
    selectedLegendId.value = null;
    activeA11yType.value = 'ribbon';
    activeA11yId.value = target.item.id;
    selectedGroupId.value = null;
    selectedRibbonId.value = target.item.id;
}

function resetA11ySelection() {
    activeA11yId.value = null;
    activeA11yType.value = 'group';
    selectedGroupId.value = null;
    selectedRibbonId.value = null;
}

function onSvgFocus() {
    isFocus.value = true;
    activeA11yType.value = 'group';
    activeA11yId.value = null;
}

function onSvgBlur() {
    isFocus.value = false;
    resetA11ySelection();
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;

    const isPreviousKey = event.key === 'ArrowLeft';
    const isNextKey = event.key === 'ArrowRight';
    const isUpKey = event.key === 'ArrowUp';
    const isDownKey = event.key === 'ArrowDown';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (
        !isPreviousKey &&
        !isNextKey &&
        !isUpKey &&
        !isDownKey &&
        !isActivationKey &&
        !isEscapeKey
    )
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        resetA11ySelection();
        return;
    }

    if (isUpKey) {
        activeA11yType.value = 'group';
        if (a11yTargets.value.groups.length) {
            setActiveA11yGroup(
                activeA11yIndex.value === null
                    ? 0
                    : Math.min(
                          activeA11yIndex.value,
                          a11yTargets.value.groups.length - 1,
                      ),
            );
        }
        return;
    }

    if (isDownKey) {
        if (!a11yTargets.value.ribbons.length) return;
        activeA11yType.value = 'ribbon';
        setActiveA11yRibbon(
            activeA11yIndex.value === null
                ? 0
                : Math.min(
                      activeA11yIndex.value,
                      a11yTargets.value.ribbons.length - 1,
                  ),
        );
        return;
    }

    if (isActivationKey) {
        if (activeA11yType.value === 'group') {
            const target = a11yTargets.value.groups[activeA11yIndex.value];
            if (target) {
                onGroupClick(target.item, target.index);
            }
        } else {
            const target = a11yTargets.value.ribbons[activeA11yIndex.value];
            if (target) {
                onRibbonClick(target.item, target.index);
            }
        }
        return;
    }

    const collection =
        activeA11yType.value === 'group'
            ? a11yTargets.value.groups
            : a11yTargets.value.ribbons;

    if (!collection.length) return;

    let nextIndex = activeA11yIndex.value;

    if (nextIndex === null || nextIndex < 0 || nextIndex >= collection.length) {
        nextIndex = isNextKey ? 0 : collection.length - 1;
    } else if (isNextKey) {
        nextIndex += 1;
        if (nextIndex >= collection.length) {
            nextIndex = 0;
        }
    } else if (isPreviousKey) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = collection.length - 1;
        }
    }

    if (activeA11yType.value === 'group') {
        setActiveA11yGroup(nextIndex);
    } else {
        setActiveA11yRibbon(nextIndex);
    }
}

watch(() => props.dataset, validateRawDataset, { deep: true, immediate: true });
watch(FINAL_CONFIG, () => {
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
});
watch(() => FINAL_CONFIG.value.responsive, prepareChart, { flush: 'post' });
watch(cfgChart, () => scheduleResize?.(), { flush: 'post' });
watch(
    () => FINAL_CONFIG.value.initialRotation,
    (value) => {
        stopResetRotation();
        rotation.value = value;
    },
);
watch(
    () => FINAL_CONFIG.value.enableRotation,
    (value) => {
        if (!value) onUp();
    },
);
watch(loading, (value) => {
    if (value) {
        selectedLegendId.value = null;
        resetA11ySelection();
    }
});
watch(chordData, (data) => {
    if (!data.groups.some((group) => group.id === selectedGroupId.value))
        selectedGroupId.value = null;
    if (!data.groups.some((group) => group.id === selectedLegendId.value))
        selectedLegendId.value = null;
    if (!data.chords.some((chord) => chord.id === selectedRibbonId.value))
        selectedRibbonId.value = null;
    const collection =
        activeA11yType.value === 'group' ? data.groups : data.chords;
    if (!collection.some((item) => item.id === activeA11yId.value))
        activeA11yId.value = null;
});

defineExpose({
    getData,
    getImage,
    generateCsv,
    generateImage,
    generateSvg,
    generatePdf,
    toggleAnnotator,
    toggleTable,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        ref="chordChart"
        :class="{
            'vue-data-ui-component': true,
            'vue-ui-chord': true,
            'vue-data-ui-wrapper-fullscreen': isFullscreen,
            'vue-data-ui-responsive': FINAL_CONFIG.responsive,
        }"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor}`"
        :id="`chord_${uid}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
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
            v-if="FINAL_CONFIG.userOptions.buttons.annotator && svgRef"
            :color="cfgChart.color"
            :backgroundColor="cfgChart.backgroundColor"
            :active="isAnnotator"
            :svgRef="svgRef"
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

        <slot name="userConfig"></slot>

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
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'chord-div-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'chord-div-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

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
            :hasTooltip="false"
            :hasLabel="false"
            :isFullscreen="isFullscreen"
            :chartElement="chordChart"
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

        <svg
            :xmlns="XMLNS"
            ref="svgRef"
            :viewBox="`0 0 ${svg.width} ${svg.height}`"
            :aria-describedby="`chart-instructions-${uid}`"
            tabindex="0"
            preserveAspectRatio="xMidYMid meet"
            :style="{
                overflow: 'visible',
            }"
            :class="{
                'vue-ui-chord-rotating': dragging,
                'vue-ui-chord-idle': !dragging,
            }"
            @mousedown.prevent="onDown"
            @touchstart.prevent="onDown"
            @focus="onSvgFocus"
            @blur="onSvgBlur"
            @keydown="onSvgKeydown"
        >
            <PackageVersion />
            <slot
                name="svg-underlayer"
                :svg="{
                    height: 600,
                    width: 600,
                    isPrintingImg: isPrinting || isImaging || isCallbackImaging,
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

            <defs v-if="cfgArcs.labels.curved">
                <path
                    v-for="(g, i) in chordData.groups"
                    :key="`labelPath-${i}`"
                    :id="`labelPath-${i}_${uid}`"
                    :d="
                        labelArcPath(
                            g.startAngle,
                            g.endAngle,
                            (radii.inner + radii.outer) / 2 +
                                cfgArcs.labels.offset,
                        )
                    "
                    fill="none"
                />
            </defs>

            <g v-if="$slots.pattern">
                <defs v-for="(dp, i) in chordData.groups">
                    <slot
                        name="pattern"
                        v-bind="{
                            seriesIndex: dp.index,
                            patternId: `pattern_${uid}_${i}`,
                        }"
                    />
                </defs>
            </g>

            <g
                :transform="`translate(${svg.width / 2}, ${svg.height / 2}) rotate(${rotation})`"
            >
                <!-- Group Arcs -->
                <g v-for="(g, i) in chordData.groups">
                    <path
                        :class="{
                            'vue-ui-chord-arc': true,
                            'vue-ui-chord-arc-animated':
                                FINAL_CONFIG.useCssAnimation && !loaded,
                        }"
                        :key="`arc-${i}`"
                        :d="groupPaths.get(g.id)"
                        :fill="formattedDataset.colors[i]"
                        :stroke="cfgArcs.stroke"
                        :stroke-width="cfgArcs.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :style="{
                            opacity: getGroupOpacity(g),
                        }"
                        @mouseenter="selectGroup(g, i)"
                        @mouseleave="onGroupLeave(g, i)"
                        @click="onGroupClick(g, i)"
                    />
                    <path
                        v-if="$slots.pattern"
                        :class="{
                            'vue-ui-chord-arc': true,
                            'vue-ui-chord-arc-animated':
                                FINAL_CONFIG.useCssAnimation && !loaded,
                        }"
                        :key="`pattern-arc-${i}`"
                        :d="groupPaths.get(g.id)"
                        :fill="`url(#${g.pattern})`"
                        :stroke="cfgArcs.stroke"
                        :stroke-width="cfgArcs.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :style="{
                            opacity: getGroupOpacity(g),
                            pointerEvents: 'none',
                        }"
                    />
                </g>

                <!-- Chord Ribbons -->
                <g>
                    <template
                        v-for="(c, i) in visibleRibbons"
                        :key="`ribbon-${c.id}`"
                    >
                        <path
                            v-if="c.source.value"
                            :class="{
                                'vue-ui-chord-ribbon': true,
                            }"
                            :d="c.path"
                            :fill="cfgChart.backgroundColor"
                            :style="{
                                opacity: cfgRibbons.underlayerOpacity,
                            }"
                        />

                        <path
                            v-if="c.source.value"
                            :class="{
                                'vue-ui-chord-ribbon': true,
                            }"
                            :d="c.path"
                            :fill="formattedDataset.colors[c.source.index]"
                            :stroke="cfgRibbons.stroke"
                            :stroke-width="cfgRibbons.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :style="{ opacity: getRibbonOpacity(c) }"
                            @mouseenter="
                                selectRibbon(
                                    getRibbonPayload(c, true),
                                    c.renderIndex,
                                )
                            "
                            @click="
                                onRibbonClick(
                                    getRibbonPayload(c),
                                    c.renderIndex,
                                )
                            "
                            @mouseleave="
                                onRibbonLeave(
                                    getRibbonPayload(c),
                                    c.renderIndex,
                                )
                            "
                        />
                        <path
                            v-if="c.source.value && $slots.pattern"
                            :class="{
                                'vue-ui-chord-ribbon': true,
                            }"
                            :d="c.path"
                            :fill="`url(#pattern_${uid}_${c.source.index})`"
                            :stroke="cfgRibbons.stroke"
                            :stroke-width="cfgRibbons.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :style="{
                                opacity: getRibbonOpacity(c),
                                pointerEvents: 'none',
                            }"
                        />
                    </template>

                    <!-- SELECTED RIBBON ON TOP LAYER-->
                    <path
                        v-if="selectedRibbon"
                        :d="selectedRibbon.path"
                        :fill="selectedRibbon.color"
                        :stroke="cfgRibbons.stroke"
                        :stroke-width="cfgRibbons.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="{ 'vue-ui-chord-ribbon': true }"
                        :style="{
                            pointerEvents: 'none',
                        }"
                    />
                    <path
                        v-if="selectedRibbon && $slots.pattern"
                        :d="selectedRibbon.path"
                        :fill="`url(#${selectedRibbon.source.pattern})`"
                        :stroke="cfgRibbons.stroke"
                        :stroke-width="cfgRibbons.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="{ 'vue-ui-chord-ribbon': true }"
                        :style="{
                            pointerEvents: 'none',
                        }"
                    />
                </g>

                <!-- RIBBON LABELS WHEN A SELECTION OCCURS -->
                <g
                    v-if="
                        (selectedGroup || selectedRibbon || selectedLegendId) &&
                        cfgRibbons.labels.show
                    "
                >
                    <template v-for="lbl in separatedValueLabels" :key="lbl.id">
                        <!-- BACKGROUND STROKE -->
                        <line
                            :x1="lbl.midBaseX"
                            :y1="lbl.midBaseY"
                            :x2="
                                Math.cos(lbl.theta - Math.PI / 2) *
                                (radii.outer + cfgRibbons.labels.offset + 12)
                            "
                            :y2="
                                Math.sin(lbl.theta - Math.PI / 2) *
                                (radii.outer + cfgRibbons.labels.offset + 12)
                            "
                            :stroke="cfgChart.backgroundColor"
                            :stroke-width="
                                cfgRibbons.labels.connector.strokeWidth * 3
                            "
                            pointer-events="none"
                        />
                        <!-- MAIN STROKE -->
                        <line
                            :x1="lbl.midBaseX"
                            :y1="lbl.midBaseY"
                            :x2="
                                Math.cos(lbl.theta - Math.PI / 2) *
                                (radii.outer + cfgRibbons.labels.offset + 12)
                            "
                            :y2="
                                Math.sin(lbl.theta - Math.PI / 2) *
                                (radii.outer + cfgRibbons.labels.offset + 12)
                            "
                            :stroke="cfgRibbons.labels.connector.stroke"
                            :stroke-width="
                                cfgRibbons.labels.connector.strokeWidth
                            "
                            pointer-events="none"
                        />
                        <!-- DOT -->
                        <circle
                            v-if="cfgRibbons.labels.marker.show"
                            :cx="
                                Math.cos(lbl.theta - Math.PI / 2) *
                                (radii.outer + cfgRibbons.labels.offset + 12)
                            "
                            :cy="
                                Math.sin(lbl.theta - Math.PI / 2) *
                                (radii.outer + cfgRibbons.labels.offset + 12)
                            "
                            :r="cfgRibbons.labels.marker.radius"
                            :stroke="cfgRibbons.labels.marker.stroke"
                            :stroke-width="cfgRibbons.labels.marker.strokeWidth"
                            :fill="lbl.groupColor"
                            pointer-events="none"
                        />
                        <!-- DATALABEL -->
                        <text
                            :transform="`
                            translate(
                                ${Math.cos(lbl.theta - Math.PI / 2) * (radii.outer + cfgRibbons.labels.offset + 24)},
                                ${Math.sin(lbl.theta - Math.PI / 2) * (radii.outer + cfgRibbons.labels.offset + 24)}
                            ) rotate(${-rotation})
                            `"
                            :fill="
                                cfgRibbons.labels.useSerieColor
                                    ? lbl.groupColor
                                    : cfgRibbons.labels.color
                            "
                            :text-anchor="labelSide(lbl.theta)"
                            :font-size="cfgRibbons.labels.fontSize"
                            :font-weight="
                                cfgRibbons.labels.bold ? 'bold' : 'normal'
                            "
                            dy=".35em"
                            pointer-events="none"
                        >
                            {{ getLabel(lbl.value) }}
                        </text>
                    </template>
                </g>

                <!-- Group Labels -->
                <g v-if="cfgArcs.labels.show">
                    <template v-if="cfgArcs.labels.curved">
                        <text
                            class="vue-ui-chord-label-curved"
                            v-for="(g, i) in chordData.groups"
                            :key="`curved-label-${i}`"
                            :font-size="cfgArcs.labels.fontSize"
                            :font-weight="
                                cfgArcs.labels.bold ? 'bold' : 'normal'
                            "
                            :fill="
                                cfgArcs.labels.adaptColorToBackground
                                    ? adaptColorToBackground(
                                          formattedDataset.colors[i],
                                      )
                                    : cfgArcs.labels.color
                            "
                        >
                            <textPath
                                :href="`#labelPath-${i}_${uid}`"
                                startOffset="50%"
                                text-anchor="middle"
                            >
                                {{ getArcLabel(g, i) }}
                            </textPath>
                        </text>
                    </template>
                    <template
                        v-else-if="
                            !selectedGroup &&
                            !selectedRibbon &&
                            !selectedLegendId
                        "
                    >
                        <text
                            class="vue-ui-chord-label-straight"
                            v-for="(g, i) in chordData.groups"
                            :key="`label-${i}`"
                            :transform="`
                                ${labelTransform((g.startAngle + g.endAngle) / 2)}
                                rotate(${-rotation})
                            `"
                            dy=".35em"
                            :text-anchor="
                                rotatedMidAngle(g) > Math.PI ? 'end' : 'start'
                            "
                            :font-size="cfgArcs.labels.fontSize"
                            :font-weight="
                                cfgArcs.labels.bold ? 'bold' : 'normal'
                            "
                            :fill="cfgArcs.labels.color"
                            v-html="
                                createTSpansFromLineBreaksOnY({
                                    content: wrapText(getArcLabel(g, i)),
                                    fontSize: cfgArcs.labels.fontSize,
                                    fill: cfgArcs.labels.color,
                                    x: 0,
                                    y: 0,
                                })
                            "
                        />
                    </template>
                </g>
            </g>
            <slot
                name="svg"
                :svg="{
                    height: 600,
                    width: 600,
                    isPrintingImg: isPrinting || isImaging || isCallbackImaging,
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
                        :key="`legend_${legendStep}`"
                        :legendSet="legendSet"
                        :config="legendConfig"
                        :isCursorPointer="isCursorPointer"
                        @clickMarker="
                            ({ legend }) => selectLegendItem(legend.id)
                        "
                    >
                        <template
                            #legend-pattern="{ legend, index }"
                            v-if="$slots.pattern"
                        >
                            <Shape
                                :shape="legend.shape"
                                :radius="30"
                                stroke="none"
                                :plot="{ x: 30, y: 30 }"
                                :fill="`url(#pattern_${uid}_${index})`"
                            />
                        </template>
                        <template #item="{ legend }">
                            <div
                                data-cy="legend-item"
                                :style="{
                                    opacity: selectedLegendId
                                        ? selectedLegendId === legend.id
                                            ? 1
                                            : 0.3
                                        : 1,
                                }"
                                @click="legend.select()"
                            >
                                {{ legend.name }}
                            </div>
                        </template>
                    </Legend>
                </slot>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <div
            v-if="rotation !== FINAL_CONFIG.initialRotation"
            data-dom-to-png-ignore
            class="reset-wrapper"
        >
            <slot name="reset-action" :reset="resetRotation">
                <button
                    data-cy-reset
                    tabindex="0"
                    role="button"
                    class="vue-data-ui-refresh-button"
                    :style="{
                        background: cfgChart.backgroundColor,
                        cursor: isCursorPointer ? 'pointer' : 'default',
                    }"
                    @click="resetRotation"
                >
                    <BaseIcon name="refresh" :stroke="cfgChart.color" />
                </button>
            </slot>
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
                        {{ th.name }}
                    </template>
                    <template #td="{ td }">
                        <div style="text-align: right; width: 100%">
                            {{ td.name ? td.name : getLabel(td) }}
                        </div>
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

.vue-ui-chord * {
    transition: unset;
}

.vue-ui-chord {
    user-select: none;
    position: relative;
}

.vue-ui-chord.vue-data-ui-responsive {
    position: relative;
    width: 100%;
    height: 100%;
}

.vue-ui-chord.vue-data-ui-responsive svg {
    max-width: 100%;
    max-height: 100%;
    display: block;
    margin: auto;
}

.vue-ui-chord-arc,
.vue-ui-chord-ribbon {
    transition:
        opacity 0.2s ease-in-out,
        transform 0.2s ease-in-out;
}

.reset-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    height: 40px;
    position: absolute;
    bottom: 48px;
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
    transition: transform 0.2s ease-in-out;
    transform-origin: center;
    &:focus {
        outline: 1px solid currentColor;
    }
    &:hover {
        transform: rotate(-90deg);
    }
}

.vue-ui-chord-idle {
    cursor: grab;
}

.vue-ui-chord-rotating {
    cursor: grabbing;
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

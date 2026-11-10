<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
import { getTableComponent } from '../tableIntegration';
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
    toRefs,
    watch,
} from 'vue';
import {
    adaptColorToBackground,
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcNutArrowPath,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    makeDonut,
    objectIsEmpty,
    palette,
    setOpacity,
    shiftHue,
    treeShake,
    XMLNS,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';

import { useChartExport } from '../useChartExport';
import { useTableResponsive } from '../useTableResponsive';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { createChartImageGetter } from '../chartImage';
import themes from '../themes/vue_ui_chestnut.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import DefGrad from '../atoms/DefGrad.vue';

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
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

const { vue_ui_chestnut: DEFAULT_CONFIG } = useConfig();

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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const uid = ref(createUid());
const chestnutChart = ref(null);
const step = ref(0);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const isSvgKeyboardFocused = ref(false);
const hasStartedKeyboardNavigation = ref(false);
const accessibilityAnnouncement = ref('');

const accessibilityCursor = ref({
    level: 'root',
    rootIndex: 0,
    branchIndex: 0,
    nutIndex: 0,
});

const FINAL_CONFIG = ref(prepareConfig());
const cfgRoots = computed(() => FINAL_CONFIG.value.style.chart.layout.roots);
const cfgBranches = computed(
    () => FINAL_CONFIG.value.style.chart.layout.branches,
);
const cfgNuts = computed(() => FINAL_CONFIG.value.style.chart.layout.nuts);
const cfgLayout = computed(() => FINAL_CONFIG.value.style.chart.layout);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiChestnut',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: (ds) =>
                ds.some((dp) => dp?.branches && dp.branches.length > 10),
            message: [
                '👀 Some root has > 10 branches, which can make the chart heavy. Consider:',
                '',
                '▶️ Grouping some branches in broader categories.',
            ],
        },
        {
            test: (ds) =>
                ds.some(
                    (dp) =>
                        dp?.branches &&
                        dp.branches.some(
                            (b) => b?.breakdown && b?.breakdown.length > 6,
                        ),
                ),
            message: [
                '👀 Some donuts have > 6 series. Consider:',
                '',
                '▶️ Grouping small values into an "Other" category.',
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
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        grandTotal: { show: false },
                        roots: {
                            stroke: '#6A6A6A',
                            labels: { show: false },
                        },
                        verticalSeparator: { stroke: 'transparent' },
                        branches: {
                            stroke: '#6A6A6A',
                            underlayerColor: '#6A6A6A90',
                            labels: {
                                show: false,
                                dataLabels: { show: false },
                            },
                        },
                    },
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
        {
            name: '_',
            color: '#969696',
            branches: [
                {
                    name: '_',
                    value: 32,
                    breakdown: [
                        { name: '_', value: 16, color: '#CACACA' },
                        { name: '_', value: 16, color: '#6A6A6A' },
                    ],
                },
                {
                    name: '_',
                    value: 16,
                    breakdown: [
                        { name: '_', value: 8, color: '#CACACA' },
                        { name: '_', value: 8, color: '#6A6A6A' },
                    ],
                },
                {
                    name: '_',
                    value: 8,
                    breakdown: [
                        { name: '_', value: 4, color: '#CACACA' },
                        { name: '_', value: 4, color: '#6A6A6A' },
                    ],
                },
                {
                    name: '_',
                    value: 4,
                    breakdown: [
                        { name: '_', value: 2, color: '#CACACA' },
                        { name: '_', value: 2, color: '#6A6A6A' },
                    ],
                },
            ],
        },
        {
            name: '_',
            color: '#C4C4C4',
            branches: [
                {
                    name: '_',
                    value: 24,
                    breakdown: [
                        { name: '_', value: 12, color: '#CACACA' },
                        { name: '_', value: 12, color: '#6A6A6A' },
                    ],
                },
                {
                    name: '_',
                    value: 12,
                    breakdown: [
                        { name: '_', value: 6, color: '#CACACA' },
                        { name: '_', value: 6, color: '#6A6A6A' },
                    ],
                },
                {
                    name: '_',
                    value: 6,
                    breakdown: [
                        { name: '_', value: 3, color: '#CACACA' },
                        { name: '_', value: 3, color: '#6A6A6A' },
                    ],
                },
                {
                    name: '_',
                    value: 2,
                    breakdown: [
                        { name: '_', value: 1, color: '#CACACA' },
                        { name: '_', value: 1, color: '#6A6A6A' },
                    ],
                },
            ],
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: cfgLayout.value.title,
});

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

watch(
    () => props.config,
    (_newCfg) => {
        FINAL_CONFIG.value = prepareConfig();
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;

        prepareChart();
    },
    { deep: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-chestnut_${uid.value}`,
    fileName: cfgLayout.value.title.text || 'vue-ui-chestnut',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTable: FINAL_CONFIG.value.table.show,
        };
    },
    { immediate: true },
);

const tableContainer = ref(null);

const tableOutline = computed(() => FINAL_CONFIG.value.table.td.outline);

const breakpoint = computed(() => {
    return FINAL_CONFIG.value.table.responsiveBreakpoint;
});

const svgLayout = {
    gap: 6,
    padding: { top: 102, left: 12, right: 12, bottom: 96 },
    width: 1024,
    branchSize: 32,
    branchStart: 128,
};
const svg = computed(() => ({
    ...svgLayout,
    height:
        totalBranches.value * (svgLayout.branchSize + svgLayout.gap) +
        svgLayout.padding.top +
        svgLayout.padding.bottom,
}));

const drawableArea = computed(() => {
    return {
        left: svg.value.padding.left,
        top: svg.value.padding.top,
        right: svg.value.width - svg.value.padding.right,
        bottom: svg.value.height - svg.value.padding.bottom,
        width:
            svg.value.width -
            (svg.value.padding.left + svg.value.padding.right),
        height:
            svg.value.height -
            (svg.value.padding.top + svg.value.padding.bottom),
        seedX: svg.value.padding.left + 64,
    };
});

function ratio(value, total) {
    return total === 0 ? 0 : value / total;
}

const treeTotal = computed(() => {
    return FINAL_DATASET.value
        .flatMap((root) =>
            (root.branches || []).map((branch) => branch.value || 0),
        )
        .reduce((a, b) => a + b, 0);
});

const debug = computed(() => FINAL_CONFIG.value.debug);

const mutableDataset = computed(() => {
    if (debug.value) {
        FINAL_DATASET.value.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'branches'],
            }).forEach((attr) => {
                error({
                    componentName: 'VueUiChestnut',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                });
            });

            if (ds.branches) {
                ds.branches.forEach((branch, j) => {
                    getMissingDatasetAttributes({
                        datasetObject: branch,
                        requiredAttributes: ['name', 'value'],
                    }).forEach((attr) => {
                        error({
                            componentName: 'VueUiChestnut',
                            type: 'datasetSerieAttribute',
                            property: attr,
                            index: `${i} - ${j}`,
                        });
                    });

                    if (branch.breakdown) {
                        branch.breakdown.forEach((b, k) => {
                            getMissingDatasetAttributes({
                                datasetObject: b,
                                requiredAttributes: ['name', 'value'],
                            }).forEach((attr) => {
                                error({
                                    componentName: 'VueUiChestnut',
                                    type: 'datasetSerieAttribute',
                                    property: attr,
                                    index: `${i} - ${j} - ${k}`,
                                });
                            });
                        });
                    }
                });
            }
        });
    }

    return FINAL_DATASET.value.map((root, i) => {
        const rootTotal = (root.branches || [])
            .map((branch) => branch.value || 0)
            .reduce((a, b) => a + b, 0);
        const rootColor =
            convertColorToHex(root.color) ||
            customPalette.value[i] ||
            palette[i] ||
            palette[i % palette.length];
        return {
            ...root,
            color: rootColor,
            id: root.id || `root_${i}_${uid.value}`,
            type: 'root',
            total: rootTotal,
            rootIndex: i,
            branches: (root.branches || []).map((branch, j) => {
                return {
                    ...branch,
                    rootName: root.name,
                    rootIndex: i,
                    color: rootColor,
                    value: branch.value >= 0 ? branch.value : 0,
                    id: branch.id || `branch_${i}_${j}_${uid.value}`,
                    proportionToRoot: ratio(branch.value, rootTotal),
                    type: 'branch',
                    breakdown: (branch.breakdown || []).map((nut, k) => {
                        return {
                            table: {
                                rootName: root.name,
                                rootValue: rootTotal,
                                rootToTotal: ratio(rootTotal, treeTotal.value),
                                branchName: branch.name,
                                branchValue: branch.value,
                                branchToTotal: ratio(
                                    branch.value,
                                    treeTotal.value,
                                ),
                                branchToRoot: ratio(branch.value, rootTotal),
                                nutName: nut.name,
                                nutValue: nut.value,
                                nutToTotal: ratio(nut.value, treeTotal.value),
                                nutToRoot: ratio(nut.value, rootTotal),
                                nutToBranch: ratio(nut.value, branch.value),
                            },
                            ...nut,
                            type: 'nut',
                            branchName: branch.name,
                            rootName: root.name,
                            branchTotal: branch.value >= 0 ? branch.value : 0,
                            proportionToBranch: ratio(nut.value, branch.value),
                            proportionToRoot: ratio(nut.value, rootTotal),
                            proportionToTree: ratio(nut.value, treeTotal.value),
                            rootIndex: i,
                            id: nut.id || `nut_${i}_${j}_${k}_${uid.value}`,
                            color:
                                convertColorToHex(nut.color) ||
                                customPalette.value[k] ||
                                palette[k] ||
                                palette[k % palette.length],
                            value: nut.value >= 0 ? nut.value : 0,
                        };
                    }),
                };
            }),
        };
    });
});

/**
 * Return the current mutable dataset.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return mutableDataset.value;
}

const emit = defineEmits([
    'selectRoot',
    'selectBranch',
    'selectNut',
    'copyAlt',
]);

const totalBranches = computed(() => {
    return mutableDataset.value.flatMap((root) => root.branches).length;
});

const maxRoot = computed(() => {
    return Math.max(
        ...mutableDataset.value.map((root) =>
            root.branches
                .map((branch) => branch.value)
                .reduce((a, b) => a + b, 0),
        ),
    );
});

const maxBranch = computed(() => {
    return Math.max(
        ...mutableDataset.value.flatMap((root) =>
            root.branches.map((branch) => branch.value),
        ),
    );
});

const earth = computed(() => {
    return 256 + svg.value.padding.left;
});

const orderedDataset = computed(() =>
    [...mutableDataset.value].sort((a, b) => b.total - a.total),
);

const roots = computed(() => {
    return orderedDataset.value.map((root, i) => {
        const maxRadius =
            drawableArea.value.height / mutableDataset.value.length / 2;
        const radius =
            ratio(root.total, maxRoot.value) *
            (maxRadius > 64 ? 64 : maxRadius);
        return {
            ...root,
            x: drawableArea.value.seedX,
            y:
                drawableArea.value.top +
                (drawableArea.value.height / mutableDataset.value.length) *
                    (i + 1) -
                (drawableArea.value.height / mutableDataset.value.length / 2 +
                    svg.value.gap / 2),
            r:
                radius < svg.value.branchSize / 2
                    ? svg.value.branchSize / 2
                    : radius,
        };
    });
});

const canopea = computed(() => {
    if (cfgBranches.value.widthRatio <= 0) {
        return 0.1;
    }
    if (cfgBranches.value.widthRatio > 1.8) {
        return 1.8;
    }
    return cfgBranches.value.widthRatio;
});

const seeds = computed(() => {
    return roots.value.flatMap((root) => root.branches);
});

const branches = computed(() => {
    return [...seeds.value]
        .sort((a, b) => b.value - a.value)
        .map((branch, i) => {
            return {
                ...branch,
                y1:
                    i * svg.value.branchSize +
                    drawableArea.value.top +
                    i * svg.value.gap,
                y2: i * svg.value.branchSize + svg.value.branchSize,
                x1: earth.value,
                x2:
                    384 * ratio(branch.value, maxBranch.value) * canopea.value +
                    earth.value,
            };
        });
});

const branchesByRoot = computed(() => {
    return roots.value.map((root) => {
        return branches.value
            .filter((branch) => branch.rootIndex === root.rootIndex)
            .sort((a, b) => a.y1 - b.y1);
    });
});

const nutsByRootAndBranch = computed(() => {
    return roots.value.map((_, rootPosition) => {
        return branchesByRoot.value[rootPosition].map((branch) => {
            return (branch.breakdown || []).map((nut, nutIndex) => {
                return {
                    ...nut,
                    nutIndex,
                    rootIndex: branch.rootIndex,
                    branchId: branch.id,
                    branchName: branch.name,
                    branchValue: branch.value,
                    rootName: branch.rootName,
                };
            });
        });
    });
});

const rootsByIndex = computed(
    () => new Map(roots.value.map((root) => [root.rootIndex, root])),
);

function getRoot(branch) {
    const { x, y, r } = rootsByIndex.value.get(branch.rootIndex);
    return { x, y, r };
}

const miniDonuts = computed(
    () =>
        new Map(
            branches.value.map((branch) => [
                branch.id,
                makeDonut(
                    { series: branch.breakdown, base: 1 },
                    branch.x2 + 24 + cfgNuts.value.offsetX,
                    branch.y1 + svg.value.branchSize / 2,
                    svg.value.branchSize / 3,
                    svg.value.branchSize / 3,
                ),
            ]),
        ),
);

const selectedNut = ref(null);
const openNut = computed(() =>
    selectedNut.value
        ? makeDonut(
              { series: selectedNut.value.breakdown, base: 1 },
              selectedNut.value.x2 + 24 + cfgNuts.value.offsetX,
              selectedNut.value.y1 + svg.value.branchSize / 2,
              80,
              80,
          )
        : null,
);
let selectionSequence = 0;
let chartDisposed = false;
const selectedBranch = ref(null);
const selectedRoot = ref(null);

function resetTree() {
    selectionSequence += 1;
    selectedNut.value = null;
    selectedBranch.value = null;
    selectedRoot.value = null;
}

function matchesBranch(part, branch) {
    if (part.type === 'root') return part.rootIndex === branch.rootIndex;
    if (part.type === 'branch') return part.id === branch.id;
    if (part.type === 'nut')
        return (
            part.branchName === branch.name &&
            part.rootIndex === branch.rootIndex
        );
    return false;
}

function resetChart() {
    resetTree();
    resetAccessibilityCursor();
    hasStartedKeyboardNavigation.value = false;
}

function setBranchCursor(branch, level) {
    const rootPosition = roots.value.findIndex(
        (root) => root.rootIndex === branch.rootIndex,
    );
    const branchPosition = (branchesByRoot.value[rootPosition] || []).findIndex(
        (item) => item.id === branch.id,
    );
    if (rootPosition !== -1) accessibilityCursor.value.rootIndex = rootPosition;
    if (branchPosition !== -1)
        accessibilityCursor.value.branchIndex = branchPosition;
    accessibilityCursor.value.level = level;
    accessibilityCursor.value.nutIndex = 0;
}

function matchesRoot(part, root) {
    if (!root) return false;
    if (part.type === 'root') return part.id === root.id;
    return (
        ['branch', 'nut'].includes(part.type) &&
        part.rootIndex === root.rootIndex
    );
}

function isFocused(part) {
    const selected = selectedNut.value ?? selectedBranch.value;
    if (selected) return matchesBranch(part, selected);
    if (selectedRoot.value) return matchesRoot(part, selectedRoot.value);
    if (!isSvgKeyboardFocused.value || !hasStartedKeyboardNavigation.value)
        return true;
    const level = accessibilityCursor.value.level;
    if (level === 'root') return matchesRoot(part, currentRoot.value);
    if (part.type === 'root')
        return (
            !!currentRoot.value &&
            part.rootIndex === currentRoot.value.rootIndex
        );
    if (part.type === 'branch')
        return !!currentBranch.value && part.id === currentBranch.value.id;
    if (level === 'nut' && currentBranch.value)
        return matchesBranch(part, currentBranch.value);
    return false;
}

function pickNut(branch) {
    resetTree();

    setBranchCursor(branch, 'nut');

    const sequence = selectionSequence;
    nextTick(() => {
        if (chartDisposed || sequence !== selectionSequence) return;
        selectedNut.value = branch;
        selectedBranch.value = branch;
        emit('selectNut', branch.breakdown);
        announceCurrentCursor();
    });
}

function leaveNut() {
    selectionSequence += 1;
    selectedNut.value = null;
    emit('selectNut', null);
}

function pickBranch(branch) {
    setBranchCursor(branch, 'branch');

    if (selectedBranch.value && selectedBranch.value.id === branch.id) {
        selectedBranch.value = null;
        resetTree();
        emit('selectBranch', null);
        announceCurrentCursor();
    } else {
        resetTree();
        selectedBranch.value = branch;
        emit('selectBranch', branch);
        announceCurrentCursor();
    }
}

function pickRoot(root) {
    const rootPosition = roots.value.findIndex((item) => item.id === root.id);

    if (rootPosition !== -1) {
        accessibilityCursor.value.rootIndex = rootPosition;
    }

    accessibilityCursor.value.level = 'root';
    accessibilityCursor.value.branchIndex = 0;
    accessibilityCursor.value.nutIndex = 0;

    if (selectedRoot.value && selectedRoot.value.id === root.id) {
        resetTree();
        emit('selectRoot', null);
        announceCurrentCursor();
    } else {
        resetTree();
        selectedRoot.value = root;
        emit('selectRoot', root);
        announceCurrentCursor();
    }
}

function placeLegendTopOrBottom() {
    const overflowsBottom =
        drawableArea.value.bottom - (selectedNut.value.y1 + 180) < 0;
    if (overflowsBottom) {
        return 0;
    } else {
        return drawableArea.value.bottom;
    }
}

const nutLabelGeometry = computed(
    () =>
        new Map(
            (openNut.value || []).map((arc) => [
                arc,
                {
                    normal: calcMarkerOffsetX(arc),
                    selected: calcMarkerOffsetX(arc, true),
                    y: calcMarkerOffsetY(arc),
                },
            ]),
        ),
);

function isArcBigEnough(arc) {
    return (
        arc.proportion * 100 >
        cfgNuts.value.selected.labels.dataLabels.hideUnderValue
    );
}

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiChestnut',
            type: 'dataset',
            debug: debug.value,
        });
    }
}

const tableColumns = [
    { key: 'rootName', group: 'root' },
    { key: 'rootValue', group: 'root', numeric: true },
    { key: 'rootToTotal', group: 'root', percentage: true },
    { key: 'branchName', group: 'branch' },
    { key: 'branchValue', group: 'branch', numeric: true },
    { key: 'branchToRoot', group: 'branch', percentage: true },
    { key: 'branchToTotal', group: 'branch', percentage: true },
    { key: 'nutName' },
    { key: 'nutValue', numeric: true },
    { key: 'nutToBranch', percentage: true },
    { key: 'nutToRoot', percentage: true },
    { key: 'nutToTotal', percentage: true },
];

const tableRows = computed(() =>
    orderedDataset.value.flatMap((root) =>
        root.branches.flatMap((branch, branchIndex) =>
            branch.breakdown.map((nut) => ({
                data: nut.table,
                rootIndex: root.rootIndex,
                branchIndex,
            })),
        ),
    ),
);

const table = computed(() => ({
    head: tableColumns.map(
        (column) => FINAL_CONFIG.value.table.th.translations[column.key],
    ),
    body: tableRows.value.map((row) => row.data),
}));

function isRepeatedTableGroup(index, group) {
    if (!group || index === 0) return false;
    const previous = tableRows.value[index - 1];
    const current = tableRows.value[index];
    return (
        previous.rootIndex === current.rootIndex &&
        (group === 'root' || previous.branchIndex === current.branchIndex)
    );
}

function formatTableCell(row, column) {
    const value = row[column.key];
    if (column.percentage)
        return `${(value * 100).toFixed(FINAL_CONFIG.value.table.td.roundingPercentage)}%`;
    if (column.numeric)
        return value.toFixed(FINAL_CONFIG.value.table.td.roundingValue);
    return value;
}

const tableDisplayRows = computed(() =>
    table.value.body.map((row, index) =>
        tableColumns.map((column) =>
            isRepeatedTableGroup(index, column.group)
                ? ''
                : formatTableCell(row, column),
        ),
    ),
);

function generateCsv(callback = null) {
    nextTick(() => {
        const title = [
            [cfgLayout.value.title.text],
            [cfgLayout.value.title.subtitle.text],
            [''],
            ['Grand total', treeTotal.value],
            [''],
        ];
        const head = table.value.head;
        const body = table.value.body.map((row, index) =>
            tableColumns.map((column) =>
                isRepeatedTableGroup(index, column.group)
                    ? ''
                    : row[column.key],
            ),
        );
        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);
        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgLayout.value.title.text || 'vue-ui-chestnut',
            });
        } else {
            callback(csvContent);
        }
    });
}

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const getImage = createChartImageGetter(
    chestnutChart,
    () => cfgLayout.value.title.text,
);

function buildLinkPath(branch) {
    const root = getRoot(branch);
    const x0 = branch.x1;
    const y0 = branch.y1;
    const t = svg.value.branchSize;
    const xR = root.x + root.r / 2;
    const yR = root.y;
    const k = 20;
    return [
        `M ${x0},${y0}`,
        `C ${x0 - k},${y0} ${x0 - k},${y0} ${xR},${yR}`,
        `C ${xR},${yR} ${x0 - k},${y0 + t} ${x0},${y0 + t}`,
        `Z`,
    ].join(' ');
}

const linkPaths = computed(
    () =>
        new Map(
            branches.value.map((branch) => [branch.id, buildLinkPath(branch)]),
        ),
);
function getLinkPath(branch) {
    return linkPaths.value.get(branch.id);
}

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: cfgChart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: chestnutChart,
        maxWidth: 800,
        titleStyle: cfgLayout,
        isCursorPointer,
    }),
);

watch(
    () => mutableConfig.value.showTable,
    async (v) => {
        if (FINAL_CONFIG.value.table.show) return;
        if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
            await nextTick();
            tableUnit.value.open();
        } else {
            if (tableUnit.value && 'close' in tableUnit.value) {
                tableUnit.value.close();
            }
        }
    },
);

const { isResponsive } = useTableResponsive(tableContainer, breakpoint);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const legendSet = computed(() => {
    return orderedDataset.value.map((root, i) => {
        return {
            ...root,
            display: `${root.name}: ${applyDataLabel(
                cfgRoots.value.labels.formatter,
                root.total,
                dataLabel({
                    p: cfgLayout.value.legend.prefix,
                    v: root.total,
                    s: cfgLayout.value.legend.suffix,
                    r: cfgLayout.value.legend.roundingValue,
                }),
                { datapoint: root },
            )} (${dataLabel({
                v: ratio(root.total, treeTotal.value) * 100,
                s: '%',
                r: cfgLayout.value.legend.roundingPercentage,
            })})`,
        };
    });
});

const svgLegendItems = computed(() => {
    return legendSet.value.map((l) => ({
        color: l.color,
        name: l.display,
        shape: 'circle',
    }));
});

const svgBg = computed(() => cfgChart.value.backgroundColor);

const svgLegend = computed(() => ({
    ...cfgLayout.value.legend,
    textAlign: 'center',
    show: true,
    position: 'bottom',
}));

const svgTitle = computed(() => cfgLayout.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: svgLegend,
        legendItems: svgLegendItems,
        backgroundColor: svgBg,
        titleEmbedded: true,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: mutableDataset.value,
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
            dataset: mutableDataset.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/

function getRootAnnouncement(root) {
    if (!root) return '';

    const valueLabel = dataLabel({
        p: cfgLayout.value.legend.prefix,
        v: root.total,
        s: cfgLayout.value.legend.suffix,
        r: cfgLayout.value.legend.roundingValue,
    });

    const percentageLabel = dataLabel({
        v: ratio(root.total, treeTotal.value) * 100,
        s: '%',
        r: cfgLayout.value.legend.roundingPercentage,
    });

    return `Root ${root.name}. Value ${valueLabel}. ${percentageLabel} of total.`;
}

function getBranchAnnouncement(branch) {
    if (!branch) return '';

    const valueLabel = dataLabel({
        p: cfgBranches.value.labels.dataLabels.prefix,
        v: branch.value,
        s: cfgBranches.value.labels.dataLabels.suffix,
        r: cfgBranches.value.labels.dataLabels.roundingValue,
    });

    const percentageToRoot = dataLabel({
        v: branch.proportionToRoot * 100,
        s: '%',
        r: cfgLayout.value.legend.roundingPercentage,
    });

    return `Branch ${branch.name}. Root ${branch.rootName}. Value ${valueLabel}. ${percentageToRoot} of root ${branch.rootName}.`;
}

function getNutAnnouncement(nut) {
    if (!nut) return '';

    const valueLabel = dataLabel({
        p: cfgLayout.value.legend.prefix,
        v: nut.value,
        s: cfgLayout.value.legend.suffix,
        r: cfgNuts.value.selected.roundingValue,
    });

    const percentageToBranch = dataLabel({
        v: nut.proportionToBranch * 100,
        s: '%',
        r: cfgNuts.value.selected.roundingPercentage,
    });

    return `Nut ${nut.name}. Branch ${nut.branchName}. Root ${nut.rootName}. Value ${valueLabel}. ${percentageToBranch} of branch ${nut.branchName}.`;
}

const currentRoot = computed(() => {
    return roots.value[accessibilityCursor.value.rootIndex] || null;
});

const currentBranch = computed(() => {
    const rootBranches =
        branchesByRoot.value[accessibilityCursor.value.rootIndex] || [];
    return rootBranches[accessibilityCursor.value.branchIndex] || null;
});

const currentNut = computed(() => {
    const rootBranches =
        nutsByRootAndBranch.value[accessibilityCursor.value.rootIndex] || [];
    const branchNuts =
        rootBranches[accessibilityCursor.value.branchIndex] || [];
    return branchNuts[accessibilityCursor.value.nutIndex] || null;
});

function announceCurrentCursor() {
    if (accessibilityCursor.value.level === 'root') {
        accessibilityAnnouncement.value = getRootAnnouncement(
            currentRoot.value,
        );
        return;
    }
    if (accessibilityCursor.value.level === 'branch') {
        accessibilityAnnouncement.value = getBranchAnnouncement(
            currentBranch.value,
        );
        return;
    }
    if (accessibilityCursor.value.level === 'nut') {
        accessibilityAnnouncement.value = getNutAnnouncement(currentNut.value);
    }
}

function resetAccessibilityCursor() {
    accessibilityCursor.value = {
        level: 'root',
        rootIndex: 0,
        branchIndex: 0,
        nutIndex: 0,
    };
    accessibilityAnnouncement.value = '';
}

function clampBranchIndex() {
    const rootBranches =
        branchesByRoot.value[accessibilityCursor.value.rootIndex] || [];
    if (!rootBranches.length) {
        accessibilityCursor.value.branchIndex = 0;
        return;
    }
    if (accessibilityCursor.value.branchIndex >= rootBranches.length) {
        accessibilityCursor.value.branchIndex = 0;
    }
    if (accessibilityCursor.value.branchIndex < 0) {
        accessibilityCursor.value.branchIndex = rootBranches.length - 1;
    }
}

function clampNutIndex() {
    const rootBranches =
        nutsByRootAndBranch.value[accessibilityCursor.value.rootIndex] || [];
    const branchNuts =
        rootBranches[accessibilityCursor.value.branchIndex] || [];
    if (!branchNuts.length) {
        accessibilityCursor.value.nutIndex = 0;
        return;
    }
    if (accessibilityCursor.value.nutIndex >= branchNuts.length) {
        accessibilityCursor.value.nutIndex = 0;
    }
    if (accessibilityCursor.value.nutIndex < 0) {
        accessibilityCursor.value.nutIndex = branchNuts.length - 1;
    }
}

function moveVertical(stepDirection) {
    if (accessibilityCursor.value.level === 'root') {
        const totalRoots = roots.value.length;
        if (!totalRoots) return;
        accessibilityCursor.value.rootIndex += stepDirection;
        if (accessibilityCursor.value.rootIndex >= totalRoots) {
            accessibilityCursor.value.rootIndex = 0;
        }
        if (accessibilityCursor.value.rootIndex < 0) {
            accessibilityCursor.value.rootIndex = totalRoots - 1;
        }
        accessibilityCursor.value.branchIndex = 0;
        accessibilityCursor.value.nutIndex = 0;
        announceCurrentCursor();
        return;
    }

    if (accessibilityCursor.value.level === 'branch') {
        accessibilityCursor.value.branchIndex += stepDirection;
        clampBranchIndex();
        accessibilityCursor.value.nutIndex = 0;
        announceCurrentCursor();
        return;
    }

    if (accessibilityCursor.value.level === 'nut') {
        accessibilityCursor.value.nutIndex += stepDirection;
        clampNutIndex();
        announceCurrentCursor();
    }
}

function moveHorizontal(stepDirection) {
    if (stepDirection > 0) {
        if (accessibilityCursor.value.level === 'root') {
            const rootBranches =
                branchesByRoot.value[accessibilityCursor.value.rootIndex] || [];
            if (!rootBranches.length) return;

            accessibilityCursor.value.level = 'branch';
            accessibilityCursor.value.branchIndex = 0;
            accessibilityCursor.value.nutIndex = 0;
            announceCurrentCursor();
            return;
        }

        if (accessibilityCursor.value.level === 'branch') {
            const rootBranches =
                nutsByRootAndBranch.value[
                    accessibilityCursor.value.rootIndex
                ] || [];
            const branchNuts =
                rootBranches[accessibilityCursor.value.branchIndex] || [];
            if (!branchNuts.length) return;

            accessibilityCursor.value.level = 'nut';
            accessibilityCursor.value.nutIndex = 0;

            if (currentBranch.value) {
                pickNut(currentBranch.value);
            } else {
                announceCurrentCursor();
            }

            return;
        }

        return;
    }

    if (accessibilityCursor.value.level === 'nut') {
        leaveNut();
        selectedBranch.value = null;
        accessibilityCursor.value.level = 'branch';
        accessibilityCursor.value.nutIndex = 0;
        announceCurrentCursor();
        return;
    }

    if (accessibilityCursor.value.level === 'branch') {
        selectedBranch.value = null;
        selectedRoot.value = null;
        accessibilityCursor.value.level = 'root';
        accessibilityCursor.value.nutIndex = 0;
        announceCurrentCursor();
    }
}

function activateCurrentCursor() {
    if (accessibilityCursor.value.level === 'root' && currentRoot.value) {
        pickRoot(currentRoot.value);
        accessibilityAnnouncement.value = `${getRootAnnouncement(currentRoot.value)} selected.`;
        return;
    }
    if (accessibilityCursor.value.level === 'branch' && currentBranch.value) {
        pickBranch(currentBranch.value);
        accessibilityAnnouncement.value = `${getBranchAnnouncement(currentBranch.value)} selected.`;
        return;
    }
    if (
        accessibilityCursor.value.level === 'nut' &&
        currentBranch.value &&
        currentNut.value
    ) {
        pickNut(currentBranch.value);
        accessibilityAnnouncement.value = `${getNutAnnouncement(currentNut.value)} details opened.`;
    }
}

function onSvgFocus() {
    isSvgKeyboardFocused.value = true;
    hasStartedKeyboardNavigation.value = false;
}

function onSvgBlur() {
    isSvgKeyboardFocused.value = false;
    hasStartedKeyboardNavigation.value = false;
    accessibilityAnnouncement.value = '';
    if (!selectedRoot.value && !selectedBranch.value && !selectedNut.value) {
        resetAccessibilityCursor();
    }
}

function onSvgKeydown(event) {
    const isUp = event.key === 'ArrowUp';
    const isDown = event.key === 'ArrowDown';
    const isLeft = event.key === 'ArrowLeft';
    const isRight = event.key === 'ArrowRight';
    const isActivate = event.key === 'Enter' || event.key === ' ';
    const isEscape = event.key === 'Escape';

    if (!isUp && !isDown && !isLeft && !isRight && !isActivate && !isEscape)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (!isSvgKeyboardFocused.value) {
        isSvgKeyboardFocused.value = true;
    }

    if (isEscape) {
        resetTree();
        resetAccessibilityCursor();
        hasStartedKeyboardNavigation.value = false;
        return;
    }

    if (isUp || isDown || isLeft || isRight) {
        hasStartedKeyboardNavigation.value = true;
    }

    if (isUp) {
        moveVertical(-1);
        return;
    }

    if (isDown) {
        moveVertical(1);
        return;
    }

    if (isLeft) {
        moveHorizontal(-1);
        return;
    }

    if (isRight) {
        moveHorizontal(1);
        return;
    }

    if (isActivate) {
        activateCurrentCursor();
    }
}

watch(
    [roots, branches],
    ([nextRoots, nextBranches], [previousRoots, previousBranches]) => {
        selectionSequence += 1;
        const cursor = accessibilityCursor.value;
        const previousRoot = previousRoots[cursor.rootIndex];
        const previousBranch = previousBranches.filter(
            (branch) => branch.rootIndex === previousRoot?.rootIndex,
        )[cursor.branchIndex];
        const previousNut = previousBranch?.breakdown[cursor.nutIndex];
        const find = (items, selected) =>
            selected
                ? (items.find((item) => item.id === selected.id) ?? null)
                : null;
        selectedRoot.value = find(nextRoots, selectedRoot.value);
        selectedBranch.value = find(nextBranches, selectedBranch.value);
        selectedNut.value = find(nextBranches, selectedNut.value);
        const rootIndex = nextRoots.findIndex(
            (root) => root.id === previousRoot?.id,
        );
        cursor.rootIndex = Math.max(0, rootIndex);
        const rootBranches = branchesByRoot.value[cursor.rootIndex] || [];
        cursor.branchIndex = Math.max(
            0,
            rootBranches.findIndex(
                (branch) => branch.id === previousBranch?.id,
            ),
        );
        const nuts = rootBranches[cursor.branchIndex]?.breakdown || [];
        cursor.nutIndex = Math.max(
            0,
            nuts.findIndex((nut) => nut.id === previousNut?.id),
        );
        if (hasStartedKeyboardNavigation.value) announceCurrentCursor();
    },
);

onBeforeUnmount(() => {
    chartDisposed = true;
    selectionSequence += 1;
});

const a11yTable = computed(() => ({
    headers: table.value.head,
    rows: table.value.body.map((row) =>
        tableColumns.map((column) =>
            column.percentage
                ? dataLabel({
                      v: row[column.key] * 100,
                      s: '%',
                      r: FINAL_CONFIG.value.table.td.roundingPercentage,
                  })
                : row[column.key],
        ),
    ),
}));

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        :class="`vue-data-ui-component vue-ui-chestnut ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        ref="chestnutChart"
        :id="`vue-ui-chestnut_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <!-- A11Y -->
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <div aria-live="polite" class="sr-only">
            {{ accessibilityAnnouncement }}
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

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="
                FINAL_CONFIG.userOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :isFullscreen="isFullscreen"
            :chartElement="chestnutChart"
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

        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                }"
                v-if="svg.height > 0"
                :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
                :style="`overflow:visible;background:transparent;color:${cfgChart.color}`"
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

                <!-- TITLE AS G -->
                <g v-if="!selectedNut">
                    <text
                        data-cy="chestnut-title"
                        v-if="cfgLayout.title.text"
                        text-anchor="middle"
                        :fill="cfgLayout.title.color"
                        :font-weight="cfgLayout.title.bold ? 'bold' : 'normal'"
                        :font-size="cfgLayout.title.fontSize"
                        :x="svg.width / 2"
                        :y="
                            12 +
                            cfgLayout.title.fontSize +
                            cfgLayout.title.offsetY
                        "
                        @click="resetChart"
                    >
                        {{ cfgLayout.title.text }}
                    </text>
                    <text
                        data-cy="chestnut-subtitle"
                        v-if="cfgLayout.title.subtitle.text"
                        text-anchor="middle"
                        :fill="cfgLayout.title.subtitle.color"
                        :font-weight="
                            cfgLayout.title.subtitle.bold ? 'bold' : 'normal'
                        "
                        :font-size="cfgLayout.title.subtitle.fontSize"
                        :x="svg.width / 2"
                        :y="
                            48 +
                            cfgLayout.title.subtitle.fontSize +
                            cfgLayout.title.subtitle.offsetY
                        "
                        @click="resetChart"
                    >
                        {{ cfgLayout.title.subtitle.text }}
                    </text>
                </g>

                <!-- DEFS -->
                <defs>
                    <DefGrad
                        t="radial"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        v-for="(d, i) in mutableDataset"
                        :id="`root_gradient_${uid}_${d.rootIndex}`"
                        :key="`root_gradient_${uid}_${d.rootIndex}`"
                        :stops="[
                            [
                                '0%',
                                setOpacity(
                                    shiftHue(d.color, 0.05),
                                    100 - cfgRoots.gradientIntensity,
                                ),
                                1,
                            ],
                            ['100%', d.color, 1],
                        ]"
                    />
                    <DefGrad
                        t="linear"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                        v-for="d in mutableDataset"
                        :id="`branch_gradient_${uid}_${d.rootIndex}`"
                        :key="`branch_gradient_${uid}_${d.rootIndex}`"
                        :stops="[
                            ['0%', d.color, 1],
                            [
                                '100%',
                                setOpacity(
                                    shiftHue(d.color, 0.02),
                                    100 - cfgBranches.gradientIntensity,
                                ),
                                1,
                            ],
                        ]"
                    />
                    <!-- picked nut core gradient -->
                    <DefGrad
                        t="radial"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        :id="`nutpick_${uid}`"
                        :stops="[
                            ['0%', setOpacity('#FFFFFF', 0), 0],
                            [
                                '80%',
                                setOpacity(
                                    '#FFFFFF',
                                    cfgNuts.selected.gradientIntensity,
                                ),
                                1,
                            ],
                            ['100%', setOpacity('#FFFFFF', 0), 0],
                        ]"
                    />
                    <DefGrad
                        t="radial"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        :id="`nut_${uid}`"
                        :stops="[
                            ['0%', setOpacity('#FFFFFF', 0), 0],
                            [
                                '80%',
                                setOpacity(
                                    '#FFFFFF',
                                    cfgNuts.gradientIntensity,
                                ),
                                1,
                            ],
                            ['100%', setOpacity('#FFFFFF', 0), 0],
                        ]"
                    />
                    <!-- picked nut underlayer -->
                    <DefGrad
                        t="radial"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        :id="`nut_underlayer_${uid}`"
                        :stops="[
                            [
                                '0%',
                                setOpacity(cfgChart.backgroundColor, 100),
                                1,
                            ],
                            [
                                '80%',
                                setOpacity(cfgChart.backgroundColor, 60),
                                1,
                            ],
                            [
                                '100%',
                                setOpacity(cfgChart.backgroundColor, 0),
                                1,
                            ],
                        ]"
                    />
                </defs>

                <!-- GRAND TOTAL -->
                <g v-if="cfgLayout.grandTotal.show">
                    <text
                        :x="drawableArea.seedX"
                        :y="32 + cfgLayout.grandTotal.offsetY"
                        :font-size="cfgLayout.grandTotal.fontSize"
                        :font-weight="
                            cfgLayout.grandTotal.bold ? 'bold' : 'normal'
                        "
                        :fill="cfgLayout.grandTotal.color"
                        text-anchor="middle"
                        @click="resetChart"
                    >
                        {{ cfgLayout.grandTotal.text }}
                    </text>
                    <text
                        :x="drawableArea.seedX"
                        :y="
                            38 +
                            cfgLayout.grandTotal.fontSize +
                            cfgLayout.grandTotal.offsetY
                        "
                        :font-size="cfgLayout.grandTotal.fontSize"
                        :font-weight="
                            cfgLayout.grandTotal.bold ? 'bold' : 'normal'
                        "
                        :fill="cfgLayout.grandTotal.color"
                        text-anchor="middle"
                        @click="resetChart"
                    >
                        {{
                            applyDataLabel(
                                cfgLayout.grandTotal.formatter,
                                treeTotal,
                                dataLabel({
                                    p: cfgLayout.grandTotal.prefix,
                                    v: treeTotal,
                                    s: cfgLayout.grandTotal.suffix,
                                    r: cfgLayout.grandTotal.roundingValue,
                                }),
                            )
                        }}
                    </text>
                </g>

                <!-- LINKS -->
                <g v-for="branch in branches">
                    <defs>
                        <DefGrad
                            t="linear"
                            :id="`link_grad_${branch.id}`"
                            :stops="[
                                ['0%', branch.color, 1],
                                [
                                    '100%',
                                    setOpacity(
                                        branch.color,
                                        cfgLayout.links.opacity,
                                    ),
                                    1,
                                ],
                            ]"
                        />
                    </defs>
                    <path
                        :d="getLinkPath(branch)"
                        :stroke="
                            setOpacity(branch.color, cfgLayout.links.opacity)
                        "
                        :fill="`url(#link_grad_${branch.id})`"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :style="`opacity:${isFocused(branch) ? 1 : 0}`"
                        @click="resetChart"
                    />
                </g>

                <!-- ROOTS -->
                <circle
                    v-for="root in roots"
                    :cx="root.x"
                    :cy="root.y"
                    :r="root.r"
                    :fill="cfgRoots.underlayerColor"
                    stroke="none"
                    :style="`cursor:${isCursorPointer ? 'pointer' : 'default'}; opacity:${isFocused(root) ? 1 : 0.05}`"
                />
                <circle
                    v-for="(root, i) in roots"
                    :data-cy="`chestnut-root-${i}`"
                    :aria-label="getRootAnnouncement(root)"
                    :cx="root.x"
                    :cy="root.y"
                    :r="root.r"
                    :fill="
                        cfgRoots.useGradient
                            ? `url(#root_gradient_${uid}_${root.rootIndex})`
                            : root.color
                    "
                    :stroke="cfgRoots.stroke"
                    :stroke-width="cfgRoots.strokeWidth"
                    :style="`cursor:${isCursorPointer ? 'pointer' : 'default'}; opacity:${isFocused(root) ? 1 : 0.05}`"
                    @click="pickRoot(root)"
                />
                <g v-if="cfgRoots.labels.show">
                    <!-- ROOT TOTAL -->
                    <text
                        v-for="(root, i) in roots"
                        :data-cy="`chestnut-root-label-${i}`"
                        :x="root.x"
                        :y="root.y + cfgRoots.labels.fontSize / 2.6"
                        text-anchor="middle"
                        :font-size="cfgRoots.labels.fontSize"
                        :fill="
                            cfgRoots.labels.adaptColorToBackground
                                ? adaptColorToBackground(root.color)
                                : cfgRoots.labels.color
                        "
                        font-weight="bold"
                        :style="`cursor:${isCursorPointer ? 'pointer' : 'default'}; opacity:${isFocused(root) ? 1 : 0.05}`"
                        @click="pickRoot(root)"
                    >
                        {{
                            applyDataLabel(
                                cfgRoots.labels.formatter,
                                root.total,
                                dataLabel({
                                    p: cfgRoots.labels.prefix,
                                    v: root.total,
                                    s: cfgRoots.labels.suffix,
                                    r: cfgRoots.labels.roundingValue,
                                }),
                                { datapoint: root },
                            )
                        }}
                    </text>
                    <!-- ROOT NAME LABEL -->
                    <g v-for="root in roots">
                        <g
                            v-if="
                                (selectedNut &&
                                    root.rootIndex === selectedNut.rootIndex) ||
                                (selectedBranch &&
                                    root.rootIndex ===
                                        selectedBranch.rootIndex) ||
                                (selectedRoot &&
                                    root.rootIndex === selectedRoot.rootIndex)
                            "
                        >
                            <text
                                :x="root.x"
                                :y="root.y + root.r + 24"
                                text-anchor="middle"
                                :fill="cfgRoots.labels.name.color"
                                :font-size="cfgRoots.labels.name.fontSize"
                                :font-weight="
                                    cfgRoots.labels.name.bold
                                        ? 'bold'
                                        : 'normal'
                                "
                                @click="resetChart"
                            >
                                {{ root.name }}
                            </text>
                        </g>
                    </g>
                </g>

                <!-- BRANCHES -->
                <rect
                    data-cy="chestnut-branch"
                    v-for="branch in branches"
                    :x="branch.x1"
                    :y="branch.y1"
                    :height="svg.branchSize"
                    :width="branch.x2 - branch.x1"
                    :fill="cfgBranches.underlayerColor"
                    :rx="cfgBranches.borderRadius"
                    stroke="none"
                    :style="`opacity:${isFocused(branch) ? 1 : 0.05}`"
                    @click="pickBranch(branch)"
                />
                <rect
                    v-for="(branch, i) in branches"
                    :data-cy="`chestnut-branch-${i}`"
                    :aria-label="getBranchAnnouncement(branch)"
                    :x="branch.x1"
                    :y="branch.y1"
                    :height="svg.branchSize"
                    :width="branch.x2 - branch.x1"
                    :fill="
                        cfgBranches.useGradient
                            ? `url(#branch_gradient_${uid}_${branch.rootIndex})`
                            : branch.color
                    "
                    :rx="cfgBranches.borderRadius"
                    :stroke="cfgBranches.stroke"
                    :stroke-width="cfgBranches.strokeWidth"
                    :style="`cursor:${isCursorPointer ? 'pointer' : 'default'}; opacity:${isFocused(branch) ? 1 : 0.05}`"
                    @click="pickBranch(branch)"
                />
                <g v-if="cfgBranches.labels.dataLabels.show">
                    <g v-for="branch in branches">
                        <!-- BRANCH TOTAL -->
                        <text
                            v-if="
                                branch.proportionToRoot * 100 >
                                cfgBranches.labels.dataLabels.hideUnderValue
                            "
                            :x="branch.x1 + 6"
                            :y="branch.y1 + svg.branchSize / 1.5"
                            text-anchor="start"
                            :fill="adaptColorToBackground(branch.color)"
                            :font-size="cfgBranches.labels.dataLabels.fontSize"
                            font-weight="bold"
                            :style="`cursor:${isCursorPointer ? 'pointer' : 'default'}; opacity:${isFocused(branch) ? 1 : 0.05}`"
                            @click="pickBranch(branch)"
                        >
                            {{
                                applyDataLabel(
                                    cfgBranches.labels.dataLabels.formatter,
                                    branch.value,
                                    dataLabel({
                                        p: cfgLayout.branches.labels.dataLabels
                                            .prefix,
                                        v: branch.value,
                                        s: cfgLayout.branches.labels.dataLabels
                                            .suffix,
                                        r: cfgLayout.branches.labels.dataLabels
                                            .roundingValue,
                                    }),
                                    { datapoint: branch },
                                )
                            }}
                        </text>
                    </g>
                </g>

                <!-- NUTS -->

                <g v-for="(branch, b) in branches">
                    <path
                        v-for="(arc, i) in miniDonuts.get(branch.id)"
                        :data-cy="`chestnut-nut-${b}`"
                        :d="arc.path"
                        :stroke="arc.color"
                        :stroke-width="10"
                        fill="none"
                        :style="`opacity:${isFocused(branch) ? 1 : 0.1}`"
                    />

                    <!-- tooltip trap -->
                    <circle
                        :data-cy="`chestnut-trap-${b}`"
                        :aria-label="`Open details for branch ${branch.name} in root ${branch.rootName}`"
                        :fill="
                            cfgNuts.useGradient
                                ? `url(#nut_${uid})`
                                : 'transparent'
                        "
                        :cx="branch.x2 + 24 + cfgNuts.offsetX"
                        :cy="branch.y1 + svg.branchSize / 2"
                        :r="svg.branchSize / 2 + 2"
                        @click="pickNut(branch)"
                        :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};opacity:${isFocused(branch) ? 1 : 0.1}`"
                    />
                </g>

                <g v-if="cfgBranches.labels.show && !selectedBranch">
                    <text
                        v-for="branch in branches"
                        :x="branch.x2 + svg.branchSize + 24 + cfgNuts.offsetX"
                        :y="branch.y1 + svg.branchSize / 2 + 5"
                        :font-size="cfgBranches.labels.fontSize"
                        :font-weight="
                            cfgBranches.labels.bold ? 'bold' : 'normal'
                        "
                        :fill="cfgBranches.labels.color"
                        text-anchor="start"
                        :style="`opacity:${isFocused(branch) ? 1 : 0.1}`"
                    >
                        {{ branch.name }}
                    </text>
                </g>

                <!-- VERTICAL SEPARATOR -->
                <line
                    :x1="256 + svg.padding.left"
                    :x2="256 + svg.padding.left"
                    :y1="drawableArea.top"
                    :y2="drawableArea.bottom"
                    :stroke="cfgLayout.verticalSeparator.stroke"
                    :stroke-width="cfgLayout.verticalSeparator.strokeWidth"
                />

                <!-- ROOT LEGEND -->
                <foreignObject
                    v-if="!selectedNut && !selectedBranch"
                    :x="0"
                    :y="drawableArea.bottom"
                    :height="svg.height - drawableArea.bottom"
                    :width="svg.width"
                    style="overflow: visible"
                    data-no-svg-export
                    @click="resetChart"
                >
                    <div
                        style="
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            flex-direction: column;
                        "
                    >
                        <div
                            style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                gap: 12px;
                                flex-wrap: wrap;
                                flex-direction: row;
                            "
                        >
                            <div
                                v-for="root in roots"
                                :style="`display:flex;align-items:center;gap:3px;flex-direction:row;font-size:${cfgLayout.legend.fontSize}px;`"
                            >
                                <svg viewBox="0 0 20 20" height="16" width="16">
                                    <circle
                                        cx="10"
                                        cy="10"
                                        r="10"
                                        :fill="root.color"
                                        stroke="none"
                                    />
                                </svg>
                                <template v-if="!loading">
                                    <span>{{ root.name }}:</span>
                                    <b>
                                        {{
                                            applyDataLabel(
                                                cfgLayout.roots.labels
                                                    .formatter,
                                                root.total,
                                                dataLabel({
                                                    p: cfgChart.layout.legend
                                                        .prefix,
                                                    v: root.total,
                                                    s: cfgChart.layout.legend
                                                        .suffix,
                                                    r: cfgChart.layout.legend
                                                        .roundingValue,
                                                }),
                                                { datapoint: root },
                                            )
                                        }}
                                    </b>
                                    ({{
                                        dataLabel({
                                            v:
                                                ratio(root.total, treeTotal) *
                                                100,
                                            s: '%',
                                            r: cfgLayout.legend
                                                .roundingPercentage,
                                        })
                                    }})
                                </template>
                            </div>
                        </div>
                    </div>
                </foreignObject>

                <!-- NUT PICK -->
                <g v-if="selectedNut && openNut">
                    <!-- NUT PICK LEGEND -->
                    <foreignObject
                        data-cy="chestnut-legend"
                        :x="0"
                        :y="placeLegendTopOrBottom()"
                        :height="svg.height - drawableArea.bottom"
                        :width="svg.width"
                        style="overflow: visible"
                        @click="resetChart"
                    >
                        <div
                            style="
                                width: 100%;
                                height: 100%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                flex-direction: column;
                            "
                        >
                            <b>{{ selectedNut.name }}</b>
                            <div
                                style="
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    gap: 12px;
                                    flex-wrap: wrap;
                                    flex-direction: row;
                                "
                            >
                                <div
                                    v-for="(nut, i) in selectedNut.breakdown"
                                    :style="`display:flex;align-items:center;gap:6px;flex-direction:row;font-size:${cfgLayout.legend.fontSize}px;`"
                                >
                                    <svg
                                        viewBox="0 0 20 20"
                                        height="16"
                                        width="16"
                                    >
                                        <circle
                                            cx="10"
                                            cy="10"
                                            r="10"
                                            :fill="nut.color"
                                            stroke="none"
                                        />
                                    </svg>
                                    <span
                                        >{{ nut.name }}:
                                        <b
                                            >{{ cfgLayout.legend.prefix }}
                                            {{
                                                nut.value.toFixed(
                                                    cfgChart.layout.nuts
                                                        .selected.roundingValue,
                                                )
                                            }}
                                            {{ cfgLayout.legend.suffix }}</b
                                        >
                                        ({{
                                            (
                                                nut.proportionToBranch * 100
                                            ).toFixed(
                                                cfgLayout.nuts.selected
                                                    .roundingPercentage,
                                            )
                                        }}%)</span
                                    >
                                </div>
                            </div>
                        </div>
                    </foreignObject>
                    <circle
                        :cx="selectedNut.x2 + 24 + cfgNuts.offsetX"
                        :cy="selectedNut.y1 + svg.branchSize / 2"
                        :r="256"
                        :fill="`url(#nut_underlayer_${uid})`"
                        @click="leaveNut"
                        :class="
                            cfgNuts.selected.useMotion
                                ? 'vue-ui-chestnut-animated'
                                : ''
                        "
                    />
                    <!-- LABEL CONNECTOR -->
                    <g v-for="arc in openNut">
                        <path
                            v-if="isArcBigEnough(arc)"
                            :d="
                                calcNutArrowPath(
                                    arc,
                                    {
                                        x:
                                            selectedNut.x2 +
                                            24 +
                                            cfgNuts.offsetX,
                                        y: selectedNut.y1 + svg.branchSize / 2,
                                    },
                                    16,
                                    16,
                                    false,
                                    false,
                                    64,
                                )
                            "
                            :stroke="arc.color"
                            stroke-width="1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                            :class="
                                cfgNuts.selected.useMotion
                                    ? 'vue-ui-chestnut-animated'
                                    : ''
                            "
                        />
                    </g>
                    <circle
                        :cx="selectedNut.x2 + 24 + cfgNuts.offsetX"
                        :cy="selectedNut.y1 + svg.branchSize / 2"
                        :r="118"
                        :fill="cfgChart.backgroundColor"
                        @click="leaveNut"
                        :class="
                            cfgNuts.selected.useMotion
                                ? 'vue-ui-chestnut-animated'
                                : ''
                        "
                    />
                    <path
                        v-for="arc in openNut"
                        :d="arc.path"
                        :stroke="arc.color"
                        :stroke-width="64"
                        fill="none"
                        @click="leaveNut"
                        :class="
                            cfgNuts.selected.useMotion
                                ? 'vue-ui-chestnut-animated'
                                : ''
                        "
                    />
                    <!-- NUT PICK CORE -->
                    <circle
                        :cx="selectedNut.x2 + 24 + cfgNuts.offsetX"
                        :cy="selectedNut.y1 + svg.branchSize / 2"
                        :r="110"
                        :fill="`url(#nutpick_${uid})`"
                        @click="leaveNut"
                        :class="
                            cfgNuts.selected.useMotion
                                ? 'vue-ui-chestnut-animated'
                                : ''
                        "
                    />
                    <circle
                        :cx="selectedNut.x2 + 24 + cfgNuts.offsetX"
                        :cy="selectedNut.y1 + svg.branchSize / 2"
                        :r="64"
                        :fill="cfgChart.backgroundColor"
                        @click="leaveNut"
                        :class="
                            cfgNuts.selected.useMotion
                                ? 'vue-ui-chestnut-animated'
                                : ''
                        "
                    />

                    <text
                        :x="selectedNut.x2 + 24 + cfgNuts.offsetX"
                        :y="selectedNut.y1 + 8"
                        :fill="cfgNuts.selected.labels.core.total.color"
                        :font-size="cfgNuts.selected.labels.core.total.fontSize"
                        :font-weight="
                            cfgNuts.selected.labels.core.total.bold
                                ? 'bold'
                                : 'normal'
                        "
                        text-anchor="middle"
                        @click="leaveNut"
                        :class="
                            cfgNuts.selected.useMotion
                                ? 'vue-ui-chestnut-animated'
                                : ''
                        "
                    >
                        {{ FINAL_CONFIG.translations.total }}
                    </text>
                    <text
                        :x="selectedNut.x2 + 24 + cfgNuts.offsetX"
                        :y="selectedNut.y1 + 36"
                        :fill="cfgNuts.selected.labels.core.value.color"
                        :font-size="cfgNuts.selected.labels.core.value.fontSize"
                        :font-weight="
                            cfgNuts.selected.labels.core.value.bold
                                ? 'bold'
                                : 'normal'
                        "
                        text-anchor="middle"
                        @click="leaveNut"
                        :class="
                            cfgNuts.selected.useMotion
                                ? 'vue-ui-chestnut-animated'
                                : ''
                        "
                    >
                        {{
                            applyDataLabel(
                                cfgNuts.selected.labels.dataLabels.formatter,
                                selectedNut.value,
                                dataLabel({
                                    p: cfgNuts.selected.labels.core.value
                                        .prefix,
                                    v: selectedNut.value,
                                    s: cfgNuts.selected.labels.core.value
                                        .suffix,
                                    r: cfgNuts.selected.roundingValue,
                                }),
                                { datapoint: selectedNut },
                            )
                        }}
                    </text>

                    <!-- NUT PICK DATALABELS -->
                    <g v-for="(arc, i) in openNut">
                        <text
                            v-if="isArcBigEnough(arc)"
                            :x="nutLabelGeometry.get(arc).normal.x"
                            :text-anchor="
                                nutLabelGeometry.get(arc).normal.anchor
                            "
                            :y="
                                nutLabelGeometry.get(arc).y -
                                cfgNuts.selected.labels.dataLabels.fontSize / 6
                            "
                            :fill="arc.color"
                            :font-size="
                                cfgNuts.selected.labels.dataLabels.fontSize / 2
                            "
                            :style="`font-weight:${cfgNuts.selected.labels.dataLabels.bold ? 'bold' : ''}`"
                            :class="
                                cfgNuts.selected.useMotion
                                    ? 'vue-ui-chestnut-animated'
                                    : ''
                            "
                        >
                            ⬤
                        </text>
                        <text
                            v-if="isArcBigEnough(arc)"
                            :x="nutLabelGeometry.get(arc).selected.x"
                            :text-anchor="
                                nutLabelGeometry.get(arc).selected.anchor
                            "
                            :y="nutLabelGeometry.get(arc).y"
                            :fill="cfgNuts.selected.labels.dataLabels.color"
                            :font-size="
                                cfgNuts.selected.labels.dataLabels.fontSize
                            "
                            :style="`font-weight:${cfgNuts.selected.labels.dataLabels.bold ? 'bold' : ''}`"
                            :class="
                                cfgNuts.selected.useMotion
                                    ? 'vue-ui-chestnut-animated'
                                    : ''
                            "
                        >
                            {{ selectedNut.breakdown[i].name }}
                        </text>
                    </g>
                    <g v-for="(arc, i) in openNut">
                        <text
                            v-if="isArcBigEnough(arc)"
                            :x="nutLabelGeometry.get(arc).selected.x"
                            :text-anchor="
                                nutLabelGeometry.get(arc).normal.anchor
                            "
                            :y="
                                nutLabelGeometry.get(arc).y +
                                cfgNuts.selected.labels.dataLabels.fontSize
                            "
                            :fill="cfgNuts.selected.labels.dataLabels.color"
                            :font-size="
                                cfgNuts.selected.labels.dataLabels.fontSize
                            "
                            :style="`font-weight:${cfgNuts.selected.labels.dataLabels.bold ? 'bold' : ''}`"
                            :class="
                                cfgNuts.selected.useMotion
                                    ? 'vue-ui-chestnut-animated'
                                    : ''
                            "
                        >
                            {{
                                dataLabel({
                                    v:
                                        ratio(
                                            selectedNut.breakdown[i].value,
                                            selectedNut.value,
                                        ) * 100,
                                    s: '%',
                                    r: cfgNuts.selected.roundingPercentage,
                                })
                            }}

                            {{ FINAL_CONFIG.translations.of }}
                            {{ selectedNut.breakdown[i].branchName }}

                            {{
                                applyDataLabel(
                                    cfgNuts.selected.labels.dataLabels
                                        .formatter,
                                    selectedNut.breakdown[i].value,
                                    dataLabel({
                                        p: cfgNuts.selected.labels.dataLabels
                                            .prefix,
                                        v: selectedNut.breakdown[i].value,
                                        s: cfgNuts.selected.labels.dataLabels
                                            .suffix,
                                        r: cfgNuts.selected.roundingValue,
                                    }),
                                    { datapoint: openNut, seriesIndex: i },
                                )
                            }}
                        </text>
                        <text
                            v-if="isArcBigEnough(arc)"
                            :x="nutLabelGeometry.get(arc).selected.x"
                            :text-anchor="
                                nutLabelGeometry.get(arc).normal.anchor
                            "
                            :y="
                                nutLabelGeometry.get(arc).y +
                                cfgNuts.selected.labels.dataLabels.fontSize * 2
                            "
                            :fill="cfgNuts.selected.labels.dataLabels.color"
                            :font-size="
                                cfgNuts.selected.labels.dataLabels.fontSize
                            "
                            :style="`font-weight:${cfgNuts.selected.labels.dataLabels.bold ? 'bold' : ''}`"
                            :class="
                                cfgNuts.selected.useMotion
                                    ? 'vue-ui-chestnut-animated'
                                    : ''
                            "
                        >
                            {{
                                dataLabel({
                                    v:
                                        selectedNut.breakdown[i]
                                            .proportionToRoot * 100,
                                    s: '%',
                                    r: cfgNuts.selected.roundingPercentage,
                                })
                            }}
                            {{ FINAL_CONFIG.translations.of }}
                            {{ selectedNut.breakdown[i].rootName }}
                        </text>
                        <text
                            v-if="isArcBigEnough(arc)"
                            :x="nutLabelGeometry.get(arc).selected.x"
                            :text-anchor="
                                nutLabelGeometry.get(arc).normal.anchor
                            "
                            :y="
                                nutLabelGeometry.get(arc).y +
                                cfgNuts.selected.labels.dataLabels.fontSize * 3
                            "
                            :fill="cfgNuts.selected.labels.dataLabels.color"
                            :font-size="
                                cfgNuts.selected.labels.dataLabels.fontSize
                            "
                            :style="`font-weight:${cfgNuts.selected.labels.dataLabels.bold ? 'bold' : ''}`"
                            :class="
                                cfgNuts.selected.useMotion
                                    ? 'vue-ui-chestnut-animated'
                                    : ''
                            "
                        >
                            {{
                                dataLabel({
                                    v:
                                        selectedNut.breakdown[i]
                                            .proportionToTree * 100,
                                    s: '%',
                                    r: cfgNuts.selected.roundingPercentage,
                                })
                            }}
                            {{ FINAL_CONFIG.translations.proportionToTree }}
                        </text>
                    </g>
                </g>

                <!-- BRANCH DATALABELS -->
                <g v-for="branch in branches">
                    <text
                        v-if="
                            selectedBranch &&
                            selectedBranch.id === branch.id &&
                            !selectedNut
                        "
                        :x="branch.x1 + 6"
                        :y="branch.y1 + svg.branchSize + 24"
                        font-weight="bold"
                        text-anchor="start"
                        :font-size="cfgBranches.labels.dataLabels.fontSize"
                        :fill="cfgBranches.labels.color"
                        @click="resetChart"
                    >
                        {{ branch.name }}:
                        {{
                            applyDataLabel(
                                cfgBranches.labels.dataLabels.formatter,
                                branch.value,
                                dataLabel({
                                    p: cfgBranches.labels.dataLabels.prefix,
                                    v: branch.value,
                                    s: cfgBranches.labels.dataLabels.suffix,
                                    r: cfgBranches.labels.dataLabels
                                        .roundingValue,
                                }),
                                { datapoint: branch },
                            )
                        }}
                    </text>
                    <text
                        v-if="
                            selectedBranch &&
                            selectedBranch.id === branch.id &&
                            !selectedNut
                        "
                        :x="branch.x1 + 6"
                        :y="branch.y1 + svg.branchSize + 48"
                        text-anchor="start"
                        :font-size="cfgBranches.labels.dataLabels.fontSize"
                        :fill="cfgBranches.labels.color"
                        @click="resetChart"
                    >
                        {{
                            dataLabel({
                                v: branch.proportionToRoot * 100,
                                s: '%',
                                r: cfgBranches.labels.dataLabels
                                    .roundingPercentage,
                            })
                        }}
                        {{ FINAL_CONFIG.translations.of }}
                        {{ branch.rootName }}
                    </text>
                    <text
                        v-if="
                            selectedBranch &&
                            selectedBranch.id === branch.id &&
                            !selectedNut
                        "
                        :x="branch.x1 + 6"
                        :y="branch.y1 + svg.branchSize + 72"
                        text-anchor="start"
                        :font-size="cfgBranches.labels.dataLabels.fontSize"
                        :fill="cfgBranches.labels.color"
                        @click="resetChart"
                    >
                        {{
                            dataLabel({
                                v: ratio(branch.value, treeTotal) * 100,
                                s: '%',
                                r: cfgBranches.labels.dataLabels
                                    .roundingPercentage,
                            })
                        }}
                        {{ FINAL_CONFIG.translations.proportionToTree }}
                    </text>
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
                        isCallbackImaging ||
                        isCallbackSvg,
                }"
            />
        </div>

        <slot name="legend" v-bind:legend="mutableDataset"></slot>

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
                <button
                    tabindex="0"
                    class="vue-ui-user-options-button"
                    @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)"
                >
                    <BaseIcon
                        name="fileCsv"
                        :stroke="tableComponent.props.color"
                    />
                </button>
            </template>
            <template #content>
                <div
                    ref="tableContainer"
                    class="vue-ui-chestnut-table"
                    :style="`${FINAL_CONFIG.table.useDialog ? '' : 'max-height: 300px;margin-top:24px'}`"
                >
                    <div
                        :style="`${FINAL_CONFIG.table.useDialog ? '' : 'padding-top:36px;'}position: relative`"
                    >
                        <div
                            v-if="!FINAL_CONFIG.table.useDialog"
                            role="button"
                            tabindex="0"
                            :style="`width:32px; position: absolute; top: 0; left:4px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px; width: 32px; cursor:${isCursorPointer ? 'pointer' : 'default'}; background:${FINAL_CONFIG.table.th.backgroundColor};`"
                            @click="closeTable"
                            @keypress.enter="closeTable"
                        >
                            <BaseIcon
                                name="close"
                                :stroke="FINAL_CONFIG.table.th.color"
                                :stroke-width="2"
                            />
                        </div>
                        <div
                            style="width: 100%"
                            :class="{ 'vue-ui-responsive': isResponsive }"
                        >
                            <table
                                data-cy="chestnut-table"
                                class="vue-ui-data-table"
                            >
                                <caption
                                    v-if="!FINAL_CONFIG.table.useDialog"
                                    :style="{
                                        backgroundColor:
                                            FINAL_CONFIG.table.th
                                                .backgroundColor,
                                        color: FINAL_CONFIG.table.th.color,
                                        outline: FINAL_CONFIG.table.th.outline,
                                    }"
                                    class="vue-ui-data-table__caption"
                                >
                                    {{
                                        cfgLayout.title.text
                                    }}
                                    <span
                                        v-if="cfgLayout.title.subtitle.text"
                                        >{{
                                            cfgLayout.title.subtitle.text
                                        }}</span
                                    >
                                </caption>
                                <thead>
                                    <tr
                                        role="row"
                                        :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color}`"
                                    >
                                        <th
                                            :style="`outline:${FINAL_CONFIG.table.th.outline}`"
                                            v-for="th in table.head"
                                        >
                                            {{ th }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-for="(tr, i) in table.body"
                                        :class="{
                                            'vue-ui-data-table__tbody__row': true,
                                            'vue-ui-data-table__tbody__row-even':
                                                i % 2 === 0,
                                            'vue-ui-data-table__tbody__row-odd':
                                                i % 2 !== 0,
                                        }"
                                        :style="`background:${FINAL_CONFIG.table.td.backgroundColor};color:${FINAL_CONFIG.table.td.color}`"
                                    >
                                        <td
                                            v-for="(
                                                column, columnIndex
                                            ) in tableColumns"
                                            :key="column.key"
                                            class="vue-ui-data-table__tbody__td"
                                            :style="`outline:${FINAL_CONFIG.table.td.outline}`"
                                            :data-cell="table.head[columnIndex]"
                                        >
                                            <div
                                                class="vue-ui-chestnut-table-cell"
                                            >
                                                <span v-if="column.group">{{
                                                    tableDisplayRows[i][
                                                        columnIndex
                                                    ]
                                                }}</span>
                                                <template v-else>{{
                                                    tableDisplayRows[i][
                                                        columnIndex
                                                    ]
                                                }}</template>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
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

.vue-ui-chestnut * {
    transition: unset;
}
.vue-ui-chestnut {
    user-select: none;
    position: relative;
}

.vue-ui-chestnut-animated {
    opacity: 0;
    animation: chestnut-opacity 0.2s ease-in-out forwards;
}

@keyframes chestnut-opacity {
    from {
        transform: scale(0.98, 1);
        opacity: 0;
    }
    to {
        transform: scale(1, 1);
        opacity: 1;
    }
}

.vue-ui-chestnut-table-cell {
    display: flex;
    align-items: center;
    gap: 5px;
    justify-content: flex-end;
    width: 100%;
    padding-right: 3px;
}

.vue-ui-chestnut-table {
    width: 100%;
    overflow: auto;
    position: relative;
}
.vue-ui-data-table thead {
    position: sticky;
    top: 0;
    font-weight: 400;
    user-select: none;
}

table {
    width: 100%;
    padding: 1rem;
    border-collapse: collapse;
    overflow-x: auto;
}

caption,
th,
td {
    padding: 0.5rem;
    font-variant-numeric: tabular-nums;
}

caption {
    font-size: 1.3rem;
    font-weight: 700;
}

.vue-ui-responsive {
    th {
        display: none;
    }
    td {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem 1rem;
        outline: none !important;
        text-align: left;
    }
    tr {
        outline: v-bind(tableOutline);
    }

    td:first-child {
        padding-top: 1rem;
    }

    td:last-child {
        padding-bottom: 1rem;
    }

    td::before {
        content: attr(data-cell) ': ';
        font-weight: 700;
        text-transform: capitalize;
    }
}

path,
circle,
rect,
text,
line {
    transition: opacity 0.3s ease-in-out !important;
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

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
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    shallowRef,
    nextTick,
    watch,
    defineAsyncComponent,
    toRefs,
} from 'vue';
import {
    stringifyChartConfig as stringifyStructuralConfig,
    abbreviate,
    adaptColorToBackground,
    applyDataLabel,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    dataLabel,
    downloadCsv,
    isFunction,
    palette,
    treeShake,
    XMLNS,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter';
import { useLoading } from '../useLoading';
import { useChartExport } from '../useChartExport';
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import { useResponsive } from '../useResponsive';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_flow.json';
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';

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

const { vue_ui_flow: DEFAULT_CONFIG } = useConfig();

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

const uid = ref(createUid());
const flowChart = ref(null);
const step = ref(0);
const titleStep = ref(0);
const isTooltip = ref(false);
const tooltipContent = ref('');
const chartLegend = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const responsiveObserver = shallowRef(null);
let resizeFrame = null;
let scheduleResize = null;
let disposed = false;
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const activeTooltipIndex = computed(() =>
    selectedNodeId.value == null
        ? null
        : (a11yNodeIndexMap.value.get(selectedNodeId.value) ?? null),
);
const activeTooltipNodeId = computed(() => selectedNodeId.value);
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = ref(prepareConfig());
const cfgLabels = computed(() => FINAL_CONFIG.value.style.chart.nodes.labels);
const cfgNodes = computed(() => FINAL_CONFIG.value.style.chart.nodes);
const cfgLinks = computed(() => FINAL_CONFIG.value.style.chart.links);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiFlow',
    rules: [COMMON_RULES.emptyArray, COMMON_RULES.noHint],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            nodeCategories: {
                B: 'A',
                C: 'B',
            },
            nodeCategoryColors: {
                A: '#CACACA',
                B: '#AAAAAA',
            },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    legend: {
                        backgroundColor: 'transparent',
                    },
                    nodes: {
                        labels: {
                            show: false,
                        },
                        stroke: '#666666',
                    },
                    links: {
                        stroke: '#666666',
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
        ['A', 'B', 2, '#CACACA'],
        ['B', 'C', 1, '#CACACA'],
        ['C', 'D', 0.5, '#CACACA'],
        ['E', 'F', 1, '#AAAAAA'],
        ['F', 'G', 0.5, '#AAAAAA'],
        ['G', 'H', 0.25, '#AAAAAA'],
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

function stopResize() {
    scheduleResize = null;
    responsiveObserver.value?.disconnect();
    responsiveObserver.value = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
}
function prepareChart() {
    stopResize();
    if (!FINAL_CONFIG.value.responsive) {
        WIDTH.value = cfgChart.value.width;
        HEIGHT.value = cfgChart.value.height;
        return;
    }
    const parent = flowChart.value?.parentNode;
    if (!parent) return;
    const resize = () => {
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            if (disposed) return;
            const { width, height } = useResponsive({
                chart: flowChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                source: source.value,
            });
            WIDTH.value = width;
            HEIGHT.value = height;
        });
    };
    scheduleResize = resize;
    responsiveObserver.value = new ResizeObserver(resize);
    responsiveObserver.value.observe(parent);
    resize();
}
onBeforeUnmount(() => {
    disposed = true;
    stopResize();
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });

const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
});

function prepareConfig() {
    return {
        ...resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes),
        nodeCategories: props.config.nodeCategories || {},
        nodeCategoryColors: props.config.nodeCategoryColors || {},
    };
}

const WIDTH = ref(cfgChart.value.width);
const HEIGHT = ref(cfgChart.value.height);

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

        if (!loading.value) {
            FINAL_CONFIG.value = preparedConfig;
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        titleStep.value += 1;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    },
    { deep: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `flow_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-flow',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

function formatValue(value, context) {
    return applyDataLabel(
        cfgLabels.value.formatter,
        value,
        dataLabel({
            p: cfgLabels.value.prefix,
            v: value,
            s: cfgLabels.value.suffix,
            r: cfgLabels.value.rounding,
        }),
        context,
    );
}

const nodeWidth = computed(() => {
    return cfgNodes.value.width;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgChart.value.tooltip.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTable: FINAL_CONFIG.value.table.show,
            showTooltip: cfgChart.value.tooltip.show,
        };
    },
    { immediate: true },
);

function getNodeCategory(name) {
    const categories = FINAL_CONFIG.value.nodeCategories;
    return Object.hasOwn(categories, name) ? categories[name] : undefined;
}
function getCategoryColor(category) {
    const colors = FINAL_CONFIG.value.nodeCategoryColors;
    return Object.hasOwn(colors, category) ? colors[category] : undefined;
}

const sanitizedDataset = computed(() =>
    (FINAL_DATASET.value || []).map(([source, target, value, color]) => [
        source,
        target,
        typeof value === 'number' && Number.isFinite(value)
            ? Math.max(0, value)
            : 0,
        color ? convertColorToHex(color) : null,
    ]),
);
function encodeStableId(value) {
    return Array.from(String(value), (character) =>
        character.codePointAt(0).toString(16),
    ).join('_');
}
const graph = computed(() => {
    const nodes = new Map();
    const colors = new Map();
    function addNode(name) {
        if (!nodes.has(name))
            nodes.set(name, {
                name,
                level: 0,
                inflow: 0,
                outflow: 0,
                children: [],
                parents: [],
                color: null,
            });
        return nodes.get(name);
    }
    const occurrences = new Map();
    sanitizedDataset.value.forEach(([source, target, value, color]) => {
        const src = addNode(source),
            tgt = addNode(target);
        const key = JSON.stringify([source, target]);
        const occurrence = occurrences.get(key) || 0;
        occurrences.set(key, occurrence + 1);
        src.children.push({
            target,
            value,
            id: `flow_link_${uid.value}_${encodeStableId(key)}_${occurrence}`,
        });
        tgt.parents.push({ source, value });
        src.outflow += value;
        tgt.inflow += value;
        if (color) {
            colors.set(source, color);
            colors.set(target, color);
        }
    });
    const roots = [...nodes.values()].filter((node) => !node.parents.length);
    const indegree = new Map(
        [...nodes].map(([name, node]) => [name, node.parents.length]),
    );
    const queue = roots.map((node) => node.name);
    for (let cursor = 0; cursor < queue.length; cursor++) {
        const node = nodes.get(queue[cursor]);
        for (const { target } of node.children) {
            const child = nodes.get(target);
            child.level = Math.max(child.level, node.level + 1);
            indegree.set(target, indegree.get(target) - 1);
            if (!indegree.get(target)) queue.push(target);
        }
    }
    // Nodes blocked by a cycle share a column; backward links use straight paths.
    for (const [name, count] of indegree)
        if (count > 0) nodes.get(name).level = 0;
    const rootColors = new Map(
        roots.map((node, i) => [
            node.name,
            customPalette.value[i] || palette[i % palette.length],
        ]),
    );
    const levels = Object.create(null);
    let index = 0;
    for (const [name, node] of nodes) {
        const category = getNodeCategory(name);
        node.color =
            colors.get(name) ||
            (category ? getCategoryColor(category) : null) ||
            rootColors.get(name) ||
            palette[index % palette.length];
        index++;
        node.value = Math.max(node.inflow, node.outflow);
        (levels[node.level] ||= []).push(name);
    }
    return {
        nodes,
        levels,
        totalRootFlow: roots.reduce((sum, node) => sum + node.outflow, 0),
    };
});
function computeSankeyCoordinates() {
    const { nodes, levels } = graph.value;
    const p = padding.value;
    const innerW = innerSize.value.width;
    const innerH = innerSize.value.height;

    const levelKeys = Object.keys(levels)
        .map(Number)
        .sort((a, b) => a - b);
    const levelCount = levelKeys.length || 1;

    const colSpacing = levelCount > 1 ? innerW / (levelCount - 1) : 0;
    const nodeW = Number(nodeWidth.value);
    const gapPx = Number(cfgNodes.value.gapPx ?? cfgNodes.value.gap ?? 8);
    const minHeightCfg = Number(cfgNodes.value.minHeight || 0);

    function levelAllowedScale(levelIndex) {
        const names = levels[levelIndex];
        const n = names.length;
        if (!n) return Infinity;

        const gaps = Math.max(0, (n - 1) * gapPx);
        const H = Math.max(0, innerH - gaps);
        const effectiveMin = Math.min(minHeightCfg, n ? H / n : 0);

        let reserved = 0;
        let remain = names.map((nm) => nodes.get(nm).value || 0);
        let remSum = remain.reduce((a, v) => a + v, 0);

        for (let iter = 0; iter < 12; iter += 1) {
            const s = remSum > 0 ? (H - reserved) / remSum : 0;
            const toClamp = [];
            for (let i = 0; i < remain.length; i += 1) {
                const v = remain[i];
                if (v < 0) continue;
                if (v * s < effectiveMin) toClamp.push(i);
            }
            if (!toClamp.length) return Math.max(0, s);

            for (const i of toClamp) {
                reserved += effectiveMin;
                remSum -= remain[i];
                remain[i] = -1;
            }
            if (remSum <= 0) return 0;
        }
        return remSum > 0 ? Math.max(0, (H - reserved) / remSum) : 0;
    }

    const perLevelScales = levelKeys.map(levelAllowedScale);
    const globalScale = perLevelScales.length ? Math.min(...perLevelScales) : 0;

    const nodeCoordinates = Object.create(null);
    levelKeys.forEach((levelIndex) => {
        const names = levels[levelIndex];
        const n = names.length;
        const gaps = Math.max(0, (n - 1) * gapPx);
        const H = Math.max(0, innerH - gaps);
        const effectiveMin = Math.min(minHeightCfg, n ? H / n : 0);

        const heights = names.map((nm) =>
            Math.max(effectiveMin, (nodes.get(nm).value || 0) * globalScale),
        );

        const used = heights.reduce((a, h) => a + h, 0) + gaps;
        let yCursor = Math.max(0, (innerH - used) / 2);

        names.forEach((name, i) => {
            const h = heights[i];
            const x = p.left + levelIndex * colSpacing;
            const y = yCursor;

            nodeCoordinates[name] = {
                x,
                y,
                absoluteY: y,
                height: h,
                i,
                color: nodes.get(name).color,
                value: nodes.get(name).value,
                id: `flow_node_${uid.value}_${encodeStableId(name)}`,
            };

            yCursor += h;
            if (i < n - 1) yCursor += gapPx;
        });
    });

    const links = [];
    const yOffset = p.top;

    const tgtOffsets = Object.create(null);
    const tgtAccum = Object.create(null);
    [...nodes.keys()].forEach((n) => {
        tgtOffsets[n] = nodeCoordinates[n]?.y ?? 0;
        tgtAccum[n] = 0;
    });

    const EPS = 1e-6;
    const PIX_EPS = 0.25;

    const smoothLinks = !!cfgLinks.value.smooth;
    const curvature = 0.5;

    levelKeys.forEach((levelIndex) => {
        const names = levels[levelIndex];
        names.forEach((name) => {
            const srcNode = nodes.get(name);
            const srcCoord = nodeCoordinates[name];
            if (!srcNode.children || !srcNode.children.length) return;

            let srcInnerY = srcCoord.y;

            srcNode.children.forEach(({ target, value, id }) => {
                const tgtCoord = nodeCoordinates[target];
                const targetNode = nodes.get(target);

                const srcFrac =
                    srcNode.outflow > 0 ? value / srcNode.outflow : 0;
                const tgtFrac =
                    targetNode.inflow > 0 ? value / targetNode.inflow : 0;

                const sY1 = checkNaN(srcInnerY + yOffset);
                const sY2 = checkNaN(
                    srcInnerY + srcFrac * srcCoord.height + yOffset,
                );

                const tStart = tgtOffsets[target];
                let tEnd = tStart + tgtFrac * tgtCoord.height;

                tgtAccum[target] += value;
                const isLast =
                    targetNode.inflow > 0 &&
                    tgtAccum[target] >= targetNode.inflow - EPS;

                const nodeBottom = tgtCoord.y + tgtCoord.height;
                if (isLast || tEnd > nodeBottom - PIX_EPS) tEnd = nodeBottom;

                const tY1 = checkNaN(tStart + yOffset);
                const tY2 = checkNaN(tEnd + yOffset);

                const xStart = checkNaN(srcCoord.x + nodeW);
                const xEnd = checkNaN(tgtCoord.x);

                let pathStr;

                if (!smoothLinks || xEnd <= xStart) {
                    pathStr =
                        `M ${xStart} ${sY1}` +
                        ` L ${xStart} ${sY2}` +
                        ` L ${xEnd} ${tY2}` +
                        ` L ${xEnd} ${tY1} Z`;
                } else {
                    const dx = xEnd - xStart;
                    const c1x = checkNaN(xStart + dx * curvature);
                    const c2x = checkNaN(xEnd - dx * curvature);

                    const topYStart = sY1;
                    const topYEnd = tY1;
                    const bottomYStart = sY2;
                    const bottomYEnd = tY2;

                    pathStr =
                        `M ${xStart} ${topYStart}` +
                        ` C ${c1x} ${topYStart}, ${c2x} ${topYEnd}, ${xEnd} ${topYEnd}` +
                        ` L ${xEnd} ${bottomYEnd}` +
                        ` C ${c2x} ${bottomYEnd}, ${c1x} ${bottomYStart}, ${xStart} ${bottomYStart}` +
                        ` Z`;
                }

                links.push({
                    id,
                    source: name,
                    target,
                    path: pathStr,
                    value,
                    sourceColor: srcNode.color,
                    targetColor: nodes.get(target).color,
                });

                srcInnerY = sY2 - yOffset;
                tgtOffsets[target] = tEnd;
            });
        });
    });

    return { nodeCoordinates, links };
}

const mutableDataset = computed(() => {
    const d = computeSankeyCoordinates();

    return {
        nodes: Object.keys(d.nodeCoordinates).map((key, i) => {
            return {
                ...d.nodeCoordinates[key],
                name: key,
            };
        }),
        links: d.links,
    };
});

const padding = computed(() => cfgChart.value.padding);

const innerSize = computed(() => {
    return {
        width: Math.max(
            0,
            WIDTH.value - 40 - padding.value.right - padding.value.left,
        ),
        height: Math.max(
            0,
            HEIGHT.value - padding.value.top - padding.value.bottom,
        ),
    };
});

const drawingArea = computed(() => ({
    width: WIDTH.value,
    height: HEIGHT.value,
}));

function findConnectedNodes(name) {
    const node = graph.value.nodes.get(name);
    return node
        ? [
              ...new Set([
                  ...node.children.map((item) => item.target),
                  ...node.parents.map((item) => item.source),
                  name,
              ]),
          ]
        : [];
}
const nodeSummaries = computed(() => {
    const colors = new Map(
        [...graph.value.nodes].map(([name, node]) => [name, node.color]),
    );
    return new Map(
        [...graph.value.nodes].map(([name, node]) => [
            name,
            {
                name,
                inflow: node.inflow,
                outflow: node.outflow,
                from: node.parents.map((item) => ({
                    ...item,
                    color: colors.get(item.source),
                })),
                to: node.children.map(({ target, value }) => ({
                    target,
                    value,
                    color: colors.get(target),
                })),
                percentOfTotal:
                    graph.value.totalRootFlow > 0
                        ? (node.value / graph.value.totalRootFlow) * 100
                        : 0,
                color: colors.get(name) || '#000000',
            },
        ]),
    );
});

const selectedCategory = ref(null);
const selectedNodes = computed(() => {
    if (selectedCategory.value != null)
        return mutableDataset.value.nodes
            .filter(
                (node) => getNodeCategory(node.name) === selectedCategory.value,
            )
            .map((node) => node.name);
    const node = mutableDataset.value.nodes.find(
        (node) => node.id === selectedNodeId.value,
    );
    return node ? findConnectedNodes(node.name) : null;
});
const dataTooltipSlot = ref(null);
const useCustomFormat = ref(false);
const selectedNodeId = ref(null);

function clearNodeSelection() {
    selectedNodeId.value = null;
    selectedCategory.value = null;
    isTooltip.value = false;

    tooltipTriggerMode.value = 'pointer';
}

function updateTooltipA11yPosition(nodeId) {
    if (!svgRef.value || !nodeId) return;
    const trap = svgRef.value.querySelector(`[data-a11y-node-id="${nodeId}"]`);
    if (!trap) return;
    const box = trap.getBoundingClientRect();
    tooltipA11yPosition.value = {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
    };
}

function selectNode(
    node,
    index,
    triggerMode = 'pointer',
    flatIndex = null,
    notify = true,
) {
    if (!node) return;
    selectedCategory.value = null;
    selectedNodeId.value = node.id;

    tooltipTriggerMode.value = triggerMode;

    const datapoint = nodeSummaries.value.get(node.name);
    if (!datapoint) return;

    if (notify && FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint,
            seriesIndex: index,
        });
    }

    dataTooltipSlot.value = {
        datapoint,
        config: FINAL_CONFIG.value,
        seriesIndex: index,
        series: mutableDataset.value,
    };
    isTooltip.value = true;

    let html = '';
    const customFormat = cfgChart.value.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                datapoint,
                series: mutableDataset.value,
                config: FINAL_CONFIG.value,
            });
            if (typeof customFormatString === 'string') {
                tooltipContent.value = customFormatString;
                useCustomFormat.value = true;
            }
        } catch (err) {
            console.warn('Custom format cannot be applied.');
        }
    }

    if (!useCustomFormat.value) {
        const percentageDisplay = cfgChart.value.tooltip.showPercentage
            ? `<div>${dataLabel({
                  p: cfgChart.value.tooltip.translations.percentOfTotal,
                  v: datapoint.percentOfTotal,
                  s: '%',
                  r: cfgChart.value.tooltip.roundingPercentage,
              })}</div>`
            : '';

        html += `<div data-cy="tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${cfgChart.value.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;"><span style="margin-right:4px; color:${datapoint.color}">⏹</span>${datapoint.name}${percentageDisplay}</div>`;

        if (datapoint.from.length) {
            html += `<div>${cfgChart.value.tooltip.translations.from}</div>`;
            datapoint.from.forEach((item) => {
                html += `<div><span style="color:${item.color}">⏹←</span> ${
                    item.source
                }: ${formatValue(item.value)}</div>`;
            });
        }

        if (datapoint.to.length) {
            html += `<div style="margin-top:6px;">${cfgChart.value.tooltip.translations.to}</div>`;
            datapoint.to.forEach((item) => {
                html += `<div><span style="color:${item.color}">⏹→</span> ${
                    item.target
                }: ${formatValue(item.value)}</div>`;
            });
        }

        tooltipContent.value = html;
    }

    if (triggerMode === 'keyboard') {
        nextTick(() => {
            updateTooltipA11yPosition(node.id);
        });
    }
}

function unselectNode(index) {
    const datapoint = dataTooltipSlot.value;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint,
            seriesIndex: index,
        });
    }
    if (tooltipTriggerMode.value === 'keyboard' && activeTooltipNodeId.value)
        return;
    clearNodeSelection();
}

function clickNode(index) {
    const datapoint = dataTooltipSlot.value;
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint,
            seriesIndex: index,
        });
    }
}

const table = computed(() => {
    return mutableDataset.value.links.map(
        ({ source, target, sourceColor, targetColor, value }) => {
            return {
                source,
                target,
                sourceColor,
                targetColor,
                value,
            };
        },
    );
});

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = table.value.map((el, i) => {
            return [[el.source], [el.target], [el.value]];
        });

        const tableXls = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            [
                [FINAL_CONFIG.value.table.columnNames.source],
                [FINAL_CONFIG.value.table.columnNames.target],
                [FINAL_CONFIG.value.table.columnNames.value],
            ],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-flow',
            });
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.source,
        FINAL_CONFIG.value.table.columnNames.target,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    const body = table.value.map((el, i) => {
        return [
            {
                color: el.sourceColor,
                name: el.source,
                shape: 'square',
            },
            {
                color: el.targetColor,
                name: el.target,
                shape: 'square',
            },
            dataLabel({
                p: cfgLabels.value.prefix,
                v: el.value,
                s: cfgLabels.value.suffix,
                r: cfgLabels.value.rounding,
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

    const colNames = head;

    return {
        colNames,
        head,
        body,
        config,
    };
});

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows =
        dataTable.value?.body.map((row) => [
            row[0].name,
            row[1].name,
            row[2],
        ]) ?? [];
    return { headers, rows };
});

const a11yNodes = computed(() => {
    return [...mutableDataset.value.nodes]
        .map((node, index) => ({
            ...node,
            index,
            centerX: node.x + nodeWidth.value / 2,
            centerY:
                checkNaN(node.absoluteY) +
                cfgChart.value.padding.top +
                node.height / 2,
        }))
        .sort((a, b) => {
            if (a.x === b.x) return a.absoluteY - b.absoluteY;
            return a.x - b.x;
        });
});

const a11yColumns = computed(() => {
    const tolerance = 1;
    const columns = [];

    a11yNodes.value.forEach((node) => {
        const existingColumn = columns.find(
            (column) => Math.abs(column.x - node.x) <= tolerance,
        );

        if (existingColumn) {
            existingColumn.nodes.push(node);
        } else {
            columns.push({
                x: node.x,
                nodes: [node],
            });
        }
    });

    columns.forEach((column) => {
        column.nodes.sort((a, b) => a.absoluteY - b.absoluteY);
    });

    return columns.sort((a, b) => a.x - b.x);
});

const a11yNodeIndexMap = computed(() => {
    const map = new Map();
    a11yNodes.value.forEach((node, index) => {
        map.set(node.id, index);
    });
    return map;
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

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const legendSet = computed(() => {
    const counts = new Map();
    for (const node of mutableDataset.value.nodes) {
        const category = getNodeCategory(node.name) || '__uncategorized__';
        counts.set(category, (counts.get(category) || 0) + 1);
    }
    return [...counts]
        .map(([name, count]) => ({
            name,
            count,
            color: getCategoryColor(name) || palette[0],
            shape: 'square',
        }))
        .map((cat, i) => {
            const isSegregated = selectedCategory.value === cat.name;
            return {
                ...cat,
                segregate: () => drillCategory({ legend: cat, i }),
                isSegregated,
                opacity:
                    selectedCategory.value != null
                        ? isSegregated
                            ? 1
                            : 0.5
                        : 1,
                display: `${cat.name} (${cat.count})`,
            };
        });
});

const legendSetFiltered = computed(() =>
    legendSet.value.filter((l) => l.name !== '__uncategorized__'),
);

function drillCategory({ legend }) {
    const category = legend.name;
    const clear = selectedCategory.value === category;
    clearNodeSelection();
    selectedCategory.value = clear ? null : category;
}

const legendConfig = computed(() => ({
    cy: 'flow-legend',
    backgroundColor: cfgChart.value.legend.backgroundColor,
    color: cfgChart.value.legend.color,
    fontSize: cfgChart.value.legend.fontSize,
    paddingBottom: cfgChart.value.legend.paddingBottom,
    fontWeight: cfgChart.value.legend.bold ? 'bold' : 'normal',
}));

const getImage = createChartImageGetter(
    flowChart,
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
        parent: flowChart,
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

const svgLegendItems = computed(() => {
    return legendSetFiltered.value.map((l) => ({
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
function findColumnIndexByNodeId(nodeId) {
    return a11yColumns.value.findIndex((column) =>
        column.nodes.some((node) => node.id === nodeId),
    );
}

function findRowIndexInColumn(columnIndex, nodeId) {
    const column = a11yColumns.value[columnIndex];
    if (!column) return -1;

    return column.nodes.findIndex((node) => node.id === nodeId);
}

function findClosestNodeInColumn(columnIndex, centerY) {
    const column = a11yColumns.value[columnIndex];
    if (!column || !column.nodes.length) return null;

    let closest = column.nodes[0];
    let minDistance = Math.abs(closest.centerY - centerY);

    for (let i = 1; i < column.nodes.length; i += 1) {
        const node = column.nodes[i];
        const distance = Math.abs(node.centerY - centerY);

        if (distance < minDistance) {
            closest = node;
            minDistance = distance;
        }
    }

    return closest;
}

function onSvgFocus() {
    clearNodeSelection();

    isFocus.value = true;
}

function onSvgBlur() {
    clearNodeSelection();
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!a11yNodes.value.length) return;

    const isLeftKey = event.key === 'ArrowLeft';
    const isRightKey = event.key === 'ArrowRight';
    const isUpKey = event.key === 'ArrowUp';
    const isDownKey = event.key === 'ArrowDown';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (
        !isLeftKey &&
        !isRightKey &&
        !isUpKey &&
        !isDownKey &&
        !isActivationKey &&
        !isEscapeKey
    )
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearNodeSelection();
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;
        clickNode(activeTooltipIndex.value);
        return;
    }

    if (activeTooltipNodeId.value === null) {
        const firstNode = a11yColumns.value[0]?.nodes?.[0];
        if (!firstNode) return;

        const firstIndex = a11yNodeIndexMap.value.get(firstNode.id) ?? 0;
        selectNode(firstNode, firstIndex, 'keyboard', firstIndex);
        return;
    }

    const currentIndex = a11yNodeIndexMap.value.get(activeTooltipNodeId.value);
    if (currentIndex === undefined) return;

    const currentNode = a11yNodes.value[currentIndex];
    if (!currentNode) return;

    const currentColumnIndex = findColumnIndexByNodeId(currentNode.id);
    if (currentColumnIndex < 0) return;

    let nextNode = null;

    if (isUpKey || isDownKey) {
        const currentRowIndex = findRowIndexInColumn(
            currentColumnIndex,
            currentNode.id,
        );
        if (currentRowIndex < 0) return;

        const column = a11yColumns.value[currentColumnIndex];
        if (!column?.nodes?.length) return;

        let nextRowIndex = currentRowIndex + (isDownKey ? 1 : -1);

        if (nextRowIndex < 0) {
            nextRowIndex = column.nodes.length - 1;
        }

        if (nextRowIndex >= column.nodes.length) {
            nextRowIndex = 0;
        }

        nextNode = column.nodes[nextRowIndex];
    }

    if (isLeftKey || isRightKey) {
        let nextColumnIndex = currentColumnIndex + (isRightKey ? 1 : -1);

        if (nextColumnIndex < 0) {
            nextColumnIndex = a11yColumns.value.length - 1;
        }

        if (nextColumnIndex >= a11yColumns.value.length) {
            nextColumnIndex = 0;
        }

        nextNode = findClosestNodeInColumn(
            nextColumnIndex,
            currentNode.centerY,
        );
    }

    if (!nextNode) return;

    const nextIndex = a11yNodeIndexMap.value.get(nextNode.id);
    if (nextIndex === undefined) return;

    selectNode(nextNode, nextIndex, 'keyboard', nextIndex);
}

watch(
    [
        () => FINAL_CONFIG.value.responsive,
        () => cfgChart.value.width,
        () => cfgChart.value.height,
    ],
    prepareChart,
    { flush: 'post' },
);
watch(cfgChart, () => scheduleResize?.(), { flush: 'post' });
watch(mutableDataset, ({ nodes }) => {
    if (selectedCategory.value != null) {
        if (!selectedNodes.value.length) clearNodeSelection();
        return;
    }
    if (selectedNodeId.value == null) return;
    const index = nodes.findIndex((node) => node.id === selectedNodeId.value);
    if (index < 0) {
        clearNodeSelection();
        return;
    }
    const flatIndex = a11yNodeIndexMap.value.get(nodes[index].id);
    selectNode(nodes[index], index, tooltipTriggerMode.value, flatIndex, false);
});

defineExpose({
    getData,
    getImage,
    generateCsv,
    generateImage,
    generateSvg,
    generatePdf,
    toggleTable,
    toggleAnnotator,
    toggleTooltip,
    drillCategory,
    unselectNode,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        ref="flowChart"
        :class="`vue-data-ui-component vue-ui-flow ${
            isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''
        }`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor}`"
        :id="`flow_${uid}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="
            () => {
                setUserOptionsVisibility(false);
                if (!isFocus) {
                    clearNodeSelection();
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
            :palette="FINAL_CONFIG.userOptions.annotatorPalette"
            :isCursorPointer="isCursorPointer"
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
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'flow-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'flow-subtitle',
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
            :isFullscreen="isFullscreen"
            :chartElement="flowChart"
            v-bind="
                getUserOptionsProps(
                    FINAL_CONFIG.userOptions,
                    'pdf csv img svg table fullscreen altCopy annotator',
                )
            "
            :isAnnotation="isAnnotator"
            :hasTooltip="
                cfgChart.tooltip.show &&
                FINAL_CONFIG.userOptions.buttons.tooltip
            "
            :isTooltip="mutableConfig.showTooltip"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :isCursorPointer="isCursorPointer"
            @toggleTooltip="toggleTooltip"
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

        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                }"
                :style="{
                    maxWidth: '100%',
                    overflow: 'visible',
                    background: 'transparent',
                    color: cfgChart.color,
                }"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />
                <slot
                    name="svg-underlayer"
                    :svg="{
                        ...drawingArea,
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
                    :width="drawingArea.width"
                    :height="drawingArea.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <defs>
                    <linearGradient
                        v-for="(grad, i) in mutableDataset.links"
                        :id="grad.id"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop offset="0%" :stop-color="grad.sourceColor" />
                        <stop offset="100%" :stop-color="grad.targetColor" />
                    </linearGradient>
                </defs>

                <path
                    data-cy="link"
                    v-for="path in mutableDataset.links"
                    class="vue-ui-flow-link"
                    :d="path.path"
                    stroke-linejoin="round"
                    stroke-miterlimit="1"
                    :fill="`url(#${path.id})`"
                    :stroke="cfgLinks.stroke"
                    :stroke-width="cfgLinks.strokeWidth"
                    :style="`
                        opacity:${
                            selectedNodes
                                ? selectedNodes.includes(path.source) &&
                                  selectedNodes.includes(path.target)
                                    ? 1
                                    : 0.3
                                : cfgLinks.opacity
                        }
                    `"
                />

                <rect
                    data-cy="node"
                    :data-a11y-node-id="node.id"
                    v-for="(node, i) in mutableDataset.nodes"
                    class="vue-ui-flow-node"
                    :x="node.x"
                    :y="checkNaN(node.absoluteY) + cfgChart.padding.top"
                    :height="checkNaN(node.height)"
                    :width="nodeWidth"
                    :fill="node.color"
                    :stroke="cfgNodes.stroke"
                    :stroke-width="cfgNodes.strokeWidth"
                    :rx="cfgNodes.borderRadius"
                    :style="{
                        opacity: selectedNodes
                            ? selectedNodes.includes(node.name)
                                ? 1
                                : 0.3
                            : 1,
                        outline:
                            selectedNodeId !== null &&
                            selectedNodeId === node.id
                                ? '2px solid currentColor'
                                : undefined,
                    }"
                    :aria-label="`${node.name}: ${formatValue(node.value)}`"
                    @mouseenter="
                        selectNode(
                            node,
                            i,
                            'pointer',
                            a11yNodeIndexMap.get(node.id),
                        )
                    "
                    @mouseleave="unselectNode(i)"
                    @click="clickNode(i)"
                />

                <g v-if="cfgLabels.show">
                    <text
                        data-cy="node-name"
                        v-for="(node, i) in mutableDataset.nodes"
                        :x="node.x + nodeWidth / 2"
                        :y="
                            (cfgLabels.showValue
                                ? checkNaN(
                                      node.absoluteY +
                                          node.height / 2 -
                                          cfgLabels.fontSize / 4,
                                  )
                                : node.absoluteY +
                                  node.height / 2 +
                                  cfgLabels.fontSize / 3) + cfgChart.padding.top
                        "
                        :font-size="cfgLabels.fontSize"
                        :fill="adaptColorToBackground(node.color)"
                        text-anchor="middle"
                        :style="`pointer-events: none; opacity:${selectedNodes ? (selectedNodes.includes(node.name) ? 1 : 0) : 1}`"
                    >
                        {{
                            cfgLabels.abbreviation.use
                                ? abbreviate({
                                      source: node.name,
                                      length: cfgNodes.labels.abbreviation
                                          .length,
                                  })
                                : node.name
                        }}
                    </text>

                    <template v-if="cfgLabels.showValue">
                        <text
                            data-cy="node-value"
                            v-for="(node, i) in mutableDataset.nodes"
                            :x="node.x + nodeWidth / 2"
                            :y="
                                checkNaN(
                                    node.absoluteY +
                                        node.height / 2 +
                                        cfgLabels.fontSize / 1.3,
                                ) + cfgChart.padding.top
                            "
                            :font-size="cfgLabels.fontSize"
                            :fill="adaptColorToBackground(node.color)"
                            text-anchor="middle"
                            :style="`pointer-events: none; opacity:${selectedNodes ? (selectedNodes.includes(node.name) ? 1 : 0) : 1}`"
                        >
                            {{
                                formatValue(node.value, {
                                    datapoint: node,
                                    seriesIndex: i,
                                })
                            }}
                        </text>
                    </template>
                </g>

                <slot
                    name="svg"
                    :svg="{
                        ...drawingArea,
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
                        v-if="cfgChart.legend.show && legendSetFiltered.length"
                        :legendSet="legendSetFiltered"
                        :config="legendConfig"
                        :isCursorPointer="isCursorPointer"
                        @clickMarker="(payload) => drillCategory(payload)"
                    >
                        <template #item="{ legend, index }">
                            <div
                                @click="legend.segregate()"
                                :style="{ opacity: legend.opacity }"
                                v-if="!loading"
                            >
                                {{ legend.display }}
                            </div>
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
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="cfgChart.tooltip.backgroundColor"
            :color="cfgChart.tooltip.color"
            :fontSize="cfgChart.tooltip.fontSize"
            :borderRadius="cfgChart.tooltip.borderRadius"
            :borderColor="cfgChart.tooltip.borderColor"
            :borderWidth="cfgChart.tooltip.borderWidth"
            :backgroundOpacity="cfgChart.tooltip.backgroundOpacity"
            :position="cfgChart.tooltip.position"
            :offsetX="cfgChart.tooltip.offsetX"
            :offsetY="cfgChart.tooltip.offsetY"
            :parent="flowChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
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

<style scoped>
@import '../vue-data-ui.css';

.vue-ui-flow * {
    transition: unset;
}

.vue-ui-flow {
    user-select: none;
    position: relative;
}

.vue-ui-flow-node,
.vue-ui-flow-link {
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

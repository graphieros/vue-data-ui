<script setup>
import { ref, computed, onMounted, nextTick, watch, defineAsyncComponent, toRefs } from "vue";
import {
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
    error,
    isFunction,
    objectIsEmpty,
    palette,
    themePalettes,
    treeShake,
    XMLNS,
} from "../lib";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import img from "../img";
import { throttle } from "../canvas-lib";
import { useResponsive } from "../useResponsive";
import { useLoading } from "../useLoading";
import BaseScanner from "../atoms/BaseScanner.vue";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

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

const uid = ref(createUid());
const flowChart = ref(null);
const step = ref(0);
const titleStep = ref(0);
const isTooltip = ref(false);
const tooltipContent = ref("");
const chartLegend = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const responsiveObserver = ref(null);
const observedEl = ref(null);

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(() => {
    prepareChart();
});


const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        ['A', 'B', 2, '#CACACA'],
        ['B', 'C', 1, '#CACACA'],
        ['C', 'D', 0.5, '#CACACA'],
        ['E', 'F', 1, '#AAAAAA'],
        ['F', 'G', 0.5, '#AAAAAA'],
        ['G', 'H', 0.25, '#AAAAAA']
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
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
                        backgroundColor: 'transparent'
                    },
                    nodes: {
                        labels: {
                            show: false
                        },
                        stroke: '#666666'
                    },
                    links: {
                        stroke: '#666666'
                    }
                }
            }
        }
    })
})

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: "VueUiFlow",
            type: "dataset",
            debug: debug.value
        });
        manualLoading.value = true;
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: flowChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value
            });

            requestAnimationFrame(() => {
                WIDTH.value = width;
                HEIGHT.value = height;
            })
        });

        if (responsiveObserver.value) {
            if (observedEl.value) {
                responsiveObserver.value.unobserve(observedEl.value);
            }
            responsiveObserver.value.disconnect();
        }

        responsiveObserver.value = new ResizeObserver(handleResize);
        observedEl.value = flowChart.value.parentNode;
        responsiveObserver.value.observe(observedEl.value);
    }
}

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });

const { svgRef } = useChartAccessibility({
    config: FINAL_CONFIG.value.style.chart.title,
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });

    let final = mergedConfig;

    if (mergedConfig.theme) {
        final = {
            ...useNestedProp({
                userConfig: themes.vue_ui_flow[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig,
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette,
        };
    } else {
        final = mergedConfig;
    }

    final.nodeCategories = props.config.nodeCategories || {};
    final.nodeCategoryColors = props.config.nodeCategoryColors || {};

    return final;
}

const WIDTH = ref(FINAL_CONFIG.value.style.chart.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.chart.height);

watch(
    () => props.config,
    (_newCfg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
        prepareChart();
        titleStep.value += 1;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    },
    { deep: true }
);

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
}, { deep: true })

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `flow_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-flow",
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return (
        FINAL_CONFIG.value.userOptions.show &&
        !FINAL_CONFIG.value.style.chart.title.text
    );
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const nodeWidth = computed(() => {
    return FINAL_CONFIG.value.style.chart.nodes.width;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
    }
}, { immediate: true });

const sanitizedDataset = computed(() => {
    if (!FINAL_DATASET.value || !FINAL_DATASET.value.length) return [];
    return FINAL_DATASET.value.map((dp, i) => {
        return [
            dp[0],
            dp[1],
            checkNaN(dp[2]),
            dp[3]
                ? convertColorToHex(dp[3])
                : customPalette.value[i] ||
                customPalette.value[i % customPalette.value.length] ||
                palette[i] ||
                palette[i % palette.length],
        ];
    });
});

function computeSankeyCoordinates(ds) {
    const nodes = {};
    const levels = {};

    function addNode(name, level) {
        if (!nodes[name]) {
        nodes[name] = {
            level: null,
            inflow: 0,
            outflow: 0,
            children: [],
            color: null,
            uid: createUid(),
        };
        }
        if (nodes[name].level === null) nodes[name].level = level;
        if (!levels[level]) levels[level] = [];
        if (!levels[level].includes(name)) levels[level].push(name);
    }

    ds.forEach(([s, t, v]) => {
        const srcLevel = nodes[s]?.level ?? 0;
        const tgtLevel = srcLevel + 1;
        addNode(s, srcLevel);
        addNode(t, tgtLevel);
        nodes[s].children.push({ target: t, value: v });
        nodes[s].outflow += v;
        nodes[t].inflow += v;
    });

    const sources = new Set(ds.map(([s]) => s));
    const targetsSet = new Set(ds.map(([, t]) => t));
    const rootNodes = Array.from(sources).filter((s) => !targetsSet.has(s));

    const rootColors = {};
    rootNodes.forEach((n, i) => {
        rootColors[n] = customPalette.value[i]|| palette[i % palette.length];
    });

    const customColorMap = {};
    ds.forEach(([s, t, _v, c]) => {
        if (c) { customColorMap[s] = c; customColorMap[t] = c; }
    });

    Object.keys(nodes).forEach((name, idx) => {
        const category = FINAL_CONFIG.value.nodeCategories?.[name];
        const categoryColor = category
        ? FINAL_CONFIG.value.nodeCategoryColors?.[category]
        : null;

        nodes[name].color =
        customColorMap[name] ||
        categoryColor ||
        (rootNodes.includes(name) ? rootColors[name] : null) ||
        palette[idx % palette.length];
    });

    Object.keys(nodes).forEach((k) => {
        nodes[k].value = Math.max(nodes[k].inflow, nodes[k].outflow);
    });

    const p = padding.value;
    const innerW = innerSize.value.width;
    const innerH = innerSize.value.height;

    const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);
    const levelCount = levelKeys.length || 1;

    const colSpacing = levelCount > 1 ? innerW / (levelCount - 1) : 0;
    const nodeW = Number(nodeWidth.value);
    const gapPx = Number(
        FINAL_CONFIG.value.style.chart.nodes.gapPx ??
        FINAL_CONFIG.value.style.chart.nodes.gap ??
        8
    );
    const minHeightCfg = Number(FINAL_CONFIG.value.style.chart.nodes.minHeight || 0);

    function levelAllowedScale(levelIndex) {
        const names = levels[levelIndex];
        const n = names.length;
        if (!n) return Infinity;

        const gaps = Math.max(0, (n - 1) * gapPx);
        const H = Math.max(0, innerH - gaps);
        const effectiveMin = Math.min(minHeightCfg, n ? H / n : 0);

        let reserved = 0;
        let remain = names.map((nm) => nodes[nm].value || 0);
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

    const nodeCoordinates = {};
    levelKeys.forEach((levelIndex) => {
        const names = levels[levelIndex];
        const n = names.length;
        const gaps = Math.max(0, (n - 1) * gapPx);
        const H = Math.max(0, innerH - gaps);
        const effectiveMin = Math.min(minHeightCfg, n ? H / n : 0);

        const heights = names.map(
        (nm) => Math.max(effectiveMin, (nodes[nm].value || 0) * globalScale)
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
            color: nodes[name].color,
            value: nodes[name].value,
        };

        yCursor += h;
        if (i < n - 1) yCursor += gapPx;
        });
    });

    const links = [];
    const yOffset = p.top;

    const tgtOffsets = {};
    const tgtAccum = {};
    Object.keys(nodes).forEach((n) => {
        tgtOffsets[n] = nodeCoordinates[n]?.y ?? 0;
        tgtAccum[n] = 0;
    });

    const EPS = 1e-6;
    const PIX_EPS = 0.25;

    levelKeys.forEach((levelIndex) => {
        const names = levels[levelIndex];
        names.forEach((name) => {
        const srcNode = nodes[name];
        const srcCoord = nodeCoordinates[name];
        if (!srcNode.children || !srcNode.children.length) return;

        let srcInnerY = srcCoord.y;

        srcNode.children.forEach(({ target, value }) => {
            const tgtCoord = nodeCoordinates[target];
            const targetNode = nodes[target];

            const srcFrac = srcNode.outflow > 0 ? value / srcNode.outflow : 0;
            const tgtFrac = targetNode.inflow > 0 ? value / targetNode.inflow : 0;

            const sY1 = checkNaN(srcInnerY + yOffset);
            const sY2 = checkNaN(srcInnerY + srcFrac * srcCoord.height + yOffset);

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

            links.push({
            id: createUid(),
            source: name,
            target,
            path:
                `M ${checkNaN(srcCoord.x + nodeW)} ${sY1}` +
                ` L ${checkNaN(srcCoord.x + nodeW)} ${sY2}` +
                ` L ${checkNaN(tgtCoord.x)} ${tY2}` +
                ` L ${checkNaN(tgtCoord.x)} ${tY1} Z`,
            value,
            sourceColor: srcNode.color,
            targetColor: nodes[target].color,
            });

            srcInnerY = sY2 - yOffset;
            tgtOffsets[target] = tEnd;
        });
        });
    });

    return { nodeCoordinates, links };
}

const mutableDataset = computed(() => {
    const d = computeSankeyCoordinates(FINAL_DATASET.value);

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

const chartWidth = computed(() => WIDTH.value);
const chartHeight = computed(() => HEIGHT.value);

const padding = computed(() => FINAL_CONFIG.value.style.chart.padding);

const innerSize = computed(() => {
    return {
        width: Math.max(0, chartWidth.value - 40 - padding.value.right - padding.value.left),
        height: Math.max(0, chartHeight.value - padding.value.top - padding.value.bottom),
    };
});


const drawingArea = computed(() => ({
    width: chartWidth.value,
    height: chartHeight.value,
}));

function findConnectedNodes(startNode) {
    const nodes = {};
    const reverseNodes = {};
    const result = new Set();

    sanitizedDataset.value.forEach(([source, target, value]) => {
        if (!nodes[source]) {
            nodes[source] = [];
        }
        if (!reverseNodes[target]) {
            reverseNodes[target] = [];
        }
        nodes[source].push(target);
        reverseNodes[target].push(source);
    });

    if (nodes[startNode]) {
        nodes[startNode].forEach((child) => result.add(child));
    }

    if (reverseNodes[startNode]) {
        reverseNodes[startNode].forEach((parent) => result.add(parent));
    }

    return Array.from(result).concat(startNode);
}

const selectedNodes = ref(null);
const selectedSource = ref(null);
const dataTooltipSlot = ref(null);
const useCustomFormat = ref(false);

function selectNode(node, index) {
    segregated.value = [];
    selectedNodes.value = findConnectedNodes(node.name);
    selectedSource.value = node.name;

    const nodeName = node.name;
    const dataset = sanitizedDataset.value;

    let inflow = 0;
    let outflow = 0;
    let from = [];
    let to = [];

    const sources = new Set(dataset.map(([s]) => s));
    const targets = new Set(dataset.map(([, t]) => t));
    const rootNodes = Array.from(sources).filter((src) => !targets.has(src));

    const totalRootFlow = dataset
        .filter(([source]) => rootNodes.includes(source))
        .reduce((sum, [_s, _t, value]) => sum + value, 0);

    const nodeColorMap = {};
    mutableDataset.value.nodes.forEach((n) => {
        nodeColorMap[n.name] = n.color;
    });

    dataset.forEach(([source, target, value]) => {
        if (target === nodeName) {
            inflow += value;
            from.push({ source, value, color: nodeColorMap[source] });
        }
        if (source === nodeName) {
            outflow += value;
            to.push({ target, value, color: nodeColorMap[target] });
        }
    });

    const nodeTotalFlow = Math.max(inflow, outflow);
    const percentOfTotal =
        totalRootFlow > 0 ? (nodeTotalFlow / totalRootFlow) * 100 : 0;

    const datapoint = {
        name: nodeName,
        inflow,
        outflow,
        from,
        to,
        percentOfTotal,
        color: nodeColorMap[nodeName] || "#000000",
    };

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: index })
    }

    dataTooltipSlot.value = { datapoint };
    isTooltip.value = true;

    let html = "";
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                datapoint,
                series: mutableDataset.value,
                config: FINAL_CONFIG.value,
            });
            if (typeof customFormatString === "string") {
                tooltipContent.value = customFormatString;
                useCustomFormat.value = true;
            }
        } catch (err) {
            console.warn("Custom format cannot be applied.");
        }
    }

    if (!useCustomFormat.value) {
        const percentageDisplay = FINAL_CONFIG.value.style.chart.tooltip
            .showPercentage
            ? `<div>${dataLabel({
                p: FINAL_CONFIG.value.style.chart.tooltip.translations.percentOfTotal,
                v: datapoint.percentOfTotal,
                s: "%",
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage,
            })}</div>`
            : "";

        html += `<div data-cy="tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;"><span style="margin-right:4px; color:${datapoint.color}">⏹</span>${datapoint.name}${percentageDisplay}</div>`;

        if (datapoint.from.length) {
            html += `<div>${FINAL_CONFIG.value.style.chart.tooltip.translations.from}</div>`;
            datapoint.from.forEach((item) => {
                html += `<div><span style="color:${item.color}">⏹←</span> ${item.source
                    }: ${applyDataLabel(
                        FINAL_CONFIG.value.style.chart.nodes.labels.formatter,
                        item.value,
                        dataLabel({
                            p: FINAL_CONFIG.value.style.chart.nodes.labels.prefix,
                            v: item.value,
                            s: FINAL_CONFIG.value.style.chart.nodes.labels.suffix,
                            r: FINAL_CONFIG.value.style.chart.nodes.labels.rounding,
                        })
                    )}</div>`;
            });
        }

        if (datapoint.to.length) {
            html += `<div style="margin-top:6px;">${FINAL_CONFIG.value.style.chart.tooltip.translations.to}</div>`;
            datapoint.to.forEach((item) => {
                html += `<div><span style="color:${item.color}">⏹→</span> ${item.target
                    }: ${applyDataLabel(
                        FINAL_CONFIG.value.style.chart.nodes.labels.formatter,
                        item.value,
                        dataLabel({
                            p: FINAL_CONFIG.value.style.chart.nodes.labels.prefix,
                            v: item.value,
                            s: FINAL_CONFIG.value.style.chart.nodes.labels.suffix,
                            r: FINAL_CONFIG.value.style.chart.nodes.labels.rounding,
                        })
                    )}</div>`;
            });
        }

        tooltipContent.value = html;
    }
}

function unselectNode(index) {
    const datapoint = dataTooltipSlot.value;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex: index });
    }
    selectedNodes.value = null;
    selectedSource.value = null;
    isTooltip.value = false;
}

function clickNode(index) {
    const datapoint = dataTooltipSlot.value;
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: index });
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
        }
    );
});

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.map((el, i) => {
            return [[el.source], [el.target], [el.value]];
        });

        const tableXls = [
            [FINAL_CONFIG.value.style.chart.title.text],
            [FINAL_CONFIG.value.style.chart.title.subtitle.text],
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
                title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-flow",
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
            },
            {
                color: el.targetColor,
                name: el.target,
            },
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.nodes.labels.prefix,
                v: el.value,
                s: FINAL_CONFIG.value.style.chart.nodes.labels.suffix,
                r: FINAL_CONFIG.value.style.chart.nodes.labels.rounding,
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
        FINAL_CONFIG.value.table.columnNames.source,
        FINAL_CONFIG.value.table.columnNames.target,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    return {
        colNames,
        head,
        body,
        config,
    };
});

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
    const cats = new Set(
        mutableDataset.value.nodes.map(
            (n) => FINAL_CONFIG.value.nodeCategories[n.name] || "__uncategorized__"
        )
    );

    return Array.from(cats)
        .map((cat) => {
            return {
                name: cat,
                color: FINAL_CONFIG.value.nodeCategoryColors[cat] || palette[0],
                shape: "square",
                count: mutableDataset.value.nodes.filter(
                    (n) =>
                        (FINAL_CONFIG.value.nodeCategories[n.name] || "__uncategorized__") ===
                        cat
                ).length,
            };
        })
        .map((cat, i) => {
            return {
                ...cat,
                segregate: () => drillCategory({ legend: cat, i }),
                opacity: segregated.value.length ? segregated.value.includes(i) ? 1: 0.5 : 1
            }
        })
});

const legendSetFiltered = computed(() =>
    legendSet.value.filter((l) => l.name !== "__uncategorized__")
);

const segregated = ref([])

function drillCategory({ legend, i }) {
    const cat = legend.name;

    if (
        selectedNodes.value?.every(
            (n) => FINAL_CONFIG.value.nodeCategories[n] === cat
        )
    ) {
        selectedNodes.value = null;
        selectedSource.value = null;
        segregated.value = [];
        return;
    }

    segregated.value = [i]

    selectedNodes.value = mutableDataset.value.nodes
        .filter((n) => FINAL_CONFIG.value.nodeCategories[n.name] === cat)
        .map((n) => n.name);

    selectedSource.value = null;
}

const legendConfig = computed(() => ({
    cy: "flow-legend",
    backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
    color: FINAL_CONFIG.value.style.chart.legend.color,
    fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
    paddingBottom: FINAL_CONFIG.value.style.chart.legend.paddingBottom,
    fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? "bold" : "normal",
}));

async function getImage({ scale = 2} = {}) {
    if (!flowChart.value) return;
    const { width, height } = flowChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: flowChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

defineExpose({
    getData,
    getImage,
    generateCsv,
    generateImage,
    generatePdf,
    toggleTable,
    toggleAnnotator,
    toggleTooltip,
    drillCategory,
    unselectNode,
    toggleFullscreen,
});
</script>

<template>
    <div ref="flowChart" :class="`vue-ui-flow ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''
        }`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        :id="`flow_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper v-if="FINAL_CONFIG.userOptions.buttons.annotator" :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator" @close="toggleAnnotator" />

        <div ref="noTitle" v-if="hasOptionsNoTitle" class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title :key="`title_${titleStep}`" :config="{
                title: {
                    cy: 'flow-title',
                    ...FINAL_CONFIG.style.chart.title,
                },
                subtitle: {
                    cy: 'flow-subtitle',
                    ...FINAL_CONFIG.style.chart.title.subtitle,
                },
            }" />
        </div>

        <UserOptions ref="details" :key="`user_option_${step}`" v-if="
            FINAL_CONFIG.userOptions.show &&
            isDataset &&
            (keepUserOptionState ? true : userOptionsVisible)
        " :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" :isImaging="isImaging" :uid="uid" :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv" :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }" :chartElement="flowChart"
            :position="FINAL_CONFIG.userOptions.position" 
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :isAnnotation="isAnnotator" :hasTooltip="FINAL_CONFIG.style.chart.tooltip.show &&
                FINAL_CONFIG.userOptions.buttons.tooltip
                " :isTooltip="mutableConfig.showTooltip" @toggleTooltip="toggleTooltip" @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf" @generateCsv="generateCsv" @generateImage="generateImage"
            @toggleTable="toggleTable" @toggleAnnotator="toggleAnnotator" :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }">
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip" />
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionCsv v-if="$slots.optionCsv">
                <slot name="optionCsv" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg 
            ref="svgRef" 
            :xmlns="XMLNS" 
            :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`" 
            :class="{
                'vue-data-ui-fullscreen--on': isFullscreen,
                'vue-data-ui-fulscreen--off': !isFullscreen,
            }"
            :style="{
                maxWidth: '100%',
                overflow: 'visible',
                background: 'transparent',
                color: FINAL_CONFIG.style.chart.color,
            }"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject v-if="$slots['chart-background']" :x="0" :y="0" :width="drawingArea.width"
                :height="drawingArea.height" :style="{
                    pointerEvents: 'none',
                }">
                <slot name="chart-background" />
            </foreignObject>

            <defs>
                <linearGradient v-for="(grad, i) in mutableDataset.links" :id="grad.id" x1="0%" y1="0%" x2="100%"
                    y2="0%">
                    <stop offset="0%" :stop-color="grad.sourceColor" />
                    <stop offset="100%" :stop-color="grad.targetColor" />
                </linearGradient>
            </defs>

            <path data-cy="link" v-for="path in mutableDataset.links" class="vue-ui-flow-link" :d="path.path" stroke-linejoin="round" stroke-miterlimit="1"
                :fill="`url(#${path.id})`" :stroke="FINAL_CONFIG.style.chart.links.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.links.strokeWidth" :style="`
                    opacity:${selectedNodes
                        ? selectedNodes.includes(path.source) &&
                            selectedNodes.includes(path.target)
                            ? 1
                            : 0.3
                        : selectedSource
                            ? [path.target, path.source].includes(selectedSource)
                                ? 1
                                : 0.3
                            : FINAL_CONFIG.style.chart.links.opacity
                    }
                `" />

            <rect 
                data-cy="node" 
                v-for="(node, i) in mutableDataset.nodes" 
                class="vue-ui-flow-node" 
                :x="node.x"
                :y="checkNaN(node.absoluteY) + FINAL_CONFIG.style.chart.padding.top" 
                :height="checkNaN(node.height)"
                :width="nodeWidth" 
                :fill="node.color" 
                :stroke="FINAL_CONFIG.style.chart.nodes.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.nodes.strokeWidth" 
                @mouseenter="selectNode(node, i)"
                @mouseleave="unselectNode(i)" :style="`opacity:${selectedNodes ? (selectedNodes.includes(node.name) ? 1 : 0.3) : 1 }`" 
                @click="clickNode(i)"
            />

            <g v-if="FINAL_CONFIG.style.chart.nodes.labels.show">
                <text data-cy="node-name" v-for="(node, i) in mutableDataset.nodes" :x="node.x + nodeWidth / 2" :y="checkNaN(
                    node.absoluteY +
                    node.height / 2 -
                    FINAL_CONFIG.style.chart.nodes.labels.fontSize / 4
                ) + FINAL_CONFIG.style.chart.padding.top
                    " :font-size="FINAL_CONFIG.style.chart.nodes.labels.fontSize" :fill="adaptColorToBackground(node.color)"
                    text-anchor="middle" :style="`pointer-events: none; opacity:${selectedNodes ? (selectedNodes.includes(node.name) ? 1 : 0) : 1
                        }`">
                    {{
                        FINAL_CONFIG.style.chart.nodes.labels.abbreviation.use
                            ? abbreviate({
                                source: node.name,
                                length:
                                    FINAL_CONFIG.style.chart.nodes.labels.abbreviation.length,
                            })
                            : node.name
                    }}
                </text>
                <text data-cy="node-value" v-for="(node, i) in mutableDataset.nodes" :x="node.x + nodeWidth / 2" :y="checkNaN(
                    node.absoluteY +
                    node.height / 2 +
                    FINAL_CONFIG.style.chart.nodes.labels.fontSize
                ) + FINAL_CONFIG.style.chart.padding.top
                    " :font-size="FINAL_CONFIG.style.chart.nodes.labels.fontSize" :fill="adaptColorToBackground(node.color)"
                    text-anchor="middle" :style="`pointer-events: none; opacity:${selectedNodes ? (selectedNodes.includes(node.name) ? 1 : 0) : 1
                        }`">
                    {{
                        applyDataLabel(
                            FINAL_CONFIG.style.chart.nodes.labels.formatter,
                            node.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.nodes.labels.prefix,
                                v: node.value,
                                s: FINAL_CONFIG.style.chart.nodes.labels.suffix,
                                r: FINAL_CONFIG.style.chart.nodes.labels.rounding,
                            }),
                            { datapoint: node, seriesIndex: i }
                    )
                    }}
                </text>
            </g>

            <slot name="svg" :svg="drawingArea" />
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
        </div>

        <div ref="chartLegend">
            <Legend v-if="FINAL_CONFIG.style.chart.legend.show && legendSetFiltered.length"
                :legendSet="legendSetFiltered" :config="legendConfig"
                @clickMarker="(payload) => drillCategory(payload)">
                <template #item="{ legend, index }">
                    <div @click="legend.segregate()" :style="`opacity:${segregated.length ? segregated.includes(index) ? 1 : 0.5 : 1}`" v-if="!loading">
                        {{ legend.name }} ({{ legend.count }})
                    </div>
                </template>
            </Legend>
            <slot name="legend" v-bind:legend="legendSet" />
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip 
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color" 
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position" 
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="flowChart" 
            :content="tooltipContent" 
            :isCustom="useCustomFormat" 
            :isFullscreen="isFullscreen"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
        </Tooltip>

        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            },
        }">
            <template #content>
                <DataTable :colNames="dataTable.colNames" :head="dataTable.head" :body="dataTable.body"
                    :config="dataTable.config" :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text
                            ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}`
                            : ''
                        }`" @close="mutableConfig.showTable = false">
                    <template #th="{ th }">
                        <div v-html="th" style="display: flex; align-items: center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading"/>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

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
</style>

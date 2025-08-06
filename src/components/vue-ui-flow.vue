<script setup>
import { ref, computed, onMounted, nextTick, watch, defineAsyncComponent } from "vue";
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

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: "VueUiFlow",
            type: "dataset",
        });
    }
}

const uid = ref(createUid());
const flowChart = ref(null);
const step = ref(0);
const titleStep = ref(0);
const isTooltip = ref(false);
const tooltipContent = ref("");
const chartLegend = ref(null);

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg;
    },
});

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

watch(
    () => props.config,
    (_newCfg) => {
        FINAL_CONFIG.value = prepareConfig();
        userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
        prepareChart();
        titleStep.value += 1;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    },
    { deep: true }
);

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

const gap = computed(() => {
    return FINAL_CONFIG.value.style.chart.nodes.gap;
});

const nodeWidth = computed(() => {
    return FINAL_CONFIG.value.style.chart.nodes.width;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
});

const unitWidth = computed(() => {
    return FINAL_CONFIG.value.style.chart.links.width;
});

const sanitizedDataset = computed(() => {
    if (!props.dataset || !props.dataset.length) return [];
    return props.dataset.map((dp, i) => {
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

const max = computed(() => {
    const nodes = {};

    function addNode(node) {
        if (!nodes[node]) {
            nodes[node] = { inflow: 0, outflow: 0 };
        }
    }

    sanitizedDataset.value.forEach(([source, target, value]) => {
        addNode(source);
        addNode(target);

        nodes[source].outflow += value;
        nodes[target].inflow += value;
    });

    let maxHeight = 0;
    for (const node in nodes) {
        const nodeHeight = Math.max(nodes[node].inflow, nodes[node].outflow);
        maxHeight = Math.max(maxHeight, nodeHeight);
    }

    return maxHeight;
});

function setHeight(val) {
    return (
        (val / max.value) * 100 + FINAL_CONFIG.value.style.chart.nodes.minHeight
    );
}

function getValueFromHeight(height) {
    const minHeight = FINAL_CONFIG.value.style.chart.nodes.minHeight;
    return ((height - minHeight) / 100) * max.value;
}

function computeSankeyCoordinates(ds) {
    const nodes = {};
    const levels = {};

    function addNode(node, level) {
        if (!nodes[node]) {
            nodes[node] = {
                height: 0,
                level: null,
                inflow: 0,
                outflow: 0,
                uid: createUid(),
            };
        }
        if (nodes[node].level === null) {
            nodes[node].level = level;
        }
        if (!levels[level]) {
            levels[level] = [];
        }
        if (!levels[level].includes(node)) {
            levels[level].push(node);
        }
    }

    // 1) Build the graph structure
    ds.forEach(([source, target, value]) => {
        const sourceLevel = nodes[source]?.level ?? 0;
        const targetLevel = sourceLevel + 1;

        addNode(source, sourceLevel);
        addNode(target, targetLevel);

        if (!nodes[source].children) {
            nodes[source].children = [];
        }
        nodes[source].children.push({ target, value });

        nodes[source].outflow += value;
        nodes[target].inflow += value;
    });

    // 2) Identify root nodes & assign root colors
    const sources = new Set(ds.map(([s]) => s));
    const targets = new Set(ds.map(([, t]) => t));
    const rootNodes = Array.from(sources).filter((s) => !targets.has(s));

    const rootColors = {};
    rootNodes.forEach((name, i) => {
        rootColors[name] = customPalette.value[i] || palette[i % palette.length];
    });

    // 3) Build custom‐override map
    const customColorMap = {};
    ds.forEach(([s, t, _v, c]) => {
        if (c) {
            customColorMap[s] = c;
            customColorMap[t] = c;
        }
    });

    // 4) Assign colors per unique node
    const nodeList = Object.keys(nodes);
    nodeList.forEach((name, idx) => {
        const category = FINAL_CONFIG.value.nodeCategories?.[name];
        const categoryColor = category
            ? FINAL_CONFIG.value.nodeCategoryColors?.[category]
            : null;

        nodes[name].color =
            customColorMap[name] || // 1) explicit
            categoryColor || // 2) category
            (rootNodes.includes(name) ? rootColors[name] : null) || // 3) root
            palette[idx % palette.length]; // 4) fallback
    });

    // 5) Compute heights & names
    for (const key in nodes) {
        nodes[key].height = setHeight(
            Math.max(nodes[key].inflow, nodes[key].outflow)
        );
        nodes[key].name = key;
    }

    // 6) Layout node coordinates
    const nodeCoordinates = {};
    for (const level in levels) {
        let yOffset = 0;
        levels[level].forEach((node, i) => {
            const n = nodes[node];
            nodeCoordinates[node] = {
                x:
                    parseInt(level, 10) * unitWidth.value +
                    FINAL_CONFIG.value.style.chart.padding.left,
                y: yOffset,
                absoluteY: yOffset,
                height: n.height,
                i,
                color: n.color,
                value: getValueFromHeight(n.height),
            };
            yOffset += n.height + gap.value;
        });
    }

    // 7) Build links
    const links = [];
    for (const node of Object.keys(nodes)) {
        let sourceY =
            nodeCoordinates[node].absoluteY +
            FINAL_CONFIG.value.style.chart.padding.top;
        const srcNode = nodes[node];
        const srcCoord = nodeCoordinates[node];

        if (srcNode.children) {
            srcNode.children.forEach(({ target, value }) => {
                const tgtCoord = nodeCoordinates[target];
                const targetNode = nodes[target];

                const sourceLinkY1 = checkNaN(sourceY);
                const sourceLinkY2 = checkNaN(
                    sourceY + (value / srcNode.outflow) * srcCoord.height
                );
                const targetLinkY1 = checkNaN(
                    tgtCoord.y + FINAL_CONFIG.value.style.chart.padding.top
                );
                const targetLinkY2 = checkNaN(
                    targetLinkY1 + (value / targetNode.inflow) * tgtCoord.height
                );

                links.push({
                    id: createUid(),
                    source: node,
                    target,
                    path:
                        `M ${checkNaN(srcCoord.x + nodeWidth.value)} ${sourceLinkY1}` +
                        ` L ${checkNaN(srcCoord.x + nodeWidth.value)} ${sourceLinkY2}` +
                        ` L ${checkNaN(tgtCoord.x)} ${targetLinkY2}` +
                        ` L ${checkNaN(tgtCoord.x)} ${targetLinkY1} Z`,
                    value,
                    sourceColor: srcNode.color,
                    targetColor: targetNode.color,
                });

                sourceY += sourceLinkY2 - sourceLinkY1;
                nodeCoordinates[target].y += targetLinkY2 - targetLinkY1;
            });
        }
    }

    return { nodeCoordinates, links };
}

const mutableDataset = computed(() => {
    const d = computeSankeyCoordinates(props.dataset);

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

const totalHeight = computed(() => {
    return computeTotalHeight(mutableDataset.value.nodes);
});

function computeTotalHeight(nodeCoordinates) {
    const levelHeights = {};

    for (const node in nodeCoordinates) {
        const { x, height } = nodeCoordinates[node];
        if (!levelHeights[x]) {
            levelHeights[x] = 0;
        }
        levelHeights[x] += height + gap.value;
    }

    const totalHeight = Math.max(...Object.values(levelHeights));
    return totalHeight;
}

const drawingArea = computed(() => {
    const { top: pTop, right: pRight, bottom: pBottom, left: pLeft } = FINAL_CONFIG.value.style.chart.padding;
    const maxNodeX = Math.max(...mutableDataset.value.nodes.map(n => n.x));
    const width = pLeft + maxNodeX + nodeWidth.value + pRight;
    const maxNodeBottom = Math.max(
        ...mutableDataset.value.nodes.map(n => n.absoluteY + n.height)
    );
    const height = pTop + maxNodeBottom + pBottom;
    return { width, height };
});

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

function selectNode(node) {
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

function unselectNode() {
    selectedNodes.value = null;
    selectedSource.value = null;
    isTooltip.value = false;
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

        <div v-if="FINAL_CONFIG.style.chart.title.text"
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

        <svg ref="svgRef" :xmlns="XMLNS" :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`" :class="{
            'vue-data-ui-fullscreen--on': isFullscreen,
            'vue-data-ui-fulscreen--off': !isFullscreen,
        }" :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`">
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

            <path data-cy="link" v-for="path in mutableDataset.links" class="vue-ui-flow-link" :d="path.path"
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

            <rect data-cy="node" v-for="(node, i) in mutableDataset.nodes" class="vue-ui-flow-node" :x="node.x"
                :y="checkNaN(node.absoluteY) + FINAL_CONFIG.style.chart.padding.top" :height="checkNaN(node.height)"
                :width="nodeWidth" :fill="node.color" :stroke="FINAL_CONFIG.style.chart.nodes.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.nodes.strokeWidth" @mouseenter="selectNode(node)"
                @mouseleave="unselectNode()" :style="`opacity:${selectedNodes ? (selectedNodes.includes(node.name) ? 1 : 0.3) : 1
                    }`" />

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

            <slot name="svg" :svg="drawingArea" />
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
        </div>

        <Skeleton v-if="!isDataset" :config="{
            type: 'flow',
            style: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
            },
        }" />

        <div ref="chartLegend">
            <Legend v-if="FINAL_CONFIG.style.chart.legend.show && legendSetFiltered.length"
                :legendSet="legendSetFiltered" :config="legendConfig"
                @clickMarker="(payload) => drillCategory(payload)">
                <template #item="{ legend, index }">
                    <div @click="legend.segregate()" :style="`opacity:${segregated.length ? segregated.includes(index) ? 1 : 0.5 : 1}`">
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

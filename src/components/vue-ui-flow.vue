<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import themes from "../themes.json";
import { 
    abbreviate,
    adaptColorToBackground, 
    applyDataLabel,
    checkNaN,
    convertCustomPalette,
    createCsvContent, 
    createUid, 
    dataLabel, 
    downloadCsv, 
    error, 
    objectIsEmpty, 
    palette, 
    themePalettes,
    XMLNS, 
} from "../lib";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Accordion from "./vue-ui-accordion.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";

const { vue_ui_flow: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Array,
        default() {
            return []
        }
    }
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
            componentName: 'VueUiFlow',
            type: 'dataset'
        })
    }
}

const uid = ref(createUid());
const flowChart = ref(null);
const step = ref(0);
const titleStep = ref(0);

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_flow[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig,
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    titleStep.value += 1;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `flow_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-flow'
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette)
});

const gap = computed(() => {
    return FINAL_CONFIG.value.style.chart.nodes.gap;
});

const nodeWidth = computed(() => {
    return FINAL_CONFIG.value.style.chart.nodes.width;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show
});

const unitWidth = computed(() => {
    return FINAL_CONFIG.value.style.chart.links.width;
});

const sanitizedDataset = computed(() => {
    if(!props.dataset || !props.dataset.length) return [];
    return props.dataset.map(dp => {
        return [
            dp[0],
            dp[1],
            checkNaN(dp[2])
        ]
    })
})

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
    return val / max.value * 100 + FINAL_CONFIG.value.style.chart.nodes.minHeight;
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
            nodes[node] = { height: 0, level: null, inflow: 0, outflow: 0 };
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

    ds.forEach(([source, target, value], i) => {
        const sourceLevel = nodes[source] ? nodes[source].level : 0;
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

    Object.keys(nodes).forEach((key, i) => {
        nodes[key].color = customPalette.value[i] || customPalette.value[i % customPalette.value.length] || palette[i] || palette[i % d.length]  
    });


    for (const node in nodes) {
        nodes[node].height = setHeight(Math.max(nodes[node].inflow, nodes[node].outflow));
        nodes[node].name = node
    }

    const nodeCoordinates = {};
    for (const level in levels) {
        let yOffset = 0;
        levels[level].forEach((node, i) => {
            const nodeHeight = nodes[node].height;
            nodeCoordinates[node] = {
                x: parseInt(level, 10) * unitWidth.value + FINAL_CONFIG.value.style.chart.padding.left,
                y: yOffset,
                absoluteY: yOffset,
                height: nodeHeight,
                i,
                color: nodes[node].color,
                value: getValueFromHeight(nodeHeight)
            };
            yOffset += nodeHeight + gap.value;
        });
    }

    const links = [];
    for (const node in nodes) {
        let sourceY = nodeCoordinates[node].absoluteY;

        if (nodes[node].children) {
            nodes[node].children.forEach(({ target, value }, i) => {
                const targetY = nodeCoordinates[target].y;
                const sourceCoord = nodeCoordinates[node];
                const targetCoord = nodeCoordinates[target];

                const sourceLinkY1 = checkNaN(sourceY);
                const sourceLinkY2 = checkNaN(sourceY + (value / nodes[node].outflow) * sourceCoord.height);
                const targetLinkY1 = checkNaN(targetY);
                const targetLinkY2 = checkNaN(targetY + (value / nodes[target].inflow) * targetCoord.height);

                const link = {
                    id: createUid(),
                    source: node,
                    target: target,
                    path: `M ${checkNaN(sourceCoord.x) + checkNaN(nodeWidth.value)} ${sourceLinkY1} L ${checkNaN(sourceCoord.x) + checkNaN(nodeWidth.value)} ${sourceLinkY2} L ${checkNaN(targetCoord.x)} ${targetLinkY2} L ${checkNaN(targetCoord.x)} ${targetLinkY1} Z`,
                    value: value,
                    sourceColor: nodes[node].color,
                    targetColor: nodes[target].color
                };

                links.push(link);
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
            }
        }),
        links: d.links
    }
})

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
    const { top: p_top, right: p_right, left: p_left, bottom: p_bottom } = FINAL_CONFIG.value.style.chart.padding;
    const width = sanitizedDataset.value.length * unitWidth.value;
    return {
        height: totalHeight.value + p_top + p_bottom,
        width: p_right + Math.max(...mutableDataset.value.nodes.map(n => n.x)) + nodeWidth.value,
        left: p_left,
        top: p_top,
        right: width - p_right,
        p_top,
        p_bottom
    }
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
        nodes[startNode].forEach(child => result.add(child));
    }

    if (reverseNodes[startNode]) {
        reverseNodes[startNode].forEach(parent => result.add(parent));
    }

    return Array.from(result).concat(startNode);
}

const selectedNodes = ref(null)
const selectedSource = ref(null);

function selectNode(node) {
    selectedNodes.value = findConnectedNodes(node.name);
    selectedSource.value = node.name;
}

function unselectNode() {
    selectedNodes.value = null;
    selectedSource.value = null;
}

const table = computed(() => {
    return mutableDataset.value.links.map(({ source, target, sourceColor, targetColor , value }) => {
        return {
            source,
            target,
            sourceColor,
            targetColor,
            value
        }
    });
});

function generateCsv() {
    nextTick(() => {
        const labels = table.value.map((el,i) => {
            return [
                [ el.source ],
                [ el.target ],
                [ el.value ]
            ]
        });

        const tableXls = [
            [ FINAL_CONFIG.value.style.chart.title.text ],
            [ FINAL_CONFIG.value.style.chart.title.subtitle.text ],
            [
                [ FINAL_CONFIG.value.table.columnNames.source ],
                [ FINAL_CONFIG.value.table.columnNames.target ],
                [ FINAL_CONFIG.value.table.columnNames.value ],
            ]
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({
            csvContent,
            title: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-flow'
        })
    })
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
                name: el.source
            },
            {
                color: el.targetColor,
                name: el.target
            },
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.nodes.labels.prefix,
                v: el.value,
                s: FINAL_CONFIG.value.style.chart.nodes.labels.suffix,
                r: FINAL_CONFIG.value.style.chart.nodes.labels.rounding
            })
        ]
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    }

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.source,
        FINAL_CONFIG.value.table.columnNames.target,
        FINAL_CONFIG.value.table.columnNames.value
    ];

    return {
        colNames,
        head,
        body,
        config
    }
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

defineExpose({
    getData,
    generateCsv,
    generateImage,
    generatePdf,
    toggleTable,
    toggleAnnotator
})
</script>

<template>
    <div
        ref="flowChart"
        :class="`vue-ui-flow ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${!FINAL_CONFIG.style.chart.title.text ? 'padding-top:36px' : ''};background:${FINAL_CONFIG.style.chart.backgroundColor}`" 
        :id="`flow_${uid}`"
    >
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="flowChart"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'flow-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'flow-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="flowChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleAnnotator="toggleAnnotator"
        >
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
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg
            :xmlns="XMLNS"
            :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />
            
            <defs>
                <linearGradient 
                    v-for="(grad, i) in mutableDataset.links"
                    :id="grad.id"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                >
                    <stop offset="0%" :stop-color="grad.sourceColor"/>
                    <stop offset="100%" :stop-color="grad.targetColor"/>
                </linearGradient>
            </defs>

            <path 
                v-for="path in mutableDataset.links" 
                class="vue-ui-flow-link"
                :d="path.path" 
                :fill="`url(#${path.id})`" 
                :stroke="FINAL_CONFIG.style.chart.links.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.links.strokeWidth"
                :style="`opacity:${selectedSource ? [path.target, path.source].includes(selectedSource) ? 1 : 0.3 : FINAL_CONFIG.style.chart.links.opacity}`"
            />

            <rect 
                v-for="(node, i) in mutableDataset.nodes"
                class="vue-ui-flow-node"
                :x="node.x"
                :y="checkNaN(node.absoluteY)"
                :height="checkNaN(node.height)"
                :width="nodeWidth"
                :fill="node.color"
                :stroke="FINAL_CONFIG.style.chart.nodes.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.nodes.strokeWidth"
                @mouseenter="selectNode(node)"
                @mouseleave="unselectNode()"
                :style="`opacity:${selectedNodes ? selectedNodes.includes(node.name) ? 1 : 0.2 : 1}`"
            />

            <text 
                v-for="(node, i) in mutableDataset.nodes"
                :x="node.x + nodeWidth / 2"
                :y="checkNaN(node.absoluteY + node.height / 2 - (FINAL_CONFIG.style.chart.nodes.labels.fontSize / 4))"
                :font-size="FINAL_CONFIG.style.chart.nodes.labels.fontSize"
                :fill="adaptColorToBackground(node.color)"
                text-anchor="middle"
                :style="`pointer-events: none; opacity:${selectedNodes ? selectedNodes.includes(node.name) ? 1 : 0 : 1}`"
            >
                {{ FINAL_CONFIG.style.chart.nodes.labels.abbreviation.use ? abbreviate({ source: node.name, length: FINAL_CONFIG.style.chart.nodes.labels.abbreviation.length}) : node.name }}
            </text>
            <text 
                v-for="(node, i) in mutableDataset.nodes"
                :x="node.x + nodeWidth / 2"
                :y="checkNaN(node.absoluteY + node.height / 2 + (FINAL_CONFIG.style.chart.nodes.labels.fontSize))"
                :font-size="FINAL_CONFIG.style.chart.nodes.labels.fontSize"
                :fill="adaptColorToBackground(node.color)"
                text-anchor="middle"
                :style="`pointer-events: none; opacity:${selectedNodes ? selectedNodes.includes(node.name) ? 1 : 0 : 1}`"
            >
                {{ applyDataLabel(
                    FINAL_CONFIG.style.chart.nodes.labels.formatter,
                    node.value,
                    dataLabel({
                        p: FINAL_CONFIG.style.chart.nodes.labels.prefix,
                        v: node.value,
                        s: FINAL_CONFIG.style.chart.nodes.labels.suffix,
                        r: FINAL_CONFIG.style.chart.nodes.labels.rounding
                    }),
                    { datapoint: node, seriesIndex: i }
                    )
                }}
            </text>

            <slot name="svg" :svg="drawingArea"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'flow',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                }
            }"
        />

        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            }
        }">
            <template #content>            
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
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
.vue-ui-flow *{
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
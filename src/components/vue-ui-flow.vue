<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import { 
    XMLNS, 
    abbreviate, 
    adaptColorToBackground, 
    convertCustomPalette, 
    createCsvContent, 
    createUid, 
    dataLabel, 
    downloadCsv, 
    error, 
    objectIsEmpty, 
    palette, 
    themePalettes,
} from "../lib";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Accordion from "./vue-ui-accordion.vue";
import pdf from "../pdf";
import img from "../img";

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
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiFlow',
            type: 'dataset'
        })
    }
});

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_flow);
const isPrinting = ref(false);
const isImaging = ref(false);
const flowChart = ref(null);
const step = ref(0);

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const flowConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
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
});

const customPalette = computed(() => {
    return convertCustomPalette(flowConfig.value.customPalette)
});

const gap = computed(() => {
    return flowConfig.value.style.chart.nodes.gap;
});

const nodeWidth = computed(() => {
    return flowConfig.value.style.chart.nodes.width;
});

const mutableConfig = ref({
    showTable: flowConfig.value.table.show
});

const unitWidth = computed(() => {
    return flowConfig.value.style.chart.links.width;
});

const max = computed(() => {
    const nodes = {};

    function addNode(node) {
        if (!nodes[node]) {
            nodes[node] = { inflow: 0, outflow: 0 };
        }
    }

    props.dataset.forEach(([source, target, value]) => {
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
    return val / max.value * 100 + flowConfig.value.style.chart.nodes.minHeight;
}

function getValueFromHeight(height) {
    const minHeight = flowConfig.value.style.chart.nodes.minHeight;
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
                x: parseInt(level, 10) * unitWidth.value + flowConfig.value.style.chart.padding.left,
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

                const sourceLinkY1 = sourceY;
                const sourceLinkY2 = sourceY + (value / nodes[node].outflow) * sourceCoord.height;
                const targetLinkY1 = targetY;
                const targetLinkY2 = targetY + (value / nodes[target].inflow) * targetCoord.height;

                const link = {
                    id: createUid(),
                    source: node,
                    target: target,
                    path: `M ${sourceCoord.x + nodeWidth.value} ${sourceLinkY1} L ${sourceCoord.x + nodeWidth.value} ${sourceLinkY2} L ${targetCoord.x} ${targetLinkY2} L ${targetCoord.x} ${targetLinkY1} Z`,
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
    const { top: p_top, right: p_right, left: p_left, bottom: p_bottom } = flowConfig.value.style.chart.padding;
    const width = props.dataset.length * unitWidth.value;
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

    props.dataset.forEach(([source, target, value]) => {
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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`flow_${uid.value}`),
            fileName: flowConfig.value.style.chart.title.text || 'vue-ui-flow'
        }).finally(() => {
            isPrinting.value = false;
        });
    }, 100)
}

function showSpinnerImage() {
    isImaging.value = true;
}

function generateImage() {
    showSpinnerImage();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        img({
            domElement: document.getElementById(`flow_${uid.value}`),
            fileName: flowConfig.value.style.chart.title.text || 'vue-ui-flow',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
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
            [ flowConfig.value.style.chart.title.text ],
            [ flowConfig.value.style.chart.title.subtitle.text ],
            [
                [ flowConfig.value.table.columnNames.source ],
                [ flowConfig.value.table.columnNames.target ],
                [ flowConfig.value.table.columnNames.value ],
            ]
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({
            csvContent,
            title: flowConfig.value.style.chart.title.text || 'vue-ui-flow'
        })
    })
}

const dataTable = computed(() => {
    const head = [
        flowConfig.value.table.columnNames.source,
        flowConfig.value.table.columnNames.target,
        flowConfig.value.table.columnNames.value,
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
                p: flowConfig.value.style.chart.nodes.labels.prefix,
                v: el.value,
                s: flowConfig.value.style.chart.nodes.labels.suffix,
                r: flowConfig.value.style.chart.nodes.labels.rounding
            })
        ]
    });

    const config = {
        th: {
            backgroundColor: flowConfig.value.table.th.backgroundColor,
            color: flowConfig.value.table.th.color,
            outline: flowConfig.value.table.th.outline
        },
        td: {
            backgroundColor: flowConfig.value.table.td.backgroundColor,
            color: flowConfig.value.table.td.color,
            outline: flowConfig.value.table.td.outline
        },
        breakpoint: flowConfig.value.table.responsiveBreakpoint
    }

    const colNames = [
        flowConfig.value.table.columnNames.source,
        flowConfig.value.table.columnNames.target,
        flowConfig.value.table.columnNames.value
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

defineExpose({
    getData,
    generateCsv,
    generateImage,
    generatePdf
})

</script>

<template>
    <div
        ref="flowChart"
        :class="`vue-ui-flow ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        :style="`font-family:${flowConfig.style.fontFamily};width:100%; text-align:center;${!flowConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${flowConfig.style.chart.backgroundColor}`" 
        :id="`flow_${uid}`"
    >

        <div v-if="flowConfig.style.chart.title.text" :style="`width:100%;background:${flowConfig.style.chart.backgroundColor};padding-bottom:24px`">
            <Title
                :config="{
                    title: {
                        cy: 'flow-title',
                        text: flowConfig.style.chart.title.text,
                        color: flowConfig.style.chart.title.color,
                        fontSize: flowConfig.style.chart.title.fontSize,
                        bold: flowConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'flow-subtitle',
                        text: flowConfig.style.chart.title.subtitle.text,
                        color: flowConfig.style.chart.title.subtitle.color,
                        fontSize: flowConfig.style.chart.title.subtitle.fontSize,
                        bold: flowConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="flowConfig.userOptions.show && isDataset"
            :backgroundColor="flowConfig.style.chart.backgroundColor"
            :color="flowConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            hasImg
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="flowChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
        />

        <svg
            :xmlns="XMLNS"
            :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :style="`max-width:100%; overflow: visible; background:${flowConfig.style.chart.backgroundColor};color:${flowConfig.style.chart.color}`"
        >
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
                :stroke="flowConfig.style.chart.links.stroke"
                :stroke-width="flowConfig.style.chart.links.strokeWidth"
                :style="`opacity:${selectedSource ? [path.target, path.source].includes(selectedSource) ? 1 : 0.3 : flowConfig.style.chart.links.opacity}`"
            />

            <rect 
                v-for="(node, i) in mutableDataset.nodes"
                class="vue-ui-flow-node"
                :x="node.x"
                :y="node.absoluteY"
                :height="node.height"
                :width="nodeWidth"
                :fill="node.color"
                :stroke="flowConfig.style.chart.nodes.stroke"
                :stroke-width="flowConfig.style.chart.nodes.strokeWidth"
                @mouseenter="selectNode(node)"
                @mouseleave="unselectNode()"
                :style="`opacity:${selectedNodes ? selectedNodes.includes(node.name) ? 1 : 0.2 : 1}`"
            />

            <text 
                v-for="(node, i) in mutableDataset.nodes"
                :x="node.x + nodeWidth / 2"
                :y="node.absoluteY + node.height / 2 - (flowConfig.style.chart.nodes.labels.fontSize / 4)"
                :font-size="flowConfig.style.chart.nodes.labels.fontSize"
                :fill="adaptColorToBackground(node.color)"
                text-anchor="middle"
                :style="`pointer-events: none; opacity:${selectedNodes ? selectedNodes.includes(node.name) ? 1 : 0 : 1}`"
            >
                {{ flowConfig.style.chart.nodes.labels.abbreviation.use ? abbreviate({ source: node.name, length: flowConfig.style.chart.nodes.labels.abbreviation.length}) : node.name }}
            </text>
            <text 
                v-for="(node, i) in mutableDataset.nodes"
                :x="node.x + nodeWidth / 2"
                :y="node.absoluteY + node.height / 2 + (flowConfig.style.chart.nodes.labels.fontSize)"
                :font-size="flowConfig.style.chart.nodes.labels.fontSize"
                :fill="adaptColorToBackground(node.color)"
                text-anchor="middle"
                :style="`pointer-events: none; opacity:${selectedNodes ? selectedNodes.includes(node.name) ? 1 : 0 : 1}`"
            >
                {{ dataLabel({
                    p: flowConfig.style.chart.nodes.labels.prefix,
                    v: node.value,
                    s: flowConfig.style.chart.nodes.labels.suffix,
                    r: flowConfig.style.chart.nodes.labels.rounding
                }) }}
            </text>

            <slot name="svg" :svg="drawingArea"/>
        </svg>

        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: flowConfig.style.chart.backgroundColor,
                color: flowConfig.style.chart.color
            },
            head: {
                backgroundColor: flowConfig.style.chart.backgroundColor,
                color: flowConfig.style.chart.color
            }
        }">
            <template #content>            
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${flowConfig.style.chart.title.text}${flowConfig.style.chart.title.subtitle.text ? ` : ${flowConfig.style.chart.title.subtitle.text}` : ''}`"
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
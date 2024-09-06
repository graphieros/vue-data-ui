<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
    convertCustomPalette,
    createCsvContent, 
    createPolygonPath, 
    createUid, 
    downloadCsv,
    error,
    functionReturnsString,
    isFunction, 
    lightenHexColor, 
    objectIsEmpty,
    palette,
    themePalettes,
    XMLNS
} from '../lib';
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Tooltip from "../atoms/Tooltip.vue";
import RecursiveCircles from "../atoms/RecursiveCircles.vue";
import RecursiveLinks from "../atoms/RecursiveLinks.vue";
import RecursiveLabels from "../atoms/RecursiveLabels.vue";
import BaseDirectionPad from "../atoms/BaseDirectionPad.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";

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
    },
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(() => {
    if(objectIsEmpty(props.dataset)){
        error({
            componentName: 'VueUiMolecule',
            type: 'dataset'
        })
    }
})

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_molecule);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const moleculeChart = ref(null);
const zoomedId = ref(null);
const isZoom = ref(false);
const zoomReference = ref(null);
const selectedNode = ref(null);
const step = ref(0);

const moleculeConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_molecule[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `cluster_${uid.value}`,
    fileName: moleculeConfig.value.style.chart.title.text || 'vue-ui-molecule'
});

const customPalette = computed(() => {
    return convertCustomPalette(moleculeConfig.value.customPalette);
})

const mutableConfig = ref({
    showTable: moleculeConfig.value.table.show,
    showDataLabels: true,
    showTooltip: moleculeConfig.value.style.chart.tooltip.show
});

function calculateDepth(data, depth = 0) {
    if (Array.isArray(data) && data.length > 0 && data[0].nodes) {
        return calculateDepth(data[0].nodes, depth + 1);
    }
    return depth;
}

function sizeSvg() {
    const depth = calculateDepth(props.dataset);
    let initSize = 100;
    let vbSize = initSize;

    for (let i = 0; i < depth; i += 1) {
        initSize /= 1;
        vbSize += initSize;
    }

    return {
        height: vbSize,
        width: vbSize,
    }
}

const svg = ref(sizeSvg());
const dynamicViewBox = ref(`0 0 ${svg.value.width} ${svg.value.height}`)

function processNodes(
    data,
    center = { x: -svg.value.width / 2.43, y: svg.value.height / 2 },
    radius = svg.value.width / 1.1,
    circleRadius = 24,
    rotation = 0,
    paletteIndex = 0,
    rootColor = "#BBBBBB"
) {

    if (data && data.length > 0) {
        const polygonPath = createPolygonPath({
            plot: center,
            radius,
            sides: data.length,
            rotation,
        });

        data.forEach((node, index) => {
            const childCenter = polygonPath.coordinates[index];
            let color;

            if (!node.ancestor) {
                color = rootColor;
            } else if (!node.ancestor.ancestor) {
                color = customPalette.value[paletteIndex] || palette[paletteIndex] || rootColor;
                paletteIndex += 1;
            } else {
                color = node.ancestor.color || rootColor;
            }

            node.polygonPath = {
                coordinates: [childCenter],
            };

            node.circleRadius = circleRadius;
            node.color = color;
            node.uid = createUid();

            if (node.nodes && node.nodes.length > 0) {
                const nestedPaletteIndex = !node.ancestor || !node.ancestor.ancestor ? paletteIndex : 0;
                node.nodes = processNodes(
                    node.nodes,
                    childCenter,
                    radius / 2.9,
                    circleRadius / 2.2,
                    rotation + (Math.PI * index) / node.nodes.length,
                    nestedPaletteIndex,
                    color
                );
            }
        });
    }
    return data;
}

function generateGradientIDs(data) {
    const uniqueColors = new Set();
    function extractUniqueColors(nodes) {
        nodes.forEach((node) => {
            if (node.color && !uniqueColors.has(node.color)) {
                uniqueColors.add(node.color);
            }
            if (node.nodes && node.nodes.length > 0) {
                extractUniqueColors(node.nodes);
            }
        });
    }
    extractUniqueColors(data);

    const gradientIDs = {};
    Array.from(uniqueColors).forEach((color, index) => {
        gradientIDs[color] = `gradient_${index}`;
    });

    return gradientIDs;
}

const gradientIds = computed(() => {
    return generateGradientIDs(convertedDataset.value)
})

const convertedDataset = computed(() => {
    return processNodes(props.dataset);
})

function restoreViewBox() {
    isZoom.value = false;
    zoomedId.value = null;
    selectedNode.value = null;
    zoomReference.value = null;
    zoomOnNode({
        polygonPath: {
            coordinates: [{x: svg.value.width / 2, y: svg.value.height / 2}]
        },
        circleRadius: 24,
    })
}

const currentAnimationFrame = ref(null);


function zoomOnNode(node) {
    moleculeChart.value.focus();

    nextTick(() => {
        if (currentAnimationFrame.value) {
            cancelAnimationFrame(currentAnimationFrame.value);
        }
        const vb = dynamicViewBox.value.split(' ');
        const startX = parseFloat(vb[0]);
        const startY = parseFloat(vb[1]);
        const startWidth = parseFloat(vb[2]);
        const startHeight = parseFloat(vb[3]);
        const { x, y } = node.polygonPath.coordinates[0];
        const { circleRadius } = node;
        const sizer = 8.34;
        const targetX = x - circleRadius * sizer;
        const targetY = y - circleRadius * sizer;
        const targetWidth = circleRadius * sizer * 2;
        const targetHeight = circleRadius * sizer * 2;
    
        const distance = Math.sqrt((targetX - startX) ** 2 + (targetY - startY) ** 2);
        const numSteps = Math.min(1200, Math.max(20, Math.floor(distance / 10)));
        const stepX = (targetX - startX) / numSteps;
        const stepY = (targetY - startY) / numSteps;
        const stepWidth = (targetWidth - startWidth) / numSteps;
        const stepHeight = (targetHeight - startHeight) / numSteps;
        let currentStep = 0;
    
        function animateZoom() {
            dynamicViewBox.value = `${startX + stepX * currentStep} ${startY + stepY * currentStep} ${startWidth + stepWidth * currentStep} ${startHeight + stepHeight * currentStep}`;
            currentStep += moleculeConfig.value.style.chart.zoom.speed;
    
            if (currentStep <= numSteps) {
                currentAnimationFrame.value = requestAnimationFrame(animateZoom);
            }
            
        }
        animateZoom();
    })
}

function zoom(node) {
    if(zoomedId.value === node.uid) {
        restoreViewBox();

    } else {
        zoomedId.value = node.uid;
        selectedNode.value = node;
        zoomReference.value = {
            circleRadius: node.circleRadius,
            polygonPath: {
                coordinates: [{ x: node.polygonPath.coordinates[0].x, y: node.polygonPath.coordinates[0].y }]
            }
        }
        zoomOnNode(node)
        isZoom.value = node.uid !== convertedDataset.value[0].uid
    }
}

function unzoom(event) {
    if(event.target.nodeName !== 'circle') {
        restoreViewBox();
        isZoom.value = false;
    } else {
        return;
    }
}

const dataTooltipSlot = ref(null);

function createTooltipContent(node) {

    dataTooltipSlot.value = {
        datapoint: node,
        seriesIndex: -1,
        series: convertedDataset.value,
        config: moleculeConfig.value
    }

    const customFormat = moleculeConfig.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: -1,
            datapoint: node,
            series: convertedDataset.value,
            config: moleculeConfig.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: -1, // well, ok
            datapoint: node,
            series: convertedDataset.value,
            config: moleculeConfig.value
        })
    } else {
        let html = "";
    
        html += `<div style="display:flex;align-items:center;gap:3px"><div style="color:${node.color}">⬤</div><div>${node.name}</div></div>`;
        if(node.details) {
            html += `<div style="width:100%;border-top:1px solid ${moleculeConfig.value.style.chart.tooltip.borderColor};margin-top: 2px">${node.details}</div>`
        }
    
        tooltipContent.value = `<div style="font-family:inherit">${html}</div>`;
    }
}

const hoveredNode = ref(null);
const hoveredUid = ref(null);

function hover(node) {
    hoveredNode.value = node;
    if(node) {
        isTooltip.value = true;
        createTooltipContent(node);
        hoveredUid.value = node.uid;
    } else {
        isTooltip.value = false;
        tooltipContent.value = "";
        hoveredUid.value = null;
    }
}

function move(direction) {
    if(direction === "right") {
        zoomReference.value.polygonPath.coordinates[0].x += zoomReference.value.circleRadius;
    }
    if(direction === "left") {
        zoomReference.value.polygonPath.coordinates[0].x -= zoomReference.value.circleRadius;
    }
    if(direction === "top") {
        zoomReference.value.polygonPath.coordinates[0].y -= zoomReference.value.circleRadius;
    }
    if(direction === "bottom") {
        zoomReference.value.polygonPath.coordinates[0].y += zoomReference.value.circleRadius;
    }
    zoomOnNode(zoomReference.value);
}

function convertDatasetToCSVFormat(dataset) {
    const flattenedData = [];

    function traverseNodes(nodes) {
        nodes.forEach((node) => {
        const data = {
            'name': node.name,
            'details': node.details || '-',
            'ancestor': node.ancestor ? node.ancestor.name || '-' : '-',
            'color': node.color || ''
        };

        flattenedData.push(data);

        if (node.nodes && node.nodes.length > 0) {
            traverseNodes(node.nodes, node.name);
        }
        });
    }

    traverseNodes(dataset);
    return flattenedData;
}

const convertedTableData = computed(() => {
    return convertDatasetToCSVFormat(convertedDataset.value)
});

const dataTable = computed(() => {
    const head = [
        moleculeConfig.value.table.translations.nodeName,
        moleculeConfig.value.table.translations.details,
        moleculeConfig.value.table.translations.ancestor,
    ];

    const body = convertedTableData.value.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            h.details,
            h.ancestor || ""
        ]
    });

    const config = {
        th: {
            backgroundColor: moleculeConfig.value.table.th.backgroundColor,
            color: moleculeConfig.value.table.th.color,
            outline: moleculeConfig.value.table.th.outline
        },
        td: {
            backgroundColor: moleculeConfig.value.table.td.backgroundColor,
            color: moleculeConfig.value.table.td.color,
            outline: moleculeConfig.value.table.td.outline
        },
        breakpoint: moleculeConfig.value.table.responsiveBreakpoint
    }

    const colNames = [
        moleculeConfig.value.table.translations.nodeName,
        moleculeConfig.value.table.translations.details,
        moleculeConfig.value.table.translations.ancestor
    ]

    return {
        head,
        body,
        config,
        colNames
    }
});


function generateCsv() {
    nextTick(() => {
        const labels = dataTable.value.body.map((b, i) => {
            return [[b[0].name],[b[1]],[b[2]]]
        })
        const tableXls = [[moleculeConfig.value.style.chart.title.text],[moleculeConfig.value.style.chart.title.subtitle.text],[[...dataTable.value.head]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: moleculeConfig.value.style.chart.title.text || "vue-ui-molecule" })
    });
}

function getData() {
    return convertedDataset.value
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleLabels() {
    mutableConfig.value.showDataLabels = !mutableConfig.value.showDataLabels;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip
});

</script>

<template>
    <div
        @mouseleave="hoveredNode = null; hoveredUid = null"
        ref="moleculeChart"
        :class="`vue-ui-molecule ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        :style="`font-family:${moleculeConfig.style.fontFamily};width:100%; text-align:center;background:${moleculeConfig.style.chart.backgroundColor}`"
        :id="`cluster_${uid}`">

        <div v-if="moleculeConfig.style.chart.title.text" :style="`width:100%;background:${moleculeConfig.style.chart.backgroundColor};`">
            <Title
                :config="{
                    title: {
                        cy: 'molecule-div-title',
                        ...moleculeConfig.style.chart.title
                    },
                    subtitle: {
                        cy: 'molecule-div-subtitle',
                        ...moleculeConfig.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="moleculeConfig.userOptions.show && isDataset"
            :backgroundColor="moleculeConfig.style.chart.backgroundColor"
            :color="moleculeConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="moleculeConfig.userOptions.buttons.tooltip && moleculeConfig.style.chart.tooltip.show"
            :hasPdf="moleculeConfig.userOptions.buttons.pdf"
            :hasXls="moleculeConfig.userOptions.buttons.csv"
            :hasImg="moleculeConfig.userOptions.buttons.img"
            :hasTable="moleculeConfig.userOptions.buttons.table"
            :hasLabel="moleculeConfig.userOptions.buttons.labels"
            :hasFullscreen="moleculeConfig.userOptions.buttons.fullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...moleculeConfig.userOptions.buttonTitles }"
            :chartElement="moleculeChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
            @toggleTooltip="toggleTooltip"
        >
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
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
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <svg :xmlns="XMLNS" v-if="isDataset" data-cy="cluster-svg" :viewBox="dynamicViewBox"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :style="`overflow: hidden; background:${moleculeConfig.style.chart.backgroundColor};color:${moleculeConfig.style.chart.color}`" @click.stop="unzoom($event)">

            <defs>
                <radialGradient v-for="color in Object.keys(gradientIds)" :id="`gradient_${color}`" cx="50%" cy="30%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="lightenHexColor(color, 0.5)"/>
                    <stop offset="100%" :stop-color="color"/>
                
                </radialGradient>
            </defs>

            <RecursiveLinks 
                :dataset="convertedDataset" 
                :color="moleculeConfig.style.chart.links.stroke"
                :backgroundColor="moleculeConfig.style.chart.backgroundColor"
            />

            <RecursiveCircles 
                :dataset="convertedDataset" 
                :hoveredUid="hoveredUid"
                :stroke="moleculeConfig.style.chart.nodes.stroke"
                :strokeHovered="moleculeConfig.style.chart.nodes.strokeHovered"
                @zoom="zoom" 
                @hover="hover" 
            />
            <RecursiveLabels
                v-if="mutableConfig.showDataLabels"
                :dataset="convertedDataset"
                :color="moleculeConfig.style.chart.color" 
                :hoveredUid="hoveredUid"
            />
            <slot name="svg" :svg="svg"/>
        </svg>

        <BaseDirectionPad 
            v-if="isZoom"
            :key="`direction_pad_${step}`"
            :color="moleculeConfig.style.chart.color"
            :isFullscreen="isFullscreen"
            @moveLeft="move('left')"
            @moveRight="move('right')"
            @moveTop="move('top')"
            @moveBottom="move('bottom')"
            @reset="restoreViewBox(); isZoom = false"
        />

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'molecule',
                style: {
                    backgroundColor: moleculeConfig.style.chart.backgroundColor,
                    molecule: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="moleculeConfig.style.chart.tooltip.backgroundColor"
            :color="moleculeConfig.style.chart.tooltip.color"
            :borderRadius="moleculeConfig.style.chart.tooltip.borderRadius"
            :borderColor="moleculeConfig.style.chart.tooltip.borderColor"
            :borderWidth="moleculeConfig.style.chart.tooltip.borderWidth"
            :fontSize="moleculeConfig.style.chart.tooltip.fontSize"
            :parent="moleculeChart"
            :content="tooltipContent"
            :isCustom="moleculeConfig.style.chart.tooltip.customFormat && typeof moleculeConfig.style.chart.tooltip.customFormat === 'function'"
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
                backgroundColor: moleculeConfig.style.chart.backgroundColor,
                color: moleculeConfig.style.chart.color,
            },
            head: {
                backgroundColor: moleculeConfig.style.chart.backgroundColor,
                color: moleculeConfig.style.chart.color,
            }
        }">
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${moleculeConfig.style.chart.title.text}${moleculeConfig.style.chart.title.subtitle.text ? ` : ${moleculeConfig.style.chart.title.subtitle.text}` : ''}`"
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

.vue-ui-molecule *{
    transition: unset;
}
.vue-ui-molecule {
    user-select: none;
    position: relative;
}
</style>
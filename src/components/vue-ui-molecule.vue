<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
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
} from '../lib';
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Tooltip from "../atoms/Tooltip.vue";
import RecursiveCircles from "../atoms/RecursiveCircles.vue";
import RecursiveLinks from "../atoms/RecursiveLinks.vue";
import RecursiveLabels from "../atoms/RecursiveLabels.vue";
import BaseDirectionPad from "../atoms/BaseDirectionPad.vue";
import Skeleton from "./vue-ui-skeleton.vue";

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
const isPrinting = ref(false);
const isImaging = ref(false);
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
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    showTable: moleculeConfig.value.table.show,
    showDataLabels: true
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

            if (!node.parentNode) {
                color = rootColor;
            } else if (!node.parentNode.parentNode) {
                color = palette[paletteIndex] || rootColor;
                paletteIndex += 1;
            } else {
                color = node.parentNode.color || rootColor;
            }

            node.polygonPath = {
                coordinates: [childCenter],
            };

            node.circleRadius = circleRadius;
            node.color = color;
            node.uid = createUid();

            if (node.nodes && node.nodes.length > 0) {
                const nestedPaletteIndex = !node.parentNode || !node.parentNode.parentNode ? paletteIndex : 0;
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
            html += `<div style="width:100%;border-top:1px solid #e1e5e8;margin-top: 2px">${node.details}</div>`
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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`cluster_${uid.value}`),
            fileName: moleculeConfig.value.style.chart.title.text || 'vue-ui-molecule'
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
            domElement: document.getElementById(`cluster_${uid.value}`),
            fileName: moleculeConfig.value.style.chart.title.text || 'vue-ui-molecule',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function convertDatasetToCSVFormat(dataset) {
    const flattenedData = [];

    function traverseNodes(nodes) {
        nodes.forEach((node) => {
        const data = {
            'name': node.name,
            'details': node.details || '-',
            'parentNode': node.parentNode ? node.parentNode.name || '-' : '-',
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
        moleculeConfig.value.table.translations.parentNode,
    ];

    const body = convertedTableData.value.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            h.details,
            h.parentNode || ""
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
        moleculeConfig.value.table.translations.parentNode
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

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage
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
                        text: moleculeConfig.style.chart.title.text,
                        color: moleculeConfig.style.chart.title.color,
                        fontSize: moleculeConfig.style.chart.title.fontSize,
                        bold: moleculeConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'molecule-div-subtitle',
                        text: moleculeConfig.style.chart.title.subtitle.text,
                        color: moleculeConfig.style.chart.title.subtitle.color,
                        fontSize: moleculeConfig.style.chart.title.subtitle.fontSize,
                        bold: moleculeConfig.style.chart.title.subtitle.bold
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
            :title="moleculeConfig.userOptions.title"
            :uid="uid"
            hasImg
            hasTable
            hasLabel
            hasFullscreen
            :chartElement="moleculeChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
            @toggleLabels="mutableConfig.showDataLabels = !mutableConfig.showDataLabels"
        />

        <svg v-if="isDataset" data-cy="cluster-svg" :viewBox="dynamicViewBox"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :style="`overflow: hidden; background:${moleculeConfig.style.chart.backgroundColor};color:${moleculeConfig.style.chart.color}`" @click="unzoom($event)">

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
            :show="moleculeConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="moleculeConfig.style.chart.tooltip.backgroundColor"
            :color="moleculeConfig.style.chart.tooltip.color"
            :parent="moleculeChart"
            :content="tooltipContent"
            :isCustom="moleculeConfig.style.chart.tooltip.customFormat && typeof moleculeConfig.style.chart.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>
        
        <div :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:48px`" v-if="mutableConfig.showTable">
            <DataTable
                :colNames="dataTable.colNames"
                :head="dataTable.head" 
                :body="dataTable.body"
                :config="dataTable.config"
                :title="`${moleculeConfig.style.chart.title.text}${moleculeConfig.style.chart.title.subtitle.text ? ` : ${moleculeConfig.style.chart.title.subtitle.text}` : ''}`"
            >
                <template #th="{th}">
                    <div v-html="th" style="display:flex;align-items:center"></div>
                </template>
                <template #td="{td}">
                    {{ td.name || td }}
                </template>
            </DataTable>
        </div>
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
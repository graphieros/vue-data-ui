<script setup>
import { ref, computed, nextTick, onMounted, watch, defineAsyncComponent } from "vue";
import { 
    convertColorToHex,
    convertCustomPalette,
    createCsvContent, 
    createPolygonPath, 
    createUid,
    deepClone,
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
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import usePanZoom from "../usePanZoom";
import themes from "../themes.json";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const RecursiveCircles = defineAsyncComponent(() => import('../atoms/RecursiveCircles.vue'));
const RecursiveLabels = defineAsyncComponent(() => import('../atoms/RecursiveLabels.vue'));
const RecursiveLinks = defineAsyncComponent(() => import('../atoms/RecursiveLinks.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const Title = defineAsyncComponent(() => import('../atoms/Title.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_molecule: DEFAULT_CONFIG } = useConfig();

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

const emit = defineEmits(['selectNode']);

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(() => {
    prepareChart()
})

function prepareChart() {
    if(objectIsEmpty(props.dataset)){
        error({
            componentName: 'VueUiMolecule',
            type: 'dataset'
        })
    }
}

const uid = ref(createUid());
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const moleculeChart = ref(null);
const step = ref(0);
const titleStep = ref(0);
const tableStep = ref(0);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
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
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `cluster_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-molecule',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showDataLabels: true,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
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
    rootColor = "#BBBBBB",
    depth = 0
) {
    if (!Array.isArray(data) || data.length === 0) return data;

    const polygonPath = createPolygonPath({
        plot:   center,
        radius,
        sides:  data.length,
        rotation
    });

    data.forEach((node, idx) => {
        const childCenter = polygonPath.coordinates[idx];

        const converted = node.color
        ? (() => {
            let h = convertColorToHex(node.color);
            return h.startsWith("#") ? h : `#${h}`;
            })()
        : null;

        let finalColor;
        if (converted) {
            finalColor = converted;
        } else if (depth === 0) {
            finalColor = rootColor;
        } else if (depth === 1) {
            finalColor = (
                customPalette.value[paletteIndex] ||
                palette[paletteIndex]      ||
                rootColor
            );
            paletteIndex += 1;
        } else {
            finalColor = rootColor;
        }

        node.polygonPath = { coordinates: [childCenter] };
        node.circleRadius = circleRadius;
        node.color = finalColor;
        node.uid = createUid();

        if (Array.isArray(node.nodes) && node.nodes.length) {
            node.nodes = processNodes(
                node.nodes,
                childCenter,
                radius      / 2.9,
                circleRadius/ 2.2,
                rotation    + (Math.PI * idx) / node.nodes.length,
                paletteIndex,
                finalColor,
                depth + 1
            );
        }
    });

    return data;
}

function generateGradientIDs(data) {
    const colors = new Set();

    function recurse(nodes) {
        nodes.forEach(node => {
        if (!node.color) return;

        let hex = node.color;
        if (!/^#?[0-9A-F]{6}$/i.test(hex)) {
            hex = convertColorToHex(hex);
        }
        if (!hex.startsWith("#")) hex = `#${hex}`;

        colors.add(hex);

        if (Array.isArray(node.nodes) && node.nodes.length) {
            recurse(node.nodes);
        }
        });
    }
    recurse(data);

    const gradientIDs = {};
    Array.from(colors).forEach(col => {
        const safe = col.slice(1);       
        gradientIDs[col] = `gradient_${safe}`;
    });

    return gradientIDs;
}

const gradientIds = computed(() => {
    return generateGradientIDs(convertedDataset.value)
})

const convertedDataset = computed(() => {
    const dataCopy = deepClone(props.dataset);
    return processNodes(dataCopy);
})

const dataTooltipSlot = ref(null);

function createTooltipContent(node) {

    dataTooltipSlot.value = {
        datapoint: node,
        seriesIndex: -1,
        series: convertedDataset.value,
        config: FINAL_CONFIG.value
    }

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: -1,
            datapoint: node,
            series: convertedDataset.value,
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: -1, // well, ok
            datapoint: node,
            series: convertedDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        let html = "";
    
        html += `<div style="display:flex;align-items:center;gap:3px"><div style="color:${node.color}">⬤</div><div>${node.name}</div></div>`;
        if(node.details) {
            html += `<div style="width:100%;border-top:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};margin-top: 2px">${node.details}</div>`
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
        FINAL_CONFIG.value.table.translations.nodeName,
        FINAL_CONFIG.value.table.translations.details,
        FINAL_CONFIG.value.table.translations.ancestor,
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
        FINAL_CONFIG.value.table.translations.nodeName,
        FINAL_CONFIG.value.table.translations.details,
        FINAL_CONFIG.value.table.translations.ancestor
    ]

    return {
        head,
        body,
        config,
        colNames
    }
});


function generateCsv(callback=null) {
    nextTick(() => {
        const labels = dataTable.value.body.map((b, i) => {
            return [[b[0].name],[b[1]],[b[2]]]
        })
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[...dataTable.value.head]]].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if(!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-molecule" })
        } else {
            callback(csvContent);
        }
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

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const active = computed(() => !isAnnotator.value)

const { viewBox, resetZoom, isZoom } = usePanZoom(svgRef, {
    x: 0,
    y: 0,
    width: svg.value.width <= 0 ? 10 : svg.value.width,
    height: svg.value.height <= 0 ? 10 : svg.value.height,
}, FINAL_CONFIG.value.style.chart.zoom.speed, active)

function selectNode(node) {
    emit('selectNode', node)
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator
});

</script>

<template>
    <div
        ref="moleculeChart"
        :class="`vue-ui-molecule ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        :id="`cluster_${uid}`"
        @mouseleave="hoveredNode = null; hoveredUid = null; setUserOptionsVisibility(false)"
        @mouseenter="() => setUserOptionsVisibility(true)"
    >

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'molecule-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'molecule-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="moleculeChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
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
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
            v-if="isDataset" 
            data-cy="cluster-svg" 
            :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :style="`overflow: hidden; background:transparent;color:${FINAL_CONFIG.style.chart.color}`" 
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <defs>
                <radialGradient v-for="color in Object.keys(gradientIds)" :id="`gradient_${color}`" cx="50%" cy="30%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="lightenHexColor(color, 0.5)"/>
                    <stop offset="100%" :stop-color="color"/>
                
                </radialGradient>
            </defs>

            <RecursiveLinks 
                :dataset="convertedDataset" 
                :color="FINAL_CONFIG.style.chart.links.stroke"
                :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            />

            <RecursiveCircles 
                :dataset="convertedDataset" 
                :hoveredUid="hoveredUid"
                :stroke="FINAL_CONFIG.style.chart.nodes.stroke"
                :strokeHovered="FINAL_CONFIG.style.chart.nodes.strokeHovered"
                @click="selectNode"
                @hover="hover" 
            >
                <template #node="{ node }">
                    <slot name="node" v-bind="{ node }"/>
                </template>
            </RecursiveCircles>
            <RecursiveLabels
                v-if="mutableConfig.showDataLabels"
                :dataset="convertedDataset"
                :color="FINAL_CONFIG.style.chart.color" 
                :hoveredUid="hoveredUid"
            />
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="isZoom" data-dom-to-png-ignore class="reset-wrapper">
            <slot name="reset-action" :reset="resetZoom">
                <button 
                    data-cy-reset 
                    tabindex="0" 
                    role="button" 
                    class="vue-data-ui-refresh-button"
                    :style="{
                        background: FINAL_CONFIG.style.chart.backgroundColor
                    }"
                    @click="resetZoom(true)">
                    <BaseIcon name="refresh" :stroke="FINAL_CONFIG.style.chart.color" />
                </button>
            </slot>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'molecule',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    molecule: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="moleculeChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.style.chart.tooltip.customFormat && typeof FINAL_CONFIG.style.chart.tooltip.customFormat === 'function'"
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
            }
        }">
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
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

.vue-ui-molecule *{
    transition: unset;
}
.vue-ui-molecule {
    user-select: none;
    position: relative;
}

.reset-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    height: 40px;
    position: absolute;
    bottom: 12px;
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
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    transform-origin: center;
    &:focus {
        outline: 1px solid v-bind(slicerColor);
    }
    &:hover {
        transform: rotate(-90deg)
    }
}
</style>
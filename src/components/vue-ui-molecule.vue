<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onMounted, 
    ref, 
    toRefs, 
    watch, 
} from "vue";
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
    treeShake,
    XMLNS
} from '../lib';
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useNestedProp } from "../useNestedProp";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import img from "../img";
import themes from "../themes.json";
import usePanZoom from "../usePanZoom";
import BaseScanner from "../atoms/BaseScanner.vue";

const Title = defineAsyncComponent(() => import('../atoms/Title.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const RecursiveLinks = defineAsyncComponent(() => import('../atoms/RecursiveLinks.vue'));
const RecursiveLabels = defineAsyncComponent(() => import('../atoms/RecursiveLabels.vue'));
const RecursiveCircles = defineAsyncComponent(() => import('../atoms/RecursiveCircles.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

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

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)){
        error({
            componentName: 'VueUiMolecule',
            type: 'dataset',
            debug: debug.value
        });
    }
}

const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref("");
const moleculeChart = ref(null);
const step = ref(0);
const titleStep = ref(0);
const tableStep = ref(0);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        {
            name: '_',
            color: '#CACACA',
            nodes: [
                { name: '_', color: '#CACACA', nodes: [
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
            ]},
                { name: '_', color: '#CACACA', nodes: [
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},

            ]},
                { name: '_', color: '#CACACA', nodes: [
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
            ]},
                { name: '_', color: '#CACACA', nodes: [
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
            ]},
                { name: '_', color: '#CACACA', nodes: [
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
            ]},
                { name: '_', color: '#CACACA', nodes: [
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
                { name: '_', color: '#CACACA'},
            ]},
            ]
        }
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false, },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    nodes: { stroke: '#6A6A6A' },
                    links: { stroke: '#6A6A6A80'}
                }
            }
        }
    })
})

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

const layoutEpoch = ref(0);
const bumpLayout = () => { layoutEpoch.value += 1; };

watch([() => loading.value, () => FINAL_DATASET.value], async ([isLoading]) => {
  if (!isLoading) {
    await nextTick();
    svg.value = sizeSvg();
    await nextTick();
    bumpLayout();
    await nextTick();
    setInitialViewBox({x: 0, y: 0, width: 400, height: 400});
    resetZoom(false);
  }
}, { flush: "post", deep: false });

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

watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showDataLabels: true,
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
    }
}, { immediate: true });

function calculateDepth(data, depth = 0) {
    if (Array.isArray(data) && data.length > 0 && data[0].nodes) {
        return calculateDepth(data[0].nodes, depth + 1);
    }
    return depth;
}

function sizeSvg() {
    const depth = calculateDepth(FINAL_DATASET.value);
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
    const dataCopy = deepClone(FINAL_DATASET.value);
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
const lastHoveredNode = ref(null);

function hover(node) {
    lastHoveredNode.value = hoveredNode.value;
    hoveredNode.value = node;

    if (!node) {
        if (FINAL_CONFIG.value.events.datapointLeave) {
            FINAL_CONFIG.value.events.datapointLeave({ datapoint: lastHoveredNode.value || hoveredNode.value, seriesIndex: -1 })
        }
    } else {
        if (FINAL_CONFIG.value.events.datapointEnter) {
            FINAL_CONFIG.value.events.datapointEnter({ datapoint: node, seriesIndex: -1 })
        }
    }


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

const { viewBox, resetZoom, isZoom, setInitialViewBox } = usePanZoom(svgRef, {
    x: 0,
    y: 0,
    width: Math.max(10, svg.value.width),
    height: Math.max(10, svg.value.height),
}, FINAL_CONFIG.value.style.chart.zoom.speed, active)

function selectNode(node) {
    if (FINAL_CONFIG.value.events.datapointClick){
        FINAL_CONFIG.value.events.datapointClick({ datapoint: node, seriesIndex: -1 })
    }
    emit('selectNode', node)
}

async function getImage({ scale = 2} = {}) {
    if (!moleculeChart.value) return;
    const { width, height } = moleculeChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: moleculeChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: moleculeChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8)
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                }
            }
        }
    }
});

watch(() => mutableConfig.value.showTable, v => {
    if (FINAL_CONFIG.value.table.show) return;
    if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
        tableUnit.value.open()
    } else {
        if ('close' in tableUnit.value) {
            tableUnit.value.close()
        }
    }
});

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
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
            ref="userOptionsRef"
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
            :tableDialog="FINAL_CONFIG.table.useDialog"
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
            :key="`svg_${layoutEpoch}`"
            :xmlns="XMLNS" 
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
                v-if="mutableConfig.showDataLabels && !loading"
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
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
        </Tooltip>

        <component
            v-if="isDataset"
            :is="tableComponent.component"
            v-bind="tableComponent.props"
            ref="tableUnit"
            @close="closeTable"
        >
            <template #title v-if="FINAL_CONFIG.table.useDialog">
                {{ tableComponent.title }}
            </template>
            <template #actions v-if="FINAL_CONFIG.table.useDialog">
                <button tabindex="0" class="vue-ui-user-options-button" @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)">
                    <BaseIcon name="excel" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
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
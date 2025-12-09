<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onBeforeUnmount, 
    onMounted, 
    ref, 
    toRefs,
    watch, 
} from "vue";
import { 
    convertColorToHex, 
    createTSpansFromLineBreaksOnY, 
    createUid, 
    error, 
    objectIsEmpty, 
    treeShake, 
    XMLNS 
} from "../lib";
import { throttle } from "../canvas-lib";
import usePanZoom from "../usePanZoom";
import { useDag } from "../useDag";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport";
import { useNestedProp } from "../useNestedProp";
import { useThemeCheck } from "../useThemeCheck";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { useResponsive } from "../useResponsive";
import Title from "../atoms/Title.vue";
import themes from "../themes/vue_ui_dag.json";
import BaseScanner from "../atoms/BaseScanner.vue";
import BaseZoomControls from "../atoms/BaseZoomControls.vue";
import img from "../img";

const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_dag: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    dataset: {
        type: Object,
        default() {
            return {
                nodes: [],
                edges: []
            }
        }
    },
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const emit = defineEmits(['onNodeClick', 'onMidpointEnter', 'onMidpointLeave'])

const dagChart = ref(null);
const uid = ref(createUid());

const chartTitle = ref(null);
const source = ref(null);
const zoomControls = ref(null);
const titleStep = ref(0);
const step = ref(0);
const userHovers = ref(false);
const isDataset = ref(false);

const resizeObserver = ref(null);
const observedEl = ref(null);

const FINAL_CONFIG = ref(prepareConfig());
const WIDTH = ref(FINAL_CONFIG.value.style.chart.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.chart.height);

const tooltipPosition = ref({ x: 0, y: 0 }); // anchor (screen coords)
const tooltipEdge = ref(null);
const tooltipRef = ref(null);
const tooltipStyle = ref({ left: "0px", top: "0px" });
const tooltipPlacement = ref("top");

const isNodeTooltip = ref(false);
const nodeTooltipPosition = ref({ x: 0, y: 0 });
const nodeTooltipOffset = ref({ x: 0, y: 0 });
const nodeTooltipNode = ref(null);
const nodeTooltipRef = ref(null);
const nodeTooltipStyle = ref({ left: "0px", top: "0px" });
const nodeTooltipPlacement = ref("top");

const isTooltip = ref(false);
const isAnnotator = ref(false);

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });
const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const direction = ref(FINAL_CONFIG.value.style.chart.layout.rankDirection);

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: {
        nodes: [
            { id: 'A', label: '' },
            { id: 'B', label: '' },
            { id: 'C', label: '' },
        ],
        edges: [
            { from: 'A', to: 'B' },
            { from: 'A', to: 'C' },
        ]
    },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    nodes: {
                        stroke: '#CCCCCC',
                        backgroundColor: '#DDDDDD50'
                    },
                    edges: {
                        stroke: '#CCCCCC',
                    },
                    midpoints: {
                        stroke: '#CCCCCC',
                        fill: '#CCCCCC'
                    }
                }
            }
        }
    })
})

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused
    });

    return finalConfig;
}

const debug = computed(() => !!FINAL_CONFIG.value.debug);

onMounted(() => {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiDag',
            type: 'dataset',
            debug: debug.value
        });
        isDataset.value = false;
        manualLoading.value = true;
    }
    if(!props.dataset.nodes) {
        error({
            componentName: 'VueUiDag',
            type: 'datasetAttributeEmpty',
            property: 'nodes',
            index: 0,
            debug: debug.value,
        });
        isDataset.value = false;
        manualLoading.value = true;
    }
    isDataset.value = true;

    setupResponsive();
});

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    titleStep.value += 1;
    direction.value = FINAL_CONFIG.value.style.chart.layout.rankDirection;
    WIDTH.value = FINAL_CONFIG.value.style.chart.width;
    HEIGHT.value = FINAL_CONFIG.value.style.chart.height;
    panZoomActive.value = FINAL_CONFIG.value.style.chart.zoom.active;
    setupResponsive();
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `dag_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-dag',
    options: FINAL_CONFIG.value.userOptions.print
});

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: undefined,
    legendItems: undefined,
    backgroundColor: svgBg
})

async function generateSvg({ isCb }) {
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl })

    } else {
        exportSvg();
    }
}

function onChartEnter() {
    userHovers.value = true;
    setUserOptionsVisibility(true);
}

function onChartLeave() {
    setUserOptionsVisibility(false);
    userHovers.value = false;
}

function createTooltipPlacementUpdater({
    tooltipRef,
    isVisibleRef,
    anchorRef,
    styleRef,
    placementRef,
    offsetRef,
    margin = 24
}) {
    return function updateTooltipPlacement() {
        const el = tooltipRef.value;
        if (!el || !isVisibleRef.value) return;

        const rect = el.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        const anchorX = anchorRef.value.x;
        const anchorY = anchorRef.value.y;

        const offsetX = offsetRef?.value?.x ?? 0;
        const offsetY = offsetRef?.value?.y ?? 0;

        let top = anchorY - offsetY - rect.height - margin;
        let left = anchorX - rect.width / 2;
        let placement = "top";

        if (top < margin) {
            const candidateTop = anchorY + offsetY + margin;
            if (candidateTop + rect.height <= vh - margin) {
                top = candidateTop;
                placement = "bottom";
            } else {
                top = anchorY - rect.height / 2;
                if (top < margin) top = margin;
                if (top + rect.height > vh - margin) {
                    top = vh - rect.height - margin;
                }
                placement = "center";
            }
        }

        if (left < margin) left = margin;
        if (left + rect.width > vw - margin) {
            left = vw - rect.width - margin;
        }

        const overflowLeft = left <= margin;
        const overflowRight = left + rect.width >= vw - margin;

        if ((overflowLeft || overflowRight) && placement !== "center") {
            let horizPlacement;
            let horizLeft;

            const spaceLeft = anchorX - offsetX - margin;
            const spaceRight = vw - (anchorX + offsetX) - margin;

            if (spaceRight >= spaceLeft) {
                horizPlacement = "right";
                horizLeft = anchorX + offsetX + margin;
            } else {
                horizPlacement = "left";
                horizLeft = anchorX - offsetX - margin - rect.width;
            }

            if (
                horizLeft >= margin &&
                horizLeft + rect.width <= vw - margin
            ) {
                left = horizLeft;
                top = anchorY - rect.height / 2;
                if (top < margin) top = margin;
                if (top + rect.height > vh - margin) {
                    top = vh - rect.height - margin;
                }
                placement = horizPlacement;
            }
        }

        placementRef.value = placement;
        styleRef.value = {
            left: `${left}px`,
            top: `${top}px`
        };
    };
}

const initialNodes = computed(() => FINAL_DATASET.value.nodes.map(node => {
    return {
        ...node,
        backgroundColor: node.backgroundColor ? convertColorToHex(node.backgroundColor) : FINAL_CONFIG.value.style.chart.nodes.backgroundColor,
        color: node.color ? convertColorToHex(node.color) : FINAL_CONFIG.value.style.chart.nodes.labels.color
    }
}));

const initialEdges = computed(() => FINAL_DATASET.value.edges);

const dagConfiguration = computed(() => {
    return {
        ...FINAL_CONFIG.value.style.chart.layout,
        rankDirection: direction.value
    };
});

const { layoutData, lastError, arrowMarkerIdentifier } = useDag({
    nodes: initialNodes,
    edges: initialEdges,
    configuration: dagConfiguration
});

function getNodeById(id) {
    if (!layoutData.value) return null;
    return layoutData.value.nodes.find(node => node.id === id);
}

const edgeColors = computed(() => {
    if (!layoutData.value) return [];
    const defaultColor = FINAL_CONFIG.value.style.chart.edges.stroke;
    const colors = new Set();
    layoutData.value.edges.forEach(edge => {
        colors.add(edge.original?.color || defaultColor);
    });
    return Array.from(colors);
});

function makeMarkerId(color) {
    return `${arrowMarkerIdentifier}-${String(color).replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

const userViewBox = computed(() => {
    const widthRaw = WIDTH.value;
    const heightRaw = HEIGHT.value;

    const width = Number(widthRaw);
    const height = Number(heightRaw);

    const hasWidth = Number.isFinite(width) && width > 0;
    const hasHeight = Number.isFinite(height) && height > 0;

    if (!hasWidth && !hasHeight) {
        return null;
    }

    return {
        width: hasWidth ? width : null,
        height: hasHeight ? height : null
    };
});

const highlightedNodeId = ref(null);
const panZoomActive = ref(FINAL_CONFIG.value.style.chart.zoom.active);

const {
    viewBox: panZoomViewBox,
    resetZoom,
    setInitialViewBox,
    scale,
    zoomByFactor,
} = usePanZoom(
        svgRef,
        { x: 0, y: 0, width: 100, height: 100 },
        1,
        panZoomActive,
        () => { isNodeTooltip.value = false; }
    );

function toggleZoom() {
    panZoomActive.value = !panZoomActive.value;
}

function updateInitialViewBoxFromLayout() {
    const layoutViewBox = layoutData.value && layoutData.value.viewBox;
    if (!layoutViewBox) return;

    const parts = String(layoutViewBox).split(" ").map(Number);
    if (parts.length !== 4) return;

    const [layoutX, layoutY, layoutWidth, layoutHeight] = parts;

    if (
        !Number.isFinite(layoutX) ||
        !Number.isFinite(layoutY) ||
        !Number.isFinite(layoutWidth) ||
        !Number.isFinite(layoutHeight)
    ) {
        return;
    }

    let targetWidth = layoutWidth;
    let targetHeight = layoutHeight;
    let targetX = layoutX;
    let targetY = layoutY;

    const userVb = userViewBox.value;
    if (userVb) {
        if (userVb.width !== null) {
            targetWidth = userVb.width;
        }
        if (userVb.height !== null) {
            targetHeight = userVb.height;
        }

        // Center layout
        targetX = layoutX - (targetWidth - layoutWidth) / 2;
        targetY = layoutY - (targetHeight - layoutHeight) / 2;
    }

    setInitialViewBox(
        { x: targetX, y: targetY, width: targetWidth, height: targetHeight },
        { overwriteCurrentIfNotZoomed: true }
    );
}

watch(
    () => layoutData.value && layoutData.value.viewBox,
    () => {
        updateInitialViewBoxFromLayout();
    },
    { immediate: true }
);

watch(
    () => userViewBox.value,
    () => {
        updateInitialViewBoxFromLayout();
    }
);

watch(() => isAnnotator.value, (isActive) => {
    panZoomActive.value = !isActive;
})

const svgViewBox = computed(() => {
    const vb = panZoomViewBox.value;
    if (!vb) {
        return "0 0 0 0";
    }
    return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const zoomStepFactor = 1.5;

function zoomIn() {
    zoomByFactor(zoomStepFactor, true);
}

function zoomOut() {
    zoomByFactor(1 / zoomStepFactor, true);
}

const directions = ["TB", "RL", "BT", "LR"];

function switchDirection() {
    direction.value = directions[(directions.indexOf(direction.value) + 1) % directions.length];
    resetZoom();
}

const updateTooltipPlacement = createTooltipPlacementUpdater({
    tooltipRef,
    isVisibleRef: isTooltip,
    anchorRef: tooltipPosition,
    styleRef: tooltipStyle,
    placementRef: tooltipPlacement,
    isNode: false
});

const updateNodeTooltipPlacement = createTooltipPlacementUpdater({
    tooltipRef: nodeTooltipRef,
    isVisibleRef: isNodeTooltip,
    anchorRef: nodeTooltipPosition,
    styleRef: nodeTooltipStyle,
    placementRef: nodeTooltipPlacement,
    offsetRef: nodeTooltipOffset
});

async function showMidpointTooltip(edge) {
    emit('onMidpointEnter', edge);
    const svg = svgRef.value;
    if (!svg || !edge?.midpoint) return;

    const pt = svg.createSVGPoint();
    pt.x = edge.midpoint.x;
    pt.y = edge.midpoint.y;

    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const screenPoint = pt.matrixTransform(ctm);

    tooltipPosition.value = {
        x: screenPoint.x,
        y: screenPoint.y
    };

    tooltipEdge.value = edge;
    isTooltip.value = true;

    await nextTick();
    updateTooltipPlacement();
}

function hideMidpointTooltip() {
    isTooltip.value = false;
    tooltipEdge.value = null;
    emit('onMidpointLeave');
}

async function showNodeTooltip(node) {
    emit('onNodeClick', node);
    if (!FINAL_CONFIG.value.style.chart.nodes.tooltip.showOnClick) return;

    const svg = svgRef.value;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = node.x;
    pt.y = node.y;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;

    const screenPoint = pt.matrixTransform(ctm);
    const nodeWidthSvg = FINAL_CONFIG.value.style.chart.layout.nodeWidth;
    const nodeHeightSvg = FINAL_CONFIG.value.style.chart.layout.nodeHeight;

    const scaleX = ctm.a;
    const scaleY = ctm.d;

    const nodeWidthPx = nodeWidthSvg * scaleX;
    const nodeHeightPx = nodeHeightSvg * scaleY;

    nodeTooltipOffset.value = {
        x: nodeWidthPx / 2,
        y: nodeHeightPx / 2
    };

    nodeTooltipPosition.value = {
        x: screenPoint.x,
        y: screenPoint.y
    };

    nodeTooltipNode.value = node;
    isNodeTooltip.value = true;

    await nextTick();
    updateNodeTooltipPlacement();
}

function hideNodeTooltip() {
    isNodeTooltip.value = false;
    nodeTooltipNode.value = null;
}

function handleDocumentClick(event) {
    if (!isNodeTooltip.value) return;

    const tooltipEl = nodeTooltipRef.value;
    if (tooltipEl && tooltipEl.contains(event.target)) {
        return;
    }

    const svgEl = svgRef.value;
    if (svgEl && svgEl.contains(event.target)) {
        const nodeGroup = event.target.closest(".vue-ui-dag-node");
        if (nodeGroup) {
            return;
        }
    }

    hideNodeTooltip();
}

function handleDocumentKeydown(event) {
    if (event.key === "Escape" && isNodeTooltip.value) {
        hideNodeTooltip();
    }
}

onMounted(() => {
    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleDocumentKeydown);
});

onBeforeUnmount(() => {
    document.removeEventListener("mousedown", handleDocumentClick);
    document.removeEventListener("keydown", handleDocumentKeydown);

    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

function setupResponsive() {
    if (!FINAL_CONFIG.value.responsive) {
        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
            resizeObserver.value = null;
            observedEl.value = null;
        }
        return;
    }

    const handleResize = throttle(() => {
        if (!dagChart.value) return;

        const { width, height } = useResponsive({
            chart: dagChart.value,
            title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
            legend: FINAL_CONFIG.value.style.chart.controls.show ? zoomControls.value.$el : null,
            source: source.value
        });

        requestAnimationFrame(() => {
            WIDTH.value = Math.max(0.1, width);
            HEIGHT.value = Math.max(0.1, height - 12);
        });
    });

    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }

    resizeObserver.value = new ResizeObserver(handleResize);
    observedEl.value = dagChart.value ? dagChart.value.parentNode : null;
    if (observedEl.value) {
        resizeObserver.value.observe(observedEl.value);
    }

    handleResize();
}

async function getImage({ scale = 2} = {}) {
    if (!dagChart.value) return
    const { width, height } = dagChart.value.getBoundingClientRect()
    const aspectRatio = width / height
    const { imageUri, base64 } = await img({ domElement: dagChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text ?? 'vue-ui-dag', 
        width, 
        height, 
        aspectRatio 
    }
}

function getData() {
    return layoutData.value;
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateSvg,
    generateImage,
    toggleAnnotator,
    toggleFullscreen,
    zoomIn,
    zoomOut,
    resetZoom,
    switchDirection
})
</script>


<template>
    <div 
        :class="`vue-data-ui-component vue-ui-dag ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.responsive ? 'vue-ui-dag-responsive' : ''}`" 
        :id="`dag_${uid}`"
        ref="dagChart"
        :style="{
            fontFamily: FINAL_CONFIG.style.fontFamily,
            backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
            padding: '0.5rem',
        }"
        @mouseenter="onChartEnter" 
        @mouseleave="onChartLeave"
    >
        <div v-if="lastError" class="dag-chart-error">
            {{ String(lastError) }}
        </div>

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close"/>
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }"/>
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }"/>
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }"/>
            </template>
        </PenAndPaper>

        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="false"
            :hasTable="false"
            :hasXls="false"
            :hasLabel="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="dagChart"
            :position="FINAL_CONFIG.userOptions.position"
            :titles="{...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :hasZoom="FINAL_CONFIG.userOptions.buttons.zoom"
            :isZoom="panZoomActive"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @generateSvg="generateSvg"
            @toggleAnnotator="toggleAnnotator"
            @toggleZoom="toggleZoom"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
            <template v-if="$slots.optionZoom" #optionZoom="{ toggleZoom, isZoomLocked }">
                <slot name="optionZoom" v-bind="{ toggleZoom , isZoomLocked }"/>
            </template>
        </UserOptions>

        <!-- TITLE -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'dag-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'dag-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <BaseZoomControls
            ref="zoomControls"
            v-if="FINAL_CONFIG.style.chart.controls.position === 'top' && !loading && FINAL_CONFIG.style.chart.controls.show"
            :config="FINAL_CONFIG"
            :scale="scale"
            :isFullscreen="isFullscreen"
            withDirection
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="() => resetZoom(true)"
            @switchDirection="switchDirection"
        />

        <svg 
            v-if="layoutData" 
            ref="svgRef"
            :class="{'vue-ui-dag-svg': true, 'vue-data-ui-loading': loading }" 
            :viewBox="svgViewBox"
            :xmlns="XMLNS"
            :style="{
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                height: '100%',
                width: '100%'
            }"
        >
            <PackageVersion />

            <!-- Arrow marker. Hidden when arrowShape is "undirected". -->
            <defs v-if="layoutData.arrowShape !== 'undirected'">
                <template v-for="color in edgeColors" :key="color">
                    <marker
                        :id="makeMarkerId(color)"
                        :markerWidth="layoutData.arrowSize"
                        :markerHeight="layoutData.arrowSize"
                        :refX="layoutData.arrowSize - 1"
                        :refY="layoutData.arrowSize / 2"
                        orient="auto"
                        markerUnits="strokeWidth"
                    >
                        <!-- `normal` arrow -->
                        <path
                            v-if="layoutData.arrowShape === 'normal'"
                            :d="`M 0 0 L ${layoutData.arrowSize} ${layoutData.arrowSize/2} L 0 ${layoutData.arrowSize} Z`"
                            :fill="color"
                            :stroke="color"
                            stroke-width="0"
                        />

                        <!-- `vee` arrow -->
                        <path
                            v-else
                            :d="`M 0 0 L ${layoutData.arrowSize} ${layoutData.arrowSize/2} L 0 ${layoutData.arrowSize} L ${layoutData.arrowSize / 3} ${layoutData.arrowSize / 2} Z`"
                            :fill="color"
                            :stroke="color"
                            stroke-width="0"
                        />
                    </marker>
                </template>
            </defs>


            <!-- Edges -->
            <g class="vue-ui-dag-edges">
                <template v-for="edge in layoutData.edges" :key="edge.id">
                    <path
                        data-cy-edge
                        :d="edge.pathData" 
                        fill="none" 
                        :stroke="edge.original.color ?? FINAL_CONFIG.style.chart.edges.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.edges.strokeWidth * ((edge.from === highlightedNodeId || edge.id === tooltipEdge?.id) ? 2 : 1)" 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        style="pointer-events: none; transition: stroke-width 0.2s ease-in-out"
                    />
                    <circle
                        data-cy-midpoint
                        class="vue-ui-dag-edge-midpoint"
                        v-if="FINAL_CONFIG.style.chart.midpoints.show"
                        :cx="edge.midpoint.x"
                        :cy="edge.midpoint.y"
                        :r="FINAL_CONFIG.style.chart.midpoints.radius"
                        :fill="FINAL_CONFIG.style.chart.midpoints.fill"
                        :stroke="edge.original.color ?? FINAL_CONFIG.style.chart.midpoints.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.midpoints.strokeWidth * ((edge.from === highlightedNodeId || edge.id === tooltipEdge?.id) ? 2 : 1)"
                        style="transition: stroke-width 0.2s ease-in-out"
                        @mouseenter="showMidpointTooltip(edge)"
                        @mouseleave="hideMidpointTooltip"
                    />
                </template>
            </g>

            <!-- Nodes -->
            <g class="vue-ui-dag-nodes">
                <g 
                    v-for="node in layoutData.nodes" 
                    :key="node.id" 
                    class="vue-ui-dag-node"
                    @click.stop="FINAL_CONFIG.style.chart.nodes.tooltip.showOnClick && showNodeTooltip(node)"
                    @mouseenter="highlightedNodeId = node.id"
                    @mouseleave="highlightedNodeId = null"
                >
                    <template v-if="!$slots.node">
                        <rect
                            data-cy-node
                            :x="node.x - node.width / 2" 
                            :y="node.y - node.height / 2" 
                            :width="node.width"
                            :height="node.height" 
                            :rx="FINAL_CONFIG.style.chart.nodes.borderRadius"  
                            :fill="node.original.backgroundColor" 
                            :stroke="FINAL_CONFIG.style.chart.nodes.stroke" 
                            :stroke-width="FINAL_CONFIG.style.chart.nodes.strokeWidth"
                            :style="{
                                cursor: FINAL_CONFIG.style.chart.nodes.tooltip.showOnClick ? 'pointer' : 'default'
                            }"
                        />
                        <!-- with `node-label` slot -->
                        <text
                            v-if="$slots['node-label']"
                            :x="node.x" 
                            :y="node.y + FINAL_CONFIG.style.chart.nodes.labels.fontSize / 3" 
                            text-anchor="middle" 
                            :font-size="FINAL_CONFIG.style.chart.nodes.labels.fontSize"
                            :fill="node.original.color"
                            :font-weight="FINAL_CONFIG.style.chart.nodes.labels.bold ? 'bold' : 'normal'"
                        >
                            <slot name="node-label" v-bind="{ node }">
                                {{ node.label }}
                            </slot>
                        </text>

                        <!-- default label, multiline when provided with /n -->
                        <text 
                            data-cy-node-label
                            v-else
                            :x="node.x" 
                            :y="node.y + FINAL_CONFIG.style.chart.nodes.labels.fontSize / 3" 
                            text-anchor="middle" 
                            :font-size="FINAL_CONFIG.style.chart.nodes.labels.fontSize"
                            :fill="node.original.color"
                            :font-weight="FINAL_CONFIG.style.chart.nodes.labels.bold ? 'bold' : 'normal'"
                            v-html="createTSpansFromLineBreaksOnY({
                                content: node.label,
                                fontSize: FINAL_CONFIG.style.chart.nodes.labels.fontSize,
                                fontWeight: FINAL_CONFIG.style.chart.nodes.labels.bold ? 'bold' : 'normal',
                                fill:node.original.color,
                                x: node.x,
                                y: node.y,
                                autoOffset: true
                            })"
                        />
                    </template>

                    <!-- Full `node` slot to customize the node entirely using a div -->
                    <foreignObject 
                        v-if="$slots.node"
                        :x="node.x - node.width / 2"
                        :y="node.y - node.height / 2"
                        :width="node.width"
                        :height="node.height"
                    >
                        <slot name="node" v-bind="{ node }"/>
                    </foreignObject>
                </g>
            </g>

            <!-- Edge arrows -->
            <g class="vue-ui-dag-edges">
                <path 
                    v-for="edge in layoutData.edges" 
                    :key="edge.id" 
                    :d="edge.pathData" 
                    fill="none" 
                    stroke="transparent"
                    :stroke-width="FINAL_CONFIG.style.chart.edges.strokeWidth * ((edge.from === highlightedNodeId || edge.id === tooltipEdge?.id) ? 1.3 : 1)" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                    :marker-end="layoutData.arrowShape === 'undirected'
                        ? null
                        : `url(#${makeMarkerId(edge.original?.color || FINAL_CONFIG.style.chart.edges.stroke)})`"
                    style="pointer-events: none; transition: stroke-width 0.2s ease-in-out"
                />
            </g>

            <slot name="svg" :svg="{ 
                drawingArea: panZoomViewBox,
                data: layoutData
            }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <!-- Midpoint tooltip -->
        <Transition name="fade">
            <Teleport :to="isFullscreen ? dagChart : 'body'" v-if="isTooltip">
                <div
                    data-cy-tooltip-midpoint
                    ref="tooltipRef"
                    class="vue-ui-dag-tooltip"
                    :style="{
                        ...tooltipStyle,
                        maxWidth: FINAL_CONFIG.style.chart.midpoints.tooltip.maxWidth,
                        '--vue-data-ui-dag-tooltip-background': FINAL_CONFIG.style.chart.midpoints.tooltip.backgroundColor,
                        '--vue-data-ui-dag-tooltip-color': FINAL_CONFIG.style.chart.midpoints.tooltip.color
                    }"
                    :data-position="tooltipPlacement"
                >
                    <slot name="tooltip-midpoint" v-bind="{ edge: tooltipEdge, layoutData }">
                        <div v-if="tooltipEdge">
                            {{ getNodeById(tooltipEdge.from)?.label ?? tooltipEdge.from }} → {{ getNodeById(tooltipEdge.to)?.label ?? tooltipEdge.to }}
                        </div>
                    </slot>
                </div>
            </Teleport>
        </Transition>

        <!-- Node tooltip -->
        <Transition name="fade">
            <Teleport :to="isFullscreen ? dagChart : 'body'" v-if="isNodeTooltip">
                <div
                    data-cy-tooltip-node
                    ref="nodeTooltipRef"
                    class="vue-ui-dag-node-tooltip"
                    :style="{
                        maxWidth: FINAL_CONFIG.style.chart.nodes.tooltip.maxWidth,
                        left: nodeTooltipStyle.left,
                        top: nodeTooltipStyle.top,
                        '--vue-data-ui-dag-node-tooltip-background': FINAL_CONFIG.style.chart.nodes.tooltip.backgroundColor,
                        '--vue-data-ui-dag-node-tooltip-color': FINAL_CONFIG.style.chart.nodes.tooltip.color
                    }"
                    :data-position="nodeTooltipPlacement"
                >
                    <slot name="tooltip-node" v-bind="{ node: nodeTooltipNode, layoutData }">
                        <div v-if="nodeTooltipNode">
                            {{ nodeTooltipNode.label }}
                        </div>
                    </slot>
                </div>
            </Teleport>
        </Transition>

        <BaseZoomControls
            ref="zoomControls"
            v-if="FINAL_CONFIG.style.chart.controls.position === 'bottom' && !loading && FINAL_CONFIG.style.chart.controls.show"
            :config="FINAL_CONFIG"
            :scale="scale"
            :isFullscreen="isFullscreen"
            withDirection
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="() => resetZoom(true)"
            @switchDirection="switchDirection"
        />

        <!-- SOURCE -->
        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <BaseScanner v-if="loading"/>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-dag {
    overflow: hidden;
    position: relative;
}

.vue-ui-dag-responsive {
    width: 100%;
}

.dag-chart-error {
    color: #b00020;
    font-size: 13px;
    margin-bottom: 8px;
}

.vue-ui-dag-tooltip {
    position: fixed;
    pointer-events: none;
    background: var(--vue-data-ui-dag-tooltip-background, #E1E5E8);
    color: var(--vue-data-ui-dag-tooltip-color, #2D353C);
    box-shadow: 0 3px 6px -3px rgba(0,0,0,0.2);
    padding: 0.35rem 0.55rem;
    border-radius: 4px;
    font-size: 12px;
    z-index: 999999;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.vue-ui-dag-tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    border-style: solid;
}

.vue-ui-dag-tooltip[data-position="top"]::after {
    bottom: -8px;
    border-width: 8px 8px 0 8px;
    border-color: var(--vue-data-ui-dag-tooltip-background, #E1E5E8) transparent transparent transparent;
}

.vue-ui-dag-tooltip[data-position="bottom"]::after {
    top: -8px;
    border-width: 0 8px 8px 8px;
    border-color: transparent transparent var(--vue-data-ui-dag-tooltip-background, #E1E5E8) transparent;
}

.vue-ui-dag-tooltip[data-position="left"]::after {
    top: 50%;
    transform: translateY(-50%);
    left: 100%;
    border-width: 8px 0 8px 8px;
    border-color: transparent transparent transparent var(--vue-data-ui-dag-tooltip-background, #E1E5E8);
}

.vue-ui-dag-tooltip[data-position="right"]::after {
    top: 50%;
    transform: translateY(-50%);
    left: -8px;
    border-width: 8px 8px 8px 0;
    border-color: transparent var(--vue-data-ui-dag-tooltip-background, #E1E5E8) transparent transparent;
}

.vue-ui-dag-tooltip[data-position="center"]::after {
    display: none;
}

.vue-ui-dag-node-tooltip {
    position: fixed;
    pointer-events: auto;
    background: var(--vue-data-ui-dag-node-tooltip-background, #FFFFFF);
    color: var(--vue-data-ui-dag-node-tooltip-color, #2D353C);
    box-shadow: 0 3px 6px -3px rgba(0,0,0,0.2);
    padding: 0.5rem 0.75rem;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000000;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.vue-ui-dag-node-tooltip::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    border-style: solid;
}

.vue-ui-dag-node-tooltip[data-position="top"]::after {
    bottom: -8px;
    border-width: 8px 8px 0 8px;
    border-color: var(--vue-data-ui-dag-node-tooltip-background, #FFFFFF) transparent transparent transparent;
}

.vue-ui-dag-node-tooltip[data-position="bottom"]::after {
    top: -8px;
    border-width: 0 8px 8px 8px;
    border-color: transparent transparent var(--vue-data-ui-dag-node-tooltip-background, #FFFFFF) transparent;
}

.vue-ui-dag-node-tooltip[data-position="left"]::after {
    top: 50%;
    transform: translateY(-50%);
    left: 100%;
    border-width: 8px 0 8px 8px;
    border-color: transparent transparent transparent var(--vue-data-ui-dag-node-tooltip-background, #E1E5E8);
}

.vue-ui-dag-node-tooltip[data-position="right"]::after {
    top: 50%;
    left: -8px;
    right: auto;
    bottom: auto;
    transform: translateY(-50%);
    border-width: 8px 8px 8px 0;
    border-color: transparent var(--vue-data-ui-dag-node-tooltip-background, #FFFFFF) transparent transparent;
}

.vue-ui-dag-node-tooltip[data-position="center"]::after {
    display: none;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
import { createPanZoomAnnotationViewport } from '../utils/annotationViewport';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';

import { resolveChartConfig } from '../resolveChartConfig';
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from 'vue';
import {
    convertColorToHex,
    createTSpansFromLineBreaksOnY,
    createUid,
    easeInOutCubic,
    error,
    lerp,
    objectIsEmpty,
    treeShake,
    svgToClientCoords,
    XMLNS,
} from '../lib';
import usePanZoom from '../usePanZoom';
import { useDag } from '../useDag';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter';

import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { useResponsive } from '../useResponsive';
import img from '../img';
import Title from '../atoms/Title.vue';
import themes from '../themes/vue_ui_dag.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseZoomControls from '../atoms/BaseZoomControls.vue';

const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);

const { vue_ui_dag: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    dataset: {
        type: Object,
        default() {
            return {
                nodes: [],
                edges: [],
            };
        },
    },
    config: {
        type: Object,
        default() {
            return {};
        },
    },
});

const emit = defineEmits([
    'onNodeClick',
    'onMidpointEnter',
    'onMidpointLeave',
    'copyAlt',
    'rotate',
]);

const dagChart = ref(null);
const uid = ref(createUid());

const chartTitle = ref(null);
const source = ref(null);
const zoomControls = ref(null);
const titleStep = ref(0);
const step = ref(0);
let resizeObserver = null;
let resizeFrame = null;
let disposed = false;

const activeA11yItemId = ref(null);
const activeA11yItemType = ref(null); // "node" | "midpoint"
const isFocus = ref(false);

const resolvedConfig = computed(prepareConfig);
const isDataset = computed(() => {
    const ds = props.dataset;
    if (
        !Array.isArray(ds?.nodes) ||
        !ds.nodes.length ||
        (ds.edges != null && !Array.isArray(ds.edges))
    )
        return false;
    const ids = new Set();
    for (const node of ds.nodes) {
        if (
            node?.id == null ||
            !['string', 'number'].includes(typeof node.id) ||
            (typeof node.id === 'number' && !Number.isFinite(node.id)) ||
            ids.has(String(node.id))
        )
            return false;
        ids.add(String(node.id));
    }
    return (ds.edges || []).every(
        (edge) =>
            edge &&
            edge.from != null &&
            edge.to != null &&
            ids.has(String(edge.from)) &&
            ids.has(String(edge.to)),
    );
});
const loading = computed(
    () => !!resolvedConfig.value.loading || !isDataset.value,
);
const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    nodes: {
                        stroke: '#CCCCCC',
                        backgroundColor: '#DDDDDD50',
                    },
                    edges: {
                        stroke: '#CCCCCC',
                    },
                    midpoints: {
                        stroke: '#CCCCCC',
                        fill: '#CCCCCC',
                    },
                },
            },
        },
        userConfig: resolvedConfig.value.skeletonConfig ?? {},
    });
});

const FINAL_CONFIG = computed(() =>
    loading.value
        ? treeShake({
              defaultConfig: resolvedConfig.value,
              userConfig: skeletonConfig.value,
          })
        : resolvedConfig.value,
);
const cfgNodes = computed(() => FINAL_CONFIG.value.style.chart.nodes);
const cfgEdges = computed(() => FINAL_CONFIG.value.style.chart.edges);
const cfgMidpoints = computed(() => FINAL_CONFIG.value.style.chart.midpoints);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const WIDTH = ref(FINAL_CONFIG.value.style.chart.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.chart.height);

const tooltipPosition = ref({ x: 0, y: 0 }); // anchor (screen coords)
const tooltipEdgeId = ref(null);
const tooltipEdge = computed(
    () => edgeById.value.get(tooltipEdgeId.value) ?? null,
);
const tooltipRef = ref(null);
const tooltipStyle = ref({ left: '0px', top: '0px' });
const tooltipPlacement = ref('top');

const isNodeTooltip = ref(false);
const nodeTooltipPosition = ref({ x: 0, y: 0 });
const nodeTooltipOffset = ref({ x: 0, y: 0 });
const nodeTooltipId = ref(null);
const nodeTooltipNode = computed(() => getNodeById(nodeTooltipId.value));
const nodeTooltipRef = ref(null);
const nodeTooltipStyle = ref({ left: '0px', top: '0px' });
const nodeTooltipPlacement = ref('top');

const isTooltip = ref(false);
const isAnnotator = ref(false);

const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
});
const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const direction = ref(FINAL_CONFIG.value.style.chart.layout.rankDirection);

const defaultSkeletonDataset = {
    nodes: [
        { id: 'A', label: '' },
        { id: 'B', label: '' },
        { id: 'C', label: '' },
    ],
    edges: [
        { from: 'A', to: 'B' },
        { from: 'A', to: 'C' },
    ],
};
const FINAL_DATASET = computed(() =>
    loading.value
        ? (props.config?.skeletonDataset ?? defaultSkeletonDataset)
        : props.dataset,
);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiDag',
    rules: [COMMON_RULES.noHint],
});

function prepareConfig() {
    return resolveChartConfig(props.config, DEFAULT_CONFIG, themes);
}

const debug = computed(() => resolvedConfig.value.debug);
watch(
    [() => props.dataset, debug],
    ([dataset, enabled]) => {
        if (!enabled) return;
        if (objectIsEmpty(dataset)) {
            error({ componentName: 'VueUiDag', type: 'dataset' });
        }
        if (!Array.isArray(dataset?.nodes) || !dataset.nodes.length) {
            error({
                componentName: 'VueUiDag',
                type: 'datasetAttributeEmpty',
                property: 'nodes',
                index: 0,
            });
        } else if (!isDataset.value) {
            console.warn(
                'VueUiDag: provide unique node IDs and an edges array whose endpoints reference existing nodes.',
            );
        }
    },
    { deep: true, immediate: true },
);

onMounted(setupResponsive);
watch(
    () => props.config,
    () => {
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        titleStep.value += 1;
    },
    { deep: true },
);
watch(
    () => resolvedConfig.value.style.chart.layout.rankDirection,
    (value) => {
        direction.value = value;
    },
);
watch(
    () => resolvedConfig.value.style.chart.zoom.active,
    (value) => {
        zoomEnabled.value = value;
    },
);
watch(() => FINAL_CONFIG.value.responsive, setupResponsive, { flush: 'post' });
watch(
    cfgChart,
    () => {
        if (FINAL_CONFIG.value.responsive) scheduleResize();
        else {
            WIDTH.value = cfgChart.value.width;
            HEIGHT.value = cfgChart.value.height;
        }
    },
    { deep: true, flush: 'post' },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `dag_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-dag',
    options: FINAL_CONFIG.value.userOptions.print,
});

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: null,
        legendItems: null,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

function onChartEnter() {
    setUserOptionsVisibility(true);
}

function onChartLeave() {
    setUserOptionsVisibility(false);
}

function createTooltipPlacementUpdater({
    tooltipRef,
    isVisibleRef,
    anchorRef,
    styleRef,
    placementRef,
    offsetRef,
    margin = 24,
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
        let placement = 'top';

        if (top < margin) {
            const candidateTop = anchorY + offsetY + margin;
            if (candidateTop + rect.height <= vh - margin) {
                top = candidateTop;
                placement = 'bottom';
            } else {
                top = anchorY - rect.height / 2;
                if (top < margin) top = margin;
                if (top + rect.height > vh - margin) {
                    top = vh - rect.height - margin;
                }
                placement = 'center';
            }
        }

        if (left < margin) left = margin;
        if (left + rect.width > vw - margin) {
            left = vw - rect.width - margin;
        }

        const overflowLeft = left <= margin;
        const overflowRight = left + rect.width >= vw - margin;

        if ((overflowLeft || overflowRight) && placement !== 'center') {
            let horizPlacement;
            let horizLeft;

            const spaceLeft = anchorX - offsetX - margin;
            const spaceRight = vw - (anchorX + offsetX) - margin;

            if (spaceRight >= spaceLeft) {
                horizPlacement = 'right';
                horizLeft = anchorX + offsetX + margin;
            } else {
                horizPlacement = 'left';
                horizLeft = anchorX - offsetX - margin - rect.width;
            }

            if (horizLeft >= margin && horizLeft + rect.width <= vw - margin) {
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
            top: `${top}px`,
        };
    };
}

// Reuse equal geometry inputs so presentation changes do not run layout again.
function reuseGeometry(previous, next) {
    return previous && JSON.stringify(previous) === JSON.stringify(next)
        ? previous
        : next;
}
const initialNodes = computed((previous) =>
    reuseGeometry(
        previous,
        (FINAL_DATASET.value.nodes || []).map((node) => ({
            id: node.id,
            width: node.width,
            height: node.height,
        })),
    ),
);
const initialEdges = computed((previous) =>
    reuseGeometry(
        previous,
        (FINAL_DATASET.value.edges || []).map((edge) => ({
            from: edge.from,
            to: edge.to,
            ...(edge.weight !== undefined ? { weight: edge.weight } : {}),
            ...(edge.minLength !== undefined
                ? { minLength: edge.minLength }
                : {}),
        })),
    ),
);
const dagConfiguration = computed((previous) =>
    reuseGeometry(previous, {
        ...cfgChart.value.layout,
        rankDirection: direction.value,
    }),
);
const {
    layoutData: geometry,
    lastError,
    arrowMarkerIdentifier,
} = useDag({
    nodes: initialNodes,
    edges: initialEdges,
    configuration: dagConfiguration,
});
const layoutData = computed(() => {
    if (!geometry.value) return null;
    const nodes = new Map(
        (FINAL_DATASET.value.nodes || []).map((node) => [
            String(node.id),
            node,
        ]),
    );
    const edges = new Map();
    for (const edge of FINAL_DATASET.value.edges || []) {
        const key = JSON.stringify([String(edge.from), String(edge.to)]);
        if (!edges.has(key)) edges.set(key, edge);
    }
    return {
        ...geometry.value,
        nodes: geometry.value.nodes.map((node) => {
            const original = nodes.get(String(node.id)) ?? node.original;
            return {
                ...node,
                label: original.label,
                original: {
                    ...original,
                    backgroundColor: original.backgroundColor
                        ? convertColorToHex(original.backgroundColor)
                        : cfgNodes.value.backgroundColor,
                    color: original.color
                        ? convertColorToHex(original.color)
                        : cfgNodes.value.labels.color,
                },
            };
        }),
        edges: geometry.value.edges.map((edge) => ({
            ...edge,
            original: {
                ...edges.get(JSON.stringify([edge.from, edge.to])),
                ...edge.original,
            },
        })),
    };
});
const nodeById = computed(
    () =>
        new Map(
            (layoutData.value?.nodes || []).map((node) => [
                String(node.id),
                node,
            ]),
        ),
);
const edgeById = computed(
    () =>
        new Map((layoutData.value?.edges || []).map((edge) => [edge.id, edge])),
);
function getNodeById(id) {
    return id == null ? null : (nodeById.value.get(String(id)) ?? null);
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
        height: hasHeight ? height : null,
    };
});

const zoomEnabled = ref(cfgChart.value.zoom.active);
const panZoomActive = computed(() => zoomEnabled.value && !isAnnotator.value);

const {
    viewBox: panZoomViewBox,
    resetZoom: resetPanZoom,
    setInitialViewBox,
    scale,
    zoomByFactor,
} = usePanZoom(
    svgRef,
    { x: 0, y: 0, width: 100, height: 100 },
    1,
    panZoomActive,
    () => {
        cancelFocusAnimation();
        hideNodeTooltip();
        hideMidpointTooltip();
    },
);

let focusAnimationFrame = null;
let focusSequence = 0;
function cancelFocusAnimation() {
    focusSequence += 1;
    if (focusAnimationFrame !== null) cancelAnimationFrame(focusAnimationFrame);
    focusAnimationFrame = null;
}
function resetZoom(animated = false) {
    cancelFocusAnimation();
    resetPanZoom(animated);
}

async function focusOnNode(
    nodeId,
    { smooth = true, duration = 300, zoomReset = false, zoom = null } = {},
) {
    const node = getNodeById(nodeId);
    if (disposed || !node) return false;

    const currentViewBox = panZoomViewBox.value;
    if (!currentViewBox) return false;

    const startViewBox = {
        x: Number(currentViewBox.x),
        y: Number(currentViewBox.y),
        width: Number(currentViewBox.width),
        height: Number(currentViewBox.height),
    };

    const startScale = scale.value;

    let targetWidth = startViewBox.width;
    let targetHeight = startViewBox.height;
    let targetScale = startScale;

    if ((Number.isFinite(zoom) && zoom > 0) || zoomReset) {
        resetZoom(false);
        const resetViewBox = panZoomViewBox.value;
        const zoomLevel = Number.isFinite(zoom) && zoom > 0 ? zoom / 100 : 1;
        targetWidth = Number(resetViewBox.width) / zoomLevel;
        targetHeight = Number(resetViewBox.height) / zoomLevel;
        targetScale = zoomLevel;
        panZoomViewBox.value = { ...startViewBox };
        scale.value = startScale;
    }

    const nodeX = Number(node.x);
    const nodeY = Number(node.y);

    if (
        !Number.isFinite(startViewBox.x) ||
        !Number.isFinite(startViewBox.y) ||
        !Number.isFinite(startViewBox.width) ||
        !Number.isFinite(startViewBox.height) ||
        !Number.isFinite(targetWidth) ||
        !Number.isFinite(targetHeight) ||
        !Number.isFinite(nodeX) ||
        !Number.isFinite(nodeY)
    ) {
        return false;
    }

    const targetViewBox = {
        x: nodeX - targetWidth / 2,
        y: nodeY - targetHeight / 2,
        width: targetWidth,
        height: targetHeight,
    };

    cancelFocusAnimation();
    const sequence = focusSequence;

    isNodeTooltip.value = false;

    if (!smooth || !Number.isFinite(duration) || duration <= 0) {
        panZoomViewBox.value = targetViewBox;
        scale.value = targetScale;
        return true;
    }

    const startTime = performance.now();

    function animate(currentTime) {
        if (disposed || sequence !== focusSequence) return;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const easedProgress = easeInOutCubic(progress);
        panZoomViewBox.value = {
            x: lerp(startViewBox.x, targetViewBox.x, easedProgress),
            y: lerp(startViewBox.y, targetViewBox.y, easedProgress),
            width: lerp(startViewBox.width, targetViewBox.width, easedProgress),
            height: lerp(
                startViewBox.height,
                targetViewBox.height,
                easedProgress,
            ),
        };
        scale.value = lerp(startScale, targetScale, easedProgress);
        if (progress < 1) {
            focusAnimationFrame = requestAnimationFrame(animate);
        } else {
            panZoomViewBox.value = targetViewBox;
            scale.value = targetScale;
            focusAnimationFrame = null;
        }
    }
    focusAnimationFrame = requestAnimationFrame(animate);
    return true;
}

watch(geometry, cancelFocusAnimation);

function toggleZoom() {
    zoomEnabled.value = !zoomEnabled.value;
}

function updateInitialViewBoxFromLayout() {
    const layoutViewBox = layoutData.value && layoutData.value.viewBox;
    if (!layoutViewBox) return;

    const parts = String(layoutViewBox).split(' ').map(Number);
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
        { overwriteCurrentIfNotZoomed: true },
    );
}

watch(
    () => layoutData.value && layoutData.value.viewBox,
    () => {
        updateInitialViewBoxFromLayout();
    },
    { immediate: true },
);

watch(
    () => userViewBox.value,
    () => {
        updateInitialViewBoxFromLayout();
    },
);

const svgViewBox = computed(() => {
    const vb = panZoomViewBox.value;
    if (!vb) {
        return '0 0 0 0';
    }
    return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
});

const isFullscreen = ref(false);

// A wide or tall fullscreen SVG exposes space outside its nominal viewBox
// under xMidYMid meet. Cover that entire visible area with the pattern.
const backgroundViewport = ref({ width: 0, height: 0 });
watch(
    [svgRef, isFullscreen, () => cfgChart.value.backgroundPattern.show],
    ([svg, fullscreen, show], _, onCleanup) => {
        if (!svg || !fullscreen || !show) return;
        const measure = () => {
            const { width, height } = svg.getBoundingClientRect();
            if (
                width !== backgroundViewport.value.width ||
                height !== backgroundViewport.value.height
            ) {
                backgroundViewport.value = { width, height };
            }
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(svg);
        onCleanup(() => observer.disconnect());
    },
    { flush: 'post' },
);

const backgroundPatternBounds = computed(() => {
    const box = panZoomViewBox.value;
    if (!box || !isFullscreen.value) {
        return box;
    }

    const { width, height } = backgroundViewport.value;

    if (!(width > 0 && height > 0 && box.width > 0 && box.height > 0)) {
        return box;
    }

    const scale = Math.min(width / box.width, height / box.height);
    const visibleWidth = width / scale;
    const visibleHeight = height / scale;

    return {
        x: box.x - (visibleWidth - box.width) / 2,
        y: box.y - (visibleHeight - box.height) / 2,
        width: visibleWidth,
        height: visibleHeight,
    };
});

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const zoomStepFactor = 1.5;

function zoomIn() {
    cancelFocusAnimation();
    zoomByFactor(zoomStepFactor, true);
}

function zoomOut() {
    cancelFocusAnimation();
    zoomByFactor(1 / zoomStepFactor, true);
}

const directions = ['TB', 'RL', 'BT', 'LR'];

function switchDirection() {
    direction.value =
        directions[
            (directions.indexOf(direction.value) + 1) % directions.length
        ];
    resetZoom();
    emit('rotate', direction.value);
}

const updateTooltipPlacement = createTooltipPlacementUpdater({
    tooltipRef,
    isVisibleRef: isTooltip,
    anchorRef: tooltipPosition,
    styleRef: tooltipStyle,
    placementRef: tooltipPlacement,
});

const updateNodeTooltipPlacement = createTooltipPlacementUpdater({
    tooltipRef: nodeTooltipRef,
    isVisibleRef: isNodeTooltip,
    anchorRef: nodeTooltipPosition,
    styleRef: nodeTooltipStyle,
    placementRef: nodeTooltipPlacement,
    offsetRef: nodeTooltipOffset,
});

const hoveredEdgeId = ref(null);

async function showMidpointTooltip(edge) {
    emit('onMidpointEnter', edge);
    if (!edge?.midpoint || !svgRef.value) return;
    tooltipEdgeId.value = edge.id;
    isTooltip.value = true;

    if (cfgMidpoints.value.selectedEdge.animated === true) {
        hoveredEdgeId.value = edge.id;
    }

    await nextTick();
    refreshTooltipAnchors();
}

function hideMidpointTooltip() {
    isTooltip.value = false;
    tooltipEdgeId.value = null;
    emit('onMidpointLeave');

    if (cfgMidpoints.value.selectedEdge.animated === true) {
        hoveredEdgeId.value = null;
    }
}

async function showNodeTooltip(node) {
    emit('onNodeClick', node);
    if (!cfgNodes.value.tooltip.showOnClick) return;

    if (!svgRef.value) return;
    nodeTooltipId.value = node.id;
    isNodeTooltip.value = true;

    await nextTick();
    refreshTooltipAnchors();
}

function hideNodeTooltip() {
    isNodeTooltip.value = false;
    nodeTooltipId.value = null;
}

function refreshTooltipAnchors() {
    if (disposed) return;
    const svg = svgRef.value;
    if (!svg) return;
    if (isTooltip.value && tooltipEdge.value?.midpoint) {
        const point = tooltipEdge.value.midpoint;
        const anchor = svgToClientCoords(point.x, point.y, svg);
        if (anchor) tooltipPosition.value = anchor;
        updateTooltipPlacement();
    }
    if (isNodeTooltip.value && nodeTooltipNode.value) {
        const node = nodeTooltipNode.value;
        const anchor = svgToClientCoords(node.x, node.y, svg);
        if (anchor) nodeTooltipPosition.value = anchor;
        const ctm = svg.getScreenCTM?.();
        if (ctm)
            nodeTooltipOffset.value = {
                x: (node.width * Math.hypot(ctm.a, ctm.b || 0)) / 2,
                y: (node.height * Math.hypot(ctm.c || 0, ctm.d)) / 2,
            };
        updateNodeTooltipPlacement();
    }
}
watch(
    [layoutData, panZoomViewBox, loading],
    () => {
        if (
            isNodeTooltip.value &&
            (loading.value ||
                !cfgNodes.value.tooltip.showOnClick ||
                (nodeTooltipId.value != null && !nodeTooltipNode.value))
        )
            hideNodeTooltip();
        if (
            isTooltip.value &&
            (loading.value ||
                !cfgMidpoints.value.show ||
                (tooltipEdgeId.value != null && !tooltipEdge.value))
        )
            hideMidpointTooltip();
        if (
            activeA11yItemId.value != null &&
            !a11yItems.value.some(
                (item) =>
                    item.id === activeA11yItemId.value &&
                    item.type === activeA11yItemType.value,
            )
        )
            clearA11ySelection();
        refreshTooltipAnchors();
    },
    { deep: true, flush: 'post' },
);

function handleDocumentClick(event) {
    const hasOpenTooltip = isNodeTooltip.value || isTooltip.value;
    if (!hasOpenTooltip) return;

    const nodeTooltipElement = nodeTooltipRef.value;
    if (nodeTooltipElement && nodeTooltipElement.contains(event.target)) {
        return;
    }

    const midpointTooltipElement = tooltipRef.value;
    if (
        midpointTooltipElement &&
        midpointTooltipElement.contains(event.target)
    ) {
        return;
    }

    const svgElement = svgRef.value;
    if (svgElement && svgElement.contains(event.target)) {
        const nodeGroup = event.target.closest('.vue-ui-dag-node');
        const midpointElement = event.target.closest(
            '.vue-ui-dag-edge-midpoint',
        );

        if (nodeGroup || midpointElement) {
            return;
        }
    }

    hideNodeTooltip();
    hideMidpointTooltip();

    if (!isFocus.value) {
        clearA11ySelection();
    }
}

function handleDocumentKeydown(event) {
    if (event.key !== 'Escape') return;

    if (isNodeTooltip.value) {
        hideNodeTooltip();
    }

    if (isTooltip.value) {
        hideMidpointTooltip();
    }
}

onMounted(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    document.addEventListener('keydown', handleDocumentKeydown);
    window.addEventListener('scroll', refreshTooltipAnchors, true);
    window.addEventListener('resize', refreshTooltipAnchors);
});

onBeforeUnmount(() => {
    disposed = true;
    document.removeEventListener('mousedown', handleDocumentClick);
    document.removeEventListener('keydown', handleDocumentKeydown);
    window.removeEventListener('scroll', refreshTooltipAnchors, true);
    window.removeEventListener('resize', refreshTooltipAnchors);
    resizeObserver?.disconnect();
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    cancelFocusAnimation();
    clearTimeout(clearHoverTimer);
});

function resizeChart() {
    resizeFrame = null;
    if (
        disposed ||
        !FINAL_CONFIG.value.responsive ||
        !dagChart.value?.parentNode
    )
        return;
    const { width, height } = useResponsive({
        chart: dagChart.value,
        title: cfgChart.value.title.text ? chartTitle.value : null,
        legend: cfgChart.value.controls.show ? zoomControls.value?.$el : null,
        source: source.value,
    });
    WIDTH.value = Math.max(0.1, width);
    HEIGHT.value = Math.max(0.1, height - 12);
}
function scheduleResize() {
    if (!disposed && FINAL_CONFIG.value.responsive && resizeFrame === null)
        resizeFrame = requestAnimationFrame(resizeChart);
}
function setupResponsive() {
    resizeObserver?.disconnect();
    resizeObserver = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
    if (disposed) return;
    if (!FINAL_CONFIG.value.responsive) {
        WIDTH.value = cfgChart.value.width;
        HEIGHT.value = cfgChart.value.height;
        return;
    }
    if (dagChart.value?.parentNode) {
        resizeObserver = new ResizeObserver(scheduleResize);
        resizeObserver.observe(dagChart.value.parentNode);
        scheduleResize();
    }
}

function getIdealDashoffsetDelta(
    pathElement,
    { direction = -1, dasharray } = {},
) {
    if (!pathElement || typeof pathElement.getTotalLength !== 'function') {
        if (debug.value)
            console.warn(
                'VueUiDag @getIdealDashoffsetDelta: invalid path element',
                pathElement,
            );
        return 0;
    }
    const pathLength = pathElement.getTotalLength();
    const numbers = String(dasharray ?? '')
        .trim()
        .split(/[\s,]+/)
        .map((value) => Number.parseFloat(value))
        .filter(Number.isFinite);
    const patternLength =
        numbers.reduce((sum, value) => sum + value, 0) *
        (numbers.length % 2 ? 2 : 1);
    return (
        direction *
        (patternLength > 0 && Number.isFinite(patternLength)
            ? Math.max(1, Math.round(pathLength / patternLength)) *
              patternLength
            : pathLength)
    );
}

const edgePathElementByIdentifier = ref(new Map());
const edgeAnimationByIdentifier = ref(new Map());

function registerEdgePathElement(edgeIdentifier) {
    return function register(element) {
        if (element) {
            edgePathElementByIdentifier.value.set(edgeIdentifier, element);
        } else {
            edgePathElementByIdentifier.value.delete(edgeIdentifier);
        }
    };
}

function stopAllEdgeAnimations() {
    edgeAnimationByIdentifier.value.forEach((animationHandle) => {
        try {
            animationHandle.cancel();
        } catch {
            // whatever
        }
    });
    edgeAnimationByIdentifier.value.clear();
}

function startEdgeAnimations() {
    stopAllEdgeAnimations();
    if (disposed) return;

    const edges = layoutData.value?.edges ?? [];
    if (!edges.length) return;

    const animationDefaults = cfgEdges.value.animations;

    const referenceDistance =
        Number(animationDefaults.referenceDistance) > 0
            ? Number(animationDefaults.referenceDistance)
            : 24;

    edges.forEach((edge) => {
        const isAnimated = edgeStates.value.get(edge.id)?.animated;

        const pathElement = edgePathElementByIdentifier.value.get(edge.id);
        if (!pathElement || typeof pathElement.animate !== 'function') return;

        if (!isAnimated) {
            pathElement.style.strokeDasharray = '0';
            pathElement.style.strokeDashoffset = '0';
            return;
        }

        const dasharrayValue =
            edge?.original?.dasharray ?? animationDefaults.dasharray;

        pathElement.style.strokeDasharray = String(dasharrayValue);
        pathElement.style.strokeDashoffset = '0';

        const hasEdgeDirection = ![undefined, null].includes(
            edge?.original?.animationDirection,
        );
        const hasConfigDirection = ![undefined, null].includes(
            animationDefaults.animationDirection,
        );

        const direction = hasEdgeDirection
            ? Number(edge.original.animationDirection)
            : hasConfigDirection
              ? Number(animationDefaults.animationDirection)
              : -1;

        const dashoffsetDelta = getIdealDashoffsetDelta(pathElement, {
            direction,
            dasharray: String(dasharrayValue),
        });

        const durationReferenceMsRaw =
            edge?.original?.animationDurationMs ??
            animationDefaults.animationDurationMs ??
            1000;

        const durationReferenceMs = Number(durationReferenceMsRaw);
        const hasDurationReference =
            Number.isFinite(durationReferenceMs) && durationReferenceMs > 0;

        const speedUnitsPerMs = hasDurationReference
            ? referenceDistance / durationReferenceMs
            : referenceDistance / 1000;

        const durationMilliseconds = Math.max(
            1,
            Math.round(
                Math.abs(dashoffsetDelta) / Math.max(1e-9, speedUnitsPerMs),
            ),
        );

        const animationHandle = pathElement.animate(
            [{ strokeDashoffset: 0 }, { strokeDashoffset: dashoffsetDelta }],
            {
                duration: durationMilliseconds,
                iterations: Infinity,
                easing: 'linear',
            },
        );
        edgeAnimationByIdentifier.value.set(edge.id, animationHandle);
    });
}

onBeforeUnmount(() => {
    stopAllEdgeAnimations();
});

async function getImage({ scale = 2 } = {}) {
    if (!dagChart.value) return;
    const { width, height } = dagChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: dagChart.value,
        base64: true,
        img: true,
        scale,
    });
    return {
        imageUri,
        base64,
        title: cfgChart.value.title.text ?? 'vue-ui-dag',
        width,
        height,
        aspectRatio,
    };
}

const backgroundPatternGridSpacing = computed(() => {
    const nodeHeight = Number(cfgChart.value.layout.nodeHeight);
    return Number.isFinite(nodeHeight) && nodeHeight > 0
        ? nodeHeight / cfgChart.value.backgroundPattern.spacingRatio
        : 12;
});

const backgroundPatternDotRadius = computed(() => {
    return (
        backgroundPatternGridSpacing.value *
        (cfgChart.value.backgroundPattern.dotRadiusRatio / 100)
    );
});

const hoveredNodeId = ref(null);
let clearHoverTimer = null;
let hoverSessionStep = 0;

function setHoveredNode(nodeId) {
    // Cancel any pending clear (moving between label and node)
    if (clearHoverTimer) {
        clearTimeout(clearHoverTimer);
        clearHoverTimer = null;
    }

    if (hoveredNodeId.value === nodeId) return;

    hoveredNodeId.value = nodeId;
}

function onNodePointerEnter(nodeId) {
    hoveredEdgeId.value = null;
    setHoveredNode(nodeId);
}

async function onMidpointPointerEnter(edge) {
    hoveredNodeId.value = null;
    await showMidpointTooltip(edge);
}

function scheduleClearHoveredNode(nodeId) {
    const step = ++hoverSessionStep;

    if (clearHoverTimer) clearTimeout(clearHoverTimer);

    clearHoverTimer = setTimeout(() => {
        if (step !== hoverSessionStep) return;

        // Only clear if we are still leaving the same node
        if (hoveredNodeId.value === nodeId) {
            hoveredNodeId.value = null;
        }
    }, 20);
}

const edgeStates = computed(
    () =>
        new Map(
            (layoutData.value?.edges || []).map((edge) => {
                const downstream =
                    hoveredNodeId.value != null &&
                    String(edge.from) === String(hoveredNodeId.value);
                const upstream =
                    hoveredNodeId.value != null &&
                    String(edge.to) === String(hoveredNodeId.value);
                const active =
                    hoveredEdgeId.value === edge.id ||
                    tooltipEdge.value?.id === edge.id ||
                    (activeA11yItemType.value === 'midpoint' &&
                        activeA11yItemId.value === edge.id);
                let stroke = edge.original.color ?? cfgEdges.value.stroke;
                if (active && cfgMidpoints.value.selectedEdge.stroke != null)
                    stroke = cfgMidpoints.value.selectedEdge.stroke;
                else if (
                    downstream &&
                    cfgNodes.value.selected.downstreamEdges.stroke != null
                )
                    stroke = cfgNodes.value.selected.downstreamEdges.stroke;
                else if (
                    upstream &&
                    cfgNodes.value.selected.upstreamEdges.stroke != null
                )
                    stroke = cfgNodes.value.selected.upstreamEdges.stroke;
                return [
                    edge.id,
                    {
                        stroke,
                        active,
                        width:
                            cfgEdges.value.strokeWidth *
                            (active || downstream ? 2 : 1),
                        animated:
                            !!edge.original.animated ||
                            (active &&
                                cfgMidpoints.value.selectedEdge.animated ===
                                    true) ||
                            (downstream &&
                                cfgNodes.value.selected.downstreamEdges
                                    .animated === true) ||
                            (upstream &&
                                cfgNodes.value.selected.upstreamEdges
                                    .animated === true),
                    },
                ];
            }),
        ),
);
watch(
    [
        edgeStates,
        () => cfgEdges.value.animations,
        () => layoutData.value?.edges,
    ],
    startEdgeAnimations,
    { deep: true, flush: 'post' },
);
onMounted(startEdgeAnimations);

function setEdge(edge) {
    const state = edgeStates.value.get(edge.id);
    return {
        d: edge.pathData,
        fill: 'none',
        stroke: state.stroke,
        'stroke-width': state.width,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
    };
}

function isNodeA11yActive(nodeId) {
    return (
        activeA11yItemType.value === 'node' && activeA11yItemId.value === nodeId
    );
}

function setNode(node) {
    const isHovered = hoveredNodeId.value === node.id;
    const isKeyboardSelected =
        activeA11yItemType.value === 'node' &&
        activeA11yItemId.value === node.id;
    const isHighlighted = isHovered || isKeyboardSelected;

    const fill =
        isHighlighted && cfgNodes.value.selected.backgroundColor != null
            ? cfgNodes.value.selected.backgroundColor
            : node.original.backgroundColor;

    const stroke =
        isHighlighted && cfgNodes.value.selected.stroke != null
            ? cfgNodes.value.selected.stroke
            : cfgNodes.value.stroke;

    const strokeWidth =
        isHighlighted && cfgNodes.value.selected.strokeWidth != null
            ? cfgNodes.value.selected.strokeWidth
            : cfgNodes.value.strokeWidth;

    return {
        x: node.x - node.width / 2,
        y: node.y - node.height / 2,
        width: node.width,
        height: node.height,
        rx: cfgNodes.value.borderRadius,
        fill,
        stroke,
        'stroke-width': strokeWidth,
    };
}

function setMidpoint(edge) {
    const state = edgeStates.value.get(edge.id);
    const selected =
        activeA11yItemType.value === 'midpoint' &&
        activeA11yItemId.value === edge.id;
    return {
        cx: edge.midpoint?.x,
        cy: edge.midpoint?.y,
        r: cfgMidpoints.value.radius,
        fill: selected
            ? (cfgMidpoints.value.selectedEdge.stroke ??
              cfgMidpoints.value.fill)
            : cfgMidpoints.value.fill,
        stroke: state.stroke,
        'stroke-width': state.width,
    };
}
function arrowColor(edge) {
    return edgeStates.value.get(edge.id).stroke;
}

const arrowPath = computed(() => {
    const size = layoutData.value?.arrowSize || 0;
    return layoutData.value?.arrowShape === 'normal'
        ? `M 0 0 L ${size} ${size / 2} L 0 ${size} Z`
        : `M 0 0 L ${size} ${size / 2} L 0 ${size} L ${size / 3} ${size / 2} Z`;
});

function makeMarkerId(edgeIdentifier) {
    return `${arrowMarkerIdentifier}-${String(edgeIdentifier).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
}

/**
 * Return the current layout data.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return layoutData.value;
}

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: FINAL_DATASET.value,
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
            dataset: FINAL_DATASET.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
const a11yNodes = computed(() => {
    const nodes = layoutData.value?.nodes ?? [];

    return nodes.map((node) => ({
        id: node.id,
        type: 'node',
        x: node.x,
        y: node.y,
        label: node.label ?? node.id,
        raw: node,
    }));
});

const a11yMidpoints = computed(() => {
    if (!cfgMidpoints.value.show) return [];

    const edges = layoutData.value?.edges ?? [];

    return edges
        .filter((edge) => edge?.midpoint)
        .map((edge) => ({
            id: edge.id,
            type: 'midpoint',
            x: edge.midpoint.x,
            y: edge.midpoint.y,
            label: `${getNodeById(edge.from)?.label ?? edge.from} → ${getNodeById(edge.to)?.label ?? edge.to}`,
            raw: edge,
        }));
});

const a11yItems = computed(() => {
    return [...a11yNodes.value, ...a11yMidpoints.value].sort((a, b) => {
        if (a.x === b.x) return a.y - b.y;
        return a.x - b.x;
    });
});

const a11yTable = computed(() => {
    const nodes = layoutData.value?.nodes ?? [];
    const edges = layoutData.value?.edges ?? [];

    const headers = [
        FINAL_CONFIG.value.a11y?.translations?.node ?? 'Node',
        FINAL_CONFIG.value.a11y?.translations?.parents ?? 'Parents',
        FINAL_CONFIG.value.a11y?.translations?.children ?? 'Children',
    ];

    const parents = new Map(),
        children = new Map();
    for (const edge of edges) {
        const from = String(edge.from),
            to = String(edge.to);
        if (!parents.has(to)) parents.set(to, []);
        if (!children.has(from)) children.set(from, []);
        parents.get(to).push(getNodeById(edge.from)?.label ?? edge.from);
        children.get(from).push(getNodeById(edge.to)?.label ?? edge.to);
    }
    const rows = nodes.map((node) => [
        node.label ?? node.id,
        parents.get(String(node.id))?.join(', ') || '—',
        children.get(String(node.id))?.join(', ') || '—',
    ]);

    return { headers, rows };
});

function getA11yItemKey(item) {
    return `${item.type}:${item.id}`;
}

function getActiveA11yItem() {
    if (activeA11yItemId.value == null || activeA11yItemType.value == null)
        return null;

    return (
        a11yItems.value.find(
            (item) =>
                item.id === activeA11yItemId.value &&
                item.type === activeA11yItemType.value,
        ) ?? null
    );
}

async function syncA11ySelectionWithInteraction(item) {
    if (!item) return;

    if (item.type === 'node') {
        hideMidpointTooltip();
        return;
    }

    if (item.type === 'midpoint') {
        hideNodeTooltip();
        await showMidpointTooltip(item.raw);
    }
}

function setActiveA11yItem(item) {
    if (!item) return;

    activeA11yItemId.value = item.id;
    activeA11yItemType.value = item.type;

    if (item.type === 'node') {
        setHoveredNode(item.id);
        hoveredEdgeId.value = null;
        return;
    }

    if (item.type === 'midpoint') {
        hoveredNodeId.value = null;
        hoveredEdgeId.value = item.id;
    }
}

function clearA11ySelection() {
    activeA11yItemId.value = null;
    activeA11yItemType.value = null;

    if (!isNodeTooltip.value) {
        hoveredNodeId.value = null;
    }

    if (!isTooltip.value) {
        hoveredEdgeId.value = null;
    }
}

function onSvgFocus() {
    isFocus.value = true;
    clearA11ySelection();
}

function onSvgBlur() {
    isFocus.value = false;
    hideNodeTooltip();
    hideMidpointTooltip();
    clearA11ySelection();
}

function getDirectionalCandidateScore(currentItem, candidate, direction) {
    const dx = candidate.x - currentItem.x;
    const dy = candidate.y - currentItem.y;

    if (direction === 'right' && dx <= 0) return Infinity;
    if (direction === 'left' && dx >= 0) return Infinity;
    if (direction === 'down' && dy <= 0) return Infinity;
    if (direction === 'up' && dy >= 0) return Infinity;

    if (direction === 'right' || direction === 'left') {
        return Math.abs(dx) * 1000 + Math.abs(dy);
    }

    return Math.abs(dy) * 1000 + Math.abs(dx);
}

function findNextDirectionalItem(currentItem, direction) {
    const candidates = a11yItems.value.filter(
        (item) => getA11yItemKey(item) !== getA11yItemKey(currentItem),
    );
    if (!candidates.length) return null;

    let bestCandidate = null;
    let bestScore = Infinity;

    candidates.forEach((candidate) => {
        const score = getDirectionalCandidateScore(
            currentItem,
            candidate,
            direction,
        );
        if (score < bestScore) {
            bestScore = score;
            bestCandidate = candidate;
        }
    });

    if (bestCandidate) return bestCandidate;

    if (direction === 'right' || direction === 'down') {
        return a11yItems.value[0] ?? null;
    }

    return a11yItems.value[a11yItems.value.length - 1] ?? null;
}

async function activateA11yItem(item) {
    if (!item) return;
    if (item.type === 'node') {
        hideMidpointTooltip();
        await showNodeTooltip(item.raw);
    }
}

async function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!a11yItems.value.length) return;

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
    ) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        hideNodeTooltip();
        hideMidpointTooltip();
        clearA11ySelection();
        return;
    }

    let activeItem = getActiveA11yItem();

    if (isActivationKey) {
        if (!activeItem) return;

        if (activeItem.type === 'node') {
            await activateA11yItem(activeItem);
        }
        return;
    }

    if (!activeItem) {
        const firstItem = a11yItems.value[0];
        if (!firstItem) return;
        setActiveA11yItem(firstItem);
        await syncA11ySelectionWithInteraction(firstItem);
        return;
    }

    let nextItem = null;

    if (isRightKey) {
        nextItem = findNextDirectionalItem(activeItem, 'right');
    } else if (isLeftKey) {
        nextItem = findNextDirectionalItem(activeItem, 'left');
    } else if (isDownKey) {
        nextItem = findNextDirectionalItem(activeItem, 'down');
    } else if (isUpKey) {
        nextItem = findNextDirectionalItem(activeItem, 'up');
    }

    if (!nextItem) return;

    hideNodeTooltip();
    hideMidpointTooltip();
    setActiveA11yItem(nextItem);
    await syncA11ySelectionWithInteraction(nextItem);
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
    switchDirection,
    copyAlt,
    focusOnNode,
});
const annotationViewport = computed(() =>
    createPanZoomAnnotationViewport(
        FINAL_CONFIG.value.userOptions?.annotator?.followZoom,
        panZoomViewBox.value,
    ),
);
</script>

<template>
    <div
        :class="`vue-data-ui-component vue-ui-dag ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.responsive ? 'vue-ui-dag-responsive' : ''}`"
        :id="`dag_${uid}`"
        ref="dagChart"
        :style="{
            fontFamily: FINAL_CONFIG.style.fontFamily,
            backgroundColor: cfgChart.backgroundColor,
            padding: '0.5rem',
        }"
        @mouseenter="onChartEnter"
        @mouseleave="onChartLeave"
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

        <div v-if="lastError" class="dag-chart-error">
            {{ String(lastError) }}
        </div>

        <PenAndPaper
            v-bind="getAnnotatorProps(FINAL_CONFIG.userOptions.annotator)"
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :followZoom="FINAL_CONFIG.userOptions?.annotator?.followZoom"
            :annotationViewport="annotationViewport"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="FINAL_CONFIG.userOptions.annotatorPalette"
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

        <UserOptions
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
            :hasTooltip="false"
            :hasTable="false"
            :hasXls="false"
            :hasLabel="false"
            :isFullscreen="isFullscreen"
            :chartElement="dagChart"
            v-bind="
                getUserOptionsProps(
                    FINAL_CONFIG.userOptions,
                    'pdf img svg fullscreen altCopy annotator zoom',
                )
            "
            :isAnnotation="isAnnotator"
            :isZoom="panZoomActive"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleAnnotator="toggleAnnotator"
            @toggleZoom="toggleZoom"
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
                    'menuIcon optionPdf optionImg optionSvg optionFullscreen optionAnnotator optionZoom optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <!-- TITLE -->
        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'dag-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'dag-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <BaseZoomControls
            ref="zoomControls"
            v-if="
                cfgChart.controls.position === 'top' &&
                !loading &&
                cfgChart.controls.show
            "
            :config="FINAL_CONFIG"
            :scale="scale"
            :isFullscreen="isFullscreen"
            withDirection
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="() => resetZoom(true)"
            @switchDirection="switchDirection"
        />

        <div style="position: relative">
            <svg
                v-if="layoutData"
                ref="svgRef"
                :class="{
                    'vue-ui-dag-svg': true,
                    'vue-data-ui-loading': loading,
                }"
                :viewBox="svgViewBox"
                :xmlns="XMLNS"
                :style="{
                    backgroundColor: cfgChart.backgroundColor,
                    height: '100%',
                    width: '100%',
                }"
                tabindex="0"
                :aria-describedby="`chart-instructions-${uid}`"
                @mousedown="cancelFocusAnimation"
                @touchstart="cancelFocusAnimation"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />
                <slot
                    name="svg-underlayer"
                    :svg="{
                        drawingArea: panZoomViewBox,
                        data: layoutData,
                        orientation: direction,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />

                <defs v-if="cfgChart.backgroundPattern.show">
                    <pattern
                        :id="`dag_bg_pattern_${uid}`"
                        patternUnits="userSpaceOnUse"
                        :width="backgroundPatternGridSpacing"
                        :height="backgroundPatternGridSpacing"
                    >
                        <slot
                            name="background-pattern"
                            v-bind="{
                                x: backgroundPatternGridSpacing / 2,
                                y: backgroundPatternGridSpacing / 2,
                                color: cfgChart.backgroundPattern.dotColor,
                            }"
                        >
                            <circle
                                :cx="backgroundPatternGridSpacing / 2"
                                :cy="backgroundPatternGridSpacing / 2"
                                :r="backgroundPatternDotRadius"
                                :fill="cfgChart.backgroundPattern.dotColor"
                            />
                        </slot>
                    </pattern>
                </defs>

                <rect
                    v-if="cfgChart.backgroundPattern.show"
                    data-cy="dag-background-pattern"
                    :x="backgroundPatternBounds?.x ?? 0"
                    :y="backgroundPatternBounds?.y ?? 0"
                    :width="backgroundPatternBounds?.width ?? 0"
                    :height="backgroundPatternBounds?.height ?? 0"
                    :fill="`url(#dag_bg_pattern_${uid})`"
                    :style="{
                        pointerEvents: 'none',
                        opacity: cfgChart.backgroundPattern.opacity,
                    }"
                />

                <!-- Arrow marker. Hidden when arrowShape is "undirected". -->
                <defs v-if="layoutData.arrowShape !== 'undirected'">
                    <template
                        v-for="edge in layoutData.edges"
                        :key="`marker_${edge.id}`"
                    >
                        <marker
                            :id="makeMarkerId(edge.id)"
                            :markerWidth="layoutData.arrowSize"
                            :markerHeight="layoutData.arrowSize"
                            :refX="layoutData.arrowSize - 3"
                            :refY="layoutData.arrowSize / 2"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <path
                                :d="arrowPath"
                                :fill="arrowColor(edge)"
                                :stroke="arrowColor(edge)"
                                stroke-width="0"
                                style="
                                    transition:
                                        stroke 0.2s ease-in-out,
                                        fill 0.2s ease-in-out,
                                        stroke-width 0.2s ease-in-out;
                                "
                            />
                        </marker>
                    </template>
                </defs>

                <!-- Edges -->
                <g class="vue-ui-dag-edges">
                    <template v-for="edge in layoutData.edges" :key="edge.id">
                        <path
                            data-cy-edge
                            :ref="registerEdgePathElement(edge.id)"
                            v-bind="setEdge(edge)"
                            style="
                                pointer-events: none;
                                transition:
                                    stroke-width 0.2s ease-in-out,
                                    stroke 0.2s ease-in-out;
                            "
                        />
                        <circle
                            data-cy-midpoint
                            class="vue-ui-dag-edge-midpoint"
                            v-if="cfgMidpoints.show"
                            :data-a11y-midpoint-id="edge.id"
                            v-bind="setMidpoint(edge)"
                            :aria-label="`${getNodeById(edge.from)?.label ?? edge.from} to ${getNodeById(edge.to)?.label ?? edge.to}`"
                            style="
                                transition:
                                    stroke-width 0.2s ease-in-out,
                                    stroke 0.2s ease-in-out,
                                    fill 0.2s ease-in-out;
                            "
                            @mouseenter="onMidpointPointerEnter(edge)"
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
                        @click.stop="
                            cfgNodes.tooltip.showOnClick &&
                            showNodeTooltip(node)
                        "
                        @mouseenter="onNodePointerEnter(node.id)"
                        @mouseleave="scheduleClearHoveredNode(node.id)"
                    >
                        <template v-if="!$slots.node">
                            <rect
                                data-cy-node
                                v-bind="setNode(node)"
                                :data-a11y-node-id="node.id"
                                :aria-label="`${node.label ?? node.id}`"
                                :style="{
                                    cursor:
                                        cfgNodes.tooltip.showOnClick &&
                                        isCursorPointer
                                            ? 'pointer'
                                            : 'default',
                                    transition:
                                        'stroke 0.2s ease-in-out, stroke-width 0.2s ease-in-out, fill 0.2s ease-in-out',
                                }"
                            />
                        </template>

                        <!-- Full `node` slot to customize the node entirely using a div -->
                        <foreignObject
                            v-if="$slots.node"
                            :x="node.x - node.width / 2"
                            :y="node.y - node.height / 2"
                            :width="node.width"
                            :height="node.height"
                            style="overflow: visible"
                        >
                            <slot
                                name="node"
                                v-bind="{ node, orientation: direction }"
                            />
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
                        :stroke-width="
                            cfgEdges.strokeWidth *
                            (edge.from === hoveredNodeId ||
                            edge.id === tooltipEdge?.id
                                ? 1.3
                                : 1)
                        "
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :marker-end="
                            layoutData.arrowShape === 'undirected'
                                ? null
                                : `url(#${makeMarkerId(edge.id)})`
                        "
                        style="
                            pointer-events: none;
                            transition:
                                stroke-width 0.2s ease-in-out,
                                stroke 0.2s ease-in-out;
                        "
                    />
                </g>

                <!-- Node labels (last layer to overlap edges when offset is applied) -->
                <g class="vue-ui-dag-node-labels">
                    <g
                        v-for="node in layoutData.nodes"
                        :key="node.id"
                        @click.stop="
                            cfgNodes.tooltip.showOnClick &&
                            showNodeTooltip(node)
                        "
                        @mouseenter="setHoveredNode(node.id)"
                        @mouseleave="scheduleClearHoveredNode(node.id)"
                    >
                        <template v-if="!$slots['free-node-label']">
                            <!-- with `node-label` slot -->
                            <text
                                v-if="$slots['node-label']"
                                :x="node.x"
                                :y="node.y + cfgNodes.labels.fontSize / 3"
                                text-anchor="middle"
                                :font-size="cfgNodes.labels.fontSize"
                                :fill="
                                    hoveredNodeId === node.id &&
                                    cfgNodes.selected.labelColor != null
                                        ? cfgNodes.selected.labelColor
                                        : node.original.color
                                "
                                :font-weight="
                                    cfgNodes.labels.bold ? 'bold' : 'normal'
                                "
                                style="transition: fill 0.2s ease-in-out"
                            >
                                <slot
                                    name="node-label"
                                    v-bind="{ node, orientation: direction }"
                                >
                                    {{ node.label }}
                                </slot>
                            </text>

                            <!-- default label, multiline when provided with /n -->
                            <text
                                data-cy-node-label
                                v-else-if="
                                    !$slots['free-node-label'] && !$slots.node
                                "
                                :x="node.x"
                                :y="node.y + cfgNodes.labels.fontSize / 3"
                                text-anchor="middle"
                                :font-size="cfgNodes.labels.fontSize"
                                :fill="
                                    (hoveredNodeId === node.id ||
                                        isNodeA11yActive(node.id)) &&
                                    cfgNodes.selected.labelColor != null
                                        ? cfgNodes.selected.labelColor
                                        : node.original.color
                                "
                                :font-weight="
                                    cfgNodes.labels.bold ? 'bold' : 'normal'
                                "
                                style="transition: fill 0.2s ease-in-out"
                                v-html="
                                    createTSpansFromLineBreaksOnY({
                                        content: node.label,
                                        fontSize: cfgNodes.labels.fontSize,
                                        fontWeight: cfgChart.nodes.labels.bold
                                            ? 'bold'
                                            : 'normal',
                                        fill:
                                            (hoveredNodeId === node.id ||
                                                isNodeA11yActive(node.id)) &&
                                            cfgNodes.selected.labelColor != null
                                                ? cfgNodes.selected.labelColor
                                                : node.original.color,
                                        x: node.x,
                                        y: node.y,
                                        autoOffset: true,
                                    })
                                "
                            />
                        </template>

                        <g v-if="$slots['free-node-label']">
                            <slot
                                name="free-node-label"
                                v-bind="{
                                    node,
                                    layoutData,
                                    orientation: direction,
                                }"
                            />
                        </g>
                    </g>
                </g>

                <slot
                    name="svg"
                    :svg="{
                        drawingArea: panZoomViewBox,
                        data: layoutData,
                        orientation: direction,
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

        <!-- Midpoint tooltip -->
        <Transition name="fade">
            <Teleport :to="isFullscreen ? dagChart : 'body'" v-if="isTooltip">
                <div
                    data-cy-tooltip-midpoint
                    ref="tooltipRef"
                    class="vue-ui-dag-tooltip"
                    :style="{
                        ...tooltipStyle,
                        maxWidth: cfgMidpoints.tooltip.maxWidth,
                        '--vue-data-ui-dag-tooltip-background':
                            cfgMidpoints.tooltip.backgroundColor,
                        '--vue-data-ui-dag-tooltip-color':
                            cfgMidpoints.tooltip.color,
                    }"
                    :data-position="tooltipPlacement"
                >
                    <slot
                        name="tooltip-midpoint"
                        v-bind="{ edge: tooltipEdge, layoutData }"
                    >
                        <div v-if="tooltipEdge">
                            {{
                                getNodeById(tooltipEdge.from)?.label ??
                                tooltipEdge.from
                            }}
                            →
                            {{
                                getNodeById(tooltipEdge.to)?.label ??
                                tooltipEdge.to
                            }}
                        </div>
                    </slot>
                </div>
            </Teleport>
        </Transition>

        <!-- Node tooltip -->
        <Transition name="fade">
            <Teleport
                :to="isFullscreen ? dagChart : 'body'"
                v-if="isNodeTooltip"
            >
                <div
                    data-cy-tooltip-node
                    ref="nodeTooltipRef"
                    class="vue-ui-dag-node-tooltip"
                    :style="{
                        maxWidth: cfgNodes.tooltip.maxWidth,
                        left: nodeTooltipStyle.left,
                        top: nodeTooltipStyle.top,
                        '--vue-data-ui-dag-node-tooltip-background':
                            cfgNodes.tooltip.backgroundColor,
                        '--vue-data-ui-dag-node-tooltip-color':
                            cfgNodes.tooltip.color,
                    }"
                    :data-position="nodeTooltipPlacement"
                >
                    <slot
                        name="tooltip-node"
                        v-bind="{ node: nodeTooltipNode, layoutData }"
                    >
                        <div v-if="nodeTooltipNode">
                            {{ nodeTooltipNode.label }}
                        </div>
                    </slot>
                </div>
            </Teleport>
        </Transition>

        <BaseZoomControls
            ref="zoomControls"
            v-if="
                cfgChart.controls.position === 'bottom' &&
                !loading &&
                cfgChart.controls.show
            "
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

        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped>
@import '../vue-data-ui.css';

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
    --dag-tooltip-background: var(
        --vue-data-ui-dag-tooltip-background,
        #e1e5e8
    );
    --dag-tooltip-color: var(--vue-data-ui-dag-tooltip-color, #2d353c);
    pointer-events: none;
    padding: 0.35rem 0.55rem;
    z-index: 999999;
}

.vue-ui-dag-node-tooltip {
    --dag-tooltip-background: var(
        --vue-data-ui-dag-node-tooltip-background,
        #ffffff
    );
    --dag-tooltip-color: var(--vue-data-ui-dag-node-tooltip-color, #2d353c);
    pointer-events: auto;
    padding: 0.5rem 0.75rem;
    z-index: 1000000;
}

:is(.vue-ui-dag-tooltip, .vue-ui-dag-node-tooltip) {
    position: fixed;
    background: var(--dag-tooltip-background);
    color: var(--dag-tooltip-color);
    box-shadow: 0 3px 6px -3px rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    font-size: 12px;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px);
}

:is(.vue-ui-dag-tooltip, .vue-ui-dag-node-tooltip)::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    border-style: solid;
}

:is(.vue-ui-dag-tooltip, .vue-ui-dag-node-tooltip)[data-position='top']::after {
    bottom: -8px;
    border-width: 8px 8px 0 8px;
    border-color: var(--dag-tooltip-background) transparent transparent
        transparent;
}

:is(
        .vue-ui-dag-tooltip,
        .vue-ui-dag-node-tooltip
    )[data-position='bottom']::after {
    top: -8px;
    border-width: 0 8px 8px 8px;
    border-color: transparent transparent var(--dag-tooltip-background)
        transparent;
}

:is(
        .vue-ui-dag-tooltip,
        .vue-ui-dag-node-tooltip
    )[data-position='left']::after {
    top: 50%;
    transform: translateY(-50%);
    left: 100%;
    border-width: 8px 0 8px 8px;
    border-color: transparent transparent transparent
        var(--dag-tooltip-background);
}

:is(
        .vue-ui-dag-tooltip,
        .vue-ui-dag-node-tooltip
    )[data-position='right']::after {
    top: 50%;
    transform: translateY(-50%);
    left: -8px;
    border-width: 8px 8px 8px 0;
    border-color: transparent var(--dag-tooltip-background) transparent
        transparent;
}

:is(
        .vue-ui-dag-tooltip,
        .vue-ui-dag-node-tooltip
    )[data-position='center']::after {
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

<script setup>
import {
    computed,
    ref,
    shallowRef,
    triggerRef,
    watch,
    onMounted,
    onBeforeUnmount,
    useSlots,
    TransitionGroup,
    defineAsyncComponent,
    nextTick,
} from 'vue';
import { useConfig } from '../useConfig';
import { createUid, createTSpansFromLineBreaksOnX, treeShake } from '../lib';
import { useLoading } from '../useLoading';
import { COMMON_RULES, useHints } from '../useHints';
import BaseScanner from '../atoms/BaseScanner.vue';
import { graphSkeletonDataset, graphSkeletonConfig } from '../graph/loading';
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import { normalizeGraph, tickGraph } from '../graph/engine';
import { prepareGraphLayout } from '../graph/layout';
import { advancePulse, batchPulses } from '../graph/pulses';
import { isHighlightedLink } from '../graph/highlight';
import {
    linkGeometry,
    batchLinks,
    batchNodes,
    circlePath,
    createGraphHitIndex,
} from '../graph/render';
import { createChartImageGetter } from '../chartImage';
import themes from '../themes/vue_ui_graph.json';
import BaseZoomControls from '../atoms/BaseZoomControls.vue';
import Title from '../atoms/Title.vue';
import { useChartExport } from '../useChartExport';
import { getTableComponent } from '../tableIntegration';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';
import { graphTableData, graphCsvContent, metadataText } from '../graph/data';
import {
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);

const props = defineProps({
    dataset: {
        type: Object,
        default: () => ({
            nodes: [],
            links: [],
        }),
    },
    config: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits([
    'copyAlt',
    'selectNode',
    'hoverNode',
    'zoom',
    'zoomReset',
    'layoutStart',
    'layoutEnd',
]);

const uid = ref(createUid());

const root = ref(null);
const svg = ref(null);
const mounted = ref(false);
const reduced = ref(false);

const preparedConfig = computed(() =>
    resolveChartConfigWithPalette(
        props.config || {},
        useConfig().vue_ui_graph,
        themes,
    ),
);

const config = ref(preparedConfig.value);

useHints({
    config: () => config.value,
    dataset: () => props.dataset,
    component: 'VueUiGraph',
    rules: [COMMON_RULES.noHint],
});

const skeletonConfig = computed(() =>
    treeShake({
        defaultConfig: treeShake({
            defaultConfig: preparedConfig.value,
            userConfig: graphSkeletonConfig,
        }),
        userConfig: props.config?.skeletonConfig ?? {},
    }),
);

const { loading, FINAL_DATASET } = useLoading({
    config: computed(() => props.config),
    // The shared hook treats an empty object as empty; graph datasets wrap nodes.
    dataset: computed(() =>
        props.dataset?.nodes?.length ? props.dataset : {},
    ),
    skeletonDataset: props.config?.skeletonDataset ?? graphSkeletonDataset,
    skeletonConfig: skeletonConfig.value,
    FINAL_CONFIG: config,
    prepareConfig: () => preparedConfig.value,
});

watch([preparedConfig, skeletonConfig, loading], () => {
    config.value = loading.value ? skeletonConfig.value : preparedConfig.value;
});

const slots = useSlots();
const chart = computed(() => config.value.style.chart);
const zoomLocked = ref(false);
const isAnnotator = ref(false);
const viewLocked = computed(
    () => loading.value || zoomLocked.value || isAnnotator.value,
);

const zoomEnabled = computed(
    () => config.value.interaction.zoom.enabled && !viewLocked.value,
);

function toggleZoom() {
    zoomLocked.value = !zoomLocked.value;
    if (zoomLocked.value) {
        cancelViewportAnimation();
        if (gesture && gesture.type !== 'node') {
            suppressClick = gesture.moved;
            gesture = null;
            pointers.clear();
        }
    }
}

const graph = shallowRef({
    nodes: [],
    links: [],
    byId: new Map(),
    adjacency: new Map(),
});

const tableSnapshot = shallowRef(graph.value);

const width = ref(800);
const height = ref(600);
const viewport = ref({ x: 400, y: 300, k: 1 });
const initialViewport = shallowRef({
    x: 400,
    y: 300,
    k: 1,
    width: 800,
    height: 600,
});
const relativeZoom = computed(() => viewport.value.k / initialViewport.value.k);
function finishInitialLayout() {
    if (!initialLayoutReady.value) {
        initialViewport.value = {
            ...viewport.value,
            width: width.value,
            height: height.value,
        };
        initialLayoutReady.value = true;
    }
}

const hovered = ref(null);
const isDraggingNode = ref(false);
const selected = ref(null);

const tooltipRef = ref(null);
const tooltipTriggerMode = ref('pointer');

let tooltipClientPosition = null;

let frame = null;
let observer;
let media;
let running = false;
let iteration = 0;
let disposed = false;
let suppressClick = false;
let gesture = null;
let suppressRestoredFocus = false;
let keyboardInput = true;
let resumeLayoutAfterAnnotation = false;

const initialLayoutReady = ref(false);
const pointers = new Map();

const active = computed(
    () =>
        hovered.value ??
        (config.value.interaction.highlight.keepSelection
            ? selected.value
            : null),
);

const neighbors = computed(
    () => graph.value.adjacency.get(active.value) || new Set(),
);

const effects = computed(
    () => graph.value.nodes.length <= config.value.performance.effectThreshold,
);

const batchedNodes = computed(
    () =>
        !slots.node &&
        graph.value.nodes.length >
            config.value.performance.nodeBatchThreshold &&
        !(effects.value && chart.value.nodes.gradient),
);
const geometry = computed(() =>
    graph.value.links.map((link) => linkGeometry(link, chart.value.links)),
);

const linkBatches = computed(() => batchLinks(geometry.value));

// Base edges stay batched regardless of pulse visibility.
const pulseLinks = computed(() => {
    const pulses = chart.value.links.pulses;
    if (reduced.value) return [];
    if (!pulses.showOnHover) return pulses.show ? geometry.value : [];
    if (hovered.value === null) return [];
    return geometry.value.filter(({ link }) =>
        isHighlightedLink(
            link,
            hovered.value,
            config.value.interaction.highlight.neighbors
                ? graph.value.adjacency.get(hovered.value)
                : undefined,
        ),
    );
});

// Only one DOM path per color/opacity combination
const pulseLayer = ref(null);
const pulsePaths = new Map();
const pulseProgress = new Map();

let pulseFrame = null;
let pulseTimestamp = null;

const pulseBatches = computed(() =>
    batchPulses(
        pulseLinks.value,
        chart.value.links.pulses,
        isHighlighting.value ? highlightId.value : null,
        dim.value,
        config.value.interaction.highlight.neighbors
            ? highlightedNeighbors.value
            : undefined,
    ),
);

function drawPulses(elapsed) {
    const visible = new Set();
    const settings = chart.value.links.pulses;
    for (const batch of pulseBatches.value) {
        const element = pulsePaths.get(batch.key);
        if (!element) continue;
        const paths = [];
        for (const item of batch.items) {
            const index = item.link.index;
            visible.add(index);
            const progress =
                pulseProgress.get(index) ?? (index * 0.61803398875) % 1;
            const position = advancePulse(
                item,
                progress,
                elapsed,
                settings.duration,
                settings.reverse,
            );
            pulseProgress.set(index, position.progress);
            paths.push(circlePath({ ...position, radius: settings.radius }));
        }
        element.setAttribute('d', paths.join(' '));
    }
    for (const index of pulseProgress.keys()) {
        if (!visible.has(index)) pulseProgress.delete(index);
    }
}

function animatePulses(timestamp) {
    pulseFrame = null;
    const elapsed =
        pulseTimestamp === null ? 0 : Math.min(50, timestamp - pulseTimestamp);
    pulseTimestamp = timestamp;
    drawPulses(elapsed);
    if (pulseLayer.value && pulseBatches.value.length) {
        pulseFrame = requestAnimationFrame(animatePulses);
    } else pulseTimestamp = null;
}

const nodeBatches = computed(() =>
    batchedNodes.value ? batchNodes(graph.value.nodes) : [],
);

const highlightId = ref(null);

watch(
    active,
    (id) => {
        if (id !== null) highlightId.value = id;
    },
    { immediate: true },
);

const highlightedNeighbors = computed(
    () => graph.value.adjacency.get(highlightId.value) || new Set(),
);

const isHighlighting = computed(
    () => config.value.interaction.highlight.enabled && active.value !== null,
);

const dim = computed(() =>
    isHighlighting.value ? config.value.interaction.highlight.dimOpacity : 1,
);

const highlightedLinks = computed(() =>
    highlightId.value === null
        ? []
        : batchLinks(geometry.value, (link) =>
              isHighlightedLink(
                  link,
                  highlightId.value,
                  config.value.interaction.highlight.neighbors
                      ? highlightedNeighbors.value
                      : undefined,
              ),
          ),
);

const hoveredArrowBatches = computed(() => {
    if (!chart.value.links.arrows.showOnHover || hovered.value === null)
        return [];
    const id = hovered.value;
    const related = graph.value.adjacency.get(id) || new Set();
    return batchLinks(geometry.value, (link) =>
        isHighlightedLink(
            link,
            id,
            config.value.interaction.highlight.neighbors ? related : undefined,
        ),
    );
});

const highlightedNodes = computed(() =>
    !batchedNodes.value || highlightId.value === null
        ? []
        : batchNodes(
              graph.value.nodes,
              (n) =>
                  n.id === highlightId.value ||
                  (config.value.interaction.highlight.neighbors &&
                      highlightedNeighbors.value.has(n.id)),
          ),
);

watch(
    [pulseBatches, pulseLayer, () => chart.value.links.pulses.radius],
    () => {
        if (pulseLayer.value && pulseBatches.value.length) {
            drawPulses(0);
            if (pulseFrame === null)
                pulseFrame = requestAnimationFrame(animatePulses);
        } else {
            if (pulseFrame !== null) cancelAnimationFrame(pulseFrame);
            pulseFrame = null;
            pulseTimestamp = null;
            pulseProgress.clear();
        }
    },
    { flush: 'post' },
);

// Correct alpha compositing: the highlighted overlay restores the configured opacity.
function overlayOpacity(opacity) {
    const a = opacity * config.value.interaction.highlight.dimOpacity;
    return isHighlighting.value ? (opacity - a) / Math.max(0.000001, 1 - a) : 0;
}

const selectedNode = computed(() => graph.value.byId.get(selected.value));
const hoveredNode = computed(() => graph.value.byId.get(hovered.value));

const visibleLabels = computed(() => {
    const labels = graph.value.nodes.filter((n, i) => showLabel(n, i));
    if (!batchedNodes.value) return labels;
    const limit = Math.max(1, chart.value.nodes.labels.maxCount);
    // Keep focused/selected labels first, then cap even a hub's neighborhood.
    return labels
        .sort(
            (a, b) =>
                Number(b.id === active.value || b.id === selected.value) -
                Number(a.id === active.value || a.id === selected.value),
        )
        .slice(0, limit);
});

const keyboardNode = ref(null);
const isFocus = ref(false);

let hitIndex = null;
let hitNodes = null;
let hoverFrame = null;
let hoverEvent = null;

function hitAt(e) {
    if (!initialLayoutReady.value) return {};
    const p = local(e);
    const v = viewport.value;
    const point = { x: (p.x - v.x) / v.k, y: (p.y - v.y) / v.k };

    if (hitNodes !== graph.value.nodes) {
        hitIndex = createGraphHitIndex(graph.value.nodes, []);
        hitNodes = graph.value.nodes;
    }
    return { node: hitIndex.nodeAt(point, 2 / v.k) };
}

function inspectPointer(e) {
    if (isAnnotator.value || gesture || !initialLayoutReady.value) return;
    suppressRestoredFocus = false;
    const element = e.target?.closest?.('.vue-ui-graph-node');
    const targetNode =
        !batchedNodes.value && element
            ? graph.value.nodes[Number(element.dataset.nodeIndex)]
            : null;
    const node = targetNode || hitAt(e).node;
    if (node) {
        keyboardNode.value = null;
        if (hovered.value !== node.id) hover(node, e);
        else tooltipAt(e, node);
    } else if (hovered.value !== null) hover(null);
}

function pointerMove(e) {
    if (isAnnotator.value) return;
    if (pointers.has(e.pointerId)) {
        move(e);
        return;
    }
    hoverEvent = e;
    if (hoverFrame === null)
        hoverFrame = requestAnimationFrame(() => {
            hoverFrame = null;
            inspectPointer(hoverEvent);
            hoverEvent = null;
        });
}

function pointerLeave() {
    if (hoverFrame !== null) cancelAnimationFrame(hoverFrame);
    hoverFrame = null;
    hoverEvent = null;
    if (!gesture) {
        hover(null);
    }
}

function pointerDown(e) {
    if (batchedNodes.value) {
        const hit = hitAt(e);
        if (hit.node) {
            down(e, hit.node);
            return;
        }
    }
    down(e);
}

function canvasClick(e) {
    if (isAnnotator.value) return;
    if (suppressClick) {
        suppressClick = false;
        return;
    }
    const hit = hitAt(e);
    if (batchedNodes.value && hit.node) select(hit.node);
    else backgroundClick();
}

function keyboardFocus() {
    if (!keyboardInput) return;
    if (isAnnotator.value || !graph.value.nodes.length) return;
    if (suppressRestoredFocus) return;
    isFocus.value = true;
    const n =
        graph.value.byId.get(keyboardNode.value) ||
        selectedNode.value ||
        graph.value.nodes[0];
    keyboardNode.value = n.id;
    hover(n);
}

function keyboardNavigate(e) {
    if (isAnnotator.value) return;
    if (
        [
            'ArrowRight',
            'ArrowLeft',
            'ArrowUp',
            'ArrowDown',
            'Home',
            'End',
            'Enter',
            ' ',
        ].includes(e.key)
    ) {
        suppressRestoredFocus = false;
        isFocus.value = true;
    }
    if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        keyboardNode.value = null;
        hover(null);
        clearSelection();
        return;
    }
    const nodes = graph.value.nodes;
    if (!nodes.length) return;
    let index = Math.max(
        0,
        nodes.findIndex((n) => n.id === keyboardNode.value),
    );
    if (
        [
            'ArrowRight',
            'ArrowDown',
            'ArrowLeft',
            'ArrowUp',
            'Home',
            'End',
        ].includes(e.key)
    ) {
        e.preventDefault();
        if (e.key === 'Home') index = 0;
        else if (e.key === 'End') index = nodes.length - 1;
        else {
            const current = nodes[index];
            const horizontal = e.key === 'ArrowRight' || e.key === 'ArrowLeft';
            const sign =
                e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
            let bestScore = Infinity;
            let next = null;

            for (const candidate of nodes) {
                const dx = candidate.x - current.x;
                const dy = candidate.y - current.y;
                const along = horizontal ? dx : dy;

                if (along * sign <= 0) continue;

                const score = dx * dx + dy * dy;

                if (score < bestScore) {
                    bestScore = score;
                    next = candidate;
                }
            }
            if (!next) {
                // Wrap to the opposite spatial edge, preferring the closest
                // row/column when multiple nodes share that edge.
                let edge = Infinity;
                let crossDistance = Infinity;
                for (const candidate of nodes) {
                    if (candidate === current) continue;
                    const axis =
                        (horizontal ? candidate.x : candidate.y) * sign;
                    const cross = Math.abs(
                        horizontal
                            ? candidate.y - current.y
                            : candidate.x - current.x,
                    );
                    if (
                        axis < edge ||
                        (axis === edge && cross < crossDistance)
                    ) {
                        edge = axis;
                        crossDistance = cross;
                        next = candidate;
                    }
                }
            }
            if (next) index = next.index;
        }
        keyboardNode.value = nodes[index].id;
        hover(nodes[index]);
    } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        select(nodes[index]);
    }
}

const tooltipData = computed(() => graph.value.byId.get(hovered.value));

const tooltipScope = computed(() => ({
    datapoint: tooltipData.value?.raw,
    node: tooltipData.value?.raw,
    connections: tooltipData.value?.degree,
    config: config.value,
}));

const tooltipA11yPosition = computed(() => {
    const n = graph.value.byId.get(hovered.value),
        rect = svg.value?.getBoundingClientRect();
    if (!n || !rect) return { x: 0, y: 0 };
    const point = {
        x: n.x * viewport.value.k + viewport.value.x,
        y: n.y * viewport.value.k + viewport.value.y,
    };
    const matrix = svg.value.getScreenCTM?.();
    if (matrix)
        return {
            x: matrix.a * point.x + matrix.c * point.y + matrix.e,
            y: matrix.b * point.x + matrix.d * point.y + matrix.f,
        };
    return {
        x:
            rect.left +
            (n.x * viewport.value.k + viewport.value.x) *
                (rect.width / width.value),
        y:
            rect.top +
            (n.y * viewport.value.k + viewport.value.y) *
                (rect.height / height.value),
    };
});

const tooltipText = computed(() => {
    const n = tooltipData.value;
    if (!n) return '';
    if (typeof config.value.tooltip.customFormat === 'function')
        return String(config.value.tooltip.customFormat(tooltipScope.value));
    return [
        n.label ?? n.id,
        n.group != null ? `Group: ${n.group}` : '',
        n.value != null ? `Value: ${n.value}` : '',
        `Connections: ${n.degree}`,
        config.value.tooltip.showMetadata && n.metadata
            ? metadataText(n.metadata)
            : '',
    ]
        .filter(Boolean)
        .join('\n');
});

function isRelated(id) {
    return (
        active.value === null ||
        id === active.value ||
        (config.value.interaction.highlight.neighbors &&
            neighbors.value.has(id))
    );
}

function opacity(id) {
    return config.value.interaction.highlight.enabled && !isRelated(id)
        ? config.value.interaction.highlight.dimOpacity
        : 1;
}

function showLabel(n, i) {
    const c = chart.value.nodes.labels;
    if (!c.show || viewport.value.k < c.minZoom) return false;
    if (c.selectedOnly) return n.id === selected.value;
    if (
        n.id === active.value ||
        (active.value !== null && neighbors.value.has(n.id))
    )
        return true;
    return (
        !c.hoverOnly &&
        !c.selectedOnly &&
        i %
            Math.max(
                1,
                Math.ceil(graph.value.nodes.length / Math.max(1, c.maxCount)),
            ) ===
            0
    );
}

function labelOffsetY(node) {
    const { labels, hover, selected, strokeWidth } = chart.value.nodes;
    // Reserve space for the widest outline, including the keyboard focus ring,
    // and the text's own stroke. Keep labels stationary when interaction changes.
    const ring = Math.max(
        5,
        strokeWidth / 2,
        hover.strokeWidth / 2,
        selected.strokeWidth / 2,
    );
    const distance =
        node.radius + ring + labels.strokeWidth / 2 + labels.fontSize * 0.6;
    const extraHeight = (label(node).split('\n').length - 1) * labels.fontSize;
    return (
        (labels.position === 'top' ? -distance - extraHeight : distance) +
        labels.offsetY
    );
}

function label(n) {
    const max = chart.value.nodes.labels.maxLength;
    return String(n.label ?? n.id)
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) =>
            max > 0 && line.length > max ? line.slice(0, max) + '…' : line,
        )
        .join('\n');
}
function escapeLabel(value) {
    return String(value).replace(
        /[&<>"']/g,
        (char) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[char],
    );
}
function labelTSpans(node, absolute = false) {
    return createTSpansFromLineBreaksOnX({
        content: escapeLabel(label(node)),
        fontSize: chart.value.nodes.labels.fontSize,
        fill: escapeLabel(chart.value.nodes.labels.color),
        stroke: escapeLabel(chart.value.backgroundColor),
        strokeWidth: chart.value.nodes.labels.strokeWidth,
        x: absolute ? node.x : 0,
        y: (absolute ? node.y : 0) + labelOffsetY(node),
    });
}

let cancelInitialLayout = null;
function stop() {
    cancelInitialLayout?.();
    cancelInitialLayout = null;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    if (running) {
        running = false;
        emit('layoutEnd', getData());
    }
}

function publish() {
    // The force engine mutates positions without replacing the nodes array.
    hitNodes = null;
    triggerRef(graph);
}

let fitAfterLayout = false;
function completeLayout() {
    publish();
    const shouldFit =
        fitAfterLayout ||
        (!initialLayoutReady.value &&
            config.value.viewport.initialFit &&
            !userViewport);
    fitAfterLayout = false;
    if (shouldFit) fitToView(false);
    finishInitialLayout();
    stop();
}
function step() {
    frame = null;
    if (disposed || isAnnotator.value) return;
    let energy = 0;
    const started = performance.now();
    for (
        let i = 0;
        i < Math.max(1, config.value.performance.stepsPerFrame);
        i++
    ) {
        energy = tickGraph(
            graph.value,
            config.value.layout,
            Math.max(
                0.015,
                1 - iteration / Math.max(1, config.value.layout.iterations),
            ),
        );
        iteration++;
        if (
            iteration >= config.value.layout.iterations ||
            performance.now() - started >= 8
        )
            break;
    }
    if (
        iteration >= config.value.layout.iterations ||
        (iteration > 30 && energy < 0.002)
    )
        completeLayout();
    else {
        publish();
        frame = requestAnimationFrame(step);
    }
}
let userViewport = false;
function restart() {
    if (!mounted.value || disposed) return;
    if (isAnnotator.value) {
        resumeLayoutAfterAnnotation = true;
        return;
    }
    stop();
    iteration = 0;
    if (!graph.value.nodes.length) {
        fitAfterLayout = false;
        return;
    }
    running = true;
    emit('layoutStart');
    if (
        !initialLayoutReady.value ||
        reduced.value ||
        !config.value.animation.enabled
    ) {
        cancelInitialLayout = prepareGraphLayout(
            graph.value,
            config.value.layout,
            () => {
                cancelInitialLayout = null;
                completeLayout();
            },
            { eager: reduced.value || !config.value.animation.enabled },
        );
    } else frame = requestAnimationFrame(step);
}

function topology(ds) {
    return JSON.stringify([
        (ds?.nodes || []).map((n) => [
            n?.id,
            n?.group,
            n?.radius,
            n?.value,
            n?.fixed,
            n?.x,
            n?.y,
        ]),
        (ds?.links || []).map((l) => [l?.source, l?.target, l?.value]),
    ]);
}

let lastTopology;
let lastLayoutSettings;
let lastLoading = loading.value;

watch(
    () => [FINAL_DATASET.value, config.value, loading.value],
    () => {
        const signature = topology(FINAL_DATASET.value),
            changed = signature !== lastTopology;
        const loadingChanged = loading.value !== lastLoading;
        const layoutSettings = JSON.stringify([
            config.value.layout,
            config.value.animation.enabled,
        ]);
        const layoutChanged = layoutSettings !== lastLayoutSettings;
        // A replacement network needs its own initial layout and fit. Retain
        // the viewport for incremental updates that still contain existing nodes.
        const replacement =
            changed &&
            initialLayoutReady.value &&
            !(FINAL_DATASET.value?.nodes || []).some((node) =>
                graph.value.byId.has(node?.id),
            );
        if (replacement || loadingChanged) {
            cancelViewportAnimation();
            initialLayoutReady.value = false;
            userViewport = false;
            keyboardNode.value = null;
        }
        graph.value = normalizeGraph(
            FINAL_DATASET.value,
            loadingChanged ? new Map() : graph.value.byId,
            config.value,
            (message) => {
                if (config.value.debug) console.warn(`[VueUiGraph] ${message}`);
            },
        );
        tableSnapshot.value = graph.value;
        if (!graph.value.byId.has(selected.value)) selected.value = null;
        if (!graph.value.byId.has(hovered.value)) hovered.value = null;
        lastTopology = signature;
        lastLoading = loading.value;
        lastLayoutSettings = layoutSettings;
        if (
            changed ||
            loadingChanged ||
            layoutChanged ||
            (mounted.value && !initialLayoutReady.value)
        ) {
            if (changed && mounted.value && config.value.viewport.fitOnUpdate)
                fitAfterLayout = true;
            restart();
        }
    },
    { deep: true, immediate: true },
);

let zoomFrame = null;
let zoomTarget = null;
let zoomEvent = null;
let zoomGeneration = 0;

function cancelViewportAnimation() {
    zoomGeneration += 1;
    if (zoomFrame !== null) cancelAnimationFrame(zoomFrame);
    zoomFrame = null;
    zoomTarget = null;
    zoomEvent = null;
}

function finishViewportAnimation() {
    const target = zoomTarget;
    const event = zoomEvent;
    cancelViewportAnimation();
    if (target) {
        viewport.value = { ...target };
        if (event) emit(event, { ...viewport.value });
    }
}

function setViewport(target, notify = true, smooth = true, event = 'zoom') {
    cancelViewportAnimation();
    if (disposed) return;

    const generation = zoomGeneration;
    if (notify) {
        userViewport = true;
        restoreFullscreenViewport = false;
    }

    const wheel = smooth === 'wheel';
    const duration = wheel
        ? Math.min(120, config.value.animation.duration)
        : config.value.animation.duration;

    if (
        !smooth ||
        !notify ||
        !mounted.value ||
        reduced.value ||
        !config.value.animation.enabled ||
        duration <= 0
    ) {
        viewport.value = target;
        if (notify) emit(event, { ...viewport.value });
        return;
    }

    const from = { ...viewport.value };
    zoomTarget = target;
    zoomEvent = event;
    let started = null;

    function animate(timestamp) {
        if (disposed || generation !== zoomGeneration) return;
        zoomFrame = null;
        if (started === null) started = timestamp;
        const progress = Math.min(1, (timestamp - started) / duration);
        // Same quadratic ease-in-out used by usePanZoom's animated zoom.
        const eased = wheel
            ? progress * (2 - progress)
            : progress < 0.5
              ? 2 * progress * progress
              : -1 + (4 - 2 * progress) * progress;
        viewport.value =
            progress === 1
                ? { ...target }
                : {
                      x: from.x + (target.x - from.x) * eased,
                      y: from.y + (target.y - from.y) * eased,
                      k: from.k + (target.k - from.k) * eased,
                  };
        if (event === 'zoom' || progress === 1)
            emit(event, { ...viewport.value });
        if (disposed || generation !== zoomGeneration) return;
        if (progress < 1) zoomFrame = requestAnimationFrame(animate);
        else {
            zoomTarget = null;
            zoomEvent = null;
        }
    }
    zoomFrame = requestAnimationFrame(animate);
}

watch(
    () => config.value.animation.enabled,
    (enabled) => {
        if (!enabled) finishViewportAnimation();
    },
);

watch(zoomEnabled, (enabled) => {
    if (!enabled) cancelViewportAnimation();
});

function zoomTo(
    k,
    point = { x: width.value / 2, y: height.value / 2 },
    notify = true,
    smooth = true,
) {
    const z = config.value.interaction.zoom;
    const old = zoomTarget || viewport.value;
    k = Math.max(
        z.min * initialViewport.value.k,
        Math.min(z.max * initialViewport.value.k, k),
    );

    setViewport(
        {
            x: point.x - ((point.x - old.x) * k) / old.k,
            y: point.y - ((point.y - old.y) * k) / old.k,
            k,
        },
        notify,
        smooth,
    );
}

function zoomIn() {
    if (!zoomEnabled.value) return;
    zoomTo((zoomTarget || viewport.value).k * 1.25);
}

function zoomOut() {
    if (!zoomEnabled.value) return;
    zoomTo((zoomTarget || viewport.value).k / 1.25);
}

function resetZoom() {
    if (viewLocked.value) return;
    setViewport(
        {
            x:
                initialViewport.value.x +
                (width.value - initialViewport.value.width) / 2,
            y:
                initialViewport.value.y +
                (height.value - initialViewport.value.height) / 2,
            k: initialViewport.value.k,
        },
        true,
        true,
        'zoomReset',
    );
}

function fitToView(notify = true) {
    if (notify && viewLocked.value) return;
    const ns = graph.value.nodes;
    if (!ns.length)
        return setViewport(
            { x: width.value / 2, y: height.value / 2, k: 1 },
            notify,
        );
    let x0 = Infinity,
        x1 = -Infinity,
        y0 = Infinity,
        y1 = -Infinity;
    for (const n of ns) {
        x0 = Math.min(x0, n.x - n.radius);
        x1 = Math.max(x1, n.x + n.radius);
        y0 = Math.min(y0, n.y - n.radius);
        y1 = Math.max(y1, n.y + n.radius);
    }
    for (const item of geometry.value) {
        // Bezier curves stay inside their control-point hull (also covers loops).
        const values = item.d.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi).map(Number);
        const margin = item.width * (item.directed ? 3 : 0.5);
        for (let i = 0; i < values.length; i += 2) {
            x0 = Math.min(x0, values[i] - margin);
            x1 = Math.max(x1, values[i] + margin);
            y0 = Math.min(y0, values[i + 1] - margin);
            y1 = Math.max(y1, values[i + 1] + margin);
        }
    }
    const labels = chart.value.nodes.labels;
    const labelledNodes = batchedNodes.value
        ? visibleLabels.value
        : ns.filter(showLabel);
    let measuringText;
    if (labelledNodes.length && svg.value) {
        measuringText = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text',
        );
        if (typeof measuringText.getComputedTextLength !== 'function')
            measuringText = null;
    }
    if (measuringText) {
        measuringText.setAttribute('visibility', 'hidden');
        measuringText.setAttribute('font-size', labels.fontSize);
        svg.value.appendChild(measuringText);
    }
    try {
        for (const n of labelledNodes) {
            const lines = label(n).split('\n');
            let textWidth = 0;
            for (const line of lines) {
                let measured = 0;
                if (measuringText) {
                    measuringText.textContent = line;
                    measured = measuringText.getComputedTextLength();
                }
                textWidth = Math.max(
                    textWidth,
                    measured || [...line].length * labels.fontSize,
                );
            }
            const stroke = labels.strokeWidth / 2;
            const firstLineY = n.y + labelOffsetY(n);
            x0 = Math.min(x0, n.x - textWidth / 2 - stroke);
            x1 = Math.max(x1, n.x + textWidth / 2 + stroke);
            y0 = Math.min(y0, firstLineY - labels.fontSize * 0.8 - stroke);
            y1 = Math.max(
                y1,
                firstLineY +
                    (lines.length - 1) * labels.fontSize +
                    labels.fontSize * 0.8 +
                    stroke,
            );
        }
    } finally {
        measuringText?.remove();
    }
    const z = config.value.interaction.zoom,
        p = chart.value.padding;
    // A fit must contain the whole graph, even below the manual zoom limit.
    const k = Math.min(
        z.max,
        Math.max(1, width.value - p * 2) / Math.max(1, x1 - x0),
        Math.max(1, height.value - p * 2) / Math.max(1, y1 - y0),
    );
    setViewport(
        {
            x: width.value / 2 - ((x0 + x1) / 2) * k,
            y: height.value / 2 - ((y0 + y1) / 2) * k,
            k,
        },
        notify,
    );
}

function focusNode(id) {
    if (isAnnotator.value) return;
    const n = graph.value.byId.get(id);
    if (!n) return;
    const target = zoomTarget || viewport.value;
    setViewport({
        ...target,
        x: width.value / 2 - n.x * target.k,
        y: height.value / 2 - n.y * target.k,
    });
    select(n);
}

function resetLayout() {
    cancelViewportAnimation();
    graph.value = normalizeGraph(FINAL_DATASET.value, new Map(), config.value);
    tableSnapshot.value = graph.value;
    userViewport = false;
    restart();
}

async function copyAlt() {
    const args = { config: config.value, dataset: props.dataset };
    emit('copyAlt', args);
    if (!config.value.userOptions.callbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(config.value.userOptions.callbacks.altCopy(args));
}

/**
 * Return nodes with their current layout coordinates and copies of link records.
 * Records are shallow copies; nested metadata remains shared.
 */
function getData() {
    return {
        nodes: graph.value.nodes.map((n) => ({ ...n.raw, x: n.x, y: n.y })),
        links: graph.value.links.map((l) => ({ ...l.raw })),
    };
}

function select(n) {
    if (loading.value || isAnnotator.value) return;
    if (suppressClick) {
        suppressClick = false;
        return;
    }
    selected.value = n.id;
    config.value.events.datapointClick?.({
        datapoint: n.raw,
        seriesIndex: n.index,
    });
    emit('selectNode', n.raw);
}

function clearSelection() {
    selected.value = null;
    emit('selectNode', null);
}

function local(e) {
    // Includes the SVG viewBox's aspect-ratio alignment and CSS transforms.
    const matrix = svg.value.getScreenCTM?.();
    if (matrix) {
        const inverse = matrix.inverse();
        return {
            x: inverse.a * e.clientX + inverse.c * e.clientY + inverse.e,
            y: inverse.b * e.clientX + inverse.d * e.clientY + inverse.f,
        };
    }
    const rect = svg.value.getBoundingClientRect();
    return {
        x:
            ((e.clientX - rect.left) * width.value) /
            (rect.width || width.value),
        y:
            ((e.clientY - rect.top) * height.value) /
            (rect.height || height.value),
    };
}
function placePointerTooltip() {
    if (tooltipTriggerMode.value === 'pointer' && tooltipClientPosition)
        tooltipRef.value?.placeTooltip(tooltipClientPosition);
}

watch(tooltipRef, placePointerTooltip);
let previousHoveredNode = null;
watch(
    hovered,
    (id) => {
        const previous = previousHoveredNode;
        const current = graph.value.byId.get(id);
        previousHoveredNode = current;
        if (previous)
            config.value.events.datapointLeave?.({
                datapoint: previous.raw,
                seriesIndex: previous.index,
            });
        if (current)
            config.value.events.datapointEnter?.({
                datapoint: current.raw,
                seriesIndex: current.index,
            });
    },
    { flush: 'sync' },
);
function tooltipAt(e, n) {
    if (e?.clientX != null) {
        tooltipTriggerMode.value = 'pointer';
        tooltipClientPosition = { x: e.clientX, y: e.clientY };
        nextTick(() => {
            if (!disposed) placePointerTooltip();
        });
    } else if (n) tooltipTriggerMode.value = 'keyboard';
}

function hover(n, e) {
    if ((loading.value || isAnnotator.value || suppressRestoredFocus) && n)
        return;
    hovered.value = n?.id ?? null;
    if (n) tooltipAt(e, n);
    emit('hoverNode', n?.raw ?? null);
}

function beginPinch() {
    isDraggingNode.value = false;
    const [a, b] = [...pointers.values()];
    gesture = {
        type: 'pinch',
        distance: Math.max(1, Math.hypot(b.x - a.x, b.y - a.y)),
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        view: { ...viewport.value },
        moved: true,
    };
}

function down(e, n) {
    if (isAnnotator.value) return;
    suppressRestoredFocus = false;
    if ((e.button && e.button !== 0) || (!n && zoomLocked.value)) return;
    cancelViewportAnimation();
    restoreFullscreenViewport = false;
    const p = local(e);
    pointers.set(e.pointerId, p);
    svg.value.setPointerCapture?.(e.pointerId);
    if (pointers.size === 2) {
        if (gesture?.type === 'node') gesture.node.pinned = gesture.wasPinned;
        beginPinch();
        hover(null);
        return;
    }
    if (pointers.size > 2) return;
    if (n && config.value.interaction.drag.enabled)
        gesture = {
            type: 'node',
            node: n,
            start: p,
            moved: false,
            wasPinned: n.pinned,
        };
    else if (!n)
        gesture = {
            type: 'pan',
            start: p,
            view: { ...viewport.value },
            moved: false,
        };
}

function move(e) {
    if (!pointers.has(e.pointerId) || !gesture) return;
    const p = local(e);
    pointers.set(e.pointerId, p);
    if (gesture.type === 'pinch') {
        if (!zoomEnabled.value) return;
        const [a, b] = [...pointers.values()];
        if (!a || !b) return;
        const distance = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const limits = config.value.interaction.zoom;
        const k = Math.max(
            limits.min * initialViewport.value.k,
            Math.min(
                limits.max * initialViewport.value.k,
                (gesture.view.k * distance) / gesture.distance,
            ),
        );
        const anchor = config.value.interaction.pan.enabled ? mid : gesture.mid;
        setViewport(
            {
                k,
                x:
                    anchor.x -
                    ((gesture.mid.x - gesture.view.x) * k) / gesture.view.k,
                y:
                    anchor.y -
                    ((gesture.mid.y - gesture.view.y) * k) / gesture.view.k,
            },
            true,
            false,
        );
        // Rebase at every move, so reversing at a zoom limit responds immediately.
        gesture.view = { ...viewport.value };
        gesture.distance = distance;
        if (config.value.interaction.pan.enabled) gesture.mid = mid;
        return;
    }

    if (Math.hypot(p.x - gesture.start.x, p.y - gesture.start.y) > 3) {
        gesture.moved = true;
    }

    if (!gesture.moved) return;

    if (gesture.type === 'node') {
        isDraggingNode.value = true;
        const n = gesture.node;
        n.pinned = true;
        n.x = (p.x - viewport.value.x) / viewport.value.k;
        n.y = (p.y - viewport.value.y) / viewport.value.k;
        n.vx = n.vy = 0;
        publish();
        if (!running && !reduced.value) restart();
    } else if (config.value.interaction.pan.enabled && !zoomLocked.value) {
        viewport.value = {
            ...gesture.view,
            x: gesture.view.x + p.x - gesture.start.x,
            y: gesture.view.y + p.y - gesture.start.y,
        };
        userViewport = true;
        emit('zoom', { ...viewport.value });
    }
}

function up(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    isDraggingNode.value = false;
    if (!gesture) return;
    if (gesture.type === 'node' && gesture.moved) {
        const n = gesture.node;
        n.userPinned = config.value.interaction.drag.pinOnRelease;
        n.pinned = !!n.fixed || !!n.userPinned || gesture.wasPinned;
        restart();
    }
    suppressClick = gesture.moved;
    if (!pointers.size) gesture = null;
    else if (gesture.type === 'pinch') {
        if (pointers.size >= 2) beginPinch();
        else
            gesture = {
                type: 'pan',
                start: [...pointers.values()][0],
                view: { ...viewport.value },
                moved: true,
            };
    }
}

function backgroundClick() {
    if (suppressClick) {
        suppressClick = false;
        return;
    }
    clearSelection();
}

function wheel(e) {
    if (!zoomEnabled.value) return;
    e.preventDefault();
    const delta =
        e.deltaY *
        (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? height.value : 1);
    // Trackpads report pinch as Ctrl+wheel, rather than two touch pointers.
    // Apply each scale change immediately; easing ordinary wheel events here
    // makes a continuous pinch feel like delayed, tiny zoom steps.
    if (e.ctrlKey) {
        zoomTo(
            viewport.value.k * Math.exp(-delta * 0.01),
            local(e),
            true,
            false,
        );
    } else {
        zoomTo(
            (zoomTarget || viewport.value).k * Math.exp(-delta * 0.001),
            local(e),
            true,
            'wheel',
        );
    }
}

function resize() {
    const oldW = width.value,
        oldH = height.value;
    const r = root.value?.getBoundingClientRect();
    const parent = root.value?.parentElement;
    const bounds = parent?.getBoundingClientRect();
    const parentStyle = parent ? getComputedStyle(parent) : null;
    let constrainedHeight = false;
    if (
        config.value.responsive &&
        !isFullscreen.value &&
        parent &&
        bounds?.height > 0
    ) {
        const previousPosition = root.value.style.position;
        try {
            root.value.style.position = 'absolute';
            constrainedHeight =
                Math.abs(
                    parent.getBoundingClientRect().height - bounds.height,
                ) < 0.5;
        } finally {
            root.value.style.position = previousPosition;
        }
    }
    const availableHeight =
        constrainedHeight && bounds?.height
            ? bounds.height -
              (parseFloat(parentStyle?.paddingTop) || 0) -
              (parseFloat(parentStyle?.paddingBottom) || 0)
            : 0;
    const chromeHeight = root.value
        ? [...root.value.children].reduce((total, child) => {
              if (child === svg.value || !(child instanceof HTMLElement))
                  return total;
              const style = getComputedStyle(child);
              return style.position === 'absolute' || style.position === 'fixed'
                  ? total
                  : total + child.getBoundingClientRect().height;
          }, 0)
        : 0;
    const plot = isFullscreen.value ? svg.value?.getBoundingClientRect() : null;
    width.value = isFullscreen.value
        ? Math.max(1, plot?.width || r?.width || window.innerWidth)
        : config.value.responsive && r?.width > 0
          ? r.width
          : chart.value.width;
    height.value = isFullscreen.value
        ? Math.max(1, plot?.height || r?.height || window.innerHeight)
        : config.value.responsive && availableHeight > 0
          ? Math.max(1, availableHeight - chromeHeight)
          : chart.value.height;
    if (oldW !== width.value || oldH !== height.value)
        cancelViewportAnimation();
    const saved =
        !isFullscreen.value && restoreFullscreenViewport
            ? fullscreenViewport
            : null;
    viewport.value = saved
        ? {
              ...saved.viewport,
              x: saved.viewport.x + (width.value - saved.width) / 2,
              y: saved.viewport.y + (height.value - saved.height) / 2,
          }
        : {
              ...viewport.value,
              x: viewport.value.x + (width.value - oldW) / 2,
              y: viewport.value.y + (height.value - oldH) / 2,
          };
    const autoFit =
        initialLayoutReady.value &&
        !userViewport &&
        config.value.viewport.initialFit &&
        !isFullscreen.value &&
        !saved &&
        (oldW !== width.value || oldH !== height.value);
    if (config.value.viewport.fitOnResize || autoFit) {
        fitToView(false);
        if (autoFit) {
            initialViewport.value = {
                ...viewport.value,
                width: width.value,
                height: height.value,
            };
        }
    }
}

function nativeFullscreenChange() {
    toggleFullscreen(document.fullscreenElement === root.value);
    nextTick(() => {
        if (!disposed) resize();
    });
}

function motionChange() {
    reduced.value = !!media?.matches;
    if (reduced.value) finishViewportAnimation();
    restart();
}

function suspendInteraction() {
    suppressRestoredFocus = true;
    cancelViewportAnimation();
    if (gesture?.type === 'node') gesture.node.pinned = gesture.wasPinned;
    const capturedPointers = [...pointers.keys()];
    gesture = null;
    pointers.clear();
    isDraggingNode.value = false;
    keyboardNode.value = null;
    isFocus.value = false;
    chartHovered.value = false;
    tooltipClientPosition = null;
    pointerLeave();
    for (const id of capturedPointers) {
        if (svg.value?.hasPointerCapture?.(id))
            svg.value.releasePointerCapture?.(id);
    }
}

function visibilityChange() {
    if (document.visibilityState === 'hidden') suspendInteraction();
}

function keyboardIntent(e) {
    if (!['Shift', 'Control', 'Alt', 'Meta'].includes(e.key))
        keyboardInput = true;
    if (e.key === 'Tab') suppressRestoredFocus = false;
}

function pointerIntent() {
    keyboardInput = false;
    isFocus.value = false;
}

function focusIndividualNode(n) {
    if (!keyboardInput) return;
    if (suppressRestoredFocus) return;
    keyboardNode.value = n.id;
    hover(n);
}

onMounted(() => {
    mounted.value = true;
    resize();
    media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    reduced.value = !!media?.matches;
    media?.addEventListener?.('change', motionChange);
    if (typeof ResizeObserver !== 'undefined') {
        observer = new ResizeObserver(resize);
        observer.observe(root.value);
        if (root.value.parentElement)
            observer.observe(root.value.parentElement);
        observer.observe(svg.value);
    }
    window.addEventListener('resize', resize);
    window.addEventListener('blur', suspendInteraction);
    document.addEventListener('visibilitychange', visibilityChange);
    document.addEventListener('keydown', keyboardIntent, true);
    document.addEventListener('pointerdown', pointerIntent, true);
    document.addEventListener('fullscreenchange', nativeFullscreenChange);
    restart();
});

onBeforeUnmount(() => {
    disposed = true;
    if (pulseFrame !== null) cancelAnimationFrame(pulseFrame);
    pulsePaths.clear();
    pulseProgress.clear();
    cancelViewportAnimation();
    stop();
    observer?.disconnect();
    window.removeEventListener('resize', resize);
    window.removeEventListener('blur', suspendInteraction);
    document.removeEventListener('visibilitychange', visibilityChange);
    document.removeEventListener('keydown', keyboardIntent, true);
    document.removeEventListener('pointerdown', pointerIntent, true);
    document.removeEventListener('fullscreenchange', nativeFullscreenChange);
    media?.removeEventListener?.('change', motionChange);
    pointers.clear();
    if (hoverFrame !== null) cancelAnimationFrame(hoverFrame);
    hoverEvent = null;
    hitIndex = null;
    hitNodes = null;
    gesture = null;
});

watch(
    () => [chart.value.width, chart.value.height, config.value.responsive],
    () => {
        if (mounted.value) resize();
    },
);

const userOptionsRef = ref(null);
const tableUnit = ref(null);
const isFullscreen = ref(false);
const isImaging = ref(false);
const isPrinting = ref(false);
const chartHovered = ref(false);

const mutableConfig = ref({
    showTable: config.value.table.show,
    showTooltip: config.value.tooltip.show,
});

const tableData = computed(() =>
    graphTableData(tableSnapshot.value, config.value.table.columnNames),
);

const tableKey = computed(() => JSON.stringify(config.value.table));
const tableStyle = computed(() => ({
    th: config.value.table.th,
    td: config.value.table.td,
    breakpoint: config.value.table.responsiveBreakpoint,
}));

const tableComponent = computed(() =>
    getTableComponent({
        config,
        style: chart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: root,
        maxWidth: 1000,
        isCursorPointer: computed(
            () => config.value.userOptions.useCursorPointer,
        ),
    }),
);

const userOptionsVisible = computed(
    () => !config.value.userOptions.showOnChartHover || chartHovered.value,
);

watch(
    () => config.value.table.show,
    (value) => {
        mutableConfig.value.showTable = value;
    },
);

watch(
    [tableUnit, () => mutableConfig.value.showTable],
    ([unit, open]) => {
        if (!unit || !config.value.table.useDialog || config.value.table.show)
            return;
        if (open) unit.open?.();
        else unit.close?.();
    },
    { flush: 'post' },
);

watch(
    () => mutableConfig.value.showTable,
    async (open) => {
        await nextTick();
        userOptionsRef.value?.setTableIconState(open);
    },
);

watch(userOptionsRef, (instance) => {
    instance?.setTableIconState(mutableConfig.value.showTable);
    instance?.setTooltipIconState(mutableConfig.value.showTooltip);
});

watch(
    () => mutableConfig.value.showTooltip,
    (show) => userOptionsRef.value?.setTooltipIconState(show),
);

watch(
    () => config.value.tooltip.show,
    (show) => {
        mutableConfig.value.showTooltip = show;
    },
);
function toggleAnnotator() {
    if (!isAnnotator.value && !config.value.userOptions.buttons.annotator)
        return;
    isAnnotator.value = !isAnnotator.value;
}

watch(
    isAnnotator,
    (active) => {
        if (active) {
            cancelViewportAnimation();
            if (gesture?.type === 'node')
                gesture.node.pinned = gesture.wasPinned;
            gesture = null;
            pointers.clear();
            isDraggingNode.value = false;
            pointerLeave();
            if (running) {
                resumeLayoutAfterAnnotation = true;
                stop();
            }
        } else if (resumeLayoutAfterAnnotation) {
            resumeLayoutAfterAnnotation = false;
            restart();
        }
    },
    { flush: 'sync' },
);

watch(
    () => config.value.userOptions.buttons.annotator,
    (enabled) => {
        if (!enabled) isAnnotator.value = false;
    },
);

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function closeTable() {
    mutableConfig.value.showTable = false;
}

let fullscreenViewport = null;
let restoreFullscreenViewport = false;

function toggleFullscreen(state) {
    // The shared toolbar emits for document fullscreen changes from other charts too.
    if (
        state &&
        document.fullscreenElement &&
        document.fullscreenElement !== root.value
    )
        state = false;
    if (state === isFullscreen.value) return;
    cancelViewportAnimation();
    if (state) {
        fullscreenViewport = {
            viewport: { ...viewport.value },
            width: width.value,
            height: height.value,
        };
        restoreFullscreenViewport = false;
    } else restoreFullscreenViewport = true;
    isFullscreen.value = state;
}

watch(
    isFullscreen,
    (full) => {
        if (disposed) return;
        resize();
        if (full && initialLayoutReady.value && graph.value.nodes.length)
            fitToView(false);
    },
    { flush: 'post' },
);

function generateCsv(callback = null) {
    const content = graphCsvContent(
        tableData.value,
        chart.value.title,
        config.value.table.columnNames,
    );

    if (typeof callback === 'function') callback(content);
    else {
        const url = URL.createObjectURL(
            new Blob([content.slice(content.indexOf(',') + 1)], {
                type: 'text/csv;charset=utf-8',
            }),
        );
        const link = document.createElement('a');
        link.href = url;
        link.download = `${chart.value.title.text || 'vue-ui-graph'}.csv`;
        document.body.appendChild(link);
        try {
            link.click();
        } finally {
            link.remove();
            URL.revokeObjectURL(url);
        }
    }
    return content;
}

const getImage = createChartImageGetter(root, () => chart.value.title.text);

async function generateImage() {
    if (isImaging.value) return;
    isImaging.value = true;
    try {
        await nextTick();
        const { default: img } = await import('../img');
        return await img({
            domElement: root.value,
            fileName: chart.value.title.text || 'vue-ui-graph',
            format: 'png',
            scale: config.value.userOptions.print.scale,
        });
    } finally {
        isImaging.value = false;
    }
}

async function generatePdf() {
    if (isPrinting.value) return;
    isPrinting.value = true;
    try {
        const { default: pdf } = await import('../pdf');
        return await pdf({
            domElement: root.value,
            fileName: chart.value.title.text || 'vue-ui-graph',
            ...config.value.userOptions.print,
        });
    } finally {
        isPrinting.value = false;
    }
}

const chartExport = useChartExport({
    svg,
    title: computed(() => chart.value.title),
    backgroundColor: computed(() => chart.value.backgroundColor),
    legend: null,
    legendItems: null,
    getSvgCallback: () => config.value.userOptions.callbacks.svg,
    generateImage,
});

function generateSvg(options = { isCb: false }) {
    return chartExport.generateSvg(options);
}

const { isCallbackImaging, isCallbackSvg, onGenerateImage } = chartExport;

defineExpose({
    copyAlt,
    zoomIn,
    zoomOut,
    resetZoom,
    fitToView,
    focusNode,
    resetLayout,
    getData,
    getImage,
    generateImage,
    generatePdf,
    generateCsv,
    generateSvg,
    toggleTable,
    toggleFullscreen,
    toggleZoom,
    toggleTooltip,
    toggleAnnotator,
});
const annotationViewport = computed(() => {
    if (!config.value.userOptions.annotator?.followZoom) return null;
    const { x, y, k } = viewport.value;
    return {
        x: { origin: x, unit: k },
        y: { origin: y, unit: k },
        clip: { x: 0, y: 0, width: width.value, height: height.value },
    };
});
</script>

<template>
    <div
        :id="uid"
        ref="root"
        class="vue-ui-graph vue-data-ui-component"
        :class="{ 'vue-ui-graph-fullscreen': isFullscreen }"
        :style="{
            background: chart.backgroundColor,
            color: chart.color,
            fontFamily: chart.fontFamily,
            '--graph-transition':
                !reduced && config.animation.enabled
                    ? `${config.animation.duration}ms`
                    : '0ms',
        }"
        @keydown.esc="!isAnnotator && clearSelection()"
        @mouseenter="chartHovered = true"
        @mouseleave="chartHovered = false"
        @focusin="chartHovered = true"
        @focusout="
            chartHovered =
                !!$event.relatedTarget && root.contains($event.relatedTarget)
        "
    >
        <PenAndPaper
            :showGroupActions="
                config.userOptions.annotator?.showGroupActions ?? true
            "
            v-if="config.userOptions.buttons.annotator"
            :svgRef="svg"
            :followZoom="config.userOptions.annotator?.followZoom"
            :annotationViewport="annotationViewport"
            :backgroundColor="chart.backgroundColor"
            :color="chart.color"
            :active="isAnnotator"
            :isCursorPointer="config.userOptions.useCursorPointer"
            :palette="config.userOptions.annotatorPalette"
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
            v-if="
                initialLayoutReady &&
                config.userOptions.show &&
                graph.nodes.length &&
                !loading &&
                (config.userOptions.keepStateOnChartLeave || userOptionsVisible)
            "
            ref="userOptionsRef"
            :uid="uid"
            :chartElement="root"
            :backgroundColor="chart.backgroundColor"
            :color="chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging || isCallbackImaging || isCallbackSvg"
            :hasAltCopy="config.userOptions.buttons.altCopy"
            @copyAlt="copyAlt"
            :hasPdf="config.userOptions.buttons.pdf"
            :hasImg="config.userOptions.buttons.img"
            :hasSvg="config.userOptions.buttons.svg"
            :hasXls="config.userOptions.buttons.csv"
            :hasTable="config.userOptions.buttons.table"
            :hasFullscreen="config.userOptions.buttons.fullscreen"
            :hasZoom="config.userOptions.buttons.zoom"
            :isZoom="zoomEnabled"
            @toggleZoom="toggleZoom"
            :hasAnnotator="config.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleAnnotator="toggleAnnotator"
            :hasTooltip="
                config.tooltip.show && config.userOptions.buttons.tooltip
            "
            :isTooltip="mutableConfig.showTooltip"
            @toggleTooltip="toggleTooltip"
            :hasLabel="false"
            :isFullscreen="isFullscreen"
            :position="config.userOptions.position"
            :titles="config.userOptions.buttonTitles"
            :callbacks="config.userOptions.callbacks"
            :printScale="config.userOptions.print.scale"
            :isCursorPointer="config.userOptions.useCursorPointer"
            :style="{ visibility: userOptionsVisible ? 'visible' : 'hidden' }"
            @toggleTable="toggleTable"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @generatePdf="generatePdf"
            @toggleFullscreen="toggleFullscreen"
        >
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionPdf optionImg optionSvg optionCsv optionTable optionFullscreen optionZoom optionTooltip optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <div
            v-if="chart.title.text || chart.title.subtitle.text"
            class="vue-ui-graph-title"
        >
            <Title
                :config="{
                    title: { cy: 'graph-title', ...chart.title },
                    subtitle: { cy: 'graph-subtitle', ...chart.title.subtitle },
                }"
            />
        </div>

        <BaseZoomControls
            v-if="
                chart.controls.show &&
                chart.controls.position === 'top' &&
                !loading
            "
            :config="config"
            :scale="relativeZoom"
            :isCursorPointer="config.userOptions.useCursorPointer"
            :zoomEnabled="zoomEnabled"
            :viewLocked="viewLocked"
            withFit
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="resetZoom"
            @fitToView="fitToView()"
        />

        <svg
            ref="svg"
            class="vue-ui-graph-svg"
            :viewBox="`0 0 ${width} ${height}`"
            :style="{
                height: isFullscreen
                    ? '0px'
                    : config.responsive
                      ? `${height}px`
                      : 'auto',
                aspectRatio: `${width} / ${height}`,
                touchAction: 'none',
                cursor: batchedNodes && hoveredNode ? 'grab' : undefined,
            }"
            role="group"
            :aria-label="chart.title.text || 'Interactive network graph'"
            :aria-busy="
                loading || (!initialLayoutReady && graph.nodes.length > 0)
            "
            :aria-describedby="`${uid}-keyboard-hint`"
            @wheel="wheel"
            :tabindex="isAnnotator ? -1 : 0"
            :aria-activedescendant="
                hoveredNode
                    ? batchedNodes
                        ? `${uid}-active-node`
                        : `${uid}-node-${hoveredNode.index}`
                    : undefined
            "
            @focus="keyboardFocus"
            @blur="
                isFocus = false;
                pointerLeave();
            "
            @keydown="keyboardNavigate"
            @click="canvasClick"
            @pointerleave="pointerLeave"
            @pointerdown="pointerDown"
            @pointermove="pointerMove"
            @pointerup="up"
            @pointercancel="up"
            @lostpointercapture="up"
            @dblclick="config.interaction.zoom.fitOnDoubleClick && fitToView()"
        >
            <PackageVersion />
            <desc :id="`${uid}-keyboard-hint`">
                {{ config.a11y.translations.keyboardNavigation }}
            </desc>

            <defs>
                <filter
                    :id="`${uid}-glow`"
                    x="-100%"
                    y="-100%"
                    width="300%"
                    height="300%"
                >
                    <feGaussianBlur
                        in="SourceGraphic"
                        :stdDeviation="chart.nodes.glow.blur"
                        result="blur"
                    />
                    <feComponentTransfer in="blur" result="halo">
                        <feFuncA
                            type="linear"
                            :slope="chart.nodes.glow.opacity"
                        />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode in="halo" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <radialGradient :id="`${uid}-gradient`">
                    <stop
                        offset="0"
                        :stop-color="chart.nodes.gradientColor"
                        stop-opacity="0.65"
                    />
                    <stop
                        offset="1"
                        :stop-color="chart.nodes.gradientColor"
                        stop-opacity="0"
                    />
                </radialGradient>
            </defs>

            <rect width="100%" height="100%" :fill="chart.backgroundColor" />

            <slot
                name="chart-background"
                :width="width"
                :height="height"
                :config="config"
            />
            <g
                v-if="initialLayoutReady"
                class="vue-ui-graph-network"
                :transform="`translate(${viewport.x},${viewport.y}) scale(${viewport.k})`"
            >
                <slot
                    name="svg-underlayer"
                    :nodes="graph.nodes"
                    :links="graph.links"
                    :config="config"
                    :viewport="viewport"
                />
                <g
                    class="vue-ui-graph-links"
                    pointer-events="none"
                    fill="none"
                    :filter="
                        effects && chart.links.glow
                            ? `url(#${uid}-glow)`
                            : undefined
                    "
                >
                    <g v-for="(batch, i) in linkBatches" :key="i">
                        <path
                            class="vue-ui-graph-link"
                            :d="batch.d"
                            :stroke="batch.color"
                            :stroke-width="batch.width"
                            :opacity="chart.links.opacity * dim"
                            pointer-events="none"
                        />
                        <path
                            v-if="
                                batch.arrowD && !chart.links.arrows.showOnHover
                            "
                            class="vue-ui-graph-arrows"
                            :d="batch.arrowD"
                            :fill="batch.color"
                            :opacity="chart.links.opacity * dim"
                            stroke="none"
                        />
                    </g>
                    <TransitionGroup
                        tag="g"
                        name="vue-ui-graph-highlight"
                        :css="config.animation.enabled && !reduced"
                    >
                        <g
                            v-for="(batch, i) in highlightedLinks"
                            class="vue-ui-graph-link-highlight-batch"
                            :key="
                                JSON.stringify([
                                    typeof highlightId,
                                    highlightId,
                                    i,
                                ])
                            "
                            :opacity="overlayOpacity(chart.links.opacity)"
                        >
                            <path
                                class="vue-ui-graph-link vue-ui-graph-link-highlight"
                                :d="batch.d"
                                :stroke="batch.color"
                                :stroke-width="batch.width"
                                pointer-events="none"
                            />
                            <path
                                v-if="
                                    batch.arrowD &&
                                    !chart.links.arrows.showOnHover
                                "
                                class="vue-ui-graph-arrows vue-ui-graph-arrows-highlight"
                                :d="batch.arrowD"
                                :fill="batch.color"
                                stroke="none"
                            />
                        </g>
                    </TransitionGroup>
                    <path
                        v-for="batch in hoveredArrowBatches"
                        :key="batch.key"
                        class="vue-ui-graph-arrows vue-ui-graph-arrows-hover"
                        :d="batch.arrowD"
                        :fill="batch.color"
                        :opacity="chart.links.opacity"
                        stroke="none"
                        pointer-events="none"
                    />
                </g>
                <g
                    ref="pulseLayer"
                    class="vue-ui-graph-pulses"
                    pointer-events="none"
                    aria-hidden="true"
                >
                    <path
                        v-for="batch in pulseBatches"
                        :key="batch.key"
                        :ref="
                            (element) =>
                                element
                                    ? pulsePaths.set(batch.key, element)
                                    : pulsePaths.delete(batch.key)
                        "
                        :fill="batch.color"
                        :opacity="batch.opacity"
                        stroke="none"
                        pointer-events="none"
                    />
                </g>
                <g
                    v-if="batchedNodes"
                    class="vue-ui-graph-nodes vue-ui-graph-nodes-batched"
                    pointer-events="none"
                >
                    <g
                        :stroke="chart.nodes.stroke"
                        :stroke-width="chart.nodes.strokeWidth"
                        :filter="
                            effects && chart.nodes.glow.show
                                ? `url(#${uid}-glow)`
                                : undefined
                        "
                    >
                        <path
                            v-for="(batch, i) in nodeBatches"
                            :key="i"
                            class="vue-ui-graph-node-batch"
                            :d="batch.d"
                            :fill="batch.color"
                            :opacity="chart.nodes.opacity * dim"
                        />
                        <TransitionGroup
                            tag="g"
                            name="vue-ui-graph-highlight"
                            :css="config.animation.enabled && !reduced"
                        >
                            <path
                                v-for="(batch, i) in highlightedNodes"
                                :key="
                                    JSON.stringify([
                                        typeof highlightId,
                                        highlightId,
                                        i,
                                    ])
                                "
                                class="vue-ui-graph-node-batch"
                                :d="batch.d"
                                :fill="batch.color"
                                :opacity="overlayOpacity(chart.nodes.opacity)"
                            />
                        </TransitionGroup>
                    </g>
                    <circle
                        v-if="selectedNode"
                        :cx="selectedNode.x"
                        :cy="selectedNode.y"
                        :r="selectedNode.radius"
                        fill="none"
                        :stroke="chart.nodes.selected.stroke"
                        :stroke-width="chart.nodes.selected.strokeWidth"
                        :opacity="
                            chart.nodes.opacity * opacity(selectedNode.id)
                        "
                        class="vue-ui-graph-node-overlay"
                    />
                    <g
                        v-if="hoveredNode"
                        :id="`${uid}-active-node`"
                        role="button"
                        :aria-label="`${hoveredNode.label ?? hoveredNode.id}, ${hoveredNode.degree} connections`"
                        :aria-pressed="selected === hoveredNode.id"
                        :aria-describedby="
                            mutableConfig.showTooltip
                                ? `${uid}-tooltip`
                                : undefined
                        "
                    >
                        <circle
                            :cx="hoveredNode.x"
                            :cy="hoveredNode.y"
                            :r="hoveredNode.radius"
                            fill="none"
                            :stroke="
                                selected === hoveredNode.id
                                    ? chart.nodes.selected.stroke
                                    : chart.nodes.hover.stroke
                            "
                            :stroke-width="
                                selected === hoveredNode.id
                                    ? chart.nodes.selected.strokeWidth
                                    : chart.nodes.hover.strokeWidth
                            "
                            :opacity="chart.nodes.opacity"
                            class="vue-ui-graph-node-overlay"
                        />
                        <circle
                            v-if="keyboardNode !== null"
                            :cx="hoveredNode.x"
                            :cy="hoveredNode.y"
                            :r="hoveredNode.radius + 4"
                            fill="none"
                            :stroke="chart.color"
                            stroke-width="2"
                            stroke-dasharray="3 2"
                        />
                    </g>
                </g>
                <g v-else class="vue-ui-graph-nodes">
                    <g
                        v-for="(n, i) in graph.nodes"
                        :key="n.id"
                        class="vue-ui-graph-node"
                        :data-node-index="n.index"
                        :id="`${uid}-node-${i}`"
                        :transform="`translate(${n.x},${n.y})`"
                        :opacity="chart.nodes.opacity * opacity(n.id)"
                        :tabindex="-1"
                        role="button"
                        :aria-label="`${n.label ?? n.id}, ${n.degree} connections`"
                        :aria-pressed="selected === n.id"
                        :aria-describedby="
                            mutableConfig.showTooltip && hovered === n.id
                                ? `${uid}-tooltip`
                                : undefined
                        "
                        @pointerenter="hover(n, $event)"
                        @pointerleave="hover(null)"
                        @focus="focusIndividualNode(n)"
                        @blur="hover(null)"
                        @pointerdown.stop="down($event, n)"
                        @click.stop="select(n)"
                        @keydown.enter.prevent="select(n)"
                        @keydown.space.prevent="select(n)"
                    >
                        <title v-if="!mutableConfig.showTooltip">
                            {{ n.label ?? n.id }}
                        </title>
                        <slot
                            name="node"
                            :node="n.raw"
                            :radius="n.radius"
                            :color="n.color"
                            :selected="selected === n.id"
                            :hovered="hovered === n.id"
                        >
                            <circle
                                class="vue-ui-graph-circle"
                                :r="n.radius"
                                :fill="n.color"
                                :stroke="
                                    selected === n.id
                                        ? chart.nodes.selected.stroke
                                        : hovered === n.id
                                          ? chart.nodes.hover.stroke
                                          : chart.nodes.stroke
                                "
                                :stroke-width="
                                    selected === n.id
                                        ? chart.nodes.selected.strokeWidth
                                        : hovered === n.id
                                          ? chart.nodes.hover.strokeWidth
                                          : chart.nodes.strokeWidth
                                "
                                :filter="
                                    effects && chart.nodes.glow.show
                                        ? `url(#${uid}-glow)`
                                        : undefined
                                "
                            />
                            <circle
                                v-if="effects && chart.nodes.gradient"
                                :r="n.radius"
                                :fill="`url(#${uid}-gradient)`"
                                pointer-events="none"
                            />
                        </slot>
                    </g>
                </g>
                <slot
                    name="svg"
                    :nodes="graph.nodes"
                    :links="graph.links"
                    :config="config"
                    :viewport="viewport"
                />
                <g
                    class="vue-ui-graph-labels"
                    pointer-events="none"
                    aria-hidden="true"
                >
                    <text
                        :stroke="chart.backgroundColor"
                        :stroke-width="chart.nodes.labels.strokeWidth"
                        stroke-linejoin="round"
                        stroke-linecap="round"
                        paint-order="stroke fill"
                        v-for="n in visibleLabels"
                        :key="n.id"
                        :x="n.x"
                        :y="n.y + labelOffsetY(n)"
                        text-anchor="middle"
                        :font-size="chart.nodes.labels.fontSize"
                        :fill="chart.nodes.labels.color"
                        :opacity="
                            (batchedNodes ? 1 : chart.nodes.opacity) *
                            opacity(n.id)
                        "
                        dominant-baseline="middle"
                        v-html="labelTSpans(n, true)"
                        style="user-select: none"
                    />
                </g>
            </g>
            <slot name="watermark" :width="width" :height="height" />
        </svg>
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
        <div
            v-if="$slots.hint"
            style="position: absolute; top: 100%; left: 0; width: 100%"
            data-dom-to-png-ignore
            aria-hidden="true"
        >
            <slot
                name="hint"
                :hint="config.a11y.translations.keyboardNavigation"
                :isVisible="isFocus"
            />
        </div>
        <BaseZoomControls
            v-if="
                chart.controls.show &&
                chart.controls.position === 'bottom' &&
                !loading
            "
            :config="config"
            :scale="relativeZoom"
            :isCursorPointer="config.userOptions.useCursorPointer"
            :zoomEnabled="zoomEnabled"
            :viewLocked="viewLocked"
            withFit
            @zoomIn="zoomIn"
            @zoomOut="zoomOut"
            @resetZoom="resetZoom"
            @fitToView="fitToView()"
        />
        <div v-if="$slots.source" dir="auto">
            <slot name="source" />
        </div>
        <div
            v-if="graph.nodes.length && mutableConfig.showTable"
            class="vue-ui-graph-table-container"
        >
            <component
                :is="tableComponent.component"
                v-bind="tableComponent.props"
                ref="tableUnit"
                @close="closeTable"
            >
                <template
                    v-if="config.table.useDialog && !config.table.show"
                    #title
                    >{{ tableComponent.title }}</template
                >
                <template #content>
                    <DataTable
                        v-for="kind in ['nodes', 'links']"
                        :key="kind + tableKey"
                        :colNames="tableData[kind].head"
                        :head="tableData[kind].head"
                        :body="tableData[kind].body"
                        :config="tableStyle"
                        :title="config.table.columnNames[kind]"
                        :withCloseButton="
                            kind === 'nodes' &&
                            !(config.table.useDialog && !config.table.show)
                        "
                        :isCursorPointer="config.userOptions.useCursorPointer"
                        @close="closeTable"
                    >
                        <template #th="{ th }">{{ th }}</template>
                        <template #td="{ td }">{{
                            td !== null && typeof td === 'object' ? td.name : td
                        }}</template>
                    </DataTable>
                </template>
            </component>
        </div>
        <Tooltip
            ref="tooltipRef"
            :teleportTo="config.tooltip.teleportTo"
            :show="
                mutableConfig.showTooltip &&
                !isDraggingNode &&
                !!tooltipData &&
                !loading &&
                !isAnnotator
            "
            :backgroundColor="config.tooltip.backgroundColor"
            :color="config.tooltip.color"
            :borderRadius="config.tooltip.borderRadius"
            :borderColor="config.tooltip.borderColor"
            :borderWidth="config.tooltip.borderWidth"
            :fontSize="config.tooltip.fontSize"
            :backgroundOpacity="config.tooltip.backgroundOpacity"
            :position="config.tooltip.position"
            :offsetX="config.tooltip.offsetX"
            :offsetY="config.tooltip.offsetY"
            :parent="root"
            :isFullscreen="isFullscreen"
            :smooth="
                config.tooltip.smooth && config.animation.enabled && !reduced
            "
            :backdropFilter="config.tooltip.backdropFilter"
            :smoothForce="config.tooltip.smoothForce"
            :smoothSnapThreshold="config.tooltip.smoothSnapThreshold"
            :isA11yMode="tooltipTriggerMode === 'keyboard'"
            :a11yPosition="tooltipA11yPosition"
        >
            <template #tooltip-before
                ><slot name="tooltip-before" v-bind="tooltipScope"
            /></template>
            <template #tooltip>
                <div
                    :id="`${uid}-tooltip`"
                    class="vue-ui-graph-tooltip-content"
                    :class="{
                        'vue-ui-graph-tooltip-default':
                            !slots.tooltip &&
                            typeof config.tooltip.customFormat !== 'function',
                    }"
                >
                    <slot name="tooltip" v-bind="tooltipScope">
                        <template
                            v-if="
                                typeof config.tooltip.customFormat ===
                                'function'
                            "
                            >{{ tooltipText }}</template
                        >
                        <template v-else-if="tooltipData">
                            <div class="vue-ui-graph-tooltip-row">
                                <svg
                                    v-if="tooltipData.raw.color"
                                    data-cy="graph-tooltip-node-marker"
                                    class="vue-ui-graph-tooltip-marker"
                                    viewBox="0 0 14 14"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="7"
                                        cy="7"
                                        r="7"
                                        :fill="tooltipData.color"
                                    />
                                </svg>
                                <span>{{
                                    tooltipData.label ?? tooltipData.id
                                }}</span>
                            </div>
                            <div
                                v-if="tooltipData.group != null"
                                class="vue-ui-graph-tooltip-row"
                            >
                                <svg
                                    data-cy="graph-tooltip-group-marker"
                                    class="vue-ui-graph-tooltip-marker"
                                    viewBox="0 0 14 14"
                                    aria-hidden="true"
                                >
                                    <circle
                                        cx="7"
                                        cy="7"
                                        r="7"
                                        :fill="tooltipData.groupColor"
                                    />
                                </svg>
                                <span>Group: {{ tooltipData.group }}</span>
                            </div>
                            <div v-if="tooltipData.value != null">
                                Value: {{ tooltipData.value }}
                            </div>
                            <div>Connections: {{ tooltipData.degree }}</div>
                            <div
                                v-if="
                                    config.tooltip.showMetadata &&
                                    tooltipData.metadata
                                "
                                class="vue-ui-graph-tooltip-metadata"
                            >
                                {{ metadataText(tooltipData.metadata) }}
                            </div>
                        </template>
                    </slot>
                </div>
            </template>
            <template #tooltip-after
                ><slot name="tooltip-after" v-bind="tooltipScope"
            /></template>
        </Tooltip>
    </div>
</template>

<style scoped>
.vue-ui-graph {
    position: relative;
    width: 100%;
    isolation: isolate;
}

.vue-ui-graph-fullscreen {
    position: fixed;
    inset: 0;
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100dvh;
    max-width: none;
    max-height: none;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow: hidden;
}

.vue-ui-graph-fullscreen > .vue-ui-graph-svg {
    flex: 1 1 0;
    min-height: 0;
}

.vue-ui-graph-fullscreen > .vue-ui-graph-title,
.vue-ui-graph-fullscreen > :deep(.vue-data-ui-zoom-controls) {
    flex: 0 0 auto;
}

.vue-ui-graph-fullscreen > .vue-ui-graph-table-container {
    flex: 0 1 auto;
    max-height: 35%;
    min-height: 0;
    overflow: auto;
}

.vue-ui-graph-svg {
    -webkit-user-select: none;
    user-select: none;
    display: block;
    width: 100%;
    overflow: hidden;
}

.vue-ui-graph-svg:focus {
    outline: none;
}

.vue-ui-graph-svg:focus-visible {
    outline: 2px solid currentColor;
}

.vue-ui-graph-title {
    width: 100%;
    padding: 12px 0;
}

.vue-ui-graph-link,
.vue-ui-graph-node,
.vue-ui-graph-node-batch,
.vue-ui-graph-node-overlay {
    transition:
        opacity var(--graph-transition, 0ms),
        stroke var(--graph-transition, 0ms),
        stroke-width var(--graph-transition, 0ms),
        fill var(--graph-transition, 0ms);
}

.vue-ui-graph-link-highlight-batch {
    transition: opacity var(--graph-transition, 0ms);
}

.vue-ui-graph-highlight-enter-from,
.vue-ui-graph-highlight-leave-to {
    opacity: 0;
}

.vue-ui-graph-node {
    cursor: grab;
    outline: none;
}

.vue-ui-graph-node:focus-visible .vue-ui-graph-circle {
    stroke: currentColor;
    stroke-width: 4px;
}

.vue-ui-graph-tooltip-content {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
}

.vue-ui-graph-tooltip-default {
    white-space: normal;
}
.vue-ui-graph-tooltip-metadata {
    white-space: pre-wrap;
}

.vue-ui-graph-tooltip-row {
    display: flex;
    align-items: center;
    gap: 6px;
}
.vue-ui-graph-tooltip-marker {
    width: 14px;
    height: 14px;
    flex: 0 0 14px;
}
</style>

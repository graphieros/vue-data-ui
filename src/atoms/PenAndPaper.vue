<script setup>
import {
    ref,
    onMounted,
    onBeforeUnmount,
    computed,
    nextTick,
    watch,
} from 'vue';
import {
    captureAnnotationAnchor,
    projectAnnotationAnchor,
} from '../utils/annotationAnchors';
import BaseIcon from './BaseIcon.vue';
import ColorPicker from './ColorPicker.vue';
import { dataLabel, lightenHexColor, XMLNS, createUid } from '../lib';

const props = defineProps({
    svgRef: {
        type: [Object, null, undefined],
        required: true,
    },
    showGroupActions: {
        type: Boolean,
        default: true,
    },
    followZoom: {
        type: Boolean,
        default: false,
    },
    // Root SVG projections
    annotationViewport: {
        type: Object,
        default: null,
    },
    color: {
        type: String,
        default: '#2D353C',
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF',
    },
    active: {
        type: Boolean,
        default: false,
    },
    isCursorPointer: {
        type: Boolean,
        default: false,
    },
    palette: {
        type: Array,
        default: () => [
            '#000000',
            '#FFFFFF',
            '#FF5733',
            '#33FF57',
            '#3357FF',
            '#FFC300',
            '#800080',
            '#FF1493',
            '#00CED1',
        ],
    },
});

const emit = defineEmits(['close']);

const stack = ref([]);
const redoStack = ref([]);
const currentColor = ref(props.color);
const strokeWidth = ref(2);
const isDrawing = ref(false);
const currentPath = ref('');
const G = ref(null);
const currentDrawingPath = ref(null);
const currentLine = ref(null);
const startPoint = ref(null);
const selectedShape = ref(null);
const selectedShapes = ref([]);
const isMultiSelecting = ref(false);
const canGroup = computed(() => selectedShapes.value.length > 1);
const canUngroup = computed(() =>
    selectedShape.value?.hasAttribute('data-annotation-group'),
);
const selectionBox = ref(null);
const isDraggingShape = ref(false);
const shapeDragStart = ref(null);
const shapeDragBaseTransform = ref('');
const shapeDragOriginalState = ref('');
const shapeDragMoved = ref(false);
const shapeWasSelectedAtPointerDown = ref(false);
const lineEndpointDrag = ref(null);
const lineEndpointDragStart = ref(null);
const isSyncingControls = ref(false);
const pendingDrawingState = ref('');
const HISTORY_MERGE_WINDOW_MS = 750; // If a property is modified on the same shape within this window, it is part of he same editing action, to avoid spamming history
const SHAPE_HIT_PADDING = 8;
const SHAPE_DRAG_THRESHOLD = 2;
const arrowMarkerIds = new Map();
const ARROW_DEFS_ID = ref(`arrow-def-${createUid()}`);

const isEditingText = ref(false);
const editingTextNode = ref(null);
const editingTextAnchor = ref({ x: 0, y: 0 });
const editingTextContent = ref(['']);
const editingCaret = ref({ row: 0, col: 0 });
const fontSize = ref(16);
const editingTextRegistered = ref(false);
const editingTextOriginalState = ref('');
const editingTextIsExisting = ref(false);

const modes = ['arrow', 'text', 'line', 'draw'];
const modeIndex = ref(0);
const mode = computed(() => modes[modeIndex.value]);

const iconMap = {
    arrow: 'plotArrow',
    text: 'text',
    line: 'plotLine',
    draw: 'annotator',
};

const cursorDraw = ref(
    `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABg2lDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVh2YQcchQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQrPKNKtnAtB020wn4lIuvyqFXhGGiAhCiMnMMpKZxSx8x9c9Any9i/Es/3N/jgG1YDEgIBHPMcO0iTeIZzZtg/M+scjKskp8Tjxu0gWJH7muePzGueSywDNFM5ueJxaJpVIXK13MyqZGPE0cVTWd8oWcxyrnLc5atc7a9+QvDBf0lQzXaY4ggSUkkYIEBXVUUIWNGK06KRbStB/38Q+7/hS5FHJVwMixgBo0yK4f/A9+d2sVpya9pHAc6H1xnI9RILQLtBqO833sOK0TIPgMXOkdf60JzH6S3uho0SNgcBu4uO5oyh5wuQMMPRmyKbtSkKZQLALvZ/RNeSByC/Sveb2193H6AGSpq+Ub4OAQGCtR9rrPu/u6e/v3TLu/H5C7crM1WjgWAAAABmJLR0QAqwB5AHWF+8OUAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5gwUExIUagzGcQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABfSURBVBjTldAxDoNQDIPhL0+q1L33P1AvAhN7xfK6WAgoLfSfrNiykpQtE+7RLzx2vgF9D3o8lWDmn1QVVMP0LZQGmNtqp1/cmou0XHdG/+sYeGZwFBqPCub8rkcvvAGvsi1VYarR8wAAAABJRU5ErkJggg==') 5 5, auto`,
);

function getDoodleFromEventTarget(event) {
    const target = event?.target;
    if (!(target instanceof Element)) return null;
    let doodle = target.closest('.vue-data-ui-doodle');
    if (!doodle || !G.value?.contains(doodle)) return null;
    while (doodle.parentElement && doodle.parentElement !== G.value) {
        doodle = doodle.parentElement;
    }
    return doodle;
}

function getSelectionHandleFromEvent(event) {
    const target = event?.target;
    if (!(target instanceof Element)) return null;
    const handle = target.closest('.vue-data-ui-selection-handle');
    return handle && G.value?.contains(handle) ? handle : null;
}

function getSelectionDeleteButtonFromEvent(event) {
    const target = event?.target;
    if (!(target instanceof Element)) return null;
    const button = target.closest('.vue-data-ui-selection-delete');
    return button && G.value?.contains(button) ? button : null;
}

function getDoodleId(shape) {
    if (!shape) return '';
    let id = shape.getAttribute('data-doodle-id');
    if (!id) {
        id = createUid();
        shape.setAttribute('data-doodle-id', id);
    }
    return id;
}

function annotationShapes() {
    return Array.from(G.value?.children || []).filter((child) =>
        child.classList?.contains('vue-data-ui-doodle'),
    );
}

let captureViewport = null;
function captureAnchors(
    viewport = captureViewport || props.annotationViewport,
    force = false,
) {
    if (!props.followZoom || !viewport) return;
    annotationShapes().forEach((shape) =>
        captureAnnotationAnchor(shape, props.svgRef, viewport, force),
    );
}

function projectAnchors() {
    if (!props.followZoom || !props.annotationViewport) return;
    annotationShapes().forEach((shape) =>
        projectAnnotationAnchor(shape, props.annotationViewport),
    );
    updateSelectionBox();
}

const annotationClip = ref(null);
const annotationClipId = `annotation-clip-${createUid()}`;

function syncAnnotationViewport() {
    if (!G.value) return;
    const viewport = props.followZoom && props.annotationViewport;
    if (!viewport) {
        G.value.removeAttribute('clip-path');
        G.value.removeAttribute('data-annotation-inactive');
        return;
    }
    if (!annotationClip.value) {
        annotationClip.value = document.createElementNS(XMLNS, 'clipPath');
        annotationClip.value.setAttribute('id', annotationClipId);
        annotationClip.value.setAttribute('clipPathUnits', 'userSpaceOnUse');
        annotationClip.value.appendChild(
            document.createElementNS(XMLNS, 'rect'),
        );
        props.svgRef.appendChild(annotationClip.value);
    }
    const rect = annotationClip.value.firstChild;
    for (const key of ['x', 'y', 'width', 'height']) {
        rect.setAttribute(key, viewport.clip[key]);
    }
    G.value.setAttribute('clip-path', `url(#${annotationClipId})`);
    G.value.toggleAttribute('data-annotation-inactive', !props.active);
}

watch(
    [() => props.followZoom, () => props.annotationViewport],
    ([enabled], [wasEnabled, previousViewport]) => {
        // Finish edits in the coordinate system in which they were made.
        captureViewport = previousViewport || props.annotationViewport;
        if (isEditingText.value) cleanupSvgTextEditing(false);
        if (isDrawing.value) {
            if (currentDrawingPath.value) {
                currentDrawingPath.value.setAttribute(
                    'd',
                    optimizeSvgPath(smoothPath(currentPath.value)),
                );
            }
            commitHistory(pendingDrawingState.value);
            isDrawing.value = false;
            currentDrawingPath.value = null;
            currentLine.value = null;
            pendingDrawingState.value = '';
        }
        if (shapeDragMoved.value) stopShapeInteraction();
        if (enabled) {
            captureAnchors(
                previousViewport || props.annotationViewport,
                !wasEnabled,
            );
            projectAnchors();
        }
        captureViewport = null;
        syncAnnotationViewport();
    },
    { flush: 'post' },
);

function serializeDoodles() {
    if (!G.value) return '';
    captureAnchors();
    return Array.from(G.value.children)
        .filter((child) => child.classList?.contains('vue-data-ui-doodle'))
        .map((child) => child.outerHTML)
        .join('');
}

function restoreDoodles(state) {
    if (!G.value) return;

    deselectShape();
    const caret = G.value.querySelector('.vue-data-ui-svg-caret');
    if (caret) caret.remove();

    Array.from(G.value.children).forEach((child) => {
        if (child.classList?.contains('vue-data-ui-doodle')) child.remove();
    });

    if (state) {
        const holder = document.createElementNS(XMLNS, 'g');
        holder.innerHTML = state;
        Array.from(holder.children).forEach((child) =>
            G.value.appendChild(child),
        );
    }
    // Snapshots created before following was enabled have no data-space anchor.
    if (props.followZoom) {
        annotationShapes().forEach((shape) => {
            if (!shape.hasAttribute('data-annotation-anchor')) {
                captureAnnotationAnchor(
                    shape,
                    props.svgRef,
                    props.annotationViewport,
                );
            }
        });
    }
    projectAnchors();
}

function commitHistory(beforeState, mergeKey = null) {
    const afterState = serializeDoodles();
    if (beforeState === afterState) return;

    const now = Date.now();
    const last = stack.value[stack.value.length - 1];
    const canMerge =
        mergeKey &&
        last?.mergeKey === mergeKey &&
        now - last.timestamp <= HISTORY_MERGE_WINDOW_MS;

    if (canMerge) {
        last.timestamp = now;
    } else {
        stack.value.push({
            state: beforeState,
            mergeKey,
            timestamp: now,
        });
    }
    redoStack.value = [];
}

function getEventClientPoint(event) {
    const touch = event.touches?.[0] || event.changedTouches?.[0];
    return {
        x: touch ? touch.clientX : event.clientX,
        y: touch ? touch.clientY : event.clientY,
    };
}

function getShapeLocalPoint(shape, event) {
    const svg = props.svgRef;
    if (!svg || !shape) return null;

    const { x, y } = getEventClientPoint(event);
    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;

    const matrix = shape.getScreenCTM()?.inverse();
    return matrix ? point.matrixTransform(matrix) : null;
}

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    if (!lengthSquared) return Math.hypot(px - x1, py - y1);

    const t = Math.max(
        0,
        Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lengthSquared),
    );
    const x = x1 + t * dx;
    const y = y1 + t * dy;
    return Math.hypot(px - x, py - y);
}

function isShapeNearEvent(shape, event) {
    if (shape.hasAttribute('data-annotation-group')) {
        return Array.from(shape.children).some((child) =>
            isShapeNearEvent(child, event),
        );
    }
    const point = getShapeLocalPoint(shape, event);
    if (!point) return false;

    const tagName = shape.tagName.toLowerCase();
    const padding = SHAPE_HIT_PADDING * getSvgUnitsPerPixel(shape);

    if (tagName === 'line') {
        const x1 = Number(shape.getAttribute('x1'));
        const y1 = Number(shape.getAttribute('y1'));
        const x2 = Number(shape.getAttribute('x2'));
        const y2 = Number(shape.getAttribute('y2'));
        const stroke = Number(shape.getAttribute('stroke-width')) || 0;
        return (
            pointToSegmentDistance(point.x, point.y, x1, y1, x2, y2) <=
            Math.max(padding, stroke / 2)
        );
    }

    if (tagName === 'circle') {
        const cx = Number(shape.getAttribute('cx'));
        const cy = Number(shape.getAttribute('cy'));
        const radius = Number(shape.getAttribute('r')) || 0;
        return Math.hypot(point.x - cx, point.y - cy) <= radius + padding;
    }

    if (tagName === 'text') {
        try {
            const bbox = shape.getBBox();
            return (
                point.x >= bbox.x - padding &&
                point.x <= bbox.x + bbox.width + padding &&
                point.y >= bbox.y - padding &&
                point.y <= bbox.y + bbox.height + padding
            );
        } catch {
            return false;
        }
    }

    if (tagName === 'path') {
        try {
            const bbox = shape.getBBox();
            if (
                point.x < bbox.x - padding ||
                point.x > bbox.x + bbox.width + padding ||
                point.y < bbox.y - padding ||
                point.y > bbox.y + bbox.height + padding
            ) {
                return false;
            }

            if (typeof shape.isPointInStroke === 'function') {
                const previousWidth = shape.getAttribute('stroke-width');
                const hitWidth = Math.max(
                    Number(previousWidth) || 0,
                    padding * 2,
                );
                shape.setAttribute('stroke-width', hitWidth);
                const hit = shape.isPointInStroke(point);
                if (previousWidth === null)
                    shape.removeAttribute('stroke-width');
                else shape.setAttribute('stroke-width', previousWidth);
                return hit;
            }

            const length = shape.getTotalLength();
            const step = 2 * getSvgUnitsPerPixel(shape);
            for (let distance = 0; distance <= length; distance += step) {
                const sample = shape.getPointAtLength(distance);
                if (
                    Math.hypot(point.x - sample.x, point.y - sample.y) <=
                    padding
                ) {
                    return true;
                }
            }
        } catch {
            return false;
        }
    }

    return false;
}

function findShapeAtEvent(event) {
    const direct = getDoodleFromEventTarget(event);
    if (direct) return direct;
    if (!G.value) return null;

    const shapes = annotationShapes().reverse();
    return shapes.find((shape) => isShapeNearEvent(shape, event)) || null;
}

let hoverOutline = null;

function clearHoverOutline() {
    hoverOutline?.remove();
    hoverOutline = null;
}

function updateHoverOutline(event) {
    clearHoverOutline();
    if (!props.active || !isMultiSelecting.value || !G.value) return;
    const shape = findShapeAtEvent(event);
    if (!shape || selectedShapes.value.includes(shape)) return;
    try {
        const bbox = shape.getBBox();
        const padding = 4 * getSvgUnitsPerPixel(shape);
        const rect = document.createElementNS(XMLNS, 'rect');
        rect.setAttribute('class', 'vue-data-ui-annotation-hover-outline');
        rect.setAttribute('x', bbox.x - padding);
        rect.setAttribute('y', bbox.y - padding);
        rect.setAttribute(
            'width',
            Math.max(bbox.width + padding * 2, padding * 2),
        );
        rect.setAttribute(
            'height',
            Math.max(bbox.height + padding * 2, padding * 2),
        );
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', props.color);
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('stroke-dasharray', '4 3');
        rect.setAttribute('vector-effect', 'non-scaling-stroke');
        rect.setAttribute('pointer-events', 'none');
        const transform = shape.getAttribute('transform');
        if (transform) rect.setAttribute('transform', transform);
        G.value.appendChild(rect);
        hoverOutline = rect;
    } catch {
        clearHoverOutline();
    }
}

function removeSelectionBox() {
    clearHoverOutline();
    if (selectionBox.value?.parentNode) {
        selectionBox.value.parentNode.removeChild(selectionBox.value);
    }
    selectionBox.value = null;
}

function updateSelectionBox() {
    removeSelectionBox();
    if (isEditingText.value) return;
    if (!props.active || !G.value) return;
    if (selectedShapes.value.length > 1) {
        const overlay = document.createElementNS(XMLNS, 'g');
        overlay.setAttribute('class', 'vue-data-ui-selection-overlay');
        overlay.setAttribute('pointer-events', 'none');
        for (const shape of selectedShapes.value) {
            if (!G.value.contains(shape)) continue;
            const bbox = shape.getBBox();
            const padding = 4 * getSvgUnitsPerPixel(shape);
            const rect = document.createElementNS(XMLNS, 'rect');
            rect.setAttribute('class', 'vue-data-ui-selection-box');
            rect.setAttribute('x', bbox.x - padding);
            rect.setAttribute('y', bbox.y - padding);
            rect.setAttribute(
                'width',
                Math.max(bbox.width + padding * 2, padding * 2),
            );
            rect.setAttribute(
                'height',
                Math.max(bbox.height + padding * 2, padding * 2),
            );
            rect.setAttribute('fill', 'none');
            rect.setAttribute('stroke', props.color);
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('vector-effect', 'non-scaling-stroke');
            rect.setAttribute('stroke-dasharray', '4 3');
            rect.setAttribute('pointer-events', 'none');
            const transform = shape.getAttribute('transform');
            if (transform) rect.setAttribute('transform', transform);
            overlay.appendChild(rect);
        }
        G.value.appendChild(overlay);
        selectionBox.value = overlay;
        return;
    }
    if (!selectedShape.value || !G.value.contains(selectedShape.value)) return;

    try {
        const shape = selectedShape.value;
        const bbox = shape.getBBox();
        const padding = 4 * getSvgUnitsPerPixel(shape);
        const overlay = document.createElementNS(XMLNS, 'g');
        overlay.setAttribute('class', 'vue-data-ui-selection-overlay');

        const rect = document.createElementNS(XMLNS, 'rect');
        rect.setAttribute('class', 'vue-data-ui-selection-box');
        rect.setAttribute('x', bbox.x - padding);
        rect.setAttribute('y', bbox.y - padding);
        rect.setAttribute(
            'width',
            Math.max(bbox.width + padding * 2, padding * 2),
        );
        rect.setAttribute(
            'height',
            Math.max(bbox.height + padding * 2, padding * 2),
        );
        rect.setAttribute('fill', 'none');
        rect.setAttribute('stroke', props.color);
        rect.setAttribute('stroke-width', '1');
        rect.setAttribute('vector-effect', 'non-scaling-stroke');
        rect.setAttribute('stroke-dasharray', '4 3');
        rect.setAttribute('pointer-events', 'none');
        overlay.appendChild(rect);

        if (!isMultiSelecting.value && shape.tagName.toLowerCase() === 'line') {
            const handleRadius = 5 * getSvgUnitsPerPixel(shape);
            const handleStrokeWidth = 1.5;
            const endpoints = [
                {
                    endpoint: 'start',
                    x: Number(shape.getAttribute('x1')),
                    y: Number(shape.getAttribute('y1')),
                },
                {
                    endpoint: 'end',
                    x: Number(shape.getAttribute('x2')),
                    y: Number(shape.getAttribute('y2')),
                },
            ];

            endpoints.forEach(({ endpoint, x, y }) => {
                const handle = document.createElementNS(XMLNS, 'circle');
                handle.setAttribute('class', 'vue-data-ui-selection-handle');
                handle.setAttribute('data-line-endpoint', endpoint);
                handle.setAttribute('cx', x);
                handle.setAttribute('cy', y);
                handle.setAttribute('r', handleRadius);
                handle.setAttribute('fill', props.backgroundColor);
                handle.setAttribute('stroke', props.color);
                handle.setAttribute('stroke-width', handleStrokeWidth);
                handle.setAttribute('pointer-events', 'all');
                overlay.appendChild(handle);
            });
        }

        // The overlay inherits the selected shape's transform. Account for
        // both that transform and root zoom when sizing the delete control.
        const deleteScale = getSvgUnitsPerPixel(shape);
        const deleteSize = 24 * deleteScale;
        const deleteStrokeWidth = 1;
        const deleteX = bbox.x + bbox.width + padding + 4 * deleteScale;
        const deleteY = bbox.y - padding - deleteSize - 4 * deleteScale;
        const deleteButton = document.createElementNS(XMLNS, 'g');
        deleteButton.setAttribute('class', 'vue-data-ui-selection-delete');
        deleteButton.setAttribute('role', 'button');
        deleteButton.setAttribute('tabindex', '0');
        deleteButton.setAttribute('aria-label', 'Delete selected drawing');
        deleteButton.setAttribute('pointer-events', 'all');

        const deleteBackground = document.createElementNS(XMLNS, 'rect');
        deleteBackground.setAttribute('x', deleteX);
        deleteBackground.setAttribute('y', deleteY);
        deleteBackground.setAttribute('width', deleteSize);
        deleteBackground.setAttribute('height', deleteSize);
        deleteBackground.setAttribute('rx', 4 * deleteScale);
        deleteBackground.setAttribute('fill', props.backgroundColor);
        deleteBackground.setAttribute('stroke', buttonBorderColor.value);
        deleteBackground.setAttribute('stroke-width', deleteStrokeWidth);
        deleteBackground.setAttribute('vector-effect', 'non-scaling-stroke');

        const iconScale = deleteSize / 24;
        const icon = document.createElementNS(XMLNS, 'path');
        icon.setAttribute('d', 'M 8 8 L 16 16 M 16 8 L 8 16');
        icon.setAttribute(
            'transform',
            `translate(${deleteX} ${deleteY}) scale(${iconScale})`,
        );
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', props.color);
        icon.setAttribute('stroke-width', 1.5);
        icon.setAttribute('stroke-linecap', 'round');
        icon.setAttribute('stroke-linejoin', 'round');
        icon.setAttribute('vector-effect', 'non-scaling-stroke');
        icon.setAttribute('pointer-events', 'none');

        deleteButton.appendChild(deleteBackground);
        deleteButton.appendChild(icon);
        deleteButton.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            deleteSelectedShape(event);
        });
        overlay.appendChild(deleteButton);

        const transform = shape.getAttribute('transform');
        if (transform) overlay.setAttribute('transform', transform);

        G.value.appendChild(overlay);
        selectionBox.value = overlay;
    } catch {
        removeSelectionBox();
    }
}

function deselectShape() {
    selectedShape.value = null;
    selectedShapes.value = [];
    isDraggingShape.value = false;
    shapeDragStart.value = null;
    shapeDragBaseTransform.value = '';
    shapeDragOriginalState.value = '';
    shapeDragMoved.value = false;
    shapeWasSelectedAtPointerDown.value = false;
    lineEndpointDrag.value = null;
    lineEndpointDragStart.value = null;
    removeSelectionBox();
    setCursorStyle();
}

function deleteSelectedShape(event = null) {
    if (!props.active || !selectedShape.value || !G.value) return;
    if (!G.value.contains(selectedShape.value)) return;

    if (event?.cancelable) event.preventDefault();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();

    const beforeState = serializeDoodles();
    selectedShape.value.remove();
    commitHistory(beforeState);
    deselectShape();
}

function getShapeColor(shape) {
    if (!shape) return null;
    if (shape.tagName.toLowerCase() === 'text') {
        return shape.getAttribute('fill');
    }
    if (shape.tagName.toLowerCase() === 'circle') {
        return shape.getAttribute('fill');
    }
    return shape.getAttribute('stroke');
}

/**
 * Converts CSS pixel sizes to local SVG units, including viewBox, responsive
 * sizing, CSS transforms and any transforms on an existing annotation.
 * Read at interaction time so resizing and zoom never leave a cached scale.
 * Detached/hidden elements without a usable matrix fall back to one SVG unit.
 */
function getSvgUnitsPerPixel(element = props.svgRef) {
    const matrix = element?.getScreenCTM?.();
    const scale = matrix ? Math.hypot(matrix.a, matrix.b) : 0;
    return Number.isFinite(scale) && scale > 0 ? 1 / scale : 1;
}

function syncControlsFromSelectedShape(shape) {
    if (!shape || shape.hasAttribute('data-annotation-group')) return;
    isSyncingControls.value = true;
    try {
        const tagName = shape.tagName.toLowerCase();
        const shapeColor = getShapeColor(shape);
        if (shapeColor) currentColor.value = shapeColor;

        if (tagName === 'text') {
            modeIndex.value = modes.indexOf('text');
            const size = Number(shape.getAttribute('font-size'));
            if (Number.isFinite(size)) {
                fontSize.value = size / getSvgUnitsPerPixel(shape);
            }
            return;
        }

        if (tagName === 'line') {
            modeIndex.value = shape.hasAttribute('marker-end')
                ? modes.indexOf('arrow')
                : modes.indexOf('line');
        } else {
            modeIndex.value = modes.indexOf('draw');
        }

        if (tagName === 'circle') {
            const radius = Number(shape.getAttribute('r'));
            if (Number.isFinite(radius)) {
                strokeWidth.value = (radius * 2) / getSvgUnitsPerPixel(shape);
            }
        } else {
            const width = Number(shape.getAttribute('stroke-width'));
            if (Number.isFinite(width)) {
                strokeWidth.value = width / getSvgUnitsPerPixel(shape);
            }
        }
    } finally {
        nextTick(() => {
            isSyncingControls.value = false;
        });
    }
}

function selectShape(shape) {
    if (!props.active || !shape || !G.value?.contains(shape)) return;
    getDoodleId(shape);
    selectedShape.value = shape;
    selectedShapes.value = [shape];
    syncControlsFromSelectedShape(shape);
    nextTick(updateSelectionBox);
}

watch(
    () => props.showGroupActions,
    (show) => {
        if (show) return;
        isMultiSelecting.value = false;
        if (selectedShapes.value.length > 1) deselectShape();
        updateSelectionBox();
        setCursorStyle();
    },
);

function toggleMultiSelection() {
    if (isEditingText.value) cleanupSvgTextEditing(false);
    if (!props.active || !props.showGroupActions) return;
    isMultiSelecting.value = !isMultiSelecting.value;
    updateSelectionBox();
    setCursorStyle();
}

function groupSelectedShapes() {
    if (!props.active || !props.showGroupActions || !canGroup.value || !G.value)
        return;
    const beforeState = serializeDoodles();
    const shapes = annotationShapes().filter((shape) =>
        selectedShapes.value.includes(shape),
    );
    if (shapes.length < 2) return;
    const group = document.createElementNS(XMLNS, 'g');
    group.setAttribute('class', 'vue-data-ui-doodle');
    group.setAttribute('data-annotation-group', '');
    group.setAttribute('data-doodle-id', createUid());
    G.value.insertBefore(group, shapes[0]);
    for (const shape of shapes) group.appendChild(shape);
    isMultiSelecting.value = false;
    selectShape(group);
    commitHistory(beforeState);
}

function ungroupSelectedShape() {
    const group = selectedShape.value;
    if (
        !props.active ||
        !props.showGroupActions ||
        !canUngroup.value ||
        !G.value?.contains(group)
    )
        return;
    const beforeState = serializeDoodles();
    const transform = group.getAttribute('transform') || '';
    const children = Array.from(group.children);
    for (const child of children) {
        const childTransform = child.getAttribute('transform') || '';
        const combined = `${transform} ${childTransform}`.trim();
        if (combined) child.setAttribute('transform', combined);
        else child.removeAttribute('transform');
        // Group movement has changed each member's data-space anchor.
        child.removeAttribute('data-annotation-anchor');
        G.value.insertBefore(child, group);
        if (props.followZoom)
            captureAnnotationAnchor(
                child,
                props.svgRef,
                props.annotationViewport,
                true,
            );
    }
    group.remove();
    deselectShape();
    isMultiSelecting.value = false;
    commitHistory(beforeState);
}

function startShapeInteraction(event) {
    if (!props.active || !G.value || isEditingText.value) return;

    if (props.showGroupActions && (isMultiSelecting.value || event.shiftKey)) {
        if (event.cancelable) event.preventDefault();
        event.stopImmediatePropagation?.();
        const shape = findShapeAtEvent(event);
        if (!shape) {
            deselectShape();
            return;
        }
        selectedShapes.value = selectedShapes.value.includes(shape)
            ? selectedShapes.value.filter((selected) => selected !== shape)
            : [...selectedShapes.value, shape];
        selectedShape.value =
            selectedShapes.value.length === 1 ? selectedShapes.value[0] : null;
        updateSelectionBox();
        return;
    }

    if (getSelectionDeleteButtonFromEvent(event)) {
        deleteSelectedShape(event);
        return;
    }

    const handle = getSelectionHandleFromEvent(event);
    if (
        handle &&
        selectedShape.value &&
        selectedShape.value.tagName.toLowerCase() === 'line'
    ) {
        if (event.cancelable) event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();

        const endpoint = handle.getAttribute('data-line-endpoint');
        if (!['start', 'end'].includes(endpoint)) return;

        lineEndpointDrag.value = endpoint;
        lineEndpointDragStart.value = getShapeLocalPoint(
            selectedShape.value,
            event,
        );
        isDraggingShape.value = false;
        shapeDragMoved.value = false;
        shapeWasSelectedAtPointerDown.value = false;
        shapeDragOriginalState.value = serializeDoodles();
        setCursorStyle(event);
        return;
    }

    const shape = findShapeAtEvent(event);

    if (!shape) {
        deselectShape();
        return;
    }

    if (event.cancelable) event.preventDefault();
    shapeWasSelectedAtPointerDown.value = selectedShape.value === shape;
    selectShape(shape);

    const { x, y } = toSvgPoint(event);
    isDraggingShape.value = true;
    shapeDragMoved.value = false;
    shapeDragStart.value = { x, y };
    shapeDragBaseTransform.value = shape.getAttribute('transform') || '';
    shapeDragOriginalState.value = serializeDoodles();
    setCursorStyle(event);
}

function moveSelectedShape(event) {
    if (!props.active || !selectedShape.value) return;

    setCursorStyle(event);

    if (lineEndpointDrag.value) {
        const point = getShapeLocalPoint(selectedShape.value, event);
        if (!point) return;

        const start = lineEndpointDragStart.value;
        if (
            !shapeDragMoved.value &&
            start &&
            Math.hypot(point.x - start.x, point.y - start.y) <
                SHAPE_DRAG_THRESHOLD * getSvgUnitsPerPixel(selectedShape.value)
        ) {
            return;
        }

        if (event.cancelable) event.preventDefault();
        shapeDragMoved.value = true;

        if (lineEndpointDrag.value === 'start') {
            selectedShape.value.setAttribute('x1', point.x);
            selectedShape.value.setAttribute('y1', point.y);
        } else {
            selectedShape.value.setAttribute('x2', point.x);
            selectedShape.value.setAttribute('y2', point.y);
        }

        updateSelectionBox();
        return;
    }

    if (!isDraggingShape.value || !shapeDragStart.value) return;

    const { x, y } = toSvgPoint(event);
    const dx = x - shapeDragStart.value.x;
    const dy = y - shapeDragStart.value.y;
    const distance = Math.hypot(dx, dy);

    if (
        !shapeDragMoved.value &&
        distance < SHAPE_DRAG_THRESHOLD * getSvgUnitsPerPixel()
    ) {
        return;
    }

    if (event.cancelable) event.preventDefault();
    shapeDragMoved.value = true;
    const base = shapeDragBaseTransform.value.trim();
    selectedShape.value.setAttribute(
        'transform',
        // Pointer deltas are in root SVG coordinates, outside the shape's
        // existing rotation or zoom compensation scale.
        `translate(${dx} ${dy})${base ? ` ${base}` : ''}`,
    );
    updateSelectionBox();
}

function stopShapeInteraction(event) {
    const shape = selectedShape.value;
    const wasDraggingLineEndpoint = !!lineEndpointDrag.value;
    const shouldEditText =
        !wasDraggingLineEndpoint &&
        shape &&
        shape.tagName.toLowerCase() === 'text' &&
        shapeWasSelectedAtPointerDown.value &&
        !shapeDragMoved.value &&
        !isEditingText.value;

    if (shapeDragMoved.value && shapeDragOriginalState.value) {
        commitHistory(shapeDragOriginalState.value);
    }

    isDraggingShape.value = false;
    shapeDragStart.value = null;
    shapeDragOriginalState.value = '';
    shapeDragMoved.value = false;
    shapeWasSelectedAtPointerDown.value = false;
    lineEndpointDrag.value = null;
    lineEndpointDragStart.value = null;
    shapeDragBaseTransform.value = shape?.getAttribute('transform') || '';

    if (shape && G.value?.contains(shape)) {
        updateSelectionBox();
    }

    if (shouldEditText && shape && G.value?.contains(shape)) {
        startExistingSvgTextEditing(shape, event);
        setCursorStyle(event);
        return;
    }

    setCursorStyle(event);
}

function applyColorToSelectedShape(color) {
    if (!props.active || !selectedShape.value || isSyncingControls.value) {
        return;
    }

    const shape = selectedShape.value;
    if (shape.hasAttribute('data-annotation-group')) return;
    const tagName = shape.tagName.toLowerCase();
    const previousColor = getShapeColor(shape);
    if (previousColor === color) return;

    const beforeState = serializeDoodles();
    if (tagName === 'text' || tagName === 'circle') {
        shape.setAttribute('fill', color);
    } else {
        shape.setAttribute('stroke', color);
        if (tagName === 'line' && shape.hasAttribute('marker-end')) {
            const markerId = useArrowMarker(color);
            if (markerId) shape.setAttribute('marker-end', `url(#${markerId})`);
        }
    }

    if (!(isEditingText.value && shape === editingTextNode.value)) {
        commitHistory(beforeState, `color:${getDoodleId(shape)}`);
    }
    updateSelectionBox();
    if (isEditingText.value && shape === editingTextNode.value) drawSvgCaret();
}

function applyStrokeWidthToSelectedShape(width) {
    if (!props.active || !selectedShape.value || isSyncingControls.value) {
        return;
    }

    const shape = selectedShape.value;
    const tagName = shape.tagName.toLowerCase();
    if (tagName === 'text' || shape.hasAttribute('data-annotation-group'))
        return;

    const targetWidth = Number(width) * getSvgUnitsPerPixel(shape);
    const currentValue =
        tagName === 'circle'
            ? Number(shape.getAttribute('r')) * 2
            : Number(shape.getAttribute('stroke-width'));
    if (currentValue === targetWidth) return;

    const beforeState = serializeDoodles();
    if (tagName === 'circle') {
        shape.setAttribute('r', targetWidth / 2);
    } else {
        shape.setAttribute('stroke-width', targetWidth);
    }
    commitHistory(beforeState, `size:${getDoodleId(shape)}`);
    updateSelectionBox();
}

function applyFontSizeToSelectedShape(size) {
    if (!props.active || !selectedShape.value || isSyncingControls.value) {
        return;
    }

    const shape = selectedShape.value;
    if (shape.tagName.toLowerCase() !== 'text') return;

    const fontPx = Number(size) * getSvgUnitsPerPixel(shape);
    if (Number(shape.getAttribute('font-size')) === fontPx) return;

    const beforeState = serializeDoodles();
    shape.setAttribute('font-size', fontPx);
    Array.from(shape.children).forEach((tspan, index) => {
        tspan.setAttribute('dy', index === 0 ? '0' : `${fontPx * 1.2}`);
    });

    if (!(isEditingText.value && shape === editingTextNode.value)) {
        commitHistory(beforeState, `font-size:${getDoodleId(shape)}`);
    }
    updateSelectionBox();
    if (isEditingText.value && shape === editingTextNode.value) drawSvgCaret();
}

watch(currentColor, applyColorToSelectedShape);
watch(strokeWidth, applyStrokeWidthToSelectedShape);
watch(fontSize, applyFontSizeToSelectedShape);

function switchMode() {
    if (modeIndex.value + 1 >= modes.length) modeIndex.value = 0;
    else modeIndex.value += 1;
}

function startSvgTextEditing(event) {
    if (props.showGroupActions && (isMultiSelecting.value || event.shiftKey))
        return;
    if (!G.value || !props.active) return;
    if (mode.value !== 'text' || isEditingText.value) return;
    if (getSelectionHandleFromEvent(event) || findShapeAtEvent(event)) return;

    deselectShape();
    const originalState = serializeDoodles();
    const { x, y } = toSvgPoint(event);
    editingTextAnchor.value = { x, y };
    editingTextContent.value = [''];
    editingCaret.value = { row: 0, col: 0 };
    editingTextRegistered.value = false;
    editingTextOriginalState.value = originalState;
    editingTextIsExisting.value = false;

    const textNode = document.createElementNS(XMLNS, 'text');
    textNode.setAttribute('x', x);
    textNode.setAttribute('y', y);
    textNode.setAttribute('fill', currentColor.value);
    textNode.setAttribute('font-size', fontSize.value * getSvgUnitsPerPixel());
    textNode.setAttribute('font-family', 'sans-serif');
    textNode.setAttribute('class', 'vue-data-ui-doodle');
    textNode.setAttribute('data-doodle-id', createUid());
    textNode.setAttribute('dominant-baseline', 'hanging');
    textNode.setAttribute('pointer-events', 'all');

    const tspan = document.createElementNS(XMLNS, 'tspan');
    tspan.setAttribute('x', x);
    tspan.setAttribute('dy', '0');
    tspan.setAttribute('dominant-baseline', 'hanging');
    tspan.textContent = '';
    textNode.appendChild(tspan);
    textNode.style.pointerEvents = 'none';
    textNode.style.userSelect = 'none';

    G.value.appendChild(textNode);
    selectedShape.value = textNode;
    selectedShapes.value = [textNode];
    editingTextNode.value = textNode;
    isEditingText.value = true;
    removeSelectionBox();

    window.addEventListener('keydown', handleSvgTextKeydown);
    window.addEventListener('mousedown', handleSvgTextBlur, true);
    updateSvgTextDisplay();
    drawSvgCaret();
}

function startExistingSvgTextEditing(shape) {
    if (
        !props.active ||
        !G.value ||
        isEditingText.value ||
        !shape ||
        shape.tagName.toLowerCase() !== 'text' ||
        !G.value.contains(shape)
    ) {
        return;
    }

    const originalState = serializeDoodles();
    selectedShape.value = shape;
    selectedShapes.value = [shape];
    syncControlsFromSelectedShape(shape);

    const x = Number(shape.getAttribute('x')) || 0;
    const y = Number(shape.getAttribute('y')) || 0;
    const lines = Array.from(shape.children).map((tspan) => {
        const content = tspan.textContent || '';
        return content === '\u200B' ? '' : content.split('\u200B').join('');
    });
    const content = lines.length ? lines : [shape.textContent || ''];
    const lastRow = Math.max(0, content.length - 1);

    editingTextAnchor.value = { x, y };
    editingTextContent.value = content;
    editingCaret.value = {
        row: lastRow,
        col: content[lastRow]?.length || 0,
    };
    editingTextOriginalState.value = originalState;
    editingTextIsExisting.value = true;
    editingTextRegistered.value = true;
    editingTextNode.value = shape;
    isEditingText.value = true;
    shape.style.pointerEvents = 'none';
    removeSelectionBox();

    window.addEventListener('keydown', handleSvgTextKeydown);
    window.addEventListener('mousedown', handleSvgTextBlur, true);
    updateSvgTextDisplay();
    drawSvgCaret();
}

function handleSvgTextKeydown(e) {
    if (!isEditingText.value) return;
    let { row, col } = editingCaret.value;
    const lines = editingTextContent.value.slice();
    let updated = false;

    if (e.key === 'Enter') {
        const line = lines[row];
        const before = line.slice(0, col);
        const after = line.slice(col);
        lines.splice(row, 1, before, after);
        row += 1;
        col = 0;
        updated = true;
        e.preventDefault();
    } else if (e.key === 'Backspace') {
        if (col > 0) {
            lines[row] = lines[row].slice(0, col - 1) + lines[row].slice(col);
            col -= 1;
            updated = true;
        } else if (row > 0) {
            const previousLength = lines[row - 1].length;
            lines[row - 1] += lines[row];
            lines.splice(row, 1);
            row -= 1;
            col = previousLength;
            updated = true;
        }
        e.preventDefault();
    } else if (e.key === 'Delete') {
        if (col < lines[row].length) {
            lines[row] = lines[row].slice(0, col) + lines[row].slice(col + 1);
            updated = true;
        } else if (row < lines.length - 1) {
            lines[row] += lines[row + 1];
            lines.splice(row + 1, 1);
            updated = true;
        }
        e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
        if (col > 0) {
            col -= 1;
        } else if (row > 0) {
            row -= 1;
            col = lines[row].length;
        }
        updated = true;
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        if (col < lines[row].length) {
            col += 1;
        } else if (row < lines.length - 1) {
            row += 1;
            col = 0;
        }
        updated = true;
        e.preventDefault();
    } else if (e.key === 'ArrowUp') {
        if (row > 0) {
            row -= 1;
            col = Math.min(col, lines[row].length);
            updated = true;
        }
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        if (row < lines.length - 1) {
            row += 1;
            col = Math.min(col, lines[row].length);
            updated = true;
        }
        e.preventDefault();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        lines[row] = lines[row].slice(0, col) + e.key + lines[row].slice(col);
        col += 1;
        updated = true;
        e.preventDefault();
    } else if (e.key === 'Escape') {
        cleanupSvgTextEditing(false, true);
        return;
    } else if (e.key === 'Tab') {
        e.preventDefault();
    }

    if (updated) {
        editingTextContent.value = lines;
        editingCaret.value = { row, col };
        updateSvgTextDisplay();
        drawSvgCaret();
    }
}

function updateSvgTextDisplay() {
    const textNode = editingTextNode.value;
    if (!textNode) return;

    const { x } = editingTextAnchor.value;
    while (textNode.firstChild) {
        textNode.removeChild(textNode.firstChild);
    }
    editingTextContent.value.forEach((line, i) => {
        const tspan = document.createElementNS(XMLNS, 'tspan');
        tspan.setAttribute('x', x);
        tspan.setAttribute('dominant-baseline', 'hanging');
        tspan.setAttribute(
            'dy',
            i === 0
                ? '0'
                : `${fontSize.value * 1.2 * getSvgUnitsPerPixel(textNode)}`,
        );
        tspan.textContent = line.length ? line : '\u200B';
        textNode.appendChild(tspan);
    });
}

const caretBlinkTimer = ref(null);

function stopCaretBlink() {
    if (caretBlinkTimer.value !== null) {
        clearInterval(caretBlinkTimer.value);
        caretBlinkTimer.value = null;
    }
}

function startCaretBlink(caretEl) {
    stopCaretBlink();

    let visible = true;
    caretEl.style.opacity = '1';

    caretBlinkTimer.value = setInterval(() => {
        if (!G.value || !caretEl || !G.value.contains(caretEl)) {
            stopCaretBlink();
            return;
        }
        visible = !visible;
        caretEl.style.opacity = visible ? '1' : '0';
    }, 500);
}

function drawSvgCaret() {
    const existingCaret = G.value?.querySelector('.vue-data-ui-svg-caret');
    if (existingCaret && G.value) {
        G.value.removeChild(existingCaret);
    }

    const textNode = editingTextNode.value;
    if (!textNode || !G.value) return;

    const { x, y } = editingTextAnchor.value;
    const { row, col } = editingCaret.value;
    const fontPx = fontSize.value * getSvgUnitsPerPixel(textNode);

    const tspan = textNode.childNodes[row];
    if (!tspan) return;

    let tempText = tspan.textContent.slice(0, col);
    if (tempText.endsWith(' ')) {
        tempText += '\u00A0';
    }

    const measureText = document.createElementNS(XMLNS, 'text');
    measureText.setAttribute('x', x);
    measureText.setAttribute('y', y);
    measureText.setAttribute('font-size', fontPx);
    measureText.setAttribute('font-family', 'sans-serif');
    measureText.textContent = tempText || '';
    G.value.appendChild(measureText);
    const bbox = measureText.getBBox();
    G.value.removeChild(measureText);

    const caretY = y + row * fontPx * 1.2;
    const caretX = x + bbox.width;

    const caret = document.createElementNS(XMLNS, 'rect');
    caret.setAttribute('x', caretX);
    caret.setAttribute('y', caretY);
    caret.setAttribute('rx', getSvgUnitsPerPixel(textNode));
    caret.setAttribute('width', 2 * getSvgUnitsPerPixel(textNode));
    caret.setAttribute('height', fontPx);
    caret.setAttribute('fill', currentColor.value);
    caret.setAttribute('class', 'vue-data-ui-svg-caret');
    caret.setAttribute('pointer-events', 'none');
    const transform = textNode.getAttribute('transform');
    if (transform) caret.setAttribute('transform', transform);
    G.value.appendChild(caret);

    startCaretBlink(caret);
}

function handleSvgTextBlur(e) {
    if (!editingTextNode.value) return;

    if (!editingTextNode.value.contains(e.target)) {
        cleanupSvgTextEditing(false);
    }
}

function cleanupSvgTextEditing(remove = false, cancel = false) {
    window.removeEventListener('keydown', handleSvgTextKeydown);
    window.removeEventListener('mousedown', handleSvgTextBlur, true);
    stopCaretBlink();

    const caret = G.value?.querySelector('.vue-data-ui-svg-caret');
    if (caret) caret.remove();

    const textNode = editingTextNode.value;
    const originalState = editingTextOriginalState.value;
    const isEmpty = editingTextContent.value.every((line) => !line.length);

    if (cancel) {
        isEditingText.value = false;
        editingTextNode.value = null;
        editingTextContent.value = [''];
        editingCaret.value = { row: 0, col: 0 };
        editingTextRegistered.value = false;
        editingTextOriginalState.value = '';
        editingTextIsExisting.value = false;
        restoreDoodles(originalState);
        return;
    }

    if (textNode && G.value?.contains(textNode)) {
        if (remove || isEmpty) {
            textNode.remove();
        } else {
            textNode.style.pointerEvents = 'all';
        }
    }

    isEditingText.value = false;
    editingTextNode.value = null;
    editingTextContent.value = [''];
    editingCaret.value = { row: 0, col: 0 };
    editingTextRegistered.value = false;
    editingTextOriginalState.value = '';
    editingTextIsExisting.value = false;

    commitHistory(originalState);

    if (textNode && G.value?.contains(textNode)) {
        selectShape(textNode);
    } else {
        deselectShape();
    }
}

const buttonBorderColor = computed(() => lightenHexColor(props.color, 0.6));

function addInteractionMask() {
    if (!G.value) return;

    const existingMask = G.value.querySelector('.vue-data-ui-mask');
    if (existingMask) {
        G.value.removeChild(existingMask);
    }

    if (props.active) {
        const mask = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'rect',
        );
        mask.setAttribute('class', 'vue-data-ui-mask');
        mask.setAttribute('width', '100%');
        mask.setAttribute('height', '100%');
        mask.setAttribute('fill', 'transparent');
        mask.setAttribute('pointer-events', 'all');
        G.value.insertBefore(mask, G.value.firstChild);
    }
}

function toSvgPoint(event) {
    const svg = props.svgRef;
    if (!svg) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();

    const isTouch = !!event.touches?.length || !!event.changedTouches?.length;
    const touch = isTouch
        ? event.touches?.[0] || event.changedTouches?.[0]
        : null;

    const clientX = touch ? touch.clientX : event.clientX;
    const clientY = touch ? touch.clientY : event.clientY;

    point.x = clientX;
    point.y = clientY;

    const matrix = svg.getScreenCTM()?.inverse();
    return matrix ? point.matrixTransform(matrix) : { x: 0, y: 0 };
}

function smoothPath(path) {
    const segments = path.trim().split(/\s+/);
    if (segments.length < 4) {
        return path;
    }
    const coordinates = segments.slice(1).map(Number);
    if (coordinates.length % 2 !== 0) {
        return path;
    }
    const smoothedCoordinates = reduceNoise(coordinates);
    const smoothedPath = [
        `M ${smoothedCoordinates[0]} ${smoothedCoordinates[1]}`,
    ]; // Keep M x y incipit
    for (let i = 2; i < smoothedCoordinates.length - 2; i += 2) {
        const x1 = smoothedCoordinates[i - 2];
        const y1 = smoothedCoordinates[i - 1];
        const x2 = smoothedCoordinates[i];
        const y2 = smoothedCoordinates[i + 1];
        const controlX = (x1 + x2) / 2;
        const controlY = (y1 + y2) / 2;
        smoothedPath.push(`Q ${x1} ${y1} ${controlX} ${controlY}`);
    }
    const lastX = smoothedCoordinates[smoothedCoordinates.length - 2];
    const lastY = smoothedCoordinates[smoothedCoordinates.length - 1];
    smoothedPath.push(`L ${lastX} ${lastY}`);
    return smoothedPath.join(' ');
}

function reduceNoise(coordinates, smoothingFactor = 1) {
    const smoothed = [...coordinates];
    for (let i = 2; i < coordinates.length - 2; i += 2) {
        const x = coordinates[i];
        const y = coordinates[i + 1];
        const prevX = coordinates[i - 2];
        const prevY = coordinates[i - 1];
        const nextX = coordinates[i + 2];
        const nextY = coordinates[i + 3];
        smoothed[i] = x + smoothingFactor * ((prevX + nextX) / 2 - x);
        smoothed[i + 1] = y + smoothingFactor * ((prevY + nextY) / 2 - y);
    }
    return smoothed;
}

function optimizeSvgPath(path) {
    const commands = path.trim().split(/\s+/);
    let optimizedPath = '';
    let currentCommand = '';
    let currentX = null,
        currentY = null;
    for (let i = 0; i < commands.length; i += 1) {
        const command = commands[i];
        if (isNaN(command)) {
            currentCommand = command;
            if (currentCommand === 'M' || currentCommand === 'L') {
                currentX = parseFloat(commands[++i]);
                currentY = parseFloat(commands[++i]);
                optimizedPath += `${currentCommand}${currentX} ${currentY}`;
            } else if (currentCommand === 'Q') {
                const cx = parseFloat(commands[++i]);
                const cy = parseFloat(commands[++i]);
                const x = parseFloat(commands[++i]);
                const y = parseFloat(commands[++i]);

                if (cx === currentX && cy === currentY) {
                    // Last point shorthand
                    optimizedPath += `t${x - currentX} ${y - currentY}`;
                } else {
                    optimizedPath += `q${cx - currentX} ${cy - currentY} ${x - currentX} ${y - currentY}`;
                }
                currentX = x;
                currentY = y;
            }
        } else {
            const x = parseFloat(command);
            const y = parseFloat(commands[++i]);
            if (currentCommand === 'L') {
                const dx = x - currentX;
                const dy = y - currentY;

                if (dx === 0) {
                    // Vertical line
                    optimizedPath += `v${dy}`;
                } else if (dy === 0) {
                    // Horizontal line
                    optimizedPath += `h${dx}`;
                } else {
                    // Diagonal line
                    optimizedPath += `l${dx} ${dy}`;
                }
                currentX = x;
                currentY = y;
            } else if (currentCommand === 'Q') {
                const cx = x;
                const cy = y;
                const nx = parseFloat(commands[++i]);
                const ny = parseFloat(commands[++i]);

                if (cx === currentX && cy === currentY) {
                    optimizedPath += `t${nx - currentX} ${ny - currentY}`;
                } else {
                    optimizedPath += `q${cx - currentX} ${cy - currentY} ${nx - currentX} ${ny - currentY}`;
                }
                currentX = nx;
                currentY = ny;
            }
        }
    }
    return optimizedPath;
}

function startDrawing(event) {
    if (props.showGroupActions && (isMultiSelecting.value || event.shiftKey))
        return;
    if (mode.value !== 'draw') return;
    if (!props.active || !G.value) return;
    if (getSelectionHandleFromEvent(event) || findShapeAtEvent(event)) return;
    if (event.cancelable) event.preventDefault();

    deselectShape();
    pendingDrawingState.value = serializeDoodles();
    isDrawing.value = true;
    const { x, y } = toSvgPoint(event);
    startPoint.value = { x, y };
    currentPath.value = `M ${x} ${y}`;
    currentDrawingPath.value = document.createElementNS(XMLNS, 'path');
    currentDrawingPath.value.setAttribute('stroke', currentColor.value);
    currentDrawingPath.value.setAttribute(
        'stroke-width',
        strokeWidth.value * getSvgUnitsPerPixel(),
    );
    currentDrawingPath.value.setAttribute('fill', 'none');
    currentDrawingPath.value.setAttribute('stroke-linecap', 'round');
    currentDrawingPath.value.setAttribute('stroke-linejoin', 'round');
    currentDrawingPath.value.setAttribute('class', 'vue-data-ui-doodle');
    currentDrawingPath.value.setAttribute('data-doodle-id', createUid());
    currentDrawingPath.value.setAttribute('pointer-events', 'stroke');
    G.value.appendChild(currentDrawingPath.value);
}

function draw(event) {
    if (event.cancelable) event.preventDefault();
    if (!isDrawing.value || !G.value || !currentDrawingPath.value) return;
    const { x, y } = toSvgPoint(event);
    currentPath.value += ` ${x} ${y}`;
    currentDrawingPath.value.setAttribute('d', currentPath.value);
}

function useArrowMarker(color) {
    const svg = props.svgRef;
    if (!svg) return null;

    let defs = svg.querySelector(`defs#${ARROW_DEFS_ID.value}`);

    if (!defs) {
        defs = document.createElementNS(XMLNS, 'defs');
        defs.setAttribute('id', ARROW_DEFS_ID.value);
        svg.appendChild(defs);
    }

    const markerKey = String(color).trim();

    if (arrowMarkerIds.has(markerKey)) {
        return arrowMarkerIds.get(markerKey);
    }

    const markerId = `arrow-${createUid()}`;
    const size = 6;

    const marker = document.createElementNS(XMLNS, 'marker');
    marker.setAttribute('id', markerId);
    marker.setAttribute('markerUnits', 'strokeWidth');
    marker.setAttribute('markerWidth', String(size));
    marker.setAttribute('markerHeight', String(size));
    marker.setAttribute('refX', String(size - 2));
    marker.setAttribute('refY', String(size / 2));
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('viewBox', `0 0 ${size} ${size}`);

    const path = document.createElementNS(XMLNS, 'path');
    path.setAttribute('d', `M 0 0 L ${size} ${size / 2} L 0 ${size} z`);
    path.setAttribute('fill', color);
    path.setAttribute('stroke', 'none');

    marker.appendChild(path);
    defs.appendChild(marker);

    arrowMarkerIds.set(markerKey, markerId);

    return markerId;
}

function startLine(event) {
    if (props.showGroupActions && (isMultiSelecting.value || event.shiftKey))
        return;
    if (!['line', 'arrow'].includes(mode.value)) return;
    if (!props.active || !G.value) return;
    if (getSelectionHandleFromEvent(event) || findShapeAtEvent(event)) return;
    if (event.cancelable) event.preventDefault();

    deselectShape();
    pendingDrawingState.value = serializeDoodles();
    isDrawing.value = true;
    const { x, y } = toSvgPoint(event);
    startPoint.value = { x, y };
    currentLine.value = document.createElementNS(XMLNS, 'line');
    currentLine.value.setAttribute('stroke', currentColor.value);
    currentLine.value.setAttribute(
        'stroke-width',
        strokeWidth.value * getSvgUnitsPerPixel(),
    );
    currentLine.value.setAttribute('stroke-linecap', 'round');
    currentLine.value.setAttribute('class', 'vue-data-ui-doodle');
    currentLine.value.setAttribute('data-doodle-id', createUid());
    currentLine.value.setAttribute('pointer-events', 'stroke');
    currentLine.value.setAttribute('x1', x);
    currentLine.value.setAttribute('y1', y);
    currentLine.value.setAttribute('x2', x);
    currentLine.value.setAttribute('y2', y);
    if (mode.value === 'arrow') {
        const markerId = useArrowMarker(currentColor.value);
        if (markerId) {
            currentLine.value.setAttribute('marker-end', `url(#${markerId})`);
        }
    }
    G.value.appendChild(currentLine.value);
}

function drawLine(event) {
    if (event.cancelable) event.preventDefault();
    if (
        !['line', 'arrow'].includes(mode.value) ||
        !isDrawing.value ||
        !G.value ||
        !currentLine.value
    ) {
        return;
    }
    const { x, y } = toSvgPoint(event);
    currentLine.value.setAttribute('x2', x);
    currentLine.value.setAttribute('y2', y);
}

function endLine(event) {
    if (isDrawing.value && G.value && currentLine.value) {
        const { x, y } = toSvgPoint(event);
        currentLine.value.setAttribute('x2', x);
        currentLine.value.setAttribute('y2', y);
        commitHistory(pendingDrawingState.value);
        currentLine.value = null;
        pendingDrawingState.value = '';
    }
    isDrawing.value = false;
}

function stopDrawing(event) {
    if (isDrawing.value && G.value && currentDrawingPath.value) {
        const { x, y } = toSvgPoint(event);

        if (
            startPoint.value &&
            startPoint.value.x === x &&
            startPoint.value.y === y
        ) {
            currentDrawingPath.value.remove();
            const circle = document.createElementNS(XMLNS, 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute(
                'r',
                (strokeWidth.value * getSvgUnitsPerPixel()) / 2,
            );
            circle.setAttribute('fill', currentColor.value);
            circle.setAttribute('class', 'vue-data-ui-doodle');
            circle.setAttribute('data-doodle-id', createUid());
            circle.setAttribute('pointer-events', 'all');
            G.value.appendChild(circle);
        } else {
            currentDrawingPath.value.setAttribute(
                'd',
                optimizeSvgPath(smoothPath(currentPath.value)),
            );
        }

        commitHistory(pendingDrawingState.value);
        pendingDrawingState.value = '';
        currentDrawingPath.value = null;
    }
    isDrawing.value = false;
}

function deleteLastDraw() {
    if (!stack.value.length || !G.value) return;

    const currentState = serializeDoodles();
    const entry = stack.value.pop();
    redoStack.value.push({
        state: currentState,
        mergeKey: null,
        timestamp: Date.now(),
    });
    restoreDoodles(entry.state);
}

function redoLastDraw() {
    if (!redoStack.value.length || !G.value) return;

    const currentState = serializeDoodles();
    const entry = redoStack.value.pop();
    stack.value.push({
        state: currentState,
        mergeKey: null,
        timestamp: Date.now(),
    });
    restoreDoodles(entry.state);
}

function reset() {
    if (isEditingText.value) {
        cleanupSvgTextEditing(false);
    }
    deselectShape();
    if (G.value) {
        G.value.innerHTML = '';
    }
    stack.value = [];
    redoStack.value = [];
    editingTextRegistered.value = false;
    editingTextOriginalState.value = '';
    editingTextIsExisting.value = false;
    pendingDrawingState.value = '';
    addInteractionMask();
}

watch(mode, () => {
    if (!props.active) return;
    disableDrawing();
    enableDrawing();
    setCursorStyle();
});

function enableDrawing() {
    if (!props.svgRef || !props.active) return;

    props.svgRef.addEventListener('mousedown', startShapeInteraction);
    props.svgRef.addEventListener('mousemove', moveSelectedShape);
    props.svgRef.addEventListener('mousemove', updateHoverOutline);
    props.svgRef.addEventListener('mouseleave', clearHoverOutline);
    props.svgRef.addEventListener('mouseup', stopShapeInteraction);
    props.svgRef.addEventListener('mouseleave', stopShapeInteraction);
    props.svgRef.addEventListener('touchstart', startShapeInteraction, {
        passive: false,
    });
    props.svgRef.addEventListener('touchmove', moveSelectedShape, {
        passive: false,
    });
    props.svgRef.addEventListener('touchend', stopShapeInteraction);
    props.svgRef.addEventListener('touchcancel', stopShapeInteraction);

    if (mode.value === 'draw') {
        props.svgRef.addEventListener('mousedown', startDrawing);
        props.svgRef.addEventListener('mousemove', draw);
        props.svgRef.addEventListener('mouseup', stopDrawing);
        props.svgRef.addEventListener('mouseleave', stopDrawing);

        props.svgRef.addEventListener('touchstart', startDrawing, {
            passive: false,
        });
        props.svgRef.addEventListener('touchmove', draw, { passive: false });
        props.svgRef.addEventListener('touchend', stopDrawing);
        props.svgRef.addEventListener('touchcancel', stopDrawing);
    } else if (['line', 'arrow'].includes(mode.value)) {
        props.svgRef.addEventListener('mousedown', startLine);
        props.svgRef.addEventListener('mousemove', drawLine);
        props.svgRef.addEventListener('mouseup', endLine);
        props.svgRef.addEventListener('touchstart', startLine, {
            passive: false,
        });
        props.svgRef.addEventListener('touchmove', drawLine, {
            passive: false,
        });
        props.svgRef.addEventListener('touchend', endLine);
        props.svgRef.addEventListener('touchcancel', endLine);
    } else if (mode.value === 'text') {
        props.svgRef.addEventListener('mousedown', startSvgTextEditing);
        props.svgRef.addEventListener('touchstart', startSvgTextEditing, {
            passive: false,
        });
    }

    if (G.value) {
        G.value.style.pointerEvents = 'auto';
    }
}

function disableDrawing() {
    clearHoverOutline();
    if (!props.svgRef) return;

    // interact with positioned elements
    props.svgRef.removeEventListener('mousedown', startShapeInteraction);
    props.svgRef.removeEventListener('mousemove', moveSelectedShape);
    props.svgRef.removeEventListener('mousemove', updateHoverOutline);
    props.svgRef.removeEventListener('mouseleave', clearHoverOutline);
    props.svgRef.removeEventListener('mouseup', stopShapeInteraction);
    props.svgRef.removeEventListener('mouseleave', stopShapeInteraction);
    props.svgRef.removeEventListener('touchstart', startShapeInteraction);
    props.svgRef.removeEventListener('touchmove', moveSelectedShape);
    props.svgRef.removeEventListener('touchend', stopShapeInteraction);
    props.svgRef.removeEventListener('touchcancel', stopShapeInteraction);

    // draw
    props.svgRef.removeEventListener('mousedown', startDrawing);
    props.svgRef.removeEventListener('mousemove', draw);
    props.svgRef.removeEventListener('mouseup', stopDrawing);
    props.svgRef.removeEventListener('mouseleave', stopDrawing);
    props.svgRef.removeEventListener('touchstart', startDrawing);
    props.svgRef.removeEventListener('touchmove', draw);
    props.svgRef.removeEventListener('touchend', stopDrawing);
    props.svgRef.removeEventListener('touchcancel', stopDrawing);

    // line / arrow
    props.svgRef.removeEventListener('mousedown', startLine);
    props.svgRef.removeEventListener('mousemove', drawLine);
    props.svgRef.removeEventListener('mouseup', endLine);
    props.svgRef.removeEventListener('touchstart', startLine);
    props.svgRef.removeEventListener('touchmove', drawLine);
    props.svgRef.removeEventListener('touchend', endLine);
    props.svgRef.removeEventListener('touchcancel', endLine);

    // text
    props.svgRef.removeEventListener('mousedown', startSvgTextEditing);
    props.svgRef.removeEventListener('touchstart', startSvgTextEditing);

    if (G.value) {
        G.value.style.pointerEvents = 'none';
    }
}

watch(
    () => props.active,
    (newVal) => {
        if (newVal) {
            enableDrawing();
        } else {
            isMultiSelecting.value = false;
            if (props.followZoom && isEditingText.value)
                cleanupSvgTextEditing(false);
            deselectShape();
            disableDrawing();
        }
        setCursorStyle();
        syncAnnotationViewport();
    },
);

watch(
    () => props.active,
    () => {
        nextTick(() => {
            addInteractionMask();
        });
    },
);

watch(
    () => props.active,
    (active) => {
        if (!props.svgRef) return;

        if (active) {
            props.svgRef.style.touchAction = 'none';
        } else {
            props.svgRef.style.touchAction = '';
        }
    },
    { immediate: true },
);

function setCursorStyle(event = null) {
    if (!G.value) return;

    if (!props.active) {
        G.value.style.cursor = '';
        return;
    }
    if (isMultiSelecting.value) {
        G.value.style.cursor = 'pointer';
        return;
    }

    if (isEditingText.value) {
        G.value.style.cursor = 'text';
        return;
    }

    if (event && getSelectionDeleteButtonFromEvent(event)) {
        G.value.style.cursor = 'pointer';
        return;
    }

    if (
        lineEndpointDrag.value ||
        (event && getSelectionHandleFromEvent(event))
    ) {
        G.value.style.cursor = 'move';
        return;
    }

    if (isDraggingShape.value && selectedShape.value) {
        G.value.style.cursor = 'grabbing';
        return;
    }

    if (
        event &&
        selectedShape.value &&
        G.value.contains(selectedShape.value) &&
        isShapeNearEvent(selectedShape.value, event)
    ) {
        G.value.style.cursor = 'grab';
        return;
    }

    if (mode.value === 'text') {
        G.value.style.cursor = 'text';
    } else if (['line', 'arrow'].includes(mode.value)) {
        G.value.style.cursor = 'crosshair';
    } else {
        G.value.style.cursor = cursorDraw.value;
    }
}

const menuRef = ref(null);
const buttonToggle = ref(null);
const isDraggingMenu = ref(false);
const menuDragOffset = ref({ x: 0, y: 0 });
const menuDragStart = ref(null);
const menuDragPointerId = ref(null);

const menuStyle = computed(() => ({
    backgroundColor: props.backgroundColor,
    '--vue-ui-pen-and-paper-drag-x': `${menuDragOffset.value.x}px`,
    '--vue-ui-pen-and-paper-drag-y': `${menuDragOffset.value.y}px`,
}));

function getClientSize() {
    return {
        width: document.documentElement.clientWidth || window.innerWidth,
        height: document.documentElement.clientHeight || window.innerHeight,
    };
}

function getMenuClientRect() {
    if (!menuRef.value) return null;
    const elements = [
        menuRef.value,
        menuRef.value.querySelector('.vue-ui-pen-and-paper-drag-handle'),
        menuRef.value.querySelector('.vertical-range'),
        menuRef.value.querySelector('.vue-ui-pen-and-paper-group-actions'),
    ].filter(Boolean);
    const rects = elements.map((element) => element.getBoundingClientRect());

    return {
        left: Math.min(...rects.map((rect) => rect.left)),
        top: Math.min(...rects.map((rect) => rect.top)),
        right: Math.max(...rects.map((rect) => rect.right)),
        bottom: Math.max(...rects.map((rect) => rect.bottom)),
    };
}

function startMenuDrag(event) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (!menuRef.value) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = getMenuClientRect();
    if (!rect) return;
    isDraggingMenu.value = true;
    menuDragPointerId.value = event.pointerId;
    menuDragStart.value = {
        clientX: event.clientX,
        clientY: event.clientY,
        offsetX: menuDragOffset.value.x,
        offsetY: menuDragOffset.value.y,
        rect,
    };
    window.addEventListener('pointermove', moveMenu);
    window.addEventListener('pointerup', stopMenuDrag);
    window.addEventListener('pointercancel', stopMenuDrag);
}

function moveMenu(event) {
    if (!isDraggingMenu.value || !menuDragStart.value) return;
    if (event.pointerId !== menuDragPointerId.value) return;
    event.preventDefault();
    const start = menuDragStart.value;
    const { width, height } = getClientSize();
    const deltaX = event.clientX - start.clientX;
    const deltaY = event.clientY - start.clientY;
    const clampedDeltaX = Math.min(
        Math.max(deltaX, -start.rect.left),
        width - start.rect.right,
    );
    const clampedDeltaY = Math.min(
        Math.max(deltaY, -start.rect.top),
        height - start.rect.bottom,
    );
    menuDragOffset.value = {
        x: start.offsetX + clampedDeltaX,
        y: start.offsetY + clampedDeltaY,
    };
}

function stopMenuDrag(event) {
    if (
        event?.pointerId !== undefined &&
        menuDragPointerId.value !== null &&
        event.pointerId !== menuDragPointerId.value
    ) {
        return;
    }
    isDraggingMenu.value = false;
    menuDragStart.value = null;
    menuDragPointerId.value = null;
    window.removeEventListener('pointermove', moveMenu);
    window.removeEventListener('pointerup', stopMenuDrag);
    window.removeEventListener('pointercancel', stopMenuDrag);
}

function keepMenuInClient() {
    if (!menuRef.value || !props.active) return;
    const rect = getMenuClientRect();
    if (!rect) return;
    const { width, height } = getClientSize();
    let correctionX = 0;
    let correctionY = 0;
    if (rect.left < 0) correctionX = -rect.left;
    else if (rect.right > width) correctionX = width - rect.right;
    if (rect.top < 0) correctionY = -rect.top;
    else if (rect.bottom > height) correctionY = height - rect.bottom;
    if (correctionX || correctionY) {
        menuDragOffset.value = {
            x: menuDragOffset.value.x + correctionX,
            y: menuDragOffset.value.y + correctionY,
        };
    }
}

onMounted(() => {
    window.addEventListener('resize', keepMenuInClient);
    nextTick(() => {
        if (props.svgRef) {
            G.value = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'g',
            );
            G.value.setAttribute('class', 'vue-data-ui-doodles');
            props.svgRef.appendChild(G.value);
            setCursorStyle();
            if (props.active) enableDrawing();
            else disableDrawing();
            addInteractionMask();
            syncAnnotationViewport();
        }
    });
});

watch(
    () => props.active,
    async (isActive) => {
        if (!isActive) {
            stopMenuDrag();
            menuDragOffset.value = { x: 0, y: 0 };
            return;
        }
        await nextTick();
        buttonToggle.value?.focus();
    },
    { flush: 'post' },
);

onBeforeUnmount(() => {
    stopCaretBlink();
    deselectShape();
    annotationClip.value?.remove();
    stopMenuDrag();
    window.removeEventListener('resize', keepMenuInClient);
    if (G.value && props.svgRef) {
        G.value.remove();
        disableDrawing();
    }
});
</script>

<template>
    <div
        v-if="active"
        ref="menuRef"
        data-dom-to-png-ignore
        class="vue-ui-pen-and-paper-actions"
        :class="{
            'vue-ui-pen-and-paper-actions-dragging': isDraggingMenu,
            'vue-ui-pen-and-paper-actions-with-groups': showGroupActions,
        }"
        :style="menuStyle"
    >
        <button
            type="button"
            class="vue-ui-pen-and-paper-drag-handle"
            aria-label="Move drawing toolbar"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`,
                color: color,
            }"
            @pointerdown="startMenuDrag"
        >
            <svg aria-hidden="true" viewBox="0 0 6 12" style="width: 100%">
                <circle :fill="color" cx="3" cy="3" r="0.7" />
                <circle :fill="color" cx="3" cy="6" r="0.7" />
                <circle :fill="color" cx="3" cy="9" r="0.7" />
            </svg>
        </button>
        <button
            ref="buttonToggle"
            class="vue-ui-pen-and-paper-action"
            @click="emit('close')"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`,
                cursor: isCursorPointer ? 'pointer' : 'default',
            }"
        >
            <slot name="annotator-action-close">
                <BaseIcon name="close" :stroke="color" />
            </slot>
        </button>

        <button
            class="vue-ui-pen-and-paper-action"
            tabindex="-1"
            :disabled="canGroup || canUngroup"
            :style="`padding: 0 !important; cursor: ${isCursorPointer ? 'pointer' : 'default'}`"
        >
            <ColorPicker
                v-model:value="currentColor"
                :backgroundColor="backgroundColor"
                :buttonBorderColor="buttonBorderColor"
                :isCursorPointer="isCursorPointer"
                :palette="palette"
            >
                <template #annotator-action-color="{ color }">
                    <slot name="annotator-action-color" v-bind="{ color }" />
                </template>
            </ColorPicker>
        </button>

        <button
            data-cy="pen-and-paper-toggle-text"
            class="vue-ui-pen-and-paper-action"
            :class="{ 'vue-ui-pen-and-paper-action-active': mode === 'text' }"
            @click="switchMode()"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`,
                cursor: isCursorPointer ? 'pointer' : 'default',
            }"
        >
            <slot name="annotator-action-draw" v-bind="{ mode }">
                <BaseIcon :name="iconMap[mode]" :stroke="color" />
            </slot>
            <div
                :style="{
                    position: 'absolute',
                    bottom: '-20px',
                    color: buttonBorderColor,
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontVariantNumeric: 'tabular-nums',
                }"
            >
                {{
                    dataLabel({
                        v:
                            mode === 'text'
                                ? Math.round(fontSize)
                                : Math.round(strokeWidth),
                        s: 'px',
                        r: 1,
                    })
                }}
            </div>
        </button>

        <button
            class="vue-ui-pen-and-paper-action"
            :class="{ 'vue-ui-pen-and-paper-action-disabled': !stack.length }"
            :disabled="!stack.length"
            @click="deleteLastDraw"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`,
                marginTop: '20px',
                cursor: isCursorPointer ? 'pointer' : 'default',
            }"
        >
            <slot
                name="annotator-action-undo"
                v-bind="{ disabled: !stack.length }"
            >
                <BaseIcon name="refresh" :stroke="color" />
            </slot>
        </button>

        <button
            class="vue-ui-pen-and-paper-action"
            :class="{
                'vue-ui-pen-and-paper-action-disabled': !redoStack.length,
            }"
            @click="redoLastDraw"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`,
                cursor: isCursorPointer ? 'pointer' : 'default',
            }"
        >
            <slot
                name="annotator-action-redo"
                v-bind="{ disabled: !redoStack.length }"
            >
                <BaseIcon
                    name="refresh"
                    :stroke="color"
                    style="transform: scaleX(-1)"
                />
            </slot>
        </button>

        <button
            class="vue-ui-pen-and-paper-action"
            :class="{ 'vue-ui-pen-and-paper-action-disabled': !stack.length }"
            @click="reset"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`,
                cursor: isCursorPointer ? 'pointer' : 'default',
            }"
        >
            <slot
                name="annotator-action-delete"
                v-bind="{ disabled: !stack.length }"
            >
                <BaseIcon name="trash" :stroke="color" />
            </slot>
        </button>

        <div
            v-if="showGroupActions"
            class="vue-ui-pen-and-paper-group-actions"
            :style="{ color, backgroundColor }"
        >
            <button
                type="button"
                class="vue-ui-pen-and-paper-action"
                data-cy="pen-and-paper-select-multiple"
                :aria-label="
                    isMultiSelecting
                        ? 'Exit selection mode'
                        : 'Select multiple annotations'
                "
                :aria-pressed="isMultiSelecting"
                :class="{
                    'vue-ui-pen-and-paper-action-active': isMultiSelecting,
                }"
                :style="{
                    backgroundColor,
                    color,
                    border: `1px solid ${buttonBorderColor}`,
                }"
                @click="toggleMultiSelection"
            >
                <slot
                    name="annotator-action-select-multiple"
                    :isSelecting="isMultiSelecting"
                >
                    <BaseIcon
                        :name="
                            isMultiSelecting
                                ? 'selectMultipleActive'
                                : 'selectMultiple'
                        "
                        :stroke="color"
                    />
                </slot>
            </button>
            <button
                type="button"
                class="vue-ui-pen-and-paper-action"
                data-cy="pen-and-paper-group"
                aria-label="Group selected annotations"
                :disabled="!canGroup"
                :class="{ 'vue-ui-pen-and-paper-action-disabled': !canGroup }"
                :style="{
                    backgroundColor,
                    color,
                    border: `1px solid ${buttonBorderColor}`,
                }"
                @click="groupSelectedShapes"
            >
                <slot name="annotator-action-group" :disabled="!canGroup">
                    <BaseIcon name="group" :stroke="color" />
                </slot>
            </button>
            <button
                type="button"
                class="vue-ui-pen-and-paper-action"
                data-cy="pen-and-paper-ungroup"
                aria-label="Ungroup selected annotations"
                :disabled="!canUngroup"
                :class="{ 'vue-ui-pen-and-paper-action-disabled': !canUngroup }"
                :style="{
                    backgroundColor,
                    color,
                    border: `1px solid ${buttonBorderColor}`,
                }"
                @click="ungroupSelectedShape"
            >
                <slot name="annotator-action-ungroup" :disabled="!canUngroup">
                    <BaseIcon name="ungroup" :stroke="color" />
                </slot>
            </button>
        </div>

        <input
            v-if="mode === 'text'"
            data-cy="pen-and-paper-font-size"
            :disabled="canGroup || canUngroup"
            ref="range"
            type="range"
            class="vertical-range"
            :min="3"
            :max="48"
            :step="1"
            v-model="fontSize"
            :style="{ accentColor: color }"
        />

        <input
            v-else
            :disabled="canGroup || canUngroup"
            ref="range"
            type="range"
            class="vertical-range"
            :min="0.5"
            :max="12"
            :step="0.1"
            v-model="strokeWidth"
            :style="{ accentColor: color }"
        />
    </div>
</template>

<style>
.vue-ui-pen-and-paper-actions {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translate(
        var(--vue-ui-pen-and-paper-drag-x, 0px),
        calc(-50% + var(--vue-ui-pen-and-paper-drag-y, 0px))
    );
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 1;
}

.vue-ui-pen-and-paper-drag-handle {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: -16px;
    width: 16px;
    height: 100%;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px 0 0 4px;
    cursor: grab;
    touch-action: none;
    user-select: none;
    z-index: 2;
}

.vue-ui-pen-and-paper-drag-handle span {
    font-size: 16px;
    line-height: 1;
    pointer-events: none;
}

.vue-ui-pen-and-paper-actions-dragging .vue-ui-pen-and-paper-drag-handle {
    cursor: grabbing;
}

.vue-ui-pen-and-paper-action {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    padding: 2px;
    transition: all 0.2s ease-in-out;
    position: relative;
}

.vue-ui-pen-and-paper-action:hover {
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3);
}

.vue-ui-pen-and-paper-action-disabled {
    opacity: 0.5;
    cursor: not-allowed !important;
}

input[type='range'].vertical-range {
    writing-mode: vertical-lr;
    position: absolute;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    left: 36px;
}
</style>

<style>
.vue-data-ui-selection-box {
    vector-effect: non-scaling-stroke;
}

.vue-data-ui-selection-handle {
    vector-effect: non-scaling-stroke;
    cursor: move;
}

.vue-data-ui-selection-delete {
    cursor: pointer;
}

.vue-data-ui-svg-caret {
    opacity: 1;
}
</style>

<style>
.vue-data-ui-doodles[data-annotation-inactive],
.vue-data-ui-doodles[data-annotation-inactive] * {
    pointer-events: none !important;
}
</style>

<style>
.vue-ui-pen-and-paper-group-actions {
    position: absolute;
    left: 36px;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.vue-ui-pen-and-paper-actions-with-groups {
    box-sizing: border-box;
    width: 68px;
    padding-right: 36px;
}

.vue-ui-pen-and-paper-actions-with-groups input[type='range'].vertical-range {
    /* Three 32px buttons, their two 4px gaps, and a 4px gap before the slider. */
    top: 108px;
    left: 36px;
    width: 32px;
    height: calc(100% - 108px);
    box-sizing: border-box;
    margin: 0;
    transform: rotate(180deg);
}
</style>

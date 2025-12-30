<script setup>
import { computed, ref, watch, onUnmounted, nextTick } from "vue";
import { calcTooltipPosition } from "../calcTooltipPosition";
import { useMouse } from "../useMouse";
import { setOpacity } from "../lib";
import { debounce } from "../canvas-lib";

const props = defineProps({
    teleportTo: {
        type: String,
        default: 'body'
    },
    backgroundColor: {
        type: String,
        default: "#FFFFFF"
    },
    color: {
        type: String,
        default: "#000000"
    },
    content: String,
    maxWidth: {
        type: String,
        default: '300px'
    },
    parent: {
        type: Object
    },
    show: {
        type: Boolean,
        default: false,
    },
    isCustom: {
        type: Boolean,
        default: false,
    },
    fontSize: {
        type: [Number, String],
        default: 14
    },
    borderRadius: {
        type: Number,
        default: 4
    },
    borderColor: {
        type: String,
        default: '#e1e5e8'
    },
    borderWidth: {
        type: Number,
        default: 1
    },
    backgroundOpacity: {
        type: Number,
        default: 100,
    },
    position: {
        type: String,
        default: "center"
    },
    offsetY: {
        type: Number,
        default: 24
    },
    blockShiftY: {
        type: Boolean,
        default: false,
    },
    isFullscreen: {
        type: Boolean,
        default: false
    },
    smooth: {
        type: Boolean,
        default: true
    },
    backdropFilter: {
        type: Boolean,
        default: true
    },
    smoothForce: {
        type: Number,
        default: 0.18
    },
    smoothSnapThreshold: {
        type: Number,
        default: 0.25
    }
});

const tooltip = ref(null);

const { x, y } = useMouse(props.parent);
const targetPosition = ref({ x: 0, y: 0 });
const displayPosition = ref({ x: 0, y: 0 });

// containing block detection (first ancestor with transform/filter/perspective/contain:paint, etc)
const containingBlock = ref(null);

const cbRectSnapshot = ref(null);
const cbScaleSnapshot = ref({ scaleX: 1, scaleY: 1 });
const chartRectSnapshot = ref(null);

// One time snapshot of the layout geometry when the tooltip becomes visible.
function snapshotGeometry() {
    const cb = findContainingBlock(tooltip.value);
    containingBlock.value = cb;

    if (!cb) {
        cbRectSnapshot.value = null;
        cbScaleSnapshot.value = { scaleX: 1, scaleY: 1 };
        chartRectSnapshot.value = null;
        return;
    }

    cbRectSnapshot.value = cb.getBoundingClientRect();
    cbScaleSnapshot.value = getScaleFromTransform(cb);
    chartRectSnapshot.value = props.parent?.getBoundingClientRect?.() || null;
}

// Detect whether a style creates a containing block for `position: fixed`, which can change the reference coordinate system used
// by the tooltip when it is rendered inside transformed ancestors.
function hasContainingBlockStyle(style) {
    if (!style) return false;
    if (style.transform && style.transform !== "none") return true;
    if (style.perspective && style.perspective !== "none") return true;
    if (style.filter && style.filter !== "none") return true;
    if (style.backdropFilter && style.backdropFilter !== "none") return true;
    if (style.contain && style.contain.includes("paint")) return true;
    if (style.willChange && (style.willChange.includes("transform") || style.willChange.includes("filter"))) return true;
    return false;
}

function findContainingBlock(el) {
    let node = el?.parentElement || null;
    while (node && node !== document.documentElement) {
        const style = getComputedStyle(node);
        if (hasContainingBlockStyle(style)) return node;
        node = node.parentElement;
    }
    return null;
}

// Extract effective scale factors from an element’s css transform.
// When a tooltip is inside a transformed ancestor, coordinates and element bounding boxes must be corrected for scale.
//
// > reads the computed `transform` value
// > parses it as a DOMMatrix
// > derives scaleX & scaleY from the matrix components
//
// Also handle cases where the transform includes rotation or skew in addition to scaling
function getScaleFromTransform(el) {
    if (!el) return { scaleX: 1, scaleY: 1 };

    const style = getComputedStyle(el);
    const t = style.transform;

    if (!t || t === "none") return { scaleX: 1, scaleY: 1 };

    try {
        const matrix = new DOMMatrixReadOnly(t);
        const scaleX = Math.hypot(matrix.a, matrix.b);
        const scaleY = Math.hypot(matrix.c, matrix.d);
        return {
        scaleX: scaleX || 1,
        scaleY: scaleY || 1
        };
    } catch {
        return { scaleX: 1, scaleY: 1 };
    }
}

function placeTooltip({ x: _x, y: _y }) {
    x.value = _x;
    y.value = _y;
}

let animationFrameId = null;

function stepAnimation() {
    if (!props.show) {
        cancelAnimation();
        return;
    }

    if (!props.smooth) {
        displayPosition.value.x = targetPosition.value.x;
        displayPosition.value.y = targetPosition.value.y;
        cancelAnimation();
        return;
    }

    const dx = targetPosition.value.x - displayPosition.value.x;
    const dy = targetPosition.value.y - displayPosition.value.y;

    if (Math.abs(dx) <= props.smoothSnapThreshold && Math.abs(dy) <= props.smoothSnapThreshold) {
        displayPosition.value.x = targetPosition.value.x;
        displayPosition.value.y = targetPosition.value.y;
        cancelAnimation();
        return;
    }

    displayPosition.value.x += dx * props.smoothForce;
    displayPosition.value.y += dy * props.smoothForce;

    animationFrameId = requestAnimationFrame(stepAnimation);
}

function ensureAnimationRunning() {
    if (animationFrameId == null && props.show && props.smooth) {
        animationFrameId = requestAnimationFrame(stepAnimation);
    }
}

function cancelAnimation() {
    if (animationFrameId != null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

watch([x, y], ([newX, newY]) => {
    targetPosition.value.x = newX;
    targetPosition.value.y = newY;

    if (!props.smooth) {
        displayPosition.value.x = newX;
        displayPosition.value.y = newY;
    } else {
        ensureAnimationRunning();
    }
});

watch(
    () => props.show,
    async (show) => {
        if (!show) {
            cancelAnimation();
            return;
        }

        const initialX = x.value;
        const initialY = y.value;

        targetPosition.value.x = initialX;
        targetPosition.value.y = initialY;
        displayPosition.value.x = initialX;
        displayPosition.value.y = initialY;

        await nextTick();
        snapshotGeometry();
        ensureAnimationRunning();
    }
);

onUnmounted(() => {
    cancelAnimation();
});

// Match the coordinate system used by the tooltip positioning logic
// to keep the tooltip aligned with the cursor inside transformed dialogs
const normalizedClientPosition = computed(() => {
    const cbRect = cbRectSnapshot.value;
    if (!cbRect) return { x: displayPosition.value.x, y: displayPosition.value.y };

    const { scaleX, scaleY } = cbScaleSnapshot.value;

    return {
        x: (displayPosition.value.x - cbRect.left) / scaleX,
        y: (displayPosition.value.y - cbRect.top) / scaleY
    };
});

// Proxy object used to keep calcTooltipPosition() in a single coordinate space.
// When the tooltip is inside a transformed ancestor (dialog/modal animation),
// `position: fixed` becomes relative to that containing block, not the viewport.
// calcTooltipPosition() relies on chart.getBoundingClientRect(), which normally
// returns viewport-based coordinates.
//
// This proxy overrides getBoundingClientRect() to:
// > translate the chart’s rect into the containing block’s local coordinates
// > compensate for any scale applied via CSS transforms (scale / matrix)
//
// Both the mouse position and the chart geometry are expressed
// in the same coordinate system, preventing tooltip drift inside transformed dialogs.
const chartProxyForCalc = computed(() => {
    const cbRect = cbRectSnapshot.value;
    const chartRect = chartRectSnapshot.value;

    if (!cbRect || !chartRect) return props.parent;

    const { scaleX, scaleY } = cbScaleSnapshot.value;

    return {
        ...props.parent,
        getBoundingClientRect() {
            const r = chartRect;
            return {
                left: (r.left - cbRect.left) / scaleX,
                top: (r.top - cbRect.top) / scaleY,
                right: (r.right - cbRect.left) / scaleX,
                bottom: (r.bottom - cbRect.top) / scaleY,
                width: r.width / scaleX,
                height: r.height / scaleY,
                x: (r.left - cbRect.left) / scaleX,
                y: (r.top - cbRect.top) / scaleY
            };
        }
    };
});

const pixelPosition = computed(() => {
    const pos = calcTooltipPosition({
        tooltip: tooltip.value,
        chart: chartProxyForCalc.value,
        clientPosition: normalizedClientPosition.value,
        positionPreference: props.position,
        defaultOffsetY: props.offsetY,
        blockShiftY: props.blockShiftY
    });

    return {
        top: Math.round(pos.top),
        left: Math.round(pos.left)
    };
});


const convertedBackground = computed(() => {
    return setOpacity(props.backgroundColor, props.backgroundOpacity);
});

const tooltipStyle = computed(() => {
    const base = {
        pointerEvents: "none",
        position: "fixed",
        top: "0px",
        left: "0px",
        transform: `translate3d(${pixelPosition.value.left}px, ${pixelPosition.value.top}px, 0)`,
        borderRadius: `${props.borderRadius}px`,
        border: `${props.borderWidth}px solid ${props.borderColor}`,
        zIndex: 2147483647
    };

    if (!props.isCustom) {
        Object.assign(base, {
        background: convertedBackground.value,
        color: props.color,
        maxWidth: props.maxWidth,
        fontSize: `${props.fontSize}px`
        });
    }

    return base;
});

defineExpose({
    placeTooltip
});

</script>

<template>
    <teleport :to="isFullscreen ? parent : teleportTo">
        <div 
            ref="tooltip" 
            role="tooltip" 
            :aria-hidden="!show" 
            aria-live="polite" 
            data-cy="tooltip" 
            v-if="show" 
            :class="{
                'vue-data-ui-custom-tooltip': isCustom,
                'vue-data-ui-tooltip': !isCustom,
                'vue-data-ui-tooltip-backdrop': backdropFilter
            }" 
            :style="tooltipStyle"
        >
            <slot name="tooltip-before" />
            <slot />
            <div v-html="content" />
            <slot name="tooltip-after" />
        </div>
    </teleport>
</template>

<style>
.vue-data-ui-tooltip {
    box-shadow: 0 6px 12px -6px rgba(0, 0, 0, 0.2);
    position: fixed;
    padding: 12px;
}

.vue-data-ui-tooltip-backdrop {
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}

.vue-data-ui-custom-tooltip {
    position: fixed;
    z-index: 3;
}

.vue-data-ui-tooltip,
.vue-data-ui-custom-tooltip {
    will-change: transform;
}
</style>

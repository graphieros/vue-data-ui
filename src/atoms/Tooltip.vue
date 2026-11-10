<script setup>
import { computed, ref, shallowRef, watch } from 'vue';
import { useAnimationFrame } from '../useAnimationFrame';
import { calcTooltipPosition } from '../calcTooltipPosition';
import { useMouse } from '../useMouse';
import { setOpacity } from '../lib';

const props = defineProps({
    teleportTo: {
        type: String,
        default: 'body',
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF',
    },
    color: {
        type: String,
        default: '#000000',
    },
    content: String,
    maxWidth: {
        type: String,
        default: '300px',
    },
    parent: {
        type: Object,
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
        default: 14,
    },
    borderRadius: {
        type: Number,
        default: 4,
    },
    borderColor: {
        type: String,
        default: '#e1e5e8',
    },
    borderWidth: {
        type: Number,
        default: 1,
    },
    backgroundOpacity: {
        type: Number,
        default: 100,
    },
    position: {
        type: String,
        default: 'center',
    },
    offsetY: {
        type: Number,
        default: 24,
    },
    offsetX: {
        type: Number,
        default: 0,
    },
    blockShiftY: {
        type: Boolean,
        default: false,
    },
    isFullscreen: {
        type: Boolean,
        default: false,
    },
    smooth: {
        type: Boolean,
        default: true,
    },
    backdropFilter: {
        type: Boolean,
        default: true,
    },
    smoothForce: {
        type: Number,
        default: 0.18,
    },
    smoothSnapThreshold: {
        type: Number,
        default: 0.25,
    },
    isA11yMode: {
        type: Boolean,
        default: false,
    },
    a11yPosition: {
        type: Object,
        default: null,
    },
});

const tooltip = ref(null);

const { x, y, setPosition } = useMouse(() => props.show && !props.isA11yMode);
const targetPosition = ref({ x: 0, y: 0 });
const displayPosition = ref({ x: 0, y: 0 });

// containing block detection (first ancestor with transform/filter/perspective/contain:paint, etc)
const containingBlock = shallowRef(null);

const cbRectSnapshot = shallowRef(null);
const cbScaleSnapshot = shallowRef({ scaleX: 1, scaleY: 1 });
const chartRectSnapshot = shallowRef(null);
const tooltipRectSnapshot = shallowRef(null);

// Refresh only when geometry is invalidated, independently of pointer animation.
function snapshotGeometry() {
    const cb = findContainingBlock(tooltip.value);
    containingBlock.value = cb;
    tooltipRectSnapshot.value = tooltip.value?.getBoundingClientRect() || null;
    chartRectSnapshot.value = props.parent?.getBoundingClientRect?.() || null;

    if (!cb) {
        cbRectSnapshot.value = null;
        cbScaleSnapshot.value = { scaleX: 1, scaleY: 1 };
        return;
    }

    cbRectSnapshot.value = cb.getBoundingClientRect();
    cbScaleSnapshot.value = getScaleFromTransform(cb);
}

const geometryFrame = useAnimationFrame();
let scheduleGeometry = () => {};
watch(
    [
        () => props.show,
        tooltip,
        () => props.parent,
        () => props.teleportTo,
        () => props.isFullscreen,
    ],
    ([show, element, parent], _, onCleanup) => {
        geometryFrame.cancel();
        if (!show || !element) return;
        let active = true;
        const ancestors = new Set();
        for (const start of [parent, element.parentElement]) {
            for (let node = start; node; node = node.parentElement)
                ancestors.add(node);
        }
        function measure() {
            if (!active || !props.show) return;
            snapshotGeometry();
            // Keep bounds current during an ancestor's CSS layout animation,
            // while keeping ordinary pointer smoothing free of DOM measurements.
            if (
                [...ancestors].some((node) =>
                    node
                        .getAnimations?.()
                        .some(
                            (animation) =>
                                animation.playState === 'running' &&
                                animation.effect
                                    ?.getKeyframes()
                                    .some((frame) =>
                                        Object.keys(frame).some((key) =>
                                            /^(transform|translate|rotate|scale|width|height|left|right|top|bottom|margin|padding)/.test(
                                                key,
                                            ),
                                        ),
                                    ),
                        ),
                )
            )
                geometryFrame.request(measure);
        }
        const schedule = () => {
            if (active) geometryFrame.request(measure);
        };
        scheduleGeometry = schedule;
        const onMotion = (event) => {
            if (ancestors.has(event.target)) schedule();
        };
        const resizeObserver =
            typeof ResizeObserver === 'undefined'
                ? null
                : new ResizeObserver(schedule);
        resizeObserver?.observe(element, { box: 'border-box' });
        ancestors.forEach((node) =>
            resizeObserver?.observe(node, { box: 'border-box' }),
        );
        const mutationObserver = new MutationObserver(schedule);
        ancestors.forEach((node) =>
            mutationObserver.observe(node, {
                attributes: true,
                attributeFilter: ['style', 'class', 'hidden', 'open', 'dir'],
                childList: true,
            }),
        );
        window.addEventListener('resize', schedule, { passive: true });
        window.addEventListener('scroll', schedule, {
            capture: true,
            passive: true,
        });
        window.addEventListener('transitionrun', onMotion, true);
        window.addEventListener('animationstart', onMotion, true);
        measure();
        onCleanup(() => {
            active = false;
            scheduleGeometry = () => {};
            geometryFrame.cancel();
            resizeObserver?.disconnect();
            mutationObserver.disconnect();
            window.removeEventListener('resize', schedule);
            window.removeEventListener('scroll', schedule, true);
            window.removeEventListener('transitionrun', onMotion, true);
            window.removeEventListener('animationstart', onMotion, true);
        });
    },
    { immediate: true, flush: 'post' },
);
watch(
    () => [
        props.content,
        props.fontSize,
        props.maxWidth,
        props.borderWidth,
        props.isCustom,
    ],
    () => {
        if (props.show && tooltip.value) scheduleGeometry();
    },
    { flush: 'post' },
);

// Detect whether a style creates a containing block for `position: fixed`, which can change the reference coordinate system used
// by the tooltip when it is rendered inside transformed ancestors.
function hasContainingBlockStyle(style) {
    if (!style) return false;
    if (style.transform && style.transform !== 'none') return true;
    if (style.perspective && style.perspective !== 'none') return true;
    if (style.filter && style.filter !== 'none') return true;
    if (style.backdropFilter && style.backdropFilter !== 'none') return true;
    if (style.contain && style.contain.includes('paint')) return true;
    if (
        style.willChange &&
        (style.willChange.includes('transform') ||
            style.willChange.includes('filter'))
    )
        return true;
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

    if (!t || t === 'none') return { scaleX: 1, scaleY: 1 };

    try {
        const matrix = new DOMMatrixReadOnly(t);
        const scaleX = Math.hypot(matrix.a, matrix.b);
        const scaleY = Math.hypot(matrix.c, matrix.d);
        return {
            scaleX: scaleX || 1,
            scaleY: scaleY || 1,
        };
    } catch {
        return { scaleX: 1, scaleY: 1 };
    }
}

function placeTooltip({ x: _x, y: _y }) {
    if (props.isA11yMode) return;
    setPosition({ x: _x, y: _y });
}

const animation = useAnimationFrame();
let animationRunning = false;

function stepAnimation() {
    if (!props.show || props.isA11yMode || animation.isDisposed()) {
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

    if (
        Math.abs(dx) <= props.smoothSnapThreshold &&
        Math.abs(dy) <= props.smoothSnapThreshold
    ) {
        displayPosition.value.x = targetPosition.value.x;
        displayPosition.value.y = targetPosition.value.y;
        cancelAnimation();
        return;
    }

    displayPosition.value.x += dx * props.smoothForce;
    displayPosition.value.y += dy * props.smoothForce;

    animation.request(stepAnimation);
}

function ensureAnimationRunning() {
    if (
        !animationRunning &&
        props.show &&
        props.smooth &&
        !props.isA11yMode &&
        !animation.isDisposed()
    ) {
        if (
            displayPosition.value.x === targetPosition.value.x &&
            displayPosition.value.y === targetPosition.value.y
        )
            return;
        animationRunning = true;
        animation.request(stepAnimation);
    }
}

function cancelAnimation() {
    animationRunning = false;
    animation.cancel();
}

watch([x, y], ([newX, newY]) => {
    if (!props.show || props.isA11yMode) return;
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
    [() => props.show, () => props.isA11yMode, () => props.smooth],
    ([show, isA11yMode]) => {
        cancelAnimation();
        if (!show || isA11yMode) return;
        targetPosition.value = { x: x.value, y: y.value };
        displayPosition.value = { x: x.value, y: y.value };
    },
    { immediate: true },
);

const effectiveClientPosition = computed(() => {
    if (
        props.isA11yMode &&
        props.a11yPosition &&
        typeof props.a11yPosition.x === 'number' &&
        typeof props.a11yPosition.y === 'number'
    ) {
        return {
            x: props.a11yPosition.x,
            y: props.a11yPosition.y,
        };
    }

    return {
        x: displayPosition.value.x,
        y: displayPosition.value.y,
    };
});

// Match the coordinate system used by the tooltip positioning logic
// to keep the tooltip aligned with the cursor inside transformed dialogs
const normalizedClientPosition = computed(() => {
    const cbRect = cbRectSnapshot.value;

    if (!cbRect) {
        return {
            x: effectiveClientPosition.value.x,
            y: effectiveClientPosition.value.y,
        };
    }

    const { scaleX, scaleY } = cbScaleSnapshot.value;

    return {
        x: (effectiveClientPosition.value.x - cbRect.left) / scaleX,
        y: (effectiveClientPosition.value.y - cbRect.top) / scaleY,
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

    if (!chartRect) return null;
    if (!cbRect) return { getBoundingClientRect: () => chartRect };

    const { scaleX, scaleY } = cbScaleSnapshot.value;

    return {
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
                y: (r.top - cbRect.top) / scaleY,
            };
        },
    };
});

const tooltipProxyForCalc = computed(() =>
    tooltipRectSnapshot.value
        ? { getBoundingClientRect: () => tooltipRectSnapshot.value }
        : null,
);

const pixelPosition = computed(() => {
    const pos = calcTooltipPosition({
        tooltip: tooltipProxyForCalc.value,
        chart: chartProxyForCalc.value,
        clientPosition: normalizedClientPosition.value,
        positionPreference: props.position,
        defaultOffsetX: props.offsetX,
        defaultOffsetY: props.offsetY,
        blockShiftY: props.blockShiftY,
    });

    return {
        top: Math.round(pos.top),
        left: Math.round(pos.left),
    };
});

const convertedBackground = computed(() => {
    return setOpacity(props.backgroundColor, props.backgroundOpacity);
});

const tooltipStyle = computed(() => {
    const base = {
        pointerEvents: 'none',
        position: 'fixed',
        top: '0px',
        left: '0px',
        transform: `translate3d(${pixelPosition.value.left}px, ${pixelPosition.value.top}px, 0)`,
        borderRadius: `${props.borderRadius}px`,
        border: `${props.borderWidth}px solid ${props.borderColor}`,
        zIndex: 2147483647,
    };

    if (!props.isCustom) {
        Object.assign(base, {
            background: convertedBackground.value,
            color: props.color,
            maxWidth: props.maxWidth,
            fontSize: `${props.fontSize}px`,
        });
    }

    return base;
});

defineExpose({
    placeTooltip,
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
                'vue-data-ui-tooltip-backdrop': backdropFilter,
            }"
            :style="tooltipStyle"
        >
            <slot name="tooltip-before" />
            <slot />
            <slot name="tooltip">
                <div v-html="content" />
            </slot>
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
    backdrop-filter: blur(10px) !important;
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

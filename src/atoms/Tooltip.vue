<script setup>
import { computed, ref, watch, onUnmounted, nextTick } from "vue";
import { calcTooltipPosition } from "../calcTooltipPosition";
import { useMouse } from "../useMouse";
import { setOpacity } from "../lib";

const props = defineProps({
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
    }
});

const tooltip = ref(null);

const { x, y } = useMouse(props.parent);
const targetPosition = ref({ x: 0, y: 0 });
const displayPosition = ref({ x: 0, y: 0 });

const smoothing = 0.18;
let animationFrameId = null;

function animate() {
    if (!props.smooth) {
        displayPosition.value.x = targetPosition.value.x;
        displayPosition.value.y = targetPosition.value.y;
        return;
    }
    displayPosition.value.x += (targetPosition.value.x - displayPosition.value.x) * smoothing;
    displayPosition.value.y += (targetPosition.value.y - displayPosition.value.y) * smoothing;
    animationFrameId = requestAnimationFrame(animate);
}

watch([x, y], ([newX, newY]) => {
    targetPosition.value.x = newX;
    targetPosition.value.y = newY;
    if (!props.smooth) {
        displayPosition.value.x = newX;
        displayPosition.value.y = newY;
    }
});

watch(() => props.show, async (show) => {
    if (show) {
        const initialX = x.value;
        const initialY = y.value;
        targetPosition.value.x = initialX;
        targetPosition.value.y = initialY;
        displayPosition.value.x = initialX;
        displayPosition.value.y = initialY;
        await nextTick();
        if (!animationFrameId) animate();
    } else {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
});

onUnmounted(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
});

const position = computed(() => {
    const pos = calcTooltipPosition({
        tooltip: tooltip.value,
        chart: props.parent,
        clientPosition: displayPosition.value,
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
</script>

<template>
    <teleport :to="isFullscreen ? parent : 'body'">
        <div
            ref="tooltip"
            role="tooltip"
            :aria-hidden="!show"
            aria-live="polite"
            data-cy="tooltip"
            :class="{'vue-data-ui-custom-tooltip' : isCustom, 'vue-data-ui-tooltip': !isCustom}"
            v-if="show"
            :style="`
                pointer-events:none;
                top:${position.top}px;
                left:${position.left}px;
                ${isCustom ? '' : `background:${convertedBackground};color:${color};max-width:${maxWidth};font-size:${fontSize}px`};
                border-radius:${borderRadius}px;
                border:${borderWidth}px solid ${borderColor};
                z-index:2147483647;
            `"
        >
            <slot name="tooltip-before"/>
            <slot/>
            <div v-html="content"/>
            <slot name="tooltip-after"/>
        </div>
    </teleport>
</template>

<style>
.vue-data-ui-tooltip {
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    position: fixed;
    padding:12px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}
.vue-data-ui-custom-tooltip {
    position: fixed;
    z-index: 3;
}
.vue-data-ui-tooltip,
.vue-data-ui-custom-tooltip {
    will-change: top, left;
}
</style>

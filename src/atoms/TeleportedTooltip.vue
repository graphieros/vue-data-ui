<script setup>
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
    show: { 
        type: Boolean, 
        default: false 
    },
    x: { 
        type: Number, 
        required: true 
    },
    y: { 
        type: Number, 
        required: true 
    },
    placement: { 
        type: String, 
        default: 'top' 
    },
    styleObject: {
        type: Object,
        default() { return {}; }
    },
    delay: { 
        type: Number, 
        default: 0 
    },
    delayIn: { 
        type: Number, 
        default: 300 
    },
    delayOut: { 
        type: Number, 
        default: 0 
    },
});

const enterDelay = computed(() => props.delayIn ?? props.delay);
const leaveDelay = computed(() => props.delayOut ?? props.delay);

const visible = ref(false);
let showTimer = null;
let hideTimer = null;

function clearTimers() {
    if (showTimer) { clearTimeout(showTimer); showTimer = null; }
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
}

function scheduleShow() {
    clearTimers();
    const ms = Math.max(0, enterDelay.value || 0);
    if (ms === 0) {
        visible.value = true;
    } else {
        showTimer = setTimeout(() => { visible.value = true; showTimer = null; }, ms);
    }
}

function scheduleHide() {
    clearTimers();
    const ms = Math.max(0, leaveDelay.value || 0);
    if (ms === 0) {
        visible.value = false;
    } else {
        hideTimer = setTimeout(() => { visible.value = false; hideTimer = null; }, ms);
    }
}

watch(() => props.show, (next) => {
    next ? scheduleShow() : scheduleHide();
}, { immediate: true });

onMounted(() => {
    if (props.show) scheduleShow();
});

onBeforeUnmount(() => {
    clearTimers();
});

const mergedStyle = computed(() => {
    return {
        position: 'fixed',
        zIndex: 2147483647,
        top: `${props.y}px`,
        left: `${props.x}px`,
        transform: props.placement === 'bottom'
            ? 'translate(-50%, 8px)'
            : 'translate(-50%, -100%)',
        pointerEvents: 'none',
        ...props.styleObject,
    };
});
</script>

<template>
    <teleport to="body">
        <div v-if="visible" :class="['teleport-tooltip', placement]" :style="mergedStyle" role="tooltip"
            aria-hidden="false">
            <div class="teleport-tooltip__inner">
                <slot />
            </div>
        </div>
    </teleport>
</template>

<style scoped>
.teleport-tooltip__inner {
    padding: 6px 8px;
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    position: relative;
    font-family: inherit;
}

.teleport-tooltip__inner::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
}
</style>

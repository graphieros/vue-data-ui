<script setup>
import { computed, watch, nextTick, onBeforeUnmount } from "vue";

const props = defineProps({
    uid: { type: String, required: true },
    svgRef: { type: Object, default: null },
    pulsePathId: { type: String, required: true },
    pulsePathLength: { type: Number, required: true },
    pulseDur: { type: String, required: true },
    pulseBegin: { type: String, required: true },
    pulseRepeatCount: { type: String, required: true },
    pulseFillMode: { type: String, default: undefined },
    pulseKeyPoints: { type: String, required: true },
    pulseMotion: { type: Object, required: true },
    pulse: { type: Object, required: true },
    pulseTrail: { type: Object, required: true },
    pulseTrailLength: { type: Number, required: true },
    prefersReducedMotion: { type: Boolean, required: true },
    loading: { type: Boolean, required: true },
    isBar: { type: Boolean, required: true },
});

const TRAIL_LENGTH = computed(() => Math.min(props.pulseTrailLength, 45));

const canRender = computed(() => {
    return (
        !!props.pulse?.show &&
        !props.isBar &&
        !props.prefersReducedMotion &&
        !props.loading &&
        Number(props.pulsePathLength) > 0
    );
});

function hardStopSmil() {
    const svgElement = props.svgRef?.value;
    if (!svgElement) return;

    if (typeof svgElement.pauseAnimations === "function") svgElement.pauseAnimations();
    if (typeof svgElement.setCurrentTime === "function") svgElement.setCurrentTime(0);
    if (typeof svgElement.unpauseAnimations === "function") svgElement.unpauseAnimations();
}

function addDelay(duration, delay) {
    if (typeof duration !== 'string') return duration;
    const match = duration.trim().match(/^([\d.]+)\s*(ms|s)$/);
    if (!match) return duration;
    const value = Number(match[1]);
    const unit = match[2];
    if (Number.isNaN(value)) return duration;
    const result = value + delay;
    return `${result}${unit}`;
}

function getRadius(i) {
    return ((TRAIL_LENGTH.value - i) / TRAIL_LENGTH.value) * props.pulse.radius;
}

function getAnimateOpacityValues(i) {
    const maxOpacity = props.pulse.trail.opacity; // just in case, for later
    const t = (TRAIL_LENGTH.value - i) / TRAIL_LENGTH.value;
    const val = i === 0 ? 1 : t * maxOpacity;
    return `0;${val};${val};0`;
}

watch(
    () => props.loading,
    async (isLoading) => {
        if (isLoading) {
            hardStopSmil();
            return;
        }
        await nextTick();
        hardStopSmil();
    }
);

watch(
    () => props.pulsePathId,
    async () => {
        await nextTick();
        hardStopSmil();
    }
);

onBeforeUnmount(() => {
    hardStopSmil();
});
</script>

<template>
    <g v-if="canRender" style="pointer-events: none">
        <!-- DOT & TRAIL -->
        <template v-for="(_, i) in TRAIL_LENGTH">
            <circle
                v-if="i % 3 === 0 /* perf optimization */"
                :key="`sparkline_dot_${i}_${pulsePathId}`" 
                :r="getRadius(i)" 
                :fill="pulse.color"
                :filter="`url(#sparkline_pulse_glow_${uid})`" 
                opacity="0"
            >
                <animateMotion 
                    :begin="addDelay(pulseBegin, i * 10)" 
                    :dur="pulseDur" 
                    :repeatCount="pulseRepeatCount" 
                    :fill="pulseFillMode"
                    :calcMode="pulseMotion.calcMode" 
                    :keySplines="pulseMotion.keySplines || undefined"
                    :keyTimes="pulseMotion.keyTimes || undefined" 
                    :keyPoints="pulseKeyPoints" 
                    rotate="auto"
                >
                    <mpath :href="`#${pulsePathId}`" />
                </animateMotion>
                <animate 
                    attributeName="opacity" 
                    :dur="pulseDur" 
                    :repeatCount="pulseRepeatCount" 
                    :fill="pulseFillMode"
                    :values="getAnimateOpacityValues(i)" 
                    keyTimes="0;0.1;0.9;1" 
                />
            </circle>
        </template>

        <!-- HALO -->
        <circle :key="`sparkline_halo_${pulsePathId}`" :r="Math.max(pulse.radius * 1.3)" :fill="pulse.color"
            opacity="0">
            <animateMotion :begin="pulseBegin" :dur="pulseDur" :repeatCount="pulseRepeatCount"
                :calcMode="pulseMotion.calcMode" :keySplines="pulseMotion.keySplines || undefined"
                :keyTimes="pulseMotion.keyTimes || undefined" :keyPoints="pulseKeyPoints" rotate="auto">
                <mpath :href="`#${pulsePathId}`" />
            </animateMotion>
            <animate attributeName="opacity" values="0;0.35;0.35;0" keyTimes="0;0.15;0.85;1" :dur="pulseDur"
                :repeatCount="pulseRepeatCount" />
        </circle>
    </g>
</template>

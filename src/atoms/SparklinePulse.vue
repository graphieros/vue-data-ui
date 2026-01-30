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
    pulseTrailOffset: { type: Number, required: true },
    prefersReducedMotion: { type: Boolean, required: true },
    loading: { type: Boolean, required: true },
    isBar: { type: Boolean, required: true },
});

const canRender = computed(() => {
    return (
        !!props.pulse?.show &&
        !!props.pulseTrail?.show &&
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
        <!-- TRAIL: reuse the MAIN PATH geometry exactly -->
        <use :key="`sparkline_trail_${pulsePathId}`" :href="`#${pulsePathId}`" :stroke="pulse.color" fill="none"
            stroke-linecap="round" stroke-linejoin="round" :stroke-width="pulseTrail.width" opacity="0"
            :stroke-dasharray="`${pulseTrail.lengthPx} ${Math.max(1, pulsePathLength - pulseTrail.lengthPx)}`">
            <animate attributeName="stroke-dashoffset" :begin="pulseBegin" :dur="pulseDur"
                :repeatCount="pulseRepeatCount" :fill="pulseFillMode" :calcMode="pulseMotion.calcMode"
                :keySplines="pulseMotion.keySplines || undefined" :keyTimes="pulseMotion.keyTimes || undefined"
                :from="pulsePathLength + pulseTrailOffset" :to="pulseTrailOffset" />
            <animate attributeName="opacity" :begin="pulseBegin" :dur="pulseDur" :repeatCount="pulseRepeatCount"
                :fill="pulseFillMode" :values="`0;${pulseTrail.opacity};${pulseTrail.opacity};0`"
                :keyTimes="`0;${pulseTrail.fadeIn};${1 - pulseTrail.fadeOut};1`" />
        </use>

        <!-- DOT -->
        <circle :key="`sparkline_dot_${pulsePathId}`" :r="pulse.radius" :fill="pulse.color"
            :filter="`url(#sparkline_pulse_glow_${uid})`" opacity="0">
            <animateMotion :begin="pulseBegin" :dur="pulseDur" :repeatCount="pulseRepeatCount" :fill="pulseFillMode"
                :calcMode="pulseMotion.calcMode" :keySplines="pulseMotion.keySplines || undefined"
                :keyTimes="pulseMotion.keyTimes || undefined" :keyPoints="pulseKeyPoints" rotate="auto">
                <mpath :href="`#${pulsePathId}`" />
            </animateMotion>
            <animate attributeName="opacity" :dur="pulseDur" :repeatCount="pulseRepeatCount" :fill="pulseFillMode"
                values="0;1;1;0" keyTimes="0;0.1;0.9;1" />
        </circle>

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

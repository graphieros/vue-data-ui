<script setup>
import { ref, watch, nextTick, toRef, onMounted, computed } from "vue";
import { placeHTMLElementAtSVGCoordinates, setOpacity } from "../lib";

const props = defineProps({
    svgRef: { type: Object },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    prevX: { type: Number, required: true },
    prevY: { type: Number, required: true },
    offsetY: { type: Number, default: 0 },
    background: { type: String },
    backgroundOpacity: { type: Number, default: 100 },
    borderRadius: { type: Number, default: 2 },
    borderWidth: { type: Number, default: 0 },
    borderColor: { type: String, default: '#FFFFFF' },
    color: { type: String },
    fontSize: { type: Number }
});

const svg = toRef(props.svgRef);
const tooltipRef = ref(null);
const top = ref(0);
const left = ref(0);
const transitionEnabled = ref(false);


const convertedBackground = computed(() => {
    return setOpacity(props.background, props.backgroundOpacity);
})

const updateTooltipPosition = async () => {
    if (!svg.value || !tooltipRef.value) return;

    const newPosition = placeHTMLElementAtSVGCoordinates({
        svgElement: svg.value,
        element: tooltipRef.value,
        x: props.x,
        y: props.y,
        offsetY: props.offsetY
    });

    const prevPosition = placeHTMLElementAtSVGCoordinates({
        svgElement: svg.value,
        element: tooltipRef.value,
        x: props.prevX,
        y: props.prevY,
        offsetY: props.offsetY
    });

    if (!newPosition || !prevPosition) return;

    transitionEnabled.value = false;
    top.value = prevPosition.top;
    left.value = prevPosition.left;

    await nextTick(); 

    setTimeout(() => {
        transitionEnabled.value = true;
        top.value = newPosition.top;
        left.value = newPosition.left;
    }, 50);
};

onMounted(updateTooltipPosition);

watch(
    () => [props.x, props.y, props.prevX, props.prevY],
    () => updateTooltipPosition(),
    { immediate: true }
);
</script>

<template>
    <div 
        ref="tooltipRef" 
        class="vue-data-ui-spark-tooltip"
        :style="{
            position: 'fixed',
            top: `${top}px`, 
            left: `${left}px`, 
            pointerEvents: 'none',
            background: convertedBackground,
            color: props.color,
            fontSize: `${props.fontSize}px`,
            borderRadius: `${props.borderRadius}px`,
            border: `${props.borderWidth}px solid ${props.borderColor}`,
            transition: transitionEnabled ? 'top 0.3s ease-out, left 0.3s ease-out' : 'none'
        }"
    >
        <slot></slot>
    </div>
</template>

<style scoped>
.vue-data-ui-spark-tooltip {
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    backdrop-filter: blur(10px);
    padding: 0 0.5rem;
    -webkit-backdrop-filter: blur(10px);
}
</style>
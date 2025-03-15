<script setup>
import { ref, computed, toRef, onMounted } from "vue";
import { placeHTMLElementAtSVGCoordinates } from "../lib";

const props = defineProps({
    svgRef: { type: Object },
    x: { type: Number },
    y: { type: Number },
    offsetY: { type: Number, default: 0 },
    background: { type: String },
    color: { type: String },
    fontSize: { type: Number }
})

const svg = toRef(props.svgRef)
const tooltipRef = ref(null)

const tooltip = computed(() => {

    const { top, left } = placeHTMLElementAtSVGCoordinates({
        svgElement: svg.value,
        element: tooltipRef.value,
        x: props.x,
        y: props.y,
        offsetY: props.offsetY
    })

    return {
        top,
        left,
    }
})

</script>

<template>
    <div 
        ref="tooltipRef" 
        class="vue-data-ui-spark-tooltip"
        :style="{
            position: 'fixed',
            top: tooltip.top + 'px',
            left: tooltip.left + 'px',
            pointerEvents: 'none',
            background: props.background,
            color: props.color,
            fontSize: props.fontSize + 'px',
        }"
    >
        <slot></slot>
    </div>
</template>
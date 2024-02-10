<script setup>
import { createUid } from '../lib';
import { computed } from "vue"

const props = defineProps({
    markerEnd: {
        type: Boolean,
        default: true
    },
    markerSize: {
        type: Number,
        default: 10
    },
    markerStart: {
        type: Boolean,
        default: false,
    },
    stroke: {
        type: String,
        default: "#2D353C"
    },
    strokeDasharray: {
        type: Number,
        default: 0
    },
    strokeLinecap: {
        type: String,
        default: "round"
    },
    strokeWidth: {
        type: Number,
        default: 1
    },
    x1: {
        type: Number,
        default: 0
    },
    x2: {
        type: Number,
        default: 0,
    },
    y1: {
        type: Number,
        default: 0
    },
    y2: {
        type: Number,
        default: 0
    },
})

const uid = createUid();

const viewBox = computed(() => {
    return `0 0 ${props.markerSize} ${props.markerSize}`
})

const refC = computed(() => props.markerSize / 2)
const markerS = computed(() => {
    return refC.value + (props.markerSize / 10)
})

</script>

<template>
    <g class="vue-ui-element-arrow">
        <defs>
            <marker :id="`arrow_end_${uid}`" orient="auto" :viewBox="viewBox" :refX="refC" :refY="refC" :markerWidth="markerS" :markerHeight="markerS">
                <path :d="`M 0 0 L ${markerSize} ${refC} L 0 ${markerSize} z`" :fill="stroke" />
            </marker>
            <marker :id="`arrow_start_${uid}`" orient="auto-start-reverse" :viewBox="viewBox" :refX="refC" :refY="refC" :markerWidth="markerS" :markerHeight="markerS">
                <path :d="`M 0 0 L ${markerSize} ${refC} L 0 ${markerSize} z`" :fill="stroke" />
            </marker>
        </defs>
        <line
            :x1="x1"
            :y1="y1"
            :x2="x2"
            :y2="y2"
            :stroke="stroke"
            :stroke-width="strokeWidth"
            :stroke-linecap="strokeLinecap"
            :stroke-dasharray="strokeDasharray"
            :marker-end="markerEnd ? `url(#arrow_end_${uid})` : ''"
            :marker-start="markerStart ? `url(#arrow_start_${uid})` : ''"
        />
    </g>
</template>
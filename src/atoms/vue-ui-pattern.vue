<script setup>
import { computed } from "vue";
import usePatterns from '../usePatterns';

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    },
    fill: {
        type: String,
        default: '#FFFFFF00'
    },
    stroke: {
        type: String,
        default: '#2D353C'
    },
    strokeWidth: {
        type: Number,
        default: 1
    },
    scale: {
        type: Number,
        default: 1
    },
});

const patterns = usePatterns();
const pattern = computed(() => patterns[props.name]);

</script>

<template>
    <pattern
        :id="id"
        :height="pattern.height"
        :width="pattern.width"
        :patternTransform="`scale(${props.scale})`"
        patternUnits="userSpaceOnUse"
    >
        <rect width="100%" height="100%" :fill="fill"/>
        <path
            :fill="pattern.hasFill ? props.stroke : 'none'"
            :stroke="pattern.hasFill ? 'none' : props.stroke"
            :stroke-width="props.strokeWidth"
            :stroke-linecap="pattern.strokeLinecap"
            :d="pattern.path"
        />
    </pattern>
</template>


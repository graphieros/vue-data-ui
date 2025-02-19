<script setup>
import { computed } from "vue";
import { createPolygonPath, createStar } from "../lib";

const props = defineProps({
    color: String,
    isSelected: {
        type: Boolean,
        default: false,
    },
    limit: {
        type: Number,
        default: 3
    },
    plot: Object,
    radius: Number,
    shape: String,
    stroke: String,
    strokeWidth: Number,
    zoom: {
        type: Number,
        default: 1.3
    }
});

const emit = defineEmits(['mouseover', 'mouseout', 'click']);

function getPolygonConfigFromName(name){
    return {
        circle: {
            points: 1,
            rotation: 0
        },
        line: {
            points: 2,
            rotation: 0
        },
        triangle: {
            points: 3,
            rotation: 0.52
        },
        square: {
            points: 4,
            rotation: 0.783
        },
        diamond: {
            points: 4,
            rotation: 0
        },
        pentagon: {
            points: 5,
            rotation: 0.95
        },
        hexagon: {
            points: 6,
            rotation: 0
        }
    }[name]
}

const config = computed(() => {
    return getPolygonConfigFromName(props.shape)
});

const starPoints = computed(() => {
    if (props.shape !== 'star') return null;
    return createStar({
        plot: { x: props.plot.x, y: props.plot.y },
        radius: props.radius * (props.isSelected ? props.zoom : 1)
    })
})

const d = computed(() => {
    return createPolygonPath({
        plot: { x: props.plot.x, y: props.plot.y },
        radius: props.radius * (props.isSelected ? props.zoom : 1),
        sides: config.value.points,
        rotation: config.value.rotation
    }).path;
});

</script>

<template>
    <g data-cy="atom-shape"> 
        <circle
            v-if="config && config.points === 1"
            :cx="plot.x"
            :cy="plot.y"
            :r="props.radius * (props.isSelected ? props.zoom : 1)"
            :fill="color"
            :stroke="stroke"
            :stroke-width="strokeWidth"
            @mouseover="emit('mouseover')"
            @mouseout="emit('mouseout')"
            @click="emit('click')"
        />
        <path
            v-if="config && config.points >= limit"
            :d="d"
            :fill="color"
            :stroke="stroke"
            :stroke-width="strokeWidth"
            @mouseover="emit('mouseover')"
            @mouseout="emit('mouseout')"
            @click="emit('click')"
        />
        <polygon 
            v-if="starPoints"
            :points="starPoints"
            :fill="color"
            :stroke="stroke"
            :stroke-width="strokeWidth"
            @mouseover="emit('mouseover')"
            @mouseout="emit('mouseout')"
            @click="emit('click')"
        />
    </g>
</template>
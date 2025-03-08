<template>
    <template v-for="node in dataset">
        <template v-if="node.polygonPath && node.polygonPath.coordinates">
            <template v-for="(coordinate, index) in node.polygonPath.coordinates">
                <circle 
                    data-cy="recursive-circle"
                    :cx="coordinate.x" 
                    :cy="coordinate.y" 
                    :r="node.circleRadius" 
                    :fill="`url(#gradient_${node.color})`"
                    :stroke="hoveredUid && hoveredUid === node.uid ? strokeHovered : stroke" 
                    :stroke-width="hoveredUid && hoveredUid === node.uid ? node.circleRadius / 6 : node.circleRadius / 12" 
                    style="cursor:pointer"
                    @click="click(node)"
                    @mouseover="hover(node)" 
                    @mouseleave="hover(null)" 
                />
                <foreignObject 
                    v-if="$slots.node"
                    :x="coordinate.x - node.circleRadius"
                    :y="coordinate.y - node.circleRadius"
                    :height="node.circleRadius * 2"
                    :width="node.circleRadius * 2"
                    style="overflow: visible"
                    @click.stop="click(node)"
                    @mouseover="hover(node)" 
                    @mouseleave="hover(null)" 
                >
                    <slot name="node" v-bind="{ node }"/>
                </foreignObject>
            </template>
            <template v-if="node.nodes && node.nodes.length > 0">
                <RecursiveCircles 
                    :dataset="node.nodes" 
                    :color="color" 
                    :stroke="stroke" 
                    :strokeHovered="strokeHovered" 
                    :hoveredUid="hoveredUid" 
                    @click="click" 
                    @hover="hover" 
                >
                    <template #node="{ node }">
                        <slot name="node" v-bind="{ node }"/>
                    </template>
                </RecursiveCircles>
            </template>
        </template>
    </template>
</template>

<script setup>
import { toRef } from 'vue';

const props = defineProps({
    color: {
        type: String,
        default: '#000000',
    },
    dataset: {
        type: Array,
        default: () => [],
    },
    hoveredUid: {
        type: String,
        default: null
    },
    linkColor: {
        type: String,
        default: '#CCCCCC',
    },
    stroke: {
        type: String,
        default: "#FFFFFF"
    },
    strokeHovered: {
        type: String,
        default: '#000000'
    },
});

const emit = defineEmits(["click", 'hover']);

function click(node) {
    emit('click', node)
}

function hover(node) {
    emit('hover', node)
}

const nodes = toRef(props, 'dataset');

nodes.value.forEach((node) => {
    if (node.nodes && node.nodes.length > 0) {
        node.nodes.forEach((childNode) => {
            childNode.ancestor = node;
        });
    }
});
</script>

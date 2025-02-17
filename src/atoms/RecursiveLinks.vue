<template>
  <template v-for="node in dataset">
    <template v-if="node.polygonPath && node.polygonPath.coordinates">
      <template v-for="(coordinate, index) in node.polygonPath.coordinates">
        <template v-if="node.ancestor && node.ancestor.polygonPath">
          <line
            data-cy="recursive-link-wrapper"
            :x1="coordinate.x"
            :y1="coordinate.y"
            :x2="node.ancestor.polygonPath.coordinates[0].x"
            :y2="node.ancestor.polygonPath.coordinates[0].y"
            :stroke="backgroundColor"
            :stroke-width="node.circleRadius / 1.5"
          />
          <line
            data-cy="recursive-link"
            :x1="coordinate.x"
            :y1="coordinate.y"
            :x2="node.ancestor.polygonPath.coordinates[0].x"
            :y2="node.ancestor.polygonPath.coordinates[0].y"
            :stroke="color"
            :stroke-width="node.circleRadius / 2"
          />
        </template>
      </template>
    </template>
  </template>
  <template v-for="node in dataset">
    <template v-if="node.polygonPath && node.polygonPath.coordinates">
      <template v-if="node.nodes && node.nodes.length > 0">
        <RecursiveLinks :dataset="node.nodes" :color="color" :backgroundColor="backgroundColor"/>
      </template>
    </template>
  </template>
</template>

<script setup>
import { toRef } from 'vue';

const props = defineProps({
  dataset: {
    type: Array,
    default: () => [],
  },
  color: {
    type: String,
    default: '#DDDDDD',
  },
  backgroundColor: {
    type: String,
    default: '#FFFFFF'
  }
});

const nodes = toRef(props, 'dataset');

nodes.value.forEach((node) => {
  if (node.nodes && node.nodes.length > 0) {
    node.nodes.forEach((childNode) => {
      childNode.ancestor = node;
    });
  }
});
</script>


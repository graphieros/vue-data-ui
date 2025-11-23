<template>
  <template v-for="(node, i) in nodes" :key="`level_${i}`">
    <template v-if="node.polygonPath && node.polygonPath.coordinates">
      <template
        v-for="(coordinate, index) in node.polygonPath.coordinates"
        :key="`node_${i}_${index}`"
      >
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
  
  <template v-for="node in nodes" :key="`children_${node.uid || node.name}`">
    <template v-if="node.polygonPath && node.polygonPath.coordinates">
      <template v-if="node.nodes && node.nodes.length > 0">
        <RecursiveLinks
          :dataset="node.nodes"
          :color="color"
          :backgroundColor="backgroundColor"
        />
      </template>
    </template>
  </template>
</template>

<script setup>
import { ref, watch } from 'vue';

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
    default: '#FFFFFF',
  },
});

const nodes = ref([]);

watch(
  () => props.dataset,
  (newDataset) => {
    const data = newDataset || [];

    data.forEach((node) => {
      if (node.nodes && node.nodes.length > 0) {
        node.nodes.forEach((childNode) => {
          if (childNode.ancestor !== node) {
            childNode.ancestor = node;
          }
        });
      }
    });

    nodes.value = data;
  },
  { immediate: true }
);
</script>

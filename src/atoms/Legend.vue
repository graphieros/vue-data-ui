<script setup>
import Shape from './Shape.vue';

const props = defineProps({
    legendSet: {
        type: Array,
        default() {
            return []
        } 
    },
    config: {
        type: Object,
        default() {
            return {}
        }
    }
})

const emit = defineEmits(['clickMarker'])

function handleClick(legend, i) {
    emit('clickMarker', { legend, i})
}

</script>

<template>
    <div
        :data-cy="config.cy"
        class="vue-data-ui-legend"
        :style="`background:${config.backgroundColor};font-size:${config.fontSize}px;color:${config.color};padding-bottom:${config.paddingBottom}px;font-weight:${config.fontWeight}`"
    >
        <slot name="legendTitle" :titleSet="legendSet"></slot>
        <div v-for="(legend, i) in legendSet" class="vue-data-ui-legend-item">
            <svg @click="handleClick(legend, i)" v-if="legend.shape" :height="config.fontSize" :width="config.fontSize" viewBox="0 0 20 20" :style="`overflow: visible;opacity:${legend.opacity}`">
                <Shape
                    :shape="legend.shape"
                    :radius="9"
                    stroke="none"
                    :plot="{ x: 10, y: 10 }"
                    :fill="legend.color"
                />
            </svg>
            <slot name="item" :legend="legend" :index="i"/>
        </div>
    
    </div>
</template>

<style scoped>
.vue-data-ui-legend {
    user-select:none;
    height: fit-content;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-data-ui-legend-item {
    user-select: none;
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: fit-content;
    text-align: left;
}
</style>
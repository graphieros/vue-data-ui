<script setup>
import { isValidUserValue } from '../lib';
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
    },
    id: {
        type: String,
        default: ''
    },
    clickable: {
        type: Boolean,
        default: true
    },
    isCursorPointer: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['clickMarker'])

function handleClick(legend, i) {
    emit('clickMarker', { legend, i })
}
</script>

<template>
    <div :id="id" :data-cy="config.cy" class="vue-data-ui-legend" :style="{
        background: config.backgroundColor,
        color: config.color,
        paddingBottom: (config.paddingBottom ?? 0) + 'px',
        paddingTop: (config.paddingTop ?? 12) + 'px',
        fontWeight: config.fontWeight,
        fontSize: `var(--legend-font-size, ${(config.fontSize ?? 14)}px)`
    }">
        <slot name="legendTitle" :titleSet="legendSet" />

        <!-- For BaseLegendToggle -->
        <slot name="legendToggle"/>
        
        <div v-for="(legend, i) in legendSet" :key="`legend_${i}`"
            :class="{ 'vue-data-ui-legend-item': true, 'active': clickable && isCursorPointer }">
            <svg
                data-cy="legend-marker"
                v-if="legend.shape" 
                @click="handleClick(legend, i)" 
                height="1em" 
                width="1em"
                :viewBox="legend.shape && legend.shape === 'star' ? '-10 -10 80 80' : '0 0 60 60'"
                :style="`overflow: visible; opacity:${legend.opacity}`"
            >
                <Shape 
                    stroke="none"
                    :shape="legend.shape" 
                    :radius="30" 
                    :plot="{ 
                        x: 30, 
                        y: legend.shape === 'triangle' ? 36 : 30 
                    }" 
                    :fill="legend.color" 
                />
                <slot 
                    name="legend-pattern"
                    v-bind="{ 
                        legend, 
                        index: isValidUserValue(legend.absoluteIndex) ? legend.absoluteIndex : i 
                    }" 
                />
            </svg>
            <slot name="item" :legend="legend" :index="i" />
        </div>
    </div>
</template>

<style scoped>
.vue-data-ui-legend {
    user-select: none;
    height: fit-content;
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 18px;
}

.vue-data-ui-legend-item {
    user-select: none;
    display: flex;
    align-items: center;
    gap: 6px;
    height: fit-content;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.active {
    cursor: pointer;
}
</style>
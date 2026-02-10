<script setup>
import BaseIcon from "./BaseIcon.vue";

const props = defineProps({
    backgroundColor: { type: String, default: '#CCCCCC' },
    color: { type: String, default: '#2D353C' },
    fontSize: { type: Number, default: 14 },
    checked: { type: Boolean },
    isCursorPointer: { type: Boolean }
});

const emit = defineEmits(['toggle']);

</script>

<template>
    <div :class="{ 'vue-ui-legend-toggle-wrapper': isCursorPointer }" data-dom-to-png-ignore>
        <div
            class="vue-ui-legend-toggle"
            role="button" 
            tabindex="0"
            @click="emit('toggle')"
            @keydown.enter="emit('toggle')"
            :style="{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor,
                padding: fontSize / 4 + 'px'
            }">
            <BaseIcon 
                :name="checked ? 'minus' : 'check'" 
                :stroke="color"
                :size="fontSize * 0.6"
                :stroke-width="fontSize / 4"
            />
        </div>
    </div>
</template>

<style scoped>
    .vue-ui-legend-toggle-wrapper {
        cursor: pointer; 
    }
</style>
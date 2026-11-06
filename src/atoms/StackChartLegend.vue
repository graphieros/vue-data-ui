<script setup>
import Legend from './Legend.vue';
import Shape from './Shape.vue';
import BaseLegendToggle from './BaseLegendToggle.vue';
defineProps({
    legend: Object,
    legendSet: Array,
    legendConfig: Object,
    isCursorPointer: Boolean,
    hasPattern: Boolean,
    uid: String,
    segregated: Array,
    loading: Boolean,
});
defineEmits(['toggle']);
</script>
<template>
    <Legend
        v-if="legend.show"
        :legendSet="legendSet"
        :config="legendConfig"
        :isCursorPointer="isCursorPointer"
        @clickMarker="({ legend }) => legend.segregate()"
    >
        <template #legend-pattern="{ legend, index }" v-if="hasPattern">
            <Shape
                :shape="legend.shape"
                :radius="30"
                stroke="none"
                :plot="{ x: 30, y: 30 }"
                :fill="`url(#pattern_${uid}_${index})`"
            />
        </template>

        <template #item="{ legend }">
            <div
                @click="legend.segregate()"
                :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`"
                v-if="!loading"
            >
                {{ legend.name }}
            </div>
        </template>

        <template #legendToggle>
            <BaseLegendToggle
                v-if="
                    legendSet.length > 2 &&
                    legend.selectAllToggle.show &&
                    !loading
                "
                :backgroundColor="legend.selectAllToggle.backgroundColor"
                :color="legend.selectAllToggle.color"
                :fontSize="legend.fontSize"
                :checked="segregated.length > 0"
                :isCursorPointer="isCursorPointer"
                @toggle="$emit('toggle')"
            />
        </template>
    </Legend>
</template>

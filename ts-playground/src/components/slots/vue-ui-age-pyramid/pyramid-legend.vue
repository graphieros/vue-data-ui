<script setup lang="ts">
import { computed } from 'vue';
import type { VueUiAgePyramidLegendSlotProps } from 'vue-data-ui/vue-ui-age-pyramid';

const props = defineProps<{
    legend: VueUiAgePyramidLegendSlotProps;
}>();

const items = computed(() => {
    const leftMinItem = props.legend.reduce((min, current) => {
        return current.left.value < min!.left.value ? current : min;
    }, props.legend[0]);

    const leftMaxItem = props.legend.reduce((max, current) => {
        return current.left.value > max!.left.value ? current : max;
    }, props.legend[0]);

    const rightMinItem = props.legend.reduce((min, current) => {
        return current.right.value < min!.right.value ? current : min;
    }, props.legend[0]);

    const rightMaxItem = props.legend.reduce((max, current) => {
        return current.right.value > max!.right.value ? current : max;
    }, props.legend[0]);

    return [
        {
            name: 'female',
            color: props.legend[0]?.left.color,
            min: {
                value: leftMinItem?.left.value,
                age: leftMinItem?.age,
            },
            max: {
                value: leftMaxItem?.left.value,
                age: leftMaxItem?.age,
            },
        },
        {
            name: 'male',
            color: props.legend[0]?.right.color,
            min: {
                value: rightMinItem?.left.value,
                age: rightMinItem?.age,
            },
            max: {
                value: rightMaxItem?.left.value,
                age: rightMaxItem?.age,
            },
        },
    ];
});
</script>

<template>
    <span style="color: chocolate">#legend</span>
    <div class="legend-wrapper">
        <div v-for="item in items" :key="item.name" class="legend-item">
            <div class="marker">
                <svg viewBox="0 0 10 10" width="12" height="12">
                    <rect
                        x="0"
                        y="0"
                        width="10"
                        height="10"
                        :fill="item.color"
                    />
                </svg>
                {{ item.name }}
            </div>
            <span>
                min: age <b>{{ item.min.age }}</b> with value:
                <b>{{ item.min.value?.toFixed(0) }}</b>
            </span>
            <span>
                max: age <b>{{ item.max.age }}</b> with value:
                <b>{{ item.max.value?.toFixed(0) }}</b>
            </span>
        </div>
    </div>
</template>

<style scoped>
.legend-wrapper {
    display: flex;
    gap: 1rem;
    justify-content: center;
}
.legend-item {
    display: flex;
    flex-direction: column;
    color: #1a1a1a;
    justify-content: start;
    align-items: start;
    line-height: 1rem;
}
</style>

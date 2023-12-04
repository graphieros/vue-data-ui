<script setup>
import { computed, ref } from "vue";
import { calcTooltipPosition } from "../calcTooltipPosition";
import { useMouse } from "../useMouse";

const props = defineProps({
    backgroundColor: {
        type: String,
        default: "#FFFFFF"
    },
    color: {
        type: String,
        default: "#000000"
    },
    content: String,
    maxWidth: {
        type: String,
        default: '300px'
    },
    parent: {
        type: Object
    },
    show: {
        type: Boolean,
        default: false,
    },
});

const tooltip = ref(null)

const clientPosition = ref(useMouse());

const position = computed(() => {
    return calcTooltipPosition({
        tooltip: tooltip.value,
        chart: props.parent,
        clientPosition: clientPosition.value
    });
})

</script>

<template>
    <div
        ref="tooltip"
        data-cy="tooltip"
        class="vue-data-ui-tooltip"
        v-if="show"
        :style="`top:${position.top}px;left:${position.left}px;background:${props.backgroundColor};color:${props.color};max-width:${props.maxWidth}`"
        v-html="content"
    />
</template>

<style scoped>
.vue-data-ui-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    position: fixed;
    padding:12px;
    z-index:1;
}
</style>
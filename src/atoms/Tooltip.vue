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
    isCustom: {
        type: Boolean,
        default: false,
    },
    fontSize: {
        type: [Number, String],
        default: 14
    }
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
        :class="{'vue-data-ui-custom-tooltip' : isCustom, 'vue-data-ui-tooltip': !isCustom}"
        v-if="show"
        :style="`top:${position.top}px;left:${position.left}px;${isCustom ? '' : `background:${backgroundColor};color:${color};max-width:${maxWidth};font-size:${props.fontSize}px`}`"
    >
        <slot name="tooltip-before"/>
        <slot/>
        <div v-html="content"/>
        <slot name="tooltip-after"/>
    </div>
</template>

<style>
.vue-data-ui-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    position: fixed;
    padding:12px;
    z-index:3 !important;
}
.vue-data-ui-custom-tooltip {
    position: fixed;
    z-index: 3;
}
</style>
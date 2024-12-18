<script setup>
import { computed, ref } from "vue";
import { calcTooltipPosition } from "../calcTooltipPosition";
import { useMouse } from "../useMouse";
import { opacity, setOpacity } from "../lib";

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
    },
    borderRadius: {
        type: Number,
        default: 4
    },
    borderColor: {
        type: String,
        default: '#e1e5e8'
    },
    borderWidth: {
        type: Number,
        default: 1
    },
    backgroundOpacity: {
        type: Number,
        default: 100,
    },
    position: {
        type: String,
        default: "center"
    },
    offsetY: {
        type: Number,
        default: 24
    },
    blockShiftY: {
        type: Boolean,
        default: false,
    },
    isFullscreen: {
        type: Boolean,
        default: false
    }
});

const tooltip = ref(null)

const clientPosition = ref(useMouse(props.parent));

const position = computed(() => {
    return calcTooltipPosition({
        tooltip: tooltip.value,
        chart: props.parent,
        clientPosition: clientPosition.value,
        positionPreference: props.position,
        defaultOffsetY: props.offsetY,
        blockShiftY: props.blockShiftY
    });
})

const convertedBackground = computed(() => {
    return setOpacity(props.backgroundColor, props.backgroundOpacity);
})

</script>

<template>
    <teleport :to="isFullscreen ? parent : 'body'">
        <div
            ref="tooltip"
            data-cy="tooltip"
            :class="{'vue-data-ui-custom-tooltip' : isCustom, 'vue-data-ui-tooltip': !isCustom}"
            v-if="show"
            :style="`pointer-events:none;top:${position.top}px;left:${position.left}px;${isCustom ? '' : `background:${convertedBackground};color:${color};max-width:${maxWidth};font-size:${fontSize}px`};border-radius:${borderRadius}px;border:${borderWidth}px solid ${borderColor};`"
        >
            <slot name="tooltip-before"/>
            <slot/>
            <div v-html="content"/>
            <slot name="tooltip-after"/>
        </div>
    </teleport>
</template>

<style>
.vue-data-ui-tooltip {
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    position: fixed;
    padding:12px;
    z-index:3 !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
}
.vue-data-ui-custom-tooltip {
    position: fixed;
    z-index: 3;
}
</style>
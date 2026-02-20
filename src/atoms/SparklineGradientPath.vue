<script setup>
import { ref, watch } from "vue";
import { SvgPathGradientAsync } from "../SPG";

const props = defineProps({
    svgPathData: { type: String, required: true },
    enabled: { type: Boolean, required: true },
    strokeWidth: { type: Number, required: true },
    highColor: { type: String, required: true },
    lowColor: { type: String, required: true },
    segments: { type: Number, required: true },
});

const gradientMarkup = ref("");
let requestToken = 0;

watch(
    () => [
        props.enabled,
        props.svgPathData,
        props.strokeWidth,
        props.highColor,
        props.lowColor,
        props.segments,
    ],
    async ([enabled]) => {
        const token = ++requestToken;

        if (!enabled) {
            gradientMarkup.value = "";
            return;
        }

        const result = await SvgPathGradientAsync(props.svgPathData, null, {
            segments: props.segments,
            temperatureMode: "vertical",
            temperatureColors: [props.highColor, props.lowColor],
            attrs: {
                "stroke-width": props.strokeWidth,
                "stroke-linecap": "round",
                "stroke-linejoin": "round",
            },
            groupAttrs: { class: "vue-ui-sparkline-gradient" },
        });

        if (token !== requestToken) return; // stale
        gradientMarkup.value = result;
    },
    { immediate: true }
);
</script>

<template>
    <g v-html="gradientMarkup" />
</template>

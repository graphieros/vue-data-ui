<script setup>
import { ref, computed, onMounted } from "vue";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import { dataLabel } from "../lib";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Number,
        default: 0
    },
});

const defaultConfig = ref(mainConfig.vue_ui_kpi);

const kpiConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    })
});

const formattedValue = ref(typeof props.dataset === 'number' ? props.dataset : props.dataset);
const displayedValue = ref(kpiConfig.value.useAnimation ? kpiConfig.value.animationValueStart : formattedValue.value );

onMounted(() => {
    const chunks = kpiConfig.value.animationFrames;
    const chunk = props.dataset / chunks;

    function animate() {
        displayedValue.value += chunk;
        if (displayedValue.value < props.dataset) {
            requestAnimationFrame(animate)
        } else {
            displayedValue.value = props.dataset;
        }
    }

    if (kpiConfig.value.useAnimation) {
        displayedValue.value = 0;
        animate()
    }
});

</script>

<template>
    <div :class="`vue-ui-kpi ${kpiConfig.layoutClass}`" :style="`${kpiConfig.layoutCss}`">
        <div :class="`vue-ui-kpi-title ${kpiConfig.titleClass}`" :style="`font-family: ${kpiConfig.fontFamily}; font-size:${kpiConfig.titleFontSize}px; color:${kpiConfig.titleColor}; font-weight:${kpiConfig.titleBold ? 'bold' : 'normal'}; ${kpiConfig.titleCss}`">
            <slot name="title" :comment="dataset"></slot>
            {{ kpiConfig.title }}
        </div>
        <slot name="comment-before" :comment="dataset"></slot>
        <div :class="`vue-ui-kpi-value ${kpiConfig.valueClass}`" :style="`font-family: ${kpiConfig.fontFamily}; font-size:${kpiConfig.valueFontSize}px; color:${kpiConfig.valueColor}; font-weight:${kpiConfig.valueBold ? 'bold': 'normal'}; ${kpiConfig.valueCss}`">
            <slot name="value" :comment="dataset"></slot>
            {{ dataLabel({ p: kpiConfig.prefix, v: displayedValue, s: kpiConfig.suffix, r: kpiConfig.valueRounding }) }}
        </div>
        <slot name="comment-after" :comment="dataset"></slot>
    </div>
</template>
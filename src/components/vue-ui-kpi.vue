<script setup>
import { ref, computed, onMounted, watch, useSlots } from "vue";
import { useNestedProp } from "../useNestedProp";
import { applyDataLabel, dataLabel } from "../lib";
import { useConfig } from "../useConfig";
import Digits from "./vue-ui-digits.vue";

const { vue_ui_kpi: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        }
    },
    dataset: {
        type: Number,
        default: 0
    }
});

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const slots = useSlots();

onMounted(() => {
    if (slots['chart-background']) {
        console.warn('VueUiKpi does not support the #chart-background slot.')
    }
});

function prepareConfig() {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
}, { deep: true });

const formattedValue = ref(typeof props.dataset === 'number' ? props.dataset : props.dataset);
const displayedValue = ref(FINAL_CONFIG.value.useAnimation ? FINAL_CONFIG.value.animationValueStart : formattedValue.value);

const animateToValue = (targetValue) => {
    const chunks = FINAL_CONFIG.value.animationFrames;
    const chunk = Math.abs(targetValue - displayedValue.value) / chunks;

    function animate() {
        if (displayedValue.value < targetValue) {
            displayedValue.value = Math.min(displayedValue.value + chunk, targetValue);
        } else if (displayedValue.value > targetValue) {
            displayedValue.value = Math.max(displayedValue.value - chunk, targetValue);
        }

        if (displayedValue.value !== targetValue) {
            requestAnimationFrame(animate);
        }
    }

    animate();
};

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if (FINAL_CONFIG.value.useAnimation) {
        displayedValue.value = FINAL_CONFIG.value.animationValueStart;
        animateToValue(props.dataset);
    } else {
        displayedValue.value = props.dataset;
    }
}

watch(() => props.dataset, (newValue) => {
    if (FINAL_CONFIG.value.useAnimation) {
        animateToValue(newValue);
    } else {
        displayedValue.value = newValue;
    }
});

</script>

<template>
    <div :class="`vue-ui-kpi ${FINAL_CONFIG.layoutClass}`" :style="`background:${FINAL_CONFIG.backgroundColor}; ${FINAL_CONFIG.layoutCss}`">
        <div :class="`vue-ui-kpi-title ${FINAL_CONFIG.titleClass}`" :style="`font-family: ${FINAL_CONFIG.fontFamily}; font-size:${FINAL_CONFIG.titleFontSize}px; color:${FINAL_CONFIG.titleColor}; font-weight:${FINAL_CONFIG.titleBold ? 'bold' : 'normal'}; ${FINAL_CONFIG.titleCss}`">
            <slot name="title" :comment="dataset"></slot>
            {{ FINAL_CONFIG.title }}
        </div>
        <slot name="comment-before" :comment="dataset"></slot>
        <div :class="`vue-ui-kpi-value ${FINAL_CONFIG.valueClass}`" :style="`font-family: ${FINAL_CONFIG.fontFamily}; font-size:${FINAL_CONFIG.valueFontSize}px; color:${FINAL_CONFIG.valueColor}; font-weight:${FINAL_CONFIG.valueBold ? 'bold': 'normal'}; ${FINAL_CONFIG.valueCss}`">
            <slot name="value" :comment="dataset"></slot>
            <template v-if="FINAL_CONFIG.analogDigits.show">
                <div :style="{ height: FINAL_CONFIG.analogDigits.height + 'px'}">
                    <Digits 
                        :dataset="Number(displayedValue.toFixed(FINAL_CONFIG.valueRounding))"
                        :config="{
                            backgroundColor: FINAL_CONFIG.backgroundColor,
                            digits: {
                                color: FINAL_CONFIG.analogDigits.color,
                                skeletonColor: FINAL_CONFIG.analogDigits.skeletonColor
                            }
                        }"
                    />
                </div>
            </template>
            <template v-else>
                {{ applyDataLabel(
                    FINAL_CONFIG.formatter,
                    displayedValue,
                    dataLabel({ 
                        p: FINAL_CONFIG.prefix, 
                        v: displayedValue, 
                        s: FINAL_CONFIG.suffix, 
                        r: FINAL_CONFIG.valueRounding 
                    }))
                }}
            </template>
        </div>
        <slot name="comment-after" :comment="dataset"></slot>
    </div>
</template>
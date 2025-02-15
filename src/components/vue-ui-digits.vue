<script setup>
import { computed, ref } from "vue";
import Digit from '../atoms/Digit.vue';
import { useNestedProp } from "../useNestedProp";
import { XMLNS } from "../lib";
import { useConfig } from "../useConfig";

const { vue_ui_digits: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    dataset: {
        type: Number,
        default: 0
    },
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
});

const digits = computed(() => {
    const d = (props.dataset || 0).toString().split('');
    const digits = [];
    const init = {
        x: 10,
        y: 10
    }
    let digitWidth = 0;
    for(let i = 0; i < d.length; i += 1) {
        const digit = d[i];
        digits.push({
            x: init.x + digitWidth,
            y: init.y,
            quanta: digit
        })
        if(digit == '.') {
            digitWidth += 2;
        } else {
            digitWidth += 44;
        }
    }
    return digits;
})

const maxY = computed(() => {
    return Math.max(...digits.value.map(d => d.x)) + 36
})

</script>

<template>
    <svg class="vue-ui-digits" :xmlns="XMLNS" :viewBox="`0 0 ${maxY} 80`" :style="`background:${FINAL_CONFIG.backgroundColor};${FINAL_CONFIG.height ? `height:${FINAL_CONFIG.height};` : ''}${FINAL_CONFIG.width ? `width:${FINAL_CONFIG.width}` : ''}`">
        <Digit
            v-for="digit in digits"
            :x="digit.x"
            :y="digit.y"
            :quanta="digit.quanta"
            :color="FINAL_CONFIG.digits.color"
            :backgroundColor="FINAL_CONFIG.digits.skeletonColor"
        />
    </svg>
</template>
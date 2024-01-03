<script setup>
import { computed, ref } from "vue";
import Digit from '../atoms/Digit.vue';
import mainConfig from "../default_configs.json"
import { useNestedProp } from "../useNestedProp";

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

const defaultConfig = ref(mainConfig.vue_ui_digits);


const digitConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
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
    <svg :viewBox="`0 0 ${maxY} 80`" :style="`background:${digitConfig.backgroundColor};${digitConfig.height ? `height:${digitConfig.height};` : ''}${digitConfig.width ? `width:${digitConfig.width}` : ''}`">
        <Digit
            v-for="digit in digits"
            :x="digit.x"
            :y="digit.y"
            :quanta="digit.quanta"
            :color="digitConfig.digits.color"
            :backgroundColor="digitConfig.digits.skeletonColor"
        />
    </svg>
</template>
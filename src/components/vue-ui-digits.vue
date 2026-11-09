<script setup>
import { computed } from 'vue';
import Digit from '../atoms/Digit.vue';
import { useNestedProp } from '../useNestedProp';
import { createUid, XMLNS } from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import PackageVersion from '../atoms/PackageVersion.vue';

const { vue_ui_digits: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    dataset: {
        type: Number,
        default: 0,
    },
    config: {
        type: Object,
        default() {
            return {};
        },
    },
});

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });
});

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiDigits',
    rules: [COMMON_RULES.noHint],
});

const displayValue = computed(() => {
    const value = Number.isFinite(props.dataset) ? props.dataset : 0;
    const text = String(value);

    if (!text.includes('e')) {
        return text;
    }

    const [coefficient, exponent] = text.split('e');
    const sign = value < 0 ? '-' : '';
    const [integer, fraction = ''] = coefficient.replace('-', '').split('.');
    const digits = integer + fraction;
    const decimalIndex = integer.length + Number(exponent);

    if (decimalIndex <= 0) {
        return `${sign}0.${'0'.repeat(-decimalIndex)}${digits}`;
    }

    if (decimalIndex >= digits.length) {
        return sign + digits.padEnd(decimalIndex, '0');
    }

    return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
});

const digits = computed(() => {
    let x = 10;
    return [...displayValue.value].map((quanta) => {
        const digit = { x, y: 10, quanta };
        x += quanta === '.' ? 2 : 44;
        return digit;
    });
});

const viewBoxWidth = computed(() => digits.value.at(-1).x + 36);

const uid = createUid();
</script>

<template>
    <div class="sr-only" :id="`digit-${uid}`">
        {{ displayValue }}
    </div>
    <svg
        class="vue-data-ui-component vue-ui-digits"
        :xmlns="XMLNS"
        :viewBox="`0 0 ${viewBoxWidth} 80`"
        :style="{
            background: FINAL_CONFIG.backgroundColor,
            height: FINAL_CONFIG.height || undefined,
            width: FINAL_CONFIG.width || undefined,
        }"
        :aria-describedby="`digit-${uid}`"
    >
        <PackageVersion />
        <Digit
            v-for="digit in digits"
            :x="digit.x"
            :y="digit.y"
            :quanta="digit.quanta"
            :color="FINAL_CONFIG.digits.color"
            :backgroundColor="FINAL_CONFIG.digits.skeletonColor"
            :thickness="FINAL_CONFIG.digits.thickness"
        />
    </svg>
</template>

<style scoped>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    clip: rect(0 0 0 0);
    white-space: normal;
    border: 0;
}
</style>

<script setup>
/**
 * This component is designed to create various patterns from seeds, and included
 * inside vue-data-ui charts in the #pattern slots.
 * Using patterns helps users with vision deficency (like achromatopsia) to distinguish
 * series in the context of data visualisation.
 */
import { computed } from 'vue';
import { createSeededSvgPattern } from '../patternUtils';

const props = defineProps({
    id: { type: String, required: true },
    seed: { type: [String, Number], required: true },
    foregroundColor: { type: String, default: '#1A1A1A' },
    backgroundColor: { type: String, default: 'transparent' },
    maxSize: { type: Number, default: 24 },
    minSize: { type: Number, default: 16 },
    disambiguator: { type: [String, Number], default: '' },
});

const pattern = computed(() =>
    createSeededSvgPattern(props.seed, {
        foregroundColor: props.foregroundColor,
        backgroundColor: props.backgroundColor,
        minimumSize: props.minSize,
        maximumSize: props.maxSize,
        disambiguator: props.disambiguator,
    }),
);
</script>

<template>
    <pattern
        :id
        :width="pattern.width"
        :height="pattern.height"
        :patternTransform="`rotate(${pattern.rotation})`"
        patternUnits="userSpaceOnUse"
        v-html="pattern.contentMarkup"
    />
</template>

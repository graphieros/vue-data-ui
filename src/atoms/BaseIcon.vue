<script setup>
import { computed } from "vue";

const props = defineProps({
    name: String,
    size: {
        type: Number,
        default: 24
    },
    stroke: {
        type: String,
        default: "#CCCCCC"
    },
    strokeWidth: {
        type: Number,
        default: 1.5
    },
    isSpin: {
        type: Boolean,
        default: false
    }
});

const icons = computed(() => {
    return {
        sort: `<path stroke-width="${props.strokeWidth}" fill="none" stroke="${props.stroke}" stroke-linecap="round" d="M1 15 5 18 9 15M5 5 5 18M15 15 15 2M11 5 15 2 19 5" />`,
        spin: `<path stroke-width="${props.strokeWidth}" fill="none" stroke="${props.stroke}" stroke-linecap="round" d="M1 10A1 1 0 0019 10 1 1 0 004 10 1 1 0 0016 10 1 1 0 007 10 1 1 0 0013 10 1 1 0 0010 10M1 10Q1 5 5 2" />`,
        close: `<path fill="none" stroke-width="${props.strokeWidth}" fill="none" stroke="${props.stroke}" stroke-linecap="round" d="M4 4 16 16M4 16 16 4" />`,
        menu: `<path stroke-width="${props.strokeWidth}" fill="none" stroke="${props.stroke}" stroke-linecap="round" d="M2 10 18 10M2 5 18 5M2 15 18 15" />`,
        tableOpen: `<path stroke-width="${props.strokeWidth}" fill="none" stroke-linecap="round" stroke="${props.stroke}" d="M4 1 4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L7 19M4 1 16 1C18 1 19 2 19 4L19 14M18 16 14 19 10 16"/><line stroke-width="${props.strokeWidth}" stroke="${props.stroke}" x1="8" y1="1" x2="8" y2="19" stroke-linecap="round" /><line stroke-width="${props.strokeWidth}" stroke-linecap="round" stroke="${props.stroke}" x1="1" y1="8" x2="19" y2="8" />`,
        tableClose: `<path stroke-width="${props.strokeWidth}" stroke-linecap="round" fill="none" stroke="${props.stroke}" d="M4 1 4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L7 19M4 1 16 1C18 1 19 2 19 4L19 14M18 19 14 16 10 19"/><line stroke-width="${props.strokeWidth}" stroke="${props.stroke}" x1="8" y1="1" x2="8" y2="19" stroke-linecap="round" /><line stroke-width="${props.strokeWidth}" stroke="${props.stroke}" x1="1" y1="8" x2="19" y2="8" />`,
        image: `<path stroke-width="${props.strokeWidth}" fill="none" stroke="${props.stroke}" stroke-linecap="round" d="M4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L16 19C18 19 19 18 19 16L19 6C15 6 14 5 14 1ZM1 16C3.3333 13.6667 3 10 8 12M7 14C8 13 9 5 19 11"/><circle r="1" cx="6" cy="5" stroke="none" fill="${props.stroke}"/>`,
        excel: `<path stroke-width="${props.strokeWidth}" fill="none" stroke="${props.stroke}" stroke-linejoin="round" d="M4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L16 19C18 19 19 18 19 16L19 6C15 6 14 5 14 1ZM14 8C15 8 16 9 16 10L16 14C16 15 15 16 14 16L6 16C5 16 4 15 4 14L4 10C4 9 5 8 6 8Z"/><line stroke="${props.stroke}" stroke-width="${props.strokeWidth}" x1="9" x2="9" y1="8" y2="16" /><line stroke="${props.stroke}" stroke-width="${props.strokeWidth}" x1="4" x2="16" y1="12" y2="12" />`,
        pdf: `<path stroke-width="${props.strokeWidth}" fill="none" stroke="${props.stroke}" stroke-linecap="round" stroke-linejoin="round" d="M4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L16 19C18 19 19 18 19 16L19 6C15 6 14 5 14 1ZM4 16 4 9 5 9Q7 9 7 11 7 13 5 13L4 13M9 16 9 9 9 9Q12 9 12 12L12 13Q12 16 9 16L9 16M14 16 14 9 16 9M14 12 16 12"/>`,
        labelOpen: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M2 8C1 9 1 11 2 12L5 16C6 17 6 17 7 17L17 17C19 17 19 16 19 15L19 5C19 5 19 3 17 3L7 3C6 3 6 3 5 4L2 8M7 7 13 7M7 10 15 10M7 13 16 13" />`,
        labelClose: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M2 8C1 9 1 11 2 12L5 16C6 17 6 17 7 17L17 17C19 17 19 15 19 15L19 5C19 5 19 3 17 3L12 3M7 10 15 10M7 13 16 13M9 6 4 1M4 6 9 1" />`
    }
})

</script>

<template>
    <svg :class="{ 'spin ': isSpin }" viewBox="0 0 20 20" :height="size" :width="size" v-html="icons[name]" style="background:transparent" />
</template>

<style scoped>
svg * {
    all: unset;
}

.spin {
    animation: smartspin 0.5s infinite linear;
}
@keyframes smartspin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>

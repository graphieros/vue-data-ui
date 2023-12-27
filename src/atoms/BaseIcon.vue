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
        labelClose: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M2 8C1 9 1 11 2 12L5 16C6 17 6 17 7 17L17 17C19 17 19 15 19 15L19 5C19 5 19 3 17 3L12 3M7 10 15 10M7 13 16 13M9 6 4 1M4 6 9 1" />`,
        chartBar: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M2 12 2 18C2 19 2 19 3 19L5 19C6 19 6 19 6 18L6 12C6 11 6 11 5 11L3 11C2 11 2 11 2 12M8 7 8 18C8 19 8 19 9 19L11 19C12 19 12 19 12 18L12 7C12 6 12 6 11 6L9 6C8 6 8 6 8 7M14 2 14 18C14 19 14 19 15 19L17 19C18 19 18 19 18 18L18 2C18 1 18 1 17 1L15 1C14 1 14 1 14 2"/>`,
        chartLine: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 1 1 18C1 19 1 19 2 19L19 19M3 17Q3 12 5 7 6 5 8 10 10 15 11 6 12 3 14 8 16 11 19 1" />`,
        chartRings: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 14A1 1 0 0015 14 1 1 0 005 14M8 17A1 1 0 0012 17 1 1 0 008 17" />`,
        chartDonut: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 10A1 1 0 0019 10 1 1 0 001 10M6 10A1 1 0 0014 10 1 1 0 006 10M1 10 6 10M10 14 10 19M14 10" />`,
        chartGauge: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M19 13A1 1 0 001 13M9 15A1 1 0 0011 15 1 1 0 009 15M10 14 11 8" />`,
        chartTiremarks: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 8 1 12M3 8 3 12M5 8 5 12M7 8 7 12M9 8 9 12M11 8 11 12M13 8 13 12M15 8 15 12M17 8 17 12M19 8 19 12" />`,
        chartDonutEvolution: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 1 1 18C1 19 1 19 2 19L19 19M3 8A1 1 0 007 8 1 1 0 003 8M8 14A1 1 0 0012 14 1 1 0 008 14M14 4A1 1 0 0018 4 1 1 0 0014 4M7 10 9 12M11 12 15 6" />`,
        screenshot: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 4 1 3C1 2 2 1 3 1L4 1M16 1 17 1C18 1 19 2 19 3L19 4M1 16 1 17C1 18 2 19 3 19L4 19M16 19 17 19C18 19 19 18 19 17L19 16M8 10A1 1 0 0012 10 1 1 0 008 10M5 13 5 8C5 7 5 7 6 7L14 7C15 7 15 7 15 8L15 13C15 14 15 14 14 14L6 14C5 14 5 14 5 13M7 6 13 6" />`,
        chartWheel: `<circle cx="10" cy="10" r="7" fill="none" stroke="${props.stroke}" stroke-width="${props.strokewidth}" stroke-dasharray="16"/><circle cx="10" cy="10" r="9" fill="none" stroke="${props.stroke}" stroke-width="${props.strokewidth}" stroke-dasharray="2" style="opacity:0.7"/><circle cx="10" cy="10" r="1" fill="${props.stroke}" />`,
        skeleton: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M3 14A1 1 0 003 18L7 18A1 1 0 007 14L3 14M3 8A1 1 0 003 12L7 12A1 1 0 007 8L3 8M3 2A1 1 0 003 6L4 6A1 1 0 004 2L3 2M12 10 12 16C12 17 13 18 14 18L17 18C18 18 19 17 19 16L19 10C19 9 18 8 17 8L14 8C13 8 12 9 12 10" />`,
        chartSparkHistogram: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M2 9 2 11C2 12 3 12 3 12L5 12C6 12 6 11 6 11L6 9C6 8 5 8 5 8L3 8C2 8 2 9 2 9M8 8 8 12C8 12 8 13 9 13L11 13C12 13 12 12 12 12L12 8C12 7 11 7 11 7L9 7C8 7 8 8 8 8M14 9 14 11C14 12 15 12 15 12L17 12C18 12 18 11 18 11L18 9C18 9 18 8 17 8L15 8C14 8 14 9 14 9" />`,
        chartRelationCircle: `<path fill="none" stroke="${props.stroke}" stroke-linecap="${props.strokeWidth}" stroke-linecap="round" d="M1 10A1 1 0 0019 10 1 1 0 001 10M1 10C7 11 9 13 10 19M10 19C10 11 8 7 6 2M10 19C10 11 12 7 14 2M10 19C11 13 12 11 19 10" />`,
        chartCandlestick: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M2 9 2 11C2 12 3 12 3 12L5 12C6 12 6 11 6 11L6 9C6 8 5 8 5 8L3 8C2 8 2 9 2 9M8 8 8 12C8 12 8 13 9 13L11 13C12 13 12 12 12 12L12 8C12 7 11 7 11 7L9 7C8 7 8 8 8 8M14 9 14 14C14 15 15 15 15 15L17 15C18 15 18 14 18 14L18 9C18 9 18 8 17 8L15 8C14 8 14 9 14 9M4 8 4 5M3 5 5 5M10 13 10 16M9 16 11 16M16 8 16 2M15 2 17 2M10 7 10 4M9 4 11 4M4 12 4 18M3 18 5 18M16 15 16 18M15 18 17 18" />`,
        chartScatter: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 1 1 18C1 19 1 19 2 19L19 19" /><circle stroke="none" fill="${props.stroke}" cx="5" cy="15" r="1"/><circle stroke="none" fill="${props.stroke}" cx="6" cy="12" r="1" /><circle stroke="none" fill="${props.stroke}" cx="8" cy="15" r="1"/><circle stroke="none" fill="${props.stroke}" cx="10" cy="8" r="1"/><circle stroke="none" fill="${props.stroke}" cx="12" cy="10" r="1"/><circle stroke="none" fill="${props.stroke}" cx="14" cy="6" r="1"/><circle stroke="none" fill="${props.stroke}" cx="16" cy="4" r="1"/><circle stroke="none" fill="${props.stroke}" cx="11" cy="14" r="1"/>`,
        chartVerticalBar: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 3 1 5C1 6 1 6 2 6L9 6C10 6 10 6 10 5L10 3C10 2 10 2 9 2L2 2C1 2 1 2 1 3M1 9 1 11C1 12 1 12 2 12L13 12C14 12 14 12 14 11L14 9C14 8 14 8 13 8L2 8C1 8 1 8 1 9M1 15 1 17C1 18 1 18 2 18L17 18C18 18 18 18 18 17L18 15C18 14 18 14 17 14L2 14C1 14 1 14 1 15" />`,
        chartOnion: `<circle fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" cx="10" cy="10" r="9" stroke-dasharray="20" /><circle fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" cx="10" cy="10" r="5" stroke-dasharray="16" style="transform:rotate(-110deg);transform-origin:center" /><circle fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" cx="10" cy="10" r="2" stroke-dasharray="8" style="transform:rotate(-100deg);transform-origin:center"/>`,
        chartQuadrant: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M10 1 10 19M1 10 19 10" /><circle stroke="none" fill="${props.stroke}" cx="3" cy="14" r="1"/><circle stroke="none" fill="${props.stroke}" cx="5" cy="6" r="1"/><circle stroke="none" fill="${props.stroke}" cx="14" cy="17" r="1"/><circle stroke="none" fill="${props.stroke}" cx="17" cy="14" r="1"/><circle stroke="none" fill="${props.stroke}" cx="15" cy="4" r="1"/>`,
        chartThermometer: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M13 4A1 1 0 007 4L7 16A1 1 0 0013 16L13 4M7 15 8 15M7 12 8 12M7 9 8 9M7 6 8 6M10 18 10 9M12 15 13 15M12 12 13 12M12 9 13 9M12 6 13 6" />`,
        chartRadar: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M2 6 2 14 10 19 18 14 18 6 10 1 2 6" /><path fill="${props.stroke}" stroke="none" stroke-width="0" stroke-linecap="round" d="M4 7 10 5 18 6 12 11 10 16 6 11 4 7" />`,
        chartSparkStackbar: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M3 8A1 1 0 003 12L17 12A1 1 0 0017 8L3 8M5 8 5 12M9 8 9 12M15 8 15 12" />`,
        smiley: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 12C8 14 12 14 15 12M5 7A1 1 0 008 7 1 1 0 005 7M12 7A1 1 0 0015 7 1 1 0 0012 7" />`,
        star: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" d="M3 19 10 15 17 19 14 12 19 8 13 8 10 2 7 8 1 8 6 12 3 19" />`,
        chartChestnut: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M4 3A1 1 0 004 9 1 1 0 004 3M4 12A1 1 0 004 17 1 1 0 004 12M9 4 19 4M9 7 17 7M9 10 15 10M9 13 13 13M9 16 11 16" />`,
        chartAgePyramid: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M3 19 17 19M2 17 18 17M1 15 19 15M2 13 18 13M4 11 16 11M2 9 18 9M4 7 17 7M7 5 13 5M9 3 11 3M10 1 11 1" />`,
        chartWaffle: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 2 1 4C1 5 1 5 2 5L4 5C5 5 5 5 5 4L5 2C5 1 5 1 4 1L2 1C1 1 1 1 1 2M18 1 16 1C15 1 15 1 15 2L15 4C15 5 15 5 16 5L18 5C19 5 19 5 19 4L19 2C19 1 19 1 18 1M8 2 8 4C8 5 8 5 9 5L11 5C12 5 12 5 12 4L12 2C12 1 12 1 11 1L9 1C8 1 8 1 8 2M2 19 4 19C5 19 5 19 5 18L5 16C5 15 5 15 4 15L2 15C1 15 1 15 1 16L1 18C1 19 1 19 2 19M1 9 1 11C1 12 1 12 2 12L4 12C5 12 5 12 5 11L5 9C5 8 5 8 4 8L2 8C1 8 1 8 1 9M15 16 15 18C15 19 15 19 16 19L18 19C19 19 19 19 19 18L19 16C19 15 19 15 18 15L16 15C15 15 15 15 15 16M8 16 8 18C8 19 8 19 9 19L11 19C12 19 12 19 12 18L12 16C12 15 12 15 11 15L9 15C8 15 8 15 8 16M8 9 8 11C8 12 8 12 9 12L11 12C12 12 12 12 12 11L12 9C12 8 12 8 11 8L9 8C8 8 8 8 8 9M15 9 15 11C15 12 15 12 16 12L18 12C19 12 19 12 19 11L19 9C19 8 19 8 18 8L16 8C15 8 15 8 15 9" />`,
        annotator: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M3 17 4 12C5 12 7 13 8 15L3 17M4 12 11 2C12 2 14 3 15 5L8 15M3 19C5 19 5 19 8 19 11 19 11 18 13 18 15 18 15 19 19 19M12 1C13 1 15 2 16 4" />`,
        dashboard: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M1 5A1 1 0 009 5 1 1 0 001 5M5 1 5 5 9 5M1 15 6 15M1 18 8 18M13 9C13 10 13 10 14 10 15 10 15 10 15 9L15 6C15 5 15 5 14 5 13 5 13 5 13 6 13 6 13 8 13 9M17 9C17 10 17 10 18 10 19 10 19 10 19 9L19 4C19 3 19 3 18 3 17 3 17 3 17 4L17 9M9 12 12 18 14 15 17 16 19 13M1 12 4 12" />`,
        chartHeatmap: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M2 3 2 17C2 18 2 18 3 18L17 18C18 18 18 18 18 17L18 3C18 2 18 2 17 2L3 2C2 2 2 2 2 3M10 2 10 18M2 10 18 10M6 2 6 18M14 2 14 18M2 6 18 6M2 14 18 14"/><rect fill="${props.stroke}" stroke="none" x="2" y="6" height="4" width="4" style="opacity:0.5" /><rect fill="${props.stroke}" stroke="none" x="6" y="10" height="4" width="4" style="opacity:0.5" /><rect fill="${props.stroke}" stroke="none" x="6" y="14" height="4" width="4" style="opacity:0.5" /><rect fill="${props.stroke}" stroke="none" x="14" y="2" height="4" width="4" style="opacity:0.5" />`,
        chartTable: `<path fill="none" stroke="${props.stroke}" stroke-width="${props.strokeWidth}" stroke-linecap="round" d="M2 3 2 17C2 18 2 18 3 18L17 18C18 18 18 18 18 17L18 3C18 2 18 2 17 2L3 2C2 2 2 2 2 3M10 6 10 18M2 10 18 10M6 2M14 2M2 6 18 6M2 14 18 14M6 8 8 8M6 12 8 12M6 16 8 16M14 8 16 8M14 12 16 12M14 16 16 16" />`
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

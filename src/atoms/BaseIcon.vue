<script setup>
import { computed, useSlots } from 'vue';
import { XMLNS } from '../lib';

const props = defineProps({
    name: String,
    size: {
        type: [Number, String],
        default: 24,
    },
    stroke: {
        type: String,
        default: '#CCCCCC',
    },
    strokeWidth: {
        type: Number,
        default: 1.5,
    },
    isSpin: {
        type: Boolean,
        default: false,
    },
    spinDuration: {
        type: String,
        default: '1s',
    },
});

const viewBox = computed(() => {
    // Exceptions
    if (props.name === 'numbers') {
        return '0 0 20 21';
    }
    return '0 0 20 20';
});

const spinD = computed(() => props.spinDuration);

const sl_none = 'stroke-linecap="round" stroke-linejoin="round"';
const slr = 'stroke-linecap="round"';
const sljr = 'stroke-linejoin="round"';
const swn = 'stroke-width="none"';
const s_sw = computed(
    () => `stroke="${props.stroke}" stroke-width="${props.strokeWidith}"`,
);
const fs = computed(() => `fill="${props.stroke}"`);
const fn = 'fill="none"';
const sn = 'stroke="none"';
const s = computed(() => `stroke="${props.stroke}"`);
const op = (o) => `style="opacity:${o}"`;

function getIconPath(name, { stroke, strokeWidth }) {
    const map = {
        annotation: `<path d="M1 18M10 17A1 1 0 0010 19 1 1 0 0010 17M1 18 7 18M13 18 19 18M4 1 16 1 16 10 12 10 10 14M7 4 10 4M7 7 13 7M4 1 4 10 8 10 10 14" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        annotator: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 19 3 12C3 14 3 15 5 15 5 17 7 17 8 17L1 19M3 12 14 1C15 0 16 1 16 1L19 4C20 5 19 6 19 6L8 17M5 15 15 5M1.667 16.667 3.333 18.333M12.501 2.501 17.5 7.5" /><path d="M15 5 5 15C5 17 7 17 8 17L17.5 7.5 15 5" ${sn} ${fs.value} ${op(0.3)}/>`,
        annotatorDisabled: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 19 3 12C3 14 3 15 5 15 5 17 7 17 8 17L1 19M3 12 14 1C15 0 16 1 16 1L19 4C20 5 19 6 19 6L8 17M5 15 15 5M1.667 16.667 3.333 18.333M12.501 2.501 17.5 7.5M2 2 18 18" /><path d="M15 5 5 15C5 17 7 17 8 17L17.5 7.5 15 5" ${sn} ${fs.value} ${op(0.3)}/>`,
        chart3dBar: `<path ${fn} ${s_sw.value} d="M10 1 6 3 6 17 10 19 14 17 14 3 10 1M6 3 10 5 14 3M10 5 10 19" ${sl_none}/><path ${fs.value} ${sn} ${op(0.3)} d="M6 10 10 12 14 10 14 17 10 19 6 17 6 10"/>`,
        chartAgePyramid: `<path ${fn} ${s_sw.value} ${sl_none} d="M2 15 2 17 9 17 9 15 2 15M11 15 11 17 18 17 18 15 11 15M9 13 3 13 3 11 9 11 9 13M11 11 11 13 17 13 17 11 11 11M9 9 4 9 4 7 9 7 9 9M11 7 11 9 16 9 16 7 11 7M9 5 6 5 6 3 9 3 9 5M11 3 11 5 14 5 14 3 11 3" />`,
        chartBar: `<path ${fn} ${s_sw.value} ${slr} d="M2 12 2 18C2 19 2 19 3 19L5 19C6 19 6 19 6 18L6 12C6 11 6 11 5 11L3 11C2 11 2 11 2 12M8 7 8 18C8 19 8 19 9 19L11 19C12 19 12 19 12 18L12 7C12 6 12 6 11 6L9 6C8 6 8 6 8 7M14 2 14 18C14 19 14 19 15 19L17 19C18 19 18 19 18 18L18 2C18 1 18 1 17 1L15 1C14 1 14 1 14 2"/>`,
        chartCandlestick: `<path ${fn} ${s_sw.value} ${slr} d="M2 9 2 11C2 12 3 12 3 12L5 12C6 12 6 11 6 11L6 9C6 8 5 8 5 8L3 8C2 8 2 9 2 9M8 8 8 12C8 12 8 13 9 13L11 13C12 13 12 12 12 12L12 8C12 7 11 7 11 7L9 7C8 7 8 8 8 8M14 9 14 14C14 15 15 15 15 15L17 15C18 15 18 14 18 14L18 9C18 9 18 8 17 8L15 8C14 8 14 9 14 9M4 8 4 5M3 5 5 5M10 13 10 16M9 16 11 16M16 8 16 2M15 2 17 2M10 7 10 4M9 4 11 4M4 12 4 18M3 18 5 18M16 15 16 18M15 18 17 18" />`,
        chartChestnut: `<path ${fn} ${s_sw.value} ${slr} d="M4 3A1 1 0 004 9 1 1 0 004 3M4 12A1 1 0 004 17 1 1 0 004 12M9 4 19 4M9 7 17 7M9 10 15 10M9 13 13 13M9 16 11 16" />`,
        chartDonut: `<path ${fn} ${s_sw.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 001 10M6 10A1 1 0 0014 10 1 1 0 006 10M1 10 6 10M10 14 10 19M14 10" /><path ${sn} ${swn} ${fs.value} ${slr} d="M1 10 6 10C6 12 8 14 10 14L10 19C6 19 1 16 1 10" ${op(0.3)} />`,
        chartNestedDonuts: `<path ${fn} ${s_sw.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 001 10M4 10A1 1 0 0016 10 1 1 0 004 10M1 10 4 10"/><path ${fn} ${s.value} stroke-width="${strokeWidth / 2}" ${slr} d="M10 16 10 19M7 10A1 1 0 0013 10 1 1 0 007 10"/><path ${op(0.3)} ${fs.value} ${swn} ${slr} d="M7 10 10 10 10 13C8 13 7 11 7 10"/><path ${op(0.3)} ${fs.value} ${swn} ${slr} d="M1 10 4 10C4 14 7 16 10 16L10 19C5 19 1 15 1 10"/>`,
        chartDonutEvolution: `<path ${fn} ${s_sw.value} ${slr} d="M1 1 1 18C1 19 1 19 2 19L19 19M3 8A1 1 0 007 8 1 1 0 003 8M8 14A1 1 0 0012 14 1 1 0 008 14M14 4A1 1 0 0018 4 1 1 0 0014 4M7 10 9 12M11 12 15 6" />`,
        chartGauge: `<path ${fn} ${s_sw.value} ${slr} d="M19 13A1 1 0 001 13" ${op(0.3)} /><path ${fn} ${s_sw.value} ${slr} d="M9 15A1 1 0 0011 15 1 1 0 009 15M10 14 10 8M10 4C6 4 1 7 1 13" />`,
        chartHeatmap: `<path ${fn} ${s_sw.value} ${slr} d="M2 3 2 17C2 18 2 18 3 18L17 18C18 18 18 18 18 17L18 3C18 2 18 2 17 2L3 2C2 2 2 2 2 3M10 2 10 18M2 10 18 10M6 2 6 18M14 2 14 18M2 6 18 6M2 14 18 14"/><rect ${fs.value} ${sn} x="2" y="6" height="4" width="4" ${op(0.5)} /><rect ${fs.value} ${sn} x="6" y="10" height="4" width="4" ${op(0.5)} /><rect ${fs.value} ${sn} x="6" y="14" height="4" width="4" ${op(0.5)} /><rect ${fs.value} ${sn} x="14" y="2" height="4" width="4" ${op(0.5)} />`,
        chartLine: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 1 1 19 19 19M4 13C5 16 6 16 6 16 9 16 7 7 10 7 11 7 13 12 13 12 14 14 16 14 17 3" />`,
        chartMoodRadar: `<path ${fn} ${s_sw.value} ${sl_none} d="M10 4 4 9 6 16 14 16 16 9 10 4M9 2A1 1 0 0011 2 1 1 0 009 2M1 8A1 1 0 003 8 1 1 0 001 8M3 18A1 1 0 005 17 1 1 0 003 18M15 18A1 1 0 0017 17 1 1 0 0015 18M17 8A1 1 0 0019 8 1 1 0 0017 8" /><path ${sn} ${swn} ${fs.value} ${sl_none} d="M10 7 13 10 13 14 8 13 7 9 10 7" ${op(0.3)} />`,
        chartOnion: `<path ${fn} ${s_sw.value} ${sl_none} d="M10 1C15 1 19 5 19 10 19 15 15 19 10 19 6 19 1 15 1 10M10 4C13 4 16 6 16 10 16 14 13 16 10 16 7 16 4 14 4 10M10 7C11 7 13 8 13 10 13 12 11 13 10 13 9 13 7 12 7 10" ${op(0.3)} /><path ${fn} ${s_sw.value} ${sl_none} d="M10 1C15 1 19 5 19 10 19 15 15 19 10 19M10 4C13 4 16 6 16 10 16 14 13 16 10 16 7 16 4 14 4 10M10 7C11 7 13 8 13 10" />`,
        chartQuadrant: `<path ${fn} ${s_sw.value} ${slr} d="M10 1 10 19M1 10 19 10" /><circle ${sn} ${fs.value} cx="3" cy="14" r="1"/><circle ${sn} ${fs.value} cx="5" cy="6" r="1"/><circle ${sn} ${fs.value} cx="14" cy="17" r="1"/><circle ${sn} ${fs.value} cx="17" cy="14" r="1"/><circle ${sn} ${fs.value} cx="15" cy="4" r="1"/>`,
        chartRadar: `<path ${fn} ${s_sw.value} ${slr} d="M2 6 2 14 10 19 18 14 18 6 10 1 2 6" /><path ${op(0.3)} ${fs.value} ${sn} stroke-width="0" ${slr} d="M4 7 10 5 18 6 12 11 10 16 6 11 4 7" /><path ${s.value} stroke-width="${strokeWidth / 3}" ${sl_none} ${fn} d="M4 7 10 5 18 6 12 11 10 16 6 11 4 7" />`,
        chartRelationCircle: `<path ${fn} ${s_sw.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 001 10M1 10C7 11 9 13 10 19M10 19C10 11 8 7 6 2M10 19C10 11 12 7 14 2M10 19C11 13 12 11 19 10" />`,
        chartRings: `<path ${fn} ${s_sw.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 14A1 1 0 0015 14 1 1 0 005 14M8 17A1 1 0 0012 17 1 1 0 008 17" />`,
        chartScatter: `<path ${fn} ${s_sw.value} ${slr} d="M1 1 1 18C1 19 1 19 2 19L19 19" /><circle ${sn} ${fs.value} cx="5" cy="15" r="1"/><circle ${sn} ${fs.value} cx="6" cy="12" r="1" /><circle ${sn} ${fs.value} cx="8" cy="15" r="1"/><circle ${sn} ${fs.value} cx="10" cy="8" r="1"/><circle ${sn} ${fs.value} cx="12" cy="10" r="1"/><circle ${sn} ${fs.value} cx="14" cy="6" r="1"/><circle ${sn} ${fs.value} cx="16" cy="4" r="1"/><circle ${sn} ${fs.value} cx="11" cy="14" r="1"/>`,
        chartSparkHistogram: `<path ${fn} ${s_sw.value} ${slr} d="M2 9 2 11C2 12 3 12 3 12L5 12C6 12 6 11 6 11L6 9C6 8 5 8 5 8L3 8C2 8 2 9 2 9M8 8 8 12C8 12 8 13 9 13L11 13C12 13 12 12 12 12L12 8C12 7 11 7 11 7L9 7C8 7 8 8 8 8M14 9 14 11C14 12 15 12 15 12L17 12C18 12 18 11 18 11L18 9C18 9 18 8 17 8L15 8C14 8 14 9 14 9" />`,
        chartSparkStackbar: `<path ${fs.value} ${sn} d="M12 8 17 8C19 8 19 12 17 12L12 12C14 12 14 8 12 8" ${op(0.3)} /><path ${fs.value} ${sn} d="M3 8 7 8C9 8 9 12 7 12L3 12C1 12 1 8 3 8" ${op(1)} /><path ${fs.value} ${sn} d="M7 8 12 8C14 8 14 12 12 12L7 12C9 12 9 8 7 8" ${op(0.5)} /><path ${fn} ${s.value} stroke-width="${strokeWidth / 3}" ${slr} d="M3 8 17 8C19 8 19 12 17 12L3 12C1 12 1 8 3 8" />`,
        chartTable: `<path ${fn} ${s_sw.value} ${slr} d="M2 3 2 17C2 18 2 18 3 18L17 18C18 18 18 18 18 17L18 3C18 2 18 2 17 2L3 2C2 2 2 2 2 3M10 6 10 18M2 10 18 10M6 2M14 2M2 6 18 6M2 14 18 14M6 8 8 8M6 12 8 12M6 16 8 16M14 8 16 8M14 12 16 12M14 16 16 16" />`,
        chartThermometer: `<path ${fn} ${s_sw.value} ${slr} d="M13 4A1 1 0 007 4L7 16A1 1 0 0013 16L13 4M7 15 8 15M7 12 8 12M7 9 8 9M7 6 8 6M12 15 13 15M12 12 13 12M12 9 13 9M12 6 13 6" /><path ${s_sw.value} ${op(0.6)} d="M10 17 10 12" ${slr} /><path ${slr} ${s_sw.value} d="M10 17 10 9" ${op(0.3)} /><path ${slr} ${s_sw.value} opacity="0.3" d="M10 17 10 6" /><path ${slr} ${s_sw.value} ${op(0.1)} d="M10 17 10 3" />`,
        chartTiremarks: `<path ${fn} ${s_sw.value} ${slr} d="M1 8 1 12M3 8 3 12M5 8 5 12M7 8 7 12M9 8 9 12M11 8 11 12M13 8 13 12" /><path ${fn} ${s_sw.value} ${slr} d="M1 8 1 12M3 8 3 12M5 8 5 12M7 8 7 12M9 8 9 12M11 8 11 12M13 8 13 12M15 8 15 12M17 8 17 12M19 8 19 12" ${op(0.4)} />`,
        chartVerticalBar: `<path ${fn} ${s_sw.value} ${slr} d="M1 3 1 5C1 6 1 6 2 6L9 6C10 6 10 6 10 5L10 3C10 2 10 2 9 2L2 2C1 2 1 2 1 3M1 9 1 11C1 12 1 12 2 12L13 12C14 12 14 12 14 11L14 9C14 8 14 8 13 8L2 8C1 8 1 8 1 9M1 15 1 17C1 18 1 18 2 18L17 18C18 18 18 18 18 17L18 15C18 14 18 14 17 14L2 14C1 14 1 14 1 15" />`,
        chartWaffle: `<path ${fn} ${s_sw.value} ${slr} d="M1 2 1 4C1 5 1 5 2 5L4 5C5 5 5 5 5 4L5 2C5 1 5 1 4 1L2 1C1 1 1 1 1 2M18 1 16 1C15 1 15 1 15 2L15 4C15 5 15 5 16 5L18 5C19 5 19 5 19 4L19 2C19 1 19 1 18 1M8 2 8 4C8 5 8 5 9 5L11 5C12 5 12 5 12 4L12 2C12 1 12 1 11 1L9 1C8 1 8 1 8 2M2 19 4 19C5 19 5 19 5 18L5 16C5 15 5 15 4 15L2 15C1 15 1 15 1 16L1 18C1 19 1 19 2 19M1 9 1 11C1 12 1 12 2 12L4 12C5 12 5 12 5 11L5 9C5 8 5 8 4 8L2 8C1 8 1 8 1 9M15 16 15 18C15 19 15 19 16 19L18 19C19 19 19 19 19 18L19 16C19 15 19 15 18 15L16 15C15 15 15 15 15 16M8 16 8 18C8 19 8 19 9 19L11 19C12 19 12 19 12 18L12 16C12 15 12 15 11 15L9 15C8 15 8 15 8 16M8 9 8 11C8 12 8 12 9 12L11 12C12 12 12 12 12 11L12 9C12 8 12 8 11 8L9 8C8 8 8 8 8 9M15 9 15 11C15 12 15 12 16 12L18 12C19 12 19 12 19 11L19 9C19 8 19 8 18 8L16 8C15 8 15 8 15 9" />`,
        chartWheel: `<circle cx="10" cy="10" r="7" ${fn} ${s_sw.value} stroke-dasharray="16" ${slr}/><circle cx="10" cy="10" r="9" ${fn} ${s_sw.value} stroke-dasharray="2" ${slr} ${op(0.7)}/><circle cx="10" cy="10" r="1" ${fs.value} />`,
        close: `<path ${fn} stroke-width="${strokeWidth}" ${fn} ${s.value} ${slr} d="M4 4 16 16M4 16 16 4" />`,
        dashboard: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 5A1 1 0 009 5 1 1 0 001 5M5 1 5 5 9 5M1 15 6 15M1 18 8 18M13 9C13 10 13 10 14 10 15 10 15 10 15 9L15 6C15 5 15 5 14 5 13 5 13 5 13 6 13 6 13 8 13 9M17 9C17 10 17 10 18 10 19 10 19 10 19 9L19 4C19 3 19 3 18 3 17 3 17 3 17 4L17 9M9 12 12 18 14 15 17 16 19 13M1 12 4 12" />`,
        digit0: `<path ${op(0.3)} ${fs.value} ${sn} ${swn} d="M7 10 8 9 12 9 13 10 12 11 8 11 7 10"/><path ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M7 18 8 17 12 17 13 18 12 19 8 19 7 18M6 3 7 4 7 8 6 9 5 8 5 4 6 3M6 11 7 12 7 16 6 17 5 16 5 12 6 11M14 3 13 4 13 8 14 9 15 8 15 4 14 3M14 11 15 12 15 16 14 17 13 16 13 12 14 11" />`,
        digit1: `<path ${op(0.3)} ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M7 18 8 17 12 17 13 18 12 19 8 19 7 18M6 11 7 12 7 16 6 17 5 16 5 12 6 11M6 3 7 4 7 8 6 9 5 8 5 4 6 3M7 10 8 9 12 9 13 10 12 11 8 11 7 10"/><path ${fs.value} ${sn} ${swn} d="M14 3 13 4 13 8 14 9 15 8 15 4 14 3M14 11 15 12 15 16 14 17 13 16 13 12 14 11" />`,
        digit2: `<path ${op(0.3)} ${fs.value} ${sn} ${swn} d="M14 11 15 12 15 16 14 17 13 16 13 12 14 11M6 3 7 4 7 8 6 9 5 8 5 4 6 3"/><path ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M14 3 13 4 13 8 14 9 15 8 15 4 14 3M7 18 8 17 12 17 13 18 12 19 8 19 7 18M6 11 7 12 7 16 6 17 5 16 5 12 6 11M7 10 8 9 12 9 13 10 12 11 8 11 7 10" />`,
        digit3: `<path ${op(0.3)} ${fs.value} ${sn} ${swn} d="M6 11 7 12 7 16 6 17 5 16 5 12 6 11M6 3 7 4 7 8 6 9 5 8 5 4 6 3"/><path ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M14 3 13 4 13 8 14 9 15 8 15 4 14 3M14 11 15 12 15 16 14 17 13 16 13 12 14 11M7 18 8 17 12 17 13 18 12 19 8 19 7 18M7 10 8 9 12 9 13 10 12 11 8 11 7 10" />`,
        digit4: `<path ${op(0.3)} ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M7 18 8 17 12 17 13 18 12 19 8 19 7 18M6 11 7 12 7 16 6 17 5 16 5 12 6 11"/><path ${fs.value} ${sn} ${swn} d="M14 3 13 4 13 8 14 9 15 8 15 4 14 3M14 11 15 12 15 16 14 17 13 16 13 12 14 11M6 3 7 4 7 8 6 9 5 8 5 4 6 3M7 10 8 9 12 9 13 10 12 11 8 11 7 10" />`,
        digit5: `<path ${op(0.3)} ${fs.value} ${sn} ${swn} d="M14 3 13 4 13 8 14 9 15 8 15 4 14 3M6 11 7 12 7 16 6 17 5 16 5 12 6 11"/><path ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M14 11 15 12 15 16 14 17 13 16 13 12 14 11M7 18 8 17 12 17 13 18 12 19 8 19 7 18M6 3 7 4 7 8 6 9 5 8 5 4 6 3M7 10 8 9 12 9 13 10 12 11 8 11 7 10" />`,
        digit6: `<path ${op(0.3)} ${fs.value} ${sn} ${swn} d="M 14 3 L 13 4 L 13 8 L 14 9 L 15 8 L 15 4 L 14 3 "/><path ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M14 11 15 12 15 16 14 17 13 16 13 12 14 11M7 18 8 17 12 17 13 18 12 19 8 19 7 18M6 11 7 12 7 16 6 17 5 16 5 12 6 11M6 3 7 4 7 8 6 9 5 8 5 4 6 3M7 10 8 9 12 9 13 10 12 11 8 11 7 10" />`,
        digit7: `<path ${op(0.3)} ${fs.value} ${sn} ${swn} d="M7 18 8 17 12 17 13 18 12 19 8 19 7 18M6 11 7 12 7 16 6 17 5 16 5 12 6 11M6 3 7 4 7 8 6 9 5 8 5 4 6 3M7 10 8 9 12 9 13 10 12 11 8 11 7 10"/><path ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M14 3 13 4 13 8 14 9 15 8 15 4 14 3M14 11 15 12 15 16 14 17 13 16 13 12 14 11" />`,
        digit8: `<path ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M7 10 8 9 12 9 13 10 12 11 8 11 7 10M7 18 8 17 12 17 13 18 12 19 8 19 7 18M6 3 7 4 7 8 6 9 5 8 5 4 6 3M6 11 7 12 7 16 6 17 5 16 5 12 6 11M14 3 13 4 13 8 14 9 15 8 15 4 14 3M14 11 15 12 15 16 14 17 13 16 13 12 14 11" />`,
        digit9: `<path ${op(0.3)} ${fs.value} ${sn} ${swn} d="M6 11 7 12 7 16 6 17 5 16 5 12 6 11"/><path ${fs.value} ${sn} ${swn} d="M8 1 7 2 8 3 12 3 13 2 12 1 8 1M14 3 13 4 13 8 14 9 15 8 15 4 14 3M14 11 15 12 15 16 14 17 13 16 13 12 14 11M7 18 8 17 12 17 13 18 12 19 8 19 7 18M6 3 7 4 7 8 6 9 5 8 5 4 6 3M7 10 8 9 12 9 13 10 12 11 8 11 7 10" />`,
        excel: `<path stroke-width="${strokeWidth}" ${fn} ${s.value} ${sljr} d="M4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L16 19C18 19 19 18 19 16L19 6C15 6 14 5 14 1ZM14 8C15 8 16 9 16 10L16 14C16 15 15 16 14 16L6 16C5 16 4 15 4 14L4 10C4 9 5 8 6 8Z"/><line ${s_sw.value} x1="9" x2="9" y1="8" y2="16" /><line ${s_sw.value} x1="4" x2="16" y1="12" y2="12" />`,
        image: `<path stroke-width="${strokeWidth}" ${fn} ${s.value} ${slr} d="M4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L16 19C18 19 19 18 19 16L19 6C15 6 14 5 14 1ZM1 16C3.3333 13.6667 3 10 8 12M7 14C8 13 9 5 19 11"/><circle r="1" cx="6" cy="5" ${sn} ${fs.value}/>`,
        labelClose: `<path ${fn} ${s_sw.value} ${slr} d="M2 8C1 9 1 11 2 12L5 16C6 17 6 17 7 17L17 17C19 17 19 15 19 15L19 5C19 5 19 3 17 3L12 3M7 10 15 10M7 13 16 13M9 6 4 1M4 6 9 1" />`,
        labelOpen: `<path ${fn} ${s_sw.value} ${slr} d="M2 8C1 9 1 11 2 12L5 16C6 17 6 17 7 17L17 17C19 17 19 16 19 15L19 5C19 5 19 3 17 3L7 3C6 3 6 3 5 4L2 8M7 7 13 7M7 10 15 10M7 13 16 13" />`,
        menu: `<path stroke-width="${strokeWidth}" ${fn} ${s.value} ${slr} d="M2 10 18 10M2 5 18 5M2 15 18 15" />`,
        moodFlat: `<path ${fn} ${s_sw.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 13C8 11 12 11 15 13M5 7A1 1 0 008 7 1 1 0 005 7M12 7A1 1 0 0015 7 1 1 0 0012 7" />`,
        moodHappy: `<path ${fn} ${s_sw.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 11C6 18 14 18 15 11L5 11M5 7A1 1 0 008 7 1 1 0 005 7M12 7A1 1 0 0015 7 1 1 0 0012 7" />`,
        moodNeutral: `<path ${fn} ${s_sw.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 12C9 12 11 12 15 12M5 7A1 1 0 008 7 1 1 0 005 7M12 7A1 1 0 0015 7 1 1 0 0012 7" />`,
        moodSad: `<path ${fn} ${s_sw.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 14C6 9 14 9 15 14L5 14M5 7A1 1 0 008 7 1 1 0 005 7M12 7A1 1 0 0015 7 1 1 0 0012 7" />`,
        pdf: `<path stroke-width="${strokeWidth}" ${fn} ${s.value} ${sl_none} d="M4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L16 19C18 19 19 18 19 16L19 6C15 6 14 5 14 1ZM4 16 4 9 5 9Q7 9 7 11 7 13 5 13L4 13M9 16 9 9 9 9Q12 9 12 12L12 13Q12 16 9 16L9 16M14 16 14 9 16 9M14 12 16 12"/>`,
        csv: `<path ${fn} ${s_sw.value} ${sl_none} d="M4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L16 19C18 19 19 18 19 16L19 6C15 6 14 5 14 1ZM7 11C7 10 7 9 6 9L5 9C4 9 4 10 4 11L4 14C4 15 4 16 5 16L6 16C7 16 7 15 7 14M12 11C12 10 12 9 11 9L10 9C9 9 9 10 9 11 9 13 12 12 12 14 12 15 12 16 11 16L10 16C9 16 9 15 9 14M14 9 15 16 16 9" />`,
        screenshot: `<path ${fn} ${s_sw.value} ${slr} d="M1 4 1 3C1 2 2 1 3 1L4 1M16 1 17 1C18 1 19 2 19 3L19 4M1 16 1 17C1 18 2 19 3 19L4 19M16 19 17 19C18 19 19 18 19 17L19 16M8 10A1 1 0 0012 10 1 1 0 008 10M5 13 5 8C5 7 5 7 6 7L14 7C15 7 15 7 15 8L15 13C15 14 15 14 14 14L6 14C5 14 5 14 5 13M7 6 13 6" />`,
        skeleton: `<path ${fn} ${s_sw.value} ${slr} d="M3 14A1 1 0 003 18L7 18A1 1 0 007 14L3 14M3 8A1 1 0 003 12L7 12A1 1 0 007 8L3 8M3 2A1 1 0 003 6L4 6A1 1 0 004 2L3 2M12 10 12 16C12 17 13 18 14 18L17 18C18 18 19 17 19 16L19 10C19 9 18 8 17 8L14 8C13 8 12 9 12 10" stroke-dasharray="2" />`,
        smiley: `<path ${fn} ${s_sw.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 12C8 14 12 14 15 12M5 7A1 1 0 008 7 1 1 0 005 7M12 7A1 1 0 0015 7 1 1 0 0012 7" />`,
        sort: `<path stroke-width="${strokeWidth}" ${fn} ${s.value} ${slr} d="M1 15 5 18 9 15M5 5 5 18M15 15 15 2M11 5 15 2 19 5" />`,
        sortReverse: `<path stroke-width="${strokeWidth}" ${fn} ${s.value} ${slr} d="M1 8 5 5 9 8M5 5 5 18M15 15 15 2M11 12 15 15 19 12" />`,
        spin: `<path stroke-width="${strokeWidth}" ${fn} ${s.value} ${slr} d="M1 10A1 1 0 0019 10 1 1 0 004 10 1 1 0 0016 10 1 1 0 007 10 1 1 0 0013 10 1 1 0 0010 10M1 10Q1 5 5 2" />`,
        star: `<path ${fn} ${s_sw.value} ${sl_none} d="M1.333 8.2262 7.3093 7.3308 9.9598 1.9001 12.6581 7.3072 18.6421 8.1497 14.3335 12.3869 15.3813 18.3383 10.0201 15.55 4.6837 18.3856 5.6789 12.4251 1.334 8.225" />`,
        starFill: `<path ${fs.value} ${s_sw.value} ${sl_none} d="M1.333 8.2262 7.3093 7.3308 9.9598 1.9001 12.6581 7.3072 18.6421 8.1497 14.3335 12.3869 15.3813 18.3383 10.0201 15.55 4.6837 18.3856 5.6789 12.4251 1.334 8.225" />`,
        tableClose: `<path stroke-width="${strokeWidth}" ${slr} ${fn} ${s.value} d="M4 1 4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L7 19M4 1 16 1C18 1 19 2 19 4L19 14M18 19 14 16 10 19"/><line stroke-width="${strokeWidth}" ${s.value} x1="8" y1="1" x2="8" y2="19" ${slr} /><line stroke-width="${strokeWidth}" ${s.value} x1="1" y1="8" x2="19" y2="8" />`,
        tableOpen: `<path stroke-width="${strokeWidth}" ${fn} ${slr} ${s.value} d="M4 1 4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L7 19M4 1 16 1C18 1 19 2 19 4L19 14M18 16 14 19 10 16"/><line stroke-width="${strokeWidth}" ${s.value} x1="8" y1="1" x2="8" y2="19" ${slr} /><line stroke-width="${strokeWidth}" ${slr} ${s.value} x1="1" y1="8" x2="19" y2="8" />`,
        chartCluster: `<path ${fn} ${s_sw.value} d="M7 10A1 1 0 0013 10 1 1 0 007 10M10 7 10 4A1 1 0 0010 1 1 1 0 0010 4M7 10 4 10A1 1 0 001 10 1 1 0 004 10M10 13 10 16A1 1 0 0010 19 1 1 0 0010 16M13 10 16 10A1 1 0 0019 10 1 1 0 0016 10" />`,
        arrowRight: `<path ${fs.value} ${sn} ${swn} d="M18 10 3 1C6 7 6 13 3 19L18 10" ${sljr} />`,
        arrowTop: `<path ${fs.value} ${sn} ${swn} d="M10 2 1 17C7 14 13 14 19 17L10 2" ${sljr} />`,
        arrowLeft: `<path ${fs.value} ${sn} ${swn} d="M2 10 17 1C14 7 14 13 17 19L2 10" ${sljr} />`,
        arrowBottom: `<path ${fs.value} ${sn} ${swn} d="M10 18 1 3C7 6 13 6 19 3L10 18" ${sljr} />`,
        fullscreen: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 6 1 4C1 2 2 1 4 1L6 1M14 1 16 1C18 1 19 2 19 4L19 6M19 14 19 16C19 18 18 19 16 19L14 19M6 19 4 19C2 19 1 18 1 16L1 14M9 9 5 5M11 9 15 5M11 11 15 15M9 11 5 15M5 12 5 15 8 15M12 15 15 15 15 12M15 8 15 5 12 5M8 5 5 5 5 8" />`,
        exitFullscreen: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 6 1 4C1 2 2 1 4 1L6 1M14 1 16 1C18 1 19 2 19 4L19 6M19 14 19 16C19 18 18 19 16 19L14 19M6 19 4 19C2 19 1 18 1 16L1 14M8 8 4 4M12 8 16 4M12 12 16 16M8 12 4 16M5 12 8 12 8 15M12 15 12 12 15 12M15 8 12 8 12 5M8 5 8 8 5 8" />`,
        moodEmbarrassed: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 13C8 11 11 16 15 13M5 7A1 1 0 008 7 1 1 0 005 7M12 7A1 1 0 0015 7 1 1 0 0012 7" />`,
        moodSurprised: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 7A1 1 0 008 7 1 1 0 005 7M12 7A1 1 0 0015 7 1 1 0 0012 7M10 12A1 1 0 0010 15 1 1 0 0010 12" />`,
        moodWink: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 11C7 15 11 15 15 13M12 7A1 1 0 0015 7 1 1 0 0012 7M5 7 8 7" />`,
        moodLaughing: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 10C5 17 15 17 15 11L5 10M12 7A1 1 0 0012 7C13 6 14 7 15 7M5 6C6 6 7 5 8 7" />`,
        circleCancel: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 10A1 1 0 0019 10 1 1 0 001 10M6 6 14 14M14 6 6 14" />`,
        circleCheck: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 10A1 1 0 0019 10 1 1 0 001 10M5 10 9 14M15 7 9 14" />`,
        circleExclamation: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 10A1 1 0 0019 10 1 1 0 001 10M10 5 10 10M10 13A1 1 0 0010 15 1 1 0 0010 13" />`,
        circleQuestion: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 10A1 1 0 0019 10 1 1 0 001 10M10 5C14 5 14 10 10 10M10 13A1 1 0 0010 15 1 1 0 0010 13M7 7C7 6 8 5 10 5" />`,
        refresh: `<path ${fn} ${s_sw.value} ${sl_none} d="M2 10A1 1 0 0017 10C17 5 12 2 7 4L10 1M7 4 10 7" />`,
        chartSparkbar: `<path ${fn}  ${s_sw.value} ${slr} d="M 2 5 L 18 5 M 2 10 L 18 10 M 2 15 L 18 15" ${op(0.3)} /><path ${fn}  ${s_sw.value} ${slr} d="M2 5 15 5M2 10 11 10M2 15 7 15" />`,
        chartSparkline: `<path ${fn} ${s_sw.value} ${slr} d="M 2.033 13.067 C 1.962 10.937 2.246 9.234 3.453 9.127 C 5.192 9.127 4.233 16.048 6.47 16.013 C 8.741 16.013 7.534 8.63 9.735 8.559 C 12.078 8.559 10.942 12.357 12.965 12.357 C 15.059 12.286 14.278 4.016 18 4" />`,
        legend: `<path ${fn} ${s_sw.value} ${slr} d="M3 2 5 2C5 2 6 2 6 3L6 5C6 6 5 6 5 6L3 6C3 6 2 6 2 5L2 3C2 2 3 2 3 2M8 4C8 3 9 3 9 3L17 3C17 3 18 3 18 4 18 5 17 5 17 5L9 5C9 5 8 5 8 4M3 8 5 8C5 8 6 8 6 9L6 11C6 12 5 12 5 12L3 12C3 12 2 12 2 11L2 9C2 8 3 8 3 8M8 10C8 9 9 9 9 9L17 9C17 9 18 9 18 10 18 11 17 11 17 11L9 11C9 11 8 11 8 10M3 14 5 14C5 14 6 14 6 15L6 17C6 18 5 18 5 18L3 18C3 18 2 18 2 17L2 15C2 14 3 14 3 14M8 16C8 15 9 15 9 15L17 15C17 15 18 15 18 16 18 17 17 17 17 17L9 17C9 17 8 17 8 16" />`,
        chartGalaxy: `<path ${fn} ${s_sw.value} ${slr} d="M7 11A1 1 0 0011 11M14 11A1 1 0 007 11M3 11A1 1 0 0014 11M18 11A1 1 0 003 11M16.4 16C17 15 18 13 18 11" />`,
        zoomPlus: `<path ${fn} ${s_sw.value} ${slr} d="M9 1A1 1 0 009 17 1 1 0 009 1M14.65 14.65 18 18M9 5 9 13M5 9 13 9"/>`,
        zoomMinus: `<path ${fn} ${s_sw.value} ${slr} d="M9 1A1 1 0 009 17 1 1 0 009 1M14.65 14.65 18 18M5 9 13 9"/>`,
        chartTreemap: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 1 19 1 19 19 1 19ZM10 1 10 19M1 13 10 13M10 10 19 10M15 10 15 19" />`,
        kpi: `<path ${fn} ${s_sw.value} ${sl_none} d="M2 5 2 15M6 5 2 10 6 15M8 15 8 5 10 5M10 10A1 1 0 0010 5M10 10 8 10M18 5 14 5M14 15 18 15M16 5 16 15M1 3 1 2C1 1 2 1 2 1L18 1C18 1 19 1 19 2L19 3M1 17 1 18C1 19 2 19 2 19L18 19C19 19 19 18 19 18L19 17"/>`,
        kpiBox: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 3C1 2 2 1 3 1L17 1C18 1 19 2 19 3L19 17C19 18 18 19 17 19L3 19C2 19 1 18 1 17L1 3M4 13 9 13M16 13 11 13M4 16 16 16M4 4 4 10M7 4 4 7 7 10M9 10 9 4 11 4M11 7A1 1 0 0011 4M11 7 9 7M16 10 14 10M14 4 16 4M15 4 15 10"/>`,
        tooltip: `<path ${fn} ${s_sw.value} ${sl_none} d="M8 15 10 19 12 15 18 15C18 15 19 15 19 14L19 2C19 1 18 1 18 1L2 1C2 1 1 1 1 2L1 14C1 15 2 15 2 15L8 15M4 6 11 6M4 10 7 10M9 10 16 10"/>`,
        tooltipDisabled: `<path ${fn} ${s_sw.value} ${sl_none} d="M8 15 10 19 12 15 18 15C18 15 19 15 19 14L19 2C19 1 18 1 18 1L2 1C2 1 1 1 1 2L1 14C1 15 2 15 2 15L8 15M7 5 13 11M7 11 13 5"/>`,
        vueDataUi: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 2 10 19M1 2 4 2 10 13 13 13M10 19 13 13"/><path ${fn} ${s_sw.value} ${sl_none} d="M10 13 14.974 3.451 19 13 16 13 14.734 9.553 13 13 10 13"/>`,
        ratio: `<path ${fn} ${s_sw.value} ${slr} d="M2 10 18 10M8 1 12 7M12 1 8 7M8 13 10 16M12 13 8 19"/>`,
        func: `<path ${fn} ${s_sw.value} d="M17 7 13 13M13 7 17 13M12 5C12 5 11 5 11 6L11 14C11 15 12 15 12 15M18 5C19 5 19 6 19 6L19 14C19 15 18 15 18 15M1 19C2 19 3 19 4 17L6 3C6 2 7 1 8 1L10 1M5 10 7 10" ${sl_none} />`,
        settings: `<path ${fn} ${s_sw.value} ${slr} d="M8 7A1 1 0 008 17 1 1 0 008 7M8 6 8 7M2 12 3 12M13 12 14 12M8 17 8 18M3.6 7.6 4.4 8.4M3.6 16.4 4.4 15.5M12.4 7.6 11.5 8.4M11.6 15.5 12.4 16.4M8 11A1 1 0 008 13 1 1 0 008 11M16 2A1 1 0 0016 6 1 1 0 0016 2M13 4 14 4M16 6 16 7M18 4 19 4M16 1 16 2"/>`,
        trendUp: `<path ${s_sw.value} ${slr} ${fn} d="M6 3 6 7M4 5 8 5M11 7 16 3M12 2A1 1 0 0012 4 1 1 0 0012 2M15 6A1 1 0 0015 8 1 1 0 0015 6M10 18 10 10M7 13 10 10 13 13" />`,
        trendDown: `<path ${s_sw.value} ${slr} ${fn} d="M4 5M4 5 8 5M11 7 16 3M12 2A1 1 0 0012 4 1 1 0 0012 2M15 6A1 1 0 0015 8 1 1 0 0015 6M10 18 10 10M7 15 10 18 13 15" />`,
        clipBoard: `<path ${fn} ${s_sw.value} ${sl_none} d="M6 2C6 1 7 1 7 1L13 1C14 1 14 2 14 2 14 2 14 3 13 3L7 3C7 3 6 3 6 2M6 2 3 2C2 2 1 3 1 4L1 17C1 18 2 19 3 19L17 19C18 19 19 18 19 17L19 4C19 3 18 2 17 2L14 2M5 7 9 7M5 11 9 11M11 11 15 11M5 15 15 15M11 7 15 7"/>`,
        clipboardLine: `<path ${fn} ${s_sw.value} ${fn} ${sl_none} d="M6 2C6 1 7 1 7 1L13 1C14 1 14 2 14 2 14 2 14 3 13 3L7 3C7 3 6 3 6 2M6 2 3 2C2 2 1 3 1 4L1 17C1 18 2 19 3 19L17 19C18 19 19 18 19 17L19 4C19 3 18 2 17 2L14 2M5 15 8 10 12 12 15 6"/>`,
        clipboardDonut: `<path ${fn} ${s_sw.value} ${fn} ${sl_none} d="M6 2C6 1 7 1 7 1L13 1C14 1 14 2 14 2 14 2 14 3 13 3L7 3C7 3 6 3 6 2M6 2 3 2C2 2 1 3 1 4L1 17C1 18 2 19 3 19L17 19C18 19 19 18 19 17L19 4C19 3 18 2 17 2L14 2M10 5A1 1 0 0010 16 1 1 0 0010 5M10 8A1 1 0 0010 13 1 1 0 0010 8M10 5 10 8M5.1 13 7.7 11.6"/>`,
        clipboardBar: `<path ${fn} ${s_sw.value} ${fn} ${sl_none} d="M6 2C6 1 7 1 7 1L13 1C14 1 14 2 14 2 14 2 14 3 13 3L7 3C7 3 6 3 6 2M6 2 3 2C2 2 1 3 1 4L1 17C1 18 2 19 3 19L17 19C18 19 19 18 19 17L19 4C19 3 18 2 17 2L14 2M5 15 5 11 10 11 10 15 5 15M10 11 10 7 15 7 15 15 10 15"/>`,
        clipboardVariable: `<path ${fn} ${s_sw.value} ${fn} ${sl_none} d="M6 2C6 1 7 1 7 1L13 1C14 1 14 2 14 2 14 2 14 3 13 3L7 3C7 3 6 3 6 2M6 2 3 2C2 2 1 3 1 4L1 17C1 18 2 19 3 19L17 19C18 19 19 18 19 17L19 4C19 3 18 2 17 2L14 2M5 8 9 13M9 8 5 13M11 8 13.1 10.3M15 8 11 13"/>`,
        triangle: `<path ${s_sw.value} ${fn} ${sl_none} d="M10 3 1 17 19 17 10 3"/>`,
        triangleFill: `<path ${s.value} ${fs.value} stroke-width="${strokeWidth}" ${sl_none} d="M10 3 1 17 19 17 10 3"/>`,
        square: `<path ${s_sw.value} ${fn} ${sl_none} d="M2 2 2 18 18 18 18 2 2 2"/>`,
        squareFill: `<path ${fs.value} ${s_sw.value}${sl_none} d="M2 2 2 18 18 18 18 2 2 2"/>`,
        diamond: `<path ${s_sw.value} ${fn} ${sl_none} d="M10 1 1 10 10 19 19 10 10 1"/>`,
        diamondFill: `<path ${fs.value}  ${s_sw.value} ${sl_none} d="M10 1 1 10 10 19 19 10 10 1"/>`,
        pentagon: `<path ${s_sw.value} ${fn} ${sl_none} d="M10 1 1 9 5 19 16 19 19 9Z"/>`,
        pentagonFill: `<path ${fs.value} ${s_sw.value} ${sl_none} d="M10 1 1 9 5 19 16 19 19 9Z"/>`,
        hexagon: `<path ${s_sw.value} ${fn} ${sl_none} d="M10 1 2 6 2 14 10 19 18 14 18 6Z"/>`,
        hexagonFill: `<path ${fs.value}  ${s_sw.value} ${sl_none} d="M10 1 2 6 2 14 10 19 18 14 18 6Z"/>`,
        circle: `<path ${s_sw.value} ${fn} ${sl_none} d="M10 1A1 1 0 0010 19 1 1 0 0010 1"/>`,
        circleFill: `<path ${s_sw.value} ${fs.value} ${sl_none} d="M10 1A1 1 0 0010 19 1 1 0 0010 1"/>`,
        numbers: `<path ${fn} ${s.value} stroke-width="${strokeWidth / 2}" ${fn} ${sl_none} d="M2 3 4 1 4 6M8 3C8 2 9 1 10 1 11 1 12 2 12 3 12 5 8 3 8 6L12 6M15 1 18 1 16 3C17 3 18 3 18 4 18 6 16 6 15 6M4 13 4 8 2 11 6 11M12 8 8 8C8 11 12 9 12 11 12 12 11 13 10 13 9 13 8 12 8 11M18 11A1 1 0 0015 12 1 1 0 0018 11M15 11C15 8 17 8 18 8M2 15 6 15C5 18 2 17 2 20M8 16C8 15 9 15 9 15L11 15C12 15 12 16 12 16 12 16 12 17 11 17L9 17C9 17 8 17 8 16M9 17C9 17 8 17 8 18L8 19C8 19 8 19 8 19 8 20 9 20 9 20L11 20C12 20 12 19 12 19L12 18C12 18 12 17 11 17M18 17A1 1 0 0015 16 1 1 0 0018 17M18 17C18 20 16 20 15 20"/>`,
        sigma: `<path ${fn} ${s_sw.value} ${fn} d="M16 5 18 2 2 2 9 10 2 18 18 18 16 15" ${sl_none}/>`,
        mu: `<path ${fn} ${s_sw.value} ${fn} d="M15 2C15 12 13 12 10 12 5 12 5 12 5 2M5 2 5 18M13.5 10.8C14 12 15 12 15 12" ${sl_none}/>`,
        lambda: `<path ${fn} ${s_sw.value} ${fn} d="M2 5C2 2 4 2 4 2 10 2 10 18 18 18M10 10 2 18" ${sl_none}/>`,
        people: `<path ${fn} ${s.value} stroke-width="${strokeWidth / 2}" ${fn} d="M5 1A1 1 0 005 9 1 1 0 005 1M15 1A1 1 0 0015 9 1 1 0 0015 1M5 11A1 1 0 005 19 1 1 0 005 11M15 11A1 1 0 0015 19 1 1 0 0015 11M3 4 3 4M7 4 7 4M3 6C4 7 6 7 7 6M13 4 13 4M17 4 17 4M13 6C14 7 16 7 17 6M3 14 3 14M7 14 7 14M3 16C4 17 6 17 7 16M13 14 13 14M17 14 17 14M13 16C14 17 16 17 17 16" ${sl_none}/>`,
        copy: `<path ${fn} ${s_sw.value} ${fn} d="M18 16C18 17 17 18 16 18L8 18C7 18 6 17 6 16L6 8C6 7 7 6 8 6L16 6C17 6 18 7 18 8L18 16M6 14 4 14C3 14 2 13 2 12L2 4C2 3 3 2 4 2L12 2C13 2 14 3 14 4L14 6" ${sl_none}/>`,
        accordion: `<path ${fn} ${s_sw.value} ${sl_none} d="M2 2 18 2 16 4 18 6 16 8 18 10 16 12 18 14 16 16 18 18 2 18 4 16 2 14 4 12 2 10 4 8 2 6 4 4 2 2"/><path ${sn} ${fs.value} ${op(0.3)} ${sl_none} d="M2 2 18 2 16 4 4 4Z" /><path ${sn} ${fs.value} ${op(0.3)} ${sl_none} d="M2 6 18 6 16 8 4 8Z" /><path ${sn} ${fs.value} ${op(0.3)} ${sl_none} d="M2 10 18 10 16 12 4 12Z" /><path ${sn} ${fs.value} ${op(0.3)} ${sl_none} d="M2 14 18 14 16 16 4 16Z" />`,
        cursor: `<path ${s_sw.value} ${fn} ${sl_none} d="M6 10A1 1 0 0014 10 1 1 0 006 10M1 10 6 10M14 10 19 10M10 1 10 6M10 14 10 19M10 8 10 12M8 10 12 10" />`,
        trend: `<path ${s_sw.value} ${fn} ${slr} stroke-kinejoin="round" d="M1 6 4 4 7 6M4 4 4 13M7 16C7 16 7 18 9 18 12 18 10 9 12 9 14 9 14 13 15 13 18 14 17.6667 5.6667 19 2"/>`,
        chartStripPlot: `<path ${s_sw.value} ${fn} d="M4 16A1 1 0 004 18 1 1 0 004 16M4 13A1 1 0 004 15 1 1 0 004 13M4 9A1 1 0 004 11 1 1 0 004 9M8 11A1 1 0 008 13 1 1 0 008 11M8 8A1 1 0 008 10 1 1 0 008 8M4 2A1 1 0 004 4 1 1 0 004 2M12 15A1 1 0 0012 17 1 1 0 0012 15M12 10A1 1 0 0012 12 1 1 0 0012 10M12 7A1 1 0 0012 9 1 1 0 0012 7M8 5A1 1 0 008 7 1 1 0 008 5M16 12A1 1 0 0016 14 1 1 0 0016 12M16 10A1 1 0 0016 12 1 1 0 0016 10M16 16A1 1 0 0016 18 1 1 0 0016 16" />`,
        chartDumbbell: `<path ${s_sw.value} ${slr} d="M3 2A1 1 0 003 4 1 1 0 003 2M10 2A1 1 0 0010 4 1 1 0 0010 2M4 3 9 3M5 9A1 1 0 005 11 1 1 0 005 9M17 9A1 1 0 0017 11 1 1 0 0017 9M6 10 16 10M8 16A1 1 0 008 18 1 1 0 008 16M15 16A1 1 0 0015 18 1 1 0 0015 16M9 17 14 17" />`,
        copyLeft: `<path ${s_sw.value} d="M10 2A1 1 0 0010 18 1 1 0 0010 2M10 14A1 1 0 0010 6C10 6 8 6 7 8M10 14C10 14 8 14 7 12" ${sl_none} ${fn}/>`,
        chartWordCloud: `<text x="10" y="10" ${fs.value} text-anchor="middle" font-size="4.5" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="5.5" y="6" ${fs.value} text-anchor="middle" font-size="2.5" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="15" y="6" ${fs.value} text-anchor="middle" font-size="2" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="5" y="13.5" ${fs.value} text-anchor="middle" font-size="2" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="14.5" y="14.4" ${fs.value} text-anchor="middle" font-size="2.5" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="10" y="3" ${fs.value} text-anchor="middle" font-size="1.8" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="10" y="17.5" ${fs.value} text-anchor="middle" font-size="2" font-family="Arial" dominant-baseline="middle">WORDS</text>`,
        chartWordCloudZh: `<text x="10" y="10" ${fs.value} text-anchor="middle" font-size="6" font-family="Arial" dominant-baseline="middle">词语</text><text x="5" y="5" ${fs.value} text-anchor="middle" font-size="3" font-family="Arial" dominant-baseline="middle">词语</text><text x="15" y="5" ${fs.value} text-anchor="middle" font-size="3" font-family="Arial" dominant-baseline="middle">词语</text><text x="10" y="5" ${fs.value} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="10" y="2" ${fs.value} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="2" y="8" ${fs.value} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="2" y="11.5" ${fs.value} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="18" y="8" ${fs.value} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="18" y="11.5" ${fs.value} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="5" y="14.5" ${fs.value} text-anchor="middle" font-size="3" font-family="Arial" dominant-baseline="middle">词语</text><text x="15" y="14.5" ${fs.value} text-anchor="middle" font-size="3" font-family="Arial" dominant-baseline="middle">词语</text><text x="10" y="14.5" ${fs.value} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="10" y="18" ${fs.value} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text>`,
        stack: `<path ${s_sw.value} ${sl_none} ${fn} d="M10 3 2 6 10 9 18 6 10 3M7 8 2 10 10 13 18 10 13 8M7 12 2 14 10 17 18 14 13 12"/>`,
        unstack: `<path ${s_sw.value} ${sl_none} ${fn} d="M10 3 2 6 10 9 18 6 10 3M7 8 2 10 10 13 18 10 13 8M7 12 2 14 10 17 18 14 13 12M2 2 18 18M18 2 2 18"/>`,
        window: `<path ${s_sw.value} ${sl_none} ${fn} d="M2 4 2 16C2 17 3 18 4 18L16 18C17 18 18 17 18 16L18 4C18 3 17 2 16 2L4 2C3 2 2 3 2 4M4 5 4 8C4 9 5 9 5 9L8 9C9 9 9 8 9 8L9 5C9 4 8 4 8 4L5 4C4 4 4 5 4 5M16 5 16 8C16 9 15 9 15 9L12 9C12 9 11 9 11 8L11 5C11 4 12 4 12 4L15 4C15 4 16 4 16 5M5 11C5 11 4 11 4 12L4 15C4 16 5 16 5 16L8 16C8 16 9 16 9 15L9 12C9 11 8 11 8 11L5 11M12 11C11 11 11 12 11 12L11 15C11 15 11 16 12 16L15 16C15 16 16 16 16 15L16 12C16 11 15 11 15 11L12 11M6 6" />`,
        chartFlow: `<path stroke="transparent" stroke-width="${strokeWidth}" ${sl_none} ${fs.value} d="M2 2 4 2 4 9 2 9 2 2M9 2 11 2 11 6 9 6 9 2M16 2 18 2 18 4 16 4 16 2M2 11 4 11 4 18 2 18 2 11M9 8 11 8 11 11 9 11 9 8M9 14 11 14 11 16 9 16 9 14M16 6 18 6 18 8 16 8 16 6M16 10 18 10 18 12 16 12 16 10M16 14 18 14 18 16 16 16 16 14M4 2 9 2 9 6 4 6 4 6 4 2M4 6 9 8 9 11 4 9 4 6M11 2 16 2 16 4 11 4 11 2M11 4 16 6 16 8 11 6 11 4M4 11 9 14 9 16 4 13 4 11M11 8 16 10 16 12 11 10 11 8M11 14 16 14 16 16 11 16 11 14"/>`,
        chartParallelCoordinatePlot: `<path ${s_sw.value} ${sl_none} ${fn} d="M2 2 2 18M10 2 10 18M18 2 18 18M2 4 10 3 18 3M2 10 10 6 18 8M2 16 10 16 18 12"/>`,
        pause: `<path ${fs.value} ${sn} strole-linecap="round" ${sljr} d="M3 4 3 16C3 17 4 18 5 18L6 18C7 18 8 17 8 16L8 4C8 3 7 2 6 2L5 2C4 2 3 3 3 4M12 4 12 16C12 17 13 18 14 18L15 18C16 18 17 17 17 16L17 4C17 3 16 2 15 2L14 2C13 2 12 3 12 4"/>`,
        play: `<path ${fs.value} stroke-width="${strokeWidth}" ${sl_none} ${fn} d="M3 4 3 16C3 17 4 18 5 18L6 18C7 18 18 13 18 11L18 10C18 8 7 2 6 2L5 2C4 2 3 3 3 4"/>`,
        stop: `<path ${fs.value} stroke-width="${strokeWidth}" ${sl_none} ${fn} d="M10 8 4 2 3 2 2 3 2 4 8 10 2 16 2 17 3 18 4 18 10 12 16 18 17 18 18 17 18 16 12 10 18 4 18 3 17 2 16 2 10 8"/>`,
        restart: `<path ${s_sw.value} ${sl_none} ${fn} d="M3 10A1 1 0 0017 10C17 6 14 3 10 3L10 2 7 4M5 10A1 1 0 0015 10C15 7 13 5 10 5L10 6 7 4M3 10 5 10"/>`,
        lap: `<path ${s_sw.value} ${sl_none} ${fn} d="M3 10A1 1 0 0017 10 1 1 0 003 10M8 2 12 2M5 3 6 4M15 3 14 4M10 7 10 10 13 13"/>`,
        carouselTable: `<path ${s_sw.value} ${sl_none} ${fn} d="M16 2 16 18M14 4 16 2 18 4M14 16 16 18 18 16M3 2 11 2C12 2 12 3 12 3L12 17C12 18 11 18 11 18L3 18C2 18 2 17 2 17L2 3C2 3 2 2 3 2M2 6 12 6M2 9 12 9M2 12 12 12M2 15 12 15M7 2 7 18M4 4 5 4M9 4 10 4"/>`,
        battery: `<path ${s_sw.value} ${sl_none} ${fn} d="M2 6 2 14C2 16 3 16 4 16L15 16C16 16 17 16 17 14L17 13C17 13 18 13 18 12L18 8C18 7 17 7 17 7L17 6C17 4 16 4 15 4L4 4C3 4 2 4 2 6"/><path ${fs.value} ${op(0.6)} ${sn} d="M4 7 4 13C4 14 5 14 5 14L11 14 11 6 5 6C5 6 4 6 4 7"/>`,
        chartStackbar: `<path ${s_sw.value} ${sl_none} ${fn} d="M8 18 12 18 12 8C12 7 11 7 11 7L9 7C9 7 8 7 8 8L8 18M2 18 6 18 6 12C6 11 5 11 5 11L3 11C3 11 2 11 2 12L2 18M14 18 18 18 18 3C18 2 17 2 17 2L15 2C15 2 14 2 14 3L14 18M2 14 6 14M8 11 12 11M14 7 18 7M14 12"/><path ${sn} ${op(0.3)} ${fs.value} d="M2 14 6 14 6 18 2 18 2 14" /><path ${sn} ${op(0.3)} ${fs.value} d="M8 11 12 11 12 18 8 18 8 11" /><path ${sn} ${op(0.3)} ${fs.value} d="M14 7 18 7 18 18 14 18 14 7" />`,
        starFace: `<path ${s.value} stroke-width="${strokeWidth} ${sl_none} ${fn} d="M1.333 8.2262 7.3093 7.3308 9.9598 1.9001 12.6581 7.3072 18.6421 8.1497 14.3335 12.3869 15.3813 18.3383 10.0201 15.55 4.6837 18.3856 5.6789 12.4251ZM6.989 9.999C7.62 8.9 8.638 9.246 8.964 10.019M10.999 10.019C11.671 8.941 12.607 9.287 13.015 10.04M7.499 12.022C8.732 14.95 12.101 13.871 12.497 11.999" />`,
        chartBullet: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 7 1 13 19 13 19 7 1 7"/><path ${fs.value} d="M1 9 12 9 12 11 1 11Z" ${sn} ${slr}/><path ${fs.value} d="M15 5 15 15 16 15 16 5Z" ${sn} ${slr}/>`,
        trash: `<path ${fn} ${s_sw.value} ${sl_none} d="M7 18 13 18C15 18 15 18 16 6L16 6 5 6 4 6C5 18 5 18 7 18M3 4 17 4M8 2 12 2M10 8 10 15M7 8 7.518 15.01M13 8 12.454 14.984" />`,
        palette: `<path ${fn} ${s_sw.value} ${slr} d="M10 2A1 1 0 0010 18C10 18 14 18 14 16 14 13 12 14 11 13 10 10 14 11 15 11 20 11 19 2 10 2"/><path ${sn} ${fs.value} d="M6 6A1 1 0 008 8 1 1 0 006 6" ${op(0.7)}/><path ${fs.value} ${sn} ${op(0.5)} d="M6 11A1 1 0 008 13 1 1 0 006 11"/><path ${fs.value} ${sn} ${op(1)} d="M11 5A1 1 0 0013 7 1 1 0 0011 5"/>`,
        colorPicker: `<path d="M2 16C2 17 3 18 4 18 5 18 6 16 9 16L16 8 12 4 4 11M4 11C4 14 2 15 2 16M16 8C17 9 19 7 18 6L14 2C13 1 11 3 12 4M18 6C21 3 17-1 14 2" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/><path d="M2 16C2 17 3 18 4 18 5 18 6 16 9 16L13.347 10.989 4.022 10.989 4 11M4 11C4 14 2 15 2 16" ${sl_none} ${fs.value} ${op(0.4)}/>`,
        boxes: `<path ${fn} ${s_sw.value} ${slr} d="M10 11 6 9 2 11 2 16 6 18 10 16 10 11M10 11 14 9 18 11 18 16 14 18 10 16M6 9 6 4 10 2 14 4 14 9M6 4 10 6 14 4M2 11 6 13 10 11M10 11 14 13 18 11M10 6 10 11M6 13 6 18M14 13 14 18"/><path ${fs.value} ${sn} ${op(0.5)} d="M6 4 10 6 10 11 6 9 6 4"/><path ${fs.value} ${sn} ${op(0.5)} d="M2 11 6 13 6 18 2 16 2 11"/><path ${fs.value} ${sn} ${op(0.5)} d="M10 11 14 13 14 18 10 16 10 11"/>`,
        chartFunnel: `<path ${fn} ${s_sw.value} ${sl_none} d="M9 18C10 19 11 18 11 18L12 10 18 6 18 3C18 1 2 1 2 3L2 6 8 10 9 18M2 3C1 6 18 6 18 3"/>`,
        chartHistoryPlot: `<path ${fn} ${s_sw.value} ${slr} d="M4 4A1 1 0 006 4 1 1 0 004 4M12 2A1 1 0 0012 4 1 1 0 0012 2M17 7A1 1 0 0017 9 1 1 0 0017 7M12 14A1 1 0 0012 16 1 1 0 0012 14M5 12A1 1 0 005 14 1 1 0 005 12M6 4 11 3M12.84 3.582 16.267 7.265M16.625 8.953 12.763 14.297M10.999 14.732 5.987 13.326M1 1 1 19 19 19"/>`,
        chartTableSparkline: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 2 1 4M1 9 1 11C1 11 1 12 2 12L6 12C6 12 7 12 7 11L7 9C7 8 6 8 6 8L2 8C1 8 1 9 1 9M1 16 1 18C1 18 1 19 2 19L6 19C7 19 7 18 7 18L7 16C7 15 6 15 6 15L2 15C1 15 1 16 1 16M9 3C11 1 12 1 14 3 16 5 17 5 19 3M9 10C11 12 12 12 14 10 16 8 17 8 19 10M9 17C11 15 12 15 14 17 16 19 17 19 19 17M1 4C1 4 1 5 2 5L6 5C6 5 7 5 7 4L7 2C7 1 6 1 6 1L2 1C2 1 1 1 1 2" />`,
        chartCirclePack: `<path ${fn} ${s_sw.value} ${sl_none} d="M10 7A1 1 0 0010 13 1 1 0 0010 7M5 5A1 1 0 007.716 8.039 1 1 0 005 5M13 4A1 1 0 0011.354 7.322 1 1 0 0013 4M8.506 12.628A1 1 0 005.05 16.755 1 1 0 008.506 12.628M14.965 6.988A1 1 0 0013.535 9.758 1 1 0 0014.965 6.988M16 11A1 1 0 0013.084 14.742 1 1 0 0016 11"/>`,
        home: `<path ${fn} ${s_sw.value} ${sl_none} d="M2 10 10 2 18 10M4 10 4 17C4 18 4 18 5 18L8 18 8 12 12 12 12 18 15 18C16 18 16 18 16 17L16 10M8 18"/>`,
        homeFilled: `<path ${fs.value} ${s_sw.value} ${sl_none} d="M2 10 10 2 18 10M4 10 4 17C4 18 4 18 5 18L8 18 8 12 12 12 12 18 15 18C16 18 16 18 16 17L16 10M8 18"/>`,
        icons: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 9 5 2 9 9 1 9M12 9 12 2 19 2 19 9 12 9M5 12C0 12 0 19 5 19 10 19 10 12 5 12M12 12 19 19M19 12 12 19"/>`,
        robot: `<path ${fn} ${s_sw.value} ${sl_none} d="M2 2 18 2 18 18 2 18 2 2M6 5A1 1 0 006 8 1 1 0 006 5M14 5A1 1 0 0014 8 1 1 0 0014 5M1 4 1 9M19 4 19 9M5 11C6 16 14 16 15 11M7 1 13 1"/>`,
        hourglass: `<path ${fn} ${s_sw.value} ${sl_none} d="M4 1 16 1M13 1C16 3 14 5 14 5M7 1C4 3 6 5 6 5M4 19 16 19M6 5C10 10 10 10 6 15M14 5C10 10 10 10 14 15M13 19C16 17 14 15 14 15M7 19C4 17 6 15 6 15"/><path ${op(0.3)} ${fs.value} ${sn} d="M7 18 13 18C14 15 11 13 10 13 9 13 6 15 7 18"/>`,
        computer: `<path ${fn} ${s_sw.value} ${sl_none} d="M3 2C3 2 2 2 2 3L2 13C2 13 2 14 3 14L17 14C18 14 18 13 18 13L18 3C18 2 17 2 17 2L17 2 3 2M9 14 9 16M11 14 11 16M8 17C8.3333 16.6667 8.6667 16.3333 9 15 9.6667 16 10.3333 16 11 15 11.3333 16.3333 11.6667 16.6667 12 17L7 17C6 17 5 18 5 19L15 19C15 18 14 17 13 17L12 17M6 5 4 8 6 11M14 5 16 8 14 11M12 4 8 12"/>`,
        htmlTag: `<path ${fn} ${s_sw.value} ${sl_none} d="M6 5 1 10 6 15M14 5 19 10 14 15M7 18 13 2"/>`,
        curlyBrackets: `<path ${fn} ${s_sw.value} ${sl_none} d="M5 2C3 2 2 3 2 5L2.35 7.988C2 9 1 9 1 10 1 11 2 11 2.396 11.949L2 15C2 17 3 18 5 18M15 2C17 2 18 3 18 5L17.611 8.035C18 9 19 9 19 10 19 11 18 11 17.611 12.008L18 15C18 17 17 18 15 18"/>`,
        curlySpread: `<path ${fn} ${s_sw.value} ${sl_none} d="M5 2C3 2 2 3 2 5L2.35 7.988C2 9 1 9 1 10 1 11 2 11 2.396 11.949L2 15C2 17 3 18 5 18M15 2C17 2 18 3 18 5L17.611 8.035C18 9 19 9 19 10 19 11 18 11 17.611 12.008L18 15C18 17 17 18 15 18M10 9A1 1 0 0010 11 1 1 0 0010 9M6 9A1 1 0 006 11 1 1 0 006 9M14 9A1 1 0 0014 11 1 1 0 0014 9"/>`,
        text: `<path d="M1 3 1 1 13 1 13 4C13 5 11 5 11 4L11 3 8 3 8 17 9 17C10 17 10 19 9 19L5 19C4 19 4 17 5 17L6 17 6 3 3 3 3 4C3 5 1 5 1 4L1 3M11 8 19 8" ${sl_none} ${fs.value} ${op(1)}/><path d="M14 8 19 8M11 11 19 11M11 14 19 14" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        world: `<path ${fn} ${s_sw.value} ${sl_none} d="M10 1A1 1 0 0010 19 1 1 0 0010 1C3 4 3 16 10 19M10 1C17 4 17 16 10 19M10 1 10 19M1 10 19 10M1 10"/>`,
        eye: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 10Q10 1 19 10 10 19 1 10M10 7A1 1 0 0010 13 1 1 0 0010 7M10 9A1 1 0 0010 11 1 1 0 0010 9"/>`,
        chartRidgeline: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 15 4 16 7 14 10 18 14 10 17 16 19 15M1 12 6 11 10 12 14 6M14 6 17 11 19 12M1 9 6 8 9 8 14 1 17 6 19 6"/>`,
        chartChord: `<path ${fn} ${s_sw.value} ${sl_none} d="M9 1Q2 2 1 9M1 11Q2 18 9 19M11 19Q18 18 19 11M19 9Q18 2 11 1M5.683 2.021C9 6 13 4 14.893 2.322M2.421 4.987C14.469 7.137 15.545 12.216 17.361 15.33M4.83 17.48C9.02 13.773 11.207 14.218 15.433 17.369M1.976 14.033C11.207 12.735 15.952 9.065 17.213 4.393"/>`,
        tableDialogOpen: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 4 1 1M10 5 10 15M5 11.636 15 11.655M5 8.396 15 8.412M4 4 1 1 4 1M4 16 1 19M1 16 1 19 4 19M16 16 19 19M16 19 19 19 19 16M16 4 19 1M16 1 19 1 19 4M5 10 5 6C5 6 5 5 6 5L14 5C15 5 15 6 15 6L15 14C15 15 14 15 14 15L6 15C6 15 5 15 5 14L5 10"/>`,
        tableDialogClose: `<path ${fn} ${s_sw.value} ${sl_none} d="M4 4 1 1M4 1 4 4 1 4M16 4 19 1M16 1 16 4 19 4M16 16 19 19M19 16 16 16 16 19M4 16 1 19M1 16 4 16 4 19M10 5 10 15M5 11.636 15 11.655M5 8.396 15 8.412M5 10 5 6C5 6 5 5 6 5L14 5C15 5 15 6 15 6L15 14C15 15 14 15 14 15L6 15C6 15 5 15 5 14L5 10"/>`,
        minimap: `<path ${fn} ${s_sw.value} ${sl_none} d="M1 3C1 1 4 1 4 3L4 17C4 19 1 19 1 17L1 3M4 3 16 3M4 17 16 17 16 3C16 1 19 1 19 3L19 17C19 19 16 19 16 17M6 11 8 14 9 8 12 11 14 5"/>`,
        move: `<path ${fn} ${s_sw.value} ${sl_none} d="M10 2 10 8M10 12 10 18M8 10 2 10M12 10 18 10M7 4 10 2 13 4M4 7 2 10 4 13M7 16 10 18 13 16M16 13 18 10 16 7"/>`,
        resize: `<path ${fn} ${s_sw.value} ${sl_none} d="M2 12 2 17C2 17 2 18 3 18L8 18C8 18 9 18 9 16L9 12C9 11 8 11 8 11L3 11C3 11 2 11 2 12M6 2 9 2M11 2 14 2M16 2 17 2C18 2 18 3 18 3L18 4M4 2 3 2C3 2 2 2 2 3L2 4M2 6 2 9M18 6 18 9M18 16 18 17C18 18 17 18 17 18L16 18M14 18 11 18M18 11 18 14"/>`,
        selectAndGroup: `<path ${fn} ${s_sw.value} ${sl_none} d="M2 1 3 1C4 1 4 2 4 2L4 3C4 3 4 4 3 4L2 4C2 4 1 4 1 3L1 2C1 1 2 1 2 1M17 1 18 1C19 1 19 2 19 2L19 3C19 4 18 4 18 4L17 4C17 4 16 4 16 3L16 2C16 1 17 1 17 1M2 19 3 19C4 19 4 18 4 18L4 17C4 17 4 16 3 16L2 16C2 16 1 16 1 17L1 18C1 19 2 19 2 19M17 19 18 19C18 19 19 19 19 18L19 17C19 17 19 16 18 16L17 16C17 16 16 16 16 17L16 18C16 19 17 19 17 19M4 2.497 16 2.495M2.498 4 2.486 16M17.508 4 17.527 16M4 17.49 16 17.499M6 6 6 12 12 12 12 6 6 6M8 12 8 14 14 14 14 8 12 8"/>`,
        bringToFront: `<path ${fs.value} d="M7 6 13 6C13 6 14 6 14 7L14 13C14 13 14 14 13 14L7 14C7 14 6 14 6 13L6 7C6 7 6 6 7 6"/><path ${fn} ${s_sw.value} ${sl_none} d="M8 4 8 3C8 3 8 2 7 2L3 2C2 2 2 3 2 3L2 7C2 8 3 8 3 8L4 8M12 16 12 17C12 18 13 18 13 18L17 18C17 18 18 18 18 17L18 13C18 13 18 12 17 12L16 12"/>`,
        bringToBack: `<path ${fs.value} d="M7 13 7 10 8 10C10 10 10 9 10 8L10 7 13 7 13 10 12 10C11 10 10 10 10 12L10 13 7 13"/><path ${fn} ${s.value} ${sl_none} d="M11 9M9 8 9 3C9 3 9 2 8 2L3 2C2 2 2 3 2 3L2 8C2 9 3 9 3 9L8 9C9 9 9 8 9 8M11 12 11 17C11 18 12 18 12 18L17 18C17 18 18 18 18 17L18 12C18 12 18 11 17 11L12 11C11 11 11 12 11 12"/>`,
        printer: `<path ${fn} ${s_sw.value} ${sl_none} d="M6 13 6 17C6 18 7 18 7 18L13 18C13 18 14 18 14 17L14 13C14 13 14 12 13 12L7 12C6 12 6 13 6 13M5 15 3 15C3 15 2 15 2 14L2 9C2 8 3 8 3 8L17 8C18 8 18 9 18 9L18 14C18 15 17 15 17 15L15 15M6 7 6 4C6 3 7 3 7 3L13 3C14 3 14 4 14 4L14 7"/>`,
        save: `<path ${fn} ${s_sw.value} ${sl_none} d="M3 2 3 2 14 2 18 6 18 17C18 18 17 18 17 18L3 18C3 18 2 18 2 17L2 3C2 3 2 2 3 2M5 2 5 4C5 5 6 5 6 5L12 5C12 5 13 5 13 4L13 2M10 9A1 1 0 0010 13 1 1 0 0010 9"/>`,
        svg: `<path ${fn} ${s_sw.value} ${sl_none} d="M4 1C2 1 1 2 1 4L1 16C1 18 2 19 4 19L16 19C18 19 19 18 19 16L19 6C15 6 14 5 14 1ZM8.458 9.052 10 16 11.519 9.03M16 11C16 8 12.995 8.81 13 11L13 14C13 17 15.99 16.299 16 14L16 13 15 13M6.982 10.286C6.564 8.238 3.921 8.788 4 11 4.757 13.259 6.806 11.607 7 14 7 17 3.854 16.299 4 14"/>`,
        chartStackline: `<path d="M2 16 2 18 18 18 18 10 14 14 11 12 8 15 5 13Z" ${sn} ${fs.value} ${op(0.9)}/><path d="M2 16 5 13 8 15 11 12 14 14 18 10 18 6 14 8 11 6 8 9 5 8 2 9Z" ${sn} ${fs.value}" ${op(0.6)}/><path d="M2 9 2 2 18 2 18 6 14 8 11 6 8 9 5 8Z" ${sn} ${fs.value} ${op(0.3)}/><path d="M1 1 1 19 19 19" ${s.value} ${sl_none} ${fn}/>`,
        zoomUnlock: `<path d="M10 1A1 1 0 0010 19 1 1 0 0010 1M16.36 16.368 19 19M6 10 6 14C6 15 7 15 7 15L13 15C13 15 14 15 14 14L14 10C14 10 14 9 13 9L7 9C6 9 6 10 6 10M13 9A1 1 0 009 5M10 11 10 13" ${s_sw.value} ${fn} ${sl_none}/>`,
        zoomLock: `<path d="M10 1A1 1 0 0010 19 1 1 0 0010 1M16.36 16.368 19 19M6 10 6 14C6 15 7 15 7 15L13 15C13 15 14 15 14 14L14 10C14 10 14 9 13 9L7 9C6 9 6 10 6 10M13 9M10 11 10 13M13 9C14 3 6 3 7 9" ${s_sw.value} ${fn} ${sl_none}/>`,
        lock: `<path d="M16 8C16-1 4-1 4 8M3 8 17 8C18 8 18 9 18 9L18 18C18 19 17 19 17 19L3 19C3 19 2 19 2 18L2 9C2 9 2 8 3 8M10 11A1 1 0 0010 13 1 1 0 0010 11M10 13 10 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        unlock: `<path d="M16 8C18 1 10 0 8 2M3 8 17 8C18 8 18 9 18 9L18 18C18 19 17 19 17 19L3 19C3 19 2 19 2 18L2 9C2 9 2 8 3 8M10 11A1 1 0 0010 13 1 1 0 0010 11M10 13 10 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        triangleInformation: `<path d="M4 18 16 18C17 18 20 18 19 15L12 3C11 1 9 1 8 3L1 15C0 18 3 18 4 18M10 15 10 10M10 6A1 1 0 0010 8 1 1 0 0010 6" ${s_sw.value} ${sl_none} ${fn}/>`,
        triangleExclamation: `<path d="M4 18 16 18C17 18 20 18 19 15L12 3C11 1 9 1 8 3L1 15C0 18 3 18 4 18M10 11 10 5M10 13A1 1 0 0010 15 1 1 0 0010 13" ${s_sw.value} ${sl_none} ${fn}/>`,
        direction: `<path d="M18 8A1 1 0 0018 8C17-1 3-1 2 9M2 12C3 21 17 21 18 11M1 6 2 9 5 7M15 13 18 11 19 14" ${s_sw.value} ${fn} ${sl_none}/>`,
        chartDag: `<path d="M8 2 12 2C13 2 13 3 13 3L13 4C13 4 13 5 12 5L8 5C8 5 7 5 7 4L7 3C7 3 7 2 8 2M2 10 2 11C2 11 2 12 3 12L7 12C7 12 8 12 8 11L8 10C8 10 8 9 7 9L3 9C2 9 2 10 2 10M12 10 12 11C12 11 12 12 13 12L17 12C17 12 18 12 18 11L18 10C18 10 18 9 17 9L13 9C12 9 12 10 12 10M3 16 7 16C8 16 8 17 8 17L8 18C8 18 8 19 7 19L3 19C2 19 2 18 2 18L2 17C2 17 2 16 3 16M12 17 12 18C12 18 12 19 13 19L17 19C18 19 18 18 18 18L18 17C18 16 17 16 17 16L13 16C12 16 12 17 12 17M10 5C10 8 5 6 5 9M10 5C10 8 15 6 15 9M5 12 5 16M15 12 15 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        chartGeo: `<path d="M10 14C13 9 14 9 14 6A1 1 0 006 6C6 9 8 10 10 14M10 4A1 1 0 0010 8 1 1 0 0010 4M7 12 4 12 1 19 19 19 16 12 13 12" ${s_sw.value} ${fn} ${sl_none}/>`,
        revert: `<path d="M10 19A1 1 0 0010 3M2 10C2 15 6 19 10 19M13 1 10 3 12 6" ${s_sw.value} ${fn} ${sl_none}/>`,
        lineUp: `<path d="M1 1 1 19 19 19M3 17 6 13 9 15 12 10 15 13 18 3M15.809 4.399 18 3 18.992 5.387" ${s_sw.value} ${fn} ${sl_none}/>`,
        histogram: `<path d="M1 1 1 19 19 19M4 19 4 12 7 12 7 19M9 19 9 8 12 8 12 19M14 19 14 4 17 4 17 19" ${s_sw.value} ${fn} ${sl_none}/>`,
        histogramUp: `<path d="M1 1 1 19 19 19M4 19 4 14 7 14 7 19M9 19 9 11 12 11 12 19M14 19 14 8 17 8 17 19M4 9 15 2M12.222 1.626 15 2 14.269 4.63" ${s_sw.value} ${fn} ${sl_none}/>`,
        histogramDown: `<path d="M1 1 1 19 19 19M4 19 4 9 7 9 7 19M9 19 9 13 12 13 12 19M14 19 14 15 17 15 17 19M5 2 16 10M13.15 10.336 15.948 10.002 15.444 7.273" ${s_sw.value} ${fn} ${sl_none}/>`,
        document: `<path d="M1 1 1 19 19 19M19 19 19 1 1 1M7 4 4 4M4 7 7 7M4 10 7 10M4 13 16 13M4 16 16 16M10 4 10 10 16 10 16 4 10 4" ${s_sw.value} ${fn} ${sl_none}/>`,
        database: `<path d="M2 16C2 20 18 20 18 16M18 16 18 4C18 0 2 0 2 4L2 16M2 4C2 8 18 8 18 4M2 8C2 12 18 12 18 8M2 12C2 16 18 16 18 12" ${s_sw.value} ${fn} ${sl_none}/>`,
        pie: `<path d="M10 1A1 1 0 0010 19 1 1 0 0010 1L10 10 14.025 18.049M10 10 1 10M10 10 14 18" ${s_sw.value} ${fn} ${sl_none}/><path d="M10 10 14 18C10.587 20.069 1.635 19.271 1 10L10 10" ${sn} ${fs.value} ${op(0.3)}/><path d="M10 1C2.528 1.391.931 7.876 1 10L10 10 10 1" ${sn} ${fs.value} ${op(0.5)}/>`,
        percentage: `<path d="M2 18 18 2M5 2A1 1 0 004 7 1 1 0 005 2M16 18A1 1 0 0015 13 1 1 0 0016 18" ${s_sw.value} ${fn} ${sl_none}/>`,
        percentageUp: `<path d="M2 18 18 2M5 2A1 1 0 004 7 1 1 0 005 2M16 18A1 1 0 0015 13 1 1 0 0016 18M14 2 18 2 18 6" ${s_sw.value} ${fn} ${sl_none}/>`,
        percentageDown: `<path d="M2 18 18 2M5 2A1 1 0 004 7 1 1 0 005 2M16 18A1 1 0 0015 13 1 1 0 0016 18M2 14 2 18 6 18" ${s_sw.value} ${fn} ${sl_none}/>`,
        aToZ: `<path d="M3 8 7 1 11 8M4.716 5 9.285 5M3 12 11 12 3 19 11 19M17 2 17 18M15 16 17 18 19 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        zToA: `<path d="M3 19 7 12 11 19M4.715 16.001 9.284 16M3 1 11 1 3 8 11 8M17 2 17 18M15 16 17 18 19 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        zeroToNine: `<path d="M7 1C1.653.987 1.663 7.995 7 8 12.337 7.995 12.326.998 7 1M17 2 17 18M15 16 17 18 19 16M11 14C11 11 3 11 3 14 3 17 11 16 11 14M11 14C11 19 8 19 3 19" ${s_sw.value} ${fn} ${sl_none}/>`,
        nineToZero: `<path d="M7 12C1.662 11.998 1.672 18.991 7 19 12.329 18.996 12.335 11.995 7 12M17 2 17 18M15 16 17 18 19 16M11 4C11 1 3 1 3 4M3 4C3 7 11 6 11 4M11 4C11 9 8 9 3 9" ${s_sw.value} ${fn} ${sl_none}/>`,
        network: `<path d="M7 15 13 15C14 15 14 16 14 16L14 18C14 18 14 19 13 19L7 19C6 19 6 18 6 18L6 16C6 16 6 15 7 15M1 17 6 17M14 17 19 17M10 15 10 12M4 12 16 12C17 12 17 11 17 11L17 9C17 9 17 8 16 8L4 8C4 8 3 8 3 9L3 11C3 11 3 12 4 12M4 6 16 6C17 6 17 5 17 5L17 3C17 2 16 2 16 2L4 2C4 2 3 2 3 3L3 5C3 5 3 6 4 6M10 6 10 8" ${s_sw.value} ${fn} ${sl_none}/><path d="M6 4 7 4M9 4 14 4M6 10 7 10M9 10 14 10" ${s.value} stroke-width="${strokeWidth / 2}" ${fn} ${sl_none}/>`,
        chip: `<path d="M5 3 15 3C16 3 17 4 17 5L17 15C17 16 16 17 15 17L5 17C4 17 3 16 3 15L3 5C3 4 4 3 5 3M10 1 10 3M7 1 7 3M13 1 13 3M1 10 3 10M1 7 3 7M1 13 3 13M10 17 10 19M7 17 7 19M13 17 13 19M17 10 19 10M17 7 19 7M17 13 19 13M8 7 12 7C12 7 13 7 13 8L13 12C13 12 13 13 12 13L8 13C7 13 7 12 7 12L7 8C7 7 8 7 8 7" ${s_sw.value} ${fn} ${sl_none}/>`,
        chipAi: `<path d="M5 3 15 3C16 3 17 4 17 5L17 15C17 16 16 17 15 17L5 17C4 17 3 16 3 15L3 5C3 4 4 3 5 3M10 1 10 3M7 1 7 3M13 1 13 3M1 10 3 10M1 7 3 7M1 13 3 13M10 17 10 19M7 17 7 19M13 17 13 19M17 10 19 10M17 7 19 7M17 13 19 13" ${s_sw.value} ${fn} ${sl_none}/><path d="M10 6C9 9 9 9 6 10 9 11 9 11 10 14 11 11 11 11 14 10 11 9 11 9 10 6" ${sn} ${fs.value} />`,
        wifi: `<path d="M10 6A1 1 0 0010 8 1 1 0 0010 6M7 4C5 5 5 9 7 10M13 4C15 5 15 9 13 10M4 3C2 5 2 9 4 11M16 3C18 5 18 9 16 11M10 11 10 16M2 17 6 17M6 17C6 16 7 16 7 16L13 16C13 16 14 16 14 17 14 18 13 18 13 18L7 18C7 18 6 18 6 17M14 17 18 17" ${s_sw.value} ${fn} ${sl_none}/>`,
        key: `<path d="M7 10A1 1 0 001 10 1 1 0 007 10L19 10M17 10 17 13 15 11 13 13 13 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        binary: `<path d="M4 1C2 1 2 4 4 4 6 4 6 1 4 1M8 1 8 4M12 1C10 1 10 4 12 4 14 4 14 1 12 1M16 1 16 4M4 6 4 9M8 6C6 6 6 9 8 9 10 9 10 6 8 6M12 6 12 9M16 6C14 6 14 9 16 9 18 9 18 6 16 6M4 11C2 11 2 14 4 14 6 14 6 11 4 11M8 11 8 14M12 11 12 14M16 11 16 14M4 16 4 19M8 16C6 16 6 19 8 19 10 19 10 16 8 16M12 16C10 16 10 19 12 19 14 19 14 16 12 16M16 16 16 19" ${s.value} stroke-width="${strokeWidth / 2}" ${fn} ${sl_none}/>`,
        chipBinary: `<path d="M5 3 15 3C16 3 17 4 17 5L17 15C17 16 16 17 15 17L5 17C4 17 3 16 3 15L3 5C3 4 4 3 5 3M10 1 10 3M7 1 7 3M13 1 13 3M1 10 3 10M1 7 3 7M1 13 3 13M10 17 10 19M7 17 7 19M13 17 13 19M17 10 19 10M17 7 19 7M17 13 19 13" ${s_sw.value} ${fn} ${sl_none}/><path d="M6 6C4 6 4 9 6 9 8 9 8 6 6 6M10 6 10 9M14 6C12 6 12 9 14 9 16 9 16 6 14 6M6 11 6 14M10 11C8 11 8 14 10 14 12 14 12 11 10 11M14 11 14 14" ${s.value} stroke-width="${strokeWidth / 3}" ${fn} ${sl_none}/>`,
        shield: `<path d="M10 1C7 4 4 4 1 4 2 10 4 15 10 19 16 15 18 10 19 4 16 4 13 4 10 1" ${s_sw.value} ${fn} ${sl_none}/>`,
        shieldExclam: `<path d="M10 1C7 4 4 4 1 4 2 10 4 15 10 19 16 15 18 10 19 4 16 4 13 4 10 1M10 5 10 10M10 13A1 1 0 0010 15 1 1 0 0010 13" ${s_sw.value} ${fn} ${sl_none}/>`,
        cloud: `<path d="M4 15 16 15A1 1 0 0017 10 1 1 0 0012 7 1 1 0 007 9 1 1 0 004 15" ${s_sw.value} ${fn} ${sl_none}/>`,
        cloudRain: `<path d="M4 15 16 15A1 1 0 0017 10 1 1 0 0012 7 1 1 0 007 9 1 1 0 004 15M6 17 4 19M11 17 9 19M16 17 14 19" ${s_sw.value} ${fn} ${sl_none}/>`,
        sun: `<path d="M10 7A1 1 0 0010 13 1 1 0 0010 7M5 6 4 5M15 6 16 5M5 15 4 16M15 15 16 16M10 4 10.005 2.682M4 10 2.662 10.001M10 16 10.002 17.333M16 10 17.346 10.002" ${s_sw.value} ${fn} ${sl_none}/>`,
        croissant: `<path d="M6 3C17 3 17 17 6 17M6 3C11 7 11 13 6 17" ${s_sw.value} ${fn} ${sl_none}/>`,
        plus: `<path d="M10 3 10 17M3 10 17 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        minus: `<path d="M3 10 17 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        person: `<path d="M10 1A1 1 0 0010 1C8 1 8 5 10 5 12 5 12 1 10 1M10 6C6 6 9 10 10 10M10 6C14 6 11 10 10 10M8 10 9 19M12 10 11 19M8 19 12 19M8 5C6 6 5 10 5 12M12 5C14 6 15 10 15 12" ${s_sw.value} ${fn} ${sl_none}/>`,
        people: `<path d="M6 1A1 1 0 006 1C4 1 4 5 6 5 8 5 8 1 6 1M6 6C2 6 5 10 6 10M6 6C10 6 7 10 6 10M4 10 5 19M8 10 7 19M4 19 8 19M4 5C2 6 1 10 1 12M14 1C12 1 12 5 14 5 16 5 16 1 14 1M14 6C10 6 13 10 14 10 15 10 18 6 14 6M12 10 13 19M16 10 15 19M12 19 16 19M16 5C18 6 19 10 19 12M8 5C10 8 10 10 10 12 10 10 10 8 12 5" ${s_sw.value} ${fn} ${sl_none}/>`,
        blur: `<circle ${fs.value} ${sn} cx="9" cy="9" r="1" /><circle ${fs.value} ${sn} cx="11" cy="9" r="1" /><circle ${fs.value} ${sn} cx="9" cy="11" r="1" /><circle ${fs.value} ${sn} cx="11" cy="11" r="1" /><circle ${fs.value} ${sn} cx="9" cy="7" r="0.7" /><circle ${fs.value} ${sn} cx="11" cy="7" r="0.7" /><circle ${fs.value} ${sn} cx="13" cy="7" r="0.7" /><circle ${fs.value} ${sn} cx="13" cy="9" r="0.7" /><circle ${fs.value} ${sn} cx="13" cy="11" r="0.7" /><circle ${fs.value} ${sn} cx="13" cy="13" r="0.7" /><circle ${fs.value} ${sn} cx="11" cy="13" r="0.7" /><circle ${fs.value} ${sn} cx="9" cy="13" r="0.7" /><circle ${fs.value} ${sn} cx="7" cy="13" r="0.7" /><circle ${fs.value} ${sn} cx="7" cy="11" r="0.7" /><circle ${fs.value} ${sn} cx="7" cy="9" r="0.7" /><circle ${fs.value} ${sn} cx="7" cy="7" r="0.7" /><circle ${fs.value} ${sn} cx="5" cy="5" r="0.5" /><circle ${fs.value} ${sn} cx="7" cy="5" r="0.5" /><circle ${fs.value} ${sn} cx="9" cy="5" r="0.5" /><circle ${fs.value} ${sn} cx="11" cy="5" r="0.5" /><circle ${fs.value} ${sn} cx="13" cy="5" r="0.5" /><circle ${fs.value} ${sn} cx="15" cy="5" r="0.5" /><circle ${fs.value} ${sn} cx="15" cy="7" r="0.5" /><circle ${fs.value} ${sn} cx="15" cy="9" r="0.5" /><circle ${fs.value} ${sn} cx="15" cy="11" r="0.5" /><circle ${fs.value} ${sn} cx="15" cy="13" r="0.5" /><circle ${fs.value} ${sn} cx="15" cy="15" r="0.5" /><circle ${fs.value} ${sn} cx="13" cy="15" r="0.5" /><circle ${fs.value} ${sn} cx="11" cy="15" r="0.5" /><circle ${fs.value} ${sn} cx="9" cy="15" r="0.5" /><circle ${fs.value} ${sn} cx="7" cy="15" r="0.5" /><circle ${fs.value} ${sn} cx="5" cy="15" r="0.5" /><circle ${fs.value} ${sn} cx="5" cy="13" r="0.5" /><circle ${fs.value} ${sn} cx="5" cy="11" r="0.5" /><circle ${fs.value} ${sn} cx="5" cy="9" r="0.5" /><circle ${fs.value} ${sn} cx="5" cy="7" r="0.5" /><circle ${fs.value} ${sn} cx="3" cy="3" r="0.3" /><circle ${fs.value} ${sn} cx="5" cy="3" r="0.3" /><circle ${fs.value} ${sn} cx="7" cy="3" r="0.3" /><circle ${fs.value} ${sn} cx="9" cy="3" r="0.3" /><circle ${fs.value} ${sn} cx="11" cy="3" r="0.3" /><circle ${fs.value} ${sn} cx="13" cy="3" r="0.3" /><circle ${fs.value} ${sn} cx="15" cy="3" r="0.3" /><circle ${fs.value} ${sn} cx="17" cy="3" r="0.3" /><circle ${fs.value} ${sn} cx="17" cy="5" r="0.3" /><circle ${fs.value} ${sn} cx="17" cy="7" r="0.3" /><circle ${fs.value} ${sn} cx="17" cy="9" r="0.3" /><circle ${fs.value} ${sn} cx="17" cy="11" r="0.3" /><circle ${fs.value} ${sn} cx="17" cy="13" r="0.3" /><circle ${fs.value} ${sn} cx="17" cy="15" r="0.3" /><circle ${fs.value} ${sn} cx="17" cy="17" r="0.3" /><circle ${fs.value} ${sn} cx="15" cy="17" r="0.3" /><circle ${fs.value} ${sn} cx="13" cy="17" r="0.3" /><circle ${fs.value} ${sn} cx="11" cy="17" r="0.3" /><circle ${fs.value} ${sn} cx="9" cy="17" r="0.3" /><circle ${fs.value} ${sn} cx="7" cy="17" r="0.3" /><circle ${fs.value} ${sn} cx="5" cy="17" r="0.3" /><circle ${fs.value} ${sn} cx="3" cy="17" r="0.3" /><circle ${fs.value} ${sn} cx="3" cy="15" r="0.3" /><circle ${fs.value} ${sn} cx="3" cy="13" r="0.3" /><circle ${fs.value} ${sn} cx="3" cy="11" r="0.3" /><circle ${fs.value} ${sn} cx="3" cy="9" r="0.3" /><circle ${fs.value} ${sn} cx="3" cy="7" r="0.3" /><circle ${fs.value} ${sn} cx="3" cy="5" r="0.3" /><circle ${fs.value} ${sn} cx="1" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="3" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="5" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="7" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="9" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="11" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="13" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="15" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="17" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="1" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="3" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="5" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="7" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="9" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="11" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="13" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="15" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="17" r="0.15" /><circle ${fs.value} ${sn} cx="19" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="17" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="15" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="13" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="11" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="9" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="7" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="5" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="3" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="1" cy="19" r="0.15" /><circle ${fs.value} ${sn} cx="1" cy="17" r="0.15" /><circle ${fs.value} ${sn} cx="1" cy="15" r="0.15" /><circle ${fs.value} ${sn} cx="1" cy="13" r="0.15" /><circle ${fs.value} ${sn} cx="1" cy="11" r="0.15" /><circle ${fs.value} ${sn} cx="1" cy="9" r="0.15" /><circle ${fs.value} ${sn} cx="1" cy="7" r="0.15" /><circle ${fs.value} ${sn} cx="1" cy="5" r="0.15" /><circle ${fs.value} ${sn} cx="1" cy="3" r="0.15" />`,
        download: `<path d="M10 2 10 14M6 10 10 14 14 10M2 13 2 16C2 18 4 18 4 18L16 18C16 18 18 18 18 16L18 13" ${s_sw.value} ${fn} ${sl_none}/>`,
        upload: `<path d="M10 6 10 18M6 10 10 6 14 10M2 7 2 4C2 2 4 2 4 2L16 2C16 2 18 2 18 4L18 7" ${s_sw.value} ${fn} ${sl_none}/>`,
        target: `<path d="M10 9A1 1 0 0010 11 1 1 0 0010 9M10 6A1 1 0 0010 14 1 1 0 0010 6M10 2A1 1 0 0010 18 1 1 0 0010 2" ${s_sw.value} ${fn} ${sl_none}/>`,
        sqlQuery: `<path d="M17 10 17 3C17 1 3 1 3 3L3 10M3 3C3 5 17 5 17 3" ${s_sw.value} ${fn} ${sl_none}/><path d="M5.994 13.991C4.847 12.359 2.399 12.962 2 14 1.843 16.025 6.231 14.984 6 17 5.143 18.638 2.304 18.047 2 17M10 13C7 13 7 18 10 18 13 18 13 13 10 13M11 18 12 19M14 13 14 18 18 18" ${s.value} stroke-width="${strokeWidth / 1.5}" ${fn} ${sl_none}/><path d="M10 11 10 7M8 9 10 7 12 9" ${s.value} stroke-width="${strokeWidth / 1.5}" ${fn} ${sl_none}/>`,
        gisLayerSearch: `<path d="M10 1 2 3M10 10A1 1 0 0010 18 1 1 0 0010 10M2 3 10 5 18 3 10 1M2 6 10 8 18 6M2 9 6 10M13.068 16.565 16 19M18 9 14 10M2 9 8 7.501M18 9 12 7.5M18 6 12 4.5M2 6 8 4.5" ${s_sw.value} ${fn} ${sl_none}/>`,
        sqlSearch: `<path d="M6.008 3.011C5.99 1.737 2.024 1.646 2 3 2.024 4.703 6.008 4.12 5.99 6.013 5.99 7.45 2.024 7.286 2.006 5.831M10 10A1 1 0 0010 18 1 1 0 0010 10M13.068 16.565 16 19M10 2C7 2 7 7 10 7M10 7C13 7 13 2 10 2M15 2 15 7 18 7M11.462 6.463 13 8" ${s_sw.value} ${fn} ${sl_none}/>`,
        scada: `<path d="M7 15 13 15C14 15 14 16 14 16L14 18C14 18 14 19 13 19L7 19C6 19 6 18 6 18L6 16C6 16 6 15 7 15M1 17 6 17M14 17 19 17M10 15 10 4M5.876 5.49 14.103 9.557M5.896 9.552 14.128 5.492M10 2A1 1 0 0010 4 1 1 0 0010 2M6 5A1 1 0 004 5 1 1 0 006 5M6 10A1 1 0 004 10 1 1 0 006 10M14 5A1 1 0 0016 5 1 1 0 0014 5M14 10A1 1 0 0016 10 1 1 0 0014 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        apiStream: `<path d="M5 2C3 2 2 3 2 5L2.35 7.988C2 9 1 9 1 10 1 11 2 11 2.396 11.949L2 15C2 17 3 18 5 18M15 2C17 2 18 3 18 5L17.611 8.035C18 9 19 9 19 10 19 11 18 11 17.611 12.008L18 15C18 17 17 18 15 18M6 6 14 6M12 4 14 6 12 8M14 14 6 14M8 12 6 14 8 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        gisLayerQuery: `<path d="M5.994 13.991C4.847 12.359 2.399 12.962 2 14 1.843 16.025 6.231 14.984 6 17 5.143 18.638 2.304 18.047 2 17M10 13C7 13 7 18 10 18 13 18 13 13 10 13M11 18 12 19M14 13 14 18 18 18" ${s.value} stroke-width="${strokeWidth / 1.5}" ${fn} ${sl_none}/><path d="M10 11 10 7M8 9 10 7 12 9" ${s.value} stroke-width="${strokeWidth / 1.5}" ${fn} ${sl_none}/><path d="M15.52 9.619M10 1 2 3M2 6M2 3 10 5 18 3 10 1M2 6 6 7M18 9 15.518 9.619M14 7 18 6M2 9 4.493 9.629M2 6 8 4.5M18 6 12 4.5M2 9 5 8M18 9 15 8" ${s_sw.value} ${fn} ${sl_none}/>`,
        wrench: `<path d="M2.036 4.452 5.109 7.442C6.895 7.484 7.56 6.944 7.85 5.199L4.736 1.835C9.47 1.42 12.211 3.455 10.509 7.94M2.036 4.452C.998 8.397 3.614 12.052 8.05 10.106M8.05 10.106 15.734 18.258C16.773 18.244 18.006 16.996 17.994 16.099L10.509 7.94" ${s_sw.value} ${fn} ${sl_none}/>`,
        branches: `<path d="M4 10A1 1 0 001 10 1 1 0 004 10M10 10A1 1 0 007 10 1 1 0 0010 10M10 3A1 1 0 007 3 1 1 0 0010 3M2.492 8.5 2.505 5.001C2.521 4.002 3.536 3.004 4.517 3L7 3M10 3 16 3M19 3A1 1 0 0016 3 1 1 0 0019 3M4 10 7 10M19 17A1 1 0 0016 17 1 1 0 0019 17M8.5 11.5 8.511 15C8.506 16 9.494 16.999 10.526 16.999L16 17M19 10A1 1 0 0016 10 1 1 0 0019 10M10 10 16 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        fork: `<path d="M4 2A1 1 0 004 6 1 1 0 004 2M16 2A1 1 0 0016 6 1 1 0 0016 2M10 15A1 1 0 0010 19 1 1 0 0010 15M4 6 4 8C4 10 6 10 6 10L14 10C14 10 16 10 16 8L16 6M10 10 10 15" ${s_sw.value} ${fn} ${sl_none}/>`,
        resizeX: `<path d="M5 6 1 10 5 14M15 6 19 10 15 14" ${s_sw.value} ${fn} ${sl_none}/>`,
        resizeY: `<path d="M14 5 10 1 6 5M14 15 10 19 6 15" ${s_sw.value} ${fn} ${sl_none}/>`,
        resizeTLBR: `<path d="M9 3 3 3 3 9M17 11 17 17 11 17" ${s_sw.value} ${fn} ${sl_none}/>`,
        resizeTRBL: `<path d="M17 9 17 3 11 3M9 17 3 17 3 11" ${s_sw.value} ${fn} ${sl_none}/>`,
        focus: `<path d="M1 6 1 4C1 2 2 1 4 1L6 1M14 1 16 1C18 1 19 2 19 4L19 6M19 14 19 16C19 18 18 19 16 19L14 19M6 19 4 19C2 19 1 18 1 16L1 14M12 10A1 1 0 008 10 1 1 0 0012 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        sql: `<path d="M10 7C7 7 7 13 10 13 13 13 13 7 10 7M10 13 12 15M5.988 8.502C5.988 6.993 2 6 2 9 2.322 10.725 5.706 9.249 6 11 5.988 14.076 2.007 13.014 2.007 11.504M14 7 14 13 18 13" ${s_sw.value} ${fn} ${sl_none}/>`,
        monitor: `<path d="M3 2C3 2 2 2 2 3L2 13C2 13 2 14 3 14L17 14C18 14 18 13 18 13L18 3C18 2 17 2 17 2L17 2 3 2M2 12 18 12M9 14 9 16M11 14 11 16M8 17C8.3333 16.6667 8.6667 16.3333 9 15 9.6667 16 10.3333 16 11 15 11.3333 16.3333 11.6667 16.6667 12 17L7 17C6 17 5 18 5 19L15 19C15 18 14 17 13 17L12 17" ${s_sw.value} ${fn} ${sl_none}/>`,
        workstation: `<path d="M2 2C2 2 1 2 1 3L1 13C1 13 1 14 2 14L11 14M1 12 11 12M8 14 8 16M10 14 10 16M7 17C8 17 8 16 8 15 9 16 9 16 10 15 10 17 11 17 11 17M11 17 6 17C5 17 4 18 4 19L11 19M11 2 2 2M14 2 18 2C18 2 19 2 19 3L19 18C19 19 18 19 18 19L14 19C13 19 13 18 13 18L13 3C13 3 13 2 14 2M16 5A1 1 0 0016 7 1 1 0 0016 5" ${s_sw.value} ${fn} ${sl_none}/>`,
        laptop: `<path d="M2 17C2 18 3 18 3 18L17 18C17 18 18 18 18 17L16 13 4 13 2 17M4 12 4 4C4 4 4 3 5 3L15 3C16 3 16 4 16 4L16 12C12 12 8 12 4 12M7 16 13 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        folder: `<path d="M3 2 6 2M3 2C2 2 2 3 2 3L2 17C2 17 2 18 3 18M3 18 17 18C17 18 18 18 18 17L18 6C18 6 18 4 16 4L8 4 6 2M18 9C18 7 16 7 16 7L4 7C2 7 2 9 2 9M8 9 12 9" ${s_sw.value} ${fn} ${sl_none}/>`,
        folderFill: `<path d="M3 2 6 2M3 2C2 2 2 3 2 3L2 17C2 17 2 18 3 18M3 18 17 18C17 18 18 18 18 17L18 6C18 6 18 4 16 4L8 4 6 2M18 12C18 10 16 10 16 10L4 10C2 10 2 12 2 12M8 12 12 12M5 10 5 7 15 7 15 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        clip: `<path d="M6 1 6 15A1 1 0 0014 15L14 4A1 1 0 009 4L9 15A1 1 0 0011.5 15L11.5 7" ${s_sw.value} ${fn} ${sl_none}/>`,
        addColumn: `<path d="M3 2C2 2 2 3 2 3L2 17C2 17 2 18 3 18L5 18C5 18 6 18 6 17L6 3C6 2 5 2 5 2L3 2M9 2C8 2 8 3 8 3L8 17C8 17 8 18 9 18L11 18C12 18 12 17 12 17L12 3C12 3 12 2 11 2L9 2M16 8 16 12M14 10 18 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        addRow: `<path d="M3 2C3 2 2 2 2 3L2 5C2 5 2 6 3 6L17 6C17 6 18 6 18 5L18 3C18 2 17 2 17 2L3 2M3 8C2 8 2 9 2 9L2 11C2 11 2 12 3 12L17 12C18 12 18 11 18 11L18 9C18 8 17 8 17 8L3 8M10 14 10 18M8 16 12 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        bell: `<path d="M12 3A1 1 0 008 3C4 4 5 9 4 12L3 14C3 15 3 16 4 16L16 16C17 16 17 15 17 14L16 12C15 9 16 4 12 3M8 17A1 1 0 0012 17" ${s_sw.value} ${fn} ${sl_none}/>`,
        bellOff: `<path d="M12 3A1 1 0 008 3C4 4 5 9 4 12L3 14C3 15 3 16 4 16L16 16C17 16 17 15 17 14L16 12C15 9 16 4 12 3M8 17A1 1 0 0012 17M2 2 19 17" ${s_sw.value} ${fn} ${sl_none}/>`,
        bellRing: `<path d="M12 3A1 1 0 008 3C4 4 5 9 4 12L3 14C3 15 3 16 4 16L16 16C17 16 17 15 17 14L16 12C15 9 16 4 12 3M8 17A1 1 0 0012 17M5 2C3 3 2 5 2 7M15 2C17 3 18 5 18 7" ${s_sw.value} ${fn} ${sl_none}/>`,
        pin: `<path d="M2 18 6 14M3 10 10 17M10 17 11 16C12 14 12 12 12 12L16 7C17 7 17 7 18 6L14 2C13 3 13 3 13 4L8 8C8 8 6 8 4 9L3 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        unpin: `<path d="M2 18 6 14M3 10 10 17M10 17 11 16C12 14 12 12 12 12L16 7C17 7 17 7 18 6L14 2C13 3 13 3 13 4L8 8C8 8 6 8 4 9L3 10M2 2 18 18" ${s_sw.value} ${fn} ${sl_none}/>`,
        building: `<path d="M1 18 19 18M3 18 3 2 10 2 10 18M5 4 5 5M8 4 8 5M5 8 5 9M8 8 8 9M5 12 5 13M8 12 8 13M10 10 17 10 17 18M12 18 12 15C12 14 15 14 15 15L15 18M13 12 14 12" ${s_sw.value} ${fn} ${sl_none}/>`,
        twig: `<path d="M5 15A1 1 0 005 19 1 1 0 005 15M5 1A1 1 0 005 5 1 1 0 005 1M15 5A1 1 0 0015 9 1 1 0 0015 5M5 15 5 5M7 17 11 17C13 17 15 15 15 13L15 9" ${s_sw.value} ${fn} ${sl_none}/>`,
        check: `<path d="M18 2 8 18 2 12" ${s_sw.value} ${fn} ${sl_none}/>`,
        doubleCheck: `<path d="M17 2 7 18 2 12M7 11 8 12M11 15 13 17 19 6" ${s_sw.value} ${fn} ${sl_none}/>`,
        plug: `<path d="M14 5 14 15C14 16 12 16 12 15L12 5C12 4 14 4 14 5M12 5C3 5 3 15 12 15M5 10C0 10 6 19 1 19M15 7 19 7M15 13 19 13" ${s_sw.value} ${fn} ${sl_none}/>`,
        unplug: `<path d="M14 5 14 15C14 16 12 16 12 15L12 5C12 4 14 4 14 5M12 5C3 5 3 15 12 15M5 10C0 10 6 19 1 19M15 7 19 7M15 13 19 13M2 1 6 6M16 19 14 16.405M7.609 8.008 10.637 11.989" ${s_sw.value} ${fn} ${sl_none}/>`,
        spinner1: `<path d="M10 1A1 1 0 0010 19M10 17A1 1 0 0010 3M10 5A1 1 0 0010 15M10 13A1 1 0 0010 7M10 9A1 1 0 0010 11" ${s_sw.value} ${fn} ${sl_none}/>`,
        spinner2: `<path d="M10 1A1 1 0 0010 19M-3 0" ${s_sw.value} ${fn} ${sl_none}/>`,
        spinner3: `<path d="M10 1 10 4M1 10 4 10M10 19 10 16M19 10 16 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        spinner4: `<path d="M10 1 10 2M1 10 2 10M10 19 10 18M19 10 18 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        magnify: `<path d="M8 1A1 1 0 008 15 1 1 0 008 1M12.95 12.95 19 19" ${s_sw.value} ${fn} ${sl_none}/><path d="M8 4A1 1 0 008 12 1 1 0 008 4" ${fs.value} ${sn} ${op(0.1)} /><path d="M12 8A1 1 0 004 8" ${s.value} ${slr} stroke-width="${strokeWidth / 3}" ${fn} ${op(0.4)} /><path d="M8 4C7.212 3.983 5.456 4.345 4.544 6.003" ${s.value} ${slr} stroke-width="${strokeWidth / 3}" ${fn} ${op(1)} />`,
        frameLine: `<path d="M1 1 19 1 19 19 1 19 1 1M4 13 7 16 10 8 13 14 16 4" ${s_sw.value} ${fn} ${sl_none}/>`,
        pointer: `<path d="M2 2 7.015 17.998 9.611 11.614 16 18 18 16 11.486 9.595 18.302 7.431 2 2" ${s_sw.value} ${fn} ${sl_none}/>`,
        monument: `<path d="M2 6 18 6C19 6 19 8 18 8L2 8C1 8 1 6 2 6M4 6 10 1 16 6M2 17 18 17M3 8 3 17M5 8 5 17M17 8 17 17M15 8 15 17M9 8 9 17M11 8 11 17M1 19 19 19" ${s_sw.value} ${fn} ${sl_none}/>`,
        spark: `<path d="M10 1C8 8 8 8 1 10 8 12 8 12 10 19 12 12 12 12 19 10 12 8 12 8 10 1" ${fs.value} ${sn}/>`,
        doubleSpark: `<path d="M1 13C6 12 6 12 7 7 8 12 8 12 13 13 8 14 8 14 7 19 6 14 6 14 1 13M15 1C14.486 4.478 14.486 4.478 11 5 14.505 5.505 14.499 5.505 15 9 15.513 5.511 15.513 5.505 19 5 15.526 4.497 15.52 4.49 15 1" ${fs.value} ${sn}/>`,
        chartBump: `<path d="M2 1A1 1 0 002 3 1 1 0 002 1M10 1A1 1 0 0010 3 1 1 0 0010 1M18 1A1 1 0 0018 3 1 1 0 0018 1M2 9A1 1 0 002 11 1 1 0 002 9M2 17A1 1 0 002 19 1 1 0 002 17M10 9A1 1 0 0010 11 1 1 0 0010 9M18 9A1 1 0 0018 11 1 1 0 0018 9M10 17A1 1 0 0010 19 1 1 0 0010 17M18 17A1 1 0 0018 19 1 1 0 0018 17M3 2C6 2 6 10 9 10M11 10M3 10C6 10 6 2 9 2M11 2 17 2M3 18 9 18M11 18C14 18 14 10 17 10M11 10C14 10 14 18 17 18" ${s_sw.value} ${fn} ${sl_none}/>`,
        folderOpen: `<path d="M1 3C1 2 2 2 2 2L5 2C5 2 6 2 6 3L6 4C6 5 7 5 7 5L15 5C16 5 16 6 16 6M1 3 1 17C1 18 2 18 2 18L6 10 19 10 15 18 2 18M16 6 16 10" ${s_sw.value} ${fn} ${sl_none}/>`,
        folderOpenFill: `<path d="M1 3C1 2 2 2 2 2L5 2C5 2 6 2 6 3L6 4C6 5 7 5 7 5L15 5C16 5 16 6 16 6M1 3 1 17C1 18 2 18 2 18L6 11 19 11 15 18 2 18M16 6 16 11M4 14.5 4 8 13 8 13 11" ${s_sw.value} ${fn} ${sl_none}/>`,
        tag: `<path d="M2 5 2 10 10 18C10 18 12 20 14 18L18 14C20 12 18 10 18 10L10 2 5 2C3 2 2 3 2 5M5.506 5.48A1 1 0 007.504 7.496 1 1 0 005.506 5.48" ${s_sw.value} ${fn} ${sl_none}/>`,
        lightBulbOff: `<path d="M10 1A1 1 0 0010 15 1 1 0 0010 1M6.482 14.053 7 18C8 18 8 18 8 18L12 18C13 18 12 18 13 18L13.501 14.075M12 19 8 19M10 15 10 9M10 7A1 1 0 0010 9 1 1 0 0010 7" ${s_sw.value} ${fn} ${sl_none}/>`,
        lightBulbOn: `<path d="M10 1A1 1 0 0010 15 1 1 0 0010 1M6.482 14.053 7 18C8 18 8 18 8 18L12 18C13 18 12 18 13 18L13.501 14.075M12 19 8 19M10 15 10 9M10 7A1 1 0 0010 9 1 1 0 0010 7M1 1 2 2M19 1 18 2M1 15 2 14M19 15 18 14" ${s_sw.value} ${fn} ${sl_none}/>`,
        knobs: `<path d="M2 10 6 10M6 8 6 12M9 10 18 10M11 2 11 6M11 4 18 4M2 4 8 4M14 18 14 14M14 16 18 16M11 16 2 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        hierarchy: `<path d="M8 1 12 1C12 1 13 1 13 2L13 5C13 5 13 6 12 6L8 6C7 6 7 5 7 5L7 2C7 2 7 1 8 1M2 19 6 19C6 19 7 19 7 18L7 15C7 14 6 14 6 14L2 14C1 14 1 15 1 15L1 18C1 19 2 19 2 19M14 19 18 19C18 19 19 19 19 18L19 15C19 15 19 14 18 14L14 14C14 14 13 14 13 15L13 18C13 19 14 19 14 19M5 10 15 10M10 6 10 10M5 10C4 10 4 11 4 11L4 14M15 10C16 10 16 11 16 11L16 14" ${s_sw.value} ${fn} ${sl_none}/>`,
        hierarchyList: `<path d="M2 1C1 1 1 2 1 2L1 4C1 4 1 5 2 5L6 5C6 5 7 5 7 4L7 2C7 2 7 1 6 1L2 1M18 19C18 19 19 19 19 18L19 16C19 15 18 15 18 15L14 15C13 15 13 16 13 16L13 18C13 18 13 19 14 19L18 19M14 12 18 12C18 12 19 12 19 11L19 9C19 8 18 8 18 8L14 8C13 8 13 9 13 9L13 11C13 11 13 12 14 12M4 5 4 16C4 17 5 17 5 17L13 17M13 10 5 10C5 10 4 10 4 9" ${s_sw.value} ${fn} ${sl_none}/>`,
        bucketFill: `<path d="M2 2 18 2C19 2 19 5 18 5L2 5C1 5 1 2 2 2M3 5 3 16C3 17 4 18 5 18L6 18M17 5 17 16C17 17 16 18 15 18L14 18M10 18 10 9M7 12 10 9 13 12" ${s_sw.value} ${fn} ${sl_none}/>`,
        bucketEmpty: `<path d="M2 2 18 2C19 2 19 5 18 5L2 5C1 5 1 2 2 2M3 5 3 16C3 17 4 18 5 18L6 18M17 5 17 16C17 17 16 18 15 18L14 18M10 18 10 9M7 15 10 18 13 15" ${s_sw.value} ${fn} ${sl_none}/>`,
        bucket: `<path d="M2 2 18 2C19 2 19 5 18 5L2 5C1 5 1 2 2 2M3 5 3 16C3 17 4 18 5 18L14 18M17 5 17 16C17 17 16 18 15 18L14 18" ${s_sw.value} ${fn} ${sl_none}/>`,
        bucketRecycle: `<path d="M2 2 18 2C19 2 19 5 18 5L2 5C1 5 1 2 2 2M3 5 3 16C3 17 4 18 5 18L14 18M17 5 17 16C17 17 16 18 15 18L14 18M8.786 9.996 10 8 11.225 10.008M12.714 12.481 13.974 14.577 11.512 14.566M8.534 14.577 5.98 14.577 7.297 12.436" ${s_sw.value} ${fn} ${sl_none}/>`,
        listType: `<path d="M7 4 18 4M7 10 18 10M7 16 18 16" ${s_sw.value} ${fn} ${sl_none}/><path d="M2 3 4 3 4 5 2 5 2 3Z" ${fs.value} ${s.value} stroke-width="${strokeWidth / 2}" stroke-linejoin="miter"/><path ${fs.value} d="M3 9 1.8 11 4.2 11 3 9Z" ${s.value} stroke-width="${strokeWidth / 2}" stroke-linejoin="miter"/><path d="M3 14.8A1 1 0 003.002 17.2 1 1 0 002.999 14.8" ${fs.value} ${s.value} stroke-width="${strokeWidth / 2}"/>`,
        calendar: `<path d="M7 1 7 4M13 1 13 4M5 3 4 3C3 3 2 4 2 5L2 16C2 17 3 18 4 18L16 18C17 18 18 17 18 16L18 5C18 4 17 3 16 3L15 3M9 3 11 3M2 7 18 7" ${s_sw.value} ${fn} ${sl_none}/><path d="M4 10 6 10 6 11 4 11 4 10M9 10 11 10 11 11 9 11 9 10M14 10 14 11 16 11 16 10 14 10M4 14 6 14 6 15 4 15 4 14M9 14 11 14 11 15 9 15 9 14" ${s.value} stroke-width="${strokeWidth / 3}" ${fs.value} ${sl_none}/>`,
        envelope: `<path d="M3 5 17 5C18 5 18 6 18 6L18 14C18 14 18 15 17 15L3 15C2 15 2 14 2 14L2 6C2 6 2 5 3 5M3 6 10 11 17 6M3 14 8 10M12 10 17 14" ${s_sw.value} ${fn} ${sl_none}/>`,
        test: `<path d="M4 19 16 19C18 19 18 17 18 17L12 9 12 3C13 3 13 1 12 1L8 1C7 1 7 3 8 3L8 9 2 17C2 17 2 19 4 19" ${s_sw.value} ${fn} ${sl_none}/><path d="M5 14C8 16 11 12 15 14L17.141 16.847C17.156 17.64 17.07 18.004 16 18L4 18C3.25 18.014 2.829 17.748 2.866 16.869L5 14" ${sn} ${fs.value} ${sl_none} ${op(0.4)}/><path d="M5 14C8 16 11 12 15 14" ${s.value} ${slr} stroke-width="${strokeWidth / 3}"/>`,
        sliders: `<path d="M2 4 4 4M2 10 12 10M2 16 4 16M6 2A1 1 0 006 6 1 1 0 006 2M8 4 18 4M14 8A1 1 0 0014 12 1 1 0 0014 8M16 10 18 10M6 14A1 1 0 006 18 1 1 0 006 14M8 16 18 16" ${s_sw.value} ${fn} ${sl_none}/>`,
        checkList: `<path d="M9 5 18 5M9 11 18 11M9 17 18 17M6 2 4 6 2 4M2 10 4 12 6 8M2 16 4 18 6 14" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        bug: `<path d="M8 2A1 1 0 0012 2M13 7A1 1 0 007 7M7 7C7 8 8 8 8 8L12 8C13 8 13 7 13 7M7 6C6 6 5 7 5 8L5 13C5 15 6 17 9 17L11 17C14 17 15 15 15 13L15 8C15 7 14 6 13 6M10 8 10 17M5 11 2 11M15 11 18 11M5 14C4 14 2 15 2 18M15 14C16 14 18 15 18 18M5 8C4 8 2 7 2 5M15 8C16 8 18 7 18 5" ${s_sw.value} ${fn} ${sl_none}/>`,
        microscope: `<path d="M9 3C9 3 9 2 8 2L7 2C7 2 6 2 6 3 5 3 5 4 5 4L5 7C5 8 6 8 6 8L9 8C9 8 10 8 10 7L10 4C10 4 10 3 9 3M6 10 9 10M5 16 10 16M2 18 18 18M10 18C19 18 19 5 10 5M7 11 8 11" ${s_sw.value} ${fn} ${sl_none}/>`,
        pi: `<path d="M1 8C2 3 4 2 5 2L18 2C19 2 19 4 18 4L15 4C15 4 14 8 14 14 14 18 17 17 19 14 18 21 12 20 12 14 12 9 13 4 13 4L9 4C8 9 7 17 7 17 6 20 3 19 3 17 7 13 7 4 7 4 4 4 3 5 1 8" ${sl_none} ${fs.value}/>`,
        export: `<path d="M10 2 10 12M7 5 10 2 13 5M5 8 4 8C3 8 3 9 3 9L3 17C3 17 3 18 4 18L16 18C16 18 17 18 17 17L17 9C17 9 17 8 16 8L15 8" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        file: `<path d="M4 2 4 18 16 18 16 7 11 2 4 2M11 2 11 7 16 7" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        filePlus: `<path d="M4 2 4 18 16 18 16 7 11 2 4 2M11 2 11 7 16 7M10 10 10 14M8 12 12 12" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        fileSearch: `<path d="M4 2 4 18 7 18M15 13A1 1 0 0010 16 1 1 0 0015 13M15 16 18 18M16 9 16 7 11 2 4 2M11 2 11 7 16 7" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        recycle: `<path d="M7.5 5.5C9.5 2.5 11.5 2.5 14.5 7.5M16.5 10.5C17.5 12.5 17.5 15.5 11.5 15.5M7.5 15.5C3.5 15.5 2.5 13.5 5.5 8.5M11.5 7.5 14.5 7.5 14.5 4.5M13.137 12.893 11.5 15.5 13.5 17.5M2.5 9.5 5.5 8.5 6.5 11.5" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        fileSvg: `<path d="M18 10 18 7 13 2M13 2 13 7 18 7M13 2 2 2 2 10" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/><text x="10" y="18.5" ${fs.value} text-anchor="middle" font-size="9" font-family="Arial">SVG</text>`,
        filePdf: `<path d="M18 10 18 7 13 2M13 2 13 7 18 7M13 2 2 2 2 10" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/><text x="10" y="18.5" ${fs.value} text-anchor="middle" font-size="9" font-family="Arial">PDF</text>`,
        fileCsv: `<path d="M18 10 18 7 13 2M13 2 13 7 18 7M13 2 2 2 2 10" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/><text x="10" y="18.5" ${fs.value} text-anchor="middle" font-size="9" font-family="Arial">CSV</text>`,
        filePng: `<path d="M18 10 18 7 13 2M13 2 13 7 18 7M13 2 2 2 2 10" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/><text x="10" y="18.5" ${fs.value} text-anchor="middle" font-size="9" font-family="Arial">PNG</text>`,
        link: `<path d="M7 13 13 7M6 9C1 14 6 19 11 14M9 6C14 1 19 6 14 11" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        puzzle: `<path d="M16.579 9.304H15.402V6.167C15.402 5.296 14.696 4.598 13.833 4.598H10.696V3.421A1.961 1.961 0 008.736 1.461 1.961 1.961 0 006.774 3.421V4.598H3.638A1.569 1.569 0 002.069 6.167V9.147H3.246C4.421 9.147 5.362 10.088 5.362 11.264 5.362 12.441 4.421 13.382 3.246 13.382H2.069V16.362A1.569 1.569 0 003.638 17.931H6.618V16.754C6.618 15.579 7.559 14.638 8.736 14.638 9.912 14.638 10.853 15.579 10.853 16.754V17.931H13.833A1.569 1.569 0 0015.402 16.362V13.226H16.579A1.961 1.961 0 0018.539 11.264 1.961 1.961 0 0016.579 9.304Z" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        puzzleFill: `<path d="M16.579 9.304H15.402V6.167C15.402 5.296 14.696 4.598 13.833 4.598H10.696V3.421A1.961 1.961 0 008.736 1.461 1.961 1.961 0 006.774 3.421V4.598H3.638A1.569 1.569 0 002.069 6.167V9.147H3.246C4.421 9.147 5.362 10.088 5.362 11.264 5.362 12.441 4.421 13.382 3.246 13.382H2.069V16.362A1.569 1.569 0 003.638 17.931H6.618V16.754C6.618 15.579 7.559 14.638 8.736 14.638 9.912 14.638 10.853 15.579 10.853 16.754V17.931H13.833A1.569 1.569 0 0015.402 16.362V13.226H16.579A1.961 1.961 0 0018.539 11.264 1.961 1.961 0 0016.579 9.304Z" ${sl_none} ${fs.value} ${op(1)}/>`,
        externalLink: `<path d="M19 1 10 10M15 1 19 1 19 5M10 3 5 3C4 3 3 4 3 5L3 15C3 16 4 17 5 17L15 17C16 17 17 16 17 15L17 10" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        plotLine: `<path d="M4 14A1 1 0 004 18 1 1 0 004 14M16 2A1 1 0 0016 6 1 1 0 0016 2M14.586 5.414 5.42 14.592" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        plotArrow: `<path d="M4 14A1 1 0 004 18 1 1 0 004 14M17 3 5.42 14.592M13 3 17 3 17 7" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        accessibility: `<path d="M10 1A1 1 0 0010 5 1 1 0 0010 1M10 7 4 4A1 1 0 003 6L8 9 8 11 4 17A1 1 0 006 18L10 13 14 18A1 1 0 0016 17L12 11 12 9 17 6A1 1 0 0016 4L10 7" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        npmx: `<path d="M17 2 11 18 9 18 15 2 17 2M3 13 3 16 6 16 6 13 3 13" ${sl_none} ${fs.value} ${op(1)}/>`,
        clankerCrazy: `<path d="M2 2 18 2 18 19 2 19 2 2M2 12 10 13 18 12M10 13 10 19M6 12.5 6 19M14 12.5 14 19M6 5A1 1 0 006 9 1 1 0 006 5M13 5A1 1 0 0013 10 1 1 0 0013 5M1 5 1 10M19 5 19 10M7 1 13 1" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
        clankerNasty: `<path d="M2 2 18 2 18 19 2 19 2 2M2 13 10 11 18 13M10 11 10 19M6 12 6 19M14 12 14 19M1 5 1 10M19 5 19 10M4 5 8 7M12 7 16 5M7 1 13 1" ${sl_none} ${s_sw.value} ${fn} ${op(1)}/>`,
    };

    return map[name] || '';
}

const slots = useSlots();

const expVNode = computed(() => {
    const nodes = slots.exp?.() || [];
    return nodes[0] || null;
});

const subVNode = computed(() => {
    const nodes = slots.sub?.() || [];
    return nodes[0] || null;
});

const hasExp = computed(() => !!expVNode.value);
const hasSub = computed(() => !!subVNode.value);
const hasBadge = computed(() => hasExp.value || hasSub.value);

const expProps = computed(() => {
    const p = expVNode.value?.props || {};
    return {
        name: p.name,
        stroke: p.stroke ?? props.stroke,
        strokeWidth: p['stroke-width'] ?? p.strokeWidth ?? props.strokeWidth,
        size: typeof p.size === 'number' ? p.size : null,
        isSpin: !!p.isSpin || !!p['is-spin'],
        spinDuration: p.spinDuration || p['spin-duration'] || '1s',
    };
});

const subProps = computed(() => {
    const p = subVNode.value?.props || {};
    return {
        name: p.name,
        stroke: p.stroke ?? props.stroke,
        strokeWidth: p['stroke-width'] ?? p.strokeWidth ?? props.strokeWidth,
        size: typeof p.size === 'number' ? p.size : null,
        isSpin: !!p.isSpin || !!p['is-spin'],
        spinDuration: p.spinDuration || p['spin-duration'] || '1s',
    };
});

function spinAnimate(cx, cy, duration = '0.5s') {
    return `
        <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 ${cx} ${cy}"
            to="360 ${cx} ${cy}"
            dur="${duration}"
            repeatCount="indefinite"
        />
    `;
}

const nominalCenter = computed(() => {
    const vb = baseViewBox.value;
    return {
        cx: vb.minX + vb.width / 2,
        cy: vb.minY + vb.height / 2,
    };
});

const baseViewBox = computed(() => {
    const parts = String(props.viewBox).trim().split(/\s+/).map(Number);
    const [minX, minY, width, height] =
        parts.length === 4 ? parts : [0, 0, 20, 20];
    return { minX, minY, width, height };
});

const expScale = computed(() => {
    const basePx = props.size || 24;
    const expPx = expProps.value.size || basePx * 0.6;
    return expPx / basePx;
});

const subScale = computed(() => {
    const basePx = props.size || 24;
    const subPx = subProps.value.size || basePx * 0.6;
    return subPx / basePx;
});

const combinedViewBox = computed(() => {
    const vb = baseViewBox.value;
    const extendTop = hasExp.value ? vb.height * expScale.value : 0;
    const extendRightExp = hasExp.value ? vb.height * expScale.value : 0;
    const extendRightSub = hasSub.value ? vb.height * subScale.value : 0;
    const extendRight = Math.max(extendRightExp, extendRightSub);
    const extendBottom = hasSub.value ? vb.height * subScale.value : 0;
    const minX = vb.minX;
    const minY = vb.minY - extendTop;
    const width = vb.width + extendRight;
    const height = vb.height + extendTop + extendBottom;
    return `${minX} ${minY} ${width} ${height}`;
});

const expTransform = computed(() => {
    const vb = baseViewBox.value;
    const baseRight = vb.minX + vb.width;
    const baseTop = vb.minY;
    const expNominal = vb.height;
    const expSize = expNominal * expScale.value;
    const tx = baseRight;
    const ty = baseTop;
    const s = expSize / expNominal;
    return `translate(${tx} ${ty}) translate(${-expSize / 6} ${-expSize * 0.8}) scale(${s})`;
});

const subTransform = computed(() => {
    const vb = baseViewBox.value;
    const baseRight = vb.minX + vb.width;
    const baseBottom = vb.minY + vb.height;
    const subNominal = vb.height;
    const subSize = subNominal * subScale.value;
    const tx = baseRight;
    const ty = baseBottom;
    const s = subSize / subNominal;
    return `translate(${tx} ${ty}) translate(${-subSize / 6} ${subSize * -0.2}) scale(${s})`;
});

const singleIconHtml = computed(() => {
    return getIconPath(props.name, {
        stroke: props.stroke,
        strokeWidth: props.strokeWidth,
    });
});

function stripStrokeAttributes(svgString) {
    return String(svgString)
        .replace(/\sstroke="[^"]*"/g, '')
        .replace(/\sstroke-width="[^"]*"/g, '')
        .replace(/\sstroke-linecap="[^"]*"/g, '')
        .replace(/\sstroke-linejoin="[^"]*"/g, '');
}

const polyIconHtml = computed(() => {
    const base = getIconPath(props.name, {
        stroke: props.stroke,
        strokeWidth: props.strokeWidth,
    });

    let expBlock = '';
    if (hasExp.value && expProps.value.name) {
        const expRaw = getIconPath(expProps.value.name, {
            stroke: expProps.value.stroke,
            strokeWidth: expProps.value.strokeWidth,
        });
        const expClean = stripStrokeAttributes(expRaw);

        const { cx, cy } = nominalCenter.value;

        expBlock = `
        <g transform="${expTransform.value}">
        <g
            stroke="${expProps.value.stroke}"
            stroke-width="${expProps.value.strokeWidth}"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
        >
            ${expProps.value.isSpin ? spinAnimate(cx, cy, expProps.value.spinDuration) : ''}
            ${expClean}
        </g>
        </g>
    `;
    }

    let subBlock = '';
    if (hasSub.value && subProps.value.name) {
        const subRaw = getIconPath(subProps.value.name, {
            stroke: subProps.value.stroke,
            strokeWidth: subProps.value.strokeWidth,
        });
        const subClean = stripStrokeAttributes(subRaw);

        const { cx, cy } = nominalCenter.value;

        subBlock = `
        <g transform="${subTransform.value}">
            <g
                stroke="${subProps.value.stroke}"
                stroke-width="${subProps.value.strokeWidth}"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
            >
                ${subProps.value.isSpin ? spinAnimate(cx, cy, subProps.value.spinDuration) : ''}
                ${subClean}
            </g>
        </g>
    `;
    }

    return `${base}${expBlock}${subBlock}`;
});

const svgSize = computed(() => {
    if (!hasBadge.value) return props.size;
    if ((hasExp.value && !hasSub.value) || (hasSub.value && !hasExp.value)) {
        return props.size * 1.6;
    }
    return props.size * 2.2;
});
</script>

<template>
    <svg
        v-if="hasBadge"
        data-cy="base-icon"
        :xmlns="XMLNS"
        :class="{ 'spin ': isSpin }"
        :viewBox="combinedViewBox"
        :height="svgSize"
        :width="svgSize"
        style="background: transparent; display: block"
        v-html="polyIconHtml"
    />

    <svg
        v-else
        data-cy="base-icon"
        :xmlns="XMLNS"
        :class="{ 'spin ': isSpin }"
        :viewBox="viewBox"
        :height="size"
        :width="size"
        v-html="singleIconHtml"
        style="background: transparent"
    />
</template>

<style scoped>
.spin {
    animation: smartspin v-bind(spinD) infinite linear;
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

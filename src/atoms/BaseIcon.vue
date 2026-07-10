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

const fs = (o) => `fill="${o}"`;
const fn = 'fill="none"';
const sn = 'stroke="none"';
const op = (o) => `style="opacity:${o}"`;

const blur = (o) => {
    const radii = [1, 0.7, 0.5, 0.3, 0.15];
    const center = radii.length * 2;
    const coords = Array.from({ length: center }, (_, i) => 1 + i * 2);

    return coords
        .flatMap((y) =>
            coords.map((x) => {
                const layer =
                    (Math.max(Math.abs(x - center), Math.abs(y - center)) - 1) /
                    2;

                return `<circle ${fs(o)} ${sn} cx="${x}" cy="${y}" r="${radii[layer]}" />`;
            }),
        )
        .join('');
};

const rrPaths = {
    annotation: `M10 17a1 1 0 0 0 0 2 1 1 0 0 0 0-2m-9 1h6m6 0h6M4 1h12v9h-4l-2 4M7 4h3M7 7h6M4 1v9h4l2 4`,
    chartAgePyramid: `M2 15v2h7v-2zm9 0v2h7v-2zm-2-2H3v-2h6zm2-2v2h6v-2zM9 9H4V7h5zm2-2v2h5V7zM9 5H6V3h3zm2-2v2h3V3z`,
    chartLine: `M1 1v18h18M4 13c1 3 2 3 2 3 3 0 1-9 4-9 1 0 3 5 3 5 1 2 3 2 4-9`,
    dashboard: `M1 5a1 1 0 0 0 8 0 1 1 0 0 0-8 0m4-4v4h4M1 15h5m-5 3h7m5-9c0 1 0 1 1 1s1 0 1-1V6c0-1 0-1-1-1s-1 0-1 1zm4 0c0 1 0 1 1 1s1 0 1-1V4c0-1 0-1-1-1s-1 0-1 1zm-8 3 3 6 2-3 3 1 2-3M1 12h3`,
    csv: `M4 1Q1 1 1 4v12q0 3 3 3h12q3 0 3-3V6c-4 0-5-1-5-5Zm3 10c0-1 0-2-1-2H5c-1 0-1 1-1 2v3c0 1 0 2 1 2h1c1 0 1-1 1-2m5-3c0-1 0-2-1-2h-1c-1 0-1 1-1 2 0 2 3 1 3 3 0 1 0 2-1 2h-1c-1 0-1-1-1-2m5-5 1 7 1-7`,
    star: `m1.333 8.226 5.976-.895L9.96 1.9l2.7 5.406 5.983.843-4.308 4.237 1.047 5.951-5.36-2.788-5.337 2.836.995-5.96-4.345-4.201`,
    fullscreen: `M1 6V4q0-3 3-3h2m8 0h2q3 0 3 3v2m0 8v2q0 3-3 3h-2m-8 0H4q-3 0-3-3v-2m8-5L5 5m6 4 4-4m-4 6 4 4m-6-4-4 4m0-3v3h3m4 0h3v-3m0-4V5h-3M8 5H5v3`,
    exitFullscreen: `M1 6V4q0-3 3-3h2m8 0h2q3 0 3 3v2m0 8v2q0 3-3 3h-2m-8 0H4q-3 0-3-3v-2m7-6L4 4m8 4 4-4m-4 8 4 4m-8-4-4 4m1-4h3v3m4 0v-3h3m0-4h-3V5M8 5v3H5`,
    moodEmbarrassed: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 3c3-2 6 3 10 0M5 7a1 1 0 0 0 3 0 1 1 0 0 0-3 0m7 0a1 1 0 0 0 3 0 1 1 0 0 0-3 0`,
    moodSurprised: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4-3a1 1 0 0 0 3 0 1 1 0 0 0-3 0m7 0a1 1 0 0 0 3 0 1 1 0 0 0-3 0m-2 5a1 1 0 0 0 0 3 1 1 0 0 0 0-3`,
    moodWink: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 1c2 4 6 4 10 2m-3-6a1 1 0 0 0 3 0 1 1 0 0 0-3 0M5 7h3`,
    moodLaughing: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 0c0 7 10 7 10 1zm7-3c1-1 2 0 3 0M5 6c1 0 2-1 3 1`,
    circleCancel: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m5-4 8 8m0-8-8 8`,
    circleCheck: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 0 4 4m6-7-6 7`,
    circleExclamation: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m9-5v5m0 3a1 1 0 0 0 0 2 1 1 0 0 0 0-2`,
    circleQuestion: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m9-5c4 0 4 5 0 5m0 3a1 1 0 0 0 0 2 1 1 0 0 0 0-2M7 7c0-1 1-2 3-2`,
    refresh: `M2 10a1 1 0 0 0 15 0c0-5-5-8-10-6l3-3M7 4l3 3`,
    chartTreemap: `M1 1h18v18H1Zm9 0v18m-9-6h9m0-3h9m-4 0v9`,
    kpi: `M2 5v10M6 5l-4 5 4 5m2 0V5h2m0 5a1 1 0 0 0 0-5m0 5H8m10-5h-4m0 10h4M16 5v10M1 3V2c0-1 1-1 1-1h16s1 0 1 1v1M1 17v1c0 1 1 1 1 1h16c1 0 1-1 1-1v-1`,
    kpiBox: `M1 3c0-1 1-2 2-2h14c1 0 2 1 2 2v14c0 1-1 2-2 2H3c-1 0-2-1-2-2zm3 10h5m7 0h-5m-7 3h12M4 4v6m3-6L4 7l3 3m2 0V4h2m0 3a1 1 0 0 0 0-3m0 3H9m7 3h-2m0-6h2m-1 0v6`,
    tooltip: `m8 15 2 4 2-4h6s1 0 1-1V2c0-1-1-1-1-1H2S1 1 1 2v12c0 1 1 1 1 1zM4 6h7m-7 4h3m2 0h7`,
    tooltipDisabled: `m8 15 2 4 2-4h6s1 0 1-1V2c0-1-1-1-1-1H2S1 1 1 2v12c0 1 1 1 1 1zM7 5l6 6m-6 0 6-6`,
    func: `m17 7-4 6m0-6 4 6m-5-8s-1 0-1 1v8c0 1 1 1 1 1m6-10c1 0 1 1 1 1v8c0 1-1 1-1 1M1 19c1 0 2 0 3-2L6 3c0-1 1-2 2-2h2m-5 9h2`,
    clipBoard: `M6 2c0-1 1-1 1-1h6c1 0 1 1 1 1s0 1-1 1H7S6 3 6 2m0 0H3C2 2 1 3 1 4v13c0 1 1 2 2 2h14c1 0 2-1 2-2V4c0-1-1-2-2-2h-3M5 7h4m-4 4h4m2 0h4M5 15h10m-4-8h4`,
    clipboardLine: `M6 2c0-1 1-1 1-1h6c1 0 1 1 1 1s0 1-1 1H7S6 3 6 2m0 0H3C2 2 1 3 1 4v13c0 1 1 2 2 2h14c1 0 2-1 2-2V4c0-1-1-2-2-2h-3M5 15l3-5 4 2 3-6`,
    clipboardDonut: `M6 2c0-1 1-1 1-1h6c1 0 1 1 1 1s0 1-1 1H7S6 3 6 2m0 0H3C2 2 1 3 1 4v13c0 1 1 2 2 2h14c1 0 2-1 2-2V4c0-1-1-2-2-2h-3m-4 3a1 1 0 0 0 0 11 1 1 0 0 0 0-11m0 3a1 1 0 0 0 0 5 1 1 0 0 0 0-5m0-3v3m-4.9 5 2.6-1.4`,
    clipboardBar: `M6 2c0-1 1-1 1-1h6c1 0 1 1 1 1s0 1-1 1H7S6 3 6 2m0 0H3C2 2 1 3 1 4v13c0 1 1 2 2 2h14c1 0 2-1 2-2V4c0-1-1-2-2-2h-3M5 15v-4h5v4zm5-4V7h5v8h-5`,
    clipboardVariable: `M6 2c0-1 1-1 1-1h6c1 0 1 1 1 1s0 1-1 1H7S6 3 6 2m0 0H3C2 2 1 3 1 4v13c0 1 1 2 2 2h14c1 0 2-1 2-2V4c0-1-1-2-2-2h-3M5 8l4 5m0-5-4 5m6-5 2.1 2.3M15 8l-4 5`,
    triangle: `M10 3 1 17h18z`,
    square: `M2 2v16h16V2z`,
    diamond: `m10 1-9 9 9 9 9-9z`,
    pentagon: `M10 1 1 9l4 10h11l3-10Z`,
    hexagon: `M10 1 2 6v8l8 5 8-5V6Z`,
    circle: `M10 1a1 1 0 0 0 0 18 1 1 0 0 0 0-18`,
    sigma: `m16 5 2-3H2l7 8-7 8h16l-2-3`,
    mu: `M15 2c0 10-2 10-5 10-5 0-5 0-5-10m0 0v16m8.5-7.2C14 12 15 12 15 12`,
    lambda: `M2 5c0-3 2-3 2-3 6 0 6 16 14 16m-8-8-8 8`,
    copy: `M18 16c0 1-1 2-2 2H8c-1 0-2-1-2-2V8c0-1 1-2 2-2h8c1 0 2 1 2 2zM6 14H4c-1 0-2-1-2-2V4c0-1 1-2 2-2h8c1 0 2 1 2 2v2`,
    cursor: `M6 10a1 1 0 0 0 8 0 1 1 0 0 0-8 0m-5 0h5m8 0h5m-9-9v5m0 8v5m0-11v4m-2-2h4`,
    copyLeft: `M10 2a1 1 0 0 0 0 16 1 1 0 0 0 0-16m0 12a1 1 0 0 0 0-8S8 6 7 8m3 6s-2 0-3-2`,
    stack: `M10 3 2 6l8 3 8-3zM7 8l-5 2 8 3 8-3-5-2m-6 4-5 2 8 3 8-3-5-2`,
    unstack: `M10 3 2 6l8 3 8-3zM7 8l-5 2 8 3 8-3-5-2m-6 4-5 2 8 3 8-3-5-2M2 2l16 16m0-16L2 18`,
    window: `M2 4v12c0 1 1 2 2 2h12c1 0 2-1 2-2V4c0-1-1-2-2-2H4C3 2 2 3 2 4m2 1v3c0 1 1 1 1 1h3c1 0 1-1 1-1V5c0-1-1-1-1-1H5C4 4 4 5 4 5m12 0v3c0 1-1 1-1 1h-3s-1 0-1-1V5c0-1 1-1 1-1h3s1 0 1 1M5 11s-1 0-1 1v3c0 1 1 1 1 1h3s1 0 1-1v-3c0-1-1-1-1-1zm7 0c-1 0-1 1-1 1v3s0 1 1 1h3s1 0 1-1v-3c0-1-1-1-1-1zM6 6`,
    chartParallelCoordinatePlot: `M2 2v16m8-16v16m8-16v16M2 4l8-1h8M2 10l8-4 8 2M2 16h8l8-4`,
    restart: `M3 10a1 1 0 0 0 14 0c0-4-3-7-7-7V2L7 4m-2 6a1 1 0 0 0 10 0c0-3-2-5-5-5v1L7 4m-4 6h2`,
    lap: `M3 10a1 1 0 0 0 14 0 1 1 0 0 0-14 0m5-8h4M5 3l1 1m9-1-1 1m-4 3v3l3 3`,
    carouselTable: `M16 2v16M14 4l2-2 2 2m-4 12 2 2 2-2M3 2h8c1 0 1 1 1 1v14c0 1-1 1-1 1H3c-1 0-1-1-1-1V3s0-1 1-1M2 6h10M2 9h10M2 12h10M2 15h10M7 2v16M4 4h1m4 0h1`,
    trash: `M7 18h6c2 0 2 0 3-12H4c1 12 1 12 3 12M3 4h14M8 2h4m-2 6v7M7 8l.518 7.01M13 8l-.546 6.984`,
    chartFunnel: `M9 18c1 1 2 0 2 0l1-8 6-4V3C18 1 2 1 2 3v3l6 4zM2 3C1 6 18 6 18 3`,
    chartTableSparkline: `M1 2v2m0 5v2s0 1 1 1h4s1 0 1-1V9c0-1-1-1-1-1H2C1 8 1 9 1 9m0 7v2s0 1 1 1h4c1 0 1-1 1-1v-2c0-1-1-1-1-1H2c-1 0-1 1-1 1M9 3c2-2 3-2 5 0s3 2 5 0M9 10c2 2 3 2 5 0s3-2 5 0M9 17c2-2 3-2 5 0s3 2 5 0M1 4s0 1 1 1h4s1 0 1-1V2c0-1-1-1-1-1H2S1 1 1 2`,
    chartCirclePack: `M10 7a1 1 0 0 0 0 6 1 1 0 0 0 0-6M5 5a1 1 0 0 0 2.716 3.039A1 1 0 0 0 5 5m8-1a1 1 0 0 0-1.646 3.322A1 1 0 0 0 13 4m-4.494 8.628a1 1 0 0 0-3.456 4.127 1 1 0 0 0 3.456-4.127m6.459-5.64a1 1 0 0 0-1.43 2.77 1 1 0 0 0 1.43-2.77M16 11a1 1 0 0 0-2.916 3.742A1 1 0 0 0 16 11`,
    home: `m2 10 8-8 8 8M4 10v7c0 1 0 1 1 1h3v-6h4v6h3c1 0 1 0 1-1v-7m-8 8`,
    icons: `m1 9 4-7 4 7zm11 0V2h7v7zm-7 3c-5 0-5 7 0 7s5-7 0-7m7 0 7 7m0-7-7 7`,
    robot: `M2 2h16v16H2zm4 3a1 1 0 0 0 0 3 1 1 0 0 0 0-3m8 0a1 1 0 0 0 0 3 1 1 0 0 0 0-3M1 4v5m18-5v5M5 11c1 5 9 5 10 0M7 1h6`,
    computer: `M3 2S2 2 2 3v10s0 1 1 1h14c1 0 1-1 1-1V3c0-1-1-1-1-1zm6 12v2m2-2v2m-3 1c.333-.333.667-.667 1-2q1 1.5 2 0c.333 1.333.667 1.667 1 2H7c-1 0-2 1-2 2h10c0-1-1-2-2-2h-1M6 5 4 8l2 3m8-6 2 3-2 3m-2-7-4 8`,
    htmlTag: `m6 5-5 5 5 5m8-10 5 5-5 5m-7 3 6-16`,
    curlyBrackets: `M5 2Q2 2 2 5l.35 2.988C2 9 1 9 1 10s1 1 1.396 1.949L2 15q0 3 3 3M15 2q3 0 3 3l-.389 3.035C18 9 19 9 19 10s-1 1-1.389 2.008L18 15q0 3-3 3`,
    curlySpread: `M5 2Q2 2 2 5l.35 2.988C2 9 1 9 1 10s1 1 1.396 1.949L2 15q0 3 3 3M15 2q3 0 3 3l-.389 3.035C18 9 19 9 19 10s-1 1-1.389 2.008L18 15q0 3-3 3m-5-9a1 1 0 0 0 0 2 1 1 0 0 0 0-2M6 9a1 1 0 0 0 0 2 1 1 0 0 0 0-2m8 0a1 1 0 0 0 0 2 1 1 0 0 0 0-2`,
    world: `M10 1a1 1 0 0 0 0 18 1 1 0 0 0 0-18c-7 3-7 15 0 18m0-18c7 3 7 15 0 18m0-18v18m-9-9h18M1 10`,
    eye: `M1 10q9-9 18 0-9 9-18 0m9-3a1 1 0 0 0 0 6 1 1 0 0 0 0-6m0 2a1 1 0 0 0 0 2 1 1 0 0 0 0-2`,
    chartRidgeline: `m1 15 3 1 3-2 3 4 4-8 3 6 2-1M1 12l5-1 4 1 4-6m0 0 3 5 2 1M1 9l5-1h3l5-7 3 5h2`,
    chartChord: `M9 1Q2 2 1 9m0 2q1 7 8 8m2 0q7-1 8-8m0-2q-1-7-8-8M5.683 2.021C9 6 13 4 14.893 2.322M2.421 4.987c12.048 2.15 13.124 7.229 14.94 10.343M4.83 17.48c4.19-3.707 6.377-3.262 10.603-.111M1.976 14.033c9.231-1.298 13.976-4.968 15.237-9.64`,
    tableDialogOpen: `M1 4V1m9 4v10m-5-3.364 10 .019M5 8.396l10 .016M4 4 1 1h3m0 15-3 3m0-3v3h3m12-3 3 3m-3 0h3v-3M16 4l3-3m-3 0h3v3M5 10V6s0-1 1-1h8c1 0 1 1 1 1v8c0 1-1 1-1 1H6s-1 0-1-1z`,
    tableDialogClose: `M4 4 1 1m3 0v3H1m15 0 3-3m-3 0v3h3m-3 12 3 3m0-3h-3v3M4 16l-3 3m0-3h3v3m6-14v10m-5-3.364 10 .019M5 8.396l10 .016M5 10V6s0-1 1-1h8c1 0 1 1 1 1v8c0 1-1 1-1 1H6s-1 0-1-1z`,
    minimap: `M1 3c0-2 3-2 3 0v14c0 2-3 2-3 0zm3 0h12M4 17h12V3c0-2 3-2 3 0v14c0 2-3 2-3 0M6 11l2 3 1-6 3 3 2-6`,
    move: `M10 2v6m0 4v6m-2-8H2m10 0h6M7 4l3-2 3 2M4 7l-2 3 2 3m3 3 3 2 3-2m3-3 2-3-2-3`,
    resize: `M2 12v5s0 1 1 1h5s1 0 1-2v-4c0-1-1-1-1-1H3s-1 0-1 1M6 2h3m2 0h3m2 0h1c1 0 1 1 1 1v1M4 2H3S2 2 2 3v1m0 2v3m16-3v3m0 7v1c0 1-1 1-1 1h-1m-2 0h-3m7-7v3`,
    selectAndGroup: `M2 1h1c1 0 1 1 1 1v1s0 1-1 1H2S1 4 1 3V2c0-1 1-1 1-1m15 0h1c1 0 1 1 1 1v1c0 1-1 1-1 1h-1s-1 0-1-1V2c0-1 1-1 1-1M2 19h1c1 0 1-1 1-1v-1s0-1-1-1H2s-1 0-1 1v1c0 1 1 1 1 1m15 0h1s1 0 1-1v-1s0-1-1-1h-1s-1 0-1 1v1c0 1 1 1 1 1M4 2.497l12-.002M2.498 4l-.012 12M17.508 4l.019 12M4 17.49l12 .009M6 6v6h6V6zm2 6v2h6V8h-2`,
    printer: `M6 13v4c0 1 1 1 1 1h6s1 0 1-1v-4s0-1-1-1H7c-1 0-1 1-1 1m-1 2H3s-1 0-1-1V9c0-1 1-1 1-1h14c1 0 1 1 1 1v5c0 1-1 1-1 1h-2M6 7V4c0-1 1-1 1-1h6c1 0 1 1 1 1v3`,
    save: `M3 2h11l4 4v11c0 1-1 1-1 1H3s-1 0-1-1V3s0-1 1-1m2 0v2c0 1 1 1 1 1h6s1 0 1-1V2m-3 7a1 1 0 0 0 0 4 1 1 0 0 0 0-4`,
    svg: `M4 1Q1 1 1 4v12q0 3 3 3h12q3 0 3-3V6c-4 0-5-1-5-5Zm4.458 8.052L10 16l1.519-6.97M16 11c0-3-3.005-2.19-3 0v3c0 3 2.99 2.299 3 0v-1h-1m-8.018-2.714C6.564 8.238 3.921 8.788 4 11c.757 2.259 2.806.607 3 3 0 3-3.146 2.299-3 0`,
    zoomUnlock: `M10 1a1 1 0 0 0 0 18 1 1 0 0 0 0-18m6.36 15.368L19 19M6 10v4c0 1 1 1 1 1h6s1 0 1-1v-4s0-1-1-1H7c-1 0-1 1-1 1m7-1a1 1 0 0 0-4-4m1 6v2`,
    zoomLock: `M10 1a1 1 0 0 0 0 18 1 1 0 0 0 0-18m6.36 15.368L19 19M6 10v4c0 1 1 1 1 1h6s1 0 1-1v-4s0-1-1-1H7c-1 0-1 1-1 1m4 1v2m3-4c1-6-7-6-6 0`,
    lock: `M16 8C16-1 4-1 4 8M3 8h14c1 0 1 1 1 1v9c0 1-1 1-1 1H3s-1 0-1-1V9s0-1 1-1m7 3a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0 2v3`,
    unlock: `M16 8c2-7-6-8-8-6M3 8h14c1 0 1 1 1 1v9c0 1-1 1-1 1H3s-1 0-1-1V9s0-1 1-1m7 3a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0 2v3`,
    triangleInformation: `M4 18h12c1 0 4 0 3-3L12 3c-1-2-3-2-4 0L1 15c-1 3 2 3 3 3m6-3v-5m0-4a1 1 0 0 0 0 2 1 1 0 0 0 0-2`,
    triangleExclamation: `M4 18h12c1 0 4 0 3-3L12 3c-1-2-3-2-4 0L1 15c-1 3 2 3 3 3m6-7V5m0 8a1 1 0 0 0 0 2 1 1 0 0 0 0-2`,
    direction: `M18 8C17-1 3-1 2 9m0 3c1 9 15 9 16-1M1 6l1 3 3-2m10 6 3-2 1 3`,
    chartDag: `M8 2h4c1 0 1 1 1 1v1s0 1-1 1H8S7 5 7 4V3s0-1 1-1m-6 8v1s0 1 1 1h4s1 0 1-1v-1s0-1-1-1H3c-1 0-1 1-1 1m10 0v1s0 1 1 1h4s1 0 1-1v-1s0-1-1-1h-4c-1 0-1 1-1 1m-9 6h4c1 0 1 1 1 1v1s0 1-1 1H3c-1 0-1-1-1-1v-1s0-1 1-1m9 1v1s0 1 1 1h4c1 0 1-1 1-1v-1c0-1-1-1-1-1h-4c-1 0-1 1-1 1M10 5c0 3-5 1-5 4m5-4c0 3 5 1 5 4M5 12v4m10-4v4`,
    chartGeo: `M10 14c3-5 4-5 4-8a1 1 0 0 0-8 0c0 3 2 4 4 8m0-10a1 1 0 0 0 0 4 1 1 0 0 0 0-4m-3 8H4l-3 7h18l-3-7h-3`,
    revert: `M10 19a1 1 0 0 0 0-16m-8 7c0 5 4 9 8 9m3-18-3 2 2 3`,
    lineUp: `M1 1v18h18M3 17l3-4 3 2 3-5 3 3 3-10m-2.191 1.399L18 3l.992 2.387`,
    histogram: `M1 1v18h18M4 19v-7h3v7m2 0V8h3v11m2 0V4h3v15`,
    histogramUp: `M1 1v18h18M4 19v-5h3v5m2 0v-8h3v8m2 0V8h3v11M4 9l11-7m-2.778-.374L15 2l-.731 2.63`,
    histogramDown: `M1 1v18h18M4 19V9h3v10m2 0v-6h3v6m2 0v-4h3v4M5 2l11 8m-2.85.336 2.798-.334-.504-2.729`,
    document: `M1 1v18h18m0 0V1H1m6 3H4m0 3h3m-3 3h3m-3 3h12M4 16h12M10 4v6h6V4z`,
    database: `M2 16c0 4 16 4 16 0m0 0V4C18 0 2 0 2 4v12M2 4c0 4 16 4 16 0M2 8c0 4 16 4 16 0M2 12c0 4 16 4 16 0`,
    percentage: `M2 18 18 2M5 2a1 1 0 0 0-1 5 1 1 0 0 0 1-5m11 16a1 1 0 0 0-1-5 1 1 0 0 0 1 5`,
    percentageUp: `M2 18 18 2M5 2a1 1 0 0 0-1 5 1 1 0 0 0 1-5m11 16a1 1 0 0 0-1-5 1 1 0 0 0 1 5M14 2h4v4`,
    percentageDown: `M2 18 18 2M5 2a1 1 0 0 0-1 5 1 1 0 0 0 1-5m11 16a1 1 0 0 0-1-5 1 1 0 0 0 1 5M2 14v4h4`,
    aToZ: `m3 8 4-7 4 7M4.716 5h4.569M3 12h8l-8 7h8m6-17v16m-2-2 2 2 2-2`,
    zToA: `m3 19 4-7 4 7m-6.285-2.999L9.284 16M3 1h8L3 8h8m6-6v16m-2-2 2 2 2-2`,
    zeroToNine: `M7 1C1.653.987 1.663 7.995 7 8c5.337-.005 5.326-7.002 0-7m10 1v16m-2-2 2 2 2-2m-8-2c0-3-8-3-8 0s8 2 8 0m0 0c0 5-3 5-8 5`,
    nineToZero: `M7 12c-5.338-.002-5.328 6.991 0 7 5.329-.004 5.335-7.005 0-7M17 2v16m-2-2 2 2 2-2M11 4c0-3-8-3-8 0m0 0c0 3 8 2 8 0m0 0c0 5-3 5-8 5`,
    chip: `M5 3h10c1 0 2 1 2 2v10c0 1-1 2-2 2H5c-1 0-2-1-2-2V5c0-1 1-2 2-2m5-2v2M7 1v2m6-2v2M1 10h2M1 7h2m-2 6h2m7 4v2m-3-2v2m6-2v2m4-9h2m-2-3h2m-2 6h2M8 7h4s1 0 1 1v4s0 1-1 1H8c-1 0-1-1-1-1V8c0-1 1-1 1-1`,
    wifi: `M10 6a1 1 0 0 0 0 2 1 1 0 0 0 0-2M7 4c-2 1-2 5 0 6m6-6c2 1 2 5 0 6M4 3c-2 2-2 6 0 8m12-8c2 2 2 6 0 8m-6 0v5m-8 1h4m0 0c0-1 1-1 1-1h6s1 0 1 1-1 1-1 1H7s-1 0-1-1m8 0h4`,
    key: `M7 10a1 1 0 0 0-6 0 1 1 0 0 0 6 0h12m-2 0v3l-2-2-2 2v-3`,
    shield: `M10 1C7 4 4 4 1 4c1 6 3 11 9 15 6-4 8-9 9-15-3 0-6 0-9-3`,
    shieldExclam: `M10 1C7 4 4 4 1 4c1 6 3 11 9 15 6-4 8-9 9-15-3 0-6 0-9-3m0 4v5m0 3a1 1 0 0 0 0 2 1 1 0 0 0 0-2`,
    cloud: `M4 15h12a1 1 0 0 0 1-5 1 1 0 0 0-5-3 1 1 0 0 0-5 2 1 1 0 0 0-3 6`,
    cloudRain: `M4 15h12a1 1 0 0 0 1-5 1 1 0 0 0-5-3 1 1 0 0 0-5 2 1 1 0 0 0-3 6m2 2-2 2m7-2-2 2m7-2-2 2`,
    sun: `M10 7a1 1 0 0 0 0 6 1 1 0 0 0 0-6M5 6 4 5m11 1 1-1M5 15l-1 1m11-1 1 1M10 4l.005-1.318M4 10l-1.338.001M10 16l.002 1.333M16 10l1.346.002`,
    croissant: `M6 3c11 0 11 14 0 14M6 3c5 4 5 10 0 14`,
    plus: `M10 3v14m-7-7h14`,
    minus: `M3 10h14`,
    person: `M10 1c-2 0-2 4 0 4s2-4 0-4m0 5c-4 0-1 4 0 4m0-4c4 0 1 4 0 4m-2 0 1 9m3-9-1 9m-3 0h4M8 5c-2 1-3 5-3 7m7-7c2 1 3 5 3 7`,
    download: `M10 2v12m-4-4 4 4 4-4M2 13v3c0 2 2 2 2 2h12s2 0 2-2v-3`,
    upload: `M10 6v12m-4-8 4-4 4 4M2 7V4c0-2 2-2 2-2h12s2 0 2 2v3`,
    target: `M10 9a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0-3a1 1 0 0 0 0 8 1 1 0 0 0 0-8m0-4a1 1 0 0 0 0 16 1 1 0 0 0 0-16`,
    gisLayerSearch: `M10 1 2 3m8 7a1 1 0 0 0 0 8 1 1 0 0 0 0-8M2 3l8 2 8-2-8-2M2 6l8 2 8-2M2 9l4 1m7.068 6.565L16 19m2-10-4 1M2 9l6-1.499M18 9l-6-1.5M18 6l-6-1.5M2 6l6-1.5`,
    sqlSearch: `M6.008 3.011C5.99 1.737 2.024 1.646 2 3c.024 1.703 4.008 1.12 3.99 3.013 0 1.437-3.966 1.273-3.984-.182M10 10a1 1 0 0 0 0 8 1 1 0 0 0 0-8m3.068 6.565L16 19M10 2c-3 0-3 5 0 5m0 0c3 0 3-5 0-5m5 0v5h3m-6.538-.537L13 8`,
    scada: `M7 15h6c1 0 1 1 1 1v2s0 1-1 1H7c-1 0-1-1-1-1v-2s0-1 1-1m-6 2h5m8 0h5m-9-2V4M5.876 5.49l8.227 4.067m-8.207-.005 8.232-4.06M10 2a1 1 0 0 0 0 2 1 1 0 0 0 0-2M6 5a1 1 0 0 0-2 0 1 1 0 0 0 2 0m0 5a1 1 0 0 0-2 0 1 1 0 0 0 2 0m8-5a1 1 0 0 0 2 0 1 1 0 0 0-2 0m0 5a1 1 0 0 0 2 0 1 1 0 0 0-2 0`,
    apiStream: `M5 2Q2 2 2 5l.35 2.988C2 9 1 9 1 10s1 1 1.396 1.949L2 15q0 3 3 3M15 2q3 0 3 3l-.389 3.035C18 9 19 9 19 10s-1 1-1.389 2.008L18 15q0 3-3 3M6 6h8m-2-2 2 2-2 2m2 6H6m2-2-2 2 2 2`,
    wrench: `m2.036 4.452 3.073 2.99c1.786.042 2.451-.498 2.741-2.243L4.736 1.835c4.734-.415 7.475 1.62 5.773 6.105M2.036 4.452c-1.038 3.945 1.578 7.6 6.014 5.654m0 0 7.684 8.152c1.039-.014 2.272-1.262 2.26-2.159L10.509 7.94`,
    branches: `M4 10a1 1 0 0 0-3 0 1 1 0 0 0 3 0m6 0a1 1 0 0 0-3 0 1 1 0 0 0 3 0m0-7a1 1 0 0 0-3 0 1 1 0 0 0 3 0M2.492 8.5l.013-3.499C2.521 4.002 3.536 3.004 4.517 3H7m3 0h6m3 0a1 1 0 0 0-3 0 1 1 0 0 0 3 0M4 10h3m12 7a1 1 0 0 0-3 0 1 1 0 0 0 3 0M8.5 11.5l.011 3.5c-.005 1 .983 1.999 2.015 1.999L16 17m3-7a1 1 0 0 0-3 0 1 1 0 0 0 3 0m-9 0h6`,
    fork: `M4 2a1 1 0 0 0 0 4 1 1 0 0 0 0-4m12 0a1 1 0 0 0 0 4 1 1 0 0 0 0-4m-6 13a1 1 0 0 0 0 4 1 1 0 0 0 0-4M4 6v2c0 2 2 2 2 2h8s2 0 2-2V6m-6 4v5`,
    resizeX: `m5 6-4 4 4 4m10-8 4 4-4 4`,
    resizeY: `m14 5-4-4-4 4m8 10-4 4-4-4`,
    resizeTLBR: `M9 3H3v6m14 2v6h-6`,
    resizeTRBL: `M17 9V3h-6M9 17H3v-6`,
    focus: `M1 6V4q0-3 3-3h2m8 0h2q3 0 3 3v2m0 8v2q0 3-3 3h-2m-8 0H4q-3 0-3-3v-2m11-4a1 1 0 0 0-4 0 1 1 0 0 0 4 0`,
    sql: `M10 7c-3 0-3 6 0 6s3-6 0-6m0 6 2 2M5.988 8.502C5.988 6.993 2 6 2 9c.322 1.725 3.706.249 4 2-.012 3.076-3.993 2.014-3.993.504M14 7v6h4`,
    monitor: `M3 2S2 2 2 3v10s0 1 1 1h14c1 0 1-1 1-1V3c0-1-1-1-1-1zM2 12h16m-9 2v2m2-2v2m-3 1c.333-.333.667-.667 1-2q1 1.5 2 0c.333 1.333.667 1.667 1 2H7c-1 0-2 1-2 2h10c0-1-1-2-2-2h-1`,
    workstation: `M2 2S1 2 1 3v10s0 1 1 1h9M1 12h10m-3 2v2m2-2v2m-3 1c1 0 1-1 1-2 1 1 1 1 2 0 0 2 1 2 1 2m0 0H6c-1 0-2 1-2 2h7m0-17H2m12 0h4s1 0 1 1v15c0 1-1 1-1 1h-4c-1 0-1-1-1-1V3s0-1 1-1m2 3a1 1 0 0 0 0 2 1 1 0 0 0 0-2`,
    laptop: `M2 17c0 1 1 1 1 1h14s1 0 1-1l-2-4H4zm2-5V4s0-1 1-1h10c1 0 1 1 1 1v8zm3 4h6`,
    folder: `M3 2h3M3 2C2 2 2 3 2 3v14s0 1 1 1m0 0h14s1 0 1-1V6s0-2-2-2H8L6 2m12 7c0-2-2-2-2-2H4C2 7 2 9 2 9m6 0h4`,
    folderFill: `M3 2h3M3 2C2 2 2 3 2 3v14s0 1 1 1m0 0h14s1 0 1-1V6s0-2-2-2H8L6 2m12 10c0-2-2-2-2-2H4c-2 0-2 2-2 2m6 0h4m-7-2V7h10v3`,
    clip: `M6 1v14a1 1 0 0 0 8 0V4a1 1 0 0 0-5 0v11a1 1 0 0 0 2.5 0V7`,
    addColumn: `M3 2C2 2 2 3 2 3v14s0 1 1 1h2s1 0 1-1V3c0-1-1-1-1-1zm6 0C8 2 8 3 8 3v14s0 1 1 1h2c1 0 1-1 1-1V3s0-1-1-1zm7 6v4m-2-2h4`,
    addRow: `M3 2S2 2 2 3v2s0 1 1 1h14s1 0 1-1V3c0-1-1-1-1-1zm0 6C2 8 2 9 2 9v2s0 1 1 1h14c1 0 1-1 1-1V9c0-1-1-1-1-1zm7 6v4m-2-2h4`,
    bell: `M12 3a1 1 0 0 0-4 0c-4 1-3 6-4 9l-1 2c0 1 0 2 1 2h12c1 0 1-1 1-2l-1-2c-1-3 0-8-4-9M8 17a1 1 0 0 0 4 0`,
    bellOff: `M12 3a1 1 0 0 0-4 0c-4 1-3 6-4 9l-1 2c0 1 0 2 1 2h12c1 0 1-1 1-2l-1-2c-1-3 0-8-4-9M8 17a1 1 0 0 0 4 0M2 2l17 15`,
    bellRing: `M12 3a1 1 0 0 0-4 0c-4 1-3 6-4 9l-1 2c0 1 0 2 1 2h12c1 0 1-1 1-2l-1-2c-1-3 0-8-4-9M8 17a1 1 0 0 0 4 0M5 2C3 3 2 5 2 7m13-5c2 1 3 3 3 5`,
    pin: `m2 18 4-4m-3-4 7 7m0 0 1-1c1-2 1-4 1-4l4-5c1 0 1 0 2-1l-4-4c-1 1-1 1-1 2L8 8S6 8 4 9l-1 1`,
    unpin: `m2 18 4-4m-3-4 7 7m0 0 1-1c1-2 1-4 1-4l4-5c1 0 1 0 2-1l-4-4c-1 1-1 1-1 2L8 8S6 8 4 9l-1 1M2 2l16 16`,
    building: `M1 18h18M3 18V2h7v16M5 4v1m3-1v1M5 8v1m3-1v1m-3 3v1m3-1v1m2-3h7v8m-5 0v-3c0-1 3-1 3 0v3m-2-6h1`,
    twig: `M5 15a1 1 0 0 0 0 4 1 1 0 0 0 0-4M5 1a1 1 0 0 0 0 4 1 1 0 0 0 0-4m10 4a1 1 0 0 0 0 4 1 1 0 0 0 0-4M5 15V5m2 12h4c2 0 4-2 4-4V9`,
    check: `M18 2 8 18l-6-6`,
    doubleCheck: `M17 2 7 18l-5-6m5-1 1 1m3 3 2 2 6-11`,
    plug: `M14 5v10c0 1-2 1-2 0V5c0-1 2-1 2 0m-2 0c-9 0-9 10 0 10m-7-5c-5 0 1 9-4 9M15 7h4m-4 6h4`,
    unplug: `M14 5v10c0 1-2 1-2 0V5c0-1 2-1 2 0m-2 0c-9 0-9 10 0 10m-7-5c-5 0 1 9-4 9M15 7h4m-4 6h4M2 1l4 5m10 13-2-2.595M7.609 8.008l3.028 3.981`,
    spinner1: `M10 1a1 1 0 0 0 0 18m0-2a1 1 0 0 0 0-14m0 2a1 1 0 0 0 0 10m0-2a1 1 0 0 0 0-6m0 2a1 1 0 0 0 0 2`,
    spinner2: `M10 1a1 1 0 0 0 0 18M-3 0`,
    spinner3: `M10 1v3m-9 6h3m6 9v-3m9-6h-3`,
    spinner4: `M10 1v1m-9 8h1m8 9v-1m9-8h-1`,
    frameLine: `M1 1h18v18H1zm3 12 3 3 3-8 3 6 3-10`,
    pointer: `m2 2 5.015 15.998 2.596-6.384L16 18l2-2-6.514-6.405 6.816-2.164z`,
    monument: `M2 6h16c1 0 1 2 0 2H2C1 8 1 6 2 6m2 0 6-5 6 5M2 17h16M3 8v9m2-9v9m12-9v9m-2-9v9M9 8v9m2-9v9M1 19h18`,
    chartBump: `M2 1a1 1 0 0 0 0 2 1 1 0 0 0 0-2m8 0a1 1 0 0 0 0 2 1 1 0 0 0 0-2m8 0a1 1 0 0 0 0 2 1 1 0 0 0 0-2M2 9a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0 8a1 1 0 0 0 0 2 1 1 0 0 0 0-2m8-8a1 1 0 0 0 0 2 1 1 0 0 0 0-2m8 0a1 1 0 0 0 0 2 1 1 0 0 0 0-2m-8 8a1 1 0 0 0 0 2 1 1 0 0 0 0-2m8 0a1 1 0 0 0 0 2 1 1 0 0 0 0-2M3 2c3 0 3 8 6 8m-6 0c3 0 3-8 6-8m2 0h6M3 18h6m2 0c3 0 3-8 6-8m-6 0c3 0 3 8 6 8`,
    folderOpen: `M1 3c0-1 1-1 1-1h3s1 0 1 1v1c0 1 1 1 1 1h8c1 0 1 1 1 1M1 3v14c0 1 1 1 1 1l4-8h13l-4 8H2M16 6v4`,
    folderOpenFill: `M1 3c0-1 1-1 1-1h3s1 0 1 1v1c0 1 1 1 1 1h8c1 0 1 1 1 1M1 3v14c0 1 1 1 1 1l4-7h13l-4 7H2M16 6v5M4 14.5V8h9v3`,
    tag: `M2 5v5l8 8s2 2 4 0l4-4c2-2 0-4 0-4l-8-8H5Q2 2 2 5m3.506.48a1 1 0 0 0 1.998 2.016A1 1 0 0 0 5.506 5.48`,
    lightBulbOff: `M10 1a1 1 0 0 0 0 14 1 1 0 0 0 0-14M6.482 14.053 7 18h6l.501-3.925M12 19H8m2-4V9m0-2a1 1 0 0 0 0 2 1 1 0 0 0 0-2`,
    lightBulbOn: `M10 1a1 1 0 0 0 0 14 1 1 0 0 0 0-14M6.482 14.053 7 18h6l.501-3.925M12 19H8m2-4V9m0-2a1 1 0 0 0 0 2 1 1 0 0 0 0-2M1 1l1 1m17-1-1 1M1 15l1-1m17 1-1-1`,
    knobs: `M2 10h4m0-2v4m3-2h9m-7-8v4m0-2h7M2 4h6m6 14v-4m0 2h4m-7 0H2`,
    hierarchy: `M8 1h4s1 0 1 1v3s0 1-1 1H8C7 6 7 5 7 5V2s0-1 1-1M2 19h4s1 0 1-1v-3c0-1-1-1-1-1H2c-1 0-1 1-1 1v3c0 1 1 1 1 1m12 0h4s1 0 1-1v-3s0-1-1-1h-4s-1 0-1 1v3c0 1 1 1 1 1m-9-9h10m-5-4v4m-5 0c-1 0-1 1-1 1v3m11-4c1 0 1 1 1 1v3`,
    hierarchyList: `M2 1C1 1 1 2 1 2v2s0 1 1 1h4s1 0 1-1V2s0-1-1-1zm16 18s1 0 1-1v-2c0-1-1-1-1-1h-4c-1 0-1 1-1 1v2s0 1 1 1zm-4-7h4s1 0 1-1V9c0-1-1-1-1-1h-4c-1 0-1 1-1 1v2s0 1 1 1M4 5v11c0 1 1 1 1 1h8m0-7H5s-1 0-1-1`,
    bucketFill: `M2 2h16c1 0 1 3 0 3H2C1 5 1 2 2 2m1 3v11c0 1 1 2 2 2h1M17 5v11c0 1-1 2-2 2h-1m-4 0V9m-3 3 3-3 3 3`,
    bucketEmpty: `M2 2h16c1 0 1 3 0 3H2C1 5 1 2 2 2m1 3v11c0 1 1 2 2 2h1M17 5v11c0 1-1 2-2 2h-1m-4 0V9m-3 6 3 3 3-3`,
    bucket: `M2 2h16c1 0 1 3 0 3H2C1 5 1 2 2 2m1 3v11c0 1 1 2 2 2h9m3-13v11c0 1-1 2-2 2h-1`,
    bucketRecycle: `M2 2h16c1 0 1 3 0 3H2C1 5 1 2 2 2m1 3v11c0 1 1 2 2 2h9m3-13v11c0 1-1 2-2 2h-1M8.786 9.996 10 8l1.225 2.008m1.489 2.473 1.26 2.096-2.462-.011m-2.978.011H5.98l1.317-2.141`,
    envelope: `M3 5h14c1 0 1 1 1 1v8s0 1-1 1H3c-1 0-1-1-1-1V6s0-1 1-1m0 1 7 5 7-5M3 14l5-4m4 0 5 4`,
    sliders: `M2 4h2m-2 6h10M2 16h2M6 2a1 1 0 0 0 0 4 1 1 0 0 0 0-4m2 2h10m-4 4a1 1 0 0 0 0 4 1 1 0 0 0 0-4m2 2h2M6 14a1 1 0 0 0 0 4 1 1 0 0 0 0-4m2 2h10`,
    checkList: `M9 5h9m-9 6h9m-9 6h9M6 2 4 6 2 4m0 6 2 2 2-4m-4 8 2 2 2-4`,
    bug: `M8 2a1 1 0 0 0 4 0m1 5a1 1 0 0 0-6 0m0 0c0 1 1 1 1 1h4c1 0 1-1 1-1M7 6C6 6 5 7 5 8v5c0 2 1 4 4 4h2c3 0 4-2 4-4V8c0-1-1-2-2-2m-3 2v9m-5-6H2m13 0h3M5 14c-1 0-3 1-3 4m13-4c1 0 3 1 3 4M5 8C4 8 2 7 2 5m13 3c1 0 3-1 3-3`,
    microscope: `M9 3s0-1-1-1H7S6 2 6 3C5 3 5 4 5 4v3c0 1 1 1 1 1h3s1 0 1-1V4s0-1-1-1m-3 7h3m-4 6h5m-8 2h16m-8 0c9 0 9-13 0-13m-3 6h1`,
    export: `M10 2v10M7 5l3-3 3 3M5 8H4C3 8 3 9 3 9v8s0 1 1 1h12s1 0 1-1V9s0-1-1-1h-1`,
    file: `M4 2v16h12V7l-5-5zm7 0v5h5`,
    filePlus: `M4 2v16h12V7l-5-5zm7 0v5h5m-6 3v4m-2-2h4`,
    fileSearch: `M4 2v16h3m8-5a1 1 0 0 0-5 3 1 1 0 0 0 5-3m0 3 3 2m-2-9V7l-5-5H4m7 0v5h5`,
    recycle: `M7.5 5.5c2-3 4-3 7 2m2 3c1 2 1 5-5 5m-4 0c-4 0-5-2-2-7m6-1h3v-3m-1.363 8.393L11.5 15.5l2 2m-11-8 3-1 1 3`,
    link: `m7 13 6-6M6 9c-5 5 0 10 5 5M9 6c5-5 10 0 5 5`,
    puzzle: `M16.579 9.304h-1.177V6.167c0-.871-.706-1.569-1.569-1.569h-3.137V3.421a1.96 1.96 0 0 0-1.96-1.96 1.96 1.96 0 0 0-1.962 1.96v1.177H3.638a1.57 1.57 0 0 0-1.569 1.569v2.98h1.177c1.175 0 2.116.941 2.116 2.117a2.11 2.11 0 0 1-2.116 2.118H2.069v2.98a1.57 1.57 0 0 0 1.569 1.569h2.98v-1.177c0-1.175.941-2.116 2.118-2.116 1.176 0 2.117.941 2.117 2.116v1.177h2.98a1.57 1.57 0 0 0 1.569-1.569v-3.136h1.177a1.96 1.96 0 0 0 1.96-1.962 1.96 1.96 0 0 0-1.96-1.96`,
    externalLink: `m19 1-9 9m5-9h4v4m-9-2H5C4 3 3 4 3 5v10c0 1 1 2 2 2h10c1 0 2-1 2-2v-5`,
    plotLine: `M4 14a1 1 0 0 0 0 4 1 1 0 0 0 0-4M16 2a1 1 0 0 0 0 4 1 1 0 0 0 0-4m-1.414 3.414L5.42 14.592`,
    plotArrow: `M4 14a1 1 0 0 0 0 4 1 1 0 0 0 0-4M17 3 5.42 14.592M13 3h4v4`,
    accessibility: `M10 1a1 1 0 0 0 0 4 1 1 0 0 0 0-4m0 6L4 4a1 1 0 0 0-1 2l5 3v2l-4 6a1 1 0 0 0 2 1l4-5 4 5a1 1 0 0 0 2-1l-4-6V9l5-3a1 1 0 0 0-1-2z`,
    clankerCrazy: `M2 2h16v17H2zm0 10 8 1 8-1m-8 1v6m-4-6.5V19m8-6.5V19M6 5a1 1 0 0 0 0 4 1 1 0 0 0 0-4m7 0a1 1 0 0 0 0 5 1 1 0 0 0 0-5M1 5v5m18-5v5M7 1h6`,
    clankerNasty: `M2 2h16v17H2zm0 11 8-2 8 2m-8-2v8m-4-7v7m8-7v7M1 5v5m18-5v5M4 5l4 2m4 0 4-2M7 1h6`,
};

const rcPaths = {
    chartBar: `M2 12v6c0 1 0 1 1 1h2c1 0 1 0 1-1v-6c0-1 0-1-1-1H3c-1 0-1 0-1 1m6-5v11c0 1 0 1 1 1h2c1 0 1 0 1-1V7c0-1 0-1-1-1H9C8 6 8 6 8 7m6-5v16c0 1 0 1 1 1h2c1 0 1 0 1-1V2c0-1 0-1-1-1h-2c-1 0-1 0-1 1`,
    chartCandlestick: `M2 9v2c0 1 1 1 1 1h2c1 0 1-1 1-1V9c0-1-1-1-1-1H3C2 8 2 9 2 9m6-1v4s0 1 1 1h2c1 0 1-1 1-1V8c0-1-1-1-1-1H9C8 7 8 8 8 8m6 1v5c0 1 1 1 1 1h2c1 0 1-1 1-1V9s0-1-1-1h-2c-1 0-1 1-1 1M4 8V5M3 5h2m5 8v3m-1 0h2m5-8V2m-1 0h2m-7 5V4M9 4h2m-7 8v6m-1 0h2m11-3v3m-1 0h2`,
    chartChestnut: `M4 3a1 1 0 0 0 0 6 1 1 0 0 0 0-6m0 9a1 1 0 0 0 0 5 1 1 0 0 0 0-5m5-8h10M9 7h8m-8 3h6m-6 3h4m-4 3h2`,
    chartDonutEvolution: `M1 1v17c0 1 0 1 1 1h17M3 8a1 1 0 0 0 4 0 1 1 0 0 0-4 0m5 6a1 1 0 0 0 4 0 1 1 0 0 0-4 0m6-10a1 1 0 0 0 4 0 1 1 0 0 0-4 0m-7 6 2 2m2 0 4-6`,
    chartRelationCircle: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m0 0c6 1 8 3 9 9m0 0c0-8-2-12-4-17m4 17c0-8 2-12 4-17m-4 17c1-6 2-8 9-9`,
    chartRings: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 4a1 1 0 0 0 10 0 1 1 0 0 0-10 0m3 3a1 1 0 0 0 4 0 1 1 0 0 0-4 0`,
    chartSparkHistogram: `M2 9v2c0 1 1 1 1 1h2c1 0 1-1 1-1V9c0-1-1-1-1-1H3C2 8 2 9 2 9m6-1v4s0 1 1 1h2c1 0 1-1 1-1V8c0-1-1-1-1-1H9C8 7 8 8 8 8m6 1v2c0 1 1 1 1 1h2c1 0 1-1 1-1V9s0-1-1-1h-2c-1 0-1 1-1 1`,
    chartTable: `M2 3v14c0 1 0 1 1 1h14c1 0 1 0 1-1V3c0-1 0-1-1-1H3C2 2 2 2 2 3m8 3v12m-8-8h16M2 6h16M2 14h16M6 8h2m-2 4h2m-2 4h2m6-8h2m-2 4h2m-2 4h2`,
    chartVerticalBar: `M1 3v2c0 1 0 1 1 1h7c1 0 1 0 1-1V3c0-1 0-1-1-1H2C1 2 1 2 1 3m0 6v2c0 1 0 1 1 1h11c1 0 1 0 1-1V9c0-1 0-1-1-1H2C1 8 1 8 1 9m0 6v2c0 1 0 1 1 1h15c1 0 1 0 1-1v-2c0-1 0-1-1-1H2c-1 0-1 0-1 1`,
    chartWaffle: `M1 2v2c0 1 0 1 1 1h2c1 0 1 0 1-1V2c0-1 0-1-1-1H2C1 1 1 1 1 2m17-1h-2c-1 0-1 0-1 1v2c0 1 0 1 1 1h2c1 0 1 0 1-1V2c0-1 0-1-1-1M8 2v2c0 1 0 1 1 1h2c1 0 1 0 1-1V2c0-1 0-1-1-1H9C8 1 8 1 8 2M2 19h2c1 0 1 0 1-1v-2c0-1 0-1-1-1H2c-1 0-1 0-1 1v2c0 1 0 1 1 1M1 9v2c0 1 0 1 1 1h2c1 0 1 0 1-1V9c0-1 0-1-1-1H2C1 8 1 8 1 9m14 7v2c0 1 0 1 1 1h2c1 0 1 0 1-1v-2c0-1 0-1-1-1h-2c-1 0-1 0-1 1m-7 0v2c0 1 0 1 1 1h2c1 0 1 0 1-1v-2c0-1 0-1-1-1H9c-1 0-1 0-1 1m0-7v2c0 1 0 1 1 1h2c1 0 1 0 1-1V9c0-1 0-1-1-1H9C8 8 8 8 8 9m7 0v2c0 1 0 1 1 1h2c1 0 1 0 1-1V9c0-1 0-1-1-1h-2c-1 0-1 0-1 1`,
    labelClose: `M2 8c-1 1-1 3 0 4l3 4c1 1 1 1 2 1h10c2 0 2-2 2-2V5s0-2-2-2h-5m-5 7h8m-8 3h9M9 6 4 1m0 5 5-5`,
    labelOpen: `M2 8c-1 1-1 3 0 4l3 4c1 1 1 1 2 1h10c2 0 2-1 2-2V5s0-2-2-2H7C6 3 6 3 5 4zm5-1h6m-6 3h8m-8 3h9`,
    moodFlat: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 3c3-2 7-2 10 0M5 7a1 1 0 0 0 3 0 1 1 0 0 0-3 0m7 0a1 1 0 0 0 3 0 1 1 0 0 0-3 0`,
    moodHappy: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 1c1 7 9 7 10 0zm0-4a1 1 0 0 0 3 0 1 1 0 0 0-3 0m7 0a1 1 0 0 0 3 0 1 1 0 0 0-3 0`,
    moodNeutral: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 2h10M5 7a1 1 0 0 0 3 0 1 1 0 0 0-3 0m7 0a1 1 0 0 0 3 0 1 1 0 0 0-3 0`,
    moodSad: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 4c1-5 9-5 10 0zm0-7a1 1 0 0 0 3 0 1 1 0 0 0-3 0m7 0a1 1 0 0 0 3 0 1 1 0 0 0-3 0`,
    screenshot: `M1 4V3c0-1 1-2 2-2h1m12 0h1c1 0 2 1 2 2v1M1 16v1c0 1 1 2 2 2h1m12 0h1c1 0 2-1 2-2v-1M8 10a1 1 0 0 0 4 0 1 1 0 0 0-4 0m-3 3V8c0-1 0-1 1-1h8c1 0 1 0 1 1v5c0 1 0 1-1 1H6c-1 0-1 0-1-1m2-7h6`,
    smiley: `M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m4 2c3 2 7 2 10 0M5 7a1 1 0 0 0 3 0 1 1 0 0 0-3 0m7 0a1 1 0 0 0 3 0 1 1 0 0 0-3 0`,
    chartSparkline: `M2.033 13.067c-.071-2.13.213-3.833 1.42-3.94 1.739 0 .78 6.921 3.017 6.886 2.271 0 1.064-7.383 3.265-7.454 2.343 0 1.207 3.798 3.23 3.798C15.059 12.286 14.278 4.016 18 4`,
    legend: `M3 2h2s1 0 1 1v2c0 1-1 1-1 1H3S2 6 2 5V3c0-1 1-1 1-1m5 2c0-1 1-1 1-1h8s1 0 1 1-1 1-1 1H9S8 5 8 4M3 8h2s1 0 1 1v2c0 1-1 1-1 1H3s-1 0-1-1V9c0-1 1-1 1-1m5 2c0-1 1-1 1-1h8s1 0 1 1-1 1-1 1H9s-1 0-1-1m-5 4h2s1 0 1 1v2c0 1-1 1-1 1H3s-1 0-1-1v-2c0-1 1-1 1-1m5 2c0-1 1-1 1-1h8s1 0 1 1-1 1-1 1H9s-1 0-1-1`,
    chartGalaxy: `M7 11a1 1 0 0 0 4 0m3 0a1 1 0 0 0-7 0m-4 0a1 1 0 0 0 11 0m4 0a1 1 0 0 0-15 0m13.4 5c.6-1 1.6-3 1.6-5`,
    zoomPlus: `M9 1a1 1 0 0 0 0 16A1 1 0 0 0 9 1m5.65 13.65L18 18M9 5v8M5 9h8`,
    zoomMinus: `M9 1a1 1 0 0 0 0 16A1 1 0 0 0 9 1m5.65 13.65L18 18M5 9h8`,
    ratio: `M2 10h16M8 1l4 6m0-6L8 7m0 6 2 3m2-3-4 6`,
    settings: `M8 7a1 1 0 0 0 0 10A1 1 0 0 0 8 7m0-1v1m-6 5h1m10 0h1m-6 5v1M3.6 7.6l.8.8m-.8 8 .8-.9m8-7.9-.9.8m.1 7.1.8.9M8 11a1 1 0 0 0 0 2 1 1 0 0 0 0-2m8-9a1 1 0 0 0 0 4 1 1 0 0 0 0-4m-3 2h1m2 2v1m2-3h1m-3-3v1`,
    trendUp: `M6 3v4M4 5h4m3 2 5-4m-4-1a1 1 0 0 0 0 2 1 1 0 0 0 0-2m3 4a1 1 0 0 0 0 2 1 1 0 0 0 0-2m-5 12v-8m-3 3 3-3 3 3`,
    trendDown: `M4 5h4m3 2 5-4m-4-1a1 1 0 0 0 0 2 1 1 0 0 0 0-2m3 4a1 1 0 0 0 0 2 1 1 0 0 0 0-2m-5 12v-8m-3 5 3 3 3-3`,
    chartHistoryPlot: `M4 4a1 1 0 0 0 2 0 1 1 0 0 0-2 0m8-2a1 1 0 0 0 0 2 1 1 0 0 0 0-2m5 5a1 1 0 0 0 0 2 1 1 0 0 0 0-2m-5 7a1 1 0 0 0 0 2 1 1 0 0 0 0-2m-7-2a1 1 0 0 0 0 2 1 1 0 0 0 0-2m1-8 5-1m1.84.582 3.427 3.683m.358 1.688-3.862 5.344m-1.764.435-5.012-1.406M1 1v18h18`,
};

function getIconPath(name, { stroke: _s, strokeWidth: _sw }) {
    const sw = `stroke="${_s}" stroke-width="${_sw}"`;
    const fill = `fill="${_s}"`;
    const stroke = `stroke="${_s}"`;
    const rrAttrs = `${fn} ${sw} ${sl_none}`;
    const rcAttrs = `${fn} ${sw} ${slr}`;
    const solid = `${fill} ${sn}`;
    const solid0 = solid;
    const o3 = op(0.3);
    const o4 = op(0.4);
    const o5 = op(0.5);
    const o6 = op(0.6);
    const rr = rrPaths[name];
    if (rr) {
        return `<path d="${rr}" ${rrAttrs}/>`;
    }

    const rc = rcPaths[name];
    if (rc) {
        return `<path d="${rc}" ${rcAttrs}/>`;
    }

    const map = {
        annotator: `<path ${rrAttrs} d="m1 19 2-7c0 2 0 3 2 3 0 2 2 2 3 2zm2-7L14 1c1-1 2 0 2 0l3 3c1 1 0 2 0 2L8 17m-3-2L15 5M1.667 16.667l1.666 1.666m9.168-15.832L17.5 7.5" /><path d="M15 5 5 15c0 2 2 2 3 2l9.5-9.5z" ${solid} ${o3}/>`,
        annotatorDisabled: `<path ${rrAttrs} d="m1 19 2-7c0 2 0 3 2 3 0 2 2 2 3 2zm2-7L14 1c1-1 2 0 2 0l3 3c1 1 0 2 0 2L8 17m-3-2L15 5M1.667 16.667l1.666 1.666m9.168-15.832L17.5 7.5M2 2l16 16" /><path d="M15 5 5 15c0 2 2 2 3 2l9.5-9.5z" ${solid} ${o3}/>`,
        chart3dBar: `<path ${fn} ${sw} d="M10 1 6 3v14l4 2 4-2V3zM6 3l4 2 4-2m-4 2v14" ${sl_none}/><path ${solid} ${o3} d="m6 10 4 2 4-2v7l-4 2-4-2z"/>`,
        chartDonut: `<path ${rcAttrs} d="M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m5 0a1 1 0 0 0 8 0 1 1 0 0 0-8 0m-5 0h5m4 4v5m4-9" /><path ${sn} ${fill} ${slr} d="M1 10h5c0 2 2 4 4 4v5c-4 0-9-3-9-9" ${o3} />`,
        chartNestedDonuts: `<path ${rcAttrs} d="M1 10a1 1 0 0 0 18 0 1 1 0 0 0-18 0m3 0a1 1 0 0 0 12 0 1 1 0 0 0-12 0m-3 0h3"/><path ${fn} ${stroke} stroke-width="${_sw / 2}" ${slr} d="M10 16v3m-3-9a1 1 0 0 0 6 0 1 1 0 0 0-6 0"/><path ${o3} ${fill} ${slr} d="M7 10h3v3c-2 0-3-2-3-3"/><path ${o3} ${fill} ${slr} d="M1 10h3c0 4 3 6 6 6v3c-5 0-9-4-9-9"/>`,
        chartGauge: `<path ${rcAttrs} d="M19 13a1 1 0 0 0-18 0" ${o3} /><path ${rcAttrs} d="M9 15a1 1 0 0 0 2 0 1 1 0 0 0-2 0m1-1V8m0-4c-4 0-9 3-9 9" />`,
        chartHeatmap: `<path ${rcAttrs} d="M2 3v14c0 1 0 1 1 1h14c1 0 1 0 1-1V3c0-1 0-1-1-1H3C2 2 2 2 2 3m8-1v16m-8-8h16M6 2v16m8-16v16M2 6h16M2 14h16"/><rect ${solid} x="2" y="6" height="4" width="4" ${o5} /><rect ${solid} x="6" y="10" height="4" width="4" ${o5} /><rect ${solid} x="6" y="14" height="4" width="4" ${o5} /><rect ${solid} x="14" y="2" height="4" width="4" ${o5} />`,
        chartMoodRadar: `<path ${rrAttrs} d="M10 4 4 9l2 7h8l2-7zM9 2a1 1 0 0 0 2 0 1 1 0 0 0-2 0M1 8a1 1 0 0 0 2 0 1 1 0 0 0-2 0m2 10a1 1 0 0 0 2-1 1 1 0 0 0-2 1m12 0a1 1 0 0 0 2-1 1 1 0 0 0-2 1m2-10a1 1 0 0 0 2 0 1 1 0 0 0-2 0" /><path ${sn} ${fill} ${sl_none} d="m10 7 3 3v4l-5-1-1-4z" ${o3} />`,
        chartOnion: `<path ${rrAttrs} d="M10 1c5 0 9 4 9 9s-4 9-9 9c-4 0-9-4-9-9m9-6c3 0 6 2 6 6s-3 6-6 6-6-2-6-6m6-3c1 0 3 1 3 3s-2 3-3 3-3-1-3-3" ${o3} /><path ${rrAttrs} d="M10 1c5 0 9 4 9 9s-4 9-9 9m0-15c3 0 6 2 6 6s-3 6-6 6-6-2-6-6m6-3c1 0 3 1 3 3" />`,
        chartQuadrant: `<path ${rcAttrs} d="M10 1v18m-9-9h18" /><circle ${solid} cx="3" cy="14" r="1"/><circle ${solid} cx="5" cy="6" r="1"/><circle ${solid} cx="14" cy="17" r="1"/><circle ${solid} cx="17" cy="14" r="1"/><circle ${solid} cx="15" cy="4" r="1"/>`,
        chartRadar: `<path ${rcAttrs} d="M2 6v8l8 5 8-5V6l-8-5z" /><path ${o3} ${solid} stroke-width="0" ${slr} d="m4 7 6-2 8 1-6 5-2 5-4-5z" /><path ${stroke} stroke-width="${_sw / 3}" ${sl_none} ${fn} d="m4 7 6-2 8 1-6 5-2 5-4-5z" />`,
        chartScatter: `<path ${rcAttrs} d="M1 1v17c0 1 0 1 1 1h17" /><circle ${solid} cx="5" cy="15" r="1"/><circle ${solid} cx="6" cy="12" r="1" /><circle ${solid} cx="8" cy="15" r="1"/><circle ${solid} cx="10" cy="8" r="1"/><circle ${solid} cx="12" cy="10" r="1"/><circle ${solid} cx="14" cy="6" r="1"/><circle ${solid} cx="16" cy="4" r="1"/><circle ${solid} cx="11" cy="14" r="1"/>`,
        chartSparkStackbar: `<path ${solid} d="M12 8h5c2 0 2 4 0 4h-5c2 0 2-4 0-4" ${o3} /><path ${solid} d="M3 8h4c2 0 2 4 0 4H3c-2 0-2-4 0-4" /><path ${solid} d="M7 8h5c2 0 2 4 0 4H7c2 0 2-4 0-4" ${o5} /><path ${fn} ${stroke} stroke-width="${_sw / 3}" ${slr} d="M3 8h14c2 0 2 4 0 4H3c-2 0-2-4 0-4" />`,
        chartThermometer: `<path ${rcAttrs} d="M13 4a1 1 0 0 0-6 0v12a1 1 0 0 0 6 0zM7 15h1m-1-3h1M7 9h1M7 6h1m4 9h1m-1-3h1m-1-3h1m-1-3h1" /><path ${sw} ${o6} d="M10 17v-5" ${slr} /><path ${slr} ${sw} d="M10 17V9" ${o3} /><path ${slr} ${sw} opacity="0.3" d="M10 17V6" /><path ${slr} ${sw} ${op(0.1)} d="M10 17V3" />`,
        chartTiremarks: `<path ${rcAttrs} d="M1 8v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4" /><path ${rcAttrs} d="M1 8v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4m2-4v4" ${o4} />`,
        chartWheel: `<circle cx="10" cy="10" r="7" ${fn} ${sw} stroke-dasharray="16" ${slr}/><circle cx="10" cy="10" r="9" ${fn} ${sw} stroke-dasharray="2" ${slr} ${op(0.7)}/><circle cx="10" cy="10" r="1" ${fill} />`,
        close: `<path ${fn} stroke-width="${_sw}" ${fn} ${stroke} ${slr} d="m4 4 12 12M4 16 16 4" />`,
        digit0: `<path ${o3} ${solid0} d="m7 10 1-1h4l1 1-1 1H8z"/><path ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zM7 18l1-1h4l1 1-1 1H8zM6 3l1 1v4L6 9 5 8V4zm0 8 1 1v4l-1 1-1-1v-4zm8-8-1 1v4l1 1 1-1V4zm0 8 1 1v4l-1 1-1-1v-4z" />`,
        digit1: `<path ${o3} ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zM7 18l1-1h4l1 1-1 1H8zm-1-7 1 1v4l-1 1-1-1v-4zm0-8 1 1v4L6 9 5 8V4zm1 7 1-1h4l1 1-1 1H8z"/><path ${solid0} d="m14 3-1 1v4l1 1 1-1V4zm0 8 1 1v4l-1 1-1-1v-4z" />`,
        digit2: `<path ${o3} ${solid0} d="m14 11 1 1v4l-1 1-1-1v-4zM6 3l1 1v4L6 9 5 8V4z"/><path ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zm6 2-1 1v4l1 1 1-1V4zM7 18l1-1h4l1 1-1 1H8zm-1-7 1 1v4l-1 1-1-1v-4zm1-1 1-1h4l1 1-1 1H8z" />`,
        digit3: `<path ${o3} ${solid0} d="m6 11 1 1v4l-1 1-1-1v-4zm0-8 1 1v4L6 9 5 8V4z"/><path ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zm6 2-1 1v4l1 1 1-1V4zm0 8 1 1v4l-1 1-1-1v-4zm-7 7 1-1h4l1 1-1 1H8zm0-8 1-1h4l1 1-1 1H8z" />`,
        digit4: `<path ${o3} ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zM7 18l1-1h4l1 1-1 1H8zm-1-7 1 1v4l-1 1-1-1v-4z"/><path ${solid0} d="m14 3-1 1v4l1 1 1-1V4zm0 8 1 1v4l-1 1-1-1v-4zM6 3l1 1v4L6 9 5 8V4zm1 7 1-1h4l1 1-1 1H8z" />`,
        digit5: `<path ${o3} ${solid0} d="m14 3-1 1v4l1 1 1-1V4zm-8 8 1 1v4l-1 1-1-1v-4z"/><path ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zm6 10 1 1v4l-1 1-1-1v-4zm-7 7 1-1h4l1 1-1 1H8zM6 3l1 1v4L6 9 5 8V4zm1 7 1-1h4l1 1-1 1H8z" />`,
        digit6: `<path ${o3} ${solid0} d="m14 3-1 1v4l1 1 1-1V4z"/><path ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zm6 10 1 1v4l-1 1-1-1v-4zm-7 7 1-1h4l1 1-1 1H8zm-1-7 1 1v4l-1 1-1-1v-4zm0-8 1 1v4L6 9 5 8V4zm1 7 1-1h4l1 1-1 1H8z" />`,
        digit7: `<path ${o3} ${solid0} d="m7 18 1-1h4l1 1-1 1H8zm-1-7 1 1v4l-1 1-1-1v-4zm0-8 1 1v4L6 9 5 8V4zm1 7 1-1h4l1 1-1 1H8z"/><path ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zm6 2-1 1v4l1 1 1-1V4zm0 8 1 1v4l-1 1-1-1v-4z" />`,
        digit8: `<path ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zm-1 9 1-1h4l1 1-1 1H8zm0 8 1-1h4l1 1-1 1H8zM6 3l1 1v4L6 9 5 8V4zm0 8 1 1v4l-1 1-1-1v-4zm8-8-1 1v4l1 1 1-1V4zm0 8 1 1v4l-1 1-1-1v-4z" />`,
        digit9: `<path ${o3} ${solid0} d="m6 11 1 1v4l-1 1-1-1v-4z"/><path ${solid0} d="M8 1 7 2l1 1h4l1-1-1-1zm6 2-1 1v4l1 1 1-1V4zm0 8 1 1v4l-1 1-1-1v-4zm-7 7 1-1h4l1 1-1 1H8zM6 3l1 1v4L6 9 5 8V4zm1 7 1-1h4l1 1-1 1H8z" />`,
        excel: `<path stroke-width="${_sw}" ${fn} ${stroke} ${sljr} d="M4 1Q1 1 1 4v12q0 3 3 3h12q3 0 3-3V6c-4 0-5-1-5-5Zm10 7c1 0 2 1 2 2v4c0 1-1 2-2 2H6c-1 0-2-1-2-2v-4c0-1 1-2 2-2Z"/><line ${sw} x1="9" x2="9" y1="8" y2="16" /><line ${sw} x1="4" x2="16" y1="12" y2="12" />`,
        image: `<path stroke-width="${_sw}" ${fn} ${stroke} ${slr} d="M4 1Q1 1 1 4v12q0 3 3 3h12q3 0 3-3V6c-4 0-5-1-5-5ZM1 16c2.333-2.333 2-6 7-4m-1 2c1-1 2-9 12-3"/><circle r="1" cx="6" cy="5" ${solid}/>`,
        menu: `<path stroke-width="${_sw}" ${fn} ${stroke} ${slr} d="M2 10h16M2 5h16M2 15h16" />`,
        pdf: `<path stroke-width="${_sw}" ${fn} ${stroke} ${sl_none} d="M4 1Q1 1 1 4v12q0 3 3 3h12q3 0 3-3V6c-4 0-5-1-5-5Zm0 15V9h1q2 0 2 2t-2 2H4m5 3V9q3 0 3 3v1q0 3-3 3m5 0V9h2m-2 3h2"/>`,
        skeleton: `<path ${rcAttrs} d="M3 14a1 1 0 0 0 0 4h4a1 1 0 0 0 0-4zm0-6a1 1 0 0 0 0 4h4a1 1 0 0 0 0-4zm0-6a1 1 0 0 0 0 4h1a1 1 0 0 0 0-4zm9 8v6c0 1 1 2 2 2h3c1 0 2-1 2-2v-6c0-1-1-2-2-2h-3c-1 0-2 1-2 2" stroke-dasharray="2" />`,
        sort: `<path stroke-width="${_sw}" ${fn} ${stroke} ${slr} d="m1 15 4 3 4-3M5 5v13m10-3V2m-4 3 4-3 4 3" />`,
        sortReverse: `<path stroke-width="${_sw}" ${fn} ${stroke} ${slr} d="m1 8 4-3 4 3M5 5v13m10-3V2m-4 10 4 3 4-3" />`,
        spin: `<path stroke-width="${_sw}" ${fn} ${stroke} ${slr} d="M1 10a1 1 0 0 0 18 0 1 1 0 0 0-15 0 1 1 0 0 0 12 0 1 1 0 0 0-9 0 1 1 0 0 0 6 0 1 1 0 0 0-3 0m-9 0q0-5 4-8" />`,
        starFill: `<path ${fill} ${sw} ${sl_none} d="m1.333 8.226 5.976-.895L9.96 1.9l2.7 5.406 5.983.843-4.308 4.237 1.047 5.951-5.36-2.788-5.337 2.836.995-5.96-4.345-4.201" />`,
        tableClose: `<path stroke-width="${_sw}" ${slr} ${fn} ${stroke} d="M4 1Q1 1 1 4v12q0 3 3 3h3M4 1h12q3 0 3 3v10m-1 5-4-3-4 3"/><line stroke-width="${_sw}" ${stroke} x1="8" y1="1" x2="8" y2="19" ${slr} /><line stroke-width="${_sw}" ${stroke} x1="1" y1="8" x2="19" y2="8" />`,
        tableOpen: `<path stroke-width="${_sw}" ${fn} ${slr} ${stroke} d="M4 1Q1 1 1 4v12q0 3 3 3h3M4 1h12q3 0 3 3v10m-1 2-4 3-4-3"/><line stroke-width="${_sw}" ${stroke} x1="8" y1="1" x2="8" y2="19" ${slr} /><line stroke-width="${_sw}" ${slr} ${stroke} x1="1" y1="8" x2="19" y2="8" />`,
        chartCluster: `<path ${fn} ${sw} d="M7 10a1 1 0 0 0 6 0 1 1 0 0 0-6 0m3-3V4a1 1 0 0 0 0-3 1 1 0 0 0 0 3m-3 6H4a1 1 0 0 0-3 0 1 1 0 0 0 3 0m6 3v3a1 1 0 0 0 0 3 1 1 0 0 0 0-3m3-6h3a1 1 0 0 0 3 0 1 1 0 0 0-3 0" />`,
        arrowRight: `<path ${solid0} d="M18 10 3 1q4.5 9 0 18z" ${sljr} />`,
        arrowTop: `<path ${solid0} d="M10 2 1 17q9-4.5 18 0z" ${sljr} />`,
        arrowLeft: `<path ${solid0} d="m2 10 15-9q-4.5 9 0 18z" ${sljr} />`,
        arrowBottom: `<path ${solid0} d="M10 18 1 3q9 4.5 18 0z" ${sljr} />`,
        chartSparkbar: `<path ${fn}  ${sw} ${slr} d="M2 5h16M2 10h16M2 15h16" ${o3} /><path ${fn}  ${sw} ${slr} d="M2 5h13M2 10h9m-9 5h5" />`,
        vueDataUi: `<path ${rrAttrs} d="m1 2 9 17M1 2h3l6 11h3m-3 6 3-6"/><path ${rrAttrs} d="m10 13 4.974-9.549L19 13h-3l-1.266-3.447L13 13z"/>`,
        triangleFill: `<path ${stroke} ${fill} stroke-width="${_sw}" ${sl_none} d="M10 3 1 17h18z"/>`,
        squareFill: `<path ${fill} ${sw}${sl_none} d="M2 2v16h16V2z"/>`,
        diamondFill: `<path ${fill}  ${sw} ${sl_none} d="m10 1-9 9 9 9 9-9z"/>`,
        pentagonFill: `<path ${fill} ${sw} ${sl_none} d="M10 1 1 9l4 10h11l3-10Z"/>`,
        hexagonFill: `<path ${fill}  ${sw} ${sl_none} d="M10 1 2 6v8l8 5 8-5V6Z"/>`,
        circleFill: `<path ${sw} ${fill} ${sl_none} d="M10 1a1 1 0 0 0 0 18 1 1 0 0 0 0-18"/>`,
        numbers: `<path ${fn} ${stroke} stroke-width="${_sw / 2}" ${fn} ${sl_none} d="m2 3 2-2v5m4-3c0-1 1-2 2-2s2 1 2 2c0 2-4 0-4 3h4m3-5h3l-2 2c1 0 2 0 2 1 0 2-2 2-3 2M4 13V8l-2 3h4m6-3H8c0 3 4 1 4 3 0 1-1 2-2 2s-2-1-2-2m10 0a1 1 0 0 0-3 1 1 1 0 0 0 3-1m-3 0c0-3 2-3 3-3M2 15h4c-1 3-4 2-4 5m6-4c0-1 1-1 1-1h2c1 0 1 1 1 1s0 1-1 1H9s-1 0-1-1m1 1s-1 0-1 1v1c0 1 1 1 1 1h2c1 0 1-1 1-1v-1s0-1-1-1m7 0a1 1 0 0 0-3-1 1 1 0 0 0 3 1m0 0c0 3-2 3-3 3"/>`,
        people: `<path ${rrAttrs} d="M6 1C4 1 4 5 6 5s2-4 0-4m0 5c-4 0-1 4 0 4m0-4c4 0 1 4 0 4m-2 0 1 9m3-9-1 9m-3 0h4M4 5c-2 1-3 5-3 7M14 1c-2 0-2 4 0 4s2-4 0-4m0 5c-4 0-1 4 0 4s4-4 0-4m-2 4 1 9m3-9-1 9m-3 0h4m0-14c2 1 3 5 3 7M8 5c2 3 2 5 2 7 0-2 0-4 2-7"/>`,
        accordion: `<path ${rrAttrs} d="M2 2h16l-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2 2H2l2-2-2-2 2-2-2-2 2-2-2-2 2-2z"/><path ${solid} ${o3} ${sl_none} d="M2 2h16l-2 2H4Z" /><path ${solid} ${o3} ${sl_none} d="M2 6h16l-2 2H4Z" /><path ${solid} ${o3} ${sl_none} d="M2 10h16l-2 2H4Z" /><path ${solid} ${o3} ${sl_none} d="M2 14h16l-2 2H4Z" />`,
        trend: `<path ${rcAttrs} stroke-kinejoin="round" d="m1 6 3-2 3 2M4 4v9m3 3s0 2 2 2c3 0 1-9 3-9s2 4 3 4c3 1 2.667-7.333 4-11"/>`,
        chartStripPlot: `<path ${sw} ${fn} d="M4 16a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0-3a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0-4a1 1 0 0 0 0 2 1 1 0 0 0 0-2m4 2a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0-3a1 1 0 0 0 0 2 1 1 0 0 0 0-2M4 2a1 1 0 0 0 0 2 1 1 0 0 0 0-2m8 13a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0-5a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0-3a1 1 0 0 0 0 2 1 1 0 0 0 0-2M8 5a1 1 0 0 0 0 2 1 1 0 0 0 0-2m8 7a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0-2a1 1 0 0 0 0 2 1 1 0 0 0 0-2m0 6a1 1 0 0 0 0 2 1 1 0 0 0 0-2" />`,
        chartDumbbell: `<path ${sw} ${slr} d="M3 2a1 1 0 0 0 0 2 1 1 0 0 0 0-2m7 0a1 1 0 0 0 0 2 1 1 0 0 0 0-2M4 3h5M5 9a1 1 0 0 0 0 2 1 1 0 0 0 0-2m12 0a1 1 0 0 0 0 2 1 1 0 0 0 0-2M6 10h10m-8 6a1 1 0 0 0 0 2 1 1 0 0 0 0-2m7 0a1 1 0 0 0 0 2 1 1 0 0 0 0-2m-6 1h5" />`,
        chartWordCloud: `<text x="10" y="10" ${fill} text-anchor="middle" font-size="4.5" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="5.5" y="6" ${fill} text-anchor="middle" font-size="2.5" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="15" y="6" ${fill} text-anchor="middle" font-size="2" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="5" y="13.5" ${fill} text-anchor="middle" font-size="2" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="14.5" y="14.4" ${fill} text-anchor="middle" font-size="2.5" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="10" y="3" ${fill} text-anchor="middle" font-size="1.8" font-family="Arial" dominant-baseline="middle">WORDS</text><text x="10" y="17.5" ${fill} text-anchor="middle" font-size="2" font-family="Arial" dominant-baseline="middle">WORDS</text>`,
        chartWordCloudZh: `<text x="10" y="10" ${fill} text-anchor="middle" font-size="6" font-family="Arial" dominant-baseline="middle">词语</text><text x="5" y="5" ${fill} text-anchor="middle" font-size="3" font-family="Arial" dominant-baseline="middle">词语</text><text x="15" y="5" ${fill} text-anchor="middle" font-size="3" font-family="Arial" dominant-baseline="middle">词语</text><text x="10" y="5" ${fill} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="10" y="2" ${fill} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="2" y="8" ${fill} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="2" y="11.5" ${fill} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="18" y="8" ${fill} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="18" y="11.5" ${fill} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="5" y="14.5" ${fill} text-anchor="middle" font-size="3" font-family="Arial" dominant-baseline="middle">词语</text><text x="15" y="14.5" ${fill} text-anchor="middle" font-size="3" font-family="Arial" dominant-baseline="middle">词语</text><text x="10" y="14.5" ${fill} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text><text x="10" y="18" ${fill} text-anchor="middle" font-size="1.5" font-family="Arial" dominant-baseline="middle">词语</text>`,
        chartFlow: `<path stroke="transparent" stroke-width="${_sw}" ${sl_none} ${fill} d="M2 2h2v7H2zm7 0h2v4H9zm7 0h2v2h-2zM2 11h2v7H2zm7-3h2v3H9zm0 6h2v2H9zm7-8h2v2h-2zm0 4h2v2h-2zm0 4h2v2h-2zM4 2h5v4H4zm0 4 5 2v3L4 9zm7-4h5v2h-5zm0 2 5 2v2l-5-2zm-7 7 5 3v2l-5-3zm7-3 5 2v2l-5-2zm0 6h5v2h-5z"/>`,
        pause: `<path ${solid} strole-linecap="round" ${sljr} d="M3 4v12c0 1 1 2 2 2h1c1 0 2-1 2-2V4c0-1-1-2-2-2H5C4 2 3 3 3 4m9 0v12c0 1 1 2 2 2h1c1 0 2-1 2-2V4c0-1-1-2-2-2h-1c-1 0-2 1-2 2"/>`,
        play: `<path ${fill} stroke-width="${_sw}" ${sl_none} ${fn} d="M3 4v12c0 1 1 2 2 2h1c1 0 12-5 12-7v-1C18 8 7 2 6 2H5C4 2 3 3 3 4"/>`,
        stop: `<path ${fill} stroke-width="${_sw}" ${sl_none} ${fn} d="M10 8 4 2H3L2 3v1l6 6-6 6v1l1 1h1l6-6 6 6h1l1-1v-1l-6-6 6-6V3l-1-1h-1z"/>`,
        battery: `<path ${rrAttrs} d="M2 6v8c0 2 1 2 2 2h11c1 0 2 0 2-2v-1s1 0 1-1V8c0-1-1-1-1-1V6c0-2-1-2-2-2H4C3 4 2 4 2 6"/><path ${fill} ${o6} ${sn} d="M4 7v6c0 1 1 1 1 1h6V6H5S4 6 4 7"/>`,
        chartStackbar: `<path ${rrAttrs} d="M8 18h4V8c0-1-1-1-1-1H9S8 7 8 8zm-6 0h4v-6c0-1-1-1-1-1H3s-1 0-1 1zm12 0h4V3c0-1-1-1-1-1h-2s-1 0-1 1zM2 14h4m2-3h4m2-4h4m-4 5"/><path ${sn} ${o3} ${fill} d="M2 14h4v4H2z" /><path ${sn} ${o3} ${fill} d="M8 11h4v7H8z" /><path ${sn} ${o3} ${fill} d="M14 7h4v11h-4z" />`,
        starFace: `<path ${stroke} stroke-width="${_sw} ${sl_none} ${fn} d="m1.333 8.226 5.976-.895L9.96 1.9l2.7 5.406 5.983.843-4.308 4.237 1.047 5.951-5.36-2.788-5.337 2.836.995-5.96ZM6.989 10c.631-1.099 1.649-.753 1.975.02m2.035 0c.672-1.078 1.608-.732 2.016.021m-5.516 1.982c1.233 2.928 4.602 1.849 4.998-.023" />`,
        chartBullet: `<path ${rrAttrs} d="M1 7v6h18V7z"/><path ${fill} d="M1 9h11v2H1Z" ${sn} ${slr}/><path ${fill} d="M15 5v10h1V5Z" ${sn} ${slr}/>`,
        palette: `<path ${rcAttrs} d="M10 2a1 1 0 0 0 0 16s4 0 4-2c0-3-2-2-3-3-1-3 3-2 4-2 5 0 4-9-5-9"/><path ${solid} d="M6 6a1 1 0 0 0 2 2 1 1 0 0 0-2-2" ${op(0.7)}/><path ${solid} ${o5} d="M6 11a1 1 0 0 0 2 2 1 1 0 0 0-2-2"/><path ${solid} d="M11 5a1 1 0 0 0 2 2 1 1 0 0 0-2-2"/>`,
        colorPicker: `<path d="M2 16c0 1 1 2 2 2s2-2 5-2l7-8-4-4-8 7m0 0c0 3-2 4-2 5m14-8c1 1 3-1 2-2l-4-4c-1-1-3 1-2 2m6 2c3-3-1-7-4-4" ${rrAttrs}/><path d="M2 16c0 1 1 2 2 2s2-2 5-2l4.347-5.011H4.022L4 11m0 0c0 3-2 4-2 5" ${sl_none} ${fill} ${o4}/>`,
        boxes: `<path ${rcAttrs} d="M10 11 6 9l-4 2v5l4 2 4-2zm0 0 4-2 4 2v5l-4 2-4-2M6 9V4l4-2 4 2v5M6 4l4 2 4-2M2 11l4 2 4-2m0 0 4 2 4-2m-8-5v5m-4 2v5m8-5v5"/><path ${solid} ${o5} d="m6 4 4 2v5L6 9z"/><path ${solid} ${o5} d="m2 11 4 2v5l-4-2z"/><path ${solid} ${o5} d="m10 11 4 2v5l-4-2z"/>`,
        homeFilled: `<path ${fill} ${sw} ${sl_none} d="m2 10 8-8 8 8M4 10v7c0 1 0 1 1 1h3v-6h4v6h3c1 0 1 0 1-1v-7m-8 8"/>`,
        hourglass: `<path ${rrAttrs} d="M4 1h12m-3 0c3 2 1 4 1 4M7 1C4 3 6 5 6 5M4 19h12M6 5c4 5 4 5 0 10m8-10c-4 5-4 5 0 10m-1 4c3-2 1-4 1-4m-7 4c-3-2-1-4-1-4"/><path ${o3} ${solid} d="M7 18h6c1-3-2-5-3-5s-4 2-3 5"/>`,
        text: `<path d="M1 3V1h12v3c0 1-2 1-2 0V3H8v14h1c1 0 1 2 0 2H5c-1 0-1-2 0-2h1V3H3v1c0 1-2 1-2 0zm10 5h8" ${sl_none} ${fill}/><path d="M14 8h5m-8 3h8m-8 3h8" ${rrAttrs}/>`,
        bringToFront: `<path ${fill} d="M7 6h6s1 0 1 1v6s0 1-1 1H7s-1 0-1-1V7s0-1 1-1"/><path ${rrAttrs} d="M8 4V3s0-1-1-1H3C2 2 2 3 2 3v4c0 1 1 1 1 1h1m8 8v1c0 1 1 1 1 1h4s1 0 1-1v-4s0-1-1-1h-1"/>`,
        bringToBack: `<path ${fill} d="M7 13v-3h1c2 0 2-1 2-2V7h3v3h-1c-1 0-2 0-2 2v1z"/><path ${fn} ${stroke} ${sl_none} d="M9 8V3s0-1-1-1H3C2 2 2 3 2 3v5c0 1 1 1 1 1h5c1 0 1-1 1-1m2 4v5c0 1 1 1 1 1h5s1 0 1-1v-5s0-1-1-1h-5c-1 0-1 1-1 1"/>`,
        chartStackline: `<path d="M2 16v2h16v-8l-4 4-3-2-3 3-3-2Z" ${solid} ${op(0.9)}/><path d="m2 16 3-3 3 2 3-3 3 2 4-4V6l-4 2-3-2-3 3-3-1-3 1Z" ${solid}" ${o6}/><path d="M2 9V2h16v4l-4 2-3-2-3 3-3-1Z" ${solid} ${o3}/><path d="M1 1v18h18" ${stroke} ${sl_none} ${fn}/>`,
        pie: `<path d="M10 1a1 1 0 0 0 0 18 1 1 0 0 0 0-18v9l4.025 8.049M10 10H1m9 0 4 8" ${rrAttrs}/><path d="m10 10 4 8c-3.413 2.069-12.365 1.271-13-8z" ${solid} ${o3}/><path d="M10 1c-7.472.391-9.069 6.876-9 9h9z" ${solid} ${o5}/>`,
        network: `<path d="M7 15h6c1 0 1 1 1 1v2s0 1-1 1H7c-1 0-1-1-1-1v-2s0-1 1-1m-6 2h5m8 0h5m-9-2v-3m-6 0h12c1 0 1-1 1-1V9s0-1-1-1H4S3 8 3 9v2s0 1 1 1m0-6h12c1 0 1-1 1-1V3c0-1-1-1-1-1H4S3 2 3 3v2s0 1 1 1m6 0v2" ${rrAttrs}/><path d="M6 4h1m2 0h5m-8 6h1m2 0h5" ${stroke} stroke-width="${_sw / 2}" ${fn} ${sl_none}/>`,
        chipAi: `<path d="M5 3h10c1 0 2 1 2 2v10c0 1-1 2-2 2H5c-1 0-2-1-2-2V5c0-1 1-2 2-2m5-2v2M7 1v2m6-2v2M1 10h2M1 7h2m-2 6h2m7 4v2m-3-2v2m6-2v2m4-9h2m-2-3h2m-2 6h2" ${rrAttrs}/><path d="M10 6c-1 3-1 3-4 4 3 1 3 1 4 4 1-3 1-3 4-4-3-1-3-1-4-4" ${solid} />`,
        binary: `<path d="M4 1C2 1 2 4 4 4s2-3 0-3m4 0v3m4-3c-2 0-2 3 0 3s2-3 0-3m4 0v3M4 6v3m4-3C6 6 6 9 8 9s2-3 0-3m4 0v3m4-3c-2 0-2 3 0 3s2-3 0-3M4 11c-2 0-2 3 0 3s2-3 0-3m4 0v3m4-3v3m4-3v3M4 16v3m4-3c-2 0-2 3 0 3s2-3 0-3m4 0c-2 0-2 3 0 3s2-3 0-3m4 0v3" ${stroke} stroke-width="${_sw / 2}" ${fn} ${sl_none}/>`,
        chipBinary: `<path d="M5 3h10c1 0 2 1 2 2v10c0 1-1 2-2 2H5c-1 0-2-1-2-2V5c0-1 1-2 2-2m5-2v2M7 1v2m6-2v2M1 10h2M1 7h2m-2 6h2m7 4v2m-3-2v2m6-2v2m4-9h2m-2-3h2m-2 6h2" ${rrAttrs}/><path d="M6 6C4 6 4 9 6 9s2-3 0-3m4 0v3m4-3c-2 0-2 3 0 3s2-3 0-3m-8 5v3m4-3c-2 0-2 3 0 3s2-3 0-3m4 0v3" ${stroke} stroke-width="${_sw / 3}" ${fn} ${sl_none}/>`,
        blur: blur(_s),
        sqlQuery: `<path d="M17 10V3C17 1 3 1 3 3v7m0-7c0 2 14 2 14 0" ${rrAttrs}/><path d="M5.994 13.991C4.847 12.359 2.399 12.962 2 14c-.157 2.025 4.231.984 4 3-.857 1.638-3.696 1.047-4 0m8-4c-3 0-3 5 0 5s3-5 0-5m1 5 1 1m2-6v5h4" ${stroke} stroke-width="${_sw / 1.5}" ${fn} ${sl_none}/><path d="M10 11V7M8 9l2-2 2 2" ${stroke} stroke-width="${_sw / 1.5}" ${fn} ${sl_none}/>`,
        gisLayerQuery: `<path d="M5.994 13.991C4.847 12.359 2.399 12.962 2 14c-.157 2.025 4.231.984 4 3-.857 1.638-3.696 1.047-4 0m8-4c-3 0-3 5 0 5s3-5 0-5m1 5 1 1m2-6v5h4" ${stroke} stroke-width="${_sw / 1.5}" ${fn} ${sl_none}/><path d="M10 11V7M8 9l2-2 2 2" ${stroke} stroke-width="${_sw / 1.5}" ${fn} ${sl_none}/><path d="M10 1 2 3m0 0 8 2 8-2-8-2M2 6l4 1m12 2-2.482.619M14 7l4-1M2 9l2.493.629M2 6l6-1.5M18 6l-6-1.5M2 9l3-1m13 1-3-1" ${rrAttrs}/>`,
        magnify: `<path d="M8 1a1 1 0 0 0 0 14A1 1 0 0 0 8 1m4.95 11.95L19 19" ${rrAttrs}/><path d="M8 4a1 1 0 0 0 0 8 1 1 0 0 0 0-8" ${solid} ${op(0.1)} /><path d="M12 8a1 1 0 0 0-8 0" ${stroke} ${slr} stroke-width="${_sw / 3}" ${fn} ${o4} /><path d="M8 4c-.788-.017-2.544.345-3.456 2.003" ${stroke} ${slr} stroke-width="${_sw / 3}" ${fn} />`,
        spark: `<path d="M10 1c-2 7-2 7-9 9 7 2 7 2 9 9 2-7 2-7 9-9-7-2-7-2-9-9" ${solid}/>`,
        doubleSpark: `<path d="M1 13c5-1 5-1 6-6 1 5 1 5 6 6-5 1-5 1-6 6-1-5-1-5-6-6M15 1c-.514 3.478-.514 3.478-4 4 3.505.505 3.499.505 4 4 .513-3.489.513-3.495 4-4-3.474-.503-3.48-.51-4-4" ${solid}/>`,
        listType: `<path d="M7 4h11M7 10h11M7 16h11" ${rrAttrs}/><path d="M2 3h2v2H2z" ${fill} ${stroke} stroke-width="${_sw / 2}" stroke-linejoin="miter"/><path ${fill} d="m3 9-1.2 2h2.4z" ${stroke} stroke-width="${_sw / 2}" stroke-linejoin="miter"/><path d="M3 14.8a1 1 0 0 0 .002 2.4 1 1 0 0 0-.003-2.4" ${fill} ${stroke} stroke-width="${_sw / 2}"/>`,
        calendar: `<path d="M7 1v3m6-3v3M5 3H4C3 3 2 4 2 5v11c0 1 1 2 2 2h12c1 0 2-1 2-2V5c0-1-1-2-2-2h-1M9 3h2M2 7h16" ${rrAttrs}/><path d="M4 10h2v1H4zm5 0h2v1H9zm5 0v1h2v-1zM4 14h2v1H4zm5 0h2v1H9z" ${stroke} stroke-width="${_sw / 3}" ${fill} ${sl_none}/>`,
        test: `<path d="M4 19h12c2 0 2-2 2-2l-6-8V3c1 0 1-2 0-2H8C7 1 7 3 8 3v6l-6 8s0 2 2 2" ${rrAttrs}/><path d="M5 14c3 2 6-2 10 0l2.141 2.847c.015.793-.071 1.157-1.141 1.153H4c-.75.014-1.171-.252-1.134-1.131z" ${solid} ${sl_none} ${o4}/><path d="M5 14c3 2 6-2 10 0" ${stroke} ${slr} stroke-width="${_sw / 3}"/>`,
        pi: `<path d="M1 8c1-5 3-6 4-6h13c1 0 1 2 0 2h-3s-1 4-1 10c0 4 3 3 5 0-1 7-7 6-7 0 0-5 1-10 1-10H9C8 9 7 17 7 17c-1 3-4 2-4 0C7 13 7 4 7 4 4 4 3 5 1 8" ${sl_none} ${fill}/>`,
        fileSvg: `<path d="M18 10V7l-5-5m0 0v5h5m-5-5H2v8" ${rrAttrs}/><text x="10" y="18.5" ${fill} text-anchor="middle" font-size="9" font-family="Arial">SVG</text>`,
        filePdf: `<path d="M18 10V7l-5-5m0 0v5h5m-5-5H2v8" ${rrAttrs}/><text x="10" y="18.5" ${fill} text-anchor="middle" font-size="9" font-family="Arial">PDF</text>`,
        fileCsv: `<path d="M18 10V7l-5-5m0 0v5h5m-5-5H2v8" ${rrAttrs}/><text x="10" y="18.5" ${fill} text-anchor="middle" font-size="9" font-family="Arial">CSV</text>`,
        filePng: `<path d="M18 10V7l-5-5m0 0v5h5m-5-5H2v8" ${rrAttrs}/><text x="10" y="18.5" ${fill} text-anchor="middle" font-size="9" font-family="Arial">PNG</text>`,
        puzzleFill: `<path d="M16.579 9.304h-1.177V6.167c0-.871-.706-1.569-1.569-1.569h-3.137V3.421a1.96 1.96 0 0 0-1.96-1.96 1.96 1.96 0 0 0-1.962 1.96v1.177H3.638a1.57 1.57 0 0 0-1.569 1.569v2.98h1.177c1.175 0 2.116.941 2.116 2.117a2.11 2.11 0 0 1-2.116 2.118H2.069v2.98a1.57 1.57 0 0 0 1.569 1.569h2.98v-1.177c0-1.175.941-2.116 2.118-2.116 1.176 0 2.117.941 2.117 2.116v1.177h2.98a1.57 1.57 0 0 0 1.569-1.569v-3.136h1.177a1.96 1.96 0 0 0 1.96-1.962 1.96 1.96 0 0 0-1.96-1.96" ${sl_none} ${fill}/>`,
        npmx: `<path d="m17 2-6 16H9l6-16zM3 13v3h3v-3z" ${sl_none} ${fill}/>`,
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
    return `<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="${duration}" repeatCount="indefinite"/>`;
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
    return String(svgString).replace(
        /\sstroke(?:-(?:width|linecap|linejoin))?="[^"]*"/g,
        '',
    );
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

        expBlock = `<g transform="${expTransform.value}"><g stroke="${expProps.value.stroke}" stroke-width="${expProps.value.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">${expProps.value.isSpin ? spinAnimate(cx, cy, expProps.value.spinDuration) : ''}${expClean}</g></g>`;
    }

    let subBlock = '';
    if (hasSub.value && subProps.value.name) {
        const subRaw = getIconPath(subProps.value.name, {
            stroke: subProps.value.stroke,
            strokeWidth: subProps.value.strokeWidth,
        });
        const subClean = stripStrokeAttributes(subRaw);

        const { cx, cy } = nominalCenter.value;

        subBlock = `<g transform="${subTransform.value}"><g stroke="${subProps.value.stroke}" stroke-width="${subProps.value.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" fill="none">${subProps.value.isSpin ? spinAnimate(cx, cy, subProps.value.spinDuration) : ''}${subClean}</g></g>`;
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

<script setup>
import { computed } from 'vue';

const props = defineProps({
    quanta: {
        type: String,
        default: null,
    },
    backgroundColor: {
        type: String,
        default: '#e1e5e8',
    },
    color: {
        type: String,
        default: '#000000',
    },
    // coordinates from top left of a
    x: {
        type: Number,
        default: 0,
    },
    y: {
        type: Number,
        default: 0,
    },
    thickness: {
        type: Number,
        default: 1,
    },
});

const segments = {
    /**
     * clockwise from top (last: g)
     *     a
     *    ----
     * f |    | b
     *    ----
     * e | g  | c
     *    ----
     *     d
     */
    0: '1111110',
    1: '0110000',
    2: '1101101',
    3: '1111001',
    4: '0110011',
    5: '1011011',
    6: '1011111',
    7: '1110000',
    8: '1111111',
    9: '1111011',
    '-': '0000001',
    X: '0000000',
};

const SEG_LEN = 26;
const THICK_SCALE = 2;
const L_SEG_X = -2;
const R_SEG_X = 28;
const UP_SEG_Y = 2;
const LO_SEG_Y = 32;
const MID_SEG_Y = 30;
const BOT_SEG_Y = 60;
const DEC_OFFSET_X = -8;
const DEC_BASE_RADIUS = 2;

const segmentThickness = computed(() => THICK_SCALE * (props.thickness || 1));

const digit = computed(() =>
    Object.hasOwn(segments, props.quanta) ? segments[props.quanta] : segments.X,
);

function horizontalPath(x, y, thickness, top = false) {
    if (top) {
        return `M ${x} ${y} L ${x + thickness} ${y - thickness} L ${x + SEG_LEN - thickness} ${y - thickness} L ${x + SEG_LEN} ${y} L ${x + SEG_LEN - thickness} ${y + thickness} L ${x + thickness} ${y + thickness} Z`;
    }

    return `M ${x + thickness} ${y - thickness} L ${x} ${y} L ${x + thickness} ${y + thickness} L ${x + SEG_LEN - thickness} ${y + thickness} L ${x + SEG_LEN} ${y} L ${x + SEG_LEN - thickness} ${y - thickness} L ${x + thickness} ${y - thickness}`;
}

function verticalPath(x, y, thickness, left = false) {
    const direction = left ? -1 : 1;
    const inner = x - direction * thickness;
    const outer = x + direction * thickness;

    return `M ${inner} ${y + SEG_LEN - thickness} L ${inner} ${y + thickness} L ${x} ${y} L ${outer} ${y + thickness} L ${outer} ${y + SEG_LEN - thickness} L ${x} ${y + SEG_LEN} L ${inner} ${y + SEG_LEN - thickness}`;
}

const paths = computed(() => {
    const { x, y } = props;
    const thickness = segmentThickness.value;
    return [
        { name: 'a', d: horizontalPath(x, y, thickness, true) },
        {
            name: 'b',
            d: verticalPath(x + R_SEG_X, y + UP_SEG_Y, thickness),
        },
        {
            name: 'c',
            d: verticalPath(x + R_SEG_X, y + LO_SEG_Y, thickness),
        },
        { name: 'd', d: horizontalPath(x, y + BOT_SEG_Y, thickness) },
        {
            name: 'e',
            d: verticalPath(x + L_SEG_X, y + LO_SEG_Y, thickness, true),
        },
        {
            name: 'f',
            d: verticalPath(x + L_SEG_X, y + UP_SEG_Y, thickness, true),
        },
        { name: 'g', d: horizontalPath(x, y + MID_SEG_Y, thickness) },
    ];
});
</script>

<template>
    <g v-if="![undefined, null, '.'].includes(quanta)" data-cy="digit">
        <path
            v-for="(segment, index) in paths"
            :key="segment.name"
            :data-cy="`digit-${segment.name}`"
            :d="segment.d"
            :fill="digit[index] === '1' ? color : backgroundColor"
            stroke="none"
        />
    </g>
    <g v-if="quanta == '.'">
        <circle
            data-cy="digit-decimal"
            :cx="x + DEC_OFFSET_X"
            :cy="y + BOT_SEG_Y"
            :r="DEC_BASE_RADIUS + segmentThickness / 2"
            :fill="color"
        />
    </g>
</template>

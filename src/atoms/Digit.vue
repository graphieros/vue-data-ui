<script setup>
import { ref, computed } from "vue";

const props = defineProps({
    quanta: {
        type: String,
        default: null
    },
    backgroundColor: {
        type: String,
        default: "#e1e5e8"
    },
    color: {
        type: String,
        default: "#000000"
    },
    // coordinates from top left of a
    x: {
        type: Number,
        default: 0
    },
    y: {
        type: Number,
        default: 0
    }
})

const segments = ref({
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
    X: '0000000'
})

const digit = computed(() => {
    if([undefined, null].includes(props.quanta)) {
        return segments.value.X;
    } else {
        return segments.value[props.quanta]
    }
})
</script>

<template>
    <g v-if="![undefined, null, '.'].includes(quanta)" data-cy="digit">
        <!-- BACKGROUND -->
        <!-- a -->
        <path data-cy="digit-a" :d="`M ${x} ${y} L ${x+2} ${y-2} L ${x+24} ${y-2} L ${x+26} ${y} L ${x+24} ${y+2} L ${x+2} ${y+2}Z`" :fill="digit[0] == 1 ? color : backgroundColor" stroke="none"/>
        <!-- b -->
        <path data-cy="digit-b" :d="`M ${x+26} ${y+26} L ${x+26} ${y+4} L ${x+28} ${y+2} L ${x+30} ${y+4} L ${x+30} ${y+26} L ${x+28} ${y+28} L ${x+26} ${y+26}`" :fill="digit[1] == 1 ? color: backgroundColor" stroke="none"/>
        <!-- c -->
        <path data-cy="digit-c" :d="`M ${x+26} ${y+56} L ${x+26} ${y+34} L ${x+28} ${y+32} L ${x+30} ${y+34} L ${x+30} ${y+56} L ${x+28} ${y+58} L ${x+26} ${y+56}`" :fill="digit[2] == 1 ? color : backgroundColor" stroke="none"/>
        <!-- d -->
        <path data-cy="digit-d" :d="`M ${x+2} ${y+58} L ${x} ${y+60} L ${x+2} ${y+62} L ${x+24} ${y+62} L ${x+26} ${y+60} L ${x+24} ${y+58} L ${x+2} ${y+58}`" :fill="digit[3] == 1 ? color : backgroundColor" stroke="none"/>
        <!-- e -->
        <path data-cy="digit-e" :d="`M ${x} ${y+34} L ${x-2} ${y+32} L ${x-4} ${y+34} L ${x-4} ${y+56} L ${x-2} ${y+58} L ${x} ${y+56} L ${x} ${y+34}`" :fill="digit[4] == 1 ? color : backgroundColor" stroke="none"/>
        <!-- f -->
        <path data-cy="digit-f" :d="`M ${x-2} ${y+2} L ${x} ${y+4} L ${x} ${y+26} L ${x-2} ${y+28} L ${x-4} ${y+26} L ${x-4} ${y+4} L ${x-2} ${y+2}`" :fill="digit[5] == 1 ? color : backgroundColor" stroke="none"/>
        <!-- g -->
        <path data-cy="digit-g" :d="`M ${x+2} ${y+28} L ${x} ${y+30} L ${x+2} ${y+32} L ${x+24} ${y+32} L ${x+26} ${y+30} L ${x+24} ${y+28} L ${x+2} ${y+28}`" :fill="digit[6] == 1 ? color : backgroundColor" stroke="none"/>
    </g>
    <g v-if="quanta == '.'">
        <circle data-cy="digit-decimal" :cx="x - 8" :cy="y + 60" :r="3" :fill="color"/>
    </g>
</template>
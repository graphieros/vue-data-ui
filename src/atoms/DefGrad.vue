<script setup>
defineOptions({ inheritAttrs: false });

defineProps({
    id: { type: String, required: true },

    // linear | radial
    t: {
        type: String,
        required: true,
        validator: (v) => ['linear', 'radial'].includes(v),
    },

    // [[offset, stopColor], ...]
    stops: {
        type: Array,
        required: true,
        validator: (v) =>
            v.every(
                (stop) =>
                    Array.isArray(stop) &&
                    stop.length === 3 &&
                    ['number', 'string', 'number'].includes(typeof stop[0]) &&
                    typeof stop[1] === 'string' &&
                    typeof stop[2] === 'number',
            ),
    },
});
</script>

<template>
    <linearGradient v-if="t === 'linear'" v-bind="$attrs" :id>
        <stop
            v-for="([offset, color, opacity], i) in stops"
            :key="i"
            :offset
            :stop-color="color"
            :stop-opacity="opacity"
        />
    </linearGradient>

    <radialGradient v-else v-bind="$attrs" :id>
        <stop
            v-for="([offset, color, opacity], i) in stops"
            :key="i"
            :offset
            :stop-color="color"
            :stop-opacity="opacity"
        />
    </radialGradient>
</template>

<script setup>
import { ref, computed } from "vue";
import { treeShake, shiftHue, opacity, convertConfigColors, palette, convertColorToHex } from "../lib";
import mainConfig from "../default_configs.json";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Array,
        default() {
            return [];
        }
    }
})

const uid = ref(`vue-ui-sparkstackbar-${Math.random()}`);
const defaultConfig = ref(mainConfig.vue_ui_sparkstackbar);

const stackConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    const reconciled = treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconciled);
});

const svg = ref({
    width: 500,
    height: 16,
});

const total = computed(() => {
    return props.dataset.map(d => d.value).reduce((a, b) => a + b, 0);
});

const computedDataset = computed(() => {
    return props.dataset.map((d, i) => {
        return {
            ...d,
            color: convertColorToHex(d.color) || palette[i] || palette[i % palette.length],
            proportion: d.value / total.value,
            width: d.value / total.value * svg.value.width,
            proportionLabel: `${Number((d.value / total.value * 100).toFixed(stackConfig.value.style.legend.percentage.rounding)).toLocaleString()}%`,
        }
    });
});

const drawableDataset = computed(() => {
    let start = 0;
    const datapoints = [];
    for (let i = 0; i < computedDataset.value.length; i += 1) {
        datapoints.push({
            ...computedDataset.value[i],
            start
        });
        start += computedDataset.value[i].width
    }
    return datapoints;
})

</script>

<template>
    <div :style="`width:100%; background:${stackConfig.style.backgroundColor}`">
        <!-- TITLE -->
        <div v-if="stackConfig.style.title.text" :style="`width:calc(100% - 12px);background:${stackConfig.style.backgroundColor};margin:0 auto;margin:${stackConfig.style.title.margin};padding: 0 6px;text-align:${stackConfig.style.title.textAlign}`">
            <div :style="`font-size:${stackConfig.style.title.fontSize}px;color:${stackConfig.style.title.color};font-weight:${stackConfig.style.title.bold ? 'bold' : 'normal'}`">
                {{ stackConfig.style.title.text }}
            </div>
            <div v-if="stackConfig.style.title.subtitle.text" :style="`font-size:${stackConfig.style.title.subtitle.fontSize}px;color:${stackConfig.style.title.subtitle.color};font-weight:${stackConfig.style.title.subtitle.bold ? 'bold' : 'normal'}`">
                {{ stackConfig.style.title.subtitle.text }}
            </div>
            
        </div>
        <!-- CHART -->
        <svg width="100%" :viewBox="`0 0 ${svg.width} ${svg.height}`">
        <defs>
            <linearGradient v-for="(rect, i) in drawableDataset" :key="`stack_gradient_${i}`" gradientTransform="rotate(90)" :id="`stack_gradient_${i}_${uid}`">
                <stop offset="0%" :stop-color="rect.color"/>
                <stop offset="50%" :stop-color="`${shiftHue(rect.color, 0.05)}${opacity[100 - stackConfig.style.bar.gradient.intensity]}`"/>
                <stop offset="100%" :stop-color="rect.color"/>
            </linearGradient>
            <clipPath id="stackPill" clipPathUnits="objectBoundingBox">
                <rect
                    x="0.005"
                    y="-2"
                    width="0.99"
                    height="5"
                    rx="3"
                    ry="3"
                    :fill="stackConfig.style.backgroundColor"
                />
            </clipPath>
        </defs>
            <g clip-path="url(#stackPill)">
                <rect :x="0" :y="0" :height="svg.height" :width="svg.width" :fill="stackConfig.style.bar.gradient.underlayerColor"/>
                <rect 
                    v-for="(rect, i) in drawableDataset" :key="`stack_${i}`"
                    :x="rect.start"
                    :y="0"
                    :width="rect.width"
                    :height="svg.height"
                    :fill="stackConfig.style.bar.gradient.show ? `url(#stack_gradient_${i}_${uid})` : rect.color"
                    :stroke="stackConfig.style.backgroundColor"
                    stroke-linecap="round"
                />
            </g>
        </svg>
        <div v-if="stackConfig.style.legend.show" :style="`background:${stackConfig.style.backgroundColor};display:flex;flex-wrap:wrap;column-gap:12px;width:calc(100% - 12px);margin:0 auto; padding: 0 6px;justify-content:${stackConfig.style.legend.textAlign === 'left' ? 'flex-start' : stackConfig.style.legend.textAlign === 'right' ? 'flex-end' : 'center'}`">
            <div v-for=" (rect, i) in drawableDataset" :style="`font-size:${stackConfig.style.legend.fontSize}px`">
                <div style="display:flex;flex-direction:row;align-items:center;gap:4px;justify-content:center">
                    <svg :height="`${stackConfig.style.legend.fontSize}px`" :width="`${stackConfig.style.legend.fontSize}px`" viewBox="0 0 10 10">
                        <circle :cx="5" :cy="5" :r="5" :fill="rect.color"/>
                    </svg>
                    <span :style="`color:${stackConfig.style.legend.name.color}`">
                        {{ rect.name }}
                    </span>
                    <span v-if="stackConfig.style.legend.percentage.show" :style="`font-weight:${stackConfig.style.legend.percentage.bold ? 'bold': 'normal'};color:${stackConfig.style.legend.percentage.color}`">
                        {{ rect.proportionLabel }}
                    </span>
                    <span v-if="stackConfig.style.legend.value.show" :style="`font-weight:${stackConfig.style.legend.value.bold ? 'bold' : 'normal'};color:${stackConfig.style.legend.value.color}`">
                        ({{ stackConfig.style.legend.value.prefix }}{{ Number(rect.value.toFixed(stackConfig.style.legend.value.rounding)).toLocaleString() }}{{ stackConfig.style.legend.value.suffix }})
                    </span> 
                </div>
            </div>
        </div>
    </div>
</template>
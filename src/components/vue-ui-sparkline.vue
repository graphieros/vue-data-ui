<script setup>
import { ref, computed } from "vue";
import {
    treeShake,
    shiftHue,
    opacity,
    convertConfigColors
} from "../lib";
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
            return []
        }
    }
});

const uid = ref(`vue-ui-sparkline-${Math.random()}`);
const defaultConfig = ref(mainConfig.vue_ui_sparkline);

const sparklineConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    const reconcilied = treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconcilied);
});

const svg = ref({
    height: 80,
    width: 500,
});

const drawingArea = computed(() => {
    const topPadding = 12;
    return {
        top: topPadding,
        left: 0,
        right: svg.value.width,
        bottom: svg.value.height - 3,
        start: sparklineConfig.value.style.dataLabel.position === 'left' ? 210 : 0,
        width: 290,
        height: svg.value.height - topPadding
    }
});

const min = computed(() => {
    return Math.min(...props.dataset.map(s => isNaN(s.value) || [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(s.value) ? 0 : s.value))
});
const max = computed(() => {
    return Math.max(...props.dataset.map(s => isNaN(s.value) || [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(s.value) ? 0 : s.value))
});

const bottomPadding = ref(6)

const absoluteMin = computed(() => {
    return Math.abs(min.value);
});

const absoluteMax = computed(() => {
    return max.value + absoluteMin.value + bottomPadding.value;
});

const absoluteZero = computed(() => {
    return drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(absoluteMin.value + bottomPadding.value))
})

function ratioToMax(v) {
    return v / absoluteMax.value;
}

const len = computed(() => props.dataset.length);

const mutableDataset = computed(() => {
    return props.dataset.map((s, i) => {
        const absoluteValue = isNaN(s.value) || [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(s.value) ? 0 : s.value;
        return {
            absoluteValue,
            period: s.period,
            plotValue: absoluteValue + absoluteMin.value,
            toMax: ratioToMax(absoluteValue + absoluteMin.value),
            x: drawingArea.value.start + (i * (drawingArea.value.width / len.value)),
            y: drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(absoluteValue + bottomPadding.value + absoluteMin.value)),
            id: `plot_${uid}_${i}`,
            color: sparklineConfig.value.style.area.useGradient ? shiftHue(sparklineConfig.value.style.line.color, 0.05 * ( 1 - (i / len.value))) : sparklineConfig.value.style.line.color
        }
    })
});

const area = computed(() => {
    const start = { x: mutableDataset.value[0].x, y: svg.value.height - 6 };
    const end = { x: mutableDataset.value[mutableDataset.value.length -1].x, y: svg.value.height - 6 };
    const path = [];
    mutableDataset.value.forEach(v => {
        path.push(`${v.x},${v.y} `)
    });

    return [ start.x,start.y, ...path, end.x, end.y ].toString();
});


const selectedPlot = ref(undefined);

function selectPlot(plot) {
    selectedPlot.value = plot;
}

const dataLabel = computed(() => {
    if (sparklineConfig.value.style.dataLabel.valueType === 'latest') {
        return mutableDataset.value[mutableDataset.value.length -1].absoluteValue;
    } else if(sparklineConfig.value.style.dataLabel.valueType === 'sum') {
        return mutableDataset.value.map(m => m.absoluteValue).reduce((a,b) => a + b);
    } else if(sparklineConfig.value.style.dataLabel.valueType === "average") {
        return mutableDataset.value.map(m => m.absoluteValue).reduce((a,b) => a + b) / mutableDataset.value.length;
    } else {
        return 0;
    }
});

</script>

<template>
    <div class="vue-ui-sparkline" :id="uid" :style="`width:100%;font-family:${sparklineConfig.style.fontFamily}`">
        <!-- TITLE -->
        <div v-if="sparklineConfig.style.title.show" class="vue-ui-sparkline-title" :style="`display:flex;align-items:center;width:100%;color:${sparklineConfig.style.title.color};background:${sparklineConfig.style.backgroundColor};justify-content:${sparklineConfig.style.title.textAlign === 'left' ? 'flex-start' : sparklineConfig.style.title.textAlign === 'right' ? 'flex-end' : 'center'};height:${sparklineConfig.style.title.fontSize * 2}px;font-size:${sparklineConfig.style.title.fontSize}px;font-weight:${sparklineConfig.style.title.bold ? 'bold' : 'normal'};`">
            <span :style="`padding:${sparklineConfig.style.title.textAlign === 'left' ? '0 0 0 12px' : sparklineConfig.style.title.textAlign === 'right' ? '0 12px 0 0' : '0'}`">
                {{ selectedPlot ? selectedPlot.period : sparklineConfig.style.title.text }}
            </span>
        </div>
        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`background:${sparklineConfig.style.backgroundColor};overflow:visible`">
            <!-- DEFS -->
            <defs>
                <linearGradient
                    x1="0%" y1="0%" x2="100%" y2="0%"
                    :id="`sparkline_gradient_${uid}`"
                >
                    <stop offset="0%" :stop-color="`${shiftHue(sparklineConfig.style.area.color, 0.05)}${opacity[sparklineConfig.style.area.opacity]}`"/>
                    <stop offset="100%" :stop-color="sparklineConfig.style.area.color + opacity[sparklineConfig.style.area.opacity]" />
                </linearGradient>
            </defs>

            <!-- AREA -->
            <g v-if="sparklineConfig.style.area.show">
                <path 
                    :d="`M${area}Z`" 
                    :fill="sparklineConfig.style.area.useGradient ? `url(#sparkline_gradient_${uid})` : `${sparklineConfig.style.area.color}${opacity[sparklineConfig.style.area.opacity]}`"
                />
            </g>

            <g v-for="(plot, i) in mutableDataset">
                <line 
                    v-if="i < mutableDataset.length - 1"
                    :x1="plot.x"
                    :x2="mutableDataset[i + 1].x"
                    :y1="plot.y"
                    :y2="mutableDataset[i + 1].y"
                    :stroke="plot.color"
                    :stroke-width="sparklineConfig.style.line.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    shape-rendering="geometricPrecision"
                />
                <!-- VERTICAL INDICATORS -->
                <line
                    v-if="sparklineConfig.style.verticalIndicator.show && selectedPlot && plot.id === selectedPlot.id"
                    :x1="plot.x"
                    :x2="plot.x"
                    :y1="drawingArea.top - 6"
                    :y2="drawingArea.bottom"
                    :stroke="plot.color"
                    :stroke-width="sparklineConfig.style.verticalIndicator.strokeWidth"
                    stroke-linecap="round"
                />
            </g>

            <!-- ZERO BASE -->
            <line
                v-if="min < 0"
                :x1="drawingArea.start"
                :x2="drawingArea.start + drawingArea.width - 16"
                :y1="absoluteZero"
                :y2="absoluteZero"
                :stroke="sparklineConfig.style.zeroLine.color"
                :stroke-dasharray="sparklineConfig.style.zeroLine.strokeWidth * 2"
                :stroke-width="sparklineConfig.style.zeroLine.strokeWidth"
                stroke-linecap="round"
            />
            
            <!-- PLOTS -->
            <g v-if="sparklineConfig.style.plot.show" v-for="(plot, i) in mutableDataset">
                <circle 
                    v-if="selectedPlot && plot.id === selectedPlot.id" 
                    :cx="plot.x" 
                    :cy="plot.y" 
                    :r="sparklineConfig.style.plot.radius"
                    :fill="plot.color"
                    :stroke="sparklineConfig.style.plot.stroke"
                    :stroke-width="sparklineConfig.style.plot.strokeWidth"
                />
            </g>

            <!-- DATALABEL -->
            <text
                :x="sparklineConfig.style.dataLabel.position === 'left' ? 12 : drawingArea.width + 12"
                :y="svg.height / 2 + sparklineConfig.style.dataLabel.fontSize / 2.5"
                :font-size="sparklineConfig.style.dataLabel.fontSize"
                :font-weight="sparklineConfig.style.dataLabel.bold ? 'bold' : 'normal'"
                :fill="sparklineConfig.style.dataLabel.color"
            >
                {{ selectedPlot ? (Number(selectedPlot.absoluteValue.toFixed(sparklineConfig.style.dataLabel.roundingValue))).toLocaleString() : (Number(dataLabel.toFixed(sparklineConfig.style.dataLabel.roundingValue))).toLocaleString() }}
            </text>

            <!-- MOUSE TRAP -->
            <rect
                v-for="(plot, i) in mutableDataset"
                :x="plot.x - (drawingArea.width / len / 2)"
                :y="drawingArea.top - 6"
                :height="drawingArea.height + 6"
                :width="(drawingArea.width / len)"
                fill="transparent"
                @mouseenter="selectPlot(plot)"
                @mouseleave="selectedPlot = undefined"
            />
        </svg>
    </div>
</template>

<style scoped>
.vue-ui-sparkline * {
    transition: unset;
}
</style>
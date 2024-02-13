<script setup>
import { ref, computed } from "vue";
import {
    createSmoothPath,
    createUid,
    dataLabel as dl,
    opacity,
    shiftHue,
} from "../lib";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";

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
    },
    showInfo : {
        type: Boolean,
        default: true,
    },
    selectedIndex: {
        type: Number,
        default: undefined
    }
});

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_sparkline);

const sparklineConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const svg = ref({
    height: 80,
    width: 500,
});

const emits = defineEmits(['hoverIndex'])

const drawingArea = computed(() => {
    const topPadding = 12;
    return {
        top: topPadding,
        left: 0,
        right: svg.value.width,
        bottom: svg.value.height - 3,
        start: props.showInfo && sparklineConfig.value.style.dataLabel.position === 'left' ? 210 : 0,
        width: props.showInfo ? 290 : svg.value.width,
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

const len = computed(() => props.dataset.length - 1);

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
            color: isBar.value ? sparklineConfig.value.style.bar.color : sparklineConfig.value.style.area.useGradient ? shiftHue(sparklineConfig.value.style.line.color, 0.05 * ( 1 - (i / len.value))) : sparklineConfig.value.style.line.color,
            width: drawingArea.value.width / len.value
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

function selectPlot(plot, index) {
    selectedPlot.value = plot;
    emits('hoverIndex', {index})
}

function unselectPlot() {
    selectedPlot.value = undefined
    emits('hoverIndex', {index:undefined})
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

const isBar = computed(() => {
    return sparklineConfig.value.type && sparklineConfig.value.type === 'bar';
});

</script>

<template>
    <div class="vue-ui-sparkline" :id="uid" :style="`width:100%;font-family:${sparklineConfig.style.fontFamily}`">
        <!-- TITLE -->
        <div v-if="sparklineConfig.style.title.show && showInfo" class="vue-ui-sparkline-title" :style="`display:flex;align-items:center;width:100%;color:${sparklineConfig.style.title.color};background:${sparklineConfig.style.backgroundColor};justify-content:${sparklineConfig.style.title.textAlign === 'left' ? 'flex-start' : sparklineConfig.style.title.textAlign === 'right' ? 'flex-end' : 'center'};height:${sparklineConfig.style.title.fontSize * 2}px;font-size:${sparklineConfig.style.title.fontSize}px;font-weight:${sparklineConfig.style.title.bold ? 'bold' : 'normal'};`">
            <span data-cy="sparkline-period-label" :style="`padding:${sparklineConfig.style.title.textAlign === 'left' ? '0 0 0 12px' : sparklineConfig.style.title.textAlign === 'right' ? '0 12px 0 0' : '0'}`">
                {{ selectedPlot ? selectedPlot.period : sparklineConfig.style.title.text }}
            </span>
        </div>
        <!-- CHART -->
        <svg data-cy="sparkline-svg" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`background:${sparklineConfig.style.backgroundColor};overflow:visible`">
            <!-- DEFS -->
            <defs>
                <linearGradient
                    x1="0%" y1="0%" x2="100%" y2="0%"
                    :id="`sparkline_gradient_${uid}`"
                >
                    <stop offset="0%" :stop-color="`${shiftHue(sparklineConfig.style.area.color, 0.05)}${opacity[sparklineConfig.style.area.opacity]}`"/>
                    <stop offset="100%" :stop-color="sparklineConfig.style.area.color + opacity[sparklineConfig.style.area.opacity]" />
                </linearGradient>
                <linearGradient x2="0%" y2="100%" :id="`sparkline_bar_gradient_pos_${uid}`">
                    <stop offset="0%" :stop-color="sparklineConfig.style.bar.color"/>
                    <stop offset="100%" :stop-color="`${shiftHue(sparklineConfig.style.bar.color, 0.05)}`"/>
                </linearGradient>
                <linearGradient x2="0%" y2="100%" :id="`sparkline_bar_gradient_neg_${uid}`">
                    <stop offset="0%" :stop-color="`${shiftHue(sparklineConfig.style.bar.color, 0.05)}`"/>
                    <stop offset="100%" :stop-color="sparklineConfig.style.bar.color"/>
                </linearGradient>
            </defs>

            <!-- AREA -->
            <g v-if="sparklineConfig.style.area.show && !isBar">
                <path
                    data-cy="sparkline-smooth-area"
                    v-if="sparklineConfig.style.line.smooth"
                    :d="`M ${mutableDataset[0].x},${drawingArea.bottom} ${createSmoothPath(mutableDataset)} L ${mutableDataset.at(-1).x},${drawingArea.bottom} Z`"
                    :fill="sparklineConfig.style.area.useGradient ? `url(#sparkline_gradient_${uid})` : `${sparklineConfig.style.area.color}${opacity[sparklineConfig.style.area.opacity]}`"
                />
                <path
                    data-cy="sparkline-angle-area"
                    v-else
                    :d="`M${area}Z`" 
                    :fill="sparklineConfig.style.area.useGradient ? `url(#sparkline_gradient_${uid})` : `${sparklineConfig.style.area.color}${opacity[sparklineConfig.style.area.opacity]}`"
                />
            </g>

            <path data-cy="sparkline-smooth-path" v-if="sparklineConfig.style.line.smooth && !isBar" :d="`M ${createSmoothPath(mutableDataset)}`" :stroke="sparklineConfig.style.line.color" fill="none" :stroke-width="sparklineConfig.style.line.strokeWidth" stroke-linecap="round"/>
            
            <g v-for="(plot, i) in mutableDataset">
                <line 
                    v-if="i < mutableDataset.length - 1 && !sparklineConfig.style.line.smooth && !isBar"
                    :data-cy="`sparkline-segment-${i}`"
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
                <rect 
                    v-if="isBar"
                    :x="plot.x - plot.width / 2"
                    :y="plot.absoluteValue > 0 ? plot.y : absoluteZero"
                    :width="plot.width"
                    :height="Math.abs(plot.y - absoluteZero)"
                    :fill="plot.absoluteValue > 0 ? `url(#sparkline_bar_gradient_pos_${uid})` : `url(#sparkline_bar_gradient_neg_${uid})`"
                    :rx="sparklineConfig.style.bar.borderRadius"
                />
                <!-- VERTICAL INDICATORS -->
                <line
                    :data-cy="`sparkline-vertical-indicator-${i}`"
                    v-if="sparklineConfig.style.verticalIndicator.show && ((selectedPlot && plot.id === selectedPlot.id) || selectedIndex === i)"
                    :x1="plot.x"
                    :x2="plot.x"
                    :y1="drawingArea.top - 6"
                    :y2="drawingArea.bottom"
                    :stroke="sparklineConfig.style.verticalIndicator.color || plot.color"
                    :stroke-width="sparklineConfig.style.verticalIndicator.strokeWidth"
                    stroke-linecap="round"
                    :stroke-dasharray="sparklineConfig.style.verticalIndicator.strokeDasharray || 0"
                />
            </g>

            <!-- ZERO BASE -->
            <line
                data-cy="sparkline-zero-axis"
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
                    :data-cy="`sparkline-plot-${i}`"
                    v-if="(selectedPlot && plot.id === selectedPlot.id) || selectedIndex === i" 
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
                v-if="showInfo"
                data-cy="sparkline-datalabel"
                :x="sparklineConfig.style.dataLabel.position === 'left' ? 12 : drawingArea.width + 12"
                :y="svg.height / 2 + sparklineConfig.style.dataLabel.fontSize / 2.5"
                :font-size="sparklineConfig.style.dataLabel.fontSize"
                :font-weight="sparklineConfig.style.dataLabel.bold ? 'bold' : 'normal'"
                :fill="sparklineConfig.style.dataLabel.color"
            >
            {{ selectedPlot ? dl({p: sparklineConfig.style.dataLabel.prefix, v: selectedPlot.absoluteValue, s: sparklineConfig.style.dataLabel.suffix, r: sparklineConfig.style.dataLabel.roundingValue }) : dl({p: sparklineConfig.style.dataLabel.prefix, v: dataLabel, s: sparklineConfig.style.dataLabel.suffix, r: sparklineConfig.style.dataLabel.roundingValue }) }}
            </text>

            <!-- MOUSE TRAP -->
            <rect
                v-for="(plot, i) in mutableDataset"
                :data-cy="`sparkline-mouse-trap-${i}`"
                :x="plot.x - (drawingArea.width / len / 2)"
                :y="drawingArea.top - 6"
                :height="drawingArea.height + 6"
                :width="(drawingArea.width / len)"
                fill="transparent"
                @mouseenter="selectPlot(plot, i)"
                @mouseleave="unselectPlot"
            />
            <slot name="svg" :svg="svg"/>
        </svg>
    </div>
</template>

<style scoped>
.vue-ui-sparkline * {
    transition: unset;
}
</style>
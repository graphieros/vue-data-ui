<script setup>
import { ref, computed, onMounted } from "vue";
import { calculateNiceScale, convertColorToHex, convertCustomPalette, error, objectIsEmpty, palette, themePalettes } from "../lib";
import { useNestedProp } from "../useNestedProp";
import mainConfig from "../default_configs.json"
import { line } from "../canvas-lib"

const props = defineProps({
    dataset: {
        type: Array,
        default() {
            return []
        }
    },
    config: {
        type: Object,
        default() {
            return {}
        }
    }
})

const canvas = ref(null);
const container = ref(null);
const ctx = ref(null);
const w = ref(0);
const h = ref(0);

const xyConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: mainConfig.vue_ui_xy_canvas
    })
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themePalettes.vue_ui_xy_xy_canvas[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
})

const stacked = computed(() => {
    return xyConfig.value.style.chart.stacked
})

const customPalette = computed(() => {
    return convertCustomPalette(xyConfig.value.customPalette)
})

const maxSeries = computed(() => {
    return Math.max(...props.dataset.map(ds => ds.series.length))
})


const drawingArea = computed(() => {
    const width = w.value - (w.value * (xyConfig.value.style.chart.paddingProportions.left + xyConfig.value.style.chart.paddingProportions.right))
    return {
        canvasWidth: w.value,
        canvasHeight: h.value,
        left: w.value * xyConfig.value.style.chart.paddingProportions.left,
        top: h.value * xyConfig.value.style.chart.paddingProportions.top,
        right: w.value - (w.value * xyConfig.value.style.chart.paddingProportions.right),
        bottom: h.value - (h.value * xyConfig.value.style.chart.paddingProportions.bottom),
        width,
        height: h.value - (h.value * (xyConfig.value.style.chart.paddingProportions.top + xyConfig.value.style.chart.paddingProportions.bottom)),
        slot: width / maxSeries.value
    }
})

function proportionToMax(p, m) {
    return p / m
}

function createLineCoordinates({series, min, max, scale}) {
    return series.map((s, i) => {
        const absMin = Math.abs(scale.min);
        const pToMax = proportionToMax(s + absMin, max + absMin + scale.max)

        return {
            x: drawingArea.value.left + drawingArea.value.slot * i + (drawingArea.value.slot / 2),
            y: drawingArea.value.bottom - (drawingArea.value.height * pToMax)
        }
    })
}

const absoluteExtremes = computed(() => {
    const min = Math.min(...props.dataset.flatMap(ds => ds.series));
    const max = Math.max(...props.dataset.flatMap(ds => ds.series));
    const scale = calculateNiceScale(min, max, xyConfig.value.style.chart.scale.ticks)
    return {
        min,
        max,
        scale
    }
})

const formattedDataset = ref([]);

function computeFormattedDataset() {
    formattedDataset.value = props.dataset.map((ds, i) => {
        const min = Math.min(...ds.series);
        const max = Math.max(...ds.series);
        const localScale = calculateNiceScale(min, max, ds.scaleSteps || xyConfig.value.style.chart.scale.ticks)

        const coordinatesLine = createLineCoordinates({
            series:ds.series, 
            min: stacked.value ? min : absoluteExtremes.value.min, 
            max: stacked.value ? max : absoluteExtremes.value.max, 
            scale: stacked.value ? localScale : absoluteExtremes.value.scale
        })

        return {
            ...ds,
            color: convertColorToHex(ds.color || customPalette.value[i] || palette[i] || palette[i % palette.length]),
            coordinatesLine,
            min,
            max,
            localScale
        }
    })
}

function resizeCanvas() {
    const containerWidth = container.value.offsetWidth;
    const containerHeight = container.value.offsetHeight;
    const dpr = 1;
    canvas.value.width = containerWidth * dpr * 2;
    canvas.value.height = containerHeight * dpr * 2;
    w.value = containerWidth * dpr * 2;
    h.value = containerHeight * dpr * 2;
    ctx.value.scale(dpr, dpr);
    draw()
}

function setupChart() {
    ctx.value.fillStyle = xyConfig.value.style.chart.backgroundColor;
    ctx.value.fillRect(0, 0, drawingArea.value.canvasWidth, drawingArea.value.canvasHeight);

    if (!xyConfig.value.style.chart.stacked) {
        if (xyConfig.value.style.chart.grid.y.showAxis) {
            line(
                ctx.value,
                [
                    {x: drawingArea.value.left, y: drawingArea.value.top },
                    {x: drawingArea.value.left, y: drawingArea.value.bottom },
                ]
            )
        }
        if (xyConfig.value.style.chart.grid.x.showAxis) {
            line(
                ctx.value,
                [
                    {x: drawingArea.value.left, y: drawingArea.value.bottom },
                    {x: drawingArea.value.right, y: drawingArea.value.bottom },
                ]
            )
        }
    }
}

function draw() {
    computeFormattedDataset()
    setupChart()

    formattedDataset.value.forEach(ds => {
        line(ctx.value, ds.coordinatesLine, {
            color: ds.color,
            lineWidth: 3
        })
    })
}

onMounted(() => {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiXyCanvas',
            type: 'dataset'
        })
    } else {
        // TODO: check for missing ds attrs
        if (canvas.value) {
            ctx.value = canvas.value.getContext('2d');
        }
    }

    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.contentBoxSize) {
                resizeCanvas()
            }

        }
    })

    resizeObserver.observe(container.value)
});


</script>

<template>
    <div class="vue-ui-xy-canvas" :style="`aspect-ratio: ${xyConfig.style.chart.aspectRatio}`" ref="container">

        <!-- TITLE -->
        w: {{ drawingArea.width.toFixed(0) }} | h: {{ drawingArea.height.toFixed(0) }} | slot: {{ drawingArea.slot.toFixed(0) }}

        <canvas ref="canvas" style="width:100%; height:100%"></canvas>

    </div>
</template>

<style scoped>
.vue-ui-xy-canvas {
    width: 100%;
    border: 1px solid red;
    color: white;
}

canvas {
    border: 1px solid blue;
}
</style>
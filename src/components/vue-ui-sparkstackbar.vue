<script setup>
import { ref, computed, onMounted } from "vue";
import { 
    convertColorToHex, 
    createUid,
    error,
    objectIsEmpty,
    opacity, 
    palette, 
    shiftHue, 
} from "../lib";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Skeleton from "./vue-ui-skeleton.vue";

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
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_sparkstackbar);

const stackConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const safeDatasetCopy = ref(props.dataset.map((d, i ) => {
    return {
        ...d,
        value: stackConfig.value.style.animation.show ? 0 : d.value || 0,
        color: d.color ? convertColorToHex(d.color) : palette[i] || palette[i % palette.length]
    }
}));

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkStackbar',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            if([null, undefined].includes(ds.name)) {
                error({
                    componentName: 'VueUiSparkStackbar',
                    type: 'datasetSerieAttribute',
                    property: 'name',
                    index: i
                })
            }
            if([undefined].includes(ds.value)) {
                error({
                    componentName: 'VueUiSparkStackbar',
                    type: 'datasetSerieAttribute',
                    property: 'value',
                    index: i
                })
            }
        })
    }

    if (stackConfig.value.style.animation.show) {
        const chunks = stackConfig.value.style.animation.animationFrames;
        const chunkSet = props.dataset.map((d, i) => d.value / chunks);
        const total = props.dataset.map(d => d.value || 0).reduce((a, b) => a + b, 0);
        let start = 0;

        function animate() {
            start += (total / chunks);
            if (start < total) {
                safeDatasetCopy.value = safeDatasetCopy.value.map((d, i) => {
                    return {
                        ...d,
                        value: d.value += chunkSet[i],
                        color: d.color ? convertColorToHex(d.color) : palette[i] || palette[i % palette.length]
                    }
                });
                requestAnimationFrame(animate)
            } else {
                safeDatasetCopy.value = props.dataset.map((d,i) => {
                    return {
                        ...d,
                        value: d.value || 0,
                        color: d.color ? convertColorToHex(d.color) : palette[i] || palette[i % palette.length],
                        id: createUid(),
                    }
                })
            }
        }
        animate()
    }
});

const svg = ref({
    width: 500,
    height: 16,
});

const segregated = ref([])

function segregate(id) {
    if(segregated.value.includes(id)) {
        segregated.value =segregated.value.filter(s => s !== id)
    } else {
        if(segregated.value.length < safeDatasetCopy.value.length - 1) {
            segregated.value.push(id)
        }
    }
}

const total = computed(() => {
    return props.dataset.map(d => d.value || 0).filter((ds, i) => !segregated.value.includes(i)).reduce((a, b) => a + b, 0);
});

const absoluteDataset = computed(() => {
    return safeDatasetCopy.value.map((d, i) => {
        return {
            ...d,
            value: d.value || 0,
            proportion: (d.value || 0) / total.value,
            width: (d.value || 0) / total.value * svg.value.width,
            proportionLabel: `${Number(((d.value || 0) / total.value * 100).toFixed(stackConfig.value.style.legend.percentage.rounding)).toLocaleString()}%`,
        }
    })
});

const computedDataset = computed(() => {
    return absoluteDataset.value.filter((ds, i) => !segregated.value.includes(i))
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
    return datapoints
});

const emits = defineEmits(['selectDatapoint'])

function selectDatapoint(datapoint, index) {
    emits('selectDatapoint', { datapoint, index })
}

</script>

<template>
    <div :style="`width:100%; background:${stackConfig.style.backgroundColor}`">
        <!-- TITLE -->
        <div data-cy="sparkstackbar-title-wrapper" v-if="stackConfig.style.title.text" :style="`width:calc(100% - 12px);background:${stackConfig.style.backgroundColor};margin:0 auto;margin:${stackConfig.style.title.margin};padding: 0 6px;text-align:${stackConfig.style.title.textAlign}`">
            <div data-cy="sparkstackbar-title" :style="`font-size:${stackConfig.style.title.fontSize}px;color:${stackConfig.style.title.color};font-weight:${stackConfig.style.title.bold ? 'bold' : 'normal'}`">
                {{ stackConfig.style.title.text }}
            </div>
            <div data-cy="sparkstackbar-subtitle" v-if="stackConfig.style.title.subtitle.text" :style="`font-size:${stackConfig.style.title.subtitle.fontSize}px;color:${stackConfig.style.title.subtitle.color};font-weight:${stackConfig.style.title.subtitle.bold ? 'bold' : 'normal'}`">
                {{ stackConfig.style.title.subtitle.text }}
            </div>
            
        </div>
        <!-- CHART -->
        <svg v-if="isDataset" width="100%" :viewBox="`0 0 ${svg.width} ${svg.height}`">
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
                <rect :x="0" :y="0" :height="svg.height" :width="drawableDataset.map(ds => ds.width).reduce((a, b) => a + b, 0)" :fill="stackConfig.style.bar.gradient.underlayerColor"/>
                <rect 
                    v-for="(rect, i) in drawableDataset" :key="`stack_${i}`"
                    @click="() => selectDatapoint(rect, i)"
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

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'sparkStackbar',
                style: {
                    backgroundColor: stackConfig.style.backgroundColor,
                    sparkStackbar: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />
        <div v-if="stackConfig.style.legend.show" data-cy="sparkstackbar-legend" :style="`background:${stackConfig.style.backgroundColor};margin:0 auto;margin:${stackConfig.style.legend.margin};justify-content:${stackConfig.style.legend.textAlign === 'left' ? 'flex-start' : stackConfig.style.legend.textAlign === 'right' ? 'flex-end' : 'center'}`" class="vue-ui-sparkstackbar-legend">
            <div v-for=" (rect, i) in absoluteDataset" :style="`font-size:${stackConfig.style.legend.fontSize}px`" :class="{'vue-ui-sparkstackbar-legend-item': true, 'vue-ui-sparkstackbar-legend-item-unselected': segregated.includes(i)}" @click="segregate(i); selectDatapoint(rect, i)">
                <div style="display:flex;flex-direction:row;align-items:center;gap:4px;justify-content:center" >
                    <svg :height="`${stackConfig.style.legend.fontSize}px`" :width="`${stackConfig.style.legend.fontSize}px`" viewBox="0 0 10 10">
                        <circle :cx="5" :cy="5" :r="5" :fill="rect.color"/>
                    </svg>
                    <span :style="`color:${stackConfig.style.legend.name.color}`">
                        {{ rect.name }}
                    </span>
                    <span v-if="stackConfig.style.legend.percentage.show" :style="`font-weight:${stackConfig.style.legend.percentage.bold ? 'bold': 'normal'};color:${stackConfig.style.legend.percentage.color}`">
                        {{ segregated.includes(i) ? ' - ' : rect.proportionLabel }}
                    </span>
                    <span v-if="stackConfig.style.legend.value.show" :style="`font-weight:${stackConfig.style.legend.value.bold ? 'bold' : 'normal'};color:${stackConfig.style.legend.value.color}`">
                        ({{ stackConfig.style.legend.value.prefix }}{{ Number(rect.value.toFixed(stackConfig.style.legend.value.rounding)).toLocaleString() }}{{ stackConfig.style.legend.value.suffix }})
                    </span> 
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-sparkstackbar-legend {
    display: flex;
    flex-wrap: wrap;
    column-gap: 12px;
    width: calc(100% - 12px);
    padding: 0 6px;
}
.vue-ui-sparkstackbar-legend-item {
    cursor: pointer;
}
.vue-ui-sparkstackbar-legend-item-unselected {
    opacity: 0.3;
}
</style>
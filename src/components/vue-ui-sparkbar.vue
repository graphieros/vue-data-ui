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

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkbar',
            type: 'dataset'
        })
    }
})

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_sparkbar);

const sparkbarConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const svg = ref({
    width: 500,
    height: 16,
});

const max = computed(() => {
    return Math.max(...props.dataset.map(d => d.value));
});

const drawableDataset = computed(() => {
    props.dataset.forEach((ds, i) => {
        if([null, undefined].includes(ds.name)) {
            error({
                componentName: 'VueUiSparkbar',
                type: 'datasetSerieAttribute',
                property: 'name',
                index: i
            })
        }
        if([undefined].includes(ds.value)) {
            error({
                componentName: 'VueUiSparkbar',
                type: 'datasetSerieAttribute',
                property: 'value',
                index: i
            })
        }
    })

    return props.dataset.map((d, i) => {
        return {
            ...d,
            value: d.value || 0,
            color: convertColorToHex(d.color) || palette[i] || palette[i % palette.length]
        }
    })
})

function ratioToMax(val) {
    return val / max.value;
}

function ratioTo(val) {
    if (sparkbarConfig.value.style.layout.independant) {
        if (sparkbarConfig.value.style.layout.percentage) {
            return val / 100;
        } else if(sparkbarConfig.value.style.layout.target === 0) {
            return 1;
        } else {
            return val / sparkbarConfig.value.style.layout.target
        }
    } else {
        return ratioToMax(val)
    }
}

const emits = defineEmits(['selectDatapoint'])

function selectDatapoint(datapoint, index) {
    emits("selectDatapoint", { datapoint, index })
}

</script>

<template>
    <div :style="`width:100%; font-family:${sparkbarConfig.style.fontFamily};background:${sparkbarConfig.style.backgroundColor}`">
        <template v-for="(bar, i) in drawableDataset">
            <div :style="`display:flex !important;${['left', 'right'].includes(sparkbarConfig.style.labels.name.position) ? 'flex-direction:row !important' : 'flex-direction:column !important'};gap:${sparkbarConfig.style.gap}px !important;${sparkbarConfig.style.labels.name.position === 'right' ? 'row-reverse !important' : ''};align-items:center;${dataset.length > 0 && i !== dataset.length - 1 ? 'margin-bottom:6px' : ''}`" @click="() => selectDatapoint(bar, i)">
                <div :style="`width:${sparkbarConfig.style.labels.name.width};${['right','top'].includes(sparkbarConfig.style.labels.name.position) ? 'text-align:left' : 'text-align:right'};color:${sparkbarConfig.style.labels.name.color};font-size:${sparkbarConfig.style.labels.fontSize}px;font-weight:${sparkbarConfig.style.labels.name.bold ? 'bold' : 'normal'}`">
                    <span :data-cy="`sparkbar-name-${i}`">{{ bar.name }}</span>
                    <span :data-cy="`sparkbar-value-${i}`" v-if="sparkbarConfig.style.labels.value.show" :style="`font-weight:${sparkbarConfig.style.labels.value.bold ? 'bold' : 'normal'}`">
                       : {{ bar.prefix ? bar.prefix : '' }}{{ Number(bar.value.toFixed(bar.rounding ? bar.rounding : 0)).toLocaleString() }}{{ bar.suffix ? bar.suffix : '' }}
                    </span>
                </div>
                <svg :data-cy="`sparkbar-svg-${i}`" :viewBox="`0 0 ${svg.width} ${svg.height}`" width="100%">
                    <defs>
                        <linearGradient
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                            :id="`sparkbar_gradient_${i}_${uid}`"
                        >
                            <stop offset="0%" :stop-color="`${shiftHue(bar.color, 0.03)}${opacity[100 - sparkbarConfig.style.bar.gradient.intensity]}`"/>
                            <stop offset="100%" :stop-color="bar.color"/>
                        </linearGradient>
                    </defs>
                    <rect :height="svg.height" :width="svg.width" :x="0" :y="0" :fill="`${sparkbarConfig.style.gutter.backgroundColor}${opacity[sparkbarConfig.style.gutter.opacity]}`" :rx="svg.height / 2" />
                    <rect :height="svg.height" :width="svg.width * ratioTo(bar.value)" :x="0" :y="0" :fill="sparkbarConfig.style.bar.gradient.underlayerColor" :rx="svg.height / 2" />
                    <rect :height="svg.height" :width="svg.width * ratioTo(bar.value)" :x="0" :y="0" :fill="sparkbarConfig.style.bar.gradient.show ? `url(#sparkbar_gradient_${i}_${uid})` : bar.color" :rx="svg.height / 2" />
                </svg>
            </div>
        </template>
    </div>
</template>
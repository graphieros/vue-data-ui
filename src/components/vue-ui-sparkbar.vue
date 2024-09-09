<script setup>
import { ref, computed, onMounted } from "vue";
import {
    convertColorToHex,
    convertCustomPalette,
    createUid,
    dataLabel,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    opacity,
    palette,
    shiftHue,
    themePalettes,
    XMLNS
} from "../lib";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import Skeleton from "./vue-ui-skeleton.vue";
import { useConfig } from "../useConfig";

const { vue_ui_sparkbar: DEFAULT_CONFIG } = useConfig();

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

const FINAL_CONFIG = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_sparkbar[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const safeDatasetCopy = ref(props.dataset.map(d => {
    return {
        ...d,
        value: FINAL_CONFIG.value.style.animation.show ? 0 : d.value || 0
    }
}));

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkbar',
            type: 'dataset'
        })
    }

    if (FINAL_CONFIG.value.style.animation.show) {
        const chunks = FINAL_CONFIG.value.style.animation.animationFrames;
        const chunkSet = props.dataset.map((d, i) => d.value / chunks);
        const total = props.dataset.map(d => d.value || 0).reduce((a, b) => a + b, 0);
        let start = 0;

        function animate() {
            start += (total / chunks);
            if (start < total) {
                safeDatasetCopy.value = safeDatasetCopy.value.map((d, i) => {
                    return {
                        ...d,
                        value: d.value += chunkSet[i]
                    }
                });
                requestAnimationFrame(animate)
            } else {
                safeDatasetCopy.value = props.dataset.map(d => {
                    return {
                        ...d,
                        value: d.value || 0
                    }
                })
            }
        }
        animate()
    }
})


const svg = ref({
    width: 500,
    height: 16,
});

const max = computed(() => {
    return Math.max(...props.dataset.map(d => d.value));
});

const drawableDataset = computed(() => {
    props.dataset.forEach((ds, i) => {
        getMissingDatasetAttributes({
            datasetObject: ds,
            requiredAttributes: ['name', 'value']
        }).forEach(attr => {
            error({
                componentName: 'VueUiSparkbar',
                type: 'datasetSerieAttribute',
                property: attr,
                index: i
            });
        });
    })

    return safeDatasetCopy.value.map((d, i) => {
        return {
            ...d,
            value: d.value || 0,
            color: convertColorToHex(d.color) || customPalette.value[i] || palette[i] || palette[i % palette.length]
        }
    })
})

function ratioToMax(val) {
    return val / max.value;
}

function ratioTo(bar) {

    if (FINAL_CONFIG.value.style.layout.independant) {
        if (bar.target) {
            return bar.value / bar.target;
        }
        if (FINAL_CONFIG.value.style.layout.percentage) {
            return bar.value / 100;
        } else if(FINAL_CONFIG.value.style.layout.target === 0) {
            return 1;
        } else {
            return bar.value / FINAL_CONFIG.value.style.layout.target
        }
    } else {
        return ratioToMax(bar.value)
    }
}

function getTarget(bar) {
    if (FINAL_CONFIG.value.style.layout.independant) {
        return bar.target || FINAL_CONFIG.value.style.layout.target;
    }
    return FINAL_CONFIG.value.style.layout.target;
}

const emits = defineEmits(['selectDatapoint'])

function selectDatapoint(datapoint, index) {
    emits("selectDatapoint", { datapoint, index })
}

</script>

<template>
    <div
        :style="{
            width: '100%',
            fontFamily: FINAL_CONFIG.style.fontFamily,
            background: FINAL_CONFIG.style.backgroundColor
        }"
    >
        <!-- CUSTOM TITLE -->
        <slot v-if="$slots['title']" name="title" v-bind="{ title: { ...title, title: FINAL_CONFIG.style.title.text, subtitle: FINAL_CONFIG.style.title.subtitle.text } }" />

        <!-- DEFAULT TITLE -->
        <div 
            data-cy="sparkbar-title-wrapper"
            class="vue-ui-sparkbar-title-container"
            v-if="!$slots['title'] && FINAL_CONFIG.style.title.text"
            :style="{
                background: FINAL_CONFIG.style.title.backgroundColor,
                margin: FINAL_CONFIG.style.title.margin,
                textAlign: FINAL_CONFIG.style.title.textAlign
            }"
        >
            <div
                class="vue-ui-sparkbar-title"
                data-cy="sparkbar-title"
                :style="{
                    fontSize: FINAL_CONFIG.style.title.fontSize + 'px',
                    color: FINAL_CONFIG.style.title.color,
                    fontWeight: FINAL_CONFIG.style.title.bold ? 'bold' : 'normal'
                }"
            >
                {{ FINAL_CONFIG.style.title.text }}
            </div>

            <div 
                class="vue-ui-sparkbar-subtitle"
                data-cy="sparkbar-subtitle" 
                v-if="FINAL_CONFIG.style.title.subtitle.text"
                :style="{
                    fontSize: FINAL_CONFIG.style.title.subtitle.fontSize + 'px',
                    color: FINAL_CONFIG.style.title.subtitle.color,
                    fontWeight: FINAL_CONFIG.style.title.subtitle.bold ? 'bold' : 'normal'
                }"
            >
                {{ FINAL_CONFIG.style.title.subtitle.text }}
            </div>
        </div>
        <template v-for="(bar, i) in drawableDataset">
            <div v-if="isDataset" :style="`display:flex !important;${['left', 'right'].includes(FINAL_CONFIG.style.labels.name.position) ? 'flex-direction:row !important' : 'flex-direction:column !important'};gap:${FINAL_CONFIG.style.gap}px !important;${FINAL_CONFIG.style.labels.name.position === 'right' ? 'row-reverse !important' : ''};align-items:center;${dataset.length > 0 && i !== dataset.length - 1 ? 'margin-bottom:6px' : ''}`" @click="() => selectDatapoint(bar, i)">
                <!-- CUSTOM DATALABEL -->
                <slot name="data-label" v-bind="{ bar: {
                    ...bar,
                    target: getTarget(bar),
                    valueLabel: dataLabel({
                            p: bar.prefix || '',
                            v: bar.value,
                            s: bar.suffix || '',
                            r: bar.rounding || 0
                        }),
                    targetLabel:
                    dataLabel({
                            p: bar.prefix || '',
                            v: getTarget(bar),
                            s: bar.suffix || '',
                            r: bar.rounding || 0
                        })
                } }"/>

                <!-- DEFAULT DATALABEL -->
                <div v-if="!$slots['data-label']" :style="`width:${FINAL_CONFIG.style.labels.name.width};${['right','top'].includes(FINAL_CONFIG.style.labels.name.position) ? 'text-align:left' : 'text-align:right'};color:${FINAL_CONFIG.style.labels.name.color};font-size:${FINAL_CONFIG.style.labels.fontSize}px;font-weight:${FINAL_CONFIG.style.labels.name.bold ? 'bold' : 'normal'}`">
                    <span :data-cy="`sparkbar-name-${i}`">{{ bar.name }}</span>
                    <span 
                        :data-cy="`sparkbar-value-${i}`"
                        v-if="FINAL_CONFIG.style.labels.value.show"
                        :style="`font-weight:${FINAL_CONFIG.style.labels.value.bold ? 'bold' : 'normal'}`"
                    >: {{ dataLabel({
                            p: bar.prefix || '',
                            v: bar.value,
                            s: bar.suffix || '',
                            r: bar.rounding || 0
                        })}}
                    </span>
                    <span
                        :data-cy="`sparkbar-target-value-${i}`"
                        v-if="FINAL_CONFIG.style.layout.showTargetValue"
                        >
                        {{ ' ' + FINAL_CONFIG.style.layout.targetValueText }}  
                        {{ dataLabel({
                            p: bar.prefix || '',
                            v: getTarget(bar),
                            s: bar.suffix || '',
                            r: bar.rounding || 0
                        })}}
                    </span>
                </div>

                <!-- BAR -->
                <svg :xmlns="XMLNS" :data-cy="`sparkbar-svg-${i}`" :viewBox="`0 0 ${svg.width} ${svg.height}`" width="100%">
                    <defs>
                        <linearGradient
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                            :id="`sparkbar_gradient_${i}_${uid}`"
                        >
                            <stop offset="0%" :stop-color="`${shiftHue(bar.color, 0.03)}${opacity[100 - FINAL_CONFIG.style.bar.gradient.intensity]}`"/>
                            <stop offset="100%" :stop-color="bar.color"/>
                        </linearGradient>
                    </defs>
                    <rect :height="svg.height" :width="svg.width" :x="0" :y="0" :fill="`${FINAL_CONFIG.style.gutter.backgroundColor}${opacity[FINAL_CONFIG.style.gutter.opacity]}`" :rx="svg.height / 2" />
                    <rect :height="svg.height" :width="svg.width * ratioTo(bar)" :x="0" :y="0" :fill="FINAL_CONFIG.style.bar.gradient.underlayerColor" :rx="svg.height / 2" />
                    <rect :height="svg.height" :width="svg.width * ratioTo(bar)" :x="0" :y="0" :fill="FINAL_CONFIG.style.bar.gradient.show ? `url(#sparkbar_gradient_${i}_${uid})` : bar.color" :rx="svg.height / 2" />
                </svg>
            </div>
        </template>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'sparkbar',
                style: {
                    backgroundColor: FINAL_CONFIG.style.backgroundColor,
                    sparkbar: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />
    </div>
</template>
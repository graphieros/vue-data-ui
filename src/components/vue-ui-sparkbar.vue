<script setup>
import { ref, computed, onMounted, watch, nextTick, useSlots, defineAsyncComponent, toRefs } from "vue";
import {
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createUid,
    dataLabel,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    palette,
    setOpacity,
    shiftHue,
    themePalettes,
    treeShake,
    XMLNS
} from "../lib";
import { useNestedProp } from "../useNestedProp";
import { useConfig } from "../useConfig";
import themes from "../themes.json";
import BaseScanner from "../atoms/BaseScanner.vue";
import { useLoading } from "../useLoading";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

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
    },
    /**
     * Used in VueUiRadar's tooltip exclusively
     */
    backgroundOpacity: {
        type: Number,
        default: null
    }
});

const slots = useSlots();

onMounted(() => {
    if (slots['chart-background']) {
        console.warn('VueUiSparkbar does not support the #chart-background slot.')
    }
});

const uid = ref(createUid());

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        { name: '_', value: 21, target: 25, color: '#808080' },
        { name: '_', value: 13, target: 25, color: '#ADADAD' },
        { name: '_', value: 8, target: 25, color: '#DBDBDB' },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            style: {
                backgroundColor: '#99999930',
                animation: { show: false },
                layout: { independant: true },
                gutter: {
                    backgroundColor: '#6A6A6A',
                    opacity: 50
                },
                bar: {
                    gradient: {
                        underlayerColor: '#6A6A6A'
                    }
                }
            }
        }
    })
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareConfig() {
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
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
}, { deep: true });

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const safeDatasetCopy = ref(FINAL_DATASET.value.map(d => {
    return {
        ...d,
        value: FINAL_CONFIG.value.style.animation.show ? 0 : d.value || 0,
        formatter: d.formatter || null
    }
}));

const rafId = ref(null);

onMounted(async () => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkbar',
            type: 'dataset',
            debug: debug.value
        })
    }
    useAnimation();
});

function useAnimation() {
    if (FINAL_CONFIG.value.style.animation.show) {
        const chunks = FINAL_CONFIG.value.style.animation.animationFrames;
        const chunkSet = FINAL_DATASET.value.map((d, i) => d.value / chunks);
        const total = FINAL_DATASET.value.map(d => d.value || 0).reduce((a, b) => a + b, 0);
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
                rafId.value = requestAnimationFrame(animate)
            } else {
                safeDatasetCopy.value = FINAL_DATASET.value.map(d => {
                    return {
                        ...d,
                        value: d.value || 0,
                        formatter: d.formatter || null
                    }
                })
            }
        }
        animate()
    }
}

watch(() => FINAL_DATASET.value, async (v) => {
    cancelAnimationFrame(rafId.value);

    safeDatasetCopy.value = FINAL_DATASET.value.map(d => {
    return {
        ...d,
        value: FINAL_CONFIG.value.style.animation.show ? 0 : d.value || 0,
        formatter: d.formatter || null
    }});

    nextTick(useAnimation);
}, { deep: true })


const svg = ref({
    width: 500,
    height: 16,
});

const max = computed(() => {
    return Math.max(...FINAL_DATASET.value.map(d => d.value));
});

const drawableDataset = computed(() => {
    FINAL_DATASET.value.forEach((ds, i) => {
        getMissingDatasetAttributes({
            datasetObject: ds,
            requiredAttributes: ['name', 'value']
        }).forEach(attr => {
            error({
                componentName: 'VueUiSparkbar',
                type: 'datasetSerieAttribute',
                property: attr,
                index: i,
                debug: debug.value
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
            if (bar.value > 100) {
                return 1;
            }
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
    emits("selectDatapoint", { datapoint, index });
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: index })
    }
}

function onTrapEnter(datapoint, index) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: index });
    }
}

function onTrapLeave(datapoint, index) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex: index });
    }
}

</script>

<template>
    <div
        class="vue-ui-sparkbar"
        :style="{
            width: '100%',
            position: 'relative',
            fontFamily: FINAL_CONFIG.style.fontFamily,
            background: props.backgroundOpacity !== null ? setOpacity(FINAL_CONFIG.style.backgroundColor, props.backgroundOpacity) : FINAL_CONFIG.style.backgroundColor
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
            <div 
                data-cy="datapoint-wrapper" 
                :style="`display:flex !important;${['left', 'right'].includes(FINAL_CONFIG.style.labels.name.position) ? `flex-direction: ${FINAL_CONFIG.style.labels.name.position === 'right' ? 'row-reverse' : 'row'} !important` : 'flex-direction:column !important'};gap:${FINAL_CONFIG.style.gap}px !important;align-items:center;${dataset.length > 0 && i !== dataset.length - 1 ? 'margin-bottom:6px' : ''}`" 
                @click="selectDatapoint(bar, i)"
                @mouseenter="onTrapEnter(bar, i)"
                @mouseleave="onTrapLeave(bar, i)"
            >
                <!-- CUSTOM DATALABEL -->
                <slot v-if="!loading" name="data-label" v-bind="{ bar: {
                    ...bar,
                    target: getTarget(bar),
                    valueLabel: applyDataLabel(
                        bar.formatter,
                        bar.value,
                        dataLabel({
                            p: bar.prefix || '',
                            v: bar.value,
                            s: bar.suffix || '',
                            r: bar.rounding || 0
                        }),
                        { datapoint: bar, seriesIndex: i }
                    ),
                    targetLabel: applyDataLabel(
                        bar.formatter,
                        getTarget(bar),
                        dataLabel({
                            p: bar.prefix || '',
                            v: getTarget(bar),
                            s: bar.suffix || '',
                            r: bar.rounding || 0
                        }),
                        { datapoint: bar, seriesIndex: i }
                    ),
                }}"/>

                <!-- DEFAULT DATALABEL -->
                <div
                    v-if="!$slots['data-label'] || loading"
                    :style="{
                        display: 'flex',
                        justifyContent: (
                        ['right', 'top-right'].includes(FINAL_CONFIG.style.labels.name.position) ? 'flex-end' :
                        ['top-center'].includes(FINAL_CONFIG.style.labels.name.position) ? 'center' :
                        'flex-start'
                        ),
                        alignItems: 'center',
                        width: FINAL_CONFIG.style.labels.name.width,
                        color: FINAL_CONFIG.style.labels.name.color,
                        fontSize: FINAL_CONFIG.style.labels.fontSize + 'px',
                        fontWeight: FINAL_CONFIG.style.labels.name.bold ? 'bold' : 'normal',
                        flexWrap: 'wrap'
                    }"
                    >
                    <template v-if="loading">
                        <div
                            class="vue-ui-sparkbar-skeleton-name"
                            :style="{
                                width: '60px',
                                height: FINAL_CONFIG.style.labels.fontSize + 'px',
                                borderRadius: FINAL_CONFIG.style.labels.fontSize / 4 + 'px',
                                display: 'flex',
                                alignItems:'center',
                                justifyContent: 'space-between',
                                marginTop: '5px'
                            }"
                        >
                            <div :style="{ height: '100%', width: '40px', borderRadius: FINAL_CONFIG.style.labels.fontSize / 4 + 'px', backgroundColor: '#6A6A6A80'}"/>
                            <div :style="{ height: '100%', width: '15px', borderRadius: FINAL_CONFIG.style.labels.fontSize / 4 + 'px', backgroundColor: '#6A6A6A80'}"/>
                        </div>
                    </template>

                    <template v-else>
                        <span :data-cy="`sparkbar-name-${i}`">{{ bar.name }}</span>
                        <span 
                            :data-cy="`sparkbar-value-${i}`"
                            v-if="FINAL_CONFIG.style.labels.value.show"
                            :style="`font-weight:${FINAL_CONFIG.style.labels.value.bold ? 'bold' : 'normal'}`"
                        >: {{ applyDataLabel(
                            bar.formatter,
                            bar.value,
                            dataLabel({
                                p: bar.prefix || '',
                                v: bar.value,
                                s: bar.suffix || '',
                                r: bar.rounding || 0
                            }),
                            { datapoint: bar, seriesIndex: i }
                            ) 
                        }}
                        </span>
                        <span
                            :data-cy="`sparkbar-target-value-${i}`"
                            v-if="FINAL_CONFIG.style.layout.showTargetValue"
                            >
                            {{ ' ' + FINAL_CONFIG.style.layout.targetValueText }}  
                            {{ applyDataLabel(
                                bar.formatter,
                                getTarget(bar),
                                dataLabel({
                                    p: bar.prefix || '',
                                    v: getTarget(bar),
                                    s: bar.suffix || '',
                                    r: bar.rounding || 0
                                }),
                                { datapoint: bar, seriesIndex: i }
                                )
                            }}
                        </span>
                    </template>
                </div>

                <!-- BAR -->
                <svg :xmlns="XMLNS" :data-cy="`sparkbar-svg-${i}`" :viewBox="`0 0 ${svg.width} ${svg.height}`" width="100%">
                    <PackageVersion />
                    
                    <defs>
                        <linearGradient
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                            :id="`sparkbar_gradient_${i}_${uid}`"
                        >
                            <stop offset="0%" :stop-color="setOpacity(shiftHue(bar.color, 0.03), 100 - FINAL_CONFIG.style.bar.gradient.intensity)"/>
                            <stop offset="100%" :stop-color="bar.color"/>
                        </linearGradient>
                    </defs>
                    <rect :height="svg.height" :width="svg.width" :x="0" :y="0" :fill="setOpacity(FINAL_CONFIG.style.gutter.backgroundColor, FINAL_CONFIG.style.gutter.opacity)" :rx="svg.height / 2" />
                    <rect :height="svg.height" :width="svg.width * ratioTo(bar)" :x="0" :y="0" :fill="FINAL_CONFIG.style.bar.gradient.underlayerColor" :rx="svg.height / 2" />
                    <rect :height="svg.height" :width="svg.width * ratioTo(bar)" :x="0" :y="0" :fill="FINAL_CONFIG.style.bar.gradient.show ? `url(#sparkbar_gradient_${i}_${uid})` : bar.color" :rx="svg.height / 2" />
                </svg>
            </div>
        </template>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>
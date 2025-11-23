<script setup>
import { ref, computed, onMounted, watch, useSlots, defineAsyncComponent, toRefs } from "vue";
import {
    applyDataLabel,
    convertColorToHex, 
    convertCustomPalette, 
    createUid,
    dataLabel,
    error,
    getMissingDatasetAttributes,
    isFunction,
    objectIsEmpty,
    palette, 
    setOpacity,
    shiftHue,
    themePalettes,
    treeShake,
    XMLNS 
} from "../lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { useNestedProp } from "../useNestedProp";
import { useThemeCheck } from "../useThemeCheck";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes/vue_ui_sparkstackbar.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));

const { vue_ui_sparkstackbar: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

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

const slots = useSlots();

onMounted(() => {
    if (slots['chart-background']) {
        console.warn('VueUiSparkStackbar does not support the #chart-background slot.')
    }
});

const sparkstackbarChart = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        { name: '_', value: 8, color: '#808080' },
        { name: '_', value: 5, color: '#ADADAD' },
        { name: '_', value: 3, color: '#DBDBDB' },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            style: {
                backgroundColor: '#99999930',
                animation: { show: false },
                bar: { gradient: { inderlayerColor: '#6A6A6A' }},
                title: {
                    backgroundColor: 'transparent'
                }
            }
        }
    })
})

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;
    
    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused
    });

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length ? finalConfig.customPalette : themePalettes[theme] || palette
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
}, { deep: true });

watch(() => FINAL_DATASET.value, (_) => {
    safeDatasetCopy.value = FINAL_DATASET.value.map((d, i ) => {
        return {
            ...d,
            color: d.color ? convertColorToHex(d.color) : customPalette.value[i] || palette[i] || palette[i % palette.length]
        }
    });
    animateChart();
}, { deep: true })

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const safeDatasetCopy = ref(FINAL_DATASET.value.map((d, i ) => {
    return {
        ...d,
        value: FINAL_CONFIG.value.style.animation.show ? 0 : d.value || 0,
        color: d.color ? convertColorToHex(d.color) : customPalette.value[i] || palette[i] || palette[i % palette.length]
    }
}));

const isAnimating = ref(true);

function animateChart() {
    if (!FINAL_CONFIG.value.style.animation.show) {
        isAnimating.value = false;
        return;
    }

    const chunks = FINAL_CONFIG.value.style.animation.animationFrames;
    const targets = FINAL_DATASET.value.map(d => d.value || 0);
    const step = targets.map(v => v / chunks);
    const total = targets.reduce((a, b) => a + b, 0);

    let progressed = 0;
    isAnimating.value = true;

    // start from 0 on each run
    safeDatasetCopy.value = FINAL_DATASET.value.map((d, i) => ({
        ...d,
        value: 0,
        color: d.color ? convertColorToHex(d.color) : customPalette.value[i] || palette[i] || palette[i % palette.length]
    }));

    function animate() {
        progressed += total / chunks;

        if (progressed < total) {
            safeDatasetCopy.value = safeDatasetCopy.value.map((d, i) => ({
                ...d,
                value: Math.min(d.value + step[i], targets[i]),
                color: d.color ? convertColorToHex(d.color) : customPalette.value[i] || palette[i] || palette[i % palette.length]
            }));
            requestAnimationFrame(animate);
        } else {
            isAnimating.value = false;
            safeDatasetCopy.value = FINAL_DATASET.value.map((d, i) => ({
                ...d,
                value: targets[i],
                color: d.color ? convertColorToHex(d.color) : customPalette.value[i] || palette[i] || palette[i % palette.length],
                id: createUid(),
            }));
        }
    }
    animate();
}

onMounted(() => {
    prepareChart();
});

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkStackbar',
            type: 'dataset',
            debug: debug.value
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'value']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiSparkStackbar',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value
                });
            });
        });
    }

    animateChart();
}

const svg = ref({
    width: 500,
    height: 16,
});

const segregated = ref([])

const total = computed(() => {
    return FINAL_DATASET.value.map(d => d.value || 0).filter((ds, i) => !segregated.value.includes(i)).reduce((a, b) => a + b, 0);
});

const absoluteDataset = computed(() => {
    return safeDatasetCopy.value.map((d, i) => {
        const dValue = d.value || 0;
        const _dProportion = dValue / total.value;
        const dProportion = isNaN(_dProportion) ? 0 : _dProportion;
        const dWidth = dProportion * svg.value.width;

        return {
            ...d,
            value: dValue,
            proportion: dProportion,
            width: dWidth,
            seriesIndex: i,
            proportionLabel: dataLabel({
                v: dProportion * 100,
                s: '%',
                r: FINAL_CONFIG.value.style.legend.percentage.rounding
            }),
        }
    })
});

const mutableDataset = computed(() => {
    return absoluteDataset.value.filter((_ds, i) => !segregated.value.includes(i))
});


function segregate(index) {
    if(segregated.value.includes(index)) {
        segregated.value =segregated.value.filter(s => s !== index)
    } else {
        if(segregated.value.length < safeDatasetCopy.value.length - 1) {
            segregated.value.push(index)
        }
    }
}

function validSeriesToToggle(name) {
    if (!absoluteDataset.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiSparkStackbar - There are no series to show.');
        }
        return null;
    }
    const dp = absoluteDataset.value.find(d => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiSparkStackbar - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.id)) {
        segregate(dp.seriesIndex);
    }
}

function hideSeries(name) {
    const dp  = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.id))  {
        segregate(dp.seriesIndex);
    }
}

const drawableDataset = computed(() => {
    let start = 0;
    const datapoints = [];
    for (let i = 0; i < mutableDataset.value.length; i += 1) {
        datapoints.push({
            ...mutableDataset.value[i],
            start
        });
        start += mutableDataset.value[i].width
    }
    return datapoints
});

const emits = defineEmits(['selectDatapoint'])

function selectDatapoint(datapoint, index, fromLegend = false) {
    emits('selectDatapoint', { datapoint, index });
    if (FINAL_CONFIG.value.events.datapointClick && !fromLegend) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: datapoint.seriesIndex });
    }
}

const dataTooltipSlot = ref(null);
const useCustomFormat = ref(false);
const selectedIndex = ref(null);

function onTrapLeave({ datapoint, seriesIndex }) {
    isTooltip.value = false;
    selectedIndex.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex: datapoint.seriesIndex });
    }
}

function useTooltip({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: datapoint.seriesIndex });
    }

    if (!FINAL_CONFIG.value.style.tooltip.show) {
        return
    }

    dataTooltipSlot.value = { datapoint, seriesIndex, config: FINAL_CONFIG.value, series: absoluteDataset.value };
    isTooltip.value = true;
    selectedIndex.value = seriesIndex;
    const customFormat = FINAL_CONFIG.value.style.tooltip.customFormat;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                seriesIndex: datapoint.seriesIndex,
                datapoint,
                series: absoluteDataset.value,
                config: FINAL_CONFIG.value
            });
            if (typeof customFormatString === 'string') {
                tooltipContent.value = customFormatString
                useCustomFormat.value = true;
            }
        } catch (err) {
            console.warn('Custom format cannot be applied.');
            useCustomFormat.value = false;
        }
    }

    if (!useCustomFormat.value) {
        let html = '';
        html += `<div data-cy="donut-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

        html += `<b>${datapoint.proportionLabel}</b>`;

        html += `<span>(${ applyDataLabel(
            FINAL_CONFIG.value.style.legend.value.formatter, 
            datapoint.value,
            dataLabel({
                p: FINAL_CONFIG.value.style.legend.value.prefix,
                v: datapoint.value, 
                s: FINAL_CONFIG.value.style.legend.value.suffix, 
                r: FINAL_CONFIG.value.style.legend.value.rounding
            }),
            {
                datapoint,
                seriesIndex,
            }
        )})</span>`;

        tooltipContent.value = `<div>${html}</div>`;
    }
}

defineExpose({
    hideSeries,
    showSeries
});

</script>

<template>
    <div class="vue-data-ui-component vue-ui-spark-stackbar" ref="sparkstackbarChart" :style="`width:100%; background:${FINAL_CONFIG.style.backgroundColor}`">
        <!-- TITLE -->
        <div  v-if="FINAL_CONFIG.style.title.text" :style="`width:calc(100% - 12px);background:transparent;margin:0 auto;margin:${FINAL_CONFIG.style.title.margin};padding: 0 6px;text-align:${FINAL_CONFIG.style.title.textAlign}`">
            <div class="atom-title" :style="`font-size:${FINAL_CONFIG.style.title.fontSize}px;color:${FINAL_CONFIG.style.title.color};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold' : 'normal'}`">
                {{ FINAL_CONFIG.style.title.text }}
            </div>
            <div class="atom-subtitle" v-if="FINAL_CONFIG.style.title.subtitle.text" :style="`font-size:${FINAL_CONFIG.style.title.subtitle.fontSize}px;color:${FINAL_CONFIG.style.title.subtitle.color};font-weight:${FINAL_CONFIG.style.title.subtitle.bold ? 'bold' : 'normal'}`">
                {{ FINAL_CONFIG.style.title.subtitle.text }}
            </div>
            
        </div>
        <!-- CHART -->
        <svg 
            ref="svgRef"
            :xmlns="XMLNS" 
            width="100%" 
            :viewBox="`0 0 ${svg.width} ${svg.height}`"
        >
            <PackageVersion />
            
            <defs>
                <linearGradient v-for="(rect, i) in drawableDataset" :key="`stack_gradient_${i}`" gradientTransform="rotate(90)" :id="`stack_gradient_${i}_${uid}`">
                    <stop offset="0%" :stop-color="rect.color"/>
                    <stop offset="50%" :stop-color="setOpacity(shiftHue(rect.color, 0.05), 100 - FINAL_CONFIG.style.bar.gradient.intensity)"/>
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
                        :fill="FINAL_CONFIG.style.backgroundColor"
                    />
                </clipPath>
            </defs>
            <g clip-path="url(#stackPill)" v-if="total > 0">
                <rect
                    data-cy="datapoint-underlayer"
                    v-for="(rect, i) in drawableDataset" 
                    :key="`stack_underlayer_${i}`"
                    :x="rect.start"
                    :y="0"
                    :width="rect.width"
                    :height="svg.height"
                    :fill="FINAL_CONFIG.style.bar.gradient.underlayerColor"
                    :class="{'animated': !isAnimating && !loading}"
                    :style="{
                        opacity: (selectedIndex !== null && FINAL_CONFIG.style.tooltip.show) ? selectedIndex === i ? 1 : 0.5 : 1
                    }"
                />
                <rect 
                    data-cy="datapoint"
                    v-for="(rect, i) in drawableDataset" 
                    :key="`stack_${i}`"
                    :x="rect.start"
                    :y="0"
                    :width="rect.width"
                    :height="svg.height"
                    :fill="FINAL_CONFIG.style.bar.gradient.show ? `url(#stack_gradient_${i}_${uid})` : rect.color"
                    :stroke="FINAL_CONFIG.style.backgroundColor"
                    stroke-linecap="round"
                    :class="{'animated': !isAnimating && !loading }"
                    :style="{
                        opacity: (selectedIndex !== null && FINAL_CONFIG.style.tooltip.show) ? selectedIndex === i ? 1 : 0.5 : 1
                    }"
                />
                <!-- TOOLTIP TRAPS -->
                <rect
                    data-cy="tooltip-trap"
                    v-for="(rect, i) in drawableDataset" 
                    :key="`stack_trap_${i}`"
                    :x="rect.start"
                    :y="0"
                    :width="rect.width"
                    :height="svg.height"
                    fill="transparent"
                    stroke="none"
                    :class="{'animated': !isAnimating && !loading }"
                    @click="() => selectDatapoint(rect, i)"
                    @mouseenter="() => useTooltip({ datapoint: rect, seriesIndex: i })"
                    @mouseleave="onTrapLeave({ datapoint: rect, seriesIndex: i })"
                />
            </g>
            <rect v-else
                :x="2"
                :y="1"
                :width="svg.width - 4"
                :height="svg.height - 2"
                stroke="#CCCCCC"
                stroke-width="2"
                fill="transparent"
                :rx="(svg.height - 4) / 2"
            />
        </svg>

        <div 
            v-if="FINAL_CONFIG.style.legend.show" 
            data-cy="sparkstackbar-legend" 
            :style="`background:transparent;margin:0 auto;margin:${FINAL_CONFIG.style.legend.margin};justify-content:${FINAL_CONFIG.style.legend.textAlign === 'left' ? 'flex-start' : FINAL_CONFIG.style.legend.textAlign === 'right' ? 'flex-end' : 'center'}`" 
            class="vue-ui-sparkstackbar-legend"
        >
            <div
                data-cy="legend-item"
                v-for=" (rect, i) in absoluteDataset" 
                :style="`font-size:${FINAL_CONFIG.style.legend.fontSize}px;`" 
                :class="{'vue-ui-sparkstackbar-legend-item': true, 'vue-ui-sparkstackbar-legend-item-unselected': segregated.includes(i)}" 
                @click="segregate(i); selectDatapoint(rect, i, true)"

            >
                <div style="display:flex;flex-direction:row;align-items:center;gap:4px;justify-content:center" >
                    <svg 
                        :height="`${FINAL_CONFIG.style.legend.fontSize}px`" 
                        :width="`${FINAL_CONFIG.style.legend.fontSize}px`" 
                        viewBox="0 0 10 10"
                    >
                        <defs>
                            <radialGradient :id="`legend_grad_${i}-${uid}`">
                                <stop offset="0%" :stop-color="loading ? '#FFFFFF' : setOpacity(shiftHue(rect.color, 0.05), 100 - FINAL_CONFIG.style.bar.gradient.intensity)"/>
                                <stop offset="100%" :stop-color="rect.color"/>
                            </radialGradient>
                        </defs>
                        <circle :cx="5" :cy="5" :r="5" :fill="FINAL_CONFIG.style.bar.gradient.show ? `url(#legend_grad_${i}-${uid})` : rect.color"/>
                    </svg>
                    <template v-if="!loading">
                        <span :style="`color:${FINAL_CONFIG.style.legend.name.color}; font-weight:${FINAL_CONFIG.style.legend.name.bold ? 'bold' : 'normal'}`">
                            {{ rect.name }}
                        </span>
                        <template v-if="!isAnimating">
                            <span 
                                v-if="FINAL_CONFIG.style.legend.percentage.show" 
                                :style="`font-weight:${FINAL_CONFIG.style.legend.percentage.bold ? 'bold': 'normal'};color:${FINAL_CONFIG.style.legend.percentage.color}`"
                            >
                                {{ segregated.includes(i) ? ' - ' : rect.proportionLabel }}
                            </span>
                            <span 
                                v-if="FINAL_CONFIG.style.legend.value.show" 
                                :style="`font-weight:${FINAL_CONFIG.style.legend.value.bold ? 'bold' : 'normal'};color:${FINAL_CONFIG.style.legend.value.color}`"
                            >
                                ({{ applyDataLabel(
                                    FINAL_CONFIG.style.legend.value.formatter,
                                    rect.value,
                                    dataLabel({
                                        p: FINAL_CONFIG.style.legend.value.prefix,
                                        v: rect.value,
                                        s: FINAL_CONFIG.style.legend.value.suffix,
                                        r: FINAL_CONFIG.style.legend.value.rounding
                                    }),
                                    { datapoint: rect, seriesIndex: i}
                                    )  
                                }})
                            </span> 
                        </template>
                    </template>
                </div>
            </div>
        </div>

        <Tooltip
            :show="isTooltip && FINAL_CONFIG.style.tooltip.show"
            :parent="sparkstackbarChart"
            :backgroundColor="FINAL_CONFIG.style.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.tooltip.color"
            :fontSize="FINAL_CONFIG.style.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.tooltip.position"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :offsetY="-124 + FINAL_CONFIG.style.tooltip.offsetY"
            :blockShiftY="true"
            :smooth="FINAL_CONFIG.style.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
.vue-ui-spark-stackbar {
    position: relative;
}

.vue-ui-sparkstackbar-legend {
    display: flex;
    flex-wrap: wrap;
    column-gap: 12px;
    width: calc(100% - 12px);
    padding: 0 6px;
}
.vue-ui-sparkstackbar-legend-item {
    cursor: pointer;
    transition: opacity 0.2s ease-in-out;
}
.vue-ui-sparkstackbar-legend-item-unselected {
    opacity: 0.3;
}
rect.animated {
    transition: all 0.3s ease-in-out !important;
}
</style>
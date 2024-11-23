<script setup>
import { onMounted, ref, computed, toRefs, watch, shallowReactive } from 'vue';
import { defineAsyncComponent } from 'vue';

import BaseIcon from '../atoms/BaseIcon.vue';

const props = defineProps({
    component: { type: String },
    dataset: { type: [Object, Array, Number, String] },
    config: { type: Object }
});

const { component, dataset, config } = toRefs(props);

const components = {
    VueUi3dBar: defineAsyncComponent(() => import('./vue-ui-3d-bar.vue')),
    VueUiAgePyramid: defineAsyncComponent(() => import('./vue-ui-age-pyramid.vue')),
    VueUiAnnotator: defineAsyncComponent(() => import('./vue-ui-annotator.vue')),
    VueUiCandlestick: defineAsyncComponent(() => import('./vue-ui-candlestick.vue')),
    VueUiChestnut: defineAsyncComponent(() => import('./vue-ui-chestnut.vue')),
    VueUiDashboard: defineAsyncComponent(() => import('./vue-ui-dashboard.vue')),
    VueUiDigits: defineAsyncComponent(() => import('./vue-ui-digits.vue')),
    VueUiDonut: defineAsyncComponent(() => import('./vue-ui-donut.vue')),
    VueUiDonutEvolution: defineAsyncComponent(() => import('./vue-ui-donut-evolution.vue')),
    VueUiGalaxy: defineAsyncComponent(() => import('./vue-ui-galaxy.vue')),
    VueUiGauge: defineAsyncComponent(() => import('./vue-ui-gauge.vue')),
    VueUiHeatmap: defineAsyncComponent(() => import('./vue-ui-heatmap.vue')),
    VueUiKpi: defineAsyncComponent(() => import('./vue-ui-kpi.vue')),
    VueUiMiniLoader: defineAsyncComponent(() => import('./vue-ui-mini-loader.vue')),
    VueUiMolecule: defineAsyncComponent(() => import('./vue-ui-molecule.vue')),
    VueUiMoodRadar: defineAsyncComponent(() => import('./vue-ui-mood-radar.vue')),
    VueUiNestedDonuts: defineAsyncComponent(() => import('./vue-ui-nested-donuts.vue')),
    VueUiOnion: defineAsyncComponent(() => import('./vue-ui-onion.vue')),
    VueUiQuadrant: defineAsyncComponent(() => import('./vue-ui-quadrant.vue')),
    VueUiRadar: defineAsyncComponent(() => import('./vue-ui-radar.vue')),
    VueUiRating: defineAsyncComponent(() => import('./vue-ui-rating.vue')),
    VueUiRelationCircle: defineAsyncComponent(() => import('./vue-ui-relation-circle.vue')),
    VueUiRings: defineAsyncComponent(() => import('./vue-ui-rings.vue')),
    VueUiScatter: defineAsyncComponent(() => import('./vue-ui-scatter.vue')),
    VueUiScreenshot: defineAsyncComponent(() => import('./vue-ui-screenshot.vue')),
    VueUiSkeleton: defineAsyncComponent(() => import('./vue-ui-skeleton.vue')),
    VueUiSmiley: defineAsyncComponent(() => import('./vue-ui-smiley.vue')),
    VueUiSparkbar: defineAsyncComponent(() => import('./vue-ui-sparkbar.vue')),
    VueUiSparkgauge: defineAsyncComponent(() => import('./vue-ui-sparkgauge.vue')),
    VueUiSparkHistogram: defineAsyncComponent(() => import('./vue-ui-sparkhistogram.vue')),
    VueUiSparkline: defineAsyncComponent(() => import('./vue-ui-sparkline.vue')),
    VueUiSparkStackbar: defineAsyncComponent(() => import('./vue-ui-sparkstackbar.vue')),
    VueUiTable: defineAsyncComponent(() => import('./vue-ui-table.vue')),
    VueUiTableSparkline: defineAsyncComponent(() => import('./vue-ui-table-sparkline.vue')),
    VueUiThermometer: defineAsyncComponent(() => import('./vue-ui-thermometer.vue')),
    VueUiTiremarks: defineAsyncComponent(() => import('./vue-ui-tiremarks.vue')),
    VueUiTreemap: defineAsyncComponent(() => import('./vue-ui-treemap.vue')),
    VueUiVerticalBar: defineAsyncComponent(() => import('./vue-ui-vertical-bar.vue')),
    VueUiWaffle: defineAsyncComponent(() => import('./vue-ui-waffle.vue')),
    VueUiWheel: defineAsyncComponent(() => import('./vue-ui-wheel.vue')),
    VueUiXy: defineAsyncComponent(() => import('./vue-ui-xy.vue')),
    VueUiTableHeatmap: defineAsyncComponent(() => import('./vue-ui-table-heatmap.vue')),
    VueUiAccordion: defineAsyncComponent(() => import('./vue-ui-accordion.vue')),
    VueUiQuickChart: defineAsyncComponent(() => import('./vue-ui-quick-chart.vue')),
    VueUiCursor: defineAsyncComponent(() => import('./vue-ui-cursor.vue')),
    VueUiSparkTrend: defineAsyncComponent(() => import('./vue-ui-spark-trend.vue')),
    VueUiStripPlot: defineAsyncComponent(() => import('./vue-ui-strip-plot.vue')),
    VueUiDumbbell: defineAsyncComponent(() => import('./vue-ui-dumbbell.vue')),
    VueUiWordCloud: defineAsyncComponent(() => import('./vue-ui-word-cloud.vue')),
    VueUiXyCanvas: defineAsyncComponent(() => import('./vue-ui-xy-canvas.vue')),
    VueUiFlow: defineAsyncComponent(() => import('./vue-ui-flow.vue')),
    VueUiParallelCoordinatePlot: defineAsyncComponent(() => import('./vue-ui-parallel-coordinate-plot.vue')),
    VueUiTimer: defineAsyncComponent(() => import('./vue-ui-timer.vue')),
    VueUiCarouselTable: defineAsyncComponent(() => import('./vue-ui-carousel-table.vue')),
    VueUiGizmo: defineAsyncComponent(() => import('./vue-ui-gizmo.vue')),
    VueUiStackbar: defineAsyncComponent(() => import('./vue-ui-stackbar.vue')),
    VueUiBullet: defineAsyncComponent(() => import('./vue-ui-bullet.vue'))
};

const componentProps = {
    VueUi3dBar: ['config', 'dataset'],
    VueUiAgePyramid: ['config', 'dataset'],
    VueUiAnnotator: ['config', 'dataset'],
    VueUiCandlestick: ['config', 'dataset'],
    VueUiChestnut: ['config', 'dataset'],
    VueUiDashboard: ['config', 'dataset'],
    VueUiDigits: ['config', 'dataset'],
    VueUiDonut: ['config', 'dataset'],
    VueUiDonutEvolution: ['config', 'dataset'],
    VueUiGalaxy: ['config', 'dataset'],
    VueUiGauge: ['config', 'dataset'],
    VueUiHeatmap: ['config', 'dataset'],
    VueUiKpi: ['config', 'dataset'],
    VueUiMiniLoader: ['config'],
    VueUiMolecule: ['config', 'dataset'],
    VueUiMoodRadar: ['config', 'dataset'],
    VueUiNestedDonuts: ['config', 'dataset'],
    VueUiOnion: ['config', 'dataset'],
    VueUiQuadrant: ['config', 'dataset'],
    VueUiRadar: ['config', 'dataset'],
    VueUiRating: ['config', 'dataset'],
    VueUiRelationCircle: ['config', 'dataset'],
    VueUiRings: ['config', 'dataset'],
    VueUiScatter: ['config', 'dataset'],
    VueUiScreenshot: ['config'],
    VueUiSkeleton: ['config'],
    VueUiSmiley: ['config', 'dataset'],
    VueUiSparkbar: ['config', 'dataset'],
    VueUiSparkgauge: ['config', 'dataset'],
    VueUiSparkHistogram: ['config', 'dataset'],
    VueUiSparkline: ['config', 'dataset'],
    VueUiSparkStackbar: ['config', 'dataset'],
    VueUiTable: ['config', 'dataset'],
    VueUiTableSparkline: ['config', 'dataset'],
    VueUiThermometer: ['config', 'dataset'],
    VueUiTiremarks: ['config', 'dataset'],
    VueUiTreemap: ['config', 'dataset'],
    VueUiVerticalBar: ['config', 'dataset'],
    VueUiWaffle: ['config', 'dataset'],
    VueUiWheel: ['config', 'dataset'],
    VueUiXy: ['config', 'dataset'],
    VueUiTableHeatmap: ['config', 'dataset'],
    VueUiAccordion: ['config'],
    VueUiQuickChart: ['config', 'dataset'],
    VueUiCursor: ['config'],
    VueUiSparkTrend: ['config', 'dataset'],
    VueUiStripPlot: ['config', 'dataset'],
    VueUiDumbbell: ['config', 'dataset'],
    VueUiWordCloud: ['config', 'dataset'],
    VueUiXyCanvas: ['config', 'dataset'],
    VueUiFlow: ['config', 'dataset'],
    VueUiParallelCoordinatePlot: ['config', 'dataset'],
    VueUiTimer: ['config'],
    VueUiCarouselTable: ['config', 'dataset'],
    VueUiGizmo: ['config', 'dataset'],
    VueUiStackbar: ['config', 'dataset'],
    VueUiBullet: ['config', 'dataset'],
};

const emit = defineEmits([
    'selectLegend',
    'selectDatapoint',
    'toggleOpenState',
    'saveAnnotations',
    'selectRoot',
    'selectBranch',
    'selectNut',
    'change',
    'selectPlot',
    'selectSide',
    'rate',
    'postImage',
    'hoverIndex',
    'selectX',
    'toggleLock',
    'toggleTooltip',
    'start',
    'play',
    'pause',
    'reset',
    'restart',
    'lap',
    'toggleAnnotator'
]);

const isError = computed(() => !components[props.component]);
const currentComponent = computed(() => components[props.component] || null);
const currentComponentRef = ref(null);

const relevantProps = computed(() => {
    const requiredProps = componentProps[props.component] || [];
    const relevantProps = {};
    if (requiredProps.includes('config')) relevantProps.config = config.value;
    if (requiredProps.includes('dataset')) relevantProps.dataset = dataset.value;
    return relevantProps;
});


const generatePdf = ref(() => null);
const generateCsv = ref(() => null);
const generateImage = ref(() => null);
const getItemsPositions = ref(() => null);
const toggleReadonly = ref(() => null);
const shoot = ref(() => null);
const close = ref(() => null);
const restoreOrder = ref(() => null);
const recalculateHeight = ref(() => null);
const toggleLock = ref(() => null);
const toggleTable = ref(() => null);
const toggleLabels = ref(() => null);
const toggleSort = ref(() => null);
const toggleStack = ref(() => null);
const toggleTooltip = ref(() => null);
const start = ref(() => null);
const pause = ref(() => null);
const reset = ref(() => null);
const restart = ref(() => null);
const lap = ref(() => null);
const toggleAnimation = ref(() => null);
const pauseAnimation = ref(() => null);
const resumeAnimation = ref(() => null);
const toggleAnnotator = ref(() => null);

onMounted(() => {
    if (isError.value) {
        throw new Error(`\n\nVue Data UI exception:\nThe provided component "${props.component}" does not exist. Check the spelling.\n\nAvailable components:\n\n${Object.keys(components).map(key => `. ${key}\n`).join('')}`);
    }
});


watch(currentComponentRef, async (newRef) => {
    if(newRef) {
        if (newRef.generatePdf) {
            generatePdf.value = newRef.generatePdf;
        }
        if (newRef.generateImage) {
            generateImage.value = newRef.generateImage;
        }
        if (newRef.generateCsv) {
            generateCsv.value = newRef.generateCsv;
        }
        if (newRef.getItemsPositions) {
            getItemsPositions.value = newRef.getItemsPositions;
        }
        if (newRef.toggleReadonly) {
            toggleReadonly.value = newRef.toggleReadonly;
        }
        if (newRef.shoot) {
            shoot.value = newRef.shoot;
        }
        if (newRef.close) {
            close.value = newRef.close;
        }
        if (newRef.restoreOrder) {
            restoreOrder.value = newRef.restoreOrder;
        }
        if (newRef.recalculateHeight) {
            recalculateHeight.value = newRef.recalculateHeight;
        }
        if (newRef.toggleLock) {
            toggleLock.value = newRef.toggleLock;
        }
        if (newRef.toggleTable) {
            toggleTable.value = newRef.toggleTable;
        }
        if (newRef.toggleLabels) {
            toggleLabels.value = newRef.toggleLabels;
        }
        if (newRef.toggleSort) {
            toggleSort.value = newRef.toggleSort;
        }
        if (newRef.toggleStack) {
            toggleStack.value = newRef.toggleStack;
        }
        if (newRef.toggleTooltip) {
            toggleTooltip.value = newRef.toggleTooltip;
        }
        if (newRef.start) {
            start.value = newRef.start;
        }
        if (newRef.pause) {
            pause.value = newRef.pause;
        }
        if (newRef.reset) {
            reset.value = newRef.reset;
        }
        if (newRef.restart) {
            restart.value = newRef.restart;
        }
        if (newRef.lap) {
            lap.value = newRef.lap;
        }
        if (newRef.toggleAnimation) {
            toggleAnimation.value = newRef.toggleAnimation;
        }
        if (newRef.pauseAnimation) {
            pauseAnimation.value = newRef.pauseAnimation;
        }
        if (newRef.resumeAnimation) {
            resumeAnimation.value = newRef.resumeAnimation;
        }
        if (newRef.toggleAnnotator) {
            toggleAnnotator.value = newRef.toggleAnnotator;
        }
    }
})

const getEventHandlers = () => {
    const eventNames = [
        'selectLegend',
        'selectDatapoint',
        'toggleOpenState',
        'saveAnnotations',
        'selectRoot',
        'selectBranch',
        'selectNut',
        'change',
        'selectPlot',
        'selectSide',
        'rate',
        'postImage',
        'hoverIndex',
        'selectX',
        'toggleLock',
        'toggleTooltip',
        'start',
        'pause',
        'reset',
        'restart',
        'lap',
        'toggleAnimation',
        'pauseAnimation',
        'resumeAnimation',
        'toggleAnnotator'
    ];
    const handlers = {};
    eventNames.forEach(event => {
        handlers[event] = (...args) => emit(event, ...args);
    });
    return handlers;
};

const QUEUE_GET_DATA = shallowReactive([]);

watch([QUEUE_GET_DATA, currentComponentRef], () => {
    if (!currentComponentRef.value) return;
    while (QUEUE_GET_DATA.length) {
        const [methodName, ...args] = QUEUE_GET_DATA.shift();
        if (typeof currentComponentRef.value[methodName] === 'function') {
            currentComponentRef.value[methodName](...args)
        }
    }
})

defineExpose({
    getData: (...args) => currentComponentRef.value && typeof currentComponentRef.value.getData === 'function' ? currentComponentRef.value.getData() : QUEUE_GET_DATA.push(['getData', ...args]),
    generatePdf,
    generateCsv,
    generateImage,
    getItemsPositions,
    toggleReadonly,
    shoot,
    close,
    restoreOrder,
    recalculateHeight,
    toggleLock,
    toggleTable,
    toggleLabels,
    toggleSort,
    toggleStack,
    toggleTooltip,
    start,
    pause,
    reset,
    restart,
    lap,
    pauseAnimation,
    resumeAnimation,
    toggleAnimation,
    toggleAnnotator
});
</script>

<template>
    <div v-if="isError" style="width:100%; display: flex; gap:6px; align-items:center; color:#FF0000">
        <div style="width:36px">
            <BaseIcon name="moodFlat" stroke="#FF0000" />
        </div>
        The provided component "{{ component }}" does not exist
    </div>

    <component
        :is="currentComponent"
        ref="currentComponentRef"
        v-else
        v-bind="relevantProps"
        v-on="getEventHandlers()"
    >
        <template v-for="(_slotContent, slotName) in $slots" v-slot:[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps"></slot>
        </template>
    </component>
</template>
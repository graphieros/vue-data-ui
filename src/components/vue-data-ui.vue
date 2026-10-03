<script setup>
import {
    computed,
    defineAsyncComponent,
    onMounted,
    ref,
    useAttrs,
    watch,
} from 'vue';

import BaseIcon from '../atoms/BaseIcon.vue';

defineOptions({
    inheritAttrs: false,
});

const props = defineProps({
    component: { type: String },
    dataset: { type: [Object, Array, Number, String] },
    config: { type: Object },
});

const attrs = useAttrs();

const components = {
    VueUi3dBar: defineAsyncComponent(() => import('./vue-ui-3d-bar.vue')),
    VueUiAgePyramid: defineAsyncComponent(
        () => import('./vue-ui-age-pyramid.vue'),
    ),
    VueUiAnnotator: defineAsyncComponent(
        () => import('./vue-ui-annotator.vue'),
    ),
    VueUiCandlestick: defineAsyncComponent(
        () => import('./vue-ui-candlestick.vue'),
    ),
    VueUiChestnut: defineAsyncComponent(() => import('./vue-ui-chestnut.vue')),
    VueUiDashboard: defineAsyncComponent(
        () => import('./vue-ui-dashboard.vue'),
    ),
    VueUiDigits: defineAsyncComponent(() => import('./vue-ui-digits.vue')),
    VueUiDonut: defineAsyncComponent(() => import('./vue-ui-donut.vue')),
    VueUiDonutEvolution: defineAsyncComponent(
        () => import('./vue-ui-donut-evolution.vue'),
    ),
    VueUiGalaxy: defineAsyncComponent(() => import('./vue-ui-galaxy.vue')),
    VueUiGauge: defineAsyncComponent(() => import('./vue-ui-gauge.vue')),
    VueUiHeatmap: defineAsyncComponent(() => import('./vue-ui-heatmap.vue')),
    VueUiKpi: defineAsyncComponent(() => import('./vue-ui-kpi.vue')),
    VueUiMiniLoader: defineAsyncComponent(
        () => import('./vue-ui-mini-loader.vue'),
    ),
    VueUiMolecule: defineAsyncComponent(() => import('./vue-ui-molecule.vue')),
    VueUiMoodRadar: defineAsyncComponent(
        () => import('./vue-ui-mood-radar.vue'),
    ),
    VueUiNestedDonuts: defineAsyncComponent(
        () => import('./vue-ui-nested-donuts.vue'),
    ),
    VueUiOnion: defineAsyncComponent(() => import('./vue-ui-onion.vue')),
    VueUiQuadrant: defineAsyncComponent(() => import('./vue-ui-quadrant.vue')),
    VueUiRadar: defineAsyncComponent(() => import('./vue-ui-radar.vue')),
    VueUiRating: defineAsyncComponent(() => import('./vue-ui-rating.vue')),
    VueUiRelationCircle: defineAsyncComponent(
        () => import('./vue-ui-relation-circle.vue'),
    ),
    VueUiRings: defineAsyncComponent(() => import('./vue-ui-rings.vue')),
    VueUiScatter: defineAsyncComponent(() => import('./vue-ui-scatter.vue')),
    VueUiSkeleton: defineAsyncComponent(() => import('./vue-ui-skeleton.vue')),
    VueUiSmiley: defineAsyncComponent(() => import('./vue-ui-smiley.vue')),
    VueUiSparkbar: defineAsyncComponent(() => import('./vue-ui-sparkbar.vue')),
    VueUiSparkgauge: defineAsyncComponent(
        () => import('./vue-ui-sparkgauge.vue'),
    ),
    VueUiSparkHistogram: defineAsyncComponent(
        () => import('./vue-ui-sparkhistogram.vue'),
    ),
    VueUiSparkline: defineAsyncComponent(
        () => import('./vue-ui-sparkline.vue'),
    ),
    VueUiSparkStackbar: defineAsyncComponent(
        () => import('./vue-ui-sparkstackbar.vue'),
    ),
    VueUiTable: defineAsyncComponent(() => import('./vue-ui-table.vue')),
    VueUiTableSparkline: defineAsyncComponent(
        () => import('./vue-ui-table-sparkline.vue'),
    ),
    VueUiThermometer: defineAsyncComponent(
        () => import('./vue-ui-thermometer.vue'),
    ),
    VueUiTiremarks: defineAsyncComponent(
        () => import('./vue-ui-tiremarks.vue'),
    ),
    VueUiTreemap: defineAsyncComponent(() => import('./vue-ui-treemap.vue')),
    VueUiVerticalBar: defineAsyncComponent(
        () => import('./vue-ui-horizontal-bar.vue'),
    ), // legacy support
    VueUiHorizontalBar: defineAsyncComponent(
        () => import('./vue-ui-horizontal-bar.vue'),
    ), // v3 renaming
    VueUiWaffle: defineAsyncComponent(() => import('./vue-ui-waffle.vue')),
    VueUiWheel: defineAsyncComponent(() => import('./vue-ui-wheel.vue')),
    VueUiXy: defineAsyncComponent(() => import('./vue-ui-xy.vue')),
    VueUiTableHeatmap: defineAsyncComponent(
        () => import('./vue-ui-table-heatmap.vue'),
    ),
    VueUiAccordion: defineAsyncComponent(
        () => import('./vue-ui-accordion.vue'),
    ),
    VueUiQuickChart: defineAsyncComponent(
        () => import('./vue-ui-quick-chart.vue'),
    ),
    VueUiCursor: defineAsyncComponent(() => import('./vue-ui-cursor.vue')),
    VueUiSparkTrend: defineAsyncComponent(
        () => import('./vue-ui-spark-trend.vue'),
    ),
    VueUiStripPlot: defineAsyncComponent(
        () => import('./vue-ui-strip-plot.vue'),
    ),
    VueUiDumbbell: defineAsyncComponent(() => import('./vue-ui-dumbbell.vue')),
    VueUiWordCloud: defineAsyncComponent(
        () => import('./vue-ui-word-cloud.vue'),
    ),
    VueUiXyCanvas: defineAsyncComponent(() => import('./vue-ui-xy-canvas.vue')),
    VueUiFlow: defineAsyncComponent(() => import('./vue-ui-flow.vue')),
    VueUiParallelCoordinatePlot: defineAsyncComponent(
        () => import('./vue-ui-parallel-coordinate-plot.vue'),
    ),
    VueUiTimer: defineAsyncComponent(() => import('./vue-ui-timer.vue')),
    VueUiCarouselTable: defineAsyncComponent(
        () => import('./vue-ui-carousel-table.vue'),
    ),
    VueUiGizmo: defineAsyncComponent(() => import('./vue-ui-gizmo.vue')),
    VueUiStackbar: defineAsyncComponent(() => import('./vue-ui-stackbar.vue')),
    VueUiStackline: defineAsyncComponent(
        () => import('./vue-ui-stackline.vue'),
    ),
    VueUiBullet: defineAsyncComponent(() => import('./vue-ui-bullet.vue')),
    VueUiFunnel: defineAsyncComponent(() => import('./vue-ui-funnel.vue')),
    VueUiHistoryPlot: defineAsyncComponent(
        () => import('./vue-ui-history-plot.vue'),
    ),
    VueUiCirclePack: defineAsyncComponent(
        () => import('./vue-ui-circle-pack.vue'),
    ),
    VueUiWorld: defineAsyncComponent(() => import('./vue-ui-world.vue')),
    VueUiRidgeline: defineAsyncComponent(
        () => import('./vue-ui-ridgeline.vue'),
    ),
    VueUiChord: defineAsyncComponent(() => import('./vue-ui-chord.vue')),
    VueUiDag: defineAsyncComponent(() => import('./vue-ui-dag.vue')),
    VueUiGeo: defineAsyncComponent(() => import('./vue-ui-geo.vue')),
    VueUiBump: defineAsyncComponent(() => import('./vue-ui-bump.vue')),
    VueUiHill: defineAsyncComponent(() => import('./vue-ui-hill.vue')),
    VueUiLabel: defineAsyncComponent(() => import('./vue-ui-label.vue')),
};

const CONFIG_ONLY_COMPONENTS = new Set([
    'VueUiMiniLoader',
    'VueUiSkeleton',
    'VueUiAccordion',
    'VueUiCursor',
    'VueUiTimer',
]);

const EXPOSED_METHODS = [
    'autoSize',
    'cancel',
    'close',
    'copyAlt',
    'focusLocation',
    'generateCsv',
    'generateImage',
    'generatePdf',
    'generateSvg',
    'getItemsPositions',
    'hideSeries',
    'lap',
    'pause',
    'pauseAnimation',
    'recalculateHeight',
    'reset',
    'resetZoom',
    'restart',
    'restoreOrder',
    'resumeAnimation',
    'save',
    'selectGroup',
    'selectNode',
    'selectRibbon',
    'setZoomState',
    'shoot',
    'showSeries',
    'start',
    'switchOrientation',
    'toggleAnimation',
    'toggleAnnotator',
    'toggleLabels',
    'toggleLock',
    'toggleReadonly',
    'toggleSort',
    'toggleStack',
    'toggleTable',
    'toggleTooltip',
    'toggleZoom',
    'zoomIn',
    'zoomOut',
];

const currentComponentRef = ref(null);

const isError = computed(() => !components[props.component]);

const currentComponent = computed(() => components[props.component] || null);

function getComponentBindings() {
    const bindings = {
        ...attrs,
        config: props.config,
    };

    if (!CONFIG_ONLY_COMPONENTS.has(props.component)) {
        bindings.dataset = props.dataset;
    }

    return bindings;
}

/**
 * Methods that may be called before the async child component
 * has finished mounting.
 */
const queue = [];

function enqueue(method, args) {
    return new Promise((resolve, reject) => {
        queue.push({
            method,
            args,
            resolve,
            reject,
        });
    });
}

function methodNotFoundError(method) {
    return new Error(`Method "${method}" not found on ${props.component}`);
}

function invokeMethod(method, args) {
    const instance = currentComponentRef.value;
    if (!instance) return null;
    const fn = instance[method];
    if (typeof fn !== 'function') return null;
    return fn.apply(instance, args);
}

function invokeOrQueue(method, args) {
    const instance = currentComponentRef.value;
    if (!instance) return enqueue(method, args);
    const fn = instance[method];
    if (typeof fn !== 'function') {
        return Promise.reject(methodNotFoundError(method));
    }
    return fn.apply(instance, args);
}

watch(currentComponentRef, (instance) => {
    if (!instance) return;
    while (queue.length) {
        const { method, args, resolve, reject } = queue.shift();
        const fn = instance[method];
        if (typeof fn !== 'function') {
            reject(methodNotFoundError(method));
            continue;
        }
        Promise.resolve()
            .then(() => fn.apply(instance, args))
            .then(resolve)
            .catch(reject);
    }
});

const exposedMethods = Object.fromEntries(
    EXPOSED_METHODS.map((method) => [
        method,
        (...args) => invokeMethod(method, args),
    ]),
);

defineExpose({
    getData(...args) {
        return invokeOrQueue('getData', args);
    },

    getImage(options = {}) {
        const { scale = 2 } = options;

        return invokeOrQueue('getImage', [
            {
                scale,
            },
        ]);
    },

    ...exposedMethods,
});

onMounted(() => {
    if (!isError.value) {
        return;
    }

    console.error(
        `\n\nVue Data UI exception:\nThe provided component "${props.component}" does not exist. Check the spelling.\n\nAvailable components:\n\n${Object.keys(
            components,
        )
            .map((key) => `. ${key}\n`)
            .join('')}`,
    );
});

const notSupported = computed(() => {
    let message = `The provided component ${props.component} does not exist.`;
    if (['VueUiIcon', 'VueUiPattern', 'Arrow'].includes(props.component)) {
        message = `${props.component} is not supported by the VueDataUi universal component. You must import it individually.`;
        console.warn(message);
        return {
            status: 'notSupported',
            message,
        };
    }
    console.warn(message);
    return {
        status: 'unknown',
        message,
    };
});
</script>

<template>
    <div
        v-if="isError"
        :style="{
            width: '100%',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            color:
                notSupported.status === 'notSupported' ? '#FF9000' : '#FF0000',
        }"
    >
        <div style="width: 36px">
            <BaseIcon
                v-if="notSupported.status === 'unknown'"
                name="moodFlat"
                stroke="#FF0000"
            />

            <BaseIcon
                v-if="notSupported.status === 'notSupported'"
                name="circleExclamation"
                stroke="#FF9000"
            />
        </div>

        {{ notSupported.message }}
    </div>

    <component
        v-else
        :is="currentComponent"
        ref="currentComponentRef"
        v-bind="getComponentBindings()"
    >
        <template
            v-for="(_slotContent, slotName) in $slots"
            v-slot:[slotName]="slotProps"
        >
            <slot :name="slotName" v-bind="slotProps" />
        </template>
    </component>
</template>

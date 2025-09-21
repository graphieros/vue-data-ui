<script setup>
import { defineAsyncComponent, onMounted, ref, computed, toRefs, watch, shallowReactive } from 'vue'
import BaseIcon from '../atoms/BaseIcon.vue'

const props = defineProps({
    /** Primary way: pass a loader that returns an import() Promise */
    loader: { type: Function, default: null },

    /** Legacy way: component name (used only if no loader is provided) */
    component: { type: String, default: '' },

    dataset: { type: [Object, Array, Number, String], default: null },
    config: { type: Object, default: () => ({}) }
})

const emit = defineEmits([
    'selectLegend', 'selectDatapoint', 'toggleOpenState', 'saveAnnotations', 'selectRoot', 'selectBranch', 'selectNut',
    'change', 'selectPlot', 'selectSide', 'rate', 'postImage', 'hoverIndex', 'selectX', 'toggleLock', 'toggleTooltip',
    'start', 'play', 'pause', 'reset', 'restart', 'lap', 'toggleAnnotator', 'selectGroup', 'selectRibbon', 'toggleTable', 'resetZoom'
])

const { loader, component, dataset, config } = toRefs(props);

const registry = ref(null)
async function loadRegistry () {
    if (!registry.value) {
        const mod = await import('./universal-registry.js')
        registry.value = mod.fallbackLoaders
    }
    return registry.value
}

watch([loader, component], async ([ldr, name]) => {
    if (!ldr && name) await loadRegistry()
}, { immediate: true })

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
    VueUiVerticalBar: ['config', 'dataset'], // delete in v4
    VueUiHorizontalBar: ['config', 'dataset'], // v3 renaming
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
    VueUiFunnel: ['config', 'dataset'],
    VueUiHistoryPlot: ['config', 'dataset'],
    VueUiCirclePack: ['config', 'dataset'],
    VueUiWorld: ['config', 'dataset'],
    VueUiRidgeline: ['config', 'dataset'],
    VueUiChord: ['config', 'dataset']
};

const unsupportedAtoms = ['VueUiIcon', 'VueUiPattern', 'Arrow']
const isUnsupportedAtom = computed(() => unsupportedAtoms.includes(component.value))

const isError = computed(() => {
    if (loader.value) return false
    if (!component.value) return true
    if (isUnsupportedAtom.value) return true
    if (!registry.value) return false
    return !registry.value[component.value]
})

const currentComponent = computed(() => {
    if (loader.value) {
        const normalized = async () => {
            const mod = await loader.value()
            if (mod && (mod.render || mod.setup)) return mod
            const maybeDefault = mod?.default
            if (maybeDefault) return maybeDefault
            if (mod && typeof mod === 'object') {
                const first = Object.values(mod)[0]
                if (first) return first
            }
            console.error('[VueDataUi] Loader did not return a component.');
            return;
        }
        return defineAsyncComponent({ loader: normalized })
    }

    const use = async () => {
        const reg = await loadRegistry()
        const l = reg[component.value]
        if (!l) {
            console.error((`Unknown component ${component.value}`));
            return;
        }
        const mod = await l()
        return mod?.default ?? mod
    }
    return defineAsyncComponent({ loader: use })
})

const relevantProps = computed(() => {
    if (loader.value) return { config: config.value, dataset: dataset.value }
    const required = componentProps[component.value] || []
    const out = {}
    if (required.includes('config')) out.config = config.value
    if (required.includes('dataset')) out.dataset = dataset.value
    return out
})


const currentComponentRef = ref(null)

const generatePdf = ref(() => null)
const generateCsv = ref(() => null)
const generateImage = ref(() => null)
const getItemsPositions = ref(() => null)
const toggleReadonly = ref(() => null)
const shoot = ref(() => null)
const close = ref(() => null)
const restoreOrder = ref(() => null)
const recalculateHeight = ref(() => null)
const toggleLock = ref(() => null)
const toggleTable = ref(() => null)
const toggleLabels = ref(() => null)
const toggleSort = ref(() => null)
const toggleStack = ref(() => null)
const toggleTooltip = ref(() => null)
const start = ref(() => null)
const pause = ref(() => null)
const reset = ref(() => null)
const restart = ref(() => null)
const lap = ref(() => null)
const toggleAnimation = ref(() => null)
const pauseAnimation = ref(() => null)
const resumeAnimation = ref(() => null)
const toggleAnnotator = ref(() => null)
const selectNode = ref(() => null)
const selectGroup = ref(() => null)
const selectRibbon = ref(() => null)
const autoSize = ref(() => null)
const resetZoom = ref(() => null)

const QUEUE = shallowReactive([])
function enqueue(method, args) {
    return new Promise((resolve, reject) => { QUEUE.push({ method, args, resolve, reject }) })
}

watch(currentComponentRef, (comp) => {
    if (!comp) return
    while (QUEUE.length) {
        const { method, args, resolve, reject } = QUEUE.shift()
        const fn = comp[method]
        if (typeof fn === 'function') {
            Promise.resolve().then(() => fn(...args)).then(resolve).catch(reject)
        } else {
            reject(new Error(`Method ${method} not found on ${component.value || 'loader() component'}`))
        }
    }
})

watch(currentComponentRef, (newRef) => {
    if (!newRef) return
    const assigns = {
        generatePdf, generateCsv, generateImage, getItemsPositions, toggleReadonly, shoot, close, restoreOrder,
        recalculateHeight, toggleLock, toggleTable, toggleLabels, toggleSort, toggleStack, toggleTooltip,
        start, pause, reset, restart, lap, toggleAnimation, pauseAnimation, resumeAnimation, toggleAnnotator,
        selectNode, selectGroup, selectRibbon, autoSize, resetZoom
    }
    Object.keys(assigns).forEach(k => { if (newRef[k]) assigns[k].value = newRef[k] })
})

function getEventHandlers() {
    const names = [
        'selectLegend', 'selectDatapoint', 'toggleOpenState', 'saveAnnotations', 'selectRoot', 'selectBranch', 'selectNut',
        'change', 'selectPlot', 'selectSide', 'rate', 'postImage', 'hoverIndex', 'selectX', 'toggleLock', 'toggleTooltip',
        'start', 'pause', 'reset', 'restart', 'lap', 'toggleAnimation', 'pauseAnimation', 'resumeAnimation', 'toggleAnnotator',
        'selectNode', 'selectGroup', 'selectRibbon', 'autoSize', 'toggleTable', 'resetZoom', 'play'
    ]
    return Object.fromEntries(names.map(n => [n, (...args) => emit(n, ...args)]))
}

defineExpose({
    getData(...args) {
        if (currentComponentRef.value?.getData) return currentComponentRef.value.getData(...args)
        return enqueue('getData', args)
    },
    getImage(options = {}) {
        const { scale = 2 } = options
        if (currentComponentRef.value?.getImage) return currentComponentRef.value.getImage({ scale })
        return enqueue('getImage', [{ scale }])
    },
    autoSize,
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
    toggleAnnotator,
    selectNode,
    selectGroup,
    selectRibbon,
    resetZoom
})

onMounted(async () => {
    if (isError.value) {
        await loadRegistry().catch(() => {})
        const list = Object.keys(registry.value || {}).map(k => `. ${k}\n`).join('')
        const msg = isUnsupportedAtom.value
        ? `${component.value} is not supported by the VueDataUi universal component. Import it individually.`
        : `The provided component "${component.value}" does not exist.`
        console.error(`\n\nVue Data UI exception:\n${msg}\n\nAvailable components:\n\n${list}`)
    }

    if (loader.value && component.value) {
        console.warn('[VueDataUi] Both `loader` and `component` provided. Using `loader` and ignoring `component`.')
    }
})

const notSupported = computed(() => {
    if (isUnsupportedAtom.value) {
        return {
            status: 'notSupported',
            message: `${component.value} is not supported by the VueDataUi universal component. You must import it individually.`
        }
    }
    return { status: 'unknown', message: `The provided component ${component.value} does not exist.` }
})
</script>

<template>
    <div v-if="isError"
        :style="{ width: '100%', display: 'flex', gap: '6px', alignItems: 'center', color: notSupported.status === 'notSupported' ? '#FF9000' : '#FF0000' }">
        <div style="width:36px">
            <BaseIcon name="moodFlat" v-if="notSupported.status === 'unknown'" stroke="#FF0000" />
            <BaseIcon name="circleExclamation" v-else stroke="#FF9000" />
        </div>
        {{ notSupported.message }}
    </div>

    <component v-else :is="currentComponent" ref="currentComponentRef" v-bind="relevantProps" v-on="getEventHandlers()">
        <template v-for="(_slotContent, slotName) in $slots" v-slot:[slotName]="slotProps">
            <slot :name="slotName" v-bind="slotProps"></slot>
        </template>
    </component>
</template>

<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';

import {
    ref,
    shallowRef,
    shallowReactive,
    toRaw,
    watch,
    computed,
    defineAsyncComponent,
    onBeforeUnmount,
} from 'vue';
import { useNestedProp } from '../useNestedProp';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { createUid } from '../lib';
import { usePrinter } from '../usePrinter';
import UserOptions from '../atoms/UserOptions.vue';
import PenAndPaper from '../atoms/PenAndPaper.vue';

const builtInComponents = {
    VueDataUi: defineAsyncComponent(
        () => import('../components/vue-data-ui.vue'),
    ),
    VueUi3dBar: defineAsyncComponent(
        () => import('../components/vue-ui-3d-bar.vue'),
    ),
    VueUiAccordion: defineAsyncComponent(
        () => import('../components/vue-ui-accordion.vue'),
    ),
    VueUiAgePyramid: defineAsyncComponent(
        () => import('../components/vue-ui-age-pyramid.vue'),
    ),
    VueUiAnnotator: defineAsyncComponent(
        () => import('../components/vue-ui-annotator.vue'),
    ),
    VueUiCandlestick: defineAsyncComponent(
        () => import('../components/vue-ui-candlestick.vue'),
    ),
    VueUiChestnut: defineAsyncComponent(
        () => import('../components/vue-ui-chestnut.vue'),
    ),
    VueUiDigits: defineAsyncComponent(
        () => import('../components/vue-ui-digits.vue'),
    ),
    VueUiDonut: defineAsyncComponent(
        () => import('../components/vue-ui-donut.vue'),
    ),
    VueUiDonutEvolution: defineAsyncComponent(
        () => import('../components/vue-ui-donut-evolution.vue'),
    ),
    VueUiDumbbell: defineAsyncComponent(
        () => import('../components/vue-ui-dumbbell.vue'),
    ),
    VueUiFlow: defineAsyncComponent(
        () => import('../components/vue-ui-flow.vue'),
    ),
    VueUiGalaxy: defineAsyncComponent(
        () => import('../components/vue-ui-galaxy.vue'),
    ),
    VueUiGauge: defineAsyncComponent(
        () => import('../components/vue-ui-gauge.vue'),
    ),
    VueUiHeatmap: defineAsyncComponent(
        () => import('../components/vue-ui-heatmap.vue'),
    ),
    VueUiKpi: defineAsyncComponent(
        () => import('../components/vue-ui-kpi.vue'),
    ),
    VueUiMiniLoader: defineAsyncComponent(
        () => import('../components/vue-ui-mini-loader.vue'),
    ),
    VueUiMolecule: defineAsyncComponent(
        () => import('../components/vue-ui-molecule.vue'),
    ),
    VueUiMoodRadar: defineAsyncComponent(
        () => import('../components/vue-ui-mood-radar.vue'),
    ),
    VueUiNestedDonuts: defineAsyncComponent(
        () => import('../components/vue-ui-nested-donuts.vue'),
    ),
    VueUiOnion: defineAsyncComponent(
        () => import('../components/vue-ui-onion.vue'),
    ),
    VueUiParallelCoordinatePlot: defineAsyncComponent(
        () => import('../components/vue-ui-parallel-coordinate-plot.vue'),
    ),
    VueUiQuadrant: defineAsyncComponent(
        () => import('../components/vue-ui-quadrant.vue'),
    ),
    VueUiQuickChart: defineAsyncComponent(
        () => import('../components/vue-ui-quick-chart.vue'),
    ),
    VueUiRadar: defineAsyncComponent(
        () => import('../components/vue-ui-radar.vue'),
    ),
    VueUiRating: defineAsyncComponent(
        () => import('../components/vue-ui-rating.vue'),
    ),
    VueUiRelationCircle: defineAsyncComponent(
        () => import('../components/vue-ui-relation-circle.vue'),
    ),
    VueUiRings: defineAsyncComponent(
        () => import('../components/vue-ui-rings.vue'),
    ),
    VueUiScatter: defineAsyncComponent(
        () => import('../components/vue-ui-scatter.vue'),
    ),
    VueUiSkeleton: defineAsyncComponent(
        () => import('../components/vue-ui-skeleton.vue'),
    ),
    VueUiSmiley: defineAsyncComponent(
        () => import('../components/vue-ui-smiley.vue'),
    ),
    VueUiSparkHistogram: defineAsyncComponent(
        () => import('../components/vue-ui-sparkhistogram.vue'),
    ),
    VueUiSparkStackbar: defineAsyncComponent(
        () => import('../components/vue-ui-sparkstackbar.vue'),
    ),
    VueUiSparkTrend: defineAsyncComponent(
        () => import('../components/vue-ui-spark-trend.vue'),
    ),
    VueUiSparkbar: defineAsyncComponent(
        () => import('../components/vue-ui-sparkbar.vue'),
    ),
    VueUiSparkgauge: defineAsyncComponent(
        () => import('../components/vue-ui-sparkgauge.vue'),
    ),
    VueUiSparkline: defineAsyncComponent(
        () => import('../components/vue-ui-sparkline.vue'),
    ),
    VueUiStripPlot: defineAsyncComponent(
        () => import('../components/vue-ui-strip-plot.vue'),
    ),
    VueUiTable: defineAsyncComponent(
        () => import('../components/vue-ui-table.vue'),
    ),
    VueUiTableHeatmap: defineAsyncComponent(
        () => import('../components/vue-ui-table-heatmap.vue'),
    ),
    VueUiTableSparkline: defineAsyncComponent(
        () => import('../components/vue-ui-table-sparkline.vue'),
    ),
    VueUiThermometer: defineAsyncComponent(
        () => import('../components/vue-ui-thermometer.vue'),
    ),
    VueUiTimer: defineAsyncComponent(
        () => import('../components/vue-ui-timer.vue'),
    ),
    VueUiTiremarks: defineAsyncComponent(
        () => import('../components/vue-ui-tiremarks.vue'),
    ),
    VueUiTreemap: defineAsyncComponent(
        () => import('../components/vue-ui-treemap.vue'),
    ),
    VueUiVerticalBar: defineAsyncComponent(
        () => import('../components/vue-ui-horizontal-bar.vue'),
    ),
    VueUiHorizontalBar: defineAsyncComponent(
        () => import('../components/vue-ui-horizontal-bar.vue'),
    ),
    VueUiWaffle: defineAsyncComponent(
        () => import('../components/vue-ui-waffle.vue'),
    ),
    VueUiWheel: defineAsyncComponent(
        () => import('../components/vue-ui-wheel.vue'),
    ),
    VueUiWordCloud: defineAsyncComponent(
        () => import('../components/vue-ui-word-cloud.vue'),
    ),
    VueUiXy: defineAsyncComponent(() => import('../components/vue-ui-xy.vue')),
    VueUiXyCanvas: defineAsyncComponent(
        () => import('../components/vue-ui-xy-canvas.vue'),
    ),
    VueUiCarouselTable: defineAsyncComponent(
        () => import('../components/vue-ui-carousel-table.vue'),
    ),
    VueUiGizmo: defineAsyncComponent(
        () => import('../components/vue-ui-gizmo.vue'),
    ),
    VueUiStackbar: defineAsyncComponent(
        () => import('../components/vue-ui-stackbar.vue'),
    ),
    VueUiStackline: defineAsyncComponent(
        () => import('../components/vue-ui-stackline.vue'),
    ),
    VueUiBullet: defineAsyncComponent(
        () => import('../components/vue-ui-bullet.vue'),
    ),
    VueUiFunnel: defineAsyncComponent(
        () => import('../components/vue-ui-funnel.vue'),
    ),
    VueUiHistoryPlot: defineAsyncComponent(
        () => import('../components/vue-ui-history-plot.vue'),
    ),
    VueUiCirclePack: defineAsyncComponent(
        () => import('../components/vue-ui-circle-pack.vue'),
    ),
    VueUiWorld: defineAsyncComponent(
        () => import('../components/vue-ui-world.vue'),
    ),
    VueUiChord: defineAsyncComponent(
        () => import('../components/vue-ui-chord.vue'),
    ),
    VueUiRidgeline: defineAsyncComponent(
        () => import('../components/vue-ui-ridgeline.vue'),
    ),
    VueUiDag: defineAsyncComponent(
        () => import('../components/vue-ui-dag.vue'),
    ),
};

const { vue_ui_dashboard: DEFAULT_CONFIG } = useConfig();

const dashboardRef = ref(null);
const svgRef = ref(null);

const props = defineProps({
    dataset: { type: Array, default: () => [] },
    config: Object,
});

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });
});

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiDashboard',
    rules: [COMMON_RULES.noHint],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const uid = ref(createUid());

const isLocked = ref(FINAL_CONFIG.value.locked);

function toggleLock() {
    isLocked.value = !isLocked.value;
}

watch(
    () => FINAL_CONFIG.value.locked,
    (value) => {
        isLocked.value = value;
    },
);
const placementKeys = ['left', 'top', 'width', 'height'];
function placement(item) {
    return Object.fromEntries(placementKeys.map((key) => [key, item[key]]));
}
function samePlacement(a, b) {
    return placementKeys.every((key) => Object.is(a[key], b[key]));
}
const itemKey = Symbol('dashboard-item');
function makeItem(source, index, key = Symbol()) {
    const item = { ...source, index };
    Object.defineProperty(item, itemKey, { value: key });
    return shallowReactive(item);
}
const items = shallowRef(
    (props.dataset || []).map((item, index) => makeItem(item, index)),
);
let sourcePlacements = new Map(
    items.value.map((item) => [item[itemKey], placement(item)]),
);
watch(
    () => props.dataset,
    (dataset) => {
        const existing = new Map();
        for (const item of items.value) {
            if (!existing.has(item.id)) existing.set(item.id, []);
            existing.get(item.id).push(item);
        }
        const nextSources = new Map();
        let activeOverridden = false;
        items.value = (dataset || []).map((source, index) => {
            const previous = existing.get(source.id)?.shift();
            const key = previous?.[itemKey] ?? Symbol();
            const incoming = placement(source);
            const oldSource = sourcePlacements.get(key);
            const externalPlacementChanged =
                !oldSource || !samePlacement(oldSource, incoming);
            nextSources.set(key, incoming);
            if (gesture.value?.key === key && externalPlacementChanged)
                activeOverridden = true;
            return makeItem(
                {
                    ...source,
                    ...(previous && !externalPlacementChanged
                        ? placement(previous)
                        : incoming),
                },
                index,
                key,
            );
        });
        sourcePlacements = nextSources;
        if (
            gesture.value &&
            (activeOverridden ||
                !items.value.some(
                    (item) => item[itemKey] === gesture.value.key,
                ))
        )
            finishGesture(false);
    },
    { deep: true },
);

const resolvedItems = computed(() =>
    items.value.map((item) => ({
        ...item,
        resolvedComponent:
            typeof item.component === 'string'
                ? builtInComponents[item.component]
                : toRaw(item.component),
    })),
);

const dashboardContainer = ref(null);
const gesture = shallowRef(null);
const changeIndex = computed(() =>
    gesture.value
        ? items.value.findIndex((item) => item[itemKey] === gesture.value.key)
        : null,
);
const emit = defineEmits(['change', 'copyAlt']);
const directions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
function boundedPlacement(item) {
    const width = clamp(Number.isFinite(item.width) ? item.width : 1, 1, 100);
    const height = clamp(
        Number.isFinite(item.height) ? item.height : 1,
        1,
        100,
    );
    return {
        width,
        height,
        left: clamp(Number.isFinite(item.left) ? item.left : 0, 0, 100 - width),
        top: clamp(Number.isFinite(item.top) ? item.top : 0, 0, 100 - height),
    };
}
function isInteractiveTarget(target) {
    return !!target?.closest?.(
        'input, button, select, textarea, a, [contenteditable]:not([contenteditable="false"]), [role="slider"], .range-handle, [data-dashboard-no-drag]',
    );
}
function startGesture(index, event, direction = null) {
    if (
        gesture.value ||
        isLocked.value ||
        isAnnotator.value ||
        event.isPrimary === false ||
        (event.button != null && event.button !== 0) ||
        (!direction && isInteractiveTarget(event.target))
    )
        return;
    const item = items.value[index];
    const rect = dashboardContainer.value?.getBoundingClientRect();
    if (
        !item ||
        !(rect?.width > 0 && rect.height > 0) ||
        !Number.isFinite(event.clientX) ||
        !Number.isFinite(event.clientY)
    )
        return;
    const before = placement(item);
    const initial = boundedPlacement(item);
    Object.assign(item, initial);
    gesture.value = {
        key: item[itemKey],
        direction,
        pointerId: event.pointerId,
        capture: event.currentTarget,
        x: event.clientX,
        y: event.clientY,
        boardWidth: rect.width,
        boardHeight: rect.height,
        initial,
        before,
    };
    event.preventDefault?.();
    event.stopPropagation?.();
    try {
        event.currentTarget?.setPointerCapture?.(event.pointerId);
    } catch {}
    document.addEventListener('pointermove', moveGesture, { passive: false });
    document.addEventListener('pointerup', endGesture);
    document.addEventListener('pointercancel', cancelGesture);
}
function moveGesture(event) {
    const active = gesture.value;
    if (
        !active ||
        (active.pointerId != null && event.pointerId !== active.pointerId)
    )
        return;
    if (!Number.isFinite(event.clientX) || !Number.isFinite(event.clientY))
        return;
    const item = items.value.find((item) => item[itemKey] === active.key);
    if (!item) {
        finishGesture(false);
        return;
    }
    event.preventDefault?.();
    const dx = ((event.clientX - active.x) / active.boardWidth) * 100;
    const dy = ((event.clientY - active.y) / active.boardHeight) * 100;
    const initial = active.initial;
    if (!active.direction) {
        item.left = clamp(initial.left + dx, 0, 100 - initial.width);
        item.top = clamp(initial.top + dy, 0, 100 - initial.height);
        return;
    }
    let left = initial.left,
        top = initial.top;
    let right = initial.left + initial.width,
        bottom = initial.top + initial.height;
    if (active.direction.includes('left'))
        left = clamp(initial.left + dx, 0, right - 1);
    else right = clamp(right + dx, left + 1, 100);
    if (active.direction.includes('top'))
        top = clamp(initial.top + dy, 0, bottom - 1);
    else bottom = clamp(bottom + dy, top + 1, 100);
    Object.assign(item, {
        left,
        top,
        width: right - left,
        height: bottom - top,
    });
}
function finishGesture(commit = true) {
    const active = gesture.value;
    if (!active) return;
    gesture.value = null;
    document.removeEventListener('pointermove', moveGesture);
    document.removeEventListener('pointerup', endGesture);
    document.removeEventListener('pointercancel', cancelGesture);
    try {
        active.capture?.releasePointerCapture?.(active.pointerId);
    } catch {}
    const item = items.value.find((item) => item[itemKey] === active.key);
    if (!commit || !item || samePlacement(active.before, placement(item)))
        return;
    const initial = active.initial;
    if (!active.direction) {
        item.left = clamp(Math.round(item.left), 0, 100 - item.width);
        item.top = clamp(Math.round(item.top), 0, 100 - item.height);
    } else {
        const right = initial.left + initial.width,
            bottom = initial.top + initial.height;
        if (active.direction.includes('left')) {
            item.left = clamp(Math.round(item.left), 0, right - 1);
            item.width = right - item.left;
        } else
            item.width =
                clamp(Math.round(item.left + item.width), item.left + 1, 100) -
                item.left;
        if (active.direction.includes('top')) {
            item.top = clamp(Math.round(item.top), 0, bottom - 1);
            item.height = bottom - item.top;
        } else
            item.height =
                clamp(Math.round(item.top + item.height), item.top + 1, 100) -
                item.top;
    }
    if (!samePlacement(active.before, placement(item)))
        emit('change', items.value);
}
function endGesture(event) {
    if (
        !gesture.value ||
        (gesture.value.pointerId != null &&
            event.pointerId !== gesture.value.pointerId)
    )
        return;
    moveGesture(event);
    finishGesture();
}
function cancelGesture(event) {
    if (
        gesture.value?.pointerId != null &&
        event?.pointerId != null &&
        event.pointerId !== gesture.value.pointerId
    )
        return;
    finishGesture();
}
watch(
    isLocked,
    (locked) => {
        if (locked) finishGesture();
    },
    { flush: 'sync' },
);
onBeforeUnmount(() => finishGesture(false));

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-dashboard_${uid.value}`,
    fileName: FINAL_CONFIG.value.userOptions.print.filename || 'dashboard',
    options: {
        ...FINAL_CONFIG.value.userOptions.print,
        aspectRatio: FINAL_CONFIG.value.style.board.aspectRatio,
    },
});

const itemBorder = computed(() => {
    return FINAL_CONFIG.value.style.item.borderColor;
});
const handleColor = computed(() => {
    return FINAL_CONFIG.value.style.resizeHandles.backgroundColor;
});
const aspectRatio = computed(() => {
    return FINAL_CONFIG.value.style.board.aspectRatio;
});
const boardColor = computed(() => {
    return FINAL_CONFIG.value.style.board.backgroundColor;
});
const borderBoard = computed(() => {
    return FINAL_CONFIG.value.style.board.border;
});

function getItemsPositions() {
    return items.value;
}

const hovered = ref(false);
const userOptionsVisible = computed(
    () => !FINAL_CONFIG.value.userOptions.showOnChartHover || hovered.value,
);
const keepUserOptionState = computed(
    () => FINAL_CONFIG.value.userOptions.keepStateOnChartLeave,
);
const hasUserOptions = computed(
    () =>
        (FINAL_CONFIG.value.allowPrint ||
            FINAL_CONFIG.value.userOptions.show) &&
        ['pdf', 'img', 'annotator', 'altCopy'].some(
            (key) => FINAL_CONFIG.value.userOptions.buttons[key],
        ),
);
const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}
watch(
    isAnnotator,
    (active) => {
        if (active) finishGesture();
    },
    { flush: 'sync' },
);

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: resolvedItems.value,
    });
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.userOptions.callbacks.altCopy({
            config: FINAL_CONFIG.value,
            dataset: resolvedItems.value,
        }),
    );
}

defineExpose({
    generatePdf,
    getItemsPositions,
    toggleLock,
    copyAlt,
});
</script>

<template>
    <div
        :id="`vue-ui-dashboard_${uid}`"
        @mouseenter="hovered = true"
        @mouseleave="hovered = false"
        ref="dashboardRef"
        :style="{
            position: 'relative',
        }"
        class="vue-data-ui-component"
    >
        <div
            class="vue-ui-dashboard-container"
            ref="dashboardContainer"
            :style="`outline:${borderBoard}; background:${boardColor}; aspect-ratio:${aspectRatio};${isAnnotator ? 'pointer-events:none' : ''}`"
        >
            <div
                class="vue-ui-dashboard-grid-container"
                :style="`background:${FINAL_CONFIG.style.board.backgroundColor}`"
            >
                <div class="vue-ui-dashboard-grid"></div>
                <div
                    v-for="(item, index) in resolvedItems"
                    :key="items[index][itemKey]"
                    :class="{
                        'vue-ui-dashboard-grid-item': true,
                        'vue-ui-dashboard-grid-item--locked': isLocked,
                    }"
                    :style="{
                        width: `${item.width}%`,
                        height: `${item.height}%`,
                        left: `${item.left}%`,
                        top: `${item.top}%`,
                        cursor: 'move',
                        boxShadow:
                            changeIndex === index
                                ? '0 6px 12px -3px rgba(0,0,0,0.3)'
                                : '',
                        zIndex:
                            changeIndex === index
                                ? resolvedItems.length + 1
                                : item.index,
                        backgroundColor:
                            FINAL_CONFIG.style.item.backgroundColor,
                    }"
                    @pointerdown="startGesture(index, $event)"
                    @lostpointercapture="cancelGesture"
                >
                    <template v-if="!isLocked">
                        <div
                            v-for="direction in directions"
                            :key="direction"
                            :class="`vue-ui-dashboard-resize-handle vue-ui-dashboard-${direction}`"
                            @pointerdown.stop="
                                startGesture(index, $event, direction)
                            "
                        />
                    </template>

                    <slot name="top" :item="item" :index="index" />

                    <component
                        :is="item.resolvedComponent"
                        v-bind="item.props"
                        v-if="item.resolvedComponent"
                    />
                    <template v-else>
                        <slot
                            name="content"
                            :item="item"
                            :index="index"
                            :left="item.left"
                            :top="item.top"
                            :height="item.height"
                            :width="item.width"
                        ></slot>
                    </template>

                    <slot name="bottom" :item="item" :index="index" />
                </div>
            </div>
        </div>

        <svg
            :style="{
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: resolvedItems.length + 1,
            }"
            ref="svgRef"
        />

        <PenAndPaper
            v-bind="getAnnotatorProps(FINAL_CONFIG.userOptions.annotator)"
            v-if="
                FINAL_CONFIG.userOptions.buttons.annotator &&
                dashboardContainer &&
                svgRef
            "
            :color="FINAL_CONFIG.style.board.color"
            :backgroundColor="FINAL_CONFIG.style.board.backgroundColor"
            :active="isAnnotator"
            :svgRef="svgRef"
            :isCursorPointer="isCursorPointer"
            @close="toggleAnnotator"
            :style="{
                zIndex: resolvedItems.length + 1,
            }"
            :palette="FINAL_CONFIG.userOptions.annotatorPalette"
        >
            <template
                v-for="slotName in annotationSlotNames"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getAnnotationSlotProps(slotName, slotProps)"
                />
            </template>
        </PenAndPaper>

        <UserOptions
            v-if="hasUserOptions && (keepUserOptionState || userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.board.backgroundColor"
            :color="FINAL_CONFIG.style.board.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            v-bind="
                getUserOptionsProps(
                    FINAL_CONFIG.userOptions,
                    'pdf img altCopy annotator',
                )
            "
            :hasTooltip="false"
            :hasXls="false"
            :hasTable="false"
            :hasLabel="false"
            :hasFullscreen="false"
            :chartElement="dashboardContainer"
            :isAnnotation="isAnnotator"
            :isCursorPointer="isCursorPointer"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @toggleAnnotator="toggleAnnotator"
            @copyAlt="copyAlt"
            :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
                zIndex: resolvedItems.length + 1,
            }"
        >
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionPdf optionImg optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>
    </div>
</template>

<style scoped>
.vue-ui-dashboard-container {
    width: 100%;
    height: fit-content;
    position: relative;
    overflow: hidden;
}

.vue-ui-dashboard-grid-container {
    position: absolute;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

.vue-ui-dashboard-grid {
    position: absolute;
    width: 100%;
    height: 100%;
}

.vue-ui-dashboard-grid-item {
    position: absolute;
    touch-action: none;
    border: 2px solid transparent;
    transition: opacity 0.1s ease-in-out;
}

.vue-ui-dashboard-grid-item:hover {
    border: 2px dashed v-bind(itemBorder);
}

.vue-ui-dashboard-grid-item--locked {
    border: none !important;
    cursor: default !important;
    touch-action: auto;
}

.vue-ui-dashboard-grid-item:hover .vue-ui-dashboard-resize-handle {
    opacity: 0.5;
}

.vue-ui-dashboard-resize-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    background: v-bind(handleColor);
    opacity: 0;
    transition: opacity 0.1s ease-in-out;
    z-index: 2;
}

.vue-ui-dashboard-resize-handle:hover {
    opacity: 1;
}

.vue-ui-dashboard-top-left {
    top: -5px;
    left: -5px;
    cursor: nw-resize;
}

.vue-ui-dashboard-top-right {
    top: -5px;
    right: -5px;
    cursor: ne-resize;
}

.vue-ui-dashboard-bottom-left {
    bottom: -5px;
    left: -5px;
    cursor: sw-resize;
}

.vue-ui-dashboard-bottom-right {
    bottom: -5px;
    right: -5px;
    cursor: se-resize;
}

/** Override legend font size to make it responsive */
.vue-ui-dashboard-container {
    container-type: inline-size;
    --legend-font-size: clamp(6px, 1.2cqw, 24px);
    --title-font-size: clamp(8px, 2cqw, 28px);
    --subtitle-font-size: clamp(6px, 1.5cqw, 24px);
}

@supports not (font-size: 1cqw) {
    .vue-ui-dashboard-container {
        --title-font-size: clamp(8px, 2cqw, 28px);
        --subtitle-font-size: clamp(6px, 1.5cqw, 24px);
    }
}
</style>

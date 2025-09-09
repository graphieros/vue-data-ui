<script setup>
import { ref, watch, computed, defineAsyncComponent } from 'vue';
import pdf from '../pdf';
import { useNestedProp } from "../useNestedProp";
import { useConfig } from '../useConfig';
import { createUid } from '../lib';

const builtInComponents = {
    VueDataUi : defineAsyncComponent(() => import("../components/vue-data-ui.vue")),
    VueUi3dBar : defineAsyncComponent(() => import("../components/vue-ui-3d-bar.vue")),
    VueUiAccordion : defineAsyncComponent(() => import("../components/vue-ui-accordion.vue")),
    VueUiAgePyramid : defineAsyncComponent(() => import("../components/vue-ui-age-pyramid.vue")),
    VueUiAnnotator : defineAsyncComponent(() => import("../components/vue-ui-annotator.vue")),
    VueUiCandlestick : defineAsyncComponent(() => import("../components/vue-ui-candlestick.vue")),
    VueUiChestnut : defineAsyncComponent(() => import("../components/vue-ui-chestnut.vue")),
    VueUiDigits : defineAsyncComponent(() => import("../components/vue-ui-digits.vue")),
    VueUiDonut : defineAsyncComponent(() => import("../components/vue-ui-donut.vue")),
    VueUiDonutEvolution : defineAsyncComponent(() => import("../components/vue-ui-donut-evolution.vue")),
    VueUiDumbbell : defineAsyncComponent(() => import("../components/vue-ui-dumbbell.vue")),
    VueUiFlow : defineAsyncComponent(() => import("../components/vue-ui-flow.vue")),
    VueUiGalaxy : defineAsyncComponent(() => import("../components/vue-ui-galaxy.vue")),
    VueUiGauge : defineAsyncComponent(() => import("../components/vue-ui-gauge.vue")),
    VueUiHeatmap : defineAsyncComponent(() => import("../components/vue-ui-heatmap.vue")),
    VueUiKpi : defineAsyncComponent(() => import("../components/vue-ui-kpi.vue")),
    VueUiMiniLoader : defineAsyncComponent(() => import("../components/vue-ui-mini-loader.vue")),
    VueUiMolecule : defineAsyncComponent(() => import("../components/vue-ui-molecule.vue")),
    VueUiMoodRadar : defineAsyncComponent(() => import("../components/vue-ui-mood-radar.vue")),
    VueUiNestedDonuts : defineAsyncComponent(() => import("../components/vue-ui-nested-donuts.vue")),
    VueUiOnion : defineAsyncComponent(() => import("../components/vue-ui-onion.vue")),
    VueUiParallelCoordinatePlot : defineAsyncComponent(() => import("../components/vue-ui-parallel-coordinate-plot.vue")),
    VueUiQuadrant : defineAsyncComponent(() => import("../components/vue-ui-quadrant.vue")),
    VueUiQuickChart : defineAsyncComponent(() => import("../components/vue-ui-quick-chart.vue")),
    VueUiRadar : defineAsyncComponent(() => import("../components/vue-ui-radar.vue")),
    VueUiRating : defineAsyncComponent(() => import("../components/vue-ui-rating.vue")),
    VueUiRelationCircle : defineAsyncComponent(() => import("../components/vue-ui-relation-circle.vue")),
    VueUiRings : defineAsyncComponent(() => import("../components/vue-ui-rings.vue")),
    VueUiScatter : defineAsyncComponent(() => import("../components/vue-ui-scatter.vue")),
    VueUiSkeleton : defineAsyncComponent(() => import("../components/vue-ui-skeleton.vue")),
    VueUiSmiley : defineAsyncComponent(() => import("../components/vue-ui-smiley.vue")),
    VueUiSparkHistogram : defineAsyncComponent(() => import("../components/vue-ui-sparkhistogram.vue")),
    VueUiSparkStackbar : defineAsyncComponent(() => import("../components/vue-ui-sparkstackbar.vue")),
    VueUiSparkTrend : defineAsyncComponent(() => import("../components/vue-ui-spark-trend.vue")),
    VueUiSparkbar : defineAsyncComponent(() => import("../components/vue-ui-sparkbar.vue")),
    VueUiSparkgauge : defineAsyncComponent(() => import('../components/vue-ui-sparkgauge.vue')),
    VueUiSparkline : defineAsyncComponent(() => import("../components/vue-ui-sparkline.vue")),
    VueUiStripPlot : defineAsyncComponent(() => import("../components/vue-ui-strip-plot.vue")),
    VueUiTable : defineAsyncComponent(() => import("../components/vue-ui-table.vue")),
    VueUiTableHeatmap : defineAsyncComponent(() => import("../components/vue-ui-table-heatmap.vue")),
    VueUiTableSparkline : defineAsyncComponent(() => import("../components/vue-ui-table-sparkline.vue")),
    VueUiThermometer : defineAsyncComponent(() => import("../components/vue-ui-thermometer.vue")),
    VueUiTimer : defineAsyncComponent(() => import("../components/vue-ui-timer.vue")),
    VueUiTiremarks : defineAsyncComponent(() => import("../components/vue-ui-tiremarks.vue")),
    VueUiTreemap : defineAsyncComponent(() => import("../components/vue-ui-treemap.vue")),
    VueUiVerticalBar : defineAsyncComponent(() => import("../components/vue-ui-vertical-bar.vue")),
    VueUiHorizontalBar : defineAsyncComponent(() => import("../components/vue-ui-vertical-bar.vue")),
    VueUiWaffle : defineAsyncComponent(() => import("../components/vue-ui-waffle.vue")),
    VueUiWheel : defineAsyncComponent(() => import("../components/vue-ui-wheel.vue")),
    VueUiWordCloud : defineAsyncComponent(() => import("../components/vue-ui-word-cloud.vue")),
    VueUiXy : defineAsyncComponent(() => import("../components/vue-ui-xy.vue")),
    VueUiXyCanvas : defineAsyncComponent(() => import("../components/vue-ui-xy-canvas.vue")),
    VueUiCarouselTable : defineAsyncComponent(() => import('../components/vue-ui-carousel-table.vue')),
    VueUiGizmo : defineAsyncComponent(() => import('../components/vue-ui-gizmo.vue')),
    VueUiStackbar : defineAsyncComponent(() => import('../components/vue-ui-stackbar.vue')),
    VueUiBullet : defineAsyncComponent(() => import('../components/vue-ui-bullet.vue')),
    VueUiFunnel : defineAsyncComponent(() => import('../components/vue-ui-funnel.vue')),
    VueUiHistoryPlot : defineAsyncComponent(() => import('../components/vue-ui-history-plot.vue')),
    VueUiCirclePack : defineAsyncComponent(() => import('../components/vue-ui-circle-pack.vue')),
    VueUiWorld : defineAsyncComponent(() => import('../components/vue-ui-world.vue')),
};

const { vue_ui_dashboard: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    dataset: Array,
    config: Object
});

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
});

const uid = ref(createUid());

const isLocked = ref(FINAL_CONFIG.value.locked);

function toggleLock() {
    isLocked.value = !isLocked.value;
}

const gridSize = 1;
const items = ref(props.dataset.map((item, i) => ({
    ...item,
    index: i
})));

const resolvedItems = computed(() =>
    items.value.map(item => ({
        ...item,
        resolvedComponent: typeof item.component === 'string'
            ? builtInComponents[item.component]
            : item.component
    }))
);

const dragging = ref(null);
const resizing = ref(null);
const dragStart = ref({ x: 0, y: 0 });
const resizeStart = ref({ x: 0, y: 0 });
const dashboardContainer = ref(null);
const isDragOrResize = ref(false);
const changeIndex = ref(null);
const isPrinting = ref(false);
const isPaused = ref(false);

function handleInteraction(event) {
    const target = event.target;
    if ((target.tagName === "INPUT" && target.type === "range") || target.classList.contains('range-handle')) {
        isPaused.value = true;
    }
}

function handleInteractionEnd(event) {
    const target = event.target;
    if (target.tagName === "INPUT" && target.type === "range") {
        isPaused.value = false;
    }
}

function generatePdf(){
    isPrinting.value = true;
    pdf({
        domElement: document.getElementById(`vue-ui-dashboard_${uid.value}`),
        fileName: 'vue-ui-dashboard'
    }).finally(() => {
        isPrinting.value = false;
    });
}

function startDrag (index) {
    if(isLocked.value) return;
    isDragOrResize.value = true;
    changeIndex.value = index;
    if (resizing.value === null) {
        dragging.value = index;
        dragStart.value = { x: event.clientX, y: event.clientY };
        const item = items.value[index];
        const maxLeft = 100 - item.width;
        const maxTop = 100 - item.height;

        if (item.left < 0) {
            item.left = 0;
        }
        if (item.top < 0) {
            item.top = 0;
        }
        if (item.left > maxLeft) {
            item.left = maxLeft;
        }
        if (item.top > maxTop) {
            item.top = maxTop;
        }

        if (item.left < 0) {
            item.left = 0;
        }
        if (item.top < 0) {
            item.top = 0;
        }
        if (item.left + item.width > 100) {
            item.left = 100 - item.width;
        }
        if (item.top + item.height > 100) {
            item.top = 100 - item.height;
        }
    }
};

function startResize(index, direction) {
    isDragOrResize.value = true;
    changeIndex.value = index;
    resizing.value = { index, direction };
    const item = items.value[index];
    resizeStart.value = { x: event.clientX, y: event.clientY, initialWidth: item.width, initialHeight: item.height };
};

function checkDirection(item, deltaX, deltaY) {
    if (resizing.value.direction.includes('top')) {
            const newHeight = item.height - (deltaY / dashboardContainer.value.offsetHeight) * 100;
            if (newHeight >= gridSize) {
                item.top += (deltaY / dashboardContainer.value.offsetHeight) * 100;
                item.height = newHeight;
            }
        }
        if (resizing.value.direction.includes('bottom')) {
            const newHeight = item.height + (deltaY / dashboardContainer.value.offsetHeight) * 100;
                if (newHeight >= gridSize) {
                item.height = newHeight;
            }
        }
        if (resizing.value.direction.includes('left')) {
            const newWidth = item.width - (deltaX / dashboardContainer.value.offsetWidth) * 100;
            if (newWidth >= gridSize) {
                item.left += (deltaX / dashboardContainer.value.offsetWidth) * 100;
                item.width = newWidth;
            }
        }
        if (resizing.value.direction.includes('right')) {
            const newWidth = item.width + (deltaX / dashboardContainer.value.offsetWidth) * 100;
            if (newWidth >= gridSize) {
                item.width = newWidth;
            }
        }
}

function onMouseMove(event) {
    if (isLocked.value || isPaused.value) return;
    isDragOrResize.value = true;
    if (dragging.value !== null) {
        const item = items.value[dragging.value];
        const deltaX = event.clientX - dragStart.value.x;
        const deltaY = event.clientY - dragStart.value.y;

        const newLeft = item.left + (deltaX / dashboardContainer.value.offsetWidth) * 100;
        const newTop = item.top + (deltaY / dashboardContainer.value.offsetHeight) * 100;

        if (
            newLeft >= 0 &&
            newTop >= 0 &&
            newLeft + item.width <= 100 &&
            newTop + item.height <= 100
        ) {
            item.left = newLeft;
            item.top = newTop;
        }
        dragStart.value = { x: event.clientX, y: event.clientY };
    }

    if (resizing.value !== null) {
        const item = items.value[resizing.value.index];
        const deltaX = event.clientX - resizeStart.value.x;
        const deltaY = event.clientY - resizeStart.value.y;
        checkDirection(item, deltaX, deltaY);
        resizeStart.value = { x: event.clientX, y: event.clientY };
    }
};

const emit = defineEmits(["change"]);

watch(items, (change) => {
    if(change && !isDragOrResize.value) {
        emit("change", items.value);
    }
    }, { deep: true}
)

function stopDragResize() {
    dragging.value = null;
    resizing.value = null;
    isDragOrResize.value = false;
    changeIndex.value = null;

    items.value.forEach((item) => {
        item.left = Math.round((item.left / 100) * 100);
        item.top = Math.round((item.top / 100) * 100);
        item.width = Math.round((item.width / 100) * 100);
        item.height = Math.round((item.height / 100) * 100);
    });
};

function onTouchStart(index) {
    if (isLocked.value || isPaused.value) return;
    isDragOrResize.value = true;
    changeIndex.value = index;
    if (resizing.value === null) {
        dragging.value = index;
        dragStart.value = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
};

function onTouchResizeStart(index, direction, event) {
    isDragOrResize.value = true;
    changeIndex.value = index;
    if (resizing.value === null) {
        resizing.value = { index, direction };
        const item = items.value[index];
        resizeStart.value = { x: event.touches[0].clientX, y: event.touches[0].clientY, initialWidth: item.width, initialHeight: item.height };
    }
};

function onTouchResizeMove(event) {
    isDragOrResize.value = true;
    event.preventDefault();
    if (resizing.value !== null) {
        const item = items.value[resizing.value.index];
        const deltaX = event.touches[0].clientX - resizeStart.value.x;
        const deltaY = event.touches[0].clientY - resizeStart.value.y;
        checkDirection(item, deltaX, deltaY);
        resizeStart.value = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
};

function onTouchMove(event) {
    if (isLocked.value || isPaused.value) return;
    isDragOrResize.value = true;
    event.preventDefault();
    if (dragging.value !== null) {
        const item = items.value[dragging.value];
        const deltaX = event.touches[0].clientX - dragStart.value.x;
        const deltaY = event.touches[0].clientY - dragStart.value.y;

        const newLeft = item.left + (deltaX / dashboardContainer.value.offsetWidth) * 100;
        const newTop = item.top + (deltaY / dashboardContainer.value.offsetHeight) * 100;

        if (
            newLeft >= 0 &&
            newTop >= 0 &&
            newLeft + item.width <= 100 &&
            newTop + item.height <= 100
        ) {
            item.left = newLeft;
            item.top = newTop;
        }
        dragStart.value = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }
};

function onTouchEnd() {
    isDragOrResize.value = false;
    changeIndex.value = null;
    dragging.value = null;
    resizing.value = null;
    items.value.forEach((item) => {
        item.left = Math.round((item.left / 100) * 100);
        item.top = Math.round((item.top / 100) * 100);
        item.width = Math.round((item.width / 100) * 100);
        item.height = Math.round((item.height / 100) * 100);
    });
};

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
})
const borderBoard = computed(() => {
    return FINAL_CONFIG.value.style.board.border;
})

function getItemsPositions() {
    return items.value;
}

defineExpose({
    generatePdf,
    getItemsPositions,
    toggleLock
})
</script>

<template>
    <div
        @mousedown="handleInteraction"
        @mouseup="handleInteractionEnd"
        @touchstart="handleInteraction"
        @touchend="handleInteractionEnd"
    >
        <div data-dom-to-png-ignore style="width: 100%; display:flex; justify-content: end;" v-if="FINAL_CONFIG.allowPrint">
            <button class="vue-ui-dashboard-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`color:${FINAL_CONFIG.style.board.color}`">
                <svg class="vue-ui-dashboard-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.board.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M18 16v.01" />
                    <path d="M6 16v.01" />
                    <path d="M12 5v.01" />
                    <path d="M12 12v.01" />
                    <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                </svg>
                <span v-else>PDF</span>
            </button>
        </div>
        <div class="vue-ui-dashboard-container" ref="dashboardContainer" :id="`vue-ui-dashboard_${uid}`" :style="`border:${borderBoard}; background:${boardColor}; aspect-ratio:${aspectRatio}`">
            <div 
                class="vue-ui-dashboard-grid-container" 
                ref="container" 
                @mousemove="onMouseMove" 
                @mouseup="stopDragResize"
                @touchmove="onTouchMove"
                @touchend="onTouchEnd"
                :style="`background:${FINAL_CONFIG.style.board.backgroundColor}`"
            >
                <div class="vue-ui-dashboard-grid"></div>
                <div
                    v-for="(item, index) in resolvedItems"
                    :key="item.id"
                    :class="{'vue-ui-dashboard-grid-item': true, 'vue-ui-dashboard-grid-item--locked': isLocked }"
                    :style="{
                        width: `${item.width}%`,
                        height: `${item.height}%`,
                        left: `${item.left}%`,
                        top: `${item.top}%`,
                        cursor: 'move',
                        boxShadow: changeIndex === index ? '0 6px 12px -3px rgba(0,0,0,0.3)' : '',
                        zIndex: changeIndex === index ? resolvedItems.length + 1 : item.index,
                        backgroundColor: FINAL_CONFIG.style.item.backgroundColor
                    }"
                    @mousedown="startDrag(index)"
                    @touchstart="onTouchStart(index, item)"
                >
                    <template v-if="!isLocked">                    
                        <div
                            class="vue-ui-dashboard-resize-handle vue-ui-dashboard-top-left"
                            @mousedown="startResize(index, 'top-left')"
                            @touchstart="onTouchResizeStart(index, 'top-left', $event)"
                            @touchmove="onTouchResizeMove($event)"
                            @touchend="onTouchEnd"
                        ></div>
                        <div
                            class="vue-ui-dashboard-resize-handle vue-ui-dashboard-top-right"
                            @mousedown="startResize(index, 'top-right')"
                            @touchstart="onTouchResizeStart(index, 'top-right', $event)"
                            @touchmove="onTouchResizeMove($event)"
                            @touchend="onTouchEnd"
                        ></div>
                        <div
                            class="vue-ui-dashboard-resize-handle vue-ui-dashboard-bottom-left"
                            @mousedown="startResize(index, 'bottom-left')"
                            @touchstart="onTouchResizeStart(index, 'bottom-left', $event)"
                            @touchmove="onTouchResizeMove($event)"
                            @touchend="onTouchEnd"
                        ></div>
                        <div
                            class="vue-ui-dashboard-resize-handle vue-ui-dashboard-bottom-right"
                            @mousedown="startResize(index, 'bottom-right')"
                            @touchstart="onTouchResizeStart(index, 'bottom-right', $event)"
                            @touchmove="onTouchResizeMove($event)"
                            @touchend="onTouchEnd"
                        ></div>
                    </template>

                    <slot name="top" :item="item" :index="index"/>
                    
                    <component
                        :is="item.resolvedComponent"
                        v-bind="item.props"
                        v-if="item.resolvedComponent"
                    />
                    <template v-else>
                        <slot name="content" :item="item" :index="index" :left="item.left" :top="item.top" :height="item.height" :width="item.width"></slot>
                    </template>

                    <slot name="bottom" :item="item" :index="index"/>
                </div>
            </div>
        </div>
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
    border: 2px solid transparent;
    transition: opacity 0.1s ease-in-out;
}

.vue-ui-dashboard-grid-item:hover {
    border: 2px dashed v-bind(itemBorder);
}

.vue-ui-dashboard-grid-item--locked {
    border: none !important;
    cursor: default !important;
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

.vue-ui-dashboard-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
    font-family: inherit;
    cursor: pointer;
}
.vue-ui-dashboard-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-dashboard-print-icon {
    animation: smartspin 0.5s infinite linear;
}
@keyframes smartspin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
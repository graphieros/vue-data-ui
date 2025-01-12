<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import BaseIcon from './BaseIcon.vue';
import { useResponsive } from '../useResponsive';
import { throttle } from '../canvas-lib';
import { XMLNS, createSmoothPath, createStraightPath, createUid } from '../lib';

const props = defineProps({
    background: {
        type: String,
        default: '#FFFFFF'
    },
    borderColor: {
        type: String,
        default: '#FFFFFF'
    },
    fontSize: {
        type: Number,
        default: 14
    },
    labelLeft: {
        type: String,
        default: ''
    },
    labelRight: {
        type: String,
        default: ''
    },
    textColor: {
        type: String,
        default: '#1A1A1A'
    },
    inputColor: {
        type: String,
        default: '#1A1A1A'
    },
    max: {
        type: Number,
        default: 0
    },
    min: {
        type: Number,
        default: 0
    },
    selectColor: {
        type: String,
        default: '#4A4A4A'
    },
    useResetSlot: {
        type: Boolean,
        default: false
    },
    valueStart: {
        type: [Number, String],
        default: 0
    },
    valueEnd: {
        type: [Number, String],
        default: 0
    },
    minimap: {
        type: Array,
        default: []
    },
    smoothMinimap: {
        type: Boolean,
        default: false
    },
    minimapSelectedColor: {
        type: String,
        default: '#1f77b4'
    },
    minimapSelectionRadius: {
        type: Number,
        default: 12
    },
    minimapLineColor: {
        type: String,
        default: '#2D353C'
    },
    minimapSelectedColorOpacity: {
        type: Number,
        default: 0.2
    },
    minimapSelectedIndex: {
        type: Number,
        default: null
    },
    minimapIndicatorColor: {
        type: String,
        default: '#2D353C'
    },
    refreshStartPoint: {
        type: Number,
        default: 0
    },
    refreshEndPoint: {
        type: Number,
        default: null
    },
    enableRangeHandles: {
        type: Boolean,
        default: false
    },
    enableSelectionDrag: {
        type: Boolean,
        default: true
    },
    verticalHandles: {
        type: Boolean,
        default: false,
    }
});

const zoomWrapper = ref(null);
const startValue = ref(props.min);
const endValue = ref(props.max);
const hasMinimap = computed(() => !!props.minimap.length);
const uid = ref(createUid());

const endpoint = computed(() => {
    return props.refreshEndPoint === null ? props.max : props.refreshEndPoint;
})

const emit = defineEmits(['update:start', 'update:end', 'reset', 'trapMouse']);

const highlightStyle = computed(() => {
    const range = props.max - props.min;
    const startPercent = ((startValue.value - props.min) / range) * 100;
    const endPercent = ((endValue.value - props.min) / range) * 100;
    return {
        left: `${startPercent}%`,
        width: `${endPercent - startPercent}%`,
        background: props.selectColor
    };
});

const slicerColor = computed(() => props.inputColor);
const backgroundColor = computed(() => props.background);
const selectColorOpaque = computed(() => `${props.selectColor}33`);
const borderColor = computed(() => props.borderColor);

const availableTraps = computed(() => {
    let arr = [];
    for (let i = 0; i < props.minimap.length; i += 1) {
        arr.push(i)
    }
    return arr;
})

function reset() {
    emit('reset');
}

function onStartInput() {
    if (Number(startValue.value) > Number(endValue.value) - 1) {
        startValue.value = Number(endValue.value) - 1;
    }
    emit('update:start', Number(startValue.value));
}

function onEndInput() {
    if (Number(endValue.value) < Number(startValue.value) + 1) {
        endValue.value = Number(startValue.value) + 1;
    }
    emit('update:end', Number(endValue.value));
}

watch(
    () => props.min,
    (newMin) => {
        if (Number(startValue.value) < Number(newMin)) {
            startValue.value = Number(newMin);
        }
        if (Number(endValue.value) < Number(newMin)) {
            endValue.value = Number(newMin);
        }
    }
);

watch(
    () => props.max,
    (newMax) => {
        if (Number(startValue.value) > Number(newMax)) {
            startValue.value = Number(newMax);
        }
        if (Number(endValue.value) > Number(newMax)) {
            endValue.value = Number(newMax);
        }
    }
);

const minimapWrapper = ref(null);

const svgMinimap = ref({
    width: 1,
    height: 1
})

const resizeObserver = ref(null);

onMounted(() => {
    if (hasMinimap.value) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: minimapWrapper.value,
            })
            svgMinimap.value.width = width;
            svgMinimap.value.height = height - 47;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(minimapWrapper.value)
    }
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const unitWidthX = computed(() => {
    if(!props.minimap.length) return 0
    return svgMinimap.value.width / props.minimap.length
});

const minimapLine = computed(() => {
    if(!props.minimap.length) return [];
    const max = Math.max(...props.minimap);
    const min = Math.min(...props.minimap) - 10;
    const diff = max - (min > 0 ? 0 : min);
    const points = props.minimap.map((dp, i) => {
        const normalizedVal = dp - min;
        return {
            x: svgMinimap.value.width / (props.minimap.length) * (i) + (unitWidthX.value / 2),
            y: svgMinimap.value.height - (normalizedVal / diff * (svgMinimap.value.height * 0.9))
        }
    });
    const fullSet = props.smoothMinimap ? createSmoothPath(points) : createStraightPath(points);
    const sliced = [...points].slice(props.valueStart, props.valueEnd)
    const selectionSet = props.smoothMinimap ? createSmoothPath(sliced) : createStraightPath(sliced);
    return {
        fullSet,
        selectionSet,
        sliced,
        firstPlot: points[props.valueStart],
        lastPlot: points[props.valueEnd - 1]
    }
});

const selectionRectCoordinates = computed(() => {
    return {
        x: unitWidthX.value * startValue.value + (unitWidthX.value / 2),
        width: svgMinimap.value.width * ((endValue.value - startValue.value) / props.max) - unitWidthX.value
    }
})

const leftLabelPosition = computed(() => {
    return {
        left: 0,
        color: props.textColor,
        fontSize: `${props.fontSize}px`,
        top: hasMinimap.value ? '28px' : '-28px',
        pointerEvents: 'none',
    };
});

const rightLabelPosition = computed(() => {
    return {
        right: 0,
        color: props.textColor,
        fontSize: `${props.fontSize}px`,
        top: hasMinimap.value ? '28px' : '-28px',
        direction: 'rtl',
        pointerEvents: 'none'
    };
});


const selectedTrap = ref(props.minimapSelectedIndex)

watch(() => props.minimapSelectedIndex, (v) => {
    selectedTrap.value = v + props.valueStart
}, { immediate: true })

function trapMouse(trap) {
    selectedTrap.value = trap;
    if (trap >= props.valueStart && trap < props.valueEnd) {
        emit('trapMouse', trap - props.valueStart)
    }
}

const inputStep = ref(0)
const rangeStart = ref(null);
const rangeEnd = ref(null);

function setStartValue(value) {
    startValue.value = value;
    if (rangeStart.value) {
        rangeStart.value.value = value;
    }
    emit('update:start', Number(startValue.value));
}

function setEndValue(value) {
    endValue.value = value;
    if (rangeEnd.value) {
        rangeEnd.value.value = value;
    }
    emit('update:end', Number(endValue.value));
}

const currentRange = computed(() => {
    return props.valueEnd - props.valueStart;
});

const isDragging = ref(false);
let initialMouseX = ref(null);

const dragThreshold = computed(() => {
    if (!zoomWrapper.value) return 20;
    const w = zoomWrapper.value.getBoundingClientRect().width - 48;
    return w / (props.max - props.min);
});

const startDragging = (event) => {
    if (!props.enableSelectionDrag) {
        return;
    }
    const isTouch = event.type === 'touchstart';
    const target = isTouch ? event.targetTouches[0].target : event.target;
    if (target.classList.contains('range-handle')) {
        return;
    }
    isDragging.value = true;
    initialMouseX.value = isTouch ? event.targetTouches[0].clientX : event.clientX;

    const moveHandler = isTouch ? handleTouchDragging : handleDragging;
    const endHandler = isTouch ? stopTouchDragging : stopDragging;

    window.addEventListener(isTouch ? 'touchmove' : 'mousemove', moveHandler, { passive: false });
    window.addEventListener(isTouch ? 'touchend' : 'mouseup', endHandler);
};

function handleDragging(event) {
    updateDragging(event.clientX);
};

function handleTouchDragging(event) {
    if (event.target.classList.contains('range-handle')) {
        return;
    }
    event.preventDefault(); 
    updateDragging(event.targetTouches[0].clientX);
};

function updateDragging(currentX) {
    if (!isDragging.value) return;

    const deltaX = currentX - initialMouseX.value;

    if (Math.abs(deltaX) > dragThreshold.value) {
        if (deltaX > 0) {
            if (Number(endValue.value) + 1 <= props.max) {
                const v = Number(endValue.value) + 1;
                setEndValue(v);
                setStartValue(v - currentRange.value);
            }
        } else {
            if (Number(startValue.value) - 1 >= props.min) {
                const v = Number(startValue.value) - 1;
                setStartValue(v);
                setEndValue(v + currentRange.value);
            }
        }
        initialMouseX.value = currentX;
    }
};

function stopDragging() {
    endDragging('mousemove', 'mouseup');
};

function stopTouchDragging () {
    endDragging('touchmove', 'touchend');
};

function endDragging(moveEvent, endEvent) {
    isDragging.value = false;
    window.removeEventListener(moveEvent, handleDragging);
    window.removeEventListener(endEvent, stopDragging);
};

defineExpose({
    setStartValue,
    setEndValue
})

</script>

<template>
    <div 
        data-html2canvas-ignore data-cy="slicer" 
        style="padding: 0 24px" 
        class="vue-data-ui-zoom"
        ref="zoomWrapper"
        @mousedown="startDragging"
        @touchstart="startDragging"
    >
        <div class="vue-data-ui-slicer-labels" style="position: relative; z-index: 1; pointer-events: none;">
            <div v-if="valueStart !== refreshStartPoint || valueEnd !== endpoint" style="width: 100%; position: relative">
                <button 
                    v-if="!useResetSlot" 
                    data-cy-reset tabindex="0" 
                    role="button" 
                    class="vue-data-ui-refresh-button"
                    :style="{
                        top: hasMinimap ? '36px' : '-16px',
                        pointerEvents: 'all !important'
                    }"
                    @click="reset">
                    <BaseIcon name="refresh" :stroke="textColor" />
                </button>
                <slot v-else name="reset-action" :reset="reset" />
            </div>
        </div>

        <div class="double-range-slider" ref="minimapWrapper" style="z-index: 0">
            <template v-if="hasMinimap">
                <div class="minimap"  style="width: 100%" data-cy="minimap">
                    <svg :xmlns="XMLNS" :viewBox="`0 0 ${svgMinimap.width < 0 ? 0 : svgMinimap.width} ${svgMinimap.height < 0 ? 0 : svgMinimap.height}`">
                        <defs>
                            <linearGradient :id="uid" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" :stop-color="`${minimapLineColor}50`"/>
                                <stop offset="100%" stop-color="transparent"/>
                            </linearGradient>
                        </defs>
                        
                        <path 
                            :d="`M${minimapLine.fullSet}`" 
                            :stroke="`${minimapLineColor}`" 
                            fill="none"
                            stroke-width="1" 
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            style="opacity: 1"
                        />
                        
                        <!-- SELECTION RECT -->
                        <rect
                            :x="selectionRectCoordinates.x"
                            :width="selectionRectCoordinates.width < 0 ? 0 : selectionRectCoordinates.width"
                            :height="Math.max(svgMinimap.height, 0)"
                            :y="0"
                            :fill="borderColor"
                            :rx="minimapSelectionRadius"
                            stroke="none"
                        />

                        <path 
                            :d="`M${unitWidthX / 2},${Math.max(svgMinimap.height, 0)} ${minimapLine.fullSet} L${svgMinimap.width - (unitWidthX / 2)},${Math.max(svgMinimap.height, 0)}Z`" 
                            :fill="`url(#${uid})`"
                            stroke="none"
                            style="opacity: 1"
                        />

                        <rect
                            :x="selectionRectCoordinates.x"
                            :width="selectionRectCoordinates.width < 0 ? 0 : selectionRectCoordinates.width"
                            :height="Math.max(svgMinimap.height, 0)"
                            :y="0"
                            :rx="minimapSelectionRadius"
                            :fill="borderColor"
                        />

                        <rect
                            :x="selectionRectCoordinates.x"
                            :width="selectionRectCoordinates.width < 0 ? 0 : selectionRectCoordinates.width"
                            :height="Math.max(svgMinimap.height, 0)"
                            :y="0"
                            :fill="minimapSelectedColor"
                            :rx="minimapSelectionRadius"
                            :style="{
                                opacity: minimapSelectedColorOpacity
                            }"
                        />

                        <path 
                            :d="`M${minimapLine.sliced[0].x},${Math.max(svgMinimap.height, 0)} ${minimapLine.selectionSet} L${minimapLine.sliced.at(-1).x},${Math.max(svgMinimap.height, 0)}Z`" 
                            :fill="`url(#${uid})`"
                            stroke="none"
                            style="opacity: 1"
                        />

                        <path 
                            :d="`M ${minimapLine.selectionSet}`" 
                            :stroke="`${minimapLineColor}`" 
                            fill="transparent"
                            stroke-width="2" 
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />

                        <circle
                            :cx="minimapLine.firstPlot.x"
                            :cy="minimapLine.firstPlot.y"
                            stroke-width="0.5"
                            :stroke="borderColor"
                            r="3"
                            :fill="minimapLineColor"
                        />

                        <circle
                            :cx="minimapLine.lastPlot.x"
                            :cy="minimapLine.lastPlot.y"
                            stroke-width="0.5"
                            :stroke="borderColor"
                            r="3"
                            :fill="minimapLineColor"
                        />

                        <!-- SELECTION INDICATOR -->
                        <template v-if="selectedTrap !== null">
                            <g v-for="(trap, i) in availableTraps">
                                <line
                                    :x1="unitWidthX * i + (unitWidthX / 2)"
                                    :x2="unitWidthX * i + (unitWidthX / 2)"
                                    :y1="0"
                                    :y2="Math.max(svgMinimap.height, 0)"
                                    :stroke="minimapIndicatorColor"
                                    stroke-linecap="round"
                                    stroke-dasharray="2"
                                    stroke-width="1"
                                    v-if="selectedTrap === trap && trap >= valueStart && trap < valueEnd"
                                />
                            </g>
                        </template>

                        <!-- TOOLTIP TRAPS -->
                        <rect 
                            v-for="(trap, i) in availableTraps"
                            :x="unitWidthX * i"
                            :y="0"
                            :height="Math.max(svgMinimap.height, 0)"
                            :width="unitWidthX < 0 ? 0 : unitWidthX"
                            fill="transparent"
                            style="pointer-events: all !important;"
                            :style="{
                                cursor: trap >= valueStart && trap < valueEnd && enableSelectionDrag ? 'move' : 'default',
                            }"
                            @mouseenter="trapMouse(trap)"
                            @mouseleave="selectedTrap = null; emit('trapMouse', null)"
                        />
                    </svg>
                </div>
            </template>
            <div class="slider-track"></div>
            <div :class="{
                'range-highlight': true,
                'move': enableSelectionDrag
            }" :style="highlightStyle"></div>
            <input 
                v-if="enableRangeHandles"
                ref="rangeStart" 
                :key="`range-min${inputStep}`" 
                type="range" 
                :class="{'range-left': true, 'range-handle': true, 'range-minimap': hasMinimap && verticalHandles }" 
                :min="min" 
                :max="max" 
                v-model="startValue" 
                @input="onStartInput"
            />
            <div class="thumb-label thumb-label-left" :style="leftLabelPosition">
                {{ labelLeft }}
            </div>
            <input 
                v-if="enableRangeHandles"
                ref="rangeEnd" 
                type="range" 
                :class="{'range-right': true, 'range-handle': true, 'range-minimap': hasMinimap && verticalHandles }" 
                :min="min" 
                :max="max" 
                v-model="endValue" 
                @input="onEndInput" 
            />
            <div class="thumb-label thumb-label-right" :style="rightLabelPosition">
                {{ labelRight }}
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.double-range-slider {
    position: relative !important;
    width: calc(100%);
    height: 40px;
    margin: 0 auto;
    padding-bottom: 12px;
}

.minimap {
    pointer-events: none;
    position: absolute;
    top: -33px;
    svg{
        position: absolute;
        top: 0;
        left: 0;
    }
}

input[type="range"] {
    position: absolute;
    left: -10px;
    width: calc(100% + 17px);
    right: 3px;
    appearance: none;
    background: transparent;
    pointer-events: none;
    z-index: 3;
}

input[type="range"].range-minimap {
    width: calc(100%);
    left: 0;
}

input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    pointer-events: auto;
    width: 20px;
    height: 20px;
    background-color: v-bind(slicerColor);
    border-radius: 50%;
    cursor: ew-resize;
    position: relative;
    z-index: 2;
    outline: 2px solid v-bind(borderColor);
    transition: all 0.2s ease-in-out;
    &:active,
    &:hover {
        box-shadow: 0 0 0 10px v-bind(selectColorOpaque);
        background-color: v-bind(selectColor);
    }
}

input[type="range"].range-minimap::-webkit-slider-thumb {
    width: 6px;
    height: 50px;
    border-radius: 0px;
    margin-top: -36px;
    border-right: 1px solid v-bind(selectColor);
    border-left: 1px solid v-bind(selectColor);
    cursor:ew-resize;
}

input[type="range"]::-moz-range-thumb {
    pointer-events: auto;
    width: 20px;
    height: 20px;
    background-color: v-bind(slicerColor);
    border-radius: 50%;
    cursor: ew-resize;
    position: relative;
    z-index: 2;
    outline: 2px solid v-bind(borderColor);
    transition: all 0.2s ease-in-out;
    &:active,
    &:hover {
        box-shadow: 0 0 0 10px v-bind(selectColorOpaque);
        background-color: v-bind(selectColor);
    }
}

input[type="range"].range-minimap::-moz-range-thumb {
    width: 6px;
    height: 50px;
    border-radius: 0px;
    border-right: 1px solid v-bind(selectColor);
    border-left: 1px solid v-bind(selectColor);
    cursor: ew-resize;
    transform: translateY(-20px); 
    pointer-events: auto;
}

input[type="range"]::-ms-thumb {
    pointer-events: auto;
    width: 20px;
    height: 20px;
    background-color: v-bind(slicerColor);
    border-radius: 50%;
    cursor: ew-resize;
    position: relative;
    z-index: 2;
    outline: 2px solid v-bind(borderColor);
    transition: all 0.2s ease-in-out;
    &:active,
    &:hover {
        box-shadow: 0 0 0 10px v-bind(selectColorOpaque);
        background-color: v-bind(selectColor);
    }
}

.slider-track {
    position: absolute;
    width: 99%;
    height: 8px;
    border-radius: 4px;
    background: v-bind(backgroundColor);
    top: 8px;
    z-index: 1;
    left: 50%;
    transform: translateX(-50%);
    -webkit-transform: translateX(-50%);
}

.range-highlight {
    position: absolute;
    height: 8px;
    top: 8px;
    z-index: 1;
    border-radius: 4px;
}

.move {
    cursor: move;
}

.vue-data-ui-refresh-button {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    outline: none;
    border: none;
    background: transparent;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    transform-origin: center;
    &:focus {
        outline: 1px solid v-bind(slicerColor);
    }
    &:hover {
        transform: translateX(-50%) rotate(-90deg)
    }
}

.vue-data-ui-slicer-labels {
    display: flex;
    flex-direction: row;
    align-items: center;
    // padding: 0 24px;
    height: 40px;
}

.vue-data-ui-slicer-label-left,
.vue-data-ui-slicer-label-right {
    position: absolute;
}

.thumb-label {
    position: absolute;
    transform: translateX(-50%);
    width: 1px;
    white-space: nowrap;
}
</style>
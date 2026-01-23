<script setup>
import { 
    computed, 
    nextTick, 
    onBeforeUnmount, 
    onMounted, 
    onUpdated,
    ref, 
    watch, 
} from 'vue';
import { 
    adaptColorToBackground, 
    createSmoothPath, 
    createSmoothPathWithCuts, 
    createStraightPath, 
    createStraightPathWithCuts, 
    createUid,
    triggerEvent,
    XMLNS,
} from '../lib';
import { debounce, throttle } from '../canvas-lib';
import { useResponsive } from '../useResponsive';
import BaseIcon from './BaseIcon.vue';

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
        type: [String, Number],
        default: ''
    },
    labelRight: {
        type: [String, Number],
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
    },
    minimapCompact: {
        type: Boolean,
        default: false,
    },
    allMinimaps: {
        type: Array,
        default() {
            return []
        }
    },
    minimapMerged: {
        type: Boolean,
        default: false
    },
    minimapFrameColor: {
        type: String,
        default: '#e1e5e8'
    },
    cutNullValues: {
        type: Boolean,
        default: false,
    },
    focusOnDrag: {
        type: Boolean,
        default: false,
    },
    focusRangeRatio: {
        type: Number,
        default: 0.1
    }
});

const zoomWrapper = ref(null);
const startValue = ref(props.min);
const endValue = ref(props.max);
const hasMinimap = computed(() => !!props.allMinimaps.length);
const uid = ref(createUid());
const useMini = computed(() => hasMinimap.value && props.minimapCompact);

const wrapperWidth = ref(0);

onMounted(() => {
    const updateWidth = () => {
        if (!zoomWrapper.value) return;
        wrapperWidth.value = zoomWrapper.value.getBoundingClientRect().width;
    };
    updateWidth();

    const onWinResize = throttle(updateWidth, 50);
    window.addEventListener('resize', onWinResize);

    onBeforeUnmount(() => {
        window.removeEventListener('resize', onWinResize);
    });
});

const endpoint = computed(() => {
    return props.refreshEndPoint === null ? props.max : props.refreshEndPoint;
});

const emit = defineEmits(['update:start', 'update:end', 'reset', 'trapMouse']);

const startPercent = computed(() => {
    if (useMini.value) {
        const denom = Math.max(1, absLen.value - 1);
        return (startForInput.value / denom) * 100;
    }
    const range = Math.max(1, props.max - props.min);
    return ((startValue.value - props.min) / range) * 100;
});

const endPercent = computed(() => {
    if (useMini.value) {
        const denom = Math.max(1, absLen.value - 1);
        return (endForInput.value / denom) * 100;
    }
    const range = Math.max(1, props.max - props.min);
    return ((endValue.value - props.min) / range) * 100;
});

const centerPercent = computed(() => (startPercent.value + endPercent.value) / 2);

const overflowsLeft = computed(() => {
    if (!zoomWrapper.value) return false;
    const w = zoomWrapper.value.getBoundingClientRect().width;
    const x = (startPercent.value / 100) * w;
    return x - tooltipLeftWidth.value / 2 < 0;
});

const overflowsRight = computed(() => {
    if (!zoomWrapper.value) return false;
    const w = zoomWrapper.value.getBoundingClientRect().width;
    const x = (endPercent.value / 100) * w;
    return x + tooltipRightWidth.value / 2 > w;
});

const highlightStyle = computed(() => {
    const centerAdjust = overflowsRight.value
        ? `calc(${centerPercent.value}% - ${mergeTooltip.value.width}px - 2px)`
        : overflowsLeft.value
        ? `calc(${centerPercent.value}% - 8px)`
        : `calc(${centerPercent.value}% - ${mergeTooltip.value.width / 2}px - 4px)`;

    return {
        left: `${startPercent.value}%`,
        width: `${Math.max(0, endPercent.value - startPercent.value)}%`,
        background: props.selectColor,
        tooltipLeft: `calc(${startPercent.value}% - ${overflowsLeft.value ? 9 : tooltipLeftWidth.value / 2 + 3.5}px)`,
        tooltipRight: `calc(${endPercent.value}% - ${overflowsRight.value ? tooltipRightWidth.value - 9 : tooltipRightWidth.value / 2 - 3.5}px)`,
        tooltipCenter: centerAdjust,
        arrowLeft: !overflowsLeft.value,
        arrowRight: !overflowsRight.value
    };
});

const gridLenMinus1 = computed(() => Math.max(0, (maxSeries.value || 1) - 1));
const absLenMinus1 = computed(() => Math.max(0, (absLen.value   || 1) - 1));

function miniToGrid(iMini) {
    if (absLenMinus1.value === 0) return 0;
    return Math.round((iMini / absLenMinus1.value) * gridLenMinus1.value);
}
function gridToMini(iGrid) {
    if (gridLenMinus1.value === 0) return 0;
    return Math.round((iGrid / gridLenMinus1.value) * absLenMinus1.value);
}

const miniToAbsStart = (i) => Math.floor(props.min + i);
const miniToAbsExclusiveEnd = (i) => Math.ceil(props.min + i);

const startForInput = computed({
    get() {
        return useMini.value ? miniToGrid(startMini.value) : Number(startValue.value);
    },
    set(v) {
        if (useMini.value) {
            const proposedGrid = Math.round(+v || 0);
            const maxAllowedGrid = Math.max(0, miniToGrid(Math.max(0, endMini.value - 1)));
            const clampedGrid = Math.min(Math.max(0, proposedGrid), maxAllowedGrid);
            const miniIdx = gridToMini(clampedGrid);
            setStartValue(miniToAbsStart(miniIdx));
        } else {
            let proposed = Math.round(+v || 0);
            const maxAllowed = Number(endValue.value) - 1;
            const clamped = Math.min(Math.max(props.min, proposed), maxAllowed);
            setStartValue(clamped);
        }
    }
});

const endForInput = computed({
    get() {
        return useMini.value
        ? miniToGrid(Math.max(startMini.value, endMini.value - 1))
        : Number(endValue.value);
    },
    set(v) {
        if (useMini.value) {
            const proposedGridInc   = Math.round(+v || 0);
            const minAllowedGridInc = miniToGrid(startMini.value);
            const clampedGridInc    = Math.max(proposedGridInc, minAllowedGridInc);
            const miniInc           = gridToMini(clampedGridInc);
            setEndValue(miniToAbsExclusiveEnd(miniInc + 1));
        } else {
            let proposed = Math.round(+v || 0);
            const minAllowed = Number(startValue.value) + 1;
            const clamped = Math.max(minAllowed, Math.min(proposed, props.max));
            setEndValue(clamped);
        }
    }
});

const slicerColor = computed(() => props.inputColor);
const backgroundColor = computed(() => props.background);
const selectColorOpaque = computed(() => `${props.selectColor}33`);
const borderColor = computed(() => props.borderColor);

const availableTraps = computed(() => {
    const arr = [];
    for (let i = 0; i < props.max; i += 1) {
        arr.push(i);
    }
    return arr;
});

function reset() {
    emit('reset');
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
});

const resizeObserver = ref(null);

onMounted(() => {
    if (hasMinimap.value) {
        const handleResize = throttle(() => {
        const { width, height } = useResponsive({
            chart: minimapWrapper.value
        });
        svgMinimap.value.width = width;
        svgMinimap.value.height = height - 47;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(minimapWrapper.value);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const maxSeries = computed(() => {
    return Math.max(...props.allMinimaps.map(d => d.series.length), props.minimap.length || 0);
});

const unitWidthX = computed(() => {
    if (!maxSeries.value) return 0;
    const denom = Math.max(1, maxSeries.value - (props.minimapCompact ? 1 : 0));
    return svgMinimap.value.width / denom;
});


const globalRange = computed(() => {
    const vals = [];
    if (Array.isArray(props.minimap) && props.minimap.length && props.minimapMerged) {
        vals.push(...props.minimap.filter(Number.isFinite));
    }
    if (Array.isArray(props.allMinimaps) && props.allMinimaps.length) {
        for (const ds of props.allMinimaps) {
        if (!ds?.isVisible) continue;
        if (Array.isArray(ds?.series)) vals.push(...ds.series.filter(Number.isFinite));
        }
    }
    if (!vals.length) return { min: 0, max: 1 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
});

const allMin = computed(() => globalRange.value.min);
const allMax = computed(() => globalRange.value.max);

const scaleMin = computed(() => {
    if (allMin.value < 0 && allMax.value > 0) return allMin.value;
    if (allMax.value <= 0) return allMin.value;
    return 0;
});

const absMaxMag = computed(() => Math.max(1e-9, Math.max(Math.abs(allMin.value), Math.abs(allMax.value))));

const hasBothSigns = computed(() => allMin.value < 0 && allMax.value > 0);

const mapY = (val) => {
    const H = Math.max(1, svgMinimap.value.height);
    if (hasBothSigns.value) {
        const M = absMaxMag.value;
        const r = Math.max(-1, Math.min(1, val / M));
        return (1 - (r + 1) / 2) * H;
    } else {
        const min = Math.min(0, allMin.value);
        const max = Math.max(0, allMax.value);
        return H - ((val - min) / Math.max(1e-9, max - min)) * H;
    }
};

const minimapZero = computed(() => mapY(0));

const barTypeQty = computed(() => {
    if (!props.allMinimaps.length) return 0;
    return props.allMinimaps.filter(ds => ds.type === 'bar').length
});

const barWidth = computed(() => {
    return unitWidthX.value / (barTypeQty.value || 1) * 0.8
})

function getBarX(x, i, j) {
    const w = barWidth.value;
    const n = Math.max(1, barTypeQty.value);
    const lastJ = maxSeries.value - 1;
    if (j === 0) return x + (w / 2) * i;
    if (j === lastJ) return x - (w / 2) * (n - i);
    return x - (n * w) / 2 + i * w;
}

function getBarWidth(i, j) {
    return [0, maxSeries.value - 1].includes(j) ? barWidth.value / 2 : barWidth.value
}

function makeSmartMapY(min, max, H) {
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const EPS = 1e-9;

    if (max <= 0) {
        const span = Math.max(EPS, 0 - min);
        return (val) => H - ((val - min) / span) * H;
    }
    if (min >= 0) {
        const span = Math.max(EPS, max - 0);
        return (val) => H - ((val - 0) / span) * H;
    }
    const M = Math.max(EPS, Math.max(Math.abs(min), Math.abs(max)));
    return (val) => {
        const r = clamp(val / M, -1, 1);
        return (1 - (r + 1) / 2) * H;
    };
}

function makeMiniChart(ds, smooth = false) {
    if (!ds || !ds.length) {
        return {
            fullSet: '',
            points: [],
            selectionSet: '',
            sliced: [],
            firstPlot: null,
            lastPlot: null,
            hasFull: false,
            hasSelection: false,
            fullMarkers: [],
            selectionMarkers: [],
        };
    }

    const H = Math.max(1, svgMinimap.value.height);

    const mapYSeries = makeSmartMapY(allMin.value, allMax.value, H);

    const len = ds.length;
    const s = Math.min(Math.max(0, startMini.value), Math.max(0, len - 1));
    const e = Math.min(len, Math.max(s + 1, endMini.value));

    const points = ds.map((dp, i) => {
        const val = dp;
        const valid = Number.isFinite(val);
        const x = unitWidthX.value * i + (props.minimapCompact ? 0 : unitWidthX.value / 2);
        const y0 = mapYSeries(0);

        return {
            x,
            y: valid ? mapYSeries(val) : NaN,
            v: val,
            value: val == null ? null : valid ? val : null,
            y0,
            i,
        };
    });

    const isValid = (idx) => idx >= 0 && idx < points.length && Number.isFinite(points[idx]?.value);

    const fullMarkers = points.filter((p) => Number.isFinite(p.value) && !isValid(p.i - 1) && !isValid(p.i + 1));
    const selectionMarkers = fullMarkers.filter((p) => p.i >= s && p.i < e);

    const sliced = points.slice(s, e);

    const fullSet =
        points.length >= 2
            ? (props.smoothMinimap || smooth
                ? (props.cutNullValues ? createSmoothPathWithCuts(points) : createSmoothPath(points.filter(p => p.value != null)))
                : (props.cutNullValues ? createStraightPathWithCuts(points) : createStraightPath(points.filter(p => p.value != null))))
            : '';

    const selectionSet =
        sliced.length >= 2
            ? (props.smoothMinimap || smooth
                ? (props.cutNullValues ? createSmoothPathWithCuts(sliced) : createSmoothPath(sliced.filter(p => p.value != null)))
                : (props.cutNullValues ? createStraightPathWithCuts(sliced) : createStraightPath(sliced.filter(p => p.value != null))))
            : '';

    return {
        fullSet,
        points,
        selectionSet,
        sliced,
        firstPlot: points[s] || null,
        lastPlot: points[Math.max(0, e - 1)] || null,
        hasFull: points.length >= 2,
        hasSelection: sliced.length >= 2,
        fullMarkers,
        selectionMarkers,
    };
}

const minimapLine = computed(() => {
    if (!props.minimap.length) return {
        fullSet: '',
        selectionSet: '',
        sliced: [],
        firstPlot: null,
        lastPlot: null,
        hasFull: false,
        hasSelection: false,
    };
    return makeMiniChart(props.minimap);
});

const allMinimapLines = computed(() => {
    if (!props.allMinimaps.length) return [];
    return props.allMinimaps.map((ds, idx) => {
        const line = makeMiniChart(ds?.series || [], !!ds.smooth);
        const k = ds?.id ?? ds?.name ?? idx;
        return {
            key: typeof k === 'object' ? JSON.stringify(k) : String(k),
            color: ds?.color,
            ...line,
            isVisible: ds.isVisible,
            type: ds.type || 'line'
        };
    });
});


const selectionRectCoordinates = computed(() => {
    const s = startMini.value;
    const e = Math.max(s + 1, endMini.value);
    return {
        x: unitWidthX.value * s + (props.minimapCompact ? 0 : unitWidthX.value / 2),
        width: unitWidthX.value * (e - s) - unitWidthX.value,
    };
});

const selectedTrap = ref(props.minimapSelectedIndex);

function setSelectedTrap(v) {
    selectedTrap.value = absToMiniStart(props.valueStart) + v;
}

const setSelectedTrapDebounced = debounce(setSelectedTrap, 60);

watch(() => props.minimapSelectedIndex, (newVal, oldVal) => {
    if ([null, undefined].includes(newVal)) {
        selectedTrap.value = null;
        return;
    }
    if (newVal === oldVal) return;
    setSelectedTrapDebounced(newVal);
}, { immediate: true });

function trapMouse(trap) {
    selectedTrap.value = trap;
    const s = startMini.value;
    const e = endMini.value;
    if (trap >= s && trap < e && !isMouseDown.value) {
        emit('trapMouse', trap - s);
    }
}

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

const isZoom = computed(() => {
    return currentRange.value < (props.max - props.min);
});

const isDragging = ref(false);
let initialMouseX = ref(null);

const selectionWidth = computed(() => {
    return ((wrapperWidth.value - 48) / (props.max - props.min)) * currentRange.value;
});

const TRACK_PADDING = 48;

const usablePx = computed(() => {
    return Math.max(1, wrapperWidth.value - TRACK_PADDING - selectionWidth.value);
});

const usableSteps = computed(() => {
    return Math.max(1, (props.max - props.min) - currentRange.value);
});

const indicesPerPixel = computed(() => usableSteps.value / usablePx.value);

const dragStartX = ref(0);
const dragStartStart = ref(0);
const dragStartEnd = ref(0);
const ippAtStart = ref(0);

let activeMoveEvent = null;
let activeEndEvent = null;
let activeMoveHandler = null;
let activeEndHandler = null;

const dragStartIndex = ref(props.min);

function clientXToIndex(clientX) {
    if (!zoomWrapper.value) return props.min;

    const rect = zoomWrapper.value.getBoundingClientRect();
    const left = rect.left + TRACK_PADDING / 2;
    const right = rect.right - TRACK_PADDING / 2;
    const trackWidth = Math.max(1, right - left);

    const x = Math.max(left, Math.min(clientX, right));
    const pct = (x - left) / trackWidth;

    const span = Math.max(1, props.max - props.min);
    return Math.round(props.min + pct * span);
}

const startDragging = async (event) => {
    showTooltip.value = true;
    if (!props.enableSelectionDrag) return;

    const isTouch = event.type === 'touchstart';
    if (!isTouch) event.stopPropagation();

    const touch0 = isTouch && event.targetTouches && event.targetTouches[0] ? event.targetTouches[0] : null;
    const target = isTouch ? (touch0 ? touch0.target : null) : event.target;

    if (!target || !(target instanceof Element)) return;
    if (target.classList && target.classList.contains('range-handle')) return;

    isDragging.value = true;

    const x = isTouch ? (touch0 ? touch0.clientX : 0) : event.clientX;
    initialMouseX.value = x;
    dragStartX.value = x;

    if (props.focusOnDrag && !isZoom.value && zoomWrapper.value) {
        dragStartIndex.value = clientXToIndex(x);
        const ratio = Math.min(0.95, Math.max(0.05, props.focusRangeRatio));

        const total = props.max - props.min;
        const span = Math.max(1, Math.round(total * ratio));
        const half = Math.floor(span / 2);

        let focusStart = dragStartIndex.value - half;
        focusStart = Math.max(props.min, Math.min(focusStart, props.max - span));
        const focusEnd = Math.min(props.max, focusStart + span);

        setStartValue(focusStart);
        setEndValue(focusEnd);
        
        triggerEvent(zoomWrapper.value, 'mouseup');
        await nextTick();
        triggerEvent(zoomWrapper.value, 'mousedown', { clientX: x });
    }

    dragStartStart.value = Number(startValue.value);
    dragStartEnd.value = Number(endValue.value);
    ippAtStart.value = indicesPerPixel.value;

    activeMoveEvent   = isTouch ? 'touchmove' : 'mousemove';
    activeEndEvent    = isTouch ? 'touchend'  : 'mouseup';
    activeMoveHandler = isTouch ? handleTouchDragging : handleDragging;
    activeEndHandler  = isTouch ? stopTouchDragging   : stopDragging;

    window.addEventListener(activeMoveEvent, activeMoveHandler, { passive: false });
    window.addEventListener(activeEndEvent,  activeEndHandler);
};

function handleDragging(event) {
    if (!isDragging.value) return;
    updateDragging(event.clientX);
}

function handleTouchDragging(event) {
    if (!isDragging.value) return;
    if (!zoomWrapper.value) return;

    const target = event.target;

    if (!(target instanceof Element)) return;
    if (!zoomWrapper.value.contains(target)) return;
    if (target.classList && target.classList.contains('range-handle')) return;

    event.preventDefault();

    const touch0 = event.targetTouches && event.targetTouches[0] ? event.targetTouches[0] : null;
    if (!touch0) return;
    updateDragging(touch0.clientX);
}

function updateDragging(currentX) {
    if (!isDragging.value) return;
    const i0 = clientXToIndex(dragStartX.value);
    const i1 = clientXToIndex(currentX);
    const deltaIdx = i1 - i0;
    const span = Math.max(1, dragStartEnd.value - dragStartStart.value);
    let newStart = Math.round(dragStartStart.value + deltaIdx);
    const minStart = props.min;
    const maxStart = props.max - span;
    if (newStart < minStart) newStart = minStart;
    if (newStart > maxStart) newStart = maxStart;
    const newEnd = newStart + span;
    setStartValue(newStart);
    setEndValue(newEnd);
}

function stopDragging() {
    endDragging();
}

function stopTouchDragging() {
    endDragging();
}

function endDragging() {
    isDragging.value = false;

    if (activeMoveEvent && activeMoveHandler) {
        window.removeEventListener(activeMoveEvent, activeMoveHandler);
    }
    if (activeEndEvent && activeEndHandler) {
        window.removeEventListener(activeEndEvent, activeEndHandler);
    }

    activeMoveEvent = activeEndEvent = null;
    activeMoveHandler = activeEndHandler = null;
}

const isMouseDown = ref(false);
const tooltipLeft = ref(null);
const tooltipRight = ref(null);
const tooltipLeftWidth = ref(1);
const tooltipRightWidth = ref(1);
const showTooltip = ref(false);

function setTooltipLeft() {
    if (tooltipLeft.value) {
        tooltipLeftWidth.value = tooltipLeft.value.getBoundingClientRect().width;
    }
}

function setTooltipRight() {
    if (tooltipRight.value) {
        tooltipRightWidth.value = tooltipRight.value.getBoundingClientRect().width;
    }
}

const leftLabelZIndex = ref(0);

function setLeftLabelZIndex(handle) {
    leftLabelZIndex.value = handle === 'start' ? 1 : 0;
}

const tooltipsCollide = ref(false);
const mergeTooltip = ref({
    width: 0,
    left: 0
});

watch([startValue, endValue], async () => {
    await nextTick();

    if (!tooltipLeft.value || !tooltipRight.value) {
        tooltipsCollide.value = false;
        mergeTooltip.value = { width: 0, left: 0 };
        return;
    }

    const leftRect = tooltipLeft.value.getBoundingClientRect();
    const rightRect = tooltipRight.value.getBoundingClientRect();

    tooltipsCollide.value = leftRect.x + leftRect.width > rightRect.x;

    const leftCenter = leftRect.x + leftRect.width / 2;
    const rightCenter = rightRect.x + rightRect.width / 2;
    const totalWidth = leftRect.width + rightRect.width;
    const centerX = (leftCenter + rightCenter) / 2;

    mergeTooltip.value = {
        width: totalWidth,
        left: centerX - totalWidth / 2
    };
});

onUpdated(() => {
    setTooltipLeft();
    setTooltipRight();
});

watch(
    () => props.labelLeft,
    () => {
        nextTick(setTooltipLeft);
    },
    { deep: true }
);

watch(
    () => props.labelRight,
    () => {
        nextTick(setTooltipRight);
    },
    { deep: true }
);

defineExpose({
    setStartValue,
    setEndValue
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();

    if (activeMoveEvent && activeMoveHandler) {
        window.removeEventListener(activeMoveEvent, activeMoveHandler);
    }
    if (activeEndEvent && activeEndHandler) {
        window.removeEventListener(activeEndEvent, activeEndHandler);
    }
    activeMoveEvent = activeEndEvent = null;
    activeMoveHandler = activeEndHandler = null;
});

const absLen = computed(() => Math.max(1, props.max - props.min));

function absToMiniStart(i) {
    const v = Math.floor(i - props.min);
    return Math.min(Math.max(0, v), absLen.value);
}
function absToMiniEnd(i) {
    const v = Math.ceil((i - props.min));
    return Math.min(Math.max(0, v), absLen.value);
}

const startMini = computed(() => absToMiniStart(startValue.value));
const endMini   = computed(() => absToMiniEnd(endValue.value));

const selectionIndicator = computed(() => {
    if (!availableTraps.value.length) return null
    if (selectedTrap.value >= startMini.value && selectedTrap.value < endMini.value) {
        const i = selectedTrap.value;
        return {
            x1: unitWidthX.value * i + (props.minimapCompact ? 0: unitWidthX.value / 2),
            x2: unitWidthX.value * i + (props.minimapCompact ? 0: unitWidthX.value / 2),
            y1: 0,
            y2: Math.max(svgMinimap.value.height, 0),
            stroke: props.minimapIndicatorColor,
            ['stroke-linecap']: 'round',
            ['stroke-dasharray']: 2,
            ['stroke-width']: 1,
        }
    } else {
        return null
    }
})

</script>

<template>
    <div 
        data-cy="slicer" 
        data-dom-to-png-ignore
        style="padding: 0 24px" 
        class="vue-data-ui-zoom"
        ref="zoomWrapper"
        @mousedown="startDragging"
        @touchstart="startDragging"
        @touchend="showTooltip = false"
    >
        <div 
            class="vue-data-ui-slicer-labels" 
            style="position: relative; z-index: 1; pointer-events: none;"
        >
            <div 
                v-if="valueStart !== refreshStartPoint || valueEnd !== endpoint" 
                style="width: 100%; position: relative"
            >
                <button 
                    v-if="!useResetSlot" 
                    data-cy="slicer-reset" 
                    tabindex="0" 
                    role="button" 
                    class="vue-data-ui-refresh-button"
                    :style="{
                        top: hasMinimap ? '36px' : '-16px',
                        pointerEvents: 'all !important'
                    }"
                    @click="reset"
                >
                    <BaseIcon name="refresh" :stroke="textColor" />
                </button>
                <slot v-else name="reset-action" :reset="reset" />
            </div>
        </div>

        <div 
            class="double-range-slider" 
            ref="minimapWrapper" 
            style="z-index: 0" 
            @mouseenter="showTooltip = true" 
            @mouseleave="showTooltip = false"
        >
            <template v-if="hasMinimap">
                <div 
                    class="minimap"  
                    style="width: 100%" data-cy="minimap"
                >
                <svg
                    :key="`mm-${minimapMerged ? 'merged' : 'split'}-${minimapCompact ? 'compact' : 'normal'}`"
                    data-cy="slicer-minimap-svg"
                    :xmlns="XMLNS"
                    :viewBox="`0 0 ${Math.max(0, svgMinimap.width)} ${Math.max(0, svgMinimap.height)}`"
                >
                        <defs>
                            <linearGradient :id="uid" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" :stop-color="`${minimapLineColor}50`"/>
                                <stop offset="100%" stop-color="transparent"/>
                            </linearGradient>
                        </defs>

                        <rect 
                            class="vue-ui-zoom-minimap-frame"
                            v-if="minimapCompact"
                            :x="0"
                            :y="0"
                            :width="svgMinimap.width"
                            :height="svgMinimap.height"
                            fill="none"
                            :stroke="minimapFrameColor"
                            :rx="3"
                        />
                        
                        <path
                            v-if="minimapMerged"
                            :d="`M${minimapLine.fullSet}`" 
                            :stroke="`${minimapLineColor}`" 
                            fill="none"
                            stroke-width="1" 
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            style="opacity: 0.6"
                        />

                        <template v-else>
                            <g v-for="(dp, i) in allMinimapLines.filter(d => d.type === 'bar')">
                                <template v-for="(r, j) in dp.points">
                                    <rect 
                                        v-if="dp.isVisible && !isNaN(r.y)"
                                        :x="getBarX(r.x, i, j)"
                                        :width="getBarWidth(i, j)"
                                        :y="r.v >= 0 ? r.y : r.y0"
                                        :height="r.v >= 0 ? (r.y0 - r.y) : (r.y - r.y0)"
                                        :fill="dp.color"
                                        style="opacity: 0.6"
                                    />
                                </template>
                            </g>
                            <g v-for="dp in allMinimapLines.filter(d => d.type === 'line')" :key="String(dp.key)">
                                <path 
                                    v-if="dp.isVisible"
                                    :d="`M ${dp.fullSet}`" 
                                    fill="none"
                                    :stroke="dp.color"
                                    style="opacity: 0.6"
                                />

                                <circle
                                    v-for="m in dp.fullMarkers"
                                    v-if="dp.isVisible"
                                    :key="`sel-dot-under-${dp.key}-${m.i}`"
                                    :cx="m.x"
                                    :cy="m.y"
                                    r="2"
                                    :fill="dp.color"
                                    :stroke="borderColor"
                                    stroke-width="0.5"
                                    style="opacity: 0.6"
                                />
                            </g>
                        </template>
                        
                        <!-- SELECTION RECT -->
                        <rect
                            data-cy="slicer-minimap-selection-rect"
                            :x="selectionRectCoordinates.x"
                            :width="selectionRectCoordinates.width < 0 ? 0 : selectionRectCoordinates.width"
                            :height="Math.max(svgMinimap.height, 0)"
                            :y="0"
                            :fill="borderColor"
                            :rx="minimapSelectionRadius"
                            stroke="none"
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

                        <!-- SELECTION INDICATOR -->
                        <template v-if="selectedTrap !== null && !isMouseDown">
                            <line v-bind="selectionIndicator"/>
                        </template>

                        <line
                            class="slicer-minimap-zero-line"
                            v-if="!minimapMerged && scaleMin < 0"
                            :x1="0"
                            :x2="svgMinimap.width"
                            :y1="minimapZero"
                            :y2="minimapZero"
                            :stroke="minimapFrameColor"
                            stroke-width="0.5"
                        />

                        <!-- MERGED MINIMAP -->
                        <template v-if="minimapMerged">
                            <template v-if="minimapLine && minimapLine.sliced && minimapLine.sliced.length">
                                <path
                                    v-if="minimapLine.selectionSet"
                                    :d="`M${minimapLine.sliced[0].x},${Math.max(svgMinimap.height, 0)} ${minimapLine.selectionSet} L${minimapLine.sliced[minimapLine.sliced.length - 1].x},${Math.max(svgMinimap.height, 0)}Z`"
                                    :fill="`url(#${uid})`"
                                    stroke="none"
                                    style="opacity: 1"
                                />
                                <path
                                    v-if="minimapLine.selectionSet"
                                    :d="`M ${minimapLine.selectionSet}`"
                                    :stroke="`${minimapLineColor}`"
                                    fill="transparent"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </template>
                        </template>

                        <!-- SPLIT TREE (circles) -->
                        <g v-else>
                            <g v-for="(dp, i) in allMinimapLines.filter(d => d.type === 'bar')">
                                <template v-for="(r, j) in dp.points">
                                    <rect 
                                        v-if="dp.isVisible && !isNaN(r.y)"
                                        :x="getBarX(r.x, i, j)"
                                        :width="getBarWidth(i, j)"
                                        :y="r.v >= 0 ? r.y : r.y0"
                                        :height="r.v >= 0 ? (r.y0 - r.y) : (r.y - r.y0)"
                                        :fill="dp.color"
                                        :style="{
                                            opacity: j >= valueStart && j <= valueEnd- 1 ? 1 : 0
                                        }"
                                    />
                                </template>
                            </g>
                            <g v-for="dp in allMinimapLines.filter(d => d.type === 'line')" :key="String(dp.key)">
                                <path
                                    v-if="dp && dp.hasSelection && dp.selectionSet && dp.isVisible"
                                    :d="`M ${dp.selectionSet}`"
                                    :stroke="dp.color"
                                    fill="transparent"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </g>
                        </g>

                        <!-- COMPACT HANDLES (minimap mode only) -->
                        <rect
                            class="vue-ui-zoom-compact-minimap-handle"
                            v-if="hasMinimap && minimapCompact"
                            :x="selectionRectCoordinates.x - 8"
                            :y="0"
                            :width="8"
                            :height="svgMinimap.height"
                            :fill="borderColor"
                            :stroke="textColor"
                            :rx="3"
                        />

                        <rect
                            class="vue-ui-zoom-compact-minimap-handle"
                            v-if="hasMinimap && minimapCompact"
                            :x="selectionRectCoordinates.x + selectionRectCoordinates.width"
                            :y="0"
                            :width="8"
                            :height="svgMinimap.height"
                            :fill="borderColor"
                            :stroke="textColor"
                            :rx="3"
                        />


                        <!-- MERGED (circles) -->
                        <template v-if="minimapMerged">
                            <circle
                                v-if="minimapLine && minimapLine.firstPlot && minimapLine.firstPlot.value !== null"
                                :cx="minimapLine.firstPlot.x"
                                :cy="minimapLine.firstPlot.y"
                                stroke-width="0.5"
                                :stroke="borderColor"
                                r="4"
                                :fill="minimapLineColor"
                            />
                            <circle
                                v-if="minimapLine && minimapLine.firstPlot && minimapLine.firstPlot.value !== null"
                                :cx="minimapLine.firstPlot.x"
                                :cy="minimapLine.firstPlot.y"
                                r="2"
                                :fill="borderColor"
                            />
                            <circle
                                v-if="minimapLine && minimapLine.lastPlot && minimapLine.lastPlot.value !== null"
                                :cx="minimapLine.lastPlot.x"
                                :cy="minimapLine.lastPlot.y"
                                stroke-width="0.5"
                                :stroke="borderColor"
                                r="4"
                                :fill="minimapLineColor"
                            />
                            <circle
                                v-if="minimapLine && minimapLine.lastPlot && minimapLine.lastPlot.value !== null"
                                :cx="minimapLine.lastPlot.x"
                                :cy="minimapLine.lastPlot.y"
                                r="2"
                                :fill="borderColor"
                            />
                        </template>
                        <!-- SPLIT TREE (circles) -->
                        <g v-else>
                            <g v-for="dp in allMinimapLines.filter(d => d.type === 'line')" :key="String(dp.key)">
                                <circle
                                    v-for="m in dp.selectionMarkers"
                                    v-if="dp.isVisible"
                                    :key="`sel-dot-${dp.key}-${m.i}`"
                                    :cx="m.x"
                                    :cy="m.y"
                                    r="2.5"
                                    :fill="dp.color"
                                    :stroke="borderColor"
                                    stroke-width="0.5"
                                />

                                <circle
                                    v-if="dp && dp.firstPlot && dp.isVisible && dp.firstPlot.value !== null"
                                    :cx="dp.firstPlot.x"
                                    :cy="dp.firstPlot.y"
                                    stroke-width="0.5"
                                    :stroke="borderColor"
                                    r="4"
                                    :fill="dp.color"
                                />

                                <circle
                                    v-if="dp && dp.firstPlot && dp.isVisible && dp.firstPlot.value !== null"
                                    :cx="dp.firstPlot.x"
                                    :cy="dp.firstPlot.y"
                                    r="2"
                                    :fill="borderColor"
                                />
                                <circle
                                    v-if="dp && dp.lastPlot && dp.isVisible && dp.lastPlot.value !== null"
                                    :cx="dp.lastPlot.x"
                                    :cy="dp.lastPlot.y"
                                    stroke-width="0.5"
                                    :stroke="borderColor"
                                    r="4"
                                    :fill="dp.color"
                                />
                                <circle
                                    v-if="dp && dp.lastPlot && dp.isVisible && dp.lastPlot.value !== null"
                                    :cx="dp.lastPlot.x"
                                    :cy="dp.lastPlot.y"
                                    r="2"
                                    :fill="borderColor"
                                />
                            </g>
                        </g>

                        <!-- TOOLTIP TRAPS -->
                        <rect 
                            v-for="(trap, i) in availableTraps"
                            :key="`trap-${i}`"
                            data-cy="slicer-trap"
                            :y="0"
                            :height="Math.max(svgMinimap.height, 0)"
                            fill="transparent"
                            style="pointer-events: all !important;"
                            :x="unitWidthX * i - (minimapCompact ? unitWidthX / 2 : 0)"
                            :width="unitWidthX < 0 ? 0 : unitWidthX"
                            :style="{
                                cursor: trap >= startMini && trap < endMini && enableSelectionDrag
                                ? isMouseDown ? 'grabbing' : 'grab'
                                : 'default'
                            }"
                            @mousedown="isMouseDown = true"
                            @mouseup="isMouseDown = false"
                            @mouseenter="trapMouse(trap)"
                            @mouseleave="selectedTrap = null; emit('trapMouse', null)"
                        />
                    </svg>
                </div>
            </template>

            <div 
                class="slider-track"
                :style="{ visibility: hasMinimap && minimapCompact ? 'hidden' : 'visible' }"
            />

            <div 
                data-cy="slicer-range-highlight"
                :class="{
                    'range-highlight': true,
                    'move': enableSelectionDrag
                }" 
                @mousedown="isMouseDown = true"
                @mouseup="isMouseDown = false"
                :style="{
                    ...highlightStyle,
                    cursor: isMouseDown ? 'grabbing' : 'grab',
                    visibility: hasMinimap && minimapCompact ? 'hidden' : 'visible'
                }"
            />
            
            <input
                v-if="enableRangeHandles"
                data-cy="slicer-handle-left"
                ref="rangeStart"
                type="range"
                :class="{
                    'range-left': true,
                    'range-handle': true,
                    'range-minimap': hasMinimap && verticalHandles,
                    'range-invisible': hasMinimap && minimapCompact
                }"
                :min="min"
                :max="useMini && minimapCompact ? gridLenMinus1 : max"
                :step="1"
                v-model.number="startForInput"
                @mouseenter="setLeftLabelZIndex('start')"
            />

            <input
                v-if="enableRangeHandles"
                data-cy="slicer-handle-right"
                ref="rangeEnd"
                type="range"
                :class="{
                    'range-right': true,
                    'range-handle': true,
                    'range-minimap': hasMinimap && verticalHandles,
                    'range-invisible': hasMinimap && minimapCompact
                }"
                :min="min"
                :max="useMini && minimapCompact ? gridLenMinus1 : max"
                :step="1"
                v-model.number="endForInput"
                @mouseenter="setLeftLabelZIndex('end')"
                />

            <div
                v-if="labelLeft"
                data-cy="slicer-label-left"
                ref="tooltipLeft"
                :class="{
                    'range-tooltip': true,
                    'range-tooltip-visible': showTooltip,
                    'range-tooltip-arrow': highlightStyle.arrowLeft && !verticalHandles,
                    'range-tooltip-arrow-left': !highlightStyle.arrowLeft && !verticalHandles
                }"
                :style="{
                    left: highlightStyle.tooltipLeft,
                    color: adaptColorToBackground(selectColor),
                    backgroundColor: selectColor,
                    border: `1px solid ${borderColor}`,
                    zIndex: `${leftLabelZIndex + 4}`,
                    visibility: tooltipsCollide || labelLeft === labelRight ? 'hidden' : 'visible',
                    top: hasMinimap && minimapCompact ? 'calc(-100% - 18px)' : '-100%'
                }"
            >
                {{ labelLeft }}
            </div>

            <div
                v-if="(tooltipsCollide || labelLeft === labelRight) && (labelLeft || labelRight)"
                data-cy="slicer-label-merged"
                ref="tooltipMerge"
                :class="{
                    'range-tooltip': true,
                    'range-tooltip-visible': showTooltip,
                    'range-tooltip-arrow': true,
                    'range-tooltip-arrow-left': !highlightStyle.arrowLeft && !verticalHandles,
                    'range-tooltip-arrow-right': !highlightStyle.arrowRight && !verticalHandles
                }"
                :style="{
                    left: highlightStyle.tooltipCenter,
                    width: mergeTooltip.width + 'px',
                    color: adaptColorToBackground(selectColor),
                    backgroundColor: selectColor,
                    border: `1px solid ${borderColor}`,
                    zIndex: '4',
                    top: hasMinimap && minimapCompact ? 'calc(-100% - 18px)' : '-100%'
                }"
            >
                {{ labelLeft === labelRight ? labelLeft : `${labelLeft} - ${labelRight}` }}
            </div>
            
            <div
                v-if="labelRight"
                data-cy="slicer-label-right"
                ref="tooltipRight"
                :class="{
                    'range-tooltip': true,
                    'range-tooltip-visible': showTooltip,
                    'range-tooltip-arrow': highlightStyle.arrowRight && !verticalHandles,
                    'range-tooltip-arrow-right': !highlightStyle.arrowRight && !verticalHandles
                }"
                :style="{
                    left: highlightStyle.tooltipRight,
                    color: adaptColorToBackground(selectColor),
                    backgroundColor: selectColor,
                    border: `1px solid ${borderColor}`,
                    zIndex: '4',
                    visibility: tooltipsCollide || labelLeft === labelRight ? 'hidden' : 'visible',
                    top: hasMinimap && minimapCompact ? 'calc(-100% - 18px)' : '-100%'
                }"
            >
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
    top: calc(-50% - 12px);
    svg{
        position: absolute;
        overflow: visible;
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
    top:6px;
    height: 8px;
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
    transition: transform 0.2s ease-in-out !important;
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

.range-tooltip {
    padding: 2px 4px;
    font-size: 10px;
    border-radius: 3px;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
    text-align:center;
    pointer-events: none;
    position: absolute;
    width: fit-content;
    white-space:nowrap;
}

.range-tooltip-arrow,
.range-tooltip-arrow-left,
.range-tooltip-arrow-right {
    &::after {
        content: '';
        position: absolute;
        top: 100%;
        border-width: 4px;
        border-style: solid;
        border-color: v-bind(selectColor) transparent transparent transparent;
    }
}

.range-tooltip-arrow {
    &::after {
        left: 50%;
        transform: translateX(-50%);
    }
}

.range-tooltip-arrow-left {
    &::after {
        left: 3px;
        right: auto;
        transform: none;
    }
}

.range-tooltip-arrow-right {
    &::after {
        right: 3px;
        left: auto;
        transform: none;
    }
}

.range-tooltip-visible {
    opacity: 1;
    transition: opacity 0.3s ease-in-out;
}

/** Compact (minimap only) */

input[type="range"].range-invisible {
    position: absolute;
    z-index: 3;
    top: 0px;
    height: 8px;
    margin: 0;
    padding: 0;
}

input[type="range"].range-invisible.range-left {
    left: -12px;
}

input[type="range"].range-invisible.range-right {
    left: -6px;
}

input[type="range"].range-invisible::-webkit-slider-thumb {
    background-color: transparent;
    border-radius: 50%;
    cursor: ew-resize;
    position: relative;
    z-index: 2;
    outline: 2px transparent;
    transition: all 0.2s ease-in-out;

    &:active,
    &:hover {
        box-shadow: none;
        background-color: transparent;
    }
}

input[type="range"].range-invisible::-webkit-slider-thumb {
    width: 12px;
    height: 50px;
    border-radius: 0px;
    margin-top: -36px;
    border-right: 1px solid transparent;
    border-left: 1px solid transparent;
    cursor: ew-resize;
}

input[type="range"].range-invisible::-moz-range-thumb {
    background-color: transparent;
    z-index: 2;
    outline: none;

    &:active,
    &:hover {
        box-shadow: 0 0 0 10px transparent;
        background-color: transparent;
    }
}

input[type="range"].range-invisible::-moz-range-thumb {
    width: 12px;
    height: 50px;
    border-radius: 0px;
    border: none;
    cursor: ew-resize;
    transform: translateY(-20px);
    pointer-events: auto;
}

input[type="range"].range-invisible::-ms-thumb {
    pointer-events: auto;
    width: 20px;
    height: 20px;
    background-color: transparent;
    border-radius: 50%;
    cursor: ew-resize;
    position: relative;
    z-index: 2;
    outline: 2px solid transparent;
    transition: all 0.2s ease-in-out;

    &:active,
    &:hover {
        box-shadow: 0 0 0 10px transparent;
        background-color: transparent;
    }
}

.vue-ui-zoom-compact-minimap-handle {
    opacity: 1;
    pointer-events: none;
    transition: opacity 0.15s ease-in-out;
}
</style>
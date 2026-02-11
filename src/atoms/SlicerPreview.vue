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
    isFunction,
    triggerEvent,
    XMLNS,
} from '../lib';
import { debounce, throttle } from '../canvas-lib';
import { useResponsive } from '../useResponsive';
import BaseIcon from './BaseIcon.vue';

const props = defineProps({
    immediate: {
        type: Boolean,
        default: true
    },
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
        default: false
    },
    timeLabels: {
        type: Array
    },
    isPreview: {
        type: Boolean,
        default: false
    },
    preciseLabels: {
        type: Array,
        default() {
            return []
        }
    },
    usePreciseLabels: {
        type: Boolean,
        default: false
    },
    selectedSeries: {
        type: Object,
    },
    customFormat: {
        type: [Function, null]
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
    },
    minScale: {
        type: Number,
        default: null,
    },
    maxScale: {
        type: Number,
        default: null,
    },
    // Used to center zero line in VueUiStackBar (non distributed mode)
    forceZeroCenter: {
        type: Boolean,
        default: false,
    },
    maxWidth: {
        type: Number,
        default: null
    },
    isCursorPointer: {
        type: Boolean,
        default: false
    },
    additionalMinimapHeight: {
        type: Number,
        default: 0
    }
});

const zoomWrapper = ref(null);
const startValue = ref(props.min);
const endValue = ref(props.max);
const hasMinimap = computed(() => !!props.allMinimaps.length);
const uid = ref(createUid());
const isRanging = ref(false);
const useMini = computed(() => hasMinimap.value && props.minimapCompact);

const wrapperWidth = ref(0);

const emitFutureStart = throttle((v) => emit('futureStart', v), 0);
const emitFutureEnd = throttle((v) => emit('futureEnd', v), 0);

const start = computed({
    get: () => startValue.value,
    set(raw) {
        const v = Math.min(raw, endValue.value - 1);
        if (v === startValue.value) return;
        startValue.value = v;
        if (rangeStart.value) rangeStart.value.value = String(v);

        if (props.immediate) {
            emit('update:start', Number(v));
        } else if (isRanging.value) {
            emitFutureStart(v);
        }
    }
});

const end = computed({
    get: () => endValue.value,
    set(raw) {
        const v = Math.max(raw, startValue.value + 1);
        if (v === endValue.value) return;
        endValue.value = v;
        if (rangeEnd.value) rangeEnd.value.value = String(v);

        if (props.immediate) {
            emit('update:end', Number(v));
        } else if (isRanging.value) emitFutureEnd(v);
    }
});

let _commitTimeout = null;

function commitImmediately() {
    clearTimeout(_commitTimeout);
    if (!props.immediate) {
        emit('update:start', Number(startValue.value));
        emit('update:end', Number(endValue.value));
    }
    isRanging.value = false;
}

const endpoint = computed(() => {
    return props.refreshEndPoint === null ? props.max : props.refreshEndPoint;
});

const emit = defineEmits(['futureStart', 'futureEnd', 'update:start', 'update:end', 'reset', 'trapMouse']);

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
    const range = Math.max(1, props.max - props.min);
    const w = zoomWrapper.value.getBoundingClientRect().width;
    const x = w * ((startValue.value - props.min) / range);
    return x - tooltipLeftWidth.value / 2 < 0;
});

const overflowsRight = computed(() => {
    if (!zoomWrapper.value) return false;
    const range = Math.max(1, props.max - props.min);
    const w = zoomWrapper.value.getBoundingClientRect().width;
    const x = w * ((endValue.value - props.min) / range);
    return x + tooltipRightWidth.value / 2 > w;
});

const highlightStyle = computed(() => {
    const centerAdjust = overflowsRight.value
        ? `calc(${centerPercent.value}% - ${mergeTooltip.value.width}px)`
        : overflowsLeft.value
        ? `calc(${centerPercent.value}% - 8px)`
        : `calc(${centerPercent.value}% - ${mergeTooltip.value.width / 2}px)`;

    return {
        left: `${startPercent.value}%`,
        width: `${Math.max(0, endPercent.value - startPercent.value)}%`,
        background: props.selectColor,
        tooltipLeft: `calc(${startPercent.value}% - ${overflowsLeft.value ? 9 : tooltipLeftWidth.value / 2}px)`,
        tooltipRight: `calc(${endPercent.value}% - ${overflowsRight.value ? tooltipRightWidth.value - 9 : tooltipRightWidth.value / 2}px)`,
        tooltipCenter: centerAdjust,
        arrowLeft: !overflowsLeft.value,
        arrowRight: !overflowsRight.value
    };
});

const slicerColor = computed(() => props.inputColor);
const backgroundColor = computed(() => props.background);
const selectColorOpaque = computed(() => `${props.selectColor}33`);
const borderColor = computed(() => props.borderColor);

const availableTraps = computed(() => {
    let arr = [];
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
            if (!minimapWrapper.value) return;
            const { width, height } = useResponsive({ chart: minimapWrapper.value });
            
            const W = Math.max(0, Math.round(width));
            const H = Math.max(0, Math.round(height - 47));

            if (W !== svgMinimap.value.width || H !== svgMinimap.value.height) {
                svgMinimap.value.width  = W;
                svgMinimap.value.height = H + props.additionalMinimapHeight;
            }
        }, 0);

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(minimapWrapper.value);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const absLen = computed(() => Math.max(1, props.max - props.min));

function absToMiniStart(i) {
    const v = Math.floor((i - props.min));
    return Math.min(Math.max(0, v), absLen.value);
}

function absToMiniEnd(i) {
    const v = Math.ceil((i - props.min));
    return Math.min(Math.max(0, v), absLen.value);
}

const startMini = computed(() => absToMiniStart(startValue.value));
const endMini = computed(() => absToMiniEnd(endValue.value));

const maxSeries = computed(() => {
    return Math.max(...props.allMinimaps.map(d => d.series.length));
});
const compactThumbWidth = computed(() => {
    return hasMinimap.value && props.minimapCompact ? 40 : 0;
});

const thumbInset = computed(() => compactThumbWidth.value / 2);

const innerMinimapWidth = computed(() => {
    return Math.max(1, svgMinimap.value.width - thumbInset.value * 2);
});

const unitWidthX = computed(() => {
    const denom = Math.max(1, maxSeries.value - (props.minimapCompact ? 1 : 0));
    return svgMinimap.value.width / denom;
});

const barTypeQty = computed(() => {
    if (!props.allMinimaps.length) return 0;
    return props.allMinimaps
        .filter(ds => ds.type === 'bar' && ds.isVisible).length
});

const barWidth = computed(() => {
    return unitWidthX.value / (barTypeQty.value || 1) * 0.8
});

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

const parsedMinScale = computed(() => {
    if (props.minScale == null && props.forceZeroCenter) return null;
    const n = Number(props.minScale);
    return Number.isFinite(n) ? n : null;
});

const parsedMaxScale = computed(() => {
    if (props.maxScale == null && props.forceZeroCenter) return null;
    const n = Number(props.maxScale);
    return Number.isFinite(n) ? n : null;
});

const hasFixedScale = computed(() => {
    return parsedMinScale.value !== null && parsedMaxScale.value !== null;
});

const effectiveRange = computed(() => {
    const { min: computedMin, max: computedMax } = globalRange.value;

    const minOverride = parsedMinScale.value;
    const maxOverride = parsedMaxScale.value;

    let min;
    let max;

    if (minOverride !== null && maxOverride !== null) {
        min = Math.min(minOverride, computedMin);
        max = Math.max(maxOverride, computedMax);
    } else {
        min = minOverride !== null ? minOverride : computedMin;
        max = maxOverride !== null ? maxOverride : computedMax;
    }

    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 1;

    if (min === max) max = min + 1;
    else if (min > max) [min, max] = [max, min];

    return { min, max };
});

const allMin = computed(() => effectiveRange.value.min);
const allMax = computed(() => effectiveRange.value.max);

const scaleMin = computed(() => {
    if (allMin.value < 0 && allMax.value > 0) return allMin.value;
    if (allMax.value <= 0) return allMin.value;
    return 0;
});

const mapY = (val) => {
    const H = Math.max(1, svgMinimap.value.height);
    const mapper = makeSmartMapY(
        allMin.value,
        allMax.value,
        H,
        hasFixedScale.value
    );

    return mapper(val);
};

const minimapZero = computed(() => mapY(0));

function makeSmartMapY(min, max, H, lockToRange = false) {
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const EPS = 1e-9;

    const span = Math.max(EPS, max - min);

    // Strictly map to min & max
    if (lockToRange) {
        return (val) => {
            const t = (val - min) / span;
            return H - t * H;
        };
    }

    // Anchored to 0 or symmetric
    if (max <= 0) {
        const smartSpan = Math.max(EPS, 0 - min);
        return (val) => H - ((val - min) / smartSpan) * H;
    } else if (min >= 0) {
        const smartSpan = Math.max(EPS, max - 0);
        return (val) => H - ((val - 0) / smartSpan) * H;
    } else {
        const M = Math.max(EPS, Math.max(Math.abs(min), Math.abs(max)));
        return (val) => {
            const r = clamp(val / M, -1, 1);
            return (1 - (r + 1) / 2) * H;
        };
    }
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
            dashed: false
        };
    }
    const H = Math.max(1, svgMinimap.value.height);

    const mapYSeries = makeSmartMapY(allMin.value, allMax.value, H, hasFixedScale.value);

    const len = ds.length;
    const s = Math.min(Math.max(0, startMini.value), Math.max(0, len - 1));
    const e = Math.min(len, Math.max(s + 1, endMini.value));

    const points = ds.map((dp, i) => {
        const val = dp;
        const valid = Number.isFinite(val);
        const x = unitWidthX.value * i + (props.minimapCompact ? 0 : unitWidthX.value / 2);
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

        // Bar baseline
        // . smart mode: keep baseline at 0
        // . fixed scale: baseline must be inside [allMin, allMax] => clamp 0 into the fixed range
        const baseValue = hasFixedScale.value ? clamp(0, allMin.value, allMax.value) : 0;
        const y0 = mapYSeries(baseValue);

        return {
            x,
            y: valid ? mapYSeries(val) : NaN,
            v: val,
            value: val == null ? null : valid ? val : null,
            y0,
            i,
        }
    })

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
    if (!props.minimap.length) return [];
    return makeMiniChart(props.minimap)
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
            type: ds.type || 'line',
            dashed: ds.dashed ?? false
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

const miniToAbs = (i) => Math.round(props.min + i);

const startForInput = computed({
    get() {
        return useMini.value ? startMini.value : Number(start.value);
    },
    set(v) {
        if (useMini.value) {
        const n = Math.round(+v || 0);
        setStartValue(miniToAbs(n));
        } else {
            let proposed = Math.round(+v || 0);
            const maxAllowed = Number(endValue.value) - 1;
            const clamped = Math.min(Math.max(props.min, proposed), maxAllowed);
            if (rangeStart.value) {
                rangeStart.value.valueAsNumber = clamped
            };
            setStartValue(clamped);
        }
    }
});

const endForInput = computed({
    get() {
        return useMini.value ? Math.max(startMini.value, endMini.value - 1) : Number(end.value);
    },
    set(v) {
        if (useMini.value) {
            const n = Math.round(+v || 0);
            setEndValue(miniToAbs(n + 1));
        } else {
            let proposed = Math.round(+v || 0);
            const minAllowed = Number(startValue.value) + 1;
            const clamped = Math.max(minAllowed, Math.min(proposed, props.max));
            if (rangeEnd.value) {
                rangeEnd.value.valueAsNumber = clamped;
            }
            setEndValue(clamped);
        }
    }
});


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

function coerceInput(eOrVal) {
    if (typeof eOrVal === 'object' && eOrVal && 'target' in eOrVal) {
        const t = eOrVal.target
        const n = 'valueAsNumber' in t ? t.valueAsNumber : +t.value;
        return Number.isFinite(n) ? n : NaN;
    }
    const n = +eOrVal;
    return Number.isFinite(n) ? n : NaN;
}

let rafStart = 0;
function setStartValue(eOrVal) {
    isRanging.value = true;
    const n = coerceInput(eOrVal);
    if (!Number.isFinite(n)) return;
    cancelAnimationFrame(rafStart);
    rafStart = requestAnimationFrame(() => {
        start.value = n;
    });
}

let rafEnd = 0;
function setEndValue(eOrVal) {
    isRanging.value = true;
    const n = coerceInput(eOrVal);
    if (!Number.isFinite(n)) return;
    cancelAnimationFrame(rafEnd);
    rafEnd = requestAnimationFrame(() => {
        end.value = n;
    });
}

onBeforeUnmount(() => {
    cancelAnimationFrame(rafStart);
    cancelAnimationFrame(rafEnd);
});

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
    isRanging.value = true;
    
    showTooltip.value = true;
    if (!props.enableSelectionDrag) return;

    const isTouch = event.type === 'touchstart';
    if (!isTouch) {
        event.stopPropagation();
    }

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

        start.value = focusStart;
        end.value = focusEnd;
        emitFutureStart(focusStart);
        emitFutureEnd(focusEnd);
        
        triggerEvent(zoomWrapper.value, 'mouseup');
        await nextTick();
        triggerEvent(zoomWrapper.value, 'mousedown', { clientX: x });
    }

    dragStartStart.value = startValue.value;
    dragStartEnd.value = endValue.value;
    ippAtStart.value = indicesPerPixel.value;

    activeMoveEvent = isTouch ? 'touchmove' : 'mousemove';
    activeEndEvent = isTouch ? 'touchend' : 'mouseup';
    activeMoveHandler = isTouch ? handleTouchDragging : handleDragging;
    activeEndHandler = isTouch ? stopTouchDragging : stopDragging;

    window.addEventListener(activeMoveEvent, activeMoveHandler, { passive: false });
    window.addEventListener(activeEndEvent, activeEndHandler);
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
    let newStart = Math.round(dragStartStart.value + deltaIdx);
    newStart = Math.max(props.min, Math.min(newStart, props.max - currentRange.value));
    const newEnd = newStart + currentRange.value;
    start.value = newStart;
    end.value = newEnd;
    emitFutureStart(newStart);
    emitFutureEnd(newEnd);
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

    commitImmediately();
}

const isMouseDown = ref(false);
const tooltipLeft = ref(null);
const tooltipRight = ref(null);
const tooltipLeftWidth = ref(1);
const tooltipRightWidth = ref(1);
const showTooltip = ref(false);

function setTooltipLeft() {
    if (tooltipLeft.value) {
        const w = Math.round(tooltipLeft.value.getBoundingClientRect().width);
        if (w !== tooltipLeftWidth.value) tooltipLeftWidth.value = w;
    }
}
function setTooltipRight() {
    if (tooltipRight.value) {
        const w = Math.round(tooltipRight.value.getBoundingClientRect().width);
        if (w !== tooltipRightWidth.value) tooltipRightWidth.value = w;
    }
}

onUpdated(() => {
    setTooltipLeft();
    setTooltipRight();
});

const leftLabelZIndex = ref(0);

function setLeftLabelZIndex(handle) {
    leftLabelZIndex.value = handle === 'start' ? 1 : 0;
}

const tooltipsCollide = ref(false);
const mergeTooltip = ref({
    width: 0,
    left: 0,
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
    tooltipsCollide.value = (leftRect.x + leftRect.width) > rightRect.x;
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

watch(() => props.labelLeft, () => {
    nextTick(setTooltipLeft);
}, { deep: true });

watch(() => props.labelRight, () => {
    nextTick(setTooltipRight);
}, { deep: true });

const labels = computed(() => {
    let leftText = '';
    let rightText = '';

    let useCustomFormat = false;

    if (isFunction(props.customFormat)) {
        try {
        const customLeft = props.customFormat({
            absoluteIndex: startValue.value,
            seriesIndex: startValue.value,
            datapoint: props.selectedSeries,
            timeLabel: props.preciseLabels[startValue.value],
            side: 'left'
        });
        
        const customRight = props.customFormat({
            absoluteIndex: endValue.value - 1,
            seriesIndex: -1,
            datapoint: props.selectedSeries,
            timeLabel: props.preciseLabels[endValue.value - 1],
            side: 'right'
        });

        if (typeof customLeft === 'string' && typeof customRight === 'string') {
            leftText = customLeft;
            rightText = customRight;
            useCustomFormat = true;
        }

        } catch (_) {
            useCustomFormat = false;
        }
    }

    if (!useCustomFormat) {
        const left = props.usePreciseLabels
        ? props.preciseLabels.find(t => t.absoluteIndex === startValue.value)
        : props.timeLabels.find(t => t.absoluteIndex === startValue.value);

        const right = props.usePreciseLabels
        ? props.preciseLabels.find(t => t.absoluteIndex === endValue.value - 1)
        : props.timeLabels.find(t => t.absoluteIndex === endValue.value - 1);

        leftText = left ? left.text : '';
        rightText = right ? right.text : '';
    }

    return { left: leftText, right: rightText };
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

    clearTimeout(_commitTimeout);
});

const selectionIndicator = computed(() => {
    if (!availableTraps.value.length) return null;

    if (selectedTrap.value >= startMini.value && selectedTrap.value < endMini.value) {
        const i = selectedTrap.value;
        const x = unitWidthX.value * i + (props.minimapCompact ? 0 : unitWidthX.value / 2);

        return {
            x1: x,
            x2: x,
            y1: 0,
            y2: Math.max(svgMinimap.value.height, 0),
            stroke: props.minimapIndicatorColor,
            ['stroke-linecap']: 'round',
            ['stroke-dasharray']: 2,
            ['stroke-width']: 1,
        };
    }

    return null;
});

defineExpose({
    setStartValue,
    setEndValue
});
</script>

<template>
    <div 
        data-cy="slicer" 
        :data-minimap="hasMinimap"
        data-dom-to-png-ignore 
        style="padding: 0 48px;" 
        class="vue-data-ui-zoom" 
        ref="zoomWrapper"
        @mousedown="startDragging" 
        @touchstart="startDragging"
        :style="{
            maxWidth: maxWidth ? maxWidth + 'px' : undefined,
            margin: maxWidth ? '0 auto' : undefined
        }"
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
                        pointerEvents: 'all !important',
                        cursor: isCursorPointer ? 'pointer' : 'default'
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
            style="z-index: 0" @mouseenter="showTooltip = true"
            @mouseleave="showTooltip = false"
            :style="hasMinimap ? {
                '--minimap-unit-px': unitWidthX + 'px',
                '--minimap-offset-px': (minimapCompact ? 0 : (unitWidthX / 2)) + 'px'
            } : undefined"
        >
            <template v-if="hasMinimap">
                <div class="minimap" style="width: 100%" data-cy="minimap">
                    <svg
                        :key="`mm-${minimapMerged ? 'merged' : 'split'}-${minimapCompact ? 'compact' : 'normal'}`"
                        data-cy="slicer-minimap-svg"
                        :xmlns="XMLNS"
                        :viewBox="`0 0 ${Math.max(0, svgMinimap.width)} ${Math.max(0, svgMinimap.height)}`"
                    >
                        <defs>
                            <linearGradient :id="uid" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" :stop-color="`${minimapLineColor}50`" />
                                <stop offset="100%" stop-color="transparent" />
                            </linearGradient>
                        </defs>

                        <rect
                            v-if="minimapCompact"
                            class="vue-ui-zoom-minimap-frame"
                            :x="0"
                            :y="0"
                            :width="svgMinimap.width"
                            :height="svgMinimap.height"
                            fill="none"
                            :stroke="minimapFrameColor"
                            :rx="3"
                        />

                        <template v-if="!$slots.slotMap">
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
    
                            <path
                                v-if="minimapMerged && !minimapCompact"
                                :d="`M${unitWidthX / 2},${Math.max(svgMinimap.height, 0)} ${minimapLine.fullSet} L${svgMinimap.width - (unitWidthX / 2)},${Math.max(svgMinimap.height, 0)}Z`"
                                :fill="`url(#${uid})`"
                                stroke="none" 
                                style="opacity: 0.6" 
                            />
    
                            <template v-else-if="!minimapMerged">
                                <g v-for="(dp, i) in allMinimapLines.filter(d => d.type === 'bar' && d.isVisible)">
                                    <template v-for="(r, j) in dp.points">
                                        <rect
                                            v-if="dp && !isNaN(r.y)"
                                            :x="getBarX(r.x, i, j)"
                                            :y="r.v >= 0 ? r.y : r.y0"
                                            :width="getBarWidth(i, j)"
                                            :height="r.v >= 0 ? (r.y0 - r.y) : (r.y - r.y0)"
                                            :fill="dp.color"
                                            :style="{ opacity: 0.6 }"
                                        />
                                    </template>
                                </g>
                                <g v-for="dp in allMinimapLines.filter(d => d.type === 'line')">
                                    <path 
                                        v-if="dp.isVisible"
                                        :d="`M ${dp.fullSet}`" 
                                        fill="none"
                                        :stroke="dp.color"
                                        style="opacity: 0.6"
                                        :stroke-dasharray="dp.dashed ? '2 4' : 0"
                                    />
                                    
                                    <circle
                                        v-for="m in dp.fullMarkers"
                                        v-if="dp.isVisible && cutNullValues"
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
                                <g v-for="dp in allMinimapLines.filter(d => d.type === 'plot')"> 
                                    <g v-for="m in dp.points">
                                        <circle
                                            v-if="dp.isVisible && m.value !== null"
                                            :key="`sel-plot-under-${dp.key}-${m.i}`"
                                            :cx="m.x"
                                            :cy="m.y"
                                            r="2"
                                            :fill="dp.color"
                                            :stroke="borderColor"
                                            stroke-width="0.5"
                                            style="opacity: 0.6"
                                        />
                                    </g>                                 
                                </g>
                            </template>
                        </template>

                        <!-- SELECTION RECT -->
                        <rect 
                            data-cy="slicer-minimap-selection-rect" 
                            :x="selectionRectCoordinates.x"
                            :y="0" 
                            :width="Math.max(0, selectionRectCoordinates.width)"
                            :height="Math.max(svgMinimap.height, 0)" 
                            :fill="borderColor"
                            :rx="minimapSelectionRadius" 
                            stroke="none" 
                        />
                        <rect 
                            :x="selectionRectCoordinates.x"
                            :y="0" 
                            :width="selectionRectCoordinates.width < 0 ? 0 : selectionRectCoordinates.width"
                            :height="Math.max(svgMinimap.height, 0)" 
                            :rx="minimapSelectionRadius"
                            :fill="borderColor" 
                            :style="{ opacity: isDragging || isRanging ? 0 : 1 }" 
                        />

                        <rect 
                            :x="selectionRectCoordinates.x"
                            :y="0" 
                            :width="selectionRectCoordinates.width < 0 ? 0 : selectionRectCoordinates.width"
                            :height="Math.max(svgMinimap.height, 0)" 
                            :fill="minimapSelectedColor"
                            :rx="minimapSelectionRadius" 
                            :style="{ opacity: minimapSelectedColorOpacity }" 
                        />

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

                        <template v-if="!$slots.slotMap">
                            <!-- MERGED MINIMAP -->
                            <g v-if="minimapMerged" :key="'merged-tree'">
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
    
                                <circle
                                    v-if="minimapLine && minimapLine.firstPlot"
                                    :cx="minimapLine.firstPlot.x"
                                    :cy="minimapLine.firstPlot.y"
                                    stroke-width="0.5"
                                    :stroke="borderColor"
                                    r="3"
                                    :fill="minimapLineColor"
                                />
                                <circle
                                    v-if="minimapLine && minimapLine.lastPlot"
                                    :cx="minimapLine.lastPlot.x"
                                    :cy="minimapLine.lastPlot.y"
                                    stroke-width="0.5"
                                    :stroke="borderColor"
                                    r="3"
                                    :fill="minimapLineColor"
                                />
                            </g>
    
                            <!-- SPLIT TREE (lines) -->
                            <g v-else :key="'split-tree'">
                                <g v-for="(dp, i) in allMinimapLines.filter(d => d.type === 'bar' && d.isVisible)">
                                    <template v-for="(r, j) in dp.points">
                                        <rect
                                            v-if="dp && !isNaN(r.y)"
                                            :x="getBarX(r.x, i, j)"
                                            :y="r.v >= 0 ? r.y : r.y0"
                                            :width="getBarWidth(i, j)"
                                            :height="r.v >= 0 ? (r.y0 - r.y) : (r.y - r.y0)"
                                            :fill="dp.color"
                                            :style="{ opacity: j >= start && j < end ? 1 : 0 }"
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
                                        :stroke-dasharray="dp.dashed ? '2 4' : 0"
                                    />
                                </g>
                                <g v-for="dp in allMinimapLines.filter(d => d.type === 'plot')" :key="String(dp.key)">
                                    <g v-for="m in dp.points">
                                        <circle
                                            v-if="dp.isVisible && m.value !== null"
                                            :cx="m.x"
                                            :cy="m.y"
                                            r="2"
                                            :fill="dp.color"
                                            :stroke="borderColor"
                                            stroke-width="0.5"
                                            style="opacity: 0.6"
                                        />
                                    </g>
                                </g>
                            </g>
                        </template>

                        <slot 
                            v-if="$slots.slotMap"
                            name="slotMap"
                            v-bind="{
                                width: Math.max(0, svgMinimap.width),
                                height: Math.max(0, svgMinimap.height),
                                zeroY: minimapZero,
                                unitW: Math.max(0, unitWidthX)
                            }" 
                        />

                        <!-- COMPACT HANDLES (minimap mode only) -->
                        <rect
                            class="vue-ui-zoom-compact-minimap-handle"
                            v-if="hasMinimap && minimapCompact"
                            :x="selectionRectCoordinates.x - 40"
                            :y="0"
                            :width="40"
                            :height="svgMinimap.height"
                            :fill="borderColor"
                            stroke="none"
                            style="opacity: 0.7"
                            :rx="3"
                        />
                        <rect
                            class="vue-ui-zoom-compact-minimap-handle"
                            v-if="hasMinimap && minimapCompact"
                            :x="selectionRectCoordinates.x - 40"
                            :y="0"
                            :width="40"
                            :height="svgMinimap.height"
                            fill="none"
                            :stroke="textColor"
                            :rx="3"
                        />

                        <!-- RIGHT handle (shifted outward to the right) -->
                        <rect
                            class="vue-ui-zoom-compact-minimap-handle"
                            v-if="hasMinimap && minimapCompact"
                            :x="selectionRectCoordinates.x + selectionRectCoordinates.width"
                            :y="0"
                            :width="40"
                            :height="svgMinimap.height"
                            :fill="borderColor"
                            stroke="none"
                            style="opacity: 0.7"
                            :rx="3"
                        />
                        <rect
                            class="vue-ui-zoom-compact-minimap-handle"
                            v-if="hasMinimap && minimapCompact"
                            :x="selectionRectCoordinates.x + selectionRectCoordinates.width"
                            :y="0"
                            :width="40"
                            :height="svgMinimap.height"
                            fill="none"
                            :stroke="textColor"
                            :rx="3"
                        />

                        <!-- SELECTION INDICATOR -->
                        <template v-if="selectedTrap !== null && !isMouseDown">
                            <line v-bind="selectionIndicator"/>
                        </template>

                        <template v-if="!$slots.slotMap">
                            <!-- MERGED MINIMAP -->
                            <g v-if="minimapMerged" :key="'merged-tree'">
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
                                    :r="2"
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
                            </g>
    
                            <!-- SPLIT TREE (circles) -->
                            <g v-else>
                                <g v-for="dp in allMinimapLines.filter(d => d.type === 'line')" :key="String(dp.key)">
                                    <path
                                        v-if="dp && dp.hasSelection && dp.selectionSet && dp.isVisible"
                                        :d="`M ${dp.selectionSet}`"
                                        :stroke="dp.color"
                                        fill="transparent"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        :stroke-dasharray="dp.dashed ? '2 4' : 0"
                                    />
    
                                    <circle
                                        v-for="m in dp.selectionMarkers"
                                        v-if="dp.isVisible && cutNullValues"
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
                                <g v-for="dp in allMinimapLines.filter(d => d.type === 'plot')" :key="String(dp.key)">
                                    <g v-for="m in dp.points">
                                        <circle
                                            v-if="dp.isVisible && cutNullValues && m.value !== null"
                                            :key="`sel-plot-${dp.key}-${m.i}`"
                                            :cx="m.x"
                                            :cy="m.y"
                                            r="2.5"
                                            :fill="dp.color"
                                            :stroke="borderColor"
                                            stroke-width="0.5"
                                        />
                                    </g>
                                </g>
                            </g>
                        </template>

                        <!-- TOOLTIP TRAPS -->
                        <rect 
                            v-for="(trap, i) in availableTraps" 
                            :x="unitWidthX * i - (minimapCompact ? unitWidthX / 2 : 0)"
                            :y="0"
                            :height="Math.max(svgMinimap.height, 0)" 
                            :width="unitWidthX < 0 ? 0 : unitWidthX"
                            fill="transparent" 
                            style="pointer-events: all !important;" 
                            :style="{ cursor: trap >= startMini && trap < endMini && enableSelectionDrag ? isMouseDown ? 'grabbing' : 'grab' : 'default' }" 
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
                    :class="{ 'range-highlight': true, 'move': enableSelectionDrag }"
                    @mousedown="isMouseDown = true"
                    @mouseup="isMouseDown = false"
                    :style="{
                        ...highlightStyle,
                        cursor: isMouseDown ? 'grabbing' : 'grab',
                        visibility: hasMinimap && minimapCompact ? 'hidden' : 'visible'
                    }"
                />

            <input
                aria-label="range-handle-left"
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
                :max="minimapCompact && hasMinimap ? Math.max(0, absLen - 1) : max"
                v-model.number="startForInput"
                @input="startForInput = $event.target.valueAsNumber"
                @change="commitImmediately"
                @keyup.enter="commitImmediately"
                @blur="commitImmediately"
                @mouseenter="setLeftLabelZIndex('start')"
                @pointerup="commitImmediately"
            />

            <input
                aria-label="range-handle-right"
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
                :max="minimapCompact && hasMinimap ? Math.max(0, absLen - 1) : max"
                v-model.number="endForInput"
                @input="endForInput = $event.target.valueAsNumber"
                @change="commitImmediately"
                @keyup.enter="commitImmediately"
                @blur="commitImmediately"
                @mouseenter="setLeftLabelZIndex('end')"
                @pointerup="commitImmediately"
            />

            <div 
                v-if="labels.left" 
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
                    visibility: tooltipsCollide || labels.left === labels.right ? 'hidden' : 'visible',
                    top: hasMinimap && minimapCompact ? 'calc(-100% - 12px)' : '-100%'
                }"
            >
                {{ labels.left }}
            </div>

            <div 
                v-if="(tooltipsCollide || labels.left === labels.right) && (labels.left || labels.right)"
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
                    top: hasMinimap && minimapCompact ? 'calc(-100% - 12px)' : '-100%'
                }"
            >
                {{ labels.left === labels.right ? labels.left : `${labels.left} - ${labels.right}` }}
            </div>

            <div 
                v-if="labels.right" 
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
                    visibility: tooltipsCollide || labels.left === labels.right ? 'hidden' : 'visible',
                    top: hasMinimap && minimapCompact ? 'calc(-100% - 12px)' : '-100%'
                }"
            >
                {{ labels.right }}
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
    top: calc(-50% - 6px);

    svg {
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
    top: 6px;
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
    cursor: ew-resize;
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
    text-align: center;
    pointer-events: none;
    position: absolute;
    top: -100%;
    width: fit-content;
    white-space: nowrap;
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

[data-minimap="true"] {
    --compact-thumb-width: 40px;
    --compact-thumb-inset: calc(var(--compact-thumb-width) / 2);

    /* Keep the general range aligned to the component width */
    input[type="range"] {
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        box-sizing: border-box;
    }

    input[type="range"].range-invisible.range-left {
        left: -40px !important;
    }

    input[type="range"].range-invisible.range-right {
        left: 0px !important;
    }

    input[type="range"].range-invisible {
        left: calc(-1 * var(--compact-thumb-inset)) !important;
        right: auto !important;
        width: calc(100% + var(--compact-thumb-width)) !important;
        transform: none !important;
        box-sizing: border-box;
    }

    /* Thumb hit area sizing (minimap only) */
    input[type="range"].range-invisible::-webkit-slider-thumb {
        width: var(--compact-thumb-width) !important;
    }
    input[type="range"].range-invisible::-moz-range-thumb {
        width: var(--compact-thumb-width) !important;
    }

    input[type="range"].range-minimap::-webkit-slider-thumb {
        width: var(--compact-thumb-width) !important;
    }
    input[type="range"].range-minimap::-moz-range-thumb {
        width: var(--compact-thumb-width) !important;
    }
}

</style>
import { computed, nextTick, ref } from 'vue';

export function useStackChartSlicer({
    slicer,
    slicerPrecog,
    cfgChart,
    maxSeries,
    chartSlicer,
    props,
    emit,
    isDisposed,
    waitForLayoutFrames,
    captureZoomTransition,
}) {
    let queuedSlicerFrame = null;
    let queuedSlicerUpdate = {};
    let refreshSequence = 0;
    const isSettingUp = ref(false);
    const slicerReady = ref(false);
    const suppressChild = ref(false);
    const isPrecog = computed(() => {
        return (
            cfgChart.value.zoom.preview.enable &&
            (slicerPrecog.value.start !== slicer.value.start ||
                slicerPrecog.value.end !== slicer.value.end)
        );
    });

    function setPrecog(side, val) {
        slicerPrecog.value[side] = val;
    }

    function normalizeZoomState(state, fallback = slicer.value) {
        if (!state || typeof state !== 'object') return null;
        const hasStart = state.start !== undefined && state.start !== null;
        const hasEnd = state.end !== undefined && state.end !== null;
        if (!hasStart && !hasEnd) return null;
        const start = hasStart ? Number(state.start) : Number(fallback.start);
        const end = hasEnd ? Number(state.end) : Number(fallback.end);
        if (!Number.isFinite(start) || !Number.isFinite(end)) {
            return null;
        }
        return {
            start,
            end,
        };
    }

    function emitZoomState(state) {
        const normalized = normalizeZoomState(state);
        if (!normalized) return;

        emit('update:zoomState', normalized);
    }

    function clearQueuedSlicerFrame() {
        if (queuedSlicerFrame) {
            cancelAnimationFrame(queuedSlicerFrame);
            queuedSlicerFrame = null;
        }

        queuedSlicerUpdate = {};
    }

    function normalizeSlicerWindow() {
        const maxLen = maxSeries.value;
        let s = Math.max(0, Math.min(slicer.value.start ?? 0, maxLen - 1));
        let e = Math.max(s + 1, Math.min(slicer.value.end ?? maxLen, maxLen));

        if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) {
            s = 0;
            e = maxLen;
        }

        slicer.value.start = s;
        slicer.value.end = e;
        slicerPrecog.value.start = s;
        slicerPrecog.value.end = e;

        if (chartSlicer.value) {
            chartSlicer.value.setRangeValues(s, e);
        }
    }

    function validSlicerEnd(v, start = slicer.value.start) {
        const _max = maxSeries.value;
        const effectiveStart = Number(start);

        if (v > _max) {
            return _max;
        }

        if (v < 0 || v <= effectiveStart) {
            return Math.min(effectiveStart + 1, _max);
        }

        return v;
    }

    function getCommittedRange() {
        return {
            start: Number(slicer.value.start),
            end: Number(slicer.value.end),
        };
    }

    function applyZoomState(state, { transition = false } = {}) {
        const normalized = normalizeZoomState(state);
        if (!normalized) return null;

        const { start, end } = normalized;
        const current = getCommittedRange();
        if (start !== current.start || end !== current.end) {
            const playTransition = captureZoomTransition?.();
            clearQueuedSlicerFrame();
            slicer.value = { start, end };
            slicerPrecog.value = { start, end };
            normalizeSlicerWindow();
            if (transition) playTransition?.();
        }

        return getCommittedRange();
    }

    function publishZoomState(state, options) {
        const committed = applyZoomState(state, options);
        if (!committed) return null;

        emit('update:zoomState', committed);
        return committed;
    }

    function setupSlicer(applyControlledZoom = true) {
        if (isSettingUp.value) return;

        isSettingUp.value = true;

        try {
            const { startIndex, endIndex, keepState } = cfgChart.value.zoom;

            const max = keepState
                ? Math.max(0, maxSeries.value)
                : maxSeries.value;

            if (keepState && max <= 0) {
                return;
            }

            const start = startIndex != null ? startIndex : 0;

            const end =
                endIndex != null
                    ? Math.min(validSlicerEnd(endIndex + 1, start), max)
                    : max;

            suppressChild.value = true;

            slicer.value.start = start;
            slicer.value.end = end;
            slicerPrecog.value.start = start;
            slicerPrecog.value.end = end;

            normalizeSlicerWindow();

            slicerReady.value = true;

            if (applyControlledZoom && props.zoomState) {
                applyZoomState(props.zoomState);
            }
        } finally {
            queueMicrotask(() => {
                suppressChild.value = false;
            });

            isSettingUp.value = false;
        }
    }

    function queueSlicerUpdate(update) {
        queuedSlicerUpdate = {
            ...queuedSlicerUpdate,
            ...update,
        };

        if (queuedSlicerFrame) {
            cancelAnimationFrame(queuedSlicerFrame);
        }

        queuedSlicerFrame = requestAnimationFrame(() => {
            const nextSlicer = {
                ...slicer.value,
                ...queuedSlicerUpdate,
            };

            queuedSlicerUpdate = {};
            queuedSlicerFrame = null;

            slicer.value = nextSlicer;
            slicerPrecog.value = { ...nextSlicer };

            normalizeSlicerWindow();

            // Publish only the complete, normalized range. SlicerPreview emits
            // start and end separately while dragging the whole selection.
            emitZoomState(getCommittedRange());
        });
    }

    async function refreshSlicer({
        force = false,
        publish = false,
        transition = force && publish,
    } = {}) {
        if (isDisposed()) return;
        const sequence = ++refreshSequence;
        if (
            cfgChart.value.zoom.keepState &&
            !force &&
            slicerReady.value &&
            !(slicer.value.start === 0 && slicer.value.end === 0)
        ) {
            normalizeSlicerWindow();
            return;
        }
        const applyControlledZoom = !force;
        const playTransition = transition ? captureZoomTransition?.() : null;
        setupSlicer(applyControlledZoom);
        playTransition?.();
        await nextTick();
        const isCurrent = () => sequence === refreshSequence;
        if (!isCurrent() || isDisposed()) return;
        if (!(await waitForLayoutFrames(3, isCurrent))) return;
        setupSlicer(applyControlledZoom);
        if (publish) {
            emitZoomState(getCommittedRange());
            emit('zoomReset');
        }
    }

    function onSlicerStart(v) {
        if (isSettingUp.value || suppressChild.value) return;

        const start = Number(v);
        if (!Number.isFinite(start)) return;

        emit('zoomStart', {
            index: start,
            isZoom: start !== 0,
        });

        if (start === slicer.value.start) return;

        queueSlicerUpdate({ start });
    }

    function onSlicerEnd(v) {
        if (isSettingUp.value || suppressChild.value) return;

        const pendingStart =
            queuedSlicerUpdate.start !== undefined
                ? queuedSlicerUpdate.start
                : slicer.value.start;

        const end = validSlicerEnd(Number(v), pendingStart);
        if (!Number.isFinite(end)) return;

        emit('zoomEnd', {
            index: end,
            isZoom: end !== maxSeries.value,
        });

        if (
            end === slicer.value.end &&
            queuedSlicerUpdate.start === undefined
        ) {
            return;
        }

        queueSlicerUpdate({ end });
    }
    return {
        isPrecog,
        setPrecog,
        applyZoomState,
        publishZoomState,
        refreshSlicer,
        clearQueuedSlicerFrame,
        normalizeSlicerWindow,
        setupSlicer,
        onSlicerStart,
        onSlicerEnd,
        slicerReady,
    };
}

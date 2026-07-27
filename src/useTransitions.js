import { computed, isRef, onMounted, onUnmounted, ref, watch } from 'vue';

function resolveSource(source) {
    if (typeof source === 'function') {
        return source();
    }

    if (isRef(source)) {
        return source.value;
    }

    return source;
}

export function useTransitions({ config, dataset }) {
    const resolvedConfig = computed(() => resolveSource(config) ?? {});
    const resolvedDataset = computed(() => resolveSource(dataset));

    const transitionEnabled = ref(Boolean(resolvedConfig.value.enable));

    let timeoutId = null;
    let stopDatasetWatcher = null;

    function clearActivationTimeout() {
        if (timeoutId === null) return;

        clearTimeout(timeoutId);
        timeoutId = null;
    }

    function pause() {
        clearActivationTimeout();

        const currentConfig = resolvedConfig.value;
        const enabled = Boolean(currentConfig.enable);
        const activationDelayMs = Number(currentConfig.activationDelayMs) || 0;

        if (!enabled || activationDelayMs <= 0) {
            transitionEnabled.value = enabled;
            return;
        }

        transitionEnabled.value = false;

        timeoutId = setTimeout(() => {
            transitionEnabled.value = Boolean(resolvedConfig.value.enable);

            timeoutId = null;
        }, activationDelayMs);
    }

    function updateDatasetWatcher(enabled) {
        stopDatasetWatcher?.();
        stopDatasetWatcher = null;

        if (!enabled) return;

        stopDatasetWatcher = watch(resolvedDataset, pause, {
            deep: true,
        });
    }

    watch(
        () => resolvedConfig.value.pauseOnDatasetChange,
        updateDatasetWatcher,
        {
            immediate: true,
        },
    );

    watch(
        () => resolvedConfig.value.enable,
        (enabled) => {
            clearActivationTimeout();
            transitionEnabled.value = Boolean(enabled);
        },
    );

    watch(
        () => resolvedConfig.value.activationDelayMs,
        () => {
            if (timeoutId !== null) {
                pause();
            }
        },
    );

    onMounted(() => {
        if (resolvedConfig.value.pauseOnLoad) {
            pause();
        }
    });

    onUnmounted(() => {
        clearActivationTimeout();
        stopDatasetWatcher?.();
    });

    return {
        transitionEnabled,
        pause,
    };
}

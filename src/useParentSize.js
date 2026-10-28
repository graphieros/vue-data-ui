import {
    computed,
    getCurrentInstance,
    getCurrentScope,
    onBeforeUnmount,
    onScopeDispose,
    shallowRef,
    toValue,
    watch,
} from 'vue';

/**
 * Measures a parent, adding offsets before scaling both dimensions.
 * Call during setup with a template ref for automatic measurement after mounting
 * and cleanup on unmount. Elements and options can be plain values, refs or getters.
 * @param {import('vue').MaybeRefOrGetter<HTMLElement | null | undefined>} element
 * @param {object} [options] - Reactive option properties are supported.
 * @param {import('vue').MaybeRefOrGetter<number>} [options.scale=1]
 * @param {import('vue').MaybeRefOrGetter<number>} [options.offsetWidth=0]
 * @param {import('vue').MaybeRefOrGetter<number>} [options.offsetHeight=0]
 * @param {import('vue').MaybeRefOrGetter<number>} [options.maxWidth] - Final width limit; defaults to viewport width.
 * @param {import('vue').MaybeRefOrGetter<number>} [options.maxHeight] - Final height limit; defaults to viewport height.
 * @param {import('vue').MaybeRefOrGetter<boolean>} [options.observe=true]
 * @returns {{height: import('vue').ComputedRef<number | undefined>, width: import('vue').ComputedRef<number | undefined>, stop: () => void}}
 */
export function useParentSize(element, options = {}) {
    const browserWindow = typeof window === 'undefined' ? undefined : window;
    const viewport = shallowRef({
        width: browserWindow?.innerWidth ?? Infinity,
        height: browserWindow?.innerHeight ?? Infinity,
    });
    function updateViewport() {
        viewport.value = {
            width: browserWindow.innerWidth,
            height: browserWindow.innerHeight,
        };
    }
    browserWindow?.addEventListener('resize', updateViewport);

    // Reject non-finite limits so a browser consumer cannot accidentally remove
    // the growth bound. During SSR there is no viewport or DOM to observe.
    function resolveLimit(option, fallback) {
        const limit = toValue(option);
        return Number.isFinite(limit) && limit >= 0 ? limit : fallback;
    }

    const size = shallowRef({ height: undefined, width: undefined });
    const stopWatching = watch(
        [
            () => toValue(element)?.parentElement,
            () => toValue(options.observe) ?? true,
        ],
        ([parent, observe], _, onCleanup) => {
            const rect = parent?.getBoundingClientRect();
            size.value = { height: rect?.height, width: rect?.width };

            if (!parent || !observe || typeof ResizeObserver === 'undefined')
                return;

            const observer = new ResizeObserver(() => {
                const { height, width } = parent.getBoundingClientRect();
                size.value = { height, width };
            });
            observer.observe(parent, { box: 'border-box' });
            onCleanup(() => observer.disconnect());
        },
        { immediate: true, flush: 'post' },
    );

    function stop() {
        stopWatching();
        browserWindow?.removeEventListener('resize', updateViewport);
    }

    if (getCurrentScope()) {
        onScopeDispose(stop);
    } else if (getCurrentInstance()) {
        onBeforeUnmount(stop);
    }

    return {
        height: computed(() =>
            size.value.height === undefined
                ? undefined
                : Math.min(
                      (size.value.height +
                          (toValue(options.offsetHeight) || 0)) *
                          (toValue(options.scale) ?? 1),
                      resolveLimit(options.maxHeight, viewport.value.height),
                  ),
        ),
        width: computed(() =>
            size.value.width === undefined
                ? undefined
                : Math.min(
                      (size.value.width + (toValue(options.offsetWidth) || 0)) *
                          (toValue(options.scale) ?? 1),
                      resolveLimit(options.maxWidth, viewport.value.width),
                  ),
        ),
        stop,
    };
}

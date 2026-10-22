import { ref, watch, nextTick, onBeforeUnmount } from 'vue';

/**
 * Observes a table container and enables compact layout below its breakpoint.
 * Call during setup. Observation starts automatically, restarts when either ref
 * changes, and disconnects before unmounting.
 *
 * @param {import('vue').Ref<HTMLElement | null>} elRef - Mounted table container.
 * @param {import('vue').Ref<number>} breakpointRef - Compact-layout threshold in CSS pixels.
 * @returns {{isResponsive: import('vue').Ref<boolean>, start: () => Promise<void>, stop: () => void}} Layout state and observer controls.
 */
export function useTableResponsive(elRef, breakpointRef) {
    const isResponsive = ref(false);
    let ro = null;

    function stop() {
        if (ro) {
            ro.disconnect();
            ro = null;
        }
    }

    async function start() {
        stop();
        await nextTick(); // ensure Teleport content has mounted
        const el = elRef.value;
        if (!el) return;

        ro = new ResizeObserver((entries) => {
            const w = entries[0].contentRect.width;
            isResponsive.value = w < breakpointRef.value;
        });
        ro.observe(el);
    }

    watch(
        [elRef, breakpointRef],
        () => {
            start();
        },
        { immediate: true },
    );

    onBeforeUnmount(stop);

    return { isResponsive, start, stop };
}

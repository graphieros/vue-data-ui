import { ref, watch, nextTick, onBeforeUnmount } from "vue";

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

    watch([elRef, breakpointRef], () => { start(); }, { immediate: true });

    onBeforeUnmount(stop);

    return { isResponsive, start, stop };
}

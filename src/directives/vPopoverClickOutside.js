export default {
    beforeMount(el, binding) {
        const getConfig = () => {
            if (typeof binding.value === 'function') {
                return {
                    handler: binding.value,
                    targets: [el],
                    disabled: false,
                    scrollGuardMs: 250,
                    moveThreshold: 10,
                };
            }

            return {
                handler: binding.value?.handler,
                targets: binding.value?.targets ?? [el],
                disabled: !!binding.value?.disabled,
                scrollGuardMs: binding.value?.scrollGuardMs ?? 250,
                moveThreshold: binding.value?.moveThreshold ?? 10,
            };
        };

        const state = {
            lastScrollTs: 0,
            pointerId: null,
            startX: 0,
            startY: 0,
            moved: false,
        };

        const onScrollCapture = () => {
            state.lastScrollTs = performance.now();
        };

        const onPointerDownCapture = (event) => {
            state.pointerId = event.pointerId ?? null;
            state.startX = event.clientX ?? 0;
            state.startY = event.clientY ?? 0;
            state.moved = false;
        };

        const onPointerMoveCapture = (event) => {
            if (state.pointerId === null) return;
            if ((event.pointerId ?? null) !== state.pointerId) return;

            const dx = (event.clientX ?? 0) - state.startX;
            const dy = (event.clientY ?? 0) - state.startY;
            const { moveThreshold } = getConfig();

            if ((dx * dx + dy * dy) >= moveThreshold * moveThreshold) {
                state.moved = true;
            }
        };

        const onPointerUpCapture = (event) => {
            if (state.pointerId === null) return;
            if ((event.pointerId ?? null) !== state.pointerId) return;
            state.pointerId = null;
        };

        const isInsideAnyTarget = (event, targets) => {
            const path = event.composedPath ? event.composedPath() : [];

            for (const target of targets) {
                const node = target && typeof target === 'object' && 'value' in target ? target.value : target;
                if (!node) continue;
                if (node === event.target) return true;
                if (node.contains && node.contains(event.target)) return true;
                if (path.length && path.includes(node)) return true;
            }

            return false;
        };

        const onClickCapture = (event) => {
            const { handler, targets, disabled, scrollGuardMs } = getConfig();
            if (disabled) return;
            if (typeof handler !== 'function') return;

            // Ignore click right after a scroll
            if (performance.now() - state.lastScrollTs < scrollGuardMs) return;

            // Ignore click that came from a drag or scroll
            if (state.moved) return;

            const inside = isInsideAnyTarget(event, targets);
            if (!inside) handler(event);
        };

        el.__vPopoverClickOutside__ = {
            onScrollCapture,
            onPointerDownCapture,
            onPointerMoveCapture,
            onPointerUpCapture,
            onClickCapture,
        };

        window.addEventListener('scroll', onScrollCapture, true);
        document.addEventListener('pointerdown', onPointerDownCapture, true);
        document.addEventListener('pointermove', onPointerMoveCapture, true);
        document.addEventListener('pointerup', onPointerUpCapture, true);
        document.addEventListener('click', onClickCapture, true);
    },

    unmounted(el) {
        const h = el.__vPopoverClickOutside__;
        if (!h) return;

        window.removeEventListener('scroll', h.onScrollCapture, true);
        document.removeEventListener('pointerdown', h.onPointerDownCapture, true);
        document.removeEventListener('pointermove', h.onPointerMoveCapture, true);
        document.removeEventListener('pointerup', h.onPointerUpCapture, true);
        document.removeEventListener('click', h.onClickCapture, true);

        delete el.__vPopoverClickOutside__;
    },
};

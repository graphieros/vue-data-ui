import { nextTick, watchEffect } from 'vue';

export function useLabelObserverEffect({
    elementRef,
    callback,
    attr,
    earlyReturn = false,
    retryFrames = 12,
    alsoAfterFontsReady = true
}) {
    if (earlyReturn) return;

    const measureValue = (element) => {
        if (!element) return;

        let value;

        if (typeof element.getBBox === 'function') {
            try {
                const box = element.getBBox();
                value = attr === "width" ? box.width : box.height;
            } catch {
                // whatever
            }
        }

        if (typeof value !== 'number' || Number.isNaN(value)) {
            try {
                const rect = element.getBoundingClientRect();
                value = attr === 'width' ? rect.width : rect.height;
            } catch {
                value = undefined;
            }
        }

        if (typeof value === 'number' && !Number.isNaN(value)) {
            callback(value);
        }
    };

    watchEffect((onInvalidate) => {
        const element = elementRef.value;
        if (!element) return;

        let cancelled = false;

        // measure after render
        const runInitialMeasures = async () => {
            await nextTick();

            for (let index = 0; index < retryFrames; index += 1) {
                if (cancelled) return;

                await new Promise((resolve) => requestAnimationFrame(resolve));

                const current = elementRef.value;
                if (!current) return;

                measureValue(current);
            }

            if (
                alsoAfterFontsReady &&
                typeof document !== 'undefined' &&
                document.fonts &&
                document.fonts.ready
            ) {
                try {
                    await document.fonts.ready;
                } catch {
                    // whatever
                }
                if (!cancelled && elementRef.value) {
                    // Measure after fonts settle
                    measureValue(elementRef.value);
                }
            }
        };

        runInitialMeasures();

        const mutationObserver = new MutationObserver(() => {
            const current = elementRef.value;
            if (!current) return;
            requestAnimationFrame(() => {
                if (elementRef.value) measureValue(elementRef.value);
            });
        });

        mutationObserver.observe(element, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['transform', 'style', 'class']
        });

        // Also measure on resize
        let resizeObserver;
        if (typeof ResizeObserver !== 'undefined') {
            const observedNode =
                element.ownerSVGElement ? element.ownerSVGElement : element;

            resizeObserver = new ResizeObserver(() => {
                const current = elementRef.value;
                if (!current) return;
                measureValue(current);
            });

            resizeObserver.observe(observedNode);
        }

        onInvalidate(() => {
            cancelled = true;
            mutationObserver.disconnect();
            if (resizeObserver) resizeObserver.disconnect();
        });
    }, { flush: 'post' });
}

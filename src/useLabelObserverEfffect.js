import { nextTick, watchEffect } from 'vue';

/**
 * Measures a rendered label after Vue updates and optionally after fonts load.
 * Call during setup. Pending measurement work is invalidated when the watched
 * element changes or its owning effect scope stops.
 * @param {object} options - Label measurement inputs.
 * @param {import('vue').Ref<Element | null>} options.elementRef - HTML or SVG label.
 * @param {(size: number) => void} options.callback - Receives the measured dimension.
 * @param {'width' | 'height'} options.attr - Dimension to measure.
 * @param {boolean} [options.earlyReturn=false] - Skip registration entirely.
 * @param {number} [options.retryFrames=12] - Additional animation-frame measurement attempts.
 * @param {boolean} [options.alsoAfterFontsReady=true] - Remeasure after document fonts settle.
 * @returns {void}
 */
export function useLabelObserverEffect({
    elementRef,
    callback,
    attr,
    earlyReturn = false,
    retryFrames = 12,
    alsoAfterFontsReady = true,
}) {
    if (earlyReturn) return;

    const measureValue = (element) => {
        if (!element) return;

        let value;

        if (typeof element.getBBox === 'function') {
            try {
                const box = element.getBBox();
                value = attr === 'width' ? box.width : box.height;
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

    watchEffect(
        (onInvalidate) => {
            const element = elementRef.value;
            if (!element) return;

            let cancelled = false;

            // measure after render
            const runInitialMeasures = async () => {
                await nextTick();

                for (let index = 0; index < retryFrames; index += 1) {
                    if (cancelled) return;

                    await new Promise((resolve) =>
                        requestAnimationFrame(resolve),
                    );

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
                attributeFilter: ['transform', 'style', 'class'],
            });

            // Also measure on resize
            let resizeObserver;
            if (typeof ResizeObserver !== 'undefined') {
                const observedNode = element.ownerSVGElement
                    ? element.ownerSVGElement
                    : element;

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
        },
        { flush: 'post' },
    );
}

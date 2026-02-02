import { nextTick, onBeforeUnmount, ref } from "vue";

function areNumbersFinite(valueA, valueB) {
    return Number.isFinite(valueA) && Number.isFinite(valueB);
}

function areSizesEqual(sizeA, sizeB) {
    return sizeA.width === sizeB.width && sizeA.height === sizeB.height;
}

/**
 * - Observe an element's size
 * - Only accept the size once it has remained identical
 *   for a given number of animation frames
 * - Prevent early layout calculations when the parent/container
 *   is still settling (fonts, flex, grid, transitions, etc.)
 */
export function useStableElementSize({
    elementRef,
    minimumWidth = 2,
    minimumHeight = 2,
    stableFramesRequired = 2,
    once = false,
    onSizeAccepted,
}) {
    const width = ref(0);
    const height = ref(0);
    const isStable = ref(false);

    let resizeObserver = null;
    let animationFrameId = 0;

    // Last size candidate seen during validation
    let lastCandidateSize = { width: 0, height: 0 };

    // Number of consecutive frames with identical size
    let stableFrameCount = 0;

    // Used when `once === true` to avoid re-accepting
    let hasAcceptedOnce = false;

    /**
     * Check whether a measured size is worth considering
     * Filters out:
     * - NaN / Infinity
     * - Zero or near-zero sizes during mount
     */
    function cancelAnimationFrameIfAny() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = 0;
        }
    }

    function isCandidateValid(candidateWidth, candidateHeight) {
        if (!areNumbersFinite(candidateWidth, candidateHeight)) return false;
        if (candidateWidth < minimumWidth) return false;
        if (candidateHeight < minimumHeight) return false;
        return true;
    }

    function stop() {
        cancelAnimationFrameIfAny();

        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }
    }

    /**
     * Commit widh and height
     */
    function acceptSize(candidateWidth, candidateHeight) {
        width.value = candidateWidth;
        height.value = candidateHeight;
        isStable.value = true;

        if (typeof onSizeAccepted === "function") {
            onSizeAccepted({ width: candidateWidth, height: candidateHeight });
        }

        hasAcceptedOnce = true;

        if (once) {
            stop();
        }
    }

    /**
     * Validate a candidate size:
     * - Ensure it is valid
     * - Count how many consecutive frames it remains identical
     * - Accept it once the stability threshold is reached
     */
    function validateCandidateSize(candidateWidth, candidateHeight) {
        if (once && hasAcceptedOnce) return;

        if (!isCandidateValid(candidateWidth, candidateHeight)) {
            isStable.value = false;
            stableFrameCount = 0;
            lastCandidateSize = { width: 0, height: 0 };
            return;
        }

        const currentCandidateSize = { width: candidateWidth, height: candidateHeight };

        if (areSizesEqual(currentCandidateSize, lastCandidateSize)) {
            stableFrameCount += 1;
        } else {
            stableFrameCount = 1;
            lastCandidateSize = currentCandidateSize;
        }

        if (stableFrameCount >= stableFramesRequired) {
            acceptSize(candidateWidth, candidateHeight);
        }
    }

    function measureOnce() {
        const element = elementRef.value;
        if (!element) {
            isStable.value = false;
            return;
        }

        const rect = element.getBoundingClientRect();
        validateCandidateSize(Math.round(rect.width), Math.round(rect.height));
    }

    /**
     * Schedule a small RAF loop to validate size across frames
     * This ensures layout + font metrics have settled
     */
    function scheduleValidationFrames(frameCount = 2) {
        cancelAnimationFrameIfAny();

        let framesRemaining = frameCount;

        const run = () => {
            measureOnce();
            framesRemaining -= 1;

            if (framesRemaining > 0) {
                animationFrameId = requestAnimationFrame(run);
            } else {
                animationFrameId = 0;
            }
        };

        animationFrameId = requestAnimationFrame(run);
    }

    async function start() {
        await nextTick();

        scheduleValidationFrames(2);

        const element = elementRef.value;
        if (!element) return;

        if (resizeObserver) {
            resizeObserver.disconnect();
            resizeObserver = null;
        }

        resizeObserver = new ResizeObserver(() => {
            if (once && hasAcceptedOnce) return;

            isStable.value = false;
            stableFrameCount = 0;
            scheduleValidationFrames(2);
        });

        resizeObserver.observe(element);
    }

    onBeforeUnmount(stop);

    return {
        width,
        height,
        isStable,
        start,
        stop,
        measureOnce,
    };
}
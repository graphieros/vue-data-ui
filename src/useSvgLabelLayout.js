import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue';

/** Measure at a 1:1 SVG scale without painting or changing the chart's layout. */
export function withSvgLabelMeasurements(svg, measure) {
    const document = svg.ownerDocument;
    const probe = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    probe.setAttribute('width', '1');
    probe.setAttribute('height', '1');
    probe.setAttribute('viewBox', '0 0 1 1');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText =
        'position:fixed;top:0;left:0;visibility:hidden;pointer-events:none;overflow:hidden;';
    document.body.appendChild(probe);
    const cache = new Map();

    function read(element) {
        if (!element)
            return {
                x: 0,
                width: 0,
                height: 0,
                textWidth: 0,
                rotatedWidth: 0,
                leftOverhang: 0,
            };
        if (cache.has(element)) return cache.get(element);
        const clone = element.cloneNode(true);
        const originals = [element, ...element.querySelectorAll('*')];
        const copies = [clone, ...clone.querySelectorAll('*')];
        for (const [index, node] of copies.entries()) {
            // Descendants can use selectors/inheritance from outside this group.
            // Resolve their typography before moving the copy outside the chart.
            const style = document.defaultView.getComputedStyle(
                originals[index],
            );
            for (const property of [
                'font-family',
                'font-size',
                'font-weight',
                'font-style',
                'font-stretch',
                'font-variant',
                'font-feature-settings',
                'font-kerning',
                'letter-spacing',
                'word-spacing',
                'text-anchor',
                'dominant-baseline',
                'alignment-baseline',
                'baseline-shift',
                'text-transform',
                'white-space',
                'writing-mode',
            ]) {
                node.style.setProperty(
                    property,
                    style.getPropertyValue(property),
                    'important',
                );
            }
            node.removeAttribute('id');
            node.removeAttribute('data-cy');
            node.style.setProperty('transition', 'none', 'important');
            node.style.setProperty('animation', 'none', 'important');
        }
        probe.appendChild(clone);
        const box = clone.getBBox();
        const texts = clone.matches('text')
            ? [clone]
            : [...clone.querySelectorAll('text')];
        const result = {
            x: box.x,
            width: box.width,
            height: box.height,
            textWidth: Math.max(
                0,
                ...texts.map((text) => text.getComputedTextLength()),
            ),
            rotatedWidth: clone.getBoundingClientRect().width,
            leftOverhang: Math.max(
                0,
                ...texts.map((text) => {
                    const box = text.getBBox();
                    const matrix = text.getCTM?.() || { a: 1, c: 0 };
                    const x = text.x?.baseVal?.[0]?.value || 0;
                    const y = text.y?.baseVal?.[0]?.value || 0;
                    return -Math.min(
                        ...[box.x, box.x + box.width].flatMap((px) =>
                            [box.y, box.y + box.height].map(
                                (py) =>
                                    matrix.a * (px - x) + matrix.c * (py - y),
                            ),
                        ),
                    );
                }),
            ),
        };
        cache.set(element, result);
        return result;
    }

    try {
        return measure(read);
    } finally {
        probe.remove();
    }
}

/** Publish all margins together during Vue's post-render flush, before paint. */
export function useSvgLabelLayout({
    svgRef,
    measure,
    canMeasure,
    initialMetrics = {
        scaleLabelsWidth: 0,
        yAxisLabelWidth: 0,
        xAxisLabelHeight: 0,
        timeLabelsHeight: 0,
        right: 0,
    },
}) {
    const metrics = shallowRef({ ...initialMetrics });
    const ready = ref(false);
    const settling = ref(true);
    let stopped = false;
    let fontsReady = false;
    let fonts;
    let initialPassPending = false;
    let initialPassCount = 0;
    let initialFrame = 0;
    let mutationObserver;
    let resizeObserver;
    let resizeFrame = 0;
    let observedLabels = new Set();

    function scheduleResizeMeasurement() {
        if (resizeFrame || stopped) return;
        // Margin commits can resize the labels themselves. Measure outside the
        // observer delivery cycle to avoid ResizeObserver loop notifications.
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = 0;
            update();
        });
    }

    function observeLabels(labels) {
        const view = svgRef.value?.ownerDocument.defaultView;
        if (!mutationObserver && view?.MutationObserver)
            mutationObserver = new view.MutationObserver(update);
        if (!resizeObserver && view?.ResizeObserver)
            resizeObserver = new view.ResizeObserver(scheduleResizeMeasurement);
        const unchanged =
            labels.size === observedLabels.size &&
            [...labels].every((element) => observedLabels.has(element));
        if (unchanged) return;
        mutationObserver?.disconnect();
        resizeObserver?.disconnect();
        observedLabels = labels;
        for (const element of labels) {
            mutationObserver?.observe(element, {
                subtree: true,
                childList: true,
                characterData: true,
                attributes: true,
            });
            resizeObserver?.observe(element);
        }
    }

    function waitForFonts() {
        fontsReady = false;
        fonts.ready.then(() => {
            fontsReady = true;
            update();
        });
    }

    function update() {
        if (stopped || !fontsReady || !svgRef.value || !canMeasure()) return;
        let next;
        try {
            const labels = new Set();
            next = withSvgLabelMeasurements(svgRef.value, (read) =>
                measure((element) => {
                    if (element) labels.add(element);
                    return read(element);
                }),
            );
            // Observe the labels actually measured, rather than every SVG change.
            // Slot updates need not change any of the chart's reactive inputs.
            if (next != null) observeLabels(labels);
        } catch (_) {
            // Keep the last valid layout if a detached/hidden SVG cannot be measured.
            return;
        }
        // A preparation step may change label rotation and request a fresh DOM pass.
        if (next == null) {
            nextTick(update);
            return;
        }
        // Measuring hidden text can itself start a previously unused web font.
        if (fonts?.status === 'loading') {
            waitForFonts();
            return;
        }
        if (!Object.values(next).every(Number.isFinite)) return;
        const changed = Object.keys(next).some(
            (key) => Math.abs(next[key] - metrics.value[key]) > 0.25,
        );
        if (changed) {
            metrics.value = next;
        }
        // Confirm the measured margins against the DOM produced by their commit.
        // Revealing in that same patch can expose provisional SVG geometry.
        if (!ready.value && changed) {
            if (!initialPassPending) {
                initialPassPending = true;
                const confirm = () => {
                    initialPassPending = false;
                    update();
                };
                if (++initialPassCount < 4) {
                    nextTick(confirm);
                } else {
                    initialPassCount = 0;
                    initialFrame = requestAnimationFrame(confirm);
                }
            }
            return;
        }
        if (!ready.value && initialPassPending) return;
        ready.value = true;
        settling.value = false;
    }

    onMounted(() => {
        fonts = svgRef.value?.ownerDocument.fonts;
        fonts?.addEventListener('loadingdone', update);
        if (fonts?.status === 'loading') {
            waitForFonts();
        } else {
            fontsReady = true;
            update();
        }
    });
    onBeforeUnmount(() => {
        stopped = true;
        cancelAnimationFrame(initialFrame);
        cancelAnimationFrame(resizeFrame);
        mutationObserver?.disconnect();
        resizeObserver?.disconnect();
        observedLabels.clear();
        fonts?.removeEventListener('loadingdone', update);
    });

    return { metrics, ready, settling, update };
}

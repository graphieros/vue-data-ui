const layouts = new WeakMap();

/** Fits a chart's existing content without moving Vue-owned DOM nodes. */
export function createFullscreenLayout(element) {
    // Graph already manages a viewport-sized interactive scene and its camera.
    if (!element?.classList || element.classList.contains('vue-ui-graph')) {
        return { enter() {}, stop() {} };
    }
    if (layouts.has(element)) return layouts.get(element);
    const contentWidth =
        element.clientWidth || element.getBoundingClientRect().width || 800;
    const content = new Set();
    let frame = null;
    let resizeObserver;
    let mutationObserver;
    let active = false;
    let scale = 1;
    let chromeScale = 1;
    const properties = [
        '--vdui-fullscreen-width',
        '--vdui-fullscreen-scale',
        '--vdui-fullscreen-chrome-width',
        '--vdui-fullscreen-chrome-scale',
        '--vdui-fullscreen-pan-height',
        '--vdui-fullscreen-chart-width',
    ];
    const previous = properties.map((name) => [
        name,
        element.style.getPropertyValue(name),
        element.style.getPropertyPriority(name),
    ]);

    function setProperty(name, value) {
        if (element.style.getPropertyValue(name) !== value)
            element.style.setProperty(name, value);
    }
    function fit() {
        frame = null;
        if (!active || !element.isConnected) return;
        setProperty('--vdui-fullscreen-width', `${contentWidth}px`);
        setProperty('--vdui-fullscreen-scale', String(scale));
        for (const child of element.children) {
            const style = getComputedStyle(child);
            if (style.position === 'absolute' || style.position === 'fixed')
                continue;
            if (!content.has(child)) {
                content.add(child);
                child.setAttribute('data-vdui-fullscreen-content', '');
                resizeObserver?.observe(child);
            }
        }
        const availableWidth = Math.max(1, element.clientWidth - 32);
        const availableHeight = Math.max(1, element.clientHeight - 32);
        setProperty(
            '--vdui-fullscreen-chrome-width',
            `${availableWidth / chromeScale}px`,
        );
        setProperty('--vdui-fullscreen-chrome-scale', String(chromeScale));
        let panZoomCount = 0;
        let visualHeight = 0;
        let chromeHeight = 0;
        let width = contentWidth;
        for (const child of content) {
            if (!element.contains(child)) {
                resizeObserver?.unobserve(child);
                content.delete(child);
                continue;
            }
            const style = getComputedStyle(child);
            if (style.position === 'absolute' || style.position === 'fixed') {
                child.removeAttribute('data-vdui-fullscreen-content');
                child.removeAttribute('data-vdui-fullscreen-visual');
                child.removeAttribute('data-vdui-fullscreen-pan-zoom');
                resizeObserver?.unobserve(child);
                content.delete(child);
                continue;
            }
            if (style.display === 'none') continue;
            // Legend icons and toolbar SVGs are not the chart visualization.
            const visual =
                !child.hasAttribute('data-vdui-fullscreen-control') &&
                (child.matches('svg, canvas, table') ||
                    !!child.querySelector('canvas, table') ||
                    [...child.querySelectorAll('svg')].some(
                        (svg) =>
                            !svg.closest('[data-vdui-fullscreen-control]') &&
                            (svg.matches(
                                '.vue-data-ui-svg, .vue-data-ui-fullscreen--on',
                            ) ||
                                svg.clientWidth > 128),
                    ));
            if (visual !== child.hasAttribute('data-vdui-fullscreen-visual')) {
                child.toggleAttribute('data-vdui-fullscreen-visual', visual);
                schedule();
            }
            const panZoom =
                child.matches('svg[data-vdui-pan-zoom]') ||
                !!child.querySelector('svg[data-vdui-pan-zoom]');
            if (
                panZoom !== child.hasAttribute('data-vdui-fullscreen-pan-zoom')
            ) {
                child.toggleAttribute('data-vdui-fullscreen-pan-zoom', panZoom);
                schedule();
            }
            if (panZoom) panZoomCount += 1;
            const rect = child.getBoundingClientRect();
            const appliedScale = visual ? scale : chromeScale;
            const height =
                rect.height / appliedScale +
                (parseFloat(style.marginTop) || 0) +
                (parseFloat(style.marginBottom) || 0);
            if (visual) {
                if (!panZoom) {
                    width = Math.max(width, rect.width / scale);
                    visualHeight += height;
                }
            } else {
                chromeHeight += height;
            }
        }
        // Preserve surrounding text at its configured size unless it alone
        // consumes the viewport. Reserve some room for the visualization.
        const reserve = Math.min(96, availableHeight / 3);
        const nextChromeScale = Math.min(
            1,
            (availableHeight - reserve) / Math.max(1, chromeHeight),
        );
        if (
            Math.abs(nextChromeScale - chromeScale) *
                Math.max(1, chromeHeight) >
            0.25
        ) {
            chromeScale = nextChromeScale;
            setProperty('--vdui-fullscreen-chrome-scale', String(chromeScale));
            setProperty(
                '--vdui-fullscreen-chrome-width',
                `${availableWidth / chromeScale}px`,
            );
            schedule();
        }
        if (panZoomCount) {
            // Pan/zoom charts need a full interactive viewport rather than a
            // uniformly scaled copy of their original aspect ratio.
            const remaining = Math.max(
                1,
                availableHeight -
                    chromeHeight * chromeScale -
                    visualHeight * scale,
            );
            setProperty(
                '--vdui-fullscreen-pan-height',
                `${remaining / panZoomCount}px`,
            );
        }
        const nextScale = Math.min(
            availableWidth / width,
            Math.max(1, availableHeight - chromeHeight * chromeScale) /
                Math.max(1, visualHeight),
        );
        if (
            Number.isFinite(nextScale) &&
            nextScale > 0 &&
            Math.abs(nextScale - scale) * Math.max(1, width, visualHeight) >
                0.25
        ) {
            scale = nextScale;
            setProperty('--vdui-fullscreen-scale', String(scale));
        }
        setProperty(
            '--vdui-fullscreen-chart-width',
            `${Math.min(availableWidth, contentWidth * scale) / chromeScale}px`,
        );
    }

    function schedule() {
        if (active && frame === null) frame = requestAnimationFrame(fit);
    }
    function onFullscreenChange() {
        if (document.fullscreenElement !== element) stop();
    }
    function enter() {
        if (active) return;
        active = true;
        element.setAttribute('data-vdui-fullscreen-layout', '');
        setProperty('--vdui-fullscreen-width', `${contentWidth}px`);
        setProperty('--vdui-fullscreen-scale', '1');
        setProperty('--vdui-fullscreen-chrome-scale', '1');
        setProperty(
            '--vdui-fullscreen-chrome-width',
            `${Math.max(1, element.clientWidth - 32)}px`,
        );
        resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(element);
        mutationObserver = new MutationObserver((records) => {
            // SVG geometry updates do not change the surrounding layout. Its
            // actual size is already monitored by ResizeObserver.
            if (
                records.some((record) => !(record.target instanceof SVGElement))
            )
                schedule();
        });
        mutationObserver.observe(element, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class'],
        });
        window.addEventListener('resize', schedule);
        document.addEventListener('fullscreenchange', onFullscreenChange);
        fit();
    }
    function stop() {
        if (!active) {
            if (layouts.get(element) === layout) layouts.delete(element);
            return;
        }
        active = false;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        window.removeEventListener('resize', schedule);
        document.removeEventListener('fullscreenchange', onFullscreenChange);
        layouts.delete(element);
        element.removeAttribute('data-vdui-fullscreen-layout');
        for (const child of content) {
            child.removeAttribute('data-vdui-fullscreen-content');
            child.removeAttribute('data-vdui-fullscreen-visual');
            child.removeAttribute('data-vdui-fullscreen-pan-zoom');
        }
        content.clear();
        for (const [name, value, priority] of previous) {
            if (value) element.style.setProperty(name, value, priority);
            else element.style.removeProperty(name);
        }
        scale = 1;
        chromeScale = 1;
    }
    const layout = { enter, stop };
    layouts.set(element, layout);
    return layout;
}

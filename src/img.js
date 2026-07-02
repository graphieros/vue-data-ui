import { domToPng } from './dom-to-png';

const IGNORE_LAYOUT_SELECTOR = '[data-dom-to-png-ignore-layout]';

function waitForLayoutFrame() {
    return new Promise((resolve) => {
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(resolve);
        } else {
            setTimeout(resolve, 0);
        }
    });
}

function parsePixelValue(value) {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

function hasIgnoredLayoutAncestor(element, container) {
    let parent = element.parentElement;
    while (parent && parent !== container) {
        if (parent.matches(IGNORE_LAYOUT_SELECTOR)) {
            return true;
        }
        parent = parent.parentElement;
    }
    return false;
}

function getIgnoredLayoutElements(container) {
    return Array.from(
        container.querySelectorAll(IGNORE_LAYOUT_SELECTOR),
    ).filter((element) => !hasIgnoredLayoutAncestor(element, container));
}

function getOuterHeight(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);

    if (
        style.display === 'none' ||
        style.position === 'absolute' ||
        style.position === 'fixed'
    ) {
        return 0;
    }

    return (
        rect.height +
        parsePixelValue(style.marginTop) +
        parsePixelValue(style.marginBottom)
    );
}

function setStyle(element, property, value, priority = '') {
    element.style.setProperty(property, value, priority);
}

function restoreInlineStyle(element, inlineStyle) {
    if (inlineStyle === null) {
        element.removeAttribute('style');
    } else {
        element.setAttribute('style', inlineStyle);
    }
}

async function withIgnoredLayoutCollapsed(container, callback) {
    const ignoredLayoutElements = getIgnoredLayoutElements(container);

    if (!ignoredLayoutElements.length) {
        return callback();
    }

    const originalContainerStyle = container.getAttribute('style');
    const originalContainerHeight = container.getBoundingClientRect().height;
    const ignoredLayoutHeight = ignoredLayoutElements.reduce(
        (sum, element) => sum + getOuterHeight(element),
        0,
    );
    const originalElementStyles = ignoredLayoutElements.map((element) => ({
        element,
        inlineStyle: element.getAttribute('style'),
    }));

    originalElementStyles.forEach(({ element }) => {
        setStyle(element, 'display', 'none', 'important');
    });

    await waitForLayoutFrame();

    const collapsedContainerHeight = container.getBoundingClientRect().height;
    const needsContainerCrop =
        ignoredLayoutHeight > 0 &&
        collapsedContainerHeight >= originalContainerHeight - 0.5;

    if (needsContainerCrop) {
        const targetHeight = Math.max(
            0,
            originalContainerHeight - ignoredLayoutHeight,
        );
        setStyle(container, 'height', `${targetHeight}px`, 'important');
        setStyle(container, 'max-height', `${targetHeight}px`, 'important');
        setStyle(container, 'overflow', 'hidden', 'important');
        await waitForLayoutFrame();
    }

    try {
        return await callback();
    } finally {
        restoreInlineStyle(container, originalContainerStyle);
        originalElementStyles.forEach(({ element, inlineStyle }) => {
            restoreInlineStyle(element, inlineStyle);
        });
    }
}

export default async function img({
    domElement,
    fileName,
    format = 'png',
    scale = 2,
    base64 = false,
    img = false,
}) {
    if (!domElement) return Promise.reject('No element provided');

    const isSafari =
        typeof navigator !== 'undefined' &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    await new Promise((resolve) => setTimeout(resolve, 200));

    return withIgnoredLayoutCollapsed(domElement, async () => {
        if (isSafari) {
            // Warming up in Safari, because it never works on the first try
            try {
                await domToPng({ container: domElement, scale });
                await domToPng({ container: domElement, scale });
                await domToPng({ container: domElement, scale });
                await domToPng({ container: domElement, scale });
                if (base64) {
                    await domToPng({ container: domElement, scale, base64 });
                    await domToPng({ container: domElement, scale, base64 });
                    await domToPng({ container: domElement, scale, base64 });
                    await domToPng({ container: domElement, scale, base64 });
                }
            } catch (_) {
                // ignore any errors during warm-up
            }
        }

        if (base64 && img) {
            try {
                const p = await domToPng({ container: domElement, scale }).then(
                    (uri) => {
                        return uri;
                    },
                );
                const b64 = await domToPng({
                    container: domElement,
                    scale,
                    base64,
                }).then((b64) => {
                    return b64;
                });
                return { imageUri: p, base64: b64 };
            } catch (err) {
                console.error(
                    'Error generating image information for the chart',
                    err,
                );
            }
        } else if (base64) {
            try {
                return domToPng({ container: domElement, scale, base64 }).then(
                    (b64) => {
                        return b64;
                    },
                );
            } catch (err) {
                console.error(
                    'Error generating the base64 string of the chart',
                    err,
                );
            }
        } else {
            try {
                const imageDataUri = await domToPng({
                    container: domElement,
                    scale,
                });
                const link_1 = document.createElement('a');
                link_1.href = imageDataUri;
                link_1.download = `${fileName}.${format}`;
                document.body.appendChild(link_1);
                link_1.click();
                document.body.removeChild(link_1);
            } catch (err) {
                console.error('Error generating image:', err);
                throw err;
            }
        }
    });
}

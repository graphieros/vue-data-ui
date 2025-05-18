import { XMLNS } from "./lib";

/**
 * Recursively finds all <img> tags in the given clone,
 * and converts them to data URLs to prevent CORS/tainting issues in exports.
 * Waits for all images to finish loading/inlining.
 * @param {HTMLElement} clone - The cloned DOM tree root.
 * @returns {Promise<void>} Resolves when all images are inlined.
 */
async function inlineAllImages(clone) {
    const imgEls = clone.querySelectorAll('img');
    const promises = [];
    imgEls.forEach(imgEl => {
        if (imgEl.src && !imgEl.src.startsWith('data:')) {
            promises.push(
                new Promise(resolve => {
                    const image = new window.Image();
                    image.crossOrigin = 'anonymous'; // Try CORS
                    image.onload = function () {
                        try {
                            const canvas = document.createElement('canvas');
                            canvas.width = image.naturalWidth;
                            canvas.height = image.naturalHeight;
                            canvas.getContext('2d').drawImage(image, 0, 0);
                            imgEl.src = canvas.toDataURL();
                        } catch (e) {
                            // it's tainted
                        }
                        resolve();
                    };
                    image.onerror = function () { resolve(); };
                    image.src = imgEl.src;
                })
            );
        }
    });
    await Promise.all(promises);
}

/**
 * Removes all elements in the given DOM subtree that have the data-dom-to-png-ignore attribute.
 * @param {HTMLElement} root - The root of the cloned DOM tree.
 */
function removeIgnoredElements(root) {
    const ignored = root.querySelectorAll('[data-dom-to-png-ignore]');
    ignored.forEach(el => {
        el.remove()
    });
}

/**
 * Recursively applies all computed styles and existing inline styles as inline style attributes
 * on every element in the cloned DOM tree.
 * @param {HTMLElement} clone - The cloned DOM element.
 * @param {HTMLElement} original - The original DOM element.
 * @param {string} [inheritedFontFamily] - Font family to apply (optional).
 */
function applyAllComputedStylesDeep(clone, original, inheritedFontFamily) {
    const computedStyle = window.getComputedStyle(original);
    const rect = original.getBoundingClientRect();
    const isFlex = computedStyle.display.includes('flex');

    let styleMap = {};

    // Get all already-inline styles
    let inlineStyle = clone.getAttribute('style');
    if (typeof inlineStyle !== 'string') inlineStyle = '';
    inlineStyle.split(';').forEach(s => {
        if (typeof s === 'string' && s.trim()) {
            const [prop, val] = s.split(':');
            if (prop && val !== undefined) styleMap[prop.trim()] = val.trim();
        }
    });

    // Copy *every* computed property
    for (let i = 0; i < computedStyle.length; i += 1) {
        const property = computedStyle[i];
        const value = computedStyle.getPropertyValue(property);
        styleMap[property] = value;
    }

    // ---- Strongest part: force resolved color and background-color ----
    // getPropertyValue always resolves to an actual color, not 'inherit'
    styleMap['color'] = computedStyle.color;
    styleMap['background-color'] = computedStyle.backgroundColor;
    // Add font props for safety (if they matter to your charts)
    styleMap['font-family'] = computedStyle.fontFamily || inheritedFontFamily || '';
    styleMap['font-size'] = computedStyle.fontSize;
    styleMap['font-weight'] = computedStyle.fontWeight;

    if (
        isFlex ||
        computedStyle.display.includes('grid') ||
        ['inline-block', 'absolute', 'fixed'].includes(computedStyle.position)
    ) {
        if (rect.width > 0) styleMap['width'] = rect.width + 'px';
        if (rect.height > 0) styleMap['height'] = rect.height + 'px';
    }

    if (isFlex && computedStyle.flexWrap === 'nowrap') {
        styleMap['white-space'] = 'nowrap';
    }

    ['box-sizing', 'padding', 'margin', 'border'].forEach(prop => {
        styleMap[prop] = computedStyle.getPropertyValue(prop);
    });

    // No more inheritedFontFamily here; use resolved computedStyle above

    styleMap['overflow'] = 'visible';
    styleMap['overflow-x'] = 'visible';
    styleMap['overflow-y'] = 'visible';

    let styleString = '';
    for (const prop in styleMap) {
        styleString += `${prop}:${styleMap[prop]};`;
    }
    clone.setAttribute('style', styleString);

    // Recursively walk
    const cloneChildren = clone.children || [];
    const originalChildren = original.children || [];
    for (let i = 0; i < cloneChildren.length; i++) {
        if (cloneChildren[i].nodeType === 1 && originalChildren[i]) {
            applyAllComputedStylesDeep(cloneChildren[i], originalChildren[i], inheritedFontFamily);
        }
    }
}


/**
 * Ensures all <text> elements in the given SVG element tree have the given font family
 * as both an attribute and a style property.
 * @param {SVGSVGElement} svgElement - The root SVG element to process.
 * @param {string} fontFamily - The font family to set.
 */
function setFontFamilyOnAllSvgTextElements(svgElement, fontFamily) {
    const textElements = svgElement.querySelectorAll('text');
    textElements.forEach(textEl => {
        textEl.setAttribute('font-family', fontFamily);
        textEl.style.fontFamily = fontFamily;
    });
}

/**
 * Encodes a Unicode string into base64, safe for use with non-Latin1 characters.
 * Uses TextEncoder for UTF-8 support.
 * @param {string} str - The Unicode string to encode.
 * @returns {string} The base64-encoded string.
 */
function toBase64Unicode(str) {
    const utf8Bytes = new TextEncoder().encode(str);
    let binary = '';
    utf8Bytes.forEach(b => binary += String.fromCharCode(b));
    return btoa(binary);
}

/**
 * Rasterizes an SVG element to a PNG data URL at a given size.
 * @param {SVGElement} svgEl - The SVG element to convert.
 * @param {number} width - The desired output width in pixels.
 * @param {number} height - The desired output height in pixels.
 * @returns {Promise<string>} Resolves to a PNG data URL of the SVG at the requested size.
 */
function svgElementToPngDataUrl(svgEl, width, height) {
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgEl);
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const base64 = window.btoa(unescape(encodeURIComponent(svgString)));
    const img = new window.Image();
    img.src = `data:image/svg+xml;base64,${base64}`;
    return new Promise((resolve, reject) => {
        img.onload = function () {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/png", 1.0));
        };
        img.onerror = err => reject(err);
    });
}

/**
 * Recursively applies all computed styles as inline styles on an SVG element and its descendants.
 * @param {SVGElement} svgEl - The SVG element to process.
 */
function applyAllSvgComputedStylesInline(svgEl) {
    if (svgEl.nodeType !== 1) return;

    const computedStyle = window.getComputedStyle(svgEl);
    let styleString = '';
    for (let i = 0; i < computedStyle.length; i++) {
        const property = computedStyle[i];
        styleString += `${property}:${computedStyle.getPropertyValue(property)};`;
    }
    svgEl.setAttribute('style', styleString);

    for (let i = 0; i < svgEl.children.length; i++) {
        applyAllSvgComputedStylesInline(svgEl.children[i]);
    }
}

/**
 * Extracts all @font-face rules from same-origin stylesheets in the current document.
 * Handles cross-origin stylesheets gracefully.
 * @returns {string[]} An array of CSS strings representing @font-face rules.
 */
function extractFontFaceRules() {
    const fontCssRules = [];
    for (const sheet of document.styleSheets) {
        try {
            const rules = sheet.cssRules;
            if (!rules) continue;
            for (const rule of rules) {
                if (
                    (typeof CSSFontFaceRule !== "undefined" && rule instanceof CSSFontFaceRule) ||
                    rule.cssText.trim().startsWith("@font-face")
                ) {
                    fontCssRules.push(rule.cssText);
                }
            }
        } catch {
            // Skip stylesheets from other origins
            continue;
        }
    }
    return fontCssRules;
}


/**
 * Injects all @font-face CSS rules into an SVG element as an embedded <style> tag within <defs>.
 * This ensures custom fonts are preserved when the SVG is exported or rasterized.
 *
 * @param {SVGSVGElement} svgEl - The SVG element to inject font-face styles into.
 */
function injectFontFaceStyles(svgEl) {
    const fontRules = extractFontFaceRules();
    if (!fontRules.length) return;
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.textContent = fontRules.join('\n');
    const defs = svgEl.querySelector('defs') || document.createElementNS(XMLNS, 'defs');
    defs.appendChild(style);
    if (!svgEl.querySelector('defs')) {
        svgEl.insertBefore(defs, svgEl.firstChild);
    }
}

/**
 * Recursively inlines all computed styles from the live DOM into the corresponding elements
 * within each <foreignObject> in a cloned SVG tree.
 * This is used to preserve appearance for HTML content inside SVG exports.
 *
 * @param {SVGSVGElement} cloneSvg - The cloned SVG element containing <foreignObject> nodes to style.
 * @param {SVGSVGElement} liveSvg - The original live SVG element to read computed styles from.
 */
function inlineForeignObjectStylesInClone(cloneSvg, liveSvg) {
    const cloneFOs = cloneSvg.querySelectorAll('foreignObject');
    const liveFOs = liveSvg.querySelectorAll('foreignObject');

    cloneFOs.forEach((cloneFO, foIdx) => {
        const liveFO = liveFOs[foIdx];
        if (!liveFO) return;

        function applyStylesRecursively(cloneNode, liveNode) {
            if (!cloneNode || !liveNode) return;
            if (cloneNode.nodeType === 1 && liveNode.nodeType === 1) {
                const computedStyle = window.getComputedStyle(liveNode);
                let styleString = '';
                for (let j = 0; j < computedStyle.length; j++) {
                    const property = computedStyle[j];
                    styleString += `${property}:${computedStyle.getPropertyValue(property)};`;
                }
                cloneNode.setAttribute('style', styleString);
            }
            const cloneChildren = cloneNode.children || [];
            const liveChildren = liveNode.children || [];
            for (let i = 0; i < cloneChildren.length; i++) {
                applyStylesRecursively(cloneChildren[i], liveChildren[i]);
            }
        }

        applyStylesRecursively(cloneFO, liveFO);
    });
}

/**
 * Injects critical CSS style rules used by HTML nodes inside each <foreignObject> of the cloned SVG.
 * This collects all matching CSS rules from same-origin stylesheets and inserts them
 * as <style> tags inside the relevant <foreignObject> nodes.
 *
 * @param {SVGSVGElement} cloneSvg - The cloned SVG element containing <foreignObject> nodes.
 */
function injectCriticalStylesIntoForeignObjects(cloneSvg) {
    const foreignObjects = cloneSvg.querySelectorAll('foreignObject');
    foreignObjects.forEach(fo => {
        let css = '';
        const elements = Array.from(fo.querySelectorAll('*'));
        if (elements.length === 0) return;

        for (const sheet of document.styleSheets) {
            let rules;
            try { rules = sheet.cssRules; } catch { continue; }
            if (!rules) continue;
            for (const rule of rules) {
                if (typeof CSSStyleRule !== "undefined" && !(rule instanceof CSSStyleRule)) continue;
                try {
                    // Only include if any element matches this selector
                    if (elements.some(el => el.matches(rule.selectorText))) {
                        css += rule.cssText + "\n";
                    }
                } catch { continue; }
            }
        }
        if (css) {
            const styleTag = document.createElement('style');
            styleTag.textContent = css;
            fo.insertBefore(styleTag, fo.firstChild);
        }
    });
}

/**
 * Ensures the correct HTML namespace is set on the root element of each <foreignObject> within an SVG.
 * Adds xmlns="http://www.w3.org/1999/xhtml" to the root HTML node if not present.
 *
 * @param {SVGSVGElement} cloneSvg - The cloned SVG element containing <foreignObject> nodes.
 */
function ensureForeignObjectRootNamespace(cloneSvg) {
    const foreignObjects = cloneSvg.querySelectorAll('foreignObject');
    foreignObjects.forEach(fo => {
        const root = fo.firstElementChild;
        if (root && root.tagName.toLowerCase() !== 'svg') {
            root.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
        }
    });
}

/**
 * Recursively applies all computed styles from the live DOM into the corresponding HTML elements
 * inside <foreignObject> nodes in the cloned SVG, ensuring visual fidelity.
 *
 * @param {SVGSVGElement} cloneSvg - The cloned SVG element containing <foreignObject> nodes.
 * @param {SVGSVGElement} liveSvg - The original SVG element to read computed styles from.
 */
function inlineForeignObjectHTMLComputedStyles(cloneSvg, liveSvg) {
    const cloneFOs = cloneSvg.querySelectorAll('foreignObject');
    const liveFOs = liveSvg.querySelectorAll('foreignObject');
    cloneFOs.forEach((cloneFO, idx) => {
        const liveFO = liveFOs[idx];
        if (!cloneFO || !liveFO) return;
        const cloneRoot = cloneFO.firstElementChild;
        const liveRoot = liveFO.firstElementChild;
        if (cloneRoot && liveRoot) {
            walkAllAndApply(cloneRoot, liveRoot);
        }
    });
}

/**
 * Recursively walks two parallel DOM trees, applying all computed styles from the live node
 * to the cloned node and all of their descendants.
 *
 * @param {Element} cloneNode - The cloned DOM node to apply styles to.
 * @param {Element} liveNode - The live DOM node to read computed styles from.
 */
function walkAllAndApply(cloneNode, liveNode) {
    if (cloneNode.nodeType !== 1 || !liveNode) return;
    applyAllComputedStylesDeep(cloneNode, liveNode);
    const cloneChildren = cloneNode.children || [];
    const liveChildren = liveNode.children || [];
    for (let i = 0; i < cloneChildren.length; i++) {
        walkAllAndApply(cloneChildren[i], liveChildren[i]);
    }
}


/**
 * Converts a DOM element (including HTML, SVG, and canvas) into a high-resolution PNG data URL.
 *
 * Features:
 * - Clones the container DOM tree and inlines all computed styles.
 * - Rasterizes `<canvas>` elements and replaces them with `<img>` to preserve their content.
 * - Finds `<svg aria-label>` charts, rasterizes them separately to PNG, and swaps them in for pixel-perfect results.
 * - Inlines all images as base64 to prevent CORS/tainting issues.
 * - Injects all available @font-face definitions into the output to preserve custom fonts.
 * - Automatically falls back to "Helvetica" if the container's font is unavailable or not specified.
 * - Supports scaling for high-DPI exports (e.g., retina).
 *
 * @param {Object} params - Parameters for PNG export.
 * @param {HTMLElement} params.container - The DOM element to export. Should contain HTML, SVG, or canvas content.
 * @param {number} [params.scale=2] - Scaling factor for higher resolution output (e.g., 2 for retina). Default is 2.
 *
 * @returns {Promise<string>} Resolves to a PNG data URL of the rendered container.
 *
 * @example
 * const dataUrl = await domToPng({ container: document.getElementById('chart'), scale: 2 });
 * const img = new Image();
 * img.src = dataUrl;
 * document.body.appendChild(img);
 *
 * @throws {Error} If container is not provided or rendering fails.
 */
async function domToPng({ container, scale = 2 }) {
    if (!container) throw new Error("No container provided");

    await document.fonts.ready;
    let containerFontFamily = window.getComputedStyle(container).fontFamily || 'Helvetica';
    if (!containerFontFamily.toLowerCase().includes('helvetica')) {
        containerFontFamily += ', Helvetica';
    }

    const clone = container.cloneNode(true);

    const cloneCanvasList = clone.querySelectorAll('canvas');
    const originalCanvasList = container.querySelectorAll('canvas');
    for (let i = 0; i < originalCanvasList.length; i += 1) {
        const originalCanvas = originalCanvasList[i];
        const cloneCanvas = cloneCanvasList[i];
        if (originalCanvas && cloneCanvas) {
            const img = document.createElement('img');
            img.src = originalCanvas.toDataURL('image/png');
            img.width = originalCanvas.width;
            img.height = originalCanvas.height;
            img.style.width = originalCanvas.style.width || originalCanvas.width + 'px';
            img.style.height = originalCanvas.style.height || originalCanvas.height + 'px';
            cloneCanvas.replaceWith(img);
        }
    }

    const liveSvg = container.querySelector('svg[aria-label]');
    const cloneSvg = clone.querySelector('svg[aria-label]');
    if (liveSvg && cloneSvg) {
        ensureForeignObjectRootNamespace(cloneSvg);
        injectCriticalStylesIntoForeignObjects(cloneSvg);
        inlineForeignObjectStylesInClone(cloneSvg, liveSvg);
        inlineForeignObjectHTMLComputedStyles(cloneSvg, liveSvg);
        applyAllSvgComputedStylesInline(cloneSvg);
        setFontFamilyOnAllSvgTextElements(cloneSvg, containerFontFamily);

        const bbox = liveSvg.getBoundingClientRect();
        const svgWidth = bbox.width;
        const svgHeight = bbox.height;
        const scaledWidth = Math.round(svgWidth * scale);
        const scaledHeight = Math.round(svgHeight * scale);
        const pngDataUrl = await svgElementToPngDataUrl(cloneSvg, scaledWidth, scaledHeight);

        const img = document.createElement('img');
        img.src = pngDataUrl;
        img.width = svgWidth;
        img.height = svgHeight;
        img.style.width = svgWidth + "px";
        img.style.height = svgHeight + "px";
        cloneSvg.parentNode.replaceChild(img, cloneSvg);
    }

    applyAllComputedStylesDeep(clone, container, containerFontFamily);
    removeIgnoredElements(clone);
    await inlineAllImages(clone);

    const { width, height } = container.getBoundingClientRect();
    const exportWidth = Math.round(Math.max(clone.scrollWidth, width) * scale);
    const exportHeight = Math.round((Math.max(clone.scrollHeight, height) * 1.01) * scale);

    const temp_svg = document.createElementNS(XMLNS, 'svg');
    temp_svg.setAttribute('viewBox', `0 0 ${exportWidth} ${exportHeight}`);
    temp_svg.setAttribute('width', exportWidth);
    temp_svg.setAttribute('height', exportHeight);
    temp_svg.setAttribute('style', `font-family:${containerFontFamily};`);

    const fo = document.createElementNS(XMLNS, 'foreignObject');
    fo.setAttribute('x', 0);
    fo.setAttribute('y', 0);
    fo.setAttribute('width', exportWidth);
    fo.setAttribute('height', exportHeight);
    fo.setAttribute('style', `font-family:${containerFontFamily};`);

    clone.style.transform = `scale(${scale})`;
    clone.style.transformOrigin = "top left";
    clone.style.width = width + "px";
    clone.style.height = height + "px";
    clone.style.background = window.getComputedStyle(container).backgroundColor;

    fo.appendChild(clone);
    injectFontFaceStyles(temp_svg);
    temp_svg.appendChild(fo);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(temp_svg);
    const encodedData = toBase64Unicode(svgString);

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = `data:image/svg+xml;base64,${encodedData}`;

    return new Promise((resolve, reject) => {
        img.onload = function () {
            try {
                const canvas = document.createElement("canvas");
                canvas.width = exportWidth;
                canvas.height = exportHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
                resolve(canvas.toDataURL("image/png", 1.0));
            } catch (err) {
                reject("Failed to draw SVG on canvas: " + err);
            }
        };
        img.onerror = function () {
            reject("Failed to load SVG image for conversion");
        };
    });
}

export { domToPng, applyAllComputedStylesDeep };

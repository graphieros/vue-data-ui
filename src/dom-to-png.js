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
        if (el.parentNode) {
            el.parentNode.removeChild(el);
        }
    });
}

/**
 * Recursively applies all computed styles and existing inline styles as inline style attributes
 * on every element in the cloned DOM tree, including setting explicit width and height in pixels,
 * forcing overflow to visible, and enforcing a given font family.
 * @param {HTMLElement} clone - The cloned DOM element.
 * @param {HTMLElement} original - The original DOM element.
 * @param {string} [inheritedFontFamily] - Font family to apply (optional).
 */
function applyAllComputedStylesDeep(clone, original, inheritedFontFamily) {
    const computedStyle = window.getComputedStyle(original);
    let styleMap = {};

    let inlineStyle = clone.getAttribute('style');
    if (typeof inlineStyle !== 'string') inlineStyle = '';
    inlineStyle.split(';').forEach(s => {
        if (typeof s === 'string' && s.trim()) {
            const [prop, val] = s.split(':');
            if (prop && val !== undefined) styleMap[prop.trim()] = val.trim();
        }
    });

    for (let i = 0; i < computedStyle.length; i += 1) {
        const property = computedStyle[i];
        const value = computedStyle.getPropertyValue(property);
        styleMap[property] = value;
    }

    styleMap['overflow'] = 'visible';
    styleMap['overflow-x'] = 'visible';
    styleMap['overflow-y'] = 'visible';

    const rect = original.getBoundingClientRect();
    if (rect.width > 0) {
        styleMap['width'] = rect.width + 'px';
    }
    const realScrollHeight = Math.max(original.scrollHeight, rect.height);
    if (realScrollHeight > 0) {
        styleMap['height'] = realScrollHeight + 'px';
    }

    if (inheritedFontFamily) {
        styleMap['font-family'] = inheritedFontFamily;
    }

    let styleString = '';
    for (const prop in styleMap) {
        styleString += `${prop}:${styleMap[prop]};`;
    }
    clone.setAttribute('style', styleString);

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
 * 
 * - Serializes the provided SVG element to an XML string,
 * - Ensures the SVG has an explicit xmlns attribute,
 * - Renders the SVG as an <img> on a hidden canvas at the specified width/height,
 * - Returns a PNG data URL representing the rendered SVG.
 * 
 * @param {SVGElement} svgEl - The SVG element to convert.
 * @param {number} width - The desired output width in pixels.
 * @param {number} height - The desired output height in pixels.
 * @returns {Promise<string>} Resolves to a PNG data URL of the SVG at the requested size.
 * 
 * @example
 * const svg = document.querySelector('svg[aria-label]');
 * svgElementToPngDataUrl(svg, 800, 500).then(pngUrl => {
 *   // Use the PNG data URL, e.g. as an <img> src
 *   console.log(pngUrl);
 * });
 * 
 * @throws {Error} If image loading or canvas drawing fails.
 */
function svgElementToPngDataUrl(svgEl, width, height) {
    const serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgEl);
    if (!svgString.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    const base64 = window.btoa(unescape(encodeURIComponent(svgString)));
    const img = new window.Image();
    img.src = `data:image/svg+xml;base64,${base64}`;
    return new Promise((resolve, reject) => {
        img.onload = function() {
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
 * Exports a DOM container (including mixed HTML and SVG) to a high-resolution PNG data URL.
 * 
 * - Clones the given DOM container, inlines all computed styles and images,
 * - Converts the chart SVG (with aria-label) to a pixel-perfect PNG and swaps it in,
 * - Applies optional scaling for retina/high-DPI output,
 * - Serializes everything via <foreignObject> to preserve the on-screen layout,
 * - Renders to a final canvas and exports as a PNG data URL.
 * 
 * @param {Object} params - Export options.
 * @param {HTMLElement} params.container - The DOM element to export (must contain the chart SVG).
 * @param {number} [params.scale=2] - Optional resolution scale factor (e.g., 2 for retina). Default is 2.
 * @returns {Promise<string>} Resolves to a PNG data URL representing the rendered container at the requested scale.
 * 
 * @example
 * domToPng({ container: document.getElementById('chart-root'), scale: 2 })
 *   .then(dataUrl => {
 *     // Use the PNG data URL (e.g., for download or <img> src)
 *     console.log(dataUrl);
 *   });
 * 
 * @throws {Error} If the container is missing or chart SVG is not found.
 */
async function domToPng({ container, scale = 2 }) {
    if (!container) throw new Error("No container provided");

    await document.fonts.ready;
    const containerFontFamily = window.getComputedStyle(container).fontFamily;
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
    if (liveSvg) {
        const bbox = liveSvg.getBoundingClientRect();
        const svgWidth = bbox.width;
        const svgHeight = bbox.height;

        applyAllSvgComputedStylesInline(liveSvg);
        setFontFamilyOnAllSvgTextElements(liveSvg, containerFontFamily);

        const scaledWidth = Math.round(svgWidth * scale);
        const scaledHeight = Math.round(svgHeight * scale);
        const pngDataUrl = await svgElementToPngDataUrl(liveSvg, scaledWidth, scaledHeight);

        const cloneSvg = clone.querySelector('svg[aria-label]');
        if (cloneSvg) {
            const img = document.createElement('img');
            img.src = pngDataUrl;
            img.width = svgWidth;
            img.height = svgHeight;
            img.style.width = svgWidth + "px";
            img.style.height = svgHeight + "px";
            cloneSvg.parentNode.replaceChild(img, cloneSvg);
        }
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
    temp_svg.appendChild(fo);

    const serializer = new XMLSerializer().serializeToString(temp_svg);
    const encodedData = toBase64Unicode(serializer);

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
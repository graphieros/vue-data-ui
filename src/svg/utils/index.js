import {
    createPolygonPath,
    createStar,
    escapeXmlAttr,
    escapeXml,
} from '../../lib';

export function safeNumber(value, fallback = 0) {
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : fallback;
}

export function safeArray(value) {
    return Array.isArray(value) ? value : [];
}

export function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
}

export function element(name, attributes = {}, content = '') {
    const renderedAttributes = Object.entries(attributes)
        .filter(
            ([, value]) =>
                value !== undefined && value !== null && value !== false,
        )
        .map(([key, value]) => `${key}="${escapeXmlAttr(value)}"`)
        .join(' ');

    return `<${name}${renderedAttributes ? ` ${renderedAttributes}` : ''}>${content}</${name}>`;
}

export function emptyElement(name, attributes = {}) {
    const renderedAttributes = Object.entries(attributes)
        .filter(
            ([, value]) =>
                value !== undefined && value !== null && value !== false,
        )
        .map(([key, value]) => `${key}="${escapeXmlAttr(value)}"`)
        .join(' ');

    return `<${name}${renderedAttributes ? ` ${renderedAttributes}` : ''}/>`;
}

export function textElement(value, attributes = {}) {
    return element('text', attributes, escapeXml(value ?? ''));
}

export function getSupportedShape(shape) {
    return [
        'triangle',
        'square',
        'diamond',
        'pentagon',
        'hexagon',
        'star',
    ].includes(shape)
        ? shape
        : 'circle';
}

export function renderShape({
    dataCy,
    shape,
    plot,
    radius,
    fill,
    stroke,
    strokeWidth,
}) {
    const finalShape = getSupportedShape(shape);
    const x = safeNumber(plot.x, 0);
    const y = safeNumber(plot.y, 0);
    const r = safeNumber(radius, 4);

    if (finalShape === 'circle') {
        return emptyElement('circle', {
            'data-cy': dataCy,
            cx: x,
            cy: y,
            r,
            fill,
            stroke,
            'stroke-width': strokeWidth,
        });
    }

    if (finalShape === 'star') {
        return emptyElement('polygon', {
            'data-cy': dataCy,
            points: createStar({ plot: { x, y }, radius: r }),
            fill,
            stroke,
            'stroke-width': strokeWidth,
        });
    }

    const shapeOptions = {
        triangle: { sides: 3, rotation: 0.52 },
        square: { sides: 4, rotation: 0.8 },
        diamond: { sides: 4, rotation: 0 },
        pentagon: { sides: 5, rotation: 0.95 },
        hexagon: { sides: 6, rotation: 0 },
    };

    const options = shapeOptions[finalShape];

    return emptyElement('path', {
        'data-cy': dataCy,
        d: createPolygonPath({
            plot: { x, y },
            radius: r,
            sides: options.sides,
            rotation: options.rotation,
        }).path,
        fill,
        stroke,
        'stroke-width': strokeWidth,
    });
}

export function getConfigValue(source, path, fallback) {
    let current = source;
    for (const key of path.split('.')) {
        if (!current || typeof current !== 'object' || !(key in current)) {
            return fallback;
        }
        current = current[key];
    }
    return current ?? fallback;
}

export function estimateTextWidth(text, fontSize) {
    return String(text ?? '').length * fontSize * 0.58;
}

/**
 * Generates a deterministic 32-bit unsigned integer hash from a string.
 *
 * This function is based on the FNV-1a hashing algorithm. It is used to
 * transform any string input into a stable numeric seed suitable for
 * deterministic pseudo-random number generation.
 *
 * The same input string will always produce the same output number.
 *
 * @param value - The input string to hash.
 * @returns A 32-bit unsigned integer hash.
 */
export function createSeedNumber(value) {
    const normalizedValue = String(value ?? '');
    let hashValue = 2166136261;

    for (let index = 0; index < normalizedValue.length; index += 1) {
        hashValue ^= normalizedValue.charCodeAt(index);
        hashValue = Math.imul(hashValue, 16777619);
    }

    return hashValue >>> 0;
}

/**
 * Creates a deterministic pseudo-random number generator based on a numeric seed.
 *
 * @param seedNumber - 32 bit integer seed
 * @returns A function that returns a pseudo random number between 0 (inclusive) and 1 (exclusive).
 */
function createDeterministicRandomGenerator(seedNumber) {
    let state = (Number.isFinite(seedNumber) ? seedNumber : 0) >>> 0;

    return function generateRandomNumber() {
        state += 0x6d2b79f5;
        let intermediateValue = state;

        intermediateValue = Math.imul(
            intermediateValue ^ (intermediateValue >>> 15),
            intermediateValue | 1,
        );

        intermediateValue ^=
            intermediateValue +
            Math.imul(
                intermediateValue ^ (intermediateValue >>> 7),
                intermediateValue | 61,
            );

        return (
            ((intermediateValue ^ (intermediateValue >>> 14)) >>> 0) /
            4294967296
        );
    };
}

function pickValue(values, generateRandomNumber, fallbackValue) {
    if (!Array.isArray(values) || values.length === 0) {
        console.error(
            'VueUiPatternSeed - pickValue requires a non-empty array',
        );
        return fallbackValue;
    }

    const randomValue =
        typeof generateRandomNumber === 'function' ? generateRandomNumber() : 0;

    const selectedIndex = Math.floor(randomValue * values.length);
    const selectedValue = values[selectedIndex];

    if (selectedValue === undefined) {
        console.error('VueUiPatternSeed - pickValue selected an invalid index');
        return fallbackValue ?? values[0];
    }

    return selectedValue;
}

function escapeSvgAttribute(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function createLineElement(x1, y1, x2, y2, stroke, strokeWidth, opacity) {
    const safeStroke = escapeSvgAttribute(stroke);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${safeStroke}" stroke-width="${strokeWidth}" opacity="${opacity}" shape-rendering="crispEdges" stroke-linecap="round" stroke-linejoin="round" />`;
}

function createCircleElement(centerX, centerY, radius, fill, opacity) {
    const safeFill = escapeSvgAttribute(fill);
    return `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${safeFill}" opacity="${opacity}" />`;
}

function createPathElement(pathData, fill, stroke, strokeWidth, opacity) {
    const safeFill = escapeSvgAttribute(fill);
    const safeStroke = escapeSvgAttribute(stroke);
    return `<path d="${pathData}" fill="${safeFill}" stroke="${safeStroke}" stroke-width="${strokeWidth}" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round" />`;
}

function createRectangleElement(
    x,
    y,
    width,
    height,
    fill,
    opacity,
    rotation = 0,
    transformOriginX = x + width / 2,
    transformOriginY = y + height / 2,
) {
    const safeFill = escapeSvgAttribute(fill);
    const transform = rotation
        ? ` transform="rotate(${rotation} ${transformOriginX} ${transformOriginY})"`
        : '';
    return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${safeFill}" opacity="${opacity}"${transform} />`;
}

function createDiamondElement(centerX, centerY, size, fill, opacity) {
    const halfSize = size / 2;
    const pathData = [
        `M ${centerX} ${centerY - halfSize}`,
        `L ${centerX + halfSize} ${centerY}`,
        `L ${centerX} ${centerY + halfSize}`,
        `L ${centerX - halfSize} ${centerY}`,
        'Z',
    ].join(' ');
    return createPathElement(pathData, fill, 'none', 0, opacity);
}

function clampPatternSize(value, fallbackValue) {
    return Number.isFinite(value) && value > 0 ? value : fallbackValue;
}

function normalizePatternSizeRange(minimumSize, maximumSize) {
    let safeMinimumSize = clampPatternSize(minimumSize, 8);
    let safeMaximumSize = clampPatternSize(maximumSize, 20);

    if (safeMinimumSize > safeMaximumSize) {
        const swapValue = safeMinimumSize;
        safeMinimumSize = safeMaximumSize;
        safeMaximumSize = swapValue;
    }

    return {
        minimumSize: safeMinimumSize,
        maximumSize: safeMaximumSize,
    };
}

function createDotsPatternMarkup(
    tileSize,
    foregroundColor,
    opacity,
    generateRandomNumber,
) {
    const radius = pickValue(
        [tileSize * 0.08, tileSize * 0.1, tileSize * 0.12],
        generateRandomNumber,
        tileSize * 0.1,
    );

    const layoutVariant = pickValue(
        ['grid', 'offsetGrid', 'corners', 'centered'],
        generateRandomNumber,
        'grid',
    );

    switch (layoutVariant) {
        case 'offsetGrid':
            return [
                createCircleElement(
                    tileSize * 0.25,
                    tileSize * 0.25,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.75,
                    tileSize * 0.25,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.5,
                    tileSize * 0.5,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.25,
                    tileSize * 0.75,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.75,
                    tileSize * 0.75,
                    radius,
                    foregroundColor,
                    opacity,
                ),
            ].join('');

        case 'corners':
            return [
                createCircleElement(
                    tileSize * 0.2,
                    tileSize * 0.2,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.8,
                    tileSize * 0.2,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.2,
                    tileSize * 0.8,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.8,
                    tileSize * 0.8,
                    radius,
                    foregroundColor,
                    opacity,
                ),
            ].join('');

        case 'centered':
            return [
                createCircleElement(
                    tileSize * 0.5,
                    tileSize * 0.2,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.2,
                    tileSize * 0.5,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.5,
                    tileSize * 0.5,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.8,
                    tileSize * 0.5,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.5,
                    tileSize * 0.8,
                    radius,
                    foregroundColor,
                    opacity,
                ),
            ].join('');

        case 'grid':
        default:
            return [
                createCircleElement(
                    tileSize * 0.25,
                    tileSize * 0.25,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.75,
                    tileSize * 0.25,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.25,
                    tileSize * 0.75,
                    radius,
                    foregroundColor,
                    opacity,
                ),
                createCircleElement(
                    tileSize * 0.75,
                    tileSize * 0.75,
                    radius,
                    foregroundColor,
                    opacity,
                ),
            ].join('');
    }
}

function createLinePatternMarkup(
    tileSize,
    foregroundColor,
    strokeWidth,
    opacity,
    generateRandomNumber,
) {
    const lineFamily = pickValue(
        ['diagonal', 'vertical', 'horizontal', 'crosshatch', 'grid'],
        generateRandomNumber,
        'diagonal',
    );

    const spacing = pickValue(
        [tileSize * 0.28, tileSize * 0.33, tileSize * 0.4, tileSize * 0.5],
        generateRandomNumber,
        tileSize * 0.33,
    );

    switch (lineFamily) {
        case 'vertical': {
            const positions = [0, spacing, spacing * 2];
            return positions
                .map((positionX) =>
                    createLineElement(
                        positionX,
                        0,
                        positionX,
                        tileSize,
                        foregroundColor,
                        strokeWidth,
                        opacity,
                    ),
                )
                .join('');
        }

        case 'horizontal': {
            const positions = [0, spacing, spacing * 2];
            return positions
                .map((positionY) =>
                    createLineElement(
                        0,
                        positionY,
                        tileSize,
                        positionY,
                        foregroundColor,
                        strokeWidth,
                        opacity,
                    ),
                )
                .join('');
        }

        case 'crosshatch':
            return [
                createLineElement(
                    -tileSize,
                    tileSize,
                    tileSize,
                    -tileSize,
                    foregroundColor,
                    strokeWidth,
                    opacity,
                ),
                createLineElement(
                    0,
                    tileSize,
                    tileSize,
                    0,
                    foregroundColor,
                    strokeWidth,
                    opacity,
                ),
                createLineElement(
                    0,
                    0,
                    tileSize,
                    tileSize,
                    foregroundColor,
                    strokeWidth,
                    opacity * 0.8,
                ),
                createLineElement(
                    tileSize,
                    0,
                    0,
                    tileSize,
                    foregroundColor,
                    strokeWidth * 0.8,
                    opacity * 0.8,
                ),
            ].join('');

        case 'grid':
            return [
                createLineElement(
                    tileSize * 0.5,
                    0,
                    tileSize * 0.5,
                    tileSize,
                    foregroundColor,
                    strokeWidth,
                    opacity,
                ),
                createLineElement(
                    0,
                    tileSize * 0.5,
                    tileSize,
                    tileSize * 0.5,
                    foregroundColor,
                    strokeWidth,
                    opacity,
                ),
            ].join('');

        case 'diagonal':
        default:
            return [
                createLineElement(
                    -tileSize,
                    tileSize,
                    tileSize,
                    -tileSize,
                    foregroundColor,
                    strokeWidth,
                    opacity,
                ),
                createLineElement(
                    0,
                    tileSize,
                    tileSize,
                    0,
                    foregroundColor,
                    strokeWidth,
                    opacity,
                ),
                createLineElement(
                    0,
                    tileSize * 2,
                    tileSize * 2,
                    0,
                    foregroundColor,
                    strokeWidth,
                    opacity,
                ),
            ].join('');
    }
}

function createShapePatternMarkup(
    tileSize,
    foregroundColor,
    opacity,
    generateRandomNumber,
) {
    const shapeFamily = pickValue(
        ['diamonds', 'squares', 'mixed'],
        generateRandomNumber,
        'diamonds',
    );

    const shapeSize = pickValue(
        [tileSize * 0.16, tileSize * 0.2, tileSize * 0.24],
        generateRandomNumber,
        tileSize * 0.2,
    );

    switch (shapeFamily) {
        case 'squares':
            return [
                createRectangleElement(
                    tileSize * 0.2,
                    tileSize * 0.2,
                    shapeSize,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
                createRectangleElement(
                    tileSize * 0.65,
                    tileSize * 0.2,
                    shapeSize,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
                createRectangleElement(
                    tileSize * 0.2,
                    tileSize * 0.65,
                    shapeSize,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
                createRectangleElement(
                    tileSize * 0.65,
                    tileSize * 0.65,
                    shapeSize,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
            ].join('');

        case 'mixed':
            return [
                createDiamondElement(
                    tileSize * 0.3,
                    tileSize * 0.3,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
                createRectangleElement(
                    tileSize * 0.6,
                    tileSize * 0.2,
                    shapeSize,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
                createDiamondElement(
                    tileSize * 0.7,
                    tileSize * 0.7,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
            ].join('');

        case 'diamonds':
        default:
            return [
                createDiamondElement(
                    tileSize * 0.25,
                    tileSize * 0.25,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
                createDiamondElement(
                    tileSize * 0.75,
                    tileSize * 0.25,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
                createDiamondElement(
                    tileSize * 0.25,
                    tileSize * 0.75,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
                createDiamondElement(
                    tileSize * 0.75,
                    tileSize * 0.75,
                    shapeSize,
                    foregroundColor,
                    opacity,
                ),
            ].join('');
    }
}

function createAccentPatternMarkup(
    tileSize,
    foregroundColor,
    generateRandomNumber,
) {
    const useAccentLayer = pickValue(
        [true, false, false],
        generateRandomNumber,
        false,
    );

    if (!useAccentLayer) {
        return '';
    }

    const accentFamily = pickValue(
        ['singleDot', 'cornerDiamond', 'softBand'],
        generateRandomNumber,
        'singleDot',
    );

    const accentOpacity = pickValue(
        [0.12, 0.16, 0.2],
        generateRandomNumber,
        0.16,
    );

    switch (accentFamily) {
        case 'cornerDiamond':
            return createDiamondElement(
                tileSize * 0.5,
                tileSize * 0.5,
                tileSize * 0.3,
                foregroundColor,
                accentOpacity,
            );

        case 'softBand':
            return createRectangleElement(
                0,
                tileSize * 0.4,
                tileSize,
                tileSize * 0.2,
                foregroundColor,
                accentOpacity,
            );

        case 'singleDot':
        default:
            return createCircleElement(
                tileSize * 0.5,
                tileSize * 0.5,
                tileSize * 0.12,
                foregroundColor,
                accentOpacity,
            );
    }
}

function createPrettyPatternMarkup(
    tileSize,
    foregroundColor,
    generateRandomNumber,
) {
    const strokeWidth = pickValue(
        [1, 1.25, 1.5, 1.75],
        generateRandomNumber,
        1.25,
    );

    const baseOpacity = pickValue(
        [0.4, 0.5, 0.6, 0.7],
        generateRandomNumber,
        0.5,
    );

    const primaryFamily = pickValue(
        ['lines', 'dots', 'shapes'],
        generateRandomNumber,
        'lines',
    );

    let primaryMarkup = '';

    if (primaryFamily === 'lines') {
        primaryMarkup = createLinePatternMarkup(
            tileSize,
            foregroundColor,
            strokeWidth,
            baseOpacity,
            generateRandomNumber,
        );
    } else if (primaryFamily === 'dots') {
        primaryMarkup = createDotsPatternMarkup(
            tileSize,
            foregroundColor,
            baseOpacity,
            generateRandomNumber,
        );
    } else {
        primaryMarkup = createShapePatternMarkup(
            tileSize,
            foregroundColor,
            baseOpacity,
            generateRandomNumber,
        );
    }

    const accentMarkup = createAccentPatternMarkup(
        tileSize,
        foregroundColor,
        generateRandomNumber,
    );

    return `${primaryMarkup}${accentMarkup}`;
}

export function createSeededSvgPattern(seed, options = {}) {
    try {
        const disambiguator = options?.disambiguator ?? '';
        const normalizedSeed = `${String(seed ?? '')}::${String(disambiguator)}`;
        const foregroundColor = options?.foregroundColor ?? '#111111';
        const backgroundColor = options?.backgroundColor ?? 'transparent';

        const { minimumSize, maximumSize } = normalizePatternSizeRange(
            options?.minimumSize,
            options?.maximumSize,
        );

        const seedNumber = createSeedNumber(normalizedSeed);
        const generateRandomNumber =
            createDeterministicRandomGenerator(seedNumber);

        const availableSizes = [];
        for (let size = minimumSize; size <= maximumSize; size += 2) {
            availableSizes.push(size);
        }

        const tileSize = pickValue(
            availableSizes.length > 0 ? availableSizes : [8],
            generateRandomNumber,
            8,
        );

        const rotation = pickValue(
            [0, 0, 0, 15, 30, 45, 60, 90],
            generateRandomNumber,
            0,
        );

        const contentParts = [];

        if (backgroundColor !== 'transparent') {
            const safeBackgroundColor = escapeSvgAttribute(backgroundColor);
            contentParts.push(
                `<rect x="0" y="0" width="${tileSize}" height="${tileSize}" fill="${safeBackgroundColor}" />`,
            );
        }

        contentParts.push(
            createPrettyPatternMarkup(
                tileSize,
                foregroundColor,
                generateRandomNumber,
            ),
        );

        return {
            width: tileSize,
            height: tileSize,
            rotation,
            patternType: 'prettyUniquePattern',
            contentMarkup: contentParts.join(''),
        };
    } catch (error) {
        console.error(
            'VueUiPatternSeed - Failed to create seeded SVG pattern',
            error,
        );

        return {
            width: 8,
            height: 8,
            rotation: 0,
            patternType: 'prettyUniquePattern',
            contentMarkup: '',
        };
    }
}

// Equivalent of the PatternSlot.vue component, to be used inside tooltip.customFormat in chart configs
export function createPatternDef({
    id,
    seed,
    foregroundColor,
    backgroundColor,
    maxSize,
    minSize,
    disambiguator,
}) {
    try {
        const pattern = createSeededSvgPattern(seed, {
            foregroundColor: foregroundColor ?? '#1A1A1A',
            backgroundColor: backgroundColor ?? 'transparent',
            minimumSize: minSize,
            maximumSize: maxSize,
            disambiguator,
        });

        return `<defs><pattern id="${escapeSvgAttribute(id)}" patternUnits="userSpaceOnUse" width="${pattern.width}" height="${pattern.height}" patternTransform="rotate(${pattern.rotation})">${pattern.contentMarkup}</pattern></defs>`;
    } catch (error) {
        console.error(
            'VueUiPatternSeed - Failed to create chart pattern slot markup',
            error,
        );
        return `<defs><pattern id="${escapeSvgAttribute(id)}" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(0)"></pattern></defs>`;
    }
}

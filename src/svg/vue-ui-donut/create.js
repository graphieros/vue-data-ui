import {
    convertColorToHex,
    dataLabel,
    palette,
    themePalettes,
    treeShake,
} from '../../lib.js';

import { useConfig } from '../../useConfig.js';
import themes from '../../themes/vue_ui_donut.json';

const { vue_ui_donut: DEFAULT_CONFIG } = useConfig();

function prepareConfig({ config = {} } = {}) {
    const userConfig = config ?? {};

    const mergedConfig = treeShake({
        userConfig,
        defaultConfig: DEFAULT_CONFIG,
    });

    const theme = mergedConfig.theme;

    if (!theme) {
        return {
            ...mergedConfig,
            customPalette: mergedConfig.customPalette?.length
                ? mergedConfig.customPalette
                : palette,
        };
    }

    const themedConfig = treeShake({
        userConfig: themes[theme] || {},
        defaultConfig: mergedConfig,
    });

    const finalConfig = treeShake({
        userConfig,
        defaultConfig: themedConfig,
    });

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette?.length
            ? finalConfig.customPalette
            : themePalettes[theme] || palette,
    };
}

function safeNumber(value, fallback = 0) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
}

function getConfigValue(source, path, fallback) {
    return (
        String(path)
            .split('.')
            .reduce(
                (currentValue, key) =>
                    currentValue && currentValue[key] !== undefined
                        ? currentValue[key]
                        : undefined,
                source,
            ) ?? fallback
    );
}

function getSerieValue(serie) {
    if (serie == null || typeof serie !== 'object') {
        return 0;
    }

    if (Array.isArray(serie.values)) {
        return serie.values.reduce(
            (sum, value) => sum + safeNumber(value, 0),
            0,
        );
    }

    if (Array.isArray(serie.series)) {
        return serie.series.reduce(
            (sum, value) => sum + safeNumber(value, 0),
            0,
        );
    }

    return safeNumber(serie.value ?? serie.y ?? 0, 0);
}

function getSerieName(serie, index) {
    return String(serie?.name ?? serie?.label ?? `Serie ${index + 1}`);
}

function normalizeDataset(dataset = [], config) {
    const activePalette = Array.isArray(config.customPalette)
        ? config.customPalette
        : palette;

    return (Array.isArray(dataset) ? dataset : [])
        .map((serie, sourceIndex) => ({
            source: serie,
            sourceIndex,
            value: getSerieValue(serie),
        }))
        .filter((entry) => Number.isFinite(entry.value))
        .sort((entryA, entryB) => {
            if (entryA.source?.ghost && !entryB.source?.ghost) return 1;
            if (entryB.source?.ghost && !entryA.source?.ghost) return -1;

            return entryB.value - entryA.value;
        })
        .map((entry, serieIndex) => {
            const serie = entry.source;
            const value = entry.value;
            const color =
                (serie?.color ? convertColorToHex(serie.color) : '') ||
                activePalette[serieIndex % activePalette.length];

            return {
                ...serie,
                id: serie?.id ?? `donut_serie_${serieIndex}`,
                name: getSerieName(serie, serieIndex),
                value,
                absoluteValue: Math.abs(value),
                absoluteValues: Array.isArray(serie?.values)
                    ? serie.values
                    : [value],
                color,
                index: serieIndex,
                sourceIndex: entry.sourceIndex,
                patternIndex: serie?.patternIndex ?? serieIndex,
                seriesIndex: serie?.seriesIndex ?? serieIndex,
                ghost: Boolean(serie?.ghost),
            };
        })
        .filter((serie) => Number.isFinite(serie.absoluteValue));
}
function getTotal(series) {
    return series.reduce((sum, serie) => sum + serie.absoluteValue, 0);
}

function buildArcs({ series, total, startAngle = -90 }) {
    let cursor = startAngle;

    return series.map((serie) => {
        const ratio = total ? serie.absoluteValue / total : 0;
        const angle = ratio * 360;
        const startAngle = cursor;
        const endAngle = cursor + angle;
        cursor = endAngle;

        return {
            ...serie,
            ratio,
            percentage: ratio * 100,
            startAngle,
            endAngle,
            midAngle: startAngle + angle / 2,
        };
    });
}

export function createVueUiDonutState({
    dataset = [],
    config = {},
    width = 512,
    height = 512,
    additionalSvgContent = '',
    svgTitle = '',
} = {}) {
    const finalConfig = prepareConfig({ config });
    const series = normalizeDataset(dataset, finalConfig);
    const total = getTotal(series);

    const padding = {
        top: safeNumber(
            getConfigValue(finalConfig, 'chart.padding.top', 24),
            24,
        ),
        right: safeNumber(
            getConfigValue(finalConfig, 'chart.padding.right', 24),
            24,
        ),
        bottom: safeNumber(
            getConfigValue(finalConfig, 'chart.padding.bottom', 24),
            24,
        ),
        left: safeNumber(
            getConfigValue(finalConfig, 'chart.padding.left', 24),
            24,
        ),
    };

    const drawingArea = {
        top: padding.top,
        left: padding.left,
        right: width - padding.right,
        bottom: height - padding.bottom,
    };

    drawingArea.width = Math.max(1, drawingArea.right - drawingArea.left);
    drawingArea.height = Math.max(1, drawingArea.bottom - drawingArea.top);

    const center = {
        x: drawingArea.left + drawingArea.width / 2,
        y: drawingArea.top + drawingArea.height / 2,
    };

    const radius = Math.max(
        1,
        Math.min(drawingArea.width, drawingArea.height) / 2,
    );
    const donutRadius = safeNumber(
        getConfigValue(finalConfig, 'chart.donut.radius', radius),
        radius,
    );
    const donutHoleRatio = safeNumber(
        getConfigValue(finalConfig, 'chart.donut.holeRatio', 0.5),
        0.5,
    );
    const innerRadius = Math.max(
        0,
        Math.min(donutRadius - 1, donutRadius * donutHoleRatio),
    );

    const arcs = buildArcs({
        series,
        total,
        startAngle: safeNumber(
            getConfigValue(finalConfig, 'chart.donut.startAngle', -90),
            -90,
        ),
    });

    return {
        width,
        height,
        dataset,
        config: finalConfig,
        drawingArea,
        center,
        radius: donutRadius,
        innerRadius,
        total,
        series: arcs,
        additionalSvgContent,
        svgTitle,
    };
}

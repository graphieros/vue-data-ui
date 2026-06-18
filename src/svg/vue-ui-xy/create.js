import {
    calculateNiceScale,
    createStraightPath,
    createSmoothPath,
    dataLabel,
    escapeXml,
    escapeXmlAttr,
    palette,
    treeShake,
    themePalettes,
    hasDeepProperty,
    convertColorToHex,
} from '../../lib.js';

import { useConfig } from '../../useConfig.js';
import themes from '../../themes/vue_ui_xy.json';

const { vue_ui_xy: DEFAULT_CONFIG } = useConfig();

function prepareConfig({ config = {}, dataset = [] } = {}) {
    const userConfig = config ?? {};

    const mergedConfig = treeShake({
        userConfig,
        defaultConfig: DEFAULT_CONFIG,
    });

    if (hasDeepProperty(userConfig, 'chart.highlightArea')) {
        if (Array.isArray(userConfig.chart.highlightArea)) {
            mergedConfig.chart.highlightArea =
                userConfig.chart.highlightArea.map((highlightArea) =>
                    treeShake({
                        defaultConfig: DEFAULT_CONFIG.chart.highlightArea,
                        userConfig: highlightArea,
                    }),
                );
        } else {
            mergedConfig.chart.highlightArea = [
                treeShake({
                    defaultConfig: DEFAULT_CONFIG.chart.highlightArea,
                    userConfig: userConfig.chart.highlightArea,
                }),
            ];
        }
    }

    if (
        hasDeepProperty(userConfig, 'chart.annotations') &&
        Array.isArray(userConfig.chart.annotations) &&
        userConfig.chart.annotations.length
    ) {
        mergedConfig.chart.annotations = userConfig.chart.annotations.map(
            (annotation) =>
                treeShake({
                    defaultConfig: DEFAULT_CONFIG.chart.annotations[0],
                    userConfig: annotation,
                }),
        );
    } else {
        mergedConfig.chart.annotations = [];
    }

    if (
        hasDeepProperty(userConfig, 'chart.grid.position') &&
        userConfig.chart.grid.position === 'start' &&
        dataset.some((serie) => serie.type === 'bar')
    ) {
        mergedConfig.chart.grid.position = 'middle';
    }

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

function isCoordinatePoint(point) {
    return (
        point &&
        typeof point === 'object' &&
        Number.isFinite(Number(point.x)) &&
        Number.isFinite(Number(point.y))
    );
}

function hasUserScaleValue(value) {
    return (
        value !== null && value !== undefined && Number.isFinite(Number(value))
    );
}

function getContinuousXValues(dataset) {
    return dataset
        .flatMap((serie) => (Array.isArray(serie.series) ? serie.series : []))
        .filter(isCoordinatePoint)
        .map((point) => Number(point.x));
}

function getContinuousXScale({ dataset, config }) {
    const values = getContinuousXValues(dataset);

    if (!values.length) {
        return {
            min: 0,
            max: 1,
            ticks: [0, 1],
        };
    }

    const configScaleMin = config?.chart?.grid?.labels?.xAxis?.scaleMin;
    const configScaleMax = config?.chart?.grid?.labels?.xAxis?.scaleMax;

    const min = hasUserScaleValue(configScaleMin)
        ? Number(configScaleMin)
        : Math.min(...values);

    const max = hasUserScaleValue(configScaleMax)
        ? Number(configScaleMax)
        : Math.max(...values);

    const finalMin = min === max ? min - 1 : min;
    const finalMax = min === max ? max + 1 : max;

    const steps = Number.isFinite(
        Number(config?.chart?.grid?.labels?.xAxis?.scaleSteps),
    )
        ? Number(config.chart.grid.labels.xAxis.scaleSteps)
        : 6;

    return calculateNiceScale(finalMin, finalMax, steps);
}

function getContinuousXPosition({ xValue, xScale, drawingArea, config }) {
    const ratio =
        (Number(xValue) - xScale.min) / (xScale.max - xScale.min || 1);

    const reversed = Boolean(config?.chart?.grid?.labels?.xAxis?.reverse);
    const finalRatio = reversed ? 1 - ratio : ratio;

    return drawingArea.left + drawingArea.width * finalRatio;
}

export function createVueUiXyState({
    dataset = [],
    config = {},
    width = 1000,
    height = 600,
    selectedXIndex,
    additionalSvgContent = '',
    svgTitle = '',
} = {}) {
    const finalConfig = prepareConfig({ config, dataset });

    const drawingArea = {
        top: finalConfig.chart.padding.top,
        left: finalConfig.chart.padding.left,
        right: width - finalConfig.chart.padding.right,
        bottom: height - finalConfig.chart.padding.bottom,
    };

    drawingArea.width = drawingArea.right - drawingArea.left;
    drawingArea.height = drawingArea.bottom - drawingArea.top;

    const values = dataset.flatMap((serie) =>
        Array.isArray(serie.series)
            ? serie.series.map((value) =>
                  value != null && typeof value === 'object'
                      ? Number(value.y)
                      : Number(value),
              )
            : [],
    );

    const finiteValues = values.filter(Number.isFinite);
    const minValue = Math.min(0, ...finiteValues);
    const maxValue = Math.max(1, ...finiteValues);

    const scale = calculateNiceScale(minValue, maxValue, 6);

    const isContinuous = dataset.some((serie) =>
        Array.isArray(serie.series)
            ? serie.series.some(isCoordinatePoint)
            : false,
    );

    const xScale = isContinuous
        ? getContinuousXScale({
              dataset,
              config: finalConfig,
          })
        : null;

    const maxLength = Math.max(
        0,
        ...dataset.map((serie) => serie.series?.length || 0),
    );

    const getIndexedX = (index) => {
        if (maxLength <= 1) {
            return drawingArea.left + drawingArea.width / 2;
        }

        return drawingArea.left + (index / (maxLength - 1)) * drawingArea.width;
    };

    const getX = (point, index) => {
        if (isContinuous) {
            if (!isCoordinatePoint(point)) {
                return null;
            }

            return getContinuousXPosition({
                xValue: point.x,
                xScale,
                drawingArea,
                config: finalConfig,
            });
        }

        return getIndexedX(index);
    };

    const getY = (value) => {
        const ratio =
            (Number(value) - scale.min) / (scale.max - scale.min || 1);
        return drawingArea.bottom - ratio * drawingArea.height;
    };

    const customPalette = Array.isArray(finalConfig.customPalette)
        ? finalConfig.customPalette
        : [];

    const activePalette = customPalette.length ? customPalette : palette;

    const series = dataset.map((serie, serieIndex) => {
        const color =
            (serie.color ? convertColorToHex(serie.color) : '') ||
            activePalette[serieIndex % activePalette.length];

        const plots = (serie.series || []).map((point, index) => {
            const value =
                point == null
                    ? null
                    : typeof point === 'object'
                      ? (point.y ?? null)
                      : Number(point);

            const x = getX(point, index);

            return {
                x,
                y:
                    value === null || !Number.isFinite(Number(value))
                        ? null
                        : getY(value),
                value,
                index,
                rawX: isCoordinatePoint(point) ? Number(point.x) : null,
                label: point?.name ?? point?.x ?? String(index),
            };
        });

        return {
            ...serie,
            color,
            type: serie.type || 'line',
            plots,
        };
    });

    return {
        width,
        height,
        selectedXIndex,
        dataset,
        config: finalConfig,
        drawingArea,
        scale,
        xScale,
        isContinuous,
        series,
        additionalSvgContent,
        svgTitle,
    };
}

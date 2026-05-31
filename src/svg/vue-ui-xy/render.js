import {
    applyDataLabel,
    assignStackRatios,
    buildDisplayedTimeLabels,
    buildInterLineAreas,
    calculateNiceScale,
    calculateNiceScaleWithExactExtremes,
    convertColorToHex,
    createIndividualArea,
    createIndividualAreaWithCuts,
    createPolygonPath,
    createSmoothAreaSegments,
    createSmoothPath,
    createSmoothPathWithCuts,
    createSmoothPathWithCutsSegments,
    createStar,
    createStepperPath,
    createStraightPath,
    createStraightPathWithCuts,
    createStraightPathWithCutsSegments,
    createTSpansFromLineBreaksOnX,
    dataLabel,
    escapeXml,
    escapeXmlAttr,
    hasDeepProperty,
    setGradientOffset,
    setOpacity,
    shiftHue,
} from '../../lib.js';

import {
    element,
    emptyElement,
    estimateTextWidth,
    getConfigValue,
    isFiniteNumber,
    renderShape,
    safeArray,
    safeNumber,
    textElement,
} from '../utils';

import { useConfig } from '../../useConfig.js';
import { useTimeLabels } from '../../useTimeLabels.js';
import themes from '../../themes/vue_ui_xy.json';

function usesIndividualScale(config) {
    return Boolean(
        getConfigValue(
            config,
            'chart.grid.labels.yAxis.useIndividualScale',
            false,
        ),
    );
}

function getSerieScaleLabel(serie) {
    return String(serie.scaleLabel ?? serie.id ?? serie.name ?? '');
}

function getIndividualScaleSlotWidth(config) {
    return (
        safeNumber(
            getConfigValue(config, 'chart.grid.labels.yAxis.labelWidth', 40),
            40,
        ) + 36
    );
}

function getScaleValuesFromSeries(series) {
    return safeArray(series)
        .flatMap((serie) => safeArray(serie.plots))
        .map((plot) =>
            plot?.value === null || plot?.value === undefined
                ? null
                : Number(plot.value),
        )
        .filter(Number.isFinite);
}

function buildGlobalScaleFromSeries(config, fallbackScale, series) {
    const values = getScaleValuesFromSeries(series);

    const configScaleMin = getConfigValue(
        config,
        'chart.grid.labels.yAxis.scaleMin',
        null,
    );
    const configScaleMax = getConfigValue(
        config,
        'chart.grid.labels.yAxis.scaleMax',
        null,
    );

    const min = hasUserScaleValue(configScaleMin)
        ? Number(configScaleMin)
        : Math.min(0, ...values);

    const max = hasUserScaleValue(configScaleMax)
        ? Number(configScaleMax)
        : Math.max(1, ...values);

    const steps = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.commonScaleSteps', 6),
        6,
    );

    if (
        !values.length &&
        !hasUserScaleValue(configScaleMin) &&
        !hasUserScaleValue(configScaleMax)
    ) {
        return fallbackScale;
    }

    return buildScale(config, min, max === min ? min + 1 : max, steps);
}

function getSerieBounds(state, serie) {
    const { drawingArea } = state;

    const yOffset = safeNumber(serie.__yOffset, 0);
    const individualHeight = safeNumber(
        serie.__individualHeight,
        drawingArea.height,
    );

    return {
        top: drawingArea.bottom - yOffset - individualHeight,
        bottom: drawingArea.bottom - yOffset,
    };
}

function getClippedBarGeometry(state, serie, plot, zeroY) {
    const bounds = getSerieBounds(state, serie);

    const rawTop = Math.min(plot.y, zeroY);
    const rawBottom = Math.max(plot.y, zeroY);

    const y = Math.max(bounds.top, rawTop);
    const bottom = Math.min(bounds.bottom, rawBottom);
    const height = Math.max(0.00001, bottom - y);

    return { y, height };
}

function getScaleGroups(config, series) {
    const groups = {};

    safeArray(series).forEach((serie, serieIndex) => {
        const scaleLabel = getSerieScaleLabel(serie) || `serie_${serieIndex}`;
        const values = safeArray(serie.plots)
            .map((plot) => Number(plot.value))
            .filter(Number.isFinite);

        if (!groups[scaleLabel]) {
            groups[scaleLabel] = {
                scaleLabel,
                name: serie.name ?? scaleLabel,
                color:
                    getConfigValue(
                        config,
                        'chart.grid.labels.yAxis.groupColor',
                        null,
                    ) || serie.color,
                series: [],
                values: [],
            };
        }

        groups[scaleLabel].series.push(serie);
        groups[scaleLabel].values.push(...values);
    });

    Object.values(groups).forEach((group) => {
        group.scale = getSerieScale(config, {
            ...group.series[0],
            plots: group.series.flatMap((serie) => safeArray(serie.plots)),
        });
    });

    return groups;
}

function getScaleForSerie(
    config,
    serie,
    scaleGroups,
    globalScale,
    useIndividualScale,
    stacked,
) {
    if (!useIndividualScale && !stacked) {
        return globalScale;
    }

    return (
        scaleGroups[getSerieScaleLabel(serie)]?.scale ??
        getSerieScale(config, serie)
    );
}

function formatTick(tick, config) {
    return dataLabel({
        v: tick,
        r: getConfigValue(config, 'chart.labels.rounding', 0),
        p: getConfigValue(config, 'chart.labels.prefix', ''),
        s: getConfigValue(config, 'chart.labels.suffix', ''),
    });
}

function normalizeSerieType(type) {
    if (type === 'bar' || type === 'line' || type === 'plot') {
        return type;
    }

    return 'line';
}

function getSeries(state) {
    const sourceSeries = safeArray(state.series);

    return sourceSeries.map((serie) => ({
        ...serie,
        type: normalizeSerieType(serie.type),
        plots: safeArray(serie.plots).filter(
            (plot) => plot && isFiniteNumber(plot.x),
        ),
    }));
}

function getZeroY(state) {
    const { drawingArea, scale } = state;

    const ratio = (0 - scale.min) / (scale.max - scale.min || 1);
    return drawingArea.bottom - ratio * drawingArea.height;
}

function getUniqueId(state) {
    return state.uniqueId ?? 'ssr';
}

function getBarGradientId(state, serieIndex, sign) {
    return `rectGradient_${sign}_${serieIndex}_${getUniqueId(state)}`;
}

function getLineGradientId(state, serieIndex) {
    return `lineGradient_${serieIndex}_${getUniqueId(state)}`;
}

function getTemperatureGradientId(state, serieIndex) {
    return `temperature_grad_line_${serieIndex}_${getUniqueId(state)}`;
}

function getLineStroke(state, serie, serieIndex) {
    if (serie.temperatureColors && !serie.isFlatTemperatureLine) {
        return `url(#${getTemperatureGradientId(state, serieIndex)})`;
    }

    return serie.color;
}

function getPlotGradientId(state, serieIndex) {
    return `plotGradient_${serieIndex}_${getUniqueId(state)}`;
}

function getLineDotFill(state, serie, serieIndex) {
    const { config } = state;

    if (getConfigValue(config, 'line.useGradient', false)) {
        return `url(#${getLineGradientId(state, serieIndex)})`;
    }

    return getConfigValue(config, 'line.dot.useSerieColor', true)
        ? serie.color
        : getConfigValue(config, 'line.dot.fill', '#FFFFFF');
}

function getAreaFill(state, serie, serieIndex) {
    const { config } = state;

    if (getConfigValue(config, 'line.area.useGradient', false)) {
        return `url(#${getAreaGradientId(state, serieIndex)})`;
    }

    return setOpacity(
        serie.color,
        safeNumber(getConfigValue(config, 'line.area.opacity', 30), 30),
    );
}

function getBarFill(state, serie, serieIndex, value) {
    if (!getConfigValue(state.config, 'bar.useGradient', false)) {
        return serie.color;
    }

    return value >= 0
        ? `url(#${getBarGradientId(state, serieIndex, 'pos')})`
        : `url(#${getBarGradientId(state, serieIndex, 'neg')})`;
}

function renderChartGradients(state, series) {
    const { config } = state;
    const output = [];

    if (getConfigValue(config, 'bar.useGradient', false)) {
        series
            .filter((serie) => serie.type === 'bar')
            .forEach((serie, serieIndex) => {
                output.push(
                    element(
                        'linearGradient',
                        {
                            id: getBarGradientId(state, serieIndex, 'pos'),
                            x2: '0%',
                            y2: '100%',
                        },
                        [
                            emptyElement('stop', {
                                offset: '0%',
                                'stop-color': convertColorToHex(serie.color),
                            }),
                            emptyElement('stop', {
                                offset: '62%',
                                'stop-color': shiftHue(
                                    convertColorToHex(serie.color),
                                    0.02,
                                ),
                            }),
                            emptyElement('stop', {
                                offset: '100%',
                                'stop-color': shiftHue(
                                    convertColorToHex(serie.color),
                                    0.05,
                                ),
                            }),
                        ].join(''),
                    ),
                );

                output.push(
                    element(
                        'linearGradient',
                        {
                            id: getBarGradientId(state, serieIndex, 'neg'),
                            x2: '0%',
                            y2: '100%',
                        },
                        [
                            emptyElement('stop', {
                                offset: '0%',
                                'stop-color': shiftHue(
                                    convertColorToHex(serie.color),
                                    0.05,
                                ),
                            }),
                            emptyElement('stop', {
                                offset: '38%',
                                'stop-color': shiftHue(
                                    convertColorToHex(serie.color),
                                    0.02,
                                ),
                            }),
                            emptyElement('stop', {
                                offset: '100%',
                                'stop-color': convertColorToHex(serie.color),
                            }),
                        ].join(''),
                    ),
                );
            });
    }

    series
        .filter((serie) => serie.type === 'line')
        .forEach((serie, serieIndex) => {
            if (getConfigValue(config, 'line.useGradient', false)) {
                output.push(
                    element(
                        'radialGradient',
                        {
                            id: getLineGradientId(state, serieIndex),
                            cx: '50%',
                            cy: '50%',
                            r: '50%',
                            fx: '50%',
                            fy: '50%',
                        },
                        [
                            emptyElement('stop', {
                                offset: '0%',
                                'stop-color': shiftHue(
                                    convertColorToHex(serie.color),
                                    0.05,
                                ),
                            }),
                            emptyElement('stop', {
                                offset: '100%',
                                'stop-color': convertColorToHex(serie.color),
                            }),
                        ].join(''),
                    ),
                );
            }

            if (serie.temperatureColors && !serie.isFlatTemperatureLine) {
                output.push(
                    element(
                        'linearGradient',
                        {
                            id: getTemperatureGradientId(state, serieIndex),
                            gradientTransform: 'rotate(90)',
                        },
                        serie.temperatureColors
                            .map((color, colorIndex) =>
                                emptyElement('stop', {
                                    offset: setGradientOffset(
                                        colorIndex,
                                        serie.temperatureColors.length,
                                    ),
                                    'stop-color': convertColorToHex(color),
                                }),
                            )
                            .join(''),
                    ),
                );
            }
        });

    series
        .filter((serie) => serie.type === 'plot')
        .forEach((serie, serieIndex) => {
            if (!getConfigValue(config, 'plot.useGradient', false)) {
                return;
            }

            output.push(
                element(
                    'radialGradient',
                    {
                        id: getPlotGradientId(state, serieIndex),
                        cx: '50%',
                        cy: '50%',
                        r: '50%',
                        fx: '50%',
                        fy: '50%',
                    },
                    [
                        emptyElement('stop', {
                            offset: '0%',
                            'stop-color': shiftHue(
                                convertColorToHex(serie.color),
                                0.05,
                            ),
                        }),
                        emptyElement('stop', {
                            offset: '100%',
                            'stop-color': convertColorToHex(serie.color),
                        }),
                    ].join(''),
                ),
            );
        });

    return output.length
        ? element('defs', { 'data-layer': 'gradients' }, output.join(''))
        : '';
}

function renderBackground(state) {
    const backgroundColor = getConfigValue(
        state.config,
        'chart.backgroundColor',
        '#FFFFFF',
    );

    return emptyElement('rect', {
        width: state.width,
        height: state.height,
        fill: backgroundColor,
    });
}

function getFontSizes(config) {
    return {
        dataLabels: safeNumber(
            getConfigValue(config, 'chart.grid.labels.fontSize', 12),
            12,
        ),
        xAxis: safeNumber(
            getConfigValue(
                config,
                'chart.grid.labels.xAxisLabels.fontSize',
                12,
            ),
            12,
        ),
        yAxis: safeNumber(
            getConfigValue(config, 'chart.grid.labels.axis.fontSize', 12),
            12,
        ),
    };
}

function yAxisLabelsAreRight(config) {
    return (
        getConfigValue(config, 'chart.grid.labels.yAxis.position', 'left') ===
        'right'
    );
}

function formatYAxisTick(tick, config) {
    const fallback = dataLabel({
        p: getConfigValue(config, 'chart.labels.prefix', ''),
        v: tick,
        s: getConfigValue(config, 'chart.labels.suffix', ''),
        r: getConfigValue(config, 'chart.grid.labels.yAxis.rounding', 0),
    });

    return applyDataLabel(
        getConfigValue(config, 'chart.grid.labels.yAxis.formatter', null),
        tick,
        fallback,
        config,
    );
}

function isYAxisStacked(config) {
    return Boolean(
        getConfigValue(config, 'chart.grid.labels.yAxis.stacked', false),
    );
}

function hasUserScaleValue(value) {
    return (
        value !== null && value !== undefined && Number.isFinite(Number(value))
    );
}

function buildScale(config, min, max, steps) {
    const useNiceScale = getConfigValue(
        config,
        'chart.grid.labels.yAxis.useNiceScale',
        true,
    );

    return useNiceScale
        ? calculateNiceScale(min, max, steps)
        : calculateNiceScaleWithExactExtremes(min, max, steps);
}

function getGlobalScale(config, scale) {
    const configScaleMin = getConfigValue(
        config,
        'chart.grid.labels.yAxis.scaleMin',
        null,
    );
    const configScaleMax = getConfigValue(
        config,
        'chart.grid.labels.yAxis.scaleMax',
        null,
    );

    if (
        !hasUserScaleValue(configScaleMin) &&
        !hasUserScaleValue(configScaleMax)
    ) {
        return scale;
    }

    const min = hasUserScaleValue(configScaleMin)
        ? Number(configScaleMin)
        : safeNumber(scale.min, 0);

    const max = hasUserScaleValue(configScaleMax)
        ? Number(configScaleMax)
        : safeNumber(scale.max, 1);

    const steps = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.commonScaleSteps', 6),
        6,
    );

    return buildScale(config, min, max === min ? min + 1 : max, steps);
}

function getSerieScale(config, serie) {
    const values = safeArray(serie.plots)
        .map((plot) => Number(plot.value))
        .filter(Number.isFinite);

    const configScaleMin = getConfigValue(
        config,
        'chart.grid.labels.yAxis.scaleMin',
        null,
    );
    const configScaleMax = getConfigValue(
        config,
        'chart.grid.labels.yAxis.scaleMax',
        null,
    );

    const min = hasUserScaleValue(configScaleMin)
        ? Number(configScaleMin)
        : hasUserScaleValue(serie.scaleMin)
          ? Number(serie.scaleMin)
          : Math.min(0, ...values);

    const max = hasUserScaleValue(configScaleMax)
        ? Number(configScaleMax)
        : hasUserScaleValue(serie.scaleMax)
          ? Number(serie.scaleMax)
          : Math.max(1, ...values);

    const finalMax = max === min ? min + 1 : max;

    const steps = safeNumber(
        serie.scaleSteps ??
            getConfigValue(
                config,
                'chart.grid.labels.yAxis.commonScaleSteps',
                6,
            ),
        6,
    );

    return buildScale(config, min, finalMax, steps);
}

function getScaleLabelMetrics(config, scale, series = []) {
    const fontSizes = getFontSizes(config);
    const stacked = isYAxisStacked(config);
    const useIndividualScale = usesIndividualScale(config);
    const individualScaleSlotWidth = getIndividualScaleSlotWidth(config);

    if (useIndividualScale && !stacked) {
        const groupCount = Object.keys(getScaleGroups(config, series)).length;

        return {
            left: yAxisLabelsAreRight(config)
                ? 0
                : groupCount * individualScaleSlotWidth,
            right: yAxisLabelsAreRight(config)
                ? groupCount * individualScaleSlotWidth
                : 0,
            scaleLabelsOffset: groupCount * individualScaleSlotWidth,
            yAxisLabelWidth: 0,
        };
    }

    if (useIndividualScale && stacked) {
        return {
            left: yAxisLabelsAreRight(config) ? 0 : individualScaleSlotWidth,
            right: yAxisLabelsAreRight(config) ? individualScaleSlotWidth : 0,
            scaleLabelsOffset: individualScaleSlotWidth,
            yAxisLabelWidth: 0,
        };
    }

    const ticks = stacked
        ? series.flatMap((serie) => getSerieScale(config, serie).ticks)
        : safeArray(scale.ticks);

    const scaleLabelsWidth = ticks.reduce((max, tick) => {
        return Math.max(
            max,
            estimateTextWidth(
                formatYAxisTick(tick, config),
                fontSizes.dataLabels,
            ),
        );
    }, 0);

    const yLabel = getConfigValue(config, 'chart.grid.labels.axis.yLabel', '');
    const yAxisLabelWidth = yLabel
        ? fontSizes.yAxis * 2 +
          24 +
          safeNumber(
              getConfigValue(config, 'chart.grid.labels.axis.yLabelOffsetX', 0),
              0,
          ) +
          fontSizes.yAxis
        : 0;

    const scaleLabelsOffset =
        scaleLabelsWidth +
        safeNumber(
            getConfigValue(
                config,
                'chart.grid.labels.yAxis.scaleValueOffsetX',
                0,
            ),
            0,
        ) +
        safeNumber(
            getConfigValue(config, 'chart.grid.labels.yAxis.crosshairSize', 0),
            0,
        );

    return {
        left: yAxisLabelsAreRight(config)
            ? 0
            : scaleLabelsOffset + yAxisLabelWidth,
        right: yAxisLabelsAreRight(config)
            ? scaleLabelsOffset + yAxisLabelWidth
            : 0,
        scaleLabelsOffset,
        yAxisLabelWidth,
    };
}

function createLayoutAdjustedState(state, series) {
    const { config, scale, width, height } = state;
    const fontSizes = getFontSizes(config);
    const originalArea = state.drawingArea;
    const scaleLabelX = getScaleLabelMetrics(config, scale, series);

    const legendPosition = getConfigValue(
        config,
        'chart.legend.position',
        'bottom',
    );
    const showLegend = getConfigValue(config, 'chart.legend.show', true);
    const legendLayout = showLegend
        ? getLegendLayout({ ...state, width, height }, series)
        : { height: 0 };

    const reserveTopLegend =
        showLegend && legendPosition === 'top' ? legendLayout.height : 0;
    const reserveBottomLegend =
        showLegend && legendPosition !== 'top' ? legendLayout.height : 0;

    const xAxisLabel = getConfigValue(
        config,
        'chart.grid.labels.axis.xLabel',
        '',
    );
    const timeLabelsHeight = getConfigValue(
        config,
        'chart.grid.labels.xAxisLabels.show',
        true,
    )
        ? fontSizes.xAxis * 2
        : 0;

    const axisLabelHeight = xAxisLabel ? fontSizes.yAxis * 1.5 : 0;
    const timeLabelsY = axisLabelHeight + timeLabelsHeight + fontSizes.xAxis;

    const titleHeight = getTitleBlockHeight(config);
    const topOffset =
        titleHeight +
        safeNumber(getConfigValue(config, 'chart.labels.fontSize', 12), 12) *
            1.1;
    const progressionLabelOffsetX = 6;

    const paddingTop = safeNumber(
        getConfigValue(config, 'chart.padding.top', 12),
        12,
    );
    const paddingRight = safeNumber(
        getConfigValue(config, 'chart.padding.right', 12),
        12,
    );
    const paddingBottom = safeNumber(
        getConfigValue(config, 'chart.padding.bottom', 12),
        12,
    );
    const paddingLeft = safeNumber(
        getConfigValue(config, 'chart.padding.left', 12),
        12,
    );
    const xLabelOffsetY = safeNumber(
        getConfigValue(config, 'chart.grid.labels.axis.xLabelOffsetY', 0),
        0,
    );
    const yCrosshairSize = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.crosshairSize', 0),
        0,
    );

    const leftScaleLabelX = scaleLabelX.left;
    const rightScaleLabelX = scaleLabelX.right;

    const drawingWidth =
        width -
        leftScaleLabelX -
        rightScaleLabelX -
        progressionLabelOffsetX -
        paddingLeft -
        paddingRight;

    const drawingArea = {
        top: paddingTop + topOffset + reserveTopLegend,
        right:
            leftScaleLabelX +
            (yAxisLabelsAreRight(config) ? 0 : yCrosshairSize) +
            paddingLeft +
            drawingWidth,
        bottom:
            height -
            timeLabelsY -
            paddingBottom -
            xLabelOffsetY -
            reserveBottomLegend,
        left:
            leftScaleLabelX +
            (yAxisLabelsAreRight(config) ? 0 : yCrosshairSize) +
            paddingLeft,
        width: Math.max(1, drawingWidth),
        height: 1,
        scaleLabelX: leftScaleLabelX,
        rightScaleLabelX,
        scaleLabelsOffset: scaleLabelX.scaleLabelsOffset,
        yAxisLabelWidth: scaleLabelX.yAxisLabelWidth,
        individualOffsetX: 36,
    };

    drawingArea.height = Math.max(1, drawingArea.bottom - drawingArea.top);

    function remapX(x) {
        const ratio = (x - originalArea.left) / (originalArea.width || 1);
        return drawingArea.left + ratio * drawingArea.width;
    }

    function remapY(y) {
        const ratio = (originalArea.bottom - y) / (originalArea.height || 1);
        return drawingArea.bottom - ratio * drawingArea.height;
    }

    const stacked = isYAxisStacked(config);
    const stackSeries = stacked ? assignStackRatios(series) : series;
    const totalSeries = Math.max(1, stackSeries.length);
    const gap = stacked
        ? safeNumber(
              getConfigValue(config, 'chart.grid.labels.yAxis.gap', 12),
              12,
          )
        : 0;
    const totalGap = gap * Math.max(0, totalSeries - 1);
    const usableHeight = Math.max(1, drawingArea.height - totalGap);

    const useIndividualScale = usesIndividualScale(config);
    const scaleGroups = getScaleGroups(config, series);

    const maxSeries = Math.max(
        1,
        ...series.map((serie) => safeArray(serie.plots).length),
    );

    function remapPlotX(plot, plotIndex) {
        if (isContinuousScale(state)) {
            return remapX(plot.x);
        }

        return getDatapointX(
            {
                ...state,
                drawingArea,
            },
            plot.index ?? plotIndex,
            maxSeries,
        );
    }

    const adjustedSeries = series.map((serie, serieIndex) => {
        const stackedSerie =
            serie.id !== undefined && serie.id !== null
                ? (stackSeries.find((item) => item.id === serie.id) ??
                  stackSeries[serieIndex] ??
                  serie)
                : (stackSeries[serieIndex] ?? serie);
        const serieScale = getScaleForSerie(
            config,
            serie,
            scaleGroups,
            scale,
            useIndividualScale,
            stacked,
        );

        const stackIndex = safeNumber(stackedSerie.stackIndex, serieIndex);
        const stackRatio = safeNumber(stackedSerie.stackRatio, 1 / totalSeries);
        const cumulatedStackRatio = safeNumber(
            stackedSerie.cumulatedStackRatio,
            stackRatio * (stackIndex + 1),
        );
        const flippedIndex = totalSeries - 1 - stackIndex;
        const flippedLowerRatio = stacked ? 1 - cumulatedStackRatio : 0;

        const yOffset = stacked
            ? usableHeight * flippedLowerRatio + gap * flippedIndex
            : 0;
        const individualHeight = stacked
            ? usableHeight * stackRatio
            : drawingArea.height;

        function getYFromValue(value) {
            const ratio =
                (value - serieScale.min) /
                (serieScale.max - serieScale.min || 1);
            return drawingArea.bottom - yOffset - ratio * individualHeight;
        }

        const zeroY = getYFromValue(0);

        return {
            ...serie,
            __scale: serieScale,
            __yOffset: yOffset,
            __individualHeight: individualHeight,
            __zeroY: zeroY,
            __scaleYLabels: safeArray(serieScale.ticks).map((tick) => ({
                value: tick,
                y: getYFromValue(tick),
                serie,
            })),
            plots: serie.plots.map((plot, i) => {
                const value =
                    plot.value === null || plot.value === undefined
                        ? null
                        : Number(plot.value);

                return {
                    ...plot,
                    value,
                    x: remapPlotX(plot, i),
                    y:
                        value === null || !Number.isFinite(value)
                            ? null
                            : getYFromValue(value),
                };
            }),
        };
    });

    return {
        ...state,
        drawingArea,
        series: adjustedSeries,
        __scaleGroups: scaleGroups,
        __useIndividualScale: useIndividualScale,
    };
}

function renderScaleLabels(state) {
    const { config, drawingArea, scale, series } = state;

    if (
        !getConfigValue(config, 'chart.grid.labels.show', true) ||
        !getConfigValue(config, 'chart.grid.labels.yAxis.show', true)
    ) {
        return '';
    }

    const useIndividualScale = usesIndividualScale(config);
    const stacked = isYAxisStacked(config);

    if (useIndividualScale) {
        return renderIndividualScaleLabels(state);
    }

    const fontSizes = getFontSizes(config);
    const right = yAxisLabelsAreRight(config);
    const showCrosshairs = getConfigValue(
        config,
        'chart.grid.labels.yAxis.showCrosshairs',
        false,
    );
    const crosshairSize = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.crosshairSize', 0),
        0,
    );
    const scaleValueOffsetX = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.scaleValueOffsetX', 0),
        0,
    );
    const color = getConfigValue(config, 'chart.grid.labels.color', '#2A2A2A');
    const stroke = getConfigValue(config, 'chart.grid.stroke', '#CCCCCC');

    const labels = stacked
        ? series.flatMap((serie) => safeArray(serie.__scaleYLabels))
        : safeArray(scale.ticks).map((tick) => {
              const ratio = (tick - scale.min) / (scale.max - scale.min || 1);

              return {
                  value: tick,
                  y: drawingArea.bottom - ratio * drawingArea.height,
              };
          });

    const output = [];

    labels.forEach((label) => {
        if (!Number.isFinite(label.y)) return;

        if (showCrosshairs) {
            output.push(
                emptyElement('line', {
                    'data-cy': 'axis-y-tick',
                    x1: right ? drawingArea.right : drawingArea.left,
                    x2: right
                        ? drawingArea.right + crosshairSize
                        : drawingArea.left - crosshairSize,
                    y1: label.y,
                    y2: label.y,
                    stroke,
                    'stroke-width': 1,
                    'stroke-linecap': 'round',
                }),
            );
        }

        output.push(
            textElement(formatYAxisTick(label.value, config), {
                'data-cy': 'axis-y-label',
                transform: `translate(${
                    right
                        ? drawingArea.right +
                          crosshairSize +
                          scaleValueOffsetX +
                          5
                        : drawingArea.scaleLabelX - crosshairSize
                }, ${label.y + fontSizes.dataLabels / 3})`,
                'font-size': fontSizes.dataLabels,
                'text-anchor': right ? 'start' : 'end',
                fill:
                    stacked && label.serie?.color
                        ? getConfigValue(
                              config,
                              'chart.grid.labels.yAxis.groupColor',
                              null,
                          ) || label.serie.color
                        : color,
            }),
        );
    });

    return element('g', { 'data-layer': 'scale-labels' }, output.join(''));
}

function renderIndividualScaleLabels(state) {
    const { config, drawingArea, series } = state;
    const fontSizes = getFontSizes(config);
    const right = yAxisLabelsAreRight(config);
    const stacked = isYAxisStacked(config);
    const scaleGroups = state.__scaleGroups ?? getScaleGroups(config, series);

    const showCrosshairs = getConfigValue(
        config,
        'chart.grid.labels.yAxis.showCrosshairs',
        false,
    );
    const crosshairSize = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.crosshairSize', 0),
        0,
    );
    const scaleValueOffsetX = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.scaleValueOffsetX', 0),
        0,
    );
    const labelWidth = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.labelWidth', 40),
        40,
    );
    const individualOffsetX = safeNumber(drawingArea.individualOffsetX, 36);

    const output = [];
    const groups = Object.values(scaleGroups);

    groups.forEach((group, groupIndex) => {
        const relatedSerie =
            series.find(
                (serie) => getSerieScaleLabel(serie) === group.scaleLabel,
            ) ?? series[groupIndex];

        if (!relatedSerie) return;

        const x = stacked
            ? right
                ? drawingArea.right
                : drawingArea.left
            : right
              ? drawingArea.right +
                getIndividualScaleSlotWidth(config) * groupIndex
              : drawingArea.left -
                getIndividualScaleSlotWidth(config) *
                    (groups.length - groupIndex - 1);

        const yOffset = safeNumber(relatedSerie.__yOffset, 0);
        const individualHeight = safeNumber(
            relatedSerie.__individualHeight,
            drawingArea.height,
        );
        const top = stacked
            ? drawingArea.bottom - yOffset - individualHeight
            : drawingArea.top;
        const bottom = stacked
            ? drawingArea.bottom - yOffset
            : drawingArea.bottom;

        output.push(
            emptyElement('line', {
                x1: stacked ? x : right ? x : x - individualOffsetX,
                x2: stacked ? x : right ? x : x - individualOffsetX,
                y1: top,
                y2: bottom,
                stroke: group.color,
                'stroke-width': getConfigValue(
                    config,
                    'chart.grid.strokeWidth',
                    1,
                ),
                'stroke-linecap': 'round',
            }),
        );

        const nameX = stacked
            ? right
                ? drawingArea.right +
                  crosshairSize +
                  scaleValueOffsetX +
                  5 +
                  labelWidth +
                  individualOffsetX
                : drawingArea.left -
                  crosshairSize -
                  scaleValueOffsetX -
                  labelWidth
            : right
              ? x + crosshairSize + scaleValueOffsetX + 5 + labelWidth
              : x - fontSizes.dataLabels / 2;

        output.push(
            textElement(group.name, {
                transform: `translate(${nameX}, ${top + (bottom - top) / 2}) rotate(-90)`,
                'font-size': fontSizes.dataLabels * 0.8,
                'text-anchor': 'middle',
                fill: group.color,
            }),
        );

        safeArray(group.scale.ticks).forEach((tick) => {
            const ratio =
                (tick - group.scale.min) /
                (group.scale.max - group.scale.min || 1);
            const y = bottom - ratio * (bottom - top);

            if (!Number.isFinite(y)) return;

            if (showCrosshairs) {
                output.push(
                    emptyElement('line', {
                        'data-cy': 'axis-y-tick',
                        x1: stacked
                            ? x
                            : right
                              ? x
                              : x + 3 - crosshairSize - individualOffsetX,
                        x2: stacked
                            ? right
                                ? x + crosshairSize
                                : x - crosshairSize
                            : right
                              ? x + crosshairSize
                              : x - individualOffsetX,
                        y1: y,
                        y2: y,
                        stroke: group.color,
                        'stroke-width': 1,
                        'stroke-linecap': 'round',
                    }),
                );
            }

            output.push(
                textElement(formatYAxisTick(tick, config), {
                    'data-cy': 'axis-y-label',
                    transform: `translate(${
                        stacked
                            ? right
                                ? drawingArea.right +
                                  crosshairSize +
                                  scaleValueOffsetX +
                                  5
                                : drawingArea.left -
                                  crosshairSize -
                                  scaleValueOffsetX -
                                  5
                            : right
                              ? x + crosshairSize + scaleValueOffsetX + 5
                              : x - 5 - individualOffsetX
                    }, ${y + fontSizes.dataLabels / 3})`,
                    'font-size': fontSizes.dataLabels,
                    'text-anchor': right ? 'start' : 'end',
                    fill: group.color,
                }),
            );
        });
    });

    return element(
        'g',
        { 'data-layer': 'individual-scale-labels' },
        output.join(''),
    );
}

function renderBars(state, series) {
    const { config, drawingArea } = state;
    const stacked = isYAxisStacked(config);
    const barSeries = series.filter((serie) => serie.type === 'bar');

    if (!barSeries.length) return '';

    const maxSeries = Math.max(
        1,
        ...series.map((serie) => safeArray(serie.plots).length),
    );

    const slotWidth = drawingArea.width / maxSeries;
    const periodGap = safeNumber(
        getConfigValue(config, 'bar.periodGap', 0.2),
        0.2,
    );
    const innerGapRatio = safeNumber(
        getConfigValue(config, 'bar.innerGap', 0.05),
        0.05,
    );
    const borderRadius = getConfigValue(config, 'bar.borderRadius', 0);

    const output = [];

    if (stacked) {
        const stackedBarWidth = Math.max(0.00001, slotWidth * 0.9);
        const innerGap =
            stackedBarWidth * Math.min(Math.abs(innerGapRatio), 0.95);

        barSeries.forEach((serie, serieIndex) => {
            const zeroY = Number.isFinite(Number(serie.__zeroY))
                ? Number(serie.__zeroY)
                : getZeroY(state);

            safeArray(serie.plots).forEach((plot, plotIndex) => {
                if (
                    !plot ||
                    plot.value === null ||
                    plot.value === undefined ||
                    !Number.isFinite(Number(plot.value)) ||
                    !Number.isFinite(Number(plot.y))
                ) {
                    return;
                }

                const x =
                    drawingArea.left +
                    slotWidth * plotIndex +
                    slotWidth * 0.05 +
                    innerGap / 2;
                const { y, height } = getClippedBarGeometry(
                    state,
                    serie,
                    plot,
                    zeroY,
                );

                plot.__barLabelX =
                    x + Math.max(0.00001, stackedBarWidth - innerGap) / 2;

                output.push(
                    emptyElement('rect', {
                        'data-cy': 'datapoint-bar',
                        x,
                        y,
                        width: Math.max(0.00001, stackedBarWidth - innerGap),
                        height,
                        rx: borderRadius,
                        fill: getBarFill(
                            state,
                            serie,
                            serieIndex,
                            Number(plot.value),
                        ),
                        ...getBarBorderAttributes(state, serie),
                    }),
                );
            });
        });

        return element('g', { 'data-layer': 'bars' }, output.join(''));
    }

    const groupWidth = slotWidth * (1 - periodGap);
    const barWidth = groupWidth / Math.max(1, barSeries.length);
    const innerGap = barWidth * Math.min(Math.abs(innerGapRatio), 0.95);
    const zeroY = getZeroY(state);

    barSeries.forEach((serie, serieIndex) => {
        const zeroY = Number.isFinite(Number(serie.__zeroY))
            ? Number(serie.__zeroY)
            : getZeroY(state);

        safeArray(serie.plots).forEach((plot, plotIndex) => {
            if (
                !plot ||
                plot.value === null ||
                plot.value === undefined ||
                !Number.isFinite(Number(plot.value)) ||
                !Number.isFinite(Number(plot.y))
            ) {
                return;
            }

            const groupLeft =
                drawingArea.left +
                slotWidth * plotIndex +
                (slotWidth - groupWidth) / 2;
            const x = groupLeft + barWidth * serieIndex + innerGap / 2;
            const { y, height } = getClippedBarGeometry(
                state,
                serie,
                plot,
                zeroY,
            );

            plot.__barLabelX = x + Math.max(0.00001, barWidth - innerGap) / 2;

            output.push(
                emptyElement('rect', {
                    'data-cy': 'datapoint-bar',
                    x,
                    y,
                    width: Math.max(0.00001, barWidth - innerGap),
                    height,
                    rx: borderRadius,
                    fill: getBarFill(
                        state,
                        serie,
                        serieIndex,
                        Number(plot.value),
                    ),
                    ...getBarBorderAttributes(state, serie),
                }),
            );
        });
    });

    return element('g', { 'data-layer': 'bars' }, output.join(''));
}

function getGridHorizontalLabels(state) {
    const { config, drawingArea, scale, series } = state;

    if (usesIndividualScale(config) || isYAxisStacked(config)) {
        return series.flatMap((serie) => safeArray(serie.__scaleYLabels));
    }

    return safeArray(scale.ticks).map((tick) => {
        const ratio = (tick - scale.min) / (scale.max - scale.min || 1);

        return {
            value: tick,
            y: drawingArea.bottom - ratio * drawingArea.height,
        };
    });
}

function getHorizontalBandX(state, index, maxSeries) {
    const { drawingArea } = state;
    const slotWidth = drawingArea.width / Math.max(1, maxSeries);

    return drawingArea.left + slotWidth * index;
}

function getGridVerticalPath(state, series) {
    const { config, drawingArea } = state;
    const maxSeries = Math.max(
        1,
        ...series.map((serie) => safeArray(serie.plots).length),
    );

    const topY = drawingArea.top;
    const bottomY = drawingArea.bottom;

    if (isContinuousScale(state)) {
        const xValues = [
            ...new Set(
                series
                    .flatMap((serie) => safeArray(serie.plots))
                    .map((plot) => Number(plot.x))
                    .filter(Number.isFinite),
            ),
        ].sort((a, b) => a - b);

        if (!xValues.length) return '';

        if (
            getConfigValue(config, 'chart.grid.position', 'middle') === 'middle'
        ) {
            return xValues
                .map((x, index, arr) => {
                    if (index === 0) return null;

                    const previous = arr[index - 1];
                    const middleX = previous + (x - previous) / 2;

                    return `M${middleX},${topY} L${middleX},${bottomY}`;
                })
                .filter(Boolean)
                .join(' ');
        }

        return xValues.map((x) => `M${x},${topY} L${x},${bottomY}`).join(' ');
    }

    const extra =
        getConfigValue(config, 'chart.grid.position', 'middle') === 'middle'
            ? 1
            : 0;
    const count = maxSeries + extra;

    return Array.from({ length: count })
        .map((_, index) => {
            const x =
                getConfigValue(config, 'chart.grid.position', 'middle') ===
                'middle'
                    ? getHorizontalBandX(state, index, maxSeries)
                    : getDatapointX(state, index, maxSeries);

            return `M${x},${topY} L${x},${bottomY}`;
        })
        .join(' ');
}

function renderGrid(state) {
    const { config, drawingArea, scale, series } = state;

    const showGrid = getConfigValue(config, 'chart.grid.show', true);
    const showHorizontalLines = getConfigValue(
        config,
        'chart.grid.showHorizontalLines',
        true,
    );
    const showVerticalLines = getConfigValue(
        config,
        'chart.grid.showVerticalLines',
        false,
    );

    const stroke = getConfigValue(config, 'chart.grid.stroke', '#CCCCCC');
    const strokeWidth = safeNumber(
        getConfigValue(config, 'chart.grid.strokeWidth', 0.5),
        0.5,
    );

    const output = [];

    if (showGrid && showHorizontalLines) {
        getGridHorizontalLabels(state).forEach((label) => {
            if (!Number.isFinite(Number(label.y))) return;

            output.push(
                emptyElement('line', {
                    'data-cy': 'xy-grid-horizontal-line',
                    x1: drawingArea.left,
                    x2: drawingArea.right,
                    y1: label.y,
                    y2: label.y,
                    stroke,
                    'stroke-width': strokeWidth,
                    'stroke-linecap': 'round',
                }),
            );
        });
    }

    if (showGrid && showVerticalLines) {
        const verticalPath = getGridVerticalPath(state, series);

        if (verticalPath) {
            output.push(
                emptyElement('path', {
                    'data-cy': 'xy-grid-vertical-line',
                    d: verticalPath,
                    stroke,
                    'stroke-width': strokeWidth,
                    'stroke-linecap': 'round',
                }),
            );
        }
    }

    output.push(
        emptyElement('line', {
            x1: drawingArea.left,
            y1: drawingArea.bottom,
            x2: drawingArea.right,
            y2: drawingArea.bottom,
            stroke,
            'stroke-width': strokeWidth,
            'stroke-linecap': 'round',
        }),
    );

    const yAxisLineX = yAxisLabelsAreRight(config)
        ? drawingArea.right
        : drawingArea.left;

    output.push(
        emptyElement('line', {
            x1: yAxisLineX,
            y1: drawingArea.top,
            x2: yAxisLineX,
            y2: drawingArea.bottom,
            stroke,
            'stroke-width': strokeWidth,
            'stroke-linecap': 'round',
        }),
    );

    if (scale.min < 0 && scale.max > 0) {
        output.push(
            emptyElement('line', {
                x1: drawingArea.left,
                y1: getZeroY(state),
                x2: drawingArea.right,
                y2: getZeroY(state),
                stroke,
                'stroke-width': strokeWidth,
                'stroke-dasharray': 4,
                'stroke-linecap': 'round',
            }),
        );
    }

    return element('g', { 'data-layer': 'grid' }, output.join(''));
}

function isCoordinatePoint(point) {
    return (
        point &&
        typeof point === 'object' &&
        Number.isFinite(Number(point.x)) &&
        Number.isFinite(Number(point.y))
    );
}

function isContinuousScale(state) {
    return safeArray(state.series).some((serie) =>
        safeArray(serie.series).some(isCoordinatePoint),
    );
}

function getDatapointX(state, index, maxSeries) {
    const { drawingArea, config } = state;
    const gridPosition = getConfigValue(
        config,
        'chart.grid.position',
        'middle',
    );

    const availableWidth = drawingArea.width;
    const spacing =
        gridPosition === 'middle'
            ? availableWidth / Math.max(1, maxSeries)
            : availableWidth / Math.max(1, maxSeries - 1);

    if (gridPosition === 'middle') {
        return drawingArea.left + spacing / 2 + spacing * index;
    }

    return drawingArea.left + spacing * index;
}

function getContinuousXRange(state) {
    const values = safeArray(state.series)
        .flatMap((serie) => safeArray(serie.series))
        .filter(isCoordinatePoint)
        .map((point) => Number(point.x));

    if (!values.length) {
        return { min: 0, max: 1 };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    return min === max ? { min: min - 1, max: max + 1 } : { min, max };
}

function getContinuousX(state, x) {
    const { drawingArea, config } = state;
    const range = getContinuousXRange(state);

    const ratio = (Number(x) - range.min) / (range.max - range.min || 1);
    const reversed = Boolean(
        getConfigValue(config, 'chart.grid.labels.xAxis.reverse', false),
    );

    const finalRatio = reversed ? 1 - ratio : ratio;

    return drawingArea.left + drawingArea.width * finalRatio;
}

function formatContinuousXLabel(state, tick, index) {
    const { config } = state;

    return dataLabel({
        v: tick,
        s: getConfigValue(config, 'chart.labels.prefix', ''),
        p: getConfigValue(config, 'chart.labels.suffix', ''),
        r: getConfigValue(config, 'chart.grid.labels.xAxis.rounding', 0),
    });
}

function getContinuousXLabels(state) {
    const { scale, config } = state;
    const ticks = safeArray(scale?.ticks);

    const reversed = Boolean(
        getConfigValue(config, 'chart.grid.labels.xAxis.reverse', false),
    );

    return (reversed ? [...ticks].reverse() : ticks).map((tick, index) => ({
        id: `continuous_x_label_${index}`,
        text: formatContinuousXLabel(state, tick, index),
        value: tick,
        x: getContinuousX(state, tick),
        index,
        absoluteIndex: index,
    }));
}

async function getTimeLabels(state, series) {
    const { config } = state;

    const maxDatapoints = Math.max(
        0,
        ...series.map((serie) => safeArray(serie.plots).length),
    );

    return await useTimeLabels({
        values: getConfigValue(
            config,
            'chart.grid.labels.xAxisLabels.values',
            [],
        ),
        maxDatapoints,
        formatter: getConfigValue(
            config,
            'chart.grid.labels.xAxisLabels.datetimeFormatter',
            null,
        ),
        start: safeNumber(state.slotStartIndex ?? state.startAbs, 0),
        end: safeNumber(state.slotEndIndex ?? state.endAbs, maxDatapoints),
    });
}

async function getDisplayedTimeLabels(state, series) {
    const { config } = state;

    const cfg = getConfigValue(config, 'chart.grid.labels.xAxisLabels', {});
    const maxDatapoints = Math.max(
        0,
        ...series.map((serie) => safeArray(serie.plots).length),
    );

    const visibleLabels = await getTimeLabels(state, series);

    const allTimeLabels = await useTimeLabels({
        values: getConfigValue(
            config,
            'chart.grid.labels.xAxisLabels.values',
            [],
        ),
        maxDatapoints,
        formatter: getConfigValue(
            config,
            'chart.grid.labels.xAxisLabels.datetimeFormatter',
            null,
        ),
        start: 0,
        end: maxDatapoints,
    });

    const visibleTexts = visibleLabels.map((label) => label?.text ?? '');
    const allTexts = allTimeLabels.map((label) => label?.text ?? '');

    const modulo = Math.min(
        safeNumber(cfg.modulo, 1),
        Math.max(1, new Set(visibleTexts).size),
    );

    return buildDisplayedTimeLabels(
        Boolean(cfg.showOnlyFirstAndLast),
        Boolean(cfg.showOnlyAtModulo),
        Math.max(1, modulo || 1),
        visibleTexts,
        allTexts,
        safeNumber(state.slotStartIndex ?? state.startAbs, 0),
        state.selectedXIndex ?? null,
        maxDatapoints,
    );
}

async function getContinuousXLabelsOrDisplayedTimeLabels(state, series) {
    return isContinuousScale(state)
        ? getContinuousXLabels(state)
        : await getDisplayedTimeLabels(state, series);
}

function getXAxisLabelX(state, label, index, maxSeries) {
    return isContinuousScale(state)
        ? label.x
        : getDatapointX(state, index, maxSeries);
}

function getXAxisLabelRotation(state) {
    const userConfig =
        state.userConfig ?? state.sourceConfig ?? state.props?.config ?? {};

    if (hasDeepProperty(userConfig, 'chart.grid.labels.xAxisLabels.rotation')) {
        return safeNumber(
            getConfigValue(
                state.config,
                'chart.grid.labels.xAxisLabels.rotation',
                0,
            ),
            0,
        );
    }

    if (
        getConfigValue(
            state.config,
            'chart.grid.labels.xAxisLabels.autoRotate.enable',
            false,
        )
    ) {
        return safeNumber(
            getConfigValue(
                state.config,
                'chart.grid.labels.xAxisLabels.autoRotate.angle',
                0,
            ),
            0,
        );
    }

    return safeNumber(
        getConfigValue(
            state.config,
            'chart.grid.labels.xAxisLabels.rotation',
            0,
        ),
        0,
    );
}

async function renderXAxisLabels(state, series) {
    const { config, drawingArea } = state;

    if (!series[0]) return '';

    const show = getConfigValue(
        config,
        'chart.grid.labels.xAxisLabels.show',
        true,
    );

    if (!show) return '';

    const xAxisLabelsConfig = getConfigValue(
        config,
        'chart.grid.labels.xAxisLabels',
        {},
    );

    const fontSize = safeNumber(
        getConfigValue(config, 'chart.grid.labels.xAxisLabels.fontSize', 12),
        12,
    );

    const color = getConfigValue(
        config,
        'chart.grid.labels.xAxisLabels.color',
        getConfigValue(config, 'chart.grid.labels.color', '#2A2A2A'),
    );

    const rotation = getXAxisLabelRotation(state);
    const maxSeries = Math.max(1, series[0].plots.length);
    const labels = await getContinuousXLabelsOrDisplayedTimeLabels(
        state,
        series,
    );

    const textAnchor = rotation > 0 ? 'start' : rotation < 0 ? 'end' : 'middle';

    const output = labels
        .map((label, index) => {
            const content = typeof label === 'string' ? label : label?.text;

            if (!content) return '';

            const x = getXAxisLabelX(state, label, index, maxSeries);
            const y = drawingArea.bottom + fontSize * 1.5;
            const transform = `translate(${x}, ${y}), rotate(${rotation})`;

            if (String(content).includes('\n')) {
                return element(
                    'text',
                    {
                        class: 'vue-data-ui-time-label',
                        'data-cy': 'time-label',
                        'text-anchor': textAnchor,
                        'font-size': fontSize,
                        fill: color,
                        transform,
                    },
                    createTSpansFromLineBreaksOnX({
                        content: String(content),
                        fontSize,
                        fill: color,
                        x: 0,
                        y: 0,
                    }),
                );
            }

            return textElement(content, {
                class: 'vue-data-ui-time-label',
                'data-cy': 'time-label',
                'text-anchor': textAnchor,
                'font-size': fontSize,
                fill: color,
                transform,
            });
        })
        .join('');

    return element('g', { 'data-layer': 'x-axis-labels' }, output);
}

function renderAxisLabels(state) {
    const { config, drawingArea, height } = state;
    const fontSizes = getFontSizes(config);

    const xLabel = getConfigValue(config, 'chart.grid.labels.axis.xLabel', '');
    const yLabel = getConfigValue(config, 'chart.grid.labels.axis.yLabel', '');

    const color = getConfigValue(
        config,
        'chart.grid.labels.axis.color',
        getConfigValue(config, 'chart.grid.labels.color', '#2A2A2A'),
    );

    const yLabelOffsetX = safeNumber(
        getConfigValue(config, 'chart.grid.labels.axis.yLabelOffsetX', 0),
        0,
    );
    const xLabelOffsetY = safeNumber(
        getConfigValue(config, 'chart.grid.labels.axis.xLabelOffsetY', 0),
        0,
    );
    const crosshairSize = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.crosshairSize', 0),
        0,
    );
    const scaleValueOffsetX = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.scaleValueOffsetX', 0),
        0,
    );
    const yLabelWidth = safeNumber(
        getConfigValue(config, 'chart.grid.labels.yAxis.labelWidth', 0),
        0,
    );

    const right = yAxisLabelsAreRight(config);
    const output = [];

    if (xLabel) {
        output.push(
            textElement(xLabel, {
                x: drawingArea.left + drawingArea.width / 2,
                y: Math.min(
                    height - 4,
                    drawingArea.bottom + fontSizes.xAxis * 3 + xLabelOffsetY,
                ),
                'font-size': fontSizes.yAxis,
                'text-anchor': 'middle',
                fill: color,
            }),
        );
    }

    if (yLabel) {
        const x = right
            ? drawingArea.right +
              crosshairSize +
              scaleValueOffsetX +
              5 +
              yLabelWidth +
              yLabelOffsetX
            : drawingArea.scaleLabelX -
              crosshairSize -
              scaleValueOffsetX -
              yLabelWidth -
              yLabelOffsetX;

        const y = drawingArea.top + drawingArea.height / 2;

        output.push(
            textElement(yLabel, {
                x,
                y,
                transform: `rotate(-90 ${x} ${y})`,
                'font-size': fontSizes.yAxis,
                'text-anchor': 'middle',
                fill: color,
            }),
        );
    }

    return element('g', { 'data-layer': 'axis-labels' }, output.join(''));
}

async function renderXAxisTicks(state, series) {
    const { config, drawingArea } = state;

    const showXAxisLabels = getConfigValue(
        config,
        'chart.grid.labels.xAxisLabels.show',
        true,
    );

    const showCrosshairs = getConfigValue(
        config,
        'chart.grid.labels.xAxis.showCrosshairs',
        false,
    );

    if (!showXAxisLabels || !showCrosshairs || !series[0]) {
        return '';
    }

    const size = safeNumber(
        getConfigValue(config, 'chart.grid.labels.xAxis.crosshairSize', 6),
        6,
    );

    const alwaysAtZero = Boolean(
        getConfigValue(
            config,
            'chart.grid.labels.xAxis.crosshairsAlwaysAtZero',
            false,
        ),
    );

    const maxSeries = Math.max(1, series[0].plots.length);
    const labels = await getContinuousXLabelsOrDisplayedTimeLabels(
        state,
        series,
    );
    const zero = getZeroY(state);

    const path = labels
        .map((label, index) => {
            const content = typeof label === 'string' ? label : label?.text;

            if (!content) {
                return '';
            }

            const x = isContinuousScale(state)
                ? label.x
                : getDatapointX(state, index, maxSeries);

            const y1 = alwaysAtZero
                ? zero - (zero === drawingArea.bottom ? 0 : size / 2)
                : drawingArea.bottom;

            const y2 = alwaysAtZero
                ? zero + size / (zero === drawingArea.bottom ? 1 : 2)
                : drawingArea.bottom + size;

            return `M${x},${y1} L${x},${y2}`;
        })
        .filter(Boolean)
        .join(' ');

    if (!path) {
        return '';
    }

    return element(
        'g',
        { 'data-layer': 'x-axis-ticks' },
        emptyElement('path', {
            d: path,
            stroke: getConfigValue(config, 'chart.grid.stroke', '#CCCCCC'),
            'stroke-width': 1,
            'stroke-linecap': 'round',
            'data-cy': 'axis-x-tick',
        }),
    );
}

function getLegendLayout(state, series) {
    const { config, width } = state;

    const legend = getConfigValue(config, 'chart.legend', {});
    const fontSize = safeNumber(legend.fontSize, 12);
    const markerSize = safeNumber(legend.markerSize, 10);
    const itemGap = safeNumber(legend.itemGap, 16);
    const rowGap = safeNumber(legend.rowGap, 8);
    const padding = safeNumber(legend.padding, 8);

    const maxWidth = Math.max(1, width - padding * 2);

    const rows = [];
    let currentRow = [];
    let currentRowWidth = 0;

    series.forEach((serie) => {
        const label = String(serie.name ?? '');
        const itemWidth =
            markerSize + 6 + estimateTextWidth(label, fontSize) + itemGap;

        if (currentRow.length && currentRowWidth + itemWidth > maxWidth) {
            rows.push({
                items: currentRow,
                width: currentRowWidth,
            });

            currentRow = [];
            currentRowWidth = 0;
        }

        currentRow.push({
            serie,
            label,
            itemWidth,
        });

        currentRowWidth += itemWidth;
    });

    if (currentRow.length) {
        rows.push({
            items: currentRow,
            width: currentRowWidth,
        });
    }

    return {
        rows,
        fontSize,
        markerSize,
        itemGap,
        rowGap,
        padding,
        height:
            rows.length * Math.max(markerSize, fontSize) +
            Math.max(0, rows.length - 1) * rowGap +
            padding * 2,
    };
}

function renderLegend(state, series) {
    const { config, width, height } = state;

    const showLegend = getConfigValue(config, 'chart.legend.show', true);

    if (!showLegend || !series.length) {
        return '';
    }

    const legend = getConfigValue(config, 'chart.legend', {});
    const position = legend.position || 'bottom';
    const color =
        legend.color || getConfigValue(config, 'chart.color', '#2A2A2A');

    const layout = getLegendLayout(state, series);
    const lineHeight = Math.max(layout.markerSize, layout.fontSize);

    const startY =
        position === 'top'
            ? layout.padding + lineHeight
            : height - layout.height + layout.padding + lineHeight;

    const output = [];

    layout.rows.forEach((row, rowIndex) => {
        let cursorX = Math.max(layout.padding, width / 2 - row.width / 2);

        const y = startY + rowIndex * (lineHeight + layout.rowGap);

        row.items.forEach(({ serie, label, itemWidth }) => {
            output.push(
                emptyElement('rect', {
                    x: cursorX,
                    y: y - layout.markerSize / 2,
                    width: layout.markerSize,
                    height: layout.markerSize,
                    rx: 2,
                    fill: serie.color,
                }),
            );

            output.push(
                textElement(label, {
                    x: cursorX + layout.markerSize + 6,
                    y: y + 2,
                    'font-size': layout.fontSize,
                    'dominant-baseline': 'middle',
                    fill: color,
                }),
            );

            cursorX += itemWidth;
        });
    });

    return element('g', { 'data-layer': 'legend' }, output.join(''));
}

function getVisibleBarSeries(series) {
    return series.filter((serie) => serie.type === 'bar');
}

function getMaxSeriesLength(series) {
    return Math.max(1, ...series.map((serie) => safeArray(serie.plots).length));
}

function getBarLayout(state, series) {
    const { config, drawingArea } = state;
    const barSeries = getVisibleBarSeries(series);
    const maxSeries = getMaxSeriesLength(series);
    const barSeriesCount = Math.max(1, barSeries.length);

    const slotLine = drawingArea.width / maxSeries;
    const slotBar = drawingArea.width / maxSeries / barSeriesCount;
    const barPeriodGap =
        slotLine * safeNumber(getConfigValue(config, 'bar.periodGap', 0), 0);

    const barSlot =
        drawingArea.width / maxSeries / barSeriesCount -
        barPeriodGap * barSeriesCount;

    const barWidth = Math.max(0.00001, slotBar - barPeriodGap);

    const barInnerGap =
        barWidth *
        Math.min(
            Math.abs(safeNumber(getConfigValue(config, 'bar.innerGap', 0), 0)),
            0.95,
        );

    return {
        barSeries,
        maxSeries,
        barSeriesCount,
        slotLine,
        slotBar,
        barSlot,
        barPeriodGap,
        barWidth,
        barInnerGap,
    };
}

function getBarPlotX(state, serieIndex, plotIndex, layout) {
    return (
        state.drawingArea.left +
        layout.slotBar * serieIndex +
        layout.slotBar * plotIndex * layout.barSeriesCount -
        layout.barSlot / 2 -
        serieIndex * layout.barPeriodGap
    );
}

function getBarRectX(state, serieIndex, plotIndex, layout) {
    return (
        getBarPlotX(state, serieIndex, plotIndex, layout) +
        layout.slotBar / 2 +
        layout.barInnerGap / 2
    );
}

function getBarBaselineY(state) {
    const { config, drawingArea, scale } = state;

    const scaleMin = getConfigValue(
        config,
        'chart.grid.labels.yAxis.scaleMin',
        null,
    );

    if (
        scaleMin !== null &&
        scaleMin !== undefined &&
        scaleMin > 0 &&
        scale.min >= 0
    ) {
        return drawingArea.bottom;
    }

    if (scale.min <= 0 && scale.max >= 0) {
        return getZeroY(state);
    }

    return scale.min > 0 ? drawingArea.bottom : drawingArea.top;
}

function getBarY(state, plot, zeroY) {
    if (plot.value >= 0) {
        return plot.y;
    }

    return Number.isFinite(zeroY) ? zeroY : state.drawingArea.bottom;
}

function getBarHeight(plot, zeroY) {
    if (plot.value >= 0) {
        return Math.max(0.00001, zeroY - plot.y);
    }

    return Math.max(0.00001, plot.y - zeroY);
}

function splitLineSegments(plots) {
    const segments = [];
    let currentSegment = [];

    safeArray(plots).forEach((plot) => {
        if (
            plot &&
            isFiniteNumber(plot.value) &&
            isFiniteNumber(plot.x) &&
            isFiniteNumber(plot.y)
        ) {
            currentSegment.push(plot);
        } else if (currentSegment.length) {
            segments.push(currentSegment);
            currentSegment = [];
        }
    });

    if (currentSegment.length) {
        segments.push(currentSegment);
    }

    return segments;
}

function getAreaGradientId(state, serieIndex) {
    return `areaGradient_${serieIndex}_${state.uniqueId ?? 'ssr'}`;
}

function renderAreaGradients(state, series) {
    const { config } = state;

    if (!getConfigValue(config, 'line.area.useGradient', false)) {
        return '';
    }

    const opacity = safeNumber(
        getConfigValue(config, 'line.area.opacity', 30),
        30,
    );

    const gradients = series
        .filter((serie) => serie.type === 'line' && serie.useArea)
        .map((serie, serieIndex) =>
            element(
                'linearGradient',
                {
                    id: getAreaGradientId(state, serieIndex),
                    x1: '0%',
                    x2: '0%',
                    y1: '0%',
                    y2: '100%',
                },
                [
                    emptyElement('stop', {
                        offset: '0%',
                        'stop-color': setOpacity(
                            shiftHue(convertColorToHex(serie.color), 0.03),
                            opacity,
                        ),
                        'stop-opacity': 1,
                    }),
                    emptyElement('stop', {
                        offset: '100%',
                        'stop-color': serie.color,
                        'stop-opacity': 0,
                    }),
                ].join(''),
            ),
        )
        .join('');

    return gradients ? element('defs', {}, gradients) : '';
}

function renderLineAreas(state, series) {
    const { config } = state;
    const cutNullValues = Boolean(
        getConfigValue(config, 'line.cutNullValues', false),
    );
    const output = [];

    series
        .filter((serie) => serie.type === 'line' && serie.useArea)
        .forEach((serie, serieIndex) => {
            const plots = safeArray(serie.plots);
            const validPlots = plots.filter(
                (plot) => plot && plot.value !== null,
            );

            if (validPlots.length < 2) return;

            const zeroY = Number.isFinite(Number(serie.__zeroY))
                ? Number(serie.__zeroY)
                : getZeroY(state);

            const fill = getAreaFill(state, serie, serieIndex);

            if (serie.smooth && !serie.useStepper) {
                createSmoothAreaSegments(
                    cutNullValues ? plots : validPlots,
                    zeroY,
                    cutNullValues,
                ).forEach((path) => {
                    if (!path) return;

                    output.push(
                        emptyElement('path', {
                            d: path,
                            fill,
                            'data-cy': 'datapoint-line-area-smooth',
                        }),
                    );
                });

                return;
            }

            const areaPath = serie.useStepper
                ? createStepperPath(cutNullValues ? plots : validPlots, zeroY)
                : cutNullValues
                  ? createIndividualAreaWithCuts(plots, zeroY)
                  : createIndividualArea(validPlots, zeroY);

            areaPath
                .split(';')
                .filter(Boolean)
                .forEach((path) => {
                    output.push(
                        emptyElement('path', {
                            d: `M${path}Z`,
                            fill,
                            'data-cy': 'datapoint-line-area-straight',
                        }),
                    );
                });
        });

    return element('g', { 'data-layer': 'line-areas' }, output.join(''));
}

function getSerieDashIndices(serie, state) {
    const start = safeNumber(state.slotStartIndex ?? state.startAbs, 0);

    return safeArray(serie.dashIndices)
        .map((index) => Number(index) - start)
        .filter(Number.isFinite);
}

function renderLinePathElement(state, serie, serieIndex, path, dashed) {
    const { config } = state;
    const strokeWidth = safeNumber(
        serie.strokeWidth || getConfigValue(config, 'line.strokeWidth', 2),
        2,
    );

    return emptyElement('path', {
        d: `M${path}`,
        fill: 'none',
        stroke: getLineStroke(state, serie, serieIndex),
        'stroke-width': strokeWidth,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke-dasharray': dashed ? strokeWidth * 2 : 0,
    });
}

function renderLines(state, series) {
    const { config } = state;
    const lineSeries = series.filter((serie) => serie.type === 'line');
    const cutNullValues = Boolean(
        getConfigValue(config, 'line.cutNullValues', false),
    );
    const output = [];

    lineSeries.forEach((serie, serieIndex) => {
        const plots = cutNullValues
            ? safeArray(serie.plots)
            : safeArray(serie.plots).filter((plot) => plot.value !== null);

        const validPoints = plots.filter((plot) => plot.value !== null);

        if (validPoints.length < 2) return;

        const hasDashedSegments = safeArray(serie.dashIndices).length > 0;

        if (hasDashedSegments && !serie.useStepper) {
            const dashIndices = getSerieDashIndices(serie, state);

            const segments =
                serie.smooth || getConfigValue(config, 'line.smooth', false)
                    ? createSmoothPathWithCutsSegments(plots, dashIndices)
                    : createStraightPathWithCutsSegments(plots, dashIndices);

            segments.forEach((segment) => {
                if (!segment?.path) return;

                output.push(
                    renderLinePathElement(
                        state,
                        serie,
                        serieIndex,
                        segment.path,
                        Boolean(segment.dashed),
                    ),
                );
            });

            return;
        }

        const paths = serie.useStepper
            ? createStepperPath(plots).split(';').filter(Boolean)
            : [
                  serie.smooth || getConfigValue(config, 'line.smooth', false)
                      ? cutNullValues
                          ? createSmoothPathWithCuts(plots)
                          : createSmoothPath(validPoints)
                      : cutNullValues
                        ? createStraightPathWithCuts(plots)
                        : createStraightPath(validPoints, false, true),
              ];

        paths.forEach((path) => {
            if (!path) return;

            output.push(
                renderLinePathElement(
                    state,
                    serie,
                    serieIndex,
                    path,
                    Boolean(serie.dashed),
                ),
            );
        });
    });

    return element('g', { 'data-layer': 'lines' }, output.join(''));
}

function getPlotDotFill(state, serie, serieIndex) {
    const { config } = state;

    if (getConfigValue(config, 'plot.useGradient', false)) {
        return `url(#${getPlotGradientId(state, serieIndex)})`;
    }

    return getConfigValue(config, 'plot.dot.useSerieColor', true)
        ? serie.color
        : getConfigValue(config, 'plot.dot.fill', serie.color);
}

function getBarBorderAttributes(state, serie) {
    const border = getConfigValue(state.config, 'bar.border', {});

    return {
        stroke: border.useSerieColor ? serie.color : border.stroke,
        'stroke-width': safeNumber(border.strokeWidth, 0),
    };
}

function renderPlots(state, series) {
    const { config } = state;
    const plotSeries = series.filter((serie) => serie.type === 'plot');

    const radius = getConfigValue(config, 'plot.radius', 4);
    const strokeWidth = getConfigValue(config, 'plot.dot.strokeWidth', 2);
    const backgroundColor = getConfigValue(
        config,
        'chart.backgroundColor',
        '#FFFFFF',
    );

    const output = [];

    plotSeries.forEach((serie, serieIndex) => {
        serie.plots.forEach((plot, plotIndex) => {
            if (!isFiniteNumber(plot.value)) return;

            output.push(
                renderShape({
                    dataCy: `xy-plot-${serieIndex}-${plotIndex}`,
                    shape: serie.shape,
                    plot,
                    radius: serie.radius || radius,
                    fill: getPlotDotFill(state, serie, serieIndex),
                    stroke: getConfigValue(
                        config,
                        'plot.dot.useSerieColor',
                        true,
                    )
                        ? backgroundColor
                        : serie.color,
                    strokeWidth,
                }),
            );
        });
    });

    return element('g', { 'data-layer': 'plots' }, output.join(''));
}

function canShowValue(value) {
    return ![null, undefined, NaN, Infinity, -Infinity].includes(value);
}

function isPlotAlone(plotSeries, index, config) {
    const before = plotSeries[index - 1];
    const after = plotSeries[index + 1];

    const isAlone =
        (!!before && !!after && before.value == null && after.value == null) ||
        (!before && !!after && after.value == null) ||
        (!!before && !after && before.value == null);

    return (
        canShowValue(plotSeries[index]?.value) &&
        isAlone &&
        Boolean(getConfigValue(config, 'line.cutNullValues', false))
    );
}

function shouldRenderLineDot(state, serie, plot, index, maxSeries) {
    const { config } = state;

    if (!plot || !canShowValue(plot.value)) {
        return false;
    }

    const hideAboveMaxSerieLength = safeNumber(
        getConfigValue(config, 'line.dot.hideAboveMaxSerieLength', Infinity),
        Infinity,
    );

    const optimizeLinePlot = maxSeries > hideAboveMaxSerieLength;

    if (!optimizeLinePlot) {
        return true;
    }

    const selectedSerieIndex = state.selectedSerieIndex ?? null;
    const selectedMinimapIndex = state.selectedMinimapIndex ?? null;

    return (
        (selectedSerieIndex !== null && selectedSerieIndex === index) ||
        (selectedMinimapIndex !== null && selectedMinimapIndex === index) ||
        isPlotAlone(serie.plots, index, config)
    );
}

function renderLineDots(state, series) {
    const { config } = state;
    const lineSeries = series.filter((serie) => serie.type === 'line');

    const maxSeries = Math.max(
        0,
        ...lineSeries.map((serie) => safeArray(serie.plots).length),
    );

    const radius = getConfigValue(config, 'line.radius', 4);
    const strokeWidth = getConfigValue(config, 'line.dot.strokeWidth', 2);
    const backgroundColor = getConfigValue(
        config,
        'chart.backgroundColor',
        '#FFFFFF',
    );

    const output = [];

    lineSeries.forEach((serie, serieIndex) => {
        serie.plots.forEach((plot, plotIndex) => {
            if (
                !shouldRenderLineDot(state, serie, plot, plotIndex, maxSeries)
            ) {
                return;
            }

            output.push(
                renderShape({
                    dataCy: 'datapoint-line-plot',
                    shape: serie.shape,
                    plot,
                    radius: serie.radius || radius,
                    fill: getLineDotFill(state, serie, serieIndex),
                    stroke: getConfigValue(
                        config,
                        'line.dot.useSerieColor',
                        true,
                    )
                        ? backgroundColor
                        : serie.color,
                    strokeWidth,
                }),
            );
        });
    });

    return element('g', { 'data-layer': 'line-dots' }, output.join(''));
}

function renderInterLineAreas(state, series) {
    const { config } = state;

    if (isYAxisStacked(config)) return '';

    const interLine = getConfigValue(config, 'line.interLine', {});
    const pairs = safeArray(interLine.pairs);
    const colors = safeArray(interLine.colors);

    if (!pairs.length) return '';

    const lineSeries = series.filter((serie) => serie.type === 'line');
    const fillOpacity = safeNumber(interLine.fillOpacity, 0.2);
    const cutNullValues = Boolean(
        getConfigValue(config, 'line.cutNullValues', false),
    );

    const output = [];

    pairs.forEach((pair, pairIndex) => {
        const [nameA, nameB] = Array.isArray(pair) ? pair : [pair?.a, pair?.b];

        if (!nameA || !nameB) return;

        const lineA = lineSeries.find((serie) => serie.name === nameA);
        const lineB = lineSeries.find((serie) => serie.name === nameB);

        if (!lineA || !lineB) return;

        const colorLineA = colors?.[pairIndex]?.[0] ?? lineA.color;
        const colorLineB = colors?.[pairIndex]?.[1] ?? lineB.color;

        const areas = buildInterLineAreas({
            lineA: safeArray(lineA.plots),
            lineB: safeArray(lineB.plots),
            smoothA: Boolean(lineA.smooth),
            smoothB: Boolean(lineB.smooth),
            colorLineA,
            colorLineB,
            sampleStepPx: 2,
            cutNullValues,
        });

        areas.forEach((area, areaIndex) => {
            output.push(
                emptyElement('path', {
                    'data-cy': 'interline-area',
                    d: area.d,
                    fill: area.color,
                    'fill-opacity': fillOpacity,
                    stroke: 'none',
                    'pointer-events': 'none',
                    'data-key': `inter_${nameA}_${nameB}_${pairIndex}_${areaIndex}`,
                }),
            );
        });
    });

    return output.length
        ? element('g', { 'data-layer': 'interline-areas' }, output.join(''))
        : '';
}

function getTitleBlockHeight(config) {
    const title = getConfigValue(config, 'chart.title', {});
    const subtitle = getConfigValue(title, 'subtitle', {});

    if (!title.show) return 0;

    const titleFontSize = safeNumber(title.fontSize, 20);
    const subtitleFontSize = subtitle.text
        ? safeNumber(subtitle.fontSize, 14)
        : 0;

    const paddingTop = safeNumber(title.paddingTop, 12);
    const paddingBottom = safeNumber(title.paddingBottom, 6);

    return (
        paddingTop +
        titleFontSize +
        (subtitle.text ? subtitleFontSize + 4 : 0) +
        paddingBottom
    );
}

function renderTitle(state) {
    const { config, width } = state;
    const title = getConfigValue(config, 'chart.title', {});
    const subtitle = getConfigValue(title, 'subtitle', {});

    if (!title.show || !title.text) return '';

    const align = title.textAlign || 'center';
    const x =
        align === 'left'
            ? safeNumber(title.paddingLeft, 12)
            : align === 'right'
              ? width - safeNumber(title.paddingRight, 12)
              : width / 2;

    const textAnchor =
        align === 'left' ? 'start' : align === 'right' ? 'end' : 'middle';

    const titleFontSize = safeNumber(title.fontSize, 20);
    const subtitleFontSize = safeNumber(subtitle.fontSize, 14);
    const y = safeNumber(title.paddingTop, 12) + titleFontSize;

    const output = [
        textElement(title.text, {
            'data-cy': 'xy-div-title',
            x,
            y,
            'font-size': titleFontSize,
            'font-weight': title.bold ? '700' : '400',
            'text-anchor': textAnchor,
            fill:
                title.color || getConfigValue(config, 'chart.color', '#2A2A2A'),
        }),
    ];

    if (subtitle.text) {
        output.push(
            textElement(subtitle.text, {
                'data-cy': 'xy-div-subtitle',
                x,
                y: y + subtitleFontSize + 4,
                'font-size': subtitleFontSize,
                'font-weight': subtitle.bold ? '700' : '400',
                'text-anchor': textAnchor,
                fill:
                    subtitle.color ||
                    title.color ||
                    getConfigValue(config, 'chart.color', '#2A2A2A'),
            }),
        );
    }

    return element('g', { 'data-layer': 'title' }, output.join(''));
}

function renderSvgTitle(state) {
    if (!state.svgTitle) return '';
    const output = [state.svgTitle];
    return element('desc', { 'aria-hidden': 'true' }, output.join(''));
}

function shouldRenderDatapointLabel(state, serie, plot, plotIndex, type) {
    if (
        !plot ||
        plot.value === null ||
        plot.value === undefined ||
        !Number.isFinite(Number(plot.value))
    ) {
        return false;
    }

    if (!getConfigValue(state.config, 'dataLabels.show', true)) {
        return false;
    }

    if (!getConfigValue(state.config, `${type}.labels.show`, false)) {
        return false;
    }

    return (
        !Object.hasOwn(serie, 'dataLabels') ||
        serie.dataLabels === true ||
        state.selectedSerieIndex === plotIndex ||
        state.selectedMinimapIndex === plotIndex
    );
}

function getDatapointLabelContent(state, serie, plot, type) {
    const { config } = state;
    const fontSize = safeNumber(
        getConfigValue(
            config,
            `${type}.labels.fontSize`,
            getConfigValue(config, 'chart.labels.fontSize', 12),
        ),
        12,
    );
    const color = getConfigValue(
        config,
        `${type}.labels.color`,
        getConfigValue(config, 'chart.color', '#2A2A2A'),
    );

    const yValue = dataLabel({
        p: serie.prefix || getConfigValue(config, 'chart.labels.prefix', ''),
        v: plot.value,
        s: serie.suffix || getConfigValue(config, 'chart.labels.suffix', ''),
        r: getConfigValue(config, `${type}.labels.rounding`, 0),
    });

    const content =
        isContinuousScale(state) && Number.isFinite(Number(plot.x))
            ? `x: ${dataLabel({
                  v: plot.x,
                  r: getConfigValue(
                      config,
                      'chart.grid.labels.xAxis.rounding',
                      0,
                  ),
              })}\ny: ${yValue}`
            : applyDataLabel(
                  getConfigValue(config, `${type}.labels.formatter`, null),
                  plot.value,
                  yValue,
                  {
                      datapoint: plot,
                      serie,
                  },
              );

    return createTSpansFromLineBreaksOnX({
        content,
        fontSize,
        fill: color,
        x: 0,
        y: 0,
    });
}

function getDatapointLabelTextAnchor(state, plot, type) {
    const configured = getConfigValue(
        state.config,
        `${type}.labels.textAnchor`,
        null,
    );

    if (configured !== null) {
        return configured;
    }

    const rotation = safeNumber(
        getConfigValue(state.config, `${type}.labels.rotation`, 0),
        0,
    );

    if (rotation === 0) {
        return 'middle';
    }

    if (getConfigValue(state.config, `${type}.labels.alwaysOnTop`, false)) {
        return 'start';
    }

    return plot.value >= 0 ? 'start' : 'end';
}

function getDatapointLabelTransformLineOrPlot(state, plot, type) {
    const offsetX = safeNumber(
        getConfigValue(state.config, `${type}.labels.offsetX`, 0),
        0,
    );
    const offsetY = safeNumber(
        getConfigValue(state.config, `${type}.labels.offsetY`, -12),
        -12,
    );
    const rotation = safeNumber(
        getConfigValue(state.config, `${type}.labels.rotation`, 0),
        0,
    );
    const alwaysOnTop = Boolean(
        getConfigValue(state.config, `${type}.labels.alwaysOnTop`, false),
    );

    const x = plot.x + offsetX;
    const y =
        plot.y +
        (alwaysOnTop ? offsetY : plot.value >= 0 ? offsetY : -offsetY * 3);

    return `translate(${x}, ${y}) rotate(${rotation})`;
}

function getDatapointLabelTransformBar(state, serie, plot) {
    const offsetX = safeNumber(
        getConfigValue(state.config, 'bar.labels.offsetX', 0),
        0,
    );
    const offsetY = safeNumber(
        getConfigValue(state.config, 'bar.labels.offsetY', -6),
        -6,
    );
    const rotation = safeNumber(
        getConfigValue(state.config, 'bar.labels.rotation', 0),
        0,
    );
    const alwaysOnTop = Boolean(
        getConfigValue(state.config, 'bar.labels.alwaysOnTop', false),
    );
    const zeroY = Number.isFinite(Number(serie.__zeroY))
        ? Number(serie.__zeroY)
        : getZeroY(state);
    const barHeight = Math.abs(zeroY - plot.y);

    const x = plot.__barLabelX ?? plot.x;
    const y =
        plot.y +
        (alwaysOnTop
            ? offsetY - (plot.value < 0 ? barHeight : 0)
            : plot.value >= 0
              ? offsetY
              : -offsetY * 3);

    return `translate(${x + offsetX}, ${y}) rotate(${rotation})`;
}

function renderDatapointLabels(state, series) {
    const { config } = state;
    const fontSize = safeNumber(
        getConfigValue(config, 'chart.labels.fontSize', 12),
        12,
    );
    const backgroundColor = getConfigValue(
        config,
        'chart.backgroundColor',
        '#FFFFFF',
    );
    const output = [];

    series.forEach((serie) => {
        safeArray(serie.plots).forEach((plot, plotIndex) => {
            const type = serie.type;

            if (!['line', 'bar', 'plot'].includes(type)) {
                return;
            }

            if (
                !shouldRenderDatapointLabel(state, serie, plot, plotIndex, type)
            ) {
                return;
            }

            output.push(
                element(
                    'text',
                    {
                        'data-cy': `datapoint-${type}-label`,
                        transform:
                            type === 'bar'
                                ? getDatapointLabelTransformBar(
                                      state,
                                      serie,
                                      plot,
                                  )
                                : getDatapointLabelTransformLineOrPlot(
                                      state,
                                      plot,
                                      type,
                                  ),
                        'text-anchor': getDatapointLabelTextAnchor(
                            state,
                            plot,
                            type,
                        ),
                        'font-size': getConfigValue(
                            config,
                            `${type}.labels.fontSize`,
                            fontSize,
                        ),
                        fill: getConfigValue(
                            config,
                            `${type}.labels.color`,
                            getConfigValue(config, 'chart.color', '#2A2A2A'),
                        ),
                        stroke: backgroundColor,
                        'paint-order': 'stroke',
                    },
                    getDatapointLabelContent(state, serie, plot, type),
                ),
            );
        });
    });

    return element('g', { 'data-layer': 'datapoint-labels' }, output.join(''));
}

function getVisibleIndexStart(state) {
    return safeNumber(state.slotStartIndex ?? state.startAbs, 0);
}

function getVisibleIndexEnd(state, series) {
    const maxSeries = Math.max(
        0,
        ...series.map((serie) => safeArray(serie.plots).length),
    );

    return safeNumber(state.slotEndIndex ?? state.endAbs, maxSeries);
}

function getHorizontalBandWidth(state, maxSeries) {
    const { drawingArea, config } = state;
    const gridPosition = getConfigValue(
        config,
        'chart.grid.position',
        'middle',
    );

    if (gridPosition === 'middle') {
        return drawingArea.width / Math.max(1, maxSeries);
    }

    return drawingArea.width / Math.max(1, maxSeries - 1);
}

function getHighlightAreaX(state, localIndex, maxSeries) {
    const { drawingArea, config } = state;
    const bandWidth = getHorizontalBandWidth(state, maxSeries);
    const gridPosition = getConfigValue(
        config,
        'chart.grid.position',
        'middle',
    );

    if (gridPosition === 'middle') {
        return drawingArea.left + bandWidth * localIndex;
    }

    return drawingArea.left + bandWidth * localIndex - bandWidth / 2;
}

function getHighlightAreaWidth(state, maxSeries) {
    return getHorizontalBandWidth(state, maxSeries);
}

function renderHighlightAreaCaption(
    state,
    area,
    areaIndex,
    firstVisibleIndex,
    span,
    maxSeries,
) {
    const { drawingArea } = state;
    const caption = area.caption ?? {};

    if (!caption.text) {
        return '';
    }

    const spanWidth = getHighlightAreaWidth(state, maxSeries) * span;
    const width =
        caption.width === 'auto'
            ? spanWidth
            : safeNumber(caption.width, spanWidth);

    const x =
        getHighlightAreaX(state, firstVisibleIndex, maxSeries) -
        (caption.width === 'auto' ? 0 : width / 2 - spanWidth / 2);

    const y = drawingArea.top + safeNumber(caption.offsetY, 0);

    return element(
        'foreignObject',
        {
            'data-key': `highlight_area_caption_${areaIndex}`,
            x,
            y,
            width,
            height: 1,
            overflow: 'visible',
        },
        element(
            'div',
            {
                xmlns: 'http://www.w3.org/1999/xhtml',
                'data-cy': 'highlight-area-caption',
                style: [
                    `padding:${safeNumber(caption.padding, 0)}px`,
                    `text-align:${caption.textAlign || 'center'}`,
                    `font-size:${safeNumber(caption.fontSize, 12)}px`,
                    `color:${caption.color || '#2A2A2A'}`,
                    `font-weight:${caption.bold ? 'bold' : 'normal'}`,
                ].join(';'),
            },
            escapeXml(caption.text),
        ),
    );
}

function renderHighlightAreas(state, series) {
    const { config, drawingArea } = state;
    const highlightAreas = safeArray(
        getConfigValue(config, 'chart.highlightArea', []),
    );

    if (!highlightAreas.length) {
        return '';
    }

    const maxSeries = Math.max(
        1,
        ...series.map((serie) => safeArray(serie.plots).length),
    );

    const visibleStart = getVisibleIndexStart(state);
    const visibleEnd = getVisibleIndexEnd(state, series);

    const output = [];

    highlightAreas.forEach((area, areaIndex) => {
        if (!area?.show) {
            return;
        }

        const from = safeNumber(area.from, 0);
        const to = Math.min(safeNumber(area.to, from), maxSeries - 1);

        if (to < from) {
            return;
        }

        for (
            let absoluteIndex = from;
            absoluteIndex <= to;
            absoluteIndex += 1
        ) {
            if (
                absoluteIndex < visibleStart ||
                absoluteIndex > visibleEnd - 1
            ) {
                continue;
            }

            const localIndex = absoluteIndex - visibleStart;

            output.push(
                emptyElement('rect', {
                    'data-cy': 'highlight-area',
                    'data-key': `highlight_area_${areaIndex}_${absoluteIndex}`,
                    x: getHighlightAreaX(state, localIndex, maxSeries),
                    y: drawingArea.top,
                    width: getHighlightAreaWidth(state, maxSeries),
                    height: Math.max(1, drawingArea.height),
                    fill: setOpacity(area.color, safeNumber(area.opacity, 20)),
                    'pointer-events': 'none',
                }),
            );
        }

        const firstVisibleAbsoluteIndex = Math.max(from, visibleStart);
        const lastVisibleAbsoluteIndex = Math.min(to, visibleEnd - 1);

        if (firstVisibleAbsoluteIndex <= lastVisibleAbsoluteIndex) {
            output.push(
                renderHighlightAreaCaption(
                    state,
                    area,
                    areaIndex,
                    firstVisibleAbsoluteIndex - visibleStart,
                    to - from + 1,
                    maxSeries,
                ),
            );
        }
    });

    return output.length
        ? element('g', { 'data-layer': 'highlight-areas' }, output.join(''))
        : '';
}

function getAnnotationY(state, value) {
    const { drawingArea, scale } = state;
    const ratio = (Number(value) - scale.min) / (scale.max - scale.min || 1);

    return drawingArea.bottom - ratio * drawingArea.height;
}

function getAnnotationTextWidth(label) {
    return estimateTextWidth(label.text, safeNumber(label.fontSize, 12));
}

function getAnnotationLabelBox(label, xText, yText) {
    const fontSize = safeNumber(label.fontSize, 12);
    const padding = label.padding ?? {};
    const border = label.border ?? {};
    const textWidth = getAnnotationTextWidth(label);
    const textHeight = fontSize;

    let x;

    if (label.textAnchor === 'middle') {
        x = xText - textWidth / 2 - safeNumber(padding.left, 0);
    } else if (label.textAnchor === 'end') {
        x = xText - textWidth - safeNumber(padding.right, 0);
    } else {
        x = xText - safeNumber(padding.left, 0);
    }

    return {
        x,
        y: yText - textHeight * 0.75 - safeNumber(padding.top, 0),
        width:
            textWidth +
            safeNumber(padding.left, 0) +
            safeNumber(padding.right, 0),
        height:
            textHeight +
            safeNumber(padding.top, 0) +
            safeNumber(padding.bottom, 0),
        fill: label.backgroundColor,
        stroke: border.stroke,
        rx: border.rx,
        ry: border.ry,
        'stroke-width': border.strokeWidth,
    };
}

function renderAnnotations(state) {
    const { config, drawingArea } = state;

    if (isYAxisStacked(config)) {
        return '';
    }

    const annotations = safeArray(
        getConfigValue(config, 'chart.annotations', []),
    ).filter(
        (annotation) =>
            annotation?.show &&
            (annotation.yAxis?.yTop !== null ||
                annotation.yAxis?.yBottom !== null) &&
            (annotation.yAxis?.yTop !== undefined ||
                annotation.yAxis?.yBottom !== undefined),
    );

    if (!annotations.length) {
        return '';
    }

    const output = [];

    annotations.forEach((annotation, annotationIndex) => {
        const yAxis = annotation.yAxis ?? {};
        const label = yAxis.label ?? {};
        const line = yAxis.line ?? {};
        const area = yAxis.area ?? {};

        const hasYTop = yAxis.yTop !== null && yAxis.yTop !== undefined;
        const hasYBottom =
            yAxis.yBottom !== null && yAxis.yBottom !== undefined;

        const yTop = hasYTop ? getAnnotationY(state, yAxis.yTop) : null;
        const yBottom = hasYBottom
            ? getAnnotationY(state, yAxis.yBottom)
            : null;

        const finiteYTop = Number.isFinite(Number(yTop));
        const finiteYBottom = Number.isFinite(Number(yBottom));

        if (!finiteYTop && !finiteYBottom) {
            return;
        }

        const annotationContent = [];

        if (finiteYTop) {
            annotationContent.push(
                emptyElement('line', {
                    x1: drawingArea.left,
                    y1: yTop,
                    x2: drawingArea.right,
                    y2: yTop,
                    stroke: line.stroke,
                    'stroke-width': line.strokeWidth,
                    'stroke-dasharray': line.strokeDasharray,
                    'stroke-linecap': 'round',
                    'data-cy': 'xy-annotation-y-top-line',
                }),
            );
        }

        if (finiteYBottom) {
            annotationContent.push(
                emptyElement('line', {
                    x1: drawingArea.left,
                    y1: yBottom,
                    x2: drawingArea.right,
                    y2: yBottom,
                    stroke: line.stroke,
                    'stroke-width': line.strokeWidth,
                    'stroke-dasharray': line.strokeDasharray,
                    'stroke-linecap': 'round',
                    'data-cy': 'xy-annotation-y-bottom-line',
                }),
            );
        }

        if (finiteYTop && finiteYBottom && yTop !== yBottom) {
            annotationContent.push(
                emptyElement('rect', {
                    x: drawingArea.left,
                    y: Math.min(yTop, yBottom),
                    width: drawingArea.width,
                    height: Math.abs(yTop - yBottom),
                    fill: setOpacity(
                        area.fill ||
                            line.stroke ||
                            getConfigValue(config, 'chart.color', '#2A2A2A'),
                        safeNumber(area.opacity, 20),
                    ),
                    'data-cy': 'xy-annotation-y-area',
                    'pointer-events': 'none',
                }),
            );
        }

        if (label.text) {
            const padding = label.padding ?? {};
            const baseY =
                finiteYTop && finiteYBottom
                    ? Math.min(yTop, yBottom)
                    : finiteYTop
                      ? yTop
                      : yBottom;

            const xText =
                (label.position === 'start'
                    ? drawingArea.left + safeNumber(padding.left, 0)
                    : drawingArea.right - safeNumber(padding.right, 0)) +
                safeNumber(label.offsetX, 0);

            const yText =
                baseY -
                safeNumber(label.fontSize, 12) / 3 +
                safeNumber(label.offsetY, 0) -
                safeNumber(padding.top, 0);

            const labelBox = getAnnotationLabelBox(label, xText, yText);

            if (Number.isFinite(labelBox.y) && Number.isFinite(yText)) {
                annotationContent.push(
                    emptyElement('rect', {
                        class: 'vue-ui-xy-annotation-label-box',
                        ...labelBox,
                        'data-cy': 'xy-annotation-label-box',
                    }),
                );

                annotationContent.push(
                    textElement(label.text, {
                        class: 'vue-ui-xy-annotation-label',
                        x: xText,
                        y: yText,
                        'font-size': label.fontSize,
                        fill: label.color,
                        'text-anchor': label.textAnchor,
                        'data-cy': 'xy-annotation-label',
                    }),
                );
            }
        }

        output.push(
            element(
                'g',
                {
                    'data-layer': 'annotation',
                    'data-key': `annotation_y_${annotationIndex}`,
                },
                annotationContent.join(''),
            ),
        );
    });

    return output.length
        ? element('g', { 'data-layer': 'annotations' }, output.join(''))
        : '';
}

function renderAdditionalSvgContent(state, series) {
    const additionalSvgContent = state.additionalSvgContent;

    if (typeof additionalSvgContent === 'function') {
        const content =
            additionalSvgContent({
                width: state.width,
                height: state.height,
                drawingArea: state.drawingArea,
                scale: state.scale,
                config: state.config,
                series: series.map((serie) => ({
                    ...serie,
                    plots: safeArray(serie.plots).map((plot) => ({ ...plot })),
                })),
            }) ?? '';
        return content;
    }

    return additionalSvgContent ?? '';
}

export async function renderVueUiXySvg(state) {
    const config = state.config;
    const width = safeNumber(state.width, config.chart.width ?? 1000);
    const height = safeNumber(state.height, config.chart.height ?? 600);

    const series = getSeries({
        ...state,
        config,
        width,
        height,
    });

    const baseState = {
        ...state,
        config,
        width,
        height,
        scale: buildGlobalScaleFromSeries(config, state.scale, series),
    };

    const renderState = createLayoutAdjustedState(baseState, series);
    const adjustedSeries = renderState.series;

    return `
<svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    viewBox="0 0 ${width} ${height}"
    role="img"
>
    ${renderSvgTitle(renderState)}
    ${renderAreaGradients(renderState, adjustedSeries)}
    ${renderChartGradients(renderState, adjustedSeries)}
    ${renderBackground(renderState)}
    ${renderTitle(renderState)}
    ${renderHighlightAreas(renderState, adjustedSeries)}
    ${renderAnnotations(renderState)}
    ${renderGrid(renderState)}
    ${await renderXAxisTicks(renderState, adjustedSeries)}
    ${renderScaleLabels(renderState)}
    ${renderAxisLabels(renderState)}
    ${await renderXAxisLabels(renderState, adjustedSeries)}
    ${renderBars(renderState, adjustedSeries)}
    ${renderInterLineAreas(renderState, adjustedSeries)}
    ${renderLineAreas(renderState, adjustedSeries)}
    ${renderLines(renderState, adjustedSeries)}
    ${renderPlots(renderState, adjustedSeries)}
    ${renderLineDots(renderState, adjustedSeries)}
    ${renderDatapointLabels(renderState, adjustedSeries)}
    ${renderLegend(renderState, adjustedSeries)}
    ${renderAdditionalSvgContent(renderState, adjustedSeries)}
</svg>`.trim();
}

export default renderVueUiXySvg;

import {
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    checkNaN,
    convertColorToHex,
    createPolarAreas,
    createTSpansFromLineBreaksOnY,
    dataLabel,
    escapeXml,
    makeDonut,
    offsetFromCenterPoint,
    setOpacity,
    shiftHue,
    calcNutArrowPath,
    createUid,
    XMLNS,
} from '../../lib.js';

import {
    element,
    emptyElement,
    estimateTextWidth,
    getConfigValue,
    safeArray,
    safeNumber,
    textElement,
} from '../utils';

import {
    createAlignedTSpansFromLineBreaks,
    estimateLegendTextWidth,
    getChartTextColor,
    renderBackground,
    renderDescription,
    normalizeColor,
    getRootValue,
    getStyleChartConfig,
    getStyleChartValue,
    renderVueDataUiVersion,
} from '../utils/render-common.js';

const uid = createUid();

function getUniqueId() {
    return uid;
}

function getChartBackgroundColor(config) {
    return normalizeColor(
        getStyleChartValue(config, 'backgroundColor', '#FFFFFF'),
        '#FFFFFF',
    );
}

function getDatasetValue(serie) {
    return safeNumber(serie?.value ?? serie?.absoluteValue ?? 0, 0);
}

function getVisibleSeries(state) {
    return safeArray(state.series)
        .filter((serie) => !serie?.ghost)
        .map((serie, serieIndex) => ({
            ...serie,
            value: Math.abs(getDatasetValue(serie)),
            color: normalizeColor(serie.color, '#000000'),
            name: String(serie.name ?? `Serie ${serieIndex + 1}`),
            seriesIndex: serie.seriesIndex ?? serie.index ?? serieIndex,
            patternIndex: serie.patternIndex ?? serie.index ?? serieIndex,
        }))
        .filter((serie) => Number.isFinite(serie.value));
}

function getVisibleTotal(series) {
    return series.reduce(
        (sum, serie) => sum + Math.abs(safeNumber(serie.value, 0)),
        0,
    );
}

function getTitleBlockHeight(config) {
    const title = getStyleChartValue(config, 'title', {});
    const subtitle = getConfigValue(title, 'subtitle', {});

    if (!title.text) {
        return 0;
    }

    const titleFontSize = safeNumber(title.fontSize, 20);
    const subtitleFontSize =
        subtitle.show !== false && subtitle.text
            ? safeNumber(subtitle.fontSize, 14)
            : 0;

    return (
        safeNumber(title.paddingTop, 12) +
        titleFontSize +
        (subtitleFontSize ? subtitleFontSize + 12 : 0) +
        safeNumber(title.paddingBottom, 36)
    );
}

function getLegendRows({ state, series }) {
    const { config, width } = state;
    const legend = getStyleChartValue(config, 'legend', {});
    const fontSize = safeNumber(legend.fontSize, 12);
    const markerSize = safeNumber(legend.markerSize, 10);
    const itemGap = safeNumber(legend.itemGap, 24);
    const rowGap = safeNumber(legend.rowGap, 8);
    const padding = safeNumber(legend.padding, 8);
    const labelGap = safeNumber(legend.labelGap, 8);
    const maxWidth = Math.max(1, width - padding * 2);
    const rows = [];

    let currentRow = [];
    let currentWidth = 0;

    series.forEach((serie) => {
        const label = getLegendLabel(state, serie);
        const textWidth = estimateLegendTextWidth(label, fontSize);
        const itemWidth = markerSize + labelGap + textWidth;
        const nextWidth =
            currentWidth + itemWidth + (currentRow.length ? itemGap : 0);

        if (currentRow.length && nextWidth > maxWidth) {
            rows.push({
                items: currentRow,
                width: currentWidth,
            });

            currentRow = [];
            currentWidth = 0;
        }

        currentRow.push({
            serie,
            label,
            itemWidth,
        });

        currentWidth += itemWidth + (currentRow.length > 1 ? itemGap : 0);
    });

    if (currentRow.length) {
        rows.push({
            items: currentRow,
            width: currentWidth,
        });
    }

    return {
        rows,
        fontSize,
        markerSize,
        itemGap,
        labelGap,
        rowGap,
        padding,
        height:
            rows.length * Math.max(markerSize, fontSize) +
            Math.max(0, rows.length - 1) * rowGap +
            padding * 2,
    };
}

function getLegendLayout(state, series) {
    const showLegend = getStyleChartValue(state.config, 'legend.show', true);

    if (!showLegend || !series.length) {
        return {
            rows: [],
            height: 0,
            padding: 0,
            fontSize: 12,
            markerSize: 10,
            rowGap: 0,
        };
    }

    return getLegendRows({ state, series });
}

function isPieConfig(config) {
    return Boolean(
        getRootValue(config, 'pie', getStyleChartValue(config, 'pie', false)),
    );
}

function createLayoutAdjustedState(state, series) {
    const { config, width, height } = state;
    const titleHeight = getTitleBlockHeight(config);
    const legendLayout = getLegendLayout(state, series);
    const showLegend = getStyleChartValue(config, 'legend.show', true);
    const legendPosition = getStyleChartValue(
        config,
        'legend.position',
        'bottom',
    );

    const reserveTopLegend =
        showLegend && legendPosition === 'top' ? legendLayout.height : 0;
    const reserveBottomLegend =
        showLegend && legendPosition !== 'top' ? legendLayout.height : 0;

    const paddingTop = safeNumber(
        getStyleChartValue(config, 'padding.top', 24),
        24,
    );
    const paddingRight = safeNumber(
        getStyleChartValue(config, 'padding.right', 24),
        24,
    );
    const paddingBottom = safeNumber(
        getStyleChartValue(config, 'padding.bottom', 24),
        24,
    );
    const paddingLeft = safeNumber(
        getStyleChartValue(config, 'padding.left', 24),
        24,
    );

    const drawingArea = {
        top: paddingTop + titleHeight + reserveTopLegend,
        right: width - paddingRight,
        bottom: height - paddingBottom - reserveBottomLegend,
        left: paddingLeft,
    };

    drawingArea.width = Math.max(1, drawingArea.right - drawingArea.left);
    drawingArea.height = Math.max(1, drawingArea.bottom - drawingArea.top);

    const titleClearance = titleHeight
        ? safeNumber(getRootValue(config, 'title.chartOffsetY', 24), 24)
        : 0;

    const availableRadiusHeight = Math.max(
        1,
        drawingArea.height - titleClearance,
    );

    const center = {
        x: drawingArea.left + drawingArea.width / 2,
        y: drawingArea.top + titleClearance / 2 + availableRadiusHeight / 2,
    };

    const radiusRatio = safeNumber(
        getStyleChartValue(config, 'layout.donut.radiusRatio', 0.35),
        0.35,
    );
    const clampedRadiusRatio = Math.max(0.1, Math.min(0.50001, radiusRatio));
    const automaticRadius = Math.max(
        12,
        Math.min(drawingArea.width, availableRadiusHeight) * clampedRadiusRatio,
    );
    const configuredRadius = getStyleChartValue(
        config,
        'layout.donut.radius',
        null,
    );
    const radius =
        configuredRadius === null || configuredRadius === undefined
            ? automaticRadius
            : Math.min(
                  automaticRadius,
                  safeNumber(configuredRadius, automaticRadius),
              );

    const strokeWidth = safeNumber(
        getStyleChartValue(config, 'layout.donut.strokeWidth', 64),
        64,
    );
    const baseThicknessRatio = strokeWidth / 300;
    const automaticThickness = Math.max(
        Math.min(radius * baseThicknessRatio * 2, radius),
        12 * (1 + baseThicknessRatio),
    );

    const configuredThickness = getStyleChartValue(
        config,
        'layout.donut.thickness',
        getStyleChartValue(config, 'layout.donut.size', automaticThickness),
    );

    const thickness = Math.max(
        0,
        Math.min(
            radius - 1,
            configuredThickness === null || configuredThickness === undefined
                ? automaticThickness
                : safeNumber(configuredThickness, automaticThickness),
        ),
    );

    return {
        ...state,
        drawingArea,
        center,
        radius,
        thickness,
        innerRadius: isPieConfig(config) ? 0 : Math.max(0, radius - thickness),
    };
}

function getClassicDonut(state, series) {
    const rotation = safeNumber(
        getStyleChartValue(state.config, 'layout.donut.rotation', 105.25),
        105.25,
    );

    return makeDonut(
        { series },
        state.center.x,
        state.center.y,
        state.radius,
        state.radius,
        1.99999,
        2,
        1,
        360,
        rotation,
        isPieConfig(state.config) ? state.radius : state.thickness,
    ).map((arc, arcIndex) => ({
        ...arc,
        index: arcIndex,
        color: normalizeColor(arc.color, series[arcIndex]?.color),
        value: safeNumber(arc.value, 0),
        name: String(
            arc.name ?? series[arcIndex]?.name ?? `Serie ${arcIndex + 1}`,
        ),
        patternIndex:
            arc.patternIndex ?? series[arcIndex]?.patternIndex ?? arcIndex,
        seriesIndex:
            arc.seriesIndex ?? series[arcIndex]?.seriesIndex ?? arcIndex,
    }));
}

function getPolarAreas(state, series) {
    const largestValue = Math.max(
        1,
        ...series.map((serie) => Math.abs(safeNumber(serie.value, 0))),
    );
    const proportions = series.map(
        (serie) => Math.abs(safeNumber(serie.value, 0)) / largestValue,
    );

    return createPolarAreas({
        series: proportions,
        center: state.center,
        maxRadius:
            Math.min(state.drawingArea.width, state.drawingArea.height) / 3,
        hasGhost: false,
    });
}

function getClassicGradientId(state) {
    return `gradient_${getUniqueId()}`;
}

function getPolarGradientId(state, serieIndex) {
    return `polar_gradient_${serieIndex}_${getUniqueId()}`;
}

function renderClassicGradientOverlay(state) {
    if (
        getRootValue(state.config, 'type', 'classic') !== 'classic' ||
        !getStyleChartValue(state.config, 'useGradient', false)
    ) {
        return '';
    }

    return emptyElement('circle', {
        'data-cy': 'donut-gradient-hollow',
        cx: state.center.x,
        cy: state.center.y,
        r: state.radius <= 0 ? 10 : state.radius,
        fill: `url(#${getClassicGradientId(state)})`,
    });
}

function getShadowId(state) {
    return `drop_shadow_${getUniqueId()}`;
}

function renderTitle(state) {
    const { config, width } = state;
    const title = getStyleChartValue(config, 'title', {});
    const subtitle = getConfigValue(title, 'subtitle', {});

    if (!title.text) return '';

    const textAlign = title.textAlign || 'center';
    const x =
        textAlign === 'left'
            ? safeNumber(title.paddingLeft, 12)
            : textAlign === 'right'
              ? width - safeNumber(title.paddingRight, 12)
              : width / 2;

    const textAnchor =
        textAlign === 'left'
            ? 'start'
            : textAlign === 'right'
              ? 'end'
              : 'middle';
    const titleFontSize = safeNumber(title.fontSize, 20);
    const subtitleFontSize = safeNumber(subtitle.fontSize, 14);
    const y = safeNumber(title.paddingTop, 12) + titleFontSize;

    const output = [
        textElement(title.text, {
            'data-cy': 'donut-div-title',
            x,
            y,
            'font-size': titleFontSize,
            'font-weight': title.bold ? '700' : '400',
            'text-anchor': textAnchor,
            fill: normalizeColor(title.color, getChartTextColor(config)),
        }),
    ];

    if (subtitle.text) {
        output.push(
            textElement(subtitle.text, {
                'data-cy': 'donut-div-subtitle',
                x,
                y: y + subtitleFontSize + 4,
                'font-size': subtitleFontSize,
                'font-weight': subtitle.bold ? '700' : '400',
                'text-anchor': textAnchor,
                fill: normalizeColor(
                    subtitle.color || title.color,
                    getChartTextColor(config),
                ),
            }),
        );
    }

    return element('g', { 'data-layer': 'title' }, output.join(''));
}

function renderDefs(state, arcs) {
    const { config } = state;
    const output = [];
    const useGradient = Boolean(
        getStyleChartValue(config, 'useGradient', false),
    );
    const useShadow = Boolean(
        getStyleChartValue(config, 'layout.donut.useShadow', false),
    );

    if (useGradient) {
        const type = getRootValue(config, 'type', 'classic');
        const gradientIntensity = safeNumber(
            getStyleChartValue(config, 'gradientIntensity', 30),
            30,
        );

        if (
            type === 'classic' &&
            Number.isFinite(state.thickness / state.radius)
        ) {
            const gradientThicknessRatio = isPieConfig(config)
                ? 1
                : state.thickness / state.radius;

            output.push(
                element(
                    'radialGradient',
                    {
                        id: getClassicGradientId(state),
                    },
                    [
                        emptyElement('stop', {
                            offset: '0%',
                            'stop-color': setOpacity(
                                getChartBackgroundColor(config),
                                0,
                            ),
                            'stop-opacity': 0,
                        }),
                        emptyElement('stop', {
                            offset: `${(1 - gradientThicknessRatio) * 100}%`,
                            'stop-color': setOpacity('#FFFFFF', 0),
                            'stop-opacity': 0,
                        }),
                        emptyElement('stop', {
                            offset: `${(1 - gradientThicknessRatio / 2) * 100}%`,
                            'stop-color': setOpacity(
                                '#FFFFFF',
                                gradientIntensity,
                            ),
                        }),
                        emptyElement('stop', {
                            offset: '100%',
                            'stop-color': setOpacity(
                                getChartBackgroundColor(config),
                                0,
                            ),
                            'stop-opacity': 0,
                        }),
                    ].join(''),
                ),
            );
        }

        if (type === 'polar') {
            arcs.forEach((arc, arcIndex) => {
                const polarArea = state.polarAreas?.[arcIndex];
                if (!polarArea?.middlePoint) return;

                output.push(
                    element(
                        'radialGradient',
                        {
                            id: getPolarGradientId(state, arcIndex),
                            cx: `${checkNaN((polarArea.middlePoint.x / state.width) * 100)}%`,
                            cy: `${checkNaN((polarArea.middlePoint.y / state.height) * 100)}%`,
                            r: '62%',
                        },
                        [
                            emptyElement('stop', {
                                offset: '0%',
                                'stop-color': shiftHue(arc.color, 0.05),
                                'stop-opacity': gradientIntensity / 100,
                            }),
                            emptyElement('stop', {
                                offset: '100%',
                                'stop-color': arc.color,
                            }),
                        ].join(''),
                    ),
                );
            });
        }
    }

    if (useShadow) {
        const shadowColor = normalizeColor(
            getStyleChartValue(config, 'layout.donut.shadowColor', '#000000'),
            '#000000',
        );
        const shadowOpacity = safeNumber(
            getStyleChartValue(config, 'layout.donut.shadowOpacity', 0.2),
            0.2,
        );
        const shadowBlur = safeNumber(
            getStyleChartValue(config, 'layout.donut.shadowBlur', 6),
            6,
        );
        const shadowOffsetY = safeNumber(
            getStyleChartValue(config, 'layout.donut.shadowOffsetY', 3),
            3,
        );

        output.push(
            element(
                'filter',
                {
                    id: getShadowId(state),
                    x: '-50%',
                    y: '-50%',
                    width: '200%',
                    height: '200%',
                },
                [
                    emptyElement('feDropShadow', {
                        dx: 0,
                        dy: shadowOffsetY,
                        stdDeviation: shadowBlur,
                        'flood-color': shadowColor,
                        'flood-opacity': shadowOpacity,
                    }),
                ].join(''),
            ),
        );
    }

    return output.length
        ? element('defs', { 'data-layer': 'definitions' }, output.join(''))
        : '';
}
function getArcFill(state, arc) {
    return arc.color;
}

function getPolarFill(state, arc, arcIndex) {
    if (getStyleChartValue(state.config, 'useGradient', false)) {
        return `url(#${getPolarGradientId(state, arcIndex)})`;
    }

    return arc.color;
}

function getArcBorderColor(state) {
    const { config } = state;
    const borderColorAuto = Boolean(
        getStyleChartValue(config, 'layout.donut.borderColorAuto', true),
    );

    return borderColorAuto
        ? getChartBackgroundColor(config)
        : normalizeColor(
              getStyleChartValue(
                  config,
                  'layout.donut.borderColor',
                  getChartBackgroundColor(config),
              ),
              getChartBackgroundColor(config),
          );
}

function getArcFilter(state) {
    return getStyleChartValue(state.config, 'layout.donut.useShadow', false)
        ? `url(#${getShadowId(state)})`
        : undefined;
}

function renderClassicSlices(state, arcs) {
    if (!arcs.length) return '';

    const borderColor = getArcBorderColor(state);
    const borderWidth = safeNumber(
        getStyleChartValue(state.config, 'layout.donut.borderWidth', 1),
        1,
    );
    const output = [];

    arcs.forEach((arc, arcIndex) => {
        if (safeNumber(arc.proportion, 0) <= 0) return;

        output.push(
            emptyElement('path', {
                'data-cy': `donut-arc-underlay-${arcIndex}`,
                d: arc.arcSlice,
                fill: '#FFFFFF',
                stroke: getChartBackgroundColor(state.config),
            }),
        );

        output.push(
            emptyElement('path', {
                class: 'vue-ui-donut-arc-path',
                'data-cy': `donut-arc-${arcIndex}`,
                d: arc.arcSlice,
                fill: getArcFill(state, arc, arcIndex),
                stroke: borderColor,
                'stroke-width': borderWidth,
                filter: getArcFilter(state),
            }),
        );
    });

    return element('g', { 'data-layer': 'classic-slices' }, output.join(''));
}

function renderPolarSlices(state, arcs, polarAreas) {
    if (!arcs.length) return '';

    const borderColor = getArcBorderColor(state);
    const borderWidth = safeNumber(
        getStyleChartValue(state.config, 'layout.donut.borderWidth', 1),
        1,
    );
    const output = [];

    arcs.forEach((arc, arcIndex) => {
        const polarArea = polarAreas[arcIndex];

        if (!polarArea?.path) return;

        output.push(
            emptyElement('path', {
                'data-cy': `polar-arc-underlay-${arcIndex}`,
                d: polarArea.path,
                fill: '#FFFFFF',
                stroke: borderColor,
            }),
        );

        output.push(
            emptyElement('path', {
                class: 'vue-ui-donut-arc-path',
                'data-cy': `donut-arc-${arcIndex}`,
                d: polarArea.path,
                fill: getPolarFill(state, arc, arcIndex),
                stroke: borderColor,
                'stroke-width': borderWidth,
                filter: getArcFilter(state),
            }),
        );
    });

    return element('g', { 'data-layer': 'polar-slices' }, output.join(''));
}

function formatSerieValue(
    state,
    arc,
    roundingPath = 'layout.labels.value.rounding',
) {
    const { config } = state;
    const labels = getStyleChartValue(config, 'layout.labels', {});
    const dataLabels = labels.dataLabels ?? {};
    const valueLabels = labels.value ?? {};
    const fallback = dataLabel({
        p: dataLabels.prefix ?? '',
        v: arc.value,
        s: dataLabels.suffix ?? '',
        r: safeNumber(
            getStyleChartValue(config, roundingPath, valueLabels.rounding ?? 0),
            valueLabels.rounding ?? 0,
        ),
    });

    return applyDataLabel(valueLabels.formatter, arc.value, fallback, {
        datapoint: arc,
    });
}

function formatSeriePercentage(state, arc) {
    const { config } = state;
    const percentageLabels = getStyleChartValue(
        config,
        'layout.labels.percentage',
        {},
    );
    const percentage = safeNumber(arc.proportion, 0) * 100;
    const fallback = dataLabel({
        v: percentage,
        s: '%',
        r: safeNumber(percentageLabels.rounding, 0),
    });

    return applyDataLabel(percentageLabels.formatter, percentage, fallback, {
        datapoint: arc,
    });
}

function getInlineDataLabelParts(state, arc) {
    const labels = getStyleChartValue(state.config, 'layout.labels', {});
    const showName = Boolean(labels.name?.show);
    const showValue = Boolean(labels.value?.show ?? true);
    const showPercentage = Boolean(labels.percentage?.show ?? true);

    return {
        name: showName ? String(arc.name ?? '') : '',
        value: showValue ? formatSerieValue(state, arc) : '',
        percentage: showPercentage ? formatSeriePercentage(state, arc) : '',
    };
}

function getInlineValuePercentageContent(state, arc) {
    const { value, percentage } = getInlineDataLabelParts(state, arc);

    if (percentage && value) {
        return `${percentage} (${value})`;
    }

    return percentage || value || '';
}

function getDataLabelContent(state, arc) {
    const labels = getStyleChartValue(state.config, 'layout.labels', {});
    const dataLabels = labels.dataLabels ?? {};
    const showValue = Boolean(labels.value?.show ?? true);
    const showPercentage = Boolean(labels.percentage?.show ?? true);
    const value = showValue ? formatSerieValue(state, arc) : '';
    const percentage = showPercentage ? formatSeriePercentage(state, arc) : '';

    if (value && percentage) {
        return dataLabels.valuePercentageRatio === 'percentageFirst'
            ? `${percentage}\n${value}`
            : `${value}\n${percentage}`;
    }

    return value || percentage || '';
}

function shouldRenderDataLabel(state, arc) {
    const labels = getStyleChartValue(state.config, 'layout.labels', {});
    const dataLabels = labels.dataLabels ?? {};

    if (
        !getRootValue(state.config, 'dataLabels.show', dataLabels.show ?? true)
    ) {
        return false;
    }

    if (!dataLabels.show) {
        return false;
    }

    const threshold = safeNumber(dataLabels.hideUnderValue, 0);
    const proportion = safeNumber(arc.proportion, 0) * 100;

    return proportion > threshold;
}

function isSmallArc(state, arc) {
    const dataLabels = getStyleChartValue(
        state.config,
        'layout.labels.dataLabels',
        {},
    );
    const threshold = safeNumber(dataLabels.smallArcClusterThreshold, 0);
    const minimumVisible = safeNumber(dataLabels.hideUnderValue, 0);
    const percentage = safeNumber(arc.proportion, 0) * 100;

    return (
        percentage > minimumVisible && threshold > 0 && percentage <= threshold
    );
}

function useCurvedMarkers(state) {
    return Boolean(
        getStyleChartValue(
            state.config,
            'layout.curvedMarkers',
            getStyleChartValue(
                state.config,
                'layout.donut.curvedMarkers',
                false,
            ),
        ),
    );
}

function getSmallArcLayoutsClassic(state, arcs) {
    const dataLabels = getStyleChartValue(
        state.config,
        'layout.labels.dataLabels',
        {},
    );

    const layouts = {};
    const centerX = state.center.x;
    const centerY = state.center.y;

    const fontSize = safeNumber(
        dataLabels.smallArcClusterFontSize ?? dataLabels.fontSize,
        10,
    );

    const fontBaselineOffset = fontSize / 3;
    const baseLineHeight = fontSize * 1.5;
    const markerTextGap = 8;
    const radialOffset = 6;

    const topPadding = state.drawingArea.top + 16;
    const bottomPadding = state.drawingArea.bottom - 16;

    const leftBandMarkerX = centerX - (state.radius + radialOffset);
    const rightBandMarkerX = centerX + (state.radius + radialOffset);
    const isCurved = useCurvedMarkers(state);

    function getArcMidpoint(arc) {
        return {
            x: checkNaN(arc.center?.endX ?? arc.endX),
            y: checkNaN(arc.center?.endY ?? arc.endY),
        };
    }

    function makeConnectorPathForSmallArcs({ midX, midY, bandX, bandY }) {
        if (!isCurved) {
            return `M ${midX} ${midY} L ${midX} ${bandY} L ${bandX} ${bandY}`;
        }

        const side = bandX < centerX ? -1 : 1;
        const deltaX = bandX - midX;
        const deltaY = bandY - midY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 1;

        const radialDeltaX = midX - centerX;
        const radialDeltaY = midY - centerY;
        const radialLength =
            Math.sqrt(
                radialDeltaX * radialDeltaX + radialDeltaY * radialDeltaY,
            ) || 1;

        const radialUnitX = radialDeltaX / radialLength;
        const radialUnitY = radialDeltaY / radialLength;
        const safeRadius = radialLength + 9;

        function pushOutside({ x, y }) {
            const fromCenterX = x - centerX;
            const fromCenterY = y - centerY;
            const fromCenterLength =
                Math.sqrt(
                    fromCenterX * fromCenterX + fromCenterY * fromCenterY,
                ) || 1;

            if (fromCenterLength >= safeRadius) {
                return { x, y };
            }

            const factor = safeRadius / fromCenterLength;

            return {
                x: centerX + fromCenterX * factor,
                y: centerY + fromCenterY * factor,
            };
        }

        if (distance < 56) {
            const directionUnitX = deltaX / distance;
            const directionUnitY = deltaY / distance;

            let perpendicularUnitX = -directionUnitY;
            let perpendicularUnitY = directionUnitX;

            const midpointX = (midX + bandX) * 0.5;
            const midpointY = (midY + bandY) * 0.5;

            const probeDistance =
                (midpointX + perpendicularUnitX - centerX) ** 2 +
                (midpointY + perpendicularUnitY - centerY) ** 2;

            const oppositeProbeDistance =
                (midpointX - perpendicularUnitX - centerX) ** 2 +
                (midpointY - perpendicularUnitY - centerY) ** 2;

            if (oppositeProbeDistance > probeDistance) {
                perpendicularUnitX = -perpendicularUnitX;
                perpendicularUnitY = -perpendicularUnitY;
            }

            const normalized = Math.max(
                0,
                Math.min(1, (distance - 18) / (56 - 12)),
            );
            const eased = normalized * normalized * (3 - 2 * normalized);

            const baseX = midX + deltaX * 0.78;
            const baseY = midY + deltaY * 0.78;

            const control = pushOutside({
                x:
                    baseX +
                    perpendicularUnitX * (2.5 + eased * 4) * 0.9 +
                    radialUnitX * (1 + eased * 2.5),
                y:
                    baseY +
                    perpendicularUnitY * (2.5 + eased * 4) * 0.9 +
                    radialUnitY * (1 + eased * 2.5),
            });

            return `M ${midX} ${midY} Q ${control.x} ${control.y} ${bandX} ${bandY}`;
        }

        let outwardStrength = distance * 0.34;
        if (outwardStrength < 20) outwardStrength = 20;
        if (outwardStrength > 46) outwardStrength = 46;

        let horizontalPull = distance * 0.46;
        if (horizontalPull < 22) horizontalPull = 22;
        if (horizontalPull > 70) horizontalPull = 70;

        const controlPoint1 = pushOutside({
            x: midX + radialUnitX * outwardStrength,
            y: midY + radialUnitY * outwardStrength,
        });

        const outsideColumnX =
            centerX + side * Math.max(Math.abs(bandX - centerX), safeRadius);

        const controlPoint2 = pushOutside({
            x:
                bandX -
                side *
                    Math.min(
                        horizontalPull,
                        Math.abs(outsideColumnX - bandX) * 0.75,
                    ),
            y: bandY,
        });

        return `M ${midX} ${midY} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${bandX} ${bandY}`;
    }

    function computeLabelHeightForArcName(arcName) {
        const nameLines = String(arcName ?? '').split(/\n/g);
        return (
            baseLineHeight + Math.max(0, nameLines.length - 1) * fontSize * 1.2
        );
    }

    function buildCandidateFromArc({ arc, index }) {
        const midpoint = getArcMidpoint(arc);

        return {
            arc,
            index,
            midX: midpoint.x,
            midY: midpoint.y,
            inlineMarkerX: calcMarkerOffsetX(arc).x,
            inlineMarkerY: calcMarkerOffsetY(arc) - 3.5,
            labelHeight: computeLabelHeightForArcName(arc.name),
        };
    }

    function getQuadrantKey(candidate) {
        const isTop = candidate.inlineMarkerY < centerY;
        const isLeft = candidate.inlineMarkerX < centerX;

        if (isTop && isLeft) return 'TL';
        if (isTop && !isLeft) return 'TR';
        if (!isTop && isLeft) return 'BL';
        return 'BR';
    }

    function sortCandidatesForQuadrant(candidateList, quadrantKey) {
        const isTopBand = quadrantKey.startsWith('T');

        candidateList.sort((a, b) =>
            isTopBand
                ? a.inlineMarkerY - b.inlineMarkerY || a.index - b.index
                : b.inlineMarkerY - a.inlineMarkerY || a.index - b.index,
        );
    }

    function createLayoutEntry({
        side,
        markerX,
        markerY,
        labelY,
        connectorPath,
    }) {
        return {
            side,
            labelX:
                side === 'left'
                    ? markerX - markerTextGap
                    : markerX + markerTextGap,
            labelY: labelY + fontBaselineOffset,
            textAnchor: side === 'left' ? 'end' : 'start',
            markerX,
            markerY,
            connectorPath,
        };
    }

    function placeCandidatesIntoBand({
        candidateList,
        side,
        bandMarkerX,
        startY,
        direction,
    }) {
        let currentY = startY;

        candidateList.forEach((candidate) => {
            const { index, midX, midY, labelHeight } = candidate;

            let labelY;

            if (direction === 'down') {
                labelY = currentY;
                currentY += labelHeight;
            } else {
                currentY -= labelHeight;
                labelY = currentY;
            }

            const markerY = labelY;
            const connectorPath = makeConnectorPathForSmallArcs({
                midX,
                midY,
                bandX: bandMarkerX,
                bandY: markerY,
            });

            layouts[index] = createLayoutEntry({
                side,
                markerX: bandMarkerX,
                markerY,
                labelY,
                connectorPath,
            });
        });
    }

    const candidatesByQuadrant = {
        TL: [],
        TR: [],
        BL: [],
        BR: [],
    };

    arcs.map((arc, index) => buildCandidateFromArc({ arc, index }))
        .filter(
            ({ arc }) =>
                shouldRenderDataLabel(state, arc) && isSmallArc(state, arc),
        )
        .forEach((candidate) => {
            candidatesByQuadrant[getQuadrantKey(candidate)].push(candidate);
        });

    Object.keys(candidatesByQuadrant).forEach((quadrantKey) => {
        sortCandidatesForQuadrant(
            candidatesByQuadrant[quadrantKey],
            quadrantKey,
        );
    });

    placeCandidatesIntoBand({
        candidateList: candidatesByQuadrant.TL,
        side: 'left',
        bandMarkerX: leftBandMarkerX,
        startY: topPadding,
        direction: 'down',
    });

    placeCandidatesIntoBand({
        candidateList: candidatesByQuadrant.TR,
        side: 'right',
        bandMarkerX: rightBandMarkerX,
        startY: topPadding,
        direction: 'down',
    });

    if (candidatesByQuadrant.BL.length > 1) {
        placeCandidatesIntoBand({
            candidateList: candidatesByQuadrant.BL,
            side: 'left',
            bandMarkerX: leftBandMarkerX,
            startY: bottomPadding,
            direction: 'up',
        });
    }

    if (candidatesByQuadrant.BR.length > 1) {
        placeCandidatesIntoBand({
            candidateList: candidatesByQuadrant.BR,
            side: 'right',
            bandMarkerX: rightBandMarkerX,
            startY: bottomPadding,
            direction: 'up',
        });
    }

    return layouts;
}

function renderClassicInlineLabelText({
    state,
    arc,
    arcIndex,
    smallArcLayout,
    fontSize,
}) {
    const labels = getStyleChartValue(state.config, 'layout.labels', {});
    const percentageConfig = labels.percentage ?? {};
    const nameConfig = labels.name ?? {};

    const x = smallArcLayout?.labelX ?? calcMarkerOffsetX(arc, true, 12).x;
    const y = smallArcLayout?.labelY ?? calcMarkerOffsetY(arc);
    const textAnchor =
        smallArcLayout?.textAnchor ?? calcMarkerOffsetX(arc, true, 12).anchor;

    const { name } = getInlineDataLabelParts(state, arc);
    const valuePercentage = getInlineValuePercentageContent(state, arc);

    const nameLines = String(name).split(/\n/g);

    const nameTspans = name
        ? nameLines
              .map((line, lineIndex) =>
                  element(
                      'tspan',
                      {
                          class: 'vue-data-ui-datalabel-name',
                          x: lineIndex === 0 ? undefined : x,
                          dy: lineIndex === 0 ? undefined : fontSize * 1.2,
                          fill: normalizeColor(
                              nameConfig.color,
                              getChartTextColor(state.config),
                          ),
                          'font-size': fontSize,
                          'font-weight': nameConfig.bold ? '700' : '400',
                      },
                      escapeXml(
                          line +
                              (lineIndex === nameLines.length - 1 ? ' ' : ''),
                      ),
                  ),
              )
              .join('')
        : '';

    const valuePercentageTspan = valuePercentage
        ? element(
              'tspan',
              {
                  class: 'vue-data-ui-datalabel-value',
                  fill: normalizeColor(
                      percentageConfig.color,
                      getChartTextColor(state.config),
                  ),
                  'font-size': fontSize,
                  'font-weight': percentageConfig.bold ? '700' : '400',
              },
              escapeXml(valuePercentage),
          )
        : '';

    return element(
        'text',
        {
            'data-cy': `donut-label-inline-${arcIndex}`,
            class: 'vue-data-ui-datalabel-inline',
            x,
            y,
            'text-anchor': textAnchor,
        },
        `${nameTspans}${valuePercentageTspan}`,
    );
}

function renderLabelText({
    content,
    x,
    y,
    fontSize,
    fill,
    textAnchor,
    fontWeight,
    dataClass,
    dataCy,
}) {
    if (!content) return '';

    return element(
        'text',
        {
            class: dataClass,
            'data-cy': dataCy,
            x,
            y,
            'font-size': fontSize,
            'font-weight': fontWeight,
            'text-anchor': textAnchor,
            'dominant-baseline': 'middle',
            fill,
        },
        createTSpansFromLineBreaksOnY({
            content: escapeXml(String(content)),
            fontSize,
            fill,
            x,
            autoOffset: true,
        }),
    );
}

function renderClassicDataLabels(state, arcs) {
    const labels = getStyleChartValue(state.config, 'layout.labels', {});
    const dataLabels = labels.dataLabels ?? {};

    if (
        !getRootValue(
            state.config,
            'dataLabels.show',
            dataLabels.show ?? true,
        ) ||
        !dataLabels.show
    ) {
        return '';
    }

    const fontSize = safeNumber(
        dataLabels.fontSize ?? labels.value?.fontSize ?? 12,
        12,
    );

    const color = normalizeColor(
        dataLabels.color ??
            labels.value?.color ??
            getChartTextColor(state.config),
        getChartTextColor(state.config),
    );

    const bold = Boolean(dataLabels.bold ?? labels.value?.bold ?? false);
    const offset = safeNumber(dataLabels.offset, 16);
    const smallArcLayouts = getSmallArcLayoutsClassic(state, arcs);
    const output = [];

    arcs.forEach((arc, arcIndex) => {
        if (!shouldRenderDataLabel(state, arc)) return;

        const smallArcLayout = smallArcLayouts[arcIndex];
        const content = getDataLabelContent(state, arc);

        if (smallArcLayout) {
            output.push(
                renderClassicInlineLabelText({
                    state,
                    arc,
                    arcIndex,
                    smallArcLayout,
                    fontSize: safeNumber(
                        dataLabels.smallArcClusterFontSize,
                        fontSize,
                    ),
                }),
            );
            return;
        }

        output.push(
            renderClassicInlineLabelText({
                state,
                arc,
                arcIndex,
                smallArcLayout: {
                    labelX: calcMarkerOffsetX(arc, false, offset + fontSize / 2)
                        .x,
                    labelY: calcMarkerOffsetY(arc, offset, offset),
                    textAnchor: calcMarkerOffsetX(arc).anchor,
                },
                fontSize,
            }),
        );
    });

    return output.length
        ? element('g', { 'data-layer': 'data-labels' }, output.join(''))
        : '';
}

function getPolarLabelPoint(state, polarArea, offset = 42) {
    return offsetFromCenterPoint({
        initX: polarArea.middlePoint.x,
        initY: polarArea.middlePoint.y,
        offset,
        centerX: state.center.x,
        centerY: state.center.y,
    });
}

function getPolarTextAnchor(state, labelPoint) {
    if (labelPoint.x < state.center.x) return 'end';
    if (labelPoint.x > state.center.x) return 'start';
    return 'middle';
}

function buildPolarInlineLabel(state, arc, x, textAnchor) {
    const labels = getStyleChartValue(state.config, 'layout.labels', {});
    const percentageLabels = labels.percentage ?? {};
    const nameLabels = labels.name ?? {};
    const valueFontSize = safeNumber(
        percentageLabels.fontSize,
        labels.dataLabels?.fontSize ?? 12,
    );
    const nameFontSize = safeNumber(
        nameLabels.fontSize,
        labels.dataLabels?.fontSize ?? 12,
    );

    const percentageTspan = element(
        'tspan',
        {
            class: 'vue-data-ui-datalabel-value',
            fill: normalizeColor(
                percentageLabels.color,
                getChartTextColor(state.config),
            ),
            'font-size': valueFontSize,
            'font-weight': percentageLabels.bold ? '700' : '400',
        },
        escapeXml(
            String(getDataLabelContent(state, arc).replace(/\n/g, ' / ')),
        ),
    );

    const nameTspans = nameLabels.show
        ? String(arc.name ?? '')
              .split(/\n/g)
              .map((line, lineIndex) =>
                  element(
                      'tspan',
                      {
                          class: 'vue-data-ui-datalabel-name',
                          x: lineIndex === 0 ? undefined : x,
                          dy: lineIndex === 0 ? undefined : nameFontSize * 1.2,
                          fill: normalizeColor(
                              nameLabels.color,
                              getChartTextColor(state.config),
                          ),
                          'font-size': nameFontSize,
                          'font-weight': nameLabels.bold ? '700' : '400',
                      },
                      escapeXml(line),
                  ),
              )
              .join('')
        : '';

    return textAnchor === 'end'
        ? `${nameTspans}${percentageTspan}`
        : `${percentageTspan}${nameTspans}`;
}

function renderPolarDataLabels(state, arcs, polarAreas) {
    const labels = getStyleChartValue(state.config, 'layout.labels', {});
    const dataLabels = labels.dataLabels ?? {};
    const valueLabels = labels.value ?? {};
    const percentageLabels = labels.percentage ?? {};
    const nameLabels = labels.name ?? {};

    if (
        !getRootValue(
            state.config,
            'dataLabels.show',
            dataLabels.show ?? true,
        ) ||
        !dataLabels.show
    ) {
        return '';
    }

    const oneLine = Boolean(dataLabels.oneLine);
    const valueFontSize = safeNumber(
        valueLabels.fontSize,
        dataLabels.fontSize ?? 12,
    );
    const nameFontSize = safeNumber(
        nameLabels.fontSize,
        dataLabels.fontSize ?? 12,
    );
    const output = [];

    arcs.forEach((arc, arcIndex) => {
        const polarArea = polarAreas[arcIndex];

        if (!polarArea || !shouldRenderDataLabel(state, arc)) return;

        const point = getPolarLabelPoint(state, polarArea, 42);
        const textAnchor = getPolarTextAnchor(state, point);

        if (oneLine) {
            output.push(
                element(
                    'text',
                    {
                        'data-cy': 'polar-label-inline',
                        class: 'vue-data-ui-datalabel-inline',
                        x: point.x,
                        y: point.y,
                        'text-anchor': textAnchor,
                    },
                    buildPolarInlineLabel(state, arc, point.x, textAnchor),
                ),
            );
            return;
        }

        output.push(
            element(
                'text',
                {
                    'data-cy': 'polar-label-value',
                    class: 'vue-data-ui-datalabel-value',
                    x: point.x,
                    y: point.y,
                    'font-size': valueFontSize,
                    'font-weight': percentageLabels.bold ? '700' : '400',
                    'text-anchor': textAnchor,
                    fill: valueFill,
                },
                createAlignedTSpansFromLineBreaks({
                    content: getDataLabelContent(state, arc),
                    x: point.x,
                    fontSize: valueFontSize,
                    fill: valueFill,
                    textAnchor,
                }),
            ),
        );

        if (nameLabels.show) {
            output.push(
                element(
                    'text',
                    {
                        'data-cy': 'polar-label-name',
                        class: 'vue-data-ui-datalabel-name',
                        x: point.x,
                        y: point.y + nameFontSize * 1.2,
                        'font-size': nameFontSize,
                        'font-weight': nameLabels.bold ? '700' : '400',
                        'text-anchor': textAnchor,
                        fill: normalizeColor(
                            nameLabels.color,
                            getChartTextColor(state.config),
                        ),
                    },
                    createTSpansFromLineBreaksOnY({
                        content: escapeXml(String(arc.name ?? '')),
                        fontSize: nameFontSize,
                        fill: normalizeColor(
                            nameLabels.color,
                            getChartTextColor(state.config),
                        ),
                        x: point.x,
                    }),
                ),
            );
        }
    });

    return output.length
        ? element('g', { 'data-layer': 'polar-data-labels' }, output.join(''))
        : '';
}

function getClassicMarkerPath(state, arc, smallArcLayout = null) {
    if (smallArcLayout?.connectorPath) {
        return smallArcLayout.connectorPath;
    }

    const dataLabels = getStyleChartValue(
        state.config,
        'layout.labels.dataLabels',
        {},
    );

    const offset = safeNumber(dataLabels.offset, 16);
    const flatLength = safeNumber(dataLabels.markerFlatLength, 12);
    const curved = useCurvedMarkers(state);

    return calcNutArrowPath(
        arc,
        false,
        offset,
        offset,
        false,
        false,
        0,
        flatLength,
        curved,
    );
}

function renderClassicMarkers(state, arcs) {
    const dataLabels = getStyleChartValue(
        state.config,
        'layout.labels.dataLabels',
        {},
    );

    if (
        !getRootValue(
            state.config,
            'dataLabels.show',
            dataLabels.show ?? true,
        ) ||
        !dataLabels.show
    ) {
        return '';
    }

    const smallArcLayouts = getSmallArcLayoutsClassic(state, arcs);
    const output = [];

    arcs.forEach((arc, arcIndex) => {
        if (!shouldRenderDataLabel(state, arc)) return;

        const smallArcLayout = smallArcLayouts[arcIndex];
        const path = getClassicMarkerPath(state, arc, smallArcLayout);

        if (!path) return;

        output.push(
            emptyElement('path', {
                'data-cy': `donut-marker-${arcIndex}`,
                d: path,
                stroke: arc.color,
                'stroke-width': safeNumber(dataLabels.markerStrokeWidth, 1),
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                fill: 'none',
            }),
        );

        output.push(
            emptyElement('circle', {
                'data-cy': `donut-label-marker-${arcIndex}`,
                cx: smallArcLayout?.markerX ?? calcMarkerOffsetX(arc).x,
                cy: smallArcLayout?.markerY ?? calcMarkerOffsetY(arc) - 3.5,
                r: safeNumber(dataLabels.markerRadius, 3),
                fill: arc.color,
                stroke: getChartBackgroundColor(state.config),
                'stroke-width': 1,
            }),
        );
    });

    return output.length
        ? element('g', { 'data-layer': 'label-markers' }, output.join(''))
        : '';
}

function renderPolarMarkers(state, arcs, polarAreas) {
    const dataLabels = getStyleChartValue(
        state.config,
        'layout.labels.dataLabels',
        {},
    );

    if (
        !getRootValue(
            state.config,
            'dataLabels.show',
            dataLabels.show ?? true,
        ) ||
        !dataLabels.show
    ) {
        return '';
    }

    const output = [];

    arcs.forEach((arc, arcIndex) => {
        const polarArea = polarAreas[arcIndex];
        if (!polarArea?.middlePoint || !shouldRenderDataLabel(state, arc))
            return;

        const start = offsetFromCenterPoint({
            initX: polarArea.middlePoint.x,
            initY: polarArea.middlePoint.y,
            offset: 24,
            centerX: state.center.x,
            centerY: state.center.y,
        });

        output.push(
            emptyElement('path', {
                'data-cy': `polar-marker-${arcIndex}`,
                d: `M ${start.x},${start.y} ${polarArea.middlePoint.x},${polarArea.middlePoint.y}`,
                stroke: arc.color,
                'stroke-width': safeNumber(dataLabels.markerStrokeWidth, 1),
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                fill: 'none',
            }),
        );

        output.push(
            emptyElement('circle', {
                'data-cy': `polar-label-marker-${arcIndex}`,
                cx: start.x,
                cy: start.y,
                r: safeNumber(dataLabels.markerRadius, 3),
                fill: arc.color,
                stroke: getChartBackgroundColor(state.config),
                'stroke-width': 1,
            }),
        );
    });

    return output.length
        ? element('g', { 'data-layer': 'polar-label-markers' }, output.join(''))
        : '';
}

function renderHollowText(content, attributes) {
    if (content === null || content === undefined || content === '') return '';

    return textElement(content, {
        'text-anchor': 'middle',
        ...attributes,
    });
}

function renderHollowLabels(state, total, series) {
    const type = getRootValue(state.config, 'type', 'classic');
    if (type !== 'classic' || isPieConfig(state.config) || !total) return '';

    const hollow = getStyleChartValue(state.config, 'layout.labels.hollow', {});
    const totalConfig = hollow.total ?? {};
    const averageConfig = hollow.average ?? {};
    const output = [];

    if (totalConfig.show) {
        const totalFontSize = safeNumber(totalConfig.fontSize, 14);
        const averageIsVisible = Boolean(averageConfig.show);
        const nameY =
            state.center.y -
            (averageIsVisible ? totalFontSize : 0) +
            safeNumber(totalConfig.offsetY, 0);
        const valueConfig = totalConfig.value ?? {};
        const valueFontSize = safeNumber(valueConfig.fontSize, totalFontSize);
        const value = applyDataLabel(
            valueConfig.formatter,
            total,
            dataLabel({
                p: valueConfig.prefix ?? '',
                v: total,
                s: valueConfig.suffix ?? '',
                r: safeNumber(valueConfig.rounding, 0),
            }),
            { total },
        );

        output.push(
            renderHollowText(totalConfig.text ?? '', {
                'data-cy': 'hollow-total-name',
                x: state.center.x,
                y: nameY,
                fill: normalizeColor(
                    totalConfig.color,
                    getChartTextColor(state.config),
                ),
                'font-size': totalFontSize,
                'font-weight': totalConfig.bold ? '700' : '400',
            }),
        );

        output.push(
            renderHollowText(value, {
                'data-cy': 'hollow-total-value',
                x: state.center.x,
                y:
                    state.center.y +
                    totalFontSize -
                    (averageIsVisible ? totalFontSize : 0) +
                    safeNumber(valueConfig.offsetY, 0),
                fill: normalizeColor(
                    valueConfig.color,
                    normalizeColor(
                        totalConfig.color,
                        getChartTextColor(state.config),
                    ),
                ),
                'font-size': valueFontSize,
                'font-weight': valueConfig.bold ? '700' : '400',
            }),
        );
    }

    if (averageConfig.show) {
        const averageFontSize = safeNumber(averageConfig.fontSize, 14);
        const totalIsVisible = Boolean(totalConfig.show);
        const average = total / Math.max(1, series.length);
        const valueConfig = averageConfig.value ?? {};
        const valueFontSize = safeNumber(valueConfig.fontSize, averageFontSize);
        const value = applyDataLabel(
            valueConfig.formatter,
            average,
            dataLabel({
                p: valueConfig.prefix ?? '',
                v: average,
                s: valueConfig.suffix ?? '',
                r: safeNumber(valueConfig.rounding, 0),
            }),
            { average },
        );

        output.push(
            renderHollowText(averageConfig.text ?? '', {
                'data-cy': 'hollow-average-name',
                x: state.center.x,
                y:
                    state.center.y +
                    (totalIsVisible ? averageFontSize : 0) +
                    safeNumber(averageConfig.offsetY, 0),
                fill: normalizeColor(
                    averageConfig.color,
                    getChartTextColor(state.config),
                ),
                'font-size': averageFontSize,
                'font-weight': averageConfig.bold ? '700' : '400',
            }),
        );

        output.push(
            renderHollowText(value, {
                'data-cy': 'hollow-average-value',
                x: state.center.x,
                y:
                    state.center.y +
                    (totalIsVisible ? averageFontSize : 0) +
                    averageFontSize +
                    safeNumber(valueConfig.offsetY, 0),
                fill: normalizeColor(
                    valueConfig.color,
                    normalizeColor(
                        averageConfig.color,
                        getChartTextColor(state.config),
                    ),
                ),
                'font-size': valueFontSize,
                'font-weight': valueConfig.bold ? '700' : '400',
            }),
        );
    }

    return output.filter(Boolean).length
        ? element(
              'g',
              {
                  class: 'vue-data-ui-donut-hollow-labels',
                  'data-layer': 'hollow-labels',
              },
              output.join(''),
          )
        : '';
}

function renderTotal(state, total) {
    const { config, center } = state;
    const totalConfig = getStyleChartValue(
        config,
        'layout.donut.labels.total',
        getStyleChartValue(config, 'layout.labels.total', {}),
    );

    if (!totalConfig.show || !Number.isFinite(total) || total <= 0) {
        return '';
    }

    const dataLabels = getStyleChartValue(
        config,
        'layout.labels.dataLabels',
        {},
    );
    const fontSize = safeNumber(totalConfig.fontSize, 20);
    const color = normalizeColor(totalConfig.color, getChartTextColor(config));
    const label = applyDataLabel(
        totalConfig.formatter,
        total,
        dataLabel({
            p: dataLabels.prefix ?? '',
            v: total,
            s: dataLabels.suffix ?? '',
            r: safeNumber(totalConfig.rounding, 0),
        }),
        { total },
    );

    return textElement(label, {
        'data-cy': 'donut-total',
        x: center.x,
        y: center.y + fontSize / 3,
        'font-size': fontSize,
        'font-weight': totalConfig.bold ? '700' : '400',
        'text-anchor': 'middle',
        fill: color,
    });
}

function getLegendPercentage(state, serie) {
    const total = getVisibleTotal(getVisibleSeries(state));

    if (!total) return 0;

    return (safeNumber(serie.value, 0) / total) * 100;
}

function formatLegendValue(state, serie) {
    const legend = getStyleChartValue(state.config, 'legend', {});
    const labels = getStyleChartValue(state.config, 'layout.labels', {});
    const dataLabels = labels.dataLabels ?? {};
    const valueLabels = labels.value ?? {};

    const fallback = dataLabel({
        p: dataLabels.prefix ?? '',
        v: serie.value,
        s: dataLabels.suffix ?? '',
        r: safeNumber(legend.roundingValue, valueLabels.rounding ?? 0),
    });

    return applyDataLabel(valueLabels.formatter, serie.value, fallback, {
        datapoint: serie,
        serie,
    });
}

function formatLegendPercentage(state, serie) {
    const legend = getStyleChartValue(state.config, 'legend', {});
    const labels = getStyleChartValue(state.config, 'layout.labels', {});
    const percentageLabels = labels.percentage ?? {};
    const percentage = getLegendPercentage(state, serie);

    const fallback = dataLabel({
        v: percentage,
        s: '%',
        r: safeNumber(
            legend.roundingPercentage,
            percentageLabels.rounding ?? 0,
        ),
    });

    return applyDataLabel(percentageLabels.formatter, percentage, fallback, {
        datapoint: serie,
        serie,
    });
}

function getLegendLabel(state, serie) {
    const legend = getStyleChartValue(state.config, 'legend', {});
    const labelParts = [];

    const percentage = legend.showPercentage
        ? formatLegendPercentage(state, serie)
        : '';

    const value = legend.showValue ? formatLegendValue(state, serie) : '';

    const formattedPercentage =
        percentage && legend.usePercentageParens
            ? `(${percentage})`
            : percentage;

    const formattedValue =
        value && legend.useValueParens ? `(${value})` : value;

    if (legend.showValueFirst) {
        if (formattedValue) {
            labelParts.push(formattedValue);
        }

        if (formattedPercentage) {
            labelParts.push(formattedPercentage);
        }
    } else {
        if (formattedPercentage) {
            labelParts.push(formattedPercentage);
        }

        if (formattedValue) {
            labelParts.push(formattedValue);
        }
    }

    return `${serie.name}${labelParts.length ? `: ${labelParts.join(' ')}` : ''}`;
}

function renderLegend(state, series) {
    const legend = getStyleChartValue(state.config, 'legend', {});

    if (!legend.show || !series.length) return '';

    const layout = getLegendLayout(state, series);
    const color = normalizeColor(legend.color, getChartTextColor(state.config));
    const position = legend.position || 'bottom';
    const lineHeight = Math.max(layout.markerSize, layout.fontSize);
    const startY =
        position === 'top'
            ? layout.padding + lineHeight
            : state.height - layout.height + layout.padding + lineHeight;
    const output = [];

    layout.rows.forEach((row, rowIndex) => {
        const availableLeft = layout.padding;
        const availableWidth = state.width - layout.padding * 2;
        let cursorX = availableLeft + availableWidth / 2 - row.width / 2;
        const y = startY + rowIndex * (lineHeight + layout.rowGap);

        row.items.forEach(({ serie, label, itemWidth }) => {
            output.push(
                emptyElement('circle', {
                    cx: cursorX + layout.markerSize / 2,
                    cy: y,
                    r: layout.markerSize / 2,
                    fill: serie.color,
                    opacity: serie.opacity ?? 1,
                }),
            );

            output.push(
                textElement(label, {
                    x: cursorX + layout.markerSize + layout.labelGap,
                    y: y + 2,
                    'font-size': layout.fontSize,
                    'font-weight': legend.bold ? '700' : '400',
                    'dominant-baseline': 'middle',
                    fill: color,
                    opacity: serie.opacity ?? 1,
                }),
            );

            cursorX += itemWidth + layout.itemGap;
        });
    });

    return element(
        'g',
        { 'data-layer': 'legend', 'data-cy': 'donut-div-legend' },
        output.join(''),
    );
}

function renderNoData(state) {
    return element(
        'g',
        { 'data-layer': 'no-data' },
        [
            emptyElement('circle', {
                cx: state.center.x,
                cy: state.center.y,
                r: Math.max(1, state.radius),
                fill: normalizeColor(
                    getStyleChartValue(
                        state.config,
                        'layout.donut.emptyFill',
                        '#E1E5E8',
                    ),
                    '#E1E5E8',
                ),
                opacity: 0.4,
            }),
        ].join(''),
    );
}

function renderAdditionalSvgContent(state, arcs) {
    const additionalSvgContent = state.additionalSvgContent;

    if (typeof additionalSvgContent === 'function') {
        return (
            additionalSvgContent({
                width: state.width,
                height: state.height,
                drawingArea: state.drawingArea,
                center: state.center,
                radius: state.radius,
                thickness: state.thickness,
                innerRadius: state.innerRadius,
                config: state.config,
                series: arcs.map((arc) => ({ ...arc })),
            }) ?? ''
        );
    }

    return additionalSvgContent ?? '';
}

function renderA11yTitle(state, series, total) {
    const title = getRootValue(state.config, 'title.text', 'Donut chart');
    const visibleTitle = title || state.svgTitle || 'Donut chart';
    const description = `${visibleTitle}. ${series.length} series. Total ${checkNaN(total)}.`;

    return element('title', {}, escapeXml(description));
}

export async function renderVueUiDonutSvg(state) {
    const config = state.config;
    const width = safeNumber(
        state.width,
        getStyleChartValue(config, 'width', 512),
    );
    const height = safeNumber(
        state.height,
        getStyleChartValue(config, 'height', 512),
    );
    const series = getVisibleSeries(state);
    const total = getVisibleTotal(series);
    const layoutState = createLayoutAdjustedState(
        { ...state, width, height },
        series,
    );
    const arcs = getClassicDonut(layoutState, series);
    const polarAreas = getPolarAreas(layoutState, series);
    const type = getRootValue(config, 'type', 'classic');
    const hasData =
        total > 0 && arcs.some((arc) => safeNumber(arc.proportion, 0) > 0);

    return `
<svg
    xmlns="${XMLNS}"
    width="100%"
    viewBox="0 0 ${width} ${height}"
    role="img"
>
    ${renderVueDataUiVersion()}
    ${renderA11yTitle(layoutState, series, total)}
    ${renderDescription(layoutState)}
    ${renderDefs({ ...layoutState, polarAreas }, arcs)}
    ${renderBackground(layoutState)}
    ${renderTitle(layoutState)}
    ${hasData ? (type === 'polar' ? renderPolarSlices(layoutState, arcs, polarAreas) : renderClassicSlices(layoutState, arcs)) : renderNoData(layoutState)}
    ${hasData && type === 'classic' ? renderClassicGradientOverlay(layoutState) : ''}
    ${hasData ? (type === 'polar' ? renderPolarMarkers(layoutState, arcs, polarAreas) : renderClassicMarkers(layoutState, arcs)) : ''}
    ${hasData ? renderHollowLabels(layoutState, total, series) : ''}
    ${hasData ? (type === 'polar' ? renderPolarDataLabels(layoutState, arcs, polarAreas) : renderClassicDataLabels(layoutState, arcs)) : ''}
    ${hasData ? renderTotal(layoutState, total) : ''}
    ${renderLegend(layoutState, series)}
    ${renderAdditionalSvgContent(layoutState, arcs)}
</svg>`.trim();
}

export default renderVueUiDonutSvg;

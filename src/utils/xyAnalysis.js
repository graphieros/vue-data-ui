import {
    buildAdditionalXyAnnotations,
    getXyAnnotationLabelPosition,
    resolveXyAnalysisOptions,
} from './xyAnalysisInsights';

// Stop as soon as analysis has enough valid observations in the current view.
export function hasXyAnalysisPoints(
    visibleDataset,
    hidden = new Set(),
    continuous = false,
) {
    let count = 0;
    for (const [index, series] of visibleDataset.entries()) {
        if (hidden.has(series.id ?? `uniqueId_${index}`)) continue;
        if (!['line', 'bar', 'plot'].includes(series.type)) continue;

        for (const point of series.series || []) {
            if (
                continuous
                    ? Number.isFinite(point?.x) && Number.isFinite(point?.y)
                    : Number.isFinite(point)
            ) {
                count += 1;
                if (count > 1) return true;
            }
        }
    }
    return false;
}

// Pure descriptive analysis. Never use rendering offsets or sampled points here.
export function getXyAnalysisSelection(
    visibleDataset,
    continuous = false,
    start = 0,
) {
    return new Map(
        visibleDataset.map((series, seriesIndex) => [
            series.id ?? `uniqueId_${seriesIndex}`,
            new Set(
                series.series.map((point, localIndex) =>
                    continuous
                        ? point.index
                        : (series.sourceIndices?.[localIndex] ??
                          Math.trunc(start) + localIndex),
                ),
            ),
        ]),
    );
}

export function analyzeXy(
    dataset,
    hidden = new Set(),
    continuous = false,
    selection = null,
) {
    return dataset.flatMap((series, seriesIndex) => {
        if (hidden.has(`uniqueId_${seriesIndex}`)) {
            return [];
        }

        if (continuous && !['line', 'plot'].includes(series.type)) {
            return [];
        }

        const included = selection?.get(`uniqueId_${seriesIndex}`);
        let scopedCount = 0;

        const points = (series.series || []).flatMap((raw, index) => {
            if (selection && !included?.has(index)) {
                return [];
            }

            scopedCount += 1;
            const value = continuous ? raw?.y : raw;
            if (
                !Number.isFinite(value) ||
                (continuous && !Number.isFinite(raw?.x))
            ) {
                return [];
            }
            return [{ index, value, x: continuous ? raw.x : index }];
        });

        if (!points.length) {
            return [];
        }

        let min = points[0].value;
        let max = min;
        let increase = null;
        let decrease = null;

        for (let i = 0; i < points.length; i += 1) {
            const point = points[i];
            min = Math.min(min, point.value);
            max = Math.max(max, point.value);
            const previous = points[i - 1];

            // Do not bridge missing observations or unordered/duplicate x values.
            if (
                !previous ||
                point.index !== previous.index + 1 ||
                point.x <= previous.x
            ) {
                continue;
            }

            const value = point.value - previous.value;
            if (!Number.isFinite(value)) continue;

            const change = { value, from: previous.index, to: point.index };

            if (value > 0 && (!increase || value > increase.value)) {
                increase = change;
            }

            if (value < 0 && (!decrease || value < decrease.value)) {
                decrease = change;
            }
        }

        const first = points[0];
        const last = points[points.length - 1];
        const change = last.value - first.value;

        return [
            {
                id: `series-${seriesIndex}`,
                name: series.name || '',
                points,
                count: points.length,
                excluded: scopedCount - points.length,
                minimum: {
                    value: min,
                    indices: points
                        .filter((p) => p.value === min)
                        .map((p) => p.index),
                },
                maximum: {
                    value: max,
                    indices: points
                        .filter((p) => p.value === max)
                        .map((p) => p.index),
                },
                change:
                    points.length > 1 &&
                    last.x > first.x &&
                    Number.isFinite(change)
                        ? change
                        : null,
                increase,
                decrease,
            },
        ];
    });
}

export function describeXyAnalysis(results, messages) {
    const format = new Intl.NumberFormat(messages.locale, {
        maximumFractionDigits: 6,
    });

    const interpolate = (key, params) =>
        messages[key].replace(/\{(\w+)\}/g, (_, name) =>
            String(params[name] ?? ''),
        );

    return results
        .map((result) => {
            const lines = [
                interpolate('summary', {
                    series: result.name || messages.series,
                    count: result.count,
                    excluded: result.excluded,
                }),
            ];
            for (const key of ['minimum', 'maximum']) {
                const metric = result[key];
                lines.push(
                    interpolate(key, {
                        value: format.format(metric.value),
                        point: metric.indices[0] + 1,
                        ties: metric.indices.length,
                    }),
                );
            }
            if (result.change !== null)
                lines.push(
                    interpolate('change', {
                        value: format.format(result.change),
                    }),
                );
            for (const key of ['increase', 'decrease']) {
                const metric = result[key];
                if (metric)
                    lines.push(
                        interpolate(key, {
                            value: format.format(metric.value),
                            from: metric.from + 1,
                            to: metric.to + 1,
                        }),
                    );
            }
            return lines.join('\n');
        })
        .join('\n\n');
}

// Only reference plotted source observations; never snap an omitted extreme to a neighbour.
export function buildXyAnalysisAnnotations(
    results,
    renderedSeries,
    area,
    messages,
    continuous = false,
    formatValue = null,
    options = { minimum: true, maximum: true },
) {
    options = resolveXyAnalysisOptions(options, messages.options);
    const format = new Intl.NumberFormat(messages.locale, {
        maximumFractionDigits: 4,
    });

    const annotations = [];

    // Exact-extrema scales can project a boundary point a few floating-point
    // units outside the plot. Accept only numerical noise, not clipped data.
    const right = area.left + area.width;
    const epsilon = Math.max(
        1e-7,
        Number.EPSILON *
            32 *
            Math.max(
                1,
                Math.abs(area.left),
                Math.abs(right),
                Math.abs(area.top),
                Math.abs(area.bottom),
            ),
    );

    for (const result of results) {
        const sourceId = result.id.replace('series-', 'uniqueId_');
        const series = renderedSeries.find((item) => item.id === sourceId);
        if (!series) continue;
        for (const kind of ['minimum', 'maximum']) {
            if (!options[kind]) continue;
            if (
                kind === 'maximum' &&
                result.maximum.value === result.minimum.value
            ) {
                continue;
            }

            const metric = result[kind];
            const sourceIndices = new Set(metric.indices);

            const point = series.plots.find((plot, localIndex) => {
                const sourceIndex =
                    plot.sourceIndex ??
                    (continuous
                        ? series.series[localIndex]?.index
                        : series.sourceIndices?.[localIndex]) ??
                    series.analysisSliceStart + localIndex;

                return (
                    sourceIndices.has(sourceIndex) &&
                    plot.value === metric.value &&
                    Number.isFinite(plot.x) &&
                    Number.isFinite(plot.y) &&
                    plot.x >= area.left - epsilon &&
                    plot.x <= right + epsilon &&
                    plot.y >= area.top - epsilon &&
                    plot.y <= area.bottom + epsilon
                );
            });

            if (!point) continue;

            const key = kind === 'minimum' ? 'visualMinimum' : 'visualMaximum';

            const label = messages[key].replace(
                /\{(series|value)\}/g,
                (_, name) =>
                    name === 'series'
                        ? result.name || messages.series
                        : formatValue
                          ? formatValue(metric.value, series)
                          : format.format(metric.value),
            );

            annotations.push({
                id: `${result.id}-${kind}`,
                x: Math.max(area.left, Math.min(right, point.x)),
                y: Math.max(area.top, Math.min(area.bottom, point.y)),
                ...getXyAnnotationLabelPosition(point, area),
                label,
            });
        }
    }

    annotations.push(
        ...buildAdditionalXyAnnotations(
            results,
            renderedSeries,
            area,
            messages,
            continuous,
            formatValue,
            options,
        ),
    );

    const limit = Number.isFinite(messages.maxAnnotations)
        ? Math.max(1, Math.min(100, Math.trunc(messages.maxAnnotations)))
        : 24;

    return annotations.slice(0, limit);
}

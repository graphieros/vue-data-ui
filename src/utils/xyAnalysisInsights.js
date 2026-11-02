import { calcAverage, calcMedian } from '../lib';

export const xyAnalysisOptionKeys = [
    'minimum',
    'maximum',
    'average',
    'median',
    'trend',
    'increase',
    'decrease',
    'change',
    'outlier',
    'gap',
    'threshold',
];

export function defaultXyAnalysisOptions() {
    return Object.fromEntries(xyAnalysisOptionKeys.map((key) => [key, false]));
}

export function resolveXyAnalysisOptions(selected, enabled = {}) {
    return Object.fromEntries(
        xyAnalysisOptionKeys.map((key) => [
            key,
            enabled[key] !== false && selected[key] === true,
        ]),
    );
}

export function getXyAnnotationLabelPosition(position, area) {
    const right = area.left + area.width;
    return {
        labelX: Math.max(
            area.left + 8,
            Math.min(
                right - 8,
                position.x + (position.x < (area.left + right) / 2 ? 28 : -28),
            ),
        ),
        labelY: Math.max(
            area.top + 16,
            Math.min(
                area.bottom - 16,
                position.y +
                    (position.y < (area.top + area.bottom) / 2 ? 30 : -30),
            ),
        ),
        bounds: {
            left: area.left,
            right,
            top: area.top,
            bottom: area.bottom,
        },
    };
}

// R7 / linear-interpolated quantiles
function quantile(sorted, fraction) {
    const position = (sorted.length - 1) * fraction;
    const left = Math.floor(position);
    const remainder = position - left;
    return (
        sorted[left] * (1 - remainder) + sorted[Math.ceil(position)] * remainder
    );
}

// Clip a reference/trend segment without changing its slope
function clipSegment(a, b, area) {
    let start = 0;
    let end = 1;
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    for (const [p, q] of [
        [-dx, a.x - area.left],
        [dx, area.left + area.width - a.x],
        [-dy, a.y - area.top],
        [dy, area.bottom - a.y],
    ]) {
        if (p === 0) {
            if (q < 0) return null;
            continue;
        }
        const t = q / p;
        if (p < 0) {
            start = Math.max(start, t);
        } else {
            end = Math.min(end, t);
        }
        if (start > end) return null;
    }
    return {
        fromX: a.x + start * dx,
        fromY: a.y + start * dy,
        x: a.x + end * dx,
        y: a.y + end * dy,
    };
}

export function buildAdditionalXyAnnotations(
    results,
    renderedSeries,
    area,
    messages,
    continuous,
    formatValue,
    options,
) {
    const annotations = [];
    if (
        !xyAnalysisOptionKeys.some(
            (key) => !['minimum', 'maximum'].includes(key) && options[key],
        )
    ) {
        return annotations;
    }

    const number = new Intl.NumberFormat(messages.locale, {
        maximumFractionDigits: 4,
    });

    const format = (value, series) =>
        formatValue ? formatValue(value, series) : number.format(value);

    const contexts = results.flatMap((result) => {
        const series = renderedSeries.find(
            (item) => item.id === result.id.replace('series-', 'uniqueId_'),
        );

        if (!series || !result.points) return [];

        const originals = new Map(
            result.points.map((point) => [point.index, point]),
        );

        const points = series.plots
            .flatMap((plot, index) => {
                const sourceIndex =
                    plot.sourceIndex ??
                    (continuous
                        ? series.series[index]?.index
                        : series.sourceIndices?.[index]) ??
                    (series.analysisSliceStart ?? 0) + index;

                const source = originals.get(sourceIndex);
                const epsilon = 1e-7;

                if (
                    !source ||
                    source.value !== plot.value ||
                    !Number.isFinite(plot.x) ||
                    !Number.isFinite(plot.y) ||
                    plot.x < area.left - epsilon ||
                    plot.x > area.left + area.width + epsilon ||
                    plot.y < area.top - epsilon ||
                    plot.y > area.bottom + epsilon
                ) {
                    return [];
                }

                return [
                    {
                        ...source,
                        px: Math.max(
                            area.left,
                            Math.min(area.left + area.width, plot.x),
                        ),
                        py: Math.max(area.top, Math.min(area.bottom, plot.y)),
                    },
                ];
            })
            .sort((a, b) => a.index - b.index);
        const byIndex = new Map(points.map((point) => [point.index, point]));
        return [{ result, series, points, byIndex }];
    });

    function add(kind, context, position, value, geometry = {}, extra = {}) {
        if (
            !Number.isFinite(value) ||
            !Number.isFinite(position.x) ||
            !Number.isFinite(position.y)
        )
            return;
        const params = {
            series: context.result.name || messages.series,
            value: format(value, context.series),
            ...extra,
        };

        const key = `visual${kind[0].toUpperCase()}${kind.slice(1)}`;
        const label = (messages[key] || `${kind}: {value}`).replace(
            /\{(\w+)\}/g,
            (_, name) => String(params[name] ?? ''),
        );

        annotations.push({
            id: `${context.result.id}-${kind}-${annotations.length}`,
            ...position,
            ...getXyAnnotationLabelPosition(position, area),
            label,
            geometry,
        });
    }
    function connect(kind, context, a, b, value) {
        if (!a || !b) return;
        add(kind, context, { x: b.px, y: b.py }, value, {
            kind: 'line',
            fromX: a.px,
            fromY: a.py,
            x: b.px,
            y: b.py,
            arrow: true,
        });
    }
    for (const context of contexts) {
        const { result, series, points, byIndex } = context;
        if (!points.length) continue;
        for (const kind of ['increase', 'decrease']) {
            if (!options[kind] || !result[kind]) continue;
            const metric = result[kind];
            connect(
                kind,
                context,
                byIndex.get(metric.from),
                byIndex.get(metric.to),
                metric.value,
            );
        }
        if (options.change && result.change !== null) {
            connect(
                'change',
                context,
                byIndex.get(result.points[0].index),
                byIndex.get(result.points.at(-1).index),
                result.change,
            );
        }
        const values = result.points.map((point) => point.value);
        const first = points[0];
        const different = points.find((point) => point.value !== first.value);
        // Chart value axes are affine, including reversed, individual and grouped scales
        // Recover this series' mapping from rendered observations rather than the global axis
        const projectY = (value) =>
            different
                ? first.py +
                  ((value - first.value) / (different.value - first.value)) *
                      (different.py - first.py)
                : value === first.value
                  ? first.py
                  : NaN;
        const minX = points.reduce(
            (min, point) => Math.min(min, point.px),
            Infinity,
        );
        const maxX = points.reduce(
            (max, point) => Math.max(max, point.px),
            -Infinity,
        );
        for (const kind of ['average', 'median']) {
            if (!options[kind] || points.length < 2 || !(maxX > minX)) continue;
            const value =
                kind === 'average' ? calcAverage(values) : calcMedian(values);
            const y = projectY(value);
            if (y < area.top || y > area.bottom) continue;
            add(kind, context, { x: (minX + maxX) / 2, y }, value, {
                kind: 'line',
                fromX: minX,
                fromY: y,
                x: maxX,
                y,
                dashed: true,
            });
        }
        if (options.threshold) {
            const thresholds = [
                ...new Set((messages.thresholds || []).filter(Number.isFinite)),
            ];
            let count = 0;
            for (let i = 1; i < points.length && count < 3; i += 1) {
                const a = points[i - 1],
                    b = points[i];
                if (
                    b.index !== a.index + 1 ||
                    b.x <= a.x ||
                    a.value === b.value
                )
                    continue;
                for (const threshold of thresholds) {
                    if (
                        !(
                            (a.value < threshold && b.value >= threshold) ||
                            (a.value > threshold && b.value <= threshold)
                        )
                    )
                        continue;
                    // Mark the observed crossing sample
                    const position = { x: b.px, y: b.py };
                    add('threshold', context, position, threshold, {
                        kind: 'circle',
                        ...position,
                    });
                    if (++count >= 3) break;
                }
            }
        }
        if (options.outlier && values.length >= 4) {
            const sorted = [...values].sort((a, b) => a - b);
            const q1 = quantile(sorted, 0.25);
            const q3 = quantile(sorted, 0.75);
            const iqr = q3 - q1;
            const lower = q1 - 1.5 * iqr;
            const upper = q3 + 1.5 * iqr;
            let count = 0;

            for (const point of points) {
                if (point.value >= lower && point.value <= upper) continue;
                add(
                    'outlier',
                    context,
                    { x: point.px, y: point.py },
                    point.value,
                    { kind: 'circle', x: point.px, y: point.py },
                );
                if (++count >= 3) break;
            }
        }
        if (options.trend && result.points.length >= 3 && points.length >= 2) {
            const meanX = calcAverage(result.points.map((point) => point.x));
            const meanY = calcAverage(values);
            let covariance = 0;
            let variance = 0;

            for (const point of result.points) {
                covariance += (point.x - meanX) * (point.value - meanY);
                variance += (point.x - meanX) ** 2;
            }

            if (!(variance > 0)) continue;

            const slope = covariance / variance;
            const left = points.reduce((a, b) => (a.x < b.x ? a : b));
            const right = points.reduce((a, b) => (a.x > b.x ? a : b));

            const a = {
                x: left.px,
                y: projectY(meanY + slope * (left.x - meanX)),
            };

            const b = {
                x: right.px,
                y: projectY(meanY + slope * (right.x - meanX)),
            };

            if (![a.x, a.y, b.x, b.y, slope].every(Number.isFinite)) continue;

            const segment = clipSegment(a, b, area);

            if (segment)
                add(
                    'trend',
                    context,
                    {
                        x: (segment.fromX + segment.x) / 2,
                        y: (segment.fromY + segment.y) / 2,
                    },
                    slope,
                    { kind: 'line', ...segment, dashed: true },
                );
        }
    }
    if (options.gap) {
        // Bound comparison work and never join ambiguous duplicate x values
        let comparisons = 0;
        for (let i = 0; i < contexts.length; i += 1) {
            for (
                let j = i + 1;
                j < contexts.length && comparisons < 64;
                j += 1
            ) {
                comparisons += 1;
                const a = contexts[i],
                    b = contexts[j];

                if (a.series.analysisUnit !== b.series.analysisUnit) continue;

                const unique = (points) => {
                    const map = new Map();
                    for (const point of points)
                        map.set(point.x, map.has(point.x) ? null : point);
                    return map;
                };

                const left = unique(a.points);
                const right = unique(b.points);
                let largest = null;

                for (const [x, p] of left) {
                    const q = right.get(x);
                    if (!p || !q) continue;
                    const value = Math.abs(p.value - q.value);
                    if (
                        !Number.isFinite(value) ||
                        (largest && value <= largest.value)
                    ) {
                        continue;
                    }
                    largest = { p, q, value };
                }

                if (!largest || largest.value === 0) continue;
                const { p, q, value } = largest;
                const x = (p.px + q.px) / 2;

                add(
                    'gap',
                    a,
                    { x, y: (p.py + q.py) / 2 },
                    value,
                    { kind: 'bracket', fromX: x, fromY: p.py, x, y: q.py },
                    { other: b.result.name || messages.series },
                );
            }
        }
    }
    return annotations;
}

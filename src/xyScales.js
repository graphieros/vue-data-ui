// Geometry only: callers retain the original values for labels and exports.
export function normalizeSymlogConstant(value = 1) {
    return Number.isFinite(value) && value > 0 ? value : 1;
}

// Normalize once when preparing a transform, not once for every datapoint.
function createSymlogTransform(constant) {
    const c = normalizeSymlogConstant(constant);
    return (value) => {
        const magnitude = Math.abs(value);
        const ratio = magnitude / c;
        return (
            Math.sign(value) *
            (Number.isFinite(ratio)
                ? Math.log1p(ratio)
                : Math.log(magnitude) - Math.log(c))
        );
    };
}

function createTransform(mode, constant) {
    switch (mode) {
        case 'log':
            return Math.log10;
        case 'symlog':
            return createSymlogTransform(constant);
        case 'linear':
            return (value) => value;
        default:
            throw new RangeError(`Unsupported Y scale mode: ${mode}`);
    }
}

export function transformY(value, mode = 'linear', constant = 1) {
    return createTransform(mode, constant)(value);
}

/** Prepare a reusable value-to-ratio mapping for a fixed domain and scale mode. */
export function createScaleProjector(
    min,
    max,
    { mode = 'linear', constant = 1 } = {},
) {
    const transform = createTransform(mode, constant);
    const lower = transform(min);
    const span = transform(max) - lower;
    // Near zero symlog is linear. Preserve the existing subnormal fallback.
    const useLinearFallback = mode === 'symlog' && span === 0;
    const linearSpan = useLinearFallback ? max - min : 0;
    return (value) => {
        if (!Number.isFinite(value) || (mode === 'log' && value <= 0))
            return NaN;
        return useLinearFallback
            ? (value - min) / linearSpan
            : (transform(value) - lower) / span;
    };
}

// Convenience functions for one-off mappings; render loops use prepared projectors.
export function nonlinearRatio(value, min, max, mode = 'log', constant = 1) {
    return createScaleProjector(min, max, { mode, constant })(value);
}

// Signed rounding policy belongs to each domain builder. Numerical power-of-ten
// overflow protection is shared; symlog's inward rounding may intentionally reach 0.
function roundMagnitudeByDecade(value, direction, preserveUnderflow = true) {
    const magnitude = Math.abs(value);
    const rounded = Math.min(
        Number.MAX_VALUE,
        10 ** Math[direction](Math.log10(magnitude)),
    );
    return rounded === 0 && preserveUnderflow ? magnitude : rounded;
}

function getLogDomain(values, { min, max, nice = true } = {}) {
    let lower = Infinity;
    let upper = -Infinity;

    for (const value of values) {
        if (Number.isFinite(value) && value > 0) {
            lower = Math.min(lower, value);
            upper = Math.max(upper, value);
        }
    }

    if (Number.isFinite(min) && min > 0) {
        lower = Math.min(lower, min);
    }

    if (Number.isFinite(max) && max > 0) {
        upper = Math.max(upper, max);
    }

    if (!Number.isFinite(lower)) {
        lower = Number.isFinite(upper) ? upper / 10 || upper : 1;
    }

    if (!Number.isFinite(upper)) {
        upper = lower * 10;
    }

    if (lower > upper) {
        [lower, upper] = [upper, lower];
    }

    if (nice) {
        lower = roundMagnitudeByDecade(lower, 'floor');
        upper = roundMagnitudeByDecade(upper, 'ceil');
    }

    if (!Number.isFinite(upper)) {
        upper = Number.MAX_VALUE;
    }

    if (lower === upper) {
        if (Number.isFinite(upper * 10)) {
            upper *= 10;
        } else {
            lower /= 10;
        }
    }

    return { min: lower, max: upper };
}

function getLogTicks({ min: lower, max: upper }) {
    const ticks = [lower];

    for (
        let exponent = Math.ceil(Math.log10(lower));
        exponent <= Math.floor(Math.log10(upper));
        exponent += 1
    ) {
        const tick = 10 ** exponent;

        if (tick > lower && tick < upper) {
            ticks.push(tick);
        }
    }

    ticks.push(upper);

    return ticks;
}

function getSymlogDomain(values, { min, max, nice = true, constant = 1 } = {}) {
    const c = normalizeSymlogConstant(constant);

    let lower = Infinity;
    let upper = -Infinity;
    let smallest = c;

    for (const value of values) {
        if (!Number.isFinite(value)) {
            continue;
        }

        lower = Math.min(lower, value);
        upper = Math.max(upper, value);

        if (value !== 0) {
            smallest = Math.min(smallest, Math.abs(value));
        }
    }

    if (Number.isFinite(min)) {
        lower = Math.min(lower, min);
    } else {
        lower = Math.min(0, lower);
    }

    if (Number.isFinite(max)) {
        upper = Math.max(upper, max);
    } else {
        upper = Math.max(0, upper);
    }

    if (lower > upper) {
        [lower, upper] = [upper, lower];
    }

    if (lower === upper) {
        lower -= c;
        upper += c;
        lower = Math.max(-Number.MAX_VALUE, lower);
        upper = Math.min(Number.MAX_VALUE, upper);
        if (lower === upper) {
            lower = Math.min(0, lower);
            upper = Math.max(0, upper);
        }
    }

    if (nice) {
        if (lower !== 0) {
            lower =
                Math.sign(lower) *
                (lower < 0
                    ? roundMagnitudeByDecade(lower, 'ceil')
                    : roundMagnitudeByDecade(lower, 'floor', false));
        }

        if (upper !== 0) {
            upper =
                Math.sign(upper) *
                (upper > 0
                    ? roundMagnitudeByDecade(upper, 'ceil')
                    : roundMagnitudeByDecade(upper, 'floor', false));
        }
    }

    return { min: lower, max: upper, smallest };
}

function getSymlogTicks({ min: lower, max: upper, smallest }) {
    const ticks = new Set([lower, upper]);

    if (lower <= 0 && upper >= 0) {
        ticks.add(0);
    }

    const start = Math.floor(Math.log10(smallest));
    const end = Math.ceil(
        Math.log10(Math.max(Math.abs(lower), Math.abs(upper))),
    );

    const step = Math.max(1, Math.ceil((end - start) / 12));

    for (let exponent = start; exponent <= end; exponent += step) {
        const magnitude = 10 ** exponent;
        for (const tick of [-magnitude, magnitude]) {
            if (tick > lower && tick < upper) {
                ticks.add(tick);
            }
        }
    }
    return [...ticks].sort((a, b) => a - b);
}

export function createLogScale(values, options = {}) {
    const domain = getLogDomain(values, options);
    return { ...domain, ticks: getLogTicks(domain) };
}

export function createSymlogScale(values, options = {}) {
    const domain = getSymlogDomain(values, options);
    return { min: domain.min, max: domain.max, ticks: getSymlogTicks(domain) };
}

/** Build a nonlinear domain and its raw-valued ticks; linear scales are built elsewhere. */
export function createNonlinearScale(values, options = {}) {
    const mode = options.mode ?? 'log';
    switch (mode) {
        case 'log':
            return createLogScale(values, options);
        case 'symlog':
            return createSymlogScale(values, options);
        default:
            throw new RangeError(
                `createNonlinearScale requires log or symlog mode; received ${mode}`,
            );
    }
}

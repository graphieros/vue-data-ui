import { isHighlightedLink } from './highlight';

export function batchPulses(
    geometry,
    settings,
    highlightId = null,
    dim = 1,
    related,
) {
    const batches = new Map();
    for (const item of geometry) {
        const color = settings.colorBySource
            ? item.link.source.color
            : settings.color || item.color;
        const unrelated =
            highlightId !== null &&
            !isHighlightedLink(item.link, highlightId, related);
        const opacity = settings.opacity * (unrelated ? dim : 1);
        const key = JSON.stringify([color, opacity]);
        if (!batches.has(key))
            batches.set(key, { key, color, opacity, items: [] });
        batches.get(key).items.push(item);
    }
    return [...batches.values()];
}

// Advance by distance on the current edge, rather than retiming an active animation.
export function advancePulse(
    geometry,
    progress,
    elapsed,
    duration,
    reverse = false,
) {
    const length = geometry.length;
    // Default flow runs from source to target; reversing preserves current position.
    const distance =
        ((elapsed * 100) / Math.max(1, duration)) * (reverse ? -1 : 1);
    const next =
        length > 0 ? (((progress + distance / length) % 1) + 1) % 1 : 0;
    let remaining = next * length;
    const points = geometry.points;
    for (let i = 1; i < points.length; i++) {
        const a = points[i - 1],
            b = points[i];
        const segment = Math.hypot(b.x - a.x, b.y - a.y);
        if (remaining <= segment && segment > 0) {
            const t = remaining / segment;
            return {
                progress: next,
                x: a.x + (b.x - a.x) * t,
                y: a.y + (b.y - a.y) * t,
            };
        }
        remaining -= segment;
    }
    return { progress: next, ...points[points.length - 1] };
}

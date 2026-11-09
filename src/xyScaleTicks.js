/** Select readable ticks without changing their values, coordinates, or order. */
export function filterSymlogTicks(labels, fontSize = 20, gap = 6) {
    const finite = labels.filter((label) => Number.isFinite(label.y));

    if (finite.length < 2) {
        return finite;
    }

    const distance = Math.max(0, Number(fontSize) || 20) + Math.max(0, gap);

    const endpoints = new Set([finite[0], finite.at(-1)]);

    const priority = (label) =>
        label.value === 0 ? 0 : endpoints.has(label) ? 1 : 2;

    const candidates = [...finite].sort(
        (a, b) =>
            priority(a) - priority(b) || Math.abs(b.value) - Math.abs(a.value),
    );

    const selected = [];

    for (const candidate of candidates) {
        if (
            selected.every(
                (label) => Math.abs(label.y - candidate.y) >= distance,
            )
        ) {
            selected.push(candidate);
        }
    }

    const retained = new Set(selected);

    return finite.filter((label) => retained.has(label));
}

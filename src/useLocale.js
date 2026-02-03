function normalizeLocale(locale) {
    return String(locale || "").toLowerCase()
}

/**
 * Generates localized month and day names for a given BCP 47 language tag.
 * @param locale The language tag (e.g., 'en-US', 'nl-NL', 'ja-JP')
 */
function getLocaleData(locale) {
    const getNames = (
        length,
        type,
        format
    ) => {
        const formatter = new Intl.DateTimeFormat(locale, { [type]: format });

        return Array.from({ length }, (_, i) => {
            // For months, we use a fixed year (2024 is a leap year, though irrelevant for names)
            // For weekdays, we use a specific date range. 
            // Jan 5, 2025 was a Sunday.
            const date = type === 'month'
                ? new Date(2025, i, 1)
                : new Date(2025, 0, 5 + i);

            return formatter.format(date);
        });
    };

    return {
        months: getNames(12, 'month', 'long'),
        shortMonths: getNames(12, 'month', 'short'),
        days: getNames(7, 'weekday', 'long'),
        shortDays: getNames(7, 'weekday', 'short'),
    };
}

const cache = new Map();

export async function useLocale(locale) {
    const key = normalizeLocale(locale) || "en"

    if (!cache.has(key)) {
        cache.set(key, getLocaleData(key))
    }

    return { key, data: cache.get(key) }
}

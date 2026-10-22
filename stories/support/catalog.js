// Clone plain fixtures while preserving formatter and event callback functions.
export function catalogArgs(value) {
    if (Array.isArray(value)) return value.map(catalogArgs);
    if (value && typeof value === 'object')
        return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
                key,
                catalogArgs(item),
            ]),
        );
    return value;
}

// The first array item identifies an ordered list of object keys. -1 denotes an array.
export function unpackTheme(value, shapes) {
    if (!Array.isArray(value)) return value;
    if (value[0] === -1) {
        return value.slice(1).map((item) => unpackTheme(item, shapes));
    }
    return Object.fromEntries(
        shapes[value[0]].map((key, i) => [
            key,
            unpackTheme(value[i + 1], shapes),
        ]),
    );
}

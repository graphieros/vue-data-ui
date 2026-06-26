export function canShowValue(v) {
    return ![null, undefined, NaN, Infinity, -Infinity].includes(v);
}

export function fillArray(len, src) {
    const L = safeInt(len);
    const res = Array(L).fill(0);
    for (let i = 0; i < src.length && i < L; i += 1) res[i] = src[i] ?? null;
    return res;
}

export function groupBy(array, getKey) {
    const res = Object.create(null);
    for (let index = 0; index < array.length; index += 1) {
        const item = array[index];
        const key = String(getKey(item));
        if (!res[key]) res[key] = [];
        res[key].push(item);
    }
    return res;
}

export function isCoordinatePoint(point) {
    return (
        point &&
        typeof point === 'object' &&
        Number.isFinite(Number(point.x)) &&
        Number.isFinite(Number(point.y))
    );
}

export function isObjectivelyDifferentIndex(a, b) {
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isFinite(na) || !Number.isFinite(nb)) return false;
    return !Object.is(na, nb);
}

export function memoizeByArrayRef(fn) {
    const wm = new WeakMap();
    return (arr, ...rest) => {
        let m = wm.get(arr);
        const key = JSON.stringify(rest);
        if (m && m.has(key)) return m.get(key);
        const out = fn(arr, ...rest);
        if (!m) {
            m = new Map();
            wm.set(arr, m);
        }
        m.set(key, out);
        return out;
    };
}

export function normalizeRange(minValue, maxValue) {
    let min = Number.isFinite(minValue) ? minValue : 0;
    let max = Number.isFinite(maxValue) ? maxValue : 1;
    if (min === max) max = min + 1;
    else if (min > max) [min, max] = [max, min];
    return { min, max };
}

export function safeDiv(a, b, fallback = 0) {
    return Number.isFinite(a) && Number.isFinite(b) && Math.abs(b) > 1e-9
        ? a / b
        : fallback;
}

export function safeInt(n) {
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
}

const util = {
    canShowValue,
    fillArray,
    groupBy,
    isCoordinatePoint,
    isObjectivelyDifferentIndex,
    memoizeByArrayRef,
    normalizeRange,
    safeDiv,
    safeInt,
};

export default util;

import { computed, isRef, watch } from 'vue';

/**
 * Recursively extract all dot-paths to leaf values in an object.
 * Skips arrays entirely when skipArrays = true.
 *
 * @param {unknown} obj
 * @param {string[]} [current=[]]
 * @param {boolean} [skipArrays=true]
 * @returns {string[][]}
 */
export function extractAllPaths(obj, current = [], skipArrays = true) {
    /** @type {string[][]} */
    const paths = [];

    if (obj && typeof obj === 'object') {
        if (Array.isArray(obj) && skipArrays) {
            return [];
        }
        for (const key of Object.keys(obj)) {
            const val = /** @type {any} */ (obj)[key];
            if (Array.isArray(val) && skipArrays) {
                continue;
            }
            const next = current.concat(key);
            if (val && typeof val === 'object') {
                paths.push(...extractAllPaths(val, next, skipArrays));
            } else {
                paths.push(next);
            }
        }
    }
    return paths;
}

/**
 * Get nested value by path.
 * @param {any} obj
 * @param {string[]} path
 * @returns {any}
 */
export function getValue(obj, path) {
    return path.reduce((o, k) => o?.[k], obj);
}

/**
 * Set nested value by path, creating intermediate objects as needed.
 * @param {any} obj
 * @param {string[]} path
 * @param {any} value
 */
export function setValue(obj, path, value) {
    let target = isRef(obj) ? obj.value : obj;
    for (let i = 0; i < path.length - 1; i += 1) {
        const key = path[i];
        if (
            !Object.prototype.hasOwnProperty.call(target, key) ||
            typeof target[key] !== 'object'
        ) {
            target[key] = {};
        }
        target = target[key];
    }
    target[path[path.length - 1]] = value;
}

/**
 * Flattens a reactive config object into computed refs for every leaf property.
 *
 * @template T extends object
 * @param {import('vue').Ref<T>} configRef
 * @param {{ delimiter?: string; skipArrays?: boolean }} [options]
 * @returns {Record<string, import('vue').ComputedRef<unknown>>}
 */
export function useAllBindings(configRef, options) {
    const { delimiter = '.', skipArrays = true } = options || {};
    const bindings = {};

    function build() {
        Object.keys(bindings).forEach((k) => delete bindings[k]);

        const paths = extractAllPaths(configRef.value, [], skipArrays);
        for (const path of paths) {
            const key = path.join(delimiter);
            bindings[key] = computed({
                get: () => getValue(configRef.value, path),
                set: (val) => setValue(configRef.value, path, val),
            });
        }
    }

    // Rebuild if the entire configRef.value is replaced
    watch(
        () => configRef.value,
        () => build(),
        { deep: false }
    );

    build();
    return bindings;
}

import { computed, isRef, markRaw, watch, watchEffect } from 'vue';

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
 * Set nested property on an object by a dot-delimited path, creating intermediate
 * objects as needed. Similar to setValue but accepts a string path.
 *
 * @param {object} obj - The object to modify.
 * @param {string} path - Dot-delimited string path.
 * @param {*} value - The value to set at the target path.
 * @param {string} delimiter - The delimiter used to split the path.
 */
function setPropertyByPath(obj, path, value, delimiter) {
    const keys = path.split(delimiter);
    let current = obj;
    for (let i = 0; i < keys.length - 1; i += 1) {
        const key = keys[i];
        if (!current[key]) {
            current[key] = {};
        }
        current = current[key];
    }
    current[keys[keys.length - 1]] = value;
}

/**
 * Flattens a reactive config object into computed refs for every leaf property.
 *
 * @template T extends object
 * @param {import('vue').Ref<T>} configRef
 * @param {{ delimiter?: string; skipArrays?: boolean }} [options]
 * @returns {Record<string, import('vue').ComputedRef<unknown>>}
 */
export function useObjectBindings(configRef, options) {
    const { delimiter = '.', skipArrays = true } = options || {};
    const bindings = {};

    function build() {
        Object.keys(bindings).forEach((k) => delete bindings[k]);
        const paths = extractAllPaths(configRef.value, [], skipArrays);
        for (const path of paths) {
            const key = path.join(delimiter)
            bindings[key] = computed({
                get: () => getValue(configRef.value, path),
                set: (val) => setValue(configRef.value, path, val),
            });
        }
    }

    watchEffect(build);
    build();

    const handler = {
        get(target, prop) {
            // let Vue's private props and symbols through
            if (typeof prop === 'string' || prop.startsWith('__v_')) {
                if (prop in target) {
                    return Reflect.get(target, prop);
                } else {
                    // prop doesn't exist on target, add it and return
                    setPropertyByPath(configRef.value, prop, undefined, delimiter);
                    bindings[prop] = computed({
                        get: () => getValue(configRef.value, prop),
                        set: (val) => setValue(configRef.value, prop, val)
                    });
                    if (!prop.startsWith('__v_')) {
                        console.warn(`Vue Data UI - useObjectBindings: no binding found for key "${prop}". Please verify you are binding to a property path which exists on the object.`);
                    }
                    return ''; // Signals to Vue there is something to be tracked, so to hand the computed on the next read
                }
            }
            return true;
        },
        set(target, prop, value) {
            if (typeof prop === 'string' || prop.startsWith('__v_')) {
                if (prop in target) {
                    return Reflect.set(target, prop, value);
                } else {
                    // prop doesn't exist on target, add it and return
                    setPropertyByPath(configRef.value, prop, value, delimiter);
                    bindings[prop] = computed({
                        get: () => getValue(configRef.value, prop),
                        set: (val) => setValue(configRef.value, prop, val)
                    });
                    if(!prop.startsWith('__v_')) {
                        console.warn(`Vue Data UI - useObjectBindings: cannot set unknown binding "${prop}".`);
                    }
                    return true;
                }
            }
            return true;
        }
    };

    return markRaw(new Proxy(bindings, handler));
}
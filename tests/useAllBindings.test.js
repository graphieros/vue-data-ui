import { ref, nextTick } from 'vue';
import { describe, test, expect } from 'vitest';
import {
    extractAllPaths,
    getValue,
    setValue,
    useAllBindings,
} from '../src/useAllBindigs'

describe('extractAllPaths', () => {
    test('simple flat object', () => {
        const obj = { a: 1, b: 2 };
        const paths = extractAllPaths(obj);
        expect(paths).toEqual([['a'], ['b']]);
    });

    test('nested object', () => {
        const obj = { x: { y: { z: 3 } }, w: 4 };
        const paths = extractAllPaths(obj);
        expect(paths).toContainEqual(['x', 'y', 'z']);
        expect(paths).toContainEqual(['w']);
        expect(paths.length).toBe(2);
    });

    test('skip arrays by default', () => {
        const obj = { arr: [{ a: 1 }, { b: 2 }], plain: 5 };
        const paths = extractAllPaths(obj);
        expect(paths).toEqual([['plain']]);
    });

    test('include arrays when skipArrays=false', () => {
        const obj = { arr: [{ a: 1 }, 2] };
        const paths = extractAllPaths(obj, [], false);
        expect(paths).toContainEqual(['arr', '0', 'a']);
        expect(paths).toContainEqual(['arr', '1']);
    });
});

describe('getValue', () => {
    const sample = { foo: { bar: { baz: 42 } }, arr: [0, { x: 9 }] };

    test('returns nested value', () => {
        expect(getValue(sample, ['foo', 'bar', 'baz'])).toBe(42);
    });

    test('returns undefined for missing path', () => {
        expect(getValue(sample, ['foo', 'nope', 'here'])).toBeUndefined();
    });

    test('works with numeric keys in arrays', () => {
        expect(getValue(sample, ['arr', '1', 'x'])).toBe(9);
    });
});

describe('setValue', () => {
    test('sets nested value on plain object and creates intermediate objects', () => {
        const obj = {};
        setValue(obj, ['a', 'b', 'c'], 7);
        expect(obj).toEqual({ a: { b: { c: 7 } } });
    });

    test('overwrites existing nested values', () => {
        const obj = { a: { b: { c: 1 } } };
        setValue(obj, ['a', 'b', 'c'], 99);
        expect(obj.a.b.c).toBe(99);
    });

    test('works on a Vue ref wrapping an object', () => {
        const objRef = ref({});
        setValue(objRef, ['x', 'y'], 'hello');
        expect(objRef.value.x.y).toBe('hello');
    });
});

describe('useAllBindings', () => {
    test('creates computed refs for each leaf and reflects initial values', () => {
        const config = ref({
            user: { name: 'Alice', age: 30 },
            enabled: true,
        });
        const bindings = useAllBindings(config);

        expect(Object.keys(bindings).sort()).toEqual(['enabled', 'user.age', 'user.name']);
        expect(bindings['user.name'].value).toBe('Alice');
        expect(bindings['enabled'].value).toBe(true);
    });

    test('updating binding updates the source config', () => {
        const config = ref({ a: { b: 1 } });
        const bindings = useAllBindings(config);

        bindings['a.b'].value = 123;
        expect(config.value.a.b).toBe(123);
    });

    test('rebuilds when configRef.value is replaced', async () => {
        const config = ref({ foo: 'bar' });
        const bindings = useAllBindings(config);

        expect(Object.keys(bindings)).toEqual(['foo']);

        // Replace the entire object
        config.value = { baz: 42 };
        await nextTick();

        expect(Object.keys(bindings)).toEqual(['baz']);
        expect(bindings['baz'].value).toBe(42);
    });

    test('respects custom delimiter', () => {
        const config = ref({ x: { y: 5 } });
        const bindings = useAllBindings(config, { delimiter: '::' });

        expect(Object.keys(bindings)).toContain('x::y');
        expect(bindings['x::y'].value).toBe(5);
    });

    test('includes arrays when skipArrays=false', () => {
        const config = ref({ arr: [{ foo: 'bar' }] });
        const noSkip = useAllBindings(config, { skipArrays: false });
        const keys = Object.keys(noSkip);

        expect(keys).toContain('arr.0.foo');
        expect(noSkip['arr.0.foo'].value).toBe('bar');
    });

    test('skips arrays by default', () => {
        const config = ref({ arr: [{ foo: 'bar' }] });
        const defaultBindings = useAllBindings(config);
        expect(Object.keys(defaultBindings)).not.toContain('arr.0.foo');
    });
});

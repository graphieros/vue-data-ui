import { expect, test } from "vitest";
import {
    degreesToRadians,
    checkNaN,
    isSafeValue,
    isValidUserValue,
    checkObj,
    checkArray,
    treeShake,
    convertColorToHex
} from "../src/lib"

test('converts degrees to radians', () => {
    expect(degreesToRadians(1)).toBe(0.017453292519943295)
});

test('returns 0 if isNaN', () => {
    expect(checkNaN(NaN)).toBe(0);
    expect(checkNaN(undefined)).toBe(0);
    expect(checkNaN('text')).toBe(0);
});

test("returns 1 if is NaN", () => {
    expect(checkNaN(NaN, 1)).toBe(1);
    expect(checkNaN(undefined, 1)).toBe(1);
    expect(checkNaN('text', 1)).toBe(1);
})

test('returns the input', () => {
    expect(checkNaN(1)).toBe(1);
    expect(checkNaN(-1)).toBe(-1);
    expect(checkNaN('1')).toBe("1");
    expect(checkNaN('-1')).toBe("-1");
    expect(checkNaN(null)).toBe(null);
    expect(checkNaN(false)).toBe(false);
    expect(checkNaN(Infinity)).toBe(Infinity);
    expect(checkNaN(-Infinity)).toBe(-Infinity);
});

test('returns true if value is safe', () => {
    expect(isSafeValue(1)).toBe(true);
    expect(isSafeValue("1")).toBe(true);
    expect(isSafeValue(-1)).toBe(true);
    expect(isSafeValue("-1")).toBe(true);
    expect(isSafeValue("text")).toBe(true);
    expect(isSafeValue(null)).toBe(true);
});

test('returns false if value is unsafe', () => {
    expect(isSafeValue(undefined)).toBe(false);
    expect(isSafeValue(NaN)).toBe(false);
    expect(isSafeValue(Infinity)).toBe(false);
    expect(isSafeValue(-Infinity)).toBe(false);
});

test('returns true if value is valid user value', () => {
    expect(isValidUserValue(1)).toBe(true);
    expect(isValidUserValue(-1)).toBe(true);
    expect(isValidUserValue('1')).toBe(true);
    expect(isValidUserValue('-1')).toBe(true);
    expect(isValidUserValue('text')).toBe(true);
    expect(isValidUserValue([])).toBe(true);
    expect(isValidUserValue([1, 2])).toBe(true);
    expect(isValidUserValue(["1", "2"])).toBe(true);
    expect(isValidUserValue({})).toBe(true);
    expect(isValidUserValue({ key: "value"})).toBe(true);
});

test('returns false if value is not valid user value', () => {
    expect(isValidUserValue(undefined)).toBe(false);
    expect(isValidUserValue(null)).toBe(false);
    expect(isValidUserValue(NaN)).toBe(false);
    expect(isValidUserValue(Infinity)).toBe(false);
    expect(isValidUserValue(-Infinity)).toBe(false);
});

test('returns true if input is a nested object', () => {
    const userConfig = { key: { subKey0: { subKey1: 'value'} }};
    const key = "key";
    expect(checkObj({userConfig, key})).toBe(true);
});

test('returns false if input is not an object and not a nested object', () => {
    const userConfig = { key: 'value' };
    const key = "key";
    expect(checkObj({ userConfig, key})).toBe(false);
});

test('returns true if input is an abject containing an array', () => {
    const userConfig = { key: ['value'] };
    const key = "key";
    expect(checkArray({ userConfig, key })).toBe(true);
});

test('returns false if input is an object not containing an array', () => {
    const key = "key";
    let userConfig = { key: 'value' };
    expect(checkArray({ userConfig, key })).toBe(false);
    userConfig = { key: { subKey: 'value'}};
    expect(checkArray({ userConfig, key })).toBe(false);
    userConfig = { key: {} };
    expect(checkArray({ userConfig, key })).toBe(false);
    userConfig = { key: 1};
    expect(checkArray({ userConfig, key })).toBe(false);
});

test('returns default config if user config is missing', () => {
    const defaultConfig = {
        key1: "val1",
        key2: {
            subkey: "subkey"
        },
        key3: {
            subkey: {
                subsubkey: "subsubkey"
            }
        }
    };

    const userConfig0 = {};

    const userConfig1 = {
        key1: ""
    };

    const userConfig2 = {
        key1: "test"
    };

    const userConfig3 = {
        key3: {
            subkey: {
                subsubkey: "test"
            }
        }
    };

    expect(treeShake({ defaultConfig, userConfig:userConfig0 })).toStrictEqual({
        key1: "val1",
        key2: {
            subkey: "subkey"
        },
        key3: {
            subkey: {
                subsubkey: "subsubkey"
            }
        }
    });

    expect(treeShake({ defaultConfig, userConfig:userConfig1 })).toStrictEqual({
        key1: "",
        key2: {
            subkey: "subkey"
        },
        key3: {
            subkey: {
                subsubkey: "subsubkey"
            }
        }
    });

    expect(treeShake({ defaultConfig, userConfig:userConfig2 })).toStrictEqual({
        key1: "test",
        key2: {
            subkey: "subkey"
        },
        key3: {
            subkey: {
                subsubkey: "subsubkey"
            }
        }
    });

    expect(treeShake({ defaultConfig, userConfig:userConfig3 })).toStrictEqual({
        key1: "val1",
        key2: {
            subkey: "subkey"
        },
        key3: {
            subkey: {
                subsubkey: "test"
            }
        }
    });
});

test('returns HEX color format from RGB', () => {
    expect(convertColorToHex("rgb(255,0,0)")).toBe("#ff0000");
    expect(convertColorToHex("rgb(0,255,0)")).toBe("#00ff00");
    expect(convertColorToHex('rgb(0,0,255)')).toBe("#0000ff");
    expect(convertColorToHex("rgb(0,0,0)")).toBe("#000000");
    expect(convertColorToHex("rgb(255,255,255)")).toBe("#ffffff");
});

test('returns HEX color format from HSL', () => {
    expect(convertColorToHex("hsl(0,100%,50%)")).toBe("#ff0000");
    expect(convertColorToHex("hsl(120,100%,50%)")).toBe("#00ff00");
    expect(convertColorToHex("hsl(240,100%,50%)")).toBe("#0000ff");
    expect(convertColorToHex("hsl(0,0%,0%)")).toBe("#000000");
    expect(convertColorToHex("hsl(0,0%,100%)")).toBe("#ffffff");
})
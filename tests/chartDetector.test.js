import { expect, test, describe, vi, afterAll, beforeEach } from "vitest";
import { chartType, passesDatatypeCheck, detectChart, hasValidDataTypeKey, isArrayOfObjectsOfSameDataType, isSimpleArray, isSimpleArrayOfNumbers, isSimpleArrayOfObjects, isSimpleArrayOfStrings, maxLengthOfArrayTypesInArrayOfObjects, getFirstEntryMatch, uppercaseKeys } from "../src/chartDetector";


function datasetNumbers(size) {
const arr = []
    for (let i = 0; i < size; i += 1) {
        arr.push(i)
    }
    return arr
}
function datasetStrings(size) {
    const arr = []
    for (let i = 0; i < size; i += 1) {
        arr.push(String(i))
    }
    return arr
}

function datasetObjectDonut(size) {
    const arr = []
    for (let i = 0; i < size; i += 1) {
        arr.push({
            name: `Serie ${i}`,
            value: (i + 1) * 10
        })
    }
    return arr
}

function datasetObjectXy(size, length) {
    const arr = []
    for (let i = 0; i < size; i += 1) {
        arr.push({
            name: `Serie ${i}`,
            values: datasetNumbers(length)
        })
    }
    return arr
}
function datasetMatrix(size) {
    const arr = [];
    for (let i = 0; i < size; i += 1) {
        arr.push(datasetLine())
    }
    return arr;
}

describe('detectChart', () => {
    const consoleMock = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    afterAll(() => {
        consoleMock.mockReset()
    })

    beforeEach(() => {
        consoleMock.mockReset()
    })

    test('warns of insufficient dataset when just a number is provided', () => {
        detectChart({ dataset: 1 });
        expect(consoleMock).toHaveBeenCalledOnce();
        expect(consoleMock).toHaveBeenCalledWith('The provided dataset (1) is not sufficient to build a chart')
    })

    test('warns of insufficient dataset when just a string is provided', () => {
        detectChart({ dataset: 'z' });
        expect(consoleMock).toHaveBeenCalledOnce();
        expect(consoleMock).toHaveBeenCalledWith('The provided dataset (z) is not sufficient to build a chart')
    })

    test('returns a dataset and a recommended chart type of bar for a set containing an array of numbers', () => {
        expect(detectChart({dataset: datasetNumbers(5)}).type).toBe(chartType.BAR)
        expect(detectChart({dataset: datasetNumbers(12), barLineSwitch: 20}).type).toBe(chartType.BAR)
    })

    test('returns a dataset and a recommended chart type of line for a set containing an array of numbers', () => {
        expect(detectChart({dataset: datasetNumbers(12)}).type).toBe(chartType.LINE)
    })

    test('returns a dataset and a recommend chart type of donut', () => {
        expect(detectChart({ dataset: datasetObjectDonut(3)}).type).toBe(chartType.DONUT)
    })

    test('returns a dataset and a recommend chart type of line', () => {
        expect(detectChart({ dataset: datasetObjectXy(1, 7)}).type).toBe(chartType.LINE)
    })
    
    test('returns a dataset and a recommend chart type of bar', () => {
        expect(detectChart({ dataset: datasetObjectXy(1, 3)}).type).toBe(chartType.BAR)
    })
});

describe('isSimpleArray', () => {
    test('returns true if passed an array', () => {
        expect(isSimpleArray([])).toBe(true)
        expect(isSimpleArray([1, 2, 3])).toBe(true);
        expect(isSimpleArray({'1': 1, "2": 2, '3': 3})).toBe(false)
    })
})

describe('isSimpleArrayOfNumbers', () => {
    test('returns true if passed an array of numbers', () => {
        expect(isSimpleArrayOfNumbers([])).toBe(false)
        expect(isSimpleArrayOfNumbers([1, 2, 3])).toBe(true)
        expect(isSimpleArrayOfNumbers(['1', '2', '3'])).toBe(true)
        expect(isSimpleArrayOfNumbers(['1', '2', 'A'])).toBe(false)
        expect(isSimpleArrayOfNumbers([{ a: 1, b: 2, c: 3}])).toBe(false)
        expect(isSimpleArrayOfNumbers([true, false, true])).toBe(true)
    })
})

describe('isSimpleArrayOfStrings', () => {
    test('returns true if passed an array of strings', () => {
        expect(isSimpleArrayOfStrings([])).toBe(false)
        expect(isSimpleArrayOfStrings([1, 2, 3])).toBe(false)
        expect(isSimpleArrayOfStrings([{ a: 'X', b: 'Y', c: 'Z'}])).toBe(false)
        expect(isSimpleArrayOfStrings(['1', '2', '3'])).toBe(true)
        expect(isSimpleArrayOfStrings(['X', 'Y', 'Z'])).toBe(true)
    })
})

describe('isSimpleArrayOfObjects', () => {
    test('returns true if passed an array of objects', () => {
        expect(isSimpleArrayOfObjects([])).toBe(false);
        expect(isSimpleArrayOfObjects([1, 2, 3])).toBe(false)
        expect(isSimpleArrayOfObjects(['X', 'Y', '2'])).toBe(false)
        expect(isSimpleArrayOfObjects([{}, {}, {}])).toBe(false)
        expect(isSimpleArrayOfObjects([{a: 'X', b: 'Y', c: 'Z'}])).toBe(true)
        expect(isSimpleArrayOfObjects([{a: 'X', b: 'Y', c: 'Z'}, {a: 'X', b: 'Y', c: 'Z'}])).toBe(true)
    })
})

describe('isArrayOfObjectsOfSameDataType', () => {
    test('returns true if all objects in an array have the same data type', () => {
        const arr1 = [
            {
                a: 1,
                b: true,
                c: 'ok'
            },
            {
                a: 4,
                b: false,
                c: 'nok'
            }
        ]
        const arr2 = [
            {
                a: 1,
                b: true,
            },
            {
                a: 4,
                b: false,
                c: 'nok'
            }
        ]
        const arr3 = [
            {
                a: 1,
                b: true,
                c: 'ok'
            },
            {
                a: 4,
                b: false,
                d: 'nok'
            }
        ]
        const arr4 = [
            {
                a: 1,
                b: true,
                c: 'ok'
            },
            {
                a: 4,
                b: false,
                c: { z: 'Z'}
            }
        ]
        const arr5 = [
            {
                a: 1,
                b: true,
                c: 'ok'
            },
            {}
        ]
        const arr6 = [
            {
                a: 1,
                b: true,
                c: 'ok'
            }
        ]
        expect(isArrayOfObjectsOfSameDataType(arr1)).toBe(true)
        expect(isArrayOfObjectsOfSameDataType(arr2)).toBe(false)
        expect(isArrayOfObjectsOfSameDataType(arr3)).toBe(false)
        expect(isArrayOfObjectsOfSameDataType(arr4)).toBe(false)
        expect(isArrayOfObjectsOfSameDataType(arr5)).toBe(false)
        expect(isArrayOfObjectsOfSameDataType(arr6)).toBe(true)
    })
})

describe('hasValidDataType key', () => {
    test('returns true if a key is a valid dataType', () => {
        const obj4 = { data: 1}
        const obj5 = { serie: 1}
        const obj3 = { series: 1}
        const obj7 = { num: 1}
        const obj1 = { value: 1}
        const obj2 = { values: 1}
        const obj8 = { wut: 1}
        expect(hasValidDataTypeKey(Object.keys(obj1)[0])).toBe(true)
        expect(hasValidDataTypeKey(Object.keys(obj2)[0])).toBe(true)
        expect(hasValidDataTypeKey(Object.keys(obj3)[0])).toBe(true)
        expect(hasValidDataTypeKey(Object.keys(obj4)[0])).toBe(true)
        expect(hasValidDataTypeKey(Object.keys(obj5)[0])).toBe(true)
        expect(hasValidDataTypeKey(Object.keys(obj7)[0])).toBe(true)
        expect(hasValidDataTypeKey(Object.keys(obj8)[0])).toBe(false)
    })
})

describe('passesDatatypeCheck', () => {
    test('returns true if any value of a dataset object matches a given type', () => {
        const datasetObject1 = {
            name: 'test',
            value: 1,
            values: [1, 2],
            obj: {a: 'X', b: 'Y'}
        }
        expect(passesDatatypeCheck(Object.values(datasetObject1), (v) => typeof v === 'number')).toBe(true)
        expect(passesDatatypeCheck(Object.values(datasetObject1), (v) => typeof v === 'string')).toBe(true)
        expect(passesDatatypeCheck(Object.values(datasetObject1), (v) => Array.isArray(v))).toBe(true)
        expect(passesDatatypeCheck(Object.values(datasetObject1), (v) => !Array.isArray(v) && typeof v === 'object')).toBe(true)
    })
})

describe('maxLengthOfArrayTypesInArrayOfObjects', () => {
    test('returns the max length of all arrays present in an array of objects', () => {
        const array1 = [
            {
                a: 'x',
                b: [0, 1, 2, 3, 4]
            },
            {
                a: 'y',
                b: [0, 1, 2]
            }
        ]
        expect(maxLengthOfArrayTypesInArrayOfObjects(array1)).toBe(5)
    })
})

describe('getFirstEntryMatch', () => {
    test('returns the first entry in an object that matches a condition', () => {
        const dataset1 = datasetObjectXy(3, 3);
        expect(getFirstEntryMatch(dataset1[0], (v) => typeof v === 'string')).toBe('Serie 0')
        expect(getFirstEntryMatch(dataset1[0], (v) => isSimpleArrayOfNumbers(v))).toStrictEqual([0, 1, 2])
    })
})

describe('uppercaseKeys', () => {
    test('returns the given object with all its keys in uppercase', () => {
        const dataset1 = {
            ['a-a']: 'v',
            a_a: 'w',
            a: 'x',
            b: 'y',
            '1': 'z'
        }
        expect(uppercaseKeys(dataset1)).toStrictEqual({
            "1": "z",
            A: "x",
            "A-A": 'v',
            A_A: 'w',
            B: 'y'
        })
    })
})
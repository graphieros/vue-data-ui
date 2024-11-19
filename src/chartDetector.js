export const chartType = {
    LINE: 'LINE',
    BAR: 'BAR',
    DONUT: 'DONUT',
};

// TODO: find a way to make this list extensible in config
export const nameType = ['NAME', 'TITLE', 'DESCRIPTION', 'LABEL'];
export const dataType = ['SERIE', 'SERIES', 'DATA', 'VALUE', 'VALUES', 'NUM'];
export const timeType = ['TIME', 'PERIOD', 'MONTH', 'YEAR', 'MONTHS', 'YEARS', 'DAY', 'DAYS', 'HOUR', 'HOURS']

export function detectChart({dataset, barLineSwitch = 6}) {
    let type = null;
    let usableDataset = null;
    let maxSeriesLength = 0;

    const isJustANumber = typeof dataset === 'number';
    const isJustAString = typeof dataset === 'string';

    if (isJustANumber || isJustAString) {
        console.warn(`The provided dataset (${dataset}) is not sufficient to build a chart`);
    }
    
    if (isSimpleArray(dataset)) {

        if (isSimpleArrayOfNumbers(dataset)) {
            dataset.length < barLineSwitch ? type = chartType.BAR : type = chartType.LINE;
            usableDataset = dataset;
            maxSeriesLength = dataset.length;
        }

        if (isSimpleArrayOfObjects(dataset)) {
            if (!isArrayOfObjectsOfSameDataType(dataset)) {
                console.warn('The objects in the dataset array have a different data structure. Either keys or value types are different.')
                return false
            }
            const keys = Object.keys(dataset[0]);
            const values = Object.values(dataset[0]);
            if (!keys.some(key => hasValidDataTypeKey(key))) {
                console.warn('The data type of the dataset objects in the array must contain one of the following keys: DATA, SERIES, VALUE, VALUES, NUM. Casing is not important.')
                return false;
            }

            if (passesDatatypeCheck(values, (v) => {
                return typeof v === 'number'
            })) {
                type = chartType.DONUT;
                usableDataset = dataset;
            }

            if (passesDatatypeCheck(values, (v) => {
                return Array.isArray(v) && isSimpleArrayOfNumbers(v)
            })) {
                if (maxLengthOfArrayTypesInArrayOfObjects(dataset) > barLineSwitch) {
                    type = chartType.LINE
                } else {
                    type = chartType.BAR
                }
                maxSeriesLength = maxLengthOfArrayTypesInArrayOfObjects(dataset);
                usableDataset = dataset.map(d => {
                    return {
                        ...d,
                        data: getFirstEntryMatch(d, (v) => isSimpleArrayOfNumbers(v))
                    }
                })
            }
            dataset = dataset.map(d => uppercaseKeys(d))
            usableDataset = usableDataset.map(d => uppercaseKeys(d))

        }
    }
    
    // IS MATRIX
    const isMatrix = !isSimpleArray(dataset) ? false : [...new Set(dataset.flatMap(d => Array.isArray(d)))][0];

    return {
        dataset,
        type,
        usableDataset,
        maxSeriesLength
    }
}


// UTILS

export function isEmptyDataset(d) {
    return !d || (isSimpleArray(d) && !d.length);
}

export function isSimpleArray(d) {
    return Array.isArray(d);
}

export function isEmptyObject(d) {
    return !isSimpleArray(d) && typeof d === 'object' && Object.keys(d).length > 0;
}

export function isSimpleArrayOfNumbers(d) {
    if (!isSimpleArray(d) || isEmptyDataset(d)) return false;
    const converted = d.map(v => Number(v));
    return ![...new Set(converted.flatMap(d => typeof d === 'number' && !isNaN(d)))].includes(false);
}

export function isSimpleArrayOfStrings(d) {
    if (!isSimpleArray(d) || isEmptyDataset(d)) return false;
    return ![...new Set(d.flatMap(d => typeof d === 'string'))].includes(false);
}

export function isSimpleArrayOfObjects(d) {
    if (!isSimpleArray(d) || isEmptyDataset(d)) return false;
    const isArrayOfObjects = ![...new Set(d.flatMap(v => typeof v === 'object' && !Array.isArray(v)))].includes(false);
    if(!isArrayOfObjects) return false;
    return !d.map(v => Object.keys(v).length > 0).includes(false)
}

export function haveSameStructure(obj1, obj2) {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let i = 0; i < keys1.length; i += 1) {
        const key1 = keys1[i];
        const key2 = keys2[i];

        if (key1 !== key2 || typeof obj1[key1] !== typeof obj2[key2]) {
            return false;
        }
    }
    return true;
}

export function isArrayOfObjectsOfSameDataType(d) {
    if (d.length <= 1) return true;
    for (let i = 0; i < d.length; i += 1) {
        for (let j = i + 1; j < d.length; j += 1) {
            if (!haveSameStructure(d[i], d[j])) {
                return false;
            }
        }
    }
    return true;
}

export function hasValidDataTypeKey(key) {
    return dataType.includes(key.toUpperCase())
}

export function passesDatatypeCheck(datapoints, checkTypeFunction) {
    let arr = [];

    for (let i = 0; i < datapoints.length; i += 1) {
        arr.push(checkTypeFunction(datapoints[i]))
    }
    return arr.includes(true);
}

export function maxLengthOfArrayTypesInArrayOfObjects(ds) {
    return Math.max(...[...ds].flatMap(d => {
        return Object.values(d).filter(d => isSimpleArrayOfNumbers(d)).map(d => d.length)
    }))
}

export function getFirstEntryMatch(datapoint, matchFunction) {
    return Object.values(datapoint).filter(d => matchFunction(d))[0]
}

export function uppercaseKeys(obj) {
    const newObj = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            newObj[key.toUpperCase()] = obj[key];
        }
    }
    return newObj;
}

const chartDetector = {
    dataType,
    detectChart,
    getFirstEntryMatch,
    hasValidDataTypeKey,
    isArrayOfObjectsOfSameDataType,
    isEmptyDataset,
    isEmptyObject,
    isSimpleArray,
    isSimpleArrayOfNumbers,
    isSimpleArrayOfObjects,
    isSimpleArrayOfStrings,
    maxLengthOfArrayTypesInArrayOfObjects,
    nameType,
    passesDatatypeCheck,
    timeType,
    uppercaseKeys,
}

export default chartDetector;
export function calcMaxAspectRatio(row, length) {
    const rowLength = row.length;
    if (rowLength === 0) {
        throw new Error(`Max aspect ratio cannot be computed: ${row} is an empty array`);
    } else {
        let minArea = Infinity;
        let maxArea = -Infinity;
        let sumArea = 0;
        for (let i = 0; i < rowLength; i += 1) {
            const value = row[i].normalizedValue;
            if (value < minArea) {
                minArea = value;
            }
            if (value > maxArea) {
                maxArea = value;
            }
            sumArea += value;
        }
        const result = Math.max(
            (length ** 2 * maxArea) / sumArea ** 2,
            sumArea ** 2 / (length ** 2 * minArea)
        );
        return result;
    }
}

export function containerToRect(container) {
    const { xOffset, yOffset, width, height } = container;
    return {
        x0: xOffset,
        y0: yOffset,
        x1: xOffset + width,
        y1: yOffset + height,
    };
}

export function doesAddingToRowImproveAspectRatio(currentRow, nextDatum, length) {
    if (currentRow.length === 0) {
        return true;
    } else {
        const newRow = currentRow.concat(nextDatum);
        const currentMaxAspectRatio = calcMaxAspectRatio(
            currentRow,
            length
        );
        const newMaxAspectRatio = calcMaxAspectRatio(newRow, length);
        return currentMaxAspectRatio >= newMaxAspectRatio;
    }
}

export function flatten(matrix) {
    const result = [];
    const matrixLength = matrix.length;
    for (let i = 0; i < matrixLength; i += 1) {
        const arr = matrix[i];
        const arrLength = arr.length;
        for (let j = 0; j < arrLength; j += 1) {
            result.push(arr[j]);
        }
    }
    return result;
}

export function generateTreemap(data, container) {
    const input = {
        ...container,
        children: data
    }
    return recurse(input)
}

export function getArea(rect) {
    return (rect.x1 - rect.x0) * (rect.y1 - rect.y0);
}

export function getCoordinates(row, rect) {
    const { width, height, xOffset, yOffset } = rectToContainer(rect);
    const rowLength = row.length;
    const sum = row.map(r => r.normalizedValue || 0).reduce((a, b) => a + b, 0);
    const valueWidth = sum / height;
    const valueHeight = sum / width;
    let subXOffset = xOffset;
    let subYOffset = yOffset;
    const coordinates = [];
    if (width >= height) {
        for (let i = 0; i < rowLength; i += 1) {
            const num = row[i];
            const y1 = subYOffset + num.normalizedValue / valueWidth;
            const rectangle = {
                x0: subXOffset,
                y0: subYOffset,
                x1: subXOffset + valueWidth,
                y1,
            };
            const nextCoordinate = Object.assign({}, num, rectangle);
            subYOffset = y1;
            coordinates.push(nextCoordinate);
        }
        return coordinates;
    } else {
        for (let i = 0; i < rowLength; i += 1) {
            const num = row[i];
            const x1 = subXOffset + num.normalizedValue / valueHeight;
            const rectangle = {
                x0: subXOffset,
                y0: subYOffset,
                x1,
                y1: subYOffset + valueHeight,
            };
            const nextCoordinate = Object.assign({}, num, rectangle);
            subXOffset = x1;
            coordinates.push(nextCoordinate);
        }
        return coordinates;
    }
}

export function getShortestEdge(input) {
    const container = rectToContainer(input);
    const width = container.width;
    const height = container.height;
    const result = Math.min(width, height);
    return result;
}

export function normalize(data, val) {
    const dataLen = data.length;
    const sum = data
        .map(d => d.value ?? 0)
        .reduce((a, b) => a + b, 0);
    const multiplier = val / sum;
    const result = [];
    let elementResult, datum;
    for (let i = 0; i < dataLen; i += 1) {
        datum = data[i];
        elementResult = Object.assign({}, datum, {
            normalizedValue: datum.value * (multiplier || 0),
        });
        result.push(elementResult);
    }
    return result;
}

export function rectToContainer(rect) {
    const { x0, y0, x1, y1 } = rect;
    return {
        xOffset: x0,
        yOffset: y0,
        width: x1 - x0,
        height: y1 - y0,
    };
}

export function squarify(inputData, inputCurrentRow, inputRect, inputStack) {
    let data = inputData;
    let currentRow = inputCurrentRow;
    let rect = inputRect;
    let stack = inputStack;
    while (true) {
        const dataLength = data.length;
        if (dataLength === 0) {
            const newCoordinates = getCoordinates(currentRow, rect);
            const newStack = stack.concat(newCoordinates);
            return newStack;
        }
        const width = getShortestEdge(rect);
        const nextDatum = data[0];
        const restData = data.slice(1, dataLength);
        if (
            doesAddingToRowImproveAspectRatio(currentRow, nextDatum, width)
        ) {
            const newRow = currentRow.concat(nextDatum);
            data = restData;
            currentRow = newRow;
            rect = rect;
            stack = stack;
        } else {
            const currentRowLength = currentRow.length;
            let valueSum = 0;
            for (let i = 0; i < currentRowLength; i += 1) {
                valueSum += currentRow[i].normalizedValue;
            }
            const newContainer = trimArea(rect, valueSum);
            const newCoordinates = getCoordinates(currentRow, rect);
            const newStack = stack.concat(newCoordinates);
            data = data;
            currentRow = [];
            rect = newContainer;
            stack = newStack;
        }
    }
}

export function recurse(datum) {
    if (typeof datum.children === 'undefined' || !datum.children.length) {
        return [datum];
    } else {
        const normalizedChildren = normalize(
            datum.children,
            getArea(datum)
        )
        const squarified = squarify(normalizedChildren, [], datum, []);

        const squarifiedLength = squarified.length;
        const contained = [];
        for (let i = 0; i < squarifiedLength; i += 1) {
            contained.push(recurse(squarified[i]));
        }
        const flattened = flatten(contained);
        return flattened;
    }
}

export function trimArea(rect, value) {
    const { width, height, xOffset, yOffset } = rectToContainer(rect);
    if (width >= height) {
        const valueWidth = value / height;
        const newWidth = width - valueWidth;
        const container = {
            xOffset: xOffset + valueWidth,
            yOffset,
            width: newWidth,
            height,
        };
        return containerToRect(container);
    } else {
        const valueHeight = value / width;
        const newHeight = height - valueHeight;
        const container = {
            xOffset,
            yOffset: yOffset + valueHeight,
            width,
            height: newHeight,
        };
        return containerToRect(container);
    }
}


const treemap = {
    calcMaxAspectRatio,
    containerToRect,
    doesAddingToRowImproveAspectRatio,
    flatten,
    getArea,
    getCoordinates,
    generateTreemap,
    getShortestEdge,
    normalize,
    rectToContainer,
    recurse,
    squarify,
    trimArea
}

export default treemap;
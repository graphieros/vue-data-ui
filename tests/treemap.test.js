import { expect, test, describe } from "vitest";

import {
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
    squarify,
    trimArea,
} from "../src/treemap"

describe('calcMaxAspectRatio', () => {
    test('calculates max aspect ratio from a row array and a length', () => {
        const row = [
            {
                normalizedValue: 0.25,
                value: 1
            },
            {
                normalizedValue: 0.5,
                value: 2
            },
            {
                normalizedValue: 0.75,
                value: 3
            }
        ];
        const len = 9;
        expect(calcMaxAspectRatio(row, len)).toBe(27);
    });
});

describe('containerToRect', () => {
    test('converts a container format to a rect format', () => {
        const container = {
            xOffset: 1,
            yOffset: 2,
            width: 3,
            height: 4
        };
        expect(containerToRect(container)).toStrictEqual({
            x0: 1,
            x1: 4,
            y0: 2,
            y1: 6
        });
    });
});

describe('doesAddingToRowImproveAspectRatio', () => {
    test('returns true if adding to a row improves targeted aspect ratio', () => {
        const currentRow = [
            {
                normalizedValue: 0.25,
                value: 1
            },
            {
                normalizedValue: 0.5,
                value: 2
            },
            {
                normalizedValue: 0.75,
                value: 3
            }
        ];
        const nextRow = [
            {
                normalizedValue: 0.25,
                value: 1
            },
            {
                normalizedValue: 0.5,
                value: 2
            },
            {
                normalizedValue: 0.75,
                value: 3
            }
        ];

        expect(doesAddingToRowImproveAspectRatio(currentRow, nextRow, 9)).toBe(true)
        expect(doesAddingToRowImproveAspectRatio(currentRow, nextRow, 1)).toBe(false)
    });
});

describe('generateTreemap', () => {
    test('creates formatted treemap dataset for a given container', () => {
        const dataset = [
            {
                name: 'PARENT 1',
                value: 100,
                children: [
                    {
                        name: 'P1 C1',
                        value: 20,
                        children: [
                            {
                                name: 'P1 C1 C1',
                                value: 10
                            },
                            {
                                name: 'P1 C1 C2',
                                value: 10
                            }
                        ]
                    },
                    {
                        name: 'P1 C2',
                        value: 30
                    },
                    {
                        name: 'P1 C3',
                        value: 50
                    }
                ]
            },
            {
                name: 'PARENT 2',
                value: 50,
                children: [
                    {
                        name: 'P2 C1',
                        value: 25,
                    },
                    {
                        name: 'PZ C2',
                        value: 25
                    }
                ]
            }
        ];

        const container = {
            x0: 0,
            y0: 0,
            x1: 128,
            y1: 64
        };

        expect(generateTreemap(dataset, container)).toStrictEqual([
            {
                name: 'P1 C1 C1',
                value: 10,
                normalizedValue: 546.1333333333333,
                x0: 0,
                y0: 0,
                x1: 21.333333333333336,
                y1: 25.599999999999998
            },
            {
                name: 'P1 C1 C2',
                value: 10,
                normalizedValue: 546.1333333333333,
                x0: 21.333333333333336,
                y0: 0,
                x1: 42.66666666666667,
                y1: 25.599999999999998
            },
            {
                name: 'P1 C2',
                value: 30,
                normalizedValue: 1638.4,
                x0: 0,
                y0: 25.599999999999998,
                x1: 42.66666666666667,
                y1: 64
            },
            {
                name: 'P1 C3',
                value: 50,
                normalizedValue: 2730.666666666667,
                x0: 42.66666666666667,
                y0: 0,
                x1: 85.33333333333334,
                y1: 64
            },
            {
                name: 'P2 C1',
                value: 25,
                normalizedValue: 1365.3333333333337,
                x0: 85.33333333333334,
                y0: 0,
                x1: 128,
                y1: 32.000000000000014
            },
            {
                name: 'PZ C2',
                value: 25,
                normalizedValue: 1365.3333333333337,
                x0: 85.33333333333334,
                y0: 32.000000000000014,
                x1: 128,
                y1: 64.00000000000003
            }
        ]);
    });
});

describe('getArea', () => {
    test('returns the area of a cell', () => {
        const rect = {
            x0: 0,
            x1: 10,
            y0: 0,
            y1: 10
        };
        expect(getArea(rect)).toBe(100);
    });
});

describe('getCoordinates', () => {
    test('adds coordinates to a row from rect coordinates', () => {
        const row = [
            {
                normalizedValue: 0.25,
                value: 1
            },
            {
                normalizedValue: 0.5,
                value: 2
            },
            {
                normalizedValue: 0.75,
                value: 3
            }
        ];
        const rect = {
            x0: 0,
            x1: 10,
            y0: 0,
            y1: 10
        };

        expect(getCoordinates(row, rect)).toStrictEqual([
            {
                normalizedValue: 0.25,
                value: 1,
                x0: 0,
                x1: 0.15,
                y0: 0,
                y1: 1.6666666666666667,
            },
            {
                normalizedValue: 0.5,
                value: 2,
                x0: 0,
                x1: 0.15,
                y0: 1.6666666666666667,
                y1: 5
            },
            {
                normalizedValue: 0.75,
                value: 3,
                x0: 0,
                x1: 0.15,
                y0: 5,
                y1: 10
            }
        ])
    })
})

describe('rectToContainer', () => {
    test('converts a rect format to a container format', () => {
        const rect = {
            x0: 1,
            x1: 2,
            y0: 3,
            y1: 4
        };
        expect(rectToContainer(rect)).toStrictEqual({
            height: 1,
            width: 1,
            xOffset: 1,
            yOffset: 3
        });
    });
});

describe('flatten', () => {
    test('flattens a matrix', () => {
        const matrix = [
            [1, 2],
            [3, 4],
            [5, 6]
        ];
        const objectMatrix = [
            [
                { a: 1 },
                { a: 2 }
            ],
            [
                { a: 3 },
                { a: 4 }
            ],
            [
                { a: 5 },
                { a: 6 }
            ]
        ];
        expect(flatten(matrix)).toStrictEqual([1, 2, 3, 4, 5, 6]);
        expect(flatten(objectMatrix)).toStrictEqual([{ a: 1 }, { a: 2 }, { a: 3 }, { a: 4 }, { a: 5 }, { a: 6 }])
    });
});

describe('getShortestEdge', () => {
    test('returns the shortest side', () => {
        const rect0 = {
            x0: 1,
            x1: 2,
            y0: 3,
            y1: 4
        };

        expect(getShortestEdge(rect0)).toBe(1);

        const rect1 = {
            x0: 2,
            x1: 2,
            y0: 3,
            y1: 4
        };

        expect(getShortestEdge(rect1)).toBe(0);

        const rect2 = {
            x0: 2,
            x1: 3,
            y0: 1,
            y1: 1
        };

        expect(getShortestEdge(rect2)).toBe(0);

        const rect3 = {
            x0: 1,
            x1: 2,
            y0: 1,
            y1: 2
        };

        expect(getShortestEdge(rect3)).toBe(1);
    });
});

describe('normalize', () => {
    test('normalizes all values from an array based on a targeted value', () => {
        const data = [{ value: 1 }, { value: 2 }, { value: 3 }];
        const val = 1.5;

        expect(normalize(data, val)).toStrictEqual([
            {
                normalizedValue: 0.25,
                value: 1
            },
            {
                normalizedValue: 0.5,
                value: 2
            },
            {
                normalizedValue: 0.75,
                value: 3
            }
        ]);
    });
});

describe('rectToContainer <=> containerToRect', () => {
    test('converts rect to container and back', () => {
        const container = {
            xOffset: 1,
            yOffset: 2,
            width: 3,
            height: 4
        };
        expect(rectToContainer(containerToRect(container))).toStrictEqual({
            height: 4,
            width: 3,
            xOffset: 1,
            yOffset: 2
        });
    });
});

describe('squarify', () => {
    test('generates rects with an aspect ratio closest to 1/1', () => {
        const normalizedChildren = [
            {
                name: 'P1 C1',
                value: 20,
                children: [],
                normalizedValue: 1092.2666666666667
            },
            { name: 'P1 C2', value: 30, normalizedValue: 1638.4 },
            { name: 'P1 C3', value: 50, normalizedValue: 2730.666666666667 }
        ];

        const datum = {
            name: 'PARENT 1',
            value: 100,
            children: [],
            normalizedValue: 5461.333333333334,
            x0: 0,
            y0: 0,
            x1: 85.33333333333334,
            y1: 64
        };

        expect(squarify(normalizedChildren, [], datum, [])).toStrictEqual([
            {
                name: 'P1 C1',
                value: 20,
                children: [],
                normalizedValue: 1092.2666666666667,
                x0: 0,
                y0: 0,
                x1: 42.66666666666667,
                y1: 25.599999999999998
            },
            {
                name: 'P1 C2',
                value: 30,
                normalizedValue: 1638.4,
                x0: 0,
                y0: 25.599999999999998,
                x1: 42.66666666666667,
                y1: 64
            },
            {
                name: 'P1 C3',
                value: 50,
                normalizedValue: 2730.666666666667,
                x0: 42.66666666666667,
                y0: 0,
                x1: 85.33333333333334,
                y1: 64
            }
        ]);
    });
});

describe('trimArea', () => {
    test('trims a rect from a given value', () => {
        const rect0 = {
            x0: 10,
            x1: 20,
            y0: 0,
            y1: 40
        };
        const trimmer = 10;
        expect(trimArea(rect0, trimmer)).toStrictEqual({
            x0: 10,
            x1: 20,
            y0: trimmer / 10 + rect0.y0,
            y1: 40
        });
        const rect1 = {
            x0: 10,
            x1: 20,
            y0: 5,
            y1: 40
        };
        expect(trimArea(rect1, trimmer)).toStrictEqual({
            x0: 10,
            x1: 20,
            y0: trimmer / 10 + rect1.y0,
            y1: 40
        });
    });
});
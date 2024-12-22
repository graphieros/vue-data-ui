import {
    expect,
    test,
    describe,
    vi,
    afterAll,
    beforeEach,
    afterEach,
} from "vitest";
import {
    abbreviate,
    adaptColorToBackground,
    addVector,
    applyDataLabel,
    assignStackRatios,
    calcLinearProgression,
    calcMedian,
    calcPercentageTrend,
    calcPolygonPoints,
    calcStarPoints,
    calcTrend,
    calculateNiceScale,
    calculateNiceScaleWithExactExtremes,
    checkArray,
    checkNaN,
    checkObj,
    closestDecimal,
    convertColorToHex,
    convertCustomPalette,
    convertNameColorToHex,
    createArc,
    createPolarAreas,
    createPolygonPath,
    createSmoothPath,
    createSpiralPath,
    createStar,
    createTSpans,
    createWordCloudDatasetFromPlainText,
    checkFormatter,
    darkenHexColor,
    dataLabel,
    degreesToRadians,
    error,
    functionReturnsString,
    generateSpiralCoordinates,
    getCloserPoint,
    getMissingDatasetAttributes,
    getScaleFactorUsingArcSize,
    hasDeepProperty,
    hslToRgba,
    interpolateColorHex,
    isFunction,
    isSafeValue,
    isValidUserValue,
    largestTriangleThreeBuckets,
    largestTriangleThreeBucketsArray,
    lightenHexColor,
    makeDonut,
    makePath,
    matrixTimes,
    niceNum,
    objectIsEmpty,
    rotateMatrix,
    sanitizeArray,
    setOpacity,
    shiftHue,
    sumByAttribute,
    translateSize,
    treeShake,
    getPathLengthFromCoordinates,
    sumSeries,
} from "../src/lib";

describe("calcTrend", () => {
    test("returns 0 if dataset has insufficient length", () => {
        expect(calcTrend([1])).toBe(0);
        expect(calcTrend([0, 1])).toBe(0);
    });
    test("returns expected trend from a dataset", () => {
        expect(calcTrend([0, 1, 2])).toBe(100);
        expect(calcTrend([1, 0])).toBe(-100);
        expect(calcTrend([2, 1, 0])).toBe(-75);
    });
});

describe("getMissingDatasetAttributes", () => {
    test("returns the missing attributes from a dataset object", () => {
        const requiredAttributes = ["name", "color"];
        const dataset1 = {
            name: "name",
            color: "color",
            attr: "attr",
        };
        const dataset2 = {
            color: "color",
            attr: "attr",
        };
        const dataset3 = {
            attr: "attr",
        };
        expect(
            getMissingDatasetAttributes({
                datasetObject: dataset1,
                requiredAttributes,
            })
        ).toStrictEqual([]);
        expect(
            getMissingDatasetAttributes({
                datasetObject: dataset2,
                requiredAttributes,
            })
        ).toStrictEqual(["name"]);
        expect(
            getMissingDatasetAttributes({
                datasetObject: dataset3,
                requiredAttributes,
            })
        ).toStrictEqual(["name", "color"]);
    });
});

describe("convertNameColorToHex", () => {
    test("returns a hex color from a standard html color name", () => {
        expect(convertNameColorToHex("red")).toBe("#FF0000");
        expect(convertNameColorToHex("Red")).toBe("#FF0000");
        expect(convertNameColorToHex("RED")).toBe("#FF0000");
        expect(convertNameColorToHex("sandybrown")).toBe("#F4A460");
        expect(convertNameColorToHex("SandyBrown")).toBe("#F4A460");
        expect(convertNameColorToHex("SANDYBROWN")).toBe("#F4A460");
    });
});

describe("degreesToRadians", () => {
    test("converts degrees to radians", () => {
        expect(degreesToRadians(1)).toBe(0.017453292519943295);
    });
});

describe("checkNaN", () => {
    test("returns 0 if isNaN", () => {
        expect(checkNaN(NaN)).toBe(0);
        expect(checkNaN(undefined)).toBe(0);
        expect(checkNaN("text")).toBe(0);
    });

    test("returns 1 if is NaN", () => {
        expect(checkNaN(NaN, 1)).toBe(1);
        expect(checkNaN(undefined, 1)).toBe(1);
        expect(checkNaN("text", 1)).toBe(1);
    });

    test("returns the input", () => {
        expect(checkNaN(1)).toBe(1);
        expect(checkNaN(-1)).toBe(-1);
        expect(checkNaN("1")).toBe("1");
        expect(checkNaN("-1")).toBe("-1");
        expect(checkNaN(null)).toBe(null);
        expect(checkNaN(false)).toBe(false);
        expect(checkNaN(Infinity)).toBe(Infinity);
        expect(checkNaN(-Infinity)).toBe(-Infinity);
    });
});

describe("isSafeValue", () => {
    test("returns true if value is safe", () => {
        expect(isSafeValue(1)).toBe(true);
        expect(isSafeValue("1")).toBe(true);
        expect(isSafeValue(-1)).toBe(true);
        expect(isSafeValue("-1")).toBe(true);
        expect(isSafeValue("text")).toBe(true);
        expect(isSafeValue(null)).toBe(true);
    });

    test("returns false if value is unsafe", () => {
        expect(isSafeValue(undefined)).toBe(false);
        expect(isSafeValue(NaN)).toBe(false);
        expect(isSafeValue(Infinity)).toBe(false);
        expect(isSafeValue(-Infinity)).toBe(false);
    });
});

describe("isValidUserValue", () => {
    test("returns true if value is valid user value", () => {
        expect(isValidUserValue(1)).toBe(true);
        expect(isValidUserValue(-1)).toBe(true);
        expect(isValidUserValue("1")).toBe(true);
        expect(isValidUserValue("-1")).toBe(true);
        expect(isValidUserValue("text")).toBe(true);
        expect(isValidUserValue([])).toBe(true);
        expect(isValidUserValue([1, 2])).toBe(true);
        expect(isValidUserValue(["1", "2"])).toBe(true);
        expect(isValidUserValue({})).toBe(true);
        expect(isValidUserValue({ key: "value" })).toBe(true);
    });

    test("returns false if value is not valid user value", () => {
        expect(isValidUserValue(undefined)).toBe(false);
        expect(isValidUserValue(null)).toBe(false);
        expect(isValidUserValue(NaN)).toBe(false);
        expect(isValidUserValue(Infinity)).toBe(false);
        expect(isValidUserValue(-Infinity)).toBe(false);
    });
});

describe("checkObj", () => {
    test("returns true if input is a nested object", () => {
        const userConfig = { key: { subKey0: { subKey1: "value" } } };
        const key = "key";
        expect(checkObj({ userConfig, key })).toBe(true);
    });
    test("returns false if input is not an object and not a nested object", () => {
        const userConfig = { key: "value" };
        const key = "key";
        expect(checkObj({ userConfig, key })).toBe(false);
    });
});

describe("checkArray", () => {
    test("returns true if input is an abject containing an array", () => {
        const userConfig = { key: ["value"] };
        const key = "key";
        expect(checkArray({ userConfig, key })).toBe(true);
    });
    test("returns false if input is an object not containing an array", () => {
        const key = "key";
        let userConfig = { key: "value" };
        expect(checkArray({ userConfig, key })).toBe(false);
        userConfig = { key: { subKey: "value" } };
        expect(checkArray({ userConfig, key })).toBe(false);
        userConfig = { key: {} };
        expect(checkArray({ userConfig, key })).toBe(false);
        userConfig = { key: 1 };
        expect(checkArray({ userConfig, key })).toBe(false);
    });
});

describe("treeShake", () => {
    test("returns default config if user config is missing", () => {
        const defaultConfig = {
            key1: "val1",
            key2: {
                subkey: "subkey",
            },
            key3: {
                subkey: {
                    subsubkey: "subsubkey",
                },
            },
        };

        const userConfig0 = {};

        const userConfig1 = {
            key1: "",
        };

        const userConfig2 = {
            key1: "test",
        };

        const userConfig3 = {
            key3: {
                subkey: {
                    subsubkey: "test",
                },
            },
        };

        expect(treeShake({ defaultConfig, userConfig: userConfig0 })).toStrictEqual(
            {
                key1: "val1",
                key2: {
                    subkey: "subkey",
                },
                key3: {
                    subkey: {
                        subsubkey: "subsubkey",
                    },
                },
            }
        );

        expect(treeShake({ defaultConfig, userConfig: userConfig1 })).toStrictEqual(
            {
                key1: "",
                key2: {
                    subkey: "subkey",
                },
                key3: {
                    subkey: {
                        subsubkey: "subsubkey",
                    },
                },
            }
        );

        expect(treeShake({ defaultConfig, userConfig: userConfig2 })).toStrictEqual(
            {
                key1: "test",
                key2: {
                    subkey: "subkey",
                },
                key3: {
                    subkey: {
                        subsubkey: "subsubkey",
                    },
                },
            }
        );

        expect(treeShake({ defaultConfig, userConfig: userConfig3 })).toStrictEqual(
            {
                key1: "val1",
                key2: {
                    subkey: "subkey",
                },
                key3: {
                    subkey: {
                        subsubkey: "test",
                    },
                },
            }
        );
    });
});

describe("adaptColorToBackground", () => {
    test("returns a light color for a dark background", () => {
        const backgroundColor = "#1A1A1A";
        expect(adaptColorToBackground(backgroundColor)).toBe("#FFFFFF");
        const backgroundColor2 = "#6A6A6A";
        expect(adaptColorToBackground(backgroundColor2)).toBe("#FFFFFF");
    });
    test("returns a dark color for a light background", () => {
        const backgroundColor = "#FFFFFF";
        expect(adaptColorToBackground(backgroundColor)).toBe("#000000");
        const backgroundColor2 = "#BBBBBB";
        expect(adaptColorToBackground(backgroundColor2)).toBe("#000000");
    });
});

describe("convertColorToHex", () => {
    test("returns HEX color format from RGB", () => {
        expect(convertColorToHex("rgb(255,0,0)")).toBe("#ff0000ff");
        expect(convertColorToHex("rgb(0,255,0)")).toBe("#00ff00ff");
        expect(convertColorToHex("rgb(0,0,255)")).toBe("#0000ffff");
        expect(convertColorToHex("rgb(0,0,0)")).toBe("#000000ff");
        expect(convertColorToHex("rgb(255,255,255)")).toBe("#ffffffff");
    });

    test("returns HEX color format from HSL", () => {
        expect(convertColorToHex("hsl(0,100%,50%)")).toBe("#ff0000ff");
        expect(convertColorToHex("hsl(120,100%,50%)")).toBe("#00ff00ff");
        expect(convertColorToHex("hsl(240,100%,50%)")).toBe("#0000ffff");
        expect(convertColorToHex("hsl(0,0%,0%)")).toBe("#000000ff");
        expect(convertColorToHex("hsl(0,0%,100%)")).toBe("#ffffffff");
    });

    test("returns HEX color from an HSL passed through hslToRgba", () => {
        const rgb = hslToRgba(50, 50, 50);
        expect(convertColorToHex(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`)).toBe(
            "#bfaa40ff"
        );
    });

    test("returns HEX color from a name color", () => {
        expect(convertColorToHex("red")).toBe("#FF0000ff");
        expect(convertColorToHex("RED")).toBe("#FF0000ff");
        expect(convertColorToHex("Red")).toBe("#FF0000ff");
    });

    test("should convert rgba to hex with alpha channel", () => {
        const result = convertColorToHex("rgba(255,0,0,0.5)");
        expect(result).toBe("#ff000080");
    });

    test("should convert hsla to hex with alpha channel", () => {
        const result = convertColorToHex("hsla(0, 100%, 50%, 0.5)");
        expect(result).toBe("#ff000080");
    });
});

describe("shiftHue", () => {
    test("takes a HEX color and returns a shifted HEX color", () => {
        expect(shiftHue("#6376DD", 0.1)).toBe("#9963dd");
        expect(shiftHue("#9963dd", 0.1)).toBe("#dd63d8");
        expect(shiftHue("#dd63d8", 0.1)).toBe("#dd638f");
        expect(shiftHue("#dd638f", 0.1)).toBe("#dd8063");
        expect(shiftHue("#dd8063", 0.1)).toBe("#ddc963");
        expect(shiftHue("#ddc963", 0.1)).toBe("#a8dd63");
        expect(shiftHue("#a8dd63", 0.1)).toBe("#63dd67");
        expect(shiftHue("#63dd67", 0.1)).toBe("#63ddb0");
        expect(shiftHue("#63ddb0", 0.1)).toBe("#63c1dd");
        expect(shiftHue("#63c1dd", 0.1)).toBe("#6378dd");
    });

    test("should return a shifted hex color with same alpha channel", () => {
        expect(shiftHue("#6376DD50", 0.1)).toBe("#9963dd50");
    });
});

describe("hslToRgba", () => {
    test("converts hsl to RGBA", () => {
        expect(hslToRgba(50, 50, 50)).toStrictEqual([191, 170, 64, 1]);
    });
    test("converts hsla to RGBA", () => {
        expect(hslToRgba(50, 50, 50, 0.5)).toStrictEqual([191, 170, 64, 0.5]);
    });
});

describe("sumByAttribute", () => {
    test("sums a specific attribute in an array of objects", () => {
        const arr = [
            {
                attr1: 1,
                attr2: 2,
            },
            {
                attr1: 1,
                attr2: 2,
            },
            {
                attr1: 1,
                attr2: 2,
            },
        ];
        expect(sumByAttribute(arr, "attr1")).toBe(3);
        expect(sumByAttribute(arr, "attr2")).toBe(6);
    });
});

describe("closestDecimal", () => {
    test("returns the closest decimal of a number", () => {
        expect(closestDecimal(12)).toBe(10);
        expect(closestDecimal(15)).toBe(20);
        expect(closestDecimal(19)).toBe(20);
        expect(closestDecimal(21)).toBe(20);
        expect(closestDecimal(99)).toBe(100);
        expect(closestDecimal(150)).toBe(200);
        expect(closestDecimal(1500)).toBe(2000);
    });
    test("returns the same number from 0 to 10", () => {
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((num) => {
            expect(closestDecimal(num)).toBe(num);
        });
    });
});

describe("makeDonut", () => {
    test("it creates a donut object", () => {
        const item = {
            base: 100,
            series: [{ value: 1 }, { value: 2 }, { value: 3 }],
        };
        const cx = 100;
        const cy = 100;
        const rx = 10;
        const ry = 10;

        const donut = makeDonut(item, cx, cy, rx, ry);

        expect(donut).toStrictEqual([
            {
                arcSlice:
                    "M100.06646055814842 90.00022085272826 A 10 10 6030.380793751915 0 1 108.69274956498154 95.0567111150052 L 108.69274956498154 95.0567111150052 M108.69274956498154 95.0567111150052 A 10 10 6030.380793751915 0 0 100.06646055814842 90.00022085272826 L 100.06646055814842 90.00022085272826",
                cx: 100,
                cy: 100,
                value: 1,
                proportion: 0.16665,
                ratio: 1.0470875959773207,
                path: "M100.06646055814842 90.00022085272826 A 10 10 6030.380793751915 0 1 108.69274956498154 95.0567111150052",
                startX: 100.06646055814842,
                startY: 90.00022085272826,
                endX: 108.69274956498154,
                endY: 95.0567111150052,
                firstSeparator: {
                    x: 100.06646055814842,
                    y: 90.00022085272826,
                },
                separator: {
                    x: 108.69274956498154,
                    y: 95.0567111150052,
                },
                center: {
                    startX: 100.09636780931521,
                    startY: 85.50032023645599,
                    endX: 107.33264187784894,
                    endY: 87.49070892931114,
                    path: "M100.09636780931521 85.50032023645599 A 14.5 14.5 6030.380793751915 0 1 107.33264187784894 87.49070892931114",
                },
            },
            {
                arcSlice:
                    "M108.69274956498154 95.0567111150052 A 10 10 6030.380793751915 0 1 99.93579085805592 109.9997938571798 L 99.93579085805592 109.9997938571798 M99.93579085805592 109.9997938571798 A 10 10 6030.380793751915 0 0 108.69274956498154 95.0567111150052 L 108.69274956498154 95.0567111150052",
                cx: 100,
                cy: 100,
                value: 2,
                proportion: 0.33331666666666665,
                ratio: 2.0942799111861623,
                path: "M108.69274956498154 95.0567111150052 A 10 10 6030.380793751915 0 1 99.93579085805592 109.9997938571798",
                startX: 108.69274956498154,
                startY: 95.0567111150052,
                endX: 99.93579085805592,
                endY: 109.9997938571798,
                firstSeparator: {
                    x: 108.69274956498154,
                    y: 95.0567111150052
                },
                separator: {
                    x: 99.93579085805592,
                    y: 109.9997938571798,
                },
                center: {
                    startX: 112.60448686922324,
                    startY: 92.83223111675754,
                    endX: 112.51009725731319,
                    endY: 107.33126637168266,
                    path: "M112.60448686922324 92.83223111675754 A 14.5 14.5 6030.380793751915 0 1 112.51009725731319 107.33126637168266",
                },
            },
            {
                arcSlice:
                    "M99.93579085805592 109.9997938571798 A 10 10 6030.380793751915 0 1 100.06300489435868 90.00019848280543 L 100.06300489435868 90.00019848280543 M100.06300489435868 90.00019848280543 A 10 10 6030.380793751915 0 0 99.93579085805592 109.9997938571798 L 99.93579085805592 109.9997938571798",
                cx: 100,
                cy: 100,
                value: 3,
                proportion: 0.4999833333333333,
                ratio: 3.141472226395004,
                path: "M99.93579085805592 109.9997938571798 A 10 10 6030.380793751915 0 1 100.06300489435868 90.00019848280543",
                startX: 99.93579085805592,
                startY: 109.9997938571798,
                endX: 100.06300489435868,
                endY: 90.00019848280543,
                firstSeparator: {
                    x: 99.93579085805592,
                    y: 109.9997938571798
                },
                separator: {
                    x: 100.06300489435868,
                    y: 90.00019848280543,
                },
                center: {
                    startX: 99.9068967441811,
                    startY: 114.4997010929107,
                    endX: 85.5002940520901,
                    endY: 99.90765594688226,
                    path: "M99.9068967441811 114.4997010929107 A 14.5 14.5 6030.380793751915 0 1 85.5002940520901 99.90765594688226",
                },
            },
        ]);
    });
});

describe("createArc", () => {
    test("creates an arc object", () => {
        const arc = createArc([100, 100], [100, 100], [0, 1], 100);

        expect(arc).toStrictEqual({
            startX: 186.2318872287684,
            startY: 49.36343588902412,
            endX: 189.200486978816,
            endY: 145.20257871783505,
            path: "M186.2318872287684 49.36343588902412 A 100 100 5729.577951308232 0 1 189.200486978816 145.20257871783505",
        });
    });
});

describe("addVector", () => {
    test("adds two vectors", () => {
        const vector1 = [1, 2];
        const vector2 = [3, 4];
        const fusedVector = addVector(vector1, vector2);
        expect(fusedVector).toStrictEqual([4, 6]);
    });
});

describe("matrixTimes", () => {
    test("factors a matrix", () => {
        const vector1 = [2, 2];
        const vector2 = [3, 3];
        const coordinates = [5, 5];
        const factorizedMatrix = matrixTimes([vector1, vector2], coordinates);
        expect(factorizedMatrix).toStrictEqual([20, 30]);
    });
});

describe("rotateMatrix", () => {
    test("rotates a matrix from a number", () => {
        expect(rotateMatrix(1)).toStrictEqual([
            [0.5403023058681398, -0.8414709848078965],
            [0.8414709848078965, 0.5403023058681398],
        ]);
    });
});

describe("calcPolygonPoints", () => {
    test("creates a triangle object with usable svg path & coordinates", () => {
        const triangle = {
            centerX: 100,
            centerY: 100,
            outerPoints: 1.5,
            radius: 30,
            rotation: 0,
        };

        expect(calcPolygonPoints({ ...triangle }).coordinates.length).toBe(
            triangle.outerPoints * 2
        );
        expect(calcPolygonPoints({ ...triangle })).toStrictEqual({
            path: "M130,100 85,125.98076211353316 84.99999999999999,74.01923788646684 Z",
            coordinates: [
                { x: 130, y: 100 },
                { x: 85, y: 125.98076211353316 },
                { x: 84.99999999999999, y: 74.01923788646684 },
            ],
        });
    });
    test("creates a rectangle object with usable svg path & coordinates", () => {
        const rect = {
            centerX: 100,
            centerY: 100,
            outerPoints: 2,
            radius: 30,
            rotation: 0,
        };

        expect(calcPolygonPoints({ ...rect }).coordinates.length).toBe(
            rect.outerPoints * 2
        );
        expect(calcPolygonPoints({ ...rect })).toStrictEqual({
            path: "M130,100 100,130 70,100 100,70 Z",
            coordinates: [
                { x: 130, y: 100 },
                { x: 100, y: 130 },
                { x: 70, y: 100 },
                { x: 100, y: 70 },
            ],
        });
    });
});

describe("createPolygonPath", () => {
    test("creates a polygon path object from plot coordinates", () => {
        const obj = {
            plot: { x: 100, y: 100 },
            radius: 30,
            sides: 3,
            rotation: 0,
        };

        expect(createPolygonPath({ ...obj }).coordinates.length).toBe(obj.sides);
        expect(createPolygonPath({ ...obj })).toStrictEqual({
            path: "M131,100 84.5,126.84678751731761 84.49999999999999,73.1532124826824 Z",
            coordinates: [
                { x: 131, y: 100 },
                { x: 84.5, y: 126.84678751731761 },
                { x: 84.49999999999999, y: 73.1532124826824 },
            ],
        });
    });
});

describe("calcStarPoints", () => {
    test("creates star points with a trailing blank space ready to be passed to a polygon svg object", () => {
        const star = {
            centerX: 100,
            centerY: 100,
            innerCirclePoints: 5,
            innerRadius: (30 * 3.5) / 5,
            outerRadius: ((30 * 3.5) / 5) * 2,
        };

        expect(calcStarPoints({ ...star })).toEqual(
            "59.99865482256344,87.1979539137069 87.58154292114362,83.06536319312983 99.81437389459367,58.00041020499139 112.26828240498303,82.9562549059315 139.88662193509617,86.84487207942455 120.00067258871826,106.40102304314662 124.83691415771287,133.86927361374026 100.09281305270324,120.9997948975043 75.46343519003383,134.0874901881369 80.05668903245189,106.57756396028766 "
        );
    });
});

describe("createStar", () => {
    test("also creates star points with a trailing blank space ready to be passed to a polygon svg object", () => {
        const star = {
            plot: { x: 100, y: 100 },
            radius: 30,
        };
        expect(createStar({ ...star })).toEqual(
            "59.99865482256344,87.1979539137069 87.58154292114362,83.06536319312983 99.81437389459367,58.00041020499139 112.26828240498303,82.9562549059315 139.88662193509617,86.84487207942455 120.00067258871826,106.40102304314662 124.83691415771287,133.86927361374026 100.09281305270324,120.9997948975043 75.46343519003383,134.0874901881369 80.05668903245189,106.57756396028766 "
        );
    });
});

describe("calcMedian", () => {
    test("caclulates a median from an array of numbers", () => {
        const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        expect(calcMedian(arr)).toBe(4.5);
        const arr2 = [0.212, 1.313, 2.333, 3.618];
        expect(calcMedian(arr2)).toBe(1.823);
    });
});

describe("createSmoothPath", () => {
    test("creates a smooth curved path usable in a d attribute", () => {
        const points = [
            { x: 1, y: 3 },
            { x: 2, y: 1 },
            { x: 3, y: 3 },
            { x: 4, y: 1 },
            { x: 5, y: 3 },
            { x: 6, y: 1 },
            { x: 7, y: 3 },
            { x: 8, y: 1 },
            { x: 9, y: 3 },
        ];

        expect(createSmoothPath(points)).toBe(
            "1,3 C 1.3333333333333333,2.3333333333333335 1.6666666666666667,1 2,1 C 2.3333333333333335,1 2.6666666666666665,3 3,3 C 3.3333333333333335,3 3.6666666666666665,1 4,1 C 4.333333333333333,1 4.666666666666667,3 5,3 C 5.333333333333333,3 5.666666666666667,1 6,1 C 6.333333333333333,1 6.666666666666667,3 7,3 C 7.333333333333333,3 7.666666666666667,1 8,1 C 8.333333333333334,1 8.666666666666666,2.3333333333333335 9,3"
        );
    });
});

describe("calcPercentageTrend", () => {
    test("returns a growth trend from an array of numbers", () => {
        const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        expect(calcPercentageTrend(arr)).toBe(1);

        const arr2 = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
        expect(calcPercentageTrend(arr2)).toBe(-1);

        const arr3 = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
        expect(calcPercentageTrend(arr3)).toBe(0);

        const arr4 = [1, 2, 1.5, 1.25, 1.125, 1.065];
        expect(calcPercentageTrend(arr4)).toBe(0.033591731266149845);
    });
});

describe("calcLinearProgression", () => {
    test("creates a linear progression object from an array of coordinates", () => {
        const plots = [
            { x: 1, y: 1, value: 1 },
            { x: 2, y: 1.1, value: 1.1 },
            { x: 3, y: 1.3, value: 1.3 },
            { x: 4, y: 1.6, value: 1.6 },
            { x: 5, y: 2, value: 2 },
            { x: 6, y: 2.5, value: 2.5 },
            { x: 7, y: 3.1, value: 3.1 },
            { x: 8, y: 3.8, value: 3.8 },
            { x: 9, y: 2.6, value: 2.6 },
        ];
        expect(calcLinearProgression(plots)).toStrictEqual({
            x1: 1,
            y1: 0.8444444444444444,
            x2: 9,
            y2: 3.3777777777777773,
            slope: 0.31666666666666665,
            trend: 0.4000000000000001,
        });
    });
});

describe("makePath", () => {
    const plots = [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 4 },
        { x: 4, y: 5 },
        { x: 5, y: 6 },
    ];
    test("creates an open svg path from an array of plots", () => {
        expect(makePath(plots, false)).toBe("M1,2 2,3 3,4 4,5 5,6 ");
    });
    test("creates a closed svg path from an array of plots", () => {
        expect(makePath(plots)).toBe("M1,2 2,3 3,4 4,5 5,6 Z");
    });
    test("creates svg points for a polygon", () => {
        expect(makePath(plots, false, true)).toBe("1,2 2,3 3,4 4,5 5,6");
    });
    test("returns an empty path when plots are empty", () => {
        expect(makePath([], false)).toBe("M0,0");
    });
});

describe("calculateNiceScale", () => {
    test("returns an object with nice scaling for y axis labels", () => {
        expect(calculateNiceScale(0, 118, 10)).toStrictEqual({
            max: 120,
            min: 0,
            tickSize: 20,
            ticks: [0, 20, 40, 60, 80, 100, 120],
        });

        expect(calculateNiceScale(0, 1, 10)).toStrictEqual({
            max: 1,
            min: 0,
            tickSize: 0.1,
            ticks: [
                0, 0.1, 0.2, 0.30000000000000004, 0.4, 0.5, 0.6, 0.7,
                0.7999999999999999, 0.8999999999999999, 0.9999999999999999,
            ],
        });
    });
});

describe("calculateNiceScaleWithExactExtremes", () => {
    test("returns an object with nice scaling for y axis labels, keeping exact values for extremes", () => {
        expect(calculateNiceScaleWithExactExtremes(0, 118, 10)).toStrictEqual({
            max: 118,
            min: 0,
            tickSize: 20,
            ticks: [0, 20, 40, 60, 80, 118],
        });

        expect(calculateNiceScaleWithExactExtremes(0, 1, 10)).toStrictEqual({
            max: 1,
            min: 0,
            tickSize: 0.1,
            ticks: [
                0, 0.1, 0.2, 0.30000000000000004, 0.4, 0.5, 0.6, 0.7,
                0.7999999999999999, 0.8999999999999999, 1,
            ],
        });
    });
});

describe("niceNum", () => {
    test("returns a nice number", () => {
        expect(niceNum(1.18, false)).toBe(2);
        expect(niceNum(1.18, 1)).toBe(1);
        expect(niceNum(11.8, false)).toBe(20);
        expect(niceNum(11.8, 1)).toBe(10);
        expect(niceNum(118, false)).toBe(200);
        expect(niceNum(118, 1)).toBe(100);
        expect(niceNum(1118, false)).toBe(2000);
        expect(niceNum(1118, 1)).toBe(1000);
    });
});

describe("interpolateColorHex", () => {
    test("returns a color between two hex colors at a given range", () => {
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 0)).toBe(
            "#0000ff"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 10)).toBe(
            "#1a00e6"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 20)).toBe(
            "#3300cc"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 30)).toBe(
            "#4d00b3"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 40)).toBe(
            "#660099"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 50)).toBe(
            "#800080"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 60)).toBe(
            "#990066"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 70)).toBe(
            "#b3004d"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 80)).toBe(
            "#cc0033"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 90)).toBe(
            "#e6001a"
        );
        expect(interpolateColorHex("#0000FF", "#FF0000", 0, 100, 100)).toBe(
            "#ff0000"
        );

        expect(interpolateColorHex("#0000FF80", "#FF000080", 0, 100, 0)).toBe(
            "#0000ff80"
        );
        expect(interpolateColorHex("#0000FF80", "#FF000080", 0, 100, 50)).toBe(
            "#80008080"
        );
        expect(interpolateColorHex("#0000FF80", "#FF000080", 0, 100, 100)).toBe(
            "#ff000080"
        );
    });
});

describe("dataLabel", () => {
    test("returns a formatted dataLabel with defaults", () => {
        expect(dataLabel({ v: 1 })).toBe("1");
        expect(dataLabel({ v: 1.1 })).toBe("1");
        expect(dataLabel({ v: 1.9 })).toBe("2");
    });

    test("returns a formatted dataLabel with rounding", () => {
        expect(dataLabel({ v: 1, r: 1 })).toBe("1");
        expect(dataLabel({ v: 1.1, r: 1 })).toBe("1.1");
        expect(dataLabel({ v: 1.96, r: 1 })).toBe("2");
    });

    test("returns a formatted dataLabel with prefix and suffix", () => {
        expect(dataLabel({ p: "$", v: 1, s: "$" })).toBe("$1$");
        expect(dataLabel({ p: "$", v: 1.1, s: "$", r: 1 })).toBe("$1.1$");
    });

    test("returns a formatted dataLabel with spaced prefix and suffix", () => {
        expect(dataLabel({ p: "$", v: 1, s: "$", space: true })).toBe("$ 1 $");
        expect(dataLabel({ p: "$", v: 1.1, s: "$", r: 1, space: true })).toBe(
            "$ 1.1 $"
        );
    });

    test("returns a formatted dataLabel in loading mode", () => {
        expect(dataLabel({ p: "$", v: 1, s: "$", isAnimating: true })).toBe("---");
    });

    test("returns a formatted percentage datalabel in loading mode", () => {
        expect(dataLabel({ v: 10, s: "%", isAnimating: true })).toBe("--%");
    });

    test("returns a formatted dataLabel in loading mode with a custom regex", () => {
        expect(
            dataLabel({ p: "$", v: 10, isAnimating: true, regex: /[^$]/g })
        ).toBe("$--");
        expect(
            dataLabel({ p: "$", v: 10, s: "$", isAnimating: true, regex: /[^$]/g })
        ).toBe("$--$");
    });

    test("returns a formatted dataLabel with locale", () => {
        expect(dataLabel({ v: 1000, locale: "de-DE" })).toBe("1.000");
        expect(dataLabel({ v: 1000.5, locale: "de-DE", r: 1 })).toBe("1.000,5");
        expect(dataLabel({ v: 1000.5, locale: "en-US", r: 1 })).toBe("1,000.5");
    });

    test("returns a formatted dataLabel with prefix, suffix, and locale", () => {
        expect(dataLabel({ p: "$", v: 1000, s: " USD", locale: "en-US" })).toBe(
            "$1,000 USD"
        );
        expect(
            dataLabel({ p: "€", v: 1000.5, s: " EUR", locale: "de-DE", r: 1 })
        ).toBe("€1.000,5 EUR");
    });
});

describe("abbreviate", () => {
    test("returns an empty string for a falsy value", () => {
        expect(abbreviate({ source: null })).toBe("");
        expect(abbreviate({ source: undefined })).toBe("");
    });
    test("returns 0 for 0", () => {
        expect(abbreviate({ source: 0 })).toBe("0");
    });
    test("returns abbreviated first 3 letters", () => {
        expect(abbreviate({ source: "some long label" })).toBe("SLL");
        expect(abbreviate({ source: "some even longer label" })).toBe("SEL");
    });
    test("returns abbreviated letters with custom max len", () => {
        expect(abbreviate({ source: "some even longer label", length: 4 })).toBe(
            "SELL"
        );
        expect(abbreviate({ source: "some even longer label", length: 10 })).toBe(
            "SELL"
        );
        expect(abbreviate({ source: "some 1 2 3", length: 10 })).toBe("S123");
        expect(abbreviate({ source: "1 2 3 4 5", length: 5 })).toBe("12345");
    });
    test("returns first letters of unique word", () => {
        expect(abbreviate({ source: "unique" })).toBe("UNI");
        expect(abbreviate({ source: "un" })).toBe("UN");
        expect(abbreviate({ source: "u" })).toBe("U");
    });
    test("returns first letters of unique word with custom max len", () => {
        expect(abbreviate({ source: "paradoxical", length: 7 })).toBe("PARADOX");
    });
});

const batch = [
    "",
    null,
    "NaN",
    () => () => "test",
    () => null,
    () => undefined,
    () => ({ key: "val" }),
    () => "GOOD",
];

describe("isFunction", () => {
    test("returns false for an empty string", () => {
        expect(isFunction(batch[0])).toBe(false);
    });
    test("returns false for null", () => {
        expect(isFunction(batch[1])).toBe(false);
    });
    test("returns false for NaN", () => {
        expect(isFunction(batch[2])).toBe(false);
    });
    test("returns true for a callback", () => {
        expect(isFunction(batch[3])).toBe(true);
    });
    test("returns true for other funcs", () => {
        expect(isFunction(batch[4])).toBe(true);
        expect(isFunction(batch[5])).toBe(true);
        expect(isFunction(batch[6])).toBe(true);
    });
});

describe("functionReturnsString", () => {
    test("returns true for an empty string", () => {
        expect(functionReturnsString(() => "")).toBe(true);
    });
    test("returns true for any string", () => {
        expect(
            functionReturnsString(() => '<div style="color:red;">yey</div>')
        ).toBe(true);
    });
    test("returns false for other return types", () => {
        expect(functionReturnsString(() => () => "wut")).toBe(false);
        expect(functionReturnsString(() => null)).toBe(false);
        expect(functionReturnsString(() => undefined)).toBe(false);
        expect(functionReturnsString(() => ["yey", "wut"])).toBe(false);
        expect(functionReturnsString(() => ({ key: "value" }))).toBe(false);
        expect(functionReturnsString(() => 0)).toBe(false);
        expect(functionReturnsString(() => 123)).toBe(false);
    });
});

describe("objectIsEmpty", () => {
    test("returns true for an empty object", () => {
        expect(objectIsEmpty({})).toBe(true);
    });
    test("returns false for a non empty object", () => {
        expect(objectIsEmpty({ bar: "foo" })).toBe(false);
    });
    test("returns true for an empty array", () => {
        expect(objectIsEmpty([])).toBe(true);
    });
    test("returns false for a non empty array", () => {
        expect(objectIsEmpty([0])).toBe(false);
    });
});

describe("error", () => {
    const consoleMock = vi
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);

    afterAll(() => {
        consoleMock.mockReset();
    });

    beforeEach(() => {
        consoleMock.mockReset();
    });

    test("throws an error for missing dataset", () => {
        try {
            error({
                componentName: "VueUiXy",
                type: "dataset",
                warn: false,
            });
            fail("Error was not thrown");
        } catch (error) {
            expect(error.message).toBe(
                "\n> VueUiXy dataset prop is either missing, undefined or empty.\n"
            );
        }
    });

    test("logs a warning for missing dataset", () => {
        error({
            componentName: "VueUiXy",
            type: "dataset",
        });
        expect(consoleMock).toHaveBeenCalledOnce();
        expect(consoleMock).toHaveBeenLastCalledWith(
            "\n> VueUiXy dataset prop is either missing, undefined or empty.\n"
        );
    });

    test("throws an error for missing dataset object required attribute", () => {
        try {
            error({
                componentName: "VueUiXy",
                type: "datasetAttribute",
                property: "name",
                warn: false,
            });
            fail("Error was not thrown");
        } catch (error) {
            expect(error.message).toBe(
                `\n> VueUiXy dataset is missing the 'name' attribute.\n`
            );
        }
    });

    test("logs a warning for missing dataset object required attribute", () => {
        error({
            componentName: "VueUiXy",
            type: "datasetAttribute",
            property: "name",
        });
        expect(consoleMock).toHaveBeenCalledOnce();
        expect(consoleMock).toHaveBeenLastCalledWith(
            `\n> VueUiXy dataset is missing the 'name' attribute.\n`
        );
    });

    test("throws an error for missing datasetItem required attribute", () => {
        try {
            error({
                componentName: "VueUiXy",
                type: "datasetSerieAttribute",
                property: "name",
                index: 0,
                warn: false,
            });
            fail("Error was not thrown");
        } catch (error) {
            expect(error.message).toBe(
                `\n> VueUiXy dataset  item at index 0 is missing the 'name' attribute.\n`
            );
        }
    });

    test("logs a warning for missing datasetItem required attribute", () => {
        error({
            componentName: "VueUiXy",
            type: "datasetSerieAttribute",
            property: "name",
            index: 0,
        });
        expect(consoleMock).toHaveBeenCalledOnce();
        expect(consoleMock).toHaveBeenLastCalledWith(
            `\n> VueUiXy dataset  item at index 0 is missing the 'name' attribute.\n`
        );
    });

    test("throws an error for an empty dataset array item", () => {
        try {
            error({
                componentName: "VueUiXy",
                type: "datasetAttributeEmpty",
                property: "series",
                warn: false,
            });
            fail("Error was not thrown");
        } catch (error) {
            expect(error.message).toBe(
                `\n> VueUiXy dataset 'series' attribute cannot be empty.\n`
            );
        }
    });

    test("logs a warning for an empty dataset array item", () => {
        error({
            componentName: "VueUiXy",
            type: "datasetAttributeEmpty",
            property: "series",
        });
        expect(consoleMock).toHaveBeenCalledOnce();
        expect(consoleMock).toHaveBeenLastCalledWith(
            `\n> VueUiXy dataset 'series' attribute cannot be empty.\n`
        );
    });
});

describe("generateSpiralCoordinates and createSpiralPath", () => {
    const config = {
        points: 10,
        a: 6,
        b: 6,
        angleStep: 0.07,
        startX: 100,
        startY: 100,
    };

    test("creates spiral coordinates", () => {
        expect(generateSpiralCoordinates(config)).toStrictEqual([
            {
                x: 106,
                y: 100,
            },
            {
                x: 106.40427742162605,
                y: 100.44903307990695,
            },
            {
                x: 106.77307741409444,
                y: 100.95447490416657,
            },
            {
                x: 107.10050444089731,
                y: 101.51341887288268,
            },
            {
                x: 107.38090576622672,
                y: 102.1224113809724,
            },
            {
                x: 107.60891897406377,
                y: 102.77747224038916,
            },
            {
                x: 107.77951777146086,
                y: 103.47411906006754,
            },
            {
                x: 107.88805575597449,
                y: 104.20739544025015,
            },
            {
                x: 107.93030783908557,
                y: 104.97190281253947,
            },
            {
                x: 107.90250903129285,
                y: 105.7618357326754,
            },
        ]);
    });

    test("creates a spiral path", () => {
        expect(createSpiralPath(config)).toStrictEqual(
            "M106 100 C106.20213871081302 100.22451653995347, 106.58867741786025 100.70175399203677, 106.93679092749588 101.23394688852463 C106.93679092749588 101.23394688852463, 107.24070510356202 101.81791512692755, 107.49491237014524 102.44994181068077 C107.49491237014524 102.44994181068077, 107.69421837276232 103.12579565022835, 107.83378676371768 103.84075725015884 C107.83378676371768 103.84075725015884, 107.90918179753004 104.58964912639482, 107.91640843518921 105.36686927260743"
        );
    });
});

describe("createTSpans", () => {
    test("creates tspans from text content", () => {
        expect(
            createTSpans({
                content: "Lorem ipsum dolor sit amet Lorem ipsum dolor sit amet",
                fontSize: 20,
                fill: "#FF0000",
                maxWords: 5,
                x: 0,
                y: 0,
            })
        ).toStrictEqual(
            '<tspan x="0" y="0" fill="#FF0000">Lorem ipsum dolor sit amet</tspan><tspan x="0" y="20" fill="#FF0000">Lorem ipsum dolor sit amet</tspan>'
        );
    });
});

describe("convertCustomPalette", () => {
    test("returns null if custom palette is empty", () => {
        expect(convertCustomPalette([])).toStrictEqual([]);
    });
    test("returns converted named colors", () => {
        expect(convertCustomPalette(["red", "green", "blue"])).toStrictEqual([
            "#FF0000ff",
            "#008000ff",
            "#0000FFff",
        ]);
    });
    test("returns converted rgb colors", () => {
        expect(
            convertCustomPalette(["rgb(255,0,0)", "rgb(0,255,0)", "rgb(0,0,255)"])
        ).toStrictEqual(["#ff0000ff", "#00ff00ff", "#0000ffff"]);
    });
});

describe("createWordCloudDatasetFromPlainText", () => {
    test("returns a word cloud dataset from a plain text input with alphabetical characters", () => {
        const text = "Hello, world! This//?$$^¨#&-_[]{}@+= world is a world :)";
        const expected = [
            {
                name: "Hello",
                value: 1,
            },
            {
                name: "world",
                value: 3,
            },
            {
                name: "This",
                value: 1,
            },
            {
                name: "is",
                value: 1,
            },
            {
                name: "a",
                value: 1,
            },
        ];
        expect(createWordCloudDatasetFromPlainText(text)).toStrictEqual(expected);
    });
    test("returns a word cloud dataset from a plain text input with chinese characters", () => {
        const text = "世界你好，这个世界是一个世界！";
        const expected = [
            {
                name: "世",
                value: 3,
            },
            {
                name: "界",
                value: 3,
            },
            {
                name: "你",
                value: 1,
            },
            {
                name: "好",
                value: 1,
            },
            {
                name: "这",
                value: 1,
            },
            {
                name: "个",
                value: 2,
            },
            {
                name: "是",
                value: 1,
            },
            {
                name: "一",
                value: 1,
            },
        ];
        expect(createWordCloudDatasetFromPlainText(text)).toStrictEqual(expected);
    });
    test("returns a word cloud dataset from a plain text input with japanese characters", () => {
        const text = "こんにちは、世界です、この世界は世界です！";
        const expected = [
            {
                name: "こ",
                value: 2,
            },
            {
                name: "ん",
                value: 1,
            },
            {
                name: "に",
                value: 1,
            },
            {
                name: "ち",
                value: 1,
            },
            {
                name: "は",
                value: 2,
            },
            {
                name: "世",
                value: 3,
            },
            {
                name: "界",
                value: 3,
            },
            {
                name: "で",
                value: 2,
            },
            {
                name: "す",
                value: 2,
            },
            {
                name: "の",
                value: 1,
            },
        ];
        expect(createWordCloudDatasetFromPlainText(text)).toStrictEqual(expected);
    });
    test("returns a word cloud dataset from a plain text input with hangul characters", () => {
        const text = "안녕하세요 세상, 이 세상은 세상입니다!";
        const expected = [
            {
                name: "안",
                value: 1,
            },
            {
                name: "녕",
                value: 1,
            },
            {
                name: "하",
                value: 1,
            },
            {
                name: "세",
                value: 4,
            },
            {
                name: "요",
                value: 1,
            },
            {
                name: "상",
                value: 3,
            },
            {
                name: "이",
                value: 1,
            },
            {
                name: "은",
                value: 1,
            },
            {
                name: "입",
                value: 1,
            },
            {
                name: "니",
                value: 1,
            },
            {
                name: "다",
                value: 1,
            },
        ];
        expect(createWordCloudDatasetFromPlainText(text)).toStrictEqual(expected);
    });
    test("returns a word cloud dataset from a plain text input with thai characters", () => {
        const text = "สวัสดีชาวโลก โลกนี้คือโลก !";
        const expected = [
            {
                name: "ส",
                value: 2,
            },
            {
                name: "ว",
                value: 2,
            },
            {
                name: "ั",
                value: 1,
            },
            {
                name: "ด",
                value: 1,
            },
            {
                name: "ี",
                value: 2,
            },
            {
                name: "ช",
                value: 1,
            },
            {
                name: "า",
                value: 1,
            },
            {
                name: "โ",
                value: 3,
            },
            {
                name: "ล",
                value: 3,
            },
            {
                name: "ก",
                value: 3,
            },
            {
                name: "น",
                value: 1,
            },
            {
                name: "้",
                value: 1,
            },
            {
                name: "ค",
                value: 1,
            },
            {
                name: "ื",
                value: 1,
            },
            {
                name: "อ",
                value: 1,
            },
        ];
        expect(createWordCloudDatasetFromPlainText(text)).toStrictEqual(expected);
    });
    test("returns a word cloud dataset from plain text input with khmer characters", () => {
        const text = "សួស្តីពិភពលោក ពិភពលោកនេះគឺជាពិភពលោក!";

        const expected = [
            {
                name: "ស",
                value: 2,
            },
            {
                name: "ួ",
                value: 1,
            },
            {
                name: "្",
                value: 1,
            },
            {
                name: "ត",
                value: 1,
            },
            {
                name: "ី",
                value: 1,
            },
            {
                name: "ព",
                value: 6,
            },
            {
                name: "ិ",
                value: 3,
            },
            {
                name: "ភ",
                value: 3,
            },
            {
                name: "ល",
                value: 3,
            },
            {
                name: "ោ",
                value: 3,
            },
            {
                name: "ក",
                value: 3,
            },
            {
                name: "ន",
                value: 1,
            },
            {
                name: "េ",
                value: 1,
            },
            {
                name: "ះ",
                value: 1,
            },
            {
                name: "គ",
                value: 1,
            },
            {
                name: "ឺ",
                value: 1,
            },
            {
                name: "ជ",
                value: 1,
            },
            {
                name: "ា",
                value: 1,
            },
        ];
        expect(createWordCloudDatasetFromPlainText(text)).toStrictEqual(expected);
    });
    test("returns a word cloud dataset from plain text input with lao characters", () => {
        const text = "ສະບາຍດີໂລກ";
        const expected = [
            {
                name: "ສ",
                value: 1,
            },
            {
                name: "ະ",
                value: 1,
            },
            {
                name: "ບ",
                value: 1,
            },
            {
                name: "າ",
                value: 1,
            },
            {
                name: "ຍ",
                value: 1,
            },
            {
                name: "ດ",
                value: 1,
            },
            {
                name: "ີ",
                value: 1,
            },
            {
                name: "ໂ",
                value: 1,
            },
            {
                name: "ລ",
                value: 1,
            },
            {
                name: "ກ",
                value: 1,
            },
        ];
        expect(createWordCloudDatasetFromPlainText(text)).toStrictEqual(expected);
    });
    test("returns a word cloud dataset from plain text input with arabic alphabet", () => {
        const text = "أهلاً بالعالم، هذا العالم عالم!";
        const expected = [
            {
                name: "أهلاً",
                value: 1,
            },
            {
                name: "بالعالم",
                value: 1,
            },
            {
                name: "هذا",
                value: 1,
            },
            {
                name: "العالم",
                value: 1,
            },
            {
                name: "عالم",
                value: 1,
            },
        ];
        expect(createWordCloudDatasetFromPlainText(text)).toStrictEqual(expected);
    });
    test("returns a word cloud dataset from plain text input with hebrew alphabet", () => {
        const text = "שלום עולם, העולם הזה הוא עולם!";
        const expected = [
            {
                name: "שלום",
                value: 1,
            },
            {
                name: "עולם",
                value: 2,
            },
            {
                name: "העולם",
                value: 1,
            },
            {
                name: "הזה",
                value: 1,
            },
            {
                name: "הוא",
                value: 1,
            },
        ];
        expect(createWordCloudDatasetFromPlainText(text)).toStrictEqual(expected);
    });
    test("returns a word cloud dataset from a plain text input with a formatter callback", () => {
        const text = "Hello, world !";
        const expectedUC = [
            {
                name: "HELLO",
                value: 1,
            },
            {
                name: "WORLD",
                value: 1,
            },
        ];
        const expectedLC = [
            {
                name: "hello",
                value: 1,
            },
            {
                name: "world",
                value: 1,
            },
        ];
        function formatterUC(w) {
            return w.toUpperCase();
        }
        function formatterLC(w) {
            return w.toLowerCase();
        }

        expect(
            createWordCloudDatasetFromPlainText(text, formatterUC)
        ).toStrictEqual(expectedUC);
        expect(
            createWordCloudDatasetFromPlainText(text, formatterLC)
        ).toStrictEqual(expectedLC);
    });
});

describe("assignStackRatios", () => {
    const ds = [
        {
            name: "A",
            series: [1, 2, 3],
            stackRatio: 0.5,
        },
        {
            name: "B",
            series: [1, 2, 3],
        },
        {
            name: "C",
            series: [1, 2, 3],
        },
    ];

    const expectedResult = [
        {
            name: "A",
            series: [1, 2, 3],
            stackRatio: 0.5,
            cumulatedStackRatio: 0.5,
        },
        {
            name: "B",
            series: [1, 2, 3],
            stackRatio: 0.25,
            cumulatedStackRatio: 0.75,
        },
        {
            name: "C",
            series: [1, 2, 3],
            stackRatio: 0.25,
            cumulatedStackRatio: 1,
        },
    ];

    const dsEmpty = [
        {
            name: "A",
            series: [1, 2, 3],
        },
        {
            name: "A",
            series: [1, 2, 3],
        },
    ];

    const expectedResultEmpty = [
        {
            name: "A",
            series: [1, 2, 3],
            stackRatio: 0.5,
            cumulatedStackRatio: 0.5,
        },
        {
            name: "A",
            series: [1, 2, 3],
            stackRatio: 0.5,
            cumulatedStackRatio: 1,
        },
    ];

    test("sets stackRatios and cumulatedStackRatios to all datapoints", () => {
        expect(assignStackRatios(ds)).toStrictEqual(expectedResult);
        expect(assignStackRatios(dsEmpty)).toStrictEqual(expectedResultEmpty);
    });
});

describe("getPathLengthFromCoordinates", () => {
    const straightLine = "M 0 0 10 0";
    test("returns a path length from coordinates", () => {
        expect(getPathLengthFromCoordinates(straightLine)).toBe(10);
    });

    const hypothenuse = "M 0 0 10 10";
    test("returns hypothenuse length", () => {
        expect(getPathLengthFromCoordinates(hypothenuse)).toBe(14.142135623730951);
    });
});

describe("translateSize", () => {
    test("returns a translated dimension", () => {
        expect(
            translateSize({
                relator: 1000,
                adjuster: 500,
                source: 20,
                fallback: 10,
            })
        ).toBe(24);

        expect(
            translateSize({
                relator: 1000,
                adjuster: 500,
                source: 20,
                fallback: 10,
                max: 12,
            })
        ).toBe(12);

        expect(
            translateSize({
                relator: -100,
                adjuster: 500,
                source: 10,
                fallback: 5,
            })
        ).toBe(5);
    });
});

describe("sumSeries", () => {
    const items = [
        { series: [1, 1, 1] },
        { series: [1, 1, 1] },
        { series: [1, 1, null] },
        { series: [1, 1, undefined] },
        { series: [1, 1, NaN] },
        { series: [0, 0, Infinity] },
        { series: [0, 0, -Infinity] },
        { series: [1, 1] },
        { series: [null, undefined, NaN, Infinity, -Infinity] },
    ];

    test("return an array if sums", () => {
        expect(sumSeries(items)).toStrictEqual([6, 6, 2]);
        expect(sumSeries([{ series: [] }])).toStrictEqual([]);
    });
});

describe("checkFormatter", () => {
    const params = { value: 12, config: { key: "configValue" } };
    const expected = `expected${params.value}`;

    const testFunc = ({ value }) => {
        return `expected${value}`;
    };

    const failingFunc = () => {
        throw new Error("ERROR");
    };

    const functionFunc = () => {
        return () => {
            return 1;
        };
    };

    const functionObject = () => {
        return {
            a: 1,
        };
    };

    const functionBool = () => {
        return false;
    };

    test("returns the callback content", () => {
        expect(checkFormatter(testFunc, params)).toStrictEqual({
            isValid: true,
            value: expected,
        });
    });

    test("returns proper values when the callback throws", () => {
        expect(checkFormatter(failingFunc, params)).toStrictEqual({
            isValid: false,
            value: params.value,
        });
    });

    test("returns proper values when the callback returns a function", () => {
        expect(checkFormatter(functionFunc, params)).toStrictEqual({
            isValid: false,
            value: params.value,
        });
    });

    test("returns proper values when the callback returns an object", () => {
        expect(checkFormatter(functionObject, params)).toStrictEqual({
            isValid: false,
            value: params.value,
        });
    });

    test("returns proper values when the callback returns a boolean", () => {
        expect(checkFormatter(functionBool, params)).toStrictEqual({
            isValid: false,
            value: params.value,
        });
    });

    test("handles config object in params but doesn't use it", () => {
        const configTestFunc = ({ value }) => `formatted ${value}`;
        expect(
            checkFormatter(configTestFunc, { value: 15, config: { key: "unused" } })
        ).toStrictEqual({
            isValid: true,
            value: "formatted 15",
        });
    });
});

describe("applyDataLabel", () => {
    const params = { value: 12, config: { key: "configValue" } };
    const expected = `expected${params.value}`;

    const testFunc = ({ value }) => {
        return `expected${value}`;
    };

    const failingFunc = () => {
        throw new Error("ERROR");
    };

    const functionFunc = () => {
        return () => {
            return 1;
        };
    };

    const functionObject = () => {
        return {
            a: 1,
        };
    };

    const functionBool = () => {
        return false;
    };

    const fallback = "fallback";

    test("returns the output of the callback", () => {
        expect(
            applyDataLabel(testFunc, params.value, fallback, params.config)
        ).toStrictEqual(expected);

        expect(
            applyDataLabel(failingFunc, params.value, fallback, params.config)
        ).toStrictEqual(fallback);

        expect(
            applyDataLabel(functionFunc, params.value, fallback, params.config)
        ).toStrictEqual(fallback);

        expect(
            applyDataLabel(functionObject, params.value, fallback, params.config)
        ).toStrictEqual(fallback);

        expect(
            applyDataLabel(functionBool, params.value, fallback, params.config)
        ).toStrictEqual(fallback);
    });

    test("handles custom config in applyDataLabel", () => {
        const configFunc = ({ value, config }) =>
            `${config.prefix}${value}${config.suffix}`;
        expect(
            applyDataLabel(configFunc, params.value, fallback, {
                prefix: "p-",
                suffix: "-s",
            })
        ).toStrictEqual("p-12-s");
    });
});

describe("hasDeepProperty", () => {
    const obj = {
        attr0: {
            attr1: {
                attr2: {
                    attr3: "A",
                },
            },
        },
    };
    test("checks if an object as a deep property", () => {
        expect(hasDeepProperty(obj, "attr0")).toBe(true);
        expect(hasDeepProperty(obj, "attr0.attr1")).toBe(true);
        expect(hasDeepProperty(obj, "attr0.attr1.attr2")).toBe(true);
        expect(hasDeepProperty(obj, "attr0.attr1.attr2.attr3")).toBe(true);
        expect(hasDeepProperty(obj, "attr0.attr1.attr2.attr3.attr4")).toBe(false);
    });
});

describe("sanitizeArray", () => {
    const source0 = [1, 2, 3, NaN, undefined, Infinity, -Infinity];
    test("sanitizes an array of numbers", () => {
        expect(sanitizeArray(source0)).toStrictEqual([1, 2, 3, 0, 0, 0, 0]);
    });

    const source1 = [
        {
            values: [1, NaN, undefined, Infinity, -Infinity],
            value: [2, NaN, undefined, Infinity, -Infinity],
        },
    ];
    test("sanitizes an array of objects where some attributes are arrays of numbers", () => {
        expect(sanitizeArray(source1, ["values, value"])).toStrictEqual([
            {
                value: [2, 0, 0, 0, 0],
                values: [1, 0, 0, 0, 0],
            },
        ]);
    });
});

describe("lightenHexColor", () => {
    test("should lighten a hex color without transparency", () => {
        const result = lightenHexColor("#ff5733", 0.2);
        expect(result).toBe("#ff795c");
    });

    test("should lighten a hex color with transparency", () => {
        const result = lightenHexColor("#ff573380", 0.2);
        expect(result).toBe("#ff795c80");
    });

    test("should return a default color for invalid hex format", () => {
        const result = lightenHexColor("invalid", 0.2);
        expect(result).toBe("#000000");
    });

    test("should lighten a short hex color without transparency", () => {
        const result = lightenHexColor("#f53", 0.3);
        expect(result).toBe("#ff8870");
    });

    test("should lighten a short hex color with transparency", () => {
        const result = lightenHexColor("#f53880", 0.3);
        expect(result).toBe("#f874a6");
    });
});

describe("darkenHexColor", () => {
    test("should lighten a hex color without transparency", () => {
        const result = darkenHexColor("#ff5733", 0.2);
        expect(result).toBe("#cc4629");
    });

    test("should lighten a hex color with transparency", () => {
        const result = darkenHexColor("#ff573380", 0.2);
        expect(result).toBe("#cc462980");
    });

    test("should return a default color for invalid hex format", () => {
        const result = darkenHexColor("invalid", 0.2);
        expect(result).toBe("#000000");
    });

    test("should lighten a short hex color without transparency", () => {
        const result = darkenHexColor("#f53", 0.3);
        expect(result).toBe("#b33c24");
    });

    test("should lighten a short hex color with transparency", () => {
        const result = darkenHexColor("#f53880", 0.3);
        expect(result).toBe("#ac275a");
    });
});

describe("setOpacity", () => {
    test("should set an opacity to a simple hex color", () => {
        const result1 = setOpacity("#00FF00");
        expect(result1).toBe("#00FF00FF");
        const result2 = setOpacity("#00FF00", 50);
        expect(result2).toBe("#00FF0080");
    });
    test("should override the opacity of a hex color with alpha channel", () => {
        const result = setOpacity("#00FF0080", 100);
        expect(result).toBe("#00FF00FF");
    });
});

describe("getCloserPoint", () => {
    test("should move the point closer to the center given a valid arcSize", () => {
        const result = getCloserPoint(100, 100, 150, 120, 10);
        expect(result.x).toBeCloseTo(140.7, 1);
        expect(result.y).toBeCloseTo(116.3, 1);
    });

    test("should return the same point if the point is at the center", () => {
        const result = getCloserPoint(100, 100, 100, 100, 10);
        expect(result.x).toBe(100);
        expect(result.y).toBe(100);
    });

    test("should barely move the point if arcSize is very small", () => {
        const result = getCloserPoint(100, 100, 150, 120, 0.1);
        expect(result.x).toBeCloseTo(149.9, 1);
        expect(result.y).toBeCloseTo(120, 1);
    });

    test("should move the point significantly if arcSize is large", () => {
        const result = getCloserPoint(100, 100, 150, 120, 40);
        expect(result.x).toBeCloseTo(112.9, 1);
        expect(result.y).toBeCloseTo(105.1, 1);
    });

    test("should not move the point if arcSize is zero", () => {
        const result = getCloserPoint(100, 100, 150, 120, 0);
        expect(result.x).toBe(150);
        expect(result.y).toBe(120);
    });
});

describe("getScaleFactorUsingArcSize", () => {
    beforeEach(() => {
        vi.spyOn(console, "warn").mockImplementation(() => { });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should calculate the correct scale factor for a valid arcSize", () => {
        const scaleFactor = getScaleFactorUsingArcSize(100, 100, 150, 120, 10);
        expect(scaleFactor).toBeCloseTo(0.814, 3);
    });

    test("should return a scale factor close to 1 for a very small arcSize", () => {
        const scaleFactor = getScaleFactorUsingArcSize(100, 100, 150, 120, 0.1);
        expect(scaleFactor).toBeCloseTo(0.998, 3);
    });

    test("should return a scale factor of 1 when arcSize is 0", () => {
        const scaleFactor = getScaleFactorUsingArcSize(100, 100, 150, 120, 0);
        expect(scaleFactor).toBe(1);
    });

    test("should correctly calculate the scale factor for a diagonal point", () => {
        const scaleFactor = getScaleFactorUsingArcSize(0, 0, 3, 4, 1);
        expect(scaleFactor).toBeCloseTo(0.8, 1);
    });
});

function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

describe("createPolarAreas", () => {
    test("should return an array of paths and middlePoints", () => {
        const series = [0.5, 1.0];
        const center = { x: 100, y: 100 };
        const maxRadius = 50;

        const result = createPolarAreas({ series, center, maxRadius });

        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(series.length);

        result.forEach((item) => {
            expect(item).toHaveProperty("path");
            expect(item).toHaveProperty("middlePoint");
            expect(item.middlePoint).toHaveProperty("x");
            expect(item.middlePoint).toHaveProperty("y");
        });
    });

    test("should calculate correct paths and middlePoints for simple data", () => {
        const series = [0.5, 1.0];
        const center = { x: 100, y: 100 };
        const maxRadius = 50;

        const result = createPolarAreas({ series, center, maxRadius });

        const firstPath = result[0].path;
        const firstMiddlePoint = result[0].middlePoint;
        const firstExpectedRadius = series[0] * maxRadius;

        expect(firstPath).toContain(`M ${center.x} ${center.y}`);
        expect(firstMiddlePoint.x).toBeCloseTo(
            center.x + firstExpectedRadius * Math.cos(degreesToRadians(360))
        );
        expect(firstMiddlePoint.y).toBeCloseTo(
            center.y + firstExpectedRadius * Math.sin(degreesToRadians(360))
        );

        const secondPath = result[1].path;
        const secondMiddlePoint = result[1].middlePoint;
        const secondExpectedRadius = series[1] * maxRadius;

        expect(secondPath).toContain(`M ${center.x} ${center.y}`);
        expect(secondMiddlePoint.x).toBeCloseTo(
            center.x + secondExpectedRadius * Math.cos(degreesToRadians(180))
        );
        expect(secondMiddlePoint.y).toBeCloseTo(
            center.y + secondExpectedRadius * Math.sin(degreesToRadians(180))
        );
    });

    test("should handle an empty series array", () => {
        const series = [];
        const center = { x: 100, y: 100 };
        const maxRadius = 50;

        const result = createPolarAreas({ series, center, maxRadius });

        expect(result).toBeInstanceOf(Array);
        expect(result).toHaveLength(0);
    });

    test("should handle a series with a single segment", () => {
        const series = [1.0];
        const center = { x: 100, y: 100 };
        const maxRadius = 50;

        const result = createPolarAreas({ series, center, maxRadius });

        expect(result).toHaveLength(1);
        const segment = result[0];

        expect(segment.path).toContain(`M ${center.x} ${center.y}`);
        expect(segment.middlePoint.x).toBeCloseTo(
            center.x + maxRadius * Math.cos(degreesToRadians(90))
        );
        expect(segment.middlePoint.y).toBeCloseTo(
            center.y + maxRadius * Math.sin(degreesToRadians(90))
        );
    });

    test("should calculate angles correctly for multiple segments", () => {
        const series = [0.5, 0.25, 0.75];
        const center = { x: 100, y: 100 };
        const maxRadius = 50;
        const anglePerSegment = 360 / series.length;

        const result = createPolarAreas({ series, center, maxRadius });

        result.forEach((segment, index) => {
            const startAngle = index * anglePerSegment - 90;
            const expectedMiddleAngle = degreesToRadians(
                startAngle + anglePerSegment / 2
            );

            const expectedRadius = series[index] * maxRadius;
            const expectedX =
                center.x + expectedRadius * Math.cos(expectedMiddleAngle);
            const expectedY =
                center.y + expectedRadius * Math.sin(expectedMiddleAngle);

            expect(segment.middlePoint.x).toBeCloseTo(expectedX);
            expect(segment.middlePoint.y).toBeCloseTo(expectedY);
        });
    });
});

describe("largestTriangleThreeBucketsArray", () => {
    const series = [
        74, 30, 76, 35, 98, 60, 83, 7, 14, 9, 28, 19, 50, 51, 58, 91, 93, 69, 13,
        65, 84, 56, 86, 40, 36, 12, 49, 37, 79, 36, 95, 58, 7, 27, 53, 34, 74, 65,
        85, 54, 30, 69, 41, 62, 57, 60, 32, 38, 8, 47, 58, 91, 99, 80, 94, 69, 11,
        27, 58, 5, 64, 42, 93, 9, 7, 81, 15, 15, 36, 41, 37, 19, 5, 76, 78, 90, 77,
        4, 63, 11, 94, 77, 45, 41, 83, 34, 12, 100, 11, 80, 61, 13, 45, 6, 17, 62,
        7, 3, 48, 92
    ];
    test("should downsample an array of numbers", () => {
        expect(
            largestTriangleThreeBucketsArray({
                data: series,
                threshold: 50,
            })
        ).toStrictEqual([
            74, 98, 83, 14, 28, 50, 58, 93, 13, 84, 86, 36, 49, 79, 95, 7, 53, 74, 85,
            30, 41, 57, 32, 47, 91, 80, 69, 27, 5, 42, 9, 81, 15, 41, 19, 76, 90, 4,
            11, 77, 41, 34, 100, 80, 13, 6, 62, 48, 92, 92,
        ]);
        expect(
            largestTriangleThreeBucketsArray({
                data: series,
                threshold: 20,
            })
        ).toStrictEqual([
            74, 28, 93, 56, 37, 7, 85, 62, 47, 94, 5, 81, 37, 77, 77, 100, 45, 48, 92,
            92,
        ]);
        expect(
            largestTriangleThreeBucketsArray({
                data: series,
                threshold: 10,
            })
        ).toStrictEqual([74, 36, 74, 47, 42, 76, 34, 48, 92, 92]);
    });
    test("should start downsampled series with first value of the source", () => {
        expect(
            largestTriangleThreeBucketsArray({
                data: series,
                threshold: 50,
            })[0]
        ).toBe(series[0]);
    });
    test("should end downsampled series with last value of the source", () => {
        expect(
            largestTriangleThreeBucketsArray({
                data: series,
                threshold: 50,
            }).at(-1)
        ).toBe(series.at(-1));
    });
});

describe("largestTriangleThreeBuckets", () => {
    const series = [
        { x: 12, y: 27 },
        { x: 7, y: 22 },
        { x: 13, y: 12 },
        { x: 11, y: 39 },
        { x: 3, y: -6 },
        { x: 0, y: 8 },
        { x: 19, y: 2 },
        { x: 98, y: 18 },
        { x: 66, y: 33 },
        { x: 12, y: 7 },
        { x: 22, y: 6 },
        { x: 1, y: 19 },
        { x: -20, y: 29 },
        { x: 16, y: 7 },
        { x: 12, y: 44 },
        { x: 16, y: 23 },
        { x: -16, y: -23 },
        { x: 2, y: -6 },
        { x: 1, y: -12 },
        { x: 20, y: 19 },
    ];
    test("should downsample an array of coordinates", () => {
        expect(
            largestTriangleThreeBuckets({
                data: series,
                threshold: 10,
            })
        ).toStrictEqual([
            { x: 12, y: 27, },
            { x: 11, y: 39, },
            { x: 0, y: 8, },
            { x: 66, y: 33, },
            { x: 22, y: 6, },
            { x: -20, y: 29, },
            { x: 12, y: 44, },
            { x: -16, y: -23, },
            { x: 20, y: 19, },
            { x: 20, y: 19, }
        ]);
    });
    test('should start downsampled series with first coordinates', () => {
        expect(
            largestTriangleThreeBuckets({
                data: series,
                threshold: 10,
            })[0]
        ).toStrictEqual(series[0])
    })
    test('should end downsampled series with last coordinates', () => {
        expect(
            largestTriangleThreeBuckets({
                data: series,
                threshold: 10,
            }).at(-1)
        ).toStrictEqual(series.at(-1))
    })
});

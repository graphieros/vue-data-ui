import { expect, test, describe } from "vitest";
import {
    degreesToRadians,
    checkNaN,
    isSafeValue,
    isValidUserValue,
    checkObj,
    checkArray,
    treeShake,
    convertColorToHex,
    sumByAttribute,
    closestDecimal,
    makeDonut,
    createArc,
    addVector,
    matrixTimes,
    rotateMatrix,
    hslToRgb,
    shiftHue,
    calcPolygonPoints,
    createPolygonPath,
    calcStarPoints,
    createStar
} from "../src/lib"

describe('degreesToRadians', () => {
    test('converts degrees to radians', () => {
        expect(degreesToRadians(1)).toBe(0.017453292519943295)
    });
})

describe("checkNaN", () => {
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
})

describe('isSafeValue', () => {
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
})

describe('isValidUserValue', () => {
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
        expect(isValidUserValue({ key: "value" })).toBe(true);
    });

    test('returns false if value is not valid user value', () => {
        expect(isValidUserValue(undefined)).toBe(false);
        expect(isValidUserValue(null)).toBe(false);
        expect(isValidUserValue(NaN)).toBe(false);
        expect(isValidUserValue(Infinity)).toBe(false);
        expect(isValidUserValue(-Infinity)).toBe(false);
    });
})


describe('checkObj', () => {
    test('returns true if input is a nested object', () => {
        const userConfig = { key: { subKey0: { subKey1: 'value' } } };
        const key = "key";
        expect(checkObj({ userConfig, key })).toBe(true);
    });
    test('returns false if input is not an object and not a nested object', () => {
        const userConfig = { key: 'value' };
        const key = "key";
        expect(checkObj({ userConfig, key })).toBe(false);
    });
})


describe('checkArray', () => {
    test('returns true if input is an abject containing an array', () => {
        const userConfig = { key: ['value'] };
        const key = "key";
        expect(checkArray({ userConfig, key })).toBe(true);
    });
    test('returns false if input is an object not containing an array', () => {
        const key = "key";
        let userConfig = { key: 'value' };
        expect(checkArray({ userConfig, key })).toBe(false);
        userConfig = { key: { subKey: 'value' } };
        expect(checkArray({ userConfig, key })).toBe(false);
        userConfig = { key: {} };
        expect(checkArray({ userConfig, key })).toBe(false);
        userConfig = { key: 1 };
        expect(checkArray({ userConfig, key })).toBe(false);
    });
})

describe('treeShake', () => {
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

        expect(treeShake({ defaultConfig, userConfig: userConfig0 })).toStrictEqual({
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

        expect(treeShake({ defaultConfig, userConfig: userConfig1 })).toStrictEqual({
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

        expect(treeShake({ defaultConfig, userConfig: userConfig2 })).toStrictEqual({
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

        expect(treeShake({ defaultConfig, userConfig: userConfig3 })).toStrictEqual({
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
})

describe('convertColorToHex', () => {
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
    });

    test('returns HEX color from an HSL passed through hslToRgb', () => {
        const rgb = hslToRgb(50, 50, 50);
        expect(convertColorToHex(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`)).toBe('#bfaa40')
    })
})

describe('shiftHue', () => {
    test('takes a HEX color and returns a shifted HEX color', () => {
        expect(shiftHue('#6376DD', 0.1)).toBe('#9963dd')
        expect(shiftHue('#9963dd', 0.1)).toBe('#dd63d8')
        expect(shiftHue('#dd63d8', 0.1)).toBe('#dd638f')
        expect(shiftHue('#dd638f', 0.1)).toBe('#dd8063')
        expect(shiftHue('#dd8063', 0.1)).toBe('#ddc963')
        expect(shiftHue('#ddc963', 0.1)).toBe('#a8dd63')
        expect(shiftHue('#a8dd63', 0.1)).toBe('#63dd67')
        expect(shiftHue('#63dd67', 0.1)).toBe('#63ddb0')
        expect(shiftHue('#63ddb0', 0.1)).toBe('#63c1dd')
        expect(shiftHue('#63c1dd', 0.1)).toBe('#6378dd')
    })
})

describe('hslToRgb', () => {
    test('converts hsl to RGB', () => {
        expect(hslToRgb(50, 50, 50)).toStrictEqual([191, 170, 64])
    })
})

describe('sumByAttribute', () => {
    test('sums a specific attribute in an array of objects', () => {
        const arr = [
            {
                attr1: 1,
                attr2: 2
            },
            {
                attr1: 1,
                attr2: 2
            },
            {
                attr1: 1,
                attr2: 2
            }
        ]
        expect(sumByAttribute(arr, 'attr1')).toBe(3)
        expect(sumByAttribute(arr, 'attr2')).toBe(6)
    })
})

describe('closestDecimal', () => {
    test('returns the closest decimal of a number', () => {
        expect(closestDecimal(12)).toBe(10)
        expect(closestDecimal(15)).toBe(20)
        expect(closestDecimal(19)).toBe(20)
        expect(closestDecimal(21)).toBe(20)
        expect(closestDecimal(99)).toBe(100)
        expect(closestDecimal(150)).toBe(200)
        expect(closestDecimal(1500)).toBe(2000);

    })
    test('returns the same number from 0 to 10', () => {
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((num) => {
            expect(closestDecimal(num)).toBe(num)
        })
    })
})

describe('makeDonut', () => {
    test('it creates a donut object', () => {
        const item = {
            base: 100,
            series: [
                { value: 1 },
                { value: 2 },
                { value: 3 },
            ]
        }
        const cx = 100;
        const cy = 100;
        const rx = 10;
        const ry = 10;

        const donut = makeDonut(item, cx, cy, rx, ry);

        expect(donut).toStrictEqual([
            {
                cx: 100,
                cy: 100,
                value: 1,
                proportion: 0.16666666666666666,
                ratio: 1.047145191319038,
                path: 'M90.00979186685352 99.55757321914929 A 10 10 6302.5357464390545 0 1 95.38758418274517 91.12725407054064',
                startX: 90.00979186685352,
                startY: 99.55757321914929,
                endX: 95.38758418274517,
                endY: 91.12725407054064,
                center: {
                    startX: 85.5141982069376,
                    startY: 99.35848116776647,
                    endX: 87.77568706913856,
                    endY: 92.20152749774844,
                    path: 'M85.5141982069376 99.35848116776647 A 14.5 14.5 6302.5357464390545 0 1 87.77568706913856 92.20152749774844'
                }
            },
            {
                cx: 100,
                cy: 100,
                value: 2,
                proportion: 0.3333333333333333,
                ratio: 2.094290382638076,
                path: 'M95.38758418274517 91.12725407054064 A 10 10 6302.5357464390545 0 1 109.99027750613317 100.44085751717499',
                startX: 95.38758418274517,
                startY: 91.12725407054064,
                endX: 109.99027750613317,
                endY: 100.44085751717499,
                center: {
                    startX: 93.3119970649805,
                    startY: 87.13451840228394,
                    endX: 107.79783242803356,
                    endY: 87.7752787588302,
                    path: 'M93.3119970649805 87.13451840228394 A 14.5 14.5 6302.5357464390545 0 1 107.79783242803356 87.7752787588302'
                }
            },
            {
                cx: 100,
                cy: 100,
                value: 3,
                proportion: 0.5,
                ratio: 3.141435573957114,
                path: 'M109.99027750613317 100.44085751717499 A 10 10 6302.5357464390545 0 1 90.00965336738037 99.56071175737844',
                startX: 109.99027750613317,
                startY: 100.44085751717499,
                endX: 90.00965336738037,
                endY: 99.56071175737844,
                center: {
                    startX: 114.48590238389309,
                    startY: 100.63924339990375,
                    endX: 99.36075660009625,
                    endY: 114.48590238389309,
                    path: 'M114.48590238389309 100.63924339990375 A 14.5 14.5 6302.5357464390545 0 1 99.36075660009625 114.48590238389309'
                }
            }
        ])
    })
})

describe("createArc", () => {
    test('creates an arc object', () => {
        const arc = createArc(
            [100, 100],
            [100, 100],
            [0, 1],
            100
        );

        expect(arc).toStrictEqual({
            startX: 186.2318872287684,
            startY: 49.36343588902412,
            endX: 189.200486978816,
            endY: 145.20257871783505,
            path: 'M186.2318872287684 49.36343588902412 A 100 100 5729.577951308232 0 1 189.200486978816 145.20257871783505'
        })
    })
})

describe('addVector', () => {
    test('adds two vectors', () => {
        const vector1 = [1, 2];
        const vector2 = [3, 4];
        const fusedVector = addVector(vector1, vector2);
        expect(fusedVector).toStrictEqual([4, 6])
    })
})

describe('matrixTimes', () => {
    test('factors a matrix', () => {
        const vector1 = [2, 2];
        const vector2 = [3, 3];
        const coordinates = [5, 5];
        const factorizedMatrix = matrixTimes([vector1, vector2], coordinates);
        expect(factorizedMatrix).toStrictEqual([20, 30])
    })
})

describe('rotateMatrix', () => {
    test('rotates a matrix from a number', () => {
        expect(rotateMatrix(1)).toStrictEqual([
            [0.5403023058681398, -0.8414709848078965],
            [0.8414709848078965, 0.5403023058681398]
        ])
    })
})

describe('calcPolygonPoints', () => {
    test('creates a triangle object with usable svg path & coordinates', () => {
        const triangle = {
            centerX: 100,
            centerY: 100,
            outerPoints: 1.5,
            radius: 30,
            rotation: 0
        }

        expect(calcPolygonPoints({ ...triangle }).coordinates.length).toBe(triangle.outerPoints * 2)
        expect(calcPolygonPoints({ ...triangle })).toStrictEqual({
            path: 'M130,100 85,125.98076211353316 84.99999999999999,74.01923788646684 Z',
            coordinates: [
                { x: 130, y: 100 },
                { x: 85, y: 125.98076211353316 },
                { x: 84.99999999999999, y: 74.01923788646684 }
            ]
        })
    })
    test('creates a rectangle object with usable svg path & coordinates', () => {
        const rect = {
            centerX: 100,
            centerY: 100,
            outerPoints: 2,
            radius: 30,
            rotation: 0
        }

        expect(calcPolygonPoints({ ...rect }).coordinates.length).toBe(rect.outerPoints * 2)
        expect(calcPolygonPoints({ ...rect })).toStrictEqual({
            path: 'M130,100 100,130 70,100 100,70 Z',
            coordinates: [
                { x: 130, y: 100 },
                { x: 100, y: 130 },
                { x: 70, y: 100 },
                { x: 100, y: 70 }
            ]
        })
    })
})

describe('createPolygonPath', () => {
    test('creates a polygon path object from plot coordinates', () => {
        const obj = {
            plot: { x: 100, y: 100 },
            radius: 30,
            sides: 3,
            rotation: 0
        }

        expect(createPolygonPath({ ...obj }).coordinates.length).toBe(obj.sides)
        expect(createPolygonPath({ ...obj })).toStrictEqual({
            path: 'M131,100 84.5,126.84678751731761 84.49999999999999,73.1532124826824 Z',
            coordinates: [
                { x: 131, y: 100 },
                { x: 84.5, y: 126.84678751731761 },
                { x: 84.49999999999999, y: 73.1532124826824 }
            ]
        })
    })
})

describe('calcStarPoints', () => {
    test('creates star points with a trailing blank space ready to be passed to a polygon svg object', () => {
        const star = {
            centerX: 100,
            centerY: 100,
            innerCirclePoints: 5,
            innerRadius: (30 * 3.5) / 5,
            outerRadius: ((30 * 3.5) / 5) * 2
        }

        expect(calcStarPoints({...star})).toEqual('59.99865482256344,87.1979539137069 87.58154292114362,83.06536319312983 99.81437389459367,58.00041020499139 112.26828240498303,82.9562549059315 139.88662193509617,86.84487207942455 120.00067258871826,106.40102304314662 124.83691415771287,133.86927361374026 100.09281305270324,120.9997948975043 75.46343519003383,134.0874901881369 80.05668903245189,106.57756396028766 ')
    })
})

describe('createStar', () => {
    test('also creates star points with a trailing blank space ready to be passed to a polygon svg object', () => {
        const star = {
            plot: { x: 100, y: 100},
            radius: 30
        }
        expect(createStar({...star})).toEqual('59.99865482256344,87.1979539137069 87.58154292114362,83.06536319312983 99.81437389459367,58.00041020499139 112.26828240498303,82.9562549059315 139.88662193509617,86.84487207942455 120.00067258871826,106.40102304314662 124.83691415771287,133.86927361374026 100.09281305270324,120.9997948975043 75.46343519003383,134.0874901881369 80.05668903245189,106.57756396028766 ')
    })
})
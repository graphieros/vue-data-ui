import { expect, test, describe } from "vitest";
import { useNestedProp } from "../src/useNestedProp";

describe('useNestedProp', () => {
    test('returns reconcilied config object with converted colors', () => {
        const defaultConfig = {
            attr1: {
                color: "#FFFFFF",
                value: 12,
                someDefaultObject: {
                    defaultAttr: 'default'
                }
            },
            attr2: {
                color: '#000000'
            }
        }

        const userConfig = {
            attr1: {
                color: "rgb(0,0,0)",
                value: 1
            },
            attr2: {
                color: 'red'
            }
        }

        expect(useNestedProp({ defaultConfig, userConfig })).toStrictEqual({
            attr1: {
                color: "#000000ff",
                value: 1,
                someDefaultObject: {
                    defaultAttr: "default"
                },
            },
            attr2: {
                color: "#FF0000ff"
            }
        })
    })
})
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
            }
        }

        const userConfig = {
            attr1: {
                color: "rgb(0,0,0)",
                value: 1
            }
        }

        expect(useNestedProp({ defaultConfig, userConfig })).toStrictEqual({
            attr1: {
                color: "#000000",
                value: 1,
                someDefaultObject: {
                    defaultAttr: "default"
                }
            }
        })
    })
})
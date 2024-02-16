import { expect, test, describe } from "vitest";
import sut from '../src/default_configs.json'
import getVueDataUiConfig from "../src/getVueDataUiConfig";

describe('getVueDataUiConfig', () => {

    test('returns specific config object', () => {
        const xy = 'vue_ui_xy';
        const donut = 'vue_ui_donut'
    
        expect(getVueDataUiConfig(xy)).toStrictEqual(sut[xy])

        expect(getVueDataUiConfig(donut)).toStrictEqual(sut[donut])

    })
})
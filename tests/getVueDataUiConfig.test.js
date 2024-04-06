import { expect, test, describe } from "vitest";
import sut from '../src/default_configs.json'
import getVueDataUiConfig from "../src/getVueDataUiConfig";

describe('getVueDataUiConfig', () => {

    const components = [
        '3d_bar',
        'age_pyramid',
        'annotator',
        'candlestick',
        'chestnut',
        'dashboard',
        'digits',
        'donut',
        'donut',
        'donut_evolution',
        'galaxy',
        'gauge',
        "heatmap",
        'kpi',
        'mini_loader',
        'molecule',
        'mood_radar',
        'nested_donuts',
        'onion',
        'quadrant',
        'radar',
        'rating',
        'relation_circle',
        'rings',
        'scatter',
        'screenshot',
        'skeleton',
        'smiley',
        'sparkbar',
        'sparkgauge',
        'sparkhistogram',
        'sparkline',
        'sparkstackbar',
        'table',
        'table_sparkline',
        'thermometer',
        'tiremarks',
        'vertical_bar',
        'waffle',
        'wheel',
        'xy'
    ]

    components.forEach(component => {
        test(`returns vue_ui_${component} config`, () => {
            expect(getVueDataUiConfig(`vue_ui_${component}`)).not.toBeUndefined();
            expect(getVueDataUiConfig(`vue_ui_${component}`)).toStrictEqual(sut[`vue_ui_${component}`]);
        })
    })
})
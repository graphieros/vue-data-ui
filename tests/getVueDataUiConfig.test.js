import { expect, test, describe } from "vitest";
import sut from '../src/default_configs.json'
import getVueDataUiConfig from "../src/getVueDataUiConfig";

describe('getVueDataUiConfig', () => {

    const components = [
        "heatmap",
        '3d_bar',
        'accordion',
        'age_pyramid',
        'annotator',
        'candlestick',
        'chestnut',
        'cursor',
        'dashboard',
        'digits',
        'donut',
        'donut_evolution',
        'galaxy',
        'gauge',
        'kpi',
        'mini_loader',
        'molecule',
        'mood_radar',
        'nested_donuts',
        'onion',
        'quadrant',
        'quick_chart',
        'radar',
        'rating',
        'relation_circle',
        'rings',
        'scatter',
        'screenshot',
        'skeleton',
        'smiley',
        'spark_trend',
        'sparkbar',
        'sparkgauge',
        'sparkhistogram',
        'sparkline',
        'sparkstackbar',
        'table',
        'table_heatmap',
        'table_sparkline',
        'thermometer',
        'tiremarks',
        'vertical_bar',
        'waffle',
        'wheel',
        'xy',
    ]

    components.forEach(component => {
        test(`returns vue_ui_${component} config`, () => {
            expect(getVueDataUiConfig(`vue_ui_${component}`)).not.toBeUndefined();
            expect(getVueDataUiConfig(`vue_ui_${component}`)).toStrictEqual(sut[`vue_ui_${component}`]);
        })
    })
})
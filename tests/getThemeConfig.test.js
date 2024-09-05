import { expect, test, describe } from "vitest";
import sut from '../src/themes.json'
import getThemeConfig from "../src/getThemeConfig";

const components = [
    '3d_bar',
    'age_pyramid',
    'candlestick',
    'chestnut',
    'donut',
    'donut_evolution',
    'dumbbell',
    'galaxy',
    'gauge',
    'heatmap',
    'molecule',
    'mood_radar',
    'nested_donuts',
    'onion',
    'parallel_coordinate_plot',
    'quadrant',
    'quick_chart',
    'radar',
    'relation_circle',
    'rings',
    'scatter',
    'spark_trend',
    'sparkbar',
    'sparkgauge',
    'sparkhistogram',
    'sparkline',
    'sparkstackbar',
    'strip_plot',
    'table_heatmap',
    'table_sparkline',
    'thermometer',
    'tiremarks',
    'treemap',
    'vertical_bar',
    'waffle',
    'wheel',
    'xy',
    'xy_canvas'
]

const themes = [
    "default",
    "zen",
    "hack",
    "concrete"
]

describe('getThemeConfig', () => {
    components.forEach(component => {
        themes.forEach(theme => {
            test(`returns vue_ui_${component} ${theme} theme`, () => {
                expect(getThemeConfig(`vue_ui_${component}`)[theme]).not.toBeUndefined()
                expect(getThemeConfig(`vue_ui_${component}`)[theme]).toStrictEqual(sut[`vue_ui_${component}`][theme])
            })
        })
    })
})
import { expect, test, describe } from "vitest";
import sut from '../src/themes.json'
import getThemeConfig from "../src/getThemeConfig";

const components = [
    'xy',
    'donut',
    'treemap',
    'waffle',
    'radar',
    'quadrant',
    'gauge',
    'wheel',
    'tiremarks',
    'chestnut',
    'onion',
    'vertical_bar',
    'heatmap',
    'scatter',
    'candlestick',
    'age_pyramid',
    'relation_circle',
    'thermometer',
    'rings',
    'donut_evolution',
    'mood_radar',
    'molecule',
    'nested_donuts',
    'galaxy',
    'strip_plot',
    'dumbbell',
    '3d_bar',
    'sparkline',
    'sparkbar',
    'sparkstackbar',
    'sparkhistogram',
    'sparkgauge',
    'spark_trend',
    'quick_chart',
    'table_sparkline',
    'table_heatmap',
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
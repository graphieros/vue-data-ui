import { applyDataCorrection } from '../data-correction';

import getVueDataUiConfig from '../getVueDataUiConfig';

import getThemeConfig from '../getThemeConfig';
import {
    abbreviate,
    adaptColorToBackground,
    createColorWheel,
    createSmoothPath,
    createStraightPath,
    createTSpans,
    createWordCloudDatasetFromPlainText,
    formatSmallValue,
    getCumulativeAverage,
    getCumulativeMedian,
    getPalette,
} from '../lib';

import {
    average,
    darkenColor,
    lightenColor,
    median,
    mergeConfigs,
    shiftColorHue,
} from '../exposedLib';

import { createPatternDef } from '../patternUtils';

import { useObjectBindings } from '../useObjectBindings';

export { applyDataCorrection };
export { getVueDataUiConfig };
export { getThemeConfig };

export {
    abbreviate,
    createColorWheel,
    createSmoothPath,
    createStraightPath,
    createTSpans,
    createWordCloudDatasetFromPlainText,
    formatSmallValue,
    getCumulativeAverage,
    getCumulativeMedian,
    getPalette,
    adaptColorToBackground,
};

export {
    average,
    lightenColor,
    darkenColor,
    shiftColorHue,
    mergeConfigs,
    median,
};

export { useObjectBindings };

export { createPatternDef };

const vueDataUiUtilities = {
    applyDataCorrection,
    getVueDataUiConfig,
    getThemeConfig,
    abbreviate,
    createPatternDef,
    createSmoothPath,
    createStraightPath,
    createTSpans,
    createWordCloudDatasetFromPlainText,
    formatSmallValue,
    getCumulativeAverage,
    getCumulativeMedian,
    getPalette,
    lightenColor,
    darkenColor,
    shiftColorHue,
    mergeConfigs,
    useObjectBindings,
    adaptColorToBackground,
    average,
    median,
};

export default vueDataUiUtilities;

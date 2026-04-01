import { applyDataCorrection } from '../data-correction';

import getVueDataUiConfig from '../getVueDataUiConfig';

import getThemeConfig from '../getThemeConfig';
import {
    abbreviate,
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
    lightenColor,
    darkenColor,
    shiftColorHue,
    mergeConfigs,
} from '../exposedLib';

import { createPatternDef } from '../patternUtils';

import { useObjectBindings } from '../useObjectBindings';

export { applyDataCorrection };
export { getVueDataUiConfig };
export { getThemeConfig };

export {
    abbreviate,
    createSmoothPath,
    createStraightPath,
    createTSpans,
    createWordCloudDatasetFromPlainText,
    formatSmallValue,
    getCumulativeAverage,
    getCumulativeMedian,
    getPalette,
};

export { lightenColor, darkenColor, shiftColorHue, mergeConfigs };

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
};

export default vueDataUiUtilities;

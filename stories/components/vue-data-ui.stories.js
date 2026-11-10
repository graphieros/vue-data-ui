import { catalogArgs } from '../support/catalog.js';
import VueDataUi from '../../src/components/vue-data-ui.vue';
import { components } from '../fixtures/components.js';
import { expect } from 'storybook/test';
import { expectWrappedChart } from '../support/wrappedChart.js';
export default {
    title: 'Utilities/VueDataUi',
    component: VueDataUi,
};
export const InvalidComponent = {
    args: {
        component: 'InvalidComponent',
    },
    play: async ({ canvas }) => {
        await expect(
            canvas.getByText(
                'The provided component InvalidComponent does not exist.',
            ),
        ).toBeVisible();
    },
};
export const VueUiHill = {
    args: {
        component: 'VueUiHill',
        dataset: catalogArgs(components[0].dataset),
        config: catalogArgs(components[0].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[0]);
    },
};
export const VueUiBump = {
    args: {
        component: 'VueUiBump',
        dataset: catalogArgs(components[1].dataset),
        config: catalogArgs(components[1].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[1]);
    },
};
export const VueUiGeo = {
    args: {
        component: 'VueUiGeo',
        dataset: catalogArgs(components[2].dataset),
        config: catalogArgs(components[2].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[2]);
    },
};
export const VueUiDag = {
    args: {
        component: 'VueUiDag',
        dataset: catalogArgs(components[3].dataset),
        config: catalogArgs(components[3].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[3]);
    },
};
export const VueUiChord = {
    args: {
        component: 'VueUiChord',
        dataset: catalogArgs(components[4].dataset),
        config: catalogArgs(components[4].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[4]);
    },
};
export const VueUiRidgeline = {
    args: {
        component: 'VueUiRidgeline',
        dataset: catalogArgs(components[5].dataset),
        config: catalogArgs(components[5].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[5]);
    },
};
export const VueUiWorld = {
    args: {
        component: 'VueUiWorld',
        dataset: catalogArgs(components[6].dataset),
        config: catalogArgs(components[6].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[6]);
    },
};
export const VueUi3dBar = {
    args: {
        component: 'VueUi3dBar',
        dataset: catalogArgs(components[7].dataset),
        config: catalogArgs(components[7].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[7]);
    },
};
export const VueUiAgePyramid = {
    args: {
        component: 'VueUiAgePyramid',
        dataset: catalogArgs(components[8].dataset),
        config: catalogArgs(components[8].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[8]);
    },
};
export const VueUiAnnotator = {
    args: {
        component: 'VueUiAnnotator',
        dataset: catalogArgs(components[9].dataset),
        config: catalogArgs(components[9].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[9]);
    },
};
export const VueUiCandlestick = {
    args: {
        component: 'VueUiCandlestick',
        dataset: catalogArgs(components[10].dataset),
        config: catalogArgs(components[10].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[10]);
    },
};
export const VueUiChestnut = {
    args: {
        component: 'VueUiChestnut',
        dataset: catalogArgs(components[11].dataset),
        config: catalogArgs(components[11].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[11]);
    },
};
export const VueUiDashboard = {
    args: {
        component: 'VueUiDashboard',
        dataset: catalogArgs(components[12].dataset),
        config: catalogArgs(components[12].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[12]);
    },
};
export const VueUiDigits = {
    args: {
        component: 'VueUiDigits',
        dataset: catalogArgs(components[13].dataset),
        config: catalogArgs(components[13].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[13]);
    },
};
export const VueUiDonut = {
    args: {
        component: 'VueUiDonut',
        dataset: catalogArgs(components[14].dataset),
        config: catalogArgs(components[14].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[14]);
    },
};
export const VueUiDonutEvolution = {
    args: {
        component: 'VueUiDonutEvolution',
        dataset: catalogArgs(components[15].dataset),
        config: catalogArgs(components[15].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[15]);
    },
};
export const VueUiGalaxy = {
    args: {
        component: 'VueUiGalaxy',
        dataset: catalogArgs(components[16].dataset),
        config: catalogArgs(components[16].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[16]);
    },
};
export const VueUiGauge = {
    args: {
        component: 'VueUiGauge',
        dataset: catalogArgs(components[17].dataset),
        config: catalogArgs(components[17].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[17]);
    },
};
export const VueUiHeatmap = {
    args: {
        component: 'VueUiHeatmap',
        dataset: catalogArgs(components[18].dataset),
        config: catalogArgs(components[18].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[18]);
    },
};
export const VueUiKpi = {
    args: {
        component: 'VueUiKpi',
        dataset: catalogArgs(components[19].dataset),
        config: catalogArgs(components[19].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[19]);
    },
};
export const VueUiMiniLoader = {
    args: {
        component: 'VueUiMiniLoader',
        dataset: catalogArgs(components[20].dataset),
        config: catalogArgs(components[20].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[20]);
    },
};
export const VueUiMolecule = {
    args: {
        component: 'VueUiMolecule',
        dataset: catalogArgs(components[21].dataset),
        config: catalogArgs(components[21].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[21]);
    },
};
export const VueUiMoodRadar = {
    args: {
        component: 'VueUiMoodRadar',
        dataset: catalogArgs(components[22].dataset),
        config: catalogArgs(components[22].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[22]);
    },
};
export const VueUiNestedDonuts = {
    args: {
        component: 'VueUiNestedDonuts',
        dataset: catalogArgs(components[23].dataset),
        config: catalogArgs(components[23].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[23]);
    },
};
export const VueUiOnion = {
    args: {
        component: 'VueUiOnion',
        dataset: catalogArgs(components[24].dataset),
        config: catalogArgs(components[24].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[24]);
    },
};
export const VueUiQuadrant = {
    args: {
        component: 'VueUiQuadrant',
        dataset: catalogArgs(components[25].dataset),
        config: catalogArgs(components[25].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[25]);
    },
};
export const VueUiRadar = {
    args: {
        component: 'VueUiRadar',
        dataset: catalogArgs(components[26].dataset),
        config: catalogArgs(components[26].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[26]);
    },
};
export const VueUiRating = {
    args: {
        component: 'VueUiRating',
        dataset: catalogArgs(components[27].dataset),
        config: catalogArgs(components[27].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[27]);
    },
};
export const VueUiRelationCircle = {
    args: {
        component: 'VueUiRelationCircle',
        dataset: catalogArgs(components[28].dataset),
        config: catalogArgs(components[28].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[28]);
    },
};
export const VueUiRings = {
    args: {
        component: 'VueUiRings',
        dataset: catalogArgs(components[29].dataset),
        config: catalogArgs(components[29].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[29]);
    },
};
export const VueUiScatter = {
    args: {
        component: 'VueUiScatter',
        dataset: catalogArgs(components[30].dataset),
        config: catalogArgs(components[30].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[30]);
    },
};
export const VueUiSkeleton = {
    args: {
        component: 'VueUiSkeleton',
        dataset: catalogArgs(components[31].dataset),
        config: catalogArgs(components[31].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[31]);
    },
};
export const VueUiSmiley = {
    args: {
        component: 'VueUiSmiley',
        dataset: catalogArgs(components[32].dataset),
        config: catalogArgs(components[32].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[32]);
    },
};
export const VueUiSparkbar = {
    args: {
        component: 'VueUiSparkbar',
        dataset: catalogArgs(components[33].dataset),
        config: catalogArgs(components[33].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[33]);
    },
};
export const VueUiSparkgauge = {
    args: {
        component: 'VueUiSparkgauge',
        dataset: catalogArgs(components[34].dataset),
        config: catalogArgs(components[34].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[34]);
    },
};
export const VueUiSparkHistogram = {
    args: {
        component: 'VueUiSparkHistogram',
        dataset: catalogArgs(components[35].dataset),
        config: catalogArgs(components[35].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[35]);
    },
};
export const VueUiSparkline = {
    args: {
        component: 'VueUiSparkline',
        dataset: catalogArgs(components[36].dataset),
        config: catalogArgs(components[36].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[36]);
    },
};
export const VueUiSparkStackbar = {
    args: {
        component: 'VueUiSparkStackbar',
        dataset: catalogArgs(components[37].dataset),
        config: catalogArgs(components[37].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[37]);
    },
};
export const VueUiTable = {
    args: {
        component: 'VueUiTable',
        dataset: catalogArgs(components[38].dataset),
        config: catalogArgs(components[38].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[38]);
    },
};
export const VueUiTableSparkline = {
    args: {
        component: 'VueUiTableSparkline',
        dataset: catalogArgs(components[39].dataset),
        config: catalogArgs(components[39].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[39]);
    },
};
export const VueUiThermometer = {
    args: {
        component: 'VueUiThermometer',
        dataset: catalogArgs(components[40].dataset),
        config: catalogArgs(components[40].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[40]);
    },
};
export const VueUiTiremarks = {
    args: {
        component: 'VueUiTiremarks',
        dataset: catalogArgs(components[41].dataset),
        config: catalogArgs(components[41].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[41]);
    },
};
export const VueUiTreemap = {
    args: {
        component: 'VueUiTreemap',
        dataset: catalogArgs(components[42].dataset),
        config: catalogArgs(components[42].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[42]);
    },
};
export const VueUiHorizontalBar = {
    args: {
        component: 'VueUiHorizontalBar',
        dataset: catalogArgs(components[43].dataset),
        config: catalogArgs(components[43].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[43]);
    },
};
export const VueUiWaffle = {
    args: {
        component: 'VueUiWaffle',
        dataset: catalogArgs(components[44].dataset),
        config: catalogArgs(components[44].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[44]);
    },
};
export const VueUiWheel = {
    args: {
        component: 'VueUiWheel',
        dataset: catalogArgs(components[45].dataset),
        config: catalogArgs(components[45].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[45]);
    },
};
export const VueUiXy = {
    args: {
        component: 'VueUiXy',
        dataset: catalogArgs(components[46].dataset),
        config: catalogArgs(components[46].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[46]);
    },
};
export const VueUiQuickChart = {
    args: {
        component: 'VueUiQuickChart',
        dataset: catalogArgs(components[47].dataset),
        config: catalogArgs(components[47].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[47]);
    },
};
export const VueUiSparkTrend = {
    args: {
        component: 'VueUiSparkTrend',
        dataset: catalogArgs(components[48].dataset),
        config: catalogArgs(components[48].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[48]);
    },
};
export const VueUiStripPlot = {
    args: {
        component: 'VueUiStripPlot',
        dataset: catalogArgs(components[49].dataset),
        config: catalogArgs(components[49].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[49]);
    },
};
export const VueUiDumbbell = {
    args: {
        component: 'VueUiDumbbell',
        dataset: catalogArgs(components[50].dataset),
        config: catalogArgs(components[50].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[50]);
    },
};
export const VueUiWordCloud = {
    args: {
        component: 'VueUiWordCloud',
        dataset: catalogArgs(components[51].dataset),
        config: catalogArgs(components[51].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[51]);
    },
};
export const VueUiXyCanvas = {
    args: {
        component: 'VueUiXyCanvas',
        dataset: catalogArgs(components[52].dataset),
        config: catalogArgs(components[52].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[52]);
    },
};
export const VueUiFlow = {
    args: {
        component: 'VueUiFlow',
        dataset: catalogArgs(components[53].dataset),
        config: catalogArgs(components[53].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[53]);
    },
};
export const VueUiParallelCoordinatePlot = {
    args: {
        component: 'VueUiParallelCoordinatePlot',
        dataset: catalogArgs(components[54].dataset),
        config: catalogArgs(components[54].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[54]);
    },
};
export const VueUiTimer = {
    args: {
        component: 'VueUiTimer',
        dataset: catalogArgs(components[55].dataset),
        config: catalogArgs(components[55].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[55]);
    },
};
export const VueUiCarouselTable = {
    args: {
        component: 'VueUiCarouselTable',
        dataset: catalogArgs(components[56].dataset),
        config: catalogArgs(components[56].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[56]);
    },
};
export const VueUiGizmo = {
    args: {
        component: 'VueUiGizmo',
        dataset: catalogArgs(components[57].dataset),
        config: catalogArgs(components[57].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[57]);
    },
};
export const VueUiStackbar = {
    args: {
        component: 'VueUiStackbar',
        dataset: catalogArgs(components[58].dataset),
        config: catalogArgs(components[58].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[58]);
    },
};
export const VueUiStackline = {
    args: {
        component: 'VueUiStackline',
        dataset: catalogArgs(components[59].dataset),
        config: catalogArgs(components[59].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[59]);
    },
};
export const VueUiBullet = {
    args: {
        component: 'VueUiBullet',
        dataset: catalogArgs(components[60].dataset),
        config: catalogArgs(components[60].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[60]);
    },
};
export const VueUiFunnel = {
    args: {
        component: 'VueUiFunnel',
        dataset: catalogArgs(components[61].dataset),
        config: catalogArgs(components[61].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[61]);
    },
};
export const VueUiHistoryPlot = {
    args: {
        component: 'VueUiHistoryPlot',
        dataset: catalogArgs(components[62].dataset),
        config: catalogArgs(components[62].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[62]);
    },
};
export const VueUiCirclePack = {
    args: {
        component: 'VueUiCirclePack',
        dataset: catalogArgs(components[63].dataset),
        config: catalogArgs(components[63].config || {}),
    },
    play: async ({ canvasElement }) => {
        await expectWrappedChart(canvasElement, components[63]);
    },
};

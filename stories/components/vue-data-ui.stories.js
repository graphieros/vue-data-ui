import { catalogArgs } from '../support/catalog.js';
import VueDataUi from '../../src/components/vue-data-ui.vue';
import { components } from '../fixtures/components.js';
import { expect, waitFor } from 'storybook/test';
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
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[0].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiBump = {
    args: {
        component: 'VueUiBump',
        dataset: catalogArgs(components[1].dataset),
        config: catalogArgs(components[1].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[1].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiGeo = {
    args: {
        component: 'VueUiGeo',
        dataset: catalogArgs(components[2].dataset),
        config: catalogArgs(components[2].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[2].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiDag = {
    args: {
        component: 'VueUiDag',
        dataset: catalogArgs(components[3].dataset),
        config: catalogArgs(components[3].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[3].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiChord = {
    args: {
        component: 'VueUiChord',
        dataset: catalogArgs(components[4].dataset),
        config: catalogArgs(components[4].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[4].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiRidgeline = {
    args: {
        component: 'VueUiRidgeline',
        dataset: catalogArgs(components[5].dataset),
        config: catalogArgs(components[5].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[5].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiWorld = {
    args: {
        component: 'VueUiWorld',
        dataset: catalogArgs(components[6].dataset),
        config: catalogArgs(components[6].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[6].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUi3dBar = {
    args: {
        component: 'VueUi3dBar',
        dataset: catalogArgs(components[7].dataset),
        config: catalogArgs(components[7].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[7].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiAgePyramid = {
    args: {
        component: 'VueUiAgePyramid',
        dataset: catalogArgs(components[8].dataset),
        config: catalogArgs(components[8].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[8].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiAnnotator = {
    args: {
        component: 'VueUiAnnotator',
        dataset: catalogArgs(components[9].dataset),
        config: catalogArgs(components[9].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[9].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiCandlestick = {
    args: {
        component: 'VueUiCandlestick',
        dataset: catalogArgs(components[10].dataset),
        config: catalogArgs(components[10].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[10].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiChestnut = {
    args: {
        component: 'VueUiChestnut',
        dataset: catalogArgs(components[11].dataset),
        config: catalogArgs(components[11].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[11].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiDashboard = {
    args: {
        component: 'VueUiDashboard',
        dataset: catalogArgs(components[12].dataset),
        config: catalogArgs(components[12].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[12].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiDigits = {
    args: {
        component: 'VueUiDigits',
        dataset: catalogArgs(components[13].dataset),
        config: catalogArgs(components[13].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[13].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiDonut = {
    args: {
        component: 'VueUiDonut',
        dataset: catalogArgs(components[14].dataset),
        config: catalogArgs(components[14].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[14].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiDonutEvolution = {
    args: {
        component: 'VueUiDonutEvolution',
        dataset: catalogArgs(components[15].dataset),
        config: catalogArgs(components[15].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[15].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiGalaxy = {
    args: {
        component: 'VueUiGalaxy',
        dataset: catalogArgs(components[16].dataset),
        config: catalogArgs(components[16].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[16].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiGauge = {
    args: {
        component: 'VueUiGauge',
        dataset: catalogArgs(components[17].dataset),
        config: catalogArgs(components[17].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[17].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiHeatmap = {
    args: {
        component: 'VueUiHeatmap',
        dataset: catalogArgs(components[18].dataset),
        config: catalogArgs(components[18].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[18].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiKpi = {
    args: {
        component: 'VueUiKpi',
        dataset: catalogArgs(components[19].dataset),
        config: catalogArgs(components[19].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[19].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiMiniLoader = {
    args: {
        component: 'VueUiMiniLoader',
        dataset: catalogArgs(components[20].dataset),
        config: catalogArgs(components[20].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[20].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiMolecule = {
    args: {
        component: 'VueUiMolecule',
        dataset: catalogArgs(components[21].dataset),
        config: catalogArgs(components[21].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[21].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiMoodRadar = {
    args: {
        component: 'VueUiMoodRadar',
        dataset: catalogArgs(components[22].dataset),
        config: catalogArgs(components[22].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[22].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiNestedDonuts = {
    args: {
        component: 'VueUiNestedDonuts',
        dataset: catalogArgs(components[23].dataset),
        config: catalogArgs(components[23].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[23].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiOnion = {
    args: {
        component: 'VueUiOnion',
        dataset: catalogArgs(components[24].dataset),
        config: catalogArgs(components[24].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[24].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiQuadrant = {
    args: {
        component: 'VueUiQuadrant',
        dataset: catalogArgs(components[25].dataset),
        config: catalogArgs(components[25].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[25].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiRadar = {
    args: {
        component: 'VueUiRadar',
        dataset: catalogArgs(components[26].dataset),
        config: catalogArgs(components[26].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[26].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiRating = {
    args: {
        component: 'VueUiRating',
        dataset: catalogArgs(components[27].dataset),
        config: catalogArgs(components[27].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[27].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiRelationCircle = {
    args: {
        component: 'VueUiRelationCircle',
        dataset: catalogArgs(components[28].dataset),
        config: catalogArgs(components[28].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[28].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiRings = {
    args: {
        component: 'VueUiRings',
        dataset: catalogArgs(components[29].dataset),
        config: catalogArgs(components[29].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[29].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiScatter = {
    args: {
        component: 'VueUiScatter',
        dataset: catalogArgs(components[30].dataset),
        config: catalogArgs(components[30].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[30].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiSkeleton = {
    args: {
        component: 'VueUiSkeleton',
        dataset: catalogArgs(components[31].dataset),
        config: catalogArgs(components[31].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[31].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiSmiley = {
    args: {
        component: 'VueUiSmiley',
        dataset: catalogArgs(components[32].dataset),
        config: catalogArgs(components[32].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[32].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiSparkbar = {
    args: {
        component: 'VueUiSparkbar',
        dataset: catalogArgs(components[33].dataset),
        config: catalogArgs(components[33].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[33].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiSparkgauge = {
    args: {
        component: 'VueUiSparkgauge',
        dataset: catalogArgs(components[34].dataset),
        config: catalogArgs(components[34].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[34].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiSparkHistogram = {
    args: {
        component: 'VueUiSparkHistogram',
        dataset: catalogArgs(components[35].dataset),
        config: catalogArgs(components[35].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[35].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiSparkline = {
    args: {
        component: 'VueUiSparkline',
        dataset: catalogArgs(components[36].dataset),
        config: catalogArgs(components[36].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[36].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiSparkStackbar = {
    args: {
        component: 'VueUiSparkStackbar',
        dataset: catalogArgs(components[37].dataset),
        config: catalogArgs(components[37].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[37].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiTable = {
    args: {
        component: 'VueUiTable',
        dataset: catalogArgs(components[38].dataset),
        config: catalogArgs(components[38].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[38].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiTableSparkline = {
    args: {
        component: 'VueUiTableSparkline',
        dataset: catalogArgs(components[39].dataset),
        config: catalogArgs(components[39].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[39].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiThermometer = {
    args: {
        component: 'VueUiThermometer',
        dataset: catalogArgs(components[40].dataset),
        config: catalogArgs(components[40].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[40].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiTiremarks = {
    args: {
        component: 'VueUiTiremarks',
        dataset: catalogArgs(components[41].dataset),
        config: catalogArgs(components[41].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[41].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiTreemap = {
    args: {
        component: 'VueUiTreemap',
        dataset: catalogArgs(components[42].dataset),
        config: catalogArgs(components[42].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[42].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiHorizontalBar = {
    args: {
        component: 'VueUiHorizontalBar',
        dataset: catalogArgs(components[43].dataset),
        config: catalogArgs(components[43].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[43].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiWaffle = {
    args: {
        component: 'VueUiWaffle',
        dataset: catalogArgs(components[44].dataset),
        config: catalogArgs(components[44].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[44].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiWheel = {
    args: {
        component: 'VueUiWheel',
        dataset: catalogArgs(components[45].dataset),
        config: catalogArgs(components[45].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[45].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiXy = {
    args: {
        component: 'VueUiXy',
        dataset: catalogArgs(components[46].dataset),
        config: catalogArgs(components[46].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[46].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiQuickChart = {
    args: {
        component: 'VueUiQuickChart',
        dataset: catalogArgs(components[47].dataset),
        config: catalogArgs(components[47].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[47].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiSparkTrend = {
    args: {
        component: 'VueUiSparkTrend',
        dataset: catalogArgs(components[48].dataset),
        config: catalogArgs(components[48].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[48].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiStripPlot = {
    args: {
        component: 'VueUiStripPlot',
        dataset: catalogArgs(components[49].dataset),
        config: catalogArgs(components[49].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[49].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiDumbbell = {
    args: {
        component: 'VueUiDumbbell',
        dataset: catalogArgs(components[50].dataset),
        config: catalogArgs(components[50].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[50].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiWordCloud = {
    args: {
        component: 'VueUiWordCloud',
        dataset: catalogArgs(components[51].dataset),
        config: catalogArgs(components[51].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[51].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiXyCanvas = {
    args: {
        component: 'VueUiXyCanvas',
        dataset: catalogArgs(components[52].dataset),
        config: catalogArgs(components[52].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[52].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiFlow = {
    args: {
        component: 'VueUiFlow',
        dataset: catalogArgs(components[53].dataset),
        config: catalogArgs(components[53].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[53].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiParallelCoordinatePlot = {
    args: {
        component: 'VueUiParallelCoordinatePlot',
        dataset: catalogArgs(components[54].dataset),
        config: catalogArgs(components[54].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[54].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiTimer = {
    args: {
        component: 'VueUiTimer',
        dataset: catalogArgs(components[55].dataset),
        config: catalogArgs(components[55].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[55].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiCarouselTable = {
    args: {
        component: 'VueUiCarouselTable',
        dataset: catalogArgs(components[56].dataset),
        config: catalogArgs(components[56].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[56].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiGizmo = {
    args: {
        component: 'VueUiGizmo',
        dataset: catalogArgs(components[57].dataset),
        config: catalogArgs(components[57].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[57].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiStackbar = {
    args: {
        component: 'VueUiStackbar',
        dataset: catalogArgs(components[58].dataset),
        config: catalogArgs(components[58].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[58].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiStackline = {
    args: {
        component: 'VueUiStackline',
        dataset: catalogArgs(components[59].dataset),
        config: catalogArgs(components[59].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[59].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiBullet = {
    args: {
        component: 'VueUiBullet',
        dataset: catalogArgs(components[60].dataset),
        config: catalogArgs(components[60].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[60].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiFunnel = {
    args: {
        component: 'VueUiFunnel',
        dataset: catalogArgs(components[61].dataset),
        config: catalogArgs(components[61].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[61].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiHistoryPlot = {
    args: {
        component: 'VueUiHistoryPlot',
        dataset: catalogArgs(components[62].dataset),
        config: catalogArgs(components[62].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[62].wrapperClass),
            ).toBeVisible(),
        );
    },
};
export const VueUiCirclePack = {
    args: {
        component: 'VueUiCirclePack',
        dataset: catalogArgs(components[63].dataset),
        config: catalogArgs(components[63].config || {}),
    },
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector(components[63].wrapperClass),
            ).toBeVisible(),
        );
    },
};

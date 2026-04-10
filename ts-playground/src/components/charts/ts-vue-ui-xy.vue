<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations through components
 */
import { computed } from 'vue';
import { VueUiXy } from 'vue-data-ui/vue-ui-xy';
import 'vue-data-ui/style.css';
import type { VueUiXyConfig, VueUiXyDatasetItem } from 'vue-data-ui';
import XyLegend from '../slots/vue-ui-xy/xy-legend.vue';
import CommonResetAction from '../slots/common/reset-action.vue';
import XyTooltip from '../slots/vue-ui-xy/xy-tooltip.vue';
import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionsStack from '../slots/common/options-stack.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import XyOptionAltCopy from '../slots/vue-ui-xy/xy-option-alt-copy.vue';
import XyBarGradient from '../slots/vue-ui-xy/xy-bar-gradient.vue';
import XyAreaGradient from '../slots/vue-ui-xy/xy-area-gradient.vue';
import XyPlotComment from '../slots/vue-ui-xy/xy-plot-comment.vue';
import PatternSlot from '../slots/common/pattern-slot.vue';
import XyTimeLabel from '../slots/vue-ui-xy/xy-time-label.vue';
import XySvg from '../slots/vue-ui-xy/xy-svg.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<VueUiXyDatasetItem[]>(() => [
    {
        name: 'A',
        type: 'line',
        useArea: true,
        series: [20, 13, 8, 5, 3, 2, 1],
        comments: ['', 'This is a comment'],
    },
    {
        name: 'B',
        type: 'bar',
        series: [1, 2, 3, 5, 8, 13, 21],
    },
    {
        name: 'C',
        type: 'plot',
        series: [7, 7, 7, 7, 7, 7, 7],
    },
]);

const config = computed<VueUiXyConfig>(() => {
    return {
        theme: 'dark',
        chart: {
            userOptions: {
                buttons: {
                    altCopy: true,
                },
                callbacks: {
                    altCopy: (args) => {
                        console.log(args);
                    },
                },
            },
        },
    };
});
</script>

<template>
    <div>
        <VueUiXy :dataset :config>
            <template #legend="{ legend }">
                <XyLegend :items="legend" />
            </template>

            <template #reset-action="{ reset }">
                <CommonResetAction :reset />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, timeLabel }">
                <XyTooltip :datapoint :timeLabel />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #annotator-action-close>
                <span style="color: chocolate">X</span>
            </template>

            <template #annotator-action-color="{ color }">
                <!-- text color, either black or white depending on the selected palette color -->
                <CommonAnnotatorActionColor :color />
            </template>

            <template #annotator-action-draw="{ mode }">
                <CommonAnnotatorActionDraw :mode />
            </template>

            <template #annotator-action-undo="{ disabled }">
                <CommonAnnotatorActionUndo :disabled />
            </template>

            <template #annotator-action-redo="{ disabled }">
                <CommonAnnotatorActionRedo :disabled />
            </template>

            <template #annotator-action-delete="{ disabled }">
                <CommonAnnotatorActionDelete :disabled />
            </template>

            <template #menuIcon="{ isOpen, color }">
                <CommonMenuIcon :isOpen :color />
            </template>

            <template #optionTooltip>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionTooltip</code
                >
            </template>

            <template #optionPdf>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionPdf</code
                >
            </template>

            <template #optionCsv>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionCsv</code
                >
            </template>

            <template #optionImg>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionImg</code
                >
            </template>

            <template #optionSvg>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionSvg</code
                >
            </template>

            <template #optionTable>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionTable</code
                >
            </template>

            <template #optionLabels>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionLabels</code
                >
            </template>

            <template #optionStack="{ isStack }">
                <CommonOptionsStack :is-stack />
            </template>

            <template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <CommonOptionFullscreen :toggle-fullscreen :is-fullscreen />
            </template>

            <template #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <CommonOptionAnnotator :toggle-annotator :is-annotator />
            </template>

            <template #optionAltCopy="{ copyAlt }">
                <XyOptionAltCopy :copy-alt />
            </template>

            <template #chart-background>
                <div
                    style="
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(
                            to bottom,
                            #cccccc00,
                            #cccccc20
                        );
                    "
                >
                    <code style="color: chocolate"> #chart-background </code>
                </div>
            </template>

            <template #bar-gradient="{ series, positiveId, negativeId }">
                <XyBarGradient :series :positive-id :negative-id />
            </template>

            <template #area-gradient="{ series, id }">
                <XyAreaGradient :series :id />
            </template>

            <template
                #plot-comment="{ plot, color, seriesIndex, datapointIndex }"
            >
                <XyPlotComment :plot :color :series-index :datapoint-index />
            </template>

            <template #pattern="{ seriesIndex, patternId }">
                <PatternSlot :series-index :pattern-id color="#6376DD" />
            </template>

            <template #time-label="label">
                <XyTimeLabel v-bind="label" :offset-y="label.fontSize * 1.5" />
            </template>

            <template #svg="{ svg }">
                <XySvg v-bind="svg" />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint :hint :is-visible />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #source>
                <div style="color: chocolate">#source</div>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiXy>
    </div>
</template>

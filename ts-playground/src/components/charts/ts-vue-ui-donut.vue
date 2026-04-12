<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations through components
 */
import { computed } from 'vue';
import { VueUiDonut } from 'vue-data-ui/vue-ui-donut';
import 'vue-data-ui/style.css';
import type { VueUiDonutConfig, VueUiDonutDatasetItem } from 'vue-data-ui';
import DonutLegend from '../slots/vue-ui-donut/donut-legend.vue';
import DonutTooltip from '../slots/vue-ui-donut/donut-tooltip.vue';
import DonutDataLabel from '../slots/vue-ui-donut/donut-data-label.vue';
import DonutPlotComment from '../slots/vue-ui-donut/donut-plot-comment.vue';
import DonutSvg from '../slots/vue-ui-donut/donut-svg.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import Skeleton from '../slots/common/skeleton.vue';
import PatternSlot from '../slots/common/pattern-slot.vue';
import DonutHollow from '../slots/vue-ui-donut/donut-hollow.vue';
import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import XyOptionAltCopy from '../slots/vue-ui-xy/xy-option-alt-copy.vue';
import DonutOptionAltCopy from '../slots/vue-ui-donut/donut-option-alt-copy.vue';

const dataset = computed<VueUiDonutDatasetItem[]>(() => [
    {
        name: 'A',
        values: [1],
        comment: 'Comment',
    },
    {
        name: 'B',
        values: [2],
    },
    {
        name: 'C',
        values: [3],
    },
]);

const config = computed<VueUiDonutConfig>(() => {
    return {
        theme: 'dark',
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
        style: {
            chart: {
                layout: {
                    labels: {
                        dataLabels: {
                            useLabelSlots: true,
                        },
                    },
                },
            },
        },
    };
});

function log(el: any) {
    console.log(el);
}
</script>

<template>
    <div>
        <VueUiDonut :dataset :config>
            <template #legend="{ legend }">
                <DonutLegend :items="legend" />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <DonutTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #dataLabel="{ datapoint }">
                <DonutDataLabel :datapoint />
            </template>

            <template #plot-comment="{ plot }">
                <DonutPlotComment :plot />
            </template>

            <template #svg="{ svg }">
                <DonutSvg :svg />
            </template>

            <template #pattern="{ seriesIndex, patternId }">
                <PatternSlot :series-index :pattern-id color="#6376DD" />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: -48px"
                />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>

            <template #hollow="{ width, height, total, average, dataset }">
                <DonutHollow :width :height :total :average :dataset />
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

            <template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <CommonOptionFullscreen :toggle-fullscreen :is-fullscreen />
            </template>

            <template #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <CommonOptionAnnotator :toggle-annotator :is-annotator />
            </template>

            <template #optionAltCopy="{ copyAlt }">
                <DonutOptionAltCopy :copy-alt />
            </template>
        </VueUiDonut>
    </div>
</template>

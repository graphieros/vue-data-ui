<script setup lang="ts">
import { computed } from 'vue';
import {
    VueUiChord,
    type VueUiChordConfig,
    type VueUiChordDataset,
} from 'vue-data-ui/vue-ui-chord';
import { mergeConfigs } from 'vue-data-ui/utils';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import CommonResetAction from '../slots/common/reset-action.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';

import ChordOptionAltCopy from '../slots/vue-ui-chord/chord-option-alt-copy.vue';
import ChordSvg from '../slots/vue-ui-chord/chord-svg.vue';
import Watermark from '../slots/common/watermark.vue';
import ChordLegend from '../slots/vue-ui-chord/chord-legend.vue';
import PatternSlot from '../slots/common/pattern-slot.vue';

import 'vue-data-ui/style.css';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<VueUiChordDataset>(() => {
    return {
        matrix: [
            [12000, 6000, 9000, 3000],
            [2000, 10000, 2000, 6001],
            [8000, 1600, 8000, 8001],
            [1000, 1000, 1000, 7001],
        ],
        labels: ['Group A', 'Group B', 'Group C', 'Group D'],
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78'],
    };
});

const testPreconfig = computed<VueUiChordConfig>(() => {
    return {};
});

const config = computed<VueUiChordConfig>(() => {
    return mergeConfigs({
        defaultConfig: testPreconfig.value,
        userConfig: {
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
    });
});

function log(n: unknown) {
    console.log(n);
}
</script>

<template>
    <div>
        <VueUiChord :dataset :config>
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
                <ChordOptionAltCopy :copy-alt />
            </template>

            <template #chart-background>
                <div
                    style="
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(
                            to bottom,
                            #cccccc00,
                            #cccccc90
                        );
                    "
                >
                    <code style="color: chocolate"> #chart-background </code>
                </div>
            </template>

            <template #svg="{ svg }">
                <ChordSvg :svg />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #legend="{ legend }">
                <ChordLegend :items="legend" />
            </template>

            <template #pattern="{ seriesIndex, patternId }">
                <PatternSlot :series-index :pattern-id />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: -90px"
                />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #reset-action="{ reset }">
                <CommonResetAction :reset />
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiChord>
    </div>
</template>

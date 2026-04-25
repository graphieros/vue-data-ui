<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiRelationCircle>
 */
import { computed } from 'vue';
import {
    VueUiRelationCircle,
    type VueUiRelationCircleConfig,
    type VueUiRelationCircleDatasetItem,
} from 'vue-data-ui/vue-ui-relation-circle';
import { mergeConfigs } from 'vue-data-ui/utils';
import 'vue-data-ui/style.css';

import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import Skeleton from '../slots/common/skeleton.vue';
import PatternSlot from '../slots/common/pattern-slot.vue';
import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import RelationCircleSvg from '../slots/vue-ui-relation-circle/relation-circle-svg.vue';

const dataset = computed<VueUiRelationCircleDatasetItem[]>(() => {
    return [
        {
            id: '01',
            label: 'Lorem',
            relations: [
                '02',
                '03',
                '04',
                '05',
                '06',
                '07',
                '08',
                '09',
                '10',
                '11',
                '12',
            ],
            weights: [5, 3, 10, 2, 9, 3, 1, 2, 3, 7, 1],
            color: '#eb4034',
        },
        {
            id: '02',
            label: 'Ipsum',
            relations: ['01', '03', '07', '06', '07'],
            weights: [3, 2, 9, 7, 1],
            color: '#e0992d',
        },
        {
            id: '03',
            label: 'Dolor',
            relations: ['01', '02'],
            weights: [2, 5],
            color: '#decc2c',
        },
        {
            id: '04',
            label: 'Consectetur',
            relations: ['01', '05', '10'],
            weights: [2, 1, 4],
            color: '#a8de2a',
        },
        {
            id: '05',
            label: 'Amet',
            relations: ['01', '04', '07', '10'],
            weights: [2, 3, 4, 5],
            color: '#5ed622',
        },
        {
            id: '06',
            label: 'Rherum',
            relations: ['01', '02'],
            weights: [4, 1],
            color: '#21d92d',
        },
        {
            id: '07',
            label: 'Delecta',
            relations: ['01', '02', '08', '12'],
            weights: [4, 8, 2, 1],
            color: '#23d97b',
        },
        {
            id: '08',
            label: 'Nitimur',
            relations: ['01', '07', '12', '01'],
            weights: [7, 3, 2, 3],
            color: '#29d6c2',
        },
        {
            id: '09',
            label: 'Vetitum',
            relations: ['01'],
            weights: [1],
            color: '#2aacdb',
        },
        {
            id: '10',
            label: 'Monumentum',
            relations: ['01', '04', '05'],
            weights: [4, 1, 4],
            color: '#295bd9',
        },
        {
            id: '11',
            label: 'Aere',
            relations: ['01'],
            weights: [3],
            color: '#523ed6',
        },
        {
            id: '12',
            label: 'Perennius',
            relations: ['01', '07', '08'],
            weights: [8, 1, 1],
            color: '#8235db',
        },
    ];
});

const testPreconfig = computed<VueUiRelationCircleConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false,
        loading: false,
        responsive: false,
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right, or up and down arrow keys to move between datapoints',
                tableAvailable:
                    'A data table for this chart is available below.',
                tableCaption: 'Chart data table',
            },
        },
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
        },
        responsiveProportionalSizing: true,
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            size: 400,
            limit: 50,
            animation: {
                show: true,
                speedMs: 300,
            },
            labels: {
                color: '#2D353C',
                fontSize: 14,
                minFontSize: 6,
            },
            weightLabels: {
                size: 8,
                show: true,
                formatter: null,
                prefix: '',
                suffix: '',
                rounding: 0,
            },
            links: {
                curved: false,
                maxWidth: 3,
            },
            circle: {
                radiusProportion: 0.2,
                stroke: '#CCCCCC',
                strokeWidth: 1,
                offsetY: 0,
            },
            plot: {
                radius: 3,
                useSerieColor: true,
                color: '#2D353C',
            },
            title: {
                text: '',
                color: '#2D353C',
                fontSize: 20,
                bold: true,
                textAlign: 'center',
                paddingLeft: 0,
                paddingRight: 0,
                subtitle: {
                    color: '#A1A1A1',
                    text: '',
                    fontSize: 16,
                    bold: false,
                },
            },
        },
        userOptions: {
            show: true,
            showOnChartHover: false,
            keepStateOnChartLeave: true,
            position: 'right',
            buttons: {
                tooltip: false,
                pdf: true,
                csv: false,
                img: true,
                table: false,
                labels: false,
                fullscreen: true,
                sort: false,
                stack: false,
                animation: false,
                annotator: true,
                svg: true,
                zoom: false,
                altCopy: false,
            },
            callbacks: {
                animation: null,
                annotator: null,
                csv: null,
                fullscreen: null,
                img: null,
                labels: null,
                pdf: null,
                sort: null,
                stack: null,
                table: null,
                tooltip: null,
                svg: null,
                zoom: null,
                altCopy: null,
            },
            buttonTitles: {
                open: 'Open options',
                close: 'Close options',
                pdf: 'Download PDF',
                img: 'Download PNG',
                fullscreen: 'Toggle fullscreen',
                annotator: 'Toggle annotator',
                svg: 'Download SVG',
                altCopy: 'Copy alt text',
            },
            print: {
                scale: 2,
                orientation: 'auto',
                overflowTolerance: 0.2,
            },
            useCursorPointer: false,
        },
    };
});

const config = computed<VueUiRelationCircleConfig>(() => {
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
        <VueUiRelationCircle :dataset :config>
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

            <template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <CommonOptionFullscreen :toggle-fullscreen :is-fullscreen />
            </template>

            <template #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <CommonOptionAnnotator :toggle-annotator :is-annotator />
            </template>

            <template #optionAltCopy>
                <code style="color: chocolate; font-size: 10px"
                    >#optionAltCopy</code
                >
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

            <template #dataLabel="{ x, y, color, fontSize, key, weight }">
                <text
                    :x
                    :y
                    :font-size
                    :fill="color"
                    text-anchor="middle"
                    dominant-baseline="middle"
                >
                    #dataLabel
                </text>
            </template>

            <template #svg="{ svg }">
                <RelationCircleSvg :svg />
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
        </VueUiRelationCircle>
    </div>
</template>

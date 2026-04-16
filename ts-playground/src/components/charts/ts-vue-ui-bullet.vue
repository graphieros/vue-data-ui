<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiBullet>
 */
import { computed } from 'vue';
import {
    VueUiBullet,
    type VueUiBulletDataset,
    type VueUiBulletConfig,
} from 'vue-data-ui/vue-ui-bullet';
import { mergeConfigs } from 'vue-data-ui/utils';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';

import BulletOptionAltCopy from '../slots/vue-ui-bullet/bullet-option-alt-copy.vue';
import BulletLegend from '../slots/vue-ui-bullet/bullet-legend.vue';
import Watermark from '../slots/common/watermark.vue';
import Skeleton from '../slots/common/skeleton.vue';
import BulletSvg from '../slots/vue-ui-bullet/bullet-svg.vue';

import 'vue-data-ui/style.css';

const dataset = computed<VueUiBulletDataset>(() => {
    return {
        value: 85,
        target: 80,
        segments: [
            {
                name: 'Low',
                from: 0,
                to: 50,
            },
            {
                name: 'Medium',
                from: 50,
                to: 70,
            },
            {
                name: 'High',
                from: 70,
                to: 100,
            },
        ],
    };
});

const testPreconfig = computed<VueUiBulletConfig>(() => {
    return {
        debug: false,
        loading: false,
        responsive: false,
        theme: '',
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
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                height: 96,
                width: 600,
                padding: {
                    top: 24,
                    right: 24,
                    bottom: 24,
                    left: 12,
                },
                animation: {
                    show: true,
                    animationFrames: 60,
                },
                segments: {
                    baseColor: '#9A9A9A',
                    dataLabels: {
                        show: true,
                        color: '#2D353C',
                        fontSize: 10,
                        formatter: null,
                        bold: false,
                        prefix: '',
                        suffix: '',
                        rounding: 0,
                        offsetY: 0,
                    },
                    ticks: {
                        show: true,
                        divisions: 10,
                        stroke: '#8A8A8A',
                    },
                },
                target: {
                    show: true,
                    onTop: true,
                    color: '#2D353C',
                    rounded: true,
                    heightRatio: 0.8,
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    width: 6,
                },
                valueBar: {
                    color: '#3A3A3A',
                    heightRatio: 0.33,
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    label: {
                        show: true,
                        color: '#2D353C',
                        fontSize: 14,
                        bold: true,
                        offsetY: 0,
                    },
                },
                title: {
                    text: '',
                    color: '#2D353C',
                    fontSize: 20,
                    bold: true,
                    textAlign: 'left',
                    paddingLeft: 12,
                    paddingRight: 0,
                    subtitle: {
                        color: '#A1A1A1',
                        text: '',
                        fontSize: 16,
                        bold: false,
                    },
                },
                legend: {
                    show: true,
                    bold: false,
                    backgroundColor: '#FFFFFF',
                    color: '#2D353C',
                    fontSize: 14,
                    selectAllToggle: {
                        show: false,
                        backgroundColor: '#e1e5e8',
                        color: '#2D353C',
                    },
                    roundingValue: 0,
                    position: 'bottom',
                },
            },
        },
    };
});

const config = computed<VueUiBulletConfig>(() => {
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
</script>

<template>
    <div>
        <VueUiBullet :dataset :config>
            <template #svg="{ svg }">
                <BulletSvg :svg />
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

            <template #optionAltCopy="{ copyAlt }">
                <BulletOptionAltCopy :copyAlt />
            </template>

            <template #legend="{ legend }">
                <BulletLegend :items="legend" />
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
        </VueUiBullet>
    </div>
</template>

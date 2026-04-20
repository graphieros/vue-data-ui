<script setup lang="ts">
import { computed } from 'vue';
import {
    VueUiGauge,
    type VueUiGaugeConfig,
    type VueUiGaugeDataset,
} from 'vue-data-ui/vue-ui-gauge';
import { mergeConfigs } from 'vue-data-ui/utils';
import 'vue-data-ui/style.css';

import Watermark from '../slots/common/watermark.vue';
import Skeleton from '../slots/common/skeleton.vue';
import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import GaugeOptionAltCopy from '../slots/vue-ui-gauge/gauge-option-alt-copy.vue';
import PatternSlot from '../slots/common/pattern-slot.vue';
import GaugeSvg from '../slots/vue-ui-gauge/gauge-svg.vue';
import GaugeLegend from '../slots/vue-ui-gauge/gauge-legend.vue';

const dataset = computed<VueUiGaugeDataset>(() => {
    return {
        base: 12250,
        value: 4.2,
        series: [
            {
                from: 1,
                to: 3,
                color: '#ff6400',
                name: 'bad',
            },
            {
                from: 3,
                to: 4,
                color: '#5f8bee',
                name: 'acceptable',
            },
            {
                from: 4,
                to: 5,
                color: '#42d392',
                name: 'very good',
            },
        ],
    };
});

const testPreconfig = computed<VueUiGaugeConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false,
        loading: false,
        responsive: false,
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                animation: {
                    use: true,
                    speed: 1,
                    acceleration: 1,
                },
                layout: {
                    radiusRatio: 1,
                    track: {
                        size: 1,
                        useGradient: true,
                        gradientIntensity: 20,
                    },
                    markers: {
                        show: true,
                        color: '#2D353C',
                        bold: true,
                        fontSizeRatio: 1,
                        offsetY: 0,
                        roundingValue: 0,
                        formatter: null,
                        prefix: '',
                        suffix: '',
                    },
                    segmentSeparators: {
                        show: false,
                        offsetOut: 0,
                        offsetIn: 0,
                        stroke: '#2D353C',
                        strokeWidth: 2,
                    },
                    segmentNames: {
                        show: true,
                        curved: true,
                        offsetRatio: 1.1,
                        fontSize: 16,
                        minFontSize: 6,
                        useSerieColor: true,
                        color: '#2D353C',
                        bold: false,
                    },
                    indicatorArc: {
                        show: false,
                        radius: 123,
                        fill: '#e1e5e8',
                    },
                    pointer: {
                        show: true,
                        type: 'pointy',
                        size: 1,
                        stroke: '#FFFFFF',
                        strokeWidth: 12,
                        useRatingColor: true,
                        color: '#CCCCCC',
                        circle: {
                            radius: 10,
                            stroke: '#2D353C',
                            strokeWidth: 2,
                            color: '#FFFFFF',
                        },
                    },
                },
                legend: {
                    show: true,
                    fontSize: 48,
                    prefix: '',
                    suffix: '',
                    roundingValue: 1,
                    showPlusSymbol: true,
                    useRatingColor: true,
                    color: '#2D353C',
                    formatter: null,
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
        translations: {
            base: 'Base',
        },
    };
});

const config = computed<VueUiGaugeConfig>(() => {
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
        <VueUiGauge :dataset :config>
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
                <GaugeOptionAltCopy :copy-alt />
            </template>

            <template #pattern="{ seriesIndex, patternId }">
                <PatternSlot :series-index :pattern-id />
            </template>

            <template #svg="{ svg }">
                <GaugeSvg :svg />
            </template>

            <template #legend="{ legend }">
                <GaugeLegend :legend />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiGauge>
    </div>
</template>

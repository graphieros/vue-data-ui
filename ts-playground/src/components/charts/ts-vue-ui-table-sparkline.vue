<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiTableSparkline>
 */
import { computed } from 'vue';
import {
    VueUiTableSparkline,
    type VueUiTableSparklineConfig,
    type VueUiTableSparklineDatasetItem,
} from 'vue-data-ui/vue-ui-table-sparkline';
import { mergeConfigs } from 'vue-data-ui/utils';
import 'vue-data-ui/style.css';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';

const dataset = computed<VueUiTableSparklineDatasetItem[]>(() => {
    return [
        {
            name: 'Serie 1',
            values: [0, 1, 2, 3, 5, 8],
            color: '#5f8bee',
        },
        {
            name: 'Serie 2',
            values: [8, 12, 13, 25, 31, 42],
            color: '#42d392',
        },
        {
            name: 'Serie 3',
            values: [66, 22, 33, 12, 55, 64],
            color: '#ff6400',
        },
        {
            name: 'Serie 4',
            values: [54, 44, 34, 12, 32, 26],
            color: '#f7e97c',
        },
        {
            name: 'Serie 5',
            values: [12, 14, 18, 25, 32, 64],
            color: '#42e9f5',
        },
    ];
});

const testPreconfig = computed<VueUiTableSparklineConfig>(() => {
    return {
        theme: '',
        customPalette: [],
        responsiveBreakpoint: 500,
        showAverage: true,
        showMedian: true,
        showTotal: true,
        roundingAverage: 0,
        roundingMedian: 0,
        roundingValues: 0,
        roundingTotal: 0,
        prefix: '',
        suffix: '',
        formatter: null,
        showSparklines: true,
        fontFamily: 'inherit',
        colNames: [],
        sortedDataColumnIndices: [],
        sortedSeriesName: false,
        sortedSum: false,
        sortedAverage: false,
        sortedMedian: false,
        resetSortOnClickOutside: false,
        sparkline: {
            useGradient: true,
            showArea: true,
            strokeWidth: 3,
            type: 'line',
            smooth: true,
            dimensions: {
                width: 150,
                heightRatio: 1,
            },
            animation: {
                show: true,
                animationFrames: 360,
            },
        },
        translations: {
            serie: 'Serie',
            total: 'Total',
            average: 'Average',
            median: 'Median',
            chart: 'Evolution',
        },
        title: {
            text: '',
            color: '#2D353C',
            fontSize: 20,
            bold: true,
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            subtitle: {
                color: '#A1A1A1',
                text: '',
                fontSize: 16,
                bold: false,
            },
        },
        thead: {
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            fontSize: 14,
            outline: 'none',
            textAlign: 'left',
            bold: false,
        },
        tbody: {
            showColorMarker: true,
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            fontSize: 14,
            outline: 'none',
            textAlign: 'left',
            bold: false,
            selectedColor: {
                useSerieColor: true,
                fallback: '#e1e5e8',
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
                csv: true,
                img: true,
                table: false,
                labels: false,
                fullscreen: true,
                sort: false,
                stack: false,
                animation: false,
                annotator: false,
                svg: false,
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
                csv: 'Download CSV',
                img: 'Download PNG',
                fullscreen: 'Toggle fullscreen',
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

const config = computed<VueUiTableSparklineConfig>(() => {
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
        <VueUiTableSparkline :dataset :config>
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

            <template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <CommonOptionFullscreen :toggle-fullscreen :is-fullscreen />
            </template>

            <template #optionAltCopy>
                <code style="color: chocolate; font-size: 10px"
                    >#optionAltCopy</code
                >
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>
        </VueUiTableSparkline>
    </div>
</template>

<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiDonut>
 */
import { ref, computed } from 'vue';
import {
    VueUiTableHeatmap,
    type VueUiTableHeatmapConfig,
    type VueUiTableHeatmapDatasetItem,
} from 'vue-data-ui/vue-ui-table-heatmap';
import { mergeConfigs } from 'vue-data-ui/utils';
import 'vue-data-ui/style.css';

import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';

const dataset = computed<VueUiTableHeatmapDatasetItem[]>(() => {
    return [
        {
            name: 'Serie 1',
            values: [20, 30, 40, 50, 40, 30, 20],
            color: '#1f77b4',
            shape: 'circle',
        },
        {
            name: 'Serie 2',
            values: [30, 40, 50, 60, 50, 40, 30],
            color: '#aec7e8',
            shape: 'triangle',
        },
        {
            name: 'Serie 3',
            values: [40, 50, 60, 70, 60, 50, 40],
            color: '#ff7f0e',
            shape: 'diamond',
        },
        {
            name: 'Serie 4',
            values: [50, 60, 70, 80, 70, 60, 50],
            color: '#ffbb78',
            shape: 'hexagon',
        },
        {
            name: 'Serie 5',
            values: [60, 70, 80, 90, 80, 70, 60],
            color: '#2ca02c',
            shape: 'star',
        },
    ];
});

const testPreconfig = computed<VueUiTableHeatmapConfig>(() => {
    return {
        theme: '',
        style: {
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            shapeSize: 14,
            heatmapColors: {
                useIndividualScale: false,
                min: '#FFFFFF',
                max: '#1f77b4',
            },
        },
        table: {
            responsiveBreakpoint: 400,
            borderWidth: 1,
            showSum: true,
            showAverage: true,
            showMedian: true,
            head: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                values: [
                    { name: 'A', color: 'red' },
                    { name: 'B', color: 'green' },
                ],
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

const config = computed<VueUiTableHeatmapConfig>(() => {
    return mergeConfigs({
        defaultConfig: testPreconfig.value,
        userConfig: {},
    });
});

function log(n: unknown) {
    console.log(n);
}
</script>

<template>
    <div>
        <VueUiTableHeatmap :dataset :config>
            <template #head="{ value, isResponsive, rowIndex, type }">
                <div style="display: flex; flex-direction: column">
                    <code style="color: chocolate">#head</code>
                    <span>value: {{ value }}</span>
                    <span>isResponsive: {{ isResponsive }}</span>
                    <span>rowIndex: {{ rowIndex }}</span>
                    <span>type: {{ type }}</span>
                </div>
            </template>

            <template
                #rowTitle="{ value, rowIndex, colIndex, type, isResponsive }"
            >
                <div style="display: flex; flex-direction: column">
                    <code style="color: chocolate">#rowTitle</code>
                    <span>value: {{ value }}</span>
                    <span>isResponsive: {{ isResponsive }}</span>
                    <span>rowIndex: {{ rowIndex }}</span>
                    <span>colIndex: {{ colIndex }}</span>
                    <span>type: {{ type }}</span>
                </div>
            </template>

            <template #sum="{ value, rowIndex, isResponsive }">
                <code style="color: chocolate">#sum</code>
                <div style="display: flex; flex-direction: column">
                    <span>value: {{ value }}</span>
                    <span>rowIndex: {{ rowIndex }}</span>
                    <span>isResponsive: {{ isResponsive }}</span>
                </div>
            </template>

            <template #average="{ value, rowIndex, isResponsive }">
                <code style="color: chocolate">#average</code>
                <div style="display: flex; flex-direction: column">
                    <span>value: {{ value }}</span>
                    <span>rowIndex: {{ rowIndex }}</span>
                    <span>isResponsive: {{ isResponsive }}</span>
                </div>
            </template>

            <template #median="{ value, rowIndex, isResponsive }">
                <code style="color: chocolate">#median</code>
                <div style="display: flex; flex-direction: column">
                    <span>value: {{ value }}</span>
                    <span>rowIndex: {{ rowIndex }}</span>
                    <span>isResponsive: {{ isResponsive }}</span>
                </div>
            </template>

            <template
                #cell="{
                    value,
                    rowIndex,
                    colIndex,
                    type,
                    isResponsive,
                    color,
                    textColor,
                }"
            >
                <div
                    :style="{
                        backgroundColor: color,
                        color: textColor,
                        display: 'flex',
                        flexDirection: 'column',
                        fontSize: '0.7rem',
                        lineHeight: '0.7rem',
                    }"
                >
                    <code style="color: chocolate; background: white"
                        >#cell</code
                    >
                    <span>value: {{ value }}</span>
                    <span>rowIndex: {{ rowIndex }}</span>
                    <span>colIndex: {{ colIndex }}</span>
                    <span>isResponsive: {{ isResponsive }}</span>
                </div>
            </template>

            <template #source>
                <code style="color: chocolate">#source</code>
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

            <template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <CommonOptionFullscreen :toggle-fullscreen :is-fullscreen />
            </template>
        </VueUiTableHeatmap>
    </div>
</template>

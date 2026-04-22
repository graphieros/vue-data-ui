<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiGeo>
 */
import { computed } from 'vue';
import {
    VueUiGeo,
    type VueUiGeoConfig,
    type VueUiGeoDatasetItem,
    type VueUiGeoMapGeoJson,
} from 'vue-data-ui/vue-ui-geo';
import { mergeConfigs } from 'vue-data-ui/utils';
import FRANCE from '../../../../TestingArena/maps/FRANCE.json';
import 'vue-data-ui/style.css';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';

import GeoOptionZoom from '../slots/vue-ui-geo/geo-option-zoom.vue';
import GeoDatapoint from '../slots/vue-ui-geo/geo-datapoint.vue';
import GeoSvg from '../slots/vue-ui-geo/geo-svg.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import GeoTooltip from '../slots/vue-ui-geo/geo-tooltip.vue';
import Skeleton from '../slots/common/skeleton.vue';

const franceGeoJson = FRANCE as VueUiGeoMapGeoJson;

const dataset = computed<VueUiGeoDatasetItem[]>(() => {
    return [
        {
            name: 'Paris',
            coordinates: [2.3522, 48.8566], // longitude, latitude
            description: 'Capital of France',
            color: '#E63946',
            radius: 2,
            custom: 'custom content',
        },
        {
            name: 'Lyon',
            coordinates: [4.8357, 45.764],
            description: 'Auvergne-Rhône-Alpes',
            color: '#457B9D',
            radius: 1,
        },
        {
            name: 'Marseille',
            coordinates: [5.3698, 43.2965],
            description: 'Provence-Alpes-Côte d’Azur',
            color: '#2A9D8F',
            radius: 1,
        },
        {
            name: 'Bordeaux',
            coordinates: [-0.5792, 44.8378],
            description: 'Nouvelle-Aquitaine',
            color: '#F4A261',
            radius: 1,
        },
        {
            name: 'Lille',
            coordinates: [3.0573, 50.6292],
            description: 'Hauts-de-France',
            color: '#8D99AE',
            radius: 1,
        },
    ];
});

const testPreconfig = computed<VueUiGeoConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        loading: false,
        debug: false,
        responsive: false,
        projection: 'equirectangular',
        theme: '',
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right, or up and down arrow keys to move between datapoints',
                tableAvailable:
                    'A data table for this chart is available below.',
                tableCaption: 'Chart data table',
            },
        },
        userOptions: {
            show: true,
            showOnChartHover: false,
            keepStateOnChartLeave: true,
            position: 'right',
            buttons: {
                tooltip: true,
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
                zoom: true,
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
                tooltip: 'Toggle tooltip',
                pdf: 'Download PDF',
                img: 'Download PNG',
                fullscreen: 'Toggle fullscreen',
                annotator: 'Toggle annotator',
                svg: 'Download SVG',
                zoom: 'Toggle zoom lock',
                altCopy: 'Copy alt text',
            },
            print: {
                scale: 2,
                orientation: 'auto',
                overflowTolerance: 0.2,
            },
            useCursorPointer: false,
        },
        map: {
            geoJson: franceGeoJson,
            center: [0, 0],
            fitPadding: 0,
        },
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
            territoryEnter: null,
            territoryLeave: null,
            territoryClick: null,
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                dimensions: {
                    width: null,
                    height: null,
                },
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                territory: {
                    fill: '#F2F3F5',
                    stroke: '#D0D4D8',
                    strokeWidth: 1,
                    hover: {
                        enabledWhenEmpty: false,
                        fill: '#e1e5e8',
                        stroke: '#CCCCCC',
                        strokeWidth: 1.5,
                    },
                },
                points: {
                    radius: 1,
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    fill: '#4A4A4A',
                    hoverRadiusRatio: 1.2,
                    labels: {
                        show: true,
                        fontSizeRatio: 1,
                        color: '#2D353C',
                        offsetY: 0,
                    },
                },
                controls: {
                    position: 'bottom',
                    show: true,
                    backgroundColor: '#e1e5e8',
                    buttonColor: '#e1e5e8',
                    color: '#2D353C',
                    fontSize: 14,
                    border: '1px solid #e1e5e8',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
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
                tooltip: {
                    show: true,
                    color: '#2D353C',
                    backgroundColor: '#FFFFFF',
                    fontSize: 14,
                    customFormat: null,
                    borderRadius: 4,
                    borderColor: '#e1e5e8',
                    borderWidth: 1,
                    backgroundOpacity: 100,
                    position: 'center',
                    offsetY: 24,
                    smooth: true,
                    backdropFilter: true,
                    smoothForce: 0.18,
                    smoothSnapThreshold: 0.25,
                    teleportTo: 'body',
                },
                zoom: {
                    active: true,
                },
            },
        },
    };
});

const config = computed<VueUiGeoConfig>(() => {
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
        <VueUiGeo :dataset :config>
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

            <template #optionZoom="{ toggleZoom, isZoomLocked }">
                <GeoOptionZoom :toggle-zoom :is-zoom-locked />
            </template>

            <template
                #datapoint="{
                    highlighted,
                    onPointClick,
                    onPointEnter,
                    onPointLeave,
                    point,
                }"
            >
                <GeoDatapoint
                    :highlighted
                    :onPointClick
                    :onPointEnter
                    :onPointLeave
                    :point
                />
            </template>

            <template #svg="{ svg }">
                <GeoSvg :svg />
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

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <GeoTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiGeo>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
    VueUiCarouselTable,
    type VueUiCarouselTableConfig,
    type VueUiCarouselTableDataset,
} from 'vue-data-ui/vue-ui-carousel-table';
import { mergeConfigs } from 'vue-data-ui/utils';

import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CarouselTableOptionAnimation from '../slots/vue-ui-carousel-table/carousel-table-option-animation.vue';
import CarouselTableTh from '../slots/vue-ui-carousel-table/carousel-table-th.vue';
import CarouselTableTd from '../slots/vue-ui-carousel-table/carousel-table-td.vue';

function mockDataset(n: number) {
    const arr = [];
    for (let i = 0; i < n; i += 1) {
        arr.push([10000 + i, 1000 + i, 100 + i, 10 + i, i]);
    }
    return arr;
}

const dataset = computed<VueUiCarouselTableDataset>(() => {
    return {
        head: ['col1', 'col2', 'col3', 'col4', 'col5'],
        body: mockDataset(99),
    };
});

const testPreconfig = computed<VueUiCarouselTableConfig>(() => {
    return {
        responsiveBreakpoint: 400,
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
                animation: true,
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
                animation: 'Toggle animation',
                altCopy: 'Copy alt text',
            },
            print: {
                scale: 2,
                orientation: 'auto',
                overflowTolerance: 0.2,
            },
            useCursorPointer: false,
        },
        animation: {
            type: 'scroll',
            use: true,
            speedMs: 1000,
            pauseOnHover: true,
        },
        style: {
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            fontFamily: 'inherit',
        },
        border: {
            size: 0,
            color: '#2D353C',
        },
        caption: {
            text: '',
            padding: {
                top: 12,
                right: 12,
                bottom: 12,
                left: 12,
            },
            style: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'left',
            },
        },
        scrollbar: {
            showOnlyOnHover: false,
            hide: false,
        },
        thead: {
            style: {
                verticalAlign: 'middle',
            },
            tr: {
                height: 32,
                border: {
                    size: 0,
                    color: '#2D353C',
                },
                style: {
                    backgroundColor: '#FFFFFF',
                    color: '#2D353C',
                    boxShadow: '0px 6px 12px -6px #2D353C50',
                },
                th: {
                    border: {
                        size: 0,
                        color: '#2D353C',
                    },
                    padding: {
                        top: 0,
                        right: 12,
                        bottom: 0,
                        left: 0,
                    },
                    style: {
                        borderSpacing: 0,
                        border: 'none',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                    },
                },
            },
        },
        tbody: {
            backgroundColor: '#FFFFFF',
            tr: {
                visible: 5,
                height: 32,
                border: {
                    size: 0,
                    color: '#2D353C',
                },
                style: {
                    backgroundColor: '#FFFFFF',
                    color: '#2D353C',
                },
                td: {
                    alternateColor: true,
                    alternateOpacity: 0.5,
                    border: {
                        size: 0,
                        color: '#2D353C',
                    },
                    padding: {
                        top: 0,
                        right: 12,
                        bottom: 0,
                        left: 0,
                    },
                    style: {
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        backgroundColor: '#e1e5e8',
                    },
                },
            },
        },
    };
});

const config = computed(() => {
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
        <VueUiCarouselTable :dataset :config>
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

            <template #optionAnimation="{ toggleAnimation, isAnimated }">
                <CarouselTableOptionAnimation :toggle-animation :is-animated />
            </template>

            <template #optionAltCopy>
                <code style="color: chocolate; font-size: 10px"
                    >#optionAltCopy</code
                >
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #caption>
                <code style="color: chocolate"> #caption </code>
            </template>

            <template #th="{ th, colIndex }">
                <CarouselTableTh :th :col-index />
            </template>

            <template #td="{ td, colIndex, rowIndex }">
                <CarouselTableTd :td :col-index :row-index />
            </template>
        </VueUiCarouselTable>
    </div>
</template>

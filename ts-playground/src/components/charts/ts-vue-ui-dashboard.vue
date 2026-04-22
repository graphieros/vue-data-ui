<script setup lang="ts">
import { computed, markRaw } from 'vue';
import TsVueUiDonut from './ts-vue-ui-donut.vue';
import { mergeConfigs } from 'vue-data-ui/utils';
import {
    VueUiDashboard,
    type VueUiDashboardConfig,
    type VueUiDashboardElement,
} from 'vue-data-ui/vue-ui-dashboard';

import DashboardTop from '../slots/vue-ui-dashboard/dashboard-top.vue';
import DashboardContent from '../slots/vue-ui-dashboard/dashboard-content.vue';
import DashboardBottom from '../slots/vue-ui-dashboard/dashboard-bottom.vue';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';

const dataset = computed<VueUiDashboardElement[]>(() => {
    return [
        {
            id: 'A',
            width: 35,
            height: 35,
            left: 20,
            top: 2,
            component: markRaw(TsVueUiDonut),
        },
        {
            id: 'B',
            width: 35,
            height: 25,
            left: 55,
            top: 2,
            component: 'VueUiDonut',
            props: {
                dataset: [
                    { name: 'a', values: [100] },
                    { name: 'b', values: [200] },
                ],
            },
        },
        {
            id: 'C',
            width: 20,
            height: 20,
            left: 60,
            top: 40,
            component: '',
        },
    ];
});

const testPreconfig = computed<VueUiDashboardConfig>(() => {
    return {
        locked: false,
        style: {
            board: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                aspectRatio: '1/1.4141',
                border: 'none',
            },
            item: {
                backgroundColor: '#FFFFFF',
                borderColor: '#e1e5e8',
            },
            resizeHandles: {
                backgroundColor: '#2D353C',
            },
        },
        userOptions: {
            show: true,
            useCursorPointer: false,
            showOnChartHover: false,
            keepStateOnChartLeave: true,
            position: 'right',
            buttons: {
                pdf: true,
                img: true,
                annotator: true,
                altCopy: false,
            },
            callbacks: {
                pdf: null,
                img: null,
                annotator: null,
                altCopy: null,
            },
            buttonTitles: {
                pdf: 'Download PDF',
                img: 'Download PNG',
                annotator: 'Toggle annotator',
                altCopy: 'Copy alt text',
            },
            print: {
                scale: 2,
                filename: '',
            },
        },
    };
});

const config = computed<VueUiDashboardConfig>(() => {
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
        <VueUiDashboard :dataset :config>
            <template #top="{ index, item }">
                <DashboardTop :index :item />
            </template>

            <template #content="content">
                <DashboardContent :content />
            </template>

            <template #bottom="{ index, item }">
                <DashboardBottom :index :item />
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

            <template #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <CommonOptionAnnotator :toggle-annotator :is-annotator />
            </template>

            <template #optionAltCopy>
                <code style="color: chocolate; font-size: 10px"
                    >#optionAltCopy</code
                >
            </template>
        </VueUiDashboard>
    </div>
</template>

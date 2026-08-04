<script setup>
import { ref, computed, onMounted, watchEffect, useTemplateRef } from 'vue';
import { useConfig } from '../src/useConfig';
import Box from './Box.vue';
import useThemeOptions from './useThemeOptions';
import LocalVueUiHill from '../src/components/vue-ui-hill.vue';
import { useConfigurationControls } from './createConfigModel.js';
import convertArrayToObject from './convertModel.js';
import ConfigKnobs from './ConfigKnobs.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import { VueUiHill as VueUiHillTreeshaken } from 'vue-data-ui/vue-ui-hill';

const { vue_ui_hill: DEFAULT_CONFIG } = useConfig();

console.log(DEFAULT_CONFIG);

const { CHECKBOX, NUMBER, RANGE, TEXT, COLOR, SELECT, createModel } =
    useConfigurationControls(DEFAULT_CONFIG);

const model = createModel([
    CHECKBOX('readonly', { def: false }),
    CHECKBOX('editing', { def: true }),
    CHECKBOX('loading', { def: false }),
    CHECKBOX('devHints.enable', { def: true }),
    CHECKBOX('userOptions.useCursorPointer', { def: true }),

    CHECKBOX('transitions.enable', { def: true }),
    CHECKBOX('transitions.pauseOnLoad', { def: true }),
    CHECKBOX('transitions.pauseOnDatasetChange', { def: false }),
    NUMBER('transitions.activationDelayMs', { def: 300 }),

    CHECKBOX('userOptions.buttons.pdf', { def: true }),
    CHECKBOX('userOptions.buttons.img', { def: true }),
    CHECKBOX('userOptions.buttons.csv', { def: true }),
    CHECKBOX('userOptions.buttons.fullscreen', { def: true }),
    CHECKBOX('userOptions.buttons.annotator', { def: true }),
    SELECT('userOptions.position', ['left', 'right'], { def: 'right' }),
    CHECKBOX('userOptions.showOnChartHover', { def: false }),
    CHECKBOX('userOptions.keepStateOnChartLeave', { def: true }),

    NUMBER('interaction.keyboardStep', {
        min: 0,
        max: 1,
        step: 0.01,
        def: 0.01,
    }),
    NUMBER('interaction.peakTolerance', { min: 0, max: 0.2, step: 0.005 }),

    TEXT('style.fontFamily', { def: 'inherit' }),

    COLOR('style.chart.backgroundColor', { def: '#FFFFFF' }),
    COLOR('style.chart.color', { def: '#1A1A1A' }),
    NUMBER('style.chart.width', { def: 800, min: 200, max: 2000, step: 50 }),
    NUMBER('style.chart.height', { def: 300, min: 200, max: 2000, step: 50 }),
    TEXT('style.chart.title.text', {
        def: 'Title',
        label: 'textContent',
        category: 'title',
    }),
    COLOR('style.chart.title.color', {
        def: '#1A1A1A',
        label: 'textColor',
        category: 'title',
    }),
    NUMBER('style.chart.title.fontSize', {
        def: 20,
        min: 6,
        max: 48,
        label: 'fontSize',
        category: 'title',
    }),
    CHECKBOX('style.chart.title.bold', {
        def: true,
        label: 'bold',
        category: 'title',
    }),
    SELECT('style.chart.title.textAlign', ['left', 'center', 'right'], {
        def: 'center',
    }),
    NUMBER('style.chart.title.paddingLeft', { def: 0, min: 0, max: 24 }),
    NUMBER('style.chart.title.paddingRight', { def: 0, min: 0, max: 24 }),
    TEXT('style.chart.title.subtitle.text', {
        def: 'Lorem ipsum dolor sit amet',
        label: 'textContent',
        category: 'subtitle',
    }),
    COLOR('style.chart.title.subtitle.color', {
        def: '#A1A1A1',
        label: 'textColor',
        category: 'subtitle',
    }),
    NUMBER('style.chart.title.subtitle.fontSize', {
        def: 16,
        min: 6,
        max: 42,
        label: 'fontSize',
        category: 'subtitle',
    }),
    CHECKBOX('style.chart.title.subtitle.bold', {
        def: false,
        label: 'bold',
        category: 'subtitle',
    }),

    CHECKBOX('style.chart.toolbar.show', { def: true }),
    TEXT('style.chart.toolbar.status.lastUpdated', {
        def: 'Last updated JUST NOW',
    }),
    TEXT('style.chart.toolbar.status.editInstruction', {
        def: 'PLZ DRAG PLOTS',
    }),
    COLOR('style.chart.toolbar.status.color', { def: '#1A1A1A' }),
    NUMBER('style.chart.toolbar.status.fontSize', { def: 14, min: 6, max: 24 }),
    CHECKBOX('style.chart.toolbar.status.bold', { def: false }),
    NUMBER('style.chart.toolbar.status.lineHeight', {
        def: 1,
        min: 0,
        max: 12,
    }),

    TEXT('style.chart.toolbar.buttons.translations.edit', { def: 'EDIT' }),
    TEXT('style.chart.toolbar.buttons.translations.cancel', { def: 'CANCEL' }),
    TEXT('style.chart.toolbar.buttons.translations.save', { def: 'SAVE' }),

    RANGE('style.chart.layout.hill.geometry.horizontalPaddingRatio', {
        min: 0,
        max: 1,
        step: 0.01,
        def: 0.05,
    }),
    RANGE('style.chart.layout.hill.geometry.topPaddingRatio', {
        min: 0,
        max: 1,
        step: 0.01,
        def: 0.15,
    }),
    RANGE('style.chart.layout.hill.geometry.bottomPaddingRatio', {
        min: 0,
        max: 1,
        step: 0.01,
        def: 0.15,
    }),
    RANGE('style.chart.layout.hill.geometry.curvature', {
        min: 0,
        max: 1,
        step: 0.01,
        def: 0.7,
    }),

    CHECKBOX('style.chart.layout.hill.baseline.show', { def: true }),
    COLOR('style.chart.layout.hill.baseline.stroke', { def: '#E1E5E8' }),
    NUMBER('style.chart.layout.hill.baseline.strokeWidth', {
        def: 1,
        min: 0,
        max: 6,
    }),
    TEXT('style.chart.layout.hill.baseline.strokeDasharray', {
        def: '0',
        min: 0,
        max: 6,
    }),

    CHECKBOX('style.chart.layout.hill.midline.show', { def: true }),
    COLOR('style.chart.layout.hill.midline.stroke', { def: '#E1E5E8' }),
    NUMBER('style.chart.layout.hill.midline.strokeWidth', {
        def: 1,
        min: 0,
        max: 6,
    }),
    TEXT('style.chart.layout.hill.midline.strokeDasharray', { def: '2.5 3.5' }),

    COLOR('style.chart.layout.hill.curve.stroke', { def: '#A1A1A1' }),
    NUMBER('style.chart.layout.hill.curve.strokeWidth', {
        def: 1.5,
        min: 0,
        max: 6,
    }),
    TEXT('style.chart.layout.hill.curve.strokeDasharray', { def: '0' }),

    NUMBER('style.chart.layout.plots.radius', { def: 10, min: 0, max: 24 }),
    NUMBER('style.chart.layout.plots.hitRadius', { def: 10, min: 0, max: 24 }),
    COLOR('style.chart.layout.plots.stroke', { def: '#FFFFFF' }),

    NUMBER('style.chart.layout.plots.stacking.overlapThresholdRatio', {
        def: 0.8,
        min: 0,
        max: 1,
        step: 0.1,
    }),
    NUMBER('style.chart.layout.plots.stacking.gap', {
        def: 5,
        min: -12,
        max: 24,
    }),
    CHECKBOX('style.chart.layout.plots.stacking.show', { def: true }),
    CHECKBOX('style.chart.layout.plots.stacking.overflow.show', { def: true }),
    NUMBER('style.chart.layout.plots.stacking.overflow.transitionDuration', {
        def: 300,
        min: 0,
        max: 1000,
        step: 100,
    }),
    NUMBER('style.chart.layout.plots.stacking.overflow.marker.radius', {
        def: 10,
        min: 0,
        max: 24,
    }),
    COLOR('style.chart.layout.plots.stacking.overflow.marker.stroke', {
        def: '#FFFFFF',
    }),
    NUMBER('style.chart.layout.plots.stacking.overflow.marker.strokeWidth', {
        def: 1,
        min: 0,
        max: 6,
    }),
    COLOR('style.chart.layout.plots.stacking.overflow.marker.labelColor', {
        def: '#1A1A1A',
    }),
    NUMBER('style.chart.layout.plots.stacking.overflow.marker.labelOffsetY', {
        def: 0,
        min: -20,
        max: 20,
    }),
    NUMBER('style.chart.layout.plots.stacking.overflow.marker.fontSize', {
        def: 14,
        min: 6,
        max: 24,
    }),
    CHECKBOX('style.chart.layout.plots.stacking.overflow.marker.bold', {
        def: false,
    }),
    COLOR('style.chart.layout.plots.stacking.overflow.marker.fill', {
        def: '#A1A1A1',
    }),

    NUMBER('style.chart.layout.plots.stacking.overflow.menu.width', {
        def: 220,
        min: 100,
        max: 400,
        step: 20,
    }),
    NUMBER('style.chart.layout.plots.stacking.overflow.menu.maxHeight', {
        def: 220,
        min: 100,
        max: 400,
        step: 20,
    }),
    COLOR('style.chart.layout.plots.stacking.overflow.menu.backgroundColor', {
        def: '#FFFFFF',
    }),
    COLOR('style.chart.layout.plots.stacking.overflow.menu.borderColor', {
        def: 'transparent',
    }),
    NUMBER('style.chart.layout.plots.stacking.overflow.menu.borderRadius', {
        def: 3,
        min: 0,
        max: 12,
    }),
    TEXT('style.chart.layout.plots.stacking.overflow.menu.title', {
        def: 'MENU TITLE',
    }),

    CHECKBOX('style.chart.layout.plots.dragMarker.show', { def: true }),
    NUMBER('style.chart.layout.plots.dragMarker.strokeWidth', {
        def: 1.5,
        min: 0,
        max: 12,
        step: 0.5,
    }),
    TEXT('style.chart.layout.plots.dragMarker.crossPath', {
        def: 'M-5 0H5M0-5V5',
    }),

    CHECKBOX('style.chart.layout.plots.dragMarker.positionIndicator.show', {
        def: true,
    }),
    CHECKBOX(
        'style.chart.layout.plots.dragMarker.positionIndicator.useSerieColor',
        { def: true },
    ),
    COLOR('style.chart.layout.plots.dragMarker.positionIndicator.color', {
        def: '#A1A1A1',
    }),
    NUMBER(
        'style.chart.layout.plots.dragMarker.positionIndicator.strokeWidth',
        { def: 1, min: 0, max: 6 },
    ),
    TEXT(
        'style.chart.layout.plots.dragMarker.positionIndicator.strokeDasharray',
        { def: '2 4' },
    ),

    CHECKBOX(
        'style.chart.layout.plots.dragMarker.positionIndicator.circle.show',
        { def: true },
    ),
    NUMBER(
        'style.chart.layout.plots.dragMarker.positionIndicator.circle.radius',
        { def: 3, min: 0, max: 12 },
    ),
    COLOR(
        'style.chart.layout.plots.dragMarker.positionIndicator.circle.stroke',
        { def: '#FFFFFF' },
    ),
    NUMBER(
        'style.chart.layout.plots.dragMarker.positionIndicator.circle.strokeWidth',
        { def: 1, min: 0, max: 6 },
    ),

    CHECKBOX(
        'style.chart.layout.plots.dragMarker.positionIndicator.value.show',
        { def: true },
    ),
    NUMBER(
        'style.chart.layout.plots.dragMarker.positionIndicator.value.offsetY',
        { def: 0, min: -20, max: 20 },
    ),
    NUMBER(
        'style.chart.layout.plots.dragMarker.positionIndicator.value.fontSize',
        { def: 12, min: 6, max: 42 },
    ),
    CHECKBOX(
        'style.chart.layout.plots.dragMarker.positionIndicator.value.useSerieColor',
        { def: false },
    ),
    COLOR('style.chart.layout.plots.dragMarker.positionIndicator.value.color', {
        def: '#1A1A1A',
    }),
    NUMBER(
        'style.chart.layout.plots.dragMarker.positionIndicator.value.rounding',
        { def: 0, min: 0, max: 4 },
    ),

    CHECKBOX('style.chart.layout.labels.item.show', { def: true }),
    NUMBER('style.chart.layout.labels.item.ellipsisThresholdChars', {
        def: 24,
        min: 6,
        max: 42,
    }),
    COLOR('style.chart.layout.labels.item.color', { def: '#1A1A1A' }),
    CHECKBOX('style.chart.layout.labels.item.useSerieColor', { def: false }),
    NUMBER('style.chart.layout.labels.item.fontSize', {
        def: 14,
        min: 6,
        max: 42,
    }),
    CHECKBOX('style.chart.layout.labels.item.bold', { def: false }),
    NUMBER('style.chart.layout.labels.item.offsetX', {
        def: 0,
        min: -20,
        max: 20,
    }),
    NUMBER('style.chart.layout.labels.item.offsetY', {
        def: 0,
        min: -20,
        max: 20,
    }),
    RANGE('style.chart.layout.labels.item.autoSideThreshold', {
        def: 0.75,
        min: 0.5,
        max: 1,
        step: 0.01,
    }),
    COLOR('style.chart.layout.labels.item.stroke', { def: '#FFFFFF' }),
    NUMBER('style.chart.layout.labels.item.strokeWidth', {
        def: 5,
        min: 0,
        max: 12,
    }),

    CHECKBOX('style.chart.layout.labels.phases.show', { def: true }),
    COLOR('style.chart.layout.labels.phases.color', { def: '#1A1A1A' }),
    NUMBER('style.chart.layout.labels.phases.fontSize', {
        def: 14,
        min: 6,
        max: 42,
    }),
    CHECKBOX('style.chart.layout.labels.phases.bold', { def: true }),
    TEXT('style.chart.layout.labels.phases.letterSpacing', { def: '0.1em' }),
    NUMBER('style.chart.layout.labels.phases.offsetY', {
        def: 0,
        min: -20,
        max: 20,
    }),
    TEXT('style.chart.layout.labels.phases.left.text', { def: 'LEFT PHASE' }),
    TEXT('style.chart.layout.labels.phases.right.text', { def: 'RIGHT PHASE' }),

    CHECKBOX('style.chart.layout.stackbar.show', { def: true }),
    NUMBER('style.chart.layout.stackbar.paddingTop', {
        def: 0,
        min: 0,
        max: 42,
    }),
    NUMBER('style.chart.layout.stackbar.paddingBottom', {
        def: 0,
        min: 0,
        max: 42,
    }),
    NUMBER('style.chart.layout.stackbar.height', { def: 14, min: 6, max: 42 }),
    COLOR('style.chart.layout.stackbar.stroke', { def: '#FFFFFF' }),
    NUMBER('style.chart.layout.stackbar.strokeWidth', {
        def: 1.5,
        min: 0,
        max: 6,
    }),
    COLOR('style.chart.layout.stackbar.gutterColor', { def: '#E1E5E8' }),

    CHECKBOX('style.chart.layout.stackbar.label.show', { def: true }),
    COLOR('style.chart.layout.stackbar.label.color', { def: '#1A1A1A' }),
    NUMBER('style.chart.layout.stackbar.label.fontSize', {
        def: 12,
        min: 6,
        max: 24,
    }),
]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        events: {
            // edit: (n) => {
            //     consol capturee.log('edit', n);
            // },
            // save: (n) => {
            //     console.log('save', n);
            // },
            // cancel: (n) => { console.log('cancel', n)},
            // change: (n) => { console.log('change', n)},
            dragStart: (n) => {
                console.log('dragStart', n);
            },
            // dragEnd: (n) => { console.log('dragEnd', n)},
            // datapointEnter: (n) => { console.log('datapointEnter', n)},
            // datapointLeave: (n) => { console.log('datapointLeave', n)},
            // selectDatapoint: (n) => { console.log('selectDatapoint', n)},
        },
        style: {
            chart: {
                layout: {
                    plots: {
                        dragMarker: {
                            positionIndicator: {
                                value: {
                                    // formatter: ({ value }) => {
                                    //     return `f | ${value}`
                                    // }
                                },
                            },
                        },
                    },
                    stackbar: {
                        label: {
                            // formatter: ({ value }) => {
                            //     return `f | ${value}`
                            // }
                        },
                    },
                },
            },
        },
    };
});

const titleStep = ref(0);
const step = ref(0);

const dataset = ref([
    {
        // id: 'some unique id',
        label: 'FALLEN TOAST',
        position: 0.5,
        color: '#3b9ed0',
        // disabled: true
        // muted: true,
    },
    {
        label: 'SILLY CUPBOARD WITH OLD STUFF INSIDE',
        position: 0.5,
        // color: '#31a266',
    },
    {
        id: 'recurring-events',
        label: 'TATTY PYJAMAS',
        position: 0.5,
        // color: '#f39a2b',
    },
    {
        label: 'BREADCRUMBS IN BED',
        position: 1,
        // color: '#316eb5',
        muted: false,
    },
    {
        label: 'STUCK ZIPPER',
        position: 0,
        // color: '#316eb5',
        muted: false,
    },
    {
        label: 'OVERLY OPEN FRIDGE',
        position: 0,
        // color: '#316eb5',
        muted: false,
    },
    {
        label: 'LAUGHING NUGGET',
        position: 0,
        // color: '#316eb5',
        muted: false,
    },
]);

function persistUpdate(updatedItems) {
    dataset.value = updatedItems;
    console.log('Persist this snapshot:', updatedItems);
}

function log(n) {
    console.log(n);
}

const local = useTemplateRef('local');

onMounted(async () => {
    if (local.value) {
        const img = await local.value?.getImage();
        console.log(img);
        // localDonut.value.autoSize()
        // setTimeout(() => {
        //     localDonut.value.hideSeries('Series C')
        // }, 4000)
        // setTimeout(() => {
        //     localDonut.value.hideSeries('Series A')
        //     localDonut.value.showSeries('Series C')
        // }, 5000)
    }
});

const { currentTheme, themeOptions } = useThemeOptions();

const configTheme = computed(() => ({
    theme: currentTheme.value,
}));
</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiHill" :dataset :config>
        <template #local>
            <LocalVueUiHill ref="local" :dataset :config @save="persistUpdate">
                <!-- <template #hill-edit>
        U
      </template> -->
                <!-- <template #hill-cancel>
        C
      </template> -->
                <!-- <template #hill-save>
        S
      </template> -->
                <template #svg="{ svg }">
                    {{ log(svg) }}
                </template>
                <template #analysis="{ data }">
                    <!-- {{ log(data) }} -->
                </template>

                <template #loading> LOADING... </template>
            </LocalVueUiHill>
        </template>

        <template #build-treesh>
            <VueUiHillTreeshaken :dataset :config> </VueUiHillTreeshaken>
        </template>

        <template #build>
            <VueUiHill :dataset :config> </VueUiHill>
        </template>

        <template #theme>
            <LocalVueUiHill :dataset :config="configTheme" />
        </template>

        <template #VDUI-local>
            <LocalVueDataUi
                component="VueUiHill"
                :dataset
                :config
                ref="localVdui"
            >
            </LocalVueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs
                :model="model"
                @change="step += 1"
                :open="summaryOpen"
            />
        </template>
    </Box>
</template>

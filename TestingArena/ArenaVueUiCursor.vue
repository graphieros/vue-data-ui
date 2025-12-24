<script setup>
import { ref, computed } from "vue";
import LocalVueUiCursor from "../src/components/vue-ui-cursor.vue";
import convertArrayToObject from "./convertModel";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import Box from "./Box.vue";

const { vue_ui_cursor: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    RANGE,
    COLOR,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const model = createModel([
    CHECKBOX('bubbleEffect', { def: true }),
    COLOR('bubbleEffectColor', { def: '#FFFFFF'}),
    RANGE('bubbleEffectOpacity', { def: 0.1, min: 0, max: 1, step: 0.01 }),
    COLOR('centerCircleColor', { def: '#FFFFFF'}),
    RANGE('centerCircleDasharray', { def: 0, min: 0, max: 500}),
    RANGE('centerCircleOpacity', { def: 0, min: 0, max: 1, step: 0.01 }),
    RANGE('centerCircleRadius', { def: 50, min: 0, max: 100 }),
    COLOR('centerCircleStroke', { def: '#CCCCCC'}),
    RANGE('centerCircleStrokeWidth', { def: 0.5, min: 0, max: 48, step: 0.5 }),
    COLOR('coordinatesColor', { def: '#CCCCCC'}),
    RANGE('coordinatesFontSize', { def: 10, step: 1, min: 6, max: 48}),
    RANGE('coordinatesOffset', { def: 0, min: -100, max: 100, step: 1 }),
    RANGE('crosshairDasharray', { def: 0, min: 0, max: 100 }),
    COLOR('crosshairStroke', { def: '#CCCCCC'}),
    RANGE('crosshairStrokeWidth', { def: 0.5, min: 0, max: 12, step: 0.5 }),
    COLOR('intersectCirclesFill', { def: '#CCCCCC'}),
    RANGE('intersectCirclesRadius', { def: 2, min: 0, max: 24, step: 1}),
    CHECKBOX('isLoading', { def: false }),
    CHECKBOX('showCenterCircle', { def: true }),
    CHECKBOX('showCoordinates', { def: true }),
    CHECKBOX('showCrosshair', { def: true }),
    CHECKBOX('showIntersectCircles', { def: true }),
    CHECKBOX('useWaveOnClick', { def: true }),
]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        parentId: 'BOX' // default is empty. Using an id will show the cursor only when hovering the target. Not using an id will show the cursor at all times.
    }
})

</script>

<template>
    <Box comp="VueUiCursor" :config="config" :show-default="false">
        <template #title>VueUiCursor</template>

        <template #local>
            <LocalVueUiCursor :config="config" ref="local"/>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>
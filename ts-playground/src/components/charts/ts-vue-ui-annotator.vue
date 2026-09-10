<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiAnnotator>
 */
import { computed, ref } from 'vue';
import {
    VueUiAnnotator,
    type VueUiAnnotatorConfig,
} from 'vue-data-ui/vue-ui-annotator';
import { adaptColorToBackground } from 'vue-data-ui/utils';
import 'vue-data-ui/style.css';

const isSlots = ref(false);

const config = computed<VueUiAnnotatorConfig>(() => ({
    devHints: {
        enable: false,
    },
    alwaysVisible: true,
    useCursorPointer: true,
    style: {
        backgroundColor: '#FFFFFF',
        color: '#1A1A1A',
        fontFamily: 'Arial',
        showPrint: true,
        showSave: true,
        showTooltips: true,
        showImage: true,
        paletteColor: '#FF0000',
        palette: ['#000000', '#FFFFFF', '#FF0000', '#00FF00'],
        buttons: {
            borderRadius: 2,
            backgroundColor: '#FFFFFF',
            controls: {
                color: '#1A1A1A',
                border: '#3A3A3A',
                selected: {
                    backgroundColor: '#4A4A4A',
                    color: '#CCCCCC',
                    border: '#2A2A2A',
                },
            },
            shapes: {
                backgroundColor: '#FFFFFF',
                color: '#1A1A1A',
                border: 'none',
                selected: {
                    backgroundColor: '#4A4A4A',
                    color: '#CCCCCC',
                    border: '#2A2A2A',
                },
            },
        },
        tooltips: {
            backgroundColor: '#FFFFFF',
            color: '#1A1A1A',
            border: '1px solid #3A3A3A',
            borderRadius: 3,
            boxShadow: '3px 3px #1A1A1A',
        },
    },
    translations: {
        colorAlpha: 'Color alpha',
        dashedLines: 'Dashed lines',
        filled: 'Filled',
        fontSize: 'Font size',
        thickness: 'Thickness',
        title: 'Annotations',
        tooltipGroup: isSlots.value ? '#icon-select-group' : 'Select & group',
        tooltipDelete: isSlots.value ? '#icon-delete' : 'Delete',
        tooltipMove: isSlots.value ? '#icon-move' : 'Move',
        tooltipResize: isSlots.value ? '#icon-resize' : 'Resize',
        tooltipBringToFront: isSlots.value
            ? '#icon-bring-to-front'
            : 'Bring to front',
        tooltipBringToBack: isSlots.value
            ? '#icon-bring-to-back'
            : 'Bring to back',
        tooltipDuplicate: 'Duplicate',
        tooltipUndo: isSlots.value ? '#icon-undo' : 'Undo last shape',
        tooltipRedo: isSlots.value ? '#icon-redo' : 'Redo last shape',
        tooltipPdf: isSlots.value ? '#icon-print' : 'Save pdf',
        tooltipSave: isSlots.value ? '#icon-save' : 'Save annotations',
        tooltipShapeCircle: isSlots.value ? '#icon-circle' : 'Draw circle',
        tooltipShapeRect: isSlots.value ? '#icon-rect' : 'Draw rect',
        tooltipShapeArrow: isSlots.value ? '#icon-arrow' : 'Draw arrow',
        tooltipShapeFreehand: isSlots.value
            ? '#icon-freehand'
            : 'Freehand line',
        tooltipShapeText: isSlots.value ? '#icon-text' : 'Text mode',
        tooltipShapeTextLeft: isSlots.value
            ? '#icon-text-align-left'
            : 'Align left',
        tooltipShapeTextCenter: isSlots.value
            ? '#icon-text-align-center'
            : 'Align center',
        tooltipShapeTextRight: isSlots.value
            ? '#icon-text-align-right'
            : 'Align right',
        tooltipShapeTextBullet: isSlots.value
            ? '#icon-text-bullet-points'
            : 'Bullet points',
        tooltipShapeTextBold: isSlots.value ? '#icon-text-bold' : 'Bold',
        tooltipShapeTextItalic: isSlots.value ? '#icon-text-italic' : 'Italic',
        tooltipShapeTextUnderline: isSlots.value
            ? '#icon-text-underline'
            : 'Underlined',
        tooltipShapeColor: isSlots.value ? '#icon-color' : 'Color',
        tooltipImage: isSlots.value ? '#icon-export-image' : 'Download PNG',
    },
}));
</script>

<template>
    <div>
        <button @click="isSlots = !isSlots">TOGGLE SLOTS</button>
        <VueUiAnnotator :config>
            <div class="content" />

            <template v-if="isSlots" #toggle="{ toggle }">
                <button @click="toggle()">#toggle</button>
            </template>

            <template v-if="isSlots" #icon-move="{ active }">
                M({{ active ? 1 : 0 }})
            </template>

            <template v-if="isSlots" #icon-resize="{ active }">
                R({{ active ? 1 : 0 }})
            </template>

            <template v-if="isSlots" #icon-delete="{ active }">
                D({{ active ? 1 : 0 }})
            </template>

            <template v-if="isSlots" #icon-select-group="{ active }">
                G({{ active ? 1 : 0 }})
            </template>

            <template v-if="isSlots" #icon-bring-to-front> BF </template>
            <template v-if="isSlots" #icon-bring-to-back> BB </template>
            <template v-if="isSlots" #icon-copy> CC </template>
            <template v-if="isSlots" #icon-undo> UN </template>
            <template v-if="isSlots" #icon-redo> RE </template>
            <template v-if="isSlots" #icon-print> PR </template>
            <template v-if="isSlots" #icon-export-image> IMG </template>
            <template v-if="isSlots" #icon-save> SAV </template>

            <template v-if="isSlots" #icon-circle="{ filled }">
                C({{ filled ? 1 : 0 }})
            </template>
            <template v-if="isSlots" #icon-rect="{ filled }">
                R({{ filled ? 1 : 0 }})
            </template>

            <template v-if="isSlots" #icon-arrow> ARR </template>
            <template v-if="isSlots" #icon-freehand> FH </template>

            <template v-if="isSlots" #icon-text="{ active }">
                T({{ active ? 1 : 0 }})
            </template>
            <template v-if="isSlots" #icon-text-align-left> TL </template>
            <template v-if="isSlots" #icon-text-align-center> TC </template>
            <template v-if="isSlots" #icon-text-align-right> TR </template>
            <template v-if="isSlots" #icon-text-bullet-points> BP </template>
            <template v-if="isSlots" #icon-text-bold> BLD </template>
            <template v-if="isSlots" #icon-text-italic> ITA </template>
            <template v-if="isSlots" #icon-text-underline> UND </template>
            <template v-if="isSlots" #icon-color="{ color, backgroundColor }">
                <div
                    :style="`font-size:4px;color:${adaptColorToBackground(backgroundColor)}!important`"
                >
                    {{ color }}
                </div>
            </template>
        </VueUiAnnotator>
    </div>
</template>

<style scoped>
.content {
    width: 100%;
    height: 500px;
    background: white;
}
</style>

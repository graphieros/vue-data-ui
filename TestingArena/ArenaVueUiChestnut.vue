<script setup>
import { ref, computed } from "vue";
import LocalVueUiChestnut from '../src/components/vue-ui-chestnut.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
    {
        name: "Root1",
        branches: [
            {
                name: "branch 1.1",
                value: 200,
                breakdown: [
                    {
                        name: "break 1.1.1",
                        value: 50,
                        color: "#F17171"
                    },
                    {
                        name: "break 1.1.2",
                        value: 25,
                        color: "#ffc800"
                    },
                    {
                        name: "break 1.1.3",
                        value: 25,
                        color: "#42d392"
                    },
                ]
            },
            {
                name: "branch 1.2",
                value: 100,
                breakdown: [
                    {
                        name: "break 1.2.1",
                        value: 10,
                        color: "#F17171"
                    },
                    {
                        name: "break 1.2.2",
                        value: 20,
                        color: "#ffc800"
                    },
                    {
                        name: "break 1.2.3",
                        value: 70,
                        color: "#42d392"
                    },
                ]
            },
            {
                name: "branch 1.3",
                value: 175,
                breakdown: [
                    {
                        name: "break 1.3.1",
                        value: 90,
                        color: "#F17171"
                    },
                    {
                        name: "break 1.3.2",
                        value: 10,
                        color: "#ffc800"
                    },
                    {
                        name: "break 1.3.3",
                        value: 75,
                        color: "#42d392"
                    },
                ]
            },

        ]
    },
    {
        name: "Root2",
        branches: [
            {
                name: "branch 2.1",
                value: 200,
                breakdown: [
                    {
                        name: "break 2.1.1",
                        value: 150,
                        color: "#F17171"
                    },
                    {
                        name: "break 2.1.2",
                        value: 25,
                        color: "#ffc800"
                    },
                    {
                        name: "break 2.1.3",
                        value: 25,
                        color: "#42d392"
                    },
                ]
            },
            {
                name: "branch 2.2",
                value: 300,
                breakdown: [
                    {
                        name: "break 2.2.1",
                        value: 100,
                        color: "#F17171"
                    },
                    {
                        name: "break 2.2.2",
                        value: 10,
                        color: "#ffc800"
                    },
                    {
                        name: "break 2.2.3",
                        value: 150,
                        color: "#42d392"
                    },
                ]
            },
            {
                name: "branch 2.3",
                value: 125,
                breakdown: [
                    {
                        name: "break 2.3.1",
                        value: 80,
                        color: "#F17171"
                    },
                    {
                        name: "break 2.3.2",
                        value: 20,
                        color: "#ffc800"
                    },
                    {
                        name: "break 2.3.3",
                        value: 25,
                        color: "#42d392"
                    },
                ]
            },
        ]
    },
    {
        name: "Root3",
        branches: [
            {
                name: "branch 3.1",
                value: 120,
                breakdown: [
                    {
                        name: "break 3.1.1",
                        value: 100,
                        color: "#F17171"
                    },
                    {
                        name: "break 3.1.2",
                        value: 10,
                        color: "#ffc800"
                    },
                    {
                        name: "break 3.1.3",
                        value: 10,
                        color: "#42d392"
                    },
                ]
            },
            {
                name: "branch 3.2",
                value: 90,
                breakdown: [
                    {
                        name: "break 3.2.1",
                        value: 30,
                        color: "#F17171"
                    },
                    {
                        name: "break 3.2.2",
                        value: 30,
                        color: "#ffc800"
                    },
                    {
                        name: "break 3.2.3",
                        value: 40,
                        color: "#42d392"
                    },
                ]
            },
            {
                name: "branch 3.3",
                value: 390,
                breakdown: [
                    {
                        name: "break 3.3.1",
                        value: 90,
                        color: "#F17171"
                    },
                    {
                        name: "break 3.3.2",
                        value: 200,
                        color: "#ffc800"
                    },
                    {
                        name: "break 3.3.3",
                        value: 100,
                        color: "#42d392"
                    },
                ]
            }
        ]
    },
]);

const model = ref([
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.grandTotal.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grandTotal.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.grandTotal.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grandTotal.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.grandTotal.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.grandTotal.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.grandTotal.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.grandTotal.text', def: 'Grand total', type: 'text'},
    { key: 'style.chart.layout.grandTotal.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.roots.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.roots.strokeWidth', def: 5, type: 'range', min: 0, max: 12},
    { key: 'style.chart.layout.roots.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.roots.gradientIntensity', def: 20, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.roots.underlayerColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.roots.labels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.roots.labels.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.roots.labels.adaptColorToBackground', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.roots.labels.color', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.roots.labels.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.roots.labels.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.roots.labels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.roots.labels.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.roots.labels.name.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.roots.labels.name.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.roots.labels.name.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.verticalSeparator.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.verticalSeparator.strokeWidth', def: 5, type: 'range', min: 0, max: 24},
    { key: 'style.chart.layout.links.opacity', def: 10, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.branches.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.branches.strokeWidth', def: 0, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.branches.borderRadius', def: 6, type: 'range', min: 0, max: 24},
    { key: 'style.chart.layout.branches.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.branches.gradientIntensity', def: 20, type: 'range', min: 0, max:100},
    { key: 'style.chart.layout.branches.underlayerColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.branches.widthRatio', def: 1.5, type: 'range', min: 0.1, max: 2, step: 0.01},
    { key: 'style.chart.layout.branches.labels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.branches.labels.fontSize', def: 14, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.branches.labels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.branches.labels.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.branches.labels.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.branches.labels.dataLabels.hideUnderValue', def: 5, type: 'number', min: 1, max: 20},
    { key: 'style.chart.layout.branches.labels.dataLabels.fontSize', def: 14, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.branches.labels.dataLabels.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.branches.labels.dataLabels.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.branches.labels.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.branches.labels.dataLabels.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.nuts.offsetX', def: 20, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.nuts.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.nuts.gradientIntensity', def: 30, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.nuts.selected.useMotion', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.nuts.selected.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.nuts.selected.gradientIntensity', def: 40, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.nuts.selected.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.nuts.selected.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.nuts.selected.labels.dataLabels.hideUnderValue', def: 5, type: 'number', min: 1, max: 20},
    { key: 'style.chart.layout.nuts.selected.labels.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.nuts.selected.labels.dataLabels.fontSize', def: 12, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.nuts.selected.labels.dataLabels.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.nuts.selected.labels.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.nuts.selected.labels.dataLabels.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.nuts.selected.labels.core.total.color', def:'#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.nuts.selected.labels.core.total.fontSize', def: 24, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.nuts.selected.labels.core.total.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.nuts.selected.labels.core.value.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.nuts.selected.labels.core.value.fontSize', def: 24, type: 'number', min:8, max: 48},
    { key: 'style.chart.layout.nuts.selected.labels.core.value.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.nuts.selected.labels.core.value.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.nuts.selected.labels.core.value.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.legend.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.legend.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.legend.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.legend.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.legend.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.title.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.layout.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.title.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.title.subtitle.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.layout.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.layout.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.title.subtitle.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.th.translations.rootName', def: 'root name', type: 'text'},
    { key: 'table.th.translations.rootValue', def: 'root value', type: 'text'},
    { key: 'table.th.translations.rootToTotal', def: '% / total', type: 'text'},
    { key: 'table.th.translations.branchName', def: 'branch name', type: 'text'},
    { key: 'table.th.translations.branchValue', def: 'branch value', type: 'text'},
    { key: 'table.th.translations.branchToRoot', def: '% / root', type: 'text'},
    { key: 'table.th.translations.branchToTotal', def: '% / total', type: 'text'},
    { key: 'table.th.translations.nutName', def: 'nut name', type: 'text'},
    { key: 'table.th.translations.nutValue', def: 'nut value', type: 'text'},
    { key: 'table.th.translations.nutToBranch', def: '% / branch', type: 'text'},
    { key: 'table.th.translations.nutToRoot', def: '% / root', type: 'text'},
    { key: 'table.th.translations.nutToTotal', def: '% / total', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'table.td.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'translations.total', def: 'Total', type: 'text'},
    { key: 'translations.proportionToTree', def: 'of grand total', type: 'text'},
    { key: 'translations.of', def: 'of', type: 'text'}
])

const config = computed(() => {
    return {
        ...convertArrayToObject(model.value),
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
    }
});

const step = ref(0)

function selectRoot(root) {
    console.log({root})
}

function selectBranch(branch) {
    console.log({ branch })
}

function selectNut(nut) {
    console.log( { nut })
}

</script>

<template>
<Box>
    <template #title>VueUiChestnut</template>

    <template #local>
        <LocalVueUiChestnut :dataset="dataset" :config="config" :key="`local_${step}`" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut">
            <template #svg="{ svg }">
                <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
            </template>
            <template #legend="{ legend }">
                #LEGEND
                <div style="font-size: 8px">
                    {{ legend }}
                </div>
            </template>
        </LocalVueUiChestnut>
    </template>
    
    <template #VDUI-local>
        <LocalVueDataUi component="VueUiChestnut" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut">
            <template #svg="{ svg }">
                <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
            </template>
            <template #legend="{ legend }">
                #LEGEND
                <div style="font-size: 8px">
                    {{ legend }}
                </div>
            </template>
        </LocalVueDataUi>
    </template>
    
    <template #build>
        <VueUiChestnut :dataset="dataset" :config="config" :key="`build_${step}`" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut">
            <template #svg="{ svg }">
                <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
            </template>
            <template #legend="{ legend }">
                #LEGEND
                <div style="font-size: 8px">
                    {{ legend }}
                </div>
            </template>
        </VueUiChestnut>
    </template>
    
    <template #VDUI-build>
        <VueDataUi component="VueUiChestnut" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut">
            <template #svg="{ svg }">
                <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
            </template>
            <template #legend="{ legend }">
                #LEGEND
                <div style="font-size: 8px">
                    {{ legend }}
                </div>
            </template>
        </VueDataUi>
    </template>

    <template #knobs>
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type" :min="knob.min ?? 0"
                            :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
                        <select v-if="knob.type === 'select'" v-model="knob.def" @change="step += 1">
                            <option v-for="opt in knob.options">{{ opt }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </template>

        <template #config>
            {{ config }}
        </template>
</Box>
</template>
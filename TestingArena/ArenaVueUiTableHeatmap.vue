<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiTableHeatmap from '../src/components/vue-ui-table-heatmap.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
    {
        name: "Serie 1",
        values: [20, 30, 40, 50, 40, 30, 20,],
        color: '#1f77b4',
        shape: 'circle'
    },
    {
        name: "Serie 2",
        values: [30, 40, 50, 60, 50, 40, 30,],
        color: '#aec7e8',
        shape: 'triangle'
    },
    {
        name: "Serie 3",
        values: [40, 50, 60, 70, 60, 50, 40,],
        color: '#ff7f0e',
        shape: 'diamond'
    },
    {
        name: "Serie 4",
        values: [50, 60, 70, 80, 70, 60, 50,],
        color: '#ffbb78',
        shape: 'hexagon'
    },
    {
        name: "Serie 5",
        values: [60, 70, 80, 90, 80, 70, 60,],
        color: '#2ca02c',
        shape: 'star'
    },
]);

onMounted(() => {
    setTimeout(() => {
        dataset.value[0].values.push(100)
    }, 3000)
})

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},
    
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.shapeSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'style.heatmapColors.useIndividualScale', def: false, type: 'checkbox'},
    { key: 'style.heatmapColors.min', def: '#FFFFFF', type: 'color'},
    { key: 'style.heatmapColors.max', def: '#5F8BEE', type: 'color'},
    { key: 'table.responsiveBreakpoint', def: 300, type: 'number', min: 300, max: 800},
    { key: 'table.borderWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'table.showSum', def: true, type: 'checkbox'},
    { key: 'table.showAverage', def: true, type: 'checkbox'},
    { key: 'table.showMedian', def: true, type: 'checkbox'},
    { key: 'table.head.backgroundColor', def: '#FFFFFF', type: 'color'},
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

const config = computed(() => {
    const c = convertArrayToObject(model.value)
    return {
        ...c,
        theme: currentTheme.value,
        table: {
            ...c.table,
            head: {
                ...c.table.head,
                values: ["A", "B", "C", "D", "E", "F", "G", "H", "TOT.", "AVG.", "MED."]
            }
        }
    }
})

const step = ref(0)

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <Box>
        <template #title>VueUiTableHeatmap</template>

        <template #local>
            <LocalVueUiTableHeatmap :dataset="dataset" :config="config" :key="`local_${step}`">

                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
                
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
                
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #caption>
                    <div style="width: 100%; height: 40px" class="pb-8 font-black text-2xl text-left pl-2">
                        TITLE
                    </div>
                </template>

                <template #head="{ value, rowIndex, type }">
                    {{ value }}
                </template>

                <template #rowTitle="{ value, rowIndex, colIndex, type, isResponsive }">
                    <div :style="`height: 40px; display: flex; align-items:center; justify-content: flex-start; padding: 0 6px;font-weight:${isResponsive ? 'bold' : 'normal'}`"
                        class="bg-gray-200 dark:bg-[#2A2A2A] w-full">
                        {{ value }}
                    </div>
                </template>
                <template #cell="{ value, rowIndex, colIndex, type, color, textColor }">
                    <div :style="`height: 40px; display: flex; align-items:center; justify-content: flex-end; padding: 0 6px;background:${color};color:${textColor}`"
                        class="relative">
                        {{ value }}
                    </div>
                </template>
                <template #sum="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value }}
                    </div>
                </template>
                <template #average="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value.toFixed(1) }}
                    </div>
                </template>
                <template #median="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value.toFixed(1) }}
                    </div>
                </template>
            </LocalVueUiTableHeatmap>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiTableHeatmap" :dataset="dataset" :config="config" :key="`vdui_local_${step}`">
                <template #caption>
                    <div style="width: 100%; height: 40px" class="pb-8 font-black text-2xl text-left pl-2">
                        TITLE
                    </div>
                </template>

                <template #head="{ value, rowIndex, type }">
                    {{ value }}
                </template>

                <template #rowTitle="{ value, rowIndex, colIndex, type, isResponsive }">
                    <div :style="`height: 40px; display: flex; align-items:center; justify-content: flex-start; padding: 0 6px;font-weight:${isResponsive ? 'bold' : 'normal'}`"
                        class="bg-gray-200 dark:bg-[#2A2A2A] w-full">
                        {{ value }}
                    </div>
                </template>
                <template #cell="{ value, rowIndex, colIndex, type, color, textColor }">
                    <div :style="`height: 40px; display: flex; align-items:center; justify-content: flex-end; padding: 0 6px;background:${color};color:${textColor}`"
                        class="relative">
                        {{ value }}
                    </div>
                </template>
                <template #sum="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value }}
                    </div>
                </template>
                <template #average="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value.toFixed(1) }}
                    </div>
                </template>
                <template #median="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value.toFixed(1) }}
                    </div>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiTableHeatmap :dataset="dataset" :config="config" :key="`build_${step}`">
                <template #caption>
                    <div style="width: 100%; height: 40px" class="pb-8 font-black text-2xl text-left pl-2">
                        TITLE
                    </div>
                </template>

                <template #head="{ value, rowIndex, type }">
                    {{ value }}
                </template>

                <template #rowTitle="{ value, rowIndex, colIndex, type, isResponsive }">
                    <div :style="`height: 40px; display: flex; align-items:center; justify-content: flex-start; padding: 0 6px;font-weight:${isResponsive ? 'bold' : 'normal'}`"
                        class="bg-gray-200 dark:bg-[#2A2A2A] w-full">
                        {{ value }}
                    </div>
                </template>
                <template #cell="{ value, rowIndex, colIndex, type, color, textColor }">
                    <div :style="`height: 40px; display: flex; align-items:center; justify-content: flex-end; padding: 0 6px;background:${color};color:${textColor}`"
                        class="relative">
                        {{ value }}
                    </div>
                </template>
                <template #sum="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value }}
                    </div>
                </template>
                <template #average="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value.toFixed(1) }}
                    </div>
                </template>
                <template #median="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value.toFixed(1) }}
                    </div>
                </template>
            </VueUiTableHeatmap>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiTableHeatmap" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
                <template #caption>
                    <div style="width: 100%; height: 40px" class="pb-8 font-black text-2xl text-left pl-2">
                        TITLE
                    </div>
                </template>

                <template #head="{ value, rowIndex, type }">
                    {{ value }}
                </template>

                <template #rowTitle="{ value, rowIndex, colIndex, type, isResponsive }">
                    <div :style="`height: 40px; display: flex; align-items:center; justify-content: flex-start; padding: 0 6px;font-weight:${isResponsive ? 'bold' : 'normal'}`"
                        class="bg-gray-200 dark:bg-[#2A2A2A] w-full">
                        {{ value }}
                    </div>
                </template>
                <template #cell="{ value, rowIndex, colIndex, type, color, textColor }">
                    <div :style="`height: 40px; display: flex; align-items:center; justify-content: flex-end; padding: 0 6px;background:${color};color:${textColor}`"
                        class="relative">
                        {{ value }}
                    </div>
                </template>
                <template #sum="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value }}
                    </div>
                </template>
                <template #average="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value.toFixed(1) }}
                    </div>
                </template>
                <template #median="{ value }">
                    <div style="height:40px; display: flex; text-align:center; align-items:center; justify-content: flex-end; padding: 0 6px;"
                        class="bg-gray-200 dark:bg-[#2A2A2A]">
                        {{ value.toFixed(1) }}
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
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type"
                            :min="knob.min ?? 0" :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
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
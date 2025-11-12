<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiRelationCircle from '../src/components/vue-ui-relation-circle.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

import { VueUiRelationCircle } from "vue-data-ui";
import { VueUiRelationCircle as VueUiRelationCircleTreeshaken } from "vue-data-ui/vue-ui-relation-circle";

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
    {
        id: "01",
        label: "Lorem",
        relations: ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
        weights: [5, 3, 20, 2, 9, 3, 1, 2, 3, 7, 1],
    },
    {
        id: "02",
        label: "Ipsum",
        relations: ["01", "03"],
        weights: [3, 2],
    },
    {
        id: "03",
        label: "Dolor",
        relations: ["01", "02"],
        weights: [2, 5],
    },
    {
        id: "04",
        label: "Consectetur",
        relations: ["01", "05", "10"],
        weights: [3, 1, 4],
    },
    {
        id: "05",
        label: "Amet",
        relations: ["01", "04", "07", "10"],
        weights: [2, 3, 4, 5],
    },
    {
        id: "06",
        label: "Rherum",
        relations: ["01", "02"],
        weights: [4, 1],
    },
    {
        id: "07",
        label: "Delecta",
        relations: ["01", "02", "08", "12"],
        weights: [4, 8, 2, 1],
    },
    {
        id: "08",
        label: "Nitimur",
        relations: ["01", "07", "12", "01"],
        weights: [7, 3, 2, 3],
    },
    {
        id: "09",
        label: "Vetitum",
        relations: ["01"],
        weights: [1],
    },
    {
        id: "10",
        label: "Monumentum",
        relations: ["01", "04", "05"],
        weights: [4, 1, 4],
    },
    {
        id: "11",
        label: "Aere",
        relations: ["01"],
        weights: [3],
    },
    {
        id: "12",
        label: "Perennius",
        relations: ["01", "07", "08"],
        weights: [8, 1, 1],
    }
]
    }, 2000);
})

const model = ref([
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'responsiveProportionalSizing', def: false, type: 'checkbox'},

    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },
    
    { key: 'style.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.size', def: 400, type: 'number', min: 100, max: 1000},
    { key: 'style.limit', def: 50, type: 'range', min: 2, max: 100},
    { key: 'style.animation.show', def: true, type: 'checkbox'},
    { key: 'style.animation.speedMs', def: 300, type: 'number', min: 0, max: 1000},
    { key: 'style.labels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.labels.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.links.curved', def: false, type: 'checkbox'},
    { key: 'style.links.maxWidth', def: 5, type: 'number', min: 0, max: 100},
    
    { key: 'style.circle.radiusProportion', def: 0.2, type: 'number', min: 0.1, max: 1, step: 0.01},
    { key: 'style.circle.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.circle.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.circle.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.plot.radius', def: 2, type: 'number', min: 0, max: 24},
    { key: 'style.plot.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.title.bold', def: true, type: 'checkbox'},
    { key: 'style.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.title.subtitle.bold', def: false, type: 'checkbox' },
])

const themeOptions = ref([
    "",
    "dark",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[1]);

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        events: {
            datapointEnter: ({ datapoint, seriesIndex }) => {
                console.log('enter event', { datapoint, seriesIndex });
            },
            datapointLeave: ({ datapoint, seriesIndex }) => {
                console.log('leave event', { datapoint, seriesIndex });
            },
            datapointClick: ({ datapoint, seriesIndex }) => {
                console.log('click event', { datapoint, seriesIndex });
            },
        },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        style: {
            ...c.style,
            // weightLabels: {
            //     formatter: ({ value, config }) =>{
            //         console.log(value, config);
            //         return value
            //     }
            // }
        }
    }
})

const step = ref(0)

const local = ref(null)

onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiRelationCircle :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
        <!-- <template #dataLabel="{ x,y,color,weight }">
            <circle :cx="x" :cy="y" r="12" :fill="color"/>
        </template> -->
        <!-- <template #chart-background>
            <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
        </template> -->
        <template #watermark="{ isPrinting }">
            <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                WATERMARK
            </div>
        </template>
        <template #source>
            <div style="width:100%;font-size:10px;text-align:left">
                SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
            </div>
        </template>
    </LocalVueUiRelationCircle>
    </div>

    <Box comp="VueUiRelationCircle" :dataset="dataset">
        <template #title>VueUiRelationCircle</template>

        <template #theme>
            <LocalVueUiRelationCircle :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiRelationCircle :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>  
            </LocalVueUiRelationCircle>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiRelationCircle" :dataset="dataset" :config="config"
                :key="`vdui_local_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiRelationCircle :dataset="dataset" :config="config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </VueUiRelationCircle>
        </template>

        <template #build-treesh>
            <VueUiRelationCircleTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </VueUiRelationCircleTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiRelationCircle" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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
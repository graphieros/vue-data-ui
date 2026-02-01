<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiRelationCircle from '../src/components/vue-ui-relation-circle.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiRelationCircle } from "vue-data-ui";
import { VueUiRelationCircle as VueUiRelationCircleTreeshaken } from "vue-data-ui/vue-ui-relation-circle";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { vue_ui_relation_circle: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

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

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("responsiveProportionalSizing", { def: false }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),
    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.color", { def: "#1A1A1A" }),
    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    TEXT("style.fontFamily", { def: "inherit" }),
    NUMBER("style.size", { def: 400, min: 100, max: 1000 }),
    RANGE("style.limit", { def: 50, min: 2, max: 100 }),
    CHECKBOX("style.animation.show", { def: true }),
    NUMBER("style.animation.speedMs", { def: 300, min: 0, max: 1000 }),
    COLOR("style.labels.color", { def: "#1A1A1A" }),
    NUMBER("style.labels.fontSize", { def: 14, min: 8, max: 48 }),
    CHECKBOX("style.links.curved", { def: false }),
    NUMBER("style.links.maxWidth", { def: 5, min: 0, max: 100 }),
    NUMBER("style.circle.radiusProportion", { def: 0.2, min: 0.1, max: 1, step: 0.01 }),
    COLOR("style.circle.stroke", { def: "#CCCCCC" }),
    NUMBER("style.circle.strokeWidth", { def: 1, min: 0, max: 12 }),
    NUMBER("style.circle.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.plot.radius", { def: 2, min: 0, max: 24 }),
    COLOR("style.plot.color", { def: "#1A1A1A" }),
    TEXT("style.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.title.bold", { def: true }),
    COLOR("style.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.title.subtitle.bold", { def: false })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        // skeletonConfig: {
        //     style: {
        //         backgroundColor: '#FF0000'
        //     }
        // },
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

    <Box comp="VueUiRelationCircle" :dataset="dataset" :config="config">
        <template #title>VueUiRelationCircle</template>

        <template #responsive>
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
        </template>

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

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>
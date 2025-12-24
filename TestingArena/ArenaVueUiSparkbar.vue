<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiSparkbar from '../src/components/vue-ui-sparkbar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiSparkbar } from "vue-data-ui";
import { VueUiSparkbar as VueUiSparkbarTreeshaken } from "vue-data-ui/vue-ui-sparkbar";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_sparkbar: DEFAULT_CONFIG } = useConfig();

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
                name: "quality",
                value: 200,
                rounding: 2,
                suffix: "%",
                prefix: 'P',
                target: 1000,
                // formatter: ({value, config}) => {
                //     return `f1 - ${value}`
                // }
            },
            {
                name: "popularity",
                value: 2.0412,
                rounding: 2,
                suffix: "%",
                prefix: 'P',
                target: 2.3,
                // formatter: ({value}) => {
                //     return `f2 - ${value}`
                // }
            },
            {
                name: "maintenance",
                value: 33.3291,
                rounding: 2,
                suffix: "%",
                prefix: 'P'
            },
        ]
    }, 2000);
})

function addDatapoint() {
    dataset.value.push({
        name: 'additional',
        value: Math.random() * 100,
        rounding: 0,
        target: 100,
        formatter: ({value}) => {
            return `f - ${value}`
        }
    })
}

const alternateDataset = ref([
{
        name: "alternate",
        value: 50,
        rounding: 2,
        suffix: "ALT",
        prefix: ''
    },
])

const alternateConfig = ref({
    style: {
        backgroundColor: '#CCCCCC',
            title: {
                text: 'Alternate',
                backgroundColor: '#FF0000'
            }
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    COLOR("style.backgroundColor", { def: "#FFFFFF20" }),
    TEXT("style.fontFamily", { def: "inherit" }),
    CHECKBOX("style.animation.show", { def: true }),
    NUMBER("style.animation.animationFrames", { def: 60, min: 0, max: 300 }),
    CHECKBOX("style.layout.independant", { def: true }),
    CHECKBOX("style.layout.percentage", { def: true }),
    NUMBER("style.layout.target", { def: 200, min: 50, max: 200 }),
    CHECKBOX("style.layout.showTargetValue", { def: true }),
    TEXT("style.layout.targetValueText", { def: "Target" }),
    COLOR("style.gutter.backgroundColor", { def: "#e1e5e8" }),
    RANGE("style.gutter.opacity", { def: 100, min: 0, max: 100 }),
    CHECKBOX("style.bar.gradient.show", { def: true }),
    RANGE("style.bar.gradient.intensity", { def: 40, min: 0, max: 100 }),
    COLOR("style.bar.gradient.underlayerColor", { def: "#FFFFFF" }),
    NUMBER("style.labels.fontSize", { def: 16, min: 8, max: 48 }),
    SELECT("style.labels.name.position", ["left", "top", "top-left", "top-center", "top-right", "right"], { def: "top-left" }),
    TEXT("style.labels.name.width", { def: "100%" }),
    COLOR("style.labels.name.color", { def: "#1A1A1A" }),
    CHECKBOX("style.labels.name.bold", { def: false }),
    CHECKBOX("style.labels.value.show", { def: true }),
    CHECKBOX("style.labels.value.bold", { def: true }),
    COLOR("style.title.backgroundColor", { def: "#FFFFFF" }),
    TEXT("style.title.margin", { def: "0 auto" }),
    SELECT("style.title.textAlign", ["left", "center", "right"], { def: "left" }),
    TEXT("style.title.text", { def: "Lorem ipsum dolor sic amet" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.title.bold", { def: true }),
    TEXT("style.title.subtitle.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.title.subtitle.color", { def: "#A1A1A1" }),
    RANGE("style.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.title.subtitle.bold", { def: false }),
    NUMBER("style.gap", { def: 4, min: 0, max: 24 })
]);


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
    const c = {
        ...convertArrayToObject(model.value),
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
    }

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
        }
    }
});

const step = ref(0)

const showTitleSlot = ref(false);

</script>

<template>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="addDatapoint">ADD DATAPOINT</button>

    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <div style="color:white">
        <input type="checkbox" v-model="showTitleSlot" id="toggle-title-slot"/>
        <label for="toggle-title-slot">Toggle title slot</label>
    </div>

    <Box comp="VueUiSparkbar" :dataset="dataset" :config="config"> 
        <template #title>VueUiSparkbar</template>
        
        <template #theme>
            <LocalVueUiSparkbar :dataset="dataset" :config="configTheme" />
        </template>
        
        <template #local>
            <LocalVueUiSparkbar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>

                <template #title="{ title }" v-if="showTitleSlot">
                    <div style="width:100%;">
                        {{ title.title }}
                        {{ title.subtitle }}
                    </div>
                </template>

                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>

                <!-- <template #data-label="{ bar }">
                    <div style="width:100%">
                        {{ bar.name }}: {{ bar.valueLabel }} to {{ bar.targetLabel }}
                    </div>
                </template> -->
            </LocalVueUiSparkbar>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSparkbar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`">
                <template #title="{ title }" v-if="showTitleSlot">
                    <div style="width:100%;">
                        {{ title.title }}
                        {{ title.subtitle }}
                    </div>
                </template>

                <!-- <template #data-label="{ bar }">
                    <div style="width:100%">
                        {{ bar.name }}: {{ bar.valueLabel }} to {{ bar.targetLabel }}
                    </div>
                </template> -->
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiSparkbar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #title="{ title }" v-if="showTitleSlot">
                    <div style="width:100%;">
                        {{ title.title }}
                        {{ title.subtitle }}
                    </div>
                </template>

                <!-- <template #data-label="{ bar }">
                    <div style="width:100%">
                        {{ bar.name }}: {{ bar.valueLabel }} to {{ bar.targetLabel }}
                    </div>
                </template> -->
            </VueUiSparkbar>
        </template>
        
        <template #build-treesh>
            <VueUiSparkbarTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #title="{ title }" v-if="showTitleSlot">
                    <div style="width:100%;">
                        {{ title.title }}
                        {{ title.subtitle }}
                    </div>
                </template>

                <!-- <template #data-label="{ bar }">
                    <div style="width:100%">
                        {{ bar.name }}: {{ bar.valueLabel }} to {{ bar.targetLabel }}
                    </div>
                </template> -->
            </VueUiSparkbarTreeshaken>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiSparkbar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
                <template #title="{ title }" v-if="showTitleSlot">
                    <div style="width:100%;">
                        {{ title.title }}
                        {{ title.subtitle }}
                    </div>
                </template>

                <!-- <template #data-label="{ bar }">
                    <div style="width:100%">
                        {{ bar.name }}: {{ bar.valueLabel }} to {{ bar.targetLabel }}
                    </div>
                </template> -->
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>
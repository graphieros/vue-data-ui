<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiSparkbar from '../src/components/vue-ui-sparkbar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

import { VueUiSparkbar } from "vue-data-ui";
import { VueUiSparkbar as VueUiSparkbarTreeshaken } from "vue-data-ui/vue-ui-sparkbar";

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

const model = ref([
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'style.backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.animation.show', def:  true, type: 'checkbox'},
    { key: 'style.animation.animationFrames', def: 60, type: 'number', min: 0, max: 300},
    { key: 'style.layout.independant', def: true, type: 'checkbox'},
    { key: 'style.layout.percentage', def: true, type: 'checkbox'},
    { key: 'style.layout.target', def: 200, type: 'number', min: 50, max: 200},
    { key: 'style.layout.showTargetValue', def: true, type: 'checkbox'},
    { key: 'style.layout.targetValueText', def: 'Target', type: 'text'},
    { key: 'style.gutter.backgroundColor', def: '#e1e5e8', type: 'color'},
    { key: 'style.gutter.opacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.bar.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.bar.gradient.intensity', def: 40, type: 'range', min: 0, max: 100},
    { key: 'style.bar.gradient.underlayerColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.labels.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.labels.name.position', def: 'top-left', type: 'select', options: ['left', 'top', 'top-left', 'top-center', 'top-right', 'right']},
    { key: 'style.labels.name.width', def: '100%', type: 'text'},
    { key: 'style.labels.name.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.labels.name.bold', def: false, type: 'checkbox'},
    { key: 'style.labels.value.show', def: true, type: 'checkbox'},
    { key: 'style.labels.value.bold', def: true, type: 'checkbox'},
    { key: 'style.title.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.title.margin', def: '0 auto', type: 'text'},
    { key: 'style.title.textAlign', def: 'left', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.title.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.title.bold', def: true, type: 'checkbox'},
    { key: 'style.title.subtitle.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.title.subtitle.color', def: '#A1A1A1', type: 'color'},
    { key: 'style.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'style.gap', def: 4, type: 'number', min: 0, max: 24}
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

    <Box comp="VueUiSparkbar" :dataset="dataset"> 
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
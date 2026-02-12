<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiBump from '../src/components/vue-ui-bump.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import { treeShake } from "../src/lib";
import { useArena } from "../src/useArena";
import { VueUiBump } from "vue-data-ui"; 
import { VueUiBump as VueUiBumpTreeshaken } from "vue-data-ui/vue-ui-bump";
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels, toggleStack } = useArena();
const { vue_ui_bump: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

function makeDs(n) {
    const arr = [];
    for (let i = 0; i < n; i += 1) {
        arr.push(Math.random() * 1000);
    }
    return arr;
}

const dataset = ref([
        {
            name: 'Series A with\n a long name',
            values: makeDs(12)
        },
        {
            name: 'Series B',
            values: makeDs(12)
        },
        {
            name: 'Series C',
            values: makeDs(12)
        },
        {
            name: 'Series D',
            values: makeDs(12)
        },
        {
            name: 'Series E',
            values: makeDs(12)
        },
    ]);

// const dataset = ref([
//     { name: 'Series A', values: [200, null, 2, 3, null, 4, 6, 6]},
//     { name: 'Series B', values: [null, 2, 2, 3, null, 4, 6, 3]},
// ])

// onMounted(() => {
//     dataset.value = [
//         {
//             name: 'Series A',
//             values: makeDs(12)
//         },
//         {
//             name: 'Series B',
//             values: makeDs(12)
//         },
//         {
//             name: 'Series C',
//             values: makeDs(12)
//         },
//         {
//             name: 'Series D',
//             values: makeDs(12)
//         },
//         {
//             name: 'Series E',
//             values: makeDs(12)
//         },
//     ]
// });

const model = createModel([
    CHECKBOX('debug', { def: true }),
    CHECKBOX('loading', { def: false }),
    SELECT('userOptions.position', ['left', 'right'], { def: 'right' }),
    CHECKBOX('responsive', { def: false }),
    SELECT('theme', ['', 'zen', 'hack', 'concrete'], { def: '' }),
    CHECKBOX('useCssAnimation', { def: true }),

    CHECKBOX('userOptions.useCursorPointer', { def:  false }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.height", { def: 500, min: 200, max: 1000 }),
    NUMBER("style.chart.width", { def: 800, min: 200, max: 1000 }),
    NUMBER("style.chart.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.right", { def: 12, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 0, min: 0, max: 100 }),
    NUMBER("style.chart.padding.left", { def: 12, min: 0, max: 100 }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),
    SELECT("style.chart.title.textAlign", ["left", "center", "right"], { def: "center" }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),

    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 6 }),
    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    CHECKBOX('style.chart.layout.timeLabels.show', { def: true }),
    CHECKBOX('style.chart.layout.timeLabels.offsetY', { def: 0, min: -100, max: 100 }),
    NUMBER('style.chart.layout.timeLabels.rotation', { def: 0, min: -90, max: 90 }),
    NUMBER('style.chart.layout.timeLabels.fontSize', { def: 14, min: 8, max: 42 }),
    COLOR('style.chart.layout.timeLabels.color', { def: '#1A1A1A' }),
    CHECKBOX('style.chart.layout.timeLabels.bold', { def: false }),
    CHECKBOX('style.chart.layout.timeLabels.showOnlyFirstAndLast', { def: false }),
    CHECKBOX('style.chart.layout.timeLabels.showOnlyAtModulo', { def: false }),
    NUMBER('style.chart.layout.timeLabels.modulo', { def: 6, min: 1, max: 24 }),
    
    CHECKBOX('style.chart.layout.lines.smooth', { def: true }),
    NUMBER('style.chart.layout.lines.strokeWidth', { def: 4, min: 1, max: 12}),
    COLOR('style.chart.layout.lines.coatingColor', { def: '#FFFFFF' }),
    
    COLOR('style.chart.layout.plots.stroke', { def: '#FFFFFF' }),
    NUMBER('style.chart.layout.plots.strokeWidth', { def: 1, min: 1, max: 12}),
    NUMBER('style.chart.layout.plots.radius', { def: 12, min: 1, max: 24}),
    TEXT('style.chart.layout.plots.labels.color', { def: 'auto' }),
    CHECKBOX('style.chart.layout.plots.labels.show', { def: true }),
    CHECKBOX('style.chart.layout.plots.labels.bold', { def: true }),
    SELECT('style.chart.layout.plots.labels.displayedValue', ['value', 'rank'], { def: 'rank'}),
    NUMBER('style.chart.layout.plots.labels.fontSize', { def: 12, min: 1, max: 24}),
    TEXT('style.chart.layout.plots.labels.prefix', { def: ''}),
    TEXT('style.chart.layout.plots.labels.suffix', { def: 'S'}),
    NUMBER('style.chart.layout.plots.labels.rounding', { def: 0, min: 0, max: 6}),
    
    NUMBER('style.chart.layout.nameLabels.fontSize', { def: 14, min: 1, max: 24}),
    COLOR('style.chart.layout.nameLabels.color', { def: '#1A1A1A' }),
    CHECKBOX('style.chart.layout.nameLabels.useSerieColor', { def: false }),
    CHECKBOX('style.chart.layout.nameLabels.bold', { def: false }),
    NUMBER('style.chart.layout.nameLabels.offsetX', { def: 0, min: -100, max: 100 }),
    CHECKBOX('style.chart.layout.nameLabels.leftLabels.show', { def: true }),
    CHECKBOX('style.chart.layout.nameLabels.rightLabels.show', { def: true }),
]);

const timestamps = Array.from({ length: 12 }, (_, i) =>
    new Date(2026, 0, 1 + i).getTime()
);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return treeShake({
        defaultConfig: c,
        userConfig: {
            // skeletonConfig: {
            //     style: {
            //         chart: {
            //             backgroundColor: '#FF0000'
            //         }
            //     }
            // },
            userOptions: {
                buttons: {
                    altCopy: true
                },
                callbacks: {
                    altCopy: console.log
                }
            },
            events: {
                datapointEnter: ({ datapoint, seriesIndex }) => {
                    console.log('EVENT ENTER', { datapoint, seriesIndex });
                },
                // datapointLeave: ({ datapoint, seriesIndex }) => {
                //     console.log('EVENT LEAVE', { datapoint, seriesIndex });
                // },
                // datapointClick: ({ datapoint, seriesIndex }) => {
                //     console.log('EVENT CLICK', { datapoint, seriesIndex });
                // },
            },
            style: {
                chart: {
                    layout: {
                        timeLabels: {
                            values: timestamps,
                            datetimeFormatter: {
                                enable: true,
                                locale: 'fr',
                                useUTC: false,
                                januaryAsYear: true,
                                options: { 
                                    year: 'yyyy',
                                    month: `MMM`,
                                    day: 'dd MMM',
                                    hour: 'HH:mm',
                                    minute: 'HH:mm:ss',
                                    second: 'HH:mm:ss'
                                }
                            }
                        }
                    }
                }
            }
        }
    })
})

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

onMounted(async () => {
    if (local.value) {
        const d = await local.value.getData();
        console.log(d)
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


    <Box comp="VueUiBump" :dataset="dataset" :config="config">
        <template #title>VueUiBump</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiBump ref="resp" :dataset="dataset" :config="{ ...config, responsive: true }"/>
            </div>
        </template>

        <template #theme>
            <LocalVueUiBump :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiBump :dataset="dataset" :config="config" ref="local">
                <!-- <template #time-label="{x, y, content }">
                    <text :x="x" :y="y" fill="red" font-size="12">
                        {{content}}
                    </text>
                </template> -->
            </LocalVueUiBump>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiBump" :dataset="dataset" :config="config"/>
        </template>

        <template #build>
            <VueUiBump :dataset="dataset" :config="config"/>
        </template>

        <template #build-treesh>
            <VueUiBumpTreeshaken :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiBump" :dataset="dataset" :config="config"/>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" :open="summaryOpen"/>
        </template>
    </Box>
</template>
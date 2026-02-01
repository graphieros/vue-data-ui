<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiChestnut from '../src/components/vue-ui-chestnut.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiChestnut } from "vue-data-ui";
import { VueUiChestnut as VueUiChestnutTreeshaken } from "vue-data-ui/vue-ui-chestnut";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_chestnut: DEFAULT_CONFIG } = useConfig();

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

const ds = [
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
                    },
                    {
                        name: "break 1.1.2",
                        value: 25,
                    },
                    {
                        name: "break 1.1.3",
                        value: 25,
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
                    },
                    {
                        name: "break 1.2.2",
                        value: 20,
                    },
                    {
                        name: "break 1.2.3",
                        value: 70,
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
                    },
                    {
                        name: "break 1.3.2",
                        value: 10,
                    },
                    {
                        name: "break 1.3.3",
                        value: 75,
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
                    },
                    {
                        name: "break 2.1.2",
                        value: 25,
                    },
                    {
                        name: "break 2.1.3",
                        value: 25,
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
                    },
                    {
                        name: "break 2.2.2",
                        value: 10,
                    },
                    {
                        name: "break 2.2.3",
                        value: 150,
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
                    },
                    {
                        name: "break 2.3.2",
                        value: 20,
                    },
                    {
                        name: "break 2.3.3",
                        value: 25,
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
                    },
                    {
                        name: "break 3.1.2",
                        value: 10,
                    },
                    {
                        name: "break 3.1.3",
                        value: 10,
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
                    },
                    {
                        name: "break 3.2.2",
                        value: 30,
                    },
                    {
                        name: "break 3.2.3",
                        value: 40,
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
                    },
                    {
                        name: "break 3.3.2",
                        value: 200,
                    },
                    {
                        name: "break 3.3.3",
                        value: 100,
                    },
                ]
            }
        ]
    },
]

onMounted(() => {
    setTimeout(() => {
        dataset.value = ds;
    }, 2000)
})

const alternateDataset = ref([
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
                    },
                    {
                        name: "break 1.1.2",
                        value: 25,
                    },
                    {
                        name: "break 1.1.3",
                        value: 25,
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
                    },
                    {
                        name: "break 1.2.2",
                        value: 20,
                    },
                    {
                        name: "break 1.2.3",
                        value: 70,
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
                    },
                    {
                        name: "break 1.3.2",
                        value: 10,
                    },
                    {
                        name: "break 1.3.3",
                        value: 75,
                    },
                ]
            },

        ]
    },
])

const alternateConfig = ref({
    style: {
        chart: {
            backgroundColor: '#FF0000',
            layout: {
                title: {
                    text: 'Alternate'
                }
            }
        }
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value[0].branches[0].value = 500;
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: true }),

    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),

    CHECKBOX("style.chart.layout.grandTotal.show", { def: true }),
    NUMBER("style.chart.layout.grandTotal.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.layout.grandTotal.bold", { def: true }),
    TEXT("style.chart.layout.grandTotal.prefix", { def: "P" }),
    TEXT("style.chart.layout.grandTotal.suffix", { def: "S" }),
    NUMBER("style.chart.layout.grandTotal.roundingValue", { def: 2, min: 0, max: 12 }),
    COLOR("style.chart.layout.grandTotal.color", { def: "#1A1A1A" }),
    TEXT("style.chart.layout.grandTotal.text", { def: "Grand total" }),
    NUMBER("style.chart.layout.grandTotal.offsetY", { def: 0, min: -100, max: 100 }),

    COLOR("style.chart.layout.roots.stroke", { def: "#FFFFFF" }),
    RANGE("style.chart.layout.roots.strokeWidth", { def: 5, min: 0, max: 12 }),
    CHECKBOX("style.chart.layout.roots.useGradient", { def: true }),
    RANGE("style.chart.layout.roots.gradientIntensity", { def: 20, min: 0, max: 100 }),
    COLOR("style.chart.layout.roots.underlayerColor", { def: "#FFFFFF" }),

    CHECKBOX("style.chart.layout.roots.labels.show", { def: true }),
    RANGE("style.chart.layout.roots.labels.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.layout.roots.labels.adaptColorToBackground", { def: true }),
    COLOR("style.chart.layout.roots.labels.color", { def: "#FFFFFF" }),
    CHECKBOX("style.chart.layout.roots.labels.bold", { def: true }),
    NUMBER("style.chart.layout.roots.labels.roundingValue", { def: 2, min: 0, max: 12 }),
    TEXT("style.chart.layout.roots.labels.prefix", { def: "P" }),
    TEXT("style.chart.layout.roots.labels.suffix", { def: "S" }),

    COLOR("style.chart.layout.roots.labels.name.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.roots.labels.name.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.layout.roots.labels.name.bold", { def: true }),

    COLOR("style.chart.layout.verticalSeparator.stroke", { def: "#FFFFFF" }),
    RANGE("style.chart.layout.verticalSeparator.strokeWidth", { def: 5, min: 0, max: 24 }),

    RANGE("style.chart.layout.links.opacity", { def: 10, min: 0, max: 100 }),

    COLOR("style.chart.layout.branches.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.layout.branches.strokeWidth", { def: 0, min: 0, max: 12 }),
    RANGE("style.chart.layout.branches.borderRadius", { def: 6, min: 0, max: 24 }),
    CHECKBOX("style.chart.layout.branches.useGradient", { def: true }),
    RANGE("style.chart.layout.branches.gradientIntensity", { def: 20, min: 0, max: 100 }),
    COLOR("style.chart.layout.branches.underlayerColor", { def: "#FFFFFF" }),
    RANGE("style.chart.layout.branches.widthRatio", { def: 1.5, min: 0.1, max: 2, step: 0.01 }),

    CHECKBOX("style.chart.layout.branches.labels.show", { def: true }),
    RANGE("style.chart.layout.branches.labels.fontSize", { def: 14, min: 8, max: 48 }),
    COLOR("style.chart.layout.branches.labels.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.layout.branches.labels.bold", { def: true }),

    CHECKBOX("style.chart.layout.branches.labels.dataLabels.show", { def: true }),
    NUMBER("style.chart.layout.branches.labels.dataLabels.hideUnderValue", { def: 5, min: 1, max: 20 }),
    RANGE("style.chart.layout.branches.labels.dataLabels.fontSize", { def: 14, min: 8, max: 48 }),
    NUMBER("style.chart.layout.branches.labels.dataLabels.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.layout.branches.labels.dataLabels.roundingPercentage", { def: 2, min: 0, max: 12 }),
    TEXT("style.chart.layout.branches.labels.dataLabels.prefix", { def: "P" }),
    TEXT("style.chart.layout.branches.labels.dataLabels.suffix", { def: "S" }),

    NUMBER("style.chart.layout.nuts.offsetX", { def: 20, min: -100, max: 100 }),
    CHECKBOX("style.chart.layout.nuts.useGradient", { def: true }),
    RANGE("style.chart.layout.nuts.gradientIntensity", { def: 30, min: 0, max: 100 }),

    CHECKBOX("style.chart.layout.nuts.selected.useMotion", { def: true }),
    CHECKBOX("style.chart.layout.nuts.selected.useGradient", { def: true }),
    RANGE("style.chart.layout.nuts.selected.gradientIntensity", { def: 40, min: 0, max: 100 }),
    NUMBER("style.chart.layout.nuts.selected.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.layout.nuts.selected.roundingPercentage", { def: 2, min: 0, max: 12 }),

    NUMBER("style.chart.layout.nuts.selected.labels.dataLabels.hideUnderValue", { def: 5, min: 1, max: 20 }),
    COLOR("style.chart.layout.nuts.selected.labels.dataLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.nuts.selected.labels.dataLabels.fontSize", { def: 12, min: 8, max: 48 }),
    CHECKBOX("style.chart.layout.nuts.selected.labels.dataLabels.bold", { def: true }),
    TEXT("style.chart.layout.nuts.selected.labels.dataLabels.prefix", { def: "P" }),
    TEXT("style.chart.layout.nuts.selected.labels.dataLabels.suffix", { def: "S" }),

    COLOR("style.chart.layout.nuts.selected.labels.core.total.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.nuts.selected.labels.core.total.fontSize", { def: 24, min: 8, max: 48 }),
    CHECKBOX("style.chart.layout.nuts.selected.labels.core.total.bold", { def: false }),

    COLOR("style.chart.layout.nuts.selected.labels.core.value.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.nuts.selected.labels.core.value.fontSize", { def: 24, min: 8, max: 48 }),
    CHECKBOX("style.chart.layout.nuts.selected.labels.core.value.bold", { def: true }),
    TEXT("style.chart.layout.nuts.selected.labels.core.value.prefix", { def: "P" }),
    TEXT("style.chart.layout.nuts.selected.labels.core.value.suffix", { def: "S" }),

    NUMBER("style.chart.layout.legend.fontSize", { def: 16, min: 8, max: 48 }),
    COLOR("style.chart.layout.legend.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.legend.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.layout.legend.roundingPercentage", { def: 2, min: 0, max: 12 }),
    TEXT("style.chart.layout.legend.prefix", { def: "P" }),
    TEXT("style.chart.layout.legend.suffix", { def: "S" }),

    COLOR("style.chart.layout.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.layout.title.fontSize", { def: 20, min: 8, max: 48 }),
    TEXT("style.chart.layout.title.text", { def: "Lorem ipsum dolor sic amet" }),
    CHECKBOX("style.chart.layout.title.bold", { def: true }),
    NUMBER("style.chart.layout.title.offsetY", { def: 0, min: -100, max: 100 }),

    TEXT("style.chart.layout.title.subtitle.text", { def: "Lorem ipsum dolor sic amet" }),
    COLOR("style.chart.layout.title.subtitle.color", { def: "#CCCCCC" }),
    CHECKBOX("style.chart.layout.title.subtitle.bold", { def: false }),
    NUMBER("style.chart.layout.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    NUMBER("style.chart.layout.title.subtitle.offsetY", { def: 0, min: -100, max: 100 }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),

    TEXT("table.th.translations.rootName", { def: "root name" }),
    TEXT("table.th.translations.rootValue", { def: "root value" }),
    TEXT("table.th.translations.rootToTotal", { def: "% / total" }),
    TEXT("table.th.translations.branchName", { def: "branch name" }),
    TEXT("table.th.translations.branchValue", { def: "branch value" }),
    TEXT("table.th.translations.branchToRoot", { def: "% / root" }),
    TEXT("table.th.translations.branchToTotal", { def: "% / total" }),
    TEXT("table.th.translations.nutName", { def: "nut name" }),
    TEXT("table.th.translations.nutValue", { def: "nut value" }),
    TEXT("table.th.translations.nutToBranch", { def: "% / branch" }),
    TEXT("table.th.translations.nutToRoot", { def: "% / root" }),
    TEXT("table.th.translations.nutToTotal", { def: "% / total" }),

    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("table.td.roundingPercentage", { def: 2, min: 0, max: 12 }),

    TEXT("translations.total", { def: "Total" }),
    TEXT("translations.proportionToTree", { def: "of grand total" }),
    TEXT("translations.of", { def: "of" })
]);

const{ themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        // skeletonConfig: {
        //     style: {
        //         chart: {
        //             backgroundColor: '#FF0000'
        //         }
        //     }
        // },
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                layout: {
                    ...c.style.chart.layout,
                    grandTotal: {
                        ...c.style.chart.layout.grandTotal,
                        formatter: ({value}) => {
                            return `tot - ${value}`
                        }
                    },
                    roots: {
                        ...c.style.chart.layout.roots,
                        labels: {
                            ...c.style.chart.layout.roots.labels,
                            formatter: ({value, config }) => {
                                // console.log({config})
                                return `root - ${value}`
                            }
                        }
                    },
                    branches: {
                        ...c.style.chart.layout.branches,
                        labels: {
                            ...c.style.chart.layout.branches.labels,
                            dataLabels: {
                                ...c.style.chart.layout.branches.labels.dataLabels,
                                formatter: ({value}) => {
                                    return `branch - ${value}`
                                }
                            }
                        }
                    },
                    nuts: {
                        ...c.style.chart.layout.nuts,
                        selected: {
                            ...c.style.chart.layout.nuts.selected,
                            labels: {
                                ...c.style.chart.layout.nuts.selected.labels,
                                dataLabels: {
                                    ...c.style.chart.layout.nuts.selected.labels.dataLabels,
                                    formatter: ({value}) => {
                                        return `nut - ${value}`
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        theme: currentTheme.value,
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

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiChestnut :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
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
    </LocalVueUiChestnut>
    </div>

    <Box comp="VueUiChestnut" :dataset="dataset" :config="config">
        <template #title>VueUiChestnut</template>

        <template #theme>
            <LocalVueUiChestnut :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiChestnut :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
            </LocalVueUiChestnut>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiChestnut" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiChestnut :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
            </VueUiChestnut>
        </template>
        
        <template #build-treesh>
            <VueUiChestnutTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
            </VueUiChestnutTreeshaken>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiChestnut" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>
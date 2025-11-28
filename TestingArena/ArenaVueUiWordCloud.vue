<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiWordCloud from '../src/components/vue-ui-word-cloud.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { createWordCloudDatasetFromPlainText } from "vue-data-ui";
import { useArena } from "../src/useArena";
import { VueUiWordCloud } from "vue-data-ui";
import { VueUiWordCloud as VueUiWordCloudTreeshaken } from "vue-data-ui/vue-ui-word-cloud";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_word_cloud: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const longText = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pulvinar pretium venenatis. Donec imperdiet elit id porttitor tristique. Aenean ac commodo justo. Vestibulum placerat molestie nisl, sit amet lacinia nulla posuere quis. Aenean ullamcorper eu ex vitae facilisis. Aliquam erat volutpat. Proin nunc felis, porttitor quis commodo lacinia, gravida sed orci. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus mattis vitae tellus ac luctus. Vestibulum faucibus sem nec varius eleifend. In gravida venenatis ipsum sit amet ultricies. Nam efficitur, dui ac imperdiet vestibulum, justo metus consectetur libero, posuere tempor neque magna vitae augue. Etiam gravida massa quis turpis vulputate, ac tempus nisi imperdiet. Donec at laoreet ligula. Nulla id ex sagittis, tincidunt lectus ut, gravida mauris. Nulla consectetur semper sem. Maecenas lacinia facilisis ex, lobortis lacinia orci ornare tristique. Nam quis erat a nunc vehicula finibus. Quisque vitae nibh condimentum, condimentum erat eu, finibus risus. Duis sodales orci vel ullamcorper ullamcorper. In hac habitasse platea dictumst. Vivamus tempus ut nulla id commodo. Cras lectus sem, porttitor id sem eu, posuere fringilla turpis. Integer pretium erat sed ipsum gravida ullamcorper. Nam facilisis metus non lorem congue imperdiet. Sed quis cursus eros. Pellentesque venenatis pellentesque turpis suscipit accumsan. Nam arcu quam, faucibus et arcu pretium, eleifend consequat lacus. Aliquam nec risus nec justo maximus ultricies at et velit. Nam at lacinia massa. Sed elit dolor, consequat in massa at, egestas accumsan ex. Aenean quis suscipit ipsum, ac condimentum eros. Sed eleifend nisi arcu, et iaculis mi semper quis. Mauris vel dui nisi. Fusce finibus lacus a tempus tristique. Sed molestie orci a velit facilisis ornare. Pellentesque ullamcorper sed velit ut iaculis. Fusce urna dolor, rutrum sit amet consequat et, vulputate a risus. Sed faucibus sem nec urna lobortis dapibus. Nam in nisl a dui euismod gravida non in erat. Cras lobortis vitae diam sed elementum. Sed cursus tempor enim, nec ornare sem facilisis non. Pellentesque euismod sit amet magna eget tempor. Proin tincidunt dignissim nulla vitae molestie. Proin gravida ac urna ut facilisis. Vestibulum sit amet ex non quam ornare scelerisque. Etiam pharetra magna neque. Cras maximus, ipsum at imperdiet interdum, nibh orci vulputate erat, vitae varius elit lectus sed nibh. Maecenas eget nulla ultricies, pharetra ante non, cursus risus. Mauris nec felis tincidunt, viverra lectus quis, feugiat tortor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Maecenas vitae pharetra leo. Vestibulum at accumsan ipsum, id pharetra dui. Pellentesque nibh purus, tincidunt a egestas in, dapibus quis nunc. Integer posuere tellus id mi tincidunt aliquet. Donec vel justo et eros eleifend tempor in in purus. Aenean id pellentesque nisl, eget vestibulum neque.Nulla ante mauris, posuere vel consequat vitae, suscipit id magna. In ipsum nisi, luctus quis interdum sagittis, condimentum at felis. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aenean interdum massa quis ullamcorper luctus. Duis efficitur mauris a eros porta ornare vitae nec urna. Fusce tincidunt purus sit amet urna convallis, ac molestie felis suscipit. Sed scelerisque orci vel velit suscipit, non posuere dui fermentum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum velit libero, commodo at fringilla at, congue ut felis. Nulla vestibulum a ligula vel luctus. Nam at nunc erat. Nam tincidunt porta lectus eget molestie. Cras quis placerat est. Donec tellus magna, sollicitudin ac efficitur sed, auctor eget dui. Fusce eget sem magna. Donec fermentum velit lorem, quis suscipit odio posuere eu. Proin nunc arcu, pretium id gravida ut, mattis non erat. Aenean eu nisl et ligula pulvinar hendrerit. Pellentesque pharetra hendrerit sodales. Nam in justo dictum, egestas mauris nec, venenatis nisl. Mauris vehicula dolor metus, sed aliquam enim consequat vel. Suspendisse semper orci in leo rutrum volutpat. Aenean varius mauris diam. Sed ornare lacus turpis, eu tempor quam porta nec. Etiam suscipit quam enim, a consequat libero lacinia sed. Quisque eu justo eu orci sagittis pulvinar.Aenean augue tortor, porta nec augue ut, mollis ultricies nisi. Vestibulum iaculis pellentesque risus non efficitur. Proin eu sapien vel lectus blandit eleifend vel ac est. Maecenas quis massa sodales, pretium leo sed, fringilla elit. Sed a pellentesque felis. Phasellus quam sapien, quis quis quis quis quis quis quis quis quis quis quis quis quis quis quis quis quis quis quis quis quis vulputate ut sapien id, maximus tincidunt tellus. Nullam rhoncus mauris id pretium tincidunt. Nulla orci orci, molestie sollicitudin mollis in, ultricies sit amet ligula. Phasellus est nisi, condimentum eu lobortis a, posuere non lacus. Suspendisse vitae aliquam libero. Nunc sollicitudin neque at odio vulputate pulvinar quis nec nunc. Nullam vehicula nulla massa, vitae sodales nibh porttitor ac. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nunc rhoncus non erat quis blandit.
Maecenas convallis libero at nisl lacinia facilisis. Nulla facilisi. Sed bibendum imperdiet massa. In nunc ipsum, maximus ac viverra non, pellentesque eget diam. Donec lobortis erat in nibh rhoncus, sit amet tincidunt urna vehicula. Cras iaculis, sapien quis convallis tristique, libero eros fermentum lorem, tristique luctus ante nulla at libero. Nulla fringilla eget ligula aliquet vulputate. Donec enim ex, hendrerit at lacinia quis, ultrices eget quam. Curabitur condimentum leo neque, ac rhoncus sapien euismod eu. Suspendisse tristique ullamcorper sapien, sed tincidunt enim commodo a. Aliquam risus sapien, interdum et temporvel, placerat ut quam. Ut turpis orci, pellentesque non eros at, suscipit placerat augue. Donec eget nisi lacus. Morbi id enim metus. Mauris ut sem malesuada, convallis lectus sit amet, dapibus arcu. Nulla tempor justo eu orci egestas vehicula. Donec bibendum erat libero, placerat lacinia elit luctus at. Pellentesque semper erat metus, sed volutpat nunc imperdiet a. Fusce vitae orci libero. Curabitur laoreet felis eget odio pulvinar pulvinar. Morbi elementum purus ut nibh tristique, id efficitur neque condimentum. Vestibulum porttitor bibendum pharetra. Nulla dapibus quam vel elit tincidunt, vestibulum pretium elit efficitur. Vestibulum nec ligula nec purus suscipit dictum laoreet quis risus. Maecenas non nibh ac eros ultrices maximus. Nullam pulvinar neque nec ipsum porta malesuada. Phasellus vestibulum faucibus vehicula. Vestibulum risus lectus, efficitur eu luctus ac, pellentesque in nisi. Fusce vitae ullamcorper purus, at molestie leo. Proin sed diam sollicitudin, ullamcorper eros sit amet, egestas sapien. Phasellus rutrum.`

const shortText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus pulvinar pretium venenatis. Donec imperdiet elit id porttitor tristique. Aenean ac commodo justo. Vestibulum placerat molestie nisl, sit amet lacinia nulla posuere quis. Aenean ullamcorper eu ex vitae facilisis. Aliquam erat volutpat. Proin nunc felis, porttitor quis commodo lacinia, gravida sed orci. Interdum et malesuada fames ac ante ipsum primis in faucibus. Vivamus mattis vitae tellus ac luctus. Vestibulum faucibus sem nec varius eleifend. In gravida venenatis ipsum sit amet ultricies. Nam efficitur, dui ac imperdiet vestibulum, justo metus consectetur libero, posuere tempor neque magna vitae augue. Etiam gravida massa quis turpis vulputate, ac tempus nisi imperdiet.'

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = createWordCloudDatasetFromPlainText(longText);
    }, 2000)
})

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("strictPixelPadding", { def: true }),
    CHECKBOX("userOptions.buttons.tooltip", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    CHECKBOX("useCssAnimation", { def: true }),
    NUMBER("animationDelayMs", { def: 20, min: 0, max: 100 }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.height", { def: 512, min: 200, max: 1000 }),
    NUMBER("style.chart.width", { def: 512, min: 200, max: 1000 }),
    NUMBER("style.chart.words.maxFontSize", { def: 100, min: 10, max: 300 }),
    NUMBER("style.chart.words.minFontSize", { def: 10, min: 10, max: 300 }),
    NUMBER("style.chart.words.proximity", { def: 10, min: 0, max: 50 }),
    NUMBER("style.chart.words.packingWeight", { def: 10, min: 0, max: 50 }),
    COLOR("style.chart.words.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.words.usePalette", { def: true }),
    NUMBER("style.chart.words.hoverOpacity", { def: 0.5, min: 0, max: 1, step: 0.01 }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    NUMBER("table.responsiveBreakpoint", { def: 300, min: 300, max: 800 }),
    TEXT("table.columnNames.series", { def: "Word" }),
    TEXT("table.columnNames.value", { def: "Value" }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 6 }),
    TEXT("table.td.prefix", { def: "P" }),
    TEXT("table.td.suffix", { def: "S" }),

    CHECKBOX("style.chart.zoom.show", { def: true }),

    CHECKBOX("style.chart.tooltip.show", { def: true, label: "show", category: "tooltip" }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF", label: "backgroundColor", category: "tooltip" }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A", label: "textColor", category: "tooltip" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 6, max: 24, label: "fontSize", category: "tooltip" }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 })
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
        // customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        theme: currentTheme.value,
    }
    
});

const step = ref(0)

onMounted(async () => {
    if (local.value)  {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiWordCloud" :dataset="dataset">
        <template #title>VueUiWordCloud</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiWordCloud :key="`responsive_${step}`" :dataset="dataset" :config="{
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
                </LocalVueUiWordCloud>
            </div>
        </template>

        <template #theme>
            <LocalVueUiWordCloud :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiWordCloud :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <!-- <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template> -->
            </LocalVueUiWordCloud>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiWordCloud" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiWordCloud :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
            </VueUiWordCloud>
        </template>

        <template #build-treesh>
            <VueUiWordCloudTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
            </VueUiWordCloudTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiWordCloud" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>
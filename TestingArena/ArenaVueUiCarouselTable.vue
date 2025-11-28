<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiCarouselTable from '../src/components/vue-ui-carousel-table.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiCarouselTable } from "vue-data-ui";
import { VueUiCarouselTable as VueUiCarouselTableTreeshaken } from "vue-data-ui/vue-ui-carousel-table";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels, toggleStack } = useArena()

const { vue_ui_carousel_table: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const model = createModel([
    NUMBER("responsiveBreakpoint", { def: 400, min: 300, max: 800 }),

    SELECT("animation.type", ["scroll", "marquee"], { def: "scroll" }),
    CHECKBOX("animation.use", { def: true }),
    RANGE("animation.speedMs", { def: 1000, min: 200, max: 2000 }),
    CHECKBOX("animation.pauseOnHover", { def: true }),

    NUMBER("border.size", { def: 0, min: 0, max: 12 }),
    COLOR("border.color", { def: "#1A1A1A" }),

    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.color", { def: "#1A1A1A" }),
    TEXT("style.fontFamily", { def: "inherit" }),

    TEXT("caption.text", { def: "" }),

    NUMBER("caption.padding.top", { def: 12, min: 0, max: 24 }),
    NUMBER("caption.padding.right", { def: 12, min: 0, max: 24 }),
    NUMBER("caption.padding.bottom", { def: 12, min: 0, max: 24 }),
    NUMBER("caption.padding.left", { def: 12, min: 0, max: 24 }),

    COLOR("caption.style.backgroundColor", { def: "#FFFFFF" }),
    COLOR("caption.style.color", { def: "#1A1A1A" }),
    TEXT("caption.style.fontSize", { def: "16px" }),
    TEXT("caption.style.fontWeight", { def: "bold" }),
    SELECT("caption.style.textAlign", ["left", "center", "right"], { def: "left" }),

    CHECKBOX("scrollbar.showOnlyOnHover", { def: false }),
    CHECKBOX("scrollbar.hide", { def: false }),

    COLOR("thead.tr.style.backgroundColor", { def: "#FFFFFF" }),
    TEXT("thead.tr.style.boxShadow", { def: "0px 6px 12px -6px #1A1A1A50" }),

    NUMBER("thead.tr.border.size", { def: 0, min: 0, max: 12 }),
    COLOR("thead.tr.border.color", { def: "#1A1A1A" }),

    NUMBER("thead.tr.th.border.size", { def: 0, min: 0, max: 12 }),
    COLOR("thead.tr.th.border.color", { def: "#1A1A1A" }),

    SELECT("thead.tr.th.style.textAlign", ["left", "center", "right"], { def: "right" }),
    TEXT("thead.tr.th.style.fontVariantNumeric", { def: "tabular-nums" }),

    NUMBER("thead.tr.th.padding.top", { def: 0, min: 0, max: 24 }),
    NUMBER("thead.tr.th.padding.right", { def: 12, min: 0, max: 24 }),
    NUMBER("thead.tr.th.padding.bottom", { def: 0, min: 0, max: 24 }),
    NUMBER("thead.tr.th.padding.left", { def: 0, min: 0, max: 24 }),

    NUMBER("tbody.tr.visible", { def: 5, min: 1, max: 100 }),
    NUMBER("tbody.tr.height", { def: 32, min: 12, max: 100 }),

    COLOR("tbody.tr.style.backgroundColor", { def: "#FFFFFF" }),
    COLOR("tbody.tr.style.color", { def: "#1A1A1A" }),

    NUMBER("tbody.tr.border.size", { def: 0, min: 0, max: 12 }),
    COLOR("tbody.tr.border.color", { def: "#1A1A1A" }),

    CHECKBOX("tbody.tr.td.alternateColor", { def: true }),
    RANGE("tbody.tr.td.alternateOpacity", { def: 0.5, min: 0, max: 1, step: 0.01 }),
    TEXT("tbody.tr.td.style.fontVariantNumeric", { def: "tabular-nums" }),
    SELECT("tbody.tr.td.style.textAlign", ["left", "center", "right"], { def: "right" }),
    COLOR("tbody.tr.td.style.backgroundColor", { def: "#e1e5e8" }),

    NUMBER("tbody.tr.td.border.size", { def: 0, min: 0, max: 12 }),
    COLOR("tbody.tr.td.border.color", { def: "#1A1A1A" }),

    NUMBER("tbody.tr.td.padding.top", { def: 0, min: 0, max: 24 }),
    NUMBER("tbody.tr.td.padding.right", { def: 12, min: 0, max: 24 }),
    NUMBER("tbody.tr.td.padding.bottom", { def: 0, min: 0, max: 24 }),
    NUMBER("tbody.tr.td.padding.left", { def: 0, min: 0, max: 24 }),

    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.animation", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),

    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    TEXT("userOptions.buttonTitles.pdf", { def: "DOWNLOAD PDF" }),
    TEXT("userOptions.buttonTitles.csv", { def: "DOWNLOAD CSV" }),
    TEXT("userOptions.buttonTitles.img", { def: "DOWNLOAD PNG" }),
    TEXT("userOptions.buttonTitles.animation", { def: "TOGGLE ANIMATION" }),
    TEXT("userOptions.buttonTitles.fullscreen", { def: "TOGGLE FULLSCREEN" }),
    TEXT("userOptions.buttonTitles.open", { def: "OPEN OPTIONS" }),
    TEXT("userOptions.buttonTitles.close", { def: "CLOSE OPTIONS" }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" })
]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c
    }
})

function generateBody(n) {
    let arr = [];
    for (let i = 0; i < n; i += 1) {
        arr.push([
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
        ])
    }
    return arr
}

const dataset = ref({
    head: ['Column 1 has a long name', 'col2', 'col3', 'col4', 'col 5', 'col 6', 'col 7'],
    body: generateBody(12)
})

const step = ref(0)

const localComponent = ref(null);
const buildComponent = ref(null);
const vduiLocalComponent = ref(null);
const vduiBuildComponent = ref(null);

function toggleAnimLocal() {
    localComponent.value.toggleAnimation();
}
function pauseLocal() {
    localComponent.value.pauseAnimation();
}
function resumeLocal() {
    localComponent.value.resumeAnimation();
}

function toggleAnimVduiLocal() {
    vduiLocalComponent.value.toggleAnimation();
}

function pauseVduiLocal() {
    vduiLocalComponent.value.pauseAnimation();
}

function resumeVduiLocal() {
    vduiLocalComponent.value.resumeAnimation();
}

function toggleAnimBuild() {
    if(buildComponent.value) {
        buildComponent.value.toggleAnimation();
    }
}

function pauseBuild() {
    buildComponent.value.pauseAnimation();
}

function resumeBuild() {
    buildComponent.value.resumeAnimation();
}

function toggleAnimVduiBuild() {
    if(vduiBuildComponent.value) {
        vduiBuildComponent.value.toggleAnimation();
    }
}

function pauseVduiBuild() {
    vduiBuildComponent.value.pauseAnimation();
}

function resumeVduiBuild() {
    vduiBuildComponent.value.resumeAnimation();
}
    
</script>

<template>
    <Box>
        <template #title>VueUiCarouselTable</template>

        <template #local>
            <button @click="toggleAnimLocal">TOGGLE ANIMATION (public)</button>
            <button @click="pauseLocal">PAUSE ANIMATION (public)</button>
            <button @click="resumeLocal">RESUME ANIMATION (public)</button>
            <LocalVueUiCarouselTable
                :config="config"
                :dataset="dataset"
                ref="localComponent"
            >
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
                <template #th="{th}">
                    {{ th }}
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiCarouselTable>
        </template>

        <template #VDUI-local>
            <button @click="toggleAnimVduiLocal">TOGGLE ANIMATION (public)</button>
            <button @click="pauseVduiLocal">PAUSE ANIMATION (public)</button>
            <button @click="resumeVduiLocal">RESUME ANIMATION (public)</button>
            <LocalVueDataUi
                component="VueUiCarouselTable"
                ref="vduiLocalComponent"
                :config="config"
                :dataset="dataset"
            >

            </LocalVueDataUi>
        </template>

        <template #build>
            <button @click="toggleAnimBuild">TOGGLE ANIMATION (public)</button>
            <button @click="pauseBuild">PAUSE ANIMATION (public)</button>
            <button @click="resumeBuild">RESUME ANIMATION (public)</button>
            <VueUiCarouselTable
                ref="buildComponent"
                :dataset="dataset"
                :config="config"
            >
            </VueUiCarouselTable>
        </template>

        <template #build-treesh>
            <button @click="toggleAnimBuild">TOGGLE ANIMATION (public)</button>
            <button @click="pauseBuild">PAUSE ANIMATION (public)</button>
            <button @click="resumeBuild">RESUME ANIMATION (public)</button>
            <VueUiCarouselTableTreeshaken
                ref="buildComponent"
                :dataset="dataset"
                :config="config"
            >
            </VueUiCarouselTableTreeshaken>
        </template>

        <template #VDUI-build>
            <button @click="toggleAnimVduiBuild">TOGGLE ANIMATION (public)</button>
            <button @click="pauseVduiBuild">PAUSE ANIMATION (public)</button>
            <button @click="resumeVduiBuild">RESUME ANIMATION (public)</button>
            <VueDataUi
                ref="vduiBuildComponent"
                component="VueUiCarouselTable"
                :dataset="dataset"
                :config="config"
            >

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
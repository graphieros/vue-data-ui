<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiGeo from "../src/components/vue-ui-geo.vue";
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import { useArena } from "../src/useArena";
import { VueUiGeo } from "vue-data-ui";
import {VueUiGeo as VueUiGeoTreeshaken } from "vue-data-ui/vue-ui-geo";

import FRANCE from "./maps/FRANCE.json"
import VueDataUi from "../src/components/vue-data-ui.vue";

const { local, build, vduiLocal, vduiBuild } = useArena();
const { vue_ui_geo: DEFAULT_CONFIG } = useConfig();
const step = ref(0);

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

// Sample dataset for <vue-ui-map :dataset="dataset" />
// All coordinates are [longitude, latitude]

const dataset = ref([
    {
        name: "Paris",
        coordinates: [2.3522, 48.8566], // longitude, latitude
        description: "Capital of France",
        // color: "#E63946",
        radius: 3,
        dix: 'wut',
    },
    {
        name: "Lyon",
        coordinates: [4.8357, 45.7640],
        description: "Auvergne-Rhône-Alpes",
        color: "#457B9D",
        radius: 1,
    },
    {
        name: "Marseille",
        coordinates: [5.3698, 43.2965],
        description: "Provence-Alpes-Côte d’Azur",
        color: "#2A9D8F",
        radius: 1,
    },
    {
        name: "Bordeaux",
        coordinates: [-0.5792, 44.8378],
        description: "Nouvelle-Aquitaine",
        color: "#F4A261",
        radius: 1,
    },
    {
        name: "Lille",
        coordinates: [3.0573, 50.6292],
        description: "Hauts-de-France",
        color: "#8D99AE",
        radius: 1,
    },
]);


const model = createModel([
    CHECKBOX('loading', { def: false }),
    CHECKBOX('debug', { def: true }),
    SELECT('projection', ['aitoff', 'azimuthalEquidistant', 'bonne', 'equirectangular', 'gallPeters', 'globe', 'hammer', 'mercator', 'mollweide', 'robinson', 'sinusoidal', 'vanDerGrinten', 'winkelTripel'], { def: 'equirectangular' }),

    CHECKBOX('userOptions.buttons.pdf', { def: true }),
    CHECKBOX('userOptions.buttons.img', { def: true }),
    CHECKBOX('userOptions.buttons.svg', { def: true }),
    CHECKBOX('userOptions.buttons.fullscreen', { def: true }),
    CHECKBOX('userOptions.buttons.zoom', { def: true }),

    NUMBER('map.fitPadding', { def: 0}),
    TEXT('style.fontFamily', { def: 'inherit'}),
    COLOR('style.chart.backgroundColor', { def: '#FFFFFF'}),
    COLOR('style.chart.color', { def: '#1A1A1A' }),

    COLOR('style.chart.territory.fill', { def: '#F2F3F5'}),
    COLOR('style.chart.territory.stroke', { def: '#D0D4D8' }),
    NUMBER('style.chart.territory.strokeWidth', { def: 1, min: 0, max: 6 }),
    COLOR('style.chart.territory.hover.fill', { def: '#E7E1EE' }),
    COLOR('style.chart.territory.hover.stroke', { def: '#CCCCCC'}),
    NUMBER('style.chart.territory.hover.strokeWidth', { def: 1.5, min: 0, max: 6 }),

    NUMBER('style.chart.points.radius', { def: 1, min: 0.1, max: 5, step: 0.1 }),
    COLOR('style.chart.points.stroke', { def: '#FFFFFF' }),
    NUMBER('style.chart.points.strokeWidth', { def: 1, min: 0, max: 5 }),
    COLOR('style.chart.points.fill', { def: '#4A4A4A' }),
    NUMBER('style.chart.points.hoverRadiusRatio', { def: 1.2, min: 1, max: 1.5, step: 0.1 }),
    CHECKBOX('style.chart.points.labels.show', { def: true }),
    NUMBER('style.chart.points.labels.fontSizeRatio', { def: 1.2, min: 0.5, max: 2, step: 0.1 }),
    COLOR('style.chart.points.labels.color', { def: '#1A1A1A' }),
    NUMBER('style.chart.points.labels.offsetY', { def: 0, min: -24, max: 24 }),

    CHECKBOX('style.chart.controls.show', { def: true }),
    SELECT('style.chart.controls.position', ['top', 'bottom'], { def: 'bottom' }),
    COLOR('style.chart.controls.backgroundColor', { def: '#E1E5E8'}),
    COLOR('style.chart.controls.buttonColor', { def: '#E1E5E8'}),
    COLOR('style.chart.controls.color', { def: '#1A1A1A'}),
    NUMBER('style.chart.controls.fontSize', { def: 14, min: 8, max: 36 }),
    TEXT('style.chart.controls.border', { def: '1px solid #CCCCCC'}),
    TEXT('style.chart.controls.padding', { def: '0.5rem'}),
    TEXT('style.chart.controls.borderRadius', { def: '0.25rem'}),

    CHECKBOX('style.chart.zoom.active', { def: true }),

    TEXT('style.chart.title.text', { def: 'Title'}),
    COLOR('style.chart.title.color', { def: '#1A1A1A'}),
    NUMBER('style.chart.title.fontSize', { def: 20, min: 12, max: 36}),
    CHECKBOX('style.chart.title.bold', { def: true }),
    SELECT('style.chart.title.textAlign', ['left', 'center', 'right'], { def: 'center'}),
    NUMBER('style.chart.title.paddingLeft', { def: 0, min: -100, max: 100 }),
    NUMBER('style.chart.title.paddingRight', { def: 0, min: -100, max: 100 }),
    COLOR('style.chart.title.subtitle.color', { def: '#A1A1A1' }),
    TEXT('style.chart.title.subtitle.text', { def: 'Subtitle'}),
    NUMBER('style.chart.title.subtitle.fontSize', { def: 16, min: 8, max: 36 }),
    CHECKBOX('style.chart.title.subtitle.bold', { def: false })
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

const currentTheme = ref(themeOptions.value[4]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);

    return {
        ...c,
        map: {
            geoJson: FRANCE,
        },
        events: {
            datapointClick: ({ datapoint }) => {
                console.log(datapoint)
            }
        },
        // style: {
        //     chart: {
        //         tooltip: {
        //             customFormat: ({ datapoint }) => {
        //                 console.log(datapoint)
        //                 return `<div style="color:black">${datapoint.name}</div>`
        //             }
        //         }
        //     }
        // }
    }
});

const configTheme = computed(() => ({
    theme: currentTheme.value,
    map: {
        geoJson: FRANCE,
    },
    style: {
        chart: {
            title: {
                text: 'Title',
                subtitle: {
                    text: 'Subtitle'
                }
            }
        }
    }
}))

const resp = ref(null);

function focusOnPoint() {
    const point = [5.3698, 43.2965];
    if (resp.value) {
        resp.value.focusLocation(point);
    }
}


</script>

<template>
    <button @click="focusOnPoint">FOCUS ON POINT</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiGeo" :dataset="dataset" :config="config" :show-default="false">

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiGeo ref="resp" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }"/>
            </div>
        </template>

        <template #theme>
            <LocalVueUiGeo :dataset="dataset" :config="configTheme"/>
        </template>

        <template #local>
            <LocalVueUiGeo :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiGeo" :dataset="dataset" :config="config" />
        </template>

        <template #build>
            <VueUiGeo :dataset="dataset" :config="config"/>
        </template>

        <template #build-treesh>
            <VueUiGeoTreeshaken :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiGeo" :dataset="dataset" :config="config"/>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>
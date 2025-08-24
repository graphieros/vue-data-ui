<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiGauge from '../src/components/vue-ui-gauge.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const source = ref({
    base: 100,
    value: 50,
    series: [
        { from: -100, to: -70, name: 'series 1 is long\nand on 2 lines', nameOffsetRatio: 1},
        { from: -70, to: -35, name: 'series 2', nameOffsetRatio: 1 },
        { from: -35, to: 0, name: 'series 3', nameOffsetRatio: 1  },
        { from: 0, to: 50, name: 'series 4', nameOffsetRatio: 1  },
        { from: 50, to: 100, name: 'series 5 is long too'  }
    ]
})

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = source.value;
    }, 2000)
})

const alternateDataset = ref({
    base: 100,
    value: 12,
    series: [
        { from: -100, to: 0 },
        { from: 0, to: 100 }
    ]
})

const alternateConfig = ref({
    style: {
        chart: {
            backgroundColor: '#FF0000',
            title: {
                text: 'Alternate'
            }
        }
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    source.value.value = Math.round(Math.random() * 100)
}


onMounted(() => {
    setTimeout(() => {
        source.value.value = 25
    }, 4000)
})

const model = ref([
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},
    
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.animation.use', def: true, type: 'checkbox'},
    { key: 'style.chart.animation.speed', def: 1, type: 'range', min: 0, max: 100},
    { key: 'style.chart.animation.acceleration', def: 1, type: 'range', min: 0, max: 10},

    { key: 'style.chart.layout.radiusRatio', def: 0.8, min: 0.5, max: 1.2, step: 0.01, type: 'range'},
    { key: 'style.chart.layout.track.size', def: 1, type: 'range', min: 0.5, max: 2, step: 0.01},
    { key: 'style.chart.layout.track.useGradient', def: true, type:  'checkbox'},
    { key: 'style.chart.layout.track.gradientIntensity', def: 20, type: 'range', min: 10, max: 30},
    { key: 'style.chart.layout.markers.color', def: '#1A1A1A', type: 'color'},
    /* DEPRECATED */ { key: 'style.chart.layout.markers.size', def: 1, type: 'range', min: 0.5, max: 2, step: 0.01},
    /* DEPRECATED */ { key: 'style.chart.layout.markers.stroke', def: '#1A1A1A', type: 'color'},
    /* DEPRECATED */ { key: 'style.chart.layout.markers.strokeWidth', def: 1, type: 'range', min: 0, max: 12, step: 0.1},
    /* DEPRECATED */ { key: 'style.chart.layout.markers.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.markers.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.markers.fontSizeRatio', def: 1, type: 'range', min: 0, max: 2, step:0.01},
    { key: 'style.chart.layout.markers.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.markers.roundingValue', def: 0, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.markers.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.markers.prefix', def: '', type: 'text'},
    { key: 'style.chart.layout.markers.suffix', def: '', type: 'text'},

    { key: 'style.chart.layout.pointer.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.pointer.type', def: 'pointy', type: 'select', options: ['rounded', 'pointy']},
    { key: 'style.chart.layout.pointer.size', def: 1, type: 'range', min: 0.2, max: 1.5, step: 0.01},
    { key: 'style.chart.layout.pointer.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.pointer.strokeWidth', def: 12, type: 'range', min: 1, max: 48, step: 0.5},
    { key: 'style.chart.layout.pointer.useRatingColor', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.pointer.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.layout.pointer.circle.radius', def: 3, type: 'range', min: 0, max: 48, step: 0.5},
    { key: 'style.chart.layout.pointer.circle.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.pointer.circle.strokeWidth', def: 2, type: 'range', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.layout.pointer.circle.color', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.fontSize', def: 48, type: 'range', min: 8, max: 100},
    { key: 'style.chart.legend.prefix', def: '$', type: 'text'},
    { key: 'style.chart.legend.suffix', def: '€', type: 'text'},
    { key: 'style.chart.legend.roundingValue', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.showPlusSymbol', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.useRatingColor', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.show', def: true, type: 'checkbox'},

    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'translations.base', def: 'Base population'},

    { key: 'style.chart.layout.segmentNames.show', def: true, type: 'checkbox' },
    { key: 'style.chart.layout.segmentNames.curved', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.segmentNames.offsetRatio', def: 1.1, type: 'range', min: 0.5, max: 1.3, step: 0.01},
    { key: 'style.chart.layout.segmentNames.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.layout.segmentNames.useSerieColor', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.segmentNames.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.segmentNames.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.layout.segmentNames.markers.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.segmentNames.markers.useSerieColor', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.segmentNames.markers.color', def: '#1A1A1A', type: 'color'},

    { key: 'style.chart.layout.segmentSeparators.show', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.segmentSeparators.offsetOut', def: 0, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.layout.segmentSeparators.offsetIn', def: 0, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.layout.segmentSeparators.stroke', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.layout.segmentSeparators.strokeWidth', def: 2, type: 'number', min: 0, max: 12 },

    { key: 'style.chart.layout.indicatorArc.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.indicatorArc.fill', def: '#E1E5E890', type: 'color'},
    { key: 'style.chart.layout.indicatorArc.radius', def: 123, type: 'number', min: 0, max: 200 },

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' }
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[0])

const config = computed(() => {
    const c = convertArrayToObject(model.value)
    return {
        ...c,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                layout: {
                    ...c.style.chart.layout,
                    markers: {
                        ...c.style.chart.layout.markers,
                        // formatter: ({ value }) => {
                        //     return 'V | ' + value
                        // }
                    }
                },
                legend: {
                    ...c.style.chart.legend,
                    // formatter: ({value}) => {
                    //     return `f - ${value}`
                    // }
                }
            }
        },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
    }
})

const step = ref(0);

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

    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiGauge :key="`responsive_${step}`" :dataset="isPropsToggled ? alternateDataset : dataset" :config="{
            ...config,
            responsive: true
        }">

        <template #pattern="{ seriesIndex, patternId }">
            <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

            <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

            <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
        </template>


        <template #chart-background>
            <div style="height: 100%; width: 100%; background: radial-gradient(at top left, red, white)"/>
        </template>

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
    </LocalVueUiGauge>
    </div>

    
    <Box comp="VueUiGauge" :dataset="isPropsToggled ? alternateDataset : dataset">
        <template #title>VueUiGauge</template>

        <template #local :key="`local_${step}`">
            <LocalVueUiGauge :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" ref="local">
                <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                    <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                    <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
                </template>

                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
                </template>
            </LocalVueUiGauge>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiGauge" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`">
                <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                    <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                    <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
                </template>

                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
                </template>
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiGauge :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                    <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                    <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
                </template>

                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
                </template>
            </VueUiGauge>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiGauge" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
                <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                    <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                    <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
                </template>

                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
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
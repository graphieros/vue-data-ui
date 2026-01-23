<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiXy from '../src/components/vue-ui-xy.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiXy } from "vue-data-ui";
import { VueUiXy as VueUiXyTreeshaken } from "vue-data-ui/vue-ui-xy";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";
import { getVueDataUiConfig, mergeConfigs, useObjectBindings } from "../src";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels, toggleStack } = useArena();
const { vue_ui_xy: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dates = [
    "2024-12-11T15:20:00.000+01:00",
    "2024-12-13T00:00:00.000+01:00",
    "2024-12-14T00:00:00.000+01:00",
    "2024-12-15T00:00:00.000+01:00",
    "2024-12-16T00:00:00.000+01:00",
    "2024-12-17T00:00:00.000+01:00",
    "2024-12-18T00:00:00.000+01:00",
    "2024-12-19T00:00:00.000+01:00",
    "2024-12-20T00:00:00.000+01:00",
    "2024-12-21T00:00:00.000+01:00",
    "2024-12-22T00:00:00.000+01:00",
    "2024-12-23T00:00:00.000+01:00",
    "2024-12-24T00:00:00.000+01:00",
    "2024-12-25T00:00:00.000+01:00",
    "2024-12-26T00:00:00.000+01:00",
    "2024-12-27T00:00:00.000+01:00",
    "2024-12-28T00:00:00.000+01:00",
    "2024-12-29T00:00:00.000+01:00",
    "2024-12-30T00:00:00.000+01:00",
    "2024-12-31T00:00:00.000+01:00",
    "2025-01-01T00:00:00.000+01:00",
    "2025-01-02T00:00:00.000+01:00",
    "2025-01-03T00:00:00.000+01:00",
    "2025-01-04T00:00:00.000+01:00",
    "2025-01-05T00:00:00.000+01:00",
    "2025-01-06T00:00:00.000+01:00",
    "2025-01-06T17:15:00.000+01:00",
    "2025-01-08T00:00:00.000+01:00",
    "2025-01-09T00:00:00.000+01:00",
    "2025-01-10T00:00:00.000+01:00",
    "2025-01-11T00:00:00.000+01:00",
    "2025-01-12T00:00:00.000+01:00",
    "2025-01-13T00:00:00.000+01:00",
    "2025-01-14T00:00:00.000+01:00",
    "2025-01-15T00:00:00.000+01:00",
    "2025-01-16T00:00:00.000+01:00",
    "2025-01-17T00:00:00.000+01:00",
    "2025-01-18T00:00:00.000+01:00",
    "2025-01-19T00:00:00.000+01:00",
    "2025-01-20T00:00:00.000+01:00",
    "2025-01-21T10:00:00.000+01:00",
    "2025-01-22T00:00:00.000+01:00",
    "2025-01-23T00:00:00.000+01:00",
    "2025-01-24T00:00:00.000+01:00",
    "2025-01-25T00:00:00.000+01:00",
    "2025-01-26T00:00:00.000+01:00",
    "2025-01-27T00:00:00.000+01:00",
    "2025-01-28T00:00:00.000+01:00",
    "2025-01-29T00:00:00.000+01:00",
    "2025-01-30T00:00:00.000+01:00",
    "2025-01-31T00:00:00.000+01:00",
    "2025-02-01T00:00:00.000+01:00",
    "2025-02-02T00:00:00.000+01:00",
    "2025-02-03T00:00:00.000+01:00",
    "2025-02-04T00:00:00.000+01:00",
    "2025-02-05T00:00:00.000+01:00",
    "2025-02-06T00:00:00.000+01:00",
    "2025-02-07T00:00:00.000+01:00",
    "2025-02-08T00:00:00.000+01:00",
    "2025-02-09T00:00:00.000+01:00",
    "2025-02-10T00:00:00.000+01:00",
    "2025-02-11T00:00:00.000+01:00",
    "2025-02-12T00:00:00.000+01:00",
    "2025-02-13T00:00:00.000+01:00",
    "2025-02-14T00:00:00.000+01:00",
    "2025-02-15T00:00:00.000+01:00",
    "2025-02-16T00:00:00.000+01:00",
    "2025-02-17T00:00:00.000+01:00",
    "2025-02-18T00:00:00.000+01:00",
    "2025-02-19T00:00:00.000+01:00",
    "2025-02-20T00:00:00.000+01:00",
    "2025-02-21T00:00:00.000+01:00",
    "2025-02-22T00:00:00.000+01:00",
    "2025-02-23T00:00:00.000+01:00",
    "2025-02-24T00:00:00.000+01:00",
    "2025-02-25T00:00:00.000+01:00",
    "2025-02-26T00:00:00.000+01:00",
    "2025-02-27T00:00:00.000+01:00",
    "2025-02-28T00:00:00.000+01:00",
    "2025-03-01T00:00:00.000+01:00",
    "2025-03-02T00:00:00.000+01:00",
    "2025-03-03T00:00:00.000+01:00",
    "2025-03-04T00:00:00.000+01:00",
    "2025-03-05T00:00:00.000+01:00",
    "2025-03-06T00:00:00.000+01:00",
    "2025-03-07T00:00:00.000+01:00",
    "2025-03-08T00:00:00.000+01:00",
    "2025-03-09T00:00:00.000+01:00",
    "2025-03-10T00:00:00.000+01:00",
    "2025-03-11T00:00:00.000+01:00",
    "2025-03-12T00:00:00.000+01:00",
    "2025-03-13T00:00:00.000+01:00",
    "2025-03-14T00:00:00.000+01:00",
    "2025-03-15T00:00:00.000+01:00",
    "2025-03-16T00:00:00.000+01:00",
    "2025-03-17T00:00:00.000+01:00",
    "2025-03-18T00:00:00.000+01:00",
    "2025-03-19T00:00:00.000+01:00",
    "2025-03-20T00:00:00.000+01:00",
    "2025-03-21T00:00:00.000+01:00",
    "2025-03-22T00:00:00.000+01:00",
    "2025-03-23T00:00:00.000+01:00",
    "2025-03-24T00:00:00.000+01:00",
    "2025-03-25T00:00:00.000+01:00",
    "2025-03-26T00:00:00.000+01:00",
    "2025-03-27T00:00:00.000+01:00",
    "2025-03-28T00:00:00.000+01:00",
    "2025-03-29T00:00:00.000+01:00",
    "2025-03-30T00:00:00.000+01:00",
    "2025-03-31T00:00:00.000+02:00",
    "2025-04-01T00:00:00.000+02:00",
    "2025-04-02T00:00:00.000+02:00",
    "2025-04-03T00:00:00.000+02:00",
    "2025-04-04T00:00:00.000+02:00",
    "2025-04-05T00:00:00.000+02:00",
    "2025-04-06T00:00:00.000+02:00",
    "2025-04-07T00:00:00.000+02:00",
    "2025-04-08T00:00:00.000+02:00",
    "2025-04-09T00:00:00.000+02:00",
    "2025-04-10T00:00:00.000+02:00",
    "2025-04-11T00:00:00.000+02:00",
    "2025-04-12T00:00:00.000+02:00",
    "2025-04-13T00:00:00.000+02:00",
    "2025-04-14T00:00:00.000+02:00",
    "2025-04-15T00:00:00.000+02:00",
    "2025-04-16T00:00:00.000+02:00",
    "2025-04-17T00:00:00.000+02:00",
    "2025-04-18T00:00:00.000+02:00",
    "2025-04-19T00:00:00.000+02:00",
    "2025-04-20T00:00:00.000+02:00",
    "2025-04-21T00:00:00.000+02:00",
    "2025-04-22T00:00:00.000+02:00",
    "2025-04-23T00:00:00.000+02:00",
    "2025-04-24T00:00:00.000+02:00",
    "2025-04-25T00:00:00.000+02:00",
    "2025-04-26T00:00:00.000+02:00",
    "2025-04-27T00:00:00.000+02:00",
    "2025-04-28T00:00:00.000+02:00",
    "2025-04-29T00:00:00.000+02:00",
    "2025-04-30T00:00:00.000+02:00",
    "2025-05-01T00:00:00.000+02:00",
    "2025-05-02T00:00:00.000+02:00",
    "2025-05-03T00:00:00.000+02:00",
    "2025-05-04T00:00:00.000+02:00",
    "2025-05-05T00:00:00.000+02:00",
    "2025-05-06T00:00:00.000+02:00",
    "2025-05-07T00:00:00.000+02:00",
    "2025-05-08T00:00:00.000+02:00",
    "2025-05-09T00:00:00.000+02:00",
    "2025-05-10T00:00:00.000+02:00",
    "2025-05-11T00:00:00.000+02:00",
    "2025-05-12T00:00:00.000+02:00",
    "2025-05-13T00:00:00.000+02:00",
    "2025-05-14T00:00:00.000+02:00",
    "2025-05-15T00:00:00.000+02:00",
    "2025-05-16T00:00:00.000+02:00",
    "2025-05-17T00:00:00.000+02:00",
    "2025-05-18T00:00:00.000+02:00",
    "2025-05-19T00:00:00.000+02:00",
    "2025-05-20T00:00:00.000+02:00",
    "2025-05-21T00:00:00.000+02:00",
    "2025-05-22T00:00:00.000+02:00",
    "2025-05-23T00:00:00.000+02:00",
    "2025-05-24T00:00:00.000+02:00",
    "2025-05-25T00:00:00.000+02:00",
    "2025-05-26T00:00:00.000+02:00",
    "2025-05-27T10:35:00.000+02:00",
    "2025-05-28T00:00:00.000+02:00",
    "2025-05-29T00:00:00.000+02:00",
    "2025-05-30T00:00:00.000+02:00",
    "2025-05-31T00:00:00.000+02:00",
    "2025-06-01T00:00:00.000+02:00",
    "2025-06-02T00:00:00.000+02:00",
    "2025-06-03T00:00:00.000+02:00",
    "2025-06-04T00:00:00.000+02:00",
    "2025-06-05T00:00:00.000+02:00",
    "2025-06-06T00:00:00.000+02:00",
    "2025-06-07T00:00:00.000+02:00",
    "2025-06-08T00:00:00.000+02:00",
    "2025-06-09T00:00:00.000+02:00",
    "2025-06-10T00:00:00.000+02:00",
    "2025-06-11T00:00:00.000+02:00",
    "2025-06-12T00:00:00.000+02:00",
    "2025-06-13T00:00:00.000+02:00",
    "2025-06-14T00:00:00.000+02:00",
    "2025-06-15T00:00:00.000+02:00",
    "2025-06-16T00:00:00.000+02:00",
    "2025-06-17T00:00:00.000+02:00",
    "2025-06-18T00:00:00.000+02:00",
    "2025-06-19T00:00:00.000+02:00",
    "2025-06-20T00:00:00.000+02:00",
    "2025-06-21T00:00:00.000+02:00",
    "2025-06-22T00:00:00.000+02:00",
    "2025-06-23T00:00:00.000+02:00",
    "2025-06-24T00:00:00.000+02:00",
    "2025-06-25T00:00:00.000+02:00",
    "2025-06-26T00:00:00.000+02:00",
    "2025-06-27T00:00:00.000+02:00",
    "2025-06-28T00:00:00.000+02:00",
    "2025-06-29T00:00:00.000+02:00",
    "2025-06-30T00:00:00.000+02:00",
    "2025-07-01T00:00:00.000+02:00",
    "2025-07-02T07:29:00.000+02:00",
    "2025-07-03T00:00:00.000+02:00",
    "2025-07-04T00:00:00.000+02:00",
    "2025-07-05T00:00:00.000+02:00",
    "2025-07-06T00:00:00.000+02:00",
    "2025-07-07T00:00:00.000+02:00",
    "2025-07-08T00:00:00.000+02:00",
    "2025-07-09T00:00:00.000+02:00",
    "2025-07-10T00:00:00.000+02:00",
    "2025-07-11T00:00:00.000+02:00",
    "2025-07-12T00:00:00.000+02:00",
    "2025-07-13T00:00:00.000+02:00",
    "2025-07-14T00:00:00.000+02:00",
    "2025-07-15T00:00:00.000+02:00",
    "2025-07-16T00:00:00.000+02:00",
    "2025-07-17T00:00:00.000+02:00",
    "2025-07-18T00:00:00.000+02:00",
    "2025-07-19T00:00:00.000+02:00",
    "2025-07-20T00:00:00.000+02:00",
    "2025-07-21T00:00:00.000+02:00",
    "2025-07-22T00:00:00.000+02:00",
    "2025-07-23T00:00:00.000+02:00",
    "2025-07-24T00:00:00.000+02:00",
    "2025-07-25T00:00:00.000+02:00",
    "2025-07-26T00:00:00.000+02:00",
    "2025-07-27T00:00:00.000+02:00",
    "2025-07-28T00:00:00.000+02:00",
    "2025-07-29T00:00:00.000+02:00",
    "2025-07-30T00:00:00.000+02:00",
    "2025-07-31T00:00:00.000+02:00",
    "2025-08-01T00:00:00.000+02:00",
    "2025-08-02T00:00:00.000+02:00",
    "2025-08-03T00:00:00.000+02:00",
    "2025-08-04T00:00:00.000+02:00",
    "2025-08-05T00:00:00.000+02:00",
    "2025-08-06T00:00:00.000+02:00",
    "2025-08-07T00:00:00.000+02:00",
    "2025-08-08T00:00:00.000+02:00",
    "2025-08-09T00:00:00.000+02:00",
    "2025-08-10T00:00:00.000+02:00",
    "2025-08-11T00:00:00.000+02:00",
    "2025-08-12T00:00:00.000+02:00",
    "2025-08-13T00:00:00.000+02:00",
    "2025-08-14T00:00:00.000+02:00",
    "2025-08-15T00:00:00.000+02:00",
    "2025-08-16T00:00:00.000+02:00",
    "2025-08-17T00:00:00.000+02:00",
    "2025-08-18T00:00:00.000+02:00",
    "2025-08-19T00:00:00.000+02:00",
    "2025-08-20T00:00:00.000+02:00",
    "2025-08-21T00:00:00.000+02:00",
    "2025-08-22T00:00:00.000+02:00",
    "2025-08-23T00:00:00.000+02:00",
    "2025-08-24T00:00:00.000+02:00",
    "2025-08-25T00:00:00.000+02:00",
    "2025-08-26T00:00:00.000+02:00"
].map(el => new Date(el).getTime())

// function createDs(n,m=100) {
//     const arr = [];
//     for(let i = 0; i < n; i += 1) {
//         if ([7,8,9].includes(i)) {
//             arr.push(null)
//         } else {
//             arr.push(Math.random()*m * (i % 2 === 0 ? -1 : 1))
//         }
//     }
//     return arr
// }

function createDs(n, m = 100) {
    const arr = [];
    for (let i = 0; i < n; i += 1) {
        if ([10, 11, 13, 14, 15, 20, 22, 23, 25].includes(i)) {
            arr.push(null);
        } else {
            arr.push(Math.random() * m * (Math.random() > 0.3 ? 1 : -1))
        }
    }
    return arr
}

function generateDayTimestamps(length) {
    const result = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < length; i += 1) {
        result.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000).getTime());
    }

    return result;
}

// const to = ref(null);
// const raf = ref(null);
// const ds = ref(createDs(12));

// const dataset = computed(() => {
//     function anim() {
//         ds.value.shift()
//         ds.value.push(Math.random() * 100)
//         to.value = setTimeout(() => {
//             raf.value = requestAnimationFrame(anim)
//         }, 300)
//     }

//     anim()
//     return [
//         {
//             name: 'Serie',
//             series: ds.value,
//             type: 'line',
//             smooth: true,
//             useArea: true,
//             dataLabels: false
//         }
//     ]
// })


// Negative dataset with positive display:
// const config = ref({
//     // ...rest of your config
//     chart: {
//         grid: {
//             labels: {
//                 yAxis: {
//                     formatter: ({ value }) => {
//                         return Math.abs(value)
//                     }
//                 }
//             }
//         },
//         tooltip: {
//             customFormat: ({ datapoint }) => {
//                 let html = "";
//                 datapoint.forEach(d => {
//                     html += `<li>${d.name}: ${Math.abs(d.value)}</li>`
//                 })
//                 return `<ul>${html}</ul>`
//             }
//         }
//     },
//     line: {
//         labels: {
//             formatter: ({ value }) => {
//                 return Math.abs(value)
//             }
//         }
//     },
// })

// const dataset = ref([
//     {
//         name: "Curved",
//         series: createDs(12),
//         type: "line",
//         smooth: true,
//         useArea: true,
//         useTag: 'start',
//         dataLabels: false,
//         autoScale: true
//     },
//     {
//         name: "Curved",
//         series: createDs(12),
//         type: "line",
//         smooth: false,
//         useArea: true,
//         useTag: 'end',
//         dataLabels: false,
//     },
// ])

const dataset = ref(undefined)

onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = [
    {
        name: "Serie A",
        series: createDs(35),
        type: "plot",
        dataLabels: false,
        smooth: true,
        useArea: true,
        useProgression: true,
        // freestyle:
        marks: [10, 20],
        annotated: true,
    },
    {
        name: "Serie B",
        series: createDs(35),
        type: "line",
        dataLabels: false,
        smooth: true,
        useArea: true,
        useProgression: true
    },
    {
        name: "Serie C",
        series: createDs(35),
        type: "bar",
        dataLabels: true,
        smooth: true,
        useArea: true,
        useProgression: true
    },
    // {
    //     name: "Serie B",
    //     series: createDs(35),
    //     type: "bar",
    //     dataLabels: false,
    //     smooth: true,
    //     useArea: true,
    //     useProgression: true
    // },
    // {
    //     name: "Serie B",
    //     series: [60, 75, 11, 20, 10, 8, null, 20, 22, 204, 146, 117, 55],
    //     type: "line",
    //     dataLabels: false,
    //     shape: 'triangle',
    //     // useArea: true,
    //     smooth: false,
    //     // useProgression: true
    // },
    // {
    //     name: "Serie C with a long name",
    //     series: [60, 75, 11, 20, 10, 8, null, 20, 22, 204, 146, 117, 55],
    //     type: "plot",
    //     dataLabels: false,
    // },
]
    }, 0)
})

// const dataset = ref([
//     { name: 'A', series: [3], type: 'bar' },
//     { name: 'B', series: [5], type: 'bar' },
//     { name: 'C', series: [8], type: 'bar' },
//     { name: 'D', series: [13], type: 'bar' },
//     { name: 'E', series: [21], type: 'bar' },
// ])

// const dataset = ref([
// {
//   name: 'Donut Devourers - Happiness (%)',
//   type: 'line',
//   dataLabels: true,
//   scaleLabel: 'percentage', // Share scale with other percentage-based series
//   series: [92.34, 88.37, 95.00] // Example percentages across different days
// },
// {
//   name: 'Donut Devourers - Donuts Eaten',
//   type: 'bar',
//   dataLabels: true,
//   scaleLabel: 'total', // Share scale with other total-based series
//   series: [12, 15, 13] // Example counts per day
// },
// {
//   name: 'Pizza Party - Cheesy Delight (%)',
//   type: 'line',
//   dataLabels: true,
//   scaleLabel: 'percentage',
//   series: [75.12, 80.50, 78.34]
// },
// {
//   name: 'Pizza Party - Slices Consumed',
//   type: 'bar',
//   dataLabels: true,
//   scaleLabel: 'total',
//   series: [8, 9, 10]
// },
// {
//   name: 'Lone series ',
//   type: 'bar',
//   dataLabels: true,
//   series: [8, 9, 100]
// }
// ])


// const dataset = ref([
//         {
//             name: "Long name serie",
//             series: [-80, -60, -30, 0, null, 60, 80, 60, 30, 0, -30, -60, -80],
//             comments: ["", "", "", "", "This is a comment that can be long, or that can be short but it depends."],
//             type: "line",
//             smooth: true,
//             useArea: true,
//             dataLabels: true,
//             scaleSteps: 2,
//             suffix: '$'
//         },
//         {
//             name: "Long name serie",
//             series: [10, 20, 12, 13, 10, -20, null, 20, 12, 16, 32, 64, 12],
//             comments: ["", "", "", "", "This is a comment that can be long, or that can be short but it depends."],
//             type: "bar",
//             smooth: false,
//             useArea: true,
//             dataLabels: true,
//             scaleSteps: 2,
//             prefix: '£'
//         },
//         {
//             name: "S1",
//             series: [-20, 20, 8, 16, null, 13, -16, 55, 12, 3, 7, 12, 6],
//             comments: ["Some sort of negative comment", "Some sort of positive comment", "", "","", "", "", "Some sort of positive comment", "",  ""],
//             type: "bar",
//             smooth: false,
//             useArea: true,
//             scaleSteps: 2,
//             color: "#FF000050"
//         },
//         {
//             name: "S2",
//             series: [10,12,10,12, 25, 12, 4, 4, 3, 7, 8, 9, 12],
//             comments: ["", "", "", "","", "", "", "", "", "This is another comment"],
//             type: "plot",
//             smooth: false,
//             useArea: true,
//             scaleSteps: 2
//         },
//         {
//             name: "S3",
//             series: [23.12, 23.12, 23.05, 23.07, null, 23.69, 23.72, 23.25, 23.36, 23.41, 23.65],
//             type: "line",
//             smooth: false,
//             useArea: true,
//             scaleSteps: 5,
//             autoScaling: false,
//             stackRatio: 0.5
//         },
//     ])

const alternateDataset = ref([
    {
        name: "Alternate datapoint",
        series: [12, 19, 16, 15, 9, 17, 44, 13, 40],
        comments: ["", "", "", "", "This is a comment that can be long, or that can be short but it depends."],
        type: "line",
        smooth: false,
        useArea: false,
        dataLabels: true,
    },
])

function alterDataset() {
    dataset.value[0].series = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
}

const alternateConfig = ref({
    chart: {
        title: {
            text: 'Alternate version'
        }
    }
})

const isPropsToggled = ref(false);

function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value
}

// const dataset = ref([
//     {
//         name: "Series 1",
//         series: [ -55, -34, -21, -13, -8, -5, -3, -2, -1, -1, 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
//         type: "bar",
//         color: "rgb(95,139,238)",
//         shape: 'circle',
//         scaleSteps: 2,
//     },
//     {
//         name: "Series 2",
//         series: [ 55, 34, 21, 13, 8, 5, 3, 2, 1, 1, 0, -1, -1, -2, -3, -5, -8, -13, -21, -34, -55],
//         type: "line",
//         color: "rgb(66,211,146)",
//         useArea: true,
//         useProgression: true,
//         dataLabels: false,
//         shape: "triangle",
//         scaleSteps: 2,
//         showSerieName: 'end'
//     },
//     {
//         name: "Series 3",
//         series: [ 64, 60, 52, 42, 30, 16, 0, -18, -38, -46, -50, -46, -38, -18, 0, 16, 30, 42, 52, 60, 64],
//         type: "plot",
//         color: "rgb(255,100,0)",
//         shape: "star",
//         scaleSteps: 2,
//         showSerieName: 'end'
//     },
//     {
//         name: "Series 4",
//         series: [ 0, 1, -2, 3, -4, 5, -6, 7, -8, 9, -10, 36, -12, 13, -14, 15, -16, 17, -18, 19, -20],
//         comments: ["", "", "", "", "", "", "", "", "", "", "", "A comment for this specific datapoint"],
//         type: "line",
//         smooth: true,
//         useArea: false,
//         dataLabels: false,
//         color: "rgb(200,200,50)",
//         shape: 'Yellow circles',
//         scaleSteps: 2,
//         showSerieName: 'end'
//     },
//     {
//         name: "Target",
//         series: [ 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
//         type: "line",
//         color: "#404040",
//         dashed: true,
//         useTag: "start",
//         dataLabels: false,
//         shape: 'circle',
//         scaleSteps: 2,
//     },
// ]);

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("autoSize", { def: false }),

    CHECKBOX("responsive", { def: false }),
    CHECKBOX("responsiveProportionalSizing", { def: false }),
    CHECKBOX("loading", { def: false }),

    CHECKBOX("chart.userOptions.show", { def: true }),
    CHECKBOX("chart.userOptions.buttons.pdf", { def: true }),
    CHECKBOX("chart.userOptions.buttons.csv", { def: true }),
    CHECKBOX("chart.userOptions.buttons.img", { def: true }),
    CHECKBOX("chart.userOptions.buttons.table", { def: true }),
    CHECKBOX("chart.userOptions.buttons.labels", { def: true }),
    CHECKBOX("chart.userOptions.buttons.fullscreen", { def: true }),
    CHECKBOX("chart.userOptions.buttons.stack", { def: true }),
    SELECT("chart.userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("chart.userOptions.showOnChartHover", { def: true }),
    CHECKBOX("chart.userOptions.keepStateOnChartLeave", { def: true }),

    CHECKBOX("useCssAnimation", { def: true }),
    TEXT("chart.fontFamily", { def: "inherit" }),
    COLOR("chart.backgroundColor", { def: "#FFF" }),
    COLOR("chart.color", { def: "#111" }),
    RANGE("chart.height", { def: 600, min: 300, max: 1000 }),
    RANGE("chart.width", { def: 1000, min: 300, max: 2000 }),

    CHECKBOX("chart.zoom.show", { def: true }),
    COLOR("chart.zoom.color", { def: "#CCCCCC" }),
    COLOR("chart.zoom.highlightColor", { def: "#4A4A4A" }),
    NUMBER("chart.zoom.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("chart.zoom.useResetSlot", { def: false }),
    CHECKBOX("chart.zoom.enableRangeHandles", { def: true }),
    CHECKBOX("chart.zoom.enableSelectionDrag", { def: true }),
    CHECKBOX("chart.zoom.focusOnDrag", { def: true }),
    NUMBER("chart.zoom.focusRangeRatio", { def: 0.2, min: 0.1, max: 0.9 }),

    CHECKBOX("chart.zoom.minimap.show", { def: true }),
    CHECKBOX("chart.zoom.minimap.smooth", { def: false }),
    COLOR("chart.zoom.minimap.selectedColor", { def: "#1f77b4" }),
    RANGE("chart.zoom.minimap.selectedColorOpacity", { def: 0.2, min: 0, max: 1, step: 0.01 }),
    COLOR("chart.zoom.minimap.lineColor", { def: "#1A1A1A" }),
    NUMBER("chart.zoom.minimap.selectionRadius", { def: 2, min: 0, max: 24 }),
    COLOR("chart.zoom.minimap.indicatorColor", { def: "#1A1A1A" }),
    CHECKBOX("chart.zoom.minimap.verticalHandles", { def: false }),
    CHECKBOX("chart.zoom.minimap.compact", { def: true }),
    CHECKBOX("chart.zoom.minimap.merged", { def: false }),

    NUMBER("chart.zoom.startIndex", { def: null, min: 0, max: 100 }),
    NUMBER("chart.zoom.endIndex", { def: null, min: 0, max: 100 }),

    CHECKBOX("chart.zoom.preview.enable", { def: false }),
    COLOR("chart.zoom.preview.stroke", { def: "#1f77b4" }),
    COLOR("chart.zoom.preview.fill", { def: "#1f77b420" }),
    NUMBER("chart.zoom.preview.strokeDasharray", { def: 0, min: 0, max: 12 }),
    NUMBER("chart.zoom.preview.strokeWidth", { def: 2, min: 0, max: 12 }),

    NUMBER("chart.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("chart.padding.right", { def: 0, min: 0, max: 100 }),
    NUMBER("chart.padding.bottom", { def: 0, min: 0, max: 100 }),
    NUMBER("chart.padding.left", { def: 0, min: 0, max: 100 }),

    COLOR("chart.highlighter.color", { def: "#1A1A1A" }),
    RANGE("chart.highlighter.opacity", { def: 5, min: 0, max: 100 }),
    CHECKBOX("chart.highlighter.useLine", { def: true }),

    CHECKBOX("chart.timeTag.show", { def: true }),

    CHECKBOX("chart.highlightArea.show", { def: false }),
    NUMBER("chart.highlightArea.from", { def: 2, min: 0, max: 999 }),
    NUMBER("chart.highlightArea.to", { def: 5, min: 0, max: 999 }),
    COLOR("chart.highlightArea.color", { def: "#1A1A1A" }),
    RANGE("chart.highlightArea.opacity", { def: 20, min: 0, max: 100 }),
    TEXT("chart.highlightArea.caption.text", { def: "Caption" }),
    NUMBER("chart.highlightArea.caption.fontSize", { def: 20, min: 6, max: 28 }),
    COLOR("chart.highlightArea.caption.color", { def: "#1A1A1A" }),
    CHECKBOX("chart.highlightArea.caption.bold", { def: false }),
    NUMBER("chart.highlightArea.caption.offsetY", { def: 0 }),
    TEXT("chart.highlightArea.caption.width", { def: "auto" }),
    NUMBER("chart.highlightArea.caption.padding", { def: 3, min: 0, max: 48 }),
    SELECT("chart.highlightArea.caption.textAlign", ["left", "center", "right"], { def: "center" }),

    COLOR("chart.grid.stroke", { def: "#CCCCCC" }),
    CHECKBOX("chart.grid.showVerticalLines", { def: true }),
    CHECKBOX("chart.grid.showHorizontalLines", { def: true }),

    SELECT("chart.grid.position", ["middle", "start"], { def: "middle" }),
    CHECKBOX("chart.grid.frame.show", { def: false }),
    COLOR("chart.grid.frame.stroke", { def: "#1A1A1A" }),
    NUMBER("chart.grid.frame.strokeWidth", { def: 4, min: 0, max: 12 }),
    SELECT("chart.grid.frame.strokeLinecap", ["round", "square", "butt"], { def: "round" }),
    SELECT("chart.grid.frame.strokeLinejoin", ["round", "miter"], { def: "round" }),
    RANGE("chart.grid.frame.strokeDasharray", { def: 0, min: 0, max: 100 }),

    CHECKBOX("chart.grid.labels.show", { def: true }),
    COLOR("chart.grid.labels.color", { def: "#1A1A1A" }),
    NUMBER("chart.grid.labels.fontSize", { def: 26, min: 4, max: 30 }),
    TEXT("chart.grid.labels.axis.yLabel", { def: "TEST" }),
    TEXT("chart.grid.labels.axis.xLabel", { def: "TEST" }),
    NUMBER("chart.grid.labels.axis.fontSize", { def: 14, min: 4, max: 30 }),
    CHECKBOX("chart.grid.labels.xAxisLabels.show", { def: true }),
    COLOR("chart.grid.labels.xAxisLabels.color", { def: "#1A1A1A" }),
    NUMBER("chart.grid.labels.xAxisLabels.fontSize", { def: 16, min: 6, max: 30 }),
    CHECKBOX("chart.grid.labels.xAxisLabels.showOnlyFirstAndLast", { def: false }),
    NUMBER("chart.grid.labels.xAxisLabels.yOffset", { def: 24, min: -100, max: 100 }),
    RANGE("chart.grid.labels.xAxisLabels.rotation", { def: 0, min: -360, max: 360 }),
    CHECKBOX("chart.grid.labels.xAxisLabels.autoRotate.enable", { def: true }),
    NUMBER("chart.grid.labels.xAxisLabels.autoRotate.angle", { def: -90, min: -90, max: 90 }),

    NUMBER("chart.grid.labels.axis.xLabelOffsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("chart.grid.labels.axis.yLabelOffsetX", { def: 0, min: -100, max: 100 }),

    CHECKBOX("chart.grid.labels.xAxisLabels.showOnlyAtModulo", { def: true }),
    NUMBER("chart.grid.labels.xAxisLabels.modulo", { def: 12 }),
    CHECKBOX("chart.grid.labels.xAxisLabels.autoRotate", { def: true }),

    SELECT("chart.grid.labels.yAxis.position", ["left", "right"], { def: "right" }),
    NUMBER("chart.grid.labels.yAxis.commonScaleSteps", { def: 10, min: 0, max: 100 }),
    CHECKBOX("chart.grid.labels.yAxis.useIndividualScale", { def: false }),
    CHECKBOX("chart.grid.labels.yAxis.stacked", { def: false }),
    NUMBER("chart.grid.labels.yAxis.gap", { def: 24, min: 0, max: 200 }),
    NUMBER("chart.grid.labels.yAxis.labelWidth", { def: 64, min: 0, max: 100 }),
    CHECKBOX("chart.grid.labels.yAxis.showBaseline", { def: true }),
    NUMBER("chart.grid.labels.yAxis.scaleMin", { def: null, min: -1000, max: 1000 }),
    NUMBER("chart.grid.labels.yAxis.scaleMax", { def: null, min: -1000, max: 1000 }),
    COLOR("chart.grid.labels.yAxis.groupColor", { def: "#1A1A1A" }),
    NUMBER("chart.grid.labels.yAxis.scaleLabelOffsetX", { def: 36, min: -100, max: 100 }),
    NUMBER("chart.grid.labels.yAxis.scaleValueOffsetX", { def: 0, min: -100, max: 100 }),
    CHECKBOX("chart.grid.labels.yAxis.useNiceScale", { def: false }),

    CHECKBOX("chart.grid.labels.yAxis.showCrosshairs", { def: true }),
    CHECKBOX("chart.grid.labels.xAxis.showCrosshairs", { def: true }),
    NUMBER("chart.grid.labels.xAxis.crosshairSize", { def: 6, min: 0, max: 24 }),
    CHECKBOX("chart.grid.labels.xAxis.crosshairsAlwaysAtZero", { def: false }),

    CHECKBOX("chart.grid.labels.xAxis.showBaseline", { def: true }),
    CHECKBOX("chart.grid.labels.zeroLine.show", { def: true }),

    NUMBER("chart.labels.fontSize", { def: 20, min: 6, max: 30 }),
    TEXT("chart.labels.prefix", { def: "" }),
    TEXT("chart.labels.suffix", { def: "" }),

    CHECKBOX("chart.legend.show", { def: true }),
    COLOR("chart.legend.color", { def: "#1A1A1A" }),
    NUMBER("chart.legend.fontSize", { def: 16, min: 10, max: 36 }),
    SELECT("chart.legend.position", ["top", "bottom"], { def: "bottom" }),
    CHECKBOX('chart.legend.selectAllToggle.show', { def: true }),
    COLOR('chart.legend.selectAllToggle.backgroundColor', {def: '#FF0000'}),
    COLOR('chart.legend.selectAllToggle.color', {def: '#FFFFFF'}),

    CHECKBOX("chart.title.show", { def: true }),
    TEXT("chart.title.text", { def: "Title" }),
    COLOR("chart.title.color", { def: "#1A1A1A" }),
    NUMBER("chart.title.fontSize", { def: 20, min: 10, max: 64 }),
    CHECKBOX("chart.title.bold", { def: true }),
    NUMBER("chart.title.offsetX", { def: 0 }),
    NUMBER("chart.title.offsetY", { def: 0 }),
    SELECT("chart.title.textAlign", ["left", "center", "right"], { def: "left" }),
    NUMBER("chart.title.paddingLeft", { def: 12, min: 0, max: 24 }),

    TEXT("chart.title.subtitle.text", { def: "Subtitle" }),
    COLOR("chart.title.subtitle.color", { def: "#CCCCCC" }),
    NUMBER("chart.title.subtitle.fontSize", { def: 16, min: 6, max: 64 }),

    CHECKBOX("chart.tooltip.show", { def: true }),
    CHECKBOX("chart.tooltip.showValue", { def: true }),
    CHECKBOX("chart.tooltip.showPercentage", { def: false }),
    COLOR("chart.tooltip.color", { def: "#1A1A1A" }),
    COLOR("chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    NUMBER("chart.tooltip.roundingValue", { def: 3, min: 0, max: 6 }),
    NUMBER("chart.tooltip.roundingPercentage", { def: 0, min: 0, max: 6 }),
    RANGE("chart.tooltip.fontSize", { def: 14, min: 8, max: 48 }),
    RANGE("chart.tooltip.backgroundOpacity", { def: 90, min: 0, max: 100 }),
    SELECT("chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),
    CHECKBOX("chart.tooltip.showTimeLabel", { def: true }),
    CHECKBOX("chart.tooltip.smooth", { def: true }),
    CHECKBOX("chart.tooltip.backdropFilter", { def: false }),
    NUMBER("chart.tooltip.smoothForce", { def: 0.18, min: 0.1, max: 1, step: 0.01 }),
    NUMBER("chart.tooltip.smoothSnapThreshold", { def: 0.25, min: 0.1, max: 1, step: 0.01 }),

    NUMBER("bar.borderRadius", { def: 2, min: 0, max: 120 }),
    CHECKBOX("bar.useGradient", { def: true }),
    CHECKBOX("bar.labels.show", { def: true }),
    NUMBER("bar.labels.offsetY", { def: -8, min: -100, max: 100 }),
    NUMBER("bar.labels.rounding", { def: 0, min: 0, max: 6 }),
    COLOR("bar.labels.color", { def: "#1A1A1A" }),
    CHECKBOX("bar.serieName.show", { def: false }),
    NUMBER("bar.serieName.offsetY", { def: -6, min: -100, max: 100 }),
    CHECKBOX("bar.serieName.useAbbreviation", { def: true }),
    NUMBER("bar.serieName.abbreviationSize", { def: 3, min: 0, max: 12 }),
    CHECKBOX("bar.serieName.useSerieColor", { def: true }),
    COLOR("bar.serieName.color", { def: "#1A1A1A" }),
    NUMBER("bar.periodGap", { def: 0.01, min: 0, max: 24 }),
    NUMBER("bar.innerGap", { def: 0.2, min: 0, max: 1 }),
    CHECKBOX("bar.border.useSerieColor", { def: false }),
    COLOR("bar.border.stroke", { def: "#FFFFFF" }),
    NUMBER("bar.border.strokeWidth", { def: 1, min: 0, max: 12, step: 0.5 }),

    CHECKBOX("line.showTransition", { def: true }),
    NUMBER("line.radius", { def: 6, min: 0, max: 20 }),
    CHECKBOX("line.useGradient", { def: false }),
    NUMBER("line.strokeWidth", { def: 2, min: 1, max: 20 }),
    CHECKBOX("line.cutNullValues", { def: true }),

    CHECKBOX("line.labels.show", { def: true }),
    NUMBER("line.labels.offsetY", { def: -8, min: -100, max: 100 }),
    NUMBER("line.labels.rounding", { def: 0, min: 0, max: 6 }),
    COLOR("line.labels.color", { def: "#1A1A1A" }),
    CHECKBOX("line.area.useGradient", { def: true }),
    RANGE("line.area.opacity", { def: 30, min: 0, max: 100 }),

    CHECKBOX("line.dot.useSerieColor", { def: false }),
    COLOR("line.dot.fill", { def: "#FFFFFF" }),
    NUMBER("line.dot.strokeWidth", { def: 2, min: 0, max: 12, step: 0.1 }),

    CHECKBOX("line.tag.followValue", { def: true }),
    NUMBER("line.tag.fontSize", { def: 14 }),

    RANGE("line.interLine.fillOpacity", { def: 0.25, min: 0, max: 1, step: 0.01 }),

    NUMBER("plot.radius", { def: 6, min: 0, max: 20 }),
    CHECKBOX("plot.useGradient", { def: true }),
    NUMBER("plot.strokeWidth", { def: 2, min: 1, max: 20 }),
    CHECKBOX("plot.labels.show", { def: true }),
    NUMBER("plot.labels.offsetY", { def: -8, min: -100, max: 100 }),
    NUMBER("plot.labels.rounding", { def: 0, min: 0, max: 6 }),
    COLOR("plot.labels.color", { def: "#1A1A1A" }),

    CHECKBOX("plot.dot.useSerieColor", { def: false }),
    COLOR("plot.dot.fill", { def: "#FFFFFF" }),
    NUMBER("plot.dot.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.1 }),

    CHECKBOX("plot.tag.followValue", { def: true }),
    NUMBER("plot.tag.fontSize", { def: 14 }),

    NUMBER("table.responsiveBreakpoint", { def: 400, min: 350, max: 800 }),
    NUMBER("table.rounding", { def: 0, min: 0, max: 6 }),
    CHECKBOX("table.sparkline", { def: true }),
    TEXT("table.columnNames.period", { def: "Period" }),
    TEXT("table.columnNames.total", { def: "Total" }),
    COLOR("table.th.backgroundColor", { def: "#FAFAFA" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "" }),
    COLOR("table.td.backgroundColor", { def: "#FAFAFA" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "" }),
    CHECKBOX("table.showSum", { def: true }),
    CHECKBOX("table.useDefaultTimeFormat", { def: true }),

    CHECKBOX("showTable", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    CHECKBOX("chart.comments.show", { def: true }),
    CHECKBOX("chart.comments.showInTooltip", { def: true }),
    NUMBER("chart.comments.width", { def: 200, min: 50, max: 400 }),
    NUMBER("chart.comments.offsetY", { def: 0, min: -100, max: 100 }),

    CHECKBOX("chart.userOptions.print.allowTaint", { def: true }),
    COLOR("chart.userOptions.print.backgroundColor", { def: "#FFFFFF" }),
    CHECKBOX("chart.userOptions.print.useCORS", { def: true }),
    NUMBER("chart.userOptions.print.scale", { def: 4, min: 1, max: 5 })
]);


const testCustomTooltip = ref(false);

const { themeOptions, currentTheme } = useThemeOptions();

const size = ref({
    height: 600,
    width: 1000
})

const timeValues = computed(() => {
  const arr = []
  const year = 2026

  for (let month = 1; month <= 12; month++) {
    const daysInMonth = new Date(year, month, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const dd = String(day).padStart(2, '0')
      const mm = String(month).padStart(2, '0')
      arr.push(`${year}-${mm}-${dd}`)  // ISO format
    }
  }

  console.log(arr)

  return arr
})

// const monthValues = computed(() => {
//   const yearStart = 2026
//   const arr = []

//   for (let i = 0; i < 13; i++) {
//     // monthIndex goes 0→12 (Jan 2026 → Jan 2027)
//     const date = new Date(yearStart, i, 1)
//     const yyyy = date.getFullYear()
//     const mm   = String(date.getMonth() + 1).padStart(2, '0')
//     const dd   = String(date.getDate()).padStart(2, '0')  // always "01" here

//     arr.push(`${yyyy}-${mm}-${dd}`)
//   }

//   return arr
// })

const monthValues = computed(() => {
    const yearStart = 2026
    const arr = []

    for (let i = 0; i < 13; i++) {
        const d = new Date(yearStart, i, 1)
        arr.push(d.getTime())
    }

    return arr
})

const selectedIndex = ref(null);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    if (testCustomTooltip.value) {
        return {
            ...c,
            chart: {
                ...c.chart,
                height: size.value.height,
                width: size.value.width,
                tooltip: {
                    ...c.tooltip,
                    customFormat: ({ datapoint }) => {
                        let html = "";
                        datapoint.forEach(d => {
                            html += `<li>${d.name} : ${d.value}</li>`
                        })
                        return `<ul>${html}</ul>`
                    }
                }
            }
        }
    } else {
        return {
            ...c,
            events: {
                datapointEnter: ({ datapoint, seriesIndex }) => {
                    console.log('enter event', { datapoint, seriesIndex })
                    selectedIndex.value = seriesIndex
                },
                datapointLeave: ({ datapoint, seriesIndex }) => {
                    console.log('leave event', { datapoint, seriesIndex })
                    selectedIndex.value = null;
                },
                datapointClick: ({ datapoint, seriesIndex }) => {
                    console.log('click event', { datapoint, seriesIndex })
                }
            },
            customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
            theme: currentTheme.value,
            line: {
                ...c.line,
                interLine: {
                    ...c.line.interLine,
                    pairs: [
                        ['Serie A', 'Serie B']
                    ]
                },
                labels: {
                    ...c.line.labels,
                    // formatter: ({value, config}) => {
                    //     return `f - ${value}`
                    // }
                },
                tag: {
                    formatter: ({ value, config }) => {
                        const { datapoint, seriesIndex, serieName } = config;
                        // console.log(datapoint, seriesIndex, serieName)
                        return `<div>${serieName}: <b>${value.toFixed(2)}</b></div>`
                    }
                }
            },
            plot: {
                ...c.plot,
                labels: {
                    ...c.plot.labels,
                    // formatter: ({value, config}) => {
                    //     return `f - ${value}`
                    // }
                }
            },
            bar: {
                ...c.bar,
                labels: {
                    ...c.bar.labels,
                    // formatter: ({value, config}) => {
                    //     return `f - ${value}`
                    // }
                }
            },
            chart: {
                ...c.chart,
                // Attempt a scale groups
                annotations: [
                    {
                        show: false,
                        yAxis: {
                            yTop: 125,
                            yBottom: 70,
                            label: {
                                text: 'average',
                                textAnchor: 'start', // or end
                                position: 'start', // or end
                                offsetY: 0,
                                offsetX: 0,
                                border: {
                                    stroke: '#FF0000',
                                    strokeWidth: 1,
                                    rx: 0,
                                    ry: 0
                                },
                                padding: {
                                    top: 5,
                                    right: 10,
                                    bottom: 5,
                                    left: 10
                                },
                                fontSize: 14,
                                color: '#1A1A1A',
                                backgroundColor: '#E1E5E8'
                            },
                            line: {
                                stroke: '#1A1A1A',
                                strokeWidth: 1,
                                strokeDasharray: 2,
                            },
                            area: {
                                fill: '#E1E5E8',
                                opacity: 50
                            }
                        }
                    }
                ],
                scaleGroups: {
                    enabled: true,
                    groups: [
                        { name: 'percentage', scaleMin: 0, scaleMax: 100 },
                        { name: 'total', scaleMin: null, scaleMax: null }
                    ]
                },
                userOptions: {
                    ...c.chart.userOptions,
                    // callbacks: {
                    //     img: ({ domElement, imageUri, base64}) => {
                    //         console.log(imageUri)
                    //     },
                    //     csv: (xls) => {
                    //         console.log(xls)
                    //     },
                    //     pdf: ({ domElement, imageUri, base64}) => {
                    //         console.log(imageUri)
                    //     }
                    // },
                    print: {
                        ...c.chart.userOptions.print,
                        // onclone: (doc) => {
                        //     doc.body.style.backgroundColor = '#FF0000'
                        // }
                    }
                },
                highlightArea: [{
                    show: true,
                    from: 2,
                    to: 2,
                    color: '#00FF00',
                    opacity: 20,
                    caption: {
                        text: 'AREA 1',
                        fontSize: 12,
                        color: '#1A1A1A',
                        bold: false,
                        offsetY: 0,
                        width: 'auto',
                        padding: 3,
                        textAlign: 'center'
                    }
                },
                {
                    show: true,
                    from: 4,
                    to: 6,
                    color: '#FF0000',
                    opacity: 20,
                    caption: {
                        text: 'AREA 2',
                        fontSize: 12,
                        color: '#1A1A1A',
                        bold: false,
                        offsetY: 0,
                        width: 'auto',
                        padding: 3,
                        textAlign: 'center'
                    }
                }],
                grid: {
                    ...c.chart.grid,
                    // position: 'start',
                    labels: {
                        ...c.chart.grid.labels,
                        yAxis: {
                            ...c.chart.grid.labels.yAxis,
                            serieNameFormatter: ({ value, config }) => {
                                return value + '-TEST'
                            }
                            // formatter: ({value}) => {
                            //     return `f - ${value}`
                            // }
                        },
                        xAxisLabels: {
                            ...c.chart.grid.labels.xAxisLabels,
                            values: generateDayTimestamps(1000),
                            // values: new Array(13).fill(0).map((d,i) => {
                            //     return `Some long name\nwith a value ${i}`
                            // }),
                            // rotation: -30,
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
                },
                zoom: {
                    ...c.chart.zoom,
                    useDefaultFormat: false,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss',
                    // customFormat: ({ absoluteIndex }) => {
                    //     return String(absoluteIndex) + 'TEST'
                    // }
                },
                timeTag: {
                    ...c.chart.timeTag,
                    useDefaultFormat: false,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss',
                    customFormat: ({ absoluteIndex }) => {
                        return String(absoluteIndex) + 'TEST'
                    }
                }
            }
        }
    }
});

const step = ref(0)

function selectLegend(legend) {
    console.log({ legend })
}

function selectX(selectedX) {
    console.log({ selectedX })
}

const configTheme = computed(() => ({
    theme: currentTheme.value,
    line: {
        labels: { show: true },
    },
    bar: {
        labels: { show: true },
    },
    plot: {
        labels: { show: true },
    },
}))

// const resizable = ref(null);

// onMounted(() => {
//     const { height, width } = resizable.value.getBoundingClientRect();

//     size.value.height = height;
//     size.value.width = width;

//     const resizeObserver = new ResizeObserver((entries) => {
//         for(const entry of entries) {
//             size.value.height = entry.contentBoxSize[0].blockSize;
//             size.value.width = entry.contentBoxSize[0].inlineSize;
//         }
//     })
//     resizeObserver.observe(resizable.value)
// })

function selectTimeLabel(data) {
    console.log(data)
}

const resp = ref(null);

onMounted(async () => {
    if(vduiLocal.value) {
        const data = await vduiLocal.value.getData()
        console.log(data)
        const img = await vduiLocal.value.getImage({ scale: 4 });
    }
    if (resp.value) {
        resp.value.hideSeries('Serie A')
        setTimeout(() => {
            resp.value.showSeries('Serie A');
            resp.value.hideSeries('Serie B');
        }, 1000)
    }
})

// Basically any content can be jazzed onto the chart :)
function freestyle({ data, drawingArea }) {
    const annotated = data.filter(d => !!d.annotated);
    const points = (annotated[0]?.plots || []).filter((_, i) => annotated[0].marks.includes(i));

    return `
        <g>
            <line
                x1="${points[0]?.x}"
                x2="${points[0]?.x}"
                y1="${drawingArea.top}"
                y2="${drawingArea.bottom}"
                stroke="black"
                stroke-width="3"
            />
            <text
                x="${points[0]?.x + 12}"
                y="${drawingArea.top + 12}"
                fill="red"
                font-size="16"
            >
                This is awesome
            </text>
        </g>
    `
}

const custom = getVueDataUiConfig('vue_ui_xy', {
    colorBackground: '#1A1A1A',
    colorTextPrimary: '#CD9077',
    colorTextSecondary: '#825848',
    colorGrid: '#CD9077',
    colorBorder: '#CD9077'
});

const customConfig = computed(() => {
    return mergeConfigs({
        defaultConfig: custom,
        userConfig: {
            chart: {
                title: {
                    text: 'Title',
                    subtitle: {
                        text: 'Subtitle'
                    }
                }
            }
        }
    })
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleLabels">TOGGLE LABELS</button>
    <button @click="toggleStack">TOGGLE STACK</button>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>

    <Box :dataset="isPropsToggled ? alternateDataset : dataset" comp="VueUiXy" :config="config">
        <template #title>VueUiXy</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiXy ref="resp" :dataset="isPropsToggled ? alternateDataset : dataset" :config="{
                    ...config,
                    responsive: true,
                }" @selectTimeLabel="selectTimeLabel">

                    <!-- <template #annotator-action-close>
                        T
                    </template>
                    <template #annotator-action-color="{ color }">
                        <div :style="{ color: color }">{{ color }}</div>
                    </template>
                    <template #annotator-action-draw="{ mode }">
                        {{ mode }}
                    </template>
                    <template #annotator-action-undo="{ disabled }">
                        {{ disabled }}
                    </template>
                    <template #annotator-action-redo="{ disabled }">
                        {{ disabled }}
                    </template>
                    <template #annotator-action-delete="{ disabled }">
                        {{ disabled }}
                    </template> -->

                    <template #svg="{ svg }">
                        <g>
                            <!-- <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                            <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text> -->
                            <g v-html="freestyle(svg)"/>
                        </g>
                    </template>

                    <template #area-gradient="{ series, id }">
                        <linearGradient :id="id" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" :stop-color="series.color"/>
                            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                        </linearGradient>
                    </template>

                    <template #bar-gradient="{ series, positiveId, negativeId }">
                        <linearGradient :id="positiveId" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" :stop-color="series.color"/>
                            <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                        </linearGradient>
                        <linearGradient :id="negativeId" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
                            <stop offset="100%" :stop-color="series.color"/>
                        </linearGradient>
                    </template>

                    <!-- <template #pattern="{ seriesIndex, patternId }">
                        <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)"
                            patternUnits="userSpaceOnUse" opacity="0.5">
                            <rect width="100%" height="100%" fill="#FFFFFF20" />
                            <path fill="none" stroke="#ecc94b"
                                d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002" />
                        </pattern>

                        <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)"
                            patternUnits="userSpaceOnUse">
                            <rect width="100%" height="100%" fill="#2b2b3150" />
                            <path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5"
                                d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z" />
                        </pattern>

                        <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)"
                            patternUnits="userSpaceOnUse">
                            <rect width="100%" height="100%" fill="#2b2b31" />
                            <path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z" />
                            <path fill="#f44034"
                                d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z" />
                        </pattern>
                    </template> -->

                    <!-- <template #chart-background>
                    <div style="width: 100%; height:100%; background: radial-gradient(at top left, red, white)">
                    </div>
                </template> -->

                    <!-- <template #time-label="{ x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                        <g @click="() => selectTimeLabel({ x, y, fontSize, absoluteIndex })">
                            <text :x="x" :y="y" :font-size="fontSize" :text-anchor="textAnchor" :fill="fill">
                                {{ content }}
                            </text>
                            <text :x="x" :y="y + fontSize" :font-size="fontSize * 0.8" :text-anchor="textAnchor" fill="grey">
                                {{ content }}
                            </text>
                        </g>
                    </template> -->

                    <template #plot-comment="{ plot }">
                        <div :style="`font-size: 12px; color:${plot.color}; text-align:center`">
                            {{ plot.comment }}
                        </div>
                    </template>

                    <template #watermark="{ isPrinting }">
                        <div v-if="isPrinting" style="font-size: 100px; opacity: 0.2; transform: rotate(-10deg)">
                            WATERMARK
                        </div>
                    </template>

                    <template #source>
                        <div style="width:100%;font-size:10px;text-align:left">
                            SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis
                            nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore!
                            Sapiente aspernatur corrupti quis ad.
                        </div>
                    </template>
                </LocalVueUiXy>
            </div>
        </template>

        <template #theme>
            <LocalVueUiXy
                :dataset="dataset"
                :config="{
                    ...configTheme,
                }"
            />
        </template>

        <template #local>
            <LocalVueUiXy 
                :dataset="isPropsToggled ? alternateDataset : dataset"
                :config="isPropsToggled ? alternateConfig : config"
                :selectedXIndex="selectedIndex"
                :key="`local_${step}`" 
                @selectLegend="selectLegend"
                @selectX="selectX" ref="local">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
                <!-- <template #time-label="{ x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                    <g @click="() => selectTimeLabel({ x, y, fontSize, absoluteIndex })">
                        <text :x="x" :y="y" :font-size="fontSize" :text-anchor="textAnchor" :fill="fill">
                            {{ content }}
                        </text>
                        <text :x="x" :y="y + fontSize" :font-size="fontSize * 0.8" :text-anchor="textAnchor"
                            fill="grey">
                            {{ content }}
                        </text>
                    </g>
                </template> -->
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionStack>
                    STACK IT
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
            </LocalVueUiXy>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiXy" :dataset="isPropsToggled ? alternateDataset : dataset"
                :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`"
                :selectedXIndex="selectedIndex"
                @selectLegend="selectLegend" @selectX="selectX" ref="vduiLocal">
                <!-- <template #time-label="{ x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                    <g @click="() => selectTimeLabel({ x, y, fontSize, absoluteIndex })">
                        <text :x="x" :y="y" :font-size="fontSize" :text-anchor="textAnchor" :fill="fill">
                            {{ content }}
                        </text>
                        <text :x="x" :y="y + fontSize" :font-size="fontSize * 0.8" :text-anchor="textAnchor"
                            fill="grey">
                            {{ content }}
                        </text>
                    </g>
                </template> -->

                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiXy :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" :selectedXIndex="selectedIndex"
                @selectX="selectX" ref="build">
                <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                    <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                        <text
                            :x="x"
                            :y="y"
                            :font-size="fontSize"
                            :text-anchor="textAnchor"
                            :fill="fill"
                        >
                            {{ content }}
                        </text>
                        <text
                            :x="x"
                            :y="y + fontSize"
                            :font-size="fontSize * 0.8"
                            :text-anchor="textAnchor"
                            fill="grey"
                        >
                            {{ content }}
                        </text>
                    </g>
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template> 
            </VueUiXy>
        </template>

        <template #build-treesh>
            <VueUiXyTreeshaken 
                :dataset="isPropsToggled ? alternateDataset : dataset" 
                :config="isPropsToggled ? alternateConfig : config"
                :selectedXIndex="selectedIndex"
                @selectX="selectX"
            >
            </VueUiXyTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiXy" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" :selectedXIndex="selectedIndex"
                @selectLegend="selectLegend" @selectX="selectX" ref="vduiBuild">
                <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                    <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                        <text
                            :x="x"
                            :y="y"
                            :font-size="fontSize"
                            :text-anchor="textAnchor"
                            :fill="fill"
                        >
                            {{ content }}
                        </text>
                        <text
                            :x="x"
                            :y="y + fontSize"
                            :font-size="fontSize * 0.8"
                            :text-anchor="textAnchor"
                            fill="grey"
                        >
                            {{ content }}
                        </text>
                    </g>
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template> 
            </VueDataUi>
        </template>

        <template #custom-config>
            <LocalVueUiXy :dataset="dataset" :config="customConfig"/>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>

    <!-- UNCOMMENT TO TEST PERF -->

    <!-- <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap: 12px">
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
        <LocalVueUiXy 
            :dataset="isPropsToggled ? alternateDataset : dataset"
            :config="isPropsToggled ? alternateConfig : config"
            :selectedXIndex="selectedIndex"
            :key="`local_${step}`" 
            @selectLegend="selectLegend"
            @selectX="selectX">
        </LocalVueUiXy>
    </div> -->

</template>
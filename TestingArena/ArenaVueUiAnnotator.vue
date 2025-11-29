<script setup>
import { ref, computed } from "vue";
import LocalVueUiAnnotator from "../src/components/vue-ui-annotator.vue";
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import Donut from "../src/components/vue-ui-donut.vue";

const model = ref([
    { key: 'alwaysVisible', def: true, type: 'checkbox' }
])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c
    }
})

const donutDataset = ref([
    { name: 'AAAA', values: [1]},
    { name: 'BBB', values: [1]},
    { name: 'CCC', values: [1]},
])

function save(data) {
    console.log(data)
}

const shapes = ref([
    {
        "id": "arrow_4909.823418513594_1759038266111",
        "x": 723.8965669991111,
        "y": 372.22516118318083,
        "endX": 178.69234241628365,
        "endY": 273.4312212738017,
        "type": "arrow",
        "color": "#000000",
        "strokeWidth": 1,
        "isDash": false
    },
    {
        "id": "arrow_9202.39331107313_1759038235883",
        "x": 795.5843061366688,
        "y": 289.83256882629405,
        "endX": 343.3550147734734,
        "endY": 271.18044156270525,
        "type": "arrow",
        "color": "#000000",
        "strokeWidth": 1,
        "isDash": false
    },
    {
        "alpha": "",
        "id": "rect_3890.905007162624_1759038303024",
        "color": "#000000",
        "isFilled": false,
        "rectStrokeWidth": 2,
        "rectHeight": 36.87357219282265,
        "rectWidth": 120.46716404962268,
        "type": "rect",
        "x": 472.3568257058048,
        "y": 222.58696641235304,
        "strokeWidth": 1,
        "isDash": false
    },
    {
        "id": "text_8426.06776491122_10863.01208820303",
        "type": "text",
        "lines": 0,
        "x": 486.6162893603991,
        "y": 247.12656356972508,
        "textContent": "Lorem ipsum",
        "fontSize": 16,
        "textAlign": "start",
        "isBold": false,
        "isItalic": false,
        "isUnderline": false,
        "color": "#000000",
        "isBulletTextMode": false
    }
]);

const initLastSelectedShape = ref({
    "alpha": "FA",
    "id": "circle_4641.74639444795_1697899591317",
    "color": "#ff6400",
    "isFilled": true,
    "circleRadius": 23.086461422195327,
    "circleStrokeWidth": 2,
    "type": "circle",
    "x": 83.33469387819179,
    "y": 141.20597309543473,
    "strokeWidth": 1,
    "isDash": false
});

// TODO: vdui & build renders; add knobs

</script>

<template>
    <Box :config="config">
        <template #local>
            <LocalVueUiAnnotator @saveAnnotations="save" :config="config" :dataset="{ shapes }">
                <div>
                    <Donut :dataset="donutDataset"/>
                </div>
            </LocalVueUiAnnotator>
        </template>
    </Box>
</template>
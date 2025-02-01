<script setup>
import { ref, computed } from "vue";
import LocalVueUiCirclePack from '../src/components/vue-ui-circle-pack.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

function makeDs({ name, qty, maxVal }) {
    let datapoints = [];
    for (let i = 0; i < qty; i += 1) {
        datapoints.push({
            name: `Datapoint ${i}`,
            value: Math.random() * maxVal,
            // color: '#FFFFFF',
            // breakdown: [
            //     { name: 'br 1', value: Math.random() * 10 },
            //     { name: 'br 2', value: Math.random() * 20 },
            //     { name: 'br 3', value: Math.random() * 30 },
            // ]
        });
    }
    return datapoints
}

const dataset = ref(makeDs({ name: 'Pack 1', qty: 120, maxVal: 2000 }))

const model = ref([
])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c
    }
})

const step = ref(0);

</script>

<template>
    <Box>
        <template #title>VueUiCirclePack</template>

        <template #local>
            <LocalVueUiCirclePack
                debug
                :dataset="dataset"
                :config="config"
                ref="local"
                :key="`local_${step}`"
            >
            <!-- <template #zoom-label="{ x, y, name, value, color, zoomOpacity, currentRadius, fontSize }">
                <foreignObject
                    :x="x - currentRadius / 2"
                    :y="y - currentRadius / 2"
                    :width="currentRadius"
                    :height="currentRadius"
                >
                    <div :style="{color}">
                        {{ name }}
                    </div>
                </foreignObject>
            </template> -->
        </LocalVueUiCirclePack>
        </template>
    </Box>
</template>
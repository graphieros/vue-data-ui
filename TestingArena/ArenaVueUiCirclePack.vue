<script setup>
import { ref, computed } from "vue";
import LocalVueUiCirclePack from '../src/components/vue-ui-circle-pack.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

function makeDs({ name, qty, maxVal }) {
    let children = [];
    for (let i = 0; i < qty; i += 1) {
        children.push({
            name: `child ${i}`,
            value: Math.random() * maxVal,
            // color: '#FFFFFF',
            // breakdown: [
            //     { name: 'br 1', value: Math.random() * 10 },
            //     { name: 'br 2', value: Math.random() * 20 },
            //     { name: 'br 3', value: Math.random() * 30 },
            // ]
        });
    }
    return {
        name,
        children
    }
}

const dataset = ref(makeDs({ name: 'Pack 1', qty: 100, maxVal: 100 }))

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
            />
        </template>
    </Box>
</template>
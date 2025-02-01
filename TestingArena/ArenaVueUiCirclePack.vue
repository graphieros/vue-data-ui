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
            value: Math.random() * maxVal
        });
    }
    return {
        name,
        children
    }
}

const dataset = ref([
    makeDs({ name: 'Pack 1', qty: 33, maxVal: 100 }),
    makeDs({ name: 'Pack 2', qty: 5, maxVal: 1000 }),
    makeDs({ name: 'Pack 3', qty: 5, maxVal: 1000 }),
])

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
                :dataset="dataset"
                :config="config"
                ref="local"
                :key="`local_${step}`"
            />
        </template>
    </Box>
</template>
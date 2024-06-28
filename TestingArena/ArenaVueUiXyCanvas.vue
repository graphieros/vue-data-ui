<script setup>
import { ref, computed } from "vue";
import LocalVueUiXyCanvas from '../src/components/vue-ui-xy-canvas.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
        {
            name: "S0",
            series: [10, 20, 12, 13, 10, -20, 30, 20, 12, 16, 32, 64],
            type: "line",
            smooth: false,
            useArea: true,
            dataLabels: true,
            scaleSteps: 2,
        },
        {
            name: "S1",
            series: [8, 4, 8, 16, 12, 13, -16, 25, 12, 3, 7, 12, 6],
            type: "bar",
            smooth: false,
            useArea: true,
            scaleSteps: 2,
        },
        {
            name: "S2",
            series: [10,12,10,12, 25, 12, 4, 4, 3, 7, 8, 9, 12],
            type: "line",
            smooth: false,
            useArea: true,
            scaleSteps: 2
        },
        // {
        //     name: "S3",
        //     series: [23.12, 23.12, 23.05, 23.07, null, 23.69, 23.72, 23.25, 23.36, 23.41, 23.65],
        //     type: "line",
        //     smooth: false,
        //     useArea: true,
        //     scaleSteps: 5,
        //     autoScaling: false,
        //     stackRatio: 0.5
        // },
    ])

    const model = ref([])
    const step = ref(0)

    const config = computed(() => {
        const c = convertArrayToObject(model.value);
        return {
            ...c
        }
    })

</script>

<template>
    <!-- <div style="margin: 12px 0; color: white">Z
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div> -->
    <Box>
        <template #title>VueUiXyCanvas</template>

        <template #local>
            <LocalVueUiXyCanvas :dataset="dataset" :config="config" :key="`local_${step}`"></LocalVueUiXyCanvas>
        </template>

        <template #VDUI-local>
            <!-- <LocalVueDataUi component="VueUiXy" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`"
                @selectLegend="selectLegend" @selectX="selectX">

            </LocalVueDataUi> -->
        </template>

        <template #build>

        </template>

        <template #VDUI-build>
        </template>

        <template #knobs>
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :type="knob.type" :min="knob.min ?? 0"
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
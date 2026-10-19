<script setup>
import { ref } from 'vue';
import VueUiGraph from '../components/vue-ui-graph.vue';
import { graphExamples } from './examples';
const index = ref(0);
</script>
<template>
    <section>
        <label
            >Graph example
            <select v-model="index">
                <option
                    v-for="(example, i) in graphExamples"
                    :key="i"
                    :value="i"
                >
                    {{ example.name }}
                </option>
            </select></label
        >
        <VueUiGraph
            :key="index"
            :dataset="graphExamples[index].dataset"
            :config="graphExamples[index].config"
        />
    </section>
</template>

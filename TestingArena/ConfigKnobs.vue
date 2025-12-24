<script setup>
import { ref, computed, nextTick, watch } from "vue";
import BaseIcon from "../src/atoms/BaseIcon.vue";

const props = defineProps({
    model: {
        type: Object,
    },
    step: {
        type: Number
    },
    open: {
        type: Boolean
    }
});

defineEmits(['change']);

function getKnobStyle(key) {
    const depth = key.split('.').length;
    return `margin-left:${depth}rem;`
}

const search = ref('');

const filteredModel = computed(() => {
    if (!search.value) return props.model;
    return props.model.filter(knob =>
        knob.key.toLowerCase().includes(search.value.toLowerCase())
    );
});

const configSearch = ref(null);

async function focusSearch() {
    search.value = '';
    await nextTick();
    await nextTick();
    configSearch.value?.focus();
}

watch(() => props.open, (state) => {
    setTimeout(() => {
        state && focusSearch();
    }, 20)
})

</script>

<template>
    <div class="knobs" style="width: 100%; color: #CCCCCC;">
        <div class="nav-search-wrapper">
            <input
                v-model="search"
                ref="configSearch"
                type="text"
                class="nav-search"
                placeholder="Filter config keys"
            />
            <button @click="focusSearch"><BaseIcon name="close"/> </button>
        </div>

        <div
            v-for="(knob, i) in filteredModel"
            :key="knob.key"
            class="knob"
            :style="getKnobStyle(knob.key)"
        >
            <label><code>{{ knob.key }}</code></label>
            <div>
                <input 
                    type="color" 
                    v-if="knob.type === 'color'" 
                    v-model="knob.def" @change="$emit('change')"
                    :list="`preset_${i}`"
                >
                    <datalist :id="`preset_${i}`">
                        <option>#1A1A1A</option>
                        <option>#8A8A8A</option>
                        <option>#CCCCCC</option>
                        <option>#FFFFFF</option>
                        <option>#1f77b4</option>
                        <option>#aec7e8</option>
                        <option>#ff7f0e</option>
                        <option>#ffbb78</option>
                        <option>#2ca02c</option>
                        <option>#d62728</option>
                        <option>#ff9896</option>
                    </datalist>
                </input>

                <input
                    v-if="!['none', 'select', 'color'].includes(knob.type)"
                    :step="knob.step"
                    :type="knob.type"
                    :min="knob.min ?? 0"
                    :max="knob.max ?? 0"
                    v-model="knob.def"
                    @change="$emit('change')"
                />

                <select
                    v-if="knob.type === 'select'"
                    v-model="knob.def"
                    @change="$emit('change')"
                >
                    <option v-for="opt in knob.options">{{ opt }}</option>
                </select>
            </div>
        </div>
    </div>
</template>

<style scoped>
.knobs {
    display: flex;
    flex-direction: column;
    max-height: 400px;
    overflow-y: auto;
    background: #2A2A2A;
}

.knob {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 3rem;
    gap: 1rem;
}

.nav-search-wrapper {
    position: sticky;
    width: 100%;
    background: #2A2A2A;
    top: 0;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding-bottom: 1rem;
    padding-left: 1rem;
}

.nav-search-wrapper button {
    display: flex;
    align-items:center;
    justify-content:center;
    background-color: #3A3A3A;
    border-radius: 0 0.3rem 0.3rem 0;
    border: none;
    padding: 0.2rem;
    cursor: pointer;
}
.nav-search-wrapper button:hover {
    background-color: #4A4A4A;
}

.nav-search {
    width: 300px;
    box-sizing: border-box;
    padding: 0.35rem 0.5rem;
    border-radius: 0.3rem 0 0 0.3rem;
    border: 1px solid var(--color-border);
    font-size: 0.85rem;
    background: #3A3A3A;
    color: #CCCCCC;
}
</style>

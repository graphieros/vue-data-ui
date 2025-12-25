<script setup>
import { ref, computed, nextTick, watch } from "vue";
import BaseIcon from "../src/atoms/BaseIcon.vue";
import { createUid } from "../src/lib";

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
    return `margin-left:${getDepth(key)}rem;`
}

function getDepth(key) {
    return key.split('.').length -1;
}

const search = ref('');

const filteredModel = computed(() => {
    if (!search.value) return props.model.map(k => ({...k, uid: createUid()}));
    return props.model.filter(knob =>
        knob.key.toLowerCase().includes(search.value.toLowerCase())
    ).map(k => ({ ...k, uid: createUid() }))
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


const selectedItem = ref(null);

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
                style="z-index: 1"
            />
            <button @click="focusSearch" style="position:relative">
                <BaseIcon name="blur" stroke="#42d392"/>
                <BaseIcon name="close" stroke="#5f8aee" style="position: absolute;"/>
            </button>
        </div>

        <div
            v-for="(knob, i) in filteredModel"
            :key="knob.key"
            class="knob"
        >
            <label :for="knob.uid" @mouseenter="selectedItem = knob.uid" @mouseout="selectedItem = null">
                <code style="display:flex;flex-direction:row;flex-wrap:nowrap;cursor:pointer;">
                    <div style="color:#6A6A6A">{{ getDepth(knob.key) }}</div>
                    <span v-for="d in getDepth(knob.key)" :style="`margin-top:-7px; color: ${selectedItem === knob.uid ? '#42d392' : '#5A5A5A'}; transition:color 0.1s`">_</span>
                    <span v-if="getDepth(knob.key) > 0" :style="`color: ${selectedItem === knob.uid ? '#42d392' : '#5A5A5A'}; transition: color 0.1s`">{</span>
                    <span style="padding-left:0.5rem">{{ knob.key.split('.').slice(0,-1).join('.') }}</span><span v-if="getDepth(knob.key) > 0">.</span><span style="font-weight: bold; color: #42d392">{{ knob.key.split('.').at(-1) }}</span>
                </code>
            </label>
            <div>
                <input
                    :id="knob.uid"
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
                    :id="knob.uid"
                    v-if="!['none', 'select', 'color'].includes(knob.type)"
                    :step="knob.step"
                    :type="knob.type"
                    :min="knob.min ?? 0"
                    :max="knob.max ?? 0"
                    v-model="knob.def"
                    @change="$emit('change')"
                />

                <select
                    :id="knob.uid"
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

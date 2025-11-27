<script setup>
import LocalVueDataUi from "../src/components/vue-data-ui.vue";

defineProps({
    comp: {
        type: String
    },
    dataset: {
        type: [Object, Array]
    }
})

function refresh() {
    location.reload()
}

</script>

<template>
    <h1 class="gradient-text" style="width:fit-content; font-weight: 900"><slot name="title"/></h1>
    <button class="reset" @click="refresh">RELOAD PAGE</button>

    <div class="knobs">
        <details>
            <summary>Config knobs</summary>
            <slot name="knobs"/>
        </details>
    </div>

    <div v-if="$slots.responsive" style="margin-left:1rem">
        Reponsive (Local component)
        <slot name="responsive"/>
    </div>

    <div style="width: 100%; max-width: 600px; padding: 12px" v-if="comp">
        <div style="margin: 12px 0; color: grey">Default config (local VueDataUi universal component, knobs don't apply):</div>
        <LocalVueDataUi :component="comp" :dataset="dataset"/>
    </div>
    
    <div class="box">
        <div style="width:100%; max-width: 600px">
            <p>Local (default config with theme only, knobs don't apply)</p>
            <slot name="theme"/>
        </div>
        <div style="width:100%; max-width: 600px">
            <p>Local</p>
            <slot name="local"/>
        </div>
        <div style="width:100%; max-width: 600px">
            <p>VueDataUi Local</p>
            <slot name="VDUI-local"/>
        </div>
        <div style="width: 100%; max-width: 600px">
            <p>Build (legacy import)</p>
            <slot name="build"/>
        </div>
        <div style="width: 100%; max-width: 600px">
            <p>Build (treeshaking import)</p>
            <slot name="build-treesh"/>
        </div>
        <div style="width: 100%; max-width: 600px">
            <p>VueDataUi build</p>
            <slot name="VDUI-build"/>
        </div>
    </div>

    <div class="config">
        <code>
            <slot name="config"/>
        </code>
    </div>
</template>

<style scoped>
summary {
    color: white;
    user-select: none;
    cursor: pointer;
    background: #2A2A2A;
    padding: 12px;
}
h1, p {
    color: #CCCCCC;
}
.box {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    justify-content: center;
    align-items:center;
    align-content: center;
    justify-items: center;
    gap: 12px;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
}
.config {
    color: #CCCCCC;
    margin: 24px 0;
    padding: 0 24px;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
}
.knobs {
    margin: 0 auto;
    width: 100%;
    max-width: 1600px;
    padding: 0 24px;
    margin-top: 24px;
    position: fixed;
    top: 0;
    right: 0;
    width: 800px;
    z-index: 10000000;
}
.reset {
    background: #ff6400;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 3px;
    margin: 12px 0;
}
code {
    color: #42d392;
}
</style>
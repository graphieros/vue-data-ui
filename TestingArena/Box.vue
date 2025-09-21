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
    <button class="reset" @click="refresh">RESET</button>
    <h1><slot name="title"/></h1>

    <div style="width: 100%; max-width: 600px; padding: 12px" v-if="comp">
        <div style="margin: 12px 0; color: grey">Default config (local VueDataUi universal component):</div>
        <LocalVueDataUi :component="comp" :dataset="dataset"/>
    </div>

    <div class="knobs">
        <details>
            <summary>Config knobs</summary>
            <slot name="knobs"/>
        </details>
    </div>
    
    <div class="box">
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
    margin:12px 0;
    user-select: none;
    cursor: pointer;
    background: #FFFFFF10;
    padding: 12px;
    width: calc(100% - 48px);
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
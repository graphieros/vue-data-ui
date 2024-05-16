<script setup>
function refresh() {
    location.reload()
}

</script>

<template>
    <button class="reset" @click="refresh">RESET</button>
    <h1><slot name="title"/></h1>
    <div class="box">
        <div style="width:100%">
            <p>Local</p>
            <slot name="local"/>
        </div>
        <div style="width:100%">
            <p>VueDataUi Local</p>
            <slot name="VDUI-local"/>
        </div>
        <div style="width: 100%">
            <p>Build</p>
            <slot name="build"/>
        </div>
        <div style="width: 100%">
            <p>VueDataUi build</p>
            <slot name="VDUI-build"/>
        </div>
    </div>
    <div style="width: calc(100% - 48px); margin-top: 24px;padding: 0 24px">
        <button class="reset" @click="refresh">RESET</button>
        <slot name="knobs"/>
    </div>

    <div class="config">
        <code>
            <slot name="config"/>
        </code>
    </div>
</template>

<style scoped>
h1, p {
    color: #CCCCCC;
}
.box {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    width: 100%;
}
.config {
    color: #CCCCCC;
    margin: 24px 0;
    padding: 0 24px;
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
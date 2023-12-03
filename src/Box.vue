<script setup>
import { ref } from "vue";
const showConfig = ref(false);

const emit = defineEmits(['copy'])

const isCopying = ref(false);

function copy() {
    emit('copy');
    isCopying.value = true;
    setTimeout(() => {
        isCopying.value = false;
    }, 1000);
}

</script>

<template>
    <div style="width: 100%;margin-top:12px; background: #e1e5e8">
        <details>
            <summary style="user-select:none;cursor:pointer;height:30px;background:linear-gradient(to right, #e1e5e8, white);line-height:24px;font-size:24px;padding:12px;">
                <slot name="title"></slot>
            </summary>
            <div style="display: flex; flex-direction:column;">
                <button class="btn" @click="showConfig = !showConfig">
                    Config &nbsp;<span v-if="showConfig">&lt;</span><span v-else>&gt;</span>
                </button>
                <br>
                <code :class="{cde: true, wow: isCopying}" v-if="showConfig" @click="copy">
                    <slot name="config"></slot>
                </code>
            </div>
            <div style="display: flex;flex-direction:row; gap:12px; align-items:center;justify-content:center;background:#e1e5e8;padding:12px">
                <div style="width:100%;padding:12px;">
                    <div style="width:100%;text-align:center">DEV</div>
                    <slot name="dev"></slot>
                </div>
                <div style="width:100%;padding:12px">
                    <div style="width:100%;text-align:center">PRODUCTION</div>
                    <slot name="prod"></slot>
                </div>
            </div>
        </details>
    </div>
</template>

<style scoped>
.btn {
    border: none;
    width: 100px;
    height: 40px;
    background: #fafafa;
    cursor: pointer;
    border: 1px solid #CCCCCC;
    border-radius: 6px;
    margin-top: 24px;
    margin-left: 24px;
    box-shadow: 0 6px 12px -6px rgba(0, 0,0,0.6);
}
.cde {
    background: rgba(0,0,0,0.8);
    margin-left: 24px;
    margin-right: 24px;
    color: #fafafa;
    padding: 12px;
    border-radius: 6px;
    cursor: copy;
    outline: 2px solid greenyellow;
}
.wow {
    animation: wow 0.2s ease-in-out;
}
@keyframes wow {
    0% {
        transform: scale(0.99, 0.99);
    }
    80% {
        transform: scale(1.01, 1.01);
    }
    100% {
        transform: scale(1, 1);
    }
}
</style>
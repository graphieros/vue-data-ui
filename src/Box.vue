<script setup>
import { ref } from "vue";
const showConfig = ref(false);

const props = defineProps({
    open: {
        type: Boolean,
        default: false
    },
    misc: {
        type: Boolean,
        default: false
    }
})

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
    <div style="width: 100%;margin-top:12px; background: #2A2A2A;">
        <details :open="open">
            <summary style="user-select:none;cursor:pointer;height:30px;background:linear-gradient(to right, #2A2A2A, #1A1A1A);line-height:24px;font-size:24px;padding:12px; display: flex; align-items:center; gap: 6px">
                <div style="color:#42d392">
                    <slot name="title"></slot>
                </div>
            </summary>
            <div style="display: flex; flex-direction: row; gap: 24px; align-items:center;justify-content:center; padding: 24px">
                <slot name="misc"/>
            </div>
            <div style="display: flex; flex-direction:column;" v-if="!misc">
                <button class="btn" @click="showConfig = !showConfig">
                    Config &nbsp;<span v-if="showConfig">&lt;</span><span v-else>&gt;</span>
                </button>
                <br>
                <small style="margin-left: 24px; margin-bottom: 12px; color: #AAAAAA" v-if="showConfig">Click to copy</small>
                <code :class="{cde: true, wow: isCopying}" v-if="showConfig" @click="copy">
                    <slot name="config"></slot>
                </code>
            </div>
            <div style="padding-left:24px">
                <slot name="general"/>
            </div>
            <div style="display: flex;flex-direction:row; gap:12px; align-items:center;justify-content:center;background:#2A2A2A;padding:12px" v-if="!misc">
                <div style="width:100%;padding:12px;">
                    <div style="width:100%;text-align:center;color: #ff6400;margin-bottom:12px">DEV</div>

                    <div style="resize:both;overflow: auto; border: 1px solid #ff6400; padding: 12px; border-radius: 6px">
                        <slot name="dev"></slot>
                    </div>
                </div>
                <div style="width:100%;padding:12px">
                    <div style="width:100%;text-align:center;color: #42d392;margin-bottom:12px">PRODUCTION</div>

                    <div style="resize:both;overflow: auto; border: 1px solid #42d392; padding: 12px;border-radius: 6px">
                        <slot name="prod"></slot>
                    </div>
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
    background: linear-gradient(to bottom right, #42d392, #42d392AA);
    font-weight: bold;
    cursor: pointer;
    border-radius: 6px;
    margin-top: 24px;
    margin-left: 24px;
    box-shadow: 0 6px 12px -6px rgba(0, 0,0,0.6);
    color: white;
}

.btn:hover {
    background: linear-gradient(to top left, #42d392, #42d392AA);
}
.cde {
    background: #1A1A1A;
    margin-left: 24px;
    margin-right: 24px;
    color: #fafafa;
    padding: 12px;
    border-radius: 6px;
    cursor: copy;
    outline: 2px solid #42d392;
}

summary::marker {
    color: #A6A6A6;
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

@keyframes details-show {
  from {
    opacity:0;
    transform: var(--details-translate, translateY(-0.5em));
  }
}

details[open] > *:not(summary) {
  animation: details-show 250ms ease-in-out;
}
</style>
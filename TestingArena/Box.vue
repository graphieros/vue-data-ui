<script setup>
import { computed, ref } from "vue";
import LocalVueDataUi from "../src/components/vue-data-ui.vue";
import BaseIcon from "../src/atoms/BaseIcon.vue";
import { adaptColorToBackground } from "../src/lib";

const props = defineProps({
    comp: {
        type: String
    },
    dataset: {
        type: [Object, Array]
    },
    config: {
        type: Object,
    }
})

function refresh() {
    location.reload()
}

const configContent = ref(null);
const copying = ref(false);

const to = ref(null)

function waitCopy() {
    if (to.value) clearTimeout(to.value);
    to.value = setTimeout(() => {
        copying.value = false;
    }, 500)
}

function sortJsonKeysDeep(value) {
    if (value === null) {
        return null;
    }

    if (Array.isArray(value)) {
        return value.map((item) => sortJsonKeysDeep(item));
    }

    if (typeof value === "object") {
        const sortedObject = {};
        Object.keys(value)
            .sort()
            .forEach((key) => {
                sortedObject[key] = sortJsonKeysDeep(value[key]);
            });
        return sortedObject;
    }

    if (typeof value === 'function') {
        return value.toString().replace(/\s+/g, ' ')
    }

    return value;
}

async function copy(text, stringify = false) {
    copying.value = true;
    const txt = stringify ? JSON.stringify(text) : text;
    if (navigator.clipboard && window.isSecureContext) {
        waitCopy();
        return navigator.clipboard.writeText(txt);
    } else {
        const textarea = document.createElement("textarea");
        textarea.value = txt;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand("copy");
        } finally {
            document.body.removeChild(textarea);
            waitCopy();
        }
    }
}

const highlightedConfig = computed(() => {
    try {
        const json = JSON.stringify(sortJsonKeysDeep(props.config), null, 2);

        return json
        .replaceAll('{', `<span style='color:#8A8A8A;'>{</span>`)
        .replaceAll('}', `<span style='color:#8A8A8A;'>}</span>`)
        .replaceAll(',', `<span style='color:#CCCCCC'>,</span>`)
        // keys
        .replace(/"([^"]+)"(?=\s*:)/g, (fullMatch, keyName) => {
            return `<span style='color:#9cdcfe'>${keyName}</span>`;
        })
        // booleans and null
        .replace(/:\s*(true|false|null)/g, (fullMatch, booleanValue) => {
            const color = '#559AD3';
            return `: <span style='color:${color}'>${booleanValue}</span>`;
        })
        // numbers as values (after colon)
        .replace(/:\s*(-?\d+(\.\d+)?)/g, (fullMatch, numberValue) => {
            return `: <span style='color:#AEC6A1'>${numberValue}</span>`;
        })
        // numbers in arrays
        .replace(/^(\s*)(-?\d+(\.\d+)?)/gm, (fullMatch, indent, numberValue) => {
            return `${indent}<span style='color:#AEC6A1'>${numberValue}</span>`;
        })
        // strings (values and array items)
        .replace(/"([^"]*)"/g, (fullMatch, valueString) => {
            const isHex =
            valueString.startsWith('#') &&
            (valueString.length === 7 || valueString.length === 9);

            if (isHex) {
            return `<span style='border-radius:2px;background:${valueString};color:${adaptColorToBackground(
                valueString
            )}'>"${valueString}"</span>`;
            }

            return `<span style='color:#CD9077'>"${valueString}"</span>`;
        });
    } catch (error) {
        console.error('{TestringAreana/Box.vue} @highlightedConfig - Parsing failed');
        return JSON.stringify(sortJsonKeysDeep(props.config), null, 2);
    }
});


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

    <button v-if="!!config" class="btn" @click="copy(config, true)">
        <BaseIcon :size="20" stroke="#42d392" v-if="copying" name="hourglass" is-spin/>
        <BaseIcon :size="20" stroke="#42d392" v-else name="copy"/>
        <code style="font-weight: bold;" v-if="!copying">
            COPY CONFIG LOG
        </code>
        <code style="font-weight: bold;" v-else>
            COPYING<span style="color:#42d392">........</span>
        </code>
    </button>
    <div style="margin-top: 1rem; display:flex;align-items:center;gap:0.5rem; background:#ffbb7820; padding: 0.5rem 1rem">
        <BaseIcon name="triangle" stroke="#ff7f0e" :size="20"/>
        <span style="color:#ffbb78">
            Callbacks are displayed inside quotes to be <i>readable</i>
        </span>
    </div>
    <div class="config">
        <code style="white-space: pre-wrap; display: block;" ref="configContent">
            <slot name="config">
                <span v-html="highlightedConfig"/>
            </slot>
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
    padding: 1rem !important;
    margin: 0.5 0 !important;
    padding: 0 24px;
    width: 100%;
    max-width: 1600px;
    margin: 0 auto;
    max-height: 500px;
    overflow: auto;
    background: #232323;
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

.btn {
    background-color: #3A3A3A;
    border: none;
    padding: 0.5rem 1rem;
    margin-top: 2rem;
    color: #CCCCCC;
    border-radius: 0.3rem;
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
    display: flex;
    align-items:center;
    gap: 0.5rem;
}
.btn:hover {
    background-color: #5A5A5A;
}
</style>
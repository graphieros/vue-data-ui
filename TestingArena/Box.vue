<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import LocalVueDataUi from "../src/components/vue-data-ui.vue";
import BaseIcon from "../src/atoms/BaseIcon.vue";
import { adaptColorToBackground } from "../src/lib";

const props = defineProps({
    comp: {
        type: String
    },
    dataset: {
        type: [Object, Array, Number]
    },
    config: {
        type: Object,
    },
    showDefault: {
        type: Boolean,
        default: true
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

const details = ref(null);
const summaryOpen = ref(false);

const knobsElement = ref(null);

const knobsMinimumWidthPx = 240;
let knobsStartClientX = 0;
let knobsStartWidthPx = 360;
let knobsResizing = false;

function onKnobsPointerDown(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    // If the handle has children or you click slightly inside it, closest is safer than classList
    const handle = target.closest(".knobs-resize-handle");
    if (!handle) return;

    event.preventDefault();

    // Ensure touch listeners are attached before the first move
    knobsResizing = true;

    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    knobsStartClientX = clientX;

    const rect = knobsElement.value?.getBoundingClientRect();
    knobsStartWidthPx = rect ? rect.width : 360;

    document.addEventListener("mousemove", onKnobsPointerMove, { passive: false });
    document.addEventListener("mouseup", onKnobsPointerUp, { passive: true });
    document.addEventListener("touchmove", onKnobsPointerMove, { passive: false });
    document.addEventListener("touchend", onKnobsPointerUp, { passive: true });
}

function onKnobsPointerMove(event) {
    if (!knobsResizing) return;

    event.preventDefault();

    const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
    const deltaX = knobsStartClientX - clientX;
    const nextWidthPx = knobsStartWidthPx + deltaX;

    const maxWidthPx = window.innerWidth - 316;
    const clampedWidthPx = Math.min(Math.max(nextWidthPx, knobsMinimumWidthPx), maxWidthPx);

    if (knobsElement.value) {
        knobsElement.value.style.width = `${clampedWidthPx}px`;
        knobsElement.value.style.maxWidth = "none";
    }
}

function onKnobsPointerUp() {
    if (!knobsResizing) return;

    knobsResizing = false;

    document.removeEventListener("mousemove", onKnobsPointerMove);
    document.removeEventListener("mouseup", onKnobsPointerUp);
    document.removeEventListener("touchmove", onKnobsPointerMove);
    document.removeEventListener("touchend", onKnobsPointerUp);
}

onBeforeUnmount(() => {
    document.removeEventListener("mousemove", onKnobsPointerMove);
    document.removeEventListener("mouseup", onKnobsPointerUp);
    document.removeEventListener("touchmove", onKnobsPointerMove);
    document.removeEventListener("touchend", onKnobsPointerUp);
});


</script>

<template>
    <div id="BOX">
        <h1 class="gradient-text" style="width:fit-content; font-weight: 900">
            <svg viewBox="0 0 20 20" height="28" width="28" style="margin-right: 0.5rem">
                <path d="M 4 19 L 16 19 C 18 19 18 17 18 17 L 12 9 L 12 3 C 13 3 13 1 12 1 L 8 1 C 7 1 7 3 8 3 L 8 9 L 2 17 C 2 17 2 19 4 19" stroke="#8A8A8A" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M 5 14 C 8 16 11 12 15 14 L 17.141 16.847 C 17.156 17.64 17.07 18.004 16 18 L 4 18 C 3.25 18.014 2.829 17.748 2.866 16.869 L 5 14" stroke="none" fill="#42d392" stroke-linecap="round" stroke-linejoin="round" style="opacity: 1"/><path d="M 5 14 C 8 16 11 12 15 14" stroke="#acf2d3" stroke-linecap="round" stroke-width="${strokeWidth / 3}"/>
            </svg>
            <slot name="title"/>
        </h1>
        <button class="btn btn-reset" @click="refresh">
            <BaseIcon :size="20" stroke="#ff7f0e" name="restart"/>
            <code style="font-weight: bold;">
                RELOAD PAGE
            </code>
        </button>
    
        <div class="knobs" ref="knobsElement" @mousedown="onKnobsPointerDown" @touchstart="onKnobsPointerDown">
            <div class="knobs-resize-handle">
                <BaseIcon name="arrowLeft" style="pointer-events: none;" stroke="#42d392"/>
                <BaseIcon name="arrowRight" style="pointer-events: none;" stroke="#42d392"/>
            </div>
            <details ref="details">
                <summary @click="summaryOpen = !summaryOpen" class="knobs-summary">
                    <BaseIcon name="sliders" stroke="#CCCCCC" :size="24" style="margin-bottom:-5.5px"/>
                    <span style="margin-left:5px; font-weight:bold;">
                        Config knobs
                    </span>
                </summary>
                <slot name="knobs" v-bind="{ summaryOpen }"/>
            </details>
        </div>
    
        <div v-if="$slots.responsive" style="margin-left:1rem">
            <div class="title">
                <div class="tag"><BaseIcon name="resize" :size="16" stroke="#1A1A1A" />Responsive</div> {{ comp }}  (Local)
            </div>
            <slot name="responsive"/>
        </div>
    
        <div style="width: 100%; max-width: 600px; padding: 12px" v-if="comp && showDefault">
            <div class="title">
                <div class="tag"><BaseIcon name="settings" :size="16" stroke="#1A1A1A" />Default config</div> {{ comp }} (local VueDataUi universal component, knobs don't apply)
            </div>
            <LocalVueDataUi :component="comp" :dataset="dataset"/>
        </div>
        
        <div class="box">
            <div style="width:100%; max-width: 600px" v-if="$slots.theme">
                <div class="title">
                    <div class="tag"><BaseIcon name="palette" :size="16" stroke="#1A1A1A" />Theme only</div> {{ comp }} (local, knobs don't apply)
                </div>
                <slot name="theme"/>
            </div>
            <div style="width:100%; max-width: 600px" v-if="$slots.local">
                <div class="title">
                    <div class="tag"><BaseIcon name="curlySpread" :size="16" stroke="#1A1A1A" />Local</div> {{ comp }}
                </div>
                <slot name="local"/>
            </div>
            <div style="width:100%; max-width: 600px" v-if="$slots['VDUI-local']">
                <div class="title">
                    <div class="tag"><BaseIcon name="curlySpread" :size="16" stroke="#1A1A1A" />VueDataUi universal</div> (local)
                </div>
                <slot name="VDUI-local"/>
            </div>
            <div style="width: 100%; max-width: 600px" v-if="$slots.build">
                <div class="title">
                    <div class="tag"><BaseIcon name="boxes" :size="16" stroke="#1A1A1A" />Build legacy import</div>{{ comp }}
                </div>
                <slot name="build"/>
            </div>
            <div style="width: 100%; max-width: 600px" v-if="$slots['build-treesh']">
                <div class="title">
                    <div class="tag"><BaseIcon name="boxes" :size="16" stroke="#1A1A1A" />Treeshaken build</div>{{ comp }}
                </div>
                <slot name="build-treesh"/>
            </div>
            <div style="width: 100%; max-width: 600px" v-if="$slots['VDUI-build']">
                <div class="title">
                    <div class="tag"><BaseIcon name="vueDataUi" :size="16" stroke="#1A1A1A" />VueDataUi universal build</div>
                </div>
                <slot name="VDUI-build"/>
            </div>
            <div style="width: 100%; max-width: 600px" v-if="$slots['custom-config']">
                <div class="title">
                    <div class="tag"><BaseIcon name="palette" :size="16" stroke="#1A1A1A" />Custom config (local)</div>
                </div>
                <slot name="custom-config"/>
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
        <div style="margin-top: 1rem; display:flex;align-items:start;gap:0.5rem; background:#ffbb7820; padding: 0.5rem 1rem">
            <BaseIcon name="triangle" stroke="#ff7f0e" :size="20"/>
            <span style="color:#ffbb78">
                Callbacks are displayed inside quotes to be <i>readable</i>.<br>
                This config is derived from the model created in the <code style="color:#66DDAA;background:#66DDAA20;padding: 0 0.5rem">Arena{{ props.comp }}.vue</code> file and is partial.<br>
                The library component resolves the model's missing config attributes from the <code style="color:#fdd663;background:#fdd66320;padding:0 0.5rem">useConfig.js</code> definition.
            </span>
        </div>
        <div class="config">
            <code style="white-space: pre-wrap; display: block;" ref="configContent">
                <slot name="config">
                    <span v-html="highlightedConfig"/>
                </slot>
            </code>
        </div>
    </div>
</template>

<style scoped>
.title {
    padding: 1rem;
    background: #5f8aee20;
    color: #5f8aee;
    display: flex;
    align-items:center;
    gap: 0.5rem;
}

.tag {
    padding: 0 0.5rem;
    border-radius: 1rem;
    background: radial-gradient(at top left, #83a4f2, #5f8aee);
    color: #1A1A1A;
    width: fit-content;
    display: flex;
    flex-direction: row;
    align-items:center;
    gap: 0.5rem;
    flex-wrap: nowrap;
    justify-content:center;
    white-space: nowrap;
}

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
    padding: 0 24px;
    margin-top: 0px;
    position: fixed;
    top: 0;
    right: 0;
    z-index: 10000000;
    width: 600px;
    max-width: calc(100vw - 300px);
    resize: none;
    overflow-x: auto;
    position: fixed;
    background: #2A2A2A;
    box-shadow: 0 6px 12px #000;
}

.knobs-resize-handle {
    position: absolute;
    top: 0;
    left: 0;
    width: 24px; 
    height: 100%;
    cursor: ew-resize;
    user-select: none;
    touch-action: none;
    z-index: 10;
    display: flex;
    flex-direction: row;
    padding: 0 2px;
    padding-top: 12px;
    background: linear-gradient(to right, #ffffff35, #ffffff00);
    border-right: 1px solid #ffffff30;
}

.knobs-resize-handle:hover {
    background: linear-gradient(to right, #ffffff55, #ffffff10);
    border-right: 1px solid #ffffff60;
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

.btn-reset {
    margin: 0 0 2rem 0;
}

.knobs-summary {
    background: linear-gradient(90deg, #42d392, #5f8aee);
    background-size: 100% 100%;
    width: fit-content;
    background-repeat: no-repeat;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    color: transparent;
    font-weight: 900 !important;
}

@media screen and (max-width: 1000px) {
    .box {
        grid-template-columns: repeat(1, 1fr);
    }
    .knobs {
        width: 400px;
    }
}
</style>
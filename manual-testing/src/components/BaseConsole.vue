<script setup>
import { ref, onBeforeUnmount, nextTick, watch } from "vue";
import BaseIcon from "../../../src/atoms/BaseIcon.vue"

const consoleLogs = ref([]);
const MAX_LOGS = 500;
const activeLogType = ref(null);
let observer = null;

function formatArgs(args) {
    return args
        .map((arg) => {
            if (arg instanceof Error) {
                return `${arg.name}: ${arg.message}\n${arg.stack ?? ""}`.trim();
            }
            if (typeof arg === "object") {
                try {
                    return JSON.stringify(arg, null, 2);
                } catch {
                    return String(arg);
                }
            }
            return String(arg);
        })
        .join(" ");
}

function pushEntry(type, args) {
    consoleLogs.value.unshift({
        type,
        message: formatArgs(args),
        time: new Date().toLocaleTimeString()
    });

    if (consoleLogs.value.length > MAX_LOGS) {
        consoleLogs.value.length = MAX_LOGS;
    }
}

const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
};

function hookConsole(method) {
    console[method] = (...args) => {
        pushEntry(method, args);
        originalConsole[method].apply(console, args);
    };
}

hookConsole("log");
hookConsole("warn");
hookConsole("error");
hookConsole("info");

function onWindowError(event) {
    const errorObject = event?.error;
    if (errorObject instanceof Error) {
        pushEntry("error", [errorObject]);
        return;
    }

    const message = event?.message ?? "Unknown error";
    const file = event?.filename ?? "";
    const line = event?.lineno ?? "";
    const column = event?.colno ?? "";

    pushEntry("error", [`${message}${file ? ` @ ${file}:${line}:${column}` : ""}`]);
}

function onUnhandledRejection(event) {
    const reason = event?.reason;

    if (reason instanceof Error) {
        pushEntry("error", [reason]);
        return;
    }

    pushEntry("error", [`Unhandled promise rejection:`, reason]);
}

window.addEventListener("error", onWindowError);
window.addEventListener("unhandledrejection", onUnhandledRejection);

onBeforeUnmount(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;

    window.removeEventListener("error", onWindowError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
});

/* Controls */
const consoleView = ref(null);
const activeIndex = ref(0);

function clearConsole() {
    consoleLogs.value = [];
    activeIndex.value = 0;
}

async function scrollToIndex(index) {
    await nextTick();

    const container = consoleView.value;
    if (!container) return;

    const target = container.querySelector(`[data-log-index="${index}"]`);
    if (!(target instanceof HTMLElement)) return;

    target.scrollIntoView({ block: "start", behavior: 'smooth' });
    updateActiveLogType();
}

function scrollNext() {
    if (!consoleLogs.value.length) return;
    activeIndex.value = Math.min(activeIndex.value + 1, consoleLogs.value.length - 1);
    scrollToIndex(activeIndex.value);
}

function scrollPrevious() {
    if (!consoleLogs.value.length) return;
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
    scrollToIndex(activeIndex.value);
}

const isExpanded = ref(false);

function toggleExpand() {
    isExpanded.value = !isExpanded.value;
}

function updateActiveLogType() {
    const container = consoleView.value;
    if (!container) return;

    const lines = container.querySelectorAll("[data-log-index]");
    if (!lines.length) {
        activeLogType.value = null;
        return;
    }

    const containerTop = container.getBoundingClientRect().top;

    let bestIndex = 0;
    let bestDistance = Number.POSITIVE_INFINITY;

    lines.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - containerTop);
        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = Number(el.dataset.logIndex);
        }
    });

    activeLogType.value = consoleLogs.value[bestIndex]?.type ?? null;
}

watch(consoleLogs, async () => {
    await nextTick();
    updateActiveLogType();
});

watch(isExpanded, async () => {
    await nextTick();
    updateActiveLogType();
});


</script>

<template>
    <div class="console-shell">
        <div class="console-toolbar">
            <span
            class="console-marker"
            :class="activeLogType"
            ></span>
            <code>Console</code>
            <div class="console-toolbar-buttons">
                <button @click="clearConsole">
                    <BaseIcon name="revert" stroke="#5f8aee" :size="20"/>
                </button>
                <button @click="scrollNext">
                    <BaseIcon name="arrowBottom" stroke="#42d392" :size="20"/>
                </button>
                <button @click="scrollPrevious">
                    <BaseIcon name="arrowTop" stroke="#42d392" :size="20"/>
                </button>
                <button @click="toggleExpand">
                    <BaseIcon :name="isExpanded ? 'exitFullscreen' : 'fullscreen'" stroke="#5f8aee"  :size="20"/>
                </button>
            </div>
        </div>

        <div
            class="console-view"
            ref="consoleView"
            @scroll="updateActiveLogType"
            :style="{
                maxHeight: isExpanded ? '50vh' : '150px',
                width: isExpanded ? 'calc(100vw - 300px)' : '300px',
                maxWidth: 'calc(100vw - 300px)'
            }"
        >
            <div
                v-for="(entry, index) in consoleLogs"
                :key="index"
                :data-log-index="index"
                :class="['console-line', entry.type]"
            >
                <span class="time">[{{ entry.time }}]</span>
                <span class="msg">{{ entry.message }}</span>
            </div>
        </div>
    </div>
</template>
css
Copier le code


<style scoped>
.console-shell {
    position: fixed;
    bottom: 0;
    right: 0;
    z-index: 99999999;
}

.console-toolbar {
    position: absolute;
    bottom: 100%;
    right: 0;
    background: #1A1A1A;
    width: 100%;
}

.console-toolbar code {
    padding: 0.5rem;
    font-size: 0.7rem;
    color: #CCCCCC;
}

.console-toolbar-buttons {
    padding: 0.2rem 0.5rem;
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
}

button {
    background-color: #1A1A1A;
    display: flex;
    align-items:center;
    justify-content: center;
    border: none;
    padding: 6px;
    cursor: pointer;
    border-radius: 50%;
    transition: background-color 0.2s;
}

button:hover {
    background-color: #3A3A3A;
}

.console-view {
    font-family: monospace;
    font-size: 12px;
    background: #1A1A1A;
    color: #ddd;
    padding: 8px;
    overflow-y: auto;
    border: 1px solid #333;
}

.console-line {
    white-space: pre-wrap;
    margin-bottom: 4px;
    margin-top: 24px;
    padding-top: 12px;
}

.console-line.log {
    color: #cccccc;
}

.console-line.info {
    color: #9cdcfe;
}

.console-line.warn {
    color: #ffcc00;
}

.console-line.error {
    color: #ff6b6b;
}

.time {
    opacity: 0.6;
    margin-right: 6px;
}

.console-marker {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
    margin-left: 0.9rem;
    margin-bottom: 0px;
    background: #666;
}

.console-marker.log {
    background: #cccccc;
}

.console-marker.info {
    background: #9cdcfe;
}

.console-marker.warn {
    background: #ffcc00;
}

.console-marker.error {
    background: #ff6b6b;
}
</style>

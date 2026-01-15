<script setup>
import { computed, onBeforeUnmount, ref } from "vue";
import BaseIcon from "./../src/atoms/BaseIcon.vue";

import { VueUiIcon } from "vue-data-ui";
import { VueUiIcon as VueUiIconTreeshaken } from "vue-data-ui/vue-ui-icon";

const icons = ref([
    "annotator", "chart3dBar", "chartAgePyramid", "chartBar", "chartCandlestick", "chartChestnut", "chartDonut", "chartDonutEvolution", "chartGauge", "chartHeatmap", "chartLine", "chartMoodRadar", "chartOnion", "chartQuadrant", "chartRadar", "chartRelationCircle", "chartRings", "chartScatter", "chartSparkHistogram", "chartSparkStackbar", "chartTable", "chartThermometer", "chartTiremarks", "chartVerticalBar", "chartWaffle", "chartWheel", "close", "dashboard", "digit0", "digit1", "digit2", "digit3", "digit4", "digit5", "digit6", "digit7", "digit8", "digit9", "excel", "image", "labelClose", "labelOpen", "menu", "moodFlat", "moodHappy", "moodNeutral", "moodSad", "pdf", "screenshot", "skeleton", "smiley", "sort", "spin", "tableClose", "tableOpen", "chartNestedDonuts", "chartSparkbar", "refresh", "circleQuestion", "circleExclamation", "circleCheck", "circleCancel", "moodLaughing", "moodWink", "moodEmbarrassed", "moodSurprised", "exitFullscreen", "fullscreen", "arrowRight", "arrowTop", "arrowBottom", "arrowLeft", "chartCluster", "chartSparkline", "legend", "csv", "chartGalaxy", "kpi", "kpiBox", "tooltip", "vueDataUi", "ratio", "func", "settings", "trendUp", "trendDown", "clipBoard", "zoomPlus", "zoomMinus", "clipboardLine", "clipboardDonut", "clipboardBar", "clipboardVariable", "triangle", "triangleFill", "square", "squareFill", "diamond", "diamondFill", "pentagon", "pentagonFill", "hexagon", "hexagonFill", "circle", "circleFill", "star", "starFace", "starFill", "numbers", "sigma", "mu", "lambda", "copy", "accordion", "cursor", "trend", "chartStripPlot", "chartDumbbell", "copyLeft", "chartWordCloud", "chartWordCloudZh", "stack", "unstack", "window", "chartFlow", "chartParallelCoordinatePlot", "tooltipDisabled", "pause", "play", "stop", "restart", "lap", "carouselTable", "battery", "chartStackbar", "chartBullet", "trash", "annotatorDisabled", "palette", "boxes", "chartFunnel", "chartHistoryPlot", "chartTableSparkline", "chartCirclePack", "icons", "robot", "hourglass", "computer", "htmlTag", "curlyBrackets", "curlySpread", "world", "eye", "chartRidgeline", "chartChord", "tableDialogOpen", "tableDialogClose", "minimap", "svg", "chartStackline", "zoomLock", "zoomUnlock", "lock", "unlock", "triangleInformation", "triangleExclamation", "direction", "chartDag", "chartGeo", "revert", "lineUp", "histogram", "histogramUp", "histogramDown", "document", "database", "pie", "percentage", "percentageUp", "percentageDown", "aToZ", "zToA", "zeroToNine", "nineToZero", "network", "chip", "chipAi", "chipBinary", "wifi", "key", "binary", "shield", "shieldExclam", "cloud", "cloudRain", "sun", "croissant", "plus", "minus", "person", "people", "blur", "download", "upload", "target", "sqlQuery", "sqlSearch", "gisLayerQuery", "gisLayerSearch", "scada", "apiStream", "wrench", "branches", "fork", "resizeX", "resizeY", "resizeTLBR", "resizeTRBL", "focus", "sql", "monitor", "workstation", "laptop", "folder", "folderFill", "clip", "addColumn", "addRow", "bell", "bellOff", "bellRing", "pin", "unpin", "building", "twig", "check", "doubleCheck", "plug", "unplug", "spinner1", "spinner2", "spinner3", "spinner4", "magnify", "frameLine", "pointer", "monument", "spark", "doubleSpark", "chartBump", "folderOpen", "folderOpenFill", "tag", "lightBulbOn", "lightBulbOff", "knobs", "hierarchy", "hierarchyList", "bucketFill", "bucketEmpty", "bucket", "bucketRecycle", "listType", "calendar", "envelope", "test", "sliders", "checkList", "bug", "microscope", "pi", "export", "file", "filePlus", "fileSearch", "recycle", "colorPicker", "text", "fileSvg", "filePdf", "fileCsv", "filePng", "link"
]);

const inputValue = ref("");
const isOpen = ref(false);
const highlightedIndex = ref(-1);

const filteredOptions = computed(() => {
    const query = inputValue.value.trim().toLowerCase();
    if (!query) return icons.value;
    return icons.value.filter((item) => String(item).toLowerCase().includes(query));
});

function openList() {
    isOpen.value = true;
}

function closeList() {
    isOpen.value = false;
    highlightedIndex.value = -1;
}

function selectOption(value) {
    inputValue.value = value;
    closeList();
}

function onInput(event) {
    inputValue.value = event.target.value;
    openList();
}

function onKeyDown(event) {
    if (!isOpen.value && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        openList();
    }

    if (!isOpen.value) return;

    if (event.key === "ArrowDown") {
        event.preventDefault();
        const maxIndex = filteredOptions.value.length - 1;
        highlightedIndex.value = Math.min(highlightedIndex.value + 1, maxIndex);
        return;
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
        return;
    }

    if (event.key === "Enter") {
        if (highlightedIndex.value >= 0 && highlightedIndex.value < filteredOptions.value.length) {
            event.preventDefault();
            selectOption(filteredOptions.value[highlightedIndex.value]);
        }
        return;
    }

    if (event.key === "Escape") {
        closeList();
    }
}

const rootElement = ref(null);

function onDocumentPointerDown(event) {
    const root = rootElement.value;
    if (!root) return;
    if (!root.contains(event.target)) closeList();
}

document.addEventListener("pointerdown", onDocumentPointerDown);

onBeforeUnmount(() => {
    document.removeEventListener("pointerdown", onDocumentPointerDown);
});

let blurTimeoutId = null;

function onBlur() {
    if (blurTimeoutId !== null) clearTimeout(blurTimeoutId);
    blurTimeoutId = window.setTimeout(() => {
        closeList();
        blurTimeoutId = null;
    }, 0);
}

const iconFocusStrokeWidth = ref(1.5);
const darkMode = ref(true);

function previous() {
    if (!icons.value.length) return;

    const currentIndex = icons.value.indexOf(inputValue.value);

    if (currentIndex === -1) {
        inputValue.value = icons.value[0];
        return;
    }

    const prevIndex = currentIndex === 0
        ? icons.value.length - 1
        : currentIndex - 1;

    inputValue.value = icons.value[prevIndex];
}

function next() {
    if (!icons.value.length) return;

    const currentIndex = icons.value.indexOf(inputValue.value);

    if (currentIndex === -1) {
        inputValue.value = icons.value[0];
        return;
    }

    const nextIndex = currentIndex === icons.value.length - 1
        ? 0
        : currentIndex + 1;

    inputValue.value = icons.value[nextIndex];
}

const pathToOffset = ref('');
const offset = ref({
    x: 0,
    y: 0,
})

function offsetSvgPath(path, n, m) {
    return path.replace(/(-?\d+(?:\.\d+)?)/g, (match, number, index, full) => {
        const numbersBefore = full.slice(0, index).match(/-?\d+(?:\.\d+)?/g);
        const isX = !numbersBefore || numbersBefore.length % 2 === 0;
        const num = Number(number);
        return String(isX ? num + n : num + m);
    });
}

function convertPath() {
    pathToOffset.value = offsetSvgPath(pathToOffset.value, offset.value.x, offset.value.y);
}

const pathToVisualize = ref('');

function insertTemplate(type="stroke", path) {
    pathToVisualize.value += `<path d="${path ?? ''}" stroke-linecap="round" stroke-linejoin="round" ${type === 'stroke' ? 'stroke="#CCCCCC" stroke-width="1.5" fill="none"' : 'fill="#CCCCCC"'} style="opacity: 1"/>`
}

const svgPath = computed(() => {
    const paths = () => {
        const X = [];
        const Y = [];
        for (let i = 1; i < 20; i += 1) {
            X.push(`<path d="M 0,${i} 20,${i}" stroke-width="${i % 5 === 0 ? '0.15' : '0.05'}" stroke="#3A3A3A"/>`);
            Y.push(`<path d="M ${i},0 ${i},20" stroke-width="${i % 5 === 0 ? '0.15' : '0.05'}" stroke="#3A3A3A"/>`);
        }
        return {
            X,Y
        }
    }
    return `
    ${paths().X}
    ${paths().Y}
    ${pathToVisualize.value}
    `
});

function clearMaker() {
    pathToVisualize.value = '';
}

function clearComposer() {
    pathToOffset.value = '';
    offset.value.x = 0;
    offset.value.y = 0;
}

function addPath(type="stroke") {
    insertTemplate(type, pathToOffset.value);
}

const exportName = ref('');

const exportCode = computed(() => {
    return `${exportName.value}: \`${
        pathToVisualize.value
        .replace(/stroke="([^"]*)"/g, (_, value) =>
            value === 'none' ? 'stroke="none"' : 'stroke="${stroke}"'
        )
        .replace(/fill="([^"]*)"/g, (_, value) =>
            value === 'none' ? 'fill="none"' : 'fill="${stroke}"'
        )
        .replace(/stroke-width="([^"]*)"/g, (_, value) =>
            value === 'none' ? 'stroke-width="none"' : 'stroke-width="${strokeWidth}"'
        )
    }\`,`
})

function copyToClipboard(text) {
    return navigator.clipboard.writeText(text)
}

</script>

<template>
    <div
        style="display: flex; flex-direction:column; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px; align-items:center;">
        <div ref="rootElement">

            <details>
                <summary>
                    Icon maker
                </summary>
                <div class="icon-builder">
                    <label class="icon-path">
                        Path composer
                        <textarea v-model="pathToOffset"/>
                    </label>
    
                    <div class="icon-offset">
                        <label>
                            X:
                            <input type="number" v-model="offset.x">
                        </label>
                        <label>
                            Y:
                            <input type="number" v-model="offset.y">
                        </label>
                        <button class="svg-btn" @click="convertPath">
                            <VueUiIcon name="ratio" stroke="#42d392"/>
                        </button>
                        <button class="svg-btn" @click="addPath('stroke')">
                            <VueUiIcon name="arrowBottom" stroke="#42d392" :stroke-width="2">
                                <template #exp>
                                    <VueUiIcon name="square" :size="12" :stroke-width="4"/>
                                </template>
                            </VueUiIcon>  
                        </button>
                        <button class="svg-btn" @click="addPath('fill')">
                            <VueUiIcon name="arrowBottom" stroke="#42d392" :stroke-width="2">
                                <template #exp>
                                    <VueUiIcon name="squareFill" :size="12" :stroke-width="4"/>
                                </template>
                            </VueUiIcon>  
                        </button>
                        <button class="svg-btn" @click="clearComposer">
                            <VueUiIcon name="close" stroke="#42d392"/>  
                        </button>
                    </div>
    
                    <div class="btn-actions">
                        Path maker
                        <button class="svg-btn" style="margin-left: 1rem" @click="insertTemplate('stroke')">
                            <VueUiIcon name="square" stroke="#42d392" :stroke-width="2">
                                <template #exp>
                                    <VueUiIcon name="plus" :size="20"/>
                                </template>
                            </VueUiIcon>
                        </button>
                        <button class="svg-btn" style="margin-left: 1rem" @click="insertTemplate('fill')">
                            <VueUiIcon name="squareFill" stroke="#42d392" :stroke-width="2">
                                <template #exp>
                                    <VueUiIcon name="plus" :size="20"/>
                                </template>
                            </VueUiIcon>
                        </button>
                        <button class="svg-btn" style="margin-left: 1rem" @click="clearMaker">
                            <VueUiIcon name="close" stroke="#42d392"/>    
                        </button>
                    </div>
                    <label class="icon-path" style="margin-top: 0.5rem;">
                        <textarea v-model="pathToVisualize"/>
                    </label>
                    <div style="text-align:center">Preview</div>
                    <svg class="visualizer" viewBox="0 0 20 20" width="150" v-html="svgPath"></svg>
                    <svg class="visualizer" viewBox="0 0 20 20" style="width: 28px; margin-top: 1rem; border: none;" v-html="svgPath"></svg>

                    <div class="export">
                        Export
                        <label style="margin-bottom: 0.5rem; display:flex; align-items: center;">
                            Name:
                            <input type="text" style="margin-left:0.5rem" v-model="exportName">
                            <button class="svg-btn" style="margin-left: 1rem" @click="copyToClipboard(exportCode)">
                                <VueUiIcon name="copy" stroke="#42d392"/>    
                            </button>
                        </label>
                        <textarea v-html="exportCode"/>
                    </div>
                </div>
            </details>

            <div style="display: flex; flex-direction:row; align-items:center">
                <input type="text" :value="inputValue" @input="onInput" @focus="openList" @keydown="onKeyDown" @blur="onBlur" autocomplete="off" placeholder="Search icon..." />
                <button class="btn-reset" @click="inputValue=''">
                    <BaseIcon name="refresh" stroke="#CCCCCC"/>
                </button>
            </div>

            <ul v-if="isOpen && filteredOptions.length > 0">
                <li v-for="(item, index) in filteredOptions" :key="item" @mousedown.prevent="selectOption(item)"
                    @mouseenter="highlightedIndex = index" :aria-selected="index === highlightedIndex">
                    {{ item }}
                </li>
            </ul>
        </div>
        <template v-if="icons.some(i => i === inputValue)">
            <div>
                <label class="icon-knob">
                    <span>
                        Adjust stroke-width: <span style="font-variant-numeric: tabular-nums; color: #42d392">{{ iconFocusStrokeWidth }}</span>
                    </span>
                    <div class="icon-knob-input">
                        <input type="range" min="0.1" max="2" step="0.01" v-model="iconFocusStrokeWidth">
                        <button @click="iconFocusStrokeWidth = 1.5">
                            <VueUiIcon name="refresh" stroke="#8A8A8A" :size="20"/>
                        </button>
                    </div>
                </label>
                <label class="icon-knob-check">
                    Dark mode
                    <input type="checkbox" v-model="darkMode"/>
                </label>
            </div>
            <div class="icon-focus" :style="{ background: darkMode ? '#1A1A1A' : '#FFFFFF' }">
                <BaseIcon :name="inputValue" :size="150" :strokeWidth="Number(iconFocusStrokeWidth)" :stroke="darkMode ? '#CCCCCC' :  '#1A1A1A'"/>
                <div class="mini-icon-focus" :style="{ background: darkMode ? '#1A1A1A' : '#FFFFFF'}">
                    <BaseIcon :name="inputValue" :strokeWidth="Number(iconFocusStrokeWidth)" :stroke="darkMode ? '#CCCCCC' :  '#1A1A1A'"/>
                </div>
                <div class="controls-left">
                    <button @click="previous">
                        <VueUiIcon name="arrowLeft" stroke="#8A8A8A"/>
                    </button>
                </div>
                <div class="controls-right">
                    <button @click="next">
                        <VueUiIcon name="arrowRight" stroke="#8A8A8A"/>
                    </button>
                </div>
            </div>
        </template>
    </div>

    <div
        style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px; align-items:center;">
        Exp
        <BaseIcon name="square" :isSpin="true" spin-duration="5s">
            <template #exp>
                <BaseIcon name="hourglass" stroke="#42d392" :is-spin="true">
                </BaseIcon>
            </template>
        </BaseIcon>

        <BaseIcon name="image">
            <template #exp>
                <BaseIcon name="download" stroke="#42d392" />
            </template>
        </BaseIcon>

        <BaseIcon name="database">
            <template #exp>
                <BaseIcon name="spinner2" :is-spin="true" stroke="#42d392" />
            </template>
        </BaseIcon>
    </div>

    <div
        style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px; align-items:center;">
        Spinners

        <BaseIcon name="spinner1" :is-spin="true" />
        <BaseIcon name="spinner2" :is-spin="true" />
        <BaseIcon name="spinner3" :is-spin="true" />
        <BaseIcon name="spinner4" :is-spin="true" />
    </div>

    <div
        style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px; align-items:center;">
        Sub
        <BaseIcon name="square">
            <template #sub>
                <BaseIcon name="square" stroke="#42d392" :is-spin="true">
                </BaseIcon>
            </template>
        </BaseIcon>

        <BaseIcon name="image">
            <template #sub>
                <BaseIcon name="download" stroke="#42d392" />
            </template>
        </BaseIcon>

        <BaseIcon name="database">
            <template #sub>
                <BaseIcon name="sql" :size="20" stroke="#42d392" />
            </template>
        </BaseIcon>
    </div>

    <div
        style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px; align-items:center;">
        Exp & Sub
        <BaseIcon name="square">
            <template #exp>
                <BaseIcon name="square" stroke="#42d392" :is-spin="true">
                </BaseIcon>
            </template>
            <template #sub>
                <BaseIcon name="square" stroke="#42d392" :is-spin="true">
                </BaseIcon>
            </template>
        </BaseIcon>

        <BaseIcon name="person">
            <template #exp>
                <BaseIcon name="circleQuestion" stroke="#42d392" />
            </template>
            <template #sub>
                <BaseIcon name="hourglass" stroke="#42d392" />
            </template>
        </BaseIcon>

        <BaseIcon name="database">
            <template #exp>
                <BaseIcon name="spinner2" :is-spin="true" stroke="#42d392" />
            </template>
            <template #sub>
                <BaseIcon name="sql" :size="20" stroke="#42d392" />
            </template>
        </BaseIcon>
    </div>

    <div
        style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px">
        <BaseIcon v-for="icon in icons" :name="icon" stroke="#42d392" />
        <!-- <VueUiIcon v-for="icon in icons" :name="icon" stroke="#42d392"/>
        <VueUiIconTreeshaken v-for="icon in icons" :name="icon" stroke="#42d392"/> -->
    </div>
    <div
        style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; margin-bottom: 64px; max-width: 1200px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:100px" v-for="icon in icons">
            <BaseIcon :name="icon" stroke="#CCCCCC" :size="48" />
            <small>{{ icon }}</small>
        </div>
    </div>
    <div
        style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; margin-bottom: 64px; max-width: 1200px">
        <BaseIcon v-for="icon in icons" :name="icon" stroke="#6376DD" :size="96" />
    </div>
</template>

<style scoped>
    .btn-reset {
        background-color: #3A3A3A;
        border: 1px solid #4A4A4A;
        border-radius: 0 0.25rem 0.25rem 0;
        height: 2.1rem;
        width: 2.1rem;
        display: flex;
        align-items:center;
        justify-content:center;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .btn-reset:hover {
        background-color: #4A4A4A;
    }
    
    input[type="text"] {
        background: #2A2A2A;
        border: 1px solid #4A4A4A;
        padding: 0.5rem;
        color: #CCCCCC;
        border-radius: 0.25rem 0 0 0.25rem;
        z-index: 1;
    }
    
    ul {
        position: absolute;
        margin: 4px 0 0;
        padding: 0;
        list-style: none;
        max-height: 240px;
        min-width: 190px;
        overflow-y: auto;
        border: 1px solid #4A4A4A;
        border-radius: 0.25rem;
        background-color: #2A2A2A;
        z-index: 10;
    }

    li {
        padding: 6px 10px;
        cursor: pointer;
        user-select: none;
    }

    li:hover,
    li[aria-selected="true"] {
        background-color: #3A3A3A;
    }

    .icon-focus {
        border: 1px solid #4A4A4A;
        width: 200px;
        height: 200px;
        border-radius: 1rem;
        display: flex;
        align-items:center;
        justify-content:center;
        position: relative;
    }

    .mini-icon-focus {
        position: absolute;
        bottom: -1.5rem;
        right: -1.5rem;
        border: 1px solid #4A4A4A;
        padding: 0.5rem;
        display: flex;
        align-items:center;
        justify-content: center;
        border-radius: 0.5rem;
    }

    .icon-knob {
        display: flex;
        flex-direction: column;
        font-size: 0.8rem;
    }
    .icon-knob input[type="range"] {
        accent-color: #42d392;
    }
    .icon-knob-input {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }
    .icon-knob-input button {
        border: none;
        display: flex;
        align-items: center;
        justify-content:center;
        background-color: #1A1A1A;
        cursor: pointer;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        padding: 0.25rem;
        border: 1px solid #3A3A3A;
        transition: background-color 0.2s;
    }

    .icon-knob-input button:hover {
        background-color: #2A2A2A;
    }

    .icon-knob-check {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        align-items:center;
        font-size: 0.8rem;
        margin-top: 0.5rem;
        cursor: pointer;
        user-select: none;
    }
    .icon-knob-check input[type="checkbox"] {
        accent-color: #42d392;
    }

    .controls-left button,
    .controls-right button {
        border: none;
        background-color: #1A1A1A;
        display: flex;
        align-items:center;
        justify-content:center;
        border-radius: 50%;
        border: 1px solid #2A2A2A;
        height: 2rem;
        width: 2rem;
        transition: background-color 0.2s;
        cursor: pointer;
    }

    .controls-left button:hover,
    .controls-right button:hover {
        background-color: #2A2A2A;
    }

    .controls-left,
    .controls-right {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
    }

    .controls-left {
        left: -3rem;
    }

    .controls-right {
        right: -3rem;
    }

    .icon-builder {
        margin-top: 2rem;
        display:flex;
        flex-direction: column;
        width: calc(600px - 2rem);
    }

    .icon-offset {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    textarea {
        background: #2A2A2A;
        border-radius: 0.25rem;
        min-height: 10rem;
        color: #42d392;
        padding: 1rem;
        min-width: calc(600px - 2rem);
        max-width: calc(600px - 2rem);
    }

    input[type="number"],
    input[type="text"] {
        background: #2A2A2A;
        border-radius: 0.25rem;
        color: #42d392;
        padding: 0.25rem 0.5rem;
        border: 1px solid #6A6A6A;
        height: 2rem;
    }

    .btn-actions {
        display: flex;
        align-items: center;
        margin-top: 2rem;
    }

    .svg-btn {
        background-color: #3A3A3A;
        border: none;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
        cursor: pointer;
        display: flex;
        align-items:center;
        justify-content: center;
        height: 2rem;
        width: 2rem;
    }
    .svg-btn:hover {
        background-color: #4A4A4A;
    }

    .visualizer {
        border:1px solid #6A6A6A;
        width: 300px;
        margin: 0 auto;
    }
    details {
        width: 600px;
        margin: 1rem 0;
        background: #2A2A2A;
        padding: 1rem;
    }
    .export {
        display: flex;
        flex-direction: column;
    }
</style>
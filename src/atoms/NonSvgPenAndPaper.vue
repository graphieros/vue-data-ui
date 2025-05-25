<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { dataLabel, XMLNS } from "../lib";
import BaseIcon from "./BaseIcon.vue";
import { lightenHexColor } from "../lib";
import ColorPicker from "./ColorPicker.vue";

const props = defineProps({
    parent: {
        type: HTMLElement
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF'
    },
    color: {
        type: String,
        default: '#2D353C'
    },
    active: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(['close']);

const stack = ref([]);
const redoStack = ref([]);

const viewBox = ref("0 0 0 0");

const currentColor = ref(props.color)
const strokeWidth = ref(1);

const mode = ref('draw'); // or 'text'
const G = ref(null)
const isEditingText = ref(false);
const editingTextNode = ref(null); 
const editingTextAnchor = ref({ x: 0, y: 0 });
const editingTextContent = ref(['']);
const editingCaret = ref({ row: 0, col: 0 });
const fontSize = ref(16);
let _id = 1;

function nextId() {
    return _id ++;
}

function toSvgPoint(event) {
    const svg = svgElement.value;
    if (!svg) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();
    let clientX = event.clientX, clientY = event.clientY;
    if (event.touches && event.touches.length) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    }
    point.x = clientX;
    point.y = clientY;

    const matrix = svg.getScreenCTM()?.inverse();
    return matrix ? point.matrixTransform(matrix) : { x: 0, y: 0 };
}

function startSvgTextEditing(event) {
    if (!G.value) return;

    if (mode.value !== 'text' || isEditingText.value) return;
    const { x, y } = toSvgPoint(event);
    editingTextAnchor.value = { x, y };
    editingTextContent.value = [''];
    editingCaret.value = { row: 0, col: 0 };

    const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textNode.setAttribute("x", x);
    textNode.setAttribute("y", y);
    textNode.setAttribute("fill", currentColor.value);
    textNode.setAttribute("font-size", fontSize.value);
    textNode.setAttribute("font-family", "sans-serif");
    textNode.setAttribute("class", "vue-data-ui-doodle");
    textNode.setAttribute("dominant-baseline", "hanging");
    textNode.setAttribute("pointer-events", "all");

    const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
    tspan.setAttribute("x", x);
    tspan.setAttribute("dy", "0");
    tspan.textContent = '';
    textNode.appendChild(tspan);
    textNode.style.pointerEvents = 'none';
    textNode.style.userSelect = 'none';

    G.value.appendChild(textNode);
    editingTextNode.value = textNode;
    isEditingText.value = true;

    window.addEventListener('keydown', handleSvgTextKeydown);
    window.addEventListener('mousedown', handleSvgTextBlur, true);
    updateSvgTextDisplay();
    drawSvgCaret();
}

function handleSvgTextKeydown(e) {
    if (!isEditingText.value) return;
    let { row, col } = editingCaret.value;
    let lines = editingTextContent.value.slice();
    let updated = false;

    if (e.key === 'Enter') {
        const line = lines[row];
        const before = line.slice(0, col);
        const after = line.slice(col);
        lines.splice(row, 1, before, after);
        row += 1;
        col = 0;
        updated = true;
        e.preventDefault();
    } else if (e.key === 'Backspace') {
        if (col > 0) {
            // Delete char before caret
            lines[row] = lines[row].slice(0, col - 1) + lines[row].slice(col);
            col -= 1;
            updated = true;
        } else if (row > 0) {
            // Merge with previous line
            const prevLen = lines[row - 1].length;
            lines[row - 1] += lines[row];
            lines.splice(row, 1);
            row -= 1;
            col = prevLen;
            updated = true;
        }
        e.preventDefault();
    } else if (e.key === 'Delete') {
        if (col < lines[row].length) {
            lines[row] = lines[row].slice(0, col) + lines[row].slice(col + 1);
            updated = true;
        } else if (row < lines.length - 1) {
            lines[row] += lines[row + 1];
            lines.splice(row + 1, 1);
            updated = true;
        }
        e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
        if (col > 0) {
            col -= 1;
        } else if (row > 0) {
            row -= 1;
            col = lines[row].length;
        }
        updated = true;
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        if (col < lines[row].length) {
            col += 1;
        } else if (row < lines.length - 1) {
            row += 1;
            col = 0;
        }
        updated = true;
        e.preventDefault();
    } else if (e.key === 'ArrowUp') {
        if (row > 0) {
            row -= 1;
            col = Math.min(col, lines[row].length);
            updated = true;
        }
        e.preventDefault();
    } else if (e.key === 'ArrowDown') {
        if (row < lines.length - 1) {
            row += 1;
            col = Math.min(col, lines[row].length);
            updated = true;
        }
        e.preventDefault();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        lines[row] = lines[row].slice(0, col) + e.key + lines[row].slice(col);
        col += 1;
        updated = true;
        e.preventDefault();
    } else if (e.key === 'Escape') {
        cleanupSvgTextEditing(true);
        return;
    } else if (e.key === 'Tab') {
        // TODO: manage Tab
        e.preventDefault();
    }

    if (updated) {
        editingTextContent.value = lines;
        editingCaret.value = { row, col };
        updateSvgTextDisplay();
        drawSvgCaret();
    }
}

function updateSvgTextDisplay() {
    const textNode = editingTextNode.value;
    const { x, y } = editingTextAnchor.value;
    while (textNode.firstChild) textNode.removeChild(textNode.firstChild);
    editingTextContent.value.forEach((line, i) => {
        const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("x", x);
        tspan.setAttribute("dy", i === 0 ? "0" : `${fontSize.value * 1.2}`);
        tspan.textContent = line.length ? line : "\u200B";
        textNode.appendChild(tspan);
    });
}

function drawSvgCaret() {
    const existingCaret = G.value.querySelector('.vue-data-ui-svg-caret');
    if (existingCaret) G.value.removeChild(existingCaret);

    const textNode = editingTextNode.value;
    if (!textNode) return;

    const { x, y } = editingTextAnchor.value;
    const { row, col } = editingCaret.value;
    const fontPx = fontSize.value;

    const tspan = textNode.childNodes[row];
    if (!tspan) return;
    let tempText = tspan.textContent.slice(0, col);
    if (tempText.endsWith(' ')) {
        tempText += '\u00A0';
    }

    const measureText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    measureText.setAttribute("x", x);
    measureText.setAttribute("y", y);
    measureText.setAttribute("font-size", fontPx);
    measureText.setAttribute("font-family", "sans-serif");
    measureText.textContent = tempText || "";
    G.value.appendChild(measureText);
    const bbox = measureText.getBBox();
    G.value.removeChild(measureText);

    // Y offset
    let caretY = y + row * fontPx * 1.2;
    let caretX = x + bbox.width;

    const caret = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    caret.setAttribute("x", caretX);
    caret.setAttribute("y", caretY);
    caret.setAttribute("width", 1);
    caret.setAttribute("height", fontPx);
    caret.setAttribute("fill", currentColor.value);
    caret.setAttribute("class", "vue-data-ui-svg-caret");
    G.value.appendChild(caret);
}

function handleSvgTextBlur(e) {
    if (!editingTextNode.value) return;

    if (!editingTextNode.value.contains(e.target)) {
        const tspans = editingTextNode.value.children;
        if (
            tspans.length === 1 &&
            (tspans[0].textContent === "" || tspans[0].textContent === "\u200B")
        ) {
            editingTextNode.value.remove();
        }
        cleanupSvgTextEditing(false);
    }
}

function cleanupSvgTextEditing(remove = false) {
    window.removeEventListener('keydown', handleSvgTextKeydown);
    window.removeEventListener('mousedown', handleSvgTextBlur, true);
    const caret = G.value?.querySelector('.vue-data-ui-svg-caret');
    caret && G.value.removeChild(caret);

    const isEmpty = editingTextContent.value.every(line =>
        !line || line === "\u200B"
    );

    if (remove || isEmpty) {
        if (editingTextNode.value && G.value && G.value.contains(editingTextNode.value)) {
            G.value.removeChild(editingTextNode.value);
        }
    } else {
        stack.value.push({
            id: nextId(),
            type: 'text',
            x: editingTextAnchor.value.x,
            y: editingTextAnchor.value.y,
            color: currentColor.value,
            fontSize: fontSize.value,
            lines: editingTextContent.value.map(line => line),
        });
        if (editingTextNode.value && G.value && G.value.contains(editingTextNode.value)) {
            G.value.removeChild(editingTextNode.value);
        }
    }

    isEditingText.value = false;
    editingTextNode.value = null;
    editingTextContent.value = [''];
    editingCaret.value = { row: 0, col: 0 };
}


const buttonBorderColor = computed(() => {
    return lightenHexColor(props.color, 0.6);
});

function setViewBox({ width, height }) {
    viewBox.value = `0 0 ${width} ${height}`;
}

const resizeObserver = ref(null);

onMounted(() => {
    nextTick(() => {
        if (props.parent) {
            resizeObserver.value = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    setViewBox({ width, height });
                }
            });
            resizeObserver.value.observe(props.parent);

            const { width, height } = props.parent.getBoundingClientRect();
            setViewBox({ width, height });
        }
    })
    G.value = svgElement.value.querySelector('g');
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

watch(
    () => props.parent,
    (v) => {
        if (!v) return;
        const { width, height } = props.parent.getBoundingClientRect();
        setViewBox({ width, height });
    },
    { immediate: true }
);

watch(mode, (v) => {
    if (v === 'text') {
        svgElement.value?.addEventListener('mousedown', startSvgTextEditing);
    } else {
        svgElement.value?.removeEventListener('mousedown', startSvgTextEditing);
    }
});

const isDrawing = ref(false);
const currentPath = ref("");
const svgElement = ref(null);

function startDrawing(event) {
    if (mode.value !== 'draw') return;
    if (!svgElement.value) return;
    isDrawing.value = true;
    const { x, y } = getRelativePosition(event);
    currentPath.value = `M ${x} ${y}`;
}

function draw(event) {
    if (!isDrawing.value || !svgElement.value) return;
    const { x, y } = getRelativePosition(event);
    currentPath.value += ` ${x} ${y}`;
}

function smoothPath(path) {
    const segments = path.trim().split(/\s+/);
    if (segments.length < 4) {
        return path;
    }
    const coordinates = segments.slice(1).map(Number);
    if (coordinates.length % 2 !== 0) {
        return path;
    }
    const smoothedCoordinates = reduceNoise(coordinates);
    const smoothedPath = [`M ${smoothedCoordinates[0]} ${smoothedCoordinates[1]}`]; // Keep M x y incipit
    for (let i = 2; i < smoothedCoordinates.length - 2; i += 2) {
        const x1 = smoothedCoordinates[i - 2];
        const y1 = smoothedCoordinates[i - 1];
        const x2 = smoothedCoordinates[i];
        const y2 = smoothedCoordinates[i + 1];
        const controlX = (x1 + x2) / 2;
        const controlY = (y1 + y2) / 2;
        smoothedPath.push(`Q ${x1} ${y1} ${controlX} ${controlY}`);
    }
    const lastX = smoothedCoordinates[smoothedCoordinates.length - 2];
    const lastY = smoothedCoordinates[smoothedCoordinates.length - 1];
    smoothedPath.push(`L ${lastX} ${lastY}`);
    return smoothedPath.join(" ");
}

function reduceNoise(coordinates, smoothingFactor = 1) {
    const smoothed = [...coordinates];
    for (let i = 2; i < coordinates.length - 2; i += 2) {
        const x = coordinates[i];
        const y = coordinates[i + 1];
        const prevX = coordinates[i - 2];
        const prevY = coordinates[i - 1];
        const nextX = coordinates[i + 2];
        const nextY = coordinates[i + 3];
        smoothed[i] = x + smoothingFactor * ((prevX + nextX) / 2 - x);
        smoothed[i + 1] = y + smoothingFactor * ((prevY + nextY) / 2 - y);
    }
    return smoothed;
}

function optimizeSvgPath(path) {
    const commands = path.trim().split(/\s+/);
    let optimizedPath = '';
    let currentCommand = '';
    let currentX = null, currentY = null;
    for (let i = 0; i < commands.length; i += 1) {
        const command = commands[i];
        if (isNaN(command)) {
            currentCommand = command;
            if (currentCommand === 'M' || currentCommand === 'L') {
                currentX = parseFloat(commands[++i]);
                currentY = parseFloat(commands[++i]);
                optimizedPath += `${currentCommand}${currentX} ${currentY}`;
            } else if (currentCommand === 'Q') {
                const cx = parseFloat(commands[++i]);
                const cy = parseFloat(commands[++i]);
                const x = parseFloat(commands[++i]);
                const y = parseFloat(commands[++i]);

                if (cx === currentX && cy === currentY) {
                    // Last point shorthand
                    optimizedPath += `t${x - currentX} ${y - currentY}`;
                } else {
                    optimizedPath += `q${cx - currentX} ${cy - currentY} ${x - currentX} ${y - currentY}`;
                }
                currentX = x;
                currentY = y;
            }
        } else {
            const x = parseFloat(command);
            const y = parseFloat(commands[++i]);
            if (currentCommand === 'L') {
                const dx = x - currentX;
                const dy = y - currentY;

                if (dx === 0) {
                    // Vertical line
                    optimizedPath += `v${dy}`;
                } else if (dy === 0) {
                    // Horizontal line
                    optimizedPath += `h${dx}`;
                } else {
                    // Diagonal line
                    optimizedPath += `l${dx} ${dy}`;
                }
                currentX = x;
                currentY = y;
            } else if (currentCommand === 'Q') {
                const cx = x;
                const cy = y;
                const nx = parseFloat(commands[++i]);
                const ny = parseFloat(commands[++i]);

                if (cx === currentX && cy === currentY) {
                    optimizedPath += `t${nx - currentX} ${ny - currentY}`;
                } else {
                    optimizedPath += `q${cx - currentX} ${cy - currentY} ${nx - currentX} ${ny - currentY}`;
                }
                currentX = nx;
                currentY = ny;
            }
        }
    }
    return optimizedPath;
}

function stopDrawing() {
    if (isDrawing.value) {
        stack.value.push({
            id: nextId(),
            strokeWidth: strokeWidth.value,
            path: optimizeSvgPath(smoothPath(currentPath.value)),
            color: currentColor.value
        });
        redoStack.value = [];
        currentPath.value = "";
    }
    isDrawing.value = false;
}

function getRelativePosition(event) {
    if (!svgElement.value) return { x: 0, y: 0 };

    const svgRect = svgElement.value.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches && event.touches.length) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    return {
        x: clientX - svgRect.left,
        y: clientY - svgRect.top,
    };
}

function deleteLastDraw() {
    if (stack.value.length > 0) {
        const lastPath = stack.value.pop();
        redoStack.value.push(lastPath);
    }
}

function redoLastDraw() {
    if (redoStack.value.length > 0) {
        const lastUndonePath = redoStack.value.pop();
        stack.value.push(lastUndonePath); 
    }
}

function reset() {
    stack.value = [];
    redoStack.value = [];
}

const range = ref(null);

</script>

<template>
    <div
        v-if="active"
        data-dom-to-png-ignore
        :class="{
            'vue-ui-pen-and-paper-actions': true,
            'visible': active
        }"
        :style="{ backgroundColor: backgroundColor }"
    >
        <button
            class="vue-ui-pen-and-paper-action"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }"
            @click="emit('close')"
        >
            <BaseIcon name="close" :stroke="color"/>
        </button>
        <button
            data-cy="pen-and-paper-color-picker"
            :class="{
                'vue-ui-pen-and-paper-action': true, 
            }"
            style="padding: 0 !important"
            >
            <ColorPicker 
                v-model:value="currentColor" 
                :backgroundColor="backgroundColor"
                :buttonBorderColor="buttonBorderColor"
            />
        </button>
        <button
            data-cy="pen-and-paper-toggle-text"
            class="vue-ui-pen-and-paper-action"
            :class="{ 'vue-ui-pen-and-paper-action-active': mode === 'text' }"
            @click="mode = (mode === 'text' ? 'draw' : 'text')"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`,
            }"
            >
            <BaseIcon :name="mode === 'draw' ? 'annotator' : 'text'" :stroke="color" />
            <div :style="{
                position: 'absolute',
                bottom: '-20px',
                color: buttonBorderColor,
                width: '100%',
                textAlign: 'center',
                fontSize: '12px'
            }">
                {{ dataLabel({
                    v: mode === 'draw' ? strokeWidth : fontSize,
                    s: 'px',
                    r: 1
                }) }}
            </div>
        </button>

        <button
            data-cy="pen-and-paper-undo"
            :class="{
                'vue-ui-pen-and-paper-action': true, 
                'vue-ui-pen-and-paper-action-disabled': !stack.length
            }"
            :disabled="!stack.length"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`,
                marginTop: '20px'
            }"
            @click="deleteLastDraw"
        >
            <BaseIcon name="restart" :stroke="color"/>
        </button>
        <button
            data-cy="pen-and-paper-redo"
            :class="{
                'vue-ui-pen-and-paper-action': true, 
                'vue-ui-pen-and-paper-action-disabled': !redoStack.length
            }"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }"
            @click="redoLastDraw"
        >
            <BaseIcon name="restart" :stroke="color" style="transform: scaleX(-1)"/>
        </button>
        <button
            data-cy="pen-and-paper-reset"
            :class="{
                'vue-ui-pen-and-paper-action': true, 
                'vue-ui-pen-and-paper-action-disabled': !stack.length
            }"
            class="vue-ui-pen-and-paper-action"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }"
            @click="reset"
        >
            <BaseIcon name="trash" :stroke="color"/>
        </button>

        <input
            data-cy="pen-and-paper-thickness"
            v-if="mode === 'draw'" 
            ref="range" 
            type="range" 
            class="vertical-range" 
            :min="0.5" 
            :max="12" 
            :step="0.1" 
            v-model="strokeWidth"
            :style="{ accentColor: color }" 
        />

        <input
            data-cy="pen-and-paper-font-size"
            v-if="mode === 'text'" 
            ref="range" 
            type="range" 
            class="vertical-range" 
            :min="3" 
            :max="48" 
            :step="0.1" 
            v-model="fontSize"
            :style="{ accentColor: color }" 
        />
    </div>
    <svg
        :data-mode="mode"
        data-cy="pen-and-paper"
        ref="svgElement"
        :xmlns="XMLNS"
        :viewBox="viewBox"
        :class="{
            'vue-ui-pen-and-paper': true,
            inactive: !active,
        }"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawing"
        @touchmove.prevent="draw"
        @touchend="stopDrawing"
    >
        <g ref="G">
            <template v-for="item in stack" :key="item.id">
                <circle v-if="item.path && item.path.replace('M', '').split(' ').length === 2"
                        :cx="item.path.replace('M', '').split(' ')[0]"
                        :cy="item.path.replace('M', '').split(' ')[1]"
                        :r="item.strokeWidth / 2"
                        :fill="item.color"/>
                <path v-else-if="item.path"
                        class="vue-ui-pen-and-paper-path"
                        :d="item.path"
                        :stroke="item.color"
                        :stroke-width="item.strokeWidth"
                        fill="none" />
                <text v-else-if="item.type === 'text'"
                        :x="item.x"
                        :y="item.y"
                        :fill="item.color"
                        :font-size="item.fontSize"
                        font-family="sans-serif"
                        dominant-baseline="hanging"
                        class="vue-ui-pen-and-paper-text"
                >
                    <tspan
                    v-for="(line, idx) in item.lines"
                    :key="idx"
                    :x="item.x"
                    :dy="idx === 0 ? '0' : item.fontSize * 1.2"
                    >{{ line.length ? line : '\u200B' }}</tspan>
                </text>
            </template>
        </G>
        <path class="vue-ui-pen-and-paper-path vue-ui-pen-and-paper-path-drawing" v-if="isDrawing" :d="smoothPath(currentPath)" :stroke="currentColor" :stroke-width="strokeWidth * 1.1" fill="none" />
    </svg>
</template>

<style scoped>
.vue-ui-pen-and-paper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    z-index: 0;
}

.vue-ui-pen-and-paper[data-mode="draw"] {
    cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABg2lDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVh2YQcchQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQrPKNKtnAtB020wn4lIuvyqFXhGGiAhCiMnMMpKZxSx8x9c9Any9i/Es/3N/jgG1YDEgIBHPMcO0iTeIZzZtg/M+scjKskp8Tjxu0gWJH7muePzGueSywDNFM5ueJxaJpVIXK13MyqZGPE0cVTWd8oWcxyrnLc5atc7a9+QvDBf0lQzXaY4ggSUkkYIEBXVUUIWNGK06KRbStB/38Q+7/hS5FHJVwMixgBo0yK4f/A9+d2sVpya9pHAc6H1xnI9RILQLtBqO833sOK0TIPgMXOkdf60JzH6S3uho0SNgcBu4uO5oyh5wuQMMPRmyKbtSkKZQLALvZ/RNeSByC/Sveb2193H6AGSpq+Ub4OAQGCtR9rrPu/u6e/v3TLu/H5C7crM1WjgWAAAABmJLR0QAqwB5AHWF+8OUAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5gwUExIUagzGcQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABfSURBVBjTldAxDoNQDIPhL0+q1L33P1AvAhN7xfK6WAgoLfSfrNiykpQtE+7RLzx2vgF9D3o8lWDmn1QVVMP0LZQGmNtqp1/cmou0XHdG/+sYeGZwFBqPCub8rkcvvAGvsi1VYarR8wAAAABJRU5ErkJggg==') 5 5, auto;
}

.vue-ui-pen-and-paper[data-mode="text"] {
    cursor: text;
}

.inactive {
    pointer-events: none;
}
.vue-ui-pen-and-paper-actions {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.vue-ui-pen-and-paper-action {
    display: flex;
    align-items:center;
    justify-content:center;
    height: 32px;
    width: 32px;
    padding: 2px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    position: relative;
}
.vue-ui-pen-and-paper-action:hover {
    box-shadow: 2px 2px 6px rgba(0,0,0,0.3);
}
.vue-ui-pen-and-paper-action-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.vue-ui-pen-and-paper-path {
    stroke-linecap: round;
    stroke-linejoin: round;
}

input[type="range"].vertical-range {
    writing-mode: vertical-lr;
    position: absolute;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    left: 36px;
}

</style>

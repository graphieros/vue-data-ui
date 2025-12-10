<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from "vue";
import BaseIcon from "./BaseIcon.vue";
import ColorPicker from "./ColorPicker.vue";
import { dataLabel, lightenHexColor } from "../lib";

const props = defineProps({
    svgRef: {
        type: [Object, null, undefined],
        required: true
    },
    color: {
        type: String,
        default: '#2D353C'
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF'
    },
    active: {
        type: Boolean,
        default: false,
    },
    scale: {
        type: Number,
        default: 1
    }
});

const emit = defineEmits(['close']);

const stack = ref([]);
const redoStack = ref([]);
const currentColor = ref(props.color);
const strokeWidth = ref(2);
const isDrawing = ref(false);
const currentPath = ref("");
const G = ref(null);
const currentDrawingPath = ref(null);
const startPoint = ref(null);

const mode = ref('draw'); // or 'text'
const isEditingText = ref(false);
const editingTextNode = ref(null); 
const editingTextAnchor = ref({ x: 0, y: 0 });
const editingTextContent = ref(['']);
const editingCaret = ref({ row: 0, col: 0 });
const fontSize = ref(16);
const editingTextRegistered = ref(false);

const cursorDraw = ref(`url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABg2lDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVh2YQcchQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQrPKNKtnAtB020wn4lIuvyqFXhGGiAhCiMnMMpKZxSx8x9c9Any9i/Es/3N/jgG1YDEgIBHPMcO0iTeIZzZtg/M+scjKskp8Tjxu0gWJH7muePzGueSywDNFM5ueJxaJpVIXK13MyqZGPE0cVTWd8oWcxyrnLc5atc7a9+QvDBf0lQzXaY4ggSUkkYIEBXVUUIWNGK06KRbStB/38Q+7/hS5FHJVwMixgBo0yK4f/A9+d2sVpya9pHAc6H1xnI9RILQLtBqO833sOK0TIPgMXOkdf60JzH6S3uho0SNgcBu4uO5oyh5wuQMMPRmyKbtSkKZQLALvZ/RNeSByC/Sveb2193H6AGSpq+Ub4OAQGCtR9rrPu/u6e/v3TLu/H5C7crM1WjgWAAAABmJLR0QAqwB5AHWF+8OUAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5gwUExIUagzGcQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABfSURBVBjTldAxDoNQDIPhL0+q1L33P1AvAhN7xfK6WAgoLfSfrNiykpQtE+7RLzx2vgF9D3o8lWDmn1QVVMP0LZQGmNtqp1/cmou0XHdG/+sYeGZwFBqPCub8rkcvvAGvsi1VYarR8wAAAABJRU5ErkJggg==') 5 5, auto`);

function startSvgTextEditing(event) {
    if (!G.value) return;

    if (mode.value !== 'text' || isEditingText.value) return;
    const { x, y } = toSvgPoint(event);
    editingTextAnchor.value = { x, y };
    editingTextContent.value = [''];
    editingCaret.value = { row: 0, col: 0 };
    editingTextRegistered.value = false;

    const textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");
    textNode.setAttribute("x", x);
    textNode.setAttribute("y", y);
    textNode.setAttribute("fill", currentColor.value);
    textNode.setAttribute("font-size", fontSize.value * props.scale);
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
            lines[row] = lines[row].slice(0, col - 1) + lines[row].slice(col);
            col -= 1;
            updated = true;
        } else if (row > 0) {
            const previousLength = lines[row - 1].length;
            lines[row - 1] += lines[row];
            lines.splice(row, 1);
            row -= 1;
            col = previousLength;
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
        e.preventDefault();
    }

    if (updated) {
        editingTextContent.value = lines;
        editingCaret.value = { row, col };

        // As soon as there is some content and this text is not yet registered add it to the undo stack and clear the redo stack
        const hasContent = lines.some(line => line.length > 0);
        if (hasContent && !editingTextRegistered.value && editingTextNode.value) {
            stack.value.push(editingTextNode.value);
            redoStack.value = [];
            editingTextRegistered.value = true;
        }

        updateSvgTextDisplay();
        drawSvgCaret();
    }
}


function updateSvgTextDisplay() {
    const textNode = editingTextNode.value;
    const { x } = editingTextAnchor.value;
    while (textNode.firstChild) textNode.removeChild(textNode.firstChild);
    editingTextContent.value.forEach((line, i) => {
        const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttribute("x", x);
        tspan.setAttribute("dy", i === 0 ? "0" : `${fontSize.value * 1.2 * props.scale}`);
        tspan.textContent = line.length ? line : "\u200B";
        textNode.appendChild(tspan);
    });
}

const caretBlinkTimer = ref(null);

function stopCaretBlink() {
    if (caretBlinkTimer.value !== null) {
        clearInterval(caretBlinkTimer.value);
        caretBlinkTimer.value = null;
    }
}

function startCaretBlink(caretEl) {
    // reset any previous timer
    stopCaretBlink();

    let visible = true;
    caretEl.style.opacity = '1';

    caretBlinkTimer.value = setInterval(() => {
        // if caret was removed from the DOM, stop
        if (!G.value || !caretEl || !G.value.contains(caretEl)) {
            stopCaretBlink();
            return;
        }
        visible = !visible;
        caretEl.style.opacity = visible ? '1' : '0';
    }, 500); // 500ms = 1s period (blink)
}

function drawSvgCaret() {
    const existingCaret = G.value?.querySelector('.vue-data-ui-svg-caret');
    if (existingCaret && G.value) {
        G.value.removeChild(existingCaret);
    }

    const textNode = editingTextNode.value;
    if (!textNode || !G.value) return;

    const { x, y } = editingTextAnchor.value;
    const { row, col } = editingCaret.value;
    const fontPx = fontSize.value * props.scale;

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

    const caretY = y + row * fontPx * 1.2;
    const caretX = x + bbox.width;

    const caret = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    caret.setAttribute("x", caretX);
    caret.setAttribute("y", caretY);
    caret.setAttribute("rx", 1);
    caret.setAttribute("width", 2);
    caret.setAttribute("height", fontPx);
    caret.setAttribute("fill", currentColor.value);
    caret.setAttribute("class", "vue-data-ui-svg-caret");
    G.value.appendChild(caret);

    startCaretBlink(caret);
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

    stopCaretBlink();

    const caret = G.value?.querySelector('.vue-data-ui-svg-caret');
    if (caret && G.value) {
        G.value.removeChild(caret);
    }

    const tspans = editingTextNode.value?.children;
    let isEmpty = false;
    if (tspans && tspans.length === 1) {
        const content = tspans[0].textContent;
        isEmpty = !content || content === "\u200B";
    }

    if (remove || isEmpty) {
        if (editingTextNode.value && G.value && G.value.contains(editingTextNode.value)) {
            G.value.removeChild(editingTextNode.value);
        }
    }

    isEditingText.value = false;
    editingTextNode.value = null;
    editingTextContent.value = [''];
    editingCaret.value = { row: 0, col: 0 };
    editingTextRegistered.value = false;
}


const buttonBorderColor = computed(() => lightenHexColor(props.color, 0.6));

function addInteractionMask() {
    if (!G.value) return;

    const existingMask = G.value.querySelector(".vue-data-ui-mask");
    if (existingMask) {
        G.value.removeChild(existingMask);
    }

    if (props.active) {
        const mask = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        mask.setAttribute("class", "vue-data-ui-mask");
        mask.setAttribute("width", "100%");
        mask.setAttribute("height", "100%");
        mask.setAttribute("fill", "transparent");
        mask.setAttribute("pointer-events", "all");
        G.value.insertBefore(mask, G.value.firstChild);
    }
}

function toSvgPoint(event) {
    const svg = props.svgRef;
    if (!svg) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const matrix = svg.getScreenCTM()?.inverse();
    return matrix ? point.matrixTransform(matrix) : { x: 0, y: 0 };
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

function startDrawing(event) {
    if (mode.value !== 'draw') return;
    if (!props.active || !G.value) return;
    isDrawing.value = true;
    const { x, y } = toSvgPoint(event);
    startPoint.value = { x, y };
    currentPath.value = `M ${x} ${y}`;
    currentDrawingPath.value = document.createElementNS("http://www.w3.org/2000/svg", "path");
    currentDrawingPath.value.setAttribute("stroke", currentColor.value);
    currentDrawingPath.value.setAttribute("stroke-width", strokeWidth.value * props.scale);
    currentDrawingPath.value.setAttribute("fill", "none");
    currentDrawingPath.value.setAttribute("stroke-linecap", "round");
    currentDrawingPath.value.setAttribute("stroke-linejoin", "round");
    currentDrawingPath.value.setAttribute("class", "vue-data-ui-doodle");
    G.value.appendChild(currentDrawingPath.value);
}

function draw(event) {
    if (!isDrawing.value || !G.value || !currentDrawingPath.value) return;
    const { x, y } = toSvgPoint(event);
    currentPath.value += ` ${x} ${y}`;
    currentDrawingPath.value.setAttribute("d", currentPath.value);
}

function stopDrawing(event) {
    if (isDrawing.value && G.value && currentDrawingPath.value) {
        const { x, y } = toSvgPoint(event);

        if (startPoint.value && startPoint.value.x === x && startPoint.value.y === y) {
            // Single click : circle
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", x);
            circle.setAttribute("cy", y);
            circle.setAttribute("r", (strokeWidth.value * props.scale) / 2);
            circle.setAttribute("fill", currentColor.value);
            circle.setAttribute("class", "vue-data-ui-doodle");
            G.value.appendChild(circle);
            stack.value.push(circle);
        } else {
            const newPath = currentDrawingPath.value;
            newPath.setAttribute("d", optimizeSvgPath(smoothPath(currentPath.value)));
            stack.value.push(newPath);
        }
        redoStack.value = [];
        currentDrawingPath.value = '';
    }
    isDrawing.value = false;
}

function deleteLastDraw() {
    if (stack.value.length > 0) {
        const lastShape = stack.value.pop();
        redoStack.value.push(lastShape);

        if (lastShape === editingTextNode.value) {
            cleanupSvgTextEditing(true);
        } else if (G.value && G.value.contains(lastShape)) {
            G.value.removeChild(lastShape);
        }
    }
}


function redoLastDraw() {
    if (redoStack.value.length > 0) {
        const lastUndonePath = redoStack.value.pop();
        stack.value.push(lastUndonePath);
        if (G.value) {
            G.value.appendChild(lastUndonePath);
        }
    }
}

function reset() {
    if (G.value) {
        G.value.innerHTML = "";
    }
    stack.value = [];
    redoStack.value = [];
    editingTextRegistered.value = false;
    addInteractionMask();
}


watch(mode, () => {
    if (!props.active) return;
    disableDrawing();
    enableDrawing();

    if (mode.value === 'text') {
        G.value.style.cursor = 'text';
    } else {
        G.value.style.cursor = cursorDraw.value;
    }
});

function enableDrawing() {
    if (!props.svgRef || !props.active) return;
    if (mode.value === 'draw') {
        props.svgRef.addEventListener("mousedown", startDrawing);
        props.svgRef.addEventListener("mousemove", draw);
        props.svgRef.addEventListener("mouseup", stopDrawing);
        props.svgRef.addEventListener("mouseleave", stopDrawing);
        props.svgRef.addEventListener("touchstart", startDrawing, { passive: false });
        props.svgRef.addEventListener("touchmove", draw, { passive: false });
        props.svgRef.addEventListener("touchend", stopDrawing);
    } else if (mode.value === 'text') {
        props.svgRef.addEventListener("mousedown", startSvgTextEditing);
    }
    if (G.value) {
        G.value.style.pointerEvents = "auto";
    }
}

function disableDrawing() {
    if (!props.svgRef) return;
    props.svgRef.removeEventListener("mousedown", startDrawing);
    props.svgRef.removeEventListener("mousemove", draw);
    props.svgRef.removeEventListener("mouseup", stopDrawing);
    props.svgRef.removeEventListener("mouseleave", stopDrawing);
    props.svgRef.removeEventListener("touchstart", startDrawing);
    props.svgRef.removeEventListener("touchmove", draw);
    props.svgRef.removeEventListener("touchend", stopDrawing);
    props.svgRef.removeEventListener("mousedown", startSvgTextEditing);

    if (G.value) {
        G.value.style.pointerEvents = "none";
    }
}

watch(() => props.active, (newVal) => {
    if (newVal) {
        enableDrawing();
    } else {
        disableDrawing();
    }
});

watch(() => props.active, () => {
    nextTick(() => {
        addInteractionMask();
    });
});

onMounted(() => {
    nextTick(() => {
        if (props.svgRef) {
            G.value = document.createElementNS("http://www.w3.org/2000/svg", "g");
            G.value.setAttribute("class", "vue-data-ui-doodles");
            G.value.style.cursor = cursorDraw.value;
            props.svgRef.appendChild(G.value);
            disableDrawing();
        }
    });
});

onBeforeUnmount(() => {
    stopCaretBlink();
    if (G.value && props.svgRef) {
        G.value.remove();
        disableDrawing();
    }
});
</script>

<template>
    <div v-if="active" data-dom-to-png-ignore class="vue-ui-pen-and-paper-actions" :style="{ backgroundColor: backgroundColor }">
        <button class="vue-ui-pen-and-paper-action" @click="emit('close')" :style="{
            backgroundColor: backgroundColor,
            border: `1px solid ${buttonBorderColor}`
        }">
            <slot name="annotator-action-close">
                <BaseIcon name="close" :stroke="color" />
            </slot>
        </button>

        <button class="vue-ui-pen-and-paper-action" style="padding: 0 !important">
            <ColorPicker 
                v-model:value="currentColor" 
                :backgroundColor="backgroundColor"
                :buttonBorderColor="buttonBorderColor"
            >
                <template #annotator-action-color="{ color }">
                    <slot name="annotator-action-color" v-bind="{ color }"/>
                </template>
            </ColorPicker>
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
            <slot name="annotator-action-draw" v-bind="{ mode }">
                <BaseIcon :name="mode === 'draw' ? 'annotator' : 'text'" :stroke="color" />
            </slot>    
            <div :style="{
                position: 'absolute',
                bottom: '-20px',
                color: buttonBorderColor,
                width: '100%',
                textAlign: 'center',
                fontSize: '12px',
                fontVariantNumeric: 'tabular-nums'
            }">
                {{ dataLabel({
                    v: mode === 'draw' ? strokeWidth : fontSize,
                    s: 'px',
                    r: 1
                }) }}

            </div>
        </button>

        <button class="vue-ui-pen-and-paper-action" :class="{ 'vue-ui-pen-and-paper-action-disabled': !stack.length }"
            :disabled="!stack.length" @click="deleteLastDraw" :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`,
                marginTop: '20px'
            }">
            <slot name="annotator-action-undo" v-bind="{ disabled: !stack.length }">
                <BaseIcon name="restart" :stroke="color" />
            </slot>
        </button>

        <button class="vue-ui-pen-and-paper-action"
            :class="{ 'vue-ui-pen-and-paper-action-disabled': !redoStack.length }" @click="redoLastDraw" :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }">
            <slot name="annotator-action-redo" v-bind="{ disabled: !redoStack.length}">
                <BaseIcon name="restart" :stroke="color" style="transform: scaleX(-1)" />
            </slot>
        </button>

        <button class="vue-ui-pen-and-paper-action" :class="{ 'vue-ui-pen-and-paper-action-disabled': !stack.length }"
            @click="reset" :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }"
        >
            <slot name="annotator-action-delete" v-bind="{ disabled: !stack.length }">
                <BaseIcon name="trash" :stroke="color" />
            </slot>
        </button>

        <input
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
</template>

<style>
.vue-ui-pen-and-paper-actions {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.vue-ui-pen-and-paper-action {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 32px;
    width: 32px;
    padding: 2px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    position: relative;
}

.vue-ui-pen-and-paper-action:hover {
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3);
}

.vue-ui-pen-and-paper-action-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

input[type="range"].vertical-range {
    writing-mode: vertical-lr;
    position: absolute;
    top: 50%;
    transform: translateY(-50%) rotate(180deg);
    left: 36px;
}
</style>

<style>
.vue-data-ui-svg-caret {
    opacity: 1;
}
</style>
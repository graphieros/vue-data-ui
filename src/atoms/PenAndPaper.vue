<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from "vue";
import BaseIcon from "./BaseIcon.vue";
import ColorPicker from "./ColorPicker.vue";
import { lightenHexColor } from "../lib";

const props = defineProps({
    svgRef: {
        type: [Object, null],
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
        const lastPath = stack.value.pop();
        redoStack.value.push(lastPath);
        if (G.value) {
            G.value.removeChild(lastPath);
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
    addInteractionMask();
}

function enableDrawing() {
    if (!props.svgRef || !props.active) return;

    props.svgRef.addEventListener("mousedown", startDrawing);
    props.svgRef.addEventListener("mousemove", draw);
    props.svgRef.addEventListener("mouseup", stopDrawing);
    props.svgRef.addEventListener("mouseleave", stopDrawing);
    props.svgRef.addEventListener("touchstart", startDrawing, { passive: false });
    props.svgRef.addEventListener("touchmove", draw, { passive: false });
    props.svgRef.addEventListener("touchend", stopDrawing);

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
            G.value.style.cursor = `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABg2lDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVh2YQcchQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQrPKNKtnAtB020wn4lIuvyqFXhGGiAhCiMnMMpKZxSx8x9c9Any9i/Es/3N/jgG1YDEgIBHPMcO0iTeIZzZtg/M+scjKskp8Tjxu0gWJH7muePzGueSywDNFM5ueJxaJpVIXK13MyqZGPE0cVTWd8oWcxyrnLc5atc7a9+QvDBf0lQzXaY4ggSUkkYIEBXVUUIWNGK06KRbStB/38Q+7/hS5FHJVwMixgBo0yK4f/A9+d2sVpya9pHAc6H1xnI9RILQLtBqO833sOK0TIPgMXOkdf60JzH6S3uho0SNgcBu4uO5oyh5wuQMMPRmyKbtSkKZQLALvZ/RNeSByC/Sveb2193H6AGSpq+Ub4OAQGCtR9rrPu/u6e/v3TLu/H5C7crM1WjgWAAAABmJLR0QAqwB5AHWF+8OUAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5gwUExIUagzGcQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABfSURBVBjTldAxDoNQDIPhL0+q1L33P1AvAhN7xfK6WAgoLfSfrNiykpQtE+7RLzx2vgF9D3o8lWDmn1QVVMP0LZQGmNtqp1/cmou0XHdG/+sYeGZwFBqPCub8rkcvvAGvsi1VYarR8wAAAABJRU5ErkJggg==') 5 5, auto`;
            props.svgRef.appendChild(G.value);
            disableDrawing();
        }
    });
});

onBeforeUnmount(() => {
    if (G.value && props.svgRef) {
        props.svgRef.removeChild(G.value);
        disableDrawing();
    }
});
</script>

<template>
    <div v-if="active" data-dom-to-png-ignore class="vue-ui-pen-and-paper-actions">
        <button class="vue-ui-pen-and-paper-action" @click="emit('close')" :style="{
            backgroundColor: backgroundColor,
            border: `1px solid ${buttonBorderColor}`
        }">
            <BaseIcon name="close" :stroke="color" />
        </button>
        <button class="vue-ui-pen-and-paper-action" style="padding: 0 !important">
            <ColorPicker v-model:value="currentColor" :backgroundColor="backgroundColor"
                :buttonBorderColor="buttonBorderColor" />
        </button>
        <button class="vue-ui-pen-and-paper-action" :class="{ 'vue-ui-pen-and-paper-action-disabled': !stack.length }"
            :disabled="!stack.length" @click="deleteLastDraw" :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }">
            <BaseIcon name="restart" :stroke="color" />
        </button>
        <button class="vue-ui-pen-and-paper-action"
            :class="{ 'vue-ui-pen-and-paper-action-disabled': !redoStack.length }" @click="redoLastDraw" :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }">
            <BaseIcon name="restart" :stroke="color" style="transform: scaleX(-1)" />
        </button>
        <button class="vue-ui-pen-and-paper-action" :class="{ 'vue-ui-pen-and-paper-action-disabled': !stack.length }"
            @click="reset" :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }">
            <BaseIcon name="trash" :stroke="color" />
        </button>
        <input ref="range" type="range" class="vertical-range" :min="0.5" :max="12" :step="0.1" v-model="strokeWidth"
            :style="{ accentColor: color }" />
    </div>
</template>

<style scoped>
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

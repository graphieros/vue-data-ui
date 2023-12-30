<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { treeShake, convertConfigColors } from "../lib.js";
import html2canvas from "html2canvas";
import mainConfig from "../default_configs.json";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const uid = ref(`vue-ui-screenshot-${Math.random()}`);

const defaultConfig = ref(mainConfig.vue_ui_screenshot);

const screenshotConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    const reconcilied = treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconcilied);
});

const overlay = ref(null);
const clientX = ref(null);
const clientY = ref(null);
const currentClientX = ref(null);
const currentClientY = ref(null);
const initialX = ref(null);
const initialY = ref(null);
const currentX = ref(null);
const currentY = ref(null);
const originalWidth = ref(null);
const originalHeight = ref(null);
const isSelecting = ref(false);
const timeout = ref(null);

function createOverlay() {
    const o = document.createElement("DIV");
    o.style.position = 'fixed';
    o.style.top = '200px';
    o.style.left = '100px';
    o.style.width = `${screenshotConfig.value.style.captureArea.initialWidth}px`;
    o.style.height = `${screenshotConfig.value.style.captureArea.initialHeight}px`;
    o.style.background = screenshotConfig.value.style.captureArea.background;
    o.style.cursor = 'move';
    o.style.boxSizing = 'border-box';
    o.style.border = screenshotConfig.value.style.captureArea.border;
    o.style.resize = 'both';
    o.style.padding = "none !important";
    o.style.margin = "none !important";
    o.dataset.cy = "screenshot-overlay"
    return o;
}

function close() {
    if (!overlay.value) return;
    clearTimeout(timeout.value);
    overlay.value.remove();
    overlay.value = null;
}

function createInfoText(o) {
    const infoText = document.createElement("DIV");
    infoText.classList.add("vue-ui-screenshot-info-text");
    infoText.innerHTML = screenshotConfig.value.translations.info;
    infoText.dataset.html2canvasIgnore = "true";
    infoText.dataset.cy = "screenshot-info-text";
    infoText.style.background = screenshotConfig.value.style.info.background;
    infoText.style.color = screenshotConfig.value.style.info.color;
    infoText.style.fontWeight = screenshotConfig.value.style.info.bold ? 'bold' : 'normal';
    infoText.style.minWidth = `${screenshotConfig.value.style.info.minWidth}px`;
    infoText.style.left = "50%";
    infoText.style.padding = `${screenshotConfig.value.style.info.padding}px`;
    infoText.style.position = "absolute";
    infoText.style.textAlign = "center";
    infoText.style.top = `${screenshotConfig.value.style.info.top}px`;
    infoText.style.transform = "translateX(-50%)";
    infoText.style.borderRadius = `${screenshotConfig.value.style.info.borderRadius}px`;
    infoText.style.boxShadow = screenshotConfig.value.style.info.boxShadow;
    infoText.style.fontFamily = screenshotConfig.value.style.info.fontFamily;
    infoText.style.fontSize = `${screenshotConfig.value.style.info.fontSize}px`;
    infoText.style.border = screenshotConfig.value.style.info.border;
    infoText.style.userSelect = "none";
    const closeButton = document.createElement("BUTTON");
    closeButton.classList.add("vue-ui-screenshot-close-button");
    closeButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>`;
    closeButton.style.outline = "none";
    closeButton.dataset.cy = "screenshot-close-button"
    closeButton.style.display = "flex";
    closeButton.style.cursor = "pointer"; 
    closeButton.style.borderRadius = "50%";
    closeButton.style.alignItems = "center";
    closeButton.style.position = "absolute";
    closeButton.style.justifyContent = "center";
    closeButton.style.transformOrigin = "center";
    closeButton.style.top = `${screenshotConfig.value.style.cancelButton.top}px`;
    closeButton.style.right = `${screenshotConfig.value.style.cancelButton.right}px`;
    closeButton.style.background = screenshotConfig.value.style.cancelButton.background;
    closeButton.style.color = screenshotConfig.value.style.cancelButton.color;
    closeButton.style.border = screenshotConfig.value.style.cancelButton.border;
    closeButton.style.borderRadius = `${screenshotConfig.value.style.cancelButton.borderRadius}px`
    closeButton.style.height = `${screenshotConfig.value.style.cancelButton.size}px`;
    closeButton.style.width = `${screenshotConfig.value.style.cancelButton.size}px`;
    closeButton.addEventListener("click", close);
    infoText.appendChild(closeButton);
    o.appendChild(infoText);
}

function moveHandle(event) {
    if (!overlay.value) return;
    isSelecting.value = true;
    if(event.touches) {
        initialX.value = event.touches[0].clientX;
        initialY.value = event.touches[0].clientY;
    } else {
        initialX.value = event.clientX;
        initialY.value = event.clientY;
    }
    originalWidth.value = overlay.value.getBoundingClientRect().width;
    originalHeight.value = overlay.value.getBoundingClientRect().height;
    event.target.addEventListener("mousemove", resizeHandle);
    event.target.addEventListener("touchmove", resizeHandle);
}

function resizeHandle(event) {
    if (!overlay.value) return;
    let sourceX, sourceY;
    if(event.touches) {
        currentX.value = event.touches[0].clientX;
        sourceX = event.touches[0].clientX;
        currentY.value = event.touches[0].clientY;
        sourceY = event.touches[0].clientY;
    }else {
        currentX.value = event.clientX;
        sourceX = event.clientX;
        currentY.value = event.clientY;
        sourceY = event.clientY;
    }
    const side = event.target.classList[0];
    const overlayStyle = overlay.value.style;
    switch (true) {
        case side === 'vue-ui-screenshot-handle-nw':
            overlayStyle.top = `${sourceY}px`;
            overlayStyle.left = `${sourceX}px`;
            overlayStyle.width = `${originalWidth.value + (initialX.value - currentX.value)}px`;
            overlayStyle.height = `${originalHeight.value + (initialY.value - currentY.value)}px`;
            break;
        case side === 'vue-ui-screenshot-handle-ne':
            overlayStyle.top = `${sourceY}px`;
            overlayStyle.width = `${originalWidth.value + (currentX.value - initialX.value)}px`;
            overlayStyle.height = `${originalHeight.value + (initialY.value - currentY.value)}px`;
            break;
        case side === 'vue-ui-screenshot-handle-sw':
            overlayStyle.left = `${sourceX}px`;
            overlayStyle.width = `${originalWidth.value + (initialX.value - currentX.value)}px`;
            overlayStyle.height = `${originalHeight.value + (currentY.value - initialY.value)}px`;
            break;
        case side === 'vue-ui-screenshot-handle-se':
            overlayStyle.width = `${originalWidth.value + (currentX.value - initialX.value)}px`;
            overlayStyle.height = `${originalHeight.value + (currentY.value - initialY.value)}px`;
            break;
        default:
            break;
    }
}

function handleMouseDown(event) {
    if (!overlay.value) return;
    event.stopPropagation();
    const targetClassList = Array.from(event.target.classList);
    const targetIsAHandle = targetClassList.includes("vue-ui-screenshot-handle-se") 
    || targetClassList.includes("vue-ui-screenshot-handle-sw") 
    || targetClassList.includes("vue-ui-screenshot-handle-nw") 
    || targetClassList.includes("vue-ui-screenshot-handle-ne");
    if (targetIsAHandle) return;

    isSelecting.value = true;
    overlay.value.style.pointerEvents = "auto";
    if(event.touches) {
        clientX.value = event.touches[0].clientX;
        clientY.value = event.touches[0].clientY;
    } else {
        clientX.value = event.clientX;
        clientY.value = event.clientY;
    }
    currentClientX.value = clientX.value;
    currentClientY.value = clientY.value;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("touchmove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);
}

function handleMouseUp() {
    clientX.value = null;
    clientY.value = null;
    currentClientX.value = null;
    currentClientY.value = null;
    isSelecting.value = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleMouseMove);
    document.removeEventListener('touchend', handleMouseUp);
}

function handleMouseMove(event) {
    if (!overlay.value) return;
    const box = overlay.value.getBoundingClientRect();
    let deltaX, deltaY;
    if(event.touches) {
        deltaX = event.touches[0].clientX - clientX.value;
        deltaY = event.touches[0].clientY - clientY.value;
        clientX.value = event.touches[0].clientX;
        clientY.value = event.touches[0].clientY;
    } else {
        deltaX = event.clientX - clientX.value;
        deltaY = event.clientY - clientY.value;
        clientX.value = event.clientX;
        clientY.value = event.clientY;
    }
    overlay.value.style.top = `${box.top + deltaY}px`;
    overlay.value.style.left = `${box.left + deltaX}px`;
}

function stopHandle(event) {
    event.target.removeEventListener("mousemove", resizeHandle);
    event.target.removeEventListener("touchmove", resizeHandle);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('touchmove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchend', handleMouseUp);
    isSelecting.value = false;
}

function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "tablet";
    }
    if (
        /Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua
        )
    ) {
        return "mobile";
    }
    return "desktop";
}

const emit = defineEmits(['postImage']);

function animateSaveButton() {
    const button = document.getElementById(`vue-ui-screenshot-button-${uid.value}`);
    button.innerHTML = `<svg id="saveButtonSvg" xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 20 20" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path fill="none" stroke="currentColor" d="M1 4 1 3C1 2 2 1 3 1L4 1M16 1 17 1C18 1 19 2 19 3L19 4M1 16 1 17C1 18 2 19 3 19L4 19M16 19 17 19C18 19 19 18 19 17L19 16M8 10A1 1 0 0012 10 1 1 0 008 10M5 13 5 8C5 7 5 7 6 7L14 7C15 7 15 7 15 8L15 13C15 14 15 14 14 14L6 14C5 14 5 14 5 13M7 6 13 6" />
    </svg>`;

    document.getElementById(`vue-ui-screenshot-button-${uid.value}`).animate([
        { opacity: '0.3'},
        { opacity: '1' },
        { opacity: "0.3"}
    ], { duration: 1000, iterations: Infinity});

    button.classList.add("loading");
    button.setAttribute("disabled", 'true');
}

function saveScreenshot() {
    if (!overlay.value) return;
    animateSaveButton();
    const overlayRect = overlay.value.getBoundingClientRect();
    timeout.value = setTimeout(() => {
        html2canvas(document.body, {
            allowTaint: true,
            width: overlayRect.width,
            height: overlayRect.height,
            x: overlayRect.left + window.scrollX,
            y: overlayRect.top + window.scrollY,
            useCORS: true,
            scale: screenshotConfig.value.quality
        })
        .then(canvas => {
            const image = canvas.toDataURL('image/png', 1);
            const base64data = image.split(',')[1];
            const bytes = atob(base64data);
            const fileSize = bytes.length / 1024;
            if(screenshotConfig.value.mode === 'download') {
                const link = document.createElement("a");
                link.download = 'screenshot.png';
                link.href = image;
                link.click();
            }
            if(screenshotConfig.value.mode === 'post') {
                emit('postImage', {
                    createdAt: Date.now(),
                    fileSize: `${fileSize.toFixed(2)} KB`,
                    image,
                    x: overlayRect.left + window.scrollX,
                    y: overlayRect.top + window.scrollY,
                    screenWidth: window.innerWidth > 0 ? window.innerWidth : screen.width,
                    deviceType: getDeviceType()
                })
            }
        })
        .finally(close)
    }, 10)
}

function createHandles(o) {
    const offset = screenshotConfig.value.style.handles.size / 2 + 4;
    const NW = document.createElement("DIV");
    NW.style.top = `${-offset}px`;
    NW.style.left = `${-offset}px`;
    NW.style.cursor = "nw-resize";
    NW.classList.add("vue-ui-screenshot-handle-nw");
    NW.dataset.cy = "screenshot-handle-nw";

    const NE = document.createElement("DIV");
    NE.style.top = `${-offset}px`;
    NE.style.left = "auto";
    NE.style.right = `${-offset}px`;
    NE.style.cursor = "ne-resize";
    NE.classList.add("vue-ui-screenshot-handle-ne");
    NE.dataset.cy = "screenshot-handle-ne";

    const SW = document.createElement("DIV");
    SW.style.top = "auto";
    SW.style.bottom = `${-offset}px`;
    SW.style.left = `${-offset}px`;
    SW.style.cursor = "sw-resize";
    SW.classList.add("vue-ui-screenshot-handle-sw");
    SW.dataset.cy = "screenshot-handle-sw";

    const SE = document.createElement("DIV");
    SE.style.top = "auto";
    SE.style.left = "auto";
    SE.style.right = `${-offset}px`;
    SE.style.bottom = `${-offset}px`;
    SE.style.cursor = "se-resize";
    SE.classList.add("vue-ui-screenshot-handle-se");
    SE.dataset.cy = "screenshot-handle-se";

    const saveButton = document.createElement("BUTTON");
    saveButton.innerHTML = `<svg id="saveButtonSvg" xmlns="http://www.w3.org/2000/svg"  width="24" height="24" viewBox="0 0 20 20" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path fill="none" stroke="currentColor" d="M1 4 1 3C1 2 2 1 3 1L4 1M16 1 17 1C18 1 19 2 19 3L19 4M1 16 1 17C1 18 2 19 3 19L4 19M16 19 17 19C18 19 19 18 19 17L19 16M8 10A1 1 0 0012 10 1 1 0 008 10M5 13 5 8C5 7 5 7 6 7L14 7C15 7 15 7 15 8L15 13C15 14 15 14 14 14L6 14C5 14 5 14 5 13M7 6 13 6" /></svg><span>${screenshotConfig.value.translations.captureButton}</span>`;

    saveButton.classList.add("vue-ui-screenshot-capture-button");
    saveButton.id = `vue-ui-screenshot-button-${uid.value}`;
    saveButton.style.position = "absolute";
    saveButton.style.top = "50%";
    saveButton.style.left = "50%";
    saveButton.style.transform = "translate(-50%,-50%)";
    saveButton.style.background = screenshotConfig.value.style.captureButton.background;
    saveButton.style.color = screenshotConfig.value.style.captureButton.color;
    saveButton.style.border = screenshotConfig.value.style.captureButton.border;
    saveButton.style.outline = "none";
    saveButton.style.cursor = "pointer";
    saveButton.style.padding = screenshotConfig.value.style.captureButton.padding;
    saveButton.style.fontFamily = screenshotConfig.value.style.captureButton.fontFamily;
    saveButton.style.fontSize = `${screenshotConfig.value.style.captureButton.fontSize}px`;
    saveButton.style.minHeight = `${screenshotConfig.value.style.captureButton.minHeight}px`;
    saveButton.style.width = "fit-content";
    saveButton.style.display = "flex";
    saveButton.style.alignItems = "center";
    saveButton.style.justifyContent = "center";
    saveButton.style.gap = "3px";
    saveButton.style.borderRadius = `${screenshotConfig.value.style.captureButton.borderRadius}px`;
    saveButton.style.boxShadow = screenshotConfig.value.style.captureButton.boxShadow;
    saveButton.style.userSelect = "none";
    saveButton.style.opacity = "0.95";
    saveButton.style.textAlign="left";
    saveButton.style.fontWeight = screenshotConfig.value.style.captureButton.bold ? 'bold' : 'normal';
    saveButton.dataset.cy = "screenshot-save-button";
    saveButton.addEventListener("mouseenter", () => {
        saveButton.style.opacity = "1";
    });
    saveButton.addEventListener("mouseleave", () => {
        saveButton.style.opacity = "0.95";
    })
    saveButton.addEventListener("click", saveScreenshot);
    o.appendChild(saveButton);

    [NW, NE, SW, SE].forEach((handle, i) => {
        handle.classList.add(`handle-${i}`);
        handle.dataset.html2canvasIgnore = "true";
        handle.style.position = "absolute";
        handle.style.height = `${screenshotConfig.value.style.handles.size}px`;
        handle.style.width = `${screenshotConfig.value.style.handles.size}px`;
        handle.style.background = screenshotConfig.value.style.handles.background;
        handle.style.border = screenshotConfig.value.style.handles.border;
        handle.style.borderRadius = `${screenshotConfig.value.style.handles.borderRadius}px`;
        handle.style.pointerEvents = "auto !important";
        handle.addEventListener("mousedown" , moveHandle);
        handle.addEventListener("touchstart", moveHandle);
        o.appendChild(handle);
    });
}

function shoot() {
    if (overlay.value) return;
    nextTick(() => {
        const o = createOverlay();
        o.dataset.html2canvasIgnore = true;
        createInfoText(o);
        createHandles(o);
        overlay.value = o;
        o.addEventListener("touchmove", function(e) {
            e.preventDefault();
        }, { passive: false });
        document.body.appendChild(o);
        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("touchstart", handleMouseDown);
        document.addEventListener("mouseup", stopHandle);
        document.addEventListener("touchend", stopHandle);
    })
}

defineExpose({
    shoot,
    close
});

</script>

<template>
    <div></div>
</template>
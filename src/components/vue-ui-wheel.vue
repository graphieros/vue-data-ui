<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    onBeforeUnmount, 
    onMounted, 
    ref, 
    shallowRef, 
    toRefs,
    watch, 
} from "vue";
import { 
    applyDataLabel,
    checkNaN,
    createUid,
    dataLabel,
    error,
    lightenHexColor,
    makeDonut,
    objectIsEmpty,
    shiftHue,
    treeShake,
    XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import img from "../img";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_wheel: DEFAULT_CONFIG } = useConfig()

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Object,
        default() {
            return {}
        }
    },
});

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length
});

const uid = ref(createUid());
const details = ref(null);
const step = ref(0);
const wheelChart = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: { percentage: 50 },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
        userOptions: { show: false },
        style: {
            chart: {
                backgroundColor: '#99999930',
                animation: { use: false },
                layout: {
                    wheel: {
                        ticks: {
                            activeColor: '#6A6A6A80',
                            inactiveColor: '#CACACA80',
                        }
                    },
                    innerCircle: {
                        stroke: '#CACACA80'
                    },
                }
            }
        }
    }
    })
})

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_wheel[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: uid.value,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-wheel',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const svg = ref({
    size: 360,
    height: 360,
    width: 360
});

const baseLabelFontSize = ref(FINAL_CONFIG.value.style.chart.layout.percentage.fontSize)

const wheel = computed(() => {
    return {
        radius: ((Math.min(svg.value.width, svg.value.height) * 0.9) / 2) * FINAL_CONFIG.value.style.chart.layout.wheel.radiusRatio,
        centerX: svg.value.width / 2,
        centerY: svg.value.height / 2,
    }
})

function calcTickStart(angle, distance = 1) {
    const angleStart = 29.85;
    return {
        x: wheel.value.centerX + wheel.value.radius * Math.cos(angleStart + angle * Math.PI / 180) * distance,
        y: wheel.value.centerY + wheel.value.radius * Math.sin(angleStart + angle * Math.PI / 180) * distance
    }
}

const activeValue = ref(FINAL_CONFIG.value.style.chart.animation.use ? 0 : (FINAL_DATASET.value.percentage || 0));

watch(() => FINAL_DATASET.value, (v) => {
    if (FINAL_CONFIG.value.style.chart.animation.use) {
        useAnimation(v.percentage);
    } else {
        activeValue.value = v.percentage || 0
    }
}, { deep: true });

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiWheel',
            type: 'dataset',
            debug: debug.value
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: wheelChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
                baseLabelFontSize.value = (FINAL_CONFIG.value.style.chart.layout.percentage.fontSize / 360) * Math.min(width, height);
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = wheelChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }

    useAnimation(FINAL_DATASET.value.percentage || 0);
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

function rotateX([x, y, z], ax) {
    const ca = Math.cos(ax), sa = Math.sin(ax);
    return [x, y * ca - z * sa, y * sa + z * ca];
}
function perspectiveProject([x, y, z], f) {
    const s = f / (f - z);
    return [x * s, y * s, z, s];
}

function shadeColor(hex, t) {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0,2), 16);
    const g = parseInt(c.substring(2,4), 16);
    const b = parseInt(c.substring(4,6), 16);
    const shadeRatio = Math.min(1, Math.max(0, FINAL_CONFIG.value.style.chart.layout.wheel.ticks.shadeColorRatio3d));
    const k = 1 - (shadeRatio * t);
    const rr = Math.max(0, Math.min(255, Math.round(r * k)));
    const gg = Math.max(0, Math.min(255, Math.round(g * k)));
    const bb = Math.max(0, Math.min(255, Math.round(b * k)));
    return `#${rr.toString(16).padStart(2,'0')}${gg.toString(16).padStart(2,'0')}${bb.toString(16).padStart(2,'0')}`;
}

function buildTicks3D({
    cx, cy, radius, innerRatio = 0.8,
    count = 120,
    startDeg = 0,
    axDeg = 50,
    f = 520,
    baseStroke = 5,
    activeColor,
    inactiveColor,
    getActive
}) {
    const ax = axDeg * Math.PI / 180;
    const outerR = radius;
    const innerR = radius * innerRatio;
    const ticks = [];
    for (let i = 0; i < count; i += 1) {
        const a = ((i / count) * 360 + startDeg) * Math.PI / 180;

        const xo = cx + outerR * Math.cos(a);
        const yo = cy + outerR * Math.sin(a);
        const xi = cx + innerR * Math.cos(a);
        const yi = cy + innerR * Math.sin(a);

        const po = [xo - cx, yo - cy, 0];
        const pi = [xi - cx, yi - cy, 0];

        const [rxo, ryo, rzo] = rotateX(po, ax);
        const [rxi, ryi, rzi] = rotateX(pi, ax);

        const [pxo, pyo, , so] = perspectiveProject([rxo, ryo, rzo], f);
        const [pxi, pyi, , si] = perspectiveProject([rxi, ryi, rzi], f);

        const x1 = cx + pxo; 
        const y1 = cy + pyo;
        const x2 = cx + pxi; 
        const y2 = cy + pyi;

        const depth = (Math.max(rzo, rzi) - (-outerR * Math.sin(ax))) / (2 * outerR * Math.sin(ax) || 1);
        const isActive = getActive ? getActive(i) : true;

        const c = FINAL_CONFIG.value.style.chart.layout.wheel.ticks.gradient.show ? shiftHue(activeColor, (i * percentageToTickAmount.value) / tickAmount.value * (FINAL_CONFIG.value.style.chart.layout.wheel.ticks.gradient.shiftHueIntensity / 100)) : activeColor;

        const baseColor = isActive ? c : inactiveColor;
        const color = shadeColor(baseColor, depth);
        const stroke = Math.max(1.25, baseStroke * so * (Math.min(svg.value.width, svg.value.height) / 360));

        ticks.push({ i, x1, y1, x2, y2, stroke, color, z: Math.max(rzo, rzi)});
    }
    ticks.sort((a, b) => a.z - b.z);
    return ticks;
}

const ticks3D = computed(() => {
    if (!FINAL_CONFIG.value.layout === '3d') return null;

    const count = tickAmount.value;
    const activeColor = FINAL_CONFIG.value.style.chart.layout.wheel.ticks.gradient.show
        ? shiftHue(FINAL_CONFIG.value.style.chart.layout.wheel.ticks.activeColor, 0)
        : FINAL_CONFIG.value.style.chart.layout.wheel.ticks.activeColor;

    const inactiveColor = FINAL_CONFIG.value.style.chart.layout.wheel.ticks.inactiveColor;
    const baseStroke = FINAL_CONFIG.value.style.chart.layout.wheel.ticks.strokeWidth;

    return buildTicks3D({
        cx: wheel.value.centerX,
        cy: wheel.value.centerY,
        radius: wheel.value.radius,
        innerRatio: FINAL_CONFIG.value.style.chart.layout.wheel.ticks.sizeRatio,
        count,
        startDeg: -90,
        axDeg: FINAL_CONFIG.value.style.chart.layout.wheel.tiltAngle3d,
        f: Math.min(svg.value.width, svg.value.height) * 1.45,
        baseStroke,
        activeColor,
        inactiveColor,
        getActive: (i) => activeValue.value > (i * percentageToTickAmount.value)
    });
});

function buildCirclePath3D({ cx, cy, r, count = 180, startDeg = -90, axDeg = 50, f }) {
    const ax = (axDeg * Math.PI) / 180;
    const pts = [];
    let scaleSum = 0;

    for (let i = 0; i < count; i += 1) {
        const a = ((i / count) * 360 + startDeg) * Math.PI / 180;
        const p = [r * Math.cos(a), r * Math.sin(a), 0];
        const [rx, ry, rz] = rotateX(p, ax);
        const [px, py, , s] = perspectiveProject([rx, ry, rz], f);
        scaleSum += s;
        pts.push([cx + px, cy + py]);
    }

    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i += 1) {
        d += ` L ${pts[i][0]} ${pts[i][1]}`;
    }
    d += ' Z';

    const avgScale = scaleSum / count;
    return { d, avgScale, pts };
}

const vb3D = computed(() => {
    if (FINAL_CONFIG.value.layout !== '3d') return null;

    const f  = Math.min(svg.value.width, svg.value.height) * 1.45;
    const ax = FINAL_CONFIG.value.style.chart.layout.wheel.tiltAngle3d;


    const outerR = wheel.value.radius;
    const { pts, avgScale } = (() => {
        const r = outerR;
        const axDeg = ax;
        const { d, avgScale, pts } = buildCirclePath3D({
        cx: wheel.value.centerX,
        cy: wheel.value.centerY,
        r,
        startDeg: -90,
        axDeg,
        f
        });
        return { pts, avgScale };
    })();

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of pts) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }

    const tickStroke =
        (FINAL_CONFIG.value.style.chart.layout.wheel.ticks.strokeWidth / 360) *
        Math.min(svg.value.width, svg.value.height);

    const innerStroke = FINAL_CONFIG.value.style.chart.layout.innerCircle.strokeWidth || 0;

    const strokePad = 0.5 * Math.max(tickStroke, innerStroke * (avgScale || 1));
    const depthPad  = Math.max(0, Number(FINAL_CONFIG.value.style.chart.layout.wheel.ticks.depth3d) || 0);

    const pad = strokePad;

    return {
        x: minX - pad,
        y: (minY - depthPad) - pad,
        w: (maxX - minX) + 2 * pad,
        h: (maxY - (minY - depthPad)) + 2 * pad
    };
});

function ellipse(r) {
    const f = Math.min(svg.value.width, svg.value.height) * 1.45;
    const { d, avgScale } = buildCirclePath3D({
        cx: wheel.value.centerX,
        cy: wheel.value.centerY,
        r,
        startDeg: -90,
        axDeg: FINAL_CONFIG.value.style.chart.layout.wheel.tiltAngle3d,
        f
    });

    const swBase = FINAL_CONFIG.value.style.chart.layout.innerCircle.strokeWidth || 1;
    const strokeWidth = swBase * avgScale; // compensate perspective


    return {
        d,
        stroke: FINAL_CONFIG.value.style.chart.layout.innerCircle.stroke,
        strokeWidth
    };
}

const inner3D = computed(() => {
  return ellipse(Math.max(0, wheel.value.radius * 0.8 * FINAL_CONFIG.value.style.chart.layout.innerCircle.radiusRatio));
});

function projectRingPoint({ cx, cy, r, aRad, ax, f }) {
    const p = [r * Math.cos(aRad), r * Math.sin(aRad), 0];
    const [rx, ry, rz] = rotateX(p, ax);
    const [px, py, , s] = perspectiveProject([rx, ry, rz], f);
    return { x: cx + px, y: cy + py, z: rz, s };
}

function buildArcTicks3D({
    cx, cy, radius, innerRatio = 0.8,
    count = 120,
    startDeg = -87,
    axDeg = 45,
    f = 600,
    activeColor,
    inactiveColor,
    getActive,
    Y = 0
}) {
    const ax = (axDeg * Math.PI) / 180;
    const outerR = radius;
    const innerR = radius * innerRatio;
    const step = (2 * Math.PI) / count;
    const wedges = [];

    for (let i = 0; i < count; i += 1) {
        const a0 = ((startDeg * Math.PI) / 180) + step * i;
        const a1 = a0 + step * Math.min(1, FINAL_CONFIG.value.style.chart.layout.wheel.ticks.spacingRatio3d);
        const o0 = projectRingPoint({ cx, cy: cy + Y, r: outerR, aRad: a0, ax, f });
        const o1 = projectRingPoint({ cx, cy: cy + Y, r: outerR, aRad: a1, ax, f });
        const i1 = projectRingPoint({ cx, cy: cy + Y, r: innerR, aRad: a1, ax, f });
        const i0 = projectRingPoint({ cx, cy: cy + Y, r: innerR, aRad: a0, ax, f });
        const zAvg = (o0.z + o1.z + i0.z + i1.z) / 4;
        const isActive = getActive ? getActive(i) : true;
        const base = isActive
            ? (FINAL_CONFIG.value.style.chart.layout.wheel.ticks.gradient.show
                ? shiftHue(
                    FINAL_CONFIG.value.style.chart.layout.wheel.ticks.activeColor,
                    (i * (100 / count)) / 100 *
                    (FINAL_CONFIG.value.style.chart.layout.wheel.ticks.gradient.shiftHueIntensity / 100)
                    )
                : activeColor)
            : inactiveColor;

        const depth = (() => {
            const amp = outerR * Math.sin(ax) || 1;
            return (zAvg - (-amp)) / (2 * amp);
        })();

        const fill = shadeColor(base, depth);
        const d = `M ${o0.x} ${o0.y} L ${o1.x} ${o1.y} L ${i1.x} ${i1.y} L ${i0.x} ${i0.y} Z`;
        wedges.push({ i, d, fill, z: zAvg });
    }

    wedges.sort((a, b) => a.z - b.z);
    return wedges;
}

const arcTicks3D = computed(() => {
    if (FINAL_CONFIG.value.layout !== '3d') return null;

    const count = tickAmount.value;
    return (Y) => buildArcTicks3D({
        cx: wheel.value.centerX,
        cy: wheel.value.centerY,
        radius: wheel.value.radius,
        innerRatio: FINAL_CONFIG.value.style.chart.layout.wheel.ticks.sizeRatio,
        count,
        startDeg: -90,
        axDeg: FINAL_CONFIG.value.style.chart.layout.wheel.tiltAngle3d,
        f: Math.min(svg.value.width, svg.value.height) * 1.45,
        activeColor: FINAL_CONFIG.value.style.chart.layout.wheel.ticks.activeColor,
        inactiveColor: FINAL_CONFIG.value.style.chart.layout.wheel.ticks.inactiveColor,
        getActive: (i) => activeValue.value > (i * (100 / count)),
        Y
    });
});


function useAnimation(targetValue) {
    let speed = FINAL_CONFIG.value.style.chart.animation.speed;
    const chunk = Math.abs(targetValue - activeValue.value) / (speed * 120);

    function animate() {
        if(activeValue.value < targetValue) {
            activeValue.value = Math.min(activeValue.value + chunk, targetValue);
        } else if (activeValue.value > targetValue) {
            activeValue.value = Math.max(activeValue.value - chunk, targetValue)
        }
        
        if (activeValue.value !== targetValue) {
            requestAnimationFrame(animate)
        }
    }
    animate()
}

const tickAmount = computed(() => {
    if (FINAL_CONFIG.value.debug && FINAL_CONFIG.value.style.chart.layout.wheel.ticks.quantity < 12) {
        console.warn(`VueUiWheel - The min number of ticks is 12`);
    }
    if (FINAL_CONFIG.value.debug && FINAL_CONFIG.value.style.chart.layout.wheel.ticks.quantity > 200) {
        console.warn(`VueUiWheel - The max number of ticks is 200`);
    }
    return Math.max(12, Math.min(FINAL_CONFIG.value.style.chart.layout.wheel.ticks.quantity, 200));
});

const percentageToTickAmount = computed(() => 100 / tickAmount.value);

const ticks = computed(() => {
    const tickArray = [];
    for(let i = 0; i < tickAmount.value; i += 1) {
        const color = activeValue.value > (i * percentageToTickAmount.value) ? FINAL_CONFIG.value.style.chart.layout.wheel.ticks.activeColor : FINAL_CONFIG.value.style.chart.layout.wheel.ticks.inactiveColor;
        const { x: x1, y: y1 } = calcTickStart((svg.value.size / tickAmount.value) * i);
        const { x: x2, y: y2 } = calcTickStart((svg.value.size / tickAmount.value) * i, FINAL_CONFIG.value.style.chart.layout.wheel.ticks.sizeRatio);
        tickArray.push({
            x1,
            y1,
            x2,
            y2,
            color: FINAL_CONFIG.value.style.chart.layout.wheel.ticks.gradient.show ? shiftHue(color, (i * percentageToTickAmount.value) / tickAmount.value * (FINAL_CONFIG.value.style.chart.layout.wheel.ticks.gradient.shiftHueIntensity / 100)) : color
        });
    }
    return tickArray;
});

const arcTicks = computed(() => {
    return makeDonut({ series: ticks.value.map(t => {
        return {
            name: '',
            value: 1,
            color: t.color
        }
    })}, wheel.value.centerX, wheel.value.centerY, wheel.value.radius, wheel.value.radius, 1.99999, 2, 1, 360, 105.25, wheel.value.radius * (1 - FINAL_CONFIG.value.style.chart.layout.wheel.ticks.sizeRatio))
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2} = {}) {
    if (!wheelChart.value) return;
    const { width, height } = wheelChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: wheelChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const tickWidthStart = computed(() => {
    return FINAL_CONFIG.value.style.chart.layout.wheel.ticks.strokeWidth * 2;
});

const tickWidthMid = computed(() => {
    return FINAL_CONFIG.value.style.chart.layout.wheel.ticks.strokeWidth * 2 * 0.75;
});

const tickWidthEnd = computed(() => {
    return FINAL_CONFIG.value.style.chart.layout.wheel.ticks.strokeWidth;
});

const depth3d = computed(() => {
    return Math.max(1, Math.min(20, FINAL_CONFIG.value.style.chart.layout.wheel.ticks.depth3d));
});

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    backgroundColor: svgBg,
    stretchTitle: true
});

async function generateSvg({ isCb }) {
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl })

    } else {
        exportSvg();
    }
}

defineExpose({
    getImage,
    generatePdf,
    generateImage,
    generateSvg,
    toggleAnnotator,
    toggleFullscreen
});
</script>

<template>
    <div 
        class="vue-ui-wheel"
        :class="{ 'vue-data-ui-component': true, 'vue-ui-wheel-3d-wrap': FINAL_CONFIG.layout === '3d' }"
        ref="wheelChart"
        :id="uid"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:12px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'wheel-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'wheel-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    },
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasXls="false"
            :isFullscreen="isFullscreen"
            :position="FINAL_CONFIG.userOptions.position"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :chartElement="wheelChart"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @generateSvg="generateSvg"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen, 'vue-ui-wheel-3d-svg': FINAL_CONFIG.layout === '3d' }"
            data-cy="wheel-svg"
            :viewBox="FINAL_CONFIG.layout === '3d' && !FINAL_CONFIG.responsive
                ? `${vb3D?.x - 10 ?? 0} ${vb3D?.y ?? 0} ${vb3D?.w + 20 ?? Math.max(10, svg.width)} ${vb3D?.h ?? Math.max(10, svg.height)}`
                : `0 0 ${Math.max(10, svg.width)} ${Math.max(10, svg.height)}`"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion/>

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="FINAL_CONFIG.layout === '3d' && !FINAL_CONFIG.responsive ? vb3D?.x - 10 ?? 0 : 0"
                :y="FINAL_CONFIG.layout === '3d' && !FINAL_CONFIG.responsive ? vb3D?.y ?? 0 : 0"
                :width="FINAL_CONFIG.layout === '3d' && !FINAL_CONFIG.responsive ? (vb3D?.w + 20 ?? Math.max(10, svg.width)) : Math.max(10, svg.width)"
                :height="FINAL_CONFIG.layout === '3d' && !FINAL_CONFIG.responsive ? (vb3D?.h ?? Math.max(10, svg.height)) : Math.max(10, svg.height)"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <!-- HOLLOW 3D -->
            <path
                class="vue-ui-wheel-inner-circle"
                v-if="FINAL_CONFIG.layout === '3d' && inner3D"
                :d="inner3D.d"
                :stroke="FINAL_CONFIG.style.chart.layout.innerCircle.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.layout.innerCircle.strokeWidth"
                fill="none"
            />

            <!-- HOLLOW 2D -->
            <circle
                data-cy="inner-circle"
                class="vue-ui-wheel-inner-circle"
                v-else-if="FINAL_CONFIG.style.chart.layout.innerCircle.show"
                :cx="wheel.centerX"
                :cy="wheel.centerY"
                :r="Math.max(0, wheel.radius * FINAL_CONFIG.style.chart.layout.innerCircle.radiusRatio * 0.8)"
                :stroke="FINAL_CONFIG.style.chart.layout.innerCircle.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.layout.innerCircle.strokeWidth"
                fill="none"
            />

            <template v-if="FINAL_CONFIG.layout === '3d'">
                <g v-if="FINAL_CONFIG.style.chart.layout.wheel.ticks.type === 'classic'">
                    <g v-for="n in depth3d">
                        <line
                            v-for="t in ticks3D || []"
                            :key="t.i"
                            :x1="t.x1" :y1="t.y1 - n" :x2="t.x2" :y2="t.y2 - n"
                            :stroke="lightenHexColor(t.color, 0.25 * n / 5)"
                            :stroke-width="(FINAL_CONFIG.style.chart.layout.wheel.ticks.strokeWidth / 360) * Math.min(svg.width, svg.height)"
                            :stroke-linecap="FINAL_CONFIG.style.chart.layout.wheel.ticks.rounded ? 'round' : 'butt'"
                            stroke-linecap="round"
                            :class="{ 'vue-ui-wheel-tick' : true, 'vue-ui-tick-animated': FINAL_CONFIG.style.chart.animation.use && (t.i * percentageToTickAmount) <= activeValue }"
                        />
                    </g>
                    <line
                        v-for="t in ticks3D || []"
                        :key="t.i"
                        :x1="t.x1" :y1="t.y1 - depth3d" :x2="t.x2" :y2="t.y2 - depth3d"
                        :stroke="t.color"
                        :stroke-width="(FINAL_CONFIG.style.chart.layout.wheel.ticks.strokeWidth / 360) * Math.min(svg.width, svg.height)"
                        :stroke-linecap="FINAL_CONFIG.style.chart.layout.wheel.ticks.rounded ? 'round' : 'butt'"
                        stroke-linecap="round"
                        :class="{ 'vue-ui-wheel-tick' : true, 'vue-ui-tick-animated': FINAL_CONFIG.style.chart.animation.use && (t.i * percentageToTickAmount) <= activeValue }"
                    />
                </g>
                <g v-else>
                    <g v-for="n in depth3d">
                        <path
                            v-for="w in arcTicks3D(-n) || []"
                            :key="w.i"
                            :d="w.d"
                            :fill="FINAL_CONFIG.style.chart.layout.wheel.ticks.inactiveColor"
                            :stroke="FINAL_CONFIG.style.chart.layout.wheel.ticks.stroke"
                            :stroke-width="FINAL_CONFIG.style.chart.layout.wheel.ticks.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="vue-ui-wheel-tick"
                        />
                        <path
                            v-for="w in arcTicks3D(-n) || []"
                            :key="w.i"
                            :d="w.d"
                            :fill="lightenHexColor(w.fill, 0.5 * n / depth3d)"
                            :stroke="FINAL_CONFIG.style.chart.layout.wheel.ticks.stroke"
                            :stroke-width="FINAL_CONFIG.style.chart.layout.wheel.ticks.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :class="{ 'vue-ui-wheel-tick' : true, 'vue-ui-tick-animated-3d': FINAL_CONFIG.style.chart.animation.use && (w.i * percentageToTickAmount) <= activeValue }"
                        />
                    </g>
                    <g>
                        <path
                            v-for="w in arcTicks3D(-depth3d) || []"
                            :key="w.i"
                            :d="w.d"
                            :fill="w.fill"
                            :stroke="FINAL_CONFIG.style.chart.layout.wheel.ticks.stroke"
                            :stroke-width="FINAL_CONFIG.style.chart.layout.wheel.ticks.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :class="{ 'vue-ui-wheel-tick' : true, 'vue-ui-tick-animated-3d': FINAL_CONFIG.style.chart.animation.use && (w.i * percentageToTickAmount) <= activeValue }"
                        />
                    </g>
                </g>
            </template>

            <template v-else>
                <template v-if="FINAL_CONFIG.style.chart.layout.wheel.ticks.type === 'classic'">
                    <line
                        data-cy="wheel-tick"
                        v-for="(tick, i) in ticks"
                        :x1="tick.x1"
                        :x2="tick.x2"
                        :y1="tick.y1"
                        :y2="tick.y2"
                        :stroke="tick.color"
                        :stroke-width="(FINAL_CONFIG.style.chart.layout.wheel.ticks.strokeWidth / 360) * Math.min(svg.width, svg.height)"
                        :stroke-linecap="FINAL_CONFIG.style.chart.layout.wheel.ticks.rounded ? 'round' : 'butt'"
                        :class="{ 'vue-ui-wheel-tick' : true, 'vue-ui-tick-animated': FINAL_CONFIG.style.chart.animation.use && (i * percentageToTickAmount) <= activeValue }"
                    />
                </template>
                
                <template v-else>
                    <path 
                        v-for="(arc, i) in arcTicks"
                        :d="arc.arcSlice"
                        :fill="arc.color"
                        :class="{'vue-ui-wheel-tick' : true,  'vue-ui-tick-animated': FINAL_CONFIG.style.chart.animation.use && (i * percentageToTickAmount) <= activeValue }"
                        :stroke="FINAL_CONFIG.style.chart.layout.wheel.ticks.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.wheel.ticks.strokeWidth"
                    /> 
                </template>
            </template>
            
            <g v-if="FINAL_CONFIG.style.chart.layout.percentage.show">
                <rect 
                    v-if="loading"
                    :x="wheel.centerX - 40"
                    :y="wheel.centerY - baseLabelFontSize / 2"
                    :width="80"
                    :height="baseLabelFontSize"
                    fill="#6A6A6A80"
                    rx="3"
                />
                <text
                    v-else
                    data-cy="data-label"
                    :x="wheel.centerX + FINAL_CONFIG.style.chart.layout.percentage.offsetX"
                    :y="wheel.centerY + baseLabelFontSize / 3 + FINAL_CONFIG.style.chart.layout.percentage.offsetY"
                    :font-size="baseLabelFontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.wheel.ticks.gradient.show ? shiftHue(FINAL_CONFIG.style.chart.layout.wheel.ticks.activeColor, activeValue / 100 * (FINAL_CONFIG.style.chart.layout.wheel.ticks.gradient.shiftHueIntensity / 100)) : FINAL_CONFIG.style.chart.layout.wheel.ticks.activeColor"
                    text-anchor="middle"
                    :font-weight="FINAL_CONFIG.style.chart.layout.percentage.bold ? 'bold' : 'normal'"
                    style="font-variant-numeric:tabluar-nums"
                    :stroke="FINAL_CONFIG.style.chart.layout.percentage.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.percentage.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    paint-order="stroke fill"
                    :class="{ 'vue-ui-wheel-label': FINAL_CONFIG.layout === '3d' }"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.percentage.formatter,
                        checkNaN(activeValue),
                        dataLabel({
                            v: checkNaN(activeValue),
                            s: '%',
                            r: FINAL_CONFIG.style.chart.layout.percentage.rounding
                        }))
                    }}
                </text>
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-wheel *{
    transition: unset;
}
.vue-ui-wheel {
    user-select: none;
    position: relative;
}
.vue-ui-tick-animated {
    animation: animate-tick 0.3s ease-in;
    transform-origin: center;
}

@keyframes animate-tick {
    0% {
        stroke-width: v-bind(tickWidthStart);
    }
    80% {
        stroke-width: v-bind(tickWidthMid);
    }
    100% {
        stroke-width: v-bind(tickWidthEnd);
    }
}

.v-ui-wheel-3d-wrap {
    perspective: 900px;
}
.vue-ui-wheel-3d-svg {
    transform: rotateX(52deg) translateZ(0);
    transform-origin: center;
    will-change: transform;
}

.vue-ui-wheel-label {
    transform: scale(0.65, 1);
    transform-origin: center;
    font-variant: tabular-nums;
}
</style>
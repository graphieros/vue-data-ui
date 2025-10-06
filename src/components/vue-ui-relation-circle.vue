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
    adaptColorToBackground,
    applyDataLabel,
    convertCustomPalette,
    createUid, 
    dataLabel, 
    error, 
    getMissingDatasetAttributes,
    objectIsEmpty, 
    palette,
    themePalettes,
    translateSize,
    treeShake,
    XMLNS
} from "../lib.js";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading.js";
import { usePrinter } from "../usePrinter";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility.js";
import { useAutoSizeLabelsInsideViewbox } from "../useAutoSizeLabelsInsideViewbox.js";
import img from "../img.js";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_relation_circle: DEFAULT_CONFIG } = useConfig()

const props = defineProps({
    dataset: {
        type: Array,
        default() {
            return []
        }
    },
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
});

const uid = ref(createUid());
const step = ref(0);
const relationCircleChart = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        { id: 'A', label: '_', relations: ['B', 'C', 'D', 'E', 'F', 'G'] },
        { id: 'B', label: '_', relations: ['A'] },
        { id: 'C', label: '_', relations: ['A'] },
        { id: 'D', label: '_', relations: ['A'] },
        { id: 'E', label: '_', relations: ['A'] },
        { id: 'F', label: '_', relations: ['A'] },
        { id: 'G', label: '_', relations: ['A'] },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            customPalette: new Array(7).fill('#CACACA'),
            style: {
                backgroundColor: '#99999930',
                labels: { color: '#6A6A6A' },
                circle: { stroke: '#6A6A6A' },
                plot: { color: '#6A6A6A', useSerieColor: true },
                links: { maxWidth: 2 }
            }
        }
    })
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_relation_circle[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    size.value = FINAL_CONFIG.value.style.size;
    dataLabelSize.value = FINAL_CONFIG.value.style.weightLabels.size;
    plotRadius.value = FINAL_CONFIG.value.style.plot.radius;
    labelFontSize.value = FINAL_CONFIG.value.style.labels.fontSize;
    svg.value.height = FINAL_CONFIG.value.style.size;
    svg.value.width = FINAL_CONFIG.value.style.size;
    prepareChart();
    titleStep.value += 1;
}, { deep: true });

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
}, { deep: true })

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `relation_circle_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-relation-circle',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const circles = ref([]);
const relations = ref([]);
const selectedPlot = ref({});
const selectedRelations = ref([]);
const selectedRotation = ref(0);


const limitedDataset = computed(() => {
    return FINAL_DATASET.value
        .slice(0, FINAL_CONFIG.value.style.limit)
        .map(el => {
        const relations = Array.isArray(el.relations) ? el.relations : [];
        return {
            ...el,
            weights: Array.isArray(el.weights) ? el.weights : new Array(relations.length).fill(1),
            relations
        }
    });
});

watch(limitedDataset, () => {
    circles.value = [];
    relations.value = [];
    createPlots();
    createRelations();
});

const size = ref(FINAL_CONFIG.value.style.size);
const dataLabelSize = ref(FINAL_CONFIG.value.style.weightLabels.size);
const plotRadius = ref(FINAL_CONFIG.value.style.plot.radius);
const labelFontSize = ref(FINAL_CONFIG.value.style.labels.fontSize);

const svg = ref({
    height: FINAL_CONFIG.value.style.size,
    width: FINAL_CONFIG.value.style.size
});

const radius = computed({
    get() {
        return size.value * FINAL_CONFIG.value.style.circle.radiusProportion;
    },
    set(v) {
        return v;
    }
})

const isCurved = computed(() => {
    return FINAL_CONFIG.value.style.links.curved;
});

const animationSpeed = computed(() => {
    return `${FINAL_CONFIG.value.style.animation.speedMs}ms`;
});

const radiusDash = computed(() => {
    return radius.value * 2;
});

const radiusOffset = computed(() => {
    return radius.value * 4;
})

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    prepareChart();
    const chart = document.getElementById(`relation_circle_${uid.value}`);
    chart.addEventListener("click", clickOutside);
});

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiRelationCircle',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true;
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['id', 'label', 'relations', 'weights']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiRelationCircle',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value
                })
            });
        });
    }
    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: relationCircleChart.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                size.value = Math.min(width, height);
                svg.value.width = Math.max(0.1, width);
                svg.value.height = Math.max(0.1, height - 12);
                radius.value = size.value * FINAL_CONFIG.value.style.circle.radiusProportion;
                circles.value = [];
                relations.value = [];
                createPlots();
                createRelations();
                autoSizeLabels();

                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
                    dataLabelSize.value = translateSize({
                        relator: size.value,
                        adjuster: FINAL_CONFIG.value.style.size,
                        source: FINAL_CONFIG.value.style.weightLabels.size,
                        threshold: 6,
                        fallback: 6
                    });
        
                    plotRadius.value = translateSize({
                        relator: size.value,
                        adjuster: FINAL_CONFIG.value.style.size,
                        source: FINAL_CONFIG.value.style.plot.radius,
                        threshold: 1,
                        fallback: 1
                    });
        
                    labelFontSize.value = translateSize({
                        relator: size.value,
                        adjuster: FINAL_CONFIG.value.style.size,
                        source: FINAL_CONFIG.value.style.labels.fontSize,
                        threshold: 6,
                        fallback: 6
                    });
                } else {
                    dataLabelSize.value = FINAL_CONFIG.value.style.weightLabels.size;
                    plotRadius.value = FINAL_CONFIG.value.style.plot.radius;
                    labelFontSize.value = FINAL_CONFIG.value.style.labels.fontSize;
                }
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = relationCircleChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    } else {
        circles.value = [];
        relations.value = [];
        createPlots();
        createRelations();
    }
    autoSizeLabels();
}

onBeforeUnmount(() => {
    const chart = document.getElementById(`relation_circle_${uid.value}`);
    chart.removeEventListener("click", clickOutside);
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const { autoSizeLabels } = useAutoSizeLabelsInsideViewbox({
    svgRef,
    fontSize: FINAL_CONFIG.value.style.labels.fontSize,
    minFontSize: FINAL_CONFIG.value.style.labels.minFontSize,
    sizeRef: labelFontSize,
    labelClass: '.vue-ui-relation-circle-legend'
});

function clickOutside(e) {
    const target = e.target;
    if (target && Array.from(target.classList).includes("vue-ui-user-options")) {
        return;
    }
    if (target && Array.from(target.classList).includes("vue-ui-user-options-summary")) {
        return;
    }
    if (target && Array.from(target.classList).includes("vue-data-ui-button")) {
        return;
    }
    if(target && Array.from(target.classList).includes("vue-ui-relation-circle-legend")) {
        return;
    } else {
        selectedPlot.value = {};
        selectedRelations.value = [];
    }
}

function createPlots() {
    const angleGap = 6.28319 / limitedDataset.value.length;
    const regAngleGap = 360 / limitedDataset.value.length;
    let angle = 0;
    let regAngle = 0;
    limitedDataset.value.forEach((plot, i) => {
        const totalWeight = plot.weights.reduce((a, b) => a + b, 0);
        const x = radius.value * Math.cos(angle) + (svg.value.width / 2);
        const y = radius.value * Math.sin(angle) + svg.value.height / 2 + FINAL_CONFIG.value.style.circle.offsetY;
        circles.value.push({x,y, ...plot, color: plot.color ? plot.color : customPalette.value[i] ? customPalette.value[i] : palette[i], regAngle, totalWeight });
        angle += angleGap;
        regAngle += regAngleGap
    });
}

function getMiddlePoint(point1, point2) {
    const middleX = (point1.x + point2.x) / 2;
    const middleY = (point1.y + point2.y) / 2;
    return { x: middleX, y: middleY };
}

function createRelations() {
    relations.value = [];
    circles.value.forEach((plot) => {
        let rels = circles.value.filter(c => c.relations.includes(plot.id));

        rels.forEach((relation, i) => {
            const indexOfRelation = relation.relations.indexOf(plot.id)
            relations.value.push({
                weight: relation.weights[indexOfRelation] ? relation.weights[indexOfRelation] : 0,
                relationId: `${plot.id}_${relation.id}`,
                x1: plot.x,
                y1: plot.y,
                x2: relation.x,
                y2: relation.y,
                colorSource: plot.color,
                colorTarget: relation.color,
                midPointLine: getMiddlePoint({x: plot.x, y: plot.y}, {x: relation.x, y: relation.y}),
                midPointBezier: getBezierMidpoint({
                    x1: plot.x,
                    x2: relation.x,
                    y1: plot.y,
                    y2: relation.y
                }),
                ...plot
            });
        });
    });
}

function getBezierMidpoint(relation) {
    const P0 = { x: relation.x1, y: relation.y1 };
    const P3 = { x: relation.x2, y: relation.y2 };
    const P1 = { x: relation.x1, y: relation.y1 };
    const P2 = { 
        x: svg.value.width / 2, 
        y: svg.value.height / 2 + FINAL_CONFIG.value.style.circle.offsetY 
    };
    const t = 0.5;
    const x = Math.pow(1 - t, 3) * P0.x +
                3 * Math.pow(1 - t, 2) * t * P1.x +
                3 * (1 - t) * Math.pow(t, 2) * P2.x +
                Math.pow(t, 3) * P3.x;

    const y = Math.pow(1 - t, 3) * P0.y +
                3 * Math.pow(1 - t, 2) * t * P1.y +
                3 * (1 - t) * Math.pow(t, 2) * P2.y +
                Math.pow(t, 3) * P3.y;

    return { x, y };
}

const maxWeight = computed(() => {
    return Math.max(...relations.value.map(r => r.weight));
});

function getCircleOpacity(plot) {
    if(Object.hasOwn(selectedPlot.value, "x")) {
        if (selectedRelations.value.includes(plot.id)){
            return 'opacity:1';
        } else {
            return 'opacity:0.1';
        }
    } else {
        return 'opacity:1';
    }
}

function getLineColor(plot) {
    return plot.colorSource
}

function getLineOpacityAndWidth(plot) {
    if(Object.hasOwn(selectedPlot.value, 'x')) {
        if (selectedRelations.value.includes(plot.id) && plot.relationId === `${plot.id}_${selectedPlot.value.id}` || plot.relationId === `${selectedPlot.value.id}_${plot.id}`) {
            return `opacity:1;stroke-width:${calcLinkWidth(plot)}`;
        } else {
            return 'opacity: 0';
        }
    } else {
        return 'opacity: 1';
    }
}

function showLabel(plot) {
    if(Object.hasOwn(selectedPlot.value, 'x')) {
        if (selectedRelations.value.includes(plot.id) && plot.relationId === `${plot.id}_${selectedPlot.value.id}` || plot.relationId === `${selectedPlot.value.id}_${plot.id}`) {
            return true
        } else {
            return false
        }
    } else {
        return false
    }
}

function getTextAnchor(plot) {
    if (plot.regAngle > 90 && plot.regAngle < 270) {
        return "end";
    } else {
        return "start";
    }
}

function getTextX(plot) {
    if(plot.regAngle > 90 && plot.regAngle < 270){
        return plot.x - 5;
    }
    return plot.x + 5;
}

function getTextOpacity(plot){
    if (Object.hasOwn(selectedPlot.value, "x")){
        if(selectedPlot.value.id === plot.id || selectedRelations.value.includes(plot.id)){
            return 'opacity:1';
        }
        return "opacity:0.2";
    }
    return 'opacity:1';
}

function getTextRotation(plot) {
    if(plot.regAngle > 90 && plot.regAngle < 270){
        return `rotate(${plot.regAngle + 180},${plot.x},${plot.y})`;
    } else {
        return `rotate(${plot.regAngle},${plot.x},${plot.y})`;
    }
}

const hoverIndex = ref(null);

function onTrapEnter(plot, index) {
    hoverIndex.value = index;
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: plot, seriesIndex: index });
    }
}

function onTrapLeave(plot, index) {
    hoverIndex.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: plot, seriesIndex: index });
    }
}

function onTrapClick(plot, index) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: plot, seriesIndex: index});
    }

    selectedRotation.value = 360 - plot.regAngle;
    if (selectedPlot.value.id && plot.id === selectedPlot.value.id) {
        selectedPlot.value = {};
        selectedRelations.value = [];
    } else {
        selectedPlot.value = plot;
        selectedRelations.value = [...plot.relations]
    }
}

function calcLinkWidth(plot) {
    const w = plot.weight / maxWeight.value * FINAL_CONFIG.value.style.links.maxWidth;
    return Math.max(0.3, w);
}

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
    if (!relationCircleChart.value) return;
    const { width, height } = relationCircleChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: relationCircleChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.title.text,
        width,
        height,
        aspectRatio
    }
}

defineExpose({
    getImage,
    generatePdf,
    generateImage,
    toggleAnnotator,
    toggleFullscreen
})

</script>

<template>
    <div ref="relationCircleChart" class="vue-data-ui-component vue-ui-relation-circle" :style="`width:100%;background:${FINAL_CONFIG.style.backgroundColor};text-align:center;${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`" :id="`relation_circle_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)"> 
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.title.text" :style="`width:100%;background:transparent`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'relation-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'relation-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    },
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="false"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="relationCircleChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
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
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            class="relation-circle"
            width="100%"
            :style="`user-select:none; background:transparent`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            
            <circle
                data-cy="relation-circle" 
                :cx="(svg.width <= 0 ? 0.0001 : svg.width) / 2" 
                :cy="(svg.height <= 0 ? 0.0001 : svg.height) / 2 + FINAL_CONFIG.style.circle.offsetY" 
                :r="(radius <= 0 ? 0.0001 : radius)" 
                :stroke="FINAL_CONFIG.style.circle.stroke"
                :stroke-width="FINAL_CONFIG.style.circle.strokeWidth"
                fill="transparent"
                class="main-circle"
            />

            <g v-if="isCurved">
                <path v-for="(relation,i) in relations"
                    :key="`relation_${i}`" 
                    :style="getLineOpacityAndWidth(relation)"
                    :stroke="getLineColor(relation)" 
                    class="relation"
                    :d="`M${relation.x1},${relation.y1} C${relation.x1},${relation.y1} ${svg.width/2},${svg.height/2 + FINAL_CONFIG.style.circle.offsetY} ${relation.x2},${relation.y2}`"
                    fill="none"
                    :class="{'vue-ui-relation-circle-selected': selectedPlot.hasOwnProperty('id') && selectedRelations.includes(relation.id)}"
                    :stroke-width="calcLinkWidth(relation)"
                    stroke-linecap="round"
                />
                <g v-for="(relation, i) in relations" style="pointer-events: none;">
                    <slot 
                        name="dataLabel" 
                        v-bind="{ 
                            x: relation.midPointBezier.x, 
                            y: relation.midPointBezier.y, 
                            color: getLineColor(relation), 
                            weight: relation.weight, 
                            fontSize: dataLabelSize 
                        }" 
                        v-if="showLabel(relation)"
                    />
                    <circle
                        v-if="showLabel(relation) && !$slots.dataLabel"
                        :cx="relation.midPointBezier.x"
                        :cy="relation.midPointBezier.y"
                        :fill="getLineColor(relation)"
                        :r="dataLabelSize"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        stroke-width="1"
                    />
                    <text 
                        v-if="showLabel(relation) && !$slots.dataLabel"
                        :x="relation.midPointBezier.x"
                        :y="relation.midPointBezier.y + dataLabelSize / 3"
                        :fill="adaptColorToBackground(getLineColor(relation))"
                        text-anchor="middle"
                        :font-size="dataLabelSize"
                    >
                        {{ 
                            applyDataLabel(
                                FINAL_CONFIG.style.weightLabels.formatter,
                                relation.weight,
                                dataLabel({
                                    p: FINAL_CONFIG.style.weightLabels.prefix,
                                    v: relation.weight,
                                    s: FINAL_CONFIG.style.weightLabels.suffix,
                                    r: FINAL_CONFIG.style.weightLabels.rounding
                                }),
                                { ...relation }
                            )
                        }}
                    </text>
                </g>
            </g>
            <g v-else>
                <line v-for="(relation,i) in relations" 
                    :key="`relation_${i}`" 
                    :stroke="getLineColor(relation)" 
                    :stroke-width="calcLinkWidth(relation)"
                    :style="getLineOpacityAndWidth(relation)"
                    :x1="relation.x1" 
                    :x2="relation.x2" 
                    :y1="relation.y1" 
                    :y2="relation.y2"
                    :class="{'vue-ui-relation-circle-selected': selectedPlot.hasOwnProperty('id') && selectedRelations.includes(relation.id)}"
                    stroke-linecap="round"
                />
                <g v-for="(relation, i) in relations" style="pointer-events: none;">
                    <slot 
                        name="dataLabel" 
                        v-bind="{ 
                            x: relation.midPointLine.x, 
                            y: relation.midPointLine.y, 
                            color: getLineColor(relation), 
                            weight: relation.weight, 
                            fontSize: dataLabelSize 
                        }" 
                        v-if="showLabel(relation)"
                    />
                    <circle
                        v-if="showLabel(relation) && !$slots.dataLabel && FINAL_CONFIG.style.weightLabels.show"
                        :cx="relation.midPointLine.x"
                        :cy="relation.midPointLine.y"
                        :fill="getLineColor(relation)"
                        :r="dataLabelSize"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        stroke-width="1"
                    />
                    <text 
                        v-if="showLabel(relation) && !$slots.dataLabel && FINAL_CONFIG.style.weightLabels.show"
                        :x="relation.midPointLine.x"
                        :y="relation.midPointLine.y + dataLabelSize / 3"
                        :fill="adaptColorToBackground(getLineColor(relation))"
                        text-anchor="middle"
                        :font-size="dataLabelSize"
                    >
                        {{ 
                            applyDataLabel(
                                FINAL_CONFIG.style.weightLabels.formatter,
                                relation.weight,
                                dataLabel({
                                    p: FINAL_CONFIG.style.weightLabels.prefix,
                                    v: relation.weight,
                                    s: FINAL_CONFIG.style.weightLabels.suffix,
                                    r: FINAL_CONFIG.style.weightLabels.rounding
                                }),
                                { ...relation }
                            )
                        }}
                    </text>
                </g>
            </g>

            
                <text v-for="(plot,i) in circles"
                    :data-cy="`relation-text-${i}`"
                    :key="`plot_text_${i}`" 
                    :text-anchor="getTextAnchor(plot)"
                    :transform="getTextRotation(plot)"
                    :x="getTextX(plot)" 
                    :y="plot.y + 5"
                    class="vue-ui-relation-circle-legend" 
                    transform-origin="start"
                    :font-weight="selectedPlot.id === plot.id ? '900' : '400'"
                    :style="`font-family:${FINAL_CONFIG.style.fontFamily};${getTextOpacity(plot)}`"
                    :font-size="labelFontSize"
                    :fill="FINAL_CONFIG.style.labels.color"
                    :text-decoration="i === hoverIndex ? 'underline' : undefined"
                    @click="onTrapClick(plot, i)" 
                    @mouseenter="onTrapEnter(plot, i)"
                    @mouseleave="onTrapLeave(plot,i)"
                >
                    <template v-if="loading">
                        --------
                    </template>
                    <template v-else>
                        {{plot.label}} ({{ 
                            applyDataLabel(
                                FINAL_CONFIG.style.weightLabels.formatter,
                                plot.totalWeight,
                                dataLabel({
                                    p: FINAL_CONFIG.style.weightLabels.prefix,
                                    v: plot.totalWeight,
                                    s: FINAL_CONFIG.style.weightLabels.suffix,
                                    r: FINAL_CONFIG.style.weightLabels.rounding
                                }),
                                { ...plot }
                            )
                        }})
                    </template>
                </text>

            <circle v-for="(plot,i) in circles"
                :data-cy="`relation-plot-${i}`"
                :cx="plot.x" 
                :cy="plot.y" 
                :key="`plot_${i}`" 
                :style="`${getCircleOpacity(plot)}; transition: r 0.2s ease-in-out;`"
                class="vue-ui-relation-circle-plot" 
                :fill="FINAL_CONFIG.style.plot.useSerieColor ? plot.color : FINAL_CONFIG.style.plot.color" 
                :stroke="FINAL_CONFIG.style.backgroundColor"
                stroke-width="1"
                :r="plotRadius * (i === hoverIndex ? 2 : 1)" 
                @click="onTrapClick(plot, i)" 
                @mouseenter="onTrapEnter(plot, i)"
                @mouseleave="onTrapLeave(plot,i)"
            />
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

<style lang="scss" scoped>
@import "../vue-data-ui.css";

.vue-ui-relation-circle {
    position: relative;
}
svg.relation-circle{
    background: transparent;
    overflow: visible;
}
.vue-ui-relation-circle-plot, .vue-ui-relation-circle-legend {
    cursor: pointer;
}
path.vue-ui-relation-circle-selected,
line.vue-ui-relation-circle-selected {
    stroke-dasharray: v-bind(radiusDash);
    stroke-dashoffset: v-bind(radiusDash);
    animation: vue-ui-relation-circle-dash v-bind(animationSpeed) linear forwards;
}

@keyframes vue-ui-relation-circle-dash {
    to {
        stroke-dashoffset: v-bind(radiusOffset);
    }
}
</style>

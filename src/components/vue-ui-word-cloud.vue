<script setup>
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import themes from "../themes.json";
import Title from '../atoms/Title.vue';
import UserOptions from '../atoms/UserOptions.vue';
import { checkNaN, createUid, createWordCloudDatasetFromPlainText, isFunction } from '../lib';
import { debounce } from '../canvas-lib';
import {
    createCsvContent,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    palette,
    themePalettes,
    XMLNS
} from '../lib';
import { throttle } from '../canvas-lib';
import Accordion from "./vue-ui-accordion.vue";
import DataTable from '../atoms/DataTable.vue';
import { useNestedProp } from '../useNestedProp';
import { usePrinter } from '../usePrinter';
import { useResponsive } from '../useResponsive';
import { useConfig } from '../useConfig';
import PackageVersion from '../atoms/PackageVersion.vue';
import Tooltip from '../atoms/Tooltip.vue';
import PenAndPaper from '../atoms/PenAndPaper.vue';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import usePanZoom from '../usePanZoom';

const { vue_ui_word_cloud: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: [Array, String],
        default() {
            return []
        }
    },
});

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length
    },
    set(bool) {
        return bool
    }
});

const uid = ref(createUid());
const step = ref(0);
const wordCloudChart = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const isTooltip = ref(false);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const drawableDataset = ref(setupWordCloud());

function setupWordCloud() {
    return typeof props.dataset === 'string' ? createWordCloudDatasetFromPlainText(props.dataset) : props.dataset.map((dp, i) => {
        return {
            ...dp,
            value: checkNaN(dp.value)
        }
    })
}

watch(() => props.dataset, () => {
    drawableDataset.value = setupWordCloud();
    generateWordCloud();
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
                userConfig: themes.vue_ui_word_cloud[mergedConfig.theme] || props.config,
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
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    refreshSlicer();
    
    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

const svg = ref({
    width: FINAL_CONFIG.value.style.chart.width,
    height: FINAL_CONFIG.value.style.chart.height,
    maxFontSize: FINAL_CONFIG.value.style.chart.words.maxFontSize,
    minFontSize: FINAL_CONFIG.value.style.chart.words.minFontSize
});

const debounceUpdateCloud = debounce(() => {
    generateWordCloud()
}, 10);

const handleResize = throttle(() => {
    const { width, height } = useResponsive({
        chart: wordCloudChart.value,
        title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
        source: source.value
    });

    requestAnimationFrame(() => {
        svg.value.width = width;
        svg.value.height = height;
        nextTick(debounceUpdateCloud)
    });
});

const resizeObserver = ref(null);

onMounted(prepareChart);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiWordCloud',
            type: 'dataset'
        });
    } else {
        drawableDataset.value.forEach((w, i) => {
            getMissingDatasetAttributes({
                datasetObject: w,
                requiredAttributes: ['name', 'value']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiWordCloud',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                });
            });
        });
    }
    if (FINAL_CONFIG.value.responsive) {
        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(wordCloudChart.value.parentNode);
    }
}

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `wordCloud_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-word-cloud',
    options: FINAL_CONFIG.value.userOptions.print
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
});

function measureTextSize(text, fontSize, fontFamily = "Arial") {
    // This invisible canvas is necessary to calculate the exact dimensions of words before painting them on the svg. Cool trick
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px ${FINAL_CONFIG.value.style.chart.words.bold ? 'bold' : 'normal'} ${fontFamily}`;
    const metrics = context.measureText(text);
    return {
        width: metrics.width + FINAL_CONFIG.value.style.chart.words.proximity,
        height: fontSize,
    };
}

function positionWords(words, width, height) {
    const maskW = Math.round(width);
    const maskH = Math.round(height);
    const minFontSize = 1;
    const configMinFontSize = svg.value.minFontSize;
    const maxFontSize = svg.value.maxFontSize;
    const proximity = FINAL_CONFIG.value.style.chart.words.proximity || 0;
    const values = words.map(w => w.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);

    const mask = new Uint8Array(maskW * maskH);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    canvas.width = maskW;
    canvas.height = maskH;

    function getWordBitmap(word, fontSize, pad) {
        ctx.save();
        ctx.font = `${svg.value.style && svg.value.style.bold ? 'bold ' : ''}${fontSize}px Arial`;
        const metrics = ctx.measureText(word.name);
        const textW = Math.ceil(metrics.width) + 2 + (pad ? pad * 2 : 0);
        const textH = Math.ceil(fontSize) + 2 + (pad ? pad * 2 : 0);

        canvas.width = textW;
        canvas.height = textH;
        ctx.clearRect(0, 0, textW, textH);
        ctx.font = `${svg.value.style && svg.value.style.bold ? 'bold ' : ''}${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "black";
        ctx.fillText(word.name, textW / 2, textH / 2);
        const image = ctx.getImageData(0, 0, textW, textH);
        const data = image.data;
        const wordMask = [];
        for (let y = 0; y < textH; y += 1) {
            for (let x = 0; x < textW; x += 1) {
                if (data[(y * textW + x) * 4 + 3] > 1) wordMask.push([x, y]);
            }
        }
        ctx.restore();
        return { w: textW, h: textH, wordMask };
    }

    function canPlaceAt(mask, maskW, maskH, wx, wy, wordMask) {
        for (let i = 0; i < wordMask.length; i += 1) {
            const x = wx + wordMask[i][0];
            const y = wy + wordMask[i][1];
            if (x < 0 || y < 0 || x >= maskW || y >= maskH) return false;
            if (mask[y * maskW + x]) return false;
        }
        return true;
    }
    function markMask(mask, maskW, maskH, wx, wy, wordMask) {
        for (let i = 0; i < wordMask.length; i += 1) {
            const x = wx + wordMask[i][0];
            const y = wy + wordMask[i][1];
            if (x >= 0 && y >= 0 && x < maskW && y < maskH) mask[y * maskW + x] = 1;
        }
    }

    const spiralStep = 6, spiralRadiusStep = 2;
    const fallbackSpiralStep = 2, fallbackSpiralRadiusStep = 1;
    const cx = Math.floor(maskW / 2), cy = Math.floor(maskH / 2);

    const sorted = [...words].sort((a, b) => b.value - a.value);
    const positionedWords = [];

    function dilateWordMask(wordMask, w, h, dilation = 1) {
    const set = new Set(wordMask.map(([x, y]) => `${x},${y}`));
    const result = new Set(set);
    for (let [x, y] of wordMask) {
        for (let dx = -dilation; dx <= dilation; dx += 1) {
            for (let dy = -dilation; dy <= dilation; dy += 1) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                    result.add(`${nx},${ny}`);
                }
            }
        }
    }
    return Array.from(result).map(s => s.split(',').map(Number));
}

    for (const wordRaw of sorted) {
        let targetFontSize = configMinFontSize;
        if (maxValue !== minValue) {
            targetFontSize = (wordRaw.value - minValue) / (maxValue - minValue) * (maxFontSize - configMinFontSize) + configMinFontSize;
        }
        targetFontSize = Math.max(configMinFontSize, Math.min(maxFontSize, targetFontSize));

        let placed = false;
        let fontSize = targetFontSize;

        while (!placed && fontSize >= minFontSize) {
            let { w, h, wordMask } = getWordBitmap(wordRaw, fontSize, proximity);
            wordMask = dilateWordMask(wordMask, w, h, 2);
            let r = 0, attempts = 0;
            while (r < Math.max(maskW, maskH) && !placed && attempts < 10000) {
                for (let theta = 0; theta < 360; theta += spiralStep) {
                    attempts += 1;
                    const px = Math.round(cx + r * Math.cos(theta * Math.PI / 180) - w / 2);
                    const py = Math.round(cy + r * Math.sin(theta * Math.PI / 180) - h / 2);
                    if (px < 0 || py < 0 || px + w > maskW || py + h > maskH) continue;
                    if (canPlaceAt(mask, maskW, maskH, px, py, wordMask)) {
                        positionedWords.push({ ...wordRaw, x: px - maskW / 2, y: py - maskH / 2, fontSize, width: w, height: h, angle: 0 });
                        markMask(mask, maskW, maskH, px, py, wordMask);
                        placed = true;
                        break;
                    }
                }
                r += spiralRadiusStep;
            }
            if (!placed) fontSize -= 1;
        }

        if (!placed && fontSize < minFontSize) {
            fontSize = minFontSize;
            const { w, h, wordMask } = getWordBitmap(wordRaw, fontSize, proximity);
            let r = 0, attempts = 0, bestPlacement = null;
            while (r < Math.max(maskW, maskH) && !placed && attempts < 25000) {
                for (let theta = 0; theta < 360; theta += fallbackSpiralStep) {
                    attempts += 1;
                    const px = Math.round(cx + r * Math.cos(theta * Math.PI / 180) - w / 2);
                    const py = Math.round(cy + r * Math.sin(theta * Math.PI / 180) - h / 2);
                    if (px < 0 || py < 0 || px + w > maskW || py + h > maskH) continue;
                    if (canPlaceAt(mask, maskW, maskH, px, py, wordMask)) {
                        positionedWords.push({ ...wordRaw, x: px - maskW / 2, y: py - maskH / 2, fontSize, width: w, height: h, angle: 0 });
                        markMask(mask, maskW, maskH, px, py, wordMask);
                        placed = true;
                        break;
                    }
                }
                r += fallbackSpiralRadiusStep;
            }
        }
    }
    return positionedWords;
}

const positionedWords = ref([]);

watch(() => props.dataset, generateWordCloud, { immediate: true });

const wordMin = computed(() => {
    return Math.round(Math.min(...drawableDataset.value.map(w => w.value)));
})
const wordMax = computed(() => {
    return Math.round(Math.max(...drawableDataset.value.map(w => w.value)));
})

function generateWordCloud() {
    const values = [...drawableDataset.value].map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const scaledWords = [...drawableDataset.value].map((word, i) => {
        let fontSize = ((word.value - minValue) / (maxValue - minValue)) * (svg.value.maxFontSize - svg.value.minFontSize) + svg.value.minFontSize;
        fontSize = isNaN(fontSize) ? svg.value.minFontSize : fontSize;
        const size = measureTextSize(word.name, fontSize);
        return {
            ...word,
            id: createUid(),
            fontSize,
            width: size.width,
            height: size.height,
            color: FINAL_CONFIG.value.style.chart.words.usePalette ? (FINAL_CONFIG.value.customPalette[i] || FINAL_CONFIG.value.customPalette[i % FINAL_CONFIG.value.customPalette.length] || palette[i] || palette[i % palette.length]) : FINAL_CONFIG.value.style.chart.words.color
        };
    });

    positionedWords.value = positionWords(scaledWords, svg.value.width, svg.value.height).sort((a, b) => b.fontSize - a.fontSize);
}

const table = computed(() => {
    const head = positionedWords.value.map(w => {
        return {
            name: w.name,
            color: w.color
        }
    })
    const body = positionedWords.value.map(w => w.value);
    return { head, body };
})

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [[
                h.name
            ], [table.value.body[i]]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [[""], [FINAL_CONFIG.value.table.columnNames.value],]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-word-cloud" })
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    const body = table.value.head.map((h, i) => {
        const label = dataLabel({ p: FINAL_CONFIG.value.table.td.prefix, v: table.value.body[i], s: FINAL_CONFIG.value.table.td.suffix, r: FINAL_CONFIG.value.table.td.roundingValue });
        return [
            {
                color: h.color,
                name: h.name
            },
            label
        ]
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    }

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ]

    return {
        colNames,
        head,
        body,
        config
    }
})

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function getData() {
    return positionedWords.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const active = computed(() => !isAnnotator.value && FINAL_CONFIG.value.style.chart.zoom.show)

const { viewBox } = usePanZoom(svgRef, {
    x: 0,
    y: 0,
    width: svg.value.width <= 0 ? 10 : svg.value.width,
    height: svg.value.height <= 0 ? 10 : svg.value.height,
}, 1, active)

defineExpose({
    getData,
    generateCsv,
    generatePdf,
    generateImage,
    toggleTable,
    toggleTooltip,
    toggleAnnotator
});

const selectedWord = ref(null);
const useCustomFormat = ref(false);
const tooltipContent = ref('');
const dataTooltipSlot = ref(null);

function useTooltip(word) {
    if (!mutableConfig.value.showTooltip) return;
    selectedWord.value = word.id;
    dataTooltipSlot.value = { datapoint: word, config: FINAL_CONFIG.value };
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                datapoint: word,
                config: FINAL_CONFIG.value
            });
            if (typeof customFormatString === 'string') {
                tooltipContent.value = customFormatString;
                useCustomFormat.value = true;
            }
        } catch (err) {
            console.warn('Custom format cannot be applied.');
            useCustomFormat.value = false;
        }
    }

    if (!useCustomFormat.value) {
        let html = `<svg viewBox="0 0 10 10" height="${FINAL_CONFIG.value.style.chart.tooltip.fontSize}"><circle cx="5" cy="5" r="5" fill="${word.color}"/></svg><span>${word.name}:</span><b>${(word.value || 0).toFixed(FINAL_CONFIG.value.style.chart.tooltip.roundingValue)}</b>`;

        tooltipContent.value = `<div dir="auto" style="display:flex; gap:4px; align-items:center; jsutify-content:center;">${html}</div>`;
    }

    isTooltip.value = true;
}

</script>

<template>
    <div class="vue-ui-word-cloud" ref="wordCloudChart" :id="`wordCloud_${uid}`"
        :style="`width: 100%; font-family:${FINAL_CONFIG.style.fontFamily};background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title
            :key="`title_${titleStep}`" 
            :config="{
                title: {
                    ...FINAL_CONFIG.style.chart.title
                },
                subtitle: {
                    ...FINAL_CONFIG.style.chart.title.subtitle
                }
            }" />
        </div>

        <UserOptions 
            ref="details" 
            :key="`user_option_${step}`" 
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" 
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" 
            :isImaging="isImaging" 
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img" 
            :hasTable="FINAL_CONFIG.userOptions.buttons.table" 
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="wordCloudChart" 
            :position="FINAL_CONFIG.userOptions.position"
            :hasTooltip="FINAL_CONFIG.style.chart.tooltip.show && FINAL_CONFIG.userOptions.buttons.tooltip"
            :isTooltip="mutableConfig.showTooltip"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf" 
            @generateCsv="generateCsv" 
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
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
            <template #optionCsv v-if="$slots.optionCsv">
                <slot name="optionCsv" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
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
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen  }" 
            v-if="isDataset"
            :xmlns="XMLNS"
            :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
            :style="`overflow:hidden;background:transparent;`"
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
            
            <g
                :transform="`translate(${(svg.width <= 0 ? 10 : svg.width) / 2}, ${(svg.height <= 0 ? 10 : svg.height) / 2})`">
                <g v-for="(word, index) in positionedWords">
                    <text
                        data-cy="datapoint-word"
                        :fill="word.color" 
                        :font-weight="FINAL_CONFIG.style.chart.words.bold ? 'bold' : 'normal'" :key="index"
                        :x="word.x" :y="word.y" :font-size="word.fontSize"
                        :transform="`translate(${word.width / 2}, ${word.height / 2})`"
                        :class="{'animated': FINAL_CONFIG.useCssAnimation, 'word-selected': selectedWord && selectedWord === word.id && mutableConfig.showTooltip, 'word-not-selected': selectedWord && selectedWord !== word.id && mutableConfig.showTooltip }"
                        text-anchor="middle"
                        dominant-baseline="central"
                        @mouseover="useTooltip(word)"
                        @mouseleave="selectedWord = null; isTooltip = false"
                        :style="`animation-delay:${index * FINAL_CONFIG.animationDelayMs}ms !important;`"
                    >
                        {{ word.name }}
                    </text>
                </g>
            </g>
            <slot name="svg" :svg="{ height: svg.height, width: svg.width }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="wordCloudChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Accordion hideDetails v-if="isDataset" :config="{
        open: mutableConfig.showTable,
        maxHeight: 10000,
        body: {
            backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
            color: FINAL_CONFIG.style.chart.color
        },
        head: {
            backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
            color: FINAL_CONFIG.style.chart.color
        }
    }">
            <template #content>
                <DataTable 
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames" 
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false">
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-word-cloud * {
    transition: unset;
}

.vue-ui-word-cloud {
    position: relative;
}

text.animated {
    opacity:0;
    user-select: none;
    animation: word-opacity 0.2s ease-in forwards;
    transform-origin: center;
}

@keyframes word-opacity {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.animated.word-selected {
    opacity: 1;
}
.word-not-selected {
    opacity: 0.5 !important;
}


</style>
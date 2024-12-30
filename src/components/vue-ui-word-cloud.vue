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
import MonoSlicer from '../atoms/MonoSlicer.vue';
import { useNestedProp } from '../useNestedProp';
import { usePrinter } from '../usePrinter';
import { useResponsive } from '../useResponsive';
import { useConfig } from '../useConfig';
import PackageVersion from '../atoms/PackageVersion.vue';
import Tooltip from '../atoms/Tooltip.vue';
import PenAndPaper from '../atoms/PenAndPaper.vue';
import { useUserOptionState } from '../useUserOptionState';

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
})

const drawableDataset = ref(typeof props.dataset === 'string' ? createWordCloudDatasetFromPlainText(props.dataset) : props.dataset.map(dp => {
    return {
        ...dp,
        value: checkNaN(dp.value)
    }
}));

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

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });

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
    userOptionsVisible.value = !FINAL_CONFIG.value.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    refreshSlicer();
}, { deep: true });

const chartSlicer = ref(null);
const slicer = ref(0);

const svg = ref({
    width: FINAL_CONFIG.value.style.chart.width,
    height: FINAL_CONFIG.value.style.chart.height,
    maxFontSize: FINAL_CONFIG.value.style.chart.words.maxFontSize,
    minFontSize: FINAL_CONFIG.value.style.chart.words.minFontSize
});

const handleResize = throttle(() => {
    const { width, height } = useResponsive({
        chart: wordCloudChart.value,
        title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
        slicer: FINAL_CONFIG.value.style.chart.zoom.show && chartSlicer.value,
        source: source.value
    });
    svg.value.width = width;
    svg.value.height = height;
    nextTick(generateWordCloud)
});

watch(() => slicer.value, () => {
    debounceUpdateCloud()
});

const debounceUpdateCloud = debounce(() => {
    generateWordCloud()
}, 10);

function refreshSlicer() {
    slicer.value = wordMin.value;
}

const resizeObserver = ref(null);

onMounted(() => {
    prepareChart();
    refreshSlicer();
});

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
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-word-cloud'
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

function isOverlapping(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function positionWords(words, width, height) {
    const positionedWords = [];
    const bounds = { x: -width / 2, y: -height / 2, width, height };
    const centerX = 0;
    const centerY = 0;

    words.forEach(word => {
        let isPlaced = false;
        for (let i = 0; i < Math.max(width, height) / 2 && !isPlaced; i += FINAL_CONFIG.value.style.chart.words.packingWeight) {
            for (let theta = 0; theta < 360 && !isPlaced; theta += FINAL_CONFIG.value.style.chart.words.packingWeight) {
                const rad = (theta * Math.PI) / 180;
                const x = centerX + i * Math.cos(rad) - word.width / 2;
                const y = centerY + i * Math.sin(rad) - word.height / 2;

                const testPosition = { ...word, x, y };

                const isInsideBounds =
                    testPosition.x >= bounds.x &&
                    testPosition.y >= bounds.y &&
                    testPosition.x + testPosition.width <= bounds.x + bounds.width &&
                    testPosition.y + testPosition.height <= bounds.y + bounds.height;

                const isOverlap = positionedWords.some(w => isOverlapping(testPosition, w));

                if (isInsideBounds && !isOverlap) {
                    positionedWords.push(testPosition);
                    isPlaced = true;
                }
            }
        }
    });

    return positionedWords;
}

const positionedWords = ref([]);

watch(() => props.dataset, generateWordCloud, { immediate: true });

const wordMin = computed(() => {
    return Math.min(...drawableDataset.value.map(w => w.value))
})
const wordMax = computed(() => {
    return Math.max(...drawableDataset.value.map(w => w.value))
})

function generateWordCloud() {
    const values = [...drawableDataset.value].filter(w => w.value >= slicer.value).map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const scaledWords = [...drawableDataset.value].filter(w => w.value >= slicer.value).map((word, i) => {
        const fontSize = ((word.value - minValue) / (maxValue - minValue)) * (svg.value.maxFontSize - svg.value.minFontSize) + svg.value.minFontSize;
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
            :parent="wordCloudChart"
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

        <svg :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen  }" v-if="isDataset"
            :xmlns="XMLNS" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            :style="`overflow:visible;background:transparent;`"
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

        <div ref="chartSlicer" :style="`width:100%;background:transparent`" data-html2canvas-ignore>
            <MonoSlicer
                v-if="FINAL_CONFIG.style.chart.zoom.show"
                v-model:value="slicer"
                :min="wordMin"
                :max="wordMax"
                :textColor="FINAL_CONFIG.style.chart.color"
                :inputColor="FINAL_CONFIG.style.chart.zoom.color"
                :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
                :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                :background="FINAL_CONFIG.style.chart.zoom.color"
                :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                :source="FINAL_CONFIG.style.chart.width"
                @reset="refreshSlicer"
            >
                <template #reset-action="{ reset }">
                    <slot name="reset-action" v-bind="{ reset }"/>
                </template>
            </MonoSlicer>
        </div>

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
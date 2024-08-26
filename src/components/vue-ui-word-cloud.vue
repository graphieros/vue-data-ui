<script setup>
import { ref, watch, computed, nextTick, onMounted, onBeforeUnmount } from 'vue';
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import Title from '../atoms/Title.vue';
import UserOptions from '../atoms/UserOptions.vue';
import { createUid, createWordCloudDatasetFromPlainText, translateSize } from '../lib';
import {
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    dataLabel,
    createCsvContent,
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

const drawableDataset = ref(typeof props.dataset === 'string' ? createWordCloudDatasetFromPlainText(props.dataset) : props.dataset);

const uid = ref(createUid());
const step = ref(0);
const wordCloudChart = ref(null);
const chartTitle = ref(null);

const defaultConfig = ref(mainConfig.vue_ui_word_cloud);

const wordCloudConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
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
});

const svg = ref({
    width: wordCloudConfig.value.style.chart.width,
    height: wordCloudConfig.value.style.chart.height,
    maxFontSize: wordCloudConfig.value.style.chart.words.maxFontSize,
    minFontSize: wordCloudConfig.value.style.chart.words.minFontSize
})

const resizeObserver = ref(null);

onMounted(() => {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiWordCloud',
            type: 'dataset'
        })
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
                })
            })
        })   
    }
    if (wordCloudConfig.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: wordCloudChart.value,
                title: wordCloudConfig.value.style.chart.title.text ? chartTitle.value : null,
            });
            svg.value.width = width;
            svg.value.height = height;
            nextTick(generateWordCloud)
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(wordCloudChart.value.parentNode);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `wordCloud_${uid.value}`,
    fileName: wordCloudConfig.value.style.chart.title.text || 'vue-ui-word-cloud'
});

const mutableConfig = ref({
    showTable: wordCloudConfig.value.table.show,
});

function measureTextSize(text, fontSize, fontFamily = "Arial") {
    // This invisible canvas is necessary to calculate the exact dimensions of words before painting them on the svg. Cool trick
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px ${wordCloudConfig.value.style.chart.words.bold ? 'bold' : 'normal'} ${fontFamily}`;
    const metrics = context.measureText(text);
    return {
        width: metrics.width + wordCloudConfig.value.style.chart.words.proximity,
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
        for (let i = 0; i < Math.max(width, height) / 2 && !isPlaced; i += wordCloudConfig.value.style.chart.words.packingWeight) {
            for (let theta = 0; theta < 360 && !isPlaced; theta += wordCloudConfig.value.style.chart.words.packingWeight) {
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

function generateWordCloud() {
    const values = drawableDataset.value.map(d => d.value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    const scaledWords = drawableDataset.value.map((word, i) => {
        const fontSize = ((word.value - minValue) / (maxValue - minValue)) * (svg.value.maxFontSize - svg.value.minFontSize) + svg.value.minFontSize;
        const size = measureTextSize(word.name, fontSize);
        return {
            ...word,
            id: createUid(),
            fontSize,
            width: size.width,
            height: size.height,
            color: wordCloudConfig.value.style.chart.words.usePalette ? (wordCloudConfig.value.customPalette[i] || wordCloudConfig.value.customPalette[i % wordCloudConfig.value.customPalette.length] || palette[i] || palette[i % palette.length]) : wordCloudConfig.value.style.chart.words.color
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
        const tableXls = [[wordCloudConfig.value.style.chart.title.text], [wordCloudConfig.value.style.chart.title.subtitle.text], [[""], [wordCloudConfig.value.table.columnNames.value],]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: wordCloudConfig.value.style.chart.title.text || "vue-ui-word-cloud" })
    });
}

const dataTable = computed(() => {
    const head = [
        wordCloudConfig.value.table.columnNames.series,
        wordCloudConfig.value.table.columnNames.value,
    ];

    const body = table.value.head.map((h, i) => {
        const label = dataLabel({ p: wordCloudConfig.value.table.td.prefix, v: table.value.body[i], s: wordCloudConfig.value.table.td.suffix, r: wordCloudConfig.value.table.td.roundingValue });
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
            backgroundColor: wordCloudConfig.value.table.th.backgroundColor,
            color: wordCloudConfig.value.table.th.color,
            outline: wordCloudConfig.value.table.th.outline
        },
        td: {
            backgroundColor: wordCloudConfig.value.table.td.backgroundColor,
            color: wordCloudConfig.value.table.td.color,
            outline: wordCloudConfig.value.table.td.outline
        },
        breakpoint: wordCloudConfig.value.table.responsiveBreakpoint
    }

    const colNames = [
        wordCloudConfig.value.table.columnNames.series,
        wordCloudConfig.value.table.columnNames.value,
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

defineExpose({
    getData,
    generateCsv,
    generatePdf,
    generateImage,
    toggleTable
});

</script>

<template>
    <div class="vue-ui-word-cloud" ref="wordCloudChart" :id="`wordCloud_${uid}`"
        :style="`width: 100%; font-family:${wordCloudConfig.style.fontFamily};background:${wordCloudConfig.style.chart.backgroundColor};${wordCloudConfig.responsive ? 'height:100%' : ''}`">
        <div ref="chartTitle" v-if="wordCloudConfig.style.chart.title.text" :style="`width:100%;background:${wordCloudConfig.style.chart.backgroundColor};padding-bottom:24px`">
            <Title :config="{
                title: {
                    text: wordCloudConfig.style.chart.title.text,
                    color: wordCloudConfig.style.chart.title.color,
                    fontSize: wordCloudConfig.style.chart.title.fontSize,
                    bold: wordCloudConfig.style.chart.title.bold
                },
                subtitle: {
                    text: wordCloudConfig.style.chart.title.subtitle.text,
                    color: wordCloudConfig.style.chart.title.subtitle.color,
                    fontSize: wordCloudConfig.style.chart.title.subtitle.fontSize,
                    bold: wordCloudConfig.style.chart.title.subtitle.bold
                }
            }" />
        </div>

        <UserOptions 
            ref="details" 
            :key="`user_option_${step}`" 
            v-if="wordCloudConfig.userOptions.show && isDataset"
            :backgroundColor="wordCloudConfig.style.chart.backgroundColor" 
            :color="wordCloudConfig.style.chart.color"
            :isPrinting="isPrinting" 
            :isImaging="isImaging" 
            :uid="uid"
            :hasPdf="wordCloudConfig.userOptions.buttons.pdf"
            :hasXls="wordCloudConfig.userOptions.buttons.csv"
            :hasImg="wordCloudConfig.userOptions.buttons.img" 
            :hasTable="wordCloudConfig.userOptions.buttons.table" 
            :hasFullscreen="wordCloudConfig.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...wordCloudConfig.userOptions.buttonTitles }"
            :chartElement="wordCloudChart" 
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf" 
            @generateCsv="generateCsv" 
            @generateImage="generateImage"
            @toggleTable="toggleTable" 
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
        </UserOptions>

        <svg :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen  }" v-if="isDataset"
            :xmlns="XMLNS" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            :style="`overflow:visible;background:${wordCloudConfig.style.chart.backgroundColor};`">
            <g
                :transform="`translate(${(svg.width <= 0 ? 10 : svg.width) / 2}, ${(svg.height <= 0 ? 10 : svg.height) / 2})`">
                <g v-for="(word, index) in positionedWords">
                    <text 
                        :fill="word.color" 
                        :font-weight="wordCloudConfig.style.chart.words.bold ? 'bold' : 'normal'" :key="index"
                        :x="word.x" :y="word.y" :font-size="word.fontSize"
                        :transform="`translate(${word.width / 2}, ${word.height / 2})`"
                        :style="`animation-delay:${index * wordCloudConfig.animationDelayMs}ms !important`"
                        :class="{'animated': wordCloudConfig.useCssAnimation}"
                        text-anchor="middle"
                        dominant-baseline="middle"
                    >
                        {{ word.name }}
                    </text>
                </g>
            </g>
            <slot name="svg" :svg="{ height: svg.height, width: svg.width }"/>
        </svg>

        <Accordion hideDetails v-if="isDataset" :config="{
        open: mutableConfig.showTable,
        maxHeight: 10000,
        body: {
            backgroundColor: wordCloudConfig.style.chart.backgroundColor,
            color: wordCloudConfig.style.chart.color
        },
        head: {
            backgroundColor: wordCloudConfig.style.chart.backgroundColor,
            color: wordCloudConfig.style.chart.color
        }
    }">
            <template #content>
                <DataTable :colNames="dataTable.colNames" :head="dataTable.head" :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${wordCloudConfig.style.chart.title.text}${wordCloudConfig.style.chart.title.subtitle.text ? ` : ${wordCloudConfig.style.chart.title.subtitle.text}` : ''}`"
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
    animation: word-opacity 0.3s ease-in forwards;
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
</style>
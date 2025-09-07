<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onBeforeUnmount, 
    onMounted, 
    ref, 
    shallowRef, 
    toRefs,
    watch, 
    watchEffect, 
} from "vue";
import {
    applyDataLabel,
    checkNaN,
    createCsvContent, 
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    isFunction,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    treeShake,
    XMLNS
} from '../lib';
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useNestedProp } from "../useNestedProp";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { useTimeLabelCollision } from "../useTimeLabelCollider";
import img from "../img";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_age_pyramid: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Array,
        default() {
            return []
        }
    },
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length
});

const uid = ref(createUid());
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedIndex = ref(null);
const step = ref(0);
const agePyramid = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const xAxisLabels = ref(null);
const tableUnit = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        ['_', 9, 2, 2],
        ['_', 8, 3, 3],
        ['_', 7, 5, 5],
        ['_', 6, 8, 8],
        ['_', 5, 13, 13],
        ['_', 4, 21, 21],
        ['_', 3, 34, 34],
        ['_', 2, 55, 55],
        ['_', 1, 89, 89],
        ['_', 0, 144, 144],
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false, },
            table: { show: false },
            translations: {
                male: '',
                female: ''
            },
            style: {
                backgroundColor: '#99999930',
                layout: {
                    bars: {
                        left: { color: '#CACACA' },
                        right: { color: '#999999' },
                    },
                    dataLabels: {
                        xAxis: { 
                            fontSize: 0,
                            scale: 1000,
                            translation: ''
                        },
                        yAxis: {
                            show: false
                        }
                    },
                    grid: {
                        stroke: '#6A6A6A'
                    }
                }
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
                userConfig: themes.vue_ui_age_pyramid[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.tooltip.show;
}, { deep: true });

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
}, { deep: true })

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiAgePyramid',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true;
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: agePyramid.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = agePyramid.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-age-pyramid_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-age-pyramid',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.tooltip.show
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.tooltip.show
    }
}, { immediate: true });

const svg = ref({
    height: FINAL_CONFIG.value.style.height,
    width: FINAL_CONFIG.value.style.width
});

const WIDTH = computed(() => svg.value.width);
const HEIGHT = computed(() => svg.value.height);

const xAxisLabelsHeight = ref(0);

const updateHeight = throttle((h) => {
    xAxisLabelsHeight.value = h;
}, 100);

watchEffect((onInvalidate) => {
    const el = xAxisLabels.value;
    if (!el) return;

    const observer = new ResizeObserver(entries => {
        updateHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    onInvalidate(() => observer.disconnect());
});

onBeforeUnmount(() => {
    xAxisLabelsHeight.value = 0;
})

const drawingArea = computed(() => {
    const width = svg.value.width - FINAL_CONFIG.value.style.layout.padding.right - FINAL_CONFIG.value.style.layout.padding.left;
    const left = FINAL_CONFIG.value.style.layout.padding.left;
    const right = svg.value.width - FINAL_CONFIG.value.style.layout.padding.right;

    return {
        top: FINAL_CONFIG.value.style.layout.padding.top + FINAL_CONFIG.value.style.layout.dataLabels.sideTitles.fontSize + FINAL_CONFIG.value.style.layout.dataLabels.sideTitles.offsetY + 12,
        left,
        right,
        bottom: svg.value.height - FINAL_CONFIG.value.style.layout.padding.bottom - xAxisLabelsHeight.value,
        width,
        height: svg.value.height - FINAL_CONFIG.value.style.layout.padding.top - FINAL_CONFIG.value.style.layout.padding.bottom - xAxisLabelsHeight.value - FINAL_CONFIG.value.style.layout.dataLabels.sideTitles.fontSize - FINAL_CONFIG.value.style.layout.dataLabels.sideTitles.offsetY - 12,
        centerX: FINAL_CONFIG.value.style.layout.padding.left + width / 2,
        leftChart: {
            width: (width / 2) - FINAL_CONFIG.value.style.layout.centerSlit.width,
            right: left + (width / 2) - FINAL_CONFIG.value.style.layout.centerSlit.width
        },
        rightChart: {
            width: (width / 2) - FINAL_CONFIG.value.style.layout.centerSlit.width,
            left: left + (width / 2) + FINAL_CONFIG.value.style.layout.centerSlit.width
        }
    }
});

const yLabels =  computed(() => {
    return FINAL_DATASET.value.map(ds => {
        if (FINAL_CONFIG.value.style.layout.dataLabels.yAxis.display === 'age') {
            return ds[1];
        } else {
            return ds[0];
        }
    });
});

const xLabels = computed(() => {
    const step = closestDecimal(max.value / 5);
    const stepsRight = [];
    const stepsLeft = [];
    for (let i = 0; i <= 5; i += 1) {
        const valueRight = step * i;
        const valueLeft = step * (i - 5);
        stepsRight.push({
            value: valueRight,
            x: drawingArea.value.left + drawingArea.value.width / 2 + FINAL_CONFIG.value.style.layout.centerSlit.width + ((valueRight / max.value * drawingArea.value.leftChart.width))
        });
        stepsLeft.push({
            value: Math.abs(valueLeft),
            x: drawingArea.value.left + drawingArea.value.width / 2 + ((valueLeft / max.value * drawingArea.value.leftChart.width)) - FINAL_CONFIG.value.style.layout.centerSlit.width
        });
    }
    return {
        right: stepsRight,
        left: stepsLeft
    }
});

function closestDecimal(number) {
    if (number === 0) return 0;

    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(number)));
    const powerOf10 = 10 ** orderOfMagnitude;

    let roundedValue;
    if (number < 0) {
        roundedValue = Math.round(number / powerOf10) * powerOf10;
    } else {
        roundedValue = Math.round(number / powerOf10) * powerOf10;
    }
    return roundedValue;
}

const max = computed(() => {
    return Math.max(...FINAL_DATASET.value.flatMap(ds => {
        return ds.slice(-2).map(v => checkNaN(v));
    }));
});

const len = computed(() => FINAL_DATASET.value.length);

const mutableDataset = computed(() => {
    return FINAL_DATASET.value.map(ds => {
        return {
            segment: ds[0],
            age: ds[1],
            left: {
                value: ds[2],
                proportionToMax: ds[2] / max.value,
            },
            right: {
                value: ds[3],
                proportionToMax: ds[3] / max.value,
            },
        }
    })
});

const drawableDataset = computed(() => {
    return mutableDataset.value.map((ds, i) => {
        const y = drawingArea.value.top + (drawingArea.value.height / len.value) * i;
        const height = (drawingArea.value.height / len.value) - FINAL_CONFIG.value.style.layout.bars.gap;
        return {
            segment: ds.segment,
            age: ds.age,
            left: {
                ...ds.left,
                y,
                color: FINAL_CONFIG.value.style.layout.bars.left.color,
                x: (drawingArea.value.leftChart.right - (ds.left.proportionToMax * drawingArea.value.leftChart.width)),
                width: checkNaN(ds.left.proportionToMax * drawingArea.value.leftChart.width),
                height
            },
            right: {
                ...ds.right,
                y,
                color: FINAL_CONFIG.value.style.layout.bars.right.color,
                x: drawingArea.value.rightChart.left,
                width: checkNaN(ds.right.proportionToMax * drawingArea.value.rightChart.width),
                height
            }
        }
    })
});

const dataTooltipSlot = ref(null);

function convertDatapoint(dp) {
    const [ segment, index, left, right ] = dp;
    return { segment, index, left, right };
}

function selectDatapoint(index, datapoint) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: convertDatapoint(datapoint), seriesIndex: index})
    }
}

function onTrapLeave(index, datapoint) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: convertDatapoint(datapoint), seriesIndex: index });
    }
    selectedIndex.value = null;
    isTooltip.value = false;
}

function useTooltip(index, datapoint) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: convertDatapoint(datapoint), seriesIndex: index });
    }

    selectedIndex.value = index;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex: index,
        series: drawableDataset.value,
        config: FINAL_CONFIG.value
    }

    const customFormat = FINAL_CONFIG.value.style.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: index,
            datapoint: {
                segment: datapoint[0],
                index: datapoint[1],
                left: datapoint[2],
                right: datapoint[3]
            },
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: index,
            datapoint: {
                segment: datapoint[0],
                index: datapoint[1],
                left: datapoint[2],
                right: datapoint[3]
            },
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        let html = "";
    
        const selectedSet = drawableDataset.value[index];
        html += `<div><b>${selectedSet.segment}</b></div>`;
        html += `<div>${FINAL_CONFIG.value.translations.age}: ${applyDataLabel(
            FINAL_CONFIG.value.style.layout.dataLabels.yAxis.formatter,
            checkNaN(selectedSet.age),
            dataLabel({ v: checkNaN(selectedSet.age) }),
            { datapoint, seriesIndex: index}
        )}</div>`
        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor}">`;
        html += `<div style="display:flex; flex-direction:row;gap:12px">`;
        html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${FINAL_CONFIG.value.style.layout.bars.gradient.underlayer}"/><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${FINAL_CONFIG.value.style.layout.bars.gradient.show ? `url(#age_pyramid_left_${uid.value})` : FINAL_CONFIG.value.style.layout.bars.left.color}"/></svg><div>${FINAL_CONFIG.value.translations.female}</div><div><b>${applyDataLabel(
            FINAL_CONFIG.value.style.layout.dataLabels.xAxis.formatter,
            checkNaN(selectedSet.left.value),
            dataLabel({ v: checkNaN(selectedSet.left.value) }),
            { datapoint, seriesIndex: index }
        )}</b></div></div>`;
        html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${FINAL_CONFIG.value.style.layout.bars.gradient.underlayer}"/><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${FINAL_CONFIG.value.style.layout.bars.gradient.show ? `url(#age_pyramid_right_${uid.value})` : FINAL_CONFIG.value.style.layout.bars.right.color}"/></svg><div>${FINAL_CONFIG.value.translations.male}</div><div><b>${applyDataLabel(
            FINAL_CONFIG.value.style.layout.dataLabels.xAxis.formatter,
            checkNaN(selectedSet.right.value),
            dataLabel({ v: checkNaN(selectedSet.right.value) }),
            { datapoint, seriesIndex: index }
        )}</b></div></div>`;
        html += `</div>`;
        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor}"><div>${FINAL_CONFIG.value.translations.total}</div><div><b>${applyDataLabel(
            FINAL_CONFIG.value.style.layout.dataLabels.xAxis.formatter,
            checkNaN(selectedSet.right.value) + checkNaN(selectedSet.left.value),
            dataLabel({ v: checkNaN(selectedSet.right.value) + checkNaN(selectedSet.left.value) }),
            { datapoint, seriesIndex: index }
        )}</b></div></div>`
        html += `</div>`;
    
        tooltipContent.value = `<div>${html}</div>`;
    }

    isTooltip.value = true;
}

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = [FINAL_CONFIG.value.translations.year, FINAL_CONFIG.value.translations.age, FINAL_CONFIG.value.translations.female, FINAL_CONFIG.value.translations.male, FINAL_CONFIG.value.translations.total];

        const values = props.dataset.map(ds => {
            return [
                ds[0],
                ds[1],
                ds[2],
                ds[3],
                (ds[2] ?? 0 + ds[3] ?? 0)
            ]
        });

        const tableXls = [[FINAL_CONFIG.value.style.title.text],[FINAL_CONFIG.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)
        const csvContent = createCsvContent(tableXls);
        if(!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.title.text || "vue-ui-heatmap"});
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.translations.year,
        FINAL_CONFIG.value.translations.age,
        FINAL_CONFIG.value.translations.female,
        FINAL_CONFIG.value.translations.male,
        FINAL_CONFIG.value.translations.total
    ];
    const body = props.dataset.map(ds => {
        return [
            ds[0],
            ds[1],
            ds[2] == null ? '' : ds[2].toLocaleString(),
            ds[3] == null ? '' : ds[3].toLocaleString(),
            (ds[2] ?? 0 + ds[3] ?? 0).toLocaleString()
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
    };
    
    return { head, body, config, colNames: head}
})

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
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

async function getImage({ scale = 2} = {}) {
    if (!agePyramid.value) return
    const { width, height } = agePyramid.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: agePyramid.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.title.text,
        width,
        height,
        aspectRatio
    }
}

const dummyTimeLabels = ref([])
const dummySlicer = ref( { start: 0, end: drawableDataset.value.length })

useTimeLabelCollision({
    timeLabelsEls: xAxisLabels,
    timeLabels: dummyTimeLabels,
    slicer: dummySlicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'layout', 'dataLabels', 'xAxis', 'rotation'],
    autoRotatePath: ['style', 'layout', 'dataLabels', 'xAxis', 'autoRotate', 'enable'],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    targetClass: '.vue-ui-age-pyramid-x-axis-label',
    rotation: FINAL_CONFIG.value.style.layout.dataLabels.xAxis.autoRotate.angle
});

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.title.text}${FINAL_CONFIG.value.style.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: agePyramid.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8)
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.backgroundColor,
                    color: FINAL_CONFIG.value.style.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.backgroundColor,
                    color: FINAL_CONFIG.value.style.color
                }
            }
        }
    }
});

watch(() => mutableConfig.value.showTable, v => {
    if (FINAL_CONFIG.value.table.show) return;
    if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
        tableUnit.value.open()
    } else {
        if ('close' in tableUnit.value) {
            tableUnit.value.close()
        }
    }
})

defineExpose({
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
});

</script>

<template>
    <div :class="`vue-ui-age-pyramid ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" ref="agePyramid" :id="`vue-ui-age-pyramid_${uid}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
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
                        cy: 'pyramid-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'pyramid-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="agePyramid"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
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
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
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

        <!-- CHART -->
        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" 
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" 
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.color}`" 
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="drawingArea.left"
                :y="drawingArea.top"
                :width="Math.max(0.1, drawingArea.width)"
                :height="Math.max(0.1, drawingArea.height)"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            <defs>
                <linearGradient 
                    :id="`age_pyramid_left_${uid}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <stop 
                        offset="0%" 
                        :stop-color="FINAL_CONFIG.style.layout.bars.left.color"
                    />
                    <stop 
                        offset="100%" 
                        :stop-color="setOpacity(shiftHue(FINAL_CONFIG.style.layout.bars.left.color, FINAL_CONFIG.style.layout.bars.gradient.shiftHue), 100 - FINAL_CONFIG.style.layout.bars.gradient.intensity)"
                    />
                </linearGradient>
                <linearGradient 
                    :id="`age_pyramid_right_${uid}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <stop 
                        offset="0%" 
                        :stop-color="setOpacity(shiftHue(FINAL_CONFIG.style.layout.bars.right.color, FINAL_CONFIG.style.layout.bars.gradient.shiftHue), 100 - FINAL_CONFIG.style.layout.bars.gradient.intensity)"
                    />
                    <stop 
                        offset="100%" 
                        :stop-color="FINAL_CONFIG.style.layout.bars.right.color"
                    />
                </linearGradient>
            </defs>

            <g v-for="(segment, i) in drawableDataset">
                <rect
                    :x="segment.left.x"
                    :y="segment.left.y"
                    :width="checkNaN(segment.left.width <= 0 ? 0.0001 : segment.left.width)"
                    :height="segment.left.height <= 0 ? 0.0001 : segment.left.height"
                    :fill="FINAL_CONFIG.style.layout.bars.gradient.underlayer"
                    :rx="FINAL_CONFIG.style.layout.bars.borderRadius"
                />
                <rect
                    :x="segment.left.x"
                    :y="segment.left.y"
                    :width="segment.left.width <= 0 ? 0.0001 : segment.left.width"
                    :height="segment.left.height <= 0 ? 0.0001 : segment.left.height"
                    :fill="FINAL_CONFIG.style.layout.bars.gradient.show ? `url(#age_pyramid_left_${uid})` : segment.left.color"
                    :rx="FINAL_CONFIG.style.layout.bars.borderRadius"
                />
                <rect
                    :x="segment.right.x"
                    :y="segment.right.y"
                    :width="segment.right.width <= 0 ? 0.0001 : segment.right.width"
                    :height="segment.right.height <= 0 ? 0.0001 : segment.right.height"
                    :fill="FINAL_CONFIG.style.layout.bars.gradient.underlayer"
                    :rx="FINAL_CONFIG.style.layout.bars.borderRadius"
                />
                <rect
                    :x="segment.right.x"
                    :y="segment.right.y"
                    :width="segment.right.width <= 0 ? 0.0001 : segment.right.width"
                    :height="segment.right.height <= 0 ? 0.0001 : segment.right.height"
                    :fill="FINAL_CONFIG.style.layout.bars.gradient.show ? `url(#age_pyramid_right_${uid})` : segment.right.color"
                    :rx="FINAL_CONFIG.style.layout.bars.borderRadius"
                />
            </g>

            <!-- LABELS -->
            <g>
                <g v-if="FINAL_CONFIG.style.layout.dataLabels.sideTitles.show">
                    <text
                        data-cy="label-left"
                        :x="drawingArea.left"
                        :y="FINAL_CONFIG.style.layout.dataLabels.sideTitles.fontSize"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.sideTitles.useSideColor ? FINAL_CONFIG.style.layout.bars.left.color : FINAL_CONFIG.style.layout.dataLabels.sideTitles.color"
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.sideTitles.fontSize"
                        text-anchor="start"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.sideTitles.bold ? 'bold' : 'normal'"
                    >
                        {{ FINAL_CONFIG.translations.female }}
                    </text>
                    <text
                        data-cy="label-right"
                        :x="drawingArea.right"
                        :y="FINAL_CONFIG.style.layout.dataLabels.sideTitles.fontSize"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.sideTitles.useSideColor ? FINAL_CONFIG.style.layout.bars.right.color : FINAL_CONFIG.style.layout.dataLabels.sideTitles.color"
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.sideTitles.fontSize"
                        text-anchor="end"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.sideTitles.bold ? 'bold' : 'normal'"
                    >
                        {{ FINAL_CONFIG.translations.male }}
                    </text>
                </g>

                <g v-if="FINAL_CONFIG.style.layout.dataLabels.yAxis.show">
                    <template v-for="(label, i) in yLabels"> 
                        <text
                            data-cy="y-axis-label"
                            v-if="i % FINAL_CONFIG.style.layout.dataLabels.yAxis.showEvery === 0"
                            :x="drawingArea.centerX"
                            :y="drawingArea.top + (drawingArea.height / len) * i + (FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize / 3)"
                            text-anchor="middle"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.yAxis.bold ? 'bold': 'normal'"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.style.layout.dataLabels.yAxis.formatter,
                                label,
                                dataLabel({ v: label }),
                                { datapoint: label, seriesIndex: i}
                            ) }}
                        </text>
                    </template>
                </g>

                <g v-if="FINAL_CONFIG.style.layout.dataLabels.xAxis.show">
                    <g v-if="FINAL_CONFIG.style.layout.grid.show">
                        <line
                            data-cy="scale-line-left"
                            :x1="xLabels.right[0].x"
                            :x2="xLabels.right.at(-1).x"
                            :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                            :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                        <line
                            data-cy="scale-line-right"
                            :x1="xLabels.left[0].x"
                            :x2="xLabels.left.at(-1).x"
                            :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                            :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                    </g>
                    <g v-for="(rightLabel, i) in xLabels.right">
                        <line 
                            v-if="FINAL_CONFIG.style.layout.grid.show"
                            data-cy="scale-tick-right"
                            :x1="rightLabel.x"
                            :x2="rightLabel.x"
                            :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + (FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2) + 4"
                            :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                            :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                    </g>
                    <g v-for="(leftLabel, i) in xLabels.left">
                        <line 
                            v-if="FINAL_CONFIG.style.layout.grid.show"
                            data-cy="scale-tick-left"
                            :x1="leftLabel.x"
                            :x2="leftLabel.x"
                            :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + (FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2) + 4"
                            :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                            :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                    </g>

                    <g ref="xAxisLabels">
                        <text
                            class="vue-ui-age-pyramid-x-axis-label"
                            v-for="(rightLabel, i) in xLabels.right"
                            data-cy="scale-tick-right-label"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                            :text-anchor="FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation > 0 ? 'start' : FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation < 0 ? 'end' : 'middle'"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold': 'normal'"
                            :transform="`translate(${rightLabel.x}, ${drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize * 2}) rotate(${FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation})`"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.style.layout.dataLabels.xAxis.formatter,
                                rightLabel.value / FINAL_CONFIG.style.layout.dataLabels.xAxis.scale,
                                dataLabel({
                                    v: rightLabel.value / FINAL_CONFIG.style.layout.dataLabels.xAxis.scale
                                }),
                                { datapoint: rightLabel, seriesIndex: i }
                            ) }}
                        </text>

                        <text
                            class="vue-ui-age-pyramid-x-axis-label"
                            v-for="(leftLabel, i) in xLabels.left"
                            data-cy="scale-tick-left-label"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                            :text-anchor="FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation > 0 ? 'start' : FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation < 0 ? 'end' : 'middle'"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold': 'normal'"
                            :transform="`translate(${leftLabel.x}, ${drawingArea.bottom +  FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize * 2}) rotate(${FINAL_CONFIG.style.layout.dataLabels.xAxis.rotation})`"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.style.layout.dataLabels.xAxis.formatter,
                                leftLabel.value / FINAL_CONFIG.style.layout.dataLabels.xAxis.scale,
                                dataLabel({
                                    v: leftLabel.value / FINAL_CONFIG.style.layout.dataLabels.xAxis.scale
                                }),
                                { datapoint: leftLabel, seriesIndex: i}
                            ) }}
                        </text>
                    </g>
                    <text
                        :x="drawingArea.right"
                        :y="svg.height"
                        text-anchor="end"
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold': 'normal'"
                    >
                        {{ FINAL_CONFIG.style.layout.dataLabels.xAxis.translation }}
                    </text>

                </g>
            </g>

            <!-- TOOLTIP TRAPS -->
            <g v-for="(datapoint, i) in dataset">
                <rect
                    data-cy="tooltip-trap"
                    :x="drawingArea.left"
                    :y="drawingArea.top + (drawingArea.height / len) * i - FINAL_CONFIG.style.layout.bars.gap / 2"
                    :width="drawingArea.width <= 0 ? 0.0001 : drawingArea.width"
                    :height="drawingArea.height / len <= 0 ? 0.0001 : drawingArea.height / len"
                    :fill="selectedIndex !== null && selectedIndex === i ? setOpacity(FINAL_CONFIG.style.highlighter.color, FINAL_CONFIG.style.highlighter.opacity) : 'transparent'"
                    @mouseover="useTooltip(i, datapoint)"
                    @mouseleave="onTrapLeave(i, datapoint)"
                    @click="selectDatapoint(i, datapoint)"
                />
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <slot name="legend" v-bind:legend="drawableDataset"></slot>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.tooltip.position"
            :offsetY="FINAL_CONFIG.style.tooltip.offsetY"
            :parent="agePyramid"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.style.tooltip.customFormat && typeof FINAL_CONFIG.style.tooltip.customFormat === 'function'"
            :smooth="FINAL_CONFIG.style.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.tooltip.backdropFilter"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <component
            v-if="isDataset"
            :is="tableComponent.component"
            v-bind="tableComponent.props"
            ref="tableUnit"
            @close="mutableConfig.showTable = false"
        >
            <template #title v-if="FINAL_CONFIG.table.useDialog">
                {{ tableComponent.title }}
            </template>
            <template #actions v-if="FINAL_CONFIG.table.useDialog">
                <button tabindex="0" class="vue-ui-user-options-button" @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)">
                    <BaseIcon name="excel" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        {{ th }}
                    </template>
                    <template #td="{ td }">
                        {{ td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-age-pyramid *{
    transition: unset;
}
.vue-ui-age-pyramid {
    user-select: none;
    position: relative;
}
.vue-ui-age-pyramid .vue-ui-age-pyramid-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-age-pyramid-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-age-pyramid-legend-item {
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}

/** */
.vue-ui-age-pyramid-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
    font-variant-numeric: tabular-nums;
}
</style>
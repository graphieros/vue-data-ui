<script setup>
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onMounted,
    ref,
    toRefs,
    watch,
} from 'vue';
import {
    applyDataLabel,
    createUid,
    dataLabel,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    treeShake,
    XMLNS,
} from '../lib';
import { throttle } from '../canvas-lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { useFitSvgText } from '../useFitSvgText';
import { useNestedProp } from '../useNestedProp';
import { useResponsive } from '../useResponsive';
import { useThemeCheck } from '../useThemeCheck';
import { useChartAccessibility } from '../useChartAccessibility';
import Shape from '../atoms/Shape.vue';
import themes from '../themes/vue_ui_sparkhistogram.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import DefGrad from '../atoms/DefGrad.vue';

const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);

const { vue_ui_sparkhistogram: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Array,
        default() {
            return [];
        },
    },
});

const uid = ref(createUid());
const source = ref(null);
const chartTitle = ref(null);
const histogramChart = ref(null);
const resizeObserver = ref(null);
const observedEl = ref(null);

const isFocus = ref(false); // a11y
const keyboardIndex = ref(null); // a11y
const interactionMode = ref('pointer'); // a11y

const FINAL_CONFIG = ref(prepareConfig());
const cfgLabels = computed(() => FINAL_CONFIG.value.style.labels);
const cfgBars = computed(() => FINAL_CONFIG.value.style.bars);
const cfgStyle = computed(() => FINAL_CONFIG.value.style);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiSparkHistogram',
    rules: [
        COMMON_RULES.singleSeries,
        {
            test: (dataset) => dataset.length > 31,
            message: [
                '👀 The number of datapoints is > 31. For a more readable chart, consider:',
                '',
                '▶️ Using VueUiXy with a line series',
            ],
        },
    ],
});

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            style: {
                animation: { show: false },
                backgroundColor: '#99999930',
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
        { value: 1, intensity: 0.2, color: '#CACACA' },
        { value: 2, intensity: 0.3, color: '#CACACA' },
        { value: 3, intensity: 0.5, color: '#CACACA' },
        { value: 5, intensity: 0.7, color: '#CACACA' },
        { value: 8, intensity: 0.9, color: '#CACACA' },
        { value: 13, intensity: 0.95, color: '#CACACA' },
        { value: 21, intensity: 1, color: '#CACACA' },
        { value: 13, intensity: 0.95, color: '#CACACA' },
        { value: 8, intensity: 0.9, color: '#CACACA' },
        { value: 5, intensity: 0.7, color: '#CACACA' },
        { value: 3, intensity: 0.5, color: '#CACACA' },
        { value: 2, intensity: 0.3, color: '#CACACA' },
        { value: 1, intensity: 0.2, color: '#CACACA' },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const WIDTH = ref(cfgStyle.value.layout.width);
const HEIGHT = ref(cfgStyle.value.layout.height);

const { svgRef } = useChartAccessibility({
    config: cfgStyle.value.title,
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig,
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused,
    });

    return finalConfig;
}

onMounted(() => {
    prepareChart();
});

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkHistogram',
            type: 'dataset',
            debug: debug.value,
        });
    } else {
        if (debug.value) {
            props.dataset.forEach((ds, i) => {
                getMissingDatasetAttributes({
                    datasetObject: ds,
                    requiredAttributes: ['value'],
                }).forEach((attr) => {
                    error({
                        componentName: 'VueUiSparkHistogram',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: i,
                    });
                });
            });
        }
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: histogramChart.value,
                title: cfgStyle.value.title.text ? chartTitle.value : null,
                source: source.value,
            });

            const _timeLabelHeight = cfgLabels.value.timeLabel.show
                ? cfgLabels.value.timeLabel.fontSize * 2
                : 0;
            const _valueLabelHeight = cfgLabels.value.valueLabel.show
                ? cfgLabels.value.valueLabel.fontSize * 2
                : 0;

            requestAnimationFrame(() => {
                WIDTH.value = Math.max(10, width);
                HEIGHT.value = Math.max(
                    10,
                    height - 12 - _timeLabelHeight - _valueLabelHeight,
                );
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }
        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = histogramChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

watch(
    () => props.config,
    (_newCfg) => {
        FINAL_CONFIG.value = prepareConfig();
        prepareChart();
    },
    { deep: true },
);

const drawingArea = computed(() => {
    const _timeLabelHeight = cfgLabels.value.timeLabel.show
        ? cfgLabels.value.timeLabel.fontSize * 2
        : 0;
    const _valueLabelHeight = cfgLabels.value.valueLabel.show
        ? cfgLabels.value.valueLabel.fontSize * 2
        : 0;

    const height = HEIGHT.value + _timeLabelHeight + _valueLabelHeight;
    const width = WIDTH.value;
    const top = cfgStyle.value.layout.padding.top;
    const bottom = height - cfgStyle.value.layout.padding.bottom;
    const left = cfgStyle.value.layout.padding.left;
    const right = width - cfgStyle.value.layout.padding.right;
    const centerY =
        top + (height - top - cfgStyle.value.layout.padding.bottom) / 2;
    const drawingHeight =
        height -
        cfgStyle.value.layout.padding.top -
        cfgStyle.value.layout.padding.bottom -
        _timeLabelHeight -
        _valueLabelHeight;
    const drawingWidth =
        width -
        cfgStyle.value.layout.padding.left -
        cfgStyle.value.layout.padding.right;
    return {
        bottom,
        centerY,
        drawingHeight,
        drawingWidth,
        height,
        left,
        right,
        top,
        width,
    };
});

const maxVal = computed(() => {
    return Math.max(
        ...FINAL_DATASET.value.map((ds) => Math.abs(ds.value || 0)),
    );
});

function toMax(val) {
    return Math.abs(val) / maxVal.value;
}

const computedDataset = computed(() => {
    return FINAL_DATASET.value.map((dp, i) => {
        const proportion = toMax(dp.value || 0);
        const height = drawingArea.value.drawingHeight * proportion;
        const unitWidth =
            drawingArea.value.drawingWidth / FINAL_DATASET.value.length;
        const gap = unitWidth * (cfgBars.value.gap / 100);
        const width = unitWidth - gap;
        const y = drawingArea.value.centerY - height / 2;
        const x = drawingArea.value.left + (gap / 2 + i * unitWidth);
        const trapX = drawingArea.value.left + i * unitWidth;
        const intensity =
            typeof dp.intensity === 'undefined'
                ? 100
                : Math.round(dp.intensity * 100);
        const color = dp.color
            ? dp.color
            : dp.value >= 0
              ? setOpacity(cfgBars.value.colors.positive, intensity)
              : setOpacity(cfgBars.value.colors.negative, intensity);
        const stroke = dp.color
            ? dp.color
            : dp.value >= 0
              ? cfgBars.value.colors.positive
              : cfgBars.value.colors.negative;
        const gradient = dp.color
            ? `url(#gradient_datapoint_${i}_${uid.value})`
            : dp.value >= 0
              ? `url(#gradient_positive_${i}_${uid.value})`
              : `url(#gradient_negative_${i}_${uid.value})`;
        const textAnchor = x + width / 2;
        return {
            ...dp,
            color,
            gradient,
            height,
            intensity,
            proportion,
            stroke,
            textAnchor,
            trapX,
            unitWidth,
            width,
            x,
            y,
        };
    });
});

function getTopLabel(datapoint, index) {
    return applyDataLabel(
        cfgLabels.value.value.formatter,
        datapoint.value,
        dataLabel({
            p: cfgLabels.value.value.prefix,
            v: datapoint.value,
            s: cfgLabels.value.value.suffix,
            r: cfgLabels.value.value.rounding,
        }),
        { datapoint, seriesIndex: index },
    );
}

const selectedIndex = ref(null);

const emits = defineEmits(['selectDatapoint']);

function selectDatapoint(datapoint, index) {
    emits('selectDatapoint', { datapoint, index });
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint,
            seriesIndex: index,
        });
    }
}

function onTrapEnter(datapoint, index) {
    interactionMode.value = 'pointer';
    keyboardIndex.value = index;
    selectedIndex.value = index;
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint,
            seriesIndex: index,
        });
    }
}

function onTrapLeave(datapoint, index) {
    if (interactionMode.value === 'keyboard') return;
    selectedIndex.value = null;
    keyboardIndex.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint,
            seriesIndex: index,
        });
    }
}

function onChartMouseLeave() {
    if (interactionMode.value === 'keyboard') return;
    selectedIndex.value = null;
    keyboardIndex.value = null;
}

const animation = computed(() => {
    return `${cfgStyle.value.animation.speedMs}ms`;
});

const unitWidth = computed(
    () => (drawingArea.value.drawingWidth / FINAL_DATASET.value.length) * 0.9,
);

const { fitText } = useFitSvgText({
    svgRef,
    unitWidth,
});

onMounted(async () => {
    await nextTick();
    fitText(
        '.vue-ui-sparkhistogram-top-label',
        cfgLabels.value.value.minFontSize,
    );
    fitText(
        '.vue-ui-sparkhistogram-bottom-label',
        cfgLabels.value.valueLabel.minFontSize,
    );
    fitText(
        '.vue-ui-sparkhistogram-time-label',
        cfgLabels.value.timeLabel.minFontSize,
    );
});

watch([WIDTH, HEIGHT, () => FINAL_DATASET.value], async () => {
    await nextTick();
    fitText(
        '.vue-ui-sparkhistogram-top-label',
        cfgLabels.value.value.minFontSize,
    );
    fitText(
        '.vue-ui-sparkhistogram-bottom-label',
        cfgLabels.value.valueLabel.minFontSize,
    );
    fitText(
        '.vue-ui-sparkhistogram-time-label',
        cfgLabels.value.timeLabel.minFontSize,
    );
});

/***************************************************************************************************
 * a11y
 **************************************************************************************************/

function onSvgFocus() {
    isFocus.value = true;
}

function onSvgBlur() {
    isFocus.value = false;
    keyboardIndex.value = null;
    interactionMode.value = 'pointer';
    selectedIndex.value = null;
}

function onSvgKeydown(event) {
    if (!svgRef.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!computedDataset.value.length) return;

    const isPreviousKey = event.key === 'ArrowLeft';
    const isNextKey = event.key === 'ArrowRight';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        keyboardIndex.value = null;
        selectedIndex.value = null;
        interactionMode.value = 'pointer';
        return;
    }

    if (isActivationKey) {
        if (selectedIndex.value === null) return;
        const datapoint = computedDataset.value[selectedIndex.value];
        if (!datapoint) return;
        selectDatapoint(datapoint, selectedIndex.value);
        return;
    }

    interactionMode.value = 'keyboard';

    let nextIndex = keyboardIndex.value;

    if (
        nextIndex === null ||
        nextIndex < 0 ||
        nextIndex >= computedDataset.value.length
    ) {
        nextIndex = isNextKey ? 0 : computedDataset.value.length - 1;
    } else if (isNextKey) {
        nextIndex += 1;
        if (nextIndex >= computedDataset.value.length) {
            nextIndex = 0;
        }
    } else if (isPreviousKey) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = computedDataset.value.length - 1;
        }
    }

    keyboardIndex.value = nextIndex;
    selectedIndex.value = nextIndex;

    const datapoint = computedDataset.value[nextIndex];

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint,
            seriesIndex: nextIndex,
        });
    }
}

const a11yTable = computed(() => {
    const headers = [
        FINAL_CONFIG.value.a11y?.translations?.series ?? 'Series',
        FINAL_CONFIG.value.a11y?.translations?.time ?? 'Time',
        FINAL_CONFIG.value.a11y?.translations?.value ?? 'Value',
        FINAL_CONFIG.value.a11y?.translations?.valueLabel ?? 'Label',
    ];

    const rows = computedDataset.value.map((datapoint, index) => {
        return [
            index + 1,
            datapoint.timeLabel ?? '',
            datapoint.value ?? '',
            datapoint.valueLabel ?? '',
        ];
    });

    return { headers, rows };
});
</script>

<template>
    <div
        class="vue-data-ui-component vue-ui-spark-histogram"
        ref="histogramChart"
        :style="`width:100%;background:${cfgStyle.backgroundColor};font-family:${cfgStyle.fontFamily}`"
        @mouseleave="onChartMouseLeave"
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="a11yTable?.rows?.length"
            :uid="uid"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <!-- TITLE -->
        <div
            ref="chartTitle"
            v-if="cfgStyle.title.text"
            :style="`width:calc(100% - 12px);background:transparent;margin:0 auto;margin:${cfgStyle.title.margin};padding: 0 6px;text-align:${cfgStyle.title.textAlign}`"
        >
            <div
                data-cy="title"
                :style="`font-size:${cfgStyle.title.fontSize}px;color:${cfgStyle.title.color};font-weight:${cfgStyle.title.bold ? 'bold' : 'normal'}`"
            >
                {{ cfgStyle.title.text }}
                <span data-cy="title-selection" v-if="selectedIndex !== null"
                    >-
                    {{ computedDataset[selectedIndex].timeLabel || '' }}
                    {{
                        applyDataLabel(
                            cfgLabels.value.formatter,
                            computedDataset[selectedIndex].value,
                            dataLabel({
                                p: cfgLabels.value.prefix,
                                v: computedDataset[selectedIndex].value,
                                s: cfgLabels.value.suffix,
                                r: cfgLabels.value.rounding,
                            }),
                            {
                                datapoint: computedDataset[selectedIndex],
                                seriesIndex: selectedIndex,
                            },
                        )
                    }}
                </span>
                <span
                    data-cy="title-selection-value-label"
                    v-if="
                        ![undefined, null].includes(selectedIndex) &&
                        ![null, undefined].includes(
                            computedDataset[selectedIndex].valueLabel,
                        )
                    "
                    >{{
                        ` (${computedDataset[selectedIndex].valueLabel || 0})`
                    }}</span
                >
            </div>
            <div
                data-cy="subtitle"
                v-if="cfgStyle.title.subtitle.text"
                :style="`font-size:${cfgStyle.title.subtitle.fontSize}px;color:${cfgStyle.title.subtitle.color};font-weight:${cfgStyle.title.subtitle.bold ? 'bold' : 'normal'}`"
            >
                {{ cfgStyle.title.subtitle.text }}
            </div>
        </div>

        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                data-cy="sparkhistogram-svg"
                :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`"
                style="overflow: visible"
                :aria-describedby="`chart-instructions-${uid}`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="0"
                    :y="0"
                    :width="drawingArea.width"
                    :height="drawingArea.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <defs>
                    <DefGrad
                        t="radial"
                        v-for="(posGrad, i) in computedDataset"
                        :id="`gradient_positive_${i}_${uid}`"
                        :key="`gradient_positive_${i}_${uid}`"
                        cy="50%"
                        cx="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        :stops="[
                            [
                                '0%',
                                setOpacity(
                                    shiftHue(cfgBars.colors.positive, 0.05),
                                    posGrad.intensity,
                                ),
                                1,
                            ],
                            [
                                '100%',
                                setOpacity(
                                    cfgBars.colors.positive,
                                    posGrad.intensity,
                                ),
                                1,
                            ],
                        ]"
                    />
                    <DefGrad
                        t="radial"
                        v-for="(negGrad, i) in computedDataset"
                        :id="`gradient_negative_${i}_${uid}`"
                        :key="`gradient_negative_${i}_${uid}`"
                        cy="50%"
                        cx="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        :stops="[
                            [
                                '0%',
                                setOpacity(
                                    shiftHue(cfgBars.colors.negative, 0.05),
                                    negGrad.intensity,
                                ),
                                1,
                            ],
                            [
                                '100%',
                                setOpacity(
                                    cfgBars.colors.negative,
                                    negGrad.intensity,
                                ),
                                1,
                            ],
                        ]"
                    />
                    <DefGrad
                        t="radial"
                        v-for="(dp, i) in computedDataset"
                        :id="`gradient_datapoint_${i}_${uid}`"
                        :key="`gradient_datapoint_${i}_${uid}`"
                        cy="50%"
                        cx="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        :stops="[
                            [
                                '0%',
                                setOpacity(
                                    shiftHue(dp.color, 0.05),
                                    dp.intensity,
                                ),
                                1,
                            ],
                            ['100%', setOpacity(dp.color, dp.intensity), 1],
                        ]"
                    />
                </defs>

                <g v-for="(rect, i) in computedDataset">
                    <rect
                        v-if="selectedIndex !== null && selectedIndex === i"
                        data-cy="tooltip-trap"
                        :height="drawingArea.height"
                        :width="rect.unitWidth"
                        :fill="cfgStyle.selector.fill"
                        :x="rect.trapX"
                        :y="0"
                        :stroke="cfgStyle.selector.stroke"
                        :stroke-width="cfgStyle.selector.strokeWidth"
                        :rx="cfgStyle.selector.borderRadius"
                        :stroke-dasharray="cfgStyle.selector.strokeDasharray"
                    />
                </g>

                <g v-if="!cfgBars.shape || cfgBars.shape === 'square'">
                    <rect
                        v-for="(rect, i) in computedDataset"
                        data-cy="datapoint-rect"
                        :x="rect.x"
                        :y="rect.y"
                        :height="rect.height"
                        :width="rect.width"
                        :fill="
                            cfgBars.colors.gradient.show
                                ? rect.gradient
                                : rect.color
                        "
                        :stroke="rect.stroke"
                        :stroke-width="cfgBars.strokeWidth"
                        :rx="`${(cfgBars.borderRadius * rect.proportion) / 12}%`"
                        :class="{
                            'vue-ui-sparkhistogram-shape':
                                cfgStyle.animation.show,
                        }"
                    />
                </g>
                <g v-else>
                    <Shape
                        v-for="(rect, _i) in computedDataset"
                        :plot="{
                            x: rect.x + rect.width / 2,
                            y: rect.y + rect.height / 2,
                        }"
                        :color="
                            cfgBars.colors.gradient.show
                                ? rect.gradient
                                : rect.color
                        "
                        :shape="cfgBars.shape"
                        :radius="Math.min(rect.height * 0.4, rect.width * 0.4)"
                        :class="{
                            'vue-ui-sparkhistogram-shape':
                                cfgStyle.animation.show,
                        }"
                    />
                </g>

                <template v-if="!loading">
                    <g v-for="(val, i) in computedDataset">
                        <text
                            v-if="cfgLabels.value.show"
                            class="vue-ui-sparkhistogram-top-label"
                            data-cy="datapoint-label-value"
                            text-anchor="middle"
                            :x="val.textAnchor"
                            :y="
                                val.y -
                                cfgLabels.value.fontSize / 3 +
                                cfgLabels.value.offsetY
                            "
                            :font-size="cfgLabels.value.fontSize"
                            :font-weight="
                                cfgLabels.value.bold ? 'bold' : 'normal'
                            "
                            :fill="cfgLabels.value.color"
                        >
                            {{ getTopLabel(val, i) }}
                        </text>
                    </g>

                    <g v-for="(label, _i) in computedDataset">
                        <text
                            class="vue-ui-sparkhistogram-bottom-label"
                            data-cy="datapoint-label-valueLabel"
                            v-if="label.valueLabel && cfgLabels.valueLabel.show"
                            :x="label.textAnchor"
                            :y="
                                label.y +
                                label.height +
                                cfgLabels.valueLabel.fontSize
                            "
                            :font-size="cfgLabels.valueLabel.fontSize"
                            text-anchor="middle"
                            :fill="cfgLabels.valueLabel.color"
                        >
                            {{ label.valueLabel }}
                        </text>
                    </g>

                    <g v-for="(time, _i) in computedDataset">
                        <text
                            class="vue-ui-sparkhistogram-time-label"
                            data-cy="datapoint-label-time"
                            v-if="time.timeLabel && cfgLabels.timeLabel.show"
                            :x="time.textAnchor"
                            :y="drawingArea.height"
                            :font-size="cfgLabels.timeLabel.fontSize"
                            :fill="cfgLabels.timeLabel.color"
                            text-anchor="middle"
                        >
                            {{ time.timeLabel }}
                        </text>
                    </g>
                </template>

                <!-- TOOLTIP TRAPS -->
                <g v-for="(rect, i) in computedDataset">
                    <rect
                        data-cy="tooltip-trap"
                        :height="drawingArea.height"
                        :width="rect.unitWidth"
                        fill="transparent"
                        :x="rect.trapX"
                        :y="0"
                        @mouseover="onTrapEnter(rect, i)"
                        @mouseleave="onTrapLeave(rect, i)"
                        @click="() => selectDatapoint(rect, i)"
                    />
                </g>
            </svg>

            <div
                v-if="$slots.hint"
                style="position: absolute; top: 100%; left: 0; width: 100%"
                data-dom-to-png-ignore
                aria-hidden="true"
            >
                <slot
                    name="hint"
                    v-bind="{
                        hint: FINAL_CONFIG.a11y.translations.keyboardNavigation,
                        isVisible: isFocus,
                    }"
                />
            </div>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped>
.vue-ui-spark-histogram {
    position: relative;
}

.vue-ui-sparkhistogram-shape {
    animation: expand v-bind(animation) ease-in forwards;
    transform-origin: center;
    transform: scale(1, 0);
}

@keyframes expand {
    80% {
        transform: scale(1, 1.1);
    }
    90% {
        transform: scale(1, 0.95);
    }
    95% {
        transform: scale(1, 1.03);
    }
    100% {
        transform: scale(1, 1);
    }
}

svg:focus {
    outline: none;
}

svg:focus-visible {
    outline: 2px solid currentColor;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    clip: rect(0 0 0 0);
    white-space: normal;
    border: 0;
}

@media (prefers-reduced-motion: reduce) {
    .vue-data-ui-component * {
        transition: none !important;
        animation: none !important;
    }
}
</style>

<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';

import {
    ref,
    computed,
    onMounted,
    watch,
    nextTick,
    onBeforeUnmount,
    useSlots,
    defineAsyncComponent,
} from 'vue';
import {
    createCsvContent,
    createUid,
    downloadCsv,
    error,
    objectIsEmpty,
    setOpacity,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter';
import { useNestedProp } from '../useNestedProp';
import { useUserOptionState } from '../useUserOptionState';
import { usePrefersReducedMotion } from '../usePrefersMotion';

const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);

const { vue_ui_carousel_table: DEFAULT_CONFIG } = useConfig();
const prefersReducedMotion = usePrefersReducedMotion();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Object,
        default() {
            return {};
        },
    },
});

const emit = defineEmits(['copyAlt']);

const uid = ref(createUid());
const isFullscreen = ref(false);
const isDataset = computed(
    () =>
        Array.isArray(props.dataset?.head) &&
        props.dataset.head.length > 0 &&
        Array.isArray(props.dataset?.body) &&
        props.dataset.body.length > 0 &&
        props.dataset.body.every(Array.isArray),
);
const slots = useSlots();

onMounted(() => {
    prepareChart();
});

const FINAL_CONFIG = computed(() =>
    useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    }),
);
const userOptionConfig = computed(() => ({
    ...FINAL_CONFIG.value.userOptions,
    buttons: {
        ...FINAL_CONFIG.value.userOptions.buttons,
        animation:
            FINAL_CONFIG.value.userOptions.buttons.animation &&
            !prefersReducedMotion.value,
    },
}));

const debug = computed(() => FINAL_CONFIG.value.debug);

onMounted(() => {
    if (slots['chart-background'] && debug.value) {
        console.warn(
            'VueUiCarouselTable does not support the #chart-background slot.',
        );
    }
});

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCarouselTable',
            type: 'dataset',
            debug: debug.value,
        });
    } else {
        if (!props.dataset.head || objectIsEmpty(props.dataset.head)) {
            error({
                componentName: 'VueUiCarouselTable',
                type: 'datasetAttribute',
                property: 'head',
                debug: debug.value,
            });
        }
        if (!props.dataset.body || objectIsEmpty(props.dataset.body)) {
            error({
                componentName: 'VueUiCarouselTable',
                type: 'datasetAttribute',
                property: 'body',
                debug: debug.value,
            });
        }
    }
}

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiCarouselTable',
    rules: [COMMON_RULES.noHint],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });

watch(
    () => props.config,
    () => {
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
    },
    { deep: true },
);
watch(() => props.dataset, prepareChart, { deep: true });

const {
    isPrinting,
    isImaging,
    generatePdf: makePdf,
    generateImage,
} = usePrinter({
    elementId: `carousel-table_${uid.value}`,
    fileName: FINAL_CONFIG.value.caption.text || 'vue-ui-carousel-table',
    options: FINAL_CONFIG.value.userOptions.print,
});

const mutableConfig = ref({
    showAnimation: FINAL_CONFIG.value.animation.use,
});

const tableContainer = ref(null);
const chartContainer = ref(null);
const caption = ref(null);
const tableRow = ref(null);

const captionHeight = ref(0);
const tableRowHeight = ref(0);
const isResponsive = ref(false);

const tbody = ref(null);
const rowHeights = ref([]);
const scrollIndex = ref(0);

const maxTrHeight = computed(() =>
    rowHeights.value.length
        ? Math.max(...rowHeights.value) +
          captionHeight.value +
          tableRowHeight.value
        : 0,
);

const visibleCells = computed(() => {
    if (!props.dataset.body) return 0;
    return FINAL_CONFIG.value.tbody.tr.visible <= props.dataset.body.length
        ? FINAL_CONFIG.value.tbody.tr.visible
        : props.dataset.body.length;
});

const rowHeight = computed(() => {
    return (
        (FINAL_CONFIG.value.tbody.tr.height +
            FINAL_CONFIG.value.tbody.tr.td.padding.top +
            FINAL_CONFIG.value.tbody.tr.td.padding.bottom +
            FINAL_CONFIG.value.tbody.tr.border.size * 2) *
            visibleCells.value +
        captionHeight.value +
        tableRowHeight.value
    );
});

const init = ref(0);
let raf = null;
let lastTimestamp = null;
let resumeTouchTimeout = null;
let tableObserver = null;
let disposed = false;
const explicitlyPaused = ref(false);
const hovered = ref(false);
const touching = ref(false);
const isPaused = computed(
    () =>
        explicitlyPaused.value ||
        touching.value ||
        (hovered.value && FINAL_CONFIG.value.animation.pauseOnHover) ||
        !mutableConfig.value.showAnimation ||
        prefersReducedMotion.value ||
        !isDataset.value,
);
const step = ref(0);

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function stopAnimation() {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
    lastTimestamp = null;
}

function startAnimation() {
    if (
        !disposed &&
        !isPaused.value &&
        tableContainer.value &&
        rowHeights.value.length &&
        raf === null
    ) {
        raf = requestAnimationFrame(animate);
    }
}

function animate(timestamp) {
    raf = null;
    if (
        disposed ||
        isPaused.value ||
        !tableContainer.value ||
        !rowHeights.value.length
    )
        return;
    const deltaTime = lastTimestamp === null ? 0 : timestamp - lastTimestamp;
    const container = tableContainer.value;
    const speedMs = Number(FINAL_CONFIG.value.animation.speedMs);
    if (!Number.isFinite(speedMs) || speedMs <= 0) return;

    if (FINAL_CONFIG.value.animation.type === 'scroll') {
        if (lastTimestamp === null) lastTimestamp = timestamp;
        if (deltaTime >= speedMs) {
            if (
                container.scrollTop + container.clientHeight >=
                    container.scrollHeight ||
                scrollIndex.value >= rowHeights.value.length
            ) {
                init.value = 0;
                scrollIndex.value = 0;
            } else {
                init.value += rowHeights.value[scrollIndex.value++];
            }
            container.scrollTo({ top: init.value, behavior: 'smooth' });
            lastTimestamp = timestamp;
        }
    } else {
        // Preserve the former 60 Hz pace while making distance independent of refresh rate.
        init.value += (deltaTime * (speedMs / 4000) * 60) / 1000;
        if (init.value >= container.scrollHeight - container.clientHeight)
            init.value = 0;
        container.scrollTo({ top: init.value, behavior: 'auto' });
        lastTimestamp = timestamp;
    }
    startAnimation();
}

function pauseAnimation() {
    explicitlyPaused.value = true;
    stopAnimation();
}

function resumeAnimation() {
    explicitlyPaused.value = false;
    startAnimation();
}

function pauseOnTouch() {
    touching.value = true;
    stopAnimation();
    clearTimeout(resumeTouchTimeout);
}

function resumeAfterDelay() {
    clearTimeout(resumeTouchTimeout);
    resumeTouchTimeout = setTimeout(() => {
        touching.value = false;
    }, 1000);
}

function updateVisibility() {
    const thead = tableContainer.value?.querySelector('thead');
    if (!thead || !tbody.value) return;
    const bottom = thead.getBoundingClientRect().bottom;
    for (const tr of tbody.value.querySelectorAll('tr')) {
        tr.style.visibility =
            tr.getBoundingClientRect().top < bottom ? 'hidden' : 'visible';
    }
}

function measureTable() {
    if (disposed) return;
    stopAnimation();
    captionHeight.value = caption.value?.getBoundingClientRect().height || 0;
    tableRowHeight.value = tableRow.value?.getBoundingClientRect().height || 0;
    rowHeights.value = Array.from(
        tbody.value?.querySelectorAll('tr') || [],
        (row) => row.getBoundingClientRect().height,
    );
    init.value = 0;
    scrollIndex.value = 0;
    tableContainer.value?.scrollTo({ top: 0, behavior: 'auto' });
    updateVisibility();
    startAnimation();
}

watch(
    isPaused,
    () => {
        stopAnimation();
        startAnimation();
    },
    { flush: 'sync' },
);
watch(
    () => FINAL_CONFIG.value.animation.use,
    (value) => {
        mutableConfig.value.showAnimation = value;
    },
);
watch([() => props.dataset, FINAL_CONFIG], measureTable, {
    deep: true,
    flush: 'post',
});
watch(
    () => FINAL_CONFIG.value.animation.speedMs,
    () => {
        stopAnimation();
        startAnimation();
    },
);

onMounted(() => {
    measureTable();
    tableObserver = new ResizeObserver((entries) => {
        if (disposed) return;
        for (const entry of entries) {
            isResponsive.value =
                entry.contentRect.width <
                FINAL_CONFIG.value.responsiveBreakpoint;
        }
        nextTick(measureTable);
    });
    if (tableContainer.value) tableObserver.observe(tableContainer.value);
});

onBeforeUnmount(() => {
    disposed = true;
    stopAnimation();
    clearTimeout(resumeTouchTimeout);
    tableObserver?.disconnect();
});

function generatePdf() {
    makePdf();
}

function toggleAnimation() {
    mutableConfig.value.showAnimation = !mutableConfig.value.showAnimation;
}

function generateCsv(callback = null) {
    nextTick(() => {
        const tableXls = [
            [FINAL_CONFIG.value.caption.text],
            props.dataset?.head || [],
            ...(props.dataset?.body || []),
        ];

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title:
                    FINAL_CONFIG.value.caption.text || 'vue-ui-carousel-table',
            });
        } else {
            callback(csvContent);
        }
    });
}

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: props.dataset,
    });
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.userOptions.callbacks.altCopy({
            config: FINAL_CONFIG.value,
            dataset: props.dataset,
        }),
    );
}

defineExpose({
    pauseAnimation,
    resumeAnimation,
    toggleAnimation,
    generateCsv,
    generatePdf,
    generateImage,
    copyAlt,
});
</script>

<template>
    <div
        class="vue-data-ui-component vue-ui-carousel-table"
        style="position: relative; overflow: visible"
        ref="chartContainer"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <div
            ref="tableContainer"
            :id="`carousel-table_${uid}`"
            :style="{
                height:
                    isPrinting || isImaging
                        ? 'auto'
                        : `${Math.max(rowHeight, maxTrHeight)}px`,
                containerType: 'inline-size',
                position: 'relative',
                overflow: 'auto',
                fontFamily: FINAL_CONFIG.style.fontFamily,
            }"
            :class="{
                'vue-ui-responsive': isResponsive,
                'is-playing':
                    FINAL_CONFIG.scrollbar.hide ||
                    (!isPaused && FINAL_CONFIG.scrollbar.showOnlyOnHover),
            }"
            @mouseenter="hovered = true"
            @mouseleave="hovered = false"
            @touchstart="pauseOnTouch()"
            @touchend="resumeAfterDelay()"
            @touchcancel="resumeAfterDelay()"
            @scroll="updateVisibility"
        >
            <table
                class="vue-data-ui-carousel-table"
                :aria-labelledby="`carousel-caption-${uid}`"
                v-if="isDataset"
                :style="{
                    ...FINAL_CONFIG.style,
                    border: `${FINAL_CONFIG.border.size}px solid ${FINAL_CONFIG.border.color}`,
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: FINAL_CONFIG.tbody.backgroundColor,
                }"
            >
                <caption
                    data-cy="caption"
                    ref="caption"
                    class="vue-data-ui-carousel-table-caption"
                    :id="`carousel-caption-${uid}`"
                    :style="{
                        ...FINAL_CONFIG.caption.style,
                        fontFamily: 'inherit',
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        paddingTop: FINAL_CONFIG.caption.padding.top + 'px',
                        paddingRight: FINAL_CONFIG.caption.padding.right + 'px',
                        paddingBottom:
                            FINAL_CONFIG.caption.padding.bottom + 'px',
                        paddingLeft: FINAL_CONFIG.caption.padding.left + 'px',
                        boxShadow: isResponsive
                            ? FINAL_CONFIG.thead.tr.style.boxShadow
                            : 'none',
                        minHeight: '36px',
                        display:
                            $slots.caption ||
                            FINAL_CONFIG.caption.text ||
                            FINAL_CONFIG.userOptions.show
                                ? ''
                                : 'none',
                    }"
                >
                    {{
                        FINAL_CONFIG.caption.text && !$slots.caption
                            ? FINAL_CONFIG.caption.text
                            : ''
                    }}
                    <slot name="caption" />
                </caption>

                <thead
                    role="rowgroup"
                    :style="{
                        ...FINAL_CONFIG.thead.style,
                        position: 'sticky',
                        top: `${$slots.caption || FINAL_CONFIG.caption.text || FINAL_CONFIG.userOptions.show ? captionHeight : 0}px`,
                        zIndex: 1,
                    }"
                >
                    <tr
                        ref="tableRow"
                        role="row"
                        :style="{
                            ...FINAL_CONFIG.thead.tr.style,
                            border: FINAL_CONFIG.thead.tr.border.size
                                ? `${FINAL_CONFIG.thead.tr.border.size}px solid ${FINAL_CONFIG.thead.tr.border.color}`
                                : 'none',
                            boxShadow: isResponsive
                                ? 'none'
                                : FINAL_CONFIG.thead.tr.style.boxShadow,
                        }"
                        :height="`${FINAL_CONFIG.thead.tr.height}px`"
                    >
                        <th
                            role="cell"
                            v-for="(th, i) in dataset.head"
                            :key="`th_${i}`"
                            :id="`col-${i}`"
                            scope="col"
                            :style="{
                                ...FINAL_CONFIG.thead.tr.th.style,
                                border: FINAL_CONFIG.thead.tr.th.border.size
                                    ? `${FINAL_CONFIG.thead.tr.th.border.size}px solid ${FINAL_CONFIG.thead.tr.th.border.color}`
                                    : 'none',
                                paddingTop:
                                    FINAL_CONFIG.thead.tr.th.padding.top + 'px',
                                paddingRight:
                                    FINAL_CONFIG.thead.tr.th.padding.right +
                                    'px',
                                paddingBottom:
                                    FINAL_CONFIG.thead.tr.th.padding.bottom +
                                    'px',
                                paddingLeft:
                                    FINAL_CONFIG.thead.tr.th.padding.left +
                                    'px',
                            }"
                        >
                            {{ $slots.th ? '' : th }}
                            <slot name="th" v-bind="{ th, colIndex: i }" />
                        </th>
                    </tr>
                </thead>

                <tbody
                    v-if="dataset.body && dataset.head"
                    ref="tbody"
                    aria-live="polite"
                    :style="{
                        clipPath: 'inset(0,0,0,0)',
                    }"
                >
                    <tr
                        v-for="(tr, i) in dataset.body"
                        :style="{
                            ...FINAL_CONFIG.tbody.tr.style,
                            border: `${FINAL_CONFIG.tbody.tr.border.size}px solid ${FINAL_CONFIG.tbody.tr.border.color}`,
                            verticalAlign: 'middle',
                        }"
                    >
                        <td
                            role="cell"
                            v-for="(td, j) in tr"
                            :data-cell="dataset.head[j] || ''"
                            :aria-label="`${dataset.head[j]}: ${td}`"
                            :style="{
                                ...FINAL_CONFIG.tbody.tr.td.style,
                                border: `${FINAL_CONFIG.tbody.tr.td.border.size}px solid ${FINAL_CONFIG.tbody.tr.td.border.color}`,
                                backgroundColor: setOpacity(
                                    FINAL_CONFIG.tbody.tr.td.style
                                        .backgroundColor,
                                    i % 2 === 0 &&
                                        FINAL_CONFIG.tbody.tr.td.alternateColor
                                        ? FINAL_CONFIG.tbody.tr.td
                                              .alternateOpacity * 100
                                        : 100,
                                ),
                                paddingTop:
                                    FINAL_CONFIG.tbody.tr.td.padding.top + 'px',
                                paddingRight:
                                    FINAL_CONFIG.tbody.tr.td.padding.right +
                                    'px',
                                paddingBottom:
                                    FINAL_CONFIG.tbody.tr.td.padding.bottom +
                                    'px',
                                paddingLeft:
                                    FINAL_CONFIG.tbody.tr.td.padding.left +
                                    'px',
                                verticalAlign: 'middle',
                            }"
                            :height="`${FINAL_CONFIG.tbody.tr.height}px`"
                        >
                            {{ $slots.td ? '' : td }}
                            <slot
                                name="td"
                                v-bind="{ td, rowIndex: i, colIndex: j }"
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'table',
            }"
        />

        <UserOptions
            :key="`user_option_${step}`"
            v-if="
                FINAL_CONFIG.userOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="false"
            :hasTable="false"
            :hasLabel="false"
            :isAnimation="!mutableConfig.showAnimation"
            :isFullscreen="isFullscreen"
            :chartElement="chartContainer"
            v-bind="
                getUserOptionsProps(
                    userOptionConfig,
                    'pdf csv img fullscreen altCopy animation',
                )
            "
            :zIndex="3"
            :offsetX="12"
            :isCursorPointer="isCursorPointer"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleAnimation="toggleAnimation"
            @toggleFullscreen="toggleFullscreen"
            @copyAlt="copyAlt"
            :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }"
        >
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionPdf optionCsv optionImg optionSvg optionAnimation optionFullscreen optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <div v-if="$slots.source" dir="auto">
            <slot name="source" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.vue-data-ui-carousel-table thead {
    position: sticky;
    top: 0;
    user-select: none;
}
thead th,
tbody td {
    word-wrap: break-word;
}

.vue-ui-responsive {
    th {
        display: none;
    }
    td {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        align-items: center;
        padding: 0.5rem 1rem;
        outline: none !important;
        text-align: left;
        height: max-content;
    }
    tr {
        height: fit-content;
    }

    td::before {
        content: attr(data-cell) ': ';
        font-weight: 700;
        text-transform: capitalize;
        font-size: 10px;
        height: auto;
    }
}

/* Chrome, Safari and Opera */
.is-playing::-webkit-scrollbar {
    display: none;
}

.is-playing {
    -ms-overflow-style: none; /* Edge */
    scrollbar-width: none; /* Firefox */
}
</style>

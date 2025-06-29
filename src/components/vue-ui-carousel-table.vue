<script setup>
import { ref, computed, onMounted, watch, nextTick, onBeforeUnmount, useSlots, defineAsyncComponent, shallowRef } from "vue";
import { useConfig } from "../useConfig";
import { useNestedProp } from "../useNestedProp";
import { 
    createCsvContent, 
    createUid, 
    downloadCsv, 
    error, 
    objectIsEmpty,
    setOpacity
} from "../lib";
import { usePrinter } from "../usePrinter";
import { useUserOptionState } from "../useUserOptionState";

const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_carousel_table: DEFAULT_CONFIG } = useConfig();

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
    }
})

const uid = ref(createUid());
const isFullscreen = ref(false);
const isDataset = ref(!!props.dataset);
const slots = useSlots();

onMounted(() => {
    prepareChart();
});

onMounted(() => {
    if (slots['chart-background']) {
        console.warn('VueUiCarouselTable does not support the #chart-background slot.')
    }
});

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCarouselTable',
            type: 'dataset'
        });
    } else {
        if (!props.dataset.head || objectIsEmpty(props.dataset.head)) {
            error({
                componentName: 'VueUiCarouselTable',
                type: 'datasetAttribute',
                property: 'head',
            });
            isDataset.value = false;
        }
        if (!props.dataset.body || objectIsEmpty(props.dataset.body)) {
            error({
                componentName: 'VueUiCarouselTable',
                type: 'datasetAttribute',
                property: 'body'
            });
            isDataset.value = false;
        }
    }
}

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
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
}, { deep: true });

watch(() => props.dataset, (_) => {
    setTrElements();
}, { deep: true })

const { isPrinting, isImaging, generatePdf: makePdf, generateImage } = usePrinter({
    elementId: `carousel-table_${uid.value}`,
    fileName: FINAL_CONFIG.value.caption.text || 'vue-ui-carousel-table',
    options: FINAL_CONFIG.value.userOptions.print
});

const mutableConfig = ref({
    showAnimation: FINAL_CONFIG.value.animation.use
});

const tableContainer = ref(null);
const chartContainer = ref(null);
const caption = ref(null);
const tableRow = ref(null);

const captionHeight = ref(0);
const tableRowHeight = ref(0);
const isResponsive = ref(false);

const tbody = ref(null);
const allTr = ref(null);
const scrollIndex = ref(0);

function setTrElements() {
    if (tbody.value) {
        allTr.value = {
            elements: tbody.value.getElementsByTagName('tr'),
            heights: Array.from(tbody.value.getElementsByTagName('tr')).map(el => el.getBoundingClientRect().height)
        }
    }
}

onMounted(setTrElements);

const maxTrHeight = computed(() => {
    if(!allTr.value || !allTr.value.heights.length) return 0;
    return Math.max(...allTr.value.heights) + captionHeight.value + tableRowHeight.value;
})

const visibleCells = computed(() => {
    if(!props.dataset.body) return 0;
    return FINAL_CONFIG.value.tbody.tr.visible <= props.dataset.body.length ? FINAL_CONFIG.value.tbody.tr.visible :props.dataset.body.length;
});

const rowHeight = computed(() => {
    return ((FINAL_CONFIG.value.tbody.tr.height + FINAL_CONFIG.value.tbody.tr.td.padding.top + FINAL_CONFIG.value.tbody.tr.td.padding.bottom + FINAL_CONFIG.value.tbody.tr.border.size * 2) * visibleCells.value + captionHeight.value + tableRowHeight.value)
});

const init = ref(0);
const raf = ref(null);
const lastTimestamp = ref(0);
const isPaused = ref(false);
const step = ref(0);

onMounted(() => {
    if(caption.value) {
        captionHeight.value = caption.value.getBoundingClientRect().height;
    }

    if (tableRow.value) {
        tableRowHeight.value = tableRow.value.getBoundingClientRect().height;
    }

    if (mutableConfig.value.showAnimation && !!allTr.value) {
        startAnimation();
    }
});


onMounted(() => {
    if (tableContainer.value) {
        const thead = tableContainer.value.querySelector('thead');
        const trElements = Array.from(tbody.value.querySelectorAll('tr'));

        function updateVisibility() {
            const theadBottom = thead.getBoundingClientRect().bottom;
            trElements.forEach(tr => {
                const trTop = tr.getBoundingClientRect().top;
                if (trTop < theadBottom) {
                    tr.style.visibility = 'hidden';
                } else {
                    tr.style.visibility = 'visible';
                }
            });
        }

        tableContainer.value.addEventListener('scroll', updateVisibility);
        updateVisibility();
    
        onBeforeUnmount(() => {
            tableContainer.value.removeEventListener('scroll', updateVisibility);
        });
    }
});

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
} 

function startAnimation() {
    if (!raf.value && !isPaused.value) {
        if (FINAL_CONFIG.value.animation.type === 'scroll') {
            raf.value = requestAnimationFrame(animate);
        } else {
            raf.value = requestAnimationFrame(animateMarquee);
        }
    }
}

function hasReachedScrollBottom() {
    if(!tableContainer.value) return false;
    const { scrollTop, scrollHeight, clientHeight } = tableContainer.value;
    return scrollTop + clientHeight >= scrollHeight;
}

function animate(timestamp) {
    if (isPaused.value) return;
    if (!lastTimestamp.value) lastTimestamp.value = timestamp;

    const deltaTime = timestamp - lastTimestamp.value;

    if (deltaTime >= FINAL_CONFIG.value.animation.speedMs) {
        init.value += allTr.value.heights[scrollIndex.value];
        if (hasReachedScrollBottom() || scrollIndex.value >= allTr.value.heights.length) {
            init.value = 0;
            scrollIndex.value = -1;
        } 

        scrollIndex.value += 1;
        if (tableContainer.value) {
            tableContainer.value.scrollTo({
                top: init.value,
                behavior: 'smooth'
            });
        }

        lastTimestamp.value = timestamp;
    }

    raf.value = requestAnimationFrame(animate);
}

function animateMarquee(timestamp) {
    if (isPaused.value) return;
    if (!lastTimestamp.value) lastTimestamp.value = timestamp;

    const deltaTime = timestamp - lastTimestamp.value;
    const marqueeSpeed = (FINAL_CONFIG.value.animation.speedMs / 4) / 1000;

    if (deltaTime >= marqueeSpeed) {
        init.value += marqueeSpeed;
        if (init.value >= (tableContainer.value.scrollHeight - tableContainer.value.clientHeight)) {
            init.value = 0;
        }
        if (tableContainer.value) {
            tableContainer.value.scrollTo({
                top: init.value,
                behavior: 'auto',
            });
        }
        lastTimestamp.value = timestamp;
    }
    raf.value = requestAnimationFrame(animateMarquee);
}

function pauseAnimation() {
    isPaused.value = true;
    cancelAnimationFrame(raf.value);
    raf.value = null;
}

onBeforeUnmount(pauseAnimation)

function resumeAnimation() {
    if (!isPaused.value || !mutableConfig.value.showAnimation) return;
    isPaused.value = false;
    lastTimestamp.value = 0; 
    startAnimation();
}

function pauseOnHover() {
    if(!FINAL_CONFIG.value.animation.pauseOnHover) return;
    pauseAnimation();
}

const resumeTouchTimeout = ref(null);

function pauseOnTouch() {
    pauseAnimation();
    clearTimeout(resumeTouchTimeout.value);
}

function resumeAfterDelay() {
    clearTimeout(resumeTouchTimeout.value);
    resumeTouchTimeout.value = setTimeout(resumeAnimation, 1000);
}

watch(
    () => FINAL_CONFIG.value.animation.use,
    (newVal) => {
        if (newVal) {
            mutableConfig.value.showAnimation = true;
            resumeAnimation();
        } else {
            mutableConfig.value.showAnimation = false;
            pauseAnimation();
        }
    }
);

watch(
    () => FINAL_CONFIG.value.animation.type,
    (_newVal) => {
        pauseAnimation();
        init.value = 0;
        scrollIndex.value = 0;
        tableContainer.value.scrollTo({
            top: 0,
            behavior: 'auto',
        });
        resumeAnimation();
    }
    );

const breakpoint = computed(() => FINAL_CONFIG.value.responsiveBreakpoint);

const tableObserver = shallowRef(null);

onMounted(() => {
    tableObserver.value = new ResizeObserver((entries) => {
        entries.forEach(entry => {
            isResponsive.value = entry.contentRect.width < breakpoint.value;
        })
        captionHeight.value = caption.value ? caption.value.getBoundingClientRect().height : 0;
        tableRowHeight.value = tableRow.value ? tableRow.value.getBoundingClientRect().height : 0;
        scrollIndex.value = 0;
        nextTick(() => {
            pauseAnimation();
            lastTimestamp.value = 0;
            init.value = 0;
            setTrElements();
            resumeAnimation();
        });
    })
    if(tableContainer.value) {
        tableObserver.value.observe(tableContainer.value);
    }     
});

onBeforeUnmount(() => {
    if (tableObserver.value) {
        tableObserver.value.disconnect();
    }
})

function generatePdf() {
    makePdf();
}

function toggleAnimation() {
    mutableConfig.value.showAnimation = !mutableConfig.value.showAnimation;
    if (!mutableConfig.value.showAnimation) {
        pauseAnimation();
    } else {
        resumeAnimation();
    }
}

function generateCsv() {
    nextTick(() => {
        const labels = props.dataset.head.map((_, i) => {
            return [
                [props.dataset.body[i]]
            ]
        });

        const tableXls = [
            [FINAL_CONFIG.value.caption.text],
            [props.dataset.head.map(h => [h])]
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        downloadCsv({
            csvContent,
            title: FINAL_CONFIG.value.caption.text || 'vue-ui-carousel-table'
        });
    });
}

defineExpose({
    pauseAnimation,
    resumeAnimation,
    toggleAnimation,
    generateCsv,
    generatePdf,
    generateImage,
});

</script>

<template>
    <div class="vue-ui-carousel-table" style="position:relative; overflow:visible;" ref="chartContainer" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <div 
            ref="tableContainer"
            :id="`carousel-table_${uid}`"
            :style="{
                height: isPrinting || isImaging ? 'auto' : `${Math.max(rowHeight, maxTrHeight)}px`,
                containerType: 'inline-size',
                position: 'relative',
                overflow: 'auto',
                fontFamily: FINAL_CONFIG.fontFamily
            }"
            :class="{ 'vue-ui-responsive' : isResponsive, 'is-playing': FINAL_CONFIG.scrollbar.hide || (!isPaused && FINAL_CONFIG.scrollbar.showOnlyOnHover) }"
            @mouseover="pauseOnHover()"
            @mouseleave="resumeAnimation()"
            @touchstart="pauseOnTouch()"
            @touchend="resumeAfterDelay()"
            @touchcancel="resumeAfterDelay()"
        >
            <table 
                class="vue-data-ui-carousel-table"
                v-if="isDataset"
                :style="{ 
                    ...FINAL_CONFIG.style,
                    border: `${FINAL_CONFIG.border.size}px solid ${FINAL_CONFIG.border.color}`,
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: FINAL_CONFIG.tbody.backgroundColor
                }">
                <caption
                    data-cy="caption"
                    ref="caption"
                    class="vue-data-ui-carousel-table-caption" 
                    :style="{
                        ...FINAL_CONFIG.caption.style, 
                        fontFamily: 'inherit',
                        position: 'sticky',
                        top: 0,
                        zIndex: 2,
                        paddingTop: FINAL_CONFIG.caption.padding.top + 'px',
                        paddingRight: FINAL_CONFIG.caption.padding.right + 'px',
                        paddingBottom: FINAL_CONFIG.caption.padding.bottom +'px',
                        paddingLeft: FINAL_CONFIG.caption.padding.left + 'px',
                        boxShadow: isResponsive ? FINAL_CONFIG.thead.tr.style.boxShadow : 'none',
                        minHeight: '36px',
                        display: $slots.caption || FINAL_CONFIG.caption.text || FINAL_CONFIG.userOptions.show ? '' : 'none'
                    }">
                    {{ FINAL_CONFIG.caption.text && !$slots.caption ? FINAL_CONFIG.caption.text : '' }}
                    <slot name="caption"/>
                </caption>
    
                <thead :style="{ ...FINAL_CONFIG.thead.style, position: 'sticky', top: `${$slots.caption || FINAL_CONFIG.caption.text || FINAL_CONFIG.userOptions.show ? captionHeight : 0}px`, zIndex: 1 }">
                    <tr
                        ref="tableRow"
                        role="row" 
                        :style="{ 
                            ...FINAL_CONFIG.thead.tr.style,
                            border: FINAL_CONFIG.thead.tr.border.size ? `${FINAL_CONFIG.thead.tr.border.size}px solid ${FINAL_CONFIG.thead.tr.border.color}` : 'none',
                            boxShadow: isResponsive ? 'none' : FINAL_CONFIG.thead.tr.style.boxShadow,
                        }" 
                        :height="`${FINAL_CONFIG.thead.tr.height}px`"
                    >
                        <th 
                            role="cell" 
                            v-for="(th, i) in dataset.head" 
                            :key="`th_${i}`" 
                            :style="{
                                ...FINAL_CONFIG.thead.tr.th.style,
                                border: FINAL_CONFIG.thead.tr.th.border.size ? `${FINAL_CONFIG.thead.tr.th.border.size}px solid ${FINAL_CONFIG.thead.tr.th.border.color}` : 'none',
                                paddingTop: FINAL_CONFIG.thead.tr.th.padding.top + 'px',
                                paddingRight: FINAL_CONFIG.thead.tr.th.padding.right + 'px',
                                paddingBottom: FINAL_CONFIG.thead.tr.th.padding.bottom + 'px',
                                paddingLeft: FINAL_CONFIG.thead.tr.th.padding.left + 'px',
                            }"
                        >
                            {{ $slots.th ? '' : th }}
                            <slot name="th" v-bind="{ th, colIndex: i }"/>
                        </th>
                    </tr>
                </thead>
    
                <tbody 
                    v-if="dataset.body && dataset.head" ref="tbody"
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
                            :style="{ 
                                ...FINAL_CONFIG.tbody.tr.td.style,
                                border: `${FINAL_CONFIG.tbody.tr.td.border.size}px solid ${FINAL_CONFIG.tbody.tr.td.border.color}`,
                                backgroundColor: setOpacity(FINAL_CONFIG.tbody.tr.td.style.backgroundColor, (i % 2 === 0 && FINAL_CONFIG.tbody.tr.td.alternateColor) ? FINAL_CONFIG.tbody.tr.td.alternateOpacity * 100 : 100),
                                paddingTop: FINAL_CONFIG.tbody.tr.td.padding.top + 'px',
                                paddingRight: FINAL_CONFIG.tbody.tr.td.padding.right + 'px',
                                paddingBottom: FINAL_CONFIG.tbody.tr.td.padding.bottom + 'px',
                                paddingLeft: FINAL_CONFIG.tbody.tr.td.padding.left + 'px',
                                verticalAlign: 'middle'
                            }" 
                            :height="`${FINAL_CONFIG.tbody.tr.height}px`"
                        >
                            {{ $slots.td ? '' : td }}
                            <slot name="td" v-bind="{ td, rowIndex: i, colIndex: j}"/>
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
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="false"
            :hasLabel="false"
            :hasAnimation="FINAL_CONFIG.userOptions.buttons.animation"
            :isAnimation="!mutableConfig.showAnimation"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="chartContainer"
            :position="FINAL_CONFIG.userOptions.position"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :zIndex="3"
            :offsetX="12"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleAnimation="toggleAnimation"
            @toggleFullscreen="toggleFullscreen"
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
            <template #optionAnimation v-if="$slots.optionAnimation">
                <slot name="optionAnimation" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>
    </div>
</template>

<style scoped lang="scss">
.vue-ui-data-carousel-table thead {
    position: sticky;
    top:0;
    user-select: none;
}
thead th, tbody td {
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
        height:max-content;
    }
    tr {
        height: fit-content;
    }

    td::before {
        content: attr(data-cell) ": ";
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
    -ms-overflow-style: none;  /* Edge */
    scrollbar-width: none;  /* Firefox */
}
</style>

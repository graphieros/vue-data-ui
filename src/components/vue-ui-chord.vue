<script setup>
import { 
    ref, 
    computed, 
    onMounted, 
    onBeforeUnmount, 
    watch, 
    nextTick, 
    defineAsyncComponent,
    shallowRef,
    toRefs
} from 'vue';
import { 
    adaptColorToBackground, 
    applyDataLabel, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createTSpansFromLineBreaksOnY, 
    createUid, 
    dataLabel, 
    downloadCsv, 
    error, 
    getMissingDatasetAttributes, 
    objectIsEmpty, 
    palette, 
    themePalettes, 
    treeShake, 
    wrapText, 
    XMLNS 
} from '../lib';
import { throttle } from '../canvas-lib';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { useSvgExport } from '../useSvgExport';
import { useNestedProp } from '../useNestedProp';
import { useResponsive } from '../useResponsive';
import { useThemeCheck } from '../useThemeCheck';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import img from '../img';
import Shape from '../atoms/Shape.vue';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from "../themes/vue_ui_chord.json";
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import BaseScanner from '../atoms/BaseScanner.vue';

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_chord: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    dataset: {
        type: Object,
        default() {
            return {}
        }
    },
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const emit = defineEmits(['selectLegend', 'selectGroup', 'selectRibbon']);

const isDataset = ref(!!props.dataset && Object.hasOwn(props.dataset, 'matrix'))

const uid = ref(createUid());
const selectedGroup = ref(null);
const selectedRibbon = ref(null);
const selectedLegendId = ref(null);
const step = ref(0);
const chordChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const loaded = ref(false);
const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

const FINAL_CONFIG = ref(prepareConfig());

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            useCssAnimation: false,
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    legend: {
                        backgroundColor: 'transparent',
                    },
                    arcs: {
                        stroke: '#6A6A6A',
                        labels: {
                            show: false,
                        }
                    },
                    ribbons: {
                        stroke: '#6A6A6A',
                        underlayerOpacity: 0,
                        labels: {
                            show: false,
                        }
                    }
                }
            }
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {}
    })
});

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await nextTick();
            mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        })
    },
    skeletonDataset: props.config?.skeletonDataset ?? {
        matrix: [
            [ 12000, 6000, 9000, 3000],
            [ 2000, 10000, 2000, 6001], 
            [ 8000, 1600, 8000, 8001], 
            [ 1000, 1000, 1000, 7001]  
        ],
        labels: [],
        colors: ['#DBDBDB', '#C4C4C4', '#ADADAD', '#969696']
    },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value
    })
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `chord_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-chord',
    options: FINAL_CONFIG.value.userOptions.print
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused
    });

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length ? finalConfig.customPalette : themePalettes[theme] || palette
    };
}

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
    // Reset mutable config
    rotation.value = FINAL_CONFIG.value.initialRotation;
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

const debug = computed(() => FINAL_CONFIG.value.debug);

watch(() => props.dataset, () => {
    validateRawDataset();
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
});

function validateRawDataset() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiChord',
            type: 'dataset',
            debug: debug.value
        });
        isDataset.value = false;
        manualLoading.value = true;
        return;
    }

    const missing = getMissingDatasetAttributes({
        datasetObject: props.dataset,
        requiredAttributes: ['matrix']
    });

    if (missing.length) {
        missing.forEach(attr => {
            error({
                componentName: 'VueUiChord',
                type: 'datasetAttribute',
                property: attr,
                debug: debug.value
            });
        });
        isDataset.value = false;
        manualLoading.value = true;
        return;
    }

    const m = props.dataset.matrix;
    if (!Array.isArray(m) || m.length < 2) {
        console.warn(`VueUiChord: dataset.matrix requires a minimum of 2 datapoints, for example:
        
matrix:[
    [1, 1],
    [1, 1]
]`);
        isDataset.value = false;
        manualLoading.value = true;
        return;
    }

    const n = m.length;
    const badIdx = m.findIndex(row => !Array.isArray(row) || row.length !== n);
    if (badIdx !== -1) {
        console.warn(
            `VueUiChord - Invalid matrix: dataset.matrix at index ${badIdx} has ${Array.isArray(m[badIdx]) ? m[badIdx].length : 'NaN'} elements instead of the required ${n}

dataset.matrix[${badIdx}] = [${Array.isArray(m[badIdx]) ? m[badIdx].toString() : 'invalid'}]`
        );
        isDataset.value = false;
        manualLoading.value = true;
        return;
    }

    isDataset.value = true;
    manualLoading.value = false;
}

function prepareChart() {
    validateRawDataset();

    if (FINAL_CONFIG.value.responsive) {
        const resizeHandler = throttle(() => {
            const { width, height, heightNoTitle, heightSource, heightTitle, heightLegend } = useResponsive({
                chart:  chordChart.value,
                title:  FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value,
            });
    
            const otherH = heightTitle + heightLegend + heightSource + heightNoTitle;
    
        if (width < height) {
            chordChart.value.style.width = `100%`;
        } else {
            chordChart.value.style.height = `100%`;
            svgRef.value.style.height = `calc(100% - ${otherH}px)`;
            }
        }, 100);

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }
    
        resizeObserver.value = new ResizeObserver(resizeHandler);
        observedEl.value = chordChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);

        resizeHandler();
    }

    loadingTimeout.value = setTimeout(() => {
        loaded.value = true;
    }, 500)
}

function checkDataset(){
    if (!FINAL_DATASET.value || !Object.hasOwn(FINAL_DATASET.value, 'matrix') || FINAL_DATASET.value.matrix.length < 2) {
        console.warn(`VueUiChord: dataset.matrix requires a minimum of 2 datapoints, for example:\n\nmatrix:[\n  [1, 1],\n  [1, 1]\n]`);
        isDataset.value = false;
        return;
    }

    FINAL_DATASET.value.matrix.forEach((m, i) => {
        if (m.length !== FINAL_DATASET.value.matrix.length) {
            console.warn(`VueUiChord - Invalid matrix: dataset.matrix at index ${i} has ${m.length} elements instead of the required ${FINAL_DATASET.value.matrix.length}\n\ndataset.matrix[${i}] = [${m.toString()}] has a length of ${m.length} but should have the same length as the matrix itself (${FINAL_DATASET.value.matrix.length})`);
            isDataset.value = false;
        }
    });
}

const loadingTimeout = ref(null);

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

const svg = ref({
    height: 600,
    width: 600
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const radii = computed(() => {
    return {
        inner: svg.value.width * 0.3 * FINAL_CONFIG.value.style.chart.arcs.innerRadiusRatio,
        outer: svg.value.width * 0.34 * FINAL_CONFIG.value.style.chart.arcs.outerRadiusRatio,
    }
});

const paddingAngle = computed(() => {
    return FINAL_CONFIG.value.style.chart.arcs.padAngle / 100;
});

const formattedDataset = computed(() => {
    return {
        matrix: FINAL_DATASET.value.matrix ?? [[0]],
        labels: FINAL_DATASET.value.labels ?? [''],
        colors: FINAL_DATASET.value.colors && Array.isArray(FINAL_DATASET.value.colors) && FINAL_DATASET.value.colors.length
            ? FINAL_DATASET.value.colors.map(c => convertColorToHex(c))
            : FINAL_DATASET.value.matrix.map((_m, i) => {
                return customPalette.value[i] || palette[i] || palette[i % palette.length]
            })
    }
});

function computeChord(matrix, padAngle) {
    const n = matrix.length;
    const r = radii.value.inner;

    const groupSums = new Array(n).fill(0);
    let totalSum = 0;
    for (let i = 0; i < n; i += 1) {
        for (let j = 0; j < n; j += 1) {
            groupSums[i] += matrix[i][j];
            totalSum += matrix[i][j];
        }
    }

    const k = (2 * Math.PI - padAngle * n) / totalSum;

    const groups = [];
    let currentAngle = 0;
    for (let i = 0; i < n; i += 1) {
        const startAngle = currentAngle;
        const endAngle = startAngle + groupSums[i] * k;
        groups.push({ 
            index: i,
            pattern: `pattern_${uid.value}_${i}`,
            startAngle, 
            endAngle, 
            name: formattedDataset.value.labels[i], 
            id: createUid(),
            color: formattedDataset.value.colors[i],
            proportion: groupSums[i] / totalSum
        });
        currentAngle = endAngle + padAngle;
    }

    const subgroups = [];
    for (let i = 0; i < n; i += 1) {
        const entries = matrix[i].map((v, j) => ({ j, v }));
        entries.sort((a, b) => b.v - a.v);
        let angle = groups[i].startAngle;
        for (const { j, v } of entries) {
            const startAngle = angle;
            const endAngle = startAngle + v * k;
            subgroups.push({
                index: i,
                subIndex: j,
                pattern: `pattern_${uid.value}_${i}`,
                startAngle,
                endAngle,
                value: v,
                groupName: formattedDataset.value.labels[i],
                groupId: groups[i].id,
                groupColor: formattedDataset.value.colors[i],
                midAngle: (startAngle + endAngle) / 2,
                midBaseX: Math.cos((startAngle + endAngle) / 2 - Math.PI / 2) * r,
                midBaseY: Math.sin((startAngle + endAngle) / 2 - Math.PI / 2) * r
            });
            angle = endAngle;
        }
    }

    const chords = [];
    for (const a of subgroups) {
        const b = subgroups.find(
            (s) => s.index === a.subIndex && s.subIndex === a.index
        );
        chords.push({ source: a, target: b, id: createUid() });
    }
    return { groups, chords };
}

const chordData = computed(() => {
    const layout = computeChord(formattedDataset.value.matrix, paddingAngle.value);
    checkDataset();
    layout.chords.sort((a, b) =>
        Math.max(b.source.value, b.target.value)
        - Math.max(a.source.value, a.target.value)
    );
    return layout;
});

const rawValueLabels = computed(() => {
    const R = radii.value.outer + FINAL_CONFIG.value.style.chart.ribbons.labels.offset + 12;
    const fontSize = FINAL_CONFIG.value.style.chart.ribbons.labels.fontSize;
    const charWidth = fontSize * 0.6;
    const out = [];

    if (selectedRibbon.value) {
        const c = selectedRibbon.value;

        // Always show the source end
        if (c.source.value) {
            const txt = String(c.source.value);
            out.push({
                id: c.id + "-src",
                theta: c.source.midAngle,
                w: (txt.length * charWidth) / R,
                midBaseX: c.source.midBaseX,
                midBaseY: c.source.midBaseY,
                groupColor: c.source.groupColor,
                value: c.source.value,
            });
        }

        // Only show the target end if its value differs
        if (c.target && c.target.value && c.target.value !== c.source.value) {
            const txt = String(c.target.value);
            out.push({
                id: c.id + "-tgt",
                theta: c.target.midAngle,
                w: (txt.length * charWidth) / R,
                midBaseX: c.target.midBaseX,
                midBaseY: c.target.midBaseY,
                groupColor: c.target.groupColor,
                value: c.target.value,
            });
        }

        return out;
    }

    function segregateById(id) {
        chordData.value.chords
        .filter(c => c.source.groupId === id && c.source.value)
        .forEach(c => {
            // Always show the source end
            {
                const txt = String(c.source.value);
                out.push({
                    id: c.id + "-src",
                    theta: c.source.midAngle,
                    w: (txt.length * charWidth) / R,
                    midBaseX: c.source.midBaseX,
                    midBaseY: c.source.midBaseY,
                    groupColor: c.source.groupColor,
                    value: c.source.value,
                });
            }
            // Only show the target end if its value differs
            if (c.target && c.target.value && c.target.value !== c.source.value) {
            const txt = String(c.target.value);
            out.push({
                id: c.id + "-tgt",
                theta: c.target.midAngle,
                w: (txt.length * charWidth) / R,
                midBaseX: c.target.midBaseX,
                midBaseY: c.target.midBaseY,
                groupColor: c.target.groupColor,
                value: c.target.value,
            });
            }
        });
    }

    if (selectedLegendId.value) {
        segregateById(selectedLegendId.value);
    }

    if (selectedGroup.value) {
        segregateById(selectedGroup.value.id);
    }
    return out;
});

const separatedValueLabels = computed(() => {
    const arr = rawValueLabels.value
        .map(d => ({ ...d }))
        .sort((a, b) => a.theta - b.theta);

    const pad = FINAL_CONFIG.value.style.chart.ribbons.labels.minSeparationDeg * Math.PI / 180;
    let changed = true;
    let loops = 0;

    while (changed && loops++<10) {
        changed = false
        for (let i = 1; i < arr.length; i += 1){
            const prev = arr[i - 1], cur = arr[i];
            const need = prev.theta + prev.w + pad;

            if (cur.theta < need) { 
                cur.theta = need; 
                changed = true;
            }
        }
        const first = arr[0], last = arr[arr.length - 1];
        const wrap = last.theta + last.w + pad - 2 * Math.PI;

        if (first.theta < wrap) { 
            first.theta = wrap; 
            changed = true;
        }
    }
    return arr;
});


function arcPath(startAngle, endAngle, R, r) {
    const a0 = startAngle - Math.PI / 2;
    const a1 = endAngle - Math.PI / 2;

    // From outer radius
    const x0 = Math.cos(a0) * R;
    const y0 = Math.sin(a0) * R;
    const x1 = Math.cos(a1) * R;
    const y1 = Math.sin(a1) * R;

    // From inner radius
    const x2 = Math.cos(a1) * r;
    const y2 = Math.sin(a1) * r;
    const x3 = Math.cos(a0) * r;
    const y3 = Math.sin(a0) * r;

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    return (
        `M${x0},${y0} ` +
        `A${R},${R} 0 ${largeArc} 1 ${x1},${y1} ` +
        `L${x2},${y2} ` +
        `A${r},${r} 0 ${largeArc} 0 ${x3},${y3} Z`
    );
}

function ribbonPath(s, t) {
    const r = radii.value.inner;
    const sa0 = s.startAngle - Math.PI / 2;
    const sa1 = s.endAngle - Math.PI / 2;
    const ta0 = t.startAngle - Math.PI / 2;
    const ta1 = t.endAngle - Math.PI / 2;

    // Coordinates
    const sx0 = Math.cos(sa0) * r;
    const sy0 = Math.sin(sa0) * r;
    const sx1 = Math.cos(sa1) * r;
    const sy1 = Math.sin(sa1) * r;
    const tx0 = Math.cos(ta0) * r;
    const ty0 = Math.sin(ta0) * r;
    const tx1 = Math.cos(ta1) * r;
    const ty1 = Math.sin(ta1) * r;

    const largeArc0 = s.endAngle - s.startAngle > Math.PI ? 1 : 0;
    const largeArc1 = t.endAngle - t.startAngle > Math.PI ? 1 : 0;

    return (
        `M${sx0},${sy0}` +
        `A${r},${r} 0 ${largeArc0} 1 ${sx1},${sy1}` +
        `Q0,0 ${tx0},${ty0}` +
        `A${r},${r} 0 ${largeArc1} 1 ${tx1},${ty1}` +
        `Q0,0 ${sx0},${sy0}Z`
    );
}

const rotationRad = computed(() => rotation.value * Math.PI / 180);

function midAngle(g) {
    return (g.startAngle + g.endAngle) / 2;
}

function rotatedMidAngle(g) {
    const m = midAngle(g) + rotationRad.value;
    return ((m % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

function labelSide(theta) {
    let a = theta + rotationRad.value;
    a = ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return a > Math.PI ? 'end' : 'start';
}

function labelTransform(angle) {
    const a = angle - Math.PI / 2;
    const x = Math.cos(a) * (radii.value.outer + FINAL_CONFIG.value.style.chart.arcs.labels.offset + 24);
    const y = Math.sin(a) * (radii.value.outer + FINAL_CONFIG.value.style.chart.arcs.labels.offset + 24);
    return `translate(${x},${y})`;
}

function labelArcPath(a0, a1, R) {
    const s = a0 - Math.PI / 2;
    const e = a1 - Math.PI / 2;
    const x1 = Math.cos(s) * R;
    const y1 = Math.sin(s) * R;
    const x2 = Math.cos(e) * R;
    const y2 = Math.sin(e) * R;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    return `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2}`;
}

const rotation = ref(FINAL_CONFIG.value.initialRotation);
const dragging = ref(false);
let startRotate = 0;
let startAngle = 0;

function getMouseAngle(event) {
    const rect = svgRef.value.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const x = event.clientX ?? event.touches[0].clientX;
    const y = event.clientY ?? event.touches[0].clientY;
    return Math.atan2(y - cy, x - cx);
}

function onDown(e) {
    if (!FINAL_CONFIG.value.enableRotation || isAnnotator.value) return;
    e.preventDefault();
    dragging.value = true;
    startRotate = rotation.value;
    startAngle = getMouseAngle(e);
}

function onMove(e) {
    if (!dragging.value) return;
    const angle = getMouseAngle(e);
    rotation.value = startRotate + ((angle - startAngle) * 180) / Math.PI;
}

function onUp() {
    dragging.value = false;
}

function getLabel(v) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.ribbons.labels.formatter,
        v,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.ribbons.labels.prefix,
            v,
            s: FINAL_CONFIG.value.style.chart.ribbons.labels.suffix,
            r: FINAL_CONFIG.value.style.chart.ribbons.labels.rounding
        })
    );
}

onMounted(() => {
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
});

onBeforeUnmount(() => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onUp);
    clearTimeout(loadingTimeout.value);
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function selectGroup(group, index) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: group, seriesIndex: index });
    }
    if (selectedLegendId.value) return;
    selectedGroup.value = group;
}

function onGroupLeave(group, index) {
    selectedGroup.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: group, seriesIndex: index });
    }
}

function onGroupClick(group, index) {
    emit('selectGroup', group);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: group, seriesIndex: index });
    }
}

function selectRibbon(ribbon, index) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: ribbon, seriesIndex: index });
    }
    if (selectedLegendId.value) return;
    selectedRibbon.value = ribbon;
}

function onRibbonLeave(ribbon, index) {
    selectedRibbon.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: ribbon, seriesIndex: index });
    }
}

function onRibbonClick(ribbon, index) {
    emit('selectRibbon', ribbon);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: ribbon, seriesIndex: index });
    }
}

function getRibbonOpacity(ribbon) {
    const noSelection =
        !selectedLegendId.value &&
        !selectedGroup.value &&
        !selectedRibbon.value;

    if (noSelection) return 0.8;

    const isMatch = selectedLegendId.value
        ? selectedLegendId.value === ribbon.source.groupId
        : selectedGroup.value
        ? selectedGroup.value.id === ribbon.source.groupId
        : selectedRibbon.value?.id === ribbon.id;

    return isMatch ? 1 : 0.1;
}

function getGroupOpacity(group) {
    const noSelection =
        !selectedLegendId.value &&
        !selectedGroup.value &&
        !selectedRibbon.value;

    if (noSelection) return 1;

    const isMatch = selectedLegendId.value
        ? selectedLegendId.value === group.id
        : selectedGroup.value
        ? selectedGroup.value.id === group.id
        : [selectedRibbon.value?.source.groupId, selectedRibbon.value?.target.groupId]
            .includes(group.id);

    return isMatch ? 1 : 0.3;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function getData() {
    return chordData.value;
}

const raf = ref(null);
function resetRotation() {
    const target = FINAL_CONFIG.value.initialRotation;
    if (raf.value !== null) {
        cancelAnimationFrame(raf.value);
    }
    const step = () => {
        const ease = 0.05;
        rotation.value += (target - rotation.value) * ease;
        if (Math.abs(rotation.value - target) < 0.1) {
            rotation.value = target;
            raf.value = null;
        } else {
            raf.value = requestAnimationFrame(step);
        }
    }
    raf.value = requestAnimationFrame(step);
}

onBeforeUnmount(() => {
    if (raf.value !== null) {
        cancelAnimationFrame(raf.value);
    }
});

function selectLegendItem(itemId) {
    if (itemId === selectedLegendId.value) {
        selectedLegendId.value = null;
        emit('selectLegend', null);
    } else {
        selectedLegendId.value = itemId;
        emit('selectLegend', chordData.value.groups.find(g => g.id === itemId));
    }
}

const legendSet = computed(() => {
    return chordData.value.groups.map((g, i) => {
        return {
            name: g.name,
            color: g.color,
            shape: 'circle',
            patternIndex: i,
            pattern: `pattern_${uid.value}_${i}`,
            id: g.id,
            select: () => selectLegendItem(g.id),
            opacity: selectedLegendId.value ? selectedLegendId.value === g.id ? 1 : 0.3 : 1
        }
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'chord-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

const table = computed(() => {
    const head = chordData.value.groups.map((g, i) => {
        return {
            name: g.name || i,
            color: g.color
        }
    });

    const body = formattedDataset.value.matrix;
    return { head, body };
});

const dataTable = computed(() => {
    const head = [{ name: '', color: null }, ...table.value.head];
    const body = table.value.body.map((b,i) => {
        return [
            table.value.head[i],
            ...table.value.body[i]
        ]
    })
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
    const colNames = head;

    return {
        colNames,
        head,
        body,
        config
    }
});

function generateCsv(callback=null) {
    nextTick(() => {
        const rows = formattedDataset.value.matrix.map((m, i) => {
            return [
                [formattedDataset.value.labels[i] || i],
                m
            ]
        });

        const tableXls = [
            [FINAL_CONFIG.value.style.chart.title.text],
            [FINAL_CONFIG.value.style.chart.title.subtitle.text],
            [
                [''],
                ...formattedDataset.value.labels.map((l, i) => [l || i]),
            ]
        ].concat(rows);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-chord" })
        } else {
            callback(csvContent);
        }
    });
}

async function getImage({ scale = 2} = {}) {
    if (!chordChart.value) return
    const { width, height } = chordChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: chordChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

function getArcLabel(group, index) {
    return `${formattedDataset.value.labels[index]}${FINAL_CONFIG.value.style.chart.arcs.labels.showPercentage ? dataLabel({
        p: ' (',
        v: isNaN(group.proportion) ? 0 : group.proportion * 100,
        s: '%)',
        r: FINAL_CONFIG.value.style.chart.arcs.labels.roundingPercentage
    }) : ''}`
}

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: chordChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8)
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
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
});

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: legendSet,
    backgroundColor: svgBg
});

async function generateSvg({ isCb }) {
    isCallbackSvg.value = true;

    await nextTick();

    try {
        if (isCb) {
            const { blob, url, text, dataUrl } = await getSvg();
            await Promise.resolve(FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl }));
        } else {
            await Promise.resolve(exportSvg());
        }
    } finally {
        isCallbackSvg.value = false;
    }
}

function onGenerateImage(payload) {
    if (payload?.stage === "start") {
        isCallbackImaging.value = true;
        return;
    }

    if (payload?.stage === "end") {
        isCallbackImaging.value = false;
        return;
    }

    generateImage();
}

defineExpose({
    getData,
    getImage,
    generateCsv,
    generateImage,
    generateSvg,
    generatePdf,
    toggleAnnotator,
    toggleTable,
    toggleFullscreen
});

</script>

<template>
    <div 
        ref="chordChart"
        :class="{
            'vue-data-ui-component': true,
            'vue-ui-chord': true,
            'vue-data-ui-wrapper-fullscreen': isFullscreen,
            'vue-data-ui-responsive': FINAL_CONFIG.responsive
        }"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        :id="`chord_${uid}`" 
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper 
            v-if="FINAL_CONFIG.userOptions.buttons.annotator && svgRef" 
            :color="FINAL_CONFIG.style.chart.color"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" 
            :active="isAnnotator" 
            :svgRef="svgRef"
            @close="toggleAnnotator" 
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close"/>
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }"/>
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }"/>
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }"/>
            </template>
        </PenAndPaper>

        <slot name="userConfig"></slot>

        <div ref="noTitle" v-if="hasOptionsNoTitle" class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title :key="`title_${titleStep}`" :config="{
                title: {
                    cy: 'chord-div-title',
                    ...FINAL_CONFIG.style.chart.title,
                },
                subtitle: {
                    cy: 'chord-div-subtitle',
                    ...FINAL_CONFIG.style.chart.title.subtitle
                }
            }" />
        </div>

        <div :id="`legend-top-${uid}`" />

        <UserOptions 
            ref="userOptionsRef" 
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" 
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" 
            :isImaging="isImaging" 
            :uid="uid"
            :hasTooltip="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" 
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv" 
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="false"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" 
            :isFullscreen="isFullscreen"
            :chartElement="chordChart" 
            :position="FINAL_CONFIG.userOptions.position"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator" 
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            @toggleFullscreen="toggleFullscreen" 
            @generatePdf="generatePdf" 
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable" 
            @toggleAnnotator="toggleAnnotator" 
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }">
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
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
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg 
            :xmlns="XMLNS"
            ref="svgRef" 
            :viewBox="`0 0 ${svg.width} ${svg.height}`" 
            preserveAspectRatio="xMidYMid meet"
            :style="{
                overflow: 'visible'
            }"
            :class="{'vue-ui-chord-rotating': dragging, 'vue-ui-chord-idle': !dragging }"
            @mousedown.prevent="onDown"
            @touchstart.prevent="onDown"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject v-if="$slots['chart-background']" :x="0" :y="0" :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height" :style="{
                    pointerEvents: 'none'
                }">
                <slot name="chart-background" />
            </foreignObject>

            <defs v-if="FINAL_CONFIG.style.chart.arcs.labels.curved">
                <path v-for="(g, i) in chordData.groups" :key="`labelPath-${i}`" :id="`labelPath-${i}_${uid}`" :d="labelArcPath(
                    g.startAngle,
                    g.endAngle,
                    (radii.inner + radii.outer) / 2 + FINAL_CONFIG.style.chart.arcs.labels.offset
                )
                    " fill="none" />
            </defs>

            <g v-if="$slots.pattern">
                <defs v-for="(dp, i) in chordData.groups">
                    <slot name="pattern" v-bind="{ seriesIndex: dp.index, patternId: `pattern_${uid}_${i}`}"/>
                </defs>
            </g>

            <g :transform="`translate(${svg.width / 2}, ${svg.height / 2}) rotate(${rotation})`">
                <!-- Group Arcs -->
                <g v-for="(g, i) in chordData.groups" >
                    <path 
                        :class="{'vue-ui-chord-arc': true, 'vue-ui-chord-arc-animated': FINAL_CONFIG.useCssAnimation && !loaded }" 
                        :key="`arc-${i}`" 
                        :d="arcPath(
                            g.startAngle,
                            g.endAngle,
                            radii.outer,
                            radii.inner
                        )" 
                        :fill="formattedDataset.colors[i]" 
                        :stroke="FINAL_CONFIG.style.chart.arcs.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.arcs.strokeWidth" 
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :style="{
                            opacity: getGroupOpacity(g)
                        }" 
                        @mouseenter="selectGroup(g, i)" 
                        @mouseleave="onGroupLeave(g, i)"
                        @click="onGroupClick(g, i)"
                    />
                    <path v-if="$slots.pattern"
                        :class="{'vue-ui-chord-arc': true, 'vue-ui-chord-arc-animated': FINAL_CONFIG.useCssAnimation && !loaded }" 
                        :key="`arc-${i}`" 
                        :d="arcPath(
                            g.startAngle,
                            g.endAngle,
                            radii.outer,
                            radii.inner
                        )" 
                        :fill="`url(#${g.pattern})`" 
                        :stroke="FINAL_CONFIG.style.chart.arcs.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.arcs.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :style="{
                            opacity: getGroupOpacity(g),
                            pointerEvents: 'none'
                        }" 
                    />
                </g>

                <!-- Chord Ribbons -->
                <g>
                    <template v-for="(c, i) in (selectedGroup
                        ? chordData.chords.filter(c => c.source.groupId === selectedGroup.id)
                        : selectedLegendId ? chordData.chords.filter(c => c.source.groupId === selectedLegendId)
                        : chordData.chords)" :key="`ribbon-${c.id}`">
                        <path 
                            v-if="c.source.value" 
                            :class="{'vue-ui-chord-ribbon': true, 'vue-ui-chord-ribbon-animated': FINAL_CONFIG.useCssAnimation && !loaded }" 
                            :d="ribbonPath(c.source, c.target)"
                            :fill="FINAL_CONFIG.style.chart.backgroundColor"
                            :style="{ opacity: FINAL_CONFIG.style.chart.ribbons.underlayerOpacity }" 
                        />

                        <path 
                            v-if="c.source.value" 
                            :class="{'vue-ui-chord-ribbon': true, 'vue-ui-chord-ribbon-animated': FINAL_CONFIG.useCssAnimation && !loaded }"
                            :d="ribbonPath(c.source, c.target)"
                            :fill="formattedDataset.colors[c.source.index]"
                            :stroke="FINAL_CONFIG.style.chart.ribbons.stroke"
                            :stroke-width="FINAL_CONFIG.style.chart.ribbons.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :style="{ opacity: getRibbonOpacity(c) }" 
                            @mouseenter="selectRibbon({
                                ...c, 
                                path: ribbonPath(c.source, c.target), 
                                color: formattedDataset.colors[c.source.index]
                            }, i)"
                            @click="onRibbonClick({
                                ...c,
                                color: formattedDataset.colors[c.source.index]
                            }, i)"
                            @mouseleave="onRibbonLeave({
                                ...c,
                                color: formattedDataset.colors[c.source.index]
                            }, i)" 
                        />
                        <path 
                            v-if="c.source.value && $slots.pattern" 
                            :class="{'vue-ui-chord-ribbon': true, 'vue-ui-chord-ribbon-animated': FINAL_CONFIG.useCssAnimation && !loaded }"
                            :d="ribbonPath(c.source, c.target)"
                            :fill="`url(#pattern_${uid}_${c.source.index})`"
                            :stroke="FINAL_CONFIG.style.chart.ribbons.stroke"
                            :stroke-width="FINAL_CONFIG.style.chart.ribbons.strokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            :style="{ 
                                opacity: getRibbonOpacity(c),
                                pointerEvents: 'none'
                            }" 
                        />
                    </template>

                    <!-- SELECTED RIBBON ON TOP LAYER-->
                    <path 
                        v-if="selectedRibbon" 
                        :d="selectedRibbon.path"
                        :fill="selectedRibbon.color"
                        :stroke="FINAL_CONFIG.style.chart.ribbons.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.ribbons.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="{ 'vue-ui-chord-ribbon': true }"
                        :style="{
                            pointerEvents: 'none'
                        }"
                    />
                    <path 
                        v-if="selectedRibbon && $slots.pattern" 
                        :d="selectedRibbon.path"
                        :fill="`url(#${selectedRibbon.source.pattern})`"
                        :stroke="FINAL_CONFIG.style.chart.ribbons.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.ribbons.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        :class="{ 'vue-ui-chord-ribbon': true }"
                        :style="{
                            pointerEvents: 'none'
                        }"
                    />
                </g>

                <!-- RIBBON LABELS WHEN A SELECTION OCCURS -->
                <g v-if="(selectedGroup || selectedRibbon || selectedLegendId) && FINAL_CONFIG.style.chart.ribbons.labels.show">
                    <template v-for="lbl in separatedValueLabels" :key="lbl.id">
                        <!-- BACKGROUND STROKE -->
                        <line
                            :x1="lbl.midBaseX" :y1="lbl.midBaseY"
                            :x2="Math.cos(lbl.theta - Math.PI/2) * (radii.outer + FINAL_CONFIG.style.chart.ribbons.labels.offset + 12)"
                            :y2="Math.sin(lbl.theta - Math.PI/2) * (radii.outer + FINAL_CONFIG.style.chart.ribbons.labels.offset + 12)"
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                            :stroke-width="FINAL_CONFIG.style.chart.ribbons.labels.connector.strokeWidth * 3"
                            pointer-events="none"
                        />
                        <!-- MAIN STROKE -->
                        <line
                            :x1="lbl.midBaseX" :y1="lbl.midBaseY"
                            :x2="Math.cos(lbl.theta - Math.PI/2) * (radii.outer + FINAL_CONFIG.style.chart.ribbons.labels.offset + 12)"
                            :y2="Math.sin(lbl.theta - Math.PI/2) * (radii.outer + FINAL_CONFIG.style.chart.ribbons.labels.offset + 12)"
                            :stroke="FINAL_CONFIG.style.chart.ribbons.labels.connector.stroke"
                            :stroke-width="FINAL_CONFIG.style.chart.ribbons.labels.connector.strokeWidth"
                            pointer-events="none"
                        />
                        <!-- DOT -->
                        <circle
                            v-if="FINAL_CONFIG.style.chart.ribbons.labels.marker.show"
                            :cx="Math.cos(lbl.theta - Math.PI/2) * (radii.outer + FINAL_CONFIG.style.chart.ribbons.labels.offset + 12)"
                            :cy="Math.sin(lbl.theta - Math.PI/2) * (radii.outer + FINAL_CONFIG.style.chart.ribbons.labels.offset + 12)"
                            :r="FINAL_CONFIG.style.chart.ribbons.labels.marker.radius"
                            :stroke="FINAL_CONFIG.style.chart.ribbons.labels.marker.stroke"
                            :stroke-width="FINAL_CONFIG.style.chart.ribbons.labels.marker.strokeWidth"
                            :fill="lbl.groupColor"
                            pointer-events="none"
                        />
                        <!-- DATALABEL -->
                        <text
                            :transform="`
                            translate(
                                ${Math.cos(lbl.theta - Math.PI/2) * (radii.outer + FINAL_CONFIG.style.chart.ribbons.labels.offset + 24)},
                                ${Math.sin(lbl.theta - Math.PI/2) * (radii.outer + FINAL_CONFIG.style.chart.ribbons.labels.offset + 24)}
                            ) rotate(${-rotation})
                            `"
                            :fill="FINAL_CONFIG.style.chart.ribbons.labels.useSerieColor 
                                    ? lbl.groupColor 
                                    : FINAL_CONFIG.style.chart.ribbons.labels.color"
                            :text-anchor="labelSide(lbl.theta)"
                            :font-size="FINAL_CONFIG.style.chart.ribbons.labels.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.ribbons.labels.bold ? 'bold' : 'normal'"
                            dy=".35em"
                            pointer-events="none"
                        >
                            {{ getLabel(lbl.value) }}
                        </text>
                    </template>
                </g>

                <!-- Group Labels -->
                <g v-if="FINAL_CONFIG.style.chart.arcs.labels.show">
                    <template v-if="FINAL_CONFIG.style.chart.arcs.labels.curved">
                        <text 
                            class="vue-ui-chord-label-curved"
                            v-for="(g, i) in chordData.groups" 
                            :key="`curved-label-${i}`"
                            :font-size="FINAL_CONFIG.style.chart.arcs.labels.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.arcs.labels.bold ? 'bold' : 'normal'"
                            :fill="FINAL_CONFIG.style.chart.arcs.labels.adaptColorToBackground ? adaptColorToBackground(formattedDataset.colors[i]) : FINAL_CONFIG.style.chart.arcs.labels.color">
                            <textPath :href="`#labelPath-${i}_${uid}`" startOffset="50%" text-anchor="middle">
                                {{ formattedDataset.labels[i] }}{{ FINAL_CONFIG.style.chart.arcs.labels.showPercentage ? dataLabel({
                                    p: ' (',
                                    v: isNaN(g.proportion) ? 0 : g.proportion * 100,
                                    s: '%)',
                                    r: FINAL_CONFIG.style.chart.arcs.labels.roundingPercentage 
                                }) : '' }}
                            </textPath>
                        </text>
                    </template>
                    <template v-else-if="!selectedGroup && !selectedRibbon && !selectedLegendId">
                        <text
                            class="vue-ui-chord-label-straight"
                            v-for="(g, i) in chordData.groups" 
                            :key="`label-${i}`" 
                            :transform="`
                                ${labelTransform((g.startAngle + g.endAngle) / 2)}
                                rotate(${-rotation})
                            `" 
                            dy=".35em" 
                            :text-anchor="rotatedMidAngle(g) > Math.PI ? 'end' : 'start'"
                            :font-size="FINAL_CONFIG.style.chart.arcs.labels.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.arcs.labels.bold ? 'bold' : 'normal'"
                            :fill="FINAL_CONFIG.style.chart.arcs.labels.color"
                            v-html="createTSpansFromLineBreaksOnY({
                                content: wrapText(getArcLabel(g, i)),
                                fontSize: FINAL_CONFIG.style.chart.arcs.labels.fontSize,
                                fill: FINAL_CONFIG.style.chart.arcs.labels.color,
                                x: 0,
                                y: 0
                            })"
                        />
                        
                    </template>
                </g>
            </g>
            <slot name="svg" :svg="{ 
                height: 600, 
                width: 600,
                isPrintingImg: isPrinting | isImaging | isCallbackImaging,
                isPrintingSvg: isCallbackSvg, 
            }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging || isCallbackImaging || isCallbackSvg }"/>
        </div>

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport v-if="readyTeleport" :to="FINAL_CONFIG.style.chart.legend.position === 'top' ? `#legend-top-${uid}` : `#legend-bottom-${uid}`">
            <div ref="chartLegend">
                <Legend
                    v-if="FINAL_CONFIG.style.chart.legend.show"
                    :key="`legend_${legendStep}`"
                    :legendSet="legendSet"
                    :config="legendConfig"
                    @clickMarker="({ legend }) => selectLegendItem(legend.id)"
                >
                    <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                        <Shape 
                            :shape="legend.shape" 
                            :radius="30" 
                            stroke="none" 
                            :plot="{ x: 30, y: 30 }"
                            :fill="`url(#pattern_${uid}_${index})`" 
                        />
                    </template>
                    <template #item="{ legend }">
                        <div 
                            data-cy="legend-item"
                            :style="{
                                opacity: selectedLegendId ? selectedLegendId === legend.id ? 1 : 0.3 : 1
                            }"
                            @click="legend.select()"
                        >
                            {{ legend.name }}
                        </div>
                    </template>
                </Legend>
                <slot name="legend" v-bind:legend="legendSet" />
            </div>
        </Teleport>
        
        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <div v-if="rotation !== FINAL_CONFIG.initialRotation" data-dom-to-png-ignore class="reset-wrapper">
            <slot name="reset-action" :reset="resetRotation">
                <button 
                    data-cy-reset 
                    tabindex="0" 
                    role="button" 
                    class="vue-data-ui-refresh-button"
                    :style="{
                        background: FINAL_CONFIG.style.chart.backgroundColor
                    }"
                    @click="resetRotation">
                    <BaseIcon name="refresh" :stroke="FINAL_CONFIG.style.chart.color" />
                </button>
            </slot>
        </div>

        <component
            v-if="isDataset && FINAL_CONFIG.userOptions.buttons.table"
            :is="tableComponent.component"
            v-bind="tableComponent.props"
            ref="tableUnit"
            @close="closeTable"
        >
            <template #title v-if="FINAL_CONFIG.table.useDialog">
                {{ tableComponent.title }}
            </template>
            <template #actions v-if="FINAL_CONFIG.table.useDialog">
                <button tabindex="0" class="vue-ui-user-options-button" @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)">
                    <BaseIcon name="fileCsv" :stroke="tableComponent.props.color"/>
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
                    @close="closeTable">
                    <template #th="{ th }">
                        {{ th.name }}
                    </template>
                    <template #td="{ td }">
                        <div style="text-align:right; width: 100%">
                            {{ td.name ? td.name : getLabel(td) }}
                        </div>
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-chord * {
    transition: unset;
}

.vue-ui-chord {
    user-select: none;
    position: relative;
}

.vue-ui-chord.vue-data-ui-responsive {
    position: relative;
    width: 100%;
    height: 100%;
}

.vue-ui-chord.vue-data-ui-responsive svg {
    max-width: 100%;
    max-height: 100%;
    display: block;
    margin: auto;
}

.vue-ui-chord-arc,
.vue-ui-chord-ribbon {
    transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
}

.vue-ui-chord-arc-animated,
.vue-ui-chord-ribbon-animated {
    animation: chord-animation 0.5s ease-in-out;
}

@keyframes chord-animation {
    0% {
        transform: scale(0.9,0.9);
    }
    80% {
        transform: scale(1.02,1.02);
    }
    to {
        transform: scale(1,1);
    }
}

.reset-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    height: 40px;
    position: absolute;
    bottom: 48px;
    right: 0;
}

.vue-data-ui-refresh-button {
    outline: none;
    border: none;
    background: transparent;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s ease-in-out;
    transform-origin: center;
    &:focus {
        outline: 1px solid v-bind(slicerColor);
    }
    &:hover {
        transform: rotate(-90deg)
    }
}

.vue-ui-chord-idle {
    cursor: grab;
}

.vue-ui-chord-rotating {
    cursor: grabbing;
}
</style>
<script setup>
import { 
    ref, 
    computed, 
    onMounted, 
    onBeforeUnmount, 
    watch, 
    nextTick, 
    defineAsyncComponent,
    shallowRef
} from 'vue';
import { 
    adaptColorToBackground, 
    applyDataLabel, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createUid, 
    dataLabel, 
    downloadCsv, 
    error, 
    getMissingDatasetAttributes, 
    objectIsEmpty, 
    palette, 
    themePalettes, 
    XMLNS 
} from '../lib';
import { useConfig } from '../useConfig';
import { useUserOptionState } from '../useUserOptionState';
import { useNestedProp } from '../useNestedProp';
import { useChartAccessibility } from '../useChartAccessibility';
import { usePrinter } from '../usePrinter';
import { throttle } from '../canvas-lib';
import { useResponsive } from '../useResponsive';
import themes from "../themes.json";
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import Shape from '../atoms/Shape.vue';
import img from '../img';

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_chord: DEFAULT_CONFIG } = useConfig();

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

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
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
    })

    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_chord[mergedConfig.theme] || props.config,
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
    legendStep.value += 1;
    // Reset mutable config
    rotation.value = FINAL_CONFIG.value.initialRotation;
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiChord',
            type: 'dataset'
        })
    } else {
        getMissingDatasetAttributes({
            datasetObject: props.dataset,
            requiredAttributes: ['matrix']
        }).forEach(attr => {
            isDataset.value = false;
            error({
                componentName: 'VueUiChord',
                type: 'datasetAttribute',
                property: attr
            })
        })
    }

    isDataset.value && checkDataset();

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
    if (!props.dataset || !Object.hasOwn(props.dataset, 'matrix') || props.dataset.matrix.length < 2) {
        console.warn(`VueUiChord: dataset.matrix requires a minimum of 2 datapoints, for example:\n\nmatrix:[\n  [1, 1],\n  [1, 1]\n]`);
        isDataset.value = false;
        return;
    }

    props.dataset.matrix.forEach((m, i) => {
        if (m.length !== props.dataset.matrix.length) {
            console.warn(`VueUiChord - Invalid matrix: dataset.matrix at index ${i} has ${m.length} elements instead of the required ${props.dataset.matrix.length}\n\ndataset.matrix[${i}] = [${m.toString()}] has a length of ${m.length} but should have the same length as the matrix itself (${props.dataset.matrix.length})`);
            isDataset.value = false;
        }
    });
}

const loadingTimeout = ref(null);

onMounted(() => {
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
    if (!isDataset.value) {
        return {
            matrix: [],
            labels: [],
            colors: []
        }
    }
    return {
        matrix: props.dataset.matrix ?? [[0]],
        labels: props.dataset.labels ?? [''],
        colors: props.dataset.colors && Array.isArray(props.dataset.colors) && props.dataset.colors.length
            ? props.dataset.colors.map(c => convertColorToHex(c))
            : props.dataset.matrix.map((_m, i) => {
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

function selectGroup(group) {
    if (selectedLegendId.value) return;
    selectedGroup.value = group;
}

function selectRibbon(ribbon) {
    if (selectedLegendId.value) return;
    selectedRibbon.value = ribbon;
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
    const { imageUri, base64 } = await img(({ domElement: chordChart.value, base64: true, img: true, scale }))
    return { imageUri, base64 }
}

defineExpose({
    getData,
    getImage,
    generateCsv,
    generateImage,
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
        />

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

        <UserOptions ref="details" :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" 
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" 
            :isImaging="isImaging" 
            :uid="uid"
            :hasTooltip="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" 
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
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
            @toggleFullscreen="toggleFullscreen" 
            @generatePdf="generatePdf" 
            @generateCsv="generateCsv"
            @generateImage="generateImage" 
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
            v-if="isDataset"
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
                        @mouseenter="() => selectGroup(g)" 
                        @mouseleave="selectedGroup = null"
                        @click="emit('selectGroup', g)"
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
                    <template v-for="c in (selectedGroup
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
                            @mouseenter="() => selectRibbon({
                                ...c, 
                                path: ribbonPath(c.source, c.target), 
                                color: formattedDataset.colors[c.source.index]
                            })"
                            @click="emit('selectRibbon', {
                                ...c,
                                color: formattedDataset.colors[c.source.index]
                            })"
                            @mouseleave="selectedRibbon = null" 
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
                        >
                            {{ formattedDataset.labels[i] }}{{ FINAL_CONFIG.style.chart.arcs.labels.showPercentage ? dataLabel({
                                    p: ' (',
                                    v: isNaN(g.proportion) ? 0 : g.proportion * 100,
                                    s: '%)',
                                    r: FINAL_CONFIG.style.chart.arcs.labels.roundingPercentage 
                                }) : '' }}
                        </text>
                    </template>
                </g>
            </g>
            <slot name="svg" :svg="{ height: 600, width: 600 }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton v-if="!isDataset" :config="{
            type: 'chord',
            style: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                chord: {
                    color: '#CCCCCC',
                }
            }
        }" />

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

        <!-- DATA TABLE -->
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
                <DataTable :key="`table_${tableStep}`" :colNames="dataTable.colNames" :head="dataTable.head"
                    :body="dataTable.body" :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false">
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
        </Accordion>
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
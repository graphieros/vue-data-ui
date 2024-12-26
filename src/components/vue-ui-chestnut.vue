<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { 
    adaptColorToBackground,
    applyDataLabel,
    calcMarkerOffsetX, 
    calcMarkerOffsetY, 
    calcNutArrowPath, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createUid,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    makeDonut,
    objectIsEmpty, 
    palette,
    setOpacity,
    shiftHue,
    themePalettes,
    XMLNS
} from "../lib";
import themes from "../themes.json";
import UserOptions from "../atoms/UserOptions.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";
import { useUserOptionState } from "../useUserOptionState";

const { vue_ui_chestnut: DEFAULT_CONFIG } = useConfig()

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
    }
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const uid = ref(createUid());
const chestnutChart = ref(null);
const details = ref(null);
const step = ref(0);

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
                userConfig: themes.vue_ui_chestnut[mergedConfig.theme] || props.config,
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
    prepareChart();
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-chestnut_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.layout.title.text || 'vue-ui-chestnut'
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

const tableContainer = ref(null)
const isResponsive = ref(false)
const breakpoint = computed(() => {
    return FINAL_CONFIG.value.table.responsiveBreakpoint
})

const svg = ref({
    gap: 6,
    padding: {
        top: 102,
        left: 12,
        right: 12,
        bottom: 96,
    },
    width: 1024,
    height: 0,
    branchSize: 32,
    branchStart: 128,
});

const drawableArea = computed(() => {
    return {
        left: svg.value.padding.left,
        top: svg.value.padding.top,
        right: svg.value.width - svg.value.padding.right,
        bottom: svg.value.height - svg.value.padding.bottom,
        width: svg.value.width - (svg.value.padding.left + svg.value.padding.right),
        height: svg.value.height - (svg.value.padding.top + svg.value.padding.bottom),
        seedX: svg.value.padding.left + 64
    }
});

const treeTotal = computed(() => {
    if(!isDataset.value) {
        return 0
    }
    return props.dataset.flatMap(root => (root.branches || []).map(branch => (branch.value || 0))).reduce((a,b) => a + b, 0);
})

const mutableDataset = computed(() => {

    props.dataset.forEach((ds, i) => {
        getMissingDatasetAttributes({
            datasetObject: ds,
            requiredAttributes: ['name', 'branches']
        }).forEach(attr => {
            error({
                componentName: 'VueUiChestnut',
                type: 'datasetSerieAttribute',
                property: attr,
                index: i
            });
        });

        if(ds.branches) {
            ds.branches.forEach((branch, j) => {
                getMissingDatasetAttributes({
                    datasetObject: branch,
                    requiredAttributes: ['name', 'value']
                }).forEach(attr => {
                    error({
                        componentName: 'VueUiChestnut',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: `${i} - ${j}`
                    });
                });

                if(branch.breakdown) {
                    branch.breakdown.forEach((b, k) => {
                        getMissingDatasetAttributes({
                            datasetObject: b,
                            requiredAttributes: ['name', 'value']
                        }).forEach(attr => {
                            error({
                                componentName: 'VueUiChestnut',
                                type: 'datasetSerieAttribute',
                                property: attr,
                                index: `${i} - ${j} - ${k}`
                            });
                        });
                    });
                }
            });
        }
    });

    return props.dataset.map((root, i) => {
        const rootTotal = (root.branches || []).map(branch => (branch.value || 0)).reduce((a, b) => a + b, 0);
        return {
            ...root,
            color: convertColorToHex(root.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            id: root.id || `root_${i}_${uid.value}`,
            type: "root",
            total: rootTotal,
            rootIndex: i,
            branches: (root.branches || []).map((branch, j) => {
                return {
                    ...branch,
                    rootName: root.name,
                    rootIndex: i,
                    color: convertColorToHex(root.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                    value: branch.value >= 0 ? branch.value : 0,
                    id: branch.id || `branch_${i}_${j}_${uid.value}`,
                    proportionToRoot: branch.value / rootTotal,
                    type: "branch",
                    breakdown: (branch.breakdown || []).map((nut, k) => {
                        return {
                            table: {
                                rootName: root.name,
                                rootValue: rootTotal,
                                rootToTotal: rootTotal / treeTotal.value,
                                branchName: branch.name,
                                branchValue: branch.value,
                                branchToTotal: branch.value / treeTotal.value,
                                branchToRoot: branch.value / rootTotal,
                                nutName: nut.name,
                                nutValue: nut.value,
                                nutToTotal: nut.value / treeTotal.value,
                                nutToRoot: nut.value / rootTotal,
                                nutToBranch: nut.value / branch.value
                            },
                            ...nut,
                            type: "nut",
                            branchName: branch.name,
                            rootName: root.name,
                            branchTotal: branch.value >= 0 ? branch.value : 0,
                            proportionToBranch: nut.value / branch.value,
                            proportionToRoot: nut.value / rootTotal,
                            proportionToTree: nut.value / treeTotal.value,
                            rootIndex: i,
                            id: nut.id || `nut_${i}_${j}_${k}_${uid.value}`,
                            color: convertColorToHex(nut.color) || customPalette.value[k] || palette[k] || palette[k % palette.length],
                            value: nut.value >= 0 ? nut.value : 0
                        }
                    }),
                }
            }),
        }
    });
});

function getData() {
    return mutableDataset.value;
}

const emit = defineEmits(['selectRoot', 'selectBranch', 'selectNut']);

const totalBranches = computed(() => {
    return mutableDataset.value.flatMap(root => root.branches).length;
});

const maxRoot = computed(() => {
    return Math.max(...mutableDataset.value.map(root => root.branches.map(branch => branch.value).reduce((a,b) => a + b, 0)));
});

const maxBranch = computed(() => {
    return Math.max(...mutableDataset.value.flatMap(root => root.branches.map(branch => branch.value)));
});

const earth = computed(() => {
    return 256 + svg.value.padding.left;
});

const roots = computed(() => {
    return mutableDataset.value.sort((a, b) => b.total - a.total).map((root, i) => {
        const maxRadius = drawableArea.value.height / mutableDataset.value.length / 2;
        const radius = (root.total / maxRoot.value) * (maxRadius > 64 ? 64 : maxRadius);
        return {
            ...root,
            x: drawableArea.value.seedX,
            y: drawableArea.value.top + drawableArea.value.height / mutableDataset.value.length * (i+1) - (drawableArea.value.height / mutableDataset.value.length / 2 + svg.value.gap / 2),
            r: radius < svg.value.branchSize /2 ? svg.value.branchSize/2 : radius 
        }
    })
});

const canopea = computed(() => {
    if(FINAL_CONFIG.value.style.chart.layout.branches.widthRatio <= 0) {
        return 0.1;
    }
    if(FINAL_CONFIG.value.style.chart.layout.branches.widthRatio > 1.8) {
        return 1.8;
    }
    return FINAL_CONFIG.value.style.chart.layout.branches.widthRatio
})


const seeds = computed(() => {
    return roots.value.flatMap(root => root.branches);
})

const branches = computed(() => {
    return seeds.value.sort((a,b) => b.value - a.value).map((branch, i) => {
        return {
            ...branch,
            y1: (i * svg.value.branchSize) + drawableArea.value.top + (i * svg.value.gap),
            y2: (i * svg.value.branchSize) + (svg.value.branchSize),
            x1: earth.value,
            x2: (384 * branch.value / maxBranch.value * canopea.value) + earth.value
        }
    })
});

function getRoot(branch) {
    const root = roots.value.find(r => r.rootIndex === branch.rootIndex);
    return {x: root.x, y: root.y, r: root.r}
}

const selectedNut = ref(null);
const openNut = ref(null);
const selectedBranch = ref(null);
const selectedRoot = ref(null);

function resetTree() {
    selectedNut.value = null;
    selectedBranch.value = null;
    selectedRoot.value = null;
}

function isFocused(part) {
    if(!selectedRoot.value) {
        if(selectedNut.value === null && selectedBranch.value === null) return true;
        if(part.type === "nut") {
            return selectedNut.value.id === part.id;
        }
        if(part.type === "branch") {
            return selectedBranch.value.id === part.id;
        }
        if(part.type === "root") {
            return (selectedBranch.value && selectedBranch.value.rootIndex === part.rootIndex) || (selectedNut.value && selectedNut.value.rootIndex === part.rootIndex)
        }
    } else {
        if(selectedRoot.value === null) return true;
        if(part.type === 'root') {
            return part.id === selectedRoot.value.id
        }
        return part.rootIndex === selectedRoot.value.rootIndex;
    }
    return false;
}

function pickNut(branch) {
    resetTree();
    nextTick(() => {
        selectedNut.value = branch;
        selectedBranch.value = branch;
        openNut.value = makeDonut(
            { series: branch.breakdown, base: 1},
            branch.x2 + 24 + FINAL_CONFIG.value.style.chart.layout.nuts.offsetX,
            branch.y1 + svg.value.branchSize / 2,
            80,
            80
        );
        emit('selectNut', branch.breakdown)
    })
}

function leaveNut() {
    selectedNut.value = null;
    openNut.value = null;
    emit('selectNut', null);
}

function pickBranch(branch) {
    if (selectedBranch.value && selectedBranch.value.id === branch.id) {
        selectedBranch.value = null;
        resetTree();
        emit('selectBranch', null)
    } else {
        resetTree();
        selectedBranch.value = branch;
        emit('selectBranch', branch)
    }
}

function pickRoot(root) {
    if (selectedRoot.value && selectedRoot.value.id === root.id) {
        resetTree();
        emit('selectRoot', null);
    } else {
        resetTree();
        selectedRoot.value = root;
        emit('selectRoot', root);
    }
}

function placeLegendTopOrBottom() {
    const overflowsBottom = drawableArea.value.bottom - (selectedNut.value.y1 + 180) < 0;
    if(overflowsBottom) {
        return 0;
    } else {
        return drawableArea.value.bottom;
    }
}

function isArcBigEnough(arc) {
    return arc.proportion * 100 > FINAL_CONFIG.value.style.chart.layout.nuts.selected.labels.dataLabels.hideUnderValue;
}

function observeTable() {
    const observer = new ResizeObserver((entries) => {
        entries.forEach(entry => {
            isResponsive.value = entry.contentRect.width < breakpoint.value;
        })
    })
    if (tableContainer.value) {
        observer.observe(tableContainer.value)
    }
}

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiChestnut',
            type: 'dataset'
        })
    }

    const height = totalBranches.value * (svg.value.branchSize + svg.value.gap) + svg.value.padding.top + svg.value.padding.bottom;
    svg.value.height = height;
    observeTable()
}

const table = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.th.translations.rootName,
        FINAL_CONFIG.value.table.th.translations.rootValue,
        FINAL_CONFIG.value.table.th.translations.rootToTotal,
        FINAL_CONFIG.value.table.th.translations.branchName,
        FINAL_CONFIG.value.table.th.translations.branchValue,
        FINAL_CONFIG.value.table.th.translations.branchToRoot,
        FINAL_CONFIG.value.table.th.translations.branchToTotal,
        FINAL_CONFIG.value.table.th.translations.nutName,
        FINAL_CONFIG.value.table.th.translations.nutValue,
        FINAL_CONFIG.value.table.th.translations.nutToBranch,
        FINAL_CONFIG.value.table.th.translations.nutToRoot,
        FINAL_CONFIG.value.table.th.translations.nutToTotal,
    ];

    const body = mutableDataset.value.flatMap((root, i) => {
        return root.branches.flatMap((branch, j) => {
            return branch.breakdown.flatMap((nut, k) => {
                return nut.table
            })
        })
    });

    return { head, body }
});

function generateCsv() {
    nextTick(() => {
        const title = [[FINAL_CONFIG.value.style.chart.layout.title.text], [FINAL_CONFIG.value.style.chart.layout.title.subtitle.text], [""],["Grand total", treeTotal.value],[""]];
        const head = table.value.head;
        const body = table.value.body.map((tr, i) => {
            return [
                table.value.body[i-1] && table.value.body[i-1].rootName === tr.rootName ? '' : tr.rootName,
                table.value.body[i-1] && table.value.body[i-1].rootName === tr.rootName ? '' : tr.rootValue,
                table.value.body[i-1] && table.value.body[i-1].rootName === tr.rootName ? '' : tr.rootToTotal,
                table.value.body[i-1] && table.value.body[i-1].branchName === tr.branchName ? '' : tr.branchName,
                table.value.body[i-1] && table.value.body[i-1].branchName === tr.branchName ? '' : tr.branchValue,
                table.value.body[i-1] && table.value.body[i-1].branchName === tr.branchName ? '' : tr.branchToRoot,
                table.value.body[i-1] && table.value.body[i-1].branchName === tr.branchName ? '' : tr.branchToTotal,
                tr.nutName,
                tr.nutValue,
                tr.nutToBranch,
                tr.nutToRoot,
                tr.nutToTotal
            ]
        });
        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.layout.title.text || 'vue-ui-chestnut'})
    });
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleAnnotator,
});

</script>

<template>
    <div 
        :class="`vue-ui-chestnut ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        ref="chestnutChart"
        :id="`vue-ui-chestnut_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="chestnutChart"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="chestnutChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
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

        <svg :xmlns="XMLNS" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" v-if="svg.height > 0 && isDataset" :viewBox="`0 0 ${svg.width} ${svg.height}`"  :style="`overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`" >
            <PackageVersion />

            <!-- TITLE AS G -->
            <g v-if="!selectedNut">
                <text
                    data-cy="chestnut-title"
                    v-if="FINAL_CONFIG.style.chart.layout.title.text"
                    text-anchor="middle"
                    :fill="FINAL_CONFIG.style.chart.layout.title.color"
                    :font-weight="FINAL_CONFIG.style.chart.layout.title.bold ? 'bold' : 'normal'"
                    :font-size="FINAL_CONFIG.style.chart.layout.title.fontSize"
                    :x="svg.width / 2"
                    :y="12 + FINAL_CONFIG.style.chart.layout.title.fontSize + FINAL_CONFIG.style.chart.layout.title.offsetY"
                    @click="resetTree"
                >
                    {{ FINAL_CONFIG.style.chart.layout.title.text }}
                </text>
                <text
                    data-cy="chestnut-subtitle"
                    v-if="FINAL_CONFIG.style.chart.layout.title.subtitle.text"
                    text-anchor="middle"
                    :fill="FINAL_CONFIG.style.chart.layout.title.subtitle.color"
                    :font-weight="FINAL_CONFIG.style.chart.layout.title.subtitle.bold ? 'bold' : 'normal'"
                    :font-size="FINAL_CONFIG.style.chart.layout.title.subtitle.fontSize"
                    :x="svg.width / 2"
                    :y="48 + FINAL_CONFIG.style.chart.layout.title.subtitle.fontSize + FINAL_CONFIG.style.chart.layout.title.subtitle.offsetY"
                    @click="resetTree"
                >
                    {{ FINAL_CONFIG.style.chart.layout.title.subtitle.text }}
                </text>
            </g>

            <!-- DEFS -->
            <defs>
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    v-for="(d, i) in mutableDataset"
                    :id="`root_gradient_${uid}_${d.rootIndex}`"
                >
                    <stop offset="0%" :stop-color="setOpacity(shiftHue(d.color, 0.05), 100 - FINAL_CONFIG.style.chart.layout.roots.gradientIntensity)"/>
                    <stop offset="100%" :stop-color="d.color" />
                </radialGradient>
                <linearGradient
                    x1="0%" y1="0%" x2="100%" y2="0%"
                    v-for="d in mutableDataset"
                    :id="`branch_gradient_${uid}_${d.rootIndex}`"
                >
                    <stop offset="0%" :stop-color="d.color" />
                    <stop offset="100%" :stop-color="setOpacity(shiftHue(d.color, 0.02), 100 - FINAL_CONFIG.style.chart.layout.branches.gradientIntensity)"/>
                </linearGradient>
                <!-- picked nut core gradient -->
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    :id="`nutpick_${uid}`"
                >
                    <stop offset="0%" :stop-color="setOpacity('#FFFFFF', 0)"/>
                    <stop offset="80%" :stop-color="setOpacity('#FFFFFF', FINAL_CONFIG.style.chart.layout.nuts.selected.gradientIntensity)"/>
                    <stop offset="100%" :stop-color="setOpacity('#FFFFFF', 0)"/>
                </radialGradient>
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    :id="`nut_${uid}`"
                >
                    <stop offset="0%" :stop-color="setOpacity('#FFFFFF', 0)"/>
                    <stop offset="80%" :stop-color="setOpacity('#FFFFFF', FINAL_CONFIG.style.chart.layout.nuts.gradientIntensity)"/>
                    <stop offset="100%" :stop-color="setOpacity('#FFFFFF', 0)"/>
                </radialGradient>
                <!-- picked nut underlayer -->
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    :id="`nut_underlayer_${uid}`"
                >
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 100)"/>
                    <stop offset="80%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 60)"/>
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)"/>
                </radialGradient>
            </defs>

            <!-- GRAND TOTAL -->
            <g v-if="FINAL_CONFIG.style.chart.layout.grandTotal.show">
                <text
                    :x="drawableArea.seedX"
                    :y="32 + FINAL_CONFIG.style.chart.layout.grandTotal.offsetY"
                    :font-size="FINAL_CONFIG.style.chart.layout.grandTotal.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.layout.grandTotal.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.chart.layout.grandTotal.color"
                    text-anchor="middle"
                    @click="resetTree"
                >
                    {{ FINAL_CONFIG.style.chart.layout.grandTotal.text }}
                </text>
                <text
                    :x="drawableArea.seedX"
                    :y="38 + FINAL_CONFIG.style.chart.layout.grandTotal.fontSize + FINAL_CONFIG.style.chart.layout.grandTotal.offsetY"
                    :font-size="FINAL_CONFIG.style.chart.layout.grandTotal.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.layout.grandTotal.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.chart.layout.grandTotal.color"
                    text-anchor="middle"
                    @click="resetTree"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.grandTotal.formatter,
                        treeTotal,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.layout.grandTotal.prefix,
                            v: treeTotal,
                            s: FINAL_CONFIG.style.chart.layout.grandTotal.suffix,
                            r: FINAL_CONFIG.style.chart.layout.grandTotal.roundingValue
                        })) 
                    }}
                </text>
                
            </g>

            <!-- LINKS -->
            <g v-for="branch in branches">
                <path 
                    v-for="(p, i) in svg.branchSize"
                    :d="`M
                    ${branch.x1},${branch.y1 + i}
                    C${branch.x1 - 20},${branch.y1 + i} 
                    ${branch.x1 - 80},${branch.y1 + i} 
                    ${getRoot(branch).x + getRoot(branch).r / 2}, ${getRoot(branch).y}
                `"
                    :stroke="setOpacity(branch.color, FINAL_CONFIG.style.chart.layout.links.opacity)"
                    fill="none"
                    stroke-width="2"
                    shape-rendering="cirspEdges"
                    :style="`opacity:${isFocused(branch) ? 1 : 0}`"
                    @click="resetTree"
                />
            </g>

            <!-- ROOTS -->
            <circle 
                v-for="root in roots" 
                :cx="root.x" 
                :cy="root.y" 
                :r="root.r" 
                :fill="FINAL_CONFIG.style.chart.layout.roots.underlayerColor"
                stroke="none"
                :style="`cursor:pointer; opacity:${isFocused(root) ? 1 : 0.05}`"
            />
            <circle 
                v-for="(root, i) in roots" 
                :data-cy="`chestnut-root-${i}`"
                :cx="root.x" 
                :cy="root.y" 
                :r="root.r" 
                :fill="FINAL_CONFIG.style.chart.layout.roots.useGradient ? `url(#root_gradient_${uid}_${root.rootIndex})` : root.color"
                :stroke="FINAL_CONFIG.style.chart.layout.roots.stroke" 
                :stroke-width="FINAL_CONFIG.style.chart.layout.roots.strokeWidth"
                :style="`cursor:pointer; opacity:${isFocused(root) ? 1 : 0.05}`"
                @click="pickRoot(root)"
            />
            <g v-if="FINAL_CONFIG.style.chart.layout.roots.labels.show">
                <!-- ROOT TOTAL -->
                <text v-for="(root, i) in roots"
                    :data-cy="`chestnut-root-label-${i}`"
                    :x="root.x"
                    :y="root.y + FINAL_CONFIG.style.chart.layout.roots.labels.fontSize / 2.6"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.chart.layout.roots.labels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.roots.labels.adaptColorToBackground ? adaptColorToBackground(root.color) : FINAL_CONFIG.style.chart.layout.roots.labels.color"
                    font-weight="bold"
                    :style="`cursor:pointer; opacity:${isFocused(root) ? 1 : 0.05}`"
                    @click="pickRoot(root)"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.roots.labels.formatter,
                        root.total,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.layout.roots.labels.prefix,
                            v: root.total,
                            s: FINAL_CONFIG.style.chart.layout.roots.labels.suffix,
                            r: FINAL_CONFIG.style.chart.layout.roots.labels.roundingValue
                        }),
                        { datapoint: root }
                        ) 
                    }}
                </text>
                <!-- ROOT NAME LABEL -->
                <g v-for="root in roots"> 
                    <g v-if="(selectedNut && root.rootIndex === selectedNut.rootIndex) || (selectedBranch && root.rootIndex === selectedBranch.rootIndex) || (selectedRoot && root.rootIndex === selectedRoot.rootIndex)">
                        <text
                            :x="root.x"
                            :y="root.y + root.r + 24"
                            text-anchor="middle"
                            :fill="FINAL_CONFIG.style.chart.layout.roots.labels.name.color"
                            :font-size="FINAL_CONFIG.style.chart.layout.roots.labels.name.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.layout.roots.labels.name.bold ? 'bold' : 'normal'"
                            @click="resetTree"
                        >
                            {{ root.name }}
                        </text>
                    </g>
                </g>
            </g>

            <!-- BRANCHES -->
            <rect 
                v-for="branch in branches"
                :x="branch.x1"
                :y="branch.y1"
                :height="svg.branchSize"
                :width="branch.x2 - branch.x1"
                :fill="FINAL_CONFIG.style.chart.layout.branches.underlayerColor"
                :rx="FINAL_CONFIG.style.chart.layout.branches.borderRadius"
                stroke="none"
                :style="`opacity:${isFocused(branch) ? 1 : 0.05}`"
                @click="pickBranch(branch)"
            />
            <rect 
                v-for="(branch, i) in branches"
                :data-cy="`chestnut-branch-${i}`"
                :x="branch.x1"
                :y="branch.y1"
                :height="svg.branchSize"
                :width="branch.x2 - branch.x1"
                :fill="FINAL_CONFIG.style.chart.layout.branches.useGradient ? `url(#branch_gradient_${uid}_${branch.rootIndex})` : branch.color"
                :rx="FINAL_CONFIG.style.chart.layout.branches.borderRadius"
                :stroke="FINAL_CONFIG.style.chart.layout.branches.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.layout.branches.strokeWidth"
                :style="`cursor:pointer; opacity:${isFocused(branch) ? 1 : 0.05}`"
                @click="pickBranch(branch)"
            />
            <g v-if="FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.show">
                <g v-for="branch in branches">
                    <!-- BRANCH TOTAL -->
                    <text
                        v-if="branch.proportionToRoot * 100 > FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.hideUnderValue"    
                        :x="branch.x1 + 6"
                        :y="branch.y1 + svg.branchSize / 1.5"
                        text-anchor="start"
                        :fill="adaptColorToBackground(branch.color)"
                        :font-size="FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.fontSize"
                        font-weight="bold"
                        :style="`cursor:pointer; opacity:${isFocused(branch) ? 1 : 0.05}`"
                        @click="pickBranch(branch)"
                    >
                        {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.formatter,
                            branch.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.prefix,
                                v: branch.value,
                                s: FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.suffix,
                                r: FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.roundingValue
                            }),
                            { datapoint: branch }
                            )
                        }}
                    </text>
                </g>

            </g>

            <!-- NUTS -->

            <g v-for="(branch, b) in branches">
                <path 
                    v-for="(arc, i) in makeDonut(
                        { series: branch.breakdown, base:1 },
                        branch.x2 + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX, 
                        branch.y1 + svg.branchSize / 2,
                        svg.branchSize / 3,
                        svg.branchSize / 3
                    )"
                    :data-cy="`chestnut-nut-${b}`"
                    :d="arc.path" 
                    :stroke="arc.color" 
                    :stroke-width="10" 
                    fill="none"
                    :style="`opacity:${isFocused(branch) ? 1 : 0.1}`"
                />

                <!-- tooltip trap -->
                <circle
                    :data-cy="`chestnut-trap-${b}`"
                    :fill="FINAL_CONFIG.style.chart.layout.nuts.useGradient ? `url(#nut_${uid})` : 'transparent'"
                    :cx="branch.x2 + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX"
                    :cy="branch.y1 + svg.branchSize / 2"
                    :r="svg.branchSize / 2 + 2"
                    @click="pickNut(branch)"
                    :style="`cursor:pointer;opacity:${isFocused(branch) ? 1 : 0.1}`"
                />
            </g>

            <g v-if="FINAL_CONFIG.style.chart.layout.branches.labels.show && !selectedBranch">
                <text
                    v-for="branch in branches"
                    :x="branch.x2 + svg.branchSize + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX"
                    :y="branch.y1 + svg.branchSize / 2 + 5"
                    :font-size="FINAL_CONFIG.style.chart.layout.branches.labels.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.layout.branches.labels.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.chart.layout.branches.labels.color"
                    text-anchor="start"
                    :style="`opacity:${isFocused(branch) ? 1 : 0.1}`"
                >
                    {{ branch.name }}
                </text>
            </g>

            
            <!-- VERTICAL SEPARATOR -->
            <line 
                :x1="256 + svg.padding.left"
                :x2="256 + svg.padding.left"
                :y1="drawableArea.top"
                :y2="drawableArea.bottom"
                :stroke="FINAL_CONFIG.style.chart.layout.verticalSeparator.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.layout.verticalSeparator.strokeWidth"
            />

            <!-- ROOT LEGEND -->
            <foreignObject
                v-if="!selectedNut && !selectedBranch"
                :x="0"
                :y="drawableArea.bottom"
                :height="svg.height - drawableArea.bottom"
                :width="svg.width"
                style="overflow: visible"
                @click="resetTree"
            >
                <div style="width: 100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column">
                    <div style="display: flex; align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;flex-direction:row">
                        <div v-for="root in roots" :style="`display:flex;align-items:center;gap:3px;flex-direction:row;font-size:${FINAL_CONFIG.style.chart.layout.legend.fontSize}px;`">
                            <svg viewBox="0 0 20 20" height="16" width="16">
                                <circle cx="10" cy="10" r="10" :fill="root.color" stroke="none"/>
                            </svg>
                            <span>{{ root.name }}:</span>
                            <b>
                                {{ applyDataLabel(
                                    FINAL_CONFIG.style.chart.layout.roots.labels.formatter,
                                    root.total,
                                    dataLabel({
                                        p: FINAL_CONFIG.style.chart.layout.legend.prefix,
                                        v: root.total,
                                        s: FINAL_CONFIG.style.chart.layout.legend.suffix,
                                        r: FINAL_CONFIG.style.chart.layout.legend.roundingValue
                                    }),
                                    { datapoint: root }
                                ) }}
                            </b>
                            ({{ dataLabel({
                                v: root.total / treeTotal * 100,
                                s: '%',
                                r: FINAL_CONFIG.style.chart.layout.legend.roundingPercentage
                            }) }})
                        </div>
                    </div>
                </div>
            </foreignObject>

            <!-- NUT PICK -->
            <g v-if="selectedNut && openNut">
                <!-- NUT PICK LEGEND -->
                <foreignObject
                    data-cy="chestnut-legend"
                    :x="0"
                    :y="placeLegendTopOrBottom()"
                    :height="svg.height - drawableArea.bottom"
                    :width="svg.width"
                    style="overflow: visible"
                    @click="resetTree"
                >
                    <div style="width: 100%;height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column">
                        <b>{{ selectedNut.name }}</b>
                        <div style="display: flex; align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;flex-direction:row">
                            <div v-for="(nut, i) in selectedNut.breakdown" :style="`display:flex;align-items:center;gap:6px;flex-direction:row;font-size:${FINAL_CONFIG.style.chart.layout.legend.fontSize}px;`">
                                <svg viewBox="0 0 20 20" height="16" width="16">
                                    <circle cx="10" cy="10" r="10" :fill="nut.color" stroke="none"/>
                                </svg>
                                <span>{{ nut.name }}: <b>{{ FINAL_CONFIG.style.chart.layout.legend.prefix }} {{ nut.value.toFixed(FINAL_CONFIG.style.chart.layout.nuts.selected.labels.roundingValue) }} {{ FINAL_CONFIG.style.chart.layout.legend.suffix }}</b> ({{ (nut.proportionToBranch * 100).toFixed(FINAL_CONFIG.style.chart.layout.nuts.selected.labels.roundingPercentage) }}%)</span>
                            </div>
                        </div>
                    </div>
                </foreignObject>
                <circle
                    :cx="selectedNut.x2 + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX"
                    :cy="selectedNut.y1 + svg.branchSize / 2"
                    :r="256"
                    :fill="`url(#nut_underlayer_${uid})`"
                    @click="leaveNut"
                    :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />
                <!-- LABEL CONNECTOR -->
                <g v-for="arc in openNut">
                    <path
                        v-if="isArcBigEnough(arc)"
                        :d="calcNutArrowPath(
                            arc,
                            {
                                x: selectedNut.x2 + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX,
                                y: selectedNut.y1 + svg.branchSize / 2
                            },
                            16,
                            16,
                            false,
                            false,
                            64
                        )"
                        :stroke="arc.color"
                        stroke-width="1"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                        :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    />
                </g>
                <circle
                    :cx="selectedNut.x2 + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX"
                    :cy="selectedNut.y1 + svg.branchSize / 2"
                    :r="118"
                    :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    @click="leaveNut"
                    :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />
                <path 
                    v-for="arc in openNut" 
                    :d="arc.path" 
                    :stroke="arc.color" 
                    :stroke-width="64" 
                    fill="none" 
                    @click="leaveNut" 
                    :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />
                <!-- NUT PICK CORE -->
                <circle
                    :cx="selectedNut.x2 + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX"
                    :cy="selectedNut.y1 + svg.branchSize / 2"
                    :r="100"
                    :fill="`url(#nutpick_${uid})`"
                    @click="leaveNut"
                    :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />
                <circle
                    :cx="selectedNut.x2 + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX"
                    :cy="selectedNut.y1 + svg.branchSize / 2"
                    :r="48"
                    :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    @click="leaveNut"
                    :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />

                <text
                    :x="selectedNut.x2 + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX"
                    :y="selectedNut.y1 + 8"
                    :fill="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.core.total.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.core.total.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.core.total.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                    @click="leaveNut"
                    :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                >
                    {{ FINAL_CONFIG.translations.total }}
                </text>
                <text
                    :x="selectedNut.x2 + 24 + FINAL_CONFIG.style.chart.layout.nuts.offsetX"
                    :y="selectedNut.y1 + 36"
                    :fill="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.core.value.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.core.value.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.core.value.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                    @click="leaveNut"
                    :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.formatter,
                        selectedNut.value,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.layout.nuts.selected.labels.core.value.prefix,
                            v: selectedNut.value,
                            s: FINAL_CONFIG.style.chart.layout.nuts.selected.labels.core.value.suffix,
                            r: FINAL_CONFIG.style.chart.layout.nuts.selected.roundingValue
                        }),
                        { datapoint: selectedNut }
                    ) }}
                </text>

                <!-- NUT PICK DATALABELS -->
                <g v-for="(arc, i) in openNut">
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc).x"
                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                        :y="calcMarkerOffsetY(arc)"
                        :fill="arc.color"
                        :font-size="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        ⬤
                    </text>
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc, true).x"
                        :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                        :y="calcMarkerOffsetY(arc)"
                        :fill="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.color"
                        :font-size="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        {{ selectedNut.breakdown[i].name }}
                    </text>
                </g>
                <g v-for="(arc, i) in openNut">
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc, true).x"
                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                        :y="calcMarkerOffsetY(arc) + FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :fill="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.color"
                        :font-size="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        {{ dataLabel({
                            v: (selectedNut.breakdown[i].value / selectedNut.value * 100),
                            s: '%',
                            r: FINAL_CONFIG.style.chart.layout.nuts.selected.labels.roundingPercentage
                        }) }}

                        {{ FINAL_CONFIG.translations.of }} {{ selectedNut.breakdown[i].branchName }}

                        {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.formatter,
                            selectedNut.breakdown[i].value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.prefix,
                                v: selectedNut.breakdown[i].value,
                                s: FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.suffix,
                                r: FINAL_CONFIG.style.chart.layout.nuts.selected.roundingValue
                            }),
                            { datapoint: openNut, seriesIndex: i }
                        ) }}
                    </text>
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc, true).x"
                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                        :y="calcMarkerOffsetY(arc) + FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.fontSize * 2"
                        :fill="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.color"
                        :font-size="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        {{ dataLabel({
                            v: (selectedNut.breakdown[i].proportionToRoot * 100),
                            s: '%',
                            r: FINAL_CONFIG.style.chart.layout.nuts.selected.labels.roundingPercentage
                        })}} 
                        {{ FINAL_CONFIG.translations.of }} {{ selectedNut.breakdown[i].rootName }}
                    </text>
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc, true).x"
                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                        :y="calcMarkerOffsetY(arc) + FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.fontSize * 3"
                        :fill="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.color"
                        :font-size="FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${FINAL_CONFIG.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="FINAL_CONFIG.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        {{ dataLabel({
                            v: (selectedNut.breakdown[i].proportionToTree * 100),
                            s: '%',
                            r: FINAL_CONFIG.style.chart.layout.nuts.selected.labels.roundingPercentage
                        }) }} {{ FINAL_CONFIG.translations.proportionToTree }}
                    </text>
                </g>
            </g>
            
            <!-- BRANCH DATALABELS -->
            <g v-for="branch in branches">
                <text 
                    v-if="selectedBranch && selectedBranch.id === branch.id && !selectedNut"
                    :x="branch.x1 + 6"
                    :y="branch.y1 + svg.branchSize + 24"
                    font-weight="bold"
                    text-anchor="start"
                    :font-size="FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.branches.labels.color"
                    @click="resetTree"
                >
                    {{ branch.name }}:
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.formatter,
                        branch.value,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.prefix,
                            v: branch.value,
                            s: FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.suffix,
                            r: FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.roundingValue
                        }),
                        { datapoint: branch }
                    )}}
                </text>
                <text 
                    v-if="selectedBranch && selectedBranch.id === branch.id && !selectedNut"
                    :x="branch.x1 + 6"
                    :y="branch.y1 + svg.branchSize + 48"
                    text-anchor="start"
                    :font-size="FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.branches.labels.color"
                    @click="resetTree"
                >
                    {{ dataLabel({
                        v: branch.proportionToRoot * 100,
                        s: '%',
                        r: FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.roundingPercentage
                    })}}
                    {{ FINAL_CONFIG.translations.of }} 
                    {{ branch.rootName }}
                </text>
                <text 
                    v-if="selectedBranch && selectedBranch.id === branch.id && !selectedNut"
                    :x="branch.x1 + 6"
                    :y="branch.y1 + svg.branchSize + 72"
                    text-anchor="start"
                    :font-size="FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.branches.labels.color"
                    @click="resetTree"
                >
                    {{ dataLabel({
                        v: branch.value / treeTotal * 100,
                        s: '%',
                        r: FINAL_CONFIG.style.chart.layout.branches.labels.dataLabels.roundingPercentage
                    }) }}
                    {{ FINAL_CONFIG.translations.proportionToTree }}
                </text>
        </g>
        <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'chestnut',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    chestnut: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />
        <slot name="legend" v-bind:legend="mutableDataset"></slot>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            }
        }">
            <template #content>
                <div ref="tableContainer" class="vue-ui-chestnut-table">
                    <div style="padding-top:36px; position: relative">
                        <div role="button" tabindex="0" :style="`width:32px; position: absolute; top: 0; left:4px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px; width: 32px; cursor:pointer; background:${FINAL_CONFIG.table.th.backgroundColor};`" @click="mutableConfig.showTable = false" @keypress.enter="mutableConfig.showTable = false">
                            <BaseIcon name="close" :stroke="FINAL_CONFIG.table.th.color" :stroke-width="2" />
                        </div>        
                        <div style="width: 100%" :class="{'vue-ui-responsive': isResponsive}">
                            <table data-cy="chestnut-table" class="vue-ui-data-table">
                                <caption :style="{backgroundColor: FINAL_CONFIG.table.th.backgroundColor, color: FINAL_CONFIG.table.th.color, outline: FINAL_CONFIG.table.th.outline }" class="vue-ui-data-table__caption">
                                    {{ FINAL_CONFIG.style.chart.layout.title.text }} <span v-if="FINAL_CONFIG.style.chart.layout.title.subtitle.text">{{  FINAL_CONFIG.style.chart.layout.title.subtitle.text }}</span>
                                </caption>
                                <thead>
                                    <tr role="row" :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color}`">
                                        <th :style="`outline:${FINAL_CONFIG.table.th.outline}`" v-for="th in table.head">
                                            {{ th }}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(tr, i) in table.body" :class="{'vue-ui-data-table__tbody__row' : true, 'vue-ui-data-table__tbody__row-even': i % 2 === 0, 'vue-ui-data-table__tbody__row-odd': i % 2 !== 0}" :style="`background:${FINAL_CONFIG.table.td.backgroundColor};color:${FINAL_CONFIG.table.td.color}`">
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[0]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                <span v-if="table.body[i-1]  && table.body[i - 1].rootName === tr.rootName">
                                                </span>
                                                <span v-else>
                                                    {{ tr.rootName }}
                                                </span>
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[1]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                <span v-if="table.body[i-1]  && table.body[i - 1].rootName === tr.rootName">
                                                </span>
                                                <span v-else>
                                                    {{ tr.rootValue.toFixed(FINAL_CONFIG.table.td.roundingValue) }}
                                                </span>                           
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[2]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                <span v-if="table.body[i-1]  && table.body[i - 1].rootName === tr.rootName">
                                                </span>
                                                <span v-else>
                                                    {{ (tr.rootToTotal * 100).toFixed(FINAL_CONFIG.table.td.roundingPercentage) }}%
                                                </span> 
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[3]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                <span v-if="table.body[i-1]  && table.body[i - 1].branchName === tr.branchName">
                                                </span>
                                                <span v-else>
                                                    {{ tr.branchName }}
                                                </span> 
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[4]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                <span v-if="table.body[i-1]  && table.body[i - 1].branchName === tr.branchName">
                                                </span>
                                                <span v-else>
                                                    {{ tr.branchValue.toFixed(FINAL_CONFIG.table.td.roundingValue) }}
                                                </span> 
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[5]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                <span v-if="table.body[i-1]  && table.body[i - 1].branchName === tr.branchName">
                                                </span>
                                                <span v-else>
                                                    {{ (tr.branchToRoot * 100).toFixed(FINAL_CONFIG.table.td.roundingPercentage) }}%
                                                </span>
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[6]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                <span v-if="table.body[i-1]  && table.body[i - 1].branchName === tr.branchName">
                                                </span>
                                                <span v-else>
                                                    {{ (tr.branchToTotal * 100).toFixed(FINAL_CONFIG.table.td.roundingPercentage) }}%
                                                </span>
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[7]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                {{ tr.nutName }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[8]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                {{ tr.nutValue.toFixed(FINAL_CONFIG.table.td.roundingValue) }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[9]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                {{ (tr.nutToBranch * 100).toFixed(FINAL_CONFIG.table.td.roundingPercentage) }}%
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[10]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                {{ (tr.nutToRoot * 100).toFixed(FINAL_CONFIG.table.td.roundingPercentage) }}%
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="table.head[11]">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                {{ (tr.nutToTotal * 100).toFixed(FINAL_CONFIG.table.td.roundingPercentage) }}%
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </template>
        </Accordion>

    </div>  
</template>

<style scoped lang="scss">
@import "../vue-data-ui.css";

.vue-ui-chestnut *{
    transition: unset;
}
.vue-ui-chestnut {
    user-select: none;
    position: relative;
}
.vue-ui-chestnut .vue-ui-chestnut-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-chestnut-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-chestnut-legend-item {
    display: flex;
    align-items:center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}
.vue-ui-chestnut-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

.vue-ui-chestnut-animated {
    opacity:0;
    animation: chestnut-opacity 0.2s ease-in-out forwards;
}

@keyframes chestnut-opacity {
    from {
        transform: scale(0.98, 1);
        opacity: 0;
    }
    to {
        transform: scale(1,1);
        opacity: 1;
    }
}

.vue-ui-chestnut-table {
    width: 100%;
    max-height: 300px;
    overflow: auto;
    margin-top: 24px;
    position: relative;
}
.vue-ui-data-table thead {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

table {
    width: 100%;
    padding: 1rem;
    border-collapse:collapse;
    overflow-x: auto;
}

caption,
th,
td {
    padding: 0.5rem;
    font-variant-numeric: tabular-nums;
}

caption {
    font-size: 1.3rem;
    font-weight: 700;
}

.vue-ui-responsive {
    th {
        display: none;
    }
    td {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem 1rem;
        outline: none !important;
        text-align: left;
    }
    tr {
        outline: v-bind(tdo);
    }

    td:first-child {
        padding-top: 1rem;
    }

    td:last-child {
        padding-bottom: 1rem;
    }

    td::before {
        content: attr(data-cell) ": ";
        font-weight: 700;
        text-transform: capitalize;
    }
}

path, circle, rect, text, line {
    transition: opacity 0.3s ease-in-out !important;
}
</style>
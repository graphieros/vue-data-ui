<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { treeShake, palette, opacity, shiftHue, adaptColorToBackground, makeDonut } from "../lib";
import pdf from "../pdf.js";
import * as XLSX from "xlsx";

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

const uid = ref(`vue-ui-chestnut-${Math.random()}`);

const defaultConfig = ref({
    style: {
        fontFamily: "inherit",
        chart: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            layout: {
                grandTotal: {
                    show: true,
                    fontSize: 20,
                    bold: true,
                    suffix: "",
                    prefix: "",
                    roundingValue: 0,
                    color: "#2D353C",
                    text: "Grand total",
                    offsetY: 0,
                },
                roots: {
                    stroke: "#FFFFFF",
                    strokeWidth: 5,
                    useGradient: true,
                    gradientIntensity: 20,
                    unerlayerColor: "#FFFFFF",
                    labels: {
                        show: true,
                        fontSize: 16,
                        adaptColorToBackground: true,
                        color: "#FFFFFF",
                        bold: true,
                        roundingValue: 0,
                        prefix: "",
                        suffix: "",
                        name: {
                            color: "#2D353C",
                            fontSize: 16,
                            bold: true,
                        }
                    }
                },
                verticalSeparator: {
                    stroke: "#FFFFFF",
                    strokeWidth: 5,
                },
                links: {
                    opacity: 10,
                },
                branches: {
                    stroke: "#FFFFFF",
                    strokeWidth: 0,
                    borderRadius: 6,
                    useGradient: true,
                    gradientIntensity: 20,
                    underlayerColor: "#FFFFFF",
                    widthRatio: 1.5,
                    labels: {
                        show: true,
                        fontSize: 14,
                        color: "#2D353C",
                        bold: true,
                        dataLabels: {
                            show: true,
                            hideUnderValue: 5,
                            fontSize: 14,
                            roundingValue: 0,
                            roundingPercentage: 0,
                            prefix: "",
                            suffix: "",
                        }
                    }
                },
                nuts: {
                    offsetX: 20,
                    useGradient: true,
                    gradientIntensity: 30,
                    selected: {
                        useMotion: true,
                        useGradient: true,
                        gradientIntensity: 40,
                        roundingValue: 0,
                        roundingPercentage: 0,
                        labels: {
                            dataLabels: {
                                hideUnderValue: 5,
                                color: "#2D353C",
                                fontSize: 12,
                                bold: true,
                                prefix: "",
                                suffix: ""
                            },
                            core: {
                                total: {
                                    color: "#2D353C",
                                    fontSize: 24,
                                    bold: false,
                                },
                                value: {
                                    color: "#2D353C",
                                    fontSize: 24,
                                    bold: true,
                                    prefix: "",
                                    suffix: ""
                                }
                            }
                        }
                    }
                },
                legend: {
                    fontSize: 16,
                    color: "#2D353C",
                    roundingValue: 0,
                    roundingPercentage: 0,
                    prefix: "",
                    suffix: ""
                },
                title: {
                    color: "#2D353C",
                    fontSize: 20,
                    text: "",
                    bold: true,
                    offsetY:0,
                    subtitle: {
                        text: "",
                        color: "#CCCCCC",
                        bold: false,
                        fontSize: 16,
                        offsetY: 0,
                    }
                }
            }
        }
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#FAFAFA",
            color: "#2D353C",
            outline: "1px solid #e1e5e8",
            translations: {
                rootName: "root name",
                rootValue: "root value",
                rootToTotal: "%/total",
                branchName: "branch name",
                branchValue: "branch value",
                branchToRoot: "%/root",
                branchToTotal: "%/total",
                nutName: "nut name",
                nutValue: "nut value",
                nutToBranch: "%/branch",
                nutToRoot: "%/root",
                nutToTotal: "%/total"
            }
        },
        td: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            outline: "1px solid #e1e5e8",
            roundingValue: 0,
            roundingPercentage: 0
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            showTable: "Show table"
        }
    },
    translations: {
        total: "Total",
        proportionToTree: "of grand total",
        of: "of"
    }
});

const isPrinting = ref(false);
const chestnutChart = ref(null);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref({
    x: 0,
    y: 0
});
const isTooltip = ref(false);
const tooltipContent = ref("");

onMounted(() => {
    document.addEventListener("mousemove", setClientPosition)
});

onBeforeUnmount(() => {
    document.removeEventListener("mousemove", setClientPosition)
});

function setClientPosition(e) {
    clientPosition.value.x = e.clientX;
    clientPosition.value.y = e.clientY;
}

const tooltipPosition = computed(() => {
    let offsetX = 0;
    let offsetY = 48;
    if(tooltip.value && radarChart.value) {
        const { width, height } = tooltip.value.getBoundingClientRect();
        const chartBox = radarChart.value.getBoundingClientRect();

        if(clientPosition.value.x + width / 2 > chartBox.right) {
            offsetX = -width;
        } else if(clientPosition.value.x - width / 2 < chartBox.left) {
            offsetX = 0;
        } else {
            offsetX = -width / 2;
        }

        if(clientPosition.value.y + height > chartBox.bottom) {
            offsetY = -height - 48
        }
    }
    return {
        top: clientPosition.value.y + offsetY,
        left: clientPosition.value.x + offsetX,
    }
});

const chestnutConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    return treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
});

const mutableConfig = ref({
    showTable: chestnutConfig.value.table.show,
});

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
    return props.dataset.flatMap(root => root.branches.map(branch => branch.value)).reduce((a,b) => a + b);
})

const mutableDataset = computed(() => {
    return props.dataset.map((root, i) => {
        const rootTotal = root.branches.map(branch => branch.value).reduce((a, b) => a + b);
        return {
            ...root,
            color: root.color || palette[i] || palette[i % palette.length],
            id: root.id || `root_${i}_${uid.value}`,
            type: "root",
            total: rootTotal,
            rootIndex: i,
            branches: root.branches.map((branch, j) => {
                return {
                    ...branch,
                    rootName: root.name,
                    rootIndex: i,
                    color: root.color || palette[i] || palette[i % palette.length],
                    value: branch.value >= 0 ? branch.value : 0,
                    id: branch.id || `branch_${i}_${j}_${uid.value}`,
                    proportionToRoot: branch.value / rootTotal,
                    type: "branch",
                    breakdown: branch.breakdown.map((nut, k) => {
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
                            color: nut.color || palette[k] || palette[k % palette.length],
                            value: nut.value >= 0 ? nut.value : 0
                        }
                    }),
                }
            }),
        }
    });
});

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
    if(chestnutConfig.value.style.chart.layout.branches.widthRatio <= 0) {
        return 0.1;
    }
    if(chestnutConfig.value.style.chart.layout.branches.widthRatio > 1.8) {
        return 1.8;
    }
    return chestnutConfig.value.style.chart.layout.branches.widthRatio
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

const selectedRootIndex = computed(() => {
    if(selectedNut.value) {
        return selectedNut.value.rootIndex;
    }
    return null;
});

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
            branch.x2 + 24 + chestnutConfig.value.style.chart.layout.nuts.offsetX,
            branch.y1 + svg.value.branchSize / 2,
            80,
            80
        );
    })
}

function leaveNut() {
    selectedNut.value = null;
    openNut.value = null;
}

function pickBranch(branch) {
    if (selectedBranch.value && selectedBranch.value.id === branch.id) {
        selectedBranch.value = null;
        resetTree();
    } else {
        resetTree();
        selectedBranch.value = branch;
    }
}

function pickRoot(root) {
    if (selectedRoot.value && selectedRoot.value.id === root.id) {
        resetTree();
    } else {
        resetTree();
        selectedRoot.value = root;
    }
}

function calcMarkerOffsetX(arc, isTitle = false) {
    let x = 0;
    let offsetX = isTitle ? 16 : 0;
    let anchor="middle";
    if(arc.center.endX > arc.cx) {
        x = arc.center.endX + 16 + offsetX;
        anchor = "start";
    } else if (arc.center.endX < arc.cx) {
        x = arc.center.endX - 16 - offsetX;
        anchor = "end";
    } else {
        x = arc.centerX + offsetX;
        anchor = "middle";
    }
    return {x, anchor}
}

function calcMarkerOffsetY(arc) {
    if (arc.center.endY > arc.cy) {
        return arc.center.endY + 16;
    } else if (arc.center.endY < arc.cy) {
        return arc.center.endY - 32;
    } else {
        return arc.center.endY;
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

function calcNutArrowPath(arc) {
    const start = `M${calcMarkerOffsetX(arc).x},${calcMarkerOffsetY(arc) - 4} `;
    const end = ` ${arc.center.endX},${arc.center.endY}`;
    let mid = "";
    if (arc.center.endX > arc.cx) {
        mid = `${calcMarkerOffsetX(arc).x - 12},${calcMarkerOffsetY(arc) - 4}`;
    } else if(arc.center.endX < arc.cx) {
        mid = `${calcMarkerOffsetX(arc).x + 12},${calcMarkerOffsetY(arc) - 4}`;
    } else {
        mid = `${calcMarkerOffsetX(arc).x + 12},${calcMarkerOffsetY(arc) - 4}`;
    }
    return `${start}${mid}${end}`;
}

function isArcBigEnough(arc) {
    return arc.proportion * 100 > chestnutConfig.value.style.chart.layout.nuts.selected.labels.dataLabels.hideUnderValue;
}

function displayArcPercentage(arc, stepBreakdown) {
    return isNaN(arc.value / sumValues(stepBreakdown)) ? 0 : ((arc.value / sumValues(stepBreakdown)) * 100).toFixed(0) + "%";
}

function sumValues(source) {
    return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
}


onMounted(() => {
    const height = totalBranches.value * (svg.value.branchSize + svg.value.gap) + svg.value.padding.top + svg.value.padding.bottom;
    svg.value.height = height;
});


function generatePdf(){
    isPrinting.value = true;
    pdf({
        domElement: document.getElementById(`vue-ui-chestnut_${uid.value}`),
        fileName: chestnutConfig.value.style.chart.layout.title.text || 'vue-ui-chestnut'
    }).finally(() => {
        isPrinting.value = false;
    });
}

const table = computed(() => {
    const head = [
        chestnutConfig.value.table.th.translations.rootName,
        chestnutConfig.value.table.th.translations.rootValue,
        chestnutConfig.value.table.th.translations.rootToTotal,
        chestnutConfig.value.table.th.translations.branchName,
        chestnutConfig.value.table.th.translations.branchValue,
        chestnutConfig.value.table.th.translations.branchToRoot,
        chestnutConfig.value.table.th.translations.branchToTotal,
        chestnutConfig.value.table.th.translations.nutName,
        chestnutConfig.value.table.th.translations.nutValue,
        chestnutConfig.value.table.th.translations.nutToBranch,
        chestnutConfig.value.table.th.translations.nutToRoot,
        chestnutConfig.value.table.th.translations.nutToTotal,
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

function generateXls() {
    nextTick(() => {
        const title = [[chestnutConfig.value.style.chart.layout.title.text], [chestnutConfig.value.style.chart.layout.title.subtitle.text], [""],["Grand total", treeTotal.value],[""]];
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
    
        function s2ab(s) {
            let buf = new ArrayBuffer(s.length);
            let view = new Uint8Array(buf);
            for (let i = 0; i < s.length; i++) {
                view[i] = s.charCodeAt(i) & 0xff;
            }
            return buf;
        }
    
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet(tableXls);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const excelFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
        const blob = new Blob([s2ab(excelFile)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${chestnutConfig.value.style.chart.layout.title.text.replaceAll(" ", "_") || 'vue-ui-chestnut'}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(link.href);
    });
}


function closeDetails(e){
    if(e.target && e.target.tagName === 'svg') {
        resetTree();
    }
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

</script>

<template>
    <div 
        class="vue-ui-chestnut"
        ref="chestnutChart"
        :id="`vue-ui-chestnut_${uid}`"
        :style="`font-family:${chestnutConfig.style.fontFamily};width:100%; text-align:center`"
    >
        <!-- OPTIONS -->
        <details class="vue-ui-chestnut-user-options" :style="`background:${chestnutConfig.style.chart.backgroundColor};color:${chestnutConfig.style.chart.color}`" data-html2canvas-ignore v-if="chestnutConfig.userOptions.show" ref="details">
            <summary :style="`background:${chestnutConfig.style.chart.backgroundColor};color:${chestnutConfig.style.chart.color}`">{{ chestnutConfig.userOptions.title }}</summary>
            <div class="vue-ui-chestnut-user-option-item">
                    <input type="checkbox" :id="`vue-ui-chestnut-option-table_${uid}`" :name="`vue-ui-chestnut-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-chestnut-option-table_${uid}`">{{ chestnutConfig.userOptions.labels.showTable }}</label>
                </div>
            <div class="vue-ui-chestnut-user-options-items" :style="`background:${chestnutConfig.style.chart.backgroundColor};color:${chestnutConfig.style.chart.color}`">
                <button class="vue-ui-chestnut-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`color:${chestnutConfig.style.chart.color}`">
                    <svg class="vue-ui-chestnut-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="chestnutConfig.style.chart.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-chestnut-button" @click="generateXls" :style="`background:${chestnutConfig.style.chart.backgroundColor};color:${chestnutConfig.style.chart.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <svg v-if="svg.height > 0" :viewBox="`0 0 ${svg.width} ${svg.height}`"  :style="`max-width:100%;overflow:visible;background:${chestnutConfig.style.chart.backgroundColor};color:${chestnutConfig.style.chart.color}`" @click="closeDetails">

            <!-- TITLE AS G -->
            <g v-if="!selectedNut">
                <text
                    v-if="chestnutConfig.style.chart.layout.title.text"
                    text-anchor="middle"
                    :fill="chestnutConfig.style.chart.layout.title.color"
                    :font-weight="chestnutConfig.style.chart.layout.title.bold ? 'bold' : 'normal'"
                    :font-size="chestnutConfig.style.chart.layout.title.fontSize"
                    :x="svg.width / 2"
                    :y="12 + chestnutConfig.style.chart.layout.title.fontSize + chestnutConfig.style.chart.layout.title.offsetY"
                    @click="resetTree"
                >
                    {{ chestnutConfig.style.chart.layout.title.text }}
                </text>
                <text
                    v-if="chestnutConfig.style.chart.layout.title.subtitle.text"
                    text-anchor="middle"
                    :fill="chestnutConfig.style.chart.layout.title.subtitle.color"
                    :font-weight="chestnutConfig.style.chart.layout.title.subtitle.bold ? 'bold' : 'normal'"
                    :font-size="chestnutConfig.style.chart.layout.title.subtitle.fontSize"
                    :x="svg.width / 2"
                    :y="48 + chestnutConfig.style.chart.layout.title.subtitle.fontSize + chestnutConfig.style.chart.layout.title.subtitle.offsetY"
                    @click="resetTree"
                >
                    {{ chestnutConfig.style.chart.layout.title.subtitle.text }}
                </text>
            </g>

            <!-- DEFS -->
            <defs>
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    v-for="(d, i) in mutableDataset"
                    :id="`root_gradient_${uid}_${d.rootIndex}`"
                >
                    <stop offset="0%" :stop-color="`${shiftHue(d.color, 0.05)}${opacity[100 - chestnutConfig.style.chart.layout.roots.gradientIntensity]}`"/>
                    <stop offset="100%" :stop-color="d.color" />
                </radialGradient>
                <linearGradient
                    x1="0%" y1="0%" x2="100%" y2="0%"
                    v-for="d in mutableDataset"
                    :id="`branch_gradient_${uid}_${d.rootIndex}`"
                >
                    <stop offset="0%" :stop-color="d.color" />
                    <stop offset="100%" :stop-color="`${shiftHue(d.color, 0.02)}${opacity[100 - chestnutConfig.style.chart.layout.branches.gradientIntensity]}`"/>
                </linearGradient>
                <!-- picked nut core gradient -->
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    :id="`nutpick_${uid}`"
                >
                    <stop offset="0%" :stop-color="`#FFFFFF${opacity[0]}`"/>
                    <stop offset="80%" :stop-color="`#FFFFFF${opacity[chestnutConfig.style.chart.layout.nuts.selected.gradientIntensity]}`"/>
                    <stop offset="100%" :stop-color="`#FFFFFF${opacity[0]}`"/>
                </radialGradient>
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    :id="`nut_${uid}`"
                >
                    <stop offset="0%" :stop-color="`#FFFFFF${opacity[0]}`"/>
                    <stop offset="80%" :stop-color="`#FFFFFF${opacity[chestnutConfig.style.chart.layout.nuts.gradientIntensity]}`"/>
                    <stop offset="100%" :stop-color="`#FFFFFF${opacity[0]}`"/>
                </radialGradient>
                <!-- picked nut underlayer -->
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    :id="`nut_underlayer_${uid}`"
                >
                    <stop offset="0%" :stop-color="`${chestnutConfig.style.chart.backgroundColor}${opacity[100]}`"/>
                    <stop offset="80%" :stop-color="`${chestnutConfig.style.chart.backgroundColor}${opacity[60]}`"/>
                    <stop offset="100%" :stop-color="`${chestnutConfig.style.chart.backgroundColor}${opacity[0]}`"/>
                </radialGradient>
            </defs>

            <!-- GRAND TOTAL -->
            <g v-if="chestnutConfig.style.chart.layout.grandTotal.show">
                <text
                    :x="drawableArea.seedX"
                    :y="32 + chestnutConfig.style.chart.layout.grandTotal.offsetY"
                    :font-size="chestnutConfig.style.chart.layout.grandTotal.fontSize"
                    :font-weight="chestnutConfig.style.chart.layout.grandTotal.bold ? 'bold' : 'normal'"
                    :fill="chestnutConfig.style.chart.layout.grandTotal.color"
                    text-anchor="middle"
                    @click="resetTree"
                >
                    {{ chestnutConfig.style.chart.layout.grandTotal.text }}
                </text>
                <text
                    :x="drawableArea.seedX"
                    :y="38 + chestnutConfig.style.chart.layout.grandTotal.fontSize + chestnutConfig.style.chart.layout.grandTotal.offsetY"
                    :font-size="chestnutConfig.style.chart.layout.grandTotal.fontSize"
                    :font-weight="chestnutConfig.style.chart.layout.grandTotal.bold ? 'bold' : 'normal'"
                    :fill="chestnutConfig.style.chart.layout.grandTotal.color"
                    text-anchor="middle"
                    @click="resetTree"
                >
                    {{chestnutConfig.style.chart.layout.grandTotal.prefix}} {{ treeTotal.toFixed(chestnutConfig.style.chart.layout.grandTotal.roundingValue) }} {{ chestnutConfig.style.chart.layout.grandTotal.suffix }}
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
                    :stroke="`${branch.color}${opacity[chestnutConfig.style.chart.layout.links.opacity]}`"
                    fill="none"
                    stroke-width="2"
                    shape-rendering="cirspEdges"
                    :style="`opacity:${isFocused(branch) ? 1 : 0}`"
                    @click="restTree"
                />
            </g>

            <!-- ROOTS -->
            <circle 
                v-for="root in roots" 
                :cx="root.x" 
                :cy="root.y" 
                :r="root.r" 
                :fill="chestnutConfig.style.chart.layout.roots.unerlayerColor"
                stroke="none"
                :style="`cursor:pointer; opacity:${isFocused(root) ? 1 : 0.05}`"
            />
            <circle 
                v-for="root in roots" 
                :cx="root.x" 
                :cy="root.y" 
                :r="root.r" 
                :fill="chestnutConfig.style.chart.layout.roots.useGradient ? `url(#root_gradient_${uid}_${root.rootIndex})` : root.color"
                :stroke="chestnutConfig.style.chart.layout.roots.stroke" 
                :stroke-width="chestnutConfig.style.chart.layout.roots.strokeWidth"
                :style="`cursor:pointer; opacity:${isFocused(root) ? 1 : 0.05}`"
                @click="pickRoot(root)"
            />
            <g v-if="chestnutConfig.style.chart.layout.roots.labels.show">
                <!-- ROOT TOTAL -->
                <text v-for="root in roots"
                    :x="root.x"
                    :y="root.y + chestnutConfig.style.chart.layout.roots.labels.fontSize / 2.6"
                    text-anchor="middle"
                    :font-size="chestnutConfig.style.chart.layout.roots.labels.fontSize"
                    :fill="chestnutConfig.style.chart.layout.roots.labels.adaptColorToBackground ? adaptColorToBackground(root.color) : chestnutConfig.style.chart.layout.roots.labels.color"
                    font-weight="bold"
                    stroke="black"
                    stroke-width="0.3"
                    :style="`cursor:pointer; opacity:${isFocused(root) ? 1 : 0.05}`"
                    @click="pickRoot(root)"
                >
                    {{ chestnutConfig.style.chart.layout.roots.labels.prefix }} {{ root.total.toFixed(chestnutConfig.style.chart.layout.roots.labels.roundingValue) }} {{ chestnutConfig.style.chart.layout.roots.labels.suffix }}
                </text>
                <!-- ROOT NAME LABEL -->
                <g v-for="root in roots"> 
                    <g v-if="(selectedNut && root.rootIndex === selectedNut.rootIndex) || (selectedBranch && root.rootIndex === selectedBranch.rootIndex) || (selectedRoot && root.rootIndex === selectedRoot.rootIndex)">
                        <text
                            :x="root.x"
                            :y="root.y + root.r + 24"
                            text-anchor="middle"
                            :fill="chestnutConfig.style.chart.layout.roots.labels.name.color"
                            :font-size="chestnutConfig.style.chart.layout.roots.labels.name.fontSize"
                            :font-weight="chestnutConfig.style.chart.layout.roots.labels.name.bold ? 'bold' : 'normal'"
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
                :fill="chestnutConfig.style.chart.layout.branches.underlayerColor"
                :rx="chestnutConfig.style.chart.layout.branches.borderRadius"
                stroke="none"
                :style="`opacity:${isFocused(branch) ? 1 : 0.05}`"
                @click="pickBranch(branch)"
            />
            <rect 
                v-for="branch in branches"
                :x="branch.x1"
                :y="branch.y1"
                :height="svg.branchSize"
                :width="branch.x2 - branch.x1"
                :fill="chestnutConfig.style.chart.layout.branches.useGradient ? `url(#branch_gradient_${uid}_${branch.rootIndex})` : branch.color"
                :rx="chestnutConfig.style.chart.layout.branches.borderRadius"
                :stroke="chestnutConfig.style.chart.layout.branches.stroke"
                :stroke-width="chestnutConfig.style.chart.layout.branches.strokeWidth"
                :style="`cursor:pointer; opacity:${isFocused(branch) ? 1 : 0.05}`"
                @click="pickBranch(branch)"
            />
            <g v-if="chestnutConfig.style.chart.layout.branches.labels.dataLabels.show">
                <g v-for="branch in branches">
                    <!-- BRANCH TOTAL -->
                    <text
                        v-if="branch.proportionToRoot * 100 > chestnutConfig.style.chart.layout.branches.labels.dataLabels.hideUnderValue"    
                        :x="branch.x1 + 6"
                        :y="branch.y1 + svg.branchSize / 1.5"
                        text-anchor="start"
                        :fill="adaptColorToBackground(branch.color)"
                        :font-size="chestnutConfig.style.chart.layout.branches.labels.dataLabels.fontSize"
                        font-weight="bold"
                        stroke="black"
                        stroke-width="0.3"
                        :style="`cursor:pointer; opacity:${isFocused(branch) ? 1 : 0.05}`"
                        @click="pickBranch(branch)"
                    >
                        {{ chestnutConfig.style.chart.layout.branches.labels.dataLabels.prefix }} {{ branch.value.toFixed(chestnutConfig.style.chart.layout.branches.labels.dataLabels.roundingValue) }} {{ chestnutConfig.style.chart.layout.branches.labels.dataLabels.suffix }}
                    </text>
                </g>

            </g>

            <!-- NUTS -->

            <g v-for="branch in branches">
                <path 
                    v-for="(arc, i) in makeDonut(
                        { series: branch.breakdown, base:1 },
                        branch.x2 + 24 + chestnutConfig.style.chart.layout.nuts.offsetX, 
                        branch.y1 + svg.branchSize / 2,
                        svg.branchSize / 3,
                        svg.branchSize / 3
                    )" 
                    :d="arc.path" 
                    :stroke="arc.color" 
                    :stroke-width="10" 
                    fill="none"
                    :style="`opacity:${isFocused(branch) ? 1 : 0.1}`"
                />
                <!-- core -->
                <circle
                    v-for="branch in branches"
                    :cx="branch.x2 + 24 + chestnutConfig.style.chart.layout.nuts.offsetX"
                    :cy="branch.y1 + svg.branchSize / 2"
                    :r="6"
                    :fill="chestnutConfig.style.chart.backgroundColor"
                    @click="pickNut(branch)"
                    style="cursor: pointer"
                />
                <!-- tooltip trap -->
                <circle
                    :fill="chestnutConfig.style.chart.layout.nuts.useGradient ? `url(#nut_${uid})` : 'transparent'"
                    :cx="branch.x2 + 24 + chestnutConfig.style.chart.layout.nuts.offsetX"
                    :cy="branch.y1 + svg.branchSize / 2"
                    :r="svg.branchSize / 2 + 2"
                    @click="pickNut(branch)"
                    :style="`cursor:pointer;opacity:${isFocused(branch) ? 1 : 0.1}`"
                />
            </g>

            <g v-if="chestnutConfig.style.chart.layout.branches.labels.show && !selectedBranch">
                <text
                    v-for="branch in branches"
                    :x="branch.x2 + svg.branchSize + 24 + chestnutConfig.style.chart.layout.nuts.offsetX"
                    :y="branch.y1 + svg.branchSize / 2 + 5"
                    :font-size="chestnutConfig.style.chart.layout.branches.labels.fontSize"
                    :font-weight="chestnutConfig.style.chart.layout.branches.labels.bold ? 'bold' : 'normal'"
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
                :stroke="chestnutConfig.style.chart.layout.verticalSeparator.stroke"
                :stroke-width="chestnutConfig.style.chart.layout.verticalSeparator.strokeWidth"
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
                        <div v-for="root in roots" :style="`display:flex;align-items:center;gap:3px;flex-direction:row;font-size:${chestnutConfig.style.chart.layout.legend.fontSize}px;`">
                            <svg viewBox="0 0 20 20" height="16" width="16">
                                <circle cx="10" cy="10" r="10" :fill="root.color" stroke="none"/>
                            </svg>
                            <span>{{ root.name }}</span> : <b>{{ chestnutConfig.style.chart.layout.legend.prefix }} {{ root.total.toFixed(chestnutConfig.style.chart.layout.legend.roundingValue) }} {{ chestnutConfig.style.chart.layout.legend.suffix }}</b>({{ (root.total / treeTotal * 100).toFixed(chestnutConfig.style.chart.layout.legend.roundingPercentage) }}%)
                        </div>
                    </div>
                </div>
            </foreignObject>

            <!-- NUT PICK -->
            <g v-if="selectedNut && openNut">
                <!-- NUT PICK LEGEND -->
                <foreignObject
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
                            <div v-for="(nut, i) in selectedNut.breakdown" :style="`display:flex;align-items:center;gap:6px;flex-direction:row;font-size:${chestnutConfig.style.chart.layout.legend.fontSize}px;`">
                                <svg viewBox="0 0 20 20" height="16" width="16">
                                    <circle cx="10" cy="10" r="10" :fill="nut.color" stroke="none"/>
                                </svg>
                                <span>{{ nut.name }} : <b>{{ chestnutConfig.style.chart.layout.legend.prefix }} {{ nut.value.toFixed(chestnutConfig.style.chart.layout.nuts.selected.labels.roundingValue) }} {{ chestnutConfig.style.chart.layout.legend.suffix }}</b> ({{ (nut.proportionToBranch * 100).toFixed(chestnutConfig.style.chart.layout.nuts.selected.labels.roundingPercentage) }}%)</span>
                            </div>
                        </div>
                    </div>
                </foreignObject>
                <circle
                    :cx="selectedNut.x2 + 24 + chestnutConfig.style.chart.layout.nuts.offsetX"
                    :cy="selectedNut.y1 + svg.branchSize / 2"
                    :r="256"
                    :fill="`url(#nut_underlayer_${uid})`"
                    @click="leaveNut"
                    :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />
                <circle
                    :cx="selectedNut.x2 + 24 + chestnutConfig.style.chart.layout.nuts.offsetX"
                    :cy="selectedNut.y1 + svg.branchSize / 2"
                    :r="118"
                    :fill="chestnutConfig.style.chart.backgroundColor"
                    @click="leaveNut"
                    :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />
                <path 
                    v-for="arc in openNut" 
                    :d="arc.path" 
                    :stroke="arc.color" 
                    :stroke-width="64" 
                    fill="none" 
                    @click="leaveNut" 
                    :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />
                <!-- NUT PICK CORE -->
                <circle
                    :cx="selectedNut.x2 + 24 + chestnutConfig.style.chart.layout.nuts.offsetX"
                    :cy="selectedNut.y1 + svg.branchSize / 2"
                    :r="100"
                    :fill="`url(#nutpick_${uid})`"
                    @click="leaveNut"
                    :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />
                <circle
                    :cx="selectedNut.x2 + 24 + chestnutConfig.style.chart.layout.nuts.offsetX"
                    :cy="selectedNut.y1 + svg.branchSize / 2"
                    :r="48"
                    :fill="chestnutConfig.style.chart.backgroundColor"
                    @click="leaveNut"
                    :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                />
                <!-- LABEL CONNECTOR -->
                <g v-for="arc in openNut">
                    <path
                        v-if="isArcBigEnough(arc)"
                        :d="calcNutArrowPath(arc)"
                        :stroke="arc.color"
                        stroke-width="1"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                        :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    />
                </g>
                <text
                    :x="selectedNut.x2 + 24 + chestnutConfig.style.chart.layout.nuts.offsetX"
                    :y="selectedNut.y1 + 8"
                    :fill="chestnutConfig.style.chart.layout.nuts.selected.labels.core.total.color"
                    :font-size="chestnutConfig.style.chart.layout.nuts.selected.labels.core.total.fontSize"
                    :font-weight="chestnutConfig.style.chart.layout.nuts.selected.labels.core.total.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                    @click="leaveNut"
                    :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                >
                    {{ chestnutConfig.translations.total }}
                </text>
                <text
                    :x="selectedNut.x2 + 24 + chestnutConfig.style.chart.layout.nuts.offsetX"
                    :y="selectedNut.y1 + 36"
                    :fill="chestnutConfig.style.chart.layout.nuts.selected.labels.core.value.color"
                    :font-size="chestnutConfig.style.chart.layout.nuts.selected.labels.core.value.fontSize"
                    :font-weight="chestnutConfig.style.chart.layout.nuts.selected.labels.core.value.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                    @click="leaveNut"
                    :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                >
                    {{ chestnutConfig.style.chart.layout.nuts.selected.labels.core.value.prefix }} {{ selectedNut.value.toFixed(chestnutConfig.style.chart.layout.nuts.selected.roundingValue) }} {{ chestnutConfig.style.chart.layout.nuts.selected.labels.core.value.suffix }}
                </text>

                <!-- NUT PICK DATALABELS -->
                <g v-for="(arc, i) in openNut">
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc).x"
                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                        :y="calcMarkerOffsetY(arc)"
                        :fill="arc.color"
                        :font-size="chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        ⬤
                    </text>
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc, true).x"
                        :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                        :y="calcMarkerOffsetY(arc)"
                        :fill="chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.color"
                        :font-size="chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        {{ selectedNut.breakdown[i].name }}
                    </text>
                </g>
                <g v-for="(arc, i) in openNut">
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc, true).x"
                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                        :y="calcMarkerOffsetY(arc) + chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :fill="chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.color"
                        :font-size="chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        {{ (selectedNut.breakdown[i].value / selectedNut.value * 100).toFixed(chestnutConfig.style.chart.layout.nuts.selected.labels.roundingPercentage) }}% {{ chestnutConfig.translations.of }} {{ selectedNut.breakdown[i].branchName }} ({{chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.prefix}} {{ selectedNut.breakdown[i].value }} {{chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.suffix}})
                    </text>
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc, true).x"
                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                        :y="calcMarkerOffsetY(arc) + chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.fontSize * 2"
                        :fill="chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.color"
                        :font-size="chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        {{ (selectedNut.breakdown[i].proportionToRoot * 100).toFixed(chestnutConfig.style.chart.layout.nuts.selected.labels.roundingPercentage) }}% {{ chestnutConfig.translations.of }} {{ selectedNut.breakdown[i].rootName }}
                    </text>
                    <text
                        v-if="isArcBigEnough(arc)"
                        :x="calcMarkerOffsetX(arc, true).x"
                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                        :y="calcMarkerOffsetY(arc) + chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.fontSize * 3"
                        :fill="chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.color"
                        :font-size="chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.fontSize"
                        :style="`font-weight:${chestnutConfig.style.chart.layout.nuts.selected.labels.dataLabels.bold ? 'bold': ''}`"
                        :class="chestnutConfig.style.chart.layout.nuts.selected.useMotion ? 'vue-ui-chestnut-animated' : ''"
                    >
                        {{ (selectedNut.breakdown[i].proportionToTree * 100).toFixed(chestnutConfig.style.chart.layout.nuts.selected.labels.roundingPercentage) }}% {{ chestnutConfig.translations.proportionToTree }}
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
                    :font-size="chestnutConfig.style.chart.layout.branches.labels.dataLabels.fontSize"
                    :fill="chestnutConfig.style.chart.layout.branches.labels.color"
                    @click="resetTree"
                >
                    {{ branch.name }} : {{ chestnutConfig.style.chart.layout.branches.labels.dataLabels.prefix }} {{ branch.value.toFixed(chestnutConfig.style.chart.layout.branches.labels.dataLabels.roundingValue) }} {{ chestnutConfig.style.chart.layout.branches.labels.dataLabels.suffix }}
                </text>
                <text 
                    v-if="selectedBranch && selectedBranch.id === branch.id && !selectedNut"
                    :x="branch.x1 + 6"
                    :y="branch.y1 + svg.branchSize + 48"
                    text-anchor="start"
                    :font-size="chestnutConfig.style.chart.layout.branches.labels.dataLabels.fontSize"
                    :fill="chestnutConfig.style.chart.layout.branches.labels.color"
                    @click="resetTree"
                >
                    {{ (branch.proportionToRoot * 100).toFixed(chestnutConfig.style.chart.layout.branches.labels.dataLabels.roundingPercentage) }}% {{ chestnutConfig.translations.of }} {{ branch.rootName }}
                </text>
                <text 
                    v-if="selectedBranch && selectedBranch.id === branch.id && !selectedNut"
                    :x="branch.x1 + 6"
                    :y="branch.y1 + svg.branchSize + 72"
                    text-anchor="start"
                    :font-size="chestnutConfig.style.chart.layout.branches.labels.dataLabels.fontSize"
                    :fill="chestnutConfig.style.chart.layout.branches.labels.color"
                    @click="resetTree"
                >
                    {{ (branch.value / treeTotal * 100).toFixed(chestnutConfig.style.chart.layout.branches.labels.dataLabels.roundingPercentage) }}% {{ chestnutConfig.translations.proportionToTree }}
                </text>
        </g>
        </svg>
        <!-- DATA TABLE -->
        <div @click="closeDetails" class="vue-ui-chestnut-table" :style="`width:100%;overflow-x:auto`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="chestnutConfig.style.chart.layout.title.text">
                        <th colspan="12" :style="`background:${chestnutConfig.table.th.backgroundColor};color:${chestnutConfig.table.th.color};outline:${chestnutConfig.table.th.outline}`">
                            <span>{{ chestnutConfig.style.chart.layout.title.text }}</span>
                            <span v-if="chestnutConfig.style.chart.layout.title.subtitle.text">
                                : {{ chestnutConfig.style.chart.layout.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th :style="`background:${chestnutConfig.table.th.backgroundColor};color:${chestnutConfig.table.th.color};outline:${chestnutConfig.table.th.outline}`" v-for="th in table.head">
                            {{ th }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tr, i) in table.body">
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            <span v-if="table.body[i-1]  && table.body[i - 1].rootName === tr.rootName">
                            </span>
                            <span v-else>
                                {{ tr.rootName }}
                            </span>
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            <span v-if="table.body[i-1]  && table.body[i - 1].rootName === tr.rootName">
                            </span>
                            <span v-else>
                                {{ tr.rootValue.toFixed(chestnutConfig.table.td.roundingValue) }}
                            </span>                           
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            <span v-if="table.body[i-1]  && table.body[i - 1].rootName === tr.rootName">
                            </span>
                            <span v-else>
                                {{ (tr.rootToTotal * 100).toFixed(chestnutConfig.table.td.roundingPercentage) }}%
                            </span> 
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            <span v-if="table.body[i-1]  && table.body[i - 1].branchName === tr.branchName">
                            </span>
                            <span v-else>
                                {{ tr.branchName }}
                            </span> 
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            <span v-if="table.body[i-1]  && table.body[i - 1].branchName === tr.branchName">
                            </span>
                            <span v-else>
                                {{ tr.branchValue.toFixed(chestnutConfig.table.td.roundingValue) }}
                            </span> 
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            <span v-if="table.body[i-1]  && table.body[i - 1].branchName === tr.branchName">
                            </span>
                            <span v-else>
                                {{ (tr.branchToRoot * 100).toFixed(chestnutConfig.table.td.roundingPercentage) }}%
                            </span>
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            <span v-if="table.body[i-1]  && table.body[i - 1].branchName === tr.branchName">
                            </span>
                            <span v-else>
                                {{ (tr.branchToTotal * 100).toFixed(chestnutConfig.table.td.roundingPercentage) }}%
                            </span>
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            {{ tr.nutName }}
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            {{ tr.nutValue.toFixed(chestnutConfig.table.td.roundingValue) }}
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            {{ (tr.nutToBranch * 100).toFixed(chestnutConfig.table.td.roundingPercentage) }}%
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            {{ (tr.nutToRoot * 100).toFixed(chestnutConfig.table.td.roundingPercentage) }}%
                        </td>
                        <td :style="`background:${chestnutConfig.table.td.backgroundColor};color:${chestnutConfig.table.td.color};outline:${chestnutConfig.table.td.outline}`">
                            {{ (tr.nutToTotal * 100).toFixed(chestnutConfig.table.td.roundingPercentage) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>  
</template>

<style scoped>
.vue-ui-chestnut *{
    transition: unset;
}
.vue-ui-chestnut {
    user-select: none;
    position: relative;
    padding-top: 36px;
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

/** */
.vue-ui-chestnut-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-chestnut-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-chestnut summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-chestnut-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-chestnut-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-chestnut-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-chestnut-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-chestnut-print-icon {
    animation: smartspin 0.5s infinite linear;
}
@keyframes smartspin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.vue-ui-chestnut table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-chestnut table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-chestnut table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
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
</style>
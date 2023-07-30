<script setup>
import { ref, computed } from "vue";
import { treeShake, makeDonut, palette, convertColorToHex } from '../lib';

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

const uid = ref(`vue-ui-donut-${Math.random()}`);

const defaultConfig = ref({
    style: {
        fontFamily: "inherit",
        chart: {
            useGradient: true,
            gradientIntensity: 40,
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            layout: {
                useDiv: false,
                labels: {
                    percentage: {
                        color: "#2D353C",
                        bold: true,
                        fontSize: 18
                    },
                    name: {
                        color: "#2D353C",
                        bold: false,
                        fontSize: 14,
                    },
                    hollow: {
                        total: {
                            show: true,
                            bold: false,
                            fontSize: 18,
                            color: "#AAAAAA",
                            text:  "Total",
                            offsetY: 0,
                            value: {
                                color: "#2D353C",
                                fontSize: 18,
                                bold: true,
                                suffix: "",
                                prefix: "",
                                offsetY: 0,
                                rounding: 0,
                            }
                        },
                        average: {
                            show: true,
                            bold: false,
                            fontSize: 18,
                            color: "#AAAAAA",
                            text:  "Average",
                            offsetY: 0,
                            value: {
                                color: "#2D353C",
                                fontSize: 18,
                                bold: true,
                                suffix: "",
                                prefix: "",
                                offsetY: 0,
                                rounding: 0,
                            }
                        }
                    }
                },
                donut: {
                    strokeWidth: 64
                }
            },
            title: {
                text: "",
                color: "#2D353C",
                fontSize: 20,
                bold: true,
                subtitle: {
                    color: "#A1A1A1",
                    text: "",
                    fontSize: 16,
                    bold: false
                }
            }
        }
    },
    translations: {
        total: "Total",
        average: "Average",
    }
});

const donutConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    return treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
});

const svg = computed(() => {
    const height = donutConfig.value.style.chart.layout.useDiv ? 360 : 512;
    return {
        height,
        width: 512
    }
});

const donutSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: serie.color || palette[i] || palette[i % palette.length],
                value: serie.values.reduce((a,b) => a + b, 0)
            }
        })
        .sort((a,b) => b.value - a.value)
})

const currentDonut = computed(() => {
    return makeDonut({ series: donutSet.value }, svg.value.width / 2, svg.value.height / 2, 100, 100)
});

function calcDonutMarkerLabelPositionX(arc) {
    return arc.center.endX + calcMarkerOffset(arc, 256);
}
function calcMarkerOffset(arc, centerX) {
    const isRight = arc.center.endX - centerX >= 0;
    if (isRight) {
        return 30;
    }
    return -30;
}

function isArcBigEnough(arc) {
    return arc.proportion * 100 > 3;
}

function displayArcPercentage(arc, stepBreakdown) {
    return isNaN(arc.value / sumValues(stepBreakdown)) ? 0 : ((arc.value / sumValues(stepBreakdown)) * 100).toFixed(0) + "%";
}

function sumValues(source) {
    return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
}

const gradientIntensity = ref([
    "00","03","05","08","0A","0D","0F","12","14","17","1A","1C","1F","21","24","26","29","2B","2E","30","33","36","38","3B","3D","40","42","45","47","4A","4D","4F","52","54","57","59","5C","5E","61","63","66","69","6B","6E","70","73","75","78","7A","7D","80","82","85","87","8A","8C","8F","91","94","96","99","9C","9E","A1","A3","A6","A8","AB","AD","B0","B3","B5","B8","BA","BD","BF","C2","C4","C7","C9","CC","CF","D1","D4","D6","D9","DB","DE","E0","E3","E6","E8","EB","ED","F0","F2","F5","F7","FA","FC","FF"
]);

const total = computed(() => {
    return props.dataset.flatMap(s => s.values).reduce((a,b) => a + b, 0);
});

const average = computed(() => {
    const v = props.dataset.flatMap(s => s.values);
    return total.value / v.length;
})

</script>

<template>
    <div class="vue-ui-donut" :style="`font-family:${donutConfig.style.fontFamily};width:100%; text-align:center`">
        <div v-if="donutConfig.style.chart.layout.useDiv && donutConfig.style.chart.title.text" :style="`width:100%;background:${donutConfig.style.chart.backgroundColor}`">
            <div :style="`width:100%;text-align:center;color:${donutConfig.style.chart.title.color};font-size:${donutConfig.style.chart.title.fontSize}px;font-weight:${donutConfig.style.chart.title.bold ? 'bold': ''}`">
                {{ donutConfig.style.chart.title.text }}
            </div>
            <div v-if="donutConfig.style.chart.title.subtitle.text" :style="`width:100%;text-align:center;color:${donutConfig.style.chart.title.subtitle.color};font-size:${donutConfig.style.chart.title.subtitle.fontSize}px;font-weight:${donutConfig.style.chart.title.subtitle.bold ? 'bold': ''}`">
                {{ donutConfig.style.chart.title.subtitle.text }}
            </div>
        </div>
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%; overflow: visible; padding: 0 24px;background:${donutConfig.style.chart.backgroundColor};color:${donutConfig.style.chart.color}`">
            
            <!-- DEFS -->
            <defs>
                <radialGradient :id="`gradient_${uid}`" v-if="donutConfig.style.chart.useGradient">
                    <stop offset="0%" :stop-color="`${convertColorToHex(donutConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="77%" :stop-color="convertColorToHex(donutConfig.style.chart.backgroundColor) + gradientIntensity[donutConfig.style.chart.gradientIntensity]" />
                    <stop offset="100%" :stop-color="`${convertColorToHex(donutConfig.style.chart.backgroundColor)}00`" />
                </radialGradient>
            </defs>

            
            <g v-if="donutConfig.style.chart.title.text && !donutConfig.style.chart.layout.useDiv">
                <text
                    :font-size="donutConfig.style.chart.title.fontSize"
                    :fill="donutConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="48"
                    text-anchor="middle"
                    :style="`font-weight:${donutConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ donutConfig.style.chart.title.text }}
                </text>
                <text
                    v-if="donutConfig.style.chart.title.subtitle.text"
                    :font-size="donutConfig.style.chart.title.subtitle.fontSize"
                    :fill="donutConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="48 + donutConfig.style.chart.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${donutConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ donutConfig.style.chart.title.subtitle.text }}
                </text>
            </g>
            <path 
                v-for="(arc, i) in currentDonut" 
                :key="`arc_${i}`" 
                :d="arc.path" 
                :stroke="`${arc.color}CC`" 
                :stroke-width="defaultConfig.style.chart.layout.donut.strokeWidth" 
                fill="none"
            />

            <!-- HOLLOW -->
            <circle
                v-if="donutConfig.style.chart.useGradient"
                :cx="svg.width / 2"
                :cy="svg.height / 2"
                :r="136"
                :fill="`url(#gradient_${uid})`"
            />
            <circle 
                :cx="svg.width / 2" 
                :cy="svg.height / 2" 
                :r="svg.width - 400 - donutConfig.style.chart.layout.donut.strokeWidth / 2"
                :fill="donutConfig.style.chart.backgroundColor"/>

            <!-- HOLLOW LABELS -->
            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.total.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 - (donutConfig.style.chart.layout.labels.hollow.average.show ? donutConfig.style.chart.layout.labels.hollow.total.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.total.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.total.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.total.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.total.bold ? 'bold': ''}`"
            >
                {{ donutConfig.style.chart.layout.labels.hollow.total.text }}
            </text>
            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.total.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 + donutConfig.style.chart.layout.labels.hollow.total.fontSize - (donutConfig.style.chart.layout.labels.hollow.average.show ? donutConfig.style.chart.layout.labels.hollow.total.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.total.value.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.total.value.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.total.value.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.total.value.bold ? 'bold': ''}`"
            >
                {{ total.toFixed(donutConfig.style.chart.layout.labels.hollow.total.value.rounding) }}
            </text>

            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.average.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 + (donutConfig.style.chart.layout.labels.hollow.total.show ? donutConfig.style.chart.layout.labels.hollow.average.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.average.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.average.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.average.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.average.bold ? 'bold': ''}`"
            >
                {{ donutConfig.style.chart.layout.labels.hollow.average.text }}
            </text>
            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.average.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 + (donutConfig.style.chart.layout.labels.hollow.total.show ? donutConfig.style.chart.layout.labels.hollow.average.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.average.fontSize + donutConfig.style.chart.layout.labels.hollow.average.value.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.average.value.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.average.value.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.average.value.bold ? 'bold': ''}`"
            >
                {{ average.toFixed(donutConfig.style.chart.layout.labels.hollow.average.value.rounding) }}
            </text>


            <!-- DATALABELS -->
            <g v-for="(arc, i) in currentDonut">
                <text
                    v-if="isArcBigEnough(arc)"
                    text-anchor="middle"
                    :x="calcDonutMarkerLabelPositionX(arc)"
                    :y="arc.center.endY - donutConfig.style.chart.layout.labels.percentage.fontSize / 2"
                    :fill="donutConfig.style.chart.layout.labels.percentage.color"
                    :font-size="donutConfig.style.chart.layout.labels.percentage.fontSize"
                    :style="`font-weight:${donutConfig.style.chart.layout.labels.percentage.bold ? 'bold': ''}`"
                >
                    {{ displayArcPercentage(arc, currentDonut)  }}
                </text>
                <text
                    v-if="isArcBigEnough(arc)"
                    text-anchor="middle"
                    :x="calcDonutMarkerLabelPositionX(arc)"
                    :y="arc.center.endY + donutConfig.style.chart.layout.labels.percentage.fontSize / 2"
                    :fill="donutConfig.style.chart.layout.labels.name.color"
                    :font-size="donutConfig.style.chart.layout.labels.name.fontSize"
                    :style="`font-weight:${donutConfig.style.chart.layout.labels.name.bold ? 'bold': ''}`"
                >
                    {{ arc.name}}
                </text>
            </g>
        </svg>
    </div>
</template>

<style>
.vue-ui-donut {
    user-select: none;
}
.vue-ui-donut .vue-ui-donut-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
</style>
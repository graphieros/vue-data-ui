<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
    abbreviate,
    adaptColorToBackground,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid, 
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    isFunction,
    objectIsEmpty,
    opacity,
    palette,
    shiftHue,
    themePalettes,
    XMLNS
} from "../lib";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";
import Legend from "../atoms/Legend.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";

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
})

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiWaffle',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'values']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiWaffle',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                });
            });
        });
    }
});


const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_waffle);

const isImaging = ref(false);
const isPrinting = ref(false);
const waffleChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);
const step = ref(0);

const waffleConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });

    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_waffle[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
});

const customPalette = computed(() => {
    return convertCustomPalette(waffleConfig.value.customPalette);
})


const mutableConfig = ref({
    showTable: waffleConfig.value.table.show
})

const svg = computed(() => {
    const height = 512;
    return {
        height,
        width: 512,
    }
});

const drawingArea = computed(() => {
    return {
        top: 0,
        left: 0,
        height: 512,
        width: 512,
    }
});

const rectDimension = computed(() => {
    return ((drawingArea.value.width - (waffleConfig.value.style.chart.layout.grid.size * waffleConfig.value.style.chart.layout.grid.spaceBetween )) / waffleConfig.value.style.chart.layout.grid.size);
});

const absoluteRectDimension = computed(() => {
    return ((drawingArea.value.width ) / waffleConfig.value.style.chart.layout.grid.size);
})

function calculateProportions(numbers) {
  const totalSum = numbers.reduce((a, b) => a + b, 0);
  const proportions = numbers.map(num => Math.round((num / totalSum) * 100) / 100);
  const roundedSum = proportions.reduce((a, b) => a + b, 0);

  if (roundedSum !== 1) {
    const lastIndex = proportions.length - 1;
    proportions[lastIndex] += (1 - roundedSum);
    proportions[lastIndex] = Math.round(proportions[lastIndex] * 100) / 100;
  }
  return proportions;
}

const datasetCopyReference = computed(() => {
    return props.dataset.map((s, i) => {
        return {
            ...s,
            color: convertColorToHex(s.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            uid: `serie_${i}`,
            absoluteIndex: i
        }
    });
});

const datasetCopy = ref(datasetCopyReference.value)

const proportions = computed(() => {
    const numbers = datasetCopy.value
        .filter((serie,i) => !segregated.value.includes(serie.uid))
        .map((serie, i) => (serie.values || []).reduce((a,b) => a + b, 0));
    return calculateProportions(numbers);
});

const immutableProportions = computed(() => {
    const numbers = datasetCopy.value
        .map((serie, i) => (serie.values || []).reduce((a,b) => a + b));
    return calculateProportions(numbers);
});

const waffleSet = computed(() => {
    props.dataset.forEach((ds, i) => {
        if([null, undefined].includes(ds.values)) {
            error({
                componentName: 'VueUiWaffle',
                type: 'datasetSerieAttribute',
                property: 'values (number[])',
                index: i
            });
        }
    })
    return datasetCopy.value
        .filter((serie, i) => !segregated.value.includes(serie.uid))
        .map((serie, i) => {
            return {
                absoluteIndex: serie.absoluteIndex,
                uid: serie.uid,
                name: serie.name,
                color: serie.color,
                value: (serie.values || []).reduce((a,b) => a + b, 0),
                absoluteValues: serie.values || [],
                proportion: proportions.value[i] * Math.pow(waffleConfig.value.style.chart.layout.grid.size, 2)
            }
        })
});

const immutableSet = computed(() => {
    return datasetCopy.value
        .map((serie, i) => {
            return {
                absoluteIndex: serie.absoluteIndex,
                uid: serie.uid,
                name: serie.name,
                color: serie.color,
                value: (serie.values || []).reduce((a,b) => a + b, 0),
                absoluteValues: serie.values || [],
                proportion: immutableProportions.value[i] * Math.pow(waffleConfig.value.style.chart.layout.grid.size, 2)
            }
        })
});

function getData() {
    return immutableSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value,
            proportion: ds.proportion  / (Math.pow(waffleConfig.value.style.chart.layout.grid.size, 2))
        }
    });
}

const cumulatedSet = computed(() => {
    return waffleSet.value.map((serie, i) => {
        const start = i > 0 ? waffleSet.value.filter((_,j) => j < i).map(el => el.proportion).reduce((a,b) => a + b) + serie.proportion - waffleSet.value[i - 1].proportion: serie.proportion - serie.proportion;
        const end = start + serie.proportion;
        const rects = [];
        for(let j = start; j <= end; j += 1) {
            rects.push(j)
        }
        return {
            ...serie,
            start: i > 0 ? waffleSet.value.filter((_,j) => j < i).map(el => el.proportion).reduce((a,b) => a + b) + serie.proportion - waffleSet.value[i - 1].proportion: serie.proportion - serie.proportion,
            rects
        }
    });
});

const rects = computed(() => {
    return cumulatedSet.value.flatMap((serie, s) => {
        return serie.rects.map((rect, i) => {
            return {
                isFirst: i === 0,
                isLongEnough: rect.length > 2,
                name: serie.name,
                color: serie.color,
                value: serie.value,
                serieIndex: s,
                absoluteStartIndex: i < 3,
                serieId: serie.uid,
                ...serie
            }
        })
    }).map((s, i) => {
        return {
            ...s,
            isAbsoluteFirst: i % waffleConfig.value.style.chart.layout.grid.size === 0,
        }
    })
});

const positions = computed(() => {
    const grid = [];
    for(let i = 0; i < waffleConfig.value.style.chart.layout.grid.size; i += 1) {
        for(let j = 0; j < waffleConfig.value.style.chart.layout.grid.size; j += 1) {
            grid.push({
                isStartOfLine: j === 0,
                position: waffleConfig.value.style.chart.layout.grid.vertical ? i : j,
                x: (waffleConfig.value.style.chart.layout.grid.vertical ? i : j) * (rectDimension.value + waffleConfig.value.style.chart.layout.grid.spaceBetween),
                y: (waffleConfig.value.style.chart.layout.grid.vertical ? j : i) * (rectDimension.value + waffleConfig.value.style.chart.layout.grid.spaceBetween) + drawingArea.value.top,
            })
        }
    }
    return grid;
});

const segregated = ref([]);
const isAnimating = ref(false);
const rafUp = ref(null);
const rafDown = ref(null);

function segregate(uid) {
    if (!waffleConfig.value.useAnimation) {
        if(segregated.value.includes(uid)) {
            segregated.value = segregated.value.filter(s => s !== uid);
        } else if(segregated.value.length < legendSet.value.length - 1 && legendSet.value.length > 1) {
            segregated.value.push(uid);
        }
        return
    }

    const target = datasetCopyReference.value.find(el => el.uid === uid).values.reduce((a, b) => a + b, 0);
    const source = datasetCopy.value.find(el => el.uid === uid).values.reduce((a, b) => a + b, 0);
    let initVal = source;

    if(segregated.value.includes(uid)) {
        segregated.value = segregated.value.filter(s => s !== uid);
        const targetVal = target;
        function animUp() {
            if(initVal > targetVal) {
                cancelAnimationFrame(rafUp.value);
                datasetCopy.value = datasetCopy.value.map((ds, i) => {
                    if (ds.uid === uid) {
                        return {
                            ...ds,
                            values: [targetVal]
                        }
                    } else {
                        return ds
                    }
                });
                isAnimating.value = false;
            } else {
                isAnimating.value = true;
                initVal += (targetVal * 0.025)
                datasetCopy.value = datasetCopy.value.map((ds, i) => {
                    if (ds.uid === uid) {
                        return {
                            ...ds,
                            values: [initVal]
                        }
                    } else {
                        return ds;
                    }
                })
                rafUp.value = requestAnimationFrame(animUp)
            }
        }
        animUp()
    } else if(segregated.value.length < legendSet.value.length - 1 && legendSet.value.length > 1) {
        function animDown() {
            if(initVal < 0.1) {
                cancelAnimationFrame(rafDown.value)
                segregated.value.push(uid);
                datasetCopy.value = datasetCopy.value.map((ds, i) => {
                    if (ds.uid === uid) {
                        return {
                            ...ds,
                            values: [0]
                        }
                    } else {
                        return ds;
                    }
                });
                isAnimating.value = false;
            } else {
                isAnimating.value = true;
                initVal /= 1.5;
                datasetCopy.value = datasetCopy.value.map((ds, i) => {
                    if (ds.uid === uid) {
                        return {
                            ...ds,
                            values: [initVal]
                        }
                    } else {
                        return ds
                    }
                })
                rafDown.value = requestAnimationFrame(animDown)
            }
        }
        animDown()
    }
    emit('selectLegend', waffleSet.value.map(w => {
        return {
            name: w.name,
            color: w.color,
            value: w.value,
            proportion: (w.proportion / (Math.pow(waffleConfig.value.style.chart.layout.grid.size, 2)))
        }
    }));
}

const legendSet = computed(() => {
    return datasetCopy.value
        .map((serie, i) => {
            return {
                name: serie.name,
                color: serie.color || customPalette[i] || palette[i] || palette[i % palette.length],
                value: (serie.values || []).reduce((a,b) => a + b, 0),
                uid: serie.uid,
                shape: 'square'
            }
        })
        .map((el, i) => {
            return {
                ...el,
                proportion: el.value / datasetCopy.value.map(ds => (ds.values || []).reduce((a,b) => a + b, 0)).reduce((a, b) => a + b, 0),
                opacity: segregated.value.includes(el.uid) ? 0.5 : 1,
                segregate: () => segregate(el.uid),
                isSegregated: segregated.value.includes(el.uid)
            }
        })
});

const legendConfig = computed(() => {
    return {
        cy: 'waffle-div-legend',
        backgroundColor: waffleConfig.value.style.chart.legend.backgroundColor,
        color: waffleConfig.value.style.chart.legend.color,
        fontSize: waffleConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: waffleConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const total = computed(() => {
    return waffleSet.value.map(s => s.value).reduce((a,b) => a + b, 0);
});

const dataTooltipSlot = ref(null);

function useTooltip(index) {
    if(segregated.value.length === props.dataset.length) return;
    
    const selected = rects.value[index];

    dataTooltipSlot.value = {
        datapoint: selected,
        seriesIndex: selected.absoluteIndex,
        series: datasetCopy.value,
        config: waffleConfig.value
    }
    
    isTooltip.value = true;
    selectedSerie.value = rects.value[index].serieIndex;

    const customFormat = waffleConfig.value.style.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({ 
        seriesIndex: rects.value[index].absoluteIndex, 
        datapoint: selected, 
        series: datasetCopy.value, 
        config: waffleConfig.value}))) {
        tooltipContent.value = customFormat({ 
            seriesIndex: rects.value[index].absoluteIndex, 
            datapoint: selected, 
            series: datasetCopy.value, 
            config: waffleConfig.value})
    } else {
        let html = "";
    
        html += `<div data-cy="waffle-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${waffleConfig.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${selected.name}</div>`; 
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><rect data-cy="waffle-tooltip-marker" x="0" y="0" height="12" width="12" stroke="none" rx="1" fill="${selected.color}" /></svg>`;
        if(waffleConfig.value.style.chart.tooltip.showValue) {
            html += `<b data-cy="waffle-tooltip-value">${dataLabel({p:waffleConfig.value.style.chart.layout.labels.dataLabels.prefix, v: selected.value, s: waffleConfig.value.style.chart.layout.labels.dataLabels.suffix, r: waffleConfig.value.style.chart.tooltip.roundingValue})}</b>`;
        }
        if(waffleConfig.value.style.chart.tooltip.showPercentage) {
            if(!waffleConfig.value.style.chart.tooltip.showValue) {
                html += `<b>${(selected.value / total.value * 100).toFixed(waffleConfig.value.style.chart.tooltip.roundingPercentage)}%</b></div>`;
            } else {
                html += `<span data-cy="waffle-tooltip-percentage">(${(selected.value / total.value * 100).toFixed(waffleConfig.value.style.chart.tooltip.roundingPercentage)}%)</span></div>`;
            }
        }
        tooltipContent.value = html;
    }

}

const emit = defineEmits(['selectLegend']);

const table = computed(() => {
    const head = waffleSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = waffleSet.value.map(ds => ds.value);
    return { head, body };
});

function getBlurFilter(index) {
    if (waffleConfig.value.useBlurOnHover && ![null, undefined].includes(selectedSerie.value) && selectedSerie.value !== index) {
        return `url(#blur_${uid.value})`;
      } else {
        return '';
      }
}

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-waffle_${uid.value}`),
            fileName: waffleConfig.value.style.chart.title.text || 'vue-ui-waffle'
        }).finally(() => {
            isPrinting.value = false;
        })
    }, 100)
}

function showSpinnerImage() {
    isImaging.value = true;
}

function generateImage() {
    showSpinnerImage();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        img({
            domElement: document.getElementById(`vue-ui-waffle_${uid.value}`),
            fileName: waffleConfig.value.style.chart.title.text || 'vue-ui-waffle',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[waffleConfig.value.style.chart.title.text],[waffleConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: waffleConfig.value.style.chart.title.text || "vue-ui-waffle"})
    });
}

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`,
        dataLabel({p:waffleConfig.value.style.chart.layout.labels.dataLabels.prefix, v:total.value, s: waffleConfig.value.style.chart.layout.labels.dataLabels.suffix, r: waffleConfig.value.table.td.roundingValue}),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            dataLabel({p:waffleConfig.value.style.chart.layout.labels.dataLabels.prefix, v: table.value.body[i], s:waffleConfig.value.style.chart.layout.labels.dataLabels.suffix, r:waffleConfig.value.table.td.roundingValue }),
            isNaN(table.value.body[i] / total.value) ? "-" : (table.value.body[i] / total.value * 100).toFixed(waffleConfig.value.table.td.roundingPercentage) + '%'
        ]
    });

    const config = {
        th: {
            backgroundColor: waffleConfig.value.table.th.backgroundColor,
            color: waffleConfig.value.table.th.color,
            outline: waffleConfig.value.table.th.outline
        },
        td: {
            backgroundColor: waffleConfig.value.table.td.backgroundColor,
            color: waffleConfig.value.table.td.color,
            outline: waffleConfig.value.table.td.outline
        },
        shape: 'square',
        breakpoint: waffleConfig.value.table.responsiveBreakpoint
    }

    const colNames = [
        waffleConfig.value.table.columnNames.series,
        waffleConfig.value.table.columnNames.value,
        waffleConfig.value.table.columnNames.percentage
    ]

    return {
        head,
        body,
        config,
        colNames
    }
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable
});

</script>

<template>
    <div 
        :class="`vue-ui-waffle ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" 
        ref="waffleChart" 
        :id="`vue-ui-waffle_${uid}`"
        :style="`font-family:${waffleConfig.style.fontFamily};width:100%; text-align:center;${!waffleConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${waffleConfig.style.chart.backgroundColor}`"
    >
        <!-- TITLE AS DIV -->
        <div v-if="waffleConfig.style.chart.title.text" :style="`width:100%;background:${waffleConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <Title
                :config="{
                    title: {
                        cy: 'waffle-title',
                        text: waffleConfig.style.chart.title.text,
                        color: waffleConfig.style.chart.title.color,
                        fontSize: waffleConfig.style.chart.title.fontSize,
                        bold: waffleConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'waffle-subtitle',
                        text: waffleConfig.style.chart.title.subtitle.text,
                        color: waffleConfig.style.chart.title.subtitle.color,
                        fontSize: waffleConfig.style.chart.title.subtitle.fontSize,
                        bold: waffleConfig.style.chart.title.subtitle.bold
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="waffleConfig.userOptions.show && isDataset"
            :backgroundColor="waffleConfig.style.chart.backgroundColor"
            :color="waffleConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="waffleChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
        />

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" data-cy="waffle-svg" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${waffleConfig.style.chart.backgroundColor};color:${waffleConfig.style.chart.color}`" >

            <!-- DEFS -->
            <defs>
                <radialGradient cx="50%" cy="50%" r="50%" fx="50%" fy="50%" v-for="(rect,i) in rects" :id="`gradient_${uid}_${i}`">
                    <stop offset="0%" :stop-color="`${shiftHue(rect.color, 0.05)}${opacity[100 - waffleConfig.style.chart.layout.rect.gradientIntensity]}`"/>
                    <stop offset="100%" :stop-color="rect.color" />
                </radialGradient>
            </defs>

            <!-- RECTS -->
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="2" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </defs>

            <!-- CUSTOM CELLS SLOTS -->
            <template v-if="waffleConfig.useCustomCells">
                <foreignObject 
                    v-for="(position, i) in positions"
                    :x="position.x"
                    :y="position.y"
                    :height="rectDimension"
                    :width="rectDimension"
                    class="vue-ui-waffle-custom-cell-foreignObject"
                >
                    <slot name="cell" v-bind="{ cell: {...position, color: rects[i].color, ...rects[i]}, isSelected: [null, undefined].includes(selectedSerie) ? true : rects[i].serieIndex === selectedSerie }"/>
                </foreignObject>
            </template> 

            <template v-else>
                <rect
                    v-for="(position, i) in positions"
                    :data-cy="`waffle-rect-underlayer-${i}`"
                    :rx="waffleConfig.style.chart.layout.rect.rounded ? waffleConfig.style.chart.layout.rect.rounding : 0"
                    :x="position.x"
                    :y="position.y"
                    :height="rectDimension"
                    :width="rectDimension"
                    fill="white"
                    :stroke="waffleConfig.style.chart.layout.rect.stroke"
                    :stroke-width="waffleConfig.style.chart.layout.rect.strokeWidth"
                    :filter="getBlurFilter(rects[i].serieIndex)"
                />
                <rect
                    v-for="(position, i) in positions"
                    :rx="waffleConfig.style.chart.layout.rect.rounded ? waffleConfig.style.chart.layout.rect.rounding : 0"
                    :x="position.x"
                    :y="position.y"
                    :height="rectDimension"
                    :width="rectDimension"
                    :fill="waffleConfig.style.chart.layout.rect.useGradient && waffleConfig.style.chart.layout.rect.gradientIntensity > 0 ? `url(#gradient_${uid}_${i})` : rects[i].color"
                    :stroke="waffleConfig.style.chart.layout.rect.stroke"
                    :stroke-width="waffleConfig.style.chart.layout.rect.strokeWidth"
                    :filter="getBlurFilter(rects[i].serieIndex)"
                />
            </template>

            <!-- DATA LABELS -->
            <template v-for="(position, i) in positions">
                <foreignObject
                    v-if="!isAnimating && !waffleConfig.style.chart.layout.grid.vertical && waffleConfig.style.chart.layout.labels.captions.show && ((rects[i].isFirst && position.position < waffleConfig.style.chart.layout.grid.size - 2) || (rects[i].isAbsoluteFirst && i % waffleConfig.style.chart.layout.grid.size === 0 && rects[i].absoluteStartIndex))"
                    :x="position.x + waffleConfig.style.chart.layout.labels.captions.offsetX"
                    :y="position.y + waffleConfig.style.chart.layout.labels.captions.offsetY"
                    :height="absoluteRectDimension"
                    :width="absoluteRectDimension * waffleConfig.style.chart.layout.grid.size"
                    :filter="getBlurFilter(rects[i].serieIndex)"
                >
                    <div class="vue-ui-waffle-caption" :style="`height: 100%; width: 100%; font-size:${waffleConfig.style.chart.layout.labels.captions.fontSize}px;display:flex;align-items:center;justify-content:flex-start;padding: 0 ${absoluteRectDimension / 12}px;color:${adaptColorToBackground(rects[i].color)};gap:2px`">
                        <span v-if="waffleConfig.style.chart.layout.labels.captions.showSerieName">
                            {{ waffleConfig.style.chart.layout.labels.captions.serieNameAbbreviation ? abbreviate({ source: rects[i].name, length: waffleConfig.style.chart.layout.labels.captions.serieNameMaxAbbreviationSize}) : rects[i].name }} :
                        </span>
                        <span v-if="waffleConfig.style.chart.layout.labels.captions.showPercentage">
                            {{ dataLabel({ v: rects[i].proportion, s: '%', r: waffleConfig.style.chart.layout.labels.captions.roundingPercentage }) }}
                        </span>
                        <span v-if="waffleConfig.style.chart.layout.labels.captions.showPercentage && waffleConfig.style.chart.layout.labels.captions.showValue">
                            ({{ dataLabel({ p: waffleConfig.style.chart.layout.labels.dataLabels.prefix, v: rects[i].value, s: waffleConfig.style.chart.layout.labels.dataLabels.suffix, r: waffleConfig.style.chart.layout.labels.captions.roundingValue }) }})
                        </span>
                        <span v-if="!waffleConfig.style.chart.layout.labels.captions.showPercentage && waffleConfig.style.chart.layout.labels.captions.showValue">
                            {{ dataLabel({ p: waffleConfig.style.chart.layout.labels.dataLabels.prefix, v: rects[i].value, s: waffleConfig.style.chart.layout.labels.dataLabels.suffix, r: waffleConfig.style.chart.layout.labels.captions.roundingValue }) }}
                        </span>
                    </div>
                </foreignObject>
            </template>
    
            <rect
                v-for="(position, i) in positions"
                :data-cy="`waffle-rect-${i}`"
                @mouseover="useTooltip(i)"
                @mouseleave="isTooltip = false; selectedSerie = null"
                :x="position.x"
                :y="position.y"
                :height="absoluteRectDimension"
                :width="absoluteRectDimension"
                fill="transparent"
                stroke="none"
            />
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'waffle',
                style: {
                    backgroundColor: waffleConfig.style.chart.backgroundColor,
                    waffle: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <!-- LEGEND AS DIV -->
        <Legend
            v-if="waffleConfig.style.chart.legend.show"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({legend}) => segregate(legend.uid)"
        >
            <template #item="{ legend }">
                <div @click="legend.segregate()" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`">
                    {{ legend.name }} : {{ dataLabel({p:waffleConfig.style.chart.layout.labels.dataLabels.prefix, v: legend.value, s: waffleConfig.style.chart.layout.labels.dataLabels.suffix, r:waffleConfig.style.chart.legend.roundingValue, isAnimating})}}
                    <span v-if="!segregated.includes(legend.uid)">
                        ({{ isNaN(legend.value / total) ? '-' : dataLabel({v: legend.value /total * 100, s: '%', r: waffleConfig.style.chart.legend.roundingPercentage, isAnimating }) }})
                    </span>
                    <span v-else>
                        ( - % )
                    </span>
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="legendSet"></slot>

        <!-- TOOLTIP -->
        <Tooltip
            :show="waffleConfig.style.chart.tooltip.show && isTooltip && segregated.length < props.dataset.length"
            :backgroundColor="waffleConfig.style.chart.tooltip.backgroundColor"
            :color="waffleConfig.style.chart.tooltip.color"
            :borderRadius="waffleConfig.style.chart.tooltip.borderRadius"
            :borderColor="waffleConfig.style.chart.tooltip.borderColor"
            :borderWidth="waffleConfig.style.chart.tooltip.borderWidth"
            :parent="waffleChart"
            :content="tooltipContent"
            :isCustom="waffleConfig.style.chart.tooltip.customFormat && typeof waffleConfig.style.chart.tooltip.customFormat === 'function'"
            :fontSize="waffleConfig.style.chart.tooltip.fontSize"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: waffleConfig.style.chart.backgroundColor,
                color: waffleConfig.style.chart.color
            },
            head: {
                backgroundColor: waffleConfig.style.chart.backgroundColor,
                color: waffleConfig.style.chart.color
            }
        }">
            <template #content>            
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${waffleConfig.style.chart.title.text}${waffleConfig.style.chart.title.subtitle.text ? ` : ${waffleConfig.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{th}">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{td}">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-waffle *{
    transition: unset;
}
.vue-ui-waffle {
    user-select: none;
    position: relative;
}
.vue-ui-waffle .vue-ui-waffle-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
</style>
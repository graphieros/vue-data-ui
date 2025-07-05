<script setup>
import { computed, ref, nextTick, onMounted, onBeforeUnmount, watch, useSlots, defineAsyncComponent, shallowRef } from "vue";
import {
  applyDataLabel,
  checkNaN,
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
  palette,
  sanitizeArray,
  setOpacity,
  shiftHue,
  themePalettes,
  XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import Shape from "../atoms/Shape.vue";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_rings: DEFAULT_CONFIG } = useConfig();
const slots = useSlots();

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

const isLoaded = ref(false);

const isDataset = computed(() => {
  return !!props.dataset && props.dataset.length;
});

const uid = ref(createUid());
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);
const step = ref(0);
const ringsChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);

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

function prepareConfig() {
  const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_rings[mergedConfig.theme] || props.config,
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
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
  prepareChart();
});

function prepareChart() {
  if(objectIsEmpty(props.dataset)) {
    error({
      componentName: 'VueUiRings',
      type: 'dataset'
    })
  } else {
    props.dataset.forEach((ds, i) => {
      if (!ds.values.length) {
        error({
          componentName: 'VueUiRings',
          type: 'dataset',
        })
      }      
      getMissingDatasetAttributes({
        datasetObject: ds,
        requiredAttributes: ['name', 'values']
      }).forEach(attr => {
        error({
          componentName: 'VueUiRings',
          type: 'datasetSerieAttribute',
          property: attr,
          index: i
        });
      });
    })
  }

  if (FINAL_CONFIG.value.responsive) {
    const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: ringsChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
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
        observedEl.value = ringsChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
  }
  setTimeout(() => {
    isLoaded.value = true;
  }, 600)
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
    elementId: `rings_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-rings',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

const svg = ref({
    height: 360,
    width: 360,
});

const chartRadius = computed(() => {
  return Math.min(svg.value.height, svg.value.width);
})

const emit = defineEmits(['selectLegend']);

const segregated = ref([]);

function segregate(uid) {
    if(segregated.value.includes(uid)) {
        segregated.value = segregated.value.filter(s => s !== uid);
    }else {
        segregated.value.push(uid);
    }
    emit('selectLegend', convertedDataset.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value
        }
    }));
}

const max = computed(() => {
  return Math.max(
    ...datasetCopy.value
        .filter(el => !segregated.value.includes(el.uid))
        .map(({ value }) => {
            return value
        })
  );
});

function proportionToMax(val) {
  return val / max.value;
}

const datasetCopy = computed(() => {
    return props.dataset.map(({ values, name, color = null }, i) => {
        const subTotal = sanitizeArray(values).reduce((a, b) => a + b, 0);
        return {
            name,
            color: color || convertColorToHex(color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            value: subTotal,
            proportion: subTotal / props.dataset.map(ds => (ds.values || []).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
            uid: createUid(),
            absoluteIndex: i
        }
    })
})

const legendSet = computed(() => {
    return datasetCopy.value.map((el) => {
      return {
        ...el,
        shape: 'circle',
        opacity: segregated.value.includes(el.uid) ? 0.5 : 1,
        segregate: () => segregate(el.uid),
        isSegregated: segregated.value.includes(el.uid)
      }
    })
    .toSorted((a,b) => b.value - a.value)
})

const legendConfig = computed(() => {
    return {
        cy: 'rings-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const grandTotal = computed(() => {
  return datasetCopy.value
    .filter(el => !segregated.value.includes(el.uid))
    .map(({ value }) => {
        return value
    })
    .reduce((a, b) => a + b, 0);
});

const convertedDataset = computed(() => {
  return datasetCopy.value
    .filter(el => !segregated.value.includes(el.uid))
    .map(({ name, value, color = null, uid, absoluteIndex }, i) => {
      return {
        absoluteIndex,
        uid,
        name,
        color: color || convertColorToHex(color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
        value,
        proportion: proportionToMax(value),
        percentage: (value / grandTotal.value) * 100,
        strokeWidth:
          FINAL_CONFIG.value.style.chart.layout.rings.strokeWidth *
          proportionToMax(value),
      };
    })
    .toSorted((a, b) => b.value - a.value);
});

function getData() {
  return convertedDataset.value.map(
    ({ name, color, value, absoluteValues, percentage }) => {
      return {
        name,
        color,
        value,
        absoluteValues,
        percentage,
      };
    }
  );
}

const maxHeight = computed(() => {
  return chartRadius.value - FINAL_CONFIG.value.style.chart.layout.rings.strokeWidth * 2;
});

const dataTooltipSlot = ref(null);

function useTooltip(index, datapoint) {
  if (segregated.value.length === props.dataset.length) return;

  dataTooltipSlot.value = {
    datapoint,
    seriesIndex: index,
    series: convertedDataset.value,
    config: FINAL_CONFIG.value
  }

  selectedSerie.value = index;
  const selected = convertedDataset.value[index];
  const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

  if (isFunction(customFormat) && functionReturnsString(() => customFormat({
      seriesIndex: index,
      datapoint,
      series: convertedDataset.value,
      config: FINAL_CONFIG.value
    }))) {
    tooltipContent.value = customFormat({
      seriesIndex: index,
      datapoint,
      series: convertedDataset.value,
      config: FINAL_CONFIG.value
    })
  } else {
    let html = "";
  
    html += `<div data-cy="waffle-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${selected.name}</div>`;
  
    html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 60 60" height="14" width="14"><circle data-cy="waffle-tooltip-marker" cx="30" cy="30" r="30" stroke="none" fill="${selected.color}" />${slots.pattern ? `<circle data-cy="waffle-tooltip-marker" cx="30" cy="30" r="30" stroke="none" fill="url(#pattern_${uid.value}_${datapoint.absoluteIndex})" />`: ''}</svg>`;
    if (FINAL_CONFIG.value.style.chart.tooltip.showValue) {
      html += `<b data-cy="waffle-tooltip-value">${applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter,
        selected.value,
        dataLabel({
          p:FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, 
          v: selected.value, 
          s:FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, 
          r:FINAL_CONFIG.value.style.chart.tooltip.roundingValue
        }),
        { datapoint, seriesIndex: index }
      )}
      </b>`;
    }
    if (FINAL_CONFIG.value.style.chart.tooltip.showPercentage) {
      if (!FINAL_CONFIG.value.style.chart.tooltip.showValue) {
        html += `<b>${dataLabel({
          v: (selected.value / grandTotal.value) * 100,
          s: '%',
          r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage
        })}</b></div>`;
      } else {
        html += `<span data-cy="waffle-tooltip-percentage">(${dataLabel({
          v: (selected.value / grandTotal.value) * 100,
          s: '%',
          r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage
        })})</span></div>`;
      }
    }
    tooltipContent.value = html;
  }
  isTooltip.value = true;
}

const table = computed(() => {
    const head = convertedDataset.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = convertedDataset.value.map(ds => ds.value);

    return { head, body };
});

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`,
        dataLabel({p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, v: grandTotal.value, s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.value.table.td.roundingValue}),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            dataLabel({p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, v: table.value.body[i], s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, r:FINAL_CONFIG.value.table.td.roundingValue}),
            isNaN(table.value.body[i] / grandTotal.value) ? "-" : (table.value.body[i] / grandTotal.value * 100).toFixed(FINAL_CONFIG.value.table.td.roundingPercentage) + '%'
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
    }

    const colNames = [
      FINAL_CONFIG.value.table.columnNames.series,
      FINAL_CONFIG.value.table.columnNames.value,
      FINAL_CONFIG.value.table.columnNames.percentage
    ]

    return {
        head,
        body,
        config,
        colNames
    }
});


function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / grandTotal.value) ? '-' : table.value.body[i] / grandTotal.value * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-rings"});
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

function toggleTooltip() {
  mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
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
    toggleTooltip,
    toggleAnnotator
});

</script>

<template>
  <div
    ref="ringsChart"
    :class="`vue-ui-rings ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
    :style="`font-family:${FINAL_CONFIG.style.fontFamily};text-align:center;width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
    :id="`rings_${uid}`"
    @mouseleave="
      selectedSerie = null;
      isTooltip = false;
      setUserOptionsVisibility(false)
    "
    @mouseenter="() => setUserOptionsVisibility(true)"
  >
    <PenAndPaper
      v-if="FINAL_CONFIG.userOptions.buttons.annotator"
      :svgRef="svgRef"
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

    <div
      ref="chartTitle"
      v-if="FINAL_CONFIG.style.chart.title.text"
      :style="`width:100%;background:transparent`"
    >
      <Title
        :key="`title_${titleStep}`"
        :config="{
          title: {
            cy: 'rings-div-title',
            ...FINAL_CONFIG.style.chart.title
          },
          subtitle: {
            cy: 'rings-div-subtitle',
            ...FINAL_CONFIG.style.chart.title.subtitle
          },
        }"
      />
    </div>

    <!-- USER OPTIONS -->
    <UserOptions
        ref="details"
        :key="`user_options_${step}`"
        v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
        :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
        :color="FINAL_CONFIG.style.chart.color"
        :isPrinting="isPrinting"
        :isImaging="isImaging"
        :uid="uid"
        :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
        :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
        :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
        :hasImg="FINAL_CONFIG.userOptions.buttons.img"
        :hasTable="FINAL_CONFIG.userOptions.buttons.table"
        :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
        :isTooltip="mutableConfig.showTooltip"
        :isFullscreen="isFullscreen"
        :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
        :chartElement="ringsChart"
        :position="FINAL_CONFIG.userOptions.position"
        :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
        :isAnnotation="isAnnotator"
        :callbacks="FINAL_CONFIG.userOptions.callbacks"
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
      v-if="isDataset"
      :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
      data-cy="rings-svg"
      :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
      :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
    >
      <PackageVersion />

      <!-- BACKGROUND SLOT -->
      <foreignObject 
          v-if="$slots['chart-background']"
          :x="0"
          :y="0"
          :width="svg.width <= 0 ? 10 : svg.width"
          :height="svg.height <= 0 ? 10 : svg.height"
          :style="{
              pointerEvents: 'none'
          }"
      >
          <slot name="chart-background"/>
      </foreignObject>

      <!-- DEFS  -->
      <defs>
        <radialGradient
          cx="50%"
          cy="30%"
          r="50%"
          fx="50%"
          fy="50%"
          v-for="(d, i) in convertedDataset"
          :id="`gradient_${uid}_${i}`"
        >
          <stop
            offset="0%"
            :stop-color="setOpacity(shiftHue(d.color, 0.05), 100 - FINAL_CONFIG.style.chart.layout.rings.gradient.intensity)"
          />
          <stop offset="100%" :stop-color="d.color" />
        </radialGradient>
      </defs>

      <g v-if="$slots.pattern">
          <defs v-for="(ring) in convertedDataset">
              <slot name="pattern" v-bind="{ seriesIndex: ring.absoluteIndex, patternId: `pattern_${uid}_${ring.absoluteIndex}`}"/>
          </defs>
      </g>

      <!-- RINGS -->
      <g v-for="(ring, i) in convertedDataset">
        <circle
          data-cy="ring-underlayer"
          :class="{
            'vue-ui-rings-item': isLoaded && FINAL_CONFIG.useCssAnimation,
            'vue-rings-item-onload': !isLoaded && FINAL_CONFIG.useCssAnimation,
            'vue-ui-rings-opacity': selectedSerie !== null && selectedSerie !== i,
          }"
          :style="`animation-delay:${i * 100}ms`"
          :stroke="FINAL_CONFIG.style.chart.layout.rings.stroke"
          :cx="svg.width / 2"
          :cy="i === 0 ? svg.height / 2 : svg.height / 2 + ((maxHeight * convertedDataset[0].proportion) / 2) - ((maxHeight * ring.proportion) / 2) - (2 * (i + 1))"
          :r="checkNaN(((maxHeight * ring.proportion) / 2) * 0.9 <= 0 ? 0.0001 : ((maxHeight * ring.proportion) / 2) * 0.9)"
          :fill="FINAL_CONFIG.style.chart.layout.rings.gradient.underlayerColor"
        />

        <circle
          data-cy="ring"
          :class="{
            'vue-ui-rings-item': isLoaded && FINAL_CONFIG.useCssAnimation,
            'vue-rings-item-onload': !isLoaded && FINAL_CONFIG.useCssAnimation,
            'vue-ui-rings-shadow': FINAL_CONFIG.style.chart.layout.rings.useShadow,
            'vue-ui-rings-blur': selectedSerie !== null && selectedSerie !== i,
          }"
          :style="`animation-delay:${i * 100}ms`"
          :stroke="FINAL_CONFIG.style.chart.layout.rings.stroke"
          :stroke-width="ring.strokeWidth < 0.5 ? 0.5 : ring.strokeWidth"
          :cx="svg.width / 2"
          :cy="i === 0 ? svg.height / 2 : svg.height / 2 + ((maxHeight * convertedDataset[0].proportion) / 2) - ((maxHeight * ring.proportion) / 2) - (2 * (i + 1))"
          :r="checkNaN(((maxHeight * ring.proportion) / 2) * 0.9 <= 0 ? 0.0001 : ((maxHeight * ring.proportion) / 2) * 0.9)"
          :fill="
            FINAL_CONFIG.style.chart.layout.rings.gradient.show
              ? `url(#gradient_${uid}_${i})`
              : ring.color
          "
        />

        <circle
        v-if="$slots.pattern"
          :data-cy="`ring-pattern-${i}`"
          :class="{
            'vue-ui-rings-item': isLoaded && FINAL_CONFIG.useCssAnimation,
            'vue-rings-item-onload': !isLoaded && FINAL_CONFIG.useCssAnimation,
            'vue-ui-rings-shadow': FINAL_CONFIG.style.chart.layout.rings.useShadow,
            'vue-ui-rings-blur': selectedSerie !== null && selectedSerie !== i,
          }"
          :style="`animation-delay:${i * 100}ms`"
          :stroke="FINAL_CONFIG.style.chart.layout.rings.stroke"
          :stroke-width="ring.strokeWidth < 0.5 ? 0.5 : ring.strokeWidth"
          :cx="svg.width / 2"
          :cy="i === 0 ? svg.height / 2 : svg.height / 2 + ((maxHeight * convertedDataset[0].proportion) / 2) - ((maxHeight * ring.proportion) / 2) - (2 * (i + 1))"
          :r="checkNaN(((maxHeight * ring.proportion) / 2) * 0.9 <= 0 ? 0.0001 : ((maxHeight * ring.proportion) / 2) * 0.9)"
          :fill="`url(#pattern_${uid}_${ring.absoluteIndex})`"
        />
        
        <circle
          data-cy="tooltip-trap"
          stroke="none"
          :cx="svg.width / 2"
          :cy="i === 0 ? svg.height / 2 : svg.height / 2 + ((maxHeight * convertedDataset[0].proportion) / 2) - ((maxHeight * ring.proportion) / 2) - (2 * (i + 1))"
          :r="checkNaN(((maxHeight * ring.proportion) / 2) * 0.9 <= 0 ? 0.0001 : ((maxHeight * ring.proportion) / 2) * 0.9)"
          fill="transparent"
          @mouseenter="useTooltip(i, ring)"
          @mouseleave="
            selectedSerie = null;
            isTooltip = false;
          "
        />
      </g>
      <slot name="svg" :svg="svg"/>
    </svg>

    <div v-if="$slots.watermark" class="vue-data-ui-watermark">
        <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
    </div>

    <Skeleton
      v-if="!isDataset"
      :config="{
        type: 'rings',
        style: {
          backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
          rings: {
            color: '#CCCCCC'
          }
        }
      }"
    />

    <!-- LEGEND AS DIV -->
    <div ref="chartLegend">
      <Legend
        v-if="FINAL_CONFIG.style.chart.legend.show"
        :key="`legend_${legendStep}`"
        :legendSet="legendSet"
        :config="legendConfig"
        @clickMarker="({legend}) => segregate(legend.uid)"
      >
        <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
          <Shape
              :shape="legend.shape"
              :radius="30"
              stroke="none"
              :plot="{ x: 30, y: 30}"
              :fill="`url(#pattern_${uid}_${index})`"
          />
        </template>

        <template #item="{legend, index }">
            <div data-cy="legend-item" @click="segregate(legend.uid)" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`">
                {{ legend.name }}: {{ applyDataLabel(
                  FINAL_CONFIG.style.chart.layout.labels.dataLabels.formatter,
                  legend.value,
                  dataLabel({
                    p:FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix, 
                    v: legend.value, 
                    s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix, 
                    r:FINAL_CONFIG.style.chart.legend.roundingValue
                  }),
                  { datapoint: legend, seriesIndex: index }
                  )
                }}
                <span v-if="!segregated.includes(legend.uid)">
                  ({{ isNaN(legend.value / grandTotal) ? '-' : dataLabel({
                    v: legend.value / grandTotal * 100,
                    s: '%',
                    r: FINAL_CONFIG.style.chart.legend.roundingPercentage
                  })
                  }})
                </span>
                <span v-else>
                    ( - % )
                </span>
            </div>
        </template>
      </Legend>
      <slot v-else name="legend" v-bind:legend="legendSet"></slot>
    </div>

    <div v-if="$slots.source" ref="source" dir="auto">
        <slot name="source" />
    </div>

    <!-- TOOLTIP -->
    <Tooltip
      :show="
        mutableConfig.showTooltip &&
        isTooltip &&
        segregated.length < props.dataset.length
      "
      :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
      :color="FINAL_CONFIG.style.chart.tooltip.color"
      :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
      :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
      :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
      :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
      :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
      :position="FINAL_CONFIG.style.chart.tooltip.position"
      :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
      :parent="ringsChart"
      :content="tooltipContent"
      :isFullscreen="isFullscreen"
      :isCustom="FINAL_CONFIG.style.chart.tooltip.customFormat && typeof FINAL_CONFIG.style.chart.tooltip.customFormat === 'function'"
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
        backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
        color: FINAL_CONFIG.style.chart.color,
      },
      head: {
        backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
        color: FINAL_CONFIG.style.chart.color,
      }
    }">
        <template #content>
          <DataTable
            :key="`table_${tableStep}`"
            :colNames="dataTable.colNames"
            :head="dataTable.head" 
            :body="dataTable.body"
            :config="dataTable.config"
            :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
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

.vue-ui-rings *{
    transition: unset;
}
.vue-ui-rings {
    user-select: none;
    position: relative;
}

.vue-ui-rings-shadow {
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
}
.vue-ui-rings-blur {
  filter: blur(3px) opacity(50%) grayscale(100%);
  transition: all 0.15s ease-in-out;
}

.vue-ui-rings-opacity {
  opacity: 0.3;
  transition: opacity 0.15s ease-in-out;
}

.vue-ui-rings-item {
  transition: all 0.2s ease-in-out;
}

.vue-rings-item-onload {
  transform-origin: bottom;
  transform: scale(0, 0);
  animation: ring-appear 0.5s ease-in forwards;
}

@keyframes ring-appear {
  0% {
    opacity: 0;
    transform: scale(0.8, 0.7);
  }
  60% {
    transform: scale(1.03, 1.05);
  }
  80% {
    transform: scale(0.98, 0.96);
  }
  90% {
    transform: scale(1.01, 1.02);
  }
  100% {
    opacity: 1;
    transform: scale(1, 1);
  }
}
</style>

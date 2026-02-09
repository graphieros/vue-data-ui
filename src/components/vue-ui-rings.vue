<script setup>
import { 
  computed, 
  defineAsyncComponent, 
  nextTick, 
  onBeforeUnmount, 
  onMounted, 
  ref, 
  shallowRef, 
  toRefs,
  useSlots, 
  watch, 
} from "vue";
import {
  applyDataLabel,
  checkNaN,
  convertColorToHex,
  convertCustomPalette,
  createCsvContent,
  createTSpansFromLineBreaksOnX,
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
  treeShake,
  XMLNS
} from "../lib";
import{
    buildValuePercentageLabel,
} from "../labelUtils";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { usePrinter } from "../usePrinter";
import { useLoading } from "../useLoading";
import { useSvgExport } from "../useSvgExport";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useThemeCheck } from "../useThemeCheck";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import img from "../img";
import Shape from "../atoms/Shape.vue";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes/vue_ui_rings.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import BaseScanner from "../atoms/BaseScanner.vue";
import BaseLegendToggle from "../atoms/BaseLegendToggle.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_rings: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();
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
const resizing = ref(false);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

const FINAL_CONFIG = ref(prepareConfig());

const skeletonConfig = computed(() => {
  return treeShake({
    defaultConfig: {
      userOptions: { show: false },
      table: { show: false },
      style: {
        chart: {
          backgroundColor: '#99999930',
          layout: {
            rings: {
              stroke: '#6A6A6A',
              gradient: {
                underlayerColor: '#FFFFFF'
              }
            },
            labels: {
              dataLabels: {
                show: false,
              }
            }
          },
          legend: {
            backgroundColor: 'transparent'
          }
        }
      }
    },
    userConfig: FINAL_CONFIG.value.skeletonConfig ?? {}
  })
})

const { loading, FINAL_DATASET, manualLoading } = useLoading({
  ...toRefs(props),
  FINAL_CONFIG,
  prepareConfig,
  skeletonDataset: props.config?.skeletonDataset ?? [
    { name: '_', values: [13], color: '#808080' },
    { name: '_', values: [8], color: '#969696' },
    { name: '_', values: [5], color: '#ADADAD' },
    { name: '_', values: [3], color: '#C4C4C4' },
    { name: '_', values: [2], color: '#DBDBDB' },
  ],
  skeletonConfig: treeShake({
    defaultConfig: FINAL_CONFIG.value,
    userConfig: skeletonConfig.value
  })
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

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
      customPalette: mergedConfig.customPalette.length ? mergedConfig.customPalette : themePalettes[mergedConfig.theme] || palette
    }
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
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
    mutableConfig.value.showLabels = FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.show;

    svg.value.width = FINAL_CONFIG.value.style.chart.size;
    svg.value.height = FINAL_CONFIG.value.style.chart.size;
}, { deep: true });

const computedOffset = computed(() => {
  const { markers } = FINAL_CONFIG.value.style.chart.layout.labels.dataLabels;
  const r = maxHeight.value / 2;

  const x = !mutableConfig.value.showLabels ? 0 : markers.position === 'left' ? r : -r;

  const _xResp = !mutableConfig.value.showLabels ? 0 : svg.value.width / 2 - r;
  const xResp = markers.position === 'left' ? _xResp : -_xResp;
  const y = 0;

  return {
    x: FINAL_CONFIG.value.responsive ? xResp : x / FINAL_CONFIG.value.style.chart.size * svg.value.width,
    y: y / FINAL_CONFIG.value.style.chart.size  * svg.value.height
  }
})

const CENTER = computed(() => {
  return {
    x: svg.value.width / 2 + computedOffset.value.x,
    y: svg.value.height / 2 + computedOffset.value.y
  }
});

watch(() => props.dataset, (_) => {
  if (Array.isArray(_) && _.length > 0) {
      manualLoading.value = false;
  }
}, { deep: true })

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
  readyTeleport.value = true;
  prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
  if(objectIsEmpty(props.dataset)) {
    error({
      componentName: 'VueUiRings',
      type: 'dataset',
      debug: debug.value
    });
    manualLoading.value = true;
  } else {
    props.dataset.forEach((ds, i) => {
      if (!ds.values.length) {
        error({
          componentName: 'VueUiRings',
          type: 'dataset',
          debug: debug.value
        });
        manualLoading.value = true;
      }      
      getMissingDatasetAttributes({
        datasetObject: ds,
        requiredAttributes: ['name', 'values']
      }).forEach(attr => {
        error({
          componentName: 'VueUiRings',
          type: 'datasetSerieAttribute',
          property: attr,
          index: i,
          debug: debug.value
        });
      });
    })
  }

   // v3
  if (!objectIsEmpty(props.dataset)) {
    manualLoading.value = FINAL_CONFIG.value.loading;
  }

  if (FINAL_CONFIG.value.responsive) {
    const handleResize = throttle(() => {
      resizing.value = true;
            const { width, height } = useResponsive({
                chart: ringsChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
              svg.value.width = width;
              svg.value.height = height - 12;
              resizing.value = false;
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
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
    showLabels: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.show
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
      showTable: FINAL_CONFIG.value.table.show,
      showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
      showLabels: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.show
    }
}, { immediate: true });

const svg = ref({
    height: FINAL_CONFIG.value.style.chart.size,
    width: FINAL_CONFIG.value.style.chart.size,
});

const chartRadius = computed(() => {
  return Math.min(svg.value.height, svg.value.width);
})

const emit = defineEmits(['selectLegend']);

const segregated = ref([]);

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach(l => {
            segregated.value.push(l.uid);
        });
    }
}

function segregate(uid) {
    if(segregated.value.includes(uid)) {
        segregated.value = segregated.value.filter(s => s !== uid);
    }else {
        if (segregated.value.length === datasetCopy.value.length - 1) return;
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

function validSeriesToToggle(name) {
    if (!datasetCopy.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiRings - There are no series to show.');
        }
        return null;
    }
    const dp = datasetCopy.value.find(d => d.name === name);

    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiRings - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.uid)) {
        segregate(dp.uid);
    }
}

function hideSeries(name) {
    const dp  = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.uid))  {
        segregate(dp.uid);
    }
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
    return FINAL_DATASET.value.map(({ values, name, color = null }, i) => {
        const subTotal = sanitizeArray(values).reduce((a, b) => a + b, 0);
        return {
            name,
            color: color || convertColorToHex(color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            value: subTotal,
            proportion: subTotal / FINAL_DATASET.value.map(ds => (ds.values || []).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
            uid: createUid(),
            absoluteIndex: i
        }
    })
})

const legendSet = computed(() => {
    return datasetCopy.value.map((el, i) => {
      const valueDisplay = applyDataLabel(FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter, el.value, dataLabel({
            p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix,
            v: el.value,
            s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix,
            r: FINAL_CONFIG.value.style.chart.legend.roundingValue
        }), { datapoint: el, index: i });

      const percentageDisplay = isNaN(el.value / grandTotal.value) ? '-' : dataLabel({v: el.value / grandTotal.value * 100, s: '%', r: FINAL_CONFIG.value.style.chart.legend.roundingPercentage });

      const display = buildLabel({
        showVal: FINAL_CONFIG.value.style.chart.legend.showValue,
        showPercentage: FINAL_CONFIG.value.style.chart.legend.showPercentage,
        val: valueDisplay,
        percentage: segregated.value.includes(el.uid) ? '-%' : percentageDisplay
      });

      return {
        ...el,
        shape: 'circle',
        opacity: segregated.value.includes(el.uid) ? 0.5 : 1,
        segregate: () => segregate(el.uid),
        isSegregated: segregated.value.includes(el.uid),
        display: `${el.name}${FINAL_CONFIG.value.style.chart.legend.showPercentage || FINAL_CONFIG.value.style.chart.legend.showValue ? ': ' : ''}${display}`
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
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : '',
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

function onTrapClick(datapoint, seriesIndex) {
  if (FINAL_CONFIG.value.events.datapointClick) {
    FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
  }
}

function onTrapLeave(datapoint, seriesIndex) {
  selectedSerie.value = null;
  isTooltip.value = false;
  if (FINAL_CONFIG.value.events.datapointLeave) {
    FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
  }
}

function buildLabel({
    val,
    percentage,
    showVal,
    showPercentage,
}) {
    const cfg = FINAL_CONFIG.value.style.chart.layout.labels.dataLabels;
    return buildValuePercentageLabel({
        config: cfg,
        val,
        percentage,
        showVal,
        showPercentage
    })
}

function getRingLabel(ring) {
  const cfg = FINAL_CONFIG.value.style.chart.layout.labels.dataLabels;
  const valueDisplay = applyDataLabel(
    cfg.formatter,
    ring.value,
    dataLabel({
      p: cfg.prefix,
      v: ring.value,
      s: cfg.suffix,
      r: cfg.roundingValue
    })
  );
  const percentageDisplay = dataLabel({
    v: ring.percentage,
    s: '%',
    r: cfg.roundingPercentage
  })

  return `${ring.name}\n${buildLabel({
    val: valueDisplay,
    percentage: percentageDisplay,
    showVal: cfg.showValue,
    showPercentage: cfg.showPercentage
  })}`
}

function getRadius(ring) {
  return checkNaN(((maxHeight.value * ring.proportion) / 2) * 0.9 <= 0 ? 0.0001 : ((maxHeight.value * ring.proportion) / 2) * 0.9)
}

function getY(ring, i) {
  return i === 0 ? CENTER.value.y : CENTER.value.y + ((maxHeight.value * convertedDataset.value[0].proportion) / 2) - ((maxHeight.value * ring.proportion) / 2) - (2 * (i + 1))
}

function getMarkerCoordinates(ring, i) {
  const side = FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.markers.position;
  const x = side === 'left' ? - (maxHeight.value / 2) : maxHeight.value / 2
  return {
    x: CENTER.value.x + x,
    y: getY(ring, i) - getRadius(ring),
  }
}

const dataTooltipSlot = ref(null);

function useTooltip(datapoint, index) {
  if (FINAL_CONFIG.value.events.datapointEnter) {
    FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: index });
  }

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

    html += `<b>${buildLabel({
      showVal: FINAL_CONFIG.value.style.chart.tooltip.showValue,
      showPercentage: FINAL_CONFIG.value.style.chart.tooltip.showPercentage,
      val: `<span data-cy="donut-tooltip-value">${applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter,
        selected.value,
        dataLabel({
          p:FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, 
          v: selected.value, 
          s:FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, 
          r:FINAL_CONFIG.value.style.chart.tooltip.roundingValue
        }),
        { datapoint, seriesIndex: index }
      )}</span>`,
      percentage: dataLabel({
          v: (selected.value / grandTotal.value) * 100,
          s: '%',
          r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage
        })
    })}</b></div>`;

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


function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / grandTotal.value) ? '-' : table.value.body[i] / grandTotal.value * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);
        const csvContent = createCsvContent(tableXls);

        if (!callback){
          downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-rings"});
        } else {
          callback(csvContent);
        }
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

function toggleLabels() {
    mutableConfig.value.showLabels = !mutableConfig.value.showLabels;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2} = {}) {
    if (!ringsChart.value) return;
    const { width, height } = ringsChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: ringsChart.value, base64: true, img: true, scale})
    return { 
      imageUri, 
      base64, 
      title: FINAL_CONFIG.value.style.chart.title.text,
      width,
      height,
      aspectRatio
    }
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
            fullscreenParent: ringsChart.value,
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

const svgLegendItems = computed(() => {
    return legendSet.value.map(l => ({
        ...l,
        name: l.display
    }));
});

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: svgLegendItems,
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
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    hideSeries,
    showSeries,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    toggleLabels
});

</script>

<template>
  <div
    ref="ringsChart"
    :class="`vue-data-ui-component vue-ui-rings ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
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

    <div :id="`legend-top-${uid}`" />

    <!-- USER OPTIONS -->
    <UserOptions
        ref="userOptionsRef"
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
        :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
        :hasTable="FINAL_CONFIG.userOptions.buttons.table"
        :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
        :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
        :isTooltip="mutableConfig.showTooltip"
        :isFullscreen="isFullscreen"
        :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
        :chartElement="ringsChart"
        :position="FINAL_CONFIG.userOptions.position"
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
        @toggleTooltip="toggleTooltip"
        @toggleAnnotator="toggleAnnotator"
        @toggleLabels="toggleLabels"
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
          <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
          <template #optionTable v-if="$slots.optionTable">
              <slot name="optionTable" />
          </template>
          <template #optionLabels v-if="$slots.optionLabels">
            <slot name="optionLabels"/>
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
      :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen, 'resizing': resizing || loading }"
      data-cy="rings-svg"
      :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
      :style="`max-width:100%;overflow:hidden;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
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
            'vue-rings-item-onload': !isLoaded && FINAL_CONFIG.useCssAnimation && !loading,
            'vue-ui-rings-opacity': selectedSerie !== null && selectedSerie !== i,
          }"
          :style="`animation-delay:${i * 100}ms`"
          :stroke="FINAL_CONFIG.style.chart.layout.rings.stroke"
          :cx="CENTER.x"
          :cy="getY(ring, i)"
          :r="getRadius(ring)"
          :fill="FINAL_CONFIG.style.chart.layout.rings.gradient.underlayerColor"
        />

        <circle
          data-cy="ring"
          :class="{
            'vue-ui-rings-item': isLoaded && FINAL_CONFIG.useCssAnimation,
            'vue-rings-item-onload': !isLoaded && FINAL_CONFIG.useCssAnimation && !loading,
            'vue-ui-rings-shadow': FINAL_CONFIG.style.chart.layout.rings.useShadow,
            'vue-ui-rings-blur': selectedSerie !== null && selectedSerie !== i,
          }"
          :style="`animation-delay:${i * 100}ms`"
          :stroke="FINAL_CONFIG.style.chart.layout.rings.stroke"
          :stroke-width="ring.strokeWidth < 0.5 ? 0.5 : ring.strokeWidth"
          :cx="CENTER.x"
          :cy="getY(ring, i)"
          :r="getRadius(ring)"
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
              'vue-rings-item-onload': !isLoaded && FINAL_CONFIG.useCssAnimation && !loading,
              'vue-ui-rings-shadow': FINAL_CONFIG.style.chart.layout.rings.useShadow,
              'vue-ui-rings-blur': selectedSerie !== null && selectedSerie !== i,
            }"
          :style="`animation-delay:${i * 100}ms`"
          :stroke="FINAL_CONFIG.style.chart.layout.rings.stroke"
          :stroke-width="ring.strokeWidth < 0.5 ? 0.5 : ring.strokeWidth"
          :cx="CENTER.x"
          :cy="getY(ring, i)"
          :r="getRadius(ring)"
          :fill="`url(#pattern_${uid}_${ring.absoluteIndex})`"
      />
        
        <circle
          data-cy="tooltip-trap"
          stroke="none"
          :cx="CENTER.x"
          :cy="getY(ring, i)"
          :r="getRadius(ring)"
          fill="transparent"
          @mouseenter="useTooltip(ring, i)"
          @mouseleave="onTrapLeave(ring, i)"
          @click="onTrapClick(ring, i)"
        />

        <!-- DATA LABELS -->
        <template v-if="mutableConfig.showLabels">
          <rect
            :x="FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.position === 'left' ? getMarkerCoordinates(ring, i).x : CENTER.x"
            :y="getMarkerCoordinates(ring, i).y - FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.strokeWidth / 2"
            :width="Math.abs(CENTER.x - getMarkerCoordinates(ring, i).x)"
            :height="FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.strokeWidth"
            :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.stroke"
            :rx="FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.strokeWidth"
            :class="{
              'vue-ui-rings-item': isLoaded && FINAL_CONFIG.useCssAnimation,
              'vue-rings-item-onload': !isLoaded && FINAL_CONFIG.useCssAnimation && !loading,
              'vue-ui-rings-shadow': FINAL_CONFIG.style.chart.layout.rings.useShadow,
              'vue-ui-rings-blur': selectedSerie !== null && selectedSerie !== i,
            }"
          />

          <circle 
            :cx="getMarkerCoordinates(ring, i).x"
            :cy="getMarkerCoordinates(ring, i).y"
            :r="FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.radius"
            :fill="ring.color"
            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
            :class="{
              'vue-ui-rings-item': isLoaded && FINAL_CONFIG.useCssAnimation,
              'vue-rings-item-onload': !isLoaded && FINAL_CONFIG.useCssAnimation && !loading,
              'vue-ui-rings-shadow': FINAL_CONFIG.style.chart.layout.rings.useShadow,
              'vue-ui-rings-blur': selectedSerie !== null && selectedSerie !== i,
            }"
          />

          <text
            :x="getMarkerCoordinates(ring, i).x + (FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.position === 'left' ? - FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX : FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX)"
            :y="getMarkerCoordinates(ring, i).y + FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize / 3"
            :text-anchor="FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.position === 'left' ? 'end' : 'start'"
            :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize"
            :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.color"
            :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.bold ? 'bold' : 'normal'"
            :class="{
              'vue-ui-rings-item': isLoaded && FINAL_CONFIG.useCssAnimation,
              'vue-rings-item-onload': !isLoaded && FINAL_CONFIG.useCssAnimation && !loading,
              'vue-ui-rings-shadow': FINAL_CONFIG.style.chart.layout.rings.useShadow,
              'vue-ui-rings-blur': selectedSerie !== null && selectedSerie !== i,
            }"
            @mouseenter="useTooltip(ring, i)"
            @mouseleave="onTrapLeave(ring, i)"
            @click="onTrapClick(ring, i)"
            v-html="createTSpansFromLineBreaksOnX({
              content: getRingLabel(ring),
              fontSize: FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize,
              fill: FINAL_CONFIG.style.chart.layout.labels.dataLabels.color,
              x: getMarkerCoordinates(ring, i).x + (FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.position === 'left' ? - FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX - 6 - FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.radius : FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX + 6 + FINAL_CONFIG.style.chart.layout.labels.dataLabels.markers.radius),
              y: getMarkerCoordinates(ring, i).y + FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize / 3,
              translateY: true
            })"
          />
        </template>
      </g>
      <slot name="svg" :svg="{
        ...svg,
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
              <div data-cy="legend-item" @click="segregate(legend.uid)" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`" v-if="!loading">
                  {{ legend.display }}
              </div>
          </template>

          <template #legendToggle>
              <BaseLegendToggle
                  v-if="legendSet.length > 2 && FINAL_CONFIG.style.chart.legend.selectAllToggle.show && !loading"
                  :backgroundColor="FINAL_CONFIG.style.chart.legend.selectAllToggle.backgroundColor"
                  :color="FINAL_CONFIG.style.chart.legend.selectAllToggle.color"
                  :fontSize="FINAL_CONFIG.style.chart.legend.fontSize"
                  :checked="segregated.length > 0"
                  @toggle="toggleLegend"
              />
          </template>
        </Legend>
        <slot v-else name="legend" v-bind:legend="legendSet"></slot>
      </div>
    </Teleport>

    <div v-if="$slots.source" ref="source" dir="auto">
        <slot name="source" />
    </div>

    <!-- TOOLTIP -->
    <Tooltip
      :teleportTo="FINAL_CONFIG.style.chart.tooltip.teleportTo"
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
      :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
      :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
      :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
      :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold"
    >
        <template #tooltip-before>
            <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
        </template>
        <template #tooltip-after>
            <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
        </template>
    </Tooltip>

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
            @close="closeTable"
          >
            <template #th="{th}">
                <div v-html="th" style="display:flex;align-items:center"></div>
            </template>
            <template #td="{td}">
                {{ td.name || td }}
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

.resizing .vue-ui-rings-item {
  transition: none;
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

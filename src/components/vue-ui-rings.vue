<script setup>
import { computed, ref, nextTick } from "vue";
import {
  palette,
  convertColorToHex,
  opacity,
  makeXls,
  createUid,
  shiftHue,
} from "../lib";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";

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

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_rings);

const isPrinting = ref(false);
const isImaging = ref(false);
const ringsChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);

const ringsConfig = computed(() => {
  return useNestedProp({
    userConfig: props.config,
    defaultConfig: defaultConfig.value,
  });
});

const mutableConfig = ref({
    showTable: ringsConfig.value.table.show,
});

const svg = computed(() => {
  return {
    height: 360,
    width: 360,
  };
});

const emit = defineEmits(['selectLegend'])

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
        const subTotal = values.reduce((a, b) => a + b, 0);

        return {
            name,
            color:
          color || convertColorToHex(color) || palette[i] || palette[i % palette.length],
          value: subTotal,
            uid: createUid()
        }
    })
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
    .map(({ name, value, color = null, uid }, i) => {
      return {
        uid,
        name,
        color:
          color || convertColorToHex(color) || palette[i] || palette[i % palette.length],
        value,
        proportion: proportionToMax(value),
        percentage: (value / grandTotal.value) * 100,
        strokeWidth:
          ringsConfig.value.style.chart.layout.rings.strokeWidth *
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
  return svg.value.height - ringsConfig.value.style.chart.layout.rings.strokeWidth * 2;
});

function useTooltip(index) {
  if (segregated.value.length === props.dataset.length) return;
  selectedSerie.value = index;

  const selected = convertedDataset.value[index];

  let html = "";

  html += `<div data-cy="waffle-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${selected.name}</div>`;

  html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="waffle-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${selected.color}" /></svg>`;
  if (ringsConfig.value.style.chart.tooltip.showValue) {
    html += `<b data-cy="waffle-tooltip-value">${selected.value.toFixed(
      ringsConfig.value.style.chart.tooltip.roundingValue
    )}</b>`;
  }
  if (ringsConfig.value.style.chart.tooltip.showPercentage) {
    if (!ringsConfig.value.style.chart.tooltip.showValue) {
      html += `<b>${((selected.value / grandTotal.value) * 100).toFixed(
        ringsConfig.value.style.chart.tooltip.roundingPercentage
      )}%</b></div>`;
    } else {
      html += `<span data-cy="waffle-tooltip-percentage">(${(
        (selected.value / grandTotal.value) *
        100
      ).toFixed(
        ringsConfig.value.style.chart.tooltip.roundingPercentage
      )}%)</span></div>`;
    }
  }
  tooltipContent.value = html;
  isTooltip.value = true;
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
            domElement: document.getElementById(`rings_${uid.value}`),
            fileName: ringsConfig.value.style.chart.title.text || 'vue-ui-rings'
        }).finally(() => {
            isPrinting.value = false;
        });
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
            domElement: document.getElementById(`rings_${uid.value}`),
            fileName: ringsConfig.value.style.chart.title.text || 'vue-ui-rings',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
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
        Number(grandTotal.value.toFixed(ringsConfig.value.table.td.roundingValue)).toLocaleString(),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            table.value.body[i].toFixed(ringsConfig.value.table.td.roundingValue),
            isNaN(table.value.body[i] / grandTotal.value) ? "-" : (table.value.body[i] / grandTotal.value * 100).toFixed(ringsConfig.value.table.td.roundingPercentage) + '%'
        ]
    });

    const config = {
        th: {
            backgroundColor: ringsConfig.value.table.th.backgroundColor,
            color: ringsConfig.value.table.th.color,
            outline: ringsConfig.value.table.th.outline
        },
        td: {
            backgroundColor: ringsConfig.value.table.td.backgroundColor,
            color: ringsConfig.value.table.td.color,
            outline: ringsConfig.value.table.td.outline
        }
    }

    return {
        head,
        body,
        config
    }
});


function generateXls() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / grandTotal.value) ? '-' : table.value.body[i] / grandTotal.value * 100]]
        });
        const tableXls = [[ringsConfig.value.style.chart.title.text],[ringsConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        makeXls(tableXls, ringsConfig.value.style.chart.title.text || "vue-ui-rings");
    });
}

defineExpose({
    getData,
    generatePdf,
    generateXls,
    generateImage
});

</script>

<template>
  <div
    ref="ringsChart"
    :class="`vue-ui-rings ${ringsConfig.useCssAnimation ? '' : 'vue-ui-dna'}`"
    :style="`font-family:${ringsConfig.style.fontFamily};width:100%;${
      ringsConfig.userOptions.show ? 'padding-top:36px' : ''
    }`"
    :id="`rings_${uid}`"
    @mouseleave="
      selectedSerie = null;
      isTooltip = false;
    "
  >
    <div
      v-if="ringsConfig.style.chart.title.text"
      :style="`width:100%;background:${ringsConfig.style.chart.backgroundColor}`"
    >
      <!-- TITLE AS DIV -->
      <Title
        :config="{
          title: {
            cy: 'rings-div-title',
            text: ringsConfig.style.chart.title.text,
            color: ringsConfig.style.chart.title.color,
            fontSize: ringsConfig.style.chart.title.fontSize,
            bold: ringsConfig.style.chart.title.bold,
          },
          subtitle: {
            cy: 'rings-div-subtitle',
            text: ringsConfig.style.chart.title.subtitle.text,
            color: ringsConfig.style.chart.title.subtitle.color,
            fontSize: ringsConfig.style.chart.title.subtitle.fontSize,
            bold: ringsConfig.style.chart.title.subtitle.bold,
          },
        }"
      />
    </div>

    <!-- USER OPTIONS -->
    <UserOptions
        ref="details"
        v-if="ringsConfig.userOptions.show"
        :backgroundColor="ringsConfig.style.chart.backgroundColor"
        :color="ringsConfig.style.chart.color"
        :isPrinting="isPrinting"
        :isImaging="isImaging"
        :title="ringsConfig.userOptions.title"
        :uid="uid"
        hasImg
        @generatePdf="generatePdf"
        @generateXls="generateXls"
        @generateImage="generateImage"
        >
        <template #checkboxes>
            <div class="vue-ui-options-item">
                <input data-cy="rings-checkbox-table" type="checkbox" :id="`vue-ui-rings-option-table_${uid}`" :name="`vue-ui-rings-option-table_${uid}`"
                v-model="mutableConfig.showTable">
                <label :for="`vue-ui-rings-option-table_${uid}`">{{ ringsConfig.userOptions.labels.showTable }}</label>
            </div>
        </template>
    </UserOptions>

    <!-- CHART -->

    <svg
      data-cy="rings-svg"
      :viewBox="`0 0 ${svg.width} ${svg.height}`"
      :style="`max-width:100%;overflow:visible;background:${ringsConfig.style.chart.backgroundColor};color:${ringsConfig.style.chart.color}`"
    >
      <!-- DEFS ? -->
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
          :stop-color="`${shiftHue(d.color, 0.05)}${
            opacity[100 - ringsConfig.style.chart.layout.rings.gradient.intensity]
          }`"
        />
        <stop offset="100%" :stop-color="d.color" />
      </radialGradient>

      <!-- RINGS -->
      <g v-for="(ring, i) in convertedDataset">
        <circle
          :class="{
            'vue-ui-rings-item': ringsConfig.useCssAnimation,
            'vue-ui-rings-opacity': selectedSerie !== null && selectedSerie !== i,
          }"
          :style="`animation-delay:${i * 100}ms`"
          :stroke="ringsConfig.style.chart.layout.rings.stroke"
          :cx="svg.width / 2"
          :cy="
            svg.height * 0.95 -
            (maxHeight * 0.9 * ring.proportion) / 2 -
            ring.strokeWidth / 2
          "
          :r="((maxHeight * ring.proportion) / 2) * 0.9"
          :fill="ringsConfig.style.chart.layout.rings.gradient.underlayerColor"
        />
        <circle
          :class="{
            'vue-ui-rings-item': ringsConfig.useCssAnimation,
            'vue-ui-rings-shadow': ringsConfig.style.chart.layout.rings.useShadow,
            'vue-ui-rings-blur': selectedSerie !== null && selectedSerie !== i,
          }"
          :style="`animation-delay:${i * 100}ms`"
          stroke="none"
          :stroke-width="ring.strokeWidth < 0.5 ? 0.5 : ring.strokeWidth"
          :cx="svg.width / 2"
          :cy="
            svg.height * 0.95 -
            (maxHeight * 0.9 * ring.proportion) / 2 -
            ring.strokeWidth / 2
          "
          :r="((maxHeight * ring.proportion) / 2) * 0.9"
          :fill="
            ringsConfig.style.chart.layout.rings.gradient.show
              ? `url(#gradient_${uid}_${i})`
              : ring.color
          "
        />
        <circle
          stroke="none"
          :cx="svg.width / 2"
          :cy="
            svg.height * 0.95 -
            (maxHeight * 0.9 * ring.proportion) / 2 -
            ring.strokeWidth / 2
          "
          :r="((maxHeight * ring.proportion) / 2) * 0.9"
          fill="transparent"
          @mouseenter="useTooltip(i)"
          @mouseleave="
            selectedSerie = null;
            isTooltip = false;
          "
        />
      </g>
    </svg>

    <!-- LEGEND AS DIV -->
    <div
      v-if="ringsConfig.style.chart.legend.show"
      class="vue-ui-rings-legend"
      :style="`font-weight:${
        ringsConfig.style.chart.legend.bold ? 'bold' : ''
      };background:${ringsConfig.style.chart.legend.backgroundColor};color:${
        ringsConfig.style.chart.legend.color
      };font-size:${
        ringsConfig.style.chart.legend.fontSize
      }px;padding-bottom:12px;font-weight:${
        ringsConfig.style.chart.legend.bold ? 'bold' : ''
      }`"
    >
      <div
        v-for="(legendItem, i) in datasetCopy.toSorted((a,b) => b.value - a.value)"
        :data-cy="`waffle-legend-item-${i}`"
        class="vue-ui-rings-legend-item"
        @click="segregate(legendItem.uid)"
        :style="`opacity:${segregated.includes(legendItem.uid) ? 0.5 : 1}`"
      >
        <svg viewBox="0 0 12 12" height="14" width="14">
          <circle
            cx="6"
            cy="6"
            r="6"
            stroke="none"
            :fill="legendItem.color"
          />
        </svg>
        <span>{{ legendItem.name }} : </span>
        <span>{{
          legendItem.value.toFixed(ringsConfig.style.chart.legend.roundingValue)
        }}</span>
        <span v-if="!segregated.includes(legendItem.uid)"
          >({{
            isNaN(legendItem.value / grandTotal)
              ? "-"
              : ((legendItem.value / grandTotal) * 100).toFixed(
                  ringsConfig.style.chart.legend.roundingPercentage
                )
          }}%)</span
        >
        <span v-else>( - % )</span>
      </div>
    </div>

    <!-- TOOLTIP -->
    <Tooltip
      :show="
        ringsConfig.style.chart.tooltip.show &&
        isTooltip &&
        segregated.length < props.dataset.length
      "
      :backgroundColor="ringsConfig.style.chart.tooltip.backgroundColor"
      :color="ringsConfig.style.chart.tooltip.color"
      :parent="ringsChart"
      :content="tooltipContent"
    />

    <!-- DATA TABLE -->
    <DataTable
            v-if="mutableConfig.showTable"
            :head="dataTable.head" 
            :body="dataTable.body"
            :config="dataTable.config"
            :title="`${ringsConfig.style.chart.title.text}${ringsConfig.style.chart.title.subtitle.text ? ` : ${ringsConfig.style.chart.title.subtitle.text}` : ''}`"
        >
            <template #th="{th}">
                <div v-html="th" style="display:flex;align-items:center"></div>
            </template>
            <template #td="{td}">
                {{ td.name || td }}
            </template>
        </DataTable>
  </div>
</template>

<style scoped>
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

.vue-ui-rings-legend {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 18px;
}
.vue-ui-rings-legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  height: 24px;
  user-select: none;
}

.vue-ui-rings-item {
  transform: scale(0, 0);
  animation: ring-appear 0.5s ease-in forwards;
  transform-origin: bottom;
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

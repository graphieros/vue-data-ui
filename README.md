<p align="center">
    <a href="https://vue-data-ui.graphieros.com/"><img src="https://vue-data-ui.graphieros.com/vue-data-ui2.png"></a>
    <br>
    <br>
    <br>
    <a href="https://vue-data-ui.graphieros.com/"><img src="https://vue-data-ui.graphieros.com/vue-data-ui-showcase.png"></a>
</p>

# vue-data-ui

![npm](https://img.shields.io/npm/v/vue-data-ui)
[![MadeWithVueJs.com shield](https://madewithvuejs.com/storage/repo-shields/4526-shield.svg)](https://madewithvuejs.com/p/vue-data-ui/shield-link)
![GitHub issues](https://img.shields.io/github/issues/graphieros/vue-data-ui)
![NPM](https://img.shields.io/npm/l/vue-data-ui)
![npm](https://img.shields.io/npm/dt/vue-data-ui)
![Static Badge](https://img.shields.io/badge/components-45-green)

[Interactive documentation](https://vue-data-ui.graphieros.com/)

A user-empowering data visualization Vue components library.

Available components:

## Charts

- [VueUiAgePyramid](https://vue-data-ui.graphieros.com/docs#vue-ui-age-pyramid)
- [VueUiCandlestick](https://vue-data-ui.graphieros.com/docs#vue-ui-candlestick)
- [VueUiChestnut](https://vue-data-ui.graphieros.com/docs#vue-ui-chestnut)
- [VueUiDonutEvolution](https://vue-data-ui.graphieros.com/docs#vue-ui-donut-evolution)
- [VueUiDonut](https://vue-data-ui.graphieros.com/docs#vue-ui-donut)
- [VueUiGalaxy](https://vue-data-ui.graphieros.com/docs#vue-ui-galaxy)
- [VueUiGauge](https://vue-data-ui.graphieros.com/docs#vue-ui-gauge)
- [VueUiHeatmap](https://vue-data-ui.graphieros.com/docs#vue-ui-heatmap)
- [VueUiMolecule](https://vue-data-ui.graphieros.com/docs#vue-ui-molecule)
- [VueUiMoodRadar](https://vue-data-ui.graphieros.com/docs#vue-ui-mood-radar)
- [VueUiNestedDonuts](https://vue-data-ui.graphieros.com/docs#vue-ui-nested-donuts)
- [VueUiOnion](https://vue-data-ui.graphieros.com/docs#vue-ui-onion)
- [VueUiQuadrant](https://vue-data-ui.graphieros.com/docs#vue-ui-quadrant)
- [VueUiQuickChart](https://vue-data-ui.graphieros.com/docs#vue-ui-quick-chart)
- [VueUiRadar](https://vue-data-ui.graphieros.com/docs#vue-ui-radar)
- [VueUiRelationCircle](https://vue-data-ui.graphieros.com/docs#vue-ui-relation-circle)
- [VueUiRings](https://vue-data-ui.graphieros.com/docs#vue-ui-rings)
- [VueUiScatter](https://vue-data-ui.graphieros.com/docs#vue-ui-scatter)
- [VueUiThermometer](https://vue-data-ui.graphieros.com/docs#vue-ui-thermometer)
- [VueUiTiremarks](https://vue-data-ui.graphieros.com/docs#vue-ui-tiremarks)
- [VueUiTreemap](https://vue-data-ui.graphieros.com/docs#vue-ui-treemap)
- [VueUiVerticalBar](https://vue-data-ui.graphieros.com/docs#vue-ui-vertical-bar)
- [VueUiWaffle](https://vue-data-ui.graphieros.com/docs#vue-ui-waffle)
- [VueUiWheel](https://vue-data-ui.graphieros.com/docs#vue-ui-wheel)
- [VueUiXy](https://vue-data-ui.graphieros.com/docs#vue-ui-xy)

## Mini charts

- [VueUiSparkHistogram](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkhistogram)
- [VueUiSparkbar](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkbar)
- [VueUiSparkgauge](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkgauge)
- [VueUiSparkline](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkline)
- [VueUiSparkstackbar](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkstackbar)

## 3d

- [VueUi3dBar](https://vue-data-ui.graphieros.com/docs#vue-ui-3d-bar)

## Tables

- [VueUiTableHeatmap](https://vue-data-ui.graphieros.com/docs#vue-ui-table-heatmap)
- [VueUiTableSparkline](https://vue-data-ui.graphieros.com/docs#vue-ui-table-sparkline)
- [VueUiTable](https://vue-data-ui.graphieros.com/docs#vue-ui-table)

## Rating

- [VueUiRating](https://vue-data-ui.graphieros.com/docs#vue-ui-rating)
- [VueUiSmiley](https://vue-data-ui.graphieros.com/docs#vue-ui-smiley)

## Utilities

- [VueUiAccordion](https://vue-data-ui.graphieros.com/docs#vue-ui-accordion)
- [VueUiAnnotator](https://vue-data-ui.graphieros.com/docs#vue-ui-annotator)
- [VueUiDashboard](https://vue-data-ui.graphieros.com/docs#vue-ui-dashboard)
- [VueUiDigits](https://vue-data-ui.graphieros.com/docs#vue-ui-digits)
- [VueUiIcon](https://vue-data-ui.graphieros.com/docs#vue-ui-icon)
- [VueUiKpi](https://vue-data-ui.graphieros.com/docs#vue-ui-kpi)
- [VueUiMiniLoader](https://vue-data-ui.graphieros.com/docs#vue-ui-mini-loader)
- [VueUiScreenshot](https://vue-data-ui.graphieros.com/docs#vue-ui-screenshot)
- [VueUiSkeleton](https://vue-data-ui.graphieros.com/docs#vue-ui-skeleton)

# Installation

```
npm i vue-data-ui
```

You can declare components globally in your main.js:

```
import { createApp } from 'vue'
import App from "./App.vue";
// Include the css;
import "vue-data-ui/style.css";

// You can declare Vue Data UI components globally
import { VueUiRadar } from "vue-data-ui";

const app = createApp(App);

app.component("VueUiRadar", VueUiRadar);
app.mount('#app');
```

Or you can import just what you need in your files:

```
<script setup>
  import { VueUiRadar, VueUiXy } from "vue-data-ui";
</script>
```

Since v.2.0.38, you can also use the "VueDataUi" universal component, just specifying which component you are using. You can of course use the slots provided, if the target component has them.

```
<script setup>
import { ref } from "vue";
import { VueDataUi } from "vue-data-ui";
// Include the css;
import "vue-data-ui/style.css";

const config = ref({...});
const dataset = ref([...]);

</script>

<template>

  <VueDataUi
    component="VueUiXy"
    :config="config"
    :dataset="dataset"
  />

</template>

```

## Typescript

Types are available in the 'vue-data-ui.d.ts' file under the types directory of the package.

## Nuxt

[This repo contains a boilerplate implementation of the vue-data-ui package in Nuxt](https://github.com/graphieros/vue-data-ui-nuxt)

# Customizable tooltips

Charts with tooltips have a config option to customize tooltip contents:

```

customFormat: ({ seriesIndex, datapoint, series, config }) => {
  return `<div>${ ... }</div>`;
}

```

# Slots

## #svg slot

Most Vue Data UI chart components include a #svg slot you can use to introduce customized svg elements (shapes, text, etc).

```
<VueUiXy :dataset="dataset" :config="config">
  <template #svg="{ svg }">
    <foreignObject x="100" y="0" height="100" width="150">
      <div>
        This is a custom caption
      </div>
    </foreignObject>
  </template>
</VueUiXy>

```

The svg slot also works when using the VueDataUi universal component, if the component it wraps supports it.

## #legend slot (since v.2.0.41)

All charts expose a #legend slot except for:

- VueUiHeatmap
- VueUiRelationCircle
- VueUiSparkHistogram
- VueUiSparkStackbar
- VueUiSparkbar
- VueUiSparkgauge
- VueUiSparkline
- VueUiThermometer
- VueUiTiremarks
- VueUiWheel

The legend slot also works when using the VueDataUi universal component, if the component it wraps supports it.
It is recommended to set the show legend config attribute to false, to hide the default legend.

```
<VueUiDonut :config="config" :dataset="dataset">
  <template #legend="{ legend }">
    <div v-for="item in legend">
      {{ legend.name }}
    </div>
  </template>
</VueUiDonut>
```

## Tooltip #tooltip-before & #tooltip-after slots

Since v.2.0.57, it is possible to further customize tooltip contents with #tooltip-before and #tooltip-after slots.
It is that easy to include an image, another chart or any other content into your tooltips. It's an alternative to the config option tooltip.customFormat, in case richer tooltip content is needed.

Both slots expose the following object:

```
{
  datapoint,
  seriesIndex,
  series,
  config,
}
```

The following charts bear these slots:

- VueUiAgePyramid
- VueUiCandlestick
- VueUiDonut
- VueUiGalaxy
- VueUiHeatmap
- VueUiMolecule
- VueUiNestedDonuts
- VueUiOnion
- VueUiQuadrant
- VueUiRadar
- VueUiRings
- VueUiScatter
- VueUiTreemap
- VueUiVerticalBar
- VueUiXy \*
- VueUiwaffle

\* VueUiXy slots specifically expose the following additional attributes:

```

{
  ...,
  bars,
  lines,
  plots
}

```

```
<VueUiDonut :config="config" :dataset="dataset">
  <template #tooltip-before={ datapoint, seriesIndex, dataset, config }">
    <div>
      This content shows first
    </div>
  </template>
  <template #tooltip-after={ datapoint, seriesIndex, dataset, config }">
    <div>
      This content shows last
    </div>
  </template>
</VueUiDonut>
```

The #tooltip-before & #tooltip-after slots also works when using the VueDataUi universal component, if the component it wraps supports them.

# Config

If for some reason you can't access the documentation website and need to get the default config object for a component:

```
import { getVueDataUiConfig } from "vue-data-ui";

const defaultConfigXy = getVueDataUiConfig("vue_ui_xy");

```

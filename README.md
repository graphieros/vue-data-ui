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
![Static Badge](https://img.shields.io/badge/components-39-green)

[Interactive documentation](https://vue-data-ui.graphieros.com/)

A user-empowering data visualization Vue components library.

Available components:

## Charts

- [VueUiXy](https://vue-data-ui.graphieros.com/docs#vue-ui-xy)
- [VueUiDonut](https://vue-data-ui.graphieros.com/docs#vue-ui-donut)
- [VueUiWaffle](https://vue-data-ui.graphieros.com/docs#vue-ui-waffle)
- [VueUiRadar](https://vue-data-ui.graphieros.com/docs#vue-ui-radar)
- [VueUiQuadrant](https://vue-data-ui.graphieros.com/docs#vue-ui-quadrant)
- [VueUiGauge](https://vue-data-ui.graphieros.com/docs#vue-ui-gauge)
- [VueUiChestnut](https://vue-data-ui.graphieros.com/docs#vue-ui-chestnut)
- [VueUiOnion](https://vue-data-ui.graphieros.com/docs#vue-ui-onion)
- [VueUiVerticalBar](https://vue-data-ui.graphieros.com/docs#vue-ui-vertical-bar)
- [VueUiHeatmap](https://vue-data-ui.graphieros.com/docs#vue-ui-heatmap)
- [VueUiScatter](https://vue-data-ui.graphieros.com/docs#vue-ui-scatter)
- [VueUiCandlestick](https://vue-data-ui.graphieros.com/docs#vue-ui-candlestick)
- [VueUiAgePyramid](https://vue-data-ui.graphieros.com/docs#vue-ui-age-pyramid)
- [VueUiRelationCircle](https://vue-data-ui.graphieros.com/docs#vue-ui-relation-circle)
- [VueUiThermometer](https://vue-data-ui.graphieros.com/docs#vue-ui-thermometer)
- [VueUiRings](https://vue-data-ui.graphieros.com/docs#vue-ui-rings)
- [VueUiWheel](https://vue-data-ui.graphieros.com/docs#vue-ui-wheel)
- [VueUiTiremarks](https://vue-data-ui.graphieros.com/docs#vue-ui-tiremarks)
- [VueUiDonutEvolution](https://vue-data-ui.graphieros.com/docs#vue-ui-donut-evolution)
- [VueUiMoodRadar](https://vue-data-ui.graphieros.com/docs#vue-ui-mood-radar)
- [VueUiMolecule](https://vue-data-ui.graphieros.com/docs#vue-ui-molecule)
- [VueUiNestedDonuts](https://vue-data-ui.graphieros.com/docs#vue-ui-nested-donuts)

## Mini charts

- [VueUiSparkline](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkline)
- [VueUiSparkbar](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkbar)
- [VueUiSparkstackbar](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkstackbar)
- [VueUiSparkHistogram](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkhistogram)
- [VueUiSparkgauge](https://vue-data-ui.graphieros.com/docs#vue-ui-sparkgauge)

## 3d

- [VueUi3dBar](https://vue-data-ui.graphieros.com/docs#vue-ui-3d-bar)

## Tables

- [VueUiTableSparkline](https://vue-data-ui.graphieros.com/docs#vue-ui-table-sparkline)
- [VueUiTable](https://vue-data-ui.graphieros.com/docs#vue-ui-table)

## Rating

- [VueUiRating](https://vue-data-ui.graphieros.com/docs#vue-ui-rating)
- [VueUiSmiley](https://vue-data-ui.graphieros.com/docs#vue-ui-smiley)

## Utilities

- [VueUiScreenshot](https://vue-data-ui.graphieros.com/docs#vue-ui-screenshot)
- [VueUiSkeleton](https://vue-data-ui.graphieros.com/docs#vue-ui-skeleton)
- [VueUiDashboard](https://vue-data-ui.graphieros.com/docs#vue-ui-dashboard)
- [VueUiAnnotator](https://vue-data-ui.graphieros.com/docs#vue-ui-annotator)
- [VueUiIcon](https://vue-data-ui.graphieros.com/docs#vue-ui-icon)
- [VueUiDigits](https://vue-data-ui.graphieros.com/docs#vue-ui-digits)
- [VueUiMiniLoader](https://vue-data-ui.graphieros.com/docs#vue-ui-mini-loader)

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

Since v.2.0.38, you can also use the "VueDataUi" universal component, just specifying which component you are using:

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

- VueUiWheel
- VueUiTiremarks
- VueUiHeatmap
- VueUiRelationCircle
- VueUiThermometer
- VueUiSparkline
- VueUiSparkbar
- VueUiSparkStackbar
- VueUiSparkgauge
- VueUiSparkHistogram

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

# Config

If for some reason you can't access the documentation website and need to get the default config object for a component:

```
import { getVueDataUiConfig } from "vue-data-ui";

const defaultConfigXy = getVueDataUiConfig("vue_ui_xy");

```

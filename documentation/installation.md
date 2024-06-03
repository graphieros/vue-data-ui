# Installation

## Declaring components globally

You can declare components from the library globally in your main.js (or main.ts) file.

If you need to declare many components globally, a smart thing to do is to declare only the VueDataUi universal component, which you can use to create all components provided by the library:

```js
import { createApp } from "vue";
import App from "./App.vue";
// Include the css
import "vue-data-ui/style.css";
import { VueDataUi } from "vue-data-ui";
const app = createApp(App);
app.component("VueDataUi", VueDataUi);
app.mount("#app");
```

Usage in your vue files:

```js
<script setup>
    import { ref } from "vue";
    const dataset = ref() // Use the appropriate data structure (mandatory)
    const config = ref({}) // Use the appropriate config object (optional)
</script>

<template>
    <div class="w-full">
        <VueDataUi
            component="VueUiDonut"
            :dataset="dataset"
            :config="config"
        />
    </div>
</template>
```

## Importing components directly into a Vue file

In your component:

```js
<script setup>
  import { ref } from "vue";
  import { VueDataUi } from "vue-data-ui";
  // Include the css if not already done globally
  import "vue-data-ui/style.css" from "vue-data-ui";
  const dataset = ref([]);
  const config = ref({})
</script>
<template>
  <div class="w-full">
    <VueDataUi
      component="VueUiDonut"
      :dataset="dataset"
      :config="config"
    />
  </div>
</template>
```

## TS types

Types are available in the dist directory of the library.
You can copy paste the vue-data-ui.d.ts file into your application to have all types available.

If you don't use TS in your project, this file can still be helpful to know the data structures of datasets that need to be passed as props.

## Config objects

All components in the library can be customized through a config object passed as a prop.

The config prop is optional, defaults will apply if you don't use it. Defaults will also be applied to all configuration attributes you did not modify yourself in the config object passed as a prop.

Declaring your config as a computed property makes it easy to toggle dark/lightmode colors.

If you don't have access to the online documentation website, you can summon any configuration object using the built-in 'getVueDataUiConfig' method, passing the name of the component as parameter:

```js
import { getVueDataUiConfig } from "vue-data-ui";
const defaultDonutConfig = getVueDataUiConfig("VueUiDonut");
console.log(defaultDonutConfig);
```

## Available components

Type definitions are available in the `vue-data-ui.d.ts` file in the `dist/types` directory.

### Universal component

| Name        | dataset type           | config type            | emits / exposed methods | slots                  | custom tooltip         |
| ----------- | ---------------------- | ---------------------- | ----------------------- | ---------------------- | ---------------------- |
| `VueDataUi` | (depends on component) | (depends on component) | (depends on component)  | (depends on component) | (depends on component) |

### Quick chart

From the dataset you pass into the props, this component will produce the most adapted chart (either a line, bar or donut chart)

| Name              | dataset type             | config type             | emits / exposed methods                                             | slots                                                           | custom tooltip |
| ----------------- | ------------------------ | ----------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------- | -------------- |
| `VueUiQuickChart` | `VueUiQuickChartDataset` | `VueUiQuickChartConfig` | `@selectDatapoint`, `@selectLegend`, `generatePdf`, `generateImage` | `#legend`, `#tooltip-before`, `#tooltip-after`, `#reset-action` | ✅             |

### Mini charts

| Name                  | dataset type                       | config type                 | emits / exposed methods | slots             | custom tooltip |
| --------------------- | ---------------------------------- | --------------------------- | ----------------------- | ----------------- | -------------- |
| `VueUiSparkline`      | `VueUiSparklineDatasetItem[]`      | `VueUiSparklineConfig`      | `@selectDatapoint`      | `#svg`, `#before` | ❌             |
| `VueUiSparkbar`       | `VueUiSparkbarDatasetItem[]`       | `VueUiSparkbarConfig`       | `@selectDatapoint`      | ❌                | ❌             |
| `VueUiSparkStackbar`  | `VueUiSparkStackbarDatasetItem[]`  | `VueUiSparkStackbarConfig`  | `@selectDatapoint`      | ❌                | ❌             |
| `VueUiSparkHistogram` | `VueUiSparkHistogramDatasetItem[]` | `VueUiSparkHistogramConfig` | `@selectDatapoint`      | ❌                | ❌             |
| `VueUiSparkGauge`     | `VueUiSparkGaugeDataset`           | `VueUiSparkGaugeConfig`     | ❌                      | ❌                | ❌             |
| `VueUiSparkTrend`     | `number[]`                         | `VueUiSparkTrendConfig`     | ❌                      | ❌                | ❌             |

### Charts

| Name                  | dataset type                       | config type                 | emits / exposed methods                                                                                 | slots                                                                   | custom tooltip |
| --------------------- | ---------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------- |
| `VueUiAgePyramid`     | `Array<Array<string / number>>`    | `VueUiSparklineConfig`      | `generatePdf`, `generateImage`                                                                          | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiCandlestick`    | `Array<Array<string / number>>`    | `VueUiCandlestickConfig`    | `generatePdf`, `generateImage`, `generateCsv`                                                           | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`, `#reset-action` | ✅             |
| `VueUiChestnut`       | `VueUiChestnutDatasetRoot[]`       | `VueUiChestnutConfig`       | `@selectRoot`, `@selectBranch`, `@selectNut`, `getData`, `generatePdf`, `generateCsv`, `generateImage`  | `#svg`, `#legend`                                                       | ❌             |
| `VueUiDonut`          | `VueUiDonutDatasetItem[]`          | `VueUiDonutConfig`          | `@selectDatapoint`, `@selectLegend`, `getData`, `generatePdf`, `generateCsv`, `generateImage`           | `#svg`, `#legend`, `#dataLabel`, `#tooltip-before`, `#tooltip-after`    | ✅             |
| `VueUiDonutEvolution` | `VueUiDonutEvolutionDatasetItem[]` | `VueUiDonutEvolutionConfig` | `@selectLegend`, `getData`, `generatePdf`, `generateCsv`, `generateImage`                               | `#svg`, `#legend`, `#reset-action`                                      | ❌             |
| `VueUiDumbbell`       | `VueUiDumbbellDataset[]`           | `VueUiDumbbellConfig`       | `getData`, `generatePdf`, `generateCsv`, `generateImage`                                                | `#svg`, `#legend`,                                                      | ❌             |
| `VueUiGalaxy`         | `VueUiGalaxyDatasetItem[]`         | `VueUiGalaxyConfig`         | `@selectDatapoint`, `@selectLegend`, `getData`, `generatePdf`, `generateCsv`, `generateImage`           | `#svg`, `#legend`,`#tooltip-before`, `#tooltip-after`                   | ✅             |
| `VueUiGauge`          | `VueUiGaugeDataset`                | `VueUiGaugeConfig`          | `generatePdf`, `generateImage`                                                                          | `#svg`, `#legend`,                                                      | ❌             |
| `VueUiHeatmap`        | `VueUiHeatmapDatasetItem[]`        | `VueUiHeatmapConfig`        | `generatePdf`, `generateCsv`, `generateImage`                                                           | `#svg`, `#tooltip-before`, `#tooltip-after`                             | ✅             |
| `VueUiMolecule`       | `VueUiMoleculeDatasetNode[]`       | `VueUiMoleculeConfig`       | `getData`, `generatePdf`, `generateCsv`, `generateImage`                                                | `#svg`, `#tooltip-before`, `#tooltip-after`                             | ✅             |
| `VueUiMoodRadar`      | `VueUiMoodRadarDataset`            | `VueUiMoodRadarConfig`      | `getData`, `generatePdf`, `generateCsv`, `generateImage`                                                | `#svg`, `#legend`                                                       | ❌             |
| `VueUiNestedDonuts`   | `VueUiNestedDonutsDatasetItem[]`   | `VueUiNestedDonutsConfig`   | `@selectDatapoint`, `@selectLegend`, `getData`, `generatePdf`, `generateCsv`, `generateImage`           | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiOnion`          | `VueUiOnionDatasetItem[]`          | `VueUiOnionConfig`          | `@selectLegend`, `getData`, `generatePdf`, `generateCsv`, `generateImage`                               | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiQuadrant`       | `VueUiQuadrantDatasetItem[]`       | `VueUiQuadrantConfig`       | `@selectLegend`, `@selectPlot`, `@selectSide`, `getData`, `generatePdf`, `generateCsv`, `generateImage` | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiRadar`          | `VueUiRadarDataset`                | `VueUiRadarConfig`          | `@selectLegend`, `getData`, `generatePdf`, `generateCsv`, `generateImage`                               | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiRings`          | `VueUiRingsDatasetItem[]`          | `VueUiRingsConfig`          | `@selectLegend`, `getData`, `generatePdf`, `generateCsv`, `generateImage`                               | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiScatter`        | `VueUiScatterDatasetItem[]`        | `VueUiScatterConfig`        | `getData`, `generatePdf`, `generateCsv`, `generateImage`                                                | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiStripPlot`      | `VueUiStripPlotDataset[]`          | `VueUiStripPlotConfig`      | `@selectDatapoint`, `getData`, `generatePdf`, `generateCsv`, `generateImage`                            | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiThermometer`    | `VueUiThermometerDataset`          | `VueUiThermometerConfig`    | `generatePdf`, `generateImage`                                                                          | `#svg`                                                                  | ❌             |
| `VueUiTiremarks`      | `VueUiTiremarksDataset`            | `VueUiTiremarksConfig`      | `generatePdf`, `generateImage`                                                                          | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ❌             |
| `VueUiTreemap`        | `VueUiTreemapDatasetItem[]`        | `VueUiTreemapConfig`        | `@selectLegend`, `@selectDatapoint`, `getData`, `generatePdf`, `generateCsv`, `generateImage`           | `#svg`, `#rect`, `#legend`, `#tooltip-before`, `#tooltip-after`         | ✅             |
| `VueUiVerticalBar`    | `VueUiVerticalBarDatasetItem[]`    | `VueUiWheelConfig`          | `@selectLegend`, `getData`, `generatePdf`, `generateCsv`, `generateImage`                               | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiWaffle`         | `VueUiWaffleDatasetItem[]`         | `VueUiWaffleConfig`         | `@selectLegend`, `getData`, `generatePdf`, `generateCsv`, `generateImage`                               | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`                  | ✅             |
| `VueUiWheel`          | `VueUiWheelDataset`                | `VueUiWheelConfig`          | `generatePdf`, `generateImage`                                                                          | `#svg`                                                                  | ❌             |
| `VueUiXy`             | `VueUiXyDatasetItem[]`             | `VueUiXyConfig`             | `@selectLegend`, `@selectX`, `getData`, `generatePdf`, `generateCsv`, `generateImage`                   | `#svg`, `#legend`, `#tooltip-before`, `#tooltip-after`, `#reset-action` | ✅             |

### 3D charts

| Name         | dataset type        | config type        | emits / exposed methods        | slots  | custom tooltip |
| ------------ | ------------------- | ------------------ | ------------------------------ | ------ | -------------- |
| `VueUi3dBar` | `VueUi3dBarDataset` | `VueUi3dBarConfig` | `generatePdf`, `generateImage` | `#svg` | ❌             |

### Data tables

| Name                  | dataset type                       | config type                 | emits / exposed methods                       | slots                                                           |
| --------------------- | ---------------------------------- | --------------------------- | --------------------------------------------- | --------------------------------------------------------------- |
| `VueUiTable`          | `VueUiTableDataset`                | `VueUiTableConfig`          | ❌                                            | ❌                                                              |
| `VueUiTableHeatmap`   | `VueUiTableHeatmapDatasetItem[]`   | `VueUiTableHeatmapConfig`   | `generatePdf`, `generateCsv`, `generateImage` | `#caption`, `#rowTitle`, `#cell`, `#sum`, `#average`, `#median` |
| `VueUiTableSparkline` | `VueUiTableSparklineDatasetItem[]` | `VueUiTableSparklineConfig` | `generatePdf`, `generateCsv`, `generateImage` | ❌                                                              |

### Rating

| Name          | dataset type         | config type         | emits / exposed methods             |
| ------------- | -------------------- | ------------------- | ----------------------------------- |
| `VueUiRating` | `VueUiRatingDataset` | `VueUiRatingConfig` | `@rate`, `getData`,`toggleReadonly` |
| `VueUiSmiley` | `VueUiRatingDataset` | `VueUiSmileyConfig` | `@rate`, `getData`,`toggleReadonly` |

### Utilities

| Name              | dataset type              | config type             | emits / exposed methods                | slots                                                   |
| ----------------- | ------------------------- | ----------------------- | -------------------------------------- | ------------------------------------------------------- |
| `VueUiAccordion`  | ❌                        | `VueUiAccordionConfig`  | ❌                                     | `#arrow`, `#title`, `#content`                          |
| `VueUiAnnotator`  | `VueUiAnnotatorDataset`   | `VueUiAnnotatorConfig`  | `@toggleOpenState`, `@saveAnnotations` | ❌                                                      |
| `VueUiCursor`     | ❌                        | `VueUiCursorConfig`     | ❌                                     | ❌                                                      |
| `VueUiDashboard`  | `VueUiDashboardElement[]` | `VueUiDashboardConfig`  | `@change`                              | `#content`                                              |
| `VueUiDigits`     | `number`                  | `VueUiDigitsConfig`     | ❌                                     | ❌                                                      |
| `VueUiKpi`        | `number`                  | `VueUiKpiConfig`        | ❌                                     | `#title`, `#value`, `#comment-before`, `#comment-after` |
| `VueUiMiniLoader` | ❌                        | `VueUiMiniLoaderConfig` | ❌                                     | ❌                                                      |
| `VueUiScreenshot` | ❌                        | `VueUiScreenshotConfig` | `@postImage`, `shoot`, `close`         | ❌                                                      |
| `VueUiSkeleton`   | ❌                        | `VueUiSkeletonConfig`   | ❌                                     | ❌                                                      |
| `VueUiIcon`       | see below                 |

### Icons

Tailor made icons are available through the VueUiIcon component:

```html
<VueUiIcon name="arrowRight" :size="24" stroke="#6376DD" />
```

All names of available icons are available in the vue-data-ui.d.ts file under the `VueUiIconName` type.

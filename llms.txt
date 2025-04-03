# Vue Data UI

> VueDataUI is a Vue 3 data visualization library providing numerous chart components (pie/donut, bar, line, radar, etc.), as well as tables and rating components. This guide offers ready-to-use examples and best practices for integrating VueDataUI into your Vue application. The content is optimized for AI code editors (GitHub Copilot, Cursor, etc.) to suggest correct usage patterns.

Important notes:
- This library is *not* compatible with Vue2. It is to be used with Vue3.
- **Import and CSS:** Always import the required VueDataUI component and ensure you include the library's CSS.
- **Reactive Data:** Use Vue's reactivity (`ref` or `computed`) to manage your `dataset` and `config` objects.
- **Component Customization:** Use the config object to customize appearance (colors, legends, chart dimensions, etc.) based on your specific needs.
- **CLI Utilization:** Leverage `vue-data-ui-cli` for quick scaffolding of new components, ensuring proper structure and reducing setup errors.
- **AI Integration:** With these clear examples, AI code editors should suggest correct imports, prop bindings, and data structures, making it easier to build interactive charts with VueDataUI.

## Docs

- [README](https://github.com/graphieros/vue-data-ui/blob/master/README.md): Readme file of the vue-data-ui library
- [Documentation]https://vue-data-ui.graphieros.com/: Official documentation website for the vue-data-ui library

## Getting Started with VueDataUI

To begin, install the library and include its stylesheet:

    npm install vue-data-ui

In your main entry file (e.g., main.js or main.ts), import the CSS and optionally register components globally:

    import { createApp } from 'vue';
    import App from './App.vue';
    import 'vue-data-ui/style.css';  // Include VueDataUI styles

    // Example: register a component globally (optional)
    import { VueUiXy } from 'vue-data-ui';
    const app = createApp(App);
    app.component('VueUiXy', VueUiXy);

    app.mount('#app');

You can also import components locally within Vue single-file components (see examples below). VueDataUI offers a **universal component** `<VueDataUi>` that can load any chart dynamically. For example:

    <template>
      <!-- Using the universal component to load a Donut chart -->
      <VueDataUi component="VueUiDonut" :dataset="dataset" :config="config" />
    </template>

    <script setup>
    import { ref } from 'vue';
    import { VueDataUi } from 'vue-data-ui';  // universal component
    import 'vue-data-ui/style.css';           // ensure styles are imported

    const dataset = ref([ /* ... data ... */ ]);
    const config = ref({ /* ... config ... */ });
    </script>

Using `VueDataUi` will lazy-load only the specified chart component.

## XY Chart Example

For line (or area) charts, bar chart, or combined charts, use the `VueUiXy` component. The dataset is an array of data points with the following datastructure:

    type VueUiXyDatasetItem = {
        name: string;
        series: number[];
        type: "bar" | "line" | "plot";
        color?: string;
        dashed?: boolean;
        useTag?: "start" | "end" | "none";
        showSerieName?: "start" | "end";
        useArea?: boolean;
        dataLabels?: boolean;
        useProgression?: boolean; // Display a trend line
        scaleSteps?: number; // The preferred number of scale segments on the y axis
        scaleLabel?: string;
        scaleMax?: number; // Force the max scale value
        scaleMin?: number; // Force the min scale value
        autoScaling?: boolean;
        stackRatio?: number; // In stacked mode, sets the height ratio of the datapoint
        comments?: string[]; // Provide an array of comments which will display at same index as the series item
        shape?: Shape; // circle, triangle, square, pentagon, hexagon, star
        smooth?: boolean; // Display as a spline
        prefix?: string; // Use a prefix on data labels
        suffix?: string; // Use a suffix on data labels
    }

    <!-- LineChart.vue - example of a basic line chart -->
    <template>
      <VueUiXy :dataset="dataset" :config="config" />
    </template>

    <script setup>
    import { ref } from 'vue';
    import { VueUiXy } from 'vue-data-ui';  // import the XY chart component

    // Reactive dataset: array of points with minimal required attributes
    const dataset = ref([
        { name: 'Serie A', series: [1, 2, 3, 5], type: 'line' },
        { name: 'Serie B', series: [13, 21, 3, 2], type: 'bar' },
        { name: 'Serie C', series: [8, 2, 3, 6], type: 'plot' },
    ]);

    // Minimal config for the line chart (optional). The TS type for the config is VueUiXyConfig
    const config = ref({
        chart: {
            fontFamily: "inherit",
            backgroundColor: "#FFFFFF",
            color: "#1A1A1A",
            grid: {
                showHorizontalLines: false,
                showVerticalLines: false,
                labels: {
                    show: true, // shows datapoint labels if the 
                    color: "#1A1A1A",
                    xAxisLabels: {
                        values: ['01-01-2026', '02-01-2026', '03-01-2026', '04-01-2026'], // The values displayed on the x axis (time labels)
                        rotation: 0, // to rotate the x axis labels
                    }
                }
            },
            title: {
                text: 'Title',
                color: '#1A1A1A'
            },
            bar: {      // Specific config for bar types
                labels: {
                    show: true,
                }
            },
            line: {     // Specific config for line types
                labels: {
                    show: true
                }
            },
            plot: {     // Specific config for plot types
                labels: {
                    show: true
                }
            },
            tooltip: {
                show: true,
                customFormat: null, // Provide a custom html content with a callback, for example: ({ seriesIndex, datapoint, series, config, bars, lines, plots }) => { return `Your content` }
            }
        }
    });
    </script>

## Sparkline Chart Example

Sparkline charts are mini charts for showing trends. The `VueUiSparkline` component renders a small, minimalist line chart. The dataset is an array of data points with the following datastructure:

    type VueUiSparklineDatasetItem = {
        period: string // For example, a date
        value: number
    }

    <!-- SparklineChart.vue - example of a sparkline chart -->
    <template>
      <VueUiSparkline :dataset="dataset" :config="config" />
    </template>

    <script setup>
    import { ref } from 'vue';
    import { VueUiSparkline } from 'vue-data-ui';  // import the Sparkline component
    

    // Reactive dataset: an array of objects of type VueUiSparklineDatasetItem
    const dataset = ref([
        { period: 'January', value: 1 },
        { period: 'February', value: 2 },
        { period: 'March', value: 3 },
    ]);

    // Minimal config example for the sparkline chart (optional). Full config type is VueUiSparklineConfig
    const config = ref({
        type: 'line', // or 'bar'
        style: {
            area: {
                show: true,
            },
            dataLabel: {
                show: true
            },
            line: {
                color: '#6376DD'
            },
            plot: {
                show: true,
                radius: 4
            },
            title: {
                show: true,
                text: 'Title'
            },
            tooltip: {
                show: true
            },
            verticalIndicator: {
                show: true,
            }
        }
    });
    </script>

Notes:  
- Ideal for embedding in dashboards or tables to indicate trends.

## Using the vue-data-ui-cli

VueDataUI offers a CLI tool, `vue-data-ui-cli`, to quickly generate chart component boilerplates.

### Installation:

    npm install -g vue-data-ui-cli

This installs a global command `vdui-cli` (short for VueDataUI CLI).

### Usage:

Run the CLI in your project directory:

    vdui-cli

You'll be prompted for:
- **Component Type:** Select the VueDataUI chart type (e.g., Donut, Radar, etc.).
- **Reactive API:** Choose how to manage reactive data (using `ref` or `computed`).
- **TypeScript Usage:** Decide if the component should be in TypeScript or JavaScript.
- **Component Name:** Provide a name for your component (e.g., `MyDonutChart`).
- **Target Directory:** Specify where to create the new component file.

The CLI will generate a Vue single-file component pre-populated with:
- Correct imports for VueDataUI components.
- Sample reactive `dataset` and `config` objects.
- A template ready to render the selected chart.

This tool helps maintain consistency and speeds up development by providing a reliable boilerplate.

import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import removeAttr from 'remove-attr';

const prod = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    removeAttr({
      extensions: [ 'vue' ],
      attributes: prod ?  [ 'data-cy' ] : [],  
  })
  ],
  build: {
    lib: {
      // src/indext.ts is where we have exported the component(s)
      entry: resolve(__dirname, "src/index.js"),
      name: "VueDataUi",
      // the name of the output files when the build is run
      fileName: "vue-data-ui",
      formats: ['es']
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["vue", "vue-data-ui"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
        },
        manualChunks(id) {
          if (id.includes('Tooltip')) {
            return 'tooltip';
          }
          if (id.includes('Legend')) {
            return 'legend';
          }
          if (id.includes('UserOptions')) {
            return 'user-options';
          }
          if (id.includes('DataTable')) {
            return 'data-table';
          }
          if (id.includes('Title')) {
            return 'title';
          }
          if (id.includes('themes')) {
            return 'themes';
          }
          if (id.includes('vue-ui-3d-bar')) {
            return 'vue-ui-3d-bar'
          }
          if (id.includes('vue-ui-donut')) {
            return 'vue-ui-donut'
          }
          if (id.includes('vue-ui-waffle')) {
            return 'vue-ui-waffle'
          }
          if (id.includes('vue-ui-nested-donuts')) {
            return 'vue-ui-nested-donuts'
          }
          if (id.includes('vue-ui-treemap')) {
            return 'vue-ui-treemap'
          }
          if (id.includes('vue-ui-radar')) {
            return 'vue-ui-radar'
          }
          if (id.includes('vue-ui-mood-radar')) {
            return 'vue-ui-mood-radar'
          }
          if (id.includes('vue-ui-gauge')) {
            return 'vue-ui-gauge'
          }
          if (id.includes('vue-ui-quadrant')) {
            return 'vue-ui-quadrant'
          }
          if (id.includes('vue-ui-wheel')) {
            return 'vue-ui-wheel'
          }
          if (id.includes('vue-ui-tiremarks')) {
            return 'vue-ui-tiremarks'
          }
          if (id.includes('vue-ui-chestnut')) {
            return 'vue-ui-chestnut'
          }
          if (id.includes('vue-ui-onion')) {
            return 'vue-ui-onion'
          }
          if (id.includes('vue-ui-vertical-bar')) {
            return 'vue-ui-vertical-bar'
          }
          if (id.includes('vue-ui-heatmap')) {
            return 'vue-ui-heatmap'
          }
          if (id.includes('vue-ui-scatter')) {
            return 'vue-ui-scatter'
          }
          if (id.includes('vue-ui-candlestick')) {
            return 'vue-ui-candlestick'
          }
          if (id.includes('vue-ui-candlestick')) {
            return 'vue-ui-candlestick'
          }
          if (id.includes('vue-ui-quick-chart')) {
            return 'vue-ui-quick-chart'
          }
          if (id.includes('vue-ui-age-pyramid')) {
            return 'vue-ui-age-pyramid'
          }
          if (id.includes('vue-ui-relation-circle')) {
            return 'vue-ui-relation-circle'
          }
          if (id.includes('vue-ui-thermometer')) {
            return 'vue-ui-thermometer'
          }
          if (id.includes('vue-ui-rings')) {
            return 'vue-ui-rings'
          }
          if (id.includes('vue-ui-molecule')) {
            return 'vue-ui-molecule'
          }
          if (id.includes('vue-ui-galaxy')) {
            return 'vue-ui-galaxy'
          }
          if (id.includes('vue-ui-strip-plot')) {
            return 'vue-ui-strip-plot'
          }
          if (id.includes('vue-ui-dumbbell')) {
            return 'vue-ui-dumbbell'
          }
          if (id.includes('vue-ui-word-cloud')) {
            return 'vue-ui-word-cloud'
          }
          if (id.includes('vue-ui-flow')) {
            return 'vue-ui-flow'
          }
          if (id.includes('vue-ui-parallel-coordinate-plot')) {
            return 'vue-ui-parallel-coordinate-plot'
          }
          if (id.includes('vue-ui-mini-loader')) {
            return 'vue-ui-mini-loader'
          }
          if (id.includes('vue-ui-kpi')) {
            return 'vue-ui-kpi'
          }
          if (id.includes('vue-ui-timer')) {
            return 'vue-ui-timer'
          }
          if (id.includes('vue-ui-annotator')) {
            return 'vue-ui-annotator'
          }
          if (id.includes('vue-ui-cursor')) {
            return 'vue-ui-cursor'
          }
          if (id.includes('vue-ui-digits')) {
            return 'vue-ui-digits'
          }
          if (id.includes('vue-ui-rating')) {
            return 'vue-ui-rating'
          }
          if (id.includes('vue-ui-dashboard')) {
            return 'vue-ui-dashboard'
          }
          if (id.includes('vue-ui-screenshot')) {
            return 'vue-ui-screenshot'
          }
          if (id.includes('vue-ui-smiley')) {
            return 'vue-ui-smiley'
          }
          if (id.includes('vue-ui-sparkhistogram')) {
            return 'vue-ui-sparkhistogram'
          }
          if (id.includes('vue-ui-sparkgauge')) {
            return 'vue-ui-sparkgauge'
          }
          if (id.includes('vue-ui-sparkstackbar')) {
            return 'vue-ui-sparkstackbar'
          }
          if (id.includes('vue-ui-spark-trend')) {
            return 'vue-ui-spark-trend'
          }
          if (id.includes('vue-ui-table-heatmap')) {
            return 'vue-ui-table-heatmap'
          } else if(id.includes('vue-ui-table')) {
            return 'vue-ui-table'
          }
          if (id.includes('vue-ui-xy-canvas')) {
            return 'vue-ui-xy-canvas';
          } else if(id.includes('vue-ui-xy')) {
            return 'vue-ui-xy';
          }
        }
      },
    },
    types: [
      {
        declarationDir: "dist/types",
        root: resolve(__dirname, "types"),
        entry: "vue-data-ui.d.ts",
      },
    ],
  },
});
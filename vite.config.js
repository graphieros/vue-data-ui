import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import removeAttr from "remove-attr";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

const prod = process.env.NODE_ENV === "production";

/**
 * Public entry points
 */
const entries = {
  index: resolve(__dirname, "src/index.js"),
  "components/arrow": resolve(__dirname, "src/entries/arrow.js"),
  "components/vue-ui-annotator": resolve(__dirname, "src/entries/vue-ui-annotator.js"),
  "components/vue-ui-xy": resolve(__dirname, "src/entries/vue-ui-xy.js"),
  "components/vue-ui-3d-bar": resolve(__dirname, "src/entries/vue-ui-3d-bar.js"),
  "components/vue-ui-accordion": resolve(__dirname, "src/entries/vue-ui-accordion.js"),
  "components/vue-ui-age-pyramid": resolve(__dirname, "src/entries/vue-ui-age-pyramid.js"),
  "components/vue-ui-candlestick": resolve(__dirname, "src/entries/vue-ui-candlestick.js"),
  "components/vue-ui-chestnut": resolve(__dirname, "src/entries/vue-ui-chestnut.js"),
  "components/vue-ui-cursor": resolve(__dirname, "src/entries/vue-ui-cursor.js"),
  "components/vue-ui-dashboard": resolve(__dirname, "src/entries/vue-ui-dashboard.js"),
  "components/vue-ui-digits": resolve(__dirname, "src/entries/vue-ui-digits.js"),
  "components/vue-ui-donut": resolve(__dirname, "src/entries/vue-ui-donut.js"),
  "components/vue-ui-donut-evolution": resolve(__dirname, "src/entries/vue-ui-donut-evolution.js"),
  "components/vue-ui-dumbbell": resolve(__dirname, "src/entries/vue-ui-dumbbell.js"),
  "components/vue-ui-flow": resolve(__dirname, "src/entries/vue-ui-flow.js"),
  "components/vue-ui-galaxy": resolve(__dirname, "src/entries/vue-ui-galaxy.js"),
  "components/vue-ui-gauge": resolve(__dirname, "src/entries/vue-ui-gauge.js"),
  "components/vue-ui-heatmap": resolve(__dirname, "src/entries/vue-ui-heatmap.js"),
  "components/vue-ui-icon": resolve(__dirname, "src/entries/vue-ui-icon.js"),
  "components/vue-ui-kpi": resolve(__dirname, "src/entries/vue-ui-kpi.js"),
  "components/vue-ui-mini-loader": resolve(__dirname, "src/entries/vue-ui-mini-loader.js"),
  "components/vue-ui-molecule": resolve(__dirname, "src/entries/vue-ui-molecule.js"),
  "components/vue-ui-mood-radar": resolve(__dirname, "src/entries/vue-ui-mood-radar.js"),
  "components/vue-ui-nested-donuts": resolve(__dirname, "src/entries/vue-ui-nested-donuts.js"),
  "components/vue-ui-onion": resolve(__dirname, "src/entries/vue-ui-onion.js"),
  "components/vue-ui-parallel-coordinate-plot": resolve(__dirname, "src/entries/vue-ui-parallel-coordinate-plot.js"),
  "components/vue-ui-quadrant": resolve(__dirname, "src/entries/vue-ui-quadrant.js"),
  "components/vue-ui-quick-chart": resolve(__dirname, "src/entries/vue-ui-quick-chart.js"),
  "components/vue-ui-radar": resolve(__dirname, "src/entries/vue-ui-radar.js"),
  "components/vue-ui-rating": resolve(__dirname, "src/entries/vue-ui-rating.js"),
  "components/vue-ui-relation-circle": resolve(__dirname, "src/entries/vue-ui-relation-circle.js"),
  "components/vue-ui-rings": resolve(__dirname, "src/entries/vue-ui-rings.js"),
  "components/vue-ui-scatter": resolve(__dirname, "src/entries/vue-ui-scatter.js"),
  "components/vue-ui-skeleton": resolve(__dirname, "src/entries/vue-ui-skeleton.js"),
  "components/vue-ui-smiley": resolve(__dirname, "src/entries/vue-ui-smiley.js"),
  "components/vue-ui-sparkhistogram": resolve(__dirname, "src/entries/vue-ui-sparkhistogram.js"),
  "components/vue-ui-sparkstackbar": resolve(__dirname, "src/entries/vue-ui-sparkstackbar.js"),
  "components/vue-ui-spark-trend": resolve(__dirname, "src/entries/vue-ui-spark-trend.js"),
  "components/vue-ui-sparkbar": resolve(__dirname, "src/entries/vue-ui-sparkbar.js"),
  "components/vue-ui-sparkgauge": resolve(__dirname, "src/entries/vue-ui-sparkgauge.js"),
  "components/vue-ui-sparkline": resolve(__dirname, "src/entries/vue-ui-sparkline.js"),
  "components/vue-ui-strip-plot": resolve(__dirname, "src/entries/vue-ui-strip-plot.js"),
  "components/vue-ui-table": resolve(__dirname, "src/entries/vue-ui-table.js"),
  "components/vue-ui-table-heatmap": resolve(__dirname, "src/entries/vue-ui-table-heatmap.js"),
  "components/vue-ui-table-sparkline": resolve(__dirname, "src/entries/vue-ui-table-sparkline.js"),
  "components/vue-ui-thermometer": resolve(__dirname, "src/entries/vue-ui-thermometer.js"),
  "components/vue-ui-timer": resolve(__dirname, "src/entries/vue-ui-timer.js"),
  "components/vue-ui-tiremarks": resolve(__dirname, "src/entries/vue-ui-tiremarks.js"),
  "components/vue-ui-treemap": resolve(__dirname, "src/entries/vue-ui-treemap.js"),
  "components/vue-ui-vertical-bar": resolve(__dirname, "src/entries/vue-ui-vertical-bar.js"),
  "components/vue-ui-horizontal-bar": resolve(__dirname, "src/entries/vue-ui-horizontal-bar.js"),
  "components/vue-ui-waffle": resolve(__dirname, "src/entries/vue-ui-waffle.js"),
  "components/vue-ui-wheel": resolve(__dirname, "src/entries/vue-ui-wheel.js"),
  "components/vue-ui-word-cloud": resolve(__dirname, "src/entries/vue-ui-word-cloud.js"),
  "components/vue-ui-xy-canvas": resolve(__dirname, "src/entries/vue-ui-xy-canvas.js"),
  "components/vue-ui-carousel-table": resolve(__dirname, "src/entries/vue-ui-carousel-table.js"),
  "components/vue-ui-gizmo": resolve(__dirname, "src/entries/vue-ui-gizmo.js"),
  "components/vue-ui-stackbar": resolve(__dirname, "src/entries/vue-ui-stackbar.js"),
  "components/vue-ui-stackline": resolve(__dirname, "src/entries/vue-ui-stackline.js"),
  "components/vue-ui-bullet": resolve(__dirname, "src/entries/vue-ui-bullet.js"),
  "components/vue-ui-funnel": resolve(__dirname, "src/entries/vue-ui-funnel.js"),
  "components/vue-ui-history-plot": resolve(__dirname, "src/entries/vue-ui-history-plot.js"),
  "components/vue-ui-pattern": resolve(__dirname, "src/entries/vue-ui-pattern.js"),
  "components/vue-ui-circle-pack": resolve(__dirname, "src/entries/vue-ui-circle-pack.js"),
  "components/vue-ui-world": resolve(__dirname, "src/entries/vue-ui-world.js"),
  "components/vue-ui-ridgeline": resolve(__dirname, "src/entries/vue-ui-ridgeline.js"),
  "components/vue-ui-chord": resolve(__dirname, "src/entries/vue-ui-chord.js"),
  "components/vue-ui-dag": resolve(__dirname, "src/entries/vue-ui-dag.js"),
  "components/vue-ui-geo": resolve(__dirname, "src/entries/vue-ui-geo.js"),
  "components/vue-ui-bump": resolve(__dirname, "src/entries/vue-ui-bump.js"),
  "utils": resolve(__dirname, "src/entries/utils.js")
};

export default defineConfig({
  plugins: [
    vue(),
    removeAttr({
      extensions: ["vue"],
      attributes: prod ? ["data-cy"] : [],
    }),
    {
      name: "copy-llms-file",
      closeBundle() {
        try {
          const src = resolve(__dirname, "llms.txt");
          const outDir = resolve(__dirname, "dist");
          const dest = resolve(outDir, "llms.txt");

          // Ensure dist exists
          fs.mkdirSync(outDir, { recursive: true });

          if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log("[copy-llms-file] llms.txt copied to dist.");
          } else {
            console.warn("[copy-llms-file] llms.txt not found — skipping copy.");
          }
        } catch (err) {
          console.warn(`[copy-llms-file] Skipping due to error: ${err.message}`);
        }
      },
    },
  ],
  build: {
    lib: {
      entry: entries.index,
      name: "VueDataUi",
      fileName: (format, entryName) => {
        if (entryName === "index") {
          return `vue-data-ui.js`;
        }
        if (entryName.startsWith("components/")) {
          const base = entryName.replace(/^components\//, "");
          return `components/${base}.js`;
        }
        return `${entryName}.js`;
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "jspdf"],
      input: entries,
      output: {
        exports: "named",
        globals: { vue: "Vue" },
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

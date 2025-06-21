import { defineConfig } from "vite";
import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import removeAttr from 'remove-attr';
import fs from "fs";

const prod = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    removeAttr({
        extensions: [ 'vue' ],
        attributes: prod ?  [ 'data-cy' ] : [],
    }),
    {
      name: "copy-llms-file",
      closeBundle() {
        const src = resolve(__dirname, "llms.txt");
        const dest = resolve(__dirname, "dist", "llms.txt");
        fs.copyFileSync(src, dest);
        console.log("llms.txt copied to dist folder.");
      },
    },
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
      external: ["vue", "vue-data-ui", "jspdf"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          vue: "Vue",
        },
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

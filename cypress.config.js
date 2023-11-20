import { defineConfig } from "cypress";

import fs from "fs";

export default defineConfig({
  component: {
    devServer: {
      framework: "vue",
      bundler: "vite",
    },
    setupNodeEvents(on, config) {
      on('task', {
        clearDownloads() {
          const downloadsFolder = 'cypress/downloads';
    
          try {
            fs.readdirSync(downloadsFolder).forEach((file) => {
              const filePath = `${downloadsFolder}/${file}`;
              fs.unlinkSync(filePath);
            });
            console.log('Downloads folder cleared.');
            return null;
          } catch (err) {
            console.error(`Error clearing downloads folder: ${err}`);
            return err;
          }
        },
      });
    }
  },
});

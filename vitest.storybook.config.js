import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
    plugins: [vue(), storybookTest({ configDir: '.storybook' })],
    test: {
        name: 'storybook',
        maxWorkers: 4,
        testTimeout: 30000,
        browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
        },
    },
});

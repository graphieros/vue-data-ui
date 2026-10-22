export default {
    stories: ['../stories/**/*.stories.js'],
    framework: {
        name: '@storybook/vue3-vite',
        options: {
            docgen: false,
            builder: { viteConfigPath: '.storybook/vite.config.js' },
        },
    },
    addons: ['@storybook/addon-docs', '@storybook/addon-vitest'],
    core: { disableTelemetry: true },
    async viteFinal(config) {
        // Do not load the production library's multi-entry build or build plugins.
        config.resolve ??= {};
        config.resolve.alias = {
            ...config.resolve.alias,
            vue: 'vue/dist/vue.esm-bundler.js',
        };
        return config;
    },
};

import '../src/vue-data-ui.css';
import { cleanupScenarios } from '../stories/support/scenario.js';

export default {
    parameters: {
        layout: 'padded',
        backgrounds: {
            options: {
                light: { name: 'Light', value: '#ffffff' },
                dark: { name: 'Dark', value: '#1a1a1a' },
            },
        },
        viewport: {
            options: {
                mobile: {
                    name: 'Mobile',
                    styles: { width: '375px', height: '812px' },
                },
                tablet: {
                    name: 'Tablet',
                    styles: { width: '768px', height: '1024px' },
                },
                desktop: {
                    name: 'Desktop',
                    styles: { width: '1280px', height: '900px' },
                },
            },
        },
    },
    initialGlobals: { backgrounds: { value: 'light' } },
    beforeEach() {
        cleanupScenarios();
        return cleanupScenarios;
    },
};

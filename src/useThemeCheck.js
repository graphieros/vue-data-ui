import { computed } from "vue";

/**
 * When adding themes, also update
 * 1. lib.js
 *  - getPalette
 *  - themePalettes
 *  - all individual component theme json files
 * 
 * 2. useThemeOptions composable
 */

export function useThemeCheck() {
    const isThemeValid = computed(() => {
        return (config) => {
            if (!config || !config.theme) return false;
            return [
                'default',
                'dark',
                'celebration',
                'celebrationNight',
                'hack',
                'zen',
                'concrete',
                'minimal',
                'minimalDark'
            ].includes(config.theme)
        }
    });

    function warnInvalidTheme(config) {
        if (!config?.debug) return;
        console.warn(`Vue Data UI - "${config?.theme}" is not a valid theme.\n\nAvailable themes:\n\n- default (or "")\n- dark\n- celebration\n- celebrationNight \n- hack\n- zen\n- concrete`);
    }

    return {
        isThemeValid,
        warnInvalidTheme
    }
}
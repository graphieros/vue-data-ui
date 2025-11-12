import { computed } from "vue";

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
                'concrete'
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
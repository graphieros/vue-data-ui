import { ref } from "vue"

/**
 * When adding themes, also update
 * 1. lib.js
 *  - getPalette
 *  - themePalettes
 *  - all individual component theme json files
 * 
 * 2. useThemeCheck composable
 */

export default () => {

    const themeOptions = ref([
        "",
        "dark",
        "hack",
        "zen",
        "concrete",
        "default",
        "celebration",
        "celebrationNight",
        "minimal",
        "minimalDark"
    ]);

    const currentTheme = ref(themeOptions.value[0]);

    return {
        currentTheme,
        themeOptions
    }
}
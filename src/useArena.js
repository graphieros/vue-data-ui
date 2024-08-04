import { ref} from "vue";

export function useArena() {
    const local = ref(null);
    const build = ref(null);
    const vduiLocal = ref(null);
    const vduiBuild = ref(null);

    function toggleLabels() {
        local.value.toggleLabels();
        build.value.toggleLabels();
        vduiLocal.value.toggleLabels();
        vduiBuild.value.toggleLabels();
    }

    function toggleTable() {
        local.value.toggleTable();
        build.value.toggleTable();
        vduiLocal.value.toggleTable();
        vduiBuild.value.toggleTable();
    }
    
    function toggleSort() {
        local.value.toggleSort();
        build.value.toggleSort();
        vduiLocal.value.toggleSort();
        vduiBuild.value.toggleSort();
    }
    
    function toggleStack() {
        local.value.toggleStack();
        build.value.toggleStack();
        vduiLocal.value.toggleStack();
        vduiBuild.value.toggleStack();
    }

    return {
        toggleLabels,
        toggleTable,
        toggleSort,
        toggleStack,
        local,
        build,
        vduiLocal,
        vduiBuild
    }
}
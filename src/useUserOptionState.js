import { computed, ref } from "vue";

export function useUserOptionState({
    config
}) {
    const showUserOptionsOnChartHover = computed(() => config.userOptions.showOnChartHover);
    const keepUserOptionState = computed(() => config.userOptions.keepStateOnChartLeave);
    const userOptionsVisible = ref(!config.userOptions.showOnChartHover);

    function setUserOptionsVisibility(state = false) {
        if (!showUserOptionsOnChartHover.value) return;
        userOptionsVisible.value = state;
    }

    return {
        userOptionsVisible,
        keepUserOptionState,
        setUserOptionsVisibility
    }
}
import { computed, ref } from 'vue';

/**
 * Maintains visibility of the chart user-options menu in hover mode.
 * @param {object} options - Menu inputs.
 * @param {{userOptions: {showOnChartHover: boolean, keepStateOnChartLeave: boolean}}} options.config - Reactive chart configuration.
 * @returns {{userOptionsVisible: import('vue').Ref<boolean>, keepUserOptionState: import('vue').ComputedRef<boolean>, setUserOptionsVisibility: (state?: boolean) => void}} Menu state; visibility changes are ignored outside hover mode.
 */
export function useUserOptionState({ config }) {
    const showUserOptionsOnChartHover = computed(
        () => config.userOptions.showOnChartHover,
    );
    const keepUserOptionState = computed(
        () => config.userOptions.keepStateOnChartLeave,
    );
    const userOptionsVisible = ref(!config.userOptions.showOnChartHover);

    function setUserOptionsVisibility(state = false) {
        if (!showUserOptionsOnChartHover.value) return;
        userOptionsVisible.value = state;
    }

    return {
        userOptionsVisible,
        keepUserOptionState,
        setUserOptionsVisibility,
    };
}

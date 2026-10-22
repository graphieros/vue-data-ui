import { computed, ref, unref, watch } from 'vue';

/**
 * Switches chart data and configuration between loading skeletons and real inputs.
 * Call during setup. An immediate deep watcher updates FINAL_CONFIG in place
 * and calls callback after each dataset/configuration switch.
 * @param {object} options - Loading inputs and skeleton replacements.
 * @param {import('vue').MaybeRef<object>} options.config - Configuration containing the loading flag.
 * @param {import('vue').MaybeRef<unknown>} options.dataset - Current chart data.
 * @param {unknown} options.skeletonDataset - Data displayed while loading.
 * @param {object} options.skeletonConfig - Configuration displayed while loading.
 * @param {import('vue').Ref<object>} options.FINAL_CONFIG - Configuration ref mutated by the watcher.
 * @param {() => object} options.prepareConfig - Builds the configuration for real data.
 * @param {Function | null} [options.callback=null] - Runs after replacing the active data and config.
 * @param {boolean} [options.dsIsNumber=false] - Treat numeric zero as valid data.
 * @param {boolean} [options.allowEmptyDataset=false] - Do not infer loading from empty data.
 * @returns {object} loading, FINAL_DATASET, manualLoading refs and the skeleton inputs.
 */
export function useLoading({
    config,
    dataset,
    skeletonDataset,
    skeletonConfig,
    FINAL_CONFIG,
    prepareConfig,
    callback = null,
    dsIsNumber = false,
    allowEmptyDataset = false,
}) {
    const manualLoading = ref(false);

    const loading = computed(() => {
        const configLoading = unref(config)?.loading ?? false;
        const ds = unref(dataset);
        const datasetEmpty = allowEmptyDataset
            ? false
            : dsIsNumber
              ? [null, undefined].includes(ds)
              : ds == null ||
                (Array.isArray(ds) && ds.length === 0) ||
                Object.keys(ds).length === 0;

        return manualLoading.value || configLoading || datasetEmpty;
    });

    const FINAL_DATASET = ref(unref(dataset));

    const sources = [loading, () => unref(dataset)];

    watch(
        sources,
        ([isLoading, currentDataset]) => {
            FINAL_DATASET.value = isLoading ? skeletonDataset : currentDataset;

            FINAL_CONFIG.value = isLoading ? skeletonConfig : prepareConfig();

            callback && callback();
        },
        {
            immediate: true,
            deep: true,
        },
    );

    return {
        loading,
        FINAL_DATASET,
        manualLoading,
        skeletonDataset,
        skeletonConfig,
    };
}

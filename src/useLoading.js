import { computed, ref, unref, watch } from 'vue';

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

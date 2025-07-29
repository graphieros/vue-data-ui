import { ref, watchEffect, unref, computed } from 'vue';

export function useLoading({
    config,
    dataset,
    skeletonDataset,
    skeletonConfig,
    FINAL_CONFIG,
    prepareConfig,
    callback = null
}) {
    const manualLoading = ref(false);

    const loading = computed(() => {
        const configLoading = unref(config)?.loading ?? false;
        const ds = unref(dataset);
        const datasetEmpty = ds == null 
            || (Array.isArray(ds) && ds.length === 0) 
            || Object.keys(ds).length === 0;

        return manualLoading.value || configLoading || datasetEmpty;
    });

    const FINAL_DATASET = ref(unref(dataset));

    watchEffect(() => {
        FINAL_DATASET.value = loading.value ? skeletonDataset : unref(dataset);
        FINAL_CONFIG.value = loading.value ? skeletonConfig : prepareConfig();
        callback && callback();
    });

    return { loading, FINAL_DATASET, manualLoading, skeletonDataset, skeletonConfig };
}
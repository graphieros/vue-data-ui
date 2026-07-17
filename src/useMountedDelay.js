import { onMounted, onScopeDispose, ref } from 'vue';

export function useMountedDelay(delay = 300) {
    const isReady = ref(false);
    let timeoutId;

    onMounted(() => {
        timeoutId = setTimeout(() => {
            isReady.value = true;
            timeoutId = undefined;
        }, delay);
    });

    onScopeDispose(() => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
        }
    });

    return {
        isReady,
    };
}

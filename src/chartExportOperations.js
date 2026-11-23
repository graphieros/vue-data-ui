import { computed, ref } from 'vue';

export function createExportActivity() {
    const pending = ref(0);
    const busy = computed(() => pending.value > 0);

    function start() {
        pending.value += 1;
    }

    function finish() {
        pending.value = Math.max(0, pending.value - 1);
    }

    async function run(operation) {
        start();
        try {
            return await operation();
        } finally {
            finish();
        }
    }

    return { busy, start, finish, run };
}

const rasterCaptures = new WeakMap();

// PNG capture temporarily changes chart styles. Keep the next capture of
// that element waiting until those styles have been restored.
export function queueRasterCapture(element, capture) {
    const previous = rasterCaptures.get(element);
    const result = previous ? previous.then(capture, capture) : capture();
    const queued = result.finally(() => {
        if (rasterCaptures.get(element) === queued) {
            rasterCaptures.delete(element);
        }
    });
    rasterCaptures.set(element, queued);
    return queued;
}

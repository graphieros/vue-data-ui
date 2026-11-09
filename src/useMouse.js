import { ref, onMounted, onBeforeUnmount, watch, toValue } from 'vue';

// Keep the latest pointer even when every consumer is hidden, without updating
// their reactive state. The last consumer releases the shared browser listener.
const subscribers = new Set();
let mountedConsumers = 0;
let latestX = 0;
let latestY = 0;
let pointerVersion = 0;

function onMousemove(event) {
    latestX = event.clientX;
    latestY = event.clientY;
    pointerVersion += 1;
    subscribers.forEach((update) => update());
}

/**
 * Tracks viewport mouse coordinates using one listener for mounted consumers.
 * Inactive consumers synchronize when enabled. Explicit placement stays local.
 * @param {import('vue').MaybeRefOrGetter<boolean>} [enabled=true]
 * @returns {{x: import('vue').Ref<number>, y: import('vue').Ref<number>, setPosition: (position: {x: number, y: number}) => void}}
 */
export function useMouse(enabled = true) {
    const x = ref(0);
    const y = ref(0);
    let mounted = false;
    let seenVersion = -1;

    function update() {
        if (!mounted || !toValue(enabled) || seenVersion === pointerVersion)
            return;
        seenVersion = pointerVersion;
        x.value = latestX;
        y.value = latestY;
    }

    function setPosition(position) {
        seenVersion = pointerVersion;
        x.value = position.x;
        y.value = position.y;
    }

    function updateSubscription() {
        if (!mounted) return;
        if (toValue(enabled)) {
            subscribers.add(update);
            update();
        } else {
            subscribers.delete(update);
        }
    }
    watch(() => toValue(enabled), updateSubscription, { flush: 'sync' });
    onMounted(() => {
        mounted = true;
        if (mountedConsumers === 0)
            window.addEventListener('mousemove', onMousemove, {
                passive: true,
            });
        mountedConsumers += 1;
        updateSubscription();
    });
    onBeforeUnmount(() => {
        mounted = false;
        subscribers.delete(update);
        mountedConsumers -= 1;
        if (mountedConsumers === 0)
            window.removeEventListener('mousemove', onMousemove);
    });

    return { x, y, setPosition };
}

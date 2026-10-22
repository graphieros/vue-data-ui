import { ref } from 'vue';
import { useEventListener } from './event';

/**
 * Tracks viewport mouse coordinates while the component is mounted.
 * Call during setup in a browser environment.
 * @returns {{x: import('vue').Ref<number>, y: import('vue').Ref<number>}} Client coordinates in CSS pixels.
 */
export function useMouse() {
    const x = ref(0);
    const y = ref(0);

    useEventListener(window, 'mousemove', (event) => {
        ((x.value = event.clientX), (y.value = event.clientY));
    });

    return { x, y };
}

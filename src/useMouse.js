import { ref } from "vue";
import { useEventListener } from "./event";

export function useMouse() {
    const x = ref(0);
    const y = ref(0);

    useEventListener(window, 'mousemove', (event) => {
        x.value = event.clientX,
        y.value = event.clientY
    });

    return { x, y }
}
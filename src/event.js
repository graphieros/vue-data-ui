import { onMounted, onUnmounted } from 'vue';

/**
 * Registers a DOM listener on mounting and removes it on unmounting.
 * Call during component setup with a stable event target.
 * @param {EventTarget} target - Object that receives the event.
 * @param {string} event - DOM event name.
 * @param {EventListener} callback - Listener shared by registration and removal.
 * @returns {void}
 */
export function useEventListener(target, event, callback) {
    onMounted(() => target.addEventListener(event, callback));
    onUnmounted(() => target.removeEventListener(event, callback));
}

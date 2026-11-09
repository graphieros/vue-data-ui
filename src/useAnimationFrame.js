import { onBeforeUnmount } from 'vue';

/** Owns one pending frame; cancellation also invalidates already queued callbacks. */
export function useAnimationFrame() {
    let frame = null;
    let version = 0;
    let disposed = false;

    function cancel() {
        version += 1;
        if (frame !== null) cancelAnimationFrame(frame);
        frame = null;
    }

    function request(callback) {
        cancel();
        if (disposed) return;
        const current = version;
        frame = requestAnimationFrame((time) => {
            if (disposed || current !== version) return;
            frame = null;
            callback(time);
        });
    }

    onBeforeUnmount(() => {
        disposed = true;
        cancel();
    });

    return { request, cancel, isDisposed: () => disposed };
}

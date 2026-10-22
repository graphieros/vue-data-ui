import { nextTick } from 'vue';

// Use the scenario's spy registry so native scheduling is restored on cleanup.
// Only stories opting in use this clock; catalog animations remain native.
export function controlAnimationFrames(spy) {
    const callbacks = new Map();
    let nextId = 0;
    let time = performance.now();
    const request = spy(window, 'requestAnimationFrame').mockImplementation(
        (callback) => {
            const id = ++nextId;
            callbacks.set(id, callback);
            return id;
        },
    );
    spy(window, 'cancelAnimationFrame').mockImplementation((id) => {
        callbacks.delete(id);
    });

    return {
        request,
        async flush(maxFrames = 240) {
            for (let frame = 0; frame < maxFrames; frame += 1) {
                await nextTick();
                if (!callbacks.size) return;
                time += 1000 / 60;
                // New callbacks run on the next frame. A preceding callback can
                // still cancel another callback scheduled for this frame.
                for (const id of [...callbacks.keys()]) {
                    const callback = callbacks.get(id);
                    callbacks.delete(id);
                    callback?.(time);
                }
            }
            await nextTick();
            if (callbacks.size) {
                throw new Error(
                    `Story animation did not settle after ${maxFrames} frames`,
                );
            }
        },
    };
}

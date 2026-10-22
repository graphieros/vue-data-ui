import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { controlAnimationFrames } from '../stories/support/animationFrames.js';

afterEach(() => vi.restoreAllMocks());

describe('Storybook animation frame control', () => {
    it('finishes chained animation callbacks and Vue updates without real frames', async () => {
        const animation = controlAnimationFrames(vi.spyOn);
        const timestamps = [];
        function animate(time) {
            timestamps.push(time);
            if (timestamps.length < 4) {
                nextTick(() => requestAnimationFrame(animate));
            }
        }
        requestAnimationFrame(animate);
        await animation.flush();
        expect(timestamps).toHaveLength(4);
        expect(animation.request).toHaveBeenCalledTimes(4);
        expect(timestamps[3] - timestamps[0]).toBeCloseTo(50);
    });

    it('honors cancellation by an earlier callback in the same frame', async () => {
        const animation = controlAnimationFrames(vi.spyOn);
        const cancelled = vi.fn();
        let id;
        requestAnimationFrame(() => cancelAnimationFrame(id));
        id = requestAnimationFrame(cancelled);
        await animation.flush();
        expect(cancelled).not.toHaveBeenCalled();
    });

    it('fails rather than hiding an animation that never settles', async () => {
        const animation = controlAnimationFrames(vi.spyOn);
        const loop = () => requestAnimationFrame(loop);
        requestAnimationFrame(loop);
        await expect(animation.flush(3)).rejects.toThrow(
            'Story animation did not settle after 3 frames',
        );
    });
});

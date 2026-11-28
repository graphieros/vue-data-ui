import { afterEach, describe, expect, test, vi } from 'vitest';
import { emitCopyAlt } from '../src/lib';

describe('emitCopyAlt', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('emits before reading the callback, then awaits the callback with a fresh payload', async () => {
        const order = [];
        let resolved = false;
        const emit = vi.fn(() => order.push('emit'));
        const callback = vi.fn(
            () =>
                new Promise((resolve) =>
                    setTimeout(() => {
                        resolved = true;
                        resolve();
                    }, 0),
                ),
        );
        const getCallback = vi.fn(() => {
            order.push('read');
            return callback;
        });
        const getPayload = vi.fn(() => ({ config: { a: 1 }, dataset: [1] }));

        await emitCopyAlt(emit, getCallback, getPayload);

        expect(order).toEqual(['emit', 'read']);
        expect(emit).toHaveBeenCalledWith('copyAlt', {
            config: { a: 1 },
            dataset: [1],
        });
        expect(getPayload).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith({
            config: { a: 1 },
            dataset: [1],
        });
        expect(callback.mock.calls[0][0]).not.toBe(emit.mock.calls[0][1]);
        expect(resolved).toBe(true);
    });

    test('warns and does not build a second payload when no callback is set', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const emit = vi.fn();
        const getPayload = vi.fn(() => ({}));

        await emitCopyAlt(emit, () => null, getPayload);

        expect(emit).toHaveBeenCalledTimes(1);
        expect(getPayload).toHaveBeenCalledTimes(1);
        expect(warn).toHaveBeenCalledWith(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
    });

    test('propagates callback errors', async () => {
        const error = new Error('boom');
        await expect(
            emitCopyAlt(
                () => {},
                () => () => {
                    throw error;
                },
                () => ({}),
            ),
        ).rejects.toBe(error);
    });
});

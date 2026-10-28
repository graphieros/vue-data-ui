import { afterEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { useParentSize } from '../src/useParentSize';

const scopes = [];
function setup(element, options) {
    const scope = effectScope();
    scopes.push(scope);
    return scope.run(() => useParentSize(element, options));
}
afterEach(() => {
    scopes.splice(0).forEach((scope) => scope.stop());
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
});

function observeParent(rect) {
    let notify;
    const disconnect = vi.fn();
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback) {
                notify = callback;
            }
            observe() {}
            disconnect = disconnect;
        },
    );
    const element = { parentElement: { getBoundingClientRect: () => rect } };
    return { element, notify: () => notify(), disconnect };
}

describe('useParentSize limits', () => {
    it('caps final dimensions at the viewport and responds to viewport resizing', () => {
        const element = {
            parentElement: {
                getBoundingClientRect: () => ({ width: 10000, height: 10000 }),
            },
        };
        const size = setup(element, { observe: false });
        expect(size.width.value).toBe(window.innerWidth);
        expect(size.height.value).toBe(window.innerHeight);
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(500);
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(350);
        window.dispatchEvent(new Event('resize'));
        expect(size.width.value).toBe(500);
        expect(size.height.value).toBe(350);
    });

    it('applies reactive maximums after offsets and scaling', () => {
        const maxWidth = ref(300);
        const element = {
            parentElement: {
                getBoundingClientRect: () => ({ width: 800, height: 400 }),
            },
        };
        const size = setup(element, {
            observe: false,
            scale: 0.5,
            offsetWidth: -20,
            offsetHeight: 30,
            maxWidth,
            maxHeight: () => 200,
        });
        expect(size.width.value).toBe(300);
        expect(size.height.value).toBe(200);
        maxWidth.value = 500;
        expect(size.width.value).toBe(390);
        maxWidth.value = 0;
        expect(size.width.value).toBe(0);
        maxWidth.value = Infinity;
        expect(size.width.value).toBe(Math.min(390, window.innerWidth));
    });

    it('bounds a measurement feedback loop and releases observer and viewport listener', async () => {
        const rect = { width: 100, height: 100 };
        const { element, notify, disconnect } = observeParent(rect);
        const removeListener = vi.spyOn(window, 'removeEventListener');
        const size = setup(element, { maxWidth: 300, maxHeight: 250 });
        // Simulate parent growth caused by each new chart size.
        for (let frame = 0; frame < 30; frame++) {
            rect.width = size.width.value + 20;
            rect.height = size.height.value + 20;
            notify();
            await nextTick();
        }
        expect(size.width.value).toBe(300);
        expect(size.height.value).toBe(250);
        scopes[0].stop();
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(removeListener).toHaveBeenCalledWith(
            'resize',
            expect.any(Function),
        );
    });

    it('preserves undefined dimensions for a missing parent', () => {
        const size = setup(null, { maxWidth: 300, maxHeight: 200 });
        expect(size.width.value).toBeUndefined();
        expect(size.height.value).toBeUndefined();
    });
});

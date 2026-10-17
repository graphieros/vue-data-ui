import { beforeEach, describe, expect, test, vi } from 'vitest';
import { shallowRef } from 'vue';
import { createChartImageGetter } from '../src/chartImage';
import img from '../src/img';

vi.mock('../src/img', () => ({ default: vi.fn() }));

beforeEach(() => {
    vi.mocked(img).mockReset();
    vi.mocked(img).mockResolvedValue({
        imageUri: 'image-uri',
        base64: 'image-data',
    });
});

function setup(width = 400, height = 200) {
    const element = { getBoundingClientRect: vi.fn(() => ({ width, height })) };
    const chart = shallowRef(element);
    const getTitle = vi.fn(() => 'Chart title');
    return {
        element,
        chart,
        getTitle,
        getImage: createChartImageGetter(chart, getTitle),
    };
}

describe('chart image getter', () => {
    test('preserves image metadata and the default capture options', async () => {
        const { element, getImage } = setup();
        expect(await getImage()).toEqual({
            imageUri: 'image-uri',
            base64: 'image-data',
            title: 'Chart title',
            width: 400,
            height: 200,
            aspectRatio: 2,
        });
        expect(img).toHaveBeenCalledExactlyOnceWith({
            domElement: element,
            base64: true,
            img: true,
            scale: 2,
        });
    });

    test.each([0, 1, 3, null])(
        'passes scale %s through unchanged',
        async (scale) => {
            await setup().getImage({ scale });
            expect(img).toHaveBeenCalledWith(
                expect.objectContaining({ scale }),
            );
        },
    );

    test('uses the default scale when explicitly undefined', async () => {
        await setup().getImage({ scale: undefined });
        expect(img).toHaveBeenCalledWith(expect.objectContaining({ scale: 2 }));
    });

    test('returns a promise resolving to undefined without an element', async () => {
        const { chart, getTitle, getImage } = setup();
        chart.value = null;
        const result = getImage();
        expect(result).toBeInstanceOf(Promise);
        expect(await result).toBeUndefined();
        expect(img).not.toHaveBeenCalled();
        expect(getTitle).not.toHaveBeenCalled();
    });

    test('reads the current element at invocation time', async () => {
        const { chart, element, getImage } = setup();
        const replacement = {
            getBoundingClientRect: () => ({ width: 100, height: 50 }),
        };
        chart.value = replacement;
        expect(await getImage()).toMatchObject({
            width: 100,
            height: 50,
            aspectRatio: 2,
        });
        expect(img).toHaveBeenCalledWith(
            expect.objectContaining({ domElement: replacement }),
        );
        expect(element.getBoundingClientRect).not.toHaveBeenCalled();
    });

    test('measures before capture and reads the title after capture completes', async () => {
        const { element, chart } = setup();
        let title = 'Initial title';
        const getTitle = vi.fn(() => title);
        let finish;
        vi.mocked(img).mockImplementation(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                }),
        );
        const result = createChartImageGetter(chart, getTitle)();
        expect(element.getBoundingClientRect).toHaveBeenCalledTimes(1);
        expect(getTitle).not.toHaveBeenCalled();
        title = 'Updated title';
        element.getBoundingClientRect.mockReturnValue({
            width: 800,
            height: 400,
        });
        finish({ imageUri: 'captured', base64: 'data' });
        expect(await result).toMatchObject({
            title: 'Updated title',
            width: 400,
            height: 200,
        });
    });

    test('propagates capture failures without reading the title', async () => {
        const error = new Error('Capture failed');
        vi.mocked(img).mockRejectedValue(error);
        const { getImage, getTitle } = setup();
        await expect(getImage()).rejects.toBe(error);
        expect(getTitle).not.toHaveBeenCalled();
    });

    test('preserves asynchronous rejection for an invalid options argument', async () => {
        const { getImage } = setup();
        let result;
        expect(() => {
            result = getImage(null);
        }).not.toThrow();
        await expect(result).rejects.toBeInstanceOf(TypeError);
        expect(img).not.toHaveBeenCalled();
    });

    test('preserves zero-height aspect ratios', async () => {
        expect((await setup(400, 0).getImage()).aspectRatio).toBe(Infinity);
        expect((await setup(0, 0).getImage()).aspectRatio).toBeNaN();
    });
});

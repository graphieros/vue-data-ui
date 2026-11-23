import { flushPromises } from '@vue/test-utils';
import { afterEach, expect, test, vi } from 'vitest';
import { queueRasterCapture } from '../src/chartExportOperations';
import img from '../src/img';
import pdf from '../src/pdf';
import { useChartExport } from '../src/useChartExport';
import { usePrinter } from '../src/usePrinter';

vi.mock('../src/img', () => ({ default: vi.fn() }));
vi.mock('../src/pdf', () => ({ default: vi.fn() }));
vi.mock('../src/useSvgExport', () => ({
    useSvgExport: () => ({
        getSvg: async () => ({
            blob: 'blob',
            url: 'url',
            text: 'svg',
            dataUrl: 'data',
        }),
    }),
}));

afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
    vi.restoreAllMocks();
});

test('PDF and PNG requests both settle and a failed export can be retried', async () => {
    vi.useFakeTimers();
    const error = new Error('PDF failed');
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(pdf).mockRejectedValueOnce(error);
    const printer = usePrinter({
        elementId: 'chart',
        fileName: 'Chart',
        options: {},
    });

    await Promise.all([
        printer.generatePdf(),
        printer.generateImage(),
        printer.generateImage(),
    ]);
    expect(printer.isPrinting.value).toBe(true);
    expect(printer.isImaging.value).toBe(true);
    expect(img).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(100);
    await vi.dynamicImportSettled();

    expect(pdf).toHaveBeenCalledOnce();
    expect(img).toHaveBeenCalledOnce();
    expect(logError).toHaveBeenCalledWith('Error generating PDF:', error);
    expect(printer.isPrinting.value).toBe(false);
    expect(printer.isImaging.value).toBe(false);

    await printer.generatePdf();
    await vi.advanceTimersByTimeAsync(100);
    expect(pdf).toHaveBeenCalledTimes(2);
    expect(printer.isPrinting.value).toBe(false);
});

test('overlapping SVG and PNG callbacks remain busy until the last one settles', async () => {
    const first = Promise.withResolvers();
    const second = Promise.withResolvers();
    const callback = vi
        .fn()
        .mockReturnValueOnce(first.promise)
        .mockReturnValueOnce(second.promise);
    const generateImage = vi.fn();
    const chart = useChartExport({
        getSvgCallback: () => callback,
        generateImage,
    });

    chart.onGenerateImage();
    expect(generateImage).toHaveBeenCalledOnce();
    chart.onGenerateImage({ stage: 'start' });
    chart.onGenerateImage({ stage: 'start' });
    chart.onGenerateImage({ stage: 'end' });
    expect(chart.isCallbackImaging.value).toBe(true);

    const firstSvg = chart.generateSvg({ isCb: true });
    const secondSvg = chart.generateSvg({ isCb: true });
    await flushPromises();
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith({
        blob: 'blob',
        url: 'url',
        text: 'svg',
        dataUrl: 'data',
    });

    first.resolve();
    await firstSvg;
    expect(chart.isCallbackSvg.value).toBe(true);
    chart.onGenerateImage({ stage: 'end' });
    expect(chart.isCallbackImaging.value).toBe(false);

    const failure = expect(secondSvg).rejects.toThrow('Callback failed');
    second.reject(new Error('Callback failed'));
    await failure;
    expect(chart.isCallbackSvg.value).toBe(false);
});

test('raster capture waits for the same chart and continues after failure', async () => {
    const chart = document.createElement('div');
    const first = Promise.withResolvers();
    const inProgress = queueRasterCapture(chart, () => first.promise);
    const nextCapture = vi.fn().mockResolvedValue('image data');
    const queued = queueRasterCapture(chart, nextCapture);

    const otherChart = document.createElement('div');
    await expect(
        queueRasterCapture(otherChart, async () => 'other chart'),
    ).resolves.toBe('other chart');
    expect(nextCapture).not.toHaveBeenCalled();

    const failure = expect(inProgress).rejects.toThrow('Capture failed');
    first.reject(new Error('Capture failed'));
    await failure;
    await expect(queued).resolves.toBe('image data');
    expect(nextCapture).toHaveBeenCalledOnce();
});

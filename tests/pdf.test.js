import { afterEach, expect, test, vi } from 'vitest';
import pdf from '../src/pdf';

const { createPdf, addImage, addPage, save } = vi.hoisted(() => ({
    createPdf: vi.fn(),
    addImage: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
}));

vi.mock('jspdf', () => ({
    default: function (options) {
        createPdf(options);
        return { addImage, addPage, save };
    },
}));
vi.mock('../src/dom-to-png', () => ({
    domToPng: async () => 'data:image/png;base64,chart',
}));

afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

function stubImage(width, height) {
    vi.stubGlobal(
        'Image',
        class {
            naturalWidth = width;
            naturalHeight = height;

            set src(_) {
                this.onload();
            }
        },
    );
}

test.each([
    { width: 200, height: 4000, expected: 'p', page: [595.28, 841.89] },
    { width: 4000, height: 200, expected: 'l', page: [841.89, 595.28] },
    { width: 700, height: 700, expected: 'p', page: [595.28, 841.89] },
    {
        width: 4000,
        height: 200,
        orientation: 'p',
        expected: 'p',
        page: [595.28, 841.89],
    },
    {
        width: 200,
        height: 4000,
        orientation: 'landscape',
        expected: 'l',
        page: [841.89, 595.28],
    },
    {
        width: 1000,
        height: 300,
        aspectRatio: '3/1',
        expected: 'l',
        page: [1000, 1000 / 3],
        margin: 50 / 3,
    },
    {
        width: 10,
        height: 2000,
        aspectRatio: '1/14141',
        expected: 'p',
        page: [14400 / 14141, 14400],
        margin: 720 / 14141,
    },
])(
    'fits a $width × $height chart on one page in $expected orientation',
    async ({
        width,
        height,
        orientation,
        aspectRatio,
        expected,
        page: [pageWidth, pageHeight],
        margin = 18,
    }) => {
        stubImage(width, height);
        await pdf({
            domElement: document.createElement('div'),
            fileName: 'Chart',
            orientation,
            aspectRatio,
            overflowTolerance: 0,
        });

        const [{ format, orientation: actualOrientation }] =
            createPdf.mock.calls[0];
        expect(actualOrientation).toBe(expected);
        if (aspectRatio) {
            expect(format[0]).toBeCloseTo(pageWidth);
            expect(format[1]).toBeCloseTo(pageHeight);
        } else {
            expect(format).toBe('a4');
        }
        expect(addImage).toHaveBeenCalledOnce();
        expect(addPage).not.toHaveBeenCalled();
        expect(save).toHaveBeenCalledExactlyOnceWith('Chart.pdf');

        const [, , x, y, imageWidth, imageHeight] = addImage.mock.calls[0];
        const fit = Math.min(
            (pageWidth - 2 * margin) / width,
            (pageHeight - 2 * margin) / height,
        );
        expect(imageWidth).toBeCloseTo(width * fit);
        expect(imageHeight).toBeCloseTo(height * fit);
        expect(x).toBeCloseTo((pageWidth - imageWidth) / 2);
        expect(y).toBeCloseTo((pageHeight - imageHeight) / 2);
        expect(Math.min(x, y)).toBeCloseTo(margin);
    },
);

test('rejects an empty capture instead of rendering invalid PDF dimensions', async () => {
    stubImage(0, 0);
    await expect(
        pdf({ domElement: document.createElement('div'), fileName: 'Chart' }),
    ).rejects.toThrow('PDF export image has no dimensions.');
    expect(save).not.toHaveBeenCalled();
});

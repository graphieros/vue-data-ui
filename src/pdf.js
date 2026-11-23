import { domToPng } from './dom-to-png';
import { queueRasterCapture } from './chartExportOperations';

const A4 = [595.28, 841.89];
const CUSTOM_PAGE_WIDTH = 1000;
const MAX_PDF_SIDE = 14400;
const PAGE_MARGIN = 18;

function getCustomPageSize(aspectRatio) {
    const parts =
        typeof aspectRatio === 'string'
            ? aspectRatio.split('/').map(Number)
            : [aspectRatio];
    const [width, height] = parts.length === 1 ? [1, parts[0]] : parts;
    if (parts.length > 2 || !(width > 0 && height > 0)) return null;

    const ratio = height / width;
    if (!Number.isFinite(ratio) || ratio <= 0) return null;

    // jsPDF caps page sides at 14,400 points. Scale both sides together.
    const pageWidth = Math.min(CUSTOM_PAGE_WIDTH, MAX_PDF_SIDE / ratio);
    const pageHeight = Math.min(pageWidth * ratio, MAX_PDF_SIDE);
    return [Math.min(pageWidth, pageHeight), Math.max(pageWidth, pageHeight)];
}

export default async function pdf({
    domElement,
    fileName,
    scale = 2,
    orientation = 'auto',
    aspectRatio = null,
}) {
    if (!domElement) return Promise.reject('No domElement provided');

    const isSafari =
        typeof navigator !== 'undefined' &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    let JsPDF;
    try {
        JsPDF = (await import('jspdf')).default;
    } catch (_) {
        return Promise.reject('jspdf is not installed. Run pnpm add jspdf');
    }

    const imgData = await queueRasterCapture(domElement, async () => {
        if (isSafari) {
            // Warming up in Safari, because it never works on the first try
            try {
                await domToPng({ container: domElement, scale });
                await domToPng({ container: domElement, scale });
                await domToPng({ container: domElement, scale });
                await domToPng({ container: domElement, scale });
            } catch (_) {
                // ignore any errors during warm‑up
            }
        }

        return domToPng({ container: domElement, scale });
    });

    const image = await new Promise((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve(image);
        image.onerror = (error) =>
            reject('Failed to load image for PDF: ' + error);
        image.src = imgData;
    });

    const { naturalWidth: width, naturalHeight: height } = image;
    if (!(width > 0 && height > 0)) {
        throw new Error('PDF export image has no dimensions.');
    }

    const customPage = getCustomPageSize(aspectRatio);
    const [shortSide, longSide] = customPage ?? A4;
    // Reduce the margin on narrow custom pages so it leaves room for the chart.
    const margin = Math.min(PAGE_MARGIN, shortSide * 0.05);
    const shortContent = shortSide - 2 * margin;
    const longContent = longSide - 2 * margin;
    const portrait = Math.min(shortContent / width, longContent / height);
    const landscape = Math.min(longContent / width, shortContent / height);
    const useLandscape =
        orientation === 'l' ||
        orientation === 'landscape' ||
        (orientation === 'auto' && landscape > portrait);

    const [pageWidth, pageHeight] = useLandscape
        ? [longSide, shortSide]
        : [shortSide, longSide];
    const fit = useLandscape ? landscape : portrait;
    const imageWidth = width * fit;
    const imageHeight = height * fit;

    const pdf = new JsPDF({
        orientation: useLandscape ? 'l' : 'p',
        unit: 'pt',
        format: customPage ? [pageWidth, pageHeight] : 'a4',
    });
    pdf.addImage(
        imgData,
        'PNG',
        (pageWidth - imageWidth) / 2,
        (pageHeight - imageHeight) / 2,
        imageWidth,
        imageHeight,
        '',
        'FAST',
    );
    pdf.save(`${fileName}.pdf`);
}

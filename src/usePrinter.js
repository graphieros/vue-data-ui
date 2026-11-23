import { createExportActivity } from './chartExportOperations';

/**
 * Creates PDF and PNG download handlers with separate reactive busy flags.
 * Exports are scheduled after a short render delay. Their returned promises do
 * not wait for the delayed capture; use the busy refs to observe completion.
 * @param {object} settings - Export target and rendering options.
 * @param {string} settings.elementId - DOM id of the mounted chart container.
 * @param {string} settings.fileName - Download name.
 * @param {boolean} [settings.canPrint=true] - Enables exports.
 * @param {object} settings.options - PDF orientation, scale, and aspectRatio.
 * @returns {object} generatePdf/generateImage handlers and isPrinting/isImaging refs.
 */
export function usePrinter({ elementId, fileName, canPrint = true, options }) {
    const pdfExport = createExportActivity();
    const imageExport = createExportActivity();

    async function scheduleExport(activity, errorMessage, download) {
        if (!canPrint || activity.busy.value) return;

        void activity.run(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            try {
                await download();
            } catch (error) {
                console.error(errorMessage, error);
            }
        });
    }

    function generatePdf() {
        return scheduleExport(pdfExport, 'Error generating PDF:', async () => {
            const { default: pdf } = await import('./pdf');
            await pdf({
                domElement: document.getElementById(elementId),
                fileName,
                orientation: options.orientation,
                scale: options.scale,
                aspectRatio: options.aspectRatio ?? null,
            });
        });
    }

    function generateImage() {
        return scheduleExport(
            imageExport,
            'Error generating image:',
            async () => {
                const { default: img } = await import('./img');
                await img({
                    domElement: document.getElementById(elementId),
                    fileName,
                    format: 'png',
                    scale: options?.scale,
                });
            },
        );
    }

    return {
        generatePdf,
        generateImage,
        isPrinting: pdfExport.busy,
        isImaging: imageExport.busy,
    };
}

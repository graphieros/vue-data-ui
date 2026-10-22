import { ref } from 'vue';

/**
 * Creates PDF and PNG download handlers with separate reactive busy flags.
 * Exports are scheduled after a short render delay. Their returned promises do
 * not wait for the delayed capture; use the busy refs to observe completion.
 * @param {object} settings - Export target and rendering options.
 * @param {string} settings.elementId - DOM id of the mounted chart container.
 * @param {string} settings.fileName - Download name.
 * @param {boolean} [settings.canPrint=true] - Enables exports.
 * @param {object} settings.options - PDF orientation, overflowTolerance, scale, and aspectRatio.
 * @returns {object} generatePdf/generateImage handlers and isPrinting/isImaging refs.
 */
export function usePrinter({ elementId, fileName, canPrint = true, options }) {
    const isPrinting = ref(false);
    const isImaging = ref(false);
    const __to__ = ref(null);

    async function generatePdf() {
        if (!canPrint || isPrinting.value) return;
        isPrinting.value = true;
        clearTimeout(__to__.value);
        __to__.value = setTimeout(async () => {
            if (canPrint) {
                try {
                    const { default: pdf } = await import('./pdf');
                    await pdf({
                        domElement: document.getElementById(elementId),
                        fileName,
                        orientation: options.orientation,
                        overflowTolerance: options.overflowTolerance,
                        scale: options.scale,
                        aspectRatio: options.aspectRatio ?? null,
                    });
                } catch (error) {
                    console.error('Error generating PDF:', error);
                } finally {
                    isPrinting.value = false;
                }
            }
        }, 100);
    }

    async function generateImage() {
        if (!canPrint || isImaging.value) return;
        isImaging.value = true;
        clearTimeout(__to__.value);
        __to__.value = setTimeout(async () => {
            if (canPrint) {
                try {
                    const { default: img } = await import('./img');
                    await img({
                        domElement: document.getElementById(elementId),
                        fileName,
                        format: 'png',
                        scale: options?.scale,
                    });
                } catch (error) {
                    console.error('Error generating image:', error);
                } finally {
                    isImaging.value = false;
                }
            }
        }, 100);
    }

    return {
        generatePdf,
        generateImage,
        isPrinting,
        isImaging,
    };
}

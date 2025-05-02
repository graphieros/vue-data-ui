import { ref } from "vue";

export function usePrinter({
    elementId,
    fileName,
    canPrint = true,
    options
}) {
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
                    const { default: pdf } = await import("./pdf");
                    await pdf({
                        domElement: document.getElementById(elementId),
                        fileName,
                        options
                    });
                } catch (error) {
                    console.error("Error generating PDF:", error);
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
                    const { default: img } = await import("./img");
                    await img({
                        domElement: document.getElementById(elementId),
                        fileName,
                        format: "png",
                        options
                    });
                } catch (error) {
                    console.error("Error generating image:", error);
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

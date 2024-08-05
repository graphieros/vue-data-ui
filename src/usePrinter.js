import { ref } from "vue";
import pdf from "./pdf";
import img from "./img";

export function usePrinter({
    elementId,
    fileName
}) {
    const isPrinting = ref(false);
    const isImaging = ref(false);
    const __to__ = ref(null);

    function generatePdf(){
        isPrinting.value = true;
        clearTimeout(__to__.value);
        __to__.value = setTimeout(() => {
            pdf({
                domElement: document.getElementById(elementId),
                fileName,
            }).finally(() => {
                isPrinting.value = false;
            });
        }, 100)
    }

    function generateImage() {
        isImaging.value = true;
        clearTimeout(__to__.value);
        __to__.value = setTimeout(() => {
            img({
                domElement: document.getElementById(elementId),
                fileName,
                format: 'png'
            }).finally(() => {
                isImaging.value = false;
            }, 100)
        })
    }

    return {
        generatePdf,
        generateImage,
        isPrinting,
        isImaging
    }
}
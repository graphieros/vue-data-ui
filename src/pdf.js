import { domToPng } from "./dom-to-png";

export default async function pdf({ domElement, fileName, scale = 2, options = {} }) {
    if (!domElement) return Promise.reject("No domElement provided");

    const isSafari = typeof navigator !== 'undefined' &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    let JsPDF;

    try {
        JsPDF = (await import('jspdf')).default;
    } catch (e) {
        return Promise.reject('jspdf is not installed. Run npm install jspdf')
    }

    const a4 = {
        width: 595.28,
        height: 841.89,
    };

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

    const imgData = await domToPng({ container: domElement, scale });
    return await new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = function () {
            const contentWidth = img.naturalWidth;
            const contentHeight = img.naturalHeight;

            let imgWidth = a4.width;
            let imgHeight = (a4.width / contentWidth) * contentHeight;

            const pdf = new JsPDF("", "pt", "a4");
            let position = 0;
            let leftHeight = contentHeight;
            const pageHeight = (contentWidth / a4.width) * a4.height;

            if (leftHeight < pageHeight) {
                pdf.addImage(
                    imgData,
                    "PNG",
                    0,
                    0,
                    imgWidth,
                    imgHeight,
                    "",
                    "FAST"
                );
            } else {
                while (leftHeight > 0) {
                    pdf.addImage(
                        imgData,
                        "PNG",
                        0,
                        position,
                        imgWidth,
                        imgHeight,
                        "",
                        "FAST"
                    );
                    leftHeight -= pageHeight;
                    position -= a4.height;
                    if (leftHeight > 0) {
                        pdf.addPage();
                    }
                }
            }
            pdf.save(`${fileName}.pdf`);
            resolve();
        };
        img.onerror = err => reject("Failed to load image for PDF: " + err);
        img.src = imgData;
    });
}

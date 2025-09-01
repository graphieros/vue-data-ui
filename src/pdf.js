import { domToPng } from "./dom-to-png";

export default async function pdf({
    domElement,
    fileName,
    scale = 2,
    orientation = "auto", // 'auto' | 'portrait' | 'landscape'
    overflowTolerance = 0.2, // up to +n% height overflow gets squeezed onto 1 page
}) {
    if (!domElement) return Promise.reject("No domElement provided");

    const isSafari =
        typeof navigator !== "undefined" &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    let JsPDF;
    try {
        JsPDF = (await import("jspdf")).default;
    } catch (_) {
        return Promise.reject("jspdf is not installed. Run npm install jspdf");
    }

    const A4_PORTRAIT = { width: 595.28, height: 841.89 };
    const A4_LANDSCAPE = { width: 841.89, height: 595.28 };

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
            const EPS = 0.5; // small epsilon to avoid off-by-one paging due to rounding

            const contentWidth = img.naturalWidth;
            const contentHeight = img.naturalHeight;

            const chosenOrientation =
                orientation === "auto"
                    ? contentHeight >= contentWidth
                        ? "p"
                        : "l"
                    : orientation;

            const a4 =
                chosenOrientation === "l" ? A4_LANDSCAPE : A4_PORTRAIT;

            const ratioToWidth = a4.width / contentWidth;
            const ratioToHeight = a4.height / contentHeight;
            const scaledHeightAtWidth = contentHeight * ratioToWidth;

            let mode = "single"; // 'single' | 'multi'
            let ratio;

            if (scaledHeightAtWidth <= a4.height + EPS) {
                ratio = ratioToWidth;
            } else if (scaledHeightAtWidth <= a4.height * (1 + overflowTolerance)) {
                ratio = Math.min(ratioToWidth, ratioToHeight);
            } else {
                mode = "multi";
                ratio = ratioToWidth;
            }

            const imgWidth = contentWidth * ratio;
            const imgHeight = contentHeight * ratio;

            const x = (a4.width - imgWidth) / 2;

            const pdf = new JsPDF({
                orientation: chosenOrientation,
                unit: "pt",
                format: "a4"
            });

            if (mode === "single") {
                const y = (a4.height - imgHeight) / 2;
                pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, "", "FAST");
            } else {
                const pageHeightInImagePx = a4.height / ratio;

                let leftHeight = contentHeight;
                let positionY = 0;

                while (leftHeight > EPS) {
                    pdf.addImage(
                        imgData,
                        "PNG",
                        x,
                        positionY,
                        imgWidth,
                        imgHeight,
                        "",
                        "FAST"
                    );
                    leftHeight -= pageHeightInImagePx;
                    positionY -= a4.height;
                    if (leftHeight > EPS) pdf.addPage();
                }
            }

            pdf.save(`${fileName}.pdf`);
            resolve();
        };
        img.onerror = (err) => reject("Failed to load image for PDF: " + err);
        img.src = imgData;
    });
}

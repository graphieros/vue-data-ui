import { domToPng } from "./dom-to-png";

export default async function pdf({
    domElement,
    fileName,
    scale = 2,
    orientation = "auto", // 'auto' | 'portrait' | 'landscape'
    overflowTolerance = 0.2, // up to +n% height overflow gets squeezed onto 1 page
    aspectRatio = null // example: '1/14141'
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

    const BASE_DIM = 1000;
    function parseAspectRatio(ar) {
        if (ar == null) return null;
        if (typeof ar === "number" && ar > 0) return { w: 1, h: ar };
        if (typeof ar === "string") {
            const parts = ar.split("/").map((s) => s.trim());
            if (parts.length === 2) {
                const w = Number(parts[0]);
                const h = Number(parts[1]);
                if (w > 0 && h > 0) return { w, h };
            } else if (parts.length === 1) {
                const n = Number(parts[0]);
                if (n > 0) return { w: 1, h: n };
            }
        }
        return null;
    }

    const parsedAR = parseAspectRatio(aspectRatio);
    const CUSTOM_PORTRAIT = parsedAR
        ? { width: BASE_DIM, height: BASE_DIM * (parsedAR.h / parsedAR.w) }
        : null;
    const CUSTOM_LANDSCAPE = parsedAR
        ? { width: CUSTOM_PORTRAIT.height, height: CUSTOM_PORTRAIT.width }
        : null;

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

            const page =
                chosenOrientation === "l" 
                ? parsedAR ? CUSTOM_LANDSCAPE : A4_LANDSCAPE 
                : parsedAR ? CUSTOM_PORTRAIT : A4_PORTRAIT;

            const ratioToWidth = page.width / contentWidth;
            const ratioToHeight = page.height / contentHeight;
            const scaledHeightAtWidth = contentHeight * ratioToWidth;

            let mode = "single"; // 'single' | 'multi'
            let ratio;

            if (scaledHeightAtWidth <= page.height + EPS) {
                ratio = ratioToWidth;
            } else if (scaledHeightAtWidth <= page.height * (1 + overflowTolerance)) {
                ratio = Math.min(ratioToWidth, ratioToHeight);
            } else {
                mode = "multi";
                ratio = ratioToWidth;
            }

            const imgWidth = contentWidth * ratio;
            const imgHeight = contentHeight * ratio;

            const x = (page.width - imgWidth) / 2;

            const pdf = new JsPDF({
                orientation: chosenOrientation,
                unit: "pt",
                format: parsedAR ? [page.width, page.height] : "a4"
            });

            if (mode === "single") {
                const y = (page.height - imgHeight) / 2;
                pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight, "", "FAST");
            } else {
                const pageHeightInImagePx = page.height / ratio;

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
                    positionY -= page.height;
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

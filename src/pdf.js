import html2canvas from 'html2canvas';
import JsPDF from "jspdf";

export default function pdf({domElement, fileName}) {
    if(domElement) {
            const a4 = {
            height: 851.89,
            width: 595.28,
        };
        const pdf = new JsPDF("", "pt", "a4");
        let contentWidth, contentHeight, imgWidth, imgHeight, pageData;
        return html2canvas(domElement)
            .then((canvasChart) => {
                contentWidth = canvasChart.width;
                contentHeight = canvasChart.height;
                let leftHeight = contentHeight;
                const pageHeight = (contentWidth / a4.width) * a4.height;
                let position = 0;

                imgWidth = a4.width;
                imgHeight = (582.28 / contentWidth) * contentHeight;
                pageData = canvasChart.toDataURL("image/png", 1.0);
                if (leftHeight < pageHeight) {
                pdf.addImage(
                    pageData,
                    "PNG",
                    33,
                    24,
                    imgWidth * 0.9,
                    imgHeight * 0.9,
                    "",
                    "FAST"
                );
                } else {
                while (leftHeight > 0) {
                    pdf.addImage(
                    pageData,
                    "PNG",
                    33,
                    position,
                    imgWidth * 0.9,
                    imgHeight * 0.9,
                    "",
                    "FAST"
                    );
                    leftHeight -= pageHeight;
                    position -= a4.height - 24;
                    if (leftHeight > 0) {
                    pdf.addPage();
                    }
                }
                }
                pdf.save(`${fileName}.pdf`);
            })
    }
}
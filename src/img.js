import html2canvas from 'html2canvas';

export default function saveAsImage({ domElement, fileName, format = 'png' }) {
  if (domElement) {
    return new Promise((resolve, reject) => {
      const downloadLink = document.createElement('a');
      html2canvas(domElement, { scale: 2 })
        .then((canvas) => {
          downloadLink.href = canvas.toDataURL(`image/${format}`);
          downloadLink.download = `${fileName}.${format}`;
          downloadLink.click();
          if (downloadLink) {
            downloadLink.remove();
          }
          resolve();
        })
        .catch((error) => {
          console.error('Error generating image:', error);
          reject(error);
        });
    });
  }
}

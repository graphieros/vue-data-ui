import { domToPng } from "./dom-to-png";

export default async function img({ domElement, fileName, format = 'png', scale = 2 }) {
  if (!domElement) return Promise.reject('No element provided');

  if (format === 'svg') {
    const imgEl = converter.convertToImg({ container: domElement, scale });
    if (!imgEl) return Promise.reject('Could not create SVG image');
    const link = document.createElement('a');
    link.href = imgEl.src;
    link.download = `${fileName}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return Promise.resolve();
  }

  try {
    const imageDataUrl = await domToPng({ container: domElement, scale });
    const link_1 = document.createElement('a');
    link_1.href = imageDataUrl;
    link_1.download = `${fileName}.${format}`;
    document.body.appendChild(link_1);
    link_1.click();
    document.body.removeChild(link_1);
  } catch (err) {
    console.error("Error generating image:", err);
    throw err;
  }
}

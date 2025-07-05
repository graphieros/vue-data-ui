import { domToPng } from "./dom-to-png";

export default async function img({ domElement, fileName, format = 'png', scale = 2, base64 = false }) {
  if (!domElement) return Promise.reject('No element provided');

  if (base64) {
    try {
      return domToPng({ container: domElement, scale, base64 }).then(b64 => {
        return b64
      })
    } catch(err) {
      console.error("Error generating the base64 string of the chart", err);
    }
  } else {
  
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
}



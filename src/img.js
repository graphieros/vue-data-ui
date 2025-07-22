import { domToPng } from "./dom-to-png";

export default async function img({ domElement, fileName, format = 'png', scale = 2, base64 = false, img = false }) {
  if (!domElement) return Promise.reject('No element provided');

  if (base64 && img) {
    try {
      const p = await domToPng({ container: domElement, scale }).then(uri => {
        return uri
      });
      const b64 = await domToPng({ container: domElement, scale, base64 }).then(b64 => {
        return b64
      });
      return { imageUri: p, base64: b64 }
    } catch(err) {
      console.error("Error generating imgae information for the chart", err);
    }
  } else if (base64) {
    try {
      return domToPng({ container: domElement, scale, base64 }).then(b64 => {
        return b64
      })
    } catch(err) {
      console.error("Error generating the base64 string of the chart", err);
    }
  } else {
  
    try {
      const imageDataUri = await domToPng({ container: domElement, scale });
      const link_1 = document.createElement('a');
      link_1.href = imageDataUri;
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



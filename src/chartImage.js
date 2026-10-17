import img from './img';

export function createChartImageGetter(chart, getTitle) {
    return async function getImage({ scale = 2 } = {}) {
        if (!chart.value) return;
        const { width, height } = chart.value.getBoundingClientRect();
        const aspectRatio = width / height;
        const { imageUri, base64 } = await img({
            domElement: chart.value,
            base64: true,
            img: true,
            scale,
        });
        return {
            imageUri,
            base64,
            title: getTitle(),
            width,
            height,
            aspectRatio,
        };
    };
}

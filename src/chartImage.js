import img from './img';

/**
 * Creates a chart instance image getter that captures the current mounted DOM.
 *
 * @param {import('vue').Ref<HTMLElement | null>} chart - Chart container ref.
 * @param {() => string} getTitle - Reads the current export title.
 * @returns {(options?: {scale?: number}) => Promise<object | undefined>} Async capture function; scale defaults to 2. Returns undefined before the container mounts.
 */
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

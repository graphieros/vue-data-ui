import { nextTick, ref } from 'vue';
import { useSvgExport } from './useSvgExport';

/**
 * Coordinates SVG exports and image-export busy flags for a chart.
 * Call during setup. generateSvg({ isCb: true }) invokes the current callback;
 * otherwise it downloads the SVG. Image start/end events update the busy flag.
 * @param {object} options - SVG export inputs and chart callbacks.
 * @param {Function} options.getSvgCallback - Returns the current SVG export callback.
 * @param {Function} options.generateImage - Starts the chart image export.
 * @param {unknown} options.svg - SVG element or ref passed to useSvgExport.
 * @param {unknown} options.title - Reactive title settings.
 * @param {unknown} options.legend - Reactive legend settings.
 * @param {unknown} options.legendItems - Reactive legend entries.
 * @param {unknown} options.backgroundColor - Reactive export background.
 * @param {boolean} [options.titleEmbedded=false] - Title already appears inside the SVG.
 * @param {boolean} [options.stretchTitle=false] - Compensate for title transforms.
 * @returns {object} isCallbackImaging/isCallbackSvg refs and generateSvg/onGenerateImage handlers.
 */
export function useChartExport({
    svg,
    title,
    legend,
    legendItems,
    backgroundColor,
    getSvgCallback,
    generateImage,
    titleEmbedded = false,
    stretchTitle = false,
}) {
    const isCallbackImaging = ref(false);
    const isCallbackSvg = ref(false);

    const { exportSvg, getSvg } = useSvgExport({
        svg,
        title,
        legend,
        legendItems,
        backgroundColor,
        titleEmbedded,
        stretchTitle,
    });

    async function generateSvg({ isCb }) {
        isCallbackSvg.value = true;

        await nextTick();

        try {
            if (isCb) {
                const { blob, url, text, dataUrl } = await getSvg();

                await Promise.resolve(
                    getSvgCallback()({
                        blob,
                        url,
                        text,
                        dataUrl,
                    }),
                );
            } else {
                await Promise.resolve(exportSvg());
            }
        } finally {
            isCallbackSvg.value = false;
        }
    }

    function onGenerateImage(payload) {
        if (payload?.stage === 'start') {
            isCallbackImaging.value = true;
            return;
        }

        if (payload?.stage === 'end') {
            isCallbackImaging.value = false;
            return;
        }

        generateImage();
    }

    return {
        isCallbackImaging,
        isCallbackSvg,
        generateSvg,
        onGenerateImage,
    };
}

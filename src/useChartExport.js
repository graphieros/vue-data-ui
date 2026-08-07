import { nextTick, ref } from 'vue';
import { useSvgExport } from './useSvgExport';

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

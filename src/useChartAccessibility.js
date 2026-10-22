import { ref, onMounted, nextTick } from 'vue';

/**
 * Sets image semantics and an accessible chart label after mounting.
 * Call during setup and bind svgRef to the chart SVG. Title text is captured
 * when this composable is called; later title changes are not watched.
 * @param {object} options - Accessibility inputs.
 * @param {{text?: string, subtitle?: {text?: string}}} options.config - Chart title settings.
 * @returns {{svgRef: import('vue').Ref<SVGSVGElement | null>}} Ref for the SVG receiving ARIA attributes.
 */
export function useChartAccessibility({ config }) {
    const svgRef = ref(null);

    const titleText = config?.text || 'Chart visualization';
    const subtitleText = config?.subtitle?.text || '';

    onMounted(() => {
        nextTick(() => {
            if (svgRef.value) {
                svgRef.value.setAttribute(
                    'aria-label',
                    `${titleText}${subtitleText ? `. ${subtitleText}` : ''}`,
                );
                svgRef.value.setAttribute('role', 'img');
                svgRef.value.setAttribute('aria-live', 'polite');
            }
        });
    });

    return { svgRef };
}

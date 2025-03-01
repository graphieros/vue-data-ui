import { ref, onMounted, nextTick } from "vue";

export function useChartAccessibility({ config }) {
    const svgRef = ref(null);
    
    const titleText = config?.text || "Chart visualization";
    const subtitleText = config?.subtitle?.text || "";

    onMounted(() => {
        nextTick(() => {
            if (svgRef.value) {
                svgRef.value.setAttribute("aria-label", `${titleText}${subtitleText ? `. ${subtitleText}` : ''}`);
                svgRef.value.setAttribute("role", "img");
                svgRef.value.setAttribute("aria-live", "polite");
            }
        })
    });

    return { svgRef };
}
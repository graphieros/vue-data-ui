// Keep the chart-to-annotator defaults identical across chart components.
export function getAnnotatorProps(config) {
    return {
        showGroupActions: config?.showGroupActions ?? true,
        useOutline: config?.useOutline ?? true,
        outlineThickness: config?.outlineThickness ?? 1,
        outlineColor: config?.outlineColor ?? null,
    };
}

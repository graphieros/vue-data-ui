// Keep every action slot present, including when the chart has no custom slot.
export const annotationSlotNames = [
    'annotator-action-close',
    'annotator-action-color',
    'annotator-action-draw',
    'annotator-action-undo',
    'annotator-action-redo',
    'annotator-action-delete',
    'annotator-action-select-multiple',
    'annotator-action-group',
    'annotator-action-ungroup',
];

export function getAnnotationSlotProps(name, props) {
    switch (name) {
        case 'annotator-action-color':
            return { color: props.color };
        case 'annotator-action-draw':
            return { mode: props.mode };
        case 'annotator-action-select-multiple':
            return { isSelecting: props.isSelecting };
        case 'annotator-action-group':
        case 'annotator-action-ungroup':
        case 'annotator-action-undo':
        case 'annotator-action-redo':
        case 'annotator-action-delete':
            return { disabled: props.disabled };
        default:
            return {};
    }
}

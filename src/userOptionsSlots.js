const slotNameLists = new Map();

// Match the scoped props the charts previously forwarded explicitly.
const scopedSlotKeys = {
    __proto__: null,
    menuIcon: ['isOpen', 'color'],
    optionFullscreen: ['toggleFullscreen', 'isFullscreen'],
    optionAnnotator: ['toggleAnnotator', 'isAnnotator'],
    optionAnimation: ['toggleAnimation', 'isAnimated'],
    optionZoom: ['toggleZoom', 'isZoomLocked'],
    optionAltCopy: ['altCopy'],
};

export function getUserOptionSlots(slots, names) {
    let list = slotNameLists.get(names);
    if (!list) {
        list = names.split(' ');
        slotNameLists.set(names, list);
    }
    return list.filter((name) => slots[name]);
}

export function getUserOptionSlotProps(name, props) {
    const result = {};
    for (const key of scopedSlotKeys[name] || []) {
        result[key] = props[key];
    }
    return result;
}

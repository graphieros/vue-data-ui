export default {
    mounted(el, binding) {
        fit(el, binding.value)
    },
    updated(el, binding) {
        fit(el, binding.value)
    }
}

function fit(el, {
    cellWidth,
    cellHeight,
    maxFontSize,
    minFontSize,
    index,
    reportRotation,
    reportHide,
    rotateAll,
    hideAll
}) {
    el.removeAttribute('transform');
    el.removeAttribute('visibility');

    let localRotate = false;
    let localHide = false;

    el.setAttribute('font-size', maxFontSize);
    const length = el.getComputedTextLength();

    if (length <= cellWidth) {
        reportRotation(index, false);
        reportHide(index, false);
    } else {
        const shrinkFs = Math.floor(maxFontSize * cellWidth / length);
        if (shrinkFs >= minFontSize) {
            el.setAttribute('font-size', shrinkFs);
            reportRotation(index, false);
            reportHide(index, false);
        } else {
            reportRotation(index, true);
            reportHide(index, false);
            localRotate = true;
        }
    }

    if (rotateAll) localRotate = true;

    if (localRotate) {
        el.setAttribute('font-size', maxFontSize);

        const bb = el.getBBox();
        const cx = bb.x + bb.width / 2;
        const cy = bb.y + bb.height / 2;

        el.setAttribute('transform', `rotate(-90 ${cx} ${cy})`);

        const needed = el.getBBox().width;
        if (needed <= cellHeight) {
            reportHide(index, false);
        } else {
            const shrinkFs2 = Math.floor(maxFontSize * cellHeight / needed);
            if (shrinkFs2 >= minFontSize) {
                el.setAttribute('font-size', shrinkFs2);
                reportHide(index, false);
            } else {
                localHide = true;
                reportHide(index, true);
            }
        }
    }

    if (hideAll || localHide) {
        el.setAttribute('visibility', 'hidden');
    }
}

import { nextTick, watch } from 'vue';

export function useTimeLabelCollision({
    timeLabelsEls,
    timeLabels,
    slicer,
    configRef,
    rotationPath,
    autoRotatePath,
    isAutoSize,
    setViewBox,
    forceResizeObserver
}) {

    function getNestedProp(obj, path) {
        return path.reduce((acc, key) => acc && acc[key], obj);
    }

    function setNestedProp(obj, path, value) {
        path.slice(0, -1).reduce((acc, key) => acc[key], obj)[path.slice(-1)] = value;
    }

    function parseTranslate(transformStr) {
        const match = /translate\(\s*([^\s,]+)\s*,\s*([^\s,]+)\s*\)/.exec(transformStr);
        if (!match) {
            return { x: 0, y: 0 };
        }
        return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2])
        };
    }

    async function detectTimeLabelCollision() {
        await nextTick();
        const container = timeLabelsEls.value;
        if (!container) return;

        const texts = Array.from(container.querySelectorAll('.vue-data-ui-time-label'));

        const textCoordinates = texts.map(t => ({
            ...parseTranslate(t.getAttribute('transform')),
            width: t.getBBox().width
        }));

        let collision = false;
        const collisionMargin = 4;

        for (let i = 0; i < textCoordinates.length && !collision; i += 1) {
            for (let j = i + 1; j < textCoordinates.length; j += 1) {
                const a = textCoordinates[i];
                const b = textCoordinates[j];
        
                if (!(
                    a.x + a.width + collisionMargin < b.x ||
                    b.x + b.width + collisionMargin < a.x
                )) {
                    collision = true;
                    break;
                }
            }
        }

        const currentRotation = getNestedProp(configRef.value, rotationPath);

        if (collision && !currentRotation) {
            setNestedProp(configRef.value, rotationPath, -30.0001);
            if (isAutoSize.value) {
                setViewBox();
                forceResizeObserver();
            }
        } else if (!collision && currentRotation === -30.0001) {
            setNestedProp(configRef.value, rotationPath, 0);
        }
    }

    function debounce(fn, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn(...args), delay);
        };
    }

    const debouncedDetect = debounce(detectTimeLabelCollision, 200);

    watch(
        [
            () => timeLabels.value,
            () => getNestedProp(configRef.value, rotationPath),
            () => slicer.value.start,
            () => slicer.value.end
        ],
        async ([, , newStart, newEnd], [, , oldStart, oldEnd]) => {
            const autoRotate = getNestedProp(configRef.value, autoRotatePath);
            if (!autoRotate) return;

            const slicerChanged = newStart !== oldStart || newEnd !== oldEnd;

            if (slicerChanged) {
                debouncedDetect();
            } else {
                await detectTimeLabelCollision();
            }
        },
        { immediate: true }
    );

    return { detectTimeLabelCollision };
}

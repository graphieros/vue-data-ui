export function registerAnnotatorShortcuts(ctx) {
    const isPrimaryMod = (event) => (ctx.isMacLike.value ? event.metaKey : event.ctrlKey);

    const isTypingTarget = (element) => {
        const node = element;
        if (!node) return false;
        const tag = (node.tagName || "").toLowerCase();
        const editable = node.isContentEditable;
        return editable || tag === "input" || tag === "textarea" || tag === "select";
    };

    const blockShortcuts = (event) => {
        if (!ctx.isSummaryOpen.value || isTypingTarget(event.target) || ctx.isWriting.value) return true;
        return false;
    };

    const clearModes = () => {
        ctx.isDeleteMode.value = false;
        ctx.isMoveMode.value = false;
        ctx.isResizeMode.value = false;
        ctx.isSelectMode.value = false;
        ctx.isDrawMode.value = false;
        ctx.isTextMode.value = false;
        ctx.activeShape.value = undefined;
        ctx.showCaret.value = false;
    };

    const toggleMode = (key) => {
        clearModes();

        switch (key) {
            case "m":
                ctx.isMoveMode.value = true;
                break;
            case "r":
                ctx.isResizeMode.value = true;
                break;
            case "d":
                ctx.isDeleteMode.value = true;
                break;
            case "g":
                ctx.isSelectMode.value = true;
                ctx.setShapeTo("group");
                ctx.activeShape.value = "group";
                break;
            case "t":
                ctx.isTextMode.value = true;
                ctx.isWriting.value = false;
                ctx.showCaret.value = false;
                break;
            default:
                break;
        }
    };

    const pickShape = (key) => {
        switch (key) {
            case "c":
                ctx.setShapeTo("circle");
                break;
            case "s":
                ctx.setShapeTo("rect");
                break;
            case "a":
                ctx.setShapeTo("arrow");
                break;
            case "l":
                ctx.setShapeTo("line");
                break;
            default:
                break;
        }
    };

    const nudge = (deltaX, deltaY) => {
        const selectedShape = ctx.lastSelectedShape.value;
        if (!selectedShape) return;

        const add = (prop, delta) => {
            if (typeof selectedShape[prop] === "number") {
                selectedShape[prop] += delta;
            }
        };

        switch (selectedShape.type) {
            case "rect":
            case "circle":
            case "text":
                add("x", deltaX);
                add("y", deltaY);
                break;
            case "arrow":
                add("x", deltaX);
                add("y", deltaY);
                add("endX", deltaX);
                add("endY", deltaY);
                break;
            default:
                break;
        }
    };

    const deleteSelection = () => {
        const selectedShape = ctx.lastSelectedShape.value;
        if (!selectedShape) return;

        ctx.shapes.value = ctx.shapes.value.filter((shape) => shape.id !== selectedShape.id);
        ctx.lastSelectedShape.value = undefined;
    };

    let arrowBatchActive = false;
    let arrowIdleTimer = null;

    const beginArrowBatch = () => {
        if (arrowBatchActive) return;
        arrowBatchActive = true;
        ctx.history?.value?.begin?.("nudge");
    };

    const endArrowBatchSoon = () => {
        if (!arrowBatchActive) return;

        clearTimeout(arrowIdleTimer);
        arrowIdleTimer = setTimeout(() => {
            arrowBatchActive = false;
            ctx.history?.value?.end?.();
        }, 160);
    };

    const endArrowBatchNow = () => {
        clearTimeout(arrowIdleTimer);
        if (arrowBatchActive) {
            ctx.history?.value?.end?.();
        }
        arrowBatchActive = false;
    };

    const onKeyDown = (event) => {
        if (isPrimaryMod(event) && !event.shiftKey && event.key.toLowerCase() === "z") {
            if (blockShortcuts(event)) return;
            event.preventDefault();
            ctx.undoLastShape?.();
            return;
        }

        if (
            (isPrimaryMod(event) && event.shiftKey && event.key.toLowerCase() === "z") ||
            (isPrimaryMod(event) && event.key.toLowerCase() === "y")
        ) {
            if (blockShortcuts(event)) return;
            event.preventDefault();
            if (typeof ctx.redoLastShape === "function") {
                ctx.redoLastShape();
            } else {
                ctx.history?.value?.redo?.();
            }
            return;
        }

        if (blockShortcuts(event)) return;

        const key = event.key.toLowerCase();

        if (key === "escape") {
            event.preventDefault();
            clearModes();
            return;
        }

        if (key === "delete" || key === "backspace") {
            event.preventDefault();
            deleteSelection();
            return;
        }

        if (["m", "r", "d", "g", "t"].includes(key)) {
            event.preventDefault();
            toggleMode(key);
            return;
        }

        if (["c", "a", "l", "s"].includes(key)) {
            event.preventDefault();
            pickShape(key);
            return;
        }

        const isArrowKey =
            event.key === "ArrowUp" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight";

        if (isArrowKey) {
            event.preventDefault();
            beginArrowBatch();

            const step = event.shiftKey ? 10 : 1;

            if (event.key === "ArrowUp") nudge(0, -step);
            if (event.key === "ArrowDown") nudge(0, step);
            if (event.key === "ArrowLeft") nudge(-step, 0);
            if (event.key === "ArrowRight") nudge(step, 0);

            endArrowBatchSoon();
        }
    };

    const onKeyUp = (event) => {
        if (event.key.startsWith("Arrow")) {
            endArrowBatchSoon();
        }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return function unregister() {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        endArrowBatchNow();
    };
}
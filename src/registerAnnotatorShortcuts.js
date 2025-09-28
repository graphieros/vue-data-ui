export function registerAnnotatorShortcuts(cmp) {

    const isPrimaryMod = (e) => (cmp.isMacLike ? e.metaKey : e.ctrlKey);

    const isTypingTarget = (el) => {
        const node = el;
        if (!node) return false;
        const tag = (node.tagName || "").toLowerCase();
        const editable = node.isContentEditable;
        return editable || tag === "input" || tag === "textarea" || tag === "select";
    };

    const blockShortcuts = (e) => {
        // Block shortcuts while summary is closed or typing in inputs, or while text entry is active
        if (!cmp.isSummaryOpen || isTypingTarget(e.target) || cmp.isWriting) return true;
        return false;
    };

    const clearModes = () => {
        cmp.isDeleteMode = false;
        cmp.isMoveMode = false;
        cmp.isResizeMode = false;
        cmp.isSelectMode = false;
        cmp.isDrawMode = false;
        cmp.isTextMode = false;
        cmp.activeShape = undefined;
        cmp.showCaret = false;
    };

    const toggleMode = (key) => {
        clearModes();
        switch (key) {
            case "m": cmp.isMoveMode = true; break; // Move
            case "r": cmp.isResizeMode = true; break; // Resize
            case "d": cmp.isDeleteMode = true; break; // Delete
            case "g": cmp.isSelectMode = true; cmp.setShapeTo("group"); cmp.activeShape = "group"; break; // Select/Group
            case "t": cmp.isTextMode = true; cmp.isWriting = false; cmp.showCaret = false; break; // Text (click to place)
            default: break;
        }
    };

    const pickShape = (key) => {
        switch (key) {
            case "c": cmp.setShapeTo("circle"); break;
            case "s": cmp.setShapeTo("rect"); break;
            case "a": cmp.setShapeTo("arrow"); break;
            case "l": cmp.setShapeTo("line"); break; // Freehand line
            default: break;
        }
    };

    const nudge = (dx, dy) => {
        const s = cmp.lastSelectedShape;
        if (!s) return;

        const add = (prop, delta) => { if (typeof s[prop] === "number") s[prop] += delta; };
        switch (s.type) {
            case "rect":
            case "circle":
            case "text":
                add("x", dx); add("y", dy);
                break;
            case "arrow":
                add("x", dx); add("y", dy);
                add("endX", dx); add("endY", dy);
                break;
            // Freehand lines and groups are skipped (for now...)
            default:
                break;
        }
    };

    const deleteSelection = () => {
        const s = cmp.lastSelectedShape;
        if (!s) return;
        cmp.shapes = cmp.shapes.filter((sh) => sh.id !== s.id);
        cmp.lastSelectedShape = undefined;
    };

    let arrowBatchActive = false;
    let arrowIdleTimer = null;
    const beginArrowBatch = () => {
        if (arrowBatchActive) return;
        arrowBatchActive = true;
        cmp.history?.begin?.("nudge");
    };
    const endArrowBatchSoon = () => {
        if (!arrowBatchActive) return;
        clearTimeout(arrowIdleTimer);
        arrowIdleTimer = setTimeout(() => {
            arrowBatchActive = false;
            cmp.history?.end?.();
        }, 160);
    };
    const endArrowBatchNow = () => {
        clearTimeout(arrowIdleTimer);
        if (arrowBatchActive) cmp.history?.end?.();
        arrowBatchActive = false;
    };

    const onKeyDown = (e) => {
        // Undo (Cmd/Ctrl+Z)
        if (isPrimaryMod(e) && !e.shiftKey && e.key.toLowerCase() === "z") {
            if (blockShortcuts(e)) return;
            e.preventDefault();
            cmp.undoLastShape?.();
            return;
        }

        // Redo (Cmd/Ctrl+Shift+Z OR Cmd/Ctrl+Y)
        if (
            (isPrimaryMod(e) && e.shiftKey && e.key.toLowerCase() === "z") ||
            (isPrimaryMod(e) && e.key.toLowerCase() === "y")
        ) {
            if (blockShortcuts(e)) return;
            e.preventDefault();
            if (typeof cmp.redoLastShape === "function") cmp.redoLastShape();
            else cmp.history?.redo?.();
            return;
        }

        if (blockShortcuts(e)) return;

        const k = e.key.toLowerCase();

        // Escape: clear modes
        if (k === "escape") {
            e.preventDefault();
            clearModes();
            return;
        }

        // Delete current selection
        if (k === "delete" || k === "backspace") {
            e.preventDefault();
            deleteSelection();
            return;
        }

        // Mode toggles
        if (["m", "r", "d", "g", "t"].includes(k)) {
            e.preventDefault();
            toggleMode(k);
            return;
        }

        // Shape pickers (draw)
        if (["c", "a", "l", "s"].includes(k)) {
            e.preventDefault();
            pickShape(k);
            return;
        }

        // Nudge arrows (Shift = 10px step)
        const isArrowKey =
            e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight";
        if (isArrowKey) {
            e.preventDefault();
            beginArrowBatch();
            const step = e.shiftKey ? 10 : 1;
            if (e.key === "ArrowUp") nudge(0, -step);
            if (e.key === "ArrowDown") nudge(0, step);
            if (e.key === "ArrowLeft") nudge(-step, 0);
            if (e.key === "ArrowRight") nudge(step, 0);
            endArrowBatchSoon();
            return;
        }
    };

    const onKeyUp = (e) => {
        if (e.key.startsWith("Arrow")) endArrowBatchSoon();
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });
    window.addEventListener("keyup", onKeyUp, { passive: true });

    return function unregister() {
        window.removeEventListener("keydown", onKeyDown, { passive: false });
        window.removeEventListener("keyup", onKeyUp, { passive: true });
        endArrowBatchNow();
    };
}

import { watchEffect, nextTick } from "vue";

export function useResizeObserverEffect({ elementRef, callback, attr, earlyReturn = false }) {
    if (earlyReturn) return;
    watchEffect(
        (onInvalidate) => {
            const el = elementRef.value;
            if (!el) return;

            const ro = new ResizeObserver((entries) => {
                const entry = entries[0];
                const rect = entry?.contentRect;
                let v;

                if (rect && rect[attr] != null) {
                    v = rect[attr];
                } else {
                    try {
                        if (attr === "width") {
                            v = (typeof el.getBBox === "function" ? el.getBBox().width : el.getBoundingClientRect().width);
                        } else {
                            v = (typeof el.getBBox === "function" ? el.getBBox().height : el.getBoundingClientRect().height);
                        }
                    } catch {
                        const r = el.getBoundingClientRect();
                        v = attr === "width" ? r.width : r.height;
                    }
                }
                if (typeof v === "number" && !Number.isNaN(v)) callback(v);
            });

            ro.observe(el);

            nextTick(() => {
                requestAnimationFrame(() => {
                    if (!elementRef.value) return;
                    const r = elementRef.value.getBoundingClientRect();
                    const v = attr === "width" ? r.width : r.height;
                    if (typeof v === "number" && !Number.isNaN(v)) callback(v);
                });
            });

            onInvalidate(() => ro.disconnect());
        },
        { flush: "post" }
    );
}

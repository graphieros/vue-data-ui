import {
    computed,
    getCurrentInstance,
    getCurrentScope,
    nextTick,
    onMounted,
    onScopeDispose,
    shallowRef,
    toValue,
    unref,
    watch,
} from 'vue';

const defaultWindow = typeof window !== 'undefined' ? window : undefined;

function toArray(value) {
    return Array.isArray(value) ? value : [value];
}

function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

function notNullish(value) {
    return value != null;
}

function tryOnMounted(callback, sync = true, target) {
    const instance = target ?? getCurrentInstance();

    if (instance) {
        onMounted(callback, target);
    } else if (sync) {
        callback();
    } else {
        nextTick(callback);
    }
}

function tryOnScopeDispose(callback, failSilently) {
    if (getCurrentScope()) {
        onScopeDispose(callback, failSilently);
        return true;
    }

    return false;
}

function unrefElement(elementReference) {
    const plain = toValue(elementReference);

    return plain?.$el ?? plain;
}

function useSupported(callback) {
    const isMounted = shallowRef(false);

    tryOnMounted(() => {
        isMounted.value = true;
    });

    return computed(() => {
        isMounted.value;
        return Boolean(callback());
    });
}

function useEventListener(...argumentsList) {
    const register = (element, event, listener, options) => {
        element.addEventListener(event, listener, options);

        return () => {
            element.removeEventListener(event, listener, options);
        };
    };

    const firstParameterTargets = computed(() => {
        const test = toArray(toValue(argumentsList[0])).filter(
            (element) => element != null,
        );

        return test.every((element) => typeof element !== 'string')
            ? test
            : undefined;
    });

    return watch(
        () => {
            const hasExplicitTarget = firstParameterTargets.value;

            return [
                hasExplicitTarget?.map((element) => unrefElement(element)) ??
                    [defaultWindow].filter((element) => element != null),
                toArray(
                    toValue(
                        hasExplicitTarget ? argumentsList[1] : argumentsList[0],
                    ),
                ),
                toArray(
                    unref(
                        hasExplicitTarget ? argumentsList[2] : argumentsList[1],
                    ),
                ),
                toValue(
                    hasExplicitTarget ? argumentsList[3] : argumentsList[2],
                ),
            ];
        },
        (
            [rawTargets, rawEvents, rawListeners, rawOptions],
            oldValue,
            onCleanup,
        ) => {
            if (
                !rawTargets?.length ||
                !rawEvents?.length ||
                !rawListeners?.length
            ) {
                return;
            }

            const optionsClone = isObject(rawOptions)
                ? { ...rawOptions }
                : rawOptions;

            const cleanups = rawTargets.flatMap((target) =>
                rawEvents.flatMap((event) =>
                    rawListeners.map((listener) =>
                        register(target, event, listener, optionsClone),
                    ),
                ),
            );

            onCleanup(() => {
                cleanups.forEach((cleanup) => cleanup());
            });
        },
        {
            immediate: true,
            flush: 'post',
        },
    );
}

function useResizeObserver(target, callback, options = {}) {
    const { window = defaultWindow, ...observerOptions } = options;

    let observer;

    const isSupported = useSupported(
        () => window && 'ResizeObserver' in window,
    );

    const cleanup = () => {
        if (observer) {
            observer.disconnect();
            observer = undefined;
        }
    };

    const targets = computed(() => {
        const resolvedTarget = toValue(target);

        return Array.isArray(resolvedTarget)
            ? resolvedTarget.map((element) => unrefElement(element))
            : [unrefElement(resolvedTarget)];
    });

    const stopWatch = watch(
        targets,
        (elements) => {
            cleanup();

            if (isSupported.value && window) {
                observer = new window.ResizeObserver(callback);

                for (const element of elements) {
                    if (element) {
                        observer.observe(element, observerOptions);
                    }
                }
            }
        },
        {
            immediate: true,
            flush: 'post',
        },
    );

    const stop = () => {
        cleanup();
        stopWatch();
    };

    tryOnScopeDispose(stop);

    return {
        isSupported,
        stop,
    };
}

function useMutationObserver(target, callback, options = {}) {
    const { window = defaultWindow, ...mutationOptions } = options;

    let observer;

    const isSupported = useSupported(
        () => window && 'MutationObserver' in window,
    );

    const cleanup = () => {
        if (observer) {
            observer.disconnect();
            observer = undefined;
        }
    };

    const targets = computed(() => {
        const value = toValue(target);
        const items = toArray(value)
            .map((element) => unrefElement(element))
            .filter(notNullish);

        return new Set(items);
    });

    const stopWatch = watch(
        targets,
        (newTargets) => {
            cleanup();

            if (isSupported.value && newTargets.size) {
                observer = new window.MutationObserver(callback);

                newTargets.forEach((element) => {
                    observer.observe(element, mutationOptions);
                });
            }
        },
        {
            immediate: true,
            flush: 'post',
        },
    );

    const takeRecords = () => observer?.takeRecords();

    const stop = () => {
        stopWatch();
        cleanup();
    };

    tryOnScopeDispose(stop);

    return {
        isSupported,
        stop,
        takeRecords,
    };
}

const useMouseBuiltInExtractors = {
    page: (event) => [event.pageX, event.pageY],
    client: (event) => [event.clientX, event.clientY],
    screen: (event) => [event.screenX, event.screenY],
    movement: (event) =>
        typeof MouseEvent !== 'undefined' && event instanceof MouseEvent
            ? [event.movementX, event.movementY]
            : null,
};

export function useMouse(options = {}) {
    const {
        type = 'page',
        touch = true,
        resetOnTouchEnds = false,
        initialValue = { x: 0, y: 0 },
        window = defaultWindow,
        target = window,
        scroll = true,
        eventFilter,
    } = options;

    let previousMouseEvent = null;
    let previousScrollX = 0;
    let previousScrollY = 0;

    const x = shallowRef(initialValue.x);
    const y = shallowRef(initialValue.y);
    const sourceType = shallowRef(null);

    const extractor =
        typeof type === 'function' ? type : useMouseBuiltInExtractors[type];

    const mouseHandler = (event) => {
        const result = extractor(event);

        previousMouseEvent = event;

        if (result) {
            [x.value, y.value] = result;
            sourceType.value = 'mouse';
        }

        if (window) {
            previousScrollX = window.scrollX;
            previousScrollY = window.scrollY;
        }
    };

    const touchHandler = (event) => {
        if (event.touches.length > 0) {
            const result = extractor(event.touches[0]);

            if (result) {
                [x.value, y.value] = result;
                sourceType.value = 'touch';
            }
        }
    };

    const scrollHandler = () => {
        if (!previousMouseEvent || !window) {
            return;
        }

        const position = extractor(previousMouseEvent);

        if (
            typeof MouseEvent !== 'undefined' &&
            previousMouseEvent instanceof MouseEvent &&
            position
        ) {
            x.value = position[0] + window.scrollX - previousScrollX;
            y.value = position[1] + window.scrollY - previousScrollY;
        }
    };

    const reset = () => {
        x.value = initialValue.x;
        y.value = initialValue.y;
    };

    const mouseHandlerWrapper = eventFilter
        ? (event) => eventFilter(() => mouseHandler(event), {})
        : (event) => mouseHandler(event);

    const touchHandlerWrapper = eventFilter
        ? (event) => eventFilter(() => touchHandler(event), {})
        : (event) => touchHandler(event);

    const scrollHandlerWrapper = eventFilter
        ? () => eventFilter(() => scrollHandler(), {})
        : () => scrollHandler();

    if (target) {
        const listenerOptions = { passive: true };

        useEventListener(
            target,
            ['mousemove', 'dragover'],
            mouseHandlerWrapper,
            listenerOptions,
        );

        if (touch && type !== 'movement') {
            useEventListener(
                target,
                ['touchstart', 'touchmove'],
                touchHandlerWrapper,
                listenerOptions,
            );

            if (resetOnTouchEnds) {
                useEventListener(target, 'touchend', reset, listenerOptions);
            }
        }

        if (scroll && type === 'page') {
            useEventListener(
                window,
                'scroll',
                scrollHandlerWrapper,
                listenerOptions,
            );
        }
    }

    return {
        x,
        y,
        sourceType,
    };
}

export function useMouseInElement(target, options = {}) {
    const {
        windowResize = true,
        windowScroll = true,
        handleOutside = true,
        window = defaultWindow,
    } = options;

    const type = options.type || 'page';

    const { x, y, sourceType } = useMouse(options);

    const targetReference = shallowRef(target ?? window?.document.body);

    const elementX = shallowRef(0);
    const elementY = shallowRef(0);
    const elementPositionX = shallowRef(0);
    const elementPositionY = shallowRef(0);
    const elementHeight = shallowRef(0);
    const elementWidth = shallowRef(0);
    const isOutside = shallowRef(true);

    function update() {
        if (!window) {
            return;
        }

        const element = unrefElement(targetReference);

        if (!element || !(element instanceof Element)) {
            return;
        }

        for (const rectangle of element.getClientRects()) {
            const { left, top, width, height } = rectangle;

            elementPositionX.value =
                left + (type === 'page' ? window.pageXOffset : 0);
            elementPositionY.value =
                top + (type === 'page' ? window.pageYOffset : 0);

            elementHeight.value = height;
            elementWidth.value = width;

            const currentElementX = x.value - elementPositionX.value;
            const currentElementY = y.value - elementPositionY.value;

            isOutside.value =
                width === 0 ||
                height === 0 ||
                currentElementX < 0 ||
                currentElementY < 0 ||
                currentElementX > width ||
                currentElementY > height;

            if (handleOutside || !isOutside.value) {
                elementX.value = currentElementX;
                elementY.value = currentElementY;
            }

            if (!isOutside.value) {
                break;
            }
        }
    }

    const stopFunctionList = [];

    function stop() {
        stopFunctionList.forEach((stopFunction) => stopFunction());
        stopFunctionList.length = 0;
    }

    tryOnMounted(() => {
        update();
    });

    if (window) {
        const { stop: stopResizeObserver } = useResizeObserver(
            targetReference,
            update,
        );

        const { stop: stopMutationObserver } = useMutationObserver(
            targetReference,
            update,
            {
                attributeFilter: ['style', 'class'],
            },
        );

        const stopWatch = watch([targetReference, x, y], update);

        stopFunctionList.push(
            stopResizeObserver,
            stopMutationObserver,
            stopWatch,
        );

        useEventListener(
            document,
            'mouseleave',
            () => {
                isOutside.value = true;
            },
            { passive: true },
        );

        if (windowScroll) {
            stopFunctionList.push(
                useEventListener('scroll', update, {
                    capture: true,
                    passive: true,
                }),
            );
        }

        if (windowResize) {
            stopFunctionList.push(
                useEventListener('resize', update, { passive: true }),
            );
        }
    }

    return {
        x,
        y,
        sourceType,
        elementX,
        elementY,
        elementPositionX,
        elementPositionY,
        elementHeight,
        elementWidth,
        isOutside,
        stop,
    };
}

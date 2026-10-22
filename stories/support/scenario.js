import { mountStory } from './mount.js';
import { controlAnimationFrames } from './animationFrames.js';
import { nextTick } from 'vue';
import {
    expect,
    fireEvent,
    fn,
    spyOn,
    waitFor,
    userEvent,
} from 'storybook/test';
import rating from '../fixtures/rating.json';
import skeleton from '../fixtures/skeleton.json';
import smiley from '../fixtures/smiley.json';
import relationCircle from '../fixtures/relation-circle.json';

const cleanups = new Set();
export function cleanupScenarios() {
    for (const cleanup of cleanups) cleanup();
    cleanups.clear();
}

// These scenarios also inspect exposed methods and emitted payloads. Vue Test
// Utils provides that access while Storybook owns the canvas and test lifecycle.
export function createScenario(canvasElement) {
    const aliases = new Map();
    const fixtures = {
        'rating.json': rating,
        'skeleton.json': skeleton,
        'smiley.json': smiley,
        'relation-circle.json': relationCircle,
    };
    const originalNodes = new Set(document.body.children);
    const originalStyle = document.body.getAttribute('style');
    const spies = [];
    let wrapper;
    let unmount;
    const unmountSubject = () => {
        const dispose = unmount;
        unmount = undefined;
        wrapper = undefined;
        dispose?.();
    };
    const cleanup = () => {
        unmountSubject();
        spies.forEach((spy) => spy.mockRestore());
        for (const node of document.body.children) {
            if (!originalNodes.has(node)) node.remove();
        }
        if (originalStyle === null) document.body.removeAttribute('style');
        else document.body.setAttribute('style', originalStyle);
    };
    cleanups.add(cleanup);
    const select = (selector, root = document) => {
        if (selector === '[data-cy-root]') return [canvasElement];
        const matches = [...root.querySelectorAll(selector)];
        if (root !== document || selector === 'body') return matches;
        return matches.filter(
            (element) =>
                canvasElement.contains(element) ||
                [...document.body.children].some(
                    (node) =>
                        !originalNodes.has(node) && node.contains(element),
                ),
        );
    };
    const mountSubject = async (component, options = {}) => {
        unmountSubject();
        const host = canvasElement.querySelector('[data-story-host]');
        host.replaceChildren();
        const mounted = mountStory(component, { ...options, attachTo: host });
        wrapper = mounted.wrapper;
        unmount = mounted.unmount;
        await nextTick();
        return { wrapper };
    };
    const resize = async (width, height) => {
        // A container establishes responsive dimensions in both the iframe and
        // browser runner, without changing the Storybook manager's viewport.
        canvasElement.style.width = `${width}px`;
        canvasElement.style.minHeight = `${height}px`;
        window.dispatchEvent(new Event('resize'));
        await nextTick();
        await new Promise((resolve) => requestAnimationFrame(resolve));
    };
    const spy = (target, key) => {
        if (!target) return fn();
        const result = spyOn(target, key);
        spies.push(result);
        return result;
    };
    return {
        aliases,
        select,
        mountSubject,
        resize,
        spy,
        fixtures,
        currentWrapper: () => wrapper,
        controlAnimationFrames: () => controlAnimationFrames(spy),
    };
}

export const scenarioRender = () => ({
    template: '<div data-story-host style="width:100%;min-height:100px" />',
});
export async function runScenario(context, factory, name) {
    const env = createScenario(context.canvasElement);
    const { cases, hooks } = factory(env);
    for (const hook of hooks) await hook();
    await cases[name]();
}

export async function dispatch(elements, eventName, options = {}) {
    const { eventConstructor, force, ...init } = options;
    for (const element of elements) {
        const Constructor = eventConstructor
            ? window[eventConstructor]
            : eventName.startsWith('key')
              ? KeyboardEvent
              : eventName.startsWith('pointer')
                ? PointerEvent
                : MouseEvent;
        fireEvent(
            element,
            new Constructor(eventName, {
                bubbles: true,
                cancelable: true,
                ...init,
            }),
        );
    }
    await nextTick();
}

export async function clickElements(elements, ...args) {
    for (let element of elements) {
        if (element.matches('[data-cy="atom-shape"]'))
            element =
                element.querySelector('circle,path,rect,polygon') || element;
        if (element.closest('.vue-ui-3d-bar-stack'))
            fireEvent.mouseEnter(element);
        if (element.matches('details'))
            element = element.querySelector('summary');
        const rect = element.getBoundingClientRect();
        const coords =
            typeof args[0] === 'number'
                ? { clientX: args[0], clientY: args[1] }
                : {
                      clientX: rect.left + rect.width / 2,
                      clientY: rect.top + rect.height / 2,
                  };
        fireEvent.pointerDown(element, {
            bubbles: true,
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true,
            button: 0,
            buttons: 1,
            ...coords,
        });
        await nextTick();
        fireEvent.mouseDown(element, {
            bubbles: true,
            button: 0,
            buttons: 1,
            ...coords,
        });
        fireEvent.pointerUp(element, {
            bubbles: true,
            pointerId: 1,
            pointerType: 'mouse',
            isPrimary: true,
            button: 0,
            ...coords,
        });
        fireEvent.mouseUp(element, { bubbles: true, button: 0, ...coords });
        fireEvent.click(element, { bubbles: true, ...coords });
    }
    await nextTick();
}

export function visible(element) {
    if (!element?.isConnected) return false;
    for (let node = element; node?.nodeType === 1; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (
            node.hidden ||
            style.display === 'none' ||
            style.visibility === 'hidden' ||
            style.opacity === '0'
        )
            return false;
    }
    return true;
}
export { expect, fireEvent, fn, waitFor, userEvent, nextTick };

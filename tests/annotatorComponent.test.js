import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import { beforeEach, afterEach, test, expect, vi } from 'vitest';
import Chart from '../src/components/vue-ui-annotator.vue';
const exportState = vi.hoisted(() => ({ png: vi.fn(), documents: [] }));
vi.mock('../src/dom-to-png', () => ({
    domToPng: (...args) => exportState.png(...args),
}));
vi.mock('jspdf', () => ({
    default: class {
        constructor() {
            this.addImage = vi.fn();
            this.addPage = vi.fn();
            this.save = vi.fn();
            exportState.documents.push(this);
        }
    },
}));
const rect = {
    id: 'custom-box',
    type: 'rect',
    x: 150,
    y: 100,
    rectWidth: 100,
    rectHeight: 60,
    color: '#ff0000',
    alpha: '',
    strokeWidth: 2,
    isFilled: false,
};
const text = {
    id: 'text_1',
    type: 'text',
    x: 200,
    y: 200,
    textContent: 'A < B & C',
    fontSize: 20,
    textAlign: 'start',
    color: '#000000',
    isBold: false,
    isItalic: false,
    isUnderline: false,
};
let wrappers, frames, observers, id, images;
beforeEach(() => {
    wrappers = [];
    frames = new Map();
    observers = [];
    images = [];
    id = 0;
    exportState.documents.length = 0;
    exportState.png.mockReset();
    exportState.png.mockResolvedValue('data:image/png;base64,AA==');
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((cb) => {
            frames.set(++id, cb);
            return id;
        }),
    );
    vi.stubGlobal(
        'cancelAnimationFrame',
        vi.fn((id) => frames.delete(id)),
    );
    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(cb) {
                this.callback = cb;
                observers.push(this);
            }
            observe = vi.fn();
            disconnect = vi.fn();
        },
    );
    vi.stubGlobal(
        'Image',
        class {
            width = 100;
            height = 300;
            set src(value) {
                images.push(this);
            }
        },
    );
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
        x: 0,
        y: 0,
        left: 0,
        top: 0,
        width: 1000,
        height: 500,
        right: 1000,
        bottom: 500,
    });
    Object.defineProperties(SVGElement.prototype, {
        getBBox: {
            configurable: true,
            value: () => ({ x: 0, y: 0, width: 100, height: 20 }),
        },
        getComputedTextLength: { configurable: true, value: () => 20 },
    });
});
afterEach(() => {
    wrappers.forEach((w) => w.unmount());
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
});
async function chart(
    data = { shapes: [rect, text], lastSelectedShape: rect },
    dom = false,
) {
    const w = mount(dom ? Chart : { ...Chart, render: () => null }, {
        props: { dataset: structuredClone(data) },
        slots: dom
            ? {
                  default: () =>
                      h(
                          'div',
                          { style: 'width:1000px;height:500px' },
                          'Content',
                      ),
                  toggle: () => h('button', 'Toggle'),
              }
            : {},
        global: {
            stubs: {
                Accordion: true,
                ColorPicker: true,
                BaseIcon: true,
                TeleportedTooltip: true,
                teleport: true,
            },
        },
    });
    wrappers.push(w);
    await flushPromises();
    return [w, w.vm.$.setupState];
}
function event(x = 200, y = 100) {
    return {
        clientX: x,
        clientY: y,
        pointerId: 1,
        target: null,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
    };
}
test('edits use cloned shapes and selected shape resolves to current model', async () => {
    const [w, s] = await chart();
    s.setColorOfSelectedShape('#00ff00');
    expect(s.shapes[0].color).toBe('#00ff00');
    expect(w.props('dataset').shapes[0].color).toBe('#ff0000');
    s.shapes = s.shapes.map((shape) => ({ ...shape, x: shape.x + 5 }));
    expect(s.lastSelectedShape.x).toBe(155);
});
test('duplication translates both arrow endpoints and is undoable', async () => {
    const arrow = {
        id: 'arrow_1',
        type: 'arrow',
        x: 150,
        y: 150,
        endX: 300,
        endY: 250,
        color: '#000000',
        strokeWidth: 2,
    };
    const [, s] = await chart({ shapes: [arrow], lastSelectedShape: arrow });
    s.copyPaste();
    expect(s.shapes[1]).toMatchObject({ x: 50, y: 50, endX: 200, endY: 150 });
    expect(s.shapes[1].id).not.toBe(arrow.id);
    s.undoLastShape();
    expect(s.shapes).toHaveLength(1);
    s.redoLastShape();
    expect(s.shapes).toHaveLength(2);
});
test('layer commands are selection-safe and undoable', async () => {
    const [, s] = await chart();
    s.lastSelectedShape = undefined;
    expect(() => s.bringShapeTo('front')).not.toThrow();
    s.lastSelectedShape = s.shapes[0];
    s.bringShapeTo('front');
    expect(s.shapes.at(-1).id).toBe(rect.id);
    s.undoLastShape();
    expect(s.shapes[0].id).toBe(rect.id);
});
test('style changes batch into one undo entry', async () => {
    const [, s] = await chart();
    s.history.begin();
    s.strokeSize = 5;
    s.setStrokeWidthOfSelectedShape();
    s.strokeSize = 8;
    s.setStrokeWidthOfSelectedShape();
    s.history.end();
    expect(s.HISTORY_SIZE.undo).toBe(1);
    s.undoLastShape();
    expect(s.lastSelectedShape.strokeWidth).toBe(2);
    s.setFillOfSelectedRect();
    expect(s.lastSelectedShape.isFilled).toBe(true);
});
test('keyboard deletion uses the same history and selection as pointer editing', async () => {
    const [, s] = await chart();
    s.isSummaryOpen = true;
    await flushPromises();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete' }));
    expect(s.shapes).toHaveLength(1);
    s.undoLastShape();
    expect(s.shapes).toHaveLength(2);
    expect(s.lastSelectedShape.id).toBe(rect.id);
});
test('tool changes finish text transactions and keep modes exclusive', async () => {
    const [, s] = await chart();
    s.startTextEditing(s.shapes[1]);
    s.write({ key: '!', preventDefault: vi.fn() });
    s.setToolMode('move');
    expect(s.isWriting).toBe(false);
    expect(s.isMoveMode).toBe(true);
    expect(s.isTextMode).toBe(false);
    s.undoLastShape();
    expect(s.shapes[1].textContent).toBe(text.textContent);
});
test('grouped text uses escaped text rendering and keeps legacy whitespace', async () => {
    const [, s] = await chart();
    const group = {
        id: 'group_1',
        type: 'group',
        x: 0,
        y: 0,
        rectWidth: 400,
        rectHeight: 400,
        source: [
            {
                ...text,
                id: 'group_1',
                oldId: text.id,
                diffX: 200,
                diffY: 200,
                textContent: '<tspan> &nbsp;',
            },
        ],
    };
    s.moveGroup(group);
    expect(group.content).toContain('&lt;tspan&gt;');
    expect(group.content).not.toContain('>\n            <tspan>');
    expect(group.content).toContain('\u00a0');
    expect(group.content).not.toContain('fill="red"');
});
test('group resizing scales children uniformly from the original source snapshot', async () => {
    const group = {
        id: 'group_1',
        type: 'group',
        x: 0,
        y: 0,
        rectWidth: 200,
        rectHeight: 100,
        source: [
            { ...rect, id: 'group_1', oldId: rect.id, diffX: 20, diffY: 10 },
        ],
    };
    const [, s] = await chart({ shapes: [group], lastSelectedShape: group });
    s.currentTarget = { id: group.id };
    s.initResizeState(s.shapes[0], 'group-scale');
    s.pointerPosition = { x: 400, y: 200 };
    s.resize();
    expect(s.shapes[0]).toMatchObject({ rectWidth: 400, rectHeight: 200 });
    expect(s.shapes[0].source[0]).toMatchObject({
        diffX: 40,
        diffY: 20,
        rectWidth: 200,
        rectHeight: 120,
    });
    s.pointerPosition = { x: 600, y: 300 };
    s.resize();
    expect(s.shapes[0].source[0].rectWidth).toBe(300);
});
test('group copies own child data and rebuild hit identities', async () => {
    const group = {
        id: 'group_1',
        type: 'group',
        x: 150,
        y: 150,
        rectWidth: 200,
        rectHeight: 100,
        source: [
            { ...rect, id: 'group_1', oldId: rect.id, diffX: 20, diffY: 10 },
        ],
    };
    const [, s] = await chart({ shapes: [group], lastSelectedShape: group });
    s.copyPaste();
    const duplicate = s.shapes[1];
    expect(duplicate.source).not.toBe(s.shapes[0].source);
    expect(duplicate.source[0].id).toBe(duplicate.id);
    expect(duplicate.content).not.toContain('id="group_1"');
});
test('pointer release records the final position and cancels the drawing frame', async () => {
    const [, s] = await chart({ shapes: [] }, true);
    s.isSummaryOpen = true;
    await flushPromises();
    s.setToolMode('draw', 'rect');
    s.pointerPosition = { x: 100, y: 100 };
    s.history.begin();
    s.drawDown();
    expect(frames.size).toBe(1);
    s.resetDraw(event(300, 250));
    expect(s.shapes[0]).toMatchObject({
        x: 100,
        y: 100,
        rectWidth: 200,
        rectHeight: 150,
    });
    expect(frames.size).toBe(0);
    expect(s.HISTORY_SIZE.undo).toBe(1);
});
test('closing or canceling a gesture releases capture and stops drawing', async () => {
    const [, s] = await chart({ shapes: [] }, true);
    s.isSummaryOpen = true;
    await flushPromises();
    s.setToolMode('draw', 'line');
    s.drawDown();
    s.toggleSummary();
    expect(s.isDrawing).toBe(false);
    expect(s.isMouseDown).toBe(false);
    expect(frames.size).toBe(0);
});
test('zero-size measurements stay finite and observer disconnects on unmount', async () => {
    const [w, s] = await chart(undefined, true);
    const height = s.svgHeight;
    observers[0].callback([{ contentRect: { width: 0, height: 0 } }]);
    expect(s.svgHeight).toBe(height);
    w.unmount();
    observers[0].callback([{ contentRect: { width: 20, height: 30 } }]);
    expect(s.svgHeight).toBe(height);
    expect(observers[0].disconnect).toHaveBeenCalled();
});
test('save emits a snapshot that later edits cannot mutate', async () => {
    const [w, s] = await chart();
    s.save();
    const saved = w.emitted('saveAnnotations')[0][0];
    s.shapes[0].x = 999;
    expect(saved.shapes[0].x).toBe(150);
    expect(saved.lastSelectedShape.id).toBe(rect.id);
});
test('PDF export waits for image load and restores exact fonts', async () => {
    const [, s] = await chart(undefined, true);
    const wrapper = s.drawSvgContainer;
    const child = wrapper.querySelector('.annotator__content-layer');
    child.setAttribute('font-family', 'Courier');
    child.style.setProperty('font-family', 'serif', 'important');
    const promise = s.print();
    await flushPromises();
    expect(s.isPrinting).toBe(true);
    expect(images).toHaveLength(1);
    expect(exportState.documents).toHaveLength(0);
    images[0].onload();
    await promise;
    expect(s.isPrinting).toBe(false);
    expect(exportState.documents[0].save).toHaveBeenCalledTimes(1);
    expect(exportState.documents[0].addPage).toHaveBeenCalled();
    expect(child.getAttribute('font-family')).toBe('Courier');
    expect(child.style.fontFamily).toBe('serif');
    expect(child.style.getPropertyPriority('font-family')).toBe('important');
    expect(wrapper.hasAttribute('font-family')).toBe(false);
});
test('PDF image errors clear busy state and restore fonts', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const [, s] = await chart(undefined, true);
    const promise = s.print();
    await flushPromises();
    images[0].onerror();
    await promise;
    expect(s.isPrinting).toBe(false);
    expect(s.drawSvgContainer.hasAttribute('font-family')).toBe(false);
});

test('continuous controls do not close a text transaction they do not own', async () => {
    const [, s] = await chart();
    s.startTextEditing(s.shapes[1]);
    s.beginControlEdit();
    s.endControlEdit();
    expect(s.history.isOpen()).toBe(true);
    s.write({ key: '!', preventDefault: vi.fn() });
    s.finishTextEditing();
    s.undoLastShape();
    expect(s.shapes[1].textContent).toBe(text.textContent);
});

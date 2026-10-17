import { describe, expect, test, vi } from 'vitest';
import { computed, nextTick, ref, watch } from 'vue';
import {
    getTableComponent,
    syncTableVisibility,
} from '../src/tableIntegration';

function setup(overrides = {}) {
    return {
        config: ref({
            table: {
                useDialog: true,
                show: false,
                th: { backgroundColor: '#FFFFFF', color: '#123456' },
            },
        }),
        style: ref({
            title: { text: 'Chart', subtitle: { text: 'Subtitle' } },
            backgroundColor: '#EEEEEE',
            color: '#654321',
        }),
        mutableConfig: ref({ showTable: false }),
        dialog: {},
        accordion: {},
        isFullscreen: ref(false),
        parent: ref(document.createElement('div')),
        maxWidth: 500,
        ...overrides,
    };
}

describe('table container configuration', () => {
    test('retains component and parent identity, dialog colors, and responsive width', () => {
        const options = setup({ isCursorPointer: ref(false) });
        const result = getTableComponent(options);
        expect(result.component).toBe(options.dialog);
        expect(result.title).toBe('Chart: Subtitle');
        expect(result.props).toEqual({
            backgroundColor: '#FFFFFF',
            color: '#123456',
            headerBg: '#FFFFFF',
            headerColor: '#123456',
            isFullscreen: false,
            fullscreenParent: options.parent.value,
            forcedWidth: Math.min(500, window.innerWidth * 0.8),
            isCursorPointer: false,
        });
        expect(result.props.fullscreenParent).toBe(options.parent.value);
    });

    test('keeps optional cursor props absent and honors each width limit', () => {
        const options = setup({ maxWidth: 800 });
        const result = getTableComponent(options);
        expect(result.props).not.toHaveProperty('isCursorPointer');
        expect(result.props.forcedWidth).toBe(
            Math.min(800, window.innerWidth * 0.8),
        );
    });

    test('reacts to dialog, permanent table, title and style changes', () => {
        const options = setup();
        const result = computed(() => getTableComponent(options));
        expect(result.value.component).toBe(options.dialog);
        options.config.value.table.show = true;
        options.mutableConfig.value.showTable = true;
        options.style.value.title.subtitle.text = '';
        expect(result.value.component).toBe(options.accordion);
        expect(result.value.title).toBe('Chart');
        expect(result.value.props).toEqual({
            hideDetails: true,
            config: {
                open: true,
                maxHeight: 10000,
                body: { backgroundColor: '#EEEEEE', color: '#654321' },
                head: { backgroundColor: '#EEEEEE', color: '#654321' },
            },
        });
        options.style.value.backgroundColor = '#000000';
        expect(result.value.props.config.body.backgroundColor).toBe('#000000');
        expect(result.value.props.config.body).not.toBe(
            result.value.props.config.head,
        );
    });

    test('preserves separate title sources and XY’s root showTable setting', () => {
        const options = setup({
            titleStyle: ref({
                title: { text: 'Layout', subtitle: { text: '' } },
            }),
        });
        options.config.value.table.show = true;
        options.config.value.showTable = false;
        options.showTable = () => options.config.value.showTable;
        const result = computed(() => getTableComponent(options));
        expect(result.value.component).toBe(options.dialog);
        expect(result.value.title).toBe('Layout');
        options.config.value.showTable = true;
        expect(result.value.component).toBe(options.accordion);
    });

    test('does not read dialog-only refs or window width for an accordion', () => {
        const options = setup();
        options.config.value.table.useDialog = false;
        for (const key of [
            'parent',
            'isFullscreen',
            'isCursorPointer',
            'maxWidth',
        ]) {
            Object.defineProperty(options, key, {
                get: () =>
                    key === 'maxWidth'
                        ? undefined
                        : {
                              get value() {
                                  throw new Error('dialog-only value');
                              },
                          },
            });
        }
        expect(getTableComponent(options).component).toBe(options.accordion);
    });
});

describe('table visibility synchronization', () => {
    test('keeps Vue watcher scheduling and forwards open/close calls', async () => {
        const options = setup();
        const open = vi.fn();
        const close = vi.fn();
        const unit = ref({ open, close });
        const stop = watch(
            () => options.mutableConfig.value.showTable,
            (value) => syncTableVisibility(value, options.config, unit),
        );
        try {
            options.mutableConfig.value.showTable = true;
            expect(open).not.toHaveBeenCalled();
            await nextTick();
            expect(open).toHaveBeenCalledOnce();
            options.mutableConfig.value.showTable = false;
            await nextTick();
            expect(close).toHaveBeenCalledOnce();
            options.config.value.table.show = true;
            options.mutableConfig.value.showTable = true;
            await nextTick();
            expect(open).toHaveBeenCalledOnce();
        } finally {
            stop();
        }
    });

    test('does not require a close method on accordion refs', () => {
        const options = setup();
        expect(() =>
            syncTableVisibility(false, options.config, ref({})),
        ).not.toThrow();
    });
});

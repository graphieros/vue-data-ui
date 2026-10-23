import { defineComponent, h, ref, watch } from 'vue';

// Display the public static renderer's output, rather than mounting an
// interactive chart. Prop changes generate a new SVG string.
export function staticSvgComponent(renderSvg) {
    return defineComponent({
        props: {
            dataset: { type: Array, default: () => [] },
            config: { type: Object, default: () => ({}) },
        },
        setup(props) {
            const svg = ref('');
            const error = ref('');
            watch(
                () => [props.dataset, props.config],
                async ([dataset, config], _, onCleanup) => {
                    let active = true;
                    onCleanup(() => {
                        active = false;
                    });
                    try {
                        const output = await renderSvg({ dataset, config });
                        if (active) {
                            svg.value = output;
                            error.value = '';
                        }
                    } catch (cause) {
                        if (active) {
                            svg.value = '';
                            error.value = String(cause);
                        }
                    }
                },
                { immediate: true, deep: true },
            );
            return () =>
                h('div', {
                    'data-static-svg': '',
                    'data-render-error': error.value || undefined,
                    style: 'width:100%;max-width:800px',
                    innerHTML: svg.value,
                });
        },
    });
}

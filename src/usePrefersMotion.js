import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * Tracks the browser reduced-motion preference while the component is mounted.
 * Call during setup; the initial value is false until mounting reads the preference.
 * @returns {import('vue').Ref<boolean>} Reactive accessibility preference.
 */
export function usePrefersReducedMotion() {
    const prefersReducedMotion = ref(false);

    onMounted(() => {
        const mediaQueryList = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );

        const update = () => {
            prefersReducedMotion.value = mediaQueryList.matches;
        };

        update();

        mediaQueryList.addEventListener('change', update);

        onBeforeUnmount(() => {
            mediaQueryList.removeEventListener('change', update);
        });
    });

    return prefersReducedMotion;
}

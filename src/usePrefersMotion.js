import { ref, onMounted, onBeforeUnmount } from 'vue'

export function usePrefersReducedMotion() {
    const prefersReducedMotion = ref(false)

    onMounted(() => {
        const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)')

        const update = () => {
        prefersReducedMotion.value = mediaQueryList.matches
        }

        update()

        mediaQueryList.addEventListener('change', update)

        onBeforeUnmount(() => {
        mediaQueryList.removeEventListener('change', update)
        })
    })

    return prefersReducedMotion
}
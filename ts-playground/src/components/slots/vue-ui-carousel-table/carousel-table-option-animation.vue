<script setup lang="ts">
import type { VueUiCarouselTableOptionAnimationSlotProps } from 'vue-data-ui/vue-ui-carousel-table';

const props = defineProps<{
    toggleAnimation: VueUiCarouselTableOptionAnimationSlotProps['toggleAnimation'];
    isAnimated: VueUiCarouselTableOptionAnimationSlotProps['isAnimated'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate; font-size: 0.7rem">
            #optionAnimation
        </code>
        <code>
            {{ isAnimated }}
        </code>
    </div>
</template>

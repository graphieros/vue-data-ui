<script setup>
// Execute each chart layer's slot in its own render effect. Selection changes
// then update only layers that consume selection, without adding SVG elements.
defineOptions({
    name: 'XyRenderLayer',
    inheritAttrs: false,
});
</script>

<template>
    <slot />
</template>

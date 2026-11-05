<script setup>
// Keep the loop's internal ref metadata out of the public icon slot props.
defineProps({ actions: Array });
</script>

<template>
    <template v-for="action in actions" :key="action.key">
        <slot :action />
    </template>
</template>

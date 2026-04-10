<script setup lang="ts"></script>

<template>
    <div class="skeleton">
        <code>#skeleton</code>
    </div>
</template>

<style scoped>
/**
 * Make it take the full height and width and displayed only when data is loading
 */
.skeleton {
    position: absolute;
    top: 0;
    left: 0;
    border: 1px dashed chocolate;
    color: chocolate;
}
</style>

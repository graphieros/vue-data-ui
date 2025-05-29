<script setup>
import { ref, computed } from "vue";

defineProps({
    str: {
        type: String,
        default: ''
    }
})
</script>

<template>
    <div :style="{background: 'red', color: 'white'}">
        {{ str }}
    </div>
</template>
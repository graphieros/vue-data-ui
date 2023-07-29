<script setup>

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Array,
        default() {
            return []
        }
    },
})

</script>

<template>
    <div class="vue-ui-donut">
        DONUT
    </div>
</template>
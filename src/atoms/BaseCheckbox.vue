<script setup>
import { ref, computed } from "vue";
import { createUid } from "../lib";

const props = defineProps(['model', 'label', 'cy'])
const uid = ref(createUid())

const emit = defineEmits(['update:model'])

const value = computed({
  get() {
    return props.model
  },
  set(value) {
    emit('update:model', value)
  }
})

</script>

<template>
    <div class="vue-ui-options-item">
        <input :data-cy="cy" type="checkbox" :id="uid" v-model="value">
        <label  :for="uid">{{ label }}</label>
    </div>
</template>
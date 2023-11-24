<script setup>
import { useNestedProp } from "../useNestedProp";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const CONFIG = useNestedProp({
    userConfig: props.config,
    defaultConfig: {
        title: {
            cy: "",
            text: "",
            color: "",
            fontSize: 20,
            bold: true,
        },
        subtitle: {
            cy: "",
            text: "",
            color: "",
            fontSize: 14,
            bold: false,
        },
    }
});

</script>

<template>
  <div
    :data-cy="CONFIG.title.cy"
    :style="`width:100%;text-align:center;color:${
      CONFIG.title.color
    };font-size:${CONFIG.title.fontSize}px;font-weight:${
      CONFIG.title.bold ? 'bold' : ''
    }`"
  >
    {{ CONFIG.title.text }}
  </div>
  <div
    :data-cy="CONFIG.subtitle.cy"
    v-if="CONFIG.subtitle.text"
    :style="`width:100%;text-align:center;color:${
      CONFIG.subtitle.color
    };font-size:${CONFIG.subtitle.fontSize}px;font-weight:${
      CONFIG.subtitle.bold ? 'bold' : ''
    }`"
  >
    {{ CONFIG.subtitle.text }}
  </div>
</template>

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
            textAlign: 'center',
            paddingLeft: 0,
            paddingRight: 0
        },
        subtitle: {
            cy: "",
            text: "",
            color: "",
            fontSize: 14,
            bold: false
        },
    }
});

</script>

<template>
  <div
    :data-cy="CONFIG.title.cy"
    :style="`width: calc(100% - ${CONFIG.title.paddingLeft + CONFIG.title.paddingRight}px); text-align:${CONFIG.title.textAlign};color:${
      CONFIG.title.color
    };font-size:${CONFIG.title.fontSize}px;font-weight:${
      CONFIG.title.bold ? 'bold' : ''
    };padding-left:${CONFIG.title.paddingLeft}px;padding-right:${CONFIG.title.paddingRight}px;`"
  >
    {{ CONFIG.title.text }}
  </div>
  <div
    :data-cy="CONFIG.subtitle.cy"
    v-if="CONFIG.subtitle.text"
    :style="`width: calc(100% - ${CONFIG.title.paddingLeft + CONFIG.title.paddingRight}px); text-align:${CONFIG.title.textAlign};color:${
      CONFIG.subtitle.color
    };font-size:${CONFIG.subtitle.fontSize}px;font-weight:${
      CONFIG.subtitle.bold ? 'bold' : ''
    };padding-left:${CONFIG.title.paddingLeft}px;padding-right:${CONFIG.title.paddingRight}px;`"
  >
    {{ CONFIG.subtitle.text }}
  </div>
</template>

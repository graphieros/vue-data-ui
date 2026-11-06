<script setup>
import { defineAsyncComponent } from 'vue';
import { dataLabel } from '../lib';
const DataTable = defineAsyncComponent(() => import('./DataTable.vue'));
const BaseIcon = defineAsyncComponent(() => import('./BaseIcon.vue'));
defineProps({
    tableComponent: Object,
    dataTable: Object,
    useDialog: Boolean,
    dataLabels: Object,
    rounding: Number,
    isCursorPointer: Boolean,
    setTableRef: Function,
});
defineEmits(['close', 'csv']);
</script>
<template>
    <component
        :is="tableComponent.component"
        v-bind="tableComponent.props"
        :ref="setTableRef"
        @close="$emit('close')"
    >
        <template #title v-if="useDialog">
            {{ tableComponent.title }}
        </template>
        <template #actions v-if="useDialog">
            <button
                tabindex="0"
                class="vue-ui-user-options-button"
                @click="$emit('csv')"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <BaseIcon name="fileCsv" :stroke="tableComponent.props.color" />
            </button>
        </template>
        <template #content>
            <DataTable
                :colNames="dataTable.colNames"
                :head="dataTable.head"
                :body="dataTable.body"
                :config="dataTable.config"
                :title="useDialog ? '' : tableComponent.title"
                :withCloseButton="!useDialog"
                :isCursorPointer="isCursorPointer"
                @close="$emit('close')"
            >
                <template #th="{ th }">
                    <div v-if="th === '__SUM__'">
                        <BaseIcon
                            name="sigma"
                            :stroke="dataTable.config.th.color"
                            :size="16"
                        />
                    </div>
                    <div v-else>{{ th }}</div>
                </template>
                <template #td="{ td }">
                    {{
                        !isNaN(Number(td))
                            ? dataLabel({
                                  p: dataLabels.prefix,
                                  v: td,
                                  s: dataLabels.suffix,
                                  r: rounding,
                              })
                            : td
                    }}
                </template>
            </DataTable>
        </template>
    </component>
</template>

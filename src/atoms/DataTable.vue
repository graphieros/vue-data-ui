<script setup>
import { computed, onMounted, ref } from "vue";
import Shape from "./Shape.vue";
import BaseIcon from "./BaseIcon.vue";

const props = defineProps({
    colNames: {
        type: Array,
        default() {
            return []
        }
    },
    head: Array,
    body: Array,
    title: String,
    config: Object,
});

const { backgroundColor:thbg, color:thc, outline:tho } = props.config.th;
const { backgroundColor:tdbg, color:tdc, outline:tdo } = props.config.td;

const breakpoint = computed(() => {
    return props.config.breakpoint
})

const tableContainer = ref(null)
const isResponsive = ref(false)

onMounted(() => {
    const observer = new ResizeObserver((entries) => {
        entries.forEach(entry => {
            isResponsive.value = entry.contentRect.width < breakpoint.value;
        })
    })
    if(tableContainer.value) {
        observer.observe(tableContainer.value)
    }     
})

const emit = defineEmits(['close'])

</script>

<template>
    <div ref="tableContainer" style="width: 100%; container-type: inline-size; position:relative;padding-top: 36px;overflow:auto" :class="{'atom-data-table': true, 'vue-ui-responsive': isResponsive}">
        <div data-cy="data-table-close" data-dom-to-png-ignore role="button" tabindex="0" :style="`width:32px; position: absolute; top: 0; right:4px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px; width: 32px; cursor:pointer; background:${thbg};`" @click="emit('close')" @keypress.enter="emit('close')">
            <BaseIcon name="close" :stroke="thc" :stroke-width="2" />
        </div>
        <table data-cy="vue-data-ui-table-data" class="vue-ui-data-table">
        <caption :style="{backgroundColor: thbg, color: thc, outline: tho}" class="vue-ui-data-table__caption">
            {{  title }}
        </caption>
            <thead>
                <tr role="row" style="font-variant-numeric: tabular-nums" class="vue-ui-data-table__thead-row" :style="{backgroundColor: thbg, color: thc }">
                    <th role="cell" :style="{outline: tho}" v-for="(th, i) in head" :key="`th_${i}`">
                        <div style="display: flex; align-items:center; justify-content:center; justify-content:flex-end;padding-right: 3px; gap:3px">
                            <svg height="12" width="12" v-if="th.color" viewBox="0 0 20 20" style="background: none;">
                                <circle cx="10" cy="10" r="10" :fill="th.color"/>
                            </svg>
                            <slot name="th" :th="th"/>
                        </div>
                    </th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="(tr, i) in body" role="row" style="font-variant-numeric: tabular-nums;" :class="{'vue-ui-data-table__tbody__row' : true, 'vue-ui-data-table__tbody__row-even': i % 2 === 0, 'vue-ui-data-table__tbody__row-odd': i % 2 !== 0}" :style="{backgroundColor: tdbg, color: tdc }">
                    <td role="cell" v-for="(td, j) in tr" :data-cell="(colNames[j] && colNames[j].name ? colNames[j].name : '') || colNames[j] || ''" :style="{ outline: tdo}" class="vue-ui-data-table__tbody__td">
                        <div dir="auto" style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                            <svg height="12" width="12" v-if="td.color" viewBox="0 0 20 20" style="background: none;overflow: visible">
                                <Shape
                                    :plot="{ x: 10, y: 10 }"
                                    :color="td.color"
                                    :radius="9"
                                    :shape="config.shape || td.shape || 'circle'"
                                />
                            </svg>
                            <slot name="td" :td="td"></slot>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped lang="scss">
.vue-ui-data-table thead {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

table {
    width: 100%;
    padding: 1rem;
    border-collapse:collapse;
}

caption,
th,
td {
    padding: 0.5rem;
    font-variant-numeric: tabular-nums;
}

caption {
    font-size: 1.3rem;
    font-weight: 700;
}

.vue-ui-responsive {
    th {
        display: none;
    }
    td {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem 1rem;
        outline: none !important;
        text-align: left;
    }
    tr {
        outline: v-bind(tdo);
    }

    td:first-child {
        padding-top: 1rem;
    }

    td:last-child {
        padding-bottom: 1rem;
    }

    td::before {
        content: attr(data-cell) ": ";
        font-weight: 700;
        text-transform: capitalize;
    }
}
</style>
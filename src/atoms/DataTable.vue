<script setup>

const props = defineProps({
    head: Array,
    body: Array,
    title: String,
    config: Object
});

const { backgroundColor:thbg, color:thc, outline:tho } = props.config.th;
const { backgroundColor:tdbg, color:tdc, outline:tdo } = props.config.td;

</script>

<template>
    <table data-cy="vue-data-ui-table-data" class="vue-ui-data-table">
        <thead>
            <tr>
                <th :style="{backgroundColor: thbg, color: thc, outline: tho}" :colspan="head.length">
                    {{  title }}
                </th>
            </tr>
            <tr>
                <th :style="{backgroundColor: thbg, color: thc, outline: tho}" v-for="(th, i) in head" :key="`th_${i}`">
                    <div style="display: flex; align-items:center; justify-content:center; justify-content:flex-end;padding-right: 3px;">
                        <svg height="12" width="12" v-if="th.color" viewBox="0 0 20 20" style="background: none;">
                            <circle cx="10" cy="10" r="10" :fill="th.color"/>
                        </svg>
                        <slot name="th" :th="th"/>
                    </div>
                </th>
            </tr>
        </thead>

        <tbody>
            <tr v-for="(tr, i) in body">
                <td v-for="(td, j) in tr" :style="{backgroundColor: tdbg, color: tdc, outline: tdo}">
                    <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                        <svg height="12" width="12" v-if="td.color" viewBox="0 0 20 20" style="background: none;">
                            <circle cx="10" cy="10" r="10" :fill="td.color"/>
                        </svg>
                        <slot name="td" :td="td"></slot>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
table.vue-ui-data-table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-data-table td {
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-data-table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
</style>
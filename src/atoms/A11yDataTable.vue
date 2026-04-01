<script setup>
const props = defineProps({
    uid: { String, required: true },
    head: { Array, default: () => [] },
    body: { Array, default: () => [] },
    caption: { String, default: 'Data table' },
    notice: { String, default: 'A data table is available below.' },
});
</script>

<template>
    <div :id="`chart-data-table-${uid}`" class="sr-only" data-dom-to-png-ignore>
        <p>{{ notice }}</p>
        <table>
            <caption>
                {{
                    caption
                }}
            </caption>
            <thead>
                <tr>
                    <th
                        role="cell"
                        v-for="(th, i) in head"
                        :key="`a11y-head-${i}-${uid}`"
                        scope="col"
                    >
                        <slot name="th" :th="th">
                            {{ th }}
                        </slot>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, i) in body" :key="`a11y-body-${i}-${uid}`">
                    <th scope="row">{{ row[0] }}</th>
                    <td
                        v-for="(td, j) in row.slice(1)"
                        :key="`a11y-cell-${i}-${j}-${uid}`"
                    >
                        <slot name="td" :td="td">
                            {{ td }}
                        </slot>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    clip: rect(0 0 0 0);
    white-space: normal;
    border: 0;
}
</style>

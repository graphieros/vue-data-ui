<script setup>
import { ref, computed } from "vue";
import { VueUiIcon } from "vue-data-ui";

const props = defineProps({
    items: {
        type: Array,
        default() {
            return []
        }
    },
});

const emit = defineEmits([
    'openConfirmDialog',
    'reopenTodo',
])

</script>

<template>
    <div class="card-container">
        <div v-if="items.length === 0" class="empty">
            <VueUiIcon name="legend" stroke="#7A7A7A" :size="36"/>
            <span>No items to display</span>
        </div>

        <div v-for="item in items" class="card">
            <div class="item-actions">
                <button @click="emit('openConfirmDialog', item)" class="btn-red">
                    <VueUiIcon name="trash" :size="20" stroke="#ec9393"/>
                </button>
                <button @click="emit('reopenTodo', item)">
                    <VueUiIcon name="revert" :size="20" stroke="#CCCCCC"/>
                </button>
            </div>

            <div class="item-title">{{ item.title }}</div>
            <div class="item-priority">
                <VueUiIcon name="check" stroke="#42d392"/> Done
                <span>| By {{ item.author }}</span>
                <span>| Created {{ new Date(item.createdAt).toLocaleDateString() }}</span>
                <span v-if="item.createdAt !== item.updatedAt">| Closed {{ new Date(item.updatedAt).toLocaleDateString() }}</span>
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #5A5A5A">
                <div v-if="item.component" class="item-component">
                    <span class="item-label">Component:</span>
                    <span class="item-content">{{ item.component }}</span>
                </div>
                <div v-if="item.description" class="item-description">
                    <span class="item-label">Description:</span>
                    <span class="item-content">{{ item.description }}</span>
                </div>
            </div>

            <details v-if="item.exchanges?.length">
                <summary>Exchanges</summary>
                <div class="exchanges-wrapper">
                    <div class="exchange" v-for="exchange in item.exchanges">
                        <div class="exchange-header">                                    
                            <span>By {{ exchange.author }} | {{ new Date(exchange.createdAt).toLocaleDateString() }}</span>
                        </div>
                        <article>
                            <i>
                                {{ exchange.comment }}
                            </i>
                        </article>
                    </div>
                </div>
            </details>
        </div>
    </div>
</template>

<style scoped src="../assets/todo.css"></style>
<script setup>
import { ref, computed } from "vue";
import { VueUiGizmo, VueUiIcon } from "vue-data-ui";

const props = defineProps({
    items: {
        type: Array,
        default() {
            return []
        }
    },
    priority: {
        type: Object,
    },
    typeColors: {
        type: Object
    }
});

const emit = defineEmits([
    'openConfirmDialog',
    'editTodo',
    'openExchangeDialog',
    'markDone',
    'deleteExchange',
    'toggleChecklist',
    'updateTodo',
    'updateCustomCheckList'
])

const temporaryCustomChecklistItem = ref('');

const now = computed(() => Date.now());

function getElapsedDays(timestamp) {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((now.value - timestamp) / millisecondsPerDay);
}

function resetCustomChecklistItem() {
    temporaryCustomChecklistItem.value = '';
}

function addCustomCheckListItem(item) {
    if (temporaryCustomChecklistItem.value === '') return;
    item.customCheckList[temporaryCustomChecklistItem.value] = false;
    emit('updateCustomCheckList', item);
    resetCustomChecklistItem();
}

function deleteChecklistItem(key, item) {
    delete item.customCheckList[key];
    emit('updateCustomCheckList', item);
    if (Object.keys(item.customCheckList).length === 0) {
        item.withComponentCheckList = false;
        emit('updateTodo', item);
    }
}

function toggleCheckList(item) {
    if (item.withCustomCheckList) {
        item.withCustomCheckList = false;
        item.customCheckList = {};
        emit('updateTodo', item);
    } else if (item.withComponentCheckList) {
        item.withComponentCheckList = false;
        item.checkList = {};
        emit('updateTodo', item);
    } else {
        emit('toggleChecklist', item);
    }
}

function getChecklistDone(item) {
    const done = Object.values(item.checkList).filter(el => !!el).length;
    return done / Object.keys(item.checkList).length * 100;
}

function getCustomChecklistDone(item) {
    const done = Object.values(item.customCheckList).filter(el => !!el).length;
    return done / Object.keys(item.customCheckList).length * 100;
}

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
                <button @click="emit('editTodo', item)">
                    <VueUiIcon name="annotator" :size="20" stroke="#CCCCCC"/>
                </button>
                <button @click="emit('openExchangeDialog', item)">
                    <VueUiIcon name="tooltip" :size="20" stroke="#CCCCCC"/>
                </button>
                <button @click="toggleCheckList(item)" style="position: relative">
                    <VueUiIcon name="legend" :size="20" stroke="#CCCCCC"/>
                    <VueUiIcon name="close" v-if="(Object.keys(item.checkList).length > 0) || item.withCustomCheckList" stroke="#ff3700" :stroke-width="2" :style="{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }"/>
                </button>
                <button @click="emit('markDone', item)" class="btn-green">
                    <VueUiIcon name="check" :size="20" stroke="#42d392"/>
                </button>
            </div>

            <div class="type-badge" :style="{
                backgroundColor: typeColors[item.type],
                color: ['feature', 'docs'].includes(item.type) ? '#1A1A1A' : '#FFFFFF'
            }">{{ item.type.toUpperCase() }}</div>

            <div class="item-title">{{ item.title }}</div>
            <div class="item-priority">
                <div :class="`item-badge priority-${item.priority}`"/>
                <span>{{ priority[item.priority] }} priority</span>
                <span>| By {{ item.author }}</span>
                <span>| Created {{ new Date(item.createdAt).toLocaleDateString() }}</span>
                <span v-if="item.createdAt !== item.updatedAt">| Updated {{ new Date(item.updatedAt).toLocaleDateString() }}</span>
            </div>
            <div style="font-size: 0.8rem;">
                <span style="color: #CCCCCC">
                    Days since creation:
                </span>
                <span style="color: #CCCCCC; font-weight: bold">
                    {{ getElapsedDays(item.createdAt) }}
                </span>
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #5A5A5A">
                <div v-if="item.component" class="item-component">
                    <span class="item-label">Component:</span>
                    <span class="item-content" style="color:#42d392">{{ item.component }}</span>
                </div>
                <div v-if="item.description" class="item-description">
                    <span class="item-label">Description:</span>
                    <span class="item-content">{{ item.description }}</span>
                </div>
            </div>

            <details v-if="Object.keys(item.checkList).length">
                <summary style="display: flex; flex-direction: row; align-items:center; gap: 1rem;">
                    <VueUiGizmo 
                        :dataset="getChecklistDone(item)"
                        :config="{
                            type: 'gauge',
                            size: 36,
                            stroke: '#8A8A8A',
                            color: '#42d392',
                            textColor: '#FFFFFF'
                        }"
                    />
                    Components checklist
                </summary>
                <div class="components-checklist-wrapper">
                    <div v-for="c in Object.keys(item.checkList)" class="components-checklist-item">
                        <label>
                            <input type="checkbox" v-model="item.checkList[c]" @change="emit('updateTodo', item)">
                            <span :style="{
                                color: item.checkList[c] ? '#42d392' : '#CCCCCC',
                                fontWeight: item.checkList[c] ? 'bold' : 'normal'
                            }">{{ c }}</span>
                        </label>
                    </div>
                </div>
            </details>

            <details v-if="item.withCustomCheckList">
                <summary style="display: flex; flex-direction: row; align-items:center; gap: 1rem;">
                    <VueUiGizmo 
                        :dataset="getCustomChecklistDone(item)"
                        :config="{
                            type: 'gauge',
                            size: 36,
                            stroke: '#8A8A8A',
                            color: '#42d392',
                            textColor: '#FFFFFF'
                        }"
                    />
                    Custom checklist
                </summary>
                <div class="components-checklist-wrapper">
                    <div v-for="c in Object.keys(item.customCheckList)" class="components-checklist-item">
                        <button @click="deleteChecklistItem(c, item)" class="btn-red btn-trash">
                            <VueUiIcon name="trash" stroke="#ec9393"/>
                        </button>
                        <label>
                            <input type="checkbox" v-model="item.customCheckList[c]" @change="emit('updateTodo', item)">
                            <span :style="{
                                color: item.customCheckList[c] ? '#42d392' : '#CCCCCC',
                                fontWeight: item.customCheckList[c] ? 'bold' : 'normal'
                            }">{{ c }}</span>
                        </label>
                    </div>
                    <div class="components-checklist-actions">
                        <input ref="inputAddCustom" type="text" v-model="temporaryCustomChecklistItem">
                        <button @click="addCustomCheckListItem(item)" class="action-green btn-plus" :disabled="!temporaryCustomChecklistItem">
                            <VueUiIcon name="plus" stroke="#1A1A1A"/>
                        </button>
                    </div>
                </div>
            </details>

            <details v-if="item.exchanges?.length">
                <summary>Exchanges</summary>
                <div class="exchanges-wrapper">
                    <div class="exchange" v-for="exchange in item.exchanges">
                        <div class="exchange-header">                                    
                            <button @click="emit('deleteExchange', item, exchange)" class="btn-red">
                                <VueUiIcon name="trash" :size="20" stroke="#ec9393"/>
                            </button>
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
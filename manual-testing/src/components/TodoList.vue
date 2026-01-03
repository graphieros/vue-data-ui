<script setup>
import { ref, computed, onMounted } from "vue";
import useCrud from "../composables/useCrud";
import { createUid, treeShake } from "../../../src/lib";
import { VueUiDonut, VueUiHorizontalBar, VueUiIcon } from "vue-data-ui";
import PendingTodoList from "./PendingTodoList.vue";
import DoneTodoList from "./DoneTodoList.vue";

const {
    items,
    toBeDone,
    done,
    isLoading,
    errorMessage,
    readAll,
    createOne,
    updateOne,
    deleteOne,
} = useCrud("/api/items");

onMounted(() => {
    readAll();
});

const dialog = ref(null);
const todoDialog = ref(null);
const exchangeDialog = ref(null);
const confirmDialog = ref(null);

const priority = {
    0: 'Low',
    1: 'Medium',
    2: 'High'
}

const priorityColors = {
    0: '#5f8aee',
    1: '#ff7f0e',
    2: '#e84242'
}

const typeColors = {
    bug: '#e84242',
    feature: '#42d392',
    dev: '#1A1A1A'
}

const todoTemplate = ref({
    title: '',
    component: '',
    description: '',
    priority: 0,
    author: '',
    done: false,
    exchanges: [],
    type: 'feature' // 'feature', 'bug', 'dev'
});

const filters = ref({
    priority: null,
    author: null,
    description: null,
    component: null,
    type: null
});

const noFilters = computed(() => {
    return filters.value.priority == null && filters.value.author == null && filters.value.description === null && filters.value.component == null && filters.value.type == null;
})

function resetFilter(key, all = false) {
    if (all) {
        filters.value = {
            priority: null,
            author: null,
            description: null,
            component: null,
            type: null
        }
    } else {
        filters.value[key] = null;
    }
}

const authors = computed(() => {
    return new Set(...[items.value.map(n => n.author)])
});

const filtered = computed(() => {
    return {
        _todo: toBeDone.value
            .filter(el => filters.value.description ? (el.description).toUpperCase().includes(filters.value.description.toUpperCase()) : true)
            .filter(el => filters.value.author ? el.author === filters.value.author : true)
            .filter(el => ![null, '', undefined].includes(filters.value.priority) ? el.priority == filters.value.priority : true)
            .filter(el => ![null, '', undefined].includes(filters.value.type) ? el.type == filters.value.type : true)
            .filter(el => filters.value.component ? el.component.toUpperCase().includes(filters.value.component.toUpperCase()) : true),
        _done: done.value
            .filter(el => filters.value.description ? (el.description).toUpperCase().includes(filters.value.description.toUpperCase()) : true)
            .filter(el => filters.value.author ? el.author === filters.value.author : true)
            .filter(el => ![null, '', undefined].includes(filters.value.priority) ? el.priority == filters.value.priority : true)
            .filter(el => ![null, '', undefined].includes(filters.value.type) ? el.type == filters.value.type : true)
            .filter(el => filters.value.component ? el.component.toUpperCase().includes(filters.value.component.toUpperCase()) : true),
    }
});

const exchangeTemplate = ref({ author: '', comment: '' });

const pendingTodo = ref(JSON.parse(JSON.stringify(todoTemplate.value)));
const pendingExchange = ref(JSON.parse(JSON.stringify(exchangeTemplate.value)));

function resetPending() {
    pendingTodo.value = JSON.parse(JSON.stringify(todoTemplate.value));
}

function resetExchange() {
    pendingExchange.value = JSON.parse(JSON.stringify(exchangeTemplate.value));
}

const hasErrors = computed(() => {
    return !pendingTodo.value.title || !pendingTodo.value.author || !pendingTodo.value.description;
});

const hasExchangeErrors = computed(() => {
    return !pendingExchange.value.author || !pendingExchange.value.comment;
})

const mode = ref('Create');

function openExchangeDialog(item) {
    pendingTodo.value = item;
    exchangeDialog.value?.showModal();
}

function closeExchangeDialog() {
    resetExchange();
    resetPending();
    exchangeDialog.value?.close();
}

async function addExchange() {
    pendingTodo.value.exchanges.push({
        ...pendingExchange.value,
        id: createUid(),
        createdAt: Date.now()
    });
    await updateTodo();
    closeExchangeDialog();
}

async function deleteExchange(item, exchange) {
    pendingTodo.value = {
        ...item,
        exchanges: item.exchanges.filter(i => i.id !== exchange.id)
    };
    await updateTodo();
    resetPending();
}

function openConfirmDialog(item) {
    pendingTodo.value = item;
    confirmDialog.value?.showModal();
}

function closeConfirmDialog() {
    confirmDialog.value?.close();
    resetPending();
}

function openTodoDialog(_mode = 'Create') {
    _mode === 'Create' && resetPending();
    mode.value = _mode;
    if (!todoDialog.value) return;
    todoDialog.value.showModal();
}

function closeTodoDialog() {
    resetPending();
    if (todoDialog.value) todoDialog.value.close();
}

function editTodo(item) {
    pendingTodo.value = item;
    openTodoDialog('Edit');
}

async function addTodo() {
    await createOne(pendingTodo.value);
    closeTodoDialog();
    readAll();
}

async function updateTodo() {
    await updateOne(pendingTodo.value.id, {
        ...pendingTodo.value,
        updatedAt: Date.now()
    });
    closeTodoDialog();
    readAll();
}

async function deleteTodo(id) {
    await deleteOne(id);
    readAll();
    closeConfirmDialog();
    resetPending();
}

function cancelTodo() {
    closeTodoDialog();
    readAll();
}

async function markDone(item) {
    item.done = true;
    item.updatedAt = Date.now();
    await updateOne(item.id, item);
    readAll();
}

async function reopenTodo(item) {
    item.done = false;
    item.updatedAt = Date.now();
    await updateOne(item.id, item);
    readAll();
}

function openDialog() {
    if (!dialog.value) return;
    if (dialog.value.open) {
        closeDialog();
    }
    dialog.value.showModal();
}

function closeDialog() {
    dialog.value && dialog.value.close();
}

function donutHasDs(d) {
    return d.flatMap(_ => _.values).reduce((a, b) => a + b, 0) > 0
}

function barHasDs(d) {
    return d.map(_ => _.value).reduce((a, b) => a + b, 0) > 0
}

const currentTab = ref(0);

const stats = computed(() => {
    const _ = toBeDone.value;
    const openPriority = Object.groupBy(toBeDone.value, item => item.priority);
    const openAuthor = Object.groupBy(toBeDone.value, item => item.author);
    const donePriority = Object.groupBy(done.value, item => item.priority);
    const doneAuthor = Object.groupBy(done.value, item => item.author);
    const openType = Object.groupBy(toBeDone.value, item => item.type);
    const doneType = Object.groupBy(done.value, item => item.type);
    const commonConfigDonut = {
        theme: 'dark',
        userOptions: { show: false },
        style: {
            chart: {
                backgroundColor: '#4A4A4A',
                height: 330,
                layout: {
                    curvedMarkers: true,
                    donut:{
                        radiusRatio: 0.3,
                    }
                },
                legend: {
                    backgroundColor: '#4A4A4A',
                },
                tooltip: {
                    teleportTo: '#mainDialog',
                    backgroundColor: '#3A3A3A'
                },
                useGradient: false,
            }
        }
    }

    const commonConfigBar = {
        theme: 'dark',
        userOptions: { show: false },
        style: {
            chart: {
                backgroundColor: '#4A4A4A',
                height: 180,
                layout: {
                    bars: {
                        gap: 12,
                        useGradient: false,
                        dataLabels: {
                            offsetX: 12,
                            fontSize: 18,
                        },
                        nameLabels: {
                            offsetX: -12,
                            fontSize: 18,
                        }
                    }
                },
                legend: {
                    show: false,
                    backgroundColor: '#4A4A4A',
                    position: 'bottom'
                },
                tooltip: {
                    teleportTo: '#mainDialog',
                    backgroundColor: '#3A3A3A'
                },
            }
        }
    }

    return {
        type: {
            open: {
                dataset: ['bug', 'feature', 'dev'].map(key => {
                    const items = openType[key] || [];
                    return {
                        name: key,
                        value: items.length,
                        color: typeColors[key]
                    }
                }),
                config: commonConfigBar
            },
            done: {
                dataset: ['bug', 'feature', 'dev'].map(key => {
                    const items = doneType[key] || [];
                    return {
                        name: key,
                        value: items.length,
                        color: typeColors[key]
                    }
                }),
                config: commonConfigBar
            }
        },
        priority: {
            open: {
                dataset: Object.keys(priority).map(key => {
                    const items = openPriority[key] || [];
                    return {
                        name: priority[key],
                        values: [items.length],
                        color: priorityColors[key]
                    }
                }),
                config: commonConfigDonut
            },
            done: {
                dataset: Object.keys(priority).map(key => {
                    const items = donePriority[key] || [];
                    return {
                        name: priority[key],
                        values: [items.length],
                        color: priorityColors[key]
                    }
                }),
                config: commonConfigDonut
            }
        },
        author: {
            open: {
                dataset: Object.keys(openAuthor).map(key => {
                    const items = openAuthor[key] || [];
                    return {
                        name: key,
                        values: [items.length],
                    }
                }),
                config: commonConfigDonut
            },
            done: {
                dataset: (Object.keys(doneAuthor)).map(key => {
                    const items = doneAuthor[key] || [];
                    return {
                        name: key ?? '',
                        values: [items.length ?? 0],
                    }
                }),
                config: commonConfigDonut
            }
        }
    }
})


</script>

<template>
    <button class="open-btn" @click="openDialog()">
        <VueUiIcon name="legend" stroke="#8A8A8A"/>
        <div class="badge" v-if="toBeDone.length">
            {{ toBeDone.length }}
        </div>
    </button>

    <dialog ref="dialog" class="dialog" id="mainDialog">
        <header>
            <VueUiIcon name="legend" stroke="#6A6A6A"/>
            Todo list
            <div class="actions">
                <button @click="openTodoDialog('Create')">
                    <VueUiIcon name="plus" stroke="#2A2A2A"/>
                </button>
            </div>
        </header>
        <button class="btn-close" @click="closeDialog()">
            <VueUiIcon name="blur" stroke="#42d392"/>
            <VueUiIcon name="close" stroke="#5f8aee" style="position: absolute;"/>
        </button>
        <div class="filters">
            <label>
                Type
                <select v-model="filters.type">
                    <option :value="null">All</option>
                    <option>bug</option>
                    <option>feature</option>
                    <option>dev</option>
                </select>
            </label>
            <label>
                Priority
                <select v-model="filters.priority">
                    <option :value="null">All</option>
                    <option v-for="p in Object.keys(priority)" :value="p">{{ priority[p] }}</option>
                </select>
            </label>
            <label>
                Author
                <select v-model="filters.author">
                    <option :value="null">all</option>
                    <option v-for="author in authors">{{ author }}</option>
                </select>
            </label>
            <label class="search-input-wrapper">
                Component
                <VueUiIcon name="magnify" class="search-icon" :size="15" stroke="#9A9A9A"/>
                <input v-model="filters.component" class="search-input" placeholder="...">
            </label>
            <label class="search-input-wrapper">
                Description
                <VueUiIcon name="magnify" class="search-icon" :size="15" stroke="#9A9A9A"/>
                <input v-model="filters.description" class="search-input" placeholder="...">
            </label>
            <button class="reset" @click="resetFilter(null, true)" :disabled="noFilters">
                <VueUiIcon name="revert" stroke="#e76969"/>
            </button>
        </div>
        <div class="tabs">
            <div class="tab" :style="{
                backgroundColor: currentTab === 0 ? '#3A3A3A' : '#212121'
            }">
                <button @click="currentTab = 0" class="counter-button">
                    Open
                    <div class="counter">
                        {{ filtered._todo.length }}
                    </div>
                </button>
            </div>
            <div class="tab" @click="currentTab = 1" :style="{
                backgroundColor: currentTab === 1 ? '#3A3A3A' : '#212121'
            }">
                <button class="counter-button">
                    Closed
                    <div class="counter">
                        {{ filtered._done.length }}
                    </div>
                </button>
            </div>
            <div class="tab" @click="currentTab = 2" :style="{
                backgroundColor: currentTab === 2 ? '#3A3A3A' : '#212121'
            }">
                <button class="counter-button">
                    Stats
                </button>
            </div>
        </div>
        <div class="dialog-content-wrapper">
            <!-- PENDING -->
            <PendingTodoList 
                v-if="currentTab === 0"
                :items="filtered._todo"
                :priority="priority"
                :typeColors="typeColors"
                @openConfirmDialog="openConfirmDialog"
                @editTodo="editTodo"
                @openExchangeDialog="openExchangeDialog"
                @markDone="markDone"
                @deleteExchange="deleteExchange"
            />

            <!-- DONE -->
            <DoneTodoList
                v-if="currentTab === 1"
                :items="filtered._done"
                :typeColors="typeColors"
                :priorityColors="priorityColors"
                @openConfirmDialog="openConfirmDialog"
                @reopenTodo="reopenTodo"
            />

            <!-- STATS -->
            <div v-if="currentTab === 2" class="card-container stats" id="stats">
                <div v-if="toBeDone.length + done.length === 0" class="empty">
                    <VueUiIcon name="chartDonut" stroke="#7A7A7A" :size="36" />
                    <span>No data yet</span>
                </div>
                <template v-else>
                    <div class="card stat" v-if="donutHasDs(stats.priority.open.dataset)">
                        <div class="card-title">Priority - Open</div>
                        <VueUiDonut
                            :dataset="stats.priority.open.dataset"
                            :config="stats.priority.open.config"
                        />
                    </div>
                    <div class="card stat" v-if="barHasDs(stats.type.open.dataset)">
                        <div class="card-title">Type - Open</div>
                        <div class="card-flex">
                            <VueUiHorizontalBar
                                :dataset="stats.type.open.dataset"
                                :config="stats.type.open.config"
                            />
                        </div>
                    </div>
                    <div class="card stat" v-if="donutHasDs(stats.priority.done.dataset)">
                        <div class="card-title">Priority - Closed</div>
                        <VueUiDonut
                            :dataset="stats.priority.done.dataset"
                            :config="stats.priority.done.config"
                        />
                    </div>

                    <div class="card stat" v-if="barHasDs(stats.type.done.dataset)">
                        <div class="card-title">Type - Closed</div>
                        <div class="card-flex">
                            <VueUiHorizontalBar
                                :dataset="stats.type.done.dataset"
                                :config="stats.type.done.config"
                            />
                        </div>
                    </div>
                    <div class="card stat" v-if="donutHasDs(stats.author.open.dataset)">
                        <div class="card-title">Authors - Open</div>
                        <VueUiDonut
                            :dataset="stats.author.open.dataset"
                            :config="stats.author.open.config"
                        />
                    </div>
                    <div class="card stat" v-if="donutHasDs(stats.author.done.dataset)">
                        <div class="card-title">Authors - Closed</div>
                        <VueUiDonut
                            :dataset="stats.author.done.dataset"
                            :config="stats.author.done.config"
                        />
                    </div>
                </template>
            </div>
        </div>
    </dialog>

    <dialog ref="todoDialog" class="todo-dialog">
        <header>
            <div>{{ mode + ' - ' + pendingTodo.title }}</div>
        </header>
        <div class="todo-dialog-content">
            <label>
                Type
                <div class="priority-fields" style="margin-bottom: 1rem">
                    <div class="radio-field">
                        <input type="radio" v-model="pendingTodo.type" value="feature" id="feature">
                        <label for="feature">Feature</label>
                    </div>
                    <div class="radio-field">
                        <input type="radio" v-model="pendingTodo.type" value="bug" id="bug">
                        <label for="bug">Bug</label>
                    </div>
                    <div class="radio-field">
                        <input type="radio" v-model="pendingTodo.type" value="dev" id="dev">
                        <label for="dev">Dev environment</label>
                    </div>
                </div>
            </label>

            <label class="todo-label-inline">
                <div class="todo-label">
                    <VueUiIcon name="person" :size="18" :stroke="!pendingTodo.author ? '#e76969' : '#42d392'"/>
                    Author <span v-if="!pendingTodo.author" class="required">*</span><VueUiIcon v-else name="check" stroke="#42d392" :size="12"/>
                </div>
                <input type="text" v-model="pendingTodo.author" :class="{ error: !pendingTodo.author }" />
            </label>
            <label>
                <div class="todo-label">
                    <VueUiIcon name="clipBoard" :size="18" :stroke="!pendingTodo.title ? '#e76969' : '#42d392'"/>
                    Title <span v-if="!pendingTodo.title" class="required">*</span><VueUiIcon v-else name="check" stroke="#42d392" :size="12"/>
                </div>
                <textarea v-model="pendingTodo.title" :class="{ error: !pendingTodo.title }"/>
            </label>
            <label>
                <div class="todo-label">
                    <VueUiIcon name="boxes" :size="18" stroke="#42d392"/>
                    Component
                </div>
                <textarea v-model="pendingTodo.component" />
            </label>
            <label>
                <div class="todo-label">
                    <VueUiIcon name="annotator" :size="18" :stroke="!pendingTodo.description ? '#e76969' : '#42d392'"/>
                    Description <span v-if="!pendingTodo.description" class="required">*</span><VueUiIcon v-else name="check" stroke="#42d392" :size="12"/>
                </div>
                <textarea v-model="pendingTodo.description" :class="{ error: !pendingTodo.description }"/>
            </label>
            <label>
                Priority
                <div class="priority-fields">
                    <div class="radio-field">
                        <input type="radio" v-model="pendingTodo.priority" :value="0" id="low">
                        <label for="low">Low</label>
                    </div>
                    <div class="radio-field">
                        <input type="radio" v-model="pendingTodo.priority" :value="1" id="medium">
                        <label for="medium">Medium</label>
                    </div>
                    <div class="radio-field">
                        <input type="radio" v-model="pendingTodo.priority" :value="2" id="high">
                        <label for="high">High</label>
                    </div>
                </div>
            </label>
        </div>
        <div class="todo-dialog-actions">
            <button @click="cancelTodo()" class="todo-dialog-action-close">
                CANCEL
            </button>
            <button v-if="mode === 'Create'" :class="{ 'todo-dialog-action-add': true, error: hasErrors }" @click="addTodo" :disabled="hasErrors">
                ADD TODO
            </button>
            <button v-if="mode === 'Edit'" :class="{ 'todo-dialog-action-add': true, error: hasErrors }" @click="updateTodo" :disabled="hasErrors">
                UPDATE TODO
            </button>
        </div>
    </dialog>

    <dialog ref="exchangeDialog"  class="exchange-dialog">
        <header>Add comment</header>

        <label class="todo-label-inline">
            <div class="todo-label">
                <VueUiIcon name="person" :size="18" :stroke="!pendingExchange.author ? '#e76969' : '#42d392'"/>
                Author <span v-if="!pendingExchange.author" class="required">*</span><VueUiIcon v-else name="check" stroke="#42d392" :size="12"/>
            </div>
            <input type="text" v-model="pendingExchange.author" :class="{ error: !pendingExchange.author }" />
        </label>

        <label>
            <div class="todo-label">
                <VueUiIcon name="tooltip" :size="18" :stroke="!pendingExchange.comment ? '#e76969' : '#42d392'"/>
                Comment <span v-if="!pendingExchange.comment" class="required">*</span><VueUiIcon v-else name="check" stroke="#42d392" :size="12"/>
            </div>
            <textarea v-model="pendingExchange.comment" :class="{ error: !pendingExchange.comment }"/>
        </label>

        <div class="todo-dialog-actions">
            <button @click="closeExchangeDialog()" class="todo-dialog-action-close">
                CANCEL
            </button>
            <button @click="addExchange()" :class="{ 'todo-dialog-action-add': true, error: hasExchangeErrors }" :disabled="hasExchangeErrors">
                ADD COMMENT
            </button>
        </div>
    </dialog>

    <dialog ref="confirmDialog" class="confirm-dialog">
        Delete <span style="color: #CCCCCC; font-weight: bold; color: #e76969;">{{ pendingTodo.title }}</span> ?
        <div class="cancel-wrapper">
            <button @click="closeConfirmDialog()" class="btn-red">
                <VueUiIcon name="close" stroke="#e76969" :size="36"/>
            </button>
            <button @click="deleteTodo(pendingTodo.id)" class="btn-green">
                <VueUiIcon name="check" stroke="#42d392" :size="36"/>
            </button>
        </div>
    </dialog>
</template>

<style scoped src="../assets/todo.css"></style>
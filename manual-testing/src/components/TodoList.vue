<script setup>
import { ref, computed, onMounted } from "vue";
import useCrud from "../composables/useCrud";
import { createUid, treeShake } from "../../../src/lib";
import { VueUiDonut, VueUiIcon } from "vue-data-ui";

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
    console.log(items.value);
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

const todoTemplate = ref({
    title: '',
    component: '',
    description: '',
    priority: 0,
    author: '',
    done: false,
    exchanges: [],
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

const currentTab = ref(0);

const stats = computed(() => {
    const _ = toBeDone.value;
    const openPriority = Object.groupBy(toBeDone.value, item => item.priority);
    const openAuthor = Object.groupBy(toBeDone.value, item => item.author);
    const donePriority = Object.groupBy(done.value, item => item.priority);
    const doneAuthor = Object.groupBy(done.value, item => item.author);
    const commonConfig = {
        theme: 'dark',
        style: {
            chart: {
                backgroundColor: '#4A4A4A',
                height: 330,
                layout: {
                    curvedMarkers: true,
                    donut:{
                        radiusRatio: 0.4,
                        strokeWidth: 80
                    }
                },
                legend: {
                    backgroundColor: '#4A4A4A',
                },
                title: {
                    textAlign: 'left',
                    fontSize: 16
                },
                useGradient: false,
            }
        }
    }
    return {
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
                config: treeShake({
                    defaultConfig: commonConfig,
                    userConfig: {
                        style: {
                            chart: {
                                title: {
                                    text: 'Priority - Open'
                                }
                            }
                        }
                    }
                })
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
                config: treeShake({
                    defaultConfig: commonConfig,
                    userConfig: {
                        style: {
                            chart: {
                                title: {
                                    text: 'Priority - Done'
                                }
                            }
                        }
                    }
                })
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
                config: treeShake({
                    defaultConfig: commonConfig,
                    userConfig: {
                        style: {
                            chart: {
                                title: {
                                    text: 'Authors - Open'
                                }
                            }
                        }
                    }
                })
            },
            done: {
                dataset: (Object.keys(doneAuthor)).map(key => {
                    const items = doneAuthor[key] || [];
                    return {
                        name: key ?? '',
                        values: [items.length ?? 0],
                    }
                }),
                config: treeShake({
                    defaultConfig: commonConfig,
                    userConfig: {
                        style: {
                            chart: {
                                title: {
                                    text: 'Authors - Done'
                                }
                            }
                        }
                    }
                })
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

    <dialog ref="dialog" class="dialog">
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
            <VueUiIcon name="close"/>
        </button>
        <div class="tabs">
            <div class="tab" :style="{
                backgroundColor: currentTab === 0 ? '#3A3A3A' : '#212121'
            }">
                <button @click="currentTab = 0" class="counter-button">
                    Open
                    <div class="counter">
                        {{ toBeDone.length }}
                    </div>
                </button>
            </div>
            <div class="tab" @click="currentTab = 1" :style="{
                backgroundColor: currentTab === 1 ? '#3A3A3A' : '#212121'
            }">
                <button class="counter-button">
                    Closed
                    <div class="counter">
                        {{ done.length }}
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
            <div v-if="currentTab === 0" class="card-container">
                <div v-if="toBeDone.length === 0" class="empty">
                    <VueUiIcon name="legend" stroke="#7A7A7A" :size="36"/>
                    <span>No items to display</span>
                </div>
                <div v-for="item in toBeDone" class="card">
                    <div class="item-actions">
                        <button @click="openConfirmDialog(item)" class="btn-red">
                            <VueUiIcon name="trash" :size="20" stroke="#ec9393"/>
                        </button>
                        <button @click="editTodo(item)">
                            <VueUiIcon name="annotator" :size="20" stroke="#CCCCCC"/>
                        </button>
                        <button @click="openExchangeDialog(item)">
                            <VueUiIcon name="tooltip" :size="20" stroke="#CCCCCC"/>
                        </button>
                        <button @click="markDone(item)" class="btn-green">
                            <VueUiIcon name="check" :size="20" stroke="#42d392"/>
                        </button>
                    </div>

                    <div class="item-title">{{ item.title }}</div>
                    <div class="item-priority">
                        <div :class="`item-badge priority-${item.priority}`"/>
                        <span>{{ priority[item.priority] }} priority</span>
                        <span>| By {{ item.author }}</span>
                        <span>| Created {{ new Date(item.createdAt).toLocaleDateString() }}</span>
                        <span v-if="item.createdAt !== item.updatedAt">| Updated {{ new Date(item.updatedAt).toLocaleDateString() }}</span>
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
                                    <button @click="deleteExchange(item, exchange)" class="btn-red">
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

            <!-- DONE -->
            <div v-if="currentTab === 1" class="card-container">
                <div v-if="done.length === 0" class="empty">
                    <VueUiIcon name="legend" stroke="#7A7A7A" :size="36"/>
                    <span>No items to display</span>
                </div>

                <div v-for="item in done" class="card">
                    <div class="item-actions">
                        <button @click="openConfirmDialog(item)" class="btn-red">
                            <VueUiIcon name="trash" :size="20" stroke="#ec9393"/>
                        </button>
                        <button @click="reopenTodo(item)">
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

            <!-- STATS -->
            <div v-if="currentTab === 2" class="card-container stats">
                <div v-if="toBeDone.length + done.length === 0" class="empty">
                    <VueUiIcon name="chartDonut" stroke="#7A7A7A" :size="36" />
                    <span>No data yet</span>
                </div>
                <template v-else>
                    <div class="card stat" v-if="donutHasDs(stats.priority.open.dataset)">
                        <VueUiDonut
                            :dataset="stats.priority.open.dataset"
                            :config="stats.priority.open.config"
                        />
                    </div>
                    <div class="card stat" v-if="donutHasDs(stats.priority.done.dataset)">
                        <VueUiDonut
                            :dataset="stats.priority.done.dataset"
                            :config="stats.priority.done.config"
                        />
                    </div>
                    <div class="card stat" v-if="donutHasDs(stats.author.open.dataset)">
                        <VueUiDonut
                            :dataset="stats.author.open.dataset"
                            :config="stats.author.open.config"
                        />
                    </div>
                    <div class="card stat" v-if="donutHasDs(stats.author.done.dataset)">
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

<style scoped>
    .open-btn {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        width: 4rem;
        height: 4rem;
        background-color: #2A2A2A;
        border-radius: 0.5rem;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .open-btn:hover {
        background-color: #3A3A3A;
    }

    .badge {
        position: absolute;
        top: -0.25rem;
        right: -0.25rem;
        padding: 0.3rem 0.35rem;
        border-radius: 1rem;
        background: #7c9fef;
        color: #1A1A1A;
        height: 1rem;
        font-weight: bold;
        width: fit-content;
        display: flex;
        align-items:center;
        font-size: 0.6rem;
        box-shadow: 0 3px 6px rgba(0 0 0 / 0.6);
    }

    .dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 80vh;
        width: 80vw;
        max-width: 800px;
        background: #2A2A2A;
        border: 1px solid #4A4A4A;
        border-radius: 1rem;
    }

    .dialog header,
    .todo-dialog header,
    .exchange-dialog header {
        background: linear-gradient(90deg, #42d392, #5f8aee);
        background-size: 100% 100%;
        background-repeat: no-repeat;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        color: transparent;
        font-weight: 900 !important;
        font-size: 1.5rem;
        width: fit-content;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .btn-close {
        position: absolute;
        top: 1rem;
        right: 1rem;
        border: none;
        cursor: pointer;
        background-color: #2A2A2A;
        display: flex;
        align-items:center;
        justify-content:center;
        border-radius: 50%;
        transition: background-color 0.2s;
        height: fit-content;
        width: fit-content;
        padding: 0.25rem;
    }
    .btn-close:hover {
        background-color: #3A3A3A;
    }
    .dialog-content-wrapper {
        display: flex;
        width: 100%;
        height: calc(100% - 5rem);
        background: #3A3A3A;
        border-radius: 0 0.25rem 0.5rem 0.5rem;
    }
    .tabs {
        background: transparent;
        display: flex;
        flex-direction: row;
        gap: 0.2rem;
        margin-top: 1rem;
    }
    .tab {
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem 0.25rem 0 0;
        cursor: pointer;
        transition: background-color 0.2s;
    }
    .tab button {
        background: transparent;
        border: none;
        color: #CCCCCC;
        cursor: pointer;
        font-weight: bold;
    }
    .actions {
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }
    .actions button {
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
        display: flex;
        align-items:center;
        justify-content:center;
        padding: 0.25rem;
        width: 2rem;
        height: 2rem;
        border-radius: 0.25rem;
        background-color:#5f8aee;
        box-shadow: 0 3px 6px -3px black;
    }
    .actions button:hover {
        background-color: #81a2f0;
    }
    .todo-dialog,
    .exchange-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        height: 70vh;
        width: 100vw;
        max-width: 400px;
        background: #3A3A3A;
        border: 1px solid #7A7A7A;
        border-radius: 0.5rem;
        box-shadow: 0 6px 12px -6px black;
        overflow-x: hidden;
    }
    .exchange-dialog {
        height: 305px;
    }
    .todo-dialog header,
    .exchange-dialog header {
        line-height: 1.5rem;
        align-items: start;
        gap: 1rem;
        width: calc(100% + 2rem);
        margin-left: -1rem;
        margin-top: -1rem;
        padding: 1rem;
        border-bottom: 1px solid #7A7A7A;
        margin-bottom: 1rem;
    }
    .todo-dialog-content {
        width: 100%;
        height: calc(100% - 9rem);
        overflow-y: auto;
        margin-bottom: 1.3rem;
    }
    .todo-dialog-actions {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        align-items:center;
        justify-content: flex-end;
    }
    .todo-dialog-actions button {
        border: none;
        cursor: pointer;
        padding: 0.5rem 0.5rem;
        border-radius: 0.25rem;
    }
    .todo-dialog-action-close {
        background-color: #4A4A4A;
        color: #CCCCCC;
        transition: background-color 0.2s;
    }
    .todo-dialog-action-close:hover {
        background-color: #5A5A5A;
    }
    .todo-dialog-action-add {
        background-color:#42d392;
        transition: background-color 0.2s;
    }
    .todo-dialog-action-add:hover {
        background-color:#75e6b3;
    }
    .todo-dialog-content label,
    .exchange-dialog label {
        display: flex;
        flex-direction: column;
        color: #CCCCCC;
        gap: 0.25rem;
    }
    textarea {
        width: 99%;
        max-width: 99%;
        min-width: 99%;
        max-height: 200px;
        min-height: 4rem;
        background: #5A5A5A;
        color: white;
        padding: 0.5rem;
        margin: 0 auto;
        margin-bottom: 1rem;
        border-radius: 0.25rem;
    }
    textarea:focus {
        outline: 1px solid #42d392;
    }
    input[type="text"] {
        background: #5A5A5A;
        width: 99%;
        max-width: 99%;
        color: white;
        padding: 0.5rem;
        margin: 0 auto;
        margin-bottom: 1rem;
        border-radius: 0.25rem;
        border: none;
    }
    .priority-fields {
        display: flex;
        gap: 2rem;
    }
    .radio-field {
        display: flex;
        gap: 0.5rem;
    }
    .radio-field label {
        cursor: pointer;
    }
    input[type="radio"] {
        accent-color: #42d392;
        cursor: pointer;
    }
    .todo-label {
        display: flex;
        align-items:center;
        gap: 0.5rem;
        padding: 0 0.25rem;
    }
    .card-container {
        height: 100%;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1rem;
        width: 100%;
    }
    .card {
        width: 100%;
        padding: 0.5rem;
        border: 1px solid #5A5A5A;
        background-color: #4A4A4A;
        border-radius: 0.25rem;
        box-shadow: 0 3px 6px rgb(0 0 0 / 0.3);
        position:relative;
    }
    .item-badge {
        height: 0.75rem;
        width: 0.75rem;
        border-radius: 50%;
        border-top: 1px solid #E1E5E8;
        box-shadow: 0 3px 6px -1px black;
    }
    .priority-0 {
        background-color:#5f8aee;
    }
    .priority-1 {
        background-color: #ff7f0e;
    }
    .priority-2 {
        background-color: #e84242;
    }
    .item-priority {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
        align-items:center;
        font-size: 0.8rem;
        color: #CCCCCC;
    }
    .item-title {
        color: #CCCCCC;
        font-weight: bold;
        font-size: 1.2rem;
        padding-right: 160px;
    }
    .item-label {
        color: #9A9A9A;
    }
    .item-content {
        color: #CCCCCC;
        font-weight: bold;
        margin-left: 0.5rem;
    }
    .item-actions {
        position: absolute;
        top: 0.25rem;
        right: 0.25rem;
        display: flex;
        gap: 0.5rem;
    }
    .item-actions button {
        background-color: #5A5A5A;
        border: none;
        padding: 0.25rem;
        width: 2rem;
        height: 2rem;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
        cursor: pointer;
        display: flex;
        align-items:center;
        justify-content:center;
        box-shadow: 0 3px 6px rgb(0 0 0 / 0.3);
    }
    .item-actions button:hover {
        background-color: #6A6A6A;
    }
    .btn-green {
        background-color: #42d39230 !important;
    }
    .btn-green:hover {
        background-color: #42d39250 !important;
    }
    .btn-red {
        background-color: #e7696930 !important;
    }
    .btn-red:hover {
        background-color: #e7696950 !important;
    }
    .empty {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        justify-content:center;
        align-items:center;
        gap:1rem;
        color: #7A7A7A;
    }
    .counter-button {
        display: flex;
        flex-direction: row;
        gap: 0.75rem;
    }
    .counter {
        display: flex;
        align-items:center;
        justify-content: center;
        border-radius: 1rem;
        padding: 0 0.3rem;
        font-size: 0.8rem;
        font-weight: bold;
    }
    .error {
        background-color:#453131 !important;
        outline: 1px solid #e84242;
        color: #e76969;
    }
    .error:focus {
        outline: 1px solid #e84242 !important;
    }
    .required {
        color: #e76969;
    }
    .confirm-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #4A4A4A;
        border: 1px solid #e76969;
        border-radius: 0.5rem;
        box-shadow: 0 6px 12px rgb(0 0 0 / 0.3);
        color: white;
        max-width: 300px;
    }
    .cancel-wrapper {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        padding: 1rem;
        justify-content:center;
    }
    .confirm-dialog button {
        border: none;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        color: white;
        font-size: 1rem;
        box-shadow: 0 3px 6px rgb(0 0 0 / 0.3);
        cursor: pointer;
        display: flex;
        align-items:center;
        justify-content: center;
        height: 64px;
        width: 64px;
    }
    summary {
        background-color: #FFFFFF10;
        color: #CCCCCC;
        cursor: pointer;
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        user-select: none;
    }
    details[open] summary {
        border-radius: 0.5rem 0.5rem 0 0;
    }
    .exchanges-wrapper {
        background-color: #FFFFFF10;
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .exchange-header {
        display: flex;
        align-items:center;
        gap: 0.5rem;
        color: #CCCCCC;
        margin-bottom: 1rem;
        font-size: 0.8rem;
    }
    .exchange-header button {
        background-color: #5A5A5A;
        border: none;
        padding: 0.25rem;
        width: 2rem;
        height: 2rem;
        border-radius: 0.25rem;
        transition: background-color 0.2s;
        cursor: pointer;
        display: flex;
        align-items:center;
        justify-content:center;
        box-shadow: 0 3px 6px rgb(0 0 0 / 0.3);
    }
    .exchange {
        width: 100%;
        padding: 0.5rem;
        background-color: #FFFFFF10;
        border-radius: 0.25rem;
    }
    .exchange article {
        color: #E1E5E8;
    }
    .stats {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 16px;
    }

    .stat {
        flex: 0 0 calc(50% - 8px);
        aspect-ratio: 1 / 1;
        min-width: 0;
        overflow: hidden;
        height: fit-content;
    }
</style>
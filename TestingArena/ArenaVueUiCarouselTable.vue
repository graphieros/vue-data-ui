<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiCarouselTable from '../src/components/vue-ui-carousel-table.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels, toggleStack } = useArena()

const model = ref([
    { key: 'responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800 },
    { key: 'animation.type', def: 'scroll', type:'select', options: ['scroll', 'marquee']},
    { key: 'animation.use', def: true, type: 'checkbox'},
    { key: 'animation.speedMs', def: 1000, type: 'number', type: 'range', min: 200, max: 2000},
    { key: 'animation.pauseOnHover', def: true, type: 'checkbox'},
    { key: 'border.size', def: 0, type: 'number', min: 0, max: 12 },
    { key: 'border.color', def: '#1A1A1A', type: 'color'},
    
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.fontFamily', def: 'inherit', type: 'text' },
    
    { key: 'caption.text', def: '', type: 'text'},

    { key: 'caption.padding.top', def: 12, type: 'number', min: 0, max: 24},
    { key: 'caption.padding.right', def: 12, type: 'number', min: 0, max: 24},
    { key: 'caption.padding.bottom', def: 12, type: 'number', min: 0, max: 24},
    { key: 'caption.padding.left', def: 12, type: 'number', min: 0, max: 24},

    { key: 'caption.style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'caption.style.color', def: '#1A1A1A', type: 'color'},
    { key: 'caption.style.fontSize', def: '16px', type: 'text'},
    { key: 'caption.style.fontWeight', def: 'bold', type: 'text'},
    { key: 'caption.style.textAlign', def: 'left', type: 'select', options: ['left', 'center', 'right']},

    { key: 'scrollbar.showOnlyOnHover', def: false, type: 'checkbox'},
    { key: 'scrollbar.hide', def: false, type: 'checkbox'},

    { key: 'thead.tr.style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'thead.tr.style.boxShadow', def: '0px 6px 12px -6px #1A1A1A50' },

    { key: 'thead.tr.border.size', def: 0, type: 'number', min: 0, max: 12 },
    { key: 'thead.tr.border.color', def: '#1A1A1A', type: 'color'},
    { key: 'thead.tr.th.border.size', def: 0, type: 'number', min: 0, max: 12 },
    { key: 'thead.tr.th.border.color', def: '#1A1A1A', type: 'color'},
    { key: 'thead.tr.th.style.textAlign', def: 'right', type: 'select', options: ['left', 'center', 'right']},
    { key: 'thead.tr.th.style.fontVariantNumeric', def: 'tabular-nums', type: 'text'},

    { key: 'thead.tr.th.padding.top', def: 0, type: 'number', min: 0, max: 24},
    { key: 'thead.tr.th.padding.right', def: 12, type: 'number', min: 0, max: 24},
    { key: 'thead.tr.th.padding.bottom', def: 0, type: 'number', min: 0, max: 24},
    { key: 'thead.tr.th.padding.left', def: 0, type: 'number', min: 0, max: 24},
    
    { key: 'tbody.tr.visible', def: 5, type: 'number', min: 1, max: 100},
    { key: 'tbody.tr.height', def: 32, type: 'number', min: 12, max: 100 },
    { key: 'tbody.tr.style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'tbody.tr.style.color', def: '#1A1A1A', type: 'color'},

    { key: 'tbody.tr.border.size', def: 0, type: 'number', min: 0, max: 12 },
    { key: 'tbody.tr.border.color', def: '#1A1A1A', type: 'color'},

    { key: 'tbody.tr.td.alternateColor', def: true, type: 'checkbox'},
    { key: 'tbody.tr.td.alternateOpacity', def: 0.5, type: 'range', min: 0, max: 1, step: 0.01},
    { key: 'tbody.tr.td.style.fontVariantNumeric', def: 'tabular-nums', type: 'text'},
    { key: 'tbody.tr.td.style.textAlign', def: 'right', type:'select', options: ['left', 'center', 'right']},
    { key: 'tbody.tr.td.style.backgroundColor', def: '#e1e5e8', type: 'color' },

    { key: 'tbody.tr.td.border.size', def: 0, type: 'number', min: 0, max: 12 },
    { key: 'tbody.tr.td.border.color', def: '#1A1A1A', type: 'color'},

    { key: 'tbody.tr.td.padding.top', def: 0, type: 'number', min: 0, max: 24},
    { key: 'tbody.tr.td.padding.right', def: 12, type: 'number', min: 0, max: 24},
    { key: 'tbody.tr.td.padding.bottom', def: 0, type: 'number', min: 0, max: 24},
    { key: 'tbody.tr.td.padding.left', def: 0, type: 'number', min: 0, max: 24},

    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.animation', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox' },
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptions.buttonTitles.pdf', def: 'DOWNLOAD PDF', type: 'text'},
    { key: 'userOptions.buttonTitles.csv', def: 'DOWNLOAD CSV', type: 'text'},
    { key: 'userOptions.buttonTitles.img', def: 'DOWNLOAD PNG', type: 'text'},
    { key: 'userOptions.buttonTitles.animation', def: 'TOGGLE ANIMATION', type: 'text'},
    { key: 'userOptions.buttonTitles.fullscreen', def: 'TOGGLE FULLSCREEN', type: 'text'},
    { key: 'userOptions.buttonTitles.open', def: 'OPEN OPTIONS', type: 'text'},
    { key: 'userOptions.buttonTitles.close', def: 'CLOSE OPTIONS', type: 'text'},
])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c
    }
})

function generateBody(n) {
    let arr = [];
    for (let i = 0; i < n; i += 1) {
        arr.push([
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
            Math.round(Math.random()*Math.random()*1000000),
        ])
    }
    return arr
}

const dataset = ref({
    head: ['Column 1 has a long name', 'col2', 'col3', 'col4', 'col 5', 'col 6', 'col 7'],
    body: generateBody(12)
})

const step = ref(0)

const localComponent = ref(null);
const buildComponent = ref(null);
const vduiLocalComponent = ref(null);
const vduiBuildComponent = ref(null);

function toggleAnimLocal() {
    localComponent.value.toggleAnimation();
}
function pauseLocal() {
    localComponent.value.pauseAnimation();
}
function resumeLocal() {
    localComponent.value.resumeAnimation();
}

function toggleAnimVduiLocal() {
    vduiLocalComponent.value.toggleAnimation();
}

function pauseVduiLocal() {
    vduiLocalComponent.value.pauseAnimation();
}

function resumeVduiLocal() {
    vduiLocalComponent.value.resumeAnimation();
}

function toggleAnimBuild() {
    if(buildComponent.value) {
        buildComponent.value.toggleAnimation();
    }
}

function pauseBuild() {
    buildComponent.value.pauseAnimation();
}

function resumeBuild() {
    buildComponent.value.resumeAnimation();
}

function toggleAnimVduiBuild() {
    if(vduiBuildComponent.value) {
        vduiBuildComponent.value.toggleAnimation();
    }
}

function pauseVduiBuild() {
    vduiBuildComponent.value.pauseAnimation();
}

function resumeVduiBuild() {
    vduiBuildComponent.value.resumeAnimation();
}
    
</script>

<template>
    <Box>
        <template #title>VueUiCarouselTable</template>

        <template #local>
            <button @click="toggleAnimLocal">TOGGLE ANIMATION (public)</button>
            <button @click="pauseLocal">PAUSE ANIMATION (public)</button>
            <button @click="resumeLocal">RESUME ANIMATION (public)</button>
            <LocalVueUiCarouselTable
                :config="config"
                :dataset="dataset"
                ref="localComponent"
            >
                <template #th="{th}">
                    {{ th }}
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiCarouselTable>
        </template>

        <template #VDUI-local>
            <button @click="toggleAnimVduiLocal">TOGGLE ANIMATION (public)</button>
            <button @click="pauseVduiLocal">PAUSE ANIMATION (public)</button>
            <button @click="resumeVduiLocal">RESUME ANIMATION (public)</button>
            <LocalVueDataUi
                component="VueUiCarouselTable"
                ref="vduiLocalComponent"
                :config="config"
                :dataset="dataset"
            >

            </LocalVueDataUi>
        </template>

        <template #build>
            <button @click="toggleAnimBuild">TOGGLE ANIMATION (public)</button>
            <button @click="pauseBuild">PAUSE ANIMATION (public)</button>
            <button @click="resumeBuild">RESUME ANIMATION (public)</button>
            <VueUiCarouselTable
                ref="buildComponent"
                :dataset="dataset"
                :config="config"
            >
            </VueUiCarouselTable>
        </template>

        <template #VDUI-build>
            <button @click="toggleAnimVduiBuild">TOGGLE ANIMATION (public)</button>
            <button @click="pauseVduiBuild">PAUSE ANIMATION (public)</button>
            <button @click="resumeVduiBuild">RESUME ANIMATION (public)</button>
            <VueDataUi
                ref="vduiBuildComponent"
                component="VueUiCarouselTable"
                :dataset="dataset"
                :config="config"
            >

            </VueDataUi>
        </template>

        <template #knobs>
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type" :min="knob.min ?? 0"
                            :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
                        <select v-if="knob.type === 'select'" v-model="knob.def" @change="step += 1">
                            <option v-for="opt in knob.options">{{ opt }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </template>

        <template #config>
            {{ config }}
        </template>
    
    </Box>
</template>
<script setup>
import { computed, ref, shallowRef, watch } from 'vue';
import LocalVueUiGraph from '../src/components/vue-ui-graph.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import { VueUiGraph, VueDataUi } from 'vue-data-ui';
import { VueUiGraph as VueUiGraphTreeshaken } from 'vue-data-ui/vue-ui-graph';
import Box from './Box.vue';
import ConfigKnobs from './ConfigKnobs.vue';
import convertArrayToObject from './convertModel';
import { useConfigurationControls } from './createConfigModel';
import useThemeOptions from './useThemeOptions';
import { useArena } from '../src/useArena';
import { useConfig } from '../src/useConfig';
import { treeShake } from '../src/lib';
import { graphExamples } from '../src/graph/examples';

const { local, build, vduiLocal, vduiBuild } = useArena();
const graphDefaults = useConfig().vue_ui_graph;
const DEFAULT_CONFIG = {
    ...graphDefaults,
    responsive: false,
    userOptions: {
        ...graphDefaults.userOptions,
        annotator: { ...graphDefaults.userOptions.annotator, followZoom: true },
    },
};
const { CHECKBOX, NUMBER, TEXT, COLOR, SELECT, createModel } =
    useConfigurationControls(DEFAULT_CONFIG);
const { currentTheme, themeOptions } = useThemeOptions();
const selectedExample = ref(0);
const example = computed(() => graphExamples[selectedExample.value]);
const dataset = computed(() => example.value.dataset);
const selections = {
    'style.chart.nodes.labels.position': ['top', 'bottom'],
    'style.chart.controls.position': ['top', 'bottom'],
    'style.chart.title.textAlign': ['left', 'center', 'right'],
    'tooltip.position': ['left', 'center', 'right'],
    'userOptions.position': ['left', 'right'],
    'userOptions.print.orientation': ['auto', 'l', 'p'],
};

// Use the same controls as other arenas, covering all scalar graph settings.
function controlsFor(object, prefix = '') {
    return Object.entries(object).flatMap(([key, value]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        if (
            value === null ||
            Array.isArray(value) ||
            path === 'theme' ||
            path === 'responsive'
        )
            return [];
        if (selections[path]) return [SELECT(path, selections[path])];
        if (typeof value === 'object') return controlsFor(value, path);
        if (typeof value === 'boolean') return [CHECKBOX(path)];
        if (typeof value === 'number')
            return [
                NUMBER(path, {
                    min:
                        path === 'layout.chargeStrength'
                            ? -2000
                            : path === 'style.chart.nodes.labels.offsetY'
                              ? -1000
                              : 0,
                    max: Math.max(1000, Math.abs(value) * 5),
                    step: /Strength|friction|opacity|theta|Width|Radius|radius/i.test(
                        path,
                    )
                        ? 0.01
                        : 1,
                }),
            ];
        if (typeof value === 'string')
            return [/color$/i.test(key) ? COLOR(path) : TEXT(path)];
        return [];
    });
}
const model = createModel(controlsFor(DEFAULT_CONFIG));
const baseline = shallowRef(DEFAULT_CONFIG);
const baselineValues = shallowRef(new Map());
const getValue = (object, path) =>
    path.split('.').reduce((value, key) => value?.[key], object);
function resolvedExample() {
    const resolved = treeShake({
        defaultConfig: DEFAULT_CONFIG,
        userConfig: example.value.config,
    });
    resolved.style = {
        ...resolved.style,
        chart: {
            ...resolved.style.chart,
            title: {
                ...resolved.style.chart.title,
                text: resolved.style.chart.title.text || example.value.name,
                subtitle: {
                    ...resolved.style.chart.title.subtitle,
                    text:
                        resolved.style.chart.title.subtitle.text ||
                        `${dataset.value.nodes.length} nodes · ${dataset.value.links.length} links`,
                },
            },
        },
    };
    return resolved;
}
function syncControls(resolved) {
    const values = new Map();
    for (const control of model.value) {
        const value = getValue(resolved, control.key);
        control.def = value;
        values.set(control.key, value);
    }
    baseline.value = resolved;
    baselineValues.value = values;
}
watch(selectedExample, () => syncControls(resolvedExample()), {
    immediate: true,
});
const config = computed(() => {
    const changes = convertArrayToObject(
        model.value.filter(
            (control) =>
                !Object.is(control.def, baselineValues.value.get(control.key)),
        ),
    );
    return treeShake({
        defaultConfig: baseline.value,
        userConfig: {
            ...changes,
            responsive: false,
        },
    });
});
// Theme-only and default previews deliberately ignore knob edits, like other arenas.
const configTheme = computed(() => ({
    responsive: false,
    theme: currentTheme.value,
    layout: baseline.value.layout,
    performance: baseline.value.performance,
    style: {
        chart: {
            title: {
                text: example.value.name,
                subtitle: { text: 'Theme preview' },
            },
            nodes: {
                minRadius: baseline.value.style.chart.nodes.minRadius,
                maxRadius: baseline.value.style.chart.nodes.maxRadius,
                sizeByValue: baseline.value.style.chart.nodes.sizeByValue,
                sizeByDegree: baseline.value.style.chart.nodes.sizeByDegree,
                labels: { hoverOnly: dataset.value.nodes.length > 300 },
            },
        },
    },
}));
const responsiveConfig = computed(() =>
    treeShake({
        defaultConfig: config.value,
        userConfig: { responsive: true },
    }),
);
</script>

<template>
    <div class="graph-arena-options">
        <label
            >Dataset:
            <select v-model="selectedExample">
                <option
                    v-for="(item, i) in graphExamples"
                    :key="item.name"
                    :value="i"
                >
                    {{ item.name }}
                </option>
            </select>
        </label>
        <label
            >Theme:
            <select v-model="currentTheme">
                <option
                    v-for="theme in themeOptions"
                    :key="theme"
                    :value="theme"
                >
                    {{ theme || 'Default' }}
                </option>
            </select>
        </label>
    </div>
    <Box
        :key="selectedExample"
        comp="VueUiGraph"
        :dataset="dataset"
        :config="config"
        :defaultConfig="{ responsive: false }"
    >
        <template #title>VueUiGraph</template>
        <template #responsive>
            <div class="graph-arena-responsive">
                <LocalVueUiGraph
                    :key="selectedExample"
                    :dataset="dataset"
                    :config="responsiveConfig"
                />
            </div>
        </template>
        <template #theme>
            <LocalVueUiGraph
                :key="`${selectedExample}-${currentTheme}`"
                :dataset="dataset"
                :config="configTheme"
            />
        </template>
        <template #local>
            <LocalVueUiGraph
                ref="local"
                :key="selectedExample"
                :dataset="dataset"
                :config="config"
            />
        </template>
        <template #VDUI-local>
            <LocalVueDataUi
                ref="vduiLocal"
                :key="selectedExample"
                component="VueUiGraph"
                :dataset="dataset"
                :config="config"
            />
        </template>
        <template #build>
            <VueUiGraph
                ref="build"
                :key="selectedExample"
                :dataset="dataset"
                :config="config"
            />
        </template>
        <template #build-treesh>
            <VueUiGraphTreeshaken
                :key="selectedExample"
                :dataset="dataset"
                :config="config"
            />
        </template>
        <template #VDUI-build>
            <VueDataUi
                ref="vduiBuild"
                :key="selectedExample"
                component="VueUiGraph"
                :dataset="dataset"
                :config="config"
            />
        </template>
        <template #custom-config>
            <LocalVueUiGraph
                :key="selectedExample"
                :dataset="dataset"
                :config="config"
            >
                <template #svg-underlayer="{ nodes, viewport }">
                    <text
                        :x="-viewport.x / viewport.k + 12"
                        :y="-viewport.y / viewport.k + 24"
                        fill="chocolate"
                        font-size="16"
                        opacity="0.5"
                        pointer-events="none"
                    >
                        #svg-underlayer: {{ nodes.length }} nodes
                    </text>
                </template>

                <template #tooltip="{ node, connections }">
                    <strong>{{ node?.label ?? node?.id }}</strong>
                    <div v-if="node">
                        {{ connections }} connections · group
                        {{ node.group ?? 'None' }}
                    </div>
                </template>
            </LocalVueUiGraph>
        </template>
        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" :open="summaryOpen" />
        </template>
    </Box>
</template>

<style scoped>
.graph-arena-options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    margin: 12px 0;
    color: #cccccc;
}
.graph-arena-responsive {
    width: 600px;
    max-width: 100%;
    height: 600px;
    resize: both;
    overflow: auto;
    background: white;
}
</style>

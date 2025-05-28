<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import worldGeo from "../resources/worldGeo.json"
import { useConfig } from '../useConfig';
import { applyDataLabel, convertColorToHex, convertCustomPalette, createCsvContent, createUid, darkenHexColor, dataLabel, downloadCsv, hasDeepProperty, interpolateColorHex, isFunction, lightenHexColor, palette, XMLNS } from '../lib';
import { useNestedProp } from '../useNestedProp';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import PenAndPaper from '../atoms/PenAndPaper.vue';
import Title from '../atoms/Title.vue';
import UserOptions from '../atoms/UserOptions.vue';
import { usePrinter } from '../usePrinter';
import PackageVersion from '../atoms/PackageVersion.vue';
import Tooltip from '../atoms/Tooltip.vue';
import geo from "../geoProjections";
import Accordion from "./vue-ui-accordion.vue";
import DataTable from "../atoms/DataTable.vue";
import Legend from '../atoms/Legend.vue';
import Shape from '../atoms/Shape.vue';

const { vue_ui_world: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Object,
        default() {
            return {}
        }
    }
});

const emit = defineEmits(['selectDatapoint', 'selectLegend'])

const isDataset = computed({
    get() {
        return !!props.dataset
    },
    set(bool) {
        return bool
    }
});

const hasCategories = computed(() => {
    if (!isDataset) return false
    return Object.values(props.dataset).some(d => Object.hasOwn(d, 'category'));
})

const worldChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const legendStep = ref(0);
const tableStep = ref(0);
const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
const step = ref(0);

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    // --------------------------- OVERRIDES ------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.chart.territory.colors.min')) {
        mergedConfig.style.chart.territory.colors.min = convertColorToHex(props.config.style.chart.territory.colors.min);
    } else {
        mergedConfig.style.chart.territory.colors.min = mergedConfig.style.chart.territory.emptyColor;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.territory.colors.max')) {
        mergedConfig.style.chart.territory.colors.max = convertColorToHex(props.config.style.chart.territory.colors.max);
    } else {
        mergedConfig.style.chart.territory.colors.max = palette[0];
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.dimensions.width')) {
        mergedConfig.style.chart.dimensions.width = props.config.style.chart.dimensions.width;
    } else {
        mergedConfig.style.chart.dimensions.width = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.dimensions.height')) {
        mergedConfig.style.chart.dimensions.height = props.config.style.chart.dimensions.height;
    } else {
        mergedConfig.style.chart.dimensions.height = null;
    }

    // --------------------------------------------------------------------

    return mergedConfig;
}

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
})

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const projection = computed(() => FINAL_CONFIG.value.projection || 'globe');

const sizes = computed(() => {
    const { height, width } = FINAL_CONFIG.value.style.chart.dimensions;
    return {
        aitoff: { width: width || 1000, height: height || 500},
        azimuthalEquidistant: { width: width || 1000, height: height || 1000},
        bonne: { width: width || 1000, height: height || 1000},
        equirectangular: { width: width || 1000, height: height || 700 },
        gallPeters: { width: width || 1000, height: height || 800},
        globe: { width: width || 1000, height: height || 1000},
        hammer: { width: width || 1000, height: height || 500},
        mercator: { width: width || 1000, height: height || 750 },
        mollweide: { width: width || 1000, height: height || 600},
        robinson: { width: width || 1000, height: height || 600 },
        sinusoidal: { width: width || 1000, height: height || 500},
        vanDerGrinten: { width: width || 1000, height: height || 1000},
        winkelTripel: { width: width || 1000, height: height || 1000},
    }[projection.value];
});

const { projections, getProjectedBounds } = geo;

const viewBox = computed(() => {
    const { minX, minY, width, height } = getProjectedBounds(projections[projection.value], worldGeo.features, sizes.value.width, sizes.value.height);
    return {
        str: `${minX} ${minY} ${width} ${height}`,
        minX,
        minY,
        width,
        height
    };
})

const values = computed(() => Object.values(props.dataset).map(d => d.value));
const min = computed(() => Math.min(...values.value));
const max = computed(() => Math.max(...values.value));

function getHeatmapColor(value) {
    if (typeof value !== 'number') return FINAL_CONFIG.value.style.chart.territory.emptyColor;
    return interpolateColorHex(
        FINAL_CONFIG.value.style.chart.territory.colors.min || '#FFFFFF00', 
        FINAL_CONFIG.value.style.chart.territory.colors.max || customPalette.value[0] || palette[0], 
        min.value, 
        max.value, 
        value
    )
}

function project([lon, lat]) {
    const fn = projections[projection.value] || projections.globe
    return fn([lon, lat], sizes.value.width, sizes.value.height, center.value);
}

function geoToPath(geometry) {
    const drawPoly = coords =>
        coords.map(
            ring => {
                const pts = ring.map(([lon, lat]) => project([lon, lat]));
                const validPts = pts.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
                if (validPts.length < 3) return '';
                return 'M' + validPts.map(([x, y]) => `${x},${y}`).join('L') + 'Z';
            }
        ).filter(Boolean).join(' ');
    if (geometry.type === 'Polygon') return drawPoly(geometry.coordinates);
    if (geometry.type === 'MultiPolygon')
        return geometry.coordinates.map(drawPoly).join(' ');
    return '';
}

const categories = computed(() => {
    return [...new Set(Object.values(props.dataset).map(d => d.category).filter(Boolean))].map((name, i) => {
        return {
            name,
            color: customPalette.value[i] || palette[i] || palette[i % palette.length]
        }
    });
});

function getColorByCategory(category) {
    const found = categories.value.find(c => c.name === category);
    return found ? found.color : '#000000';
}

const countries = computed(() =>{
    const _center = center.value;
    return worldGeo.features.map(feature => {
        let code = feature.properties.iso_a3
            // Use iso_a3_eh fallback if iso_a3 is missing or invalid
            if (!code || code === '-99') {
                code = feature.properties.iso_a3_eh
            }
            const item = props.dataset[code]
            return {
                path: geoToPath(feature.geometry),
                name: feature.properties.name,
                geo: feature,
                code,
                geometry: feature.geometry,
                color: item && item.color ? convertColorToHex(item.color) : item && item.category ? getColorByCategory(item.category) : getHeatmapColor(item ? item.value : null),
                value: item ? item.value : null,
                category: item ? item.category || null : null,
                isActive: !!item,
                uid: `territory-${createUid()}`
            }
        })}
)

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `world_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-world',
    options: FINAL_CONFIG.value.userOptions.print
});

const useCustomFormat = ref(false);
const dataTooltipSlot = ref(null);
const selectedDatapoint = ref(null);

function getLargestPolygon(geometry) {
    if (!geometry) return [];
    if (geometry.type === "Polygon") return geometry.coordinates;
    if (geometry.type === "MultiPolygon") {
        return geometry.coordinates.reduce(
        (max, coords) => (coords[0].length > (max[0]?.length || 0) ? coords : max),
        []
        );
    }
    return [];
}

const tooltipPreviewSvg = computed(() => {
    const geometry = selectedDatapoint.value?.geometry;
    if (!geometry) return "";

    const mainPoly = getLargestPolygon(geometry);
    if (!mainPoly.length) return "";

    const allCoords = mainPoly.flat();
    const avgLon = allCoords.reduce((sum, [lon]) => sum + lon, 0) / allCoords.length;
    const avgLat = allCoords.reduce((sum, [, lat]) => sum + lat, 0) / allCoords.length;
    const countryCenter = [avgLon, avgLat];
    const projectFn = projections[projection.value] || projections.globe;
    const w = sizes.value.width;
    const h = sizes.value.height;
    const allRings = mainPoly.map(ring =>
        ring.map(([lon, lat]) => projectFn([lon, lat], w, h, countryCenter))
    );
    const flat = allRings.flat();
    const xs = flat.map(([x, y]) => x);
    const ys = flat.map(([x, y]) => y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const svgSize = 80;
    const padding = 8;
    const innerW = svgSize - 2 * padding;
    const innerH = svgSize - 2 * padding;
    const countryW = maxX - minX || 1;
    const countryH = maxY - minY || 1;
    const scale = Math.min(innerW / countryW, innerH / countryH);
    function toMini([x, y]) {
        return [
        ((x - minX) * scale + padding),
        ((y - minY) * scale + padding)
        ];
    }

    const pathD = allRings.map(ring => {
        const pts = ring.map(toMini);
        return 'M' + pts.map(([x, y]) => `${x},${y}`).join('L') + 'Z';
    }).join(' ');

    const fill =
        selectedDatapoint.value?.color || FINAL_CONFIG.value.style.chart.territory.emptyColor;
    const stroke = FINAL_CONFIG.value.style.chart.territory.stroke;

    return `
        <svg width="${svgSize}" height="${svgSize}" viewBox="0 0 ${svgSize} ${svgSize}" style="display:block;margin:auto;">
        <rect x="0" y="0" width="${svgSize}" height="${svgSize}" rx="12" fill="transparent" opacity="0.93"/>
        <path d="${pathD}" fill="${fill}" stroke="${stroke}" stroke-width="1"/>
        </svg>
    `;
});

function useTooltip({ datapoint }) {
    selectedDatapoint.value = datapoint;
    dataTooltipSlot.value = { datapoint , config: FINAL_CONFIG.value, series: countries.value };
    isTooltip.value = true;
    let html = '';

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                datapoint,
                config: FINAL_CONFIG.value,
                series: countries.value
            });
            if (typeof customFormatString === 'string') {
                tooltipContent.value = customFormatString;
                useCustomFormat.value = true;
            }
        } catch (err) {
            console.warn('Custom format cannot be applied.');
            useCustomFormat.value = false;
        }
    }

    if (!useCustomFormat.value) {
        html += `
        <div data-cy="tooltip-name" style="width:100%;">
            ${FINAL_CONFIG.value.style.chart.tooltip.showMinimap ? `<div class="vue-ui-world-minimap">${tooltipPreviewSvg.value}</div>` : ''}
            <div style="display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;justify-content:center;gap:4px">
                <svg viewBox="0 0 20 20" height="14" width="14">
                    <circle cx="10" cy="10" r="10" fill="${datapoint.color}"/>
                </svg>
                <span>${datapoint.name}:</span>
                <b>
                    ${applyDataLabel(
                        FINAL_CONFIG.value.style.chart.dataLabels.formatter,
                        datapoint.value,
                        dataLabel({
                            p: FINAL_CONFIG.value.style.chart.dataLabels.prefix,
                            v: datapoint.value,
                            s: FINAL_CONFIG.value.style.chart.dataLabels.suffix,
                            r: FINAL_CONFIG.value.style.chart.dataLabels.rounding
                        })
                    )}    
                </b>
            </div>
        </div>
        `;

        tooltipContent.value = `<div>${html}</div>`;
    }
}

const drag = ref(false);
const dragStart = ref({ x: 0, y: 0 });

const center = ref([
  FINAL_CONFIG.value.style.chart.globe.center.x,
  FINAL_CONFIG.value.style.chart.globe.center.y
]);

watch(
  () => [
    FINAL_CONFIG.value.style.chart.globe.center.x,
    FINAL_CONFIG.value.style.chart.globe.center.y
  ],
  ([newX, newY]) => {
    center.value = [newX, newY];
  }
);

function onMouseDown(e) {
    drag.value = true;
    dragStart.value = { x: e.clientX, y: e.clientY };
}

function onMouseMove(e) {
    if (!drag.value || projection.value !== 'globe' || isAnnotator.value) return;
    const dx = e.clientX - dragStart.value.x;
    const dy = e.clientY - dragStart.value.y;
    let lon = center.value[0] + dx * 0.5;
    let lat = center.value[1] - dy * 0.5;
    lat = Math.max(-90, Math.min(90, lat));
    center.value = [lon, lat];
    dragStart.value = { x: e.clientX, y: e.clientY };
}

function onMouseUp() {
    drag.value = false;
}

function onTouchStart(e) {
    drag.value = true;
    const touch = e.touches[0];
    dragStart.value = { x: touch.clientX, y: touch.clientY };
}

function onTouchMove(e) {
    if (!drag.value || projection.value !== 'globe' || isAnnotator.value) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.value.x;
    const dy = touch.clientY - dragStart.value.y;
    let lon = center.value[0] + dx * 0.5;
    let lat = center.value[1] - dy * 0.5;
    lat = Math.max(-90, Math.min(90, lat));
    center.value = [lon, lat];
    dragStart.value = { x: touch.clientX, y: touch.clientY };
}

function onTouchEnd() {
    drag.value = false;
}

const table = computed(() => {
    const src = countries.value.toSorted((a, b) => (b.value || 0) - (a.value || 0))
    const head = src.map(c => {
        return {
            name: c.name,
            color: c.color,
            category: c.category || '-'
        }
    })
    const body = src.map(c => c.value || 0);
    return { head, body }
})

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.category,
    ];

    const body = table.value.head.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name,
            },
            table.value.body[i] || 0,
            {
                category: h.category
            }
        ]
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    }

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ]

    return {
        colNames,
        head,
        body,
        config
    }
});

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[
            FINAL_CONFIG.value.table.columnNames.series,
            FINAL_CONFIG.value.table.columnNames.value,
            FINAL_CONFIG.value.table.columnNames.category,
        ]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-world" })
    });
}

const segregated = ref([]);

function segregate(name) {
    if (segregated.value.includes(name)) {
        segregated.value = segregated.value.filter(el => el !== name);
    } else {
        segregated.value.push(name);
    }

    emit('selectLegend', { name })
}

const legendSet = computed(() => {
    if (hasCategories) {
        return categories.value.map(({ name, color }, i) => {
            return { name, color, shape: 'circle', patternIndex: i };
        }).map(c => {
            return {
                ...c,
                opacity: segregated.value.includes(c.name) ? 0.5 : 1,
                segregate: () => segregate(c.name),
                isSegregated: segregated.value.includes(c.name)
            }
        })
    }
    // Maybe another type of legend can be added in the future when there is no category provided in the dataset.
    return []
})

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
})

function getData() {
    return countries.value
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip,
    toggleAnnotator
})

</script>

<template>
    <div
        ref="worldChart"
        :id="`world_${uid}`" 
        :class="`vue-ui-world ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen': ''}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" 
        @mouseenter="() => setUserOptionsVisibility(true)" 
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator && svgRef"
            :color="FINAL_CONFIG.style.chart.color"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :active="isAnnotator"
            :svgRef="svgRef"
            @close="toggleAnnotator"
        />

        <slot name="userConfig"></slot>

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.style.chart.tooltip.show && FINAL_CONFIG.userOptions.buttons.tooltip"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="false"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="worldChart"
            :position="FINAL_CONFIG.userOptions.position"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionCsv v-if="$slots.optionCsv">
                <slot name="optionCsv" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :viewBox="viewBox.str"
            :xmlns="XMLNS"
            :class="{
                'vue-data-ui-fullscreen--on': isFullscreen,
                'vue-data-ui-fullscreen--off': !isFullscreen
            }"
            data-cy="world-svg"
            :style="{
                maxWidth: '100%',
                overflow: projection === 'globe' ? 'visible' : 'hidden',
                background: 'transparent',
                color: FINAL_CONFIG.style.chart.color,
                paddingTop: FINAL_CONFIG.style.chart.padding.top + 'px',
                paddingRight: FINAL_CONFIG.style.chart.padding.right + 'px',
                paddingBottom: FINAL_CONFIG.style.chart.padding.bottom + 'px',
                paddingLeft: FINAL_CONFIG.style.chart.padding.left + 'px'
            }"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
            @touchstart="onTouchStart"
            @touchmove.prevent="onTouchMove"
            @touchend="onTouchEnd"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="viewBox.minX"
                :y="viewBox.minY"
                :width="viewBox.width"
                :height="viewBox.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <g v-if="isDataset">
                <template v-if="projection === 'globe'">
                    <defs>
                        <radialGradient 
                            :id="`water-${uid}`"
                            :cx="0.48" :cy="0.52" r="0.55" fx="0.40" fy="0.48">
                            <stop offset="0%"   :stop-color="lightenHexColor(FINAL_CONFIG.style.chart.globe.waterColor, 0.4)" />
                            <stop offset="45%"  :stop-color="FINAL_CONFIG.style.chart.globe.waterColor" />
                            <stop offset="80%"  :stop-color="darkenHexColor(FINAL_CONFIG.style.chart.globe.waterColor, 0.2)" />
                            <stop offset="100%" :stop-color="darkenHexColor(FINAL_CONFIG.style.chart.globe.waterColor, 0.5)" stop-opacity="0.95"/>
                        </radialGradient>
                        <radialGradient :id="`atmo-realistic-${uid}`"
                        :cx="0.5" :cy="0.5" r="0.54">
                            <stop offset="87%" stop-color="rgba(120,200,255,0)" />
                            <stop offset="98%" :stop-color="FINAL_CONFIG.style.chart.globe.waterColor" />
                            <stop offset="100%" stop-color="rgba(120,200,255,0)" />
                        </radialGradient>
                        <filter :id="`blur-${uid}`" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="8"/>
                        </filter>
                    </defs>
                    <g v-if="$slots.pattern">
                        <defs v-for="(country, i) in countries">
                            <slot name="pattern" v-bind="{...country, patternId: `pattern_${uid}_${country.code}`}"/>
                        </defs>
                    </g>
                    <circle 
                        :cx="viewBox.width / 2 + 20"
                        :cy="viewBox.height / 2 + 20"
                        :r="viewBox.height / 2"
                        :fill="`url(#water-${uid})`"
                    />
                    <circle
                        :cx="viewBox.width / 2 + 20"
                        :cy="viewBox.height / 2 + 20"
                        :r="viewBox.height / 2 + 10"
                        :fill="`url(#atmo-realistic-${uid})`"
                        pointer-events="none"
                        :filter="`url(#blur-${uid})`"
                    />
                </template>
                <template v-for="country in countries" :key="country.code">
                    <path 
                        :d="country.path" 
                        :fill="country.category && segregated.includes(country.category) ? FINAL_CONFIG.style.chart.territory.emptyColor : country.color" 
                        :stroke="FINAL_CONFIG.style.chart.territory.stroke" 
                        :stroke-width="selectedDatapoint && selectedDatapoint.uid === country.uid ? FINAL_CONFIG.style.chart.territory.strokeWidthSelected : FINAL_CONFIG.style.chart.territory.strokeWidth"
                        @mouseenter="useTooltip({ datapoint: country })"
                        @mouseleave="isTooltip = false; selectedDatapoint = null"
                        @click="emit('selectDatapoint', country)"
                        class="vue-ui-world-territory"
                    >
                        <title v-if="!isTooltip || !mutableConfig.showTooltip">
                            {{ country.name }}
                            <template v-if="typeof country.value === 'number'">
                                : {{ country.value }}
                            </template>
                        </title>
                    </path>
                    <path
                        v-if="selectedDatapoint"
                        :d="geoToPath(selectedDatapoint.geometry)"
                        fill="transparent"
                        :stroke="FINAL_CONFIG.style.chart.territory.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.territory.strokeWidthSelected"
                        style="pointer-events: none;"
                        class="vue-ui-world-territory"
                    />
                </template>
            </g>

            <slot name="svg" :svg="{
                height: sizes.height,
                width: sizes.width
            }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div ref="chartLegend" v-if="hasCategories">        
            <Legend
                v-if="FINAL_CONFIG.style.chart.legend.show"
                :key="`legend_${legendStep}`"
                :legendSet="legendSet"
                :config="legendConfig"
                @clickMarker="(el) => segregate(el)"
            >
                <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                    <Shape
                        :shape="legend.shape"
                        :radius="30"
                        stroke="none"
                        :plot="{ x: 30, y: 30}"
                        :fill="`url(#pattern_${uid}_${index})`"
                    />
                </template>

                <template #item="{ legend, index }">
                    <div 
                        data-cy="legend-item"
                        :style="`opacity:${segregated.includes(legend.name) ? 0.5 : 1}`"
                        @click="legend.segregate()" 
                    >
                        {{ legend.name }}
                    </div>
                </template>
            </Legend>
            <slot name="legend" v-bind:legend="legendSet" />
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="worldChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 20000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            }
        }">
            <template #content>            
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name ? td.name : td.category ? td.category : applyDataLabel(
                            FINAL_CONFIG.style.chart.dataLabels.formatter,
                            td,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.dataLabels.prefix,
                                v: td,
                                s: FINAL_CONFIG.style.chart.dataLabels.suffix,
                                r: FINAL_CONFIG.style.chart.dataLabels.rounding
                            })
                        ) }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-world * {
    transition: unset;
}

.vue-ui-world {
    user-select: none;
    position: relative;
}

path.vue-ui-world-territory {
    transition: stroke-width 0.3s cubic-bezier(.25,.8,.25,1);
}
</style>
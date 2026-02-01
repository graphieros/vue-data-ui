<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onMounted, 
    ref, 
    toRefs,
    watch, 
} from 'vue';
import WORLD_DATA from "../resources/worldGeo.js"
import { useConfig } from '../useConfig';
import { 
    applyDataLabel, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createUid, 
    darkenHexColor, 
    dataLabel, 
    downloadCsv, 
    hasDeepProperty, 
    interpolateColorHex, 
    isFunction, 
    lightenHexColor, 
    palette, 
    treeShake, 
    XMLNS 
} from '../lib';
import { useLoading } from '../useLoading.js';
import { usePrinter } from '../usePrinter';
import { useSvgExport } from '../useSvgExport.js';
import { useNestedProp } from '../useNestedProp';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import img from '../img.js';
import geo from "../geoProjections";
import Shape from '../atoms/Shape.vue';
import BaseScanner from '../atoms/BaseScanner.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';

const Title = defineAsyncComponent(() => import('../atoms/Title.vue'));
const Legend = defineAsyncComponent(() => import('../atoms/Legend.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

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
        return !!FINAL_DATASET.value
    },
    set(bool) {
        return bool
    }
});

const hasCategories = computed(() => {
    if (!isDataset) return false
    return Object.values(FINAL_DATASET.value).some(d => Object.hasOwn(d, 'category'));
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
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

onMounted(() => {
    readyTeleport.value = true;
})

let worldGeo = WORLD_DATA;
const { projections, getProjectedBounds, setupTerritories } = geo;

function prepareConfig() {
    let mergedConfig = useNestedProp({
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

    worldGeo = setupTerritories(mergedConfig, worldGeo);

    // --------------------------------------------------------------------

    return mergedConfig;
}

const FINAL_CONFIG = ref(prepareConfig());

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    globe: {
                        waterColor: '#8A8A8A'
                    },
                    territory: {
                        stroke: '#6A6A6A',
                        colors: {
                            min: '#E0E0E0',
                            max: '#E0E0E0'
                        }
                    }
                }
            }
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {}
    })
})

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value
    })
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

watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
    }
}, { immediate: true });

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const projection = computed(() => FINAL_CONFIG.value.projection || 'globe');

const sizes = computed(() => {
    const { height, width } = FINAL_CONFIG.value.style.chart.dimensions;
    return {
        aitoff: { width: width || 1000, height: height || 500 },
        azimuthalEquidistant: { width: width || 1000, height: height || 1000 },
        bonne: { width: width || 1000, height: height || 1000 },
        equirectangular: { width: width || 1000, height: height || 700 },
        gallPeters: { width: width || 1000, height: height || 800 },
        globe: { width: width || 1000, height: height || 1000 },
        hammer: { width: width || 1000, height: height || 500 },
        mercator: { width: width || 1000, height: height || 750 },
        mollweide: { width: width || 1000, height: height || 600 },
        robinson: { width: width || 1000, height: height || 600 },
        sinusoidal: { width: width || 1000, height: height || 500 },
        vanDerGrinten: { width: width || 1000, height: height || 1000 },
        winkelTripel: { width: width || 1000, height: height || 1000 },
    }[projection.value];
});

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

const values = computed(() => Object.values(FINAL_DATASET.value).map(d => d.value));
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
    //----------------------------------------------------------------------------------------------
    // NOTE: Should we decide to use d3-geo in the future:
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // if (projection.value === 'globe') {
    //     const globeProj = geoOrthographic()
    //         .translate([sizes.value.width / 2, sizes.value.height / 2])
    //         .scale(Math.min(sizes.value.width, sizes.value.height) / 2 * 0.95)
    //         .rotate([-center.value[0], -center.value[1]])
    //         .clipAngle(90);
    //     const pathGen = geoPath(globeProj);
    //     return pathGen(geometry);
    // }
    //----------------------------------------------------------------------------------------------

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
    const entries = Object.values(FINAL_DATASET.value).filter(d => !!d.category);
    const uniqueCategoriesMap = {};
    entries.forEach(entry => {
        if (!uniqueCategoriesMap[entry.category]) {
            uniqueCategoriesMap[entry.category] = entry;
        }
    });
    return Object.values(uniqueCategoriesMap).map((el, i) => ({
        name: el.category,
        color: el.color ? convertColorToHex(el.color) : customPalette.value[i] || palette[i] || palette[i % palette.length]
    }));
});

function getColorByCategory(category) {
    const found = categories.value.find(c => c.name === category);
    return found ? found.color : '#000000';
}

const countries = computed(() => {
    const _center = center.value;
    return worldGeo.features.map(feature => {
        let code = feature.properties.iso_a3
        // Use iso_a3_eh fallback if iso_a3 is missing or invalid
        if (!code || code === '-99') {
            code = feature.properties.iso_a3_eh
        }
        const item = FINAL_DATASET.value[code]
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
    })
}
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

function onTrapLeave({ datapoint, seriesIndex }) {
    isTooltip.value = false;
    selectedDatapoint.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
}

function onTrapClick({ datapoint, seriesIndex }) {
    emit('selectDatapoint', datapoint);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
}

function useTooltip({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }

    selectedDatapoint.value = datapoint;
    dataTooltipSlot.value = { datapoint, config: FINAL_CONFIG.value, series: countries.value };
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
    let lon = center.value[0] - dx * 0.5;
    let lat = center.value[1] + dy * 0.5;
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
    let lon = center.value[0] - dx * 0.5;
    let lat = center.value[1] + dy * 0.5;
    lat = Math.max(-90, Math.min(90, lat));
    center.value = [lon, lat];
    dragStart.value = { x: touch.clientX, y: touch.clientY };
}

function onTouchEnd() {
    drag.value = false;
}

const table = computed(() => {
    const src = countries.value.toSorted((a, b) => (b.value || 0) - (a.value || 0))
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

    const body = table.value.head.map((h, i) => {
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

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [[
                h.name
            ], [table.value.body[i]]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [[
            FINAL_CONFIG.value.table.columnNames.series,
            FINAL_CONFIG.value.table.columnNames.value,
            FINAL_CONFIG.value.table.columnNames.category,
        ]]].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-world" })
        } else {
            callback(csvContent);
        }
    });
}

const segregated = ref([]);

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach(l => {
            segregated.value.push(l.name);
        });
    }
}

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

async function getImage({ scale = 2} = {}) {
    if (!worldChart.value) return;
    const { width, height } = worldChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: worldChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: worldChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8)
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                }
            }
        }
    }
});

watch(() => mutableConfig.value.showTable, v => {
    if (FINAL_CONFIG.value.table.show) return;
    if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
        tableUnit.value.open()
    } else {
        if ('close' in tableUnit.value) {
            tableUnit.value.close()
        }
    }
});

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: legendSet,
    backgroundColor: svgBg
});

async function generateSvg({ isCb }) {
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl })

    } else {
        exportSvg();
    }
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
})

</script>

<template>
    <div ref="worldChart" :id="`world_${uid}`"
        :class="`vue-data-ui-component vue-ui-world ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">

        <PenAndPaper v-if="FINAL_CONFIG.userOptions.buttons.annotator && svgRef" :color="FINAL_CONFIG.style.chart.color"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :active="isAnnotator" :svgRef="svgRef"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close"/>
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }"/>
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }"/>
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }"/>
            </template>
        </PenAndPaper>

        <slot name="userConfig"></slot>

        <div ref="noTitle" v-if="hasOptionsNoTitle" class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent`">
            <Title :key="`title_${titleStep}`" :config="{
                title: {
                    cy: 'donut-div-title',
                    ...FINAL_CONFIG.style.chart.title,
                },
                subtitle: {
                    cy: 'donut-div-subtitle',
                    ...FINAL_CONFIG.style.chart.title.subtitle
                }
            }" />
        </div>

        <div :id="`legend-top-${uid}`" />

        <UserOptions 
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" 
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" 
            :isImaging="isImaging" 
            :uid="uid" 
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :hasTooltip="FINAL_CONFIG.style.chart.tooltip.show && FINAL_CONFIG.userOptions.buttons.tooltip"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" 
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv" 
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="false" 
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" 
            :isFullscreen="isFullscreen"
            :chartElement="worldChart" 
            :position="FINAL_CONFIG.userOptions.position"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :isTooltip="mutableConfig.showTooltip" 
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator" 
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            @toggleFullscreen="toggleFullscreen" 
            @generatePdf="generatePdf" 
            @generateCsv="generateCsv"
            @generateImage="generateImage" 
            @generateSvg="generateSvg"
            @toggleTable="toggleTable" 
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator" 
            :style="{ visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible' }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip" />
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
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg ref="svgRef" :viewBox="viewBox.str" :xmlns="XMLNS" :class="{
            'vue-data-ui-fullscreen--on': isFullscreen,
            'vue-data-ui-fullscreen--off': !isFullscreen
        }" data-cy="world-svg" :style="{
                maxWidth: '100%',
                overflow: projection === 'globe' ? 'visible' : 'hidden',
                background: 'transparent',
                color: FINAL_CONFIG.style.chart.color,
                paddingTop: FINAL_CONFIG.style.chart.padding.top + 'px',
                paddingRight: FINAL_CONFIG.style.chart.padding.right + 'px',
                paddingBottom: FINAL_CONFIG.style.chart.padding.bottom + 'px',
                paddingLeft: FINAL_CONFIG.style.chart.padding.left + 'px'
            }" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp"
            @touchstart="onTouchStart" @touchmove.prevent="onTouchMove" @touchend="onTouchEnd">
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject v-if="$slots['chart-background']" :x="viewBox.minX" :y="viewBox.minY" :width="viewBox.width"
                :height="viewBox.height" :style="{
                    pointerEvents: 'none'
                }">
                <slot name="chart-background" />
            </foreignObject>

            <g v-if="isDataset">
                <template v-if="projection === 'globe'">
                    <defs>
                        <radialGradient :id="`water-${uid}`" :cx="0.48" :cy="0.52" r="0.55" fx="0.40" fy="0.48">
                            <stop offset="0%"
                                :stop-color="lightenHexColor(FINAL_CONFIG.style.chart.globe.waterColor, 0.4)" />
                            <stop offset="45%" :stop-color="FINAL_CONFIG.style.chart.globe.waterColor" />
                            <stop offset="80%"
                                :stop-color="darkenHexColor(FINAL_CONFIG.style.chart.globe.waterColor, 0.2)" />
                            <stop offset="100%"
                                :stop-color="darkenHexColor(FINAL_CONFIG.style.chart.globe.waterColor, 0.5)"
                                stop-opacity="0.95" />
                        </radialGradient>
                        <radialGradient :id="`atmo-realistic-${uid}`" :cx="0.5" :cy="0.5" r="0.54">
                            <stop offset="87%" stop-color="rgba(120,200,255,0)" />
                            <stop offset="98%" :stop-color="FINAL_CONFIG.style.chart.globe.waterColor" />
                            <stop offset="100%" stop-color="rgba(120,200,255,0)" />
                        </radialGradient>
                        <filter :id="`blur-${uid}`" x="-30%" y="-30%" width="160%" height="160%">
                            <feGaussianBlur stdDeviation="8" />
                        </filter>
                    </defs>
                    <g v-if="$slots.pattern">
                        <defs v-for="(country, i) in countries">
                            <slot name="pattern" v-bind="{ ...country, patternId: `pattern_${uid}_${country.code}` }" />
                        </defs>
                    </g>
                    <circle :cx="viewBox.width / 2 + 20" :cy="viewBox.height / 2 + 20" :r="viewBox.height / 2"
                        :fill="`url(#water-${uid})`" />
                    <circle :cx="viewBox.width / 2 + 20" :cy="viewBox.height / 2 + 20" :r="viewBox.height / 2 + 10"
                        :fill="`url(#atmo-realistic-${uid})`" pointer-events="none" :filter="`url(#blur-${uid})`" />
                </template>
                <template v-for="(country, i) in countries" :key="country.code">
                    <path :d="country.path"
                        :fill="country.category && segregated.includes(country.category) ? FINAL_CONFIG.style.chart.territory.emptyColor : country.color"
                        :stroke="FINAL_CONFIG.style.chart.territory.stroke"
                        :stroke-width="selectedDatapoint && selectedDatapoint.uid === country.uid ? FINAL_CONFIG.style.chart.territory.strokeWidthSelected : FINAL_CONFIG.style.chart.territory.strokeWidth"
                        @mouseenter="useTooltip({ datapoint: country, seriesIndex: i })"
                        @mouseleave="onTrapLeave({ datapoint: country, seriesIndex: i })"
                        @click="onTrapClick({ datapoint: country, seriesIndex: i })" 
                        class="vue-ui-world-territory"
                    >
                        <title v-if="!isTooltip || !mutableConfig.showTooltip">
                            {{ country.name }}
                            <template v-if="typeof country.value === 'number'">
                                : {{ country.value }}
                            </template>
                        </title>
                    </path>
                    <path v-if="$slots.pattern" :d="country.path" :fill="`url(#pattern_${uid}_${country.code})`"
                        :stroke="FINAL_CONFIG.style.chart.territory.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.territory.strokeWidthSelected"
                        style="pointer-events: none;" class="vue-ui-world-territory" />
                    <path v-if="selectedDatapoint" :d="geoToPath(selectedDatapoint.geometry)" fill="transparent"
                        :stroke="FINAL_CONFIG.style.chart.territory.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.territory.strokeWidthSelected"
                        style="pointer-events: none;" class="vue-ui-world-territory" />
                </template>
            </g>

            <slot name="svg" :svg="{
                height: sizes.height,
                width: sizes.width
            }" />
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
        </div>

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport v-if="readyTeleport" :to="FINAL_CONFIG.style.chart.legend.position === 'top' ? `#legend-top-${uid}` : `#legend-bottom-${uid}`">
            <div ref="chartLegend" v-if="hasCategories">
                <Legend v-if="FINAL_CONFIG.style.chart.legend.show" :key="`legend_${legendStep}`" :legendSet="legendSet"
                    :config="legendConfig" @clickMarker="(el) => segregate(el)">
                    <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                        <Shape :shape="legend.shape" :radius="30" stroke="none" :plot="{ x: 30, y: 30 }"
                            :fill="`url(#pattern_${uid}_${index})`" />
                    </template>
    
                    <template #item="{ legend, index }">
                        <div data-cy="legend-item" :style="`opacity:${segregated.includes(legend.name) ? 0.5 : 1}`"
                            @click="legend.segregate()">
                            {{ legend.name }}
                        </div>
                    </template>

                    <template #legendToggle>
                        <BaseLegendToggle
                            v-if="legendSet.length > 2 && FINAL_CONFIG.style.chart.legend.selectAllToggle.show && !loading"
                            :backgroundColor="FINAL_CONFIG.style.chart.legend.selectAllToggle.backgroundColor"
                            :color="FINAL_CONFIG.style.chart.legend.selectAllToggle.color"
                            :fontSize="FINAL_CONFIG.style.chart.legend.fontSize"
                            :checked="segregated.length > 0"
                            @toggle="toggleLegend"
                        />
                    </template>
                </Legend>
                <slot name="legend" v-bind:legend="legendSet" />
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Tooltip 
            :teleportTo="FINAL_CONFIG.style.chart.tooltip.teleportTo"
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
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
        </Tooltip>

        <component
            v-if="isDataset && FINAL_CONFIG.userOptions.buttons.table"
            :is="tableComponent.component"
            v-bind="tableComponent.props"
            ref="tableUnit"
            @close="closeTable"
        >
            <template #title v-if="FINAL_CONFIG.table.useDialog">
                {{ tableComponent.title }}
            </template>
            <template #actions v-if="FINAL_CONFIG.table.useDialog">
                <button tabindex="0" class="vue-ui-user-options-button" @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)">
                    <BaseIcon name="fileCsv" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>
                <DataTable 
                    :key="`table_${tableStep}`" 
                    :colNames="dataTable.colNames" 
                    :head="dataTable.head"
                    :body="dataTable.body" 
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    @close="closeTable"
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
        </component>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
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
    transition: stroke-width 0.3s cubic-bezier(.25, .8, .25, 1);
}
</style>
*
<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiWorld from '../src/components/vue-ui-world.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

import { VueUiWorld } from "vue-data-ui";
import { VueUiWorld as VueUiWorldTreeshaken } from "vue-data-ui/vue-ui-world";
import ConfigKnobs from "./ConfigKnobs.vue";

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = {
  AFG: { value: 20, category: 'CAT1', color: 'red' },     // Afghanistan
  ALB: { value: 18, category: 'CAT2', color: 'blue' },     // Albania
  DZA: { value: 225 },    // Algeria
  AND: { value: 3 },      // Andorra
  AGO: { value: 74 },     // Angola
  ATG: { value: 2 },      // Antigua and Barbuda
  ARG: { value: 641 },    // Argentina
  ARM: { value: 21 },     // Armenia
  AUS: { value: 1622 },   // Australia
  AUT: { value: 501 },    // Austria
  AZE: { value: 78 },     // Azerbaijan
  BHS: { value: 13 },     // Bahamas
  BHR: { value: 45 },     // Bahrain
  BGD: { value: 460 },    // Bangladesh
  BRB: { value: 6 },      // Barbados
  BLR: { value: 69 },     // Belarus
  BEL: { value: 582 },    // Belgium
  BLZ: { value: 2 },      // Belize
  BEN: { value: 18 },     // Benin
  BTN: { value: 3 },      // Bhutan
  BOL: { value: 44 },     // Bolivia
  BIH: { value: 27 },     // Bosnia and Herzegovina
  BWA: { value: 20 },     // Botswana
  BRA: { value: 2136 },   // Brazil
  BRN: { value: 18 },     // Brunei
  BGR: { value: 89 },     // Bulgaria
  BFA: { value: 20 },     // Burkina Faso
  BDI: { value: 4 },      // Burundi
  KHM: { value: 30 },     // Cambodia
  CMR: { value: 46 },     // Cameroon
  CAN: { value: 2250 },   // Canada
  CPV: { value: 2 },      // Cape Verde
  CAF: { value: 2 },      // Central African Republic
  TCD: { value: 12 },     // Chad
  CHL: { value: 334 },    // Chile
  CHN: { value: 17679 },  // China
  COL: { value: 314 },    // Colombia
  COM: { value: 2 },      // Comoros
  COD: { value: 63 },     // Congo (Dem. Rep.)
  COG: { value: 16 },     // Congo (Rep.)
  CRI: { value: 74 },     // Costa Rica
  CIV: { value: 70 },     // Côte d’Ivoire
  HRV: { value: 79 },     // Croatia
  CUB: { value: 100 },    // Cuba (estimate)
  CYP: { value: 29 },     // Cyprus
  CZE: { value: 326 },    // Czechia
  DNK: { value: 406 },    // Denmark
  DJI: { value: 3 },      // Djibouti
  DMA: { value: 1 },      // Dominica
  DOM: { value: 113 },    // Dominican Republic
  ECU: { value: 115 },    // Ecuador
  EGY: { value: 474 },    // Egypt
  SLV: { value: 32 },     // El Salvador
  GNQ: { value: 12 },     // Equatorial Guinea
  ERI: { value: 3 },      // Eritrea
  EST: { value: 39 },     // Estonia
  SWZ: { value: 5 },      // Eswatini
  ETH: { value: 156 },    // Ethiopia
  FJI: { value: 5 },      // Fiji
  FIN: { value: 300 },    // Finland
  FRA: { value: 3040 },   // France
  GAB: { value: 21 },     // Gabon
  GMB: { value: 2 },      // Gambia
  GEO: { value: 25 },     // Georgia
  DEU: { value: 4212 },   // Germany
  GHA: { value: 72 },     // Ghana
  GRC: { value: 239 },    // Greece
  GRD: { value: 1 },      // Grenada
  GTM: { value: 95 },     // Guatemala
  GIN: { value: 19 },     // Guinea
  GNB: { value: 2 },      // Guinea-Bissau
  GUY: { value: 15 },     // Guyana
  HTI: { value: 14 },     // Haiti
  HND: { value: 32 },     // Honduras
  HUN: { value: 194 },    // Hungary
  ISL: { value: 30 },     // Iceland
  IND: { value: 3743 },   // India
  IDN: { value: 1321 },   // Indonesia
  IRN: { value: 413 },    // Iran
  IRQ: { value: 267 },    // Iraq
  IRL: { value: 504 },    // Ireland
  ISR: { value: 525 },    // Israel
  ITA: { value: 2212 },   // Italy
  JAM: { value: 17 },     // Jamaica
  JPN: { value: 4389 },   // Japan
  JOR: { value: 51 },     // Jordan
  KAZ: { value: 226 },    // Kazakhstan
  KEN: { value: 113 },    // Kenya
  KIR: { value: 0.2 },    // Kiribati
  PRK: { value: 31 },     // North Korea (estimate)
  KOR: { value: 1735 },   // South Korea
  KWT: { value: 183 },    // Kuwait
  KGZ: { value: 9 },      // Kyrgyzstan
  LAO: { value: 17 },     // Laos
  LVA: { value: 46 },     // Latvia
  LBN: { value: 20 },     // Lebanon
  LSO: { value: 2 },      // Lesotho
  LBR: { value: 4 },      // Liberia
  LBY: { value: 44 },     // Libya
  LIE: { value: 7 },      // Liechtenstein (est.)
  LTU: { value: 71 },     // Lithuania
  LUX: { value: 89 },     // Luxembourg
  MDG: { value: 15 },     // Madagascar
  MWI: { value: 13 },     // Malawi
  MYS: { value: 434 },    // Malaysia
  MDV: { value: 6 },      // Maldives
  MLI: { value: 20 },     // Mali
  MLT: { value: 20 },     // Malta
  MHL: { value: 0.3 },    // Marshall Islands
  MRT: { value: 11 },     // Mauritania
  MUS: { value: 13 },     // Mauritius
  MEX: { value: 1710 },   // Mexico
  FSM: { value: 0.4 },    // Micronesia
  MDA: { value: 15 },     // Moldova
  MCO: { value: 7 },      // Monaco (est.)
  MNG: { value: 16 },     // Mongolia
  MNE: { value: 6 },      // Montenegro
  MAR: { value: 140 },    // Morocco
  MOZ: { value: 19 },     // Mozambique
  MMR: { value: 59 },     // Myanmar
  NAM: { value: 13 },     // Namibia
  NRU: { value: 0.1 },    // Nauru
  NPL: { value: 44 },     // Nepal
  NLD: { value: 1070 },   // Netherlands
  NZL: { value: 248 },    // New Zealand
  NIC: { value: 15 },     // Nicaragua
  NER: { value: 16 },     // Niger
  NGA: { value: 477 },    // Nigeria
  MKD: { value: 15 },     // North Macedonia
  NOR: { value: 578 },    // Norway
  OMN: { value: 97 },     // Oman
  PAK: { value: 374 },    // Pakistan
  PLW: { value: 0.3 },    // Palau
  PAN: { value: 76 },     // Panama
  PNG: { value: 28 },     // Papua New Guinea
  PRY: { value: 44 },     // Paraguay
  PER: { value: 268 },    // Peru
  PHL: { value: 441 },    // Philippines
  POL: { value: 789 },    // Poland
  PRT: { value: 272 },    // Portugal
  QAT: { value: 219 },    // Qatar
  ROU: { value: 350 },    // Romania
  RUS: { value: 2275 },   // Russia
  RWA: { value: 14 },     // Rwanda
  KNA: { value: 1 },      // St. Kitts & Nevis
  LCA: { value: 2 },      // St. Lucia
  VCT: { value: 1 },      // St. Vincent & Grenadines
  WSM: { value: 1 },      // Samoa
  SMR: { value: 2 },      // San Marino
  STP: { value: 0.5 },    // Sao Tome & Principe
  SAU: { value: 1107 },   // Saudi Arabia
  SEN: { value: 28 },     // Senegal
  SRB: { value: 63 },     // Serbia
  SYC: { value: 2 },      // Seychelles
  SLE: { value: 4 },      // Sierra Leone
  SGP: { value: 497 },    // Singapore
  SVK: { value: 120 },    // Slovakia
  SVN: { value: 69 },     // Slovenia
  SLB: { value: 1 },      // Solomon Islands
  SOM: { value: 8 },      // Somalia
  ZAF: { value: 406 },    // South Africa
  SSD: { value: 4 },      // South Sudan
  ESP: { value: 1495 },   // Spain
  LKA: { value: 91 },     // Sri Lanka
  SDN: { value: 34 },     // Sudan
  SUR: { value: 6 },      // Suriname
  SWE: { value: 604 },    // Sweden
  CHE: { value: 892 },    // Switzerland
  SYR: { value: 21 },     // Syria
  TWN: { value: 789 },    // Taiwan (estimate)
  TJK: { value: 11 },     // Tajikistan
  TZA: { value: 85 },     // Tanzania
  THA: { value: 536 },    // Thailand
  TLS: { value: 2 },      // Timor-Leste
  TGO: { value: 8 },      // Togo
  TON: { value: 0.5 },    // Tonga
  TTO: { value: 30 },     // Trinidad and Tobago
  TUN: { value: 54 },     // Tunisia
  TUR: { value: 1148 },   // Turkey
  TKM: { value: 46 },     // Turkmenistan
  TUV: { value: 0.05 },   // Tuvalu
  UGA: { value: 46 },     // Uganda
  UKR: { value: 156 },    // Ukraine
  ARE: { value: 509 },    // United Arab Emirates
  GBR: { value: 3205 },   // United Kingdom
  USA: { value: 26465 },  // United States
  URY: { value: 74 },     // Uruguay
  UZB: { value: 89 },     // Uzbekistan
  VUT: { value: 1 },      // Vanuatu
  VEN: { value: 210 },    // Venezuela (estimate)
  VNM: { value: 430 },    // Vietnam
  YEM: { value: 21 },     // Yemen
  ZMB: { value: 29 },     // Zambia
  ZWE: { value: 29 }      // Zimbabwe
}
    }, 2000)
})

// const dataset = ref({
//     USA: {value: 120, category: 'CAT1', color: 'red'},
//     FRA: {value: 120, category: 'CAT1'},
//     JPN: {value: 89, category: 'CAT2'},
//     ESP: {value: 12, category: 'CAT2'}
// })

const model = ref([
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'projection', def: 'globe', type: 'select', options: ['mercator', 'equirectangular', 'mollweide', 'robinson', 'winkelTripel', 'aitoff', 'hammer', 'bonne', 'sinusoidal', 'vanDerGrinten', 'gallPeters', 'globe', 'azimuthalEquidistant']},

    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},

    { key: 'style.chart.territory.stroke', def: '#666666', type: 'color'},
    { key: 'style.chart.territory.strokeWidth', def: 0.5, type: 'number', min: 0.1, max: 12, step: 0.1},
    { key: 'style.chart.territory.strokeWidthSelected', def: 2, type: 'number', min: 0.1, max: 12, step: 0.1},
    { key: 'style.chart.territory.colors.min', def: '#E0E0E0', type: 'color'},
    { key: 'style.chart.territory.colors.max', def: '#FF0000', type: 'color'},
    
    { key: 'style.chart.title.text', def: 'Title', type: 'text' },
    { key: 'style.chart.title.subtitle.text', def: 'Subtitle', type: 'text' },
    
    { key: 'style.chart.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.dataLabels.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.dataLabels.rounding', def: 1, type: 'number', min: 0, max: 6},
    
    // { key: 'style.chart.dimensions.width', def: 1000, type: 'number', min: 200, max: 2000 },
    // { key: 'style.chart.dimensions.height', def: 500, type: 'number', min: 200, max: 2000 },

    { key: 'style.chart.globe.center.x', def: 0, type: 'number', min: -1000, max: 1000 },
    { key: 'style.chart.globe.center.y', def: 0, type: 'number', min: -1000, max: 1000 },
    { key: 'style.chart.globe.waterColor', def: '#1F77B4', type: 'color'},

    { key: 'style.chart.tooltip.showMinimap', def: true, type: 'checkbox'},

    { key: 'style.chart.legend.position', def: 'bottom', type: 'select', options: ['top', 'bottom']},

    { key: 'table.show', def: false, type: 'checkbox' },
    { key: 'table.useDialog', def: true, type: 'checkbox' },
]);

const projections = ref([
    'aitoff',
    'azimuthalEquidistant',
    'bonne',
    'equirectangular',
    'gallPeters',
    'globe',
    'hammer',
    'mercator',
    'mollweide',
    'robinson',
    'sinusoidal',
    'vanDerGrinten',
    'winkelTripel'
])

const currentProjection = ref('mollweide')

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        events: {
            datapointEnter: ({ datapoint, seriesIndex }) => {
                console.log('enter event', { datapoint, seriesIndex });
            },
            datapointLeave: ({ datapoint, seriesIndex }) => {
                console.log('leave event', { datapoint, seriesIndex });
            },
            datapointClick: ({ datapoint, seriesIndex }) => {
                console.log('click event', { datapoint, seriesIndex });
            },
        },
        projection: currentProjection.value,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                dimensions: {
                    height: null,
                    width: null
                }
            }
        }
    }
});

const local = ref(null)
onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <select v-model="currentProjection">
        <option v-for="p in projections">{{ p }}</option>
    </select>
    <Box>
        <template #title>VueUiWorld</template>
        
        <template #local>
            <LocalVueUiWorld :dataset="dataset" :config="config" ref="local">
                <template #pattern="{ datapoint, patternId }">
                <pattern :id="patternId" width="70" height="8" patternTransform="scale(2)"
                    patternUnits="userSpaceOnUse" opacity="0.5">
                    <rect width="100%" height="100%" fill="#FFFFFF20" />
                    <path fill="none" stroke="#ecc94b"
                        d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002" />
                </pattern>
                </template>
            </LocalVueUiWorld>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiWorld" :dataset="dataset" :config="config"/>
        </template>

        <template #build>
            <VueUiWorld :dataset="dataset" :config="config"/>
        </template>

        <template #build-treesh>
            <VueUiWorldTreeshaken :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiWorld" :dataset="dataset" :config="config"/>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>

    </Box>
</template>
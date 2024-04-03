<script setup>
/**
 *  MANUAL TESTING PAGE
 * 
 *  npm run dev
 * 
 *  Left col : current components in dev mode
 *  Right col: current components in production
 *
 * 
 */
import { ref, computed, onMounted } from "vue";
import PROD_CONFIG from "./default_configs.json";
import Box from "./Box.vue";
import BaseIcon from "./atoms/BaseIcon.vue";
import TableTest from "./components/vue-ui-table.vue";
import DonutTest from "./components/vue-ui-donut.vue";
import XyTest from "./components/vue-ui-xy.vue";
import WaffleTest from "./components/vue-ui-waffle.vue";
import RadarTest from "./components/vue-ui-radar.vue";
import QuadrantTest from "./components/vue-ui-quadrant.vue";
import GaugeTest from "./components/vue-ui-gauge.vue";
import ChestnutTest from "./components/vue-ui-chestnut.vue";
import OnionTest from "./components/vue-ui-onion.vue";
import VerticalTest from "./components/vue-ui-vertical-bar.vue";
import ScreenshotTest from "./components/vue-ui-screenshot.vue";
import RatingTest from "./components/vue-ui-rating.vue";
import SkeletonTest from "./components/vue-ui-skeleton.vue";
import SparklineTest from "./components/vue-ui-sparkline.vue";
import HeatmapTest from "./components/vue-ui-heatmap.vue";
import ScatterTest from "./components/vue-ui-scatter.vue";
import CandlestickTest from "./components/vue-ui-candlestick.vue";
import PyramidTest from "./components/vue-ui-age-pyramid.vue";
import SparkbarTest from "./components/vue-ui-sparkbar.vue";
import DashboardTest from "./components/vue-ui-dashboard.vue";
import AnnotatorTest from "./components/vue-ui-annotator.vue";
import SmileyTest from "./components/vue-ui-smiley.vue";
import RelationTest from "./components/vue-ui-relation-circle.vue";
import ThermoTest from "./components/vue-ui-thermometer.vue";
import StackTest from "./components/vue-ui-sparkstackbar.vue";
import HistoTest from "./components/vue-ui-sparkhistogram.vue";
import RingsTest from "./components/vue-ui-rings.vue";
import WheelTest from "./components/vue-ui-wheel.vue";
import TireTest from "./components/vue-ui-tiremarks.vue";
import MoodRadarTest from "./components/vue-ui-mood-radar.vue";
import Bar3dTest from "./components/vue-ui-3d-bar.vue";
import DigitsTest from "./components/vue-ui-digits.vue";
import MoleculeTest from './components/vue-ui-molecule.vue';
import DonutEvolutionTest from "./components/vue-ui-donut-evolution.vue";
import TableSparklineTest from "./components/vue-ui-table-sparkline.vue";
import MiniLoaderTest from "./components/vue-ui-mini-loader.vue";
import NestedDonutsTest from "./components/vue-ui-nested-donuts.vue";
import { getVueDataUiConfig } from "vue-data-ui";
import SparkGaugeTest from "./components/vue-ui-sparkgauge.vue";
import VueDataUiTest from "./components/vue-data-ui.vue";
import VueDataUi from "./components/vue-data-ui.vue";
import VueUiKpiTest from "./components/vue-ui-kpi.vue";
import GalaxyTest from "./components/vue-ui-galaxy.vue";

const dataset = ref([
  {
    name: "Serie 1",
    series: [200],
    type: "bar",
    dataLabels: true
  },
  {
    name: "Some long name",
    series: [100],
    type: "bar",
    dataLabels: true
  },
  {
    name: "Some even longer name",
    series: [150],
    type: "bar",
  },
  {
    name: "Weird serie name",
    series: [90],
    type: "bar",
  },
  {
    name: "Another weird long name",
    series: [120],
    type: "bar",
  },
]);

const dataset2 = ref([
    {
        name: "Series 1",
        series: [ -55, -34, -21, -13, -8, -5, -3, -2, -1, -1, 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
        type: "bar",
        color: "rgb(95,139,238)"
    },
    {
        name: "Series 2",
        series: [ 55, 34, 21, 13, 8, 5, 3, 2, 1, 1, 0, -1, -1, -2, -3, -5, -8, -13, -21, -34, -55],
        type: "line",
        color: "rgb(66,211,146)",
        useArea: true,
        useProgression: true,
        dataLabels: false,
        shape: "hexagon"
    },
    {
        name: "Series 3",
        series: [ 64, 60, 52, 42, 30, 16, 0, -18, -38, -46, -50, -46, -38, -18, 0, 16, 30, 42, 52, 60, 64],
        type: "plot",
        color: "rgb(255,100,0)",
        shape: "star"
    },
    {
        name: "Series 4",
        series: [ 0, 1, -2, 3, -4, 5, -6, 7, -8, 9, -10, 11, -12, 13, -14, 15, -16, 17, -18, 19, -20],
        type: "line",
        smooth: true,
        useArea: false,
        dataLabels: false,
        color: "rgb(200,200,50)",
        shape: "pentagon"
    },
    {
        name: "Target",
        series: [ 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
        type: "line",
        color: "#404040",
        dashed: true,
        useTag: "start",
        dataLabels: false,
    },
]);

const config = ref(getVueDataUiConfig('vue_ui_xy'))

console.log(config.value.chart)

const head = ref([
  {
    name: "touchpoint",
    type: "text",
    average: false,
    decimals: undefined,
    sum: false,
    isSort: true,
    isSearch: true,
    isMultiselect: true,
    isPercentage: false,
    percentageTo: undefined,
    suffix: "",
    prefix: "",
    rangeFilter: false,
  },
  {
    name: "category",
    type: "text",
    average: false,
    decimals: undefined,
    sum: false,
    isSort: false,
    isSearch: false,
    isMultiselect: true,
    isPercentage: false,
    percentageTo: undefined,
    suffix: "",
    prefix: "",
    rangeFilter: false,
  },
  {
    name: "date",
    type: "date",
    average: false,
    decimals: undefined,
    sum: false,
    isSort: true,
    isSearch: false,
    isMultiselect: false,
    isPercentage: false,
    percentageTo: undefined,
    suffix: "",
    prefix: "",
    rangeFilter: false,
  },
  {
    name: "base",
    type: "numeric",
    average: true,
    decimals: 0,
    sum: true,
    isSort: true,
    isSearch: false,
    isMultiselect: false,
    isPercentage: false,
    percentageTo: undefined,
    suffix: "",
    prefix: "",
    rangeFilter: false,
  },
  {
    name: "rating",
    type: "numeric",
    decimals: 1,
    average: true,
    sum: false,
    isSort: true,
    isSearch: false,
    isMultiselect: false,
    isPercentage: false,
    percentageTo: undefined,
    suffix: "",
    prefix: "",
    rangeFilter: true,
  },
  {
    name: "spend",
    type: "numeric",
    decimals: 1,
    average: true,
    sum: true,
    isSort: true,
    isSearch: false,
    isMultiselect: false,
    isPercentage: false,
    percentageTo: undefined,
    suffix: "€",
    prefix: "",
    rangeFilter: true,
  },
  {
    name: "percentage",
    type: "numeric",
    decimals: 1,
    average: false,
    sum: false,
    isSort: true,
    isSearch: false,
    isMultiselect: false,
    isPercentage: true, // requires an empty slot in the body td arrays!
    percentageTo: "base",
    suffix: "",
    prefix: "",
    rangeFilter: false,
  },
  {
    name: "happy",
    type: "numeric",
    decimals: 0,
    average: true,
    sum: true,
    isSort: true,
    isSearch: false,
    isMultiselect: false,
    isPercentage: false,
    percentageTo: "base",
    suffix: "",
    prefix: "",
    rangeFilter: false,
  },
  {
    name: "sad",
    type: "numeric",
    decimals: 0,
    average: true,
    sum: true,
    isSort: true,
    isSearch: false,
    isMultiselect: false,
    isPercentage: false,
    percentageTo: "base",
    suffix: "",
    prefix: "",
    rangeFilter: false,
  },
]);

const body = computed(() => {
  const categories = ["Accueil", "Magasin", "Caisse", "SAV"];
  const itemNames = [
    "Qualité du service",
    "Rapidité de livraison",
    "Efficacité du personnel",
    "Variété des produits",
    "Propreté des lieux",
    "Réactivité du support",
    "Prix compétitifs",
    "Expérience utilisateur",
    "Fiabilité du matériel",
  ];

  function generateRandomData() {
    const items = [];

    for (let i = 0; i < 1000; i += 1) {
      const itemName = getRandomItemName();
      const category = getRandomCategory();
      let accueil = Math.random() * 100;
      const date = getRandomDate();
      const data = [
        itemName,
        category,
        date,
        accueil,
        Number((Math.random() * 5).toFixed(1)),
        Math.random() * 200,
        "",
        Math.random() * (Math.random() > 0.5 ? 150 : -30),
        Math.random() * 350,
      ];
      items.push({ td: data });
    }

    return items;
  }

  function getRandomItemName() {
    const randomIndex = Math.floor(Math.random() * itemNames.length);
    return itemNames[randomIndex];
  }

  function getRandomCategory() {
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
  }

  function getRandomDate() {
    const start = new Date(2023, 0, 1).getTime();
    const end = new Date(2023, 11, 31).getTime();
    const randomTime = Math.random() * (end - start) + start;
    const randomDate = new Date(randomTime);
    const formattedDate = randomDate.toISOString().split("T")[0];
    return formattedDate;
  }
  return generateRandomData();
});

const tableTestDataset = {
  header: head.value,
  body: body.value,
};

const donutDataset = [
  {
    name: "serie 1",
    color: "",
    values: [1],
    shape: "star"
  },
  {
    name: "serie 2",
    color: "",
    values: [2],
    shape: "diamond"
  },
  {
    name: "serie 3",
    color: "",
    values: [3],
    shape: "triangle"
  },
  {
    name: "serie 4",
    color: "",
    values: [3, 5],
    shape: "hexagon"
  },
];

const waffleDataset = [
  {
    name: "serie 1",
    color: "",
    values: [1],
    shape: "star"
  },
  {
    name: "serie 2",
    color: "",
    values: [2.2],
    shape: "diamond"
  },
  {
    name: "serie 3",
    color: "",
    values: [3],
    shape: "triangle"
  },
  {
    name: "serie 4",
    color: "",
    values: [3, 5],
    shape: "hexagon"
  },
];


const radarDataset = ref({
  categories: [
    {
      name: "category 1",
      prefix: "a",
      suffix: "b"
    },
    {
      name: "category 2",
      prefix: "c",
      suffix: "d"
    },
    {
      name: "category 3",
      prefix: "e",
      suffix: "f"
    },
  ],
  series: [
    {
      name: "Serie 1",
      values: [1, 2, 3],
      color: "",
      target: 3,
    },
    {
      name: "Serie 2",
      values: [2, 3, 4],
      color: "",
      target: 10,
    },
    {
      name: "Serie 3",
      values: [3, 4, 5],
      color: "",
      target: 10,
    },
    {
      name: "Serie 4",
      values: [4, 5, 6],
      color: "",
      target: 10,
    },
    {
      name: "Serie 5",
      values: [5, 6, 7],
      color: "",
      target: 10,
    },
    {
      name: "Serie 6",
      values: [6, 7, 8],
      color: "",
      target: 10,
    },
  ],
});

const quadrantDataset = ref([
  {
    name: "category 1",
    shape: "star",
    series: [
      {
        name: "cat1 item1",
        x: 50,
        y: 50,
      },
      {
        name: "cat1 item2",
        x: -25,
        y: -25,
      },
      {
        name: "cat1 item3",
        x: -25,
        y: 25,
      },
      {
        name: "cat1 item4",
        x: 25,
        y: -25,
      },
    ],
  },
  {
    name: "category 2",
    shape: "circle",
    series: [
      {
        name: "cat2 item1",
        x: -60,
        y: -60,
      },
      {
        name: "cat2 item2",
        x: 12,
        y: -24,
      },
      {
        name: "cat2 item3",
        x: -16,
        y: 32,
      },
      {
        name: "cat2 item4",
        x: 15,
        y: 6,
      },
    ],
  },
]);

const gaugeDataset = ref({
  base: 0,
  value: 4.2,
  series: [
    {
      from: 0,
      to: 3,
    },
    {
      from: 3,
      to: 4,
    },
    {
      from: 4,
      to: 5,
    },
  ],
});

const chestnutDataset = ref([
  {
    name: "Root1",
    branches: [
      {
        name: "branch 1.1",
        value: 200,
        breakdown: [
          {
            name: "break 1.1.1",
            value: 50,
          },
          {
            name: "break 1.1.2",
            value: 25,
          },
          {
            name: "break 1.1.3",
            value: 25,
          },
        ],
      },
      {
        name: "branch 1.2",
        value: 100,
        breakdown: [
          {
            name: "break 1.2.1",
            value: 10,
          },
          {
            name: "break 1.2.2",
            value: 20,
          },
          {
            name: "break 1.2.3",
            value: 70,
          },
        ],
      },
    ],
  },
  {
    name: "Root2",
    branches: [
      {
        name: "branch 2.1",
        value: 200,
        breakdown: [
          {
            name: "break 2.1.1",
            value: 150,
          },
          {
            name: "break 2.1.2",
            value: 25,
          },
          {
            name: "break 2.1.3",
            value: 25,
          },
        ],
      },
      {
        name: "branch 2.2",
        value: 300,
        breakdown: [
          {
            name: "break 2.2.1",
            value: 100,
          },
          {
            name: "break 2.2.2",
            value: 10,
          },
          {
            name: "break 2.2.3",
            value: 150,
          },
        ],
      },
    ],
  },
  {
    name: "Root3",
    branches: [
      {
        name: "branch 3.1",
        value: 120,
        breakdown: [
          {
            name: "break 3.1.1",
            value: 100,
          },
          {
            name: "break 3.1.2",
            value: 10,
          },
          {
            name: "break 3.1.3",
            value: 10,
          },
        ],
      },
      {
        name: "branch 3.2",
        value: 90,
        breakdown: [
          {
            name: "break 3.2.1",
            value: 30,
          },
          {
            name: "break 3.2.2",
            value: 30,
          },
          {
            name: "break 3.2.3",
            value: 40,
          },
        ],
      },
    ],
  },
  {
    name: "Root4",
    branches: [
      {
        name: "branch 4.1",
        value: 120,
        breakdown: [
          {
            name: "break 4.1.1",
            value: 100,
          },
          {
            name: "break 4.1.2",
            value: 10,
          },
          {
            name: "break 4.1.3",
            value: 10,
          },
        ],
      },
      {
        name: "branch 4.2",
        value: 90,
        breakdown: [
          {
            name: "break 4.2.1",
            value: 30,
          },
          {
            name: "break 4.2.2",
            value: 30,
          },
          {
            name: "break 4.2.3",
            value: 40,
          },
        ],
      },
      {
        name: "branch 4.3",
        value: 90,
        breakdown: [
          {
            name: "break 4.3.1",
            value: 30,
          },
          {
            name: "break 4.3.2",
            value: 30,
          },
          {
            name: "break 4.3.3",
            value: 40,
          },
        ],
      },
      {
        name: "branch 4.4",
        value: 90,
        breakdown: [
          {
            name: "break 4.4.1",
            value: 30,
          },
          {
            name: "break 4.4.2",
            value: 30,
          },
          {
            name: "break 4.4.3",
            value: 40,
          },
        ],
      },
      {
        name: "branch 4.5",
        value: 90,
        breakdown: [
          {
            name: "break 4.5.1",
            value: 30,
          },
          {
            name: "break 4.5.2",
            value: 30,
          },
          {
            name: "break 4.5.3",
            value: 40,
          },
        ],
      },
      {
        name: "branch 4.6",
        value: 90,
        breakdown: [
          {
            name: "break 4.6.1",
            value: 30,
          },
          {
            name: "break 4.6.2",
            value: 30,
          },
          {
            name: "break 4.6.3",
            value: 40,
          },
        ],
      },
      {
        name: "branch 4.7",
        value: 10,
        breakdown: [
          {
            name: "break 4.7.1",
            value: 3,
          },
          {
            name: "break 4.7.2",
            value: 3,
          },
          {
            name: "break 4.7.3",
            value: 4,
          },
        ],
      },
    ],
  },
]);

const onionDataset = ref([
  {
    name: "Serie 1",
    percentage: 90,
    prefix: "",
    suffix: "",
  },
  {
    name: "Serie 2",
    percentage: 50,
    prefix: "",
    suffix: "",
  },
  {
    name: "Serie 3",
    percentage: 75,
    prefix: "",
    suffix: "",
  },
  {
    name: "Serie 4",
    percentage: 10,
    prefix: "",
    suffix: "",
  },
]);

const verticalDataset = ref([
  {
    name: "Serie 1",
    value: 100,
    color: "#FF0000",
    children: [
      {
        name: "serie 1 child 1",
        value: 80,
      },
      {
        name: "serie 1 child 2",
        value: 20,
      },
    ],
  },
  {
    name: "Serie 2",
    value: 345,
    color: "#0FF000",
  },
  {
    name: "Serie 3",
    value: 210,
    color: "#00FFA2",
  },
  {
    name: "Serie 4",
    value: 188,
    color: "#500FF0",
  },
  {
    name: "Serie 5",
    value: 120,
    color: "#0000FF",
    children: [
      {
        name: "Serie 5 child 1",
        value: 60,
      },
      {
        name: "Serie 5 child 2",
        value: 20,
      },
      {
        name: "Serie 5 child 3",
        value: 40,
      },
    ],
  },
]);


const ratingDataset = ref({
  // rating: 4
  rating: {
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 30,
  },
});

const ratingConfig = ref(getVueDataUiConfig('vue_ui_rating'));

const sparklineConfig = ref({
  type: 'line',
  style: {
    backgroundColor: "#CCCCCC"
  }
})
const sparklineConfig2 = ref({
  type: 'bar',
  style: {
    backgroundColor: "#CCCCCC"
  }
})

const sparklineDataset = ref([
  {
    period: "period2",
    value: 1,
  },
  {
    period: "period2",
    value: 2,
  },
  {
    period: "period2",
    value: 3,
  },
  {
    period: "period2",
    value: 8,
  },
  {
    period: "period2",
    value: 13,
  },
  {
    period: "period2",
    value: 21,
  },
  {
    period: "period2",
    value: 34,
  },
  {
    period: "period2",
    value: 55,
  },
  {
    period: "period2",
    value: 89,
  },
  {
    period: "period2",
    value: 134,
  },
  {
    period: "period2",
    value: 134,
  },
  {
    period: "period2",
    value: 134,
  },
  {
    period: "period2",
    value: 134,
  },
  {
    period: "period2",
    value: 134,
  },
  {
    period: "period2",
    value: 134,
  },
  {
    period: "period2",
    value: 134,
  },

]);
const sparklineDataset2 = ref([
  {
    period: "period2",
    value: -2,
  },
  {
    period: "period2",
    value: 2,
  },
  {
    period: "period2",
    value: 6,
  },
  {
    period: "period2",
    value: 3,
  },
  {
    period: "period2",
    value: 1,
  },
  {
    period: "period2",
    value: 5,
  },
  {
    period: "period2",
    value: 2,
  },
  {
    period: "period2",
    value: 8,
  },
  {
    period: "period2",
    value: 9,
  },
  {
    period: "period2",
    value: 3,
  },
  {
    period: "period2",
    value: 5,
  },
  {
    period: "period2",
    value: 2,
  },

]);

const heatmapDataset = computed(() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const arr = [];
  const dsLen = 52;
  const serieLen = days.length;
  for (let i = 0; i < serieLen; i += 1) {
    const values = [];
    for (let j = 0; j < dsLen; j += 1) {
      values.push(Math.random() * 100);
    }
    arr.push({
      name: `${days[i]}`,
      values,
    });
  }
  return arr;
});

const weeks = computed(() => {
  const arr = [];
  for (let i = 0; i < 52; i += 1) {
    arr.push(i + 1);
  }
  return arr;
});

// const scat1 = computed(() => {
//   const arr = [];
//   for (let i = 0; i < 50; i += 1) {
//     arr.push({
//       x: Math.random() * i + 12,
//       y: (Math.random() * i) / 20,
//       name: `plot_${i}_cluster_1`,
//     });
//   }
//   return arr;
// });
// const scat2 = computed(() => {
//   const arr = [];
//   for (let i = 0; i < 50; i += 1) {
//     arr.push({
//       x: (Math.random() * i) / 10,
//       y: (Math.random() * i) / 10,
//       name: `plot_${i}_cluster_2`,
//     });
//   }
//   return arr;
// });

const scat1 = ref([
  {
    x: 1,
    y: 2,
    name: '1'
  },
  {
    x: 0.3,
    y: 1.6,
    name: '1'
  },
  {
    x: 3,
    y: 2.1,
    name: '1'
  },
  {
    x: 3,
    y: 2.2,
    name: '1'
  },
  {
    x: 1.3,
    y: 1.2,
    name: '1'
  }
])

const scat2 = ref([
  {
    x: 1,
    y: 2,
    name: '1'
  },
  {
    x: 0.3,
    y: 1.6,
    name: '1'
  },
  {
    x: 3,
    y: 2.1,
    name: '1'
  },
  {
    x: 3,
    y: 20.2,
    name: '1'
  },
  {
    x: 1.3,
    y: -20.2,
    name: '1'
  }
])

const scatterDataset = computed(() => {
  return [
    {
      name: "Cluster 1",
      values: scat1.value,
      shape: "star"
    },
    {
      name: "Cluster 2",
      values: scat2.value,
      shape: "diamond"
    },
  ];
});

// date | open | high | low | last | volume
const candlestickDataset = ref([
  ["2024-01-01", 56, 120, 40, 110, 1250],
  ["2024-02-01", 110, 150, 80, 98, 2200],
  ["2024-03-01", 98, 155, 75, 103, 3500],
  ["2024-04-01", 103, 115, 102, 102, 999],
  ["2024-05-01", 102, 135, 72, 85, 3216],
  ["2024-06-01", 85, 162, 65, 107, 4315],
  ["2024-07-01", 107, 134, 99, 112, 2561],
  ["2024-08-01", 112, 125, 112, 120, 669],
  ["2024-09-01", 120, 113, 76, 89, 2591],
  ["2024-10-01", 89, 150, 85, 125, 2881],
  ["2024-11-01", 125, 130, 45, 92, 1972],
  ["2024-12-01", 92, 120, 35, 75, 3599],
  ["2024-13-01", 75, 80, 26, 45, 5881],
  ["2024-14-01", 45, 60, 20, 30, 2881],
  ["2024-15-01", 30, 120, 10, 105, 2881],
]);

const barset = ref([
  {
    name: "test of a long name",
    series: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200],
    type: "bar",
    color: "rgb(10,20,30)",
    dataLabels: true,
  },
]);

const pyramidDataset = ref([
  ["2022", 0, 330929, 345538],
  ["2021", 1, 343026, 357351],
  ["2020", 2, 341042, 356678],
  ["2019", 3, 351707, 368670],
  ["2018", 4, 356873, 376705],
  ["2017", 5, 366538, 382762],
  ["2016", 6, 377726, 394679],
  ["2015", 7, 388256, 407067],
  ["2014", 8, 402149, 417528],
  ["2013", 9, 404450, 422473],
  ["2012", 10, 410103, 432223],
  ["2011", 11, 413317, 433203],
  ["2010", 12, 424529, 445511],
  ["2009", 13, 419008, 440783],
  ["2008", 14, 420554, 444448],
  ["2007", 15, 419925, 440752],
  ["2006", 16, 423157, 447090],
  ["2005", 17, 413489, 437659],
  ["2004", 18, 406838, 432885],
  ["2003", 19, 399346, 422821],
  ["2002", 20, 396836, 418660],
  ["2001", 21, 395152, 418256],
  ["2000", 22, 399322, 421152],
  ["1999", 23, 376314, 389580],
  ["1998", 24, 376420, 382554],
  ["1997", 25, 369379, 374512],
  ["1996", 26, 374287, 374366],
  ["1995", 27, 375987, 372252],
  ["1994", 28, 372462, 362967],
  ["1993", 29, 375228, 367127],
  ["1992", 30, 395137, 383535],
  ["1991", 31, 402304, 390496],
  ["1990", 32, 413380, 402198],
  ["1989", 33, 419725, 400620],
  ["1988", 34, 428232, 405642],
  ["1987", 35, 429765, 403630],
  ["1986", 36, 436039, 409529],
  ["1985", 37, 436180, 407776],
  ["1984", 38, 429907, 404828],
  ["1983", 39, 422931, 399376],
  ["1982", 40, 446946, 425275],
  ["1981", 41, 449043, 427052],
  ["1980", 42, 455337, 432659],
  ["1979", 43, 428335, 409645],
  ["1978", 44, 418005, 402427],
  ["1977", 45, 416080, 404238],
  ["1976", 46, 404733, 393123],
  ["1975", 47, 416726, 406790],
  ["1974", 48, 436700, 427666],
  ["1973", 49, 459061, 445647],
  ["1972", 50, 468092, 457790],
  ["1971", 51, 464859, 454831],
  ["1970", 52, 454624, 442538],
  ["1969", 53, 450429, 434516],
  ["1968", 54, 445982, 426911],
  ["1967", 55, 443201, 426371],
  ["1966", 56, 456200, 435374],
  ["1965", 57, 458021, 434732],
  ["1964", 58, 463713, 436775],
  ["1963", 59, 458019, 427867],
  ["1962", 60, 441677, 411946],
  ["1961", 61, 440838, 409935],
  ["1960", 62, 440031, 404615],
  ["1959", 63, 437495, 399222],
  ["1958", 64, 427408, 385431],
  ["1957", 65, 425143, 380771],
  ["1956", 66, 421921, 372735],
  ["1955", 67, 417746, 364324],
  ["1954", 68, 412362, 360581],
  ["1953", 69, 402938, 350286],
  ["1952", 70, 408892, 351245],
  ["1951", 71, 395165, 339003],
  ["1950", 72, 406186, 347191],
  ["1949", 73, 397980, 334869],
  ["1948", 74, 393918, 330809],
  ["1947", 75, 382802, 318941],
  ["1946", 76, 360229, 294509],
  ["1945", 77, 270554, 215908],
  ["1944", 78, 260729, 205234],
  ["1943", 79, 251396, 194632],
  ["1942", 80, 229671, 175016],
  ["1941", 81, 201481, 149738],
  ["1940", 82, 205289, 149241],
  ["1939", 83, 213155, 145977],
  ["1938", 84, 201331, 134533],
  ["1937", 85, 193010, 122661],
  ["1936", 86, 185617, 113163],
  ["1935", 87, 173069, 96916],
  ["1934", 88, 163504, 87182],
  ["1933", 89, 144334, 72742],
  ["1932", 90, 136362, 63495],
  ["1931", 91, 117375, 51502],
  ["1930", 92, 101803, 40794],
  ["1929", 93, 80263, 29551],
  ["1928", 94, 65489, 21814],
  ["1927", 95, 51604, 15240],
  ["1926", 96, 40212, 10858],
  ["1925", 97, 29496, 7310],
  ["1924", 98, 20911, 4787],
  ["1923", 99, 15028, 3284],
  ["<=1922", 100, 25745, 4277],
]);

// IDEAS:
// . treeselector (with sums & avgs & so on)

const sparkbarConfig = ref({});
const sparkbarDataset = ref([
  {
    name: "Some random kpi",
    value: 80.8798798787,
    suffix: "%",
    rounding: 1,
  },
  {
    name: "Some other kpi",
    value: 95.26576576565,
    suffix: "%",
    rounding: 2,
  },
]);

const xytest = ref(null);

function selectLegendXY(ds) {
  console.log(ds);
  const data = xytest.value.getData();
  console.log("getData", data);
}

function selectX(x) {
  console.log(x);
}

const donuttest = ref(null);

function selectLegendDonut(d) {
  console.log(d);
  const data = donuttest.value.getData();
  console.log("getData", data);
}

const waffletest = ref(null);

function selectLegendWaffle(w) {
  console.log(w);
  const data = waffletest.value.getData();
  console.log("getData", data);
}

const radartest = ref(null);

function selectRadarLegend(r) {
  console.log(r);
  const data = radartest.value.getData();
  console.log("getData", data);
}

function selectPlot(plot) {
  console.log({ plot });
}

const quadranttest = ref(null);

function selectSide(side) {
  console.log({ side });
  const data = quadranttest.value.getData();
  console.log("getData", data);
}

function selectQuadrantLegend(data) {
  console.log(data);
}

const scatter = ref(null);

onMounted(() => {
  console.log(scatter.value.getData());
});

function selectRoot(r) {
  console.log(r);
}

function selectBranch(b) {
  console.log(b);
}

function selectNut(n) {
  console.log(n);
}

function selectOnionLegend(o) {
  console.log(o);
}

function selectVerticalLegend(v) {
  console.log(v);
}

const screenshottest = ref(null);

function sstest() {
  screenshottest.value.shoot();
}

const pic = ref("");

function postImage(i) {
  console.log(i);
  pic.value = i.image;
}

const ratingtest = ref(null);

const isRead = ref(false);
function toggleRead() {
  isRead.value = !isRead.value;
  ratingtest.value.toggleReadonly(isRead.value);
}

const dashboardConfig = ref({
  style: {
    board: {
      backgroundColor: "#FFFFFF",
      border: "1px solid #e1e5e8",
    },
    item: {
      backgroundColor: "#FFFFFF",
      borderColor: "#e1e5e8",
    },
    resizeHandles: {
      backgroundColor: "#2D353C",
      unselectedOpacity: 0.1,
      border: "none",
    },
  },
  allowPrint: true,
});

const comps = ref([
  {
    id: 2,
    width: 20,
    height: 50,
    left: 44,
    top: 4,
    component: "VueUiGauge",
    props: { config: { userOptions: { show: false } }, dataset: gaugeDataset },
  },
  {
    id: 2,
    width: 20,
    height: 60,
    left: 44,
    top: 50,
    component: "VueUiOnion",
    props: { config: { userOptions: { show: false } }, dataset: onionDataset },
  },
]);

function testchange(el) {
  console.log(el);
}

const dash = ref(null);

function getDashPositions() {
  console.log(dash.value.getItemsPositions());
}

function makeDashPdf() {
  dash.value.generatePdf();
}

function saveAnnotations({ shapes, lastSelectedShape }) {
  console.log({ shapes, lastSelectedShape });
}

const shapes = ref([
  {
    alpha: "",
    id: "rect_4786.525081496351_1697870578915",
    color: "#000000",
    isFilled: false,
    rectStrokeWidth: 2,
    rectHeight: 71.01970280219712,
    rectWidth: 71.01943098308863,
    type: "rect",
    x: 226.68835358228716,
    y: 208.03757503871424,
    strokeWidth: 1,
    isDash: false,
  },
  {
    alpha: "",
    id: "rect_9773.345538613725_1697870579459",
    color: "#000000",
    isFilled: false,
    rectStrokeWidth: 2,
    rectHeight: 109.75774241468878,
    rectWidth: 80.34523889795713,
    type: "rect",
    x: 413.9214312422939,
    y: 229.55870207553664,
    strokeWidth: 1,
    isDash: false,
  },
  {
    alpha: "",
    id: "rect_2695.1441197115723_1697870579941",
    color: "#000000",
    isFilled: false,
    rectStrokeWidth: 2,
    rectHeight: 146.34370216213188,
    rectWidth: 119.08315761082781,
    type: "rect",
    x: 621.2408117854341,
    y: 263.27511254080264,
    strokeWidth: 1,
    isDash: false,
  },
]);

const lastSelectedShape = ref({
  alpha: "",
  id: "rect_2695.1441197115723_1697870579941",
  color: "#000000",
  isFilled: false,
  rectStrokeWidth: 2,
  rectHeight: 146.34370216213188,
  rectWidth: 119.08315761082781,
  type: "rect",
  x: 621.2408117854341,
  y: 263.27511254080264,
  strokeWidth: 1,
  isDash: false,
});

function toggleOpenState(isOpen) {
  console.log(isOpen);
}

const smileyConfig = ref({
  readonly: false,
  style: {
    fontFamily: "inherit",
    itemSize: 32,
    backgroundColor: "#FFFFFF",
    colors: {
      activeReadonly: ["#e20001", "#ff9f03", "#ffd004", "#61c900", "#059f00"],
      active: ["#e20001", "#ff9f03", "#ffd004", "#61c900", "#059f00"],
      inactive: ["#e1e5e8", "#e1e5e8", "#e1e5e8", "#e1e5e8", "#e1e5e8"],
    },
    icons: {
      filled: false,
      useGradient: true,
    },
    title: {
      textAlign: "center",
      fontSize: 20,
      color: "#2D353C",
      bold: true,
      text: "Title",
      offsetY: 6,
      subtitle: {
        fontSize: 14,
        color: "#CCCCCC",
        bold: false,
        text: "Subtitle",
        offsetY: 12,
      },
    },
    rating: {
      show: true,
      fontSize: 28,
      bold: true,
      roundingValue: 1,
      position: "bottom",
      offsetY: 0,
      offsetX: 0,
    },
    tooltip: {
      show: true,
      fontSize: 14,
      offsetY: 0,
      color: "#2D353C",
      bold: true,
      backgroundColor: "#FFFFFF",
      borderColor: "#e1e5e8",
      borderRadius: 4,
      boxShadow: "0 6px 12px -6px rgba(0,0,0,0.2)",
    },
  },
});

const relationConfig = ref({
  userOptions: {
    show: true
  },  
  style: {
    backgroundColor: "#FFFFFF",
    fontFamily: "inherit",
    size: 400,
    limit: 50,
    animation: {
      show: false,
      speedMs: 300
    },
    labels: {
      fontSize: 10,
      color: "#000000"
    },
    links: {
      curved: true,
      maxWidth: 3
    },
    circle: {
      radiusProportion: 0.2,
      stroke: "#CCCCCC",
      strokeWidth: 1,
      offsetY: 30,
    },
    plot: {
      radius: 2
    },
    title: {
      useDiv: false,
      text: "Title",
      color: "#2D353C",
      fontSize: 20,
      bold: true,
      subtitle: {
        color: "#A1A1A1",
        text: "Subtitle",
        fontSize: 16,
        bold: false
      }
    }
  }
});

const relationDataset = ref([
  {
    id: "01",
    label: "Lorem",
    relations: ["02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
    weights: [5, 3, 10, 2, 9, 3, 1, 2, 3, 7, 1],
    color: "#eb4034",
  },
  {
    id: "02",
    label: "Ipsum",
    relations: ["01", "03", "07", "06", "07"],
    weights: [3, 2, 9, 7, 1],
    color: "#e0992d",
  },
  {
    id: "03",
    label: "Dolor",
    relations: ["01", "02"],
    weights: [2, 5],
    color: "#decc2c",
  },
  {
    id: "04",
    label: "Consectetur",
    relations: ["01", "05", "10"],
    weights: [2, 1, 4],
    color: "#a8de2a",
  },
  {
    id: "05",
    label: "Amet",
    relations: ["01", "04", "07", "10"],
    weights: [2, 3, 4, 5],
    color: "#5ed622",
  },
  {
    id: "06",
    label: "Rherum",
    relations: ["01", "02"],
    weights: [4, 1],
    color: "#21d92d",
  },
  {
    id: "07",
    label: "Delecta",
    relations: ["01", "02", "08", "12"],
    weights: [4, 8, 2, 1],
    color: "#23d97b",
  },
  {
    id: "08",
    label: "Nitimur",
    relations: ["01", "07", "12", "01"],
    weights: [7, 3, 2, 3],
    color: "#29d6c2",
  },
  {
    id: "09",
    label: "Vetitum",
    relations: ["01"],
    weights: [1],
    color: "#2aacdb",
  },
  {
    id: "10",
    label: "Monumentum",
    relations: ["01", "04", "05"],
    weights: [4, 1, 4],
    color: "#295bd9",
  },
  {
    id: "11",
    label: "Aere",
    relations: ["01"],
    weights: [3],
    color: "#523ed6",
  },
  {
    id: "12",
    label: "Perennius",
    relations: ["01", "07", "08"],
    weights: [8, 1, 1],
    color: "#8235db",
  },
]);

const thermoDataset = ref({
  value: 30.77,
  from: -100,
  to: 100,
  steps: 20,
  colors: {
    from: "#dc3912",
    to: "#3366cc",
  }
});

const thermoConfig = ref({
  style: {
    fontFamily: "inherit",
    chart: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      height: 360,
      thermometer: {
        width: 48
      },
      padding: {
        top: 12,
        bottom: 12,
        left: 64,
        right: 64
      },
      graduations: {
        show: true,
        sides: "both",
        height: 2,
        stroke: "#e1e5e8",
        strokeWidth: 1,
        showIntermediate: true,
        gradient: {
          show: true,
          intensity: 20
        }
      },
      animation: {
        use: true,
        speedMs: 1000
      },
      label: {
        fontSize: 14,
        rounding: 1,
        bold: true,
        color: "#FAFAFA",
        prefix: "$",
        suffix: "£"
      }
    },
    title: {
      useDiv: true,
      text: "Title",
      color: "#FAFAFA",
      fontSize: 20,
      bold: true,
      subtitle: {
        color: "#A1A1A1",
        text: "Subtitle",
        fontSize: 16,
        bold: false
      }
    }
  },
  userOptions: {
    show: true,
    title: "options",
    labels: {
      useDiv: "Title inside"
    }
  }
});

function printXy() {
  xytest.value.generatePdf();
}
function xlsXy() {
  xytest.value.generateCsv();
}
function printDonut(){
  donuttest.value.generatePdf();
}
function xlsDonut() {
  donuttest.value.generateCsv();
}
function printWaffle(){
  waffletest.value.generatePdf();
}
function xlsWaffle() {
  waffletest.value.generateCsv();
}
function printRadar(){
  radartest.value.generatePdf();
}
function xlsRadar() {
  radartest.value.generateCsv();
}
function printQuadrant(){
  quadranttest.value.generatePdf();
}
function xlsQuadrant() {
  quadranttest.value.generateCsv();
}
const gaugetest = ref(null);
function printGauge(){
  gaugetest.value.generatePdf();
}

const chestnuttest = ref(null);
function printChestnut(){
  chestnuttest.value.generatePdf();
}
function xlsChestnut() {
  chestnuttest.value.generateCsv();
}

const oniontest = ref(null);
function printOnion(){
  oniontest.value.generatePdf();
}
function xlsOnion() {
  oniontest.value.generateCsv();
}

const verticaltest = ref(null);
function printVB(){
  verticaltest.value.generatePdf();
}
function xlsVB() {
  verticaltest.value.generateCsv();
}

const heatmaptest = ref(null);
function printHeatmap(){
  heatmaptest.value.generatePdf();
}
function xlsHeatmap() {
  heatmaptest.value.generateCsv();
}

function printScatter(){
  scatter.value.generatePdf();
}
function xlsScatter() {
  scatter.value.generateCsv();
}

const candlestick = ref(null);
function printCandle(){
  candlestick.value.generatePdf();
}
function xlsCandle() {
  candlestick.value.generateCsv();
}

const pyramid = ref(null);
function printPyramid(){
  pyramid.value.generatePdf();
}
function xlsPyramid() {
  pyramid.value.generateCsv();
}

const relation = ref(null);
function printRelation(){
  relation.value.generatePdf();
}

const thermo = ref(null);
function printThermo(){
  thermo.value.generatePdf();
}

const stackConfig = ref({
        "style": {
            "backgroundColor": "#1A1A1A",
            "fontFamily": "inherit",
            "bar": {
                "gradient": {
                    "show": true,
                    "intensity": 40,
                    "underlayerColor": "#FFFFFF"
                }
            },
            "legend": {
                "textAlign": "left",
                "show": true,
                "fontSize": 12,
                "name": {
                    "color": "#FAFAFA",
                    "bold": false
                },
                "value": {
                    "show": true,
                    "bold": false,
                    "color": "#FAFAFA",
                    "prefix": "",
                    "suffix": "",
                    "rounding": 0
                },
                "percentage": {
                    "show": true,
                    "color": "#FAFAFA",
                    "bold": true,
                    "rounding": 1
                }
            },
            "title": {
                "textAlign": "left",
                "text": "Title",
                "color": "#FAFAFA",
                "fontSize": 16,
                "bold": true,
                "margin": "0 0 6px 0",
                "subtitle": {
                    "color": "#A1A1A1",
                    "text": "Some subtitle that serves as a long description of what is happening",
                    "fontSize": 12,
                    "bold": false
                }
            }
        }
    });
const stackDataset = ref([
  {
    name: "Vue",
    value: 258,
    color: ""
  },
  {
    name: "Javascript",
    value: 36,
    color: ""
  },
  {
    name: "Other",
    value: 16,
    color: ""
  },
]);

const histoConfig = ref({
        "style": {
            "backgroundColor":"#FFFFFF",
            "fontFamily":"inherit",
            "layout": {
                "height": 96,
                "width": 640,
                "padding": {
                    "top": 24,
                    "right": 0,
                    "left": 0,
                    "bottom": 36
                }
            },
            "bars": {
              "shape": "square",
                "strokeWidth": 0,
                "colors": {
                    "positive": "#3366cc",
                    "negative": "#dc3912",
                    "gradient": {
                        "show": true
                    }
                },
                "borderRadius": 24,
                "gap": 12
            },
            "labels": {
                "value": {
                    "fontSize": 14,
                    "color":"#2D353C",
                    "bold": true,
                    "rounding": 1,
                    "prefix":"",
                    "suffix":"",
                    "offsetY": -6
                },
                "valueLabel": {
                    "fontSize": 14,
                    "color":"#2D353C",
                    "bold": false,
                    "rounding": 0
                },
                "timeLabel": {
                    "fontSize": 12,
                    "color":"#2D353C",
                    "bold": false
                }
            },
            "title": {
                "textAlign": "left",
                "text": "Title",
                "color": "#2D353C",
                "fontSize": 16,
                "bold": true,
                "margin": "0 0 6px 0",
                "subtitle": {
                    "color": "#A1A1A1",
                    "text": "Subitle",
                    "fontSize": 12,
                    "bold": false
                }
            }
        }
    });

const histoDataset = ref([
  {
    value: 1.2,
    valueLabel: "20%",
    timeLabel: "09:00",
    intensity: 0.2,
  },
  {
    value: 1.3,
    valueLabel: "50%",
    timeLabel: "10:00",
    intensity: 0.5,

  },
  {
    value: 1.1,
    valueLabel: "60%",
    timeLabel: "11:00",
    intensity: 0.6,

  },
  {
    value: 0.8,
    valueLabel: "70%",
    timeLabel: "12:00",
    intensity: 0.7,

  },
  {
    value: 2,
    valueLabel: "100%",
    timeLabel: "13:00",
    intensity: 1,

  },
  {
    value: 2.1,
    valueLabel: "100%",
    timeLabel: "14:00",
    intensity: 1,

  },
  {
    value: 2.3,
    valueLabel: "80%",
    timeLabel: "15:00",
    intensity: 0.8,

  },
  {
    value: 2.1,
    valueLabel: "70%",
    timeLabel: "16:00",
    intensity: 0.7,

  },
  {
    value: 0.9,
    valueLabel: "60%",
    timeLabel: "17:00",
    intensity: 0.6,

  },
  {
    value: 0.7,
    valueLabel: "50%",
    timeLabel: "18:00",
    intensity: 0.5,

  },
  {
    value: 0.3,
    valueLabel: "30%",
    timeLabel: "19:00",
    intensity: 0.3,

  },
  {
    value: 0.2,
    valueLabel: "20%",
    timeLabel: "20:00",
    intensity: 0.2,

  },
]);

const ringsDataset = ref([
  {
    name: "Serie 1",
    values: [100]
  },
  {
    name: "Serie 2",
    values: [100, 80]
  },
  {
    name: "Serie 3",
    values: [120]
  },
  {
    name: "Serie 4",
    values: [60]
  },
  {
    name: "Serie 5",
    values: [20]
  },
  {
    name: "Serie 6",
    values: [10]
  },
  {
    name: "Serie 7",
    values: [2]
  },
])


const wheelDataset = ref({
  percentage: 66.5
})

const wheelConfig = ref(PROD_CONFIG.vvue_ui_wheel)

const showLocalTest = ref(false);

function copyConfig(c) {
  let selBox = document.createElement('textarea');
      selBox.style.position = 'fixed';
      selBox.style.left = '0';
      selBox.style.top = '0';
      selBox.style.opacity = '0';
      selBox.value = JSON.stringify(c);
      document.body.appendChild(selBox);
      selBox.focus();
      selBox.select();
      document.execCommand('copy');
      document.body.removeChild(selBox);
}

const updateStep = ref(0);

const skeletonOptions = ref([
  'line',
  'sparkline',
  'bar',
  'donut',
  'onion',
  'gauge',
  'quadrant',
  'radar',
  'waffle',
  'table',
  'rating',
  'verticalBar',
  'heatmap',
  'candlesticks',
  'pyramid',
  'rings',
  'wheel',
  'donutEvolution'
]);

const skeletonChoice = ref('donutEvolution')

const tiremarksDataset = ref({
  percentage: 75
})

const donutEvolutionDataset = ref([
  {
    name: "Serie 1",
    values: [0, null, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 0  ]
  },
  {
    name: "Serie 2",
    values: [10, null, 20, 10, 10, 10, 10, 10, 10, 10, 10, 10, 0 ]
  },
  {
    name: "Serie 3",
    values: [5, null, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0 ]
  },
  {
    name: "Serie 3",
    values: [5, null, 5, 5, 5, 5 ]
  }
])

const screenshotTest = ref(null)
const screenshotProd = ref(null)

function shootScreenTest() {
  if(screenshotTest.value && screenshotTest.value.shoot) {
    screenshotTest.value.shoot();
  }
}
function shootScreenProd() {
  screenshotProd.value.shoot();
}

const moodRadarDataset = ref({
  "1": 98,
  "2": 150,
  "3": 300,
  "4": 350,
  "5": 400
})

const moodRadarConfig = ref({
        "useCssAnimation": true,
        "style": {
            "fontFamily":"inherit",
            "chart": {
                "backgroundColor":"#FFFFFF",
                "color":"#2D353C",
                "layout": {
                    "grid": {
                        "show": true,
                        "stroke": "#e1e5e8",
                        "strokeWidth": 0.5,
                        "graduations": 5
                    },
                    "outerPolygon": {
                        "stroke":"#e1e5e8",
                        "strokeWidth":1
                    },
                    "dataPolygon": {
                        "color": "#5f8bee",
                        "opacity": 60,
                        "gradient": {
                            "show": true,
                            "intensity": 5
                        },
                        "stroke":"#5f8bee",
                        "strokeWidth": 0
                    },
                    "smileys": {
                        "strokeWidth": 1,
                        "colors": {
                            "1": "#e20001",
                            "2": "#ff9f03",
                            "3": "#ffd004",
                            "4": "#9ac900",
                            "5": "#059f00"
                        }
                    }
                },
                "title": {
                    "text": "TItle",
                    "color": "#2D353C",
                    "fontSize": 20,
                    "bold": true,
                    "subtitle": {
                        "color": "#A1A1A1",
                        "text": "Subtitle", 
                        "fontSize": 16,
                        "bold": false
                    }
                },
                "legend": {
                    "color": "#2D353C",
                    "backgroundColor": "#FFFFFF",
                    "bold": false,
                    "show": true,
                    "fontSize": 16,
                    "roundingPercentage": 0,
                    "roundingValue": 0
                }
            }
        },
        "table": {
            "show": false,
            "th": {
                "backgroundColor": "#FAFAFA",
                "color": "#2D353C",
                "outline": "1px solid #e1e5e8"
            },
            "td": {
                "backgroundColor": "#FFFFFF",
                "color": "#2D353C",
                "outline": "1px solid #e1e5e8",
                "roundingValue": 0,
                "roundingPercentage": 0
            }
        },
        "userOptions": {
            "show": true
        }
    })

  const bar3dDataset = ref({
    percentage: 66
  })

  const clusterDataset = ref([
    {
      name: "root",
      details: 'Lorem root',
      nodes: [
        {
          name: 'node1',
          details: 'Lorem ipsum',
          nodes: [
            { name: 'node1.1', details: 'Lorem ipsum', nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
            { name: 'node1.3'},
          ]},
            { name: 'node1.2',nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
            { name: 'node1.3'},
            { name: 'node1.4'},
          ]},
            { name: 'node1.3',nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
          ]},
            { name: 'node1.4',nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
            { name: 'node1.3'},
            { name: 'node1.4'},
            { name: 'node1.5'},
            
            { name: 'node1.6'},
          ]},
            { name: 'node1.5',nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
            { name: 'node1.3'},
            { name: 'node1.4'},
            { name: 'node1.5'},
            { name: 'node1.6'},
          ]},
            { name: 'node1.6', nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
            { name: 'node1.3'},
            { name: 'node1.4'},
            { name: 'node1.5'},
            { name: 'node1.6'},
          ]},
          ]
        },
        {
          name: 'node2',
          nodes: [
            { name: 'node2.1', nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
            { name: 'node1.3'},
            { name: 'node1.4'},
            { name: 'node1.5'},
            { name: 'node1.6', nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
            { name: 'node1.3'},
            { name: 'node1.4'},
            { name: 'node1.5'},
            { name: 'node1.6', nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
            { name: 'node1.3'},
            { name: 'node1.4'},
            { name: 'node1.5'},
            { name: 'node1.6', nodes: [
            { name: 'node1.1'},
            { name: 'node1.2'},
            { name: 'node1.3'},
            { name: 'node1.4'},
            { name: 'node1.5'},
            { name: 'node1.6'},
          ]},
          ]},
          ]},
          ]},
          ]
        },
        {
          name: 'node2',
          nodes: [
            { name: 'node3.1'},
            { name: 'node3.2'},
            { name: 'node3.3'},
          ]
        },
        {
          name: 'node3',
          nodes: [
            { name: 'node4.1'},
            { name: 'node4.2'},
            { name: 'node4.3'},
            { name: 'node4.4'},
          ]
        },
        {
          name: 'node3',
          nodes: [
            { name: 'node4.1'},
            { name: 'node4.2'},
            { name: 'node4.3'},
            { name: 'node4.4'},
            { name: 'node4.5'},
          ]
        },
        {
          name: 'node3',
          nodes: [
            { name: 'node4.1'},
            { name: 'node4.2'},
            { name: 'node4.3'},
            { name: 'node4.4'},
          ]
        },
      ]
    }
  ])

  const tableSparklineDataset = ref([
    {
      name: "Serie 1",
      values: [1, 2, 3, 8, 13, 21]
    },
    {
      name: "Serie 2",
      values: [12, 1, 6, 7, 5, 12]
    },
    {
      name: "Serie 3",
      values: [18, 12, 21, 12, 6, 7]
    },
  ])

  const miniLoaderConfig = ref({
    type: "line",
    onion: {
      gutterColor: "#CCCCCC",
      gutterOpacity: 0.3,
      gutterBlur: 0.2,
      trackHueRotate: 360,
      trackBlur: 1,
      trackColor: "#42d392"
    },
    line: {
      gutterColor: "#CCCCCC",
      gutterOpacity: 0.3,
      gutterBlur: 0,
      trackHueRotate: 360,
      trackBlur: 1,
      trackColor: "#42d392"
    },
    bar: {
      gutterColor: "#CCCCCC",
      gutterOpacity: 0.3,
      gutterBlur: 0.2,
      trackHueRotate: 360,
      trackBlur: 1,
      trackColor: "#42d392"
    }
  })

  const donutEvolutionConfig = ref({
    style: {
      chart: {
        layout: {
          grid: {
            xAxis: {
              dataLabels: {
                values: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN'],
                showOnlyFirstAndLast: true
              }
            }
          }
        }
      }
    }
  })

const donutConfig = ref({
  style: {
    chart: {
      tooltip: {
        // customFormat: ({ datapoint, seriesIndex, series , config}) => {
        //   console.log({datapoint, seriesIndex, series, config});
        //   return `<div style="background:${datapoint.color}33;color:${datapoint.color};padding:12px">
        //       ${datapoint.name} : ${datapoint.value}
        //     </div>`
        // }
      }
    }
  }
})

const xyConfig = ref({
  chart: {
    labels: {
      fontSize: 30
    },
    tooltip: {
      customFormat: ({ seriesIndex, datapoint, series,  bars, lines, plots, config }) => {
        console.log({seriesIndex, datapoint, series, bars, lines, plots, config});
        return 'TEST'
      }
    }
  },
  bar: {
      labels: {
        show: false,
      },
      serieName: {
          show: true,
          offsetY: -6,
          useAbbreviation: true,
          abbreviationSize: 4,
          useSerieColor: true,
          color: "#FF0000",
          bold: true
        }
    },
})

const waffleConfig = ref({
  style: {
    chart: {
      layout: {
        grid: {
          vertical: false
        },
        labels: {
          dataLabels: {
            prefix: "$",
            suffix: "€"
          },
          captions: {
            "show": true,
            "showSerieName": true,
            "serieNameAbbreviation": true,
            "serieNameMaxAbbreviationSize": 3,
            "fontSize": 20,
            "showValue": true,
            "showPercentage": true,
            "roundingValue": 0,
            "roundingPercentage": 0,
            "offsetX": 0,
            "offsetY": 0
          }
        }
      },
      tooltip: {
        customFormat: ({seriesIndex, datapoint, series, config}) => {
          console.log({seriesIndex, datapoint, series, config})
          return "TEST"
        }
      }
    }
  }
})

const radarConfig = ref({
  style: {
    chart: {
      tooltip: {
        // customFormat: ({ seriesIndex, datapoint, series, config }) => {
        //   console.log({seriesIndex, datapoint, series, config})
        //   return "TEST"
        // }
      }
    }
  }
})

const quadrantConfig = ref({
  style: {
    chart: {
      tooltip: {
        showShape: false,
        customFormat: ({ seriesIndex, datapoint, series, config }) => {
          console.log({seriesIndex, datapoint, series, config})
          return datapoint.name
        }
      }
    }
  }
})

const verticalBarConfig = ref({
  style: {
    chart: {
      layout: {
        bars: {
          dataLabels: {
            value: {
              prefix: '$'
            }
          }
        }
      },
      tooltip: {
        customFormat: ({ seriesIndex, datapoint, series, config }) => {
          console.log({seriesIndex, datapoint, series, config});
          return datapoint.name
        }
      }
    }
  }
})

const heatmapConfig = ref({
  style: {
    tooltip: {
      customFormat: ({ seriesIndex, datapoint, series, config }) => {
        console.log({seriesIndex, datapoint, series, config});
        return "TEST"
      }
    },
    legend: {
      show: true,
      position: 'bottom'
    }
  }
})

const scatterConfig = ref({
  style: {
    tooltip: {
      showShape: false,
      customFormat: ({ seriesIndex, datapoint, series, config }) => {
        console.log({ seriesIndex, datapoint, series, config });
        return "TEST"
      }
    }
  }
})

const candlestickConfig = ref({
  style: {
    tooltip: {
      customFormat: ({ seriesIndex, datapoint, series, config }) => {
        console.log({ seriesIndex, datapoint, series, config });
        return "TEST"
      }
    }
  }
})

const pyramidConfig = ref({
  style: {
    tooltip: {
      customFormat: ({ seriesIndex, datapoint, series, config }) => {
        console.log({ seriesIndex, datapoint, series, config });
        return "TEST"
      }
    },
    layout: {
      dataLabels: {
        sideTitles: {
          offsetY: -20
        }
      }
    }
  }
})

const ringsConfig = ref({
  style: {
    chart: {
      tooltip: {
        customFormat: ({ seriesIndex, datapoint, series, config }) => {
          console.log({ seriesIndex, datapoint, series, config });
          return "TEST"
        }
      }
    }
  }
})

const moleculeConfig = ref({
  style: {
    chart: {
      tooltip: {
        customFormat: ({ seriesIndex, datapoint, series, config }) => {
          // seriesIndex will always be -1: hide in docs
          console.log({ seriesIndex, datapoint, series, config })
          return "TEST"
        }
      }
    }
  }
})

const onionConfig = ref({
  style: {
    chart: {
      tooltip: {
        customFormat: ({ seriesIndex, datapoint, series, config }) => {
          console.log({ seriesIndex, datapoint, series, config })
          return 'TEST'
        }
      }
    }
  }
})

function selectSparklineDatapoint({ datapoint, index }) {
  console.log({datapoint, index })
}

function selectSparkbarDatapoint({ datapoint, index }) {
  console.log({ datapoint, index })
}

function selectStackbarDatapoint({ datapoint, index }) {
  console.log({ datapoint, index })
}

function selectHistoDatapoint({ datapoint, index }) {
  console.log({ datapoint, index })
}

const nestedDonutsConfig = ref({
  style: {
    chart: {
      layout: {
        labels: {
          dataLabels: {
            showDonutName: true,
            boldDonutName: true,
            donutNameAbbreviation: false,
            donutNameOffsetY: 0
          }
        }
      }
    }
  }
})

const nestedDonutsDataset = ref([
  {
    name: "Donut 1",
    series: [
      {
        name: "Serie 1",
        values: [3]
      },
      {
        name: "Serie 2",
        values: [1]
      },
      {
        name: "Serie 3",
        values: [2]
      },
    ],
  },
  {
    name: "Donut 2",
    series: [
      {
        name: "Serie 1",
        values: [4],
      },
      {
        name: "Serie 2",
        values: [5.3]
      },
      {
        name: "Serie 3",
        values: [2.5]
      },
    ],
  },
  // {
  //   name: "Donut 3",
  //   series: [
  //     {
  //       name: "Serie 1",
  //       values: [4]
  //     },
  //     {
  //       name: "Serie 2",
  //       values: [1]
  //     },
  //     {
  //       name: "Serie 3",
  //       values: [2]
  //     },
  //   ],
  // },
  // {
  //   name: "Donut 4",
  //   series: [
  //     {
  //       name: "Serie 1",
  //       values: [4]
  //     },
  //     {
  //       name: "Serie 2",
  //       values: [1]
  //     },
  //     {
  //       name: "Serie 3",
  //       values: [2]
  //     },
  //   ],
  // },
])

const sparkGaugeDataset = ref({
  value: 0,
  min: -10,
  max: 10,
  title: "Some KPI with a long name"
})

const sparkGaugeConfig = ref({
  style: {
    colors: {
      min: "#FF0000",
      max: "#00FF00",
      showGradient: true
    }
  }
})

const universal = ref(null)

onMounted(() => {
  if(universal.value) {
    setTimeout(() => {
      // universal.value.generateImage()
    }, 3000)
  }
})

function testEmit1(data) {
  console.log({data})
}

function testEmit2(data) {
  console.log({data})
}

const galaxyDataset = ref([
{
    name: "serie 1",
    color: "",
    values: [255],
    shape: "star"
  },
  {
    name: "serie 2",
    color: "",
    values: [129],
    shape: "diamond"
  },
  {
    name: "serie 3",
    color: "",
    values: [21],
    shape: "triangle"
  },
  {
    name: "serie 4",
    color: "",
    values: [19],
    shape: "hexagon"
  },
]);

const galaxyConfig = ref({
  useBlurOnHover: true,
  style: {
    chart: {
      layout: {
        arcs: {
          // strokeWidth: 6,
          // borderWidth: 2
          hoverEffect: {
            show: true,
            multiplicator: 1.1
          }
        }
      },
      title: {
        text: "Title",
        subtitle: {
          text: "Subtitle"
        }
      },
      tooltip: {
        customFormat: ({ datapoint, series, config, seriesIndex }) => {
          console.log({ datapoint, series})
          return datapoint.name
        }
      }
    }
  }
})

const kpiDataset = ref(1000);

const kpiConfig = ref(
  {
    animationFrames: 60,
    animationValueStart: 0,
    backgroundColor: "#FFFFFF",
    fontFamily: "inherit",
    layoutClass: "",
    layoutCss: "",
    prefix: "",
    suffix: "",
    title: "Some kpi",
    titleBold: true,
    titleColor: "#CCCCCC",
    titleClass: "",
    titleCss: "",
    titleFontSize: 16,
    useAnimation: true,
    valueBold: true,
    valueColor: "#6376DD",
    valueClass: "",
    valueCss: "font-variant-numeric: tabular-nums;",
    valueFontSize: 32,
    valueRounding: 0
  }
)

</script>

<template>

  <div style="padding-left: 48px; padding-right: 48px; width: 100%; max-width: 80%;margin: 0 auto">
      <div style="padding-top: 48px; padding-bottom: 48px;font-weight: bold; line-height: 20px; display: flex; flex-direction:row; gap:24px; align-items:center">
          <img src="../../vue-data-ui-logo.png" height="100px"/>
          <!-- <BaseIcon name="chartRelationCircle" :size="118" :strokeWidth="0.8" stroke="#5A5A5A"/> -->
        <div>
          <h1 style="font-size: 36px; color: #42d392">
            Vue Data UI
          </h1>
          <h2 style="color: #5A5A5A">Components</h2>
          <h4 style="color: #5f8bee">Manual testing arena</h4>
        </div>
      </div>

      <Box :misc="true">
      <template #title>
        <BaseIcon name="smiley" />
        VueUiIcon
      </template>
      <template #misc>
        <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%">        
          <BaseIcon name="pdf" />
          <BaseIcon name="csv"/>
          <BaseIcon name="image" />
          <BaseIcon name="excel" />
          <BaseIcon name="tableOpen" />
          <BaseIcon name="tableClose" />
          <BaseIcon name="spin" />
          <BaseIcon name="close" />
          <BaseIcon name="labelOpen" />
          <BaseIcon name="labelClose" />
          <BaseIcon name="sort" />
          <BaseIcon name="chartBar" stroke="#42d392" />
          <BaseIcon name="chartLine" stroke="#42d392" />
          <BaseIcon name="chartRings" stroke="#42d392" />
          <BaseIcon name="chartDonut" stroke="#42d392" />
          <BaseIcon name="chartGauge" stroke="#42d392" />
          <BaseIcon name="chartTiremarks" stroke="#42d392" />
          <BaseIcon name="chartDonutEvolution" stroke="#42d392" />
          <BaseIcon name="screenshot" stroke="#42d392" />
          <BaseIcon name="chartWheel" stroke="#42d392" />
          <BaseIcon name="skeleton" stroke="#42d392" />
          <BaseIcon name="chartSparkHistogram" stroke="#42d392" />
          <BaseIcon name="chartRelationCircle" stroke="#42d392" />
          <BaseIcon name="chartCandlestick" stroke="#42d392" />
          <BaseIcon name="chartScatter" stroke="#42d392" />
          <BaseIcon name="chartVerticalBar" stroke="#42d392" />
          <BaseIcon name="chartOnion" stroke="#42d392" />
          <BaseIcon name="chartQuadrant" stroke="#42d392" />
          <BaseIcon name="chartThermometer" stroke="#42d392" />
          <BaseIcon name="chartRadar" stroke="#42d392" />
          <BaseIcon name="chartSparkStackbar" stroke="#42d392" />
          <BaseIcon name="moodSad" stroke="#42d392" />
          <BaseIcon name="moodFlat" stroke="#42d392" />
          <BaseIcon name="moodNeutral" stroke="#42d392" />
          <BaseIcon name="smiley" stroke="#42d392" />
          <BaseIcon name="moodHappy" stroke="#42d392" />
          <BaseIcon name="moodEmbarrassed" stroke="#42d392" />
          <BaseIcon name="moodSurprised" stroke="#42d392" />
          <BaseIcon name="moodWink" stroke="#42d392" />
          <BaseIcon name="moodLaughing" stroke="#42d392" />
          <BaseIcon name="star" stroke="#42d392" />
          <BaseIcon name="chartChestnut" stroke="#42d392" />
          <BaseIcon name="chartAgePyramid" stroke="#42d392" />
          <BaseIcon name="chartWaffle" stroke="#42d392" />
          <BaseIcon name="annotator" stroke="#42d392" />
          <BaseIcon name="dashboard" stroke="#42d392" />
          <BaseIcon name="chartHeatmap" stroke="#42d392" />
          <BaseIcon name="chartTable" stroke="#42d392" />
          <BaseIcon name="chartMoodRadar" stroke="#42d392" />
          <BaseIcon name="chart3dBar" stroke="#42d392" />
          <BaseIcon name="digit0" stroke="#42d392" />
          <BaseIcon name="digit1" stroke="#42d392" />
          <BaseIcon name="digit2" stroke="#42d392" />
          <BaseIcon name="digit3" stroke="#42d392" />
          <BaseIcon name="digit4" stroke="#42d392" />
          <BaseIcon name="digit5" stroke="#42d392" />
          <BaseIcon name="digit6" stroke="#42d392" />
          <BaseIcon name="digit7" stroke="#42d392" />
          <BaseIcon name="digit8" stroke="#42d392" />
          <BaseIcon name="digit9" stroke="#42d392" />
          <BaseIcon name="chartCluster" stroke="#42d392" />
          <BaseIcon name="arrowRight" stroke="#42d392" />
          <BaseIcon name="arrowTop" stroke="#42d392" />
          <BaseIcon name="arrowLeft" stroke="#42d392" />
          <BaseIcon name="arrowBottom" stroke="#42d392" />
          <BaseIcon name="fullscreen" stroke="#42d392" />
          <BaseIcon name="exitFullscreen" stroke="#42d392" />
          <BaseIcon name="circleCancel" stroke="#42d392" />
          <BaseIcon name="circleCheck" stroke="#42d392" />
          <BaseIcon name="circleExclamation" stroke="#42d392" />
          <BaseIcon name="circleQuestion" stroke="#42d392" />
          <BaseIcon name="refresh" stroke="#42d392" />
          <BaseIcon name="chartNestedDonuts" stroke="#42d392" />
          <BaseIcon name="chartSparkbar" stroke="#42d392" />
          <BaseIcon name="chartSparkline" stroke="#42d392" />
          <BaseIcon name="legend" stroke="#42d392" />
        </div>
      </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_kpi)">
        <template #title>
          <!-- <BaseIcon name="chartGalaxy"/> -->
          VueUiKpi
        </template>
        <template #info>
        </template>
        <template #dev>
          <VueUiKpiTest :dataset="kpiDataset" :config="kpiConfig">
            <!-- <template #comment-before="{ comment }">
              {{ comment }}
            </template>
            <template #comment-after="{ comment }">
              {{ comment }}
            </template> -->
          </VueUiKpiTest>
        </template>
        <template #prod>
          <VueDataUi component="VueUiKpi" :dataset="kpiDataset" :config="kpiConfig">
            <template #title="{ comment }">
              TITLE SLOT {{ comment }}
            </template>
            <template #value="{ comment }">
              VALUE SLOT {{ comment }}
            </template>
            <template #comment-before="{ comment }">
              COMMENT BEFORE SLOT {{ comment }}
            </template>
            <template #comment-after="{ comment }">
              COMMENT AFTER SLOT {{ comment }}
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_kpi }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_galaxy)">
        <template #title>
          <BaseIcon name="chartGalaxy"/>
          VueUiGalaxy
        </template>
        <template #info>
        </template>
        <template #dev>
          <GalaxyTest :dataset="galaxyDataset" :config="galaxyConfig" />
        </template>
        <template #prod>
          <VueDataUi component="VueUiGalaxy" :dataset="galaxyDataset" :config="galaxyConfig" />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_galaxy }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_sparkgauge)">
        <template #title>
          <BaseIcon name="chartGauge"/>
          VueUiSparkgauge
        </template>
        <template #info>
        </template>
        <template #dev>
          <VueDataUiTest component="VueUiSparkgauge" :dataset="sparkGaugeDataset" :config="sparkGaugeConfig" />
        </template>
        <template #prod>
          <VueDataUi component="VueUiSparkgauge" :dataset="sparkGaugeDataset" :config="sparkGaugeConfig" />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_sparkgauge }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_nested_donuts)">
        <template #title>
          <BaseIcon name="chartNestedDonuts"/>
          VueUiNestedDonuts
        </template>
        <template #info>
        </template>
        <template #dev>
          <VueDataUiTest component="VueUiNestedDonuts" :dataset="nestedDonutsDataset" :config="nestedDonutsConfig">
            <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
          </VueDataUiTest>
            
        </template>
        <template #prod>
          <VueDataUi component="VueUiNestedDonuts" :dataset="nestedDonutsDataset" :config="nestedDonutsConfig"/>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_nested_donuts }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_mini_loader)">
        <template #title>
          <BaseIcon name="chartWheel"/>
          VueUiMiniLoader
        </template>
        <template #info>
        </template>
        <template #dev>
          <VueDataUiTest component="VueUiMiniLoader" :config="miniLoaderConfig" />
        </template>
        <template #prod>
          <VueDataUi component="VueUiMiniLoader" :config="miniLoaderConfig" />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_mini_loader }}
        </template>
      </Box>

      <Box open @copy="copyConfig(PROD_CONFIG.vue_ui_table_sparkline)">
        <template #title>
          <BaseIcon name="chartTable"/>
          VueUiTableSparkline
        </template>
        <template #info>
        </template>
        <template #dev>
          <VueDataUiTest component="VueUiTableSparkline" :dataset="tableSparklineDataset"/>
        </template>
        <template #prod>
          <VueDataUi component="VueUiTableSparkline" :dataset="tableSparklineDataset"/>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_table_sparkline }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_molecule)">
        <template #title>
          <BaseIcon name="chartCluster"/>
          VueUiMolecule
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="labelOpen" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest component="VueUiMolecule" :dataset="clusterDataset" :config="moleculeConfig">
            <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi component="VueUiMolecule" :dataset="clusterDataset" :config="moleculeConfig"/>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_molecule }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_mood_radar)">
        <template #title>
          <BaseIcon name="chartMoodRadar"/>
          VueUiMoodRadar
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest component="VueUiMoodRadar" :dataset="moodRadarDataset" :config="moodRadarConfig">
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi component="VueUiMoodRadar" :dataset="moodRadarDataset" :config="moodRadarConfig">
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_mood_radar }}
        </template>

      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_digits)">
        <template #title>
          <BaseIcon name="digit8"/>
          VueUiDigits
        </template>
        <template #dev>
          <VueDataUiTest component="VueUiDigits" :dataset="299792458" :config="{ backgroundColor: '#1A1A1A', digits: { color: '#42d392', skeletonColor: '#2A2A2A'}}"/>
        </template>
        <template #prod>
          <VueDataUi component="VueUiDigits" :dataset="299792458" :config="{ backgroundColor: '#1A1A1A', digits: { color: '#42d392', skeletonColor: '#2A2A2A'}}"/>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_digits }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_3d_bar)">
        <template #title>
          <BaseIcon name="chart3dBar"/>
        VueUi3dBar
        </template>
        <template #info>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest component="VueUi3dBar" :dataset="bar3dDataset">
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi component="VueUi3dBar" :dataset="bar3dDataset">
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_3d_bar }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_screenshot)">
        <template #title>
          <BaseIcon name="screenshot"/>
        VueUiScreenshot
        </template>
        <template #dev>
          <VueDataUiTest component="VueUiScreenshot" ref="screenshotTest"/>
          <button class="btn--orange" @click="shootScreenTest">SCREENSHOT</button>
        </template>
        <template #prod>
          <VueDataUi component="VueUiScreenshot" ref="screenshotProd"/>
          <button class="btn--green" @click="shootScreenProd">SCREENSHOT</button>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_screenshot }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_donut_evolution)">
        <template #title>
          <BaseIcon name="chartDonutEvolution"/>
          VueUiDonutEvolution
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiDonutEvolution"
            :dataset="donutEvolutionDataset"
            :config="donutEvolutionConfig"
          >
            <template #svg="{ svg }">
              <circle :cx="svg.absoluteWidth / 2" :cy="svg.absoluteHeight / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi component="VueUiDonutEvolution"
            :dataset="donutEvolutionDataset"
            :config="donutEvolutionConfig"
          >
          <template #svg="{ svg }">
            <circle :cx="svg.absoluteWidth / 2" :cy="svg.absoluteHeight / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_donut_evolution }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_tiremarks)">
        <template #title>
          <BaseIcon name="chartTiremarks"/>
          VueUiTiremarks
        </template>
        <template #info>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiTiremarks"
            :dataset="tiremarksDataset"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiTiremarks"
            :dataset="tiremarksDataset"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_tiremarks }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_skeleton)">
        <template #title>
          <BaseIcon name="skeleton"/>
          VueUiSkeleton
        </template>
        <template #general>
          <select v-model="skeletonChoice">
            <option v-for="(opt) in skeletonOptions">{{ opt }}</option>
          </select>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiSkeleton"
            :config="{ type: skeletonChoice, style: { rating: { useSmiley: true, filled: true } } }"
          />
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiSkeleton"
            :config="{ type: skeletonChoice, style: { rating: { useSmiley: true, filled: true } } }"
          />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_skeleton }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_wheel)">
        <template #title>
          <BaseIcon name="chartWheel"/>  
          VueUiWheel
        </template>
        <template #info>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiWheel"
            ref="rings"
            :dataset="wheelDataset"
            :config="{style:{chart:{title:{text:'Title',subtitle:{text:'Subtitle'}}}}}"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiWheel"
            ref="rings"
            :dataset="wheelDataset"
            :config="{style:{chart:{title:{text:'Title',subtitle:{text:'Subtitle'}}}}}"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_wheel }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_rings)">
        <template #title>
          <BaseIcon name="chartRings" />
          VueUiRings
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiRings"
            ref="rings"
            :dataset="ringsDataset"
            :config="ringsConfig"
          >
          <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
            <VueDataUi
              component="VueUiRings" 
              ref="rings" 
              :dataset="ringsDataset" 
              :config="ringsConfig"
            >
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_rings }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_relation_circle)">
        <template #title>
          <BaseIcon name="chartRelationCircle"/>
          VueUiRelationCircle
        </template>
        <template #info>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiRelationCircle"
            ref="relation"
            :dataset="relationDataset"
            :config="relationConfig"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
            <VueDataUi
              component="VueUiRelationCircle" 
              ref="relation" 
              :dataset="relationDataset" 
              :config="relationConfig"
            >
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_relation_circle }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_sparkline)">
        <template #title>
          <BaseIcon name="chartSparkline" />
          VueUiSparkline
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiSparkline"
             ref="sparkline"
            :config="sparklineConfig"
            :dataset="sparklineDataset"
            @selectDatapoint="selectSparklineDatapoint"
          >
          </VueDataUiTest>
          <VueDataUiTest
            component="VueUiSparkline"
             ref="sparkline"
            :config="sparklineConfig"
            :dataset="sparklineDataset2"
            @selectDatapoint="selectSparklineDatapoint"
          >
          </VueDataUiTest>
          <VueDataUiTest
            component="VueUiSparkline"
             ref="sparkline"
            :config="sparklineConfig2"
            :dataset="sparklineDataset"
            @selectDatapoint="selectSparklineDatapoint"
          >
          </VueDataUiTest>
          <VueDataUiTest
            component="VueUiSparkline"
             ref="sparkline"
            :config="sparklineConfig2"
            :dataset="sparklineDataset2"
            @selectDatapoint="selectSparklineDatapoint"
          >
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiSparkline"
            :config="sparklineConfig"
            :dataset="sparklineDataset"
            @selectDatapoint="selectSparklineDatapoint"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_sparkline }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_xy)">
        <template #title>
          <BaseIcon name="chartLine" />
          VueUiXy
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="labelOpen" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiXy"
            ref="xytest"
            :config="xyConfig"
            :dataset="dataset2"
            @selectLegend="selectLegendXY"
            @selectX="selectX"
          >
            <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
          </VueDataUiTest>
          <VueDataUiTest
            component="VueUiXy"
            :config="xyConfig"
            :dataset="dataset"
          >
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiXy"
            ref="xytest"
            :config="xyConfig"
            :dataset="dataset2"
            @selectLegend="selectLegendXY"
            @selectX="selectX"
          >
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUi>
          <VueDataUi
            component="VueUiXy"
            :config="xyConfig"
            :dataset="dataset"
          />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_xy }}
        </template>
      </Box>

      <Box open @copy="copyConfig(PROD_CONFIG.vue_ui_sparkhistogram)">
        <template #title>
          <BaseIcon name="chartSparkHistogram" />
          VueUiSparkHistogram
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiSparkHistogram" 
            :dataset="histoDataset" 
            :config="histoConfig"
            @selectDatapoint="selectHistoDatapoint"
          />
        </template>
        <template #prod>
          <VueDataUi
              component="VueUiSparkHistogram"
             :dataset="histoDataset" 
             :config="histoConfig"
             @selectDatapoint="selectHistoDatapoint"
          />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_sparkhistogram }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_candlestick)">
        <template #title>
          <BaseIcon name="chartCandlestick" />
          VueUiCandlestick
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiCandlestick"
            ref="candlestick"
            :dataset="candlestickDataset" 
            :config="candlestickConfig"
          >
            <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiCandlestick"
            ref="candlestick"
            :dataset="candlestickDataset"
            :config="candlestickConfig"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_candlestick }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_scatter)">
        <template #title>
          <BaseIcon name="chartScatter" />
          VueUiScatter
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiScatter" 
            ref="scatter" 
            :dataset="scatterDataset" 
            :config="scatterConfig"
          >
          <template #tooltip-before>
            BEFORE
          </template>
          <template #tooltip-after>
            AFTER
          </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiScatter"
            ref="scatter"
            :config="scatterConfig"
            :dataset="scatterDataset"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_scatter }}
        </template>
      </Box>

      <Box open @copy="copyConfig(PROD_CONFIG.vue_ui_vertical_bar)">
        <template #title>
          <BaseIcon name="chartVerticalBar" />
          VueUiVerticalBar
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="sort" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiVerticalBar" 
            ref="verticaltest"
            :dataset="verticalDataset"
            :config="verticalBarConfig"
          >
            <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiVerticalBar"
            ref="verticaltest"
            :config="verticalBarConfig"
            :dataset="verticalDataset"
            @selectLegend="selectVerticalLegend"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_vertical_bar }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_onion)">
        <template #title>
          <BaseIcon name="chartOnion" />
          VueUiOnion
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiOnion"
            :config="onionConfig"
            :dataset="onionDataset"
            @selectLegend="selectOnionLegend"
          >
            <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiOnion"
            ref="oniontest"
            :config="onionConfig"
            :dataset="onionDataset"
            @selectLegend="selectOnionLegend"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_onion }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_quadrant)">
        <template #title>
          <BaseIcon name="chartQuadrant" />
          VueUiQuadrant
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="labelOpen" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiQuadrant"
            ref="quadranttest"
            :dataset="quadrantDataset"
            :config="quadrantConfig"
            @selectPlot="selectPlot"
            @selectSide="selectSide"
            @selectLegend="selectQuadrantLegend"
          >
          <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiQuadrant"
            ref="quadranttest"
            :dataset="quadrantDataset"
            :config="quadrantConfig"
            @selectPlot="selectPlot"
            @selectSide="selectSide"
            @selectLegend="selectQuadrantLegend"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_quadrant }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_radar)">
        <template #title>
          <BaseIcon name="chartRadar" />
          VueUiRadar
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
          component="VueUiRadar"
            ref="radartest"
            :dataset="radarDataset"
            :config="radarConfig"
            @selectLegend="selectRadarLegend"
          >
          <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiRadar"
            ref="radartest"
            :dataset="radarDataset"
            :config="radarConfig"
            @selectLegend="selectRadarLegend"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_radar }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_donut)">
        <template #title>
          <BaseIcon name="chartDonut" />
          VueUiDonut
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="labelOpen" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiDonut"
            ref="donuttest"
            :dataset="donutDataset"
            :config="donutConfig"
            @selectLegend="selectLegendDonut"
          >
          <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
              <Arrow
                :x1="20"
                :y1="20"
                :x2="100"
                :y2="100"
                :pointerSize="10"
                :strokeWidth="2"
              />
            </template>
            <template #legend="{legend}">
              <div v-for="item in legend">
                {{ item.name }} {{ item.color }} {{ item.value }} {{  item.proportion }}
              </div>
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiDonut"
            ref="donuttest"
            :dataset="donutDataset"
            :config="donutConfig"
            @selectLegend="selectLegendDonut"
          >
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_donut }}
        </template>
      </Box>

      <Box open @copy="copyConfig(PROD_CONFIG.vue_ui_sparkstackbar)">
        <template #title>
          <BaseIcon name="chartSparkStackbar" />
          VueUiSparkStackbar
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiSparkStackbar" 
            :dataset="stackDataset"
            @selectDatapoint="selectStackbarDatapoint"
          />
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiSparkStackbar"  
            :dataset="stackDataset"
            @selectDatapoint="selectStackbarDatapoint"
          />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_sparkstackbar }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_thermometer)">
        <template #title>
          <BaseIcon name="chartThermometer"/>
          VueUiThermometer
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiThermometer" 
            ref="thermo" 
            :dataset="thermoDataset" 
            :config="thermoConfig" 
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiThermometer" 
            ref="thermo" 
            :dataset="thermoDataset" 
            :config="thermoConfig" 
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_thermometer }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_smiley)">
        <template #title>
          <BaseIcon name="smiley"/>
          VueUiSmiley
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiSmiley" 
            :dataset="ratingDataset" 
            :config="smileyConfig" 
          />
          <VueDataUiTest
            component="VueUiSmiley"
            :dataset="ratingDataset" 
            :config="{...smileyConfig, readonly: true}" 
          />
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiSmiley"
            :dataset="ratingDataset"
            :config="smileyConfig"
          />
          <VueDataUi
            component="VueUiSmiley"
            :dataset="ratingDataset"
            :config="{...smileyConfig, readonly: true}" 
          />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_smiley }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_rating)">
        <template #title>
          <BaseIcon name="star" />
          VueUiRating
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiRating"
            ref="ratingtest"
            :config="ratingConfig"
            :dataset="ratingDataset"
          />
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiRating"
            ref="ratingtest"
            :config="ratingConfig"
            :dataset="ratingDataset"
          />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_rating }}
        </template>
      </Box>
      
      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_chestnut)">
        <template #title>
          <BaseIcon name="chartChestnut" />
          VueUiChestnut
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiChestnut"
            ref="chestnuttest"
            :dataset="chestnutDataset"
            @selectRoot="selectRoot"
            @selectBranch="selectBranch"
            @selectNut="selectNut"
          >
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiChestnut"
            ref="chestnuttest"
            :dataset="chestnutDataset"
            @selectRoot="selectRoot"
            @selectBranch="selectBranch"
            @selectNut="selectNut"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_chestnut }}
        </template>
      </Box>
      
      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_age_pyramid)">
        <template #title>
          <BaseIcon name="chartAgePyramid" />
          VueUiAgePyramid
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest 
            component="VueUiAgePyramid"
            ref="pyramid" 
            :dataset="pyramidDataset"
            :config="pyramidConfig"
          >
            <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiAgePyramid"
            ref="pyramid"
            :dataset="pyramidDataset"
            :config="pyramidConfig"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_age_pyramid }}
        </template>
      </Box>
      
      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_waffle)">
        <template #title>
          <BaseIcon name="chartWaffle"/>
          VueUiWaffle
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiWaffle"
            ref="waffletest"
            :dataset="waffleDataset"
            :config="waffleConfig"
            @selectLegend="selectLegendWaffle"
          >
          <template #tooltip-before>
              BEFORE
            </template>
            <template #tooltip-after>
              AFTER
            </template>
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiWaffle"
            ref="waffletest"
            :dataset="waffleDataset"
             :config="waffleConfig"
            @selectLegend="selectLegendWaffle"
          >
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_waffle }}
        </template>
      </Box>
      
      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_annotator)">
        <template #title>
          <BaseIcon name="annotator"/>
          VueUiAnnotator
        </template>
        <template #dev>
          <VueDataUiTest component="VueUiAnnotator"
            @saveAnnotations="saveAnnotations"
            :dataset="{
              shapes,
              lastSelectedShape,
            }"
            @toggleOpenState="toggleOpenState"
          >
            <DashboardTest
              ref="dash"
              :dataset="comps"
              @change="testchange"
              :config="dashboardConfig"
            >
              <template v-slot:content="{ item }">
                <div style="padding: 12px">
                  <component :is="item.component" v-bind="item.props"></component>
                </div>
              </template>
            </DashboardTest>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiAnnotator"
            @saveAnnotations="saveAnnotations"
            :dataset="{
              shapes,
              lastSelectedShape,
            }"
            @toggleOpenState="toggleOpenState"
          >
            <VueDataUi
              component="VueUiDashboard"
              ref="dash"
              :dataset="comps"
              @change="testchange"
              :config="dashboardConfig"
            >
              <template v-slot:content="{ item }">
                <div style="padding: 12px">
                  <component :is="item.component" v-bind="item.props"></component>
                </div>
              </template>
            </VueDataUi>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_annotator }}
        </template>
      </Box>

            
      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_dashboard)">
        <template #title>
          <BaseIcon name="dashboard" />
          VueUiDashboard
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiDashboard"
            ref="dash"
            :dataset="comps"
            @change="testchange"
            :config="dashboardConfig"
          >
            <template v-slot:content="{ item }">
              <div style="padding: 12px">
                <component :is="item.component" v-bind="item.props"></component>
              </div>
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiDashboard"
            ref="dash"
            :dataset="comps"
            @change="testchange"
            :config="dashboardConfig"
          >
            <template v-slot:content="{ item }">
              <div style="padding: 12px">
                <component :is="item.component" v-bind="item.props"></component>
              </div>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_dashboard }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_sparkbar)">
        <template #title>
          <BaseIcon name="chartSparkbar"/>
          VueUiSparkbar
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiSparkbar"
            :config="sparkbarConfig"
            :dataset="sparkbarDataset"
            @selectDatapoint="selectSparkbarDatapoint"
          />
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiSparkbar"
            :config="sparkbarConfig"
            :dataset="sparkbarDataset"
            @selectDatapoint="selectSparkbarDatapoint"
          />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_sparkbar }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_heatmap)">
        <template #title>
          <BaseIcon name="chartHeatmap"/>
          VueUiHeatmap
        </template>
        <template #info>
          <BaseIcon name="chartTable" stroke="#5f8bee"/>
          <BaseIcon name="pdf" stroke="#5f8bee"/>
          <BaseIcon name="image" stroke="#5f8bee"/>
          <BaseIcon name="excel" stroke="#5f8bee"/>
          <BaseIcon name="fullscreen" stroke="#5f8bee"/>
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiHeatmap"
            ref="heatmaptest"
            :config="heatmapConfig"
            :dataset="heatmapDataset"
          >
          <template #tooltip-before>
            BEFORE
          </template>
          <template #tooltip-after>
            BEFORE
          </template>
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="60" fill="#FF0000"/>
            </template>
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiHeatmap"
            ref="heatmaptest"
            :config="heatmapConfig"
            :dataset="heatmapDataset"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="60" fill="#FF0000"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_heatmap }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_gauge)">
        <template #title>
          <BaseIcon name="chartGauge"/>
          VueUiGauge
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiGauge" 
            ref="gaugetest" 
            :dataset="gaugeDataset" 
          >
            <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
            
          </VueDataUiTest>
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiGauge"
            ref="gaugetest"
            :dataset="gaugeDataset"
          >
          <template #svg="{ svg }">
              <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#FF000033"/>
            </template>
          </VueDataUi>
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_gauge }}
        </template>
      </Box>

      <Box @copy="copyConfig(PROD_CONFIG.vue_ui_table)">
        <template #title>
          <BaseIcon name="chartTable"/>
          VueUiTable
        </template>
        <template #dev>
          <VueDataUiTest
            component="VueUiTable" 
            :dataset="tableTestDataset" 
          />
        </template>
        <template #prod>
          <VueDataUi
            component="VueUiTable" 
            :dataset="tableTestDataset" 
          />
        </template>
        <template #config>
          {{ PROD_CONFIG.vue_ui_table }}
        </template>
      </Box>

    <img v-if="pic" :src="pic" />
  </div>
</template>

<style scoped>
.btn--green,
.btn--orange {
  border: none;
  height: 40px;
  cursor: pointer;
  border-radius: 6px;
  padding: 0 12px;
  box-shadow: 0 6px 12px -6px rgba(0, 0,0,0.6);
  color: white;
  font-weight: bold;

}
.btn--green {
    background: linear-gradient(to bottom right, #42d392, #42d392AA);
}

.btn--green:hover {
    background: linear-gradient(to top left, #42d392, #42d392AA);
}
.btn--orange {
    background: linear-gradient(to bottom right, #ff6400, #ff6400AA);
}
.btn--orange:hover {
    background: linear-gradient(to top left, #ff6400, #ff6400AA);
}
</style>

<style>

</style>
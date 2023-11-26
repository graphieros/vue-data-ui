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
import Box from "./Box.vue";
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

const dataset = ref([
  {
    name: "Series 1",
    series: [200, 100, 125, 230, 120, 100, 90, 50, 12, 25, 100, 154, 155],
    type: "line",
  },
]);
const dataset2 = ref([
  {
    name: "Series 3",
    series: [
      -55,
      34,
      -21,
      13,
      -8,
      5,
      -3,
      2,
      -1,
      1,
      0,
      1,
      1,
      2,
      3,
      5,
      8,
      13,
      21,
      34,
      55,
    ],
    type: "line",
  },
]);

const config = ref({
  chart: {
    color: "#000000",
    backgroundColor: "#FFFFFF",
    highlighter: {
      color: "#FF0000",
    },
    tooltip: {
      roundingPercentage: 0,
      backgroundColor: "#FFFFFF",
      color: "#000000",
      showPercentage: true,
    },
    userOptions: {
      show: true,
    },
    padding: {
      bottom: 24,
      right: 24,
    },
    grid: {
      showVerticalLines: true,
      labels: {
        color: "red",
        axis: {
          xLabel: "x label",
          yLabel: "y Label",
        },
        xAxisLabels: {
          showOnlyFirstAndLast: true,
          values: [
            "JAN",
            "FEB",
            "MAR",
            "APR",
            "MAY",
            "JUN",
            "JUL",
            "AUG",
            "SEP",
            "OCT",
            "NOV",
            "DEC",
            "JAN",
            "FEB",
            "MAR",
            "APR",
            "MAY",
            "JUN",
            "JUL",
            "AUG",
            "SEP",
          ],
        },
      },
    },
    legend: {
      useDiv: true,
    },
    title: {
      text: "This is a title",
      useDiv: true,
      subtitle: {
        text: "This is a subtitle",
        color: "grey",
      },
    },
  },
  bar: {
    borderRadius: 4,
    useGradient: true,
    labels: {
      show: true,
    },
  },
  line: {
    radius: 4,
    labels: {
      show: true,
    },
  },
  plot: {
    labels: {
      show: true,
    },
  },
  table: {
    rounding: 1,
    th: {
      backgroundColor: "#FF0000",
    },
  },
});

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

const tableConfig = ref({
  useChart: true,
});

const darkConfig = ref({
  fontFamily: "inherit",
  rowsPerPage: 25,
  style: {
    th: {
      backgroundColor: "#1a1a1a",
      color: "#c4c9cc",
      outline: "1px solid #7b8185",
      selected: {
        backgroundColor: "#42d392",
        color: "#1a1a1a",
      },
    },
    rows: {
      even: {
        backgroundColor: "#1a1a1a",
        color: "#c4c9cc",
        selectedCell: {
          backgroundColor: "#42d392",
          color: "#2D353C",
        },
        selectedNeighbors: {
          backgroundColor: "#075e37",
          color: "#FFFFFF",
        },
      },
      odd: {
        backgroundColor: "#2A2A2A",
        color: "#FFFFFF",
        selectedCell: {
          backgroundColor: "#5de8aa",
          color: "#2D353C",
        },
        selectedNeighbors: {
          backgroundColor: "#0c7a49",
          color: "#FFFFFF",
        },
      },
    },
    inputs: {
      backgroundColor: "#FFFFFF",
      color: "#2D353C",
      border: "1px solid #CCCCCC",
      accentColor: "#42d392",
    },
    dropdowns: {
      backgroundColor: "#1a1a1a",
      color: "#c4c9cc",
      icons: {
        selected: {
          color: "#42d392",
          unicode: "✔",
        },
        unselected: {
          color: "#ff6400",
          unicode: "✖",
        },
      },
    },
    infoBar: {
      backgroundColor: "#1a1a1a",
      color: "#FFFFFF",
    },
    pagination: {
      buttons: {
        backgroundColor: "#1a1a1a",
        color: "#E1E5E8",
        opacityDisabled: 0.3,
      },
      navigationIndicator: {
        backgroundColor: "#42d392",
      },
    },
    exportMenu: {
      backgroundColor: "#1a1a1a",
      color: "#E1E5E8",
      buttons: {
        backgroundColor: "#42d392",
        color: "#2D353C",
      },
    },
    closeButtons: {
      backgroundColor: "transparent",
      color: "#ff6400",
      borderRadius: "50%",
    },
    chart: {
      modal: {
        backgroundColor: "#1a1a1a",
        color: "#E1E5E8",
        buttons: {
          selected: {
            backgroundColor: "#42d392",
            color: "#1a1a1a",
          },
          unselected: {
            backgroundColor: "#1a1a1a",
            color: "#E1E5E8",
          },
        },
      },
      layout: {
        backgroundColor: "#1a1a1a",
        axis: {
          stroke: "#ccd1d4",
          strokeWidth: 2,
        },
        bar: {
          fill: "#42d392",
          stroke: "#1a1a1a",
        },
        line: {
          stroke: "#42d392",
          strokeWidth: 4,
          plot: {
            fill: "#5fe3a8",
            stroke: "#FFFFFF",
            strokeWidth: 1,
            radius: {
              selected: 6,
              unselected: 4,
            },
          },
          selector: {
            stroke: "#ff6400",
            strokeWidth: 1,
            strokeDasharray: 5,
          },
        },
        labels: {
          color: "#ccd1d4",
        },
        progression: {
          stroke: "#FFFFFF",
          strokeWidth: 2,
          strokeDasharray: 4,
          arrowSize: 7,
        },
      },
    },
  },
  translations: {
    average: "Average",
    by: "by",
    chooseCategoryColumn: "Choose category column",
    exportAllButton: "XLSX all",
    exportAllLabel: "Export all rows of your current filtered dataset",
    exportPageButton: "XLSX page",
    exportPageLabel: "Export rows of the current page",
    from: "From",
    inputPlaceholder: "Search...",
    makeDonut: "Generate",
    nb: "Nb",
    page: "Page",
    paginatorLabel: "Rows per page",
    sizeWarning: "Displaying too many rows at a time can lead to slower performance",
    sum: "Sum",
    to: "To",
    total: "Total",
    totalRows: "Total rows",
  },
  useChart: true,
});

const donutDataset = [
  {
    name: "serie 1",
    color: "",
    values: [1],
  },
  {
    name: "serie 2",
    color: "",
    values: [2],
  },
  {
    name: "serie 3",
    color: "",
    values: [3],
  },
  {
    name: "serie 4",
    color: "",
    values: [3, 5],
  },
];

const donutConfig = {
  useCssAnimation: false,
  style: {
    fontFamily: "inherit",
    chart: {
      useGradient: true,
      gradientIntensity: 40,
      backgroundColor: "rgb(10, 20, 30)",
      color: "#FAFAFA",
      layout: {
        useDiv: false,
        labels: {
          dataLabels: {
            show: true,
            hideUnderValue: 3,
          },
          percentage: {
            color: "#FAFAFA",
            bold: true,
            fontSize: 18,
          },
          name: {
            color: "#FAFAFA",
            bold: false,
            fontSize: 14,
          },
          hollow: {
            total: {
              show: true,
              bold: false,
              fontSize: 18,
              color: "#FAFAFA",
              text: "Total",
              offsetY: 0,
              value: {
                color: "#FAFAFA",
                fontSize: 18,
                bold: true,
                suffix: "",
                prefix: "",
                offsetY: 0,
                rounding: 0,
              },
            },
            average: {
              show: true,
              bold: false,
              fontSize: 18,
              color: "#FAFAFA",
              text: "Average",
              offsetY: 0,
              value: {
                color: "#FAFAFA",
                fontSize: 18,
                bold: true,
                suffix: "",
                prefix: "",
                offsetY: 0,
                rounding: 0,
              },
            },
          },
        },
        donut: {
          strokeWidth: 64,
        },
      },
      legend: {
        backgroundColor: "#000000",
        color: "#FAFAFA",
        show: true,
        fontSize: 16,
        bold: false,
        roundingValue: 2,
        roundingPercentage: 2,
      },
      title: {
        text: "Title",
        color: "#FAFAFA",
        fontSize: 20,
        bold: true,
        subtitle: {
          color: "#A1A1A1",
          text: "Subtitle",
          fontSize: 16,
          bold: false,
        },
      },
      tooltip: {
        show: true,
        color: "#FAFAFA",
        backgroundColor: "#000000",
        fontSize: 14,
        showValue: true,
        showPercentage: true,
        roundingValue: 0,
        roundingPercentage: 0,
      },
    },
  },
  userOptions: {
    show: true,
    title: "options",
    labels: {
      dataLabels: "Show datalabels",
      useDiv: "Title & legend inside",
      showTable: "Show table",
    },
  },
  translations: {
    total: "Total",
    average: "Average",
  },
  table: {
    show: false,
    th: {
      backgroundColor: "#000000",
      color: "#FAFAFA",
      outline: "1px solid #e1e5e8",
    },
    td: {
      backgroundColor: "#000000",
      color: "#FAFAFA",
      outline: "1px solid #e1e5e8",
      roundingValue: 1,
      roundingPercentage: 1,
    },
  },
};

const waffleConfig = ref({
  style: {
    fontFamily: "inherit",
    chart: {
      backgroundColor: "#000000",
      color: "#2D353C",
      layout: {
        grid: {
          size: 20,
          spaceBetween: 0,
          vertical: false,
        },
        rect: {
          rounded: true,
          rounding: 2,
          stroke: "#FFFFFF",
          strokeWidth: 2,
          useGradient: true,
          gradientIntensity: 40,
        },
        useDiv: true,
      },
      title: {
        text: "Title",
        color: "#2D353C",
        fontSize: 20,
        bold: true,
        subtitle: {
          color: "#A1A1A1",
          text: "Subtitle",
          fontSize: 16,
          bold: false,
        },
      },
      tooltip: {
        show: true,
        backgroundColor: "#FFFFFF",
        color: "#2D353C",
        fontSize: 14,
        showValue: true,
        showPercentage: true,
        roundingValue: 0,
        roundingPercentage: 0,
      },
      legend: {
        show: true,
        backgroundColor: "#FFFFFF",
        color: "#2D353C",
        fontSize: 14,
        roundingValue: 0,
        roundingPercentage: 0,
      },
    },
  },
  userOptions: {
    show: true,
    title: "options",
    labels: {
      useDiv: "Title & legend inside",
      showTable: "Show table",
    },
  },
  table: {
    show: true,
    th: {
      backgroundColor: "#FAFAFA",
      color: "#2D353C",
      outline: "1px solid #e1e5e8",
    },
    td: {
      backgroundColor: "#FFFFFF",
      color: "#2D353C",
      outline: "1px solid #e1e5e8",
      roundingValue: 0,
      roundingPercentage: 0,
    },
  },
});

const radarDataset = ref({
  categories: [
    {
      name: "category 1",
    },
    {
      name: "category 2",
    },
    {
      name: "category 3",
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

const radarConfig = ref({
  style: {
    fontFamily: "inherit",
    chart: {
      backgroundColor: "#000000",
      color: "#CCCCCC",
      layout: {
        useDiv: true,
        plots: {
          show: true,
          radius: 2,
        },
        outerPolygon: {
          stroke: "#292929",
          strokeWidth: 1,
        },
        dataPolygon: {
          strokeWidth: 1,
          transparent: false,
          opacity: 20,
          useGradient: true,
        },
        grid: {
          show: true,
          stroke: "#292929",
          strokeWidth: 0.5,
          graduations: 5,
        },
        labels: {
          dataLabels: {
            show: true,
            fontSize: 12,
            color: "#CCCCCC",
          },
        },
      },
      title: {
        text: "Title",
        color: "#CCCCCC",
        fontSize: 20,
        bold: true,
        subtitle: {
          color: "#A1A1A1",
          text: "Subtitle",
          fontSize: 16,
          bold: false,
        },
      },
      tooltip: {
        show: true,
        backgroundColor: "#000000",
        color: "#CCCCCC",
        fontSize: 14,
        showValue: true,
        showPercentage: true,
        roundingValue: 0,
        roundingPercentage: 0,
      },
      legend: {
        show: true,
        bold: true,
        backgroundColor: "#000000",
        color: "#CCCCCC",
        fontSize: 14,
        roundingPercentage: 0,
      },
    },
  },
  table: {
    show: false,
    th: {
      backgroundColor: "#000000",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
    },
    td: {
      backgroundColor: "#000000",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
      roundingValue: 0,
      roundingPercentage: 0,
    },
  },
  userOptions: {
    show: true,
    title: "options",
    labels: {
      useDiv: "Title & legend inside",
      showTable: "Show table",
    },
  },
  translations: {
    target: "Target",
  },
});

const quadrantConfig = ref({
  style: {
    fontFamily: "inherit",
    chart: {
      height: 512, // change to size only ? impose ?
      width: 512,
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      layout: {
        useDiv: true,
        labels: {
          quadrantLabels: {
            show: true,
            tl: {
              text: "top left",
              color: "#CCCCCC",
              fontSize: 16,
              bold: true,
            },
            tr: {
              text: "top right",
              color: "#CCCCCC",
              fontSize: 16,
              bold: true,
            },
            br: {
              text: "bottom right",
              color: "#CCCCCC",
              fontSize: 16,
              bold: true,
            },
            bl: {
              text: "bottom left",
              color: "#CCCCCC",
              fontSize: 16,
              bold: true,
            },
          },
          plotLabels: {
            show: true,
            fontSize: 10,
            color: "#CCCCCC",
            offsetY: 10,
          },
          axisLabels: {
            show: true,
            fontSize: 14,
            color: {
              positive: "#CCCCCC",
              negative: "#CCCCCC",
            },
          },
        },
        grid: {
          stroke: "#AAAAAA",
          strokeWidth: 0.5,
          showArrows: true,
          graduations: {
            stroke: "#AAAAAA",
            strokeWidth: 0.5,
            show: true,
            steps: 5,
            fill: true,
            color: "#E1E5E8",
            roundingForce: 10,
          },
          xAxis: {
            min: -100,
            max: 100,
            auto: true,
            name: "xAxis",
          },
          yAxis: {
            min: -100,
            max: 100,
            auto: true,
            name: "yAxis",
          },
        },
        plots: {
          radius: 6,
          outline: true,
          outlineColor: "#CCCCCC",
          outlineWidth: 0.5,
        },
        areas: {
          show: true,
          opacity: 50,
          useGradient: true,
        },
      },
      title: {
        text: "Title",
        color: "#FAFAFA",
        fontSize: 20,
        bold: true,
        subtitle: {
          color: "#A1A1A1",
          text: "Subtitle",
          fontSize: 16,
          bold: false,
        },
      },
      tooltip: {
        show: true,
        backgroundColor: "#1A1A1A",
        color: "#CCCCCC",
        fontSize: 14,
        roundingValue: 0,
      },
      legend: {
        show: true,
        bold: true,
        backgroundColor: "#1A1A1A",
        color: "#CCCCCC",
        fontSize: 14,
      },
    },
  },
  table: {
    show: false,
    th: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
    },
    td: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
      roundingValue: 0,
    },
  },
  userOptions: {
    show: true,
    title: "options",
    labels: {
      useDiv: "Title & legend inside",
      showTable: "Show table",
      showPlotLabels: "Show plot labels",
    },
  },
  translations: {
    category: "Category",
    item: "Item",
    side: "Side",
  },
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
        x: -50,
        y: -50,
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

const gaugeConfig = ref({
  style: {
    fontFamily: "inherit",
    chart: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      animation: {
        use: true,
        speed: 1,
        acceleration: 1,
      },
      layout: {
        useDiv: false,
        track: {
          size: 1,
          useGradient: true,
          gradientIntensity: 40,
        },
        markers: {
          size: 1,
          color: "#CCCCCC",
          strokeWidth: 1,
          stroke: "#CCCCCC",
          backgroundColor: "#1A1A1A",
          bold: true,
          fontSizeRatio: 1,
          offsetY: 0,
          roundingValue: 0,
        },
        pointer: {
          size: 1,
          stroke: "#CCCCCC",
          strokeWidth: 12,
          useRatingColor: true,
          color: "#1A1A1A",
          circle: {
            radius: 10,
            stroke: "#CCCCCC",
            strokeWidth: 2,
            color: "#1A1A1A",
          },
        },
      },
      legend: {
        fontSize: 48,
        prefix: "",
        suffix: "",
        roundingValue: 1,
        showPlusSymbol: true,
        useRatingColor: true,
        color: "#CCCCCC",
      },
      title: {
        text: "Title",
        color: "#E1E5E8",
        fontSize: 20,
        bold: true,
        subtitle: {
          color: "#A1A1A1",
          text: "Subtitle",
          fontSize: 16,
          bold: false,
        },
      },
    },
  },
  userOptions: {
    show: true,
    title: "options",
    labels: {
      useDiv: "Title inside",
      showTable: "Show table",
    },
  },
  translations: {
    base: "Base",
  },
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

const chestnutConfig = ref({
  style: {
    fontFamily: "inherit",
    chart: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      layout: {
        grandTotal: {
          show: true,
          fontSize: 20,
          bold: true,
          suffix: "",
          prefix: "",
          roundingValue: 0,
          color: "#CCCCCC",
          text: "Grand total",
          offsetY: 0,
        },
        roots: {
          stroke: "#1A1A1A",
          strokeWidth: 5,
          useGradient: true,
          gradientIntensity: 20,
          underlayerColor: "#FFFFFF",
          labels: {
            show: true,
            fontSize: 16,
            adaptColorToBackground: true,
            color: "#1A1A1A",
            bold: true,
            roundingValue: 0,
            prefix: "",
            suffix: "",
            name: {
              color: "#CCCCCC",
              fontSize: 16,
              bold: true,
            },
          },
        },
        verticalSeparator: {
          stroke: "#1A1A1A",
          strokeWidth: 5,
        },
        links: {
          opacity: 20,
        },
        branches: {
          stroke: "#1A1A1A",
          strokeWidth: 0,
          borderRadius: 6,
          useGradient: true,
          gradientIntensity: 20,
          underlayerColor: "#1A1A1A",
          widthRatio: 1.5,
          labels: {
            show: true,
            fontSize: 14,
            color: "#CCCCCC",
            bold: true,
            dataLabels: {
              show: true,
              hideUnderValue: 5,
              fontSize: 14,
              roundingValue: 0,
              roundingPercentage: 0,
              prefix: "",
              suffix: "",
            },
          },
        },
        nuts: {
          offsetX: 20,
          useGradient: true,
          gradientIntensity: 30,
          selected: {
            useMotion: true,
            useGradient: true,
            gradientIntensity: 40,
            roundingValue: 0,
            roundingPercentage: 0,
            labels: {
              dataLabels: {
                hideUnderValue: 5,
                color: "#CCCCCC",
                fontSize: 12,
                bold: true,
                prefix: "",
                suffix: "",
              },
              core: {
                total: {
                  color: "#CCCCCC",
                  fontSize: 24,
                  bold: false,
                },
                value: {
                  color: "#FAFAFA",
                  fontSize: 24,
                  bold: true,
                  prefix: "",
                  suffix: "",
                },
              },
            },
          },
        },
        legend: {
          fontSize: 16,
          color: "#CCCCCC",
          roundingValue: 0,
          roundingPercentage: 0,
          prefix: "",
          suffix: "",
        },
        title: {
          color: "#FAFAFA",
          fontSize: 20,
          text: "Title",
          bold: true,
          offsetY: 0,
          subtitle: {
            text: "Subtitle",
            color: "#CCCCCC",
            bold: false,
            fontSize: 16,
            offsetY: 0,
          },
        },
      },
    },
  },
  table: {
    show: false,
    th: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
      translations: {
        rootName: "root name",
        rootValue: "root value",
        rootToTotal: "%/total",
        branchName: "branch name",
        branchValue: "branch value",
        branchToRoot: "%/root",
        branchToTotal: "%/total",
        nutName: "nut name",
        nutValue: "nut value",
        nutToBranch: "%/branch",
        nutToRoot: "%/root",
        nutToTotal: "%/total",
      },
    },
    td: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
      roundingValue: 0,
      roundingPercentage: 0,
    },
  },
  userOptions: {
    show: true,
    title: "options",
    labels: {
      showTable: "Show table",
    },
  },
  translations: {
    total: "Total",
    proportionToTree: "of grand total",
    of: "of",
  },
});

const onionDataset = ref([
  {
    name: "Serie 1",
    percentage: 90,
    value: 1200,
    prefix: "",
    suffix: "",
  },
  {
    name: "Serie 2",
    percentage: 50,
    value: 1000,
    prefix: "",
    suffix: "",
  },
  {
    name: "Serie 3",
    percentage: 75,
    value: 500,
    prefix: "",
    suffix: "",
  },
  {
    name: "Serie 4",
    percentage: 10,
    value: 200,
    prefix: "",
    suffix: "",
  },
]);

const onionConfig = ref({
  style: {
    fontFamily: "inherit",
    chart: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      useGradient: false,
      gradientIntensity: 20,
      layout: {
        useDiv: false,
        gutter: {
          color: "#3A3A3A",
          width: 0.62,
        },
        track: {
          width: 0.62,
        },
        labels: {
          show: true,
          fontSize: 14,
          color: "#CCCCCC",
          roundingValue: 0,
          roundingPercentage: 0,
          bold: true,
          offsetY: 0,
          offsetX: 0,
          value: {
            show: true,
          },
          percentage: {
            show: true,
          },
        },
      },
      title: {
        text: "Title",
        color: "#FAFAFA",
        fontSize: 20,
        bold: true,
        subtitle: {
          color: "#A1A1A1",
          text: "Subtitle",
          fontSize: 16,
          bold: false,
        },
      },
      legend: {
        show: true,
        bold: true,
        backgroundColor: "#1A1A1A",
        color: "#CCCCCC",
        fontSize: 14,
        roundingValue: 0,
        roundingPercentage: 0,
      },
    },
  },
  userOptions: {
    show: true,
    title: "options",
    labels: {
      useDiv: "Title & legend inside",
      showTable: "Show table",
    },
  },
  table: {
    show: false,
    th: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
    },
    td: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
      roundingValue: 0,
      roundingPercentage: 0,
    },
    translations: {
      value: "Value",
      percentage: "Percentage",
      serie: "Serie",
    },
  },
});

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
const verticalConfig = ref({
  style: {
    fontFamily: "inherit",
    chart: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      layout: {
        useDiv: true,
        bars: {
          sort: "asc",
          useStroke: false,
          strokeWidth: 2,
          height: 32,
          gap: 6,
          borderRadius: 4,
          offsetX: 64,
          paddingRight: 0,
          useGradient: true,
          gradientIntensity: 20,
          fillOpacity: 10,
          underlayerColor: "#FFFFFF",
          dataLabels: {
            color: "#CCCCCC",
            bold: true,
            fontSize: 12,
            value: {
              show: true,
              roundingValue: 0,
              prefix: "",
              suffix: "",
            },
            percentage: {
              show: true,
              roundingPercentage: 0,
            },
            offsetX: 0,
          },
          nameLabels: {
            show: true,
            color: "#CCCCCC",
            bold: false,
            fontSize: 10,
            offsetX: 0,
          },
          parentLabels: {
            show: true,
            color: "#CCCCCC",
            bold: false,
            fontSize: 10,
            offsetX: 0,
          },
        },
        highlighter: {
          color: "#FFFFFF",
          opacity: 5,
        },
        separators: {
          show: true,
          color: "rgb(52,52,52)",
          strokeWidth: 1,
        },
      },
      title: {
        text: "Title",
        color: "#FAFAFA",
        fontSize: 20,
        bold: true,
        subtitle: {
          color: "#A1A1A1",
          text: "Subtitle",
          fontSize: 16,
          bold: false,
        },
      },
      legend: {
        position: "top",
        show: true,
        fontSize: 14,
        color: "#CCCCCC",
        bold: true,
        roundingValue: 0,
        backgroundColor: "#1A1A1A",
        roundingPercentage: 0,
        prefix: "",
        suffix: "",
      },
      tooltip: {
        show: true,
        backgroundColor: "#1A1A1A",
        color: "#CCCCCC",
        fontSize: 14,
        showValue: true,
        showPercentage: true,
        roundingValue: 0,
        roundingPercentage: 0,
        prefix: "",
        suffix: "",
      },
    },
  },
  userOptions: {
    show: true,
    title: "options",
    labels: {
      useDiv: "Title & legend inside",
      showTable: "Show table",
      sort: "Sort desc",
    },
  },
  table: {
    show: false,
    th: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
    },
    td: {
      backgroundColor: "#1A1A1A",
      color: "#CCCCCC",
      outline: "1px solid #e1e5e8",
      roundingValue: 0,
      roundingPercentage: 0,
      prefix: "",
      suffix: "",
    },
  },
  translations: {
    parentName: "Serie",
    childName: "Child",
    value: "value",
    percentageToTotal: "%/total",
    percentageToSerie: "%/serie",
  },
});

const screenshotConfig = ref({
  mode: "post",
  quality: 1,
  style: {
    info: {
      background: "#1A1A1A",
      color: "#CCCCCC",
      fontSize: 14,
      bold: true,
      minWidth: 300,
      padding: 12,
      borderRadius: 4,
      boxShadow: "0 6px 12px -6px rgba(0,0,0,0.2)",
      fontFamily: "inherit",
      border: "none",
      top: -100,
    },
    captureButton: {
      background: "#1A1A1A",
      color: "#CCCCCC",
      fontSize: 14,
      borderRadius: 4,
      border: "1px solid #CCCCC",
      minHeight: 40,
      padding: "8px 12px",
      boxShadow: "0 6px 12px -6px rgba(0,0,0,0.2)",
      bold: true,
    },
    cancelButton: {
      background: "#F17171",
      color: "#FFFFFF",
      size: 28,
      borderRadius: 14,
      top: -14,
      right: -14,
      border: "none",
    },
    captureArea: {
      initialHeight: 200,
      initialWidth: 200,
      border: "dashed 2px #CCCCCC",
    },
    handles: {
      size: 40,
      background: "#1A1A1A",
      border: "4px solid #CCCCCC",
      borderRadius: 4,
    },
  },
  translations: {
    info: "Resize or move and click to capture",
    captureButton: "Capture",
  },
});

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

const ratingConfig = ref({
  type: "star",
  readonly: false,
  from: 1,
  to: 5,
  style: {
    fontFamily: "inherit",
    animated: true,
    itemSize: 32,
    backgroundColor: "#FFFFFF",
    star: {
      activeColor: "#FFD055",
      borderColor: "#FFD055",
      borderWidth: 3,
      apexes: 5,
      inactiveColor: "#e1e5e8",
      useGradient: true,
    },
    image: {
      src: "",
      inactiveOpacity: 0.3,
      alt: "rating image",
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

const skeletonConfig = ref({
  type: "pyramid",
  style: {
    backgroundColor: "#1A1A1A",
    color: "#CCCCCC",
    maxHeight: 500,
    animated: false,
    chestnut: {
      color: "e1e5e8",
    },
    line: {
      axis: {
        show: true,
        color: "#e1e5e8",
        strokeWidth: 0.5,
      },
      path: {
        color: "#e1e5e8",
        strokeWidth: 1,
        showPlots: true,
      },
    },
    bar: {
      axis: {
        show: true,
        color: "#e1e5e8",
        strokeWidth: 0.5,
      },
      borderRadius: 0.5,
      color: "#e1e5e8",
      barWidth: 9,
    },
    donut: {
      color: "#e1e5e8",
      strokeWidth: 64,
    },
    onion: {
      color: "#E1E5E8",
    },
    gauge: {
      color: "#E1E5E8",
    },
    quadrant: {
      grid: {
        color: "#e1e5e8",
        strokeWidth: 0.5,
      },
      plots: {
        radius: 1.5,
        color: "#E1E5E8",
      },
    },
    radar: {
      grid: {
        color: "#E1E5E8",
        strokeWidth: 0.5,
      },
      shapes: {
        color: "#E1E5E8",
      },
    },
    waffle: {
      color: "#e1e5e8",
    },
    table: {
      th: {
        color: "#E1E5E8",
      },
      td: {
        color: "#e1e5e8",
        strokeWidth: 0.5,
      },
    },
    rating: {
      color: "#E1E5E8",
      filled: true,
      strokeWidth: 1,
      maxWidth: 200,
    },
    verticalBar: {
      axis: {
        show: true,
        color: "#e1e5e8",
        strokeWidth: 0.5,
      },
      borderRadius: 0.5,
      color: "#e1e5e8",
    },
    candlesticks: {
      axis: {
        show: true,
        color: "#CCCCCC",
      },
      candle: {
        color: "#CCCCCC",
      },
    },
  },
});

const sparklineConfig = ref({
  type: 'bar',
  style: {
    backgroundColor: "#1A1A1A",
    sparkline: {
      color: "#6376DD",
      strokeWidth: 0.5,
    },
    line: {
      color: "#3366cc",
      strokeWidth: 3,
      smooth: true
    },
    zeroLine: {
      color: "#505050",
      strokeWidth: 1,
    },
    plot: {
      show: true,
      radius: 4,
      stroke: "#FFFFFF",
      strokeWidth: 1,
    },
    verticalIndicator: {
      show: true,
      strokeWidth: 1.5,
    },
    dataLabel: {
      position: "left",
      fontSize: 20,
      bold: true,
      color: "#CCCCCC",
      roundingValue: 0,
      valueType: "latest",
    },
    title: {
      show: true,
      textAlign: "left",
      color: "#FAFAFA",
      fontSize: 16,
      bold: true,
      text: "Title",
    },
    area: {
      show: true,
      useGradient: true,
      opacity: 30,
      color: "#3366cc",
    },
  },
});

const sparklineDataset = ref([
  {
    period: "period1",
    value: 0,
  },
  {
    period: "period2",
    value: 1,
  },
  {
    period: "period3",
    value: 2,
  },
  {
    period: "period4",
    value: 3,
  },
  {
    period: "period5",
    value: 4,
  },
  {
    period: "period6",
    value: 5,
  },
  {
    period: "period6",
    value: 6,
  },
  {
    period: "period8",
    value: 7,
  },
  {
    period: "period9",
    value: -7,
  },
  {
    period: "period10",
    value: -6,
  },
  {
    period: "period11",
    value: -5,
  },
  {
    period: "period12",
    value: -4,
  },
  {
    period: "period13",
    value: -3,
  },
  {
    period: "period14",
    value: -2,
  },
  {
    period: "period15",
    value: -1,
  },
  {
    period: "period16",
    value: 0,
  }
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

const heatmapConfig = ref({
  style: {
    layout: {
      useDiv: true,
      cells: {
        value: {
          show: true,
        },
      },
      dataLabels: {
        yAxis: {
          fontSize: 24,
        },
        xAxis: {
          fontSize: 24,
          values: weeks.value,
        },
      },
    },
    title: {
      text: "Title",
      subtitle: {
        text: "Subtitle",
      },
    },
  },
});

const scatterConfig = ref({
  style: {
    layout: {
      useDiv: true,
      dataLabels: {
        xAxis: {
          name: "xAxis",
        },
        yAxis: {
          name: "yAxis",
        },
      },
    },
    title: {
      text: "Title",
      subtitle: {
        text: "Subtitle",
      },
    },
  },
});

const scat1 = computed(() => {
  const arr = [];
  for (let i = -50; i < 50; i += 1) {
    arr.push({
      x: Math.random() * i + 12,
      y: (Math.random() * i) / 20,
      name: `plot_${i}_cluster_1`,
    });
  }
  return arr;
});
const scat2 = computed(() => {
  const arr = [];
  for (let i = -50; i < 50; i += 1) {
    arr.push({
      x: (Math.random() * i) / 10,
      y: (Math.random() * i) / 10,
      name: `plot_${i}_cluster_2`,
    });
  }
  return arr;
});

const scatterDataset = computed(() => {
  return [
    {
      name: "Cluster 1",
      values: scat1.value,
    },
    {
      name: "Cluster 2",
      values: scat2.value,
    },
  ];
});

const candlestickConfig = ref({
  style: {
    layout: {
      useDiv: true,
    },
    title: {
      text: "Title",
      subtitle: {
        text: "Subtitle",
      },
    },
  },
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

const pyramidConfig = ref({
  style: {
    layout: {
      useDiv: true,
    },
    title: {
      text: "France",
      subtitle: {
        text: "2022",
      },
    },
  },
});

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
    id: 1,
    width: 40,
    height: 30,
    left: 2,
    top: 4,
    component: "VueUiCandlestick",
    props: { config: candlestickConfig, dataset: candlestickDataset },
  },
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
        color: "#FAFAFA"
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
  xytest.value.generateXls();
}
function printDonut(){
  donuttest.value.generatePdf();
}
function xlsDonut() {
  donuttest.value.generateXls();
}
function printWaffle(){
  waffletest.value.generatePdf();
}
function xlsWaffle() {
  waffletest.value.generateXls();
}
function printRadar(){
  radartest.value.generatePdf();
}
function xlsRadar() {
  radartest.value.generateXls();
}
function printQuadrant(){
  quadranttest.value.generatePdf();
}
function xlsQuadrant() {
  quadranttest.value.generateXls();
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
  chestnuttest.value.generateXls();
}

const oniontest = ref(null);
function printOnion(){
  oniontest.value.generatePdf();
}
function xlsOnion() {
  oniontest.value.generateXls();
}

const verticaltest = ref(null);
function printVB(){
  verticaltest.value.generatePdf();
}
function xlsVB() {
  verticaltest.value.generateXls();
}

const heatmaptest = ref(null);
function printHeatmap(){
  heatmaptest.value.generatePdf();
}
function xlsHeatmap() {
  heatmaptest.value.generateXls();
}

function printScatter(){
  scatter.value.generatePdf();
}
function xlsScatter() {
  scatter.value.generateXls();
}

const candlestick = ref(null);
function printCandle(){
  candlestick.value.generatePdf();
}
function xlsCandle() {
  candlestick.value.generateXls();
}

const pyramid = ref(null);
function printPyramid(){
  pyramid.value.generatePdf();
}
function xlsPyramid() {
  pyramid.value.generateXls();
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
                    "suffix":""
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

const showLocalTest = ref(false);
</script>

<template>
  <div>
    <!-- <button @click="sstest">SCREENSHOT</button>
    <button @click="toggleRead">TOGGLE RATING READONLY</button>
    <button @click="getDashPositions">DASH POSITIONS</button>
    <button @click="makeDashPdf">PDF FROM OUTSIDE</button> -->
    <button @click="printXy">PRINT XY</button>
    <button @click="xlsXy">XLS XY</button>
    <button @click="printDonut">PRINT DONUT</button>
    <button @click="xlsDonut">XLS DONUT</button>
    <button @click="printWaffle">PRINT WAFFLE</button>
    <button @click="xlsWaffle">XLS WAFFLE</button>
    <button @click="printRadar">PRINT RADAR</button>
    <button @click="xlsRadar">XLS RADAR</button>
    <button @click="printQuadrant">PRINT QUADRANT</button>
    <button @click="xlsQuadrant">XLS QUADRANT</button>
    <button @click="printGauge">PRINT GAUGE</button>
    <button @click="printChestnut">PRINT CHESTNUT</button>
    <button @click="xlsChestnut">XLS CHESTNUT</button>
    <button @click="printOnion">PRINT ONION</button>
    <button @click="xlsOnion">XLS ONION</button>
    <button @click="printVB">PRINT VERTICAL BAR</button>
    <button @click="xlsVB">XLS VERTICAL BAR</button>
    <button @click="printHeatmap">PRINT HEATMAP</button>
    <button @click="xlsHeatmap">XLS HEATMAP</button>
    <button @click="printScatter">PRINT SCATTER</button>
    <button @click="xlsScatter">XLS SCATTER</button>
    <button @click="printCandle">PRINT CANDLE</button>
    <button @click="xlsCandle">XLS CANDLE</button>
    <button @click="printPyramid">PRINT PYRAMID</button>
    <button @click="xlsPyramid">XLS PYRAMID</button>
    <button @click="printRelation">PRINT RELATION CIRCLE</button>
    <button @click="printThermo">PRINT THERMO</button>

      <Box>
        <template #title>VueUiRelationCircle</template>
        <template #dev>
            <VueUiRelationCircle 
              ref="relation" 
              :dataset="relationDataset" 
              :config="relationConfig"
            />
        </template>
        <template #prod>
          <RelationTest
            ref="relation"
            :dataset="relationDataset"
            :config="relationConfig"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiSparkline</template>
        <template #dev>
          <SparklineTest
            :config="sparklineConfig"
            :dataset="sparklineDataset"
          />
        </template>
        <template #prod>
          <VueUiSparkline
            :config="sparklineConfig"
            :dataset="sparklineDataset"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiXy</template>
        <template #dev>
          <XyTest
            ref="xytest"
            :config="{ ...config, useCanvas: false }"
            :dataset="dataset2"
            @selectLegend="selectLegendXY"
            @selectX="selectX"
          />
        </template>
        <template #prod>
          <VueUiXy
            ref="xytest"
            :config="{ ...config, useCanvas: false, useCssAnimation: false }"
            :dataset="dataset2"
            @selectLegend="selectLegendXY"
            @selectX="selectX"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiSparkHistogram</template>
        <template #dev>
          <HistoTest 
            :dataset="histoDataset" 
            :config="histoConfig"
          />
        </template>
        <template #prod>
          <VueUiSparkHistogram
             :dataset="histoDataset" 
             :config="histoConfig"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiCandleStick</template>
        <template #dev>
          <CandlestickTest 
            ref="candlestick"
            :dataset="candlestickDataset" 
            :config="{...candlestickConfig, useCssAnimation: false}"
          />
        </template>
        <template #prod>
          <VueUiCandlestick
            ref="candlestick"
            :dataset="candlestickDataset"
            :config="{...candlestickConfig, useCssAnimation: false}"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiScatter</template>
        <template #dev>
          <ScatterTest 
            ref="scatter" 
            :dataset="scatterDataset" 
            :config="{...scatterConfig, useCssAnimation: false}"
          />
        </template>
        <template #prod>
          <VueUiScatter
            ref="scatter"
            :config="{...scatterConfig, useCssAnimation: false}"
            :dataset="scatterDataset"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiVerticalBar</template>
        <template #dev>
          <VerticalTest 
            ref="verticaltest"
            :dataset="verticalDataset"
            :config="{useCssAnimation: false, style: { chart: { title: { text: 'Title', subtitle: { text: 'Subtitle'}}}}}"
          />
        </template>
        <template #prod>
          <VueUiVerticalBar
            ref="verticaltest"
            :config="{useCssAnimation: false, style: { chart: { title: { text: 'Title', subtitle: { text: 'Subtitle'}}}}}"
            :dataset="verticalDataset"
            @selectLegend="selectVerticalLegend"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiOnion</template>
        <template #dev>
          <OnionTest
            :config="{ useCssAnimation: false, style: { chart: { title: { text: 'Title', subtitle: { text: 'Subtitle'}}}} }"
            :dataset="onionDataset"
            @selectLegend="selectOnionLegend"
          />
        </template>
        <template #prod>
          <VueUiOnion
            ref="oniontest"
            :config="{ useCssAnimation: false, style: { chart: { title: { text: 'Title', subtitle: { text: 'Subtitle'}}}} }"
            :dataset="onionDataset"
            @selectLegend="selectOnionLegend"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiQuadrant</template>
        <template #dev>
          <QuadrantTest
            ref="quadranttest"
            :dataset="quadrantDataset"
            :config="{useCssAnimation: false, style: { chart: { title: { text: 'Title', subtitle: { text: 'Subtitle'}}}}}"
            @selectPlot="selectPlot"
            @selectSide="selectSide"
            @selectLegend="selectQuadrantLegend"
          />
        </template>
        <template #prod>
          <VueUiQuadrant
            ref="quadranttest"
            :dataset="quadrantDataset"
            :config="{useCssAnimation: false, style: { chart: { title: { text: 'Title', subtitle: { text: 'Subtitle'}}}}}"
            @selectPlot="selectPlot"
            @selectSide="selectSide"
            @selectLegend="selectQuadrantLegend"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiRadar</template>
        <template #dev>
          <RadarTest
            ref="radartest"
            :dataset="radarDataset"
            :config="{useCssAnimation: false, style: { chart: { title: { text: 'Title', subtitle: { text: 'Subtitle'}}}}}"
            @selectLegend="selectRadarLegend"
          />
        </template>
        <template #prod>
          <VueUiRadar
            ref="radartest"
            :dataset="radarDataset"
            :config="{useCssAnimation: false, style: { chart: { title: { text: 'Title', subtitle: { text: 'Subtitle'}}}}}"
            @selectLegend="selectRadarLegend"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiDonut</template>
        <template #dev>
          <DonutTest
            ref="donuttest"
            :dataset="donutDataset"
            :config="{
              style: {
                chart: {
                  title: {
                    text: 'Title',
                    subtitle: {
                      text: 'Subtitle'
                    }
                  }
                }
              }
            }"
            @selectLegend="selectLegendDonut"
          />
        </template>
        <template #prod>
          <VueUiDonut
            ref="donuttest"
            :dataset="donutDataset"
            :config="{
              style: {
                chart: {
                  title: {
                    text: 'Title',
                    subtitle: {
                      text: 'Subtitle'
                    }
                  }
                }
              }
            }"
            @selectLegend="selectLegendDonut"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiSparkStackbar</template>
        <template #dev>
          <StackTest 
            :dataset="stackDataset"
          />
        </template>
        <template #prod>
          <VueUiSparkStackbar  
            :dataset="stackDataset"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiThermometer</template>
        <template #dev>
          <ThermoTest 
            ref="thermo" 
            :dataset="thermoDataset" 
            :config="thermoConfig" 
          />
        </template>
        <template #prod>
          <VueUiThermometer 
            ref="thermo" 
            :dataset="thermoDataset" 
            :config="thermoConfig" 
          />
        </template>
      </Box>
      
      <Box>
        <template #title>VueUiSkeleton</template>
        <template #dev>
          <SkeletonTest
            :config="{ type: 'rating', style: { rating: { useSmiley: true, filled: true } } }"
          />
        </template>
        <template #prod>
          <VueUiSkeleton
            :config="{ type: 'rating', style: { rating: { useSmiley: true, filled: true } } }"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiSmiley</template>
        <template #dev>
          <SmileyTest 
            :dataset="ratingDataset" 
            :config="smileyConfig" 
          />
        </template>
        <template #prod>
          <VueUiSmiley
            :dataset="ratingDataset"
            :config="smileyConfig"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiRating</template>
        <template #dev>
          <RatingTest
            ref="ratingtest"
            :config="ratingConfig"
            :dataset="ratingDataset"
          />
        </template>
        <template #prod>
          <VueUiRating
            ref="ratingtest"
            :config="ratingConfig"
            :dataset="ratingDataset"
          />
        </template>
      </Box>
      
      <Box>
        <template #title>VueUiChestnut</template>
        <template #dev>
          <ChestnutTest
            ref="chestnuttest"
            :dataset="chestnutDataset"
            @selectRoot="selectRoot"
            @selectBranch="selectBranch"
            @selectNut="selectNut"
          />
        </template>
        <template #prod>
          <VueUiChestnut
            ref="chestnuttest"
            :dataset="chestnutDataset"
            @selectRoot="selectRoot"
            @selectBranch="selectBranch"
            @selectNut="selectNut"
          />
        </template>
      </Box>
      
      <Box>
        <template #title>VueUiPyramid</template>
        <template #dev>
          <PyramidTest 
            ref="pyramid" 
            :dataset="pyramidDataset"
            :config="{style:{title:{text:'Title', subtitle:{text: 'Subtitle'}}}}"
          />
        </template>
        <template #prod>
          <VueUiAgePyramid
            ref="pyramid"
            :dataset="pyramidDataset"
            :config="{style:{title:{text:'Title', subtitle:{text: 'Subtitle'}}}}"
          />
        </template>
      </Box>
      
      <Box>
        <template #title>VueUiWaffle</template>
        <template #dev>
          <WaffleTest
            ref="waffletest"
            :dataset="donutDataset"
            :config="{style:{chart:{title:{text:'Title',subtitle:{text:'Subtitle'}}}}}"
            @selectLegend="selectLegendWaffle"
          />
        </template>
        <template #prod>
          <VueUiWaffle
            ref="waffletest"
            :dataset="donutDataset"
             :config="{style:{chart:{title:{text:'Title',subtitle:{text:'Subtitle'}}}}}"
            @selectLegend="selectLegendWaffle"
          />
        </template>
      </Box>
      
      <Box>
        <template #title>VueUiAnnotator</template>
        <template #dev>
          <AnnotatorTest
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
          </AnnotatorTest>
        </template>
        <template #prod>
          <VueUiAnnotator
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
          </VueUiAnnotator>
        </template>
      </Box>

            
      <Box>
        <template #title>VueUiDashboard</template>
        <template #dev>
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
        </template>
        <template #prod>
          <VueUiDashboard
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
          </VueUiDashboard>
        </template>
      </Box>

      <Box>
        <template #title>VueUiSparkbar</template>
        <template #dev>
          <SparkbarTest
            :config="sparkbarConfig"
            :dataset="sparkbarDataset"
          />
        </template>
        <template #prod>
          <VueUiSparkbar
            :config="sparkbarConfig"
            :dataset="sparkbarDataset"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiHeatmap</template>
        <template #dev>
          <HeatmapTest
            ref="heatmaptest"
            :config="heatmapConfig"
            :dataset="heatmapDataset"
          />
        </template>
        <template #prod>
          <VueUiHeatmap
            ref="heatmaptest"
            :config="heatmapConfig"
            :dataset="heatmapDataset"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiGauge</template>
        <template #dev>
          <GaugeTest 
            ref="gaugetest" 
            :dataset="gaugeDataset" 
          />
        </template>
        <template #prod>
          <VueUiGauge
            ref="gaugetest"
            :dataset="gaugeDataset"
          />
        </template>
      </Box>

      <Box>
        <template #title>VueUiTable</template>
        <template #dev>
          <TableTest 
            :dataset="tableTestDataset" 
          />
        </template>
        <template #prod>
          <VueUiTable 
            :dataset="tableTestDataset" 
          />
        </template>
      </Box>

    <img v-if="pic" :src="pic" />
  </div>
</template>

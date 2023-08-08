<script setup>
import { ref, computed, onMounted } from "vue";
import TableTest from "./components/vue-ui-table.vue";
import DonutTest from "./components/vue-ui-donut.vue";
import XyTest from "./components/vue-ui-xy.vue"
import WaffleTest from "./components/vue-ui-waffle.vue";
import RadarTest from "./components/vue-ui-radar.vue";
import QuadrantTest from "./components/vue-ui-quadrant.vue";
import GaugeTest from "./components/vue-ui-gauge.vue";
import ChestnutTest from "./components/vue-ui-chestnut.vue";
import OnionTest from "./components/vue-ui-onion.vue";
import VerticalTest from "./components/vue-ui-vertical-bar.vue";

const dataset = ref([
        {
          name: "Series 1",
          series: [200, 100, 125, 230, 120, 100, 90, 50, 12, 25, 100, 154, 155],
          type: "line",
        },
      ]);
const dataset2 = ref([
        {
          name: "Series 1",
          series: [ -55, -34, -21, -13, -8, -5, -3, -2, -1, -1, 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
          type: "bar",
        },
        {
          name: "Series 2",
          series: [-55, -34, -21, -13, -18, -5, -3, -2, -1, -1, 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
          type: "bar"
        },
        {
          name: "Series 3",
          series: [-55, -34, -21, -13, -8, -5, -3, -2, -1, -1, 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
          type: "line",
          dashed: true,
        },
        {
          name: "Series 4",
          series: [0, 1, 2, 3, 5, null, 13, 21, 34, 55,],
          type: "line",
          dashed: true,
        },
      ]);

      const config = ref({
        chart: {
          color: "#000000",
          background: "#FFFFFF",
          highlighter: {
            color: "#FF0000"
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
            bottom: 48,
            top: 48
          },
          grid: {
            labels: {
              color: "red",
              axis: {
                xLabel: "x label",
                yLabel: "yLabel",
                fontSize: 20,
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
                "SEP"
              ]
              }
            }
          },
          legend: {
            useDiv: true,
          },
          title: {
            text: "This is a title",
            useDiv: true,
            subtitle: {
              text: "This is a subtitle",
              color: "grey"
            }
          }
        },
        bar: {
          useGradient: true,
          labels: {
            show: false,
          }
        },
        line: {
          radius: 2.5,
           labels: {
            show: true
          }
        },
        plot: {
         
        },
        table: {
          rounding: 1,
          th: {
            backgroundColor: "#FF0000"
          }
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
              suffix:"",
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
              suffix:"",
              prefix:"",
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
              suffix:"",
              prefix:"",
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
              suffix:"",
              prefix:"",
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
              suffix:"€",
              prefix:"",
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
              suffix:"",
              prefix:"",
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
              suffix:"",
              prefix:"",
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
              suffix:"",
              prefix:"",
              rangeFilter: false
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
        "Fiabilité du matériel"
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
            '',
            Math.random() * (Math.random() > 0.5 ? 150 : -30), 
            Math.random() * 350 
          ];
          items.push({td: data});
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
      const formattedDate = randomDate.toISOString().split('T')[0]; 
      return formattedDate;
    }
      return generateRandomData();
      })

      const tableTestDataset = {
        header: head.value,
        body: body.value,
      }

    const tableConfig = ref({
      useChart: true,
    })

    const darkConfig = ref({
    fontFamily: "inherit",
    rowsPerPage: 25,
    style: {
        th: {
            backgroundColor: "#1a1a1a",
            color:"#c4c9cc",
            outline: "1px solid #7b8185",
            selected: {
                backgroundColor: "#42d392",
                color: "#1a1a1a"
            }
        },
        rows: {
            even: {
                backgroundColor: "#1a1a1a",
                color: "#c4c9cc",
                selectedCell: {
                    backgroundColor: '#42d392',
                    color: "#2D353C"
                },
                selectedNeighbors: {
                    backgroundColor: "#075e37",
                    color: "#FFFFFF"
                }
            },
            odd: {
                backgroundColor: "#2A2A2A",
                color: "#FFFFFF",
                selectedCell: {
                    backgroundColor: '#5de8aa',
                    color: "#2D353C"
                },
                selectedNeighbors: {
                    backgroundColor: "#0c7a49",
                    color: "#FFFFFF"
                }
            },
        },
        inputs: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            border: "1px solid #CCCCCC",
            accentColor: "#42d392"
        },
        dropdowns: {
            backgroundColor: "#1a1a1a",
            color: "#c4c9cc",
            icons: {
                selected: {
                    color: "#42d392",
                    unicode: "✔"
                },
                unselected: {
                    color: "#ff6400",
                    unicode: "✖"
                }
            }
        },
        infoBar: {
            backgroundColor: "#1a1a1a",
            color: "#FFFFFF"
        },
        pagination: {
            buttons: {
                backgroundColor: "#1a1a1a",
                color: "#E1E5E8",
                opacityDisabled: 0.3
            },
            navigationIndicator: {
                backgroundColor: "#42d392"
            }
        },
        exportMenu: {
            backgroundColor: "#1a1a1a",
            color: "#E1E5E8",
            buttons: {
                backgroundColor: "#42d392",
                color: "#2D353C"
            }
        },
        closeButtons: {
            backgroundColor: "transparent",
            color: "#ff6400",
            borderRadius: "50%"
        },
        chart: {
            modal: {
                backgroundColor: "#1a1a1a",
                color: "#E1E5E8",
                buttons: {
                  selected: {
                      backgroundColor: "#42d392",
                      color: "#1a1a1a"
                    },
                    unselected: {
                      backgroundColor: "#1a1a1a",
                      color: "#E1E5E8"
                    }
                }
            },
            layout: {
                backgroundColor: "#1a1a1a",
                axis: {
                    stroke: "#ccd1d4",
                    strokeWidth: 2,
                },
                bar: {
                    fill: "#42d392",
                    stroke: "#1a1a1a"
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
                        }
                    },
                    selector: {
                        stroke: "#ff6400",
                        strokeWidth: 1,
                        strokeDasharray: 5
                    },
                },
                labels: {
                    color: "#ccd1d4"
                },
                progression: {
                    stroke: "#FFFFFF",
                    strokeWidth: 2,
                    strokeDasharray: 4,
                    arrowSize: 7,
                }
            },
        }
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
        total: 'Total',
        totalRows: "Total rows",
    },
    useChart: true
})

const donutDataset = [
  {
    name: "serie 1",
    color: "",
    values: [1]
  },
  {
    name: "serie 2",
    color: "",
    values: [2]
  },
  {
    name: "serie 3",
    color: "",
    values: [3]
  },
  {
    name: "serie 4",
    color: "",
    values: [3,5]
  }
];

const donutConfig = {
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
                        fontSize: 18
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
                            text:  "Total",
                            offsetY: 0,
                            value: {
                                color: "#FAFAFA",
                                fontSize: 18,
                                bold: true,
                                suffix: "",
                                prefix: "",
                                offsetY: 0,
                                rounding: 0,
                            }
                        },
                        average: {
                            show: true,
                            bold: false,
                            fontSize: 18,
                            color: "#FAFAFA",
                            text:  "Average",
                            offsetY: 0,
                            value: {
                                color: "#FAFAFA",
                                fontSize: 18,
                                bold: true,
                                suffix: "",
                                prefix: "",
                                offsetY: 0,
                                rounding: 0,
                            }
                        }
                    }
                },
                donut: {
                    strokeWidth: 64
                },
            },
            legend: {
                    backgroundColor: "#000000",
                    color: "#FAFAFA",
                    show: true,
                    fontSize: 16,
                    bold: false,
                    roundingValue:2,
                    roundingPercentage:2
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
                    bold: false
                }
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
            }
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            dataLabels: "Show datalabels",
            useDiv: "Title & legend inside",
            showTable: "Show table"
        }
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
            outline: "1px solid #e1e5e8"
        },
        td: {
            backgroundColor: "#000000",
            color: "#FAFAFA",
            outline: "1px solid #e1e5e8",
            roundingValue: 1,
            roundingPercentage: 1
        }
    }
}

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
                    bold: false
                }
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
            }
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            useDiv: "Title & legend inside",
            showTable: "Show table"
        }
    },
    table: {
        show: true,
        th: {
            backgroundColor: "#FAFAFA",
            color: "#2D353C",
            outline: "1px solid #e1e5e8"
        },
        td: {
            backgroundColor: "#FFFFFF",
            color: "#2D353C",
            outline: "1px solid #e1e5e8",
            roundingValue: 0,
            roundingPercentage: 0
        }
    }
});

const radarDataset = ref({
  categories: [
    {
      name: "category 1",
    },
    {
      name: "category 2"
    },
    {
      name: "category 3"
    }
],
  series: [
    {
      name: "Serie 1",
      values: [1, 2, 3],
      color: "",
      target: 3
    },
    {
      name: "Serie 2",
      values: [2, 3, 4],
      color: "",
      target: 10
    },
    {
      name: "Serie 3",
      values: [3, 4, 5],
      color: "",
      target: 10
    },
    {
      name: "Serie 4",
      values: [4, 5, 6],
      color: "",
      target: 10
    },
    {
      name: "Serie 5",
      values: [5, 6, 7],
      color: "",
      target: 10
    },
    {
      name: "Serie 6",
      values: [6, 7, 8],
      color: "",
      target: 10
    },
  ]
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
                    graduations: 5
                },
                labels: {
                    dataLabels: {
                        show: true,
                        fontSize: 12,
                        color: "#CCCCCC"
                    }
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
                    bold: false
                }
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
            }
        }
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#000000",
            color: "#CCCCCC",
            outline: "1px solid #e1e5e8"
        },
        td: {
            backgroundColor: "#000000",
            color: "#CCCCCC",
            outline: "1px solid #e1e5e8",
            roundingValue: 0,
            roundingPercentage: 0
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            useDiv: "Title & legend inside",
            showTable: "Show table"
        }
    },
    translations: {
      target: "Target"
    }
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
                            negative: "#CCCCCC"
                        }
                    }
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
                        name: "xAxis"
                    },
                    yAxis: {
                        min: -100,
                        max: 100,
                        auto: true,
                        name: "yAxis"
                    }
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
                }
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
                    bold: false
                }
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
            }
        }
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#1A1A1A",
            color: "#CCCCCC",
            outline: "1px solid #e1e5e8"
        },
        td: {
            backgroundColor: "#1A1A1A",
            color: "#CCCCCC",
            outline: "1px solid #e1e5e8",
            roundingValue: 0
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            useDiv: "Title & legend inside",
            showTable: "Show table",
            showPlotLabels: "Show plot labels"
        }
    },
    translations: {
        category: "Category",
        item: "Item",
        side: "Side"
    }
});

const quadrantDataset = ref([
  {
    name: "category 1",
    shape: "star",
    series: [
      {
        name: "cat1 item1",
        x: 50,
        y: 50
      },
      {
        name: "cat1 item2",
        x: -25,
        y: -25
      },
      {
        name: "cat1 item3",
        x: -25,
        y: 25
      },
      {
        name: "cat1 item4",
        x: 25,
        y: -25
      },
    ]
  },
  {
    name: "category 2",
    shape: "circle",
    series: [
      {
        name: "cat2 item1",
        x: -50,
        y: -50
      },
      {
        name: "cat2 item2",
        x: 12,
        y: -24
      },
      {
        name: "cat2 item3",
        x: -16,
        y: 32
      },
      {
        name: "cat2 item4",
        x: 15,
        y: 6
      }
    ]
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
  ]
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
                        color: "#1A1A1A"
                    }
                }
            },
            legend: {
                fontSize: 48,
                prefix: "",
                suffix: "",
                roundingValue: 1,
                showPlusSymbol: true,
                useRatingColor: true,
                color: "#CCCCCC"
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
                    bold: false
                }
            },
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            useDiv: "Title inside",
            showTable: "Show table"
        }
    },
    translations: {
        base: "Base"
    }
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
        ]
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
        ]
      },

    ]
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
        ]
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
        ]
      }
    ]
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
        ]
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
        ]
      }
    ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
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
        ]
      },
    ]
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
                        }
                    }
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
                        }
                    }
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
                                suffix: ""
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
                                    suffix: ""
                                }
                            }
                        }
                    }
                },
                legend: {
                    fontSize: 16,
                    color: "#CCCCCC",
                    roundingValue: 0,
                    roundingPercentage: 0,
                    prefix: "",
                    suffix: ""
                },
                title: {
                    color: "#FAFAFA",
                    fontSize: 20,
                    text: "Title",
                    bold: true,
                    offsetY:0,
                    subtitle: {
                        text: "Subtitle",
                        color: "#CCCCCC",
                        bold: false,
                        fontSize: 16,
                        offsetY: 0,
                    }
                }
            }
        }
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
                nutToTotal: "%/total"
            }
        },
        td: {
            backgroundColor: "#1A1A1A",
            color: "#CCCCCC",
            outline: "1px solid #e1e5e8",
            roundingValue: 0,
            roundingPercentage: 0
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            showTable: "Show table"
        }
    },
    translations: {
        total: "Total",
        proportionToTree: "of grand total",
        of: "of"
    }
})

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
                    }
                }
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
                    bold: false
                }
            },
            legend: {
                show: true,
                bold: true,
                backgroundColor: "#1A1A1A",
                color: "#CCCCCC",
                fontSize: 14,
                roundingValue: 0,
                roundingPercentage: 0,
            }
        }
    },
    userOptions: {
        show: true,
        title: "options",
        labels: {
            useDiv: "Title & legend inside",
            showTable: "Show table"
        }
    },
    table: {
        show: false,
        th: {
            backgroundColor: "#1A1A1A",
            color: "#CCCCCC",
            outline: "1px solid #e1e5e8"
        },
        td: {
            backgroundColor: "#1A1A1A",
            color: "#CCCCCC",
            outline: "1px solid #e1e5e8",
            roundingValue: 0,
            roundingPercentage: 0
        },
        translations: {
            value: "Value",
            percentage: "Percentage",
            serie: "Serie"
        }
    }
});

const verticalDataset = ref([
  {
    name: "Serie 1",
    value: 100,
    color: "#FF0000",
    children: [
      {
        name: "serie 1 child 1",
        value: 80
      },
      {
        name: "serie 1 child 2",
        value: 20
      },
    ]
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
    color: "#500FF0"
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
    ]
  }
]);
const verticalConfig = ref({
  "style": {
            "fontFamily": "inherit",
            "chart": {
                "backgroundColor": "#1A1A1A",
                "color": "#CCCCCC",
                "layout": {
                    "useDiv": true,
                    "bars": {
                        "sort": "asc",
                        "useStroke": false,
                        "strokeWidth": 2,
                        "height": 32,
                        "gap": 6,
                        "borderRadius": 4,
                        "offsetX": 64,
                        "paddingRight": 0,
                        "useGradient": true,
                        "gradientIntensity": 20,
                        "fillOpacity": 10,
                        "underlayerColor": "#FFFFFF",
                        "dataLabels": {
                            "color":"#CCCCCC",
                            "bold":true,
                            "fontSize":12,
                            "value": {
                                "show": true,
                                "roundingValue":0,
                                "prefix": "",
                                "suffix": ""
                            },
                            "percentage": {
                                "show": true,
                                "roundingPercentage": 0
                            },
                            "offsetX": 0
                        },
                        "nameLabels": {
                            "show": true,
                            "color":"#CCCCCC",
                            "bold": false,
                            "fontSize":10,
                            "offsetX": 0
                        },
                        "parentLabels": {
                            "show": true,
                            "color":"#CCCCCC",
                            "bold": false,
                            "fontSize":10,
                            "offsetX": 0
                        }
                    },
                    "highlighter": {
                        "color": "#FFFFFF",
                        "opacity": 5
                    },
                    "separators": {
                        "show": true,
                        "color":"rgb(52,52,52)",
                        "strokeWidth":1
                    }
                },
                "title": {
                    "text": "Title",
                    "color": "#FAFAFA",
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
                    "show": true,
                    "fontSize": 14,
                    "color":"#CCCCCC",
                    "bold": true,
                    "roundingValue": 0,
                    "backgroundColor": "#1A1A1A",
                    "roundingPercentage": 0,
                    "prefix": "",
                    "suffix": ""
                },
                "tooltip": {
                    "show": true,
                    "backgroundColor": "#1A1A1A",
                    "color": "#CCCCCC",
                    "fontSize": 14,
                    "showValue": true,
                    "showPercentage": true,
                    "roundingValue": 0,
                    "roundingPercentage": 0,
                    "prefix":"",
                    "suffix":""
                }
            }
        },
        "userOptions": {
            "show": true,
            "title": "options",
            "labels": {
                "useDiv": "Title & legend inside",
                "showTable": "Show table",
                "sort": "Sort desc"
            }
        },
        "table": {
            "show": false,
            "th": {
                "backgroundColor": "#1A1A1A",
                "color": "#CCCCCC",
                "outline": "1px solid #e1e5e8"
            },
            "td": {
                "backgroundColor": "#1A1A1A",
                "color": "#CCCCCC",
                "outline": "1px solid #e1e5e8",
                "roundingValue": 0,
                "roundingPercentage": 0,
                "prefix": "",
                "suffix": ""
            }
        },
        "translations": {
            "parentName": "Serie",
            "childName": "Child",
            "value": "value",
            "percentageToTotal": "%/total",
            "percentageToSerie": "%/serie"
        }
});

const showLocalTest = ref(false);

// IDEAS:
// . treeselector (with sums & avgs & so on)

const xytest = ref(null)

function selectLegendXY(ds) {
  console.log(ds);
  const data = xytest.value.getData();
  console.log('getData', data);
}

function selectX(x) {
  console.log(x);
}

const donuttest = ref(null);

function selectLegendDonut(d) {
  console.log(d);
  const data = donuttest.value.getData();
  console.log('getData', data);
}

const waffletest = ref(null);

function selectLegendWaffle(w) {
  console.log(w);
  const data = waffletest.value.getData();
  console.log('getData', data);
}

const radartest = ref(null);

function selectRadarLegend(r) {
  console.log(r);
  const data = radartest.value.getData();
  console.log("getData", data);
}

function selectPlot(plot) {
  console.log({plot});
}

const quadranttest = ref(null)

function selectSide(side) {
  console.log({side});
  const data = quadranttest.value.getData();
  console.log('getData', data);
}

function selectQuadrantLegend(data) {
  console.log(data)
}

const verticaltest = ref(null)

onMounted(() => {
  console.log(verticaltest.value.getData())
})

function selectRoot(r) {
  console.log(r)
}

function selectBranch(b) {
  console.log(b)
}

function selectNut(n) {
  console.log(n)
}

function selectOnionLegend(o) {
  console.log(o)
}

function selectVerticalLegend(v) {
  console.log(v)
}


</script>

<template>
  <div>

    <div style="max-width:1000px; margin:0 auto; margin-bottom: 48px;">
      <VueUiVerticalBar ref="verticaltest" v-if="!showLocalTest" :config="verticalConfig" :dataset="verticalDataset" @selectLegend="selectVerticalLegend"/>
      <VerticalTest ref="verticaltest" v-if="showLocalTest" :config="verticalConfig" :dataset="verticalDataset"/>
    </div>
    <div style="max-width:1000px; margin:0 auto; margin-bottom: 48px;">
      <VueUiOnion ref="oniontest" v-if="!showLocalTest" :dataset="onionDataset" @selectLegend="selectOnionLegend"/>
      <OnionTest ref="oniontest" v-if="showLocalTest" :dataset="onionDataset"  @selectLegend="selectOnionLegend"/>
    </div>
    <div style="max-width:1000px; margin:0 auto; margin-bottom: 48px;">
      <VueUiChestnut ref="chestnuttest" v-if="!showLocalTest" :dataset="chestnutDataset" :config="chestnutConfig" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut"/>
      <ChestnutTest ref="chestnuttest" v-if="showLocalTest" :dataset="chestnutDataset" @selectRoot="selectRoot" @selectBranch="selectBranch" @selectNut="selectNut"/>
    </div>
    <div style="max-width:1000px; margin:0 auto">
      <VueUiXy ref="xytest" :config="config" :dataset="dataset2" v-if="!showLocalTest" @selectLegend="selectLegendXY" @selectX="selectX"/>
      <XyTest ref="xytest" :config="config" :dataset="dataset2" v-if="showLocalTest" @selectLegend="selectLegendXY" @selectX="selectX"/>
    </div>
    <div style="max-width:1000px; margin:0 auto; margin-bottom: 48px;">
      <VueUiGauge ref="gaugetest" v-if="!showLocalTest" :dataset="gaugeDataset" :config="gaugeConfig"/>
      <GaugeTest ref="gaugetest" v-if="showLocalTest" :dataset="gaugeDataset"/>
    </div>
    <div style="max-width:1000px; margin:0 auto; margin-bottom: 48px;">
      <VueUiQuadrant ref="quadranttest" v-if="!showLocalTest" :dataset="quadrantDataset" :config="quadrantConfig" @selectPlot="selectPlot" @selectSide="selectSide" @selectLegend="selectQuadrantLegend"/>
      <QuadrantTest ref="quadranttest" v-if="showLocalTest" :dataset="quadrantDataset" @selectPlot="selectPlot" @selectSide="selectSide" @selectLegend="selectQuadrantLegend"/>
    </div>
    <div style="max-width:1000px; margin:0 auto; margin-bottom: 48px;">
      <VueUiRadar ref="radartest" v-if="!showLocalTest" :dataset="radarDataset" :config="radarConfig" @selectLegend="selectRadarLegend"/>
      <RadarTest ref="radartest" v-if="showLocalTest" :dataset="radarDataset"  @selectLegend="selectRadarLegend"/>
    </div>
    <div style="max-width:1000px; margin:0 auto; margin-bottom: 48px;">
      <VueUiWaffle ref="waffletest" v-if="!showLocalTest" :dataset="donutDataset" :config="waffleConfig" @selectLegend="selectLegendWaffle"/>
      <WaffleTest ref="waffletest" v-if="showLocalTest" :dataset="donutDataset" @selectLegend="selectLegendWaffle"/>
    </div> 
    <div style="display:flex; flex-direction:row; gap:12px;align-items:center">
      <VueUiDonut ref="donuttest" v-if="!showLocalTest" :dataset="donutDataset" :config="donutConfig" @selectLegend="selectLegendDonut"/>
      <DonutTest ref="donuttest" v-if="showLocalTest" :dataset="donutDataset" @selectLegend="selectLegendDonut"/>
    </div> 

    <VueUiTable :dataset="tableTestDataset" :config="darkConfig" v-if="!showLocalTest"/>
    <TableTest :dataset="tableTestDataset" v-if="showLocalTest"/>
  </div>
</template>

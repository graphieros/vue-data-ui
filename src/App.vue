<script setup>
import { ref, computed } from "vue";
import TableTest from "./components/vue-ui-table.vue";
import DonutTest from "./components/vue-ui-donut.vue";
import XyTest from "./components/vue-ui-xy.vue"
import WaffleTest from "./components/vue-ui-waffle.vue";
import RadarTest from "./components/vue-ui-radar.vue";

const dataset = ref([
        {
          name: "Series 1",
          series: [ -55.454, -34, -21, -13, -8, -5, -3, -2, -1, -1, 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55],
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
          type: "line"
        },
        {
          name: "Series 4",
          series: [0, 1, 2, 3, 5, null, 13, 21, 34, 55,],
          type: "line"
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
          type: "line"
        },
        {
          name: "Series 4",
          series: [0, 1, 2, 3, 5, null, 13, 21, 34, 55,],
          type: "line"
        },
      ]);

      const config = ref({
        chart: {
          color: "red",
          background: "white",
          tooltip: {
            roundingPercentage: 0,
            backgroundColor: "red",
            color: "white",
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
        }
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
    maxHeight: 700,
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
            backgroundColor: "#000000",
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
      name: "category 1"
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


const showLocalTest = ref(false);

// IDEAS:
// . treeselector (with sums & avgs & so on)
// . radar chart

</script>

<template>
  <div>
    <!-- <div style="max-width:1000px; margin:0 auto">
      <DonutTest v-if="showLocalTest" :dataset="donutDataset" :config="donutConfig"/>
    </div> -->
    <div style="max-width:1000px; margin:0 auto; margin-bottom: 48px;">
      <VueUiRadar v-if="!showLocalTest" :dataset="radarDataset" :config="radarConfig"/>
      <RadarTest v-if="showLocalTest" :dataset="radarDataset" :config="radarConfig"/>
    </div>
    <div style="max-width:1000px; margin:0 auto; margin-bottom: 48px;">
      <WaffleTest v-if="showLocalTest" :dataset="donutDataset" :config="waffleConfig"/>
      <VueUiWaffle v-if="!showLocalTest" :dataset="donutDataset" :config="waffleConfig"/>
    </div>
    <div style="display:flex; flex-direction:row; gap:12px;align-items:center">
      <VueUiDonut v-if="!showLocalTest" :dataset="donutDataset" :config="donutConfig"/>
      <DonutTest v-if="showLocalTest" :dataset="donutDataset" :config="donutConfig"/>
      <XyTest :config="config"  :dataset="dataset" v-if="showLocalTest"/>
    </div>
    <div style="max-width:1000px; margin:0 auto">
      <XyTest :config="config" :dataset="dataset" v-if="showLocalTest"/>
      <VueUiXy :config="config" :dataset="dataset" v-if="!showLocalTest"/>
    </div>
    <TableTest :dataset="tableTestDataset" :config="darkConfig" v-if="showLocalTest"/>
    <VueUiTable :dataset="tableTestDataset" :config="tableConfig" v-if="!showLocalTest"/>
  </div>
</template>

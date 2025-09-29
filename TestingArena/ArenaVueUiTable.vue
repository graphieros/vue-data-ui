<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiTable from '../src/components/vue-ui-table.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiTable } from "vue-data-ui";
import { VueUiTable as VueUiTableTreeshaken } from "vue-data-ui/vue-ui-table";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

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
    name: "date2",
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

function makeBody(n) {
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

    for (let i = 0; i < n; i += 1) {
      const itemName = getRandomItemName();
      const category = getRandomCategory();
      let accueil = Math.random() * 100;
      const date = getRandomDate();
      const date2 = getRandomDate();
      const data = [
        itemName,
        category,
        date,
        date2,
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
}

const body = ref(makeBody(100))

const dataset = ref( {
        header: head.value,
        body: body.value,
    })

onMounted(() => {
    setTimeout(() => {
        dataset.value.body = makeBody(500)
    }, 3000)
})

const config = ref({
  style: {
    title: {
      text: 'Some title that can be long',
      color: '#FF0000',
      fontSize: 18,
      bold: false,
      textAlign: 'left',
      paddingLeft: 12,
      paddingRight: 0,
      backgroundColor: '#00FF00',
      subtitle: {
        text: 'Some subtitle',
        fontSize: 12,
        color: '#0000FF',
        bold: true,
      }
    },
    exportMenu: {
      show: true,
    }
  }
})

function pageChange(data) {
  console.log(data)
}

const table = ref(null);

function nav(dir) {
  if (table.value) {
    table.value.navigate(dir)
  }
}

onMounted(() => {
  if (table.value) {
    console.log(table.value.getCurrentPageData())
  }
})

</script>

<template>
  <button @click="nav('previous')">PREV</button>
  <button @click="nav('next')">NEXT</button>
    <div style="background: white">
        <LocalVueUiTable ref="table" :dataset="dataset" :config="config" @page-change="pageChange"/>
        <LocalVueDataUi component="VueUiTable" :dataset="dataset" :config="config"/>
        <VueUiTable :dataset="dataset" :config="config"/>
        <VueUiTableTreeshaken :dataset="dataset" :config="config"/>
        <VueDataUi component="VueUiTable" :dataset="dataset" :config="config"/>
    </div>
</template>
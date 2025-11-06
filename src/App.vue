<script setup>
import { markRaw, ref, computed } from "vue";
import TestingArena from "./TestingArena.vue";
import ArenaVueUiXy from "../TestingArena/ArenaVueUiXy.vue";
import ArenaVueUiDonut from "../TestingArena/ArenaVueUiDonut.vue";
import ArenaVueUiTreemap from "../TestingArena/ArenaVueUiTreemap.vue";
import ArenaVueUiWaffle from "../TestingArena/ArenaVueUiWaffle.vue";
import ArenaVueUiRadar from "../TestingArena/ArenaVueUiRadar.vue";
import ArenaVueUiQuadrant from "../TestingArena/ArenaVueUiQuadrant.vue";
import ArenaVueUiGauge from "../TestingArena/ArenaVueUiGauge.vue";
import ArenaVueUiWheel from "../TestingArena/ArenaVueUiWheel.vue";
import ArenaVueUiTiremarks from "../TestingArena/ArenaVueUiTiremarks.vue";
import ArenaVueUiChestnut from "../TestingArena/ArenaVueUiChestnut.vue";
import ArenaVueUiOnion from "../TestingArena/ArenaVueUiOnion.vue";
import ArenaVueUiVerticalBar from "../TestingArena/ArenaVueUiVerticalBar.vue";
import ArenaVueUiHeatmap from "../TestingArena/ArenaVueUiHeatmap.vue";
import ArenaVueUiScatter from "../TestingArena/ArenaVueUiScatter.vue";
import ArenaVueUiCandlestick from "../TestingArena/ArenaVueUiCandlestick.vue";
import ArenaVueUiSparkline from "../TestingArena/ArenaVueUiSparkline.vue";
import ArenaVueUiSparkbar from "../TestingArena/ArenaVueUiSparkbar.vue";
import ArenaVueUiSparkStackbar from "../TestingArena/ArenaVueUiSparkStackbar.vue";
import ArenaVueUiSparkHistogram from "../TestingArena/ArenaVueUiSparkHistogram.vue";
import ArenaVueUiSparkGauge from "../TestingArena/ArenaVueUiSparkGauge.vue";
import ArenaVueUiSparkTrend from "../TestingArena/ArenaVueUiSparkTrend.vue";
import ArenaVueUiQuickChart from "../TestingArena/ArenaVueUiQuickChart.vue";
import ArenaVueUiAgePyramid from "../TestingArena/ArenaVueUiAgePyramid.vue";
import ArenaVueUiRelationCircle from "../TestingArena/ArenaVueUiRelationCircle.vue";
import ArenaVueUiThermometer from "../TestingArena/ArenaVueUiThermometer.vue";
import ArenaVueUiRings from "../TestingArena/ArenaVueUiRings.vue";
import ArenaVueUiDonutEvolution from "../TestingArena/ArenaVueUiDonutEvolution.vue";
import ArenaVueUiIcon from "../TestingArena/ArenaVueUiIcon.vue";
import ArenaVueUiMoodRadar from "../TestingArena/ArenaVueUiMoodRadar.vue";
import ArenaVueUiMolecule from "../TestingArena/ArenaVueUiMolecule.vue";
import ArenaVueUiNestedDonuts from "../TestingArena/ArenaVueUiNestedDonuts.vue";
import ArenaVueUiGalaxy from "../TestingArena/ArenaVueUiGalaxy.vue";
import ArenaVueUiStripPlot from "../TestingArena/ArenaVueUiStripPlot.vue";
import ArenaVueUiDumbbell from "../TestingArena/ArenaVueUiDumbbell.vue";
import ArenaVueUi3dBar from "../TestingArena/ArenaVueUi3dBar.vue";
import ArenaVueUiTableSparkline from "../TestingArena/ArenaVueUiTableSparkline.vue";
import ArenaVueUiTableHeatmap from "../TestingArena/ArenaVueUiTableHeatmap.vue";
import ArenaVueUiWordCloud from "../TestingArena/ArenaVueUiWordCloud.vue";
import ArenaVueUiXyCanvas from "../TestingArena/ArenaVueUiXyCanvas.vue";
import ArenaVueUiFlow from "../TestingArena/ArenaVueUiFlow.vue";
import ArenaVueUiParallelCoordinatePlot from "../TestingArena/ArenaVueUiParallelCoordinatePlot.vue";
import ArenaVueUiTimer from "../TestingArena/ArenaVueUiTimer.vue";
import ArenaVueUiCarouselTable from "../TestingArena/ArenaVueUiCarouselTable.vue";
import ArenaVueUiGizmo from "../TestingArena/ArenaVueUiGizmo.vue";
import ArenaVueUiKpi from "../TestingArena/ArenaVueUiKpi.vue";
import ArenaVueUiStackbar from "../TestingArena/ArenaVueUiStackbar.vue";
import ArenaVueUiRating from "../TestingArena/ArenaVueUiRating.vue";
import ArenaVueUiSmiley from "../TestingArena/ArenaVueUiSmiley.vue";
import ArenaVueUiBullet from "../TestingArena/ArenaVueUiBullet.vue";
import ArenaVueUiFunnel from "../TestingArena/ArenaVueUiFunnel.vue";
import ArenaVueUiHistoryPlot from "../TestingArena/ArenaVueUiHistoryPlot.vue";
import ArenaVueUiCirclePack from "../TestingArena/ArenaVueUiCirclePack.vue";
import ArenaVueUiWorld from "../TestingArena/ArenaVueUiWorld.vue";
import ArenaVueUiTable from "../TestingArena/ArenaVueUiTable.vue";
import ArenaVueUiRidgeline from "../TestingArena/ArenaVueUiRidgeline.vue";
import ArenaVueUiChord from "../TestingArena/ArenaVueUiChord.vue"
import ArenaVueUiDashboard from "../TestingArena/ArenaVueUiDashboard.vue";
import ArenaVueUiAnnotator from "../TestingArena/ArenaVueUiAnnotator.vue";
import ArenaVueUiStackline from "../TestingArena/ArenaVueUiStackline.vue";

  /**
   * TODO: migrate manual testing for the following:
   * - VueUiDashboard
   * - VueUiCursor
   */

const mapping = ref({
  VueUiStackline: markRaw(ArenaVueUiStackline),
  VueUiXy: markRaw(ArenaVueUiXy), 
  VueUiDonut: markRaw(ArenaVueUiDonut),
  VueUiTreemap: markRaw(ArenaVueUiTreemap),
  VueUiWaffle: markRaw(ArenaVueUiWaffle),
  VueUiRadar: markRaw(ArenaVueUiRadar),
  VueUiQuadrant: markRaw(ArenaVueUiQuadrant),
  VueUiGauge: markRaw(ArenaVueUiGauge),
  VueUiWheel: markRaw(ArenaVueUiWheel),
  VueUiTiremarks: markRaw(ArenaVueUiTiremarks), 
  VueUiChestnut: markRaw(ArenaVueUiChestnut),
  VueUiOnion: markRaw(ArenaVueUiOnion),
  VueUiVerticalBar: markRaw(ArenaVueUiVerticalBar),
  VueUiHeatmap: markRaw(ArenaVueUiHeatmap),
  VueUiScatter: markRaw(ArenaVueUiScatter),
  VueUiCandlestick: markRaw(ArenaVueUiCandlestick),
  VueUiSparkline: markRaw(ArenaVueUiSparkline),
  VueUiSparkbar: markRaw(ArenaVueUiSparkbar), 
  VueUiSparkStackbar: markRaw(ArenaVueUiSparkStackbar),  
  VueUiSparkHistogram: markRaw(ArenaVueUiSparkHistogram),  
  VueUiSparkgauge: markRaw(ArenaVueUiSparkGauge),  
  VueUiSparkTrend: markRaw(ArenaVueUiSparkTrend),  
  VueUiQuickChart: markRaw(ArenaVueUiQuickChart), 
  VueUiAgePyramid: markRaw(ArenaVueUiAgePyramid), 
  VueUiRelationCircle: markRaw(ArenaVueUiRelationCircle), 
  VueUiThermometer: markRaw(ArenaVueUiThermometer),  
  VueUiRings: markRaw(ArenaVueUiRings), 
  VueUiDonutEvolution: markRaw(ArenaVueUiDonutEvolution),
  VueUiIcon: markRaw(ArenaVueUiIcon),
  VueUiMoodRadar: markRaw(ArenaVueUiMoodRadar),  
  VueUiMolecule: markRaw(ArenaVueUiMolecule),  
  VueUiNestedDonuts: markRaw(ArenaVueUiNestedDonuts), 
  VueUiGalaxy: markRaw(ArenaVueUiGalaxy),  
  VueUiStripPlot: markRaw(ArenaVueUiStripPlot),  
  VueUiDumbbell: markRaw(ArenaVueUiDumbbell),
  VueUi3dBar: markRaw(ArenaVueUi3dBar),  
  VueUiTableSparkline: markRaw(ArenaVueUiTableSparkline), 
  VueUiTableHeatmap: markRaw(ArenaVueUiTableHeatmap),  
  VueUiWordCloud: markRaw(ArenaVueUiWordCloud), 
  VueUiXyCanvas: markRaw(ArenaVueUiXyCanvas), 
  VueUiFlow: markRaw(ArenaVueUiFlow),  
  VueUiParallelCoordinatePlot: markRaw(ArenaVueUiParallelCoordinatePlot), 
  VueUiTimer: markRaw(ArenaVueUiTimer), 
  VueUiCarouselTable: markRaw(ArenaVueUiCarouselTable), 
  VueUiGizmo: markRaw(ArenaVueUiGizmo),  
  VueUiKpi: markRaw(ArenaVueUiKpi),  
  VueUiStackbar: markRaw(ArenaVueUiStackbar), 
  VueUiRating: markRaw(ArenaVueUiRating), 
  VueUiSmiley: markRaw(ArenaVueUiSmiley), 
  VueUiBullet: markRaw(ArenaVueUiBullet),  
  VueUiFunnel: markRaw(ArenaVueUiFunnel), 
  VueUiHistoryPlot: markRaw(ArenaVueUiHistoryPlot), 
  VueUiCirclePack: markRaw(ArenaVueUiCirclePack), 
  VueUiWorld: markRaw(ArenaVueUiWorld),  
  VueUiTable: markRaw(ArenaVueUiTable), 
  VueUiRidgeline: markRaw(ArenaVueUiRidgeline), 
  VueUiChord: markRaw(ArenaVueUiChord), 
  VueUiDashboard: markRaw(ArenaVueUiDashboard),
  VueUiAnnotator: markRaw(ArenaVueUiAnnotator)
})

const options = computed(() => Object.keys(mapping.value));
const selectedComponent = ref('VueUiStackline');

/**
 * Legacy testing arena where some non chart components can be tested
 */
const showOldArena = ref(false);

</script>

<template>
  <div>
    <select v-model="selectedComponent">
      <option v-for="c in options">
        {{ c }}
      </option>
    </select>
  </div>

  <TestingArena v-if="showOldArena"/>

  <component :is="mapping[selectedComponent]"/>

</template>
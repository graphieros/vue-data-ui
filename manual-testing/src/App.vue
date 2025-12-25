<script setup>
import { ref, computed } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
//@ts-ignore
import BaseIcon from "../../src/atoms/BaseIcon.vue"
import "../../src/vue-data-ui.css"
import CURRENT_PACKAGE from "../../package.json"

const components = [
  { name: 'ArenaVueUi3dBar', icon: 'chart3dBar'},  
  { name: 'ArenaVueUiAgePyramid', icon: 'chartAgePyramid'}, 
  { name: 'ArenaVueUiBullet', icon: 'chartBullet'},  
  { name: 'ArenaVueUiCandlestick', icon : 'chartCandlestick'},
  { name: 'ArenaVueUiCarouselTable', icon: 'carouselTable'}, 
  { name: 'ArenaVueUiChestnut', icon: 'chartChestnut'},
  { name: 'ArenaVueUiChord', icon: 'chartChord'}, 
  { name: 'ArenaVueUiCirclePack', icon: 'chartCirclePack'}, 
  { name: 'ArenaVueUiDashboard', icon: 'dashboard'},
  { name: 'ArenaVueUiDonut', icon: 'chartDonut'},
  { name: 'ArenaVueUiDonutEvolution', icon: 'chartDonutEvolution'},
  { name: 'ArenaVueUiDumbbell', icon: 'chartDumbbell'},
  { name: 'ArenaVueUiFlow', icon: 'chartFlow'},  
  { name: 'ArenaVueUiFunnel', icon: 'chartFunnel'}, 
  { name: 'ArenaVueUiGalaxy', icon: 'chartGalaxy'},  
  { name: 'ArenaVueUiGauge', icon: 'chartGauge'},
  { name: 'ArenaVueUiGizmo', icon: 'battery'},  
  { name: 'ArenaVueUiHeatmap', icon: 'chartHeatmap'},
  { name: 'ArenaVueUiHistoryPlot', icon: 'chartHistoryPlot'}, 
  { name: 'ArenaVueUiHorizontalBar', icon: 'chartVerticalBar'},
  { name: 'ArenaVueUiIcon', icon: 'icons'},
  { name: 'ArenaVueUiKpi', icon: 'kpiBox'},  
  { name: 'ArenaVueUiMolecule', icon: 'chartCluster'},  
  { name: 'ArenaVueUiMoodRadar', icon: 'chartMoodRadar'},  
  { name: 'ArenaVueUiNestedDonuts', icon: 'chartNestedDonuts'}, 
  { name: 'ArenaVueUiOnion', icon: 'chartOnion'},
  { name: 'ArenaVueUiParallelCoordinatePlot', icon: 'chartParallelCoordinatePlot'}, 
  { name: 'ArenaVueUiQuadrant', icon: 'chartQuadrant'},
  { name: 'ArenaVueUiQuickChart', icon: 'vueDataUi'}, 
  { name: 'ArenaVueUiRadar', icon: 'chartRadar'},
  { name: 'ArenaVueUiRating', icon: 'star'}, 
  { name: 'ArenaVueUiRelationCircle', icon: 'chartRelationCircle'}, 
  { name: 'ArenaVueUiRidgeline', icon: 'chartRidgeline'}, 
  { name: 'ArenaVueUiRings', icon: 'chartRings'}, 
  { name: 'ArenaVueUiScatter', icon: 'chartScatter'},
  { name: 'ArenaVueUiSmiley', icon: 'smiley'}, 
  { name: 'ArenaVueUiSparkGauge', icon: 'chartGauge'},  
  { name: 'ArenaVueUiSparkHistogram', icon: 'chartSparkHistogram'},  
  { name: 'ArenaVueUiSparkStackbar', icon: 'chartSparkStackbar'},  
  { name: 'ArenaVueUiSparkTrend', icon: 'trend'},  
  { name: 'ArenaVueUiSparkbar', icon: 'chartSparkbar'}, 
  { name: 'ArenaVueUiSparkline', icon: 'chartSparkline'},
  { name: 'ArenaVueUiStackbar', icon: 'chartStackbar'}, 
  { name: 'ArenaVueUiStackline', icon: 'chartStackline'},
  { name: 'ArenaVueUiStripPlot', icon: 'chartStripPlot'},  
  { name: 'ArenaVueUiTable', icon: 'chartTable'}, 
  { name: 'ArenaVueUiTableHeatmap', icon: 'chartTable'},  
  { name: 'ArenaVueUiTableSparkline', icon: 'chartTableSparkline'}, 
  { name: 'ArenaVueUiThermometer', icon: 'chartThermometer'},  
  { name: 'ArenaVueUiTimer', icon: 'lap'}, 
  { name: 'ArenaVueUiTiremarks', icon: 'chartTiremarks'}, 
  { name: 'ArenaVueUiTreemap', icon: 'chartTreemap'},
  { name: 'ArenaVueUiWaffle', icon: 'chartWaffle'},
  { name: 'ArenaVueUiWheel', icon: 'chartWheel'},
  { name: 'ArenaVueUiWordCloud', icon: 'chartWordCloud'}, 
  { name: 'ArenaVueUiWorld', icon: 'world'},  
  { name: 'ArenaVueUiXy', icon: 'chartLine'}, 
  { name: 'ArenaVueUiXyCanvas', icon: 'chartLine'}, 
  { name: 'ArenaVueUiAnnotator', icon: 'annotator'},
  { name: 'ArenaVueUiCursor', icon: 'cursor'},
  { name: 'ArenaVueUiDigits', icon: 'digit8'},
  { name: 'ArenaVueUiDag', icon: 'chartDag' },
  { name: 'ArenaVueUiGeo', icon: 'chartGeo' },
].map(componentItem => ({
  path: `/${componentItem.name}`,
  name: componentItem.name.replace('Arena', ''),
  icon: componentItem.icon
}))

const searchText = ref('')

const filteredComponents = computed(() => {
  const term = searchText.value.trim().toLowerCase()
  if (!term) {
    return components
  }
  return components.filter(componentItem =>
    componentItem.name.toLowerCase().includes(term)
  )
})
</script>

<template>
  <header>
    <div class="wrapper">
      <nav>
        <div class="sticked">
          <div class="nav-header">
            <div class="nav-logo">
              <img alt="Vue logo" src="@/assets/logo.png" width="48" />
              <span class="gradient-text" style="font-weight: bolder">Testing arena</span>
            </div>
            <code style="text-align:right; margin-top:-0.7rem;">vue-data-ui {{ CURRENT_PACKAGE.version }}</code>
  
            <div class="nav-search-wrapper">
              <input
                v-model="searchText"
                type="text"
                class="nav-search"
                placeholder="Search components"
              />
              <button @click="searchText = ''"><BaseIcon name="close"/> </button>
            </div>
  
            <div style="display:flex; margin-left: -1rem;">
              <RouterLink to="/">
                <div style="display:flex;align-items:center;gap:1rem; padding: 0 0.5rem">
                  <BaseIcon name="home" /> Home
                </div>
              </RouterLink>
            </div>
          </div>
        </div>

        <div style="padding: 0 1rem; margin: 1rem 0 2rem 0; width:100%; display: flex; flex-direction: column;">
          <RouterLink
            v-for="componentItem in filteredComponents"
            :key="componentItem.path"
            :to="componentItem.path"
          >
            <div class="nav-item">
              <div class="nav-icon">
                <BaseIcon :name="componentItem.icon" stroke="#8A8A8A" />
              </div>
              <span>
                {{ componentItem.name }}
              </span>
            </div>
          </RouterLink>
        </div>
      </nav>
    </div>
  </header>

  <main style="width: calc(100vw - 400px)">
    <RouterView />
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 0;
  position: fixed;
  top: 0;
  left: 0;
  width: 300px;
  height: 100vh;
  height: 100svh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  border-right: 1px solid #3A3A3A;
}

.sticked {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--color-background);
  padding: 1rem 2rem;
  border-bottom: 1px solid #3A3A3A;
}

.nav-logo {
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items:center;
  justify-content: space-between;
  font-size: 1.5rem;
}

.nav-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-search-wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.nav-search-wrapper button {
  display: flex;
  align-items:center;
  justify-content:center;
  background-color: #3A3A3A;
  border-radius: 0 0.3rem 0.3rem 0;
  border: none;
  padding: 0.2rem;
  cursor: pointer;
}
.nav-search-wrapper button:hover {
  background-color: #4A4A4A;
}

.nav-search {
  width: 100%;
  box-sizing: border-box;
  padding: 0.35rem 0.5rem;
  border-radius: 0.3rem 0 0 0.3rem;
  border: 1px solid var(--color-border);
  font-size: 0.85rem;
  background: #2A2A2A;
  color: #CCCCCC;
}

.nav-item {
  display:flex;
  flex-direction: row;
  gap: 1rem;
  align-items:center;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.nav-item:hover {
  background: #42d39230;
}

.nav-icon {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items:center;
}

nav a.router-link-exact-active {
  background: linear-gradient(90deg, #42d392, #5f8aee);
  background-size: 100% 100%;
  background-repeat: no-repeat;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  font-weight: 900 !important;
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

:deep(a.router-link-exact-active .nav-item .nav-icon path) {
  stroke: #42d392 !important;
}

:deep(a.router-link-exact-active .nav-item) {
  background: #FFFFFF10;
}

nav a {
  display: inline-block;
  padding: 0;
  font-size: 1rem;
}
</style>

import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { 
    VueUiXy, 
    VueUiTable, 
    VueUiDonut, 
    VueUiWaffle, 
    VueUiRadar, 
    VueUiQuadrant, 
    VueUiGauge,
    VueUiChestnut,
    VueUiOnion,
    VueUiVerticalBar,
    VueUiScreenshot
} from 'vue-data-ui';
import 'vue-data-ui/style.css';

const app = createApp(App);
app.component("VueUiXy", VueUiXy);
app.component("VueUiTable", VueUiTable);
app.component("VueUiDonut", VueUiDonut);
app.component("VueUiWaffle", VueUiWaffle);
app.component("VueUiRadar", VueUiRadar);
app.component("VueUiQuadrant", VueUiQuadrant);
app.component("VueUiGauge", VueUiGauge);
app.component("VueUiChestnut", VueUiChestnut);
app.component("VueUiOnion", VueUiOnion);
app.component("VueUiVerticalBar", VueUiVerticalBar);
app.component("VueUiScreenshot", VueUiScreenshot);
app.mount('#app');
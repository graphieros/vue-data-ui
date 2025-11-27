// TESTING ARENA
// Not destined to be built

import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import { 
    Arrow,
    VueUiAnnotator,
    VueUiDigits,
    VueUiDonut, 
    VueUiMiniLoader,
    VueUiSkeleton,
    VueUiAccordion,
    VueUiPattern,
    VueDataUi
} from 'vue-data-ui';
import 'vue-data-ui/style.css';

// import VueUiXy  from "vue-data-ui/vue-ui-xy";

const app = createApp(App)
app.use(router)

app.component("Arrow", Arrow);
app.component("VueDataUi", VueDataUi);
app.component("VueUiAnnotator", VueUiAnnotator);
app.component("VueUiDigits", VueUiDigits);
app.component("VueUiDonut", VueUiDonut);
app.component("VueUiMiniLoader", VueUiMiniLoader);
app.component("VueUiSkeleton", VueUiSkeleton);
app.component("VueUiAccordion", VueUiAccordion);
app.component('VueUiPattern', VueUiPattern);

app.mount('#app');
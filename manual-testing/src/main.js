// TESTING ARENA
// Not destined to be built

import { createApp } from 'vue';
import './assets/main.css';
import App from './App.vue';
import router from './router';
import {
    Arrow,
    VueUiAnnotator,
    VueUiDigits,
    VueUiDonut,
    VueUiMiniLoader,
    VueUiSkeleton,
    VueUiAccordion,
    VueUiPattern,
    VueUiHill,
    VueDataUi,
} from 'vue-data-ui';
import 'vue-data-ui/style.css';
// Arena files outside manual-testing resolve the root package's dist build.
// Include its matching scoped styles alongside the installed package's styles.
import '../../dist/style.css';

// import VueUiXy  from "vue-data-ui/vue-ui-xy";

const app = createApp(App);
app.use(router);

app.component('Arrow', Arrow);
app.component('VueDataUi', VueDataUi);
app.component('VueUiAnnotator', VueUiAnnotator);
app.component('VueUiDigits', VueUiDigits);
app.component('VueUiDonut', VueUiDonut);
app.component('VueUiMiniLoader', VueUiMiniLoader);
app.component('VueUiSkeleton', VueUiSkeleton);
app.component('VueUiAccordion', VueUiAccordion);
app.component('VueUiPattern', VueUiPattern);
app.component('VueUiHill', VueUiHill);

app.mount('#app');

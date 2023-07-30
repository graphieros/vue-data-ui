import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { VueUiXy, VueUiTable, VueUiDonut } from 'vue-data-ui';
import 'vue-data-ui/style.css';

const app = createApp(App);
app.component("VueUiXy", VueUiXy);
app.component("VueUiTable", VueUiTable);
app.component("VueUiDonut", VueUiDonut);
app.mount('#app');


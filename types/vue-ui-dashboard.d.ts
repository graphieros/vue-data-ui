import { DefineComponent } from 'vue';

export type {
    VueUiDashboardConfig,
    VueUiDashboardElement
} from "./vue-data-ui";

declare const VueUiDashboard: DefineComponent<{
    config?: VueUiDashboardConfig;
    dataset: VueUiDashboardElement[];
}>;

export default VueUiDashboard;
export { VueUiDashboard };
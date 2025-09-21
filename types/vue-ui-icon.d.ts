import { DefineComponent } from 'vue';

export type { 
    VueUiIconName
} from "./vue-data-ui";

declare const VueUiIcon: DefineComponent<{
    name: VueUiIconName;
    stroke?: string;
    strokeWidth?: number;
    size?: number | string;
    isSpin?: boolean;
}>;

export default VueUiIcon;
export { VueUiIcon };
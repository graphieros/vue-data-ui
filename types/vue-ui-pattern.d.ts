import { DefineComponent } from 'vue';

export type { 
    VueUiPatternName
} from "./vue-data-ui";

declare const VueUiPattern: DefineComponent<{
    name: VueUiPatternName;
    id: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    scale?: number;
}>;

export default VueUiPattern;
export { VueUiPattern };
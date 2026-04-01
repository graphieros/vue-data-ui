import { DefineComponent } from 'vue';

declare const VueUiPatternSeed: DefineComponent<{
    id: string;
    seed: string | number;
    foregroundColor?: string;
    backgroundColor?: string;
    maxSize?: number;
    minSize?: number;
    disambiguator?: string | number;
}>;

export default VueUiPatternSeed;
export { VueUiPatternSeed };

import { DefineComponent } from 'vue';

export type {
    VueUiBulletSegment,
    VueUiBulletDataset,
    VueUiBulletConfig,
    VueUiBulletExpose
} from "./vue-data-ui";

declare const VueUiBullet: DefineComponent<{
    config?: VueUiBulletConfig;
    dataset: VueUiBulletDataset;
}, VueUiBulletExpose>;

export default VueUiBullet;
export { VueUiBullet };
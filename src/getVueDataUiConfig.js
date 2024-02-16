import mainConfig from "./default_configs.json";

export default function getVueDataUiConfig(type) {
    return mainConfig[type]
}
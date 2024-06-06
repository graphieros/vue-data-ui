import themes from "./themes.json";

export default function getThemeConfig(type) {
    return themes[type]
}
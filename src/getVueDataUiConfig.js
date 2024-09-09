import { useConfig } from "./useConfig";

export default function getVueDataUiConfig(type) {
    return useConfig()[type]
}
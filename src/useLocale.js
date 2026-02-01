import { localeLoaders } from "./locales/loaders"

function normalizeLocale(locale) {
    return String(locale || "").toLowerCase()
}

function resolveLocaleKey(locale) {
    const normalized = normalizeLocale(locale)

    if (localeLoaders[normalized]) {
        return normalized
    }

    const base = normalized.split("-")[0]
    if (localeLoaders[base]) {
        return base
    }

    return "en"
}

export async function useLocale(locale) {
    const key = resolveLocaleKey(locale)
    const mod = await localeLoaders[key]()
    return { key, data: mod.default }
}

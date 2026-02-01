const modules = import.meta.glob("./data/*.js")

export const localeLoaders = Object.fromEntries(
    Object.entries(modules).map(([file, loader]) => {
        const key = file
        .replace("./data/", "")
        .replace(".js", "")
        .toLowerCase()

        return [key, loader]
    })
)

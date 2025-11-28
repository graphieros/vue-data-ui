import { ref } from "vue";

function getNestedConfigurationValue(configurationObject, path) {
    return path.split(".").reduce((currentValue, segment) => {
        if (
            currentValue === null ||
            currentValue === undefined ||
            typeof currentValue !== "object"
        ) {
            return undefined;
        }
        return currentValue[segment];
    }, configurationObject);
}

function createBaseControl(baseConfiguration, key, type, extra) {
    const baseDefault = getNestedConfigurationValue(baseConfiguration, key);
    const hasForcedDefault =
        extra && Object.prototype.hasOwnProperty.call(extra, "def");
    const finalDefault = hasForcedDefault ? extra.def : baseDefault;

    return {
        key,
        def: finalDefault,
        type,
        ...(extra || {})
    };
}

export function useConfigurationControls(baseConfiguration) {
    function CHECKBOX(key, extra) {
        return createBaseControl(baseConfiguration, key, "checkbox", extra || {});
    }

    function NUMBER(key, extra) {
        return createBaseControl(baseConfiguration, key, "number", extra || {});
    }

    function RANGE(key, extra) {
        return createBaseControl(baseConfiguration, key, "range", extra || {});
    }

    function TEXT(key, extra) {
        return createBaseControl(baseConfiguration, key, "text", extra || {});
    }

    function COLOR(key, extra) {
        return createBaseControl(baseConfiguration, key, "color", extra || {});
    }

    function SELECT(key, options, extra) {
        return createBaseControl(
            baseConfiguration,
            key,
            "select",
            { options, ...(extra || {}) }
        );
    }

    function createModel(controls) {
        return ref(controls);
    }

    return {
        CHECKBOX,
        NUMBER,
        RANGE,
        TEXT,
        COLOR,
        SELECT,
        createModel
    };
}

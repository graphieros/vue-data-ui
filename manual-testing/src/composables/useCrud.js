import { computed, ref } from "vue";
import { createUid } from "../../../src/lib";

export default function useCrud(baseUrlOverride) {
    const baseUrl = computed(() => baseUrlOverride ?? "/api/items");

    const items = ref([]);
    const selectedItem = ref(null);

    const isLoading = ref(false);
    const errorMessage = ref("");

    function clearError() {
        errorMessage.value = "";
    }

    async function requestJson(input, init) {
        const response = await fetch(input, init);

        if (!response.ok) {
            let details = "";
            try {
                const maybeJson = await response.json();
                details = typeof (maybeJson && maybeJson.error) === "string" ? ` - ${maybeJson.error}` : "";
            } catch {
                // ignore
            }
            throw new Error(`Request failed: ${response.status}${details}`);
        }

        return response.json();
    }

    async function readAll() {
        isLoading.value = true;
        clearError();

        try {
            const data = await requestJson(baseUrl.value);
            items.value = Array.isArray(data && data.items) ? data.items : [];
            return items.value;
        } catch (error) {
            errorMessage.value = String(error && error.message ? error.message : error);
            return [];
        } finally {
            isLoading.value = false;
        }
    }

    async function readOne(identifier) {
        isLoading.value = true;
        clearError();

        try {
            const url = `${baseUrl.value}/${encodeURIComponent(String(identifier))}`;
            const data = await requestJson(url);
            selectedItem.value = data && data.item ? data.item : null;
            return selectedItem.value;
        } catch (error) {
            errorMessage.value = String(error && error.message ? error.message : error);
            selectedItem.value = null;
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    async function createOne(payload) {
        isLoading.value = true;
        clearError();

        payload.id = createUid();
        payload.createdAt = Date.now();
        payload.updatedAt = Date.now();

        try {
            const data = await requestJson(baseUrl.value, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload ?? {}),
            });

            const created = data && data.item ? data.item : null;

            if (created) {
                items.value = [created].concat(items.value);
            }

            return created;
        } catch (error) {
            errorMessage.value = String(error && error.message ? error.message : error);
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    async function updateOne(identifier, patch) {
        isLoading.value = true;
        clearError();

        try {
            const url = `${baseUrl.value}/${encodeURIComponent(String(identifier))}`;
            const data = await requestJson(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(patch ?? {}),
            });

            const updated = data && data.item ? data.item : null;

            if (updated) {
                const index = items.value.findIndex((entry) => String(entry && entry.id) === String(identifier));
                if (index >= 0) {
                    const next = items.value.slice();
                    next[index] = updated;
                    items.value = next;
                }

                if (selectedItem.value && String(selectedItem.value.id) === String(identifier)) {
                    selectedItem.value = updated;
                }
            }

            return updated;
        } catch (error) {
            errorMessage.value = String(error && error.message ? error.message : error);
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteOne(identifier) {
        isLoading.value = true;
        clearError();

        try {
            const url = `${baseUrl.value}/${encodeURIComponent(String(identifier))}`;
            const data = await requestJson(url, { method: "DELETE" });

            items.value = items.value.filter((entry) => String(entry && entry.id) !== String(identifier));

            if (selectedItem.value && String(selectedItem.value.id) === String(identifier)) {
                selectedItem.value = null;
            }

            return data && data.deleted ? data.deleted : null;
        } catch (error) {
            errorMessage.value = String(error && error.message ? error.message : error);
            return null;
        } finally {
            isLoading.value = false;
        }
    }

    const toBeDone = computed(() => items.value.filter(item => !item.done));
    const done = computed(() => items.value.filter(item => item.done));

    return {
        baseUrl,
        items,
        toBeDone,
        done,
        selectedItem,
        isLoading,
        errorMessage,
        clearError,
        readAll,
        readOne,
        createOne,
        updateOne,
        deleteOne,
    };
}

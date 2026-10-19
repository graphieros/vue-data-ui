// Include direct connections and links between highlighted neighbors.
export function isHighlightedLink(link, id, related) {
    return id !== null && (
        link.source.id === id || link.target.id === id ||
        !!(related?.has(link.source.id) && related.has(link.target.id))
    );
}

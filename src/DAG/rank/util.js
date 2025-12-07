import { applyWithChunking } from "../util.js";

export default {
    longestPath,
    slack,
};

/*
 * Initializes ranks for the input graph using the longest path algorithm. This
 * algorithm scales well and is fast in practice, it yields rather poor
 * solutions. Nodes are pushed to the lowest layer possible, leaving the bottom
 * ranks wide and leaving edges longer than necessary. However, due to its
 * speed, this algorithm is good for getting an initial ranking that can be fed
 * into other algorithms.
 *
 * This algorithm does not normalize layers because it will be used by other
 * algorithms in most cases. If using this algorithm directly, be sure to
 * run normalize at the end.
 *
 * Pre-conditions:
 *
 *    1. Input graph is a DAG.
 *    2. Input graph node labels can be assigned properties.
 *
 * Post-conditions:
 *
 *    1. Each node will be assign an (unnormalized) "rank" property.
 */
export function longestPath(graph) {
    function dfs(nodeId) {
        const label = graph.node(nodeId);

        if (label && Object.prototype.hasOwnProperty.call(label, "rank")) {
            return label.rank;
        }

        const outgoingEdges = graph.outEdges(nodeId) || [];

        if (!outgoingEdges.length) {
            const rank = 0;
            if (label) {
                label.rank = rank;
            }
            return rank;
        }

        const outgoingEdgesMinimumLengths = outgoingEdges.map(edgeObject => {
            const headLabel = graph.node(edgeObject.w);

            if (!headLabel) {
                return Number.POSITIVE_INFINITY;
            }

            const headRank = dfs(edgeObject.w);
            const minimumLength = graph.edge(edgeObject).minlen;
            return headRank - minimumLength;
        });

        let rank = applyWithChunking(Math.min, outgoingEdgesMinimumLengths);

        if (rank === Number.POSITIVE_INFINITY) {
            rank = 0;
        }

        if (label) {
            label.rank = rank;
        }

        return rank;
    }

    (graph.sources() || []).forEach(dfs);
}

/*
 * Returns the amount of slack for the given edge.
 * Slack = actual length - minimum length.
 */
export function slack(graph, edgeObject) {
    return (
        graph.node(edgeObject.w).rank -
        graph.node(edgeObject.v).rank -
        graph.edge(edgeObject).minlen
    );
}

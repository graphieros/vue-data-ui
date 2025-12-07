import * as util from "../util.js";

/*
 * Assigns an initial order value for each node by performing a DFS search
 * starting from nodes in the first rank. Nodes are assigned an order in their
 * rank as they are first visited.
 *
 * This approach comes from Gansner, et al., "A Technique for Drawing Directed
 * Graphs."
 *
 * Returns a layering matrix with an array per layer and each layer sorted by
 * the order of its nodes.
 */

export default function initOrder(g) {
    const visited = {};
    const simpleNodes = g.nodes().filter(v => g.children(v).length === 0);
    const simpleNodesRanks = simpleNodes.map(v => g.node(v).rank);
    const maxRank = util.applyWithChunking(Math.max, simpleNodesRanks);
    const layers = util.range(maxRank + 1).map(() => []);

    function dfs(v) {
        if (visited[v]) return;
        visited[v] = true;

        const node = g.node(v);
        layers[node.rank].push(v);

        g.successors(v).forEach(dfs);
    }

    const orderedVs = simpleNodes.sort(
        (a, b) => g.node(a).rank - g.node(b).rank
    );

    orderedVs.forEach(dfs);
    return layers;
}

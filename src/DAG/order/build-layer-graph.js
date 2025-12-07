import Graph from "../graph.js";
import * as util from "../util.js";

/*
 * Constructs a graph that can be used to sort a layer of nodes. The graph will
 * contain all base and subgraph nodes from the request layer in their original
 * hierarchy and any edges that are incident on these nodes and are of the type
 * requested by the "relationship" parameter.
 *
 * Nodes from the requested rank that do not have parents are assigned a root
 * node in the output graph, which is set in the root graph attribute. This
 * makes it easy to walk the hierarchy of movable nodes during ordering.
 *
 * Pre-conditions:
 *
 *    1. Input graph is a DAG
 *    2. Base nodes in the input graph have a rank attribute
 *    3. Subgraph nodes in the input graph has minRank and maxRank attributes
 *    4. Edges have an assigned weight
 *    5. If `nodesWithRank` is not undefined, it must contains only the nodes
 *       which belong to `g` and belong to `rank`.
 *
 * Post-conditions:
 *
 *    1. Output graph has all nodes in the movable rank with preserved
 *       hierarchy.
 *    2. Root nodes in the movable layer are made children of the node
 *       indicated by the root attribute of the graph.
 *    3. Non-movable nodes incident on movable nodes, selected by the
 *       relationship parameter, are included in the graph (without hierarchy).
 *    4. Edges incident on movable nodes, selected by the relationship
 *       parameter, are added to the output graph.
 *    5. The weights for copied edges are aggregated as need, since the output
 *       graph is not a multi-graph.
 */

export default function buildLayerGraph(g, rank, relationship, nodesWithRank) {
    if (!nodesWithRank) {
        nodesWithRank = g.nodes();
    }

    const root = createRootNode(g);
    const result = new Graph({ compound: true })
        .setGraph({ root })
        .setDefaultNodeLabel(v => g.node(v));

    nodesWithRank.forEach(v => {
        const node = g.node(v);
        const parent = g.parent(v);

        const belongsToRank =
            node.rank === rank ||
            (node.minRank <= rank && rank <= node.maxRank);

        if (belongsToRank) {
            result.setNode(v);
            result.setParent(v, parent || root);

            // Copy incident edges of the requested type (inEdges or outEdges)
            g[relationship](v).forEach(e => {
                const u = e.v === v ? e.w : e.v;
                const existing = result.edge(u, v);
                const existingWeight = existing ? existing.weight : 0;

                result.setEdge(u, v, {
                    weight: g.edge(e).weight + existingWeight
                });
            });

            if (Object.hasOwn(node, "minRank")) {
                result.setNode(v, {
                    borderLeft: node.borderLeft[rank],
                    borderRight: node.borderRight[rank]
                });
            }
        }
    });

    return result;
}

function createRootNode(g) {
    let id;
    while (g.hasNode((id = util.uniqueId("_root"))));
    return id;
}

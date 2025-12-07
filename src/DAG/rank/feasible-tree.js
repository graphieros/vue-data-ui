import Graph from "../graph.js";
import { slack as calculateSlack } from "./util.js";

/*
 * Constructs a spanning tree with tight edges and adjusted the input node's
 * ranks to achieve this. A tight edge is one that is has a length that matches
 * its "minlen" attribute.
 *
 * The basic structure for this function is derived from Gansner, et al., "A
 * Technique for Drawing Directed Graphs."
 *
 * Pre-conditions:
 *
 *    1. Graph must be a DAG.
 *    2. Graph must be connected.
 *    3. Graph must have at least one node.
 *    5. Graph nodes must have been previously assigned a "rank" property that
 *       respects the "minlen" property of incident edges.
 *    6. Graph edges must have a "minlen" property.
 *
 * Post-conditions:
 *
 *    - Graph nodes will have their rank adjusted to ensure that all edges are
 *      tight.
 *
 * Returns a tree (undirected graph) that is constructed using only "tight"
 * edges.
 */
export default function feasibleTree(graph) {
    // Ensure every node has an initial rank.
    initializeRanks(graph);

    const tree = new Graph();

    graph.nodes().forEach(nodeId => {
        tree.setNode(nodeId, {});
    });

    // Start from an arbitrary root.
    const nodes = graph.nodes();
    if (!nodes.length) {
        return tree;
    }

    const rootId = nodes[0];
    const inTree = new Set([rootId]);

    // Grow the tree until every node is included.
    while (inTree.size < nodes.length) {
        const bestEdge = findBestTighteningEdge(graph, inTree);

        if (!bestEdge) {
            // No more edges that connect inside to outside; choose any remaining node.
            const remainingNodeId = nodes.find(nodeId => !inTree.has(nodeId));
            inTree.add(remainingNodeId);
            tree.setNode(remainingNodeId, {});
            continue;
        }

        const { edgeObject, delta, attachFrom, attachTo } = bestEdge;

        // Adjust ranks on the appropriate side to make the edge tight.
        shiftRanksSubgraph(graph, inTree, attachFrom, delta);

        // Add edge to the tree.
        tree.setEdge(edgeObject.v, edgeObject.w, {});

        inTree.add(attachTo);
    }

    return tree;
}

function initializeRanks(graph) {
    graph.nodes().forEach(nodeId => {
        const label = graph.node(nodeId) || {};
        if (!Object.prototype.hasOwnProperty.call(label, "rank")) {
            label.rank = 0;
            graph.setNode(nodeId, label);
        }
    });
}

/*
 * Find an edge that connects a node inside the current tree to a node outside,
 * and compute how much we need to shift ranks to make it tight.
 */
function findBestTighteningEdge(graph, inTree) {
    let best = null;

    graph.edges().forEach(edgeObject => {
        const tailInTree = inTree.has(edgeObject.v);
        const headInTree = inTree.has(edgeObject.w);

        if (tailInTree === headInTree) {
            return;
        }

        const edgeSlack = calculateSlack(graph, edgeObject);

        // If already tight, prefer it directly.
        // Otherwise, we can tighten by shifting ranks.
        const absoluteSlack = Math.abs(edgeSlack);

        if (!best || absoluteSlack < best.absoluteSlack) {
            const attachFrom = tailInTree ? edgeObject.v : edgeObject.w;
            const attachTo = tailInTree ? edgeObject.w : edgeObject.v;

            // delta is how much to shift the outside side to make this edge tight.
            const delta = tailInTree ? edgeSlack : -edgeSlack;

            best = {
                edgeObject,
                delta,
                attachFrom,
                attachTo,
                absoluteSlack,
            };
        }
    });

    return best;
}

/*
 * Shift ranks on the component that does NOT currently contain all inTree nodes.
 * For simplicity, this implementation shifts every node that is NOT inTree,
 * which is sufficient to make the chosen edge tight.
 */
function shiftRanksSubgraph(graph, inTree, anchorNodeId, delta) {
    if (!delta) {
        return;
    }

    graph.nodes().forEach(nodeId => {
        if (!inTree.has(nodeId)) {
            const nodeLabel = graph.node(nodeId);
            nodeLabel.rank += delta;
        }
    });
}

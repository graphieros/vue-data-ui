import { zipObject } from "../util.js";

/*
 * A function that takes a layering (an array of layers, each with an array of
 * ordererd nodes) and a graph and returns a weighted crossing count.
 *
 * Pre-conditions:
 *
 *    1. Input graph must be simple (not a multigraph), directed, and include
 *       only simple edges.
 *    2. Edges in the input graph must have assigned weights.
 *
 * Post-conditions:
 *
 *    1. The graph and layering matrix are left unchanged.
 *
 * This algorithm is derived from Barth, et al., "Bilayer Cross Counting."
 */

export default function crossCount(g, layering) {
    let cc = 0;
    for (let i = 1; i < layering.length; ++i) {
        cc += twoLayerCrossCount(g, layering[i - 1], layering[i]);
    }
    return cc;
}

function twoLayerCrossCount(g, northLayer, southLayer) {
    // Map nodes in the south layer to their indices
    const southPos = zipObject(
        southLayer,
        southLayer.map((v, i) => i)
    );

    // Sort edges between north and south by (northPos, southPos)
    const southEntries = northLayer.flatMap((v) => {
        return g
            .outEdges(v)
            .map((e) => ({
                pos: southPos[e.w],
                weight: g.edge(e).weight,
            }))
            .sort((a, b) => a.pos - b.pos);
    });

    // Build accumulator tree
    let firstIndex = 1;
    while (firstIndex < southLayer.length) firstIndex <<= 1;
    const treeSize = 2 * firstIndex - 1;
    firstIndex -= 1;

    const tree = new Array(treeSize).fill(0);

    // Compute weighted crossings
    let cc = 0;
    southEntries.forEach((entry) => {
        let index = entry.pos + firstIndex;

        tree[index] += entry.weight;
        let weightSum = 0;

        while (index > 0) {
            if (index % 2) {
                weightSum += tree[index + 1];
            }

            index = (index - 1) >> 1;
            tree[index] += entry.weight;
        }

        cc += entry.weight * weightSum;
    });

    return cc;
}

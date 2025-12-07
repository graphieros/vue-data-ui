import initOrder from "./init-order.js";
import crossCount from "./cross-count.js";
import sortSubgraph from "./sort-subgraph.js";
import buildLayerGraph from "./build-layer-graph.js";
import addSubgraphConstraints from "./add-subgraph-constraints.js";
import Graph from "../graph.js";
import * as util from "../util.js";

/*
 * Applies heuristics to minimize edge crossings in the graph and sets the best
 * order solution as an order attribute on each node.
 *
 * Pre-conditions:
 *
 *    1. Graph must be DAG
 *    2. Graph nodes must be objects with a "rank" attribute
 *    3. Graph edges must have the "weight" attribute
 *
 * Post-conditions:
 *
 *    1. Graph nodes will have an "order" attribute based on the results of the
 *       algorithm.
 */

export default function order(g, opts = {}) {
    if (typeof opts.customOrder === "function") {
        opts.customOrder(g, order);
        return;
    }

    const maxRank = util.maxRank(g);

    const downLayerGraphs = buildLayerGraphs(
        g,
        util.range(1, maxRank + 1),
        "inEdges"
    );

    const upLayerGraphs = buildLayerGraphs(
        g,
        util.range(maxRank - 1, -1, -1),
        "outEdges"
    );

    let layering = initOrder(g);
    assignOrder(g, layering);

    if (opts.disableOptimalOrderHeuristic) {
        return;
    }

    let bestCrossCount = Number.POSITIVE_INFINITY;
    let bestLayering;
    const constraints = opts.constraints || [];

    for (let i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
        const sweepDown = i % 2 === 0 ? downLayerGraphs : upLayerGraphs;
        const biasRight = i % 4 >= 2;

        sweepLayerGraphs(sweepDown, biasRight, constraints);

        layering = util.buildLayerMatrix(g);
        const cc = crossCount(g, layering);

        if (cc < bestCrossCount) {
            bestCrossCount = cc;
            lastBest = 0;
            bestLayering = structuredClone(layering);
        } else if (cc === bestCrossCount) {
            bestLayering = structuredClone(layering);
        }
    }

    assignOrder(g, bestLayering);
}

function buildLayerGraphs(g, ranks, relationship) {
    const nodesByRank = new Map();

    function addNodeToRank(rank, v) {
        if (!nodesByRank.has(rank)) {
            nodesByRank.set(rank, []);
        }
        nodesByRank.get(rank).push(v);
    }

    // Precompute nodes by rank
    for (const v of g.nodes()) {
        const node = g.node(v);

        if (typeof node.rank === "number") {
            addNodeToRank(node.rank, v);
        }

        if (typeof node.minRank === "number" && typeof node.maxRank === "number") {
            for (let r = node.minRank; r <= node.maxRank; r++) {
                if (r !== node.rank) {
                    addNodeToRank(r, v);
                }
            }
        }
    }

    return ranks.map(rank =>
        buildLayerGraph(
            g,
            rank,
            relationship,
            nodesByRank.get(rank) || []
        )
    );
}

function sweepLayerGraphs(layerGraphs, biasRight, constraints) {
    const cg = new Graph();

    layerGraphs.forEach(lg => {
        constraints.forEach(c => cg.setEdge(c.left, c.right));

        const root = lg.graph().root;
        const sorted = sortSubgraph(lg, root, cg, biasRight);

        sorted.vs.forEach((v, i) => {
            lg.node(v).order = i;
        });

        addSubgraphConstraints(lg, cg, sorted.vs);
    });
}

function assignOrder(g, layering) {
    Object.values(layering).forEach(layer => {
        layer.forEach((v, i) => {
            g.node(v).order = i;
        });
    });
}

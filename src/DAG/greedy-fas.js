import Graph from "./graph.js";
import List from "./data/list.js";

/*
 * A greedy heuristic for finding a feedback arc set for a graph. A feedback
 * arc set is a set of edges that can be removed to make a graph acyclic.
 * The algorithm comes from: P. Eades, X. Lin, and W. F. Smyth, "A fast and
 * effective heuristic for the feedback arc set problem." This implementation
 * adjusts that from the paper to allow for weighted edges.
 */

const DEFAULT_WEIGHT_FUNCTION = () => 1;

export default function greedyFAS(graph, weightFunction) {
    if (graph.nodeCount() <= 1) {
        return [];
    }

    const state = buildState(graph, weightFunction || DEFAULT_WEIGHT_FUNCTION);
    const results = performGreedyFAS(state.graph, state.buckets, state.zeroIndex);

    // Expand multi-edges back into the original edge objects.
    return results.flatMap(edge => graph.outEdges(edge.v, edge.w));
}

function performGreedyFAS(graph, buckets, zeroIndex) {
    let results = [];

    const sources = buckets[buckets.length - 1];
    const sinks = buckets[0];

    let entry;

    while (graph.nodeCount()) {
        while ((entry = sinks.dequeue())) {
            removeNode(graph, buckets, zeroIndex, entry);
        }

        while ((entry = sources.dequeue())) {
            removeNode(graph, buckets, zeroIndex, entry);
        }

        if (graph.nodeCount()) {
            for (let index = buckets.length - 2; index > 0; --index) {
                entry = buckets[index].dequeue();
                if (entry) {
                    results = results.concat(removeNode(graph, buckets, zeroIndex, entry, true));
                    break;
                }
            }
        }
    }

    return results;
}

function removeNode(graph, buckets, zeroIndex, entry, collectPredecessors) {
    const results = collectPredecessors ? [] : undefined;

    graph.inEdges(entry.v).forEach(edgeObject => {
        const weight = graph.edge(edgeObject);
        const predecessorEntry = graph.node(edgeObject.v);

        if (collectPredecessors) {
            results.push({ v: edgeObject.v, w: edgeObject.w });
        }

        predecessorEntry.out -= weight;
        assignBucket(buckets, zeroIndex, predecessorEntry);
    });

    graph.outEdges(entry.v).forEach(edgeObject => {
        const weight = graph.edge(edgeObject);
        const successorEntry = graph.node(edgeObject.w);

        successorEntry["in"] -= weight;
        assignBucket(buckets, zeroIndex, successorEntry);
    });

    graph.removeNode(entry.v);

    return results;
}

function buildState(graph, weightFunction) {
    const feedbackArcGraph = new Graph();

    let maximumIn = 0;
    let maximumOut = 0;

    graph.nodes().forEach(nodeId => {
        feedbackArcGraph.setNode(nodeId, { v: nodeId, in: 0, out: 0 });
    });

    // Aggregate weights on nodes and combine multi-edges into single edges
    // for the feedbackArcGraph.
    graph.edges().forEach(edgeObject => {
        const previousWeight = feedbackArcGraph.edge(edgeObject.v, edgeObject.w) || 0;
        const weight = weightFunction(edgeObject);
        const edgeWeight = previousWeight + weight;

        feedbackArcGraph.setEdge(edgeObject.v, edgeObject.w, edgeWeight);

        maximumOut = Math.max(maximumOut, (feedbackArcGraph.node(edgeObject.v).out += weight));
        maximumIn = Math.max(maximumIn, (feedbackArcGraph.node(edgeObject.w).in += weight));
    });

    const buckets = createRange(maximumOut + maximumIn + 3).map(() => new List());
    const zeroIndex = maximumIn + 1;

    feedbackArcGraph.nodes().forEach(nodeId => {
        assignBucket(buckets, zeroIndex, feedbackArcGraph.node(nodeId));
    });

    return {
        graph: feedbackArcGraph,
        buckets,
        zeroIndex,
    };
}

function assignBucket(buckets, zeroIndex, entry) {
    if (!entry.out) {
        buckets[0].enqueue(entry);
    } else if (!entry.in) {
        buckets[buckets.length - 1].enqueue(entry);
    } else {
        buckets[entry.out - entry.in + zeroIndex].enqueue(entry);
    }
}

function createRange(limit) {
    const rangeArray = [];
    for (let index = 0; index < limit; index++) {
        rangeArray.push(index);
    }
    return rangeArray;
}

import { addDummyNode } from "./util.js";

export function run(graph) {
    graph.graph().dummyChains = [];
    graph.edges().forEach(edgeObject => normalizeEdge(graph, edgeObject));
}

/*
 * Breaks any long edges in the graph into short segments that span one layer
 * each. This operation is undoable with the undo function.
 *
 * Preconditions:
 *
 * 1. The input graph is a DAG.
 * 2. Each node in the graph has a "rank" property.
 *
 * Postconditions:
 *
 * 1. All edges in the graph have a length of 1.
 * 2. Dummy nodes are added where edges have been split into segments.
 * 3. The graph is augmented with a "dummyChains" attribute which contains
 *    the first dummy in each chain of dummy nodes produced.
 */

function normalizeEdge(graph, edgeObject) {
    let tailId = edgeObject.v;
    let tailRank = graph.node(tailId).rank;
    const headId = edgeObject.w;
    const headRank = graph.node(headId).rank;
    const name = edgeObject.name;
    const edgeLabel = graph.edge(edgeObject);
    const labelRank = edgeLabel.labelRank;

    if (headRank === tailRank + 1) {
        return;
    }

    graph.removeEdge(edgeObject);

    let dummyNodeId;
    let attributes;
    let stepIndex;

    for (stepIndex = 0, ++tailRank; tailRank < headRank; ++stepIndex, ++tailRank) {
        edgeLabel.points = [];

        attributes = {
            width: 0,
            height: 0,
            edgeLabel,
            edgeObj: edgeObject,
            rank: tailRank,
        };

        dummyNodeId = addDummyNode(graph, "edge", attributes, "_d");

        if (tailRank === labelRank) {
            attributes.width = edgeLabel.width;
            attributes.height = edgeLabel.height;
            attributes.dummy = "edge-label";
            attributes.labelpos = edgeLabel.labelpos;
        }

        graph.setEdge(tailId, dummyNodeId, { weight: edgeLabel.weight }, name);

        if (stepIndex === 0) {
            graph.graph().dummyChains.push(dummyNodeId);
        }

        tailId = dummyNodeId;
    }

    graph.setEdge(tailId, headId, { weight: edgeLabel.weight }, name);
}

export function undo(graph) {
    graph.graph().dummyChains.forEach(dummyNodeId => {
        let node = graph.node(dummyNodeId);
        const originalLabel = node.edgeLabel;

        graph.setEdge(node.edgeObj, originalLabel);

        let nextNodeId;

        while (node.dummy) {
            nextNodeId = graph.successors(dummyNodeId)[0];
            graph.removeNode(dummyNodeId);

            originalLabel.points.push({ x: node.x, y: node.y });

            if (node.dummy === "edge-label") {
                originalLabel.x = node.x;
                originalLabel.y = node.y;
                originalLabel.width = node.width;
                originalLabel.height = node.height;
            }

            dummyNodeId = nextNodeId;
            node = graph.node(dummyNodeId);
        }
    });
}

export default {
    run,
    undo,
};

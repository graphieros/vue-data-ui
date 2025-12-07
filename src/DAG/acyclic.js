import greedyFAS from "./greedy-fas.js";
import { uniqueId } from "./util.js";

export function run(graph) {
    const feedbackArcSet = graph.graph().acyclicer === "greedy"
        ? greedyFAS(graph, createWeightFunction(graph))
        : depthFirstSearchFeedbackArcSet(graph);

    feedbackArcSet.forEach(edgeObject => {
        const label = graph.edge(edgeObject);
        graph.removeEdge(edgeObject);

        label.forwardName = edgeObject.name;
        label.reversed = true;

        graph.setEdge(edgeObject.w, edgeObject.v, label, uniqueId("rev"));
    });

    function createWeightFunction(innerGraph) {
        return edgeObject => {
            return innerGraph.edge(edgeObject).weight;
        };
    }
}

export function undo(graph) {
    graph.edges().forEach(edgeObject => {
        const label = graph.edge(edgeObject);
        if (label.reversed) {
            graph.removeEdge(edgeObject);

            const forwardName = label.forwardName;
            delete label.reversed;
            delete label.forwardName;

            graph.setEdge(edgeObject.w, edgeObject.v, label, forwardName);
        }
    });
}

function depthFirstSearchFeedbackArcSet(graph) {
    const feedbackArcSet = [];
    const stack = {};
    const visited = {};

    function depthFirstSearch(nodeId) {
        if (Object.hasOwn(visited, nodeId)) {
            return;
        }

        visited[nodeId] = true;
        stack[nodeId] = true;

        graph.outEdges(nodeId).forEach(edgeObject => {
            if (Object.hasOwn(stack, edgeObject.w)) {
                feedbackArcSet.push(edgeObject);
            } else {
                depthFirstSearch(edgeObject.w);
            }
        });

        delete stack[nodeId];
    }

    graph.nodes().forEach(depthFirstSearch);

    return feedbackArcSet;
}

export default {
    run,
    undo,
};

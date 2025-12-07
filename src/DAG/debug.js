import util from "./util.js";
import Graph from "./graph.js";

export function debugOrdering(graph) {
    const layerMatrix = util.buildLayerMatrix(graph);

    const debugGraph = new Graph({ compound: true, multigraph: true }).setGraph({});

    graph.nodes().forEach(nodeId => {
        debugGraph.setNode(nodeId, { label: nodeId });
        debugGraph.setParent(nodeId, "layer" + graph.node(nodeId).rank);
    });

    graph.edges().forEach(edgeObject => {
        debugGraph.setEdge(edgeObject.v, edgeObject.w, {}, edgeObject.name);
    });

    layerMatrix.forEach((layer, index) => {
        const layerNodeId = "layer" + index;
        debugGraph.setNode(layerNodeId, { rank: "same" });

        layer.reduce((previousNodeId, currentNodeId) => {
            debugGraph.setEdge(previousNodeId, currentNodeId, { style: "invis" });
            return currentNodeId;
        });
    });

    return debugGraph;
}

export default {
    debugOrdering,
};

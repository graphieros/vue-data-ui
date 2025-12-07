import { addDummyNode } from "./util.js";

export default function addBorderSegments(graph) {
    function depthFirstSearch(nodeId) {
        const children = graph.children(nodeId);
        const node = graph.node(nodeId);

        if (children.length) {
            children.forEach(depthFirstSearch);
        }

        if (Object.hasOwn(node, "minRank")) {
            node.borderLeft = [];
            node.borderRight = [];

            for (let rank = node.minRank, maximumRank = node.maxRank + 1; rank < maximumRank; ++rank) {
                addBorderNode(graph, "borderLeft", "_bl", nodeId, node, rank);
                addBorderNode(graph, "borderRight", "_br", nodeId, node, rank);
            }
        }
    }

    graph.children().forEach(depthFirstSearch);
}

function addBorderNode(graph, propertyName, prefix, subgraphId, subgraphNode, rank) {
    const label = {
        width: 0,
        height: 0,
        rank,
        borderType: propertyName,
    };

    const previousNodeId = subgraphNode[propertyName][rank - 1];
    const currentNodeId = addDummyNode(graph, "border", label, prefix);

    subgraphNode[propertyName][rank] = currentNodeId;
    graph.setParent(currentNodeId, subgraphId);

    if (previousNodeId) {
        graph.setEdge(previousNodeId, currentNodeId, { weight: 1 });
    }
}

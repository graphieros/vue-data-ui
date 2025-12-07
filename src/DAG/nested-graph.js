import util from "./util.js";

export function run(graph) {
    const root = util.addDummyNode(graph, "root", {}, "_root");
    const depths = treeDepths(graph);
    const depthsArray = Object.values(depths);
    const height = util.applyWithChunking(Math.max, depthsArray) - 1;

    const nodeSeparation = 2 * height + 1;

    graph.graph().nestingRoot = root;

    // Multiply minlen by nodeSeparation to align nodes on non-border ranks.
    graph.edges().forEach(edgeObject => {
        graph.edge(edgeObject).minlen *= nodeSeparation;
    });

    // Calculate a weight that is sufficient to keep subgraphs vertically compact.
    const weight = sumWeights(graph) + 1;

    // Create border nodes and link them up.
    graph.children().forEach(childId => {
        depthFirstSearch(graph, root, nodeSeparation, weight, height, depths, childId);
    });

    // Save the multiplier for node layers for later removal of empty border layers.
    graph.graph().nodeRankFactor = nodeSeparation;
}

/*
 * A nesting graph creates dummy nodes for the tops and bottoms of subgraphs,
 * adds appropriate edges to ensure that all cluster nodes are placed between
 * these boundaries, and ensures that the graph is connected.
 *
 * In addition we ensure, through the use of the minlen property, that nodes
 * and subgraph border nodes do not end up on the same rank.
 *
 * Preconditions:
 *
 * 1. Input graph is a DAG.
 * 2. Nodes in the input graph have a minlen attribute.
 *
 * Postconditions:
 *
 * 1. Input graph is connected.
 * 2. Dummy nodes are added for the tops and bottoms of subgraphs.
 * 3. The minlen attribute for nodes is adjusted to ensure nodes do not
 *    get placed on the same rank as subgraph border nodes.
 *
 * The nesting graph idea comes from Sander, "Layout of Compound Directed Graphs."
 */

function depthFirstSearch(graph, root, nodeSeparation, weight, height, depths, nodeId) {
    const children = graph.children(nodeId);

    if (!children.length) {
        if (nodeId !== root) {
            graph.setEdge(root, nodeId, { weight: 0, minlen: nodeSeparation });
        }
        return;
    }

    const topBorderNodeId = util.addBorderNode(graph, "_bt");
    const bottomBorderNodeId = util.addBorderNode(graph, "_bb");

    const label = graph.node(nodeId);

    graph.setParent(topBorderNodeId, nodeId);
    label.borderTop = topBorderNodeId;

    graph.setParent(bottomBorderNodeId, nodeId);
    label.borderBottom = bottomBorderNodeId;

    children.forEach(childId => {
        depthFirstSearch(graph, root, nodeSeparation, weight, height, depths, childId);

        const childNode = graph.node(childId);
        const childTop = childNode.borderTop ? childNode.borderTop : childId;
        const childBottom = childNode.borderBottom ? childNode.borderBottom : childId;

        const currentWeight = childNode.borderTop ? weight : 2 * weight;
        const minimumLength =
            childTop !== childBottom ? 1 : height - depths[nodeId] + 1;

        graph.setEdge(topBorderNodeId, childTop, {
            weight: currentWeight,
            minlen: minimumLength,
            nestingEdge: true,
        });

        graph.setEdge(childBottom, bottomBorderNodeId, {
            weight: currentWeight,
            minlen: minimumLength,
            nestingEdge: true,
        });
    });

    if (!graph.parent(nodeId)) {
        graph.setEdge(root, topBorderNodeId, {
            weight: 0,
            minlen: height + depths[nodeId],
        });
    }
}

function treeDepths(graph) {
    const depths = {};

    function depthFirstSearch(nodeId, depth) {
        const children = graph.children(nodeId);

        if (children && children.length) {
            children.forEach(childId => depthFirstSearch(childId, depth + 1));
        }

        depths[nodeId] = depth;
    }

    graph.children().forEach(nodeId => depthFirstSearch(nodeId, 1));

    return depths;
}

function sumWeights(graph) {
    return graph.edges().reduce((accumulator, edgeObject) => {
        return accumulator + graph.edge(edgeObject).weight;
    }, 0);
}

export function cleanup(graph) {
    const graphLabel = graph.graph();

    graph.removeNode(graphLabel.nestingRoot);
    delete graphLabel.nestingRoot;

    graph.edges().forEach(edgeObject => {
        const edge = graph.edge(edgeObject);
        if (edge.nestingEdge) {
            graph.removeEdge(edgeObject);
        }
    });
}

export default {
    run,
    cleanup,
};

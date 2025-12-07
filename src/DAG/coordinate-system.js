export function adjust(graph) {
    const rankDirection = graph.graph().rankdir.toLowerCase();

    if (rankDirection === "lr" || rankDirection === "rl") {
        swapWidthAndHeight(graph);
    }
}

export function undo(graph) {
    const rankDirection = graph.graph().rankdir.toLowerCase();

    if (rankDirection === "bt" || rankDirection === "rl") {
        reverseY(graph);
    }

    if (rankDirection === "lr" || rankDirection === "rl") {
        swapXY(graph);
        swapWidthAndHeight(graph);
    }
}

function swapWidthAndHeight(graph) {
    graph.nodes().forEach(nodeId => {
        swapWidthAndHeightOnAttributes(graph.node(nodeId));
    });

    graph.edges().forEach(edgeObject => {
        swapWidthAndHeightOnAttributes(graph.edge(edgeObject));
    });
}

function swapWidthAndHeightOnAttributes(attributes) {
    const width = attributes.width;
    attributes.width = attributes.height;
    attributes.height = width;
}

function reverseY(graph) {
    graph.nodes().forEach(nodeId => {
        reverseYOnAttributes(graph.node(nodeId));
    });

    graph.edges().forEach(edgeObject => {
        const edge = graph.edge(edgeObject);

        edge.points.forEach(reverseYOnAttributes);

        if (Object.hasOwn(edge, "y")) {
            reverseYOnAttributes(edge);
        }
    });
}

function reverseYOnAttributes(attributes) {
    attributes.y = -attributes.y;
}

function swapXY(graph) {
    graph.nodes().forEach(nodeId => {
        swapXYOnAttributes(graph.node(nodeId));
    });

    graph.edges().forEach(edgeObject => {
        const edge = graph.edge(edgeObject);

        edge.points.forEach(swapXYOnAttributes);

        if (Object.hasOwn(edge, "x")) {
            swapXYOnAttributes(edge);
        }
    });
}

function swapXYOnAttributes(attributes) {
    const x = attributes.x;
    attributes.x = attributes.y;
    attributes.y = x;
}

export default {
    adjust,
    undo,
};

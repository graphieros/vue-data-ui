import * as acyclic from "./acyclic.js";
import * as normalize from "./normalize.js";
import rank from "./rank/index.js";
import { normalizeRanks, removeEmptyRanks, asNonCompoundGraph, buildLayerMatrix, intersectRect, pick, mapValues, addDummyNode, maxRank, range } from "./util.js"; // adjust if you prefer named imports only
import parentDummyChains from "./parent-dummy-chains.js";
import * as nestingGraph from "./nested-graph.js";
import addBorderSegments from "./add-border-segments.js";
import coordinateSystem from "./coordinate-system.js";
import order from "./order/index.js";
import position from "./position/index.js";
import * as util from "./util.js";
import Graph from "./graph.js";

export default function layout(graph, options = {}) {
    const timeFn = options.debugTiming ? util.time : util.notime;
    return timeFn("layout", () => {
        const layoutGraph = timeFn("  buildLayoutGraph", () => buildLayoutGraph(graph));
        timeFn("  runLayout", () => runLayout(layoutGraph, timeFn, options));
        timeFn("  updateInputGraph", () => updateInputGraph(graph, layoutGraph));
        return layoutGraph;
    });
}

function runLayout(graph, timeFn, options) {
    timeFn("    makeSpaceForEdgeLabels", () => makeSpaceForEdgeLabels(graph));
    timeFn("    removeSelfEdges", () => removeSelfEdges(graph));
    timeFn("    acyclic", () => acyclic.run(graph));
    timeFn("    nestingGraph.run", () => nestingGraph.run(graph));
    timeFn("    rank", () => rank(asNonCompoundGraph(graph)));
    timeFn("    injectEdgeLabelProxies", () => injectEdgeLabelProxies(graph));
    timeFn("    removeEmptyRanks", () => removeEmptyRanks(graph));
    timeFn("    nestingGraph.cleanup", () => nestingGraph.cleanup(graph));
    timeFn("    normalizeRanks", () => normalizeRanks(graph));
    timeFn("    assignRankMinMax", () => assignRankMinMax(graph));
    timeFn("    removeEdgeLabelProxies", () => removeEdgeLabelProxies(graph));
    timeFn("    normalize.run", () => normalize.run(graph));
    timeFn("    parentDummyChains", () => parentDummyChains(graph));
    timeFn("    addBorderSegments", () => addBorderSegments(graph));
    timeFn("    order", () => order(graph, options));
    timeFn("    insertSelfEdges", () => insertSelfEdges(graph));
    timeFn("    adjustCoordinateSystem", () => coordinateSystem.adjust(graph));
    timeFn("    position", () => position(graph));
    timeFn("    positionSelfEdges", () => positionSelfEdges(graph));
    timeFn("    removeBorderNodes", () => removeBorderNodes(graph));
    timeFn("    normalize.undo", () => normalize.undo(graph));
    timeFn("    fixupEdgeLabelCoords", () => fixupEdgeLabelCoords(graph));
    timeFn("    undoCoordinateSystem", () => coordinateSystem.undo(graph));
    timeFn("    translateGraph", () => translateGraph(graph));
    timeFn("    assignNodeIntersects", () => assignNodeIntersects(graph));
    timeFn("    reversePoints", () => reversePointsForReversedEdges(graph));
    timeFn("    acyclic.undo", () => acyclic.undo(graph));
}

function updateInputGraph(inputGraph, layoutGraph) {
    inputGraph.nodes().forEach(nodeId => {
        const inputLabel = inputGraph.node(nodeId);
        const layoutLabel = layoutGraph.node(nodeId);

        if (inputLabel) {
            inputLabel.x = layoutLabel.x;
            inputLabel.y = layoutLabel.y;
            inputLabel.order = layoutLabel.order;
            inputLabel.rank = layoutLabel.rank;

            if (layoutGraph.children(nodeId).length) {
                inputLabel.width = layoutLabel.width;
                inputLabel.height = layoutLabel.height;
            }
        }
    });

    inputGraph.edges().forEach(edgeObj => {
        const inputLabel = inputGraph.edge(edgeObj);
        const layoutLabel = layoutGraph.edge(edgeObj);

        inputLabel.points = layoutLabel.points;
        if (Object.hasOwn(layoutLabel, "x")) {
            inputLabel.x = layoutLabel.x;
            inputLabel.y = layoutLabel.y;
        }
    });

    const layoutGraphLabel = layoutGraph.graph();
    const inputGraphLabel = inputGraph.graph();
    inputGraphLabel.width = layoutGraphLabel.width;
    inputGraphLabel.height = layoutGraphLabel.height;
}

const graphNumAttrs = ["nodesep", "edgesep", "ranksep", "marginx", "marginy"];
const graphDefaults = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: "tb" };
const graphAttrs = ["acyclicer", "ranker", "rankdir", "align"];
const nodeNumAttrs = ["width", "height", "rank"];
const nodeDefaults = { width: 0, height: 0 };
const edgeNumAttrs = ["minlen", "weight", "width", "height", "labeloffset"];
const edgeDefaults = {
    minlen: 1,
    weight: 1,
    width: 0,
    height: 0,
    labeloffset: 10,
    labelpos: "r",
};
const edgeAttrs = ["labelpos", "arrowshape"]; // must be lowercase

function buildLayoutGraph(inputGraph) {
    const graph = canonicalize(inputGraph.graph());
    const graphLabel = {
        ...graphDefaults,
        ...selectNumberAttrs(graph, graphNumAttrs),
        ...pick(graph, graphAttrs),
    };

    const layoutGraph = new Graph({ multigraph: true, compound: true });
    layoutGraph.setGraph(graphLabel);

    inputGraph.nodes().forEach(nodeId => {
        const node = canonicalize(inputGraph.node(nodeId));
        const newNode = selectNumberAttrs(node, nodeNumAttrs);

        Object.keys(nodeDefaults).forEach(key => {
            if (newNode[key] === undefined) {
                newNode[key] = nodeDefaults[key];
            }
        });

        layoutGraph.setNode(nodeId, newNode);
        layoutGraph.setParent(nodeId, inputGraph.parent(nodeId));
    });

    inputGraph.edges().forEach(edgeObj => {
        const edge = canonicalize(inputGraph.edge(edgeObj));
        layoutGraph.setEdge(
            edgeObj,
            {
                ...edgeDefaults,
                ...selectNumberAttrs(edge, edgeNumAttrs),
                ...pick(edge, edgeAttrs),
            },
        );
    });

    return layoutGraph;
}

function makeSpaceForEdgeLabels(graph) {
    const graphLabel = graph.graph();
    graphLabel.ranksep /= 2;
    graph.edges().forEach(edgeObj => {
        const edge = graph.edge(edgeObj);
        edge.minlen *= 2;
        if (edge.labelpos.toLowerCase() !== "c") {
            if (graphLabel.rankdir === "TB" || graphLabel.rankdir === "BT") {
                edge.width += edge.labeloffset;
            } else {
                edge.height += edge.labeloffset;
            }
        }
    });
}

function injectEdgeLabelProxies(graph) {
    graph.edges().forEach(edgeObj => {
        const edge = graph.edge(edgeObj);
        if (edge.width && edge.height) {
            const tail = graph.node(edgeObj.v);
            const head = graph.node(edgeObj.w);
            const label = { rank: (head.rank - tail.rank) / 2 + tail.rank, e: edgeObj };
            addDummyNode(graph, "edge-proxy", label, "_ep");
        }
    });
}

function assignRankMinMax(graph) {
    let maximumRank = 0;
    graph.nodes().forEach(nodeId => {
        const node = graph.node(nodeId);
        if (node.borderTop) {
            node.minRank = graph.node(node.borderTop).rank;
            node.maxRank = graph.node(node.borderBottom).rank;
            maximumRank = Math.max(maximumRank, node.maxRank);
        }
    });
    graph.graph().maxRank = maximumRank;
}

function removeEdgeLabelProxies(graph) {
    graph.nodes().forEach(nodeId => {
        const node = graph.node(nodeId);
        if (node.dummy === "edge-proxy") {
            graph.edge(node.e).labelRank = node.rank;
            graph.removeNode(nodeId);
        }
    });
}

function translateGraph(graph) {
    let minimumX = Number.POSITIVE_INFINITY;
    let maximumX = 0;
    let minimumY = Number.POSITIVE_INFINITY;
    let maximumY = 0;
    const graphLabel = graph.graph();
    const marginX = graphLabel.marginx || 0;
    const marginY = graphLabel.marginy || 0;

    function updateExtremes(attributes) {
        const x = attributes.x;
        const y = attributes.y;
        const width = attributes.width;
        const height = attributes.height;

        minimumX = Math.min(minimumX, x - width / 2);
        maximumX = Math.max(maximumX, x + width / 2);
        minimumY = Math.min(minimumY, y - height / 2);
        maximumY = Math.max(maximumY, y + height / 2);
    }

    graph.nodes().forEach(nodeId => updateExtremes(graph.node(nodeId)));
    graph.edges().forEach(edgeObj => {
        const edge = graph.edge(edgeObj);
        if (Object.hasOwn(edge, "x")) {
            updateExtremes(edge);
        }
    });

    minimumX -= marginX;
    minimumY -= marginY;

    graph.nodes().forEach(nodeId => {
        const node = graph.node(nodeId);
        node.x -= minimumX;
        node.y -= minimumY;
    });

    graph.edges().forEach(edgeObj => {
        const edge = graph.edge(edgeObj);
        edge.points.forEach(point => {
            point.x -= minimumX;
            point.y -= minimumY;
        });
        if (Object.hasOwn(edge, "x")) {
            edge.x -= minimumX;
        }
        if (Object.hasOwn(edge, "y")) {
            edge.y -= minimumY;
        }
    });

    graphLabel.width = maximumX - minimumX + marginX;
    graphLabel.height = maximumY - minimumY + marginY;
}

function shortenPoint(point, neighborPoint, offset) {
    if (!offset || !neighborPoint) {
        return point;
    }

    const deltaX = neighborPoint.x - point.x;
    const deltaY = neighborPoint.y - point.y;
    const segmentLength = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (!segmentLength || segmentLength <= offset) {
        return point;
    }

    const ratio = offset / segmentLength;

    return {
        x: point.x + deltaX * ratio,
        y: point.y + deltaY * ratio,
    };
}

function assignNodeIntersects(graph) {
    const ENDPOINT_OFFSET = 4;

    graph.edges().forEach(edgeObject => {
        const edge = graph.edge(edgeObject);
        const nodeV = graph.node(edgeObject.v);
        const nodeW = graph.node(edgeObject.w);

        let firstPoint;
        let lastPoint;

        if (!edge.points || !edge.points.length) {
            edge.points = [];
            firstPoint = nodeW;
            lastPoint = nodeV;
        } else {
            firstPoint = edge.points[0];
            lastPoint = edge.points[edge.points.length - 1];
        }

        const rawStart = intersectRect(nodeV, firstPoint);
        const rawEnd = intersectRect(nodeW, lastPoint);

        const startNeighborPoint =
            edge.points.length ? edge.points[0] : firstPoint;
        const endNeighborPoint =
            edge.points.length ? edge.points[edge.points.length - 1] : lastPoint;

        const arrowShape = edge.arrowshape;
        const shouldApplyOffset =
            arrowShape === "normal" || arrowShape === "vee";

        const isReversed = !!edge.reversed;

        let shortenedStart = rawStart;
        let shortenedEnd = rawEnd;

        if (shouldApplyOffset) {
            if (isReversed) {
                // This side will become the FINAL tip after reversePointsForReversedEdges
                shortenedStart = shortenPoint(rawStart, startNeighborPoint, ENDPOINT_OFFSET);
            } else {
                // Normal case: FINAL tip is at current end
                shortenedEnd = shortenPoint(rawEnd, endNeighborPoint, ENDPOINT_OFFSET);
            }
        }

        edge.points.unshift(shortenedStart);
        edge.points.push(shortenedEnd);
    });
}


function fixupEdgeLabelCoords(graph) {
    graph.edges().forEach(edgeObj => {
        const edge = graph.edge(edgeObj);
        if (Object.hasOwn(edge, "x")) {
            if (edge.labelpos === "l" || edge.labelpos === "r") {
                edge.width -= edge.labeloffset;
            }
            switch (edge.labelpos) {
                case "l":
                    edge.x -= edge.width / 2 + edge.labeloffset;
                    break;
                case "r":
                    edge.x += edge.width / 2 + edge.labeloffset;
                    break;
            }
        }
    });
}

function reversePointsForReversedEdges(graph) {
    graph.edges().forEach(edgeObj => {
        const edge = graph.edge(edgeObj);
        if (edge.reversed) {
            edge.points.reverse();
        }
    });
}

function removeBorderNodes(graph) {
    graph.nodes().forEach(nodeId => {
        if (graph.children(nodeId).length) {
            const node = graph.node(nodeId);
            const top = graph.node(node.borderTop);
            const bottom = graph.node(node.borderBottom);
            const left = graph.node(node.borderLeft[node.borderLeft.length - 1]);
            const right = graph.node(node.borderRight[node.borderRight.length - 1]);

            node.width = Math.abs(right.x - left.x);
            node.height = Math.abs(bottom.y - top.y);
            node.x = left.x + node.width / 2;
            node.y = top.y + node.height / 2;
        }
    });

    graph.nodes().forEach(nodeId => {
        if (graph.node(nodeId).dummy === "border") {
            graph.removeNode(nodeId);
        }
    });
}

function removeSelfEdges(graph) {
    graph.edges().forEach(edgeObj => {
        if (edgeObj.v === edgeObj.w) {
            const node = graph.node(edgeObj.v);
            if (!node.selfEdges) {
                node.selfEdges = [];
            }
            node.selfEdges.push({ e: edgeObj, label: graph.edge(edgeObj) });
            graph.removeEdge(edgeObj);
        }
    });
}

function insertSelfEdges(graph) {
    const layers = buildLayerMatrix(graph);

    layers.forEach(layer => {
        let orderShift = 0;

        layer.forEach((nodeId, index) => {
            const node = graph.node(nodeId);
            node.order = index + orderShift;

            (node.selfEdges || []).forEach(selfEdge => {
                addDummyNode(graph, "selfedge", {
                    width: selfEdge.label.width,
                    height: selfEdge.label.height,
                    rank: node.rank,
                    order: index + ++orderShift,
                    e: selfEdge.e,
                    label: selfEdge.label,
                }, "_se");
            });

            delete node.selfEdges;
        });
    });
}

function positionSelfEdges(graph) {
    graph.nodes().forEach(nodeId => {
        const node = graph.node(nodeId);
        if (node.dummy === "selfedge") {
            const selfNode = graph.node(node.e.v);
            const x = selfNode.x + selfNode.width / 2;
            const y = selfNode.y;
            const deltaX = node.x - x;
            const deltaY = selfNode.height / 2;

            graph.setEdge(node.e, node.label);
            graph.removeNode(nodeId);

            node.label.points = [
                { x: x + (2 * deltaX) / 3, y: y - deltaY },
                { x: x + (5 * deltaX) / 6, y: y - deltaY },
                { x: x + deltaX, y: y },
                { x: x + (5 * deltaX) / 6, y: y + deltaY },
                { x: x + (2 * deltaX) / 3, y: y + deltaY },
            ];
            node.label.x = node.x;
            node.label.y = node.y;
        }
    });
}

function selectNumberAttrs(obj, attrs) {
    return mapValues(pick(obj, attrs), Number);
}

function canonicalize(attrs) {
    const newAttributes = {};
    if (attrs) {
        Object.entries(attrs).forEach(([key, value]) => {
            let normalizedKey = key;
            if (typeof normalizedKey === "string") {
                normalizedKey = normalizedKey.toLowerCase();
            }
            newAttributes[normalizedKey] = value;
        });
    }
    return newAttributes;
}

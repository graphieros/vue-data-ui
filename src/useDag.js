"use strict";

import { ref, watchEffect, unref } from "vue";
import Graph from "./DAG/graph.js";
import layout from "./DAG/layout.js";
import { createUid, getPathMidpoint } from "./lib.js";

const defaultDagConfiguration = {
    rankDirection: "TB",       // "TB", "BT", "LR", "RL"
    nodeSeparation: 50,
    rankSeparation: 50,
    edgeSeparation: 10,
    // "UL", "UR", "DL", "DR" or undefined force one of four extreme alignment strategies (Up/Down × Left/Right).
    align: undefined,
    nodeWidth: 100,
    nodeHeight: 40,
    curvedEdges: false,
    padding: 20,
    // "undirected" | "normal" | "vee"
    arrowShape: "normal",
    arrowSize: 10
};

function buildStraightPath(points) {
    if (!points.length) return "";
    return points
        .map((point, index) =>
            `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
        )
        .join(" ");
}

// Curved path with a straight last segment to keep arrow orientation stable
function buildCurvedPath(points) {
    if (!points.length) return "";

    if (points.length === 1) {
        const point = points[0];
        return `M ${point.x} ${point.y}`;
    }

    if (points.length === 2) {
        return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    const [first] = points;
    let path = `M ${first.x} ${first.y}`;

    for (let index = 1; index < points.length - 1; index += 1) {
        const previous = points[index - 1];
        const current = points[index];
        const next = points[index + 1];

        const controlX = current.x;
        const controlY = current.y;
        const endX = (current.x + next.x) / 2;
        const endY = (current.y + next.y) / 2;

        path += ` Q ${controlX} ${controlY} ${endX} ${endY}`;
    }

    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;

    return path;
}

export function useDag(options) {
    const { nodes, edges, configuration } = options;

    const layoutData = ref(null);
    const lastError = ref(null);

    // Unique marker identifier per instance
    const arrowMarkerIdentifier = `dag-arrow-${createUid()}`;

    function computeLayoutInternal(rawNodes, rawEdges, userConfiguration) {
        lastError.value = null;
        layoutData.value = null; // clear previous result

        const finalConfiguration = {
            ...defaultDagConfiguration,
            ...userConfiguration
        };

        // Fresh graph instance on every run: full recompute
        const graphInstance = new Graph({ multigraph: true, compound: true });

        graphInstance.setGraph({
            rankdir: finalConfiguration.rankDirection,
            nodesep: finalConfiguration.nodeSeparation,
            ranksep: finalConfiguration.rankSeparation,
            edgesep: finalConfiguration.edgeSeparation,
            align: finalConfiguration.align
        });

        rawNodes.forEach(node => {
            graphInstance.setNode(node.id, {
                label: node.label,
                width: node.width ?? finalConfiguration.nodeWidth,
                height: node.height ?? finalConfiguration.nodeHeight
            });
        });

        rawEdges.forEach(edge => {
            graphInstance.setEdge(edge.from, edge.to, {
                weight: edge.weight ?? 1,
                minlen: edge.minLength ?? 1
            });
        });

        layout(graphInstance);

        const laidOutNodes = rawNodes.map(node => {
            const graphNode = graphInstance.node(node.id);
            return {
                id: node.id,
                label: node.label,
                x: graphNode.x,
                y: graphNode.y,
                width: graphNode.width,
                height: graphNode.height,
                original: node
            };
        });

        const laidOutEdges = graphInstance
            .edges()
            .map(edgeObject => {
                const edgeLabel = graphInstance.edge(edgeObject);
                const points = edgeLabel.points || [];

                if (!points.length) {
                    return null;
                }

                const pathData = finalConfiguration.curvedEdges
                    ? buildCurvedPath(points)
                    : buildStraightPath(points);

                const useMarker = finalConfiguration.arrowShape !== "undirected";
                const markerEnd = useMarker
                    ? `url(#${arrowMarkerIdentifier})`
                    : null;

                const thisRawEdge = rawEdges.find(e => e?.from === edgeObject.v && e?.to === edgeObject.w);

                return {
                    id: `${edgeObject.v}->${edgeObject.w}->${createUid()}`,
                    from: edgeObject.v,
                    to: edgeObject.w,
                    points,
                    pathData,
                    markerEnd,
                    original: {
                        ...thisRawEdge,
                        ...edgeLabel,
                    }
                };
            })
            .filter(Boolean);

        const padding = finalConfiguration.padding;

        if (!laidOutNodes.length) {
            layoutData.value = {
                nodes: [],
                edges: laidOutEdges,
                viewBox: "0 0 0 0",
                arrowShape: finalConfiguration.arrowShape,
                arrowSize: finalConfiguration.arrowSize
            };
            return;
        }

        const xValues = laidOutNodes.flatMap(node => [
            node.x - node.width / 2,
            node.x + node.width / 2
        ]);
        const yValues = laidOutNodes.flatMap(node => [
            node.y - node.height / 2,
            node.y + node.height / 2
        ]);

        const minX = Math.min(...xValues) - padding;
        const maxX = Math.max(...xValues) + padding;
        const minY = Math.min(...yValues) - padding;
        const maxY = Math.max(...yValues) + padding;

        layoutData.value = {
            nodes: laidOutNodes,
            edges: laidOutEdges.map(e => ({
                ...e,
                midpoint: e.pathData ? getPathMidpoint(e.pathData) : { x: 0, y: 0 }
            })),
            viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
            arrowShape: finalConfiguration.arrowShape,
            arrowSize: finalConfiguration.arrowSize
        };
    }

    watchEffect(() => {
        try {
            const rawNodes = unref(nodes) || [];
            const rawEdges = unref(edges) || [];
            const userConfiguration = unref(configuration) || {};

            computeLayoutInternal(rawNodes, rawEdges, userConfiguration);
        } catch (error) {
            console.error("[useDag] layout error:", error);
            lastError.value = error;
            layoutData.value = null;
        }
    });

    return {
        layoutData,
        lastError,
        arrowMarkerIdentifier,
        recomputeLayout: () => {
            const rawNodes = unref(nodes) || [];
            const rawEdges = unref(edges) || [];
            const userConfiguration = unref(configuration) || {};
            computeLayoutInternal(rawNodes, rawEdges, userConfiguration);
        }
    };
}

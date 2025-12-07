import Graph from "./graph.js";
import layout from "./layout.js";

/**
 *
 * @param {Object} params
 * @param {Array<{ id: string, width: number, height: number, data?: any }>} params.nodes
 * @param {Array<{ id?: string, from: string, to: string, minlen?: number, weight?: number, data?: any }>} params.edges
 * @param {Object} [params.graph]
 * @param {number} [params.graph.ranksep]
 * @param {number} [params.graph.nodesep]
 * @param {number} [params.graph.edgesep]
 * @param {number} [params.graph.marginx]
 * @param {number} [params.graph.marginy]
 * @param {"TB" | "BT" | "LR" | "RL"} [params.graph.rankdir]
 * @param {"network-simplex" | "tight-tree" | "longest-path" | "none"} [params.graph.ranker]
 * @param {Object} [params.layoutOptions]
 *
 * @returns {{
 *   width: number,
 *   height: number,
 *   nodes: Record<string, { x: number, y: number, width: number, height: number, data?: any }>,
 *   edges: Array<{
 *     id: string,
 *     from: string,
 *     to: string,
 *     points: Array<{ x: number, y: number }>,
 *     label?: { x: number, y: number, width: number, height: number },
 *     data?: any
 *   }>
 * }}
 */
export function computeDagLayout({
    nodes,
    edges,
    graph = {},
    layoutOptions = {},
}) {
    const dagGraph = new Graph({ multigraph: true, compound: true });

    dagGraph.setGraph({
        nodesep: graph.nodesep ?? 50,
        edgesep: graph.edgesep ?? 20,
        ranksep: graph.ranksep ?? 50,
        marginx: graph.marginx ?? 20,
        marginy: graph.marginy ?? 20,
        rankdir: graph.rankdir ?? "TB",
        ranker: graph.ranker ?? "network-simplex",
        align: graph.align,
        acyclicer: graph.acyclicer,
    });

    nodes.forEach(node => {
        dagGraph.setNode(node.id, {
            width: node.width,
            height: node.height,
            ...("data" in node ? { data: node.data } : {}),
        });
    });

    edges.forEach(edge => {
        const edgeId = edge.id ?? `${edge.from}->${edge.to}`;
        dagGraph.setEdge(
            { v: edge.from, w: edge.to, name: edgeId },
            {
                minlen: edge.minlen ?? 1,
                weight: edge.weight ?? 1,
                width: 0,
                height: 0,
                labeloffset: 10,
                labelpos: "r",
                ...("data" in edge ? { data: edge.data } : {}),
            },
        );
    });

    layout(dagGraph, layoutOptions);

    const graphLabel = dagGraph.graph();

    const positionedNodes = {};
    dagGraph.nodes().forEach(nodeId => {
        const node = dagGraph.node(nodeId);
        positionedNodes[nodeId] = {
            x: node.x,
            y: node.y,
            width: node.width,
            height: node.height,
            ...(node.data !== undefined ? { data: node.data } : {}),
        };
    });

    const positionedEdges = dagGraph.edges().map(edgeObj => {
        const edgeLabel = dagGraph.edge(edgeObj);

        const resultEdge = {
            id: edgeObj.name,
            from: edgeObj.v,
            to: edgeObj.w,
            points: edgeLabel.points ?? [],
            ...(edgeLabel.data !== undefined ? { data: edgeLabel.data } : {}),
        };

        if (
            Object.prototype.hasOwnProperty.call(edgeLabel, "x") &&
            Object.prototype.hasOwnProperty.call(edgeLabel, "y")
        ) {
            resultEdge.label = {
                x: edgeLabel.x,
                y: edgeLabel.y,
                width: edgeLabel.width ?? 0,
                height: edgeLabel.height ?? 0,
            };
        }

        return resultEdge;
    });

    return {
        width: graphLabel.width,
        height: graphLabel.height,
        nodes: positionedNodes,
        edges: positionedEdges,
    };
}

export default computeDagLayout;

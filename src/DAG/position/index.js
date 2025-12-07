import { asNonCompoundGraph, buildLayerMatrix } from "../util.js";
import { positionX } from "./bk.js";

export default function position(g) {
    const nonCompoundGraph = asNonCompoundGraph(g);

    positionY(nonCompoundGraph);
    const xByNode = positionX(nonCompoundGraph);
    Object.entries(xByNode).forEach(([v, x]) => {
        g.node(v).x = x;
    });
}

function positionY(g) {
    const layering = buildLayerMatrix(g);
    const rankSep = g.graph().ranksep;
    let previousY = 0;

    layering.forEach((layer) => {
        const maxHeight = layer.reduce((accumulator, nodeId) => {
            const height = g.node(nodeId).height;
            if (accumulator > height) {
                return accumulator;
            } else {
                return height;
            }
        }, 0);

        layer.forEach((nodeId) => {
            g.node(nodeId).y = previousY + maxHeight / 2;
        });

        previousY += maxHeight + rankSep;
    });
}

import * as util from "../util.js";

/*
 * This module provides coordinate assignment based on Brandes and Köpf, "Fast
 * and Simple Horizontal Coordinate Assignment."
 */

export {
    positionX,
    findType1Conflicts,
    findType2Conflicts,
    addConflict,
    hasConflict,
    verticalAlignment,
    horizontalCompaction,
    alignCoordinates,
    findSmallestWidthAlignment,
    balance
};

export default {
    positionX,
    findType1Conflicts,
    findType2Conflicts,
    addConflict,
    hasConflict,
    verticalAlignment,
    horizontalCompaction,
    alignCoordinates,
    findSmallestWidthAlignment,
    balance
};

/*
 * Marks all edges in the graph with a type-1 conflict with the "type1Conflict"
 * property. A type-1 conflict is one where a non-inner segment crosses an
 * inner segment. An inner segment is an edge with both incident nodes marked
 * with the "dummy" property.
 *
 * This algorithm scans layer by layer, starting with the second, for type-1
 * conflicts between the current layer and the previous layer. For each layer
 * it scans the nodes from left to right until it reaches one that is incident
 * on an inner segment. It then scans predecessors to determine if they have
 * edges that cross that inner segment. At the end a final scan is done for all
 * nodes on the current rank to see if they cross the last visited inner
 * segment.
 *
 * This algorithm (safely) assumes that a dummy node will only be incident on a
 * single node in the layers being scanned.
 */
function findType1Conflicts(g, layering) {
    const conflicts = {};

    function visitLayer(prevLayer, layer) {
        let k0 = 0; // last visited node in previous layer incident on inner segment
        let scanPos = 0;
        const prevLayerLength = prevLayer.length;
        const lastNode = layer[layer.length - 1];

        layer.forEach((v, i) => {
            const w = findOtherInnerSegmentNode(g, v);
            const k1 = w ? g.node(w).order : prevLayerLength;

            if (w || v === lastNode) {
                layer.slice(scanPos, i + 1).forEach(scanNode => {
                    g.predecessors(scanNode).forEach(u => {
                        const uLabel = g.node(u);
                        const uPos = uLabel.order;
                        if (
                            (uPos < k0 || k1 < uPos) &&
                            !(uLabel.dummy && g.node(scanNode).dummy)
                        ) {
                            addConflict(conflicts, u, scanNode);
                        }
                    });
                });
                scanPos = i + 1;
                k0 = k1;
            }
        });

        return layer;
    }

    if (layering.length) {
        layering.reduce(visitLayer);
    }

    return conflicts;
}

function findType2Conflicts(g, layering) {
    const conflicts = {};

    function scan(south, southPos, southEnd, prevNorthBorder, nextNorthBorder) {
        let v;
        util.range(southPos, southEnd).forEach(i => {
            v = south[i];
            if (g.node(v).dummy) {
                g.predecessors(v).forEach(u => {
                    const uNode = g.node(u);
                    if (
                        uNode.dummy &&
                        (uNode.order < prevNorthBorder || uNode.order > nextNorthBorder)
                    ) {
                        addConflict(conflicts, u, v);
                    }
                });
            }
        });
    }

    function visitLayer(north, south) {
        let prevNorthPos = -1;
        let nextNorthPos;
        let southPos = 0;

        south.forEach((v, southLookahead) => {
            if (g.node(v).dummy === "border") {
                const predecessors = g.predecessors(v);
                if (predecessors.length) {
                    nextNorthPos = g.node(predecessors[0]).order;
                    scan(south, southPos, southLookahead, prevNorthPos, nextNorthPos);
                    southPos = southLookahead;
                    prevNorthPos = nextNorthPos;
                }
            }
            scan(south, southPos, south.length, nextNorthPos, north.length);
        });

        return south;
    }

    if (layering.length) {
        layering.reduce(visitLayer);
    }

    return conflicts;
}

function findOtherInnerSegmentNode(g, v) {
    if (g.node(v).dummy) {
        return g.predecessors(v).find(u => g.node(u).dummy);
    }
}

function addConflict(conflicts, v, w) {
    if (v > w) {
        const tmp = v;
        v = w;
        w = tmp;
    }

    let conflictsV = conflicts[v];
    if (!conflictsV) {
        conflicts[v] = conflictsV = {};
    }
    conflictsV[w] = true;
}

function hasConflict(conflicts, v, w) {
    if (v > w) {
        const tmp = v;
        v = w;
        w = tmp;
    }
    return !!conflicts[v] && Object.hasOwn(conflicts[v], w);
}

/*
 * Try to align nodes into vertical "blocks" where possible. This algorithm
 * attempts to align a node with one of its median neighbors. If the edge
 * connecting a neighbor is a type-1 conflict then we ignore that possibility.
 * If a previous node has already formed a block with a node after the node
 * we're trying to form a block with, we also ignore that possibility - our
 * blocks would be split in that scenario.
 */
function verticalAlignment(g, layering, conflicts, neighborFn) {
    const root = {};
    const align = {};
    const pos = {};

    // Cache positions based on layering
    layering.forEach(layer => {
        layer.forEach((v, order) => {
            root[v] = v;
            align[v] = v;
            pos[v] = order;
        });
    });

    layering.forEach(layer => {
        let prevIdx = -1;
        layer.forEach(v => {
            let ws = neighborFn(v);
            if (ws.length) {
                ws = ws.sort((a, b) => pos[a] - pos[b]);
                const mp = (ws.length - 1) / 2;
                for (let i = Math.floor(mp), il = Math.ceil(mp); i <= il; ++i) {
                    const w = ws[i];
                    if (
                        align[v] === v &&
                        prevIdx < pos[w] &&
                        !hasConflict(conflicts, v, w)
                    ) {
                        align[w] = v;
                        align[v] = root[v] = root[w];
                        prevIdx = pos[w];
                    }
                }
            }
        });
    });

    return { root, align };
}

function horizontalCompaction(g, layering, root, align, reverseSep) {
    const xs = {};
    const blockG = buildBlockGraph(g, layering, root, reverseSep);
    const borderType = reverseSep ? "borderLeft" : "borderRight";

    function iterate(setXsFunc, nextNodesFunc) {
        const stack = blockG.nodes().slice();
        const visited = {};
        let elem = stack.pop();

        while (elem) {
            if (visited[elem]) {
                setXsFunc(elem);
            } else {
                visited[elem] = true;
                stack.push(elem);
                for (const nextElem of nextNodesFunc(elem)) {
                    stack.push(nextElem);
                }
            }

            elem = stack.pop();
        }
    }

    // First pass: smallest coordinates
    function pass1(elem) {
        xs[elem] = blockG.inEdges(elem).reduce((acc, e) => {
            return Math.max(acc, xs[e.v] + blockG.edge(e));
        }, 0);
    }

    // Second pass: largest coordinates
    function pass2(elem) {
        const min = blockG.outEdges(elem).reduce((acc, e) => {
            return Math.min(acc, xs[e.w] - blockG.edge(e));
        }, Number.POSITIVE_INFINITY);

        const node = g.node(elem);
        if (min !== Number.POSITIVE_INFINITY && node.borderType !== borderType) {
            xs[elem] = Math.max(xs[elem], min);
        }
    }

    iterate(pass1, blockG.predecessors.bind(blockG));
    iterate(pass2, blockG.successors.bind(blockG));

    // Assign x coordinates to all nodes
    Object.keys(align).forEach(v => {
        xs[v] = xs[root[v]];
    });

    return xs;
}

function buildBlockGraph(g, layering, root, reverseSep) {
    const blockGraph = new (g.constructor)();
    const graphLabel = g.graph();
    const sepFn = sep(graphLabel.nodesep, graphLabel.edgesep, reverseSep);

    layering.forEach(layer => {
        let u;
        layer.forEach(v => {
            const vRoot = root[v];
            blockGraph.setNode(vRoot);
            if (u) {
                const uRoot = root[u];
                const prevMax = blockGraph.edge(uRoot, vRoot);
                blockGraph.setEdge(
                    uRoot,
                    vRoot,
                    Math.max(sepFn(g, v, u), prevMax || 0)
                );
            }
            u = v;
        });
    });

    return blockGraph;
}

/*
 * Returns the alignment that has the smallest width of the given alignments.
 */
function findSmallestWidthAlignment(g, xss) {
    return Object.values(xss).reduce(
        (currentMinAndXs, xs) => {
            let max = Number.NEGATIVE_INFINITY;
            let min = Number.POSITIVE_INFINITY;

            Object.entries(xs).forEach(([v, x]) => {
                const halfWidth = width(g, v) / 2;
                max = Math.max(x + halfWidth, max);
                min = Math.min(x - halfWidth, min);
            });

            const newMin = max - min;
            if (newMin < currentMinAndXs[0]) {
                currentMinAndXs = [newMin, xs];
            }
            return currentMinAndXs;
        },
        [Number.POSITIVE_INFINITY, null]
    )[1];
}

/*
 * Align the coordinates of each of the layout alignments such that
 * left-biased alignments have their minimum coordinate at the same point as
 * the minimum coordinate of the smallest width alignment and right-biased
 * alignments have their maximum coordinate at the same point as the maximum
 * coordinate of the smallest width alignment.
 */
function alignCoordinates(xss, alignTo) {
    const alignToVals = Object.values(alignTo);
    const alignToMin = util.applyWithChunking(Math.min, alignToVals);
    const alignToMax = util.applyWithChunking(Math.max, alignToVals);

    ["u", "d"].forEach(vert => {
        ["l", "r"].forEach(horiz => {
            const alignment = vert + horiz;
            let xs = xss[alignment];

            if (xs === alignTo) return;

            const xsVals = Object.values(xs);
            let delta = alignToMin - util.applyWithChunking(Math.min, xsVals);
            if (horiz !== "l") {
                delta = alignToMax - util.applyWithChunking(Math.max, xsVals);
            }

            if (delta) {
                xs = util.mapValues(xs, x => x + delta);
                xss[alignment] = xs;
            }
        });
    });
}

function balance(xss, align) {
    return util.mapValues(xss.ul, (num, v) => {
        if (align) {
            return xss[align.toLowerCase()][v];
        }

        const xs = Object.values(xss)
            .map(xsMap => xsMap[v])
            .sort((a, b) => a - b);

        return (xs[1] + xs[2]) / 2;
    });
}

function positionX(g) {
    const layering = util.buildLayerMatrix(g);
    const conflicts = Object.assign(
        findType1Conflicts(g, layering),
        findType2Conflicts(g, layering)
    );

    const xss = {};
    let adjustedLayering;

    ["u", "d"].forEach(vert => {
        adjustedLayering =
            vert === "u" ? layering : Object.values(layering).reverse();

        ["l", "r"].forEach(horiz => {
            let localLayering = adjustedLayering;

            if (horiz === "r") {
                localLayering = localLayering.map(inner =>
                    Object.values(inner).reverse()
                );
            }

            const neighborFn = (vert === "u"
                ? g.predecessors
                : g.successors
            ).bind(g);

            const align = verticalAlignment(
                g,
                localLayering,
                conflicts,
                neighborFn
            );

            let xs = horizontalCompaction(
                g,
                localLayering,
                align.root,
                align.align,
                horiz === "r"
            );

            if (horiz === "r") {
                xs = util.mapValues(xs, x => -x);
            }

            xss[vert + horiz] = xs;
        });
    });

    const smallestWidth = findSmallestWidthAlignment(g, xss);
    alignCoordinates(xss, smallestWidth);
    return balance(xss, g.graph().align);
}

function sep(nodeSep, edgeSep, reverseSep) {
    return (g, v, w) => {
        const vLabel = g.node(v);
        const wLabel = g.node(w);
        let sum = 0;
        let delta;

        sum += vLabel.width / 2;
        if (Object.hasOwn(vLabel, "labelpos")) {
            switch (vLabel.labelpos.toLowerCase()) {
                case "l":
                    delta = -vLabel.width / 2;
                    break;
                case "r":
                    delta = vLabel.width / 2;
                    break;
            }
        }
        if (delta) {
            sum += reverseSep ? delta : -delta;
        }
        delta = 0;

        sum += (vLabel.dummy ? edgeSep : nodeSep) / 2;
        sum += (wLabel.dummy ? edgeSep : nodeSep) / 2;

        sum += wLabel.width / 2;
        if (Object.hasOwn(wLabel, "labelpos")) {
            switch (wLabel.labelpos.toLowerCase()) {
                case "l":
                    delta = wLabel.width / 2;
                    break;
                case "r":
                    delta = -wLabel.width / 2;
                    break;
            }
        }
        if (delta) {
            sum += reverseSep ? delta : -delta;
        }
        delta = 0;

        return sum;
    };
}

function width(g, v) {
    return g.node(v).width;
}

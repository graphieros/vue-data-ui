export default function parentDummyChains(graph) {
    const postorderNumbers = computePostorder(graph);

    graph.graph().dummyChains.forEach(startNodeId => {
        let node = graph.node(startNodeId);
        const edgeObject = node.edgeObj;

        const pathData = findPath(graph, postorderNumbers, edgeObject.v, edgeObject.w);
        const path = pathData.path;
        const lowestCommonAncestor = pathData.lca;

        let pathIndex = 0;
        let pathNodeId = path[pathIndex];
        let ascending = true;

        let currentNodeId = startNodeId;

        while (currentNodeId !== edgeObject.w) {
            node = graph.node(currentNodeId);

            if (ascending) {
                while (
                    (pathNodeId = path[pathIndex]) !== lowestCommonAncestor &&
                    graph.node(pathNodeId).maxRank < node.rank
                ) {
                    pathIndex++;
                }

                if (pathNodeId === lowestCommonAncestor) {
                    ascending = false;
                }
            }

            if (!ascending) {
                while (
                    pathIndex < path.length - 1 &&
                    graph.node((pathNodeId = path[pathIndex + 1])).minRank <= node.rank
                ) {
                    pathIndex++;
                }

                pathNodeId = path[pathIndex];
            }

            graph.setParent(currentNodeId, pathNodeId);
            currentNodeId = graph.successors(currentNodeId)[0];
        }
    });
}

// Find a path from v to w through the lowest common ancestor (LCA).
// Return the full path and the LCA.
function findPath(graph, postorderNumbers, v, w) {
    const vPath = [];
    const wPath = [];

    const low = Math.min(postorderNumbers[v].low, postorderNumbers[w].low);
    const limit = Math.max(postorderNumbers[v].lim, postorderNumbers[w].lim);

    let parent;
    let lowestCommonAncestor;

    // Traverse up from v to find the LCA.
    parent = v;
    do {
        parent = graph.parent(parent);
        vPath.push(parent);
    } while (parent && (postorderNumbers[parent].low > low || limit > postorderNumbers[parent].lim));

    lowestCommonAncestor = parent;

    // Traverse from w to the LCA.
    parent = w;
    while ((parent = graph.parent(parent)) !== lowestCommonAncestor) {
        wPath.push(parent);
    }

    return {
        path: vPath.concat(wPath.reverse()),
        lca: lowestCommonAncestor,
    };
}

function computePostorder(graph) {
    const result = {};
    let limit = 0;

    function depthFirstSearch(nodeId) {
        const low = limit;
        graph.children(nodeId).forEach(depthFirstSearch);
        result[nodeId] = { low, lim: limit++ };
    }

    graph.children().forEach(depthFirstSearch);

    return result;
}

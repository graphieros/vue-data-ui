const DEFAULT_EDGE_NAME = "\x00";
const GRAPH_NODE = "\x00";
const EDGE_KEY_DELIM = "\x01";

// Implementation notes:
//
//  * Node id query functions should return string ids for the nodes
//  * Edge id query functions should return an "edgeObj", edge object, that is
//    composed of enough information to uniquely identify an edge: {v, w, name}.
//  * Internally we use an "edgeId", a stringified form of the edgeObj, to
//    reference edges. This is because we need a performant way to look these
//    edges up and, object properties, which have string keys, are the closest
//    we're going to get to a performant hashtable in JavaScript.

class Graph {
    _isDirected = true;
    _isMultigraph = false;
    _isCompound = false;

    // Label for the graph itself
    _label;

    // Defaults to be set when creating a new node
    _defaultNodeLabelFn = () => undefined;

    // Defaults to be set when creating a new edge
    _defaultEdgeLabelFn = () => undefined;

    // v -> label
    _nodes = {};

    // v -> edgeObj
    _in = {};

    // u -> v -> Number
    _preds = {};

    // v -> edgeObj
    _out = {};

    // v -> w -> Number
    _sucs = {};

    // e -> edgeObj
    _edgeObjs = {};

    // e -> label
    _edgeLabels = {};

    /* Number of nodes in the graph. Should only be changed by the implementation. */
    _nodeCount = 0;

    /* Number of edges in the graph. Should only be changed by the implementation. */
    _edgeCount = 0;

    _parent;

    _children;

    constructor(opts) {
        if (opts) {
            this._isDirected = Object.hasOwn(opts, "directed") ? opts.directed : true;
            this._isMultigraph = Object.hasOwn(opts, "multigraph") ? opts.multigraph : false;
            this._isCompound = Object.hasOwn(opts, "compound") ? opts.compound : false;
        }

        if (this._isCompound) {
            // v -> parent
            this._parent = {};

            // v -> children
            this._children = {};
            this._children[GRAPH_NODE] = {};
        }
    }

    /* === Graph functions ========= */

    /**
     * Whether graph was created with 'directed' flag set to true or not.
     */
    isDirected() {
        return this._isDirected;
    }

    /**
     * Whether graph was created with 'multigraph' flag set to true or not.
     */
    isMultigraph() {
        return this._isMultigraph;
    }

    /**
     * Whether graph was created with 'compound' flag set to true or not.
     */
    isCompound() {
        return this._isCompound;
    }

    /**
     * Sets the label of the graph.
     */
    setGraph(label) {
        this._label = label;
        return this;
    }

    /**
     * Gets the graph label.
     */
    graph() {
        return this._label;
    }


    /* === Node functions ========== */

    /**
     * Sets the default node label. If newDefault is a function, it will be
     * invoked each time when setting a label for a node. Otherwise, this label
     * will be assigned as default label in case if no label was specified while
     * setting a node.
     * Complexity: O(1).
     */
    setDefaultNodeLabel(newDefault) {
        this._defaultNodeLabelFn = newDefault;
        if (typeof newDefault !== "function") {
            this._defaultNodeLabelFn = () => newDefault;
        }

        return this;
    }

    /**
     * Gets the number of nodes in the graph.
     * Complexity: O(1).
     */
    nodeCount() {
        return this._nodeCount;
    }

    /**
     * Gets all nodes of the graph. Note, the in case of compound graph subnodes are
     * not included in list.
     * Complexity: O(1).
     */
    nodes() {
        return Object.keys(this._nodes);
    }

    /**
     * Gets list of nodes without in-edges.
     * Complexity: O(|V|).
     */
    sources() {
        const self = this;
        return this.nodes().filter(v => Object.keys(self._in[v]).length === 0);
    }

    /**
     * Gets list of nodes without out-edges.
     * Complexity: O(|V|).
     */
    sinks() {
        const self = this;
        return this.nodes().filter(v => Object.keys(self._out[v]).length === 0);
    }

    /**
     * Invokes setNode method for each node in names list.
     * Complexity: O(|names|).
     */
    setNodes(nodeIds, value) {
        const args = arguments;
        const self = this;
        nodeIds.forEach(nodeId => {
            if (args.length > 1) {
                self.setNode(nodeId, value);
            } else {
                self.setNode(nodeId);
            }
        });
        return this;
    }

    /**
     * Creates or updates the value for the node v in the graph. If value is supplied
     * it is set as the value for the node. If value is not supplied and the node was
     * created by this call then the default node label will be assigned.
     * Complexity: O(1).
     */
    setNode(nodeId, value) {
        if (Object.hasOwn(this._nodes, nodeId)) {
            if (arguments.length > 1) {
                this._nodes[nodeId] = value;
            }
            return this;
        }

        this._nodes[nodeId] = arguments.length > 1 ? value : this._defaultNodeLabelFn(nodeId);
        if (this._isCompound) {
            this._parent[nodeId] = GRAPH_NODE;
            this._children[nodeId] = {};
            this._children[GRAPH_NODE][nodeId] = true;
        }
        this._in[nodeId] = {};
        this._preds[nodeId] = {};
        this._out[nodeId] = {};
        this._sucs[nodeId] = {};
        ++this._nodeCount;
        return this;
    }

    /**
     * Gets the label of node with specified name.
     * Complexity: O(1).
     */
    node(nodeId) {
        return this._nodes[nodeId];
    }

    /**
     * Detects whether graph has a node with specified name or not.
     */
    hasNode(nodeId) {
        return Object.hasOwn(this._nodes, nodeId);
    }

    /**
     * Remove the node with the name from the graph or do nothing if the node is not in
     * the graph. If the node was removed this function also removes any incident
     * edges.
     * Complexity: O(1).
     */
    removeNode(nodeId) {
        const self = this;
        if (Object.hasOwn(this._nodes, nodeId)) {
            const removeEdge = edgeId => self.removeEdge(self._edgeObjs[edgeId]);
            delete this._nodes[nodeId];
            if (this._isCompound) {
                this._removeFromParentsChildList(nodeId);
                delete this._parent[nodeId];
                this.children(nodeId).forEach(child => {
                    self.setParent(child);
                });
                delete this._children[nodeId];
            }
            Object.keys(this._in[nodeId]).forEach(removeEdge);
            delete this._in[nodeId];
            delete this._preds[nodeId];
            Object.keys(this._out[nodeId]).forEach(removeEdge);
            delete this._out[nodeId];
            delete this._sucs[nodeId];
            --this._nodeCount;
        }
        return this;
    }

    /**
     * Sets node parentId as a parent for node nodeId if it is defined, or removes the
     * parent for nodeId if parentId is undefined. Method throws an exception in case of
     * invoking it in context of noncompound graph.
     * Average-case complexity: O(1).
     */
    setParent(nodeId, parentId) {
        if (!this._isCompound) {
            throw new Error("Cannot set parent in a non-compound graph");
        }

        if (parentId === undefined) {
            parentId = GRAPH_NODE;
        } else {
            parentId += "";
            for (let ancestor = parentId; ancestor !== undefined; ancestor = this.parent(ancestor)) {
                if (ancestor === nodeId) {
                    throw new Error(
                        "Setting " + parentId + " as parent of " + nodeId + " would create a cycle",
                    );
                }
            }

            this.setNode(parentId);
        }

        this.setNode(nodeId);
        this._removeFromParentsChildList(nodeId);
        this._parent[nodeId] = parentId;
        this._children[parentId][nodeId] = true;
        return this;
    }

    _removeFromParentsChildList(nodeId) {
        delete this._children[this._parent[nodeId]][nodeId];
    }

    /**
     * Gets parent node for node nodeId.
     * Complexity: O(1).
     */
    parent(nodeId) {
        if (this._isCompound) {
            const parentId = this._parent[nodeId];
            if (parentId !== GRAPH_NODE) {
                return parentId;
            }
        }
    }

    /**
     * Gets list of direct children of node nodeId.
     * Complexity: O(1).
     */
    children(nodeId = GRAPH_NODE) {
        if (this._isCompound) {
            const children = this._children[nodeId];
            if (children) {
                return Object.keys(children);
            }
        } else if (nodeId === GRAPH_NODE) {
            return this.nodes();
        } else if (this.hasNode(nodeId)) {
            return [];
        }
    }

    /**
     * Return all nodes that are predecessors of the specified node or undefined if nodeId is not in
     * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
     * Complexity: O(|V|).
     */
    predecessors(nodeId) {
        const predecessorsForNode = this._preds[nodeId];
        if (predecessorsForNode) {
            return Object.keys(predecessorsForNode);
        }
    }

    /**
     * Return all nodes that are successors of the specified node or undefined if nodeId is not in
     * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
     * Complexity: O(|V|).
     */
    successors(nodeId) {
        const successorsForNode = this._sucs[nodeId];
        if (successorsForNode) {
            return Object.keys(successorsForNode);
        }
    }

    /**
     * Return all nodes that are predecessors or successors of the specified node or undefined if
     * nodeId is not in the graph.
     * Complexity: O(|V|).
     */
    neighbors(nodeId) {
        const predecessorsForNode = this.predecessors(nodeId);
        if (predecessorsForNode) {
            const neighborsSet = new Set(predecessorsForNode);
            for (const successor of this.successors(nodeId)) {
                neighborsSet.add(successor);
            }

            return Array.from(neighborsSet.values());
        }
    }

    isLeaf(nodeId) {
        let neighbors;
        if (this.isDirected()) {
            neighbors = this.successors(nodeId);
        } else {
            neighbors = this.neighbors(nodeId);
        }
        return neighbors.length === 0;
    }

    /**
     * Creates new graph with nodes filtered via filter. Edges incident to rejected node
     * are also removed. In case of compound graph, if parent is rejected by filter,
     * then all its children are rejected too.
     * Average-case complexity: O(|E|+|V|).
     */
    filterNodes(filter) {
        const copy = new this.constructor({
            directed: this._isDirected,
            multigraph: this._isMultigraph,
            compound: this._isCompound,
        });

        copy.setGraph(this.graph());

        const self = this;
        Object.entries(this._nodes).forEach(([nodeId, value]) => {
            if (filter(nodeId)) {
                copy.setNode(nodeId, value);
            }
        });

        Object.values(this._edgeObjs).forEach(edgeObject => {
            if (copy.hasNode(edgeObject.v) && copy.hasNode(edgeObject.w)) {
                copy.setEdge(edgeObject, self.edge(edgeObject));
            }
        });

        const parents = {};
        function findParent(nodeId) {
            const parentId = self.parent(nodeId);
            if (parentId === undefined || copy.hasNode(parentId)) {
                parents[nodeId] = parentId;
                return parentId;
            } else if (parentId in parents) {
                return parents[parentId];
            } else {
                return findParent(parentId);
            }
        }

        if (this._isCompound) {
            copy.nodes().forEach(nodeId => copy.setParent(nodeId, findParent(nodeId)));
        }

        return copy;
    }

    /* === Edge functions ========== */

    /**
     * Sets the default edge label or factory function. This label will be
     * assigned as default label in case if no label was specified while setting
     * an edge or this function will be invoked each time when setting an edge
     * with no label specified and returned value will be used as a label for edge.
     * Complexity: O(1).
     */
    setDefaultEdgeLabel(newDefault) {
        this._defaultEdgeLabelFn = newDefault;
        if (typeof newDefault !== "function") {
            this._defaultEdgeLabelFn = () => newDefault;
        }

        return this;
    }

    /**
     * Gets the number of edges in the graph.
     * Complexity: O(1).
     */
    edgeCount() {
        return this._edgeCount;
    }

    /**
     * Gets edges of the graph. In case of compound graph subgraphs are not considered.
     * Complexity: O(|E|).
     */
    edges() {
        return Object.values(this._edgeObjs);
    }

    /**
     * Establish an edges path over the nodes in nodeIds list. If some edge already
     * exists, it will update its label, otherwise it will create an edge between pair
     * of nodes with label provided or default label if no label provided.
     * Complexity: O(|nodeIds|).
     */
    setPath(nodeIds, value) {
        const self = this;
        const args = arguments;
        nodeIds.reduce((from, to) => {
            if (args.length > 1) {
                self.setEdge(from, to, value);
            } else {
                self.setEdge(from, to);
            }
            return to;
        });
        return this;
    }

    /**
     * Creates or updates the label for the edge (v, w) with the optionally supplied
     * name. If value is supplied it is set as the value for the edge. If value is not
     * supplied and the edge was created by this call then the default edge label will
     * be assigned. The name parameter is only useful with multigraphs.
     */
    setEdge() {
        let v;
        let w;
        let name;
        let value;
        let valueSpecified = false;
        const arg0 = arguments[0];

        if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
            v = arg0.v;
            w = arg0.w;
            name = arg0.name;
            if (arguments.length === 2) {
                value = arguments[1];
                valueSpecified = true;
            }
        } else {
            v = arg0;
            w = arguments[1];
            name = arguments[3];
            if (arguments.length > 2) {
                value = arguments[2];
                valueSpecified = true;
            }
        }

        v = "" + v;
        w = "" + w;
        if (name !== undefined) {
            name = "" + name;
        }

        let edgeId = edgeArgsToId(this._isDirected, v, w, name);
        if (Object.hasOwn(this._edgeLabels, edgeId)) {
            if (valueSpecified) {
                this._edgeLabels[edgeId] = value;
            }
            return this;
        }

        if (name !== undefined && !this._isMultigraph) {
            throw new Error("Cannot set a named edge when isMultigraph = false");
        }

        this.setNode(v);
        this.setNode(w);

        this._edgeLabels[edgeId] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);

        const edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
        v = edgeObj.v;
        w = edgeObj.w;

        Object.freeze(edgeObj);
        this._edgeObjs[edgeId] = edgeObj;
        incrementOrInitEntry(this._preds[w], v);
        incrementOrInitEntry(this._sucs[v], w);
        this._in[w][edgeId] = edgeObj;
        this._out[v][edgeId] = edgeObj;
        this._edgeCount++;
        return this;
    }

    /**
     * Gets the label for the specified edge.
     * Complexity: O(1).
     */
    edge(v, w, name) {
        const edgeId =
            arguments.length === 1
                ? edgeObjToId(this._isDirected, arguments[0])
                : edgeArgsToId(this._isDirected, v, w, name);
        return this._edgeLabels[edgeId];
    }

    /**
     * Gets the label for the specified edge and converts it to an object.
     * Complexity: O(1)
     */
    edgeAsObj() {
        const edge = this.edge(...arguments);
        if (typeof edge !== "object") {
            return { label: edge };
        }

        return edge;
    }

    /**
     * Detects whether the graph contains specified edge or not. No subgraphs are considered.
     * Complexity: O(1).
     */
    hasEdge(v, w, name) {
        const edgeId =
            arguments.length === 1
                ? edgeObjToId(this._isDirected, arguments[0])
                : edgeArgsToId(this._isDirected, v, w, name);
        return Object.hasOwn(this._edgeLabels, edgeId);
    }

    /**
     * Removes the specified edge from the graph. No subgraphs are considered.
     * Complexity: O(1).
     */
    removeEdge(v, w, name) {
        const edgeId =
            arguments.length === 1
                ? edgeObjToId(this._isDirected, arguments[0])
                : edgeArgsToId(this._isDirected, v, w, name);
        const edge = this._edgeObjs[edgeId];
        if (edge) {
            v = edge.v;
            w = edge.w;
            delete this._edgeLabels[edgeId];
            delete this._edgeObjs[edgeId];
            decrementOrRemoveEntry(this._preds[w], v);
            decrementOrRemoveEntry(this._sucs[v], w);
            delete this._in[w][edgeId];
            delete this._out[v][edgeId];
            this._edgeCount--;
        }
        return this;
    }

    /**
     * Return all edges that point to the node v. Optionally filters those edges down to just those
     * coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead.
     * Complexity: O(|E|).
     */
    inEdges(nodeId, fromNodeId) {
        const inForNode = this._in[nodeId];
        if (inForNode) {
            const edges = Object.values(inForNode);
            if (!fromNodeId) {
                return edges;
            }
            return edges.filter(edge => edge.v === fromNodeId);
        }
    }

    /**
     * Return all edges that are pointed at by node v. Optionally filters those edges down to just
     * those pointing to w. Behavior is undefined for undirected graphs - use nodeEdges instead.
     * Complexity: O(|E|).
     */
    outEdges(nodeId, toNodeId) {
        const outForNode = this._out[nodeId];
        if (outForNode) {
            const edges = Object.values(outForNode);
            if (!toNodeId) {
                return edges;
            }
            return edges.filter(edge => edge.w === toNodeId);
        }
    }

    /**
     * Returns all edges to or from node v regardless of direction. Optionally filters those edges
     * down to just those between nodes v and w regardless of direction.
     * Complexity: O(|E|).
     */
    nodeEdges(nodeId, otherNodeId) {
        const inEdges = this.inEdges(nodeId, otherNodeId);
        if (inEdges) {
            return inEdges.concat(this.outEdges(nodeId, otherNodeId));
        }
    }
}

function incrementOrInitEntry(map, key) {
    if (map[key]) {
        map[key]++;
    } else {
        map[key] = 1;
    }
}

function decrementOrRemoveEntry(map, key) {
    if (!--map[key]) {
        delete map[key];
    }
}

function edgeArgsToId(isDirected, v_, w_, name) {
    let v = "" + v_;
    let w = "" + w_;
    if (!isDirected && v > w) {
        const tmp = v;
        v = w;
        w = tmp;
    }
    return (
        v +
        EDGE_KEY_DELIM +
        w +
        EDGE_KEY_DELIM +
        (name === undefined ? DEFAULT_EDGE_NAME : name)
    );
}

function edgeArgsToObj(isDirected, v_, w_, name) {
    let v = "" + v_;
    let w = "" + w_;
    if (!isDirected && v > w) {
        const tmp = v;
        v = w;
        w = tmp;
    }
    const edgeObj = { v, w };
    if (name) {
        edgeObj.name = name;
    }
    return edgeObj;
}

function edgeObjToId(isDirected, edgeObj) {
    return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}

export default Graph;
export { Graph };

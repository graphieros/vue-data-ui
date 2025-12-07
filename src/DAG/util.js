import Graph from "./graph.js";

export {
  addBorderNode,
  addDummyNode,
  applyWithChunking,
  asNonCompoundGraph,
  buildLayerMatrix,
  intersectRect,
  mapValues,
  maxRank,
  normalizeRanks,
  notime,
  partition,
  pick,
  predecessorWeights,
  range,
  removeEmptyRanks,
  simplify,
  successorWeights,
  time,
  uniqueId,
  zipObject,
};

function addDummyNode(graph, type, attributes, name) {
  let nodeId = name;
  while (graph.hasNode(nodeId)) {
    nodeId = uniqueId(name);
  }

  attributes.dummy = type;
  graph.setNode(nodeId, attributes);
  return nodeId;
}

function simplify(graph) {
  const simplified = new Graph().setGraph(graph.graph());

  graph.nodes().forEach(nodeId => {
    simplified.setNode(nodeId, graph.node(nodeId));
  });

  graph.edges().forEach(edge => {
    const simpleLabel = simplified.edge(edge.v, edge.w) || { weight: 0, minlen: 1 };
    const label = graph.edge(edge);

    simplified.setEdge(edge.v, edge.w, {
      weight: simpleLabel.weight + label.weight,
      minlen: Math.max(simpleLabel.minlen, label.minlen),
    });
  });

  return simplified;
}

function asNonCompoundGraph(graph) {
  const simplified = new Graph({ multigraph: graph.isMultigraph() }).setGraph(graph.graph());

  graph.nodes().forEach(nodeId => {
    if (!graph.children(nodeId).length) {
      simplified.setNode(nodeId, graph.node(nodeId));
    }
  });

  graph.edges().forEach(edge => {
    simplified.setEdge(edge, graph.edge(edge));
  });

  return simplified;
}

function successorWeights(graph) {
  const weightMap = graph.nodes().map(nodeId => {
    const successors = {};
    graph.outEdges(nodeId).forEach(edge => {
      successors[edge.w] = (successors[edge.w] || 0) + graph.edge(edge).weight;
    });
    return successors;
  });

  return zipObject(graph.nodes(), weightMap);
}

function predecessorWeights(graph) {
  const weightMap = graph.nodes().map(nodeId => {
    const predecessors = {};
    graph.inEdges(nodeId).forEach(edge => {
      predecessors[edge.v] = (predecessors[edge.v] || 0) + graph.edge(edge).weight;
    });
    return predecessors;
  });

  return zipObject(graph.nodes(), weightMap);
}

function intersectRect(rectangle, point) {
  let x = rectangle.x;
  let y = rectangle.y;

  const deltaX = point.x - x;
  const deltaY = point.y - y;
  let halfWidth = rectangle.width / 2;
  let halfHeight = rectangle.height / 2;

  if (!deltaX && !deltaY) {
    throw new Error("Not possible to find intersection inside of the rectangle");
  }

  let shiftedX;
  let shiftedY;

  if (Math.abs(deltaY) * halfWidth > Math.abs(deltaX) * halfHeight) {
    if (deltaY < 0) {
      halfHeight = -halfHeight;
    }
    shiftedX = (halfHeight * deltaX) / deltaY;
    shiftedY = halfHeight;
  } else {
    if (deltaX < 0) {
      halfWidth = -halfWidth;
    }
    shiftedX = halfWidth;
    shiftedY = (halfWidth * deltaY) / deltaX;
  }

  return { x: x + shiftedX, y: y + shiftedY };
}

function buildLayerMatrix(graph) {
  const layering = range(maxRank(graph) + 1).map(() => []);

  graph.nodes().forEach(nodeId => {
    const node = graph.node(nodeId);
    const rank = node.rank;

    if (rank !== undefined) {
      layering[rank][node.order] = nodeId;
    }
  });

  return layering;
}

function normalizeRanks(graph) {
  const nodeRanks = graph.nodes().map(nodeId => {
    const rank = graph.node(nodeId).rank;
    if (rank === undefined) {
      return Number.MAX_VALUE;
    }
    return rank;
  });

  const minimumRank = applyWithChunking(Math.min, nodeRanks);

  graph.nodes().forEach(nodeId => {
    const node = graph.node(nodeId);
    if (Object.hasOwn(node, "rank")) {
      node.rank -= minimumRank;
    }
  });
}

function removeEmptyRanks(graph) {
  const nodeRanks = graph
    .nodes()
    .map(nodeId => graph.node(nodeId).rank)
    .filter(rank => rank !== undefined);

  const offset = applyWithChunking(Math.min, nodeRanks);

  const layers = [];
  graph.nodes().forEach(nodeId => {
    const rank = graph.node(nodeId).rank - offset;
    if (!layers[rank]) {
      layers[rank] = [];
    }
    layers[rank].push(nodeId);
  });

  let delta = 0;
  const nodeRankFactor = graph.graph().nodeRankFactor;

  Array.from(layers).forEach((nodesInLayer, index) => {
    if (nodesInLayer === undefined && index % nodeRankFactor !== 0) {
      --delta;
    } else if (nodesInLayer !== undefined && delta) {
      nodesInLayer.forEach(nodeId => {
        graph.node(nodeId).rank += delta;
      });
    }
  });
}

function addBorderNode(graph, prefix, rank, order) {
  const node = {
    width: 0,
    height: 0,
  };

  if (arguments.length >= 4) {
    node.rank = rank;
    node.order = order;
  }

  return addDummyNode(graph, "border", node, prefix);
}

const CHUNKING_THRESHOLD = 65535;

function splitToChunks(array, chunkSize = CHUNKING_THRESHOLD) {
  const chunks = [];
  for (let index = 0; index < array.length; index += chunkSize) {
    const chunk = array.slice(index, index + chunkSize);
    chunks.push(chunk);
  }
  return chunks;
}

function applyWithChunking(fn, argsArray) {
  if (argsArray.length > CHUNKING_THRESHOLD) {
    const chunks = splitToChunks(argsArray);
    return fn.apply(
      null,
      chunks.map(chunk => fn.apply(null, chunk)),
    );
  } else {
    return fn.apply(null, argsArray);
  }
}

function maxRank(graph) {
  const nodes = graph.nodes();
  const nodeRanks = nodes.map(nodeId => {
    const rank = graph.node(nodeId).rank;
    if (rank === undefined) {
      return Number.MIN_VALUE;
    }
    return rank;
  });

  return applyWithChunking(Math.max, nodeRanks);
}

function partition(collection, predicate) {
  const result = { lhs: [], rhs: [] };

  collection.forEach(value => {
    if (predicate(value)) {
      result.lhs.push(value);
    } else {
      result.rhs.push(value);
    }
  });

  return result;
}

function time(name, fn) {
  const start = Date.now();
  try {
    return fn();
  } finally {
    console.log(name + " time: " + (Date.now() - start) + "ms");
  }
}

function notime(_name, fn) {
  return fn();
}

let idCounter = 0;
function uniqueId(prefix) {
  const id = ++idCounter;
  return prefix + String(id);
}

function range(start, limit, step = 1) {
  if (limit == null) {
    limit = start;
    start = 0;
  }

  let endCondition = index => index < limit;
  if (step < 0) {
    endCondition = index => limit < index;
  }

  const result = [];
  for (let index = start; endCondition(index); index += step) {
    result.push(index);
  }

  return result;
}

function pick(source, keys) {
  const destination = {};
  for (const key of keys) {
    if (source[key] !== undefined) {
      destination[key] = source[key];
    }
  }

  return destination;
}

function mapValues(object, funcOrProperty) {
  let mapper = funcOrProperty;

  if (typeof funcOrProperty === "string") {
    const propertyName = funcOrProperty;
    mapper = value => value[propertyName];
  }

  return Object.entries(object).reduce((accumulator, [key, value]) => {
    accumulator[key] = mapper(value, key);
    return accumulator;
  }, {});
}

function zipObject(properties, values) {
  return properties.reduce((accumulator, key, index) => {
    accumulator[key] = values[index];
    return accumulator;
  }, {});
}

export default {
  addBorderNode,
  addDummyNode,
  applyWithChunking,
  asNonCompoundGraph,
  buildLayerMatrix,
  intersectRect,
  mapValues,
  maxRank,
  normalizeRanks,
  notime,
  partition,
  pick,
  predecessorWeights,
  range,
  removeEmptyRanks,
  simplify,
  successorWeights,
  time,
  uniqueId,
  zipObject,
};

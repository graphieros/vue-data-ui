export default function barycenter(g, movable = []) {
    return movable.map(v => {
        const inEdges = g.inEdges(v);

        if (!inEdges.length) {
            return { v };
        }

        const result = inEdges.reduce(
            (accumulator, edgeObj) => {
                const edge = g.edge(edgeObj);
                const nodeU = g.node(edgeObj.v);

                return {
                    sum: accumulator.sum + edge.weight * nodeU.order,
                    weight: accumulator.weight + edge.weight
                };
            },
            { sum: 0, weight: 0 }
        );

        return {
            v,
            barycenter: result.sum / result.weight,
            weight: result.weight
        };
    });
}

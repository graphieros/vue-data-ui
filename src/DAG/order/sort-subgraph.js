import barycenter from "./barycenter.js";
import resolveConflicts from "./resolve-conflicts.js";
import sort from "./sort.js";

export default function sortSubgraph(g, v, cg, biasRight) {
    let movable = g.children(v);
    const node = g.node(v);
    const bl = node ? node.borderLeft : undefined;
    const br = node ? node.borderRight : undefined;
    const subgraphs = {};

    if (bl) {
        movable = movable.filter(w => w !== bl && w !== br);
    }

    const barycenters = barycenter(g, movable);

    barycenters.forEach(entry => {
        if (g.children(entry.v).length) {
            const subgraphResult = sortSubgraph(g, entry.v, cg, biasRight);
            subgraphs[entry.v] = subgraphResult;

            if (Object.hasOwn(subgraphResult, "barycenter")) {
                mergeBarycenters(entry, subgraphResult);
            }
        }
    });

    let entries = resolveConflicts(barycenters, cg);

    expandSubgraphs(entries, subgraphs);

    const result = sort(entries, biasRight);

    if (bl) {
        result.vs = [bl, result.vs, br].flat(true);

        if (g.predecessors(bl).length) {
            const blPred = g.node(g.predecessors(bl)[0]);
            const brPred = g.node(g.predecessors(br)[0]);

            if (!Object.hasOwn(result, "barycenter")) {
                result.barycenter = 0;
                result.weight = 0;
            }

            result.barycenter =
                (result.barycenter * result.weight +
                    blPred.order + brPred.order) /
                (result.weight + 2);

            result.weight += 2;
        }
    }

    return result;
}

function expandSubgraphs(entries, subgraphs) {
    entries.forEach(entry => {
        entry.vs = entry.vs.flatMap(v => {
            if (subgraphs[v]) {
                return subgraphs[v].vs;
            }
            return v;
        });
    });
}

function mergeBarycenters(target, other) {
    if (target.barycenter !== undefined) {
        target.barycenter =
            (target.barycenter * target.weight +
                other.barycenter * other.weight) /
            (target.weight + other.weight);

        target.weight += other.weight;
    } else {
        target.barycenter = other.barycenter;
        target.weight = other.weight;
    }
}

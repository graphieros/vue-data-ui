import * as util from "../util.js";

export default function sort(entries, biasRight) {
    const parts = util.partition(entries, entry => {
        return Object.hasOwn(entry, "barycenter");
    });

    const sortable = parts.lhs;
    const unsortable = parts.rhs.sort((a, b) => b.i - a.i);

    const vs = [];
    let sum = 0;
    let weight = 0;
    let vsIndex = 0;

    sortable.sort(compareWithBias(!!biasRight));

    vsIndex = consumeUnsortable(vs, unsortable, vsIndex);

    sortable.forEach(entry => {
        vsIndex += entry.vs.length;
        vs.push(entry.vs);

        sum += entry.barycenter * entry.weight;
        weight += entry.weight;

        vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
    });

    const result = { vs: vs.flat(true) };

    if (weight) {
        result.barycenter = sum / weight;
        result.weight = weight;
    }

    return result;
}

function consumeUnsortable(vs, unsortable, index) {
    let last;
    while (
        unsortable.length &&
        (last = unsortable[unsortable.length - 1]).i <= index
    ) {
        unsortable.pop();
        vs.push(last.vs);
        index++;
    }
    return index;
}

function compareWithBias(bias) {
    return (entryV, entryW) => {
        if (entryV.barycenter < entryW.barycenter) {
            return -1;
        }
        if (entryV.barycenter > entryW.barycenter) {
            return 1;
        }

        // If barycenters are equal, prefer lower-index entries
        return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
    };
}

/*
 * Simple doubly linked list implementation derived from Cormen, et al.,
 * "Introduction to Algorithms".
 */

class List {
    constructor() {
        const sentinel = {};
        sentinel._next = sentinel._prev = sentinel;
        this._sentinel = sentinel;
    }

    dequeue() {
        const sentinel = this._sentinel;
        const entry = sentinel._prev;
        if (entry !== sentinel) {
            unlink(entry);
            return entry;
        }
    }

    enqueue(entry) {
        const sentinel = this._sentinel;

        // If entry is already in a list, unlink it first
        if (entry._prev && entry._next) {
            unlink(entry);
        }

        entry._next = sentinel._next;
        sentinel._next._prev = entry;

        sentinel._next = entry;
        entry._prev = sentinel;
    }

    toString() {
        const result = [];
        const sentinel = this._sentinel;
        let curr = sentinel._prev;

        while (curr !== sentinel) {
            result.push(JSON.stringify(curr, filterOutLinks));
            curr = curr._prev;
        }

        return "[" + result.join(", ") + "]";
    }
}

function unlink(entry) {
    entry._prev._next = entry._next;
    entry._next._prev = entry._prev;

    delete entry._next;
    delete entry._prev;
}

function filterOutLinks(key, value) {
    if (key !== "_next" && key !== "_prev") {
        return value;
    }
}

export default List;

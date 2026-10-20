import { createCsvContent } from '../lib';

export function metadataText(value) {
    if (value == null) return '';
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}
export function graphTableData(graph, names) {
    return {
        nodes: {
            head: [
                names.id,
                names.label,
                names.group,
                names.value,
                names.connections,
                names.metadata,
            ],
            body: graph.nodes.map((n) => [
                n.id,
                { name: n.label ?? n.id, color: n.color },
                n.group ?? '',
                n.value ?? '',
                n.degree,
                metadataText(n.metadata),
            ]),
        },
        links: {
            head: [
                names.source,
                names.target,
                names.label,
                names.value,
                names.directed,
                names.metadata,
            ],
            body: graph.links.map((l) => [
                l.raw.source,
                l.raw.target,
                l.raw.label ?? '',
                l.raw.value ?? '',
                !!l.raw.directed,
                metadataText(l.raw.metadata),
            ]),
        },
    };
}
export function graphCsvContent(data, title, names) {
    const rows = [
        [title.text],
        [title.subtitle?.text || ''],
        [],
        [names.nodes],
        data.nodes.head,
        ...data.nodes.body.map((row) =>
            row.map((cell) =>
                cell && typeof cell === 'object' ? cell.name : cell,
            ),
        ),
        [],
        [names.links],
        data.links.head,
        ...data.links.body,
    ];
    // Quote every cell before handing rows to the shared CSV serializer.
    return createCsvContent(
        rows.map((row) =>
            row.map(
                (value) => `"${String(value ?? '').replaceAll('"', '""')}"`,
            ),
        ),
    );
}

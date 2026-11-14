// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import original from '../worldGeo.source.js';
import world from '../src/resources/worldGeo.js';

const source = fileURLToPath(new URL('../worldGeo.source.js', import.meta.url));
const generator = fileURLToPath(
    new URL('../compress-world.mjs', import.meta.url),
);
const propertyKeys = ['name', 'admin', 'iso_a3', 'iso_a3_eh'];

function expectedWorld(precision, keepAll = false) {
    const scale = 10 ** precision;
    function coordinates(value) {
        return Array.isArray(value)
            ? value.map(coordinates)
            : (Math.round(value * scale) || 0) / scale;
    }
    return {
        type: original.type,
        features: original.features.map((feature) => ({
            type: feature.type,
            properties: keepAll
                ? feature.properties
                : Object.fromEntries(
                      propertyKeys
                          .filter((key) => feature.properties[key] != null)
                          .map((key) => [key, feature.properties[key]]),
                  ),
            geometry: {
                type: feature.geometry.type,
                coordinates: coordinates(feature.geometry.coordinates),
            },
        })),
    };
}

// Includes every territory, polygon, hole, point, and retained property.
test('shipped world preserves the complete existing three-decimal dataset', () => {
    expect(world).toEqual(expectedWorld(3));
});

test.each([
    [0, false],
    [3, false],
    [4, false],
    [8, false],
    [8, true],
])('generator round-trips precision %i, keep-all %s', (precision, keepAll) => {
    const directory = mkdtempSync(join(tmpdir(), 'vdui-world-encoding-'));
    try {
        const output = join(directory, 'world.mjs');
        execFileSync(process.execPath, [
            generator,
            source,
            output,
            `--precision=${precision}`,
            ...(keepAll ? ['--keep-all-properties'] : []),
        ]);
        const generated = readFileSync(output, 'utf8');
        const decoded = new Function(
            generated.replace('export default worldGeo;', 'return worldGeo;'),
        )();
        expect(decoded).toEqual(expectedWorld(precision, keepAll));
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});

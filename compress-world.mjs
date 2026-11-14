// scripts/compress-world.mjs
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { pathToFileURL } from 'node:url';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

const precisionArg = process.argv.find((arg) => arg.startsWith('--precision='));
const keepArg = process.argv.find((arg) => arg.startsWith('--keep='));
const keepAllProperties = process.argv.includes('--keep-all-properties');

const precision = precisionArg
    ? Number(precisionArg.replace('--precision=', ''))
    : 4;

const keptPropertyKeys = keepArg
    ? keepArg
          .replace('--keep=', '')
          .split(',')
          .map((key) => key.trim())
          .filter(Boolean)
    : ['name', 'admin', 'iso_a3', 'iso_a3_eh'];

if (!inputPath || !outputPath) {
    console.error(
        [
            'Usage:',
            'node scripts/pack-world-geo.mjs worldGeo.source.js src/resources/worldGeo.js --precision=4',
            '',
            'Options:',
            '--precision=4',
            '--keep=name,admin,iso_a3,iso_a3_eh',
            '--keep-all-properties',
        ].join('\n'),
    );
    process.exit(1);
}

if (!Number.isInteger(precision) || precision < 0 || precision > 8) {
    console.error('--precision must be an integer between 0 and 8');
    process.exit(1);
}

const absoluteInputPath = path.resolve(inputPath);
const absoluteOutputPath = path.resolve(outputPath);
const scale = 10 ** precision;

function gzipSize(value) {
    return zlib.gzipSync(value, { level: 9 }).length;
}

async function loadWorldGeo(filePath) {
    try {
        const moduleUrl = pathToFileURL(filePath).href;
        const sourceModule = await import(`${moduleUrl}?t=${Date.now()}`);

        if (sourceModule.default) {
            return sourceModule.default;
        }
    } catch {
        // Fallback below handles plain generated data files without requiring
        // package.json "type": "module".
    }

    const source = fs.readFileSync(filePath, 'utf8');
    const exportMatch = source.match(
        /export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/,
    );

    if (!exportMatch) {
        throw new Error(
            `Could not find a simple "export default <name>;" statement in ${filePath}`,
        );
    }

    const exportName = exportMatch[1];
    const executableSource = source.replace(
        exportMatch[0],
        `return ${exportName};`,
    );

    return new Function(executableSource)();
}

function isCoordinatePair(value) {
    return (
        Array.isArray(value) &&
        value.length >= 2 &&
        typeof value[0] === 'number' &&
        typeof value[1] === 'number'
    );
}

// Zigzag signed deltas, then encode five bits per printable character.
// Arithmetic avoids 32-bit overflow at the supported maximum precision (8).
function encodeDelta(value) {
    let remaining = value < 0 ? -value * 2 - 1 : value * 2;
    let encoded = '';
    while (remaining >= 32) {
        encoded += String.fromCharCode((remaining % 32) + 32 + 63);
        remaining = Math.floor(remaining / 32);
    }
    return encoded + String.fromCharCode(remaining + 63);
}

function encodeRing(ring) {
    if (!Array.isArray(ring)) {
        throw new Error('Invalid polygon ring.');
    }

    let previousX = 0;
    let previousY = 0;

    return ring
        .map((coordinate) => {
            if (!isCoordinatePair(coordinate)) {
                throw new Error('Invalid coordinate pair.');
            }

            const x = Math.round(coordinate[0] * scale);
            const y = Math.round(coordinate[1] * scale);

            const dx = x - previousX;
            const dy = y - previousY;

            previousX = x;
            previousY = y;

            return `${encodeDelta(dx)}${encodeDelta(dy)}`;
        })
        .join('');
}

function encodeGeometry(geometry) {
    if (!geometry || typeof geometry !== 'object') {
        throw new Error('Invalid geometry.');
    }

    if (geometry.type === 'Polygon') {
        return [0, geometry.coordinates.map(encodeRing)];
    }

    if (geometry.type === 'MultiPolygon') {
        return [
            1,
            geometry.coordinates.map((polygon) => polygon.map(encodeRing)),
        ];
    }

    throw new Error(`Unsupported geometry type: ${geometry.type}`);
}

function encodeProperties(properties) {
    const source = properties || {};

    if (keepAllProperties) {
        return source;
    }

    return keptPropertyKeys.map((key) => {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            return source[key];
        }

        return null;
    });
}

function encodeFeature(feature) {
    const properties = encodeProperties(feature.properties);
    const [geometryType, coordinates] = encodeGeometry(feature.geometry);

    return [properties, geometryType, coordinates];
}

function createGeneratedModule(packedFeatures) {
    const propertyOption = keepAllProperties
        ? '--keep-all-properties'
        : `--keep=${keptPropertyKeys.join(',')}`;
    const header =
        [
            '/*',
            ' * Generated geographic data for vue-ui-world; do not edit directly.',
            ` * Source: ${inputPath}`,
            ` * Regenerate: node compress-world.mjs ${JSON.stringify(inputPath)} ${JSON.stringify(outputPath)} --precision=${precision} ${propertyOption}`,
            ` * Coordinates: ${precision} decimal places (scale ${scale}).`,
            ' * Encoding: ring-local coordinate deltas, zigzag signed integers,',
            ' * then five-bit groups stored as printable characters (offset 63).',
            ' * Payload strings contain geographic data only.',
            ' * The decoder reconstructs GeoJSON without evaluating the payload.',
        ]
            .map((line) => line.replaceAll('*/', '* /').replaceAll('\n', ' '))
            .join('\n') + '\n */\n';
    const decodeRing =
        'function r(s){let i=0,x=0,y=0;const a=[];function n(){let v=0,k=0,b;do{b=s.charCodeAt(i++)-63;v+=(b&31)*2**k;k+=5}while(b&32);return v%2?-(v+1)/2:v/2}while(i<s.length){x+=n();y+=n();a.push([x/S,y/S])}return a}';
    if (keepAllProperties) {
        return `${header}const S=${scale};const T=["Polygon","MultiPolygon"];const D=${JSON.stringify(packedFeatures)};${decodeRing}function c(t,v){return t?v.map(p=>p.map(r)):v.map(r)}const worldGeo={type:"FeatureCollection",features:D.map(([p,t,v])=>({type:"Feature",properties:p,geometry:{type:T[t],coordinates:c(t,v)}}))};export default worldGeo;\n`;
    }

    return `${header}const S=${scale};const K=${JSON.stringify(keptPropertyKeys)};const T=["Polygon","MultiPolygon"];const D=${JSON.stringify(packedFeatures)};function p(a){const o={};for(let i=0;i<K.length;i+=1)if(a[i]!=null)o[K[i]]=a[i];return o}${decodeRing}function c(t,v){return t?v.map(g=>g.map(r)):v.map(r)}const worldGeo={type:"FeatureCollection",features:D.map(([a,t,v])=>({type:"Feature",properties:p(a),geometry:{type:T[t],coordinates:c(t,v)}}))};export default worldGeo;\n`;
}

const sourceText = fs.readFileSync(absoluteInputPath, 'utf8');
const sourceGeoJson = await loadWorldGeo(absoluteInputPath);

if (!sourceGeoJson || sourceGeoJson.type !== 'FeatureCollection') {
    throw new Error(
        'Expected a GeoJSON FeatureCollection as the default export.',
    );
}

if (!Array.isArray(sourceGeoJson.features)) {
    throw new Error('Expected sourceGeoJson.features to be an array.');
}

const packedFeatures = sourceGeoJson.features.map(encodeFeature);
const generated = createGeneratedModule(packedFeatures);

fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true });
fs.writeFileSync(absoluteOutputPath, generated);

const plainMinifiedModule = `const worldGeo=${JSON.stringify(sourceGeoJson)};export default worldGeo;\n`;

console.table([
    {
        file: 'original source',
        raw: Buffer.byteLength(sourceText),
        gzip: gzipSize(sourceText),
    },
    {
        file: 'plain minified module',
        raw: Buffer.byteLength(plainMinifiedModule),
        gzip: gzipSize(plainMinifiedModule),
    },
    {
        file: 'packed generated module',
        raw: Buffer.byteLength(generated),
        gzip: gzipSize(generated),
    },
]);

console.log(`Generated: ${outputPath}`);
console.log(`Features: ${sourceGeoJson.features.length}`);
console.log(`Precision: ${precision} decimals`);

if (keepAllProperties) {
    console.log('Properties: all preserved');
} else {
    console.log(`Properties kept: ${keptPropertyKeys.join(', ')}`);
}

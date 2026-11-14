import { convertColorToHex, interpolateColorHex } from './lib';

// ISO 3166-1 aliases. Geometry availability is checked separately.
const ALPHA2 = Object.fromEntries(
    `AF:AFG AL:ALB DZ:DZA AS:ASM AD:AND AO:AGO AI:AIA AQ:ATA AG:ATG AR:ARG AM:ARM AW:ABW AU:AUS AT:AUT AZ:AZE BS:BHS BH:BHR BD:BGD BB:BRB BY:BLR BE:BEL BZ:BLZ BJ:BEN BM:BMU BT:BTN BO:BOL BQ:BES BA:BIH BW:BWA BV:BVT BR:BRA IO:IOT BN:BRN BG:BGR BF:BFA BI:BDI CV:CPV KH:KHM CM:CMR CA:CAN KY:CYM CF:CAF TD:TCD CL:CHL CN:CHN CX:CXR CC:CCK CO:COL KM:COM CG:COG CD:COD CK:COK CR:CRI CI:CIV HR:HRV CU:CUB CW:CUW CY:CYP CZ:CZE DK:DNK DJ:DJI DM:DMA DO:DOM EC:ECU EG:EGY SV:SLV GQ:GNQ ER:ERI EE:EST SZ:SWZ ET:ETH FK:FLK FO:FRO FJ:FJI FI:FIN FR:FRA GF:GUF PF:PYF TF:ATF GA:GAB GM:GMB GE:GEO DE:DEU GH:GHA GI:GIB GR:GRC GL:GRL GD:GRD GP:GLP GU:GUM GT:GTM GG:GGY GN:GIN GW:GNB GY:GUY HT:HTI HM:HMD VA:VAT HN:HND HK:HKG HU:HUN IS:ISL IN:IND ID:IDN IR:IRN IQ:IRQ IE:IRL IM:IMN IL:ISR IT:ITA JM:JAM JP:JPN JE:JEY JO:JOR KZ:KAZ KE:KEN KI:KIR KP:PRK KR:KOR KW:KWT KG:KGZ LA:LAO LV:LVA LB:LBN LS:LSO LR:LBR LY:LBY LI:LIE LT:LTU LU:LUX MO:MAC MG:MDG MW:MWI MY:MYS MV:MDV ML:MLI MT:MLT MH:MHL MQ:MTQ MR:MRT MU:MUS YT:MYT MX:MEX FM:FSM MD:MDA MC:MCO MN:MNG ME:MNE MS:MSR MA:MAR MZ:MOZ MM:MMR NA:NAM NR:NRU NP:NPL NL:NLD NC:NCL NZ:NZL NI:NIC NE:NER NG:NGA NU:NIU NF:NFK MK:MKD MP:MNP NO:NOR OM:OMN PK:PAK PW:PLW PS:PSE PA:PAN PG:PNG PY:PRY PE:PER PH:PHL PN:PCN PL:POL PT:PRT PR:PRI QA:QAT RE:REU RO:ROU RU:RUS RW:RWA BL:BLM SH:SHN KN:KNA LC:LCA MF:MAF PM:SPM VC:VCT WS:WSM SM:SMR ST:STP SA:SAU SN:SEN RS:SRB SC:SYC SL:SLE SG:SGP SX:SXM SK:SVK SI:SVN SB:SLB SO:SOM ZA:ZAF GS:SGS SS:SSD ES:ESP LK:LKA SD:SDN SR:SUR SJ:SJM SE:SWE CH:CHE SY:SYR TW:TWN TJ:TJK TZ:TZA TH:THA TL:TLS TG:TGO TK:TKL TO:TON TT:TTO TN:TUN TR:TUR TM:TKM TC:TCA TV:TUV UG:UGA UA:UKR AE:ARE GB:GBR US:USA UM:UMI UY:URY UZ:UZB VU:VUT VE:VEN VN:VNM VG:VGB VI:VIR WF:WLF EH:ESH YE:YEM ZM:ZMB ZW:ZWE`
        .split(' ')
        .map((pair) => pair.split(':')),
);

export function countryCode(code, normalize = false) {
    const key = String(code ?? '')
        .trim()
        .toUpperCase();
    return normalize ? ALPHA2[key] || key : key;
}
export function featureCode(feature) {
    const code = feature.properties.iso_a3;
    return !code || code === '-99' ? feature.properties.iso_a3_eh : code;
}
export function valueStatus(value) {
    return value == null
        ? 'missing'
        : Number.isFinite(value)
          ? 'valid'
          : 'invalid';
}
export function normalizeWorldDataset(dataset, normalize = false) {
    const entries = Object.entries(dataset || {});
    // Explicit alpha-3 entries win over aliases regardless of input order.
    entries.sort(([a], [b]) => (a.length === 3) - (b.length === 3));
    return Object.fromEntries(
        entries.map(([code, item]) => [
            countryCode(code, normalize),
            item && typeof item === 'object' ? item : { value: NaN },
        ]),
    );
}

export function isValidWorldPoint(point) {
    const coordinates = point?.coordinates;
    return (
        Array.isArray(coordinates) &&
        coordinates.length === 2 &&
        coordinates.every(Number.isFinite) &&
        Math.abs(coordinates[0]) <= 180 &&
        Math.abs(coordinates[1]) <= 90
    );
}

// World paths consist of closed M/L rings. Bounds are prepared with projection,
// so viewport changes can cull countries without projecting their geometry again.
export function worldPathBounds(path) {
    return path
        .split('M')
        .slice(1)
        .flatMap((ring) => {
            const values =
                ring.match(/[-+]?(?:\d*\.)?\d+(?:e[-+]?\d+)?/gi)?.map(Number) ||
                [];
            if (values.length < 2) return [];
            let minX = Infinity,
                minY = Infinity,
                maxX = -Infinity,
                maxY = -Infinity;
            for (let i = 0; i + 1 < values.length; i += 2) {
                minX = Math.min(minX, values[i]);
                maxX = Math.max(maxX, values[i]);
                minY = Math.min(minY, values[i + 1]);
                maxY = Math.max(maxY, values[i + 1]);
            }
            return [{ minX, minY, maxX, maxY }];
        });
}

export function createWorldScale(values, config, colors) {
    const finite = values.filter(Number.isFinite).toSorted((a, b) => a - b);
    const type = config.type || 'linear';
    const sample = type === 'log' ? finite.filter((v) => v > 0) : finite;
    const requested = config.domain;
    const domain =
        Array.isArray(requested) &&
        requested.length === 2 &&
        requested.every(Number.isFinite) &&
        requested[0] <= requested[1] &&
        (type !== 'log' || requested[0] > 0)
            ? requested
            : [
                  sample[0] ?? (type === 'log' ? 1 : 0),
                  sample.at(-1) ?? (type === 'log' ? 10 : 1),
              ];
    const [min, max] = domain;
    const middle = Number.isFinite(config.center)
        ? Math.max(min, Math.min(max, config.center))
        : (min + max) / 2;
    const thresholds =
        type === 'quantile'
            ? Array.from(
                  {
                      length:
                          Math.max(
                              2,
                              Math.min(
                                  20,
                                  Math.floor(config.quantileSteps || 5),
                              ),
                          ) - 1,
                  },
                  (_, i) => {
                      const index =
                          ((sample.length - 1) * (i + 1)) /
                          Math.max(
                              2,
                              Math.min(
                                  20,
                                  Math.floor(config.quantileSteps || 5),
                              ),
                          );
                      const low = Math.max(0, Math.floor(index));
                      return sample.length
                          ? sample[low] +
                                (sample[Math.ceil(index)] - sample[low]) *
                                    (index - low)
                          : 0;
                  },
              )
            : (config.thresholds || [])
                  .filter(Number.isFinite)
                  .toSorted((a, b) => a - b);
    const discrete = type === 'quantile' || type === 'threshold';
    const ramp = (t) =>
        interpolateColorHex(
            convertColorToHex(colors.min),
            convertColorToHex(colors.max),
            0,
            1,
            Math.max(0, Math.min(1, t)),
        );
    const bandColors = Array.from({ length: thresholds.length + 1 }, (_, i) =>
        config.colors?.[i]
            ? convertColorToHex(config.colors[i])
            : ramp(thresholds.length ? i / thresholds.length : 0.5),
    );
    function color(value) {
        if (!Number.isFinite(value) || (type === 'log' && value <= 0))
            return null;
        if (discrete)
            return bandColors[thresholds.filter((t) => value >= t).length];
        if (min === max) return ramp(0.5);
        const v = Math.max(min, Math.min(max, value));
        if (type === 'diverging') {
            const midColor = convertColorToHex(config.middleColor || '#FFFFFF');
            return v <= middle
                ? interpolateColorHex(
                      convertColorToHex(colors.min),
                      midColor,
                      0,
                      1,
                      middle === min ? 1 : (v - min) / (middle - min),
                  )
                : interpolateColorHex(
                      midColor,
                      convertColorToHex(colors.max),
                      0,
                      1,
                      middle === max ? 0 : (v - middle) / (max - middle),
                  );
        }
        return ramp(
            type === 'log'
                ? (Math.log(v) - Math.log(min)) /
                      (Math.log(max) - Math.log(min))
                : (v - min) / (max - min),
        );
    }
    const positions = Array.from({ length: 11 }, (_, i) => i / 10);
    if (type === 'diverging' && min < max)
        positions.push((middle - min) / (max - min));
    const stops = [...new Set(positions)]
        .sort((a, b) => a - b)
        .map((t) => {
            const value =
                type === 'log' && min > 0
                    ? Math.exp(
                          Math.log(min) + t * (Math.log(max) - Math.log(min)),
                      )
                    : min + t * (max - min);
            return { offset: t * 100, value, color: color(value) || ramp(t) };
        });
    return {
        type,
        domain,
        middle,
        thresholds,
        discrete,
        color,
        stops,
        bands: bandColors.map((color, i) => ({
            color,
            min: i === 0 ? null : thresholds[i - 1],
            max: thresholds[i] ?? null,
        })),
    };
}

// Named regional views include offshore territories through their country geometry.
export const WORLD_REGIONS = {
    africa: 'DZA AGO BEN BWA BFA BDI CMR CPV CAF TCD COM COD COG DJI EGY GNQ ERI SWZ ETH GAB GMB GHA GIN GNB CIV KEN LSO LBR LBY MDG MWI MLI MRT MUS MAR MOZ NAM NER NGA RWA STP SEN SYC SLE SOM ZAF SSD SDN TZA TGO TUN UGA ZMB ZWE ESH',
    europe: 'ALB AND AUT BLR BEL BIH BGR HRV CYP CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ITA LVA LIE LTU LUX MLT MDA MCO MNE NLD MKD NOR POL PRT ROU SMR SRB SVK SVN ESP SWE CHE UKR GBR VAT XKX',
    asia: 'AFG ARM AZE BHR BGD BTN BRN KHM CHN GEO IND IDN IRN IRQ ISR JPN JOR KAZ KWT KGZ LAO LBN MYS MDV MNG MMR NPL PRK OMN PAK PSE PHL QAT RUS SAU SGP KOR LKA SYR TWN TJK THA TLS TUR TKM ARE UZB VNM YEM',
    northAmerica:
        'ATG BHS BRB BLZ CAN CRI CUB DMA DOM SLV GRD GTM HTI HND JAM MEX NIC PAN KNA LCA VCT TTO USA GRL PRI',
    southAmerica: 'ARG BOL BRA CHL COL ECU GUY PRY PER SUR URY VEN FLK',
    oceania: 'AUS FJI KIR MHL FSM NRU NZL PLW PNG WSM SLB TON TUV VUT NCL',
};
export function geometryRings(geometry) {
    return geometry?.type === 'Polygon'
        ? geometry.coordinates
        : geometry?.type === 'MultiPolygon'
          ? geometry.coordinates.flat()
          : [];
}
export function geometryCenter(features) {
    // Use the largest mainland ring to avoid overseas territories dominating focus.
    const centers = features.map((f) => {
        const ring = geometryRings(f.geometry).reduce(
            (best, r) => (r.length > best.length ? r : best),
            [],
        );
        if (!ring.length) return [0, 0];
        const radians = ring.map(([lon]) => (lon * Math.PI) / 180);
        return [
            Math.atan2(
                radians.reduce((s, r) => s + Math.sin(r), 0),
                radians.reduce((s, r) => s + Math.cos(r), 0),
            ),
            ring.reduce((s, p) => s + p[1], 0) / ring.length,
        ];
    });
    if (!centers.length) return [0, 0];
    return [
        (Math.atan2(
            centers.reduce((s, p) => s + Math.sin(p[0]), 0),
            centers.reduce((s, p) => s + Math.cos(p[0]), 0),
        ) *
            180) /
            Math.PI,
        centers.reduce((s, p) => s + p[1], 0) / centers.length,
    ];
}

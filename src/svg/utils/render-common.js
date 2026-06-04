import { convertColorToHex, escapeXml } from '../../lib.js';
import { version } from '../../../package.json';

import {
    element,
    emptyElement,
    getConfigValue,
    safeNumber,
    textElement,
} from '../utils';

export function getStyleChartConfig(config) {
    return getConfigValue(
        config,
        'style.chart',
        getConfigValue(config, 'chart', {}),
    );
}

export function getStyleChartValue(config, path, fallback) {
    const styleValue = getConfigValue(config, `style.chart.${path}`, undefined);
    if (styleValue !== undefined) return styleValue;
    return getConfigValue(config, `chart.${path}`, fallback);
}

export function getRootValue(config, path, fallback) {
    const rootValue = getConfigValue(config, path, undefined);
    if (rootValue !== undefined) return rootValue;
    return getStyleChartValue(config, path, fallback);
}

export function normalizeColor(color, fallback = '#000000') {
    return convertColorToHex(color) || color || fallback;
}

export function getChartBackgroundColor(config, fallback = '#FFFFFF') {
    return normalizeColor(
        getStyleChartValue(config, 'backgroundColor', fallback),
        fallback,
    );
}

export function getChartTextColor(config, fallback = '#2D353C') {
    return normalizeColor(
        getStyleChartValue(config, 'color', fallback),
        fallback,
    );
}

export function renderBackground(state, color) {
    return emptyElement('rect', {
        width: state.width,
        height: state.height,
        fill: color ?? getChartBackgroundColor(state.config),
    });
}

export function getTitleBlockHeight(config, getConfig = getStyleChartValue) {
    const title = getConfig(config, 'title', {});
    const subtitle = getConfigValue(title, 'subtitle', {});

    if (!title.show) return 0;

    const titleFontSize = safeNumber(title.fontSize, 20);
    const subtitleFontSize = subtitle.text
        ? safeNumber(subtitle.fontSize, 14)
        : 0;

    return (
        safeNumber(title.paddingTop, 12) +
        titleFontSize +
        (subtitle.text ? subtitleFontSize + 4 : 0) +
        safeNumber(title.paddingBottom, 6)
    );
}

export function createAlignedTSpansFromLineBreaks({
    content,
    x,
    fontSize,
    fill,
    textAnchor,
}) {
    return String(content)
        .split(/\n/g)
        .map((line, lineIndex) =>
            element(
                'tspan',
                {
                    x,
                    dy: lineIndex === 0 ? 0 : fontSize * 1.2,
                    fill,
                    'text-anchor': textAnchor,
                },
                escapeXml(line),
            ),
        )
        .join('');
}

export function estimateLegendTextWidth(text, fontSize) {
    return String(text)
        .split('')
        .reduce((sum, character) => {
            if (character === ' ') return sum + fontSize * 0.28;
            if ('ilI.,:;|!'.includes(character)) return sum + fontSize * 0.24;
            if ('()[]{}'.includes(character)) return sum + fontSize * 0.34;
            if ('0123456789%/'.includes(character)) return sum + fontSize * 0.5;
            if (
                character === character.toUpperCase() &&
                /[A-Z]/.test(character)
            ) {
                return sum + fontSize * 0.62;
            }
            return sum + fontSize * 0.52;
        }, 0);
}

export function renderDescription(state) {
    if (!state.svgTitle) return '';

    return element(
        'desc',
        { 'aria-hidden': 'true' },
        escapeXml(state.svgTitle),
    );
}

export function renderVueDataUiVersion() {
    return `<desc aria-hidden="true">Composed with Vue Data UI ${version}</desc>`;
}

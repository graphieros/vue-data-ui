import Subject from '../../src/components/vue-ui-world.vue';
import { expect, waitFor } from 'storybook/test';
import { catalogArgs } from '../support/catalog.js';
import { components } from '../fixtures/components.js';
const base = {
    dataset: components.find((c) => c.name === 'VueUiWorld').dataset,
    config: components.find((c) => c.name === 'VueUiWorld').config || {},
};
export default {
    title: 'Maps/VueUiWorld',
    component: Subject,
    tags: ['autodocs'],
    args: catalogArgs(base),
    argTypes: { dataset: { control: 'object' }, config: { control: 'object' } },
    render: (args) => ({
        components: { Subject },
        setup: () => ({ args }),
        template:
            '<div data-catalog style="width:100%;min-height:120px"><Subject v-bind="args" /></div>',
    }),
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector('[data-catalog]').childElementCount,
            ).toBeGreaterThan(0),
        );
    },
};
export const Default = {};
export const Customized = {
    args: { config: { ...base.config, theme: 'celebration' } },
};
export const Dark = {
    globals: { backgrounds: { value: 'dark' } },
    args: { config: { ...base.config, theme: 'hack' } },
};
export const Responsive = {
    args: { config: { ...base.config, responsive: true } },
    render: (args) => ({
        components: { Subject },
        setup: () => ({ args }),
        template:
            '<div data-catalog style="width:100%;max-width:440px;resize:horizontal;overflow:auto;min-height:200px"><Subject v-bind="args" /></div>',
    }),
};

const explorationDataset = {
    FRA: { value: 30 },
    DEU: { value: 80 },
    ESP: { value: 0 },
    ITA: { value: 50 },
    GBR: { value: 100 },
    POL: { value: null },
    SWE: { value: -20 },
};
export const Exploration = {
    args: {
        dataset: explorationDataset,
        config: {
            projection: 'equirectangular',

            selection: { enabled: true, multiple: true },
            style: {
                chart: {
                    zoom: {
                        show: true,
                        region: 'europe',
                    },
                    colorScale: {
                        type: 'diverging',
                        domain: [-100, 100],
                        center: 0,
                        legend: { show: true, title: 'Change' },
                    },
                    territory: {
                        colors: { min: '#2563eb', max: '#dc2626' },
                        invalidColor: '#a855f7',
                    },
                },
            },
        },
        points: [
            {
                id: 'paris',
                name: 'Paris',
                coordinates: [2.35, 48.86],
                value: 100,
            },
            {
                id: 'berlin',
                name: 'Berlin',
                coordinates: [13.4, 52.52],
                value: 25,
            },
        ],
    },
    play: async ({ canvasElement }) => {
        const { userEvent, within } = await import('storybook/test');
        const canvas = within(canvasElement);
        const svg = canvasElement.querySelector('[data-cy="world-svg"]');
        await waitFor(() =>
            expect(svg.querySelector('[data-country="FRA"]')).toBeTruthy(),
        );
        const initial = svg.getAttribute('viewBox');
        const bounds = svg.getBoundingClientRect();
        svg.dispatchEvent(
            new WheelEvent('wheel', {
                deltaY: -100,
                clientX: bounds.left + bounds.width / 2,
                clientY: bounds.top + bounds.height / 2,
                bubbles: true,
                cancelable: true,
            }),
        );
        await waitFor(() =>
            expect(svg.getAttribute('viewBox')).not.toBe(initial),
        );
        const france = svg.querySelector('[data-country="FRA"]');
        france.focus();
        await userEvent.keyboard('{Enter}');
        await waitFor(() =>
            expect(france.getAttribute('aria-pressed')).toBe('true'),
        );
        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
            expect(france.getAttribute('aria-pressed')).toBe('false'),
        );
        await userEvent.click(
            canvas.getByRole('button', { name: 'Reset zoom' }),
        );
        await waitFor(() =>
            expect(svg.getAttribute('viewBox')).not.toBe(initial),
        );
        expect(
            canvasElement.querySelectorAll('.vue-ui-world-points circle'),
        ).toHaveLength(2);
    },
};
export const QuantileScale = {
    args: {
        dataset: explorationDataset,
        config: {
            projection: 'robinson',
            style: {
                chart: {
                    colorScale: {
                        type: 'quantile',
                        quantileSteps: 4,
                        legend: { show: true, title: 'Quartiles' },
                    },
                },
            },
        },
    },
};
export const ThresholdScale = {
    args: {
        dataset: explorationDataset,
        config: {
            projection: 'robinson',
            style: {
                chart: {
                    colorScale: {
                        type: 'threshold',
                        thresholds: [0, 40, 80],
                        colors: ['#2563eb', '#e0f2fe', '#fb923c', '#dc2626'],
                        legend: { show: true, title: 'Defined ranges' },
                    },
                },
            },
        },
    },
};
export const LogarithmicScale = {
    args: {
        dataset: {
            FRA: { value: 1 },
            DEU: { value: 10 },
            CHN: { value: 100 },
            USA: { value: 1000 },
        },
        config: {
            projection: 'robinson',
            style: {
                chart: {
                    colorScale: {
                        type: 'log',
                        domain: [1, 1000],
                        legend: { show: true, title: 'Logarithmic scale' },
                    },
                },
            },
        },
    },
};
export const GlobeNavigation = {
    args: {
        ...Exploration.args,
        config: {
            ...Exploration.args.config,
            style: {
                ...Exploration.args.config.style,
                chart: {
                    ...Exploration.args.config.style.chart,
                    zoom: {
                        show: true,
                        region: 'europe',
                    },
                },
            },
            projection: 'globe',
        },
    },
};
export const MissingAndInvalid = {
    args: {
        dataset: {
            FRA: { value: 0 },
            DEU: { value: null },
            ESP: { value: NaN },
        },
        config: {
            projection: 'equirectangular',
            normalizeCountryCodes: true,
            countryNames: { FRA: 'France (localized)' },
            style: {
                chart: {
                    territory: { invalidColor: '#a855f7' },
                    colorScale: { legend: { show: true } },
                },
            },
        },
    },
};

export const PointTooltips = {
    args: {
        dataset: { FRA: { value: 10 } },
        points: [
            {
                id: 'paris',
                name: 'Paris point',
                coordinates: [2.35, 48.86],
                value: 123,
            },
        ],
        config: {
            projection: 'equirectangular',
            style: {
                chart: {
                    tooltip: { smooth: false },
                    dataLabels: { prefix: '$', suffix: ' USD' },
                },
            },
        },
    },
    play: async ({ canvasElement }) => {
        const { userEvent } = await import('storybook/test');
        const point = canvasElement.querySelector('[data-world-point="0"]');
        await userEvent.hover(point);
        await waitFor(() => {
            const tooltip = document.querySelector('[role="tooltip"]');
            expect(tooltip?.textContent).toContain('Paris point');
            expect(tooltip?.textContent).toContain('$123 USD');
        });
        await userEvent.unhover(point);
        await waitFor(() =>
            expect(document.querySelector('[role="tooltip"]')).toBeNull(),
        );
        point.focus();
        await waitFor(() =>
            expect(
                document.querySelector('[role="tooltip"]')?.textContent,
            ).toContain('Paris point'),
        );
        await userEvent.keyboard('{Escape}');
        await waitFor(() =>
            expect(document.querySelector('[role="tooltip"]')).toBeNull(),
        );
    },
};

export const GradientBand = {
    args: {
        dataset: { FRA: { value: 0 }, DEU: { value: 100 } },
        config: {
            projection: 'equirectangular',
            style: {
                chart: {
                    colorScale: {
                        domain: [0, 100],
                        legend: {
                            show: true,
                            gradient: { height: 24, borderRadius: 8 },
                        },
                    },
                },
            },
        },
    },
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const band = canvasElement.querySelector('.vue-ui-world-gradient');
            expect(band).toBeTruthy();
            expect(band.getBoundingClientRect().height).toBe(24);
            expect(getComputedStyle(band).borderRadius).toBe('8px');
        });
    },
};

export const SelectedCountryPaths = {
    args: {
        dataset: { FRA: { value: 10 }, DEU: { value: 20 } },
        selectedCountries: ['FRA', 'DEU'],
        config: {
            projection: 'equirectangular',
            selection: { enabled: true, multiple: true, color: '#222222' },
            style: { chart: { territory: { strokeWidthSelected: 3 } } },
        },
    },
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const layer = canvasElement.querySelector(
                '.vue-ui-world-selection',
            );
            expect(layer.querySelectorAll('path')).toHaveLength(2);
            expect(layer.parentElement.lastElementChild).toBe(layer);
            for (const selected of layer.querySelectorAll('path')) {
                const country = canvasElement.querySelector(
                    `[data-country="${selected.getAttribute('data-selected-country')}"]`,
                );
                expect(selected.getAttribute('d')).toBe(
                    country.getAttribute('d'),
                );
                expect(getComputedStyle(selected).pointerEvents).toBe('none');
                expect(getComputedStyle(selected).vectorEffect).toBe(
                    'non-scaling-stroke',
                );
                expect(selected.getAttribute('stroke')).toBe('#222222ff');
            }
        });
    },
};

export const ThemedSelection = {
    args: {
        dataset: { FRA: { value: 10 }, DEU: { value: -10 } },
        points: [
            { name: 'Theme fill', coordinates: [0, 0], value: 100 },
            {
                name: 'Point override',
                coordinates: [15, 0],
                value: 25,
                color: '#ff00ff',
            },
        ],
        selectedCountries: ['FRA'],
        config: {
            theme: 'hack',
            projection: 'equirectangular',
            selection: { enabled: true },
            style: {
                chart: {
                    colorScale: {
                        type: 'diverging',
                        domain: [-100, 100],
                        legend: { show: true },
                    },
                },
            },
        },
    },
    play: async ({ canvasElement, args }) => {
        const hack = args.config.theme === 'hack';
        await waitFor(() => {
            expect(
                canvasElement
                    .querySelector('[data-selected-country="FRA"]')
                    ?.getAttribute('stroke'),
            ).toBe(hack ? '#99FF99ff' : '#E6E6E6ff');
            expect(
                canvasElement
                    .querySelector('[data-world-point="0"]')
                    ?.getAttribute('fill'),
            ).toBe(hack ? '#66CC66ff' : '#CCCCCCff');
            expect(
                canvasElement
                    .querySelector('[data-world-point="1"]')
                    ?.getAttribute('fill'),
            ).toBe('#ff00ff');
            expect(
                getComputedStyle(canvasElement.querySelector('.vue-ui-world'))
                    .backgroundColor,
            ).toBe('rgb(26, 26, 26)');
        });
    },
};
export const DarkSelection = {
    ...ThemedSelection,
    args: {
        ...ThemedSelection.args,
        config: { ...ThemedSelection.args.config, theme: 'dark' },
    },
};

export const ZoomLock = {
    args: {
        dataset: { FRA: { value: 100 } },
        config: {
            projection: 'equirectangular',
            style: { chart: { zoom: { show: true } } },
        },
    },
    render: (args) => ({
        components: { Subject },
        setup: () => ({ args }),
        template:
            '<div data-catalog><Subject v-bind="args"><template #optionZoom="{isZoomLocked}"><span data-world-zoom-lock>{{isZoomLocked ? "locked" : "unlocked"}}</span></template></Subject></div>',
    }),
    play: async ({ canvasElement }) => {
        const { userEvent } = await import('storybook/test');
        const svg = canvasElement.querySelector('[data-cy="world-svg"]');
        const wheel = () => {
            const bounds = svg.getBoundingClientRect();
            const event = new WheelEvent('wheel', {
                deltaY: -100,
                clientX: bounds.left + bounds.width / 2,
                clientY: bounds.top + bounds.height / 2,
                bubbles: true,
                cancelable: true,
            });
            svg.dispatchEvent(event);
            return event;
        };
        const initial = svg.getAttribute('viewBox');
        wheel();
        await waitFor(() =>
            expect(svg.getAttribute('viewBox')).not.toBe(initial),
        );
        await userEvent.click(
            canvasElement.querySelector('[data-cy="user-options-summary"]'),
        );
        const state = canvasElement.querySelector('[data-world-zoom-lock]');
        expect(state.textContent).toBe('unlocked');
        await userEvent.click(state.closest('button'));
        await waitFor(() => expect(state.textContent).toBe('locked'));
        const locked = svg.getAttribute('viewBox');
        expect(wheel().defaultPrevented).toBe(false);
        expect(svg.getAttribute('viewBox')).toBe(locked);
        await userEvent.click(state.closest('button'));
        await waitFor(() => expect(state.textContent).toBe('unlocked'));
        wheel();
        await waitFor(() =>
            expect(svg.getAttribute('viewBox')).not.toBe(locked),
        );
    },
};

export const GlobeAtmosphere = {
    args: {
        dataset: explorationDataset,
        config: {
            theme: 'dark',
            projection: 'globe',
            style: { chart: { zoom: { show: true } } },
        },
    },
    play: async ({ canvasElement }) => {
        const { userEvent } = await import('storybook/test');
        const svg = canvasElement.querySelector('[data-cy="world-svg"]');
        expect(getComputedStyle(svg).overflow).toBe('visible');
        svg.focus();
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() =>
            expect(getComputedStyle(svg).overflow).toBe('visible'),
        );
        await userEvent.keyboard('+');
        await waitFor(() =>
            expect(getComputedStyle(svg).overflow).toBe('hidden'),
        );
        await userEvent.keyboard('{Home}');
        await waitFor(() =>
            expect(getComputedStyle(svg).overflow).toBe('visible'),
        );
    },
};

export const GlobeRotationWithoutZoom = {
    args: {
        dataset: { FRA: { value: 10 } },
        config: {
            projection: 'globe',
            style: { chart: { zoom: { show: false } } },
        },
    },
    play: async ({ canvasElement }) => {
        const { userEvent } = await import('storybook/test');
        const svg = canvasElement.querySelector('[data-cy="world-svg"]');
        const country = svg.querySelector('[data-country="FRA"]');
        const initialPath = country.getAttribute('d');
        const initialView = svg.getAttribute('viewBox');
        svg.focus();
        await userEvent.keyboard('{ArrowRight}');
        await waitFor(() =>
            expect(country.getAttribute('d')).not.toBe(initialPath),
        );
        expect(svg.getAttribute('viewBox')).toBe(initialView);
        const event = new WheelEvent('wheel', {
            deltaY: -100,
            bubbles: true,
            cancelable: true,
        });
        svg.dispatchEvent(event);
        expect(event.defaultPrevented).toBe(false);
        expect(svg.getAttribute('viewBox')).toBe(initialView);
        expect(getComputedStyle(svg).touchAction).toBe('pan-y');
    },
};

export const PointsOnly = {
    args: {
        dataset: {},
        points: [
            { id: 'origin', name: 'Origin', coordinates: [0, 0], value: 10 },
        ],
        config: { projection: 'equirectangular' },
    },
    play: async ({ canvasElement }) => {
        const { userEvent } = await import('storybook/test');
        await waitFor(() =>
            expect(
                canvasElement.querySelector('[data-world-point="0"]'),
            ).toBeTruthy(),
        );
        expect(
            canvasElement.querySelector('[data-country="FRA"]'),
        ).toBeTruthy();
        await userEvent.hover(
            canvasElement.querySelector('[data-world-point="0"]'),
        );
        await waitFor(() =>
            expect(
                document.querySelector('[role="tooltip"]')?.textContent,
            ).toContain('Origin'),
        );
    },
};

export const FixedColorDomain = {
    args: {
        dataset: { FRA: { value: 10 }, DEU: { value: 20 } },
        config: {
            projection: 'equirectangular',
            style: {
                chart: {
                    colorScale: { domain: [0, 100], legend: { show: true } },
                },
            },
        },
    },
    play: async ({ canvasElement }) => {
        await waitFor(() => {
            const labels = canvasElement.querySelector(
                '.vue-ui-world-scale-labels',
            );
            expect(labels?.firstElementChild.textContent).toBe('0');
            expect(labels?.lastElementChild.textContent).toBe('100');
        });
    },
};

export const RegionalKeyboardNavigation = {
    args: {
        dataset: explorationDataset,
        config: {
            projection: 'equirectangular',
            userOptions: { show: false },
            style: { chart: { zoom: { show: true, region: 'europe' } } },
        },
    },
    play: async ({ canvasElement }) => {
        const { userEvent } = await import('storybook/test');
        const svg = canvasElement.querySelector('[data-cy="world-svg"]');
        expect(
            svg
                .querySelector('[data-country="CRI"]')
                .getAttribute('aria-hidden'),
        ).toBe('true');
        svg.focus();
        await userEvent.tab();
        expect(document.activeElement.hasAttribute('data-country')).toBe(true);
        expect(document.activeElement.getAttribute('aria-hidden')).not.toBe(
            'true',
        );
        expect(document.activeElement.getAttribute('data-country')).not.toBe(
            'CRI',
        );
        await userEvent.keyboard('{ArrowRight}');
        expect(document.activeElement.getAttribute('aria-hidden')).not.toBe(
            'true',
        );
    },
};

export const MinimumZoomReset = {
    args: {
        dataset: explorationDataset,
        config: {
            projection: 'globe',
            style: { chart: { zoom: { show: true, minZoom: 2, maxZoom: 20 } } },
        },
    },
    play: async ({ canvasElement }) => {
        const { userEvent } = await import('storybook/test');
        const svg = canvasElement.querySelector('[data-cy="world-svg"]');
        expect(canvasElement.querySelector('[data-cy-reset]')).toBeNull();
        expect(getComputedStyle(svg).overflow).toBe('hidden');
        svg.focus();
        await userEvent.keyboard('+');
        await waitFor(() =>
            expect(canvasElement.querySelector('[data-cy-reset]')).toBeTruthy(),
        );
        await userEvent.click(canvasElement.querySelector('[data-cy-reset]'));
        await waitFor(() =>
            expect(canvasElement.querySelector('[data-cy-reset]')).toBeNull(),
        );
        expect(getComputedStyle(svg).overflow).toBe('hidden');
    },
};

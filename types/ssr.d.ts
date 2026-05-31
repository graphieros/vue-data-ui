import type { VueUiXyDatasetItem, VueUiXyConfig } from 'vue-data-ui';

export type { VueUiXyDatasetItem, VueUiXyConfig };

export type VueUiXyAdditionalSvgContentContext = {
    width: number;
    height: number;
    drawingArea: {
        top: number;
        right: number;
        bottom: number;
        left: number;
        width: number;
        height: number;
        scaleLabelX?: number;
        rightScaleLabelX?: number;
        scaleLabelsOffset?: number;
        yAxisLabelWidth?: number;
        individualOffsetX?: number;
    };
    scale: {
        min: number;
        max: number;
        tickSize: number;
        ticks: number[];
    };
    config: VueUiXyConfig;
    series: Array<
        VueUiXyDatasetItem & {
            color: string;
            type: 'line' | 'bar' | 'plot';
            plots: Array<{
                x: number;
                y: number | null;
                value: number | null;
                index: number;
                label: string;
                __barLabelX?: number;
            }>;
        }
    >;
};

export type VueUiXyAdditionalSvgContent =
    | string
    | ((
          context: VueUiXyAdditionalSvgContentContext,
      ) => string | null | undefined);

export type RenderStaticVueUiXyState = {
    dataset: VueUiXyDatasetItem[];
    config?: VueUiXyConfig;
    width?: number;
    height?: number;
    svgTitle?: string;
    additionalSvgContent?: VueUiXyAdditionalSvgContent;
};

/**
 * Generates a static SVG representation of a VueUiXy chart.
 *
 * This function is designed for server-side rendering and returns a complete
 * SVG string that can be embedded directly into HTML, saved to a file, or
 * converted to other formats such as PNG or PDF.
 *
 * The input state accepts the same dataset and configuration options as the
 * VueUiXy component, along with optional rendering dimensions and custom SVG
 * injections via `additionalSvgContent`.
 *
 * @example
 * ```ts
 * import { createStaticVueUiXy } from 'vue-data-ui';
 *
 * const svg = await createStaticVueUiXy({
 *   dataset: [
 *     {
 *       name: 'Sales',
 *       type: 'line',
 *       series: [12, 18, 25, 21, 30]
 *     }
 *   ],
 *   config: {
 *     chart: {
 *       title: {
 *         text: 'Monthly Sales'
 *       }
 *     }
 *   },
 * });
 *
 * console.log(svg);
 * ```
 *
 * @example
 * ```ts
 * const svg = await createStaticVueUiXy({
 *   dataset,
 *   config,
 *   additionalSvgContent: ({ series }) => {
 *     return series.map((serie) => {
 *       const lastPlot = serie.plots.at(-1);
 *
 *       if (!lastPlot || lastPlot.value === null) {
 *         return '';
 *       }
 *
 *       return `
 *         <text
 *           x="${lastPlot.x + 8}"
 *           y="${lastPlot.y}"
 *           fill="${serie.color}"
 *           font-size="14"
 *         >
 *           ${lastPlot.value}
 *         </text>
 *       `;
 *     }).join('');
 *   }
 * });
 * ```
 *
 * @param state - Chart rendering state containing the dataset, configuration,
 * dimensions, and optional rendering metadata.
 * @returns A promise resolving to the generated SVG markup.
 */
export function createStaticVueUiXy(
    state: RenderStaticVueUiXyState,
): Promise<string>;
